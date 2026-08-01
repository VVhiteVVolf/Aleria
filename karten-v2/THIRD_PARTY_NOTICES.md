# Third-Party Notices

`karten-v2` uses the following third-party packages at runtime. Full license
texts are copied into `licenses/`.

| Package | Version | License | Purpose |
| --- | --- | --- | --- |
| [Leaflet](https://leafletjs.com/) | 1.9.4 (pinned, stable) | BSD-2-Clause | Map rendering engine (`L.CRS.Simple`, panes, image overlays, controls) |
| [@geoman-io/leaflet-geoman-free](https://geoman.io/) | ^2.20.0 | MIT | In-browser drawing/editing toolbar (marker/line/polygon/rectangle, edit, drag, removal) - free-tier only, no Pro features or license key used |

Dev-only dependency (not shipped to the browser bundle):

| Package | Version | License | Purpose |
| --- | --- | --- | --- |
| [Vite](https://vitejs.dev/) | ^5.4 | MIT | Dev server and production bundler |

## Fonts

`index.html` loads `Cinzel`, `Cinzel Decorative`, and `EB Garamond` from
Google Fonts (`fonts.googleapis.com`), all licensed under the SIL Open Font
License. This mirrors the legacy `Karten` module's font choice
(`Karten/karte.html`) and is the one external network dependency this
project has - see `docs/KNOWN_LIMITATIONS.md`.

## Map images and content

The three Celtigerns Wacht map images and three Graue Weite map images
under `public/maps/` are copies of pre-existing assets from this repository
(`Karten/Cenyr/celtigerns-wacht/Kartenbilder/` and
`Karten/Cenyr/Kartenbilder/`), already part of the Aleria project before
this work began. They were not newly generated or sourced externally.

The marker-catalog icon URLs in `data/marker-catalog.json` (74 entries)
point to `i.imgur.com`, copied verbatim from the legacy module's
`DEFAULT_MARKER_CATALOG` (`Karten/assets/js/karto-app.js`) - these were
already in use by the existing project and are not newly introduced.

## Dependency vulnerability check

`npm audit` was run after installing dependencies. The only remaining
finding is a moderate-severity advisory in `esbuild` (bundled transitively
by Vite 5.x, dev-server only - it is never shipped to the production
bundle): allows a malicious website to proxy requests through the local
dev server. Not exploitable in production; mitigated by not exposing the
dev server (`vite`/`--host`) to untrusted networks. An earlier
high-severity `lodash` advisory (via `@geoman-io/leaflet-geoman-free`
2.11.1-2.19.0) was resolved by pinning to `^2.20.0`.
