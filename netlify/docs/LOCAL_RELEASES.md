# Geprüfte lokale Releases

Der lokale Releaseweg vermeidet Netlifys großen Server-Checkout. Git-Historie,
Website-URLs, Functions und Hosting bleiben erhalten. Firebase hat weiterhin
seinen eigenen Releaseprozess. Keine neuen Backup-Branches oder ZIP-Uploads.

## Standardablauf

1. Änderungen prüfen und gezielt committen. Der letzte Commit des lokalen
   Release-Pushs enthält **`[skip netlify]`**. Beispiel:
   `git commit -m "Improve country pages [skip netlify]"`.
   Bereits gepushte Commits nicht umschreiben; bei Bedarf einen neuen leeren
   Release-Commit erstellen.
2. `node netlify/release/release.mjs --publish --push` aufrufen.
3. Der Befehl prüft den Stand anhand der bisherigen Fachprüfungen und baut eine
   unveränderliche Momentaufnahme aus Git-Blobs. Ein bereits vorbereitetes Paket
   desselben Commits kann nach vollständiger Inhaltsprüfung wiederverwendet
   werden. Nur die drei ausdrücklich deklarierten erzeugten Kataloge und der
   echte Prüfbeleg werden ergänzt.
4. Erst danach erfolgt ein normaler Push auf `origin/master`, ohne Force-Push
   oder automatisches Vormerken fremder Änderungen. Netlify erhält das Paket
   und die sechs separat gebündelten Functions.
5. Anschließend werden der tatsächlich aktive Produktivdeploy, sein öffentlicher
   Commit-Beleg, sämtliche Paket-Prüfsummen und die Functions kontrolliert.
6. Nach Erfolg werden die markierten Paketordner entfernt. Kleine Prüfbelege
   bleiben unter `.release-state/` erhalten. Fehlerpakete bleiben zur Diagnose.

