# Silberinsel: Hausseiten, Bios und Darstellungen

Stand: 3. November 2026. Lokal ergänzt und geprüft; noch nicht veröffentlicht.

Alle 18 vorhandenen Silberinsel-Akten besitzen nun eine Hausseite, eine Hausbio
und eine zugeordnete Darstellung. Die bestehenden Hausseiten-/Bio-Adapter,
Stammbaum-Anwendung und Galerie bleiben die zuständigen Systeme.

## Sieben gelieferte Hausvorlagen

Neidr, Saith, Crefyddol, Canwyll, Tiwna, Pyrth und Tir An Muirghin erhalten
ausführliche Kapitel und redaktionell gekürzte Bios mit 319–361 Wörtern. Alle
sieben passenden Originaldarstellungen werden unverändert verwendet. Pyrths
geliefertes Herrschaftsbanner ist ebenfalls lokal gesichert. Je Haus liegen
die unveränderte Original-HTML, Bildherkunft, Prüfsummen und Quellenentscheidungen
im eigenen Hausordner unter `Estryll/Cenyr/Silberinsel/`.

Die gelieferten genealogischen Abschnitte wurden vollständig von der Übernahme
ausgeschlossen. Alle 18 Seiten verwenden ausschließlich das Iframe der bereits
vorhandenen Familienakte mit stabiler ID und `mode=view`. Personen,
Partnerschaften, Abstammungen, Häuser, Nebenlinien und Zeitsprünge stimmen für
alle 18 Akten mit den vor der Arbeit gesicherten Graph-Prüfsummen überein.

Militärstatistiken wurden aus Infotabellen und Fließtext vollständig ausgelassen.
Die Militärgruppe bleibt ausgeblendet. Belegte Rüstungstraditionen und
historische Ereignisse bleiben davon getrennt erhalten.

## Aktueller Kanon vor widersprüchlichen Altangaben

- Neidr: Yvain als aktuelles Oberhaupt; Llanvane und Silberbucht statt alter
  Stadt- und Baronstitel. Die Viper-Krise bleibt als ältere Hausüberlieferung
  erhalten, ohne heutiges Embargo oder aktuelle Beschlagnahmungen zu behaupten.
- Crefyddol: bestehende Schreibweise und Haus-ID bleiben maßgeblich. Kopierte
  Saith-Gründerangaben werden durch die belegte Herkunft um Llwyarch ersetzt.
  Bestehende Personen-IDs und Portraitdateien mit älteren Schreibweisen bleiben
  unverändert verlinkt.
- Canwyll: Ritterfürstenhaus. Die bestätigten Herrschaftsquellen ergänzen die
  Hausvorlage; unbekannte Besitzgrenzen werden nicht hinzugefügt.
- Tiwna: Baronenhaus mit Sitz Eiddon in Silberküste. Pyrth bleibt
  Ritterfürstenhaus mit Sitz Caer Clwyd; Roderic ist der kanonische Gründer.
- Tir An Muirghin: Die alte Tabelle sagt „ausgestorben“, die aktuellen
  Ortsquellen belegen jedoch das fortlebende Erbe an der Sonnenküste. Deshalb
  bleibt `extinct: false`. Verlust der früheren Herrschaft in Ard Iasgleann,
  nahezu erfolgte Vernichtung und fortlebende Linien werden getrennt beschrieben.
  Registerpfad und Genealogie werden dafür nicht verändert.

Offene Hofämter verwenden Silhouetten. Nur sicher vorhandene Personen erhalten
Links; aus Amtszeiten werden keine Lebensdaten oder neuen Beziehungen abgeleitet.

## Elf neue Figuren und vorbereitete Seiten

Ferlan, Argyllan, Delvor, Corant, Faelcaran, Llyncar, Maredwyn, Morfynn, Selaeth,
Arven und Brithfaen erhalten knappe vorbereitete Hausseiten und Bios aus ihren
belegten Registerdaten. Hausgeschichte, Familienberufe, Gründer und Amtsinhaber
werden nicht erfunden.

Die elf neuen Figuren wurden mit dem eingebauten ImageGen im freigegebenen
matten Figurenstil erzeugt. Hauswappen bestimmen die Motive, die rauen Küsten,
Gebirge und kühle Witterung der Silberinsel die gestalterische Ausrüstung.
Kettenhemd, Brigantine, Lamellen, gepolsterte Kleidung und einzelne Plattenstücke
wechseln sich ab. Die Helmformen reichen von Barbute und Nasalhelm über Eisenhut
und Haube bis zu Schaller, Armet und Burgonet. Sieben der zehn Ritter tragen
keinen Schild. Brithfaen zeigt einen unbenannten Bürger ohne festgelegten Beruf.
Die Bilder begründen keine zusätzlichen kanonischen Personen, Berufe oder Klassen.

Die Erstübernahme knapper Registerakten verwendet den eigenen fachlichen
Authoring-Adapter `modules/house-content/prepared-house-content.mjs`. Die daraus
erstellten Hausquellen bleiben einzeln redigierbar; die Website benötigt den
Authoring-Adapter nicht.

## Verknüpfungen, Archiv und Prüfung

24 vorhandene Hauskarten in sechs Grafschafts-/Herrschaftsquellen öffnen die
passenden Hausseiten direkt. Die bisherige territoriale Auswahl bleibt erhalten.
Die Galerie wurde mit dem bestehenden begrenzten Build für genau die 18
Silberinsel-Haus-IDs aktualisiert. Parallele Arbeitsstände werden erhalten;
alle 977 vor Arbeitsbeginn vorhandenen Bilddatensätze sind unverändert vorhanden.

Original-HTMLs, Manifeste, Prompts und die verworfene Delvor-Erstfassung bleiben
Arbeitsquellen außerhalb des statischen Auslieferungspakets. Aktive Bilder,
Hausseitendaten, Bios und Stammbaumziele bleiben auslieferbar. Es erfolgten keine
Firebase-Schreibzugriffe und keine Veröffentlichung.

Geprüft: 8 neue Silberinsel-Integrationstests, 7 bestehende Tal-Hausseitentests,
6 Silberinsel-Gebietstests, 9 begrenzte Galerie-Tests und 4 Publikationsprüfungen.
Alle 34 Tests bestehen. Hausseiten- und Galerie-Build sind aktuell. Elf aktive
2:3-PNGs mit Alphakanal wurden geprüft und als Übersicht tatsächlich angesehen.
Browserprüfungen umfassen Neidrs tatsächlich geladenen Stammbaum und Hausbio,
Delvors neue Darstellung bei 390 Pixeln sowie die direkten Grafschaftslinks.

Belege und vollständige Bildprompts liegen unter
`diagnostics/silberinsel-house-pages-20261103/`. `before.json` bewahrt den
Ausgangsbestand, `delivery.json` benennt aktive Quellen und Bilder,
`verification.json` den Graph- und Bildabgleich. Die Einmal-Skripte sollen spätere
Hausredaktion nicht überschreiben.

```powershell
node "Familien Häuser und Clans/scripts/build-house-content.mjs" --check
node "Familien Häuser und Clans/tests/silberinsel-house-pages.test.mjs"
node Gallerien/krieger/scripts/build-catalog.mjs --houses=haus-neidr,haus-saith,haus-crefyddol,haus-canwyll,haus-pyrth,haus-tiwna,haus-ferlan,haus-argyllan,haus-delvor,haus-corant,haus-faelcaran,haus-llyncar,haus-maredwyn,haus-morfynn,haus-selaeth,haus-arven,haus-brithfaen,haus-tir-an-muirghin --check
```
