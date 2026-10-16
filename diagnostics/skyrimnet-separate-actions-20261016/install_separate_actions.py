"""Install through SkyrimNet's supported API with preflight and readback checks."""
from pathlib import Path
from urllib.parse import urlencode
import copy
import hashlib
import json
import shutil
import sys

sys.path.insert(0, str(Path(__file__).parents[1] / 'skyrimnet-grounded-actions-20261015'))
from local_api import request

ROOT = Path(__file__).resolve().parent
RUNTIME = Path(r'E:\Nolvus\Instances\Nolvus Awakening\MODS\mods\SkyrimNet - Beta25 Test Runtime 20260927\SKSE\Plugins\SkyrimNet')


def save(name, data):
    (ROOT / name).write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf8')


def normalize(text):
    return text.replace('\r\r\n', '\n').replace('\r\n', '\n')


def main():
    if '--routing' in sys.argv:
        before = json.loads((ROOT / 'OpenRouter.before.api.json').read_text(encoding='utf8'))['data']
        assert request('/config?api=get&name=OpenRouter')['data'] == before, 'Concurrent model settings change'
        after = copy.deepcopy(before)
        provider = after['openrouter']['variants']['action_evaluation']['model_params'][0]['provider_settings']['provider']
        provider.update(only=['friendli', 'parasail'], order=['friendli', 'parasail'], allow_fallbacks=True)
        check = copy.deepcopy(after)
        check['openrouter']['variants']['action_evaluation'] = before['openrouter']['variants']['action_evaluation']
        assert check == before, 'Unrelated route change'
        backup = ROOT / 'backup'
        backup.mkdir(exist_ok=True)
        for rel in ['config/OpenRouter.yaml', 'config/SkyrimNet.yaml']:
            dest = backup / Path(rel).name
            assert not dest.exists()
            shutil.copy2(RUNTIME / rel, dest)
        result = request('/config?api=update', {'name': 'OpenRouter', 'data': after}, method='POST')
        assert result.get('success'), result.get('message')
        assert request('/config?api=get&name=OpenRouter')['data'] == after
        save('OpenRouter.installed.api.json', after)
        print('Action route verified: Friendli then Parasail; only these providers; other model settings unchanged.')
        return

    tests = json.loads((ROOT / 'synthetic-root-selector-tests.json').read_text(encoding='utf8'))
    assert len(tests) == 9 and all(t['passed'] for t in tests), 'Tests must pass before enabling separate mode'
    details = json.loads((ROOT / 'synthetic-detail-selector-tests.json').read_text(encoding='utf8'))
    assert len(details) == 4 and all(t['passed'] for t in details), 'Parameter and direction tests must also pass'
    path = 'native_action_selector.prompt'
    current = request('/prompts?' + urlencode({'api': 'get', 'path': path}))
    original = json.loads((ROOT / 'native_action_selector.before.api.json').read_text(encoding='utf8'))
    assert current['content'] == original['content'], 'Concurrent selector change'
    before = json.loads((ROOT / 'game.before.api.json').read_text(encoding='utf8'))['data']
    assert request('/config?api=get&name=game')['data'] == before, 'Concurrent game settings change'
    candidate = (ROOT / 'native_action_selector.staged.prompt').read_text(encoding='utf8')
    # The template already exists in the base layer. Update creates its personal
    # overlay; create correctly rejects the existing template name with 409.
    result = request('/prompts?api=update', {'path': path, 'content': candidate}, method='PUT')
    assert result.get('success'), result
    loaded = request('/prompts?' + urlencode({'api': 'get', 'path': path}))
    assert normalize(loaded['content']) == normalize(candidate)
    assert loaded['validation']['isValid']
    save('selector.installed.api.json', loaded)
    after = copy.deepcopy(before)
    after['dialogue']['embedActionsInDialogue'] = False
    result = request('/config?api=update', {'name': 'game', 'data': after}, method='POST')
    assert result.get('success'), result.get('message')
    assert request('/config?api=get&name=game')['data'] == after
    save('game.installed.api.json', after)
    reloaded = request('/prompts?api=reload', {}, method='POST')
    assert reloaded.get('success'), reloaded
    save('installation.json', {'mode': 'separate', 'embedActionsInDialogue': False,
                             'selector_provenance': loaded['provenance'], 'reload': reloaded,
                             'dialogue_model_unchanged': True, 'memory_route_unchanged': True})
    print('Installed and read back: separate action evaluation enabled; selector overlay validated; registry reloaded.')


if __name__ == '__main__':
    main()
