"""Export the four Balchder sheets through the original V3 crop implementation."""
from pathlib import Path
import hashlib
import importlib.util
import json
import shutil
import tkinter as tk
import zipfile
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
WORKSHOP = ROOT / "AleriaAlmanach" / "AvatarWerkstatt"
DIAGNOSTICS = Path(__file__).resolve().parent
SPLITTER_PATH = WORKSHOP / "Werkzeuge" / "Avatar Splitterer" / "AvatarSplitterPro_V3.py"
spec = importlib.util.spec_from_file_location("aleria_avatar_splitter_v3", SPLITTER_PATH)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
interpreter = tk.Tcl()
splitter = object.__new__(module.AvatarSplitterProV3)
splitter.cols = tk.IntVar(master=interpreter, value=3)
splitter.rows = tk.IntVar(master=interpreter, value=3)
splitter.gap_x = tk.IntVar(master=interpreter, value=0)
splitter.gap_y = tk.IntVar(master=interpreter, value=0)
splitter.autocrop = tk.BooleanVar(master=interpreter, value=False)
splitter.grid_x = [0, 1/3, 2/3, 1]
splitter.grid_y = [0, 1/3, 2/3, 1]
splitter.adjustments = [splitter.empty_adjustment() for _ in range(9)]
font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 17)

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

report = {
    "createdAt": "2026-10-30",
    "generator": "Built-in image_gen",
    "splitter": str(SPLITTER_PATH.relative_to(ROOT)),
    "splitterSha256": digest(SPLITTER_PATH),
    "configuration": {"cols": 3, "rows": 3, "gap_x": 0, "gap_y": 0, "autocrop": False},
    "sets": [],
}
archive_entries = []
for name in ("Blodwen Balchder", "Rice Balchder"):
    slug = name.lower().replace(" ", "-")
    character = WORKSHOP / "Charaktere" / "Einzelcharaktere" / name
    reference = character / "Referenzen" / (slug + ".jpg")
    original = ROOT / "Stammbäume" / "assets" / "images" / "portraits" / "haus-balchder" / reference.name
    assert digest(reference) == digest(original), "Reference copy differs from the original"
    all_crops = []
    output_files = []
    for set_id in ("set-01", "set-02"):
        order_file = character / "Prompts" / (slug + "-" + set_id + "-auftrag.json")
        order = json.loads(order_file.read_text(encoding="utf-8"))
        assert len(order["panels"]) == 9
        sheet = character / order["sheetFile"]
        processing = character / "Verarbeitung" / set_id
        processing.mkdir(parents=True, exist_ok=True)
        sheet_hash = digest(sheet)
        working_copy = processing / sheet.name
        if working_copy.exists():
            assert digest(working_copy) == sheet_hash
        else:
            shutil.copy2(sheet, working_copy)
        with Image.open(working_copy) as source:
            assert source.format == "PNG"
            assert source.width == source.height and source.width % 3 == 0
            image = source.convert("RGBA")
        crops = splitter.get_crops(image)
        assert len(crops) == 9
        record = {
            "character": name, "setId": set_id,
            "sheet": str(sheet.relative_to(ROOT)),
            "sheetSha256": sheet_hash,
            "sheetPixels": list(image.size),
            "referenceSha256": digest(reference),
            "method": "AvatarSplitterProV3.get_crops; original implementation, no GUI or config changes",
            "exports": [],
        }
        for index, (crop, panel) in enumerate(zip(crops, order["panels"]), 1):
            assert crop.size == (image.width // 3, image.height // 3)
            target = character / "Output" / (slug + "-" + set_id + "_Bild" + str(index) + ".png")
            if target.exists():
                with Image.open(target) as previous:
                    assert previous.convert("RGBA").tobytes() == crop.tobytes(), "Refusing to overwrite changed output"
            else:
                crop.save(target)
            with Image.open(target) as check:
                check.verify()
            record["exports"].append({
                "index": index, "emotion": panel["emotion"],
                "file": str(target.relative_to(ROOT)),
                "pixels": list(crop.size),
                "cropBox": list(splitter.crop_box(image, index - 1)),
                "sha256": digest(target),
                "bytes": target.stat().st_size,
            })
            output_files.append(target)
            all_crops.append((crop.copy(), set_id + " / " + str(index), panel["emotion"]))
        assert digest(sheet) == sheet_hash
        manifest_file = processing / "export-manifest.json"
        manifest_file.write_text(json.dumps(record, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        report["sets"].append(record)
        order["status"] = "exportiert"
        order["sheet"]["width"] = image.width
        order["sheet"]["height"] = image.height
        order["exportManifest"] = str(manifest_file.relative_to(character)).replace("\\", "/")
        order_file.write_text(json.dumps(order, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    assert len(output_files) == 18
    assert len({digest(path) for path in output_files}) == 18, "Duplicate avatar files"
    tile, footer, gap = 300, 55, 12
    overview = Image.new("RGB", (6 * (tile + gap) + gap, 3 * (tile + footer + gap) + gap), "#eee6d4")
    draw = ImageDraw.Draw(overview)
    for index, (crop, position, emotion) in enumerate(all_crops):
        x, y = gap + (index % 6) * (tile + gap), gap + (index // 6) * (tile + footer + gap)
        preview = crop.convert("RGB").resize((tile, tile), Image.Resampling.LANCZOS)
        overview.paste(preview, (x, y))
        draw.text((x + 4, y + tile + 4), position, font=font, fill="#45351d")
        draw.text((x + 4, y + tile + 27), emotion, font=font, fill="#45351d")
    overview.save(DIAGNOSTICS / (slug + "-18-emotes-pruefuebersicht.jpg"), quality=94)
    for subdir in ("Output", "Sheets", "Prompts", "Referenzen"):
        for file in sorted((character / subdir).iterdir()):
            if file.is_file() and file.name != ".gitkeep":
                archive_entries.append((file, name + "/" + subdir + "/" + file.name))
    archive_entries.append((character / "README.md", name + "/README.md"))

assert sum(len(s["exports"]) for s in report["sets"]) == 36
archive = WORKSHOP / "Output" / "Balchder-Emotes-2026-10-30.zip"
if archive.exists():
    raise FileExistsError("Archive already exists; inspect before replacing")
with zipfile.ZipFile(archive, "x", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as bundle:
    for source, entry in archive_entries:
        bundle.write(source, entry)
with zipfile.ZipFile(archive) as bundle:
    assert bundle.testzip() is None
    assert len(bundle.namelist()) == len(archive_entries)
    for source, entry in archive_entries:
        assert hashlib.sha256(bundle.read(entry)).hexdigest() == digest(source)
report["archive"] = {
    "file": str(archive.relative_to(ROOT)), "sha256": digest(archive),
    "bytes": archive.stat().st_size, "entries": len(archive_entries),
}
report["technicalStatus"] = "passed"
report["visualStatus"] = "pending"
(DIAGNOSTICS / "verification.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps({
    "sheets": len(report["sets"]), "avatars": 36,
    "sheetPixels": report["sets"][0]["sheetPixels"],
    "avatarPixels": report["sets"][0]["exports"][0]["pixels"],
    "zip": str(archive), "zipBytes": archive.stat().st_size,
}, ensure_ascii=False))

