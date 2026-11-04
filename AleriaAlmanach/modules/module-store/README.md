# Lokale Modulspeicherung

Die Archivansicht führt jede Modul-ID nur einmal. Wird ein früher gespeichertes
Modul später mit der Anwendung ausgeliefert, gilt dieselbe Priorität wie beim
Öffnen und Bearbeiten: eingebautes Modul mit etwaigem `entryOverrides`-Eintrag,
danach ausschließlich gespeicherte Module. Gespeicherte Altstände werden dabei
nicht gelöscht oder online überschrieben. Eigene Kopien mit anderer ID bleiben
sichtbar, auch wenn sie denselben Titel haben. Verschieben, Ausblenden und
Löschbestätigung verwenden dieselbe Zuordnung.

`module-store-local.js` besitzt ausschließlich den lokalen Modulcache und seine
Synchronisationsbelege. Die Datenbank `aleria-module-store` (IndexedDB, Version 1)
enthält einen Object Store `records`. Vollständige Modulstände werden nicht mehr
in localStorage geschrieben. Ohne IndexedDB bleibt localStorage als ausdrücklich
begrenzter Ersatz verfügbar.

Der Start wartet auf `ready()` und die Anwendung des lokalen Standes, bevor das
Archiv bereitgemeldet oder mit Firebase abgeglichen wird. Die bisherigen beiden
localStorage-Einträge werden gemeinsam übernommen und erst nach erfolgreichem
Transaktionsabschluss entfernt. Fremde Speichereinträge bleiben erhalten.
Abweichende Einträge aus alten Tabs werden als `legacy-recovery:*` aufbewahrt und
im Vollbackup unter `moduleStoreLocalRecovery` mit exportiert.

Editoren lesen einen synchronen Snapshot. `write()` aktualisiert diesen sofort
und liefert eine Promise für den tatsächlichen Transaktionsabschluss. Schreib-
operationen werden geordnet; abgebrochene Transaktionen behalten den Entwurf im
Speicher und verhindern eine erfolgreiche `flush()`. Änderungen anderer Tabs
werden mit einem Vergleich des zuletzt gelesenen Datenbankstands geschützt.
Vor dem Verlassen bei noch ungesicherten Änderungen erscheint die Browserwarnung.

`saveModuleStore()` behält den bisherigen Boolean-Vertrag: `true` bedeutet, dass
die Änderung zum Speichern angenommen wurde. Der Synchronisationsstatus meldet
die lokale Sicherung erst nach dem Commit. Editoren, die ihre Wiederherstellungs-
daten löschen oder sich schließen, warten zusätzlich auf `flush()`. Firebase-
Schreiboperationen warten ebenfalls auf die lokale Sicherung. Fehler bleiben
sichtbar und fordern einen JSON-Export an.

Synchronisationsbelege verwenden SHA-256 über den bereits vorhandenen kanonischen
Inhaltsvergleich. Alte JSON-Belege werden weiterhin erkannt und ohne Veränderung
ihres Basisstands oder Synchronisationsdatums migriert. Asynchrone Vergleiche
prüfen erneut, ob während der Prüfsumme eine Bearbeitung stattgefunden hat.

Die Speicheranzeige bewertet den größten einzelnen Online-Eintrag einschließlich
der Bereichsmetadaten, nicht die Summe aller separat gespeicherten Module.

Seit dem 4. November 2026 wird beim Start und bei bestätigten Live-Änderungen
immer der Online-Stand geladen. Ein Browsercache wird dabei niemals allein
wegen seines Datums automatisch online veröffentlicht. Abweichende ungesendete
Fassungen werden vor der Übernahme nach ihrem Inhalts-Hash unter
`sync-recovery:*` aufbewahrt und im bestehenden Vollbackup mit exportiert.
Eine fehlgeschlagene Sicherung verhindert die Ersetzung des Entwurfs.
Auch Änderungen während einer asynchronen Prüfsumme oder Sicherung bleiben
erhalten. Es gibt keinen automatisch geöffneten Konfliktdialog und keine
Auswahl zwischen Lokal und Online mehr.

`module-store-online-source.js` akzeptiert ausschließlich vom Server bestätigte
Snapshots. Browsercache- und noch nicht bestätigte Schreib-Snapshots lösen
keine Übernahme aus; Metadaten-Bestätigungen werden mit abonniert. Die
Sequenzprüfung verwirft ältere asynchrone Ladevorgänge, sobald eine neuere
Serverrevision empfangen wurde. Direkte Modul-Lesezugriffe verwenden die
Server-Varianten des vorhandenen Firebase-SDKs.

Eine laufende Inline-Bearbeitung erhält ihren Entwurf und merkt sich die
neueste Online-Fassung. Speichern, Abbrechen und Schließen melden das Ende
über `almanach:inline-module-edit-ended`; danach wird der neueste Online-Stand
übernommen. Der gegebenenfalls gespeicherte Entwurf bleibt im Vollbackup.
Überholte Speicher-Timer werden beim Empfang einer Online-Fassung verworfen;
nach asynchronen Wartezeiten wird vor dem Schreiben erneut geprüft.

Die kompakte, grün pulsierende Online-Anzeige öffnet ihre Details erst nach
einem bewussten Klick oder der Tastaturbetätigung ihres echten Buttons.
Fehler bleiben erkennbar; reduzierte Bewegung wird berücksichtigt.

Prüfung: `node --test tests/module-store-revision.test.mjs` und
`node tests/module-store-local.browser.mjs`. Der Browsertest benötigt Playwright;
optional setzen `PLAYWRIGHT_MODULE` und `PLAYWRIGHT_EXECUTABLE` dessen Modulpfad
und den Browser. Er arbeitet mit isolierten Browserprofilen und blockiert alle
externen Netzwerkanfragen.
