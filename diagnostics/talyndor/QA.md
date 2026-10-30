# Talyndor · lokale Prüfung am 29. Oktober 2026

- 14 unveränderte Originale mit SHA-256 archiviert, einschließlich der großen
  Vorbereitungskarte und Thornwicks vorhandenem Registerwappen.
- 12 neue Ortsnamen, 7 neue Hausnamen (Königshaus eingeschlossen) und 16
  Regionsnamen gegen den übrigen Aleria-Textbestand geprüft; keine Treffer.
- 16 vollständige Einzel- und Earltumsbanner sowie 7 erzeugte Hauswappen geprüft.
  Heraldik-Audit: 23 Einträge, Original-RGB unverändert, kreisrunde Wappen innen
  vollständig deckend, Außenflächen transparent.
- 18 Krieger geprüft: keine Auditfehler. Neun Fassungen haben schmale, aber
  vollständig transparente Bildränder von 7–12 Pixeln. Alle Motive bleiben im
  Bild; die Figuren werden vollständig mit `object-fit: contain` angezeigt.
- Kontaktbögen und die zwölf Quellanker tatsächlich angesehen.
- Brigane nach Nutzerkorrektur mit zwei wütenden weißen Pitbulls auf Wappen,
  Banner, Brust und Schild. Pferdefassungen im Archiv. Ashton und Thornwick
  mit überarbeiteten vollständigen Pferdeansichten; beide vier Hufe sichtbar.
- 14 Node-Tests bestanden: Landesdaten, vollständige Assets und Quellhashes,
  Klassen-/Zuchtlinks, bewegliche Ausgangssitze, atomarer Import, gemeinsame
  Auswahl- und Drag-Regeln, Rückgängig und Zustandskapselung.
- Alle 18 Hausfenster auf Desktop (1093 CSS-Pixel) und Handy (312 CSS-Pixel)
  wirklich geöffnet: passende Titel und Bilder, Bilder geladen, `contain`,
  Scrollbeginn 0 und keine horizontale Überbreite. Alle 16 Bannerfenster
  geöffnet und geladen. Ein schmaler Überstand langer Regionsnamen im
  Handyformat wurde innerhalb des Talyndor-CSS behoben und erneut geprüft.
- Alternative Auswahl, Sitzwechsel, Persistenz nach Neuladen, Rückgängig,
  echter Pointer-Drag von Wetherham nach Dunworth, JSON-Download, Import
  desselben Exports und Zurücksetzen im Browser geprüft.
- Alle Testzuordnungen entfernt: Lennwyck/Wetherham, Warren/Wensbury,
  Aldred/Edrington, Brigane/Aveldon; weitere 14 Häuser ohne Sitz.
- Temporäre Viewport-Overrides zurückgesetzt. Lokale Seite bleibt geöffnet.

Belege: `browser-checks.json`, `brigane-desktop.png`, `brigane-mobile.png`,
`name-audit.json`, `map-anchors.jpg`, `heraldry/heraldry-contact.jpg` und
`warriors/audit.json`, `warriors/contact-sheet.jpg`.

Vollständige verwendete Bildprompts und Referenzen:
`Vorschau/Talyndor/art-prompts.json`, `warrior-prompts.json`,
`generation-receipts.json`, `correction-receipts.json`.
Werkzeug: eingebautes `image_gen`; Alpha-Bereinigung gemäß fortgeltender
Nutzerfreigabe. Lokaler Vorbereitungsstand, noch kein neuer Release.
