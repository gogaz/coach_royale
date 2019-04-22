from django.contrib import admin

# Register your models here.
from react_api.models import (Clan, ClanHistory, ClanWar,
                              Player, PlayerClanStatsHistory, PlayerStatsHistory, PlayerClanWar,
                              Card, Arena, BattleMode,
                              Tournament, TournamentRefresh)

admin.site.register(Clan)
admin.site.register(ClanHistory)
admin.site.register(ClanWar)

admin.site.register(Player)
admin.site.register(PlayerClanStatsHistory)
admin.site.register(PlayerStatsHistory)
admin.site.register(PlayerClanWar)

admin.site.register(Card)
admin.site.register(Arena)
admin.site.register(BattleMode)

admin.site.register(Tournament)
admin.site.register(TournamentRefresh)
