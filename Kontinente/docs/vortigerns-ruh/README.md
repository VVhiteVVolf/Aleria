# Vortigerns Ruh: Übernahme vom 18. Oktober 2026

Die acht vom Nutzer gelieferten Altcode-Dokumente liegen unverändert unter `sources/`.
`sources.json` hält Reihenfolge, Titel und SHA-256 der Originaldateien fest. Sie dienen
als Beleg; die Seiten laden ausschließlich ihre strukturierten `.data.mjs`-Dateien.

Die Königliche Grafschaft Vortigerns Ruh mit Hauptstadt Mathragon entspricht der im
Auftrag genannten königlichen Grafschaft von Mathragon. Dazu gehören die Baronie
Uthers Aufstieg und die sechs Herrschaften Cath, Grael, Penderyn, Dienyddiwr, Dyngwn
und Marwolaeth. Die gemeinsamen Register, Ratskarten, Infoboxen und Verwaltungsfenster
bleiben für ihre Darstellung verantwortlich.

## Quellenabgleich

- Sämtliche erzählenden Absätze wurden übernommen. Leere Musterkarten, Fragezeichen-
  Portraits und rein dekorative Leerzeilen werden nicht als fertige Einträge ausgegeben.
- Der Rat ist auf ausdrücklichen Nutzerwunsch derselbe wie der Königsrat von Cenyr.
  Die zehn Ämter, Namen, lokalen Portraits und Familienziele gehören zentral zu
  `modules/cenyr-court/royal-council.mjs`. Cenyrs alte Tabelle bleibt wegen ihrer
  Exportstruktur erhalten; ihre sichtbare Ratsgruppe bezieht dieselbe Quelle.
- Die sechs Herrschafts-Infoboxen enthalten kopierte Verweise auf Gwynthor und
  Celtigerns Wacht. Sie wurden anhand der vorhandenen Familienakten auf den belegten
  Verwaltungssitz Mathragon und Vortigerns Ruh berichtigt. Die namentlichen Oberhäupter
  stammen aus dem jeweiligen Rat im selben Altcode. „Greal“ wurde an die vorhandene
  Familienakte „Grael“ angeglichen; Morgan Dyngwn an die gleichnamige Ratsangabe.
- Die Grafschaft zeigt acht große Häuser sowie sieben örtliche Ritterhäuser und
  Cyfrif in Mathragon. Die Zuordnung stammt aus
  `Stammbäume/assets/js/data/vortigerns-ruh-house-profiles.js`, einschließlich der
  untergeordneten Akten. Die Baronie zeigt Ceirwyn und den antiken Clan Fiachraoin.
  Penderyn führt außerdem die überlieferten Bürgerhäuser Swynol und Creithiog aus
  Bragwhislyn; für diese wurden keine Familienakten oder Wappen erfunden.
- Vorhandene Portraits wurden nur bei identischer Quell-URL durch ihr lokales Archiv
  ersetzt. Unbekannte Amtsträger bleiben unbekannt. Es wurden keine Hausbiografien,
  genealogischen Daten oder Verwaltungsinhalte anderer Grafschaften übernommen.

## Karte und Ortsregister

Die bereits vorhandene Karten-ID `cenyr-vortigerns-ruh` und ihr `dataPath` bleiben
erhalten. Die drei gelieferten PNGs (4096 × 2208) wurden ohne Pixelverlust als WebP
abgelegt. `Karten/Cenyr/vortigerns-ruh/images.source.json` belegt ihre Herkunft.

`markers.source.json` enthält alle **47** Koordinaten der beiden Screenshots:
19 in Bild 1 und 28 in Bild 2. Die Koordinaten beziehen sich auf die untere linke
Bildecke; die Oberfläche erhält `x / 4096` und `1 - y / 2208`. Die beiden Ahnenbäume
haben unabhängige IDs mit ihren Koordinaten. Kategorien und Tabellen verwenden den
vorhandenen Kategorienkatalog und `KartoPinTablePresets`, etwa Rosszuchtsiedlung,
Brauersiedlung, Klostersiedlung, Taverne, Turnierplatz und Ahnenbaum.

Alle Symbole wurden an den jeweiligen Koordinaten tatsächlich angesehen. Uathachs
Behausung verwendet die neutrale Gebäudetabelle. Die nachgereichte Beschreibung
belegt Uathach als Erzdruidin und Wächterin des Coed Y Felin. Mwyncarreg ist durch
die neue Beschreibung und den roten Verbund auf der Regionskarte Penderyn zugeordnet.
Bronnmarw/Bronmarw, Lyswynfaen/Llyswynfaen, Llywellyn/Llyswellyn,
Carreglyn/Carregdyn und Grauer/Grüner Pfad wurden für die Ortsregister mit den
Kartenangaben beziehungsweise den übereinstimmenden Geographietabellen abgeglichen.
Die Originalschreibweisen bleiben im Quellenarchiv erhalten.

