# Tagesansicht und Papierarchiv

Der Kalender hängt in Gwynthor oben rechts am Holzbalken. Die Pfeile blättern
tageweise, ein Klick auf das Datum öffnet den vollständigen Aleria-Kalender.
„Heute“ kehrt zum aktuellen Weltdatum des Almanachs zurück. Auf kleinen
Bildschirmen öffnet zusätzlich „Kalender“ in der Kopfleiste die Datumswahl.
Das Blättern verändert ausschließlich diese Tafelansicht.

Im Bearbeitungsmodus besitzt jeder Aushang das Feld **Aushang sichtbar ab**.
Es gilt für alle Beiblätter dieser Veröffentlichung. Bestehende und neu
angelegte Aushänge beginnen standardmäßig am **9. Lichtkehr 1740**, dem
bestätigten ersten Playtag. Alte Browserentwürfe und frühere Firebase-Importe
erhalten dieses Datum beim Einlesen, ohne Texte, Kommentare oder IDs zu ändern.
Spätere Daten bleiben erhalten. Es gibt 13 Monate mit je 36 Tagen.

## Ablegen und Wiederanheften

- In der Detailansicht: **Abhaken & zusammenknüllen** legt diesen Aushang und
  seine Beiblätter am gewählten Tafeltag ab.
- Im Plakatinspektor: **Plakat zusammenknüllen** legt alle an diesem Nagel
  gegenwärtig sichtbaren Aushänge ab. Andere Nägel bleiben unabhängig.
- Papierknäuel bleiben auf dem Boden und lassen sich im Bearbeitungsmodus
  ziehen. Ab insgesamt drei abgelegten Einheiten kann ein Knäuel auf ein
  anderes gezogen werden. Haufen wechseln bei fünf und zehn Einheiten zum
  nächstgrößeren Bild. Die Anzahl entspricht den abgelegten Einheiten,
  nicht der Zahl ihrer Beiblätter.
- Ein Klick auf einen Haufen öffnet dessen Inhalt; **Papierarchiv** in der
  Kopfleiste öffnet die gesamte Ablage. Suche, Artenfilter und Gruppierung
  nach Aushangdatum, Ablagedatum oder Art stehen auch Lesern zur Verfügung.
- **Wieder anheften** bringt den ursprünglichen Inhalt an seinen bisherigen
  Platz zurück. Die Archivgeschichte bleibt erhalten. Als Alternative zum
  Ziehen gibt es **Papierhaufen bilden**; Knäuel und Haufen können auch mit
  den Pfeiltasten verschoben werden.

Änderungen verwenden dieselben lokalen Entwürfe, Sicherungen, JSON-Exporte und
ausdrücklich ausgelösten Online-Veröffentlichungen wie die bisherige Tafel.

## Erstes erledigtes Gesuch

„Geleit nach Llysfaen gesucht“ von Iorath Melyn hängt seit dem 9. Lichtkehr an
dem Hilfe-Nagel. In den Antworten bietet der Söldner Raban sein Geleit an;
Iorath nimmt an. Am 10. Lichtkehr meldet der Bürger die wohlbehaltene Rückkehr,
bedankt sich ausdrücklich und bestätigt die Bezahlung. Raban quittiert den
Abschluss. Seit diesem Tag liegt das Gesuch als erster Knäuel am Boden.
Am Vortag sind nur die beiden ersten Kommentare sichtbar.

Dieser Anfangsbestand wird einmalig über `archiveEntries` des Autorenpakets
eingelesen. Die vorhandene Aktualisierungskennung hält fest, dass er bekannt
ist. Wiederanheften, Löschen und eigene Datumsänderungen werden beim nächsten
Laden nicht zurückgesetzt. Die beiden Unterzeichner sind kleine Nebenfiguren
des Aushangs; für sie wurden keine erfundenen Stammbäume angelegt.

## Daten und Zuständigkeiten

`assets/js/timeline/` besitzt Datumsregeln, die lokale Ansichtszeit und den
Kalender. `board-world-date-source.mjs` liest das vorhandene Almanach-Dokument
über den gemeinsamen `world-date-read-repository.mjs` und hört auf Änderungen
des bisherigen Browsercaches. Es kann das Weltdatum weder schreiben noch
initialisieren. „Heute folgen“ und ein bewusst ausgewählter anderer Tag sind
getrennte Zustände.

`assets/js/archive/` besitzt Archivmodell, Bodeninteraktion und Archivdialog.
Die bestehenden `state.zettel` bleiben die einzige Quelle für die Inhalte.
`noticeArchive` Version 1 enthält lediglich Einheiten mit `noticeIds`,
`archivedOn`, optionalem `restoredOn`, Position, Bildvariante und optionalem
`pileId`; `piles` enthält die Haufenpositionen. Wiederherstellung erzeugt ein
Enddatum des Archivintervalls. Erneutes Ablegen erzeugt eine weitere Einheit.
Damit hängen die Aushänge in früheren Tagesansichten weiterhin am Brett.

Darstellung, Register, Leser und eingebettete Ortssuche verwenden dieselbe
zeitliche Auswahl. Zukünftige, archivierte oder geheime Aushänge werden nicht
über einen alten Direktlink in diesen Ansichten geöffnet. Geheime Inhalte
bleiben weiterhin nur für den Bearbeitungsmodus bestimmt.

Der Publisher prüft echte Kalenderdaten, Referenzen und überschneidungsfreie
Archivintervalle. Ein älterer Client darf bei noch vorhandenen Aushängen das
bereits veröffentlichte Archiv nicht versehentlich weglassen. Die bestehende
Revisionsprüfung bleibt erhalten.

## Bilder und Prüfung

- `assets/images/paper-archive/`: drei Einzelknäuel, drei wachsende Haufen,
  Original-PNGs, transparente WebP-Fassungen und Dateihashes. Warme
  Pergamentfarben mit kurzen dunklen Bodenschatten passend zu Gwynthor.
- `assets/images/board-calendar/`: gezeichneter Pergamentblock mit Holzbindung,
  Lederlasche und Nagel; eigener Ziffernsatz 0–9. Originale bleiben erhalten.
  `tools/prepare-calendar-art.py` schneidet den Ziffernbogen und erstellt die
  transparenten Anzeigedateien reproduzierbar.
- Vollständige Bildprompts: `diagnostics/paper-archive-2026-10-31/`.
  Alle Bilder wurden mit dem eingebauten `image_gen` erzeugt.
- Iorath und Raban: [Porträts und Quellen](../AleriaAlmanach/assets/gwynthor-reisegeleit/README.md).
  Die Originale liegen unter `AleriaAlmanach/assets/gwynthor-reisegeleit/portraits/`;
  `travel-portraits-generation.json` dokumentiert die vollständigen Prompts.
  Ioraths eigene Unterschrift liegt unter
  `assets/images/issuers/signatures/iorath-melyn/`.
- Fachtests: `tests/notice-timeline-archive.test.mjs`, vorhandene Tafel- und
  Weltdatumsprüfungen sowie `Orte/tests/poi-bridges.test.mjs`.
- Browserprüfung und Screenshots: `diagnostics/paper-archive-2026-10-31/review.mjs`.
  Der Test lässt ausschließlich lokale GET-Aufrufe zu und prüft Zukunftsdaten,
  Uhrabgleich, Zusammenknüllen, Ziehen, Zusammenlegen, Lesen, Wiederanheften,
  Neuladen und mobile Bedienung.
