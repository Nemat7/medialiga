from rest_framework import serializers
from .models import EMatch, TournamentStanding, LiveMatch


class MatchSerializer(serializers.ModelSerializer):
    # Добавляем вычисляемые поля для совместимости с React
    date = serializers.SerializerMethodField()
    time = serializers.SerializerMethodField()
    teamA = serializers.CharField(source='team_a')
    teamB = serializers.CharField(source='team_b')
    scoreA = serializers.IntegerField(source='score_a', allow_null=True)
    scoreB = serializers.IntegerField(source='score_b', allow_null=True)

    class Meta:
        model = EMatch
        fields = [
            'id',
            'date',  # formatted_date
            'time',  # formatted_time
            'teamA',  # team_a
            'teamB',  # team_b
            'scoreA',  # score_a
            'scoreB',  # score_b
            'status',
            'location',
            'tournament_round',
            'created_at',
        ]
        read_only_fields = ['created_at']

    def get_date(self, obj):
        return obj.formatted_date

    def get_time(self, obj):
        return obj.formatted_time

    def validate(self, data):
        """Валидация данных матча"""
        # Проверяем что команды разные
        if data.get('team_a') == data.get('team_b'):
            raise serializers.ValidationError(
                "Команды не могут быть одинаковыми"
            )

        # Для завершенных матчей проверяем счет
        if data.get('status') == 'completed':
            if data.get('score_a') is None or data.get('score_b') is None:
                raise serializers.ValidationError(
                    "Для завершенного матча необходимо указать счет"
                )

        return data



class TournamentStandingSerializer(serializers.ModelSerializer):
    # Только gd остается как вычисляемое поле
    gd = serializers.SerializerMethodField()

    class Meta:
        model = TournamentStanding
        fields = [
            'position',
            'name',
            'played',
            'won',
            'drawn',
            'lost',
            'gf',
            'ga',
            'gd',
            'points',
            'form',
        ]

    def get_gd(self, obj):
        return obj.goal_difference

    # form_results уже есть в модели, просто переименовываем
    form = serializers.ListField(source='form_results')

    # Алиасы для совместимости с фронтендом
    name = serializers.CharField(source='team_name')
    gf = serializers.IntegerField(source='goals_for')
    ga = serializers.IntegerField(source='goals_against')



class LiveMatchSerializer(serializers.ModelSerializer):
    youtube_thumbnail = serializers.SerializerMethodField()
    is_live = serializers.SerializerMethodField()

    class Meta:
        model = LiveMatch
        fields = [
            'id',
            'title',
            'home_team',
            'away_team',
            'video_url',
            'video_id',
            'status',
            'youtube_thumbnail',
            'is_live',
        ]
        read_only_fields = ['video_id']

    def get_youtube_thumbnail(self, obj):
        if obj.video_id:
            return f"https://img.youtube.com/vi/{obj.video_id}/maxresdefault.jpg"
        return None

    def get_is_live(self, obj):
        return obj.is_live