"""Remove only this installation's own duplicate work directories after backup."""
from pathlib import Path
import json
import shutil
import os
import stat

OUT = Path(__file__).parent.resolve()


def main():
    migration = json.loads((OUT / 'migration-plan.json').read_text())
    backup = Path(migration['backup_root'])
    assert json.loads((backup / 'COMPLETE.json').read_text(encoding='utf-8'))['status'] == 'VERIFIED'
    pointer = json.loads((backup.parent.parent / 'LATEST_BACKUP.json').read_text(encoding='utf-8'))
    assert backup.parent.parent / pointer['supplement'] == backup
    assert json.loads((OUT / 'installation-validation.json').read_text(encoding='utf-8'))['verified']
    plan = json.loads((OUT / 'deployment-plan.json').read_text(encoding='utf-8'))
    live = Path(plan['instance']) / 'MODS/mods'
    manifests = json.loads((OUT / 'deployed-file-manifest.json').read_text(encoding='utf-8'))
    for mod in manifests:
        for row in mod['files']:
            file = live / mod['mod'] / row['relative']
            assert file.is_file() and file.stat().st_size == row['bytes'], str(file)
    expected = {'unpacked', 'mod-stage', 'generated', 'BodySlide', 'BuildCatalog'}
    roots = json.loads((OUT / 'temporary-directories.json').read_text())
    assert {Path(r['path']).name for r in roots} == expected
    for row in roots:
        root = Path(row['path']).resolve()
        assert root.parent == OUT and root.name in expected
        assert root.is_relative_to(Path(r'E:\Aleria').resolve())
        assert not root.is_symlink() and not root.is_junction()
        assert not any(p.is_symlink() or p.is_junction() for p in root.rglob('*'))
    removed = []
    def clear_readonly(function, filename, exception):
        path = Path(filename).resolve()
        assert path.is_relative_to(OUT) and path.relative_to(OUT).parts[0] in expected
        if not isinstance(exception, PermissionError):
            raise exception
        os.chmod(path, stat.S_IWRITE)
        function(path)
    for row in roots:
        root = Path(row['path']).resolve()
        shutil.rmtree(root, onexc=clear_readonly)
        assert not root.exists()
        removed.append(row)
        print('Removed verified own temporary directory:', root.name, flush=True)
    receipt = {'completed': True, 'removed': removed, 'bytes': sum(r['bytes'] for r in removed),
               'source_downloads_preserved': True, 'diagnostic_reports_and_scripts_preserved': True}
    (OUT / 'temporary-cleanup-result.json').write_text(json.dumps(receipt, indent=2), encoding='utf-8')
    print('Temporary space reclaimed GiB:', round(receipt['bytes'] / 2**30, 2), flush=True)


if __name__ == '__main__':
    main()
