# Phalantia · lokale Vorbereitungsseite

Die Seite liegt unter `Vorschau/Phalantia/index.html`. Sie verwendet die
gemeinsamen Karten-, Drag-, Entwurfs-, Dialog- und Ständekomponenten und bleibt
mit `noindex,nofollow` eine isolierte Vorbereitung. Es gibt keine automatische
Übernahme nach Firebase oder in kanonische Familienregister.

## Quellen und Entwurfsgrenze

- Die beiden PNGs aus `C:/Users/fhg_r/Downloads/Länder/Phalantia` liegen
  bytegleich unter `assets/originals/`; `assets.source.json` enthält SHA-256 und
  Abmessungen. Das WebP der Karte ändert keine Geometrie oder Namen.
- Die Karte besitzt acht phalantische Städte: Lysandreia und die sieben
  Periökenstädte Milinthos, Syrakleia, Knossira, Lakonis, Pergeira, Krypteia und
  Thalassos. Alantaic bleibt als auswärtiger Inhalt auf der Originalkarte und
  besitzt keinen Marker, Sitz oder Hausvorschlag.
- Die gemeinsame Hauptstadt, die sieben Periökenhäuser in der Geruso, Vetorechte,
  königliche Agoge, Orakel und gesellschaftlichen Rechte folgen den aktuellen
  Nutzerfestlegungen. Es gibt kein separates Ephorengremium und keine Apella.
- Neue Hausnamen und Wappen sowie der ausgearbeitete „Eid der zwei Linien“
  bleiben sichtbar als Vorschläge gekennzeichnet. Es werden keine Personen,
  konkreten Strafsätze, Abgabenhöhen oder territorialen Grenzlinien erfunden.

## Verantwortlichkeiten

Die gemeinsame Landesgeschichte mit Klythesia folgt der neueren
Nutzerfestlegung vom 4. November 2026: Aechanath und Fürstentum Aechneach,
Zarakhuls Versklavung und Zwangssprache, Orins Zungenverwirrung, Phalantias
Eroberungen, seine Zeit als rebellischer alerischer Grenzvasall und Kyreons
Aufstand beim Reichszerfall. Die westlichen Städte werden als Klythesia
unabhängig; Stoicheia bleibt beiden Ländern gemeinsam. Die heutige
Zweikönigs-, Geruso-, Stände- und Agogeordnung wird dadurch nicht geändert.
Der gemeinsame Sprachkontext steht in
`../../AleriaAlmanach/modules/language/TIRNARA_LANGUAGE_HISTORY.md`;
gezielte Änderungsbelege unter
`../../diagnostics/klythesia-expansion-20261104/language/`.

`realm-context.mjs` besitzt die Kultur- und Staatsbeschreibung;
`territory-data.mjs` die gemessenen Ortsanker und Sitzräume.
`house-data.mjs` projiziert die Namen und Heraldik aus `sources/house-plan.json`.
Die Bildworkflows erzeugen die reinen Kataloge `estate-data.mjs`,
`warrior-data.mjs` und `region-shield-data.mjs`. Die neun Hausfenster zeigen
jeweils Wappen und eigene Hausfigur; die Klassenreferenz folgt nachgeordnet.
Die acht Sitzräume erhalten eigenständige Regionsschilder auf Hoplon-Basis.
Ihre Bildzeichen begründen keine auf der Karte unbelegten Grenzlinien.

Standes- und Hausanzeigen verwenden die Einzahl. Die vorhandenen IDs,
Bilddateinamen und gespeicherten Sitzentwürfe bleiben bei der Umbenennung
unverändert. Die sechs Standesbezeichnungen lauten Basileus, Periöke,
Doryade, Eleuther, Helot und Xenos; grammatische Mehrzahl im Fließtext bleibt
erhalten. Die Königshäuser heißen Oresthid und Therakid.

`placement-state.mjs` konfiguriert ausschließlich den gemeinsamen lokalen
Entwurf mit dem Schlüssel `aleria:proposal:phalantia:placements:v1`.
Der Browser speichert nur Haus-Sitz-Zuordnungen. Ränge, Geruso-Rechte und
Quellenzuordnungen werden durch Sitzänderungen nicht verändert.

