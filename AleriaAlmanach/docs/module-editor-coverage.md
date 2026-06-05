# Modul-Editor-Coverage

Stand: 2026-06-03

Ziel: Jede Live-Darstellung eines Modultyps muss im Bearbeitungsmodus deckend und organisch bearbeitbar sein. Sichtbare Felder duerfen nicht nur ueber Rohdaten, JSON, Pipe-Listen oder versteckte Sonderwege erreichbar sein.

## Leitlinien

- Renderer-Felder und Editor-Felder werden pro Modultyp abgeglichen.
- Neue Bearbeitungslogik bleibt featurebezogen, z.B. `inline-editor-artifact-recipe.js`, nicht in Sammeldateien.
- Wiederholbare Inhalte werden als Zeilen/Karten mit `+ Eintrag` und Loeschbutton bearbeitet.
- Fliesstext nutzt den vorhandenen Richtext-Editor mit Toolbar und Live-Vorschau.
- Keine BBCode-Arbeitsweise als Nutzungsmodell.
- Rohformate wie `Name | Detail | Bild` werden schrittweise durch strukturierte Eingaben ersetzt.
- Nach jedem Modultyp: JS-Syntaxcheck, Inline-Handler-Scan, Browser-Smoke fuer Editor, Vorschau, Speichern und Reload.

## Coverage-Matrix

| Modultyp | Live-Felder | Inline-Editor-Status | Risiko | Naechster Schritt |
| --- | --- | --- | --- | --- |
| Standard | Meta, Bild, Bildbreite, Beschreibung, Stats, statische Kommentare | Stats strukturiert, sonst weitgehend deckend | niedrig | Kommentator-Fallback gegen Kommentarfolge pruefen |
| Szene | Meta, Bild, Beschreibung, Stats, Szenenbloecke | deckend fuer aktuelle Renderer-Felder | niedrig | Visuelle Feinkontrolle mit voller Szene |
| Session | Meta, Bild, Intro, Hinweis, Kommentare, Empty-Texte | deckend fuer aktuelle Renderer-Felder | niedrig | Spaeter visueller Test mit echten Kommentaren |
| Profile | Profilkarten, Felder, Hintergrund, Titel | deckend fuer aktuelle Renderer-Felder | niedrig | Visuelle Feinkontrolle mit mehreren Profilkarten |
| Wanted | Zielkarten, Hintergrund | deckend im grossen Modul-Editor | niedrig | Browser-Smoke pro Zielkarte |
| Artifact | Archivzeile, Infofelder, Bild, Stats, Beschreibung, Fund, Geschichte, Eigenschaften, Risiken, Zitat, Fusszeile | Stats und einfache Listen strukturiert, sonst deckend fuer aktuelle Renderer-Felder | niedrig | Browser-Smoke mit Eigenschaften/Risiken |
| Recipe | Kopf-/Metadaten, Zutaten, Ausruestung, Schritte, Warnungen, Eigenschaften, Varianten, Meister-Notiz, Zitat | Stats strukturiert, sonst deckend fuer aktuelle Renderer-Felder | niedrig | Spaeter visuelle Feinkontrolle |
| Biography | Biografie, Faehigkeiten, Werke, Trivia, Zitate, Verbindungen, Dokumente, Zitatbox, Fusszeile | einfache Listen strukturiert, eigener Inline-Editor | niedrig | Visuelle Feinkontrolle mit voller Biografie |
| Bestiary | Bildsteuerung, Taxonomie, Anatomie, Marker, Schwaechen, Zitat | deckend, eigener Inline-Editor | niedrig | Visuelle Feinkontrolle mit Bildmarkern |
| Questakte | Banner, Siegel, Auftraggeber, Sektoren, Ziele, Kontakte, Trivia, Belohnungen, Notiz | deckend, eigener Inline-Editor | niedrig | Visuelle Feinkontrolle mit voller Akte |
| Turnier | Teilnehmer, Scores, Herold, Highlights, Preise, Kandidaten, Ausfaelle | strukturierte Zeilen/Karten im grossen Modul-Editor und Inline-Editor | niedrig | Visuelle Feinkontrolle mit vollem Turnier |
| Turnierliga | Tabelle, Matchups, Sidebarlisten, Wetter, Chronik | strukturiert, eigener Inline-Editor | niedrig | Visuelle Feinkontrolle mit voller Liga |
| Kaste / Klasse | Kopf, Bilder, Intro, Informationen, Symbolik, Rollen, Faehigkeiten, Privilegien, Pflichten, Organisation, Vertreter, Links, Zitat, Footer | strukturiert, eigener grosser Editor und eigener Inline-Editor | niedrig | Visuelle Feinkontrolle mit echten Wappen/Bildern |
| Gerichtsakte | Aktenkopf, Falluebersicht, Zusammenfassung, Anklagepunkte, Daten, Beteiligte, Beweise, Zeugen, Chronologie, offene Fragen, Links, Aktennotiz | strukturiert, eigener Renderer, grosser Editor und Inline-Editor; Export/Import- und Layout-Smokes bestanden | niedrig | Visuelle Feinkontrolle mit echten Aktenbildern |

