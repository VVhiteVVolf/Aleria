# Gerichtsakte Modul - Plan

Stand: 2026-06-03

Ziel: Ein eigenes Modul-Template fuer Gerichtsakten, Ermittlungsakten, Anklagevorbereitungen und vergleichbare juristische Vorbereitungsdokumente. Das Modul soll einen Fall strukturiert vorbereiten, ohne das Verfahren abzuschliessen, Schuld festzustellen oder ein Urteil vorwegzunehmen.

Das Modul ist keine Prozesssimulation und kein Entscheidungswerkzeug. Es ist eine Akte zur Uebersicht: Beteiligte, Vorwurf, Tatbestand, Beweisstuecke, Zeugenaussagen, Chronologie, offene Fragen und verknuepfte Eintraege.

## Umsetzungsstand

Aktueller Stand: 100%

- Erledigt: Fachlicher Umfang und Architekturplan sind angelegt.
- Erledigt: Datenmodell, Sanitizer und Defaultseite sind angelegt.
- Erledigt: `courtPage` und `page.court` werden beim Normalisieren erhalten.
- Erledigt: Renderer und eigene CSS-Datei sind als Grundlayout angelegt.
- Erledigt: grosser Modul-Editor besitzt vollstaendig strukturierte Listenfelder fuer alle Court-Bereiche.
- Erledigt: Modul-Editor-Events fuer Court-Listen sind angebunden und per Browser-Smoke geprueft.
- Erledigt: Inline-Editor mit Live-Vorschau ist angebunden und per Browser-Smoke geprueft.
- Erledigt: finale Integration, Export/Import-Smoke und Desktop/Mobile-Layout-Smoke sind bestanden.
- Offen: keine Pflichtpunkte. Optional bleiben nur kuenftige visuelle Anpassungen mit echten Aktenbildern, Siegeln oder Wappen.

## Leitentscheidung

Dieses Modul wird als eigene Feature-Erweiterung eingefuehrt, nicht als Variante von Kaste, Questakte, Profil oder Standardseite.

Pflicht:

- eigener Template-Typ `court`
- eigene Page-Flag `courtPage`
- eigener Datenblock `page.court`
- eigener Sanitizer und Default-Builder
- eigenes Feldschema fuer wiederholbare Aktenbereiche
- eigene Modul-Editor-Datei
- eigene Inline-Editor-Datei
- eigene Renderer-Funktionen
- eigene CSS-Datei
- strukturierte Eingaben fuer Personen, Beweise, Zeugen, Chronologie und Links
- keine JSON-Textareas
- keine Pipe-Listen als Bedienmodell
- keine Inline-Handler
- keine fachliche Kopplung an Kommentare, Charakterverwaltung oder Kastenmodul

## Fachliche Abgrenzung

Das Modul beschreibt vorbereitende Informationen.

Erlaubt:

- "Der Angeklagte wird beschuldigt ..."
- "Die Anklage fuehrt an ..."
- "Zeuge X gab an ..."
- "Beweisstueck wurde am Ort Y gefunden ..."
- "Die Aussage ist noch nicht protokolliert ..."
- "Offene Frage: Herkunft des Siegels pruefen ..."

Nicht erlaubt als eingebautes Konzept:

- Schuld / Unschuld
- Urteil
- Strafmass
- Endgueltige Beweiswertung
- automatisch berechnete Zuverlaessigkeit
- Gewinner / Verlierer des Verfahrens
- Prozessausgang

Wichtig: Begriffe wie "Zuverlaessigkeit", "Wahrheit", "Schuldgrad" oder Sternebewertungen koennen schnell wie eine Bewertung wirken. Falls eine Einordnung noetig ist, wird sie neutral als Status gespeichert, z.B. `protokolliert`, `ausstehend`, `widerspruechlich`, `unter Schutz`, `nicht erschienen`, `versiegelt`.

## Live-Bereiche

| Bereich | Zweck | Bearbeitungsform |
| --- | --- | --- |
| Aktenkopf | Aktennummer, Gericht, Ort, Status, Symbol/Siegel | Textfelder und Bild-URLs |
| Falluebersicht | Anlage, Tatbestand, Beteiligte, Zeitraum | strukturierte Infozeilen |
| Zusammenfassung | neutrale Beschreibung des Falls | Richtext |
| Anklagepunkte | einzelne behauptete Punkte | strukturierte nummerierte Karten |
| Wichtige Daten | Verhaftung, Fund, Ladung, Verhandlungstage | strukturierte Datums-/Ereigniszeilen |
| Beteiligte | Anklaeger, Angeklagte, Verteidigung, Richter, Ermittler | strukturierte Personenkarten |
| Beweisstuecke | Dokumente, Objekte, Orte, Funde | strukturierte Karten mit Icon/Bild und Link |
| Zeugen | Zeugen, Sachverstaendige, geschuetzte Personen | strukturierte Karten mit Portrait und Aussage |
| Chronologie | vorbereitende Ereignisse in Reihenfolge | strukturierte Ereigniszeilen |
| Offene Fragen | noch zu klaerende Punkte | strukturierte Textzeilen |
| Verknuepfte Eintraege | Personen, Orte, Dinge, Module, externe Links | strukturierte Linkkarten |
| Aktennotiz | neutrale interne Notiz / Quellenhinweis | Richtext oder kurzer Text |

