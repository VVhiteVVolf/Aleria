"""Launch the pinned SkyrimNet XTTS API with CPU-only, workspace-local settings."""
from pathlib import Path
import json
import os
import runpy
import sys
import traceback
from server_status import already_running

ROOT = Path(__file__).resolve().parents[1]

def main():
    settings = json.loads((ROOT / 'config/server.json').read_text())
    if settings['device'] != 'cpu' or settings['host'] != '127.0.0.1':
        raise ValueError('This installation requires CPU mode and localhost binding.')
    if already_running(settings['host'], settings['port']):
        return
    paths = {
        'TEMP': 'cache/tmp', 'TMP': 'cache/tmp', 'HF_HOME': 'cache/huggingface',
        'TORCH_HOME': 'cache/torch', 'NUMBA_CACHE_DIR': 'cache/numba',
        'XDG_CACHE_HOME': 'cache', 'TTS_HOME': 'models',
        'XTTS_MODEL_DIR': 'models/xtts-v2', 'XTTS_LATENTS_DIR': 'cache/latents',
        'XTTS_VOICES_DIR': 'voices', 'XTTS_OUTPUT_DIR': 'output',
    }
    for key, value in paths.items():
        destination = ROOT / value
        destination.mkdir(parents=True, exist_ok=True)
        os.environ[key] = str(destination)
    os.environ.update({
        'XTTS_LANGUAGE': settings['language'],
        'CUDA_VISIBLE_DEVICES': '', 'HF_HUB_OFFLINE': '1',
        'TRANSFORMERS_OFFLINE': '1', 'HF_HUB_DISABLE_TELEMETRY': '1',
        'OMP_NUM_THREADS': str(settings['threads']),
        'MKL_NUM_THREADS': str(settings['threads']),
        'TOKENIZERS_PARALLELISM': 'false', 'PYTHONUTF8': '1',
    })
    os.chdir(ROOT)
    import torch
    if torch.version.cuda is not None or torch.cuda.is_available():
        raise RuntimeError('Expected a CPU-only PyTorch installation.')
    torch.set_num_threads(settings['threads'])
    torch.set_num_interop_threads(1)
    print(f'XTTS CPU server: http://{settings["host"]}:{settings["port"]}', flush=True)
    print(f'PyTorch {torch.__version__}; CUDA={torch.version.cuda}; threads={torch.get_num_threads()}', flush=True)
    source = ROOT / 'upstream/skyrimnet-xtts'
    sys.path.insert(0, str(source))
    from shared_app_utils import setup_application_logging
    setup_application_logging(log_to_file=True, log_file_path=str(ROOT / 'logs/server.log'))
    sys.argv = [str(source / 'skyrimnet_api.py'), '--use_cpu',
                '--server', settings['host'], '--port', str(settings['port'])]
    runpy.run_path(sys.argv[0], run_name='__main__')

if __name__ == '__main__':
    try:
        main()
    except Exception:
        details = traceback.format_exc()
        (ROOT / 'logs/startup-error.log').write_text(details, encoding='utf-8')
        print(details, file=sys.stderr)
        sys.exit(1)
