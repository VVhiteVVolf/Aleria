# Krieg der Prätendenten — Leselayout und Kriegskarte

Stand: 24. Oktober 2026. Die Ausarbeitung erfolgt weiterhin schrittweise.
Mit dem ausdrücklichen Auftrag, alle lokalen Neuheiten zu pushen und zu deployen,
hat der Nutzer am 24. Oktober auch die bisherige Veröffentlichungssperre dieses
Themenfelds aufgehoben. Noch offene Inhalte bleiben als solche gekennzeichnet.

## Verbindlicher Inhaltsabgleich vom 24. Oktober

Alle 33 Punkte der Inhaltsprüfung sind auf Nutzerauftrag redaktionell entschieden.
Die aktuelle Lesefassung verwendet die Stammbaumfolge, eine gemeinsame Chronologie,
einheitliche Fraktionen, Orte und Verlustangaben. Die Entscheidungen einschließlich
der wenigen notwendigen redaktionellen Festlegungen stehen vollständig in
`Kriege/krieg-der-praetendenten/redaktion/abgleich-2026-10-24.md`.
Die vier verknüpften Biografien Balgruuf, Roger, Galmar und Asger sind mitabgeglichen.
Die acht nicht ausgearbeiteten Verläufe bleiben knapp; Schuldfragen und fehlende
Einzeltage werden nicht erfunden.

`war-source-edition.json` enthält für jede Änderung den alten und neuen Wortlaut,
den stabilen Block-/Tabellenpfad und den Entscheidungsbezug. `war-source-edition.mjs`
wendet sie ausschließlich auf Kopien an und bricht bei veränderten Ausgangspassagen
ab. `warSource` liefert die aktuelle Lesefassung; `WAR_SOURCES` und
`originalWarSource` den unveränderten Rohimport. Dubletten teilen dieselbe redigierte
Fassung. Wellenruhs 28 Absätze werden aus denselben korrigierten Blöcken gelesen.
Originale bleiben ausdrücklich getrennt beschriftete Archivbelege.

Arns Szene von 1639 ist durch `dunkelmoor-arn-1639-v2.webp` ersetzt: etwa 31 Jahre,
seit 1636 bettlägerig, Oberbefehl vom Krankenlager. Die alte Version ist im Manifest
als ersetzt markiert. Es gibt 20 aktive Motive und eine archivierte frühere Version.

## Leseaufbau und interaktive Karte

Alle 16 lokalen Ereignisdossiers behalten ihren Einstieg mit Titelbild. Darunter
steht links der fortlaufende Bericht mit Einordnung und abschließenden Verweisen.
Rechts läuft eine kompakte Infospalte mit Fakten und Abschnittslinks mit. Die
vollständigen Quellentabellen sind dort aufklappbar; jeder Quellblock wird genau
einmal ausgegeben. Auf Ansichten bis 900 Pixeln steht die Infospalte vor dem Text.
Ihre Höhe ist am Desktop auf die verfügbare Bildschirmhöhe begrenzt; lange
Originaltabellen bleiben innerhalb der Spalte scrollbar. Das vorhandene Wellenruh-
Dossier verwendet denselben Leseaufbau in seinem eigenen Schlachtmodul, mit
Widderzeichen und Flottenvergleich; Animation und Audio bleiben unverändert.

Die Oberseite enthält eine interaktive Kriegskarte auf der tatsächlich angesehenen
und unveränderten Aldrimar-Reichskarte aus `Kontinente/assets/images/aldrimar/`.
Zehn annähernde Ortsmittelpunkte erschließen 16 Ereignisse. Hurinn bleibt wegen
der ungeklärten Ortszuordnung ohne Marker über die Ereignisliste erreichbar.
Jahreswahl, drei unabhängige Parteifilter und Ortsauswahl zeigen die zugehörigen
Dossiers sowie deren überlieferten Ausgang und Folgen. Die Marker stellen keine
exakten Schlachtpositionen, Truppenbewegungen oder historischen Grenzen dar.

