# Weltatlas: Atlas & Chronik

Gemeinsames Oldschool-Fantasy-Design für Länder, Grafschaften, Herrschaften, Orte/Städte, Zünfte sowie große und kleine Hausseiten. Warmer Papiergrund, dunkle Einfassung, weinrote Rubriken, heraldische Titelköpfe und kleine, beschriftete Infotabellen. Bestehende Karten, Wappen und Portraits bleiben die Bildquellen.

## Einbindung und Zuständigkeit

Die aktiven HTML-Einstiege einschließlich ihrer Vorlagen laden `world-codex.css?v=20261018a` und `codex-navigation.mjs?v=20261018a`. Die Body-Klasse `world-codex` aktiviert die Gestaltung. Da die vorhandenen Register weiterhin dieselben Vorlagen öffnen, erhalten auch bestehende und künftige Dateneinträge das Design. Die Hausvorlagen unter `_template/` leiten bereits auf die gemeinsam gestalteten Hausseiten weiter. Kontinentübersichten behalten ihre eigene kompakte Atlasgestaltung in `Kontinente/assets/css/kontinente-overview.css`.

- `codex-foundation.css`: Farben, Schrift, Papier, Überschriften, Seiteneinfassung, Kapitelnavigation und Druckansicht.
- `codex-territories.css`: Länder und Herrschaften einschließlich der ursprünglichen Tabellenstruktur.
- `codex-documents.css`: gemeinsames Dokumentlayout für Orte, Zünfte und Häuser; Ortsinfoboxen und Register.
- `codex-houses.css`, `codex-guilds.css`: Besonderheiten der beiden Seitentypen.
- `codex-navigation.mjs`: zusätzliche Kapitelnavigation außerhalb des bearbeitbaren Inhalts. Native Links und `details`, lokale Listener, keine neuen globalen Zustände.
- `codex-territory-headings.mjs`: erkennt die bereits im Inhaltsverzeichnis benannten Kapitel älterer Exporte auch nach asynchroner Inhaltsaktualisierung. Ergänzt ausschließlich Klassen, Anker und Überschriftensemantik.
- `codex-reference-tables.mjs`: entfernt überholte Farb-, Schrift- und Größenformatierungen aus sichtbaren Reichs-, Verwaltungs-, Institutions- und Ahnentabellen. Haus-, Siedlungs- und Verwaltungsquellen sind ausdrücklich ausgenommen: deren Inline-Merkmale sind weiterhin Metadaten für ihre zuständigen Adapter.

Die Quelldokumente behalten alle Inhalte und Datenbindungen. Nur die äußeren Layouttabellen werden über CSS als Raster dargestellt; fachliche Tabellen und Komponenten behalten ihre Aufgaben. Bestehende Listener und alle Firebase-Zuständigkeiten bleiben erhalten. Die wenigen `!important`-Deklarationen ersetzen explizite Pixelmaße und erzwungene Altformatierungen oder sichern das native `hidden`-Verhalten. Die gemeinsame Verwaltungszeile und ihre Dialoge behalten ihr eigenes Modul.

Auf großen und kleinen Hausseiten folgen alle Kapitel dem normalen Seitenscrollen. Geschichte und Traditionen stehen neben der Infotabelle, Kapitel 4 und 5 anschließend als eigene Abschnitte. Die frühere gemeinsame Scrollfläche verbarg diese Kapitel beim gewöhnlichen Seitenscrollen; sie ist einschließlich ihrer Höhenbegrenzungen entfernt. Abschnittsschlüssel, Texte, Nummern und Anker bleiben erhalten. Das Herrschaftsbanner nutzt weiterhin die ganze innere Breite und seine natürliche Höhe ohne Beschnitt.

Städte und Herrschaften nutzen dieselben Hauskarten unter `Kontinente/modules/territory-directory/`. Die separate Stadt-Häusertabelle, deren Mobilstyles sowie die alten Beispielzeilen in beiden Ortsvorlagen sind entfernt. `Orte/assets/js/orte-place-houses.js` übersetzt nur die vorhandenen Ortsdaten. Ab acht Einträgen ergänzt `directory-browser.mjs` eine lokale Suche, bei mehreren Gruppen auch einen Gruppenfilter. Text-, Wappen- und Linkquellen bleiben bei den jeweiligen Adaptern. Filterzustände überstehen asynchrone Ansichtsaktualisierungen; Druckansichten zeigen das vollständige Register.

