# Karten-Template

Die Referenzkarte liegt unter `Karten/Cenyr/celtigerns-wacht/CeltigernsWachtKarte.html`.

Neue Karten sollen jeweils einen eigenen Ordner in ihrer Welt-/Regionshierarchie bekommen. Beispiel:

- `Karten/Cenyr/celtigerns-wacht/`
- `Karten/Cenyr/celtigerns-wacht/baronie-example/`

Die gemeinsame Technik liegt in:

- `assets/css/karto-map.css`
- `assets/js/karto-app.js`
- `assets/js/karto-firebase.js`
- `assets/js/core/karto-actions.js`
- `assets/js/core/karto-bootstrap.js`
- `assets/js/data/data-manager.js`
- `assets/js/dm/dm-tools.js`
- `assets/js/lsb/lsb-config.js`
- `assets/js/lsb/lsb-calculations.js`
- `assets/js/lsb/lsb-tools.js`
- `assets/js/lsb/lsb-canvas.js`
- `assets/js/lsb/lsb-interaction.js`
- `assets/js/lsb/lsb-groups.js`
- `assets/js/lsb/lsb-modals.js`
- `assets/js/map/map-interaction.js`
- `assets/js/map/map-panning.js`
- `assets/js/map/map-panzoom.js`
- `assets/js/map/map-view.js`
- `assets/js/pins/categories.js`
- `assets/js/pins/marker-catalog.js`
- `assets/js/pins/pin-detail-view.js`
- `assets/js/pins/pin-editor.js`
- `assets/js/pins/pin-renderer.js`
- `assets/js/pins/pin-templates.js`
- `assets/js/pins/stamp-overwrite.js`
- `assets/js/pins/search.js`

## Status

Die Kartenbasis ist modularisiert und bereit als Grundlage fuer weitere Karten.

- Gemeinsame Logik liegt in `assets/js`.
- Neue Karten kopieren nur Template, Config und Kartenbilder.
- Statische Template-Handler laufen ueber zentrale `data-*`-Attribute.
- LSB/Reise-Werkzeuge sind in eigene Module aufgeteilt.
- Pins, Kategorien, Datenmanager, DM-Werkzeuge, Suche, Map-View/Pan/Zoom und Editor sind aus dem Kern geloest.

Als Startpunkt dient `_template/KartenTemplate.html` zusammen mit `_template/template.config.js`.

Fuer eine neue Karte:

1. `_template` in den passenden Hierarchieordner kopieren, z. B. `Cenyr/celtigerns-wacht`.
2. Die drei Kartenbilder in den lokalen `Kartenbilder`-Ordner legen.
3. In der Config `mapId`, `title`, `documentTitle`, `images` und `firebase.docId` anpassen.

Jede Karte bekommt durch `firebase.docId` einen eigenen Datensatz. Pins, Marker und DM-Daten werden daher nicht zwischen Karten geteilt.

Neue Karten sollen nur die gemeinsame Script-Reihenfolge aus dem Template uebernehmen. Feature-Logik wird nicht in Kartenordner kopiert.
