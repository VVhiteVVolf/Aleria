# Venalys · Kartenwerkstatt und Gesellschaft

Die Vorbereitungsseite bleibt vom kanonischen Register getrennt. Die 22
vorhandenen Häuser und ihre 17 Magnarierbindungen werden durch die neuen
Karten und Ständeillustrationen nicht verändert. Mehrfachzuordnungen und
eigene Bezirksnamen bleiben lokale Entwürfe mit Import, Export und Undo.

## Stände vom 4. November 2026

Fünf eigene Comicillustrationen zeigen Patrizier, Magnarierhaus, Mercantier,
Plebejer und Advena. Die aktuellen Fakten stehen in `sources/estate-facts.json`;
`scripts/build-estate-catalog.mjs` erzeugt den kompakten Runtimekatalog.
Mercantier sind ausdrücklich nicht adlig und dienen Magnariern oder direkt
Patriziern. Advena bilden keine feste unterste Schicht: Partner, Geschäftsleute,
Geflüchtete und reiche Händler bringen unterschiedliche Voraussetzungen mit.
Die gemeinsame Illustration zeigt zwei gleichwertige Ankömmlinge, keine
behaupteten benannten Personen. Alle müssen sich in Venalys beweisen.

Die Bilder entstanden mit dem eingebauten **ImageGen**. Vollständige Prompts,
tatsächlich verwendete Leukonia-Stilreferenzen und Herkunftsbelege stehen in
`sources/estates-{a,b}-{jobs,results}.json`. Der ausdrücklich gewünschte flache
Comicstil mit großen Köpfen, braunen Konturen und warmen Farbflächen gilt nur
für diese Stände; bestehende Hauskrieger bleiben unverändert.

Tooloriginale sind byteidentisch unter `assets/estates/generated/` erhalten;
aktive PNGs liegen in `assets/estates/production/`, WebP-Vorschauen unter
`assets/estates/previews/`. Der dünne Adapter `scripts/prepare-estates.py`
verwendet die vorhandene gemeinsame RGB-erhaltende Alpha-Aufbereitung über
`Vorschau/shared/warrior-artifacts/category.py`. Fünf Bilder bestanden deren
Original-, Farb-, Transparenz- und Randprüfung ohne Fehler oder Warnungen.

Die kulturfreie Karten-/Großansicht für Stände liegt in
`Vorschau/shared/country-workbench/estate-view.mjs`, ihre Styles in
`estate-cards.css`. Solestia verwendet dieselbe Darstellung. Die Venalys-
Hausfenster verwenden den gemeinsamen Modal-Lifecycle; Ständetypen besitzen
keine Sitzzuordnung, Hausfenster behalten ihre Zuordnungsaktion.

## Neue Karten

Quelle: `C:/Users/fhg_r/Downloads/Venalys/Alternative Maps`.
Die erneute Vermessung, Ortsinventur und Zuordnung zur älteren Karte stehen
mit den Quellprüfsummen unter `sources/`. Die früheren Karten und Belege bleiben
als historische Quellen erhalten. Nur tatsächlich auf der neuen Karte sichtbare
Bauten erhalten Marker; alte Entwurfsverbindungen werden nicht still gelöscht.

Die neue Geometrie beträgt 6144 × 3524 Pixel. Alle 13 Bezirks-IDs bleiben erhalten;
ihre Anker und Polygone sind neu gemessen. 98 kartierte Außenorte und vier
unkartierte frühere Türme ergeben 102 erhaltene beziehungsweise neue POI-IDs.
Die 78 alten IDs/Namen bleiben erhalten, 24 neue Ziele kommen hinzu. Alte
vollständige v1-Entwürfe ergänzen die neuen Ziele leer und behalten ihre eigenen
Bezirksnamen und Mehrfachzuordnungen. Zugeordnete alte Türme erscheinen in einer
separaten Liste ohne falschen Kartenmarker.

Neue Ortsvorschläge: Avelano, Cerenza, Pavello, Vestara, Lorento, Narvella,
Elvanto, Dorvessa, Calvessa und Orseta; die vier größeren Küstenensembles heißen
Marentia, Corvenza, Altavero und Feressa. Neun bestehende Dorfnamen und ein
neutraler Tavernentyp sind passend zur neuen Verteilung versetzt. Die genaue
Zuordnung bleibt unter `sources/map-revision-20261104/` nachvollziehbar.

## Prüfung und Veröffentlichung

`Vorschau/tests/venalys-estates.test.mjs` prüft die fünf Stände, die Advena-
Sonderstellung, die fünf Großansichten, das bestehende Hausfenster und die
Abgrenzung zwischen öffentlichen Bildern und nicht ausgelieferten Quellen.
Die Karten-/Entwurfstests liegen ebenfalls unter `Vorschau/tests/`.
Die gemeinsame Prüfung von Venalys, Solestia, Sylvarant, Calidaria und den
vier zugehörigen Veröffentlichungsgrenzen bestand mit 69/69 Tests. Venalys'
HTTP-Audit bestätigt die Seite, 29 transitive Runtime-/CSS-/JSON-Dateien und
131 öffentliche Ressourcen ohne Fehler; Serverbytes stimmen mit den Dateien
überein. Der lokale Vorschau-Server meldet WebP-Dateien als
`application/octet-stream`; ihre Inhalte und Dateiendungen sind korrekt.
Zusätzliche Bild- und HTTP-Belege werden unter `diagnostics/venalys-20261104/`
aufbewahrt. Ein Browser-Pass wird ohne erfolgreiche tatsächliche Sichtprüfung
nicht behauptet; der bekannte CUA-`timeoutMs`-Verbindungsfehler bleibt dokumentiert.

Nutzerfreigabe: Nach Abschluss gemeinsam mit allen lokalen öffentlichen
Neuerungen pushen und deployen. Private Inhalte bleiben ausschließlich in den
vollständigen lokalen Arbeitsquellen. Der bestehende geprüfte Releaseweg
gilt für die separate öffentliche Projektion.
