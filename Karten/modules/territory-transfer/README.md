# Übertragungsabgleich für geänderte Karten

`transfer-model.mjs` verbindet unveränderte Quellmarker mit getrennten neuen
Kartenpositionen. Räumliche Nähe und Ortsart erzeugen ausschließlich Vorschläge,
keine bestätigten Importe. Quellen-IDs bleiben erhalten; Quellen und Eingaben
werden nicht verändert. Gebietszugehörigkeit stammt vom Zielbestand.

`transfer-decisions.mjs` validiert regionale Ausschlüsse und gezielte
Ortszuordnungen vor der Kandidatensuche. Ausgeschlossene oder bereits im
Kartenbild enthaltene Quellen werden nicht erneut zugeordnet. Lokale neue
Orte besitzen eine eigene Kennung, aber keine erfundene World-Anvil-ID.
Bearbeitete Beschreibungen stehen getrennt neben dem unveränderten Alttext.
Historische Besitz-/Lehnsverhältnisse können getrennt von der geografischen
Gebietszuordnung angegeben werden.

`transfer-review.mjs` besitzt Filter, Auswahl und vollständige Quellenansicht.
Ausgesonderte Quellen sind nur in der ausdrücklich gewählten Archivansicht
sichtbar. Wege werden ohne belegten Verlauf nicht zu Orts-Pins oder erfundenen
Linien umgewandelt.
`transfer-map.mjs` besitzt SVG-Karte, Ebenen, Zoom und Verschieben.
Ausdrücklich umgewidmete Standorte können ein vorhandenes Ersatzsymbol als
Overlay erhalten, ohne die Bildquellen zu überschreiben.
Beide verwalten ihren State lokal in der jeweiligen Instanz; die Darstellung ist auf
`transfer-review.css` begrenzt. Es gibt keine Firebase-, World-Anvil-Schreibzugriffe
oder Änderungen an bestehenden Aleria-Karten.

Regionale Originale, Positionsbelege und Entscheidungen bleiben im regionalen
Ordner. Dieser Abgleich ersetzt nicht den bestehenden `reviewed-pin-import`:
Erst eindeutig geprüfte Ortszuordnungen können später in dessen Eingabe übergehen.
