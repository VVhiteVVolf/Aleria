"""Inventory only: no changes to Nolvus, profiles, or installed mods."""
import csv
import json
import os
from pathlib import Path

OUT = Path(__file__).parent
BASE = Path(r'E:\Nolvus\Instances\Nolvus Awakening\MODS')
CURRENT = 'Nolvus Awakening - SkyrimNet Beta25 Test'


def read_profile(name):
    lines = (BASE / 'profiles' / name / 'modlist.txt').read_text(encoding='utf-8-sig').splitlines()
    return {s[1:]: {'enabled': s.startswith('+'), 'file_order': i}
            for i, s in enumerate(lines) if s[:1] in ('+', '-')}


def measure(root):
    size = count = 0
    links = []
    errors = []
    if not root.exists():
        return {'exists': False, 'bytes': 0, 'files': 0, 'links': [], 'errors': []}
    def onerror(error):
        errors.append(str(error))
    for directory, dirs, files in os.walk(root, onerror=onerror, followlinks=False):
        kept = []
        for name in dirs:
            p = Path(directory) / name
            if p.is_symlink() or p.is_junction():
                links.append(str(p))
            else:
                kept.append(name)
        dirs[:] = kept
        for name in files:
            p = Path(directory) / name
            if p.is_symlink():
                links.append(str(p))
                continue
            try:
                size += p.stat().st_size
                count += 1
            except OSError as error:
                errors.append(str(error))
    return {'exists': True, 'bytes': size, 'files': count, 'links': links, 'errors': errors}


baseline = read_profile('Nolvus Awakening')
current = read_profile(CURRENT)
rows = []
extra_bytes = 0
for folder in sorted((BASE / 'mods').iterdir()):
    if not folder.is_dir() or folder.name.endswith('_separator'):
        continue
    custom = folder.name not in baseline
    state = current.get(folder.name, {})
    row = {'name': folder.name, 'classification': 'ADDED_VS_BASE_PROFILE' if custom else 'BASE_PROFILE_POSSIBLY_MODIFIED',
           'active_in_current_profile': state.get('enabled', False), 'listed_in_current_profile': folder.name in current,
           'path': str(folder), 'bytes': '', 'files': ''}
    if custom:
        measured = measure(folder)
        row.update({k: measured[k] for k in ['bytes', 'files']})
        row['scan_issues'] = json.dumps({'links': measured['links'], 'errors': measured['errors']})
        extra_bytes += measured['bytes']
    rows.append(row)

with (OUT / 'mod-classification.csv').open('w', encoding='utf-8-sig', newline='') as stream:
    writer = csv.DictWriter(stream, fieldnames=['name','classification','active_in_current_profile','listed_in_current_profile','path','bytes','files','scan_issues'])
    writer.writeheader()
    writer.writerows(rows)

extras = [r for r in rows if r['classification'] == 'ADDED_VS_BASE_PROFILE']
missing = [name for name in baseline if not name.endswith('_separator') and not (BASE / 'mods' / name).is_dir()]
disabled = [name for name, state in baseline.items() if state['enabled'] and name in current and not current[name]['enabled'] and not name.endswith('_separator')]
other = {'overwrite': measure(BASE / 'overwrite')}
for p in (BASE / 'profiles').iterdir():
    if p.is_dir():
        other['saves/' + p.name] = measure(p / 'saves')
summary = {'profile': CURRENT, 'installed_nonseparator_folders': len(rows), 'additional_folders': len(extras),
           'additional_active': sum(r['active_in_current_profile'] for r in extras),
           'additional_logical_gib': round(extra_bytes / 2**30, 2), 'baseline_folders_missing': missing,
           'baseline_mods_disabled_in_current_profile': disabled, 'other_paths': other,
           'limitations': ['The original profile is a comparison baseline, not a verified official manifest.',
                          'Existing Nolvus folders may contain changes even when names match.',
                          'No full backup created; sizes are logical, not deduplicated.',
                          'MO2 is running; final backup requires a fresh stable profile snapshot.']}
(OUT / 'summary.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({k: v for k, v in summary.items() if k not in ['other_paths','baseline_mods_disabled_in_current_profile']}, ensure_ascii=False), flush=True)
print('Disabled base mods:',len(disabled),flush=True)
for key, value in other.items():
    print(key, round(value['bytes']/2**30,2), 'GiB', value['files'], 'files',flush=True)
