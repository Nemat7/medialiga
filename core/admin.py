from django.contrib import admin
from .models import Match, Team, Player, VideoReview, Sponsor, SliderImage, MvpPlayers, VoteRecord, PageVisit, EMatch, TournamentStanding
from django.utils.html import format_html

@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ('name', 'group', 'points', 'games_played', 'logo_preview')
    list_filter = ('group',)
    search_fields = ('name',)
    readonly_fields = ('logo_preview',)

    def logo_preview(self, obj):
        if obj.logo:
            return f'<img src="{obj.logo.url}" style="max-height: 50px; max-width: 50px;" />'
        return "Нет логотипа"

    logo_preview.short_description = 'Логотип'
    logo_preview.allow_tags = True

class MatchAdmin(admin.ModelAdmin):
    list_display = ('team_a', 'team_b', 'date', 'time', 'venue')
    list_filter = ('is_active', 'matchday')
    search_fields = ('team_a', 'team_b', 'venue')
    fieldsets = (
        (None, {
            'fields': ('matchday', 'date', 'time', 'venue', 'is_active')
        }),
        ('Команда A', {
            'fields': ('team_a', 'team_a_logo')
        }),
        ('Команда B', {
            'fields': ('team_b', 'team_b_logo')
        }),
    )

admin.site.register(Match, MatchAdmin)


@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = ('name', 'team', 'goals', 'assists', 'photo_preview')
    search_fields = ('name', 'team__name')
    readonly_fields = ('photo_preview',)

    def photo_preview(self, obj):
        if obj.photo:
            return f'<img src="{obj.photo.url}" style="max-height: 50px; max-width: 50px;" />'
        return "Нет фото"

    photo_preview.short_description = 'Фото'
    photo_preview.allow_tags = True


@admin.register(VideoReview)
class VideoReviewAdmin(admin.ModelAdmin):
    list_display = ('title', 'date')


@admin.register(Sponsor)
class SponsorAdmin(admin.ModelAdmin):
    list_display = ('name', 'url', 'logo_preview')
    readonly_fields = ('logo_preview',)

    def logo_preview(self, obj):
        if obj.logo:
            return f'<img src="{obj.logo.url}" style="max-height: 50px; max-width: 50px;" />'
        return "Нет логотипа"

    logo_preview.short_description = 'Логотип'
    logo_preview.allow_tags = True

@admin.register(SliderImage)
class SliderImageAdmin(admin.ModelAdmin):
    list_display = ('title', 'order', 'is_active')
    list_editable = ('order', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('title',)


@admin.register(MvpPlayers)
class MvpPlayersAdmin(admin.ModelAdmin):
    list_display = ('name', 'team', 'votes', 'position')
    list_filter = ('team', 'position')
    search_fields = ('name', 'team__name')
    list_editable = ('votes',)
    readonly_fields = ('votes',)

@admin.register(VoteRecord)
class VoteRecordAdmin(admin.ModelAdmin):
    list_display = ('player', 'ip_address', 'timestamp')
    list_filter = ('timestamp', 'player')
    search_fields = ('ip_address', 'player__name')
    date_hierarchy = 'timestamp'


@admin.register(PageVisit)
class PageVisitAdmin(admin.ModelAdmin):
    list_display = ('ip', 'path', 'timestamp')
    list_filter = ('timestamp', 'path')
    search_fields = ('ip', 'path')
    date_hierarchy = 'timestamp'




# ===================================== E - FOOTBALL ADMIN ==========================================

@admin.register(EMatch)
class EMatchAdmin(admin.ModelAdmin):
    list_display = ['display_match', 'match_date', 'match_time', 'status_badge', 'created_at']
    list_filter = ['status', 'match_date']
    search_fields = ['team_a', 'team_b', 'location']
    # list_editable = ['status']

    fieldsets = (
        ('Основная информация', {
            'fields': ('team_a', 'team_b', 'match_date', 'match_time', 'status')
        }),
        ('Результат', {
            'fields': ('score_a', 'score_b'),
            'classes': ('collapse',)
        }),
        ('Дополнительно', {
            'fields': ('location', 'tournament_round'),
            'classes': ('collapse',)
        }),
    )

    def display_match(self, obj):
        """Отображение матча в списке"""
        if obj.status == 'completed' and obj.score_a is not None and obj.score_b is not None:
            score = f"{obj.score_a}:{obj.score_b}"
        else:
            score = "vs"

        return format_html(
            '<strong>{} {} {}</strong>',
            obj.team_a,
            score,
            obj.team_b
        )

    display_match.short_description = 'Матч'

    def status_badge(self, obj):
        """Красивое отображение статуса"""
        colors = {
            'upcoming': 'blue',
            'live': 'green',
            'completed': 'gray'
        }
        color = colors.get(obj.status, 'gray')

        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">{}</span>',
            color,
            obj.get_status_display()
        )

    status_badge.short_description = 'Статус'

    # Действия
    actions = ['mark_as_completed', 'mark_as_live', 'mark_as_upcoming']

    def mark_as_completed(self, request, queryset):
        """Отметить матчи как завершенные"""
        updated = queryset.update(status='completed')
        self.message_user(request, f"{updated} матчей отмечены как завершенные")

    mark_as_completed.short_description = "Отметить как завершенные"

    def mark_as_live(self, request, queryset):
        """Отметить матчи как в прямом эфире"""
        updated = queryset.update(status='live')
        self.message_user(request, f"{updated} матчей отмечены как в прямом эфире")

    mark_as_live.short_description = "Отметить как в прямом эфире"

    def mark_as_upcoming(self, request, queryset):
        """Отметить матчи как предстоящие"""
        updated = queryset.update(status='upcoming')
        self.message_user(request, f"{updated} матчей отмечены как предстоящие")

    mark_as_upcoming.short_description = "Отметить как предстоящие"


