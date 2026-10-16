"""Inspect texture references in the newly winning installed game meshes."""
from pathlib import Path
import inspect
import io
import json
import os
import struct
import sys

OUT = Path(__file__).parent
sys.path.insert(0, str(OUT.parent / 'obody-bodyslide-audit-20261006'))
sys.path.insert(0, str(OUT.parent / 'obody-repair-cleanup-20261006'))
from archive_index import read_index
from archive_mesh import read_entry
from nif_links import header


def norm(path):
    return path.replace('\\', '/').strip('/').casefold().removeprefix('data/')


def main():
    plan = json.loads((OUT / 'deployment-plan.json').read_text(encoding='utf-8'))
    inv = json.loads((OUT.parent / 'obody-bodyslide-audit-20261006/inventory.json').read_text(encoding='utf-8'))
    active = set(json.loads((OUT / 'catalog.json').read_text())['active_mods'])
    active -= set(plan['disabled_mods'])
    active.update(m['name'] for m in plan['mods'])
    # The tested index reader can safely retain every named archive entry.
    source = inspect.getsource(read_index).replace('def read_index(path):', 'def all_entries(path):')
    source = source.replace("if relative.startswith('meshes/') and relative.endswith(('.nif','.tri')):", 'if True:')
    namespace = {'struct': struct, 'normalized': norm}
    exec(source, namespace)
    all_entries = namespace['all_entries']
    plugins = {Path(p).stem.casefold() for p in inv['plugins']}
    plugins.update(Path(p).stem.casefold() for p in plan['new_plugins'])
    plugins.discard('gotdragonsenemy')
    instance = Path(plan['instance'])
    plugins.update(Path(p).stem.casefold() for p in (instance / 'STOCK GAME/Skyrim.ccc').read_text(encoding='utf-8-sig').splitlines())
    # The earlier geometry inventory intentionally did not index loose textures.
    roots = [instance / 'MODS/mods' / name / 'textures' for name in active]
    roots += [instance / 'MODS/overwrite/textures', instance / 'STOCK GAME/Data/textures']
    available = {norm(relative) for relative, providers in inv['files'].items()
                 if any(p['mod'] in active or p['mod'] == 'Stock Game' for p in providers)}
    for root in roots:
        if root.is_dir():
            for directory, dirs, files in os.walk(root):
                for name in files:
                    path = Path(directory) / name
                    available.add('textures/' + norm(path.relative_to(root).as_posix()))
    archives = {}
    for provider in inv['archives']:
        if provider['mod'] in active or provider['mod'] == 'Stock Game':
            archives.setdefault(Path(provider['path']).name.casefold(), Path(provider['path']))
    new = {}
    for mod in plan['mods']:
        base = Path(mod['directory'])
        for path in base.rglob('*'):
            if not path.is_file():
                continue
            relative = norm(path.relative_to(base).as_posix())
            available.add(relative)
            if relative.startswith('meshes/') and relative.endswith('.nif'):
                new[relative] = path
            if path.suffix.casefold() == '.bsa':
                archives[path.name.casefold()] = path
    for name, path in archives.items():
        stem = Path(name).stem.casefold()
        if not name.startswith('skyrim - ') and not any(stem == p or stem.startswith(p + ' - ') for p in plugins):
            continue
        entries = all_entries(path)
        available.update(e['relative'] for e in entries)
        if path.is_relative_to(OUT / 'mod-stage'):
            for entry in entries:
                if entry['relative'].startswith('meshes/') and entry['relative'].endswith('.nif'):
                    new.setdefault(entry['relative'], entry)
    missing, errors = [], []
    references = 0
    for relative, provider in new.items():
        data = read_entry(provider) if isinstance(provider, dict) else provider.read_bytes()
        try:
            parsed = header(data)
            for kind, block in parsed['blocks']:
                if kind != 'BSShaderTextureSet':
                    continue
                stream = io.BytesIO(block)
                count = struct.unpack('<I', stream.read(4))[0]
                assert count <= 32
                for slot in range(count):
                    length = struct.unpack('<I', stream.read(4))[0]
                    raw = stream.read(length)
                    assert len(raw) == length
                    path = norm(raw.rstrip(b'\0').decode('utf-8'))
                    if not path:
                        continue
                    if not path.startswith('textures/'):
                        path = 'textures/' + path
                    references += 1
                    if path not in available:
                        missing.append({'mesh': relative, 'slot': slot, 'texture': path})
        except Exception as error:
            errors.append({'mesh': relative, 'error': str(error)})
    result = {'meshes_checked': len(new), 'texture_references': references,
              'missing': missing, 'parse_errors': errors}
    (OUT / 'texture-validation.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({k: v if k not in ('missing', 'parse_errors') else len(v) for k, v in result.items()}, indent=2))
    print(json.dumps(missing[:25], indent=2))


if __name__ == '__main__':
    main()
