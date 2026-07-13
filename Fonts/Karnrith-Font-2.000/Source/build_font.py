from __future__ import annotations

from copy import deepcopy
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
TTF_OUT = DIST / "KarnrithHochschnitt-Regular.ttf"
OTF_OUT = DIST / "KarnrithHochschnitt-Regular.otf"
WOFF_OUT = DIST / "KarnrithHochschnitt-Regular.woff"
WOFF2_OUT = DIST / "KarnrithHochschnitt-Regular.woff2"

UPM = 1000
ADVANCE = 720
ASCENT = 920
DESCENT = -180


# code, key/typing value, name, meaning, family index, notch stage
SIGNS = [
    ("F1", "A", "Ard", "Erde · Stoff · Grund", 0, 1),
    ("F2", "K", "Karn", "Stein · Form · Dauer", 0, 2),
    ("F3", "G", "Gor", "Erz · Metall · Wert", 0, 3),
    ("F4", "F", "Faurn", "Feuer · Hitze · Schmiede", 0, 4),
    ("F5", "U", "Urd", "Wasser · Masse · Fülle", 0, 5),
    ("F6", "V", "Veth", "Luft · Wetter · Bewegung", 0, 6),
    ("R1", "O", "Orn", "Ganzes · Amt · Träger", 1, 1),
    ("R2", "D", "Dorn", "Grenze · Mauer · Trennung", 1, 2),
    ("R3", "H", "Hald", "Haus · Halt · Obhut", 1, 3),
    ("R4", "L", "Lann", "Land · Feld · Gebiet", 1, 4),
    ("R5", "T", "Targ", "Weg · Richtung · Reise", 1, 5),
    ("R6", "W", "Warg", "Tier · Wildnis · Herde", 1, 6),
    ("B1", "B", "Bram", "Leib · Fleisch · Gewicht", 2, 1),
    ("B2", "M", "Morn", "Mensch · Volk · Arbeit", 2, 2),
    ("B3", "N", "Nair", "Atem · Leben · Stimme", 2, 3),
    ("B4", "R", "Rann", "Sippe · Bund · Versammlung", 2, 4),
    ("B5", "Y", "Yrn", "Ahne · Saat · Fortgang", 2, 5),
    ("B6", "NG", "Ngrum", "Tod · Schweigen · Ruhe", 2, 6),
    ("H1", "E", "Erd", "Tat · Vorgang · Tausch", 3, 1),
    ("H2", "P", "Parg", "Hand · Werk · Machen", 3, 2),
    ("H3", "S", "Skar", "Schnitt · Waffe · Streit", 3, 3),
    ("H4", "TH", "Tharn", "Eid · Recht · Bindung", 3, 4),
    ("H5", "KH", "Khorr", "Bruch · Wandel · Prüfung", 3, 5),
    ("H6", "Z", "Zarn", "Schirm · Wacht · Erhalt", 3, 6),
    ("G1", "I", "Irin", "Werkzeug · Teil · Genauigkeit", 4, 1),
    ("G2", "GH", "Ghair", "Wort · Name · Wahrheit", 4, 2),
    ("G3", "SH", "Shenn", "Gedächtnis · Wissen · Erzählung", 4, 3),
    ("G4", "CH", "Chor", "Wille · Ehre · Absicht", 4, 4),
    ("G5", "DH", "Dhair", "Gott · Schicksal · Jenseits", 4, 5),
    ("G6", "Q", "Qarn", "Magie · Verborgenes · Geist", 4, 6),
]

SIGN_BY_KEY = {key: name for _, key, name, _, _, _ in SIGNS}
SIGN_BY_NAME = {name: (code, key, meaning, family, stage) for code, key, name, meaning, family, stage in SIGNS}


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


def chisel_segment(pen, x1, y1, x2, y2, width=66, cap=17):
    dx, dy = x2 - x1, y2 - y1
    length = hypot(dx, dy)
    ux, uy = dx / length, dy / length
    nx, ny = -uy * width / 2, ux * width / 2
    contour(
        pen,
        [
            (x1 - ux * cap, y1 - uy * cap),
            (x1 + nx, y1 + ny),
            (x2 + nx, y2 + ny),
            (x2 + ux * cap, y2 + uy * cap),
            (x2 - nx, y2 - ny),
            (x1 - nx, y1 - ny),
        ],
    )


def diamond(pen, x, y, w=76, h=88, hole=False):
    contour(pen, [(x, y + h / 2), (x + w / 2, y), (x, y - h / 2), (x - w / 2, y)], hole=hole)


def diamond_ring(pen, x, y, w=150, h=170, thickness=40):
    diamond(pen, x, y, w, h)
    diamond(pen, x, y, w - thickness * 2, h - thickness * 2, hole=True)


