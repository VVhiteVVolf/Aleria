# Gwendolyns Ufer, vorbereitete Häuser und territoriale Hausübersichten

Stand: 11. September 2026. Fortsetzung von [RITTERHAEUSER-UND-VORBEREITUNG.md](RITTERHAEUSER-UND-VORBEREITUNG.md). Die zuletzt gewünschte territoriale Verteilung ersetzt die frühere Gesamtliste auf Celtigerns Wacht.

## Umfang

Alle 18 neu eingereichten Quellen wurden archiviert und in bestehende Hausseiten und kurze Stammbaum-Bios übernommen: 17 Häuser in Gwendolyns Ufer und Garrael auf Camruisge. Dazu kommen 19 ausdrücklich gelieferte Kriegerbilder. Sämtliche 37 Bilder liegen lokal beim jeweiligen Haus; Herkunft und Originalanhang stehen in dessen `quellen.json`.

Die bestehenden 77 Hausseiten und Bios bleiben verfügbar. Von den 69 nach den ursprünglichen acht Häusern angelegten Seiten enthalten jetzt 33 eingereichte Quellen; 36 bleiben vorbereitet. Fehlende Chroniken und unbekannte Angaben werden nicht erfunden. Vorbereitete Kapitel heißen „Folgt …“; ungesicherte Profilfelder bleiben leer.

## Ausführungsplan und Verantwortlichkeiten

1. Quellen unverändert als `animexx-original.html` sichern; Wappen, Personen und territoriale Zuordnung gegen die vorhandenen Familienakten prüfen.
2. Texte vollständig erfassen, einschließlich zusätzlicher Zwischenkapitel und erzählerischer Szenen. Schreibfehler und schwache Formulierungen redigieren; widersprüchliche Angaben offenhalten und unten dokumentieren.
3. Je Haus ausschließlich dessen `haus.content.mjs` redaktionell pflegen. `biographySummary` bleibt eine eigene Kurzfassung unter 200 Wörtern; Amtslisten und ausführliche Chroniken stehen auf der Hausseite.
4. Bilder lokal übernehmen und Quellen dokumentieren. Bereits vorhandene Portraits, Wappen und Silhouetten wiederverwenden. Der unbenannte Vogt der Taranvyr erhält die männliche Silhouette.
5. Über `scripts/build-house-content.mjs` Hausseitendaten, Bios und Register erzeugen. Keine zweite HTML-Vorlage pro Haus und keine neue zentrale Inhaltssammlung einführen.
6. Direkte Wappenlinks in den verantwortlichen Herrschaftsdaten hinterlegen. Gwendolyns Ufer nutzt dafür ebenfalls das vorhandene `herrschaft-data.js`. Das Herrschaftsbanner öffnet die zugehörige Herrschaft, das Stammbaumwappen die kurze Bio.
7. Standardbios mit erhöhter `biographySourceRevision` aktualisieren. `biographyPreviousDefaultFingerprints` erkennt ausschließlich die unverändert ausgelieferten bisherigen Vorbereitungsbios. Eigene Texte, ausdrücklich gelöschte Bios und Familiengraphen bleiben erhalten. Fingerprints sind Vergleichskennungen, keine Sicherheitsprüfung.
8. Territoriale Auswahl, Bilder, Personenlinks, kurze Bios, gespeicherte Änderungen und tatsächliche Browsernavigation prüfen. Kleine Banner, zentrierte Figurentabellen, volle innere Portraithöhe und gleich große Hofkarten bleiben verbindlich.

## Territorialer Zuschnitt – auch für künftige Seiten

Unterordner dienen zum Abgleich, nicht zum Zusammenführen aller Häuser auf der Grafschaftsseite. Oben stehen die großen Häuser der Verwaltungsebene, darunter deren örtliche Häuser. Unterherrschaften zeigen ihre eigenen Familien und Vasallen. Verbindliche Regeln: [Kontinente/AGENTS.md](../Kontinente/AGENTS.md) und [HERRSCHAFTSSEITEN-VORGEHEN.md](../Kontinente/HERRSCHAFTSSEITEN-VORGEHEN.md).