Die Grafschaft enthält jeden Marker einmal. Die drei besonderen Orte, die der
Baronie-Altcode zusätzlich aufführt, bleiben auch auf der Baronieseite sichtbar.
`modules/vortigerns-ruh/places.mjs` leitet die gemeinsamen Ortsangaben direkt aus
`markers.source.json` ab; jede Seite bestimmt ihre Auswahl selbst.

### Nachgereichte Ortsbeschreibungen und Heraldik (18. Oktober 2026)

Die 42 Ausschnitte aus `Downloads/Vortigerns Ruh/Orte` sind unter `places/`
unverändert archiviert; `places/sources.json` dokumentiert Originalnamen und SHA-256.
`Karten/Cenyr/vortigerns-ruh/places.source.json` enthält die gelesenen Texte sowie
knappe Gewerbeangaben aus denselben Beschreibungen. Karte und Ortsregister verwenden
dieselbe Zuordnung über `places.mjs`. Im Register sind Beschreibungen aufklappbar.
Für Mathragon, Calon, Bronfael und die beiden Ahnenbäume lag kein eigener Textausschnitt
vor; dafür wurden keine neuen Ortsbeschreibungen erfunden.

Alle 47 Marker besitzen eine Herrschafts- und Hauszuordnung. Uathachs Haus und die
beiden Ahnenbäume gehören territorial zur grünen Baronie Uthers Aufstieg, Mwyncarreg
zur roten Herrschaft Penderyn. Die Gilde von Llysceffyl bleibt Pächterin; Gebietsherr
ist Pendrag. Die Karte führt die Grafschaft, beide Baronien und sechs Herrschaften
als miteinander verknüpfte Verwaltungsebenen. Die besonderen Orte stehen im
Grafschaftsregister jetzt unmittelbar unter Uthers Aufstieg.

`territories.source.json` trennt runde Hauswappen von den ursprünglichen
Herrschaftsbannern. Die sechs Banner aus den identischen Bild-URLs des Altcode-Archivs
liegen lokal unter `Stammbäume/assets/images/regions/Cenyr/Vortigerns Ruh/`.
Bildquellen und Prüfsummen stehen in derselben Zuordnung. Kartenköpfe zeigen das
Hauswappen und das passende Herrschaftsbanner; Herrschaftsseiten und Geographieköpfe
verwenden die territorialen Banner, Hausregister weiterhin die Hauswappen.

Der Ausschnitt „Zum Grünen Pfad“ bezeichnet den Betrieb im Text als „Der Grüne Drache“.
Die Zuordnung folgt seiner ausdrücklichen Überschrift; der überlieferte Text bleibt
erhalten. Drakenburg bleibt ein künftiger Sitz Penderyns. Die neuen Ortsausschnitte
ändern keine genealogischen Akten oder dort gespeicherten Wohnsitze.

`node Karten/tools/enrich-vortigerns-ruh.mjs` prüft die Übernahme gegen die Quellen.
Sein einmaliger `--write`-Modus ist auf den leeren Text-/Heraldikstand der Revision 1
begrenzt. Er überschreibt keine späteren Kartenbearbeitungen. Lokale Browserentwürfe
bleiben wie bisher erhalten; „Aktuelle Karte laden“ wechselt mit Sicherung zur neuen
veröffentlichten Fassung.

## Prüfung

- `node Karten/tools/import-vortigerns-ruh.mjs`: Koordinaten, Kategorien, Vorlagen und
  lokale Symbole aller 47 Marker. `--write` ist ausschließlich für eine leere Karte
  mit Revision 0 zugelassen und überschreibt keine späteren Bearbeitungen.
- `node Karten/tools/validate-karten-structure.mjs`: keine Registry-Fehler.
- `Kontinente/tests/vortigerns-ruh.browser.mjs`: alle acht Seiten, sämtliche
  Quellabsätze, Bilder, Hausauswahl und neun Kapitel; 1440/1024/768/390 Pixel;
  identischer Königsrat auf beiden Seiten; drei Kartenebenen, Markerkoordinaten
  und Öffnen des Mathragon-Markers.

Auch die bestehenden Register- und Vorschautests bestehen. Von 22 ausgewählten
Datenprüfungen bestehen 20; zwei ältere Prüfungen in `house-territory-scope.test.mjs`
schlagen sowohl im unveränderten Git-Stand als auch nach dieser Übernahme fehl
(veraltete Bürgerhauszahl 13 statt 21 und der bestehende Fontani-Verweis). Die
zugehörigen Quelldaten wurden für diese Übernahme nicht verändert.
