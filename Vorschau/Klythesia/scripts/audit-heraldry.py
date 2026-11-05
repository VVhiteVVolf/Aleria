"""Verify Klythesia's new crests and preserve supplied-image provenance."""
import hashlib
import json
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
WORKSPACE = ROOT.parents[1]


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    receipts = json.loads((ROOT / 'sources/heraldry-asset-receipts.json').read_text(encoding='utf-8'))['entries']
    assert {entry['id'] for entry in receipts} == {'naukyra', 'elyssar'}
    results = []
    for entry in receipts:
        for key in ('source', 'production', 'preview'):
            assert digest(ROOT / entry[key]) == entry[key + 'Sha256']
        source = np.array(Image.open(ROOT / entry['source']).convert('RGBA'))
        production = np.array(Image.open(ROOT / entry['production']).convert('RGBA'))
        assert production.shape[0] == production.shape[1]
        x = entry['framing']['padding']['left']
        y = entry['framing']['padding']['top']
        assert np.array_equal(source[:, :, :3], production[y:y+source.shape[0], x:x+source.shape[1], :3])
        yy, xx = np.ogrid[:production.shape[0], :production.shape[1]]
        cx, cy = entry['framing']['circle']['centre']
        circle = (xx-cx)**2 + (yy-cy)**2 <= entry['framing']['circle']['radius']**2
        assert np.array_equal(production[:, :, 3] == 255, circle)
        assert set(np.unique(production[:, :, 3])) == {0, 255}
        preview = Image.open(ROOT / entry['preview'])
        assert preview.size == (600, 600)
        results.append({'id': entry['id'], 'productionDimensions': list(production.shape[:2]),
                        'previewDimensions': list(preview.size), 'exactOpaqueCircle': True,
                        'rgbUnchanged': True, 'hashesMatch': True})
    supplied = json.loads((ROOT / 'assets.source.json').read_text(encoding='utf-8'))
    for entry in supplied:
        assert digest(WORKSPACE / entry['original']) == entry['sha256']
    report = {'status': 'passed', 'newCrests': results, 'suppliedOriginalsUnchanged': len(supplied),
              'tool': 'image_gen.imagegen',
              'visualReview': 'Both generated outputs and alpha-composited contact sheet inspected: complete flat circular motifs, no text or cropped anatomy.',
              'generatorJobs': 'Vorschau/Klythesia/sources/heraldry/additional-emblem-jobs.json',
              'receipts': 'Vorschau/Klythesia/sources/heraldry-asset-receipts.json'}
    destination = WORKSPACE / 'diagnostics/klythesia-expansion-20261104/heraldry/verification.json'
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'status': report['status'], 'newCrests': len(results), 'suppliedOriginalsUnchanged': len(supplied)}))


if __name__ == '__main__':
    main()
