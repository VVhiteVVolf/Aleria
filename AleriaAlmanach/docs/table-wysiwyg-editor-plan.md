# WYSIWYG-Tabelleneditor - Architekturplan

Stand: 2026-07-06

Ziel: Ein gemeinsamer Tabelleneditor fuer Orte, Gruppen, Kontinente, Familien/Haeuser, kleine Haeuser und spaetere aehnliche Bereiche. Tabellen sollen im Bearbeitungsmodus direkt auf der Seite bedienbar werden, naeher an Animexx, Word oder Excel, ohne fuer jede konkrete Familie, Gruppe oder jeden Ort eigene HTML-Dateien zu erzeugen.

Das Projekt braucht keinen zweiten Seiteneditor und keine Kopie der aktuellen Tabellenlogik pro Bereich. Der Tabelleneditor wird als wiederverwendbares Feature gebaut, das mit der aktuell geladenen Dokument-ID arbeitet.

## Umsetzungsstand

Aktueller Stand: erste produktive Stufe begonnen.

- Erledigt: Plan-Dokument angelegt.
- Erledigt: gemeinsames Featuremodul `AleriaAlmanach/modules/table-editor/table-editor.js` angelegt.
- Erledigt: eigenes CSS `AleriaAlmanach/modules/table-editor/table-editor.css` angelegt.
- Erledigt: dynamische Anbindung an den bestehenden Inline-Editor.
- Erledigt: direkter Zellfokus im Bearbeitungsmodus.
- Erledigt: `Tab` und `Shift+Tab` navigieren zwischen Tabellenzellen.
- Erledigt: Basis-Kommandos fuer Zeile davor/danach, einfache Spalten links/rechts, Zelle leeren.
- Erledigt: Mehrfachauswahl per Strg/Cmd-Klick und Zeilenbereich per Shift-Klick.
- Erledigt: horizontales Verbinden benachbarter Zellen innerhalb derselben Zeile.
- Erledigt: geschuetzte Tabellenprofile fuer Portrait-, Hof-, Stammbaum- und Historientabellen verhindern riskante Spalten-/Loeschaktionen.
- Erledigt: Speicherung laeuft weiter ueber bestehende `tables[tableId]`-Payloads.
- Offen: strukturierte Tabellenobjekte.
- Offen: ausgelagerte Tabellendokumente pro `tableId`.
- Offen: pro-Tabelle-Konfliktpanel.
- Offen: Split, Excel-Paste und erweiterte Mehrfachauswahl ueber mehrere Zeilen.

## Grundentscheidung

Es bleibt bei wenigen HTML-Shells und vielen Datensaetzen.

Beispiele:

```text
Orte/grossstadt.html?ort=lysfaen
Organisationen und Gruppen/gruppe.html?gruppe=windreiter
Kontinente/_template/KoenigreichTemplate.html?kontinent=koenigreich-cenyr
Familien Häuser und Clans/haus.html?haus=haus-draig
Familien Häuser und Clans/kleinehaeuser.html?haus=familie-jernigan
```

Jeder konkrete Eintrag bekommt:

- eine stabile Registry-ID
- eine Datendatei oder spaeter einen Firebase-Datensatz
- eigene gespeicherte Texte, Bilder, Tabellen und Metadaten unter dieser ID

Nicht gewuenscht:

```text
haus-draig.html
familie-jernigan.html
familie-xy.html
familie-xy-v2.html
...
```

## Ist-Zustand

Der gemeinsame Bearbeitungsmodus liegt derzeit hauptsaechlich in:

```text
Orte/assets/js/orte-inline-editor.js
Orte/assets/js/orte-inline-firebase.js
Orte/assets/css/orte-inline-editor.css
```

Er wird bereits von mehreren Bereichen genutzt:

- Orte
- Organisationen und Gruppen
- Kontinente
- Familien Haeuser und Clans

Der aktuelle Inline-Payload speichert:

```js
{
  contentSchemaVersion: 2,
  savedAtClient: 123456789,
  resetAtClient: 0,
  meta: {},
  texts: {},
  tables: {},
  ratings: {},
  images: {},
  hiddenSections: {}
}
```

Tabellen werden aktuell als HTML gespeichert:

```js
tables[tableId] = "<tr>...</tr>"
```

