# Heldenwacht – Übernahme vom 22. Oktober 2026

Das heutige Jarltum Heldenwacht heißt im Altbestand **Kronental**. Bestehende Familienordner, Personenkennungen und Lebensdaten wurden erhalten. Die drei aktuellen Karten aus dem Downloadordner bestimmen Positionen, Ortszustand und räumliche Zugehörigkeit. Alte HTML-Tabellen wurden ausschließlich als Datenquellen verwendet.

## Bestand und Quellen

- World-Anvil-Karte `c0b4518d-2f9a-4e76-ab2d-a14818034d53`: **147 Einträge vollständig über die verbundene Chrome-Erweiterung gelesen**, einschließlich Beschreibungsfeld, Koordinaten und Verknüpfungsfeldern. Keine Änderung an World Anvil.
- **130 übernommene Ortsmarker** behalten ihre World-Anvil-ID und ihre ursprünglichen Koordinaten als Quellenkennung.
- **17 neue Kartenzeichen** erhalten lokale Kennungen, eigene Namen und im Nutzerauftrag ausgearbeitete Beschreibungen. Keine erfundenen World-Anvil-IDs.
- **16 Landschafts- und Gebietseinträge** werden nicht zu zusätzlichen Siedlungspins. Ihre vollständigen Originaltexte bleiben archiviert; ihre Angaben sind in die zuständigen Gebietsseiten eingeflossen.
- **Heldenfeld – Turnierplatz** bleibt mit vollständigem Text im städtischen Artikel erhalten. Auf der neuen Karte fehlt ein eigenes Turnierzeichen; dafür wurde keine Position erfunden.
- Ergebnis: **147 Pins, 138 Beschreibungen, 16 Gebietsseiten**. Jeder Pin steht genau einmal im eigenen Ortsregister seiner verantwortlichen Seite. Übergeordnete Seiten zeigen nur ausdrücklich ausgewählte Hauptregister.
- Neun HTML-Anhänge und drei aktuelle Karten mit SHA-256-Nachweisen: `sources/attachments.json`, `images.source.json`. Der unvollständige Frostzorn-Bandenvordruck bleibt archiviert; seine Platzhalter und falsche Eisbrand-Zuordnung wurden nicht als Tatsachen übernommen.

## Koordinaten und Zeichen

Alle drei gelieferten Bilder messen **4096 × 3446 Pixel**. World Anvil verwendet hier Pixelkoordinaten mit Ursprung unten links. Die Originalwerte bleiben unverändert in `sourceRef.coordinates`. Die neuen Zielspitzen stammen aus der gelieferten Markerkarte mit Ursprung oben links; gespeichert wird `x = X / 4096`, `y = Y / 3446`.

Fünf zusammenhängende Bildkomponenten enthielten überlappende Nachbarpins. Diese wurden einzeln geprüft und in sieben zusätzliche Einzelpositionen getrennt: drei Riff-Ruinen; Guldsjø/Dødrift; Huldrehamn/Frostlicht; Vargmótvakt/Taverne/Siggstatt; Gravvakt/Galdrkirk. Insgesamt wurden **146 einzelne Zeichen** zugeordnet. Die manuellen Spitzen und Begründungen stehen in `positions.source.json`; die verschobenen Zielwerte werden nicht als exakte alte World-Anvil-Werte ausgegeben.

Vigfinnstad bleibt zusätzlich an seinem alten Hofplatz erhalten: Die Regionskarte umringt ihn ausdrücklich weiß als unmittelbares Kleinlehen, obwohl die Markerkarte dort keinen Pin enthält. Der vorhandene World-Anvil-Eintrag belegt Name, Viehhaltung und Position 637:2159. Zusammen mit den **146 Zeichen der Markerkarte** ergibt das **147 Positionen**. Das neue Waldzeichen der Eisenbieger ist der eigenständige Ort **Kohlenrain**. Das Abtrünnigenlager verwendet die Kategorie **Heerlager** und das passende aktuelle Symbol. Die beiden weiterhin eingezeichneten Schiffe bei Wellenruh bleiben historische Seeschlachten. Die Markerkarte ist eine zusätzlich wählbare Ebene; sie wird nicht gleichzeitig unter den dynamischen Pins eingeblendet. Standardgrößen: **Dot 80, Schrift 50**.

## Herrschaft und Verschachtelung

Die königlichen Vaeren-Verantwortungen sind getrennt: **König → Jarl von Heldenwacht → Thane des Tals der Helden → Hesir der Stadt Heldenwacht und ihres Bannkreises**. Höhere Autorität bleibt erhalten; der König entscheidet letztlich. Die delegierten Vaeren-Titel fallen beim Tod an den König zur Neuvergabe zurück und werden nicht automatisch vererbt. Grundlage: Nutzerkorrektur; strukturiert festgehalten in `Kontinente/modules/heldenwacht/authority.source.json`.

**Skjor Vaeren** führt den eigenen Jarlsrat. Der Königsrat wurde nicht als Jarlsrat kopiert. Für Thane und Stadt-Hesir sind keine Namen festgelegt; beide Ämter erscheinen entsprechend offen. Die aktuelle Familienakte ersetzt den im Altartikel genannten verstorbenen Gründer Asgeir durch **Arnthor Sturmgeborener**, Oberhaupt seit 1720. Weitere Namensabgleiche und unveränderte offene Ämter stehen in `sources/council-reconciliation.json`.

