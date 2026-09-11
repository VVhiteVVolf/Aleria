"""Verify shipped font behavior with fonttools[woff] and uharfbuzz."""
import io
from pathlib import Path
import unicodedata
import unittest

from fontTools.ttLib import TTFont
import uharfbuzz as hb


FONT_DIRECTORY = Path(__file__).resolve().parents[1] / 'fonts'


class ArcaneFontTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.fonts = {}
        cls.shapers = {}
        for family in ('Regular', 'Text'):
            for extension in ('ttf', 'woff', 'woff2'):
                key = (family, extension)
                font = TTFont(FONT_DIRECTORY / f'AleriaArcana-{family}.{extension}')
                cls.fonts[key] = font
                font.flavor = None
                data = io.BytesIO()
                font.save(data)
                cls.shapers[key] = hb.Font(hb.Face(data.getvalue()))

    @classmethod
    def tearDownClass(cls):
        for font in cls.fonts.values():
            font.close()

    def shape(self, key, text):
        buffer = hb.Buffer()
        buffer.add_str(text)
        buffer.guess_segment_properties()
        hb.shape(self.shapers[key], buffer)
        order = self.fonts[key].getGlyphOrder()
        return [
            (order[info.codepoint], position.x_advance, position.x_offset, position.y_offset)
            for info, position in zip(buffer.glyph_infos, buffer.glyph_positions)
        ]

    def test_text_keeps_letters_separate_without_feature_overrides(self):
        for key, font in self.fonts.items():
            if key[0] != 'Text':
                continue
            for text in ('CH', 'SH', 'TH', 'HL', 'GH', 'NG', 'DZ', 'TS', 'AE', 'KH', 'Schule'):
                with self.subTest(font=key, text=text):
                    expected = [font.getBestCmap()[ord(char)] for char in text]
                    self.assertEqual([glyph[0] for glyph in self.shape(key, text)], expected)

    def test_ritual_family_retains_digraphs_and_separate_pua_runes(self):
        for key in self.fonts:
            if key[0] != 'Regular':
                continue
            for text in ('CH', 'SH', 'TH', 'HL', 'GH', 'NG', 'DZ', 'TS', 'AE', 'KH'):
                with self.subTest(font=key, text=text):
                    self.assertEqual(len(self.shape(key, text)), 1)
            self.assertEqual(len(self.shape(key, '\uE002\uE007')), 2)

    def test_accents_keep_composition_and_positioning(self):
        for key, font in self.fonts.items():
            for text in ('ÄÖÜäöü', 'ÉàçñĞİŞ', 'ĀĂĄČĎĚŐŮ'):
                with self.subTest(font=key, text=text):
                    self.assertEqual(self.shape(key, text), self.shape(key, unicodedata.normalize('NFD', text)))
            self.assertIn('mark', [record.FeatureTag for record in font['GPOS'].table.FeatureList.FeatureRecord])
            accent = self.shape(key, 'Q\u0301')
            self.assertEqual(len(accent), 2)
            self.assertEqual(accent[1][1], 0)
            self.assertGreater(accent[1][3], 0)

    def test_declared_character_ranges_are_covered(self):
        codepoints = set(range(32, 127)) | set(range(0xA0, 0x180)) | set(range(0xE000, 0xE021)) | {0x1E9E}
        for key, font in self.fonts.items():
            with self.subTest(font=key):
                self.assertFalse(codepoints - font.getBestCmap().keys())

    def test_formats_preserve_character_mapping_and_layout(self):
        for family in ('Regular', 'Text'):
            reference = self.fonts[(family, 'ttf')]
            for extension in ('woff', 'woff2'):
                font = self.fonts[(family, extension)]
                with self.subTest(family=family, extension=extension):
                    self.assertEqual(reference.getBestCmap(), font.getBestCmap())
                    self.assertEqual(reference['hmtx'].metrics, font['hmtx'].metrics)
                    for tag in ('GSUB', 'GPOS'):
                        self.assertEqual(reference[tag].compile(reference), font[tag].compile(font))


if __name__ == '__main__':
    unittest.main()
