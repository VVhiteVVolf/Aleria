from __future__ import annotations

from pathlib import Path
from xml.sax.saxutils import escape

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFilter, ImageFont

from build_font import SIGNS


ROOT = Path(__file__).resolve().parent
DIST = ROOT / "dist"
FONT_PATH = DIST / "KanaanithMonumental-Regular.ttf"
CHART_SVG = DIST / "Kanaanith_Zeichentafel_1.000.svg"
CHART_PNG = DIST / "Kanaanith_Zeichentafel_1.000.png"
SPECIMEN_PNG = DIST / "Kanaanith_Schriftprobe_1.000.png"

INK = "#30251b"
LAPIS = "#174b63"
GOLD = "#b48a3b"
PAPYRUS = "#eee1be"
PALE = "#f7efd9"
RULE = "#c8ae79"


NAME_TO_CHAR = {name: char for name, char, _, _ in SIGNS}
TRANSLIT = {
    "A":"Aleph", "B":"Beth", "C":"Heth", "D":"Daleth", "E":"Ayin", "F":"Pe", "G":"Gimel",
    "H":"He", "I":"Yodh", "J":"Yodh", "K":"Kaph", "L":"Lamedh", "M":"Mem", "N":"Nun",
    "O":"Ayin", "P":"Pe", "Q":"Qoph", "R":"Resh", "S":"Samekh", "T":"Taw", "U":"Waw",
    "V":"Waw", "W":"Waw", "X":"Sade", "Y":"Yodh", "Z":"Zayin",
}
DIGRAPHS = {"SH":"Shin", "HH":"Heth", "TT":"Teth", "SS":"Sade"}


def to_phoenician(text):
    text = text.upper()
    out = []
    i = 0
    while i < len(text):
        pair = text[i:i+2]
        if pair in DIGRAPHS:
            out.append(NAME_TO_CHAR[DIGRAPHS[pair]])
            i += 2
        elif text[i] in TRANSLIT:
            out.append(NAME_TO_CHAR[TRANSLIT[text[i]]])
            i += 1
        else:
            out.append(text[i])
            i += 1
    return "".join(out)


def path_data(font, glyph_name):
    glyph_set = font.getGlyphSet()
    pen = SVGPathPen(glyph_set); glyph_set[glyph_name].draw(pen)
    bounds = BoundsPen(glyph_set); glyph_set[glyph_name].draw(bounds)
    return pen.getCommands(), bounds.bounds


def build_chart_svg():
    font = TTFont(FONT_PATH)
    cols, cell_w, cell_h = 6, 320, 330
    left, top = 64, 230
    parts = [f'''<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="1600" viewBox="0 0 2048 1600">
  <defs>
    <filter id="shadow" x="-35%" y="-35%" width="180%" height="190%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="b"/><feOffset in="b" dx="3" dy="6" result="o"/>
      <feFlood flood-color="#000" flood-opacity=".22" result="c"/><feComposite in="c" in2="o" operator="in" result="s"/>
      <feMerge><feMergeNode in="s"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <linearGradient id="ink" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#122f3b"/><stop offset=".55" stop-color="#1d6076"/><stop offset="1" stop-color="#0c222b"/></linearGradient>
  </defs>
  <rect width="2048" height="1600" fill="{PAPYRUS}"/>
  <text x="1024" y="78" text-anchor="middle" font-family="DejaVu Sans,sans-serif" font-size="58" font-weight="800" letter-spacing="13" fill="{INK}">KANA’ANITH</text>
  <text x="1024" y="124" text-anchor="middle" font-family="DejaVu Sans,sans-serif" font-size="20" font-weight="700" letter-spacing="5" fill="{GOLD}">MONUMENTALSCHRIFT SÜDOST-TIRNARAS · VERSION 1.000</text>
  <line x1="120" y1="164" x2="1928" y2="164" stroke="{GOLD}" stroke-width="3"/>
''']
    for index, (name, char, key, meaning) in enumerate(SIGNS):
        col, row = index % cols, index // cols
        x, y = left + col * cell_w, top + row * cell_h
        cx = x + cell_w / 2
        d, bounds = path_data(font, name)
        xmin, ymin, xmax, ymax = bounds
        gw, gh = xmax-xmin, ymax-ymin
        scale = min(.18, 155/gh, 190/gw)
        tx = cx - (xmin + gw/2)*scale
        ty = y + 100 + (ymin + gh/2)*scale
        if col:
            parts.append(f'<line x1="{x}" y1="{y-24}" x2="{x}" y2="{y+270}" stroke="{RULE}" stroke-width="1" opacity=".6"/>')
        parts.append(f'''<g>
  <path d="{d}" transform="translate({tx:.2f} {ty:.2f}) scale({scale:.4f} {-scale:.4f})" fill="url(#ink)" filter="url(#shadow)"/>
  <text x="{cx}" y="{y+205}" text-anchor="middle" font-family="DejaVu Sans,sans-serif" font-size="24" font-weight="800" fill="{INK}">{escape(key)} · {escape(name)}</text>
  <text x="{cx}" y="{y+236}" text-anchor="middle" font-family="DejaVu Sans,sans-serif" font-size="11.5" font-weight="700" letter-spacing=".6" fill="{GOLD}">{escape(meaning.upper())}</text>
</g>''')
    parts.append(f'''<line x1="120" y1="1510" x2="1928" y2="1510" stroke="{GOLD}" stroke-width="3"/>
  <text x="1024" y="1548" text-anchor="middle" font-family="DejaVu Sans,sans-serif" font-size="15" font-weight="700" letter-spacing="3" fill="{GOLD}">RECHTS NACH LINKS · 22 KONSONANTEN · WORT UND BEDEUTUNG</text>
</svg>''')
    CHART_SVG.write_text("".join(parts), encoding="utf-8")


