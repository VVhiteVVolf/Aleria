"""Explicit source import; drawings and supplied originals remain unchanged."""
from pathlib import Path
import argparse
import hashlib
import json
import shutil
from PIL import Image


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('config', type=Path)
    args = parser.parse_args()
    config = json.loads(args.config.read_text(encoding='utf-8'))
    root = args.config.resolve().parent
    workspace = Path(__file__).resolve().parents[2]
    entries = []
    for item in config['files']:
        source = Path(config['sourceDirectory']) / item['source']
        target = workspace / item['archive'] if item.get('localArchive') else root / item['archive']
        target.parent.mkdir(parents=True, exist_ok=True)
        digest = hashlib.sha256(source.read_bytes()).hexdigest()
        if not target.exists():
            shutil.copy2(source, target)
        if hashlib.sha256(target.read_bytes()).hexdigest() != digest:
            raise ValueError('Archive differs: ' + source.name)
        with Image.open(source) as image:
            dimensions = list(image.size)
            for preview in item.get('previews', []):
                output = root / preview['file']
                output.parent.mkdir(parents=True, exist_ok=True)
                web = image.convert('RGBA' if image.mode == 'RGBA' else 'RGB')
                web.thumbnail(tuple(preview['size']), Image.Resampling.LANCZOS)
                web.save(output, 'WEBP', quality=preview.get('quality', 94), method=6, exact=True)
        entries.append(dict(sourceFile=source.name, sha256=digest, dimensions=dimensions,
                            original=str(target.relative_to(workspace)).replace('\\', '/'),
                            publishedOriginal=not item.get('localArchive', False)))
    (root / 'assets.source.json').write_text(json.dumps(entries, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(json.dumps(dict(supplied=len(entries), country=config['country'])))


if __name__ == '__main__':
    main()
