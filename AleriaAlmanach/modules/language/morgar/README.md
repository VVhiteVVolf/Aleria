# Morgar 2.1 · Gesprochene Sprache

Die am 13. September 2026 angeforderte Neufassung ersetzt den Wortschatz und
die Namen des Sprachmoduls. Schwerpunkt sind kurze, kräftige, gut getrennte
Sprechsilben und mittelalterliche Lebensbereiche. Zwergische Fantasieklänge und
gälische Klangbilder dienen als gestalterische Anregung; Morgar ist keine
Rekonstruktion einer natürlichen Sprache oder von Tolkiens Khuzdul.

## Inhalt und Seiten

1. Sprachporträt mit kurzen Beispielen.
2. Aussprache, Wortbildung, Satzbau, Anrede und Spielsätze.
3. 500 männliche, 500 weibliche und 100 Unisex-Namen, je A–Z.
4. 30 überlieferte Karnrith-Zeichen sowie 60 Wortstämme und 12 Endungen/Bindewörter.
5. 371 Wörter mit Bedeutung, betonter Sprechgliederung und Gebrauchserklärung.

Beispiele: **Darak** (DA·rak, König/Königin), **Baran** (BA·ran, Vasall),
**Garum** (GA·rum, Heer), **Duna** (DU·na, Burg), **Bera** (BE·ra, Brot),
**Bragen!** (BRA·gen, Greift an!).

Der Wortschatz deckt Gesellschaft, Feudalstand, Recht, Militär, Waffen, Orte,
Handwerk, Handel, Versorgung, Körper/Familie, Natur/Zeit, Handlungen sowie
kleine Satzwörter und Zahlen ab. Die Liste steht im Modul alphabetisch nach
Morgar-Wort; die Quellen-TSV ist nach Lebensbereichen redigiert.

## Quellen und Pflege

- `reference/morgar-words.tsv`: fünf Spalten — Bereich, Wort, Silben, Deutsch,
  Gebrauch. Sprechsilben werden mit `·`, eigenständige Wörter mit Leerzeichen getrennt.
- `reference/morgar-syllables.json`: heutige Wortstämme und Wortbildungsbausteine.
- `reference/morgorn-terminology.json`: angenommene Adelstitel und Klassennamen,
  bisherige Bezeichnungen und unveränderte Klassen-IDs.
- `reference/names-masculine.txt`, `names-feminine.txt`, `names-unisex.txt`:
  ausdrücklich hinterlegte Namen. Leerraum trennt Einträge. Der Build sortiert sie;
  im Browser werden keine Namen zufällig erzeugt oder miteinander kombiniert.
- `morgar-build.mjs`: liest und prüft die Quellen und erzeugt `morgar-data.js`.
- `morgar-tables.js`: überführt die Referenz in bestehende Namens- und Tabellenseiten.
- `morgar-entry.js`: besitzt Sprachporträt, Anleitung und die fünfseitige Gliederung.

`npm run build:languages` erzeugt die Laufzeitdaten. `npm run check:languages`
prüft ihre Aktualität. Die Quellen enthalten genau 371 eindeutige Wörter, 72
Bausteine und insgesamt 1.100 gruppenübergreifend eindeutige Namen. Jede
Namensgruppe enthält alle 26 Anfangsbuchstaben. Der Build prüft diese Grenzen,
Zeichenvorrat, Vokalkerne, lange Konsonantenketten und übereinstimmende
Wort-/Silbenschreibungen. Die Prüfung ersetzt keine klangliche Geschmacksentscheidung.

## Abgrenzung zur Schrift

Karnrith Tiefenrunen 3.000 bleibt unverändert. Alphabet, Zeichenbelegung,
Ligaturen und Altcode-Unterstützung kommen weiter aus dem Fontpaket. Die
historischen Runenmerknamen sind von den heutigen Wortbausteinen getrennt.
Das mitgelieferte Spracharchiv 1.1 bleibt im Fontpaket erhalten; es speist die
aktive Wort- und Namensliste nicht mehr. Die ältere Bild-Schriftprobe ist im
Modul entsprechend bezeichnet. Die frühere Verknüpfung auf das alte Handbuch
als aktuelle Sprachanleitung entfällt.

Das vorhandene Tabellentemplate unterstützt jetzt bis zu 600 Zeilen, damit
der vollständige Wortschatz beim Importieren und Bearbeiten erhalten bleibt.
Normale Texttabellen erhalten passendere Spaltenbreiten. Der Editor bewahrt
auch Spaltenüberschriften, die sein Formular nicht unmittelbar bearbeitet.

## Prüfung

Gezielte Tests prüfen Sprachdaten, vollständige Namensgruppen, Fontabdeckung,
Editor-Erhalt, sichere Darstellung, Rheunwaith und Kommentarfunktionen.
Assetprüfung und Import-/Export-Roundtrip decken alle 31 Modultemplates ab.
Der lokale Browsertest `tests/karnrith.browser.mjs` prüft alle fünf Seiten,
371 Tabellenzeilen, 1.100 sortierte Namen, Mobilansicht sowie die echten
Sprechblasen-Renderer, Sprachwechsel, Entwürfe und Bearbeitungsvorschauen.
Live-Firebase-Schreibvorgänge gehören nicht zu diesem Test.

Die genannten Prüfungen sowie der Vite-Produktionsbuild wurden erfolgreich
ausgeführt. Karnrith/Morgar bestand die Browserprüfung in Quell- und
Produktionsfassung einschließlich mobiler Namens- und Wörtertabellen.
Rheunwaith bestand die erneute Browserprüfung im selben Produktionsbuild.

## Gespeicherte ältere Module

