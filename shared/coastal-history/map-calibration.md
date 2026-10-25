# Leitheach: Übertragung der Ereigniskarte von 1733

Die neue Ereignisdarstellung benutzt das unveränderte vorhandene Kartenbild
`Karten/Leitheach/Kartenbilder/normal.webp` (4096 × 3573). Die archivierte
World-Anvil-Ereigniskarte zeigt einen vergrößerten Ausschnitt derselben
Kartengeometrie (4096 × 2755), mit bereits ins Bild gezeichneten roten Pfeilen.
Diese alten Pfeile werden nicht in das neue Bild übernommen. Die 17 getrennten
Quellmarkierungen bleiben einzeln erhalten.

## Quellen

- Auftrag: https://www.worldanvil.com/world/map/27cd3b5b-5a6c-414d-afc4-dcd4bf50771e/edit
- Archivbild: `Archiv/Quellen/kuestenchroniken-2026-10-24/assets/leitheach-raid-worldanvil.jpg`
- Unveränderte Erfassung der Marker: `Archiv/Quellen/kuestenchroniken-2026-10-24/worldanvil-markers.capture.json`
- Zusätzlicher DOM-Abgleich der fünf anfangs sichtbaren Marker:
  `Archiv/Quellen/kuestenchroniken-2026-10-24/worldanvil-map.capture.json`
- Gesamtchronologie: `coastal-02`, insbesondere B030–B038 in `sources.json`.
- Einzelereignisse: `coastal-03` bis `coastal-09`.

Die SHA-256-Prüfsummen beider Bildfassungen und die ursprüngliche World-Anvil-ID
jedes Markers stehen in `leitheach-route.json`. An World Anvil wurden im Rahmen
dieses Abgleichs keine Änderungen gespeichert. Weder die vorhandenen Karten-Pins
noch Browserentwürfe werden überschrieben.

## Registrierung und Wiederholung

`python shared/coastal-history/calibrate-leitheach-map.py` erzeugt ausschließlich
`shared/coastal-history/leitheach-route.json`. Der Offline-Abgleich benötigt
Pillow und NumPy; die Website benötigt diese Pakete nicht.

Sechs über den gesamten alten Kartenausschnitt verteilte Bildfenster werden in
Graustufen mittels normalisierter Kreuzkorrelation mit dem vorhandenen Bild
verglichen. Die lokale Skalensuche reicht von 0,636 bis 0,646 in Schritten von
0,0005; für die Zentren zählen die tatsächlichen ganzzahligen Abmessungen der
resampelten Fenster. Aus diesen sechs Korrespondenzen werden Skalierung und
Verschiebung für jede Achse durch kleinste Quadrate bestimmt. Es gibt keine
Perspektivverzerrung, Rotation oder nachträgliche Verschiebung einzelner Marker.
Die normierten Korrelationswerte der sechs Fenster liegen zwischen 0,81 und 0,89.

Aktueller Fit:

```text
targetX_px = 0.6395472326447511 * sourceX_px + 5.029044208751897
targetY_px = 0.6395444447591725 * (2755 - sourceY_von_unten_px)
             + 3.1467403399871747

x = targetX_px / 4096
y = targetY_px / 3573
```

Der Ursprung der World-Anvil-Formularkoordinaten liegt **unten links**. Das lokale
Kartenmodell und die neuen Ereignismarker haben ihren Ursprung **oben links**.
Die Umkehrung der Y-Achse ist deshalb zwingend. Das sichtbare DOM der fünf
anfangs eingeblendeten Marker bestätigt diese Achsenrichtung unabhängig.

Der quadratische mittlere Fitfehler der sechs Fenster beträgt etwa **0,19 Pixel**
des Zielbilds. Als konservative Registrierungstoleranz gelten **4 Zielpixel**.
Das ist eine Aussage über den Bildabgleich, keine Behauptung, dass der historische
Schlachtort metergenau bekannt sei. Die Marker stehen an ihren übernommenen
Quellankern; keine moderne Ortsmarkierung wurde stillschweigend vorgezogen.

Der visuelle Abgleich prüft Inselketten, Küstenlinie, die Flussmündung bei Broch
an Clais, die Flusssiedlungen, Dun Laog und beide nördlichen Täuschungsziele.
Der vorhandene Stadt-Pin von Dun Laog liegt etwa 18 Zielpixel östlich des alten
Angriffsmarkers. Beide liegen am selben Stadtmotiv. Diese Abweichung wird nicht
durch eine verfälschte Gesamtkalibrierung oder einen erfundenen neuen Standort
ausgeglichen. Dun Athars heutiger Stadt-Pin ist ebenfalls kein Ersatz für den
weit draußen liegenden historischen Richtungsmarker seiner Verstärkung.

## Historische Genauigkeit und Darstellung

Alle **17 Quellmarker** sind im Ergebnis vorhanden, einschließlich der beiden
getrennten Inselüberfälle, der beiden Siedlungspaare, des Seegefechts vor
Cluainslige sowie der Richtungsmarker für Verstärkung und Rückzug. Es gibt
**sieben zugeordnete Ereignisdossiers**, nicht siebzehn erfundene Schlachten.

Die Quelle hat drei Kartenebenen („Phase I“, „Phase II“, „Phase III“), während ihr
Text vier Erzählphasen beschreibt. `sourceMapPhase` bewahrt die Kartenebene;
`stageId` ordnet der vierteiligen Chronologie zu. Beide werden nicht gleichgesetzt.

