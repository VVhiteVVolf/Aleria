# Aleria Almanach Refactoring-Status

Stand: 2026-05-28

## Arbeitsordner

Aktiver Arbeitsstand ist ausschliesslich `AleriaAlmanachNeu`.

`app.js` ist aus dem Monolithen herausgeloest und dient nur noch als Bootstrap:

- `DOMContentLoaded` ruft `initPage()` auf.
- `pageshow` ruft `clearTransientSearchInputsAfterBrowserRestore()` auf.
- Der fachliche Code liegt in `modules/`.

## Bereits modularisiert

- `modules/core/`
  - Grundkonstanten, State-Anker und Sicherheits-/Sanitizing-Helfer.
- `modules/archive/`
  - Archiv-Rendering, Suche, `renderAll()` und `initPage()`.
  - Archiv-Tabs, Modul-/Import-Buttons und Entry-Karten nutzen delegierte `data-archive-action`-Events statt direkter `onclick`-Zuweisungen.
- `modules/backup/`
  - Backup, Export, Import und Bereinigung.
  - Backup-Dateiimport nutzt Event Listener statt direkter FileReader-Event-Properties.
- `modules/module-store/`
  - Abschnittsdaten, Firebase-Sync und Store-Zugriffe.
- `modules/module-editor/`
  - Modul-Editor in fachliche Teilbereiche getrennt.
  - Statische Aktionen im Modul-Editor-Overlay laufen ueber `module-editor-events.js` und `data-module-editor-action`.
  - Der klassische Cast-Picker nutzt fuer Figurenauswahl, Rollenfeld, Suche und Chip-Aktionen delegierte `data-module-editor-action`-Events.
  - Seitenkarten, Szenenbloecke und Kommentarfolgen nutzen fuer Erstellen, Verschieben, Duplizieren, Entfernen, Typwechsel und Vorlagen delegierte `data-module-editor-action`-Events.
  - `updateModulePageType()` adressiert den Szenenblock-Container jetzt eindeutig innerhalb des Szenen-Seitentypblocks.
  - Bestiarium-Kenndaten, Anatomie, Marker, Schwaechen und Bildregler-Labels nutzen delegierte `data-module-editor-action`-Events.
  - Turnierbaum-Groesse und Turnierliga-Listen nutzen delegierte `data-module-editor-action`-Events.
  - Questakten-Kenndaten, Ziele, Kontakte, Trivia und Belohnungen nutzen delegierte `data-module-editor-action`-Events.
  - Rezeptlisten, Biografie-Verbindungen, Biografie-Dokumente und Profilkarten/-felder nutzen delegierte `data-module-editor-action`-Events.
- `modules/inline-editor/`
  - Inline-Editor ausgelagert.
  - State/Lifecycle liegt in `inline-editor-state.js`; Ziel-Reiter und Modulgroesse nutzen delegierte `data-inline-action`-Events.
  - Wiederverwendbare Panel-Builder liegen in `inline-editor-panels.js` und nutzen fuer Bild-, Statistik-, Kommentar-, Szenen- und Template-Felder delegierte `data-inline-action`-Events.
  - Die delegierte Event-Schicht fuer diese wiederverwendbaren Inline-Editor-Panels liegt in `inline-editor-events.js`.
  - Profilkarten-Bearbeitung liegt in `inline-editor-profiles.js` und nutzt fuer Karten-, Reiter- und Profilfelder delegierte `data-inline-action`-Events.
  - Kopfgeldtafel-Bearbeitung liegt in `inline-editor-wanted.js` und nutzt fuer Zielkarten und Hintergrund delegierte `data-inline-action`-Events.
  - Turnier-Bearbeitung liegt in `inline-editor-tournament.js` und enthaelt Turnierfelder, Teilnehmer und Scores.
  - Typbezogene Editor-Bausteine liegen noch gesammelt in `inline-module-editor.js`.
  - Wiederkehrende Meta- und Seitenfelder in `inline-module-editor.js` nutzen fuer Entry-Daten, Seitentitel, Kommentar-Checkboxen, Beschreibung und Session-Kurzfelder delegierte `data-inline-action`-Events.
  - Der Inline-Biography-Editor nutzt fuer Biografie-Felder, Faehigkeiten, Verbindungen und Dokumente delegierte `data-inline-action`-Events.
  - Der Inline-Bestiary-Editor nutzt fuer Bestiarium-Felder, Bildregler, Anatomie, Marker und Schwaechen delegierte `data-inline-action`-Events.
  - Der Inline-Tournament-League-Editor nutzt fuer League-Felder, Tabellenkopf und strukturierte Listenzeilen delegierte `data-inline-action`-Events.
  - Der Inline-Tournament-Editor nutzt fuer Turnierfelder, Teilnehmer und Scores delegierte `data-inline-action`-Events.
  - Der Inline-Questakte-Editor nutzt fuer Aktenfelder, Ziele, Kontakte, Trivia und Belohnungen delegierte `data-inline-action`-Events.