| Seite | Sichtbare Hausgruppen |
| --- | --- |
| Celtigerns Wacht | Sieben große Häuser: Draig, Gafyr, Wyrm, Saethwyr, Gwefrydd, Gwyvern, Arwydd. Darunter 14 Ritterhäuser und 13 Bürgerhäuser aus Llamreis Ankunft/Gwynthor. Abschließend Ard Conbhrón, Illysywen und Ui Talamh. Insgesamt 37 Karten. |
| Gwendolyns Ufer | Gwyvern, 15 Ritterhäuser und zwei Bürgerhäuser. |
| Artus Streben | Gwefrydd, zehn Ritterhäuser und vier Bürgerhäuser; die kleineren Häuser sind mit Wappen, Bio und bekannten Basisangaben vorbereitet. |
| Rhonwens Tränen | Arwydd, fünf Ritterhäuser, anschließend Illysywen, Morveth und Skellor. Die fünf Ritterhäuser sowie Morveth und Skellor bleiben inhaltlich vorbereitet. |
| Gafyr | Gafyr, Tlawd und Gostyn. |
| Saethwyr | Saethwyr, Chwedonol und Eneiniog. Die stabile ältere ID `haus-chwedlonol` bleibt erhalten. |
| Wyrm | Wyrm, Rhyddid, Cludwyr, Loer und Argall. Bereits benannte Familien Jernigan, Glyn, Crewe, Talfryn, Blevis, Brogar, Tynged und Tarw bleiben sichtbar; ohne belegte Akte werden keine Personen, Wappen oder Links erfunden. |
| Camruisge | Garrael mit ausgearbeiteter Hausseite; die bestehende Salach-Karte bleibt erhalten. |

Ard Conbhrón steht auf ausdrücklichen Nutzerwunsch in der historischen Gruppe „Ausgestorbene Häuser“. Seine Akte nennt noch lebende Angehörige; deren Lebensstatus wurde nicht geändert. Illysywen ist ausdrücklich zusätzlich auf der Grafschaft sichtbar. Morveth und Skellor erscheinen bei Rhonwens Tränen. Von Hochreuth bleibt als Hausseite verfügbar, wird wegen der ungeklärten Zuordnung Goldmund / Haus Roden aber nicht länger als örtliches Haus der Grafschaft ausgegeben.

## Quellen und redaktionelle Entscheidungen

Die Nummerierung entspricht der Reihenfolge der 18 Anhänge. Die vollständigen Anhangspfade und Bild-URLs stehen in den jeweiligen `quellen.json`; die Originale bleiben unverändert.

