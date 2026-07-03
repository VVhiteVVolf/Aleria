# Gruppen-Speicherung

Dieses Dokument beschreibt, wie Organisationen und Gruppen lokal und in Firebase gespeichert werden.

## Grundregel

Jede Gruppe braucht eine eindeutige `id` im `gruppen.registry.js`.

Beispiel:

```js
{
  id: "schwarzfische-i-trupp",
  name: "Schwarzfische I. Trupp",
  page: "kleingruppe.html",
  data: "Gilden/Windreiter/Windreiter-Estryll/Schwarzfische/Schwarzfische_I_Trupp/gruppe.data.js",
}
```

Diese `id` wird normalisiert und ist die Basis für alle Speicherorte.

## Firebase

### Direktbearbeitung

```text
Collection:
organisationen_und_gruppen_inline_content

Dokument:
{gruppen-id}
```

Beispiel:

```text
organisationen_und_gruppen_inline_content/schwarzfische-i-trupp
```

Das Dokument enthält:

```js
{
  id: "schwarzfische-i-trupp",
  type: "gruppen-inline-content",
  schemaVersion: 1,
  data: "{...}",
  updatedAtClient: 123456789,
  updatedAt: serverTimestamp()
}
```

Das Feld `data` ist ein JSON-String mit:

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

### Szenen

Falls Gruppen später Szenenmodule nutzen:

```text
Collection:
organisationen_und_gruppen_scenes

Szenenindex:
{gruppen-id}__scene-index

Einzelne Szene:
{gruppen-id}__{scene-id}
```

## LocalStorage

Gruppen verwenden den Namespace `aleria:gruppen`.

```text
aleria:gruppen:inline-content:v2:{gruppen-id}
aleria:gruppen:inline-reset:{gruppen-id}
aleria:gruppen:inline-status-position:{gruppen-id}
aleria:gruppen:scene-index:{gruppen-id}
aleria:gruppen:scene-index-meta:{gruppen-id}
aleria:gruppen:session-module:{gruppen-id}:{scene-id}
aleria:gruppen:session-module-meta:{gruppen-id}:{scene-id}
aleria:gruppen:comments:gruppen:{gruppen-id}:{scene-id}
```

Alte lokale Gruppenstände unter `aleria:orte:inline-content:*:{gruppen-id}` werden noch gelesen. Sobald neu gespeichert wird, schreibt der Editor in `aleria:gruppen:*`.

## Seitenwahl

Große Gruppen:

```js
page: "gruppe.html"
```

Kleine Gruppen:

```js
page: "kleingruppe.html"
```

Wenn `page` fehlt, wird `gruppe.html` verwendet.

## Risiken

- `id`-Kollisionen sind möglich, wenn zwei IDs nach Normalisierung gleich werden.
- Bilder liegen aktuell noch im Inline-Payload. Große Base64-Bilder können Firestore-Dokumente stark vergrößern.
- Tabellen werden aktuell als HTML gespeichert. Das ist flexibel, aber weniger robust als strukturierte Tabellenobjekte.

## Bildspeicherung: geplanter sauberer Ausbau

Bilder sollten langfristig nicht im Firestore-Dokument selbst liegen.

Zielstruktur:

```text
Firebase Storage:
gruppen/{gruppen-id}/images/{image-key}.{ext}

Firestore Inline Payload:
images[imageKey] = {
  src: "storage://gruppen/{gruppen-id}/images/{image-key}.webp",
  alt: "...",
  href: "",
  width: 100,
  maxHeight: 360,
  format: "portrait",
  fit: "contain"
}
```

Saubere Umsetzungsschritte:

1. Firebase-Storage-Regeln für Gruppen definieren.
2. Upload-UI im Inline-Bildpanel ergänzen.
3. Bestehende externe URLs unverändert lassen.
4. Neue lokale Uploads nach Storage schreiben.
5. Optionales Migrationsskript für große Base64-Bilder bauen.

## Tabellen: optionaler strukturierter Ausbau

Aktuell:

```js
tables[tableId] = "<tr>...</tr>"
```

Langfristiges Ziel für wichtige Tabellen:

```js
tables[tableId] = {
  mode: "structured",
  columns: [...],
  rows: [...]
}
```

Das sollte nur für stabile Tabellenmodelle passieren. Freie Vorlagentabellen bleiben besser HTML-basiert, weil sie bewusst stark editierbar sind.
