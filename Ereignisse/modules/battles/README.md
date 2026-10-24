# Experimentelles Schlachtdossier: Wellenruh

Zweite Fassung vom 22. Oktober 2026. Push und Deployment bleiben für diesen Auftrag
ausdrücklich ausgeschlossen. Die Kalenderanbindung liest weiterhin einen festen
Quelleneintrag am 11. Himmelsbogen 1628 (11.04.1628); keine Live-Daten werden geschrieben.

Einstieg: `Ereignisse/Schlachten/Erste-Seeschlacht-bei-Wellenruh.html`.
Lokaler VS-Code-Live-Server: Port 5500. Die vollständige Chronik ist auch ohne
JavaScript lesbar; nur die interaktive Rekonstruktion benötigt JavaScript.

## Verantwortung der Module

- `wellenruh-data.mjs`: belegte Eckdaten und kurze Beschreibungen der sechs Phasen.
- `wellenruh-source.json`: sämtliche 28 inhaltlichen Originalabsätze, einschließlich
  beider vollständiger Strategien und der sieben Absätze der Hrolfr–Raveld-Szene.
  `scripts/import-wellenruh-source.py` importiert sie aus der unveränderten HTML-Vorlage;
  der Quellhash und die Normalisierung sind dokumentiert. Dieser einmalige Import
  benötigt BeautifulSoup; der reguläre Node-Build benötigt kein Python.
- `battle-fleets.mjs`: 57 beständige Schiffsidentitäten, sechs Bildmodelle, sechs
  Verbände und die illustrativ zugeordneten Verluste. Skeidr/Skytten sind keine
  automatisch daraus abgeleiteten Schiffsbauarten.
- `battle-simulation.mjs`: deterministische Kurven, versetzte Einzelbewegungen,
  Keilformation, Drehungen, Verlustverlauf und Kamerafahrt. Rote Teilverbände reagieren
  auf beide Arme der Zange und ziehen sich versetzt zurück. Diese Einzelkurse sind
  rekonstruiert. Zurückspulen benötigt keine gespeicherte Simulation.
- `battle-effects.mjs`: Pfeilbahnen, Aufprallmarken, Entertaue und Journalmomente.
  Keine historischen Uhrzeiten oder zusätzliche faktische Schlachtereignisse.
- `battle-audio.mjs`: lokal synthetisierte Retro-Sounds mit Web Audio (Pfeile,
  Aufprall, Enterkampf, Untergang, Hornsignale), kräftige Attacken bei gleicher
  Ereignisdichte. Getrennte Gain-Busse für Effekte und Musik; AudioContext erst nach
  Einschalten. Keine Audiodateien oder externen Dienste. Pause/Spulen stoppen alle
  Stimmen; ein einzelner Ton-Schalter stoppt nur seinen Bus. Nodes werden getrennt.
- `battle-music.mjs`: eigene achtaktige D-dorische Retro-Komposition bei 76 BPM,
  tiefer Bordun, rauer Rechteckklang und schwere Trommeln. Ein Audio-Uhr-Scheduler
  hält das Tempo unabhängig von der Animation konstant; Timer endet bei Pause.
- `battle-audio-render.mjs`: eigene Schalter und Lautstärkeregler für beide Tonspuren.
- `battle-map.mjs`: SVG-Bühne mit generierter Seekarte, Raster-Schiffen,
  Bugwellen, Bergungs-/Wrackmarken, Verbandsmarkierungen und gekapselten DOM-Updates.
- `battle-page.mjs`: lokaler Abspielzustand, Tempo, Slider, Phasensprünge,
  getrennte Kamera-/Manöver-/Effekt-/Tonsteuerung. Kein Autoplay, Pause bei verborgenem
  Tab; bei reduzierter Bewegung bleibt die Kamerafahrt zunächst aus.
- `battle-player-render.mjs`: statische Markierungen der interaktiven Bühne.
- `battle-chronicle-render.mjs`: vollständige abgeglichene Texte und Musterrolle. Die 28 Absätze verwenden dieselben Leseblöcke wie die Hauptchronik; `wellenruh-source.json` bleibt der Rohimport.
- `battle-render.mjs`: Seitenhülle; `scripts/build-battles.mjs` erzeugt die HTML-Datei.
- `battle-page.css` / `battle-player.css`: eigene Gestaltung von Chronik und Bühne.

Die große Darstellung nutzt die Fullscreen-API nur auf ausdrücklichen Klick. Wenn
der Browser diese verhindert (etwa in einer eingebetteten Vorschau), bleibt die
normale Karte benutzbar und das Journal zeigt eine kurze Meldung.

## Bildbestand

