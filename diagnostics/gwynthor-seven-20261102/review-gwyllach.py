from pathlib import Path
from PIL import Image, ImageDraw
root = Path(__file__).resolve().parents[2]
paths = list((root / 'Stammbäume/assets/images/portraits/haus-gwyllach').glob('*.jpg'))
out = Image.new('RGB', (1000, ((len(paths)+5)//6)*230), '#eeeeee')
draw = ImageDraw.Draw(out)
for i, path in enumerate(paths):
    im = Image.open(path)
    im.thumbnail((156, 200))
    x, y = (i%6)*166, (i//6)*230
    out.paste(im, (x,y))
    draw.text((x,y+202),path.stem.replace('-gwyllach',''),fill='black')
out.save(root / 'diagnostics/gwynthor-seven-20261102/gwyllach-portrait-review.jpg')
