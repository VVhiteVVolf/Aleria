# Carreg und die Zucht Ritterschimmer

Stand: 12. Oktober 2026. **Lokal umgesetzt; keine Firebase-Schreibzugriffe, kein Commit, kein Push und keine Veröffentlichung.**

## Fester Zuchtbucheintrag

**Ritterschimmer = Herzogsschimmer × Ceffyl.** Die Benennung steht dauerhaft im gemeinsamen Bestiarium-Register `Bestiarium/modules/horse-breeding/horse-breeding-registry.mjs` und in der daraus erzeugten Zuchtbuchseite. Der Eintrag nennt Carreg als Reitpferd von Sir Duncan Gafyr. Die Kreuzungsmatrix und der Rechner erkennen beide Elternreihenfolgen. Der Eintrag besteht unabhängig von persönlichen Browser-Aufzeichnungen.

Direktes Ziel: [Ritterschimmer im Zuchtbuch](../../../Bestiarium/tiere/pferde/zuchtbuch/index.html#kreuzung-ceffyl-mit-herzogsschimmer).

Das Zuchtbuch führt weiterhin 27 auswählbare Ausgangsrassen und jetzt acht benannte Kreuzungen. Es wurde keine zusätzliche historische Entstehungsgeschichte oder genetische Festigung erfunden. Der gemeinsame Bestiarium-Index unterstützt nun neben Einzelprofilen auch ausdrücklich registrierte Zuchtbucheinträge mit geprüftem Seitenanker; Carreg verweist auf genau diesen Ritterschimmer-Eintrag.

## Carreg

| Feld | Wert |
| --- | --- |
| Kreatur-ID | `companion-duncan-carreg` |
| Besitzer | Sir Duncan Gafyr, bestehende ID `tmfBA2zPTc88EMMGkyyA` |
| Weltperson des Besitzers | `person--haus-gafyr--duncan-gafyr` |
| Rasse / Zucht | Ritterschimmer |
| Abstammung | Herzogsschimmer × Ceffyl |
| Einordnung | Pferde → Celtigerns Wacht |
| Stufe | 3 |
| Kampfwerte | 35 TP, RK 12, W10, Bewegung 18 m; Hufschlag 1W6 + 4 |
| Inventarinstanz | `duncan-carreg` |

Kreaturbogen und Biografie: `modules/creatures/catalog/duncan-carreg.js`. Schieferdunkles Fell, silberweiße Mähne und Schweif, kräftige aufrechte Haltung, schwarz-goldene Gafyr-Ausstattung mit Widderwappen. Der Bogen enthält Rasse, beide Ausgangsrassen und Besitzerbindung. Das Geschlecht wurde nicht vorgegeben und bleibt offen.

Originalbild: `C:\Users\fhg_r\Downloads\CarregDuncan.png`. Unverändert kopiert nach `assets/companions/haus-gafyr/carreg.png`, 1024 × 1536 Pixel. SHA-256: `ffe063a5ff78c9f48721ee1eded9712d0fdbe3c009de9d2f2a3e63a1652615b5`.

## Inventar und lokale Charakterdatenbank

Die bestehende leere Reittierkarte wird für Carreg verwendet. Sie verweist auf den Kreaturbogen und dieselbe Inventarinstanz; wiederholtes Verknüpfen erzeugt keine Doppelung. Duncans vorhandene Online-ID und sein übriger gelesener Besitz bleiben erhalten.

Duncans lokale Figurenakte, Register und gebündelter Snapshot enthalten Carreg ebenfalls. **Alle 237 anderen Figuren und ihre Snapshot-Einträge bleiben unverändert.** Für die gezielte Inventaraktualisierung gibt es `CharakterDatenbank/lib/character-database-inventory.mjs`: Die Funktion erhält den bestehenden Kampf- und Genealogiestand, ergänzt einen kleinen Inventar-Quellbeleg und aktualisiert dieselbe gemeinsame Inhaltsprüfsumme wie der reguläre Archivgenerator. Historische Exporte werden dafür nicht erneut zu einem Kampfprofil zusammengesetzt.

Die Online-Fassung eines vorhandenen Inventars behält beim normalen Laden Vorrang. Der vorbereitete Online-Abgleich ist noch nicht ausgeführt. Duncans aktuelle Online-TP, Ressourcen, Zustände, Ausrüstung, Rechte und frühere Kampfhandlungen wurden nicht verändert.

## Dateien zur späteren Übernahme

Unter `Charakter Archiv Exporte/gefaehrten/carreg-ritterschimmer-2026-10-12/`:

- `companion-duncan-carreg.json`: importierbarer Kreaturbogen mit Bestiarium-Verweis.
- `duncan-gafyr-vollstaendiger-entwurf.json`: vollständiger gelesener Duncan-Stand mit ergänztem Inventar, zur Prüfung und Sicherung.
- `vorbereitung.json`: Besitzer-ID, gelesener Versionsstand, Bildquelle und Prüfsumme, Zucht und Verweis.

`Charakter Archiv Exporte/duncan-gafyr-carreg-2026-10-12.json` ist ein **Inventar-Teil-Overlay für die Archiv-Zusammenführung**. Es enthält bewusst keinen vollständigen Charakterbogen und darf nicht über den allgemeinen Charakter-Vollimport eingespielt werden.

Vor einer späteren Freigabe den aktuellen Duncan- und Kreaturstand erneut lesen. Carreg und seine Inventarverknüpfung gemeinsam versionsgeprüft übernehmen; bei Duncan ausschließlich die Gefährten-Ergänzung gegen den dann aktuellen Stand anwenden. Bild, Kreaturmodule und Zuchtbuch gemeinsam veröffentlichen. Keine veralteten Vollimporte über aktuelle Charakterdaten schreiben.

## Prüfung

54 unterschiedliche gezielte Tests bestanden, einschließlich Bestiarium-Verweisen, Zuchtbuchdaten und Symmetrie, Erhalt älterer Kampfdaten bei Inventaränderungen, Charakterdatenbank, Begleiterverknüpfungen und bisherigen Kreaturbögen. Zuchtbuch und Bestiarium-Index bestehen ihre Generatorprüfung.

Isolierter lokaler Chromium-Test mit gesperrten externen Anfragen: echter lokaler Duncan-Datensatz → Inventarkarte → Carreg-Bogen → Ritterschimmer-Zuchtbucheintrag. Originalbild geladen, beide Elternreihenfolgen erkannt, fester Eintrag nach Neuladen vorhanden, mobile Ansicht ohne horizontalen Überlauf, keine Browserfehler. Prüfbericht und Bildschirmaufnahmen: `.codex-temp/carreg-review/`.

Produktionsbuild erfolgreich; die bestehenden Hinweise zu klassischen Skripten, Modulformaten und großen Bundles bleiben bestehen.
