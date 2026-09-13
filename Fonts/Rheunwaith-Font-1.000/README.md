# Rheunwaith · Gezeitenrunen · Version 2.000

Der gewählte Entwurf II als echter Desktopfont und Webfont. Namen,
Tastaturzuordnung und Doppelzeichen des bisherigen 30-Zeichen-Alphabets
bleiben erhalten. Das neue Design verbindet kräftige Stämme, breite Rundungen
und kurze keilförmige Abschlüsse. Seine Formen funktionieren einfarbig.

## Schnellstart

1. Das ZIP vollständig entpacken und `demo.html` öffnen.
2. Eigenen Text eingeben. Die Testseite meldet fehlende Unicode-Zeichen.
3. Für deine Website `rheunwaith.css` und den Ordner `fonts/` übernehmen.

```html
<meta charset="utf-8">
<link rel="stylesheet" href="rheunwaith.css?v=2-gezeiten">
<p class="rheunwaith">Gawain Tristan Chwerw Llwyd Ngoll Rhyd</p>
<p class="rheunwaith-text">König Kök grüßt zwölf Jäger & 25 €.</p>
```

Die Fontpfade beziehen sich auf den Speicherort der CSS-Datei. Alle Dateien
funktionieren ohne externe Dienste. Auf der Testseite muss JavaScript erlaubt sein;
die normale Verwendung des Fonts in HTML benötigt kein JavaScript.

## Bestehende Einbindung aktualisieren

Die alte CSS-Datei und alle Fontdateien ersetzen. Nur das WOFF auszutauschen
reicht nicht, wenn dein Browser weiterhin das alte WOFF2 lädt. Die neuen Fontdateien
liegen im Ordner `fonts/`; eigene `@font-face`-Pfade entsprechend anpassen.
Die Dateiadressen enthalten einen Versionszusatz. Anschließend Strg+F5 drücken.

Für Desktopprogramme `fonts/Rheunwaith-Regular.ttf` installieren und die alte
Rheunwaith-Version ersetzen. Bereits geöffnete Programme neu starten.
Die Familie heißt weiterhin `Rheunwaith`. WOFF2 und WOFF dienen der Webeinbindung.

## Zwei Schreibmodi

| CSS-Klasse | Verhalten |
| --- | --- |
| `rheunwaith` | Traditionelle Doppelzeichen Ch, Ll, Ng, Rh und Th sind aktiv. |
| `rheunwaith-water` | Derselbe Modus mit einer dunkelblauen Textfarbe. |
| `rheunwaith-text` | Jeder getippte Buchstabe bleibt einzeln; geeignet für deutschen Fließtext. |
| `rheunwaith-separated` | Zusatzklasse zum Abschalten der Ligaturen. |

Groß- und Kleinbuchstaben zeigen dieselbe Rune. T und Th verwenden wie bisher
Thal. Ch, Ll, Ng und Rh haben eigene Zeichen. Leerzeichen trennen die Eingabe:
`C H` sind zwei Zeichen, `Ch` wird im traditionellen Modus eines. Eine
Ligaturfolge sollte innerhalb desselben Textelements stehen; zusätzlicher
Buchstabenabstand kann Ligaturen je nach Anwendung beeinflussen.

## Auch außerhalb des Lore-Alphabets

Enthalten sind A–Z und a–z einschließlich Q; Ä Ö Ü ä ö ü ß ẞ; Ziffern 0–9;
alle druckbaren ASCII-Zeichen U+0020 bis U+007E; Latin-1 ab U+00A0 und der
gesamte Block Latin Extended-A U+0100 bis U+017F. Dazu gehören etwa É, à, ç,
ñ, Ğ, İ, ı, Ş, Ł, æ und œ.

Hinzu kommen die zugehörigen kombinierten Akzente, typografische Anführungszeichen,
Apostrophe, Striche, Auslassungszeichen, Währungszeichen (€ £ ¥ ₺), © ® ™ § ¶,
Pfeile ← ↑ → ↓ ↔, ausgewählte Rechenzeichen (≠ ≤ ≥ ≈ ∞) sowie Hoch- und Tiefzahlen.
Auch geschützte und schmale Leerzeichen sind vorhanden.

`zeichensatz.json` und die vollständige Übersicht in `demo.html` enthalten
die verbindliche Liste. „Vollständig“ bezieht sich auf diese Zeichenbereiche,
nicht auf ganz Unicode. Andere Schriftsysteme, Emoji und nicht aufgeführte
Spezialzeichen werden gegebenenfalls mit einer Ersatzschrift dargestellt.