`assets/battles/wellenruh/v2/` enthält neun neu generierte Motive: eine Seekarte,
sechs Schiffsmotive (grünes/rotes Flaggschiff, schweres grünes Enterschiff, rotes
Bogenschiff und zwei leichte Langschiffe) und zwei Widder-Fraktionszeichen.
Alle werden tatsächlich auf der Seite eingesetzt. Originale liegen unter
`v2/originals/`; `v2/image-prompts.json` enthält alle vollständigen Imagegen-Prompts,
Referenzen und Exportangaben. WebP-Dateien erhalten den transparenten Außenbereich.
Bei den Widder-Exporten wurden nahezu deckende Generator-Alphawerte auf 255
normalisiert; die Original-PNGs bleiben unverändert.

Karte und Schiffe verwenden den freigegebenen verspielten Map-Stamp-Stil, Version 2,
mit dem tatsächlich angesehenen und übergebenen rundlichen Bauernhaus als Referenz.
Die Seekarte ist dem Auftrag entsprechend ein deckender Hintergrund. Schiffstoken
sind freigestellt. Die kreisrunden Widder nutzen den vollständigen Wappen-Prompt und
angesehene Aldrimar-Clanwappen als Stilreferenzen. Das ursprüngliche Szenenbild im
Tales-of-Xillia/Frieren-Stil bleibt als Illustration bei der vollständigen Schlachtszene.

## Quellenabweichungen

Die Vorlage nennt für die Grünen „weniger als 800“ und andernorts 800 Gefallene.
Die aktuelle Lesefassung verwendet einheitlich „bis zu 800“; beide ursprünglichen Angaben bleiben im archivierten Original.
Die 16 roten Schiffsverluste umfassen gesunkene und erbeutete Schiffe; die genaue
Aufteilung ist unbekannt und die visuelle Aufteilung ausdrücklich illustrativ.
Das falsch verknüpfte zweite grüne Clanzeichen der Vorlage ist durch das tatsächlich
vorhandene Wellensänger-Wappen ersetzt. Leere Trivia, das Platzhalterzitat und unbenannte weitere Clans wurden
nicht mit neuen Behauptungen aufgefüllt.

Die Söldnerankunft ist auf 1630 abgeglichen, der rote Durchbruchsversuch auf das
grüne Zentrum gerichtet. Vollständiger Abgleich mit alten und neuen Angaben:
`Kriege/krieg-der-praetendenten/redaktion/abgleich-2026-10-24.md`.

## Prüfung

Leselayout vom 24. Oktober 2026: Der Chroniktext läuft links fort; rechts steht
eine mitlaufende kompakte Infospalte mit Datum, Ort, Ausgang, Widderzeichen,
Flotten-/Verlustvergleich und Abschnittslinks. `battle-chronicle-info.mjs` rendert
diese Angaben aus dem bestehenden Schlachtmodell; `battle-reading.css` besitzt
den Leseaufbau. Bis 1000 Pixel stehen die Informationen über dem Bericht.
Alle 28 Quellabsätze, die Rekonstruktion und die Tonsteuerung bleiben erhalten.
320/768/1100 Pixel ohne Seitenüberlauf und der vorhandene Quellenumfang geprüft.

```powershell
node Ereignisse/scripts/build-battles.mjs --check
node Ereignisse/scripts/build-events.mjs --check
node --test --experimental-test-isolation=none Ereignisse/tests/battles.test.mjs Ereignisse/tests/events.test.mjs Ereignisse/tests/weddings.test.mjs AleriaAlmanach/tests/calendar-events.test.mjs AleriaAlmanach/tests/scene-time-calendar-day.test.mjs
```

47 Prüfungen bestanden: Quellvollständigkeit und Quellhash, alle Bildmodelle,
Einzelbewegungen, Kamera, Effektkoordinaten, Flotten-/Verlustzahlen, frühes Fallen
Ragnars, deterministisches Zurückspulen sowie bestehende Chronik-, Kalender- und
Hochzeitslogik sowie ausdrückliche Audioaktivierung, unabhängige Tonspuren, stummes
Spulen, konstantes Musiktempo und bereinigte Scheduler. Die roten
Schiffe reagieren individuell auf die Umfassung; lockere Anfangspositionen,
unterschiedliche Verzögerungen und eigene Kursbögen verhindern starre Schiffsblöcke.
Lokale Browserprüfung umfasst Abspielen/Pause, 2×-Tempo, Effekte/Musik samt Lautstärken,
Phasensprünge, getrennte Effekt-/Kamera-/Manöversteuerung, Verbandsmarkierung,
22/11 verbleibende Schiffe sowie 320, 390 und 768 Pixel ohne Seitenüberlauf.
Die Seekarte selbst bleibt auf kleinen Ansichten seitlich verschiebbar.

Die Vite-Konfiguration registriert die Seite und verarbeitet nur mit
`data-battle-art` markierte SVG-Bildverweise zusätzlich als Assets. Dadurch werden
Seekarte und alle Schiffsbilder auch in der gebauten Fassung korrekt referenziert.
