"""Read generated originals without altering their pixels; record alpha and contact proof."""
import json
import re
from pathlib import Path
from PIL import Image, ImageDraw

base = Path(__file__).resolve().parent
manifest = json.loads((base / 'health-traits-image-jobs.json').read_text(encoding='utf-8'))
ready = {path.stem: json.loads(path.read_text(encoding='utf-8')) for path in (base / 'generated').glob('*.json')}
ready.update({path.stem: json.loads(path.read_text(encoding='utf-8')) for path in (base / 'corrections').glob('*.json')})
entries = [entry for entry in manifest['entries'] if entry['id'] in ready]
contact = Image.new('RGB', (1200, ((len(entries) + 5) // 6) * 224), '#e7e0d2')
draw = ImageDraw.Draw(contact)
report = []
for index, entry in enumerate(entries):
    receipt = ready[entry['id']]
    raw = receipt['generatedPath']
    # The tool hint includes its directory followed by "as <full PNG path>".
    resolved = re.search(r'[A-Za-z]:\\[^:\r\n]*?\.png', raw)
    path = Path(resolved.group(0) if resolved else raw)
    if str(path) != raw:
        receipt['generatedPath'] = str(path)
        folder = 'corrections' if (base / 'corrections' / (entry['id'] + '.json')).exists() else 'generated'
        (base / folder / (entry['id'] + '.json')).write_text(json.dumps(receipt) + '\n', encoding='utf-8')
    with Image.open(path) as original:
        alpha = original.getchannel('A') if 'A' in original.getbands() else None
        corners = [alpha.getpixel(point) for point in [(0, 0), (original.width - 1, 0), (0, original.height - 1), (original.width - 1, original.height - 1)]] if alpha else []
        valid = original.width == original.height and bool(alpha) and alpha.getextrema() == (0, 255) and corners == [0, 0, 0, 0]
        report.append({'id': entry['id'], 'generatedPath': str(path), 'size': list(original.size), 'alphaExtrema': alpha.getextrema() if alpha else None, 'cornerAlpha': corners, 'valid': valid})
        thumb = original.copy()
        thumb.thumbnail((194, 194))
        x, y = (index % 6) * 200, (index // 6) * 224
        contact.paste(thumb, (x, y), thumb.getchannel('A') if alpha else None)
        # Keep long IDs readable on two lines, without changing the source image.
        label = entry['id']
        draw.text((x + 2, y + 195), label[:29], fill='black')
        draw.text((x + 2, y + 208), label[29:], fill='black')
contact.save(base / 'health-traits-preflight-contact.jpg')
(base / 'art-preflight.json').write_text(json.dumps({'ready': len(entries), 'total': len(manifest['entries']), 'entries': report}, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'ready': len(entries), 'total': len(manifest['entries']), 'invalid': [entry['id'] for entry in report if not entry['valid']]}))
