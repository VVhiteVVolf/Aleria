"""Read-only MO2 input audit; writes evidence only beside this script."""
import json
import os
import re
from pathlib import Path

OUT = Path(__file__).parent
BASE = Path(r'E:\Nolvus\Instances\Nolvus Awakening\MODS')
PROFILE = BASE / 'profiles' / 'Nolvus Awakening - SkyrimNet Beta25 Test'
mods = [s[1:] for s in (PROFILE / 'modlist.txt').read_text(encoding='utf-8-sig').splitlines() if s.startswith('+')]
roots = [BASE / 'overwrite', *[BASE / 'mods' / name for name in mods], BASE.parent / 'STOCK GAME' / 'Data']
winners = {}
extensions = {'.ini', '.toml', '.yaml', '.yml', '.json', '.cfg', '.txt', '.psc'}
for root in roots:
    for sub in ['SKSE', 'MCM', 'Interface', 'Scripts', 'Source']:
        for directory, dirs, files in os.walk(root / sub):
            dirs[:] = [d for d in dirs if d.lower() not in {'chargen', 'translations', 'animationdatasinglefile', 'animations', 'animationmotiondatasinglefile'}]
            for name in files:
                path = Path(directory) / name
                if path.suffix.lower() in extensions:
                    rel = path.relative_to(root).as_posix().lower()
                    winners.setdefault(rel, [root.name, str(path)])
(OUT / 'winners.json').write_text(json.dumps(winners, indent=2), encoding='utf-8')
fields = []
calls = []
for rel, (mod, filename) in winners.items():
    path = Path(filename)
    if path.stat().st_size > 2_000_000:
        continue
    text = path.read_text(encoding='utf-8-sig', errors='replace')
    for number, line in enumerate(text.splitlines(), 1):
        s = line.strip()
        if not s or s.startswith((';', '#', '//')):
            continue
        # Only literal input fields. Never export authentication/config secrets.
        if re.search(r'(?i)(key|hotkey|button|stance_|togglewheel|modifier|shortcut)', s) and len(s) < 500:
            if re.search(r'(?i)(token|secret|api.?key|password|authorization)', s):
                continue
            if re.search(r'(?i)(?:[=:]\s*[\"\']?(?:-?\d+|0x[\da-f]+)|registerforkey|iskeypressed|rc?trl\+|shift\+|alt\+)', s):
                fields.append({'mod': mod, 'relative': rel, 'line': number, 'text': s})
        if path.suffix.lower() == '.psc' and re.search(r'(?i)(registerforkey|iskeypressed)', s):
            calls.append({'mod': mod, 'relative': rel, 'line': number, 'text': s})
(OUT / 'input-fields.json').write_text(json.dumps(fields, ensure_ascii=False, indent=2), encoding='utf-8')
(OUT / 'key-calls.json').write_text(json.dumps(calls, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({'active_mods': len(mods), 'winning_text_files': len(winners), 'input_fields': len(fields), 'script_key_calls': len(calls)}), flush=True)
