"""Archive supplied artwork and export web copies without changing the drawing."""
from pathlib import Path
import hashlib
import json
import shutil
from PIL import Image


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    root = Path(__file__).resolve().parents[1]
    source = next((Path.home() / 'Downloads').glob('*Aldingen'))
    assets = root / 'assets'
    originals = assets / 'originals'
    originals.mkdir(parents=True, exist_ok=True)
    backup = root.parents[1] / 'diagnostics/aldingen-2026-10-26/backup'
    backup.mkdir(parents=True, exist_ok=True)
    manifest = []
    for file in sorted(source.glob('*.png')):
        is_map = 'Vorbereitung' in file.name
        is_realm = 'herzogtum' in file.name.lower()
        name = 'map-supplied.png' if is_map else 'aldingen.png' if is_realm else file.name.lower()
        target = backup / name if is_map else originals / name
        if not target.exists():
            shutil.copy2(file, target)
        if digest(target) != digest(file):
            raise ValueError('Archived original differs: ' + file.name)
        with Image.open(file) as im:
            size = list(im.size)
            if is_map:
                im.convert('RGB').save(assets / 'map-full.webp', 'WEBP', quality=95, method=6)
                im.thumbnail((4096, 4096), Image.Resampling.LANCZOS)
                im.convert('RGB').save(assets / 'map.webp', 'WEBP', quality=94, method=6)
        manifest.append(dict(sourceFile=file.name, original=str(target.relative_to(root.parents[1])).replace('\\', '/'),
                             sha256=digest(file), dimensions=size, archivedLocally=True,
                             publishedOriginal=not is_map))
    (root / 'assets.source.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(dict(supplied=len(manifest), mapOriginal='diagnostics/aldingen-2026-10-26/backup/map-supplied.png')))


if __name__ == '__main__':
    main()
