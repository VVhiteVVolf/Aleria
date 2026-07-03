# Kontinente-Speicherung

Kontinente, Königreiche und ähnliche Großräume verwenden dieselbe Inline-Bearbeitung wie Orte und Gruppen, aber mit eigenem Speicherbereich.

## Registry

Jeder Eintrag steht in `kontinente.registry.js` und braucht eine eindeutige `id`.

Beispiel:

```js
{
  id: "koenigreich-cenyr",
  name: "Das Königreich von Cenyr",
  page: "Estryll/Königreich Cenyr/Königreich von Cenyr.html",
  data: "Estryll/Königreich Cenyr/koenigreich.data.js",
}
```

Die normalisierte `id` ist die Dokument-ID für lokale Speicherung und Firebase.

Vorlagen verwenden dieselbe Regel. Die Grafschaftsvorlage ist registriert als:

```text
id: grafschaft-vorlage
page: _template/GrafschaftTemplate.html
data: data/grafschaft-vorlage.data.js
Firebase-Dokument: kontinente_inline_content/grafschaft-vorlage
```

## Firebase

Direktbearbeitung:

```text
Collection:
kontinente_inline_content

Dokument:
{kontinent-id}
```

Beispiel:

```text
kontinente_inline_content/koenigreich-cenyr
```

Das Dokument enthält `type: "kontinente-inline-content"` und im Feld `data` denselben Inline-Payload wie Orte und Gruppen:

```js
{
  contentSchemaVersion: 2,
  texts: {},
  tables: {},
  ratings: {},
  images: {},
  hiddenSections: {}
}
```

Szenenmodule verwenden später:

```text
kontinente_scenes/{kontinent-id}__scene-index
kontinente_scenes/{kontinent-id}__{scene-id}
```

## LocalStorage

Kontinente verwenden den Namespace `aleria:kontinente`.

```text
aleria:kontinente:inline-content:v2:{kontinent-id}
aleria:kontinente:inline-reset:{kontinent-id}
aleria:kontinente:inline-status-position:{kontinent-id}
aleria:kontinente:scene-index:{kontinent-id}
aleria:kontinente:scene-index-meta:{kontinent-id}
aleria:kontinente:session-module:{kontinent-id}:{scene-id}
aleria:kontinente:session-module-meta:{kontinent-id}:{scene-id}
aleria:kontinente:comments:kontinente:{kontinent-id}:{scene-id}
```

Alte lokale Stände unter `aleria:orte:inline-content:*:{kontinent-id}` werden noch gelesen und beim nächsten Speichern in `aleria:kontinente:*` geschrieben.

## Bilder und Tabellen

Bilder liegen aktuell noch als externe URL oder Base64 im Inline-Payload. Langfristig sollten große Uploads in Firebase Storage verschoben werden:

```text
kontinente/{kontinent-id}/images/{image-key}.{ext}
```

Tabellen werden aktuell als HTML gespeichert. Das ist für die alten Königreichstabellen sinnvoll, weil sie sehr frei aufgebaut sind. Für stabile neue Tabellen kann später ein strukturierter Modus ergänzt werden.
