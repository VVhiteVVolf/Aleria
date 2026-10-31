"""Retain generated originals and package the selected notice artwork for display."""
from pathlib import Path
import hashlib
import json
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / 'assets/images/notices/lotsensuche'
images = []
for name in ['blutbund-wachssiegel-v1', 'vebrand-unterschrift-v1', 'wegweiser-icon-v1']:
    source = ART / (name + '.png')
    image = Image.open(source).convert('RGBA')
    bounds = image.getchannel('A').point(lambda value: 255 if value >= 64 else 0).getbbox()
    derivative = image.crop(bounds)
    derivative.thumbnail((480, 360), Image.Resampling.LANCZOS)
    target = source.with_suffix('.webp')
    derivative.save(target, 'WEBP', quality=92, method=6)
    images.append({'file': source.name, 'width': image.width, 'height': image.height,
                   'sha256': hashlib.sha256(source.read_bytes()).hexdigest(), 'display': target.name})

source = ART / 'lotsen-plakat-v2.png'
poster = Image.open(source).convert('RGBA')
display = poster.copy()
display.thumbnail((612, 612), Image.Resampling.LANCZOS)
display_path = ROOT / 'assets/images/board-posters/display/lotsensuche-vebrand.webp'
display.save(display_path, 'WEBP', quality=92, method=6)
left, top, right, bottom = display.getchannel('A').point(lambda value: 255 if value >= 128 else 0).getbbox()
thumbnail = display.crop((left, top, right, bottom))
thumbnail.thumbnail((200, 200), Image.Resampling.LANCZOS)
thumbnail_path = ROOT / 'assets/images/board-posters/thumbnails/lotsensuche-vebrand.webp'
thumbnail.save(thumbnail_path, 'WEBP', quality=88, method=6)
entry = {'id': 'lotsensuche-vebrand', 'name': 'Lotsse gesucht', 'category': 'Hilfsgesuche',
         'src': display_path.relative_to(ROOT).as_posix(), 'width': display.width, 'height': display.height,
         'bounds': {'x': left, 'y': top, 'w': right-left, 'h': bottom-top},
         'aspect': round((right-left)/(bottom-top), 6),
         'originalSrc': source.relative_to(ROOT).as_posix(),
         'thumbnail': {'src': thumbnail_path.relative_to(ROOT).as_posix(), 'width': thumbnail.width, 'height': thumbnail.height,
                       'bounds': {'x': 0, 'y': 0, 'w': thumbnail.width, 'h': thumbnail.height}}}
catalog_path = ROOT / 'assets/data/board-art-catalog.json'
catalog = json.loads(catalog_path.read_text(encoding='utf-8'))
catalog['posters'] = [asset for asset in catalog['posters'] if asset['id'] != entry['id']] + [entry]
catalog_path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
(ART / 'image-results.json').write_text(json.dumps({'tool': 'built-in image_gen', 'images': images,
    'poster': {'file': source.name, 'sha256': hashlib.sha256(source.read_bytes()).hexdigest(), 'catalog': entry}},
    ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print(json.dumps({'images': len(images)+1, 'poster': entry['id'], 'thumbnailBytes': thumbnail_path.stat().st_size}))