Hurinn erscheint nach dem Inhaltsabgleich ausschließlich 1629. Die Heldenwacht-Belagerung
bleibt von 1631 bis 1637 sichtbar; ihr Ausgang wird ausdrücklich als Ergebnis am
Ende des Zeitraums beschriftet. Für Jahre ohne Einzeldossier bleibt eine leere
Auswahl sichtbar, ohne den bis 1647 reichenden Krieg vorzeitig zu beenden. Ereignisse
ohne gesicherte Parteizuordnung verschwinden nicht durch Abwahl aller Parteien.
Ohne JavaScript bleiben Reichskarte und sämtliche Dossierverweise lesbar.

## Fertiger Umfang

- Oberseite: `Ereignisse/Kriege/krieg-der-praetendenten/index.html`.
- Drei vollständige Fraktionsdossiers mit den Texten und Tabellen ihrer Vorlagen.
- Ereignisdossier zur Ermordung Rogers und Astrids mit vollständiger Überlieferung.
- Ereignisdossiers zur Übernahme von Heldenwacht und zum Aufruhr in Ivarsfels:
  je 23 vollständige Quellabsätze, Tabellen, Zitate, eigene Szene sowie Hinweise
  auf den redaktionellen Abgleich. Die identischen Belege 07 und 09 sind mitverlinkt.
- Ereignisdossiers zur Belagerung von Trauerwald und zur Schändung von Flusswall:
  20 beziehungsweise 30 vollständige Quellabsätze samt Tabellen und Zitaten,
  eigene Schauplatzbilder und Verweise auf die beteiligten Fraktionen.
- Ereignisdossiers zu Hurinn, Yogrim und der Belagerung von Schwertfall:
  36, 31 und 36 vollständige Quellabsätze, alle Tabellen und Reden sowie eigene
  Szenen. Der doppelte Schwertfall-Beleg 17 bleibt direkt zugänglich.
- Eckdaten-Dossiers zu Rorikshalls Aufruhr, Wolfswacht und II. Wellenruh:
  vollständige Tabellen, erhaltene Lagebezeichnungen, eigene symbolische Szenen
  und sechs ausdrücklich offene Textabschnitte je Vorlage. Kein Verlauf ergänzt.
- Eckdaten-Dossiers zu Heldenwachts Belagerung, Rorikshalls Hinterhalt und Bjoerns
  Ermordung: vollständige Tabellen, sechs offene Abschnitte je Quelle und eigene
  Szenen. Die sechs leeren Jahresüberschriften der Belagerung bleiben erhalten.
- Eckdaten-Dossiers zu Ceitheachs Angriff auf Rorikshall und zur Schlacht im
  Dunkelmoor: vollständige Tabellen, je vier unveränderte Gerüstabsätze und sechs
  offene Abschnitte. Eigene Szenen, ohne einen Schlachtverlauf zu erfinden.
- Vorhandenes animiertes Wellenruh-Dossier in beide Richtungen verknüpft.
- 17 eindeutige Ereignisse in einer durchsuchbaren, nach Partei filterbaren Zeittafel.
  Alle 17 sind mit Dossiers verknüpft: neun ausführliche Berichte und acht bewusst
  knappe Eckdaten-Seiten. Die Oberseite berechnet diesen Stand aus dem Register
  und den gemeinsamen Dossierverweisen; sie verspricht keine weiteren fertigen Texte.
- Im ersten Schritt fünf Illustrationen: Thronfrontispiz, drei altersangepasste Prinzenporträts
  in Szene und das Kelchstillleben des Giftmords. Alle als 2:3 im gespeicherten
  `anime-scene-portrait`-Stil, Tales of Xillia/Frieren, über das eingebaute Imagegen.
