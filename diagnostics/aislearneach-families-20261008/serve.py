from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
class Handler(SimpleHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'
    def log_message(self, *args): pass
ThreadingHTTPServer(('127.0.0.1',4175),partial(Handler,directory='E:/Aleria')).serve_forever()
