from pathlib import Path
from PIL import Image, ImageChops
import hashlib
import json

root = Path(__file__).resolve().parents[2]
out = root / 'diagnostics/brevanor'
source = next(Path('C:/Users/fhg_r/Downloads/Länder/Brevanor').glob('*Vorbereitungskarte.png'))
previous = out / 'source-originals/map.png'
archive = out / 'source-originals/map-initial.png'
if not archive.exists():
    archive.write_bytes(previous.read_bytes())
before, current = Image.open(archive).convert('RGB'), Image.open(source).convert('RGB')
report = {'source':str(source), 'previousDimensions':list(before.size), 'dimensions':list(current.size),
          'previousSha256':hashlib.sha256(archive.read_bytes()).hexdigest(),
          'sha256':hashlib.sha256(source.read_bytes()).hexdigest()}
if before.size == current.size:
    report['changedBounds'] = ImageChops.difference(before, current).getbbox()
overview = current.copy()
overview.thumbnail((2100, 2100))
overview.save(out/'map-updated-overview.jpg',quality=95)
w,h=current.size
for row in range(2):
    for col in range(2):
        tile=current.crop((col*w//2,row*h//2,(col+1)*w//2,(row+1)*h//2))
        tile.thumbnail((1900,1900))
        tile.save(out/f'map-updated-{row}-{col}.jpg',quality=95)
(out/'map-update.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False))
