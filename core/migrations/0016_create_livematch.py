from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('core', '0015_mvpplayers_voterecord'),
    ]

    operations = [
        migrations.CreateModel(
            name='LiveMatch',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(blank=True, max_length=200, verbose_name='Название матча')),
                ('home_team', models.CharField(max_length=100, verbose_name='Хозяева')),
                ('away_team', models.CharField(max_length=100, verbose_name='Гости')),
                ('video_url', models.URLField(verbose_name='Ссылка на трансляцию')),
                ('video_id', models.CharField(blank=True, help_text='Автоматически извлекается из ссылки', max_length=50, verbose_name='ID видео (YouTube)')),
                ('status', models.CharField(choices=[('live', 'Live'), ('upcoming', 'Upcoming'), ('finished', 'Finished')], default='upcoming', max_length=20, verbose_name='Статус')),
            ],
            options={
                'verbose_name': 'Прямой эфир',
                'verbose_name_plural': 'Прямые эфиры',
                'ordering': ['-id'],
            },
        ),
    ]
