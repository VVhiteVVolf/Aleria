"""User-authorized alpha cleanup only; preserve every RGB pixel unchanged.

Discard faint exterior halos, keep the connected emblem and make its enclosed
surface fully opaque. Originals remain in the image tool's generated archive.
"""
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
def normalize_emblem_alpha(path):
    path = Path(path).resolve()
    path.relative_to(ROOT)
    source = Image.open(path).convert('RGBA')
    pixels = np.array(source)
    rgb = pixels[:, :, :3].copy()
    mask = Image.fromarray(np.where(pixels[:, :, 3] >= 128, 255, 0).astype('uint8')).copy()
    center = (source.width // 2, source.height // 2)
    if mask.getpixel(center) != 255:
        raise ValueError(f'Wappenmitte unerwartet transparent: {path.name}')
    ImageDraw.floodfill(mask, center, 127)
    connected = Image.fromarray(np.where(np.array(mask) == 127, 255, 0).astype('uint8')).copy()
    ImageDraw.floodfill(connected, (0, 0), 128)
    alpha = np.where(np.array(connected) == 128, 0, 255).astype('uint8')
    pixels[:, :, 3] = alpha
    assert np.array_equal(pixels[:, :, :3], rgb)
    assert set(np.unique(alpha)) == {0, 255}
    Image.fromarray(pixels).save(path)
    bbox = Image.fromarray(alpha).getbbox()
    return {'file': str(path.relative_to(ROOT)), 'size': source.size,
                   'alphaValues': [0, 255], 'opaquePixels': int((alpha == 255).sum()),
            'silhouetteBounds': bbox, 'rgbUnchanged': True}
