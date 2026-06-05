# Kaste / Klasse Modul - Plan

Stand: 2026-06-03

Ziel: Ein eigenes Modul-Template fuer Kasten, Klassen, Orden, Staende und vergleichbare soziale oder institutionelle Gruppen. Beispiele: Kriegerkasten, Geistliche, Moenche, Paladine, Ritterorden, Sklavenstaende, Gelehrtenkasten, Stadtwachen, Tempeltypen, Geheimorden.

Das Modul soll nicht als Profil-, Quest-, Bestiarium- oder Biografie-Sonderfall entstehen. Es bekommt eigene Ownership, eigenes Datenmodell, eigenen Renderer, eigenen grossen Modul-Editor und eigenen Inline-Editor.

## Umsetzungsstand

Aktueller Stand: 100%

- Erledigt: Datenmodell, Sanitizer und Defaultseite sind angelegt.
- Erledigt: `castePage` und `page.caste` werden beim Normalisieren erhalten.
- Erledigt: Renderer, eigene CSS-Datei und Template-Registry-Hook sind angelegt.
- Erledigt: Grosser Modul-Editor ist als eigene Datei mit strukturierten Eingabefeldern angebunden.
- Erledigt: Grosser Modul-Editor und Inline-Editor nutzen ein gemeinsames Kasten-Feldschema.
- Erledigt: Spezialisierter Inline-Editor ist als eigene Datei angebunden.
- Erledigt: Kasten-Editor-Zeilen haben responsive Styles fuer grossen Editor und Inline-Editor.
- Erledigt: Export/Import-Smoke fuer `page.caste` ist erfolgreich.
- Erledigt: echter Chrome-Smoke fuer Inline-Editor-Interaktion, Live-Vorschau, Draft, JSON-Rueckweg und Rendering ist erfolgreich.
- Erledigt: finaler Chrome-Layout-Smoke mit langen Beispieltexten, vielen Rollen, Vertretern, Links und Desktop/Mobile-Viewports ist erfolgreich.
- Offen: keine Pflichtpunkte. Optional bleiben nur kuenftige visuelle Anpassungen nach Geschmack mit echten Projektbildern.

## Leitentscheidung

Dieses Modul wird richtig eingefuehrt, nicht als schneller Patch.

Pflicht:

- eigener Template-Typ `caste`
- eigene Page-Flag `castePage`
- eigener Datenblock `page.caste`
- eigener Sanitizer und Default-Builder
- eigene Modul-Editor-Datei
- eigene Inline-Editor-Datei
- eigene Renderer-Funktion
- strukturierte Eingaben fuer alle wiederholbaren Inhalte
- keine JSON-Textareas
- keine Pipe-Listen als Bedienmodell
- kein Einbau in `app.js`, `comments`, `inline-module-editor.js` oder andere Sammelstellen

## Fachlicher Umfang

Das Template beschreibt eine organisierte Gruppe, nicht eine Einzelperson.

Die Live-Darstellung soll folgende Bereiche abdecken:

| Bereich | Zweck | Bearbeitungsform |
| --- | --- | --- |
| Kopf / Archiv | Kategorie, Dokumentnummer, Siegel, Hauptsymbol | Textfelder und Bild-URLs |
| Hauptbild | Vertreterbild, Szene oder Symbolbild | `page.image` plus vorhandene Bildsteuerung |
| Titelblock | Name, Untertitel, Kurzbeschreibung | `entry.title`, `entry.subtitle`, Richtext |
| Allgemeine Informationen | Typ, Hauptsitz, Einflussgebiet, Anerkennung, Mitglieder, Ausrichtung | strukturierte Infozeilen |
| Symbolik | Wappen, Zeichen, Buch, Stern, Feder, Banner usw. | strukturierte Symbolkarten mit Imgur-Icon |
| Aufgaben & Rollen | Kernfunktionen der Kaste | strukturierte Rollenkarten mit Icon |
| Faehigkeiten & Kenntnisse | Wissen, Kampftechniken, Handwerk, Rituale | strukturierte Textzeilen oder Skillkarten |
| Privilegien | Rechte, Zugriffe, Rangvorteile | strukturierte Textzeilen |
| Einschraenkungen / Pflichten | Verbote, Eide, Abgaben, Dienstpflichten | strukturierte Textzeilen |
| Organisation / Raenge | Rangfolge, Mitgliedergruppen, Niederlassungen | strukturierte Infozeilen |
| Bekannte Vertreter | wichtige Personen innerhalb der Kaste | strukturierte Karten mit Portrait/Wappen |
| Verbundene Eintraege | Links zu Akademien, Orden, Orten, Personen | strukturierte Linkzeilen |
| Beschreibung | langer Fliesstext | Richtext |
| Zitat / Leitsatz | ideologischer Satz oder Lehre | Textfelder |
| Footer | Archivzeile / Motto / Quellenhinweis | Textfeld |

