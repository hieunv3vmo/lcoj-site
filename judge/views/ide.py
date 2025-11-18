import json
import logging

from django import forms
from django.conf import settings
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.exceptions import PermissionDenied
from django.db.models import Max
from django.http import HttpResponse, JsonResponse
from django.urls import reverse
from django.utils.translation import gettext as _
from django.views.generic import FormView, View

from judge.models import IDESession, Judge, Language, Problem, Submission, SubmissionSource
from judge.utils.views import TitleMixin
from judge.widgets import AceWidget

__all__ = ['OnlineIDEView', 'IDEExecuteView', 'IDESaveSessionView', 'IDELoadSessionView', 'IDESubmissionStatusView']

logger = logging.getLogger(__name__)


class IDEForm(forms.Form):
    """
    Form for the online IDE.
    """
    language = forms.ModelChoiceField(
        queryset=Language.objects.filter(judges__online=True).distinct(),
        label=_('Language'),
        empty_label=None,
        widget=forms.Select(attrs={'id': 'id_language'}),
    )

    source = forms.CharField(
        max_length=65536,
        required=False,
        widget=AceWidget(theme='twilight', no_ace_media=True),
        label=_('Source Code'),
    )

    stdin_data = forms.CharField(
        required=False,
        widget=forms.Textarea(attrs={
            'rows': 10,
            'placeholder': _('Enter input data here (optional)'),
            'class': 'ide-input-area',
        }),
        label=_('Standard Input'),
    )

    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None)
        super(IDEForm, self).__init__(*args, **kwargs)

        # Set default language if user is logged in
        if user and hasattr(user, 'profile'):
            self.fields['language'].initial = user.profile.language

    def clean_source(self):
        source = self.cleaned_data.get('source', '')
        if len(source) > 65536:
            raise forms.ValidationError(_('Your source code must contain at most 65536 characters.'))
        return source


class OnlineIDEView(TitleMixin, FormView):
    """
    Main view for the online IDE page.
    Allows users to write and execute code in various programming languages.
    """
    template_name = 'ide/ide.html'
    form_class = IDEForm
    title = _('Online IDE')

    def get_form_kwargs(self):
        kwargs = super(OnlineIDEView, self).get_form_kwargs()
        kwargs['user'] = self.request.user if self.request.user.is_authenticated else None
        return kwargs

    def get_context_data(self, **kwargs):
        context = super(OnlineIDEView, self).get_context_data(**kwargs)
        context['ACE_URL'] = settings.ACE_URL
        context['page_type'] = 'ide'

        # Add user's IDE sessions if logged in
        if self.request.user.is_authenticated:
            context['user_sessions'] = IDESession.objects.filter(
                user=self.request.user.profile
            ).order_by('-last_modified')[:10]  # Last 10 sessions
        else:
            context['user_sessions'] = []

        # Check if user needs to be logged in
        context['require_login'] = getattr(settings, 'IDE_REQUIRE_LOGIN', False)

        return context

    def get(self, request, *args, **kwargs):
        # Check if IDE requires login
        require_login = getattr(settings, 'IDE_REQUIRE_LOGIN', False)
        if require_login and not request.user.is_authenticated:
            from django.contrib import messages
            messages.warning(request, _('You need to log in to use the online IDE.'))
            from django.shortcuts import redirect
            return redirect('auth_login')

        return super(OnlineIDEView, self).get(request, *args, **kwargs)


