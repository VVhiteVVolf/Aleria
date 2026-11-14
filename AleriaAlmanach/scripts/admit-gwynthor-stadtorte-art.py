"""Admit the twelve city-scene originals and encode WebP without changing composition."""
from pathlib import Path
import argparse
import hashlib
import json
import shutil
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
    if {entry['id'] for entry in receipts} != {entry['id'] for entry in briefs} or len(receipts) != 12:
        raise ValueError('Expected exactly the twelve current city-scene receipts')
    by_id = {entry['id']: entry for entry in receipts}
    results = []
    for brief in briefs:
        receipt = by_id[brief['id']]
        if any(receipt[key] != brief[key] for key in ('version', 'prompt', 'references', 'original', 'destination')):
            raise ValueError(f'Brief/receipt mismatch: {brief["id"]}')
        source = Path(receipt['generatorPath'])
        original = project_path(brief['original'])
        content = source.read_bytes()
        original.parent.mkdir(parents=True, exist_ok=True)
        if original.exists() and original.read_bytes() != content:
            raise ValueError(f'Refusing to replace an original: {original}')
        if not original.exists():
            shutil.copyfile(source, original)
        destination = project_path(brief['destination'])
        destination.parent.mkdir(parents=True, exist_ok=True)
        with Image.open(original) as image:
            width, height = image.size
            if width * 3 != height * 2 or width < 1024:
                raise ValueError(f'Expected native portrait 2:3: {original}')
            # Same encoding as the existing marketplace collection. No resize,
            # crop, color correction, painting, compositing or alpha processing.
            image.save(destination, format='WEBP', quality=90, method=6)
        with Image.open(destination) as encoded:
            if encoded.size != (width, height):
                raise ValueError(f'Changed dimensions: {destination}')
        results.append({
            'id': brief['id'], 'version': brief['version'],
            'original': brief['original'], 'originalSha256': sha256(content),
            'file': brief['destination'], 'sha256': sha256(destination.read_bytes()),
            'width': width, 'height': height,
            'originalBytes': len(content), 'bytes': destination.stat().st_size,
            'promptSha256': sha256(brief['prompt'].encode('utf-8')),
            'references': [{'file': ref, 'sha256': sha256(project_path(ref).read_bytes())} for ref in brief['references']],
            'generatorPath': str(source), 'tool': 'built-in image_gen',
            'visualReview': receipt['visualReview']
        })
    manifest = {'version': 1, 'date': '2026-11-12', 'tool': 'built-in image_gen',
                'encoding': 'WebP quality 90 method 6; original dimensions and composition', 'images': results}
    (ART / 'image-results.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'images': len(results), 'webBytes': sum(entry['bytes'] for entry in results)}))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--receipts', required=True, help='Project-relative generator receipts JSON')
    admit(project_path(parser.parse_args().receipts))
