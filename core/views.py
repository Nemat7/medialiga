from django.utils import timezone
from django.db.models import ExpressionWrapper, F, IntegerField, Count
from django.shortcuts import render

from . import models
from .models import Match, Team, Player, VideoReview, Sponsor, PageVisit, SliderImage, MvpPlayers, VoteRecord
from django.db.models.functions import TruncDay
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.utils.timezone import now, timedelta
from django.views.generic import ListView


def stats(request):
    visits = PageVisit.objects.annotate(
        day=TruncDay('timestamp')
    ).values('day').annotate(
        count=models.Count('id')
    ).order_by('-day')[:30]
    return render(request, 'core/stats.html', {'visits': visits})


def statistics_view(request):
    # Получаем данные за последние 30 дней
    date_from = timezone.now() - timedelta(days=30)

    # Группируем по дням и считаем посещения и уникальные IP
    visits = PageVisit.objects.filter(timestamp__gte=date_from).extra(
        {'day': "date(timestamp)"}
    ).values('day').annotate(
        count=Count('id'),
        unique_ips=Count('ip', distinct=True))

    # Сортируем по дате
    visits = visits.order_by('day')

    return render(request, 'core/stats.html', {'visits': visits})

def index(request):
    # Получаем текущие дату и время
    now = timezone.now()

    # Получаем матчи
    # matches = Match.objects.order_by('date')[:5]
    # upcoming_matches = Match.objects.filter(date__gte=now).order_by('date')[:5]

    # Получаем команды и сортируем
    group_a = sorted(Team.objects.filter(group='A'), key=lambda t: (-t.points, -t.goal_difference))
    group_b = sorted(Team.objects.filter(group='B'), key=lambda t: (-t.points, -t.goal_difference))

    # Получаем игроков
    top_scorers = Player.objects.order_by('-goals')[:3]
    top_assists = Player.objects.order_by('-assists')[:3]
    top_combined = Player.objects.annotate(
        total=ExpressionWrapper(F('goals') + F('assists'), output_field=IntegerField())
    ).order_by('-total')[:3]

    # Получаем последнее видео и спонсоров
    latest_video = VideoReview.objects.latest('date')
    sponsors = Sponsor.objects.all()
    slider_images = SliderImage.objects.filter(is_active=True).order_by('order')[:3]

    upcoming_matches = Match.objects.filter(
        is_active=True,
        date__gte=timezone.now().date()
    ).order_by('date', 'time')[:6]

    # Создаём единый контекст
    context = {
        'group_a': group_a,
        'group_b': group_b,
        'top_scorers': Player.objects.order_by('-goals')[:5],
        'top_assists': top_assists,
        'top_combined': top_combined,
        'latest_video': latest_video,
        'sponsors': sponsors,
        'slider_images': slider_images,
        'upcoming_matches': upcoming_matches,
    }

    return render(request, 'core/index.html', context)


def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def voting_page(request):
    players = MvpPlayers.objects.all().select_related('team')
    csrf_token = get_token(request)
    return render(request, 'voting/voting_page.html', {'players': players, 'csrf_token': csrf_token})


def vote_player(request, player_id):
    if request.method == "POST":
        ip_address = get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')[:500]

        # Начало текущей недели (понедельник)
        today = now()
        start_of_week = today - timedelta(days=today.weekday())

        last_vote = VoteRecord.objects.filter(
            ip_address=ip_address,
            timestamp__gte=start_of_week
        ).first()

        if last_vote:
            return JsonResponse({
                "success": False,
                "message": f"Вы уже голосовали на этой неделе {last_vote.timestamp.strftime('%d.%m.%Y')} за {last_vote.player.name}"
            })

        # # Проверка последнего голоса
        # last_vote = VoteRecord.objects.filter(
        #     ip_address=ip_address,
        #     timestamp__gte=now() - timedelta(days=7)
        # ).first()
        #
        # if last_vote:
        #     return JsonResponse({
        #         "success": False,
        #         "message": f"Вы уже голосовали {last_vote.timestamp.strftime('%d.%m.%Y')} за {last_vote.player.name}"
        #     })

        player = get_object_or_404(MvpPlayers, id=player_id)
        player.votes += 1
        player.save()

        VoteRecord.objects.create(
            ip_address=ip_address,
            user_agent=user_agent,
            player=player
        )

        return JsonResponse({
            "success": True,
            "message": f"Ваш голос за {player.name} учтен!"
        })

    return JsonResponse({"success": False, "message": "Неверный запрос"})


def efootball_app(request):
    return render(request, 'efootball/index.html')



def test_simple(request):
    return render(request, 'efootball/test.html')