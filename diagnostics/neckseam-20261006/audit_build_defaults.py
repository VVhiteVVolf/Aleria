"""Audit project-owned conversion defaults against the previous shared preset."""
import json
import xml.etree.ElementTree as ET
from pathlib import Path
from audit import INSTANCE

ROOT = Path(__file__).parent


def main():
    mods = INSTANCE / 'MODS/mods'
    plan = json.loads((ROOT.parent / 'new-skyrim-downloads-20261006/build-plan.json').read_text(encoding='utf-8'))
    presets = {}
    for family in ('female', 'male'):
        path = mods / ('Local - New Downloads OBody Output 20261006/CalienteTools/BodySlide/SliderPresets/Local New Downloads ' + family + '.xml')
        presets[family] = {(s.get('name'), s.get('size')): float(s.get('value')) for s in ET.parse(path).getroot().iter('SetSlider')}
    cache = {}
    rows = []
    missing = []
    for project in plan['projects']:
        path = mods / project['mod'] / 'CalienteTools/BodySlide/SliderSets' / Path(project['osp']).name
        if not path.is_file():
            candidates = list((mods / project['mod'] / 'CalienteTools/BodySlide/SliderSets').rglob(Path(project['osp']).name))
            if len(candidates) == 1:
                path = candidates[0]
        if not path.is_file():
            # Some borrowed dependency projects were staged under an outfit mod
            # but are owned by a different installed conversion. Record them.
            missing.append({'project': project['name'], 'path': str(path)})
            continue
        if path not in cache:
            cache[path] = {}
            for s in ET.parse(path).getroot().iter('SliderSet'):
                cache[path].setdefault(s.get('name'), s)
        element = cache[path][project['name']]
        conflicts = []
        neck = []
        for s in element.findall('Slider'):
            if s.get('name') == 'NeckSeam':
                neck.append(s.attrib)
            if (s.get('name') not in ('NeckSeam', 'AnkleSize') and
                    s.get('hidden', 'false').lower() != 'true' and
                    s.get('zap', 'false').lower() != 'true'):
                continue
            for size in ('small', 'big'):
                key = (s.get('name'), size)
                value = presets[project['family']].get(key)
                expected = float(s.get(size, '0'))
                if value is not None and value != expected:
                    conflicts.append({'name': key[0], 'size': size, 'expected': expected, 'actual': value})
        if conflicts or neck:
            rows.append({'name': project['name'], 'output': project['output'], 'mod': project['mod'],
                         'osp': str(path), 'family': project['family'], 'neck': neck, 'conflicts': conflicts})
    result = {'projects': rows, 'missing_project_sources': missing,
              'affected_projects': sum(bool(r['conflicts']) for r in rows),
              'neck_projects': sum(bool(r['neck']) for r in rows),
              'conflicting_names': sorted({c['name'] for r in rows for c in r['conflicts']})}
    (ROOT / 'build-default-audit.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
    print(json.dumps({k: v for k, v in result.items() if k != 'projects'}), flush=True)
    print('Visible NeckSeam definitions:', json.dumps([r['name'] for r in rows for n in r['neck'] if n.get('hidden') != 'true']))


if __name__ == '__main__':
    main()
