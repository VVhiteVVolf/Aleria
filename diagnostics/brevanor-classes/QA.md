# Brevanor-Klassen · Prüfung vom 30. Oktober 2026

Aktiv sind genau sieben Klassen: Kerant, Breval, Hastrel, Cantrel, Havren,
Silvain und Cabrant. Belgrant besitzt keinen aktiven Registereintrag, kein
Klassenprofil und kein aktives Icon. Frühere Generatorquellen bleiben erhalten.

## Automatische Prüfungen

- Alle 72 Tests unter `Klassenordner/tests` bestanden; Protokoll:
  `class-tests.log`. Ausführung mit expliziten Testdateien und
  `node --test --experimental-test-isolation=none`.
- Nach der letzten Textkorrektur im Registerhintergrund: alle sechs
  `brevanor-classes.test.mjs` erneut bestanden.
- `build-culture-classes.mjs --check`: alle Kulturseiten aktuell; keine
  Änderungen an bestehenden generierten Klassenseiten.
- `sync-character-archive-pages.mjs --check`: 105 Klassen und 31
  Rossmarkt-Einträge aktuell. Brevanor ergänzt sieben Seiten mit lokalen Icons.
- Bildaudit: sieben Motive, getrenntes Preset `fantasy-class-icon`, transparente
  Ränder, keine angeschnittene Silhouette; Original-RGB nach Alpha-Bereinigung
  unverändert. Dateihashes stehen im Icon-Manifest.
- Releasepolicy-Test `source archives`: bestanden. Rohe Generatorbilder sind
  vom statischen Paket ausgeschlossen; aktive Icons und Originalwappen bleiben.
- `git diff --check`: bestanden.

Der zusätzliche globale Check `AleriaAlmanach/scripts/check-character-archive.mjs`
scheitert bereits an seiner bestehenden Gleichheitsannahme von 39 Iconeinträgen
gegenüber 34 Kampfklassenvorlagen. Beide beteiligten Katalogdateien sind gegenüber
HEAD unverändert. Brevanors leere Profile erhalten keine Kampfklassenvorlagen;
die separate Prüfung ihrer sieben Archiveinträge besteht. Dieser bestehende
Diagnosefehler wurde im Rahmen der Klassenanlage nicht verändert.

## Browserprüfung

Chrome, lokaler Server unter `http://127.0.0.1:8896`:

- Alle sieben Profile über echte Links geöffnet. Titel und Icons stimmen,
  beide Bilder pro Profil laden; jeweils elf Adelsränge und zehn offene Kapitel.
- Desktop: keine horizontale Überbreite; alle sieben Registericons und das
  Landeswappen laden lokal. Hintergrund mit denselben elf Adelsrängen geprüft.
- Mobil bei Viewport 390 × 844 (effektive CSS-Breite 312): kein horizontaler
  Überlauf. Inhaltsnavigation und offene Kapitel lassen sich aufklappen;
  Rücknavigation zum Klassenregister funktioniert.
- Temporäre Viewport-Einstellung anschließend zurückgesetzt.
- Bildbelege: `register-desktop.png`, `class-mobile.png`,
  `icons-contact.jpg`.

Alle Profile bleiben ausdrücklich unausgefüllt. Keine Werte, Fähigkeiten,
Stufenvergaben oder kanonischen Landeszuordnungen wurden erfunden.
Keine Veröffentlichung durchgeführt.
