# Roriksheim · neue Karten und Ortsabgleich

Reguläre Karte: `/Karten/karte.html?map=aldrimar-roriksheim`.
Die zugehörige Jarltumsseite ist im Kontinente-Register und auf Aldrimars
Königreichsseite verlinkt. Die frühere Arbeitsansicht `abgleich.html` bleibt
als Quellen- und Entscheidungsbeleg erhalten. Bestehende andere Karten wurden
nicht überschrieben. Es wurde nichts gepusht oder deployt.

## Quellen und Entscheidungen

- Die 187 Einträge der vom Nutzer angegebenen World-Anvil-Karte
  `d1683ef9-7ed0-4c62-9e0b-29b98953865f` wurden einzeln über die verbundene
  Chrome-Erweiterung geöffnet und gelesen: Koordinaten, Titel, vollständiges
  Beschreibungsfeld, vorhandene Verknüpfungsfelder und Original-ID.
- `sources/worldanvil-markers.json` hält diese Quellen getrennt vom Abgleich.
  173 Einträge besitzen Punktkoordinaten, die 14 Gebietsflächen keine einzelnen
  Ortskoordinaten. Für Flächen werden keine erfundenen Punktpositionen verwendet.
- Alle zwölf gelieferten HTML-Dateien sind mit Anhangskennung und SHA-256 unter
  `sources/` unverändert archiviert. Ihre Verzeichnisse liefern alte
  Zugehörigkeitsbelege, keine neue Gestaltung oder verbindliche neue Grenzen.
- Ausschließlich die drei neuen Karten aus dem Downloadordner wurden als
  WebP übernommen. Dateinamen, tatsächliche Maße und Prüfsummen stehen in
  `images.source.json`. Das vom Nutzer ersetzte Zonenbild ist berücksichtigt.
- Nutzerkorrektur: Die gelbe Fläche heißt **Winterfänge** und gehört zu den
  Freiwinter; die grüne Fläche ist **Dämmertal** der Nachtjäger.
- Nutzerbestätigung: Alle drei einzeln rot umringten Brauereien sind
  **Schwarzdorn-Exklaven**, auch innerhalb anderer Herrschaftsgebiete. Maltvik
  und Schwarzhof haben eigene Quellmarker. Der zusätzliche Standort in
  Klangheim heißt auf neueren Nutzerauftrag **Dornquell**. Der Name wurde
  projektweit im textuellen Ortsbestand gesucht und war nicht vergeben;
  er unterscheidet sich auch von Svartstedt, Dornenfeld, Maltvik und Schwarzhof.
  Der Standort erhält keinen fremden Alttext und keine erfundene Quellen-ID.
- Nutzervorgabe: Höllenschreiter, Frostkönigin, Tiefenschrecken und Sturmflut
  werden locker im Meer rund um die Insel Hohenwacht platziert. Ihre vier
  konkreten neuen Wasserpositionen wurden im neuen Normalbild geprüft;
  Quelltexte und IDs bleiben erhalten. Sie sind als `placed` bestätigt.
- Die neue Karte nennt das südwestliche Thanentum **Klangheim**. Die frühere
  Bezeichnung Skaldenheim bleibt in den unveränderten Alttexten nachweisbar.
- Clannamen, vorhandene Wappen, Banner und Aktenlinks stammen aus den
  bestehenden Familienakten. Dunkelhain erhält keinen erfundenen Clan.
- Neuere Nutzerentscheidungen stehen in `transfer-decisions.source.json`:
  Alle fünf alten Tavernen, vier Hornlingsstämme und drei Schlachtenmarker
  entfallen. Der bisherige Tavernenplatz 59b wird ebenfalls nicht übertragen.
  Die 14 alten Gebietsmarker einschließlich „Angrenzendes Gebiet“ gelten als
  bereits im Zonenbild enthalten. Sie erscheinen nur noch im Quellenarchiv.
  Andere Stämme sind von der Hornlingskorrektur nicht betroffen.
- **Gleannmor ist ein Weg**, kein Ort. Seine Quellenkennung bleibt erhalten;
  ohne belegten Wegverlauf wird keine neue Liniengeometrie gezeichnet.
