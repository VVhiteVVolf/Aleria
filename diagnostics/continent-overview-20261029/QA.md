# Lokale Prüfung vom 29. Oktober 2026

## Kontinentatlas

Ein gemeinsamer Entwurf für das Kontinentregister, Estryll, Lothir und Aldervan.
Die Länder- und Herrschaftsoberflächen gehören nicht zu diesem Designauftrag.
Vorhandene Banner, Estryll-Bildkeys, Kapitelanker und Länderziele bleiben erhalten.

Alle vier Seiten bei 1440, 768 und 390 Pixeln im Browser geprüft: kein horizontaler
Überlauf, keine fehlenden oder noch ladenden Bilder. Gleiches Kartenraster,
Wappenformat, Papier, Schrift und Navigation. Tastaturfokus ist sichtbar;
Kontinentnavigation funktioniert. Temporäre Prüfbreiten zurückgesetzt.

- [Desktop](lothir-desktop.jpg)
- [Mobil](lothir-mobile.jpg)
- [Messwerte](responsive-audit.json)

## Korrigierte Registerpfade

| Haus | Hauptpfad |
| --- | --- |
| Sonnenfels | Weisenfluh → Freiherrentum Weislauf → Burg Sonnenfels |
| Weinlaub | Weisenfluh → Königliche Provinz Ewigensee → Burg Rebenwacht |
| von Hochreuth | Goldmund → Herzogliche Grafschaft Kronenau → Thronholt; Ministeriale des Hauses Roden |

Explizite kurze Pfade bleiben bei der Normalisierung erhalten. Ältere veröffentlichte
Registermetadaten dürfen die bestätigte Zuordnung nicht zurücksetzen; neuere
bewusste Zuordnungen bleiben möglich. Die Metadatenmigration aktualisiert nur
verwaltete Ortsfelder und erhält Personen, Partnerschaften und Abstammungen.
Neue Veröffentlichungsmetadaten tragen dafür ihre Quellrevision getrennt von der
Veröffentlichungsrevision. Kein Publisher wurde aufgerufen.

Die Browserprüfung zeigte anfangs noch zwischengespeicherte alte JavaScriptmodule
des bisherigen Python-Vorschauservers. Die abschließende Prüfung erfolgte mit
`Cache-Control: no-store` unter `http://127.0.0.1:8883/`; keine Browserdaten gelöscht.
Sonnenfels hat dort genau ein Gebiet und ein Haus mit 25 Personen,
Weinlaub ein Gebiet und ein Haus mit 9 Personen, Hochreuth ein Haus mit 27 Personen.
[Registerbeleg Sonnenfels](sonnenfels-register.jpg)

## Fachprüfungen

- 516 Tests erfolgreich: Kontinente, akzeptierte Länder, Häuser, Karten,
  Vorbereitungsseiten, Register und Netlify-Inhaltsplan.
- Nach der abschließenden Ausgabeformatierung sechs Atlas-/Navigationstests
  erneut erfolgreich.
- Generatorprüfungen für vier Kontinentübersichten, sieben Länder, 74 Ortsakten,
  119 neue Hausquellen, die gesamten Hausseiten, Karten und Kriegergalerie erfolgreich.
- Keine leeren oder unmittelbar doppelt verschachtelten Registerzweige innerhalb
  der sieben übernommenen Länder; jeder bestätigte Hauptpfad entspricht seiner Quelle.
- `git diff --check` erfolgreich.

Lokaler Änderungsstand; für diesen neuen Auftrag wurde keine Veröffentlichung ausgeführt.
