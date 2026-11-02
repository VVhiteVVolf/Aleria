# Abschlussprüfung vom 2. November 2026

Der anschließende [vertiefte System- und Balancecheck](../character-development-audit-20261102/REVIEW.md)
enthält die aktuelle manuelle Fertigkeitswahl, mehrere Klassen/eigene Ausbildung,
Archivkompatibilität und vier weitere Traits (insgesamt 74). Die nachstehenden
70-Trait-Zahlen dokumentieren den vorherigen Fertigstellungsstand.

## Nachtrag: Starthilfe und Oldschool-Oberfläche

Die erste Umsetzung hatte nur den separaten Stufenaufstieg erneuert. Nach dem
Nutzerhinweis wurde auch die zuvor unveränderte Starthilfe umgebaut. Sie verwendet
jetzt dieselbe Kauf- und Stufenberechnung, inklusive Zielstufen bis 30, Traitwahl,
negativem Saldo und individuellen Vorräten. Beide Einstiege teilen die dunkle
RPG-Oberfläche mit kantigen Metallrahmen, Goldschrift, eigener Sternenrelief-Art,
fester Werteübersicht, Auswahlübersicht, Auswahlfilter und Rücksetzbefehlen.

Die anschließende ausdrückliche Nutzerkorrektur ist umgesetzt: Keine Klasse
vergibt über diese Assistenten Standardwaffen, Rüstungen oder andere
Ausrüstungspakete. Vorhandene Waffen, Rüstungen, Techniken und deren
Ausrüstungszustand bleiben erhalten. Einzelausrüstung der sieben Figuren bleibt
als gesondert beauftragter Inhalt bestehen. Der entsprechende alte Vergabepfad
und die Anzeige vermeintlicher Startpakete wurden entfernt.

Zusätzliche Belege:

- `creation-redesign-tests.txt`: 33/33 Tests für Erstellung, Kaufmodell,
  Klassenintegration und Technikerhalt erfolgreich.
- `development-redesign-final-tests.txt`: 25/25 Fachtests einschließlich der
  sieben Figuren erfolgreich.
- `release-redesign-tests.txt`: 25/25 Release- und Buildplanprüfungen erfolgreich.
- `redesign-browser/creation/`: vollständiger Starthilfe-Weg nach Klassenwechsel
  auf Helwyr, Zielstufe 5, eine gewählte Attacke, zwei Traits, negativer Saldo,
  Zusatzmana, Filter und Zurücksetzen; vorhandene Ausrüstung erhalten,
  zusätzliche Standardausrüstung 0; Desktop und 390-Pixel-Handy ohne Überlauf.
- `redesign-browser/level-up/`: bisheriger Aufstiegsweg mit gemeinsamem neuem
  Design erneut erfolgreich; Fokuskontrast des Suchfeldes eigens geprüft.
- `production-build-redesign.txt`: Vite-Build erfolgreich.
- `advancement-frieze-image-job.json`: exakter Bildprompt, Quelle, visuelle
  Abnahme, Dateigrößen und Hashes des neuen Sternenreliefs.

Die Browserprüfungen sperren weiterhin externe Schreibzugriffe. Die Sandbox
verhindert zunächst das Starten isolierter Git-Testprozesse; der genehmigte
lokale Testlauf außerhalb dieser Einschränkung besteht anschließend vollständig.
Es wurde nichts veröffentlicht.

Der neue Stand ist lokal umgesetzt. Für diesen Auftrag wurden weder Firestore-
Inhalte geschrieben noch Git-Push oder Veröffentlichung ausgeführt. Die beiden
vorhandenen Online-Akten wurden ausschließlich gelesen; Caralyns und Lefrayes
Identitäten bleiben erhalten. Beim späteren Inhaltsabgleich haben deren
Online-Inventare und Live-Ressourcen weiterhin Vorrang vor lokalen Projektionen.

## Inhalt

- Sieben Personenakten auf Stufe 1, mit belegten Biografien, Originalporträts,
  Hauszeichen, Quellen und Ausrüstung. 254 andere Snapshot-Figuren bleiben erhalten.
- 21 versionierte Itemvorlagen. Zwei Kampfdolche und drei Harpunen sind einzelne
  Besitzstücke; Lefrayes beide Bögen verweisen auf den Standardpfeilstapel.
- Gwyllach-Altersrevision nach Sichtung der 19 Porträts. Saerwyn ist ungefähr 19;
  Rhovans Geburtsjahr bleibt erhalten. Alle belegten Eltern-Kind-Abstände liegen
  bei mindestens 18 Jahren. Die Jahre sind redaktionelle Korrekturen.
