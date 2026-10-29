# Aeldrunmar · Vorbereitungsseite

`http://127.0.0.1:8882/Vorschau/Aeldrunmar/` bei laufendem Aleria-Vorschau-Server.
Buildless ES-Module, eingebunden in die bestehende gemeinsame Länderwerkstatt.

- 35 Häuser; 21 Ausgangssitze aus sechs Earltumsordnern, 14 freie Häuser.
- 23 Einzelgebiete und sechs Earltümer mit insgesamt 29 eigenen Feldbannern.
- 35 Hausfiguren aus sechs zulässigen Klassen, darunter zwölf Darstellungen
  mit einem danebenstehenden Brycing-Hengst.
- Halfax und Ashby sind ausgestorben und werden historisch dargestellt.
- Eigene Regionsnamen: Mark an den äußeren Grenzen, Mere an den Küsten;
  Fold, Hold, Emnet und Land für die übrigen Landschaftsräume.
- Karte und Quellenoriginale bleiben unverändert. Der Namensvorschlag Eadwick
  überlagert ausschließlich den generischen Kartenplatzhalter.
- Orts- und Haus-IDs sind lokal stabil. Ausgangssitze bleiben im Entwurf
  beweglich. Kein Zugriff auf kanonische Register oder Firebase.

Hausdaten, Gebiete, Landeskontext und einzelne Figurenausarbeitungen besitzen
eigene Module. Die gemeinsame Werkstatt besitzt Darstellung, Dialoge,
Karteninteraktion, lokale Speicherung und atomare Importprüfung.

Quellen/Bilder vorbereiten:

1. `node scripts/prepare-art.mjs` erzeugt Importkonfiguration und Promptkataloge.
2. `python -B ../shared/prepare-country-sources.py source-import.json`
3. Einzelbilder mit dem eingebauten Bildwerkzeug und echten Referenzen erzeugen.
4. `python -B ../shared/prepare-country-art.py Aeldrunmar --qa-dir diagnostics/aeldrunmar/heraldry`
5. `python -B prepare-warriors.py build`
6. `python -B prepare-warriors.py audit --expected-count 35`

Generatororiginale, Produktions-PNGs und WebP-Vorschauen bleiben getrennt.
Quellen, vollständige Prompts und Generierungsbelege erhalten; der bestehende
Netlify-Releaseweg gilt erst nach einer eigenen Veröffentlichungsfreigabe.

Die lokale Prüfung ist unter `diagnostics/aeldrunmar` dokumentiert.
Für eine Prüfung ohne Browsercache aus dem Repository-Stamm:
`python -B diagnostics/aeldrunmar/preview-server.py`, anschließend
`http://127.0.0.1:8896/Vorschau/Aeldrunmar/` öffnen.

Die fertigen PNGs liegen unter `assets/production` (Banner) und
`assets/warriors/production` (Figuren). `art-prompts.json` und
`warrior-prompts.json` enthalten den aktuellen Entwurfsstand; die ursprünglich
ausgeführten Aufträge stehen in `generation-receipts.json`, die sechs gezielten
Randkorrekturen in `correction-receipts.json`. Alle Bilder wurden mit dem
eingebauten Bildwerkzeug erzeugt.

Helmüberarbeitung vom 29. Oktober: Halfax mit geschlossenem Reiterhelm und
Geweih, Beran mit stählernem Löwenhelm und roter Mähne, Irwynne mit Geweih,
Aubigny und Trent mit Stierhörnern. Edwynnes schwarzer Brycing ist in eine
anatomisch zusammenhängende Dreiviertelansicht gedreht. Die aktuellen sechs
Produktions-PNGs und WebPs verwenden dieselben Haus-IDs und Bildpfade.
Vorherige Fassungen bleiben unter
`diagnostics/aeldrunmar/revisions/2026-10-29-helmet-variation` erhalten.
Die Bearbeitungsprompts stehen in `helmet-revision-prompts.json` und
`framing-correction-prompts.json`, die Belege in `revision-receipts.json`.
Die [Übersicht der sechs überarbeiteten Bilder](../../diagnostics/aeldrunmar/revisions/2026-10-29-helmet-variation/final-six-contact.jpg)
zeigt die freigestellten Ergebnisse nebeneinander. Desktop-/Mobilprüfung und
Hashes belegen alle sechs Änderungen; die übrigen 29 Figuren sind unverändert.