Auf der Jarltumsseite sind das königliche Kernland und die großen Clan-Ortsverbände ausgebreitet. **Unmittelbare Kleinlehen** sind über das Tal der Helden erreichbar; Spindelheim hat darin seine eigene Seite. Die zwei äußeren Insel-Kleinlehen erscheinen erst unter den **Klageschild-Inseln**. Keine Zusammenfassung sämtlicher Unterherrschaften zu einer flachen Hauptliste.

Spindelheim gehört **Spindelschlag direkt unter den Vaeren**. Der belegte Thengr-Status ohne ausgestellten Adelsbrief bleibt erhalten; die Kartensammelbezeichnung „Niedere Huskarlhäuser“ adelt sie nicht stillschweigend. Andere örtliche Clans werden noch nicht eingesetzt. Skymar und Myrhamn sind heute wieder intakte königliche Hafenorte; ihre Grimr- und Pirateriegeschichte bleibt erhalten. Varangrs Anwesen, Eibenschilds Vagaborg und die Gildensitze behalten ihre tatsächlichen Wappen und Zugehörigkeiten.

## Torrenwacht und Piraten

Die alte Torrenhall-Beschreibung bestätigt **Holmr → Skaife → Grimr**. Die neue Fassung ergänzt die Nutzerangaben: Erlöschen der Holmr und Übergang zu Skaife, Skaife im Bürgerkrieg, danach Grimr; vorheriger Grimr-Besitz Skymar/Myrhamn, Verbannung, Verarmung, Piraterie und die eskalierte Blutbund-Unterwerfung mit Auslöschung des Clans. Keine unbelegten Jahreszahlen oder neuen Abstammungen ergänzt.

Torrenwacht ist **vakant** und Pufferzone zum nördlichen **Fjordheim, früher Vennyr**. Torrenheim bleibt Banditen- und Piratenruine. **Havfrbolg** steht als strategische Festung unter der Krone; **Isvakt** wird zum Flottenstützpunkt ausgebaut und bleibt bis zum abgeschlossenen Aufbau als Ruinenplatz erkennbar. Die alte Überlegung einer Vergabe an Spindelschlag ist keine aktuelle Herrschaftszuweisung.

Das **Piratentum Sirenen-Zahn-Riff** besitzt eine eigene Seite. Frostzorn wird als nach dem Bürgerkrieg abgespaltener, mit Frostauge zerstrittener Clan geführt. Sein tatsächliches Piratengebiet ist kein anerkanntes Lehen. Das vorhandene Clanoberhaupt **Vorn Frostzorn** ist aus der Familienakte übernommen. Riffhort ist ein neu benanntes Lager; die verfallenen Siedlungen werden nicht als unzerstörte Hafenstädte beschrieben.

## Pachten und neue Inselorte

**Galmars Erlass** gestattet Goldglanz Brauerei und Schwarzdorn Brauerei jeweils **genau eine Pacht im Jarltum**. **Hopfengut → Schwarzdorn**, der neue nördliche Standort **Malzhain → Goldglanz**. Die alte Sigurd- und gemeinsame Ertragsregelung wurde ersetzt. Es entsteht kein weiteres Schwarzdorn- oder Goldglanz-Hesirentum in Heldenwacht.

**Sundkrone** und **Lothirblick** liegen auf den äußeren südöstlichen Inseln an der Handelsroute nach Lothir. Ihre **zwei noch unbenannten Huskarlclans dienen Wellenschild** und führen eine gewöhnlich unblutige Fehde. Keine Clan-Namen oder Wappen erfunden. Eibenschild bleibt davon getrennt in Vagaborg.

Die 17 neuen Ortsnamen wurden gegen die vorhandenen Aldrimar-Karten geprüft. Auch der ältere allgemeine Lagername wurde zu **Abtrünnigenlager Wellenklang** präzisiert, damit er vom gleichnamigen Lager Ivarsheims unterscheidbar bleibt. Vintrefjord und Vagaborg folgen den kanonischen Familienakten. Ursprüngliche Namen bleiben in den Quellenkennungen erhalten.

## Noch offene Angaben

Im World-Anvil-Original fehlt der Text für **Rûnstorm, Sjødrakkr, Móðurgaldr, Eisklaue, Nebelbraut, Blutiger Kiel, Heljaskip, Vargsblod** sowie **Tunglvakt**. Die neun Lücken sind in den Pin-Angaben und in `import-decisions.source.json` markiert. Sie wurden nicht mit erfundenen alten Texten gefüllt. Die unbekannten örtlichen Clans, Thane und Stadt-Hesir bleiben offen.

## Prüfung

`Kontinente/tests/heldenwacht.test.mjs` prüft Quellenbilanz, Original- und Zielkoordinaten, Heraldik, Ortsarten, königliche Delegation, Torrenwacht, Pachtgrenzen, Verschachtelung, Namenseindeutigkeit, Texte und Schutz gegen erneutes Überschreiben. Gemeinsame Builder und Importprüfungen bleiben wiederverwendbar. Bestehende 30 Karten-Snapshots wurden während dieses Auftrags byteweise geschützt; Personenakten und Live-Daten wurden nicht geändert. Browsernachweise und Prüfprotokolle liegen unter `diagnostics/heldenwacht-2026-10-22/`.

Kein Push, kein Deployment, keine World-Anvil-Änderung.
