# Aleria Stammbäume

Eine modulare Genealogie-Workbench für den Aleria Almanach. Die Anwendung nutzt Family Chart 0.9.0 nur als Rendering-Engine; das Aleria-Datenmodell, die Validierung und die Beziehungslogik sind davon unabhängig.

`Stammbaum.html` ist die zentrale Navigation für alle Familienakten. Ohne Modusangabe öffnet sie den schreibgeschützten Ansichtsmodus. Der Bearbeitungsmodus ist über `?mode=edit` und das Passwort `7777` erreichbar.

## Start

ES-Module benötigen einen lokalen Webserver. Vom Repository-Stamm aus:

```powershell
python -m http.server 8080
```

Danach `http://localhost:8080/Stammb%C3%A4ume/Stammbaum.html?mode=view` öffnen.

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
- „Familie speichern“ legt eine benannte Familienakte mit frei verschachtelbarem Ordnerpfad im lokalen Familienregister an. Die ersten vier Stufen bilden zugleich Königreich, Grafschaft, Baronie und Stammsitz ab; der Adelsrang wird davon unabhängig gespeichert.
- „＋ Neue Familie“ öffnet einen Gründungsassistenten für eine unabhängige Akte mit eigenem Haus, Gründer-Ehepaar und Wappen. Ein erstes Kind unter dem Wappen ist optional.
- Nach der Gründung kann der Register-Speicherdialog automatisch geöffnet werden; alternativ lässt sich jederzeit über „Familie speichern“ sichern.
- `register.html` führt Projekt-Registry und lokal gespeicherte Familien zusammen; jede Akte öffnet sich über `Stammbaum.html?family=<familien-id>&mode=view`.
- Das Register ergänzt veröffentlichte Firebase-Releases, sobald das Backend erreichbar ist, und fällt andernfalls auf Projekt-Registry und lokale Datensätze zurück.
- Veröffentlichungen werden serverseitig erneut validiert und bereinigt. Private Notizen, unbekannte Extensions und geheime Beziehungen erscheinen nicht in der öffentlichen Fassung; das ausdrücklich öffentliche Biographie-Modul wird separat normalisiert und mitveröffentlicht.
- Portraits und Wappen können weiterhin als Imgur-URL eingetragen werden. Nach Cloud-Anmeldung lassen sie sich alternativ als PNG, JPEG oder WebP bis 8 MB über eine autorisierte Function hochladen; direkte Browser-Schreibrechte auf den Storage-Bucket existieren nicht.
- Projektweit auslieferbare Familien werden zentral in `assets/js/data/families.registry.js` registriert.
- JSON-Export verwendet `aleria.family-tree` Schema-Version 1.
- Der Import akzeptiert außerdem das alte Format der temporären `Stammbaum.html` mit `persons` und `couples`.
- Jede Baumperson erhält eine dauerhafte `worldPersonId`. Der Almanach speichert dieselbe ID unter `identity.worldPersonId` und `genealogy.worldPersonId`; dadurch bleibt die Verbindung auch bei späteren Namens- oder Hausänderungen eindeutig.
- Das Almanach-Modultemplate „Stammbaum“ bindet eine konkrete Familienakte über deren stabile `familyId` in einem gleichursprünglichen Iframe ein. Der Editor bezieht Projekt-, lokale und veröffentlichte Firebase-Familien aus der gemeinsamen Registry; die Adresse wird kanonisch als `../Stammb%C3%A4ume/Stammbaum.html?family=<id>&mode=view` erzeugt. Ohne Auswahl wird kein beliebiger Standardbaum geladen.
- Der Bearbeitungswerkzeugpunkt „Almanach-Abgleich“ liest bestehende Charakterprofile aus der normalen Almanach-Datenbank und schlägt sie passend zum aktiven Haus vor. Vor- und Nachname plus identisches Geburtsjahr gelten als sehr wahrscheinlicher Treffer, werden aber erst nach Bestätigung verknüpft. Widersprüchliche feste IDs werden nie automatisch zusammengeführt.
- Noch nicht platzierte Almanach-Charaktere können zunächst frei oder gezielt als Kind, Partner oder Elternteil einer vorhandenen Baumperson übernommen werden. Die genealogische Position wird nicht aus einem Nachnamen erfunden.

## Darstellung

