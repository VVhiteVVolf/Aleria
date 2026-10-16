"""Silently retain meaningful journal updates using the built-in trigger system."""
from pathlib import Path
import copy
import hashlib
import json
import re
import shutil
import sys

import yaml

sys.path.insert(0, str(Path(__file__).parents[1] / 'skyrimnet-grounded-actions-20261015'))
from local_api import request

ROOT = Path(__file__).resolve().parent
RUNTIME = Path(r'E:\Nolvus\Instances\Nolvus Awakening\MODS\mods\SkyrimNet - Beta25 Test Runtime 20260927\SKSE\Plugins\SkyrimNet')
NAME = 'local_meaningful_quest_journal'


def save(name, data):
    (ROOT / name).write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf8')


def canonical_events(data):
    result = copy.deepcopy(data)
    result['events'] = sorted(result['events'], key=lambda e: e['event_type'])
    return result


def condition(field, operator, value):
    return {'fieldPath': field, 'operator': operator, 'value': value, 'caseSensitive': True}


def trigger_definition():
    common = [condition('quest', 'regex', r'\S'), condition('objective', 'regex', r'\S'),
              condition('objective', 'not_contains', '<Alias')]
    rules = [
        {'eventType': 'quest_objective_state', 'logicalOperator': 'AND', 'schemaConditions': common + [
            condition('new_state', 'equals', 'Displayed'), condition('old_state', 'not_equals', 'Displayed')]},
        {'eventType': 'quest_objective_state', 'logicalOperator': 'AND', 'schemaConditions': common + [
            condition('old_state', 'equals', 'Displayed'),
            condition('new_state', 'regex', r'^(Completed|CompletedDisplayed|Failed|FailedDisplayed)$')]},
    ]
    return {'name': NAME, 'description': 'Silently retain displayed journal objectives and completion/failure of previously displayed objectives; exclude dormant cleanup and unresolved aliases.',
            'eventCriteria': rules,
            'response': {'type': 'persistent_generic', 'content':
                         'Quest journal update for {{ player_name }}: "{{ event_json.quest }}" — objective "{{ event_json.objective }}" changed from {{ event_json.old_state }} to {{ event_json.new_state }}. This is the player\'s journal state; it does not mean every NPC witnessed or knows it.'},
            'audience': 'player', 'enabled': True, 'interrupt': False,
            'probability': 1.0, 'cooldownSeconds': 0, 'priority': 1}


def matches(definition, event):
    """Offline semantic check; native schema validation is performed separately."""
    def test(c):
        value = event.get(c['fieldPath'], '')
        expected = c['value']
        if c['operator'] == 'equals':
            return value == expected
        if c['operator'] == 'not_equals':
            return value != expected
        if c['operator'] == 'not_contains':
            return expected not in value
        if c['operator'] == 'regex':
            return re.search(expected, value) is not None
        raise ValueError(c['operator'])
    return any(all(test(c) for c in rule['schemaConditions']) for rule in definition['eventCriteria'])


