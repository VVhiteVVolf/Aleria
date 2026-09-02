# Anzeigetafeln-Architektur

Anzeigetafeln sind ein eigenständiges Feature und keine Sonderform einer Karte. Die gemeinsame Shell lädt anhand der Tafel-ID ausschließlich die passende Konfiguration und den Registry-Eintrag.

## Verantwortlichkeiten

```txt
Anzeigetafeln/
  tafel.html                         # einzige UI-Shell
  tafeln.registry.js                # IDs, Hierarchie, Bild- und Datenpfade
  assets/
    css/
      tafel.css                     # bestehende Grund- und Editorstile
      notice-board.css              # Ein-Ebenen-Tafel und Aushangdesigns
    js/
      tafel-app.js                  # kleine Runtime-Brücke und Initialisierung
      tafel-storage.js              # lokaler Entwurf, Laden, GitHub-Veröffentlichung
      core/
        tafel-state.js              # gekapselter Zustand und lokale Sicherungen
        tafel-actions.js            # zentrale Event-Delegation
        tafel-publish-ui.js         # bewusster Online-Publish
        tafel-bootstrap.js          # Startpunkt
      board/
        notice-board.js             # Tafelbild, Pan/Zoom, Platzierung
      data/
        notice-data-manager.js      # JSON-Import und -Export der Aushänge
      editor/
        notice-editor.js            # Bearbeitungsmodus und Editor-Shell
      notes/
        zettel-config.js            # Aushangtypen und neue Entwürfe
        zettel-board.js             # Aushänge auf dem Tafelbild
        zettel-editor.js            # Formulare für Aushänge
        zettel-scroll-views.js      # mittelalterliche Detailansichten
        zettel-comments.js          # Kommentare
```

## Zustandsmodell

Der Zustand der zweiten Schema-Version enthält nur Tafeldaten:

```js
{
  schemaVersion: 2,
  zettel: [],
  regionIcon: "",
  regionTitle: "Anzeigetafel",
  boardImages: { board: "..." },
  cardWidth: 1100
}
```

Alte Felder wie `pins`, `cats`, `markerCatalog`, Minimap- oder Routendaten werden beim Laden bewusst nicht in den aktiven Zustand übernommen.

## Datenfluss

1. Registry und Tafelkonfiguration bestimmen Identität, Hierarchie und Pfade.
2. Der veröffentlichte JSON-Stand wird geladen.
3. Ein vorhandener lokaler Entwurf darf diesen Stand für denselben Browser ergänzen.
4. Bearbeitungen sichern automatisch nur lokal.
5. `Auf GitHub veröffentlichen` sendet einen erwarteten Revisionsstand an den zentralen Publisher.
6. Bei einer abweichenden Online-Revision wird die Veröffentlichung abgebrochen statt fremde Änderungen zu überschreiben.

Damit bleiben Tafeln voneinander getrennt und alle Bedienlogik liegt in featurebezogenen Modulen.
