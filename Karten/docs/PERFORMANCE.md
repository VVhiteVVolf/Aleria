# Karten-Rendering und Bildauflösungen

Stand: 29. Oktober 2026.

## Zuständigkeiten

- `assets/js/map/map-raster-images.js` verwaltet aktive Rasterbilder und ihre
  Anzeigeauflösung. Inaktive Overlays erhalten beim Start keine Bildquelle.
- `map-view.js` behält die logischen Kartenmaße bei einem Auflösungswechsel bei.
  `karto-app.js` bündelt Transformationsänderungen auf einen Browser-Frame.
- `lsb-canvas.js` zeichnet nur nach einer Änderung. Ausschließlich der aktive
  Halteindikator beim Ziehen eines Wegpunkts benötigt eine laufende Animation.
- Die Haushaltsansicht erhält ihre DOM-Knoten beim Verschieben. Die
  Regionsansicht skaliert Beschriftungen nur bei geändertem Zoom.

## Weitere Karten mit Anzeigeauflösungen ausstatten

`template.config.js` kann unter `rasterImages` pro Originalquelle einen
Deskriptor mit `source`, nativer `width`/`height` und aufsteigend sortierten
`levels` (`width`, `src`) angeben. Die letzte Stufe verweist auf das Original.
Die Auswahl berücksichtigt Zoom und Pixeldichte des Bildschirms. Ohne
Deskriptor wird die bisherige Quelle verwendet.

Die nativen Maße bilden weiterhin das Koordinatensystem für Pins, Regionen,
Routen und gespeicherte Ansichten. Ein Wechsel der Anzeigeauflösung darf weder
die Ansicht neu einpassen noch Pins neu erzeugen. Eigene Bildquellen bleiben
unverändert; die Auflösungsstufen gelten nur für die zugeordnete Originalquelle.
Herkunft und Prüfsummen der Gwynthor-Ableitungen stehen in
`Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/Kartenbilder/display/provenance.json`.

## Nachgewiesene Entlastung

Gwynthor-Bannkreis lud zuvor alle drei Rasterbilder mit zusammen 143.882.422
Bytes und jeweils 8192 × 6300 Pixeln. Die normale Übersicht benötigt nun
1.406.246 Bytes bei 2048 Pixel Breite bzw. 5.047.900 Bytes bei 4096 Pixel Breite.
Verdeckte Ebenen laden erst beim Einschalten; bei tiefem Zoom bleibt das
unveränderte Original verfügbar.

Ein deterministischer Vergleich des vorherigen Canvas-Codes mit dem neuen
Code ergab über 120 unveränderte Frames 120 gegenüber 0 zusätzlichen
Canvas-Löschungen. Das ist eine Messung vermiedener Arbeit, kein FPS-Benchmark.
Eine verlässliche Browsermessung war nicht möglich, weil die Browsersteuerung
die aktive Windows-Browseradresse nicht sicher bestätigen konnte.

Regressionsprüfung: `node --test --experimental-test-isolation=none
Karten/tests/map-performance.test.mjs`. Sie prüft verzögerte Bildanforderungen,
Auflösungswechsel ohne Koordinatenänderung, ruhendes Canvas und die Erhaltung
der Haushalts-DOM-Knoten. Die gemeinsamen Anzeigetafel-Optimierungen sind in
`Anzeigetafeln/PERFORMANCE.md` beschrieben.
