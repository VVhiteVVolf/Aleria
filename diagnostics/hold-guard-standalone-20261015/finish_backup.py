"""Record the installation and append its verified package to the central backup."""
from pathlib import Path
from datetime import datetime
import hashlib
import json
import shutil

ROOT = Path(__file__).resolve().parent
BASE = Path(r'D:\Nolvus-Backups\Awakening-6.0.20-vor-Update-20260930')
TARGET = BASE / 'updates/20261015-HoldGuard-Huskarl'
receipt = json.loads((ROOT / 'installation.json').read_text(encoding='utf8'))
backup = json.loads((ROOT / 'migration-receipt.json').read_text(encoding='utf8'))
validation = json.loads((ROOT / 'validation.json').read_text(encoding='utf8'))
plan = json.loads((ROOT / 'install-plan.json').read_text(encoding='utf8'))


def digest(path):
    with Path(path).open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


assert BASE.is_dir() and TARGET.resolve().parent == (BASE / 'updates').resolve()
assert digest(backup['archive']) == backup['sha256']
members = '\n'.join(f"- {p['npc']}: {p['hold']}" for p in receipt['recipients'])
orders = '\n'.join(f'- {plugin} steht vor seinem Master {master}'
                   for plugin, master in receipt['preexisting_master_order_exceptions_unchanged'])
