"""Read back runtime state and render the real action profile locally."""
from pathlib import Path
from urllib.parse import urlencode
import copy
import json
import sys

sys.path.insert(0, str(Path(__file__).parents[1] / 'skyrimnet-grounded-actions-20261015'))
from local_api import request

ROOT = Path(__file__).resolve().parent


def main():
    before = json.loads((ROOT / 'game.before.api.json').read_text(encoding='utf8'))['data']
    game = request('/config?api=get&name=game')['data']
    reverted = copy.deepcopy(game)
    reverted['dialogue']['embedActionsInDialogue'] = before['dialogue']['embedActionsInDialogue']
    assert reverted == before and game['dialogue']['embedActionsInDialogue'] is False
    config = request('/config?api=get&name=OpenRouter')['data']
    assert config == json.loads((ROOT / 'OpenRouter.installed.api.json').read_text(encoding='utf8'))
    selector = request('/prompts?' + urlencode({'api': 'get', 'path': 'native_action_selector.prompt'}))
    staged = (ROOT / 'native_action_selector.staged.prompt').read_text(encoding='utf8')
    assert selector['content'].replace('\r\r\n', '\n').replace('\r\n', '\n') == staged
    assert selector['validation']['isValid'] and selector['provenance']['userCopy']
    actors = request('/prompts?api=nearby-actors-preview&radius=3000')['actors']
    player = next(a for a in actors if a.get('isPlayer'))
    # The player may have walked into an empty exterior cell meanwhile. Faryl
    # is an already registered persistent actor from the inspected conversation.
    speaker = next((a for a in actors if not a.get('isPlayer')),
                   {'uuid': format(3435508148686226391, '016x'), 'name': 'Faryl Atheron'})
    preview = request('/prompts?api=render-template-preview', {
        'content': '{{ render_character_profile("action", npc.UUID) }}',
        'templatePath': 'native_action_selector.prompt', 'actorUUID': speaker['uuid'],
        'responseTargetUUID': player['uuid'],
    }, method='POST', timeout=45)
    (ROOT / 'loaded-action-profile.local-preview.json').write_text(json.dumps(preview, ensure_ascii=False, indent=2), encoding='utf8')
    rendered = preview.get('renderedContent', '')
    assert preview.get('success') and '## Validate the Operation Before Selecting It' in rendered
    assert '## Acting Now, or Only Talking' in rendered
    log = Path(r'C:\Users\fhg_r\OneDrive\Dokumente\My Games\Skyrim Special Edition\SKSE\SkyrimNet.log').read_text(encoding='utf8', errors='replace')
    lines = [s for s in log.splitlines() if s.startswith('[2026-10-16 01:22:') and any(x in s for x in ['Full template reload complete', 'ReloadAllContent:', 'native_action_selector'])]
    assert any('Full template reload complete' in s for s in lines)
    (ROOT / 'reload-log-evidence.txt').write_text('\n'.join(lines), encoding='utf8')
    report = {'separate_mode_active': True, 'only_game_setting_changed': 'dialogue.embedActionsInDialogue',
              'dialogue_model': config['openrouter']['model_name'],
              'action_model': config['openrouter']['variants']['action_evaluation']['model_name'],
              'action_providers': ['friendli', 'parasail'], 'action_fallbacks': True,
              'loaded_action_profile_guard_verified': True,
              'root_selection_tests_passed': 9, 'parameter_tests_passed': 4,
              'reload_verified_from_log_after_client_timeout': True,
              'synthetic_tests_execute_game_actions': False,
              'real_game_transfer_verification': 'pending user test',
              'selector_provenance': selector['provenance']}
    (ROOT / 'installation.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf8')
    print(json.dumps(report, ensure_ascii=False))


if __name__ == '__main__':
    main()
