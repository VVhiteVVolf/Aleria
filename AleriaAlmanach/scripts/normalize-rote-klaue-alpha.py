"""Only the two alpha/padding corrections explicitly approved on 21 October."""
import hashlib
import json
from pathlib import Path
from PIL import Image, ImageDraw
from heraldic_emblem_alpha import normalize_emblem_alpha

ROOT = Path(__file__).resolve().parents[2]
ART = ROOT / 'AleriaAlmanach/assets/rote-klaue'

def normalize(record):
    target = ART / record['file']
    original = Image.open(record['source']).convert('RGBA')
    rgb = original.convert('RGB').tobytes()
    original.save(target)
    circular = record['file'] == 'wappen.png'
    audit = normalize_emblem_alpha(target, fill_enclosed=circular)
    image = Image.open(target).convert('RGBA')
    left, top, right, bottom = image.getchannel('A').getbbox()
    cx, cy = (left + right - 1) / 2, (top + bottom - 1) / 2
    if circular:
        # Leave the faint straight generator fringe outside the wooden rim.
        cx, cy = round(cx), round(cy)
        radius = round(min(right-left, bottom-top) / 2) - 40
        mask = Image.new('L', image.size)
        ImageDraw.Draw(mask).ellipse((round(cx-radius), round(cy-radius), round(cx+radius), round(cy+radius)), fill=255)
        image.putalpha(mask)
        left, top, right, bottom = mask.getbbox()
    size = max(image.width, image.height, round(max(right-left, bottom-top) / .87),
               round(2 * max(cx, cy, image.width-1-cx, image.height-1-cy) + 1))
    offset = (round((size-1)/2-cx), round((size-1)/2-cy))
    result = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    result.paste(image, offset)
    assert result.crop((offset[0], offset[1], offset[0]+image.width, offset[1]+image.height)).convert('RGB').tobytes() == rgb
    result.save(target)
    audit.update(authorization='User explicitly approved alpha, outside edge and transparent centering for Valerus crest and Red Claw sign on 2026-10-21.',
                 rgbUnchanged=True, offset=offset, finalSize=list(result.size), circular=circular,
                 finalBounds=list(result.getchannel('A').getbbox()), opaquePixelsFinal=result.getchannel('A').histogram()[255],
                 sourceSha256=hashlib.sha256(Path(record['source']).read_bytes()).hexdigest(),
                 finalSha256=hashlib.sha256(target.read_bytes()).hexdigest())
    record['postprocess'] = audit
    record['alpha'] = 'user-authorized alpha and transparent padding only; RGB preserved'
    return audit

if __name__ == '__main__':
    manifest_path = ART / 'generation.json'
    manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
    audits = [normalize(record) for record in manifest['assets'] if record['file'] in ('wappen.png', 'ladenschild.png')]
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    (ART / 'alpha-corrections.json').write_text(json.dumps(audits, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(json.dumps(audits))
