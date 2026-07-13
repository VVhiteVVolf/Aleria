from __future__ import annotations

from math import hypot
from pathlib import Path
import subprocess

from fontTools.feaLib.builder import addOpenTypeFeaturesFromString
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.t2CharStringPen import T2CharStringPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont


ROOT = Path(__file__).resolve().parent
DIST = ROOT / "dist"
TTF_OUT = DIST / "KanaanithMonumental-Regular.ttf"
OTF_OUT = DIST / "KanaanithMonumental-Regular.otf"
WOFF_OUT = DIST / "KanaanithMonumental-Regular.woff"
WOFF2_OUT = DIST / "KanaanithMonumental-Regular.woff2"

UPM = 1000
ADVANCE = 700
ASCENT = 920
DESCENT = -180


SIGNS = [
    ("Aleph", "𐤀", "A", "Stier · Kraft · Führung"),
    ("Beth", "𐤁", "B", "Haus · Familie · Schutz"),
    ("Gimel", "𐤂", "G", "Kamel · Reise · Ausdauer"),
    ("Daleth", "𐤃", "D", "Tür · Zugang · Übergang"),
    ("He", "𐤄", "H", "Fenster · Licht · Offenbarung"),
    ("Waw", "𐤅", "W", "Haken · Nagel · Bindung"),
    ("Zayin", "𐤆", "Z", "Waffe · Schwert · Entscheidung"),
    ("Heth", "𐤇", "Ḥ", "Zaun · Mauer · Einschluss"),
    ("Teth", "𐤈", "Ṭ", "Rad · Zyklus · Schicksal"),
    ("Yodh", "𐤉", "Y", "Hand · Arm · Tat"),
    ("Kaph", "𐤊", "K", "Handfläche · Gabe · Empfang"),
    ("Lamedh", "𐤋", "L", "Ochsenstachel · Führung · Lehre"),
    ("Mem", "𐤌", "M", "Wasser · Leben · Reinigung"),
    ("Nun", "𐤍", "N", "Fisch · Nahrung · Fortbestand"),
    ("Samekh", "𐤎", "S", "Stütze · Pfeiler · Ordnung"),
    ("Ayin", "𐤏", "ʿ", "Auge · Sicht · Wissen"),
    ("Pe", "𐤐", "P", "Mund · Sprache · Verkündung"),
    ("Sade", "𐤑", "Ṣ", "Angelhaken · Fang · Auswahl"),
    ("Qoph", "𐤒", "Q", "Nadel · Ahle · Genauigkeit"),
    ("Resh", "𐤓", "R", "Kopf · Herrschaft · Rang"),
    ("Shin", "𐤔", "Š", "Zahn · Verzehr · Kraft"),
    ("Taw", "𐤕", "T", "Zeichen · Eid · Vollendung"),
]


def signed_area(points):
    return sum(
        points[i][0] * points[(i + 1) % len(points)][1]
        - points[(i + 1) % len(points)][0] * points[i][1]
        for i in range(len(points))
    ) / 2


def contour(pen, points, hole=False):
    points = [(round(x), round(y)) for x, y in points]
    if (signed_area(points) > 0) == hole:
        points.reverse()
    pen.moveTo(points[0])
    for point in points[1:]:
        pen.lineTo(point)
    pen.closePath()


def chisel(pen, x1, y1, x2, y2, width=58, cap=13):
    dx, dy = x2 - x1, y2 - y1
    length = hypot(dx, dy)
    ux, uy = dx / length, dy / length
    nx, ny = -uy * width / 2, ux * width / 2
    contour(pen, [
        (x1 - ux * cap, y1 - uy * cap),
        (x1 + nx, y1 + ny),
        (x2 + nx, y2 + ny),
        (x2 + ux * cap, y2 + uy * cap),
        (x2 - nx, y2 - ny),
        (x1 - nx, y1 - ny),
    ])


def diamond(pen, x, y, w=82, h=94, hole=False):
    contour(pen, [(x, y + h / 2), (x + w / 2, y), (x, y - h / 2), (x - w / 2, y)], hole=hole)


