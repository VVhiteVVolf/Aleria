"""Produce a readable audit report and verify the profile stayed unchanged."""
from pathlib import Path
import hashlib
import json

ROOT = Path(__file__).parent
inventory = json.loads((ROOT / 'inventory.json').read_text())
details = json.loads((ROOT / 'full-plugin-analysis.json').read_text())
runtime = json.loads((ROOT / 'runtime-last-snapshot.json').read_text())
presets = json.loads((ROOT / 'preset-references.json').read_text())
profile = Path(inventory['profile_directory'])
for filename, expected in inventory['fingerprint'].items():
    if hashlib.sha256((profile / filename).read_bytes()).hexdigest() != expected:
        raise RuntimeError('Profile changed during audit; run the audit again')

rows = {row['plugin'].lower(): row for row in details}
last_names = {name.lower() for slot, name in runtime['plugins']}
runtime_full = sum(':' not in slot for slot, name in runtime['plugins'])
runtime_light = sum(':' in slot for slot, name in runtime['plugins'])
added = [row for row in inventory['plugins'] if row['plugin'].lower() not in last_names]

optional = [
    ('VeronicaFollower.esp', 'Erster Kandidat, wenn Veronica nicht gespielt wird. Normaler Slot; entspricht nicht der bisherigen Vorgabe, neue Follower nur ohne normale Slots zu aktivieren.'),
    ('QwibNewLanterns.esp', 'Tragbare Laternen. Quick Light ist ebenfalls aktiv. Optional, wenn dessen Licht genügt; keine vollständige Funktionsgleichheit.'),
    ('WetFunction.esp', 'Dynamischer Haut-/Nässeglanz. Passt zum früheren Wunsch nach weniger öliger Haut; nur entbehrlich, wenn dieser Effekt nicht gewünscht ist.'),
    ('SkyrimsGotTalent-Bards.esp', 'Spieler-Bardenfortschritt und Musizieren. Entbehrlich, wenn keiner der im Profil gespielten Charaktere dieses System benutzt. Entfernt nicht pauschal alle Vanilla-Barden.'),
    ('HotKeySkill.esp', 'Separates Hot-Key-Skill-System. Nur streichen, wenn seine Fähigkeiten/Tasten nicht verwendet werden. Nicht mit Hotkey Atlas verwechseln.'),
    ('DragonbornShoutPerks.esp', 'Zusätzlicher Schrei-Fertigkeitsbaum. Optional, wenn keiner der Charaktere im Profil ihn nutzt.'),
    ('ODrunkredux.esp', 'Zusätzliche ODrunk-Funktion. Optional, falls dieses Feature nicht benutzt wird; OStim-Abhängigkeiten vor Deinstallation prüfen.'),
    ('DragonboneBarbarianArmor.esp', 'Ein einzelnes zusätzliches Rüstungspaket. 1 voller Slot; nur streichen, wenn seine Outfits nicht in Gebrauch sind.'),
    ('[FB] Sentinel Knight.esp', 'Einzelnes Rüstungspaket mit Waffe. 1 voller Slot; nur streichen, wenn nicht genutzt.'),
    ('[Zynx][MTM] TavernClothes.esp', 'Zusätzliche Kleidung. 1 voller Slot; nur streichen, wenn nicht genutzt.'),
]

