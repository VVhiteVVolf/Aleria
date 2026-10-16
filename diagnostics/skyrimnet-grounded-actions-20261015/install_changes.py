"""Apply staged edits through SkyrimNet, preserving all unrelated configuration."""
from pathlib import Path
from urllib.parse import urlencode
import copy
import hashlib
import json
from local_api import request
from prepare_changes import ROOT, RUNTIME


def sha(content):
    return hashlib.sha256(content).hexdigest()


def main():
    plan = json.loads((ROOT / 'plan.json').read_text(encoding='utf8'))
    before = json.loads((ROOT / 'backup/OpenRouter.api.json').read_text(encoding='utf8'))
    after = json.loads((ROOT / 'OpenRouter.staged.json').read_text(encoding='utf8'))
    assert request('/config?api=get&name=OpenRouter')['data'] == before, 'Live settings changed since preparation'
    assert sha((RUNTIME / 'config/OpenRouter.yaml').read_bytes()) == plan['live_config_sha256']
    for row in plan['prompts']:
        path = RUNTIME / 'overlay/prompts' / row['path']
        assert path.exists() == row['existed']
        if row['existed']:
            assert sha(path.read_bytes()) == row['before_sha256']
    receipt = {'prompts': [], 'configuration_updated': False}
    for row in plan['prompts']:
        rel = row['path']
        content = (ROOT / 'staged' / rel).read_text(encoding='utf8')
        result = request('/prompts?api=' + ('update' if row['existed'] else 'create'),
                         {'path': rel, 'content': content}, method='PUT' if row['existed'] else 'POST')
        assert result.get('success'), {'path': rel, 'message': result.get('message')}
        current = request('/prompts?' + urlencode({'api': 'get', 'path': rel}))
        assert current['content'].replace('\r\n', '\n') == content.replace('\r\n', '\n')
        assert current['validation']['isValid'] and not current['validation'].get('errors')
        receipt['prompts'].append({'path': rel, 'validation': current['validation'], 'provenance': current.get('provenance')})
        (ROOT / 'installation.json').write_text(json.dumps(receipt, indent=2), encoding='utf8')
    assert request('/config?api=get&name=OpenRouter')['data'] == before, 'Concurrent configuration edit detected'
    result = request('/config?api=update', {'name': 'OpenRouter', 'data': after}, method='POST')
    assert result.get('success'), {'message': result.get('message'), 'error': result.get('error')}
    current = request('/config?api=get&name=OpenRouter')['data']
    assert current == after, 'Settings readback differs from staged configuration'
    receipt['configuration_updated'] = True
    (ROOT / 'OpenRouter.installed.json').write_text(json.dumps(current, indent=2), encoding='utf8')
    # Reload the complete prompt registry so the new submodules are enumerated.
    reloaded = request('/prompts?api=reload', {}, method='POST')
    assert reloaded.get('success'), reloaded
    receipt['reload'] = reloaded
    receipt['routing_plan'] = request('/?api=routing-plan&variant=action_evaluation')
    slots = receipt['routing_plan']['slots']
    assert len(slots) == 1 and slots[0]['model'] == 'google/gemma-4-31b-it'
    for rel, digest in plan['unchanged'].items():
        assert sha((RUNTIME / rel).read_bytes()) == digest, rel
    receipt['unchanged_prompt_hashes'] = plan['unchanged']
    receipt['action'] = {'model': current['openrouter']['variants']['action_evaluation']['model_name'],
                         'temperature': 0.2, 'provider_only': ['friendli']}
    receipt['dialogue_model'] = current['openrouter']['model_name']
    (ROOT / 'installation.json').write_text(json.dumps(receipt, indent=2), encoding='utf8')
    print(json.dumps({'prompts_verified': len(receipt['prompts']), 'config_verified': True,
                      'dialogue_model': receipt['dialogue_model'], 'action': receipt['action'],
                      'world_and_roleplay_unchanged': True, 'reload': reloaded}))


if __name__ == '__main__':
    main()