## Datenmodell

Allgemeine Moduldaten bleiben in den bestehenden Feldern:

- `entry.title`
- `entry.subtitle`
- `entry.type`
- `entry.stamp`
- `page.image`
- `page.imageWidth`
- `page.description`
- `page.stats`, falls das allgemeine Bildpanel/Infotabelle sinnvoll genutzt wird

Das neue Modul bekommt zusaetzlich `page.caste`.

Vorgeschlagenes Modell:

```js
page.caste = {
  archiveLabel: '',
  documentCode: '',
  categoryLabel: '',
  headerSymbol: '',
  sealImage: '',
  bannerImage: '',
  backgroundImage: '',
  introTitle: '',
  introText: '',
  infoTitle: '',
  infoRows: [
    { icon: '', label: '', value: '' }
  ],
  symbolsTitle: '',
  symbols: [
    { image: '', title: '', subtitle: '', detail: '' }
  ],
  rolesTitle: '',
  roles: [
    { icon: '', title: '', text: '' }
  ],
  skillsTitle: '',
  skills: [
    { icon: '', title: '', text: '' }
  ],
  privilegesTitle: '',
  privileges: [
    { text: '' }
  ],
  restrictionsTitle: '',
  restrictions: [
    { text: '' }
  ],
  organizationTitle: '',
  organizationRows: [
    { label: '', value: '' }
  ],
  representativesTitle: '',
  representatives: [
    { portrait: '', crest: '', name: '', title: '', text: '' }
  ],
  relatedTitle: '',
  relatedEntries: [
    { icon: '', label: '', target: '' }
  ],
  quote: '',
  quoteBy: '',
  footer: ''
};
```

### Warum dieses Modell

- Es bildet die Mockups deckend ab.
- Jede sichtbare Wiederholung hat eine eigene strukturierte Liste.
- Icons/Wappen/Siegel sind explizit als Imgur-URL-Felder vorhanden.
- Der Renderer muss keine Rohstrings parsen.
- Der Editor kann jede Zeile/Karte einzeln addieren, entfernen und bearbeiten.
- Spaetere Varianten wie "Orden", "Sklavenstand" oder "Tempeltyp" passen ohne neue Sonderfelder.

## Sanitizer

Neue Funktionen in `modules/module-editor/module-editor-data.js`:

- `sanitizeCasteData(data = {})`
- `sanitizeCasteInfoRows(items = [])`
- `sanitizeCasteSymbols(items = [])`
- `sanitizeCasteCards(items = [])`
- `sanitizeCasteTextRows(items = [])`
- `sanitizeCasteOrganizationRows(items = [])`
- `sanitizeCasteRepresentatives(items = [])`
- `sanitizeCasteRelatedEntries(items = [])`

Regeln:

- Alle Strings trimmen.
- Bildfelder nur als String speichern, Sanitizing fuer Ausgabe bleibt im Renderer.
- Leere Zeilen herausfiltern, aber Defaultdaten beim Erstellen liefern.
- Listen begrenzen, damit Layout und Editor nicht entgleisen:
  - Infozeilen: maximal 12
  - Symbolkarten: maximal 8
  - Rollen: maximal 8
  - Skills: maximal 12
  - Privilegien/Einschraenkungen: maximal 12 je Liste
  - Organisation: maximal 12
  - Vertreter: maximal 10
  - Verknuepfungen: maximal 12

## Defaultseite

Neue Funktion in `module-editor-templates.js` oder nahe der anderen Defaults:

- `createDefaultCastePage(index = 0)`

Defaultwerte sollen sofort ein brauchbares Beispiel ergeben:

