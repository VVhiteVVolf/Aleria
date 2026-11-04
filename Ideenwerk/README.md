# Ideenwerk · Patricks Studio

Eine eigene Werkstatt für Figuren, Geschichten, Orte und Ideen. Patrick kann hier
auch Modul- und Avatarwünsche beschreiben, Referenzbilder hinzufügen und die
ausgewählten Wünsche auf GitHub zur Umsetzung bereitstellen.

## Starten

**`Ideenwerk.html` doppelklicken und im Browser öffnen.** Die Datei enthält die
gesamte Anwendung; eine Installation oder ein laufender Server ist nicht nötig.
Einen aktuellen Chrome, Edge oder Firefox verwenden.

Neue Projekte starten mit einer leeren Pinnwand. Unveränderte Beispiele aus der
früheren Version werden beim Laden entfernt. Bearbeitete Beispiele, hinzugefügte
Bilder, verschobene Karten und eigene Inhalte bleiben erhalten.

Alternativ mit installiertem Node.js 22 oder neuer `Start-Ideenwerk.cmd`
doppelklicken oder in diesem Ordner `npm start` ausführen. Die modulare Fassung
öffnet sich unter `http://127.0.0.1:4177`. Dafür ist kein `npm install` nötig.
Der lokale Server liefert die Anwendung aus; Projektinhalte speichert er nicht.
Mit Strg+C beenden.

## Die drei Arten zu speichern

| Anzeige oder Knopf | Was passiert? |
| --- | --- |
| **Lokal gespeichert** | Änderungen werden automatisch im aktuellen Browser gespeichert. |
| **Datei sichern** | Lädt das ganze Projekt mit allen Pinnwänden und Bildern als JSON-Datei herunter. |
| **Wünsche auf GitHub speichern** | Überträgt ausdrücklich ausgewählte Wünsche mit ihren Beschreibungen und Bildern in das gemeinsame private Repository. |

Es gibt keinen automatischen GitHub-Push im Hintergrund. Beim Schreiben bleibt
die Arbeit zunächst lokal. Erst die GitHub-Erfolgsmeldung bestätigt die Übergabe.

**Datei öffnen** fügt Pinnwände aus einer Sicherung hinzu. Vorhandene Pinnwände
bleiben erhalten; auch ein Import lässt sich rückgängig machen. Für einen
Rechner- oder Browserwechsel zuerst eine Datei sichern und am Ziel öffnen.
Das gilt auch beim Wechsel zwischen HTML-Datei und lokalem Server.

Browserdaten gehören zu Browserprofil und Ursprung; bei `file:` kann auch der
Dateipfad eine Rolle spielen. Die HTML-Datei selbst enthält keine nachträglich
eingegebenen Ideen. Eine gespeicherte Projektdatei ist deshalb die mitnehmbare
Sicherung. Das Löschen der Browserdaten entfernt auch die automatische lokale
Speicherung. Speicherfehler werden in der Oberfläche angezeigt.

## Ideen bearbeiten

1. Links eine Vorlage auswählen und einen Titel vergeben.
2. Texte, Listen und Bilder ergänzen. Jede Vorlage bringt passende Seiten mit;
   eigene Seiten und Inhaltsblöcke lassen sich hinzufügen.
3. Die Karte zum Bearbeiten anklicken. Am Punktgriff verschieben; am fokussierten
   Griff funktionieren auch die Pfeiltasten. Der kleine Pfeil klappt die Karte
   zu einer Miniatur zusammen.

Pinnwand, Raster und Liste zeigen dieselben Inhalte. Suche und Vorlagenfilter
helfen beim Wiederfinden. Neue Pinnwände schaffen weitere Arbeitsbereiche.

Die normalen Vorlagen sind Charakterdesign, Storydesign, Mindmap, Welten & Orte,
Moodboard und freie Idee. Charakterdesign sammelt Aussehen, Eigenschaften und
Entwicklung; Spielwerte und Aleria-Klassen werden hier nicht verwaltet.

In einer Mindmap Gedanken hinzufügen, ziehen und beschriften. Einen Knoten
auswählen, **Verbinden** anklicken und den zweiten Knoten wählen. Die Linie oder
ihre Beschriftung anklicken, um den Verbindungstext zu ändern. Tab und Enter
wählen Knoten und Linien; Pfeiltasten bewegen fokussierte Knoten.

Bilder als PNG, JPEG oder WebP bis 12 MB einfügen. Ideenwerk verkleinert sie lokal
auf maximal 1.200 Pixel Kantenlänge und bettet sie als WebP ein. Das Original auf
dem Rechner bleibt erhalten. Listen verwenden einen Punkt pro Zeile.

