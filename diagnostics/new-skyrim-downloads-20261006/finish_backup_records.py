"""Publish readable UTF-8 migration instructions and final cleanup receipts."""
from pathlib import Path
import hashlib
import json
import shutil

OUT = Path(__file__).parent


def sha(path):
    with path.open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


def main():
    target = Path(json.loads((OUT / 'migration-plan.json').read_text())['backup_root'])
    root = target.parent.parent
    pointer = json.loads((root / 'LATEST_BACKUP.json').read_text(encoding='utf-8'))
    assert root / pointer['supplement'] == target
    complete = json.loads((target / 'COMPLETE.json').read_text(encoding='utf-8'))
    assert complete['status'] == 'VERIFIED'
    cleanup = json.loads((OUT / 'temporary-cleanup-result.json').read_text())
    assert cleanup['completed']
    report = OUT / 'INSTALLATIONSBERICHT.md'
    text = report.read_text(encoding='utf-8')
    if '## Abschließende Bereinigung' not in text:
        text += '\n## Abschließende Bereinigung\n\n'
        text += ('Die fünf temporären Arbeitsordner dieser Installation wurden nach erfolgreicher Sicherung entfernt; '
                 'insgesamt **56,48 GiB** freigegeben. Originaldownloads, installierte Mods und Diagnosebelege bleiben erhalten. '
                 'Skripte mit historischen Staging-Pfaden dienen als Arbeitsbeleg und können nach dieser Bereinigung '
                 'nicht ohne erneutes Extrahieren der Originaldownloads ausgeführt werden.\n')
        report.write_text(text, encoding='utf-8')
    for name in ('INSTALLATIONSBERICHT.md', 'MIGRATIONSANLEITUNG.md',
                 'world-headpart-validation.json', 'temporary-cleanup-result.json'):
        destination = target / 'installation-records' / name
        shutil.copy2(OUT / name, destination)
        assert sha(OUT / name) == sha(destination)
        complete['control_sha256']['installation-records/' + name] = sha(destination)
    documentation = root / '00_AKTUELLE_WIEDERHERSTELLUNG.md'
    shutil.copy2(OUT / 'MIGRATIONSANLEITUNG.md', documentation)
    assert sha(documentation) == sha(OUT / 'MIGRATIONSANLEITUNG.md')
    temporary = target / 'COMPLETE.final.tmp'
    temporary.write_text(json.dumps(complete, ensure_ascii=False, indent=2), encoding='utf-8')
    temporary.replace(target / 'COMPLETE.json')
    print(json.dumps({'backup_status': 'VERIFIED', 'documentation_utf8': True,
                      'temporary_GiB_reclaimed': round(cleanup['bytes'] / 2**30, 2)}, indent=2))


if __name__ == '__main__':
    main()
