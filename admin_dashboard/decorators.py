from functools import wraps
from django.shortcuts import redirect
from django.contrib import messages
from django.core.exceptions import PermissionDenied


def superuser_required(view_func):
    """
    Decorator to ensure only superusers can access the view.
    Redirects non-superusers to login page with error message.
    """
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if not request.user.is_authenticated:
            messages.error(request, 'Please log in to access the admin dashboard.')
            return redirect('login')

        if not request.user.is_superuser:
            messages.error(request, 'Access denied. Superuser privileges required.')
            raise PermissionDenied("Superuser access required")

        return view_func(request, *args, **kwargs)
    return _wrapped_view


def admin_required(view_func):
    """
    Alias for superuser_required for backward compatibility
    """
    return superuser_required(view_func)