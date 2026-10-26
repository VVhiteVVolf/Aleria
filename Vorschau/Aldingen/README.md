# Großherzogtum Aldingen · Vorbereitung

Eigenständige Besprechungsseite unter `index.html`. Sie übernimmt die gelieferte
Karte und die neue Geschichte des Nutzers. Die elf benannten Orte bleiben erhalten.
Vier farbige Grafschaften werden im Entwurf nach ihren gräflichen Hauptorten
Barenstadt, Borgeln, Grimberg und Zollern bezeichnet. Klingenhagen und die türkis
markierte Herrschaft Aldershafen gehören zur herzoglichen Domäne.

## Wappen und Schilde

Die fünfzehn gelieferten Hauswappen und das Landeswappen werden motivtreu
überarbeitet. Hinzu kommen Rebhart, Schenk, Ankerhold und Rosswarth sowie die
albischen Clans Adharcan (Narwal), Sgiathan (Rochen), Ronnach (Meeresschildkröte)
und Dublann (Sepia). Die Namen wurden gegen die 564 Einträge des Stammbaumregisters
geprüft; die vier Tiermotive gegen 152 vorhandene albische Registerwappen.
Die neue Nutzerkorrektur ersetzt Ronnachs ursprünglichen Walrossentwurf durch
eine Meeresschildkröte. Die alte Generatorausgabe und ihr vollständiger Prompt
bleiben als nicht eingebundene Arbeitsfassung archiviert.

Vier gemeinsame Grafschaftsschilde und elf einzelne Gebietsschilde ergeben
fünfzehn Kite-Schilde auf quadratischer Bildfläche. Klingenhagens einziges Schild
wird für die eigene Grafschaft und Baronie gemeinsam verwendet. Es gibt kein
zusätzliches doppeltes herzogliches Grafschaftsbild. Haus- und Landeswappen bleiben
kreisrund. Es werden keine Kriegerbilder erzeugt.

`house-data.mjs` und `territory-data.mjs` besitzen Motive und Zuordnungen.
`realm-context.mjs` besitzt ausschließlich den erzählerischen Kontext.
`scripts/build-art-prompts.mjs` schreibt den vollständigen Promptkatalog
`art-prompts.json`. Alle Bilder werden einzeln mit dem eingebauten `image_gen`
erzeugt. Tatsächliche Bildreferenzen stehen absolut und relativ zum Arbeitsbereich
im Promptkatalog; Generator-Dateinamen in `assets/generated/provenance.json`.

Unveränderte Generator-PNGs liegen unter `assets/generated`, Produktions-PNGs unter
`assets/production`, die runden WebP-Bilder unter `assets/crests` und die spitzen
unter `assets/shields`. `scripts/prepare_art.py` verwendet die vorhandene gemeinsame
Wappen-Alphabereinigung. Die zusätzliche Kreisfreistellung und transparente
Zentrierung verändern ausschließlich Alpha beziehungsweise Randgröße; sämtliche
RGB-Pixel der Originalausgabe bleiben unverändert. Es findet keine zeichnerische
Nachbearbeitung statt. Parameter, Prüfsummen und Kreisgeometrie stehen in
`assets/art-manifest.json`. `--audit` prüft die tatsächlichen Bilddateien;
`--contact` erstellt nur lokale Kontrollübersichten.

## Quellen und Arbeitszustand

Die sechzehn kleinen gelieferten Wappen liegen unverändert unter
`assets/originals`. `assets.source.json` enthält die SHA-256-Werte aller siebzehn
gelieferten Dateien. Die originale Karte ist größer als 100 MB und wird unverändert
unter `diagnostics/aldingen-2026-10-26/backup/map-supplied.png` lokal archiviert,
außerhalb der Veröffentlichung. `scripts/prepare_sources.py` exportiert daraus
die unverändert gezeichnete Karte als 4096-Pixel-WebP und als vollständige
8192-Pixel-WebP. Keine Grenzen, Beschriftungen oder Karteninhalte werden übermalt.

Die vier Ausgangssitze sind Klingen → Klingenhagen, Truchsen → Zollern,
Hohenmund → Grimberg und Ritten → Barenstadt. Alle übrigen neunzehn Familien
beginnen ohne Sitz. Auch die vier vorgegebenen Sitze sind im Entwurf bearbeitbar;
sie werden nicht mit den fest gesperrten Goldmunder Familien gleichgesetzt.
Ein Sitzwechsel verändert keinen Familienrang und keine Lehnsherrenbeziehung.

`placement-state.mjs` konfiguriert den gemeinsamen gekapselten Entwurfszustand.
`house-placement.mjs` besitzt Auswahl, Speicherung, Import/Export und die
Kartenanbindung. Maus und Stift können ziehen; Tastatur und Touch verwenden
dieselben Auswahl- und Zielschaltflächen. Gemeinsame Karten-, Zuordnungs- und
Drag-Logik wird aus `Vorschau/shared` wiederverwendet. `art-dialogs.mjs` besitzt
die Wappenfenster. Die CSS-Dateien bleiben nach diesen Verantwortlichkeiten
getrennt. Es werden keine kanonischen Register oder Firebase-Daten geschrieben.

Prüfungen: `node --test Vorschau/tests/aldingen.test.mjs` und
`python -B Vorschau/Aldingen/scripts/prepare_art.py --audit`.
