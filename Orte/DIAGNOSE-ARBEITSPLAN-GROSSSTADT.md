# Diagnose- und Arbeitsplan: Großstadt-Vorlage

Stand: 14. Juni 2026

Dieses Dokument sammelt die aktuell festgestellten Probleme an der Großstadt-Vorlage und legt eine saubere Bearbeitungsreihenfolge fest. Es ist ausdrücklich kein Implementierungsdokument für einen Schnellpatch, sondern die Grundlage für die nächsten kontrollierten Schritte.

## Ziel

Die Großstadt-Vorlage soll wieder stabil, nachvollziehbar und langfristig erweiterbar werden:

- Szenenbearbeitung auf dem Niveau des AleriaAlmanach-Moduleditors.
- Saubere, schöne Szenen-Sidebar ohne Verschiebung der Hauptseite.
- Korrekte Umlaute und keine kaputten Zeichen.
- Keine doppelten Überschriften durch einklappbare Bereiche.
- Alle vorgesehenen Bildflächen müssen als echte bearbeitbare Bildplatzhalter existieren.
- Direktbearbeitung darf Tabellen, Zellen und Inhalte nicht durcheinanderschieben.

## Festgestellte Probleme

### 1. Szenen-Bearbeitungsmodus ist noch nicht gleichwertig zum AleriaAlmanach

Beobachtung:

- Der aktuelle Orte-Szeneneditor bildet nur einen Teil der Logik ab.
- Der AleriaAlmanach hat einen deutlich durchdachteren Editor mit Seitenlogik, Livevorschau, Modultext, Infotabelle, Kommentarbereich, Bildbereich, Seitennavigation und sauberer Speicherlogik.
- Die Orte-Szenen müssen pro Ort eigenständig gespeichert werden, aber funktional wie das interaktive Szenenmodul im AleriaAlmanach bedienbar sein.

Risiko:

- Wenn nur einzelne Felder nachgebaut werden, entsteht eine zweite, schlechtere Editorlogik.
- Änderungen am Almanach-Szenenmodul würden später nicht automatisch für Orte gelten.

Zielbild:

- Orte-Szenen verwenden so viel bestehende Almanach-Bearbeitungslogik wie möglich.
- Orte ergänzen nur Ownership, Speicherung, Zuordnung zum Ort und Sidebar-Verwaltung.
- Kein abgespeckter Parallel-Editor.

### 2. Szenen-Sidebar ist optisch unzureichend

Beobachtung:

- Die rechte Sidebar wirkt wie ein Rohbau.
- Die vertikale Lasche, Abstände, Karten, Buttons und Farbverteilung passen noch nicht zur restlichen Pergamentoberfläche.
- Die Sidebar darf die Hauptseite nicht nach links oder rechts verschieben.

Zielbild:

- Seitenleiste als dezente, pergamentartige Schublade am rechten Rand.
- Klare Szenenkarten mit Titel, Stempel/Typ, Status und Aktionen.
- Buttons kleiner, ruhiger und passend zum Stil.
- Eingeklappt nur eine saubere Lasche oder ein kleines Symbol.

### 3. Fehlerhafte Umlaute und Zeichenkodierung

Beobachtung:

- In Dateien und UI tauchen kaputte Zeichen auf, z. B. `Gro?stadt`, `GroÃŸstadt`, `fuer`, `Loeschen`.
- Umlaute dürfen verwendet werden.

Risiko:

- Uneinheitliche Schreibweisen beschädigen die Vorlage und wirken unfertig.
- Wenn falsche Kodierung aus alten Imports erhalten bleibt, breitet sich das Problem weiter aus.

Zielbild:

- HTML, Markdown, JS und CSS bleiben UTF-8.
- Sichtbare deutsche UI-Texte verwenden echte Umlaute: `Großstadt`, `Löschen`, `Öffnen`, `für`, `Höhe`.
- Nur technische IDs, Dateinamen und Storage Keys bleiben ASCII.

### 4. Doppelte Überschrift bei „Bannkreis - Regional“

Beobachtung:

- Der Bereich zeigt `Bannkreis - Regional` doppelt.
- Die Dopplung entsteht offenbar durch die Kombination aus Tabellenüberschrift und einklappbarem Spoiler/Details-Bereich.

Risiko:

- Wenn die Dopplung nur optisch versteckt wird, bleibt die Struktur falsch.
- Screenreader und spätere Bearbeitungslogik würden weiterhin zwei Titel sehen.

Zielbild:

- Es gibt genau eine sichtbare Überschrift.
- Der einklappbare Bereich hat eine klare Summary, aber erzeugt keine zweite identische Blocküberschrift.

### 5. Fehlende bearbeitbare Bildplatzhalter

Beobachtung:

In mehreren Bereichen sind leere goldene Flächen oder Textreste zu sehen, wo eigentlich ein Bildplatzhalter sitzen muss:

- Rechts neben „Einleitung“.
- Zeitungsblatt.
- Bezirke.
- Militär.
- Persönlichkeiten/Portraits.
- Bannkreis/Region & Umland, inklusive Regionskarte.
- Weitere leere Bildzellen in Tabellenbereichen.

Zielbild:

- Jede vorgesehene Bildfläche hat einen einheitlichen, klickbaren Platzhalter.
- Jeder Platzhalter lässt sich über das Bild-Popup bearbeiten.
- Einstellbar: Bild-URL, Link, Alt-Text, Breite, Höhe, Format und Einpassung.
- Keine Textplatzhalter wie `[BILD.PNG]` oder `Bild-KARTE mit LINK` bleiben sichtbar.

### 6. Direktbearbeitung verschiebt oder mischt Inhalte

Beobachtung:

- Nach dem Bearbeiten einzelner Felder werden Inhalte teilweise an falsche Stellen verschoben.
- Tabelleninhalte wirken, als würden sie neu nummeriert, falsch rekonstruiert oder in falsche Zellen geschrieben.
- Besonders kritisch sind komplexe Tabellen mit Rowspans, Colspans, Bildzellen, Bewertungszellen und nachträglich hinzugefügten Zeilen.

Wahrscheinliche Ursachen:

- Automatisches Erkennen von editierbaren Textknoten ist zu breit.
- Tabellen werden als `tbody.innerHTML` gespeichert und später wieder eingesetzt.
- Dynamische Keys können sich nach Strukturänderungen verschieben.
- Bild-, Rating- und Textfelder teilen sich teilweise dieselbe Tabellen-Speicherfläche.
- Beim Klonen neuer Zeilen werden Attribute entfernt und danach neu aufgebaut; dadurch können Zuordnungen wandern.

Zielbild:

- Bearbeitbare Felder brauchen stabile IDs.
- Tabellenzeilen und Zellen dürfen nicht über Position allein identifiziert werden.
- Bildplätze, Ratings und Texte müssen getrennte Zuständigkeiten behalten.
- Nach Speichern/Laden muss die visuelle Struktur identisch bleiben.

### 7. Firebase-Statusmeldungen stören die Oberfläche

Beobachtung:

- Die Live-Firebase-Announcements sind zu dominant.
- Der aktuelle Statusbalken nimmt visuell zu viel Raum ein und lenkt von der eigentlichen Vorlage ab.
- Meldungen wie `Direktbearbeitung online geladen` sollen nicht dauerhaft als breite Leiste sichtbar sein.

Zielbild:

- Unten links sitzt nur ein dezenter Status-Dot.
- Der Dot zeigt Synchronisationszustände farblich an, ohne die Seite zu überdecken.
- Beim Klick auf den Dot öffnet sich ein kleines einklappbares Statusfenster.
- Wenn lokale und Online-Version kollidieren, kann dort gezielt die aktuellste Version ausgewählt werden.
- Beim Gedrückthalten soll der Dot verschiebbar sein, damit er nicht stört.

Risiko:

- Wenn der Status komplett versteckt wird, sind Speicherkonflikte nicht mehr nachvollziehbar.
- Wenn die Statusanzeige zu groß bleibt, stört sie dauerhaft die Bearbeitung.

### 8. Tabellen-Zeilensteuerung ist zu grob

Beobachtung:

- Aktuell betrifft das Hinzufügen von Zeilen nur die jeweils letzten Zeilen einer Tabelle.
- In langen Tabellen muss man aber auch mitten in bestehenden Bereichen Zeilen hinzufügen können.
- Es fehlt eine Möglichkeit, einzelne bestehende Zeilen gezielt zu entfernen.

Zielbild:

- Jede bearbeitbare Tabellenzeile oder sinnvolle Tabellen-Gruppe bekommt eine dezente `+`-Aktion.
- Neue Zeilen können direkt an der gewünschten Stelle eingefügt werden.
- Entfernen ist pro Zeile oder pro logisch zusammengehöriger Gruppe möglich.
- Die Tabellenstruktur mit `rowspan`, `colspan`, Bildern und Ratings bleibt stabil.

### 9. Persönlichkeiten brauchen eigene Hinzufügen-/Entfernen-Logik

Beobachtung:

- Im Bereich „Persönlichkeiten“ bzw. Amtsträger/Personenkarten fehlen gezielte Steuerungen.
- Es soll möglich sein, weitere Personen per `[+]` hinzuzufügen.
- Einzelne Personen sollen auch wieder entfernt werden können.

Zielbild:

- Persönlichkeiten werden als wiederholbare Personengruppen behandelt, nicht wie normale Tabellenzeilen.
- Eine Personengruppe umfasst Portrait, Rolle, Name und Beschreibung.
- `[+]` fügt eine vollständige neue Personengruppe ein.
- Entfernen löscht eine vollständige Personengruppe, ohne Nachbarpersonen zu beschädigen.
- Portrait-Platzhalter bleiben wie alle anderen Bilder über das Bild-Popup bearbeitbar.

## Empfohlene Reihenfolge

### Schritt 1: Bestandsaufnahme der bestehenden Almanach-Bearbeitungslogik

Aufgaben:

- Relevante Dateien im AleriaAlmanach lesen:
  - Modul-Editor Shell.
  - Session-Editor.
  - Seiten-/Template-Auswahl.
  - Livevorschau.
  - Bildbearbeitung.
  - Speicher-/Import-/Exportlogik.
- Klären, welche Funktionen direkt wiederverwendbar sind.
- Klären, welche Funktionen an Almanach-spezifische globale Zustände gekoppelt sind.

Ergebnis:

- Kurze technische Entscheidung: direkt nutzen, extrahieren oder Adapter bauen.

