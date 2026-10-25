"""Offline registration of the supplied raid map against the existing Leitheach map.

Requires Pillow and NumPy. Reads archived evidence; never edits it or map state.
Run from the repository root: python shared/coastal-history/calibrate-leitheach-map.py
"""

from pathlib import Path
import hashlib
import json
import re

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
ARCHIVE = ROOT / "Archiv/Quellen/kuestenchroniken-2026-10-24"
SOURCE = ARCHIVE / "assets/leitheach-raid-worldanvil.jpg"
TARGET = ROOT / "Karten/Leitheach/Kartenbilder/normal.webp"
OUTPUT = Path(__file__).with_name("leitheach-route.json")
PATCHES = [
    (3150, 800, 3700, 1260),
    (1800, 100, 2140, 420),
    (190, 350, 520, 700),
    (1100, 900, 1450, 1260),
    (2300, 2100, 2680, 2450),
    (3460, 2290, 3900, 2650),
]

# The archive has two markers for each paired settlement event. Their identities
# are retained separately rather than replacing them with an invented midpoint.
MARKER_IDS = [
    "sea-cluainslige", "torrachadh", "river-reinforcement", "dairchoill",
    "escape-direction", "southern-islands-west", "southern-islands-east",
    "diversion-torrinbhir", "dun-laog", "broch-an-clais", "gleannbuar",
    "abhainnclachan", "diversion-fionnmara", "dun-athar-reinforcement",
    "srathonn", "seannbail", "ceodraig",
]


def correlate_window(source, target, box, scale, approximate_scale=.64):
    """Find a resized source patch in a bounded target window using NCC."""
    patch = source.crop(box)
    template = np.asarray(patch.resize(
        (round(patch.width * scale), round(patch.height * scale)),
        Image.Resampling.LANCZOS,
    ), dtype=np.float32)
    left = max(0, round(box[0] * approximate_scale) - 24)
    top = max(0, round(box[1] * approximate_scale) - 24)
    height, width = template.shape
    search = target[top:top + height + 50, left:left + width + 50]
    fft_shape = (search.shape[0] + height - 1, search.shape[1] + width - 1)
    centered = template - template.mean()
    template_norm = np.sqrt((centered * centered).sum())
    axes = (0, 1)
    convolution = np.fft.irfftn(
        np.fft.rfftn(search, fft_shape, axes)
        * np.fft.rfftn(centered[::-1, ::-1], fft_shape, axes),
        fft_shape, axes,
    )

    def window_sums(array):
        integral = np.pad(array, ((1, 0), (1, 0))).cumsum(0).cumsum(1)
        return (integral[height:, width:] - integral[:-height, width:]
                - integral[height:, :-width] + integral[:-height, :-width])

    sums = window_sums(search)
    squares = window_sums(search * search)
    variance = np.maximum(squares - sums * sums / (height * width), 1)
    scores = convolution[height - 1:search.shape[0], width - 1:search.shape[1]]
    scores /= np.sqrt(variance) * template_norm
    y, x = np.unravel_index(scores.argmax(), scores.shape)
    return float(scores[y, x]), float(left + x), float(top + y)


def register_images(source, target, patches=PATCHES, scales=None, approximate_scale=.64):
    matches = []
    if scales is None:
        scales = np.arange(.636, .6461, .0005)
    for box in patches:
        candidates = []
        for scale in scales:
            score, left, top = correlate_window(source, target, box, float(scale), approximate_scale)
            candidates.append((score, float(scale), left, top))
        score, scale, left, top = max(candidates)
        matches.append({
            "sourceBox": list(box), "ncc": score, "localScale": scale,
            "sourceCenter": [(box[0] + box[2]) / 2, (box[1] + box[3]) / 2],
            "targetCenter": [left + round((box[2] - box[0]) * scale) / 2,
                             top + round((box[3] - box[1]) * scale) / 2],
        })
    source_points = np.array([match["sourceCenter"] for match in matches])
    target_points = np.array([match["targetCenter"] for match in matches])
    coefficients = [np.linalg.lstsq(
        np.c_[source_points[:, axis], np.ones(len(matches))],
        target_points[:, axis], rcond=None,
    )[0] for axis in (0, 1)]
    predicted = np.c_[
        source_points[:, 0] * coefficients[0][0] + coefficients[0][1],
        source_points[:, 1] * coefficients[1][0] + coefficients[1][1],
    ]
    residuals = np.sqrt(((predicted - target_points) ** 2).sum(axis=1))
    for match, residual in zip(matches, residuals):
        match["fitResidualPx"] = float(residual)
    return coefficients, matches, float(np.sqrt((residuals ** 2).mean()))


