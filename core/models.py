from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models import F, Case, When, Value
from django.db.models.functions import Coalesce

class SliderImage(models.Model):
    title = models.CharField(max_length=100, verbose_name="Название", blank=True)
    image = models.ImageField(upload_to='slider/', verbose_name="Изображение")
    order = models.PositiveIntegerField(default=0, verbose_name="Порядок")
    is_active = models.BooleanField(default=True, verbose_name="Активно")

    class Meta:
        verbose_name = "Изображение слайдера"
        verbose_name_plural = "Изображения слайдера"
        ordering = ['order']

    def __str__(self):
        return self.title if self.title else f"Изображение {self.id}"


class Match(models.Model):
    MATCHDAY_CHOICES = [
        ('MD1', 'Matchday 1'),
        ('MD2', 'Matchday 2'),
    ]

    matchday = models.CharField(max_length=3, choices=MATCHDAY_CHOICES, default='MD1')
    date = models.DateField()
    time = models.TimeField(
        verbose_name="Время матча",
        null=True,  # Разрешаем NULL в базе
        blank=True,  # Разрешаем пустое значение в формах
        help_text="Формат: HH:MM"
    )
    venue = models.CharField(max_length=200)

    team_a = models.CharField(max_length=100)
    team_a_logo = models.ImageField(upload_to='teams/matcheslogo/', blank=True, null=True)

    team_b = models.CharField(max_length=100)
    team_b_logo = models.ImageField(upload_to='teams/matcheslogo/', blank=True, null=True)

    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['date', 'time']
        verbose_name_plural = 'Matches'

    def __str__(self):
        return f"{self.team_a} vs {self.team_b}"

    def get_short_date(self):
        return self.date.strftime("%d %b")


# Модель турнирной таблицы
class Team(models.Model):
    name = models.CharField(max_length=100, verbose_name="Название команды")
    points = models.IntegerField(default=0, verbose_name="Очки")
    games_played = models.IntegerField(default=0, verbose_name="Игры")
    wins = models.IntegerField(default=0, verbose_name="Победы")
    draws = models.IntegerField(default=0, verbose_name="Ничьи")
    losses = models.IntegerField(default=0, verbose_name="Поражения")
    group = models.CharField(max_length=1, choices=[('A', 'Группа A'), ('B', 'Группа B')], verbose_name="Группа")
   # Голы
    goals_for = models.IntegerField(default=0, verbose_name="Забито")
    goals_against = models.IntegerField(default=0, verbose_name="Пропущено")
    logo = models.ImageField(upload_to='teams/logos/', blank=True, null=True, verbose_name="Логотип")

    # Вычисляемые поля (можно добавить в методы)
    @property
    def points(self):
        return self.wins * 3 + self.draws * 1

    @property
    def goal_difference(self):
        return self.goals_for - self.goals_against

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Команда"
        verbose_name_plural = "Команды"



# Модель игрока
class Player(models.Model):
    name = models.CharField(max_length=100, verbose_name="Имя игрока")
    photo = models.ImageField(upload_to="players/", null=True, blank=True, verbose_name="Фото")
    goals = models.IntegerField(default=0, verbose_name="Голы")
    assists = models.IntegerField(default=0, verbose_name="Ассисты")
    team = models.ForeignKey(Team, on_delete=models.CASCADE, verbose_name="Команда")

    @property
    def goals_plus_assists(self):
        return self.goals + self.assists

    def __str__(self):
        return self.name



class VideoReview(models.Model):
    title = models.CharField(max_length=200)
    youtube_id = models.CharField(max_length=20)  # Например: "dQw4w9WgXcQ"
    date = models.DateField(auto_now_add=True)

    def get_embed_url(self):
        return f"https://www.youtube.com/embed/{self.youtube_id}"


class Sponsor(models.Model):
    name = models.CharField(max_length=100)
    logo = models.ImageField(upload_to="sponsors/")
    url = models.URLField(blank=True)

    def __str__(self):
        return self.name

class PageVisit(models.Model):
    ip = models.CharField(max_length=50)
    path = models.CharField(max_length=255)
    user_agent = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Посещение'
        verbose_name_plural = 'Посещения'

    def __str__(self):
        return f"{self.ip} - {self.path}"



class MvpPlayers(models.Model):
    name = models.CharField(max_length=100)
    photo = models.ImageField(upload_to='mvp_players/')  # Исправлено на ImageField
    votes = models.PositiveIntegerField(default=0)
    position = models.CharField(max_length=50, blank=True)
    team = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True)  # Связь с моделью Team

    class Meta:
        verbose_name = "MVP игрок"
        verbose_name_plural = "MVP игроки"
        ordering = ['-votes']

    def __str__(self):
        return f"{self.name} ({self.team.name if self.team else 'No team'})"

