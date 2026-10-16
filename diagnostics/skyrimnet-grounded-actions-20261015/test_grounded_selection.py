"""Synthetic API tests through the installed action route; no game actions."""
from pathlib import Path
import json
import re
from local_api import request

ROOT = Path(__file__).resolve().parent


def main():
    module = (ROOT / 'staged/submodules/character_bio/0014_grounded_action_validation.prompt').read_text(encoding='utf8')
    rules = '\n'.join(module.splitlines()[1:-1])
    assert '{{' not in rules and '{%' not in rules
    gift = 'GiveItem PARAMS: {"item":"exact inventory name","recipient":"recipient name","count":"positive integer, optional default 1"}'
    sale = 'SellItem PARAMS: {"item":"exact inventory name","buyer":"buyer name","price":"agreed total gold price","count":"positive integer, optional default 1"}'
    cases = [
        {'name': 'existing_item', 'inventory': 'Fine Mage Robes: 1',
         'exchange': 'Player: Please give me your Fine Mage Robes. Merchant: Yes, I will hand them over now.',
         'intent': 'Give Player one Fine Mage Robes now, no payment agreed.', 'eligible': gift,
         'expected': 'GiveItem', 'item': 'Fine Mage Robes'},
        {'name': 'invented_missing_item', 'inventory': 'Iron Sword: 1; Leather Boots: 1',
         'exchange': 'Player: Hand me the packaged enchanted robes. Merchant: The robes are packed and ready.',
         'intent': 'Hand Player the packaged enchanted robes for delivery.', 'eligible': gift,
         'expected': 'None'},
        {'name': 'sale_in_items_category', 'inventory': 'Backpack, Brown Fur: 1',
         'exchange': 'Player: I accept the 180 gold price. Merchant: Agreed, take the pack and I take the coin.',
         'intent': 'Sell Player one Backpack, Brown Fur for 180 gold now.', 'eligible': gift,
         'expected': 'None'},
        {'name': 'sale_in_economy_category', 'inventory': 'Backpack, Brown Fur: 1',
         'exchange': 'Player: I accept the 180 gold price. Merchant: Agreed, take the pack and I take the coin.',
         'intent': 'Sell Player one Backpack, Brown Fur for 180 gold now.', 'eligible': sale,
         'expected': 'SellItem', 'item': 'Backpack, Brown Fur', 'price': 180},
        {'name': 'already_completed_transaction', 'inventory': 'Backpack, Brown Fur: 1',
         'exchange': 'Confirmed results: Player already received the agreed backpack and paid 180 gold. Player: Thank you. Merchant: You are welcome. No new purchase was requested or agreed.',
         'intent': 'Consider whether another action is needed for the completed sale.', 'eligible': sale + '\n' + gift,
         'expected': 'None'},
        {'name': 'explicit_second_purchase', 'inventory': 'Backpack, Brown Fur: 1',
         'exchange': 'Confirmed results: A previous backpack sale was completed and paid. Player: I want to buy a second backpack for another 180 gold. Merchant: Agreed, I will sell you this remaining pack now.',
         'intent': 'A genuinely new sale: sell Player one remaining Backpack, Brown Fur for another 180 gold.', 'eligible': sale,
         'expected': 'SellItem', 'item': 'Backpack, Brown Fur', 'price': 180},
        {'name': 'insufficient_quantity', 'inventory': 'Fine Mage Robes: 1',
         'exchange': 'Player: Give me three Fine Mage Robes; one is not enough. Merchant: I will give you all three now.',
         'intent': 'Give Player three Fine Mage Robes now, without substituting or reducing the quantity.', 'eligible': gift,
         'expected': 'None'},
    ]
    results = []
    byte_ceiling = 0
    for case in cases:
        prompt = ('Isolated synthetic action-selection test. Do not execute anything in the game.\n'
                  'Select one action. Output exactly one ACTION: line with JSON PARAMS when needed, or ACTION: None.\n'
                  + rules + '\n## Merchant Inventory\n' + case['inventory']
                  + '\n## Most Recent Exchange\n' + case['exchange'] + '\n## Intent\n' + case['intent']
                  + '\n## Eligible Actions\n' + case['eligible'] + '\nNone\nRespond now.')
        byte_ceiling += (len(prompt.encode('utf8')) + 256) * 0.15 / 1e6 + 500 * 0.4 / 1e6
        assert byte_ceiling < 0.02
        data = request('/test?api=llm', {'variant': 'action_evaluation', 'prompt': prompt}, method='POST', timeout=45)
        variants = data.get('variants', [])
        assert len(variants) == 1
        result = variants[0]
        payload = result.get('request', {})
        assert payload.get('model') == 'google/gemma-4-31b-it'
        assert payload.get('temperature') == 0.2
        assert payload.get('provider', {}).get('only') == ['friendli']
        assert payload.get('provider', {}).get('allow_fallbacks') is False
        response = (result.get('response') or '').strip()
        match = re.fullmatch(r'ACTION:\s*(\w+)(?:\s+PARAMS:\s*(\{.*\}))?', response)
        params = json.loads(match[2]) if match and match[2] else {}
        passed = bool(result.get('success') and match and match[1] == case['expected'])
        if case.get('item'):
            passed = passed and params.get('item') == case['item']
        if case.get('price'):
            passed = passed and params.get('price') == case['price']
        row = {'case': case['name'], 'pass': passed, 'expected': case['expected'],
               'response': response, 'api_result': data}
        results.append(row)
        (ROOT / 'synthetic-action-tests.json').write_text(json.dumps(results, indent=2), encoding='utf8')
        print(json.dumps({k: row[k] for k in ('case', 'pass', 'response')}), flush=True)
    summary = {'tests': len(results), 'passed': sum(r['pass'] for r in results),
               'conservative_cost_ceiling_usd': byte_ceiling, 'private_game_context_exported': False,
               'game_actions_executed': False}
    (ROOT / 'synthetic-test-summary.json').write_text(json.dumps(summary, indent=2), encoding='utf8')
    print(json.dumps(summary), flush=True)
    assert all(r['pass'] for r in results), 'Inspect failing synthetic cases'


if __name__ == '__main__':
    main()
