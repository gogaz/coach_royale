import unittest
from io import StringIO

from clashroyale.errors import NotResponding

from react_api.helpers.api.helpers import command_print, run_refresh_method


class HelpersTestCase(unittest.TestCase):
    def setUp(self):
        self.stdout = StringIO()
        self.stderr = StringIO()

    def _get_stream(self, stream):
        value = getattr(self, stream).getvalue().strip()
        getattr(self, stream).truncate(0)
        return value

    def test_command_print(self):
        command_print(self, "True is %s and False is %s", True, False)
        output = self._get_stream('stdout')
        self.assertEqual(output, "True is True and False is ???")

    def test_run_refresh_method(self):
        output = []
        func = lambda _, __, x: output.append('success')
        run_refresh_method(None, None, func, [0])
        self.assertIn('success', output, 1)

        options = {'verbose': True}
        func = lambda _, __, x: self.assertEqual(x, 42)
        run_refresh_method(self, options, func, [42])

        # test not responding
        func = lambda x, y, z: (_ for _ in ()).throw(NotResponding)
        run_refresh_method(self, options, func, [42])
        output = self._get_stream('stderr')
        self.assertNotEqual('', output)

        options.update(clan="a")
        options.update(player="b")
        func = lambda _, __, x: self.assertEqual(True, x.refresh)
        run_refresh_method(self, options, func, [None, None])

    # TODO: def test_store_battle_players(self):