def event_records():
    rows = [
        ("seannbail", "Angriff auf Seannbail", "coastal-03", "raid", ["seannbail"], "diversion"),
        ("broch-an-clais", "Sturm auf Broch an Clais", "coastal-04", "siege", ["broch-an-clais"], "clais"),
        ("gleannbuar", "Plünderung von Gleannbuar", "coastal-05", "raid", ["gleannbuar"], "river-raids"),
        ("dairchoill-ceodraig", "Überfall auf Dairchoill und Ceòdraig", "coastal-06", "raid", ["dairchoill", "ceodraig"], "river-raids"),
        ("abhainnclachan-srathonn", "Angriff auf Abhainnclachan und Srathonn", "coastal-07", "raid", ["abhainnclachan", "srathonn"], "river-raids"),
        ("torrachadh", "Plünderung von Tòrrachadh", "coastal-08", "raid", ["torrachadh"], "river-raids"),
        ("dun-laog", "Angriff auf Dun Laog", "coastal-09", "siege", ["dun-laog"], "dun-laog"),
    ]
    return [{"id": row[0], "title": row[1], "sourceDocumentId": row[2],
             "kind": row[3], "markerIds": row[4], "stageId": row[5]} for row in rows]


def assemble_markers(coefficients, source_size, target_size, events):
    capture = json.loads((ARCHIVE / "worldanvil-markers.capture.json").read_text(encoding="utf-8"))
    result = []
    event_by_marker = {marker: event for event in events for marker in event["markerIds"]}
    kinds = {"sea-cluainslige": "sea-battle", "river-reinforcement": "reinforcement",
             "dun-athar-reinforcement": "reinforcement", "escape-direction": "retreat"}
    source_ids = []
    for marker_id, row in zip(MARKER_IDS, capture["rows"], strict=True):
        x, bottom_y = map(int, row["cells"][2].split(":"))
        top_y = source_size[1] - bottom_y
        px = x * coefficients[0][0] + coefficients[0][1]
        py = top_y * coefficients[1][0] + coefficients[1][1]
        phase = re.findall(r"Phase ([IVX]+)\.", row["cells"][3])[-1]
        event = event_by_marker.get(marker_id)
        kind = event["kind"] if event else kinds.get(marker_id, "diversion" if marker_id.startswith("diversion-") else "raid")
        marker_source_id = row["edit"].split("/")[-2]
        source_ids.append(marker_source_id)
        item = {
            "id": marker_id, "title": " ".join(row["title"].split()),
            "kind": kind, "eventId": event["id"] if event else None,
            "stageId": event["stageId"] if event else "diversion" if phase == "I" else "dun-laog",
            "sourceMapPhase": phase,
            "x": float(px / target_size[0]), "y": float(py / target_size[1]),
            "targetPixels": {"x": float(px), "y": float(py)},
            "source": {"markerId": marker_source_id, "x": x, "yFromBottom": bottom_y,
                       "yFromTop": top_y, "url": "https://www.worldanvil.com" + row["edit"]},
            "accuracy": {"registrationTolerancePx": 4, "scope": "original-marker-anchor"},
        }
        if kind in ("reinforcement", "retreat"):
            item["locationNote"] = "Richtungsmarkierung der Quelle, kein Ortsmittelpunkt."
        if marker_id == "sea-cluainslige":
            item["time"] = None
            item["timeNote"] = "Die Karte benennt das Gefecht; eine genaue Uhrzeit ist nicht überliefert."
        result.append(item)
    assert len(result) == 17 and len(set(source_ids)) == 17
    assert all(0 <= marker[axis] <= 1 for marker in result for axis in ("x", "y"))
    return result


