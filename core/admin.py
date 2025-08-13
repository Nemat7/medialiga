from django.contrib import admin
from .models import Match, Team, Player, VideoReview, Sponsor, SliderImage, MvpPlayers, VoteRecord


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