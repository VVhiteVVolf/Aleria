# Venalys: überarbeitete Karten vom 4. November 2026

Der Nutzer stellte `Alternative Maps/Venalys Normal.png` und
`Alternative Maps/Venalys Regionen.png` bereit und erlaubte, die Karten
anzupassen, neue Orte zu benennen und bisherige Namensvorschläge nach Ermessen
zu verschieben. Die beiden gelieferten Dateien wurden tatsächlich angesehen,
einschließlich vier vergrößerter Umlandsektoren und des Stadtkerns.

## Quelle und unveränderte Originale

Beide neuen PNGs messen **6144 × 3524 Pixel**. Die bisherigen Karten maßen
8192 × 4698 Pixel. Der neue Stadtkern ist deutlich kleiner und weiter im
Norden angeordnet; mehrere Flussarme und Brücken im Umland sind verändert.
Die Grafiken dürfen daher nicht mit den bisherigen Bezirksflächen überlagert
werden. Beide neuen Fassungen haben untereinander dieselbe Geometrie.

`../active-map-sources.json` besitzt Herkunft, SHA-256, Originalkopien,
Abmessungen und die vier WebP-Ableitungen. `prepare-map-revision.py` kopiert
die neuen PNGs bytegenau nach `sources/originals/*-20261104.png`. Die alten
Original-PNGs, das frühere Territorialmodul und die alten Ableitungsbelege
bleiben erhalten. Nur die vier etablierten öffentlichen WebP-Kartenpfade
werden durch die neue aktive Fassung ersetzt; keine Grenzen oder Symbole
werden nachgezeichnet oder aus der Karte gelöscht. Die Rohkarten bleiben
außerhalb des statischen Pakets.

## Bestandsvergleich

| Merkmal | Bisher | Neue Karte |
| --- | ---: | ---: |
| Stadtbezirke | 13 | 13 |
| Kartierte Außenorte | 78 | 98 |
| Unkartierte Altorte | 0 | 4 |
| Dauerhafte Außenort-IDs insgesamt | 78 | 102 |
| Dorf-Symbole | 15 | 25 |
| Handels-/Handwerkssiedlungen | 15 | 15 |
| Küstenensembles, Typ/Rechtsstellung offen | 0 | 4 |
| Anwesen-Ensembles | 14 | 22 |
| Taverne/Herberge/Bordell, Nutzung offen | 6 | 8 |
| Einzelne Türme | 8 | 4 kartiert, 4 unkartiert |
| Ritterliche Güter/Ringfestungen | 9 | 9 |
| Klöster / Kirche / große Burg / Bergbausiedlungen / Waldsiedlung | 4 / 1 / 1 / 4 / 1 | unverändert |

Alle **13 Bezirks-IDs** und ihre neutralen Ausgangsnamen bleiben bestehen.
Die Baugruppen der Stadt erlauben eine eindeutige Zuordnung: nördliche Häfen,
westliche Kuppelbauten, zentraler großer Kirchenbau, Amphitheater und die
drei südlichen Viertel sind dieselben Bezirke. Die neuen Bedienpolygone
werden mit `measure-map-districts.py` aus den 13 geschlossenen Innenflächen
der roten Grenzstriche gemessen. Die Konturen liegen konservativ innerhalb
der Pinselstriche; sie sind Bedienflächen, keine neue amtliche Vermessung.
`district-geometry.json` hält Messraster, Identitätsanker und Innenflächen fest.

## Namen und Typen

Die 78 bisherigen Orts-IDs und sämtliche bisherigen Namen bleiben erhalten.
Neun Dorfnamen werden im Rahmen des ausdrücklich autorisierten Entwurfs auf
passende Dorfsymbole der neu gegliederten Flusslandschaft versetzt:
Vellano, Civena, Sernio, Onara, Fidera, Orviano, Livena, Ventano und Valdessa.
Es handelt sich um Namensvorschläge, nicht um den Beweis einer historischen
Identität der dargestellten Bauten. Der unbenannte Tavernentyp `poi-t05`
erhält ebenfalls einen passenden neuen Anker am nordöstlichen Flussarm.
Die übrigen sichtbaren Bestandsorte behalten ihre Anker.

Zehn zusätzliche Dorf-Symbole erhalten neue IDs `poi-d16` bis `poi-d25`:
**Avelano, Cerenza, Pavello, Vestara, Lorento, Narvella, Elvanto, Dorvessa,
Calvessa und Orseta**. Vier bisher nicht verzeichnete größere Uferensembles
werden als **Marentia, Corvenza, Altavero und Feressa** (`poi-n01`–`poi-n04`)
vorgeschlagen. Ihre Rechtsstellung, Wirtschaftsrolle und ein möglicher
Stadtrang sind nicht belegt und bleiben offen. Keine Patrizier-, Magnarier-
oder Hausbindung wird aus den Gebäuden abgeleitet.

Die neuen Namenskerne hatten bei der Suche in den vorhandenen Kontinent-,
Stammbaumdaten und Vorschaukatalogen keine Treffer; die Screenshot-Verbote
werden eingehalten. Die acht neuen Anwesen und zwei neuen Tavernentypen
bleiben neutral benannt. Räumlich zusammengehörige violette Gebäude werden
wie bisher als ein Anwesen-Ensemble behandelt. Neue Häuser, Wappen oder
Krieger sind für diese Kartenerweiterung nicht erforderlich.

Alle Entscheidungen und Messanker stehen in `poi-observations.json`.
`build-map-revision.mjs` erzeugt daraus mit dem erhaltenen früheren Modul
den reinen Runtimekatalog. Die Figuren-, Haus- und kanonischen Ortsregister
werden dabei nicht geändert.

## Nicht mehr eingezeichnete Türme und alte Entwürfe

Die vier früheren Türme **Torre Levante, Torre Calvena, Torre Sernato und
Torre Ventalis** (`poi-r01`–`poi-r04`) sind auf der neuen Karte nicht mehr
darstellbar. Ihre Namen und IDs bleiben erhalten, ihr aktueller Anker ist
ausdrücklich `null`. Sie erhalten weder einen erfundenen Ersatzstandort
noch einen Phantommarker. Hat ein alter Entwurf dort Hauszuordnungen,
erscheinen diese getrennt unter „Noch nicht verortete Orte“ und lassen sich
einzeln lösen.

Die LocalStorage-Kennung und Schema-Version bleiben erhalten. Ausschließlich
der vollständige, belegte alte Satz aus 13 Bezirken und 78 Außenorten wird
zusätzlich zum vollständigen aktuellen Satz akzeptiert. Beim Laden werden
die 24 neuen Ziele mit leeren Zuordnungen ergänzt. Bezirksnamen, alte
Mehrfachzuordnungen und auch Bindungen an die vier Altorte bleiben erhalten.
Beliebig unvollständige, unbekannte oder fremde Entwürfe werden weiterhin
atomar abgelehnt. Die Zuordnung bleibt rein lokal; weder Hausrang noch
kanonischer Wohnort wird daraus geändert.

## Sichtbelege und Wiederholung

`diagnostics/venalys-map-revision-20261104/` enthält die betrachteten
Gesamtansichten, den direkten Alt-Neu-Vergleich, vier Umlandsektoren,
die unabhängig gemessenen Bezirksflächen und die komplette neue
98-Punkte-Überlagerung. Die Dorf-Vorlagenmessung wurde anhand der
bereitgestellten Legende gegengeprüft; falsche Treffer im Wolkenrand
wurden verworfen. Der endgültige Datenbestand folgt der tatsächlichen
Sichtung, nicht ungeprüften automatischen Treffern.
