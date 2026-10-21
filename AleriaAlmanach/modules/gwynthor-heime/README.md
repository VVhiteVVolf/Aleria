# Kleine Gwynthorer Haushalte

Drei private Wohnhausmodule direkt unter Gwynthor-Stadt: **Heim der Fearnan**,
**Heim der Torvik** und **Heim der Celynfor**. Keine Angebote, Dienstleistungen
oder Wirtschaftskalkulationen. Jeder Eintrag enthält eine kurze Einordnung,
auf Seite 2 die Familienbio mit fünf CK-Eigenschaften, Hintergrund, Lebensunterhalt
und bekannten Kontakten, danach den Iframe-Stammbaum und eine Wohnstube als interaktive Szene. Spant hat einen
zusätzlichen kurzen Eintrag mit dem vorhandenen Brág-Profil im Bestiarium.

`households.mjs` ist die gemeinsame Quelle für die neun Personen, ihre
Verbindungen, Hausbeschreibungen und Porträtpfade. Die Familienakten stehen in
`Stammbäume/assets/js/data/gwynthor-small-households.js`. Bewusst nur der heutige
Haushalt: kein unbekanntes Gründerpaar und kein künstlicher Überlieferungssprung.

Llinos Celynfor ist die bereits angelegte 21-jährige Hausmagd der Krummen Kanne.
Ihr ursprüngliches Porträt und die Identität `person--krumme-kanne--llinos`
bleiben erhalten. Ihr Arbeitsplatz bleibt die Krumme Kanne, ihr Wohnort ist das
Heim der Celynfor. Der Kanne-Personalplan verwendet denselben Quelldatensatz.
`household-workplaces.mjs` ergänzt Name und Verbindung beim Lesen des vorhandenen
Arbeitsplatzmoduls. Die generierte Classic-Bridge wird ausschließlich an der
gemeinsamen Modul-Migrationsgrenze aufgerufen; keine Remote-Schreibzugriffe.
Historische Quellsnapshots und bestehende Szenenschlüssel bleiben erhalten.

Der vorhandene Iframe-Renderer verwendet `embed=1` nur für die Frame-URL.
Die eigenständige Ansicht bleibt über den normalen Link erreichbar.
`Stammbäume/assets/js/modules/family-embed/` und `assets/css/family-embed.css`
begrenzen den eingebetteten Lesemodus auf einen kompakten Kopf und eine an die
Framehöhe angepasste Zeichenfläche. Bestehende Karten, Zoom, Einpassen und
Beziehungsansichten bleiben zuständig für ihre bisherigen Funktionen.

## Erzeugen und prüfen

```powershell
node AleriaAlmanach/scripts/build-gwynthor-heime.mjs
node AleriaAlmanach/scripts/build-gwynthor-heime.mjs --check
node AleriaAlmanach/scripts/build-krumme-kanne.mjs
node AleriaAlmanach/scripts/build-economy-calculator.mjs
node --test --experimental-test-isolation=none AleriaAlmanach/tests/gwynthor-heime.test.mjs AleriaAlmanach/tests/krumme-kanne.test.mjs
node AleriaAlmanach/tests/gwynthor-heime.browser.mjs
```

Die JSON-Modulpakete liegen unter `Charakter Archiv Exporte/Module/Gwynthorer Heime/`.
Familiensnapshots werden mit dem bestehenden lokalen Snapshot-Werkzeug erzeugt.
Das ist keine Veröffentlichung ins Netz.

## Bilder

21 mit dem eingebauten ImageGen erzeugte Originale: acht neue Personenporträts,
sechs Haus-/Raumbilder, ein Hund, drei schlichte runde Holzzeichen und drei
stehende 2:3-Familienbilder nach den verbindlichen Einzelporträts.
Llinos verwendet ihr vorhandenes Porträt. Bildprompts und Herkunftsbelege liegen
unter `AleriaAlmanach/assets/gwynthor-heime/prompts.json` und `results.json`.
Die Gruppenbilder haben eigene Prompts und Herkunftsbelege unter
`AleriaAlmanach/assets/gwynthor-heime/group-portraits/`.
Die drei Originalwappen sind zusätzlich als `wappen-original.png` erhalten.
Die am 20.10.2026 ausdrücklich freigegebene technische Bereinigung verändert
ausschließlich Alpha und transparenten Außenrand. RGB-Farben bleiben bitgenau
erhalten; Innenfläche Alpha 255, Außenfläche Alpha 0. Belege stehen in
`technical-cleanup.json` und `validation.json`.

Kein Push, Deployment oder Online-Schreiben gehört zu diesem Durchgang.
