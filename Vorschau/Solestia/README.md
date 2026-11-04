# Solestia · Vorbereitung

Lokale Vorbereitungsseite zum Herzogtum Solestia. Der bestätigte Ursprung
verläuft von den Tarranath über das Fürstentum Grianeach zum Herzogtum.
Der kaiserzeitliche Traditionswandel wird nicht als belegte Annexion oder
wirtschaftlicher Zusammenbruch umgedeutet. Solestia bleibt ein reiches
Handelsland mit spanisch-iberisch geprägter Kriegerkultur.

## Quellen und Karte

Quelle: `C:/Users/fhg_r/Downloads/Länder/Solestia`. Die beiden Karten sind
3605 × 4097 groß und deckungsgleich. Die Regionenkarte zeigt genau zehn
Ortsmarker: eine nördliche Hauptstadt-Raute und neun quadratische Sitze
in neun Baronien. Die normale Landschaftskarte besitzt keine Ortsmarker.
Beide WebP-Karten verwenden deshalb dieselben unveränderten Prozentanker
aus den gemessenen Markern der Regionenkarte.

`scripts/prepare-sources.py` konfiguriert den vorhandenen Shared-Importer.
Das gelieferte Landeswappen `Solestia Wappen.png` liegt byteidentisch unter
`assets/originals/solestia.png` (479 × 483); seine WebP-Vorschau bleibt separat.
Das Original erhält weder Form- noch Alphakorrekturen. Die Großkarten bleiben
als Originale an ihrer Quelle erhalten. `scripts/prepare-map-sources.py`
erstellt die beiden 3604 × 4096 großen WebPs ohne inhaltliche Eingriffe.
Quellen, Prüfsummen und Marker stehen in `assets.source.json` und `sources/`.

`scripts/build-territory-data.mjs` erzeugt die stabilen IDs und Kartenpunkte.
Eine optionale Datei `sources/name-assignments.json` ergänzt zum Abschluss
Namensvorschläge: `{schemaVersion:1,houses:[{houseId,name}],settlements:[{settlementId,name}]}`.
Die zehn Ortsnamen müssen vollständig und eindeutig sein; sichtbare Namen
ändern keine Orts-IDs. Regionsnamen leiten sich von ihren Hauptorten ab.

## Haus- und Sitzmodell

Zwölf Häuser decken die zehn Städte ab: Herzogshaus `house-ducal` sowie
`pool-10` und `pool-11` beginnen in der Hauptstadt `ort-01`. Die Häuser
`pool-01` bis `pool-09` beginnen an den übrigen neun Orten `ort-02` bis
`ort-10`. Herzog und Baronien sind belegt; die zwei zusätzlichen
Hauptstadthäuser sind Hidalgo-Häuser im Ritterfürstenrang. Alle Ausgangssitze
sind im Entwurf beweglich.
Gebietsabschnitte verwenden das jeweilige Ausgangshauswappen statt
zusätzlicher Bannerproduktion.

`house-data.mjs`, `warrior-data.mjs` und `art-data.mjs` gehören zur
Bildproduktion. Sie enthalten nur kompakte Laufzeitdaten. Quellen, Prompts,
Generatororiginale und technische Belege werden nicht von der Oberfläche
geladen. Die fünf Klassen folgen dem Nutzerauftrag: Schwertmeister mit
Degen und Laute, schwerer Ritter mit beidhändig gestütztem Großschwert,
Pikenier mit Pike/Hellebarde und Federhut sowie leichter Mariner mit Degen
und Rückenköcher sowie schwerer Kavallerist mit Lanze auf einem Equo.

## Verantwortlichkeiten

`realm-context.mjs` besitzt Solestias Geschichte; `territory-data.mjs` die
beiden Karten und Gebiete. `proposal-render.mjs`, `art-view.mjs` und
`map-view.mjs` besitzen die örtlichen Sektionen. Die Karten-, Drag-, Import-,
Undo- und Speicherlogik bleibt in `Vorschau/shared/`. `house-placement.mjs`
konfiguriert diese Funktionen und die bereits vorhandene Kartenvariantenwahl.
Der eigene Speicher heißt `aleria:proposal:solestia:placements:v1`.

`art-dialogs.mjs` verwendet den gemeinsamen Modal-Lifecycle und das
gemeinsame Hausdossier. Bei Auswahl aus dem offenen Kartenmodal bleibt
der Fokus in dessen Viewport. Kulturfreie Galeriestyles wurden mit
Freigabe des koordinierenden Agents unverändert nach
`shared/country-workbench/heraldry-gallery.css` extrahiert; Sylvarant nutzt
dieselbe Datei und behält seine örtlichen Dialogregeln. Solestias Styles
bleiben getrennt für Kontext, Karte und Bilder.

Die Vorbereitung schreibt weder Genealogien noch kanonische Register
oder Firebase-Daten. Die spätere Veröffentlichung erfolgt im gemeinsam
freigegebenen öffentlichen Gesamt-Release.

## Fertiger Stand vom 4. November 2026

