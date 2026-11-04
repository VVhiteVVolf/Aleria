from pathlib import Path
from PIL import Image, ImageDraw
import json

root = Path(__file__).resolve().parents[2]
directory = Path(__file__).parent
records = json.loads((directory / 'before.json').read_text(encoding='utf-8'))
sheet = Image.new('RGB', (1200, 1320), '#e7deca')
draw = ImageDraw.Draw(sheet)
for i, record in enumerate(records):
    crest = Image.open(root / 'Stammbäume' / record['emblem']).convert('RGBA')
    crest.thumbnail((145, 145))
    x, y = (i % 7) * 170, (i // 7) * 210
    sheet.paste(crest, (x + (170-crest.width)//2, y), crest)
    draw.text((x+4,y+150),record['id'].removeprefix('haus-'),fill='#292620')
sheet.save(directory / 'crest-contact-sheet.jpg')
