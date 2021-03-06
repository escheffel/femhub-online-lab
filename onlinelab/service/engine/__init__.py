"""Common tools for Python-managed engines. """

import os
import sys
from SimpleXMLRPCServer import SimpleXMLRPCServer

from utils.outputtrap import OutputTrap
from utils.interpreter import Interpreter

class EngineXMLRPCMethods(object):
    """Translation layer between engine API and an interpreter. """

    def __init__(self, interpreter):
        self.interpreter = interpreter

    def complete(self, source):
        """Complete a piece of source code. """
        return self.interpreter.complete(source)

    def evaluate(self, source):
        """Evaluate a piece of source code. """
        return self.interpreter.evaluate(source)

class EngineXMLRPCServer(SimpleXMLRPCServer):
    """XML-RPC server for handling requests from a service. """

    _methods = EngineXMLRPCMethods

    def __init__(self, port, interpreter):
        address = ('localhost', port)

        SimpleXMLRPCServer.__init__(self, address,
            logRequests=False, allow_none=True)

        self.register_instance(self._methods(interpreter))
        self.register_introspection_functions()

    def serve_forever(self, interactive=False):
        """Indefinitely serve XML RPC requests. """
        sys.stdout.flush()

        while True:
            try:
                self.handle_request()
            except KeyboardInterrupt:
                # Note that we use SIGINT for interrupting evaluation in the
                # underlying interpreter instance, so in 'interactive' mode
                # you will need to send two SIGINTs to the process (one to
                # interrupt currently evaluating code and one to stop the
                # RPC server) to terminate it.
                if interactive:
                    print "\nTerminated (interactive mode)"
                    break

class Engine(object):
    """Base class for Python-managed engines. """

    _transport = EngineXMLRPCServer
    _interpreter = None

    def __init__(self, interpreter=None):
        if interpreter is None:
            self.interpreter = self._interpreter()
        else:
            self.interpreter = interpreter

    def notify_ready(self):
        """Notify a service that an engine is running. """
        sys.stdout.write('OK (pid=%s)\n' % os.getpid())

    def run(self, port, interactive=False):
        """Run a Python engine on the given port. """
        server = self._transport(port, self.interpreter)
        self.notify_ready()
        server.serve_forever(interactive)

