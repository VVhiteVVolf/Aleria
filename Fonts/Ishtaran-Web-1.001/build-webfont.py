"""Build the Aleria web adaptation with Python 3 and fontTools (no font redraw)."""
import argparse
from io import BytesIO
from pathlib import Path
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT.parent / 'Ishtaran-Gesamtpaket-1.000' / 'Fonts' / 'AyluunMondbogen-Regular.ttf'


def build(check=False):
    font = TTFont(SOURCE, recalcTimestamp=False)
    original = font.getBestCmap().copy()
    assert 0x0131 not in original and 0x0069 in original
    # Tirghan's supplied vocabulary uses dotless i. Reuse the existing i sign;
    # this only extends character coverage, never transliterates saved text.
    for table in font['cmap'].tables:
        if table.isUnicode():
            table.cmap[0x0131] = original[0x0069]
    assert font.getBestCmap() == {**original, 0x0131: original[0x0069]}
    for extension, flavor in [('ttf', None), ('woff', 'woff')]:
        font.flavor = flavor
        output = BytesIO()
        font.save(output)
        target = ROOT / f'AyluunMondbogen-Regular.{extension}'
        if check:
            if not target.exists() or target.read_bytes() != output.getvalue():
                raise SystemExit(f'Webfont is stale: {target.name}')
        else:
            target.write_bytes(output.getvalue())
    print('Ayluun webfont: U+0131 alias, 201 codepoints; ' + ('verified' if check else 'built'))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    build(parser.parse_args().check)
