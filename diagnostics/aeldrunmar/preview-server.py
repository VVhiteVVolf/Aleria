"""Local review server; no browser cache while checking generated assets."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

class ReviewHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

if __name__=='__main__':
    workspace=Path(__file__).resolve().parents[2]
    ThreadingHTTPServer(('127.0.0.1',8896),partial(ReviewHandler,directory=str(workspace))).serve_forever()
