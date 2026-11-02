# Sieben feste psychologische Spielprägungen

Lokal umgesetzt am 2. November 2026. Alle sieben gewünschten Eigenschaften sind
in Starthilfe und Stufenassistent unter „Psychologische Prägungen“ auswählbar.
Der Katalog enthält damit 185 Traits. Die Bezeichnungen und ihre Wirkungen sind
autorisch festgelegte Aleria-Spieldefinitionen, keine klinischen Beschreibungen.
Bestehenden Figuren wurde nichts automatisch zugewiesen.

| Trait | Tatsächlicher Buff und Debuff | Punkte |
| --- | --- | ---: |
| Psychopath | +4 Nachforschungen, +2 Motiv erkennen, +2 Rettungswürfe gegen Furcht; −2 Überzeugen und Flirten | 4 |
| Soziopath | +4 Nachforschungen, +2 Wahrnehmung; −4 Überzeugen und Motiv erkennen; −3 Täuschen, Einschüchtern, Auftreten und Flirten | −3 |
| Narzisstisch | +3 Auftreten, +2 Einschüchtern, +2 CHA-Rettungswürfe; −3 Überzeugen und Motiv erkennen, −2 Flirten | 0 |
| Eidetisches Gedächtnis | +1 INT-Attributswert, +3 Geschichte; +2 Arkane Kunde, Naturkunde, Religion und Heilkunde | 6 |
| Geistig beschränkt | −4 auf alle Fertigkeitsproben; wirksame INT und WEI höchstens 3 | −8 |
| Vollidiot | Stärkere Alternative: −6 auf alle Fertigkeitsproben; wirksame INT und WEI höchstens 2 | −10 |
| Genie | +1 auf alle sechs Attributswerte und zusätzlich +1 auf alle Fertigkeitsproben | 10 |

Attributspunkte sind **Wertepunkte**, keine direkten Modifikatorpunkte. Steigt
beispielsweise ein Wert von 11 auf 12, steigt zusätzlich sein Modifikator von
0 auf +1. Genie gibt seinen Fertigkeitsbonus von +1 darüber hinaus. Lernen,
Kompetenzstufen, Zauberkenntnisse, Attacken und Inventar werden nicht vergeben.
Eidetisches Gedächtnis erinnert bereits Wahrgenommenes und kennt nicht automatisch
unbekannte Geheimnisse. Keine der Einschränkungen sperrt pauschal Handlungen.

## Grenzen und Balance

Alle aktiven Attributsboni werden zuerst addiert, anschließend gilt die engste
aktive Obergrenze. Sie lässt sich weder mit Genie oder Gedächtnisbonus noch
mit einem freien Modifikator übertreten. INT 3 bedeutet höchstens Modifikator
−4; ein gespeicherter freier Modifikator +20 hebt diese Grenze nicht auf.

Gespeicherte Grundwerte bleiben erhalten. Der Bogen zeigt zusätzlich den
wirksamen Wert und die Obergrenze; Modifikator und Radar verwenden die tatsächliche
Wirkung. Abwählen oder Deaktivieren stellt die aus den Grundwerten abgeleiteten
Werte wieder her. Mehrfaches Speichern oder Normalisieren addiert keinen Bonus
erneut auf die Grundwerte.

„Geistig beschränkt“ und „Vollidiot“ sind alternative Ausprägungen. Eine neue
Auswahl ersetzt die vorherige. Bei importierten Mehrfachauswahlen wirkt nur
die stärkere; sie zählt auch bei der Balance nur einmal. Die beiden Nachteile
geben daher zusammen keine doppelte Punktgutschrift. Kombinationen mit Genie
oder Gedächtnisbonus sind weiterhin möglich, erhalten aber einen Hinweis auf
die vorrangige Grenze. Psychopath und Soziopath zusammen lösen ebenfalls einen
Kombinationshinweis aus. Negative Salden blockieren keine Speicherung.

## Zuständigkeiten und Schnittstellen

