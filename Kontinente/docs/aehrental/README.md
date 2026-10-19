# Ährental: Übernahme vom 19. Oktober 2026

Sechs unveränderte HTML-Quellen, 65 Ortsausschnitte und drei Koordinatenlisten
sind mit SHA-256-Belegen archiviert. Die drei Kartenebenen liegen mit
4096 × 2690 Pixeln verlustfrei als WebP vor; `Karten/Cenyr/aehrental/images.source.json`
dokumentiert die Originaldateien. Die Seitentexte bleiben vollständig erhalten.

## Gemeinsame Daten

`Karten/Cenyr/aehrental/markers.source.json`, `places.source.json` und
`territories.source.json` versorgen Karten und Ortsregister gemeinsam.
61 Marker stammen aus den Koordinatenlisten; die Y-Achse wird vom Ursprung
links unten umgerechnet. Eine weitere Burg bleibt ausschließlich im Register.
`node Karten/tools/import-aehrental.mjs` prüft den fertigen Snapshot.
`--write` ist nur für einen unberührten Snapshot mit Revision 0 erlaubt.

Grafschaft, Marchog, Morcanhuc, Graue Bucht, Eberkamm und Flusstal nutzen die
bestehenden gemeinsamen Seiten-, Rats- und Registerkomponenten. Die zwölf
Hausakten wurden einschließlich der historischen Clans abgeglichen. Unbelegte
Clanränge bleiben „Offen“. Hauswappen und Gebietszeichen bleiben getrennt;
die zwei fehlenden Herrschaftsbanner sind anhand der Original-URLs archiviert.

## Bestätigte Zuordnungen und bereinigte Altfehler

- Bragdyddolwyn und Trefbrewyn sind laut Nutzerbestätigung gepachtete Exklaven
  der Teyrngarch. Sie tragen deren Banner und Hauswappen, auch in der
  Flusstal-Übersicht; der Gebietslink führt zur bestehenden Teyrngarch-Seite.
- Abaty Dinasbryn gehört laut eigener Beschreibung zum Flusstal, obwohl die
  farbige Karte den Ort an einer Marchog-Verbindung markiert.
- Arllwyn bleibt gemäß Ortsbeschreibung und Herrschaftsliste bei Marchog.
- Flusstals Hauptstadt ist Aldwynd; die alte Infobox hatte irrtümlich Eirwyn
  von der Eberkamm-Vorlage übernommen.
- Ciaróg ist gemäß Hausakte und Grafschaftsübersicht ein Ritterfürstenhaus.
  Die kopierten „Baron“-Beschriftungen seines Rats wurden angeglichen.
- „Gragwen“ aus der Koordinatenliste ist der als Graigwen beschriebene Ort.
  Beide Schreibweisen sind in den Markerdaten nachvollziehbar.
- Castell Gwarchod ist die heutige Burg Morcanhuc; beide Namen bleiben erhalten.
- Die beiden Tynar-Texte widersprechen sich bei ihrer ursprünglichen Überschrift:
  Ausschnitt 29 heißt Morydd, beschreibt jedoch Tynar. Er bleibt unverändert im
  Archiv und wird keinem Ort als Beschreibung untergeschoben. Tynar verwendet
  den korrekt überschriebenen Ausschnitt 31. Für Morydd wurde auf ausdrücklichen
  Nutzerwunsch eine neue Beschreibung anhand des Bauernsiedlungs-Icons erstellt;
  ihre Herkunft ist in `places.source.json` vermerkt.
- Wiederholte Ausschnitte von Dun Clachráth, Penwyd, Cynarwen, Glynwedd und
  Penwyll bleiben archiviert, erzeugen aber keine doppelten Orte.

## Noch fehlende Angaben

- **Eirwyn:** Marker und Hauszuordnung vorhanden, eigene Ortsbeschreibung fehlt.
- **Castell Chiffyddlon / Burg Marchog:** In den Herrschaftslisten vorhanden;
  eigene Beschreibung und eindeutige Markerkoordinate fehlen. Keine Position
  aus dem Kartenbild geschätzt.
- Die acht nicht namentlich besetzten Ratsämter mehrerer Herrschaften bleiben
  mit ihren vorhandenen Rollen und lokalen Silhouetten sichtbar. Leere
  Tabellenfüllzellen und unbenannte Vasallen werden nicht als Personen erfunden.

Die historischen Clans sind Erinnerungs- und Familienakten; ihre Wappen
ersetzen nicht die heutigen Lehnsherren der Ruinenorte. Die Wildhauer werden
als eigene Fraktion geführt, ohne aus einer territorialen Zuordnung eine
Gefolgschaft zum Haus Grawn abzuleiten.

## Prüfung

159 ursprüngliche Textabsätze einschließlich der vier Kultur-Unterabschnitte
wurden mit den archivierten HTML-Quellen verglichen. Alle drei WebP-Karten
sind pixelgleich mit ihren PNG-Originalen. 39 gezielte Prüfungen für Ährental,
Sonnenküste, Vortigerns Ruh, Verwaltungsgrenzen, Kategorien, Vorlagen,
Mediathek und Kartengrößen bestehen. Die zwölf Ährental-/Sonnenküsten-Seiten
wurden im Browser bei 1440, 1024, 768 und 390 Pixeln geprüft, einschließlich
lokaler Bilder, Beschreibungen, Verwaltungsfenster und aller Kartenebenen.

Neue regionale Prüfungen: `Kontinente/tests/aehrental.test.mjs` und
`Kontinente/tests/aehrental.browser.mjs`. Der Browserablauf wird mit der
Sonnenküste unter `tests/support/reviewed-territory.browser.mjs` geteilt.
