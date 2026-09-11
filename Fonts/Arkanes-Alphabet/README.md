# Aleria Arcana 3.0

## Vollständiger Zeichensatz für deutsche Texte

Die Version ergänzt die fehlenden J, K, Q, W, Ä, Ö, Ü, ä, ö, ü, ß und ẞ.
Alle lateinischen Groß-/Kleinbuchstaben, Ziffern 0 bis 9 und ASCII-Satzzeichen
sind abgedeckt. Auch druckbare Zeichen aus Latin-1 und Latin Extended-A,
typografische Anführungszeichen, Gedankenstriche, …, €, § und weitere
häufige Zeichen sind enthalten. Beispiele: É, à, ç, ñ, Ğ, İ, ı, Ş und Ł.
Der vollständige Umfang steht in zeichensatz.json. Beliebige andere
Schriftsysteme und Emoji gehören nicht zu diesem Font.

K/k verwendet Coll wie C/c: dessen Laut ist in der ursprünglichen Vorlage k.
Die Formen für J, Q, W und ß sind aus den vorhandenen Vektorkonturen entwickelt.
Umlaute verwenden die Grundrune mit zwei rautenförmigen Punkten. Die 33
Lore-Runen, Bedeutungen, Zahlenwerte und PUA-Adressen sind unverändert.
Die Schreibergänzungen sind keine zusätzlichen kanonischen Magierunen.

## Installation und Update

1. ZIP vollständig entpacken, dann demo.html öffnen.
2. arcane.css und den vollständigen Ordner fonts/ auf die Website kopieren.
3. Bei einem Update die alten Dateien ersetzen. Die CSS-Fontadressen enthalten
   ?v=3. Bei weiterhin alter Anzeige den Browser mit Strg+F5 neu laden.
4. Bei Verwendung einer lokal installierten Schrift die alte TTF deinstallieren
   oder ersetzen und AleriaArcana-Regular.ttf sowie optional
   AleriaArcana-Text.ttf aus diesem Paket installieren. Anwendungen neu öffnen.

WOFF2 ist die bevorzugte Webschrift, WOFF und TTF sind Alternativen.
Alle Fontdateien sind einfarbig; die Farbe folgt der CSS-Textfarbe.

## Für deutsche Texte

```html
<link rel="stylesheet" href="arcane.css">
<p class="arcane-text">König Kök führt zwölf große Wölfe über die Straße.</p>
```

arcane-text nutzt die Familie "Aleria Arcana Text". Diese Schriftfamilie enthält
keine Runenligaturen, auch bei Verwendung als installierte TTF ohne CSS.
Satzzeichen wie ! und Apostrophe bleiben normale Satzzeichen. Jeder Buchstabe
erhält sein Schriftzeichen. Groß- und Kleinbuchstaben haben dieselbe Form.

## Für die bisherigen Runenformeln

```html
<span class="arcane">R CH B</span>
<span class="arcane">FC!</span>
```

arcane verwendet wie bisher die Familie "Aleria Arcana". CH SH TH HL GH NG DZ
TS AE bilden je eine Rune. ! ist Xhael, ' und ’ sind Ón. Æ/æ ist Aetha.
Ein Leerzeichen trennt die Runen. arcane-separated unterdrückt Ligaturen.
K/k ist ein Alias von C/c. Damit wird KH im Runenmodus wie CH geformt.
Für buchstabengetreue deutsche Texte arcane-text verwenden.

## Eindeutige Formeln und Zeichenprüfung

```html
<span id="formel" class="arcane" aria-hidden="true"></span>
<span>Fearn, Coll, Xhael</span>
<script src="arcane.js"></script>
<script>
  document.getElementById('formel').textContent =
    AleriaArcana.encodeTokens(['F', 'C', '!']);
  console.log(AleriaArcana.findUnsupported('König Kök, Grüße & 25 €!'));
</script>
```

encodeTokens ist für die 33 kanonischen Runentokens und den Alias K gedacht.
Es ist keine Funktion zum Übersetzen deutscher Wörter. Die privaten
Unicode-Zeichen U+E000 bis U+E020 bleiben selbst bei aktiven Ligaturen getrennt.
findUnsupported gibt die im Font fehlenden Zeichen zurück, bei vollständiger
Abdeckung eine leere Liste. Kombinierte Akzente werden ebenfalls unterstützt;
Text kann zusätzlich mit text.normalize('NFC') vereinheitlicht werden.

## Quellen und Änderungen

source/glyphs enthält die 33 freigegebenen SVG-Grundformen.
source/compatibility.py enthält die neuen Konturen, Akzente, Ziffern und Satzzeichen.
source/references enthält die Bildvorlagen. alphabet.json enthält die Lore-Daten;
zeichensatz.json beschreibt die technische Zeichenabdeckung.

```sh
python -m pip install "fonttools[woff]" brotli shapely
python source/build_font.py
```

Der Builder erzeugt beide Schriftfamilien als TTF, WOFF und WOFF2 und aktualisiert
zeichensatz.json. Handbuch und PNG-Übersichten sind statische Dokumente.

Die Fonttests prüfen Zeichenabdeckung, Schriftformung und Formatkonsistenz:

```sh
python -m pip install uharfbuzz
python -m unittest discover -s tests
```

Papierstruktur und goldene Farbe sind keine Bestandteile des Fonts. Alle
Punkte und Rauten gehören zur einfarbigen Kontur. Die Schriftdatei verändert
die Darstellung, nicht den Inhalt. Für wichtige Inschriften eine lesbare
Beschreibung beibehalten. Keine automatische Sprachübersetzung oder Verschlüsselung.
Die für Aleria erstellten Entwürfe können verwendet, eingebettet und bearbeitet werden.
