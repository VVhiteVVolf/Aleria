# Prüfbericht: Karnrith Tiefenrunen 3.000

Stand: 13. September 2026.

## Ergebnis

Der Font enthält 473 Unicode-Adressen und 307 Glyphen einschließlich
Hilfs-, Akzent- und Leerraumglyphen. Mehrere Unicode-Adressen dürfen dieselbe
Grundform verwenden, etwa Groß- und Kleinbuchstaben oder alte Runenaliase.
Der genaue Zeichenumfang steht in `zeichensatz.json`.

Alle vier ausgelieferten Formate wurden eingelesen und auf identische
Zeichenbelegung, Abstände und OpenType-Regeln geprüft. Die OTF ist ein
echter OpenType-Font mit CFF-Konturen. TTF, WOFF und WOFF2 verwenden dieselben
TrueType-Konturen.

## Schriftprüfungen

`source/test_font.py` ist erfolgreich durchgelaufen:

- Sämtliche druckbaren ASCII-Zeichen, Latin-1 ab U+00A0, Latin Extended-A,
  großes ẞ und beide Bereiche mit jeweils 30 direkten Runencodes vorhanden.
- Sämtliche 473 Unicode-Adressen ohne fehlende Glyphe geformt.
- Fertige und zerlegte Akzentzeichen im Bereich U+00C0 bis U+017F liefern
  dieselben Glyphen und Positionen.
- Sieben Doppelzeichen in allen 28 Kombinationen aus Groß- und Kleinschreibung
  geprüft, einschließlich deaktivierter Ligaturen.
- Alle 900 Paare aus direkt kodierten kanonischen Runen bleiben unverändert.
- C, J, X, K, Q, T, TH, ß sowie Umlaute und lange Vokale verwenden die
  vorgesehenen unterscheidbaren Formen.
- Alle 50 Bildmaster haben unterschiedliche Fontkonturen.
- Glyphengrenzen liegen innerhalb der vorgesehenen vertikalen Fontmaße;
  Zeichen mit Vorschub überschreiten dessen rechte Grenze nicht.
- TTF und CFF-OTF liefern bei sämtlichen 473 Einzelzeichen sowie den 100
  Wörtern und 200 Namen dieselben geformten Glyphen und Positionen.

`Zeichentafel.png`, `Tastaturzeichen.png` und `Leseprobe.png` wurden mit der
fertigen TTF über Pillow/FreeType gerendert und visuell geprüft. Sie zeigen
den tatsächlichen Font. Die Bildvorlagen stehen separat in
`source/references/`.

## HTML und Daten

`source/test_demo.cjs` ist erfolgreich durchgelaufen. Geprüft wurden die
JavaScript-Funktionen für Runencodes, Zeichenerkennung und ausdrücklich
ausgelöste Altcode-Konvertierung, 30 Runenkarten, die Anzeige aller
473 Unicode-Adressen, das Wörterbuch mit 100 Einträgen, die Suche nach alter
und neuer Form sowie Bedeutung, die Bedienelemente und alle lokalen
Dateiverweise.

Diese Prüfung führt die JavaScript-Logik in einer nachgebildeten DOM-Umgebung
aus. Sie ist kein Test in einer echten Browserinstallation. Die visuelle
Prüfung erfolgte an den genannten Fontrenderings.

Die Sprachbibel enthält vollständig:

| Inhalt | Anzahl |
| --- | ---: |
| Kanonische Zeichenwurzeln | 30 |
| Präfixe und Suffixe | 33 |
| Grundwörter | 100 |
| Geänderte Wortschreibungen mit Begründung | 40 |
| Männliche Personennamen | 100 |
| Weibliche Personennamen | 100 |
| Geänderte Namensschreibungen | 24 |

Alle 300 Wörter und Namen besitzen alte Form, neue Form, Bedeutung,
Sprechgliederung und IPA-Aussprache. Die neue Form stimmt jeweils mit der
zusammengefügten Sprechgliederung überein. Die 100 Grundwörter und die jeweils
100 Namen pro Namensgruppe sind innerhalb ihrer Liste eindeutig.

## Umfang

Die Schrift deckt den dokumentierten Tastatur- und erweiterten lateinischen
Zeichensatz ab. Sie enthält nicht sämtliche Unicode-Schriften oder Emoji.
Groß- und Kleinbuchstaben teilen sich die runische Grundform. Das ursprüngliche
30-Zeichen-System bleibt erhalten; zusätzliche Tastaturzeichen erhalten dadurch
keine nachträglich erfundene Bedeutung in der Lore.

Die Aussprache- und Wortbildungsregeln gehören zur erfundenen Sprache Morgar.
Sie sind eine eigenständige Gestaltung mit den gewünschten Klanganregungen.

