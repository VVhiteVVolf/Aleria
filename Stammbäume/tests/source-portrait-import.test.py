"""Individual child portraits must stay eligible in subsequent source imports."""
import json
from pathlib import Path
import runpy
import sys
import tempfile
import unittest

STAGE = Path(__file__).resolve().parents[1] / 'scripts/family-source-import'
sys.path.insert(0, str(STAGE))


class SourcePortraitImportTest(unittest.TestCase):
    def test_child_portraits_are_display_assets_and_verified_archive_paths_stay_stable(self):
        with tempfile.TemporaryDirectory(prefix='.portrait-import-test-', dir=Path(__file__).resolve().parent) as temporary:
            directory = Path(temporary) / 'scripts/test-source-import'
            directory.mkdir(parents=True)
            (directory / 'import.json').write_text('{"slug":"test"}', encoding='utf-8')
            persons = {
                'new-child': {'id': 'new-child', 'existingPortrait': '', 'portraitPlaceholder': 'child',
                              'imageCandidates': ['https://example.invalid/new-child.jpg'], 'sourceRefs': ['nessa:182:3']},
                'archived-child': {'id': 'archived-child', 'existingPortrait': '', 'portraitPlaceholder': 'child',
                                   'imageCandidates': ['https://example.invalid/archived-child.jpg'], 'sourceRefs': ['haeghra:172:2']},
                'silhouette': {'id': 'silhouette', 'existingPortrait': '', 'portraitPlaceholder': 'child',
                               'imageCandidates': ['https://example.invalid/tumblr_otwjgn7mfU1wwqdobo1_1280.png'], 'sourceRefs': ['nessa:186:4']},
                'adult-silhouette': {'id': 'adult-silhouette', 'existingPortrait': '', 'portraitPlaceholder': 'auto',
                                     'imageCandidates': ['https://i.imgur.com/7yB9PR6.png', 'https://i.imgur.com/51CghpL.png'], 'sourceRefs': ['urquhart:94:0']},
            }
            archive = 'assets/images/references/haus-haeghra/children/archived-child.jpg'
            (directory / 'resolved.json').write_text(json.dumps({'persons': persons}), encoding='utf-8')
            (directory / 'portrait-assets-receipt.json').write_text(json.dumps([
                {'personId': 'archived-child', 'url': persons['archived-child']['imageCandidates'][0], 'path': archive, 'referenceOnly': True}
            ]), encoding='utf-8')
            runpy.run_path(str(STAGE / 'portrait_assets.py'), init_globals={'IMPORT_DIRECTORY': str(directory)})
            assets = {a['personId']: a for a in json.loads((directory / 'portrait-assets.json').read_text('utf-8'))}
            self.assertEqual(set(assets), {'new-child', 'archived-child'})
            self.assertFalse(any(a['referenceOnly'] for a in assets.values()))
            self.assertEqual(assets['new-child']['path'], 'assets/images/portraits/haus-nessa/new-child.jpg')
            self.assertEqual(assets['archived-child']['path'], archive)


if __name__ == '__main__':
    unittest.main()
