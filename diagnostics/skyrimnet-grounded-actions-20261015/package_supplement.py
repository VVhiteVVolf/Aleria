"""Package and verify the installed configuration supplement for Nolvus migration."""
from pathlib import Path
import hashlib
import json
import shutil
import sys
import zipfile
from local_api import request
from prepare_changes import ROOT, RUNTIME

CENTRAL = Path(r'D:\Nolvus-Backups\Awakening-6.0.20-vor-Update-20260930\updates\20261015-SkyrimNet-GroundedActions')


def digest(data):
    return hashlib.sha256(data).hexdigest()


def main():
    plan = json.loads((ROOT / 'plan.json').read_text(encoding='utf8'))
    config = request('/config?api=get&name=OpenRouter')['data']
    expected = json.loads((ROOT / 'OpenRouter.installed.json').read_text(encoding='utf8'))
    assert config == expected, 'Settings changed after installation; inspect before packaging'
    files = {}
    mod_prefix = 'instance/MODS/mods/' + RUNTIME.parents[2].name + '/SKSE/Plugins/SkyrimNet/'
    for row in plan['prompts']:
        rel = 'overlay/prompts/' + row['path']
        raw = (RUNTIME / rel).read_bytes()
        assert raw.decode('utf-8-sig').replace('\r\n', '\n') == (ROOT / 'staged' / row['path']).read_text(encoding='utf8')
        files[mod_prefix + rel] = raw
    files[mod_prefix + 'config/OpenRouter.yaml'] = (RUNTIME / 'config/OpenRouter.yaml').read_bytes()
    for rel, sha in plan['unchanged'].items():
        assert digest((RUNTIME / rel).read_bytes()) == sha
    for path in (ROOT / 'backup').rglob('*'):
        if path.is_file():
            files['rollback/' + path.relative_to(ROOT / 'backup').as_posix()] = path.read_bytes()
    readme = '''SkyrimNet – Ergänzung: echte Gegenstände und Aufträge, 15.10.2026

Dieses kleine Paket ergänzt die bestehende Nolvus-Sicherung einschließlich
20261015-SkyrimNet-Beta27. Kein vollständiges Mod-/Spielstandsbackup.
Es enthält Zugangsdaten in der Konfiguration und muss privat bleiben.

Nach Übernahme der Basis und der bisherigen Updates die vier Dateien unter
instance/MODS/mods mit denselben relativen Pfaden in die persönliche aktive
SkyrimNet-Runtime übernehmen. Das vorhandene Grundpaket nicht ersetzen.
Aktuellen Modordnernamen bei Bedarf zuordnen; persönliche Runtime muss gewinnen.
Die drei Prompts ergänzen/reparieren Dialoge und Aktionsauswertung.
Die komplette OpenRouter.yaml ist ein Snapshot: vor Übernahme mit den dann
aktuellen Einstellungen vergleichen, damit spätere Änderungen erhalten bleiben.
Die beabsichtigte Modelländerung betrifft ausschließlich action_evaluation:
Gemma 31B, Temperatur 0.2, Provider-Freigabe Friendli, keine anderen Provider.
Der Dialog bleibt DeepSeek V4 Flash 0731; andere Modellrouten bleiben erhalten.
Keine ESPs, Spielstände oder Aktivierungs-/Ladereihenfolgen geändert.

rollback/ enthält die Originalkonfiguration und den vorherigen 0750-Prompt.
Die beiden neuen Module existierten vorher nicht (siehe plan.json).
Nur bei einem ausdrücklich gewünschten Rollback diese Ergänzungen zurücknehmen;
keine anderen Prompts oder Mods löschen. Laufende Änderungen über die lokale
SkyrimNet-Konfigurations-/Prompt-Schnittstelle laden oder Skyrim vorher beenden.

API-Verbindung und synthetische Modellfälle wurden geprüft; ein vollständiger
Spieltest mit Questabschluss und echten Transaktionen bleibt erforderlich.
Vex-/IntelEngine-Begegnungseinstellungen wurden in diesem Paket nicht geändert.
'''
    files['README_WIEDERHERSTELLUNG.txt'] = readme.encode('utf-8-sig')
    for name in ('plan.json', 'installation.json', 'render-verification.json', 'synthetic-test-summary.json'):
        files['evidence/' + name] = (ROOT / name).read_bytes()
    manifest = [{'path': name, 'sha256': digest(data), 'bytes': len(data)} for name, data in sorted(files.items())]
    files['manifest.json'] = json.dumps(manifest, indent=2).encode('utf8')
    archive = ROOT / 'migration-skyrimnet-grounded-actions-20261015.zip'
    with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as out:
        for name, data in files.items():
            out.writestr(name, data)
    with zipfile.ZipFile(archive) as check:
        assert check.testzip() is None
        for entry in manifest:
            assert digest(check.read(entry['path'])) == entry['sha256']
    receipt = {'status': 'VERIFIED', 'archive': str(archive), 'sha256': digest(archive.read_bytes()),
               'files_verified': len(manifest), 'bytes': archive.stat().st_size,
               'live_files': [n for n in files if n.startswith('instance/')],
               'base_backup_pointers_unchanged': True}
    (ROOT / 'migration-receipt.json').write_text(json.dumps(receipt, indent=2), encoding='utf8')
    if '--central' in sys.argv:
        parent = CENTRAL.parent
        assert parent.is_dir() and CENTRAL.resolve().parent == parent.resolve()
        CENTRAL.mkdir(exist_ok=False)
        for name in (archive.name, 'migration-receipt.json', 'ERGEBNIS.txt'):
            source = ROOT / name
            shutil.copy2(source, CENTRAL / name)
            assert digest(source.read_bytes()) == digest((CENTRAL / name).read_bytes())
        (CENTRAL / 'README_WIEDERHERSTELLUNG.txt').write_text(readme, encoding='utf-8-sig')
        receipt['central_destination'] = str(CENTRAL)
        (ROOT / 'central-backup-receipt.json').write_text(json.dumps(receipt, indent=2), encoding='utf8')
    print(json.dumps(receipt))


if __name__ == '__main__':
    main()
