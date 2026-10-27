# Website-Build und Veröffentlichung

Seit 27. Oktober 2026 steht der [geprüfte lokale Releaseweg](LOCAL_RELEASES.md)
zur Verfügung. Er umgeht den großen Server-Checkout und nutzt dieselben
Fachprüfungen. `[skip netlify]` vermeidet einen zweiten Cloud-Build für den lokalen
Release; Web-Publisher behalten ihre normalen Git-Auslöser. Die vorsichtige
[temporäre Bereinigung](TEMPORARY_STORAGE.md) besitzt einen separaten engen Scope.

## Zuständigkeiten

`netlify.toml` ruft `netlify/build/run-site-build.mjs` auf. Die einzelnen Aufgaben,
ihre Eingaben und ihre Befehle stehen in `site-build-tasks.mjs`. Es gibt keine
globale Kette mehr, die bei jeder Änderung sämtliche Fachbereiche prüft.

- Archiv, Anmeldung, Kommentare und Modulspeicher haben eine gemeinsame schnelle
  Laufzeitprüfung.
- Gameplay-Guides, Rohstoffe, regionale Ausrüstung und Stammbaum-Geometrie werden
  bei geänderten Eingaben geprüft.
- Regionalkatalog und Karten-Medienindex werden bei jedem tatsächlichen Build
  neu erzeugt. Ihre beim vorigen Build erzeugten Dateien sind nicht zwingend im
  Git-Stand enthalten. Sie einfach wegzulassen könnte ältere Kataloge ausliefern.
- Die kleine Prüfung der Build-Auswahl läuft bei jedem Build.

## Erfolgreiche Prüfungen wiederverwenden

Jede erfolgreiche Veröffentlichung enthält `build-meta/validation.json`. Die
Datei enthält ausschließlich Commit, Site-ID, Eingabe-Hashes und Prüfzeitpunkte,
keine Zugangsdaten. Der nächste Build liest sie über die Haupt-URL der Website.
Fehlgeschlagene und noch wartende Builds können diesen Beleg nicht ersetzen.

Die Hashes werden aus Git-Pfaden und Blob-IDs gebildet. Dafür müssen nicht die
14,6 GiB Bild- und Quelldaten erneut gelesen werden. Eine Umbenennung, Löschung
oder eine Änderung über mehrere Commits verändert die betroffenen Hashes.

Eine Prüfung läuft erneut, wenn ihre Eingaben, die Build-Policy oder die
Node-Laufzeit geändert wurden, ihr Beleg fehlt oder älter als sieben Tage ist.
Bei Wiederverwendung bleibt der ursprüngliche Prüfzeitpunkt erhalten.
Unlesbare oder ungültige Belege führen zur vollständigen Prüfung.

Die Haupt-URL wird auch bei Deploy Previews als konservative Referenz verwendet.
Es werden keine Netlify-API-Tokens für diese Wiederverwendung benötigt.

## Neue Abhängigkeiten

Die Eingaben enthalten auch Querverbindungen, unter anderem Familiendaten für
regionale Ausrüstung und Guides sowie Kampfprofile für die Guides.
`verify-task-inputs.mjs` prüft bei Guide- und Stammbaumläufen die tatsächlich
geladenen Node-Module einschließlich dynamischer Imports. Eine neue Abhängigkeit
außerhalb der eingetragenen Eingaben bricht den Build mit dem fehlenden Pfad ab.
Dann die passende Feature-Grenze in `site-build-tasks.mjs` ergänzen.

Dateien, die mit `fs` gelesen werden, CSS, Browser-Vendorcode und Bildmanifeste
müssen ausdrücklich als Eingaben eingetragen bleiben. Der Import-Audit ersetzt
diese Verantwortlichkeit nicht. Neue Build-Aufgaben bekommen eigene Eingaben
und Befehle in derselben Aufgabenliste.

## Veröffentlichungspaket

Netlify veröffentlicht `.site-publish/`. Dieser Ordner wird aus den versionierten
Website-Dateien und den bekannten Build-Ausgaben erstellt. Unversionierte lokale
Dateien gelangen nicht ins Paket. Entwicklungswerkzeuge, Tests, Firebase-Backend
und Build-Helfer werden nicht als statische Website veröffentlicht. Netlify
Functions werden weiterhin separat aus `netlify/functions` gebündelt.

