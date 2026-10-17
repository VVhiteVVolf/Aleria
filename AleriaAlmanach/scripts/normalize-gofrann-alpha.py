"""Normalize authorized Gofrann cutouts without changing their RGB artwork."""
import hashlib
import json
from pathlib import Path

import numpy as np
from PIL import Image
from heraldic_emblem_alpha import normalize_emblem_alpha

ROOT = Path(__file__).resolve().parents[2]
ASSETS = ROOT / 'AleriaAlmanach/assets/gofrann-schmiede'
CREST = ROOT / 'Stammbäume/assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Gofrann.png'


def normalize_sign(path):
    path.resolve().relative_to(ROOT)
    pixels = np.array(Image.open(path).convert('RGBA'))
    rgb = pixels[:, :, :3].copy()
    # The physical hanging sign has open chain links; preserve those holes.
    pixels[:, :, 3] = np.where(pixels[:, :, 3] >= 128, 255, 0)
    assert np.array_equal(pixels[:, :, :3], rgb)
    Image.fromarray(pixels).save(path)
    return {'file': str(path.relative_to(ROOT)), 'size': [pixels.shape[1], pixels.shape[0]],
            'alphaValues': sorted(int(value) for value in np.unique(pixels[:, :, 3])),
            'rgbUnchanged': True, 'chainOpeningsPreserved': True}


if __name__ == '__main__':
    results = [normalize_emblem_alpha(CREST), normalize_sign(ASSETS / 'schild.png')]
    for result in results:
        result['normalizedSha256'] = hashlib.sha256((ROOT / result['file']).read_bytes()).hexdigest()
    (ASSETS / 'alpha-audit.json').write_text(json.dumps(results, ensure_ascii=False, indent=2) + '\n', encoding='utf8')
    print(json.dumps(results, ensure_ascii=False))
