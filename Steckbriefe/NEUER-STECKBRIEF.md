# Neuer Steckbrief

Diese Checkliste ist fuer neue Charaktere im zentralen Steckbrief-System.

## Grundregel

Keine neue HTML-Datei pro Charakter anlegen.

Neue Charaktere werden manuell in der IDE angelegt. Es gibt keinen Generator-Zwang und keinen automatischen Massenprozess.

Neue Charaktere bekommen:

- einen hierarchischen Ordner
- eine `charakter.data.js`
- einen Eintrag in `steckbriefe.registry.js`

Der oeffentliche Link nutzt immer die zentrale Seite:

```text
/Steckbriefe/steckbrief.html?id=CHARAKTER-ID
```

## 1. Ordner anlegen

Die Ordner folgen der Weltlogik, nicht der Technik.

Beispiel:

```text
Steckbriefe/
  Land/
    Cenyr/
      CeltigernsWacht/
        Adelshaeuser/
          HausDraig/
            NeuerCharakter/
              charakter.data.js
```

Tiefe Ebenen sind erlaubt, wenn sie fachlich sinnvoll sind:

```text
Land / Koenigreich / Grafschaft / Baronie / Herrschaft / Ort / Haus oder Gruppe / Charakter
```

## 2. Daten anlegen

Fuer neue Figuren reicht meistens eine Override-Datei nach dem Muster von Guinevere oder Freya:

```js
(function () {
  "use strict";

  const base = window.STECKBRIEF_DATA || {};
  const overrides = {
    meta: {
      id: "cenyr-beispielregion-hausbeispiel-vorname-nachname",
      titel: "Vorname Nachname - Aleria",
      kategorie: "Charaktersteckbrief",
      status: "Entwurf",
      editorVersion: 2
    },
    name: {
      vorname: "Vorname",
      nachname: "Nachname",
      vollstaendig: "Vorname Nachname",
      titel: "-",
      rufname: "-",
      alias: "-"
    },
    hierarchie: [
      { typ: "Land", name: "Cenyr", slug: "cenyr" },
      { typ: "Region", name: "Beispielregion", slug: "beispielregion" },
      { typ: "Charakter", name: "Vorname Nachname", slug: "vorname-nachname" }
    ]
  };

  window.STECKBRIEF_DATA = mergeDeep(base, overrides);

  function mergeDeep(target, source) {
    const output = Array.isArray(target) ? [...target] : { ...target };
    Object.keys(source).forEach((key) => {
      const value = source[key];
      if (value && typeof value === "object" && !Array.isArray(value)) {
        output[key] = mergeDeep(output[key] || {}, value);
      } else {
        output[key] = value;
      }
    });
    return output;
  }
})();
```

Die gemeinsame Vorlage liefert Inventar, Trivia, Gruppierungen, Beziehungen und Galerie. Nur Sonderdaten muessen im Charakter ueberschrieben werden.

## 3. Registry eintragen

In `steckbriefe.registry.js` einen Eintrag hinzufuegen:

```js
{
  id: "cenyr-beispielregion-hausbeispiel-vorname-nachname",
  slug: "vorname-nachname",
  name: "Vorname Nachname",
  status: "draft",
  data: "Land/Cenyr/Beispielregion/HausBeispiel/VornameNachname/charakter.data.js",
  hierarchy: [
    { type: "Land", name: "Cenyr", slug: "cenyr" },
    { type: "Region", name: "Beispielregion", slug: "beispielregion" },
    { type: "Haus", name: "Haus Beispiel", slug: "haus-beispiel" }
  ],
  tags: ["cenyr", "beispielregion", "haus-beispiel"]
}
```

`id` muss eindeutig sein. Der finale Link ist:

```text
/Steckbriefe/steckbrief.html?id=cenyr-beispielregion-hausbeispiel-vorname-nachname
```

## 4. Bearbeiten

Die Bearbeitung erfolgt ueber den Steckbrief selbst:

```text
/Steckbriefe/steckbrief.html?id=CHARAKTER-ID
```

Im Bearbeitungsmodus links den passenden Reiter waehlen:

- `Identitaet`
- `Bilder`
- `Fakten`
- `Sektionen`
- `Inventar`
- `Gruppierungen`
- `Beziehungen`
- `Galerie`

Die rechte Seite ist Live-Vorschau. Dort sollen im grossen Editor keine direkten Inline-Aenderungen gemacht werden.

## 5. Validieren

Nach dem Anlegen oder Aendern:

```bash
node Steckbriefe/tools/validate-steckbriefe-structure.mjs
```

Erwartung:

```text
Errors: 0
Warnings: 0
```

Der Validator prueft auch, ob `Gruppierungen` vor `Beziehungen` steht und mindestens 5 Plaetze besitzt.
