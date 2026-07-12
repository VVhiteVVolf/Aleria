# Fährtenlaut Regular 1.000

Fährtenschrift zur Darstellung geschriebener Tiersprache. Jeder Buchstabe wird durch die Spur eines anderen Tieres ersetzt.

## Paketinhalt

- `Faehrtenlaut-Regular.ttf`: installierbare Desktopschrift
- `Faehrtenlaut-Regular.woff2`: kompakter Webfont
- `Faehrtenlaut-Regular.woff`: Webfont-Fallback
- `faehrtenlaut.css`: fertige HTML-Einbindung mit optionaler Stempeloptik
- `demo.html`: interaktive lokale Testseite
- `Faehrtenlaut_Zeichentafel.png`: vollständige Vorschau

## Installation unter Windows

1. `Faehrtenlaut-Regular.ttf` öffnen.
2. Auf **Installieren** klicken.
3. In einem Programm die Schriftfamilie **Faehrtenlaut** auswählen.

## Verwendung in HTML

Fontdateien und `faehrtenlaut.css` in denselben Ordner legen:

```html
<link rel="stylesheet" href="faehrtenlaut.css">

<p class="tiersprache">Fremder. Fort. Junges hier.</p>
<p class="tiersprache-spur">Der Wald hört jeden Schritt.</p>
```

`tiersprache` verwendet eine einfarbige Darstellung. `tiersprache-spur` ergänzt einen erdgrünen Verlauf und leichten Schatten.

## Zeichenzuordnung

| Zeichen | Tierfährte | Zeichen | Tierfährte |
| --- | --- | --- | --- |
| A | Wolf | N | Schlange |
| B | Hirsch | O | Frosch |
| C | Rabe | P | Biber |
| D | Luchs | Q | Dachs |
| E | Bär | R | Ziege |
| F | Hase | S | Eichhörnchen |
| G | Echse | T | Truthahn |
| H | Ente | U | Otter |
| I | Pferd | V | Waschbär |
| J | Fuchs | W | Hund |
| K | Wildschwein | X | Krabbe |
| L | Eule | Y | Elefant |
| M | Maus | Z | Spinne |
| Ä | Huhn | Ö | Robbe |
| Ü | Rind | ß | Maulwurf |

Groß- und Kleinbuchstaben verwenden dieselbe Fährte. Punkt, Komma, Doppelpunkt, Semikolon, Ausrufezeichen, Fragezeichen, Bindestrich und deutsche Anführungszeichen besitzen eigene Spurzeichen.

Die 30 Hauptzeichen sind zusätzlich im privaten Unicode-Bereich U+E100 bis U+E11D direkt erreichbar.
