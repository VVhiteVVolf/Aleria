"""Inspect PNG transparency and render a review sheet; source PNGs stay intact."""
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[2]
output = Path(__file__).resolve().parent
manifest = json.loads((root / 'AleriaAlmanach/assets/goettliche-eleganz/kleidung/image-prompts.json').read_text(encoding='utf-8'))
before = json.loads((root / 'AleriaAlmanach/modules/goettliche-eleganz/sources/module-before-expansion-2026-11-04.json').read_text(encoding='utf-8'))
original_ids = {item['id'] for item in before['entry']['pages'][4]['tradeCatalog']['items']}
new = [item for item in manifest['entries'] if item['id'] not in original_ids]
assert len(new) == 25
sheet = Image.new('RGB', (1250, 1580), '#e4ded2')
draw = ImageDraw.Draw(sheet)
font = ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf', 14)
report = []
for index, item in enumerate(new):
    source = root / item['destination']
    with Image.open(source) as original:
        assert original.mode == 'RGBA', item['id']
        rgba = original.copy()
    alpha = rgba.getchannel('A')
    histogram = alpha.histogram()
    width, height = rgba.size
    edges = [alpha.crop((0, 0, width, 1)), alpha.crop((0, height-1, width, height)),
             alpha.crop((0, 0, 1, height)), alpha.crop((width-1, 0, width, height))]
    edge_maximum = max(edge.getextrema()[1] for edge in edges)
    assert histogram[0] > width * height * .05, item['id']
    assert alpha.getextrema()[1] >= 250, item['id']
    # Existing approved PNGs have occasional alpha 1-2 edge pixels from export.
    # Reject a visible exterior veil while retaining the tool's original pixels.
    assert edge_maximum <= 2, (item['id'], edge_maximum)
    report.append({'id': item['id'], 'size': [width, height], 'alphaZeroPixels': histogram[0],
                   'maximumAlpha': alpha.getextrema()[1], 'edgeMaximumAlpha': edge_maximum})
    x, y = (index % 5) * 250, (index // 5) * 310
    rgba.thumbnail((230, 260), Image.Resampling.LANCZOS)
    sheet.paste(rgba, (x + (250-rgba.width)//2, y + 6), rgba)
    draw.text((x+8, y+270), item['name'], font=font, fill='#292420')
    draw.text((x+8, y+290), item['category'], font=font, fill='#62594e')
sheet.save(output / 'kollektion-uebersicht.jpg', quality=92)
(output / 'alpha-review.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print(json.dumps({'inspected': len(report), 'maximumAllowedEdgeAlpha': 2, 'contactSheet': str(output / 'kollektion-uebersicht.jpg')}))