- Titel: `Neue Kaste`
- Subtitle: `Stand, Ordnung und gesellschaftliche Rolle`
- Typ: `Kaste / Klasse`
- PageTitle: `I. - Kaste / Klasse`
- Beispielrollen: `Wissenswahrung`, `Lehre`, `Beratung`
- Beispielinfo: `Typ`, `Hauptsitz`, `Anerkennung`, `Mitglieder`
- Beispiel-Symbolik mit leeren Bild-URLs
- Beispiel-Vertreter mit leeren Portraits

Wichtig: Defaults duerfen keine externen Bilder hart einbauen.

## Template-Registry

Neuer Eintrag in `MODULE_TEMPLATE_REGISTRY`:

```js
caste: {
  id: 'caste',
  pageType: 'caste',
  pageFlag: 'castePage',
  label: 'Kaste / Klasse - Template',
  pageLabel: 'Kaste / Klasse - Template',
  defaultTitle: 'Neue Kaste',
  defaultSubtitle: 'Stand, Ordnung und gesellschaftliche Rolle',
  entryType: 'Kaste / Klasse',
  typeMatchers: ['kaste', 'klasse', 'orden', 'stand', 'klerus', 'ritterorden'],
  createPages: () => [createDefaultCastePage(0)],
  createPage: index => createDefaultCastePage(index),
  buildEditorFields: page => buildCasteModuleEditorFields(page),
  collectEditorPage: (card, page) => collectCasteModuleEditorPage(card, page),
  renderPage: (page, entry, pageIndex, total) => buildCastePage(page, entry, pageIndex, total),
  renderInlinePage: (page, entry, pageIndex, total) => buildInlineComplexTemplatePage(page, entry, pageIndex, total, 'caste')
}
```

`genericTitles` in `createModuleTemplateDraft` ist um `Neue Kaste` und den frueher geplanten Platzhalter `Neue Kaste / Klasse` erweitert.

## Modul-Editor

Neue Datei:

- `modules/module-editor/module-editor-caste.js`

Verantwortung:

- grosse Editoransicht fuer `page.caste`
- Add/Remove fuer alle Listen und Karten
- Collect-Funktionen fuer Payload
- keine Inline-Editor-Logik
- keine Renderer-Logik

Geplante Builder:

- `buildCasteInfoRows(items, mode)`
- `buildCasteSymbolCards(items, mode)`
- `buildCasteRoleCards(items, mode)`
- `buildCasteSkillCards(items, mode)`
- `buildCasteTextRows(items, listName, mode)`
- `buildCasteOrganizationRows(items, mode)`
- `buildCasteRepresentativeCards(items, mode)`
- `buildCasteRelatedEntryRows(items, mode)`
- `buildCasteModuleEditorFields(page)`
- `collectCasteModuleEditorPage(card, page)`

Geplante Module-Editor-Actions:

- `add-caste-info-row`
- `remove-caste-info-row`
- `add-caste-symbol-card`
- `remove-caste-symbol-card`
- `add-caste-role-card`
- `remove-caste-role-card`
- `add-caste-skill-card`
- `remove-caste-skill-card`
- `add-caste-text-row`
- `remove-caste-text-row`
- `add-caste-organization-row`
- `remove-caste-organization-row`
- `add-caste-representative-card`
- `remove-caste-representative-card`
- `add-caste-related-row`
- `remove-caste-related-row`

Die Actions kommen in `modules/module-editor/module-editor-events.js`, aber nur als Delegation auf Funktionen in `module-editor-caste.js`.

## Inline-Editor

Neue Datei:

- `modules/inline-editor/inline-editor-caste.js`

Verantwortung:

- Inline-Bearbeitung fuer `page.caste`
- gleiche Feldabdeckung wie grosser Modul-Editor
- Add/Remove/Update fuer alle strukturierten Listen
- Live-Vorschau aktualisieren

Geplante Funktionen:

