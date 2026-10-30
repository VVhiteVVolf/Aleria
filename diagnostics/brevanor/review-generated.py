from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[2]
files = sorted((root / 'Vorschau/Brevanor/assets/generated').glob('*.png'))
sheet = Image.new('RGB', (1500, ((len(files)+4)//5)*310), '#e9e3d7')
draw = ImageDraw.Draw(sheet)
font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 17)
for i, path in enumerate(files):
    im = Image.open(path).convert('RGBA')
    im.thumbnail((285, 275))
    x, y = i % 5 * 300, i // 5 * 310
    sheet.paste(im, (x+(300-im.width)//2, y), im)
    draw.text((x+8, y+280), path.stem, fill='#222', font=font)
sheet.save(root / 'diagnostics/brevanor/generated-contact.jpg', quality=94)