# The new monumental design uses thirty individual silhouettes. Repeating motifs
# still identify the five semantic clefts, but no cleft is merely one ridge with
# six different tally marks. Coordinates are original and intentionally avoid a
# one-to-one reproduction of historical or fictional rune charts.
RUNE_DESIGNS = {
    # Felskluft: buttresses, ground feet and load-bearing diamonds.
    (0, 1): {"l": [(245, 140, 245, 820, 76), (245, 735, 500, 610, 62), (245, 455, 430, 335, 58), (245, 140, 400, 245, 58)], "d": [(245, 140, 70, 78)]},
    (0, 2): {"l": [(220, 135, 220, 825, 78), (220, 760, 490, 650, 60), (220, 555, 445, 455, 60), (220, 350, 405, 245, 60), (405, 245, 535, 330, 54)], "d": [(220, 555, 66, 74)]},
    (0, 3): {"l": [(360, 145, 360, 815, 76), (360, 705, 185, 610, 58), (360, 705, 535, 610, 58), (360, 335, 210, 235, 56), (360, 335, 510, 235, 56)], "r": [(360, 520, 145, 165, 38)]},
    (0, 4): {"l": [(190, 145, 505, 820, 78), (505, 820, 300, 705, 58), (390, 575, 545, 475, 58), (305, 395, 470, 285, 58), (190, 145, 355, 220, 54)], "d": [(390, 575, 64, 72)]},
    (0, 5): {"l": [(175, 790, 360, 545, 70), (545, 790, 360, 545, 70), (360, 545, 360, 145, 70), (235, 300, 485, 300, 58)], "r": [(360, 300, 130, 145, 36)]},
    (0, 6): {"l": [(360, 135, 360, 610, 72), (360, 610, 175, 820, 64), (360, 610, 545, 820, 64), (360, 420, 535, 500, 56), (360, 260, 205, 345, 56)], "d": [(360, 610, 66, 74)]},

    # Raumkluft: gates, roofs, boundaries and directed paths.
    (1, 1): {"l": [(210, 145, 210, 650, 70), (510, 145, 510, 650, 70), (210, 650, 360, 825, 64), (510, 650, 360, 825, 64), (210, 420, 510, 420, 58)], "d": [(360, 420, 64, 72)]},
    (1, 2): {"l": [(185, 140, 185, 820, 74), (535, 140, 535, 820, 74), (185, 760, 535, 620, 60), (185, 500, 535, 360, 60), (185, 240, 535, 140, 60)], "d": [(185, 500, 64, 72)]},
    (1, 3): {"l": [(170, 155, 170, 620, 70), (550, 155, 550, 620, 70), (170, 620, 360, 825, 66), (550, 620, 360, 825, 66), (170, 155, 360, 335, 60), (550, 155, 360, 335, 60)], "r": [(360, 335, 120, 135, 34)]},
    (1, 4): {"l": [(155, 265, 565, 265, 66), (225, 145, 225, 810, 68), (495, 145, 495, 810, 68), (225, 650, 495, 505, 58)], "d": [(225, 265, 62, 70), (495, 265, 62, 70)]},
    (1, 5): {"l": [(175, 150, 500, 150, 64), (500, 150, 295, 415, 68), (295, 415, 520, 610, 68), (520, 610, 360, 820, 68), (250, 650, 520, 610, 54)], "d": [(295, 415, 64, 72)]},
    (1, 6): {"l": [(360, 135, 360, 520, 70), (360, 520, 175, 760, 64), (360, 520, 545, 760, 64), (175, 760, 110, 650, 52), (545, 760, 610, 650, 52), (360, 305, 490, 225, 54)], "r": [(360, 520, 118, 132, 32)]},

    # Blutkluft: bodies, paired lines, branching breath and seed motifs.
    (2, 1): {"l": [(360, 150, 360, 800, 74), (360, 650, 165, 780, 62), (360, 650, 555, 780, 62), (360, 370, 195, 240, 60), (360, 370, 525, 240, 60)], "r": [(360, 515, 125, 145, 34)]},
    (2, 2): {"l": [(205, 145, 205, 805, 68), (515, 145, 515, 805, 68), (205, 805, 360, 610, 62), (515, 805, 360, 610, 62), (205, 330, 360, 475, 58), (515, 330, 360, 475, 58)], "d": [(360, 475, 66, 74)]},
    (2, 3): {"l": [(250, 140, 250, 760, 70), (250, 760, 390, 825, 54), (250, 610, 505, 720, 58), (250, 420, 465, 520, 58), (250, 235, 405, 320, 54)], "d": [(250, 610, 64, 72)]},
    (2, 4): {"l": [(180, 145, 180, 780, 70), (540, 145, 540, 780, 70), (180, 610, 540, 610, 60), (180, 315, 540, 315, 60), (180, 780, 360, 680, 58), (540, 780, 360, 680, 58)], "r": [(360, 465, 125, 145, 34)]},
    (2, 5): {"l": [(360, 145, 360, 550, 70), (360, 550, 205, 750, 60), (360, 550, 515, 750, 60), (360, 300, 220, 215, 54), (360, 300, 500, 215, 54)], "r": [(360, 145, 145, 165, 38)]},
    (2, 6): {"l": [(175, 760, 545, 760, 66), (220, 760, 220, 350, 68), (500, 760, 500, 350, 68), (220, 350, 360, 150, 62), (500, 350, 360, 150, 62), (220, 545, 500, 430, 56)], "d": [(360, 150, 68, 76)]},

    # Handkluft: cuts, bindings, tools and deliberately broken axes.
    (3, 1): {"l": [(160, 150, 520, 815, 78), (245, 305, 475, 235, 58), (330, 465, 560, 390, 58), (420, 630, 245, 730, 56)], "d": [(330, 465, 64, 72)]},
    (3, 2): {"l": [(220, 145, 220, 810, 70), (220, 690, 455, 805, 58), (220, 560, 520, 620, 56), (220, 430, 500, 410, 56), (220, 300, 455, 220, 56)], "d": [(220, 430, 62, 70)]},
    (3, 3): {"l": [(155, 145, 545, 815, 76), (545, 145, 155, 815, 76), (175, 480, 545, 480, 58)], "r": [(360, 480, 130, 145, 36)]},
    (3, 4): {"l": [(360, 135, 360, 815, 72), (155, 620, 565, 385, 62), (155, 385, 565, 620, 62)], "r": [(360, 505, 145, 165, 40)]},
    (3, 5): {"l": [(215, 140, 215, 430, 72), (215, 430, 470, 555, 66), (470, 555, 470, 815, 72), (155, 705, 470, 555, 58), (215, 430, 535, 280, 58)], "d": [(215, 430, 64, 72), (470, 555, 64, 72)]},
    (3, 6): {"l": [(360, 140, 360, 815, 72), (360, 815, 175, 665, 60), (360, 815, 545, 665, 60), (180, 365, 540, 365, 60), (180, 365, 360, 175, 58), (540, 365, 360, 175, 58)], "r": [(360, 365, 135, 150, 36)]},

    # Geistkluft: enclosed truths, lattices, crowns and axial diamonds.
    (4, 1): {"l": [(180, 150, 360, 815, 66), (540, 150, 360, 815, 66), (180, 150, 540, 150, 58), (260, 445, 460, 445, 54)], "r": [(360, 445, 115, 130, 32)]},
    (4, 2): {"l": [(205, 145, 205, 810, 68), (205, 810, 500, 650, 60), (205, 540, 485, 405, 58), (205, 275, 455, 145, 58)], "r": [(500, 650, 120, 135, 34)]},
    (4, 3): {"l": [(170, 150, 550, 810, 64), (550, 150, 170, 810, 64), (170, 480, 550, 480, 56)], "r": [(360, 700, 120, 135, 34), (360, 260, 120, 135, 34)]},
    (4, 4): {"l": [(360, 140, 360, 620, 70), (360, 620, 180, 810, 62), (360, 620, 540, 810, 62), (180, 280, 360, 140, 58), (540, 280, 360, 140, 58)], "r": [(360, 440, 135, 150, 36)]},
    (4, 5): {"l": [(360, 130, 360, 810, 70), (170, 615, 550, 615, 60), (210, 275, 510, 275, 58), (210, 275, 360, 130, 56), (510, 275, 360, 130, 56)], "r": [(360, 810, 150, 170, 40), (360, 445, 120, 135, 34)]},
    (4, 6): {"l": [(185, 170, 185, 660, 68), (535, 170, 535, 660, 68), (185, 170, 360, 330, 60), (535, 170, 360, 330, 60), (185, 660, 360, 825, 60), (535, 660, 360, 825, 60)], "r": [(360, 500, 185, 210, 46)]},
}


