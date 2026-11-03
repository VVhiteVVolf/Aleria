"""Mechanical review composite and PNG inspection; never changes production images."""
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps

work = Path(__file__).parent
delivery = json.loads((work / 'delivery.json').read_text(encoding='utf-8'))
figures = [entry for entry in delivery if not entry['original']]
sheet = Image.new('RGB', (1320, 1410), '#eee4d1')
draw = ImageDraw.Draw(sheet)
report = []
prompts = []
for index, entry in enumerate(figures):
    file = Path(entry['image'])
    with Image.open(file) as original:
        assert original.mode == 'RGBA', file
        image = original.copy()
    assert image.width * 3 == image.height * 2, file
    alpha = image.getchannel('A')
    corners = [alpha.getpixel(point) for point in [(0, 0), (image.width-1, 0), (0, image.height-1), (image.width-1, image.height-1)]]
    # ImageGen exports may retain one alpha quantization step at an edge pixel.
    assert max(corners) <= 1 and alpha.getextrema()[0] == 0, (file, corners)
    thumb = ImageOps.contain(image, (290, 400))
    x, y = (index % 4) * 330 + 20, (index // 4) * 470 + 40
    sheet.paste(thumb, (x + (290-thumb.width)//2, y), thumb)
    draw.text((x, y-25), entry['name'], fill='#362c23')
    report.append({'id': entry['id'], 'image': entry['image'], 'mode': image.mode, 'size': list(image.size), 'alphaRange': list(alpha.getextrema()), 'corners': corners})
    metadata = file.parent / ('image-generation-v2.json' if file.stem.endswith('-v2') else 'image-generation.json')
    if metadata.exists():
        record = json.loads(metadata.read_text(encoding='utf-8'))
        prompts.append({'id': entry['id'], 'tool': record['tool'], 'prompt': record['prompt'], 'image': entry['image']})
sheet.save(work / 'final-contact-sheet.jpg', quality=94)
(work / 'image-checks.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
(work / 'image-prompts-final.json').write_text(json.dumps(prompts, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print(f'{len(report)} aktive PNGs und {len(prompts)} Prompts geprüft.')
