"""Verify the final live state and preserve a minimal migration supplement."""
from pathlib import Path
from urllib.parse import urlencode
import copy
import hashlib
import json
import shutil
import sys
import zipfile

from repair_content_and_memory import ROOT, RUNTIME, COMPAT, MANIFEST_REL, REL, digest
from local_api import request

CENTRAL = Path(r'D:\Nolvus-Backups\Awakening-6.0.20-vor-Update-20260930\updates\20261016-SkyrimNet-MemoryJSON-Navigator')


def main():
    before = json.loads((ROOT / 'OpenRouter.before.api.json').read_text(encoding='utf8'))
    after = request('/config?api=get&name=OpenRouter')['data']
    expected = json.loads((ROOT / 'OpenRouter.final.api.json').read_text(encoding='utf8'))
    assert after == expected
    control = copy.deepcopy(after)
    control['openrouter']['variants']['memory'] = before['openrouter']['variants']['memory']
    assert control == before
    prompt = request('/prompts?' + urlencode({'api': 'get', 'path': REL}))
    assert prompt['validation']['isValid'] and not prompt['validation'].get('errors')
    assert prompt['content'].replace('\r\n', '\n') == (ROOT / 'generate_memory.staged.prompt').read_text(encoding='utf8').replace('\r\n', '\n')
    nav = request('/prompts?' + urlencode({'api': 'get', 'path': 'ostimnet_generate_scene_description.prompt'}))
    assert nav['provenance']['winner']['pluginId'] == 'tetherball88.ostimnavigator'
    old_nav = COMPAT / 'SKSE/Plugins/SkyrimNet/external/local.navigator-content/prompts/ostimnet_generate_scene_description.prompt'
    assert nav['content'].replace('\r\n', '\n') == old_nav.read_text(encoding='utf-8-sig').replace('\r\n', '\n')
    plan = json.loads((ROOT / 'repair-plan.json').read_text(encoding='utf8'))
    for rel, sha in plan['unchanged'].items():
        assert digest((RUNTIME / rel).read_bytes()) == sha
    log = Path(r'C:\Users\fhg_r\OneDrive\Dokumente\My Games\Skyrim Special Edition\SKSE\SkyrimNet.log').read_text(encoding='utf-8-sig', errors='replace')
    lines = [x for x in log.splitlines() if ('tetherball88.ostimnavigator' in x or 'Boot complete:' in x or 'Boot report:' in x)]
    assert any('tetherball88.ostimnavigator:' in x and '0 issues' in x for x in lines)
    assert any('0 rejected' in x for x in lines)
    (ROOT / 'navigator-reload-verification.txt').write_text('\n'.join(lines), encoding='utf8')
    direct = json.loads((ROOT / 'memory-json-tests-direct.json').read_text(encoding='utf8'))
    runtime = json.loads((ROOT / 'memory-json-tests.json').read_text(encoding='utf8'))
    assert len(direct) == 3 and len(runtime) == 1 and all(r['pass'] for r in direct + runtime)
    report = {'status': 'VERIFIED', 'memory_model': after['openrouter']['variants']['memory']['model_name'],
              'direct_tests_passed': 3, 'runtime_test_passed': 1, 'navigator_layers_rejected': 0,
              'dialogue_and_actions_unchanged': True, 'normal_memory_cycle_tested': False,
              'navigator_provenance': nav['provenance'], 'memory_provenance': prompt['provenance']}
    (ROOT / 'final-verification.json').write_text(json.dumps(report, indent=2), encoding='utf8')
    files = {}
    runtime_prefix = 'instance/MODS/mods/' + RUNTIME.parents[2].name + '/SKSE/Plugins/SkyrimNet/'
    files[runtime_prefix + 'config/OpenRouter.yaml'] = (RUNTIME / 'config/OpenRouter.yaml').read_bytes()
    files[runtime_prefix + 'overlay/prompts/' + REL] = (RUNTIME / 'overlay/prompts' / REL).read_bytes()
    files['instance/MODS/mods/' + COMPAT.name + '/' + MANIFEST_REL.as_posix()] = (COMPAT / MANIFEST_REL).read_bytes()
    files['rollback/OpenRouter.yaml'] = (ROOT / 'backup/OpenRouter.yaml').read_bytes()
    files['rollback/generate_memory.base-original.prompt'] = (ROOT / 'generate_memory.before.prompt').read_bytes()
    for name in ('ERGEBNIS.txt', 'final-verification.json', 'repair-plan.json', 'navigator-reload-verification.txt'):
        files['evidence/' + name] = (ROOT / name).read_bytes()
    readme = '''SkyrimNet: Memory-JSON und Navigator-Manifest, 16.10.2026

Zusatz zur vorhandenen Nolvus-Sicherung, nach Beta27 und GroundedActions anwenden.
Kein vollständiges Mod- oder Spielstandsbackup. Zugangsdaten enthalten: privat halten.
Die drei Dateien unter instance/MODS/mods ergänzen die vorhandenen aktiven Mods.
OpenRouter.yaml ist ein Gesamtsnapshot; mit späteren Einstellungen abgleichen.
Beabsichtigte neue Modelländerung betrifft ausschließlich memory: unverändertes
Qwen-Modell, Temperatur 0.2 und JSON-Schema über modellbezogene Provider-Einstellungen.
Dialog- und Aktionsrouten sowie persönliche World-/Dialogprompts bleiben erhalten.
Navigator erhält nur eine Manifest-Brücke im bestehenden Kompatibilitätsmod.
Bei Übernahme MO2/Skyrim regulär schließen; keine komplette alte Ladereihenfolge
über ein neues Nolvus schreiben. Dieser Zusatz braucht keine neuen ESP-Slots.

rollback/ enthält die vorherige Konfiguration und den ursprünglichen Basis-Memory-
Prompt als Referenz. Der Memory-Overlay und die Manifest-Ergänzung waren vorher
nicht vorhanden. Nur bei gewünschtem Rollback diese eigenen Ergänzungen entfernen;
keine anderen Dateien löschen. Basisbackup-Zeiger wurden nicht verändert.
'''
    files['README_WIEDERHERSTELLUNG.txt'] = readme.encode('utf-8-sig')
    manifest = [{'path': name, 'sha256': digest(data), 'bytes': len(data)} for name, data in sorted(files.items())]
    files['manifest.json'] = json.dumps(manifest, indent=2).encode('utf8')
    archive = ROOT / 'migration-memory-json-navigator-20261016.zip'
    with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as out:
        for name, data in files.items():
            out.writestr(name, data)
    with zipfile.ZipFile(archive) as check:
        assert check.testzip() is None
        for row in manifest:
            assert digest(check.read(row['path'])) == row['sha256']
    assert CENTRAL.parent.is_dir() and CENTRAL.resolve().parent == CENTRAL.parent.resolve()
    CENTRAL.mkdir(exist_ok=False)
    shutil.copy2(archive, CENTRAL / archive.name)
    assert digest(archive.read_bytes()) == digest((CENTRAL / archive.name).read_bytes())
    (CENTRAL / 'README_WIEDERHERSTELLUNG.txt').write_text(readme, encoding='utf-8-sig')
    shutil.copy2(ROOT / 'ERGEBNIS.txt', CENTRAL / 'ERGEBNIS.txt')
    receipt = {'status': 'COMPLETE_VERIFIED', 'archive_sha256': digest(archive.read_bytes()),
               'files_verified': len(manifest), 'central_destination': str(CENTRAL),
               'base_backup_pointers_unchanged': True}
    (ROOT / 'central-backup-receipt.json').write_text(json.dumps(receipt, indent=2), encoding='utf8')
    (CENTRAL / 'COMPLETE.json').write_text(json.dumps(receipt, indent=2), encoding='utf8')
    print(json.dumps({**receipt, 'direct_memory_tests': 3, 'live_api_memory_tests': 1, 'navigator_rejected': 0}))


if __name__ == '__main__':
    main()
