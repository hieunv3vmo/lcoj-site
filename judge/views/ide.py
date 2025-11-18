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

from judge.models import IDESession, Judge, Language, Submission, SubmissionSource
from judge.utils.views import TitleMixin
from judge.widgets import AceWidget

__all__ = ['OnlineIDEView', 'IDEExecuteView', 'IDESaveSessionView', 'IDELoadSessionView']

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

            # For now, we return a simulated response
            # In production, you would create a special IDE submission and use the judge system
            # This requires modifications to the judge system to support stdin/stdout for IDE mode

            return JsonResponse({
                'status': 'queued',
                'message': _('Code execution has been queued. Judge integration coming soon.'),
                'language': language.name,
                'code_length': len(source_code),
                # In the future, this would return:
                # 'submission_id': submission.id,
                # 'stdout': output,
                # 'stderr': errors,
                # 'time': execution_time,
                # 'memory': memory_used,
                # 'exit_code': exit_code,
            })

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
