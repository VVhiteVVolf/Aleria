"""Apply the existing emblem alpha processor; authorized by the user on 2026-11-03."""
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
import hashlib
import json
import sys

from PIL import Image


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    root = Path(__file__).resolve().parents[1]
    workspace = root.parents[1]
    helper = workspace / 'AleriaAlmanach/scripts/heraldic_emblem_alpha.py'
    spec = spec_from_file_location('ishtaran_heraldic_alpha', helper)
    module = module_from_spec(spec)
    sys.dont_write_bytecode = True
    spec.loader.exec_module(module)
    source = root / 'assets/emblems/generated/maghneach-margin-edit.png'
    production = root / 'assets/emblems/production/maghneach.png'
    preview = root / 'assets/emblems/previews/maghneach.webp'
    source_hash = digest(source)
    processing = module.prepare_emblem_from_source(source, production, coverage=.88)
    image = Image.open(production)
    image.thumbnail((600, 600), Image.Resampling.LANCZOS)
    image.save(preview, 'WEBP', quality=94, method=6, exact=True)
    assert source_hash == digest(source)
    receipt = {
        'id': 'maghneach',
        'authorization': '2026-11-03: Ja, Transparenz technisch bereinigen',
        'helper': str(helper.relative_to(workspace)).replace('\\', '/'),
        'source': str(source.relative_to(root)).replace('\\', '/'),
        'sourceSha256': source_hash,
        'sourceUnchanged': True,
        'production': str(production.relative_to(root)).replace('\\', '/'),
        'productionSha256': digest(production),
        'preview': str(preview.relative_to(root)).replace('\\', '/'),
        'previewSha256': digest(preview),
        'processing': processing,
    }
    (root / 'sources/maghneach-alpha-receipt.json').write_text(
        json.dumps(receipt, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(receipt, ensure_ascii=False))


if __name__ == '__main__':
    main()
