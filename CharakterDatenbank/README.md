# Aleria-Charakterdatenbank

Dieser bestehende Such- und Importbereich ist die versionierbare Langzeitablage der Almanach-Figuren. Er bleibt bewusst von einem späteren Ordner `Charaktere/` für vollständig ausgearbeitete Steckbriefe und Biografien getrennt. Jede Figur besitzt genau einen eigenen Datensatz unter `records/`. Die Ordner werden primär nach Familie, danach nach Gruppe, Ort oder `unzugeordnet` gegliedert.

## Quellen und Priorität

1. `record.character` enthält den letzten aus dem Almanach exportierten dauerhaften Charakterstand.
2. `record.identity`, `classification` und `links` verbinden den Datensatz stabil mit Firestore und – sofern eindeutig – mit einer Weltperson im Stammbaum.
3. Firestore bleibt die Laufzeitquelle für Online-Bearbeitungen und veränderliche Spielwerte. Beim Laden gewinnt die Online-Fassung. Fehlende Identitäts- und Stammbaumdaten werden aus dieser Datenbank ergänzt.
4. GitHub ist kein Laufzeit-Datenspeicher für Trefferpunkte oder laufende Szenen. Neue Online-Stände werden bewusst über einen frischen Archivexport zurück in die Datenbank übernommen. Dadurch bleiben Änderungen überprüfbar und Git-Zusammenführungen nachvollziehbar.

## Struktur

```text
CharakterDatenbank/
  records/
    familien/<familie>/<figur>/character.json
    gruppen/<gruppe>/<figur>/character.json
    orte/<ort>/<figur>/character.json
    unzugeordnet/unassigned/<figur>/character.json
  generated/
    characters.snapshot.json
    sync-report.json
  lib/
  schema/
  scripts/
  registry.json
```

`registry.json` ist der kleine Such- und Verknüpfungsindex. `generated/characters.snapshot.json` ist die gebündelte Lesefassung für den Almanach, damit der Browser nicht für jede Figur eine einzelne Anfrage ausführen muss. In jeder `character.json` bleibt der Bereich `local` bei späteren Synchronisationen erhalten; dort gehören lokale Notizen, Referenzen und künftige manuelle Zuordnungsentscheidungen hin. Der Bereich `character` wird dagegen aus dem jeweils neuen Almanach-Export aktualisiert.

## Synchronisieren

Einen vollständigen Archivexport in `Charakter Archiv Exporte/` ablegen und im Repository-Stamm ausführen:

```powershell
node CharakterDatenbank/scripts/sync-character-archive.mjs
```

Ohne `--source` wird der zuletzt geänderte Archivexport verwendet. Eine bestimmte Datei kann explizit angegeben werden:

```powershell
node CharakterDatenbank/scripts/sync-character-archive.mjs --source "Charakter Archiv Exporte/aleria-charakterarchiv-....json"
```

Für CI und Prüfungen verändert `--check` keine Dateien und meldet veraltete Ergebnisse:

```powershell
node CharakterDatenbank/scripts/sync-character-archive.mjs --check
```

Der Sync entfernt ausschließlich veraltete `character.json`-Dateien, die eindeutig das Schema `aleria.character-record` tragen und nicht mehr im neu erzeugten Register vorkommen. Fremde Dateien werden nicht angerührt. `generated/sync-report.json` listet offene Stammbaumzuordnungen, Mehrdeutigkeiten und mehrere Firestore-Datensätze derselben Weltperson.

## Konfliktregel

- Online gewinnt bei bearbeitbaren Profil- und Kampfwerten.
- Eine vorhandene `worldPersonId` wird nie durch bloße Namensähnlichkeit ersetzt.
- Gleichnamige Exportdatensätze werden als dieselbe Person zusammengeführt. Nur ein tatsächlich widersprechendes Geburtsjahr oder Alter trennt zwei Personenakten. Sämtliche ursprünglichen Firestore-Dokument-IDs bleiben als Quellenverweise erhalten.
- Automatische Stammbaumverknüpfungen benötigen einen eindeutigen vollständigen Namen. Einname-Figuren wie „Agnes“ bleiben zur manuellen Prüfung vorgemerkt.
- Mehrere Familienprojektionen derselben Weltperson werden als Links erhalten; die Heimatfamilie wird als primäre Ablage bevorzugt.
- GitHub-Zugriffstoken gehören niemals in den Browser. Ein späterer automatischer Rückkanal sollte über eine authentifizierte Serverfunktion oder eine kontrollierte GitHub-Action erfolgen.

## Firestore

Die Datenbankoberfläche liest dieselbe Collection `characters` wie der Almanach und führt sie im Browser anhand der stabilen Dokument-ID mit dem lokalen Snapshot zusammen. Die ältere Prototyp-Collection `characterDatabase` wird nicht mehr beschrieben; zwei parallele Online-Wahrheiten würden sonst zwangsläufig auseinanderlaufen.
