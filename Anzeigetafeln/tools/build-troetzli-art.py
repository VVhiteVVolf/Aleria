"""Package the signature and child's drawing, preserving both originals."""
from pathlib import Path
import hashlib
import json
from PIL import Image

art = Path(__file__).resolve().parents[1] / 'assets/images/notices/troetzli'
source = art / 'cynddelw-unterschrift-v1.png'
image = Image.open(source).convert('RGBA')
bounds = image.getchannel('A').point(lambda value: 255 if value >= 64 else 0).getbbox()
if not bounds:
    raise ValueError('Die Unterschrift enthält keine sichtbare Tinte.')
display = image.crop(bounds)
display.thumbnail((640, 220), Image.Resampling.LANCZOS)
target = source.with_suffix('.webp')
display.save(target, 'WEBP', quality=92, method=6)
receipt = {'tool': 'built-in image_gen', 'original': source.name,
           'sha256': hashlib.sha256(source.read_bytes()).hexdigest(),
           'display': target.name, 'width': display.width, 'height': display.height}
sketch_source = art / 'eirlys-skizze-v1.png'
sketch = Image.open(sketch_source).convert('RGB')
sketch.thumbnail((960, 1440), Image.Resampling.LANCZOS)
sketch_target = sketch_source.with_suffix('.webp')
sketch.save(sketch_target, 'WEBP', quality=90, method=6)
receipt['sketch'] = {'original': sketch_source.name, 'display': sketch_target.name,
                    'sha256': hashlib.sha256(sketch_source.read_bytes()).hexdigest(),
                    'width': sketch.width, 'height': sketch.height}
(art / 'image-results.json').write_text(json.dumps(receipt, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print(json.dumps(receipt))
