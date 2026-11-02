# Inventarfenster

Die Leseansicht, die rechte Gegenstandsvorschau sowie Item- und Gefährtenkarten
verwenden ein gemeinsames dunkles Fantasy-RPG-Design: eckige Fenster, schmale
doppelte Bronzefassungen, warme Schrift und handgemalte Gegenstandsbilder.

`styles/character-inventory-cards.css` besitzt diese Darstellung. Die ältere
Basisdatei `module-page-character-inventory.css` behält die Grundlagen für
Inventareditor, Dialoge und Ausrüstung. Modell, Inventarbesitz, Aktionskennungen
und Geldberechnung wurden für den Designwechsel nicht verändert.

`character-inventory-renderer.js` ordnet semantischen UI-Icons ihre vorhandenen
lokalen Bilder zu. Kategorien, Bereichsüberschriften und Aktionen benutzen
diesen gemeinsamen Renderer. Eigene Kategorie-Bild- und Glyphicons bleiben
erhalten; nur die bisherigen Standardicons werden durch die deutlicheren
Bildicons ersetzt. Fehlende Gegenstandsbilder erhalten ein Kategorie-Bild,
fehlende Gefährtenbilder ein passendes Registericon.

Die zurückhaltende Materialtextur liegt unter
`public/assets/inventory-ui/dark-hide-v1.webp`. Der genaue Generierungsprompt und
Dateihash stehen unter `assets/inventory-ui/2026-11-02/material-provenance.json`.
Die Quelle bleibt im Repository; die aktive Textur wird ausgeliefert.

UI-Icons verwenden eigene WebP-Ableitungen unter `public/assets/inventory-ui/icons/`;
die ursprünglichen Illustrationen bleiben für Gegenstände und andere Ansichten
erhalten. Zwölf Icons und die Textur benötigen gemeinsam rund 318 KB statt
23,32 MB. `assets/inventory-ui/2026-11-02/ui-derivatives.json` enthält Zuordnungen,
Maße und Prüfsummen. `scripts/build-ui-art.mjs` erzeugt die Ableitungen mit einem
lokalen Browser; `--verify` kontrolliert Quellen und Ausgaben ohne Browser.

Die Prüfungen umfassen Gegenstandsabbildungen, Itemisierung, Datenbankbesitz,
Gruppeninventare, Verbrauch, Ausrüstungseffekte und Szenenübertragungen.
`tests/character-inventory-theme.browser.mjs` prüft zusätzlich Suche, Kategorien,
Auswahl, Karten und Diagramme, Gefährtenverknüpfung, unveränderte Lesedaten sowie
Münztransaktionen und Überziehungsschutz bei mehreren Fensterbreiten. Der Test
arbeitet lokal und blockiert externe Schreibzugriffe. Belege stehen unter
`diagnostics/inventory-theme-20261102/`.
