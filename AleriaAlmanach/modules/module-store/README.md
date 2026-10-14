# Lokale Modulspeicherung

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

Prüfung: `node --test tests/module-store-revision.test.mjs` und
`node tests/module-store-local.browser.mjs`. Der Browsertest benötigt Playwright;
optional setzen `PLAYWRIGHT_MODULE` und `PLAYWRIGHT_EXECUTABLE` dessen Modulpfad
und den Browser. Er arbeitet mit isolierten Browserprofilen und blockiert alle
externen Netzwerkanfragen.