- `modules/rendering/`
  - Modul-/Seiten-Rendering ausgelagert, aber noch zu gross.
  - Modal-Seitennavigation und die obere Inline-Editor-Toolbar in `module-renderer.js` nutzen delegierte `data-modal-action`-Events.
- `modules/modal/`
  - Der statische Modal-Schliessen-Button nutzt `data-modal-action` statt Inline-Handler.
  - Inline-Modul-Splitter und Page-Curl-Ecken nutzen gebundene Event Listener statt direkter `.on...`-Zuweisungen.
- `modules/characters/`
  - Charakter-Reiter, Karten, Gruppenleisten, Archivaktionen und Import-Auswahl nutzen `data-...`-Actions oder Event Listener statt direkter `onclick/onchange/onkeydown`-Zuweisungen.
  - Bildpruefung fuer Portraits/Emotes nutzt Event Listener statt direkter Image-Event-Properties.
- `styles/`
  - Archiv-/Header-/Grid-CSS liegt in `styles/archive.css`.
  - Modal-Grundlayout liegt in `styles/modal.css`.
  - Kommentar-CSS liegt in `styles/comments.css`.
  - Kommentar-Charakter-/Emote-Auswahl liegt in `styles/comment-character-picker.css`.
  - Session-/Fokus-Layout liegt in `styles/session.css`; Mobile-Overrides liegen in `styles/session-mobile.css`.
  - Charakter-Archiv und Charakterprofil liegen in `styles/characters.css`.
  - Modul-Editor- und Inline-Modul-Editor-CSS liegt in `styles/module-editor.css`.
  - Spezialisierte Modul-Seitentypen liegen getrennt in `styles/module-page-bestiary.css`, `styles/module-page-quest.css`, `styles/module-page-biography.css`, `styles/module-page-boards.css`, `styles/module-page-profiles.css` und `styles/module-page-artifact-recipe.css`.
  - Bildzuschnitt-Dialog liegt in `styles/crop-dialog.css`.
  - Szenenblock-Darstellung liegt in `styles/scene-blocks.css`.
  - Hauptlayout/Sidebar/Feed-CSS liegt in `styles/layout-sidebar.css`.
  - Allgemeine Mobile-Politur liegt in `styles/mobile.css`.
