"""User-authorized alpha cleanup and transparent padding; never repaint RGB.

The shared heraldry normalizer owns closed emblem silhouettes. Hanging banners
retain every disconnected foreground part and all open suspension gaps.
"""

from __future__ import annotations

import importlib.util
import math
from pathlib import Path
import sys

import numpy as np
from PIL import Image


def emblem_normalizer():
    module_path = Path(__file__).resolve().parents[3] / "AleriaAlmanach/scripts/heraldic_emblem_alpha.py"
    specification = importlib.util.spec_from_file_location("aleria_heraldic_emblem_alpha", module_path)
    module = importlib.util.module_from_spec(specification)
    # Asset preparation must not create Python cache files in project folders.
    sys.dont_write_bytecode = True
    specification.loader.exec_module(module)
    return module.normalize_emblem_alpha


def prepare_production(source: Path, destination: Path, *, circle: bool) -> dict:
    original = Image.open(source).convert("RGBA")
    original_pixels = np.array(original)
    destination.parent.mkdir(parents=True, exist_ok=True)
    original.save(destination)
    if circle:
        # A ring touching the generator canvas can split the exterior into
        # disconnected corners. A temporary transparent border lets the shared
        # exterior floodfill reach every outside component before hole filling.
        guarded = Image.new("RGBA", (original.width + 4, original.height + 4), (0, 0, 0, 0))
        guarded.paste(original, (2, 2))
        guarded.save(destination)
        emblem_normalizer()(destination, fill_enclosed=True)
        with Image.open(destination) as normalized:
            normalized.crop((2, 2, original.width + 2, original.height + 2)).save(destination)
        # The two representative visual samples were approved for production.
        # Only alpha changes: the inscribed disk never exposes hidden RGB.
        circle_cleanup = inscribed_circle_probe(destination, destination)
        circle_cleanup["visualApprovalRequired"] = False
        circle_cleanup["approval"] = "2026-10-26 representative Roden and Goldveld samples approved"
        mode = "shared-emblem-exact-circle"
    else:
        # No connected-component pruning: a detached tassel or rod cap still
        # belongs to the banner. Thresholding keeps genuine suspension holes.
        pixels = original_pixels.copy()
        pixels[:, :, 3] = np.where(pixels[:, :, 3] >= 128, 255, 0).astype("uint8")
        Image.fromarray(pixels).save(destination)
        mode = "open-banner-silhouette"
    cleaned = Image.open(destination).convert("RGBA")
    cleaned_pixels = np.array(cleaned)
    if not np.array_equal(cleaned_pixels[:, :, :3], original_pixels[:, :, :3]):
        raise ValueError(f"Alpha cleanup changed RGB: {source.name}")
    newly_exposed = int(((cleaned_pixels[:, :, 3] == 255) & (original_pixels[:, :, 3] < 128)).sum())
    if newly_exposed:
        raise ValueError(f"Alpha cleanup exposes {newly_exposed} originally transparent pixels: {source.name}")
    bbox = cleaned.getchannel("A").getbbox()
    if not bbox:
        raise ValueError(f"No visible foreground: {source.name}")
    left, top, right, bottom = bbox
    margin = math.ceil(max(right - left, bottom - top) * 0.07)
    padding = [max(0, margin - left), max(0, margin - top),
               max(0, margin - (original.width - right)), max(0, margin - (original.height - bottom))]
    width = original.width + padding[0] + padding[2]
    height = original.height + padding[1] + padding[3]
    side = max(width, height)
    padding[0] += (side - width) // 2
    padding[2] += side - width - (side - width) // 2
    padding[1] += (side - height) // 2
    padding[3] += side - height - (side - height) // 2
    padded = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    # No mask argument: copying rather than alpha blending preserves RGB bytes.
    padded.paste(cleaned, (padding[0], padding[1]))
    padded.save(destination)
    copied = np.array(padded)[padding[1]:padding[1] + original.height, padding[0]:padding[0] + original.width, :3]
    if not np.array_equal(copied, original_pixels[:, :, :3]):
        raise ValueError(f"Canvas padding changed RGB: {source.name}")
    result = {
        "mode": mode,
        "threshold": 128,
        "rgbUnchanged": True,
        "alphaValues": [0, 255],
        "padding": dict(zip(("left", "top", "right", "bottom"), padding)),
        "sourceVisibleBounds": list(bbox),
        "sourceContentTouchedCanvas": left == 0 or top == 0 or right == original.width or bottom == original.height,
        "sourceTransparentPixelsExposed": newly_exposed,
    }
    if circle:
        result["circle"] = circle_cleanup
    return result


