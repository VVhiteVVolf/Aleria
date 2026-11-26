# Verwaltungsansichten

Gemeinsame Ansicht für bestehende und künftige Herrschaften. Gestaltung und Zuständigkeiten: [Herrschaftsseiten-Vorgehen](../../HERRSCHAFTSSEITEN-VORGEHEN.md).

- `administration-content.js` besitzt die acht Bereiche, lokalen Organisationsicons und territoriale Zuordnung der Altquellen. Unbekannte Herrschaften erhalten keine fremden Inhalte.
- `administration-dialog.js` besitzt Hauptfenster, Maximierung, Bereichsnavigation, Ladezustand und Fokusrückkehr. Späte Ladeergebnisse überschreiben keinen anderen Bereich. Die Bereichsnavigation verändert nicht den ursprünglichen Auslöser auf der Seite.
- `administration-structured.mjs` verbindet die redaktionellen Bereichsmodule mit den gemeinsamen Cenyr-Amtsplänen. Die sieben Herrschaften verwenden dieselben Stellen wie die Werkstatt. Das Fenster von Gwendolyns Ufer enthält außerdem seine überlieferten Ämtertafeln mit den vorhandenen Dialogfunktionen.
- `administration-role-examples.mjs` ergänzt am Inhaltsende jedes Bereichs eine Tabelle aus `data/role-examples.mjs`: reguläre Rollen, Nebenrollen und Sonderrollen mit Kurzbeschreibungen und den gemeinsamen Bronze-Abzeichen. Die Beispiele gelten als Anregung für alle Herrschaften, unabhängig von deren konkreten Amtsbesetzungen und vom strukturierten oder älteren Quellenformat. Die Darstellung besitzt eigene Styles in `administration-role-examples.css`.
- `administration-model.mjs` enthält das kleine Amtsmodell und die Einordnung der Vasallenämter. Die Ergänzung verändert ihre Datenquellen nicht.
- `administration-cards.mjs` rendert Amtskarten, 2:3-Portraits, Rangabzeichen und Mannschaftslinks. Ein lokales WeakMap ordnet den Buttons ihre Amtsdaten zu; es gibt keinen globalen Personenstate.
- `administration-portrait-sources.mjs` löst exakt belegte externe Original-URLs auf lokale Archivkopien auf. Renderer und Vasallengenerator verwenden dieselbe Zuordnung.
- `administration-office-dialog.mjs` besitzt das Amtsfenster mit Portrait, Vorgänger, Fakten, Aufgaben, Mannschaften und Schnittstellen. Die Hofämter zeigen dort auch die unterstellten Dienste mit Quellenlinks. Aus den offiziellen Fenstern führt ein Link direkt zum zugehörigen Besetzungsentwurf.
- `administration-renderer.mjs` und `administration-hierarchy.mjs` erhalten die älteren HTML-Quellen anderer Herrschaften einschließlich Aufgaben-Tabellen. Erkannte Hierarchien verwenden dieselben Amtskarten; unbekannte Tabellenformen bleiben erhalten.
- `administration.css` besitzt ausschließlich die einzeilige äußere Kachelauswahl. Hauptfenster, Amtskarten und Amtsdetails besitzen eigene CSS-Dateien. Keine Überschreibungen in `herrschaft.css`.

Die gemalten Pergament-, Leder- und Messingflächen liegen gemeinsam mit ihren
CSS-Variablen in [`shared/cenyr-administration/`](../../../shared/cenyr-administration/administration-materials.css).
Die Renderer bestimmen die Anordnung ihrer Ansichten. In den regulären
Verwaltungsfenstern steht die Amtsleitung vor der Einführung. Das Amtsdetail
nennt oben die amtsführende Herrschaft, den Bereich und die Abteilung. Die
Hofämter und Ortsräte übernehmen ihre Symbole aus dem gemeinsamen Amtsplan.

## Redaktionelle Daten und Dienstwege

`data/celtigerns-{bereich}.mjs` liefern die ausführlichen Amtsprofile der Grafschaft. `shared/cenyr-administration/` besitzt die gemeinsame Hierarchie und übernimmt die belegten Besetzungen aus den territorialen Räten, Hausakten und dem Almanach. Die Werkstatt speichert Umbesetzungen browserlokal.

Jeder Bereich enthält Gruppen mit ausdrücklichem `kind` und Amtskarten mit `id`, `title`, `name`, `portrait`, `description` und gegebenenfalls `reportsTo`, `authority`, `connections`, `links`, `predecessor` oder `crew`. Bildpfade begründen keine Personenzuordnung. Vorhandene Quellen und bereits festgelegte Personen haben Vorrang.