| Nr. / Haus | Übernahme und offene Angaben |
| --- | --- |
| 1 · Gwyntog | Llywarch, Ithel und Alastair als Oberhauptfolge; Nudd als ausdrücklich benannter Erbe aus Figurenbeschreibung und Familienakte ergänzt. Sechs Figuren sind mit ihren Personenakten verbunden. |
| 2 · Rhuddgar | Fremder Hausname „Taranvyr“ im Religionsabschnitt zu Rhuddgar korrigiert. Rittervater bleibt leer: Tabellenangabe Draig und unbenannter Baron der Geschichte sind nicht eindeutig auflösbar. |
| 3 · Caerlaen | Kopierter Religionsabschnitt nennt irrtümlich Caerthwyn/Gestüt; auf Caerlaen und Unterricht berichtigt. Die tatsächlich beschriebene Rivalität mit Caerthwyn bleibt erhalten. |
| 4 · Caerthwyn | Bürgerliches Haus: Sions erhoffter künftiger Ritterschlag begründet keinen bereits bestehenden Ritterstand. Vermögen bleibt wegen widersprüchlicher Angaben leer. Kein Rittervater ergänzt. |
| 5 · Barus | Macsen laut Geschichte und Familienakte lebendes Oberhaupt; widersprüchliches Todeszeichen und Eintrag als eigener Erbe nicht übernommen. Wyett erster Erbe. Vermögen bleibt ungeklärt. |
| 6 · Cenfig | Llward zu Lleward korrigiert, Llowarch bleibt eine andere Person. Der behauptete vollständige Untergang der Conbhrón wird als Niedergang beschrieben, da deren Akte Überlebende nennt. |
| 7 · Daran | Ritterschlag 1686 und Hochzeit 1694 bleiben erhalten. Widersprüchliche Dauer der Wanderjahre nicht als feste Zeitspanne übernommen. Keine daraus errechnete neue Heimkehrdatierung. |
| 8 · Ymladd | Sitz präzisiert auf die beschriebene Burg östlich von Abergwint an der Straße nach Carregmawr; kein Burgname erfunden. |
| 9 · Tawelgar | Sitz als Burg zwischen Abergwint und Llysbrynn beschrieben. Brinthan, Maredudd und Harri als belegte Oberhauptfolge übernommen. |
| 10 · Edmy | Caledfwch zu Caledfwlch korrigiert. Die vollständige Sage bleibt aufklappbar; das zusätzliche Kapitel „2.1. Geschichte“ wurde separat übernommen. Edmwnds Platzhalterüberschrift durch seinen aus der Beschreibung belegten Namen ersetzt. |
| 11 · Cysgodion | Religion bleibt im Profil leer: allgemeine Kirchenzuordnung und ausdrücklich geheim gehaltene Überzeugung widersprechen sich. Gerüchte werden als Gerüchte wiedergegeben. |
| 12 · Seldryn | Yvain zu Ywain berichtigt. Goldmund nicht dem widersprüchlich genannten Kontinent Lothir zugeordnet. Lughs 1680–1720 sind Amtsjahre, keine Lebensdaten. Vermögen und Rittervater bleiben leer. Ob Lugh ordiniert war, bleibt ungeklärt; seine religiöse Laufbahn wird nicht gelöscht. |
| 13 · Annwyl | Eglan zu Elgan, Petyr Anhof zu Anghof und Cor Myndfaen zu Côr Mynyddfaen berichtigt. Emyrs Absatz sprachlich überarbeitet; Ausschweifungen und vernachlässigte Pilgerreise bleiben inhaltlich erhalten. |
| 14 · Penwyn | Gründer unbekannt. Direkter Lehnsherr Myrddin Draig bleibt erhalten, nicht automatisch Gwyvern. Scherzhafte Reibungen mit Myrddin nicht als förmliche Feindschaft ins Profil übertragen. |
| 15 · Selog | Marchell anhand der Generation als 1649 geborene Hohepriesterin verknüpft, nicht mit der gleichnamigen jüngeren Person. Burg am Feuerstollen ist Hauptsitz; Stadtanwesen bleibt nachgeordnet. Rittervater wegen unterschiedlicher Quellenangaben leer. |
| 16 · Taranvyr | Fiannait als Kämmerin/Schatzmeisterin und Mervynne als Rechtsprecherin mit den vorhandenen Personenakten verknüpft. Der unbenannte Vogt nutzt die Silhouette. Leere Vorlagenrollen nicht als weitere Ämter ausgegeben. |
| 17 · Trydar | „Baronie Abergwint“ zum tatsächlichen Herrschaftsnamen Gwendolyns Ufer korrigiert. Pryces und Maldwyns Angaben als Lebensdaten gekennzeichnet. Unvereinbare Wanderjahresdauer Maelgwyns auch hier nicht festgeschrieben. |
| 18 · Garrael | Gehört zur Insel Camruisge. Sitz bleibt leer: Infotabelle nennt Rhosmere, die Beschreibung Aberllan. Kein unbekannter Erbe ergänzt. Die beschriebene Herrschaft im Inselnorden bleibt von Salach im Süden abgegrenzt. |