Q ist jetzt benutzbar, erhält aber keinen erfundenen Lore-Namen. Ä, Ö und ß
sind ebenfalls technische Ergänzungen; Ü bleibt die überlieferte Rune Uffyr.
ß und ẞ verwenden dieselbe zusätzliche Form; SS bleibt zweimal S.
Akzente können sowohl zusammengesetzt als auch zerlegt eingegeben werden.

## Direkte Runeneingabe und alte Daten

Die 30 ursprünglichen Adressen U+10C00 bis U+10C1D bleiben im Font zugeordnet.
Zusätzlich gibt es die privaten Adressen U+E300 bis U+E31D. Diese verhindern,
dass Regeln eines anderen Unicode-Schriftsystems die Reihenfolge verändern.

```html
<span id="runen" class="rheunwaith" aria-hidden="true"></span>
<script src="rheunwaith.js"></script>
<script>
  document.getElementById('runen').textContent =
    Rheunwaith.encodeTokens(['Ch', 'Ll', 'Ng', 'Rh', 'Th']);
  console.log(Rheunwaith.findUnsupported('Kök & 25 €')); // []
  // Bei früher bereits gespeicherten Runenzeichen:
  // anzeige.textContent = Rheunwaith.toPrivateUse(alterText);
</script>
```

`encodeTokens` akzeptiert die 30 kanonischen Tokens sowie T als Alias für Th.
Technische Ergänzungen wie Q, Ä und ß werden normal getippt und sind keine
Lore-Tokens. `toPrivateUse` ersetzt nur die 30 alten Unicode-Zeichen durch
ihre entsprechenden privaten Zeichen. Sonstiger Text bleibt unverändert.
`findUnsupported` prüft nach NFC-Normalisierung und akzeptiert Tabs und Zeilenumbrüche.
Für beliebige geschriebene Texte nicht pauschal `encodeTokens` verwenden.

## Sprache, Bedeutung und Darstellung

Das `Handbuch.html` bündelt sämtliche Angaben aus den bereitgestellten Quellen
mit den neuen Zeichenbildern. Eine Markdown-Fassung liegt als `Handbuch.md` bei.
Die Dateien legen Namen und Belegung fest, aber keine vollständige Grammatik,
Wortbedeutungen oder Übersetzungsregeln. Solche Angaben wurden nicht erfunden.
Ein deutscher Satz in diesem Font bleibt sprachlich ein deutscher Satz.

Die Schrift ist keine Verschlüsselung. Für wichtige Inhalte eine lesbare
Klartextfassung beibehalten. Rein dekorative Runen können `aria-hidden="true"`
erhalten. Textfarbe und Hintergrund werden durch CSS bestimmt.

## Dateien und Quellen

- `fonts/`: TTF, WOFF und WOFF2.
- `demo.html`, `rheunwaith.css`, `rheunwaith.js`: lokale Vorschau und Einbindung.
- `Handbuch.html`, `Handbuch.md`: vollständige Dokumentation des vorliegenden Alphabets.
- `Zeichentafel.png`, `Erweiterter-Zeichensatz.png`, `Leseprobe.png`: echte Fontrenderings.
- `alphabet.json`, `ergaenzungen.json`, `zeichensatz.json`: kanonische und technische Daten.
- `source/glyphs/`: bearbeitbare Konturen der 32 Grundformen.
- `source/references/`: freigegebener Entwurf und generierte Ergänzung.
- `source/original/`: bisherige Dokumentation, Belegung, CSS, Bilder und Testseite als Quellenarchiv.
- `source/build_font.py`, `source/compatibility.py`, `source/test_font.py`: Fontbau und Prüfung.
- `OFL.txt`, `LIZENZHINWEISE.md`: mitgelieferte Lizenz und Herkunftshinweise.
- `Pruefbericht.md`: Prüfergebnisse und genauer Umfang der Validierung.

Die neuen Grundformen sind aus dem ausgewählten Bild und passenden generierten
Ergänzungen nachgezeichnet. Die SVG-Dateien sind lediglich Masterkonturen für
den Fontbau. Die Darstellung auf deiner Seite verwendet echte Fontdateien.

## Font selbst neu bauen

```sh
python -m pip install "fonttools[woff]" brotli shapely skia-pathops
python source/build_font.py
python -m pip install uharfbuzz
python source/test_font.py
```

Der Builder benötigt keine Bildgenerierung. Er nutzt die mitgelieferten Konturen.
Handbuch und PNG-Übersichten sind statische Ausgaben. Für reproduzierbare
Aktualisierung liegt zusätzlich `source/build_specimens.py` bei (benötigt Pillow).
Die HTML- und JavaScript-Logik lässt sich mit `node source/test_demo.cjs` prüfen.
