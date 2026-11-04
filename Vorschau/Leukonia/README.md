# Leukonia · Vorbereitung

Lokale Vorbereitungsseite für Leukonia mit dem bestätigten Kontext des
Kaiserreichs Argentum. Veröffentlichung folgt dem geltenden Projekt-Releaseweg.
Die Seite übernimmt keine Hauszuordnungen in kanonische Register oder Firebase.

## Quellen und Karten

Die maßgeblichen Karten sind die beiden 8192 × 4698 großen PNGs unter
`C:/Users/fhg_r/Downloads/Länder/Das Kaiserreich Argentum/Tirnara Provinz`:
`Kaiserreich (Tirnara Normal).png` und `Kaiserreich (Tirnara Portion).png`.
Die drei älteren kleinen Übersichtskarten im übergeordneten Ordner zeigen
verschiedene Reichsteile und werden nicht als austauschbare Kartenvarianten
verwendet. Originale und ihre Beschriftungen bleiben erhalten.

Aktiv ist nach der neuesten Nutzerkorrektur ausschließlich das Festland.
Die südliche Insel bleibt als unveränderte Bildquelle erhalten und wird vorerst
nicht als Archonat oder Teil der Hausverteilung behandelt. Die aktiven Archonate
und Orte werden aus `territory-data.mjs` abgeleitet. Vier Namen sind eingebrannt:
Alvanista, Aspio, Zaphias und Allantaic. Die übrigen 22 Festlandorte besitzen
in `territory-data.mjs` vorgeschlagene Namen mit italisch-lateinischem und
frühitalienischem Klang; ihre stabilen IDs und Kartenanker bleiben erhalten.
Gebiete tragen weiterhin geografische Arbeitsnamen. Die Form eines Markers legt keine zusätzliche Hauptstadt-
oder Adelsfunktion fest. Zaphias bildet kein zusätzliches Archonat.

Das diagnostische Quellen- und Architekturinventar liegt unter
`diagnostics/argentum-leukonia/architecture-inventory.json`. Die Kartenprüfung
und die prozentualen Anker werden separat vom Kartenmodul dokumentiert.

## Daten und Darstellung

- `realm-context.mjs` besitzt die bestätigte Geschichte, Provinzen, Verwaltung,
  den Archon als Adelsrang, dreizehn Reichsposten, Institutionen und Militärbegriffe.
- `culture-data.mjs` besitzt die sechs gesellschaftlichen Schichten. Kaste,
  Amtsgewalt und konkrete Personen werden getrennt geführt.
- `territory-data.mjs` besitzt `MAP_VARIANTS`, `ARCHONATES` und `SETTLEMENTS`.
  `map-data.mjs` fügt nur die aktuellen Hausmarker als getrennte Bildschicht hinzu.
- `house-data.mjs`, `art-data.mjs` und `warrior-data.mjs` besitzen Hausidentitäten,
  Bilddateien und Darstellungsvorschläge. Sie werden von der Bildproduktion
  gepflegt; die UI importiert keine Prompt- oder Quellenarchive.
- `realm-context-view.mjs`, `art-view.mjs` und `proposal-render.mjs` rendern
  unabhängige Seitenbereiche mit dem gemeinsamen HTML-Escaping.
- `art-dialogs.mjs` verwendet für fertige Wappen-Figuren-Paare das gemeinsame
  `renderHouseDossier`. Es liest den aktuellen Sitz erst beim Öffnen aus.
- `proposal-app.mjs` verbindet die Bereiche und besitzt nur die Seiteneinstieg-
  und Bildaktionen. Kartenaktionen werden im Platzierungsbereich abgewickelt.

Die sieben vorgegebenen Kriegerrollen sind inzwischen bestätigt; ihre
Klassennamen bleiben offen. Es werden keine fremden Länderklassen oder
unbelegten Klassenprofile eingesetzt.

## Lokaler Sitzentwurf

Die sechs Häuser Apinia, Bolar, Lex, Orania, Pelagia und Tremelia behalten ihre
vorgegebenen Ränge. Fünf von ihnen erhalten vorgeschlagene Sitze in den aktiven
Festlandarchonaten; Bolar bleibt nach Ausschluss der Insel vorerst ohne Sitz.
Haus Mede erhält Zaphias als kaiserliche Domäne. Die konkreten vorgeschlagenen
Stadtsitze stehen in den Daten. Die 32 zusätzlichen Hauswappen beginnen ohne
Sitz: 26 aktive Festlandorte plus sechs ergeben zusammen mit den sieben
gelieferten Häusern 39 Häuser. Die Ausgangssitze
bleiben bearbeitbar; es werden keine zusätzlichen Sitzsperren oder Kapazitäten
erfunden.

