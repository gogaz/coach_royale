# Generated by Django 2.1.1 on 2018-09-18 16:59

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('react_api', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='JoinableTournamentRefresh',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('timestamp', models.DateTimeField()),
                ('success', models.BooleanField()),
                ('error', models.TextField(null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Tournament',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tag', models.CharField(max_length=20)),
                ('name', models.CharField(max_length=255)),
                ('open', models.BooleanField()),
                ('max_players', models.IntegerField()),
                ('current_players', models.IntegerField()),
                ('status', models.CharField(max_length=50)),
                ('create_time', models.DateTimeField()),
                ('prep_time', models.IntegerField()),
                ('start_time', models.DateTimeField(null=True)),
                ('end_time', models.DateTimeField(null=True)),
                ('duration', models.IntegerField()),
            ],
        ),
        migrations.RemoveField(
            model_name='clanhistory',
            name='badge_decoration',
        ),
        migrations.AlterField(
            model_name='battle',
            name='war',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='react_api.ClanWar'),
        ),
        migrations.AlterField(
            model_name='battlemode',
            name='same_deck',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterUniqueTogether(
            name='tournament',
            unique_together={('tag', 'create_time')},
        ),
    ]
