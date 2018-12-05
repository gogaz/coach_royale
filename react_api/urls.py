from django.urls import path, include

from react_api.views.clan import clans_list, clan_info, clan_members, clan_wars
from react_api.views.default import home
from react_api.views.player import player_info, player_clan, player_activity
from react_api.views.tournaments import playable_tournaments, refresh_playable_tournaments

urlpatterns = [
    path('home', home, name='home'),
    path('clan/', include([
        path('all', clans_list, name='clans_list'),
        path('<slug:tag>/', include([
            path('', clan_info, name='clan_info'),
            path('members', clan_members, name='clan_members'),
            path('wars', clan_wars, name='clan_wars')
        ]))
    ])),
    path('player/', include([
        path('<slug:tag>/', include([
            path('', player_info, name="player_info"),
            path('clan', player_clan, name="player_clan"),
            path('activity', player_activity, name="player_activity")
        ]))
    ])),
    path('tournaments/', include([
        path('playable/', include([
            path('', playable_tournaments, name="playable_tournaments"),
            path('refresh', refresh_playable_tournaments, name="refresh_playable_tournaments")
        ])),
    ]))
]