def verify_production_rgb(source: Path, production: Path, padding: dict) -> bool:
    """Compare retained RGB bytes at the documented padding offset."""
    with Image.open(source) as original_image, Image.open(production) as production_image:
        original = np.array(original_image.convert("RGBA"))
        result = np.array(production_image.convert("RGBA"))
    left, top = padding["left"], padding["top"]
    expected_shape = (original.shape[0] + top + padding["bottom"], original.shape[1] + left + padding["right"])
    if result.shape[:2] != expected_shape:
        return False
    retained = result[top:top + original.shape[0], left:left + original.shape[1], :3]
    return bool(np.array_equal(original[:, :, :3], retained))


def verify_exact_circle(production: Path, padding: dict, circle: dict) -> bool:
    with Image.open(production) as image:
        alpha = np.array(image.convert("RGBA").getchannel("A"))
    centre_x = circle["centre"][0] + padding["left"]
    centre_y = circle["centre"][1] + padding["top"]
    y, x = np.ogrid[:alpha.shape[0], :alpha.shape[1]]
    expected = np.where((x - centre_x) ** 2 + (y - centre_y) ** 2 <= circle["radius"] ** 2, 255, 0).astype("uint8")
    return bool(np.array_equal(alpha, expected))


def inscribed_circle_probe(source: Path, destination: Path) -> dict:
    """Make a separate exact-circle alpha sample for visual approval.

    Fit to the existing painted contour, then use a circle wholly inside it.
    This never fills previously transparent generator pixels with visible RGB.
    The removed outer-ring extent is reported for a human composition check.
    """
    with Image.open(source) as image:
        pixels = np.array(image.convert("RGBA"))
    foreground = pixels[:, :, 3] >= 128
    inside = foreground.copy()
    inside[1:-1, 1:-1] = (foreground[1:-1, 1:-1] & foreground[:-2, 1:-1]
                          & foreground[2:, 1:-1] & foreground[1:-1, :-2]
                          & foreground[1:-1, 2:])
    y, x = np.nonzero(foreground & ~inside)
    keep = np.ones(len(x), dtype=bool)
    if len(x) < 100:
        raise ValueError(f"Insufficient circular contour: {source.name}")
    for _ in range(5):
        selected_x, selected_y = x[keep].astype(float), y[keep].astype(float)
        coefficients = np.linalg.lstsq(
            np.column_stack((2 * selected_x, 2 * selected_y, np.ones(len(selected_x)))),
            selected_x ** 2 + selected_y ** 2, rcond=None,
        )[0]
        centre_x, centre_y = coefficients[:2]
        distances = np.hypot(x - centre_x, y - centre_y)
        deviation = np.abs(distances - np.median(distances[keep]))
        keep = deviation < max(3, np.quantile(deviation, 0.93))
    centre_x, centre_y = round(float(centre_x)), round(float(centre_y))
    distances = np.hypot(x - centre_x, y - centre_y)
    radius = math.floor(float(distances.min()) - 1)
    grid_y, grid_x = np.ogrid[:foreground.shape[0], :foreground.shape[1]]
    circle = (grid_x - centre_x) ** 2 + (grid_y - centre_y) ** 2 <= radius ** 2
    if np.any(circle & ~foreground):
        raise ValueError(f"Fitted circle exposes previously transparent pixels: {source.name}")
    removed = foreground & ~circle
    pixels[:, :, 3] = np.where(circle, 255, 0).astype("uint8")
    destination.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(pixels).save(destination)
    return {
        "centre": [centre_x, centre_y],
        "radius": radius,
        "maxRemovedRadialPixels": round(float(distances.max()) - radius, 3),
        "removedOpaquePixels": int(removed.sum()),
        "addedOpaquePixels": 0,
        "rgbUnchanged": True,
        "visualApprovalRequired": True,
    }
