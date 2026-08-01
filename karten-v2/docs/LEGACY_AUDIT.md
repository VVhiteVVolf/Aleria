# Legacy Audit — `Karten/`

Diese Analyse dokumentiert den bestehenden Ordner `Karten/` (Stand: Untersuchung am 2026-08-01, unverändert gelassen — siehe Abnahme in `MIGRATION_REPORT.md`). Sie ist die Grundlage für die `FEATURE_PRESERVATION_MATRIX.md` und für den Rebuild in `karten-v2`.

`Karten` wurde **nicht** verändert, gelöscht oder umbenannt. Diese Datei enthält ausschließlich Lesebefunde.

## 1. Architektur-Überblick

`Karten` ist eine handgeschriebene Vanilla-JS-Anwendung ohne Build-Schritt, direkt als statische Dateien über Netlify ausgeliefert (`netlify.toml`: `publish = "."`). Kernidee (siehe `Karten/ARCHITEKTUR.md`, `Karten/ZUKUNFTSPLAN.md`):

- **Eine zentrale Shell** `karte.html` lädt jede Karte über `?map=<id>`.
- **Eine Registry** `karten.registry.js` listet alle existierenden und geplanten Karten mit Hierarchie, Status, Bildpfaden und Firebase-`docId`.
- **Gemeinsame Feature-Module** liegen in `assets/js/**` (Pins, Kategorien, Suche, DM-Werkzeuge, Reise-/Mess-Werkzeuge "LSB", Datenmanager) und binden sich über ein globales `window.KartoRuntime`-Objekt an einen zentralen State `S` in `karto-app.js`.
- **Persistenz** läuft vollständig über Firebase Firestore — ein Dokument pro Karte, der komplette App-State als ein einziger JSON-Blob (`{data: JSON.stringify(state), ts}`), synchronisiert per `onSnapshot` (siehe Abschnitt 5).
- **Kein Router, kein Framework, kein Bundler.** Skripte werden in fester Reihenfolge per `<script>`-Tags geladen; Kommunikation läuft über globale `window.Karto*`-Objekte und ein `data-action`-Event-Delegationsmuster (`assets/js/core/karto-actions.js`), das Inline-Handler ersetzt.

Zeilenzahl gesamt (JS/HTML/CSS/MD): ~9.200 Zeilen über 36 Dateien.

## 2. Ordnerstruktur (tatsächlich vorhanden)

```
Karten/
  karte.html                     zentrale Shell, liest ?map=<id>
  karten.registry.js             13 Karten-Einträge (2 active, 11 planned)
  ARCHITEKTUR.md, ZUKUNFTSPLAN.md, README.md   Konzeptdokumentation
  tools/validate-karten-structure.mjs   Registry-/Asset-Validator (Node, vm-Sandbox)
  assets/
    css/karto-map.css            ein gemeinsames Stylesheet, 981 Zeilen
    js/
      karto-app.js                Kern: State, Editmode, Titel/Icon-Edit, Tastatur, Init (924 Zeilen)
      karto-firebase.js           Firestore-Persistenz (ES-Modul, 71 Zeilen)
      core/
        karto-actions.js           data-action Event-Delegation (273 Zeilen)
        karto-bootstrap.js         Ein-Zeiler: ruft KartoInit() nach Skriptreihenfolge
      data/data-manager.js         Import/Export/Backup, 353 Zeilen
      dm/dm-tools.js                DM-Sitzungen, Notizen, Gruppenstatus, Tagebuch, 346 Zeilen
      lsb/                          Reise-/Mess-/Kalibrierwerkzeug ("LSB"), 7 Dateien, 1.452 Zeilen
      map/                          Pan/Zoom/Layer/Cursor, 4 Dateien, 160 Zeilen
      pins/                         Pins, Kategorien, Suche, Marker-Katalog, Editor, Stempel, 9 Dateien, 1.641 Zeilen
  _template/
    KartenTemplate.html            Referenz-/Fallback-HTML (identisch zur aktiven Karte, 661 Zeilen)
    template.config.js             Beispiel-Konfiguration
  Cenyr/
    celtigerns-wacht/               EINZIGE aktive Karte mit echten Bildern
      CeltigernsWachtKarte.html      alte Einzeldatei, als Kompatibilitätslink erhalten
      template.config.js
      Kartenbilder/CeltigernsWacht.png, ...Regionen.png, ...Marker.png
      llamrais-ankunft/herrschaft-der-wyrm/llysfaen-bannkreis/llysfaen/
        Llysfaens-Stadtkarte.html    zweite aktive Karte, OHNE eigene Bilder (Kind-Karte, Beispiel für Hierarchie)
        template.config.js
    Kartenbilder/GraueWeite{Normal,Regionen,Marker}.png   verwaiste Bilder (siehe Abschnitt 8)
    GRAFSCHAFTEN-LINKS.md           Linkliste der 9 Grafschaften von Cenyr
```