lines = [
    'SKYRIM / NOLVUS – PLUGIN-PRÜFBERICHT',
    'Stand: 14. Oktober 2026, Europe/Berlin',
    f'Profil: {inventory["profile"]}', '',
    '1. AKTUELL GESPEICHERTES PROFIL',
    f'Aktive Mod-Ordner: {inventory["active_mods"]}',
    f'Aktive Plugins insgesamt: {inventory["total_plugins"]}',
    f'Normale Plugins: {inventory["full_plugins"]} / 254 (1 über der Grenze)',
    f'Light-Plugins: {inventory["light_plugins"]} / 4096 (308 freie Light-Plätze)',
    'Gezählt anhand der tatsächlichen TES4-Headerflags, nicht anhand der Dateiendung.',
    'Basis-ESMs und automatisch geladene Creation-Club-Plugins sind berücksichtigt.',
    'Keine fehlenden Master unter den erfassten aktiven Plugins.', '',
    '2. ABGLEICH MIT DEM LETZTEN SKSE-SPIELSTANDPROTOKOLL',
    f'Letzter protokollierter Stand: {runtime_full} normale + {runtime_light} Light = {len(runtime["plugins"])} Plugins.',
    'Log zuletzt geändert am 14.10.2026 um ca. 01:48 Uhr. Das ist ein historischer Stand, keine Live-Sitzungsabfrage.',
    'Im aktuellen Profil zusätzlich gegenüber diesem Stand:',
]
for row in added:
    lines.append(f'  {row["plugin"]}: {"Light" if row["light"] else "normal"}, {row["mod"]}')
lines += [
    'VeronicaFollower.esp und [dint999] HairPack02.esp verbrauchen die zwei zusätzlich aktivierten normalen Slots.',
    'TAL_ThalmorStart.esp ist Light und verursacht den normalen Slotengpass nicht.', '',
    '3. SLOTS SPAREN, OHNE INHALTE ZU ENTFERNEN',
    'Erste technische Prüfkandidaten für ein ESL-Flag ohne FormID-Kompaktierung:',
    '  XPMSE.esp: 11 vorhandene Skyrim-GMST-Overrides, keine eigenen neuen FormIDs, keine Master-abhängigen Plugins.',
    '  SPERG - ZIA Patch.esp: 5 vorhandene SPEL/FLST-Overrides, keine eigenen neuen FormIDs, keine Master-abhängigen Plugins.',
    'Beide sind wirksam und sollen nicht als angeblich nutzlos entfernt werden.',
    'Ein ESL-Flag erhält Namen und Inhalte; die strukturelle Prüfung ist noch keine abgeschlossene xEdit-/Spielvalidierung.',
    'Nach Umstellung beider: 253 normale / 3790 Light. Dann 1 normaler Platz frei.',
    'Zusätzlicher struktureller Kandidat: RaceMenuPlugin.esp (1 eigene QUST, ID 0x801, keine neuen CELL/NAVM).',
    'SkyUI_SE.esp und RaceMenu.esp liegen ebenfalls im Zahlenbereich, sind aber zentrale Grundlagen und nicht erste Wahl.',
    'Andere kleine Plugins haben neue IDs außerhalb 0x800–0xFFF. Klein bedeutet daher nicht automatisch ohne Kompaktierung ESL-fähig.',
    'Keine FormIDs bestehender Spielstände ungeprüft neu nummerieren.', '',
    '4. OPTIONAL ENTFERNBARE FEATURES – NUTZUNG MUSS ENTSCHEIDEN',
    'Alle nachstehenden Plugins sparen jeweils genau 1 normalen Slot und haben keine aktiven TES4-Master-Nachfolger.',
    'Dies schließt Laufzeitreferenzen, Scripts, SPID-Dateien, Presets und gespeicherte Gegenstände nicht aus.',
]
for name, reason in optional:
    row = rows[name.lower()]
    lines += [f'  {name}', f'    Mod: {row["mod"]}', f'    Bewertung: {reason}']
