"""Download an explicitly reviewed asset manifest; retain original image bytes."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from PIL import Image
import hashlib
import json
import subprocess
import sys

script = Path(IMPORT_DIRECTORY)
root = script.parents[1]
manifest = script / sys.argv[1]
assets = json.loads(manifest.read_text(encoding='utf-8'))


def download(asset):
    target = root / asset['path']
    if not target.resolve().is_relative_to(root.resolve()):
        raise ValueError('Asset path escaped the family-tree workspace')
    target.parent.mkdir(parents=True, exist_ok=True)
    if not target.exists():
        result = subprocess.run(['curl.exe', '-sS', '-L', '--fail', '--retry', '2',
                                 '--max-time', '45', '-A', 'Mozilla/5.0',
                                 '-o', str(target), asset['url']], capture_output=True)
        if result.returncode:
            return {**asset, 'error': result.stderr.decode('utf-8', errors='replace').strip()}
    try:
        with Image.open(target) as image:
            image.verify()
        with Image.open(target) as image:
            image_format, width, height = image.format, image.width, image.height
        extension = {'JPEG': '.jpg', 'PNG': '.png', 'WEBP': '.webp'}[image_format]
        if target.suffix != extension:
            corrected = target.with_suffix(extension)
            for local_path in [target, corrected]:
                if not local_path.resolve().is_relative_to(root.resolve()):
                    raise ValueError('Asset path escaped the family-tree workspace')
            target.rename(corrected)
            target = corrected
        return {**asset, 'path': target.relative_to(root).as_posix(),
                'sha256': hashlib.sha256(target.read_bytes()).hexdigest(),
                'width': width, 'height': height, 'format': image_format}
    except Exception as error:
        return {**asset, 'error': str(error)}


with ThreadPoolExecutor(max_workers=3) as pool:
    results = list(pool.map(download, assets))
output = manifest.with_name(manifest.stem + '-receipt.json')
output.write_text(json.dumps(results, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
manifest.write_text(json.dumps([{**asset, 'path': result['path']} for asset, result in zip(assets, results)],
                               ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
failures = [asset for asset in results if 'error' in asset]
print(json.dumps({'count': len(results), 'failures': failures}, ensure_ascii=False))
sys.exit(bool(failures))
