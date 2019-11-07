from django.urls import path, include

from backend.views.clan import clans_list, clan_info, clan_members, clan_wars, clan_weekly_season, clan_monthly_season
from backend.views.default import home
from backend.views.player import player_info, player_clan, player_activity

urlpatterns = [
    path('home', home, name='home'),
    path('clan/', include([
        path('all', clans_list, name='clans_list'),
        path('<slug:tag>/', include([
            path('', clan_info, name='clan_info'),
            path('members', clan_members, name='clan_members'),
            path('wars', clan_wars, name='clan_wars'),
            path('weekly', clan_weekly_season, name='clan_weekly_season'),
            path('season', clan_monthly_season, name='clan_monthly_season')
        ]))
    ])),
    path('player/', include([
        path('<slug:tag>/', include([
            path('', player_info, name="player_info"),
            path('clan', player_clan, name="player_clan"),
            path('activity', player_activity, name="player_activity")
        ]))
    ])),
]
