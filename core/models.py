from django.db import models


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