# Falto und örtliche Registerzuordnung · 31.10.2026

Nutzerauftrag: Haus Falto ausschließlich unmittelbar unter Venalys einordnen,
ein eigenes geschichtlich passendes Wappen ergänzen und den künstlichen
Reiter „Bannkreis Gwynthor“ mit Gwynthor zusammenführen. Wohnort und Stammsitz
bestimmen den Registerpfad; Dienst- und Lehnsherren bleiben eigene Profildaten.
Die Regel ist in der Projekt-AGENTS.md und als Editorhinweis festgehalten.

## Ergebnis

- Falto: Venalys; Gwynthor bleibt als örtliche Vertretung beschrieben.
- Twyllod und Penrudd: unmittelbar unter Gwynthor; Twyllod-Hof und die
  Penrudd-Haushalte bleiben in den Fachprofilen erhalten.
- Gezielt versionierte Metadatenabgleiche erhalten Genealogie, Weltpersonen-IDs,
  persönliche Notizen, bestehende Beziehungen und lokale Ansichtseinstellungen.
- Penrudds lokale Repository-Momentaufnahme wurde mit Sicherung fortgeschrieben.
  Keine Live-Firebase-Daten, kein Push und kein Deployment.
- Neues Wappen: goldenes Handelsschiff mit elfenbeinfarbenem Segel über drei
  Münzen auf tiefblauem Holzgrund; geschlossener goldener Lorbeerrahmen.
  Motivgrundlage sind Handelsflotte, Fernhandel und Bankwesen. Falveris
  registriertes Wappen wurde als venalysische Kulturreferenz angesehen.

## Bildquellen und Prüfung

`image-prompts.json` enthält den vollständigen Preset-Prompt und die
ImageGen-Nachkorrektur. Beide Generatororiginale liegen unverändert unter
`image-sources/`. Das endgültige Bild liegt unter
`Stammbäume/assets/images/houses/Venalys/haus-falto.png` und wird auch von
den beiden örtlichen Fortuna-Ratssitzen verwendet.

Die bestehende Wappenaufbereitung wurde wiederverwendet. Deren bereits in
der Länderwerkstatt vorhandene Kreisrahmung wurde in die gemeinsame
Heraldikverarbeitung extrahiert. `emblem-audit.json` weist den exakten Kreis,
Alpha 255 innen und Alpha 0 außen sowie unveränderte RGB-Quelldaten nach.
Das Wappen wurde auf heller und dunkler Unterlage angesehen.

## Validierung

- 22 gezielte Stammbaum-/Registertests bestanden.
- 9 Fortuna-Tests und die Prüfung der generierten Fortuna-Pakete bestanden.
- Bestehender Blutstadt-Bildbestand: 12 Bilder einschließlich Hashes und
  Alphakanal erfolgreich geprüft.
- Browserprüfung in Chrome: Venalys zeigt Falto mit neuem Wappen neben
  Falveri; Gwynthor zeigt Twyllod und Penrudd und keinen Bannkreis-Reiter.
- Die große Stammbaum-Bestandssuite hat 44 Fehler unter 1246 Tests.
  Der lesende Vergleich ohne diese drei Familienkorrekturen ergibt dieselben
  44 Fehler und keine zusätzlichen Fehler. Siehe `test-baseline-comparison.json`.
  Die Basisprüfung ersetzt ausschließlich die drei betroffenen Familienmodule
  im Node-Lader; die Arbeitsdateien bleiben unangetastet.

Die Generatororiginale, Quellen, Vergleichsdaten und Prüfbelege sind
Quellmaterial und gehören nicht ins statische Auslieferungspaket.
