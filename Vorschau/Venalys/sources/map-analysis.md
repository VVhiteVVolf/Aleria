# Venalys: Karte, Bezirke und äußere Orte

Kartensichtung vom 2. November 2026. Grundlage sind die vom Nutzer gelieferten
Dateien `C:\Users\fhg_r\Downloads\Venalys\Venalys Normal.png` und
`Venalys (Bezirke).png`, beide **8192 × 4698 Pixel**. Beide wurden tatsächlich
angesehen; die zweite Fassung besitzt dieselbe Kartengeometrie und ergänzt
handschriftartige rote Bezirksgrenzen. Die Quelldateien wurden nicht verändert.

## Stadtbezirke

Die rote Fassung umfasst **13 geschlossene Bezirke**. Einzelne Bezirke
enthalten mehrere Kanalinseln; deshalb darf nicht jede Insel als zusätzlicher
Bezirk gezählt werden. Die gemeinsame Kartengrundlage wird durch einen
Mauerring um die Kanalstadt, mehrere nördliche Hafenbecken und die Flüsse des
Umlands gebildet.

Die Bezirke besitzen in `../territory-data.mjs` dauerhafte Kennungen
`district-01` bis `district-13` und ausschließlich neutrale Namen `Bezirk 01`
usw. Der Nutzer will die eigentlichen Namen manuell vergeben. Die Beschreibungen
benennen nur sichtbare Lage und Architektur, keine erfundene Verwaltung oder
kirchliche Rangstellung. Es gibt keine vorausgewählte Hauszuordnung.

Die Prozentpolygone folgen den Innenkanten der roten Striche. Dafür wurden die
roten Grenzlinien auf einer Diagnoseverkleinerung getrennt, kleine Strichlücken
geschlossen und die äußeren Konturen der 13 Innenflächen vereinfacht. Die
Anker liegen jeweils innerhalb ihres Polygons. Die Polygone sind eine
Bedienfläche für den Entwurf, keine neue Vermessung oder Bearbeitung der Karte.

## Äußere POIs

**78 äußere Orts- und Gebäudepunkte** wurden gegen die mitgelieferten
Legendenbilder geprüft. Alle liegen außerhalb der 13 Stadtbezirke.

| Kartentyp | Anzahl | Behandlung |
| --- | ---: | --- |
| Dörfer / kleine Orte / Höfe / Weiler | 15 | Eigene Ortsnamen; der genaue Siedlungsuntertyp bleibt offen. |
| Handels- und Handwerkssiedlungen | 15 | Eigene Ortsnamen; allgemeiner Typ Siedlung. |
| Waldsiedlung | 1 | Silvena. |
| Ritterliche Güter oder Ringfestungen | 9 | Eigene Namen mit Castel; konkrete Rechtsstellung und Hausbindung bleiben offen. |
| Türme | 8 | Eigene Namen mit Torre. |
| Klöster | 4 | Eigene Klosternamen; keine neuen Heiligen oder Amtsinhaber erfunden. |
| Kirche | 1 | Kirche Convalia. |
| Große Burg | 1 | Burg Valcerra im äußersten Süden. |
| Bergbausiedlungen | 4 | Eigene Ortsnamen; keine konkreten Erzvorkommen behauptet. |
| Taverne / Herberge / Bordell | 6 | Alle heißen ausschließlich **Taverne, Herberge oder Bordell**. |
| Anwesen | 14 | Ausschließlich neutrale Arbeitsbezeichnungen **Anwesen 01** bis **Anwesen 14**. |

Es werden somit **58 Orte benannt**, während **20 Nutzungen beziehungsweise
Anwesen vorerst neutral bleiben**. Alle POIs besitzen eigene dauerhafte IDs,
Prozentanker und einen Verweis auf ihren Legendentyp. Hauszuordnungen sind
nicht in den Kartendaten hinterlegt.

Die violetten Anwesen sind auf der Karte teils einzelne Häuser, teils räumlich
gemeinsame Ensembles aus mehreren Gebäuden. Wie im gelieferten Anwesen-Beispiel
werden zusammengehörige Ensembles als ein Orts-Punkt erfasst. Dies ist die
einzige nicht ausdrücklich beschriftete Gruppierungsannahme; einzelne Gebäude
eines solchen Ensembles könnten bei einer späteren feineren Parzellierung
getrennte Punkte erhalten. Die weiteren violetten Einzelhausvarianten werden
ebenfalls als Anwesen behandelt. Blaugraue niedrige Häuser entsprechen dagegen
den beiden gelieferten Tavernentypen. Steine, Bäume, Straßen, gewöhnliche
Brücken, Schiffe und der Wolkenrahmen werden nicht zu zusätzlichen Siedlungen
erklärt.

## Namenprüfung

Die Ortsvorschläge orientieren sich an früher italienischer beziehungsweise
romanischer Namenswirkung. Die ausdrückliche Bindung an das Sprachmodul
betrifft im Nutzerauftrag die **Personennamen**; es werden hier keine Personen
angelegt. Gegen bestehende Orts-, Haus- und Familienquellen wurde nach allen
neuen Namenskernen gesucht. Dabei kollidierten die ersten Formen Senara,
Ordinia und Argentella mit vorhandenen Personen; sie wurden vorsorglich durch
**Senavia, Ordessa und Arganella** ersetzt. Für die endgültigen Namenskerne
wurden in den geprüften kanonischen Daten keine vorherigen Treffer gefunden.

Die neuen Ortsnamen übernehmen keinen der verbotenen Screenshotnamen. Die
Bezirksnamen bleiben vollständig frei für die manuelle Benennung.

## Diagnose und Datenvertrag

- `diagnostics/venalys-20261102/map-normal.jpg`: Gesamtansicht der Normalfassung.
- `diagnostics/venalys-20261102/map-districts.jpg`: Gesamtansicht der Bezirksfassung.
- `diagnostics/venalys-20261102/district-components.jpg`: 13 nummerierte Innenflächen.
- `diagnostics/venalys-20261102/district-city.jpg`: große Bezirkssichtung.
- `diagnostics/venalys-20261102/poi-inventory.jpg`: alle 78 erfassten Gruppen.
- `diagnostics/venalys-20261102/poi-marked-*.jpg`: vergrößerte Prüfbereiche.
- `diagnostics/venalys-20261102/poi-identification.jpg`: Vergleich kleiner POI-Varianten.

Das Produktionsmodul `../territory-data.mjs` exportiert nur reine Daten:
`districts`, `pointsOfInterest`, `mapGeometry`. Koordinaten und Polygonpunkte
sind in Prozent der vollständigen 8192 × 4698-Karte angegeben. Die UI kann
Bezirksnamen und Beziehungen zwischen Häusern und mehreren Bezirken/Orten
getrennt speichern, ohne Quellenpunkte oder geometrische IDs umzubenennen.