def main():
    definition = trigger_definition()
    text = yaml.safe_dump(definition, allow_unicode=True, sort_keys=False)
    (ROOT / (NAME + '.yaml')).write_text(text, encoding='utf8')
    # The Plugin Hub's validator is dashboard-only (403). The supported local
    # file-editor parser plus the native per-condition validator check this
    # local trigger without changing or bypassing that access restriction.
    native_validation = request('/file-editor?api=parse', {'type': 'trigger', 'content': text}, method='POST')
    save('native-trigger-validation.json', native_validation)
    assert native_validation.get('name') == NAME and native_validation.get('response') == definition['response']
    for actual, expected in zip(native_validation['eventCriteria'], definition['eventCriteria'], strict=True):
        assert actual['eventType'] == expected['eventType'] and actual['schemaConditions'] == expected['schemaConditions']
    validations = []
    for rule in definition['eventCriteria']:
        for c in rule['schemaConditions']:
            result = request('/triggers?api=validate-condition', {'eventType': rule['eventType'], **c}, method='POST')
            assert result.get('valid'), (c, result)
            validations.append({'condition': c, 'result': result})
    save('native-condition-validation.json', validations)
    # All events below are synthetic; none are emitted into the game.
    cases = [('new_visible', 'Dormant', 'Displayed', True),
             ('completed_visible', 'Displayed', 'CompletedDisplayed', True),
             ('completed_hidden', 'Displayed', 'Completed', True),
             ('failed_active', 'Displayed', 'Failed', True),
             ('failed_active_visible', 'Displayed', 'FailedDisplayed', True),
             ('never_active_failed', 'Dormant', 'Failed', False),
             ('never_active_completed', 'Dormant', 'Completed', False),
             ('hide_completed', 'CompletedDisplayed', 'Completed', False),
             ('hide_failed', 'FailedDisplayed', 'Failed', False),
             ('unchanged_visible', 'Displayed', 'Displayed', False)]
    checked = []
    for name, old, new, expected in cases:
        event = {'quest': 'Synthetic Quest', 'objective': 'Deliver the journal', 'old_state': old, 'new_state': new}
        actual = matches(definition, event)
        assert actual == expected, name
        checked.append({'case': name, 'matched': actual, 'expected': expected})
    for name, field, value in [('empty_quest', 'quest', ''), ('empty_objective', 'objective', ' '),
                               ('unresolved_alias', 'objective', 'Bring <Alias=QuestItem> to <Alias.ShortName=Target>')]:
        event = {'quest': 'Synthetic Quest', 'objective': 'Deliver the journal', 'old_state': 'Dormant', 'new_state': 'Displayed', field: value}
        assert not matches(definition, event), name
        checked.append({'case': name, 'matched': False, 'expected': False})
    save('synthetic-filter-tests.json', checked)
    # Replay only the filter against already logged raw objective payloads.
    # No historical events are registered or rewritten.
    log = Path(r'C:\Users\fhg_r\OneDrive\Dokumente\My Games\Skyrim Special Edition\SKSE\SkyrimNet.log').read_text(encoding='utf8', errors='replace')
    replay = []
    for line in log.splitlines():
        marker = 'Event type quest_objective_state disabled, skipping: '
        if marker in line:
            event = json.loads(line.split(marker, 1)[1])
            replay.append({'time': line[1:24], 'event': event, 'matched': matches(definition, event)})
    save('historical-filter-check.local.json', replay)
    assert any(row['matched'] and row['event']['quest'] == 'Rise in the East' for row in replay)
    assert any(not row['matched'] and row['event']['old_state'] == 'Dormant' and row['event']['new_state'] == 'Failed' for row in replay)
    # Render the response template locally with invented fields. This calls no LLM.
    actor_list = request('/prompts?api=nearby-actors-preview&radius=3000')['actors']
    player = next(a for a in actor_list if a.get('isPlayer'))
    fixture = ('{% set player_name = "Test Player" %}\n'
               '{% set event_json = {"quest":"Synthetic Quest","objective":"Deliver the journal","old_state":"Displayed","new_state":"CompletedDisplayed"} %}\n'
               + definition['response']['content'])
    preview = request('/prompts?api=render-template-preview', {'content': fixture, 'templatePath': 'triggers/' + NAME,
                     'actorUUID': player['uuid'], 'responseTargetUUID': player['uuid']}, method='POST', timeout=45)
    save('response-template-preview.json', preview)
    assert preview.get('success') and 'Synthetic Quest' in preview.get('renderedContent', '') and '{{' not in preview.get('renderedContent', '')

    before = json.loads((ROOT / 'events.before.json').read_text(encoding='utf8'))['data']
    after = copy.deepcopy(before)
    row = next(e for e in after['events'] if e['event_type'] == 'quest_objective_state')
    row.update(enabled=True, persistent=False, shortLivedEnabled=False, allowNPCReaction=False, interrupt=False)
    live = request('/config?api=get&name=Events')['data']
    assert canonical_events(live) in [canonical_events(before), canonical_events(after)], 'Concurrent event settings edit'
    existing = request('/triggers?api=list')['triggers']
    original_triggers = json.loads((ROOT / 'triggers.before.json').read_text(encoding='utf8'))['triggers']
    assert all(t['name'] != NAME for t in original_triggers)
    (ROOT / 'backup').mkdir(exist_ok=True)
    backup = ROOT / 'backup/Events.yaml'
    if not backup.exists():
        shutil.copy2(RUNTIME / 'config/Events.yaml', backup)
    if not any(t['name'] == NAME for t in existing):
        result = request('/triggers?api=create', definition, method='POST')
        save('trigger-installation.json', result)
        assert result.get('success', False), result
    loaded = request('/triggers?api=list')['triggers']
    installed = next(t for t in loaded if t['name'] == NAME)
    save('trigger.installed.json', installed)
    for actual, expected in zip(installed['eventCriteria'], definition['eventCriteria'], strict=True):
        assert actual.get('logicalOperator', 'AND') == expected['logicalOperator']
        assert actual['eventType'] == expected['eventType'] and actual['schemaConditions'] == expected['schemaConditions']
    for key in ['response', 'audience', 'interrupt', 'probability', 'cooldownSeconds']:
        assert installed[key] == definition[key], (key, installed.get(key))
    assert len(loaded) == len(original_triggers) + 1
    # Raw objective events are ephemeral. Only the filtered persistent_generic
    # trigger output enters history; raw events must not generate scene chatter.
    if canonical_events(live) != canonical_events(after):
        result = request('/config?api=update', {'name': 'Events', 'data': after}, method='POST')
        assert result.get('success'), result.get('message')
    # Events are stored in an unordered native map; serialization order may change.
    assert canonical_events(request('/config?api=get&name=Events')['data']) == canonical_events(after)
    save('events.installed.json', after)
    assert next(e for e in after['events'] if e['event_type'] == 'quest_stage')['enabled'] is False
    other_before = [e for e in before['events'] if e['event_type'] != 'quest_objective_state']
    other_after = [e for e in after['events'] if e['event_type'] != 'quest_objective_state']
    assert other_before == other_after and before['global'] == after['global']
    summary = {'installed': True, 'trigger': NAME, 'synthetic_filter_cases_passed': len(checked),
               'native_trigger_parsed': True, 'native_condition_checks': len(validations),
               'historical_events_checked': len(replay), 'historical_events_passed': sum(r['matched'] for r in replay),
               'historical_events_rejected': sum(not r['matched'] for r in replay),
               'raw_objective_event': row, 'audience': 'player', 'response_type': 'persistent_generic',
               'quest_stages_remain_disabled': True, 'unrelated_events_unchanged': True,
               'paid_model_tests': 0, 'old_events_replayed_into_game': False,
               'real_next_objective_verification': 'pending normal gameplay',
               'trigger_provenance': installed.get('provenance')}
    save('installation.json', summary)
    print(json.dumps(summary, ensure_ascii=False))


if __name__ == '__main__':
    main()
