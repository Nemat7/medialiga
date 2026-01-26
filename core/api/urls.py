from django.http import JsonResponse
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MatchViewSet, TournamentStandingsAPIView, UpdateStandingsAPIView, LiveMatchViewSet, FeaturedMatchAPIView


router = DefaultRouter()
router.register(r'matches', MatchViewSet, basename='match')
router.register(r'live-matches', LiveMatchViewSet, basename='live-match')

urlpatterns = [
    path('', include(router.urls)),
    path('test/', lambda request: JsonResponse({'status': 'ok', 'message': 'API работает!'})),
    path('standings/', TournamentStandingsAPIView.as_view(), name='standings'),
    path('standings/update/', UpdateStandingsAPIView.as_view(), name='update-standings'),

    # API для live матчей
    path('featured-match/', FeaturedMatchAPIView.as_view(), name='featured-match'),
    path('live-matches/featured/', LiveMatchViewSet.as_view({'get': 'featured'}), name='live-featured'),



]