Abnahmekriterium:

- Es ist klar, welche konkrete Almanach-Logik für Orte übernommen wird und welche Orte-spezifisch bleiben muss.

### Schritt 2: Orte-Szeneneditor architektonisch angleichen

Aufgaben:

- Orte-Szenen als eigene Datenobjekte pro Ort behalten.
- Almanach-Editorlogik für Session-Seiten übernehmen.
- Orte-spezifischen Adapter für Speichern/Laden bauen.
- Livevorschau stabil anbinden.

Nicht tun:

- Kein zweiter abgespeckter Editor.
- Keine Kopie des kompletten Almanach-Monolithen.
- Keine neuen globalen Hilfsdateien.

Abnahmekriterium:

- Eine Orte-Szene lässt sich mit denselben sinnvollen Editorbereichen bearbeiten wie im Almanach.
- Speichern betrifft nur den jeweiligen Ort.

### Schritt 3: Sidebar neu gestalten

Aufgaben:

- Visuelles Konzept für rechte Szenenschublade erstellen.
- Aktionsflächen reduzieren und ordnen.
- Eingeklappten Zustand optisch verbessern.
- Mobile Ansicht prüfen.

Abnahmekriterium:

- Sidebar sieht wie Teil der Pergamentseite aus.
- Hauptseite verschiebt sich nicht.
- Szenen sind schnell öffn- und bearbeitbar.

### Schritt 4: Zeichenkodierung und sichtbare Texte bereinigen

Aufgaben:

- Sichtbare deutsche Texte in Orte-Dateien auf kaputte Zeichen prüfen.
- `fuer`, `Oeffnen`, `Loeschen`, `Hoehe` usw. in sichtbarer UI durch Umlaute ersetzen.
- Technische IDs unverändert lassen.

Abnahmekriterium:

- Keine kaputten Umlaute in der sichtbaren Großstadtseite.
- Markdown-Dokumente und UI-Texte sind lesbar und einheitlich.

### Schritt 5: Doppelte Bannkreis-Überschrift korrigieren

Aufgaben:

- Struktur des Bannkreis-/Regionalbereichs prüfen.
- Entscheiden, welche Überschrift erhalten bleibt.
- Summary/Details so umbauen, dass keine zweite identische Überschrift entsteht.

Abnahmekriterium:

- `Bannkreis - Regional` erscheint nur einmal sichtbar.
- Auf-/Zuklappen bleibt erhalten.

### Schritt 6: Fehlende Bildplatzhalter erfassen und ergänzen

Aufgaben:

- Alle vorgesehenen Bildflächen systematisch markieren.
- Jeder Bildfläche einen stabilen `data-orte-image-key` geben.
- Bildzellen so gestalten, dass sie ohne echtes Bild einen klaren Platzhalter zeigen.
- Bild-Popup für alle diese Stellen prüfen.

Besonders zu prüfen:

- Einleitung rechts.
- Zeitungsblatt rechts.
- Bezirke rechts.
- Militär rechts.
- Persönlichkeiten/Portrait.
- Region & Umland / Regionskarte.
- Bannkreis-Karte.
- Tabellenzellen mit Symbol-, Wappen- oder Portraitfunktion.

Abnahmekriterium:

- Keine leeren Bildflächen bleiben übrig.
- Jede Bildfläche ist im Bearbeitungsmodus anklickbar.
- Bilddaten werden gespeichert und nach Reload korrekt wiederhergestellt.

### Schritt 7: Direktbearbeitung stabilisieren

Aufgaben:

- Automatische Feld-Erkennung einschränken.
- Stabile Feld-IDs für Text, Bild, Rating und Tabellenzellen definieren.
- Tabellen nicht pauschal als `tbody.innerHTML` speichern, wo strukturierte Daten nötig sind.
- Klonlogik für neue Zeilen prüfen.
- Testszenario für Speichern/Laden bauen:
  - Text ändern.
  - Bild setzen.
  - Tabelle um Zeile erweitern.
  - Rating ändern.
  - Reload.
  - Struktur vergleichen.

Abnahmekriterium:

- Bearbeiten eines Felds verändert keine anderen Bereiche.
- Nach Speichern und Reload stehen Inhalte an derselben Stelle.
- Tabellen behalten Spalten, Zeilen, Bilder und Bewertungen korrekt.

### Schritt 8: Firebase-Statusanzeige reduzieren

Aufgaben:

- Bestehende Firebase-/Online-Statusmeldungen inventarisieren.
- Breite Statusleisten aus der sichtbaren Vorlage entfernen oder in den Dot überführen.
- Unten links einen kleinen Status-Dot einführen.
- Klick auf den Dot öffnet ein kompaktes Statuspanel.
- Statuspanel muss einklappbar sein.
- Gedrückthalten oder Drag-Geste soll den Dot verschiebbar machen.
- Bei Versionskonflikten muss das Panel eine Auswahl anbieten:
  - lokale Version behalten,
  - Online-Version laden,
  - aktuellste Version automatisch übernehmen.

Abnahmekriterium:

- Keine breite Firebase-Announcement-Leiste stört die Vorlage.
- Der Speicherstatus bleibt über den Dot nachvollziehbar.
- Bei Konflikten kann bewusst entschieden werden, welche Version verwendet wird.

### Schritt 9: Tabellen-Zeilensteuerung erweitern

Aufgaben:

- Tabellenarten klassifizieren:
  - einfache Tabellenzeilen,
  - gruppierte Zeilen,
  - Personengruppen,
  - Tabellen mit Bildern/Ratings.
- Pro Tabellenart definieren, wo `+` und Entfernen-Aktionen sinnvoll sitzen.
- Einfügen nicht nur am Tabellenende erlauben, sondern auch zwischen bestehenden Zeilen.
- Entfernen pro Zeile oder Gruppe absichern.
- Nach jedem Einfügen/Entfernen stabile IDs und Speicherstruktur prüfen.

Abnahmekriterium:

- Zeilen können an der gewünschten Stelle eingefügt werden.
- Einzelne Zeilen können entfernt werden.
- Tabelleninhalte springen nach Speichern/Laden nicht an falsche Stellen.

### Schritt 10: Persönlichkeiten als wiederholbare Gruppen behandeln

Aufgaben:

- Struktur der Persönlichkeitsbereiche prüfen.
- Logische Personengruppe definieren: Rolle, Portrait, Name, Beschreibung.
- `[+]` zum Hinzufügen weiterer Personen ergänzen.
- Entfernen pro Personengruppe ergänzen.
- Portrait-Bildplatzhalter innerhalb jeder Personengruppe stabil anbinden.
- Beschreibungstext weiterhin höhenbegrenzt mit Scrollbar behandeln.

Abnahmekriterium:

- Neue Persönlichkeiten können vollständig hinzugefügt werden.
- Bestehende Persönlichkeiten können vollständig entfernt werden.
- Keine Tabellenzellen oder Nachbarpersonen werden dabei beschädigt.

## Nicht-Ziele für den nächsten Schritt

- Kein Netlify-Deployment.
- Kein Umbau der gesamten Orte-Architektur.
- Kein Löschen von AleriaAlmanach-Kommentaren.
- Kein Big-Bang-Refactor über alle Dateien.

## Nächster konkreter Schritt

Als nächstes sollte Schritt 1 begonnen werden:

1. Almanach-Moduleditor gezielt analysieren.
2. Wiederverwendbare Session-Editorlogik identifizieren.
3. Danach erst den Orte-Szeneneditor umbauen.

Erst wenn diese Analyse abgeschlossen ist, sollte Code am Szeneneditor geändert werden.

## Progression und feste Schrittfolge

Gesamtfortschritt der Großstadt-Vorlage: **ca. 95%**

Diese Zahl bewertet nicht nur, ob etwas sichtbar existiert, sondern ob es stabil, wartbar und langfristig brauchbar ist.

| Bereich | Fortschritt | Status |
| --- | ---: | --- |
| Diagnose und Arbeitsplan | 100% | Grundlage ist dokumentiert. |
| Almanach-Szenenlogik verstehen | 70% | Kernmodule wurden geprüft; Adapterentscheidung steht. |
| Orte-Szeneneditor auf Almanach-Niveau bringen | 94% | Großer Almanach-Editor ist angebunden; der alte aktive Mini-Editorpfad ist entfernt. Payload-Sammlung, JSON-Vorschau, Dateiimport, Kommentar-Bundle-Import, Mehrseiten-Payloads, Rückschreiben in die Ortsszene, persistenter Reload-Schutz, Zwei-Fenster-Editor-Refresh, Dirty-Konfliktschutz und explizites Konfliktpanel sind geprüft. |
| Szenen-Sidebar | 80% | Neu gestaltet, Overlay-Zusammenspiel, lokales Szenenanlegen, mobile Öffnung und Öffnen des großen Almanach-Editors über `+ Szene` sind geprüft. |
| Umlaute und sichtbare Texte | 75% | Browseranzeige für Titel, Umlaute, Platzhalter und Ratingzeichen ist geprüft; Orte-eigene sichtbare Resttexte, Ortsname, Reset-Meta und kurze Orte-Dokumentation sind bereinigt. Die verbleibenden Treffer sind bewusst dokumentierte Negativbeispiele oder allgemeine Almanach-Module außerhalb dieses Orte-Schritts. |
| Bannkreis-Dopplung | 95% | Doppelte sichtbare Überschrift ist entfernt; Browserprüfung zeigt `Bannkreis - Regional` genau einmal, und die Regionskarte ist im geöffneten Bereich sichtbar groß. |
| Bildplatzhalter | 84% | Hauptbildflächen, Laufzeit-Slot-Erzeugung, Portraitslots, Symbol-/Wappenslots, Regionskarte und zentrale Bilddialog-Felder sind geprüft. Versteckte Spacer-Absätze mit Bildslots wurden korrigiert; leere Hauptslots haben eine Mindestgröße. Bilddaten bleiben nach isoliertem Speichern/Reload erhalten. |
| Direktbearbeitung stabilisieren | 82% | Tabellenfelder, Personen, Rating-Slider, Bilddialog, Link/Alt-Text und komplexe Symbol-/Ratingzeilen wurden mit isoliertem Speichern/Reload sowie Browser-Dry-Runs geprüft. Rating-Key-Kollisionen beim Einfügen wurden behoben. |
| Firebase-Status-Dot | 88% | Dot, Panel, Drag und Versionswahl sind umgesetzt und im Browser geprüft; Szenenspeicher-Race-Schutz, echter Firebase-Mehrseiten-Test, persistente LocalStorage-Meta-Zeitstempel, dezente Szenenindex-Race-Meldung und echter Zwei-Browser-Sync sind geprüft. |
| Tabellenzeilen überall hinzufügen/entfernen | 86% | Einfügen und Entfernen ist für Regionstabelle und komplexe Symbol-/Ratingzeilen im Browser-Dry-Run geprüft. Einfügen bleibt nach isoliertem Speichern/Reload erhalten. Keys bleiben eindeutig. Zeilencontrols liegen jetzt im linken Tabellen-Gutter und überdecken keine Zellinhalte mehr. |
| Persönlichkeiten hinzufügen/entfernen | 84% | Hinzufügen und Entfernen von Personengruppen ist im Browser-Dry-Run geprüft; Hinzufügen bleibt nach isoliertem Speichern/Reload erhalten. Rollen-/Portrait-/Name-/Beschreibung-Blöcke und Portraitslots bleiben stabil. |

