# Unabhängige Graue-Weite-Prüfung, 3. November 2026

`Familien Häuser und Clans/tests/graue-weite-house-pages.test.mjs`: **9/9 Prüfgruppen erfolgreich** nach Anschluss der aktuellen Gebietslinks. Vollständiges Protokoll: `independent-house-tests.log`.

Die eigene portable Fixture unter `tests/fixtures/graue-weite-house-pages-initial-review.json` enthält fünfzehn IDs, minimale kanonische Metadaten, ursprüngliche Quell- und Bildhashes sowie vier Prüfsummen geschützter nördlicher Familienakten. Es werden keine Personen-/Verwandtschaftskopien als Testfixture angelegt. Anfangsprüfsummen dienen ausschließlich dem einmaligen Übernahmeaudit. Die laufende Suite prüft den tatsächlichen Upgradepfad auf bearbeiteten Kopien und lässt spätere erlaubte Genealogieredaktion zu.

Geprüft wurden alle fünfzehn registrierten Seiten und Biografien, ihre konkreten Datendateipfade, vorhandene Familien-IDs und `mode=view`-Iframes. Weder alte Stammbäume noch Hof-/Hierarchietabellen oder Militärstatistiken ersetzen die aktuellen Daten. Die getrennten südlichen IDs für Blaidd, Illygoden, Gwaedlyd und Lyfant lösen nicht auf die nördlichen Ursprungsakten auf. Lyfants örtliche Hierarchie enthält auch Skelettküste unter Silberwald.

Alle fünfzehn gelieferten Hausfiguren sind **bytegenau erhalten**; aktive Bildverweise sind lokal erreichbar. Quellenarchive stimmen mit den unabhängigen ursprünglichen Quellhashes überein. HTML-Originale und Herkunftsmanifeste sind von der statischen Auslieferung ausgeschlossen, aktive generierte Seiten/Bios und Figuren bleiben auslieferbar. Draenogs drei alte Wappenvarianten bleiben Diagnoseoriginale und überschreiben kein kanonisches Wappen.

Die Rollenprüfungen verwenden bestehende Personen. Pysgod, Blaidd-Süd, Brithyll, Gwialen und Coedwig behalten ihre expliziten aktuellen Gründer. Cadwgawns Titel „Vater der Tredegar-Gründer“ begründet keine Gründerrolle im südlichen Gwaedlyd-Haus. Unbenannte „???“-Figuren werden nicht zu historischen Porträtkarten ergänzt.

Beim echten Bio-Upgrade bleiben eine eigens bearbeitete Person, eine zusätzliche eigene Personenextension, eigene Hausprosa und explizite Biografielöschung erhalten. Der semantische Graphvergleich nimmt ausschließlich die drei bekannten Buchführungsfelder `registryManagedFields`, `registryManagedFieldRevisions` und `registryManagedSourceRevision` aus; alle übrigen Extensions bleiben Teil des Vergleichs. Die vier nördlichen Familienobjekte werden von diesen Projektionen/Upgrades nicht verändert.

Der nachgelagerte einmalige Vollabgleich bestätigt **15/15 bestehende Graphen und kanonische Profile unverändert; zusätzlich 4/4 vollständige Nordakten unverändert**. Beleg: `graph-preservation-one-time.json`; wiederholbarer lokaler Audit: `verify-import-graphs.mjs`.

Die sieben hiesigen Quellen und ihre Konflikte sind in `editorial-summary.md` dokumentiert; 21 Originalbilder einschließlich Kontaktübersicht wurden tatsächlich geprüft. Die redigierten Vorschläge aller fünfzehn Häuser wurden zusätzlich unabhängig quer gelesen. Aktive Inhalte übernehmen keine kopierten Cumbra-/Umbrien-/Menevia-/Llan-Ildut-Zuordnungen oder den falschen Gründer-Vater und verwenden Nimues Epithet „Dame des Sees“. Die knappen antiken Clanakten erhalten keine erfundene Chronik, Tanwyn keine erfundenen Überlebenden. Die visuelle Browserabnahme erfolgt durch Root.

Durch diesen Agenten wurden nur neue Graue-Weite-Tests, die minimale Fixture und eigene Diagnosen erstellt. Keine produktiven Seiten, Registry-, Galerie-, Sonnenküste- oder Bellyn-Dateien geändert; kein Push, Deploy oder Firebase-Schreibzugriff.
