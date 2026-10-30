# Talyndor · Vorbereitungsseite

Buildlose Seite unter `Vorschau/Talyndor/`, basierend auf
`../shared/country-workbench`. Die Landesmodule enthalten Daten, Kontext und
Gestaltungsentscheidungen. Zuordnung, Dialoge, Karte, Drag, Import/Export und
lokale Speicherung bleiben in den gemeinsamen Modulen.

- Vier Earltümer, zwölf Ortsgebiete, 16 voneinander getrennte Banner.
- Elf gelieferte Häuser, Thornwick aus dem bestehenden Register und sechs neue
  Hausentwürfe; 18 Hausfiguren insgesamt.
- Vier nachvollziehbare Ausgangssitze, 14 frei verteilbare Häuser.
- Alle Ortsnamen und Haus Aldred sind neue Vorschläge, keine Registeränderungen.
- Die Triarchie-Gegenwart und Thornwicks verlorener Sitz bleiben kenntlich.
- Brigane führt nach ausdrücklicher Nutzerkorrektur zwei wütende weiße Pitbulls.
  Hauswappen, Earltumsbanner und Brust-/Schildzeichen stimmen darin überein;
  die falsch gelesenen Pferdefassungen bleiben im Generatorarchiv.
- Keine Firebase-Schreibzugriffe und keine Änderung kanonischer Stammbäume.

## Quellen und Bilder

`assets.source.json` hält SHA-256 und Maße der unveränderten Originale fest.
Die große Karte wird unter `diagnostics/talyndor/source-originals/` archiviert;
die Seite verwendet WebP-Ableitungen. Kartenplatzhalter werden überlagernd
benannt; das Originalbild bleibt unverändert.

`scripts/prepare-art.mjs` erstellt Quellimport und die vollständigen Promptkataloge
`art-prompts.json` und `warrior-prompts.json`. Die Bilder entstehen mit dem
eingebauten Bildwerkzeug. Generatororiginale, Alpha-Produktionsfassungen und
WebP-Vorschauen liegen getrennt. Die fortgeltende Alpha-Freigabe verändert nur
Transparenz, niemals Originaldateien oder deren RGB-Werte.

```powershell
node Vorschau/Talyndor/scripts/prepare-art.mjs
python -B Vorschau/shared/prepare-country-sources.py Vorschau/Talyndor/source-import.json
python -B Vorschau/shared/prepare-country-art.py Talyndor --qa-dir diagnostics/talyndor/heraldry
python -B Vorschau/Talyndor/prepare-warriors.py build
python -B Vorschau/Talyndor/prepare-warriors.py audit --expected-count 18
python -B Vorschau/Talyndor/prepare-warriors.py contact
```

Quellenbilder werden nur erneut importiert, wenn sich der Quellimport ändern
soll. Die Prüfbelege bleiben unter `diagnostics/talyndor/` außerhalb des
statischen Veröffentlichungspakets. Für neue Publikation gilt der bestehende
Netlify-Releaseweg mit einer eigenen Nutzerfreigabe für diesen Stand.
