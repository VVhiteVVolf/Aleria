"""Admit the ImageGen Falto emblem using Aleria's shared heraldry processor."""
from pathlib import Path
import hashlib
import json
import sys
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
sys.dont_write_bytecode = True
sys.path.insert(0, str(ROOT / 'AleriaAlmanach/scripts'))
from heraldic_emblem_alpha import normalize_emblem_alpha, frame_circular_emblem

ART = ROOT / 'Stammb\u00e4ume/assets/images/houses/Venalys'
SOURCE = ROOT / 'diagnostics/falto-register-2026-10-31/image-sources/falto-selected-generator.png'
TARGET = ART / 'haus-falto.png'


def main():
    original = Image.open(SOURCE).convert('RGBA')
    # Protect a touching contour while the shared processor fills the exterior.
    guard = Image.new('RGBA', (original.width + 4, original.height + 4))
    guard.paste(original, (2, 2))
    guard.save(TARGET)
    normalize_emblem_alpha(TARGET)
    cleaned = Image.open(TARGET).crop((2, 2, original.width + 2, original.height + 2))
    final, padding, circle = frame_circular_emblem(cleaned, coverage=.88)
    final.save(TARGET)
    pixels = np.array(final)
    x, y = padding['left'], padding['top']
    assert np.array_equal(np.array(original)[:, :, :3], pixels[y:y+original.height, x:x+original.width, :3])
    yy, xx = np.ogrid[:final.height, :final.width]
    cx, cy = circle['centre']
    assert np.array_equal(pixels[:, :, 3] == 255, (xx-cx)**2 + (yy-cy)**2 <= circle['radius']**2)
    assert set(np.unique(pixels[:, :, 3])) == {0, 255}
    report = dict(schema='aleria.heraldry-production', generator='built-in image_gen',
                  source=SOURCE.relative_to(ROOT).as_posix(), sourceSha256=hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
                  target=TARGET.relative_to(ROOT).as_posix(), sha256=hashlib.sha256(TARGET.read_bytes()).hexdigest(),
                  size=list(final.size), padding=padding, circle=circle, rgbUnchanged=True, alphaValues=[0, 255])
    (SOURCE.parents[1] / 'emblem-audit.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    for label, colour in [('light', '#f5ecd6'), ('dark', '#211b16')]:
        preview = Image.new('RGBA', final.size, colour)
        preview.alpha_composite(final)
        preview.thumbnail((700, 700))
        preview.convert('RGB').save(SOURCE.parents[1] / f'emblem-{label}.jpg', quality=94)
    print(json.dumps(report))


if __name__ == '__main__':
    main()
