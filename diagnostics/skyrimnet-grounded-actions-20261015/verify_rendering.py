"""Render through the running game without generating speech or game actions."""
from pathlib import Path
import json
from local_api import request

ROOT = Path(__file__).resolve().parent


def main():
    actors = request('/prompts?api=nearby-actors-preview&radius=3000')['actors']
    player = next(a for a in actors if a.get('isPlayer'))
    speaker = next((a for a in actors if a['name'] == 'Balimund'), next(a for a in actors if not a.get('isPlayer')))
    grounding_path = 'submodules/user_final_instructions/0730_grounded_tasks.prompt'
    rubric_path = 'submodules/user_final_instructions/0750_embedded_actions.prompt'
    from urllib.parse import urlencode
    grounding = request('/prompts?' + urlencode({'api': 'get', 'path': grounding_path}))['content']
    rubric = request('/prompts?' + urlencode({'api': 'get', 'path': rubric_path}))['content']
    # The editor preview does not seed eligible_actions in its root context.
    # exists("...") checks that root, not local {% set %} bindings. For this
    # fixture only, replace that existence guard with the actual fixture list's
    # length check. Production content is neither rewritten nor weakened.
    assert rubric.count('{% if exists("eligible_actions") %}') == 1
    rubric_fixture = rubric.replace('{% if exists("eligible_actions") %}', '{% if length(eligible_actions) > 0 %}')
    rubric_probe = ('{% set render_mode = "full" %}\n'
                    '{% set embed_actions_in_dialogue = true %}\n'
                    '{% set eligible_actions = [{"name": "Items", "description": "Category: Give an item as a gift or loan without an agreed sale price", "parameterSchema": {"intent": "Immediate operation, item, quantity, sender and recipient"}}, {"name": "Economy", "description": "Category: Sell an item at an agreed price in one transaction, or move gold", "parameterSchema": {"intent": "Immediate operation, exact item, quantity, seller, buyer and agreed price"}}] %}\n'
                    + rubric_fixture)
    contexts = [
        ('dialogue_grounding', {'content': '{% set render_mode = "full" %}\n' + grounding,
                               'templatePath': grounding_path}),
        ('dialogue_action_rubric', {'content': rubric_probe, 'templatePath': rubric_path}),
        ('action_profile', {'content': '{{ render_character_profile("action", npc.UUID) }}',
                            'templatePath': 'native_action_selector_drilldown.prompt'}),
    ]
    receipt = []
    for name, body in contexts:
        result = request('/prompts?api=render-template-preview',
                         {**body, 'actorUUID': speaker['uuid'], 'responseTargetUUID': player['uuid']},
                         method='POST', timeout=45)
        (ROOT / (name + '.render.json')).write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding='utf8')
        content = result.get('renderedContent', '')
        (ROOT / (name + '.render.txt')).write_text(content, encoding='utf8')
        checks = {'request_success': result.get('success'), 'no_template_error': not result.get('error')}
        if name == 'dialogue_grounding':
            checks['grounded_tasks_in_loaded_dialogue_module'] = '## Grounded Tasks and Transfers' in content
        elif name == 'dialogue_action_rubric':
            checks['sale_routing_in_loaded_action_rubric'] = 'A sale at an agreed price is one Economy transaction' in content
            checks['no_false_completion_rule'] = 'a hand-over, payment, trip or lesson already in the conversation is done' not in content
        else:
            checks['validation_in_real_action_profile'] = '## Validate the Operation Before Selecting It' in content
            checks['existing_commitment_rules_preserved'] = '## Acting Now, or Only Talking' in content
        receipt.append({'case': name, 'speaker': speaker['name'], 'checks': checks, 'warning': result.get('warning'),
                        'fixture_only_eligibility_guard': name == 'dialogue_action_rubric'})
        print(json.dumps(receipt[-1]))
    (ROOT / 'render-verification.json').write_text(json.dumps(receipt, indent=2), encoding='utf8')
    assert all(all(r['checks'].values()) for r in receipt), 'Inspect the captured renders'


if __name__ == '__main__':
    main()