## Umsetzungsstand: Firebase-Status-Dot

Umgesetzt:

- Die breite sichtbare Statusmeldung in der Direktbearbeitungsleiste wurde entfernt.
- Der Status sitzt jetzt als kleiner Dot unten links.
- Klick auf den Dot öffnet ein kompaktes Statuspanel.
- Der Dot kann per Drag-Geste verschoben werden; die Position wird pro Orte-Seite lokal gespeichert.
- Bei abweichender lokaler und Online-Version wird eine Versionsauswahl vorbereitet:
  - neueste Version wählen,
  - Online-Version laden,
  - lokale Version behalten.
- Der Inline-Firebase-Payload speichert einen Client-Zeitstempel, damit die Auswahl der aktuellsten Version nachvollziehbar bleibt.

Geprüft:

- `node --check` für `orte-inline-editor.js` und `orte-inline-firebase.js`.
- Browserprüfung auf `http://127.0.0.1:8780/Orte/grossstadt.html`:
  - Toolbar vorhanden,
  - alter Status in der Toolbar visuell versteckt,
  - Dot vorhanden und `fixed`,
  - Panel klappt auf,
  - keine Runtime-Fehler.

Noch offen:

- Konfliktfall mit zwei echten Browser-/Firebase-Ständen prüfen.
- Zusammenspiel mit der rechten Szenen-Sidebar im schmalen Viewport feinprüfen.

## Umsetzungsstand: Bannkreis und Tabellensteuerung

Umgesetzt:

- Die doppelte sichtbare Überschrift `Bannkreis - Regional` wurde entfernt.
- Die `summary` des einklappbaren Bannkreis-Bereichs ist jetzt der einzige sichtbare Titel.
- Die Regionskarte ist kein Textrest mehr, sondern ein echter `orte-image-slot` mit:
  - eigener stabiler Bild-ID,
  - Label `Regionskarte`,
  - Bannerformat,
  - erhöhter Kartenfläche.
- Tabellen erhalten im Bearbeitungsmodus zeilennahe Steuerungen:
  - Zeile davor einfügen,
  - Zeile danach einfügen,
  - Zeile entfernen.
- Persönlichkeitsbereiche werden dabei gesondert behandelt:
  - Steuerung sitzt auf dem Start einer Personengruppe,
  - Hinzufügen/Entfernen arbeitet auf Gruppen statt auf einzelnen losen Tabellenzeilen.
- Steuerbuttons werden beim Speichern/Klonen aus dem Tabelleninhalt entfernt, damit sie nicht als Nutzinhalt persistiert werden.

Geprüft:

- `node --check` für `orte-inline-editor.js`.
- Browserprüfung:
  - Bannkreis-Titel erscheint nur einmal.
  - Regionskarten-Slot ist vorhanden, breit und im Bearbeitungsmodus bearbeitbar.
  - Zeilensteuerungen erscheinen im Bearbeitungsmodus.
  - Persönlichkeitsbereich: 25 Personengruppen, 25 Gruppensteuerungen, 25 Portrait-Slots.
  - Keine Runtime-Fehler.

Noch offen:

- Weitere komplexe Tabellenarten mit Speichern und Reload prüfen.
- Stabile Feld-IDs verbessern, damit nach Strukturänderungen keine Textzuordnung wandert.
- Weitere fehlende Bildflächen systematisch gegen die Screenshots prüfen.

## Umsetzungsstand: Feldzuordnung stabilisieren

Umgesetzt:

- Tabellenzellen werden nicht mehr zusätzlich als globale Textfelder gespeichert.
- Tabellenzellen bleiben direkt bearbeitbar, schreiben aber nur noch in den jeweiligen Tabellenzustand.
- Normale Seitentexte und Tabellenzellen verwenden getrennte ID-Räume:
  - normale Texte: `text-*`,
  - Tabellenfelder: `table-text-*`.
- Beim Speichern von Tabellen werden temporäre Bearbeitungsattribute wie `contenteditable` und `data-orte-inline-text` aus dem Tabellen-HTML entfernt.
- Alte Tabellen-Textduplikate werden beim Sammeln der aktuellen Textfelder aus dem globalen Textzustand herausgehalten.

Geprüft:

- `node --check` für `orte-inline-editor.js`.
- Browserprüfung:
  - 475 Tabellenfelder mit `table-text-*`,
  - 49 normale Seitenfelder mit `text-*`,
  - keine falsch klassifizierten IDs,
  - keine Runtime-Fehler.
- Kontrollierter LocalStorage-Test ohne Firebase:
  - einfache Tabellenzeile eingefügt,
  - gespeichert,
  - reload geprüft,
  - normale Seitentexte blieben an denselben IDs,
  - Teststand danach wieder gelöscht.
- Kontrollierter LocalStorage-Test ohne Firebase:
  - Personengruppe hinzugefügt: 25 -> 26 Gruppen, 25 -> 26 Portraitslots,
  - gespeichert,
  - reload geprüft,
  - Teststand danach wieder gelöscht.
- Kontrollierter LocalStorage-Test ohne Firebase:
  - Personengruppe entfernt: 25 -> 24 Gruppen, 25 -> 24 Portraitslots,
  - gespeichert,
  - reload geprüft,
  - Teststand danach wieder gelöscht.

Noch offen:

- Einfügen/Entfernen plus Speichern/Reload kontrolliert testen.
- Langfristig bessere explizite Feld-Keys für wichtige Seitenbereiche ergänzen, damit auch größere HTML-Umbauten stabil bleiben.

## Umsetzungsstand: Hauptbildflächen

Umgesetzt:

- Alte Dateinamen-Platzhalter wurden durch fachliche Bildlabels ersetzt:
  - Stadtwappen / Icon,
  - Stadtbild oder Stadtkarte,
  - Wappen oder Banner,
  - Anzeigetafel,
  - Zeitungsblatt,
  - Bezirkskarte,
  - Militärbild,
  - Regionskarte.
- Für diese Slots wurden sinnvolle Standardformate und Maximalhöhen gesetzt, z. B. Banner, Hochformat oder Querformat.
- Die Bilddialoge verwenden dadurch sprechende Titel statt Dateinamen.

Geprüft:

- Browserprüfung:
  - alle acht Hauptslots existieren,
  - Labels und Formate sind gesetzt,
  - der Bilddialog für `Zeitungsblatt` öffnet korrekt,
  - keine Runtime-Fehler.

Noch offen:

- Wappen-/Symbolbilder in komplexen Tabellen gegen alle Screenshots prüfen.

## Umsetzungsstand: Automatische Bildslot-Schlüssel

Umgesetzt:

- Automatisch erkannte Portraitbilder erhalten jetzt `portrait-*` als Schlüsselpräfix.
- Automatisch erkannte Wappen-/Symbolbilder erhalten jetzt `symbol-*` als Schlüsselpräfix.
- Geklonte leere Bildslots verwenden ihren Tabellenkontext, um passende Labels und Schlüsselpräfixe zu erhalten.

Geprüft:

- `node --check` für `orte-inline-editor.js`.
- Browserprüfung:
  - 25 Portraitslots mit `portrait-*`,
  - 48 Symbol-/Wappenslots mit `symbol-*`,
  - keine fehlerhaften Bildschlüssel,
  - keine Runtime-Fehler.

Noch offen:

- Prüfen, ob einzelne wiederholbare Personen künftig zusätzlich persistente Gruppen-IDs brauchen, sobald echte Personendaten statt Vorlageplatzhalter eingetragen werden.

## Umsetzungsstand: Rating-Slider in komplexen Tabellen

Problem:

- Ratingzellen in `Aristokratie/Häuser` und `Händler & Etablissemants` wurden zuerst als normale Textfelder markiert.
- Dadurch fing die Textbearbeitung den Slider-Input ab, bevor die Ratinglogik den neuen Wert speichern konnte.
- Ergebnis: Im Bearbeitungsmodus sah der Slider geändert aus, nach Speichern/Reload sprang der Wert zurück.

Umgesetzt:

- Die Inline-Erkennung sammelt jetzt zuerst Bildslots und Ratingzellen.
- Normale Textfelder werden erst danach gesammelt.
- Ratingzellen bekommen dadurch keine konkurrierende Textfeldbehandlung mehr.

Geprüft:

- `node --check` für `orte-inline-editor.js`.
- Kontrollierter LocalStorage-Test ohne Firebase:
  - Aristokratie/Häuser: erster Ratingwert `5 -> 2`,
  - Händler/Etablissements: erster Ratingwert `2 -> 4`,
  - gespeichert,
  - reload geprüft,
  - beide Werte blieben korrekt erhalten,
  - Teststand danach wieder gelöscht.
- Browserprüfung:
  - Aristokratie/Häuser: 54 Ratingzellen, 18 Symbolslots,
  - Händler/Etablissements: 24 Ratingzellen, 8 Symbolslots,
  - keine Runtime-Fehler.

## Umsetzungsstand: Komplexe Symbol-/Ratingzeilen

Problem:

- In `pt-s-0040`-Tabellen bekamen zuerst auch Kopf- und Strukturzeilen Zeilensteuerungen.
- Dadurch konnte eine Zeile ohne Symbolslot und ohne Ratings geklont werden.

Umgesetzt:

- `pt-s-0040`-Zeilen sind nur noch klonbar, wenn die erste Zelle einen echten Bildslot enthält.
- Damit werden Kopf-, Trenner- und Abschnittszeilen nicht mehr als Datenzeilen behandelt.