- `getInlineCasteDataForEdit(page)`
- `updateInlineCasteField(input)`
- `addInlineCasteInfoRow()`
- `removeInlineCasteInfoRow(index)`
- `updateInlineCasteInfoField(input)`
- `addInlineCasteSymbolCard()`
- `removeInlineCasteSymbolCard(index)`
- `updateInlineCasteSymbolField(input)`
- `addInlineCasteRoleCard()`
- `removeInlineCasteRoleCard(index)`
- `updateInlineCasteRoleField(input)`
- `addInlineCasteSkillCard()`
- `removeInlineCasteSkillCard(index)`
- `updateInlineCasteSkillField(input)`
- `addInlineCasteTextRow(listName)`
- `removeInlineCasteTextRow(listName, index)`
- `updateInlineCasteTextField(input)`
- `addInlineCasteOrganizationRow()`
- `removeInlineCasteOrganizationRow(index)`
- `updateInlineCasteOrganizationField(input)`
- `addInlineCasteRepresentativeCard()`
- `removeInlineCasteRepresentativeCard(index)`
- `updateInlineCasteRepresentativeField(input)`
- `addInlineCasteRelatedRow()`
- `removeInlineCasteRelatedRow(index)`
- `updateInlineCasteRelatedField(input)`
- `buildInlineCasteEditor(page)`

Neue Inline-Actions in `inline-editor-events.js`:

- `add-caste-info-row`
- `remove-caste-info-row`
- `update-caste-info-field`
- `add-caste-symbol-card`
- `remove-caste-symbol-card`
- `update-caste-symbol-field`
- `add-caste-role-card`
- `remove-caste-role-card`
- `update-caste-role-field`
- `add-caste-skill-card`
- `remove-caste-skill-card`
- `update-caste-skill-field`
- `add-caste-text-row`
- `remove-caste-text-row`
- `update-caste-text-field`
- `add-caste-organization-row`
- `remove-caste-organization-row`
- `update-caste-organization-field`
- `add-caste-representative-card`
- `remove-caste-representative-card`
- `update-caste-representative-field`
- `add-caste-related-row`
- `remove-caste-related-row`
- `update-caste-related-field`

## Renderer

Neue Funktion in `modules/rendering/module-renderer.js`:

- `buildCastePage(page, entry, pageIndex, total)`

Hilfsfunktionen:

- `buildCastePanel(title, body, className)`
- `buildCasteInfoRows(rows)`
- `buildCasteSymbolCards(cards)`
- `buildCasteRoleCards(cards)`
- `buildCasteSkillCards(cards)`
- `buildCasteTextList(items)`
- `buildCasteOrganizationRows(rows)`
- `buildCasteRepresentatives(cards)`
- `buildCasteRelatedEntries(rows)`

Layout:

- Archivkopf oben mit Kategorie, Dokumentcode, optionalem Siegel.
- Links: Hauptbild, Info, Symbolik, Verknuepfungen.
- Mitte/Rechts: Titel, Untertitel, Intro, Rollen, Skills, Privilegien, Einschraenkungen, Organisation, Vertreter.
- Unten: Beschreibung, Zitat/Footer.

Renderer-Regeln:

- Keine Editor-Markup-Abhaengigkeit.
- Keine Rohdaten direkt ausgeben.
- Alle Texte ueber `escapeHtml` oder `sanitizeContentHtml`.
- Alle Bilder ueber `sanitizeImageSrc`.
- Backgrounds ueber `sanitizeStyleUrl`.
- Leere Panels nicht anzeigen, ausser sie sind fuer das Layout essenziell.

## CSS

Bevorzugt neue Datei:

- `styles/caste-module.css`

Falls die Projektstruktur fuer Modultemplates weiterhin zentral ueber bestehende CSS laeuft, dann klar abgegrenzter Abschnitt mit `.caste-*`.

CSS-Klassen:

- `.caste-page`
- `.caste-archive-head`
- `.caste-layout`
- `.caste-left`
- `.caste-main`
- `.caste-portrait`
- `.caste-title-row`
- `.caste-symbol`
- `.caste-panel`
- `.caste-info-row`
- `.caste-symbol-grid`
- `.caste-symbol-card`
- `.caste-role-grid`
- `.caste-role-card`
- `.caste-skill-list`
- `.caste-representative-list`
- `.caste-representative-card`
- `.caste-related-list`
- `.caste-quote`
- `.caste-footer`

Responsive Regeln:

