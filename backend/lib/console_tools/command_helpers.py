import logging
import sys

import clashroyale
from django.db.models import Model

from backend.models import Clan, Player
from backend.models.monitoring import OfficialAPIError


def run_refresh_method(cmd, options, func, iterable, tries=3, **kwargs):
    if tries <= 0:
        return
    failed = []
    for i in iterable:
        if i is None:
            if options['clan']:
                i = Clan(tag=options['clan'], refresh=True)
                options.update(clan=None)
            elif options['player']:
                i = Player(tag=options['player'], refresh=True)
                options.update(player=None)
            else:
                exit_with_failure(cmd)
            i.refresh = True
        try:
            func(cmd, options, i, **kwargs)
        except clashroyale.ServerError as e:
            if tries == 1:
                handle_refresh_error(cmd, e, i, func, verbose=options.get('verbose'))
        except clashroyale.Unauthorized as e:
            handle_refresh_error(cmd, e, i, func, verbose=options.get('verbose'))
        except clashroyale.RequestError as e:
            if isinstance(i, Model):
                failed.append(i)
            elif isinstance(e, clashroyale.NotResponding):
                failed.append(i)
            if tries == 1:
                handle_refresh_error(cmd, e, i, func, verbose=options.get('verbose'))

    run_refresh_method(cmd, options, func, failed, tries - 1, **kwargs)


def handle_refresh_error(cmd, error, record, func, verbose=False):
    if verbose:
        if isinstance(record, Clan):
            cmd.stderr.write("#Error while fetching data for clan #%s" % record.tag)
        elif isinstance(record, Player):
            cmd.stderr.write("#Error while fetching data for player #%s" % record.tag)
        else:
            cmd.stderr.write("#Error while fetching data for #" + str(record))

    OfficialAPIError.create(error, func)


def exit_with_failure(command):
    command.stderr.write("Please use --help")
    sys.exit(1)


def command_print(command, string: str, *args):
    _args = []
    for i in range(len(args)):
        if args[i] is None:
            _args.append('???')
        else:
            _args.append(args[i])
    output = string % tuple(_args)
    command.stdout.write(output)


def create_logger():
    logger = logging.getLogger('clashroyale')
    logger.setLevel(logging.DEBUG)
    handler = logging.FileHandler(filename='clashroyale.log', encoding='utf-8', mode='w')
    handler.setFormatter(logging.Formatter('%(asctime)s:%(levelname)s:%(name)s: %(message)s'))
    logger.addHandler(handler)