def family_ridge(pen, family):
    """Draw one of the five canonical ridge structures."""
    if family == 0:  # Felskluft: vertical ridge
        chisel_segment(pen, 360, 125, 360, 825, 78, 18)
        diamond(pen, 360, 125, 74, 82)
        return (360, 825), [(360, 610), (360, 430)]
    if family == 1:  # Raumkluft: upper fork
        chisel_segment(pen, 360, 125, 360, 585, 74, 16)
        chisel_segment(pen, 360, 585, 205, 810, 68, 16)
        chisel_segment(pen, 360, 585, 515, 810, 68, 16)
        diamond(pen, 360, 585, 76, 86)
        return (360, 585), [(360, 520), (360, 355)]
    if family == 2:  # Blutkluft: lower fork
        chisel_segment(pen, 360, 350, 360, 825, 74, 16)
        chisel_segment(pen, 360, 350, 205, 125, 68, 16)
        chisel_segment(pen, 360, 350, 515, 125, 68, 16)
        diamond(pen, 360, 350, 76, 86)
        return (360, 825), [(360, 605), (360, 455)]
    if family == 3:  # Handkluft: descending diagonal ridge
        chisel_segment(pen, 165, 135, 555, 825, 80, 18)
        diamond(pen, 165, 135, 72, 82)
        return (555, 825), [(445, 630), (345, 455)]
    if family == 4:  # Geistkluft: double ridge joined at the root
        chisel_segment(pen, 265, 155, 265, 805, 66, 15)
        chisel_segment(pen, 455, 155, 455, 805, 66, 15)
        chisel_segment(pen, 265, 155, 455, 155, 62, 14)
        diamond(pen, 360, 155, 68, 76)
        return (360, 805), [(360, 610), (360, 430)]
    raise ValueError(family)


