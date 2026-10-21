# Karnrith Hochschnitt 2.000

Karnrith Hochschnitt ist eine vollständige Neuzeichnung der morgornischen Schrift. Die dreißig Zeichen verwenden nun schmale Vollstäbe, harte 30- bis 45-Grad-Äste, Spiegelungen, gebrochene Achsen und einzelne Bindungsrauten. Dadurch wirkt der Font deutlich näher an monumentalen zwergischen Kerb- und Runenschriften, ohne Zeichen aus einer bestehenden Vorlage direkt zu übernehmen.

Der eigene Familienname `Karnrith Hochschnitt` verhindert, dass Betriebssysteme oder Browser versehentlich die ältere Karnrith-Fassung aus dem Fontcache anzeigen.

## Enthalten

- `KarnrithHochschnitt-Regular.ttf`
- `KarnrithHochschnitt-Regular.otf`
- `KarnrithHochschnitt-Regular.woff`
- `KarnrithHochschnitt-Regular.woff2`
- `karnrith-hochschnitt.css`
- interaktive `demo.html`
- Zeichentafel und Schriftprobe mit eindeutigem Versionsnamen
- Build-Quellen und Morgar-Sprachbibel

## OpenType-Ligaturen

| Eingabe | Zeichen | Bedeutung |
|---|---|---|
| `NG` | Ngrum | Tod, Schweigen, Ruhe |
| `TH` | Tharn | Eid, Recht, Bindung |
| `KH` | Khorr | Bruch, Wandel, Prüfung |
| `GH` | Ghair | Wort, Name, Wahrheit |
| `SH` | Shenn | Gedächtnis, Wissen, Erzählung |
| `CH` | Chor | Wille, Ehre, Absicht |
| `DH` | Dhair | Gott, Schicksal, Jenseits |

Groß- und Kleinbuchstaben führen zu denselben Zeichen. Ziffern und grundlegende Satzzeichen sind enthalten. Alle dreißig kanonischen Zeichen liegen zusätzlich auf `U+E300` bis `U+E31D`.

## HTML

```css
@font-face {
  font-family: "Karnrith Hochschnitt";
  src: url("KarnrithHochschnitt-Regular.woff2") format("woff2");
  font-display: swap;
}

.morgar {
  font-family: "Karnrith Hochschnitt", sans-serif;
  font-feature-settings: "liga" 1;
}
```

## Technische Daten

- Familie: Karnrith Hochschnitt
- Stil: Regular
- Version: 2.000
- 59 Glyphen
- 118 Unicode-Zuordnungen
- sieben Ligaturen im OpenType-Feature `liga`

## Rechte

Copyright 2026 Erdi Kök. Für das Aleria-Projekt erstellt. Eine weitergehende öffentliche Lizenz ist in dieser Fassung nicht festgelegt.
