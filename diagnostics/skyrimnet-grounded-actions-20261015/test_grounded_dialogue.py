"""Synthetic dialogue checks, using the unchanged live DeepSeek route."""
from pathlib import Path
import json
import re
import sys
from datetime import datetime, timezone
from local_api import request

ROOT = Path(__file__).resolve().parent


def main():
    text = (ROOT / 'staged/submodules/user_final_instructions/0730_grounded_tasks.prompt').read_text(encoding='utf8')
    rules = '\n'.join(text.splitlines()[2:-2])
    assert '{{' not in rules and '{%' not in rules
    format_rule = (ROOT / 'dialogue_action_rubric.render.txt').read_text(encoding='utf8')
    # This rendered fixture contains only our public synthetic action schema
    # and the user's action rubric, with no game history or character profile.
    format_rule = format_rule.replace('Alawen', 'Player')
    assert 'Economy' in format_rule and 'Category: Sell an item' in format_rule
    cases = [
        ('missing_delivery_parcel',
         'You are an ordinary tailor. Inventory: Iron Sword x1, Leather Boots x1. No robes, parcels, client records, or delivery quest are present. '
         'No quest dialogue branches or task-creation actions are available. Eligible categories: Items, Economy. '
         'Earlier you incorrectly claimed to have packaged enchanted robes for a client in Windhelm. '
         'Player now: Please give me that parcel so I can start the delivery.'),
        ('accepted_priced_sale',
         'You are an ordinary merchant.\n## Merchant Inventory\n- Backpack, Brown Fur: 1 (180 gold)\nPlayer has 1000 gold. '
         'Eligible categories: Items, Economy. Earlier the player declined, but you then agreed a price of 180 gold for one Backpack, Brown Fur. '
         'No payment or item transfer has happened yet. Player now: I accept the 180 gold price; let us complete the purchase now.'),
        ('current_question_after_trade',
         'You are a merchant whose wife is Drifa. Confirmed result: The previous backpack sale was completed, Player received the item and paid 180 gold. '
         'Eligible categories: Items, Economy. There is no new transaction or request to move money or items. '
         'Player now: How is your wife Drifa?'),
    ]
    results = []
    for name, context in cases:
        if len(sys.argv) > 1 and name != sys.argv[1]:
            continue
        prompt = ('Isolated synthetic dialogue test. Do not execute game actions. Speak as the merchant in English, at most 120 words.\n'
                  + rules + '\n' + format_rule + '\n' + context)
        data = request('/test?api=llm', {'variant': '', 'prompt': prompt}, method='POST', timeout=50)
        assert len(data.get('variants', [])) == 1
        result = data['variants'][0]
        payload = result.get('request', {})
        assert payload.get('model') == 'deepseek/deepseek-v4-flash-0731'
        response = result.get('response') or ''
        actions = re.findall(r'^ACTION:\s*(\w+)(?:\s+PARAMS:\s*(\{[^\n]*\}))?', response, re.M)
        if name == 'missing_delivery_parcel':
            passed = not actions and bool(re.search(r"don.t have|do not have|no .*robes|no .*parcel|not .*stock|haven.t|mistake|misspoke|incorrect|apolog|sorry", response, re.I))
        elif name == 'accepted_priced_sale':
            params = json.loads(actions[0][1]) if len(actions) == 1 and actions[0][1] else {}
            intent = params.get('intent', '')
            passed = len(actions) == 1 and actions[0][0] == 'Economy' and list(params) == ['intent'] and '180' in intent and 'Backpack, Brown Fur' in intent
        else:
            passed = not actions and bool(re.search(r'Drifa|my wife|she|her', response, re.I))
        row = {'case': name, 'heuristic_pass': bool(result.get('success') and passed), 'response': response, 'api_result': data}
        results.append(row)
        with (ROOT / 'dialogue-attempt-history.jsonl').open('a', encoding='utf8') as history:
            history.write(json.dumps({'time_utc': datetime.now(timezone.utc).isoformat(), 'prompt': prompt, **row}) + '\n')
        output = ('synthetic-dialogue-' + sys.argv[1] + '.json') if len(sys.argv) > 1 else 'synthetic-dialogue-tests.json'
        (ROOT / output).write_text(json.dumps(results, indent=2), encoding='utf8')
        print(json.dumps({k: row[k] for k in ('case', 'heuristic_pass', 'response')}), flush=True)
    assert all(r['heuristic_pass'] for r in results), 'Manually inspect the captured replies'


if __name__ == '__main__':
    main()
