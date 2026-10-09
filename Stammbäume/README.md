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
- Änderungen werden immer lokal im Browser gespeichert. „Online speichern“ verbindet sich bei Bedarf mit dem serverseitigen GitHub-Publisher und schreibt Familienakte plus Registermanifest gemeinsam als revisionsgebundenen Commit auf `master`.
- Unterscheiden sich lokale und Cloud-Fassung, wird keine Seite still überschrieben. Die Oberfläche verlangt eine bewusste Wahl zwischen Cloud-Fassung und einer neuen lokalen Revision.
- „Familie speichern“ legt eine benannte Familienakte mit frei verschachtelbarem Ordnerpfad im lokalen Familienregister an. Die ersten vier Stufen bilden zugleich Königreich, Grafschaft, Baronie und Stammsitz ab; der Adelsrang wird davon unabhängig gespeichert.
- „＋ Neue Familie“ öffnet einen Gründungsassistenten für eine unabhängige Akte mit eigenem Haus, Gründer-Ehepaar und Wappen. Ein erstes Kind unter dem Wappen ist optional.
- Nach der Gründung kann der Register-Speicherdialog automatisch geöffnet werden; alternativ lässt sich jederzeit über „Familie speichern“ sichern.
- `register.html` führt Projekt-Registry und lokal gespeicherte Familien zusammen; jede Akte öffnet sich über `Stammbaum.html?family=<familien-id>&mode=view`.
- Wird eine ausgearbeitete Registerfamilie erweitert, ergänzt die revisionsgebundene Register-Aktualisierung fehlende kanonische Personen und Beziehungen in älteren lokalen Fassungen. Lokale Felder und zusätzliche Datensätze bleiben erhalten; Ahnen- und Nachfahrentiefe werden mindestens auf die aktuelle Registertiefe angehoben.
- Das Register ergänzt die unter `assets/data/published-families/` veröffentlichten GitHub-Fassungen und fällt andernfalls auf Projekt-Registry und lokale Datensätze zurück.
- Der Netlify-Publisher validiert das vollständige Familienschema und gespiegelte Mehrfamilienbeziehungen erneut. Erwartete und aktuelle Revision müssen übereinstimmen; bei einem zwischenzeitlich veränderten `master` wird der Commit ohne Force-Push abgelehnt.
- Portraits und Wappen können weiterhin als Imgur-URL eingetragen werden. Alternativ wird eine PNG-, JPEG- oder WebP-Quelldatei bis 8 MB angenommen; Dateien über 1 MB werden vor dem lokalen Vormerken automatisch in ein speicherbares WebP optimiert. Erst „Online speichern“ legt das vorbereitete Bild zusammen mit der Familienakte als versioniertes Projektasset in demselben GitHub-Commit ab.
- Projektweit auslieferbare Familien werden zentral in `assets/js/data/families.registry.js` registriert.
- Skjaerheims Registerstruktur liegt in `assets/js/data/skjaerheim-territorial-plan.js`: Königsclan Hrothgar, die Jarlclans Knything, Stanleagh und Bjerk sowie zehn Thanenclans im gemeinsamen Bereich „Niedere Clans – noch nicht zugeordnet“. Sitze, Ortsvarianten und lokale Wappen sind vorbereitet; genealogische Akten folgen mit den Familienquellen.
- Der verbindliche Ablauf für Quellenübernahme, Weltidentitäten, Hausknoten, Zeitsprünge, Portraits, Revisionen und Fehlerdiagnose steht in [`DATENPFLEGE.md`](DATENPFLEGE.md).
- JSON-Export verwendet `aleria.family-tree` Schema-Version 1.
- Der Import akzeptiert außerdem das alte Format der temporären `Stammbaum.html` mit `persons` und `couples`.
- Jede Baumperson erhält eine dauerhafte `worldPersonId`. Der Almanach speichert dieselbe ID unter `identity.worldPersonId` und `genealogy.worldPersonId`; dadurch bleibt die Verbindung auch bei späteren Namens- oder Hausänderungen eindeutig.
- Das Almanach-Modultemplate „Stammbaum“ bindet eine konkrete Familienakte über deren stabile `familyId` in einem gleichursprünglichen Iframe ein. Der Editor bezieht Projekt-, lokale und veröffentlichte GitHub-Familien aus der gemeinsamen Registry; die Adresse wird kanonisch als `../Stammb%C3%A4ume/Stammbaum.html?family=<id>&mode=view` erzeugt. Ohne Auswahl wird kein beliebiger Standardbaum geladen.
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
- Aufgenommene Mündel werden in der Matrix als Gäste des Hauses behandelt: Die zugeordnete Person ist Vormund oder Vormundin, nicht Elternteil; deren Ehepartner und Kinder werden dadurch weder Stiefeltern noch Halbgeschwister. Ein als `ward-away` geführtes Familienkind behält dagegen seine biologische Abstammung und damit Eltern und Geschwister.
- Biographien verwenden denselben Datenvertrag, dieselben Dossier-Klassen und direkt dasselbe Biographie-Stylesheet wie das AleriaAlmanach-Modul. Sie liegen versionsgebunden unter `person.extensions.biographyModule` und bleiben dadurch Teil von JSON-Export, Undo/Redo, Registerspeicherung und GitHub-Veröffentlichung.
- Der Biographie-Editor umfasst eine zwölfzeilige Standard-Infotabelle, formatierte Haupttexte, Persönlichkeit, Hintergrund, Werke, Zusatzabschnitte, Trivia, Zitate, Verbindungen, Besitz, Zitatbox und Fußzeile. Die Formatierungsleiste hält die Textauswahl für Fett, Kursiv, Unterstrichen, Links, Tooltips und Spoiler stabil. Nicht angelegte Biographien werden im Ansichtsmodus ausdrücklich als leer ausgewiesen.
- Biographie-Portraits besitzen bis zu fünf nummerierte Altersstufen. `[1]` verweist immer auf das reguläre Personenportrait im Stammbaum und wird nicht doppelt gespeichert; `[2]` bis `[5]` sind optionale Bild-URLs unter `biography.portraitStages`. Nur belegte Zusatzstufen erscheinen als Reiter, wobei ausgelassene Nummern nicht verschoben werden. Der Almanach verwendet denselben Datenvertrag.
- Die elf niederen Rittergeschlechter Tlawd, Rhyddid, Gelyn, Cludwyr, Chwedlonol, Balchder, Eneiniog, Gostyn, Awenydd, Awenor und Loer sind als eigene vorbereitete Familienakten unter `Cenyr > Celtigerns Wacht > Llamreis Ankunft > Gwynthor` registriert. Ihr Lehnshaus und vorhandene Zweitsitze sind strukturierte Bestandteile des Hausprofils; die Wappen liegen lokal im Stammbaum-Modul.
- Haus Saethwyr ist mit 59 Personen, 26 Partnerschaften, zwei großen Überlieferungssprüngen und den belegten Verzweigungen nach Wyrm, Draig, Gwyvern, Neidr, Illyswen, Illewod, Saith, Gaeth und Dyngwn hinterlegt. Geteilte Personen aus Arwydd, Gafyr und Wyrm verwenden dieselben Weltpersonen-IDs und bereits vorhandenen lokalen Portraitdateien; abweichende Lebensdaten der Rhianwyn-Überlieferungen bleiben als Quellenhinweis erhalten.
- Persönlichkeitsmerkmale können Zeichen, Bild-URLs oder direkt ein Motiv aus dem gemeinsamen, generierten Almanach-Iconverzeichnis verwenden. Der Stammbaum lädt dafür denselben Katalog unter `AleriaAlmanach/modules/icon-directory/icon-directory-data.js`; neue Katalogeinträge müssen nicht doppelt gepflegt werden.
- Die neuen Personenfassungen aus `assets/images/frames/` werden automatisch nach Familienrolle gewählt. Portrait, matte Farbfläche, Text, Rahmen und Hauswappen liegen als getrennte Ebenen übereinander.
- Die Typografie aller Personenkarten ist unabhängig von Haus, Rolle und Rahmen zentral in `family-chart-theme.css` geregelt: Der Textblock beginnt links neben dem Portraitbereich, Namen und Metadaten sind linksbündig, lange Titel dürfen über bis zu drei Zeilen umbrechen, vor dem Hausnamen steht ein eigener Leerzeilenabstand und sämtliche Personenkartenschriften verwenden 90 Prozent ihrer früheren Größe. Wappen-, Zeitsprung- und Linienendknoten behalten ihre eigenständige Typografie.
- Personen besitzen zusätzlich die Stellung `branch`, `mainline` oder `head` in der Hauslinie. Hauptlinienkarten erhalten einen dauerhaften goldenen Bloom; frühere und gegenwärtige Oberhäupter verwenden den eigens positionierten `OberhauptFrame.PNG`. Die Stellung ist im Personenformular frei bearbeitbar und wird über JSON, Register und GitHub mitgespeichert.
- Unter jedem Kartenportrait liegt ein lokaler neutraler Szenenhintergrund. Transparente Silhouetten und PNG-Portraits erscheinen dadurch vollständig gefüllt; deckende Portraits bleiben optisch unverändert. Die regulären Portraits sind für alle Rollen geringfügig nach links korrigiert.
- Jede Personenfassung besitzt eine eigene gespeicherte Wappenposition; die abweichenden runden Fassungen werden nicht mehr mit einer gemeinsamen Standardkoordinate ausgerichtet.
- Kartenfarben bilden acht Familienrollen ab: Kernmitglied, angeheiratet, außerhalb der Ehe gezeugt, Affäre, erzwungene Verbindung, Mündel, fortgegebenes Mündel und adoptiert.
- Hauswappen werden pro Haus nur in seiner kanonischen Registerakte gepflegt. Fehlt in einer Cenyr-Gegenakte der Wappenpfad oder sogar der alte lokale Hauseintrag, ergänzt die Darstellung Hausname und Wappen über die stabile Haus-ID; ein vorhandenes echtes Wappen verdrängt dabei ältere neutrale Platzhalter. Nur Häuser ohne registrierte Bildquelle verwenden weiterhin das neutrale Siegel.
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
- Die neun Bürgerhäuser Draenmelyn, Pendrwn, Swyll, Aelmor, Maerllys, Braglas, Tonnarth, Ysgrif und Falchdyn sind unter `Cenyr > Celtigerns Wacht > Llamreis Ankunft > Gwynthor` als vollständig ausgearbeitete Stammbaumakten registriert und auf der Grafschaftsseite Celtigerns Wacht direkt verlinkt. Draenmelyn ist als bewusst kleine Dienerfamilie Haus Draigs ausgearbeitet: Hinter dem eisern gerahmten Wappen und einem absolut seriellen Sprung bis zur Großelterngeneration um 1665 folgen Ifor und Nest, ihre vier Kinder sowie die beiden Cousinenzweige um Taliesin (18) und Myfanwy (17) mit je zwei Geschwistern. Caradog lebt als Söldner und ist mit Gwenith Pendrwn verheiratet; Rhiannon ist an Iestyn Swyll wegverheiratet, während Sioned unverheiratet bleibt. Der unbegrenzte Gründerfokus rendert alle 18 Personen gemeinsam. Alle Wappen und vorgegebenen Portraits liegen lokal vor.
- Haus Falchdyn ist als Schreiber- und Journalistenfamilie mit 35 Personen, zwölf Ehen, 22 Abstammungen und vier Wegverheiratet-Knoten ausgearbeitet. Auf das unbekannte Gründerpaar folgt genau ein serieller Zeitsprung zu den drei Brüdern Dafydd, Iorwerth und Madoc; Dafydd und Iorwerth leben noch. Dafydds und Iorwerths Söhne führen die Linie bis zu elf unverheirateten Sprösslingen fort, von denen nur Ceredig, Branwen und Taliesin bereits redaktionelle Schwerpunkte besitzen; Madocs Zweig besteht ausschließlich aus vier wegverheirateten Töchtern. Dreizehn vorgegebene Portraits werden als lokale, optimierte WebP-Dateien geführt. Llio Falchdyn und Geraint Maerllys verwenden in beiden Akten dieselben Weltpersonen- und Partnerschafts-IDs, ohne eine doppelte Nachkommenslinie zu erzeugen. Die eingebettete Hausbiografie dokumentiert die Gwynthorer Hauptredaktion, Schreiberschule und Außenredaktionen von `Celtigerns Echo`; Wappen, Hausbild und Zeitungsemblem liegen lokal mit Quellenmanifest vor.
- Haus Pengair ist als Ritterhaus unter `Cenyr > Vortigerns Ruh > Tanwens Flamme > Mathragon` vorbereitet. Die Akte besteht bewusst nur aus dem unbekannten Gründerpaar, dem blauen Pengair-Hauswappen und genau einem anschließenden seriellen Zeitsprung; spätere Generationen bleiben bis zur Familienausarbeitung leer. Das Haus ist Herausgeber des nationalen `Kronenspiegels`. Sein Hauswappen und das eigenständige Gildenzeichen der Zeitung werden getrennt geführt.
- Haus Aelmor ist als kompakter Stammbaum mit 14 Personen und genau drei Linien unter Bledri und Nest ausgearbeitet. Goronwy führt die Hauptlinie über Owain (26), Rhodri (20) und Tegan (8) fort; alle drei bleiben unverheiratet. Madoc ist ein lediger und kinderloser Seitenzweig. Großtante Eirlys führt zu einem unbekannten Haus, während Anwen Aelmor an Bryn Braglas verheiratet ist und einen direkten Braglas-Zielknoten besitzt. Die gemeinsame Ehe wird in beiden Familienakten mit identischen Weltpersonen- und Partnerschafts-IDs geführt.
- Haus Braglas ist als kompakter Stammbaum mit 16 Personen und genau drei männlichen Linien unter Ifor und Morfydd ausgearbeitet. Cadfan führt die Hauptlinie über Geraint (26), Emyr (17) und Nerys (9) fort; Bryn und Anwen Aelmor haben die unverheirateten Söhne Madoc (21) und Iestyn (12). Meurig bleibt ledig und kinderlos. Großtante Elen besitzt einen direkten Wegverheiratet-Knoten zu einem unbekannten Haus. Alle jungen Sprösslinge sind zwischen neun und sechsundzwanzig Jahre alt und bleiben ohne Ehe oder Verlobung.
- Haus Swyll ist um Meredith Swyll (18) herum ausgearbeitet, ohne Meredith als Diagrammwurzel oder technischen Knoten zu verwenden. Hinter dem Stammwappen und dem einzigen seriellen Sprung bis 1663 folgen Emyr, seine wegverheiratete Schwester Gwenifer und der 1720 kinderlos gefallene Madryn. Emyr und Tegwen haben neun Kinder: Iestyn, fünf wegverheiratete Töchter, Owain mit zwei Kindern, den 1719 kinderlos gefallenen Cadfan und den Lebemann Rhodri. Eirwens Ehe mit Meilyr Pendrwn und Bronwens Ehe mit Iorwerth Maerllys werden in den jeweiligen Gegenakten gespiegelt; nur Carys, Llio und Nerys führen noch zu unbekannten Häusern. Meredith ist zwischen dem unverheirateten Gareth und Rhydwen das mittlere Kind Iestyns und Rhiannon Draenmelyns. Rhodris getrennte Affäre mit Morwen führt eindeutig zu den altersnahen Bastarden Carwyn und Lowri. Die 31 Personen, elf Partnerschaften, 19 Abstammungen und sechs Wegverheiratet-Knoten bleiben vom Gründerpfad aus vollständig sichtbar; ein Registry-Upgrade entfernt veraltete Beziehungen aus älteren lokalen Ständen.
- Haus Pendrwn ist als kompakte Familie mit elf Personen ausgearbeitet. Die konkrete Linie beginnt hinter dem einzigen absoluten Zeitsprung bei Emyrs Großvater Idwal; höhere konkrete Generationen wurden nicht ergänzt. Idwals Sohn Meilyr heiratet Eirwen Swyll, seine Tochter Gwenith den Söldner Caradog Draenmelyn. Beide Ehen verwenden in den Gegenstammbäumen dieselben Weltpersonen- und Partnerschafts-IDs. Emyr Pendrwn (23), seine Schwester Enid (20) und sein Bruder Cadell (17) bleiben vollständig unverheiratet und unverlobt. Das vorgegebene Portrait wird lokal ausgeliefert, und alle elf Personen sind vom Gründerpfad aus sichtbar. Ein Registry-Upgrade entfernt die frühere Tudwal-ID aus älteren lokalen Ständen.
- Haus Maerllys ist als kompakter Stammbaum mit 14 Personen ausgearbeitet. Hinter dem einzigen absoluten Zeitsprung um 1662 stehen Nias Großvater Cadfan und dessen Bruder Owain; höhere konkrete Generationen wurden nicht ergänzt. Iorwerth Maerllys heiratet Bronwen Swyll, Owain Maerllys die wegverheiratete Gwenllian Ysgrif. Owain und Gwenllian haben Geraint sowie Rhoswen, die an Madoc Tonnarth verheiratet ist; die drei Kinder dieser Ehe werden ausschließlich im Zielhaus Tonnarth geführt. Alle drei Hausverbindungen sind über gemeinsame Weltpersonen- und Partnerschafts-IDs in den Gegenstammbäumen sichtbar. Nia ist mangels vorgegebener Altersangabe vorläufig 24 Jahre alt; sie und ihre Geschwister Elowen und Rhys bleiben unverheiratet und ohne Verlobung. Das bereitgestellte Portrait wird lokal ausgeliefert, und alle 14 Personen sind vom Gründerpfad aus sichtbar.
- Haus Tonnarth ist als kompakter Stammbaum mit 25 Personen ausgearbeitet. Hinter dem einzigen absoluten Zeitsprung um 1663 stehen Llewarchs Großvater Idris und dessen wegverheiratete Schwestern Eira und Tegwen. Llewarch besitzt vier unverheiratete Geschwister, die wegverheiratete Tante Anwen sowie die Onkel Madoc und Gareth. Madoc und Rhoswen Maerllys haben die drei Vettern Bryn, Emrys und Aled; dieselbe Ehe und der Tonnarth-Zielknoten erscheinen in der Maerllys-Gegenakte. Der ledige Gareth führt ausschließlich eine beendete Affäre mit Mair, aus der der eindeutig zugeordnete Bastard Caradog hervorging. Llewarch ist 25 Jahre alt, und alle Personen unter 26 bleiben ohne Ehe oder Verlobung. Sein Portrait wird lokal ausgeliefert, und alle 25 Personen sind vom Gründerpfad aus sichtbar.
- Haus Ysgrif ist als kleiner Stammbaum mit 17 Personen ausgearbeitet. Hinter dem einzigen absoluten Zeitsprung um 1666 stehen Floyds Großvater Idris und dessen an Owain Maerllys verheiratete Schwester Gwenllian; die Ehe führt beidseitig sichtbar zu Haus Maerllys. Idris' Söhne bilden die Elternlinie Floyds, Bryns Zweig mit genau drei Vettern und den unverheirateten, kinderlosen Söldner Madoc. Floyd (21) und seine Schwestern Mair und Eleri bleiben unverheiratet und ohne Verlobung; ihre weiteren Lebenslinien sind bewusst offen. Das bereitgestellte Ysgrif-Wappen und Floyds Portrait werden lokal ausgeliefert, und der Stammbaum bleibt vollständig vom Gründerpfad aus sichtbar.
- Datenkonvention für neue Stammbäume: Wenn eine Vorlage die fortgeführte Hauptlinie nicht ausdrücklich benennt, wird zunächst der männliche Nachkomme als Linienfortführer angenommen. Eine klar belegte weibliche oder anderweitig benannte Erbfolge hat immer Vorrang vor dieser Arbeitshypothese.
- Haus Draig ist als Grafengeschlecht unter `Llamreis Ankunft > Gwynthor` mit Celtigern als eindeutigem Beginn, 163 Personen, 74 Partnerschaften und sechs Überlieferungssprüngen hinterlegt. Der untere, ab 1617 datierte Abschnitt führt Merfyns Linie über Cahir und Rhodri sowie Rhiwallons Linie über Trahern vollständig bis zu den Generationen der Gegenwart fort. Die Affären- und Bastardlinien Owains, Rhonwens erzwungene Verbindung sowie Guinevere Neidr als aufgenommener Mündel bleiben als unterschiedliche Beziehungstypen erhalten. 109 neue Tabellenportraits liegen lokal; weitere 18 geteilte Figuren verwenden die vorhandenen Bilder und Weltpersonen-IDs aus Arwydd, Gafyr, Saethwyr und Wyrm.
- Haus Wylan ersetzt seine Leerakte unter `Cenyr > Weidebucht > Cerrigarth` durch einen vollständig verbundenen Grafenstammbaum mit 115 Personen, 51 Partnerschaften, 64 Abstammungen und vier strikt seriellen Überlieferungssprüngen. Alle 28 verheirateten Wylan-Frauen, deren Linie in ein anderes Haus führt, besitzen direkt an ihrer Ehe einen Wegverheiratet-Knoten; die benannten Verlobungen Anona/Alun und Nona/Evan bleiben dagegen ohne vorweggenommenen Hauswechsel. Arawn bleibt als Sohn von Iolyn und Gladys im fortgesetzten Zweig; dort stehen seine Ehe mit Mervyne und ihre drei Kinder. Mervyne bleibt zugleich als Tochter von Gendry und Arryn sichtbar und erhält dort eine reine Arawn-Partnerkarte ohne zweite Nachkommenlinie. Rhodhri Wylan und Tanwen Hwyaden besitzen direkt unter ihrer Ehe den Gründungsknoten von Haus Créyr. 62 individuelle Wylan-Quellportraits liegen lokal vor, weitere 18 Weltpersonen verwenden dieselben Bilder und Beziehungs-IDs wie ihre Gegenakten in Draig, Gwefrydd, Illewod, Neidr, Pendrag, Pysgod, Aderyn, Grawn und Wyrm.
- Haus Hwyaden O'Trefyddin ersetzt seine vorbereitete Akte unter `Cenyr > Weidebucht > Borkenstein > Trefyddin` durch einen vollständigen Baronstammbaum mit 48 Personen, 22 Beziehungen, 25 Abstammungen und zwei strikt seriellen Überlieferungssprüngen. Acht wegverheiratete Hwyaden-Frauen besitzen direkte Zielhausknoten; Rhodhri Wylan und Tanwen Hwyaden tragen stattdessen unmittelbar den Gründungsknoten von Haus Créyr. Kinder hausübergreifender Ehen erscheinen ausschließlich in der zuständigen Fortsetzungsakte. Die Namensvarianten Cadwg/Catwg, Ewyas/Emyas und Delilah/Deliah sind ohne Doppelpersonen aufgelöst; 19 neue Individualporträts liegen lokal vor, weitere Weltpersonen verwenden die kanonischen Bilder ihrer Gegenakten.
- Haus Blodyn ist in zwei bewusst getrennten Registerakten angelegt. Das Königshaus `haus-blodyn` liegt unter `Vennyr > Blütenland > Baronie Hoyers Krone > Lyndor` und umfasst 91 Personen, 42 Partnerschaften, 49 biologische, beanspruchte oder Pflege-Abstammungen, zwanzig Wegverheiratet-Knoten, den direkt unter Yvain/Bronwen liegenden Aberdail-Hausknoten und zwei strikt serielle Überlieferungssprünge. Die Baronialakte `haus-blodyn-aberdail` liegt unter `Cenyr > Klaueninsel > Blutklaue > Aberdail` und enthält ausschließlich Yvain Blodyn, Bronwen Blaidd sowie ihre Söhne Dalvin und Erec. Diese beiden Kinder werden in Lyndor nicht wiederholt. Arryn Blodyn bleibt gemäß der ausdrücklichen Wylan-Korrektur Gendrys Ehefrau; die alte Variante Caryln wird nur als Quellenwiderspruch dokumentiert. Tarrant Arth und Telyn Diafol sind als aufgenommene Mündel statt als leibliche Blodyn-Kinder erfasst. Alle 57 individuellen Quellportraits und die bereitgestellten Regionswappen liegen lokal vor; geteilte Personen verwenden die kanonischen Bilder und Beziehungs-IDs ihrer Gegenakten.
- Haus Bleiddorn ist als frisches Ritterherrenhaus unter `Cenyr > Celtigerns Wacht > Llamreis Ankunft > Gwynthor` registriert. Die kompakte Auswanderungsakte enthält ausschließlich Hrolf Wolfshorn mit seiner Frau Liv, Hrolfs Bruder Halvar sowie die Kinder Ylva und Asgeir. Ein vorgelagerter, zur vollständigen Herkunftsakte verlinkter Wolfshorn-Knoten hält Hrolf und Halvar als Brüder zusammen; unter Hrolfs und Livs bestehender Ehe steht das silbern gerahmte Bleiddorn-Wappen, darunter ausschließlich Ylva und Asgeir. Alle fünf Personen, die Ehe und beide Abstammungen verwenden dieselben stabilen Identitäten wie Clan Wolfshorn. Umgekehrt verweist dort ein kleines, seitlich an Hrolf gesetztes Bleiddorn-Wappen auf die neue Akte. Dieser Auswanderungszweig ist ausdrücklich kein Kind- oder Generationsknoten; keine Wolfshorn-Person wird aus der Herkunftsakte entfernt.
- Haus Dubhan ist als neue, niedere Ritterlinie unter `Cenyr > Celtigerns Wacht > Llamreis Ankunft > Gwynthor` registriert. Die Auswanderungsakte enthält ausschließlich Breccan Dubhan, seine Frau Eithne sowie ihre Kinder Rogaire und Alpin. Ein vorgelagerter Knoten der Sept Dubhan verlinkt zur vollständigen Faelaorn-Herkunftsakte; unter Breccans und Eithnes bestehender Ehe steht das neue silbern gerahmte Hauswappen, darunter ausschließlich die beiden Kinder. Alle vier Personen, die Ehe und beide Abstammungen verwenden dieselben stabilen Identitäten wie die Sept-Akte. Dort verweist umgekehrt ein kleines, seitlich an Breccan gesetztes Haus-Dubhan-Wappen auf die Gwynthor-Linie. Der Auswanderungszweig bleibt außerhalb aller Kinderlisten und Generationen.
- Haus von Hochreuth ist als Ritterherrenhaus unter `Goldmund > Unsortierte Häuser` registriert; das bereitgestellte Goldmund-Wappen kennzeichnet den obersten Registerordner. Die Akte umfasst 27 Personen, neun Ehen, Friedrichs Verlobung, 16 Abstammungen und drei direkte Wegverheiratet-Knoten ohne künstlichen Zeitsprung. Unter dem Stammwappen folgen neutral Friedrichs Söhne Albrecht, Wilhelm und Leopold sowie seine wegverheiratete Tochter Dorothea; fokusabhängige Bezeichnungen wie „Linie A–D“ oder ruprechtbezogene Verwandtschaftstitel erscheinen nicht auf den Karten. Albrecht und seine drei Söhne tragen einheitlich den Kartentext „Tod beim Jagdausflug“. Luise, Wilhelms Tochter Friederike und Dorothea sind jeweils mit einem unbekannten Haus verknotet. Friedrichs Sohn Friedrich ist mit Ottilie verlobt. Charlotte Roden ist mit dem bereitgestellten Roden-Wappen als Angehörige dieses Hauses erfasst und bleibt Ottos Mutter. Ruprecht erbt weiterhin rechtmäßig über Wilhelm; erst 1736 setzt Haus Roden den mütterlich verwandten Otto politisch ein. Alle übrigen Angeheirateten bleiben ohne erfundene Nachnamen. Die drei belegten Portraits sowie Hochreuth-, Roden- und Goldmund-Wappen werden lokal ausgeliefert.
- Haus Weinlaub ist als niederes Rittergeschlecht unter `Weisenfluh > Region Ewigensee > Ewigensee` registriert. Die kompakte Akte umfasst neun Personen, vier Ehen und vier Abstammungen. Ein unbekanntes Gründerpaar steht am Beginn; direkt darunter folgen das Weinlaub-Wappen, genau ein absoluter serieller Zeitsprung und erst dann Gideons Großvater Salomon mit Rebekka. Josiahs erste Ehe mit Rahel führt zu Gideon, seine zweite Ehe mit Miryam getrennt davon zu Elias. Gideon bleibt als erstgeborener Sohn genealogisch sichtbar, trägt aber eindeutig den Status des 1728 enterbten und verstoßenen fahrenden Ritters. Elias ist als jüngerer Halbbruder und bevorzugter Erbe der zweiten Ehe gekennzeichnet. Die Konfliktdaten halten Rahels frühen Tod, Josiahs Wiederheirat, Miryams Einfluss und die Ersetzung Gideons ausdrücklich fest. Gideons Portrait sowie die in der Modulvorlage belegten Platzhalter für Josiah, Elias und Miryam, das Weinlaub-Wappen und das Weisenfluh-Wappen werden lokal ausgeliefert.
- Haus Falveri ist unter `Venalys` ausdrücklich als Magnarierhaus und nicht als eines der fünf Patrizier-Gründerhäuser registriert. Dafür besitzt das Rangmodell die eigenständigen venalischen Stände Patrizier, Magnarier, Mercantier und Plebejer; die Profilanzeige verwendet „Stadtrepublik“ statt „Königreich“. Die große Akte umfasst 60 Personen, 18 Ehen, zwei Affären, 39 Abstammungen, fünf Wegverheiratet-Knoten und einen strikt seriellen Zeitsprung. Auf das unbekannte Gründerpaar folgen Silberwappen, Überlieferungssprung und Aldos Großeltern Valerian und Valeria. Die Hauptlinie verläuft über Senarian, Valerius, Valerian und Honorian; Aldo sitzt dagegen als unverheirateter zweiter Sohn im politisch unbedeutenden Rationius-Zweig. Fünf erwachsene Falveri-Frauen sind an unbekannte Häuser wegverheiratet, während die unter 29-Jährigen unverheiratet bleiben. Civerians Affäre mit Livia führt ausschließlich zu Bellarellus und Venturina, Potenians Affäre mit Celia ausschließlich zu Victorellus; damit sind alle drei Bastarde sichtbar ihrer Mutter zugeordnet. Die ergänzten Namen folgen den Stämmen und Endungen der Lingua Argenti. Aldos Portrait sowie Falveri- und Venalys-Wappen werden lokal ausgeliefert.
- Haus Karreg ist als niederes Rittergeschlecht unter `Morgorn > Region Felsbreche > Felsbreche` registriert; Burg Karregwacht ist der zusätzliche Stammsitz, Haus Eisenherz das Lehnshaus. Die Akte umfasst 31 Personen, zehn Ehen, 20 Abstammungen, zwei direkte Wegverheiratet-Knoten und einen strikt seriellen Zeitsprung. Nach unbekanntem Gründerpaar, silbern gerahmtem Karreg-Wappen und Überlieferungssprung setzt die namentliche Linie bei Keldrans Großvater Karhald ein. Dessen Söhne Brennar, Vethran und Halchor bilden exakt drei Hauslinien. Brennars ältester Sohn Thoran ist das gegenwärtige Oberhaupt; Keldran ist 1740 sechsunddreißig Jahre alt und bewusst der einzige unverheiratete Karreg über dreißig. Sämtliche lebenden Personen unter 29 bleiben unverheiratet. Affären und Bastarde kommen nicht vor. Die ergänzten Namen folgen den dokumentierten Morgar/Karnrith-Stämmen und Endformen; die wechselnde Modulschreibweise Karrag/Karreg ist gemäß aktueller Vorgabe einheitlich zu Karreg normalisiert. Keldrans Portrait sowie Karreg- und Morgorn-Wappen werden lokal ausgeliefert.
- Haus Scandyn ist als niederes Rittergeschlecht unter `Aeldrunmar > Earltum der Tharn > Thaintum Trenmorath > Scandmere` registriert und dient Haus Tharn. Die Akte umfasst 37 Personen, zwölf Ehen, 24 Abstammungen, zwei direkte Wegverheiratet-Knoten und einen strikt seriellen Zeitsprung. Nach unbekanntem Gründerpaar, silbern gerahmtem Scandyn-Wappen und Überlieferungssprung setzt die namentliche Linie bei Cenrics Großvater Ealdwine ein. Seine drei Söhne Osric, Beornwulf und Eadric begründen Hauptlinie, zweiten Küstenzweig und den entbehrlichen dritten Zweig. Die Hausnachfolge läuft über Osric, Theodric und Leofric. Cenric bleibt als 23-jähriger zweiter Sohn Eadrics hinter seinem älteren Bruder Alden ohne nennenswerten Erbanspruch und kann als fahrender Særinc aufbrechen. Sämtliche lebenden Personen unter 29 bleiben unverheiratet; alle lebenden Scandyn ab dreißig besitzen eine Ehe. Affären und Bastarde kommen nicht vor. Die ergänzten Namen sind angelsächsisch-rohirimisch geprägt. Cenrics Portrait sowie Scandyn- und Aeldrunmar-Wappen werden lokal ausgeliefert.
- Haus Thornwick ist als heimatloses niederes Rittergeschlecht unter `Talyndor > Earltum der Warren > Thaintum der Warren > Thornholt` registriert und dient traditionell Haus Warren. Die kompakte Akte umfasst 16 Personen, sechs Ehen, neun Abstammungen, einen direkten Wegverheiratet-Knoten und einen strikt seriellen Zeitsprung. Nach unbekanntem Gründerpaar und silbern gerahmtem Hauswappen setzt die namentliche Linie bei Refris Großvater Garric ein. Zehn Angehörige sterben zwischen dem Fall der Waldburg Thornholt 1720 und der öffentlichen Hinrichtung von Aldric und Elwyn 1739. Refri ist 1740 fünfundzwanzig Jahre alt, führt das heimatlose Haus und ist neben ihrer bereits vor dem Krieg wegverheirateten Tante Rowena und ihrem weiterhin bei den Blauschwingen kämpfenden Vetter Wulstan eine von nur drei bekannten Thornwick-Überlebenden. Refris Portrait, die kanonischen Elternbilder sowie Thornwick- und Talyndor-Wappen werden lokal ausgeliefert.
- Sept Daire ist als einfache bürgerliche Sept von Hügelbewohnern unter `Ceitheach > Tir na Dorcha > Tír na Droma > Tulachinis` registriert und stand unter den Mac Tuirseach. Die bewusst kleine Akte umfasst elf Personen, vier Ehen, sechs Abstammungen und einen strikt seriellen Zeitsprung. Nach unbekanntem Gründerpaar und eisern gerahmtem Sept-Wappen beginnt die namentliche Familie bei Lorcáns Großvater Donnchadh. Darunter folgen nur die beiden Brüder Ciarán und Fergus mit ihren insgesamt drei Kindern. Die Männer werden als Tiarna-Krieger geführt; Donnchadh, Ciarán, Fergus und Conall fallen ausdrücklich im Kriegsaufgebot. Die Frauen behalten ausschließlich ihre zivilen Berufe als Vorratsverwalterin, Weberin und Kräutersammlerin, Gerberin beziehungsweise Töpferin. Acht namentliche Angehörige sterben zwischen dem Kriegsbeginn 1720 und dessen unmittelbaren Folgen bis 1723; Lorcán bleibt als einziger Daire am Leben. Er ist 1740 achtunddreißig, besitzt weder eine erfundene Ehe noch Nachkommen und verlässt nach dem Dienst bei Clan Dal’Leite die albischen Fürstentümer. Lorcáns Portrait, das schlichte Daire-Symbol sowie die Wappen Ceitheachs und Tir na Dorchas werden lokal ausgeliefert.
- Haus Gwefrydd ist als leeres Baronengeschlecht unter `Cenyr > Celtigerns Wacht > Artus Streben > Rhosmere`, Haus Gwyvern unter `Cenyr > Celtigerns Wacht > Gwendolyns Ufer > Abergwint` vorbereitet. Ihre Haus- und Regionswappen liegen gemeinsam mit den Symbolen von Cenyr, Celtigerns Wacht, Llamreis Ankunft und Rhonwens Tränen lokal unter `assets/images/`.
- Haus Annwyl ersetzt seine frühere Leerakte unter `Cenyr > Celtigerns Wacht > Gwendolyns Ufer > Côr Mynyddfaen` durch einen zusammenhängenden Stammbaum mit 20 Personen, acht Ehen, elf Abstammungen, vier Zielhausknoten und elf lokalen Portraits. „Anwyll“ wird als Schreibvariante behandelt und erzeugt keine doppelte Familienakte. Die nicht einzeln überlieferten Generationen nach Sir Willard stehen als einzelner absoluter Trenner unter dem silbern gerahmten Hauswappen. Eithne, Elowen und Esyllt führen zu unbekannten Häusern; Wilff bleibt biologischer Annwyl-Nachkomme, trägt als fortgegebenes Mündel den entsprechenden Rahmen und besitzt direkt unter seiner Karte die Verknüpfung zu Haus Penwyn.
- Haus Seldryn ersetzt seine Leerakte in Abergwint durch einen lückenlos verbundenen Stammbaum mit 25 Personen, neun Ehen und 15 Abstammungen. Lugh und Bronwen Balchder verwenden in beiden Häusern dieselben Weltpersonen, dieselbe beendete Ehe und Lughs neueres Seldryn-Portrait. Braint ist gegenwärtiges Oberhaupt; Cynon, Hirlas und Maelron bilden die belegte Erbfolge. Aelwen und Celynnen führen keine Seldryn-Nachkommen und besitzen deshalb direkte Wegverheiratet-Knoten zu unbekannten Häusern. Die jüngste Generation bleibt ohne erfundene Partnerschaften; 16 neue und ein hausübergreifend synchronisiertes individuelles Portrait liegen lokal vor. Da alle fünf Generationen direkt belegt sind, enthält der Stammbaum keinen Zeitsprung.
- Haus Cysgodion ersetzt seine Leerakte in Abergwint durch 34 Personen, 13 Ehen und 20 Abstammungen. Unter Cadwaladers silbern gerahmtem Gründerwappen folgt genau ein absoluter serieller Überlieferungssprung zu Cynfelyn, Cerys und Colwyn; die zwei namenlosen historischen Oberhäupter bleiben innerhalb dieser Lücke, statt als erfundene Personen aufzutauchen. Yorath ist gegenwärtiges Oberhaupt, Cefin und Carys bilden die Erbfolge. Cerys, Eirwen und Betrys besitzen direkte Wegverheiratet-Knoten zu unbekannten Häusern. Astrid ist nach Ehezeile und Figurenbeschreibung die Mutter von Folant und Glendower; die abweichende Kinderüberschrift „Catrin“ wird nicht als zusätzliche Person angelegt. 24 individuelle Portraits liegen lokal vor, die jüngste Generation bleibt ohne erfundene Partnerschaften.
- Haus Daran ersetzt seine Leerakte am eigenen Sitz Garwfaen durch 16 Personen, fünf Ehen und zehn Abstammungen. Maelgwyn und Nest bilden das 1720 erhobene Gründerpaar; ihre vier Kinder folgen lückenlos unter dem silbernen Hauswappen, weshalb kein Zeitsprung vorkommt. Seithved und Lleu bilden die belegte Erbfolge. Angharad besitzt an ihrer Ehe den direkten Wegverheiratet-Knoten zu einem unbekannten Haus. Maelgwyns früherer Dienst als Page und Knappe Baron Seithved Gwyverns wird durch Mündelrahmen, direkten Gwyvern-Zielknoten und eine synchronisierte Pflegebeziehung in der Gwyvern-Gegenakte festgehalten. Morcant Trydar erscheint als aufgenommener Mündel und Knappe Sir Seithved Darans und bleibt dieselbe Weltperson wie in seiner biologischen Trydar-Akte. Die fünf namenlosen Verlobtenfelder der jüngsten Generation werden nach der gezeichneten Stammbaumgrafik nicht als reale Beziehungen erfunden. Zwölf neue und Morcants wiederverwendetes individuelles Portrait sind lokal auslieferbar.
- Haus Edmy ersetzt seine Leerakte in Abergwint durch 35 Personen, zwölf Ehen und 22 Abstammungen. Unter Edmwnds silbern gerahmtem Gründerwappen folgt genau ein absoluter serieller Überlieferungssprung zu Conwy, Mererid und Bowen. Caledfwlch ist gegenwärtiges Oberhaupt; Digain, Gerallt und Peredur bilden die belegte Erbfolge. Peredur bleibt ein biologischer und dynastischer Edmy, ist aber als Mündel und Knappe an Haus Penwyn vermittelt; Llinos bleibt Ederns biologische Tochter und ist ebenfalls Mündel der Penwyn. Beide tragen den Mündelrahmen und besitzen unmittelbar unter ihrer Karte einen eigenen Penwyn-Zielhausknoten. Mererid und Efanna besitzen direkte Wegverheiratet-Knoten zu unbekannten Häusern, Catelyn den direkten Knoten zu Haus Penwyn und Melangell den zu Haus Cenfig. Catelyn und Rhys verwenden in Edmy und Penwyn dieselben Weltpersonen, dieselbe Ehe und dieselben Portraitdateien. Die fehlerhaften generischen Ehezeilen werden nach der gezeichneten Stammbaumgrafik aufgelöst: Bran und Efanna besitzen namenlose Partner, die Isobeliten Brochwel, Celyddon und Derwen sowie Anwärter Aedd bleiben unverheiratet. 22 neue und zwei wiederverwendete individuelle Portraits sind lokal auslieferbar.
- Haus Barus ersetzt seine Leerakte in Abergwint durch 20 Personen, acht Ehen und elf Abstammungen. Unter Martyns silbern gerahmtem Gründerwappen folgt genau ein absoluter serieller Überlieferungssprung zu Macsen, Arianwen und Madoc. Macsen ist nach Genealogie und ausführlicher Gegenwartsbeschreibung das lebende Oberhaupt; das einzelne widersprüchliche Kreuz in der Hierarchieleiste ist dokumentiert. Wyett bildet die belegte Erbfolge. Arianwen, Isolde und Llawen besitzen an ihren Ehen jeweils einen direkten Wegverheiratet-Knoten zu einem unbekannten Haus. Cerrin Balchder und Wyett Barus verwenden in beiden Hausakten dieselben Weltpersonen, dieselbe Ehe und die anhand der neueren Barus-Quelle aktualisierten Portraitdateien; ihre Kinder Haulwen und Ystwyth werden ausschließlich im Barus-Stammbaum geführt. Cerrins Herkunftswappen erzeugt keinen parallelen Fremdhausknoten. Die vier Kinder der jüngsten Generation bleiben ohne erfundene Partnerschaften. Zehn neue und zwei wiederverwendete individuelle Portraits sind lokal auslieferbar.
- Haus Cenfig ersetzt seine Leerakte in Abergwint durch 31 Personen, zwölf Ehen und 18 Abstammungen. Unter Steffans silbern gerahmtem Gründerwappen folgt genau ein absoluter serieller Überlieferungssprung zu Rhodri, Siwan und Osian. Mathon ist gegenwärtiges Oberhaupt; Folant ist der ausdrücklich benannte Erbe. Siwan, Hiraeth, Llawen, Nela und Awela besitzen an ihren Ehen jeweils einen direkten Wegverheiratet-Knoten zu einem unbekannten Haus. Melangell Edmy und Lleward Cenfig verwenden in beiden Hausakten dieselben Weltpersonen, dieselbe Ehe und dieselben Portraitdateien; ihre Kinder Llowarch und Awela werden ausschließlich im Cenfig-Stammbaum geführt. Die nur allgemein belegte Abstammung aus einer nicht anerkannten Bastardlinie der alten Conbhrón erzeugt keine erfundene oder parallele Herkunftsinsel. Alle sieben Kinder der jüngsten Generation bleiben ohne erfundene Partnerschaften. 17 neue und zwei wiederverwendete individuelle Portraits sind lokal auslieferbar.
- Das Bürgerhaus Caerlaen ersetzt seine Leerakte in Abergwint durch 28 Personen, zwölf Verbindungen und 15 Abstammungen. Unter Moriens und Izoldas eisern gerahmtem Hauswappen folgt genau ein absoluter serieller Überlieferungssprung zu Carwyn und Trayvon. Tudor ist gegenwärtiges Oberhaupt; Merlyn und Urian bilden die belegte Erbfolge. Moriens Ausbildung durch einen Balchder-Gelehrten ist keine belegte Mündelvermittlung und erzeugt daher weder Mündelrahmen noch Zielhausknoten. Iseult/Dalvin, Miraeth/Caderyn und Meilyr/Ywen bleiben mit den Balchder-, Rhuddgar- und Caerthwyn-Gegenakten synchron; Kinder werden nur im jeweils fortführenden Haus geführt. Iseult und Miraeth besitzen direkte Wegverheiratet-Knoten zu den Ritterhäusern Balchder und Rhuddgar. Ywen ist dagegen die nach Caerlaen verlobte Partnerin, weshalb ihr Herkunftshaus hier keinen parallelen Knoten erzeugt. Die vier Kinder der jüngsten Generation bleiben ohne erfundene Partnerschaften. 13 neue und sechs wiederverwendete individuelle Portraits sind lokal auslieferbar.
- Das Bürgerhaus Caerthwyn ersetzt seine Leerakte in Abergwint durch 30 Personen, zehn Verbindungen und 19 Abstammungen. Unter Sadwyns und Mervynnes eisern gerahmtem Hauswappen folgt genau ein absoluter serieller Überlieferungssprung zu Bowen und Sath. Sadwyns Kindheit als Mündel bleibt biographischer Hintergrund und erzeugt nach Vorgabe weder einen Fortgegeben-Rahmen noch einen Gwyvern-Zielknoten. Bowen ist gegenwärtiges Oberhaupt; Adeon, Sion und Gwil bilden die belegte Erbfolge. Elowen/Rhon sowie Emyrs/Serenna bleiben mit den Taranvyr- und Rhuddgar-Gegenakten synchron: Caelan wird nur in Taranvyr, Rhun und Llinos nur in Caerthwyn geführt. Elowen besitzt den direkten Wegverheiratet-Knoten zu Haus Taranvyr, Ywens belegte Verlobung den Wegverlobt-Knoten zu Haus Caerlaen. Die jüngste Generation bleibt ohne erfundene Partnerschaften. 24 neue und vier wiederverwendete individuelle Portraits sind lokal auslieferbar.
- Haus Tawelgar ersetzt seine Leerakte in Abergwint durch 34 Personen, 13 Ehen und 20 Abstammungen. Unter Brinthans und Gwenllians silbern gerahmtem Gründerwappen folgt genau ein absoluter serieller Überlieferungssprung zu Maredudd, Merriam und Karris. Harri ist gegenwärtiges Oberhaupt; Marwin und Brizio bilden die belegte Erbfolge. Merriam besitzt den direkten Wegverheiratet-Knoten zu Haus Rhuddgar, Gwendolen den zu Haus Seldryn und Emlyn den zu Haus Chwedonol, wo Romney und ihre Kinder die matriarchale Linie fortführen. Maredudd/Kerrilyn, Merriam/Wyndham und Emlyn/Romney verwenden hausübergreifend dieselben Weltpersonen und Ehen; Emlyns Geburtsjahr 1707, Herkunft und Portrait werden zugleich in der Chwedonol-Gegenakte nachgezogen. Die widersprüchlichen Angaben „Artur“ für den Gründer und „1720“ als angebliches Geburtsjahr Harris werden nach den mehrfach belegten Formen Brinthan und 1674 aufgelöst. 24 neue und fünf wiederverwendete individuelle Portraits sind lokal auslieferbar.
- Haus Ymladd ersetzt seine Leerakte in Abergwint durch 23 Personen, sieben Ehen und 15 Abstammungen. Unter Dafydds und seiner namenlos überlieferten Ehefrau silbern gerahmtem Gründerwappen folgt genau ein absoluter serieller Überlieferungssprung zu Hedd, Gruffydd und Garan. Hedd ist gegenwärtiges Oberhaupt; Idris und Emeric bilden die belegte Erbfolge. Hedds Kinder sind Idris und Idwal, Garans Kinder Alistair und Keneth; Gruffydd besitzt keine Ehe oder Nachkommen. Die acht Kinder der jüngsten Generation bleiben unverheiratet. Da keine Ymladd-Person als wegverheiratet oder als Mündel belegt ist, enthält die Akte keine erfundenen Fremdhausknoten. Alle 16 individuellen Portraits liegen lokal vor, die sieben unbekannten Ehefrauen verwenden neutrale Silhouetten.
- Haus Penwyn ersetzt seine Leerakte am eigenen Sitz Morddyn durch 34 Personen, zwölf Partnerschaften und 21 Abstammungen. Auf das namenlose Gründerpaar und sein Hauswappen folgt genau ein serieller Überlieferungssprung zu Myrddon, Morfydd und Mervin. Rhys ist Oberhaupt; Cadfael, Myriad und Gruffyd bilden die belegte Erbfolge. Rhoswyn/Brychan verwenden dieselben Weltpersonen und dieselbe Ehe wie Haus Awenydd. Morfydd und Braith besitzen direkte Wegverheiratet-Knoten zu unbekannten Häusern, Rhoswyn den direkten Knoten zu Haus Awenydd. Marared führt dagegen die Penwyn-Linie über Dafydd und Braith fort. 21 neue und zwei wiederverwendete individuelle Portraits sind lokal auslieferbar.
- Haus Rhuddgar ersetzt seine Leerakte am selben Sitz durch die 41 belegten Personen umfassende Linie vom „Wolf“ und den Brüdern Arfon/Arawn bis zur Generation von 1740. Arfons Hauswappen steht vor genau einem seriellen Überlieferungssprung; Kopfschaft und Erbfolge bleiben getrennt von den Nebenlinien. Frewi führt mit Ulysses, Ceron und Cari ausdrücklich eine Rhuddgar-Linie fort und wird nicht wegverheiratet. Serenna, Gwladus und Dolena besitzen dagegen die passenden Zielhausknoten. Sulwen, Melyn, Iob, Brenn, Teyna, Talwyn, Ceron und Cari bleiben unverheiratet; anonyme Tabellenfelder werden nicht als Ehepersonen angelegt. 36 individuelle Portraits liegen lokal vor.
- Haus Gwyntog ersetzt seine Leerakte in Abergwint durch 33 belegte Personen, 13 Partnerschaften und 19 Abstammungen. Auf das Gründerpaar um Llywarch den Grauen folgen Hauswappen und genau ein serieller Überlieferungssprung zu Ithel und Ioan. Ithel/Gwladus sowie Alastair/Genofeva verwenden dieselben Weltpersonen und Partnerschaften wie Rhuddgar beziehungsweise Balchder. Nudd ist der ausdrücklich benannte Erbe; Doged steht in der anschließenden Erbfolge. Owena und Manon sind an unbekannte Häuser wegverheiratet und führen die Linie nicht fort; Adda und Endaf sind Elians Kinder. Gereints Ehe, seine Affäre mit Alva und der nicht anerkannte Bastard Sten bleiben getrennte Beziehungen. 19 neue und drei wiederverwendete individuelle Portraits sind lokal auslieferbar.
- Haus Trydar ersetzt seine Leerakte in Abergwint durch 24 Personen, acht Partnerschaften und 15 Abstammungen. Auf Maelors Hauswappen folgt genau ein serieller Überlieferungssprung zu Morgan und Cadfan. Morgan ist Oberhaupt; Pryce und Maldwyn bilden die ausdrücklich benannte Erbfolge. Morgan und Dolena sind mit Haus Rhuddgar als dieselben Weltpersonen und dieselbe Ehe verknüpft. Maeryn besitzt als wegverheiratete Tochter Cadfans den Zielknoten eines unbekannten Hauses. Morcant wurde als Knappe Sir Seithved Darans an Haus Daran und Talon als Knappe an Haus Draig vermittelt; beide tragen den Mündelrahmen und einen direkten Zielhausknoten. Die jüngste Generation bleibt ohne erfundene Partnerschaften. 15 neue und zwei wiederverwendete individuelle Portraits sind lokal auslieferbar; widersprüchliche Quellenbeschriftungen bei Pryce und Eynion sind dokumentiert und nach Stammbaum sowie Figurenbeschreibungen aufgelöst.
- Haus Taranvyr ersetzt seine Leerakte in Abergwint durch 35 Personen, zwölf Partnerschaften und 22 Abstammungen. Auf Rhydians und Vanoras Hauswappen folgt genau ein serieller Überlieferungssprung zu Kenyon und Kerrilyn. Die ausdrückliche Erbfolge lautet Kenyon, Hywel, Powell, Kane und Marvo. Kenyon und Talaith sind mit Haus Gwyvern als dieselben Weltpersonen und dieselbe Ehe verknüpft. Kerrilyn besitzt den Wegverheiratet-Knoten zu Haus Tawelgar, Linessa den zu Haus Selog; Herkunftswappen eingeheirateter Partner werden nicht als parallele Hausknoten dupliziert. Die jüngste Generation bleibt ohne erfundene Partnerschaften. 33 neue und zwei wiederverwendete individuelle Portraits sind lokal auslieferbar.
- Haus Selog ersetzt seine Leerakte in Abergwint durch 33 Personen, zwölf Partnerschaften und 20 Abstammungen. Auf Gwerthrynions Gründerwappen folgt genau ein serieller Überlieferungssprung zu Padarn, Marchell und Rhun. Die Kopfschaft läuft über Padarn zu Godwyn, die Erbfolge weiter über Adda, Afan und Drystan. Godwyn/Linessa und Meggan/Lewys sind mit ihren Taranvyr- und Rhuddgar-Gegenakten als dieselben Weltpersonen und Ehen verknüpft. Marchell und Sioned besitzen direkte Wegverheiratet-Knoten zu unbekannten Häusern, Meggan den direkten Knoten zu Haus Rhuddgar. Die jüngste Generation bleibt ohne erfundene Partnerschaften; 18 neue und vier wiederverwendete Portraits sind lokal auslieferbar.
- Haus Marchog O'Glyndraith ersetzt seine vorbereitete Ährental-Akte durch 49 Personen, 20 Partnerschaften und 28 Abstammungen. Der goldene Hausknoten liegt zwischen den unbekannten Eltern und Bréannain, damit Bréannain trotz seiner zwei Ehen der einzige namentliche Gründer bleibt und sämtliche Kinder ihren richtigen Müttern zugeordnet werden. Mari und Mabli bilden zwei getrennte Affären; Enora und Evain hängen jeweils ausschließlich unter ihrer tatsächlichen Mutter. Die Erbfolge verläuft über Rhodrhi, Hevedydd, Llyonell, Brizio und Caraf. Rhianu besitzt den direkten Wegverheiratet-Knoten zum unbekannten Haus, Gwenaelle den zu Haus Canwyll. Llyonell/Glenys Grawn sowie Tirian/Eiddwen Tir Addawol verwenden dieselben Weltpersonen, Partnerschaften und Portraitdateien wie ihre Herkunftsakten; ihre Kinder werden nur im Marchog-Baum fortgeführt. 33 neue und vier wiederverwendete Quellporträts liegen lokal vor, zwölf unbelegte Karten verwenden neutrale Systemplatzhalter. Die Akte bleibt ohne künstlichen Zeitsprung und ist als Ritterfürstenhaus unter `Cenyr > Ährental > Tristams Ebene > Glyndraith` registriert.
- Haus Morcanhuc O'Glyndraith ersetzt seine vorbereitete Ährental-Akte durch 13 Personen, vier Ehen und acht Abstammungen. Charlton und Deidrie bilden die belegte Elterngeneration; der goldene Hausknoten folgt unmittelbar darunter und führt ohne erfundenen Zeitsprung zu Arthos, Bricelyn und Barwyn. Arthos bleibt der ausdrücklich 1720 erhobene Gründer und führt mit Ywen Grawn zu Charlton, Deidrie, Ianto und Iorwerth. Dieselbe Ehe erscheint in Grawn nur als Wegheirat ohne zweite Kinderlinie. Bricelyn ist eine Morcanhuc-Tochter und wird direkt an Imanies Haus Marchog wegverheiratet; Rhon und Corryn erscheinen ausschließlich in der dort fortgeführten Marchog-Akte. Barwyn und Lowri führen zu Ellanah. Die Erbfolge lautet Arthos, Charlton, Ianto und Iorwerth; die jüngste Generation bleibt unverheiratet. Neun neue und vier kanonisch wiederverwendete Quellporträts liegen lokal vor. Die Akte ist als Ritterfürstenhaus unter `Cenyr > Ährental > Tristams Ebene > Glyndraith` registriert.
- Haus Baedd O'Eirwyn ersetzt seine vorbereitete Ährental-Akte durch 46 Personen, 19 Ehen und 26 eindeutige Abstammungen. Die vollständige Stammbaumgrafik ergänzt den Ursprung über Tàmhas Warthog und Ceridwen Grawn zu deren Töchtern Caolphionn, Maemhuire und Aislaith. Maemhuire ist mit Fuirseach Fionghal verheiratet und wird direkt an Haus Ua Fíonnghal wegverheiratet. Aislaith und Rhun bilden das Gründerpaar; der goldene Baedd-Hausknoten folgt direkt unter ihnen und der einzige belegte Überlieferungssprung wiederum strikt darunter vor Dyfnwal, Blodeuwedd und Gwalchmai. Sieben endende Frauenlinien erhalten direkte Wegverheiratet-Knoten. Gemeinsame Ehen mit Grawn, Dienyddiwr, Créyr, Llwynog, Dyngwn, Marchog und Blach verwenden dieselben Weltpersonen- und Beziehungs-IDs. Kinder werden nur in der tatsächlich fortführenden Akte gezeigt: Blodeuwedds Dienyddiwr-Kinder, Meriadocs Créyr-Kinder und Kerenzas Marchog-Kinder erscheinen nicht ein zweites Mal bei Baedd. 17 neue und zwölf kanonisch wiederverwendete Quellporträts liegen lokal vor; neutrale Altquellen-Silhouetten bleiben Systemplatzhalter. Die Akte ist als Baronengeschlecht unter `Cenyr > Ährental > Eberkamm > Eirwyn` registriert.
- Haus Ciaróg O'Caer Diwedd ersetzt seine vorbereitete Ährental-Akte durch 51 Personen, 21 Verbindungen und 30 eindeutige Abstammungen. Brogan und Hailidhe führen über das goldene Hauswappen in genau einen seriellen Überlieferungssprung vor die ab 1602 belegte Generation. Emer Casur ist genau einmal als aufgenommenes Mündel Karantegs erfasst und zugleich mit Loyd verlobt; ihre parallelen Karten werden direkt waagerecht verbunden, ohne U-förmigen Umweg und ohne Doppelkarte. Ultán Tir Fiachiontach ist ausschließlich Dyfans aufgenommenes Mündel. Beide Pflegebeziehungen sind ausdrücklich keine biologischen Abstammungen und verwenden den dunkelblauen Mündelrahmen. Gwenog, Alys, Gwennaelle, Ulyana, Orla, Wynndie und Cymraes besitzen direkte Wegverheiratet-Knoten. Dystan/Gwenog, Vaughan/Ulyana und Lyon/Cymraes verwenden dieselben Weltpersonen, Partnerschaften und Porträts wie Grawn, Baedd und Marchog; ihre Kinder werden nur in der jeweils fortführenden Gegenakte gezeigt. 32 neue und fünf wiederverwendete Quellporträts liegen lokal vor, 14 Standardsilhouetten bleiben Systemplatzhalter. Die Akte ist als Ritterfürstenhaus unter `Cenyr > Ährental > Graue Bucht > Caer Diwedd` registriert.
- Haus Sgwarnog O'Aldwynd ersetzt seine vorbereitete Ährental-Akte durch 39 Personen, 16 Ehen und 22 eindeutige Abstammungen. Mael und Meiriona bilden das Gründerpaar; unter ihrem goldenen Hauswappen folgt genau ein absoluter serieller Überlieferungssprung zu Mathonwy und Morfudd. Die Baronsfolge läuft über Mathonwy, Maldwyn und Morcant, die Erbfolge über Mabon, Math und Mael. Morfudd, Magwena, Myfanwy, Meiriona, Marsaili, Mabil, Meghan und Meinir besitzen direkte Wegverheiratet-Knoten. Ehen und Weltpersonen mit Grawn, Baedd, Dienyddiwr, Penderyn und Wyrm werden kanonisch gespiegelt, Nachkommen aber nur in der jeweils fortführenden Akte gezeigt. Mabil/Rhydian führen deshalb ausschließlich in der Wyrm-Akte zu Enan, Rianna und Fotor weiter. 25 neue und acht wiederverwendete Quellporträts liegen lokal vor; sechs Standardsilhouetten bleiben Systemplatzhalter. Die Akte ist als Baronenhaus unter `Cenyr > Ährental > Flusstal > Aldwynd` registriert.
- Haus Chiffyddlon O'Glyndraith ersetzt seine vorbereitete Ausgestorben-Akte durch 40 Personen, 20 Ehen und 19 eindeutige Abstammungen. Iorwerth und Arddunwen bilden das Gründerpaar; Hauswappen und erster Zeitsprung folgen strikt seriell, der zweite Zeitsprung hängt ausschließlich unter Maelor und Malvina. Die belegte Ritterfürstenfolge läuft über Urien, Maelor, Grufudd, Iorwerth, Maelgwn und Gwilym. Zwölf endende Frauenlinien führen direkt zu ihren Zielhäusern. Acht bereits vorhandene Gegenakten verwenden identische Weltpersonen, Ehen und Porträts; Kinder stehen ausschließlich in der tatsächlich fortführenden Akte. Die Chiffyddlon-Kinder von Iorwerth/Morfudd erscheinen deshalb nur hier, während die Nachkommen von Alys, Eilun, Arddunwen, Llinos, Angharad, Rhondda und Tegan nur in Grawn, Blach, Dyngwn, Ciaróg, Baedd, Sgwarnog beziehungsweise Penderyn weiterlaufen. Mit Gwilyms Tod 1720 endet die Hauslinie an einem seitlich direkt neben seiner Karte angeordneten Ausgestorben-Knoten; seine drei Töchter bleiben normal unter der Ehe mit Dytiana geführt. 16 neue und elf kanonisch wiederverwendete Quellporträts liegen lokal vor; 13 Standardsilhouetten bleiben Systemplatzhalter. Die Akte ist als erloschenes Ritterfürstenhaus unter `Cenyr > Ährental > Ausgestorben` registriert.
- Haus Gwarchod O'Glyndraith ersetzt seine vorbereitete Ausgestorben-Akte durch 33 Personen, 16 Ehen und 16 eindeutige Abstammungen. Ector und Morfudd bilden das Gründerpaar; Hauswappen und einziger Überlieferungssprung folgen strikt seriell vor Drystan und Gwendolyn. Die Ritterfürstenfolge läuft über Drystan, Garselid, Maiwyn und Gwernwy, Delwyn ist letzter Erbe. Neun Frauenlinien führen direkt zu Gwefrydd, Sgwarnog, Baedd, Grawn, Tylluan, Crefyddol, Dienyddiwr und Eirth. Zehn bereits vorhandene Gegenakten verwenden dieselben Weltpersonen, Ehen und Porträts, führen ihre Kinder aber nur auf der jeweils zuständigen Seite fort. Walerans Tabellen-Todesjahr 1720 wird wegen seiner ausdrücklich erst um 1730 erfolgten Rückkehr aus Gefangenschaft nicht übernommen; sein späterer Tod beim Blutbund bleibt mit unbekanntem Jahr verzeichnet. Das Haus endet 1720 an einem seitlich direkt neben Gwernwy angeordneten Ausgestorben-Knoten. Zwölf neue und 14 kanonisch wiederverwendete Quellporträts liegen lokal vor; sieben Standardsilhouetten bleiben Systemplatzhalter. Die Akte ist als erloschenes Ritterfürstenhaus unter `Cenyr > Ährental > Ausgestorben` registriert.
- Die Silberinsel ist vollständig als Registerstruktur vorbereitet. Haus Neidr liegt als ausgearbeitete Grafenakte unter `Cenyr > Silberinsel > Silberbucht > Llanvane`; dort ersetzen Haus Saith, Haus Crefyddol und Haus Canwyll ihre Leerakten durch vollständige Stammbäume. Crefyddol umfasst 79 Personen, 36 Ehen, 42 eindeutige Abstammungen, zwölf direkte Wegverheiratet-Knoten und den verknüpften Bruderhaus-Knoten Canwyll. Canwyll umfasst 70 Personen, 31 Ehen, 38 eindeutige Abstammungen, 15 direkte Wegverheiratet-Knoten und den verknüpften Bruderhaus-Knoten Crefyddol. Sieffre der Fromme trägt in beiden Akten den Holy Frame; seine Söhne Llwyarch und Llwellyn gründen mit Lynette beziehungsweise Hafren die getrennten Bruderhäuser. Jede Akte führt nur ihre eigene Linie fort. Die drei Canwyll-Quellenlücken stehen ebenso wie die beiden Crefyddol-Lücken als absolute serielle Generationentrenner. Uvel führt als ausdrücklich belegte matrilineare Ausnahme die Canwyll-Linie mit Alaweyn Saith fort; die Kinder fortgeführter Gegenakten werden nicht gedoppelt. Die gemeinsame Herkunft ist auch in Neidr statt des früheren unbekannten Hauszweigs aufgelöst. Saith umfasst weiterhin 50 Personen, 21 Ehen, 28 eindeutige Abstammungen und acht direkte Wegverheiratet-Knoten. Tiwna ersetzt seine Leerakte unter `Silberküste > Eiddon` durch 68 Personen, 28 Ehen, 39 eindeutige Abstammungen und elf direkte Wegverheiratet-Knoten. Morholt Pysgod und Caitrin Neidr tragen den gemeinsamen Hausknoten unmittelbar unter ihrer Ehe; beide anschließenden Quellenlücken sind absolute serielle Trenner, wobei der zweite ausschließlich Caradoc und Telyth mit Brannock und Eirian verbindet. Pyrth ersetzt seine Leerakte unter `Silberpfad > Caer Clwyd` durch 49 Personen, 20 Ehen, 28 eindeutige Abstammungen und sieben direkte Wegverheiratet-Knoten. Roderic Pyrth und Llynn Neidr tragen den gemeinsamen Hausknoten unmittelbar unter ihrer Ehe; die einzige Quellenlücke folgt strikt seriell nach dem Wappen. Kinder fortgeführter Gegenakten werden nicht gedoppelt. Die zehn niederen Ritterhäuser und Brithfaen stehen weiterhin in Llanvane; Tir An Muirghin liegt als antikes Mór-Tiarna-Geschlecht auf Grafen-Tier direkt unter `Antike Crannath Clans`. Die zwölf noch nicht ausgearbeiteten Häuser besitzen jeweils nur ein neutrales Gründerpaar und ihren Hausknoten. Die Quellenvarianten `Crefyddoll`, `Crefydoll` und `Pirth` werden bewusst unter den projektweit kanonischen Namen Crefyddol und Pyrth geführt. Alle drei Herrschaftsicons, sämtliche 18 Hauswappen, 23 neue Saith-, 26 neue Crefyddol-, 21 neue Canwyll-, 25 neue Tiwna- und 18 neue Pyrth-Porträts werden lokal ausgeliefert.
- Das Tal der Milane ist vollständig als Registerstruktur vorbereitet. Haus Aderyn bleibt die ausgearbeitete Grafenakte und wird verlustfrei auf `Cenyr > Tal der Milane > Yvains Klamm > Penbryn` migriert. Haus Eryr ersetzt dort seine Leerakte durch 41 Personen, 17 Beziehungen und 23 eindeutige Abstammungen. Aeron Aderyn und Rhianu tragen den Eryr-Gründungsknoten direkt unter ihrer Ehe; erst danach folgt der einzige absolute Zeitsprung zu Eiddyl. Ellanah, Malvina, Venora, Meriel und Sian besitzen direkte Wegverheiratet-Knoten, Aysha einen ausdrücklichen Wegverlobt-Knoten zu Catwan Aderyn. Kinder aus Illysywen und Baedd bleiben nur in den dort fortgeführten Gegenakten, während Sheevs und Mererids Kinder ausschließlich bei Eryr erscheinen. Tylluan, Mwyalchen, zehn niedere Ritterhäuser und Ffwnarch liegen ebenfalls in Penbryn; Ilyuncu steht unter `Schwalbenhort > Caer Gwennol`, Gaeth unter `Taubenfurt > Penllyn` und Hebog unter `Falkenhöh > Talwyn`. Die antiken Clans Ui Gormárd und Ua Fíonnghal liegen getrennt unter `Antike Crannath Clans > Dun Talonach` beziehungsweise `Tûr Briste`; Ui Gormárd wird als Mór-Tiarna-Geschlecht auf Grafen-Tier, Ua Fíonnghal als dessen historischer Dún-Tiarna-Vasall geführt. Die 18 noch nicht ausgearbeiteten Häuser besitzen ausschließlich ein neutrales Gründerpaar und ihren Hausknoten. Alle vier Herrschaftsicons, sämtliche 20 Hauswappen und 28 individuelle Eryr-Quellporträts werden lokal mit Quellenmanifest ausgeliefert; für die vier Sitze werden keine nicht belegten Stadtwappen erfunden.

