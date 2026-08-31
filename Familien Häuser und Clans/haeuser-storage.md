# Häuser-Speicherung

Dieses Dokument beschreibt, wie Familien, Häuser und Clans lokal und als versionierte GitHub-Daten gespeichert werden.

## Grundregel

Jedes Haus braucht eine eindeutige `id` in `haeuser.registry.js`.
Die Vorlage bestimmt nur die Shell: `haus.html` fuer groessere Haeuser, `kleinehaeuser.html` fuer kleinere Haeuser und Clans. Die Speicher-ID bleibt immer die jeweilige Registry-ID.

Beispiel:

```js
{
  id: "familie-jernigan",
  name: "Familie Jernigan",
  data: "Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Herrschaft_der_Wyrm/Llysfaen/Familie_Jernigan/haus.data.js",
}
```

Diese `id` wird normalisiert und ist die Basis für alle Speicherorte.

## GitHub-Veröffentlichung

Jeder Registry-Eintrag besitzt einen eindeutigen `contentData`-Pfad unter
`published/<haus-id>/data.json`. Die statische `data`-Datei bleibt die
Grundlage der Seite; `contentData` enthält den veröffentlichten Stand der
Direktbearbeitung.

Änderungen werden zunächst lokal gesichert. `Online speichern` veröffentlicht
sie über den gemeinsamen World-Content-Publisher mit Revisionsprüfung. Der
frühere Firestore-Zugriff ist nur noch ein dynamisch geladener read-only
Übergangsimport, solange noch keine GitHub-Fassung vorhanden ist.

### Direktbearbeitung

```text
Collection:
familien_haeuser_und_clans_inline_content

Dokument:
{haus-id}
```

Beispiel:

```text
familien_haeuser_und_clans_inline_content/familie-jernigan
```

Das Dokument enthaelt:

```js
{
  id: "familie-jernigan",
  type: "haeuser-inline-content",
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

Falls Häuser später Szenenmodule nutzen:

```text
Collection:
familien_haeuser_und_clans_scenes

Szenenindex:
{haus-id}__scene-index

Einzelne Szene:
{haus-id}__{scene-id}
```

## LocalStorage

Häuser verwenden den Namespace `aleria:haeuser`.

```text
aleria:haeuser:inline-content:v2:{haus-id}
aleria:haeuser:inline-reset:{haus-id}
aleria:haeuser:inline-status-position:{haus-id}
aleria:haeuser:scene-index:{haus-id}
aleria:haeuser:scene-index-meta:{haus-id}
aleria:haeuser:session-module:{haus-id}:{scene-id}
aleria:haeuser:session-module-meta:{haus-id}:{scene-id}
aleria:haeuser:comments:haeuser:{haus-id}:{scene-id}
```

## Bildspeicherung: geplanter Ausbau

Große Bilder sollen langfristig als versionierte Assets oder über einen
eigenen Medien-Publisher gespeichert werden. Im Inhaltszustand bleibt nur die
Referenz:

```text
Repository-Asset:
Familien Häuser und Clans/assets/uploads/{haus-id}/{image-key}.{ext}

Inline-Payload:
images[imageKey] = {
  src: "assets/uploads/{haus-id}/{image-key}.webp",
  alt: "...",
  href: "",
  width: 100,
  maxHeight: 360,
  format: "portrait",
  fit: "contain"
}
```

## Tabellen: optionaler strukturierter Ausbau

Aktuell:

```js
tables[tableId] = "<tr>...</tr>"
```

Langfristiges Ziel für feste Tabellen:

```js
tables[tableId] = {
  mode: "structured",
  columns: [...],
  rows: [...]
}
```

Freie Stammbaum- und Historienbereiche bleiben besser HTML-basiert, weil sie stark editierbar sein muessen.
