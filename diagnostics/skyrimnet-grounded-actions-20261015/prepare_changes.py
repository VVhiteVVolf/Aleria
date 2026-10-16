"""Capture originals, stage isolated changes, and validate through SkyrimNet."""
from pathlib import Path
from urllib.parse import urlencode
import copy
import difflib
import hashlib
import json
import yaml
from local_api import request

ROOT = Path(__file__).resolve().parent
RUNTIME = Path(r'E:\Nolvus\Instances\Nolvus Awakening\MODS\mods\SkyrimNet - Beta25 Test Runtime 20260927\SKSE\Plugins\SkyrimNet')
PROMPTS = (
    'submodules/user_final_instructions/0730_grounded_tasks.prompt',
    'submodules/character_bio/0014_grounded_action_validation.prompt',
    'submodules/user_final_instructions/0750_embedded_actions.prompt',
)


def sha(content):
    return hashlib.sha256(content).hexdigest()


def main():
    backup = ROOT / 'backup'
    backup.mkdir(exist_ok=False)
    before = request('/config?api=get&name=OpenRouter')['data']
    (backup / 'OpenRouter.api.json').write_text(json.dumps(before, indent=2), encoding='utf8')
    raw = (RUNTIME / 'config/OpenRouter.yaml').read_bytes()
    (backup / 'OpenRouter.yaml').write_bytes(raw)
    disk = yaml.safe_load(raw)
    assert before['openrouter']['api_key'] == disk['openrouter']['api_key']
    assert before['openrouter']['model_name'] == 'deepseek/deepseek-v4-flash-0731'
    after = copy.deepcopy(before)
    action = after['openrouter']['variants']['action_evaluation']
    assert action['model_name'].split(',')[0].strip() == 'google/gemma-4-31b-it'
    action['model_name'] = 'google/gemma-4-31b-it'
    action['default_params']['temperature'] = 0.2
    slot = copy.deepcopy(action['model_params'][0])
    slot.update(provider_id='openrouter', temperature=0.2)
    settings = copy.deepcopy(before['openrouter'].get('provider_settings') or {})
    settings.setdefault('provider', {}).update(only=['friendli'], allow_fallbacks=False)
    slot['provider_settings'] = settings
    action['model_params'] = [slot]
    assert after['openrouter']['model_name'] == before['openrouter']['model_name']
    check = copy.deepcopy(after)
    check['openrouter']['variants']['action_evaluation'] = before['openrouter']['variants']['action_evaluation']
    assert check == before, 'Change escaped action_evaluation'
    (ROOT / 'OpenRouter.staged.json').write_text(json.dumps(after, indent=2), encoding='utf8')
    plan = {'live_config_sha256': sha(raw), 'prompts': [], 'unchanged': {}}
    for rel in PROMPTS:
        path = RUNTIME / 'overlay/prompts' / rel
        exists = path.exists()
        current = request('/prompts?' + urlencode({'api': 'get', 'path': rel})) if exists else None
        if exists:
            original = path.read_bytes()
            dest = backup / 'prompts' / rel
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(original)
            assert current['content'].replace('\r\n', '\n') == original.decode('utf-8-sig').replace('\r\n', '\n')
        if rel.endswith('0750_embedded_actions.prompt'):
            text = current['content'].replace('\r\n', '\n')
            old = '- Do not repeat what already happened: a hand-over, payment, trip or lesson already in the conversation is done.'
            new = '- Do not repeat an action whose success is confirmed by recorded results or current state, unless a genuinely new transaction was explicitly agreed. A promise, a spoken claim, a queued request, or a failed action is not proof of completion; address the latest result before deciding whether a corrected attempt is appropriate.'
            assert text.count(old) == 1
            text = text.replace(old, new)
            anchor = '**Available Actions:**'
            extra = ('- A sale at an agreed price is one Economy transaction, not an Items gift. Preserve the exact item, quantity, seller, buyer, and price in the intent. Do not append a second Items action for the same sale.\n'
                     '- For a category, include a concrete intent describing the immediate operation. Do not select Travel merely to decorate a farewell: specify the actual cancellation or destination when supported by the eligible actions and current task state.\n\n')
            assert text.count(anchor) == 1
            text = text.replace(anchor, extra + anchor)
            dest = ROOT / 'staged' / rel
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_text(text, encoding='utf8')
        else:
            assert not exists, 'Do not overwrite an unexpected existing module'
            text = (ROOT / 'staged' / rel).read_text(encoding='utf8')
        validation = request('/prompts?api=validate', {'path': rel, 'content': text})
        assert validation.get('isValid') and not validation.get('errors'), validation
        (ROOT / 'staged' / (Path(rel).name + '.validation.json')).write_text(json.dumps(validation, indent=2), encoding='utf8')
        diff = ''.join(difflib.unified_diff((current['content'] if current else '').splitlines(True), text.splitlines(True), fromfile=rel + '.before', tofile=rel + '.after'))
        (ROOT / 'staged' / (Path(rel).name + '.diff')).write_text(diff, encoding='utf8')
        plan['prompts'].append({'path': rel, 'existed': exists, 'before_sha256': sha(path.read_bytes()) if exists else None,
                                'after_sha256': sha(text.encode('utf8'))})
    for rel in ('overlay/prompts/submodules/system_head/0010_setting.prompt',
                'overlay/prompts/submodules/guidelines/0500_roleplay_guidelines.prompt'):
        plan['unchanged'][rel] = sha((RUNTIME / rel).read_bytes())
    (ROOT / 'plan.json').write_text(json.dumps(plan, indent=2), encoding='utf8')
    print(json.dumps({'staged_prompts': len(PROMPTS), 'validation_errors': 0,
                      'dialogue_model': after['openrouter']['model_name'],
                      'action_model': action['model_name'], 'action_temperature': 0.2,
                      'action_provider_only': ['friendli'], 'backup': str(backup)}))


if __name__ == '__main__':
    main()
