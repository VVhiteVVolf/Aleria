"""Commissioned Gwen exports, using the unchanged Avatar Splitter Pro V3.

No image is resized. --plan reads only; --export creates new files exclusively.
"""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
import hashlib
import importlib.util
import io
import json
from pathlib import Path
from types import SimpleNamespace

from PIL import Image


PERSON = Path(__file__).resolve().parents[1]
WORKSHOP = PERSON.parents[2]
PROCESSING = PERSON / "Verarbeitung"
GLOBAL_OUTPUT = WORKSHOP / "Output" / "Gwen Hamnett"
STEMS = tuple(f"gwen-hamnett-20261103-set-{index:02}" for index in range(1, 4))


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def encode_json(value: dict) -> bytes:
    return (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode("utf-8")


def create_splitter():
    source = WORKSHOP / "Werkzeuge/Avatar Splitterer/AvatarSplitterPro_V3.py"
    spec = importlib.util.spec_from_file_location("gwen_avatar_v3", source)
    if spec is None or spec.loader is None:
        raise RuntimeError("Die unveränderte V3 konnte nicht geladen werden.")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    splitter = module.AvatarSplitterProV3.__new__(module.AvatarSplitterProV3)
    variable = lambda value: SimpleNamespace(get=lambda: value)
    splitter.cols = splitter.rows = variable(3)
    splitter.gap_x = splitter.gap_y = variable(0)
    splitter.autocrop = variable(False)
    splitter.grid_x = splitter.grid_y = [0, 1 / 3, 2 / 3, 1]
    splitter.adjustments = [module.AvatarSplitterProV3.empty_adjustment() for _ in range(9)]
    return splitter, source


def checked_new_path(path: Path) -> None:
    if not path.resolve().is_relative_to(WORKSHOP):
        raise ValueError(f"Ausgabepfad außerhalb der Werkstatt: {path}")
    for ancestor in (path, *path.parents):
        if ancestor.is_symlink() or getattr(ancestor, "is_junction", lambda: False)():
            raise ValueError(f"Umgeleiteter Ausgabepfad wird nicht beschrieben: {ancestor}")
        if ancestor == WORKSHOP:
            break
    if path.exists():
        raise FileExistsError(f"Vorhandene Datei wird nicht überschrieben: {path}")


def prepare_sheet(index: int, splitter) -> dict:
    stem = STEMS[index - 1]
    source = PERSON / "Sheets" / f"{stem}.png"
    original = source.read_bytes()
    with Image.open(io.BytesIO(original)) as image:
        image.load()
        if image.format != "PNG" or image.width != image.height:
            raise ValueError(f"Quadratisches PNG-Sheet erforderlich: {source}")
        base_boxes = splitter.base_boxes(image)
        side = min(min(right - left, bottom - top) for left, top, right, bottom in base_boxes)
        adjustments = []
        for left, top, right, bottom in base_boxes:
            trim_x, trim_y = right - left - side, bottom - top - side
            if trim_x not in (0, 1) or trim_y not in (0, 1):
                raise ValueError("Die V3-Rasterabweichung ist größer als ein Pixel.")
            adjustments.append(dict(left=0, top=0, right=-trim_x, bottom=-trim_y))
        splitter.adjustments = adjustments
        boxes = [list(splitter.crop_box(image, cell)) for cell in range(9)]
        crops = splitter.get_crops(image.convert("RGBA"))
        dimensions = list(image.size)
    outputs, panels = [], []
    for cell, (crop, box, adjustment) in enumerate(zip(crops, boxes, adjustments), 1):
        if crop.size != (side, side):
            raise ValueError("Die unveränderte V3 lieferte keinen einheitlichen quadratischen Ausschnitt.")
        buffer = io.BytesIO()
        crop.save(buffer, format="PNG")
        data = buffer.getvalue()
        name = f"{stem}_Bild{cell}.png"
        destinations = [PERSON / "Output" / name, GLOBAL_OUTPUT / name]
        outputs.extend((destination, data) for destination in destinations)
        panels.append(dict(panel=cell, file=name, size=[side, side], box=box,
                           edgeAdjustments=adjustment, sha256=sha256(data), bytes=len(data)))
    work = PROCESSING / f"set-{index:02}"
    receipt = dict(set=index, source=f"Sheets/{source.name}", sourceSha256=sha256(original),
                   sourceSize=dimensions, rows=3, columns=3, gapX=0, gapY=0, autocrop=False,
                   resampling=False, baseBoxes=base_boxes, panels=panels)
    outputs.append((work / "Benutzt" / source.name, original))
    outputs.append((work / "export-receipt.json", encode_json(receipt)))
    return dict(source=source, sourceSha256=sha256(original), receipt=receipt, outputs=outputs)


def export_jobs(write: bool) -> dict:
    splitter, splitter_source = create_splitter()
    jobs = [prepare_sheet(index, splitter) for index in range(1, 4)]
    manifest = dict(schema="aleria.avatar-workshop-export", schemaVersion=1,
                    person="Gwen Hamnett", createdAt=datetime.now(timezone.utc).isoformat(),
                    splitter="Werkzeuge/Avatar Splitterer/AvatarSplitterPro_V3.py",
                    splitterSha256=sha256(splitter_source.read_bytes()),
                    method="Unchanged V3 get_crops/base_boxes with recorded V3 edge adjustments",
                    sourceSheetsPreserved=True, rows=3, columns=3, gapX=0, gapY=0,
                    autocrop=False, resampling=False, avatarCount=27,
                    outputFolder="Output/Gwen Hamnett", sets=[job["receipt"] for job in jobs])
    outputs = [output for job in jobs for output in job["outputs"]]
    outputs.append((PROCESSING / "export-gwen-20261103-manifest.json", encode_json(manifest)))
    paths = [path for path, _ in outputs]
    if len(set(paths)) != len(paths):
        raise ValueError("Doppelte Ausgabepfade im Auftrag.")
    for path in paths:
        checked_new_path(path)
    for job in jobs:
        if sha256(job["source"].read_bytes()) != job["sourceSha256"]:
            raise ValueError("Ein Sheet wurde während der Vorbereitung geändert.")
    if write:
        for path, data in outputs:
            path.parent.mkdir(parents=True, exist_ok=True)
            with path.open("xb") as output:
                output.write(data)
            if sha256(path.read_bytes()) != sha256(data):
                raise IOError(f"Die geschriebene Datei konnte nicht verifiziert werden: {path}")
        for job in jobs:
            if sha256(job["source"].read_bytes()) != job["sourceSha256"]:
                raise ValueError("Ein Quell-Sheet wurde während des Exports extern geändert.")
    return dict(written=write, sheets=3, avatars=27, pngCopies=54,
                sizes=[job["receipt"]["panels"][0]["size"] for job in jobs],
                outputFolder=str(GLOBAL_OUTPUT), filesCreated=len(outputs) if write else 0)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--plan", action="store_true", help="Alle drei Sheets und neue Zielpfade nur prüfen.")
    mode.add_argument("--export", action="store_true", help="Nach expliziter Freigabe neue Avatare und Belege anlegen.")
    args = parser.parse_args()
    print(json.dumps(export_jobs(write=args.export), ensure_ascii=False))


if __name__ == "__main__":
    main()
