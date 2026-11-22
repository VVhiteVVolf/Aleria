# Gilde Federkiel - Gwynthor

Der Bereich liegt im Almanach unter **Völker & Kulturen → Cenyr → Celtigerns Wacht → Llamreis Ankunft → Bannkreis Gwynthor → Gwynthor-Stadt → Gilde Federkiel - Gwynthor**. Das [Gildenhaus](../../AleriaAlmanach.html?entry=gwynthor-federkiel) führt zu den fünf Betriebsstellen.

Das Hauptmodul enthält den Gildenüberblick, die Dienstleistungen und die örtliche Leitung. Postzentrale, Schreibstube, Druckerei, Kurierstation mit Gestüt und Postlager haben jeweils eine eigene Hierarchie und einen eigenen Szenenthread. Die Zentralpost nimmt an und sortiert, das Lager verwahrt und übergibt, die Kurierstation führt die Abgänge aus. Die Druckerei versorgt die Poststellen mit Aushängen und Vordrucken.

Die Leitung der Kurierstation führt drei Staffeln. Jede hat eine Staffelführung und eine Viererreihe mit derselben Rolle **Postkurier**. Die Staffelaufträge decken Stadtwege, Bannkreis und Fernpostanschlüsse ab. **Oenyr, Véfrid, Gwaedyr und Thaleth** besetzen Staffel II, die Orte im Bannkreis beliefert. Ihre Figurenakten stehen im Charakterregister unter **Gwynthor**, ihre Porträts in der Hierarchie und ihre Figurenauswahl in der Szene am Tor. Für Staffel I und III erscheinen offene Rollenplätze als Silhouetten.

## Quellen im Projekt

- `federkiel-section.mjs` enthält Archivpfad, Kennungen und Bildverweise. `federkiel-module.mjs` baut die Seiten und Archiveinträge mit der gemeinsamen Archivregistrierung zusammen.
- `federkiel-places.mjs` beschreibt die fünf Betriebsstellen und deren Szeneneinstiege. `federkiel-hierarchy.mjs` und `federkiel-services.mjs` liefern die Rollen und Dienstleistungskarten für die vorhandenen Vorlagen.
- `federkiel-couriers.json` beschreibt die vier Mitglieder der Bannkreisstaffel. `federkiel-couriers.mjs` gibt der Hierarchie, der Szene und den vier Figurenexporten dieselben Kennungen und Bildpfade. Die Einzelfigurenquellen liegen unter `Charakter Archiv Exporte/Federkiel Gwynthor/`.
- Die sechs importierbaren Pakete liegen unter `Charakter Archiv Exporte/Module/Gilde Federkiel Gwynthor/`. Modulkennungen und Threadschlüssel sind die stabilen Verweise für Szenen und Kommentare.
- Die 13 Seitenbilder, sechs Dienstleistungsicons, vier Rollensilhouetten und das Scharnierschild liegen unter `assets/federkiel-gwynthor/` im Almanach. Das allgemeine Gildenzeichen verwendet das bestehende Fraktionsregister. [Manifest](../../assets/federkiel-gwynthor/manifest.json) · [Generatorprompts und Originale](../../docs/art/federkiel-gwynthor-20261122/generation-receipts.json)

## Prüfen und erzeugen

Aufrufe ab Projektwurzel. Browserprüfung mit eigenem Chrome-Kontext und lokalen GET-Ressourcen.

```powershell
node AleriaAlmanach/scripts/build-federkiel-gwynthor.mjs --check
node --test --experimental-test-isolation=none AleriaAlmanach/tests/federkiel-gwynthor.test.mjs
python AleriaAlmanach/scripts/admit-federkiel-art.py --check
node AleriaAlmanach/tests/federkiel-gwynthor.browser.mjs
node AleriaAlmanach/scripts/build-federkiel-couriers.mjs --check
python -B AleriaAlmanach/AvatarWerkstatt/Werkzeuge/export-federkiel-couriers.py --check
node AleriaAlmanach/tests/federkiel-couriers.browser.mjs
```

Der Modulpaket-Builder erzeugt die Registrierung und die Exporte ohne `--check`. Der offizielle Questkatalog liest deren Einträge und Threads aus der Almanach-Registrierung. Die Bildaufnahme prüft Originale und proportionale WebP-Fassungen. Symbole und Dienstleistungsicons verwenden verlustfreies WebP mit erhaltenem Alphakanal.
