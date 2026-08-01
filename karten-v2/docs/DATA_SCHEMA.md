# Data Schema

`schemaVersion: 1` everywhere. Types are defined as JSDoc typedefs in
`src/data/schema.js` (source of truth); this document is the human-readable
summary. Runtime validation lives in `src/core/validation.js` - a single
invalid entry is skipped with a console warning, never crashes the app.

## Coordinate convention

Every geometry (`PointFeature.geometry.coordinates`, `RegionFeature`,
`RouteFeature`) stores coordinates as **`[x, y]` in real image pixels** of
the owning map's source image - not 0..1 fractions (unlike the legacy
module, see `LEGACY_AUDIT.md` section 4) and not geographic lon/lat.
`MapDefinition.coordinateOrigin` (`"top-left"` or `"bottom-left"`) says
which corner is `(0, 0)` and which way `y` grows; `core/coordinate-system.js`
is the only place that converts between this and Leaflet's `[lat, lng]`.

## File layout: one folder per map

```
data/maps/<mapId>/
  registry.json    MapDefinition (required)
  layers.json        LayerDefinition[] (only if the map has real content)
  locations.json       PointFeature[] (only if the map has real content)
```

`registry.json`'s `id` must equal the folder name (`tools/validate-map-data.js`
checks this). Shared vocabularies that aren't map-specific
(`categories.json`, `marker-catalog.json`, `pin-templates.json`,
`regions.geojson`, `routes.geojson`) stay as single top-level files under
`data/`.

## MapDefinition (`data/maps/<mapId>/registry.json`)

```js
{
  schemaVersion: 1,
  id: "cenyr-celtigerns-wacht",
  legacyId: "cenyr-celtigerns-wacht",   // cross-reference to Karten/karten.registry.js, for audit traceability
  title: "Celtigerns Wacht",
  documentTitle: "Celtigerns Wacht - Aleria",
  status: "active" | "planned" | "archived",
  type: "kingdom" | "county" | "barony" | "city" | "region" | "local",
  image: "maps/celtigerns-wacht/base.webp" | null,     // relative to public/, via assetUrl()
  regionsImage: "maps/celtigerns-wacht/regions.webp",  // optional second/third raster overlay
  markersImage: "maps/celtigerns-wacht/markers.webp",
  width: 4096 | null,     // real measured pixel width - see LEGACY_AUDIT.md section 3, never estimated
  height: 3072 | null,
  coordinateOrigin: "top-left",
  minZoom: -4, maxZoom: 4, zoomSnap: 0.25,
  unitsPerPixel: 1,        // real-world/in-fiction units per image pixel, for the distance-scale control
  unitName: "Meilen",
  parentMapId: "cenyr" | null,
  childMapIds: ["cenyr-celtigerns-wacht-gwendolyns-ufer", ...],
  initialView: { x: 2048, y: 1536, zoom: -2 } | null,
  hierarchy: [{ level: "kingdom", slug: "cenyr", title: "Cenyr" }, ...],
  rulingHouse: "Haus Draig",       // optional, carried over from the legacy registry
  rulingHouseCrest: "crests/haus-draig.png",  // optional, path under public/ - see "House crests" below
  rulingHouseBanner: "crests/haus-draig-banner.png",  // optional, pennant graphic - only Haus Draig has one today
  capital: "Gwynthor",                 // optional, metadata only - no fabricated pin placement backs this
  reference: true,                    // optional, marks the "reference map" (only cenyr-celtigerns-wacht)
  notes: "...",                          // optional, migration/decision notes
  legacyStatus: "active",                  // optional, set only where v2's stricter rule downgraded the status (see below)
  legacyEditableDraft: true                   // optional
}
```

## House crests (`public/crests/`)

The 9 Cenyr ruling-house crests plus one pennant banner, copied from
`Stammbäume/assets/images/houses/<County>/haus-<name>.png` (already
real, already part of the Aleria project) and
`IconOrdner/Länder und Häuser Icons/Haus Draig/Celtigerns Wacht Langes
Banner.png`:

| House | County | File |
| --- | --- | --- |
| Draig | Celtigerns Wacht | `crests/haus-draig.png` + `crests/haus-draig-banner.png` |
| Pendrag | Vortigerns Ruh (royal, see registry notes) | `crests/haus-pendrag.png` |
| Aderyn | Tal der Milane | `crests/haus-aderyn.png` |
| Illewod | Sonnenküste | `crests/haus-illewod.png` |
| Pysgod | Graue Weite | `crests/haus-pysgod.png` |
| Wylan | Weidebucht | `crests/haus-wylan.png` |
| Grawn | Ährental | `crests/haus-grawn.png` |
| Neidr | Silberinsel | `crests/haus-neidr.png` |
| Arth | Klaueninseln | `crests/haus-arth.png` |

