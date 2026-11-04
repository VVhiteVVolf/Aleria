"""Run existing cleanup tests with a bounded local TemporaryDirectory factory.

The standard mode-0700 directory creation remains unchanged. Only the fixture
location and its cleanup are scoped here; no ACL or production code is changed.
Cleanup validates each known fixture file, then removes files and empty folders
individually. It never invokes shutil.rmtree or a recursive shell deletion.
"""
import sys
sys.dont_write_bytecode = True

import importlib.util
import io
import json
import os
from pathlib import Path
import stat
import tempfile
import unittest

SANDBOX = Path('E:/Aleria/diagnostics/leitheach-clans-20261103/cleanup-test-sandbox')
assert SANDBOX.is_absolute() and SANDBOX.resolve(strict=True) == SANDBOX
assert all(not p.is_symlink() and not os.path.isjunction(p) for p in [SANDBOX, *SANDBOX.parents])
WORKSPACE = Path('E:/Aleria').resolve(strict=True)
OWNED = {}
EVENTS = []
ORIGINAL_TEMPORARY_DIRECTORY = tempfile.TemporaryDirectory


def bounded_cleanup(name):
    folder = Path(name)
    assert folder.is_absolute() and folder.parent == SANDBOX
    assert folder.name.startswith('own-maintenance-test-') and str(folder) in OWNED
    if not folder.exists():
        return
    assert folder.resolve(strict=True) == folder
    assert not folder.is_symlink() and not os.path.isjunction(folder)
    marker = folder / 'own-fixture-marker.json'
    assert marker.read_bytes() == OWNED[str(folder)]
    expected_files = {
        'own-fixture-marker.json': {OWNED[str(folder)]},
        '.tmp/wellenruh-build/AleriaAlmanach/AleriaAlmanach.html': {b'../assets/almanach-abcdefgh.js'},
        '.tmp/wellenruh-build/image.png': {b'byte-identical source', b'new work'},
        '.tmp/wellenruh-build/method.md': {b'keep forever'},
        'valuable.png': {b'keep'},
    }
    expected_directories = {'.tmp', '.tmp/wellenruh-build', '.tmp/wellenruh-build/AleriaAlmanach'}
    files = []
    directories = []
    # Read-only enumeration first; unexpected material prevents all removal.
    for current, children, names in os.walk(folder, followlinks=False):
        current = Path(current)
        for child in children:
            directory = current / child
            rel = directory.relative_to(folder).as_posix()
            assert rel in expected_directories and not directory.is_symlink()
            assert not os.path.isjunction(directory)
            assert directory.resolve(strict=True).is_relative_to(folder)
            directories.append(directory)
        for filename in names:
            file = current / filename
            rel = file.relative_to(folder).as_posix()
            assert file.parent.resolve(strict=True).is_relative_to(folder)
            if file.is_symlink():
                assert rel == '.tmp/wellenruh-build/alias.png'
                assert file.resolve(strict=True) == folder / 'valuable.png'
                files.append((file, None))
            else:
                assert rel in expected_files and file.is_file()
                assert not file.lstat().st_file_attributes & stat.FILE_ATTRIBUTE_REPARSE_POINT
                data = file.read_bytes()
                assert data in expected_files[rel]
                files.append((file, data))
    # Remove verified aliases before their targets; keep the ownership marker last.
    files.sort(key=lambda item: (item[0] == marker, item[1] is not None))
    for file, expected in files:
        assert file.parent.resolve(strict=True).is_relative_to(folder)
        if expected is None:
            assert file.is_symlink() and file.resolve(strict=True) == folder / 'valuable.png'
        else:
            assert not file.is_symlink() and file.read_bytes() == expected
        file.unlink()
    for directory in sorted(directories, key=lambda p: len(p.parts), reverse=True):
        assert directory.resolve(strict=True).is_relative_to(folder)
        assert not any(directory.iterdir())
        directory.rmdir()
    assert folder.resolve(strict=True).parent == SANDBOX and not any(folder.iterdir())
    folder.rmdir()
    EVENTS.append({'directory': str(folder), 'removedOwnFiles': len(files), 'emptyDirectoriesRemoved': len(directories) + 1})


class ScopedTemporaryDirectory(ORIGINAL_TEMPORARY_DIRECTORY):
    def __init__(self, *args, **kwargs):
        assert not args
        assert kwargs.get('dir') in (None, str(SANDBOX), SANDBOX)
        kwargs['dir'] = str(SANDBOX)
        kwargs['prefix'] = 'own-maintenance-test-'
        super().__init__(**kwargs)
        folder = Path(self.name)
        assert folder.parent.resolve(strict=True) == SANDBOX
        assert folder.resolve(strict=True) == folder
        data = json.dumps({'suite': 'netlify/tests/temporary-cleanup.test.py', 'ownDirectory': folder.name}).encode()
        OWNED[str(folder)] = data
        (folder / 'own-fixture-marker.json').write_bytes(data)

    @classmethod
    def _rmtree(cls, name, ignore_errors=False, repeated=False):
        bounded_cleanup(name)


buffer = io.StringIO()
try:
    tempfile.TemporaryDirectory = ScopedTemporaryDirectory
    spec = importlib.util.spec_from_file_location('bounded_cleanup_tests', WORKSPACE / 'netlify/tests/temporary-cleanup.test.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    result = unittest.TextTestRunner(stream=buffer, verbosity=2).run(unittest.defaultTestLoader.loadTestsFromModule(module))
finally:
    tempfile.TemporaryDirectory = ORIGINAL_TEMPORARY_DIRECTORY

report = {
    'schema': 'aleria.bounded-maintenance-test-run',
    'suite': 'netlify/tests/temporary-cleanup.test.py',
    'sandbox': str(SANDBOX),
    'python': sys.version,
    'testsRun': result.testsRun,
    'failures': len(result.failures),
    'errors': len(result.errors),
    'skipped': len(result.skipped),
    'success': result.wasSuccessful(),
    'productionCodeChanged': False,
    'aclChanged': False,
    'standardMode0700CreationPreserved': True,
    'recursiveRemovalUsed': False,
    'cleanupEvents': EVENTS,
    'remainingOwnDirectories': [name for name in OWNED if Path(name).exists()],
    'output': buffer.getvalue(),
}
(SANDBOX / 'maintenance-test-result.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(buffer.getvalue())
print(json.dumps({key: report[key] for key in ['testsRun', 'failures', 'errors', 'skipped', 'success', 'remainingOwnDirectories']}))
raise SystemExit(0 if report['success'] and not report['remainingOwnDirectories'] else 1)