## Aktueller Arbeitsabschnitt

1. Allgemeine Bildbreite im grossen Modul-Editor bearbeitbar machen, ohne bestehende Speziallayouts zu ueberschreiben. Erledigt.
2. Wanted-Zielkarten im grossen Modul-Editor von JSON auf strukturierte Karten umstellen. Erledigt.
3. Turnier-Kandidaten und Ausfaelle im grossen Modul-Editor von Pipe-Textareas auf strukturierte Karten umstellen. Erledigt.
4. Stats bei Standard, Szene, Artifact und Recipe von Pipe-Textareas auf strukturierte Zeilen umstellen. Erledigt.
5. Turnier-Highlights und Preise von einfachen Textareas auf strukturierte Zeilen umstellen. Erledigt.
6. Bestehende Datenmodelle und Renderer beibehalten. Erledigt.

## Fortschritt

- 2026-05-28: Coverage-Dokument angelegt. Erste Analyse bestaetigt: `artifact` und `recipe` sind die groessten Inline-Editor-Luecken.
- 2026-05-28: `modules/inline-editor/inline-editor-artifact-recipe.js` angelegt. Artifact und Recipe haben jetzt eigene Inline-Editoren mit strukturierten Feldern und Listen-Karten statt Rohlisten.
- 2026-05-28: Browser-Smoke fuer Artifact/Recipe bestanden: Feldwerte erscheinen in der Live-Vorschau, lokales Speichern funktioniert, nach Reload erscheinen beide Testmodule im Archiv.
- 2026-06-03: Grosser Modul-Editor speichert `imageWidth` nur bei aktivierter eigener Bildbreite, Wanted nutzt strukturierte Zielkarten statt JSON, Turnier-Kandidaten/Ausfaelle nutzen strukturierte Karten statt Pipe-Textareas.
- 2026-06-03: Stats bei `standard`, `scene`, `artifact` und `recipe` nutzen strukturierte Zeilen. Turnier-Highlights und Preise nutzen strukturierte Zeilen.
- 2026-06-03: `artifact`-Eigenschaften/Risiken und `biography`-Werke/Trivia/Zitate nutzen im grossen Modul-Editor strukturierte Zeilen statt Sammeltextareas.
- 2026-06-03: Browser-Smoke fuer den grossen Modul-Editor bestanden: Standard-Bildbreite/Stats, Wanted-Karten, Turnier-Listen/Karten, Artefakt-Listen und Biografie-Listen. Dabei wurde ein Multipage-Sammelbug im Editor-Payload behoben.
- 2026-06-03: Browser-Smoke fuer Questakte, Bestiarium und Biografie-Verbindungen/Dokumente bestanden. Add-Buttons, strukturierte Zeilen/Karten, Bildregler und Payload-Uebernahme funktionieren im grossen Modul-Editor.
- 2026-06-03: Turnier-Inline-Editor nutzt fuer Highlights, Preise, Kandidaten und Ausfaelle strukturierte Zeilen/Karten statt Textareas. Browser-Smoke bestaetigt Add/Update und Draft-Uebernahme.
- 2026-06-03: Bestiarium- und Questakten-Inline-Editoren aus `inline-module-editor.js` in eigene Featuredateien extrahiert. Browser-Smoke bestaetigt Bestiarium-Listen/Range und Questakten-Kontakte/Skalarfelder.
- 2026-06-03: Turnierliga-Inline-Editor aus `inline-module-editor.js` in eine eigene Featuredatei extrahiert. Browser-Smoke bestaetigt Skalarfelder, Ranglistenzeilen und Geruechtezeilen.
- 2026-06-03: Biografie-Inline-Editor aus `inline-module-editor.js` in eine eigene Featuredatei extrahiert. Werke, Trivia und Zitate nutzen strukturierte Zeilen statt Sammeltextareas.
- 2026-06-03: Browser-Smoke fuer Biografie, Szene und Profile bestanden. Biografie-Zeilen/Dokumente, Szenenblock und Profilkarte/Felder werden im Inline-Draft uebernommen.
- 2026-06-03: Kaste/Klasse-Modul eingefuehrt. Datenmodell, Sanitizer, Renderer, grosser Editor, Inline-Editor und gemeinsames Feldschema sind angelegt; Chrome-Smoke bestaetigt Inline-Events, Live-Vorschau, Draft, JSON-Rueckweg und Rendering.
- 2026-06-03: Finaler Chrome-Layout-Smoke fuer Kaste/Klasse bestanden. Desktop und Mobile mit langen Texten, vielen Rollen, Vertretern und Links zeigen keinen horizontalen Overflow.
- 2026-06-03: Gerichtsakte-Modul geplant. `docs/court-module-plan.md` legt neutrale Fachabgrenzung, Datenmodell, Editor-/Inline-Editor-Struktur, Renderer/CSS-Aufteilung und Testplan fest.
- 2026-06-03: Gerichtsakte-Datenmodell eingefuehrt. `courtPage` und `page.court` werden normalisiert erhalten, Sanitizer und Defaultseite sind angelegt.
- 2026-06-03: Gerichtsakte-Renderer und eigenes CSS-Grundlayout eingefuehrt. Template ist registriert; der grosse Editor erhaelt Court-Daten ueber eine Basis-Bearbeitungsschicht.
- 2026-06-03: Gerichtsakte im grossen Modul-Editor vollstaendig strukturiert. Beweise, Zeugen, Beteiligte, Anklagepunkte, Daten, Chronologie, offene Fragen und Links nutzen Add/Remove-Zeilen statt Rohdaten.
- 2026-06-03: Browser-Smoke fuer Gerichtsakte im grossen Modul-Editor bestanden. Delegierte Add/Remove-Actions aktualisieren Court-Listen, gesammelte Daten bleiben in `page.court` und rendern in der Live-Ansicht.
- 2026-06-03: Gerichtsakte-Inline-Editor eingefuehrt. Browser-Smoke bestaetigt Scalar-Felder, Add/Remove fuer Listen, Draft-Uebernahme und Live-Vorschau.
- 2026-06-03: Finaler Gerichtsakte-Smoke bestanden. Export/Import erhaelt `courtPage` und alle Court-Listen; Desktop und Mobile rendern lange Akten ohne horizontalen Overflow.