Das ist flexibel und fuer alte Vorlagentabellen brauchbar, aber fuer echte WYSIWYG-Bearbeitung, Konfliktloesung und effiziente Speicherung nur begrenzt geeignet.

## Zielbild Bedienung

Im Bearbeitungsmodus wird jede unterstuetzte Tabelle direkt interaktiv.

### Direkte Zellbearbeitung

- Klick in eine Zelle aktiviert die Zelle.
- Text wird direkt in der Zelle bearbeitet.
- `Tab` springt zur naechsten Zelle.
- `Shift+Tab` springt zur vorherigen Zelle.
- Pfeiltasten navigieren optional zwischen Zellen, wenn kein Textcursor aktiv ist.
- `Enter` bleibt innerhalb der Zelle fuer Textumbruch.
- `Ctrl+Enter` kann spaeter eine neue Zeile unterhalb einfuegen.

### Tabellen-Handles

Bei aktiver Tabelle erscheinen dezente Werkzeuge:

- Zeile oberhalb einfuegen
- Zeile unterhalb einfuegen
- Spalte links einfuegen
- Spalte rechts einfuegen
- Zeile entfernen
- Spalte entfernen
- Zelle leeren
- Zelle duplizieren
- Tabelle kompakt normalisieren

### Spezialaktionen

Fuer bestehende Vorlagentabellen bleiben fachliche Aktionen erhalten:

- Portraitreihe einfuegen
- Leerzeile einfuegen
- Ueberschrift 1 einfuegen
- Ueberschrift 2 einfuegen
- Portraitanzahl 0 bis 7 setzen
- Reihenfolge hoch/runter verschieben
- Tabellenblock einfuegen

### Word-/Excel-nahe Funktionen

Diese Funktionen kommen nach der Grundstabilitaet:

- Mehrfachauswahl von Zellen
- Zellen verbinden
- Zellen teilen
- Copy/Paste aus Tabellenquellen
- Copy/Paste in Tabellenquellen
- Undo/Redo pro Tabelle
- Formatierung innerhalb von Zellen: fett, kursiv, Link, kleine Hervorhebung

## Architektur

Der Tabelleneditor wird als eigenes Feature extrahiert. Der aktuelle `orte-inline-editor.js` darf nicht weiter zu einer zentralen Monsterdatei wachsen.

Vorgeschlagene Struktur:

```text
AleriaAlmanach/modules/table-editor/
  table-editor-bootstrap.js
  table-editor-state.js
  table-editor-dom.js
  table-editor-selection.js
  table-editor-keyboard.js
  table-editor-commands.js
  table-editor-profiles.js
  table-editor-serialization.js
  table-editor-storage.js
  table-editor-conflicts.js
  table-editor-events.js
  table-editor.css
```

### Verantwortlichkeiten

| Modul | Verantwortung |
| --- | --- |
| `table-editor-bootstrap.js` | Initialisierung pro Seite, Anbindung an bestehende Inline-Editor-Konfiguration |
| `table-editor-state.js` | lokaler Tabellenstatus, Dirty-Flags, Revisionen, Undo/Redo |
| `table-editor-dom.js` | DOM-Helfer fuer Tabellen, Zellen, Zeilen, Spalten, Handles |
| `table-editor-selection.js` | aktive Tabelle, aktive Zelle, Mehrfachauswahl |
| `table-editor-keyboard.js` | Tab, Shift+Tab, Pfeiltasten, Escape, Enter-Strategie |
| `table-editor-commands.js` | Insert/Remove/Move/Merge/Split/Normalize |
| `table-editor-profiles.js` | Tabellenprofile fuer freie Tabellen, Portraittabellen, Stammbaum, Historische Figuren usw. |
| `table-editor-serialization.js` | DOM <-> speicherbares Tabellenmodell |
| `table-editor-storage.js` | lokale Speicherung, Firebase-Speicherung, Debounce, Laden |
| `table-editor-conflicts.js` | Konflikterkennung pro Tabelle |
| `table-editor-events.js` | Event Delegation, keine Inline-Handler |
| `table-editor.css` | Editor-Handles, Zellfokus, Auswahl, Toolbar |

Der bestehende Inline-Editor ruft den Tabelleneditor nur noch als Subsystem auf:

