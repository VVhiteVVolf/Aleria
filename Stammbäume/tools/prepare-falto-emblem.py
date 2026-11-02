"""Admit the ImageGen Falto emblem using Aleria's shared heraldry processor."""
from pathlib import Path
import hashlib
import json
import sys
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
sys.dont_write_bytecode = True
sys.path.insert(0, str(ROOT / 'AleriaAlmanach/scripts'))
from heraldic_emblem_alpha import prepare_emblem_from_source

ART = ROOT / 'Stammb\u00e4ume/assets/images/houses/Venalys'
SOURCE = ROOT / 'diagnostics/falto-register-2026-10-31/image-sources/falto-selected-generator.png'
TARGET = ART / 'haus-falto.png'


def main():
    prepared = prepare_emblem_from_source(SOURCE, TARGET, coverage=.88)
    final = Image.open(TARGET).convert('RGBA')
    report = dict(schema='aleria.heraldry-production', generator='built-in image_gen',
                  source=SOURCE.relative_to(ROOT).as_posix(), sourceSha256=hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
                  target=TARGET.relative_to(ROOT).as_posix(), sha256=hashlib.sha256(TARGET.read_bytes()).hexdigest(),
                  **prepared)
    (SOURCE.parents[1] / 'emblem-audit.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    for label, colour in [('light', '#f5ecd6'), ('dark', '#211b16')]:
        preview = Image.new('RGBA', final.size, colour)
        preview.alpha_composite(final)
        preview.thumbnail((700, 700))
        preview.convert('RGB').save(SOURCE.parents[1] / f'emblem-{label}.jpg', quality=94)
    print(json.dumps(report))


if __name__ == '__main__':
    main()