def diamond_ring(pen, x, y, w=170, h=195, thickness=38):
    diamond(pen, x, y, w, h)
    diamond(pen, x, y, w - 2 * thickness, h - 2 * thickness, hole=True)


def triangle(pen, points, hole=False):
    contour(pen, points, hole=hole)


DESIGNS = {
    "Aleph": {"s": [(175, 170, 520, 805), (520, 170, 175, 805), (235, 690, 115, 790), (460, 690, 580, 790)]},
    "Beth": {"s": [(200, 145, 200, 815), (200, 815, 520, 650), (520, 650, 200, 465), (200, 465, 485, 290), (200, 145, 470, 145)]},
    "Gimel": {"s": [(255, 155, 255, 815), (255, 155, 515, 155), (255, 365, 455, 270)]},
    "Daleth": {"s": [(175, 155, 175, 815), (175, 815, 535, 485), (535, 485, 175, 155)]},
    "He": {"s": [(185, 150, 185, 815), (515, 150, 515, 815), (185, 615, 515, 615), (185, 350, 515, 350)]},
    "Waw": {"s": [(340, 185, 340, 815), (340, 815, 520, 675), (340, 315, 500, 410)]},
    "Zayin": {"s": [(175, 780, 525, 780), (525, 780, 190, 175), (190, 175, 530, 175)]},
    "Heth": {"s": [(175, 145, 175, 815), (525, 145, 525, 815), (175, 700, 525, 700), (175, 500, 525, 500), (175, 300, 525, 300)]},
    "Teth": {"s": [(350, 155, 350, 815), (170, 485, 530, 485)], "r": [(350, 485, 225, 250, 48)]},
    "Yodh": {"s": [(245, 560, 470, 760), (245, 560, 245, 250), (245, 395, 430, 305)]},
    "Kaph": {"s": [(510, 760, 230, 760), (230, 760, 160, 500), (160, 500, 230, 220), (230, 220, 510, 220), (230, 500, 455, 500)]},
    "Lamedh": {"s": [(310, 120, 310, 850), (310, 850, 510, 720), (310, 530, 480, 625), (310, 300, 455, 215)]},
    "Mem": {"s": [(125, 250, 250, 720), (250, 720, 375, 250), (375, 250, 500, 720), (500, 720, 595, 250), (125, 250, 595, 250)]},
    "Nun": {"s": [(195, 180, 195, 805), (195, 805, 510, 510), (510, 510, 195, 180), (195, 510, 450, 510)]},
    "Samekh": {"s": [(350, 135, 350, 825), (160, 690, 540, 690), (160, 345, 540, 345), (205, 690, 495, 345), (495, 690, 205, 345)]},
    "Ayin": {"s": [(350, 130, 350, 285), (350, 685, 350, 840)], "r": [(350, 485, 270, 245, 52)]},
    "Pe": {"s": [(205, 145, 205, 815), (205, 815, 515, 665), (515, 665, 205, 480), (205, 480, 455, 340)]},
    "Sade": {"s": [(240, 155, 240, 815), (240, 815, 500, 665), (240, 520, 510, 380), (510, 380, 510, 180)]},
    "Qoph": {"s": [(350, 110, 350, 340), (350, 630, 350, 860)], "r": [(350, 485, 220, 230, 46)]},
    "Resh": {"s": [(205, 145, 205, 815), (205, 815, 500, 650), (500, 650, 205, 470), (205, 470, 490, 250)]},
    "Shin": {"s": [(150, 760, 250, 220), (250, 220, 350, 760), (350, 760, 450, 220), (450, 220, 550, 760)]},
    "Taw": {"s": [(170, 155, 530, 815), (530, 155, 170, 815), (165, 485, 535, 485)]},
}


