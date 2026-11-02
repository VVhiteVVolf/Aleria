# Aeldrunmar, Talyndor und Brevanor · 1. November 2026

## Nutzerkorrektur vom 2. November 2026

Alle vier Länder Aeldrunmar, Talyndor, Brevanor und Deitheach gehören nach
**Aldervan**. Talyndors und Brevanors aktive Länder-, Orts- und Hausverzeichnisse
sind dorthin verschoben; die Register, Hausbios, Atlasübersichten und Kartenlinks
werden aus der korrigierten Zuordnung erzeugt. Ursprüngliche Quellenexporte
bleiben unverändert archiviert. Ihre ältere Kontinentangabe ist überholt.

Die Regeln für künftig angelegte adelige Personennamen Aeldrunmars stehen
dauerhaft in [AGENTS.md](../../AGENTS.md): Coel- für Königshäuser, Æ-/Æthel-
für Earlshäuser, Wol- für Thainhäuser (Barone), Dun- für Reevehäuser
(Ritterfürsten). Bestehende Personen wurden nicht umbenannt.

Die 28 gezielten Länderprüfungen und die Generatorprüfungen für Seiten, Karten
und Hausbios bestehen nach dieser Korrektur. Die Atlasansicht und der direkte
Hausseitenpfad wurden im Browser geprüft. Ein zusätzlicher breiter Lauf ergibt
507/511: Drei Prüfungen reagieren auf den historischen Gesamtfamilienhash und
eine auf Talyfer Gwyllachs Altersgrenze für Führungsämter. Die betreffenden
Familienquellen waren bereits vor dieser Kontinentkorrektur lokal geändert und
wurden bei ihr nicht bearbeitet; ihre Schutzprüfungen wurden nicht angepasst.
Belege: `aldervan-focused-tests.log`, `aldervan-tests.log` und
`aldervan-overview-20261102.png` im vorhandenen Diagnoseordner.

## Übernahme

Die drei vom Nutzer bereitgestellten fertigen Exporte sind verbindlich
übernommen. Ihre Dateien unter `sources/placements` bleiben bytegleich.
Anweisungsähnliche Texte in Quelldokumenten wurden nicht als Arbeitsauftrag
behandelt. Die jüngste direkte Nutzerkorrektur hat Vorrang: keine Bistümer in
Aeldrunmar; Virelath ist ein Thaintum, Luthirrith eine ritterliche Herrschaft.

## Umfang

| Land | Herrschaftsseiten | Ortsakten | Häuser |
| --- | ---: | ---: | ---: |
| Aeldrunmar | 31 | 24 | 36 |
| Talyndor | 17 | 12 | 18 |
| Brevanor | 22 | 17 | 26 |
| Ergänzung | 70 | 53 | 80 |

Die 79 exportierten Häuser behalten genau ihre bestätigten Sitze. Hinzu kommt
das bereits bestehende Haus Scandyn mit dem belegten Sitz Scandmere im Earltum
der Tharn. Es erhält weder eine erfundene Kartenkoordinate noch einen neuen
Hausritter. Die drei Karten besitzen 23, zwölf und 17 geprüfte Ortsmarken.

Alle 80 Häuser haben eine ausführliche Hausseite und eine kurze Stammbaum-Bio.
71 neue Familienakten bleiben ohne erfundene Personen oder Ehen. Die neun
vorhandenen Akten behalten ihre 264 Personeneinträge, Beziehungen, Porträts,
Kennungen, Nebenlinien und genealogischen Ansichten. Die früheren vollständigen
Familienbelege liegen unverändert unter `sources`; der historische Hashschutz
wird nicht neu berechnet. Der neue Metadatenprüfbeleg projiziert ausschließlich
die genau geprüften Rang-/Lehnsskalare und Verwaltungskennungen zurück.

Ränge, die in der Vorbereitung ausdrücklich offen waren, bleiben offen.
Ein zugeteilter Wohnsitz allein begründet keinen zusätzlichen Adelstitel.
Die Registerpfade folgen den tatsächlichen beziehungsweise historischen
Sitzen, ohne neue geografische Ordner für Dienstbindungen zu erfinden.

## Erhaltene Besonderheiten

- Halfax und Ashby sind ausgestorben: eigene letzte Haussektion in Herrschafts-
  und Ortsakten, Kennzeichnung in den kurzen Bios, keine lebenden Kartenbewohner.
- Talyndor und Brevanor beschreiben die frühere Eigenständigkeit. Aktuelle
  Besatzung, historische Lehen und unbekannte heutige Bewohner bleiben getrennt.
- Thornwick ist unter Wensbury zugeordnet, bleibt aber heimatlos. Refri,
  Thornholts Verlust 1720 und die gesamte bekannte Familiengeschichte bleiben
  erhalten. Thornholt bekommt keinen erfundenen restaurierten Kartenpunkt.