Ein gespeicherter Eintrag in `entryOverrides` ersetzt die mitgelieferte Fassung
vollständig. Deshalb genügte die neue Referenz allein nicht: Ein alter lokaler
oder aus Firebase geladener Morgar-Eintrag konnte weiterhin vier Seiten und
400 Namen anzeigen.

`morgar-migration.js` aktualisiert die identifizierbaren alten Referenzseiten
beim Normalisieren des Eintrags. `module-store/module-entry-migrations.js`
bildet dafür die gemeinsame Schnittstelle zu `normalizeEntryForEditor`.
Damit greifen dieselben Regeln beim Laden, JSON-Import, Bearbeiten und Export.
Die Migration schreibt beim bloßen Lesen nicht nach Firebase; ein regulärer
Speichervorgang übernimmt die aktualisierten Seiten über den vorhandenen Store.

Archivzuordnung, Abmessungen, Sperre, eigener Stempel und externe Titelbilder
bleiben erhalten. Eigene Randnotizen und zusätzliche Seiten werden übernommen.
Die veralteten Wörter- und Namensregister der Zwischenfassung 1.1 entfallen.
Die Kennung `morgar-karnrith`, der bisherige Namensseitentitel und die passenden
Seitentypen begrenzen die Migration. Bereits neue Seiten und Kopien mit eigener
Kennung bleiben unverändert. Eine gespeicherte 2.0-Fassung mit der bisherigen
Schriftprobe als Titelbild erhält zusätzlich das neue Szenenbild; ihre übrigen
Inhalte bleiben erhalten. Später selbst gewählte Titelbilder werden nicht ersetzt.

`tests/fixtures/morgar-v1.module.json` hält den tatsächlichen ursprünglichen
Vier-Seiten-Stand als Regressionstest fest. `tests/morgar-module-store.test.mjs`
prüft lokalen/entfernten Store, Metadatenerhalt und wiederholte Verarbeitung.
`tests/morgar-module-store.browser.mjs` startet einmal mit altem Browser-Cache
und einmal mit einer nachgebildeten Firebase-Lieferung. Beide Wege müssen
sichtbar fünf Seiten, 1.100 Namen und 371 Wörter liefern — auch nach Speichern,
einem später eintreffenden alten Snapshot, Export und Neuladen.

## Angenommene Benennungen in Morgar 2.1

Die am 13. September 2026 angenommenen Titel lauten **Ar Darak, Taldar, Kardar,
Dundar, Nardar**. Die acht Kriegerkasten heißen **Grungar, Varor, Thalor,
Kuralan, Toran, Bragan, Rhean, Falgar**. Elf Neubildungen ergänzen den bisherigen
Wortschatz; Ar Darak und Thalor waren bereits vorhanden. Bei Thalor ergänzt
der Gebrauch die Bedeutung als Kastenname. Die 72 Bausteine und 1.100
Personennamen bleiben erhalten. Die Herleitung von Kuralan über das Schaf
schränkt die bestehende Tierhüterrolle nicht ein; Rhean umfasst weiterhin
Ritter und Geistliche. Die besondere Aussprache RE·an steht im Modul.

Seite II erläutert die fünf Adelstitel und acht Kasten. Weitere feudalsprachliche
Wörter bleiben allgemeiner Wortschatz und bilden keine zusätzlichen Stufen
der morgornischen Gesellschaft. Aufgaben, Rangfolge, Rechte und Klassenregeln
wurden durch die Umbenennung nicht geändert.

`morgar-terminology-migration.js` ergänzt gespeicherte 2.0-Fassungen beim Laden
um den neuen Abschnitt und die elf neuen Wörter. Bestehende eigene Texte,
Namen, Wörter und entfernte Wörter werden dabei respektiert. Doppelte Einträge
werden vermieden; wiederholtes Laden bleibt stabil. Die tatsächliche vorherige
Fassung liegt als `tests/fixtures/morgar-v2.module.json` für Regressionstests vor.

Der Klassenkatalog, die acht `klasse.json`-Quellen, das Klassenregister und der
erzeugte Charakterarchiv-Snapshot verwenden dieselben angenommenen Namen.
Alte Namen bleiben Suchbegriffe beziehungsweise Aliase. Die IDs und Pfade
`karnach`, `haldr`, `zernach`, `wairg`, `dornach`, `skarrach`, `rheach` und
`garnach` bleiben stabil; die Archivprojektion löst alte IDs und Namen auf die
aktuellen Anzeigen auf, ohne Charakterdaten umzuschreiben.

Auf ausdrücklichen Wunsch erscheint der Block „Rang bedeutet Last“ einschließlich
seines Navigationseintrags nicht mehr auf den acht Einzelklassenseiten.
`Klassenordner/Morgorn/kultur.json` steuert dies mit
`classPage.showOrderOverview: false`. Die gemeinsame Vorlage berücksichtigt
diese Einstellung nur für die Einzelklassenseiten; der zentrale Katalog
behält seine einklappbare Gesellschaftsordnung. Andere Kulturen behalten ihr
bisheriges Verhalten.

## Szenenbild auf Seite I

`assets/morgar-hallenrunde-v1.png` zeigt eine morgornische Hallenrunde mit
Lehnsherrin, Krieger und Schmiedin im gewünschten Anime-Stil. Das Original ist
1024 × 1536 Pixel groß (2:3); `imageFit: contain` zeigt es ohne Beschnitt.
Der vollständige Bildprompt und die Herkunft stehen neben dem Bild in
`assets/morgar-hallenrunde-v1.prompt.md`. Der bestehende Build kopiert das Asset
mit den übrigen Moduldateien. Der Store-Browsertest prüft auch, dass das Bild
geladen wird, das Hochformat stimmt und die Darstellung keinen Beschnitt nutzt.
