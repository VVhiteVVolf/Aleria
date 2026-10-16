"""Create the user-facing installation inventory from validated receipts."""
from pathlib import Path
import configparser
import json

OUT = Path(__file__).parent


def main():
    plan = json.loads((OUT / 'deployment-plan.json').read_text(encoding='utf-8'))
    build = json.loads((OUT / 'build-validation.json').read_text(encoding='utf-8'))
    result = json.loads((OUT / 'deployment-result.json').read_text(encoding='utf-8'))
    validation = json.loads((OUT / 'installation-validation.json').read_text(encoding='utf-8'))
    extraction = json.loads((OUT / 'extraction.json').read_text(encoding='utf-8'))
    catalog = json.loads((OUT / 'catalog.json').read_text(encoding='utf-8'))
    lines = [
        '# Installation aus D:\\New Skyrim Downloads – 6. Oktober 2026', '',
        f"Aktives Profil: **{plan['profile']}**. Installiert und aktiviert: **56 Modordner, 47 neue Plugins**. "
        'Die Auswahl steht unter dem MO2-Trenner **New Downloads 20261006**.', '',
        '## Ergebnis und Grenzen', '',
        '- 998 BodySlide-Projekte tatsächlich gebaut, mit Nullwerten für sichtbare Formregler und aktivierten Morphs. '
        '993 Ausgaben enthalten nutzbare Morphs; fünf starre Zubehörteile brauchen beziehungsweise enthalten keine verformbaren Morphs.',
        '- Neues Ausgabemod: `Local - New Downloads OBody Output 20261006`. Dieses gewinnt gegenüber älteren Outfit-Ausgaben. '
        'Die sechs bisherigen Körper-/Hand-/Fußmodelle und deren gewinnende Dateien bleiben erhalten.',
        '- 2.598 Rüstungs-Modellverweise aufgelöst; 3.102 neue NIF-Dateien gelesen und 29.317 Texturverweise geprüft. '
        'Nach den Ergänzungen fehlt keine Diffuse-Textur in den geprüften neuen Rüstungs- und FaceGen-Modellen.',
        '- Sämtliche aktiven Plugin-Master sind vorhanden und stehen vor ihren abhängigen Plugins. '
        '252 normale und 3.762 Light-Plugins einschließlich automatisch geladener Hauptspiel-/Creation-Club-Dateien: '
        'noch zwei normale Slots bis zur Grenze von 254.',
        f"- {result['protected_files_unchanged']:,} bestehende Dateien aus SkyrimNet, Prompts, Kompatibilitätsmodulen, OBody und Spielständen "
        f"vor der Aktivierung per SHA-256 unverändert bestätigt; {validation['saves']} ESS-Dateien im aktuellen Profil erhalten.",
        '- Kein neuer Spielstart und kein Test mit einem Spielstand durchgeführt. Die Prüfungen betreffen Dateien, '
        'Builds, Ressourcen und Plugin-Reihenfolge; die Darstellung und das Verhalten im laufenden Spiel bleiben zu testen.',
        '- Die vorhandenen Animationserzeugnisse und der SkyrimNet-Wheel-Fix wurden nicht ersetzt. '
        'Die neue Mining-/Draugr-Auswahl enthält vorhandene Animationersetzungen, keine neu zu generierenden Behavior-Patches.', '',
        '## Installierte Auswahl', '',
        '| MO2-Modordner | Archiv | BodySlide-Quellen / Hinweis |',
        '| --- | --- | --- |',
    ]
    for mod in plan['mods']:
        base = Path(mod['directory'])
        has_sources = any(base.rglob('*.osp'))
        note = 'BodySlide-Quellen installiert; kompatible Projekte gebaut' if has_sources else 'Keine BodySlide-Projekte im Paket'
        if mod['index'] == 99:
            note = 'Verifizierte Builds, Texturpfad-Ergänzungen sowie Local-New-Zero-Presets und Buildgruppen'
        if mod['index'] == 40:
            note = 'Nur weibliche 3BA-Konvertierung; bestehende neuere Hauptversion 1.3 und HIMBO erhalten'
        if mod['index'] in (1, 2, 8, 9, 10, 11, 25, 44, 49, 72):
            note = 'Kreaturen-/Animationsersetzung; kein BodySlide-Build erforderlich'
        lines.append(f"| {mod['name']} | {mod['archive']} | {note} |")
    lines += ['', '## Ersetzte beziehungsweise deaktivierte bisherige Auswahl', '']
    lines += ['- `' + name + '`' for name in plan['disabled_mods']]
    lines += [
        '', 'Das alte `GoTDragonsEnemy.esp` wurde deaktiviert. Der neue Drachen-Replacer gewinnt bei seinen '
        'abgedeckten Modellen; eigenständige Drachenmodelle anderer Mods werden dadurch nicht zwangsläufig ersetzt. '
        'Übrige bestehende Kreaturen-Texturmods sind erhalten und werden nur dort überlagert, wo die neue Auswahl dieselben Dateien liefert.', '',
        'Bei 3DNPC werden 15 vom Autor enthaltene visuelle Vorlagen über SkyPatcher angewendet. '
        'Andere NPCs behalten die bisherige Erscheinungsintegration. Die vorhandene NPC-Integration wird nicht pauschal deaktiviert, '
        'weil sie auch nicht betroffene NPCs und Gameplay-Daten schützt.', '',
        '## Bewusst ausgelassen', '',
        '- **Dwemer Research Squad**: auf deinen Wunsch ausgelassen; Download v1.00 enthält BHUNP-Projekte und ist die alte, '
        'laut Autor noch absturzanfällige Version.',
        '- **Brutal Ravager** und **Harvester**: auf deinen Wunsch ausgelassen; ausschließlich BHUNP-BodySlide-Projekte, '
        'keine passenden 3BA-Konvertierungen oder fertigen tragbaren Modelle vorhanden.',
        '- **Somewhere in Between**: nicht installiert. Deine Auswahl **CBBE 3BA Vanilla Outfits Redone – Default 5.5.1** gewinnt.',
        '- Die doppelte Default-5.5.1-Datei sowie alternative CBBE-/Standalone-/Nicht-Precision-Pakete wurden nicht parallel installiert.', '',
        '| Übersprungenes Archiv | Grund |', '| --- | --- |',
    ]
    for entry in extraction['skipped']:
        filename = entry['archive']
        if 'Somewhere' in filename:
            reason = 'Alternative zu deiner gewählten Default-Optik'
        elif '(1)' in filename and 'Redone' in filename:
            reason = 'Identischer doppelter Download'
        elif any(word in filename for word in ('Standalone', 'Precision')):
            reason = 'Alternative Paketvariante; passende Replacer-/Precision-Version gewählt'
        else:
            reason = 'Bereits gleiche/neuere Version beziehungsweise passende 3BA-Version vorhanden, oder alternative Paketvariante'
        lines.append(f'| {filename} | {reason} |')
    for held in plan['held']:
        lines.append(f"| {catalog['archives'][held['index']]['filename']} | Auf deinen Wunsch ausgelassen |")
    lines += [
        '', '## Gezielte Kompatibilitätsanpassungen', '',
        '1. **Adrienne:** Den mitgelieferten NPC-Override in eine eigenständige Erscheinungsvorlage umgebaut; '
        'SkyPatcher überträgt ihr Aussehen auf Adrianne. Factions, KI, Quests und andere Gameplay-Daten des echten NPCs bleiben bei der bestehenden Integration.',
        '2. **Fashions of Forsworn:** Zwölf direkte NPC-Overrides aus dem neuen Plugin entfernt. Ihre Outfit-Zuweisungen '
        'werden stattdessen gezielt über SkyPatcher vorgenommen; Madmen-/Nolvus-Gameplay der NPCs bleibt erhalten.',
        '3. **Traveler’s Romper:** Falschen UBE-Pfad des weiblichen Ego-Modells auf das vorhandene 3BA-Modell korrigiert.',
        '4. **BodySlide:** Einen falschen OSD-Quellordner im Redone-Ego-Projekt korrigiert. 422 veraltete BODYTRI-Verweise '
        'in den erzeugten NIFs auf ihre tatsächlichen TRI-Ausgaben normalisiert; Geometrie-/Datenblöcke dabei unverändert.',
        '5. **Texturen:** 17 zusätzliche Dateipfade als Kopien der passenden bereits mitgelieferten Texturen bereitgestellt: '
        'unter anderem Schreibfehler bei Cimmerian/Common, EyeGrey, Hairline, FullMoon/Necromancer und fehlende BakaUNP-Kanalpfade. '
        'Der alte Dragonbone-Barbarian-Normalmappfad erhält die bestehende BnP-Körpernormalmap. Keine vorhandene Hauttextur ersetzt.',
        '6. **Autoren-Patches:** Savior’s Hide mit passendem ZIA-Patch und CBBE/3BA-/HIMBO-Physics-Konvertierungen; '
        'Wine Duchess mit Xtudo-Fixes; Akaviri Dragonguard mit nachgereichter Hauptdatei und HDT-Patch; '
        'Ancient Imperial mit mitgelieferter ESL-Option. Keine bestehende Mod nachträglich kompaktifiziert.',
        '7. **Bestehende Reihenfolge:** `Twisted NPC Body Paths Fix.esp` stand vor seinem eigenen Master '
        '`Twisted NPC Appearance Integration.esp`. Nur diesen abhängigen Patch direkt hinter den Master verschoben.', '',
        'Diese Änderungen sind lokal und in den JSON-Belegen dokumentiert. Die ursprünglichen Downloads wurden nicht verändert.', '',
        '## BodySlide und OBody', '',
        'Die expliziten Gruppen `Local New Outfits female` / `Local New Outfits male` und die Null-Presets '
        '`Local New Zero` wurden mit der Ausgabe installiert. BodySlide schreibt künftig in das neue Ausgabemod. '
        'Zukünftige Builds über MO2 ausführen, damit sämtliche Quellen sichtbar sind. Die sechs Kernkörper nicht blind neu bauen.', '',
        'Auswahlregeln: je Ausgabepfad nur eine passende Variante; versteckte Konvertierungsregler und erforderliche Autoren-Zaps '
        'beibehalten; sichtbare Körperformregler bei Gewicht 0 und 100 auf null. Physics-/HIMBO-Varianten gewählt, wo vorhanden.', '',
        'Starre Ausnahmen:', '',
    ]
    lines += ['- `' + name + '`' for name in build['rigid_accessories']]
    lines += [
        '', 'Fertige Outfits ohne BodySlide-Projekte erhalten keinen erfundenen Morph-Build. Bei ihnen sind automatische '
        'OBody-Anpassung und 3BA-Physik nicht zugesichert. Dazu gehören unter anderem Ancient Imperial, Dragonbone Barbarian, '
        'Eve’s Sunfire, HeadHunter, Hedge Knight, Rugged Crusader, Thalmor Emissary und Akaviri Dragonguard. '
        'CBBE-only-Konvertierungen sind mit der weiblichen Körpergrundlage kompatibel, enthalten aber nicht automatisch volle 3BA-Physik.', '',
        'Der breite NIF-Scan enthält auch unbenutzte Quellmodelle und optionale Shader-Verweise. Einige davon verweisen weiterhin '
        'auf nicht mitgelieferte Ressourcen. Sie sind in `installation-validation.json` vollständig gelistet. '
        'Das ist kein Nachweis sichtbarer Fehler: mehrere Modelle werden nicht vom Plugin verwendet; Textursets können im Plugin '
        'ersetzt werden. In den neuen ARMA-/FaceGen-Modellen bleibt insbesondere ein `_n`-Platzhalter ohne Diffuse-Textur '
        'beim Lunarclaw-Zubehör sowie optionale Masken/Cubemaps zu prüfen, falls im Spiel ein entsprechendes Darstellungsproblem auffällt.', '',
        '## Sicherung und Rücknahme', '',
        'Profildateien, MO2-Konfiguration und ursprüngliche BodySlide-Konfiguration: Unterordner `before` dieses Berichts. '
        'Alle neuen Ordner besitzen `meta.ini` und `installation-receipt.json`; Datei-SHA-256 stehen in `deployed-file-manifest.json`.', '',
        'Aktualisiertes kumulatives Migrationsbackup: '
        '`D:\\Nolvus-Backups\\Awakening-6.0.20-vor-Update-20260930\\updates\\20261006-New-Downloads`. '
        'Die verbindliche erfolgreiche Prüfung zeigt dort `COMPLETE.json`; der Backup-Wurzelzeiger `LATEST_BACKUP.json` '
        'wird erst nach Prüfung und Wiederherstellungstest aktualisiert.', '',
        'Bei einer Rücknahme Skyrim und MO2 schließen; die drei gesicherten Profillisten und die alte BodySlide-Config zurückspielen. '
        'Neue Modordner bleiben dann zunächst inaktiv erhalten. Niemals pauschal einen alten Profilstand über eine inzwischen '
        'weiter veränderte Installation schreiben.', '',
    ]
    (OUT / 'INSTALLATIONSBERICHT.md').write_text('\n'.join(lines), encoding='utf-8')
    print('Wrote INSTALLATIONSBERICHT.md')


if __name__ == '__main__':
    main()