## 3. Kartenbilder — echte gemessene Maße

Alle sechs vorhandenen Kartenbild-Dateien tragen die Endung `.png`, sind aber **tatsächlich WebP-Dateien** (RIFF/WEBP-Container, `VP8X`-Chunk mit Alpha/erweitertem Format). Das ist eine echte technische Altlast: Browser rendern sie per Content-Sniffing trotzdem korrekt, aber ein Server, der anhand der Dateiendung einen `Content-Type: image/png`-Header setzt, liefert falsche Metadaten aus. Gemessen wurden die echten Pixelmaße direkt aus dem `VP8X`-Chunk (nicht geschätzt):

| Datei | gemessene Maße | tatsächliches Format |
| --- | ---: | --- |
| `Cenyr/celtigerns-wacht/Kartenbilder/CeltigernsWacht.png` | 4096 × 3072 | WebP (VP8X) |
| `Cenyr/celtigerns-wacht/Kartenbilder/CeltigernsWachtRegionen.png` | 4096 × 3072 | WebP (VP8X) |
| `Cenyr/celtigerns-wacht/Kartenbilder/CeltigernsWachtMarker.png` | 4096 × 3072 | WebP (VP8X) |
| `Cenyr/Kartenbilder/GraueWeiteNormal.png` | 4096 × 2492 | WebP (VP8X) |
| `Cenyr/Kartenbilder/GraueWeiteRegionen.png` | 4096 × 2492 | WebP (VP8X) |
| `Cenyr/Kartenbilder/GraueWeiteMarker.png` | 4096 × 2492 | WebP (VP8X) |

In `karten-v2` werden diese Dateien mit korrekter `.webp`-Endung kopiert (siehe `MIGRATION_REPORT.md`).

## 4. Koordinatensystem des Altsystems

Pin-, Wegpunkt-, Kalibrierungs- und Messpositionen sind **fraktionale Koordinaten (0–1), relativ zur natürlichen Pixelgröße des geladenen Kartenbildes**, Ursprung oben links, X nach rechts, Y nach unten:

```js
// Platzieren (pin-templates.js):
pin.x = mapX / image.width;   pin.y = mapY / image.height;
// Rendern (pin-renderer.js):
el.style.left = (pin.x * image.width) + 'px';
el.style.top  = (pin.y * image.height) + 'px';
```

Das gesamte `#map-stage`-Element (Bild + Pin-Layer) wird als Ganzes per CSS `transform:translate(vx,vy) scale(vz)` verschoben/gezoomt — Pan/Zoom passiert also einmal auf Stage-Ebene, nicht pro Pin. Die "LSB"-Reisewerkzeuge (Kalibrierung, Messen, Routen) verwenden exakt dieselbe 0–1-Konvention.

Das ist der wichtigste Befund für den Koordinatenadapter in `karten-v2`: `CRS.Simple` mit `bounds=[[0,0],[height,width]]` und eine zentrale Umrechnung `x*width, y*height → [lat,lng]` bildet dieses Verhalten exakt nach.

## 5. Datenmodell des Altsystems (aus Quellcode, nicht geraten)

### Pin
```js
{
  id, x, y,                       // uid(), 0..1 fraktional
  title, cat,                      // Titel, Kategorie-Fremdschlüssel
  pinMarker,                        // optionales Icon-Override (URL aus Marker-Katalog)
  img, imgLink, crest, crestLink,     // Vorschaubild, Wappen + Klick-Links
  banner, bannerLink,                   // Regionsbanner + Klick-Link
  region, house, faction,                 // Freitext-Zugehörigkeiten
  table: [{k,v}, ...],                      // frei definierbare Infozeilen
  text,                                       // Lore-Text, **fett**, *kursiv*, ---, [URL=..]..[/URL]
  secret                                        // boolean, nur im Editmode sichtbar
}
```
Kein Zoom-Sichtbarkeitsfeld pro Pin — Dot-/Label-Größe ist ein globaler Kartenwert (`dotSize`, `lblSize`).

