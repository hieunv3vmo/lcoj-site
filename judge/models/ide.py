from django.db import models
from django.utils.translation import gettext_lazy as _

from judge.models.profile import Profile
from judge.models.runtime import Language

__all__ = ['IDESession']


class IDESession(models.Model):
    """
    Model to store IDE sessions for users.
    Allows users to save their code and resume later.
    """
    user = models.ForeignKey(Profile, verbose_name=_('user'), on_delete=models.CASCADE,
                             related_name='ide_sessions', null=True, blank=True)
    # Allow null user for anonymous sessions (if we want to support that)

    session_key = models.CharField(max_length=255, verbose_name=_('session key'),
                                    help_text=_('Unique identifier for this IDE session'),
                                    db_index=True, null=True, blank=True)

    language = models.ForeignKey(Language, verbose_name=_('language'), on_delete=models.CASCADE)

    source_code = models.TextField(verbose_name=_('source code'), blank=True,
                                    help_text=_('User\'s code in the IDE'))

    stdin_data = models.TextField(verbose_name=_('standard input'), blank=True,
                                   help_text=_('Input data for program execution'))

    last_modified = models.DateTimeField(verbose_name=_('last modified'), auto_now=True,
                                         help_text=_('When this session was last updated'))

    created_at = models.DateTimeField(verbose_name=_('created at'), auto_now_add=True,
                                      help_text=_('When this session was created'))

    class Meta:
        verbose_name = _('IDE session')
        verbose_name_plural = _('IDE sessions')
        ordering = ['-last_modified']
        indexes = [
            models.Index(fields=['user', '-last_modified']),
            models.Index(fields=['session_key']),
        ]

    def __str__(self):
        if self.user:
            return f'IDE Session for {self.user.user.username} - {self.language.name}'
        return f'Anonymous IDE Session - {self.language.name}'
