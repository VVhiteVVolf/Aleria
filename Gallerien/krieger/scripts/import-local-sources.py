"""Import the reviewed local collection without changing its originals.

Usage: python Gallerien/krieger/scripts/import-local-sources.py --source-root "D:/0-KI Generierte/01 Bilder"
Requires Pillow. The checked-in review records every inclusion, exclusion and motif group.
Source SHA-256 checks prevent silently importing different files after review.
WebP copies retain original dimensions and transparency; only thumbnails are resized.
"""
import argparse
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
from pathlib import Path
from PIL import Image

DIRECTORY = Path(__file__).resolve().parents[1]
REPOSITORY = DIRECTORY.parents[1]
REVIEW_PATH = DIRECTORY / 'data/local-source-review.json'


def digest(file):
    return hashlib.sha256(file.read_bytes()).hexdigest()


def convert_source(record, source_root):
    source = (source_root / record['file']).resolve()
    if not source.is_relative_to(source_root):
        raise ValueError('Source path outside collection')
    if digest(source) != record['sha256']:
        raise ValueError(f"Reviewed source changed: {record['file']}")
    basename = record['sha256'][:20]
    target = DIRECTORY / 'assets/references' / f'{basename}.webp'
    thumbnail = DIRECTORY / 'assets/thumbnails' / f'{basename}.webp'
    complete = False
    if target.exists() and thumbnail.exists():
        try:
            with Image.open(target) as image, Image.open(thumbnail) as preview:
                image.load()
                preview.load()
                complete = image.size == (record['width'], record['height'])
        except OSError:
            pass
    if not complete:
        with Image.open(source) as original:
            image = original.convert('RGBA' if 'A' in original.getbands() else 'RGB')
            image.save(target, 'WEBP', quality=92, method=3, exact=True)
            image.thumbnail((480, 640), Image.Resampling.LANCZOS)
            image.save(thumbnail, 'WEBP', quality=85, method=3, exact=True)
    return {
        'image': target.relative_to(REPOSITORY).as_posix(),
        'thumbnail': thumbnail.relative_to(REPOSITORY).as_posix(),
        'sha256': digest(target), 'sourceSha256': record['sha256'],
        'sourceFiles': record['copies'],
        'label': ('Freigestellte Fassung' if 'removebg' in record['file'].lower() or '/Transparent/' in record['file'] else 'Quellfassung'),
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source-root', type=Path, required=True)
    args = parser.parse_args()
    review = json.loads(REVIEW_PATH.read_text('utf-8'))
    records = {record['index']: record for record in review['files']}
    selected = [record for record in records.values() if record['status'] == 'included']
    for folder in ['references', 'thumbnails']:
        (DIRECTORY / 'assets' / folder).mkdir(parents=True, exist_ok=True)
    with ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(lambda record: convert_source(record, args.source_root.resolve()), selected))
    converted = {record['index']: result for record, result in zip(selected, results)}
    groups = []
    for group in review['groups']:
        entry = {key: value for key, value in group.items() if key != 'sourceIndices'}
        entry['variants'] = [converted[index] for index in group['sourceIndices']]
        groups.append(entry)
    output = {'schema': 'aleria.warrior-gallery.local-images', 'version': 1,
              'reviewedAt': review['reviewedAt'], 'conversion': 'WebP quality 92, original dimensions and alpha; thumbnails 480 × 640 maximum.',
              'groups': groups}
    (DIRECTORY / 'data/local-images.json').write_text(json.dumps(output, ensure_ascii=False, indent=2) + '\n', 'utf-8')
    print(f'Imported {len(selected)} source images in {len(groups)} motif groups.')


if __name__ == '__main__':
    main()