Die globale Build-Automatik wird nicht abgeschaltet: Die Web-Publisher für
Karten, Familien und Tafeln behalten ihre Git-Auslöser. Die Markierung betrifft
nur den lokalen Push. Netlify dokumentiert das unter
[Skip a deploy](https://docs.netlify.com/deploy/manage-deploys/manage-deploys-overview/#skip-a-deploy).
Bei gemeinsam gepushten Commits gilt die Markierung des jüngsten Commits.

Eine zusätzliche öffentliche Release-Arbeitskopie unter Windows mit
`git -c core.autocrlf=false worktree add --detach <Pfad> HEAD` erstellen.
Die Prüfungen erzeugter JSON-, Biografie- und Katalogdateien erwarten die
kanonischen Git-Zeilenenden. Die Option gilt nur für diesen Checkout; globale
Git-Einstellungen und die vollständigen Hauptarbeitsquellen bleiben unverändert.
Die ausdrücklich als `-text` markierten Originale behalten ihre gespeicherten
Bytes. Eine bereits bestehende Kopie bei Bedarf aus ihren geprüften Git-Blobs
materialisieren, ohne Inhalte oder geschützte Originale zu normalisieren.

Die featurebezogenen Prüfungen `group-community` und `item-mechanics` validieren
die gemeinsamen Gruppen-/Storyprojektionen, Gawains öffentliche Quellen,
Itemversionen, Schildstandards und autoritative Bestandsoperationen. Die
Katalog-/Bundlebuilder laufen darin mit `--check`; sie ändern keine Quellen.
Ein rein lesender Vergleich stellt zusätzlich sicher, dass die bereits
generierten Servermechaniken ihren aktuellen Browserquellen entsprechen.
Der Aushang-Belohnungskatalog wird gegen die aktuellen Itemrevisionen geprüft.
Benötigte verschachtelte Testpakete werden vor ihrer ersten Verwendung anhand
der vorhandenen Lockfiles geprüft und wiederverwendet. Nur fehlende oder
abweichende Pakete lösen ein `npm ci` im zugehörigen Paket aus. Ein unpassendes
Lockfile oder eine fehlgeschlagene Vorbereitung stoppt die Prüfung.

Auch die Stammbaumprüfung verwendet eine passende Playwright-Installation
weiter. Manifest, Lockdatei, installierte Paketversionen und npm-Installationsstand
müssen übereinstimmen. Ein kurzer Browserstart prüft zusätzlich die gebundene
Chromium-Version. Nur ein fehlendes Browserprogramm löst den Download der
benötigten Headless-Variante aus; andere Startfehler brechen die Prüfung ab.

## Befehle

```text
node netlify/release/release.mjs --plan
node netlify/release/release.mjs --prepare
node netlify/build/run-site-build.mjs --preflight
node netlify/release/release.mjs --prepare --jobs=2
node netlify/release/release.mjs --publish --push
node netlify/release/release.mjs --publish --push --full
node netlify/release/release.mjs --cleanup-stage
```

`--plan` verändert nichts. `--prepare` prüft und baut ausschließlich lokal.
Ohne `--push` verlangt die Veröffentlichung einen bereits identisch gepushten
Commit. `--full` prüft alles erneut. Sonst gelten Eingabe-Hashes, Node-Laufzeit
und sieben Tage Gültigkeit; unvollständige Belege erlauben keine Wiederverwendung.
Jeder fehlgeschlagene Schritt stoppt den Ablauf.

## Frühe Katalogprüfung und begrenzte Parallelisierung

Vor den längeren Fachprüfungen werden die ausgewählten Quest-, Wappen- und
Wirtschaftsprojektionen rein lesend geprüft. Alle dabei gefundenen Fehler werden
gesammelt gemeldet. Die Prüfung aktualisiert keine Quellen und ersetzt keine
vollständige Fachprüfung. Mit `node netlify/build/run-site-build.mjs --preflight`
kann dieser kurze Abgleich bereits vor dem Commit gegen den aktuellen Arbeitsbaum
laufen; er ist kein Prüfbeleg für einen veröffentlichten Commit.

Nur ausdrücklich markierte und anhand ihrer vollständigen Befehle freigegebene
Prüfgruppen laufen parallel. Standard sind zwei gleichzeitige Gruppen;
`--jobs=1` erhält die serielle Ausführung, `--jobs=3` und `--jobs=4` erhöhen die
Grenze. Generatoren, unbekannte Befehle und Dependency-Vorbereitung bilden
serielle Grenzen. Innerhalb einer Gruppe bleibt die Befehlsreihenfolge erhalten.
Nach einem Fehler starten keine weiteren Gruppen; bereits gestartete Prüfungen
enden, bevor der Releaseaufruf seine Sperre löst.

Die gemeinsame Befehlsfreigabe liegt in `netlify/build/validation-commands.mjs`.
Neue reine Prüfskripte müssen dort ausdrücklich mit ihren zulässigen Argumenten
aufgenommen werden. Bekannte Hausprüfungen akzeptieren `--check` und die begrenzte
`--houses=...`-Auswahl in beiden Reihenfolgen. Schreibmodi und zusätzliche Optionen
berechtigen niemals zur Wiederverwendung. Gleichzeitige erfolgreiche Abschlüsse
speichern ihre lokalen Checkpoints nacheinander, mit der bestehenden Workspaceprüfung.

`--full` führt sämtliche Prüfgruppen erneut aus. Die konservativen gemeinsamen
Eingabegrenzen, Byteprüfungen und Gültigkeitsfristen bleiben erhalten. Der erste
Release mit einer geänderten Build-Policy muss deshalb vollständig neu prüfen.

## Wiederaufnahme und Zeitmessung

`--prepare` gefolgt von `--publish --push` führt nicht mehr automatisch die ganze
Vorbereitung zweimal aus. `.release-state/prepared.json` wird nur akzeptiert,
wenn Site, Commit, Node-Laufzeit, Prüf-Fingerprints und Prüfalter passen. Beide
Paketverzeichnisse müssen weiterhin die eigenen Eigentumsmarker besitzen.
Jede Datei wird erneut gegen ihren Git-Blob oder eines der ausdrücklich
deklarierten erzeugten Overlays geprüft; zusätzliche Dateien, Weiterleitungen
und veränderte Functions verhindern die Wiederverwendung. Arbeitsdateien werden
dabei weder als Uploadquelle verlinkt noch durch Cacheinhalte ersetzt.

Nach einem späteren Prüffehler können bereits erfolgreiche reine Prüfgruppen
aus `.release-state/task-checkpoints.json` wiederverwendet werden. Der Cache
benötigt denselben vollständigen Eingabe-Fingerprint, dieselbe Node-Laufzeit
und unverändert gültige sieben Tage. Er speichert erst nach erfolgreichem
Workspacecheck. Auch relevante Diagnosequellen müssen dem Git-Stand entsprechen;
freie Diagnoseprotokolle dürfen weiterhin geschrieben werden. Unbekannte
Prüfskripte, Aufgaben mit erzeugten Ausgaben und `always`-Aufgaben bleiben
ausgenommen. `--full` ignoriert sowohl vorbereitete Pakete als auch diese
lokalen Prüf-Checkpoints. Unbelegte Änderungen an generierten Arbeitsdateien
werden weiterhin vor einer frischen Vorbereitung abgewiesen und erhalten.

Jeder schreibende Releaseaufruf speichert seine Phasen mit monoton gemessenen
Sekunden, Erfolg oder Fehler und Gesamtdauer unter
`.release-state/last-run-timings.json`. Erfasst werden unter anderem
Workspacekontrollen, Prüfplanung, Prüfungen, Snapshot, jeder Fetch, der Push,
der komplette CLI-Deploy und die Produktionskontrolle. Das CLI-Intervall enthält
weiterhin Hashing, Functions-Bündelung, Upload und Netlify-Verarbeitung zusammen;
es darf nicht als reine Uploadzeit ausgegeben werden. Gesprächs- und Analysezeit
außerhalb des gestarteten Befehls gehört nicht zu diesen Messwerten. Geheimnisse
und Fehlertexte werden nicht in den Zeitbeleg übernommen. `--plan` bleibt rein
lesend und erzeugt keinen solchen Beleg.

Bei ausgeführten Fachprüfungen ergänzt `.release-state/last-build-run.json`
die Laufzeit jeder Prüfgruppe und jedes Befehls, auch im Fehlerfall. Frühe
Katalogprüfungen sind als eigene Phase erkennbar; wiederverwendete Gruppen
bleiben als solche markiert. Argumente, Prozessausgaben und Ausnahmetexte werden
nicht in diesen Bericht übernommen. Parallel laufende Befehlszeiten dürfen
nicht zu einer vermeintlichen Gesamtdauer addiert werden.

Eine Sperre verhindert parallele Releases. Nach einem Prozessabbruch zuerst
deren PID prüfen, bevor `.release-state/release.lock` entfernt wird.
`--cleanup-stage` entfernt nur mit Eigentumsmarker versehene Paketordner.

## Werkzeuge

Node.js 22 und Git müssen im PATH stehen. Die vorhandene Netlify-CLI 27.15.0
wird unter `netlify/.cli/` aufbewahrt, getrennt von temporären Build-Kopien.
Bei fehlender Installation:

```text
npm install --prefix netlify/.cli --no-audit --no-fund netlify-cli@27.15.0
```

`ALERIA_NETLIFY_CLI` kann alternativ auf `bin/run.js` einer vorhandenen Installation
zeigen. Die CLI verwendet die bestehende Anmeldung. Der lesende Abschlussabgleich
verwendet `NETLIFY_AUTH_TOKEN` oder den lokalen Netlify-Konfigurationsspeicher.
Tokens gelangen nicht in Argumente, Berichte oder Git-Dateien.

## Paket und Arbeitsquellen

Die gemeinsame Policy unter `netlify/build/` spart zusätzlich Diagnoseordner,
alte Wappen-Testausgaben und Generatorarchive in den klar benannten
`Vorschau/*/assets/[warriors/]generated[-archive]/`-Ordnern aus. Diese Quellen
werden **nicht lokal gelöscht**. Originale, Prompts, Methoden und Provenienz
bleiben im Quellrepository. Aktive Bilder, Karten, ausdrücklich verlinkte
Originaldownloads und `production`-Großansichten bleiben unter denselben URLs.

Die tatsächlich verwendeten Stammbaumporträts werden nicht blind entfernt oder
verlustbehaftet konvertiert. Ihre spätere Auslagerung braucht einen gesonderten
URL-Abgleich einschließlich gespeicherter Online-Verweise. Dieses Verfahren
schreibt keine bestehende Git-Historie um.

Die Momentaufnahme benutzt keine Hardlinks zu bearbeiteten Arbeitsdateien.
Identische Dateien teilen nur innerhalb des unveränderlichen Pakets einen Link.
Functions, Konfiguration und ihre Modulabhängigkeiten liegen in einem separaten
privaten Paket außerhalb des statischen Upload-Verzeichnisses.

Netlifys [Dateidigest-Verfahren](https://docs.netlify.com/api-and-cli-guides/api-guides/get-started-with-api/)
lädt nur dort fehlende Inhalte hoch; Git-Pushs bleiben ebenfalls inkrementell.

## Schutzprüfungen

```text
node --test --experimental-test-isolation=none netlify/tests/site-build.test.mjs netlify/tests/local-release.test.mjs netlify/tests/prepared-release.test.mjs netlify/tests/release-flow.test.mjs netlify/tests/release-timings.test.mjs netlify/tests/build-checkpoints.test.mjs netlify/tests/site-build-fingerprints.test.mjs
node --test --experimental-test-isolation=none netlify/tests/build-preflight.test.mjs netlify/tests/build-validation-scheduler.test.mjs netlify/tests/validation-commands.test.mjs
node --test --experimental-test-isolation=none Stammbäume/tests/release-dependencies.test.js
python netlify/tests/temporary-cleanup.test.py
```

Geprüft werden unter anderem parallele Bearbeitungen, private Functions,
Katalog-Overlays, Archivfilter, Verzeichniseigentum, Verknüpfungen und die
selektive Skip-Markierung.

## Kanonische ?ffentliche Bin?rquelle

Die optional markierte ?ffentliche Arbeitskopie liegt direkt unter der
.release-state des getrennten Hauptworkspaces. Nach allen Checks wird sie
eingefroren. Nur gro?e, regul?re Bin?rassets mit genau einem Link werden
gegen ihren vollst?ndigen Git-Blob gepr?ft und im Stage hardgelinkt. Main,
Code, JSON und erzeugte Overlays bleiben ausgeschlossen. Ohne g?ltigen
Eigentumsmarker gilt der bisherige Git-Blob-Pfad. Overlays werden weiterhin
vor dem Schreiben entkoppelt. Bei verwendeten Bin?rlinks verlangt der
Publisher vor Push/Upload die vollst?ndige native Byte-/Git-/Ownerpr?fung.

Der Marker .release-state/public-source.json enth?lt owner
aleria-canonical-public-source-v1, checkout (?ffentliche Arbeitskopie),
sourceWorkspace (separater Hauptworkspace) und den endg?ltigen Commit.
Er wird erst nach dem finalen Commit erstellt. Ver?nderte oder bereits
fremd verlinkte Assets werden aus Git kopiert, nicht aus Main ?bernommen.
Die Quelle bleibt bis zum best?tigten Produktionsabschluss unver?ndert.

Vorbereitete Pakete d?rfen nur nach vollst?ndiger nativer Pr?fung
wiederverwendet werden; Commit, Runtime, Inputfingerprints und alle
urspr?nglichen Pr?fzeiten bleiben gebunden. Ung?ltige oder fehlende Pakete
autorisieren keine generierten Arbeits?nderungen. Im normalen Ablauf wird
einmal --publish --push nach komplettem Source-/Test-/Input-Freeze verwendet.

Gemeinsam genutzte node_modules werden bei passendem Lock/Modulstand nur
wiederverwendet. Ein Mismatch darf niemals npm ci durch eine Junction
ausl?sen; die Runtime- und Stammbaum-Preparer stoppen dann ausdr?cklich.
Vor dem Lauf kann prepare-runtime-checks.mjs --check installationsfrei
pr?fen. Nach Bin?rlinks aktualisiert der Publisher einmal den Statcache
der eigenen ?ffentlichen Quelle mit update-index --refresh; echte
Arbeits?nderungen bleiben durch den normalen Workspaceguard gesch?tzt.
