from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from backend.models import PlayerCube, Clan
from ..models import PlayerClanRuleGoal
from ..serializers import PlayerClanRuleSerializer, PlayerClanRuleGoalSerializer


@api_view(['GET'])
def index(request, tag):
    try:
        Clan.objects.get(tag=tag)
    except Clan.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    PlayerCube.refresh_view()

    return Response([
        {
            **PlayerClanRuleGoalSerializer(goal).data,
            'rules': PlayerClanRuleSerializer(goal.get_rules(), many=True).data,
            'matching_players': goal.execute_on(PlayerCube.objects.all()).values()
        } for goal in PlayerClanRuleGoal.objects.filter(clan__tag=tag)
    ])
