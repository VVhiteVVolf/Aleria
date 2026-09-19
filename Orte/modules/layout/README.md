# Text und Begleitbild auf Ortsseiten

`place-paired-panels.css` ergänzt das Weltatlas-Raster auf `grossstadt.html` und seiner Vorlage. Einleitung, Hintergrund/Lage/Verwaltung und Bezirke verwenden dieselbe Struktur:

- Die linke Tabellenzelle trägt `orte-paired-copy` und erhält ihre Höhe von der rechten Karte bzw. Infobox (mindestens 300 px).
- `orte-paired-panel` enthält die feste Überschrift und die tastaturbedienbare `orte-paired-scroll`-Region.
- CSS-Größencontainment verhindert, dass langer Text die ganze Zeile ausdehnt. Es sind keine Bildmessungen oder zusätzlichen Layout-Listener nötig.
- Unter 800 px stehen die Spalten untereinander; die Textfläche ist auf 65 % der Bildschirmhöhe begrenzt. Im Druck wird sie vollständig geöffnet.

Ausgeblendete Features behalten ihr natives `hidden`-Verhalten im gemeinsamen `codex-documents.css`. Die vorhandenen Ortsdaten entscheiden über Bezirke: Kleine Siedlungen haben keine; die größeren Städte führen ihre Bezirke weiter.

## Zugehörige Inhaltsmodule

`../flavor/place-flavor.mjs` stellt explizit markierte Flavorszenen als native, zunächst geschlossene `details` dar. Eine bestehende Unterüberschrift kann `flavor: true` erhalten. Die folgenden Absätze gehören bis zur nächsten strukturierten Rubrik zur Szene. Alternativ ist ein verschachtelter Block `{ type: 'scene', text: 'Titel', paragraphs: [...] }` möglich. Unmarkierte Unterüberschriften bleiben normaler Fließtext. Sprecher, Klammerhandlungen und Erzähltext zwischen deutschen Redezeichen werden hervorgehoben, ohne Text zu ersetzen.

`../merchants/merchant-ratings.mjs` erkennt die bestehende Fünferskala und zeigt Münzen (Wohlstand), Siegel (Ruf), Banner (Einfluss). Andere Bewertungen bleiben im Wortlaut erhalten. Ein eigener Tabellen-Scrollbereich schützt Symbol- und Textbreiten auch auf Mobilgeräten.

Die Persönlichkeiten behalten ihre bestehenden Beschreibungs-Scrollflächen, Portraits und Zeilenstruktur. `../personalities/place-personalities.css` verantwortet Kontrast, Rubriken und drei wechselnde Farben je Person.

## Prüfung

`node --test Orte/tests/*.test.mjs` prüft Daten und Inhaltslogik. `node Orte/tests/place-layout.browser.mjs` prüft sechs bestehende Orts-/Stadtseiten bei 1440, 1024, 768 und 390 px, vollständige Texte, Bezirke, Bewertungen und das Öffnen/Scrollen einer Flavorszene. Es benötigt einen lokalen Server auf Port 5500 (oder `ORTE_TEST_ORIGIN`) und Playwright (`PLAYWRIGHT_MODULE`, optional `PLAYWRIGHT_EXECUTABLE`). Mit `PREVIEW_OUTPUT` werden zusätzlich Screenshots gespeichert.