Zehn Städte und zwölf Hausvorschläge sind benannt und auf der Karte zugeordnet.
Die Hauptstadt Valdoria enthält das Herzogshaus Alveira und die beiden
Hidalgo-Häuser Meroval und Zerain. Die übrigen Ausgangssitze:

| Stadt | Haus | Wappenmotiv |
| --- | --- | --- |
| Ardovela | Belvar | Tanzfächer |
| Orvessa | Urdain | Kastagnetten |
| Pedralba | Olarven | Safrankrokus |
| Belnara | Arzun | Sich aufbäumendes silbernes Hausschwein |
| Neravona | Sorvane | Bemalter Keramikkrug |
| Vilarro | Calderan | Sonnenuhr |
| Ordelva | Navrel | Bota-Weinschlauch |
| Lusendra | Ilarve | Peineta-Kamm |
| Estenara | Vardena | Sporen |

Meroval führt einen Mörser mit Stößel, Zerain einen Hufeisenbogen mit
Azulejo-Muster. Die spanisch-iberischen Kulturmotive ersetzen den frühen
allgemeinen Motivpool. Der ausdrücklich beauftragte schwarze Stier Grianeachs
und der gelieferte moderne Stierkopf bleiben erhalten. Nach Nutzerkorrektur
ersetzt das Hausschwein das frühere Greif-/Steigbügelmotiv; auch Arzuns
Pikenierin trägt nun dieses Wappen. Die aktive Navrel-Figur besitzt einen
eigenständigen geschlossenen Cabasset.

Alle zwölf Häuser haben eine eigene Ganzkörperfigur. Die fünf Klassenprototypen
zeigen Schwertmeister, Ritter, Pikenier, Mariner und berittenen Kavalleristen.
Alle Ritter stützen sich mit beiden Händen auf ihr aufrechtes Großschwert;
Schwertmeister tragen Degen und Rückenlaute, Mariner einen Rückenköcher.
Equo ist die dargestellte Pferderasse der beiden Reiterbilder, keine allgemeine
Behauptung über sämtliche solestischen Pferde.

Die neun Ständetypen besitzen eigene humorvolle Comicbilder nach der ausdrücklich
gewählten Leukonia-Referenz: Sobirà, Conde, Regulo, Hidalgo, Señor, Caballero,
Escudero, Paje und Pechero. Conde ist ausschließlich als hypothetischer, in
Solestia nicht vorhandener Grafenrang erklärt. Die alten Titel erscheinen vor
allem schriftlich; Anreden Don/Doña und Infant/Infanta, Rechte des Señor sowie
die fehlende Leibeigenschaft sind separat erläutert. Es wird kein zusätzlicher
Baron oder unbelegter Lehnsherr der Hauptstadt-Hidalgos erfunden.

## Bilder, Prompts und Prüfung

Alle neuen Bilder entstanden mit dem eingebauten **ImageGen**. Vollständige
Prompts und tatsächlich verwendete Referenzen stehen unter `sources/`:
`additional-emblem-jobs.json`, `ancient-emblem-jobs.json`, `prototypes-jobs.json`,
`house-warriors-*-jobs.json`, die gezielten `*-v2-job.json` und
`estates-{a,b,root}-jobs.json`. Ergebnisdateien und Revisionszuordnungen bewahren
Tooloriginalpfade, Auswahl und Prüfsummen. Frühe Motive und ersetzte Fassungen
bleiben als Quellen erhalten und werden nicht ausgeliefert.

Originale liegen unter `assets/{emblems,warriors,estates}/generated/`, aktive
PNG-Großansichten unter `production/`, WebP-Vorschauen unter `previews/`.
Die genehmigte technische Alpha-Aufbereitung verändert bei Figuren ausschließlich
Transparenz, keine RGB-Werte. Zwölf neue aktive Wappen und 17 aktive Haus-/Klassen-
figuren sowie neun Ständecomics ergeben 38 aktive neue Bilder. Weitere 13
Vorversionen sind erhalten. Das gelieferte Landeswappen bleibt unverändert.

18 Solestia-Tests und acht Sylvarant-Regressionsprüfungen bestanden; nach
der gemeinsamen Stände-Extraktion bestanden zusätzlich die neun betroffenen
Stände-/Publikationsprüfungen für beide Länder. Alle zwölf
aufbereiteten Kreiswappen sind innen deckend und außen transparent. Die
Figurenaufbereitung prüfte 19 Fassungen und neun Comics ohne Fehler; vier
aktive Bilder besitzen enge, aber freie Ränder (6–12 Pixel). Die vollständigen
Silhouetten wurden in neutral hinterlegten Übersichten visuell geprüft.
Belege stehen unter `diagnostics/solestia/`, einschließlich separater
Herkunftsaudits. Die Browser-Sichtprüfung bleibt durch den CUA-Verbindungsfehler
`timeoutMs` eingeschränkt; ein Browser-Pass wird nicht behauptet.

Lokale Ansicht: <http://127.0.0.1:8897/Vorschau/Solestia/>.
Die spätere Nutzerfreigabe für den gemeinsamen Push und Deploy wird erst im
koordinierten Gesamt-Release nach Abschluss der Venalys-Kartenüberarbeitung
ausgeführt.