## Fjordheim: vorbereitete Registerstruktur (7. Oktober 2026)

`register.html?gebiet=Fjordheim` enthält die fünf Jarltümer und 16 belegte Orte.
Die 15 Clan-Zuordnungen sind reine Planungseinträge: Es entstehen keine Familienakten,
Gründerpaare, Personen, Beziehungen oder Stammbaumlinks. Die Familienanzahl bleibt unverändert.
Bestehende Vennyr-Akten werden weder verschoben noch als nordische Familien dupliziert.

| Jarltum | Hoher Clan / Hauptsitz | Niedere Clans / Sitze |
| --- | --- | --- |
| Drachenzunge | Draca / Drakensund | Vingar / Styrkr; Fjargardr / Caer (Quellenkonflikt) |
| Langstrand | Hjort / Talfjörn | Helvandr / Derwaskr; Hronulf / Eldrvik; Vötnar / Blomholr |
| Kragenküste | Ulfr / Bergshamn | Valdruna / Askarholm; Ulvar / Blotfjall; Æxewindr / Bjarnaströnd |
| Tiefenfjord | Geit / Nyfjord | Arngull / Strandr |
| Windtal | Orn / Tirvindr | Haming / Skerdgardr |

Llyndor ist zusätzlich als Thanentum ohne belegten nordischen Clan vorbereitet.
Die Quelle nennt Haming ausdrücklich unter einem Hesirentum. Bei Valdruna und
Fjargardr bleibt der konkrete Rang offen. Die Reichsgeschichte belegt Draca als
führenden Clan des Reiktums; es wird dafür keine zweite Familienakte vorgesehen.

