# Nuatlapa und Tirghan im Almanach

Auftrag vom 3. November 2026: Die gelieferten Sprach- und Fontpakete in der
bestehenden Almanach-Kategorie „Sprachen“ ergänzen und ihre Schriften für
interaktive Szenen, Anzeigetafeln und die Dokumentenwerkstatt bereitstellen.
Die Umsetzung bleibt lokal; dieser neue Auftrag enthält keine Veröffentlichungsfreigabe.

## Quellen und Verantwortlichkeiten

- `Fonts/Tlapanui-Gesamtpaket-2.000/` erhält das vollständige Originalpaket
  aus dem gleichnamigen Downloadordner. Sprache: **Nuatlapa**, Schrift:
  **Tavarua**, Fontfamilie: **Tavarua Bildschnitt**.
- `Fonts/Ishtaran-Gesamtpaket-1.000/` erhält das vollständige Originalpaket
  aus dem gleichnamigen Downloadordner. Sprache: **Tirghan**, Schrift:
  **Ayluun**, Fontfamilie: **Ayluun Mondbogen**.
- Die Kopien wurden dateiweise per SHA-256 mit den Downloadoriginalen verglichen.
- Sprachmodule und ihre Darstellungen gehören zu `modules/language/`.
  Vorhandene Sprach-, Namenslisten- und Zeichentabellenrenderer bleiben die
  gemeinsame Darstellungsschicht.
- `modules/language/language-script-registry.js` verwaltet die Szenenschriften.
  Die Dokumentenwerkstatt verwendet ihren bestehenden Fontkatalog; die
  Anzeigetafeln beziehen die Fontquellen weiterhin aus diesem Katalog.

## Inhaltliche Abgrenzung

Die neuen Sprachpakete sind die Quelle der Sprachregeln und Korpora.
Je Sprache bleiben 1.000 Wörter, 200 Silben beziehungsweise Bausteine und
je 500 männliche sowie weibliche Namen erhalten. Gleich geschriebene Tirghan-
Bausteine mit unterschiedlichen Funktionen werden nicht zusammengelegt.

Nuatlapa gehört zu den Tlapanui, deren Vorfahren aus Sundara stammen. Tlapatlan
ist der ursprüngliche Landesname; Calidaria bezeichnet den kaiserlich benannten
Archipel. Argentische Einflüsse begründen keine automatische Gleichsetzung
mit Lingua Argenti.

Tirghan ist die moderne Sprache Ishtarans auf Tirnara. Die Herkunft aus
Maghath und Maghneach begründet keine albische oder infernalische Mischsprache.
Die Madrasa ist ein Ort von Gelehrsamkeit, Wissenschaft und Esoterik. Die
weltliche Staatsordnung und die Freiheit des Glaubens bleiben erhalten;
die beiden Entitäten der Dualität erhalten keine erfundenen Namen.

## Szenenbilder

Beide Module besitzen eine eigenständige Illustration im gespeicherten
Preset `anime-scene-portrait` mit der Referenz Tales of Xillia/Frieren.
Menschen und Alben haben abgerundete menschliche Ohren.

- Tlapanui: ruhige Schreibszene auf einer Veranda am Meer.
- Ishtaran: Manuskriptbesprechung in einer seldschukisch angeregten Madrasa.

Aktive Bilder liegen jeweils unter
`modules/language/<tlapanui|ishtaran>/assets/language-<tlapanui|ishtaran>-scene.webp`.
Die Bilder messen 1.024 × 1.536 Pixel. Original-PNG und vollständiger Prompt
bleiben daneben als nachvollziehbare Quellen erhalten.

## Schrift und gespeicherte Inhalte

Die Auswahl-IDs lauten `tlapanui` und `ishtaran`. Beide Fonts belegen die
Tastaturzeichen direkt. Die gemeinsame Darstellung verwendet deshalb den
unveränderten Klartext; gespeicherte Nachrichten und Dokumente werden nicht
transliteriert oder migriert. Vorhandene Lade-, Vorschau-, Speicher- und
Exportwege bleiben zuständig.