Only Haus Draig has a pennant/banner-shaped asset today (368×734, vertical);
the other 8 houses only have square crests (~850-930 px, ~1:1) - no banner
art was invented to fill that gap. `tools/validate-map-data.js` checks that
every `rulingHouseCrest`/`rulingHouseBanner` path actually resolves under
`public/`.

**Known spelling conflict, not resolved unilaterally:** the legacy `Karten`
registry and this project both use **"Klaueninseln"** (plural), while
`Stammbäume/assets/js/data/cenyr-county-house-profiles.js` uses
**"Klaueninsel"** (singular). `data/maps/cenyr-klaueninseln/registry.json`
flags this in its `notes` rather than silently picking one.

**Deliberate deviation from the legacy schema:** `status: "active"`
requires a real `image` + `width` + `height` in v2. The legacy registry
allowed `status: "active"` with `editableDraft: true` and no image at all
(e.g. the Llysfaen city map). Those entries are `"planned"` here instead,
with `legacyStatus`/`legacyEditableDraft` recording what the old registry
said, so nothing is silently lost - see `MIGRATION_REPORT.md`.

## LayerDefinition (`data/layers.json`)

```js
{
  id: "cenyr-celtigerns-wacht-base",
  mapId: "cenyr-celtigerns-wacht",
  name: "Karte",
  type: "image-overlay" | "marker" | "region" | "route",
  defaultVisible: true,
  editable: false,
  minZoom: -4, maxZoom: 4,     // optional
  pane: "base-map-pane",         // must be one of pane-manager.js's PANE_ORDER
  image: "maps/celtigerns-wacht/base.webp"   // only for type "image-overlay"
}
```

## FeatureCategory (`data/categories.json`)

```js
{ id: "mmflrbzxydg7", label: "Hauptstadt", color: "#ff0000", marker: "https://…" /* optional */ }
```

20 entries, verbatim from the legacy `DEFAULT_CATS`.

## MarkerCatalogItem (`data/marker-catalog.json`)

```js
{ id: "mmhy1v2v5vo1", url: "https://i.imgur.com/si6Lzp4.png", name: "Lager, Camp", group: "Lager" }
```

74 entries, verbatim from the legacy `DEFAULT_MARKER_CATALOG`.

## PointFeature (`data/locations.json`, or `data/locations.<mapId>.json` after a migration run)

```js
{
  schemaVersion: 1,
  id: "p-abc123",
  mapId: "cenyr-celtigerns-wacht",
  kind: "PointFeature",
  type: "settlement",                 // free text, e.g. "settlement" | "dungeon" | "ruin" ...
  name: "Gwynthor",
  description: "Sitz des Hauses Draig.",
  geometry: { type: "Point", coordinates: [1420, 730] },   // real pixels, see above
  categoryId: "mmflrbzxydg7",           // foreign key into categories.json
  layerId: "cenyr-celtigerns-wacht-settlements",
  iconId: "https://…",                    // optional marker-catalog URL override
  linkedEntityId: "location-gwynthor",      // optional external lore-page reference
  linkedMapId: "gwynthor-stadtkarte",         // optional child MapDefinition id
  minZoom: -2, maxZoom: 4,                      // optional, currently unused by the renderer (global dot size instead, like the legacy module)
  visibility: "public" | "discovered" | "hidden" | "gm-only",
  tags: ["Hauptstadt", "Draig"],
  table: [{ k: "Bevölkerung", v: "4000" }],        // free-form info rows, straight from the legacy pin model
  region: "", house: "", faction: "",                 // free-text affiliations
  image: "", imageLink: "", crest: "", crestLink: "", banner: "", bannerLink: ""   // all optional
}
```

## RegionFeature / RouteFeature

Same envelope as `PointFeature` (`schemaVersion`, `id`, `mapId`, `kind`,
`name`, `visibility`, `tags`) but `geometry.type` is `"Polygon"` (ring array,
first ring only currently used) or `"LineString"`. No legacy equivalent
existed as data (regions were a painted image overlay, not vectors) - see
`FEATURE_PRESERVATION_MATRIX.md`.

## Validation contract

`core/validation.js` exports `validateMapDefinition`, `validatePointFeature`,
`validateCategory`, and a generic `validateAll(entries, validator)` that
splits a list into `{ valid, invalid }` - `invalid` entries carry their
original object plus an `errors: string[]`. Every loader in this codebase
(`map-registry.js`, `tools/validate-map-data.js`,
`editor/import-export.js`) uses this instead of trusting input shape.
