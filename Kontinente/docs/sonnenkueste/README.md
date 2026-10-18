# Sonnenküste: Übernahme vom 19. Oktober 2026

Die sechs gelieferten HTML-Dokumente sind unverändert unter `sources/` archiviert.
`sources.json` dokumentiert ihre SHA-256-Prüfsummen. Die veröffentlichten Seiten
verwenden strukturierte Daten und die gemeinsamen Haus-, Orts-, Rats-, Infobox-
und Verwaltungskomponenten. Alle 108 erzählenden Absätze bleiben textgleich erhalten.
Kopierte Leerzeilen, Musterkarten und unbenannte Vasallen werden nicht als fertige
Einträge ausgegeben; bekannte Ämter ohne Amtsträger behalten ihre Silhouetten.

## Seiten und Häuser

- Grafschaft Sonnenküste – Cwm yr Lleuad: sechs große Häuser, zwölf örtliche
  Ritterhäuser, fünf Bürgerhäuser und das historische Haus Nic Ríordáin.
- Baronie Jungferntal: Morforwyn sowie Rhelian und Aelryn. Deren belegter Lehnsherr
  Illewod bleibt erhalten; die beiden Häuser werden nicht auf die Grafschaft gezogen.
- Herrschaft Löwenberg: Illwath und das historische Haus Nic Ríordáin.
- Herrschaften Llwynog, Blach und Teyrngarch: jeweils ihr eigenes herrschendes Haus.

Auswahl, Ränge, Sitze und Lehnsherren stammen aus
`Stammbäume/assets/js/data/sonnenkueste-house-profiles.js` und den zugehörigen
Familienakten. Gallochfaen wird über den belegten Zweitsitz Gallchofaen dem Haus
Grianlaoch zugeordnet; die Herkunft seiner Siedler aus dem Clan Gallchobhair wird
nicht mit dem heutigen Ritterhaus gleichgesetzt. Die genealogischen Akten bleiben
unverändert.

Die Sonnenküste hat ihren eigenen Grafenrat. Die Sonderregel des gemeinsamen
Königsrats von Cenyr und Vortigerns Ruh wird nicht übertragen. Personenportraits
werden anhand identischer Quell-URLs aus vorhandenen lokalen Archiven geladen.
Die Verwaltung hat acht gemeinsame Bereiche; fremde Verwaltungsdokumente werden
nicht übernommen.

Die Llwynog-Infobox enthielt den kopierten Namen „Herrschaft der Blach“;
die Geographietabellen von Llwynog und Blach nannten Cerrigarth. Namen und
Verwaltungssitz wurden mit ihren eigenen Ratsangaben und Familienakten abgeglichen.
Die in einer alten Hausliste vertauschten Sitze der Morforwyn und Illwath werden
korrekt als Carngol beziehungsweise Caer Llew dargestellt.

## Karten, Orte und Heraldik

Die bestehende Karten-ID `cenyr-sonnenkueste` und ihr Datenpfad bleiben erhalten.
Alle drei nachgereichten Kartenbilder haben 4096 × 4049 Pixel und liegen als
pixelidentische verlustfreie WebP-Dateien vor. Ihre Herkunft und Originalprüfsummen
stehen in `Karten/Cenyr/sonnenkueste/images.source.json`.

Die drei Koordinatenlisten sind unter `coordinates/` archiviert. Alle 68 Marker
verwenden die untere linke Ecke als Ursprung: `x / 4096`, `1 - y / 4049`.
Die drei Ahnenbäume und die beiden unterschiedlichen Orte namens Ffynbraich haben
eigene IDs. Der Nutzer hat den zuvor unbenannten Marker **1314:846 als Bragwaul**
bestätigt. Hornkluft und die Poststation bleiben ohne erfundene Koordinaten im
Ortsregister; dort stehen insgesamt 70 unterschiedliche Orte.

Die 60 Ortsausschnitte unter `places/` ergeben 56 unterschiedliche Beschreibungen.
Bragwynfa, Llyswyth, Bronmellyn und Glasdrann liegen doppelt vor. Beide Ffynbraich-
Texte bleiben dagegen eigenständig. Karte und Seiten beziehen ihre Texte aus
demselben regionalen Katalog. Erkennungsfehler der Transkription wurden anhand der
Bildausschnitte berichtigt; die Originale sind über ihre SHA-256-Werte nachprüfbar.

Der Nutzer hat ausdrücklich bestätigt: **Die vier Brauereistandorte Braglydd,
Bragwynfa, Bragmellyn und Bragwaul sind Exklaven der Teyrngarch.** Sie behalten
Hauswappen und Herrschaftsbanner der Teyrngarch, obwohl sie außerhalb des gelben
Verbunds auf der Regionskarte liegen. Die Register führen sie in einer eigenen
Exklaven-Sektion. Die Marker dokumentieren Gebietsform, Lage und Bestätigung.
Bei den übrigen Betrieben werden örtlicher Gebietsherr und Betreiber getrennt
geführt, etwa Illewod / Teyrngarch bei der Taverne Zur Goldhaube.

Runde Hauswappen und territoriale Banner sind getrennte Quellen. Die drei bisher
nicht lokal vorhandenen Herrschaftsbanner wurden aus den exakten Altcode-URLs
archiviert. Ihre Prüfsummen stehen in `territories.source.json`. Ortsarten und
Tabellen verwenden den gemeinsamen Kategorienkatalog; Nythlyn ergänzt die belegte
Flusssiedlung samt Originalsymbol. Die gemeinsame Kategorienmigration erhält
vorhandene eigene Kategorien und Bearbeitungen.

Schreibvarianten Castell Gwealon/Gwaelon, Twr Garthyn/Tŵr Garthryn und
Gallochfean/Gallochfaen sind mit Koordinaten und Beschreibungen abgeglichen.
Die Taverne Zur Goldhaube heißt im Beschreibungstext Zur Goldstube; beide Angaben
bleiben sichtbar. Der Marker „Brothel“ gehört zum beschriebenen Goldenen Kuss.

## Zuständigkeiten und Prüfung

`Karten/modules/territory-places/place-catalog.mjs` verbindet regionale Ortsdaten,
Texte und Heraldik. `Kontinente/modules/territory-page/territory-data.mjs` übernimmt
die gemeinsame Datenform; jede Region bestimmt weiterhin ihre Häuser und Räte.
Vortigerns Ruh verwendet dieselben kleinen Funktionen ohne inhaltliche Änderungen.

`node Karten/tools/import-sonnenkueste.mjs` prüft den Snapshot gegen die Quellen.
Der einmalige `--write`-Modus akzeptiert ausschließlich Revision 0 ohne Marker.
Er überschreibt keine später bearbeitete Karte und keine Online-Bearbeitung.
Die bestehenden Kartenvorgaben bleiben global **Dot 80 / Schrift 50**.

Prüfungen: Quellenprüfsummen, Textgleichheit aller 108 Absätze, Pixelgleichheit der
drei Kartenebenen, 68 Koordinaten, 56 gemeinsame Beschreibungen, 70 Registerorte,
Hausauswahl und Bannerziele. Browserprüfung aller sechs Seiten bei 1440, 1024, 768
und 390 Pixeln: lokale Bilder, gleiche Hauskartenhöhen, keine Seitenüberbreite,
aufklappbare Beschreibungen, Verwaltungszuordnung und drei Kartenebenen. Tests:
`Kontinente/tests/sonnenkueste.test.mjs` und `sonnenkueste.browser.mjs`, ergänzt um
die vorhandenen Vortigerns-, Kategorien-, Tabellen- und Anzeigevorgaben-Prüfungen.