- Die sechs erhaltenen zuvor nicht zugeordneten Altorte verwenden vorhandene
  Kartenplätze. Fjellborg: 45, Roggenweiler: 52, Vindborg: 70, Blutfangturm: 141,
  Wolfsspitze: 152, Thorskirch: 156. Bauform, heutiger Zustand und Zugehörigkeit
  wurden bei Bedarf nach Nutzerauftrag an die neue Karte angepasst. Diese
  Anpassungen werden als bearbeitete Beschreibung vom Original unterschieden.
- **Hornhall** belegt nach der räumlichen Nutzerkorrektur den umgewidmeten
  Standort **137 in Dämmergrund**. Der Ruinenplatz 123 in Dämmertal wird für
  Hjamstad verwendet. Burg Horunn bleibt Sitz der Nachtjäger.
  Nach der neueren Nutzerkorrektur ging Hornhall an **Bjoern Wolfshorn**.
  Hrolf wurde mit seinen beiden ältesten Kindern Ylva und Asgeir sowie seinem
  Bruder **Halvar** ins Exil geschickt. Der Name Halvar wurde ausdrücklich
  bestätigt. Der Clan bleibt in Hornhall unter den Vangandr bestehen; die
  frühere Darstellung eines vollständig vertriebenen Clans ist ersetzt.
  Die Wolfshorn- und Bleiddorn-Akten sind entsprechend korrigiert; Personen-IDs,
  Verwandtschaften und Porträts bleiben erhalten. Liv bleibt als Mutter in der
  Bleiddorn-Abstammung sichtbar, zählt aber nicht zur Exilgruppe.
  Der neue Burgmarker überlagert das alte Ruinensymbol in der Arbeitsansicht;
  die drei gelieferten Bildquellen werden dafür nicht verändert.
  Die Lage im Dämmertal konkretisiert die ältere Angabe Dämmergrund und
  begründet keine neue Lehnspflicht zu den Nachtjägern.
  Wappen und Aktenlinks von Wolfshorn und Vangandr werden gemeinsam gezeigt.

## Koordinaten und Zugehörigkeit

Die alte Bildgröße ist **4096 × 2656**, die neue **4096 × 2734**. Die Quelle
verwendet Pixel ab links unten. Der Suchansatz auf der neuen Karte lautet
`x = Quell-X`, `y = 2734 − Quell-Y`. Alte normierte Prozentwerte werden nicht
wiederverwendet. Der Ansatz dient nur der Kandidatensuche: Die neue Position
stammt vom tatsächlich eingezeichneten Pin der neuen Markerkarte.

165 neue Symbolpositionen wurden durch Vergleich der Normal- und Markerkarte
erfasst. Zwei übereinanderliegende Symbole werden getrennt geführt. Die Symbole
werden den vorhandenen lokalen Aleria-Icons zugeordnet; schwer erkennbare Bilder
wurden im vergrößerten Ausschnitt kontrolliert.
Nach Ausschluss des Tavernenplatzes ergänzen die vier beauftragten See-Wracks
den aktiven Bestand auf insgesamt 168 Positionen.

Die neuen Gebietszuordnungen stammen aus der Zonenkarte und ihren farbigen
Kreisen/Verbindungen. `reviewEnvelopes` sind nachgezeichnete Zuordnungshilfen,
keine veröffentlichten Grenzpolygone. Drei Grenzfälle wurden im vergrößerten
Zonenbild geprüft. Politische Zugehörigkeit und geografische Lage bleiben bei
Exklaven getrennt.

## Verantwortlichkeiten und Schutz bestehender Daten

- `source-markers.json`: normalisierte Quellen mit unverändertem BBCode,
  ausgelesenen Feldern, lesbarem Text und alten Verzeichnisbelegen.
- `new-pins.source.json`: ausschließlich die neuen Positionen und ihre
  Gebietszuordnung; keine automatisch erfundenen Ortsnamen.
- `territories.source.json`: vorhandene Clanverweise und Zuordnungsbelege.
- `transfer-decisions.source.json`: explizite Ausschlüsse, gezielte Belegungen,
  neue lokale Ortskennungen, bearbeitete Beschreibungen und Quellenbegründungen.
