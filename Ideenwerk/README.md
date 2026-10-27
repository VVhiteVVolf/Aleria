# Ideenwerk · Patricks Studio

Eigenständige Ideenwerkstatt für Charaktere, Geschichten, Orte und lose Gedanken.
Alle Inhalte liegen lokal im Browser. Es gibt keine Firebase-Anbindung, keine
Serverdatenbank und keine extern geladenen Schriftarten, Bilder oder Bibliotheken.

## Direkt starten

**`Ideenwerk.html` doppelklicken und im Browser öffnen.** Dafür wird keine
Installation und kein laufender Server benötigt. Die Datei enthält die gesamte
Oberfläche und alle Programmteile. Einen aktuellen Chrome, Edge oder Firefox verwenden.

Beim ersten Start ist eine ausdrücklich markierte Beispielpinnwand vorhanden.
Über **Neue Pinnwand** einen leeren Arbeitsbereich anlegen. Die Beispieldaten können
über das Papierkorbsymbol neben dem Pinnwandtitel entfernt werden.

Alternativ mit installiertem Node.js 22 oder neuer `Start-Ideenwerk.cmd`
doppelklicken oder in diesem Ordner `npm start` ausführen. Das öffnet die modulare
Fassung unter `http://127.0.0.1:4177`. Der lokale Server liefert ausschließlich die
Anwendungsdateien aus; er speichert und verarbeitet keine Projektinhalte.
Für diesen Start ist kein `npm install` erforderlich. Mit Strg+C beenden.

## Arbeiten

- **Pinnwand, Raster, Liste:** Drei Ansichten desselben Projekts. Die freie Position
  bleibt beim Wechsel der Ansicht erhalten.
- **Module:** Charakterdesign, Storydesign, Mindmap, Welten & Orte, Moodboard und
  freie Idee. Das Modul anklicken, um es zu bearbeiten. Am Punktgriff verschieben;
  die Pfeiltasten bewegen einen fokussierten Griff ebenfalls.
- **Miniaturen:** Der kleine Pfeil rechts oben klappt das Modul zu einer Kachel
  mit Vorschau zusammen. Ein weiterer Klick klappt die Vorschau wieder aus.
- **Seiten:** Jede Vorlage bringt passende Seiten mit. Eigene Seiten und Text-,
  Listen- oder Bildblöcke lassen sich ergänzen, umbenennen und entfernen.
- **Charakterdesign:** Portrait, Eigenschaften als Liste, freier Text, innerer
  Antrieb und Entwicklung. Keine Spielwerte oder Aleria-Klassensysteme.
- **Mindmap:** Gedanken hinzufügen, ziehen und beschriften. Einen Knoten auswählen,
  **Verbinden** anklicken und den zweiten Knoten wählen. Eine Linie bzw. deren
  Beschriftung anklicken, um den Verbindungstext zu ändern. Tab und Enter können
  Knoten und Linien auswählen; Pfeiltasten verschieben fokussierte Knoten.
- **Bilder:** PNG, JPEG oder WebP bis 12 MB einfügen. Das Bild wird lokal auf
  maximal 1.200 Pixel Kantenlänge verkleinert und als WebP eingebettet. Das Original
  bleibt auf dem Rechner unverändert.
- **Suche:** Durchsucht Titel, Texte, Seiten und Mindmap-Knoten. Der Vorlagenfilter
  grenzt die Ergebnisse zusätzlich ein.
- **Rückgängig/Wiederholen:** Über die Pfeile in der Werkzeugleiste. Strg+Z und
  Strg+Umschalt+Z gelten außerhalb von Textfeldern für das Projekt; innerhalb eines
  Textfeldes gelten die normalen Textabkürzungen. Verlauf: die letzten 30 Schritte
  seit dem Öffnen. Strg+S exportiert das ganze Projekt.

## Lokal sichern und übertragen

**Automatisch:** Änderungen werden in IndexedDB in diesem Browser gespeichert.
„Lokal gespeichert“ bedeutet Browserspeicher, keine Datei im Projektordner.
Ein zweiter Tab desselben Ursprungs wird bei verfügbarer Web-Locks-API gegen
gleichzeitiges Überschreiben gesperrt. Speicherfehler werden sichtbar gemeldet.

**Export:** Lädt eine JSON-Datei mit allen Pinnwänden, Modulpositionen, Seiten,
Bildern, Knoten und Verbindungen herunter. Diese Datei ist die portable Sicherung.
**Import:** Fügt Pinnwände einer Sicherung nach einer Zusammenfassung hinzu;
vorhandene Pinnwände bleiben erhalten. Auch ein Import ist rückgängig zu machen.

