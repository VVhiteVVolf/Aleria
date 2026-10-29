from pathlib import Path
from PIL import Image, ImageOps, ImageDraw

root = Path(__file__).resolve().parents[2]
sources = Path(r'C:\Users\fhg_r\Downloads') / 'Länder' / 'Blutstadt'
files = sorted(sources.glob('*.png'))
for f in files:
    if 'Regionen' in f.name:
        continue
    im = Image.open(f)
    im.thumbnail((700, 700))
    im.save(Path(__file__).parent / f.name)