### Kategorie
```js
{ id, label, color, marker? }   // marker = optionale URL aus dem Marker-Katalog
```
20 echte Standardkategorien sind im Code hinterlegt (`DEFAULT_CATS` in `karto-app.js`), u. a. Hauptstadt, Bauernsiedlung, Hafensiedlung, Burgsiedlung, Handelssiedlung, Brückensiedlung, Bergbausiedlung, Waldsiedlung, Kirchensiedlung, Leuchtturmsiedlung, Festungssiedlung, Taverne, Siedlungsruine, Stadtruine, Bardensiedlung, Stadt, Turmruine, Schiffswrack, Turnierplatz, Besondere Orte — jeweils mit fester Hex-Farbe.

### Marker-Katalog
```js
{ id, url, name, group? }
```
74 echte Einträge (`DEFAULT_MARKER_CATALOG`), alle mit funktionierenden Imgur-Bild-URLs, deutschen Namen und Gruppen (z. B. "Lager", "Dungeon", "Siedlungen", "Ruinen", "Gilden", "Städte", "Einzelne Orte"). Wird sowohl zur Auswahl eines Kategorie-Icons als auch eines Pin-Icons verwendet.

### Pin-Vorlagen (`PIN_TEMPLATES`)
6 Vorlagen mit vordefinierten Infozeilen-Labels: Siedlung/Ort, Einzelnes Gebäude, Naturgebiet/POI, Ruine, Monsterhort, Dungeon.

### Kartenregistry-Eintrag
```js
{
  id, title, status: active|planned|archived,
  type: kingdom|county|barony|city|region|local,
  hierarchy: [{level, slug, title}, ...],
  folder?, config?, images?: {normal, regions, pins},
  firebase?: {collection, docId, legacyImport?},
  link, legacyLink?, rulingHouse?, editableDraft?, reference?, notes?
}
```
13 Einträge: 1 Königreich (geplant), 9 Grafschaften (1 aktiv: Celtigerns Wacht, 8 geplant, jeweils mit echtem Herrschaftshaus), 2 Baronie/Stadt-Platzhalter unterhalb Celtigerns Wacht, 1 aktive lokale Stadtkarte (Llysfaen, Kind von Celtigerns Wacht → Llamrais Ankunft → Herrschaft der Wyrm → Llysfaen Bannkreis, ohne eigene Bilder — echtes Beispiel einer tiefen Hierarchie ohne Kartenbild).

### Persistenz-Dokument (Firestore)
Ein Dokument pro Karte (`karten/<docId>`), Feld `data` = **ein einziger JSON-String** mit dem kompletten State: `pins[]`, `cats[]`, `markerCatalog[]`, `dotSize`, `lblSize`, `regionIcon`, `regionTitle`, `mapImages{}`, `dm{sessions[],notes,groupStatus{}}`, `lsb{groups[],calScale,iconSize,customIcons[]}`.

**Wichtiger Befund (inzwischen für Celtigerns Wacht gelöst):** Ursprünglich existierte **keine lokale Datei** im Repository mit den tatsächlich gesetzten Pins/Routen für Celtigerns Wacht — diese Daten leben ausschließlich live in Firestore (Projekt `aleriaprojekt`, Collection `karten`, Dokument `cenyr-celtigerns-wacht`). Ein lesender Zugriff auf dieses Live-Firestore-Dokument wurde versucht (reiner GET, identisch zu dem, was jeder Kartenbesucher-Browser ohnehin lädt) und vom Sicherheits-Classifier des Agenten blockiert; dieser Versuch wurde **nicht** umgangen. Stattdessen exportierte der Nutzer die Daten manuell über den Daten-Manager des Altsystems und stellte die JSON-Datei direkt bereit. Nach Behebung eines Zeichenkodierungsfehlers im Export (siehe `KNOWN_LIMITATIONS.md`) wurden daraus **99 echte Pins** migriert, siehe `MIGRATION_REPORT.md`. Für Graue Weite gilt der ursprüngliche Befund weiterhin unverändert — dort liegt bislang kein Export vor.

## 6. UI-Funktionen (Ist-Zustand, aus Code + Markup)

