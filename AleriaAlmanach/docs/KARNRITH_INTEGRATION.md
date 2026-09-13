# Karnrith Tiefenrunen und Morgar · Integration vom 13. September 2026

**Nachfolgende Sprachrevision:** Der Nutzer hat anschließend Morgar 2.0 mit
neuem Wortschatz, fünf Modulseiten und 1.100 Namen beauftragt. Der aktuelle Stand
steht in [Morgar 2.0](../modules/language/morgar/README.md). Die folgenden Angaben
zu Morgar 1.1 dokumentieren den früheren Importstand; die Fontintegration bleibt gültig.

Der bestehende Ordner `Fonts/Karnrith-Font-2.000` enthält jetzt **Karnrith
Tiefenrunen 3.000** und die Sprachfassung **Morgar 1.1**. Der Ordnername bleibt
für bestehende Verweise erhalten. Das gelieferte Fontpaket wurde nicht verändert.

## Verantwortlichkeiten

- `AleriaAlmanach.html` lädt die gemeinsame Fontdefinition `karnrith.css` und
  die Paket-API `karnrith.js` einmal. Sprechblasen, Namensverzierungen und
  Zeichentabellen verwenden `Karnrith Tiefenrunen`. Normaler Buchstabenabstand
  und unterbundene künstliche Schriftschnitte erhalten die Doppelzeichen.
- `modules/language/language-script-display.js` kapselt die Anzeigeumwandlung
  für Karnrith und Rheunwaith. Alte Karnrith-Codes U+E300–U+E31D entsprechen
  dem aktuellen Rheunwaith-Bereich: Nur bei ausdrücklich gewähltem Karnrith
  werden sie für die Anzeige zu U+E500–U+E51D. Klartext, Entwürfe und gespeicherte
  Inhalte bleiben erhalten. Bestehendes `spellFont: 'karnrith'` wird unterstützt.
- `modules/language/morgar/` besitzt den Spracheintrag und dessen Referenztabellen.
  `morgar-build.mjs` erzeugt `morgar-data.js` aus `Sprache/morgar.json`.
  Die 100 Wörter kommen direkt aus `Karnrith.words`; es gibt kein zweites Wörterbuch.
  `npm run build:languages` aktualisiert die Referenz; `npm run check:languages`
  erkennt veraltete Daten. Der normale Build erzeugt sie vorab und prüft sie in Vite.
- Die ersten vier Seiten behalten ihre Position. Der Eintrag enthält aktuelle
  Sprachregeln, drei Schriftbilder, 30 Zeichenwurzeln, 33 Affixe und sechs
  Vokalstufen. Die Namensübersicht verwendet die 200 dokumentierten Namen der
  Sprachbibel anstelle der bisherigen 400 automatisch kombinierten Vorschläge.
- Drei zusätzliche Registerseiten zeigen alle 100 Wörter und jeweils 100
  männliche und weibliche Namen mit bisheriger Form, Aussprache und Bedeutung.
  Die 40 geänderten Wörter und 24 geänderten Namen bleiben nachvollziehbar.
  Die vollständige Sprachbibel und die interaktive Fontdemo sind verlinkt.
- Die Dokumentenwerkstatt lädt den neuen, versionierten WOFF2-Pfad. Ihr
  gespeicherter Familienwert `Karnrith Hochschnitt` bleibt als Kompatibilitätsalias
  erhalten; die Auswahl zeigt `Karnrith Tiefenrunen · Morgorn`.
- Vite übernimmt Fontassets, Bilder, Paket-API, Demo und Sprachbibel. Elf
  Weiterleitungen in `netlify.toml` erhalten frühere Font-, Bild-, Demo- und
  Dokumentadressen. Netlify wertet diese Weiterleitungen aus; Vite Preview nicht.

## Prüfung

Alle folgenden Prüfungen bestanden:

- Paketprüfsummen und Übereinstimmung der erzeugten Referenz mit den Quelldaten.
- Mitgelieferter Fonttest für TTF, CFF-OTF, WOFF und WOFF2: 473 Unicode-Adressen,
  NFC/NFD, 28 Ligaturvarianten, 900 direkte Runenpaare, 50 unterschiedliche
  Bildmaster, Zeichengrenzen sowie die 100 Wörter und 200 Namen.
- Mitgelieferter JavaScript-/Demo-Test.
- 31 gezielte Tests für beide aktualisierten Schriften, das arkane Alphabet,
  Spracheditor, sichere Textdarstellung und Kommentarfunktionen.
- Assetprüfung und Import-/Export-Roundtrip für 31 Modultemplates.
- Sprachblasenprüfung für alle 11 Schriften und 19 Fontassets.
- Vite-Produktionsbuild. Beide Schriften wurden in Chromium in Quell- und
  Produktionsfassung geprüft: Tabellen, Bildreiter, Namen, tatsächliche
  Ligaturdarstellung, Altzeichen, Hover, Tastaturfokus, Enter/Klick, Sprach- und
  Farbwahl, Speicherpayload, Entwurf, Erstellungs- und Bearbeitungsvorschau sowie
  mobiles Layout. Auch der direkte Wechsel Karnrith/Rheunwaith wurde im Build geprüft.
- Alle drei neuen Morgar-Register zeigen jeweils 100 Einträge im Browser.
- Dokumentenwerkstatt: alle acht Projektfonts geladen; die bisherige gespeicherte
  Karnrith-Auswahl lädt die neue Schrift und bettet WOFF2-Daten in die Export-CSS ein.
- Sprachbibel, Referenz-JSON, Demo, Paket-API und WOFF2 sind im Produktionsbuild abrufbar.

Die Browserprüfung verwendet die echten Renderer, Eventhandler und
Serialisierungsfunktionen mit lokalen Testdaten in einem isolierten Kontext.
Externe Anfragen sind gesperrt; Live-Speicherung in Firebase wurde nicht ausgeführt.
Es wurde keine Veröffentlichung vorgenommen.

## Wiederholen

Aus `AleriaAlmanach`:

```sh
npm run check:languages
node scripts/check-comment-language-bubbles.js
node scripts/check-module-template-assets.js
node scripts/check-module-template-roundtrip.js
node --test tests/karnrith-script.test.mjs tests/rheunwaith-script.test.mjs tests/arcane-alphabet.test.mjs tests/language-module-editor.test.mjs tests/standard-page-comments.test.mjs tests/comment-segment-image-sets.test.mjs tests/comment-form-performance.test.mjs
node tests/karnrith.browser.mjs
node tests/rheunwaith.browser.mjs
```

Die Browsertests teilen `tests/support/language-script-browser.mjs` und erwarten
Playwright sowie einen Server auf `http://127.0.0.1:4189`. `PLAYWRIGHT_MODULE`
kann eine Modul-URL setzen. `KARNRITH_TEST_ORIGIN` und `RHEUNWAITH_TEST_ORIGIN`
setzen den jeweiligen Testserver; die entsprechenden `*_SCREENSHOTS`-Variablen
setzen einen Ausgabeordner. Bei blockierten Node-Testunterprozessen kann
`--experimental-test-isolation=none` verwendet werden.
