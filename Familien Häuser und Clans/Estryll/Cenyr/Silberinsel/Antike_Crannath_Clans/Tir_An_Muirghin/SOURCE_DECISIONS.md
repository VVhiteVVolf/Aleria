# Tir An Muirghin: Quellenentscheidungen vom 3. November 2026

Die Nutzeranlage `277d7f8c-11f2-4d49-9175-24d06463c094/Eingefügter Text.txt`
ist bytegleich als `animexx-original.html` erhalten. Das zugehörige `sources.json`
enthält Original- und Bildhashes, Maße und Herkunft.

- Die genealogische Tabelle, ihre unbekannten Karten und die Stammbaumgrafik
  werden vollständig ignoriert. Es werden keine Gründer, Ehepartner, Nachkommen,
  Lebensdaten, Aussterbe-Knoten oder Beziehungen ergänzt. Der gemeinsame
  Hausseitenadapter bettet allein die bestehende Akte `haus-tir-an-muirghin` ein.
- Die aktuelle Registerhierarchie bleibt
  `Cenyr > Silberinsel > Antike Crannath Clans`. Der Rang **Mor Tiarna (Graf)**
  stammt aus dem bestehenden Hausprofil. Die aktuelle Silberküste-Seite und der
  Ortsdatensatz belegen **Ard Iasgleann** als früheren Herrschaftsort. Er wird im
  Hausprofil historisch bezeichnet, ohne den Stammbaumregisterpfad zu ändern.
  Eine heutige Lehensbindung zu den Neidr wird nicht erfunden.
- Der Name folgt der vorhandenen Akte **Tir An Muirghin**; Titel wie „Clan ...“
  und andere leere Infotabellenfelder sind Platzhalter und werden nicht ergänzt.
- Die neue Quelle enthält in den leeren Oberhaupt- und Erbfolgefeldern zweimal
  ausdrücklich die vertikal gesetzten Buchstaben **AUSGESTORBEN** (Original ab
  Zeile 298 und ab Zeile 340). Diese Alttabellenangabe wird aufgrund des vom Nutzer
  bestimmten Vorrangs des aktuellen Kanons **nicht** als pauschaler Status
  übernommen. `Kontinente/docs/silberinsel/README.md` legt den Verzicht auf einen
  solchen Aussterbestatus fest. Die aktuelle Ortsquelle beschreibt überdies
  ausdrücklich das Fortleben über einen an die Sonnenküste geflüchteten
  Kadettenzweig. Verlust der alten Inselherrschaft und nahezu vollständige
  Vernichtung werden deshalb vom überlebenden Familienerbe getrennt. Die
  vorhandenen genealogischen Platzhalter werden nicht umgeschrieben.
- Die leeren Hauskapitel werden nicht durch erfundene Clanereignisse gefüllt.
  Für die ausgefüllte Geschichte wurden die bereits vorhandenen Texte in
  `Kontinente/Estryll/Königreich Cenyr/Grafschaft Silberinsel/grafschaft.data.mjs`
  herangezogen: alte Inselherrschaft, blühende Hafenstädte, Seefahrt, Bergbau,
  Handwerk, Norrnaigh-Invasion und späterer Übergang an die Neidr.
  `Karten/Cenyr/silberinsel/places.source.json` ergänzt Ard Iasgleann und die
  überlieferte Verbindung des geflüchteten Kadettenzweigs mit Haus Blach. Der
  Erzählstatus „Es wird erzählt“ bleibt für Blachs Ursprung gewahrt; es wird
  keine neue gesicherte Abstammung oder Ehe in einem Stammbaum angelegt.
- **Gawan Neidr** und **Mallaidh Muirghin** sind bereits in der Neidr-Akte belegt.
  Sie werden nur in der historischen Einordnung genannt und über die bestehende
  Neidr-Akte erreichbar gemacht, nicht in die vorbereitete Tir-Akte kopiert.
- Der ausführliche Tiarnatum-Text beschreibt allgemeine frühere Crannath-Kultur.
  Er wird als solcher kenntlich gemacht. Daraus entstehen keine zusätzlichen
  eigenen Schlachten, Helden, militärischen Werte oder individuellen Fähigkeiten.
- Sämtliche Militärstatistiken und leeren Aufgebotsfelder werden ignoriert.
  Die gemeinsame Militär-Profilgruppe ist ausgeblendet. Der Unterschied zwischen
  altem Tiarnatum, Norrnaigh-Kriegführung und späterem Rittertum bleibt als
  historischer Kontext erhalten.
- **Alter Pantheon** ist als frühere Religion genannt. Einzelne Gottheiten
  werden nicht erfunden; die spätere alerische Kirchenzugehörigkeit der Insel
  wird nicht rückwirkend auf den antiken Clan übertragen.
- Avallornier und Norrnaigh werden entsprechend der Quelle als **historische**
  Freunde und Feinde beschrieben. Daraus werden keine heutigen politischen
  Allianzen oder Fehden abgeleitet.
- Die zwanzig leeren modernen Hofämter, anonymen Portraitvorlagen und leeren
  Figurentabellen belegen keine historische Besetzung. Es werden deshalb keine
  Personen- oder Amtskarten aus ihnen angelegt. Das zentrale Hofmodul bleibt
  für spätere belegte Ergänzungen verfügbar.
- Das gelieferte Kriegerbild `7W8wlDc.png` wurde unverändert heruntergeladen und
  tatsächlich angesehen. Es zeigt einen historischen Tiarna mit Speer,
  grünblauem Mantel und Fischschild. Das Original wird direkt verwendet.
  Ein separates Herrschaftsbanner wurde nicht geliefert; die geografische
  Rückverknüpfung verwendet das vorhandene Silberinsel-Symbol. Das Wappen
  stammt ebenfalls aus der bestehenden lokalen Registerdatei.

Die bestehende vorbereitete Akte hat keine `extensions.sourceRevision`;
`biographySourceRevision: 1` ist deshalb der erste Bio-Quellstand. Der globale
Hausseitenbuild bleibt Aufgabe des Hauptagenten.
