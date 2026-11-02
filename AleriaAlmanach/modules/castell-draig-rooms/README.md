# Persönliche Gemächer in Castell Draig

Auftrag vom 1. November 2026: acht individuelle Zimmerbilder für Gawain, Idwal,
Anaraut, Isobel, Rhiannon, Neithon, Tudwal und Oweta erstellen und die Seite
„Verlauf“ aus dem bestehenden Wohntrakt-Modul entfernen.

Das bestehende Online-Modul `modul-1781470059057` bleibt die einzige Modulidentität.
Gawains vorhandene Szene verwendet weiter `wohntrakte-gawain`; ihr Datum,
Figurenzuordnung und übrige Einstellungen bleiben erhalten. Nur Bild,
Bildspaltenbreite und die zum Bild passende Einleitung ändern sich. Die anderen
sieben Zimmer erhalten eigene Szenen und stabile Schlüssel `wohntrakte-<name>`.
Die drei weiteren Bestandsseiten bleiben unverändert. Die „Verlauf“-Seite war
eine allgemeine Textvorlage; ihre Entfernung löscht keine Kommentar-, Zeit-,
Redestab- oder Sicherungsdokumente. Das Ergebnis enthält elf Seiten.

`room-pages.mjs` besitzt den reinen Änderungsplan und die Szenenprosa;
`room-art.mjs` enthält die vollständigen Bildprompts und tatsächlichen Referenzen.
Die Bilder entstehen mit dem eingebauten `image_gen` nach dem Projektpreset
`anime-scene-portrait`, Tales of Xillia/Frieren, 2:3. Die Raumarchitektur folgt
dem zuvor vorhandenen Gawain-Bild. Die erste Anaraut-Fassung enthielt Gwrgi
anhand seines vorhandenen Porträts. Nach der ausdrücklichen Nutzerkorrektur
wurde der Hund vollständig aus Bild und Szeneneinleitung entfernt; die aktuelle
Fassung ist `anaraut-gemach-v3.png`. Die vorherige Fassung und ihre
Referenz-/Prüfbelege bleiben als Quellen erhalten.

## Ablage und Prüfung

Quellen, Bildoriginale, vorheriges Modul, Prompts und Prüfsummen:
`AleriaAlmanach/assets/castell-draig/wohntrakte-zimmer-2026-11-01-v2/`.
Dieser Quellenordner wird gemäß Releasepolicy nicht statisch ausgeliefert.
Lokale aktive Bilder:
`AleriaAlmanach/public/assets/castell-draig/2026-11-01/rooms-v2/`.
Das vorherige Gawain-Bild bleibt erhalten.

`module-import.json` ist das lokale Prüf- und Importpaket mit lokalen Bildpfaden.
Nach Übernahme enthält `module-published.json` denselben Inhalt mit den öffentlich
geprüften Firebase-Bildadressen. `publication-verification.json` belegt die
Rückleseprüfung des veröffentlichten Moduls und aller acht Bilddateien.

```powershell
node AleriaAlmanach/scripts/build-draig-rooms.mjs --check
node --test --experimental-test-isolation=none AleriaAlmanach/tests/draig-rooms.test.mjs
node AleriaAlmanach/tests/draig-rooms.browser.mjs
node firebase/scripts/content/publish-draig-rooms.mjs
```

## Begrenzte Inhaltsübernahme

Der aktuelle Nutzerauftrag autorisiert die Änderungen an diesem bestehenden
Online-Modul. `publish-draig-rooms.mjs --apply` nutzt den vorhandenen
Inhalts-Publisher und unveränderliche Bildpfade mit Prüfsumme. Vor dem
Modulschreiben wird eine verschlüsselte Sicherung angelegt. Der atomare Commit
schreibt nur `entryJson`, Modul-Revision/Zeitstempel und die beiden globalen
Modul-Revisionskennungen. Aktualisierungszeit-Vorbedingungen stoppen den Vorgang
bei gleichzeitigen Änderungen. Nach erfolgreichem Schreiben werden das Modul,
alle Bilder und die unveränderten übrigen Konfigurationsfelder zurückgelesen.
Figuren, Inventare, Live-Ressourcen und Kampfdaten gehören nicht zum Schreibsatz.
Für diese Firebase-Inhaltsänderung ist kein Netlify-Frontend-Deploy erforderlich.

## Abgeschlossen und online geprüft

Alle acht 1024 × 1536-Pixel-Bilder wurden veröffentlicht und ihre öffentlichen
Dateien bytegenau zurückgelesen. Das Online-Modul enthält elf Seiten mit acht
persönlichen Gemächern; „Verlauf“ ist entfernt. Gawains bestehender Thread und
sein Szenendatum sowie alle übrigen Bestandsfelder außerhalb der benannten
Bild-/Einleitungsanpassung wurden erhalten. Das Manifest und die übrige
Konfiguration sind bis auf die Modul-Revisionskennungen unverändert.

24 gezielte Modell- und Releasepolicytests bestanden. Die allgemeinen
Templateprüfungen für 34 Vorlagen und 37 Defaultseiten sind grün. Der isolierte
Browserlauf prüfte alle acht Zimmer auf Desktop (1460 × 1000) und Handy
(390 × 844), Import/Sanitizer, Bildladewege, Szenenschlüssel, Werkzeugleisten,
Einleitung per Tastatur und fehlende horizontale Seitenausdehnung. Externe
Schreibzugriffe waren während dieser 16 Ansichten gesperrt. Bericht und drei
Bildschirmbelege liegen unter `verification/` im Quellenordner.

Online: https://dieweltvonaleria.netlify.app/AleriaAlmanach/AleriaAlmanach.html?entry=modul-1781470059057

## Korrektur: Anaraut ohne Hund

`publish-draig-rooms.mjs --anaraut-without-dog --apply` veröffentlicht genau ein
Bild und passt ausschließlich `image` und `sessionIntro` der vorhandenen Seite
`wohntrakte-anaraut` an. Alle elf Seiten und ihre übrigen Felder bleiben erhalten.
Die gesicherte Ausgangsfassung, ursprünglichen Bildmanifeste, der genaue
Editierprompt und der Rücklesebeleg liegen im Quellen-Unterordner
`anaraut-without-dog-v3/`. Die Korrektur wurde online übernommen und bytegenau
geprüft; vier gezielte Tests einschließlich der Begrenzung auf diese beiden
Seitenfelder sind bestanden.
