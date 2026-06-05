# Anzeigetafeln-Architektur

Der Ordner `Anzeigetafeln` soll wie `Karten` als langfristig wartbare Plattform wachsen:

- Jede Tafel besitzt eigene Bilder, Konfiguration und Firebase-Daten.
- Gemeinsame Bedienlogik liegt in `assets/js`.
- Neue Tafeln kopieren keine Feature-Logik.
- Statische Bedienung soll ueber zentrale `data-*`-Attribute laufen.

## Aktueller Schnitt

```txt
Anzeigetafeln/
  assets/
    js/
      tafel-app.js              # Runtime-Bruecke, Rest-Orchestrierung, Pan/Touch und verbleibende LSB-UI
      tafel-firebase.js         # Firebase-Persistenz pro Tafel
      core/
        tafel-actions.js        # zentrale data-action/data-input-action Event-Delegation
        tafel-bootstrap.js      # Startet die Tafel nach geladenen Modulen
      board/
        board-layers.js         # Umschaltung zwischen Zettel-/Pin-Layer und Layer-Buttons
        board-viewport.js       # Initiale Ansichtsanpassung und Wheel-Zoom
      data/
        data-manager.js         # Import/Export, Legacy-Import und Pin-Normalisierung
      pins/
        pin-scroll-view.js      # Detail-/Pergamentansicht fuer Pins und Orte
        pin-board.js            # Pin-/Ort-Layer, Tooltip und Drag-Interaktion auf der Tafel
        pin-editor.js           # Pin-/Ort-Sidebar, Vorschauen, Marker-Auswahl und Tabellen-Presets
        marker-catalog.js       # Marker-Katalog, Bulk-Import und Katalog-Rendering
        categories.js           # Kategorienleiste, Kategorienmanager und Kategorie-Marker-Auswahl
      lsb/
        lsb-config.js           # Reisemodi, Icons, Farben und Wegpunkt-Ereignistypen
        lsb-calculations.js     # Distanzen, Routenmittelpunkt, Ereignis-Auswirkungen und Reisezeit
        lsb-diary.js            # Reise-Tagebuch-Rendering und Text-Export
      notes/
        zettel-config.js        # Zetteltypen, Zettel-Draft-Erzeugung und Typkarten
        zettel-board.js         # Zettel-Layer, Tooltip und Drag-Interaktion auf der Tafel
        zettel-scroll-views.js  # Scroll-Ansichten fuer Quest, Steckbrief, Zeitung, Vermisst und generische Zettel
        zettel-editor.js        # Zettel-Sidebar, Tabellen, Artikel und Steckbrief-Personen
    css/
      tafel.css                 # gemeinsames Styling
  _template/
    AnzeigetafelTemplate.html   # Template-Shell fuer neue Tafeln
    tafel.config.js             # individuelle Template-Konfiguration
```

## Migrationsstatus

Stand: Phase 1 abgeschlossen.

Abgeschlossen:

1. `TafelRuntime` als erste Runtime-Bruecke angelegt.
2. `core/tafel-actions.js` fuer zentrale Event-Delegation angelegt.
3. `core/tafel-bootstrap.js` eingefuehrt.
4. Topbar-, Such-, Layer- und Basis-Werkzeugaktionen im Template und in Morddyn auf `data-*` umgestellt.
5. Statische Dialoge, Import-Dropzonen, File-Inputs und Modal-Aktionen im Template und in Morddyn auf `data-*` umgestellt.
6. Erste dynamische Listen in `tafel-app.js` auf delegierte Actions umgestellt: Marker-Katalog, Backup-Liste, Kategorienfilter, Kategorie-Manager, Kategorie-Marker-Auswahl, Stempel-/Ueberschreiblisten und Template-Auswahl.
7. Restliche Inline-Events in `tafel-app.js` entfernt: Zettel-Editor, Steckbrief-Personen, Pin-/Ort-Editor, Scroll-Aktionen und LSB-Gruppen/Routen laufen ueber zentrale Delegation oder lokale `addEventListener`.
8. Datenmanager nach `assets/js/data/data-manager.js` ausgelagert; `tafel-app.js` stellt dafuer nur Runtime-Zugriff auf State, Save, Backup, Toast und `applyState`.
9. Marker-Katalog und Kategorien nach `assets/js/pins/marker-catalog.js` und `assets/js/pins/categories.js` ausgelagert.
10. Zettel-Konfiguration und Zettel-Draft-Erzeugung nach `assets/js/notes/zettel-config.js` ausgelagert.
11. Zettel-Scrollansichten nach `assets/js/notes/zettel-scroll-views.js` ausgelagert; `tafel-app.js` routet die Anzeige nur noch an das Modul weiter.
12. Zettel-Editor nach `assets/js/notes/zettel-editor.js` ausgelagert; `tafel-app.js` stellt dafuer Runtime-Zugriffe auf State, Save, Toast und Board-Rendering bereit.
13. Zettel-Board-Rendering, Tooltip und Zettel-Drag nach `assets/js/notes/zettel-board.js` ausgelagert.
14. Pin-/Ort-Detailansicht nach `assets/js/pins/pin-scroll-view.js` ausgelagert.
15. Pin-/Ort-Editor nach `assets/js/pins/pin-editor.js` ausgelagert.
16. Pin-/Ort-Board-Rendering, Tooltip und Drag-Interaktion nach `assets/js/pins/pin-board.js` ausgelagert.
17. Board-Layer-Umschaltung nach `assets/js/board/board-layers.js` ausgelagert.
18. Board-Viewport-Helfer fuer initiale Ansicht und Wheel-Zoom nach `assets/js/board/board-viewport.js` ausgelagert.
19. LSB-Konfiguration nach `assets/js/lsb/lsb-config.js` ausgelagert.
20. LSB-Routenberechnung nach `assets/js/lsb/lsb-calculations.js` ausgelagert.
21. LSB-Reise-Tagebuch und Export nach `assets/js/lsb/lsb-diary.js` ausgelagert.

## Bewusst Vertagt: Phase 2

Diese Bereiche bleiben vorerst im Kern, weil sie staerker mit Canvas, Pointer-Handling und laufender Bedienung gekoppelt sind:

1. Board-/Minimap-View, Pan/Zoom und Pointer-/Touch-Interaktion in `assets/js/board/` trennen.
2. LSB-Canvas-Zeichnung in `assets/js/lsb/` auslagern.
3. LSB-Gruppenverwaltung, Wegpunktverwaltung, Kalibrierung und Messung weiter aufteilen.

Diese Schnitte sollten erst nach einem manuellen Test der aktuellen Phase erfolgen.

## Ziel

`tafel-app.js` ist jetzt kein Feature-Monolith mehr. Die wichtigsten Featurebereiche besitzen eigene Module, eigene DOM-Verwaltung und klar begrenzte State-Zugriffe. Die verbliebenen Kernbereiche sind bewusst als Phase 2 dokumentiert.
