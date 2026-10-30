"""Package selected image_gen art using the board's existing display/thumbnail format.

No repainting or alpha correction: originals are retained and the derivatives
only resize/crop the selected poster for the established board catalog.
"""
from pathlib import Path
import hashlib
import json
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / 'assets/images/notices/gwrgan-gegen-lleucu'
specs = json.loads((ART / 'generation-prompts.json').read_text(encoding='utf-8'))
results = []
for spec in specs['entries']:
    p = ART / spec['file']
    im = Image.open(p)
    results.append({'id': spec['id'], 'file': spec['file'], 'width': im.width, 'height': im.height,
                    'sha256': hashlib.sha256(p.read_bytes()).hexdigest(), 'mode': im.mode})
    if spec['id'] != 'court-poster':
        rgba = im.convert('RGBA')
        box = rgba.getchannel('A').point(lambda value: 255 if value >= 64 else 0).getbbox()
        derivative = rgba.crop(box)
        derivative.thumbnail((480, 360), Image.Resampling.LANCZOS)
        derivative.save(p.with_suffix('.webp'), 'WEBP', quality=92, method=6)

poster = Image.open(ART / 'gericht-plakat-v2.png').convert('RGBA')
neithon = Image.open(ROOT / 'assets/images/issuers/gwynthor-verwaltung/neithon-draig-unterschrift-v1.png').convert('RGBA')
neithon = neithon.crop(neithon.getchannel('A').point(lambda value: 255 if value >= 64 else 0).getbbox())
neithon.thumbnail((480, 200), Image.Resampling.LANCZOS)
neithon.save(ART / 'neithon-draig-unterschrift-display.webp', 'WEBP', quality=92, method=6)
display = poster.copy()
display.thumbnail((612, 612), Image.Resampling.LANCZOS)
display_path = ROOT / 'assets/images/board-posters/display/gericht-gwrgan-lleucu.webp'
display.save(display_path, 'WEBP', quality=92, method=6)
bounds = display.getchannel('A').point(lambda value: 255 if value >= 128 else 0).getbbox()
left, top, right, bottom = bounds
thumbnail = display.crop(bounds)
thumbnail.thumbnail((200, 200), Image.Resampling.LANCZOS)
thumbnail_path = ROOT / 'assets/images/board-posters/thumbnails/gericht-gwrgan-lleucu.webp'
thumbnail.save(thumbnail_path, 'WEBP', quality=88, method=6)
entry = {'id': 'gericht-gwrgan-lleucu', 'name': 'Gräfliches Gericht · Gwrgan gegen Lleucu', 'category': 'Ankündigungen',
    'src': display_path.relative_to(ROOT).as_posix(), 'width': display.width, 'height': display.height,
    'bounds': {'x': left, 'y': top, 'w': right-left, 'h': bottom-top},
    'aspect': round((right-left)/(bottom-top), 6),
    'originalSrc': (ART / 'gericht-plakat-v2.png').relative_to(ROOT).as_posix(),
    'thumbnail': {'src': thumbnail_path.relative_to(ROOT).as_posix(), 'width': thumbnail.width, 'height': thumbnail.height,
                  'bounds': {'x': 0, 'y': 0, 'w': thumbnail.width, 'h': thumbnail.height}}}
catalog_path = ROOT / 'assets/data/board-art-catalog.json'
catalog = json.loads(catalog_path.read_text(encoding='utf-8'))
catalog['posters'] = [asset for asset in catalog['posters'] if asset['id'] != entry['id']] + [entry]
catalog_path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
(ART / 'image-results.json').write_text(json.dumps({'tool': 'built-in image_gen', 'images': results, 'posterCatalog': entry}, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print(json.dumps({'images': len(results), 'poster': entry['id'], 'thumbnailBytes': thumbnail_path.stat().st_size}))
