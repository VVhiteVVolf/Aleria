"""User-authorized alpha and padding only; original generated RGB is preserved."""
import hashlib
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
ART = ROOT / 'AleriaAlmanach/assets/gwynthor-theater'


def normalize(record, circular):
    source = Image.open(record['source']).convert('RGBA')
    rgb = source.convert('RGB').tobytes()
    bounds = source.getchannel('A').point(lambda value: 255 if value >= 127 else 0).getbbox()
    left, top, right, bottom = bounds
    cx, cy = (left + right - 1) / 2, (top + bottom - 1) / 2
    rx, ry = (right - left) / 2, (bottom - top) / 2
    # Stay just inside the painted rim, excluding generated matte fringe.
    rx, ry = rx-10, ry-10
    if circular:
        rx = ry = min(rx, ry)
        cx, cy = round(cx), round(cy)
    mask = Image.new('L', source.size)
    mask.putdata([255 if ((x-cx)/rx)**2 + ((y-cy)/ry)**2 <= 1 else 0
                  for y in range(source.height) for x in range(source.width)])
    source.putalpha(mask)
    assert source.convert('RGB').tobytes() == rgb
    size = round(max(rx, ry) * 2 / 0.87)
    size += (1-size % 2) if circular else size % 2
    offset = (round((size-1)/2-cx), round((size-1)/2-cy))
    result = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    result.paste(source, offset)
    assert result.crop((offset[0], offset[1], offset[0]+source.width,
                        offset[1]+source.height)).convert('RGB').tobytes() == rgb
    target = ROOT / record['destination']
    result.save(target)
    correction = dict(authorization='User explicitly approved alpha and transparent padding for Awenfryn crest and theater sign.',
                      originalRgbPreserved=True, shape='circle' if circular else 'ellipse',
                      originalSize=list(source.size), finalSize=list(result.size),
                      originalBounds=list(bounds), offset=list(offset), radius=[rx, ry],
                      originalSha256=hashlib.sha256(Path(record['source']).read_bytes()).hexdigest(),
                      finalSha256=hashlib.sha256(target.read_bytes()).hexdigest())
    record.update(width=size, height=size, sha256=correction['finalSha256'], postprocess=correction)
    return correction


if __name__ == '__main__':
    path = ART / 'image-results.json'
    results = json.loads(path.read_text(encoding='utf-8'))
    corrections = {}
    for identity, circular in [('crest-awenfryn', True), ('theater-sign', False)]:
        record = next(item for item in results['images'] if item['id'] == identity)
        corrections[identity] = normalize(record, circular)
    path.write_text(json.dumps(results, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    (ART / 'sign-alpha-corrections.json').write_text(json.dumps(corrections, indent=2)+'\n', encoding='utf-8')
    print(json.dumps(corrections))
