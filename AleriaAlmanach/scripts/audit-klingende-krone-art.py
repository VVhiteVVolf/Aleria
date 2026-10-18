"""Read-only pixel validation and provenance for the new guild venue artwork."""
import hashlib
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
ART = ROOT / 'AleriaAlmanach/assets/klingende-krone'
manifest = json.loads((ART / 'image-prompts.json').read_text(encoding='utf-8'))
raw = json.loads((ART / 'image-results.json').read_text(encoding='utf-8'))
rows = raw if isinstance(raw, list) else raw['images']
images = []
for job in manifest['entries']:
    record = dict(next(row for row in reversed(rows) if row['id'] == job['id']))
    path = ROOT / record['destination']
    assert record['destination'] == job['destination']
    assert path.read_bytes() == Path(record['source']).read_bytes()
    with Image.open(path) as im:
        assert im.format == 'PNG'
        w, h = im.size
        if job['transparent']:
            assert w == h and im.mode == 'RGBA' and im.getchannel('A').getextrema()[0] == 0
        else:
            assert abs(w / h - 2 / 3) < 0.002
        record.update(width=w, height=h, sha256=hashlib.sha256(path.read_bytes()).hexdigest(), promptId=job['id'])
    images.append(record)
assert len(images) == len({r['id'] for r in images}) == len({r['sha256'] for r in images}) == 26
discarded = (raw.get('discarded', []) if isinstance(raw, dict) else []) + [dict(r, reason=next(j['previousVersion']['reason'] for j in manifest['entries'] if j.get('previousVersion', {}).get('destination') == r['destination'])) for r in rows if not any(s['destination'] == r['destination'] for s in images)]
(ART / 'image-results.json').write_text(json.dumps({'schemaVersion': 1, 'tool': 'built-in image_gen', 'images': images, 'discarded': discarded}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
(ART / 'quality-check.json').write_text(json.dumps({'schemaVersion': 1, 'date': '2026-10-18', 'status': 'art-complete', 'selectedImages': 26, 'allFinalsSavedInWorkspace': True, 'uniqueIdsAndHashes': True, 'portraitAndSceneAspectRatio': '2:3', 'itemAspectRatio': '1:1', 'transparentItemsHaveRealPngAlpha': True, 'allOriginalPixelsAndAlphaPreserved': True, 'browser': 'pending'}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'passed': True, 'selectedImages': len(images)}))