report = f'''HOLD GUARD ARMOR SE – HUSKARL-STANDALONE, 15.10.2026

Status: installiert und statisch geprüft; noch kein Ingame-Test.
Profil: {receipt['profile']}
MO2-Mod: {receipt['mod']}
Plugin: {receipt['plugin']} (ESP mit ESL-Flag)

Ergebnis
- 22 neue Rüstungsteile, 44 Herstellungs-/Verbesserungsrezepte.
- Neun regionale Sets mit/ohne bisherigen Stahlschild, ohne Helm verteilt.
- Helme sind separat herstellbar. Im Gegenstandsmenü nach Huskarl suchen.
- 16 gezielt ausgewählte Huskarl-NPC-Basen erhalten passende Fürstentumsfarben.
- Sons of Skyrim und die Ausstattung normaler Wachen bleiben erhalten.
- Keine Original-Rüstungs-, Leveled-List-, NPC- oder Quest-Records überschrieben.
- Die originale Replacer-Datei 1GuarfArmor.esp wurde nicht installiert.
- Die ursprünglichen Wachen-Outfit-/Leveled-List-Änderungen sind nicht übernommen.
- Das neue Standard-Outfit ersetzt Körperrüstung, Handschuhe und Stiefel.
  Weitere alte Outfit-Bestandteile wie einzelne Umhänge werden nicht übernommen;
  ein zuvor im Standard-Outfit enthaltener Stahlschild bleibt erhalten.
- Waffeninventar, NPC-Aussehen, Begleiterverhalten und SkyrimNet sind unberührt.
- Follower-Outfitverwaltung hat weiterhin Vorrang vor dieser SPID-Verteilung.

Empfänger
{members}

Winterhold: Set vorhanden und herstellbar; kein Empfänger in diesen Vanilla-Gruppen.
Quest-Sonderkopien von NPCs werden nicht über breite Namensfilter mitgeändert.

Prüfungen
- 105 eigene neue Records im konservativen ESL-Bereich ab 0x800.
- Kein normaler Plugin-Slot belegt: 252 volle + 3786 Light-Plugins, zwei volle frei.
- {validation['all_form_links_resolved']} eindeutige Form-Verweise aufgelöst.
- {validation['mesh_files_parsed']} NIF-Dateien gelesen, {validation['mesh_texture_references_resolved']} Modell-/Texturpfade aufgelöst.
- Alle originalen Meshes/Texturen bytegenau übernommen; keine Asset-Kollision
  mit bereits aktiven Modordnern.
- Armor-/Addon-Daten semantisch gegen das Original geprüft; bewusst geändert
  sind nur IDs, EditorIDs, Namen und die Verweise auf die neuen IDs.
- Frühe SPID-Datei mit exakt 16 NPC-Basisfiltern vor den bisherigen Outfit-Regeln.
- {receipt['protected_files_verified']} geschützte Profil-/SkyrimNet-Dateien unverändert.
- Keine neuen fehlenden Master oder Reihenfolgeabweichungen durch dieses Mod.

BodySlide/OBody
Das Original enthält keine BodySlide-Projekte und keine Morph-TRIs.
Die gelieferten Modelle behalten ihre feste Körperform; diese Rüstungen folgen
daher nicht automatisch den individuellen OBody-Proportionen. Ein Zero-Slider-
Build ist ohne passende Konvertierung nicht möglich und wurde nicht vorgetäuscht.

Bereits vorher vorhandene Reihenfolgeabweichungen, nicht hier verändert
{orders}
Diese vier Abweichungen wurden im ursprünglichen Profil vor der Änderung
identisch vorgefunden und sind getrennt von dieser neuen Standalone-Erweiterung.

Ingame-Prüfung
Nach dem Start z.B. Lydia oder Irileth ansehen. Hat ein Follower-Manager bereits
ein eigenes Outfit gesetzt, dessen Standard-Outfit-Funktion verwenden; SPID
überschreibt absichtlich keine solche persönliche Outfit-Zuweisung.
Nicht recycleactor oder resetinventory zum Erzwingen verwenden.
Statische Dateiprüfungen ersetzen keinen Start-/Darstellungs-/Gameplaytest.

Sicherung
{backup['archive']}
SHA256: {backup['sha256']}
Enthält den vollständigen privaten Mod, Originaldownload, Konvertierungsquellen
und Profilreferenzen. Kein vollständiges Nolvus- oder Spielstandsbackup.
Zentrales Zusatzpaket: {TARGET}

Wiederherstellung nach dem bisherigen Nolvus-Backup und dessen Updates:
den Modordner unter instance/MODS/mods übernehmen und das eine ESPFE aktivieren.
SPID 7.2+ vorausgesetzt. Normale Wachenmods nicht deaktivieren.
Die enthaltenen kompletten Profildateien sind NUR Referenzen; nicht blind über
die Profildateien einer neuen Nolvus-Version schreiben.
Vor dem Entfernen des Plugins zu einem Save vor dessen Installation zurückkehren.
Die bisherige zentrale LATEST_BACKUP-/Restore-Kette wurde nicht verändert.

Quelle Originalmod: https://www.nexusmods.com/skyrimspecialedition/mods/195445
SPID: https://www.nexusmods.com/skyrimspecialedition/articles/10421
'''
(ROOT / 'INSTALLATIONSBERICHT.txt').write_text(report, encoding='utf-8-sig')
TARGET.mkdir(parents=True, exist_ok=True)
files = [Path(backup['archive']), ROOT / 'migration-receipt.json', ROOT / 'installation.json',
         ROOT / 'validation.json', ROOT / 'INSTALLATIONSBERICHT.txt',
         Path(plan['package']) / 'README_HUSKARL.txt']
copied = []
for source in files:
    target = TARGET / source.name
    expected = digest(source)
    if target.exists():
        assert digest(target) == expected, 'Refusing to overwrite a different backup file'
    else: shutil.copy2(source, target)
    assert digest(target) == expected
    copied.append({'name': source.name, 'sha256': expected, 'bytes': target.stat().st_size})
result = {'status': 'COMPLETE_VERIFIED', 'destination': str(TARGET),
          'archive_sha256': backup['sha256'], 'files': copied,
          'base_backup_pointers_unchanged': True, 'game_tested': False}
serialized = json.dumps(result, indent=2)
(TARGET / 'COMPLETE.json').write_text(serialized, encoding='utf8')
(ROOT / 'central-backup-receipt.json').write_text(serialized, encoding='utf8')
print(json.dumps({'status': result['status'], 'destination': str(TARGET)}, indent=2))