def notch(pen, family, side, level):
    y = 610 if level == 0 else 430
    if family == 1:
        y = 505 if level == 0 else 340
    if family == 2:
        y = 605 if level == 0 else 455
    if family == 3:
        # Notches sit perpendicular to the diagonal hand-ridge.
        anchors = [(445, 630), (345, 455)]
        ax, ay = anchors[level]
        if side == "left":
            chisel_segment(pen, ax, ay, ax - 175, ay + 92, 54, 13)
        else:
            chisel_segment(pen, ax, ay, ax + 175, ay - 92, 54, 13)
        diamond(pen, ax, ay, 58, 66)
        return
    if family == 4:
        if side == "left":
            chisel_segment(pen, 265, y, 120, y + 82, 52, 12)
            diamond(pen, 265, y, 56, 64)
        else:
            chisel_segment(pen, 455, y, 600, y + 82, 52, 12)
            diamond(pen, 455, y, 56, 64)
        return

    x = 360
    if side == "left":
        chisel_segment(pen, x, y, 175, y + 92, 54, 13)
    else:
        chisel_segment(pen, x, y, 545, y + 92, 54, 13)
    diamond(pen, x, y, 58, 66)


def crossed_notch(pen, family):
    if family == 3:
        chisel_segment(pen, 210, 650, 545, 365, 58, 15)
        diamond(pen, 380, 505, 66, 74)
    elif family == 4:
        chisel_segment(pen, 135, 485, 585, 565, 58, 15)
        diamond(pen, 360, 525, 66, 74)
    else:
        y = 505 if family != 1 else 455
        chisel_segment(pen, 150, y - 65, 570, y + 65, 58, 15)
        diamond(pen, 360, y, 66, 74)


def crown(pen, family):
    if family == 0:
        chisel_segment(pen, 360, 825, 220, 705, 58, 14)
        chisel_segment(pen, 360, 825, 500, 705, 58, 14)
    elif family == 1:
        chisel_segment(pen, 205, 810, 115, 700, 54, 12)
        chisel_segment(pen, 515, 810, 605, 700, 54, 12)
    elif family == 2:
        chisel_segment(pen, 360, 825, 220, 705, 58, 14)
        chisel_segment(pen, 360, 825, 500, 705, 58, 14)
    elif family == 3:
        chisel_segment(pen, 555, 825, 405, 780, 54, 12)
        chisel_segment(pen, 555, 825, 560, 665, 54, 12)
    elif family == 4:
        chisel_segment(pen, 265, 805, 170, 700, 52, 12)
        chisel_segment(pen, 455, 805, 550, 700, 52, 12)
    diamond(pen, 360 if family != 3 else 555, 825 if family != 1 else 780, 58, 66)


