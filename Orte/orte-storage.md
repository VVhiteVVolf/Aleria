# Speicherung der Orte

Die Ortsseiten verwenden Registry-Eintraege als verbindliche Zuordnung zwischen einer Seite und ihren GitHub-Dokumenten.

Pro Ort sind die Verantwortlichkeiten getrennt:

- `contentData`: direkt bearbeitete Texte, Bilder und Tabellen
- `sceneData`: Szenenindex und Szenenmodule
- `marketData`: Waren- und Handelsmodule (nur Zunfts-/Standortseiten)

Alle Dokumente liegen unter `Orte/published/<ort-id>/`. Lokale Bearbeitungen werden zunaechst als Browser-Entwurf gespeichert. Erst die Aktion **Online speichern** sendet den jeweiligen Dokumentstand an `/.netlify/functions/world-content-publisher`. Der Publish-Endpunkt akzeptiert fuer Orte ausschliesslich Pfade innerhalb des Ordners `Orte`, prueft die erwartete Revision und verwendet den serverseitigen GitHub-Token.

## Altdaten aus Firebase

Solange ein GitHub-Dokument noch `state: null` enthaelt und kein lokaler Entwurf vorhanden ist, lesen die Adapter den vorhandenen Firebase-Stand einmalig als Altquelle. Neue Aenderungen werden nicht mehr nach Firebase geschrieben. Nach der ersten GitHub-Veröffentlichung wird der versionierte GitHub-Stand geladen.

Die drei Adapter liegen getrennt nach Feature unter:

- `assets/js/orte-storage.js`
- `assets/js/orte-scene-storage.js`
- `assets/js/orte-market-storage.js`

Der Veröffentlichungsschlüssel wird nur im Arbeitsspeicher der geöffneten Seite gehalten. Der GitHub-Token bleibt ausschließlich in der Netlify-Funktion.
