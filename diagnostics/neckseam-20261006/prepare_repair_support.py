"""Stage corrected build presets/groups alongside the verified mesh repair."""
import hashlib
import json
import xml.etree.ElementTree as ET
from pathlib import Path
from audit import INSTANCE

ROOT = Path(__file__).parent
TARGET = INSTANCE / 'MODS/mods/Local - New Downloads OBody Output 20261006'


def sha(path):
    with path.open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


def main():
    validation = json.loads((ROOT / 'repair-validation.json').read_text())
    if not validation['verified']:
        raise ValueError('Meshes have not passed validation')
    plan = json.loads((ROOT.parent / 'new-skyrim-downloads-20261006/build-plan.json').read_text(encoding='utf-8'))
    names = {p['build_name']: p['name'] for p in plan['projects']}
    rows = list(validation['files'])
    relatives = ['CalienteTools/BodySlide/SliderPresets/Local New Downloads female.xml']
    relatives += ['CalienteTools/BodySlide/SliderGroups/Local New Downloads ' + f + '.xml' for f in ('female', 'male')]
    for relative in relatives:
        old = TARGET / relative
        doc = ET.parse(old)
        if '/SliderPresets/' in relative:
            for preset in doc.getroot().iter('Preset'):
                for slider in list(preset.findall('SetSlider')):
                    if slider.get('name') in ('NeckSeam', 'AnkleSize'):
                        preset.remove(slider)
        else:
            for member in doc.getroot().iter('Member'):
                member.set('name', names[member.get('name')])
        generated = ROOT / 'default-repair-build/support' / relative
        generated.parent.mkdir(parents=True, exist_ok=True)
        doc.write(generated, encoding='utf-8', xml_declaration=True)
        rows.append({'relative': relative, 'target': str(old), 'source': str(generated),
                     'old_sha256': sha(old), 'new_sha256': sha(generated), 'bytes': generated.stat().st_size})
    result = {'verified': True, 'projects': validation['projects'], 'files': rows,
              'target_root': str(TARGET), 'backup_root': str(ROOT / 'before-repair')}
    (ROOT / 'repair-deployment-plan.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
    print(json.dumps({'verified': True, 'changed_files': len(rows), 'bytes': sum(r['bytes'] for r in rows)}))


if __name__ == '__main__':
    main()
