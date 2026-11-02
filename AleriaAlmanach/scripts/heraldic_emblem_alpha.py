"""User-authorized alpha cleanup only; preserve every RGB pixel unchanged.

Discard faint exterior halos, keep the connected emblem and make its enclosed
surface fully opaque. Originals remain in the image tool's generated archive.
"""
from pathlib import Path
import math
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]


def frame_circular_emblem(image, *, coverage=.86):
    """Frame an opaque emblem as an exact circle, preserving its RGB pixels.

    Call after alpha cleanup. The inscribed disc excludes the irregular outer
    generator fringe; transparent padding retains the original source canvas.
    """
    if not 0 < coverage < 1:
        raise ValueError('Circle coverage must be between zero and one.')
    pixels = np.array(image.convert('RGBA'))
    mask = pixels[:, :, 3] == 255
    y, x = np.nonzero(mask)
    cx, cy = round((x.min() + x.max()) / 2), round((y.min() + y.max()) / 2)
    oy, ox = np.nonzero(~mask)
    radius = math.floor(np.hypot(ox - cx, oy - cy).min()) - 1
    if radius <= 0:
        raise ValueError('Emblem has no fully opaque circular interior.')
    yy, xx = np.ogrid[:image.height, :image.width]
    pixels[:, :, 3] = np.where((xx - cx)**2 + (yy - cy)**2 <= radius**2, 255, 0).astype('uint8')
    side = math.ceil(max(2 * radius / coverage, 2 * max(cx, image.width - cx, cy, image.height - cy) + 4))
    if side % 2:
        side += 1
    padding = dict(left=side // 2 - cx, top=side // 2 - cy)
    canvas = Image.new('RGBA', (side, side))
    canvas.paste(Image.fromarray(pixels), (padding['left'], padding['top']))
    return canvas, padding, dict(centre=[side // 2, side // 2], radius=radius)


def normalize_emblem_alpha(path, *, fill_enclosed=True):
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
    if fill_enclosed:
        ImageDraw.floodfill(connected, (0, 0), 128)
        alpha = np.where(np.array(connected) == 128, 0, 255).astype('uint8')
    else:
        # Hanging signs retain the open spaces inside their iron suspension.
        alpha = np.array(connected).astype('uint8')
    pixels[:, :, 3] = alpha
    assert np.array_equal(pixels[:, :, :3], rgb)
    assert set(np.unique(alpha)) == {0, 255}
    Image.fromarray(pixels).save(path)
    bbox = Image.fromarray(alpha).getbbox()
    return {'file': str(path.relative_to(ROOT)), 'size': source.size,
                   'alphaValues': [0, 255], 'opaquePixels': int((alpha == 255).sum()),
            'silhouetteBounds': bbox, 'rgbUnchanged': True}


def prepare_emblem_from_source(source, target, *, coverage=.88):
    """Admit generated heraldry with solid alpha, exact round framing and padding.

    This is the existing Falto production process as a reusable operation. Only
    alpha and transparent padding change; every original RGB pixel is retained.
    """
    target = Path(target).resolve()
    target.relative_to(ROOT)
    original = Image.open(source).convert('RGBA')
    guard = Image.new('RGBA', (original.width + 4, original.height + 4))
    guard.paste(original, (2, 2))
    target.parent.mkdir(parents=True, exist_ok=True)
    guard.save(target)
    normalize_emblem_alpha(target)
    cleaned = Image.open(target).crop((2, 2, original.width + 2, original.height + 2))
    final, padding, circle = frame_circular_emblem(cleaned, coverage=coverage)
    final.save(target)
    pixels = np.array(final)
    x, y = padding['left'], padding['top']
    assert np.array_equal(np.array(original)[:, :, :3], pixels[y:y+original.height, x:x+original.width, :3])
    yy, xx = np.ogrid[:final.height, :final.width]
    cx, cy = circle['centre']
    assert np.array_equal(pixels[:, :, 3] == 255, (xx-cx)**2 + (yy-cy)**2 <= circle['radius']**2)
    assert set(np.unique(pixels[:, :, 3])) == {0, 255}
    return {'size': list(final.size), 'padding': padding, 'circle': circle,
            'rgbUnchanged': True, 'alphaValues': [0, 255]}
