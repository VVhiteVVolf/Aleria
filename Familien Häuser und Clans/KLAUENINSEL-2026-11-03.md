# Klaueninsel – Hausseiten und Hausbios vom 3. November 2026

Lokal fertiggestellt. Kein Commit, Push oder Deployment; der aktuelle
Veröffentlichungsstopp bleibt bestehen.

## Umfang und Quellen

37 kanonische Hausakten erhalten eine eigene Hausseite, Hausbio und ihr
bestehendes Stammbaum-Iframe. Die 15 gelieferten Vorlagen ergeben 16 ausführliche
Seiten: Blodyn besitzt zwei heutige Exilzweige in Talgarth und Aberdail. Die
übrigen 21 Familien erhalten Profile aus ihren bereits belegten Registerdaten,
Berufen, Angehörigen und Aufgaben. Dünne Überlieferung bleibt entsprechend kurz.

Die vollständigen alten HTML-Quellen liegen unverändert beim jeweiligen Haus.
Stammbaumabschnitte und Militärstatistiken wurden nicht übernommen. Aktuelle
Haus-IDs, Ränge, Orte, Hierarchien und Personenidentitäten haben Vorrang vor
kopierten oder veralteten Infotabellen. Eigene Hausgeschichte bleibt erhalten;
unklare Datierungen und widersprüchliche Aussagen sind in den jeweiligen
`REDAKTION.md` oder `SOURCE_DECISIONS.md` dokumentiert.

## Kanonische Abgrenzungen

- Die heutigen Diafol-, Dianc-, Arfordir-, Dyfrgi-, Walwrs- und Blodyn-Akten
  bleiben von ihren sechs Vennyr-Ursprungsakten getrennt. Historische Figuren
  verlinken, soweit eindeutig belegt, auf die jeweilige echte Ursprungsakte.
- Die stabile Haus-ID `haus-cwningod` bleibt erhalten, ebenso
  `haus-morthwyll`. Anzeigenamen und überlieferte Schreibweisen werden nicht
  als Anlass für neue oder umbenannte Familien verwendet.
- Fünf Familien ohne belegten Hausrang bleiben ausdrücklich „Offen“. Ddraenen
  bleibt bürgerlich; Iestyns persönliche Ritterwürde ist kein Adelstitel für die
  gesamte Familie. Morlan und Morglan sind verschiedene Familien.
- Llafnfor steht als Gefolgsfamilie der Dyfrgi in Krallenspitze. Caer Cryftlawd
  ist hier die vorhandene Dienst- und Registerzuordnung, kein neu behaupteter
  eigener Familiensitz. Die neue örtliche Wappenkarte nennt deshalb keinen Sitz.
- Rhun Penrys belegtes Vogtamt bei Arth ist mit seiner realen Person in
  `haus-penry` verbunden. Ein unbekanntes Portrait bleibt eine Silhouette.
- Ard Follmhar bleibt eine dünn belegte antike Akte mit offenem Rang. Die
  Zerstörung Ard Dunraths wird nicht als Beweis für das Ende sämtlicher
  Familienlinien verwendet. Unbekannte Gründer bleiben unverändert.

21 kleinere Hausquellen verwenden die vorhandene Vorbereitungsfabrik. Diese
unterstützt nun auch den ausdrücklich unbekannten Rang, ohne Ritter- oder
Bürgerstand abzuleiten. Die bekannten Familiengeschichten und Berufe werden
redaktionell ergänzt; genealogische Gerüste liefern keine erfundenen
Gründungsdaten oder Amtsfolgen. 37 belegte Angehörigenkarten verwenden ihre
vorhandenen Identitäten und Portraits.

## Darstellungen

15 unterschiedliche vorhandene Originalfiguren bleiben unverändert. Die beiden
Blodyn-Zweige verwenden bewusst dasselbe überlieferte Original, insgesamt also
16 Originalzuordnungen. Für die übrigen 21 Familien wurden neue Figuren mit
built-in ImageGen erstellt: fünf Ritter und 16 Berufs- oder Alltagsfiguren.

