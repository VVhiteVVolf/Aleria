# Fähigkeitsicons vom 3. November 2026

Elf eigenständige PNG-Motive ergänzen die vorhandenen Kampftechnikicons im
vereinfachten Comicstil mit einem abgerundeten quadratischen Rahmen.

Die sieben persönlichen Motive zeigen Freya Skald (Arkaner Schrei), Gildas
Gafyr (Gewissenhafte Vorbereitung, Schutzpflicht), Gawain Draig (Liebt Düfte,
Draig-Rittersiegelring), Asgeir Wolfshorn (Grenzer des Dunkelhains) und Ylva
Wolfshorn (Veteranin des Dunkelhains). Ihre tatsächlich angesehenen öffentlichen
Originalporträts dienen jeweils als Identitäts- und Kleidungsreferenz; für
Gawains Ring zusätzlich das vorhandene Draig-Siegelringbild. Ylva erhält keinen
Schild. Durchschnaufen, Berserkergang, Tierbegleiter und Vogelbegleiter haben
allgemeine Motive. Für Muttersoehnchen wurde kein Motiv erstellt.

`manifest.json` enthält die vollständigen Prompts und tatsächlichen Bildreferenzen
jedes einzelnen eingebauten Imagegen-Aufrufs. Die unveränderten generierten
Originale liegen in `sources/`; `scripts/prepare-ability-icons.ps1` erzeugt daraus
die aktiven RGBA-PNGs mit 256 × 256 Pixeln unter `public/assets/ability-icons/`.
Die Aufbereitung bewahrt das Seitenverhältnis, begrenzt vereinzelte äußere
Streupixel auf die gemeinsame abgerundete Kontur und hinterlegt das deckende
Innenfeld gegen versehentliche Alphaaussparungen. Die Originale bleiben erhalten.
Mit `-Check` prüft sie die reproduzierbaren Ausgaben ohne Schreibzugriffe.
Der plattformunabhängige Aufruf `node scripts/check-ability-icons.mjs` prüft
zusätzlich PNG-Format, Größe und das Hashprotokoll `build-receipt.json` für
Manifest, Aufbereitung, Originale und aktive Bilder. Nach einer bewusst
überarbeiteten und angesehenen Ausgabe wird dieses Protokoll mit
`--write-receipt` erneuert.

Die reine Präsentationsregistrierung
`modules/character-archive/character-archive-ability-icons.js` benötigt bei
persönlichen Motiven eine kanonische Fähigkeits-ID und den belegten Besitzer.
Namensgleiche Fähigkeiten anderer Figuren übernehmen dadurch kein fremdes
Gesicht. Der Draig-Ring bleibt ausdrücklich an Gawains persönliche Fähigkeits-ID
gebunden. Bewusst vergebene eigene Bilder haben Vorrang. Archiv und
Charakterbogen nutzen dieselbe Quelle; Charakterdaten, Inventare, Nutzungen und
Kampfbelege werden hierbei nicht verändert.
