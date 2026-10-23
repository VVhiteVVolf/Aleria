"""Legacy nested lists must preserve text once, in reading order."""
import importlib.util
from pathlib import Path
import unittest
from bs4 import BeautifulSoup

spec=importlib.util.spec_from_file_location('legacy',Path(__file__).parents[1]/'scripts/legacy-territory-article.py')
legacy=importlib.util.module_from_spec(spec);spec.loader.exec_module(legacy)

class NarrativeBlocks(unittest.TestCase):
    def texts(self, html):
        soup=BeautifulSoup(html,'html.parser')
        return [value for node in soup.find_all(['p','li']) if (value:=legacy.block_text(node))]

    def test_nested_creature_list_retains_parent_intro_without_repeating_children(self):
        self.assertEqual(self.texts('<li>Vampire: <strong>Gefährliche Wesen.</strong><ul><li>Alpe: Albträume.</li><li>Nosferat: Mächtig.</li></ul></li>'),['Vampire: Gefährliche Wesen.','Alpe: Albträume.','Nosferat: Mächtig.'])

    def test_paragraphs_inside_list_items_keep_surrounding_labels(self):
        self.assertEqual(self.texts('<li>Hornlinge<p>Sie leben im Moor.</p></li>'),['Hornlinge','Sie leben im Moor.'])

    def test_inline_emphasis_and_punctuation_are_preserved(self):
        self.assertEqual(self.texts('<p>Im <b>Wald</b> , am Fluss.</p>'),['Im Wald, am Fluss.'])

if __name__=='__main__':unittest.main()
