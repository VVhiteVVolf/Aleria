# Charakter- und Kreaturbögen

Die Bögen behalten ihre Pergamentfarben. Gemeinsame kompakte Zeilen und gezielte
Aufklappbereiche ersetzen die zuvor gleichzeitig ausgebreiteten Formulare.
Der Charakterbogen verteilt die vorhandenen Felder auf sechs zugängliche Reiter;
Waffen, Techniken, Eigenschaften und Zauber bleiben durchsuchbar.

`combat-sheet-workspace.js` besitzt ausschließlich Darstellungszustand. Wechsel
blenden bereits montierte Bereiche um; sie sammeln keine Formulardaten und bauen
keine Editoren erneut. Suchbegriffe, geöffnete Einträge und Scrollpositionen
überleben die Navigation. Die bestehenden Charakter- und Kreaturmodule behalten
Verantwortung für Entwürfe, Regeln und Speicherung.

Lesender Inventarabgleich verwendet `definitionRulesOnly`: Verbindliche versionierte
Definitionen werden aufgelöst, frei angepasste alte Waffenwerte bleiben erhalten.
Ein ausdrücklicher Inventarimport darf die zugehörigen Werte weiterhin übernehmen.
Browser und Firebase verwenden dieselbe begrenzte Ausrüstungsprojektion.

Die frühere redaktionelle Traitauswahl war lokal, jedoch noch nicht online.
Der separate Publisher aktualisiert ausschließlich geprüfte Blattfelder und die
Kampfprofilrevision. Veraltete offene Editoren können diese Änderung nicht still
überschreiben. Ressourcen, Besitz und historische Kampfauswertungen bleiben erhalten.

Prüfungen: `combat-sheet-workspace.browser.mjs`, `character-trait-publication.test.mjs`,
`combat-sheet-schema-upgrade.test.mjs` und die Firebase-Tests für Inventarauflösung
und veraltete Revisionen. Prüfbelege liegen unter `diagnostics/combat-sheets-20261102/`.
