# Alerias Münzbilder

`currency-art.js` ist die einzige Bildzuordnung für Gruppenbeutel und Übergabe,
klassisches Charakterinventar, aktuelle Tafelbelohnungen und Handelspreise.
IDs, Münzwerte und Geldumrechnung bleiben in ihren bestehenden Verträgen.

Gold und Silber verwenden die eigenen Sonnen- beziehungsweise Mond-/Wellenmünzen
aus `assets/currency`. Die transparenten WebP-Anzeigen sind 512 Pixel groß;
beide PNG-Originale und das Generierungsmanifest bleiben erhalten. Kupfer
verwendet die schlichte Triskelionmünze aus `assets/gwynthor-troetzli/items`,
der Eisenpfennig sein vorhandenes eigenes Original. Keine Zahl ist ins Bild
eingebacken. Beträge stehen als Text daneben.

Die kleine Classic-Fassade `AleriaCurrencyArt` exportiert `icon(id)` und
`currencies`. Sie wird vor dem klassischen Inventarscript mit `defer` geladen.
Dessen bestehende vier Münzdatensätze behalten IDs, Labels, Kürzel und Werte;
nur `icon` liest über einen Getter die gemeinsame Zuordnung. Auch eine später
verfügbare Fassade wird damit verwendet. Fehlt sie, zeigt das Inventar ein
Kürzel und lädt weder alte DND-Bilder noch eine leere Bildadresse.

```powershell
node AleriaAlmanach/scripts/build-currency-art.mjs
node AleriaAlmanach/scripts/build-currency-art.mjs --check
```

Der Generator bündelt ausschließlich die kleine ESM-Bildquelle. Er verändert
keine Mechanikprojektion und greift weder auf Firebase noch Inventare zu.
Releasegates prüfen die Fassade mit `--check` und die tatsächlichen Verbraucher
mit `tests/currency-art.test.mjs`. Alte redaktionelle Einzelillustrationen und
Originaldateien werden durch diesen Abgleich nicht pauschal ersetzt.
