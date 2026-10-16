"""Restrict memory JSON requests to verified schema-capable Qwen endpoints."""
from pathlib import Path
import copy
import json
import sys
import os
import subprocess
import yaml
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / 'skyrimnet-grounded-actions-20261015'))
from local_api import request
from repair_content_and_memory import RUNTIME

ROOT = Path(__file__).resolve().parent


def main():
    expected = json.loads((ROOT / 'OpenRouter.staged.api.json').read_text(encoding='utf8'))
    offline = '--offline' in sys.argv
    stage_only = '--stage-only' in sys.argv
    path = RUNTIME / 'config/OpenRouter.yaml'
    if stage_only:
        before = expected
    elif offline:
        process = subprocess.run(['tasklist', '/FI', 'IMAGENAME eq SkyrimSE.exe', '/FO', 'CSV', '/NH'], capture_output=True, text=True, check=True)
        assert 'skyrimse.exe' not in process.stdout.casefold(), 'Skyrim restarted; use the live API instead'
        raw = path.read_bytes()
        before = yaml.safe_load(raw)
        assert before == {k: v for k, v in expected.items() if k != 'active_variants'}
    else:
        before = request('/config?api=get&name=OpenRouter')['data']
        assert before == expected
    after = copy.deepcopy(before)
    slot = after['openrouter']['variants']['memory']['model_params'][0]
    provider = slot['provider_settings']['provider']
    assert provider.pop('require_parameters') is True
    provider['only'] = ['deepinfra', 'parasail', 'gmicloud', 'nebius', 'venice']
    metadata = json.loads((ROOT / 'qwen-endpoints.json').read_text(encoding='utf8'))
    for slug in provider['only']:
        endpoints = [e for e in metadata['data']['endpoints'] if e['tag'].split('/')[0] == slug]
        assert endpoints and all('structured_outputs' in e['supported_parameters'] for e in endpoints)
    if stage_only:
        (ROOT / 'OpenRouter.final-planned.api.json').write_text(json.dumps(after, indent=2), encoding='utf8')
        print(json.dumps({'candidate_prepared': True, 'live_configuration_unchanged': True}))
        return
    if offline:
        serialized = yaml.safe_dump(after, sort_keys=False, allow_unicode=True).encode('utf8')
        assert yaml.safe_load(serialized) == after
        (ROOT / 'backup/OpenRouter.pre-final.yaml').write_bytes(raw)
        assert path.read_bytes() == raw
        process = subprocess.run(['tasklist', '/FI', 'IMAGENAME eq SkyrimSE.exe', '/FO', 'CSV', '/NH'], capture_output=True, text=True, check=True)
        assert 'skyrimse.exe' not in process.stdout.casefold()
        temporary = path.with_suffix('.memory-json.tmp')
        with temporary.open('xb') as stream:
            stream.write(serialized)
            stream.flush()
            os.fsync(stream.fileno())
        assert path.read_bytes() == raw
        os.replace(temporary, path)
        actual = yaml.safe_load(path.read_bytes())
        assert actual == after
    else:
        response = request('/config?api=update', {'name': 'OpenRouter', 'data': after}, method='POST')
        assert response.get('success')
        actual = request('/config?api=get&name=OpenRouter')['data']
        assert actual == after
    (ROOT / 'OpenRouter.final.api.json').write_text(json.dumps(actual, indent=2), encoding='utf8')
    print(json.dumps({'memory_model_unchanged': actual['openrouter']['variants']['memory']['model_name'],
                      'json_schema_preserved': slot['provider_settings']['response_format']['type'],
                      'schema_capable_provider_only': provider['only']}))


if __name__ == '__main__':
    main()
