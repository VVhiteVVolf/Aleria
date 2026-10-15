"""Validate original skill medallions and export small, transparent runtime assets."""
import argparse
import hashlib
import io
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'IconOrdner/IconsCharakterbogen/Fertigkeiten'
OUTPUT = ROOT / 'AleriaAlmanach/public/assets/skill-icons'


def build(check=False):
    manifest = json.loads((SOURCE / 'manifest.json').read_text(encoding='utf-8'))
    receipts = []
    for entry in manifest['entries']:
        source = SOURCE / entry['file']
        with Image.open(source) as image:
            assert image.width == image.height, f'{source.name}: expected a square'
            assert image.mode == 'RGBA', f'{source.name}: missing real alpha channel'
            alpha = image.getchannel('A')
            # Generated antialiased assets may contain invisible 1/255 alpha noise.
            assert all(alpha.getpixel(point) <= 1 for point in [(0, 0), (image.width-1, 0), (0, image.height-1), (image.width-1, image.height-1)]), f'{source.name}: opaque exterior'
            assert alpha.histogram()[0] > image.width * image.height * .2, f'{source.name}: missing transparent exterior'
            assert alpha.getpixel((image.width//2, image.height//2)) >= 250, f'{source.name}: unexpectedly translucent interior'
            buffer = io.BytesIO()
            image.resize((96, 96), Image.Resampling.LANCZOS).save(buffer, format='WEBP', lossless=True, method=6, exact=True)
            data = buffer.getvalue()
        target = OUTPUT / f"{entry['id']}-v1.webp"
        if check:
            assert target.read_bytes() == data, f'{target.name}: rebuild required'
        else:
            OUTPUT.mkdir(parents=True, exist_ok=True)
            target.write_bytes(data)
        receipts.append({'id': entry['id'], 'name': entry['name'], 'file': target.name, 'bytes': len(data), 'sourceSha256': hashlib.sha256(source.read_bytes()).hexdigest()})
    receipt = json.dumps({'schemaVersion': 1, 'size': [96, 96], 'format': 'lossless WebP, original alpha preserved', 'entries': receipts}, ensure_ascii=False, indent=2) + '\n'
    if check:
        assert (OUTPUT / 'manifest.json').read_text(encoding='utf-8') == receipt, 'Asset manifest: rebuild required'
    else:
        (OUTPUT / 'manifest.json').write_text(receipt, encoding='utf-8')
    print(json.dumps({'icons': len(receipts), 'runtimeBytes': sum(entry['bytes'] for entry in receipts), 'alphaVerified': True, 'check': check}))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    build(parser.parse_args().check)