- Im zweiten Schritt zwei zusätzliche 2:3-Szenen: Arn mit Gefolge in Heldenwacht
  und Bjoerns Ankunft im umkämpften Ivarsfels. Direkte Referenzen sind die bereits
  verjüngten Porträts von 1627.
- Im dritten Schritt zwei 2:3-Schauplätze: Trauerwalds enger Zugang durch die
  Sümpfe und Flusswalls Ruinen mit intakter Brücke.
- Im vierten Schritt drei 2:3-Szenen: Widderbanner im Regen am Hurinn, der auf
  etwa 30 Jahre angepasste Eldar am Yogrim und Schwertfalls noch gehaltene
  Inselburg.
- Im fünften Schritt drei symbolische 2:3-Szenen: leerer Ratssaal, Wolfswacht
  unter rotem Widderbanner und Decksstillleben der geschlagenen grünen Seemacht.
  Diese Bilder liefern keinen zusätzlichen Ereignisablauf.
- Im sechsten Schritt drei 2:3-Szenen: Heldenwachts geflicktes Banner, zwei
  beschädigte Widderschilde bei Rorikshall und Bjoerns Gedenkbild mit etwa
  23 Jahren in der Kathedrale.
- Im siebten Schritt zwei 2:3-Szenen: Ceitheachs Feldzelt mit dem tatsächlich
  angesehenen blau-goldenen Ui’Rochraide-Wappen und Arn mit etwa 31 Jahren im
  Dunkelmoor. Insgesamt 20 Motive im Bildmanifest;
  Generator-PNGs und WebP-Ausgaben sind lokal gesichert.
- Direkte Dossierverweise aus den Fraktionsseiten und verknüpfte Ereignisse auf
  den Leseseiten; Kapitelverweise erschließen die vollständigen Originalberichte.

## Originale und Texttreue

Alle 24 übergebenen Anhänge liegen unverändert und mit SHA-256 unter
`Kriege/krieg-der-praetendenten/sources/01.html` bis `24.html`.
`manifest.json` enthält Anhangskennungen, Dateigröße und Hash; die `.txt`-Dateien
sind zusätzliche Lesefassungen. Kein Original wurde ersetzt oder bereinigt.

`scripts/import-praetendenten-source.py` erzeugt einmalig das strukturierte
`praetendenten-sources.json`. Der Import prüft vollständige Textabdeckung ohne
Leerraum und speichert auch alte Bild- und Linkquellen. Leere Layoutabsätze,
Platzhalterzitate und die alte Inhaltsverzeichnistabelle werden nur bei der
Darstellung ausgeblendet. Ausgefüllte Tabellenzellen und Prosa bleiben erhalten.
Die alten externen Bilder werden nicht automatisch geladen; die Originale und
ihre Verweise bleiben als Quellbeleg erhalten. Der reguläre Build benötigt nur Node.

Dubletten: 07 → 06 (Heldenwacht), 09 → 08 (Ivarsfels), 17 → 16 (Schwertfall).
Es bleiben 21 unterschiedliche Dokumente: Krieg, drei Fraktionen, 17 Ereignisse.
Die neu gelieferte Wellenruh-Datei (12) ist textlich identisch mit der bereits
vorhandenen Schlachtquelle; nur die ursprüngliche HTML-Serialisierung unterscheidet sich.

## Verantwortung

- `praetendenten-data.mjs`: kuratierte Navigation, abgeglichene Kurzfassungen,
  Bearbeitungsstand und weiterhin unbekannte Einzelangaben.
- `war-sources.mjs`: schreibfreier Zugriff auf den vollständigen Import und seine
  Abschnitte/Tabellenwerte; erkennt Lage-/Strategiebezeichnungen als Gerüst statt
  ausformulierter Prosa. Das gilt auch für „Tatort“ und die bloßen Jahreslabels
  „Erstes Jahr“ bis „Siebtes Jahr“, „Strategie von Ceitheach“, „Die Taktik der
  Grünen/Roten“ und „Der Verlauf der Schlacht“. Die Labels bleiben sichtbar.
  Der Rohimport bleibt erhalten; die Lesefassung enthält den geprüften Abgleich.
  Keine Firebase-Verbindung.
