# Gwynthor Marktplatz

Reines Szenenmodul unter **Völker & Kulturen → Cenyr → Celtigerns Wacht → Llamreis Ankunft → Bannkreis Gwynthor → Gwynthor-Stadt**.

Eine kurze Hauptseite führt zu acht eigenständigen interaktiven Szenen:

- Park I: Lindenhain im Norden mit Rundbank.
- Park II: Rosengarten im Osten mit Rankbogen und Steinbänken.
- Park III: Schattengarten im Süden mit flachem Wasserbecken.
- Park IV: Spielwiese im Westen mit Ballspiel und Hüpfkästchen.
- Anzeigetafel mit lesenden Silhouetten und Link zu Gwynthors tatsächlicher Tafel.
- Marktstände mit Gemüse-, Fisch-, Brot- und Käsekauf.
- Runder Marktbrunnen als Treffpunkt.
- Spielleute mit Laute, Handtrommel und kleinem Publikum.

Die Szenen verwenden ausschließlich den bestehenden Sitzungsrenderer, seine
Beitragsverwaltung und seine Szenenwerkzeuge. Keine eigenen Listener, globalen
Zustände oder Firebase-Zugriffe. Keine Händlerprofile, Verkaufsmechanik,
Preislisten, Inventarbestände oder automatisch gestarteten Sitzungen.

`marketplace-scenes.mjs` besitzt Ortsprosa und stabile POI-IDs;
`marketplace-module.mjs` baut das Modul und verwendet den gemeinsamen Stadtpfad;
`marketplace-art.mjs` hält die vollständigen Bildprompts nach dem gespeicherten
`anime-scene-portrait`-Preset (Tales of Xillia/Frieren, 2:3).

Die Generierung erfolgt mit dem eingebauten `image_gen`. Originale und
Prompt-/Prüfbelege liegen unter `assets/gwynthor-marktplatz/`; ausgeliefert werden
die WebP-Bilder unter `public/assets/gwynthor-marktplatz/`. Der Quellenordner bleibt
gemäß Releasepolicy außerhalb des statischen Pakets. Die erzeugte Registrierung
verwendet den gemeinsamen Archive-Builder; vorhandene Einträge derselben ID
bleiben erhalten. Kommentar-Threadschlüssel niemals durch Seitenzahlen ersetzen.

```powershell
node AleriaAlmanach/scripts/build-gwynthor-marktplatz.mjs
node AleriaAlmanach/scripts/build-gwynthor-marktplatz.mjs --check
node --test --experimental-test-isolation=none AleriaAlmanach/tests/gwynthor-marktplatz.test.mjs
node AleriaAlmanach/tests/gwynthor-marktplatz.browser.mjs
```

Importpaket: `Charakter Archiv Exporte/Module/Gwynthor Marktplatz/gwynthor-marktplatz-2026-11-01.json`.
Direktaufruf: `/AleriaAlmanach/AleriaAlmanach.html?entry=gwynthor-marktplatz`.
Dieser neue Auftrag wurde lokal umgesetzt; eine Veröffentlichung ist nicht Teil
des Auftrags.

## Prüfung vom 1. November 2026

28 gezielte Tests für Marktplatz, geografische Zuordnung und Releasepolicy
bestanden. Die allgemeinen Templateprüfungen für 34 Vorlagen und 37 Defaultseiten
sind ebenfalls grün. Der isolierte Browserlauf prüft alle neun Seiten bei
1460 × 1000 und 390 × 844 Pixeln: vollständige Bilder, keine horizontale
Seitenausdehnung, Navigation, Tastaturbedienung der Einleitungen, eigene
Sitzungsthreads, acht Wechselziele, tatsächlicher Tafellink und Sanitizer-Rundlauf.
Externe Schreibzugriffe sind dabei gesperrt; es wurden keine Beiträge angelegt.

Die acht 1024 × 1536-Pixel-Originale bleiben unverändert erhalten. Die aktiven
WebP-Bilder belegen zusammen 3.581.896 Bytes. Prüfsummen und Bildmaße stehen in
`assets/gwynthor-marktplatz/image-results.json`, vollständige Prompts in
`assets/gwynthor-marktplatz/image-prompts.json`. Browserbericht und zwei
Bildschirmbelege liegen in `assets/gwynthor-marktplatz/verification/`.
