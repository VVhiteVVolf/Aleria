"""Byte-preserve the revised Venalys maps and prepare the established web paths."""
from pathlib import Path
from importlib.util import module_from_spec, spec_from_file_location
import json
import shutil

ROOT = Path(__file__).resolve().parents[3]
REALM = Path(__file__).resolve().parents[1]
SOURCES = REALM / 'sources'
VERSION = '20261104'
ARCHIVE = SOURCES / f'map-revision-{VERSION}'
SOURCE = Path('C:/Users/fhg_r/Downloads/Venalys/Alternative Maps')
spec = spec_from_file_location('venalys_supplied_assets', Path(__file__).with_name('prepare-assets.py'))
assets = module_from_spec(spec)
spec.loader.exec_module(assets)


def main():
    ARCHIVE.mkdir(parents=True, exist_ok=True)
    for source, target in [(REALM / 'territory-data.mjs', ARCHIVE / 'previous-territory-data.mjs'),
                           (SOURCES / 'asset-receipts.json', ARCHIVE / 'previous-asset-receipts.json')]:
        if not target.exists():
            shutil.copyfile(source, target)
    records, web = [], []
    for identifier, filename, stem in [('normal', 'Venalys Normal.png', 'map'),
                                        ('districts', 'Venalys Regionen.png', 'map-districts')]:
        target = REALM / f'sources/originals/{stem}-{VERSION}.png'
        original = assets.archive(SOURCE / filename, target, f'Alternative Maps/{filename}', published=False)
        records.append({'id': identifier, **original, 'sourcePath': (SOURCE / filename).as_posix(), 'noGeometryEdits': True})
        web.append(assets.web_image(target, REALM / f'assets/{stem}.webp', 4096, 91))
        web.append(assets.web_image(target, REALM / f'assets/{stem}-full.webp', 6144, 94))
    if records[0]['dimensions'] != records[1]['dimensions']:
        raise ValueError('The revised Venalys maps have different source geometry.')
    assets.write_json(SOURCES / 'active-map-sources.json', {
        'schemaVersion': 1, 'revision': VERSION, 'sourceDirectory': SOURCE.as_posix(),
        'geometry': dict(zip(['width', 'height'], records[0]['dimensions'])),
        'maps': records, 'webImages': web, 'originalsPreserved': True,
    })
    receipts = assets.read_json(SOURCES / 'asset-receipts.json')
    replaced = {entry['path'] for entry in web}
    receipts['webImages'] = [entry for entry in receipts['webImages'] if entry['path'] not in replaced] + web
    receipts['activeMapRevision'] = VERSION
    assets.write_json(SOURCES / 'asset-receipts.json', receipts)
    print(json.dumps({'maps': len(records), 'webMaps': len(web), 'geometry': records[0]['dimensions']}))


if __name__ == '__main__':
    main()
