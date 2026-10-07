# Windreiter und ihre Unterverbände

Die Registrierung verwendet den vorhandenen Archivbaum:

```text
Söldner
├─ Windreiter                         Kategorie
│  ├─ Die Windreiter                  Modul, 11 Seiten
│  └─ Schwarzfische                   Kategorie
│     ├─ Die Schwarzen Fische         bestehendes Modul, 4 Seiten
│     └─ spätere Banden               jeweils Kategorie + eigenes Modul
│        └─ spätere kleinere Verbände beliebig weiter verschachtelbar
└─ Drakenschluck Söldner              Kategorie
   └─ Drakenschluck Söldner           bestehendes Modul, unveränderte ID
```

Die genannten späteren Verbände sind keine leeren Platzhaltermodule. Sie werden
mit ihren Inhalten und einem längeren `path` ergänzt. Der vorhandene
Kategorienmanager kann weitere Ebenen anlegen. Das vorhandene Modul
`schwarzfische-windreiter` wird verschoben; Cynwrig, seine Gefährten, die
Standorte, alle vier Seiten und die Kommentarzuordnung bleiben erhalten.

## Seitenplan

| Seite | Inhalt | Vorlage |
| --- | --- | --- |
| I | Einführung und Schutzauftrag | Story mit Anime-Szene |
| II | Herkunft, Wesen und Beziehungen | Gildenbio |
| III | Hintergrund in Aislearneach | Story für längere Texte |
| IV | Fünf Dienstleistungen, Auftraggeber, Umfang und Bedingungen | Neues Service-Template |
| V | Bürokratie und Verwaltungsaufgaben | Hierarchie mit zwei Reitern |
| VI | Führungsränge, Champions und Haudegen | Hierarchie mit drei Reitern |
| VII | Klassische Kriegerränge | Hierarchie |
| VIII | Feste Standorte und wandernde Banner | Story mit Anime-Szene |
| IX | Hauptbanner und regionale Banden | Hierarchie mit fünf Reitern |
| X | Regulärer Windreiter mit geschlossenem Helm | Story mit RPG-Kriegerillustration |
| XI | Ehre, Pflicht und Sold | Story |

## Quellen und Ergänzungen

`sources/windreiter.html` bewahrt die Nutzervorlage vom 7. Oktober 2026 bytegetreu.
`sources/windreiter.json` enthält ihre 38 gehaltvollen Textblöcke sowie Herkunft
und Prüfsummen der 17 lokal übernommenen Wappen. Wiederholte namenlose
Porträtplatzhalter, leere Tabellenfelder und erfundene Jahreszahlen werden nicht
in das Modul übernommen.

Die Quelle nennt fünf Hauptbanner: Schwarzfische/Estryll, Windkriecher/Lothir,
Schattenhunde/Tirnara, Nagerlegion/Aldervan Nord, Blutadler/Aldervan Süd. Sundara
ist im Original gestrichen. Die Aldervan-Banden werden ohne unbelegte Zuweisung
zu Nord oder Süd geführt. `Nagerlegio n` wird als `Nagerlegion` normalisiert.

Die regulären Ränge waren leer. **Rekrut → Windreiter → Beschützer → Veteran**
ist deshalb ausdrücklich als ergänzender Rangentwurf gekennzeichnet. Beschützer
und das Wahlrecht ab diesem Rang sind belegt. Haudegen bleibt der Sonderrang
ehemaliger Führung. Die unklare Formulierung zum Wahlgang wird im Quelltext
erhalten und nicht in eine neue Wahlordnung umgedeutet. Die Aufgaben der
Verwaltung und die Vertragsbedingungen sind erläuternde Ausarbeitungen; es
werden keine Preise, Personenbesetzungen oder Kampfwerte festgelegt.

## Zuständigkeiten

- `windreiter-model.mjs`: Module, Storytexte, Gildenbio und konkrete Service-Daten.
- `windreiter-hierarchy.mjs`: Gildenordnung und Bannerregister.
- `../guild-services/`: wiederverwendbare Service-Vorlage mit eigenem Sanitizer,
  Renderer, CSS und gemeinsamem Editor für Voll- und Inline-Bearbeitung.
- `../archive/archive-section-registration.mjs`: gemeinsame Registrierung zur
  Buildzeit; beliebige Pfadtiefe, stabile IDs, bestehende Inhalte bleiben erhalten.
- `../../scripts/build-windreiter.mjs`: erzeugt `windreiter-data.js`.

Der bestehende Schwarzfische-Inhalt bleibt in `data/sections.js`. Die Registrierung
referenziert nur seine ID und legt keine zweite Fassung an. Seine vier bisherigen
Illustrationen und sein Wappen sind unverändert lokal gespeichert; ihre Herkunft
und Prüfsummen stehen in `sources/schwarzfische-images.json`.

Bestehende redaktionelle Überschreibungen und ausdrücklich gespeicherte
Benutzerverschiebungen bleiben beim Modul-Store. Die Umordnung greift auf die
eingebauten Kategorien; sie führt keine Firebase-Migration aus.

## Bilder und Prüfung

`image-prompts.json` dokumentiert die acht Bilder der integrierten Bildgenerierung
mit vollständigen Prompts und Originalpfaden. Enddateien liegen unter
`public/assets/windreiter/`: fünf quadratische Service-Icons mit geprüftem echtem
PNG-Alphakanal, zwei Anime-Szenen in 2:3 und eine Aquarell-/Gouache-/Tuschefigur
in 2:3. Vorhandene Gildenwappen bestimmen Farben und Motive.

```sh
npm run build:windreiter
npm run check:windreiter
npm run test:windreiter
npm run check:house-retinues
npm run check:templates
```

Am 7. Oktober 2026 bestanden 23 gezielte Tests und die Prüfung aller 32
Template-Verträge samt JSON-Rücklauf. Der isolierte lokale Browserdurchlauf
prüfte 50 Seitenansichten bei 1600 und 390 Pixeln, die Kategoriennavigation,
sämtliche Hierarchiereiter, Bildladung, Textüberlauf, vollständigen Editor-Rücklauf
sowie Hinzufügen, Bearbeiten, Vorschau und Entfernen von Servicezeilen in beiden
Editoren. Keine JavaScript-Fehler oder fehlenden lokalen Bilder. Externe Dienste
waren während dieses Durchlaufs blockiert; es wurden keine Online-Daten geändert.
