# Hausüberarbeitung Celtigerns Wacht · 24. Oktober 2026

Der fachliche Bericht steht in
`Familien Häuser und Clans/CELTIGERNS-WACHT-2026-10-24.md`.

- `inventory.json`: ursprünglicher Abgleich von 92 Familien, acht fehlenden Seiten und Bildern.
- `source-details.json`: gelesene aktuelle Registerangaben für ergänzte Hausinhalte.
- `source-audit.json`: Hashes der acht eingereichten HTML-Originale und Archivziele.
- `previous-defaults.json`: frühere ausgelieferte Bios, Revisionen und Graph-Fingerprints für die gezielte Migration und Erhaltungsprüfung.
- `editorial-additions.mjs`: redaktioneller Übernahmebeleg aus den aktuellen Familien- und Betriebsquellen.
- `refresh-audit.json`: bearbeitete Hausquellen und Revisionen.
- `image-jobs.json`: Motivaufträge; endgültige Prompts und Dateien werden in `image-prompts.json` dokumentiert.

Die Übernahmeskripte wurden einmalig für diese Erweiterung verwendet. Die künftige
Redaktion erfolgt direkt in der jeweiligen `haus.content.mjs`, anschließend über
`node "Familien Häuser und Clans/scripts/build-house-content.mjs"`.
`refresh-houses.mjs` nicht als regulären Build ausführen: Es bildet den einmaligen
Quellenstand dieses Auftrags ab.

Keine alte HTML-Genealogie wurde importiert. Keine Firebase-Schreiboperationen,
keine Veränderungen an Live-Kampfressourcen oder historischen Würfen.
