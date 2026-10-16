"""Create a narrow private backup supplement for the quest-journal filter."""
from pathlib import Path
import hashlib
import json
import shutil
import sys
import zipfile

import yaml

ROOT = Path(__file__).resolve().parent
RUNTIME = Path(r'E:\Nolvus\Instances\Nolvus Awakening\MODS\mods\SkyrimNet - Beta25 Test Runtime 20260927\SKSE\Plugins\SkyrimNet')
CENTRAL = Path(r'D:\Nolvus-Backups\Awakening-6.0.20-vor-Update-20260930\updates\20261016-SkyrimNet-QuestAwareness')


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def main():
    files = {}
    prefix = 'instance/MODS/mods/' + RUNTIME.parents[2].name + '/SKSE/Plugins/SkyrimNet/'
    for rel in ['config/Events.yaml', 'overlay/triggers/local_meaningful_quest_journal.yaml']:
        raw = (RUNTIME / rel).read_bytes()
        files[prefix + rel] = raw
    events = yaml.safe_load((RUNTIME / 'config/Events.yaml').read_text(encoding='utf-8-sig'))
    objective = next(e for e in events['events'] if e['event_type'] == 'quest_objective_state')
    assert objective['enabled'] and not objective['persistent'] and not objective['shortLivedEnabled'] and not objective['allowNPCReaction']
    assert not next(e for e in events['events'] if e['event_type'] == 'quest_stage')['enabled']
    trigger = yaml.safe_load((RUNTIME / 'overlay/triggers/local_meaningful_quest_journal.yaml').read_text(encoding='utf-8-sig'))
    assert trigger['response']['type'] == 'persistent_generic' and trigger['audience'] == 'player'
    files['rollback/Events.yaml'] = (ROOT / 'backup/Events.yaml').read_bytes()
    for name in ['events.before.json', 'events.installed.json', 'installation.json', 'synthetic-filter-tests.json',
                 'native-trigger-validation.json', 'native-condition-validation.json', 'response-template-preview.json',
                 'live-registration-evidence.txt']:
        files['evidence/' + name] = (ROOT / name).read_bytes()
    verified = '--live-verified' in sys.argv
    if verified:
        files['evidence/live-success-evidence.txt'] = (ROOT / 'live-success-evidence.txt').read_bytes()
    files['ERGEBNIS.txt'] = (ROOT / 'ERGEBNIS.txt').read_bytes()
    manifest = [{'path': name, 'bytes': len(raw), 'sha256': sha(raw)} for name, raw in sorted(files.items())]
    files['manifest.json'] = json.dumps(manifest, indent=2).encode('utf8')
    archive = ROOT / ('migration-skyrimnet-quest-awareness-20261016' + ('-live-verified' if verified else '') + '.zip')
    with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as z:
        for name, raw in files.items():
            z.writestr(name, raw)
    with zipfile.ZipFile(archive) as z:
        assert z.testzip() is None
        for row in manifest:
            assert sha(z.read(row['path'])) == row['sha256']
    result = {'verified': True, 'archive': str(archive), 'sha256': sha(archive.read_bytes()),
              'entries_verified': len(files), 'base_backup_pointers_unchanged': True}
    receipt_name = 'migration-live-verified-receipt.json' if verified else 'migration-receipt.json'
    (ROOT / receipt_name).write_text(json.dumps(result, indent=2), encoding='utf8')
    if '--central' in sys.argv:
        assert CENTRAL.parent.is_dir()
        if verified:
            assert CENTRAL.is_dir()
        else:
            assert not CENTRAL.exists()
            CENTRAL.mkdir()
        for name in [archive.name, receipt_name, 'ERGEBNIS.txt']:
            dest = CENTRAL / ('ERGEBNIS_LIVE_VERIFIED.txt' if verified and name == 'ERGEBNIS.txt' else name)
            assert not dest.exists()
            shutil.copy2(ROOT / name, dest)
            assert sha((ROOT / name).read_bytes()) == sha(dest.read_bytes())
        result['central_destination'] = str(CENTRAL)
        (ROOT / ('central-live-verified-receipt.json' if verified else 'central-backup-receipt.json')).write_text(json.dumps(result, indent=2), encoding='utf8')
    print(json.dumps(result))


if __name__ == '__main__':
    main()
