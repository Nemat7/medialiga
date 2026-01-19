from django.contrib import admin
from django.urls import path, include
from core.views import index, stats, voting_page, vote_player, statistics_view, efootball_app
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('admin/', admin.site.urls),
    # API для eFootball
    path('api/efootball/', include('core.api.urls')),
    path('tournament/', include('core.api.urls')),
    # React page
    path('efootball/', efootball_app),
    path('', index, name='index'),
    # path('stats/', stats, name='stats'),
    path('stats/', statistics_view, name='statistics'),
    path('vote/', voting_page, name='voting-page'),
    path('vote/<int:player_id>/', vote_player, name='vote-player'),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)