Quellenvarianten bleiben sichtbar bzw. durchsuchbar: Ulf/Ulfr,
Derwaskyr/Derwaskr, Askerholm/Askarholm, Skergardr/Skerdgardr,
Blómholr/Blomholr sowie Talforwyn/Talfronwyn. **Ungeklärt:** Die Reichsübersicht
nennt Fjandr mit Sitz Fjargardr, die Jarltumsseite Fjargardr mit Sitz Caer beim
gleichen Wappen. Außerdem belegt die Clantabelle Valdruna in Askarholm,
während die Geographie Llyndor als weiteres Thanentum führt. Diese Orte werden
nicht gleichgesetzt. Die Namenswahl in der Oberfläche folgt vorläufig den
Jarltumsseiten und entscheidet keine spätere genealogische Identität.

Die gemeinsame Quelle der Planung ist `assets/js/data/fjordheim-territorial-plan.js`.
Sie wird ausschließlich beim Start des Registerbrowsers als Ordnerdefinition
übergeben; Familienregister, Speicherung und Almanach-Import lesen sie nicht als
Familienakten. Die Ordner bleiben auch nach dem Laden veröffentlichter Akten erhalten.
Die sechs Originalvorlagen samt Hashes, relevanten Tabellenzeilen und 21 Wappen-URLs
liegen unter `assets/data/source-inventories/fjordheim-2026-10-07.json` und dem
gleichnamigen Unterordner. Alle 21 Originalwappen sind lokal gesichert und durch
PNG-Abmessungen sowie SHA-256-Hashes belegt. Reichs- und Jarltumswappen erscheinen
in der Gebietsauswahl; die 15 Clanwappen in den Ortsvorschauen und Clanplanungen.
Clanwappen bleiben den Clans zugeordnet und werden nicht als Stadtwappen ausgegeben.

