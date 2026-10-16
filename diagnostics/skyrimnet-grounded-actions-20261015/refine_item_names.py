"""Tighten the technical item-name instruction found in the dialogue check."""
from urllib.parse import urlencode
import difflib
import hashlib
import json
from local_api import request
from prepare_changes import ROOT, RUNTIME


def main():
    rel = 'submodules/user_final_instructions/0750_embedded_actions.prompt'
    staged = ROOT / 'staged' / rel
    before = staged.read_text(encoding='utf8')
    current = request('/prompts?' + urlencode({'api': 'get', 'path': rel}))
    assert current['content'].replace('\r\n', '\n') == before.replace('\r\n', '\n')
    anchor = '- A sale at an agreed price is one Economy transaction, not an Items gift.'
    assert before.count(anchor) == 1
    rule = '- In technical action parameters and category intents, copy the displayed inventory item name verbatim, including punctuation. Do not paraphrase the name or replace it with a packaging description.\n'
    after = before.replace(anchor, rule + anchor)
    validation = request('/prompts?api=validate', {'path': rel, 'content': after}, method='POST')
    assert validation.get('isValid') and not validation.get('errors')
    (ROOT / 'staged/0750-before-name-refinement.prompt').write_text(before, encoding='utf8')
    staged.write_text(after, encoding='utf8')
    result = request('/prompts?api=update', {'path': rel, 'content': after}, method='PUT')
    assert result.get('success')
    actual = request('/prompts?' + urlencode({'api': 'get', 'path': rel}))
    assert actual['content'].replace('\r\n', '\n') == after
    plan = json.loads((ROOT / 'plan.json').read_text(encoding='utf8'))
    for row in plan['prompts']:
        if row['path'] == rel:
            row['after_sha256'] = hashlib.sha256(after.encode('utf8')).hexdigest()
    (ROOT / 'plan.json').write_text(json.dumps(plan, indent=2), encoding='utf8')
    original = (ROOT / 'backup/prompts' / rel).read_text(encoding='utf-8-sig')
    diff = ''.join(difflib.unified_diff(original.splitlines(True), after.splitlines(True), fromfile=rel + '.before', tofile=rel + '.after'))
    (ROOT / 'staged/0750_embedded_actions.prompt.diff').write_text(diff, encoding='utf8')
    (ROOT / 'name-refinement.json').write_text(json.dumps({'path': rel, 'validation': actual['validation'],
        'sha256': hashlib.sha256(after.encode('utf8')).hexdigest(), 'provenance': actual.get('provenance')}, indent=2), encoding='utf8')
    print(json.dumps({'item_names_must_be_verbatim': True, 'live_readback_verified': True, 'validation_errors': 0}))


if __name__ == '__main__':
    main()
