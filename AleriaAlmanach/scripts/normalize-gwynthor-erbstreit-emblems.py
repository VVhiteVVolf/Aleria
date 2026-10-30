"""Explicit user approval: 30 October 2026; alpha cleanup with the existing tool.

Preserve the selected generator originals and every RGB pixel. This delegates
to the shared heraldry alpha processor rather than adding another algorithm.
"""
import hashlib
import json
from pathlib import Path
import shutil
from heraldic_emblem_alpha import normalize_emblem_alpha

ROOT = Path(__file__).resolve().parents[2]
ART = ROOT / 'AleriaAlmanach/assets/gwynthor-erbstreit'
SOURCES = ROOT / 'diagnostics/gwynthor-erbstreit-2026-10-30/image-sources'
TARGETS = {
    'cochdon': ROOT / 'Stammb\u00e4ume/assets/images/houses/Llamreis Ankunft/B\u00fcrgerliche/Gwynthor/Cochdon.png',
    'twyllod': ROOT / 'Stammb\u00e4ume/assets/images/houses/Llamreis Ankunft/B\u00fcrgerliche/Gwynthor/Twyllod.png',
    'llafnfor': ROOT / 'Stammb\u00e4ume/assets/images/houses/Klaueninsel/haus-llafnfor.png',
}

records = []
for name, target in TARGETS.items():
    image = ART / f'crests/{name}.png'
    original = SOURCES / f'{name}-selected-generator.png'
    SOURCES.mkdir(parents=True, exist_ok=True)
    if not original.exists():
        shutil.copyfile(image, original)
    result = normalize_emblem_alpha(image)
    shutil.copyfile(image, target)
    records.append({**result,
        'source': original.relative_to(ROOT).as_posix(),
        'sourceSha256': hashlib.sha256(original.read_bytes()).hexdigest(),
        'sha256': hashlib.sha256(image.read_bytes()).hexdigest(),
        'registryCopy': target.relative_to(ROOT).as_posix()})

report = {'authorization': 'User explicitly approved the existing local heraldry processor in this conversation on 2026-10-30.',
          'kind': 'alpha-only', 'rgbUnchanged': True, 'images': records}
(ART / 'emblem-alpha-correction.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps(records, ensure_ascii=False))