## Dunfal: Gebiete und ausgearbeitete Stammbäume (7. Oktober 2026)

`register.html?gebiet=Dunfal` enthält Tir na Rithe und Tir na Fathach mit ihren
belegten Sitzen, neun Clanherrschaften und der Herrschaft der Fianna. Auf ausdrücklichen
Nutzerwunsch wurden zunächst 13 Familienakten vorbereitet. Die anschließend gelieferten
zwölf Familienquellen füllen jetzt elf Clans und Sept Ferbend; Ui’Duilb bleibt mangels
genealogischer Quelle eine ausgestorbene Leerakte.

| Oberherrschaft | Familien |
| --- | --- |
| Tir na Rithe | Ard’Chulainn, Mac Sidhe’Ailella, Mac’Céin, Dál’Birn, Ruin’Morath, ausgestorbenes Ui’Duilb |
| Tir na Fathach | Nic’Nuadat, Ua’Anbhair, Ua’Casur, Dál’Aonghusa, Na’Riangabra, Mac’Eachtrai, Sept Ferbend |

Ard’Chulainn führt das Fürstentum und die Oberherrschaft Tir na Rithe;
Nic’Nuadat ist der Mor-Tiarna-Clan von Tir na Fathach. Die neun weiteren aktiven
Adelsclans sind durch die Laird-Tabellen belegt. Ferbends unmittelbarer Lehnsherr,
Ui’Duilbs historischer Rang und das Erlöschensdatum bleiben offen. Die Fianna
erhalten als Organisation nur einen Gebietsordner ohne Familienakte oder erfundenen Sitz.