ALIASES = {"Cinput": "Heth", "Einput": "Ayin", "Finput": "Pe", "Iinput": "Yodh", "Jinput": "Yodh", "Oinput": "Ayin", "Uinput": "Waw", "Vinput": "Waw", "Xinput": "Sade"}
DIGITS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"]
PUNCT = ["period", "comma", "colon", "semicolon", "exclam", "question", "hyphen", "apostrophe", "parenleft", "parenright"]
GLYPH_ORDER = [".notdef", ".null", "CR", "space"] + [x[0] for x in SIGNS] + list(ALIASES) + DIGITS + PUNCT


DIGIT_LINES = {
    "zero": [(220, 190, 480, 190), (480, 190, 480, 760), (480, 760, 220, 760), (220, 760, 220, 190), (220, 190, 480, 760)],
    "one": [(350, 170, 350, 790), (270, 690, 350, 790)],
    "two": [(205, 700, 350, 800), (350, 800, 505, 685), (505, 685, 205, 180), (205, 180, 510, 180)],
    "three": [(205, 780, 505, 780), (505, 780, 340, 485), (340, 485, 505, 185), (505, 185, 205, 185)],
    "four": [(490, 150, 490, 805), (490, 500, 190, 500), (190, 500, 390, 805)],
    "five": [(505, 780, 205, 780), (205, 780, 205, 500), (205, 500, 490, 500), (490, 500, 505, 185), (505, 185, 205, 185)],
    "six": [(495, 765, 265, 525), (265, 525, 225, 205), (225, 205, 495, 205), (495, 205, 495, 500), (495, 500, 265, 525)],
    "seven": [(190, 780, 520, 780), (520, 780, 280, 155)],
    "eight": [(235, 185, 470, 185), (470, 185, 470, 760), (470, 760, 235, 760), (235, 760, 235, 185), (235, 475, 470, 475)],
    "nine": [(495, 430, 450, 760), (450, 760, 210, 760), (210, 760, 210, 450), (210, 450, 495, 430), (495, 430, 245, 170)],
}


def draw_named(pen, name):
    if name == ".notdef":
        contour(pen, [(90, 70), (90, 870), (610, 870), (610, 70)])
        contour(pen, [(165, 155), (535, 155), (535, 785), (165, 785)], hole=True)
        chisel(pen, 180, 180, 520, 760, 40, 9)
        chisel(pen, 520, 180, 180, 760, 40, 9)
        return
    if name in (".null", "CR", "space"):
        return
    source = ALIASES.get(name, name)
    if source in DESIGNS:
        design = DESIGNS[source]
        for idx, (x1, y1, x2, y2) in enumerate(design.get("s", [])):
            chisel(pen, x1, y1, x2, y2, 60 if idx == 0 else 52, 13)
        for x, y, w, h, thickness in design.get("r", []):
            diamond_ring(pen, x, y, w, h, thickness)
        return
    if name in DIGITS:
        for line in DIGIT_LINES[name]:
            chisel(pen, *line, 52, 11)
        return
    if name == "period": diamond(pen, 350, 125, 62, 70)
    elif name == "comma": diamond(pen, 370, 145, 58, 66); chisel(pen, 370, 130, 315, 55, 32, 7)
    elif name == "colon": diamond(pen, 350, 330, 54, 62); diamond(pen, 350, 125, 54, 62)
    elif name == "semicolon": diamond(pen, 350, 330, 54, 62); diamond(pen, 370, 145, 54, 62); chisel(pen, 370, 130, 315, 55, 30, 7)
    elif name == "exclam": chisel(pen, 350, 300, 350, 800, 55, 12); diamond(pen, 350, 125, 62, 70)
    elif name == "question":
        chisel(pen, 210, 690, 350, 800, 50, 11); chisel(pen, 350, 800, 500, 670, 50, 11); chisel(pen, 500, 670, 350, 500, 50, 11); chisel(pen, 350, 500, 350, 350, 50, 11); diamond(pen, 350, 125, 62, 70)
    elif name == "hyphen": chisel(pen, 220, 430, 480, 430, 48, 10)
    elif name == "apostrophe": chisel(pen, 380, 800, 335, 665, 38, 8)
    elif name == "parenleft": chisel(pen, 430, 800, 280, 650, 44, 10); chisel(pen, 280, 650, 280, 300, 44, 10); chisel(pen, 280, 300, 430, 150, 44, 10)
    elif name == "parenright": chisel(pen, 270, 800, 420, 650, 44, 10); chisel(pen, 420, 650, 420, 300, 44, 10); chisel(pen, 420, 300, 270, 150, 44, 10)


