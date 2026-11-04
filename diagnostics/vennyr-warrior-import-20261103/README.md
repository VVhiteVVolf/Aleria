# Vennyr: elf übernommene Hausdarstellungen

Lokaler Abgleich vom 3. November 2026. Keine Neugenerierung und keine Veröffentlichung.

Die elf gelieferten HTML-Originale liegen unverändert unter `sources/`; die Bildherkunft, lokalen Dateien und SHA-256-Prüfsummen stehen in `sources.json` und `image-verification.json`.

## Ergebnis

- Caerdyn, Drewi, Gwanrhyd, Bochdew, Udgorn, Balauric, Morgryn, Gwenyen und Crwynog: vorhandenes Original aus dem Referenzbestand als Hauptbild der bestehenden Hausbio eingebunden. Alle übrigen Biofelder unverändert.
- Blodyn: dasselbe Original wie bei den bestehenden Exilzweigen bytegleich für die Herkunftsakte wiederverwendet. Die beiden Exilakten bleiben unverändert.
- Trachwyll: geliefertes Original für die bestehende Ivarsfels-Akte übernommen. Die Herkunftsakte Talfronwyn bleibt unverändert.
- Blodyn und Trachwyll: bislang fehlende kurze Bild-Bio ausschließlich aus den vorhandenen Dokumentangaben. Keine neuen Hausseiten, Personen oder Genealogien.
- Alle elf Darstellungen sind in der Kriegergalerie dem richtigen Haus zugeordnet. Bestehende gemeinsame Bild-IDs bleiben erhalten.

`vennyr-warrior-biography-defaults.js` stellt die Bildkorrekturen bereit. Der gemeinsame `house-biography-default-catalog.js` führt sie mit den generierten Hausseiten zusammen; vollständige Hausseiten haben Vorrang. Die bestehende Fingerprint-Regel aktualisiert nur erkannte ausgelieferte Standardbios. Eigene Texte und ausdrücklich entfernte Bios bleiben erhalten. Reine Biorevisionen setzen keine älteren Personen- oder Hausfeldkorrekturen erneut durch.

## Prüfung

- `Stammbäume/tests/vennyr-warrior-images.test.js`: 8/8 bestanden, umfasst alle elf Zielakten und drei Kontrollakten.
- Originaldateien: elfmal 408 × 612 Pixel, RGBA, Herkunftshashes und Galeriezuordnungen korrekt.
- Vorher/Nachher-Abgleich: 14 Graphen, Profile, Titel und Wappen erhalten; neun bestehende Bios ausschließlich am Bild geändert.
- Caerdyn und Trachwyll im lokalen Browser geöffnet: Originaldarstellungen vollständig geladen und sichtbar, Wappen separat erhalten.
- Begrenzter Galerie-Generator mit `--check --houses=...`: bestanden.
- `git diff --check` für Stammbaum- und Galerieänderungen: bestanden.
- Cwingod-Namens-/Porträtprüfungen: 7/7 bestanden. Die ältere Namenskorrektur verwendet in ihrem Test die ursprüngliche Entitätsrevision statt einer späteren Biorevision.

Die ergänzenden älteren Cenyr-Sammeltests enthalten während des parallelen Cenyr-Gesamtabgleichs veraltete exakte Revisions-, Bio- und Seitenzahlannahmen (Cwingod/Klaueninsel und Tal der Milane). Ihre Protokolle bleiben hier erhalten; fremde aktuelle Inhalte wurden nicht zurückgesetzt. Dies ist kein Beleg für einen vollständig grünen Gesamtprojektlauf.

Der lokale Server und fremde laufende Arbeiten bleiben erhalten. Kein Commit, Push oder Deploy ausgeführt.
