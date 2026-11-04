# Tal der Milane: Hausseiten, Bios und Darstellungen

Stand: 3. November 2026. Lokal ergänzt und geprüft; noch nicht veröffentlicht.

19 bestehende Familienakten besitzen jetzt eine eigene Hausseite, eine
Stammbaum-Hausbio und eine zugeordnete Darstellung in der Kriegergalerie.
Die gemeinsamen Hausseiten- und Bio-Adapter bleiben unverändert; jedes Haus
besitzt seine eigene redaktionelle `haus.content.mjs`.

## Gelieferte Hausvorlagen

Übernommen wurden Aderyn, Eryr, Tylluan, Mwyalchen, Gaeth, Hebog, Ilyuncu und
Sliabh. Alle acht Original-HTMLs sind unverändert beim jeweiligen Haus
archiviert. Quellenentscheidungen, Prüfsummen und Bildherkunft stehen dort in
`source-manifest.json`, `quellen.json` beziehungsweise `sources.json` und den
zugehörigen Redaktionsnotizen. Alle acht vorhandenen Kriegerdarstellungen werden
direkt verwendet. Ilyuncus Herrschaftsbanner, Hofkaplan Reese und Hebogs
Hofmagierinnenportrait sind ebenfalls lokal gesichert.

Die sieben umfangreich belegten Bios umfassen jeweils ungefähr 314–366 Wörter.
Sliabh bleibt mit 136 Wörtern entsprechend der lückenhaften Vorlage kürzer.
Unbekannte Ämter behalten Silhouetten; Personen ohne sichere vorhandene Identität
erhalten keinen erfundenen Stammbaumlink. Widersprüche zwischen alten Sitznamen,
Amtsfolgen und aktuellen Akten sind in den Hausordnern dokumentiert.

Die gelieferten genealogischen Abschnitte wurden vollständig aus der Übernahme
ausgenommen. Alle 19 Seiten betten ausschließlich die bestehende Familienakte
mit ihrer stabilen ID und `mode=view` ein. Keine Personen, Ehen, Abstammungen,
Nebenlinien oder Lebensdaten wurden aus den mitgelieferten Stammbäumen übernommen.
Alle 21 vorhandenen Tal-Stammbäume sind anhand ihrer Graph-Prüfsummen unverändert.

## Niedere Häuser und neue Figuren

Bronnor, Caerfrán, Coedrudd, Barcud, Durdynn, Gwylen, Faelwyn, Gwyntell,
Gwyliadwr, Helyg und Ffwnarch erhalten vorbereitete kleine Hausseiten, knappe
Hausbios und neue Darstellungen. Die bekannten Angaben zu Stand, Registerort,
Lehensbindung, Wappen und Durdynns Verlobungsverbindung bleiben erhalten.
Gründer, Ämter, Jahreszahlen, Familienberufe und Hausgeschichte werden nicht
ergänzt, solange entsprechende Quellen fehlen. Faelwyns Hausseite folgt der
ausdrücklichen Lehenszuordnung zu Tylluan aus dem Herrschaftsverzeichnis; das
ältere allgemeine Stammbaumprofil bleibt unverändert.

Die elf neuen Figuren wurden mit dem eingebauten ImageGen und der freigegebenen
matten Hausritter-Referenz erstellt. Die Korrektur des Nutzers vom 3. November
wurde in acht überarbeiteten Figuren umgesetzt: verschiedene Helmtypen,
zurückhaltende Vogelbezüge und sieben Ritter ohne Schild. Ffwnarch zeigt eine
bürgerliche Frau in schlichter Kleidung, ohne einen Familienberuf festzulegen.
Die Figuren sind repräsentative Hausdarstellungen, keine neuen Personenakten.

Die zwei antiken Crannath-Clans Ui Gormárd und Ua Fíonnghal bleiben mit ihren
vorhandenen Akten erhalten. Für sie wurden in diesem Auftrag keine Hausvorlagen
geliefert und keine neuen Darstellungen erzeugt.

## Verknüpfungen und Archivschutz

25 Hauskarten in den sieben bestehenden Grafschafts-/Herrschaftsquellen öffnen
die passende neue Hausseite direkt. Die territoriale Auswahl wurde beibehalten.
Die Galerie aktualisiert gezielt die 19 betroffenen Hauszuordnungen. Alle 863
anderen Hauseinträge und alle 958 bisherigen Bilddatensätze bleiben unverändert.
Der neue begrenzte Buildmodus ist auch bei anderen isolierten Hausübernahmen
nutzbar; ohne Auswahl bleibt der bisherige Vollbuild erhalten.

Originalquellen, Redaktionsnotizen, Bildprompts und verworfene Erstfassungen
bleiben Arbeitsquellen. Die Veröffentlichungsfilter schließen sie aus dem
statischen Auslieferungspaket aus; aktive PNGs und generierte Seitendaten bleiben
auslieferbar. Es erfolgten keine Firebase-Schreibzugriffe.

## Prüfung und Arbeitsbelege

- 7 gezielte Hausseiten-, Bild-, Archiv- und Graphprüfungen bestanden.
- 9 Prüfungen des begrenzten Galerie-Builds bestanden.
- 18 bestehende Gebiets-, Celtigerns-Wacht- und Hofämterprüfungen bestanden.
- Hausseiten-Build und begrenzter Galerie-Build auf Aktualität geprüft.
- Browser: Aderyn-Seite und tatsächlich geladener Stammbaum, Faelwyn mobil bei
  390 Pixeln und Hausbio mit Bild/Rücklink, Grafschaftsregister und direkter
  Gaeth-Aufruf ohne defekte Bilder oder Seitenüberlauf geprüft.
- Elf aktuelle PNGs: 2:3, RGBA, transparente Ecken und Silhouetten visuell geprüft.

Belege und vollständige Bildprompts stehen unter
`diagnostics/tal-der-milane-house-pages-20261103/`. `delivery.json` benennt die
aktiven Quellen und Bilder, `verification.json` den Erhalt der anderen Daten.
Einmalige Übernahmeskripte sollen spätere Redaktion nicht überschreiben.

```powershell
node "Familien Häuser und Clans/scripts/build-house-content.mjs" --check
node "Familien Häuser und Clans/tests/tal-der-milane-house-pages.test.mjs"
node Gallerien/krieger/tests/scoped-catalog.test.mjs
node Gallerien/krieger/scripts/build-catalog.mjs --houses=haus-aderyn,haus-eryr,haus-tylluan,haus-mwyalchen,haus-ilyuncu,haus-sliabh,haus-gaeth,haus-hebog,haus-bronnor,haus-caerfran,haus-coedrudd,haus-barcud,haus-durdynn,haus-gwylen,haus-faelwyn,haus-gwyntell,haus-gwyliadwr,haus-helyg,haus-ffwnarch --check
```
