# Neues Haus, neue Familie oder neuer Clan

Diese Struktur ist für viele spätere Familien gedacht. Neue Häuser sollen nicht als kopierte Komplettseiten entstehen, sondern als eigene Datendateien in einer nachvollziehbaren Welt-Hierarchie.

## Grundregel

Die zentrale Seite ist:

```text
/Familien Häuser und Clans/haus.html?haus=HAUS-ID
```

Ein konkretes Haus bekommt:

- einen fachlichen Ordnerpfad
- eine eigene `haus.data.js`
- einen Eintrag in `haeuser.registry.js`
- eine stabile Haus-ID für Firebase und LocalStorage

## Ordnerstruktur

Die Ordner folgen der Welt- und Herrschaftshierarchie, nicht dem Dateityp.

```text
Familien Häuser und Clans/
  Estryll/
    Cenyr/
      Celtigerns_Wacht/
        Haus_Draig/
          haus.data.js
```

Tiefe Ebenen sind erlaubt, wenn sie fachlich sinnvoll sind:

```text
Familien Häuser und Clans/
  Estryll/
    Cenyr/
      Celtigerns_Wacht/
        Llamreis_Ankunft/
          Herrschaft_der_Wyrm/
            Llysfaen/
              Familie_Jernigan/
                haus.data.js
```

## Minimaler Registry-Eintrag

```js
{
  id: "familie-jernigan",
  slug: "familie-jernigan",
  name: "Familie Jernigan",
  status: "draft",
  type: "family",
  data: "Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Herrschaft_der_Wyrm/Llysfaen/Familie_Jernigan/haus.data.js",
  inlineCollection: "familien_haeuser_und_clans_inline_content",
  sceneCollection: "familien_haeuser_und_clans_scenes",
  hierarchy: [
    { type: "Sammlung", name: "Familien Häuser und Clans", slug: "familien-haeuser-und-clans" },
    { type: "Kontinent", name: "Estryll", slug: "estryll" },
    { type: "Land", name: "Cenyr", slug: "cenyr" },
    { type: "Grafschaft", name: "Celtigerns Wacht", slug: "celtigerns-wacht" },
    { type: "Baronie", name: "Llamreis Ankunft", slug: "llamreis-ankunft" },
    { type: "Herrschaft", name: "Herrschaft der Wyrm", slug: "herrschaft-der-wyrm" },
    { type: "Ort", name: "Llysfaen", slug: "llysfaen" },
    { type: "Familie", name: "Familie Jernigan", slug: "familie-jernigan" }
  ],
  tags: ["haeuser", "familie", "cenyr", "llysfaen", "jernigan"]
}
```

## Datendatei

Die Datendatei setzt `window.HAEUSER_DATA`. Für ein konkretes Haus wird `data/haeuser-vorlage.data.js` kopiert und fachlich angepasst.

Wichtig:

- `meta.id` muss zur Registry-ID passen.
- `meta.storage.document` muss dauerhaft stabil bleiben.
- `classification.parentHouseId` verweist auf direkte Oberhäuser oder Hauptlinien.
- `classification.rootHouseId` verweist auf die oberste Linie.
- `hierarchy` dokumentiert den sichtbaren fachlichen Pfad.

## Keine HTML-Kopien

Neue konkrete Familien brauchen standardmaessig keine eigene HTML-Datei. Der Link bleibt:

```text
haus.html?haus=familie-jernigan
```

Nur bei einem bewusst abweichenden Layout sollte ein eigener Shell-Page-Typ ergaenzt werden.