**Rückgängig/Wiederholen:** Werkzeugleiste, Strg+Z und Strg+Umschalt+Z. Innerhalb
eines Textfeldes gelten dessen normale Textabkürzungen. Der Projektverlauf umfasst
die letzten 30 Schritte seit dem Öffnen. Strg+S sichert das Projekt als Datei.

## Einen Wunsch zur Umsetzung vorbereiten

Über **Wunsch erstellen** zwischen zwei Vorlagen wählen:

- **Modulwunsch:** Ein neues Aleria-Modul, eine Szene, ein Ort oder eine Erweiterung.
  Beschreiben, was entstehen soll, wo es hingehört und welche Inhalte wichtig sind.
- **Avatarwunsch:** Ein neues Charakterbild. Ein Referenzbild der Figur einfügen
  und Aussehen, Kleidung, Pose sowie gewünschte Änderungen beschreiben.

Einen aussagekräftigen Titel und die Beschreibung ergänzen. Für Avatarwünsche
ist mindestens ein Referenzbild erforderlich. Fehlende Angaben werden im Wunsch
angezeigt. Mit **Bereit zur Übergabe** wird ein fertiger Wunsch in der
GitHub-Auswahl vorausgewählt. Vollständig beschriebene Entwürfe können ebenfalls
bewusst ausgewählt werden.

**Deine Wünsche** sammelt Modul- und Avatarwünsche aus allen Pinnwänden. Dort
steht, ob ein Wunsch nur lokal gespeichert ist, ob sein aktueller Inhalt bereits
auf GitHub liegt oder ob er seit der letzten Übergabe geändert wurde. Nach einer
inhaltlichen Änderung erneut auf GitHub speichern; der frühere Speicherbeleg
bestätigt nur den damaligen Stand.

## GitHub einmal gemeinsam einrichten

1. Ein eigenes **privates** Repository für die Wünsche anlegen und mit einer
   README initialisieren, zum Beispiel `patrick/aleria-wuensche`.
2. Der Repository-Besitzer lädt die andere Person über die GitHub-Einstellungen
   als Mitwirkenden ein. Die Einladung annehmen, damit beide das Repository
   öffnen können.
3. Patrick erstellt in seinem GitHub-Konto selbst einen **Fine-grained Personal
   Access Token**. Nur dieses Repository auswählen und unter den
   Repository-Berechtigungen **Contents: Read and write** freigeben.
4. In Ideenwerk **Wünsche auf GitHub speichern** öffnen und `Benutzer/Repository`
   sowie den Token eintragen.

Der Token bleibt nur während dieses geöffneten Dialogs im Arbeitsspeicher und
wird beim Schließen verworfen. Er wird nicht im Projekt, im Browserspeicher oder
in den GitHub-Dateien gespeichert. Beim nächsten Öffnen muss er neu eingegeben
werden. Für VS Code verwendet die lesende Person ihre eigene GitHub-Anmeldung.

## Wünsche auf GitHub speichern

1. Die Wünsche ankreuzen, die weitergegeben werden sollen. Unvollständige Wünsche
   sind nicht auswählbar. Andere Ideen und private Notizen werden nicht übertragen.
2. **Auswahl und Ziel prüfen** anklicken. Repository, Wünsche, Bildanzahl und
   Datenumfang kontrollieren.
3. **Ausgewählte Wünsche auf GitHub speichern** anklicken. Die Erfolgsmeldung
   enthält den bestätigten Commit und einen Link zum gespeicherten Stand.

Die Übergabe liegt im eigenen Branch **`ideenwerk-wuensche`**:

```text
wuensche/<projektkennung>/
  README.md
  <wunschkennung>/
    README.md
    wunsch.json
    bilder/
```

Jeder Wunsch erhält eine lesbare Markdown-Beschreibung, strukturierte Angaben
als JSON und separate Bilddateien. Die Bilder werden in der Markdown-Vorschau
angezeigt. Frühere Wünsche und zusätzliche Bearbeitungsnotizen bleiben erhalten;
die Übersicht listet die zuletzt übergebene Auswahl. Für eigene Umsetzungsnotizen
kann im Wunschordner eine `bearbeitung.md` ergänzt werden.

Der Branch entsteht beim ersten erfolgreichen Speichern. Er ist unabhängig vom
Standardbranch und enthält nur Wunschdateien. Gleichzeitige Änderungen werden
erkannt; dann das Ziel erneut prüfen. Ideenwerk verwendet keinen Force-Push und
ruft kein Deployment auf. Committexte enthalten `[skip ci] [skip netlify]`.