Alle vorhandenen kurzen Ziel-IDs (`haus-chulainn`, `haus-nuadat`, `haus-ailella`
usw.) bleiben erhalten. 626 beschriftete Quellfelder sind 544 eindeutigen Personen
zugeordnet. Gemeinsame Gegenpersonen verwenden dieselben Welt-IDs und Bilder.
Finnbar „Mac Ailella“ ist durch seine Herkunftsakte und die Ehe mit Irma Helgr
als Ailella belegt; seine bestehenden IDs bleiben erhalten. Die jüngere Emer Ailella
(*1675, Tarrant Ciarógs Frau) wurde dagegen von der irrtümlich gemeinsam geführten
historischen Neidr-Ahnin getrennt.

Alle zwölf Akten besitzen kurze Hausbios; die elf gelieferten Kriegerdarstellungen
sind dem jeweiligen Clan zugeordnet. 318 neue Bilddateien einschließlich 38
Kinderreferenzen wurden gesichert; 44 bestehende Porträts werden wiederverwendet.
Zusammen stehen 324 individuelle Porträtpfade zur Anzeige bereit. Unter 16 Jahren
erscheint die Kindersilhouette, auch bei frühem Tod. Bilder und belegte Daten wurden
in 15 vorhandenen Gegenakten gezielt ergänzt. Shurkan und Avissa sind adoptiert,
Pól wurde 1730 geboren und Xina ist ausschließlich mit Oran verbunden.

