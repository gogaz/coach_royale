from django.contrib import admin
from django.urls import path, include

from front.views.clan import clans_list, clan_infos

urlpatterns = [
    path('clan/', include([
        path('list', clans_list),
        path('info/<slug:tag>', clan_infos)
    ]))
]