- `transfer.generated.json` und `ABGLEICH.md`: erzeugte, prüfbare Vorschläge.
- `review-page.mjs`: regionaler Einstieg; gemeinsame Darstellung und lokale
  Ansichtszustände unter `modules/territory-transfer/`.

Die vier See-Wracks und zehn gezielt bearbeitete Standorte sind als `placed`
gekennzeichnet. Die übrigen Ortsnamen-Vorschläge haben `confirmed: false`.
Alle 153 erhaltenen Altorte haben eine Position; 13 zusätzliche neue
Kartenpositionen, sämtlich im Dunkelhain, bleiben unbenannt.
Die anschließende Nutzerfreigabe zur regulären Übernahme ist in
`import-decisions.source.json` festgehalten: 168 feste Zielzuordnungen werden
mit ihren Quellkennungen übernommen. `markers.source.json`, `places.source.json`
und `territories.import.json` speisen über den vorhandenen gemeinsamen Import
die neue `data.json`. Die 148 Beschreibungen sind mit Ortsart und neuer Lage
abgeglichen; vollständige Originaltexte bleiben separat archiviert. Die 13
unbenannten Orte und sieben alten Marker ohne Fließtext sind gekennzeichnet.
Fünf Zarok-/Grimmlinghinweise bleiben mangels Symbolposition ausschließlich im
Register Dunkelhain. `--write` verweigert jedes Überschreiben einer bereits
bearbeiteten Karte; es gibt keine Cloud-Schreibzugriffe.

Die 15 Seiten verwenden gemeinsame Herrschafts-, Rats-, Haus- und Ortsmodule.
Die Jarltumsübersicht zeigt nach der präzisierten Nutzervorgabe die eigenen
Gebiete von Varulv, Schwarzdorn, Kampfgeborenen, Freiwinter, Brathfengr,
Vangandr und Skaal ausgeführt mit ihren Ortslisten (108 verschiedene Orte).
Die Ortsauswahl stammt über `domainReferences` direkt aus dem eigenen
Register der jeweiligen Gebietsseite. Schwarzacker, Dämmertal und die drei
Klangheimer Unterherrschaften werden erst auf ihren Elternseiten verlinkt;
ihre Ortslisten bleiben dort. Hornhall steht ausschließlich im Register Dämmergrund.

Bei der Erfassung wurde einmal ein Gruppenlink statt des Editorlinks geöffnet;
die Gruppe von Gleannmor wurde unmittelbar auf **Markierungen** zurückgesetzt
und nach erneutem Laden kontrolliert. Anschließend wurden ausschließlich auf
`/marker/<UUID>/edit` endende Links verwendet. Die Editoraktion
„Änderungen speichern“ wurde nie ausgeführt.

## Erzeugen und prüfen

```powershell
node Karten/tools/build-roriksheim-transfer.mjs
node Karten/tools/build-roriksheim-transfer.mjs --check
node Karten/tools/import-roriksheim.mjs
node Kontinente/scripts/build-roriksheim.mjs --check
node --test --experimental-test-isolation=none Karten/tests/roriksheim-transfer.test.mjs Kontinente/tests/roriksheim.test.mjs
```

Der Build prüft IDs, Quellenumfang, lokale Symbole und Bildprüfsummen. Die Tests
prüfen außerdem unveränderte Texte/Koordinaten, Einmaligkeit der Zuordnungen,
die neue Bildhöhe, die drei Exklaven und die Trennung vom Produktionsimport.
Alle elf gezielten Tests bestehen, einschließlich Bjoerns Nachfolge, der
stabilen Weltpersonen-IDs der vier Exilbegleiter und des einmaligen Abgleichs
bereits gespeicherter Akten. Dafür wird die bestehende feldgenaue
Registry-Revisionslogik verwendet; spätere lokale Anmerkungen bleiben erhalten.
Die 1246 allgemeinen
Stammbaumprüfungen melden 13 Fehler in anderen Hausbeständen; die Wolfshorn-,
Bleiddorn- und zugehörigen Migrationsprüfungen bestehen. Das vollständige lokale
Protokoll liegt in `.tmp/roriksheim/family-regression-check.log`.

