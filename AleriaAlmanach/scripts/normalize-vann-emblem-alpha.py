"""Explicitly authorized alpha-only correction; original RGB values stay unchanged."""
import hashlib
import json
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[2]
art = root / 'AleriaAlmanach/assets/letzte-rast'
manifest = json.loads((art / 'image-prompts.json').read_text(encoding='utf-8'))
job = next(job for job in manifest['entries'] if job['id'] == 'crest-vann')
target = root / job['destination']
original = Image.open(target).convert('RGBA')
rgb = original.convert('RGB').tobytes()
before_hash = hashlib.sha256(target.read_bytes()).hexdigest()
alpha = original.getchannel('A')
left, top, right, bottom = alpha.point(lambda value: 255 if value > 127 else 0).getbbox()
cx, cy = (left+right-1)/2, (top+bottom-1)/2
radius = min(right-left, bottom-top)/2
mask = Image.new('L', original.size)
mask.putdata([255 if (x-cx)**2+(y-cy)**2 <= radius**2 else 0
              for y in range(original.height) for x in range(original.width)])
original.putalpha(mask)
assert original.convert('RGB').tobytes() == rgb
size = round(radius*2/0.87)
size += size % 2
offset = (round(size/2-cx), round(size/2-cy))
result = Image.new('RGBA', (size, size), (0, 0, 0, 0))
result.paste(original, offset)
assert result.crop((offset[0], offset[1], offset[0]+original.width, offset[1]+original.height)).convert('RGB').tobytes() == rgb
result.save(target)
record = {'authorization':'User explicitly approved alpha and transparent outer margin correction in this conversation.',
          'kind':'alpha-and-transparent-padding','originalRgbPreserved':True,'originalSize':list(original.size),
          'finalSize':list(result.size),'offset':list(offset),'center':[cx,cy],'radius':radius,
          'beforeSha256':before_hash,'finalSha256':hashlib.sha256(target.read_bytes()).hexdigest()}
(art / 'emblem-alpha-correction.json').write_text(json.dumps(record,indent=2)+'\n',encoding='utf-8')
results_file = art / 'image-results.json'
results = json.loads(results_file.read_text(encoding='utf-8'))
item = next(item for item in results['images'] if item['id']=='crest-vann')
item.update(width=size,height=size,sha256=record['finalSha256'],postprocess=record)
results_file.write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(record))