Die freigegebene matte Figurenreferenz und jedes tatsächliche Familienwappen
wurden vor der Generierung angesehen und als Bildreferenzen verwendet.
Rüstungen und Helme der fünf Ritter berücksichtigen maritime Beweglichkeit,
Hausfarben und Wappen; nur Dyger führt einen kleinen Schild. Bürgerliche
erhalten belegte Berufs- oder einfache Alltagskleidung. Die Darstellungen
behaupten keine zusätzlichen namentlichen Identitäten, Ränge oder mechanischen
Ausrüstungsdatensätze. Produktions-PNGs behalten ihren ursprünglichen Alphakanal.

Prompts, Referenzen, ursprüngliche ImageGen-Ausgabepfade und Prüfsummen liegen
jeweils in `assets/image-generation.json`; die ausgewählten Dateien liegen
unmittelbar beim zugehörigen Haus. Das vollständige Kontaktblatt, Promptset und
die Transparenzbelege stehen unter
`diagnostics/klaueninsel-house-pages-20261103/`.

## Integration und Prüfung

Der gemeinsame Hauscontent-Build erzeugt `haus.data.js`, `haus.biography.mjs`
und die bestehenden Register. 55 direkte Hausseitenlinks verbinden die 14
Gebietsseiten. Die vorhandene territoriale Auswahl bleibt erhalten; Llafnfor
ergänzt ausschließlich die eigene Dyfrgi-Unterseite in Krallenspitze. Es
entsteht kein neuer Herrschafts- oder Ortsreiter.

Die Galerie wird ausdrücklich auf diese 37 Häuser begrenzt abgeglichen und
enthält 36 unterschiedliche Motive für ihre 37 Hauszuordnungen. Ein zusätzlich
parallel wiedergefundenes Grianlaoch-Original wurde separat mit seiner
kanonischen Galeriezuordnung abgeglichen; die frühere erzeugte Ergänzung bleibt
als nicht ausgeliefertes Quellenbild erhalten.

Alle 37 örtlichen Familiengraphen und sechs Vennyr-Ursprungsgraphen sind
gegenüber ihren gesicherten Fingerprints unverändert. Geprüft werden außerdem
gültige Personen- und Bildpfade, korrekte Iframes und Rücklinks, der Erhalt
eigener Bio-Bearbeitungen und Löschungen, unveränderte fremde Galerieeinträge,
Originalarchive, offene Ränge und das Weglassen der Militärstatistiken.
Hauscontent- und Galerieausgaben werden zusätzlich auf Aktualität geprüft.

73 gezielte Tests bestanden: 13 Klaueninsel-Hausprüfungen, sieben bestehende
Cwingod-Prüfungen, sieben Klaueninsel-Gebietsprüfungen, zwölf Galerieprüfungen,
elf Sonnenküsten-, acht Silberinsel-, sieben Milane- und acht
Veröffentlichungsgrenzen-Prüfungen. Das ältere Portrait-Testfixture wurde auf
seinen ursprünglichen Revisionsstand begrenzt, damit spätere berechtigte
Titelkorrekturen und Hausbio-Revisionen seine isolierte Portraitprüfung nicht
verändern; alle Schutz- und Idempotenzassertionen bleiben erhalten.

Cwingods frühere lange Projektbio wird ausschließlich über ihren exakt erkannten
Default-Fingerprint durch die neue Kurzfassung ersetzt. Die alte pauschale
Verwaltung des Bio-Feldes ist entfernt; eigene überarbeitete Fassungen,
Kommentare und ausdrückliche Löschungen bleiben erhalten. Ein gesonderter
Regressionstest prüft den echten archivierten Altstandard und seine bearbeitete
Variante. Die bestehenden Familienpersonen und Beziehungen bleiben unangetastet.

Browserbeleg: Arth lädt mit Originalbild und vorhandenem Stammbaum; Beryns neue
Figur und neue Hausbio laden einschließlich belegtem Oberhaupt und bestehenden
Familienbezügen. Die mobile Ansicht bei 390 Pixeln zeigt die vollständige Figur
ohne seitlichen Seitenüberlauf. Quellenarchive und Diagnosematerial bleiben
außerhalb der statischen Auslieferung, aktive Bilder und Daten bleiben erhalten.
