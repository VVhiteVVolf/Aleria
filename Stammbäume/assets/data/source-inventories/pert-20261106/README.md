# Pert: Quellenaufnahme vom 6. November 2026

Die unveränderten Nutzerquellen sind `pert-original.json` und
`pert-original.html`. `inventory.json` enthält vollständige Personen-, Beziehungs-,
Bild- und Quelleninventare samt Hashes. Die 17 gelieferten Portraitzuordnungen
sind bytegleich erhalten; Geraint und Donnchadh teilen eines dieser Motive,
bleiben aber zwei verschiedene Personen und Weltpersonen.

Vor der Neuanlage wurden aktuelle GitHub-Entwürfe geprüft: Registry mit 80
Einträgen (Blob `14351610e763ee8ebed1879ebbd044fce9e1c23c`) ohne Pert oder
Maesglas, direkte master-Dateien `pert.json` und `haus-pert.json` jeweils 404,
Codesuchen ohne Treffer. Vollständige Branchpagination ergab ausschließlich
master. Die gelieferte ID `pert` und Haus-ID `house-pert` werden fortgeführt.

Der Stammbaum übernimmt alle 19 Personen (17 benannte und zwei gelieferte
Gründer), fünf Ehen, eine Affäre, zwölf Elternschaften und den seriellen
Überlieferungssprung. Keine Lebensdaten, Personen- oder Beziehungskennungen
wurden verändert. Die zwei Stammzweige bleiben zusammen in einer Familienakte.
Hauptort ist Gwynthor; Hof Maesglas ist der belegte zweite Wohnsitz. Neue
Koordinaten oder weitere Familienregister werden durch diesen Ablauf nicht
angelegt.

Quellenentscheidungen stehen getrennt in `source-decisions.json`:

- **Goronvy** bleibt die genealogische Schreibweise; **Goronwy** wird als
  belegte Variante der Hausprosa erhalten.
- **Rhiain** erhält `female` aus dem ausdrücklichen HTML-Beleg „bei ihrer
  Großmutter Gwerfyl“, entsprechend bestätigter Quellenentscheidung. Das
  ursprüngliche `unknown` bleibt im unveränderten Export und Inventar sichtbar.
- **Canna** bleibt `unknown`; Name und Portrait begründen kein Geschlecht.
- **Roísin** besitzt nur Sioned als belegten biologischen Elternteil und
  behält `legitimized`. Donnchadhs Partnerschaft zu Sioned ist kein
  Vaterschaftsbeleg; die Affäre wird nicht zur Ehe umgedeutet.
- Kevans und Rhiains Aufwachsen bei Verwandten bleibt im Text erhalten, ohne
  erfundene Adoption oder Änderung ihrer biologischen Eltern.

Ein Gegenquellenkonflikt betrifft die bereits vorhandene Gardistenakte
`character--jTzoT0bqb2lfmslJ05FJ` für **Kevan Pert**. Name, Portrait und
Draig-/Gwynthor-Rolle stimmen überein; die alte Prosa nennt jedoch Seren und
Emry als Großeltern. Die neue Genealogie nennt Iorwerth und Gwerfyl. Für die
neuen Familieninhalte sind die gelieferten Quellen maßgeblich; die bestehende
Figurenakte samt Inventar und Spielwerten bleibt unverändert. Dieser Auftrag
importiert ausdrücklich keine Almanachfiguren und erzeugt keine zweite
Kevan-Akte. Der Datensatz ist für einen späteren gezielten Abgleich benannt.

Begrenzte Befehle ab Projektwurzel:

```powershell
node Stammbäume/assets/data/source-inventories/pert-20261106/import-source.mjs --prepare
python -X utf8 Stammbäume/scripts/pert-source-import/download.py portrait-assets.json
node Stammbäume/assets/data/source-inventories/pert-20261106/import-source.mjs --emit
node Stammbäume/assets/data/source-inventories/pert-20261106/import-source.mjs --check
```

`--prepare` sichert nur die bekannten Originale und schreibt das eigene
Bildmanifest. Der Downloader ist der vorhandene gemeinsame Familien-Downloader
mit Bildsignatur-, Größen- und Hashprüfung. `--emit` schreibt ausschließlich
das Pert-Modul und sein Inventar; `--check` vergleicht denselben Stand ohne
Schreibzugriff. Originale dürfen niemals mit anderen Bytes überschrieben werden.
Zwei reine Darstellungsoptionen richten bestehende Blattkindergruppen aus.
Keine produktiven Datenänderungen, keine Module und kein Push oder Deploy.