lines += [
    '', '5. KOSMETIK NICHT PAUSCHAL ENTFERNEN',
    f'{presets["presets_scanned"]} wirksame RaceMenu-Presetdateien auf explizite Plugin-Namen geprüft.',
    '[dint999] HairPack02.esp: in 4 Presetdateien genannt, deshalb kein guter pauschaler Löschkandidat.',
    '[Dint999] FacePartMod+Mikan_Eyes.esp: in 2 Presetdateien genannt (Astara und Vivienne/Ashe).',
    'FacePartMod-Basis hat 3 abhängige Augen-Addons. Nicht allein ausschalten.',
    'EyesMod3.esp, Kala_Orsimer Eyes.esp, Saeri_Khajiit_Hair.esp und NosPiercedEarsAll.esp haben keine Master-Nachfolger und keine Namensreferenzen in den geprüften Presets.',
    'Das beweist keine Nichtbenutzung: aktuelle Spieler-/NPC-Köpfe und SKSE-CoSaves wurden nicht ausgelesen.', '',
    '6. NICHT ALS SCHNELLE AUFRÄUMKANDIDATEN BEHANDELN',
    'SkyrimNet, SeverActions, IntelEngine, Stances und Attack_DXP: gewünschte oder reparierte Funktionen.',
    'Ordinator, SPERG, Path of Sorcery, Adamant und Vokrii: Teile des eingerichteten Perk-Verbundes, nicht allein wegen ähnlicher Namen Duplikate.',
    'RaceMenu, UIExtensions, FISS und Skeleton-Dateien: auch ohne TES4-Master-Nachfolger wichtige Laufzeitgrundlagen.',
    'LOTD, 3DNPC, Bruma, Lux, Northern Roads, Cloaks und NPC-/Körperintegrationspatches: weitreichende Abhängigkeiten.',
    'Beispiel Cloaks: 28 nachgelagerte Plugins, einschließlich zentraler Nolvus- und Körper-/NPC-Patches. Nicht die komplette Abhängigkeitskette blind deaktivieren.',
    'SunHelm könnte als ganzes Feature 3 normale + 6 Light sparen, hat aber laufende Quest-/Scriptzustände. Nur bei bewusster Abkehr vom Survival-System planen.', '',
    '7. EMPFEHLUNG',
    'Zuerst die beiden reinen Override-Plugins auf eine Flag-only-ESL-Umstellung prüfen.',
    'Zusätzlich Veronica unaktiv lassen, falls nicht gewünscht: mit beiden Umstellungen wären es 252 normale Plugins und 2 freie Plätze.',
    'Danach 2–4 tatsächlich ungenutzte Komfort-/Feature-Plugins auswählen, um mehr Reserve zu schaffen.',
    'Deaktivierung und Löschen getrennt behandeln: Für Slots reicht Deaktivierung; Löschen bringt nur Speicherplatz.',
    'Eine ESP mit ESL-Flag zählt bereits als Light. Ihre Entfernung schafft keinen normalen Slot.',
    'Keine pauschale Zusammenführung oder Kompaktierung des vorhandenen Loadouts.', '',
    '8. PRÜFGRENZEN UND UNVERÄNDERTER ZUSTAND',
    'Es wurde keine Mod gelöscht, deaktiviert, konvertiert oder neu installiert.',
    'Profil-Prüfsummen vor/nach dem Audit stimmen überein.',
    'Geprüft: Pluginflags, Header, Mastergraph, Datensatztypen/FormID-Bereiche der normalen Plugins und ausgewählte Presetreferenzen.',
    'Nicht geprüft: vollständige xEdit-Konfliktauswertung, persönliche Feature-Nutzung, aktuell im RAM geladene Sitzung und Spielstandbereinigung.',
    'Referenz zum Engine-Limit: https://dyndolod.info/Messages/Plugin-Limit', '',
    '9. ALLE NORMALEN PLUGINS',
    'Slots sind aus dem aktuell gespeicherten Profil berechnet; FE ist hier bereits der reservierte Light-Bereich.',
]
for row in details:
    lines.append(f'{row["slot"]} | {row["plugin"]} | {row["mod"]} | Nachfolger: {len(row["dependent_closure"])}')
(ROOT / 'PRUEFBERICHT.txt').write_text('\n'.join(lines) + '\n', encoding='utf-8-sig')
print('Report written. Profile checksums unchanged. No Skyrim/Nolvus mutations.')