- Desktop: 2 bis 3 Spalten.
- Tablet: Hauptbild und Hauptinhalt untereinander, Karten in 2 Spalten.
- Mobile: alle Panels untereinander, Icons maximal 48px, Vertreterkarten kompakt.
- Kein Text darf Buttons, Icons oder Panels ueberlaufen.
- Keine globalen Farb- oder Typografie-Ueberschreibungen.

## HTML-Einbindung

Neue Scripts in `AleriaAlmanach.html`:

- `modules/module-editor/module-editor-caste.js`
- `modules/inline-editor/inline-editor-caste.js`

Neue CSS-Datei, falls separat:

- `styles/caste-module.css`

Reihenfolge:

1. Daten und Template-Helfer bleiben vor Editor/Renderer-Nutzung.
2. `module-editor-caste.js` vor `module-editor-events.js`.
3. `inline-editor-caste.js` vor `inline-editor-events.js`.
4. CSS vor Seitenrendering.

Cache-Buster muessen aktualisiert werden.

## Implementierungsplan mit Prozentanzeige

| Fortschritt | Schritt | Ergebnis |
| --- | --- | --- |
| 0% | Plan freigeben | Dieses Dokument ist abgestimmt. |
| 5% | Datenmodell finalisieren | Feldliste und Listenformen sind fix. |
| 10% | Sanitizer schreiben | `sanitizeCasteData` und Unter-Sanitizer existieren. |
| 15% | Defaultseite schreiben | `createDefaultCastePage` liefert brauchbare Testdaten. |
| 20% | Template registrieren | `caste` erscheint in der Vorlagenauswahl. |
| 30% | Grossen Modul-Editor bauen | Alle Felder sind im Modul-Editor strukturiert bearbeitbar. |
| 40% | Modul-Editor Actions verdrahten | Add/Remove fuer alle Karten/Listen funktioniert. |
| 50% | Renderer bauen | Live-Vorschau zeigt das neue Template vollstaendig. |
| 60% | CSS bauen | Layout ist auf Desktop stabil und nahe an den Mockups. |
| 70% | Inline-Editor bauen | Inline-Bearbeitung deckt alle Renderer-Felder ab. |
| 78% | Inline-Events verdrahten | Add/Remove/Update im Inline-Editor funktioniert. |
| 84% | HTML/CSS Einbindung | Neue Dateien laden in korrekter Reihenfolge. |
| 90% | Syntax- und Suchchecks | `node --check`, kein Mojibake, keine Rohlisten-Bedienung. |
| 94% | Browser-Smoke grosser Editor | Erstellen, Bearbeiten, Speichern, Reload funktioniert. |
| 97% | Browser-Smoke Inline-Editor | Inline Add/Update/Remove und Live-Vorschau funktionieren. |
| 100% | Dokumentation aktualisieren | `module-editor-coverage.md` enthaelt den neuen Modultyp. |

## Testplan

Pflichtchecks:

- `node --check` fuer neue/geaenderte JS-Dateien.
- Suche nach Mojibake in allen beruehrten Dateien.
- Suche nach unerwuenschten Rohbedienungen:
  - JSON-Textarea
  - Pipe-Hinweise
  - Sammeltextarea fuer Listen
- Browser-Smoke fuer grossen Modul-Editor:
  - Template `caste` erstellen.
  - Hauptfelder bearbeiten.
  - Infozeile hinzufuegen und bearbeiten.
  - Symbolkarte hinzufuegen und bearbeiten.
  - Rollenkarte hinzufuegen und bearbeiten.
  - Skill hinzufuegen und bearbeiten.
  - Privileg/Einschraenkung hinzufuegen.
  - Vertreter hinzufuegen und bearbeiten.
  - Verbundenen Eintrag hinzufuegen.
  - Speichern.
  - Reload.
  - Modul wiederfinden.
- Browser-Smoke fuer Inline-Editor:
  - bestehendes Kastenmodul oeffnen.
  - Inline-Editor starten.
  - dieselben Kernlisten bearbeiten.
  - Live-Vorschau pruefen.
  - Speichern.
- Screenshot-Smoke:
  - Desktop 1440px.
  - Mobile/schmaler Viewport.

## Akzeptanzkriterien

Das Modul gilt erst als fertig, wenn:

