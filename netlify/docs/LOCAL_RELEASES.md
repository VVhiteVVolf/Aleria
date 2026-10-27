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
   unveränderliche Momentaufnahme aus Git-Blobs. Nur die drei ausdrücklich
   deklarierten erzeugten Kataloge und der echte Prüfbeleg werden ergänzt.
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

## Befehle

```text
node netlify/release/release.mjs --plan
node netlify/release/release.mjs --prepare
node netlify/release/release.mjs --publish --push
node netlify/release/release.mjs --publish --push --full
node netlify/release/release.mjs --cleanup-stage
```

`--plan` verändert nichts. `--prepare` prüft und baut ausschließlich lokal.
Ohne `--push` verlangt die Veröffentlichung einen bereits identisch gepushten
Commit. `--full` prüft alles erneut. Sonst gelten Eingabe-Hashes, Node-Laufzeit
und sieben Tage Gültigkeit; unvollständige Belege erlauben keine Wiederverwendung.
Jeder fehlgeschlagene Schritt stoppt den Ablauf.

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
node --test --experimental-test-isolation=none netlify/tests/site-build.test.mjs netlify/tests/local-release.test.mjs
python netlify/tests/temporary-cleanup.test.py
```

Geprüft werden unter anderem parallele Bearbeitungen, private Functions,
Katalog-Overlays, Archivfilter, Verzeichniseigentum, Verknüpfungen und die
selektive Skip-Markierung.
