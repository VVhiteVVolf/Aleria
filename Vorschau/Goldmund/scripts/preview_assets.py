"""Composite production-alpha contact sheets for technical visual QA only."""

import argparse
import json
import math
from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT.parents[1] / "diagnostics/goldmund/final-previews"


def contact_sheet(categories: list[str], columns: int, tile_size: int) -> Path:
    entries = json.loads((ROOT / "assets.generated.json").read_text(encoding="utf-8"))
    entries = [entry for entry in entries if entry["category"] in categories]
    if not entries:
        raise ValueError("No production images available for these categories")
    columns = min(columns, len(entries))
    rows = math.ceil(len(entries) / columns)
    background = (225, 225, 225, 255)
    sheet = Image.new("RGB", (columns * tile_size, rows * tile_size), background[:3])
    labels = ImageDraw.Draw(sheet)
    for index, entry in enumerate(entries):
        with Image.open(ROOT / entry["production"]) as source:
            image = source.convert("RGBA")
            image.thumbnail((tile_size - 20, tile_size - 32), Image.Resampling.LANCZOS)
        tile = Image.new("RGBA", (tile_size, tile_size), background)
        tile.alpha_composite(image, ((tile_size - image.width) // 2, 8))
        left, top = (index % columns) * tile_size, (index // columns) * tile_size
        sheet.paste(tile.convert("RGB"), (left, top))
        labels.text((left + 10, top + tile_size - 20), entry["id"], fill=(30, 30, 30))
    OUTPUT.mkdir(parents=True, exist_ok=True)
    destination = OUTPUT / ("-".join(categories) + "-contact.jpg")
    sheet.save(destination, quality=95)
    return destination


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--category", nargs="+", choices=("crests", "realm", "banners", "history"), default=["crests", "realm", "banners", "history"])
    parser.add_argument("--columns", type=int, default=6)
    parser.add_argument("--tile-size", type=int, default=320)
    args = parser.parse_args()
    if args.columns < 1 or args.tile_size < 100:
        parser.error("Columns must be positive and tile size at least 100")
    print(contact_sheet(args.category, args.columns, args.tile_size))
