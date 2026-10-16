"""Prepare narrow prompt/config migrations, keeping personal content separate."""
import difflib
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).parent
MODS = Path(r'E:\Nolvus\Instances\Nolvus Awakening\MODS\mods')
RUNTIME = 'SkyrimNet - Beta25 Test Runtime 20260927'
IMPORT = 'SkyrimNet - Personal Prompt Import 20260927'
BASE = MODS / 'SkyrimNet - Beta 26 RC4/SKSE/Plugins/SkyrimNet/library/skyrimnet.base/prompts'
PATCHES = []


def sha(data):
    return hashlib.sha256(data).hexdigest()


def save(relative, content, reason, original=None):
    target = MODS / RUNTIME / relative
    before = target.read_bytes() if target.exists() else None
    if original is None:
        original = before
    candidate = ROOT / 'overrides' / relative
    candidate.parent.mkdir(parents=True, exist_ok=True)
    candidate.write_bytes(content)
    diff = ''.join(difflib.unified_diff(
        (original or b'').decode('utf-8-sig').splitlines(True),
        content.decode('utf-8-sig').splitlines(True), fromfile='before/' + relative, tofile='after/' + relative))
    diff_file = ROOT / 'diffs' / (relative.replace('/', '__') + '.diff')
    diff_file.parent.mkdir(exist_ok=True)
    diff_file.write_text(diff, encoding='utf-8')
    PATCHES.append({'relative': relative, 'before_sha256': sha(before) if before else None,
                    'after_sha256': sha(content), 'reason': reason})


