# Gawains Gemach · 1. November 2026

Auftrag: Gawains Gemach im passenden vorhandenen Modul als interaktive Szene
anlegen und ein passendes Szenenbild erstellen.

## Einordnung und Erhaltung

- Bestehendes Online-Modul: `modul-1781470059057`, „Castell Draig - Wohntrakte der Burg“.
- Ablage: Völker & Kulturen / Cenyr / Celtigerns Wacht / Llamreis Ankunft /
  Gwynthor / Castell Draig.
- Neue fünfte Seite: „Gemach des Prinzen Gawain“; eigener stabiler Thread
  `modul-1781470059057::session:wohntrakte-gawain`.
- Die vier vorhandenen Seiten, ihre Reihenfolge, Schlüssel und sämtliche übrigen
  Modulfelder bleiben unverändert. Kein vorhandener Verlauf wird umgewidmet.
- Szenendatum: 10. Lichtkehr 1740, Playtag 2. Keine Uhrzeit, Handlungen,
  Anwesenheit anderer Personen, Rast oder Ressourcenänderungen vorgegeben.
- Raumgestaltung anhand der öffentlichen Gawain-Biografie: komfortables privates
  Gemach mit Bett, Schreibplatz, Kleidung, Spiegel und ausgewählten Düften.

## Artefakte

- `scene-page.json`: neue Szenenseite.
- `module-before.json`: öffentlich gelesener Ausgangsstand.
- `module-import.json`: vollständiger Import mit unveränderten Bestandsseiten.
- `image-prompt.txt`: vollständiger Prompt; eingebautes `image_gen.imagegen`,
  Preset `anime-scene-portrait`, Tales of Xillia/Frieren, 2:3.
- Bild: `AleriaAlmanach/public/assets/castell-draig/2026-11-01/gawain-gemach.png`.
- `image-manifest.json`, `validation.json`, `preview.png`: Herkunft und Prüfbelege.

Die Browserprüfung nutzt eine isolierte lokale Kopie mit dem tatsächlichen
Almanach-Renderer und ohne Firebase-Bootstrap. Die Hilfsdateien liegen unter
`.codex-temp/gawain-room-2026-11-01/`; keine produktiven Browserentwürfe geändert.

## Gezielte Veröffentlichung

`node firebase/scripts/content/publish-gawain-chamber.mjs` prüft rein lesend.
`--apply` benötigt die bestehende Firebase-CLI-Anmeldung. Der Nutzer hat die
Erneuerung mit den angezeigten Firebase-/Cloud-Rechten ausdrücklich genehmigt;
die Anmeldung wurde am 1. November 2026 wiederhergestellt.

Nach Freigabe veröffentlicht das Skript das unveränderliche Bild über den
bestehenden Familienbild-Publisher für Haus Draig. Nach einer verschlüsselten
Sicherung ergänzt ein atomarer Commit ausschließlich die neue Seite und die
beiden Modul-Revisionskennungen. Änderungen am Ausgangsmodul oder an der
Konfiguration währenddessen führen zum Abbruch. Kommentare, Redestabzustände,
Figuren, Inventare und Kämpfe werden nicht geschrieben.

Die Veröffentlichung erfolgte am 1. November 2026 um 15:29:44 UTC. Öffentliches
Bild, Modul und unveränderte Konfiguration wurden erfolgreich zurückgelesen;
`publication-verification.json` und `module-import.json` enthalten das Ergebnis.
Das Bild ist über den vorhandenen Firebase-Bildspeicher öffentlich eingebunden.
Ein Netlify-Frontend-Deploy war für diese reine Inhaltsänderung nicht nötig.