def cmap_data():
    cmap = {0x0000: ".null", 0x000D: "CR", 0x0020: "space", 0x00A0: "space"}
    latin = {
        "A": "Aleph", "B": "Beth", "C": "Cinput", "D": "Daleth", "E": "Einput", "F": "Finput",
        "G": "Gimel", "H": "He", "I": "Iinput", "J": "Jinput", "K": "Kaph", "L": "Lamedh",
        "M": "Mem", "N": "Nun", "O": "Oinput", "P": "Pe", "Q": "Qoph", "R": "Resh",
        "S": "Samekh", "T": "Taw", "U": "Uinput", "V": "Vinput", "W": "Waw", "X": "Xinput",
        "Y": "Yodh", "Z": "Zayin",
    }
    for char, glyph in latin.items():
        cmap[ord(char)] = glyph
        cmap[ord(char.lower())] = glyph
    for index, (name, char, _, _) in enumerate(SIGNS):
        cmap[0x10900 + index] = name
        cmap[0xE400 + index] = name
    cmap.update({
        0x02BE: "Aleph", 0x02BF: "Ayin",
        ord("Ḥ"): "Heth", ord("ḥ"): "Heth", ord("Ṭ"): "Teth", ord("ṭ"): "Teth",
        ord("Ṣ"): "Sade", ord("ṣ"): "Sade", ord("Š"): "Shin", ord("š"): "Shin",
    })
    for cp, name in zip(range(ord("0"), ord("9") + 1), DIGITS): cmap[cp] = name
    for char, name in {".":"period", ",":"comma", ":":"colon", ";":"semicolon", "!":"exclam", "?":"question", "-":"hyphen", "'":"apostrophe", "(":"parenleft", ")":"parenright"}.items():
        cmap[ord(char)] = name
    cmap.update({0x2018:"apostrophe", 0x2019:"apostrophe"})
    return cmap


FEATURES = """
languagesystem DFLT dflt;
languagesystem latn dflt;
feature liga {
    sub He He by Heth;
    sub Taw Taw by Teth;
    sub Samekh Samekh by Sade;
    sub Samekh He by Shin;
} liga;
"""


NAME_DATA = {
    "copyright": "Copyright 2026 Erdi Kök. Created for the Aleria project.",
    "familyName": "Kana'anith Monumental",
    "styleName": "Regular",
    "uniqueFontIdentifier": "Kanaanith Monumental Regular 1.000",
    "fullName": "Kana'anith Monumental Regular",
    "psName": "KanaanithMonumental-Regular",
    "version": "Version 1.000",
    "designer": "Erdi Kök",
    "description": "Monumental right-to-left abjad font for Kana'anith with twenty-two semantic signs.",
}


def metrics():
    data = {name: (ADVANCE, 0) for name in GLYPH_ORDER}
    data["space"] = (340, 0); data[".null"] = (0, 0); data["CR"] = (0, 0)
    for name in PUNCT: data[name] = (520, 0)
    return data


def common_start(fb, cmap):
    fb.setupGlyphOrder(GLYPH_ORDER)
    fb.setupCharacterMap(cmap)


def common_finish(fb):
    fb.setupHorizontalHeader(ascent=ASCENT, descent=DESCENT, lineGap=70)
    fb.setupOS2(sTypoAscender=ASCENT, sTypoDescender=DESCENT, sTypoLineGap=70, usWinAscent=ASCENT, usWinDescent=-DESCENT, usWeightClass=500, usWidthClass=5, fsSelection=0x40, ulUnicodeRange1=1, ulCodePageRange1=1)
    fb.setupNameTable(NAME_DATA)
    fb.setupPost()


