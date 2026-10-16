"""Compare current versus replaced meshes; read game files only."""
from pathlib import Path
import json
import struct
import sys
from audit import model, header, INSTANCE
from profile_reader import selected_profile

ROOT = Path(__file__).parent


def shader(data):
    kind, name, count = struct.unpack_from('<III', data)
    offset = 16 + count * 4
    flags = struct.unpack_from('<II', data, offset)
    gloss = struct.unpack_from('<f', data, offset + 56)[0]
    strength = struct.unpack_from('<f', data, offset + 72)[0]
    return {'type': kind, 'flags': [hex(n) for n in flags], 'gloss': gloss, 'specular_strength': strength}


def inspect(path):
    result = model(path)
    result['shaders'] = [shader(bytes.fromhex(entry['hex'])) for entry in result['shaders']]
    result['names'] = [s.decode('utf-8', errors='replace') for s in header(path.read_bytes())['strings']
                       if not s.startswith((b'NPC ', b'HDT ', b'CME '))]
    return result


def main():
    profile = selected_profile(INSTANCE)
    relatives = [
        'meshes/clothes/wench/wenchoutfitf_1.nif',
        'meshes/clothes/blacksmith/f/torso_1.nif',
        'meshes/actors/character/character assets/femalebody_1.nif',
        'meshes/actors/character/facegendata/facegeom/skyrim.esm/00013654.nif',
        'meshes/actors/character/facegendata/facegeom/3dnpc.esp/0000d6ee.nif',
        'meshes/actors/character/facegendata/facegeom/3dnpc.esp/000dbdaf.nif',
        'meshes/actors/character/facegendata/facegeom/l3dnpcfollowerreplacer.esp/00000808.nif',
        'meshes/armor/amuletsandrings/goldamuletgemsf_1.nif',
        'meshes/armor/amuletsandrings/silveramuletemeraldf_1.nif',
    ]
    result = {}
    for relative in relatives:
        providers = [(name, directory / relative) for name, directory in profile['sources'] if (directory / relative).is_file()]
        if not providers:
            continue
        selected = providers[:1]
        if relative.startswith('meshes/clothes/'):
            selected += [entry for entry in providers[1:] if 'OBody Output' in entry[0]][:1]
        result[relative] = [{'mod': name, **inspect(path)} for name, path in selected]
        for entry in result[relative]:
            print(relative, entry['mod'], '\n', entry['shaders'], '\n', entry['textures'][:1], flush=True)
    (ROOT / 'model-comparison.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    textures = {p for providers in result.values() for entry in providers for block in entry['textures'] for p in block if p}
    texture_sources = {}
    for name in textures:
        relative = name.replace('\\', '/').casefold()
        if not relative.startswith('textures/'):
            relative = 'textures/' + relative
        found = next(((mod, str(directory / relative)) for mod, directory in profile['sources'] if (directory / relative).is_file()), None)
        texture_sources[name] = found
    (ROOT / 'texture-providers.json').write_text(json.dumps(texture_sources, ensure_ascii=False, indent=2), encoding='utf-8')


if __name__ == '__main__':
    main()