- Neun Reaktionssheets und 81 Einzelavatare, jeweils 27 für Caralyn, Rianna und
  Lefraye. Alle drei Sets liegen gemeinsam im jeweiligen benannten Ausgabeordner.
- Mehrstufiger Entwicklungsassistent mit individuellen Ressourcen, Attributen,
  Preisen und Punktestand. Eigene und fremde Klassenangebote stammen aus den
  vorhandenen Katalogen. Negative Salden sind zulässig. Neue Attacken werden
  ausschließlich ausdrücklich ausgewählt; vorhandene Techniken bleiben erhalten.
- 70 wählbare Traits: 30 ursprüngliche, 20 körperbezogene und 20 ergänzende normale
  Traits. Expertise, Werteänderungen, Resistenzen, Anfälligkeiten und passende
  Rettungswurfnachteile verwenden die gemeinsame Kampfmechanik in Browser und Server.
- 70 eigene kreisförmige Comicicons. Vollbusig wurde mit blonder erwachsener Frau,
  Dekolleté und verwundertem Blick korrigiert; Gelenkig zeigt zwei Beine und zwei Arme.

## Prüfbelege

| Prüfung | Ergebnis | Beleg |
| --- | --- | --- |
| Charakterentwicklung und sieben Figuren | 15/15 erfolgreich | `feature-tests.txt` |
| Firebase-Functions einschließlich generierter Mechanik | 330/330 erfolgreich | `backend-final-tests.txt` |
| Kataloge und Itemdefinitionen nach Neugenerierung | 22/22 erfolgreich | `catalog-final-tests.txt` |
| Release- und Veröffentlichungspolicy | 25/25 erfolgreich | `release-tests.txt` |
| Stammbaumtests | 8/8 erfolgreich | `genealogy-tests.txt` |
| Browser, Desktop und 390-Pixel-Handy | erfolgreich; keine JavaScriptfehler | `browser/report.json` |
| Vite-Produktionsbuild | erfolgreich | `production-build-final.txt` |
| Git-Whitespaceprüfung | erfolgreich | `git diff --check` |

Der Browsercheck wählt eine Zielstufe von 5, kauft eine Attacke, aktiviert Traits,
erlaubt einen negativen Saldo und prüft erneutes Laden ohne automatische Vergaben.
Alle 70 Webicons wurden decodiert; Auswahl, Suche und Körperfilter wurden geprüft.
Externe Schreibzugriffe waren während dieser Browserprüfung gesperrt.

Der vollständige Frontendlauf hatte zunächst 2089 erfolgreiche von 2091 Tests.
Die veraltete regionale Ausrüstungsprojektion wurde anschließend mit dem vorhandenen
Builder aktualisiert; ihre 22 Katalogtests sind jetzt erfolgreich. Ein fremder
Brevanor-Test in `gestiefelte-muschi.test.mjs` erwartet noch den früheren flachen
Registerpfad statt der bereits lokal bestehenden Königreichsunterteilung. Dieser
außerhalb des Auftrags liegende Erwartungsunterschied bleibt offen. Der gesamte
Frontendlauf wurde nach der Katalogkorrektur nicht erneut vollständig ausgeführt.

## Bilder und Quellen

Prompts, ursprüngliche Generatorpfade, Hashes und Alphaprüfungen stehen in den
jeweiligen `*-image-jobs.json` und `*-art-receipt.json`. Alle Kontaktansichten wurden
visuell geprüft. Der vorhandene V3-Splitter erzeugte die Avatare ohne eigene
alternative Zuschnittlogik. Die 70 hochauflösenden Trait-PNGs bleiben erhalten.
Ihre transparenten 192-Pixel-Webfassungen benötigen zusammen 1.014.168 Byte statt
152.898.944 Byte der Originale; ausschließlich die Webfassungen werden in der
Trait-Auswahl geladen. Originale und interne Quellen sind von der statischen
Auslieferung ausgeschlossen. Aktive Itembilder und Avatarbilder bleiben auslieferbar.

Die Quelldaten und ausführbaren Zuständigkeiten sind in
`AleriaAlmanach/modules/character-development/README.md` und
`AleriaAlmanach/modules/gwynthor-seven/README.md` beschrieben. Die Figurenexporte
liegen unter `Charakter Archiv Exporte/Gwynthor Sieben/`. Die drei benannten
Avatar-Ausgabeordner liegen unter `AleriaAlmanach/AvatarWerkstatt/Output/`.
