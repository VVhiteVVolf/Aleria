"""Check a localhost listener before importing PyTorch or loading XTTS weights."""
import json
import socket
import urllib.request


def already_running(host, port):
    try:
        with socket.create_connection((host, port), timeout=2):
            pass
    except ConnectionRefusedError:
        return False
    except TimeoutError:
        # Windows may time out instead of refusing connections to an unused port.
        # Confirm that it is free before loading another model.
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as probe:
            if hasattr(socket, 'SO_EXCLUSIVEADDRUSE'):
                probe.setsockopt(socket.SOL_SOCKET, socket.SO_EXCLUSIVEADDRUSE, 1)
            try:
                probe.bind((host, port))
            except OSError as exc:
                raise RuntimeError(
                    f'Port {port} cannot be reached and is not available. '
                    'No process was stopped or second server started.'
                ) from exc
        return False

    url = f'http://{host}:{port}'
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    try:
        with opener.open(url + '/health', timeout=5) as response:
            health = json.load(response)
        with opener.open(url + '/openapi.json', timeout=5) as response:
            api = json.load(response)
        paths = api.get('paths', {})
        compatible = ('/tts_to_audio/' in paths and '/create_and_store_latents' in paths)
        if compatible and health.get('status') == 'healthy' and health.get('model_loaded'):
            print(f'XTTS laeuft bereits und ist bereit: {url}', flush=True)
            print('Diese URL in SkyrimNet verwenden. Keine zweite Instanz gestartet.', flush=True)
            print('Der laufende Server bleibt beim Schliessen dieses Startfensters aktiv.', flush=True)
            return True
    except (OSError, ValueError) as exc:
        raise RuntimeError(
            f'Port {port} is occupied, but the service did not answer the XTTS health check. '
            'It may still be busy. No second model was loaded and no process was stopped. '
            'Retry test_xtts.bat after the current request finishes.'
        ) from exc
    raise RuntimeError(
        f'Port {port} is occupied by a service that is not a ready, compatible XTTS server. '
        'No second instance was started and no process was stopped.'
    )