- `war-source-render.mjs`: sichere Ausgabe der vollständigen Überlieferung;
  Inhalte werden escaped, Layouttabellen nicht als Seitengerüst übernommen.
  Die Auswahl `blocks: 'all' | 'text' | 'tables'` trennt auf Ereignisseiten die
  Ausgabe von Bericht und Infospalte ohne kopierte Renderlogik.
  Bei Eckdaten-Dossiers markieren `markEmptySections` und die gemeinsame
  Abschnittsprüfung fehlenden Fließtext auch neben Tabellen und Lagebezeichnungen.
- `war-hub-render.mjs`, `war-faction-render.mjs`, `war-event-render.mjs`:
  jeweils eigener Seitentyp; `war-shell.mjs` hält gemeinsame Navigation und Hülle.
- `war-event-dossiers.mjs`: kuratierte Präsentationsdaten und Quellenkritik für
  freigegebene Ereignisse. Der Ereignisrenderer verwendet diese Daten gemeinsam;
  ein neues Dossier benötigt keine kopierte Seitenvorlage.
  `WAR_EVENTS.content` bleibt auch bei verlinkten Eckdaten-Dossiers „Eckdaten“;
  der Renderer verspricht dort keinen vollständigen Bericht, sondern die Eckdaten.
- `war-links.mjs`: gemeinsame Pfadbildung für Zeittafel, Fraktionen und Dossiers.
- `war-timeline-render.mjs`: Zeittafel und vorhandene Dossierverweise.
- `war-map-data.mjs`: Kartenbeleg mit Hash, annähernde Ortsmittelpunkte, Zuordnungen
  und ausdrücklich benannte Datumsausnahmen. Keine erfundenen Geokoordinaten.
- `war-map-model.mjs`: reine Jahres-/Parteiauswahl und konsistente Ereignisauswahl.
- `war-map-render.mjs`: statische Kartenansicht und aus den vorhandenen Quellen
  gelesene Ereignisangaben, auch ohne JavaScript zugänglich.
- `war-map-controller.mjs`: gekapselter Kartenstatus, eigene DOM-Verwaltung und
  Listener mit Abbruchsignal. Kein geteilter Filterzustand mit der Zeittafel.
- `war-page.mjs`: lokal gekapselter Filterzustand und Lesebuchöffnung;
  Event Delegation, keine Inline-Handler, keine globalen States.
- `war-page-registry.mjs`: fertige Seiten aus den expliziten `WAR_EVENTS.file`-
  Verweisen; 20 Seiten einschließlich Oberseite und Fraktionen. Das vorhandene
  Wellenruh-Dossier bleibt außerhalb dieser Registry verknüpft.
- `war-page-render.mjs`: explizite Rendererzuordnung; unbekannte Ereignisse schlagen
  beim Build fehl, statt versehentlich das Dossier eines anderen Ereignisses auszugeben.
- CSS-Dateien trennen Hülle/Lesetext, Oberseite, gemeinsame Dossiers sowie die
  Ereignis-Lesespalte und die interaktive Karte. Keine globalen Layoutüberschreibungen.
- `war-build-assets.mjs`: kopiert Originalbelege und Bildmanifest in den Build.
- `scripts/build-praetendenten.mjs`: reproduzierbare statische HTML-Seiten.

Die gemeinsame Ereignischronik verweist jetzt auf die Oberseite. Ihre bisherigen
Jahres- und Kalenderangaben bleiben erhalten. Ungeklärte Ereignisdaten werden
nicht als neue feste Kalendereinträge oder Firebase-Mutationen angelegt.

## Bilder und Alter