- Das verbindliche Gegenwartsjahr ist `1740`; Alter wird daraus beziehungsweise bei Verstorbenen aus dem Todesjahr berechnet.
- Eine ausgewählte Person erhält in der Seitenakte den Arbeitsgang „Person mit Beziehung“. Neue Partner, Kinder oder Eltern werden atomar angelegt und unmittelbar in den Baum eingegliedert.
- Eine Auswahl verändert die Baumwurzel nicht mehr automatisch. „Im Baum zentrieren“ fokussiert gezielt, „Gesamtansicht“ stellt den ursprünglichen Aufbau wieder her.
- „Neu beginnen“ erzeugt einen leeren Arbeitsstand, ohne gespeicherte Registerfamilien zu löschen.
- Leere Portraits verwenden lokal mitausgelieferte Silhouetten unter `assets/images/placeholders/`; externe Portraits können als direkte Imgur-Bild-URL im Seitenverhältnis 2:3 hinterlegt werden.
- Ein Klick direkt auf das Portrait öffnet das Biographie-Dossier der Person. Im Bearbeitungsmodus steht ein bildschirmfüllender Almanach-Editor mit klar beschriftetem Trenner zwischen Bearbeitung und Liveversion zur Verfügung; im Ansichtsmodus wird ausschließlich das gespeicherte Dossier gezeigt.
- Ein Klick auf den übrigen Kartenrahmen öffnet im Ansichtsmodus die Beziehungsmatrix. Die gewählte Person steht im Zentrum; Eltern und Großeltern, Seitenlinien, Partner- und Schwiegerbeziehungen sowie Nachkommen werden ausschließlich aus dem Familiengraphen berechnet. Jede verwandte Karte kann wiederum ins Zentrum gesetzt werden. Portraitklick und Kartenklick bleiben bewusst getrennt.
- Biographien verwenden denselben Datenvertrag, dieselben Dossier-Klassen und direkt dasselbe Biographie-Stylesheet wie das AleriaAlmanach-Modul. Sie liegen versionsgebunden unter `person.extensions.biographyModule` und bleiben dadurch Teil von JSON-Export, Undo/Redo, Registerspeicherung und Firebase-Synchronisation.
- Der Biographie-Editor umfasst eine zwölfzeilige Standard-Infotabelle, formatierte Haupttexte, Persönlichkeit, Hintergrund, Werke, Zusatzabschnitte, Trivia, Zitate, Verbindungen, Besitz, Zitatbox und Fußzeile. Die Formatierungsleiste hält die Textauswahl für Fett, Kursiv, Unterstrichen, Links, Tooltips und Spoiler stabil. Nicht angelegte Biographien werden im Ansichtsmodus ausdrücklich als leer ausgewiesen.
- Biographie-Portraits besitzen bis zu fünf nummerierte Altersstufen. `[1]` verweist immer auf das reguläre Personenportrait im Stammbaum und wird nicht doppelt gespeichert; `[2]` bis `[5]` sind optionale Bild-URLs unter `biography.portraitStages`. Nur belegte Zusatzstufen erscheinen als Reiter, wobei ausgelassene Nummern nicht verschoben werden. Der Almanach verwendet denselben Datenvertrag.
- Die elf niederen Rittergeschlechter Tlawd, Rhyddid, Gelyn, Cludwyr, Chwedlonol, Balchder, Eneiniog, Gostyn, Awenydd, Awenor und Loer sind als eigene vorbereitete Familienakten unter `Cenyr > Celtigerns Wacht > Llamreis Ankunft > Gwynthor` registriert. Ihr Lehnshaus und vorhandene Zweitsitze sind strukturierte Bestandteile des Hausprofils; die Wappen liegen lokal im Stammbaum-Modul.
- Haus Saethwyr ist mit 59 Personen, 26 Partnerschaften, zwei großen Überlieferungssprüngen und den belegten Verzweigungen nach Wyrm, Draig, Gwyvern, Neidr, Illyswen, Illewod, Saith, Gaeth und Dyngwn hinterlegt. Geteilte Personen aus Arwydd, Gafyr und Wyrm verwenden dieselben Weltpersonen-IDs und bereits vorhandenen lokalen Portraitdateien; abweichende Lebensdaten der Rhianwyn-Überlieferungen bleiben als Quellenhinweis erhalten.
- Persönlichkeitsmerkmale können Zeichen, Bild-URLs oder direkt ein Motiv aus dem gemeinsamen, generierten Almanach-Iconverzeichnis verwenden. Der Stammbaum lädt dafür denselben Katalog unter `AleriaAlmanach/modules/icon-directory/icon-directory-data.js`; neue Katalogeinträge müssen nicht doppelt gepflegt werden.
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
- Im Bearbeitungsmodus bietet jede ausgewählte Personenakte „＋ Zeitsprung nach dieser Person“ an. Besteht eine Partnerschaft, wird sie vorausgewählt; andernfalls kann der Knoten auch unmittelbar an einer einzelnen Person hängen.
- „PNG · hohe Auflösung“ exportiert die gesamte Baumfläche mit zwei- bis vierfacher Auflösung (bis maximal 12.000 Pixel Kantenlänge).
- Haus Arwydd ist unter `Stammbaum.html?family=haus-arwydd&mode=view` als eigene Registerfamilie angelegt. Der Gründer Idwalladr ist der Startfokus, damit alle eingetragenen Partnerzweige in der Gesamtansicht erscheinen. Alle 27 Personen besitzen lokal gesicherte Portraits und die Lebensdaten aus der Quelltabelle. Die vorhandenen lokalen Wappen von Saethwyr, Wyrm, Draig, Gafyr, Gwefrydd und Gwywern sind zugeordnet; nur nicht vorhandene Nebenwappen bleiben neutral.
- Haus Arwydd liegt als Ritterfürstengeschlecht im Register unter `Cenyr > Celtigerns Wacht > Rhonwens Tränen > Castellbryn`.
- Haus Wyrm liegt als Ritterfürstengeschlecht unter `Cenyr > Celtigerns Wacht > Llamreis Ankunft > Gwynthor` als ausgearbeiteter Stammbaum mit 62 Personen, 50 lokal gesicherten Portraits, 26 Partnerschaften, zwölf wegverheirateten Hausverweisen und zwei sichtbaren Überlieferungslücken. Die übrigen zwölf Personen verwenden die lokalen Silhouetten. Die gemeinsame Verbindung von Eiddon Wyrm und Iseult Arwydd verwendet in beiden Häusern dieselben Weltpersonen-IDs und Portraitpfade.
- Haus Gafyr liegt als Ritterfürstengeschlecht unter `Cenyr > Celtigerns Wacht > Llamreis Ankunft > Gwynthor` als ausgearbeiteter Stammbaum mit 57 Personen, 44 belegten Portraits, 23 Partnerschaften, acht wegverheirateten Hausverweisen, zwei sichtbaren Überlieferungslücken und Gwenna Crafanc als blau markiertem Mündel vor. Maldwyn führt die Hauptlinie über den Sprung bis Mathonwy fort; Mairwyn ist als wegverheiratete Verbindung zu Haus Saethwyr gekennzeichnet. Mathonwy Gafyr/Lynesse Wyrm und Kelyddon Gafyr/Izolda Arwydd verwenden hausübergreifend dieselben Weltpersonen-IDs und Portraitdateien; Sir Egon Gafyr ist zusätzlich mit dem Almanach-Charakter verankert.
- Datenkonvention für neue Stammbäume: Wenn eine Vorlage die fortgeführte Hauptlinie nicht ausdrücklich benennt, wird zunächst der männliche Nachkomme als Linienfortführer angenommen. Eine klar belegte weibliche oder anderweitig benannte Erbfolge hat immer Vorrang vor dieser Arbeitshypothese.
- Haus Draig (Grafengeschlecht) und Haus Saethwyr (Ritterfürstengeschlecht) bleiben unter `Llamreis Ankunft > Gwynthor` als leere, direkt bearbeitbare Familienakten mit lokalen Wappen vorbereitet.
- Haus Gwefrydd ist als leeres Baronengeschlecht unter `Cenyr > Celtigerns Wacht > Artus Streben > Rhosmere`, Haus Gwyvern unter `Cenyr > Celtigerns Wacht > Gwendolyns Ufer > Abergwint` vorbereitet. Ihre Haus- und Regionswappen liegen gemeinsam mit den Symbolen von Cenyr, Celtigerns Wacht, Llamreis Ankunft und Rhonwens Tränen lokal unter `assets/images/`.

## Abhängigkeiten

- [Family Chart 0.9.0](https://github.com/donatso/family-chart), MIT
- [D3 7.9.0](https://d3js.org/), ISC
- [html2canvas 1.4.1](https://github.com/niklasvh/html2canvas), MIT

Family Chart, D3 und html2canvas liegen fest versioniert unter `vendor/`. Die optionale Cloud-Schicht lädt die fest gepinnte Firebase Web SDK 12.15.0 direkt vom offiziellen Google-CDN; ohne erreichbares Firebase bleibt die lokale Anwendung funktionsfähig.
