"""Read-only validation of generated Rast artwork; never changes image pixels."""
import hashlib
import json
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[2]
art = root / 'AleriaAlmanach/assets/letzte-rast'
manifest = json.loads((art / 'image-prompts.json').read_text(encoding='utf-8'))
report = []
for job in manifest['entries']:
    path = root / job['destination']
    if not path.exists():
        report.append({'id': job['id'], 'missing': True})
        continue
    with Image.open(path) as source:
        rgba = source.convert('RGBA')
        alpha = rgba.getchannel('A')
        width, height = rgba.size
        record = {'id': job['id'], 'mode': source.mode, 'width': width, 'height': height,
                  'sha256': hashlib.sha256(path.read_bytes()).hexdigest()}
        if job['transparent']:
            record.update(alphaRange=alpha.getextrema(), bounds=alpha.getbbox(),
                          cornerAlpha=[alpha.getpixel(pos) for pos in [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]])
            if job['id'] == 'crest-vann':
                bounds = alpha.point(lambda value: 255 if value > 127 else 0).getbbox()
                left, top, right, bottom = bounds
                record['opaqueBounds'] = bounds
                record['occupiedWidth'] = (right-left)/width
                record['aspectError'] = abs((right-left)/(bottom-top)-1)
                cx, cy = (left+right-1)/2, (top+bottom-1)/2
                radius = min(right-left, bottom-top)/2-8
                record['nonOpaqueInterior'] = sum(1 for y in range(top+8, bottom-8) for x in range(left+8, right-8)
                    if (x-cx)**2+(y-cy)**2 < radius**2 and alpha.getpixel((x, y)) != 255)
        report.append(record)
(art / 'image-audit.json').write_text(json.dumps({'readOnly': True, 'images': report}, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print(json.dumps({'present':sum(not x.get('missing') for x in report),'missing':sum(bool(x.get('missing')) for x in report),
                  'crest':next(x for x in report if x['id']=='crest-vann')}, ensure_ascii=False))
