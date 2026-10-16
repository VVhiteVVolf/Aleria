from hashlib import sha256
import json
from pathlib import Path
import subprocess

from PIL import Image

root = Path(__file__).resolve().parents[2] / 'Stammbäume'
manifest_path = root / 'assets/data/source-inventories/fjordheim-2026-10-07.json'
manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
for asset in manifest['assets']:
    relative_path = asset.get('path') or asset['plannedPath']
    target = (root / relative_path).resolve()
    if not target.is_relative_to(root.resolve()):
        raise ValueError(relative_path)
    target.parent.mkdir(parents=True, exist_ok=True)
    temporary = target.with_suffix('.download')
    subprocess.run([
        'curl.exe', '--silent', '--show-error', '--location', '--fail',
        '--retry', '1', '--retry-delay', '3', '--max-time', '30',
        '--user-agent', 'Mozilla/5.0', '--output', str(temporary), asset['source']
    ], check=True)
    with Image.open(temporary) as image:
        if image.format != 'PNG':
            raise ValueError(f'Expected original PNG for {relative_path}')
        size = image.size
        image.verify()
    temporary.replace(target)
    asset.pop('plannedPath', None)
    asset.update(path=relative_path, status='local', sha256=sha256(target.read_bytes()).hexdigest(),
                 width=size[0], height=size[1])
    print(f'{target.name}: {size[0]} x {size[1]}', flush=True)

manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'{len(manifest["assets"])} original emblems saved and verified.')
