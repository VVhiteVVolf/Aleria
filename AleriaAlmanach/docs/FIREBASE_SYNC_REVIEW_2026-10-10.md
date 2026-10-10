# Firebase-Prüfung vom 10. Oktober 2026

## Behobene Ursachen

- Die Auth-Sitzung wartete nicht auf die Wiederherstellung des gespeicherten Benutzers. Das erste `null`-Ereignis konnte die Bereitschaft dauerhaft ohne Benutzer auflösen. Schreibzugriffe scheiterten dann trotz später erfolgreicher anonymer Anmeldung. Die Sitzung wartet nun auf den wiederhergestellten oder anonym angemeldeten Benutzer; spätere Benutzerwechsel werden beim Schreiben berücksichtigt.
- `saveCharTabs` ersetzte den gesamten Datensatz `char_tabs/config`, der auch den Modulbestand beschreibt. Die Speicherung ersetzt nun ausschließlich die fünf Felder der Charakter-Reiter. Entfernte Zuordnungen werden weiterhin korrekt entfernt; Fehler werden an den Aufrufer weitergegeben.
- Der Inhaltsvergleich hing von der Reihenfolge von Objektschlüsseln ab. Firestore sortiert Map-Schlüssel, ohne den Inhalt zu ändern. Kanonische Signaturen berücksichtigen jetzt ausschließlich den Inhalt sowie ausgeblendete Module; ältere Synchronisationsbelege bleiben lesbar.
- Die geteilte Speicherung ließ das Bereichsbild `iconUrl` weg. Es wird jetzt im Manifest und beim Laden erhalten.
- Ein fehlgeschlagener Lesezugriff durfte nicht wie ein leerer Onlinebestand behandelt werden. Lesefehler brechen den Abgleich jetzt ab, anstatt einen lokalen Cache erneut zu veröffentlichen.
- Während des Ladens gespeicherte lokale Änderungen werden erst nach der Onlineantwort eingelesen. Nur lokal geänderte Inhalte können anhand des letzten Synchronisationsbelegs hochgeladen werden, wenn der Onlinebestand unverändert ist. Bei beidseitigen Änderungen bleibt die Konfliktentscheidung nötig; ausstehende automatische Schreibvorgänge werden dabei gestoppt.
- Identische Live-Schnappschüsse bestätigen den Synchronisationsbeleg. Eine langsame Firebase-Initialisierung oder eine wiederhergestellte Verbindung kann den Startabgleich erneut auslösen.

## Verifikation

- 66 gezielte Node-Tests für Authentifizierung, Modulbestand, Speicherung der Charakter-Reiter sowie angrenzende Modul-, Migrations-, Charakter- und Weltdatumsfunktionen.
- Echtes Firebase-Browser-SDK, normale anonyme Spielerrechte: Onlinebestand erfolgreich geladen (51 Bereiche, 62 Bereichsknoten, 30 eigene Module, 16 Überschreibungen). Keine administrativen Zugangsdaten im Schreibtest.
- Eindeutig benannte, isolierte Testdokumente in `char_tabs` und `module_store_entries`: angelegt, vom Server zurückgelesen, geändert und erneut zurückgelesen.
- Technischer Beitrag in einem isolierten Prüfbereich: mit der produktiven `commitNarrativeComment`-Funktion gespeichert, vom Server gelesen, bearbeitet und zurückgelesen. Keine Figurenverknüpfung, keine Kampfeffekte und keine Änderung bestehender Szenen.
- Alle Testdokumente anschließend entfernt und ihre Abwesenheit auf dem Server geprüft. Die Benutzerkennung blieb beim Neuladen erhalten.
- Vollständige Almanach-Seite mit echter Firebase-Leseverbindung viermal geladen, einschließlich eines alten Synchronisationsbelegs und umsortierter Cache-Schlüssel: jedes Mal synchronisiert, keine Konfliktmeldung, keine JavaScript-Fehler, keine Dialoge, keine automatischen Modul- oder Reiterschreibversuche.
- Die fokussierten Firebase-Regressionstests laufen künftig vor jedem Netlify-Build.

## Grenze

Der persönliche Opera-Cache des Nutzers wurde nicht verändert. Wenn er tatsächlich ungespeicherte Änderungen enthält, die vom Onlinebestand abweichen, bleibt eine einmalige bewusste Konfliktentscheidung erforderlich. Der Schutz wird nicht durch automatisches Überschreiben umgangen.
