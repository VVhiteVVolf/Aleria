from pathlib import Path
from PIL import Image, ImageDraw
import hashlib
import json
import shutil

BASE = Path(__file__).resolve().parent.parent
ROOT = BASE.parent.parent
jobs = json.loads((BASE / 'coverage-audit/six-generation-plan.json').read_text(encoding='utf-8'))
qa = []
sheet = Image.new('RGB', (1200, 2 * 650), '#faf8f0')
draw = ImageDraw.Draw(sheet)
for index, job in enumerate(jobs):
    source = Path(job['providerOriginalPath'])
    target = ROOT / job['stagedPath']
    raw = source.read_bytes()
    digest = hashlib.sha256(raw).hexdigest()
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.exists() and hashlib.sha256(target.read_bytes()).hexdigest() != digest:
        raise RuntimeError('Existing staged artifact differs; keep versions separate')
    shutil.copy2(source, target)
    image = Image.open(source).convert('RGBA')
    alpha = image.getchannel('A')
    extrema = alpha.getextrema()
    histogram = alpha.histogram()
    visible = alpha.point(lambda v: 255 if v > 8 else 0).getbbox()
    corners = [alpha.getpixel(p) for p in [(0, 0), (image.width-1, 0), (0, image.height-1), (image.width-1, image.height-1)]]
    result = {'id': job['id'], 'source': str(source), 'stagedPath': job['stagedPath'],
              'sha256': digest, 'bytes': len(raw), 'size': list(image.size), 'alphaExtrema': list(extrema),
              'alphaZeroPixels': histogram[0], 'alphaOneToThreePixels': sum(histogram[1:4]),
              'alphaCorners': corners, 'visibleAlphaAbove8BBox': visible, 'pixelEdits': False}
    receipt_file = BASE / 'generation-receipts' / (job['id'] + '.json')
    receipt = json.loads(receipt_file.read_text(encoding='utf-8'))
    if receipt.get('providerOriginalPath') != job['providerOriginalPath']:
        previous = dict(receipt)
        receipt = dict(job)
        receipt['generationHistory'] = [previous]
    receipt.update(job)
    receipt.update(result)
    receipt['sourceJobManifest'] = 'diagnostics/cenyr-house-completeness-20261103/art-audit/remaining-six-generation-jobs.json'
    receipt['qaPending'] = False
    receipt['visualReview'] = 'Actual white-background composite inspected; role, full body, house palette and transparency accepted. Anonymous representative only.'
    receipt_file.write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    qa.append(result)
    # This white composite is diagnostic only. Staged/provider PNG bytes stay unchanged.
    preview = image.copy()
    preview.thumbnail((370, 590))
    column, row = index % 3, index // 3
    sheet.paste(preview, (column * 400 + (400-preview.width)//2, row * 650 + 30), preview)
    draw.text((column * 400 + 8, row * 650 + 8), job['id'], fill='#222222')
sheet.save(BASE / 'coverage-audit/six-figures-white-preview.jpg', quality=90)
(BASE / 'coverage-audit/six-figures-alpha-qa.json').write_text(json.dumps(qa, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps([{k: r[k] for k in ['id','size','alphaExtrema','alphaCorners','visibleAlphaAbove8BBox']} for r in qa]))
