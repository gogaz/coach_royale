from django.urls import path, re_path, include

from backend.views.clan import clans_list, clan_info, clan_members, clan_wars, clan_weekly_season, clan_monthly_season
from backend.views.default import index, manifest
from backend.views.player import player_info, player_activity

urlpatterns = [
    path('', index),
    path('manifest.json', manifest),
    path('api/', include([
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
                path('activity', player_activity, name="player_activity")
            ]))
        ])),
    ])),
    # Fallbacks to the index page and lets React handle the routing
    re_path(r'^(?:.*)/?$', index),
]
