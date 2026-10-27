# Iathneach und besetztes Lothir · Lokaler Prüfstand

Fertiggestellt am 27. Oktober 2026. Kein Commit, Push oder Deployment.
Die zuvor vorhandene Uathneach-Arbeit bleibt erhalten.

- Iathneach: neun gelieferte Clanwappen, neun neue Krieger, acht Orte,
  vier Großregionen und zwölf Regionalbanner. Nur Botharin und Sgeir Tearmainn
  haben die beiden vorgegebenen Clansitze; sieben Clans bleiben offen.
- Triarchie: ausschließlich Lothir, zwölf Teilgebiete in drei Großregionen,
  fünf albische Banner, zehn aldingische Gebietsschilde, elf neue runde
  Familienwappen und elf Krieger. Drei neue albische Clans und acht Aldinger
  Häuser mit bearbeitbaren Sitzvorschlägen; Cuansioda bleibt ohne neuen Clan.
- Besetzte Gebiete und ihre Familien erscheinen bei Iathneach und Aldingen
  ausgegraut. Herkunft und Besatzung bleiben getrennte Felder einer gemeinsamen
  Quelle. Die Mac Farraigeach werden nicht doppelt als gegenwärtige Herren geführt.
- Nutzerkorrekturen: Baummarder ohne Hammer; Handwerkswappen ersetzt durch Eber,
  Seeadler, Luchs, Steinbock und Greif. Ruder statt versehentlicher Ledergurte
  auf Hohenreedes Gebietsschild. Alle ersetzten Generatorbilder bleiben archiviert.

## Dateien und Bildprompts

Alle Bilder wurden mit dem **eingebauten image_gen-Bildgenerator** erstellt;
keine API-/CLI-Generierung. Je Motiv ein eigener Aufruf mit tatsächlichen
Stil- und Motivreferenzen. Alle fertig gewählten Bilder liegen im Projekt.

| Inhalt | Iathneach | Triarchie |
| --- | --- | --- |
| Seite | [index.html](../../Vorschau/Iathneach/index.html) | [index.html](../../Vorschau/Triarchie/index.html) |
| Wappen- und Bannerprompts | [art-prompts.json](../../Vorschau/Iathneach/art-prompts.json) | [art-prompts.json](../../Vorschau/Triarchie/art-prompts.json) |
| Kriegerprompts | [prompts.json](../../Vorschau/Iathneach/assets/warriors/prompts.json) | [prompts.json](../../Vorschau/Triarchie/assets/warriors/prompts.json) |
| Ausgaben, Korrekturen, Referenzen | [Provenienz](../../Vorschau/Iathneach/assets/generation-provenance.json) | [Provenienz](../../Vorschau/Triarchie/assets/generation-provenance.json) |
| Finale Wappen/Banner | `Vorschau/Iathneach/assets/production/` | `Vorschau/Triarchie/assets/production/` |
| Finale Krieger | `Vorschau/Iathneach/assets/warriors/production/` | `Vorschau/Triarchie/assets/warriors/production/` |

Iathneachs gelieferte Clanwappen stehen unverändert in
`Vorschau/Iathneach/assets/originals/`; ihre WebP-Fassungen unter `assets/crests/`.
Alle Generatororiginale und ersetzten Fassungen bleiben in `generated/` und
`generated-archive/`. Die genehmigte Alpha-Aufbereitung erhält sämtliche
RGB-Pixel der jeweiligen Generatorausgabe. Die großen Kartenoriginale sind
lokal unter `originals/` archiviert und nicht Teil einer Veröffentlichung.

## Prüfungen

51 Vorschau-Tests bestanden. Quellenkopien, Orts- und Gebietsabdeckung,
Klassenlinks, Bildpfade, Ländertrennung, atomare Importe und Originalhashes
geprüft. Alle 38 erzeugten Heraldikdateien und 20 Krieger bestehen die jeweiligen
Datei-, Hash-, RGB- und Alphaprüfungen. Einige Waffen/Federn haben knappe, aber
transparente Ränder; keine Bildteile sind abgeschnitten. Kleine malerische
Abweichungen wurden nach Nutzervorgabe belassen.

Alle 20 Hausfenster auf Desktop und bei 390 × 844 Pixeln tatsächlich geöffnet:
richtige Titel, geladene Wappen und Krieger, Scrollbeginn oben und kein
horizontaler Überlauf. Kalte Erstladungen wurden nachgeladen und erneut geprüft.
Die Figuren verwenden `object-fit: contain`. Drag von Botharin nach Ailtean,
Auswahlalternative, Rückgängig, Speicherung nach Neuladen, echter Dateiimport
und Zurücksetzen wurden erfolgreich erprobt. Testzuordnungen sind zurückgesetzt.
Auch Gebietsbanner, Kite-Schilde, die große Karte und Aldingens acht graue
Familienverweise wurden im Browser geprüft. Temporäre Viewports sind zurückgesetzt.

Belege: [Browserprüfung](qa/browser-review.json),
[Iathneach Desktop](qa/iathneach-house-desktop.png),
[Iathneach Mobil](qa/iathneach-farraigeach-mobile.png),
[Baummarder ohne Hammer](qa/triarchie-taghan-desktop.png).

Die Länder besitzen ihre Inhalte; gemeinsame Werkstatt-, Karten-, Drag- und
Entwurfsfunktionen bleiben unter `Vorschau/shared`. Aldingens bisheriger Controller
und seine allgemeinen Stile wurden gezielt in diese gemeinsame Verantwortung
extrahiert. Besetzte Familien und Gebiete besitzen je eine gemeinsame Quelle,
damit spätere vollständige Herrschaftsseiten dieselben Identitäten übernehmen.
Kanonische Register und Firebase werden nicht verändert.
