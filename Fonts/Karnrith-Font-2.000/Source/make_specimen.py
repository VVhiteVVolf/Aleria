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
FONT_PATH = DIST / "KarnrithHochschnitt-Regular.ttf"
CHART_SVG = DIST / "KarnrithHochschnitt_Zeichentafel_2.000.svg"
CHART_PNG = DIST / "KarnrithHochschnitt_Zeichentafel_2.000.png"
SPECIMEN_PNG = DIST / "KarnrithHochschnitt_Schriftprobe_2.000.png"

INK = "#2b3032"
BRONZE = "#8b5b34"
STONE = "#eee9df"
PALE = "#f8f5ef"
RULE = "#c7b9a7"


def glyph_path_data(font, glyph_name):
    glyph_set = font.getGlyphSet()
    pen = SVGPathPen(glyph_set)
    glyph_set[glyph_name].draw(pen)
    bounds_pen = BoundsPen(glyph_set)
    glyph_set[glyph_name].draw(bounds_pen)
    return pen.getCommands(), bounds_pen.bounds


def build_chart_svg():
    font = TTFont(FONT_PATH)
    cols = 6
    cell_w = 320
    cell_h = 348
    left = 64
    top = 242
    parts = [f'''<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="2048" viewBox="0 0 2048 2048">
  <defs>
    <filter id="shadow" x="-35%" y="-35%" width="180%" height="190%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="b"/>
      <feOffset in="b" dx="4" dy="7" result="o"/>
      <feFlood flood-color="#000000" flood-opacity=".24" result="c"/>
      <feComposite in="c" in2="o" operator="in" result="s"/>
      <feMerge><feMergeNode in="s"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <linearGradient id="ink" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#22282a"/>
      <stop offset=".55" stop-color="#4d5658"/>
      <stop offset="1" stop-color="#171b1c"/>
    </linearGradient>
  </defs>
  <rect width="2048" height="2048" fill="{STONE}"/>
  <text x="1024" y="82" text-anchor="middle" font-family="DejaVu Sans,sans-serif" font-size="54" font-weight="800" letter-spacing="10" fill="{INK}">KARNRITH HOCHSCHNITT</text>
  <text x="1024" y="127" text-anchor="middle" font-family="DejaVu Sans,sans-serif" font-size="21" font-weight="700" letter-spacing="5" fill="{BRONZE}">ZWERGISCH-MONUMENTALE NEUFASSUNG · VERSION 2.000</text>
  <line x1="120" y1="166" x2="1928" y2="166" stroke="{BRONZE}" stroke-width="3"/>
''']

    for index, (code, key, name, meaning, family, stage) in enumerate(SIGNS):
        col = index % cols
        row = index // cols
        x = left + col * cell_w
        y = top + row * cell_h
        cx = x + cell_w / 2
        d, bounds = glyph_path_data(font, name)
        x_min, y_min, x_max, y_max = bounds
        glyph_w = x_max - x_min
        glyph_h = y_max - y_min
        scale = min(0.175, 150 / glyph_h, 184 / glyph_w)
        tx = cx - (x_min + glyph_w / 2) * scale
        baseline_y = y + 102 + (y_min + glyph_h / 2) * scale
        if col:
            parts.append(f'  <line x1="{x}" y1="{y-32}" x2="{x}" y2="{y+285}" stroke="{RULE}" stroke-width="1" opacity=".65"/>\n')
        parts.append(f'''  <g>
    <path d="{d}" transform="translate({tx:.2f} {baseline_y:.2f}) scale({scale:.4f} {-scale:.4f})" fill="url(#ink)" filter="url(#shadow)"/>
    <text x="{cx}" y="{y+218}" text-anchor="middle" font-family="DejaVu Sans,sans-serif" font-size="25" font-weight="800" fill="{INK}">{escape(key)} · {escape(name)}</text>
    <text x="{cx}" y="{y+250}" text-anchor="middle" font-family="DejaVu Sans,sans-serif" font-size="12" font-weight="700" letter-spacing=".7" fill="{BRONZE}">{escape(code)} · {escape(meaning.upper())}</text>
  </g>
''')
    parts.append(f'''  <line x1="120" y1="1990" x2="1928" y2="1990" stroke="{BRONZE}" stroke-width="3"/>
  <text x="1024" y="2022" text-anchor="middle" font-family="DejaVu Sans,sans-serif" font-size="15" font-weight="700" letter-spacing="3" fill="{BRONZE}">MORGAR · STEINGRAT · KERBE · BEDEUTUNG</text>
</svg>
''')
    CHART_SVG.write_text("".join(parts), encoding="utf-8")


