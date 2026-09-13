# Rheunwaith Gezeitenrunen · Integration vom 13. September 2026

Der Ordner `Fonts/Rheunwaith-Font-1.000` enthält jetzt die Schriftversion
**2.000**. Der Ordnername bleibt für bestehende Verweise erhalten.

## Verantwortlichkeiten

- Das Fontpaket liefert die gemeinsame `@font-face`-Definition in
  `rheunwaith.css` sowie Alphabet, Zeichensatz und Konvertierung in
  `rheunwaith.js`. Beide werden einmal in `AleriaAlmanach.html` geladen.
- Sprechblasen, Namensverzierungen und Zeichentabellen verwenden dieselbe
  Familie `Rheunwaith`. Ihre Darstellung bleibt in den jeweiligen Feature-CSS-Dateien.
  Normaler Buchstabenabstand erhält die OpenType-Doppelzeichen.
- `comments-spell-fonts.js` verwendet `Rheunwaith.toPrivateUse` ausschließlich
  für die sichtbare Runenfassung. Die beiden Register-Renderer verwenden dieselbe
  Paketfunktion für alte direkte Runen. U+10C00–U+10C1D werden bei der Anzeige
  zu U+E300–U+E31D; gespeicherter Text und Klartext bleiben unverändert.
- `data/sections.js` verwendet Zeichentafel, Leseprobe und erweiterten Zeichensatz.
  Die vier Modulseiten, 30 Runennamen, 400 Namensvorschläge und bestehende
  Aleria-Sprachkunde bleiben erhalten. Die technische Anleitung ergänzt die Sprachseite.
- Die Dokumentenwerkstatt lädt den neuen WOFF2-Pfad aus ihrem Fontkatalog.
  Vollständige Asset-URLs verhindern außerdem, dass Vite den gemeinsamen
  Verzeichnispfad ohne abschließenden Schrägstrich umschreibt und dadurch
  alle acht Fonts außerhalb von `Fonts/` anfordert.
- Vite verarbeitet die zentrale CSS-Verknüpfung und erzeugt versionierte Fontassets.
  Der bestehende Kopierschritt übernimmt das klassische Paket-JavaScript und die
  drei dynamisch referenzierten Bilder in den Build.
- `netlify.toml` enthält Weiterleitungen für die sieben entfernten Font-,
  CSS-, Demo- und Bildadressen. Diese Weiterleitungen gelten auf Netlify;
  ein einfacher lokaler Dateiserver wertet sie nicht aus.

## Prüfung

Alle folgenden Prüfungen bestanden:

- Paketprüfsummen; Übereinstimmung der 30 bestehenden Runen mit `alphabet.json`.
- Mitgelieferter Fonttest: TTF/WOFF/WOFF2, 473 Unicode-Adressen, NFC/NFD,
  20 Ligaturvarianten, 900 Paare privater Runencodes und 32 unterschiedliche Grundformen.
- Mitgelieferter Demo-Test.
- 26 gezielte Tests für Rheunwaith, das arkane Alphabet, Spracheditor und Kommentare.
- Modultemplate-Assets und Import-/Export-Roundtrip für 31 Templates.
- Sprachblasenprüfung für alle 11 Schriften und 18 Fontassets.
- Vite-Produktionsbuild und Chromium-Browserprüfung der Quell- und Produktionsfassung:
  30 Tabellenzeichen, drei Bildreiter, 400 Namen, tatsächliche Ligaturdarstellung,
  alte Runencodes, Hover, Tastaturfokus, Enter/Klick, Sprach-/Farbwahl,
  Entwurf, Speicherpayload, Erstellungs-/Bearbeitungsvorschau und mobiles Layout.
- Dokumentenwerkstatt im Browser: alle acht Projektfonts geladen und Rheunwaith
  erfolgreich als WOFF2-Daten in die Export-CSS eingebettet.

Der Browsertest verwendet einen isolierten lokalen Kontext mit gesperrten externen
Anfragen. Es wurden keine Live-Kommentare in Firebase geschrieben; geprüft wurden
die echten Renderer, Eventhandler und Serialisierungsfunktionen mit Testdaten.

## Wiederholen

Aus `AleriaAlmanach`:

```sh
node scripts/check-comment-language-bubbles.js
node scripts/check-module-template-assets.js
node scripts/check-module-template-roundtrip.js
node --test tests/rheunwaith-script.test.mjs tests/arcane-alphabet.test.mjs tests/language-module-editor.test.mjs tests/standard-page-comments.test.mjs tests/comment-segment-image-sets.test.mjs tests/comment-form-performance.test.mjs
node tests/rheunwaith.browser.mjs
```

Der Browsertest erwartet Playwright und einen Server auf `http://127.0.0.1:4189`.
`PLAYWRIGHT_MODULE` kann eine Modul-URL setzen, `RHEUNWAITH_TEST_ORIGIN` einen
anderen Server und `RHEUNWAITH_SCREENSHOTS` einen Ausgabeordner.
Bei blockierten Node-Testunterprozessen ist `--experimental-test-isolation=none`
verwendbar. Die Abhängigkeiten des Python-Fonttests stehen im README des Fontpakets.
