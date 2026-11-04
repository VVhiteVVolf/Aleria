"""Derive web maps and source receipts without changing map content."""
from __future__ import annotations

from collections import deque
import hashlib
import json
from pathlib import Path

import numpy as np
from PIL import Image

REALM = Path(__file__).resolve().parents[1]
SOURCE = Path("C:/Users/fhg_r/Downloads/L\u00e4nder/Das Kaiserreich Argentum/Calidaria Provinz")
MAPS = (
    ("normal", "Kaiserreich (Calidaria) (Normal).png", "Normal"),
    ("regions", "Kaiserreich (Calidaria).png", "Archonate"),
)


def sha256(path: Path) -> str:
    with path.open("rb") as source:
        return hashlib.file_digest(source, "sha256").hexdigest()


def marker_components(image: Image.Image) -> list[dict]:
    """Read connected white source marks; never edit any map pixels."""
    mask = np.min(np.asarray(image.convert("RGB")), axis=2) > 248
    height, width = mask.shape
    components = []
    for start_y, start_x in np.argwhere(mask):
        if not mask[start_y, start_x]:
            continue
        mask[start_y, start_x] = False
        queue = deque([(int(start_x), int(start_y))])
        area = 0
        left = right = int(start_x)
        top = bottom = int(start_y)
        while queue:
            x, y = queue.popleft()
            area += 1
            left, right = min(left, x), max(right, x)
            top, bottom = min(top, y), max(bottom, y)
            for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                if 0 <= nx < width and 0 <= ny < height and mask[ny, nx]:
                    mask[ny, nx] = False
                    queue.append((nx, ny))
        if area > 4000 and right - left > 80 and bottom - top > 80:
            components.append({"area": area, "bbox": [left, top, right, bottom],
                               "centre": [(left + right) / 2, (top + bottom) / 2]})
    return components


def prepare() -> None:
    records = []
    for map_id, filename, short in MAPS:
        source = SOURCE / filename
        target = REALM / "assets/maps" / f"calidaria-{map_id}.webp"
        target.parent.mkdir(parents=True, exist_ok=True)
        with Image.open(source) as opened:
            source_size = list(opened.size)
            markers = marker_components(opened)
            image = opened.convert("RGB")
            image.thumbnail((4096, 4096), Image.Resampling.LANCZOS)
            image.save(target, "WEBP", quality=94, method=6)
        if len(markers) != 22:
            raise ValueError(f"Expected 22 visually reviewed source markers: {filename}")
        records.append({"id": map_id, "file": filename, "short": short,
                        "sourcePath": str(source), "sourceSha256": sha256(source),
                        "sourceImageSize": source_size, "originalRetained": True,
                        "map": target.relative_to(REALM).as_posix(), "sha256": sha256(target),
                        "imageSize": list(image.size), "noGeometryEdits": True,
                        "cityNamesBaked": False, "regionLabelsBaked": True,
                        "sourceMarkers": markers})
    manifest = {"schemaVersion": 1, "maps": records,
                "sourceRetained": True, "anchorsFromDrawnMarkers": True,
                "visualReview": {"archonates": 7, "imperialDomains": 1,
                                 "settlements": 22, "circles": 14, "squares": 7, "diamonds": 1}}
    destination = REALM / "sources/map-sources.json"
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    source_manifest = REALM / "assets.source.json"
    existing = json.loads(source_manifest.read_text(encoding="utf-8")) if source_manifest.exists() else {"schemaVersion": 1}
    existing.update({"sourceFolder": str(SOURCE), "maps": records})
    source_manifest.write_text(json.dumps(existing, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"maps": len(records), "markers": len(records[0]["sourceMarkers"])}))


if __name__ == "__main__":
    prepare()
