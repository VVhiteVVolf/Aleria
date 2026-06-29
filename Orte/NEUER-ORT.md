# Neuer Ort

Diese Struktur ist für viele spätere Orte gedacht. Neue Orte sollen nicht als kopierte Komplettseiten entstehen, sondern als Daten in einer nachvollziehbaren Welt-Hierarchie.

## Grundregel

Die zentrale Seite für Großstädte ist:

```text
/Orte/grossstadt.html?id=ORT-ID
```

Ein konkreter Ort bekommt:

- einen fachlichen Ordnerpfad
- eine eigene `ort.data.js`
- einen Eintrag in `orte.registry.js`
- eine stabile Orts-ID für Firebase und LocalStorage

## Ordnerstruktur

Die Ordner folgen der mittelalterlichen Hierarchie, nicht dem Dateityp.

```text
Orte/
  Koenigreich_Cenyr/
    Grafschaft_Name/
      Baronie_Name/
        Herrschaft_Name/
          Bannkreis_Name/
            Siedlung_Name/
              ort.data.js
              POI/
                Ortspunkt_Name/
                  ort.data.js
```

Tiefe Ebenen sind erlaubt, wenn sie fachlich sinnvoll sind:

```text
Königreich / Grafschaft / Baronie / Herrschaft / Bannkreis / Siedlung / POI
```

## Beispiel Lysfaen

Lysfaen ist als erster konkreter Ort angelegt:

```text
Orte/
  Koenigreich_Cenyr/
    Grafschaft_Celtigerns_Wacht/
      Baronie_Llamreis_Ankunft/
        Herrschaft_Haus_Wyrm/
          Lysfaens_Bannkreis/
            Lysfaen/
              ort.data.js
              POI/
                README.md
```

Bearbeitungslink:

```text
/Orte/grossstadt.html?id=lysfaen
```

Fachlicher Pfad:

```text
Königreich Cenyr > Grafschaft von Celtigerns Wacht > Baronie von Llamreis Ankunft > Herrschaft des Hauses Wyrm > Lysfaens Bannkreis > Lysfaen
```

## Registry

In `orte.registry.js` wird später ein neuer Eintrag nach diesem Muster ergänzt:

```js
{
  id: "stadtname",
  slug: "stadtname",
  name: "Stadtname",
  status: "draft",
  type: "kleinstadt",
  data: "Koenigreich_Cenyr/Grafschaft_Name/Baronie_Name/Herrschaft_Name/Bannkreis_Name/Stadtname/ort.data.js",
  sceneCollection: "orte_scenes",
  inlineCollection: "orte_inline_content",
  hierarchy: [
    { type: "Königreich", name: "Cenyr", slug: "cenyr" },
    { type: "Grafschaft", name: "Grafschaft", slug: "grafschaft" },
    { type: "Baronie", name: "Baronie", slug: "baronie" },
    { type: "Herrschaft", name: "Herrschaft", slug: "herrschaft" },
    { type: "Bannkreis", name: "Bannkreis", slug: "bannkreis" },
    { type: "Siedlung", name: "Stadtname", slug: "stadtname" }
  ],
  tags: ["orte", "kleinstadt", "cenyr", "stadtname"]
}
```

## Speicherung

Die Orts-ID muss dauerhaft stabil bleiben, weil sie alle editierbaren Inhalte trennt.

Für Lysfaen gilt:

- Direktbearbeitung: Firebase Collection `orte_inline_content`, Dokument `lysfaen`
- Ortsszenen: Firebase Collection `orte_scenes`
- Szenenindex: Dokument `lysfaen__scene-index`
- einzelne Szenen: Präfix `lysfaen__`
- lokale Sicherung: `aleria:orte:*:lysfaen`

POI innerhalb eines Ortes bekommen später eigene Unterordner und eigene IDs, zum Beispiel:

```text
Lysfaen/POI/Taverne_Zum_...
```

## Vorlage

Die aktuelle Großstadtbasis besteht aus:

- `grossstadt.html` als zentrale Seite
- `_template/GrosseStadtTemplate.html` als HTML-Vorlage
- `data/grossstadt-vorlage.data.js` als Datenbasis
- `assets/js/orte-loader.js` für Registry und Datenladen
- `assets/js/orte-grossstadt.js` für Rendering und Reiter
- `assets/css/orte-grossstadt.css` für den Pergamentstil