Leitung, Adjutantur, Ämter der Vasallen und Fachämter gehen den örtlichen
Stellen und wiederholbaren Diensten voraus. Die militärische Ordnung aus
`shared/cenyr-administration/military-organization.mjs` gilt für Werkstatt,
Amtsfenster und Cenyr-Ämterverzeichnis. Der Marschall führt die Ortswachen
seiner Herrschaft und das Heer mit den zuständigen Hausmachtkommandanten
nach Lehnsrang. Hauptleute der Hausmacht führen Abteilungen ihres Hauses.
Ein Standort bezeichnet ihre Stationierung. Das kirchliche Aufgebot und
vertraglich geführte Söldner besitzen jeweils einen eigenen Dienstweg.
Marschälle tragen Gold, Adjutanten und
Kriegswarte Silber, darunter Bronze. Andere Bereiche verwenden
entsprechende Rangrahmen und Symbole.

Im Patriarchat folgen auf die geistliche Leitung neun gleichrangige Prälaten
vor den Vikaren. Vikariate haben einen Dechanten, einen Diakon je Siedlung,
einen persönlichen Stab und einen kleinen Schutzdienst. Die übrigen kirchlichen
Dienste sind als wiederholbare Rollen vorbereitet. Myrddins persönliche
Ordnung mit Rhiannons Nachfolge und Dienststab ist das Vorbild der
grafschaftlichen Ratsmagie.

## Vasallen aus ihren eigenen Quellen

`node Kontinente/scripts/build-administration-vassals.mjs` erzeugt `data/celtigerns-vassals.generated.mjs` aus den Ratsdaten der sechs untergeordneten Herrschaften. Die Grafschaft pflegt keine zweite Liste dieser Amtsinhaber. Gültige HTTPS-Originale bleiben erhalten; exakt belegte lokale Kopien werden bevorzugt. Bei Bildfehlern greifen lokale Silhouetten.

`territorialContacts` enthält gesondert Lyonnel Garrael als Lehenswart Aberllans. Für Camruisge wird kein unbelegter achtgliedriger Rat angelegt. Oilean gehört zu Leitheach und wird nicht der Grafschaft zugeordnet.

Nach Änderungen an den territorialen Räten den Generator erneut ausführen. Der Release-Build prüft die Aktualität mit `--check`.

## Mannschaften und Originalbilder

Eine vorbereitete `crew` ohne `href` öffnet über die SVG-Flagge den Mannschaftsabschnitt des Amtsfensters. Es werden keine leeren Almanach-Module oder erfundenen Schiffe angelegt. Mit echtem `href` führt die Flagge direkt zum bestehenden Modul. Idwal verwendet das unveränderte Mannschaftswappen aus seinem Almanach-Modul; Herkunft unter `assets/tiefenwyrm-mannschaft.source.json`.

Die sieben früher extern geladenen Bilder von Gwenydd Anghof, Torri, Arawn, Tegyr, Ceridwen Lhuyd, Jinell und Gwydion Seon sind unverändert unter `assets/portraits/` gesichert. Quellen und Dateihashes stehen dort in `portrait-sources.json`. Arawns überlieferte Quelle ist selbst nur eine Silhouette; daraus wird kein individuelles Portrait abgeleitet. Keine gleichnamigen Personen anderer Häuser einsetzen.

Gareths Portrait wird aus der aktuellen veröffentlichten Swyll-Fassung und der unveränderten Referenzkopie vom 18. Oktober übernommen. Es liegt im gemeinsamen Swyll-Portraitordner und ist auch in dessen lokaler Portraitliste eingetragen. Die Prüfung gleicht Herkunft und Dateihash ab, damit die ältere lokale Liste kein vorhandenes Portrait mehr verdrängt.

Nutzerkorrektur vom 28. Oktober: Talaneth, Saerwyn, Olyndor, Rhufaed, Eryndor und Liora Gwyllach erhalten keine Verwaltungsämter. Die entsprechenden Stellen bleiben offen; Familienakten und dortige Portraits bleiben erhalten. Frühere Abgleiche stehen in [Personal-Korrekturen](PERSONAL-KORREKTUREN.md).

## Prüfung

- `node Kontinente/scripts/build-administration-vassals.mjs --check`
- `node Kontinente/tests/administration-data.test.mjs`
- `node Kontinente/tests/administration-scope.test.mjs`
- `node Kontinente/tests/administration-dialog.browser.mjs`

Der Browser-Test prüft beide Quellenwege, alle 16 Ansichten auf drei Breiten, Amtsdetails, Bild-Fallbacks, Fokus, Maximierung, Mannschaftslinks und Erhalt unbekannter Tabellen. Er nutzt einen lokalen Server auf Port 5500; `ADMINISTRATION_TEST_ORIGIN`, `PLAYWRIGHT_MODULE`, `PLAYWRIGHT_EXECUTABLE` und optional `ADMINISTRATION_SCREENSHOTS` überschreiben die Umgebung.
