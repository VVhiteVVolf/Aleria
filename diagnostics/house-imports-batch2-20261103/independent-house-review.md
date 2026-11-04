# Unabhängige Weidebucht-Prüfung, 3. November 2026

`Familien Häuser und Clans/tests/weidebucht-house-pages.test.mjs`: **9/9 Prüfgruppen erfolgreich** nach Anschluss der 18 Direktlinks in den vorhandenen Gebietsseiten. Vollständiges Protokoll: `independent-house-tests.log`.

Die neue Suite ist portabel. Ihre eigene minimale Fixture liegt unter `tests/fixtures/weidebucht-house-pages-initial-review.json` und enthält ausschließlich zehn vorhandene Familien-IDs, geprüfte kanonische Metadaten, einmalige Graphprüfsummen, Quellhashes und neun Originalbildhashes. Keine Personen oder Verwandtschaften wurden in die Fixture kopiert. Laufende Tests prüfen den tatsächlichen Bio-Upgradepfad auf bearbeiteten Kopien und sperren spätere erlaubte Stammbaumredaktion nicht durch feste alte Graphhashes.

Geprüft wurden bestehende IDs und Templates, generierte Hausseiten/Biografien, kanonische Rang-/Orts-/Lehenshierarchie, `mode=view`-Iframes, Verzicht auf übernommene Quellengenealogie und Militärzahlen, gültige Verweise auf vorhandene Personen, lokale Erreichbarkeit aller eingebundenen Bilder und bytegenauer Erhalt der neun Original-Hausdarstellungen. Die zehn HTML-Originalarchive stimmen mit ihren ursprünglichen Quellhashes überein und bleiben zusammen mit den Herkunftsmanifesten aus der statischen Auslieferung ausgeschlossen.

Konkrete Rollenregressionen sind enthalten: Beynon gründet Dinefwr, Eynon Tir Addawol; Melwas Wylan wird nicht zum Gründer des antiken Clans Ui Trisceil erklärt; Tudwal Asyn ist kein neu eingesetztes heutiges Oberhaupt. Wylan bleibt Grafenhaus, die südliche Mochdaer-Akte bleibt O'Cerrigarth.

Nach Fertigstellung der Produktionsmodule wurde der einmalige Vorher/Nachher-Abgleich erneut ausgeführt: **10/10 Graphen und kanonische Profile unverändert**. Beleg: `graph-preservation-one-time.json`; wiederholbarer lokaler Audit: `verify-import-graphs.mjs`.

Zusätzlicher redaktioneller Abgleich der Übersichten, Geschichts- und Kulturabschnitte aller zehn Seiten ergab keine weiteren konkreten Konflikte. Kurze Tannau-Überlieferung bleibt ausdrücklich kurz; Hwyadens behauptete Crannath-Herkunft bleibt eine Vermutung; Asyns ungeklärte Erbansprüche werden nicht entschieden. Neun vorhandene Darstellungen bleiben erhalten, ausschließlich Tannau erhält eine neue berufliche Hausdarstellung. Die ersten fünf Quellen, ihre Widersprüche und 15 Originalbilder sind gesondert unter `first-five/` dokumentiert.

Diese Prüfung umfasst Quell-/Datenkonsistenz und lokale Bildpfade. Die visuelle Browserabnahme erfolgt durch Root. Keine Produktionsdateien durch diesen Prüfagenten geändert; kein Git-Schreibzugriff, Push, Deploy oder Firebase-Schreibzugriff.
