# 15 erlernte passive Fähigkeiten vom 6. November 2026

Historischer, vom Nutzer verworfener Zwischenstand. Die aktuelle Auswahl steht in
`STANDARD_PASSIVE_ABILITIES_2026-11-06.md`; die folgenden 15 Einträge sind aus dem
Auswahlkatalog entfernt. Historische Quellen und Bilder bleiben nachvollziehbar.

Die Ergänzung liegt in `development-expansion-abilities.js`. Es sind bewusst
klassenfreie erlernte Routinen für den bestehenden Entwicklungskatalog. Sie werden
wie dessen übrige reversible Eigenschaften gespeichert, ohne neue Aktionslisten,
Ressourcen, Gegenstände oder automatische Ausbildungsvergabe.

| Fähigkeit | Wirkung | Grenze / Malus | Punkte |
| --- | --- | --- | ---: |
| Kontrolliertes Abfangen | +2 auf Rettungen gegen Niederwerfen | Nur vorhandene Rettungswürfe; keine Sturzschadensminderung | 1 |
| Verankerter Stand | +2 gegen erzwungenes Schieben/Ziehen | −1 m Bewegung; kein automatisches Blockieren | 1 |
| Druckverbandroutine | +1 Heilkunde, +2 auf Blutungsrettungen | Keine automatische Heilung oder Blutungsentfernung | 2 |
| Schmerzatmung | +1 KON-Rettung gegen physische Hieb-/Stich-/Wuchtprofile | −1 Initiative; keine Konzentrations- oder Elementarschadenswirkung | 0 |
| Säureflucht | +2 GES-Rettung gegen Säure | Kein Schutz bei anderen Rettungen und keine Schadensresistenz | 1 |
| Splitterabwehr | −1 Gesamtschaden je Stich-Fernkampfwaffenangriff | Waffen-/Wirkprofilfilter; gemischter Schaden wird als ein Angriff behandelt | 2 |
| Wuchtrollen | −1 Gesamtschaden je Wucht-Nahkampfwaffenangriff | −1 Initiative; Waffen-/Wirkprofilfilter wie oben | 1 |
| Klingenabstand | +1 tatsächliche Verteidigung gegen Hieb-/Stich-Nahkampfwaffen | Kein allgemeiner RK-Bonus; nur passende Waffen/Techniken | 2 |
| Lückenlesen | +1 Nahkampfwaffenangriff und +1 Schaden gegen aktives Liegend | Kein eigenes Niederwerfen; Fernkampf und Zauber ausgenommen | 3 |
| Prüfende Befragung | Vorteil auf Motiv erkennen | Keine automatische Aufdeckung einer Absicht | 3 |
| Verbindliche Argumentation | Vorteil auf Überzeugen | Kein automatischer Erfolg | 3 |
| Ruhige Untersuchung | Vorteil auf Heilkunde | Keine zusätzliche Heilwirkung | 3 |
| Sorgfältige Beweisführung | Vorteil auf Nachforschungen | Fehlende Informationen müssen beschafft werden | 3 |
| Ökologischer Vergleich | Vorteil auf Naturkunde | Kein automatisch bekanntes Fachwissen | 3 |
| Praktische Wegsuche | Vorteil auf Überleben | Normale Handlungen und Vorräte bleiben nötig | 3 |

Die sechs Fertigkeitsvorteile gelten allgemein für ihre jeweilige Fertigkeit.
Begriffe wie Untersuchung und Wegsuche begründen keine zusätzlichen, unberechneten
Zeit- oder Aktionsvorteile. Mehrfacher Vorteil erzeugt keine weiteren Würfel;
der bestehende Balancekern bewertet überlappende Vorteilsquellen entsprechend.

Die Abgrenzung zum vorherigen Bestand ist sowohl inhaltlich als auch mechanisch:
gezielte Rettungen statt einer pauschalen Attributsrettung, tatsächliche Bereichs-
und Wirkprofilfilter statt allgemeiner Resistenz oder Rüstung sowie Vorteilswürfe
statt kleiner Zahlenboni oder Expertise. Das gesicherte Inventar von 1061 vorhandenen
Archiv-Traits, Fähigkeiten und Techniken wurde auf Namen und normalisierte
Rechenwirkung verglichen. Keine der 15 Definitionen ist eine identische Kopie.

Primäre und sekundäre Rettungen nutzen denselben vorhandenen Triggervertrag.
Schadensprofile bevorzugen die ausgewählte tatsächliche Wirkung; ein bloß
gehaltenes Schwert macht einen Feuerzauber nicht zu einem Hiebangriff.
Eine nichtleere strukturierte Wirkungsliste ersetzt den impliziten Grundschaden:
Ein alleiniger Feuerschadenseffekt besitzt daher keinen zusätzlichen physischen
Waffenanteil. Dieser muss als eigener Schadenseffekt vorliegen, gegebenenfalls
mit geerbter Waffenschadensart. Reine Zustandseffekte aktivieren keine
Schadensartfilter. Eine leere Wirkungsliste behält den bestehenden impliziten
Schadensvertrag; ausdrücklich nichtschädigende Aktionen bleiben ausgenommen.
Bei einem wirklich gemischten Profil genügt ein passender Anteil für den Filter.
Selbstgerichtete Schadenskosten zählen dabei nicht zum Schaden gegen das Ziel.
Die kleine Schadensminderung reduziert den Gesamtangriff einmal um einen Punkt,
nicht jeden Schadensanteil gesondert.

Eigene neue Einzelicons im vorhandenen kreisförmigen Comicstil verwenden die
IDs `faehigkeit-<slug>`. Originale und 192-Pixel-Webfassungen werden über die
vorhandene Bildaufnahme verwaltet. Volle Prompts und Generatorpfade stehen unter
`diagnostics/talents-quirks-abilities-20261106/abilities/`.