def font_for(text, max_size, max_width):
    size = max_size
    while size > 24:
        font = ImageFont.truetype(str(FONT_PATH), size=size, layout_engine=ImageFont.Layout.RAQM)
        box = font.getbbox(text, direction="rtl")
        if box[2] - box[0] <= max_width: return font
        size -= 2
    return font


def rune_text(base, xy, text, font):
    shadow = Image.new("RGBA", base.size, (0,0,0,0))
    sd = ImageDraw.Draw(shadow)
    sd.text((xy[0]+5, xy[1]+8), text, font=font, fill=(0,0,0,85), anchor="mm", direction="rtl")
    shadow = shadow.filter(ImageFilter.GaussianBlur(4)); base.alpha_composite(shadow)
    ImageDraw.Draw(base).text(xy, text, font=font, fill=(22,74,91,255), anchor="mm", direction="rtl")


def build_specimen():
    img = Image.new("RGBA", (1920, 1280), (238,225,190,255))
    draw = ImageDraw.Draw(img)
    bold = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
    regular = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
    title = ImageFont.truetype(bold, 51); sub = ImageFont.truetype(bold, 20); label = ImageFont.truetype(bold, 23); note = ImageFont.truetype(regular, 17)
    draw.text((960,65), "KANA’ANITH · SCHRIFTPROBE", font=title, fill=(48,37,27), anchor="mm")
    draw.text((960,112), "KANAANITISCH-ÄGYPTISCHE MONUMENTALSCHRIFT", font=sub, fill=(180,138,59), anchor="mm")
    draw.line((110,150,1810,150), fill=(180,138,59), width=3)
    rows = [("RARESHOR","König"),("BASAMUM","Tempel"),("MIMERUM","Hafen"),("MAGAMIM","Karawane"),("AYENPAR","Orakel"),("BETMERIM","Flotte")]
    top, rh = 205, 145
    for idx,(word,meaning) in enumerate(rows):
        y = top + idx*rh
        if idx%2: draw.rounded_rectangle((90,y-48,1830,y+83), radius=10, fill=(247,239,217,255))
        draw.text((130,y-16),word,font=label,fill=(139,91,52),anchor="lm")
        draw.text((130,y+23),meaning,font=note,fill=(75,67,55),anchor="lm")
        ph = to_phoenician(word); f = font_for(ph,112,1170); rune_text(img,(1180,y+10),ph,f)
    y=1110; draw.line((110,y-45,1810,y-45),fill=(200,174,120),width=2)
    draw.text((130,y),"SONDERLAUTE",font=label,fill=(139,91,52),anchor="lm")
    draw.text((130,y+38),"HH · TT · SS · SH",font=note,fill=(75,67,55),anchor="lm")
    ph=to_phoenician("HH TT SS SH"); f=ImageFont.truetype(str(FONT_PATH),108,layout_engine=ImageFont.Layout.RAQM); rune_text(img,(1170,y+12),ph,f)
    draw.text((960,1240),"TTF · OTF · WOFF · WOFF2 · RTL-UNICODE · TRANSLITERATOR",font=sub,fill=(139,91,52),anchor="mm")
    rendered = img.convert("RGB")
    with SPECIMEN_PNG.open("wb") as target:
        rendered.save(target, format="PNG", optimize=False)


def main():
    build_chart_svg(); build_specimen(); print(CHART_SVG); print(SPECIMEN_PNG)


if __name__ == "__main__": main()