HOCHSCHNITT_DESIGNS = {
    # Felskluft: schmale Laststäbe und schräg eingetriebene Keile.
    (0, 1): {"s": [(245, 135, 245, 825), (245, 735, 505, 565), (245, 445, 445, 300), (245, 135, 390, 245)]},
    (0, 2): {"s": [(190, 135, 500, 825), (405, 610, 545, 530), (330, 455, 485, 365), (255, 295, 395, 205)]},
    (0, 3): {"s": [(360, 135, 360, 825), (360, 705, 180, 605), (360, 560, 530, 655), (360, 290, 205, 205)], "d": [(360, 455)]},
    (0, 4): {"s": [(175, 150, 470, 815), (470, 815, 285, 690), (355, 555, 530, 445), (275, 385, 435, 280)]},
    (0, 5): {"s": [(170, 790, 360, 560), (550, 790, 360, 560), (360, 560, 360, 135), (360, 350, 515, 260)]},
    (0, 6): {"s": [(320, 135, 320, 645), (320, 645, 165, 820), (320, 645, 475, 820), (320, 430, 520, 535), (320, 245, 470, 170)]},

    # Raumkluft: Torwinkel, Grenzen und gerichtete Öffnungen.
    (1, 1): {"s": [(205, 150, 510, 500), (510, 500, 205, 815), (205, 150, 205, 815)]},
    (1, 2): {"s": [(225, 135, 225, 825), (225, 745, 505, 620), (225, 520, 470, 405), (225, 295, 430, 190)]},
    (1, 3): {"s": [(225, 135, 225, 825), (225, 825, 505, 660), (505, 660, 225, 480), (225, 480, 455, 325)]},
    (1, 4): {"s": [(205, 135, 205, 825), (515, 135, 515, 825), (205, 690, 515, 505), (205, 285, 515, 470)]},
    (1, 5): {"s": [(175, 735, 475, 735), (475, 735, 300, 555), (300, 555, 500, 360), (500, 360, 200, 360), (300, 555, 300, 135)]},
    (1, 6): {"s": [(360, 135, 360, 555), (360, 555, 170, 805), (360, 555, 550, 805), (170, 805, 105, 690), (550, 805, 615, 690)]},

    # Blutkluft: Verzweigung, Paarung, Atem und ruhende Linien.
    (2, 1): {"s": [(360, 135, 360, 825), (360, 685, 160, 810), (360, 685, 560, 810), (360, 305, 195, 180), (360, 305, 525, 180)]},
    (2, 2): {"s": [(185, 135, 185, 825), (185, 825, 520, 470), (520, 470, 185, 135), (520, 135, 520, 825)]},
    (2, 3): {"s": [(205, 135, 490, 825), (315, 390, 510, 500), (375, 535, 560, 635), (435, 675, 600, 770)]},
    (2, 4): {"s": [(175, 145, 545, 815), (545, 145, 175, 815), (360, 300, 360, 665), (205, 480, 515, 480)]},
    (2, 5): {"s": [(360, 175, 360, 675), (360, 675, 205, 820), (360, 675, 515, 820), (360, 175, 215, 280), (360, 175, 505, 280)], "r": [(360, 120)]},
    (2, 6): {"s": [(155, 790, 565, 790), (230, 790, 230, 430), (490, 790, 490, 430), (230, 430, 360, 145), (490, 430, 360, 145)]},

    # Handkluft: Werkzeuge, Schnitte, Schwüre und bewusst gebrochene Stäbe.
    (3, 1): {"s": [(175, 145, 520, 815), (280, 350, 520, 260), (355, 500, 585, 415)]},
    (3, 2): {"s": [(230, 135, 230, 825), (230, 730, 485, 815), (230, 590, 520, 650), (230, 445, 500, 430), (230, 300, 455, 215)]},
    (3, 3): {"s": [(175, 145, 545, 815), (545, 145, 175, 815), (190, 515, 530, 515)]},
    (3, 4): {"s": [(360, 135, 360, 825), (165, 680, 360, 515), (555, 680, 360, 515), (165, 350, 360, 515), (555, 350, 360, 515)]},
    (3, 5): {"s": [(205, 135, 205, 390), (205, 390, 500, 520), (500, 520, 500, 825), (150, 710, 500, 520), (205, 390, 555, 215)]},
    (3, 6): {"s": [(360, 135, 360, 825), (360, 825, 205, 690), (360, 825, 515, 690), (205, 330, 515, 330)], "r": [(360, 330)]},

    # Geistkluft: Rauten, Doppelbindungen und erhöhte Achsen.
    (4, 1): {"s": [(180, 150, 360, 810), (540, 150, 360, 810), (180, 150, 540, 150), (255, 410, 465, 410)]},
    (4, 2): {"s": [(220, 135, 220, 825), (220, 730, 500, 595), (220, 455, 455, 345), (220, 240, 410, 155)], "r": [(500, 595)]},
    (4, 3): {"s": [(180, 145, 540, 815), (540, 145, 180, 815), (170, 480, 550, 480)], "r": [(360, 680), (360, 280)]},
    (4, 4): {"s": [(360, 135, 360, 580), (360, 580, 185, 810), (360, 580, 535, 810), (360, 300, 210, 195), (360, 135, 510, 240)]},
    (4, 5): {"s": [(360, 135, 360, 825), (175, 565, 545, 565), (220, 265, 500, 265), (220, 265, 360, 135), (500, 265, 360, 135)], "r": [(360, 825)]},
    (4, 6): {"s": [(180, 500, 360, 815), (360, 815, 540, 500), (540, 500, 360, 165), (360, 165, 180, 500), (180, 500, 110, 350), (540, 500, 610, 350)], "r": [(360, 500)]},
}