## Datenmodell

Allgemeine Moduldaten bleiben in den bestehenden Feldern:

- `entry.title`
- `entry.subtitle`
- `entry.type`
- `entry.stamp`
- `page.image`
- `page.imageWidth`
- `page.description`

Das neue Modul bekommt zusaetzlich `page.court`.

Vorgeschlagenes Modell:

```js
page.court = {
  archiveLabel: '',
  caseNumber: '',
  courtName: '',
  courtPlace: '',
  status: '',
  statusTone: '',
  headerIcon: '',
  sealImage: '',
  bannerImage: '',
  backgroundImage: '',
  overviewTitle: '',
  overviewRows: [
    { icon: '', label: '', value: '', target: '' }
  ],
  summaryTitle: '',
  summaryText: '',
  chargesTitle: '',
  charges: [
    { number: '', title: '', text: '', target: '' }
  ],
  datesTitle: '',
  dates: [
    { icon: '', label: '', value: '', note: '', target: '' }
  ],
  partiesTitle: '',
  parties: [
    {
      role: '',
      name: '',
      title: '',
      text: '',
      portrait: '',
      crest: '',
      target: ''
    }
  ],
  evidenceTitle: '',
  evidence: [
    {
      icon: '',
      title: '',
      text: '',
      date: '',
      location: '',
      custodian: '',
      status: '',
      target: ''
    }
  ],
  witnessesTitle: '',
  witnesses: [
    {
      portrait: '',
      name: '',
      role: '',
      statement: '',
      status: '',
      protection: '',
      target: ''
    }
  ],
  chronologyTitle: '',
  chronology: [
    { date: '', title: '', text: '', target: '' }
  ],
  openQuestionsTitle: '',
  openQuestions: [
    { icon: '', text: '', status: '', target: '' }
  ],
  relatedTitle: '',
  relatedEntries: [
    { icon: '', label: '', detail: '', target: '' }
  ],
  noteTitle: '',
  noteText: '',
  footer: ''
};
```

### Referenzmodell

Viele Zeilen enthalten `target`. Das bleibt bewusst einfach:

```js
{ label: '', detail: '', image: '', target: '' }
```

Regel:

- `target` kann eine URL, ein Hash-Ziel oder ein interner Modulanker sein.
- Der Renderer rendert nur einen Link, wenn `target` gesetzt ist.
- Der sichtbare Text bleibt auch ohne Link vollstaendig lesbar.
- Bilder und Namen koennen klickbar sein, aber die Akte darf nicht von Links abhaengen.

## Neutrale Statuswerte

Statuswerte sind freie Textfelder, aber Defaults sollen neutral bleiben.

Empfohlene Beispiele:

- `in Vorbereitung`
- `offen`
- `protokolliert`
- `ausstehend`
- `versiegelt`
- `unter Schutz`
- `nicht erschienen`
- `widerspruechlich`
- `nachzureichen`

Nicht als Default verwenden:

- `glaubwuerdig`
- `unglaubwuerdig`
- `schuldig`
- `unschuldig`
- `bewiesen`
- `widerlegt`

## Sanitizer

Neue Funktionen in `modules/module-editor/module-editor-data.js`:

- `sanitizeCourtData(data = {})`
- `sanitizeCourtOverviewRows(items = [])`
- `sanitizeCourtCharges(items = [])`
- `sanitizeCourtDates(items = [])`
- `sanitizeCourtParties(items = [])`
- `sanitizeCourtEvidence(items = [])`
- `sanitizeCourtWitnesses(items = [])`
- `sanitizeCourtChronology(items = [])`
- `sanitizeCourtOpenQuestions(items = [])`
- `sanitizeCourtRelatedEntries(items = [])`

Regeln:

