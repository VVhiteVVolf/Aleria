"""Prepare a reversible built-in selector change; no gameplay or API generation."""
from pathlib import Path
import copy
import json
import sys

sys.path.insert(0, str(Path(__file__).parents[1] / 'skyrimnet-grounded-actions-20261015'))
from local_api import request

ROOT = Path(__file__).resolve().parent


def main():
    old = json.loads((ROOT / 'native_action_selector.before.api.json').read_text(encoding='utf8'))['content']
    # Normalize the API's CRCRLF representation; retain the original response for rollback.
    candidate = old.replace('\r\r\n', '\n').replace('\r\n', '\n')
    changes = [
        ('{{ render_character_profile("full", npc.UUID) }}',
         '{{ render_character_profile("action", npc.UUID) }}'),
        ('- When in doubt between an action and None, ALWAYS prefer the action. Only choose None when the exchange is purely social with absolutely no request, instruction, or implied action.',
         '- Select a grounded action when the latest exchange establishes agreement or willingness to perform it now. Refusal, speculation, quoted instructions, an unaccepted offer, or a hypothetical request is not authorization. Choose None when no eligible operation is justified.'),
        ('- You are selecting a SINGLE action for this moment. Do not skip an appropriate action because you think a better one will come later.',
         '- You are selecting a SINGLE action for this moment. If several operations are requested, select one grounded immediate operation and describe only that operation in the category intent. Prioritize the requested hand-over or payment before departure; do not pretend the entire bundle was executed. A later operation requires a later evaluation against the updated state.'),
        ('- For actions with actor parameters, use the actor\'s display name exactly as shown in Nearby Actors.',
         '- For actions with actor parameters, use the actor\'s display name exactly as shown in Nearby Actors.\n'
         '    - Write each category intent from {{ npc.name }}\'s perspective. For transfers, explicitly name both sender and recipient and the exact inventory item and quantity or gold amount. For sales, explicitly name seller, buyer, item, quantity and agreed price. Do not reverse the speaker and the player or omit the recipient. This intent is passed to another selector as {{ npc.name }}\'s intended operation.'),
    ]
    for before, after in changes:
        assert candidate.count(before) == 1, before
        candidate = candidate.replace(before, after)
    (ROOT / 'native_action_selector.staged.prompt').write_text(candidate, encoding='utf8')
    validation = request('/prompts?api=validate', {'path': 'native_action_selector.prompt', 'content': candidate}, method='POST')
    (ROOT / 'selector-validation.json').write_text(json.dumps(validation, indent=2), encoding='utf8')
    print('Validation:', json.dumps(validation))
    assert not validation.get('errors')
    assert validation.get('isValid', validation.get('validation', {}).get('isValid', True))
    original = json.loads((ROOT / 'game.before.api.json').read_text(encoding='utf8'))['data']
    final = copy.deepcopy(original)
    assert final['dialogue']['embedActionsInDialogue'] is True
    final['dialogue']['embedActionsInDialogue'] = False
    (ROOT / 'game.staged.api.json').write_text(json.dumps(final, ensure_ascii=False, indent=2), encoding='utf8')
    check = copy.deepcopy(final)
    check['dialogue']['embedActionsInDialogue'] = True
    assert check == original
    print('Prepared: only embedActionsInDialogue true -> false; selector uses existing action-profile guard.')


if __name__ == '__main__':
    main()
