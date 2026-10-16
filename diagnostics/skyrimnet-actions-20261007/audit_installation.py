"""Inspect active SkyrimNet files and keep credentials out of reports."""
from pathlib import Path
import json
import re
import yaml

BASE = Path(r'E:\Nolvus\Instances\Nolvus Awakening')
OUT = Path(__file__).parent
PROFILE = BASE / 'MODS/profiles/Nolvus Awakening - SkyrimNet Beta25 Test'

def redact(value):
    if isinstance(value, dict):
        return {key: '<redacted>' if re.search(r'key|token|password|credential|secret', key, re.I) and not re.search(r'hotkey|top_k|max_tokens|semantic', key, re.I) else redact(item) for key, item in value.items()}
    if isinstance(value, list):
        return [redact(item) for item in value]
    return value

def main():
    enabled = [line[1:] for line in (PROFILE / 'modlist.txt').read_text(encoding='utf-8-sig').splitlines() if line.startswith('+')]
    winners = {}
    for name in reversed(enabled):
        root = BASE / 'MODS/mods' / name / 'SKSE/Plugins/SkyrimNet'
        if root.exists():
            for path in root.rglob('*'):
                if path.is_file() and path.suffix.lower() in ('.yaml', '.json', '.prompt', '.psc') and not any(p in ('logs','saves','data','assets','voices','models') for p in path.relative_to(root).parts):
                    winners[path.relative_to(root).as_posix().lower()] = str(path)
    overwrite = BASE / 'MODS/overwrite/SKSE/Plugins/SkyrimNet'
    if overwrite.exists():
        for path in overwrite.rglob('*'):
            if path.is_file():
                winners[path.relative_to(overwrite).as_posix().lower()] = str(path)
    (OUT/'file-winners.json').write_text(json.dumps(winners, ensure_ascii=False, indent=2),encoding='utf-8')
    configs = {}
    for rel, file in winners.items():
        if rel in ('config/skyrimnet.yaml','config/actions.yaml','config/dialogueactions.yaml','config/openrouter.yaml','config/agents.yaml'):
            configs[rel] = {'file':file,'data':redact(yaml.safe_load(Path(file).read_text(encoding='utf-8-sig')))}
    (OUT/'current-settings-redacted.json').write_text(json.dumps(configs,ensure_ascii=False,indent=2),encoding='utf-8')
    matches = []
    for rel,file in winners.items():
        if not rel.endswith('.prompt'):
            continue
        lines = Path(file).read_text(encoding='utf-8-sig').splitlines()
        for n,line in enumerate(lines,1):
            if re.search(r'\bseason\b|merchant_inventory\.items|equipment\.body|SexLabAnimatingFaction',line) and ('{{' in line or '{%' in line):
                matches.append({'relative':rel,'file':file,'line':n,'text':line[:550]})
    (OUT/'template-variables.json').write_text(json.dumps(matches,ensure_ascii=False,indent=2),encoding='utf-8')
    print('RELEVANT TEMPLATES')
    for rel,file in winners.items():
        if any(part in rel for part in ('0750_', '8000_', 'native_action_selector', 'dynamic_character_bio', '/items.yaml', '/economy.yaml', '/stopfollowing.yaml', '/dismissfollower.yaml', '/trigg')) and '/characters/' not in rel:
            print(rel,file)
    print('VARIABLE MATCHES',len(matches))
    for x in matches:
        if 'season' in x['text'] or 'merchant_inventory.items' in x['text']:
            print(x)

if __name__=='__main__':
    main()
