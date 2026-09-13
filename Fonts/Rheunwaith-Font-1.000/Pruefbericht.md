# Technischer Prüfbericht

Rheunwaith Gezeitenrunen, Version 2.000, 13. September 2026.

## Ergebnis

Die drei Fontdateien enthalten dieselbe Zeichenbelegung, Konturen, Metriken
und OpenType-Regeln. Enthalten sind 473 Unicode-Adressen und 307 interne
Glyphen. Mehrere Unicode-Adressen dürfen absichtlich dieselbe Rune verwenden,
etwa Groß- und Kleinbuchstaben oder die alten und neuen direkten Runencodes.
Die 32 Grundformen für 30 Lore-Zeichen sowie Q und ß sind unterschiedlich.

## Geprüft

- A–Z und a–z vollständig, einschließlich J, K, Q und W.
- Deutsche ÄÖÜ/äöü und ß/ẞ. K, Q und C verwenden unterschiedliche Formen.
- Alle druckbaren ASCII-Zeichen, Latin-1 ab U+00A0 und Latin Extended-A.
- Sämtliche 473 zugeordneten Unicode-Adressen ohne fehlende Glyphen.
- Zusammengesetzte und zerlegte Akzentschreibweisen im Bereich U+00C0 bis U+017F.
- Ch, Ll, Ng, Rh und Th in insgesamt 20 Groß-/Kleinschreibungsvarianten.
- Abschaltbare Ligaturen für buchstabengetreue Darstellung.
- Alle 900 Paare der 30 privaten Runencodes ohne unbeabsichtigte Ligaturen.
- Erhaltene alte Zuordnungen U+10C00 bis U+10C1D.
- Glyphen innerhalb der vorgesehenen horizontalen und vertikalen Metriken.
- TTF, WOFF und WOFF2 durch FontTools geöffnet und miteinander verglichen.
- Shaping mit HarfBuzz, PNG-Schriftproben mit Pillow und FreeType.
- Sichtprüfung der Zeichentafel, Ergänzungsübersicht und Leseprobe.
- HTML-Verweise, 30 Runenkarten, 473 Zeichensatzfelder, Größen-/Farbsteuerung,
  Ligaturschalter, Sonderzeichentest und Unicode-Konvertierung mit Node geprüft.
- Benutzereingaben werden in der Vorschau als Text eingesetzt.

Zusammengesetzte Konturen werden beim Fontbau vereinigt. So entstehen an
Überlagerungen und Spiegelungen keine unbeabsichtigten ausgesparten Flächen.

## Umfang der Prüfung

Die JavaScript-Prüfung verwendet eine nachgebildete DOM-Umgebung. Sie ersetzt
keinen visuellen Test in jedem Browser oder jeder Desktopanwendung. Die
beigelegten PNGs sind echte Renderings der fertigen Schriftdatei.

Der Umfang ist genau in `zeichensatz.json` aufgeführt. Er umfasst den
vollständigen genannten lateinischen Zeichensatz und ausgewählte Zusatzzeichen,
nicht sämtliche Unicode-Schriften oder Emoji. Die Testseite meldet Eingaben,
die außerhalb dieses Umfangs liegen.

## Prüfung wiederholen

```sh
python source/test_font.py
node source/test_demo.cjs
```

Die benötigten Bibliotheken und Buildschritte stehen in `README.md`.