Ortsbeschreibungen neben Karten und Infoboxen haben eigene Scrollflächen, damit lange Texte keine Leerflächen unter dem Begleitbild erzeugen. Komplexe Tabellen können auf kleinen Displays innerhalb ihres Abschnitts scrollen. Bilder behalten ihr Seitenverhältnis; für das große Hausmotiv wird eine feste Bildfläche mit `object-fit: contain` genutzt. Der vorhandene Inhaltsknopf bleibt erreichbar und liegt unten links. Die zusätzliche Kapitelnavigation bleibt am oberen Rand und ist mit der Tastatur sowie Escape bedienbar. Die Ortsmodule für Flavorszenen, Händlerbewertungen, Persönlichkeiten und Textflächen sind unter [Ortslayout](../../Orte/modules/layout/README.md) dokumentiert.

## Sicherung und Prüfung

Originale: [Old Design](../../Old%20Design/2026-09-18-Weltatlas/README.md). Das Design kann über die drei Einbindungen (zwei Ressourcen, eine Body-Klasse) pro Einstieg wieder entfernt werden.

`tests/codex.browser.mjs` startet selbst einen lokalen statischen Server. Playwright kann wie bei den bestehenden Kontinente-Tests über `PLAYWRIGHT_MODULE` und optional `PLAYWRIGHT_EXECUTABLE` bereitgestellt werden:

```sh
node modules/world-codex/tests/codex.browser.mjs
```

Der Test vergleicht 18 Ansichten mit den archivierten Originalen; mit `CODEX_BASELINE=HEAD` stattdessen mit dem Git-Ausgangsstand der aktuellen Änderungen. Geprüft werden vollständiger Text, Linkziele, Bildquellen/Bildbeschreibungen und bisherige Bedienelemente. Neue Register-Bedienelemente werden getrennt behandelt; Stadt-Hausdaten werden vollständig mitverglichen. Er prüft 1440, 768 und 390 Pixel, Kapitelsprünge, Fokus, Escape, den vorhandenen Ortsindex, Zeitungswechsel und Zunftdetails. Externe Bilddienste werden in diesen Tests blockiert; vorhandene Ersatzbilder werden vor dem Vergleich vollständig geladen.

`tests/register-refinement.browser.mjs` benötigt einen lokalen statischen Server (standardmäßig Port 5500). Er prüft die acht Referenzseiten und Haus Wyrm bei 1440, 1024, 768 und 390 Pixeln. Zusätzlich: vollständige Stadt-Hausdaten, keine verdeckten Kapitel 4/5, Suche, Gruppenfilter, Leerzustand, Zurücksetzen, unabhängige Register, Filtererhalt nach Inhaltsaktualisierung, Tastaturfokus und vollständige Druckausgabe. Optional speichert `DIRECTORY_SCREENSHOTS` Vergleichsbilder.

Zusätzlich erfolgreich geprüft: `Kontinente/tests/territory-directory.browser.mjs` (alle acht Herrschaften, Hausregister, Ränge, Personenlinks und Vorlagen) und `Kontinente/tests/administration-dialog.browser.mjs` (alle 16 Verwaltungsansichten einschließlich ihrer 316 Personenkarten).

Stand 18. Oktober 2026: Der Vergleich der 18 Ansichten mit dem Git-Ausgangsstand sowie sämtliche neuen Registerprüfungen bestehen. Die fachliche Suite für Kontinente, Orte und Häuser ergibt 89 erfolgreiche Prüfungen und elf ältere Fehler (unter anderem veraltete Familienzahlen, Bio-Fingerprints und Ortsdaten-Erwartungen). Eine zusätzliche schreibgeschützte HEAD-Ansicht derselben Testeingaben ergibt exakt dieselben elf Fehler. Die Designüberarbeitung verändert diese Daten nicht.
