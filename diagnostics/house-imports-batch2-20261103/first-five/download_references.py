from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
from pathlib import Path
from urllib.request import Request, urlopen
import hashlib
import json
import sys
from PIL import Image, ImageDraw

BASE = Path(__file__).resolve().parent
OUTPUT = BASE / 'original-images'
OUTPUT.mkdir(exist_ok=True)
rows = json.loads((BASE / 'source-analysis.json').read_text(encoding='utf-8'))
roles = {0: 'crest', 1: 'place-emblem', 2: 'warrior'}
jobs = [dict(houseId=row['id'], slug=row['slug'], role=roles.get(image['index'], 'source-image'), url=image['url'])
        for row in rows for image in row['images'] if not image['placeholder']]

def download(job):
    filename = job['slug'] + '-' + job['role'] + '.png'
    path = OUTPUT / filename
    try:
        if not path.exists():
            request = Request(job['url'], headers={'User-Agent': 'Mozilla/5.0'})
            with urlopen(request, timeout=40) as response:
                raw = response.read()
            Image.open(BytesIO(raw)).verify()
            path.write_bytes(raw)
        raw = path.read_bytes()
        image = Image.open(BytesIO(raw))
        return {**job, 'file': str(path.relative_to(BASE)).replace('\\', '/'),
                'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw),
                'width': image.width, 'height': image.height, 'format': image.format,
                'hasAlpha': 'A' in image.getbands(), 'status': 'downloaded-original'}
    except Exception as exc:
        return {**job, 'status': 'failed', 'error': str(exc)}

with ThreadPoolExecutor(max_workers=4) as executor:
    manifest = list(executor.map(download, jobs))
(BASE / 'image-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

sheet = Image.new('RGB', (900, 5 * 385), '#e7e5dc')
draw = ImageDraw.Draw(sheet)
for row_index, row in enumerate(rows):
    draw.text((12, row_index * 385 + 8), row['id'], fill='#151515')
    for column, role in enumerate(roles.values()):
        record = next((m for m in manifest if m['houseId'] == row['id'] and m['role'] == role), None)
        if not record or record['status'] != 'downloaded-original':
            continue
        im = Image.open(BASE / record['file']).convert('RGBA')
        im.thumbnail((275, 330))
        left = column * 300 + (300 - im.width) // 2
        top = row_index * 385 + 32 + (330 - im.height) // 2
        sheet.paste(im, (left, top), im)
        draw.text((column * 300 + 10, row_index * 385 + 365), role, fill='#151515')
sheet.save(BASE / 'reference-contact-sheet.jpg', quality=88)
sys.stdout.reconfigure(encoding='utf-8')
print(json.dumps(manifest, ensure_ascii=False))