Der gelieferte Tirghan-Wortschatz enthält das punktlose `ı` (U+0131), etwa
in `Baschakın`. Dem Originalfont fehlt dessen Zeichenzuordnung. Die separate
Webfassung `Fonts/Ishtaran-Web-1.001/` ergänzt ausschließlich einen Alias auf
das vorhandene kleine `i`. Sämtliche bisherigen Zeichenzuordnungen,
Glyphenkonturen und Maße bleiben erhalten. `build-webfont.py` erzeugt die
WOFF- und TTF-Fassung reproduzierbar; `--check` prüft beide Ergebnisse.
Alle drei Oberflächen verwenden die ergänzte WOFF-Fassung.

## Auslieferung

Originalpakete, Generierungsbilder und Prompts sind Quellen. Nur die aktiven
Schriftdateien, Szenen-WebPs, Zeichentafeln und ausdrücklich verlinkten
Downloads gehören in das statische Paket. Die gezielte Publikationsregel
liegt in `netlify/build/publication-policy.mjs`.

## Prüfung

- 14 kombinierte Fokus- und Regressionstests bestanden:
  `package-language-modules.test.mjs`, `tlapanui-ishtaran-fonts.test.mjs`,
  `laerelis-module.test.mjs` und `language-module-editor.test.mjs`.
- `npm run check:languages`, `scripts/check-module-template-roundtrip.js`,
  `scripts/build-quest-catalog.mjs --check` und der gezielte Diffcheck bestanden.
  Der abhängige Questkatalog wurde nach der Erweiterung seiner VM-Quellliste
  regeneriert; dabei wurden auch bereits vorhandene lokale Quellenstände
  nachvollzogen. Die bestehenden Publikationsfilter bleiben dafür verbindlich.
- `tests/tlapanui-ishtaran-fonts.test.mjs` prüft die tatsächliche
  Glyphenabdeckung aller Wörter, Bausteine und Namen, den einzigen neuen
  Ayluun-Alias und unveränderte Fontkonturen und Metriken. Weitere Fälle
  prüfen Szenensteuerung, Schrift-IDs, Tafeltypografie, Dokumentenspeicherung
  und die Einbettung der realen Fontbytes im HTML-Export.
- Die vorhandenen Fontregressionen für Arkanes Alphabet, Rheunwaith,
  Karnrith und Laerelis sowie die Tafeltests wurden mitgeprüft.
- Die Publikationsgrenzen und ihre benachbarten Releaseprüfungen bestanden;
  alle sechs gezielten Fälle in
  `netlify/tests/language-package-publication.test.mjs` sind grün. Der neue
  Release-Task `package-languages` prüft den deterministischen Quellimport und
  beide neuen Fachtestdateien bei einschlägigen Änderungen.
- Der Tabelleneditor erhält eingebettete senkrechte Striche und Backslashes
  jetzt verlustfrei. Zeichen- und Silbentabellen teilen denselben Parser;
  vorhandene einfache Eingabezeilen bleiben lesbar. Die Editorhilfe erklärt
  die Eingabe mit `\|` und `\\`.
- Beide Szenen-WebPs und beide aktiven Webfonts sind über den bestehenden
  lokalen Server mit HTTP 200 erreichbar; WebPs wurden auf Format und Maße
  geprüft und die generierten Motive visuell angesehen.
- Die visuelle Prüfung der vollständigen Seiten und Auswahlfelder im Browser
  bleibt offen: Die verfügbare Browsersteuerung schlug bereits beim Navigieren
  und Lesen des DOM mit einem internen `timeoutMs`-Fehler fehl. Diese Grenze
  ist keine erfolgreiche Browserprüfung.
- Ein bestehender unabhängiger Werkstatt-Publisher-Test scheitert an
  `cards.secureEqual is not a function`; dieser Auftrag ändert die
  Publisher-Implementierung nicht.