## Wünsche in VS Code ansehen

Nach der ersten erfolgreichen Übergabe:

1. In VS Code mit Strg+Umschalt+P **Git: Clone** wählen und die Repository-URL
   `https://github.com/BENUTZER/REPOSITORY.git` eintragen. Mit dem berechtigten
   GitHub-Konto anmelden und den geklonten Ordner öffnen.
2. Links unten auf den Branchnamen klicken und den entfernten Branch
   **`origin/ideenwerk-wuensche`** auswählen. VS Code legt dafür einen lokalen
   Branch mit Nachverfolgung an.
3. Im Explorer `wuensche/<projektkennung>/README.md` öffnen. Mit
   **Markdown: Vorschau öffnen** oder Strg+Umschalt+V die Beschreibungen und Bilder
   ansehen. Von der Übersicht führen Links zu den einzelnen Wünschen.
4. Für Patricks nächste Übergabe in der Quellcodeverwaltung **… → Pull** wählen.
   Der neueste gespeicherte Stand steht dann im lokalen Ordner bereit und kann
   hier zur Umsetzung gelesen werden.

Wer das Repository bereits lokal geöffnet hat, kann den Branch auch im
VS-Code-Terminal holen und auswählen:

```sh
git fetch origin
git switch --track origin/ideenwerk-wuensche
```

Existiert der lokale Branch bereits, stattdessen `git switch ideenwerk-wuensche`
und anschließend `git pull --ff-only` verwenden. Wünsche werden von dort bewusst
in Aleria umgesetzt; die Übergabe selbst verändert keine Aleria-Inhalte.

## Das ganze Projekt zusätzlich auf GitHub sichern

**Projektbackup auf GitHub** unten auf der Seite sichert weiterhin das gesamte
Projekt mit allen Pinnwänden und Bildern. Das ist unabhängig von der
Wunschübergabe: Es verwendet den Branch **`ideenwerk-backup`** und die Datei
`projects/<projektkennung>.json`.

Ein mit README initialisiertes Backup-Repository ohne Hosting-Anbindung sowie
einen nur dafür berechtigten Token verwenden. **Ziel prüfen** zeigt den Umfang;
erst **Jetzt sichern** überträgt das Projekt. Zur Wiederherstellung die
JSON-Datei aus dem Backup-Branch herunterladen und über **Datei öffnen** einlesen.
Auch dieses Backup wird nicht automatisch synchronisiert.

## Grenzen und Weiterentwicklung

Ein Projekt umfasst höchstens 30 Pinnwände mit je 500 Modulen, je 50 Seiten und
100 Blöcken pro Seite. Eine Mindmap kann 200 Knoten und 500 Verbindungen enthalten.
Projektdateien sind auf 32 MB begrenzt, GitHub-Backups und Wunschpakete auf 25 MB.
Importdateien werden vor der Übernahme geprüft.

`index.html` lädt native JavaScript-Module. Die Laufzeit benötigt keine Pakete.
Die Verantwortlichkeiten liegen in eigenen Featureordnern:

| Ordner | Verantwortung |
| --- | --- |
| `modules/workspace` | Projektformat, lokaler Zustand, Verlauf, Speicherung, Migration und Import/Export |
| `modules/templates` | Vorlagenkatalog und Auswahl |
| `modules/board` | Karten, Darstellung und Positionierung |
| `modules/editor` | Modulseiten, Inhaltsblöcke und Bildimport |
| `modules/mindmap` | Gedanken, Verbindungen und Interaktion |
| `modules/requests` | Wunschangaben, Übergabestatus und lesbare Dateipakete |
| `modules/github` | Explizite Wunschübergabe und getrenntes Projektbackup |
| `modules/ui` | Symbole und Dialogbausteine |

Prüfungen im Ordner `Ideenwerk`: **`npm test`** und **`npm run check`**.
Die GitHub-Tests verwenden einen simulierten Transport; dabei werden keine
echten Tokens verwendet und keine externen Dateien geschrieben.

Zum Neuerstellen von `Ideenwerk.html` einmal `npm install` und anschließend
`npm run build` ausführen. Nur dafür wird esbuild benötigt. Änderungen gehören
in die modularen Quellen; die einzelne HTML-Datei ist ein generiertes Ausgabeformat.

Die Anwendung ist lokal vorbereitet. Ein echtes Zielrepository ist noch nicht
verbunden und es wurde kein externer GitHub-Push ausgeführt. Die Verbindung wird
im fertigen Editor mit dem gemeinsamen Repository und Patricks Token eingerichtet.