Für einen Rechner-/Browserwechsel zuerst exportieren und am Ziel importieren.
Auch beim Wechsel zwischen HTML-Datei und lokalem Server exportieren/importieren.
Browserdaten sind an Browserprofil und Ursprung gebunden; bei `file:` kann auch
der Dateipfad eine Rolle spielen. Datei möglichst am gleichen Ort behalten.
Browserdaten löschen oder Privatmodus beenden kann die automatische Sicherung
entfernen. Deshalb regelmäßig exportieren. Die HTML-Datei selbst enthält keine
nachträglich eingegebenen Ideen.

Grenzen pro Projekt: 30 Pinnwände, je 500 Module, je 50 Seiten und 100 Blöcke pro
Seite; je Mindmap 200 Knoten und 500 Verbindungen. Portable Projektdateien maximal
32 MB; GitHub-Sicherungen maximal 25 MB. Importdateien werden vor Übernahme geprüft;
externe Bild-URLs, HTML-Ausführung und ungültige Verbindungen sind ausgeschlossen.

## GitHub-Sicherung ohne Deployment

1. Ein eigenes GitHub-Repository ohne Hosting-Anbindung anlegen und mit einer
   README initialisieren. Für private Ideen ein privates Repository verwenden.
2. Einen Fine-grained Personal Access Token ausschließlich für dieses Repository
   mit **Contents: Read and write** bereitstellen.
3. Im Editor **GitHub** öffnen, `Benutzer/Repository` und Token eintragen.
4. **Ziel prüfen** zeigt Sichtbarkeit, Datenumfang und Branch. Erst **Jetzt sichern**
   überträgt die Projektdaten.

Die Sicherung liegt auf **`ideenwerk-backup`** unter
`projects/<projektkennung>.json`. Der Branch beginnt unabhängig vom Standardbranch,
übernimmt keinen Anwendungscode und enthält nur JSON-Projektdateien sowie eine
Erkennungsdatei. Ein bereits vorhandener fremder Branch wird abgewiesen. Vor dem
Schreiben wird erneut auf zwischenzeitliche Änderungen geprüft; es gibt keinen
Force-Push. Der Standardbranch kann nicht als Sicherungsbranch verwendet werden.

Es gibt keine Deployment-, Workflow-, Netlify- oder Firebase-Aufrufe. Committexte
enthalten `[skip ci] [skip netlify]`. Externe Automationen eines Repositorys kann
der Editor nicht kontrollieren; deshalb ein Backup-Repository ohne Hosting wählen.

Der Token wird nur während des geöffneten GitHub-Dialogs im Arbeitsspeicher
gehalten und beim Schließen verworfen. Er wird nicht in IndexedDB, LocalStorage,
Projektdateien oder Sicherungen abgelegt. Es gibt keine automatische Synchronisation.
Zur Wiederherstellung die JSON-Datei im Backup-Branch herunterladen und importieren.

Technische Grundlage:
[GitHub Git Trees API](https://docs.github.com/en/rest/git/trees),
[Git Commits API](https://docs.github.com/en/rest/git/commits),
[Git References API](https://docs.github.com/en/rest/git/refs).

## Weiterentwickeln

Das Laufzeitsystem braucht keine Pakete und keinen Build. `index.html` lädt native
JavaScript-Module. Verantwortlichkeiten sind nach Features getrennt:

| Ordner | Verantwortung |
| --- | --- |
| `modules/workspace` | Dokumentformat, Zustand, Verlauf, IndexedDB, Import/Export und Pinnwandnavigation |
| `modules/templates` | Vorlagenkatalog und Vorlagenauswahl |
| `modules/board` | Karten, Darstellung und freie Positionierung |
| `modules/editor` | Modulseiten, Blöcke und lokaler Bildimport |
| `modules/mindmap` | Knoten, Verbindungen, Geometrie und deren Interaktion |
| `modules/github` | Explizite Projektsicherung und GitHub-Dialog |
| `modules/ui` | Kleine Darstellungsbausteine, Symbole und Dialoge |

`app.mjs` startet nur Speicher und Oberfläche. Änderungen erfolgen über den lokalen
Workspace-Store. Der Vorlagenkatalog ist die gemeinsame Quelle für Erstellung,
Vorlagenauswahl und Filter. Kein Zugriff auf kanonische Aleria-Daten.

Prüfungen: `npm test` und `npm run check` (ohne Installation).
Die Tests verwenden für GitHub einen simulierten API-Transport und übertragen
keine Daten. Ein echter Push benötigt Patricks Repository und Token.

Zum Neuerstellen der einzelnen HTML-Datei einmal `npm install` und dann
`npm run build` ausführen. Nur hierfür wird die Entwicklungsabhängigkeit esbuild
benötigt. `Ideenwerk.html` ist ein generiertes Ausgabeformat; Änderungen gehören
in die modularen Quelldateien und werden danach neu gebaut.

Die Arbeit wurde lokal erstellt. Das Aleria-Repository wurde weder gepusht noch
deployt. Bestehende andere Projektänderungen wurden nicht übernommen.