Direkte Chrome-Prüfung bei 1440, 1024, 768 und 390 Pixeln: keine horizontale
Seitenverbreiterung oder überlaufenden Listen-/Detailbereiche. Suche,
Herrschaftsfilter, leere Suchergebnisse, alle drei neuen Bildebenen, Zoom,
Tastaturauswahl und Öffnen des originalen BBCode-Feldes wurden bedient.
Der Schwarzdorn-Filter zeigt 19 neue Positionen. Nach den neueren Entscheidungen
zeigt „Nach Vorgabe bearbeitet“ 14 Positionen, darunter die vier Wracks.
Die erneute Prüfung der Hornhall-Details bei 1440, 1024, 768 und 390 Pixeln
ergab ebenfalls keine horizontalen Überläufe. Alle drei Heraldikbilder laden
mit gleichmäßigen 64 × 64 Pixel großen Containern. Archivfilter, entfernte
Hornlingsmarker, Gleannmor und Dornquell wurden zusätzlich bedient.
Lokale Prüfprotokolle liegen unter `.tmp/roriksheim/browser-checks.json` und
`corrections-browser-checks.json`; Vorschauen im selben Arbeitsordner.

## Reguläre Übernahme · 20. Oktober

Die aktuelle Karte enthält 168 Marker, 148 Fließtexte und 15
Gebietsdatensätze. Die Ortsbeschreibungen und Herrschaftstexte berücksichtigen
unter anderem Maltviks Lage in Schwerthohn, Bjoernsfurt bei den Sterkr,
Solvårhof und Hjamstad in Dämmertal sowie Hornhall in Dämmergrund. Frühere
Bewohnergeschichten bleiben als Vergangenheit erhalten, wenn das neue Symbol
eine Ruine zeigt; Vågsund und Hirdmannsruh sind wiederbesiedelte Handelsorte.
Die regionale Entscheidungsliste dokumentiert diese Anpassungen.

Die Gebietseinstiege der Unterherrschaften zeigen die vorhandenen Clanwappen. Das alte
Rorikstal-Bild stellt lediglich einen Siedlungspin dar und wird nicht als
heraldisches Banner verwendet. Für Rorikstal, Schwarzdorn und Kampfgeborene
steht ohne belegtes eigenes Banner das vorhandene Jarltumsbanner zur Verfügung;
der Bannerlink führt entsprechend zur Jarltumsseite.

101 einschlägige Prüfungen einschließlich aller bisherigen Grafschaftsimporte
bestehen. Zwei zusätzlich aufgerufene ältere Celtigerns-Familienprüfungen
erwarten noch 13 statt heute 21 bürgerliche Karten beziehungsweise einen
Fontani-Eintrag; ihre Quelldaten und Tests wurden hier nicht geändert.
Protokoll: `.tmp/roriksheim/regular-import-tests.log`.

Die Browserprüfung der bisherigen Ansicht bestätigt die Klickfolge Roriksheim →
Dämmergrund → Dämmertal, Hornhall nur im Dämmergrund-Register und keine horizontalen
Überläufe bei 1024, 768 und 390 px. Die anschließend präzisierte Nutzervorgabe
erweitert die Hauptseite wieder um die sieben eigenen Gebiete mit Ortslisten;
untergeordnete Gebiete bleiben ausgelagert.
Die Ortssuche öffnet Maltvik als Schwarzdorn-Exklave im geografischen Schwerthohn;
Hornhalls Karte nennt Bjoern, Clan Wolfshorn und Vangandr als Lehnsherrn.

Die erneute Browserprüfung der ausgeführten Hauptansicht bestätigt sieben
Gebietsregister mit 7/19/10/15/3/24/30 Orten (zusammen 108, ohne Duplikate).
Hornhall und die Ortslisten der unteren Herrschaften fehlen dort wie beauftragt.
Bei 768 und 390 px gibt es keine horizontale Seitenverbreiterung. Alle 24
gezielten Prüfungen bestehen; Kartenbestand und Ortszuordnungen sind anhand
unveränderter Dateiprüfsummen geschützt. Belege liegen unter
`.tmp/roriksheim/primary-registers-browser-checks.json` und
`roriksheim-primary-registers.jpg`.