Die Linien in `routes` verbinden Ereignismarker **schematisch**. Sie sind keine
vermessenen Fahrwasser, Beweise für den genauen Kurs einzelner Schiffe oder
Grundlage für eine behauptete gleichmäßige Fahrgeschwindigkeit. Der Datensatz
kennzeichnet das ausdrücklich als `schematic-marker-connections`. Verstärkung
aus Dun Athar, Verstärkung über den Fluss und die Fluchtrichtung werden als
Richtungen geführt. Die Lage eines Richtungspunkts bezeichnet keine zusätzliche
Siedlung. Flucht- und Verstärkungslinien dürfen entsprechend als Pfeile erscheinen.

Die ursprünglichen eintägigen Zeiten wurden am 25.10.2026 auf ausdrücklichen
Nutzerwunsch durch einen siebentägigen Zeitplan ersetzt. `leitheach-chronology.json`
ist die einzige Quelle für Zeiten, Fahrtabschnitte und Ruhepausen.
`leitheach-route.mjs` ergänzt sie zur Geometrie. Der Offline-Kalibrator erzeugt
keine Uhrzeiten und kann die überholte Chronologie nicht wiederherstellen.
Für die beiden Inselmarker und das Seescharmützel vor Cluainslige gibt es weiterhin
keine eigene ausgearbeitete Ereignisvorlage oder genaue Uhrzeit. Winter 1733 ist
überliefert, ein bestimmter Monat oder Kalendertag nicht.

## Grober Distanzanker und zeitliche Plausibilität

Der Nutzer ergänzt als Maßstabsorientierung: **Dun Athar bis Dunbaile ungefähr
30+ km**. `distanceReference` führt das ausdrücklich als **„30+ km, ungefährer
Mindest-Richtwert“**. Die Angabe ist keine exakte Vermessung; es ist außerdem
nicht festgelegt, ob damit eine Luftlinie oder eine konkrete Reiseroute gemeint
ist. Entfernungen daraus sind nur grobe Verhältniswerte. Sie begründen weder
exakte Reisezeiten noch behauptete Schiffsgeschwindigkeiten.

Die tatsächlich vorhandenen Referenz-Pins liegen beide auf der Karte
`Karten/Leitheach/tir-na-sleagh/data.json`:

| Ort | Quell-ID | Teilkartenpixel, Ursprung oben links | Übertragen auf Hauptkarte |
| --- | --- | --- | --- |
| Dun Athar | `6530d8ac-656c-42f3-836d-087d9b67b3bb` | 554 / 872 | ca. 224 / 358 |
| Dunbaile | `e15e9db3-0611-445f-836a-0c62543cf9cc` | 1076 / 1210 | ca. 440 / 498 |

Fünf von Wolken nicht verdeckte Bildfenster registrieren die unveränderte
Sleagh-Teilkarte auf die Hauptkarte. Der Fitfehler beträgt **0,175 Hauptkartenpixel**,
die Korrelationswerte liegen zwischen 0,76 und 0,89. Näherungsweise gilt:

```text
mainX_px = 0.415099 * sleaghX_px - 6.247508
mainY_px = 0.415053 * sleaghY_px - 4.075571
```

Die genauen berechneten Koeffizienten, Bild- und Datenprüfsummen sowie alle fünf
Fenster stehen unter `distanceReference.registration` in der JSON-Datei. Die
beiden übertragenen Pins liegen rund **258 Hauptkartenpixel** auseinander.
Der zusätzlich vorhandene Hauptkarten-Pin Dun Athars liegt rund 19 Pixel nördlich
des übertragenen Teilkarten-Pins. Für den Distanzanker werden deshalb konsistent
**beide Pins derselben Teilkarte** verwendet, statt unterschiedliche Ortsanker zu
vermischen. Der Registrierungsgüte widerspricht dieser Unterschied nicht.

Die vorherige grobe Prüfung der eintägigen Originalchronologie ist durch den
neuen Auftrag überholt. Der aktive Geometriedatensatz enthält deshalb keinen
widersprechenden `chronologyReview`-Status mehr. Die genaue zeitliche Prüfung
steht in [Leitheach: zeitliche Arbeitsfassung](leitheach-chronology.md).

Für diese Arbeitsfassung werden 35 km als nominale Referenz angenommen,
30–40 km geprüft und 35 % Zuschlag auf die summierten Markerabstände angesetzt.
Das ist ein Planungsansatz, keine vermessene Flussroute. Alle elf Fahrtabschnitte
passen auch am 40-km-Vergleichsmaßstab in ihre Zeitfenster, nach Abzug der separat
angegebenen Ruhezeiten. Landung und Gefecht liegen außerhalb der Fahrtzeiten.
Die beiden Siedlungspaare werden zeitlich getrennt; Dun Laog kann bereits vor
dem Angriff alarmiert werden. Der Abzug aus der Stadt und das spätere Erreichen
der Küste sind getrennte Zeitpunkte.

## Neue Marker

Die drei SVGs in `Ereignisse/assets/coastal-history/markers/` erweitern den
vorhandenen quadratischen Pergamentrahmen aus
`IconOrdner/ReiterIcons/Fraktionen.svg`. Sie sind bewusst Codegrafiken des
vorhandenen Iconsystems, keine generierten Landschaftsminiaturen:

- `sea-battle.svg`: Langschiff, gekreuzte Äxte und Wellen.
- `raid.svg`: Fackel und gekreuzte Klingen.
- `siege.svg`: Burgtor und Ramme für den Sturm auf eine Befestigung.

Die Bildtitel sind direkt in den SVGs enthalten. Die zugehörige JSON-Zuordnung
steht unter `markerAssets`. Das Karten-UI ergänzt sichtbare Legende und
zugängliche Beschriftungen der interaktiven Marker.