def build_distance_reference(target):
    """Register the two actual Sleagh pins; retain the user's imprecise scale."""
    folder = ROOT / "Karten/Leitheach/tir-na-sleagh"
    image_path = folder / "Kartenbilder/normal.webp"
    data_path = folder / "data.json"
    source = Image.open(image_path).convert("L")
    patches = [(200, 700, 900, 1250), (900, 1500, 1500, 2000),
               (1700, 1750, 2200, 2250), (2000, 2400, 2450, 2800),
               (2600, 2000, 3000, 2400)]
    coefficients, matches, error = register_images(
        source, target, patches, np.arange(.408, .4221, .00025), .414,
    )
    source_data = json.loads(data_path.read_text(encoding="utf-8"))
    pins_by_id = {pin["id"]: pin for pin in source_data["state"]["pins"]}
    pin_ids = ["6530d8ac-656c-42f3-836d-087d9b67b3bb",
               "e15e9db3-0611-445f-836a-0c62543cf9cc"]
    pins = []
    for pin_id in pin_ids:
        pin = pins_by_id[pin_id]
        px, py = pin["x"] * source.width, pin["y"] * source.height
        tx = coefficients[0][0] * px + coefficients[0][1]
        ty = coefficients[1][0] * py + coefficients[1][1]
        pins.append({"id": pin_id, "title": pin["title"],
                     "sourceNormalized": {"x": pin["x"], "y": pin["y"]},
                     "sourcePixels": {"x": px, "y": py},
                     "targetPixels": {"x": float(tx), "y": float(ty)},
                     "x": float(tx / 4096), "y": float(ty / 3573)})
    distance = float(np.hypot(
        pins[1]["targetPixels"]["x"] - pins[0]["targetPixels"]["x"],
        pins[1]["targetPixels"]["y"] - pins[0]["targetPixels"]["y"],
    ))
    return {
        "id": "dun-athar-dunbaile", "label": "Dun Athar – Dunbaile",
        "display": "30+ km, ungefährer Mindest-Richtwert",
        "sourceType": "user-instruction", "nominalMinimumKm": 30,
        "precision": "approximate-minimum-guideline", "actualTravelRouteKnown": False,
        "measurementBasis": "same-submap-pin-separation-transferred-to-main-map",
        "mainMapDistancePx": distance, "pins": pins,
        "source": {"data": data_path.relative_to(ROOT).as_posix(),
                   "image": image_path.relative_to(ROOT).as_posix(),
                   "width": source.width, "height": source.height,
                   "imageSha256": hashlib.sha256(image_path.read_bytes()).hexdigest(),
                   "dataSha256": hashlib.sha256(data_path.read_bytes()).hexdigest()},
        "registration": {"xScale": float(coefficients[0][0]),
                         "xOffsetPx": float(coefficients[0][1]),
                         "yScale": float(coefficients[1][0]),
                         "yOffsetPx": float(coefficients[1][1]),
                         "fitRmsPx": error, "registrationTolerancePx": 4,
                         "matches": matches},
        "caveats": [
            "Die Nutzervorgabe ist ein ungefährer Mindest-Richtwert, keine exakte Vermessung.",
            "Es ist nicht festgelegt, ob die 30+ km eine Luftlinie oder eine konkrete Wegstrecke meinen. Die Übertragung dient nur der groben Plausibilitätsprüfung.",
            "Beide Referenzanker stammen aus derselben Teilkarte. Der abweichende Hauptkarten-Pin Dun Athars wird nicht mit dem Teilkarten-Pin vermischt.",
            "Flussbiegungen, Strömung, Wetter, Anlanden, Kämpfe und Aufenthalt sind in den geometrischen Abständen nicht enthalten.",
        ],
    }


