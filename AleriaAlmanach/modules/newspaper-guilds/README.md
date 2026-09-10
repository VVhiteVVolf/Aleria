# Nachrichten- und Schreibergilden

Sechs statische Startmodule unter **Weltpfade → Gilden & Zünfte → Nachrichten und Schreibergilden**: Celtigerns Echo, Der Schwarzbote, Der Kronenspiegel, Der Flüsterfächer, Der Waffengang und Ross & Sporn. Die Ortsbindung steht im Untertitel und im Gildenprofil; sie erzeugt keine zusätzlichen Archivordner.

## Aufbau und Verantwortung

`newspaper-guilds-module.js` setzt die gemeinsamen fünf Seiten zusammen und registriert jede Gilde anhand ihrer stabilen ID genau einmal. Die sechs benannten Datendateien enthalten ausschließlich die jeweilige Lore. Optionale `images`-Angaben für `emblem`, `story` und `work` erlauben vorhandene Bildpakete ohne Umbenennen oder Kopieren; `pageTitles.story` und `pageTitles.work` geben den beiden Story-Seiten eigene Titel. Nicht angegebene Statistiken werden ausgelassen.

1. Stimme & Selbstverständnis — Story-Template, neues Szenenbild.
2. Die Gilde — bestehendes Gilden-Template, Originalwappen, Merkmale, Überlieferung, Beziehungen und Arbeitsmittel.
3. Die Hauptleitung — bestehendes Hierarchie-Template, drei Ebenen mit sechs Ämtern; keine Personen oder örtlichen Redaktionsleiter.
4. Häuser & Wege — wiederverwendbares Netzwerk-Template mit Standortfiltern und Links.
5. Handwerk & Zunftleben — Story-Template, Ausbildung, Arbeitsweise und Anknüpfungspunkte für Reisende; zweites neues Szenenbild.

Nur die Story-Seiten I und V erlauben Seitenkommentare. Die Gilden-, Hierarchie- und Netzwerkseiten II–IV bleiben ohne Kommentarbereich. Dafür verwenden die Module die vorhandene Einstellung pro Seite; die globale Kommentarfreigabe ist ausgeschaltet. Es werden keine Zitatgeber, Autorenkommentare oder zusätzlichen Kommentarabschlussseiten angelegt. Die Module verwenden die vorhandenen Editoren und deren Speicher-/Importwege; dieses Feature greift nicht auf Firebase zu.

## Bestehende Lore

**Der Waffengang** und **Ross & Sporn** sind über `waffengang.js` und `ross-und-sporn.js` vollständig eingebunden. Ihr [ursprünglicher Planungsentwurf](concepts/sport-und-rosszucht.md) dokumentiert Rubriken, Hauptleitungen und Seitenaufbau; die [Bildtafel](../../public/assets/newspaper-guilds/sport-und-rosszucht/bildtafel.html) stellt ihre Wappen und Szenen gemeinsam dar. Beide verwenden den heutigen Hauptsitz Blutstadt und ein weltweites Netz mit Häusern in jeder Landeshauptstadt. Ross & Sporn bewahrt zusätzlich sein aeldrunmarisches Traditionshaus und Zuchtarchiv. Namen, Ämter und Ausgabenmodelle stammen aus dem ausgearbeiteten Konzept; feste Preise und Erscheinungstermine wurden nicht ergänzt. Die Kämpfergilde und Owain Draig werden als fachliche Bezüge geführt, nicht als Gildenleitung. Lothir bleibt ausdrücklich ein Kontinent.

Maßgebliche Quellen im Projekt:

- `Zeitungen/assets/js/newspaper-registry.mjs` — Zeitungsfamilien und eingerichtete Ausgaben.
- `Zeitungen/assets/js/newspaper-distribution-policy.mjs` — Wirkungsgebiete, erlaubte Erscheinungsorte und örtliche gegenüber zentralen Ausgaben.
- `Zeitungen/data/{celtigerns-echo,schwarzbote,kronenspiegel,fluesterfaecher}/publication.mjs` sowie vorhandene Ortsausgaben — Herausgeber, Leitsätze, Preise und Ausrichtung.
- `Zeitungen/data/kronenspiegel/distribution-sites.mjs` — Hauptredaktion Mathragon und die vier Druck-/Korrespondenzhäuser.
- Die Presseabschnitte der Ortsakten zu Gwynthor, Abergwint, Rhosmere und Castellbryn — örtliche Zuständigkeiten.

Celtigerns Echo bleibt auf Celtigerns Wacht beschränkt; seine Zentrale und Schreiberschule liegen in Gwynthor. Der Schwarzbote arbeitet überregional mit eigenen Ortsausgaben, ohne dass hier ein unbelegter gemeinsamer Hauptsitz gesetzt wird. Der Kronenspiegel erhält eine zentrale Gesamtausgabe für Cenyr unter Haus Pengair in Mathragon. Der Flüsterfächer hat seinen Hauptsitz in der Blutstadt; seine örtlichen Redaktionen verantworten eigene Inhalte.

