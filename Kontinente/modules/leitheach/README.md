# Leitheach

Die 27 Herrschaftsseiten verwenden die gemeinsame Herrschaftsoberfläche. Inhalt,
Rat und Clanregister liegen in `pages.source.json`; Ziele und Hierarchie im
Gebietskatalog `Karten/Leitheach/territories.import.json`.

- `node Kontinente/scripts/build-leitheach.mjs` erzeugt Seiten und den eigenen
  Registerblock. `--check` prüft den Stand ohne Änderungen.
- `node Kontinente/scripts/build-alben.mjs` aktualisiert anschließend die Links
  im Schild von Ailith.
- `node Karten/tools/import-leitheach-source.mjs` gleicht die vollständigen
  Browserbelege vom 24. Oktober mit den Karten- und Ortsquellen ab.
- `node Karten/tools/build-leitheach.mjs` erzeugt Karten, Marker und Rücklinks aus
  dem Gebietskatalog. Der bestehende Schutz vor dem
  Überschreiben bearbeiteter Kartendaten bleibt erhalten.

## Quellen und Einordnung

Die unveränderten Altartikel 00–22 unter `Karten/Leitheach/sources/` liefern die
vorhandenen Texte und Ratsämter. Die aktuellen Familienakten liefern Namen,
Portraits, Wappen, Rang und Lehnsherren. Die sieben Karten wurden am 24. Oktober
mit neu erfasster Geometrie und sämtlichen Ortsmarkern korrigiert. Quellenkennungen
bleiben erhalten. Es werden keine Ortspositionen oder Beschreibungstexte erfunden.

- Auf der Fürstentumsseite stehen die sechs Oberherrschaften und ihre großen
  Clans. Die übrigen Familien werden auf ihrer unmittelbaren Verwaltungsebene
  geführt.
- Ua’Cleir, Ua’Ghaiscíoch und Dál’Ceardaíocht dienen den Gallchobhair in Tir na
  Coimhthioch; ihre Seiten sind dort unter Tir na Sinsear verschachtelt.
- Tir na Fancha gehört gemäß Nutzerbestätigung zu Na’Mhuir. Der falsche
  Buarstrath-Text wird nicht verwendet.
- Die kopierte Caoimhe-Herrscherangabe im Trodach-Artikel wird durch Caireall
  Trodach aus der Familienakte ersetzt. Sidhe Somhairle bleiben entsprechend
  ihrer Akte Lairds; der alte Baronie-Vordruck wertet sie nicht auf.
- Namen verheirateter Ratsmitglieder werden mit den vorhandenen Personenakten
  verknüpft; uneindeutige oder nicht im Stammbaum enthaltene Personen bleiben
  ohne erfundene Familienzuordnung. Nicht überlieferte Portraits verwenden die
  gemeinsame lokale Silhouette.
- Die alten Clan-Präfixtexte werden über den vorhandenen Kulturabschnitt im
  Schild von Ailith erschlossen. Unfertige Gesetzesfragmente werden nicht als
  fertige Gesetze ausgegeben.

Die Quellen enthalten für zahlreiche kleinere Herrschaften noch keine Prosa.
Diese Abschnitte bleiben offen. Der zusätzliche Altartikel 23 zur Fürstenfolge
bleibt archiviert; die Seite verlinkt die bestehende Fürstenlinie im Stammbaum.
Ein eigenständiger Chronikartikel ist nicht enthalten.

Die sechs Unterkarten liefern gemeinsam 304 Orte für die Ortsregister. Jede Seite
zeigt nur die eigenen Orte, nach Ortsart gegliedert. Untergebene Gebiete bleiben
verlinkt. Die Übersicht enthält zusätzlich 14 Ortsmarker; sechs alte Navigationspins
sind im Quellenabgleich als Kartenverweise dokumentiert. Alle 98 vorhandenen
Ortsbeschreibungen wurden vollständig übernommen; 220 Marker ohne Quellentext
tragen einen entsprechenden Hinweis. Die drei zusätzlich belegten Sleagh-Herrschaften
von Ua’Eirce, Uí Fiachrach und Ruin Ua Laoch besitzen eigene Seiten.

Die alten Clanlinien verbinden oft nur einzelne Siedlungen und kreuzen sich.
Zugehörigkeit wird an den belegten Anschlusspunkten ermittelt, nicht über eine
künstlich geschlossene Fläche. Eindeutige Ortsbeschreibungen sind in
`Karten/Leitheach/place-review.source.json` gesondert geprüft. Cairn Fàire,
Senanbail und Mârbail werden entsprechend ihrer Ortsbeschreibungen als Sitze
geführt. Globale Familienakten und bestehende Browserentwürfe bleiben erhalten.
