from django.contrib import admin
from django.urls import path, include

from react_api.views.clan import clans_list, clan_info, clan_members
from react_api.views.default import home
from react_api.views.player import player_info, player_clan

urlpatterns = [
    path('home', home),
    path('clan/', include([
        path('all', clans_list, name='clans_list'),
        path('<slug:tag>/', include([
            path('', clan_info, name='clan_info'),
            path('members', clan_members, name='clan_members')
        ]))
    ])),
    path('player/', include([
        path('<slug:tag>/', include([
            path('', player_info),
            path('clan', player_clan)
        ]))
    ]))
]
