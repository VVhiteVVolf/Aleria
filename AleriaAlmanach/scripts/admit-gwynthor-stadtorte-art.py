"""Admit reviewed city-scene originals and encode WebP without changing composition."""
from pathlib import Path
import argparse
import hashlib
from io import BytesIO
import json
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
ART = ROOT / 'AleriaAlmanach/assets/gwynthor-stadtorte'


def sha256(content):
    return hashlib.sha256(content).hexdigest()


def project_path(relative):
    target = (ROOT / relative).resolve()
    if not target.is_relative_to(ROOT):
        raise ValueError(f'Outside project: {relative}')
    return target


def admit(receipts_path):
    briefs = json.loads((ART / 'image-prompts.json').read_text(encoding='utf-8'))['images']
    receipts = json.loads(receipts_path.read_text(encoding='utf-8'))
    by_id = {entry['id']: entry for entry in receipts}
    if not by_id or len(by_id) != len(receipts) or not by_id.keys() <= {entry['id'] for entry in briefs}:
        raise ValueError('Expected unique receipts for known city scenes')
    manifest_path = ART / 'image-results.json'
    manifest = json.loads(manifest_path.read_text(encoding='utf-8')) if manifest_path.exists() else {
        'version': 1, 'date': '2026-11-12', 'tool': 'built-in image_gen',
        'encoding': 'WebP quality 90 method 6; original dimensions and composition', 'images': []
    }
    existing = {entry['id']: entry for entry in manifest['images']}
    results = []
    for brief in briefs:
        if brief['id'] not in by_id:
            continue
        receipt = by_id[brief['id']]
        if any(receipt[key] != brief[key] for key in ('version', 'prompt', 'references', 'original', 'destination')):
            raise ValueError(f'Brief/receipt mismatch: {brief["id"]}')
        source = Path(receipt['generatorPath'])
        original = project_path(brief['original'])
        content = source.read_bytes()
        if original.exists() and original.read_bytes() != content:
            raise ValueError(f'Refusing to replace an original: {original}')
        destination = project_path(brief['destination'])
        buffer = BytesIO()
        with Image.open(BytesIO(content)) as image:
            width, height = image.size
            if image.format != 'PNG' or width * 3 != height * 2 or width < 1024:
                raise ValueError(f'Expected native portrait 2:3: {original}')
            # Same encoding as the existing marketplace collection. No resize,
            # crop, color correction, painting, compositing or alpha processing.
            image.save(buffer, format='WEBP', quality=90, method=6)
        webp = buffer.getvalue()
        with Image.open(BytesIO(webp)) as encoded:
            if encoded.size != (width, height):
                raise ValueError(f'Changed dimensions: {destination}')
        if destination.exists() and destination.read_bytes() != webp:
            raise ValueError(f'Refusing to replace an existing image version: {destination}')
        for path, data in [(original, content), (destination, webp)]:
            if not path.exists():
                path.parent.mkdir(parents=True, exist_ok=True)
                with path.open('xb') as target:
                    target.write(data)
        results.append({
            'id': brief['id'], 'version': brief['version'],
            'original': brief['original'], 'originalSha256': sha256(content),
            'file': brief['destination'], 'sha256': sha256(webp),
            'width': width, 'height': height,
            'originalBytes': len(content), 'bytes': len(webp),
            'promptSha256': sha256(brief['prompt'].encode('utf-8')),
            'references': [{'file': ref, 'sha256': sha256(project_path(ref).read_bytes())} for ref in brief['references']],
            'generatorPath': str(source), 'tool': 'built-in image_gen',
            'visualReview': receipt['visualReview']
        })
    existing.update({entry['id']: entry for entry in results})
    manifest['images'] = list(existing.values())
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'images': len(results), 'webBytes': sum(entry['bytes'] for entry in results)}))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--receipts', required=True, help='Project-relative generator receipts JSON')
    admit(project_path(parser.parse_args().receipts))
