import importlib.util
from pathlib import Path
import tempfile
import unittest
import os

spec = importlib.util.spec_from_file_location('cleanup', Path(__file__).parents[1] / 'maintenance/clean-build-copies.py')
cleanup = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cleanup)


class CleanupTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='aleria-cleanup-test-')
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name).resolve()
        self.build = self.root / '.tmp' / cleanup.BUILD_NAMES[0]
        (self.build / 'AleriaAlmanach').mkdir(parents=True)
        (self.build / 'AleriaAlmanach/AleriaAlmanach.html').write_text('../assets/almanach-abcdefgh.js')
        self.file = self.build / 'image.png'
        self.file.write_bytes(b'byte-identical source')
        info = self.file.stat()
        self.entry = {'path': self.file.relative_to(self.root).as_posix(),
            'object': cleanup.git_blob_hash(self.file), 'bytes': info.st_size,
            'mtime_ns': info.st_mtime_ns, 'inode': info.st_ino, 'device': info.st_dev}
        self.plan = {'version': 1, 'root': str(self.root), 'files': [self.entry]}

    def test_only_proven_git_copies_are_removed(self):
        result = cleanup.apply_plan(self.root, self.plan, {self.entry['object']})
        self.assertEqual(result['removedFiles'], 1)
        self.assertFalse(self.file.exists())
        self.assertTrue((self.build / 'AleriaAlmanach/AleriaAlmanach.html').exists())

    def test_changed_or_unbacked_content_is_retained(self):
        self.assertEqual(cleanup.apply_plan(self.root, self.plan, set())['removedFiles'], 0)
        self.file.write_bytes(b'new work')
        self.assertEqual(cleanup.apply_plan(self.root, self.plan, {self.entry['object']})['removedFiles'], 0)
        self.assertTrue(self.file.exists())

    def test_methods_and_outside_paths_cannot_be_targeted(self):
        guide = self.build / 'method.md'
        guide.write_text('keep forever')
        for relative in [guide.relative_to(self.root).as_posix(), '../outside', '.tmp/unknown/image.png']:
            with self.assertRaises((ValueError, OSError)):
                cleanup.checked_path(self.root, relative)

    def test_symlinks_cannot_escape_the_build(self):
        target = self.root / 'valuable.png'
        target.write_bytes(b'keep')
        alias = self.build / 'alias.png'
        try:
            alias.symlink_to(target)
        except OSError:
            self.skipTest('OS does not allow file symlinks')
        with self.assertRaises(ValueError):
            cleanup.checked_path(self.root, alias.relative_to(self.root).as_posix())
        self.assertEqual(target.read_bytes(), b'keep')


if __name__ == '__main__':
    unittest.main()