- `modules/comments/`
  - Kommentare sind bereits featurebezogen verteilt, enthalten aber noch Altlasten aus Inline-Handlern.
  - Formular-State fuer neue Kommentare liegt in `comments-form-state.js`.
  - Formular-Dialogsteuerung fuer neue Kommentare liegt in `comments-form.js`.
  - Gemeinsame Segment-Bausteine liegen in `comments-segment-base.js`.
  - Segment-Editor fuer neue Kommentare liegt in `comments-segments.js`.
  - Live-Vorschau liegt in `comments-preview.js`.
  - Richtext-Sync liegt in `comments-richtext.js`.
  - Entwurfsspeicherung liegt in `comments-draft.js`.
  - Speichern/Submit liegt in `comments-submit.js`.
  - Bearbeitungs-Segmente liegen in `comments-edit-segments.js`.
  - Bearbeitungs-Vorschau liegt in `comments-edit-preview.js`.
  - Bearbeitungs-State liegt in `comments-edit-state.js`.
  - Bearbeitungs-Charakterauswahl liegt in `comments-edit-character-picker.js`.
  - Bearbeitungs-Speicherpfad liegt in `comments-edit-submit.js`.
  - Der sichtbare Edit-Kommentar-Dialog nutzt fuer Code, Modus, manuelle Auswahl, Portrait-URL, Segment-Buttons, Kommentar-Typ und Speichern delegierte `data-action`-Events.
  - Der sichtbare Neu-Kommentar-Dialog nutzt fuer Modus, Spielerfilter, manuelle Auswahl, Portrait-URL, Segment-Buttons, Kommentar-Typ, Abbrechen und Speichern delegierte `data-action`-Events.
  - Die dynamisch gerenderte Charakter-/Emote-Auswahl im Neu-Kommentar-Dialog nutzt `data-action` statt generierter `onclick`-Handler.
  - Kommentar-Events sind aus der frueheren Sammeldatei in `comments-segment-events.js`, `comments-input-events.js`, `comments-action-events.js`, `comments-reader-events.js` und `comments-overlay-events.js` getrennt.
  - Segment-Text und Segment-Entfernung fuer Neu- und Edit-Kommentare laufen ueber delegierte `data-action`-Events.
  - Die dynamische Segment-Formatleiste nutzt ebenfalls delegierte `data-action`-Events statt generierter `onclick`-Handler.
  - Attachment-Formular und Delete-Dialog nutzen fuer Vorschau, Schliessen und Submit delegierte Events statt Inline-Handler.
  - Kommentar-/Showcase-Formatleisten fuer Legacy-Textfelder nutzen `comments-markup.js` mit delegierten Format-Actions.
  - Kommentar-Sprung-/Scrollwerkzeuge liegen in `comments-jump.js`.
  - Redestab/Turn-State liegt in `comments-turn.js`.
  - Showcase-Rendering liegt in `comments-showcase-render.js`.
  - Attachment-Rendering liegt in `comments-attachment-render.js`.
  - Showcase-Profiloverlay liegt in `comments-showcase-profile.js`.
  - Showcase-Erstellung liegt in `comments-showcase-submit.js`.
  - Showcase-Bearbeitung/Speichern liegt in `comments-showcase-edit-submit.js`.
  - Der Kern-Kommentar-Renderer `comments-render.js` ist wieder auf normale Kommentarblasen und Kommentarart-Normalisierung fokussiert.
  - Thread-Reload ist an konkrete Kommentar-Thread-IDs gebunden.
  - Kommentar-Vorschau-Splitter nutzt Event Listener statt direkter `.on...`-Zuweisungen.
- `module-richtext.js`
  - Modul-Richtext- und Tooltip-Toolbar nutzen delegierte `data-richtext-action`-Events statt generierter Inline-Handler.

## Groesste verbleibende Dateien

Diese Dateien sind die naechsten Wartbarkeitsrisiken:

| Datei | Groesse ca. | Bewertung |
| --- | ---: | --- |
| `modules/inline-editor/inline-module-editor.js` | ca. 59 KB | Weiter zu gross; naechster sinnvoller Schnitt |
| `modules/rendering/module-renderer.js` | 58 KB | Danach in Renderer nach Seitentypen trennen |
| `modules/comments/comments-form.js` | ca. 4 KB | Klein genug; Dialog-Lifecycle beibehalten |
| `modules/comments/comments-form-state.js` | ca. 6 KB | Gemeinsamer Formular-State; bei Wachstum gezielt weiter teilen |
| `modules/comments/comments-edit.js` | ca. 6 KB | Dialog/Verifikation ist klein genug; nur noch bei konkretem Bedarf trennen |
| `modules/comments/comments-thread.js` | ca. 8 KB | Live-Kommentarlisten; nach Jump/Turn-Split deutlich kleiner |
| `modules/comments/comments-render.js` | ca. 6 KB | Kern-Renderer; Showcase/Attachment ausgelagert |
| `modules/comments/comments-showcase.js` | ca. 8 KB | Showcase-Formular/Preview/Edit-Form; Submit/Profile ausgelagert |
| `modules/module-editor/module-editor-templates.js` | 37 KB | Template-Bausteine nach Verantwortlichkeit trennen |
| `modules/module-editor/module-editor-tournament.js` | 30 KB | Kann spaeter in League/Grid/Rows geteilt werden |

## Empfohlene naechste Schnitte

1. `inline-module-editor.js` weiter trennen.
   - `inline-editor-state.js`: erledigt fuer Edit-State, Start/Cancel/Save, Dirty-Check, Ziel-Reiter und Modulgroesse.
   - `inline-editor-panels.js`: erledigt fuer wiederverwendbare Bild-, Statistik-, Kommentar-, Szenen- und Template-Panels.
   - `inline-editor-profiles.js`: erledigt fuer Profilkarten; Inline-Handler in diesem Teil entfernt.
   - `inline-editor-wanted.js`: erledigt fuer Kopfgeldtafeln; Inline-Handler in diesem Teil entfernt.
   - `inline-editor-tournament.js`: erledigt fuer Turnierfelder, Teilnehmer und Scores.
   - `inline-editor-types.js` oder typbezogene Dateien nur dort, wo echte Ownership entsteht.
   - Standard-Meta/Page-Felder in `inline-module-editor.js`: erledigt fuer Entry-Titel, Untertitel, Kategorie, Typ, Stempel, Seitentitel, Kommentar-Checkboxen, Beschreibung und Session-Kurzfelder.
   - Inline-Biography-Editor: erledigt fuer Hauptfelder, Faehigkeiten, Verbindungen und Dokumente.
   - Inline-Bestiary-Editor: erledigt fuer Hauptfelder, Bildregler, Anatomie, Marker und Schwaechen.
   - Inline-Tournament-League-Editor: erledigt fuer Hauptfelder, Tabellenkopf und strukturierte Listenzeilen.
   - Inline-Tournament-Editor: erledigt fuer Turnierfelder, Teilnehmer und Scores.
   - Inline-Questakte-Editor: erledigt fuer Aktenfelder, Ziele, Kontakte, Trivia und Belohnungen.
   - Kein generisches `utils.js`.

2. `module-renderer.js` danach nach Render-Verantwortung trennen.
   - Einstieg/Dispatcher bleibt klein.
   - Spezielle Seitentypen bekommen eigene Renderer.
   - Gemeinsame Sicherheitsfunktionen bleiben in `modules/core/content-safety.js`.

3. DokumentenWerkstatt separat bereinigen.
   - Dieser Bereich ist nicht Teil des aktuellen Almanach-Kerns.
   - `DokumentenWerkstatt.html` und `DokumentenWerkstatt/js/werkstatt.js` enthalten noch Inline-Handler.
   - Bereinigung erst nach kurzem Funktionstest der Werkstatt angehen, damit Editor/Export/Seitennavigation nicht nebenbei brechen.

