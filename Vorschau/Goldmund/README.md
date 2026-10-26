# Goldmund · temporäre Vorbereitungs- und Besprechungsseite

Einstieg: `index.html`. Die eigenständige Seite entwickelt die gelieferte
Goldmund-Karte als besprechbaren Entwurf: drei Grafschaften, acht einzelne
Regionen, elf eigene Banner, zehn gelieferte Häuser, elf neue Hausvorschläge
und vier auswählbare Fürstentumswappen. Insgesamt sind 21 Häuser und 29 neue
Bildmotive enthalten: 18 Kreiswappen (elf neue Häuser, drei Überarbeitungen,
vier Fürstentumsvorschläge) sowie elf Banner. Neue Namen, Motive und Rollenansätze
sind ausdrücklich Vorschläge. Die Seite schreibt weder kanonische Register
noch Firebase-Daten.

Goldveld als Fürstenfamilie und Roden als Ritterfürstenfamilie sind gemäß
Nutzervorgabe fest in Thronholt gesetzt. Die übrigen 19 Häuser beginnen ohne
Sitz und erhalten durch Verschieben keinen zusätzlichen Rang. Hochreuth wird
nicht ergänzt; seine alte Burg ist auf dieser Karte nicht verortet.

`realm-data.mjs` besitzt die Grafschaften, Regionen, Ortskoordinaten und
Wappenauswahl. `source-houses.mjs` beschreibt die gelieferten und vorgeschlagenen
Häuser. Die Seite verwendet die gemeinsame Kartenansicht und die gemeinsame
Placement-Engine unter `../shared/`; sie dupliziert keine Zuordnungslogik.
`proposal-render.mjs` rendert die featurebezogenen Ansichten,
`proposal-page.mjs` verbindet delegierte Ereignisse mit State und Darstellung.

`design-state.mjs` komponiert die gemeinsame Zuordnungs-Engine mit
Grafschafts-/Regionsnamen, gemeinsamem Landschaftsnamen und Wappenauswahl.
Rücknahme, Ausgangsstand und JSON-Import/-Export umfassen den gesamten Entwurf.
Ein Import wird vollständig validiert, bevor er den aktuellen Entwurf ersetzt.
Fest gesetzte Thronholt-Zuordnungen lassen sich auch durch Import nicht lösen.
Persönliche Änderungen liegen unter dem eigenen Browser-Schlüssel
`aleria:proposal:goldmund:draft:v1`.

Die Ergänzung um de Waelmont, van Aerenwyck, Veldraedt, Vaelsteyn und van Breughen besitzt
eine eng begrenzte Migration: Ein vollständiger ursprünglicher Entwurf mit
genau den früheren 16 Haus-IDs erhält diese fünf neuen Häuser mit offenem Sitz.
Vorhandene Namen, Wappenauswahl und Hauszuordnungen bleiben erhalten. Das gilt
für Browserstände und JSON-Importe. Andere unvollständige oder unbekannte
Hauslisten werden weiter abgelehnt; alle festen Sitzregeln bleiben verbindlich.

Freie Wappen lassen sich mit Maus oder Stift ziehen. Auswahlbuttons und die
Haus-/Ortslisten bieten denselben Weg für Tastatur und Touch. Die Kartenpins
liegen neben den gelieferten Beschriftungen; Linien führen zum jeweiligen Ort.
Die Karte behält ihre eingebrannten Ortsnamen. Grafschafts- und Regionsnamen
sind über eigene Namenseditoren veränderbar.

`assets/originals/` enthält die unveränderten Lieferdateien; `assets.source.json`
dokumentiert Quellen, Abmessungen und Prüfsummen. Aktive Hauswappen liegen unter
`assets/crests/`, Regions- und Grafschaftsbanner unter `assets/banners/`, die vier
Fürstentumsentwürfe unter `assets/realm/`. Das gelieferte Fürstentumswappen bleibt
als Vergleich unter `assets/source-realm.webp` erhalten. Die ursprünglichen
Wappen von Roden, Goldveld und Lanette sind im sichtbaren Vergleich verlinkt.

Die Farbkorrektur des Nutzers verteilt die Hauptfarben auf Gold, Silber,
Bronze, Schwarz und satte Farbfelder. Insbesondere de Veyr und Rheynvaert
verwenden schwarze Wappentiere, Veylenbroeck einen silbernen Kelch und van Velhaeren
einen saphir-/petrolblauen Pfau. Goldvelds Löwe und Lanettes Reiter bleiben
gemäß Motivvorgabe golden. Der Doppeladler ist schwarz; der Fürstentumskelch
ist silbern. Die Namens-IDs bleiben zur Stabilität vorhandener Entwürfe erhalten.

Großansichtslinks neuer und überarbeiteter Bilder zeigen auf die technischen
Produktionsfassungen unter `assets/production/{id}.png`. Die aktive Seite nutzt
deren WebP-Anzeigen; die rohen Generatorfassungen unter `assets/generated/`
bleiben als Archiv getrennt erhalten. Gelieferte Hausoriginale bleiben unter
`assets/originals/houses/` erreichbar.

Die elf neuen Namen folgen der aktualisierten Nutzervorgabe: flämisch-
niederländisch geprägte Fantasy-Familiennamen mit einem deutschen Einschlag.
Alle bleiben Namensvorschläge. Anzeigenamen und interne IDs sind bewusst
getrennt; die früheren Motiv-IDs und sämtliche Assetpfade bleiben stabil, damit
gespeicherte Entwürfe und exportierte Hauszuordnungen weiterhin funktionieren.

| Anzeigename | Stabile Haus-ID |
| --- | --- |
| van Aelrath | `aurelshain` |
| Vossendael | `gueldenfels` |
| de Veyr | `falkengold` |
| Veylenbroeck | `rebenkron` |
| van Velhaeren | `seidenwarth` |
| Rheynvaert | `greifenau` |
| de Waelmont | `eitelborn` |
| van Aerenwyck | `herzau` |
| Veldraedt | `silberhorst` |
| Vaelsteyn | `samtborn` |
| van Breughen | `weisshorn` |
