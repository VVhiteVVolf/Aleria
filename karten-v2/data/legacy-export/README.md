# Legacy export drop folder

Place a JSON export from the old `Karten` module's "Daten-Manager" (or a raw
Firestore document dump of `karten/<mapId>`) here, named `<mapId>.json`
(e.g. `cenyr-celtigerns-wacht.json`), then run:

```
npm run migrate:legacy
```

This folder is empty by default - no real pin data was accessible offline
at the time `karten-v2` was built. See `../../docs/MIGRATION_REPORT.md` and
`../../docs/LEGACY_AUDIT.md` (section 5) for why.
