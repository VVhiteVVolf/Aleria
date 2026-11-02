# Inventar: Browserregression am 2. November 2026

Die lokale Prüfung verwendet eine Kopie von Gais Wyrms tatsächlicher Inventarakte.
Sie speichert keine Figur, keine Kreatur und kein Modul. Der Vorschauhelfer
blockiert externe Schreibzugriffe; der Kreaturbogen-Link wird gegen einen lokalen
Gateway geprüft.

```powershell
node AleriaAlmanach/tests/character-inventory-theme.browser.mjs
```

Bestanden sind Suche, leere Trefferlisten, Kategorien, Auswahl und Fokuskarte,
Itemdialog und Diagramm, Kartenabschluss, unveränderte Besitzdaten in der
Leseansicht, exakte Kreatur-ID, Bilder und Kategorie-/Aktionsicons sowie die
generierte Hintergrundtextur. Die editierbare Modulansicht berechnet Ein- und
Auszahlungen einschließlich Eisenpfennigen exakt: 100 → 303,50 → 253,25 Kupfer.
Ein ungedeckter Abzug bleibt wirkungslos. Die Itembearbeitung aktualisiert die
Vorschau; Abbrechen erhält die ursprünglichen Itemdefinitionen.

| Ansicht | Breite / Scrollbreite |
| --- | --- |
| Charakter bei 1680 px | 1628 / 1628 px |
| Charakter bei 1440 px | 1388 / 1388 px |
| Charakter bei 390 px | 358 / 358 px |
| Charakter bei 320 px | 288 / 288 px |
| Editierbares Modul bei 390 px | 390 / 390 px |
| Editierbares Modul bei 320 px | 320 / 320 px |

Der Lauf hatte keine JavaScript-Fehler. `browser-verification.json` enthält die
Prüfgruppen und den Bildordner. Desktop, Mobilkarten, Itembearbeitung und mobile
Münzbedienung wurden zusätzlich visuell angesehen.

Der dabei erkannte Kontrastfehler der Radar-Beschriftungen im Itemeditor wurde
korrigiert und gezielt nachgeprüft: alle sechs SVG-Beschriftungen verwenden nun
`rgb(199, 183, 143)`. `editor-contrast-verification.json` enthält die berechneten
Farben und den angesehenen Screenshot.

Im anschließenden Checkup wurde auch das Abschneiden langer Radarlabels an der
SVG-ViewBox behoben. Der dauerhafte Browsertest wartet auf `document.fonts.ready`
und prüft danach jedes `text.getBBox()` gegen die ViewBox, auf Desktop und bei
320 px. Alle sechs Beschriftungen passen vollständig hinein. Die zwölf neuen
UI-WebP-Ableitungen laden mit 256 × 256 px, ebenso die WebP-Materialtextur; die
drei eigentlichen Gegenstandsbilder der Gais-Akte behalten ihre PNG-Quellen.

`initial-preview.json` verweist auf den gesonderten Screenshot des
Inventarbereichs: vollständig nach oben gescrollt, Lanze im Fokus und ohne die
globalen Statusmeldungen der absichtlich offline betriebenen Testumgebung. Der
Screenshot beschränkt sich auf den gerenderten Inventarbereich.
