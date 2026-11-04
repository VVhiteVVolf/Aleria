"""Read-only asset QA; only diagnostic report/contact sheets are written."""
import hashlib
import json
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageOps

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]


def load(name):
    return json.loads((HERE / name).read_text(encoding='utf-8-sig'))


def sha(data):
    return hashlib.sha256(data).hexdigest()


def bounding_box(alpha, minimum):
    ys, xs = np.nonzero(alpha >= minimum)
    return [int(xs.min()), int(ys.min()), int(xs.max() + 1), int(ys.max() + 1)] if len(xs) else None


originals = load('original-images.json')
generated = load('generated-images.json')
baseline = load('baseline.json')
assert len(originals) == 26 and len(generated) == 3
assert {row['id'] for row in originals + generated} == {row['id'] for row in baseline}
assert len({row['id'] for row in originals + generated}) == 29
assert len({row['assetPath'] for row in originals + generated}) == 29

entries = []
for kind, items in (('supplied-original', originals), ('generated', generated)):
    for row in items:
        target = ROOT / row['assetPath']
        data = target.read_bytes()
        digest = sha(data)
        if kind == 'generated':
            source = Path(row['source'])
            expected = sha(source.read_bytes())
            reference_type = 'unchanged built-in image tool output file'
            reference = str(source)
            original_url_present = None
        else:
            expected = row['sha256']
            reference_type = 'original download receipt SHA-256 and attachment URL'
            reference = row['sourceUrl']
            archive = HERE / 'sources' / row['slug'] / 'animexx-original.html'
            original_url_present = row['sourceUrl'].encode() in archive.read_bytes()
        with Image.open(target) as image:
            image.load()
            fmt, mode, size = image.format, image.mode, image.size
            rgba = image.convert('RGBA')
        alpha = np.asarray(rgba.getchannel('A'))
        border = np.zeros(alpha.shape, dtype=bool)
        border[0, :] = border[-1, :] = True
        border[:, 0] = border[:, -1] = True
        pixels = int(alpha.size)
        entries.append({
            'id': row['id'], 'kind': kind, 'assetPath': row['assetPath'], 'variant': row.get('imageIndex', 1), 'primary': row.get('primary', True),
            'bytes': len(data), 'sha256': digest, 'expectedSha256': expected,
            'sourceReferenceType': reference_type, 'sourceReference': reference,
            'sourceHashMatches': digest == expected,
            'attachmentContainsOriginalUrl': original_url_present,
            'format': fmt, 'mode': mode, 'width': size[0], 'height': size[1],
            'aspectRatio': round(size[0] / size[1], 6),
            'alphaExtrema': [int(alpha.min()), int(alpha.max())],
            'cornerAlpha': [int(alpha[0, 0]), int(alpha[0, -1]), int(alpha[-1, 0]), int(alpha[-1, -1])],
            'alphaCounts': {
                'transparent': int(np.count_nonzero(alpha == 0)),
                'alpha1': int(np.count_nonzero(alpha == 1)),
                'alpha1to3': int(np.count_nonzero((alpha >= 1) & (alpha <= 3))),
                'alpha1to16': int(np.count_nonzero((alpha >= 1) & (alpha <= 16))),
                'partiallyTransparent': int(np.count_nonzero((alpha > 0) & (alpha < 255))),
                'opaque': int(np.count_nonzero(alpha == 255)),
                'total': pixels},
            'canvasEdgeAlpha': {
                'nonzero': int(np.count_nonzero(border & (alpha > 0))),
                'alpha1': int(np.count_nonzero(border & (alpha == 1))),
                'above3': int(np.count_nonzero(border & (alpha > 3))),
                'above16': int(np.count_nonzero(border & (alpha > 16))),
                'above127': int(np.count_nonzero(border & (alpha > 127)))},
            'boundsByAlphaThreshold': {str(n): bounding_box(alpha, n) for n in (1, 2, 4, 17, 128, 255)},
            'visuallyInspected': False,
            'visualFindings': []})


def font(size):
    for path in ('C:/Windows/Fonts/segoeui.ttf', 'C:/Windows/Fonts/arial.ttf'):
        if Path(path).exists(): return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def contact(items, filename, columns=6, cell=(340, 490)):
    canvas = Image.new('RGB', (columns * cell[0], math.ceil(len(items) / columns) * cell[1]), '#faf8f3')
    draw = ImageDraw.Draw(canvas)
    by_id = {row['id']: row for row in baseline}
    for index, row in enumerate(items):
        x, y = (index % columns) * cell[0], (index // columns) * cell[1]
        draw.rectangle((x + 4, y + 4, x + cell[0] - 5, y + cell[1] - 5), fill='#ffffff', outline='#d3d0c8', width=1)
        title = by_id[row['id']]['title'] + (' II' if row.get('variant', 1) == 2 else '')
        draw.text((x + 14, y + 10), title, fill='#21262c', font=font(20))
        label = 'Original' if row['kind'] == 'supplied-original' else 'Neu'
        draw.text((x + 14, y + 38), label, fill='#616773', font=font(15))
        with Image.open(ROOT / row['assetPath']) as img:
            figure = ImageOps.contain(img.convert('RGBA'), (cell[0] - 32, cell[1] - 78), Image.Resampling.LANCZOS)
        canvas.paste(figure, (x + (cell[0] - figure.width) // 2, y + 65 + (cell[1] - 78 - figure.height) // 2), figure)
    canvas.save(HERE / filename, quality=95, subsampling=0)


order = {row['id']: index for index, row in enumerate(baseline)}
ordered = sorted(entries, key=lambda row: (order[row['id']], row.get('variant', 1)))
contact(ordered, 'all-clan-figures.jpg')
contact([row for row in entries if row['kind'] == 'generated'], 'generated-clan-figures-light.jpg', columns=3, cell=(480, 730))
report = {
    'schema': 'aleria.leitheach-image-verification', 'version': 1, 'reviewedAt': '2026-11-03',
    'status': 'numeric-checks-complete-visual-review-pending',
    'scope': {'total': len(entries), 'families': 29, 'suppliedOriginals': len(originals), 'generated': len(generated), 'variants': 0},
    'summary': {
        'allSourceHashesMatch': all(row['sourceHashMatches'] for row in entries),
        'allPng': all(row['format'] == 'PNG' for row in entries),
        'allRgba': all(row['mode'] == 'RGBA' for row in entries),
        'allFullAlphaRange': all(row['alphaExtrema'] == [0, 255] for row in entries),
        'allSuppliedUrlsPresentInAttachments': all(row['attachmentContainsOriginalUrl'] for row in entries if row['kind'] == 'supplied-original'),
        'edgeAlpha1Ids': [row['id'] for row in entries if row['canvasEdgeAlpha']['alpha1']],
        'edgeAbove16Ids': [row['id'] for row in entries if row['canvasEdgeAlpha']['above16']]},
    'contactSheet': 'diagnostics/leitheach-clans-20261103/all-clan-figures.jpg',
    'additionalLightSheet': 'diagnostics/leitheach-clans-20261103/generated-clan-figures-light.jpg',
    'method': 'Asset bytes read only. Supplied originals compared to independent download receipt; generated assets compared bytewise to original tool output. White figure cells composited over a light sheet. No alpha changes or production-image writes.',
    'productAssetsModified': False, 'entries': entries}
(HERE / 'image-verification.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps(report['summary'], ensure_ascii=False))
for row in entries:
    print(row['id'], row['kind'], f"{row['width']}x{row['height']}", 'hash', row['sourceHashMatches'], 'edge', row['canvasEdgeAlpha'])