- es in der Vorlagenauswahl erscheint;
- ein neues Kastenmodul ohne Konsolenfehler erstellt werden kann;
- alle sichtbaren Live-Felder im grossen Modul-Editor bearbeitbar sind;
- alle sichtbaren Live-Felder im Inline-Editor bearbeitbar sind;
- wiederholbare Inhalte nicht ueber JSON, Pipe-Listen oder Sammeltextareas gepflegt werden;
- Imgur-URLs fuer Icons, Wappen, Symbole, Vertreter und Banner an den vorgesehenen Stellen funktionieren;
- Speichern und Reload die Daten erhalten;
- der Renderer auch mit leeren Bildfeldern nicht bricht;
- lange Namen und mehrere Karten nicht offensichtlich ueberlaufen;
- `module-editor-coverage.md` den neuen Modultyp dokumentiert.

## Risiken

1. Zu viele Panels koennen das Layout ueberladen.
   - Gegenmassnahme: Leere Panels ausblenden, Defaultinhalte massvoll halten.

2. Zu viele Bildfelder koennen den Editor unuebersichtlich machen.
   - Gegenmassnahme: Bildfelder klar gruppieren: Kopf, Symbolik, Vertreter, Hintergrund.

3. Inline-Editor kann gross werden.
   - Gegenmassnahme: Featuredatei `inline-editor-caste.js`, klare Builder pro Listenart.

4. CSS kann andere Templates beeinflussen.
   - Gegenmassnahme: nur `.caste-*` Selektoren, keine globalen Overrides.

5. Datenmodell kann spaeter zu eng sein.
   - Gegenmassnahme: generische Kartenformen fuer Rollen, Skills, Vertreter und Verknuepfungen.

## Nicht-Ziele

- Keine politische/soziale Simulation.
- Keine automatische Hierarchie-Berechnung.
- Keine eigene Detail-Unterseite fuer einzelne Vertreter.
- Keine neue globale Iconverwaltung.
- Keine Migration alter Module in dieses Template.
- Keine Abhaengigkeit von festen Beispielbildern.

## Offene Designentscheidungen

1. Soll `page.stats` fuer allgemeine Informationen wiederverwendet werden, oder bleiben alle Infozeilen in `caste.infoRows`?
   - Empfehlung: `caste.infoRows`, weil Icons pro Infozeile gebraucht werden.

2. Soll `page.description` der Hauptbeschreibung entsprechen oder `caste.introText`?
   - Empfehlung: `page.description` als langer Beschreibungstext unten, `caste.introText` als kurzer Introtext oben.

3. Soll `entry.symbol` verwendet werden?
   - Empfehlung: `entry.symbol` weiterhin allgemein lassen, `caste.headerSymbol` fuer das Template nutzen.

4. Soll es ein optionales `backgroundImage` geben?
   - Empfehlung: Ja, aber nur dezent als CSS-Hintergrund und nie als Pflichtfeld.

5. Sollen verbundene Eintraege echte interne Links sein?
   - Empfehlung: Vorerst freies `target`-Feld. Spaeter kann daraus ein Picker werden.

## Vorgeschlagene Dateiaenderungen

Neu:

- `modules/module-editor/module-editor-caste.js`
- `modules/inline-editor/inline-editor-caste.js`
- `styles/caste-module.css`

Erweitern:

- `modules/module-editor/module-editor-data.js`
- `modules/module-editor/module-editor-templates.js`
- `modules/module-editor/module-editor-events.js`
- `modules/rendering/module-renderer.js`
- `modules/inline-editor/inline-module-editor.js`
- `modules/inline-editor/inline-editor-events.js`
- `AleriaAlmanach.html`
- `docs/module-editor-coverage.md`

Nicht anfassen ohne zwingenden Grund:

- `app.js`
- `comments`
- Firebase-Sync-Logik
- bestehende Template-Renderer ausser fuer gemeinsame Hilfsnutzung

## Umsetzungsempfehlung

Die Umsetzung sollte in drei Commits oder Arbeitsbloecken erfolgen:

1. Datenmodell, Template-Registry, Defaultseite.
2. Renderer, CSS, grosser Modul-Editor.
3. Inline-Editor, Smokes, Dokumentation.

So bleibt jeder Schritt pruefbar und ein Fehler laesst sich auf einen klaren Bereich eingrenzen.
