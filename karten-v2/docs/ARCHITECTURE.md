# Architecture

## Stack

- **Vite** (dev server + production bundler), plain ES modules, no UI
  framework - matches the legacy module's vanilla-JS approach while fixing
  its lack of a build step / bundling / dependency management.
- **Leaflet 1.9.4** with `L.CRS.Simple` as the map engine.
- **Leaflet-Geoman Free** (`@geoman-io/leaflet-geoman-free`) for the editor
  drawing/editing toolbar.
- No framework, no state-management library. Modules communicate through
  an explicit `event-bus.js` and plain function calls - the legacy module's
  `window.KartoRuntime` facade pattern, reimplemented as real ES module
  boundaries instead of a global object.

## Directory layout

```
karten-v2/
  index.html            Vite entry HTML
  vite.config.js         base:'/karten-v2/' so a sub-path deploy resolves assets correctly
  package.json

  public/                 static assets served as-is (Vite convention)
    maps/                   real map images (.webp, corrected from the legacy .png-labelled files)

  src/
    main.js                bootstraps everything: registry, current map, URL sync, event wiring
    core/
      coordinate-system.js   pure toLeafletLatLng/fromLeafletLatLng adapter (see DATA_SCHEMA.md)
      map-registry.js         hierarchy lookups over data/maps.json (breadcrumb, children, parent)
      event-bus.js             minimal pub/sub
      validation.js             per-entry validators, never throws - callers skip bad entries
    map/
      create-map.js             L.map(...) with CRS.Simple, panes, maxBounds
      pane-manager.js            centralised z-index order for all overlay panes
      image-layer.js             L.imageOverlay per LayerDefinition
      marker-renderer.js         PointFeature[] -> Leaflet markers (category-colored dot or catalog icon)
      geometry-renderer.js       RegionFeature/RouteFeature -> polygons/polylines
      layer-manager.js           show/hide switchboard for all layer types
      map-navigation.js          reset view, center on point, fullscreen, invalidateSize
      distance-scale-control.js  unit-aware scale bar (mapDefinition.unitsPerPixel/unitName)
      default-icon-fix.js        Leaflet-under-Vite default marker icon fix
    editor/
      editor-controller.js       edit-mode feature store: CRUD, undo, Geoman event wiring, draft autosave
      geometry-editor.js         Geoman control config (only free-tier draw modes)
      feature-form.js            property editor form (pure DOM, reusable)
      import-export.js           export package builder / import validator (pure, unit tested)
      undo-history.js            bounded snapshot stack
    data/
      schema.js                  shared type constants (MAP_STATUS, FEATURE_VISIBILITY, ...), generateId()
      map-loader.js               imports data/*.json as ES modules, exposes assetUrl() for public/ files
      legacy-adapter.js            pure legacy-pin -> PointFeature field mapping (unit tested)
    storage/
      storage-service.js          namespaced localStorage wrapper (aleria.maps.v2.*)
      draft-storage.js             per-map draft persistence
    ui/
      map-toolbar.js, map-sidebar.js, layer-panel.js, search-panel.js,
      feature-details.js, map-selector.js   pure-DOM render functions, no framework
    styles/
      map.css, controls.css, sidebar.css, responsive.css

  data/                    canonical application data, hand- or tool-edited
    maps/<mapId>/             one self-contained folder per map - "jede Karte hat ihre eigene Registry + Marker"
      registry.json             MapDefinition (required)
      layers.json                 LayerDefinition[] (only maps with real content)
      locations.json               PointFeature[] (only maps with real content; empty array is fine)
      13 folders total: cenyr (kingdom) + 9 counties (Celtigerns Wacht, Graue Weite active;
      Vortigerns Ruh, Tal der Milane, Sonnenküste, Weidebucht, Ährental, Silberinsel,
      Klaueninseln planned) + Gwendolyns Ufer + Morddyn + Llysfaen (nested under Celtigerns Wacht)
    categories.json             20 categories, verbatim from the legacy DEFAULT_CATS (shared across maps)
    marker-catalog.json          74 marker icons, verbatim from the legacy DEFAULT_MARKER_CATALOG (shared)
    pin-templates.json            6 templates, verbatim from the legacy PIN_TEMPLATES (shared)
    regions.geojson, routes.geojson   empty FeatureCollections (no legacy vector data existed)
    legacy-export/                  drop folder for a real Firestore export, see MIGRATION_REPORT.md

  public/crests/             9 Cenyr ruling-house crests + 1 pennant banner (Haus Draig only),
                                copied from Stammbäume/assets/images/houses/ and
                                IconOrdner/Länder und Häuser Icons/ - see DATA_SCHEMA.md

  tools/
    migrate-legacy-data.js    Node CLI: converts data/legacy-export/<mapId>.json into locations.<mapId>.json
    validate-map-data.js       Node CLI: validates data/*.json, matches old validate-karten-structure.mjs's contract

  tests/                   `node --test`, no test framework dependency needed
```

## Data flow (viewer)

```
data/maps/*/registry.json (import.meta.glob) --> map-registry.js --> main.js picks current map from ?map=
                                          |
                                          v
                         create-map.js builds L.map + panes
                                          |
          data/maps/<mapId>/layers.json --> image-layer.js adds image-overlay LayerDefinitions
                                          |
data/maps/<mapId>/locations.json (+ any localStorage draft) --> marker-renderer.js / geometry-renderer.js
                                          |
                     click on a marker --> event-bus 'feature:select' --> map-sidebar.js shows feature-details.js
```

`src/data/map-loader.js` uses Vite's `import.meta.glob(..., { eager: true })` to statically import every `data/maps/*/registry.json` (and `layers.json`/`locations.json`) at build time - adding a new map is just adding a new folder, no central file to edit and no risk of merge conflicts between two people adding different maps at once.

## Data flow (editor)

```
"Bearbeiten" click --> editor-controller.enterEditMode() --> geometry-editor.initGeoman()
Geoman 'pm:create' --> editor-controller converts the drawn layer to a Point/Region/RouteFeature
                    --> event-bus 'feature:created' --> map-sidebar.js opens feature-form.js
Save --> editor-controller.updatePointFeature() --> re-render + debounced draft-storage.saveDraft()
Drag/reshape an EXISTING feature --> editor-controller.makeLayerEditable() binds pm:dragend/pm:edit
                                  --> geometry persisted WITHOUT a full re-render (see editor-controller.js comments)
```

## Why the published data can't be edited in-place

A static site (this one, like the rest of the Aleria project) can't write
back to its own `data/*.json` at runtime. `storage/draft-storage.js` keeps
in-browser edits in `localStorage` under versioned keys
(`aleria.maps.v2.drafts.<mapId>`); `editor/import-export.js` lets an author
export their draft as JSON to hand to whoever maintains the repository, who
commits it into `data/locations.json` (or a per-map file) as the new
published baseline. This mirrors the legacy module's Firebase-vs-published
split conceptually, but keeps this project's runtime dependency-free (no
Firebase SDK, no network write path) per the "no hidden runtime
dependencies" requirement.

## Coordinate system

See `core/coordinate-system.js` and `tests/coordinate-system.test.js` for
the full contract; summary: application map points are `{x, y}` in real
image pixels (not the legacy module's 0..1 fraction), origin configurable
per map (`top-left` or `bottom-left`), converted to Leaflet's `[lat, lng]`
under `CRS.Simple` via `lat = -y, lng = x` (top-left) or `lat = y, lng = x`
(bottom-left) - the standard "no height-dependent flip needed" trick from
Leaflet's own CRS.Simple examples.