`assets/praetendenten/image-prompts.json` enthält vollständige Prompts, Werkzeug,
Referenzpfade, Geburtsjahre und Entscheidungen zum Bildalter. Die ursprünglichen
Generator-PNGs liegen in `originals/`, die Seiten verwenden WebP-Exporte.
Stammbaumporträts wurden tatsächlich angesehen und bleiben unverändert.

Quellen der Jahreswerte: `Stammbäume/assets/js/data/house-vaeren-family.js` und
`house-varulv-family.js`; beide stehen im Bildmanifest unter `birthSources`.
Arn: 1608 → ca. 19; Bjoern: 1610 → ca. 17; Sinding: 1611 → ca. 16, jeweils 1627.
Da Geburtstage fehlen, wird keine tagesgenaue Altersangabe behauptet. Ältere Bärte,
Gesichtsfalten und Arns spätere Krone wurden in neuen Fassungen entfernt.
Die Fraktionsporträts bleiben ausdrücklich Bilder des Jahres 1627, auch wenn die
jeweilige Fraktionsbiografie spätere Kriegsjahre behandelt.
Die beiden Szenen des zweiten Schritts behalten dieses Bildalter bei. Weder die Stadtansichten
noch anonyme Gefolgsleute behaupten zusätzliche konkrete Geografie oder Identitäten.
Bjoern wird bei der in Quelle 08 geschilderten Ankunft gezeigt, ohne ihm eine dort
nicht belegte persönliche Kampfhandlung zuzuschreiben. Arns Anklage und die
Dialoge bleiben als Stimmen der Quellen eingeordnet.
Die Schauplätze des dritten Schritts benötigen keine neu interpretierten
historischen Porträts. Trauerwald zeigt anonyme Wachen am Beginn der Belagerung;
Flusswall zeigt die Zerstörung ohne Personen. Die erhaltene Brücke entspricht
dem im Bericht genannten Zugang nach Ivarsfels. Die konkrete Stadtarchitektur,
Landschaft und Beleuchtung bleiben ausdrücklich bildliche Rekonstruktion.
Eldar Varulv: 1599 → ca. 30 Jahre im Jahr 1629. Das tatsächlich angesehene
Stammbaumporträt zeigt ihn deutlich älter; die neue Szene entfernt reifere
Gesichtsfalten und verkürzt den Bartzopf. Gesicht, Haar, Augen, Wolfsreif und
roter Waffenrock mit weißem Wolf bleiben erhalten. Die Hausfarben werden nicht
mit seiner Zugehörigkeit zu den Grünen verwechselt. Hurinn zeigt keine benannte
Person und legt das strittige Ereignisjahr nicht fest; das zunächst falsche
Tiermotiv des roten Banners wurde per Imagegen gezielt zum Widder korrigiert.
Die Inselburg wird während der dritten Belagerungsphase noch unversehrt gezeigt.
Die drei neuen Stillleben zeigen keine historischen Personen. Der Ratssaal ist
eine Allegorie der inneren Spaltung, kein behauptetes Treffen. Wolfswachts
Bannerwechsel bebildert nur das Ergebnis; das Decksstillleben legt weder Schiff,
Todesumstände noch Manöver der zweiten Seeschlacht fest.
Im sechsten Schritt passt Bjoerns tatsächlich erneut angesehenes Stammbaumporträt
bereits zum jungen Erwachsenen von 1633: 1610 → ca. 23 Jahre. Kleiner blonder
Kinnbart, Haar, Augen und Reif bleiben erhalten; der unbelegte Blumenstrauß wird
nicht in die Szene übernommen. Das Gedenkbild zeigt ihn lebend, ohne einen letzten
Moment oder Tathergang zu behaupten. Heldenwachts Winteransicht und die Schilde
bei Rorikshall sind symbolische Bilder ohne festgelegtes Jahr, Lagerplan oder
überlieferte Fundstücke. Es werden keine zusätzlichen historischen Figuren erfunden.
Im siebten Schritt zeigt Ceitheachs Feldzelt keine benannten Personen. Das echte
kreisrunde Ui’Rochraide-Wappen wurde als Bildreferenz mitgegeben. Diarmait und
Cinaed werden in dieser symbolischen Szene nicht als Personen dargestellt.
Arns Stammbaumporträt wurde erneut angesehen: 1608 → ca. 31 Jahre im Jahr 1639.
Die aktuelle Dunkelmoor-Szene v2 verjüngt das ältere Gesicht, behält den erwachsenen
Bart und zeigt Arn seinem Zustand entsprechend im Krankenbett. Die verworfene
stehende Fassung v1 bleibt nur als ersetzter Bildbeleg im Manifest.