```js
TableEditor.mount({
  root,
  documentId,
  namespace,
  inlineCollection,
  getEditMode,
  markDirty,
  scheduleSave,
});
```

## Tabellenprofile

Nicht jede Tabelle darf gleich behandelt werden. Eine Stammbaumtabelle hat andere Regeln als eine Infotabelle.

Jede Tabelle bekommt intern ein Profil. Das Profil kann aus Klassen, `data-` Attributen oder Fallback-Heuristik erkannt werden.

Beispiele:

```html
<table data-orte-table-id="haeuser-hof" data-table-editor-profile="portrait-court">
<table data-orte-table-id="haeuser-hierarchie-stammbaum" data-table-editor-profile="genealogy">
<table data-orte-table-id="haeuser-historische-figuren" data-table-editor-profile="historical-figures">
```

Profile:

| Profil | Zweck | Erlaubte Operationen |
| --- | --- | --- |
| `free` | normale Tabellen | Zellen, Zeilen, Spalten, Merge/Split |
| `info-table` | Infoboxen | Zelltext, Zeilen, keine freie Spaltenlogik im ersten Schritt |
| `portrait-grid` | Portraitlisten | Portraitreihe, Portraitanzahl, Links/Rechts-Auffuellung |
| `portrait-court` | Hof/Hofstaat | Portraitreihe, Rollenreihe, 0-7 Portraitplaetze |
| `genealogy` | Stammbaum/Hierarchie | Generationen, Ueberschriften, Portraitreihen, Leerzeilen |
| `historical-figures` | historische Figuren | Personenblock, Ueberschrift 1/2, Leerzeile |
| `legacy-html` | alte komplexe Tabellen | nur sichere Zellbearbeitung und Zeilenoperationen |

Profile verhindern, dass generische Aktionen eine fachlich fragile Tabelle zerstoeren.

## Speichersystem

Das Speichersystem muss zwei Anforderungen verbinden:

1. Bestehende Tabellen duerfen weiter funktionieren.
2. Grosse oder haeufig bearbeitete Tabellen sollen nicht immer den gesamten Seitenpayload neu schreiben.

Deshalb wird ein hybrides Modell vorgeschlagen.

## Speicherstufe 1: kompatibel

Kurzfristig bleibt der bestehende Inline-Payload gueltig:

```js
tables[tableId] = "<tr>...</tr>"
```

Der neue Editor kann diese Tabellen lesen, bearbeiten und wieder als HTML schreiben.

Vorteil:

- keine Sofortmigration
- keine kaputten alten Daten
- geringe Einstiegskosten

Nachteil:

- Konflikte nur grob pro Tabelle
- keine effiziente Teilaktualisierung innerhalb sehr grosser Tabellen

## Speicherstufe 2: strukturierte Tabellenobjekte

Neue Tabellen koennen als Objekt gespeichert werden:

```js
tables[tableId] = {
  mode: "structured-html",
  schemaVersion: 1,
  revision: 12,
  updatedAtClient: 123456789,
  baseHash: "abc123",
  profile: "genealogy",
  html: "<tr>...</tr>",
  structure: {
    columns: 7,
    rows: [
      {
        id: "row-0001",
        kind: "heading",
        cells: [
          {
            id: "cell-0001",
            html: "<b>Gruender</b>",
            colspan: 7,
            rowspan: 1,
            classes: ["haeuser-genealogy-heading"]
          }
        ]
      }
    ]
  }
}
```

Regel:

- `html` bleibt als Render-Fallback erhalten.
- `structure` ist die bearbeitbare Wahrheit fuer neue/normalisierte Tabellen.
- Alte Tabellen ohne `structure` werden beim Bearbeiten vorsichtig normalisiert, aber nicht automatisch aggressiv migriert.

## Speicherstufe 3: ausgelagerte Tabellendokumente

Fuer groessere Dokumente wird der Hauptpayload schlank gehalten.

Hauptdokument:

```js
{
  contentSchemaVersion: 3,
  texts: {},
  images: {},
  ratings: {},
  hiddenSections: {},
  tableIndex: {
    "haeuser-hof": {
      mode: "external",
      revision: 12,
      hash: "abc123",
      profile: "portrait-court"
    }
  }
}
```

Tabellendokumente in einer separaten Collection:

```text
{inlineCollection}_tables/{documentId}__{tableId}
```

Beispiele:

```text
orte_inline_content_tables/lysfaen__pt-s-0067
organisationen_und_gruppen_inline_content_tables/windreiter__gruppe-fuehrung
kontinente_inline_content_tables/koenigreich-cenyr__adelshaeuser
familien_haeuser_und_clans_inline_content_tables/familie-jernigan__haeuser-hof
```

Tabellendokument:

```js
{
  id: "familie-jernigan__haeuser-hof",
  documentId: "familie-jernigan",
  tableId: "haeuser-hof",
  type: "table-editor-content",
  schemaVersion: 1,
  profile: "portrait-court",
  revision: 12,
  baseHash: "abc123",
  html: "<tr>...</tr>",
  structure: {},
  updatedAtClient: 123456789,
  updatedAt: serverTimestamp()
}
```

Vorteile:

- Eine geaenderte Tabelle schreibt nur ihr eigenes Dokument.
- Viele Tabellen sprengen nicht den Hauptpayload.
- Konflikte koennen pro Tabelle behandelt werden.
- Familien mit vielen Stammbaum-/Hof-/Historientabellen bleiben skalierbar.

## Lokale Speicherung

Bis Firebase erreichbar ist, bleibt LocalStorage der lokale Arbeitsstand.

Neue Keys:

```text
aleria:{namespace}:table:v1:{documentId}:{tableId}
aleria:{namespace}:table-meta:v1:{documentId}:{tableId}
aleria:{namespace}:table-index:v1:{documentId}
```

Beispiele:

```text
aleria:haeuser:table:v1:familie-jernigan:haeuser-hof
aleria:gruppen:table:v1:windreiter:gruppe-fuehrung
aleria:kontinente:table:v1:koenigreich-cenyr:adelshaeuser
```

Der bestehende Inline-Payload bleibt der Fallback. Beim Laden gilt:

1. Externes Tabellendokument, falls vorhanden und neuer.
2. Lokales Tabellenobjekt, falls vorhanden und neuer.
3. `tables[tableId]` aus dem Inline-Payload.
4. HTML aus der Vorlage.

## Aenderungsuebernahme

Der Editor darf nicht bei jeder Taste den gesamten Dokumentstand schreiben.

Strategie:

- Jede Tabelle hat ein eigenes Dirty-Flag.
- Text in einer Zelle wird debounced gespeichert.
- Strukturaktionen speichern sofort eine neue Revision.
- Der Hauptpayload wird nur aktualisiert, wenn Tabellenindex, Texte, Bilder oder globale Metadaten betroffen sind.
- Pro Tabelle wird ein `baseHash` gespeichert.

Speicherablauf:

```text
Zelle aendern
-> Tabelle dirty
-> nach kurzer Pause Tabelle serialisieren
-> Hash berechnen
-> nur tableId speichern
-> tableIndex im Hauptpayload aktualisieren, falls Revision/Hash geaendert
```

Konfliktfall:

```text
Remote revision > local base revision
und lokale Tabelle dirty
=> Konfliktpanel fuer diese Tabelle
```

Moegliche Nutzeraktionen:

- Online-Stand uebernehmen
- lokale Fassung speichern
- beide Fassungen vergleichen, spaeter
- lokale Fassung exportieren

Wichtig: Ein Konflikt in einer Tabelle darf nicht die ganze Seite blockieren.

## Datenmigration

Keine Big-Bang-Migration.

Stufen:

1. Bestehende HTML-Tabellen weiter lesen und schreiben.
2. Neue WYSIWYG-Aktionen auf HTML-Fallback anwenden.
3. Wenn eine Tabelle aktiv bearbeitet wird, optional `structure` erzeugen.
4. Wenn eine Tabelle gross oder haeufig ist, in externes Tabellendokument auslagern.
5. Alte `tables[tableId] = "<tr>...</tr>"` bleiben als Fallback lesbar.

## UI-Konzept

Der Tabelleneditor darf die Seite nicht ueberdecken.

Regeln:

- Tabellen-Toolbar ausserhalb oder am Rand der Tabelle.
- Zellfokus klar, aber nicht bunt oder dominant.
- Handles nur im Bearbeitungsmodus.
- Kein Popup mitten in engen Tabellenzellen.
- Auf Mobile lieber Panel unten statt seitlicher Toolbar.
- Alle Aktionen ueber Buttons mit `data-action`, keine Inline-Handler.

