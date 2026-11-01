"""Package the generated calendar and its ten numeral sprites; retain original PNGs."""
from pathlib import Path
from PIL import Image
import hashlib
import json

ROOT = Path(__file__).resolve().parents[1] / 'assets/images/board-calendar'


def visible_bounds(image):
    return image.getchannel('A').point(lambda alpha: 255 if alpha >= 16 else 0).getbbox()


def record(path):
    with Image.open(path) as image:
        return dict(file=path.name, width=image.width, height=image.height,
                    hasTransparency=image.mode == 'RGBA' and image.getchannel('A').getextrema()[0] == 0,
                    sha256=hashlib.sha256(path.read_bytes()).hexdigest())


calendars = []
for version in [1, 2]:
    source = ROOT / f'calendar-leaves-v{version}.png'
    if not source.exists():
        continue
    calendar = Image.open(source).convert('RGBA')
    bounds = visible_bounds(calendar)
    calendar = calendar.crop(bounds)
    calendar.thumbnail((700, 900), Image.Resampling.LANCZOS)
    target = ROOT / f'calendar-leaves-v{version}.webp'
    calendar.save(target, quality=94, method=6)
    calendars.append(dict(sourceCrop=list(bounds), **record(target)))

sheet = Image.open(ROOT / 'numerals-sheet-v1.png').convert('RGBA')
digits = []
for digit in range(10):
    row, col = divmod(digit, 5)
    cell = (round(col * sheet.width / 5), round(row * sheet.height / 2),
            round((col + 1) * sheet.width / 5), round((row + 1) * sheet.height / 2))
    image = sheet.crop(cell)
    box = visible_bounds(image)
    image = image.crop(box)
    image = image.resize((round(image.width * 160 / image.height), 160), Image.Resampling.LANCZOS)
    output = ROOT / f'numeral-{digit}-v1.webp'
    image.save(output, quality=95, method=6)
    digits.append(dict(digit=digit, cell=list(cell), inkBounds=list(box), **record(output)))

manifest = dict(tool='built-in image_gen',
                sources=[record(path) for path in sorted(ROOT.glob('calendar-leaves-v*.png'))] + [record(ROOT / 'numerals-sheet-v1.png')],
                calendar=calendars[-1], calendars=calendars,
                digits=digits, processing='Alpha-aware crop, resize, atlas splitting, WebP encoding; original PNGs retained.')
(ROOT / 'assets.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
print(json.dumps(dict(calendar=manifest['calendar'], glyphCount=len(digits))))
