# Klassische Hintergründe · 6. November 2026

24 neue Lebenswege ergänzen die zehn bestehenden Hintergründe in der Starthilfe.
Alle 24 besitzen auf Folgeauftrag eigene neue Comicicons in der Hintergrundvorschau.
Die Fachverantwortung liegt in
`modules/character-development/creation-background-templates.js`; der vorhandene
Vorlagenkatalog bindet die Definitionen ein.

Wie bisher schlägt jeder Hintergrund genau zwei Fertigkeiten vor. Erst
„Vorschläge auswählen“ setzt eine bisher ungeübte Fertigkeit auf geübt;
vorhandene Expertise bleibt erhalten. Die aufgeführten Werkzeuge sind
Berufsorientierung für die manuelle Ausbildung. Das Hintergrundmerkmal beschreibt
die Erfahrung, enthält jedoch keinen zusätzlichen Zahlenbonus. Deshalb entstehen
keine Traitkosten und keine mit Pflichtmali zu verrechnenden Kampfvorteile.

Diese Gleichbehandlung erhält die freie Wahl zwischen einfachen und angesehenen
Lebenswegen. Ein Staatsmann hat denselben Vorschlagsumfang wie ein Tagelöhner.
Konkrete Ämter, Zugangsrechte, Vermögen, Sprachen, Waffenkenntnisse und Besitz
werden weiterhin persönlich ausgearbeitet.

| Hintergrund | Fertigkeitsvorschläge | Werkzeug-/Wissensgebiet |
| --- | --- | --- |
| Bürger | Überzeugen, Motiv erkennen | Markt- und Gemeindebrauchtum |
| Jäger | Wahrnehmung, Überleben | Jagd- und Wildversorgungsgerät |
| Staatsmann | Geschichte, Überzeugen | Ratsprotokolle und politische Korrespondenz |
| Händler | Motiv erkennen, Überzeugen | Waagen, Warenlisten und Handelsbuch |
| Wirt | Motiv erkennen, Überzeugen | Schank- und Gastwirtschaftsgerät |
| Schreiber | Geschichte, Nachforschungen | Schreibzeug, Siegelprüfung und Aktenführung |
| Bote | Athletik, Überleben | Wegzeichen und Nachrichtenbehälter |
| Fischer | Naturkunde, Überleben | Netze, Reusen und Angelgerät |
| Seemann | Athletik, Akrobatik | Tauwerk und Seemannschaft |
| Fuhrmann | Mit Tieren umgehen, Wahrnehmung | Fuhrwerk, Geschirr und Ladungssicherung |
| Hirte | Mit Tieren umgehen, Wahrnehmung | Hirtenstab und Herdenpflegegerät |
| Forstarbeiter | Athletik, Naturkunde | Holzfäller- und Forstwerkzeug |
| Bergarbeiter | Athletik, Nachforschungen | Bergbaugerät und Stollenabstützung |
| Tagelöhner | Athletik, Körperbeherrschung | Trage- und einfaches Arbeitsgerät |
| Hausdiener | Wahrnehmung, Motiv erkennen | Haushalts- und Serviergerät |
| Koch | Naturkunde, Fingerfertigkeit | Kochgeschirr und Küchenmesser |
| Heiler | Heilkunde, Motiv erkennen | Verbands- und Wundversorgungsgerät |
| Kräuterkundiger | Heilkunde, Naturkunde | Kräuterkunde- und Trocknungsgerät |
| Stadtwache | Wahrnehmung, Einschüchtern | Wachprotokolle und Kontrollzeichen |
| Soldat | Athletik, Wahrnehmung | Marsch- und Lagerordnung |
| Schmuggler | Täuschen, Heimlichkeit | Verdeckte Verpackungen und Schmugglerzeichen |
| Gerichtsdiener | Nachforschungen, Motiv erkennen | Gerichtsakten und Ladungswesen |
| Verwalter | Nachforschungen, Überzeugen | Bestandsbücher und Verwaltungsakten |
| Diplomat | Motiv erkennen, Überzeugen | Gesandtschaftsprotokoll und Verhandlungskorrespondenz |

Verschiedene Lebenswege können dieselben Fertigkeiten empfehlen. Sie bleiben
durch Erfahrung und Berufsfeld eigenständig; die Fertigkeitsausbildung wird bei
Überschneidungen weiterhin nur einmal geführt.

Prüfung:
`node --test --experimental-test-isolation=none tests/creation-backgrounds.test.mjs tests/character-creation.test.mjs`
prüft 13 Fälle: eindeutige Identitäten, alle 24 Auswahlwege, ausdrückliche
Fertigkeitsübernahme, Wiederöffnung und Erhalt persönlicher Werte und Ausbildung.