## Implementierungsplan

| Fortschritt | Schritt | Ergebnis |
| --- | --- | --- |
| 10% | Plan-Dokument | Architektur, Speicherstrategie und Phasen sind festgelegt. |
| 20% | Inventar | Alle Tabellenarten in Orte/Gruppen/Kontinente/Haeuser sind katalogisiert. |
| 30% | Modul-Extraktion | Neue `table-editor` Featuredateien existieren, bestehender Inline-Editor ruft sie an. |
| 40% | Zellbearbeitung | Direkte Zellbearbeitung, Fokus, Tab-Navigation und Dirty-Tracking funktionieren. |
| 50% | Basis-Kommandos | Zeile/Spalte einfuegen/loeschen, Zeilen verschieben und Leerzeilen funktionieren stabil. |
| 60% | Profile | Portrait-, Stammbaum-, Hof- und Historienprofile schuetzen fachliche Tabellen. |
| 70% | Strukturmodell | Tabellen koennen optional als strukturierte Objekte serialisiert werden. |
| 80% | Externe Speicherung | Grosse Tabellen koennen pro `tableId` separat lokal und in Firebase gespeichert werden. |
| 90% | Konflikte | Pro-Tabelle-Revisionen und Konfliktpanel verhindern stilles Ueberschreiben. |
| 100% | Rollout | Orte, Gruppen, Kontinente, Haeuser und kleine Haeuser nutzen denselben Editor stabil. |

## Erste Umsetzungsphase

Die erste produktive Phase sollte bewusst klein bleiben:

1. Aktuelle Tabellenfunktionen aus `orte-inline-editor.js` inventarisieren.
2. Gemeinsame Tabellenfunktionen in `table-editor-*` Dateien extrahieren.
3. Bestehendes Verhalten unveraendert halten.
4. Direkte Zellbearbeitung und Tab-Navigation ergaenzen.
5. Speicherung weiter ueber bestehendes `tables[tableId]` HTML.
6. Browser-Smoke fuer:
   - Grossstadt
   - Gruppe
   - Koenigreich/Grafschaft
   - Haus
   - Kleinehaeuser

Erst danach externe Tabellendokumente einfuehren.

## Risiken

1. Monsterdatei
   - Gegenmassnahme: Featuremodule statt weiterer Ausbau von `orte-inline-editor.js`.

2. Fachliche Tabellen werden durch generische Aktionen beschaedigt
   - Gegenmassnahme: Tabellenprofile mit erlaubten Operationen.

3. Speicherung wird zu komplex
   - Gegenmassnahme: HTML-Fallback behalten, strukturierte/externe Speicherung schrittweise einfuehren.

4. Konflikte ueberschreiben Nutzerdaten
   - Gegenmassnahme: Revision und Hash pro Tabelle, Konfliktpanel pro Tabelle.

5. Zu viele HTML-Dokumente fuer Familien
   - Gegenmassnahme: Shells bleiben wenige; konkrete Familien speichern unter Registry-ID.

6. Popup-/Toolbar-Ueberlagerungen
   - Gegenmassnahme: externe Toolbar-Positionierung und Mobile-Bottom-Panel.

## Definition of Done

Der gemeinsame WYSIWYG-Tabelleneditor gilt als fertig, wenn:

- Orte, Gruppen, Kontinente, Haeuser und kleine Haeuser denselben Tabelleneditor nutzen.
- Eine Zelle direkt bearbeitet werden kann.
- Tab/Shift+Tab zuverlaessig durch Tabellen navigiert.
- Zeilen und Spalten ohne Datenverlust eingefuegt und entfernt werden koennen.
- Portrait-, Stammbaum-, Hof- und Historientabellen ihre Spezialaktionen behalten.
- Tabellen werden unter der jeweiligen Dokument-ID gespeichert, nicht in eigenen HTML-Dateien.
- Grosse Tabellen koennen separat gespeichert werden.
- Lokale und Remote-Konflikte werden pro Tabelle erkannt.
- Reload zeigt gespeicherte Aenderungen korrekt.
- Keine neuen Inline-Handler eingefuehrt wurden.
- JS-Syntaxchecks und Browser-Smokes fuer alle betroffenen Vorlagen bestanden sind.