- Alle Strings trimmen.
- Bild- und Linkfelder als String speichern, Ausgabe-Sanitizing bleibt im Renderer.
- Leere Zeilen herausfiltern, aber Defaultdaten beim Erstellen liefern.
- Keine Bewertung aus Text ableiten.
- Reihenfolge der Listen beibehalten.
- Listen begrenzen:
  - Uebersicht: maximal 12
  - Anklagepunkte: maximal 12
  - Wichtige Daten: maximal 12
  - Beteiligte: maximal 12
  - Beweisstuecke: maximal 20
  - Zeugen: maximal 20
  - Chronologie: maximal 24
  - Offene Fragen: maximal 16
  - Verknuepfungen: maximal 16

## Defaultseite

Neue Funktion in `module-editor-templates.js`:

- `createDefaultCourtPage(index = 0)`

Defaultwerte sollen sofort eine bearbeitbare Akte ergeben:

- Titel: `Neue Gerichtsakte`
- Subtitle: `Vorbereitung des Verfahrens`
- Typ: `Gerichtsakte`
- PageTitle: `I. - Gerichtsakte`
- Aktennummer: leer oder `OG-0000`
- Gericht: `Offenes Gericht`
- Status: `in Vorbereitung`
- Beispiel-Uebersicht: `Tatbestand`, `Angeklagte`, `Anklaeger`, `Gericht`
- Beispiel-Anklagepunkt mit neutralem Text
- Beispiel-Beweis mit leeren Icon-/Linkfeldern
- Beispiel-Zeuge mit leerem Portrait
- Beispiel-Offene Frage

Wichtig: Defaults duerfen keine externen Bilder hart einbauen.

## Template-Registry

Neuer Eintrag in `MODULE_TEMPLATE_REGISTRY`:

```js
court: {
  id: 'court',
  pageType: 'court',
  pageFlag: 'courtPage',
  label: 'Gerichtsakte - Template',
  pageLabel: 'Gerichtsakte - Template',
  defaultTitle: 'Neue Gerichtsakte',
  defaultSubtitle: 'Vorbereitung des Verfahrens',
  entryType: 'Gerichtsakte',
  typeMatchers: ['gerichtsakte', 'gericht', 'anklage', 'prozess', 'ermittlungsakte'],
  createPages: () => [createDefaultCourtPage(0)],
  createPage: index => createDefaultCourtPage(index),
  buildEditorFields: page => buildCourtModuleEditorFields(page),
  collectEditorPage: (card, page) => collectCourtModuleEditorPage(card, page),
  renderPage: (page, entry, pageIndex, total) => buildCourtPage(page, entry, pageIndex, total),
  renderInlinePage: (page, entry, pageIndex, total) => buildInlineComplexTemplatePage(page, entry, pageIndex, total, 'court')
}
```

`core/app-core.js` muss `courtPage` in der Page-Flag-Liste kennen und `page.court` beim Normalisieren erhalten.

## Modul-Editor

Neue Datei:

- `modules/module-editor/module-editor-court.js`

Aufgaben:

- `buildCourtModuleEditorFields(page)`
- `collectCourtModuleEditorPage(card, page)`
- `buildCourtEditorRows(items, listName)`
- `addModuleCourtRow(button, listName)`
- `removeModuleCourtRow(button)`

Alle sichtbaren Live-Bereiche muessen editierbar sein. Keine Sektion darf nur ueber JSON oder Rohdaten erreichbar sein.

Editor-Feldgruppen:

1. Aktenkopf:
   - Archivzeile
   - Aktennummer
   - Gericht
   - Ort
   - Status
   - Symbol-/Siegel-/Banner-/Hintergrund-URL

2. Falluebersicht:
   - Abschnittstitel
   - strukturierte Infozeilen: Icon, Label, Wert, Link

3. Zusammenfassung:
   - Abschnittstitel
   - Richtext

4. Anklagepunkte:
   - Nummer
   - Titel
   - Beschreibung
   - optionaler Link

5. Wichtige Daten:
   - Icon
   - Label
   - Wert
   - Notiz
   - Link

6. Beteiligte:
   - Rolle
   - Name
   - Titel
   - Beschreibung
   - Portrait
   - Wappen
   - Link

7. Beweisstuecke:
   - Icon/Bild
   - Titel
   - Beschreibung
   - Datum
   - Fundort
   - Verwahrer
   - Status
   - Link

8. Zeugen:
   - Portrait
   - Name
   - Rolle
   - Aussage-Zusammenfassung
   - Status
   - Schutz-/Ladungsvermerk
   - Link

9. Chronologie:
   - Datum
   - Titel
   - Beschreibung
   - Link

10. Offene Fragen:
   - Icon
   - Frage/Text
   - Status
   - Link

11. Verknuepfte Eintraege:
   - Icon
   - Label
   - Detail
   - Link