Die Vorlagen enthalten folgende dokumentierte Widersprüche: Leitheach statt
Dunfal in Reichsüberschriften und Fließtext; Dun Athar in beiden Ratstiteln;
Ard Tiarna in den Regional-Steckbriefen; Ard’Chulainn unter dem Nuadat-Wappen;
„Land der Könige“, Tir na Rithe und Dunfal in kopierten Teilen der Fathach-Seite.
Titel, konkrete Sitzzeilen, Wappen und Amtsträger belegen die verwendete Zuordnung.
Akzentvarianten bleiben im Original erhalten. Die beiden Rithe-Anhänge sind inhaltlich
identisch und erzeugen keine doppelten Einträge.

`dunfal-territorial-catalog.js` hält die Quellenzuordnung und Gebietsstruktur,
`dunfal-house-profiles.js` die Orts-/Rangprofile und `dunfal-house-families.js`
die Auswahl zwischen ausgearbeiteten Akten und Leeraktenfabrik. Die eigene
Dunfal-Quellenschicht verwendet den gemeinsamen Familienbaukasten;
`family-registry-folders.js`
bündelt die Gebietsergänzungen für Dunfal und Fjordheim. Die vier unveränderten
Vorlagen, Tabellenzeilen, Entscheidungen und Prüfsummen der 26 lokal gesicherten
Originalwappen liegen unter `assets/data/source-inventories/dunfal-2026-10-07.json`
und im gleichnamigen Unterordner. Haus- und Herrschaftswappen bleiben getrennt.

