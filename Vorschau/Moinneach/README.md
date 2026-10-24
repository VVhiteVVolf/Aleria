# Moinneach: Vorschau für Patrick

Drei Gebietsaufteilungen mit den gelieferten Karten- und Wappenbildern, elf Clans
und zehn Städten: die ursprünglichen zehn Gebiete, Alternative I mit drei und
Alternative II mit fünf Gebieten. Die Clans behalten in allen Varianten ihre
ausdrücklich angegebenen Städte. Gebietsgruppen folgen den Kartenfarben,
ohne daraus neue Lehnsbeziehungen abzuleiten.
Ränge und Lehnsherren werden nicht aus Farben oder Stadtgröße abgeleitet.
Die Dreieraufteilung erhält zuerst drei, die Fünferaufteilung fünf Namens- und
Bannerentwürfe. Jedes der zehn Einzelgebiete bekommt ebenfalls ein Banner:
acht bestehende Motive werden wiederverwendet, nur der Damona-Drachenkopf für
Drunemax und der Brigantex-Reiter für Taranux kommen ergänzend hinzu.
Die Einzelgebiete behalten ihre bisherigen Stadtbezeichnungen.
Es werden keine kanonischen Welt-, Karten- oder Familienakten geändert.

`index.html` ist der Einstieg. Der Bearbeitungsmodus lässt Clan-Sitze und Notizen
je Variante unabhängig ändern; Neuladen verwirft sie. Zurücksetzen betrifft nur
die aktive Variante. Die Originalvorgaben stehen
in `proposal-data.mjs`, der gekapselte Arbeitszustand in `proposal-state.mjs`.

Kartenwappen, Verbindungslinien, Tastatur-/Hover-Details und Zoom verwenden dieselbe
Komponente wie Uathneach: `../shared/clan-map.mjs` und `clan-map.css`.

Alle Bilder wurden aus dem gelieferten Downloadordner unverändert kopiert.
`assets.source.json` dokumentiert die Originaldateinamen und SHA-256-Werte.
Der Clan heißt nach ausdrücklicher Nutzerkorrektur **Adruinna**. Die abweichende
Schreibweise der Quelldatei wird ausschließlich dort dokumentiert.
Amabactoix folgt der Nutzerliste; die Karte beschriftet denselben Ort „Ambactiox“.

Die ursprüngliche Datei `Moinneach.png` enthält tatsächlich WebP-Daten. Ihre
Kopie heißt daher `map.webp`; die Bildbytes wurden nicht umgewandelt.

Die Entwürfe stehen in `regional-designs.mjs`, einschließlich Bedeutung,
freiem deutschem Beinamen, Landschaftsbezug, betrachteten Clanmotiven und
Teanglann-Verweis zur jeweiligen irischen Wortform. Moinneachs Sumpf-,
Mangroven- und Pilzlandschaft folgt dem ausdrücklich ergänzten Nutzerkontext.
Die Startansicht zeigt die Dreieraufteilung.

Die zehn quadratischen RGBA-Banner unter `assets/*-banner-tribal.png` wurden mit
dem eingebauten Bildgenerierungswerkzeug erstellt. Nach Nutzerkorrektur verwenden
alle die zweite Stilfassung: grobe flache Pigmentzeichen auf abgenutztem,
repariertem und ausgefranstem Tuch an einfachen Aststangen. Die vorherige
Goldrahmen-Fassung wird nicht eingebunden. `banner-art.json` enthält sämtliche
finalen Prompts, Generator-Kennzeichnung, Originalausgaben und SHA-256-Werte.
Die PNGs wurden unverändert übernommen. Details und Großansichten gehören dem
lokalen `region-dialog.mjs`; die Stile sind in `regional-designs.css` gekapselt.
`individualBanners` ordnet der ersten Aufteilung alle zehn unterschiedlichen
Bilddateien zu. Ihre Einträge sind ausdrücklich `banner-only`; die alternativen
Tir-na-Namen werden dadurch nicht zu Namen der einzelnen Stadtgebiete.