Geprüft:

- Kontrollierter LocalStorage-Test ohne Firebase, `Aristokratie/Häuser`:
  - Einfügen: Zeilen `35 -> 36`, Symbolslots `18 -> 19`, Ratings `54 -> 57`,
  - gespeichert,
  - reload geprüft,
  - Teststand danach gelöscht.
- Kontrollierter LocalStorage-Test ohne Firebase, `Aristokratie/Häuser`:
  - Entfernen: Zeilen `35 -> 34`, Symbolslots `18 -> 17`, Ratings `54 -> 51`,
  - gespeichert,
  - reload geprüft,
  - Teststand danach gelöscht.
- Keine Runtime-Fehler.

## Umsetzungsstand: Overlay-Zusammenspiel und Szenen-Sidebar

Geprüft:

- Direktbearbeitung, Bilddialog, Status-Dot und Szenen-Sidebar können gleichzeitig initialisieren.
- Der Bilddialog liegt über der Szenen-Sidebar:
  - Bilddialog `z-index: 1200`,
  - Szenen-Sidebar `z-index: 980`.
- Bilddialog lässt sich öffnen und wieder schließen, ohne die Sidebar zu beschädigen.
- Szenen-Sidebar öffnet korrekt und der `+ Szene`-Button ist verfügbar.
- Kontrollierter LocalStorage-Test ohne Firebase:
  - `+ Szene` erzeugt eine Szenenkarte,
  - Zähler `0 -> 1`,
  - Aktionen `Öffnen`, `Bearbeiten`, `Löschen` vorhanden,
  - lokale Szenendaten danach wieder gelöscht.
- Keine Runtime-Fehler.

Noch offen:

- Echten Firebase-Fluss mit Szenenindex prüfen, sobald Netlify/Firebase-Teststand bewusst genutzt werden soll.
- Mobile/enge Viewports mit Sidebar, Dot und Bilddialog zusammen testen.

## Analyseergebnis: AleriaAlmanach-Moduleditor

Geprüfte Kernbereiche:

- `AleriaAlmanach/modules/module-editor/module-editor-controller.js`
- `AleriaAlmanach/modules/module-editor/module-editor-workflow.js`
- `AleriaAlmanach/modules/module-editor/module-editor-pages.js`
- `AleriaAlmanach/modules/module-editor/module-editor-page-cards.js`
- `AleriaAlmanach/modules/module-editor/module-editor-preview.js`
- `AleriaAlmanach/modules/module-editor/module-editor-events.js`
- `AleriaAlmanach/modules/module-editor/module-editor-session.js`
- `AleriaAlmanach/modules/module-editor/module-editor-templates.js`
- `AleriaAlmanach/modules/core/app-core.js`
- `AleriaAlmanach/modules/rendering/module-renderer.js`
- `AleriaAlmanach/AleriaAlmanach.html`, Bereich `module-editor-overlay`

### Wichtige Erkenntnisse

Der AleriaAlmanach-Moduleditor besteht nicht nur aus ein paar Formularfeldern. Er ist ein zusammengesetztes System aus:

- Editor-Shell mit Freischaltung, Footer, Import/Export und Status.
- Modul-Metadaten: ID, Titel, Untertitel, Typ, Kategorie, Stempel, Kartenbild, Symbol, Größe.
- Seitenverwaltung mit mehreren Page-Cards.
- Seitentyp-/Template-Registry.
- Session-spezifischen Feldern.
- Bildlogik: Bildstil, Bildbreite, Bildfüllung und Bildposition.
- Kommentar-Cast pro Modul und pro Seite.
- Livevorschau über `collectModuleEditorPayload()` und `renderModuleEditorPreview()`.
- Validierung und Sanitizing über `sanitizeModuleEntry()` und `sanitizeModulePage()`.
- Speicherworkflow über `saveModuleFromEditor()`.

Der aktuelle Orte-Szeneneditor übernimmt bisher nur einen kleinen Ausschnitt davon. Das erklärt, warum er sich schlechter und unvollständiger anfühlt.

### Direkte Wiederverwendung

Diese Teile sollten für Orte möglichst direkt genutzt werden:

- `buildModulePageEditorMarkup()`
- `collectModulePageFromCard()`
- `renderModuleEditorPages()`
- `bindModuleEditorLiveSync()`
- `renderModuleEditorPreview()`
- `buildSessionModuleEditorFields()`
- `collectSessionModuleEditorPage()`
- `MODULE_TEMPLATE_REGISTRY.session`
- `createDefaultSceneSessionPage()`
- `sanitizeModuleEntry()`
- `sanitizeModulePage()`
- Bildfunktionen für Bildstil, Bildbreite, Bildfüllung und Bildposition.

### Nicht direkt übernehmen

Diese Teile sind Almanach-spezifisch und brauchen einen Orte-Adapter:

- Bereichsauswahl über `getValidSections()`.
- Speichern in `_customSections`, `_entryOverrides` und `saveModuleStore()`.
- Almanach-Import/Export für Masterpakete.
- Almanach-Kommentarrettung über Modul-ID.
- Globale Almanach-Navigation und Sidebar-Feed.
- Löschen oder Zurücksetzen von Almanach-Modulen.

### Technische Entscheidung

Für Orte soll **kein eigener kleiner Szeneneditor** weiterentwickelt werden.

Stattdessen:

1. Der große Almanach-Moduleditor wird als Editor-Oberfläche wiederverwendet.
2. Orte bekommen einen eigenen Adapter für:
   - Payload-Erzeugung aus einer Ortsszene,
   - Speichern in `orte_scenes`,
   - Szenenindex,
   - Ort-ID,
   - Rückgabe in die Orte-Sidebar,
   - Öffnen der bearbeiteten Szene im bestehenden Almanach-Session-Renderer.
3. Almanach-Daten bleiben unangetastet.
4. Die Kommentarlogik bleibt die bereits angebundene Almanach-Kommentarlogik pro Orte-Thread.

### Konsequenz für die nächste Umsetzung

Der nächste technische Schritt ist nicht, einzelne Felder in `orte-scene-session.js` weiter aufzublähen.

Stattdessen wird benötigt:

- ein `orte-scene-editor-adapter.js`,
- ein Orte-spezifischer Editor-Kontext,
- eine Möglichkeit, das `module-editor-overlay` aus dem Almanach in Orte zu laden,
- ein Override/Hook für `saveModuleFromEditor()`, wenn der Kontext `sourceKind: "orte-scene"` ist,
- ein Mapper:
  - Orte-Szene -> Almanach-Editor-Payload,
  - Almanach-Editor-Payload -> Orte-Szene.

Damit wird die Bearbeitung der interaktiven Szene auf das Niveau des AleriaAlmanach gebracht, ohne den Almanach-Monolithen zu kopieren.

## Umsetzungsstand: Orte-Szeneneditor-Adapter

Stand nach der ersten Adapter-Umsetzung:

- Der große `module-editor-overlay` aus dem AleriaAlmanach wird in der Orte-Seite geladen.
- Die nötigen Almanach-Editor-Skripte und Styles werden für Orte nachgeladen.
- Eine Ortsszene wird in ein Almanach-Editor-Payload gemappt.
- Der Almanach-Speichern-Button wird im Orte-Kontext abgefangen.
- Gespeichert wird wieder in die Orte-Szene, nicht in den Almanach-Modulspeicher.
- Bildoptionen aus dem Almanach-Editor werden übernommen:
  - Bild-URL,
  - Bildstil,
  - Bildbreite,
  - Bildfüllung,
  - Bildausschnitt.
- Die Livevorschau des Almanach-Editors funktioniert im Orte-Kontext.

Getestet:

- Szenen-Sidebar öffnen.
- Szene bearbeiten.
- Almanach-Moduleditor anzeigen.
- Editor-Freischaltung im Test setzen.
- Session-Felder anzeigen.
- Bildsteuerungen anzeigen.
- Livevorschau rendern.
- Titel ändern und speichern.
- Geänderter Titel landet im Orte-LocalStorage.
- Keine JavaScript-Fehler im Browserlauf.

Noch offen:

- Editor visuell für Orte aufräumen.
- Almanach-spezifische Import-/Exportbereiche im Orte-Kontext bewerten.
- Sidebar-Design verbessern.
- Speichern gegen Firebase im echten Nutzerfluss prüfen.
- Szenen-Löschen über den großen Editor final absichern.
- Umlaute in Orte-Skripten und sichtbarer UI bereinigen.

## Umsetzungsstand: Szenen-Sidebar

Stand nach dem ersten Redesign:

- Sidebar bleibt weiterhin rechts überlagernd und verschiebt die Hauptseite nicht.
- Eingeklappter Zustand wurde als schmalere Lasche überarbeitet.
- Kopfbereich zeigt jetzt:
  - Bereichslabel,
  - Titel `Ortsszenen`,
  - Szenenzähler,
  - Aktion `+ Szene`.
- Szenenkarten zeigen jetzt:
  - laufende Nummer,
  - Stempel,
  - Szenentitel,
  - Seitentitel,
  - Aktionen `Öffnen`, `Bearbeiten`, `Löschen`.
- Sichtbare Sidebar-Texte verwenden echte Umlaute.
- Aktive Szene kann optisch markiert werden.
- `aria-expanded` wird beim Öffnen/Schließen aktualisiert.

Getestet:

- Lokale Testszenenliste mit zwei Szenen geladen.
- Sidebar geöffnet.
- Zähler geprüft.
- Szenenkarten geprüft.
- Aktionsbeschriftungen mit Umlauten geprüft.
- Keine JavaScript-Fehler im Browserlauf.

Noch offen:

- Mobile Ansicht visuell prüfen.
- Feinabstimmung der geöffneten Breite und Position.
- Ggf. kleineres Symbol/kompaktere Lasche testen.
- Sidebar später mit dem Firebase-Status-Dot zusammen prüfen, damit sich beide Overlays nicht stören.

### Phase 1: Analyse vor Umbau

Ziel: Keine weitere Parallel- oder Flicklogik bauen.

1. AleriaAlmanach-Moduleditor lesen.
2. Session-Editorlogik, Livevorschau, Bildlogik und Speicherlogik voneinander trennen.
3. Entscheiden, welche Teile direkt wiederverwendet werden.
4. Entscheiden, welche Teile über einen Orte-Adapter angebunden werden.

Ergebnis dieser Phase:

- Technische Entscheidung für den Orte-Szeneneditor.
- Liste der zu übernehmenden Almanach-Funktionen.
- Liste der Orte-spezifischen Adapterfunktionen.

### Phase 2: Szenensystem korrigieren

Ziel: Die interaktive Szene soll sich wie im AleriaAlmanach bearbeiten lassen.

1. Orte-Szeneneditor an Almanach-Editorlogik angleichen.
2. Livevorschau sauber anbinden.
3. Bildbereich der Szene ergänzen.
4. Speichern pro Ort absichern.
5. Szenen-Sidebar neu gestalten.

Abschlusskriterium:

- Eine Orte-Szene kann erstellt, bearbeitet, gespeichert, geöffnet und kommentiert werden, ohne schlechter bedienbar zu sein als im Almanach.

### Phase 3: UI-Störungen entfernen

Ziel: Die Vorlage soll ruhig und sauber wirken.

1. Firebase-Statusmeldungen in einen Dot unten links überführen.
2. Dot klickbar, einklappbar und verschiebbar machen.
3. Konflikt-Auswahl für lokale/Online/aktuellste Version ergänzen.
4. Umlaute und sichtbare UI-Texte bereinigen.
5. Sidebar optisch finalisieren.

Abschlusskriterium:

- Keine störenden Statusleisten oder kaputten deutschen Texte bleiben sichtbar.

### Phase 4: Strukturfehler der Vorlage beheben

Ziel: Sichtbare Tabellen-/Layoutfehler entfernen.

1. Doppelte Bannkreis-Überschrift beheben.
2. Fehlende Bildplatzhalter systematisch ergänzen.
3. Leere Bildflächen durch echte bearbeitbare Platzhalter ersetzen.
4. Platzhalter in Einleitung, Zeitungsblatt, Bezirke, Militär, Persönlichkeiten und Region prüfen.

Abschlusskriterium:

- Keine leeren Bildflächen oder doppelten Überschriften bleiben bestehen.

### Phase 5: Direktbearbeitung robust machen

Ziel: Bearbeiten darf Inhalte nicht verschieben.

1. Automatische Feld-Erkennung einschränken.
2. Stabile IDs für bearbeitbare Felder definieren.
3. Tabellen strukturiert speichern, wo `tbody.innerHTML` zu riskant ist.
4. Einfügen/Entfernen in Tabellen an beliebigen sinnvollen Positionen ermöglichen.
5. Persönlichkeiten als eigene wiederholbare Gruppen behandeln.
6. Speichern/Laden mit Reload testen.

Abschlusskriterium:

- Nach Bearbeiten, Speichern und Reload steht jeder Inhalt an seiner ursprünglichen logischen Stelle.

### Empfohlene Reihenfolge der nächsten Arbeit

1. **Almanach-Editoranalyse**.
2. **Orte-Szeneneditor angleichen**.
3. **Szenen-Sidebar neu gestalten**.
4. **Firebase-Status-Dot einführen**.
5. **Umlaute und sichtbare Texte bereinigen**.
6. **Bannkreis-Dopplung korrigieren**.
7. **Fehlende Bildplatzhalter ergänzen**.
8. **Direktbearbeitung und Tabellenlogik stabilisieren**.
9. **Persönlichkeiten als wiederholbare Gruppen umsetzen**.
10. **Abschlusstest über Bearbeiten, Speichern, Reload und Szenenkommentare**.
## Fortschritt nach aktueller Stabilisierung

Gesamtfortschritt: ca. 64%.

Erledigt in dieser Runde:

- Bildbearbeitung läuft über ein zentrales Popup statt über eingebettete Panels unter jedem Bild.
- Hauptbildplätze, Regionskarte, Symbolplätze und Portraitplätze werden als echte bearbeitbare Bildslots erkannt.
- Bildslots unterstützen URL, Link, Alt-Text, Format, Einpassung, Breite und Höhe.
- Firebase-Direktbearbeitungsstatus ist auf einen dezenten Dot unten links reduziert.
- Der Dot kann geöffnet werden, zeigt Versionsoptionen und bleibt mobil im Viewport.
- Tabellenzeilen können nicht nur am Ende, sondern auch an vorhandenen Zeilen eingefügt oder entfernt werden.
- Persönlichkeiten werden als wiederholbare Gruppen behandelt und können als Gruppe ergänzt oder entfernt werden.
- Bewertungsfelder in komplexen Tabellen werden als Regler gespeichert, ohne Textfelder zu vermischen.
- Die doppelte sichtbare Bannkreis-Überschrift wurde entfernt.
- Die rechte Szenen-Sidebar öffnet mobil wieder korrekt; Ursache war eine mobile CSS-Regel, die den geöffneten Zustand optisch überlagert hat.

Getestet:

- Mobile Ansicht mit 390px Breite.
- Bilddialog öffnet und bleibt vollständig sichtbar.
- Rechte Szenen-Sidebar öffnet als Overlay, ohne die Hauptseite zu verschieben.
- Status-Dot und Statuspanel bleiben sichtbar und stören die Seitenbreite nicht.
- Kein horizontaler Dokument-Overflow im Mobile-Test.
- Keine JavaScript-Laufzeitfehler im geprüften Browserlauf.

Noch offen:

- Szeneneditor im Orte-Kontext weiter an die volle Almanach-Bearbeitungslogik angleichen.
- Import-/Exportbereiche des Almanach-Editors für Orte bewusst freigeben oder ausblenden.
- Sichtbare Umlaute/Kodierungsartefakte in älteren Dokument- und UI-Bereichen bereinigen.
- Abschlusstest mit echter Firebase-Synchronisation, Szenenkommentaren, Reload und Hard Reset.

## Fortschritt: Almanach-Editor-Funktionen im Orte-Kontext

Gesamtfortschritt: ca. 67%.

Erledigt:

- Der Orte-Szeneneditor lädt zusätzlich die bestehenden Almanach-Import/Export-Module:
  - `modules/backup/almanach-backup.js`,
  - `module-import-export.js`.
- Damit sind im großen Orte-Szeneneditor jetzt dieselben relevanten Handler verfügbar:
  - Modulpaket exportieren,
  - Kommentar-Backup exportieren,
  - ausgewählten Kommentar-Thread exportieren,
  - ausgewählten Kommentar-Thread importieren,
  - JSON in den aktuellen Editor übernehmen.
- Globale Almanach-Aktionen, die nicht zu einer einzelnen Ortsszene gehören, werden im Orte-Modus ausgeblendet:
  - `Als neues Modul laden`,
  - `Alle Module herunterladen`,
  - `Masterpaket importieren`,
  - `Vollbackup herunterladen`,
  - `Lokalen Speicher bereinigen`,
  - Vollbackup-Dateiimport.
- Für den Orte-Kontext gibt es einen gekapselten Fallback für `ensureModuleNodeForSection`, damit der Almanach-Editor einen gültigen Bereichs-Payload erzeugen kann, ohne den Almanach-Modulbaum zu verändern.

Getestet:

- Großen Szeneneditor lokal geöffnet.
- Temporären Orte-Szenenstand angelegt und nach dem Test wieder aus LocalStorage entfernt.
- Editor-Freischaltung temporär gesetzt und anschließend wiederhergestellt.
- `collectModuleEditorPayload()` erzeugt einen gültigen Orte-Payload mit:
  - Bereich `Orte`,
  - stabiler Node-ID,
  - einer Session-Seite.
- JSON-Vorschau erzeugt gültiges `aleria-module`-JSON.
- JSON-Übernahme in den aktuellen Editor wurde getestet:
  - Titel geändert,
  - Untertitel geändert,
  - Seitentitel geändert,
  - Introtext geändert.
- Anschließendes Speichern schreibt die Werte zurück in dieselbe Ortsszene im Orte-LocalStorage.
- Dateiimport im Orte-Kontext wurde abgesichert:
  - Almanach-Masterpakete und Vollbackups werden abgelehnt,
  - einzelne Module und Modulpakete werden in die aktuell geöffnete Ortsszene übernommen.
- Eingebettete Kommentar-Bundles werden beim Speichern der Ortsszene importiert.
- Kommentar-IDs und Redestab-IDs werden auf die Ziel-Ortsszene umgeschrieben, z. B. `orte:grossstadt-vorlage:szene-1::session:kommentarimport`.
- Ein versehentlicher Firebase-Testkommentar wurde nach der Prüfung gezielt wieder gelöscht.
- Der abschließende Kommentarimport-Test lief mit gemocktem Backend, ohne echte Firebase-Schreibaktion.
- Alle relevanten Import/Export-Funktionen sind im Browser als Funktionen vorhanden.
- Die globalen Almanach-Aktionen sind im Orte-Modus nicht sichtbar.
- Keine JavaScript-Laufzeitfehler im Prüflauf.

Noch offen:

- Einen echten Kommentar-Import/Export mit Firebase-Daten testen.
- UI-Texte/Kodierungsartefakte im großen Editor und in den verbleibenden Dokumentbereichen bereinigen.
- Echten Nutzerfluss mit Firebase nur noch bewusst testen, nicht mehr während automatischer Diagnoseläufe.

## Fortschritt: Szenenfluss und Kommentarbedienung stabilisiert

Gesamtfortschritt: ca. 75%.

Erledigt:

- Der alte aktive Mini-Editorpfad der Ortsszenen wurde entfernt.
- `+ Szene` und `Bearbeiten` führen im normalen Orte-Fluss jetzt ausschließlich in den großen Almanach-Moduleditor.
- Wenn der Almanach-Moduleditor nicht geladen werden kann, erscheint ein Fehlerstatus statt einer abgespeckten Ersatzoberfläche.
- Nicht mehr genutzte CSS-Regeln für den alten Mini-Editor wurden entfernt.
- Die Orte-Runtime lädt nun zusätzlich `modules/characters/character-profile.js`, weil `character-comment-picker.js` daraus `MAX_EMOTES` erwartet.
- Damit wird die Charakter-/Avatar-Auswahl im Kommentarformular auf denselben Almanach-Grundlagen betrieben.

Geprüft:

- `node --check` für `orte-scene-session.js`.
- Browserprüfung:
  - `+ Szene` öffnet den großen Almanach-Moduleditor.
  - `orte-module-editor-mode` ist aktiv.
  - keine alte `.orte-scene-editor-overlay` wird erzeugt.
  - globale Almanach-Importaktionen bleiben im Orte-Kontext ausgeblendet.
  - Kommentarformular öffnet aus der interaktiven Szene.
  - 143 Charakteroptionen werden im Kommentarformular angeboten.
  - Charakterauswahl reagiert direkt.
  - Avatar-/Emote-Bereich öffnet mit 29 Optionen.
  - `MAX_EMOTES` ist im Orte-Kontext verfügbar und hat den Almanach-Wert `40`.
  - keine JavaScript-Laufzeitfehler im Prüflauf.