def main():
    source = Image.open(SOURCE).convert("L")
    target_image = Image.open(TARGET).convert("L")
    target = np.asarray(target_image, dtype=np.float32)
    coefficients, matches, error = register_images(source, target)
    events = event_records()
    markers = assemble_markers(coefficients, source.size, target_image.size, events)
    distance_reference = build_distance_reference(target)
    model = {
        "version": 2, "id": "leitheach-raid-1733", "title": "Der Raubzug durch Leitheach",
        "year": 1733, "season": "Winter", "datePrecision": "season",
        "map": {"image": "/Karten/Leitheach/Kartenbilder/normal.webp", "width": 4096,
                "height": 3573, "coordinateOrigin": "top-left", "coordinates": "normalized",
                "href": "/Karten/karte.html?map=leitheach",
                "focusBounds": {"x": .01, "y": .02, "width": .60, "height": .43}},
        "sourceMap": {"url": "https://www.worldanvil.com/world/map/27cd3b5b-5a6c-414d-afc4-dcd4bf50771e/edit",
                      "image": SOURCE.relative_to(ROOT).as_posix(), "width": 4096, "height": 2755,
                      "coordinateOrigin": "bottom-left", "sha256": hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
                      "markerEvidence": (ARCHIVE / "worldanvil-markers.capture.json").relative_to(ROOT).as_posix()},
        "calibration": {
            "method": "six-window-normalized-cross-correlation-and-axis-aligned-least-squares",
            "xScale": float(coefficients[0][0]), "xOffsetPx": float(coefficients[0][1]),
            "yScale": float(coefficients[1][0]), "yOffsetPx": float(coefficients[1][1]),
            "formula": {"x": "(xScale * sourceX + xOffsetPx) / 4096",
                        "y": "(yScale * (2755 - sourceYFromBottom) + yOffsetPx) / 3573"},
            "targetSha256": hashlib.sha256(TARGET.read_bytes()).hexdigest(),
            "fitRmsPx": error, "registrationTolerancePx": 4, "matches": matches,
            "note": "Die Toleranz beschreibt die Bildregistrierung, nicht die historische Genauigkeit der Quellmarkierung.",
        },
        "events": events, "markers": markers,
        "distanceReference": distance_reference,
        "chronologyFile": "shared/coastal-history/leitheach-chronology.json",
        "markerAssets": {
            "sea-battle": "/Ereignisse/assets/coastal-history/markers/sea-battle.svg",
            "raid": "/Ereignisse/assets/coastal-history/markers/raid.svg",
            "siege": "/Ereignisse/assets/coastal-history/markers/siege.svg",
        },
        "routes": [
            {"id": "main-advance", "title": "Hauptangriff und Vorstoß flussaufwärts", "kind": "attack", "stageIds": ["clais", "river-raids", "dun-laog"], "markerIds": ["seannbail", "broch-an-clais", "gleannbuar", "abhainnclachan", "srathonn", "torrachadh", "dun-laog"]},
            {"id": "southern-branch", "title": "Überfälle auf die südlichen Siedlungen", "kind": "attack", "stageIds": ["river-raids", "dun-laog"], "markerIds": ["broch-an-clais", "dairchoill", "ceodraig", "srathonn", "torrachadh", "dun-laog"]},
            {"id": "reinforcement-river", "title": "Verstärkung über den Fluss", "kind": "reinforcement", "stageIds": ["dun-laog"], "markerIds": ["river-reinforcement", "dun-laog"]},
            {"id": "reinforcement-dun-athar", "title": "Verstärkungsrichtung aus Dun Athar", "kind": "reinforcement", "stageIds": ["dun-laog"], "markerIds": ["dun-athar-reinforcement", "sea-cluainslige"]},
            {"id": "retreat", "title": "Rückzugsrichtung der Piraten", "kind": "retreat", "stageIds": ["dun-laog"], "markerIds": ["dun-laog", "torrachadh", "srathonn", "abhainnclachan", "broch-an-clais", "sea-cluainslige", "escape-direction"], "time": "22:00–Mitternacht"},
        ],
        "routeGeometry": "schematic-marker-connections",
        "routeNote": "Die Linien verbinden die überlieferten Ereignisorte und Richtungsmarker schematisch. Sie geben keine metergenaue Schiffsroute oder gleichförmige Fahrgeschwindigkeit vor.",
        "editorialNotes": [
            "Die drei Kartenphasen der Quelle werden separat erhalten. Die vier Erzählphasen folgen coastal-02:B030–B037.",
            "Die Zeiten werden ausschließlich aus leitheach-chronology.json ergänzt; die Bildkalibrierung besitzt keine eigene Chronologie.",
            "Für die beiden Inselüberfälle und das Seescharmützel vor Cluainslige gibt es keine eigene ausgearbeitete Ereignisvorlage und keine genaue Zeit.",
            "Der heutige Orts-Pin Dun Laogs wird nicht mit dem historischen Angriffsmarker gleichgesetzt. Beide liegen am selben Stadtmotiv, haben aber verschiedene Anker.",
            "Dun Athar und die Fluchtroute sind in der Quelle als Richtungen im Seegebiet markiert; die Punkte sind keine erfundenen Siedlungen.",
        ],
    }
    marker_ids = {marker["id"] for marker in markers}
    assert all(set(route["markerIds"]) <= marker_ids for route in model["routes"])
    OUTPUT.write_text(json.dumps(model, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{OUTPUT.relative_to(ROOT)}: 17 markers, 7 events, RMS {error:.3f} px")


if __name__ == "__main__":
    main()
