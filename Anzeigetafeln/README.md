# Anzeigetafeln

Der alte Ordner `Neocities/Anzeigetafeln` bleibt unveraendert.

Neue Anzeigetafeln liegen hierarchisch unter `Anzeigetafeln/`, z. B.:

- `Cenyr/celtigerns-wacht/baronie-gwendolyns-ufer/morddyn/`

Gemeinsame Ressourcen:

- `assets/css/tafel.css`
- `assets/js/tafel-app.js`
- `assets/js/tafel-firebase.js`
- `assets/js/core/tafel-actions.js`
- `assets/js/core/tafel-bootstrap.js`
- `assets/js/board/board-layers.js`
- `assets/js/board/board-viewport.js`
- `assets/js/data/data-manager.js`
- `assets/js/pins/pin-scroll-view.js`
- `assets/js/pins/pin-board.js`
- `assets/js/pins/pin-editor.js`
- `assets/js/pins/marker-catalog.js`
- `assets/js/pins/categories.js`
- `assets/js/lsb/lsb-config.js`
- `assets/js/lsb/lsb-calculations.js`
- `assets/js/lsb/lsb-diary.js`
- `assets/js/notes/zettel-config.js`
- `assets/js/notes/zettel-board.js`
- `assets/js/notes/zettel-scroll-views.js`
- `assets/js/notes/zettel-editor.js`

Die abgeschlossene Phase-1-Modularisierung und die geplanten Phase-2-Schnitte werden in `ARCHITEKTUR.md` dokumentiert.

Als Vorlage dient `_template/AnzeigetafelTemplate.html` mit `_template/tafel.config.js`.

Jede neue Tafel braucht eine eigene `firebase.docId`, damit Zettel, Marker, Kategorien und DM-Daten getrennt gespeichert werden.
