# Die goldene Fassung

Zehn native Almanachseiten: Laden, Gruppenbild und knappe Rollenbios, Hierarchie,
zwanzig Schmuckangebote, zehn zusätzliche Gebrauchtwaren und drei unverändert
übernommene Schwarzmarktartikel, vier Szenen und die Betriebskalkulation.
Registrierung direkt bei den Geschäften in Gwynthor-Stadt.

Die vier Figuren bleiben unter ihren vorhandenen Onlinekennungen erhalten.
Die echte Familiengenealogie wird unabhängig davon gepflegt. Offene Lebensdaten
und unbesetzte Fachstellen bleiben offen. Die Kalkulation verwendet vorhandene
Geld-, Kalender- und Personalmodelle; sie bucht keine echten Einnahmen.

Zuständigkeiten: `ffals-module.mjs` für Seiten und Szenen, `ffals-people.mjs` für
Ladenrollen, `ffals-hierarchy.mjs` für Stellen, `ffals-catalog.mjs` für Güter und
`ffals-economy.mjs` für die Modellrechnung. Warenquelle ist
`assets/goldene-fassung/items.catalog.json`. Originale, Prompts und Prüfbelege
liegen im auftragsbezogenen lokalen Diagnoseordner.

Erzeugen: `node AleriaAlmanach/scripts/build-goldene-fassung.mjs`.
Prüfen: gleicher Aufruf mit `--check` und
`node --test AleriaAlmanach/tests/goldene-fassung.test.mjs`.
