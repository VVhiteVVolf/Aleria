"""Explicitly authorized alpha/padding correction; never repaint RGB pixels."""
import hashlib
import json
from pathlib import Path
from PIL import Image
from heraldic_emblem_alpha import normalize_emblem_alpha

ROOT = Path(__file__).resolve().parents[2]
ART = ROOT / 'AleriaAlmanach/assets/schwarze-zitteraale'
manifest_path = ART / 'generation.json'
manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
record = next(asset for asset in manifest['assets'] if asset['id'] == 'emblem')
original = Path(record['original'])
target = ART / 'emblem.png'
source = Image.open(original).convert('RGBA')
rgb = source.convert('RGB').tobytes()
source.save(target)
audit = normalize_emblem_alpha(target)
image = Image.open(target).convert('RGBA')
assert image.convert('RGB').tobytes() == rgb
left, top, right, bottom = image.getchannel('A').getbbox()
cx, cy = (left + right - 1) / 2, (top + bottom - 1) / 2
size = max(image.width, image.height, round(max(right-left, bottom-top) / .87),
           round(2 * max(cx, cy, image.width-1-cx, image.height-1-cy) + 1))
offset = (round((size-1)/2-cx), round((size-1)/2-cy))
result = Image.new('RGBA', (size, size), (0, 0, 0, 0))
result.paste(image, offset)
assert result.crop((offset[0], offset[1], offset[0]+image.width, offset[1]+image.height)).convert('RGB').tobytes() == rgb
result.save(target)
audit.update(authorization='User explicitly approved alpha and transparent edge cleanup on 2026-10-21.',
             rgbUnchanged=True, offset=offset, finalSize=result.size,
             originalSha256=hashlib.sha256(original.read_bytes()).hexdigest(),
             finalSha256=hashlib.sha256(target.read_bytes()).hexdigest())
record['alpha'] = 'user-authorized correction; original RGB preserved'
record['postprocess'] = audit
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
(ART / 'emblem-alpha-correction.json').write_text(json.dumps(audit, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print(json.dumps(audit))