## Naechste fachliche Luecken

1. Optional: visuelle Regression der Live-Vorschau pro Template mit Screenshots dokumentieren.
2. Optional: echte Beispielmodule mit langen Texten/Bildern auf Layoutkanten pruefen.

## Erledigte Coverage-Schnitte

- `artifact`: deckend fuer aktuelle Live-Darstellung.
- `recipe`: deckend fuer aktuelle Live-Darstellung.
- `session`: Intro, Eingabebalken-Hinweis, Leertitel und Leertext sind im Inline-Editor bearbeitbar und werden in Vorschau/Speicherstand uebernommen.
- `wanted`: Zielkarten sind im grossen Modul-Editor ohne JSON bearbeitbar.
- `tournament`: Highlights, Preise, Kandidaten und Ausfaelle sind im grossen Modul-Editor und Inline-Editor ohne Sammeltextareas/Pipe-Listen bearbeitbar.
- `bestiary`, `quest-file`: Inline-Editoren sind aus der Sammeldatei geloest und per Browser-Smoke gegen zentrale Felder getestet.
- `tournament-league`: Inline-Editor ist aus der Sammeldatei geloest und per Browser-Smoke gegen Tabelle und Sidebarlisten getestet.
- `biography`: Inline-Editor ist aus der Sammeldatei geloest. Werke, Trivia und Zitate sind ohne Sammeltextareas bearbeitbar.
- `scene`, `profiles`: Inline-Smoke fuer zentrale Workflows bestanden.
- `caste`: eigenes Template mit strukturierten Listen, Browser-Smoke fuer Inline-Interaktion und Desktop/Mobile-Layout-Smoke bestanden.
- `court`: eigenes Gerichtsakte-Template mit strukturierten Listen, grossem Editor, Inline-Editor, Export/Import-Smoke und Desktop/Mobile-Layout-Smoke bestanden.
- `standard`, `scene`, `artifact`, `recipe`: Stats sind im grossen Modul-Editor ohne Pipe-Listen bearbeitbar.
- `artifact`, `biography`: Einfache Textlisten sind im grossen Modul-Editor ohne Sammeltextareas bearbeitbar.