Die Ämterordnungen, zusammenhängenden Einführungstexte, Arbeitsabläufe und Abenteuerkontakte sind redaktionelle Ergänzungen für diese Module. Sie weisen niemandem ein bestehendes Amt neu zu und setzen keine unbekannten Gründungsdaten fest.

## Bilder

Die Archivcover priorisieren das Wappen aus dem Gildenprofil vor dem Szenenbild von Seite I. Der gemeinsame Archivresolver übernimmt diese Auswahl auch für Dashboard und Hierarchie. Gilden mit Wappen erhalten eine helle Coverkarte mit vollständig eingepasstem Emblem und separater Beschriftung; die Inhaltsbilder bleiben unabhängig davon. Änderungen am Gildenwappen im Editor aktualisieren damit zugleich die Coverauswahl.

Die bestehenden drei Zeitungsembleme und das vom Nutzer unter `https://i.imgur.com/WqPs7b2.png` vorgegebene Schwarzboten-Wappen werden unverändert verwendet. Das Kategoriensymbol unter `IconOrdner/ReiterIcons/Weltpfade/gilden-zuenfte.png` zeigt Handschlag, Hammer und Feder auf einer vollständig quadratischen Pergamentfläche. Rahmen, Ornamente und Sepia-/Ockertöne orientieren sich direkt an den bestehenden Weltpfade-Symbolen „Techniken“ und „Chroniken“.

Die acht Szenen liegen unter den stabilen Pfaden `public/assets/newspaper-guilds/*-v2.png`, jeweils in 2:3. Bildrevision 3 ersetzt auf Wunsch des Nutzers alle früheren Motive: Seite I zeigt junge, hellhäutige Zeitungsausträger mit westlichem Erscheinungsbild; Seite V jeweils einen jungen Schüler und eine junge Schülerin mit einem vornehmen, strengen Lehrmeister. Die Themen Schreiben, Druckhandwerk, Quellenvergleich und Zeichnen bleiben erhalten. Der gewünschte Anime-Zeichenstil dient ausschließlich als Stilreferenz; die Figuren sind eigenständige Entwürfe. Prompts, Referenzen und Originalpfade der integrierten Bildgenerierung sind in `public/assets/newspaper-guilds/image-prompts.json` dokumentiert. Cache-Versionen aktualisieren die Anzeige. Die bestehenden Bildpfade bleiben auch für zuvor gespeicherte Module gültig.

## Prüfung

`npm run check:templates` prüft Asset-Anbindung, Editor-/Renderer-Zuordnung und JSON-Roundtrip aller 31 Templates. Die Tests `newspaper-guilds.test.mjs` und `organization-network.test.mjs` prüfen Archivregistrierung, Wirkungsgebiete, lokale Referenzen, Bildformate, Netzwerk-Daten und Editor-/Icon-Feldverhalten. Bestehende Tests für Navigation, Vorschau und Seitenkommentare gehören ebenfalls zum gezielten Prüfbereich.

Für Bildrevision 3 bestanden am 09.09.2026 die Template-Prüfung und alle 23 gezielten Tests. Die Browserprüfung umfasst 44 Fälle: alle 20 Seiten bei 1440 und 390 Pixeln sowie die Erhaltung der vier vollständigen Module beim Auslesen der Editorformulare. Auf jeder Seite wurde geprüft, dass nur I und V eine Kommentarfunktion besitzen. Zusätzlich wurden die Netzwerkvorlage in beiden Editoren, Standortfilter, Hinzufügen/Löschen von Standorten und der Icon-Wähler geprüft. Es gab keine JavaScript-Fehler, fehlenden lokalen Bilder oder Layoutüberläufe.

Die Browserprüfung lief mit blockierten externen Diensten; sie hat keine Firebase-Daten geschrieben. Bereits bestehende externe Symbole der Kommentarwerkzeuge waren dabei erwartungsgemäß nicht abrufbar. Alle neuen Gildenbilder und lokalen Verknüpfungen waren erreichbar.

Die Einbindung von Waffengang und Ross & Sporn wurde ebenfalls am 09.09.2026 geprüft: sechs gemeinsame Archivkarten mit Wappenpriorität, alle zehn neuen Seiten bei 1440 und 390 Pixeln sowie beide vollständigen Module im Editor-Roundtrip (22 Browserfälle). Es gab keine JavaScript-Fehler, fehlenden lokalen Bilder oder Layoutüberläufe. Die 23 gezielten Tests und die Template-Prüfung mit nun 120 Scripts bestanden ebenfalls. Die vier neuen Szenen und zwei Wappen liegen im bestehenden Bildpaket `public/assets/newspaper-guilds/sport-und-rosszucht/`.
