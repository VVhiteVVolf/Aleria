# Dunfal – Übertragung vom 22. Oktober 2026

Einstieg: `/Karten/karte.html?map=dunfal`. Das gelieferte Bild aus
`Downloads/Dunfal/Dunfal.png` wurde mit unveränderten 4063 × 4097 Pixeln
verlustfrei nach `Kartenbilder/normal.webp` übernommen.

## Quellen und Koordinaten

Die World-Anvil-Karte `c5c35f56-f5e0-4a85-b5cb-0fd5f19a00e2` wurde ausschließlich
lesend über die Chrome-Erweiterung ausgewertet. Markierungsliste, alle 150
Bearbeitungsformulare und die sichtbare SVG-Geometrie liegen vollständig in
`sources/world-anvil.capture.json` vor. Die drei gelieferten HTML-Artikel bleiben
unverändert archiviert; Artikel- und Bildermanifest enthalten SHA-256-Prüfsummen.

| Umfang | Anzahl |
| --- | ---: |
| Ortsmarker | 133 |
| Grenz-/Flächenobjekte | 17 |
| Vollständige Ortsbeschreibungen | 23 |
| Aus der vorhandenen Textüberschrift wiederhergestellte Markernamen | 9 |
| Vorbereitete Herrschaftsseiten einschließlich Fürstentum | 13 |

Jede der 150 World-Anvil-Marker-IDs bleibt genau einmal als Quellenkennung
erhalten. Punktkoordinaten stammen aus der Liste und den Geo-Feldern der
Bearbeitungsansichten. Umrechnung vom pixelbasierten Ursprung links unten:
`x = Quell-X / 4063`, `y = 1 - Quell-Y / 4097`. Die Punkte wurden nicht verschoben.
Alle 23 vorhandenen Beschreibungstexte sind vollständig übernommen; BBCode wird
in die vorhandene Textdarstellung übersetzt. Fehlende Texte bleiben leer.

Grenzen werden aus der sichtbaren SVG-ViewBox relativ zur Bildposition und
Bildgröße umgerechnet. Die Geometrie entspricht der gerenderten Vorlage; die
ursprünglichen, ungerundeten Polygonkoordinaten sind daraus nicht abzuleiten.
Verzweigte Herrschaftslinien bleiben offene Netze und werden nicht zu künstlich
geschlossenen Flächen ergänzt. Alle 17 Objekte sind im Regionswerkzeug editierbar.

## Zugehörigkeit und offene Angaben

Benannte Sitze und kanonische Familienakten bestimmen belegte Zuordnungen.
Weitere Orte wurden nach geschlossenen Kartenflächen beziehungsweise als
geografische Ableitung anhand der farbigen Herrschaftsnetze zugeordnet. Der
Netzabgleich verwendet höchstens 100 Quellbildpixel Abstand. Diese Ableitung ist
keine zusätzliche historische Quelle; Abstand und Entscheidungsgrund jedes
Markers sind in `sources/assignment-review.json` nachvollziehbar.

Die Bereiche I, II und III bleiben nach Nutzerentscheidung ohne genaue
Zuordnung zu Anbhair, Casur oder Aonghusa. Es gibt dafür keine erfundenen
nummerierten Herrschaftsseiten. Die drei bekannten Clan-Seiten sind vorbereitet,
aber ohne daraus abgeleitete Ortslisten. Fünf örtliche Ordensbereiche bleiben
eigene Kartenobjekte; daraus werden keine zusätzlichen Clans geschaffen.
Gildenbetreiber werden getrennt von politischer Zugehörigkeit geführt.

Ortskategorien und Symbole nutzen die vorhandenen Aleria-Vorlagen. Veraltete
oder leere World-Anvil-Icons wurden anhand der Kartenzeichen und Texte ersetzt;
die alten Symbole bleiben im Quellenarchiv. Standard: Dot 80, Schrift 50.

## Seiten und Portraits

Die Hauptseite verlinkt die zwei Oberherrschaften. Tir na Rithe führt seine vier
untergeordneten Clan-Herrschaften, Tir na Fathach seine fünf und die Fianna.
Nach Nutzerkorrektur zeigt die Hauptseite außerdem alle zwölf Clans und die
Sept Ferbend, nach Oberherrschaften gegliedert. Regionsbanner und Clanwappen
stehen getrennt in den Herrschaftsverweisen; Ortsregister bleiben verschachtelt.
Die 13 Seiten verwenden die gemeinsamen Renderer. Beschreibungstexte der
Herrschaften bleiben auf Nutzerwunsch leer. Die drei vorhandenen Ratslisten
umfassen zusammen 33 Amtsbesetzungen; alte fremde Überschriften wurden korrigiert.

Tadgs neues, tatsächlich angesehenes Quellporträt wird auf den Ratskarten und in
beiden betroffenen Familienakten für dieselbe bestehende Person verwendet.
Identität, Verwandtschaften und Personen-IDs bleiben erhalten. Die fünf übrigen
erreichbaren Ratsbilder sind lokal archiviert. Hearn Nuadats nicht erreichbares
Bild bleibt gemäß Nutzerantwort beim neutralen Platzhalter; kein Ersatz gesucht.

## Schutz und Prüfung

Die Builder verwenden den bestehenden gemeinsamen Importweg. Der geteilte
Ausgabehelfer schützt bereits manuell bearbeitete Kartendaten anhand des
generierten State-Hashes. Kartenentwürfe im Browser bleiben separat erhalten.
Die 38 vorher vorhandenen Kartendateien werden zusätzlich mit dem vor Beginn
gesicherten SHA-256-Bestand verglichen.

Prüfungen: `node Karten/tools/build-dunfal.mjs --check`,
`node Kontinente/scripts/build-dunfal.mjs --check` sowie die zugehörigen Karten-,
Seiten- und Familienprüfungen. Browserbelege stehen unter
`diagnostics/dunfal-2026-10-22/`. Kein Push, kein Deployment.

Nachbesserung am selben Tag: Die Hauptseite listet alle zwölf Clans und die Sept
Ferbend. Auch die 28 Orte in den drei noch nicht zugewiesenen Grenzbereichen
sind jetzt im Register von Tir na Fathach erreichbar, ohne ihre Clanzuteilung
vorwegzunehmen. Alle 133 Ortsmarker sind über die Seiten verlinkt. Banner und
Clanwappen werden in Herrschaftsverweisen getrennt dargestellt. Weitere Belege:
`diagnostics/territory-heraldry-2026-10-22/`.
