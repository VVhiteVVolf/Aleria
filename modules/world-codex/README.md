# Weltatlas: Atlas & Chronik

Gemeinsames Oldschool-Fantasy-Design für Länder, Grafschaften, Herrschaften, Orte/Städte, Zünfte sowie große und kleine Hausseiten. Warmer Papiergrund, dunkle Einfassung, weinrote Rubriken, heraldische Titelköpfe und kleine, beschriftete Infotabellen. Bestehende Karten, Wappen und Portraits bleiben die Bildquellen.

## Einbindung und Zuständigkeit

Die 17 aktiven HTML-Einstiege einschließlich ihrer Vorlagen laden `world-codex.css?v=20260919a` und `codex-navigation.mjs?v=20260918a`. Die Body-Klasse `world-codex` aktiviert die Gestaltung. Da die vorhandenen Register weiterhin dieselben Vorlagen öffnen, erhalten auch bestehende und künftige Dateneinträge das Design. Die Hausvorlagen unter `_template/` leiten bereits auf die gemeinsam gestalteten Hausseiten weiter.

- `codex-foundation.css`: Farben, Schrift, Papier, Überschriften, Seiteneinfassung, Kapitelnavigation und Druckansicht.
- `codex-territories.css`: Länder und Herrschaften einschließlich der ursprünglichen Tabellenstruktur.
- `codex-documents.css`: gemeinsames Dokumentlayout für Orte, Zünfte und Häuser; Ortsinfoboxen und Register.
- `codex-houses.css`, `codex-guilds.css`: Besonderheiten der beiden Seitentypen.
- `codex-navigation.mjs`: zusätzliche Kapitelnavigation außerhalb des bearbeitbaren Inhalts. Native Links und `details`, lokale Listener, keine neuen globalen Zustände.
- `codex-territory-headings.mjs`: erkennt die bereits im Inhaltsverzeichnis benannten Kapitel älterer Exporte auch nach asynchroner Inhaltsaktualisierung. Ergänzt ausschließlich Klassen, Anker und Überschriftensemantik.

Die Quelldokumente behalten alle Inhalte und Datenbindungen. Nur die äußeren Layouttabellen werden über CSS als Raster dargestellt; fachliche Tabellen und Komponenten behalten ihre Aufgaben. Bestehende Listener und alle Firebase-Zuständigkeiten bleiben erhalten. Die wenigen `!important`-Deklarationen ersetzen explizite Pixelmaße und erzwungene Altformatierungen oder sichern das native `hidden`-Verhalten. Die gemeinsame Verwaltungszeile und ihre Dialoge behalten ihr eigenes Modul.

Auf großen und kleinen Hausseiten stehen die Kapitel 2–5 gemeinsam in `haeuser-history-scroll` neben der Infotabelle. Die Überschriften, Abschnittsschlüssel und Anker bleiben erhalten. Die rechte Infotabelle bestimmt über CSS-Größencontainment die verfügbare Höhe; längerer Text ist per Maus und Tastatur scrollbar. Mobil gilt eine Grenze von 65 % der Bildschirmhöhe, im Druck wird alles ausgegeben. Das Herrschaftsbanner nutzt die ganze innere Breite und seine natürliche Höhe ohne Beschnitt oder leere quadratische Restfläche. Diese Regeln liegen ausschließlich in `codex-houses.css`.

Ortsbeschreibungen neben Karten und Infoboxen haben eigene Scrollflächen, damit lange Texte keine Leerflächen unter dem Begleitbild erzeugen. Komplexe Tabellen können auf kleinen Displays innerhalb ihres Abschnitts scrollen. Bilder behalten ihr Seitenverhältnis; für das große Hausmotiv wird eine feste Bildfläche mit `object-fit: contain` genutzt. Der vorhandene Inhaltsknopf bleibt erreichbar und liegt unten links. Die zusätzliche Kapitelnavigation bleibt am oberen Rand und ist mit der Tastatur sowie Escape bedienbar. Die Ortsmodule für Flavorszenen, Händlerbewertungen, Persönlichkeiten und Textflächen sind unter [Ortslayout](../../Orte/modules/layout/README.md) dokumentiert.

## Sicherung und Prüfung

Originale: [Old Design](../../Old%20Design/2026-09-18-Weltatlas/README.md). Das Design kann über die drei Einbindungen (zwei Ressourcen, eine Body-Klasse) pro Einstieg wieder entfernt werden.

`tests/codex.browser.mjs` startet selbst einen lokalen statischen Server. Playwright kann wie bei den bestehenden Kontinente-Tests über `PLAYWRIGHT_MODULE` und optional `PLAYWRIGHT_EXECUTABLE` bereitgestellt werden:

```sh
node modules/world-codex/tests/codex.browser.mjs
```

Der Test vergleicht 18 Ansichten mit den archivierten Originalen: vollständiger Text, alle Linkziele, Bildquellen/Bildbeschreibungen und bisherige Bedienelemente. Vektorbewertungen werden über ihre unveränderten Quellwerte verglichen; die neu ergänzten Szenen-Spoiler werden separat im Ortslayouttest geprüft. Er prüft 1440, 768 und 390 Pixel, Kapitelsprünge, Fokus, Escape, den vorhandenen Ortsindex, Zeitungswechsel und Zunftdetails. Externe Bilddienste werden in diesen Tests blockiert; vorhandene Ersatzbilder werden vor dem Vergleich vollständig geladen.

Zusätzlich erfolgreich geprüft: `Kontinente/tests/territory-directory.browser.mjs` (alle acht Herrschaften, Hausregister, Ränge, Personenlinks und Vorlagen) und `Kontinente/tests/administration-dialog.browser.mjs` (alle 16 Verwaltungsansichten einschließlich ihrer 316 Personenkarten).

Die vorhandenen fachlichen Tests ergeben 92 erfolgreiche Prüfungen und einen bereits bestehenden Fehler in `Familien Häuser und Clans/tests/house-draig.test.mjs:90`: Der Test erwartet `sourceRevision: 9`, die unveränderte Familienquelle enthält bereits `10`. Der Designumbau verändert weder diese Daten noch diesen Test.
