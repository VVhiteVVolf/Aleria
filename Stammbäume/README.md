# Aleria Stammbäume

Eine modulare Genealogie-Workbench für den Aleria Almanach. Die Anwendung nutzt Family Chart 0.9.0 nur als Rendering-Engine; das Aleria-Datenmodell, die Validierung und die Beziehungslogik sind davon unabhängig.

`Stammbaum.html` ist die zentrale Navigation für alle Familienakten. Ohne Modusangabe öffnet sie den schreibgeschützten Ansichtsmodus. Der Bearbeitungsmodus ist über `?mode=edit` und das Passwort `7777` erreichbar.

## Start

ES-Module benötigen einen lokalen Webserver. Vom Repository-Stamm aus:

```powershell
python -m http.server 8080
```

Danach `http://localhost:8080/Stammb%C3%A4ume/` öffnen.

## Tests

```powershell
cd Stammbäume
npm test
```

Es werden keine Pakete installiert. Die Tests verwenden ausschließlich Node.js und die lokalen Module.

## Daten und Speicherung

- Haus Arwydd wird beim ersten Start geladen; gespeicherte Arbeitsstände bleiben davon unberührt.
- Änderungen werden immer lokal im Browser gespeichert. Im Bearbeitungsmodus kann zusätzlich ein Firebase-Konto verbunden werden; dann synchronisiert eine eigene Repository-/Sync-Schicht revisionsgebunden mit der isolierten Datenbank `family-trees`.
- Unterscheiden sich lokale und Cloud-Fassung, wird keine Seite still überschrieben. Die Oberfläche verlangt eine bewusste Wahl zwischen Cloud-Fassung und einer neuen lokalen Revision.
- „Familie speichern“ legt eine benannte Familienakte mit frei verschachtelbarem Ordnerpfad im lokalen Familienregister an.
- „＋ Neue Familie“ öffnet einen Gründungsassistenten für eine unabhängige Akte mit eigenem Haus, Gründer-Ehepaar und Wappen. Ein erstes Kind unter dem Wappen ist optional.
- Nach der Gründung kann der Register-Speicherdialog automatisch geöffnet werden; alternativ lässt sich jederzeit über „Familie speichern“ sichern.
- `register.html` führt Projekt-Registry und lokal gespeicherte Familien zusammen; jede Akte öffnet sich über `Stammbaum.html?family=<familien-id>&mode=view`.
- Das Register ergänzt veröffentlichte Firebase-Releases, sobald das Backend erreichbar ist, und fällt andernfalls auf Projekt-Registry und lokale Datensätze zurück.
- Veröffentlichungen werden serverseitig erneut validiert und bereinigt. Private Notizen, Extensions und geheime Beziehungen erscheinen nicht in der öffentlichen Fassung.
- Portraits und Wappen können weiterhin als Imgur-URL eingetragen werden. Nach Cloud-Anmeldung lassen sie sich alternativ als PNG, JPEG oder WebP bis 8 MB über eine autorisierte Function hochladen; direkte Browser-Schreibrechte auf den Storage-Bucket existieren nicht.
- Projektweit auslieferbare Familien werden zentral in `assets/js/data/families.registry.js` registriert.
- JSON-Export verwendet `aleria.family-tree` Schema-Version 1.
- Der Import akzeptiert außerdem das alte Format der temporären `Stammbaum.html` mit `persons` und `couples`.

## Darstellung

