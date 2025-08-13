from django.utils import timezone
from .models import PageVisit

class TrackVisitsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if not request.path.startswith(('/admin/', '/static/', '/media/')):
            PageVisit.objects.create(
                ip=request.META.get('REMOTE_ADDR', ''),
                path=request.path,
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
        return self.get_response(request)