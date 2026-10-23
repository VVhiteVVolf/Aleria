# Faelaorn und Skjaerheim – Übernahme vom 22. Oktober 2026

Die beiden Reiche besitzen 57 verschachtelte Herrschaftsseiten im gemeinsamen
Pergamentlayout: 37 für Faelaorn und 20 für Skjaerheim. Acht gelieferte HTML-Dateien,
die vorhandenen Familienakten und die lokalen Regionskarten sind die Quellen.
World Anvil wurde für diesen Auftrag nicht verwendet. Kein Push, Deployment oder
Schreibzugriff auf veröffentlichte Kartendaten wurde ausgeführt.

## Zuständigkeiten und Pflege

- `../faelaorn/pages.source.json` und `../skjaerheim/pages.source.json` enthalten
  Seitentexte, Ratsämter, Familiengruppen und unmittelbare Unterseiten.
- Die zugehörigen `places.source.json` enthalten ausschließlich belegte Sitze und
  Ortsnamen. Es sind keine Kartenmarker und keine neu erfundenen Ortsbeschreibungen.
- `Karten/Faelaorn/territories.import.json` und
  `Karten/Skjaerheim/territories.import.json` enthalten Elternbeziehungen,
  Seitentitel, lokale Wappen, Banner und Ziele.
- Die beiden `maps.source.json` bestimmen die Rasterkarten. Die vorhandenen
  gemeinsamen Komponenten unter `territory-page`, `territory-directory` und
  `administration` übernehmen die Darstellung.
- Die Stammbaumstruktur ergänzt Kategorien und Suchziele. Sie legt keine neuen
  Personen oder genealogischen Familienakten an. Der vollständige Familienbestand
  ist gegenüber `sources/family-baseline.json` unverändert.

Unterseiten führen ihre eigenen Register. Grannd erscheint unter Erskine und Boyd
unter Muirgheal. Die 39 Familien der alten Faelaorn-Tabellen sowie die bereits
vorhandenen Dubhan sind auf ihren jeweils zuständigen Seiten berücksichtigt.
Fünf Septs ohne belegtes Territorium erhalten keine erfundenen Herrschaften.
Ausgestorbene Clans stehen nach den bestehenden Gruppen; Dubhan ist vertrieben,
nicht pauschal ausgestorben. Mac Ffearnachs unbelegter früherer Rang bleibt offen.

## Heutige Kontrolle gegenüber alten Lehen

| Albische Region | Heutige Einordnung |
| --- | --- |
| Tir na Rann | Albische Kernregion um Piobarach |
| Tir na Mathgham | Albisch, unter Diuid |
| Tir na Braigh | Albisch, unter Culloch |
| Tir na Brann | Besetzt; fürstliches Jarltum der Hrothgar |
| Tir na Faerna | Besetzt; Jarltum der Bjerk |
| Tir na Damh | Größtenteils Knything und Stanleagh; südlicher Forsyth-Bereich als Niemandsland/Kriegszone |

Historische albische Lehensbindungen werden durch die Besetzung nicht auf die
Nordmänner umgeschrieben. Der ergänzende aktuelle Kontrollstatus liegt in
`Stammbäume/assets/js/data/faelaorn-current-control.js`; die historischen
Familienprofile bleiben erhalten.

Durachd und Eoghainn befinden sich in Rann im Asyl, Duff in Balgavrie und Airdmhor
in Caisteal Gorm. Ein Asylaufenthalt erzeugt keine neue Lehensbindung. Inverfay
bleibt ausdrücklich eine Forsyth-Exklave in Mathgham; daraus wird kein Diuid-Lehen.
Die Rann-Fläche „Volkswart / Fianna / ???“ besitzt eine offene Verwaltungsseite,
ohne erfundenen Clan oder Fianna-Landbesitz.

## Skjaerheims Gliederung

| Jarlclan / eigener Sitz | Untergeordnete Clans |
| --- | --- |
| Hrothgar / Nyfall | Vargul in Hildrath, Iskarn in Skogarn, Garnulf in Lærdal |
| Bjerk / Bjarkasteinn | Hjarning in Hjarngard, Hrodmar in Ranvik; Hjorvik in Hjörval |
| Knything / Agnhjort | Veknar in Galtfall, Skath in Skathgard; Thirsk in Thirskholm |
| Stanleagh / Blóðgalt | Draugmar in Valnar |

Die Zuweisung Draugmar → Stanleagh und Veknar/Skath/Thirsk → Knything wurde vom
Nutzer ausdrücklich bestätigt. „Stanlaegh“ bleibt als Quellschreibweise suchbar.
Hjorvik und Thirsk sind laut Karte **Hesirenclans**, verschachtelt im eigenen
Thanentum des jeweiligen Jarlclans. Die übrigen acht Unterclans sind Thanenclans.
Alle vier Jarlclans besitzen zusätzlich ihre eigene Thanentumsseite. Der Süden
bleibt ohne zugewiesenen Herrscher eine separate Kriegszone.

Alle 19 vorhandenen unterschiedlichen Skjaerheim-Wappen/Banner bleiben erhalten.
Unterherrschaften zeigen das Banner des zugehörigen Jarltums und daneben ihr
eigenes Clanwappen. Unbekannte Herrscher und Ratsmitglieder bleiben offen;
vorhandene lokale Silhouetten ersetzen fehlende Portraits.

