"""Apply the authorized alpha-only circular cutout to the Brigantex revision."""
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
import hashlib
import json
import sys

import numpy as np
from PIL import Image


def main():
    root = Path(__file__).resolve().parents[1]
    workspace = root.parents[1]
    source = root / 'assets/generated/brigantex-druchtan.png'
    target = root / 'assets/brigantex.png'
    original = np.array(Image.open(source).convert('RGBA'))
    # Guard all four corners so the canonical exterior floodfill reaches them.
    guarded = Image.new('RGBA', (original.shape[1] + 4, original.shape[0] + 4))
    guarded.paste(Image.fromarray(original), (2, 2))
    guarded.save(target)
    spec = spec_from_file_location('aleria_heraldic_alpha', workspace / 'AleriaAlmanach/scripts/heraldic_emblem_alpha.py')
    module = module_from_spec(spec)
    sys.dont_write_bytecode = True
    spec.loader.exec_module(module)
    module.normalize_emblem_alpha(target, fill_enclosed=True)
    pixels = np.array(Image.open(target).convert('RGBA'))[2:-2, 2:-2].copy()
    assert np.array_equal(pixels[:, :, :3], original[:, :, :3])
    inside = pixels[:, :, 3] == 255
    y, x = np.nonzero(inside)
    cx, cy = round((x.min() + x.max()) / 2), round((y.min() + y.max()) / 2)
    outside_y, outside_x = np.nonzero(~inside)
    radius = int(np.hypot(outside_x - cx, outside_y - cy).min()) - 2
    grid_y, grid_x = np.ogrid[:inside.shape[0], :inside.shape[1]]
    disk = (grid_x - cx) ** 2 + (grid_y - cy) ** 2 <= radius ** 2
    assert not np.any(disk & ~inside)
    pixels[:, :, 3] = np.where(disk, 255, 0).astype('uint8')
    margin = int(radius * .15)
    side = max(pixels.shape[:2]) + margin * 2
    offset_x, offset_y = side // 2 - cx, side // 2 - cy
    assert offset_x >= 0 and offset_y >= 0
    assert offset_x + pixels.shape[1] <= side and offset_y + pixels.shape[0] <= side
    final = Image.new('RGBA', (side, side))
    final.paste(Image.fromarray(pixels), (offset_x, offset_y))
    final.save(target)
    retained = np.array(final)[offset_y:offset_y + original.shape[0], offset_x:offset_x + original.shape[1], :3]
    assert np.array_equal(retained, original[:, :, :3])
    proof = dict(source='assets/generated/brigantex-druchtan.png', production='assets/brigantex.png',
                 sourceSha256=hashlib.sha256(source.read_bytes()).hexdigest(),
                 productionSha256=hashlib.sha256(target.read_bytes()).hexdigest(),
                 rgbUnchanged=True, alphaValues=[0, 255], dimensions=[side, side],
                 circle=dict(centre=[cx + offset_x, cy + offset_y], radius=radius),
                 padding=dict(left=offset_x, top=offset_y),
                 outsideTransparent=True, interiorOpaque=True)
    (root / 'brigantex-alpha-audit.json').write_text(json.dumps(proof, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(proof))


if __name__ == '__main__':
    main()
