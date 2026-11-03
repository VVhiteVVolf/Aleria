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

Begründungen und ursprüngliche Ausgangsstände:
`diagnostics/character-trait-review-20261102/`. Der zunächst lokale Stand ist
inzwischen für alle 14 Charakterbögen über Stufe 1 online bestätigt.
`character-trait-publication-plan.mjs` und der gesonderte Publisher verwenden
frische Dokumente, Kampfsperren, monotone Profilrevisionen und begrenzte Feldmasken.
Die letzten beiden offenen Anpassungen betrafen Gildas' Gafyr-Ringfähigkeit und
Rhiannons 23 Zauber. Belege: `diagnostics/combat-sheets-20261102/traits-online-after.json`
und `traits-online-verification.json`. Der lokale Bestätigungsabgleich erhält
eigene Ausrüstung, Ressourcen und weitere Entwürfe.

Zwölf bereits korrekt übernommene Auswahlen trugen noch ihre Revision vor dem
Abgleich. Eine gesonderte Bestätigung erhöhte ausschließlich deren Revision und
Änderungszeit. Die zwei Veröffentlichungsrunden besitzen getrennte datierte
Belege; sämtliche 14 Profile sind anschließend ohne weiteren Schreibbedarf geprüft.
