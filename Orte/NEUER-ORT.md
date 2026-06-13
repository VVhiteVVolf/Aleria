# Neuer Ort

Diese Struktur ist fuer viele spaetere Orte gedacht. Neue Orte sollen nicht als kopierte Komplettseiten entstehen, sondern als Daten in einer nachvollziehbaren Welt-Hierarchie.

## Grundregel

Die zentrale Seite fuer Großstaedte ist:

```text
/Orte/grossstadt.html?id=ORT-ID
```

Ein konkreter Ort bekommt:

- einen fachlichen Ordnerpfad
- eine eigene `ort.data.js`
- einen Eintrag in `orte.registry.js`

## Ordnerstruktur

Die Ordner folgen der mittelalterlichen Hierarchie, nicht dem Dateityp.

```text
Orte/
  Land/
    Cenyr/
      Grafschaft/
        Baronie/
          RitterlicheHerrschaft/
            SiedlungX/
              ort.data.js
              POI/
                OrtspunktY/
                  ort.data.js
```

Tiefe Ebenen sind erlaubt, wenn sie fachlich sinnvoll sind:

```text
Koenigreich / Grafschaft / Baronie / Ritterliche Herrschaft / Siedlung / POI
```

## Registry

In `orte.registry.js` wird spaeter ein neuer Eintrag nach diesem Muster ergaenzt:

```js
{
  id: "cenyr-grafschaft-baronie-herrschaft-stadtname",
  slug: "stadtname",
  name: "Stadtname",
  status: "draft",
  type: "grossstadt",
  data: "Land/Cenyr/Grafschaft/Baronie/RitterlicheHerrschaft/Stadtname/ort.data.js",
  hierarchy: [
    { type: "Koenigreich", name: "Cenyr", slug: "cenyr" },
    { type: "Grafschaft", name: "Grafschaft", slug: "grafschaft" },
    { type: "Baronie", name: "Baronie", slug: "baronie" },
    { type: "Ritterliche Herrschaft", name: "Herrschaft", slug: "herrschaft" }
  ],
  tags: ["cenyr", "grossstadt"]
}
```

## Vorlage

Die aktuelle Großstadtbasis besteht aus:

- `grossstadt.html` als zentrale Seite
- `_template/GrosseStadtTemplate.html` als HTML-Vorlage
- `data/grossstadt-vorlage.data.js` als Datenbasis
- `assets/js/orte-loader.js` fuer Registry und Datenladen
- `assets/js/orte-grossstadt.js` fuer Rendering und Reiter
- `assets/css/orte-grossstadt.css` fuer den Pergamentstil
