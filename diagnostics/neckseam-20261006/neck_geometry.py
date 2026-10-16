"""Read SSE vertex buffers, including skinned partition and dynamic head data.

No game files are changed. Coordinates are bind-model coordinates; this does
not simulate the game's animation, saved weight, or runtime OBody morphs.
"""
import json
import math
import struct
from pathlib import Path
from audit import header

ROOT = Path(__file__).parent


def shapes(path):
    info = header(Path(path).read_bytes())
    result = []
    for kind, data in info['blocks']:
        if kind not in ('BSTriShape', 'BSDynamicTriShape'):
            continue
        name, extras = struct.unpack_from('<II', data)
        transform_offset = 16 + extras * 4
        translation = struct.unpack_from('<3f', data, transform_offset)
        rotation = struct.unpack_from('<9f', data, transform_offset + 12)
        scale = struct.unpack_from('<f', data, transform_offset + 48)[0]
        skin, shader, alpha = struct.unpack_from('<3i', data, 88 + extras * 4)
        desc, triangles, count, size = struct.unpack_from('<QHHI', data, 100 + extras * 4)
        start = 116 + extras * 4
        stride = (desc & 15) * 4
        dynamic = kind == 'BSDynamicTriShape'
        if dynamic:
            # BSDynamicTriShape ends in a uint byte size and count Vector4s.
            start = len(data) - 16 * count
            if struct.unpack_from('<I', data, start - 4)[0] != count * 16:
                raise ValueError('Unexpected dynamic vertex table')
            stride = 16
            buffer = data
        elif size:
            buffer = data
        elif skin >= 0:
            skin_kind, skin_data = info['blocks'][skin]
            if skin_kind not in ('NiSkinInstance', 'BSDismemberSkinInstance'):
                raise ValueError('Unsupported skin block')
            partition = struct.unpack_from('<i', skin_data, 4)[0]
            part_kind, buffer = info['blocks'][partition]
            if part_kind != 'NiSkinPartition':
                raise ValueError('Unsupported partition block')
            partitions, size, stride, desc = struct.unpack_from('<IIIQ', buffer)
            if count and size != count * stride:
                raise ValueError('Vertex table does not match shape')
            if not stride or size % stride:
                raise ValueError('Invalid partition vertex size')
            count = size // stride
            start = 20
        else:
            continue
        vertices = [struct.unpack_from('<3f', buffer, start + n * stride) for n in range(count)]
        if not all(math.isfinite(v) for xyz in vertices for v in xyz):
            raise ValueError('Nonfinite vertex')
        shader_type = struct.unpack_from('<I', info['blocks'][shader][1])[0] if shader >= 0 else None
        result.append({'name': info['strings'][name].decode(), 'kind': kind,
                       'shader_type': shader_type, 'translation': translation,
                       'rotation': rotation, 'scale': scale, 'vertices': vertices})
    return result


def summarize(shape):
    points = shape['vertices']
    bounds = [[min(p[i] for p in points), max(p[i] for p in points)] for i in range(3)]
    # Face/skin geometry only. The body neck is the uppermost skin contour;
    # the head's junction is the bottom contour. Save raw selections for review.
    neck = []
    if shape['shader_type'] in (4, 5):
        extreme = bounds[2][0 if shape['shader_type'] == 4 else 1]
        neck = [(i, p) for i, p in enumerate(points) if abs(p[2] - extreme) < 0.06]
    return {k: v for k, v in shape.items() if k != 'vertices'} | {
        'vertices': len(points), 'bounds': bounds, 'neck_extreme_points': neck}


def main():
    models = json.loads((ROOT / 'model-comparison.json').read_text(encoding='utf-8'))
    result = {}
    for relative, providers in models.items():
        if 'amulet' in relative:
            continue
        for entry in providers:
            paths = [Path(entry['path'])]
            if '_1.nif' in str(paths[0]):
                paths.append(Path(str(paths[0]).replace('_1.nif', '_0.nif')))
            for path in paths:
                if path.is_file():
                    result[str(path)] = [summarize(s) for s in shapes(path)]
                    for shape in result[str(path)]:
                        if shape['shader_type'] in (4, 5):
                            print(path.name, shape['name'], shape['bounds'],
                                  'neck points:', len(shape['neck_extreme_points']),
                                  'transform:', shape['translation'], shape['scale'])
    (ROOT / 'neck-geometry.json').write_text(json.dumps(result, indent=2), encoding='utf-8')


if __name__ == '__main__':
    main()
