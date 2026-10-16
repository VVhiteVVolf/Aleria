"""Test the staged selector with synthetic fixtures, never execute game actions."""
from pathlib import Path
import json
import re
import sys

sys.path.insert(0, str(Path(__file__).parents[1] / 'skyrimnet-grounded-actions-20261015'))
from local_api import request

ROOT = Path(__file__).resolve().parent


def fixture_content(exchange, inventory, eligible, category=None, intent=''):
    if category is None:
        content = (ROOT / 'native_action_selector.staged.prompt').read_text(encoding='utf8')
    else:
        content = json.loads((ROOT / 'native_action_selector_drilldown.before.api.json').read_text(encoding='utf8'))['content']
        content = content.replace('\r\r\n', '\n').replace('\r\n', '\n')
    rules = json.loads((ROOT / '0014_grounded_action_validation.before.api.json').read_text(encoding='utf8'))['content']
    rules = '\n'.join(rules.splitlines()[1:-1])
    assert '{%' not in rules and '{{' not in rules
    profile = '## Merchant State\n' + inventory + '\n' + rules
    replacements = {
        '{{ render_character_profile("action", npc.UUID) }}': profile,
        'get_recent_events(5, player.UUID)': '[]',
        'get_nearby_npc_list(player.UUID)': '[]',
        '{{ decnpc(player.UUID).name }}': 'Test Player',
        '{{ decnpc(player.UUID).gender }}': 'Female',
        '{{ decnpc(player.UUID).race }}': 'Nord',
    }
    if category is None:
        replacements['{{ render_template("components\\\\event_history_compact") }}'] = exchange
    for before, after in replacements.items():
        assert before in content, before
        content = content.replace(before, after)
    prefix = ('{% set npc = {"name":"Test Merchant","UUID":"synthetic-merchant"} %}\n'
              '{% set player = {"UUID":"synthetic-player"} %}\n'
              '{% set structured_json_actions = false %}\n'
              '{% set location = "Synthetic test room" %}\n'
              '{% set dialogue_response = ' + json.dumps(exchange.split('Merchant:', 1)[-1]) + ' %}\n'
              '{% set category_name = ' + json.dumps(category or '') + ' %}\n'
              '{% set category_intent = ' + json.dumps(intent) + ' %}\n'
              '{% set eligible_actions = ' + json.dumps(eligible) + ' %}\n')
    if category is not None:
        # This is the latest player request in this isolated fixture, not a game event.
        prefix += '{% set category_description = "Synthetic category fixture" %}\n'
        content = content.replace('{% set _player_said = "" %}', '{% set _player_said = ' + json.dumps(exchange.split('Merchant:', 1)[0]) + ' %}')
    return prefix + content


