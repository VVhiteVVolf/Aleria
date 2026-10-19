# Weidebucht – lokale Übernahme vom 19. Oktober 2026

**Auf ausdrücklichen Nutzerwunsch ausschließlich lokal vorbereitet. Kein Push
und kein Deployment.**

Die sechs gelieferten HTML-Dokumente, alle 87 Ortsausschnitte und die drei
Koordinatenlisten sind unverändert mit SHA-256-Belegen archiviert. Die drei
Kartenebenen werden verlustfrei mit 4096 × 3500 Pixeln übernommen.
Die Originalbelege stehen in `sources/`, `places/` und `coordinates/`.

## Daten und Darstellung

Die gemeinsame Quelle für Karte und Seiten liegt in
`Karten/Cenyr/weidebucht/{markers,places,territories}.source.json`.
81 eindeutige Marker erhalten die geprüften Koordinaten, 76 davon die
vorhandenen Ortsbeschreibungen. Der Import rechnet den Ursprung links unten
um und verweigert das Überschreiben eines bereits bearbeiteten Snapshots:
`node Karten/tools/import-weidebucht.mjs` prüft den lokalen Stand.

Grafschaft, Borkenstein, Hochweide, Dunstholm, Mochdaer und Dinefwr nutzen die
bestehenden gemeinsamen Seiten-, Rats- und Ortsregisterkomponenten. Alle
20 vorhandenen Hausakten wurden abgeglichen. Historische Clanränge bleiben
Laird beziehungsweise Mor Tiarna. Wappen führen zur vorhandenen Familienakte;
zu diesen Häusern existiert derzeit keine ausführliche Hausseite.

## Sonderfälle und Quellenabgleich

- **Erims Hof:** Dinefwr und Tir Addawol teilen laut Beschreibung Verwaltung
  und Erträge. Die Daten führen beide Häuser mit eigenen Wappen, Bannern und
  Links als `coRulers`; kein einzelnes Haus wird als Alleinherrscher dargestellt.
  Der Ort steht zusätzlich auf beiden zuständigen Herrschaftsseiten.
  Die im Altregister überlieferte Einordnung als Kultstätte bleibt erhalten.
- **Teyrngarch:** Bragfonnor und Gwellbrwyd sind gebietsübergreifend gepachtete
  Exklaven gemäß der vorangegangenen Nutzerklärung. Die Grüne Laterne führt
  Teyrngarch als Betreiber; daraus wird keine zusätzliche Gebietsexklave abgeleitet.
- **Maesgorn:** Zwei verschiedene Orte bei 1952:883 (Mochdaer) und 3067:1136
  (Borkenstein), mit unterschiedlichen Beschreibungen und eigenen IDs.
- **Coedgwell / Tirfonwll:** Überschriften der Ausschnitte 69 und 70 vertauscht;
  die beiden unveränderten Beschreibungstexte werden nach ihrem Inhalt zugeordnet.
- **Ruinen:** Die beiden unbenannten Marker sind über die Beschreibungen und
  Regionskarte Bhiorach (3269:3163) und Talamhard (3304:1449) zugeordnet.
  Gorwynd und Llangedarn verwenden die überlieferten Ruinensymbole.
- **Tavernen:** Der nördliche Marker 2060:1867 ist die Schwarze Eiche zwischen
  Cerrigarth und Erims Hof; der südliche 2527:756 ist die Grüne Laterne.
- **Asyn:** Die Grafschaftsvorlage nennt das Haus ausgestorben. Die ausgearbeitete
  Hausakte belegt überlebende Nachkommen bis 1740. Es erscheint deshalb unter
  „Ehemalige Herrscherhäuser“, auch auf der Mochdaer-Seite; keine Lebensdaten
  oder historischen Aussagen der Texte werden verändert.
- **Ratsübersicht:** Der kopierte Titel „Graf von Talgarth“ wird für die
  Weidebucht zu „Graf von Cerrigarth“. Die verrutschten Baronssitze werden mit
  den drei eigenen Baronieseiten und Hausakten abgeglichen. Unbenannte
  Ritterfürsten bleiben Rollen mit Silhouette und erhalten keine fremden Portraits.
- **Dinefwr-Infobox:** Das allein dort genannte Penbryn widerspricht eigener
  Geographie und Hausakte. Der Verwaltungssitz wird als Cerrigarth geführt.
- Die kanonischen Schreibweisen Dinefwr und Mochdaer gelten in strukturierten
  Personen-/Hausangaben. Die ursprünglichen Erzähltexte bleiben unverändert.

## Doppelte oder unvollständige Screenshots

Sieben vollständige Wiederholungen: Fonwellyn (41), Côr Ffynnon (50), Poradlyn
(74, 84, 87), Carnwyd (78), Welltirydd (86). Alle Belege bleiben archiviert.
Die rechts abgeschnittenen Ausschnitte Tŵr Erwyth (44) und Fonadwyth (56)
werden durch die vollständigen Folgeausschnitte 45 und 57 abgedeckt.
Mynfonns Ausschnitte 47 und 48 enthalten ausschließlich Namen/Marker.

## Noch fehlende Ortsbeschreibungen

- Cerrigarth
- Esgairmor
- Glyndale
- Trefyddin
- Mynfonn

Diese fünf Orte sind mit Symbol, Koordinate und Herrschaft vorhanden. Es werden
keine Ersatztexte erfunden. Die Zuordnung der übrigen Ortsbeschreibungen ist
anhand der archivierten Belege nachvollziehbar.

## Lokale Prüfung

127 ursprüngliche Erzählabsätze stimmen mit den archivierten HTML-Quellen
überein. Alle drei WebP-Karten sind pixelgleich mit den gelieferten PNGs.
46 gezielte Prüfungen für Weidebucht, Ährental, Sonnenküste, Vortigerns Ruh,
Verwaltungsgrenzen, Kartenvorlagen, Mediathek und die Kartengrößen bestehen.

`tests/weidebucht.browser.mjs` prüft die sechs Seiten bei 1440, 1024, 768 und
390 Pixeln, lokale Bilder, Register, aufklappbare Beschreibungen und Kartenebenen.
`tests/weidebucht-joint-rulers.browser.mjs` prüft Erims Hof zusätzlich auf der
Grafschaft, Hochweide und Dinefwr sowie im Kartendialog, einschließlich beider
Hauswappen und Banner, Links, Umbrüchen und der unveränderten Einzelhausansicht.