## Aktuelle Einordnung der Quellen

Die früheren Widersprüche sind in der aktuellen Fassung bereinigt. Alle 33
Entscheidungen und die ursprünglichen Befunde sind in `redaktion/` dokumentiert.
Die Anzeige verwendet die abgeglichene Chronologie: Heldenwacht 25.06.–01.07.1627,
Ivarsfels 06.–18.07.1627, Hurinn 01.1629 und sechs Jahre sowie vier Tage
Belagerung Heldenwachts. Die Hauptzeittafel übernimmt genau bekannte Einzeltage
aus den Ereignisdossiers. Truppenstärken beziehen sich ausdrücklich auf Landheer,
Flotte oder einen bestimmten Belagerungszeitpunkt.

Persönliche Mordzeugnisse bleiben als subjektive Stimmen erhalten. Täterfragen,
unbekannte Einzeltage und genaue Brückenkoordinaten bleiben offen. Ereignisfolgen
werden zeitlich von ihren späteren politischen Ergebnissen getrennt: Ceitheachs
Angriff 1637 und Protektorat 1638; Schlacht im Dunkelmoor 08.1639 und Seitenwechsel
09.1639. Die acht leeren Verläufe werden nicht durch erfundene Manöver aufgefüllt.
Die unveränderten Originale zeigen die früheren Fehler ausschließlich als Archiv.

## Offene redaktionelle Arbeit

Alle 17 übergebenen Ereignisse sind jetzt zugänglich, einschließlich des bereits
vorhandenen Wellenruh-Dossiers. Die acht Eckdaten-Seiten bleiben bis zu neuen
Quellen bewusst knapp. Unbekannte Tage und fehlende Verläufe benötigen künftig
weitere Quellen; die widersprüchlichen Datierungen sind bereits abgeglichen.

Weitere Seiten erst nach vollständigem Text-/Bildabgleich mit `WAR_EVENTS.file`,
`WAR_EVENTS.image` und Präsentationsdaten in `WAR_EVENT_DOSSIERS` registrieren.
Der gemeinsame Ereignisrenderer prüft diese Zuordnung; Registry und Vite-Einstiege
folgen den freigegebenen Dateiverweisen automatisch. Neue historische Figuren
vor Bildgenerierung in ihren Stammbäumen prüfen. Die Veröffentlichung dieses Stands
ist durch den Gesamtauftrag vom 24. Oktober freigegeben.

## Prüfung

```powershell
node Ereignisse/scripts/build-praetendenten.mjs --check
node Ereignisse/scripts/build-events.mjs --check
node Ereignisse/scripts/build-battles.mjs --check
node --test --experimental-test-isolation=none Ereignisse/tests/praetendenten-canon.test.mjs Ereignisse/tests/praetendenten.test.mjs Ereignisse/tests/praetendenten-map.test.mjs Ereignisse/tests/battles.test.mjs Ereignisse/tests/events.test.mjs Ereignisse/tests/weddings.test.mjs AleriaAlmanach/tests/calendar-events.test.mjs AleriaAlmanach/tests/scene-time-calendar-day.test.mjs
```

