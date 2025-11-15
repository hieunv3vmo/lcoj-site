"""
Context processors for DMOJ templates

Provides additional context variables for templates
"""

from django.conf import settings


def vite_assets(request):
    """
    Vite assets context processor

    Makes Vite configuration available in templates:
    - VITE_DEV_MODE: Whether to use Vite dev server
    - VITE_DEV_SERVER_URL: URL of Vite dev server
    - VITE_MANIFEST: Vite manifest for production builds
    """
    return {
        'VITE_DEV_MODE': getattr(settings, 'VITE_DEV_MODE', False),
        'VITE_DEV_SERVER_URL': getattr(settings, 'VITE_DEV_SERVER_URL', 'http://localhost:5173'),
        'VITE_MANIFEST': getattr(settings, 'VITE_MANIFEST', {}),
    }