4. Kommentar-System weiter stabilisieren.
   - `comments-form.js` weiter in reine Formular-Dialogsteuerung und kleine State-Helfer trennen.
   - `comments-segment-base.js` als gemeinsame Segmentbasis fuer Neu- und Edit-Kommentare beibehalten.
   - `comments-segments.js` fuer Neu-Kommentar-Segmente klein halten.
   - `comments-edit-segments.js` fuer Bearbeitungs-Segmente klein halten.
   - `comments-richtext.js` als gemeinsame Richtext-Basis fuer Compose/Edit/Markup beibehalten.
   - `comments-edit.js` als kleine Dialog-/Verifikationsdatei beibehalten.
   - `comments-edit-state.js` als gemeinsamen Edit-State fuer Vorschau, Auswahl, Segmente und Submit beibehalten.
   - `comments-edit-character-picker.js` als isolierte Bearbeitungs-Auswahl beibehalten.
   - `comments-edit-submit.js` als isolierten Speicherpfad beibehalten.
   - `comments-preview.js` als isolierte Live-Vorschau beibehalten.
   - `comments-draft.js` als isolierte Entwurfslogik beibehalten.
   - `comments-submit.js` als isolierten Speicherpfad beibehalten.
   - Thread-bezogene Reloads nur in den passenden `.comments-scroll` rendern.

## Bekannte Altlasten

- `AleriaAlmanach.html` enthaelt im statischen HTML keine Inline-Handler mehr.
- Im Almanach-Kern ausserhalb der DokumentenWerkstatt gibt es aktuell keine `onclick/oninput/onkeydown/onchange`-Inline-Attribute mehr.
- In den Kernmodulen ausserhalb der DokumentenWerkstatt gibt es aktuell keine direkten `.on... =` Event-Property-Zuweisungen mehr.
- Verbleibende Inline-Handler sitzen in der separaten DokumentenWerkstatt.
- `styles.css` ist auf Basisvariablen, Theme-Variablen und globale Grundregeln reduziert.
- Firebase-/Admin-Code ist clientseitig sichtbar; echte Sicherheit muss ueber Firebase Rules/Auth geloest werden.

## Pruefstandard nach jedem Schnitt

Mindestens:

```powershell
node --check .\AleriaAlmanachNeu\app.js
node --check .\AleriaAlmanachNeu\modules\core\app-core.js
node --check .\AleriaAlmanachNeu\modules\core\content-safety.js
node --check .\AleriaAlmanachNeu\modules\archive\archive-view.js
node --check .\AleriaAlmanachNeu\modules\inline-editor\inline-editor-events.js
node --check .\AleriaAlmanachNeu\modules\inline-editor\inline-editor-state.js
node --check .\AleriaAlmanachNeu\modules\inline-editor\inline-editor-panels.js
node --check .\AleriaAlmanachNeu\modules\inline-editor\inline-editor-profiles.js
node --check .\AleriaAlmanachNeu\modules\inline-editor\inline-editor-wanted.js
node --check .\AleriaAlmanachNeu\modules\inline-editor\inline-editor-tournament.js
node --check .\AleriaAlmanachNeu\modules\inline-editor\inline-module-editor.js
node --check .\AleriaAlmanachNeu\modules\rendering\module-renderer.js
node --check .\AleriaAlmanachNeu\module-richtext.js
```

Bei Datei-Splits die neuen Dateien in diese Liste aufnehmen.

Browser-Smoke:

- Seite lokal laden.
- `initPage`, `renderAll`, `buildPage`, `openModuleEditorForNew` muessen Funktionen sein.
- Das Archiv muss sichtbar rendern; `_appInitialized` ist intern gekapselt und nicht als `window`-Flag zu pruefen.
- Archivsuche muss ein Ergebnis filtern koennen.
- Inline-Editor fuer ein neues Modul muss oeffnen und abbrechen koennen.
- Kommentarformular muss aus einer Kommentar-/Session-Seite oeffnen und Editor, Live-Vorschau sowie Splitter anzeigen.

## Aktueller Fortschritt

App-Monolith-Aufloesung: ca. 99%.

CSS-Aufraeumaktion Almanach-Kern: ca. 100%.

`styles.css` ist nur noch die Basis-/Theme-Schicht. Feature- und Seitentyp-Styles liegen unter `styles/`; alle 19 Stylesheet-Links in `AleriaAlmanach.html` zeigen auf vorhandene Dateien.

