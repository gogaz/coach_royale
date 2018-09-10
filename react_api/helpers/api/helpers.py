import sys

import clashroyale

from react_api.models import Clan, Player, Card


def run_refresh_method(cmd, options, func, iterable, depth=3, **kwargs):
    if depth <= 0:
        return
    failed = []
    for i in iterable:
        if i is None:
            if options['clan']:
                i = Clan(tag=options['clan'])
                options.update(clan=None)
            elif options['player']:
                i = Player(tag=options['player'])
                options.update(player=None)
            else:
                exit_with_failure(cmd)
            i.refresh = True
        try:
            func(cmd, options, i, **kwargs)
        except clashroyale.NotResponding:
            if options['verbose']:
                if isinstance(i, Clan):
                    cmd.stderr.write("#ERROR: Request timed out while fetching data for clan %s (#%s)" % (i.name, i.tag))
                elif isinstance(i, Player):
                    cmd.stderr.write("#ERROR: Request timed out while fetching data for player %s (#%s)" % (i.name, i.tag))
                else:
                    cmd.stderr.write("#ERROR: Request timed out while fetching data for #" + str(i))
            failed.append(i)
        except clashroyale.ServerError:
            pass

    run_refresh_method(cmd, options, func, failed, depth - 1)


def store_battle_players(db_player, team, players, save_decks=True):
    i = 0
    decks = [[], []]
    for p in players:
        if p.tag == db_player.tag:
            db_p = db_player
        else:
            db_p, created = Player.objects.get_or_create(tag=p.tag, defaults={'name': p.name})
        team.add(db_p)
        if save_decks:
            for card in p.deck:
                fc = Card.instance_from_data(card)
                decks[i].append(fc)
        i += 1
    return decks


def exit_with_failure(command):
    command.stderr.write("Please use --help")
    sys.exit(1)


def command_print(command, string: str, *args):
    _args = []
    for i in range(len(args)):
        if not args[i]:
            _args.append('???')
        else:
            _args.append(args[i])
    output = string % tuple(_args)
    command.stdout.write(output)