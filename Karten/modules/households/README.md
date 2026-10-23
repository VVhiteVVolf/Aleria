# Familienwappen auf Karten

Die gemeinsame Karten-Shell lädt `household-overlay.mjs`. Der Schalter **Wappen**
ist eine persönliche Ansichtseinstellung (`aleria.karto.household-crests` im
lokalen Browser), unabhängig von Rasterebenen und Kartenveröffentlichungen.
Im Bearbeitungsmodus bleibt die Wappenebene verborgen, damit sie keine Marker
oder Regionspunkte beim Verschieben verdeckt.

## Zuordnung und Kartenmaßstab

- Haupt- und Nebensitze aus der bestehenden Familienregistry erscheinen am
  gleichnamigen, eindeutigen Ortsmarker innerhalb des passenden Reichs und
  gegebenenfalls der Grafschaft. Mehrere Familien bilden eine gemeinsame Gruppe.
  Abweichende Worttrennung wie „Castell Bryn“/„Castellbryn“ wird nur dann über
  den vorhandenen Herrschaftssitz aufgelöst, wenn der Marker dieser Herrschaft
  bereits zugeordnet ist; andere Orte derselben Herrschaft bleiben unberührt.
- Eine Stadtzuordnung wird niemals auf sämtliche Höfe ihres Bannkreises übertragen.
- Lokale Familienanwesen werden aus geprüften Markerzuordnungen und ausdrücklich
  nach einer verknüpften Familie benannten Orten erkannt. Die bloße Zugehörigkeit
  zu einem Herrschaftsgebiet reicht nicht aus. Beschreibungstexte werden nicht
  nach beiläufig erwähnten Familien durchsucht.
- `pin.residentFamilyIds: string[]` überschreibt die Ableitung für genau diesen
  Marker. Eine leere Liste unterdrückt die Wappen an diesem Ort. Fehlt das Feld,
  gelten die vorhandenen Sitze und geprüften Zuordnungen. Unbekannte IDs werden
  nicht angezeigt und niemals durch angenommene Familien ersetzt.
- Unter **Marker bearbeiten → Zugehörigkeit → Familien an diesem Ort** lässt
  sich diese feste Liste pflegen oder wieder auf Ableitung zurückstellen. Die
  Auswahl bleibt bis „Pin übernehmen“ im normalen isolierten Editorentwurf.

Am belegten Verwaltungssitz einer Herrschaft ergänzt **Region +…** deren
Häuserverzeichnis. Konkrete Sitze an anderen Markern, noch offene Sitze und
ehemalige/entmachtete Häuser sind getrennt beschriftet. Die Wappen mit Linien
bleiben den tatsächlich zugeordneten Orten vorbehalten; regionale Zugehörigkeit
allein erzeugt keine Behauptung über einen Wohnsitz in der Verwaltungsstadt.

Die Angaben `HOUSE_CONTENT.extinct` und `HOUSE_CONTENT.profile.seat` aus den
vorhandenen Hausseiten ergänzen die Registry. Deren Datensatzstatus `active`
bezeichnet eine verfügbare Akte und bedeutet ausdrücklich nicht, dass ein Haus
heute noch besteht oder sein früheres Lehen beherrscht. Historische Sitze werden
nicht automatisch als heutige Familiensitze angezeigt. Neu zugesprochene Lehen
erscheinen als solche, ohne eine bereits erfolgte Besiedlung zu behaupten.

Geheime Marker bleiben außerhalb des Editors geheim; die aktive Kategorie gilt
auch für Wappen. Die Wappenebene benötigt weder eingeschaltete Map-Pin-Symbole
noch die Rasterebene „Markierungen“. Maus, Tastatur und Touch können eine
Familienliste öffnen; ihre Links führen zu vorhandenen Familienakten.

## Verantwortlichkeiten

- `household-model.mjs`: Quellenvertrag, Sitze und Markerzuordnung; keine DOM-Zugriffe.
- `household-layout.mjs`: kollisionsarme Positionen in sichtbaren Bildschirmpixeln.
- `household-regions.mjs`: vollständige regionale Übersicht am belegten Verwaltungssitz.
- `household-family-list.mjs`: Familienlisten mit aktuellem Orts- und Rechtsstatus.
- `household-layer.mjs`: Wappen, Verbindungslinien und zugängliche Ortsliste.
- `household-editor.mjs`: gekapseltes Zuordnungsfeld, Änderungen per Callback an den Pin-Editor.
- `household-catalog.mjs`: gemeinsamer verzögerter Ladevorgang mit Wiederholungsmöglichkeit.
- `household-overlay.mjs`: Schalter, Ansichtseinstellung und Kartenereignisse.

Der Pin-Renderer meldet `aleria:karto:pins-rendered`; der Editor bietet über
`aleria:karto:pin-residents-editor` einen DOM-Slot, einen unverändernden Snapshot
und einen Callback für seinen eigenen Entwurf an. Keine globale Familiensuche,
kein Firebase-Zugriff und keine Mutation der Stammbaumdaten im Browser.

## Register aktualisieren und prüfen

```sh
node Karten/tools/build-households.mjs
node Karten/tools/build-households.mjs --check
node --test --experimental-test-isolation=none Karten/tests/households.test.mjs
```

`households.generated.json` enthält ausschließlich Namen, Wappenverweise,
Familienlinks und Ortszuordnungen aus `FAMILY_REGISTRY` sowie vorhandene geprüfte
`house-affiliation-review.json`-Listen und Metadaten der registrierten Hausseiten.
`tools/household-sources.mjs` liest diese Hausseiten für den Generator. Personen und Stammbäume werden nicht in
die Karte geladen. Der Generator verändert keine Karten-, Familien- oder
Herrschaftsdaten. Nach Änderungen an Familiennamen oder Sitzen neu ausführen.
