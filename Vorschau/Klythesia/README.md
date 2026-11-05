# Klythesia · lokaler Landesentwurf

Die Nutzerfestlegung vom 4. November 2026 erweitert die frühere Quellenaufnahme.
Die gemeinsame Herkunft mit Phalantia, Orins Zungenverwirrung, Kyreons Aufstand
nach dem alerischen Reichszerfall und die heutige Frauenordnung sind eingearbeitet.
Die acht Ständedarstellungen umfassen Kyreon persönlich als einzigartigen Theíos
sowie sieben gesellschaftliche Stände. Antrophe bleibt ein elitärer Kriegerbund.

Kallisteia ist im Entwurf die Hauptstadt. Sieben neue Clannamen verteilen sich
auf die sieben benannten Kartenorte; die fünf gelieferten Motivwappen erhalten
neue Clanbezeichnungen. Zwei ergänzte Wappen zeigen Hippokampos und Chimäre.
Alle sieben Clans erhalten eigene Thorax-Kriegerinnen; daneben bleiben die sieben
allgemeinen Klassenprototypen erhalten. Eine zusätzliche allgemeine Landes-Thorax
begleitet das Schlangenzeichen, ohne eine weitere Familie oder Institution zu
begründen. Namen, Wappen- und Sitzzuordnung sind
bearbeitbare Vorschläge und keine neuen genealogischen Registerakten.

## Quellen und aktueller Kanon

- `realm-context.mjs`: gemeinsame Geschichte und heutige Grundordnung.
- `estate-data.mjs`: Theíos, Anássa, Polemístria, Hiéreia, Ergatíde, Synoikos,
  Doulos und Doule; Einzahlanzeigen mit vorhandenen Sammelnamen.
- `warrior-data.mjs`: sieben Klassen, Helot als männliche Ausnahme.
- `house-data.mjs`: sieben Clanvorschläge, Ausgangssitze und Wappen.
- `house-warrior-data.mjs`: aus der Art Direction abgeleitete öffentliche
  Bildunterschriften; keine Generatorprompts im Darstellungskatalog.
- `sources/lore-amendment-20261104.json`: ausdrückliche neue Festlegungen,
  ersetzte Offenpunkte und weiterhin nicht bestimmte Einzelregeln.
- `sources/religion-evidence.json`, `cross-source-evidence.json` und
  `map-evidence.json`: unveränderte historische Rechercheberichte.
- `sources/religion-before-20261104/`: bytegleicher Ausgangsstand der drei
  geänderten Religionsdateien. Aktive Religionsquellen enthalten die neue
  Gründung und das gegenwärtige Gottkönigtum.
- `AleriaAlmanach/modules/language/TIRNARA_LANGUAGE_HISTORY.md`: abgeglichene
  Sprachgeschichte. Die Verwirrung der gesprochenen Zungen ist von der
  weitergegebenen Schriftlinie Ogham → Kana’anith → Stoicheia zu trennen.

Die frühere Bestandsaufnahme mit 51 Angaben wird mit gezielten Overrides
projiziert. Ihre Herkunft bleibt nachvollziehbar; aktive Quellenhashes werden
neu ermittelt. Der Unterschied zwischen sieben benannten Göttinnen und neun
erwähnten Nebengöttern bleibt offen. Es entstehen keine weiteren Göttinnen,
Amtsinhaber, Lebensdaten, Strafgesetze oder automatischen Freilassungsregeln.
Kyreons besondere Anatomie gilt ausschließlich für ihn.

## Modularität und Entwürfe

`realm-view.mjs` besitzt Chronik, Klassen- und Clangalerie; `evidence-view.mjs`
besitzt Quellenkarten und Glaubenskataloge. `map-view.mjs` rendert die
Sitzwerkzeuge, `territory-data.mjs` erhält die geprüften Ortsanker ohne neue
Grenzlinien. `house-placement.mjs` konfiguriert den gemeinsamen
`shared/country-placement.mjs`; Drag, Touch-/Tastaturauswahl, Speicherung,
Undo sowie atomarer Import/Export werden nicht kopiert. Der lokale Schlüssel
lautet `aleria:proposal:klythesia:placements:v1`.

`art-dialogs.mjs` verwendet die gemeinsame `createArtDialogSession`.
Clanfenster zeigen Wappen und eigene Thorax-Figur, Stände und Klassen ihre
jeweilige Großansicht. Alle Figuren bleiben vollständig mit `contain` sichtbar.
Die Seite bleibt `noindex,nofollow`; keine Firebase- oder Registerschreibzugriffe.

## Bilder und Produktionsbelege

Die sieben gelieferten PNG-Dateien sind unverändert unter `assets/originals/`
erhalten; Inventar und Hashes stehen in `assets.source.json`. Generatororiginale,
technische Produktions-PNGs und WebP-Vorschauen liegen getrennt unter
`assets/estates/`, `assets/warriors/` und `assets/emblems/`, jeweils in
`generated/`, `production/` und `previews/`.

Die eingebauten Bildwerkzeuge wurden verwendet. Prompts und Referenzen stehen
in `sources/estate-art-direction.json`, `sources/warrior-art-direction.json`,
`sources/house-warrior-art-direction.json` und
`sources/heraldry/additional-emblem-jobs.json`. Generatorpfade, Revisionen und
Prüfsummen bleiben in den zugehörigen `*generation-receipts.json` und
`*asset-receipts.json` erhalten. Die dünnen `scripts/prepare-*.py`-Wrapper
verwenden die gemeinsame Bildaufbereitung; Klassen- und Hausproduktion besitzen
getrennte Namespaces und Manifeste. Außenflächen bleiben transparent, Originale
und RGB-Farbwerte geschützt.

## Reproduzierbare Text- und Datenprüfung

```powershell
node Vorschau/Klythesia/scripts/apply-lore-amendments.mjs
node Vorschau/Klythesia/scripts/update-religion-outputs.mjs
node Vorschau/Klythesia/scripts/build-house-warriors.mjs
node Vorschau/Klythesia/scripts/build-catalogues.mjs
node Vorschau/Klythesia/scripts/klythesia.test.mjs
node diagnostics/klythesia-expansion-20261104/browser-review.mjs
```

Die erste Methode ist eng auf die zwei aktiven Zirkel-Quellen begrenzt; der
Religionsrenderer schreibt nur deren bestehende Archivseite. Die ursprüngliche
Bestandsaufnahme und ihre Prüfbelege unter `diagnostics/klythesia/` bleiben
historisch erhalten. Aktuelle Prüfungen, Kontaktbilder und Browserbelege liegen
unter `diagnostics/klythesia-expansion-20261104/`. 19 Fachprüfungen sind bestanden.
Desktop und Mobil decken alle 24 aktuellen Bildziele ab: auf den 23er-Grundlauf
folgte nach der letzten Illustration eine gezielte Prüfung des geänderten
Landeszeichenfensters und der neuen Landes-Thorax-Ansicht (`--realm-only`).
Kartenzoom, Pointer-Drag, Touchauswahl, lokale Entwürfe und Originalabrufe sind
geprüft; keine JavaScript-, HTTP- oder Überlauffehler. Zusammenfassung:
`diagnostics/klythesia-expansion-20261104/country-verification.json`.

Kein Push, Deploy oder Herunterfahren gehört zu diesem lokalen Auftrag.