def fit_font(path, text, max_size, max_width):
    size = max_size
    while size > 20:
        font = ImageFont.truetype(str(path), size=size, layout_engine=ImageFont.Layout.RAQM)
        box = font.getbbox(text, features=["liga"])
        if box[2] - box[0] <= max_width:
            return font
        size -= 2
    return ImageFont.truetype(str(path), size=size, layout_engine=ImageFont.Layout.RAQM)


def draw_karnrith_with_shadow(base, xy, text, font, fill=(42, 48, 50, 255), anchor="mm"):
    shadow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.text((xy[0] + 5, xy[1] + 9), text, font=font, fill=(0, 0, 0, 90), anchor=anchor, features=["liga"])
    shadow = shadow.filter(ImageFilter.GaussianBlur(4))
    base.alpha_composite(shadow)
    ImageDraw.Draw(base).text(xy, text, font=font, fill=fill, anchor=anchor, features=["liga"])


def build_specimen_png():
    img = Image.new("RGBA", (1920, 1280), (238, 233, 223, 255))
    draw = ImageDraw.Draw(img)
    sans_bold = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
    sans = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
    title = ImageFont.truetype(sans_bold, 50)
    sub = ImageFont.truetype(sans_bold, 20)
    label = ImageFont.truetype(sans_bold, 23)
    note = ImageFont.truetype(sans, 17)
    draw.text((960, 66), "KARNRITH HOCHSCHNITT · 2.000", font=title, fill=(43, 48, 50), anchor="mm")
    draw.text((960, 114), "SCHMALE ZWERGISCHE VOLLRUNEN FÜR MORGAR", font=sub, fill=(139, 91, 52), anchor="mm")
    draw.line((110, 150, 1810, 150), fill=(139, 91, 52), width=3)

    rows = [
        ("MORGAR", "Sprache des Volkes"),
        ("KARNRITH", "Steinschrift"),
        ("URORTHARN", "Hochkönig"),
        ("FAURPARGOR", "Schmied"),
        ("GHARQARN", "Namenszauber"),
        ("YRNGRUM", "Ahnengruft"),
    ]
    top = 205
    row_h = 145
    for index, (word, meaning) in enumerate(rows):
        y = top + index * row_h
        if index % 2:
            draw.rounded_rectangle((90, y - 48, 1830, y + 83), radius=10, fill=(248, 245, 239, 255))
        draw.text((130, y - 16), word, font=label, fill=(139, 91, 52), anchor="lm")
        draw.text((130, y + 23), meaning, font=note, fill=(74, 79, 80), anchor="lm")
        font = fit_font(FONT_PATH, word, 112, 1170)
        draw_karnrith_with_shadow(img, (1180, y + 10), word, font)

    y = 1110
    draw.line((110, y - 45, 1810, y - 45), fill=(199, 185, 167), width=2)
    draw.text((130, y), "LIGATUREN", font=label, fill=(139, 91, 52), anchor="lm")
    draw.text((130, y + 38), "NG · TH · KH · GH · SH · CH · DH", font=note, fill=(74, 79, 80), anchor="lm")
    liga_font = ImageFont.truetype(str(FONT_PATH), 108, layout_engine=ImageFont.Layout.RAQM)
    draw_karnrith_with_shadow(img, (1170, y + 12), "NG TH KH GH SH CH DH", liga_font)
    draw.text((960, 1240), "TTF · OTF · WOFF · WOFF2 · OPENTYPE-LIGATUREN", font=sub, fill=(139, 91, 52), anchor="mm")
    img.convert("RGB").save(SPECIMEN_PNG, quality=95)


def main():
    build_chart_svg()
    build_specimen_png()
    print(CHART_SVG)
    print(SPECIMEN_PNG)


if __name__ == "__main__":
    main()