Noch offen:

- Echten Kommentar speichern, editieren und löschen im Orte-Firebase-Kontext prüfen.
- Mehrseitige Ortsszenen im großen Editor mit realem Speichern/Laden weiter gegen echte Nutzdaten prüfen.
- Restliche visuelle Feinheiten am großen Editor im Orte-Kontext nachziehen.

Zusätzlicher Prüflauf ohne echte Firebase-Schreibaktion:

- Kommentar-Backend im Browserlauf vollständig gemockt.
- Interaktive Ortsszene geöffnet.
- Kommentarformular geöffnet.
- Erzähler-Kommentar gespeichert.
- Bearbeitungscode geprüft.
- Kommentartext geändert und gespeichert.
- Kommentar anschließend gelöscht.
- Ergebnis:
  - `afterAdd: 1`,
  - `afterEditText: CRUD Test Kommentar bearbeitet`,
  - `afterDelete: 0`,
  - keine JavaScript-Laufzeitfehler.

## Fortschritt: Mehrseitige Ortsszenen erhalten

Gesamtfortschritt: ca. 77%.

Problem:

- Der große Almanach-Moduleditor kann mehrere Seiten verwalten.
- Die Orte-Szene speicherte intern bisher aber nur `module.page`.
- Dadurch wären zusätzliche Seiten beim Rückschreiben aus dem großen Editor verloren gegangen.

Erledigt:

- Orte-Szenen normalisieren jetzt zusätzlich `module.pages`.
- Alte Einzelseiten bleiben kompatibel über `module.page`.
- Der Almanach-Render-Eintrag wird aus allen Seiten gebaut, nicht mehr nur aus Seite 1.
- Der Editor-Payload wird mit allen Seiten geöffnet.
- Beim Speichern aus dem großen Almanach-Editor werden alle Seiten zurück in die Ortsszene geschrieben.
- Für `addModulePage()` wurde ein schmaler Orte-Fallback für `createInlinePageByType()` ergänzt, der die geladene Almanach-Template-Registry nutzt.
- Cachebuster für `orte-scene-session.js` und `orte-scene-session.css` wurde auf `orte-session-multipage-20260624a` erhöht.

Geprüft:

- `node --check` für `orte-scene-session.js`.
- Browserprüfung mit gemocktem Orte-Szenenspeicher:
  - Editor öffnet mit einer Seite.
  - `addModulePage('session')` erzeugt eine zweite Seitenkarte.
  - `collectModuleEditorPayload()` liefert zwei Seiten.
  - `saveScene` erhält zwei Seiten.
  - `state.module.pages` enthält nach dem Speichern zwei Seiten.
  - LocalStorage-Speicherung enthält zwei Seiten.
  - Die geöffnete interaktive Szene zeigt die zweite Seite nach Seitenwechsel an.
  - Keine JavaScript-Laufzeitfehler im Prüflauf.

Noch offen:

- Echten Mehrgeräte-Konflikt mit zwei Browsern prüfen.
- Sichtbare Konfliktmeldung für Szenenindex-Races bewerten.

## Fortschritt: Firebase-Mehrseiten und Race-Schutz

Gesamtfortschritt: ca. 82%.

Problem:

- Die Orte-Firebase-Schicht normalisierte Remote-Szenen noch auf eine einzelne `page`.
- Dadurch konnten echte Firebase-Rückläufe neue Mehrseiten-Szenen wieder auf eine Seite reduzieren.
- Zusätzlich konnte ein älterer Snapshot theoretisch kurz nach lokalem Speichern den frischeren lokalen Stand überschreiben.

Erledigt:

- `orte-scene-firebase.js` normalisiert jetzt `pages` und behält `page` nur als Kompatibilitätsbrücke.
- `sessionCast` und `sessionCastDetails` bleiben beim Firebase-Rundlauf erhalten.
- Remote-Szenen bekommen `_remoteUpdatedAtClient` aus dem Firestore-Dokument.
- Remote-Szenenindizes bekommen ebenfalls `_remoteUpdatedAtClient`.
- `orte-scene-session.js` setzt beim lokalen Speichern `localUpdatedAtClient`.
- Lokale Szenen speichern getrennte Meta-Daten in `aleria:orte:session-module-meta:*`.
- Der Szenenindex speichert getrennte Meta-Daten in `aleria:orte:scene-index-meta:*`.
- Ältere Remote-Snapshots werden ignoriert und nicht mehr auf die lokale Szene geschrieben.
- Neuere Remote-Snapshots werden weiterhin übernommen.
- Nach Übernahme eines neueren Remote-Snapshots wird der lokale Konfliktmarker zurückgesetzt.
- Der Cachebuster wurde auf `orte-session-meta-20260624a` und `orte-scene-meta-20260624a` erhöht.

Geprüft:

- `node --check` für:
  - `orte-scene-session.js`,
  - `orte-scene-firebase.js`,
  - `orte-inline-editor.js`,
  - `orte-inline-firebase.js`.
- Browserprüfung mit gemocktem Szenenspeicher:
  - lokaler Save erzeugt `localUpdatedAtClient`,
  - älterer Remote-Snapshot wird ignoriert,
  - Status: `Älterer Online-Stand ignoriert.`,
  - neuerer Remote-Snapshot wird übernommen,
  - Status: `Online geladen.`,
  - keine JavaScript-Laufzeitfehler.
- Echter Firebase-Test mit temporärer Szene:
  - Szene `codex-temp-race-*` gespeichert,
  - zwei Seiten geladen,
  - Titel `I. Test` und `II. Test` korrekt erhalten,
  - `_remoteUpdatedAtClient` vorhanden,
  - temporäre Szene direkt danach gelöscht,
  - Kontrolle nach Löschung: `deleted`,
  - keine JavaScript-Laufzeitfehler.
- Browserprüfung mit gemocktem Firebase-Modul nach Reload:
  - lokale Szene wurde aus `localStorage` wiederhergestellt,
  - lokaler Meta-Zeitstempel blieb nach Reload erhalten,
  - älterer Remote-Snapshot wurde ignoriert,
  - neuerer Remote-Snapshot wurde übernommen,
  - lokaler Szenen-Meta-Zeitstempel wurde danach auf `0` gesetzt,
  - älterer Szenenindex-Snapshot wurde ignoriert,
  - neuerer Szenenindex-Snapshot wurde übernommen.

Noch offen:

- Echten Mehrgeräte-Konflikt mit zwei Browsern prüfen.
- Prüfen, ob für den Szenenindex zusätzlich eine sichtbare Konfliktmeldung nötig ist, statt ältere Index-Snapshots nur still zu ignorieren.
- Direktbearbeitung der Platzhalter und Tabellen nach dem Szenen-Meta-Umbau erneut kurz im Browser gegenprüfen.

## Fortschritt: Direktbearbeitung nach Szenen-Meta-Umbau geprüft

Gesamtfortschritt: ca. 82%.

Ziel:

- Sicherstellen, dass die neue Szenen-Meta-Persistenz keine Seiteneffekte auf die Direktbearbeitung der Großstadtseite erzeugt.
- Prüfung ohne echte Firebase-Schreibvorgänge und mit Wiederherstellung der lokalen Inline-Daten.

Geprüft:

- Browserprüfung mit gemocktem `OrteInlineFirebase`.
- Lokale Inline-Storage-Werte wurden vor dem Test gesichert und danach wiederhergestellt.
- Bearbeitungsmodus lässt sich aktivieren.
- Zentraler Bilddialog öffnet für einen Bildplatzhalter.
- Bild-URL, Klick-Link und Alt-Text werden im Slot gerendert und im Payload gespeichert.
- Tabellenzeile kann mitten in einer Tabelle eingefügt werden.
- Persönlichkeitsgruppe kann über `+` erweitert werden.
- Rating-Regler schreibt den Wert in `payload.ratings`.
- Speichern erzeugt einen Inline-Payload und ruft den gemockten Store auf.
- Keine JavaScript-Laufzeitfehler im Browserlauf.

Noch offen:

- Sichtprüfung der Platzhalter in allen langen Tabellenbereichen, weil der automatisierte Lauf nur exemplarisch Slot, Tabelle, Persönlichkeit und Rating abdeckt.
- Prüfen, ob die Bearbeitungsmarkierungen bei sehr breiten Tabellen optisch zu dominant wirken.

## Fortschritt: Bildplatzhalter flächiger geprüft

Gesamtfortschritt: ca. 83%.

Geprüft:

- Statisches HTML enthält die großen festen Slots für Stadtwappen, Stadtkarte, Banner, Anzeigetafel, Zeitungsblatt, Regionskarte, Bezirkskarte und Militärbild.
- Nach Initialisierung des Inline-Editors existieren zur Laufzeit 82 bearbeitbare Bildslots.
- Davon wurden 26 Portraitslots und 48 Symbol-/Wappenslots erkannt.
- Ein generierter Portraitslot (`portrait-0000`) öffnet den zentralen Bilddialog.
- Ein generierter Symbolslot (`symbol-0000`) öffnet den zentralen Bilddialog.
- Keine JavaScript-Laufzeitfehler im Browserlauf.

Entscheidung:

- Keine Massenänderung im HTML nötig. Die vorhandene Normalisierung im Inline-Editor erzeugt die bearbeitbaren Slots zur Laufzeit und ist wartbarer als hunderte statische `data-orte-image-key`-Einträge in der Vorlage.

Noch offen:

- Optischer Sichtabgleich: Leere Trennzellen in den Persönlichkeits- und Symboltabellen dürfen nicht wie fehlende Bildslots wirken.
- Falls nötig, weitere Sonderfälle als Abstand/Separator kennzeichnen.

## Fortschritt: Leere Tabellenzellen als Separatoren gekennzeichnet

Gesamtfortschritt: ca. 83%.

Problem:

- Einige leere Zellen in Symbol-, Regions- und Persönlichkeitstabellen wirkten optisch wie vergessene Bildplatzhalter.
- Das war besonders störend, weil echte Bildplatzhalter daneben bewusst bearbeitbar sind.

Erledigt:

- Bekannte leere Separatorzellen werden in `orte-grossstadt.css` als schmale Trennflächen dargestellt.
- Die Regel greift nur, wenn die Zelle keinen Bildslot und kein Bild enthält.
- Der CSS-Cachebuster für `orte-grossstadt.css` wurde in Vorlage und Beispielseite erhöht.

Geprüft:

- Browserprüfung ohne JavaScript-Laufzeitfehler.
- Eine leere Symbol-Separatorzelle rendert schmal und transparent.
- Die Regionskarte bleibt groß und bearbeitbar.
- Ein Portraitslot bleibt bei 200px Höhe und bearbeitbar.
- Die Laufzeit-Slot-Zahl bleibt bei 82.

## Fortschritt: Szenenindex-Race sichtbar gemacht

Gesamtfortschritt: ca. 84%.

Problem:

- Ältere Szenenindex-Snapshots wurden korrekt ignoriert, aber bisher ohne sichtbaren Hinweis.
- Das erschwert Diagnose, wenn die Szenenliste nach einem Reload oder bei parallelen Browsern nicht sofort so aussieht wie erwartet.

Erledigt:

- Die Ortsszenen-Sidebar hat eine dezente Statuszeile für Szenenindex-Meldungen erhalten.
- Lokale Indexänderungen melden `Szenenliste lokal geändert.`.
- Erfolgreiche Online-Speicherung meldet `Szenenliste online gespeichert.`.
- Ältere Remote-Indizes melden `Ältere Online-Szenenliste ignoriert.`.
- Neuere Remote-Indizes melden `Online-Szenenliste geladen.`.
- Cachebuster für `orte-scene-session.css` und `orte-scene-session.js` wurde erhöht.

Geprüft:

- Browserprüfung mit gemocktem Szenenspeicher.
- Älterer Index-Snapshot wurde ignoriert und sichtbar gemeldet.
- Neuerer Index-Snapshot wurde übernommen und sichtbar gemeldet.
- Keine JavaScript-Laufzeitfehler.

## Fortschritt: Echter Zwei-Browser-Firebase-Test

Gesamtfortschritt: ca. 88%.

Ziel:

- Prüfen, ob Ortsszenen über echte Firebase-Synchronisation zwischen zwei Browser-Tabs sauber übertragen werden.
- Test bewusst mit temporärer `ortId`, damit keine echten Vorlagendaten verändert werden.

Geprüft:

- Browser A und Browser B wurden mit temporärer `ortId` geladen.
- Browser A speicherte eine neue Szene in echtem `OrteSceneFirebase`.
- Browser A speicherte einen Szenenindex mit dieser Szene.
- Browser B erhielt den Szenenindex und zeigte die neue Szene in der Sidebar.
- Browser B meldete `Online-Szenenliste geladen.`.
- Browser A aktualisierte anschließend den Szenentitel.
- Browser B erhielt das Szenenupdate.
- Die lokal gespeicherte Szene in Browser B enthielt weiterhin zwei Seiten.
- `localUpdatedAtClient` war nach Remote-Übernahme `0`.
- `remoteUpdatedAtClient` wurde gesetzt.
- Keine JavaScript-Laufzeitfehler in beiden Browsern.
- Temporäre Szene und temporärer Szenenindex wurden danach gelöscht.

Ergebnis:

- Der grundlegende echte Firebase-Sync für Ortsszenen funktioniert.
- Mehrseiten-Szenen bleiben beim echten Remote-Rundlauf erhalten.
- Die neue Meta-Logik unterscheidet korrekt zwischen lokalem Konfliktmarker und übernommenem Remote-Stand.

Noch offen:

- Ein manueller Sichttest mit tatsächlich geöffnetem Editor in zwei Fenstern bleibt sinnvoll, bevor die Vorlage als abgeschlossen gilt.

## Fortschritt: Hard Reset löscht Szenen-Meta-Daten

Gesamtfortschritt: ca. 85%.

Problem:

- Nach Einführung der getrennten Szenen-Meta-Keys musste der Hard Reset diese Schlüssel ebenfalls entfernen.
- Sonst könnten alte lokale Konfliktmarker nach einem Reset weiterwirken.

Erledigt:

- `removeLocalTemplateKeys()` löscht jetzt zusätzlich:
  - `aleria:orte:scene-index-meta:${pageId}`,
  - `aleria:orte:session-module-meta:${pageId}:*`.
- Cachebuster für `orte-inline-editor.js` wurde erhöht.

Geprüft:

- Browserprüfung mit temporärer `ortId` und gemocktem Inline-/Szenen-Firebase.
- Temporäre Inline-, Szenen-, Szenenindex-, Kommentar- und Meta-Keys wurden entfernt.
- Online-Reset wurde nur gegen die temporäre `ortId` aufgerufen.
- Keine JavaScript-Laufzeitfehler.

## Fortschritt: Sichtbare Sonderzeichen geprüft

Gesamtfortschritt: ca. 88%.

Problem:

- In der PowerShell-Ausgabe wirken einige Umlaute und Symbolzeichen beschädigt.
- Entscheidend ist aber die Browseranzeige mit `<meta charset="utf-8">`.

Geprüft:

- Browser-Titel rendert `Großstadt-Vorlage - Aleria`.
- Tabellen-Platzhalter rendern als `〈???〉`.
- Ratingzeichen rendern als `★`, `☆`, `✤` und `✧`.
- Deutsche Umlaute in sichtbaren Überschriften und Tabellenbereichen werden korrekt angezeigt.

Entscheidung:

- Keine Massenkonvertierung von HTML-Entities wie `&ouml;`, `&auml;`, `&uuml;`, `&szlig;`.
- Diese Entities sind im HTML stabil und rendern korrekt.
- Weitere Bereinigung sollte nur gezielt erfolgen, wenn ein konkreter sichtbarer Fehler im Browser auftritt.

## Fortschritt: Zwei-Fenster-Editor-Sync abgesichert

Gesamtfortschritt: ca. 90%.

Problem:

- Der echte Zwei-Browser-Sync funktionierte für Sidebar und lokale Szenenablage.
- Ein bereits geöffneter großer Almanach-Editor in Browser B blieb jedoch zunächst auf dem alten Stand, wenn Browser A dieselbe Szene speicherte.
- Ohne Schutz könnte Browser B später mit einem veralteten Editor-Payload den neueren Online-Stand überschreiben.

Erledigt:

- Wenn ein Remote-Update eintrifft und der zugehörige Orte-Szeneneditor offen ist:
  - Ist der Editor nicht dirty, wird der geöffnete Editor automatisch aus dem neuen Online-Stand neu befüllt.
  - Ist der Editor dirty, werden lokale Felder nicht überschrieben.
  - Bei dirty Editor wird eine klare Statusmeldung gesetzt.
  - Speichern aus einem dirty, veralteten Editor wird blockiert.
- Cachebuster für `orte-scene-session.js` wurde erhöht.

Geprüft:

- Echter Zwei-Fenster-Test mit temporärer `ortId`.
- Browser A und Browser B öffneten dieselbe temporäre Szene im großen Almanach-Editor.
- Beide Editorfenster zeigten zwei Seitenkarten.
- Browser A speicherte einen neuen Titel.
- Browser B erhielt den neuen Titel in Sidebar, LocalStorage und geöffnetem Editor.
- Browser B blieb dabei `dirty=false`.
- Konfliktfall geprüft:
  - Browser B hatte lokale ungespeicherte Änderung im geöffneten Editor.
  - Browser A speicherte einen neuen Remote-Stand.
  - Browser B behielt die lokale Editoränderung sichtbar bei.
  - Sidebar und lokale Szenenablage zeigten den Remote-Stand.
  - Status: lokale Änderungen wurden nicht überschrieben.
  - Speichern aus dem veralteten dirty Editor wurde blockiert.
- Keine JavaScript-Laufzeitfehler in den Prüfläufen.

## Fortschritt: Konfliktentscheidung im Orte-Szeneneditor

Gesamtfortschritt: ca. 92%.

Problem:

- Der Orte-Szeneneditor konnte einen neuen Online-Stand erkennen und blockierte das Speichern eines veralteten dirty Editors.
- Die Bedienung war aber noch zu unklar, weil nur ein Statussatz erschien.
- Nutzer mussten den Editor faktisch schließen und neu öffnen, statt bewusst zwischen Online-Stand und lokaler Fassung zu entscheiden.

Erledigt:

- Bei einem Remote-Update während lokaler ungespeicherter Änderungen erscheint jetzt ein eigenes Konfliktpanel im großen Almanach-Editor.
- Das Panel bietet zwei klare Entscheidungen:
  - `Online-Stand übernehmen`: lädt den neueren Remote-Stand in den geöffneten Editor.
  - `Lokale Fassung speichern`: speichert die aktuell sichtbare lokale Editorfassung bewusst über den Online-Stand.
- Der normale Speichern-Button bleibt blockiert, solange der Konflikt nicht entschieden wurde.
- Das Panel wird nach Übernahme, Speichern, Löschen oder sauberem Refresh entfernt.
- Cachebuster für `orte-scene-session.js` und `orte-scene-session.css` wurde erhöht.

Geprüft:

- `node --check Orte/assets/js/orte-scene-session.js`.
- Browserprüfung auf `http://127.0.0.1:8780/Orte/grossstadt.html` mit temporärer Szene `szene-2`.
- Testablauf:
  - Lokale Änderung im geöffneten Editor erzeugt.
  - Neueren Online-Stand über den bestehenden Orte-Firebase-Store simuliert.
  - Konfliktpanel erschien.
  - Lokale Änderung blieb vor der Entscheidung sichtbar erhalten.
  - `Online-Stand übernehmen` lud den Remote-Titel in den Editor und entfernte das Panel.
  - Zweiter Konflikt erzeugt.
  - `Lokale Fassung speichern` schrieb die lokale Fassung in den Online-Speicher.
  - Temporäre Szene wurde anschließend gelöscht.
- Nachprüfung:
  - `szene-2` remote nicht mehr vorhanden.
  - Keine sichtbare Szenenkarte für `szene-2`.
  - Kein übrig gebliebenes Konfliktpanel.

## Fortschritt: Orte-eigene sichtbare Texte bereinigt

Gesamtfortschritt: ca. 92%.

Problem:

- In den Orte-Dateien gab es noch einzelne ASCII- oder Kodierungsreste, die sichtbar oder für die weitere Arbeit relevant sein können.
- Gleichzeitig enthalten allgemeine Almanach-Editor-Module noch viele historische ASCII-Schreibweisen wie `Loeschen` oder `fuer`.