## Karten und Pin-Sichtbarkeit

Neun Karten besitzen ausschließlich Normal- und Regionsbild: sechs albische
Regionspaare und drei nordische Regionskarten. Die Landschaften der drei
nordischen Blätter stimmen mit Brann, Faerna und Damh überein; deshalb verwenden
sie dieselben gelieferten Normalbilder. Alle 15 einzelnen Dateien wurden ohne
Größenänderung verlustfrei als WebP archiviert. Es gibt weder neue Pins noch
Marker-Rasterbilder oder Vektorgrenzen. Standardwerte bleiben Dot 80 / Schrift 50.
Der gemeinsame Kartenbuilder schützt spätere manuelle Änderungen mit dem
bestehenden Zustandshash-Verfahren.

Die bereits vorhandenen albischen Karten verwenden nun ausdrücklich
`markerPresentation: "symbols"`. `Karten/assets/js/pins/pin-presentation.js`
migriert den alten ausgeblendeten Standard einmalig; danach bleiben bewusst
gespeicherte Sichtbarkeitseinstellungen erhalten. „Karte“ blendet bei diesen
Karten die vorhandenen Symbole mit ein. Karten mit eingezeichneten Zeichen in
Cenyr und Aldrimar behalten ihre bisherige Ebenenlogik.

Die 493 bestehenden Pins und alle Vektorregionen der 17 betroffenen Karten sind
gegenüber `sources/alben-pin-baseline.json` inhaltlich exakt unverändert. Die
Leitheach-Blätter ohne Ortsmarker erhalten dadurch keine erfundenen Pins.

Die gemeinsame Herrschaftsansicht berücksichtigt außerdem Karten auf Seiten
ohne Ortsregister oder Unterseiten; zuvor blieb dort der Ladehinweis stehen.

## Quellenbereinigung und offene Inhalte

Die HTML-Originale liegen unverändert mit SHA-256 in `sources/article-*.html`.
`articles.data.json` enthält die ausgelesenen Daten; Layout, Inline-Styles und
alte Tabellengestaltung werden nicht dargestellt. Die Kartenbelege einschließlich
Originalpfaden, Bildgrößen und Hashes liegen in `images.manifest.json`.

Offenkundige fremde Vorlagenreste wurden nur in der neuen Darstellung angepasst:
Faelaorns Hauptstadt ist das belegte Piobarach statt des alten Tirnanog-Platzhalters;
fremde Ceitheach-Ratsnamen wurden nicht zu Faelaorn-Amtsträgern gemacht. In
Skjaerheims alten Kulturtexten wurden die Fjordheim-Vorlagenbezüge an das richtige
Reich gebunden. Die unterworfene Bevölkerung ist hier entsprechend dem Auftrag
albisch; die fremde Schwarzblut-Clanreferenz wurde nicht übernommen. Die Archive
enthalten weiterhin die unveränderten Originalformulierungen.

Noch offen bleiben insbesondere die Namen der nordischen Amtsträger, nicht
ausgearbeitete Ratsbesetzungen, die genaue Rann-Verwaltung sowie neue Ortsdetails.
Alte Platzhalter werden nicht durch erfundene Angaben ausgefüllt.

## Prüfung und Wiederaufbau

```powershell
node Kontinente/scripts/build-faelaorn.mjs --check
node Kontinente/scripts/build-skjaerheim.mjs --check
node Karten/tools/build-faelaorn-skjaerheim.mjs --check
node Kontinente/scripts/build-alben.mjs --check
node --experimental-test-isolation=none --test Kontinente/tests/faelaorn-skjaerheim.test.mjs Kontinente/tests/alben.test.mjs Kontinente/tests/territory-heraldry.test.mjs Karten/tests/pin-presentation.test.mjs Karten/tests/map-view-default.test.mjs Karten/tests/pin-tools.test.mjs Stammbäume/tests/skjaerheim-structure.test.js
```

Zum Wiederaufbau `--check` weglassen. Die acht Quellarchive werden dabei nicht
neu importiert. Die fachbezogenen 48 Tests sind bestanden. Eine zusätzliche
Prüfung der älteren Faelaorn-Familientests meldete drei bereits veraltete
Gesamtbestands-Snapshots: 518 statt des zuvor vorhandenen Bestands von 538 sowie
Tadgs inzwischen auf Nutzerwunsch aktualisiertes Portrait. Diese historischen
Erwartungen wurden hier nicht durch Änderungen an Familienakten erfüllt.

Chrome-Sichtprüfung: alle 57 Seiten über ihre tatsächlichen Unterseitenlinks
erreicht, keine Seitenüberläufe oder kaputten geladenen Bilder; alle neun
Normal-/Regionsebenen mit korrekten Bildgrößen, null Pins und ausgeblendetem
Markierungsschalter. Beide Hauptseiten zusätzlich bei 390 und 768 Pixeln ohne
horizontales Überlaufen geprüft. Dunfal, Aislearneach und Tir na Geach zeigen
ihre bestehenden Icons; die Ausnahmen Roriksheim und Celtigerns Wacht behalten
die normale Ebenenansicht. Bericht und Screenshots:
`diagnostics/faelaorn-skjaerheim-2026-10-22/`.