@admin.register(TournamentStanding)
class TournamentStandingAdmin(admin.ModelAdmin):
    list_display = [
        'position',
        'team_name',
        'group',
        'played',
        'won',
        'drawn',
        'lost',
        'goals_for',
        'goals_against',
        'goal_difference_display',
        'points',
        'form_display',
        'updated_at',
    ]

    list_display_links = ['team_name']  # только название команды - ссылка
    # УБРАЛИ list_editable - редактирование только через форму редактирования
    list_filter = ['group']
    search_fields = ['team_name']
    ordering = ['group', 'position']
    list_per_page = 12

    fieldsets = (
        ('Основная информация', {
            'fields': ('position', 'team_name', 'group')
        }),
        ('Статистика матчей', {
            'fields': ('played', 'won', 'drawn', 'lost')
        }),
        ('Голы и очки', {
            'fields': ('goals_for', 'goals_against', 'points')
        }),
        ('Форма команды', {
            'fields': ('form_results',),
            'description': 'Введите результаты последних 5 матчей: W (Победа), D (Ничья), L (Поражение)'
        }),
    )

    readonly_fields = ['created_at', 'updated_at']

    def goal_difference_display(self, obj):
        gd = obj.goal_difference
        color = "green" if gd > 0 else "red" if gd < 0 else "gray"
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            f"+{gd}" if gd > 0 else gd
        )

    goal_difference_display.short_description = "Разница голов"

    def form_display(self, obj):
        if not obj.form_results:
            return "-"

        form_html = []
        for result in obj.form_results:
            color_map = {
                'W': ('#10b981', 'П'),  # green
                'D': ('#6b7280', 'Н'),  # gray
                'L': ('#ef4444', 'П'),  # red
            }
            color, text = color_map.get(result, ('#6b7280', '?'))

            form_html.append(format_html(
                '<span style="display: inline-block; width: 24px; height: 24px; '
                'background-color: {}; color: white; border-radius: 50%; '
                'text-align: center; line-height: 24px; font-size: 12px; '
                'font-weight: bold; margin-right: 2px;">{}</span>',
                color, text
            ))

        return format_html(''.join(form_html))

    form_display.short_description = "Форма"

    actions = ['reset_group_a', 'reset_group_b']

    def reset_group_a(self, request, queryset):
        """Сброс группы A к тестовым данным"""
        from django.db import transaction

        with transaction.atomic():
            # Удаляем старые записи группы A
            TournamentStanding.objects.filter(group='A').delete()

            # Создаем тестовые данные для группы A
            test_data_a = [
                {
                    'position': 1,
                    'team_name': "Thunder FC",
                    'played': 5,
                    'won': 4,
                    'drawn': 1,
                    'lost': 0,
                    'goals_for': 12,
                    'goals_against': 4,
                    'points': 13,
                    'form_results': ["W", "W", "D", "W", "W"]
                },
                {
                    'position': 2,
                    'team_name': "Digital Lions",
                    'played': 5,
                    'won': 3,
                    'drawn': 1,
                    'lost': 1,
                    'goals_for': 9,
                    'goals_against': 5,
                    'points': 10,
                    'form_results': ["W", "D", "W", "L", "W"]
                },
                {
                    'position': 3,
                    'team_name': "Cyber Eagles",
                    'played': 5,
                    'won': 3,
                    'drawn': 0,
                    'lost': 2,
                    'goals_for': 8,
                    'goals_against': 6,
                    'points': 9,
                    'form_results': ["L", "W", "W", "W", "L"]
                },
                {
                    'position': 4,
                    'team_name': "Neon Strikers",
                    'played': 5,
                    'won': 2,
                    'drawn': 2,
                    'lost': 1,
                    'goals_for': 7,
                    'goals_against': 5,
                    'points': 8,
                    'form_results': ["D", "W", "D", "W", "L"]
                },
                {
                    'position': 5,
                    'team_name': "Pixel Warriors",
                    'played': 5,
                    'won': 1,
                    'drawn': 1,
                    'lost': 3,
                    'goals_for': 5,
                    'goals_against': 9,
                    'points': 4,
                    'form_results': ["L", "L", "W", "D", "L"]
                },
                {
                    'position': 6,
                    'team_name': "Storm United",
                    'played': 5,
                    'won': 0,
                    'drawn': 1,
                    'lost': 4,
                    'goals_for': 3,
                    'goals_against': 11,
                    'points': 1,
                    'form_results': ["L", "D", "L", "L", "L"]
                },
            ]

            for data in test_data_a:
                TournamentStanding.objects.create(**data)

        self.message_user(request, "Group A reset to test data")

    reset_group_a.short_description = "Сбросить группу A"

    def reset_group_b(self, request, queryset):
        """Сброс группы B к тестовым данным"""
        from django.db import transaction

        with transaction.atomic():
            # Удаляем старые записи группы B
            TournamentStanding.objects.filter(group='B').delete()

            # Создаем тестовые данные для группы B
            test_data_b = [
                {
                    'position': 1,
                    'team_name': "Blaze FC",
                    'played': 5,
                    'won': 4,
                    'drawn': 0,
                    'lost': 1,
                    'goals_for': 11,
                    'goals_against': 5,
                    'points': 12,
                    'form_results': ["W", "L", "W", "W", "W"]
                },
                {
                    'position': 2,
                    'team_name': "Shadow Wolves",
                    'played': 5,
                    'won': 3,
                    'drawn': 2,
                    'lost': 0,
                    'goals_for': 10,
                    'goals_against': 4,
                    'points': 11,
                    'form_results': ["D", "W", "W", "D", "W"]
                },
                {
                    'position': 3,
                    'team_name': "Volt Gaming",
                    'played': 5,
                    'won': 3,
                    'drawn': 1,
                    'lost': 1,
                    'goals_for': 9,
                    'goals_against': 6,
                    'points': 10,
                    'form_results': ["W", "D", "W", "L", "W"]
                },
                {
                    'position': 4,
                    'team_name': "Apex United",
                    'played': 5,
                    'won': 2,
                    'drawn': 1,
                    'lost': 2,
                    'goals_for': 7,
                    'goals_against': 7,
                    'points': 7,
                    'form_results': ["L", "W", "D", "W", "L"]
                },
                {
                    'position': 5,
                    'team_name': "Nova Esports",
                    'played': 5,
                    'won': 1,
                    'drawn': 1,
                    'lost': 3,
                    'goals_for': 4,
                    'goals_against': 8,
                    'points': 4,
                    'form_results': ["L", "L", "D", "W", "L"]
                },
                {
                    'position': 6,
                    'team_name': "Fury FC",
                    'played': 5,
                    'won': 0,
                    'drawn': 1,
                    'lost': 4,
                    'goals_for': 3,
                    'goals_against': 12,
                    'points': 1,
                    'form_results': ["L", "L", "L", "D", "L"]
                },
            ]

            for data in test_data_b:
                TournamentStanding.objects.create(**data)

        self.message_user(request, "Group B reset to test data")

    reset_group_b.short_description = "Сбросить группу B"



