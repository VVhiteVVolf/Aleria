# Item- und Gueterdatenbank

## Ziel

Die Item- und Gueterdatenbank wird eine eigenstaendige Verwaltung innerhalb des Aleria Almanachs. Sie ist kein Modul und keine einzelne Seite, sondern eine zentrale Datenquelle fuer Waren, Tiere, Ausruestung, Waffen, Speisen, Getraenke und aehnliche Objekte, die in Modulen und Marktseiten vorkommen.

Langfristig sollen Warenregister, Handelsgutregister, Charakterinventar und Shops auf diese Datenbank zugreifen koennen, um vorhandene Objekte zu uebernehmen statt sie erneut per Hand anzulegen.

## Architektur

Feature-Ordner:

```text
AleriaAlmanach/modules/item-database/
  item-db-normalizer.js
  item-db-extractors.js
  item-db-store.js
  item-db-ui.js
```

CSS:

```text
AleriaAlmanach/styles/item-database.css
```

Die Datenbank besitzt eigene Verantwortlichkeiten:

- Item-Normalisierung
- Dublettenerkennung
- Quellenextraktion
- lokale Korrekturen
- Tabellen- und Detailansicht
- spaetere KI-Unterstuetzung

Sie darf nicht direkt in Warenregister, Handelsgutregister oder Charakterinventar eingebaut werden. Diese Systeme sind spaeter Konsumenten der Datenbank.

## Datenmodell

Jedes Item wird intern in eine stabile Struktur ueberfuehrt:

```js
{
  id: 'item-waffen-langschwert',
  canonicalKey: 'waffen:langschwert',
  title: 'Langschwert',
  category: 'waffen',
  categoryLabel: 'Waffen',
  type: 'Waffe',
  description: '...',
  details: '...',
  price: '12 Gold',
  currency: 'Gold',
  image: 'https://...',
  tags: ['Klinge', 'Nahkampf'],
  attributes: [{ label: 'Schaerfe', value: 7 }],
  sourceRefs: [
    {
      kind: 'goods-register',
      moduleId: '...',
      moduleTitle: '...',
      pageTitle: '...',
      tableTitle: '...',
      rowIndex: 0
    }
  ],
  hiddenMeta: {
    originalCategory: '...',
    sourceType: '...',
    availability: '...'
  },
  updatedAt: 1781970000000
}
```

## Quellen

### Phase 1: Aleria Almanach Module

Diese Quellen werden zuerst gelesen:

- Warenregister (`goodsTablePage`)
- Handelsgutregister (`tradeCatalogPage`)

Die Module werden nur gelesen. Es wird nichts in den Modulstore zurueckgeschrieben.

### Phase 2: Markt-Ordner

Die erste Markt-Anbindung laedt diese Quellen dynamisch, sobald die Datenbank geoeffnet oder neu gescannt wird:

- `Markt/Taverne/data/tavern-data.js`
- `Markt/Viehmarkt/data/livestock-data.js`
- `Markt/Alchemist/data/alchemy-data.js`
- `Markt/Arkanist/data/arcane-data.js`
- `Markt/Schwarzmarkt/data/blackmarket-data.js`
- `Markt/Gemischtwarenhaendler/data/goods-data.js`
- `Markt/WaffenRuestungen/data/shop-data.js`
- `Markt/Rossmarkt/data/kontext-pferde.js`

Die meisten Quellen verwenden strukturierte `items`-Arrays und werden ueber einen gemeinsamen Adapter normalisiert. Der Rossmarkt ist ein Markdown-Kontext und wird gesondert aus Tabellenzeilen ausgelesen.

## Dublettenerkennung

Vor KI-Einsatz wird technisch normalisiert:

- Titel trimmen
- Umlaute vereinheitlichen
- Sonderzeichen entfernen
- Kategorie bestimmen
- kanonischen Schluessel bilden

Beispiel:

```text
Speisen + "Eintopf des Tages" -> speisen:eintopf-des-tages
```

Wenn mehrere Quellen denselben Schluessel erzeugen, werden sie zusammengefuehrt. Keine Quelle wird geloescht; alle Herkunftsstellen bleiben unter `sourceRefs` erhalten.

## KI-Schicht

Die KI soll spaeter nur assistieren:

- Kategorien vorschlagen
- aehnliche Items erkennen
- Dubletten-Vorschlaege machen
- Beschreibung bereinigen
- Metadaten extrahieren

Wichtig: Die KI darf Dubletten nicht automatisch loeschen oder zusammenfuehren. Sie erstellt Vorschlaege, die vom Nutzer bestaetigt werden.

## UI-Konzept

Linke Almanach-Sidebar:

- Icon `IconOrdner/ReiterIcons/Markt.png`
- Titel `Items und Güter`
- erster Reiter `Güter`

Hauptansicht:

- grosse Tabellenansicht
- Kategorie-Reiter: Alle, Waffen, Ruestungen, Speisen, Getraenke, Vieh, Pferde, Alchemie, Arkanes, Werkzeuge, Sonstiges
- Suchfeld
- Item-Bild mit `object-fit: contain`
- Titel
- Kurzbeschreibung
- Preis
- Quellenanzahl
- versteckte Metadaten im Detailbereich

Bearbeitung:

- Titel
- Kategorie
- Typ
- Beschreibung
- Preis
- Bild
- Tags
- lokale Korrektur speichern

Phase 1 speichert Korrekturen lokal im Browser. Firebase-Speicherung wird erst eingefuehrt, wenn die Groesse und Struktur stabil sind.

## Spaetere Integration

Warenregister und Handelsgutregister bekommen spaeter:

- `Aus Itemdatenbank übernehmen`
- Suche und Filter
- Item in Zeile einsetzen
- optional nur Kopie
- optional echte Verknuepfung auf Datenbankeintrag

## Umsetzungsschritte

1. Dokumentation und Feature-Ordner anlegen.
2. Sidebar-Einstieg und Basis-Panel bauen.
3. Warenregister und Handelsgutregister extrahieren.
4. Normalisierung und Dublettenlogik einfuehren.
5. Lokale Korrekturen in `localStorage` speichern.
6. Markt-Adapter schrittweise vertiefen, sobald weitere Spezialfelder in der UI gebraucht werden.
7. KI-Klassifizierung und Dubletten-Vorschlaege ergaenzen.
8. Uebernahmefunktion fuer Warenregister/Handelsgutregister bauen.
9. Firebase-Speicherung erst nach Stabilisierung aktivieren.
