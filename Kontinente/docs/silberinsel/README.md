# Silberinsel – lokale Übernahme vom 19. Oktober 2026

**Ausschließlich lokal vorbereitet. Kein Commit, Push oder Deployment.**

Die sechs gelieferten HTML-Dokumente, alle 34 Ortsausschnitte und die
Koordinatenliste bleiben unverändert mit SHA-256-Belegen in `sources/`,
`places/` und `coordinates/` archiviert. Die drei Kartenebenen wurden
verlustfrei mit jeweils 4096 × 3463 Pixeln übernommen.

## Seiten und gemeinsame Daten

Grafschaft Silberinsel – Ynys Arian, Saith, Crefyddol, Canwyll, Silberpfad
und Silberküste verwenden die bestehenden Seiten-, Rats-, Haus- und
Ortsregisterkomponenten. Die Ortsregister sind nach Ortsart gegliedert und
zeigen vollständige Beschreibungen aufklappbar.

`Karten/Cenyr/silberinsel/{markers,places,territories}.source.json` ist die
gemeinsame Quelle für Karte und Seiten. 32 Marker behalten die gelieferten
Koordinaten mit Ursprung links unten. 29 Beschreibungen werden geteilt;
vier zusätzliche Höhlen stehen ohne erfundene Position nur im Register.
`node Karten/tools/import-silberinsel.mjs` prüft den Snapshot. Der schreibende
Import verweigert das Überschreiben eines bereits bearbeiteten Kartenstands.

Alle 18 Hausakten wurden abgeglichen: sechs große Häuser, zehn örtliche
Ritterhäuser, Brithfaen und Tir An Muirghin. Auf den einzelnen Herrschaften
stehen nur deren eigene belegte Häuser. Silberküste führt Tir An Muirghin
zusätzlich als antiken Clan von Ard Iasgleann. Der historische Clan erhält
keinen unbelegten pauschalen Aussterbestatus. Pyrth bleibt Ritterfürstenhaus.
Wappen verlinken die vorhandenen Familienakten; ausführliche Hausseiten für
diese Häuser liegen derzeit nicht vor.

## Bereinigte Altlasten und Zuordnung

- Die kopierte Infoboxbezeichnung „Herrschaft Silberküste“ wird bei Saith,
  Crefyddol, Canwyll und Silberpfad durch den eigenen Namen ersetzt.
  Oberhäupter folgen den jeweiligen Ratsübersichten und Hausakten:
  Duny Saith, Kimball Crefyddol, Eiddyl Canwyll und Yspaddaden Pyrth.
- „Graf von Talgarth“ wird als Graf von Llanvane geführt. In der verrutschten
  Ritterfürstenzeile bleiben alle fünf genannten Personen erhalten; Yspaddaden
  wird Caer Clwyd und die übrigen Llanvane zugeordnet. Crefyddoll wird in
  strukturierten Namensangaben auf die bestehende Projektform Crefyddol
  normalisiert. Die 119 ursprünglichen Erzählabsätze bleiben unverändert.
- **Abtei St. Sieffre / Côr Llanberwyn:** Der Abgleich der Originalkarte bei
  1977:1248 zeigt die Abtei westlich der roten Silberpfad-Grenze in Silberbucht.
  Territorial gehört sie daher zu Neidr. Die Abtei bleibt als eigener
  geistlicher Träger benannt; die Pilgerstätte verwendet ihr Originalsymbol.
- **Ath Eryndor:** Festungsruine und Unterwasserruine bleiben zwei getrennte
  Marker mit verschiedenen Beschreibungen und Symbolen. Die territoriale
  Einordnung folgt Silberküste/Tiwna. Bei der Festungsruine wird die ausdrücklich
  genannte Verwaltung durch die Magierorganisation von Cenyr separat bewahrt;
  der Achatorden bleibt die ehemalige Zugehörigkeit.
- **Ard Iasgleann:** Die Schreibweise folgt Beschreibung und Koordinatenliste.
  Das ehemalige Herrscherhaus Tir An Muirghin steht zusätzlich im Ortsdatensatz.
- Saith, Crefyddol und Canwyll erhalten ihre eigenen drei Banner aus den
  Original-URLs im Grafschaftscode. Diese wurden lokal unter
  `Stammbäume/assets/images/regions/Cenyr/Silberinsel/` archiviert, einschließlich
  Herkunft und Prüfsumme. Die vorhandenen Hauswappen bleiben davon getrennt.
- Das Falka-Porträt des gelieferten Politikcodes ist ebenfalls lokal archiviert.
  Die vorhandene Genealogie und ihre Portraits werden dadurch nicht verändert.
- Offene Ämter bleiben mit lokalen Silhouetten sichtbar. Leere Platzhalterzeilen
  und kopierte fremde Bilder erhalten keine sichtbaren Ersatzinhalte.

## Wiederholungen und fehlende Angaben

Fünf vollständige Wiederholungen werden jeweils nur einmal als Beschreibung
geführt: Bodcarreg (5/7), Abtei St. Sieffre (14/17), Côr Glynfawr (23/25),
Rosaber (24/27) und Nantbod (26/28). Alle Originalausschnitte bleiben erhalten.
OCR-Korrekturen betreffen nur die Übertragung, etwa Côr und St. Sieffre.

Eigene Ortsbeschreibungen fehlen für **Llanvane, Eiddon und Caer Clwyd**.
Die erwähnten Höhlen **Silberstollen, Schattenklammhöhle, Donnerfallhöhle
und Eisenschlucht** haben weder einen eigenen Ortsausschnitt noch Koordinaten.
Silberstollen, Schattenklamm und Donnerfall stehen gemäß eigener Baronieseite
bei Silberküste; Eisenschlucht bleibt bei der gräfischen Silberbucht.

Zwei widersprüchliche Ortsangaben in den ursprünglichen Erzähltexten bleiben
dokumentiert und unverändert: Silberpfads Übersicht nennt Cerneu, während
Geschichte und Karte Llanvane nennen; der Glynfawr-Ausschnitt nennt die
Westküste, sein gelieferter Marker liegt im Osten innerhalb Silberküste.
Es werden keine neuen Erzähltexte oder Koordinaten ergänzt.

## Prüfung

- 119 ursprüngliche Erzählabsätze stimmen mit den HTML-Quellen überein.
- Alle drei WebP-Karten sind pixelgleich mit den gelieferten PNGs.
- 52 gezielte Prüfungen einschließlich der vorherigen Grafschaften,
  Verwaltungsgrenzen, Kartenvorlagen, Mediathek und Größenmigration bestehen.
- `tests/silberinsel.browser.mjs` prüft alle sechs Seiten bei 1440, 1024, 768
  und 390 Pixeln: lokale Bilder, Hausauswahl, gleich hohe Karten, aufklappbare
  Beschreibungen, Verwaltungsabgrenzung und alle drei Kartenebenen mit den
  gemeinsamen Standardgrößen Dot 80 / Schrift 50.