- Das verbindliche Gegenwartsjahr ist `1740`; Alter wird daraus beziehungsweise bei Verstorbenen aus dem Todesjahr berechnet.
- Eine ausgewählte Person erhält in der Seitenakte den Arbeitsgang „Person mit Beziehung“. Neue Partner, Kinder oder Eltern werden atomar angelegt und unmittelbar in den Baum eingegliedert.
- Eine Auswahl verändert die Baumwurzel nicht mehr automatisch. „Im Baum zentrieren“ fokussiert gezielt, „Gesamtansicht“ stellt den ursprünglichen Aufbau wieder her.
- „Neu beginnen“ erzeugt einen leeren Arbeitsstand, ohne gespeicherte Registerfamilien zu löschen.
- Leere Portraits verwenden lokal mitausgelieferte Silhouetten unter `assets/images/placeholders/`; externe Portraits können als direkte Imgur-Bild-URL im Seitenverhältnis 2:3 hinterlegt werden.
- Die neuen Personenfassungen aus `assets/images/frames/` werden automatisch nach Familienrolle gewählt. Portrait, matte Farbfläche, Text, Rahmen und Hauswappen liegen als getrennte Ebenen übereinander.
- Jede Personenfassung besitzt eine eigene gespeicherte Wappenposition; die abweichenden runden Fassungen werden nicht mehr mit einer gemeinsamen Standardkoordinate ausgerichtet.
- Kartenfarben bilden acht Familienrollen ab: Kernmitglied, angeheiratet, außerhalb der Ehe gezeugt, Affäre, erzwungene Verbindung, Mündel, fortgegebenes Mündel und adoptiert.
- Beziehungstexte werden im Baum nicht eingeblendet. Stattdessen sind Ehe-, Affären-, Abstammungs- und Pflegelinien farblich konfigurierbar.
- Mehrfachverbindungen werden durch einen eigenen Adapter-Router als gemeinsame rechtwinklige Stämme mit kurzen, abgerundeten Abzweigen gezeichnet. Die Fokuslinie verwendet bewusst dieselbe Strichstärke, damit an Generationsteilungen keine Doppelkonturen entstehen.
- Die zentralen Werkzeuge verwenden lokal mitgelieferte, semantische Aleria-Motive aus `assets/images/toolbar/`; ihre Beschriftungen und zugänglichen Button-Namen bleiben unverändert.
- Gründerpaar, Hauswappen, frei platzierbare Zeitsprünge und verlinkte Hausknoten sind eigene Elemente des Stammbaums. Zeitrahmen zeigen nur die Jahreszahlen links und rechts oberhalb ihrer Linien; fehlende Grenzen werden aus den angrenzenden Generationen ermittelt, soweit Lebensdaten vorhanden sind.
- Der interne Stammwappenknoten besitzt einen optionalen, frei editierbaren Untertitel. Dieser lässt sich beim Gründen oder später unter „Baumaufbau“ ändern; ohne Eingabe wird kein Ersatztext erfunden.
- Wappenknoten verwenden wählbare Fassungen: Gold, Silber, Bronze oder Eisen. Gold ist der Standard; Fassung und Wappen liegen auf getrennten Ebenen und ihre Größen sind im Bearbeitungsmodus pro Knoten justierbar.
- Ein Klick auf das Stammwappen öffnet direkt die Anlage eines Nachkommen; beide Personen des darüberliegenden Paares und das zugehörige Haus sind bereits vorausgewählt.
- Hausknoten bilden Kadettenhäuser oder wegverheiratete Linien ab und benötigen immer eine Ziel-Familien-ID im Register.
- Wegverheiratete Paare ohne fortgeführte Nachkommen enden in einem eigenen `married-away`-Wappenknoten. Dieser verweist auf die Familienakte des Zielhauses, sobald sie im Register existiert.
- Hausknoten werden als kompakte, gerahmte Siegel mit eigenem Namensschild dargestellt, damit lange Bezeichnungen nicht mit dem Wappen überlappen.
- Stammwappen, Zeitsprünge und verlinkte Hausknoten lassen sich im Bearbeitungsmodus direkt anklicken. Die jeweiligen Dialoge bearbeiten Beschriftung, Bild, Rahmen, Zielverknüpfung und zeitliche Angaben am bestehenden Knoten.
- Die Kartenabstände lassen Wappen- und Zeitknoten frei, ohne die Generationen unnötig weit auseinanderzuziehen. Verlinkte Endknoten stehen optisch zwischen Paar und Kindgeneration.
- Zeitsprungknoten können zunächst leer bleiben; neue bekannte Nachkommen lassen sich später direkt über den Knoten oder die Akte des vorausgehenden Paares ergänzen.
- „PNG · hohe Auflösung“ exportiert die gesamte Baumfläche mit zwei- bis vierfacher Auflösung (bis maximal 12.000 Pixel Kantenlänge).
- Haus Arwydd ist unter `Stammbaum.html?family=haus-arwydd&mode=view` als eigene Registerfamilie angelegt. Der Gründer Idwalladr ist der Startfokus, damit alle eingetragenen Partnerzweige in der Gesamtansicht erscheinen. Die vorhandenen lokalen Wappen von Saethwyr, Wyrm, Draig, Gafyr, Gwefrydd und Gwywern sind zugeordnet; nur nicht vorhandene Nebenwappen bleiben neutral.
- Haus Arwydd liegt im Register unter `Cenyr > Celtigerns Wacht > Rhonwens Tränen > Castellbryn`. Unter `Cenyr > Celtigerns Wacht > Llamreis Ankunft > Gwynthor` sind Haus Draig, Wyrm, Saethwyr und Gafyr als leere, direkt bearbeitbare Familienakten mit lokalen Wappen vorbereitet.

## Abhängigkeiten

- [Family Chart 0.9.0](https://github.com/donatso/family-chart), MIT
- [D3 7.9.0](https://d3js.org/), ISC
- [html2canvas 1.4.1](https://github.com/niklasvh/html2canvas), MIT

Family Chart, D3 und html2canvas liegen fest versioniert unter `vendor/`. Die optionale Cloud-Schicht lädt die fest gepinnte Firebase Web SDK 12.15.0 direkt vom offiziellen Google-CDN; ohne erreichbares Firebase bleibt die lokale Anwendung funktionsfähig.
