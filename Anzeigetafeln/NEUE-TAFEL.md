# Neue Anzeigetafel anlegen

Diese Anleitung beschreibt den normalen Arbeitsablauf fuer neue Tafeln im Ordner `Anzeigetafeln`.

Wichtig: Neue Tafeln bekommen keine eigene grosse HTML-Datei. Sie werden ueber die zentrale Shell geladen:

```txt
tafel.html?tafel=<tafel-id>
```

## 1. Tafel-ID bilden

Die Tafel-ID folgt der Orts-Hierarchie, klein geschrieben und mit Bindestrichen.

Beispiel Morddyn:

```txt
cenyr-celtigerns-wacht-gwendolyns-ufer-morddyn
```

Empfohlenes Muster:

```txt
<koenigreich>-<grafschaft>-<baronie>-<herrschaft>-<ort>
```

Nicht jede Ebene muss immer existieren. Die ID soll aber stabil bleiben, sobald eine Ortsseite darauf verlinkt.

## 2. Registry-Eintrag anlegen

Neue Tafeln werden in `tafeln.registry.js` eingetragen.

Minimaler geplanter Eintrag:

```js
{
  id: "cenyr-celtigerns-wacht-gwendolyns-ufer-beispielort",
  title: "Anzeigetafel Beispielort",
  status: "planned",
  type: "settlement",
  hierarchy: [
    { level: "kingdom", slug: "cenyr", title: "Cenyr" },
    { level: "county", slug: "celtigerns-wacht", title: "Celtigerns Wacht" },
    { level: "barony", slug: "gwendolyns-ufer", title: "Gwendolyns Ufer" },
    { level: "settlement", slug: "beispielort", title: "Beispielort" }
  ],
  link: "tafel.html?tafel=cenyr-celtigerns-wacht-gwendolyns-ufer-beispielort",
  firebase: {
    collection: "anzeigetafeln",
    docId: "cenyr-celtigerns-wacht-gwendolyns-ufer-beispielort"
  },
  editableDraft: true,
  notes: "Geplante Anzeigetafel. Bilder werden im Editormodus per Imgur-Link gesetzt."
}
```

`editableDraft: true` bedeutet:

- Der Link ist bereits aufrufbar.
- Die Tafel startet mit Platzhalterbild.
- Tafelbild und Markerbild koennen im Browser gesetzt werden.
- Firebase-Daten werden unter der eigenen `docId` gespeichert.

## 3. Link verwenden

Der Link fuer Ortsseiten ist:

```txt
Anzeigetafeln/tafel.html?tafel=cenyr-celtigerns-wacht-gwendolyns-ufer-beispielort
```

In einer Ortsseite wird spaeter genau dieser Link verwendet.

## 4. Bilder setzen

1. Tafel-Link im Browser oeffnen.
2. Editormodus aktivieren.
3. `Bilder` anklicken.
4. Imgur-Link fuer `Anzeigetafel` eintragen.
5. Imgur-Link fuer `Minimap / Markerbild` eintragen.
6. Speichern.

Die Links werden im Firebase-Zustand dieser Tafel gespeichert. Sie gelten nicht fuer andere Tafeln.

## 5. Inhalte pflegen

Nach dem Setzen der Bilder koennen Zettel, Orte, Marker, Kategorien, DM-Daten und Reiserouten normal gepflegt werden.

Diese Daten sind pro Tafel getrennt, solange `firebase.docId` eindeutig ist.

## 6. Ratifizieren

Nach jedem neuen Registry-Eintrag:

```bash
node Anzeigetafeln/tools/validate-tafeln-structure.mjs
```

Erwartung:

```txt
Errors: 0
Warnings: 0
```

Warnungen koennen bei geplanten Tafeln vertretbar sein, Fehler nicht.

## 7. Wann wird eine Tafel active?

Eine Tafel kann `active` werden, wenn:

- ihr Link stabil ist
- die Firebase-DocId eindeutig ist
- die Ortszuordnung stimmt
- Tafelbild und Markerbild gesetzt sind
- der Validator ohne Fehler laeuft
- ein kurzer Browser-Test erfolgreich war

## Nicht machen

- keine neue grosse HTML-Datei kopieren
- keine bestehende Tafel-ID nachtraeglich umbenennen, wenn sie schon verlinkt wurde
- keine Firebase-DocId doppelt verwenden
- keine Bildlinks in mehrere Dateien kopieren, wenn sie im Browser gesetzt werden koennen
