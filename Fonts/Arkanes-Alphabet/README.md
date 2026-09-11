# Aleria Arcana 2.0

## Alte Ritualrunen

Alle 33 Zeichen des Arkanen Alphabets in der gewählten Gestaltung III.
Die zwölf großen Zeichen der Referenz sind in Lesereihenfolge übernommen:
A, B, C, D, E, F, G, H, I, L, M, N. Die 21 übrigen Zeichen sind im selben
Stil ergänzt. Namen, Laute, Zahlenwerte und Tastatureingaben bleiben erhalten.

Die Schrift übernimmt die Konturen, einschließlich freistehender Punkte und
Rauten. Papier, Flecken und Farbtextur sind kein Teil des Fonts. Alle Teile
einer Rune folgen der Textfarbe, auch die ursprünglich goldenen Akzente.

## Auf der Website verwenden

1. Den gesamten Ordner entpacken.
2. arcane.css und fonts/ gemeinsam auf die Website kopieren.
3. Stylesheet verlinken und die Klasse arcane verwenden:

```html
<link rel="stylesheet" href="arcane.css">
<span class="arcane" style="font-size:64px;color:#254338">R CH B</span>
```

demo.html ist die mitgelieferte Schriftprobe. Sie lädt nur lokale Dateien.
WOFF2 ist die bevorzugte Webdatei; WOFF und TTF sind Alternativen.
TTF kann zusätzlich auf dem Rechner installiert werden.
Bei einem Update auf der bestehenden Website CSS und alle Fontdateien ersetzen.
Die neuen CSS-Adressen enthalten ?v=2 für einen frischen Browserabruf.
Ist die alte TTF installiert, diese durch die neue Version ersetzen.

## Eindeutige Eingabe

CH SH TH HL GH NG DZ TS AE bilden jeweils eine Rune. Groß-, Klein- und
Mischschreibung funktionieren. `C H` bleibt getrennt. Mit der zusätzlichen
CSS-Klasse `arcane-separated` lassen sich alle Ligaturen abschalten.
Kein zusätzliches letter-spacing setzen; Doppelzeichen im selben Textelement
halten. Bei überlappenden Doppelzeichen eine beabsichtigte Folge explizit
trennen oder die untenstehende Tokenfunktion verwenden.

`'` und `’` stehen für Ón, `!` für Xhael, Æ/æ zusätzlich für Aetha.
J K Q W Ä Ö Ü ß sind nicht im festgelegten Alphabet enthalten. Dafür erscheint
die normale Ersatzschrift. Für den Laut k ist das Zeichen C vorgesehen.
Ziffern und sonstige Satzzeichen verwenden ebenfalls die Ersatzschrift.
Normale Ausrufezeichen und Zitatapostrophe außerhalb des arcane-Elements setzen.

## Formeln ohne zufällige Ligaturen

```html
<span id="formel" class="arcane" aria-hidden="true"></span>
<span>Fearn, Coll, Xhael</span>
<script src="arcane.js"></script>
<script>
  document.getElementById('formel').textContent =
    AleriaArcana.encodeTokens(['F', 'C', '!']);
</script>
```

Die Funktion gibt Zeichen aus U+E000 bis U+E020 zurück. Diese privaten
Unicode-Zeichen bleiben auch bei aktivierten Ligaturen einzeln: ['C','H']
sind zwei Runen, ['CH'] ist eine. Die PUA-Adressen sind eine lokale Belegung.
Unbekannte Tokens werden mit einem Fehler abgewiesen.

Farkael ist ein Zaubername; seine bedeutungstragende Runenfolge lautet FC!.
Der Font ist keine automatische Übersetzung. Kopieren von Umschrift liefert
weiter Umschrift; Kopieren von PUA-Text liefert private Unicode-Zeichen.
Zu bedeutungsvollen Inschriften eine lesbare Beschreibung stellen.

## Bearbeitbare Quellen

source/glyphs enthält 33 SVG-Konturen; alphabet.json enthält sämtliche Daten.
source/references enthält das gewählte Bild und die beiden Ergänzungsbögen.
source/design-manifest.json nennt Herkunft, Reihenfolge und Metriken.

Die Fontdateien lassen sich nach Bearbeitung der SVG-Konturen neu erzeugen:

```sh
python -m pip install "fonttools[woff]" brotli
python source/build_font.py
```

Der Builder aktualisiert TTF, WOFF und WOFF2. Handbuch und PNG-Übersicht sind
separate, statische Dokumente und werden dadurch nicht automatisch aktualisiert.
Vektorkonturen sind die editierbare Grundlage; keine Texturen oder Bilder sind
in die Schriftdateien eingebettet.

## Umfang und Verwendung

33 kanonische Runen, neun Doppelzeichen und identische Groß-/Kleinschreibung.
Zahlenwerte: Körper 1 bis 11, Geist 21 bis 31, Seele 41 bis 51.
Die Zeichen wurden für Aleria erstellt. Du kannst die gelieferten Entwürfe
für dein Projekt verwenden, auf Websites einbetten und bearbeiten.
Es wird kein zusätzliches Alphabet und keine neue Sprachgrammatik eingeführt.