def draw_sign(pen, family, stage):
    design = HOCHSCHNITT_DESIGNS[(family, stage)]
    for index, (x1, y1, x2, y2) in enumerate(design.get("s", [])):
        width = 55 if index == 0 else 46
        chisel_segment(pen, x1, y1, x2, y2, width, 12)
    for x, y in design.get("d", []):
        diamond(pen, x, y, 48, 56)
    for x, y in design.get("r", []):
        diamond_ring(pen, x, y, 96, 110, 26)


def draw_alias(pen, source_name):
    _, _, _, family, stage = SIGN_BY_NAME[source_name]
    draw_sign(pen, family, stage)


DIGIT_LINES = {
    "zero": [(220, 180, 500, 180), (500, 180, 500, 760), (500, 760, 220, 760), (220, 760, 220, 180), (220, 180, 500, 760)],
    "one": [(360, 160, 360, 790), (275, 690, 360, 790)],
    "two": [(210, 700, 360, 800), (360, 800, 520, 690), (520, 690, 210, 170), (210, 170, 525, 170)],
    "three": [(210, 780, 520, 780), (520, 780, 345, 485), (345, 485, 520, 180), (520, 180, 210, 180)],
    "four": [(490, 145, 490, 805), (490, 510, 190, 510), (190, 510, 390, 805)],
    "five": [(520, 780, 215, 780), (215, 780, 215, 500), (215, 500, 490, 500), (490, 500, 520, 190), (520, 190, 210, 190)],
    "six": [(500, 770, 270, 520), (270, 520, 225, 205), (225, 205, 500, 205), (500, 205, 500, 500), (500, 500, 270, 520)],
    "seven": [(190, 780, 530, 780), (530, 780, 285, 150)],
    "eight": [(240, 180, 480, 180), (480, 180, 480, 760), (480, 760, 240, 760), (240, 760, 240, 180), (240, 470, 480, 470)],
    "nine": [(500, 430, 455, 760), (455, 760, 210, 760), (210, 760, 210, 450), (210, 450, 500, 430), (500, 430, 250, 170)],
}


def draw_digit(pen, name):
    for line in DIGIT_LINES[name]:
        chisel_segment(pen, *line, 58, 13)


def draw_punctuation(pen, name):
    if name == "period":
        diamond(pen, 360, 130, 66, 76)
    elif name == "comma":
        diamond(pen, 385, 150, 62, 72); chisel_segment(pen, 385, 135, 325, 55, 36, 9)
    elif name == "colon":
        diamond(pen, 360, 340, 58, 68); diamond(pen, 360, 135, 58, 68)
    elif name == "semicolon":
        diamond(pen, 360, 340, 58, 68); diamond(pen, 385, 150, 58, 68); chisel_segment(pen, 385, 135, 325, 55, 34, 8)
    elif name == "exclam":
        chisel_segment(pen, 360, 320, 360, 800, 62, 15); diamond(pen, 360, 135, 66, 76)
    elif name == "question":
        chisel_segment(pen, 220, 690, 360, 800, 56, 13); chisel_segment(pen, 360, 800, 510, 670, 56, 13)
        chisel_segment(pen, 510, 670, 360, 500, 56, 13); chisel_segment(pen, 360, 500, 360, 350, 56, 13); diamond(pen, 360, 135, 66, 76)
    elif name == "hyphen":
        chisel_segment(pen, 225, 430, 495, 430, 54, 12)
    elif name == "apostrophe":
        chisel_segment(pen, 390, 795, 345, 660, 42, 10)
    elif name == "quoteleft":
        chisel_segment(pen, 285, 785, 245, 655, 40, 9); chisel_segment(pen, 440, 785, 400, 655, 40, 9)
    elif name == "quoteright":
        chisel_segment(pen, 250, 655, 290, 785, 40, 9); chisel_segment(pen, 405, 655, 445, 785, 40, 9)
    elif name == "parenleft":
        chisel_segment(pen, 440, 800, 280, 650, 48, 11); chisel_segment(pen, 280, 650, 280, 300, 48, 11); chisel_segment(pen, 280, 300, 440, 150, 48, 11)
    elif name == "parenright":
        chisel_segment(pen, 280, 800, 440, 650, 48, 11); chisel_segment(pen, 440, 650, 440, 300, 48, 11); chisel_segment(pen, 440, 300, 280, 150, 48, 11)


def draw_notdef(pen):
    contour(pen, [(90, 70), (90, 870), (630, 870), (630, 70)])
    contour(pen, [(165, 155), (555, 155), (555, 785), (165, 785)], hole=True)
    chisel_segment(pen, 180, 180, 540, 760, 42, 9)
    chisel_segment(pen, 540, 180, 180, 760, 42, 9)


def draw_empty(pen):
    return


