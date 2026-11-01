# Unabhängiger Frontend- und Quellencheck · 1. November 2026

Prüfumfang: öffentliche Almanachmodule, Quest-/Landing-/Gruppenschnittstellen,
Münzbilder, neue Tafeldatierung und Papierarchiv, Formlingssache, Quellarchive und
statische Veröffentlichungsgrenzen. Keine privaten Dossiers gelesen; keine
Live-Daten geschrieben, keine Migration, kein Commit/Push/Deploy ausgeführt.

## Behobene Befunde

1. **Datierte Tafeln und Questangebot waren nicht verbunden.**
   `questsFromBoard` übernahm alle öffentlichen Blätter ohne Erscheinungsdatum
   oder Archivintervalle. Das bereits abgeschlossene Reisegeleit erschien damit
   weiterhin als neuer Auftrag. Außerdem fehlte bei Katalog und Questseite die
   auf Tafelseiten vorhandene Archiv-Fassade; redaktionelle Archivvorlagen wurden
   dort nicht eingespielt.

   `quest-board-availability.js` projiziert jetzt die Datumsfenster mit den
   vorhandenen reinen Tafel-Kalender-/Archivfunktionen. Der Katalog bewahrt die
   Intervalle; gefiltert wird erst zur Laufzeit nach dem gemeinsamen Weltdatum.
   Eine Rückholung macht das Blatt ab dem Rückholdatum wieder verfügbar.
   Historische Akten bleiben lesbar, auf Landingpages bezeichnet, und vorhandene
   aktive/abgeschlossene Durchläufe bleiben unverändert. Redaktionelle
   Textüberschreibungen verlieren das kanonische Quellenfenster nicht. Ein eigener
   Weltzeitlistener wird beim Unmount beendet. Manuelle/Modulquests bleiben frei;
   keine zusätzliche serverseitige Beitrags- oder Startblockade. Kein neuer
   Firestore-Index erforderlich.

2. **Drei Quest-Navigationslinks führten ins Leere.**
   Karten-/Tafelsidebar und der Tafel-Hero verwiesen auf nicht vorhandene
   `index.html`-Seiten. Sie führen jetzt zu den tatsächlichen zentralen
   `Karten/karte.html` und `Anzeigetafeln/tafel.html`. Die Regression prüft auch
   sämtliche lokalen statischen Questseiten-Links gegen echte Dateien.

3. **Rohquellarchive wären statisch ausgeliefert worden.**
   Nach Prüfung der Laufzeitreferenzen schließt die Veröffentlichungspolicy jetzt
   die exakt abgegrenzten Gawain-/Gruppen-`source/`-Ordner, lokale
   `backups/scenes/` und Münz-Generierungsmetadaten aus. Quellen bleiben im
   Repository. Aktiver Code, Kataloge, neue Münz-WebPs und PNG-Originale bleiben
   öffentlich. Drei neue Policytests prüfen Grenze, Verbraucher und Originale;
   sie gehören zum verpflichtenden `build-policy`-Gate.

## Prüfbelege

