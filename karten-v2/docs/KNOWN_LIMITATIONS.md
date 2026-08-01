# Known Limitations

Honest list of what this iteration does **not** do, and why. Cross-referenced
with `FEATURE_PRESERVATION_MATRIX.md` for the per-feature decision.

## Real pin data: resolved for Celtigerns Wacht, still open for Graue Weite

A live read of the Firestore document was attempted once from the
terminal and blocked by the coding agent's own safety controls (respected,
not retried). The user then exported Celtigerns Wacht's real data manually
from the old app's Daten-Manager and provided the JSON directly. That
export (`data/legacy-export/cenyr-celtigerns-wacht.json`) had a mojibake
encoding problem - UTF-8 text misread as Latin-1 somewhere in its export
pipeline (`"Führung"` had become `"FÃ¼hrung"`). This was fixed
mechanically, not by hand-editing strings: a `Buffer.from(text,
'latin1').toString('utf8')` round trip recovers any two-byte UTF-8
sequence that was misread this way, which resolved the vast majority of
the text automatically. A second, smaller pass was needed for characters
whose second UTF-8 byte falls in the Latin-1 C1-control range (`ß`, `Ü`,
and an em dash `—`) - the pipeline that mangled the file had already
dropped that second byte before the text ever reached this project, so no
round trip could recover it from the file alone. Those ~62 spots were
identified mechanically (every leftover U+FFFD replacement character after
the round trip marks exactly one of these), and disambiguated by pattern:
a lone replacement character followed by `b` is `Ü` (`Übergänge`,
`Überreste`, ...), one surrounded by spaces is an em dash, and every other
remaining one is `ß` - verified against the actual German words in
context (`großer`, `außerdem`, `Straße`, `regelmäßig`, ...), not assumed.
`tools/fix-mojibake-once.mjs` documents the first-pass fix; the
context-dependent second pass was applied once, directly, and is not
scripted for reuse since it relied on manually reviewing every occurrence.

Result: **99 real pins migrated** for Celtigerns Wacht (see
`MIGRATION_REPORT.md`), all with their original coordinates, categories,
lore text, crests/banners, and info tables intact.

Graue Weite has no known equivalent export yet - `tools/migrate-legacy-data.js`
and `src/data/legacy-adapter.js` remain ready to run the moment one exists
(same process: old app -> edit mode -> Daten-Manager -> Export -> save into
`data/legacy-export/cenyr-graue-weite.json` -> `npm run migrate:legacy`).
No pin content was invented to fill that remaining gap.

## Deferred features (present in the legacy module, not rebuilt here)

All of these have a real data-model home already (so building the UI for
them later doesn't require another schema change) but no UI in this
iteration:

- **Stempeln / Überschreiben** (clone-a-pin, bulk field-patch tools).
- **DM-Werkzeuge**: Sitzungsprotokoll, Notizblock, Gruppenstatus, Reise-
  Tagebuch. No data shape was even ported for these yet - they're
  Firestore-shaped in the legacy module and weren't judged essential to
  prove the Leaflet/CRS.Simple rebuild.
- **LSB (Kalibrierung/Messen/Reisegruppen mit Routen und Ereignissen)**:
  `MapDefinition.unitsPerPixel`/`unitName` and the coordinate system are in
  place (the foundation the spec asked for, Abschnitt 21), and
  `RouteFeature` can already be drawn/edited via Geoman - but the
  calibration workflow, the ruler tool, and the travel-time/event
  simulation engine (with its per-event-type delay + speed-multiplier
  rules) were not reimplemented. No travel speeds or game rules were
  invented to fill the gap, per the instruction not to.
- **Firestore realtime sync / multi-user editing.** This iteration is
  offline-first (localStorage drafts + JSON export/import) by design, to
  keep the "no hidden runtime dependencies" requirement airtight. Adding a
  sync backend later is a deliberate, separate decision - not something to
  bolt on silently.
- **Marker-catalog management UI** (bulk CSV-style import, add/edit/delete
  in-browser). The catalog itself is fully migrated as data and used by the
  editor's icon picker is not yet wired up as a picker UI (`iconId` can be
  set via the property form's text field only, not a visual grid like the
  legacy `pinmkr-mo` modal).
- **Category manager UI.** Categories are migrated as data and used
  throughout (filters, colors, badges); there is no in-app "add/edit/reorder
  categories" screen yet.

## Editor scope

- Undo is a flat snapshot stack (`editor/undo-history.js`), not a
  field-level diff/redo system.
- Dragging an existing marker or reshaping an existing polygon/polyline
  persists silently (no visible "saved" toast) - only newly drawn shapes
  and form saves show a property panel.
- No password/access-control gate on edit mode (the legacy module's
  `PASSWORD = '7777'` was a fake client-side lock, not real security - see
  `LEGACY_AUDIT.md` section 8 - and was deliberately not reproduced,
  fake or otherwise, per Abschnitt 22 of the brief).

## Visibility / GM-only data

`visibility: "gm-only"` and `"hidden"` are modeled and the marker renderer
dims/dashes them, but **this is cosmetic, not security** - exactly the
trap the brief warns against (Abschnitt 22). Because `data/locations.json`
is a plain static file shipped to every visitor, anything marked
`gm-only` today is still visible to anyone who reads the JSON directly.
Real GM secrets need a separate, non-published data source (a locally
imported GM-only file, or eventually a real authenticated backend) - not
built in this iteration, flagged here so it's never mistaken for done.

## Network dependency

One remaining external network call: Google Fonts (`fonts.googleapis.com`)
in `index.html`, matching the legacy module's font choice. Everything else
(Leaflet, Geoman, app code, map images, data) is bundled/local - no CDN
script tags, per the brief's "keine CDN-Abhängigkeiten" instruction for
the *library* dependencies specifically.

## Distance/scale control

`map/distance-scale-control.js` is a small custom control (Leaflet's
built-in `L.Control.Scale` always labels its bar "m"/"km"/"mi", which would
be actively wrong for a fantasy map's own unit system) - it does the same
"round to a nice number" math but labels using `MapDefinition.unitsPerPixel`
+ `unitName`. It reflects a straight-line pixel distance at the map's
current zoom, not the more advanced "distance along a drawn route" API the
brief describes for Abschnitt 21 - `RouteFeature` geometry exists and could
back that later, but the calculation itself isn't built yet.

## Responsive testing

CSS breakpoints exist (`styles/responsive.css`) for tablet/phone widths,
touch-target sizing, and a collapsible layer panel, and touch pan/zoom
comes for free from Leaflet. This was verified by DOM/CSS review and a
1400x900 desktop-viewport browser smoke test (see `MIGRATION_REPORT.md`'s
sibling test run), not by testing on an actual phone/tablet device or a
narrow-viewport headless run - flagged rather than claimed as fully proven.

## Second migrated map (Graue Weite)

`cenyr-graue-weite` is wired up as a second real, active map using real
image assets that existed in the old repository but were never connected
to a registry entry there (see `LEGACY_AUDIT.md` section 8). This was a
judgment call to demonstrate genuine multi-map support without inventing
any content - the images and their filenames are real; the decision to
promote the map to "active" in `karten-v2` is new and is called out
explicitly in `data/maps.json`'s `notes` field for that entry.