- Bielle bleibt Brenor/Baron. Desele und Lothaire werden nicht geadelt oder
  ohne Ortsbeleg verschoben. Gerain und Kervaut behalten eigene Klassen und
  Wappen; ausschließlich ihre bestätigten Sitze werden übernommen.
- Brethneachs antikes Lilienzeichen erscheint im Geschichtsabschnitt Brevanors
  und öffnet sein vorhandenes Original.
- Die bereits korrigierten Hausbilder und die Trennung von normalen Figuren
  und Comic-Klassenicons bleiben erhalten. Es wurden keine Bilder neu generiert.

## Architektur und Quellen

Die gemeinsame Länderaufnahme bleibt unter `shared/accepted-realms`.
Kultur- und Hausprosa des neuen Schritts ist in `kingdom-house-content.mjs`
gekapselt. Die vorhandenen Herrschafts-, Orts-, Haus-, Stammbaum- und
Kartenrenderer bleiben zuständig. Die kleine Erweiterung für historische
Embleme nutzt den gemeinsamen Geschichtsabschnitt. Adelshäuser mit offenem
Einzelrang erhalten wie andere Adelshäuser die gemeinsamen unbesetzten Hofämter.

`capture-kingdom-sources.mjs`, `settle-kingdom-sources.mjs` und
`review-kingdom-metadata.mjs` sind einmalige redaktionelle Werkzeuge und keine
Release-Buildschritte. Spätere Änderungen gehören in die bestätigten Daten;
die Importer dürfen diese nicht unbesehen überschreiben. Archivierte Exporte,
Momentaufnahmen und Werkzeuge werden nicht statisch ausgeliefert. Aktive Daten,
Kriegerbilder und Originaldownloads bleiben verfügbar.

`map-lettering.mjs` erzeugt Kartenbeschriftung als natives SVG. Das Originalraster
ist unverändert eingebettet, die Bildabmessungen und Pin-Koordinaten bleiben
erhalten. Die beiden alten Bistumsaufschriften werden in der aktiven Übersicht
durch die neuen Gebietstypen abgedeckt; die bestätigten neuen Ortsnamen ersetzen
die Kartenplatzhalter. Derselbe Stand liegt in Aeldrunmars Vorbereitungsansicht.
`build-maps.mjs --check` prüft die erzeugten Ansichten deterministisch.

## Prüfung

535 kombinierte Tests für Länderaufnahme, Herrschaften, Häuser, Karten,
Vorbereitungen und betroffene Familien bestanden. Die Aufnahme aller 1.106
kanonischen Bilddateien ist anhand ihrer Hashbelege geprüft; die neue Ergänzung
übernimmt 459 Dateien. Generatorprüfungen für Seiten, Karten, Hausbios,
Kontinentübersichten, Kartenhaushalte und Kriegergalerie bestanden.

Browserprüfung in Chrome mit lokalem Server auf Port 8896: 1440, 768 und
390 CSS-Pixel, zusätzlich Hausseite auf 312 Pixel. Länderübersichten, geänderte
Herrschaftstypen, Hausregister, direkte Orts-/Hauslinks, eingebettete leere
Familienakte, kurze Hausbio, Klassen-/Bestiariumlinks und Kartenbeschriftung
geprüft. Keine Seitenüberläufe oder fehlenden verlinkten Bilder in den geprüften
Ansichten. Ein protokollierter Fehler einer fremden Chrome-Erweiterung gehört
nicht zur Anwendung. Temporäre Viewportvorgaben werden zurückgesetzt.

Zusätzlich bestanden 18 Prüfungen der Release-Auswahl und Veröffentlichungspolicy.
Ein breiter separater Lauf der älteren Ortstests ergibt 40/46. Die sechs Fehler
entsprechen den bereits in [QA.md](QA.md) dokumentierten Altprüfungen: Gwynthors
frühere Etablissementsliste, Llysfaens Tafel, zwei alte Cachekennungen sowie zwei
Erwartungen des Wyrm-Ortsimports. Die verantwortlichen alten Ortsinhalte wurden
bei dieser Übernahme nicht verändert. Der gemeinsame Ortsrenderer kennzeichnet
ausgestorbene Häuser nun zusätzlich in einer eigenen letzten Haussektion; die
neue Hauptstadtakte wurde damit im Browser geprüft. Das Kartenwerk öffnet über
die Ortssuche Virelaths korrektes Thaintum samt Haus Trent und direkten Links.

Belege: `diagnostics/kingdom-admission-20261101/`, insbesondere `final-tests.log`
und `aeldrunmar-register.png`. Kein Commit, Push, Deploy oder Firebase-Schreibzugriff.