Die zwölf genealogischen Originale stehen in `assets/data/source-inventories/dunfal-families-2026-10-07/`.
Das zugehörige JSON-Inventar und `dunfal-families-audit-2026-10-07.json` dokumentieren
jede Personenkarte, Identitätsentscheidung, Gegenkorrektur und Bildprüfsumme.
Die Importwerkzeuge und der reduzierte Ausgangsbestand liegen unter
`scripts/dunfal-source-import/`. Die neuen Akten verwenden Quellenrevision 2;
lokale Ergänzungen werden über die bestehende Registermigration erhalten.
Alle Quellenabweichungen und Prüfgrenzen sind in [DATENPFLEGE.md](DATENPFLEGE.md#1320-dunfal-ausgearbeitete-familien-und-gegenakten) aufgeführt.

## Aislearneach: Gebiete und leere Familienakten (7. Oktober 2026)

`register.html?gebiet=Aislearneach` enthält fünf Oberherrschaften, zehn belegte
Sitze und 19 **personenleere** Familienakten. Die aktuelle Vorbereitung bleibt
auf Nutzerwunsch lokal; Push und Veröffentlichung erfolgen erst auf erneute Bitte.

| Oberherrschaft | Vorbereitete Familien |
| --- | --- |
| Tir na Geach · Gaelan | Ui’Morna, Ua’Coronach, Na’Morgacht, An’Rioga |
| Tir na Tirth · Lorai | Mac’Durthacht, Ua’Fiáintorc, Ua’Tréada, Ua’Muileach (Athan), Ui Faill Duibhne (Cliath) |
| Tir na Faela · Croga | Mac’Fintain, An’Feannag (Caetharlach) |
| Tir na Adharcach · Foraoise | An’Uilebheist, Nic’Cnogan, bürgerliche Sept Techtmar |
| Tir na Iomaire · Koldair | Tir An’Ceallaigh, Na’Fiachiontach, Dal’Tartarfhuil, An’Gaisgh (Broch an Traigh), Na’Luchdon (Broch an Creig) |

Ui’Morna führt Fürstentum und Tir na Geach. Durthacht, Fintain und Ceallaigh sind
Mor-Tiarna-Clans; Muileach und Feannag haben ausdrücklich den Dún-Tiarna-Rang.
Die übrigen aktiven Adelsclans sind Lairds. Foraoise bleibt eine kirchliche
Oberherrschaft unter dem Sagarth; daraus entsteht keine Derbforgaill-Familie.
Techtmar erhält weder Adelsrang noch einen unbelegten direkten Lehnsherrn.

Die Nutzerkorrekturen vom 7. Oktober haben Vorrang vor den Tabellen:

- Gaisgh sitzt im **Broch an Traigh**, Luchdon im **Broch an Creig**. Die Laird-Tabelle
  gilt; die Clanübersicht vertauscht die beiden Sitze.
- Ui Faill Duibhne wird vorerst als **ausgestoßen** geführt (`status: 'expelled'`).
  Ein überlebender, begnadigter Clanteil bleibt für die spätere Genealogie vermerkt.
  Es gibt weder ein Ausgestorben-Flag noch einen erfundenen Endknoten oder lebende
  Platzhalterpersonen. Der historische Clanrang bleibt offen.

Weitere Quellenabweichungen bleiben nachvollziehbar dokumentiert:

- Der Reichstitel nennt **Aislearneach**, Regionaltexte **Aislaerneach**; „Ceitheach“
  in der Reichsvorlage ist ein Kopierrest. Der Registerpfad folgt dem Reichstitel.
- **Tir na Geach** folgt der Übersicht; **Tir na Gaech** und „Tir na Rösser“ sind
  über die Gebietssuche auffindbare Varianten.
- In Faela widersprechen „Tir An’Ceallaigh“, „Mor Tiarna von Gaelan“ und „Koldair“
  dem Fintain-Wappen, Eachans Amt und den Croga-Zuordnungen der Reichsübersicht.
  Die Akte wird deshalb als Mac’Fintain in Croga vorbereitet.
- **Caetharlach/Cethearlach** bleibt eine vorläufige Schreibvarianten-Zuordnung;
  die Clanlistenschreibweise bildet den Pfad, beide Formen sind in der Gebietssuche.
- Durthachts Mac-Präfix folgt der Übersicht. Fiáintorc/Fiantorc, Coronach/Corónach,
  Morgacht/Mórgacht, Rioga/Ríoga und Tir an’/Tir An’Ceallaigh bleiben in den
  Quellen erhalten. Die bestehenden kurzen Haus- und Ziel-IDs werden beibehalten.
- **Na’Fiachiontach/Tir Fiachiontach** ist als hausübergreifende Identitätsfrage
  offen. Ultán Tir Fiachiontach in Ciaróg wird ohne Familienquelle weder verschoben
  noch mit einer neuen Person gedoppelt.
- Allgemeine Ard-Tiarna- und „Fürstliches Herrschaftsgebiet“-Vorlagentexte ersetzen
  nicht die konkreten Amtsangaben; Estryll/Estyll und Geweihten/Geweithen bleiben
  im Archiv. Leere Herrschaftsüberschriften, Windreiter und Ahnenschilde erzeugen
  keine Familien oder unbelegten Herrschaftsgebiete.

`aislearneach-territorial-catalog.js` hält Gebiete und Quellenentscheidungen;
`aislearneach-house-profiles.js` bildet Ränge und Orte ab. Die Akten nutzen mit
Dunfal `territorial-family-factory.js` und die bestehende Leeraktenfabrik.
Die 450 vorherigen Registerakten bleiben inhaltlich unverändert. Spätere
Genealogien ergänzen dieselben 19 neuen Akten; lokale Ergänzungen bleiben beim
wiederholten Laden erhalten.

Sechs unveränderte HTML-Vorlagen, Tabellenzeilen einschließlich leerer Spalten,
31 abgeglichene Gegenakten, Nutzerkorrekturen und SHA-256-Belege der 24 lokalen
Originalwappen liegen in `assets/data/source-inventories/aislearneach-2026-10-07.json`
und im gleichnamigen Quellordner. Das identische Fürsten-/Morna-Wappen wird nur
einmal gespeichert. Die territorialen Tests prüfen Browser- und Servervalidierung,
Ränge, Sitzkorrekturen, Status, Quellenzuordnung und den Erhalt lokaler Ergänzungen.

Prüfung am 07.10.2026: 105 modulare Tests und neun Firebase-Validierungstests
bestanden; im großen Bestandstest bestehen 1245 von 1246 Prüfungen. Der bereits
vorher vorhandene Pawen-Referenzgleichheitstest bleibt rot. Der Vergleich mit
dem Ausgangsstand bestätigt 450 unveränderte Registerakten. Der Browser-Gesamtlauf
prüfte 469 Akten: 35 erwartete Leerakten (davon 19 neue) und die unveränderten
Layoutbefunde in Draig (drei Linien-/Kartenkollisionen), Nic’Holloran (vier
Überlappungen, sechs Linien-/Kartenkollisionen) und Eamhra (eine Überlappung).
Keine Laufzeitfehler oder versetzten Hausknoten. Aislearneachs Gebietsnavigation,
Suche, Wappen, Leeransichten und mobile Darstellung wurden zusätzlich geprüft.

## Blaithneach: Vorbereitung und Leites Übersiedlung (7. Oktober 2026)

`register.html?gebiet=Blaithneach` enthält drei Oberherrschaften, sechs Sitze und
elf Clans. Die Vorbereitung vom 7. Oktober umfasste zehn **personenleere** Akten
und die bereits ausgearbeitete Dal’Leite-Akte. Neun dieser Leerakten sind seit
dem 8. Oktober ausgearbeitet; der folgende Abschnitt dokumentiert diesen Ausbau.
Die Änderungen bleiben wie Aislearneach lokal, bis der Nutzer
ausdrücklich wieder einen Push anfordert.

| Oberherrschaft | Sitze und Familien |
| --- | --- |
| Tir na Beatha · Land des Lebens | Sioran: Ard’Nessa, Ua’Goidin; Réadlann: An’Haeghra |
| Tir na Dílse · Land der Treue | Eorach: Mac Ard’Ronain, Ua’Suiste, Dal’Gáirnér, Faill’ Cléirigh, Ui’Abhrach; Ardán: Dal’Leite |
| Tir na Méinnear · Land der Erze | Cairmor: Sidhe’Magach; Cel Bearradh: Ua’Eala |

Mac Ard’Ronain führt das Fürstentum und Dílse. Ard’Nessa und Sidhe’Magach sind
Mor-Tiarna-Clans, An’Haeghra ist durch Donnaghs Amtsangabe ein Dún-Tiarna-Clan.
Goidin, Suiste, Gáirnér und Eala sind Lairds. Historische Ränge von Cléirigh und
Abhrach bleiben offen. Wiederholte Amtsinhaber aus demselben Clan begründen
keine zusätzlichen Familien oder Kadettenlinien; die Leerakten enthalten weder
Gründerpaare noch Amtsträger, Elternschaften, Partnerschaften oder Endknoten.

Zwei ausdrückliche Nutzerkorrekturen vom 07.10.2026 haben Vorrang:

- **Dal’Leite:** Nach dem Niedergang Ceitheachs siedelten die Überlebenden nach
  Blaithneach über. Die eine Akte `haus-dal-leite` mit 73 Personen bleibt unter
  Ceitheach/Tir na Dun/Greinmhar als Mor-Tiarna-Clan und zusätzlich unter
  Blaithneach/Tir na Dílse/Ardán als Laird-Clan erreichbar. Es entsteht keine
  zweite Familie, und die Gesamtzählung zählt sie weiterhin nur einmal.
- **Faill’ Cléirigh:** als **ausgestoßen** führen. Die Reichsvorlage nennt den
  Clan zwar ausgestorben, in Ceinselaig ist Pailtéar Cléirigh (*1698) jedoch
  lebend überliefert. Sein Status und seine Welt-ID bleiben erhalten; die neue
  Akte erhält `expelled`, kein `extinctHouse` und keinen Endknoten.

Ui’Abhrach folgt der ausdrücklichen Angabe „Ausgestorben“ in der Reichsübersicht,
welche die gemeinsame Regionalkategorie „Ausgestorben/Ausgestoßen“ präzisiert.
Ein letzter Erbe oder Erlöschenszeitpunkt wird nicht ergänzt.

Quellenabweichungen und Stand der Gegenidentitäten bei der Vorbereitung:

- **Sioran in Dílses Geographie** wird als Kopierrest dokumentiert. Eorach ist
  durch Regionalsteckbrief, Reichsübersicht, Clan-Sitzzeile und Amtstabellen belegt.
- **Ard Nessa/Ard’Nessa**, **Gáirner/Gáirnér** und **Ardan/Ardán** bleiben
  dokumentierte Schreibvarianten. Ardán ist über beide Schreibweisen auffindbar.
- **Haeghra/Heaghra:** Clanlisten und Amtslisten verwenden unterschiedliche
  Formen. Donnagh Heaghra ist bereits in Teyrngarch erfasst; bestehende
  `house-haeghra`- und `house-heaghra`-IDs werden ohne Familienquelle nicht
  global zusammengeführt. Der alte Déaglán Haeghra (1625–1684) in Dal’Leite
  wird nicht allein wegen seines Namens dem aktuellen Laird gleichgesetzt.
- **Sidhe’Magach/Mac Magach** (Vencha in Helgr), **Ua’Eala/Mac Eala** (Alastar
  in Sgwarnog) sowie **Gillesbuig/Gilleasbuig Leite** bleiben mögliche, noch
  nicht genealogisch abgeglichene Gegenidentitäten. Bestehende Personen bleiben
  unverändert; keine zusätzlichen Personen werden daraus angelegt.
- Die Übersicht hat fünf Zellen für Gebiets-/Sitznamen, aber drei für Wappen
  und Glossen. Das Inventar erhält leere Zellen und belegt die Zuordnung über
  die Regionalvorlagen. Leere Herrschaftsüberschriften und allgemeine
  „Fürstliches Herrschaftsgebiet“-Texte erzeugen keine unbestätigten Gebiete.
  Gilden, Erzkelterbund An’Haeghra und Ahnenschilde sind keine Zusatzfamilien.

Die Module `blaithneach-territorial-catalog.js`, `blaithneach-house-profiles.js`
und `blaithneach-house-families.js` nutzen die gemeinsame territoriale
Leeraktenfabrik. Leites zusätzlicher Registerplatz wird ausdrücklich bei der
Registrierung seiner bestehenden Akte übergeben; Familie, Hauptprofil und
Quellenrevision 2 bleiben unverändert. Auch alte lokal gespeicherte Akten
erhalten den Registerplatz unter Erhalt eigener Notizen und Genealogien.

Vier unveränderte HTML-Quellen, Tabellenzellen, 41 abgeglichene Gegenakten,
Nutzerentscheidungen und SHA-256-Belege der 15 verwendeten Originalwappen
liegen in `assets/data/source-inventories/blaithneach-2026-10-07.json` und im
gleichnamigen Quellordner. 14 Wappen sind neu lokal gesichert; Dal’Leites
identisches vorhandenes Wappen wird wiederverwendet. Die 469 vorherigen
Familien bleiben inhaltlich unverändert; das Register enthält jetzt 479 Akten.

Prüfung am 07.10.2026: 112 modulare Tests und neun Serverprüfungen bestanden.
Im großen Bestandstest bleiben 1245 von 1246 Prüfungen grün; der bekannte
Pawen-Referenzgleichheitstest schlägt weiterhin fehl. Der Browser-Gesamtlauf
erfasste alle 479 Akten ohne Laufzeitfehler oder versetzte Hausknoten. Er meldet
45 erwartete Leerakten und Layoutbefunde in den bereits betroffenen Familien
Draig, Nic’Holloran und Eamhra. Bei 1440 × 1000 wurden dort drei, sieben und
null Linien-/Kartenkollisionen sowie null, vier und eine Kartenüberlappung
gemessen. Die zusätzliche Nic’Holloran-Messung bei der früheren Prüfgröße
320 × 240 reproduziert die bisherigen sechs Linien-/Kartenkollisionen.
Blaithneachs Navigation, elf Suchtreffer, Wappen, Leeransichten und mobile
Darstellung wurden gesondert geprüft; beide Leite-Einträge öffnen denselben
Stammbaum mit 73 Personen und 88 dargestellten Karten einschließlich Hausknoten.

## Blaithneach: ausgearbeitete Stammbäume (8. Oktober 2026)

Die neun nachgereichten Vorlagen gehören laut Nutzerbestätigung zu Blaithneach.
Ronain, Nessa, Magach, Suiste, Gáirnér, Goidin, Eala, Haeghra und Cléirigh sind
jetzt vollständig nach diesen Quellen ausgearbeitet: 559 Personenfelder ergeben
465 unterschiedliche Weltpersonen und 192 Partnerschaften. Jede Akte enthält
eine kurze Hausbiografie sowie das lokal gesicherte Kriegerbild ihres Clans.
Ui’Abhrach bleibt ohne genealogische Quelle leer. Dal’Leites bestehende Akte
und ihre beiden Registerplätze bleiben unverändert.

Wesentliche Festlegungen:

- **Dympna (*1721)** ist nach Biografie und ausdrücklicher Nutzerbestätigung
  die Tochter von Samthann Magach und ihrem Verlobten Fergus Nessa. Die
  erzwungene Verbindung mit Ionnrachtaigh bleibt separat und ohne zugeordnete Kinder.
- **Cléirigh bleibt ausgestoßen.** Pailtéar und Morrigan bleiben lebend;
  die abweichende Überschrift „Sidhe“ erzeugt keine zusätzliche Familie.
- Sìmag begründet Gáirnér als unehelicher Sohn Goraidh Ronains und Moiraiths.
  Die belegten Ronain-Zweige Suiste und Eala sowie Nessas Zweig Goidin sind
  verknüpft. Mündel behalten ihre leibliche Herkunft und getrennte Pflegeverbindungen.
- Die neuen Familienquellen klären Vencha Magach in Helgr, Alastar Eala in
  Sgwarnog und Donnagh Haeghra in Teyrngarch. Die älteren Personen- und Welt-IDs
  bleiben erhalten. Gleichnamige ältere Personen werden nicht pauschal zusammengeführt.

251 neue Porträtdateien und 81 vorhandene Bilder wurden zugeordnet. 34 der
neuen Dateien sind ausschließlich archivierte Kinderreferenzen; Kinder behalten
ihre passende Silhouette. Damit stehen 298 individuelle Porträtpfade zur Anzeige
bereit. Neun Kriegerbilder und neun Stammbaumgrafiken sind zusätzlich archiviert.
23 bestehende Akten erhalten eng begrenzte Bild- und Datenkorrekturen.

Die Quellen, Zuordnungen und SHA-256-Belege stehen unter
`assets/data/source-inventories/blaithneach-families-2026-10-08.json` und
`blaithneach-families-audit-2026-10-08.json`; Details und noch widersprüchliche
Quellangaben dokumentiert [DATENPFLEGE.md](DATENPFLEGE.md#1321-blaithneach-ausgearbeitete-familien-und-gegenakten).
Die gemeinsamen Importstufen liegen in `scripts/family-source-import/`, die
geprüften Zuordnungen und Familienpläne getrennt in `scripts/blaithneach-source-import/`.
Dunfal verwendet dieselben Importstufen; seine Personendaten bleiben reproduzierbar.

Prüfung: 127 modulare Tests, neun Serverprüfungen und 1245 von 1246 älteren
Bestandstests bestanden. Der bereits bekannte Pawen-Referenzvergleich bleibt
der einzige Fehler. Die neun neuen Bäume sind bei 1440 × 1000 und 390 × 844,
die 23 ergänzten Akten bei 1440 × 1000 ohne Kartenüberschneidungen,
Linien-Karten-Kollisionen oder Laufzeitfehler geprüft. Alle neun Hausbios laden
ihre Bilder. 447 übrige Akten stimmen vollständig mit dem Stand vor diesem
Import überein. Der kompakte Nachweis liegt in
`assets/data/source-inventories/blaithneach-families-validation-2026-10-08.json`.
Kein Push und keine Veröffentlichung.

## Aislearneach: ausgearbeitete Stammbäume vom 08.10.2026

Alle 19 vorbereiteten Akten sind ausgearbeitet: 908 Quelleneinträge ergeben
752 unterschiedliche Personen und 303 Partnerschaften. Jede Akte hat eine
kurze Hausbiografie; die 18 mitgelieferten Kriegerdarstellungen sind den Clans
zugeordnet. Techtmar bleibt eine bürgerliche Sept. Duibhne bleibt ausgestoßen,
mit dem überlieferten lebenden Zweig.

407 neue Bilddateien und 111 wiederverwendete Porträts sind belegt; 61
Kinderreferenzen bleiben außerhalb der Erwachsenenporträts. 29 Gegenakten
wurden abgeglichen, darunter 22 Porträtergänzungen. Alle 431 übrigen Akten
sind unverändert. Bestätigte Korrekturen: Seasaidh 1718, Vear 1725,
Sorchas Todesjahr 1739; Gaisgh in Traigh, Luchdon in Creig.

136 modulare Tests und neun Serverprüfungen bestehen. Der ältere Bestandstest
hat ausschließlich seinen bekannten Pawen-Referenzfehler. Alle 19 neuen Bäume
sind auf Desktop und Mobilgerät kollisionsfrei geprüft, sämtliche Hausbio-
Bilder laden. Zwei bestehende Layoutprobleme in Gegenakten sind nachweislich
unverändert. Quellen, Entscheidungen und reproduzierbarer Import:
`scripts/aislearneach-source-import/`; Details in Abschnitt 13.22 von
[DATENPFLEGE.md](DATENPFLEGE.md). Der kompakte Prüfbeleg liegt unter
`assets/data/source-inventories/aislearneach-families-validation-2026-10-08.json`.
Kein Commit, Push oder Deployment.

## Porträtabgleich der Alben vom 8. Oktober 2026

86 Familienakten wurden auf fehlende Bildverknüpfungen geprüft. 153 vorhandene
Individualporträts sind in 52 Akten ergänzt, darunter sieben bei Nessa und vier
bei Haeghra. Kinderbilder werden nicht mehr wegen des Alters ausgeblendet;
die Kindersilhouette dient nur noch als Ersatz bei fehlendem Individualbild.
Neun Kinder besitzen bislang kein belegtes Bild. Eigene Porträts und Notizen
bleiben beim Aktualisieren gespeicherter Akten erhalten. Nachweis:
`assets/data/source-inventories/alben-portraits-2026-10-08.json`.
Die Änderungen sind lokal und noch nicht veröffentlicht.

## Faelaorn: historische Herrschaften und Stammbäume (8. Oktober 2026)

Faelaorn ist in sechs alte Oberherrschaften gegliedert. Krieg mit Skjaerheim und
die ungefähr hälftige Übernahme sind vermerkt; Stammorte, Ränge und
Lehnszuordnungen folgen weiterhin den alten Verhältnissen. Konkrete
Besatzungsgrenzen werden ohne Quelle nicht festgelegt.

Von den 34 Clan- und fünf Braigh-Septakten sind Urquhart, Bhaird, Luthsach,
Lachlann, Drummond, Stwatchn, Dundas, Diuid, Lockart, Fiorghra, Ness, Haig, Banlaoch,
Culloch, Borthwick, Erskine, Grannd, Buadhtreun, Durachd, Muirgheal und Boyd
ausgearbeitet. Die 21 Bäume enthalten 1.370 Personenvorkommen mit 1.107 gemeinsamen
Identitäten und kurze Hausbiografien. 18 weitere Akten bleiben vorbereitet. Zusammen mit der
unveränderten Dubhan-Akte sind es weiterhin 40 Faelaorn-Akten.
Durachd, Eoghainn, Duff und Airdmhor erscheinen zusätzlich an ihren belegten
Asylorten; Forsyth außerdem in seiner Mathgham-Exklave. Die Verweise öffnen
jeweils dieselbe Familienakte. Piobarach ist die Hauptstadt Faelaorns und zugleich Stammsitz des Fürstenclans Ui Urquhart.

Alle sieben Vorlagen und 46 lokale Wappen sind im Quelleninventar
`assets/data/source-inventories/faelaorn-2026-10-08.json` belegt.
Die fünf Familientabellen und die Transkriptionen der beiden Nutzergrafiken stehen
im zusätzlichen Inventar `assets/data/source-inventories/faelaorn-families-2026-10-08.json`.
131 individuelle Originalporträts wurden ergänzt, 39 bestehende wiederverwendet
und zehn fehlende Porträts in Gegenakten eingetragen. Allgemeine Silhouetten zählen
nicht als individuelle Bilder. Die fünf mitgelieferten Kriegerdarstellungen sind
den jeweiligen Clans zugeordnet; für Stwatchn und Dundas dient das Wappen als Hausbild.
Unbekannte Angaben aus diesen beiden Grafiken bleiben offen.

Die zweite Quellenserie ergänzt Diuid, Lockart, Fiorghra, Ness und Haig aus fünf
Tabellen sowie Banlaoch aus einer undatierten Grafik: 385 Personenvorkommen,
336 Identitäten, 164 neue und 30 wiederverwendete Porträts sowie fünf weitere
Kriegerdarstellungen. 22 fehlende Bilder sind in 18 abgeglichenen Gegenakten
ergänzt; Personen-, Weltpersonen- und Paar-IDs bleiben erhalten. Banlaoch verwendet
sechs belegte Gegenporträts und sein Wappen als Hausbild. Seine fehlenden Jahre
wurden ausdrücklich freigegeben ergänzt: jüngste Nachkommen sind 1740 zwischen
6 und 25 Jahre alt; das Gründerpaar bleibt undatiert. Forsyth bleibt nach
Nutzerbestätigung vorerst offen, weil das zweite beigefügte Bild nochmals
Stwatchn zeigte. Die neue Quellenserie steht unter
`scripts/mathgham-source-import/`; die Rekonstruktion ist in `chronology.json`
von den undatierten Originalkarten getrennt.

Die dritte Quellenserie führt Culloch, Borthwick, Erskine und Grannd in Tír na
Braigh aus: 261 Personenvorkommen, 233 Identitäten, 131 neue und 26 wiederverwendete
Porträts sowie vier Kriegerdarstellungen. Zehn fehlende Gegenporträts werden in
15 gezielt abgeglichenen Akten ergänzt. Rónnat, Gobaith und Fiadh erhalten auch
in ihren Herkunftshäusern die Mündelverweise; Fiadh bleibt nach Nutzerbestätigung
lebend und *1727. Die bestätigte Ehe Gráinne/Rúairc gilt auch bei Culloch.
Grannd ist unmittelbar Erskine unterstellt. Die vier Culloch-Septgründungen
verweisen auf die vorbereiteten Akten Dubhair, Gréin, Gaesa und Malairt.
Quellen, Zuordnungen und reproduzierbare Importstufen liegen unter
`scripts/braigh-source-import/`.

Die vierte Quellenserie führt Buadhtreun, Durachd, Muirgheal und Boyd in Tir na
Faerna aus: 216 Personenvorkommen, 192 Identitäten, 79 neue und 36 wiederverwendete
Porträts sowie vier Kriegerdarstellungen. Zehn Gegenakten erhalten 17 gezielte
Personenabgleiche, darunter neun fehlende Bilder. Boyd dient unmittelbar Muirgheal;
die historischen Sitze und Durachds Asyl bleiben erhalten. Die Kriegsverluste
erzeugen keine pauschal ausgestorbenen Clans. Nach ausdrücklicher Nutzerbestätigung
sind Dubhan 1560 und Olwyna 1562 geboren. Quellen und Entscheidungen:
`scripts/faerna-source-import/`. Bereits vorhandene Porträts in einem neu erweiterten
Haus-Bildmodul bleiben beim erneuten Import erhalten.

Quellenentscheidungen, Zahlen und Prüfungen:
[Datenpflege, Abschnitt 13.25](DATENPFLEGE.md#1325-faelaorn-sieben-ausgearbeitete-stammbäume-08102026).
Die Mathgham-Ergänzung ist in [Abschnitt 13.26](DATENPFLEGE.md#1326-mathgham-sechs-stammbäume-und-piobarach-08102026) dokumentiert.
Die Braigh-Ergänzung steht in [Abschnitt 13.27](DATENPFLEGE.md#1327-braigh-culloch-borthwick-erskine-und-grannd-08102026).
Die Faerna-Ergänzung steht in [Abschnitt 13.28](DATENPFLEGE.md#1328-faerna-buadhtreun-durachd-muirgheal-und-boyd-08102026).
Alle Änderungen bleiben lokal; keine Veröffentlichung.

## Abhängigkeiten

- [Family Chart 0.9.0](https://github.com/donatso/family-chart), MIT
- [D3 7.9.0](https://d3js.org/), ISC
- [html2canvas 1.4.1](https://github.com/niklasvh/html2canvas), MIT

Family Chart, D3 und html2canvas liegen fest versioniert unter `vendor/`. Firebase bleibt vorerst ausschließlich für bestehende Almanach-Abgleichsfunktionen eingebunden; Familienakten, Registereinträge und neu vorgemerkte Familienbilder werden nicht mehr in Firestore beziehungsweise Firebase Storage gespeichert.

## GitHub-Publisher auf Netlify

Der Browser erhält niemals einen GitHub-Token. `netlify/functions/family-publisher.mjs` führt den atomaren Commit serverseitig aus. In Netlify müssen dafür folgende Umgebungsvariablen gesetzt werden:

- `ALERIA_GITHUB_TOKEN`: Fine-grained Token mit Schreibrecht auf Repository-Inhalte.
- `ALERIA_GITHUB_REPOSITORY`: optional, Standard `VVhiteVVolf/Aleria`.
- `ALERIA_GITHUB_BRANCH`: optional, Standard `master`.

Der Publisher ist für den bewusst klein gehaltenen privaten Bearbeiterkreis ohne zusätzliche Anmeldung erreichbar; der lokale Bearbeitungsmodus bleibt die einzige UI-Hürde. Der GitHub-Token wird weiterhin niemals an den Browser ausgeliefert. Jede Speicherung erzeugt genau einen Commit mit den geänderten Familienakten und `assets/data/published-families/registry.json`. Portraitänderungen an einer `worldPersonId`, die in mehreren Stammbäumen vorkommt, werden bereits im lokalen Entwurf auf alle bekannten Gegenakten projiziert und anschließend im selben atomaren Online-Paket veröffentlicht. Im selben Commit wird jede betroffene Familie zusätzlich als unveränderliche Revisionskopie unter `assets/data/published-families/backups/<familien-id>/` abgelegt. Die standardmäßig aktive Option „Deploy überspringen“ ergänzt den Commit um `[skip netlify]`: Der Editor liest die neue Revision sofort über die Function, während die öffentliche Seite erst beim nächsten Netlify-Deploy aktualisiert wird. Wird das Häkchen vor dem Speichern entfernt, löst derselbe Commit den normalen Production-Deploy aus.

Brann: Vier weitere Bildstammbäume sind ausgearbeitet; siehe `DATENPFLEGE.md`, Abschnitt 13.30.
