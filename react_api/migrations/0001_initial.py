# Generated by Django 2.1.1 on 2018-10-02 00:03

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Arena',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('tag', models.CharField(max_length=255)),
                ('name', models.CharField(max_length=255)),
                ('icon', models.CharField(max_length=255)),
                ('number', models.IntegerField()),
            ],
        ),
        migrations.CreateModel(
            name='Battle',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('arena', models.CharField(max_length=64)),
                ('time', models.DateTimeField(null=True)),
                ('team_crowns', models.IntegerField(null=True)),
                ('opponent_crowns', models.IntegerField(null=True)),
                ('team_size', models.IntegerField()),
                ('player_deck_link', models.CharField(max_length=128, null=True)),
                ('team_deck_link', models.CharField(max_length=128, null=True)),
                ('opponent_deck_link', models.CharField(max_length=128, null=True)),
                ('opponent_team_deck_link', models.CharField(max_length=128, null=True)),
                ('win', models.BooleanField(default=False)),
            ],
        ),
        migrations.CreateModel(
            name='BattleMode',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=64)),
                ('card_levels', models.CharField(max_length=64)),
                ('overtime', models.IntegerField(null=True)),
                ('same_deck', models.BooleanField(default=False)),
                ('war_day', models.BooleanField(default=False)),
                ('collection_day', models.BooleanField(default=False)),
            ],
        ),
        migrations.CreateModel(
            name='Card',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('key', models.CharField(max_length=64)),
                ('name', models.CharField(max_length=255)),
                ('rarity', models.CharField(max_length=64)),
                ('arena', models.IntegerField(null=True)),
                ('elixir', models.IntegerField(null=True)),
                ('max_level', models.IntegerField(null=True)),
                ('type', models.CharField(max_length=64)),
                ('image', models.CharField(max_length=512)),
            ],
        ),
        migrations.CreateModel(
            name='Clan',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=255)),
                ('tag', models.CharField(max_length=32)),
                ('last_refresh', models.DateTimeField(null=True)),
                ('refresh', models.BooleanField(default=False)),
            ],
        ),
        migrations.CreateModel(
            name='ClanHistory',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('timestamp', models.DateTimeField(null=True)),
                ('score', models.IntegerField(null=True)),
                ('highest_score', models.IntegerField(null=True)),
                ('required_trophies', models.IntegerField(null=True)),
                ('type', models.CharField(max_length=255)),
                ('description', models.CharField(max_length=255)),
                ('member_count', models.IntegerField(null=True)),
                ('donations', models.IntegerField(null=True)),
                ('region', models.CharField(max_length=64)),
                ('badge', models.CharField(max_length=512)),
                ('trophies', models.IntegerField(null=True)),
                ('war_state', models.CharField(max_length=512, null=True)),
                ('last_refresh', models.DateTimeField(null=True)),
                ('clan', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='react_api.Clan')),
            ],
        ),
        migrations.CreateModel(
            name='ClanWar',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('date_start', models.DateTimeField(null=True)),
                ('date_end', models.DateTimeField(null=True)),
                ('participants', models.IntegerField(null=True)),
                ('final_battles', models.IntegerField(null=True)),
                ('collections_battles', models.IntegerField(null=True)),
                ('wins', models.IntegerField(null=True)),
                ('losses', models.IntegerField(null=True)),
                ('collections_cards', models.IntegerField(null=True)),
                ('crowns', models.IntegerField(null=True)),
                ('final_position', models.IntegerField(null=True)),
                ('trophies', models.IntegerField(null=True)),
                ('season', models.IntegerField(null=True)),
                ('clan', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='react_api.Clan')),
            ],
        ),
        migrations.CreateModel(
            name='Player',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('tag', models.CharField(max_length=32)),
                ('name', models.CharField(max_length=255)),
                ('last_refresh', models.DateTimeField(null=True)),
                ('refresh', models.BooleanField(default=False)),
            ],
        ),
        migrations.CreateModel(
            name='PlayerCardLevel',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('count', models.IntegerField(null=True)),
                ('level', models.IntegerField(null=True)),
                ('card', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='player', to='react_api.Card')),
                ('player', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='card_level', to='react_api.Player')),
            ],
        ),
        migrations.CreateModel(
            name='PlayerClanHistory',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('joined_clan', models.DateTimeField(null=True)),
                ('left_clan', models.DateTimeField(null=True)),
                ('clan', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='react_api.Clan')),
                ('player', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='react_api.Player')),
            ],
        ),
        migrations.CreateModel(
            name='PlayerClanStatsHistory',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('timestamp', models.DateTimeField(null=True)),
                ('last_refresh', models.DateTimeField(null=True)),
                ('clan_role', models.CharField(max_length=255)),
                ('current_clan_rank', models.IntegerField(null=True)),
                ('previous_clan_rank', models.IntegerField(null=True)),
                ('donations', models.IntegerField(null=True)),
                ('donations_received', models.IntegerField(null=True)),
                ('level', models.IntegerField(null=True)),
                ('trophies', models.IntegerField(null=True)),
                ('arena', models.IntegerField(null=True)),
                ('clan', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='react_api.Clan')),
                ('player', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='react_api.Player')),
            ],
        ),
        migrations.CreateModel(
            name='PlayerClanWar',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('final_battles', models.IntegerField(null=True)),
                ('final_battles_done', models.IntegerField(null=True)),
                ('final_battles_wins', models.IntegerField(null=True)),
                ('crowns', models.IntegerField(null=True)),
                ('collections_cards_earned', models.IntegerField(null=True)),
                ('collections_battles', models.IntegerField(default=0, null=True)),
                ('collections_battles_done', models.IntegerField(null=True)),
                ('collections_battles_wins', models.IntegerField(default=0, null=True)),
                ('clan_war', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='react_api.ClanWar')),
                ('player', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='react_api.Player')),
            ],
        ),
        migrations.CreateModel(
            name='PlayerSeason',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('identifier', models.IntegerField(null=True)),
                ('highest', models.IntegerField(null=True)),
                ('ending', models.IntegerField(null=True)),
                ('ending_rank', models.IntegerField(null=True)),
                ('player', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='react_api.Player')),
            ],
        ),
        migrations.CreateModel(
            name='PlayerStatsHistory',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('timestamp', models.DateTimeField(null=True)),
                ('last_refresh', models.DateTimeField(null=True)),
                ('level', models.IntegerField()),
                ('total_donations', models.IntegerField(null=True)),
                ('highest_trophies', models.IntegerField()),
                ('current_trophies', models.IntegerField()),
                ('challenge_cards_won', models.IntegerField(null=True)),
                ('tourney_cards_won', models.IntegerField(null=True)),
                ('cards_found', models.IntegerField(null=True)),
                ('favorite_card', models.CharField(max_length=255)),
                ('arena', models.IntegerField(null=True)),
                ('total_games', models.IntegerField(null=True)),
                ('tournament_games', models.IntegerField(null=True)),
                ('wins', models.IntegerField(null=True)),
                ('losses', models.IntegerField(null=True)),
                ('draws', models.IntegerField(null=True)),
                ('win_3_crowns', models.IntegerField(null=True)),
                ('clan_cards_collected', models.IntegerField(null=True)),
                ('war_day_wins', models.IntegerField(null=True)),
                ('player', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='react_api.Player')),
            ],
        ),
        migrations.CreateModel(
            name='Tournament',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tag', models.CharField(max_length=20)),
                ('name', models.CharField(max_length=255, null=True)),
                ('open', models.BooleanField()),
                ('max_players', models.IntegerField(null=True)),
                ('current_players', models.IntegerField(null=True)),
                ('status', models.CharField(max_length=50, null=True)),
                ('create_time', models.DateTimeField()),
                ('prep_time', models.DurationField(null=True)),
                ('start_time', models.DateTimeField(null=True)),
                ('end_time', models.DateTimeField(null=True)),
                ('duration', models.DurationField(null=True)),
            ],
        ),
        migrations.CreateModel(
            name='TournamentRefresh',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('timestamp', models.DateTimeField()),
                ('success', models.BooleanField()),
                ('error', models.TextField(null=True)),
                ('count', models.IntegerField(default=0)),
            ],
        ),
        migrations.AlterUniqueTogether(
            name='tournament',
            unique_together={('tag', 'create_time')},
        ),
        migrations.AddField(
            model_name='battle',
            name='mode',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='mode', to='react_api.BattleMode'),
        ),
        migrations.AddField(
            model_name='battle',
            name='opponent',
            field=models.ManyToManyField(related_name='opponent', to='react_api.Player'),
        ),
        migrations.AddField(
            model_name='battle',
            name='opponent_deck',
            field=models.ManyToManyField(related_name='opponent_1_deck', to='react_api.Card'),
        ),
        migrations.AddField(
            model_name='battle',
            name='opponent_team_deck',
            field=models.ManyToManyField(related_name='opponent_2_deck', to='react_api.Card'),
        ),
        migrations.AddField(
            model_name='battle',
            name='player_deck',
            field=models.ManyToManyField(related_name='team_1_deck', to='react_api.Card'),
        ),
        migrations.AddField(
            model_name='battle',
            name='team',
            field=models.ManyToManyField(related_name='team', to='react_api.Player'),
        ),
        migrations.AddField(
            model_name='battle',
            name='team_deck',
            field=models.ManyToManyField(related_name='team_2_deck', to='react_api.Card'),
        ),
        migrations.AddField(
            model_name='battle',
            name='war',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='react_api.ClanWar'),
        ),
    ]
