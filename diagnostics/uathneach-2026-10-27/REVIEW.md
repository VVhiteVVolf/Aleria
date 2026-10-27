# Uathneach: 26 Kriegerentwürfe

Alle 26 Clans der bestätigten Uathneach-Quelle haben eigene Ganzkörperbilder.
26 Generatororiginale, Produktions-PNGs, WebP-Vorschauen und Herkunftseinträge
liegen unter `Vorschau/Uathneach/assets/warriors/`.

- Vorhandene Wappen und die verbindliche Stilreferenz vor den Generierungen angesehen.
- Klassen aus `Klassenordner/Alben/`; keine Übernahme deutscher Ritterklassen.
- Tirashan und Curragh anhand der vorhandenen Bestiarium-Bildtafeln dargestellt.
- Jede erzeugte Figur einzeln und im vollständigen Kontaktbogen geprüft: keine
  groben Waffen-, Schild-, Instrument- oder Pferdeanatomiefehler festgestellt.
- Alpha-Audit: 26 von 26 bestanden; RGB und Originale unverändert, keine gefüllten
  transparenten Zwischenräume, keine Produktionssilhouette berührt den Bildrand.
  Zwölf Bilder haben knappe, weiterhin transparente Ränder von 4–15 Pixeln.
- Vorschau-Suite: 45 Tests bestanden, keine Fehler.
- Browser: alle 26 Fenster bei 1280 × 900 und 390 × 844 geöffnet und geprüft.
  Alle 52 Aufrufe zeigen das richtige vollständig geladene Bild, `contain`,
  Scrollposition 0 und keine horizontale Überbreite. `qa/browser-audit.json`.
- Auch Kartenaufruf und Variante 3 geprüft; Mac Midgna zeigt dort korrekt den
  historischen Vorschlagsrang Dún Tiarna mit Mac Roich als unmittelbarem Lehnsherrn.
  Anschließend Variante 1 wiederhergestellt und normale Browsergröße zurückgesetzt.
- Im Browserprotokoll nur eine Meldung einer Chrome-Erweiterung, kein Seitenfehler.
- Lokale Vorschau offen; kein Commit, Push oder Deployment dieser Ergänzung.

Bildbelege: `qa/desktop-laga.png`, `qa/mobile-dal-siubhran.png`.
Kontaktbogen und Alpha-Prüfung: `warriors/`.