| Bereich | Funktion |
| --- | --- |
| Topbar | Regions-Icon (editierbar), Titel (editierbar), Layer-Umschalter (Karte/Regionen/Markierungen), Live-Suche, Bearbeiten-Sperre (Passwort `7777`, hartkodiert), Pin setzen, Stempeln, Überschreiben, Kartenbilder-Link-Editor, Daten-Manager, DM-Menü, Dot-/Label-Größenregler, Sync-Status-Punkt |
| Karte | 3 Bild-Layer übereinander (Basis/Regionen/Marker-Overlay), Pan per Maus/Touch, Zoom per Wheel/Pinch/Tastatur (`f`=fit, `+`/`-`), `ResizeObserver`-basiertes Re-Fit |
| Pins | Setzen mit Vorlagenauswahl, Ziehen (Edit-Mode), Tooltip on-hover, Klick öffnet Detailansicht/Editor, geheime Pins (nur Editmode sichtbar), Kategoriefilter |
| Detailansicht | Eigene "Schriftrollen"-Pergamentkarte (`#scroll-card`): Wappen-Medaillon, Titel, Kategorie-Badge, Zugehörigkeiten, Banner, Bild+Infotabelle, Lore-Text mit Mini-Markdown |
| Editor | Vollbild-Sidebar mit Live-Vorschau-Split, alle Pin-Felder, Infotabellen-Editor mit Presets, Text-Formatierungs-Mini-Toolbar |
| Kategorien | Kategorie-Leiste (Filter), Kategorie-Manager (Cancel-sicheres Bearbeiten mit Temp-Kopie) |
| Marker-Katalog | Grid mit Suche/Gruppenfilter, Einzel- und Bulk-Import (CSV-artig) |
| Stempeln/Überschreiben | Pin duplizieren (alle Felder außer Position), gezielt einzelne Felder auf bestehende Pins übertragen (Checkbox-Auswahl) |
| Suche | Live-Substring-Suche über Titel, Sprung + Highlight + Öffnen |
| DM-Werkzeuge | Sitzungsprotokoll (CRUD, Gruppenzuordnung), Notizblock, Gruppenstatus (HP-Balken, Standort, Ressourcen), Reise-Tagebuch (abgeleitete Auswertung, Textexport) |
| LSB (Werkzeuge-Sidebar) | Kalibrierung (2 Punkte → km), Messwerkzeug, Reisegruppen mit Routen/Wegpunkten/Ereignissen, Reisezeitberechnung inkl. Verzögerungen, benutzerdefinierte Icons |
| Daten-Manager | Selektiver Export (Pins/Kategorien/Marker-Katalog/Sidebar/DM/Rahmen/Meta) als JSON, selektiver Import mit Merge/Replace, Backup-Verlauf (letzte 10 automatische Snapshots), Legacy-JSON-Import |
| Persistenz | Firestore Realtime-Sync, Sync-Status-Anzeige, automatisches Debounce-Save (800 ms) |

## 7. Technische Stärken

- Klare Modul-Trennung nach Feature (Pins, Kategorien, DM, LSB, Map) trotz fehlendem Bundler — sinnvolle Datei-/Verantwortungsgrenzen.
- Durchgängiges `data-action`-Event-Delegationsmuster statt Inline-Handler — sauberer als der Durchschnitt vergleichbarer Vanilla-JS-Projekte.
- `window.KartoRuntime` als bewusste Fassade zwischen Kern und Feature-Modulen (entkoppelt State-Zugriff).
- Cancel-sicheres Editieren (Temp-Kopien bei Kategorie-Manager, Editor-Vorschau vor Speichern).
- Registry-getriebenes Routing verhindert HTML-Datei-Wildwuchs bei vielen Karten — genau das richtige Muster für "hunderte Karten".
- Sinnvolles Datenmodell für Pins: freie Infotabelle (`table: [{k,v}]`) statt starrer Felder — bildet sehr unterschiedliche Ortstypen ab, ohne das Schema zu sprengen.
- Reisezeit-/Ereignis-Engine (LSB) ist inhaltlich durchdacht (Ereignistypen mit Verzögerung *und* Geschwindigkeits-Multiplikator, die über mehrere Segmente fortwirken).
- Marker-Katalog und Pin-Vorlagen sind bereits eine echte, gepflegte Content-Bibliothek (74 Icons, 6 Vorlagen) — keine Wegwerf-Beispieldaten.

## 8. Technische Schwächen / bekannte Fehler