Entscheidung:

- In diesem Schritt werden nur Orte-eigene sichtbare Texte und Orte-Dokumente bereinigt.
- Die allgemeinen Almanach-Module werden nicht global umbenannt, weil das ein eigener, größerer UI-Text-Refactor mit breiterem Testbedarf wäre.

Erledigt:

- `aria-label="Eintrag schließen"` im Orte-Session-Overlay korrigiert.
- `ortName` der Großstadt-Szenendaten auf `Großstadt-Vorlage` gesetzt.
- Cachebuster für `grossstadt-vorlage.scenes.js` in Template und Beispielseite ergänzt.
- `reset-meta.json` auf echte Umlaute gebracht.
- `NEUER-ORT.md` in den sichtbaren deutschen Texten bereinigt.
- Kommentare in Orte-CSS-Dateien korrigiert.

Geprüft:

- `node --check Orte/assets/js/orte-scene-session.js`.
- `node --check Orte/data/grossstadt-vorlage.scenes.js`.
- Orte-Scan auf typische kaputte Zeichen und ASCII-Umlautreste.
- Übrig bleiben nur noch die Negativbeispiele im Diagnosekapitel selbst.

## Fortschritt: Bildplatzhalter und Tabellenstruktur sichtbar geprüft

Gesamtfortschritt: ca. 93%.

Problem:

- Mehrere feste Bildbereiche waren zwar technisch vorhanden, aber durch `place-spacer`-Absätze unsichtbar.
- Ursache war die alte Spacer-Erkennung: Sie erkannte echte `<img>`-Elemente, aber keine leeren `.orte-image-slot`-Platzhalter.
- Zusätzlich konnten alte gespeicherte Bildbreiten leere Hauptplatzhalter optisch zu klein wirken lassen.

Erledigt:

- `orte-grossstadt.js` erkennt Bildslot-Absätze jetzt als Medienabsätze:
  - `.orte-image-slot`
  - `[data-orte-image-key]`
- `orte-grossstadt.css` versteckt Spacer-Absätze nur noch, wenn sie keinen Bildslot enthalten.
- Leere, nicht-kompakte Bildslots bekommen eine Mindestbreite von `min(100%, 260px)`.
- Cachebuster für `orte-grossstadt.js` und `orte-grossstadt.css` wurde erhöht.

Geprüft:

- `node --check Orte/assets/js/orte-grossstadt.js`.
- `node --check Orte/assets/js/orte-inline-editor.js`.
- Browserprüfung auf frischer URL:
  - `Stadtbild oder Stadtkarte`: sichtbar, 260 x 195.
  - `Wappen oder Banner`: sichtbar, 260 x 81.
  - `Anzeigetafel`: sichtbar, 260 x 81.
  - `Zeitungsblatt`: sichtbar, 260 x 347.
  - `Bezirkskarte`: sichtbar, 260 x 195.
  - `Militärbild`: sichtbar, 260 x 195.
  - `Regionskarte`: im geöffneten Bannkreis sichtbar, 1262 x 394.
  - `Bannkreis - Regional` erscheint genau einmal.
- Bilddialog-Dry-Run:
  - Titel `Zeitungsblatt`.
  - Felder vorhanden: `src`, `href`, `alt`, `width`, `maxHeight`, `format`, `fit`.
- Tabellen-Dry-Run ohne Persistenz:
  - Persönlichkeitstabelle: Zeilen 118 -> 122, Controls 25 -> 26, Portraitslots 25 -> 26.
  - Regionstabelle: Zeilen 26 -> 27, Controls 23 -> 24.
  - Symbol-/Ratingtabelle: Zeilen 35 -> 36, Controls 18 -> 19.

Hinweis:

- Der Dry-Run wurde mit deaktiviertem Speichern ausgeführt. Er verändert keine produktiven Inline- oder Firebase-Daten.

## Fortschritt: Tabellen-Remove und Rating-Key-Kollision geprüft

Gesamtfortschritt: ca. 94%.

Problem:

- Beim Einfügen in die Symbol-/Ratingtabelle konnten doppelte Rating-Keys entstehen.
- Ursache: Neue geklonte Ratingzellen erhielten positionsbasierte Keys, die bereits von nachfolgenden Originalzeilen belegt waren.
- Damit bestand das Risiko, dass Sliderwerte später in falsche Zellen geschrieben werden.

Erledigt:

- `collectRatingItems()` vergibt Rating-Keys jetzt eindeutig:
  - vorhandene Keys werden nur übernommen, wenn sie in der aktuellen DOM-Struktur noch nicht benutzt wurden,
  - neue oder kollidierende Zellen erhalten den nächsten freien `rating-xxxx`-Key,
  - nicht mehr aktive Ratingwerte werden aus `state.ratings` entfernt.
- Cachebuster für `orte-inline-editor.js` wurde erhöht.

Geprüft:

- `node --check Orte/assets/js/orte-inline-editor.js`.
- Browser-Dry-Run ohne Persistenz:
  - Ausgangszustand:
    - Persönlichkeitstabelle: 118 Zeilen, 25 Controls, 25 Portraitslots.
    - Regionstabelle: 26 Zeilen, 23 Controls.
    - Symbol-/Ratingtabelle: 35 Zeilen, 18 Controls, 18 Symbolslots, 54 Ratingzellen.
    - Keine doppelten Bildkeys.
    - Keine doppelten Ratingkeys.
  - Einfügen:
    - Regionstabelle: 26 -> 27 Zeilen, 23 -> 24 Controls.
    - Symbol-/Ratingtabelle: 35 -> 36 Zeilen, 18 -> 19 Controls, 18 -> 19 Symbolslots, 54 -> 57 Ratingzellen.
    - Keine doppelten Bildkeys.
    - Keine doppelten Ratingkeys.
  - Entfernen:
    - Regionstabelle zurück auf 26 Zeilen und 23 Controls.
    - Symbol-/Ratingtabelle zurück auf 35 Zeilen, 18 Controls, 18 Symbolslots, 54 Ratingzellen.
    - Keine doppelten Bildkeys.
    - Keine doppelten Ratingkeys.
  - Persönlichkeitstabelle gesondert:
    - 118 -> 122 -> 118 Zeilen.
    - 25 -> 26 -> 25 Controls.
    - 25 -> 26 -> 25 Portraitslots.

Hinweis:

- Der erste Remove-Test hatte nach dem ersten Einfügen veraltete Button-Referenzen verwendet, weil die Tabellensteuerungen nach jedem Umbau neu aufgebaut werden. Der finale Test holt die Buttons nach jedem Neuaufbau frisch aus dem DOM.

## Fortschritt: Zeilencontrols überdecken Zellinhalte nicht mehr

Gesamtfortschritt: ca. 94%.

Problem:

- Die `+`/`+`/`-`-Steuerung für Tabellenzeilen lag absolut oben links in der ersten Tabellenzelle.
- Dadurch überdeckte sie Text, Wappen-/Symbolplatzhalter und kurze Zellinhalte.

Erledigt:

- Die Zeilencontrols wurden in einen linken Tabellen-Gutter verschoben.
- Die Controls bleiben zeilennah und vertikal mittig.
- Im Bearbeitungsmodus erhält `.place-document` links einen kleinen Arbeitsrand, damit die Controls bei linksstehenden Tabellen nicht aus dem Viewport ragen.
- Cachebuster für `orte-inline-editor.css` wurde erhöht.

Geprüft:

- Browserprüfung auf frischer URL im Bearbeitungsmodus.
- 94 sichtbare Zeilencontrol-Gruppen geprüft.
- Ergebnis:
  - `overlappingCount: 0`
  - `offscreenLeftCount: 0`
  - linksstehende Symbol-/Regions-/Persönlichkeitstabellen bleiben bedienbar.

## Fortschritt: Isolierte Persistenzprüfung der Direktbearbeitung

Gesamtfortschritt: ca. 95%.

Ziel:

- Prüfen, ob echte Direktbearbeitungsänderungen nach Speichern und Reload stabil erhalten bleiben.
- Die produktiven Vorlagendaten und Firebase-Daten dürfen dabei nicht verändert werden.

Testaufbau:

- Browserseite mit normaler `grossstadt.html`.
- Lokaler Speicherkey `aleria:orte:inline-content:v2:grossstadt-vorlage` wurde im Testbrowser auf einen einmaligen Testkey umgeleitet.
- `OrteInlineFirebase.save`, `reset`, `load` und `subscribe` wurden im Testbrowser neutralisiert.
- Nach Testende wurde der temporäre Testkey entfernt.

Geprüft:

- Vor Änderungen:
  - Persönlichkeitstabelle: 118 Zeilen, 25 Portraitslots.
  - Regionstabelle: 26 Zeilen.
  - Symbol-/Ratingtabelle: 35 Zeilen, 18 Symbolslots, 54 Ratingzellen.
  - Keine doppelten Bildkeys.
  - Keine doppelten Ratingkeys.
- Änderungen:
  - Eine Personengruppe eingefügt.
  - Eine Regionszeile eingefügt.
  - Eine Symbol-/Ratingzeile eingefügt.
  - Ersten Ratingwert auf `5` gesetzt.
  - `Zeitungsblatt` mit Bild-URL, Link, Alt-Text, Breite, Höhe, Format und Einpassung gesetzt.
- Nach Speichern:
  - Temporärer lokaler Payload existiert.
  - Payload enthält Tabellen, Ratings und Bilder.
- Nach Reload:
  - Persönlichkeitstabelle: 122 Zeilen, 26 Portraitslots.
  - Regionstabelle: 27 Zeilen.
  - Symbol-/Ratingtabelle: 36 Zeilen, 19 Symbolslots, 57 Ratingzellen.
  - Keine doppelten Bildkeys.
  - Keine doppelten Ratingkeys.
  - Ratingwert blieb `5`.
  - `Zeitungsblatt` blieb als Bild erhalten:
    - `src: https://example.com/test-zeitung.png`
    - `href: https://example.com/zeitung`
    - `alt: Persistenz Zeitung`
    - `maxHeight: 320`
    - `format: portrait`
    - `fit: contain`

Hinweis:

- Die gespeicherte Bildbreite wurde als `45` zurückgegeben, obwohl im Test `44` gesetzt wurde. Das kommt vom Slider-/Step-Verhalten des bestehenden Bilddialogs und ist funktional unkritisch.
