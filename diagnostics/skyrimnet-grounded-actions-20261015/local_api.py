"""Small localhost-only client for SkyrimNet configuration and prompt editing."""
import json
import urllib.request

BASE = 'http://127.0.0.1:8080'


def request(path, data=None, method=None, timeout=20):
    if not path.startswith('/') or '://' in path:
        raise ValueError('Only local relative API paths are accepted')
    payload = None if data is None else json.dumps(data).encode('utf8')
    req = urllib.request.Request(BASE + path, data=payload, method=method,
                                 headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=timeout) as response:
        return json.load(response)
