"""Package generated notice art; preserve the original PNGs and alpha."""
from pathlib import Path
import hashlib
import json
from PIL import Image

root = Path(__file__).resolve().parents[2]
proof = root / 'diagnostics/gwynthor-formlingssache-2026-10-31'
manifest = []
for source in ['generation-jobs.json', 'notice-art-jobs.json']:
    for job in json.loads((proof / source).read_text(encoding='utf-8'))['jobs']:
        path = root / job['file']
        image = Image.open(path).convert('RGBA')
        entry = {'id': job['id'], 'kind': job['kind'], 'file': job['file'],
                 'width': image.width, 'height': image.height,
                 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()}
        if job['kind'] == 'notice-art':
            bounds = image.getchannel('A').point(lambda x: 255 if x >= 32 else 0).getbbox()
            if not bounds:
                raise ValueError('Empty generated artwork: ' + job['id'])
            display = image.crop(bounds)
            limit = (720, 240) if job['id'].startswith('euddogwy') else (512, 512)
            display.thumbnail(limit, Image.Resampling.LANCZOS)
            target = path.with_suffix('.webp')
            display.save(target, 'WEBP', quality=94, method=6)
            entry['display'] = {'file': target.relative_to(root).as_posix(),
                                'width': display.width, 'height': display.height,
                                'sha256': hashlib.sha256(target.read_bytes()).hexdigest()}
        else:
            if image.width * 3 != image.height * 2:
                raise ValueError('Portrait aspect ratio: ' + job['id'])
        manifest.append(entry)
target = root / 'AleriaAlmanach/assets/gwynthor-formlingssache/asset-manifest.json'
target.write_text(json.dumps({'tool': 'built-in image_gen', 'date': '2026-10-31',
                             'images': manifest}, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print(json.dumps({'portraits': 6, 'noticeArt': 3, 'originalsPreserved': True}))
