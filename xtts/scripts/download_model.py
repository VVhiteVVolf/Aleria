"""Download the pinned XTTS-v2 inference assets and verify published LFS hashes."""
from pathlib import Path
import hashlib
import json
import shutil
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
REVISION = '6c2b0d75eae4b7047358e3b6bd9325f857d43f77'
FILES = ['config.json', 'vocab.json', 'model.pth', 'speakers_xtts.pth', 'LICENSE.txt']

def main():
    destination = ROOT / 'models' / 'xtts-v2'
    destination.mkdir(parents=True, exist_ok=True)
    metadata = json.loads((ROOT / 'config/model-metadata.json').read_text())
    expected = {item['rfilename']: item for item in metadata['siblings']}
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    for name in FILES:
        target = destination / name
        item = expected[name]
        if not target.exists():
            print(f'Downloading {name} ({item.get("size", 0):,} bytes)', flush=True)
            partial = target.with_suffix(target.suffix + '.partial')
            url = f'https://huggingface.co/coqui/XTTS-v2/resolve/{REVISION}/{name}?download=true'
            with opener.open(url, timeout=120) as source, partial.open('wb') as output:
                shutil.copyfileobj(source, output, length=1024 * 1024)
            assert partial.stat().st_size == item['size'], f'Incomplete file: {name}'
            partial.replace(target)
        with target.open('rb') as stream:
            digest = hashlib.file_digest(stream, 'sha256').hexdigest()
        if item.get('lfs', {}).get('sha256'):
            assert digest == item['lfs']['sha256'], f'Hash mismatch: {name}'
        print(f'OK {name}: {digest}', flush=True)

if __name__ == '__main__':
    main()