def build_ttf(cmap):
    glyphs = {}
    for name in GLYPH_ORDER:
        pen = TTGlyphPen(None); draw_named(pen, name); glyphs[name] = pen.glyph()
    fb = FontBuilder(UPM, isTTF=True)
    common_start(fb, cmap); fb.setupGlyf(glyphs); fb.setupHorizontalMetrics(metrics()); common_finish(fb); fb.setupMaxp(); fb.save(TTF_OUT)
    font = TTFont(TTF_OUT); font["head"].fontRevision = 1.0; addOpenTypeFeaturesFromString(font, FEATURES); font.save(TTF_OUT)


def build_otf(cmap):
    charstrings = {}
    for name in GLYPH_ORDER:
        pen = T2CharStringPen(metrics()[name][0], None); draw_named(pen, name); charstrings[name] = pen.getCharString()
    fb = FontBuilder(UPM, isTTF=False)
    common_start(fb, cmap)
    fb.setupCFF(NAME_DATA["psName"], {"FullName": NAME_DATA["fullName"], "FamilyName": NAME_DATA["familyName"], "Weight": "Regular"}, charstrings, {})
    hm = {}
    for name, cs in charstrings.items():
        bounds = cs.calcBounds(None); hm[name] = (metrics()[name][0], 0 if bounds is None else bounds[0])
    fb.setupHorizontalMetrics(hm); common_finish(fb); fb.save(OTF_OUT)
    font = TTFont(OTF_OUT); font["head"].fontRevision = 1.0; addOpenTypeFeaturesFromString(font, FEATURES); font.save(OTF_OUT)


def build_webfonts():
    font = TTFont(TTF_OUT); font.flavor = "woff"; font.save(WOFF_OUT)
    compressor = ROOT / "node_modules" / ".bin" / "ttf2woff2"
    if not compressor.exists(): raise RuntimeError("Lokal `npm install` ausführen.")
    with TTF_OUT.open("rb") as source, WOFF2_OUT.open("wb") as target:
        subprocess.run([str(compressor)], stdin=source, stdout=target, check=True)


def collect_ligatures(font):
    out = []
    for lookup in font["GSUB"].table.LookupList.Lookup:
        for sub in lookup.SubTable:
            if hasattr(sub, "ligatures"):
                for first, ligs in sub.ligatures.items():
                    for lig in ligs: out.append(((first, *lig.Component), lig.LigGlyph))
    return dict(out)


def validate_font(path):
    font = TTFont(path); cmap = font.getBestCmap()
    assert font["name"].getDebugName(1) == "Kana'anith Monumental"
    assert all(0x10900 + i in cmap for i in range(22))
    assert all(ord(c) in cmap for c in "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789")
    assert collect_ligatures(font) == {("He", "He"): "Heth", ("Taw", "Taw"): "Teth", ("Samekh", "Samekh"): "Sade", ("Samekh", "He"): "Shin"}
    if "glyf" in font:
        fps = []
        for name, *_ in SIGNS:
            c, e, f = font["glyf"][name].getCoordinates(font["glyf"]); fps.append((tuple(c), tuple(e), bytes(f)))
        assert len(set(fps)) == 22
    return len(font.getGlyphOrder()), len(cmap)


def build():
    DIST.mkdir(parents=True, exist_ok=True)
    cmap = cmap_data(); build_ttf(cmap); build_otf(cmap); build_webfonts()
    for path in (TTF_OUT, OTF_OUT, WOFF_OUT):
        glyphs, cps = validate_font(path); print(f"validated {path.name}: {glyphs} glyphs, {cps} codepoints")
    assert WOFF2_OUT.read_bytes()[:4] == b"wOF2" and WOFF2_OUT.stat().st_size > 1000
    print(f"validated {WOFF2_OUT.name}: WOFF2 signature, {WOFF2_OUT.stat().st_size} bytes")


if __name__ == "__main__":
    build()
