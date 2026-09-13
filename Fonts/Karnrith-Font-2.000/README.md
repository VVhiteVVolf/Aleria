# Karnrith Tiefenrunen 3.000 und Morgar 1.1

Gewählte Gestaltung: II · Tiefenrunen. Hohe, massive Pfeilerformen,
Keilabschlüsse, gebrochene Innenräume und diagonale Meißelschnitte.

## Direkt ausprobieren

1. Das gesamte ZIP entpacken.
2. `demo.html` im Browser öffnen.
3. Eigenen Text eingeben, Schriftgröße ändern und die Doppelzeichen testen.

Für Windows oder ein Gestaltungsprogramm die TTF oder OTF im Ordner
`fonts/` öffnen und installieren. Es handelt sich um die neue Familie
**Karnrith Tiefenrunen**. Die alte Familie Karnrith Hochschnitt hat einen
anderen Namen und wird nicht versehentlich aus dem Fontcache verwendet.

## HTML-Einbindung

Die Datei `karnrith.css` und den vollständigen Ordner `fonts/` zusammen
in dein Projekt kopieren. Der Fontpfad wird relativ zur CSS-Datei aufgelöst.

```html
<meta charset="utf-8">
<link rel="stylesheet" href="karnrith.css?v=3">

<!-- Morgar mit sieben traditionellen Doppelzeichen -->
<p class="karnrith">Úrortharn Faurgor Dhaihald Ungrum</p>

<!-- Deutscher Text buchstabengetreu, ohne automatische Doppelzeichen -->
<p class="karnrith-text">König Kök grüßt zwölf Jäger: ÄÖÜ ßẞ C J X!</p>
```

`morgar` ist ein Klassenalias für `karnrith`. Textfarbe, Größe und Zeilenhöhe
lassen sich mit normalem CSS anpassen. Es sind keine Bilder oder SVG-Dateien
zum Anzeigen des Textes erforderlich. Bei einer Aktualisierung alle
Fontdateien und das Stylesheet ersetzen, dann die Seite mit Strg+F5 neu laden.

## Zeichenumfang

- Alle 30 kanonischen Bedeutungszeichen und sieben Doppelzeichen.
- A–Z und a–z einschließlich eigener technischer C-, J- und X-Formen.
- ÄÖÜ/äöü, ß/ẞ und die langen Vokale ÁÉÍÓÚÝ/áéíóúý.
- Ziffern 0–9 und sämtliche druckbaren ASCII-Zeichen, auch Klammern,
  geschweifte Klammern, Schrägstriche, Anführungszeichen und Tastatursymbole.
- Latin-1 ab U+00A0 und Latin Extended-A vollständig.
- Kombinierte Akzente, typografische Satzzeichen, zusätzliche Währungen,
  ausgewählte Rechenzeichen, Pfeile, Hoch- und Tiefzahlen.

Die exakten Unicode-Adressen stehen in `zeichensatz.json` und werden auf der
Testseite vollständig angezeigt. Groß- und Kleinbuchstaben verwenden
dieselbe Grundform, bleiben als eingegebener Text aber erhalten. ß/ẞ besitzen
eine eigene Form. Umlaute und lange Vokale sind durch Akzente unterscheidbar.
Fertig eingegebene und zerlegte Akzentzeichen werden gleich dargestellt.

## Doppelzeichen und direkte Runencodes

NG, TH, KH, GH, SH, CH und DH werden mit aktivem `liga` jeweils zu einem
Zeichen. Alle Groß-/Kleinschreibweisen funktionieren. T allein ist weiterhin
Targ und wird nicht zur Tharn-Rune. C allein verwendet die technische C-Form;
CH verwendet das kanonische Chor-Zeichen.

Für neue direkte Runenfolgen verwendet Karnrith U+E500 bis U+E51D.
Die bisherigen Adressen U+E300 bis U+E31D bleiben als Aliase in dieser
Fontfamilie erhalten. So funktionieren bestehende Karnrith-Texte weiter.
Rheunwaith verwendet ebenfalls den alten Bereich: Die Schriftfamilie muss
daher bei alten Texten mitgeführt werden. Keine globale Konvertierung
gemischter Texte durchführen.

Das optionale `karnrith.js` enthält Hilfsfunktionen:

```html
<script src="karnrith.js"></script>
<script>
const runen = Karnrith.encodeTokens(["K", "GH", "NG"]);
const alterKarnrithText = "\uE300\uE301";
const neueCodes = Karnrith.fromLegacy(alterKarnrithText);
const nichtEnthalten = Karnrith.findUnsupported("Kök & 25 €");
</script>
```

`fromLegacy` ist nur für bekannte alte Karnrith-Texte bestimmt und wird
auf der Testseite ausschließlich durch den entsprechenden Knopf ausgelöst.
`encodeTokens` verwendet die 30 kanonischen Zeichen; technische Zeichen
wie C, J, X oder ß schreibt man normal über die Tastatur. Direkte Runencodes
werden nicht nochmals als Doppelzeichen verbunden.

## Sprache und Dokumentation

`Sprache/Sprachbibel-Morgar-1.1.html` enthält Lautsystem, Betonung, Fugen,
Kurzformen, sämtliche Wurzeln und Affixe, 100 Grundwörter sowie 200 Namen.
Alle bisherigen Formen bleiben zum Vergleich sichtbar. Die maschinenlesbare
Fassung `Sprache/morgar.json` bewahrt außerdem Quellnummern, alte Herleitungen
und die Änderungsgründe. Die ursprüngliche Sprachbibel bleibt unverändert
unter `source/original/` erhalten.

Die Schrift ersetzt sichtbare Zeichen; sie übersetzt keine deutschen Sätze
in Morgar. Eine ideographische Sinnfolge und ein ausgeschriebenes Wort sind
verschiedene Darstellungsarten. Aussprache und Wortbildung gehören zur Sprache,
nicht zur Fontdatei. Für wichtige Website-Inhalte eine lesbare Klartextfassung
beibehalten.

## Paket und Quellen

- `fonts/`: TTF, echtes CFF-OTF, WOFF und WOFF2.
- `demo.html`, `karnrith.css`, `karnrith.js`: Vorschau und Webeinbindung.
- `Zeichentafel.png`, `Tastaturzeichen.png`, `Leseprobe.png`: echte Fontrenderings.
- `Sprache/`: vollständige überarbeitete Sprachunterlagen.
- `alphabet.json`, `ergaenzungen.json`, `zeichensatz.json`: Zuordnungen.
- `source/references/`: gewählte Vorlage und Ergänzungstafeln.
- `source/glyphs/`: 50 aus den Bildern übertragene Masterkonturen.
- `source/`: reproduzierbarer Fontbau und Prüfprogramme.
- `Pruefbericht.md`, `LIZENZ.md`: Prüfstand und Herkunft.

## Neu bauen

```sh
python -m pip install "fonttools[woff]" brotli shapely skia-pathops
python source/build_font.py
python -m pip install uharfbuzz Pillow
python source/test_font.py
python source/make_proofs.py
node source/test_demo.cjs
```

Nur für eine erneute Übertragung der Referenzbilder werden zusätzlich
`numpy`, `scipy` und `vtracer` benötigt: `python source/extract_masters.py`.
Für den normalen Fontbau sind die mitgelieferten Masterkonturen ausreichend.