ALIASES = {"Cinput": "Chor", "Jinput": "Yrn", "Xinput": "Khorr"}
DIGITS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"]
PUNCTUATION = ["period", "comma", "colon", "semicolon", "exclam", "question", "hyphen", "apostrophe", "quoteleft", "quoteright", "parenleft", "parenright"]
BASE_GLYPHS = [".notdef", ".null", "CR", "space"]
GLYPH_ORDER = BASE_GLYPHS + [name for _, _, name, _, _, _ in SIGNS] + list(ALIASES) + DIGITS + PUNCTUATION


def draw_named(pen, name):
    if name == ".notdef":
        draw_notdef(pen)
    elif name in (".null", "CR", "space"):
        draw_empty(pen)
    elif name in SIGN_BY_NAME:
        _, _, _, family, stage = SIGN_BY_NAME[name]
        draw_sign(pen, family, stage)
    elif name in ALIASES:
        draw_alias(pen, ALIASES[name])
    elif name in DIGITS:
        draw_digit(pen, name)
    elif name in PUNCTUATION:
        draw_punctuation(pen, name)
    else:
        raise KeyError(name)


def make_cmap():
    letter_map = {
        "A": "Ard", "B": "Bram", "C": "Cinput", "D": "Dorn", "E": "Erd", "F": "Faurn",
        "G": "Gor", "H": "Hald", "I": "Irin", "J": "Jinput", "K": "Karn", "L": "Lann",
        "M": "Morn", "N": "Nair", "O": "Orn", "P": "Parg", "Q": "Qarn", "R": "Rann",
        "S": "Skar", "T": "Targ", "U": "Urd", "V": "Veth", "W": "Warg", "X": "Xinput",
        "Y": "Yrn", "Z": "Zarn",
    }
    cmap = {0x0000: ".null", 0x000D: "CR", 0x0020: "space", 0x00A0: "space"}
    for char, glyph in letter_map.items():
        cmap[ord(char)] = glyph
        cmap[ord(char.lower())] = glyph
    cmap.update({
        ord("Ä"): "Ard", ord("ä"): "Ard", ord("Ö"): "Orn", ord("ö"): "Orn",
        ord("Ü"): "Urd", ord("ü"): "Urd", ord("ß"): "Skar",
    })
    for cp, glyph in zip(range(ord("0"), ord("9") + 1), DIGITS):
        cmap[cp] = glyph
    punctuation_map = {
        ".": "period", ",": "comma", ":": "colon", ";": "semicolon", "!": "exclam", "?": "question",
        "-": "hyphen", "'": "apostrophe", "(": "parenleft", ")": "parenright",
    }
    for char, glyph in punctuation_map.items():
        cmap[ord(char)] = glyph
    cmap.update({0x2018: "apostrophe", 0x2019: "apostrophe", 0x201C: "quoteleft", 0x201D: "quoteright", 0x201E: "quoteleft"})
    for index, (_, _, name, _, _, _) in enumerate(SIGNS):
        cmap[0xE300 + index] = name
    return cmap


FEATURES = """
languagesystem DFLT dflt;
languagesystem latn dflt;

feature liga {
    sub Nair Gor by Ngrum;
    sub Targ Hald by Tharn;
    sub Karn Hald by Khorr;
    sub Gor Hald by Ghair;
    sub Skar Hald by Shenn;
    sub Cinput Hald by Chor;
    sub Dorn Hald by Dhair;
} liga;
"""


NAME_DATA = {
    "copyright": "Copyright 2026 Erdi Kök. Created for the Aleria project.",
    "familyName": "Karnrith Hochschnitt",
    "styleName": "Regular",
    "uniqueFontIdentifier": "Karnrith Hochschnitt Regular 2.000",
    "fullName": "Karnrith Hochschnitt Regular",
    "psName": "KarnrithHochschnitt-Regular",
    "version": "Version 2.000",
    "designer": "Erdi Kök",
    "description": "Narrow monumental Morgorn chisel-rune font with thirty semantic signs and seven OpenType ligatures.",
}


def metrics():
    data = {name: (ADVANCE, 0) for name in GLYPH_ORDER}
    data["space"] = (340, 0)
    data[".null"] = (0, 0)
    data["CR"] = (0, 0)
    for name in PUNCTUATION:
        data[name] = (520 if name not in ("parenleft", "parenright") else 600, 0)
    return data


def common_start(fb, cmap):
    fb.setupGlyphOrder(GLYPH_ORDER)
    fb.setupCharacterMap(cmap)


def common_finish(fb):
    fb.setupHorizontalHeader(ascent=ASCENT, descent=DESCENT, lineGap=70)
    fb.setupOS2(
        sTypoAscender=ASCENT,
        sTypoDescender=DESCENT,
        sTypoLineGap=70,
        usWinAscent=ASCENT,
        usWinDescent=-DESCENT,
        usWeightClass=500,
        usWidthClass=5,
        fsSelection=0x40,
        ulUnicodeRange1=1,
        ulCodePageRange1=1,
    )
    fb.setupNameTable(NAME_DATA)
    fb.setupPost()


