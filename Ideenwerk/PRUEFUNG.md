# Prüfstand · 27. Oktober 2026

## Automatisierte Prüfungen

`npm test`: 15 Tests. Projektformat und Vorlagen einschließlich eingebetteter Bilder
und Mindmap-Verbindungen; ungültige Importe; HTML-Escaping; Suche; Undo/Redo;
Reihenfolge asynchroner Speicherungen; Speicherfehler; Import ohne Überschreiben
vorhandener Pinnwände; Importabbruch; eigenständige HTML-Ausgabe; GitHub-Transport.

Der GitHub-Transport wird mit einem simulierten API geprüft: unabhängiger
Backup-Branch, ausschließlich Projektdateien, kein Force-Push, Konflikterkennung,
Sperre fremden Anwendungscodes und Schutz des Standardbranchs. Dabei werden keine
echten Tokens verwendet und keine externen Daten geschrieben.

`npm run check`: JavaScript-Syntax und Existenz der lokalen Modulimporte.
Die generierte HTML-Datei enthält alle vier Stylesheets, ein einziges gebündeltes
Skript und eingebettete Symbole. Sie lädt keine Laufzeitdateien nach.

## Browserprüfung

Die modulare Fassung wurde über eine lokale HTTP-Vorschau in Chrome geöffnet.
Geprüft: Pinnwand erstellen; Charaktervorlage öffnen; Titel, Text und Listen
bearbeiten; eigene Seite hinzufügen; Inhalt nach Neuladen wiederherstellen;
lokales PNG einfügen; Mindmap-Knoten anlegen, beschriften und verbinden;
Verbindung per Tastatur auswählen und beschriften; Knoten per Pfeiltaste bewegen;
Raster-/Listenansicht wechseln; Suche nach einem Mindmap-Knoten; Projekt als JSON
herunterladen; diese Datei über die Dateiauswahl importieren; Übernahme als weitere
Pinnwand bestätigen; Import über Rückgängig entfernen.

Die direkte automatisierte Navigation zur fertigen HTML-Datei mit `file:` wurde
von der URL-Regel der Browserautomation gesperrt und nicht umgangen. Der direkte
Doppelklickstart ist daher statisch, aber nicht durch diese Browserautomation
geprüft. Die Export-/Import-Dateistruktur ist zusätzlich automatisiert geprüft.

Ein echter GitHub-Push wurde nicht ausgeführt; dafür fehlen ein konkretes
Zielrepository und ein vom Nutzer bereitgestellter Token. Die Verbindung wird im
fertigen Editor konfiguriert. Es fand kein Deployment statt.