## Ergänzte Kriegerbilder

Artus Streben: Almarch, Brinmarch, Gwardin, Tirwyn, Eirfael, Ghorswyn, Coedvarn, Althin, Talmeirch und Gwynrhos. Die Eingabe „Brimarch“ wurde dem bereits vorhandenen Haus **Brinmarch** zugeordnet; es wurde kein zweites Haus angelegt.

Rhonwens Tränen: Gwared, Rhenna, Madryn, Talinvyr, Merek, Skellor und Morveth. Llamreis Ankunft: Bleiddorn und das örtliche Dubhan unter der stabilen ID `haus-dubhan-gwynthor`.

Nachgereichte Bildkorrektur: Bleiddorn verwendet `https://i.imgur.com/g850v6f.png`, Dubhan `https://i.imgur.com/M3xsR4U.png`. Beide sind unter neuen lokalen Dateinamen eingebunden, damit zwischengespeicherte frühere Bilder die Korrektur nicht verdecken. Die vorherigen URLs bleiben nur als Herkunftsvermerk in `quellen.json` erhalten.

Die Bilder ergänzen die vorbereiteten Hausseiten und kurzen Bios. Aus einem neuen Bild werden keine neuen Chroniken, Ämter oder genealogischen Aussagen abgeleitet.

## Validierung

Abgeschlossen:

- Generatorprüfung `build-house-content.mjs --check`: alle 77 Ausgaben aktuell.
- 49 Hausseiten-/Territorialtests erfolgreich: vollständiger Seiten- und Biobestand, 76 belegte Familien über ihre örtlichen Wappenkarten, territoriale Abgrenzung, Quellen/Bilder, Personenlinks und Erhalt eigener oder gelöschter Bios.
- Bestehende Stammbaum-Regression: **1.246 Tests erfolgreich**.
- Lokaler Chromium: acht Grafschafts-/Herrschaftsübersichten mit den erwarteten Kartenzahlen geprüft, auch bei blockiertem zusätzlichen Hausseitenregister. Alle 37 geänderten Hausseiten und ihre Bilder geladen; 21 Bios geöffnet. Zwölf Ansichten bei 390, 768 und 1440 Pixeln auf Überlauf, Zentrierung, Portraithöhe und gleich große Hofkarten kontrolliert.
- Tatsächlicher Klickweg Gwendolyns Ufer → Annwyl → Herrschaftsbanner → Gwendolyns Ufer erfolgreich. Die korrigierten Bilder für Bleiddorn und Dubhan in Hausseite und Bio geladen und ihre neuen Dateipfade kontrolliert. Historische Portraits und Bürgerwappen nach dem Laden visuell geprüft.
- Der integrierte Browser war nicht verfügbar; die Sichtprüfung lief deshalb im vorhandenen lokalen Chromium. Ein erster automatisierter Wappenklick wartete auf ein noch außerhalb des sichtbaren Bereichs verzögert geladenes Bild. Nach normalem Scrollen zur Karte funktionierte der Klick; kein zusätzlicher UI-Workaround wurde eingebaut.

Die fachlichen Tests lassen sich vom Projektstamm aus erneut ausführen:

```powershell
node "Familien Häuser und Clans/scripts/build-house-content.mjs" --check
node "Familien Häuser und Clans/tests/gwendolyn-house-content.test.mjs"
node "Familien Häuser und Clans/tests/celtigerns-complete-inventory.test.mjs"
node "Familien Häuser und Clans/tests/celtigerns-house-pages.test.mjs"
node "Familien Häuser und Clans/tests/house-draig.test.mjs"
node "Kontinente/tests/celtigerns-wacht-families.test.mjs"
node "Kontinente/tests/house-territory-scope.test.mjs"
```

Die Stammbaum-Regression wird mit `node tests/run-tests.js` im Ordner `Stammbäume` ausgeführt.