def main():
    # Import only effective files absent from the higher-priority runtime layer.
    merged = {}
    for path in (MODS / IMPORT).rglob('*.prompt'):
        rel = path.relative_to(MODS / IMPORT).as_posix()
        current = MODS / RUNTIME / rel
        merged[rel] = current.read_bytes() if current.exists() else path.read_bytes()
    prefix = 'SKSE/Plugins/SkyrimNet/'
    quest = (BASE / 'submodules/user_final_instructions/0740_quest_dialogue.prompt').read_bytes()
    for rel in [prefix + 'overlay/prompts/submodules/user_final_instructions/0740_quest_dialogue.prompt',
                prefix + 'prompts/submodules/user_final_instructions/0740_quest_dialogue.prompt']:
        save(rel, quest, 'Migrate quest guidance to the installed Beta26 API and recipient checks')
        merged.pop(rel, None)
    component = 'components/quest_dialogue_action.prompt'
    for layer in ('prompts/', 'overlay/prompts/'):
        rel = prefix + layer + component
        current = MODS / RUNTIME / rel
        old = current.read_bytes() if current.exists() else merged.get(rel)
        if old is not None:
            text = old.decode('utf-8-sig')
            assert 'beta25_featureset' in text
            text = text.replace('beta25_featureset', 'quest_actions').replace('"quest ids"', '"fires"')
            text = text.replace('Body for the SpeakQuestLine action', 'Body for the TriggerDialogueLine action')
            save(rel, text.encode('utf-8'), 'Migrate the retained legacy quest component; keep its wording', old)
            merged.pop(rel, None)
    for rel, content in merged.items():
        if not (MODS / RUNTIME / rel).exists():
            save(rel, content, 'Consolidate the personal import into the existing runtime without text changes')

    memory_rel = 'submodules/character_bio/7100_memories.prompt'
    text = (BASE / memory_rel).read_text(encoding='utf-8-sig')
    needle = '{% if memory.memory.season != season and memory.memory.season != "unknown" %}[in {{ memory.memory.season }}] {% endif %}'
    replacement = ('{% if exists("season") %}{% if existsIn(memory.memory, "season") %}'
                   '{% if memory.memory.season != season and memory.memory.season != "unknown" %}'
                   '[in {{ memory.memory.season }}] {% endif %}{% endif %}{% endif %}')
    assert text.count(needle) == 1
    save(prefix + 'overlay/prompts/' + memory_rel, text.replace(needle, replacement).encode('utf-8'),
         'Guard missing season context; preserve all memories and their selection')

    state_rel = 'submodules/user_final_instructions/8000_recent_state_changes.prompt'
    text = (BASE / state_rel).read_text(encoding='utf-8-sig')
    start = text.index('{% set hasCuirass = equipment.body %}')
    end = text.index('{# Track changes with', start)
    safe_body = '''{% set hasCuirass = false %}
{% set cuirassName = "" %}
{% if existsIn(equipment, "body") %}
{% if equipment.body %}
{% set hasCuirass = equipment.body %}
{% if existsIn(equipment.body, "name") %}
{% set cuirassName = equipment.body.name %}
{% endif %}
{% endif %}
{% endif %}

'''
    save(prefix + 'overlay/prompts/' + state_rel, (text[:start] + safe_body + text[end:]).encode('utf-8'),
         'Guard absent torso equipment without changing tracked state semantics')

    sever = ROOT / 'stage/SeverActions 4.2.0/SKSE/Plugins/SkyrimNet/external/severause.severactions/prompts'
    merchant_rel = 'submodules/character_bio/0075_severactions_merchant.prompt'
    text = (sever / merchant_rel).read_text(encoding='utf-8-sig')
    needle = '{% if merchant_inventory.items and length(merchant_inventory.items) > 0 %}'
    safe_items = '''{% set merchant_items = [] %}
{% if existsIn(merchant_inventory, "items") %}
{% if isArray(merchant_inventory.items) %}
{% set merchant_items = merchant_inventory.items %}
{% endif %}
{% endif %}
{% if length(merchant_items) > 0 %}'''
    assert text.count(needle) == 1
    text = text.replace(needle, safe_items).replace('for item in merchant_inventory.items', 'for item in merchant_items')
    save(prefix + 'overlay/prompts/' + merchant_rel, text.encode('utf-8'), 'Guard nonmerchant inventory results')

    actions_rel = 'submodules/user_final_instructions/0750_embedded_actions.prompt'
    text = (sever / actions_rel).read_text(encoding='utf-8-sig')
    needle = '{% if default(embed_actions_in_dialogue, false) and eligible_actions and length(eligible_actions) > 0 %}'
    assert text.count(needle) == 1
    text = text.replace(needle, '{% if default(embed_actions_in_dialogue, false) %}\n{% if exists("eligible_actions") %}\n{% if eligible_actions and length(eligible_actions) > 0 %}')
    text += '\n{% endif %}\n{% endif %}\n'
    instructions = '''**Execution consistency:**
- When you accept a transfer of gold/items now, agree to stop following or wait now, or reach a real quest turning point with an eligible action, include exactly ONE matching ACTION line. A spoken agreement alone does not execute it.
- Use only the eligible names and parameter keys below. For a category, include a concrete intent with sender, recipient, item/amount, and what is being settled now; preserve the actual direction of the transfer.
- If no eligible action can perform the request, explain that limitation instead of claiming it happened.
- A previous spoken claim is not proof of execution. Use recorded action results and current state to distinguish an unexecuted promise from an already completed transfer; never repeat a recorded successful payment.

'''
    text = text.replace('**Available Actions:**', instructions + '**Available Actions:**')
    save(prefix + 'overlay/prompts/' + actions_rel, text.encode('utf-8'),
         'Use the current SeverActions rubric and require execution for immediate accepted requests')

    config_rel = prefix + 'config/SkyrimNet.yaml'
    text = (MODS / RUNTIME / config_rel).read_text(encoding='utf-8-sig')
    text, count = re.subn(r'(shouldApplyTalkToPlayerPackage:\s*)true\b', r'\1false', text)
    assert count == 1
    save(config_rel, text.encode('utf-8'), 'Disable automatic conversation approach; retain real follower packages')

    action_config = prefix + 'config/Actions.yaml'
    text = (MODS / RUNTIME / action_config).read_text(encoding='utf-8-sig')
    if re.search(r'^  CompanionWait:', text, re.M):
        assert not re.search(r'^  WaitForPlayerHere:', text, re.M)
        text = re.sub(r'^  CompanionWait:', '  WaitForPlayerHere:', text, flags=re.M)
    if re.search(r'^  CompanionFollow:', text, re.M):
        assert not re.search(r'^  ResumeFollowing:', text, re.M)
        text = re.sub(r'^  CompanionFollow:', '  ResumeFollowing:', text, flags=re.M)
    save(action_config, text.encode('utf-8'), 'Carry existing wait/follow settings to the renamed SeverActions actions')
    (ROOT / 'override-plan.json').write_text(json.dumps(PATCHES, indent=2), encoding='utf-8')
    print(json.dumps({'patches': len(PATCHES), 'personal_import_can_be_disabled': True,
                      'config_changes': ['speech.shouldApplyTalkToPlayerPackage=false', 'renamed Wait/Follow action settings']}, indent=2))


if __name__ == '__main__':
    main()
