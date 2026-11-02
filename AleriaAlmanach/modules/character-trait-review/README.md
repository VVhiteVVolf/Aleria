# Geprüfte Charaktereigenschaften

`reviewed-character-traits.js` enthält ausschließlich bestätigte redaktionelle
Entscheidungen für die benannten vorhandenen Figuren. Keine automatische Ableitung
aus Attributwerten, Klassen, Namen oder Porträts. Höchstens drei Eigenschaften;
eine leere Auswahl ist eine ausdrückliche Entscheidung.

`character-trait-review-model.js` stellt den bestehenden Katalog bereit und ändert
nur Eigenschaften, vorhandene Biografiekarten und explizit benannte alte Merkmale.
`character-trait-review-database.mjs` projiziert dieselbe Auswahl auf lokale
Datensätze und ihre Lesefassungen. Der Archivmodus `replace-combat-traits` ist in
`CharakterDatenbank/lib/character-trait-overlays.mjs` gekapselt. Andere Systeme
vergeben die Eigenschaften nicht erneut oder automatisch beim Laden.

```powershell
node AleriaAlmanach/scripts/build-character-trait-review.mjs --check
node --test --experimental-test-isolation=none AleriaAlmanach/tests/character-trait-review.test.mjs
node AleriaAlmanach/tests/character-trait-review.browser.mjs
```

Begründungen, Ausgangsstände, Prüfungen und ein **nicht ausgeführter** Onlineplan:
`diagnostics/character-trait-review-20261102/`. Änderungen gelten lokal. Eine
spätere Datenübernahme muss gemeinsame Mechanik und Icons bereits unterstützen,
frische Dokumente lesen und ausschließlich die geprüften Felder aktualisieren.
