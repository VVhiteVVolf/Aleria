# Karten-Template

Die Referenzkarte wird über die zentrale Kartenoberfläche geladen:

- `Karten/karte.html?map=cenyr-celtigerns-wacht`

Der frühere Direktpfad `Karten/Cenyr/celtigerns-wacht/CeltigernsWachtKarte.html`
bleibt ausschließlich als Weiterleitung auf diese zentrale Ansicht erhalten.

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
- aktive Karten auf Config oder Registry-Bildlinks, dataPath und Kartenbilder
- lokale Bildpfade oder externe HTTP/HTTPS-Bildlinks, z. B. Imgur
- geplante Karten ohne erzwungene Ordner oder Bilder
- editierbare Entwurfskarten auf eigenen dataPath
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
- `assets/js/karto-storage.js`
- `assets/js/core/karto-actions.js`
- `assets/js/core/karto-publish-ui.js`
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
4. In der Config `mapId`, `title`, `documentTitle`, `images` und `storage.dataPath` anpassen.
5. Eine leere `data.json` im selben Ordner anlegen (siehe `_template/data.json` als Vorlage).
6. Keine neue HTML-Datei als Dauerloesung kopieren; die zentrale Shell soll diese Rolle uebernehmen.

## Karte mit Imgur-Bildern aktivieren

Wenn die Kartenbilder nicht in Git liegen sollen, kann eine aktive Karte direkt Imgur-Links in der Registry verwenden.

Dann braucht sie keine lokale Config-Datei. Beispiel:

```js
{
  id: "cenyr-vortigerns-ruh",
  title: "Vortigerns Ruh",
  status: MAP_STATUS.ACTIVE,
  type: MAP_TYPES.COUNTY,
  hierarchy: [
    { level: "kingdom", slug: "cenyr", title: "Cenyr" },
    { level: "county", slug: "vortigerns-ruh", title: "Vortigerns Ruh" },
  ],
  link: "karte.html?map=cenyr-vortigerns-ruh",
  images: {
    normal: "https://i.imgur.com/DEIN_NORMAL_BILD.png",
    regions: "https://i.imgur.com/DEIN_REGIONEN_BILD.png",
    pins: "https://i.imgur.com/DEIN_MARKER_BILD.png",
  },
  dataPath: "Cenyr/vortigerns-ruh/data.json",
}
```

Wichtig:

- `status` muss dann `MAP_STATUS.ACTIVE` sein.
- `images.normal`, `images.regions` und `images.pins` muessen gesetzt sein.
- `dataPath` (relativ zu `Karten/`) trennt die gespeicherten Pins und Daten von anderen Karten - die Datei muss existieren (leeres `data.json` reicht).
- Danach `node Karten/tools/validate-karten-structure.mjs` ausfuehren.

## Imgur-Links im Browser setzen

Fuer geplante Grafschaftskarten von Cenyr ist `editableDraft: true` gesetzt. Dadurch oeffnet der Kartenlink bereits die volle Kartenoberflaeche mit Platzhalterkarte.

Arbeitsablauf:

1. Karte oeffnen, z. B. `Karten/karte.html?map=cenyr-vortigerns-ruh`
2. `Bearbeiten` aktivieren
3. `Bilder` oeffnen
4. Imgur-Links fuer `Karte`, `Regionen` und `Markierungen` eintragen
5. speichern (landet sofort als lokaler Entwurf im Browser)
6. `🌐 Online speichern` klicken, um den Stand ins Repository zu committen - siehe `ARCHITEKTUR.md`, Abschnitt "Datenspeicherung"

Diese Bildlinks werden zusammen mit dem restlichen Kartenzustand in `Karten/<kartenordner>/data.json` gespeichert, sobald online gespeichert wurde. Bis dahin liegen sie nur lokal im Browser.

Jede Karte bekommt durch ihren eigenen `dataPath` eine eigene Datei. Pins, Marker und DM-Daten werden daher nicht zwischen Karten geteilt.

Neue Karten sollen nur die gemeinsame Script-Reihenfolge aus dem Template uebernehmen. Feature-Logik wird nicht in Kartenordner kopiert.