class VoteRecord(models.Model):
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    player = models.ForeignKey(MvpPlayers, on_delete=models.CASCADE)
    timestamp = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.timestamp} ({self.user_agent}) -> {self.player.name}"




# ================================= E - FOOTBALL MODELS ================================================


class EMatch(models.Model):
    """Модель для матчей eFootball"""
    STATUS_CHOICES = [
        ('upcoming', 'Предстоящий'),
        ('live', 'В прямом эфире'),
        ('completed', 'Завершен'),
    ]

    # Основные поля
    team_a = models.CharField(max_length=100, verbose_name='Команда A')
    team_b = models.CharField(max_length=100, verbose_name='Команда B')

    # Счет (только для завершенных матчей)
    score_a = models.IntegerField(
        verbose_name='Счет команды A',
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(99)]
    )
    score_b = models.IntegerField(
        verbose_name='Счет команды B',
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(99)]
    )

    # Дата и время
    match_date = models.DateField(verbose_name='Дата матча')
    match_time = models.TimeField(verbose_name='Время матча')

    # Статус
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='upcoming',
        verbose_name='Статус'
    )

    # Дополнительные поля
    location = models.CharField(
        max_length=200,
        verbose_name='Место проведения',
        blank=True,
        null=True
    )

    tournament_round = models.CharField(
        max_length=100,
        verbose_name='Тур/раунд',
        blank=True,
        null=True
    )

    # Метаданные
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Дата обновления')

    class Meta:
        verbose_name = 'Матч'
        verbose_name_plural = 'Матчи'
        ordering = ['match_date', 'match_time']
        indexes = [
            models.Index(fields=['match_date']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.team_a} vs {self.team_b} ({self.match_date})"

    @property
    def formatted_date(self):
        """Форматированная дата как в React (Jan 15)"""
        return self.match_date.strftime('%b %d')

    @property
    def formatted_time(self):
        """Форматированное время (20:00)"""
        return self.match_time.strftime('%H:%M')

    def save(self, *args, **kwargs):
        """Автоматическая валидация при сохранении"""
        # Если матч завершен, должны быть счет
        if self.status == 'completed' and (self.score_a is None or self.score_b is None):
            raise ValueError("Для завершенного матча должен быть указан счет")

        # Если матч upcoming, счет должен быть None
        if self.status == 'upcoming':
            self.score_a = None
            self.score_b = None

        super().save(*args, **kwargs)



class TournamentStanding(models.Model):
    class GroupChoices(models.TextChoices):
        GROUP_A = 'A', 'Group A'
        GROUP_B = 'B', 'Group B'

    position = models.PositiveIntegerField(
        verbose_name="Position",
        validators=[MinValueValidator(1)]
    )

    team_name = models.CharField(
        max_length=100,
        verbose_name="Team Name"
    )

    group = models.CharField(
        max_length=1,
        choices=GroupChoices.choices,
        verbose_name="Group"
    )

    # Статистика
    played = models.PositiveIntegerField(
        default=0,
        verbose_name="Matches Played",
        validators=[MinValueValidator(0)]
    )

    won = models.PositiveIntegerField(
        default=0,
        verbose_name="Won",
        validators=[MinValueValidator(0)]
    )

    drawn = models.PositiveIntegerField(
        default=0,
        verbose_name="Drawn",
        validators=[MinValueValidator(0)]
    )

    lost = models.PositiveIntegerField(
        default=0,
        verbose_name="Lost",
        validators=[MinValueValidator(0)]
    )

    # Голы
    goals_for = models.PositiveIntegerField(
        default=0,
        verbose_name="Goals For (GF)",
        validators=[MinValueValidator(0)]
    )

    goals_against = models.PositiveIntegerField(
        default=0,
        verbose_name="Goals Against (GA)",
        validators=[MinValueValidator(0)]
    )

    # Очки (заполняем вручную или вычисляем при сохранении)
    points = models.PositiveIntegerField(
        default=0,
        verbose_name="Points",
        validators=[MinValueValidator(0)]
    )

    # Автоматически вычисляемое поле
    @property
    def goal_difference(self):
        return self.goals_for - self.goals_against

    # Форма команды (последние 5 матчей)
    form_results = models.JSONField(
        default=list,
        verbose_name="Form Results",
        help_text="List of last 5 results: W (Win), D (Draw), L (Loss). Example: ['W', 'D', 'L', 'W', 'W']"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Tournament Standing"
        verbose_name_plural = "Tournament Standings"
        ordering = ['group', 'position']
        unique_together = ['group', 'position']
        indexes = [
            models.Index(fields=['group', 'position']),
            models.Index(fields=['group', 'points']),
        ]

    def __str__(self):
        return f"{self.position}. {self.team_name} (Group {self.group})"

    def clean(self):
        """Валидация данных перед сохранением"""
        from django.core.exceptions import ValidationError

        # Проверка form_results
        if self.form_results:
            if len(self.form_results) > 5:
                raise ValidationError({
                    'form_results': 'Maximum 5 form results allowed'
                })

            for result in self.form_results:
                if result not in ['W', 'D', 'L']:
                    raise ValidationError({
                        'form_results': f"Invalid result '{result}'. Use 'W', 'D', or 'L'"
                    })

        # Проверка статистики
        if self.played != (self.won + self.drawn + self.lost):
            raise ValidationError({
                'played': f"Played ({self.played}) must equal Won ({self.won}) + Drawn ({self.drawn}) + Lost ({self.lost}) = {self.won + self.drawn + self.lost}"
            })

        # Проверка позиции в группе
        if self.position < 1 or self.position > 6:
            raise ValidationError({
                'position': 'Position must be between 1 and 6 for each group'
            })

        # Автоматический расчет очков (опционально)
        calculated_points = (self.won * 3) + self.drawn
        if self.points != calculated_points:
            # Можно предупредить, но не блокировать
            pass

    # def save(self, *args, **kwargs):
    #     # Автоматически вычисляем очки при сохранении
    #     self.points = (self.won * 3) + self.drawn
    #     self.full_clean()  # Выполняем валидацию
    #     super().save(*args, **kwargs)

    def save(self, *args, **kwargs):
        # Автоматически вычисляем очки
        self.points = (self.won * 3) + self.drawn

        # Сохраняем объект
        super().save(*args, **kwargs)

        # После сохранения пересчитываем позиции ВСЕХ команд в этой группе
        self.update_group_positions(self.group)

    @classmethod
    def update_group_positions(cls, group):
        """Обновляет позиции команд в указанной группе"""
        # Получаем все команды в группе, сортированные по критериям
        standings = cls.objects.filter(group=group).order_by(
            '-points',  # 1. По очкам (убывание)
            '-goal_difference',  # 2. По разнице голов (убывание)
            '-goals_for',  # 3. По забитым голам (убывание)
            'team_name'  # 4. По алфавиту (как tiebreaker последнего уровня)
        )

        # Обновляем позиции
        for position, standing in enumerate(standings, start=1):
            if standing.position != position:
                standing.position = position
                # Используем update чтобы избежать рекурсивного save()
                cls.objects.filter(id=standing.id).update(position=position)





class LiveMatch(models.Model):
    class StatusChoices(models.TextChoices):
        LIVE = 'live', 'Live'
        UPCOMING = 'upcoming', 'Upcoming'
        FINISHED = 'finished', 'Finished'

    title = models.CharField('Название матча', max_length=200, blank=True)
    home_team = models.CharField('Хозяева', max_length=100)
    away_team = models.CharField('Гости', max_length=100)

    # YouTube или Twitch ссылка
    video_url = models.URLField('Ссылка на трансляцию')
    video_id = models.CharField('ID видео (YouTube)', max_length=50, blank=True, help_text='Автоматически извлекается из ссылки')

    # Статус матча
    status = models.CharField(
        'Статус',
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.UPCOMING
    )

    def __str__(self):
        return f"{self.home_team} vs {self.away_team} - {self.get_status_display()}"

    def save(self, *args, **kwargs):
        # Автоматическое извлечение video_id из YouTube ссылки
        if self.video_url and 'youtube.com' in self.video_url:
            if 'v=' in self.video_url:
                self.video_id = self.video_url.split('v=')[1].split('&')[0]
            elif 'youtu.be/' in self.video_url:
                self.video_id = self.video_url.split('youtu.be/')[1].split('?')[0]

        # Генерация заголовка если пустой
        if not self.title:
            self.title = f"{self.home_team} vs {self.away_team}"

        super().save(*args, **kwargs)

    def get_youtube_thumbnail(self, quality='maxresdefault'):
        """Получить превью YouTube"""
        if self.video_id:
            return f"https://img.youtube.com/vi/{self.video_id}/{quality}.jpg"
        return None

    @property
    def is_live(self):
        return self.status == 'live'

    class Meta:
        verbose_name = 'Прямой эфир'
        verbose_name_plural = 'Прямые эфиры'
        ordering = ['-id']