12. Aktennotiz und Footer:
   - Titel
   - Richtext
   - Footer

## Gemeinsames Feldschema

Neue Datei:

- `modules/court/court-editor-schema.js`

Zweck:

- Listen-Definitionen fuer grossen Editor und Inline-Editor gemeinsam bereitstellen.
- Feldnamen, Labels, Fallbacks und Reihenfolge an einer Stelle halten.
- Keine doppelte Row-Logik mit auseinanderlaufenden Feldnamen.

Geplante Struktur:

```js
const COURT_EDITOR_LIST_DEFINITIONS = {
  overviewRows: {
    titleField: 'overviewTitle',
    label: 'Falluebersicht',
    addLabel: 'Zeile',
    fallback: { icon: '', label: 'Tatbestand', value: 'Noch nicht ausgefuellt.', target: '' },
    fields: [
      ['icon', 'Icon-URL', 'url'],
      ['label', 'Label', 'text'],
      ['value', 'Wert', 'textarea'],
      ['target', 'Link / Ziel', 'url']
    ]
  }
};
```

## Inline-Editor

Neue Datei:

- `modules/inline-editor/inline-editor-court.js`

Aufgaben:

- `buildInlineCourtEditor(page)`
- `updateInlineCourtField(input)`
- `updateInlineCourtListField(input)`
- `addInlineCourtListRow(listName)`
- `removeInlineCourtListRow(listName, index)`

Regeln:

- Inline-Editor benutzt `data-inline-action`.
- Keine Inline-Handler.
- Live-Vorschau muss nach jeder Aenderung aktualisieren.
- Listen duerfen addiert und geloescht werden.
- Alle Richtext-Felder nutzen die vorhandene Textformatierung.
- Keine versteckten Felder, die nur im grossen Editor erreichbar sind.

## Renderer

Neue Renderer-Funktionen sollten aus `module-renderer.js` herausloesbar bleiben. Wenn die aktuelle Ladeweise direkte globale Funktionen erwartet, kann eine kleine Anbindung im Renderer bleiben, aber die fachlichen Helfer sollten in `modules/court/court-renderer.js` liegen.

Geplante Funktionen:

- `buildCourtPage(page, entry, pageIndex, total)`
- `buildCourtHeader(data, entry)`
- `buildCourtOverview(data)`
- `buildCourtCharges(data)`
- `buildCourtDates(data)`
- `buildCourtParties(data)`
- `buildCourtEvidence(data)`
- `buildCourtWitnesses(data)`
- `buildCourtChronology(data)`
- `buildCourtOpenQuestions(data)`
- `buildCourtRelatedEntries(data)`
- `buildCourtLink(label, target, className)`
- `buildCourtImageOrMark(src, alt, className, fallback)`

Renderregeln:

- Alles sichtbare HTML escaped oder ueber bestehende Richtext-Sanitizer ausgeben.
- `target` ueber sichere Linkausgabe behandeln.
- Bild-URLs ueber `sanitizeImageSrc`.
- Leere Listen zeigen dezente Empty-Zeile oder werden ausgelassen, je nach Bereich.
- Kein Rendertext, der Schuld oder Urteil behauptet.

## CSS

Neue Datei:

- `styles/module-page-court.css`

Visuelle Richtung:

- Akten-/Pergament-Layout
- ruhige Tabellen und Karten
- klare linke/rechte Informationsspalten
- Beweis- und Zeugenlisten scanbar
- keine ueberladene Landingpage
- kein reiner Kastenmodul-Skin

Layout-Vorschlag Desktop:

- Kopfzeile volle Breite
- Zwei-Spalten-Hauptbereich:
  - links: Falluebersicht, Zusammenfassung, Anklagepunkte, Daten
  - rechts: Beweisstuecke, Zeugen
- Footerbereich:
  - Beteiligte / Anklage-Erklaerung / offene Fragen / Chronologie

Mobile:

- alle Bereiche einspaltig
- Beweise und Zeugen als kompakte Karten statt breite Tabellen
- keine horizontale Scrollpflicht
- lange Namen und Aktennummern duerfen umbrechen

## Integration

Zu beruehrende Dateien:

- `modules/court/court-editor-schema.js` neu
- `modules/court/court-renderer.js` neu, falls mit aktueller Script-Ladung sauber machbar
- `modules/module-editor/module-editor-data.js`
- `modules/module-editor/module-editor-templates.js`
- `modules/module-editor/module-editor-court.js` neu
- `modules/module-editor/module-editor-events.js`
- `modules/inline-editor/inline-editor-court.js` neu
- `modules/inline-editor/inline-module-editor.js`
- `modules/inline-editor/inline-editor-events.js`
- `modules/rendering/module-renderer.js`
- `modules/core/app-core.js`
- `styles/module-page-court.css` neu
- `styles/module-page-boards.css`, nur falls generische Editor-Zeilen CSS brauchen
- `styles/mobile.css`, nur fuer kleine Breakpoints
- `AleriaAlmanach.html`
- `docs/module-editor-coverage.md`

