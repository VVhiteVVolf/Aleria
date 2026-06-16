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

Gesamtfortschritt der Großstadt-Vorlage: **ca. 28%**

Diese Zahl bewertet nicht nur, ob etwas sichtbar existiert, sondern ob es stabil, wartbar und langfristig brauchbar ist.

| Bereich | Fortschritt | Status |
| --- | ---: | --- |
| Diagnose und Arbeitsplan | 100% | Grundlage ist dokumentiert. |
| Almanach-Szenenlogik verstehen | 70% | Kernmodule wurden geprüft; Adapterentscheidung steht. |
| Orte-Szeneneditor auf Almanach-Niveau bringen | 45% | Großer Almanach-Editor ist angebunden; Design, Sidebar-Fluss und weitere Absicherung fehlen noch. |
| Szenen-Sidebar | 15% | Funktional vorhanden, Design und Bedienung unzureichend. |
| Umlaute und sichtbare Texte | 5% | Dokument erlaubt Umlaute, UI-Dateien sind noch nicht bereinigt. |
| Bannkreis-Dopplung | 0% | Noch nicht korrigiert. |
| Bildplatzhalter | 25% | Einige Platzhalter existieren, mehrere wichtige Flächen fehlen. |
| Direktbearbeitung stabilisieren | 20% | Grundfunktion existiert, aber Tabellen-/Feldzuordnung ist instabil. |
| Firebase-Status-Dot | 0% | Noch nicht umgesetzt. |
| Tabellenzeilen überall hinzufügen/entfernen | 10% | Bisher nur einfache Ergänzung am Tabellenende. |
| Persönlichkeiten hinzufügen/entfernen | 0% | Noch nicht umgesetzt. |

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
