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

Die normalisierte `id` ist die stabile Dokument-ID für lokale Entwürfe und GitHub-Veröffentlichungen.

Vorlagen verwenden dieselbe Regel. Die Grafschaftsvorlage ist registriert als:

```text
id: grafschaft-vorlage
page: _template/GrafschaftTemplate.html
data: data/grafschaft-vorlage.data.js
contentData: published/grafschaft-vorlage/data.json
```

## GitHub-Veröffentlichung

Jeder Registry-Eintrag besitzt zusätzlich zu seinem statischen `data`-Skript
einen eigenen `contentData`-Pfad. `data` beschreibt weiterhin die Seite und
ihre Grundstruktur; `contentData` enthält ausschließlich den veröffentlichten
Stand der Direktbearbeitung.

Änderungen werden zunächst lokal gespeichert. Der gemeinsame Inline-Editor
zeigt dafür `Online speichern` an und veröffentlicht den Entwurf anschließend
über `world-content-publisher.mjs` nach GitHub. Die Datendatei besitzt eine
Revision, sodass ein neuerer GitHub-Stand nicht still überschrieben wird.

## Firebase-Übergangsimport

Solange eine `contentData`-Datei noch `state: null` enthält, darf
`kontinente-storage.js` eine bestehende Exportdatei oder den früheren
Firestore-Stand ausschließlich lesend als Ausgangsentwurf übernehmen. Neue
Änderungen werden nicht mehr nach Firebase geschrieben. Nach erfolgreicher
GitHub-Veröffentlichung ist der Firebase-Fallback für diese Seite wirkungslos.

Die GitHub-Datei enthält denselben Inline-Payload wie Orte und Gruppen:

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

Bilder liegen aktuell noch als externe URL oder Base64 im Inline-Payload. Große Dateien sollen langfristig als versionierte Assets oder über einen dafür vorgesehenen Medien-Publisher gespeichert werden:

```text
kontinente/{kontinent-id}/images/{image-key}.{ext}
```

Tabellen werden aktuell als HTML gespeichert. Das ist für die alten Königreichstabellen sinnvoll, weil sie sehr frei aufgebaut sind. Für stabile neue Tabellen kann später ein strukturierter Modus ergänzt werden.
