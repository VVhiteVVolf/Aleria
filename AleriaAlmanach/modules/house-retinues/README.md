# Drakenschluck und Melynwyrrd

## Seitenplan

| Seite | Drakenschluck Söldner | Melynwyrrd Bande | Template |
| --- | --- | --- | --- |
| I | Die Wache vor dem Reifekeller | Gelb und Grün im Schatten der Ähre | Story |
| II | Eine Gilde für die langen Wachen | Das zweite Gesicht der Teyrngarch | Gilde |
| III | Oberste Führung und Rangordnung | Patronat, Bandenführung und Rangordnung | Hierarchie |
| IV | Garnison, Geleit und Leibschutz | Taverne, Straße und Hafen | Hierarchie |
| V | Versorgung, Ausbildung und freie Stellen | Kasse, Kodex, Nachwuchs und freie Stellen | Hierarchie |
| VI | Auftrag, Ablösung und Verantwortung | Der ritterliche Anspruch | Story |
| VII | Drakenburg und die bewachten Betriebe | Ein Netz aus Schenken und Stützpunkten | Organisationsnetzwerk |
| VIII | Sold, Vorräte und Kameradschaft | Gewinn, Druck und Gegenwehr | Story / Stillleben |
| IX | Wappenrock, Schild und geschlossener Helm | Das Erscheinungsbild eines Melynwyrrd | Story / Kriegerillustration |
| X | Hausinteressen und fremde Auftraggeber | Familie, Zugehörigkeit und Grenzen | Story |

Die Hierarchien sind Rollenmodelle. Die fünf Drakenschluck-Ränge und vier
Melynwyrrd-Ränge sind überliefert; Fachämter und ihre Zuständigkeiten werden als
redaktionelle Ausarbeitung ergänzt. Sie sind keine zusätzlich behaupteten
militärischen Dienstgrade. Jede Rolle nennt ihren Zweck und die verantwortliche
übergeordnete Stelle. Freie Stellen bleiben ohne Personenporträt und ohne
erfundene Besetzung. Wie bei Idwals Schiffsmannschaft zeigt das bestehende
Hierarchietemplate jeweils einen über Reiter gewählten Baum (`treeDisplayMode:
tabs`). Drakenschluck hat zehn Bäume, Melynwyrrd elf; auf jeder der drei
Hierarchieseiten liegen drei oder vier Bereiche. Alle 121 Rollen- und Platzkarten
einschließlich der 13 Reserven bleiben erhalten. `parentTreeId` erhält den Bezug
zur übergeordneten Stelle, die am gewählten Baum angezeigt wird.

| Seite | Drakenschluck: Reiter | Melynwyrrd: Reiter |
| --- | --- | --- |
| III | Führung · Dienstgrade · Verträge & Recht | Führung · Rangfolge · Innerer Kreis |
| IV | Einsatzleitung · Garnison · Geleit · Leibschutz | Ortsleitung · Goldener Kuss · Tavernen & Grenzen · Häfen & Waren |
| V | Gildenstab · Sold & Versorgung · Ausbildung | Innere Ordnung · Kasse & Unterhalt · Kodex & Meldungen · Nachwuchs |

## Quellen und Abgrenzung

`sources/*.html` bewahrt die beiden Nutzervorlagen unverändert;
`sources/*.json` enthält bereinigte Absätze und ursprüngliche Bildadressen.
Der im Auftrag gewünschte Anzeigename **Melynwyrrd** vereinheitlicht die
wechselnden Schreibweisen der Vorlage. Originalquellen behalten ihre Schreibweise.
Edlym ist als Anführer belegt. Arfon, Olwen, Evrel und Wendy erscheinen als
belegte Beteiligte; unklare oder leere Einzelämter werden ihnen nicht zugewiesen.
Ihre aktuellen Porträts stammen aus dem Teyrngarch-Stammbaum.
Die Drakenschluck erhalten entsprechend dem Auftrag keine Personenbesetzungen.

Die nordöstliche Grenzschenke „Zur Letzten Rast“ der Bande ist nicht
„Celtigerns Letzte Rast“ in Gwynthor. Die Melynwyrrd-Standorte liegen in der
Sonnenküste. Drakenschluck hat seine Zentrale in der Drakenburg in Vortigerns Ruh;
Wachmannschaften an Betrieben sind keine zusätzlichen großen Hauptstützpunkte.
Die Platzhalter „Jahr 0–100“, unbekannte Patrongötter und leere Mottos begründen
keine historischen Behauptungen. Selbstbild und kriminelle Praxis der Bande
werden nebeneinander dargestellt, ohne ihren Widerspruch wegzuerklären.

## Bilder und Einbindung

`image-prompts.json` dokumentiert die integrierte Bildgenerierung. Szenen und
Stillleben verwenden 2:3 und den vorgegebenen Anime-Stil. Der neue namenlose
Dieb verwendet als bewusste Ausnahme den Aquarell-/Gouache-Stil der Kriegergalerie.
Drakenschluck-Figuren tragen stets vollständig geschlossene Helme. Wappen und
die mitgelieferte Drakenschluck-Kriegerdarstellung werden unverändert verwendet.
Das neue quadratische Banden-Icon liegt bei den übrigen Weltpfad-Icons.

Die Modelle erzeugen `house-retinues-data.js`. Die Registrierung ergänzt
**Söldner → Kategorie Drakenschluck Söldner → Modul Drakenschluck Söldner** und **Banden → Melynwyrrd Bande** anhand
stabiler IDs. Bestehende Bereiche und redaktionelle Überschreibungen bleiben im
Modul-Store verwaltet. Die gemeinsame Registrierung aus
`modules/archive/archive-section-registration.mjs` verschiebt vorhandene
eingebaute Drakenschluck-Einträge anhand ihrer ID in die eigene Kategorie,
ohne ihren Inhalt zu ersetzen. Es gibt keine Änderungen an Kampfwerten oder Inventaren.

Das Standorttemplate kennt zusätzlich `partner` („Verbundener Standort“), um
bewachte oder genutzte fremde Betriebe von Niederlassungen zu unterscheiden.
Das Hierarchietemplate zentriert beim Öffnen verbundener Bäume die erste
Führungskarte. Gespeicherte Editorpositionen haben Vorrang; die Wiederherstellung
der Vorschau erhält alle verbundenen und parallelen Zweige.
Beim Wechsel eines Reiters beginnt der neu gewählte Baum oben; die aktive
Auswahl und Leseposition bleiben bei der Aktualisierung der Editorvorschau erhalten.
Auf schmalen Ansichten erhält der Aufbau eine eigene Lesefläche; Rollenkarten
stehen innerhalb ihrer Rangstufe untereinander. Die Bereichsreiter dürfen umbrechen.

## Prüfung

`npm run check:house-retinues` prüft den reproduzierbaren Datenstand;
`npm run test:house-retinues` prüft Quellen, Rollen, freie Stellen, lokale Bilder
und die Registrierung. `tests/hierarchy-viewport.test.mjs` deckt die Startposition
und Vorschauwiederherstellung ab. Zusätzlich wurden alle 20 Seiten bei 1600 und
390 Pixeln im Browser geprüft, einschließlich Bilder, Textüberlauf, Standortfilter,
Vollbild, Zoom und verlustfreiem Editor-Durchlauf.
