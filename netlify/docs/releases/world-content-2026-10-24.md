# Aleria-Gesamtveröffentlichung vom 24. Oktober 2026

Der Nutzer hat ausdrücklich beauftragt, alle noch lokalen Neuheiten zu pushen und
zu deployen. Das umfasst auch die zuvor zurückgestellte Prätendenten-Chronik und
die eigenständigen regionalen Vorschauen. Deren experimenteller Charakter und
offene Inhalte bleiben erkennbar.

## Enthaltener Stand

- Leitheach: 26 Herrschaftsseiten, Verknüpfungen mit Estryll und dem Schild von
  Ailith sowie korrigierte Übersicht und sechs Unterkarten. Insgesamt 318 Orte,
  36 Gebietsobjekte und die vollständigen 98 vorhandenen Ortsbeschreibungen.
  Quellen-IDs, exakte Markerkoordinaten und fehlende Angaben bleiben nachvollziehbar.
  Clan-Verbindungslinien werden bei der Zuordnung als solche ausgewertet.
- Moinneach: drei regionale Vorschläge mit allen zehn Städten und elf Clans,
  benannten Alternativen und zehn ergänzten beziehungsweise überarbeiteten
  Stammesbannern. Die Vorschau bleibt außerhalb der kanonischen Weltregister.
- Uathneach und Moinneach verwenden die gemeinsame gekapselte Wappen-Kartenansicht.
- Krieg der Prätendenten: 20 Seiten mit Chronik, Fraktionen und Ereignisdossiers,
  Kriegskarte, Leselayout und den freigegebenen redaktionellen Abgleichen.
  Zugehörige Königsbiografien und Wellenruh-Verweise
  sind mitabgeglichen; die Chronik- und Kartenillustrationen sind enthalten.
- Der Almanach-Build kopiert die neuen Chronik-Seiten und ihre Ressourcen mit.
  Die Netlify-Pipeline prüft zusätzlich den Chronikgenerator und den vollständigen
  Leitheach-Quellenabgleich.
- Die neu erzeugten Klassen-Handbuchseiten zeigen die bereits bestehenden
  Technikmodifikatoren ihrer gemeinsamen Regellogik konsistent an. Es wurde
  dafür keine Kampfmechanik und kein gespeicherter Kampfverlauf geändert.

## Validierung

- Vollständige Releasepipeline: `node netlify/build/run-site-build.mjs --full`,
  29 Prüfgruppen und 897 Tests ohne Fehler; Stammbaumprüfung mit 525 Akten.
- Almanach einschließlich seiner Generatoren: `npm run build` im Almanachordner,
  erfolgreich einschließlich der neuen Chronik-Einstiege und Bildressourcen.
- Leitheach-Quellen und Karten: beide Generatoren mit `--check`.
- Prätendenten-Seiten: Generator mit `--check`.
- Prüfung der geänderten Build-Policy und der versionierten Dateidifferenzen.
- Klassen-Handbuch und zugehörige Modelle: 66 zusätzliche Tests bestanden.

Die Veröffentlichung verwendet den bestehenden GitHub-/Netlify-Ablauf auf
`master`. Der tatsächlich veröffentlichte Commit wird anschließend über den
Netlify-Status und `build-meta/validation.json` abgeglichen. Lokale Prüfprotokolle
und Produktionsnachweise bleiben unter `.tmp/release-20261024-*`.

Firebase-Daten, laufende Kämpfe, Live-Ressourcen, Online-IDs und persönliche
Browserentwürfe sind kein Bestandteil einer Datenmigration dieses Releases.