## Reihenfolge der Umsetzung

| Fortschritt | Schritt | Ergebnis |
| --- | --- | --- |
| 10% | Plan-Dokument | Umfang, Datenmodell, Architektur und Tests sind festgelegt. |
| 20% | Datenmodell und Defaults | Erledigt: `courtPage`, `page.court`, Sanitizer und Defaultseite existieren. |
| 35% | Renderer und CSS-Grundlayout | Erledigt: Gerichtsakte rendert als eigenstaendige Live-Seite. |
| 50% | Grosser Modul-Editor | Erledigt: Alle Court-Felder sind strukturiert bearbeitbar. |
| 65% | Modul-Editor Events | Erledigt: Add/Remove fuer alle Listen funktionieren ueber `data-module-editor-action`. |
| 80% | Inline-Editor | Erledigt: Live-Bearbeitung, Listenaktionen und Vorschau funktionieren. |
| 90% | Integration und Cachebuster | Erledigt: Template-Auswahl, Normalisierung, Export/Import-Pfad und HTML-Ladung sind angebunden. |
| 100% | Smoke- und Layouttests | Erledigt: Browser-Smoke, Syntaxcheck, Mojibake-Scan, Desktop/Mobile-Layout bestanden. |

## Testplan

Pflichtchecks:

- `node --check` fuer alle neuen/geaenderten JS-Dateien.
- Suche nach Mojibake in allen beruehrten Dateien.
- Suche nach neuen Inline-Handlern.
- Browser-Smoke fuer grossen Modul-Editor:
  - Template `court` anlegen.
  - Falluebersicht editieren.
  - Beweis hinzufuegen.
  - Zeuge hinzufuegen.
  - Beteiligtenkarte hinzufuegen.
  - JSON/Draft enthaelt `courtPage` und `page.court`.
- Browser-Smoke fuer Inline-Editor:
  - Scalar-Felder aktualisieren.
  - Listenzeile hinzufuegen.
  - Listenfeld aktualisieren.
  - Live-Vorschau zeigt Aenderung.
- Export/Import-Smoke:
  - Court-Seite exportieren.
  - Wieder importieren.
  - `page.court` bleibt erhalten.
- Layout-Smoke:
  - Desktop 1440px mit vielen Beweisen/Zeugen.
  - Mobile 390px mit langen Namen, langen Links und langen Aussagen.
  - Kein horizontaler Overflow.

## Risiken

1. Zu grosse Datenstruktur
   - Gegenmassnahme: Listenfelder nur dort, wo die Live-Seite wirklich wiederholbare Inhalte braucht.

2. Bewertende Sprache schleicht sich ein
   - Gegenmassnahme: Defaults und Labels neutral halten. Keine Score-/Sternefelder.

3. Editor wird unuebersichtlich
   - Gegenmassnahme: Feldschema wiederverwenden, Listen klar gruppieren, keine JSON-Fallbacks.

4. Renderer wird zu gross
   - Gegenmassnahme: Court-spezifische Helper in eigene Datei oder klar abgegrenzten Abschnitt auslagern.

5. Linkmodell wird zu kompliziert
   - Gegenmassnahme: nur `target` als einfacher Link. Keine automatische Aufloesung in Charakter-/Modul-IDs im ersten Schnitt.

## Definition of Done

Das Gerichtsmodul gilt als fertig, wenn:

- Eine neue Gerichtsakte ueber die Template-Auswahl erstellt werden kann.
- Alle sichtbaren Live-Bereiche im grossen Modul-Editor bearbeitbar sind.
- Alle sichtbaren Live-Bereiche im Inline-Editor bearbeitbar sind oder bewusst als reine Darstellung aus bestehenden Feldern kommen.
- Beweise, Zeugen, Beteiligte, Anklagepunkte, Chronologie, offene Fragen und Links strukturiert addiert/entfernt werden koennen.
- Links und Bilder sicher gerendert werden.
- Export/Import `courtPage` und `page.court` erhaelt.
- Browser-Smokes fuer Editor, Inline-Editor und Layout bestanden sind.
- Kein Mojibake in den beruehrten Dateien vorkommt.
- Keine neuen Inline-Handler eingefuehrt wurden.
