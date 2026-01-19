from django.http import JsonResponse
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MatchViewSet, TournamentStandingsAPIView, UpdateStandingsAPIView


router = DefaultRouter()
router.register(r'matches', MatchViewSet, basename='match')

urlpatterns = [
    path('', include(router.urls)),
    path('test/', lambda request: JsonResponse({'status': 'ok', 'message': 'API работает!'})),
    path('standings/', TournamentStandingsAPIView.as_view(), name='standings'),
    path('standings/update/', UpdateStandingsAPIView.as_view(), name='update-standings'),


]