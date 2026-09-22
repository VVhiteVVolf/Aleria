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
      notice-documents.css          # inhaltsabhängige Vorlagen und Faktenblöcke
      notice-media.css              # Bildplätze und gemeinsame Bildauswahl
      notice-theme.css              # Tafelshell, Editor und Kommentare
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
        zettel-document-views.js    # Mitteilungen, Vermisst, Zeitung, Steckbrief,
                                   # Ankündigung, Handel, Erlass und Einladung
        zettel-comments.js          # Kommentare
      media/
        notice-media-model.js       # Bildquellen, Platzhalter, Charakterlinks
        notice-media-picker.js      # ein Dialog für sämtliche Bildplätze
        notice-media-upload.js      # lokale Bildverkleinerung und Einbettung
        notice-character-catalog.mjs # lesender Zugriff auf Stammbaumregister
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

## Vorlagen und Bilder

Quest/Auftrag behält sein Pergamentlayout. Die übrigen Vorlagen verwenden Faktenblöcke mit natürlicher Höhe statt über die gesamte Texthöhe gestreckter Infospalten. Nicht ausgefüllte Fakten bleiben im Editor erhalten und werden in der Leseansicht ausgelassen. Die Detailansichten verändern keine gespeicherten Daten. Bestehende Steckbriefe ohne `personen` werden beim Öffnen des Editors in dessen Personenformular übernommen.

Alle Bildplätze verwenden denselben Dialog: Iconverzeichnis (bestehendes `ALERIA_ICON_DIRECTORY` und Karten-Medienregister), alphabetische Charakterliste mit Namens-/Familienfilter, Upload und Bildlink einschließlich Imgur-Einzelbildern. Auch Kommentare und das Tafelsymbol verwenden diesen Dialog. Charakterdaten werden erst bei Bedarf über das bestehende Stammbaumregister und dessen veröffentlichte Familien geladen; Namensbildung, Registerabgleich und Publikations-Repository werden wiederverwendet. Hier gibt es keine eigenen Firebase-Zugriffe.

Die alten Bildfelder `bild`, `portrait` und `verfasser` bleiben Zeichenketten. `emblem`, `siegel` und `unterschrift` ergänzen die Plätze. Optionale Metadaten liegen in `media[field]`; Charakterreferenzen enthalten `familyId`, `personId`, `name` und das zugehörige Bild. Links werden daraus ausschließlich zur Stammbaumansicht erzeugt. Ein manuell ersetztes Bild verliert eine nicht mehr passende Charakterverknüpfung. Alle Plätze haben einen Platzhalter, auch bei Ladefehlern.

Uploads werden im Browser auf maximal 1200 Pixel verkleinert und als WebP im bestehenden JSON-Entwurf eingebettet (maximal 12 MB Quelldatei und 600.000 Zeichen nach Umwandlung). Es gibt keinen zusätzlichen Upload-Dienst. GIFs werden als Standbild übernommen; Imgur-Alben erfordern einen Einzelbildlink. Bei ausgeschöpftem lokalem Speicher meldet der gemeinsame Speicherweg einen Fehler und der Editor bleibt geöffnet. Import, Export und bewusste Veröffentlichung verwenden unverändert denselben Zustand einschließlich Bildmetadaten und Kommentaren.

Prüfungen: `node Anzeigetafeln/tests/notice-documents.test.mjs`, die vorhandenen Tafeltests sowie `node Anzeigetafeln/tools/validate-tafeln-structure.mjs`. Browserprüfung mit isolierten lokalen Beispieldaten: neun Vorlagen, Desktop/768/390 Pixel, Icons, Stammbaumverknüpfung, Upload, Imgur, Platzhalter, Kommentare, Speichern/Neuladen und voller Speicher.