class IDEExecuteView(View):
    """
    API endpoint to execute code from the IDE.
    Creates a temporary submission and returns the result.
    """

    def post(self, request):
        # Check if IDE requires login
        require_login = getattr(settings, 'IDE_REQUIRE_LOGIN', False)
        if require_login and not request.user.is_authenticated:
            return JsonResponse({
                'error': _('You need to log in to execute code.')
            }, status=403)

        try:
            data = json.loads(request.body)
            language_id = data.get('language')
            source_code = data.get('source', '')
            stdin_data = data.get('stdin', '')

            # Validate input
            if not language_id:
                return JsonResponse({'error': _('Language is required.')}, status=400)

            if not source_code or source_code.strip() == '':
                return JsonResponse({'error': _('Source code is required.')}, status=400)

            if len(source_code) > 65536:
                return JsonResponse({
                    'error': _('Source code must contain at most 65536 characters.')
                }, status=400)

            # Get language
            try:
                language = Language.objects.get(id=language_id)
            except Language.DoesNotExist:
                return JsonResponse({'error': _('Invalid language selected.')}, status=400)

            # Check if there are online judges that support this language
            online_judges = Judge.objects.filter(online=True, runtimes=language).count()
            if online_judges == 0:
                return JsonResponse({
                    'error': _('No online judge available for this language.')
                }, status=503)

            # Get or create the __ide__ problem
            try:
                ide_problem = Problem.objects.get(code='__ide__')
            except Problem.DoesNotExist:
                return JsonResponse({
                    'error': _('IDE problem not configured. Please run migrations.')
                }, status=503)

            # Get user profile or use a default for anonymous users
            # Anonymous users need a profile for submission tracking
            if request.user.is_authenticated:
                user_profile = request.user.profile
            else:
                # For anonymous users, we need to find or create a default profile
                # This depends on your site's configuration for anonymous submissions
                # For now, we'll require login if IDE_REQUIRE_LOGIN is True
                from judge.models import Profile
                try:
                    # Try to get a system/anonymous user profile
                    user_profile = Profile.objects.filter(user__username='ide_anonymous').first()
                    if not user_profile:
                        return JsonResponse({
                            'error': _('Anonymous execution not configured. Please log in.')
                        }, status=403)
                except Exception:
                    return JsonResponse({
                        'error': _('Please log in to execute code.')
                    }, status=403)

            # Create submission for IDE execution with meta field containing stdin
            submission = Submission(
                user=user_profile,
                problem=ide_problem,
                language=language,
                meta={'stdin': stdin_data, 'ide_mode': True},
            )
            submission.save()

            # Create submission source
            SubmissionSource.objects.create(
                submission=submission,
                source=source_code
            )

            # Submit to judge - meta will be automatically included
            from judge.judgeapi import judge_submission
            try:
                success = judge_submission(
                    submission,
                    rejudge=False,
                )

                if not success:
                    return JsonResponse({
                        'error': _('Failed to submit to judge.')
                    }, status=503)

                return JsonResponse({
                    'status': 'success',
                    'submission_id': submission.id,
                    'message': _('Code submitted successfully. Waiting for results...'),
                })

            except Exception as e:
                logger.error(f'Error submitting to judge: {str(e)}', exc_info=True)
                return JsonResponse({
                    'error': _('Failed to submit code for execution.')
                }, status=500)

        except json.JSONDecodeError:
            return JsonResponse({'error': _('Invalid JSON data.')}, status=400)
        except Exception as e:
            logger.error(f'Error executing IDE code: {str(e)}', exc_info=True)
            return JsonResponse({'error': _('An error occurred while processing your request.')}, status=500)


