# Die Brauerei der Familie Gortach

Das Modul `gortach-brauerei` steht unter **Gilden & Zünfte → Brauer & Brenner**. Es verwendet die vorhandenen Story-, Gilden- und Handelsgut-&-Tiere-Templates. Die Getränke stehen innerhalb von zwei Katalogseiten untereinander; jedes Getränk besitzt ein eigenes Bild und einen vollständigen Beschreibungstext.

## Seitenplan

| Seite | Inhalt | Template / Bild |
| --- | --- | --- |
| I | Broch an Ear · Ein ehrliches Bier | Story; Kinneth beim Ausschank |
| II | Familie, Zunft & Handschrift | Gilde; originale Familienporträts und Wappen |
| III | Òrbharr · Die Muttergerste | Story; Gerstenstillleben |
| IV | Vom Feld in den Krug | Story; Jodhrán im Brauhaus |
| V | Das Biersortiment · Sechs Charaktere | Handelsgut & Tiere; sechs bebilderte Einträge |
| VI | Caddach Gortach · Ein mitgebrachtes Erbe | Story; Brennblasenstillleben |
| VII | Zwei Handwerke, ein Hof | Story; Kinneth und Jodhrán im Fasshof |
| VIII | Ein Brand, sechs Wege | Story; Gerste, Whisky und Wachs |
| IX | Caddach Gortach · Acht Abfüllungen | Handelsgut & Tiere; acht bebilderte Einträge |

Ein weiteres Template ist nicht erforderlich: Die Handwerksgeschichte bleibt im Story-Layout, die Gemeinschaft im Gilden-Layout und das vollständige Sortiment in den beiden Katalogen. Es werden keine zusätzlichen Meisterämter, Gründungsdaten oder Preise erfunden.

## Quellen und Bearbeitung

- `sources/manuscript.html` bewahrt die eingefügte Vorlage unverändert.
- `sources/manuscript.json` ist die redaktionelle Textquelle mit allen 20 Kapiteln. Bei der Übernahme wurden überflüssige Formatierung und leere Absätze entfernt, einzelne offensichtliche Schreibfehler berichtigt und ein abgetrennter Satzpunkt verbunden. Alle Inhaltsabsätze und Verkostungsstimmen bleiben erhalten.
- `gortach-brewery-model.mjs` ordnet diese Texte den neun Seiten zu und ergänzt Familienbezüge, Steckbriefe und Katalogmetadaten.
- `gortach-brewery-data.js` wird daraus erzeugt. Nicht von Hand bearbeiten. Die Registrierung ist idempotent und überschreibt keinen bestehenden Eintrag mit derselben ID.

Familienangaben und Bildreferenzen stammen aus `Stammbäume/assets/js/data/house-ru-gortach-family.js` und den dort zugeordneten Porträts. Kinneth, Jodhrán, Peighneachan und Carthach erscheinen mit ihren belegten Familienrollen. Die Darstellung der älteren Angehörigen in Handwerksszenen ist eine Illustration, keine Zuweisung eines Meisteramts.

Die Whisky-Steckbriefe unterscheiden ausdrücklich Grundbrand und Fasswirkung: Nur der klassische Mòine ist getorft. Die Große Reise besitzt ihre konkrete 22-jährige Fassfolge; der 28-jährige Òrbharr beginnt unmittelbar in Òrbharr-Fässern. Nicht überlieferte Preise bleiben leer, auch bei der Übernahme ins Warenregister.

## Bilder

Die 21 neuen PNGs liegen in `public/assets/gortach-brauerei/`: sechs Storybilder, vierzehn Getränkebilder im Format 2:3 sowie ein transparentes Brauzeichen. Die ursprünglichen Porträts und das Familienwappen werden direkt referenziert.

Die Storybilder folgen dem vorgegebenen Anime-Stil mit Cel-Shading und zurückhaltender Ausstattung. Die freigestellten Produktbilder orientieren sich am bestehenden Starkbier des Warenregisters. Das neue Brauzeichen übersetzt die beiden Zecher des blau-goldenen Familienwappens in zwei verbundene goldene Krüge; es dient auch als Flaschenetikett.

`public/assets/gortach-brauerei/image-prompts.json` dokumentiert sämtliche vollständigen Prompts, Referenzen und die Verwendung der integrierten Bildgenerierung. Das Warenregister-Referenzbild liegt unter `references/warenregister-starkbier.png` im selben Bildordner.

## Gemeinsames Kataloglayout

`trade-catalog-renderer.js` stellt die bestehende Variable `--trade-image-height` am gesamten Produkteintrag bereit. `module-page-trade-catalog.css` begrenzt die Beschreibung einschließlich Überschrift auf diese Höhe. Der Inhalt darunter erhält eine eigene Scrollleiste, eine zugängliche Beschriftung und Tastaturfokus. Die Änderung gilt für alle Seiten dieses Templates; die Bildhöhe bleibt weiterhin im Editor einstellbar.

Das vorhandene Feld `sealImage` erscheint als dekoratives Wasserzeichen innerhalb des Bildrahmens, hinter dem freigestellten Artikelbild: mittig ausgerichtet, auf 84 % des Rahmens begrenzt, mit 23 % Deckkraft und 18 Grad gegen den Uhrzeigersinn gedreht. Es beansprucht keinen zusätzlichen Platz unter Name, Kurzbeschreibung und Schlagworten.

## Erzeugung und Prüfung

Im Verzeichnis `AleriaAlmanach`:

```sh
npm run build:gortach
npm run check:gortach
npm run test:gortach
npm run check:templates
```

Die Tests prüfen die vollständige Textübernahme, die neun Seiten, alle vierzehn Warenregister-Einträge, besondere Reifefolgen, lokale Bildverweise, das 2:3-Format und die wiederholbare Registrierung. Bei eingeschränkter Prozesserzeugung kann der Test mit `node --test --experimental-test-isolation=none tests/gortach-brewery.test.mjs` laufen.

Zusätzlich geprüft: alle neun Seiten bei 1600, 1120 und 390 Pixeln Breite, Bilder, Suche, Scrollhöhe, Tastaturbedienung sowie der Editor- und Import-Rücklauf. Das Modul benötigt keine neuen Firebase-Zugriffe und verändert keine Charakter-, Inventar- oder Kampfdaten.