def main():
    actors = request('/prompts?api=nearby-actors-preview&radius=3000')['actors']
    player = next(a for a in actors if a.get('isPlayer'))
    speaker = next(a for a in actors if not a.get('isPlayer'))
    eligible = [
        {'name': 'Items', 'description': 'Category: give an unpriced item to someone now, or take an item offered now.', 'parameterSchema': {}},
        {'name': 'Economy', 'description': 'Category: pay gold now or perform an agreed-price item sale now.', 'parameterSchema': {}},
        {'name': 'Companionship', 'description': 'Category: join, leave, follow again, or wait when agreed now.', 'parameterSchema': {}},
        {'name': 'Travel', 'description': 'Category: leave for a specific destination now, or cancel a task.', 'parameterSchema': {}},
        {'name': 'TriggerDialogueLine', 'description': 'Speak the currently available agreed quest exchange: [1234ABCD] accept the supplied task.', 'parameterSchema': {'form_id': 'an explicitly supplied eight-digit code'}},
    ]
    cases = [
        ('gift_without_footer', 'Test Player: Give me the Silver Onyx Ring now. Merchant: Yes. Take the ring, it is yours.', 'Silver Onyx Ring: 1; gold: 5.', 'Items'),
        ('payment_without_footer', 'Test Player: Pay me the agreed five gold now. Merchant: Agreed, here are your five gold.', 'Silver Onyx Ring: 1; gold: 5.', 'Economy'),
        ('explicit_refusal', 'Test Player: Give me the Silver Onyx Ring. Merchant: No. I refuse to give it to you.', 'Silver Onyx Ring: 1; gold: 5.', 'None'),
        ('already_completed', 'Confirmed result: Test Merchant already gave Test Player the ring successfully. No new transaction. Test Player: Thank you. Merchant: You are welcome.', 'No remaining ring; gold: 5.', 'None'),
        ('hypothetical_only', 'Test Player: If I ever need help, would you consider accompanying me? Merchant: Perhaps someday, but I am staying here now.', 'gold: 5.', 'None'),
        ('agreed_sale', 'Test Player: I accept your price of 30 gold for one Fine Shoes. Merchant: Agreed, I sell you the shoes now for 30 gold.', 'Fine Shoes: 1; gold: 5.', 'Economy'),
        ('missing_item', 'Test Player: Give me a Dragon Crown. Merchant: Here, take the Dragon Crown.', 'Iron Sword: 1; no Dragon Crown; gold: 5.', 'None'),
        ('multiple_operations', 'Test Player: Give me your ring, five gold, and then go home. Merchant: Yes, take the ring and five gold. Then I will go home.', 'Silver Onyx Ring: 1; gold: 5.', ['Items', 'Economy']),
        ('quest_code', 'Test Player: I accept the task you just described. Merchant: Agreed. Here is the task; the available exchange code is [1234ABCD].', 'gold: 5.', 'TriggerDialogueLine'),
    ]
    saved = json.loads((ROOT / 'synthetic-root-selector-tests.json').read_text(encoding='utf8')) if '--reuse-results' in sys.argv else None
    results = []
    for name, exchange, inventory, expected in cases:
        fixture = fixture_content(exchange, inventory, eligible)
        preview = request('/prompts?api=render-template-preview', {
            'content': fixture, 'templatePath': 'native_action_selector.prompt',
            'actorUUID': speaker['uuid'], 'responseTargetUUID': player['uuid'],
        }, method='POST', timeout=45)
        rendered = preview.get('renderedContent', '')
        assert preview.get('success') and not preview.get('error'), preview
        assert 'Test Merchant' in rendered and 'Validate the Operation' in rendered
        assert not any(a['uuid'] in rendered or a['name'] in rendered for a in actors)
        (ROOT / (name + '.fixture-render.txt')).write_text(rendered, encoding='utf8')
        api = next(row['api'] for row in saved if row['case'] == name) if saved else request('/test?api=llm', {'variant': 'action_evaluation', 'prompt': rendered}, method='POST', timeout=45)
        variant = api['variants'][0]
        payload = variant.get('request', {})
        assert payload.get('model') == 'google/gemma-4-31b-it'
        assert payload.get('temperature') == 0.2
        assert payload.get('provider', {}).get('only') == ['friendli', 'parasail']
        assert payload.get('provider', {}).get('allow_fallbacks') is True
        assert payload.get('provider', {}).get('order') == ['friendli', 'parasail']
        response = (variant.get('response') or '').strip()
        match = re.fullmatch(r'ACTION:\s*(\w+)(?:\s+PARAMS:\s*(\{.*\}))?', response)
        params = json.loads(match[2]) if match and match[2] else {}
        allowed = expected if isinstance(expected, list) else [expected]
        passed = bool(variant.get('success') and match and match[1] in allowed)
        if match and match[1] in ['Items', 'Economy', 'Companionship', 'Travel']:
            passed = passed and set(params) == {'intent'} and bool(params['intent'])
            # The speaker is already fixed by the engine; an implicit speaker is
            # acceptable if the transfer direction survives the actual drill-down.
            passed = passed and 'Test Player' in params.get('intent', '')
        if match and match[1] == 'TriggerDialogueLine':
            passed = passed and params.get('form_id') == '1234ABCD'
        row = {'case': name, 'passed': passed, 'response': response, 'expected': expected, 'api': api}
        results.append(row)
        (ROOT / 'synthetic-root-selector-tests.json').write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding='utf8')
        print(json.dumps({k: row[k] for k in ['case', 'passed', 'response']}, ensure_ascii=False), flush=True)
    assert all(row['passed'] for row in results), 'Inspect failed selection tests before installing'
    detail_results = []
    direct = [
        {'name': 'GiveItem', 'description': 'The speaker gives an unpriced inventory item to the named recipient.', 'parameterSchema': {'recipient': 'exact recipient name', 'item': 'exact inventory name', 'count': 'positive integer'}},
        {'name': 'GiveGold', 'description': 'The speaker pays gold to the named recipient.', 'parameterSchema': {'recipient': 'exact recipient name', 'amount': 'positive integer gold'}},
        {'name': 'SellItem', 'description': 'The speaker sells their inventory item to the buyer and collects the agreed price in one transaction.', 'parameterSchema': {'buyer': 'exact buyer name', 'item': 'exact inventory name', 'quantity': 'positive integer', 'totalGold': 'agreed total price'}},
    ]
    for index in [0, 1, 5, 7]:
        name, exchange, inventory, _ = cases[index]
        root_response = results[index]['response']
        category = re.search(r'ACTION:\s*(\w+)', root_response)[1]
        intent = json.loads(root_response.split('PARAMS:', 1)[1])['intent']
        actions = direct[:1] if category == 'Items' else direct[1:]
        fixture = fixture_content(exchange, inventory, actions, category, intent)
        preview = request('/prompts?api=render-template-preview', {'content': fixture, 'templatePath': 'native_action_selector_drilldown.prompt', 'actorUUID': speaker['uuid'], 'responseTargetUUID': player['uuid']}, method='POST', timeout=45)
        assert preview.get('success'), preview
        rendered = preview['renderedContent']
        assert not any(a['uuid'] in rendered or a['name'] in rendered for a in actors)
        api = request('/test?api=llm', {'variant': 'action_evaluation', 'prompt': rendered}, method='POST', timeout=45)
        variant = api['variants'][0]
        response = (variant.get('response') or '').strip()
        match = re.fullmatch(r'ACTION:\s*(\w+)(?:\s+PARAMS:\s*(\{.*\}))?', response)
        params = json.loads(match[2]) if match and match[2] else {}
        expected = 'GiveItem' if category == 'Items' else ('SellItem' if index == 5 else 'GiveGold')
        passed = bool(variant.get('success') and match and match[1] == expected)
        if expected == 'GiveItem':
            passed = passed and params.get('recipient') == 'Test Player' and params.get('item') == 'Silver Onyx Ring' and params.get('count', 1) == 1
        elif expected == 'GiveGold':
            passed = passed and params.get('recipient') == 'Test Player' and params.get('amount') == 5
        else:
            passed = passed and params.get('buyer') == 'Test Player' and params.get('item') == 'Fine Shoes' and params.get('quantity') == 1 and params.get('totalGold') == 30
        row = {'case': name, 'root_response': root_response, 'passed': passed, 'response': response, 'api': api}
        detail_results.append(row)
        (ROOT / 'synthetic-detail-selector-tests.json').write_text(json.dumps(detail_results, ensure_ascii=False, indent=2), encoding='utf8')
        print(json.dumps({k: row[k] for k in ['case', 'passed', 'response']}, ensure_ascii=False), flush=True)
    assert all(row['passed'] for row in detail_results), 'Inspect failed parameter/direction tests'


if __name__ == '__main__':
    main()