## Bilddateien

Ausgewählte Produktions-PNGs und WebP-Vorschauen liegen unter
`assets/emblems/`, `assets/estates/` und `assets/warriors/`.
Generatororiginale, komplette Prompts, tatsächliche Referenzpfade und
technische Prüfergebnisse bleiben in den jeweiligen Originalordnern und
`sources/` erhalten. Die Generierung erfolgt mit dem eingebauten Imagegen-Werkzeug.

- [Hausnamen, Sitze und Wappenmotive](sources/house-plan.json) sind die gemeinsame
  redaktionelle Quelle für den Hauskatalog und die Wappenaufträge.
- [Vollständige Wappenprompts](sources/additional-emblem-jobs.json),
  [Kriegerprompts](sources/warrior-art-direction.json) und
  [Comicprompts](sources/estate-art-direction.json) enthalten die tatsächlich
  verwendeten Bildreferenzen. Die jeweiligen Generation-Receipts bewahren die
  Tooloriginalpfade; die Asset-Receipts prüfen die unveränderten Originale.
- [Hauskrieger A](sources/house-warriors-a-jobs.json),
  [Hauskrieger B](sources/house-warriors-b-jobs.json) und
  [Hoplon-Regionsschilder](sources/regional-shield-jobs.json) enthalten die
  zusätzlichen Bildaufträge. Der korrigierte Toxot wird über
  [Bildrevisionen](sources/warrior-art-revisions.json) ausgewählt; seine
  bisherige Fassung bleibt als Original erhalten.
- `scripts/plan-heraldry.py` leitet die Wappenaufträge aus `house-plan.json` ab,
  ohne Namen oder Sitzvorschläge zurückzusetzen. `prepare-heraldry.py` verwendet
  die gemeinsame RGB-erhaltende Alpha-Aufbereitung; `audit-heraldry.py` prüft
  Originalhashes, RGB, deckende Innenflächen und transparente Außenflächen.

Die Veröffentlichungspolicy schließt Quellen, Methoden und Generatororiginale
aus dem statischen Paket aus; aktive Bilder und die beiden gelieferten
Originaldownloads bleiben verfügbar.

## Lokale Aufbereitung und Prüfung

```text
python Vorschau/Phalantia/scripts/prepare-sources.py
node Vorschau/Phalantia/scripts/build-house-catalog.mjs
node Vorschau/Phalantia/scripts/build-estate-catalog.mjs
node Vorschau/Phalantia/scripts/build-warrior-catalog.mjs
node Vorschau/Phalantia/scripts/build-region-shield-catalog.mjs
node --test --experimental-test-isolation=none Vorschau/Phalantia/tests/territory-placement.test.mjs Vorschau/Phalantia/tests/artwork-coverage.test.mjs
node --test --experimental-test-isolation=none netlify/tests/phalantia-source-publication.test.mjs
```

Die vorhandenen Bildmethoden aktualisieren ihre eigenen Runtimekataloge.
`prepare-warriors.py` ist auf die Prototypen und deren erhaltene Revisionen
begrenzt und darf keine Hausfiguren überschreiben. Es liest die jeweilige
`alphaProcessing`-Konfiguration aus den Bildrevisionen. Der Toxot v2 benötigt
`coreThreshold: 210`, damit seine dünne originale Bogensehne erhalten bleibt.
Die Hauskrieger verwenden getrennte A-/B-Methoden und Asset-Receipts;
Erythads entsprechende Einstellung steht direkt im B-Auftrag. Diese
Ausnahmen beim erneuten Aufbereiten beibehalten. Generatororiginale und
RGB-Pixel bleiben unverändert; es werden keine transparenten Lücken gefüllt.

Prüfbelege für diese Vorbereitung liegen unter `diagnostics/phalantia/`.
Es erfolgt im aktuellen Auftrag kein Push oder Deploy.
