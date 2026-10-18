"""Inspect selected originals and record provenance; never modify image pixels."""
import hashlib
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
ART = ROOT / 'AleriaAlmanach/assets/gestiefelte-muschi'
manifest = json.loads((ART / 'image-prompts.json').read_text(encoding='utf-8'))
raw = json.loads((ART / 'image-results.json').read_text(encoding='utf-8'))
rows = raw if isinstance(raw, list) else raw['images']
corrections = json.loads((ART / 'heraldry-alpha-corrections.json').read_text(encoding='utf-8'))
images = []
for job in manifest['entries']:
    record = dict(next(row for row in reversed(rows) if row['id'] == job['id']))
    assert record['destination'] == job['destination']
    path = ROOT / record['destination']
    with Image.open(path) as im:
        assert im.format == 'PNG'
        w, h = im.size
        rgba = im.convert('RGBA')
        if job['transparent']:
            assert w == h and im.mode == 'RGBA'
            assert rgba.getchannel('A').getextrema()[0] == 0
        else:
            assert abs(w / h - 2 / 3) < 0.002
        record.update(width=w, height=h, sha256=hashlib.sha256(path.read_bytes()).hexdigest())
        if job['id'] in corrections:
            correction = corrections[job['id']]
            original = Image.open(record['source']).convert('RGB')
            x, y = correction['offset']
            assert rgba.crop((x, y, x + original.width, y + original.height)).convert('RGB').tobytes() == original.tobytes()
            assert [value for value, count in enumerate(rgba.getchannel('A').histogram()) if count] == [0, 255]
            assert record['sha256'] == correction['finalSha256']
            record['postprocess'] = correction
        else:
            assert path.read_bytes() == Path(record['source']).read_bytes()
    record['promptId'] = job['id']
    images.append(record)
assert len(images) == 41
assert len({record['id'] for record in images}) == 41
assert len({record['sha256'] for record in images}) == 41
result = {'schemaVersion': 1, 'tool': 'built-in image_gen', 'images': images,
          'discarded': [
              {'id': 'schild-poster', 'reason': 'User requested flatter carved wood with fewer pigments.', 'reference': 'references/schild-abgelehnt-poster.png'},
              {'id': 'pudel-katze', 'reason': 'Generator returned a feline instead of the requested poodle; replaced with a dog using the existing poodle illustration.', 'reference': 'references/pudel-abgelehnt-katze.png'}
          ]}
(ART / 'image-results.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
quality = {'schemaVersion': 1, 'date': '2026-10-18', 'status': 'art-complete', 'selectedImages': 41,
           'uniqueIdsAndHashes': True, 'allFinalsSavedInWorkspace': True, 'portraitAndSceneAspectRatio': '2:3',
           'itemAndHeraldryAspectRatio': '1:1', 'transparentImagesHaveRealPngAlpha': True,
           'heraldryAlpha': {'inside': 255, 'outside': 0, 'rgbPreserved': True, 'audit': 'heraldry-alpha-corrections.json'},
           'unprocessedOriginalsByteIdentical': True, 'browser': 'pending'}
(ART / 'quality-check.json').write_text(json.dumps(quality, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'passed': True, 'selectedImages': len(images)}))
