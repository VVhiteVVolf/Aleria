"""Check staged assets against the current MO2 profile, including active BSAs."""
from pathlib import Path
import collections
import io
import json
import os
import struct
import sys

ROOT = Path(__file__).parent
sys.path.insert(0, str(ROOT.parents[1] / 'skyrim-outfit-catalog/scripts'))
sys.path.insert(0, str(ROOT.parent / 'obody-repair-cleanup-20261006'))
sys.path.insert(0, str(ROOT.parent / 'obody-bodyslide-audit-20261006'))
from profile_reader import selected_profile
from plugin_reader import records, text
from nif_links import header
from archive_mesh import read_entry


def norm(value):
    return value.replace('\\', '/').strip('/').casefold().removeprefix('data/')


def archive_entries(path):
    """Read named BSA resources; payload decoding uses the existing SSE reader."""
    with path.open('rb') as stream:
        magic, version, offset, flags, folder_count, file_count, _, file_bytes, _ = struct.unpack('<4s8I', stream.read(36))
        if magic != b'BSA\0' or version not in {103, 104, 105} or flags & 3 != 3:
            raise ValueError('Unsupported or unnamed BSA: '+str(path))
        stream.seek(offset)
        folders = []
        for _ in range(folder_count):
            values = struct.unpack('<QIIQ' if version == 105 else '<QII', stream.read(24 if version == 105 else 16))
            folders.append(values[1])
        entries = []
        for count in folders:
            length = stream.read(1)[0]
            folder = stream.read(length).rstrip(b'\0').decode('utf-8', errors='replace')
            for _ in range(count):
                _, size, entry_offset = struct.unpack('<QII', stream.read(16))
                entries.append({'folder':folder, 'size':size & 0x3fffffff, 'offset':entry_offset,
                                'compressed':bool(flags & 4)^bool(size & 0x40000000)})
        names = stream.read(file_bytes).rstrip(b'\0').split(b'\0')
        if len(entries) != file_count or len(names) != file_count:
            raise ValueError('BSA file table mismatch')
        for entry, name in zip(entries, names):
            entry['relative'] = norm(entry.pop('folder')+'/'+name.decode('utf-8', errors='replace'))
            entry.update(archive=str(path), version=version, embedded_names=bool(flags & 0x100))
        return entries


def main():
    plan = json.loads((ROOT/'selected-stage.json').read_text(encoding='utf-8'))
    instance = Path(r'E:\Nolvus\Instances\Nolvus Awakening')
    profile = selected_profile(instance)
    available = set()
    plugins = {Path(p).stem.casefold() for p in profile['plugins']}
    plugins.update(Path(p).stem.casefold() for m in plan['mods'] for p in m['plugins'])
    new, archives = {}, {}
    sources = profile['sources']+[(m['name'], Path(m['directory'])) for m in plan['mods']]
    for index, (mod, base) in enumerate(sources):
        for directory, _, files in os.walk(base):
            for name in files:
                path = Path(directory)/name
                relative = norm(path.relative_to(base).as_posix())
                if path.suffix.casefold() in {'.nif', '.tri', '.dds', '.pex'}:
                    available.add(relative)
                    if base.is_relative_to(ROOT/'staged') and path.suffix.casefold() == '.nif':
                        new[relative] = path
                elif path.suffix.casefold() == '.bsa':
                    archives.setdefault(name.casefold(), path)
        if index % 1000 == 0:
            print('Indexed %d/%d mod folders'%(index, len(sources)), flush=True)
    for name, path in archives.items():
        stem = Path(name).stem.casefold()
        if not name.startswith('skyrim - ') and not any(stem == p or stem.startswith(p+' - ') for p in plugins):
            continue
        entries = archive_entries(path)
        available.update(e['relative'] for e in entries)
        if path.is_relative_to(ROOT/'staged'):
            new.update((e['relative'], e) for e in entries if e['relative'].endswith('.nif'))
    for mod in plan['mods']:
        generated = ROOT/'generated'/mod['name']
        for path in generated.rglob('*'):
            if path.is_file():
                relative = norm(path.relative_to(generated).as_posix())
                available.add(relative)
                if path.suffix.casefold() == '.nif':
                    new[relative] = path
    plugin_paths, missing_models = [], []
    for mod in plan['mods']:
        for name in mod['plugins']:
            path = Path(mod['directory'])/name
            for kind, flags, form, fs in records(path, (b'ARMA', b'ARMO', b'HDPT', b'TXST', b'RACE')):
                for key, value in fs:
                    if key in {b'MODL', b'MOD2', b'MOD3', b'MOD4', b'MOD5'}:
                        relative = norm(text(value))
                        if relative and relative.endswith('.nif'):
                            relative = relative if relative.startswith('meshes/') else 'meshes/'+relative
                            plugin_paths.append(relative)
                            if relative not in available:
                                missing_models.append({'plugin':name, 'form':hex(form), 'path':relative})
    errors, missing, bodytri = [], [], []
    references = 0
    for relative, provider in new.items():
        try:
            data = read_entry(provider) if isinstance(provider, dict) else provider.read_bytes()
            parsed = header(data)
            for kind, block in parsed['blocks']:
                if kind == 'NiStringExtraData' and len(block) >= 8:
                    name, value = struct.unpack_from('<II', block)
                    if name < len(parsed['strings']) and value < len(parsed['strings']) and parsed['strings'][name] == b'BODYTRI':
                        path = norm(parsed['strings'][value].decode('utf-8'))
                        path = path if path.startswith('meshes/') else 'meshes/'+path
                        bodytri.append({'mesh':relative, 'tri':path, 'exists':path in available})
                if kind != 'BSShaderTextureSet':
                    continue
                stream = io.BytesIO(block)
                count = struct.unpack('<I', stream.read(4))[0]
                if count > 32:
                    raise ValueError('Invalid shader texture count')
                for slot in range(count):
                    length = struct.unpack('<I', stream.read(4))[0]
                    raw = stream.read(length)
                    if len(raw) != length:
                        raise ValueError('Truncated shader texture')
                    path = norm(raw.rstrip(b'\0').decode('utf-8'))
                    if not path:
                        continue
                    path = path if path.startswith('textures/') else 'textures/'+path
                    references += 1
                    if path not in available:
                        missing.append({'mesh':relative, 'texture':path, 'slot':slot,
                                        'referenced_model':relative in plugin_paths or '/facegeom/' in relative})
        except Exception as error:
            errors.append({'mesh':relative, 'error':str(error)})
    result = {'available_resources':len(available), 'meshes_checked':len(new), 'texture_references':references,
              'missing_models':missing_models, 'missing_textures':missing, 'parse_errors':errors, 'bodytri':bodytri}
    (ROOT/'resource-validation.json').write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding='utf-8')
    print(json.dumps({k:(len(v) if isinstance(v, list) else v) for k,v in result.items()}, indent=2))
    print(json.dumps({'missing_models':missing_models[:15], 'missing_textures':missing[:20], 'parse_errors':errors[:8]}, indent=2))


if __name__ == '__main__':
    main()
