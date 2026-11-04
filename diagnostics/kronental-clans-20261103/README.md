# Kronental / Heldenwacht · lokale Clanübernahme

29 öffentliche Familienakten: 24 lebende und fünf historische Familien. Alle erhalten eine volle Hausseite und eine Hausbio. Die 19 gelieferten Quellen enthalten 19 Originaldarstellungen für 18 Häuser; beide Wellensänger-Figuren bleiben erhalten. Elf echte Bildlücken wurden mit dem integrierten Imagegen im freigegebenen Hausfigurenstil ergänzt. Die vier Neutralwappen werden nicht als erfundene Heraldik ausgestaltet.

`baseline.json` und `registry-audit.json` schützen Graphen, Profile, Titel, IDs und Orte. `source-content.json` enthält die geprüften Kapitel der 19 Vorlagen, `biography-summaries.json` ihre redigierten Kurzfassungen. Roharchive unter `sources/` bleiben bytegleich; gelieferte Genealogien und Militärstatistiken sind keine Importdaten. Die zwei vorhandenen Seiten stehen bytegleich unter `initial-house-pages/`; ihre Aliaslinks, Sonderkapitel und 25 Personenabbildungen werden erhalten. Albhrics Jugendportrait bleibt mit exakt belegter Identität und Altseitenquelle verknüpft.

Der Registerpfad bleibt Kronental. Der aktuelle Territorialverweis ist das bestehende Jarltum Heldenwacht. Historische Kulturkategorien sind keine Sitze; Torrenheim bleibt bei Grimr, Skaife und Holmr erhalten. Frostzorn ist lebend und abtrünnig, Vorns Geburt1697 ist kein Amtsbeginn. König Sigurd, Jarl Skjor und die drei bürgerlichen Familien behalten ihre belegten Rollen.

`create-house-content.mjs` dokumentiert den einmaligen Import mit vollständigen Vorprüfungen und Schutz vor Überschreiben. Nicht erneut ausführen. Für spätere Pflege die einzelnen Quellen unter `Familien Häuser und Clans/Estryll/Aldrimar/Kronental/` bearbeiten und ausschließlich die beabsichtigten IDs mit dem bestehenden Generator bauen.

Alle Originale und Generierungen sind unter `Stammbäume/assets/images/references/<Haus-ID>/` eingebunden. `original-images.json` und `generated-images.json` nennen genaue Pfade, Herkunft und Zuordnung; `image-prompts.json` dokumentiert die Prompts und Referenzen. Quellbilder bleiben unverändert. Die hellen Kontaktübersichten wurden angesehen; `image-verification.json` bestätigt alle 30 Hashes, Bildformate und Alphakanäle und dokumentiert geringfügige Quellartefakte.

105 Fach- und Regressionstests bestanden, danach31 gezielte Prüfungen für die zuletzt betroffenen Hausseiten und Galerie erneut bestanden. Begrenzte Builds mit `--houses=<29 IDs> --check` und auftragsbezogene Whitespace-Prüfung bestanden. Der globale Arbeitsbaum meldet zusätzlich eine Leerzeile am Dateiende in der außerhalb dieses Auftrags bearbeiteten `AleriaAlmanach/modules/landing/group-landing-scenes.js:34`; diese Datei wurde nicht verändert. `test-results.json`, `final-audit.json` und `browser-verification.json` enthalten die Abschlussbelege.

Keine genealogischen Änderungen, kein Commit, Push oder Deploy durch diesen Auftrag. Private Dossiers und geheime Inhalte sind keine Quellen.