| Prüfung | Ergebnis | Beleg |
| --- | --- | --- |
| Vollständige Frontendsuite vor den abschließenden Link-/Archivkorrekturen | 2061/2061 | `full-tests.log` |
| Vollständige Frontendsuite nach sämtlichen eingefrorenen Browserkorrekturen | 2072/2072 aus 284 Testdateien, 0 Fail/Skip, nativer Node-Exitcode 0 | `full-tests-final.log`, `full-tests-final-status.json` |
| Neue Archiv-/Quellfensterfälle, Quest-/Landingnachbarn, aktuelles Aushangpaket, Publication/Buildpolicy | 67/67 | `quest-availability-tests.log` |
| Vollständige Tafeltests plus POI-Brücken nach zentralem Pack-Neubau | 118/118 | `boards-and-poi-tests.log` |
| Release-/Publicationpolicy mit lokalen Git-Fixtures | 36/36 | `publication-policy-tests.log` |
| Drei gezielte Gawain-Builder, ausschließlich `--check` | alle aktuell | `gawain-*-check.log` |
| Öffentliche lokale Referenzen inklusive Formlingssache, Kathedrale, Theater und Trötzli | 111 Runtime-Dateien, 694 Referenzen, keine fehlenden Dateien, Casefehler oder ausgeschlossenen Laufzeitziele | `public-references.json` |
| Formlingssache-Originalporträts und Aushangbilder | 9/9 Manifest-SHA256 und öffentliche Pfade korrekt | `formling-art.json` |
| Zentral neu erzeugter Questkatalog | `--check` aktuell: 15 Akten / 3 Tafeln / 69 Karten / 89 Module | `quest-catalog-check.log` |
| Tatsächliches abgeschlossenes Reisegeleit im Katalog | 08.03 noch nicht ausgehängt, 09.03 verfügbar, ab 10.03 archiviert | `travel-source-window.json` |
| Unverändertes Gameplay aller bisherigen öffentlichen Figuren | 255/255 im Snapshot und in Einzelakten; keine geänderten, zusätzlichen, entfernten oder abweichenden IDs | `gameplay-preservation.json` |

Der Gameplaynachweis reproduziert exakt die vorherige Baseline: SHA-256 über
JSON `{inventory, combatProfile}` mit sortierten Schlüsseln, kompakten
Separatoren und `ensure_ascii=True`, pro kanonischer Figuren-ID. Skript:
`check-gameplay-preservation.py`. Damit ist keine pauschale Aussage über
unbeteiligte Backend-/Produktionsdaten verbunden.

Der zunächst rote Tafelpackvergleich war eine echte veraltete generierte
Notizbuch-/Feder-Definitionsrevision. Root hat das Paket zentral neu erzeugt;
anschließend bestehen sämtliche 118 Tafel-/POI-Fälle.

Der abschließende Gesamtlauf wurde über `run-frontend-tests.py` mit direktem
Unterprozess und zusammengeführtem stdout/stderr protokolliert. Damit ist der
native Exitcode 0 belegt; die absichtlich getestete Offline-Fehlermeldung aus
`module-store-revision.test.mjs` wird nicht von PowerShell zu einem falschen
`NativeCommandError`-Prozessstatus umgedeutet. Dauer: 146,66 Sekunden.

Die öffentlichen Formlingssache-Featurequellen, vier Figurenexporte, das
Bildmanifest und das Rohkapitel tragen keine ausdrückliche private
Dossierkennzeichnung. „Noch nicht veröffentlicht“ in der Feature-README ist
der bisherige redaktionelle Stand, keine private Freigabesonderregel. Das
Rohkapitel liegt in `diagnostics/` und wird nicht statisch ausgeliefert.

## Übergabe an den gemeinsamen Release

Produktquellen sind eingefroren. Root hat den Questkatalog nach dem neuen
Quellfenster-Vertrag zentral erneut erzeugt; dessen `--check` und die tatsächlichen
Reisegeleit-Zeitfenster wurden unabhängig geprüft. Root führt den gemeinsamen
vollständigen Releaseweg inklusive finaler Frontend-/Backendprüfungen und
Produktionsprüfung aus. Das geteilte `quest-model.js` blieb frei von externen
Tafelimports; die Servermechanik-Wurzeln und ihre Verträge wurden hierfür nicht
verändert. Keine parallel laufenden Zentralgeneratoren durch diesen Agenten.

Die bereits dokumentierten Vorschaugrenzen gelten weiterhin: getrennte aktive
und Archivfenster pro Kontext, begrenzte Landingkarten, vollständige Pagination
im zentralen Journal. Die sechs bestehenden kombinierten Quest-Kontextindizes
müssen im gemeinsamen Backendrelease vorhanden und fertig aufgebaut sein;
dieser Frontendcheck hat sie nicht deployt.
