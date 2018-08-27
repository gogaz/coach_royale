from django.contrib import admin
from django.urls import path, include

from front.views.clan import clans_list, clan_infos, clan_members

urlpatterns = [
    path('clan/', include([
        path('all', clans_list),
        path('<slug:tag>/', include([
            path('', clan_infos),
            path('members', clan_members)
        ]))
    ])),
]