Aktueller Stand nach dem Inhaltsabgleich: 88 Tests einschließlich der Aldrimar-,
Cenyr- und Verwaltungsregressionen bestanden. 20 registrierte Kriegsseiten,
26 Bildverweise, 104 Ressourcen und 442 Dossierlinks im Vite-Build geprüft;
alle 24 archivierten Kriegsoriginale bestehen auch dort die SHA-256-Prüfung.
Browser: korrigierter Hurinn-Jahresfilter, direkte Dossiernavigation und neues
Arn-Bild geprüft; 390/768/1100 Pixel ohne Seitenüberlauf. Desktop-Infospalte
bleibt sticky, mobile Infospalte statisch. Belege unter
`.tmp/praetendenten-canon-verification/`.

### Historische Ausbaunachweise vor dem Inhaltsabgleich

Die folgenden Zahlen und Quellenkonflikte beschreiben frühere Prüfschritte.
Der aktuelle Inhaltsstand steht oben und im verbindlichen Abgleich.

65 gezielte Prüfungen umfassen Quellenhashes, Dubletten, vollständige sichtbare
Text-/Tabellenübernahme, Bildalter aus echten Stammbaumdaten, lokale Links,
HTML-Escaping und die bestehenden Schlacht-, Kalender- und Hochzeitsregressionen.
Vite-Build erfolgreich: 20 registrierte Seiten, 26 verwendete Bildverweise ohne
fehlendes Asset und alle 24 Original-HTML-Dateien im gebauten Quellenarchiv.
Browserprüfung der Quell- und Buildfassung: Fraktionsfilter, Dossierfilter,
Suche/Leerzustand, Fraktionsrückverweis, Lesebuchöffnung und 320/390/768 Pixel
ohne Seitenüberlauf. Tabellen bleiben bei Bedarf in ihrem eigenen Bereich scrollbar.
Für die beiden Dossiers des zweiten Schritts zusätzlich geprüft: geladene Szenen und 23 sichtbare
Quellabsätze je Seite, sechs Kapitelverweise, offene Trivia, direkter Verweis zur
blauen Fraktion und zurück, 320/768 Pixel auf beiden Seiten, 390 Pixel in Ivarsfels
sowie Bild- und Textausgabe der gebauten Heldenwacht-Seite.
Im dritten Schritt zusätzlich geprüft: 20 beziehungsweise 30 sichtbare Quellabsätze,
alle drei Ich-Berichte von Flusswall, sechs Kapitelverweise je Dossier,
Quellenwidersprüche, offene Trivia und Fraktionsverweise in beide Richtungen.
Beide neuen Seiten bei 320/768 Pixeln ohne Seitenüberlauf; Dossierfilter mit
sechs von 17 Ereignissen sowie Bild und Text der gebauten Flusswall-Seite geprüft.
Im vierten Schritt zusätzlich geprüft: alle Quellabsätze der drei Dossiers,
unterschiedliche Datierungen/Verlustangaben, Eldars Alter aus der Varulv-Akte,
vollständige Reden, kampfloser Burgabzug, Dublettenverweis und gegenseitige Links.
Alle drei Seiten bei 320/768 Pixeln ohne Seitenüberlauf geprüft.
Fraktionsrückverweis, Zitate-Kapitelanker und Dossierfilter mit neun von 17
Ereignissen funktionieren im Browser; die gebaute Schwertfall-Seite lädt ihr
exportiertes Szenenbild und alle 36 Quellabsätze.
Im fünften Schritt zusätzlich geprüft: Lagebezeichnungen und Tabellen werden
nicht als ausgearbeitete Prosa behandelt; vorhandener Fließtext wird korrekt
erkannt. Alle drei Eckdaten-Dossiers behalten Tabellen, Überschriften und den
Bearbeitungsstand, erhalten sechs Lückenhinweise und versprechen keinen Vollbericht.
Browser: 320/768 Pixel ohne Seitenüberlauf, Eckdaten-Leseanker, rote Fraktions-
und Rückverweise, Szenenbilder und Filter mit zwölf von 17 Ereignissen, davon
drei ausdrücklich als Eckdaten markiert.
Die gebaute II.-Wellenruh-Seite lädt ihr exportiertes Bild, zeigt alle sechs
Lückenhinweise und behält die Eckdaten-Beschriftung des Leseverweises.
Im sechsten Schritt zusätzlich geprüft: leere Jahresüberschriften und „Tatort“
gelten nicht als Fließtext; 9/4/1 unveränderte Gerüstabsätze und sechs Lückenhinweise
je Dossier. Bjoerns Bildalter wird gegen echte Stammbaumdaten geprüft; seine
Angreifer werden keiner Partei zugeordnet. Tabellen, Todesmarkierungen und
widersprüchliche Belagerungsdauer bleiben vollständig erhalten.
Browser: alle drei Seiten bei 320/768 Pixeln ohne Seitenüberlauf, Szenen geladen,
Filter mit 15 von 17 Ereignissen und sechs Eckdaten-Dossiers, blaue Fraktions-
und Rückverweise sowie der direkte Link aus der Zeittafel funktionieren.
Die gebaute Bjoern-Seite lädt das exportierte Gedenkbild und behält den
Eckdaten-Status, sechs Lückenhinweise und den unveränderten Gerüstabsatz „Tatort“.
Im siebten Schritt zusätzlich geprüft: beide letzten Dossiers mit je sechs
Lückenhinweisen und vier unveränderten Gerüstabsätzen; sämtliche Quellenzeilen,
Datumsunterschiede und Todesmarkierungen bleiben erhalten. Arns Alter wird gegen
die Stammbaumakte geprüft, Ceitheachs Dossier keiner unbeteiligten Partei zugeordnet.
Browser: beide Seiten bei 320/768 Pixeln ohne Seitenüberlauf, Szenen geladen,
gegenseitige grüne Fraktionsverweise, Filter mit 17 von 17 Ereignissen und acht
Eckdaten-Seiten sowie Suche nach Ceitheach mit genau einem Treffer.
Die gebaute Dunkelmoor-Seite lädt ihr exportiertes Szenenbild und zeigt alle
sechs Lückenhinweise sowie vier unveränderte Gerüstabsätze.
Beim neuen Leselayout zusätzlich geprüft: Quellblöcke nach Trennung von Tabellen
und Text vollständig und ohne doppelte IDs; unveränderter Kartenhash, Jahresgrenzen,
beide Hurinn-Jahre, alle sieben Belagerungsjahre, unbekannte Parteien und leere
Auswahl. Browser: Yogrim, Wellenruh und Karte bei 320/768/1100 Pixeln ohne
Seitenüberlauf; Infospalten an den vorgesehenen Grenzen statisch beziehungsweise
sticky. Dunkelmoors geöffnete Originaltabelle zeigt alle 51 Zellen auch bei 320
Pixeln ohne Seitenüberlauf. Karte: 17 Ereignisse, zehn Marker, Auswahl der zweiten
Seeschlacht, roter Ausgang, 1633 mit zwei Ereignissen, 1647 ohne Einzeldossier und
blauer Filter mit sechs Ereignissen ohne Ceitheach geprüft.
Die gebaute Karte lädt ihr exportiertes Kartenbild und öffnet Ceitheachs Dossier
mit geladener Szene und sechs offenen Abschnitten. Bei 390 Pixeln bleibt die
ausgewählte Ereignisüberschrift unterhalb der festen Navigation; der Rücksprung
zur Karte funktioniert. 104 Ressourcenverweise der 20 gebauten Seiten lösen auf.
Die lokal verknüpfte Stammbaum-Anwendung ist ein eigener Projektbereich; sie wird
vom Almanach-Vite-Build selbst nicht neu gebaut.
