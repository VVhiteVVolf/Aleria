# Krähenmoor · geprüfte lokale Clanübernahme

26 öffentliche Familienakten (21 lebende, fünf historische): 26 Hausseiten und Hausbios, 13 unverändert übernommene Originalfiguren und 13 mit dem eingebauten Imagegen erzeugte Ergänzungen. Die zwölf nicht mitgelieferten Familien erhalten knappe Vorbereitungen aus belegten Registerdaten. Järnblods Vorlage enthält keine verwendbare Hausfigur und wird ebenfalls ergänzt.

`baseline.json` schützt bestehende Graphen, Profile, Titel, Ränge und Ortsordner. `source-content.json` enthält die redigierten Kapitel der 14 Vorlagen; ausschließlich diese Kapitel und `biography-summaries.json` sind Textgrundlagen. Die ursprünglichen Stammbäume und Militärstatistiken werden nicht übernommen. Roharchive bleiben unverändert als Quellen erhalten.

`create-house-content.mjs` dokumentiert die einmalige, begrenzte Erstellung aller Quellen mit Vorprüfung und Schutz gegen Überschreiben. Für spätere Pflege die einzelnen `haus.content.mjs` bearbeiten und den bestehenden Hausseiten-Generator mit den ausdrücklich ausgewählten IDs verwenden. Nicht den einmaligen Import erneut starten.

`original-images.json` und `generated-images.json` belegen Herkunft und Zuordnung; `image-prompts.json` enthält die verwendeten Prompts und Bildreferenzen. Alle Originaldateien und Imagegen-Outputs bleiben erhalten. Die hellen Kontaktübersichten `all-clan-figures.jpg` und `generated-clan-figures-light.jpg` wurden tatsächlich angesehen. Hashes, Alphakanal und kleine unveränderte Quellartefakte sind in `image-verification.json` dokumentiert.

93 Fach- und Regressionstests bestanden; zehn Krähenmoor-Tests nach der sprachlichen Schlusskorrektur erneut bestanden. `--houses=... --check` bestätigt aktuelle Hausseiten und Galerie. `test-results.json`, `final-audit.json` und `browser-verification.json` dokumentieren die Prüfungen einschließlich tatsächlichem Iframe-Laden und sichtbarer Hausbio. Keine Genealogieänderung, kein Commit, Push oder Deploy durch diesen Auftrag.
