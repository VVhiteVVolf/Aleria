# Karten-Template

Die Referenzkarte liegt unter `Karten/Cenyr/celtigerns-wacht/CeltigernsWachtKarte.html`.

Der neue zentrale Kartenlink fuer die Referenzkarte ist:

- `Karten/karte.html?map=cenyr-celtigerns-wacht`

Der Zukunftsplan liegt in `ZUKUNFTSPLAN.md`.

Die geplanten Grafschaftskarten von Cenyr liegen als Linkliste unter `Cenyr/GRAFSCHAFTEN-LINKS.md`.

Neue Karten werden langfristig nicht durch eigene HTML-Dateien angelegt. Stattdessen werden sie ueber `karte.html` und `karten.registry.js` geladen.

Geplante Links koennen bereits in der Registry stehen, auch wenn Kartenordner und Kartenbilder noch nicht existieren. Beispiel:

- `Karten/karte.html?map=cenyr`
- `Karten/karte.html?map=cenyr-celtigerns-wacht`
- `Karten/karte.html?map=cenyr-celtigerns-wacht-gwendolyns-ufer`
- `Karten/karte.html?map=cenyr-celtigerns-wacht-gwendolyns-ufer-morddyn`

## Validierung

Die Kartenstruktur kann lokal geprueft werden:

```bash
node Karten/tools/validate-karten-structure.mjs
```

Der Validator prueft:

- doppelte Karten-IDs
- ungueltige Status- und Typwerte
- stabile Links nach dem Muster `karte.html?map=<id>`
- aktive Karten auf Ordner, Config, Firebase-Doc-ID und Kartenbilder
- geplante Karten ohne erzwungene Ordner oder Bilder
- doppelte Bildinhalte als Warnung

Warnungen blockieren die Struktur nicht. Sie markieren Punkte fuer kontrollierte Bereinigung.

Aktueller Stand nach Asset-Bereinigung:

```txt
Errors: 0
Warnings: 0
```

Existierende Karten bekommen weiterhin einen eigenen Ordner in ihrer Welt-/Regionshierarchie. Beispiel:

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
- Neue Karten sollen kuenftig ueber `karten.registry.js` und `karte.html` erreichbar werden.
- Celtigerns Wacht laedt bereits ueber `karte.html?map=cenyr-celtigerns-wacht`.
- Geplante Registry-Eintraege zeigen ueber `karte.html?map=...` einen Platzhalter, bis Config und Kartenbilder existieren.
- `tools/validate-karten-structure.mjs` prueft Registry, aktive Kartenpfade und doppelte Bildinhalte.
- Bekannte Celtigerns-Wacht-Bildduplikate unter `Cenyr/Kartenbilder` wurden entfernt; die aktiven Bilder liegen unter `Cenyr/celtigerns-wacht/Kartenbilder`.
- Statische Template-Handler laufen ueber zentrale `data-*`-Attribute.
- LSB/Reise-Werkzeuge sind in eigene Module aufgeteilt.
- Pins, Kategorien, Datenmanager, DM-Werkzeuge, Suche, Map-View/Pan/Zoom und Editor sind aus dem Kern geloest.

Als aktueller technischer Startpunkt dient `_template/KartenTemplate.html` zusammen mit `_template/template.config.js`.

Uebergangsweise fuer eine neue wirklich existierende Karte:

1. Einen Registry-Eintrag mit stabiler `id` und `link` anlegen.
2. Erst wenn die Karte wirklich entsteht, den passenden Hierarchieordner anlegen.
3. Die drei Kartenbilder in den lokalen `Kartenbilder`-Ordner legen.
4. In der Config `mapId`, `title`, `documentTitle`, `images` und `firebase.docId` anpassen.
5. Keine neue HTML-Datei als Dauerloesung kopieren; die zentrale Shell soll diese Rolle uebernehmen.

Jede Karte bekommt durch `firebase.docId` einen eigenen Datensatz. Pins, Marker und DM-Daten werden daher nicht zwischen Karten geteilt.

Neue Karten sollen nur die gemeinsame Script-Reihenfolge aus dem Template uebernehmen. Feature-Logik wird nicht in Kartenordner kopiert.