Die 32 zusätzlichen Wappenhäuser sind inzwischen benannt. Die Zuordnung in
`sources/house-name-assignments.json` verbindet ihre stabilen IDs mit neuen
Familiennamen aus italisch-lateinischen, frühitalienischen und imperialen
Fantasy-Klängen. Der Bildkatalog-Builder übernimmt diese Namen in Hauskarten,
Karte und Dossiers. Namen begründen keine zusätzlichen Ränge, Sitze oder
Hausgeschichten; ältere Entwurfsdateien bleiben über dieselben IDs zuordenbar.

`placement-state.mjs` konfiguriert ausschließlich das gemeinsame
`Vorschau/shared/placement-state.mjs`. Dieses besitzt Momentaufnahmen,
Rückgängig und die atomare vollständige Importvalidierung. Die gemeinsame
`country-placement.mjs` verbindet Speicherung, Auswahl, Import/Export und
die vorhandenen Drag- und Kartenmodule.

Der eigene Speicherschlüssel lautet
`aleria:proposal:leukonia:placements:v1`. Ein Wechsel verändert weder
Hausnamen und Ränge noch Lehnsherrschaft oder Bilddaten. Wohnort und
Amtsinhaberschaft werden nicht gleichgesetzt.

## Bildstand und Prüfung

Bildkataloge dürfen unfertige Einträge mit `ready:false` oder ohne Bildpfad
führen. Die Seite zeigt dafür einen kurzen Status und keine Ersatzgrafik.
Ein fertiges Bild wird vollständig mit `object-fit:contain` gezeigt. Hausfigur,
Wappen, Banner, Kastenillustration und Klassenprototyp besitzen Großansichten.
Der fertige aktive Bestand umfasst fünf Festlandarchonate, 26 Orte, 32 neue
Hauswappen und sieben gelieferte Häuser, fünf Archonatsbanner, das Provinzwappen
mit Hoplit und Gorgonenkopf, sechs Stände-Comics, sieben Klassenprototypen und
39 individuelle Hauskrieger. Bolar bleibt vorerst ohne Sitz; Mede sitzt in Zaphias.

Mede verwendet die ausdrücklich überarbeitete Prätorianer-Ritterfassung
`assets/warriors/production/house-mede-v2.png`. Die vorherige Darstellung bleibt
unverändert als Quelle erhalten. Die übrigen 38 Hausfiguren blieben bei dieser
Überarbeitung bytegleich. Verworfene Bildentwürfe und Generatorarchive gehören
nicht zum statischen Veröffentlichungspaket.

Für die abschließende Prüfung sind Datenbelege, vollständige lokale Pfade,
Originalhashes und tatsächliche Desktop-/Handyansichten relevant. Maus-/Stift-
Drag, alternative Auswahl, Rückgängig, Import/Export, Neuladen und Zurücksetzen
werden mit dem vorhandenen gemeinsamen System geprüft. Die Bildaufbereitung
bleibt in den bestehenden gemeinsamen Pipelines.

Die abschließenden Belege liegen unter
`diagnostics/argentum-leukonia/browser-qa/final-ui-qa.json` und
`diagnostics/argentum-leukonia/contract-audit-mede-v2-2026-11-03.json`.
Alle 39 Hauspaare wurden auf Desktop und Handy geöffnet. Die finale Mede-Fassung
wurde anschließend gezielt erneut geprüft. Daten-, Bild- und Policyprüfungen:
32 bestanden. Native Mausdrag- und Datei-Auswahlautomation waren technisch
eingeschränkt; zugängliche Platzierung, Export, Persistenz, Rückgängig und die
atomaren Import- und Zustandsmodelle wurden geprüft.

## Prompts und Originale

Alle neuen Bilder wurden mit dem eingebauten `image_gen.imagegen` erstellt.
Vollständige Bildprompts und echte Referenzpfade stehen unter `sources/`:

- `caste-generation-jobs.json`: sechs Comicfiguren.
- `heraldry-generation-jobs.json`: Provinzwappen, Hauswappen und Banner;
  inaktive ältere Entwürfe bleiben ausdrücklich gekennzeichnet.
- `class-prototype-generation-jobs.json`: sieben Klassenprototypen.
- `house-warrior-generation-jobs.json`: die aktuell ausgewählten 39 Hausfiguren.
- `house-warrior-revisions.json`: die ausdrücklich verlangte Mede-Überarbeitung.

Die zugehörigen Results- und Asset-Receipts enthalten Originalpfade,
Prüfsummen und Nachweise der genehmigten Alpha-Aufbereitung. Die vorhandene
gemeinsame Pipeline erhält die Generatororiginale und sämtliche RGB-Werte.
Der Builder `scripts/build-art-catalog.mjs` veröffentlicht ausschließlich
kompakte Bildmetadaten und kurze deutsche Beschreibungen.