Bestehende Bildpfade, Avatar-Werkstattdateien und Originaldownloads bleiben
erhalten. Die Dateien werden unter denselben URLs bereitgestellt. Hardlinks
vermeiden eine zusätzliche Kopie der großen Bildbestände; wenn das Dateisystem
sie nicht unterstützt, wird bytegleich kopiert.

Der Staging-Ordner darf nur ersetzt werden, wenn sein Eigentumsmarker vorhanden
ist und er direkt im Repository liegt. Symlinks außerhalb des Repositorys sind
als Veröffentlichungsquellen unzulässig.

Der Netlify-Secret-Scan bleibt aktiv. Nur die bytegleichen Staging-Kopien werden
von einem zweiten Scan ausgenommen; Quellprojekt und erzeugte Originaldateien
werden weiter geprüft. Dieser Ausschluss darf nicht auf Quellcode ausgeweitet
werden, um einen echten Fund zu unterdrücken.

## Ganze Builds vermeiden

`ignore-site-build.mjs` vergleicht mit dem tatsächlich veröffentlichten Commit.
Eine Änderung ausschließlich an privaten Dateien ohne Verbraucher kann den
gesamten Build überspringen. Öffentliche Dateien, relevante Tests, Generatoren
und gemeinsame Infrastruktur lösen weiterhin einen Build aus. Bei unklarer
Git-Abstammung wird gebaut. Ein erneuter Build desselben veröffentlichten
Commits bleibt möglich, beispielsweise für Cache-Messungen.

Firebase-Backend und -Regeln haben ihren eigenen Releaseprozess. Eine reine
Backendänderung benötigt keine erneute statische Website-Veröffentlichung,
solange keine Website- oder Netlify-Function-Abhängigkeit betroffen ist.

## Bedienung und Diagnose

- Plan anzeigen: `node netlify/build/run-site-build.mjs --plan`
- Alle Prüfungen lokal: `node netlify/build/run-site-build.mjs --full`
- Vollständigen Netlify-Build erzwingen: Build-Variable `ALERIA_BUILD_FULL=true`.
- Policy testen: `node --test --experimental-test-isolation=none netlify/tests/site-build.test.mjs`.

Lokale tatsächliche Builds prüfen immer vollständig, weil der Arbeitsbaum
unveröffentlichte Änderungen enthalten kann. Der Planmodus verwendet Git-HEAD.
Ein lokaler Vergleich kann mit `--plan --baseline=pfad/zum/beleg.json` erfolgen;
dabei muss die Site-ID über die Umgebung zum Beleg passen.

Das Build-Protokoll zeigt `RUN`, `REUSE`, den Auswahlgrund und die Laufzeit jeder
Aufgabe. Beim ersten Build ohne Beleg wird zusätzlich eine begrenzte lesende
Cache-Inventur versucht. Der Stammbaum-Audit meldet Anzahl, Karten und Laufzeit.
Er wartet auf Fonts und zwei Renderframes statt pauschal 350 ms pro Familie.

## Ausgangsmessung vom 15. Oktober 2026

Build `16bb362c8`: 13:54 Minuten bis zur Freischaltung, davon 2:02 Cache-Restore
(22,5 GB), 1:44 Repository/Umgebung, 4:07 Build-Befehl, 5:10 Secret-Scan und rund
0:49 Veröffentlichung. Der vorherige Build wartete zusätzlich 11:09 Minuten.

Der Bestand umfasst etwa 23.900 Dateien und 14,6 GiB, darunter rund 10 GiB im
Stammbaum-Bereich. Die getestete Veröffentlichungsauswahl lässt etwa 1.250
Entwicklungsdateien mit 22,5 MiB weg. Sie ist vor allem eine klare Trennung;
die großen Bildbestände werden dadurch nicht kleiner. Eine spätere Auslagerung
von Bildern braucht einen eigenen Abgleich gespeicherter Online-URLs.
