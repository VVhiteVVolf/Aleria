# Celtigerns Wacht: Hausseiten und Bios vom 24. Oktober 2026

Die acht erneut eingereichten HTML-Vorlagen betreffen Draig, Gafyr, Wyrm,
Saethwyr, Gwefrydd, Gwyvern, Arwydd und Tlawd. Ihre Hauskapitel waren bereits
übernommen. Der aktuelle Registerbestand umfasst inzwischen **92 Familien** in
Celtigerns Wacht. Alle erhalten ihre vorhandene oder neu ergänzte Hausseite,
eine Hausbio und eine passende Hauptabbildung mit Zuordnung zur Galerie.

Die ausführliche Beispielbio im Cenric-Scandyn-Paket gehört **Haus Scandyn**;
Haus Tharn ist dort als Lehnsherr genannt. Der Beispielaufbau ersetzt die alte
Vorgabe einer Bio unter 200 Wörtern. Ausreichend belegte Häuser erhalten eine
gekürzte, ausgefüllte Darstellung von Herkunft, Geschichte, Werten, Hausleben,
Besitz und Kultur. Reine Registervorbereitungen bleiben kurz und benennen offene
Angaben, ohne Gründungen, Berufe, Besitz oder weitere Personen zu erfinden.

## Ergänzte Seiten und Quellen

Neu hinzugekommen sind Fontani, Rhwyd, Penrudd, Gwregysdu, Valerus, Fearnan,
Torvik und Celynfor. Grundlage sind ihre bereits vorhandenen aktuellen
Familienakten und Betriebsdaten. Bereits angelegte Seiten für Draenmelyn,
Pendrwn, Swyll, Aelmor, Maerllys, Braglas, Tonnarth, Ysgrif, Coeddu, Craigddu,
Argall, Dubhan/Gwynthor, Bleiddorn, Cymrath und Gwared sind aus den tatsächlich
vorliegenden Angaben ausgearbeitet. Ungeklärte Lore bleibt offen.

Die neuen HTML-Quellen liegen unverändert als `animexx-source-2026-10-24.html`
beim jeweiligen Haus. Hashes und Abgleich stehen in
`diagnostics/celtigerns-house-refresh-2026-10-24/source-audit.json`.
Die zusätzlichen alten genealogischen Tabellen wurden **nicht** übernommen.
Alle Hausseiten betten die bestehende Akte mit stabiler Familien-ID ein.
Eine gesonderte Prüfung vergleicht alle bestehenden Personen, Partnerschaften,
Abstammungen, Häuser, Nebenlinien und Zeitsprünge mit dem vorherigen Bestand.

Aus den Hoflisten ergänzt: **Stennis Gwefrydd**, Jagdmeister der Draig, mit
vorhandenem Personenlink. **Melyn Saethwyr**, Kommandant der Saethwyr-Garde,
bleibt ohne Personenlink: keine sichere Identifikation mit einer vorhandenen
Person; insbesondere keine Gleichsetzung mit Melyn Arth. Historische Figuren
und ihre Portraits bleiben in den bestehenden Tabellen. Zusätzliche belegte
historische Familienmitglieder werden dort ergänzt.

Die ausdrücklich verworfenen Truppenstärken und Aufgebotsangaben sind aus den
Profilen entfernt; die Militärgruppe wird für diese Häuser ausgeblendet.
Ritterkultur, historische Konflikte und belegte Ereignisse bleiben erhalten.
Bürgerliche Seiten verwenden passende Bezeichnungen für Beruf und Haushalt.

## Bilder und verbindlicher Stil

Der Nutzer hat die neue Malweise ausdrücklich freigegeben: matte gedeckte
Farben, ruhige Ganzkörperfiguren, vereinfachte klare Formen und feine
Pigmentkörnung auf echtem transparentem Hintergrund. Referenzen und vollständige
Prompts liegen unter `AleriaAlmanach/docs/art/character-style/` und im
`fantasy-rpg-character`-Preset. Die Freigabe betrifft den **künstlerischen Stil**.
Ausrüstungsdesign und Berufskleidung folgen Kultur und Hausgeschichte.

Cymrath verwendet den ebenfalls ausdrücklich freigegebenen venalischen Entwurf
mit geschlossenem legionärsartigem Helm, Lamellenelementen, blau-goldenen Farben
und geflügeltem Löwen. Neue bürgerliche Figuren zeigen den belegten Beruf;
bei unbekanntem Beruf nur schlichte Kleidung und Motive des Familienzeichens.
Es sind repräsentative Hausfiguren, keine neu angelegten kanonischen Personen.

## Pflege und Schutz eigener Bearbeitungen

`haus.content.mjs` bleibt die fachliche Quelle je Haus. Der gemeinsame Builder
erzeugt Hausseitendaten und Bio. Die Ausgabezuordnung unterstützt zusätzliche
Bio-Abschnitte. Die Galerie liest dieselben Bildzuordnungen und unterscheidet
bürgerliche Hausdarstellungen von Kriegerdarstellungen.

Die bestehende Fingerprint-Migration erneuert ausschließlich bekannte alte
Standardbios. Eigene Texte, Bilder, Notizen und ausdrücklich gelöschte Bios
bleiben erhalten. Eine reine Biorevision reaktiviert keine älteren verwalteten
Personenfelder. Die ausführlichen eigenständigen Bios von Falchdyn und
Bradrhith behalten ihre bisherige Verantwortung.

Einmalige Bestands- und Übernahmeskripte sowie Prüfbelege stehen unter
`diagnostics/celtigerns-house-refresh-2026-10-24/`. Sie sind keine zusätzliche
Laufzeit-Datenquelle und sollen spätere redaktionelle Bearbeitungen nicht ersetzen.

## Prüfung

- 56 gezielte Hausseiten-, Bio-, Migrations- und Galerieprüfungen bestanden.
- 35 Prüfungen der offiziellen Stammbaum-Freigabefolge bestanden.
- Acht echte Browser-Geometrieprüfungen mit 407 Karten ohne Fehler.
- 92 Familiengraphen einschließlich aller vorhandenen Personen und Beziehungen bytegleich.
- 22 neue PNGs im Format 2:3 mit echtem Alphakanal geprüft; Prompts und Dateipfade in `image-prompts.json`.
- 15 Browserprüfungen: Draig, Cymrath, Fontani, Maerllys und Bekab bei 390, 768 und 1440 Pixeln ohne horizontalen Überlauf oder defekte Bilder. Fontanis Bio, vollständige Hausfigur, Rücklink, Hausmotto sowie Cymraths tatsächliches Stammbaum-Iframe und Galeriezuordnung kontrolliert.
- Die ältere monolithische Folge mit 1.246 Tests enthält 36 bereits bestehende Fehler. Gegen den unveränderten JavaScript-Stand des vorherigen Commits geprüft: keine zusätzlichen Fehler. Einzelheiten in `stammbaum-comparison.json`.