Letzter Browser-Smoke:

- 19 lokale Stylesheets plus Google-Fonts geladen.
- Archiv mit 47 Karten gerendert.
- Kommentarformular aus Kommentarseite geoeffnet.
- Kommentar-Editor, Live-Vorschau und Vorschau-Splitter sichtbar.
- Keine Runtime-Exceptions.

Erweiterter lokaler Funktionsdurchlauf:

- Kommentar ueber lokalen Fallback gespeichert.
- Gespeicherter Kommentar im Thread gerendert.
- Kommentar mit Code `7777` bearbeitet und aktualisiert gerendert.
- Kommentar mit Code `7777` geloescht.
- Neues Modul ueber Inline-Editor gespeichert.
- Nach Reload blieb das Modul im lokalen Store erhalten und wurde im Archiv angezeigt.
- Keine Runtime-Exceptions.

Firebase-Live-Funktionsdurchlauf:

- Smoke-Kommentar in Firestore gespeichert.
- Gespeicherten Kommentar remote wieder geladen und verifiziert.
- Kommentar mit Code `7777` bearbeitet.
- Bearbeitete Fassung remote wieder geladen und verifiziert.
- Kommentar mit Code `7777` geloescht.
- Loeschung remote verifiziert.
- Keine Runtime-Exceptions.

Modul-Editor-Coverage:

- Eigenes Fortschrittsdokument liegt in `docs/module-editor-coverage.md`.
- `artifact` und `recipe` haben eigene Inline-Editoren in `modules/inline-editor/inline-editor-artifact-recipe.js`.
- Artifact-Felder sind im Inline-Editor deckend fuer die aktuelle Live-Darstellung: Archivzeile, Klassifikation, Herkunft, Zustand, Verwahrung, Stats, Beschreibung, Fund, Geschichte, Eigenschaften, Risiken, Zitat und Fusszeile.
- Recipe-Felder sind im Inline-Editor deckend fuer die aktuelle Live-Darstellung: Kopf-/Metadaten, Stats, Zutaten, Ausruestung, Schritte, Warnungen, Eigenschaften, Varianten, Meister-Notiz, Zitat und Fusszeile.
- Artifact/Recipe-Listen werden strukturiert als wiederholbare Editor-Zeilen bearbeitet statt ueber Rohlisten.
- Browser-Smoke fuer Artifact/Recipe bestanden: Live-Vorschau, lokales Speichern und Reload-Persistenz.
- Session-Editor deckt jetzt auch Leertitel und Leertext ab; Browser-Smoke fuer Session bestanden: Intro, Hinweis, Leertitel/Leertext, lokales Speichern und Reload-Persistenz.

Deployment-Check:

- `AleriaAlmanach.html` enthaelt 114 lokale `href`-/`src`-Referenzen; alle zeigen auf vorhandene Dateien.
- Keine alten Referenzen auf `Aleria-Neues Design2`, Aufraeumordner, `module-pages.css`, Root-`session-mobile.css` oder `node_modules`.
- `AleriaAlmanachNeu` enthaelt 120 Dateien mit ca. 1,54 MB.
- Ohne `docs/` sind es 119 Dateien mit ca. 1,52 MB.
- Almanach-Kern ohne `docs/` und ohne DokumentenWerkstatt liegt bei 115 Dateien mit ca. 1,42 MB.

Restarbeit liegt jetzt nicht mehr in `app.js`, sondern in gezielter Nachmodularisierung der grossen Feature-Dateien und im schrittweisen Entfernen alter Inline-Handler.

Dynamische Inline-Handler im Almanach-Kern ausserhalb der DokumentenWerkstatt: 0 Resttreffer.

Direkte `.on... =` Event-Property-Zuweisungen in den Kernmodulen ausserhalb der DokumentenWerkstatt: 0 Resttreffer.