class IDESaveSessionView(View):
    """
    API endpoint to save the current IDE session.
    """

    def post(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({'error': _('You need to log in to save sessions.')}, status=403)

        try:
            data = json.loads(request.body)
            language_id = data.get('language')
            source_code = data.get('source', '')
            stdin_data = data.get('stdin', '')

            # Validate input
            if not language_id:
                return JsonResponse({'error': _('Language is required.')}, status=400)

            # Get language
            try:
                language = Language.objects.get(id=language_id)
            except Language.DoesNotExist:
                return JsonResponse({'error': _('Invalid language selected.')}, status=400)

            # Create or update session
            session = IDESession.objects.create(
                user=request.user.profile,
                language=language,
                source_code=source_code,
                stdin_data=stdin_data,
            )

            return JsonResponse({
                'success': True,
                'message': _('Session saved successfully.'),
                'session_id': session.id,
                'timestamp': session.last_modified.isoformat(),
            })

        except json.JSONDecodeError:
            return JsonResponse({'error': _('Invalid JSON data.')}, status=400)
        except Exception as e:
            logger.error(f'Error saving IDE session: {str(e)}', exc_info=True)
            return JsonResponse({'error': _('An error occurred while saving your session.')}, status=500)


class IDELoadSessionView(View):
    """
    API endpoint to load a saved IDE session.
    """

    def get(self, request, session_id):
        if not request.user.is_authenticated:
            return JsonResponse({'error': _('You need to log in to load sessions.')}, status=403)

        try:
            # Get session
            session = IDESession.objects.get(
                id=session_id,
                user=request.user.profile
            )

            return JsonResponse({
                'success': True,
                'language': session.language.id,
                'language_name': session.language.name,
                'source': session.source_code,
                'stdin': session.stdin_data,
                'last_modified': session.last_modified.isoformat(),
            })

        except IDESession.DoesNotExist:
            return JsonResponse({'error': _('Session not found.')}, status=404)
        except Exception as e:
            logger.error(f'Error loading IDE session: {str(e)}', exc_info=True)
            return JsonResponse({'error': _('An error occurred while loading your session.')}, status=500)


class IDESubmissionStatusView(View):
    """
    API endpoint to check IDE submission status and get results.
    """

    def get(self, request, submission_id):
        try:
            # Get submission
            from judge.models import SubmissionTestCase
            submission = Submission.objects.get(id=submission_id)

            # Verify this is an IDE submission
            if submission.problem.code != '__ide__':
                return JsonResponse({'error': _('Not an IDE submission.')}, status=400)

            # Check permission - user must own the submission or be staff
            if request.user.is_authenticated:
                if submission.user != request.user.profile and not request.user.is_staff:
                    return JsonResponse({'error': _('Permission denied.')}, status=403)
            else:
                # For anonymous submissions, we allow anyone to view
                # (in production, you might want to use session-based auth)
                pass

            # Get submission status
            response = {
                'submission_id': submission.id,
                'status': submission.status,
                'result': submission.result,
            }

            # If still processing, return current state
            if submission.status in ('QU', 'P', 'G'):
                response['message'] = _('Execution in progress...')
                return JsonResponse(response)

            # If compile error
            if submission.status == 'CE':
                response['message'] = _('Compilation Error')
                response['error'] = submission.error or ''
                return JsonResponse(response)

            # If internal error
            if submission.status == 'IE':
                response['message'] = _('Internal Error')
                response['error'] = submission.error or _('An error occurred during execution.')
                return JsonResponse(response)

            # If completed successfully
            if submission.status == 'D':
                # Get test case results (should be only one for IDE)
                test_cases = SubmissionTestCase.objects.filter(submission=submission).order_by('case')

                if test_cases.exists():
                    test_case = test_cases.first()

                    response['message'] = _('Execution completed')
                    response['stdout'] = test_case.output or ''
                    response['stderr'] = test_case.feedback or ''
                    response['time'] = test_case.time
                    response['memory'] = test_case.memory
                    response['exit_code'] = 0 if test_case.status == 'AC' else 1
                    response['status_display'] = submission.long_status
                else:
                    response['message'] = _('No output')
                    response['stdout'] = ''
                    response['stderr'] = ''

                return JsonResponse(response)

            # Unknown status
            response['message'] = _('Unknown status')
            return JsonResponse(response)

        except Submission.DoesNotExist:
            return JsonResponse({'error': _('Submission not found.')}, status=404)
        except Exception as e:
            logger.error(f'Error getting submission status: {str(e)}', exc_info=True)
            return JsonResponse({'error': _('An error occurred while checking status.')}, status=500)