- `development-psychological-traits.js`: die sieben Definitionen und ihre Prägung.
- `development-psychological-policy.js`: alternative Ausprägungen und Hinweise.
- `development-trait-groups.js`: gemeinsame Auswahlmechanik; der vorhandene
  Gesundheitsbereich verwendet dieselbe extrahierte Logik unverändert weiter.
- `combat/combat-attribute-effects.js`: reine Berechnung der effektiven Werte
  aus `mechanics.attributeModifiers` und `mechanics.attributeCaps`.
- Bestehende gemeinsame Quellen berechnen Fertigkeiten, Rettungswürfe,
  Zauberwerte, Initiative, Rüstung und weitere attributsabhängige Größen.
- Der Charakterbogen und die KI-Daten verwenden effektive Modifikatoren;
  KI-Daten nennen bei begrenzten Attributen zusätzlich deren Maximum.

Die optionalen neuen Mechanikfelder überstehen Normalisierung, Archivkopien
mit neuer Instanzkennung und den Serverabgleich. Unbekannte Attributsschlüssel
werden verworfen und niemals versehentlich als Stärke behandelt. Persönliche
Grundwerte, vorhandene Kompetenzstufen und Inventare bleiben erhalten.

## Neue Bilder

Alle sieben kreisförmigen Comicicons wurden mit dem eingebauten Bildgenerator
neu erstellt. Die tatsächlich angesehene Stilreferenz war das vorhandene
Heilerhände-Icon; keine alten Spielicons wurden als Endfassung übernommen.
Jede Illustration zeigt ein eigenes Motiv mit erwachsenen Figuren.

Originale: `AleriaAlmanach/assets/development-traits/<Trait-ID>.png`.
Webfassungen: `AleriaAlmanach/assets/development-traits/web/<Trait-ID>.webp`.
Die Übernahme prüft jetzt vor dem Schreiben Quadratformat, Alphakanal und
alle vier transparenten Ecken. Originaldateien wurden unverändert übernommen.

- [Bildübersicht](psychological-traits-contact-review.jpg)
- [Vollständige Prompts und Originalpfade](psychological-traits-image-jobs.json)
- [Bildhashes, Alphakanal und Webableitungen](psychological-traits-art-receipt.json)
- [Desktopauswahl](browser/psychological-desktop.png)
- [Mobile Attributsgrenze trotz Grundwert 40 und freiem Modifikator](browser/capped-attribute-phone.png)

## Prüfung

| Prüfung | Ergebnis | Beleg |
| --- | --- | --- |
| Gezielt: Entwicklung einschließlich zwölf neuer Regeltests | 72 bestanden | [Protokoll](development-tests.txt) |
| Gesamter Frontendbestand einschließlich Gesundheitsregression | 2.179 bestanden | [Protokoll](frontend-tests.txt) |
| Gesamter Serverbestand | 330 bestanden | [Protokoll](backend-tests.txt) |
| Lokaler Releaseweg und Buildauswahl | 26 bestanden | [Protokoll](release-tests.txt) |
| Browser: Auswahl, eigene Bilder, beide Bildschirmgrößen, Grenzen und Rücknahme | bestanden | [Bericht](browser/report.json) |
| Abhängigkeiten der Gameplay-Prüfung | 1.553 Module erfasst | [Beleg](input-coverage.txt) |
| Browser-/Serverquellen | bytegleich | [Abgleich](server-parity.json) |
| Lokaler Vite-Build | bestanden | [Protokoll](build.txt) |

Die Browserprüfung verwendete ausschließlich lokale Entwürfe und blockierte
externe Schreibzugriffe. Ihre Sync-Warnung stammt von dieser gesperrten
Online-Verbindung. Die Figur bleibt im Test auf Stufe 1; Inventar, Attacken,
Ressourcen und aktuelle TP werden durch die Traitwahl nicht aufgefüllt.
Die vorhandenen Buildhinweise zu Paketgrößen und Konfigurationsladen bleiben.
Kein Commit, Push, Deploy oder produktiver Datenabgleich wurde ausgeführt.
