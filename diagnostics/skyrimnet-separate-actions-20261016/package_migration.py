"""Package only this change and copy it to the existing private migration set."""
from pathlib import Path
import hashlib
import json
import shutil
import sys
import zipfile

import yaml

ROOT = Path(__file__).resolve().parent
RUNTIME = Path(r'E:\Nolvus\Instances\Nolvus Awakening\MODS\mods\SkyrimNet - Beta25 Test Runtime 20260927\SKSE\Plugins\SkyrimNet')
CENTRAL = Path(r'D:\Nolvus-Backups\Awakening-6.0.20-vor-Update-20260930\updates\20261016-SkyrimNet-SeparateActions')


def sha(data):
    return hashlib.sha256(data).hexdigest()


def main():
    game = yaml.safe_load((RUNTIME / 'config/SkyrimNet.yaml').read_text(encoding='utf-8-sig'))
    assert game['dialogue']['embedActionsInDialogue'] is False
    model = yaml.safe_load((RUNTIME / 'config/OpenRouter.yaml').read_text(encoding='utf-8-sig'))
    assert model['openrouter']['model_name'] == 'deepseek/deepseek-v4-flash-0731'
    assert model['openrouter']['variants']['action_evaluation']['model_params'][0]['provider_settings']['provider']['only'] == ['friendli', 'parasail']
    files = {}
    prefix = 'instance/MODS/mods/' + RUNTIME.parents[2].name + '/SKSE/Plugins/SkyrimNet/'
    for rel in ['config/SkyrimNet.yaml', 'config/OpenRouter.yaml', 'overlay/prompts/native_action_selector.prompt']:
        files[prefix + rel] = (RUNTIME / rel).read_bytes()
    for name in ['SkyrimNet.yaml', 'OpenRouter.yaml']:
        files['rollback/' + name] = (ROOT / 'backup' / name).read_bytes()
    files['rollback/native_action_selector.before.api.json'] = (ROOT / 'native_action_selector.before.api.json').read_bytes()
    for name in ['installation.json', 'selector-validation.json', 'synthetic-root-selector-tests.json', 'synthetic-detail-selector-tests.json', 'reload-log-evidence.txt']:
        files['evidence/' + name] = (ROOT / name).read_bytes()
    files['ERGEBNIS.txt'] = (ROOT / 'ERGEBNIS.txt').read_bytes()
    readme = '''Ergänzung zur privaten Nolvus-Migration: SeparateActions, 16.10.2026

Nach der Basis und den bisherigen Updates übernehmen. Drei aktuelle Dateien
liegen mit ursprünglichen relativen Pfaden unter instance/MODS/mods/.
Runtime-Modordner bei einer neuen Installation entsprechend zuordnen.
Nicht das Grundpaket ersetzen. Konfigurationsdateien enthalten Zugangsdaten.

SkyrimNet.yaml: einzige semantische Änderung gegenüber dem Vorgänger ist
dialogue.embedActionsInDialogue=false. OpenRouter.yaml: ausschließlich
Provider-Einstellungen der Variante action_evaluation erweitert: nur Friendli
und Parasail, Reihenfolge Friendli/Parasail, Fallback erlaubt. Andere Routen
erhalten, insbesondere Memory-JSON-Korrektur vom gleichen Datum.
native_action_selector.prompt: persönlicher Overlay der Basisauswahl.
Die vorhandenen GroundedTasks- und ActionValidation-Module aus dem früheren
Ergänzungspaket werden weiterhin benötigt und sind hier nicht dupliziert.

Vor späterer Übernahme komplette Konfigurationssnapshots mit dem dann aktuellen
Zustand vergleichen, damit nachträgliche Nutzeränderungen erhalten bleiben.
Rollback: alten Selector-Inhalt aus rollback/*.before.api.json über die
SkyrimNet-Promptverwaltung zurücksetzen; embedActionsInDialogue wieder true;
nur die vorherigen action_evaluation-Provider-Einstellungen wiederherstellen.
Alte vollständige Config-Snapshots nicht über zwischenzeitliche Änderungen
kopieren. Laufende Konfiguration über SkyrimNets API laden oder Spiel beenden.

13 synthetische Auswahl-/Parameterprüfungen bestanden. Echte Übergabe im Spiel
steht noch aus. Dieser Modus verursacht zusätzliche Modellaufrufe.
'''
    files['README_WIEDERHERSTELLUNG.txt'] = readme.encode('utf-8-sig')
    manifest = [{'path': name, 'bytes': len(data), 'sha256': sha(data)} for name, data in sorted(files.items())]
    files['manifest.json'] = json.dumps(manifest, indent=2).encode('utf8')
    archive = ROOT / 'migration-skyrimnet-separate-actions-20261016.zip'
    with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as out:
        for name, data in files.items():
            out.writestr(name, data)
    with zipfile.ZipFile(archive) as check:
        assert check.testzip() is None
        for item in manifest:
            assert sha(check.read(item['path'])) == item['sha256']
    receipt = {'verified': True, 'archive': str(archive), 'sha256': sha(archive.read_bytes()),
               'entries_verified': len(files), 'base_backup_pointers_unchanged': True}
    (ROOT / 'migration-receipt.json').write_text(json.dumps(receipt, indent=2), encoding='utf8')
    if '--central' in sys.argv:
        assert CENTRAL.parent.is_dir() and not CENTRAL.exists()
        CENTRAL.mkdir()
        for name in [archive.name, 'migration-receipt.json', 'ERGEBNIS.txt']:
            shutil.copy2(ROOT / name, CENTRAL / name)
            assert sha((ROOT / name).read_bytes()) == sha((CENTRAL / name).read_bytes())
        (CENTRAL / 'README_WIEDERHERSTELLUNG.txt').write_text(readme, encoding='utf-8-sig')
        receipt['central_destination'] = str(CENTRAL)
        (ROOT / 'central-backup-receipt.json').write_text(json.dumps(receipt, indent=2), encoding='utf8')
    print(json.dumps(receipt))


if __name__ == '__main__':
    main()
