"""Provide exact packaged texture aliases and reproducible BodySlide groups."""
from pathlib import Path
import hashlib
import json
import shutil

OUT = Path(__file__).parent


def sha(path):
    with path.open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


def main():
    plan = json.loads((OUT / 'deployment-plan.json').read_text(encoding='utf-8'))
    assert json.loads((OUT / 'deployment-result.json').read_text())['completed']
    stage = Path(plan['mods'][-1]['directory'])
    live = Path(plan['instance']) / 'MODS/mods' / stage.name
    modules = {m['index']: Path(m['directory']) for m in plan['mods']}
    aliases = {
        'textures/00Lily/eyegrey.dds': modules[15] / 'textures/00Lily/00hh_eyegrey.dds',
        'textures/00Lily/eyebrown_sk.dds': modules[43] / 'textures/actors/ZckeZcktReplacerAssets/face/eyebrown_sk.dds',
        'textures/Obicnii/Cimmerian/UnderFur_N.dds': modules[21] / 'textures/Obicnii/Cimmerian/UndeFur_N.dds',
        'textures/Obicnii/Common/ShirtT_N.dds': modules[52] / 'textures/Obicnii/Common/Shirt_N.dds',
    }
    for suffix in ('', '_msn', '_sk', '_s'):
        aliases['textures/actors/character/female/BakaUNP/VaginalAnalCanal2' + suffix + '.dds'] = (
            modules[43] / ('textures/actors/ZckeZcktReplacerAssets/body/BakaUNP/VaginalAnalCanal2' + suffix + '.dds'))
    for index, name, prefix in [(50, 'FullMoon', 'xSummer/S4 hair/Update/Update1/Update2'),
                                (42, 'Necromancer', 'xSummer/S4 hair/Update/Update1/Update2')]:
        owner = 'ZckeZcktNozomiFollower' if index == 50 else 'ZckeZcktCV01Replacers'
        for suffix in ('', '_n'):
            aliases[f'textures/{prefix}/{name}{suffix}.dds'] = modules[index] / f'textures/actors/{owner}/hair/{name}{suffix}.dds'
    for prefix in ('4uplod-t/SCA', 'xSummer/S4 hair/Hairline'):
        for suffix in ('', '_n'):
            aliases[f'textures/{prefix}/hairline01{suffix}.dds'] = modules[43] / f'textures/actors/ZckeZcktReplacerAssets/hair/hairline01{suffix}.dds'
    # Legacy spelling used by Dragonbone Barbarian; use the winning current normal map.
    original = (OUT / 'before/modlist.txt').read_text(encoding='utf-8-sig').splitlines()
    normal = None
    for line in original:
        if line.startswith('+'):
            candidate = Path(plan['instance']) / 'MODS/mods' / line[1:] / 'textures/actors/character/female/femalebody_1_msn.dds'
            if candidate.is_file():
                normal = candidate
                break
    assert normal is not None
    aliases['textures/actors/character/female/femalebody_msn.dds'] = normal
    rows = []
    for relative, source in aliases.items():
        assert source.is_file(), str(source)
        for destination_root in (stage, live):
            destination = destination_root / relative
            assert not destination.exists(), str(destination)
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, destination)
            assert sha(destination) == sha(source)
        rows.append({'relative': relative, 'source': str(source), 'sha256': sha(source), 'purpose': 'Exact resource alias for legacy/incorrect NIF texture path'})
    for folder in ('SliderGroups', 'SliderPresets'):
        for source in (OUT / 'BuildCatalog' / folder).glob('*.xml'):
            relative = f'CalienteTools/BodySlide/{folder}/Local New Downloads {source.stem}.xml'
            for destination_root in (stage, live):
                target = destination_root / relative
                target.parent.mkdir(parents=True, exist_ok=True)
                assert not target.exists()
                shutil.copy2(source, target)
                assert sha(target) == sha(source)
            rows.append({'relative': relative, 'source': str(source), 'sha256': sha(source), 'purpose': 'Local New Zero preset and explicit female/male build groups'})
    (OUT / 'build-support-receipt.json').write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding='utf-8')
    manifest = json.loads((OUT / 'deployed-file-manifest.json').read_text(encoding='utf-8'))
    output_entry = next(m for m in manifest if m['mod'] == stage.name)
    output_entry['files'].extend({'relative': r['relative'], 'bytes': (live / r['relative']).stat().st_size, 'sha256': r['sha256']} for r in rows)
    (OUT / 'deployed-file-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({'verified_support_files': len(rows), 'texture_aliases': len(aliases), 'normal_map_source': str(normal)}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