def build_ttf(cmap):
    glyphs = {}
    for name in GLYPH_ORDER:
        pen = TTGlyphPen(None)
        draw_named(pen, name)
        glyphs[name] = pen.glyph()
    fb = FontBuilder(UPM, isTTF=True)
    common_start(fb, cmap)
    fb.setupGlyf(glyphs)
    fb.setupHorizontalMetrics(metrics())
    common_finish(fb)
    fb.setupMaxp()
    fb.save(TTF_OUT)
    font = TTFont(TTF_OUT)
    font["head"].fontRevision = 2.0
    addOpenTypeFeaturesFromString(font, FEATURES)
    font.save(TTF_OUT)


def build_otf(cmap):
    charstrings = {}
    for name in GLYPH_ORDER:
        width = metrics()[name][0]
        pen = T2CharStringPen(width, None)
        draw_named(pen, name)
        charstrings[name] = pen.getCharString()
    fb = FontBuilder(UPM, isTTF=False)
    common_start(fb, cmap)
    fb.setupCFF(NAME_DATA["psName"], {"FullName": NAME_DATA["fullName"], "FamilyName": NAME_DATA["familyName"], "Weight": "Regular"}, charstrings, {})
    otf_metrics = {}
    for name, charstring in charstrings.items():
        bounds = charstring.calcBounds(None)
        lsb = 0 if bounds is None else bounds[0]
        otf_metrics[name] = (metrics()[name][0], lsb)
    fb.setupHorizontalMetrics(otf_metrics)
    common_finish(fb)
    fb.save(OTF_OUT)
    font = TTFont(OTF_OUT)
    font["head"].fontRevision = 2.0
    addOpenTypeFeaturesFromString(font, FEATURES)
    font.save(OTF_OUT)


def build_webfonts():
    font = TTFont(TTF_OUT)
    font.flavor = "woff"
    font.save(WOFF_OUT)

    compressor = ROOT / "node_modules" / ".bin" / "ttf2woff2"
    if not compressor.exists():
        raise RuntimeError("WOFF2-Kompressor fehlt. Lokal `npm install --no-save ttf2woff2` ausführen.")
    with TTF_OUT.open("rb") as source, WOFF2_OUT.open("wb") as target:
        subprocess.run([str(compressor)], stdin=source, stdout=target, check=True)


def collect_ligatures(font):
    found = []
    for lookup in font["GSUB"].table.LookupList.Lookup:
        for subtable in lookup.SubTable:
            if hasattr(subtable, "ligatures"):
                for first, ligatures in subtable.ligatures.items():
                    for ligature in ligatures:
                        found.append(((first, *ligature.Component), ligature.LigGlyph))
    return found


def validate_font(path):
    font = TTFont(path)
    cmap = font.getBestCmap()
    assert font["name"].getDebugName(1) == "Karnrith Hochschnitt"
    assert all(ord(char) in cmap for char in "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÄäÖöÜüß0123456789")
    assert len([cp for cp in cmap if 0xE300 <= cp <= 0xE31D]) == 30
    assert "GSUB" in font
    ligatures = dict(collect_ligatures(font))
    assert ligatures == {
        ("Nair", "Gor"): "Ngrum",
        ("Targ", "Hald"): "Tharn",
        ("Karn", "Hald"): "Khorr",
        ("Gor", "Hald"): "Ghair",
        ("Skar", "Hald"): "Shenn",
        ("Cinput", "Hald"): "Chor",
        ("Dorn", "Hald"): "Dhair",
    }
    assert len(font.getGlyphOrder()) == len(set(font.getGlyphOrder()))
    if "glyf" in font:
        fingerprints = []
        for _, _, name, _, _, _ in SIGNS:
            coords, endpoints, flags = font["glyf"][name].getCoordinates(font["glyf"])
            fingerprints.append((tuple(coords), tuple(endpoints), bytes(flags)))
        assert len(fingerprints) == len(set(fingerprints)) == 30
    return len(font.getGlyphOrder()), len(cmap)


def build():
    DIST.mkdir(parents=True, exist_ok=True)
    cmap = make_cmap()
    build_ttf(cmap)
    build_otf(cmap)
    build_webfonts()
    for path in (TTF_OUT, OTF_OUT, WOFF_OUT):
        glyph_count, cmap_count = validate_font(path)
        print(f"validated {path.name}: {glyph_count} glyphs, {cmap_count} codepoints")
    assert WOFF2_OUT.read_bytes()[:4] == b"wOF2"
    assert WOFF2_OUT.stat().st_size > 1000
    print(f"validated {WOFF2_OUT.name}: WOFF2 signature, {WOFF2_OUT.stat().st_size} bytes")


if __name__ == "__main__":
    build()