- **Kein Koordinatensystem-Standard** im Sinne einer Bibliothek — alles handgerechnet (Pan/Zoom/Hit-Testing), fehleranfällig bei jeder neuen Interaktion (z. B. mehrfach separat implementierte Klick-vs-Drag-Unterscheidung).
- **Alles ein Firestore-Dokument pro Karte.** Kein Schema, keine Versionierung, kein partielles Laden — jede Änderung schreibt den kompletten State neu; bei vielen Pins/Routen wächst das Dokument unbegrenzt (Firestore-Dokumentlimit 1 MiB ist ein reales künftiges Risiko).
- **Hartkodiertes Editor-Passwort** (`'7777'`) direkt im Client-JS — keine echte Zugriffskontrolle, nur eine UI-Sperre; jeder Betrachter kann durch Lesen des Quellcodes bearbeiten. Explizit in `KNOWN_LIMITATIONS.md` als reales Sicherheitsproblem übernommen (Abschnitt 22 der Aufgabenstellung: "Ausblenden ist keine Sicherheitsmaßnahme").
- **Bilddateien mit falscher Endung** (WebP als `.png`, siehe Abschnitt 3).
- **Keine echte mobile Darstellung** — nur eine einzige Media Query (`max-width:900px`) für den Editor-Splitscreen; Topbar/Sidebar/Category-Bar haben kein durchdachtes Mobile-Layout.
- **Keine automatisierten Tests** irgendwo im Ordner.
- **Suche ist naive Substring-Suche nur über den Titel** — keine Tippfehlertoleranz, kein Ranking, durchsucht weder Tabellenzeilen noch Lore-Text noch Region/Haus/Fraktion.
- **Kein Zoom-abhängiges Pin-Verhalten** (min/maxZoom pro Feature) — nur eine globale Größe für alle Pins gleichzeitig; bei vielen Pins auf einer Karte keine Kollisionsvermeidung, kein Clustering.
- **Sichtbarkeit "secret" ist rein clientseitig.** Ein "geheimer" Pin liegt trotzdem unverschlüsselt im an jeden Browser ausgelieferten Firestore-Dokument — kein echter GM-Only-Schutz (bestätigt das Risiko aus Abschnitt 22 der Aufgabenstellung).
- **DM-Sitzungs-Speicherung verknüpft Gruppen positionsbasiert** (`saveSession()` zippt UI-Toggle-Reihenfolge gegen Array-Reihenfolge) statt über IDs — funktioniert nur, weil beide im selben Render-Zyklus entstehen; fragil bei künftigen Änderungen.
- **Kein Layer-/Pane-System** im Leaflet-Sinne — die drei Bild-Layer sind einfach drei `<img>`-Elemente mit Opacity-Umschaltung; es gibt keine feingranularen Ebenen (z. B. "nur Flüsse", "nur Handelsrouten") — nur die drei groben Bildvarianten.
- **`karto-app.js` ist mit 924 Zeilen der größte verbliebene Monolith-Rest** (State, Editmode, Titel/Icon-Editing, LSB-Glue-Code, Tastatur, Map-Interaktion-Listener) — laut `ARCHITEKTUR.md` selbst als "übergeordneter State" bewusst zentral gehalten, aber dadurch weiterhin sehr breit verantwortlich.

## 9. Wiederverwendbare Bestandteile (für `karten-v2` übernommen)

- Registry-Struktur und alle 13 Karten-Einträge inkl. Hierarchie und Herrschaftshäuser (`data/maps.json`, `data/regions... `siehe `DATA_SCHEMA.md`).
- Alle 20 Standardkategorien mit Originalfarben (`data/categories.json`).
- Alle 74 Marker-Katalog-Einträge mit Originalnamen/-gruppen/-URLs (`data/marker-catalog.json`).
- Alle 6 Pin-Vorlagen mit Originalfeldern (`data/pin-templates.json`).
- Die drei echten Celtigerns-Wacht-Kartenbilder in echter Auflösung (4096×3072), mit korrigierter `.webp`-Endung.
- Das visuelle Vokabular (Pergament/Gold/Ink-Palette, Cinzel/Cinzel Decorative/EB Garamond, "Schriftrollen"-Detailkarte als Gestaltungsidee, Topbar-Layer-Umschalter, Kategorie-Leiste) — technisch neu gebaut, optisch erkennbar an der alten Idee.
- Das fraktionale 0–1-Koordinatenkonzept als Vorbild für den `CRS.Simple`-Adapter.
- Das Prinzip "Registry statt HTML-Wildwuchs" für Kartenhierarchien — direkte Blaupause für `MapLink`/`parentMapId`/`childMapIds` in `karten-v2`.

Details und Migrationsentscheidung pro Funktion: siehe `FEATURE_PRESERVATION_MATRIX.md`.
