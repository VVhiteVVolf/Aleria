# Anzeigetafeln

`Anzeigetafeln` ist ein eigenes Aushangsystem. Es verwendet weder das Kartenmodul noch dessen Orts-Pins, Regionen, Markierungen, Kategorien oder Reiseverwaltung.

Jede Tafel besitzt genau:

- ein Tafelbild
- eine Ebene mit frei platzierbaren Aushängen
- einen lokalen Browserentwurf
- eine ausdrücklich ausgelöste Veröffentlichung in die GitHub-Registry

Stabile Links laufen über die gemeinsame Shell:

```txt
tafel.html?tafel=<tafel-id>
```

## Gemeinsame Module

```txt
tafel.html
tafeln.registry.js
assets/css/tafel.css
assets/css/notice-board.css
assets/js/tafel-app.js
assets/js/tafel-storage.js
assets/js/core/tafel-state.js
assets/js/core/tafel-actions.js
assets/js/core/tafel-publish-ui.js
assets/js/core/tafel-bootstrap.js
assets/js/board/notice-board.js
assets/js/data/notice-data-manager.js
assets/js/editor/notice-editor.js
assets/js/notes/
```

Neue Tafeln erhalten keine kopierte HTML-Datei. Sie werden über einen Registry-Eintrag, eine kleine Konfiguration und eine eigene versionierte Datendatei angelegt. Der genaue Ablauf steht in `NEUE-TAFEL.md`.

## Speichern

Änderungen werden während der Bearbeitung automatisch als lokaler Entwurf im Browser gesichert. Erst `Auf GitHub veröffentlichen` schreibt den geprüften Stand über die Netlify-Funktion in die Datendatei der jeweiligen Tafel. Ein Revisionsabgleich schützt vor dem Überschreiben neuerer Online-Stände.

## Struktur prüfen

```bash
node Anzeigetafeln/tools/validate-tafeln-structure.mjs
```
