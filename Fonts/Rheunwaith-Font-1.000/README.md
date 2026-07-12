# Rheunwaith Regular 1.000

Installierbare Tastatur- und Webschrift für das 30 Zeichen umfassende Rheunwaith-Alphabet.

## Paketinhalt

- `Rheunwaith-Regular.ttf`: Desktopfont für Windows, Linux und Gestaltungsprogramme
- `Rheunwaith-Regular.woff2`: kompakter Webfont
- `Rheunwaith-Regular.woff`: Webfont-Fallback
- `rheunwaith.css`: Einbindung und blau-silberne Wasseroptik
- `demo.html`: lokale Live-Vorschau
- `OFL.txt`: Schriftlizenz

## Installation unter Windows

1. `Rheunwaith-Regular.ttf` öffnen.
2. Auf **Installieren** klicken.
3. In einem Programm die Schriftfamilie **Rheunwaith** auswählen.

Falls ein bereits geöffnetes Programm die Schrift nicht anzeigt, das Programm neu starten.

## Verwendung auf einer Website

Die drei Fontdateien und `rheunwaith.css` in denselben Ordner kopieren und das Stylesheet einbinden:

```html
<link rel="stylesheet" href="rheunwaith.css">

<p class="rheunwaith">Gawain Tristan Chwerw Llwyd Ngoll Rhyd</p>
<p class="rheunwaith-water">Rheunwaith</p>
```

Die Klasse `rheunwaith` zeigt die einfarbige Schrift. `rheunwaith-water` ergänzt Wasserverlauf, helle Kontur und einen leichten Schatten über CSS.

## Tastaturbelegung

| Eingabe | Rune | Name |
| --- | --- | --- |
| A | 𐰀 | Abael |
| B | 𐰁 | Brenn |
| C | 𐰂 | Cyrr |
| D | 𐰃 | Dynn |
| E | 𐰄 | Ellin |
| F | 𐰅 | Fira |
| G | 𐰆 | Gwaed |
| H | 𐰇 | Helyg |
| I | 𐰈 | Iwr |
| J | 𐰉 | Jann |
| K | 𐰊 | Kyrr |
| L | 𐰋 | Lleu |
| M | 𐰌 | Mwdd |
| N | 𐰍 | Nedd |
| O | 𐰎 | Oen |
| P | 𐰏 | Perdd |
| R | 𐰐 | Rhyd |
| S | 𐰑 | Saith |
| T oder Th | 𐰒 | Thal |
| U | 𐰓 | Uwch |
| V | 𐰔 | Vann |
| W | 𐰕 | Wynn |
| X | 𐰖 | Xeir |
| Y | 𐰗 | Ydd |
| Z | 𐰘 | Zarr |
| Ll | 𐰙 | Llwyd |
| Ng | 𐰚 | Ngoll |
| Ch | 𐰛 | Chwerw |
| Rh | 𐰜 | Rhew |
| Ü | 𐰝 | Uffyr |

Groß- und Kleinbuchstaben verwenden dieselben Runen. Die Folgen `Ch`, `Ll`, `Ng`, `Rh` und `Th` werden durch die standardmäßig aktive OpenType-Ligaturfunktion zu jeweils einem Zeichen verbunden. Q bleibt unbelegt, da das etablierte Rheunwaith-Alphabet kein Q besitzt.

Die ursprünglichen Runenzeichen im Bereich U+10C00 bis U+10C1D bleiben ebenfalls direkt verwendbar.

## Lizenz

Die Grundkonturen basieren auf Noto Sans Old Turkic. Die Schrift ist entsprechend der SIL Open Font License 1.1 unter neuem Namen weitergegeben. Einzelheiten stehen in `OFL.txt`.
