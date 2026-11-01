# Itemsystem: technischer Checkup vom 1. November 2026

Der gemeinsame Kern ist tragfähig: Definition und Besitz sind getrennt,
Versionen bleiben unveränderlich, Transaktionen lesen aktuelle Serverdaten,
und wiederholte Kauf-/Zuteilungs-/Übergabeaufträge erzeugen keine zweite Buchung.
Der Checkup hat dennoch konkrete Fehler an den Übergängen gefunden und lokal
behoben. Produktive Bestände wurden weder gelesen noch migriert oder beschrieben;
es gab keinen Push oder Deploy.

## Behobene Befunde

| Priorität | Reproduzierbarer Fehler | Korrektur |
| --- | --- | --- |
| Hoch | Ein Kauf aus einem Modul schrieb ins Händlergegenkonto `module:<Modul-ID>`. Der spätere Verkauf desselben Gegenstands verwendete im historischen Angebotsfallback dagegen die einzelne Angebots-ID. Dadurch entstanden zwei Konten, statt Kauf und Rückverkauf gemeinsam zu saldieren. | Der Verkaufsfallback nimmt die gespeicherte Modulherkunft des erworbenen Gegenstands. Ein vom Client übergebener Modulname bestimmt das Gegenkonto nicht. Der Weg funktioniert auch nach Entfernen der Speisekarte. |
| Hoch | Ein eigenes Werkzeug mit `stackable: false` konnte über den Kauf und die freie Registerzuteilung dennoch mit Menge 2 als ein Besitzstück angelegt werden. Eine spätere kanonische Speicherung lehnte diesen Bestand dann ab. | Gemeinsame Mengenprüfung für Kauf, Zuteilung, Besitzspeicherung und Bestandsübernahme. Der Kauf erhält die auf dem Server geladene Definition; das Formular bietet passende Mengen an. |
| Hoch | Ein auf Menge 3 stehender Altbestand ließ sich ausdrücklich auf eine einzelne Waffen-/Rüstungsdefinition migrieren. | Die Übernahme prüft die tatsächliche Menge gegen die Zieldefinition. Die Vorschau weist solche Zeilen zur Einzelprüfung aus; sie geraten nicht in die sichere Sammelauswahl. Alte Zeilen werden weder gelöscht noch automatisch aufgeteilt. |
| Hoch | Gegenstände mit Ladungen konnten einen Stapel bilden, obwohl nur ein `chargesCurrent` pro Besitzzeile existiert. Das Aufteilen hätte den einen Ladungsstand auf beide Teile kopiert. | Geladene Gegenstände werden effektiv einzeln geführt. Neuanlage, Zuteilung und Teilübergabe prüfen das gemeinsam. Die Prüfung steht außerhalb der Definitionsnormalisierung und verändert deshalb keine bereits gebundene Regelversion. Normale Nahrungs-/Verbrauchsstapel bleiben möglich. |

Die gemeinsame Prüfung liegt in
[`item-definition-model.js`](../../modules/item-definitions/item-definition-model.js).
Der korrigierte Herkunftsfallback liegt in
[`item-register-module-source.js`](../../../firebase/functions/src/mechanics/item-register-module-source.js).
Browser- und Functions-Projektionen wurden mit dem bestehenden Generator
synchronisiert. Gewöhnliche Dialog-/Rollenspielbeiträge erhalten dadurch keine
neuen Pflichtfelder oder Sperren.

## Wichtige nächste Ausbauschritte

1. **Geprüfte Altbestandsübernahme tatsächlich durchführen.** Das derzeitige
   lokale System hat bewusst keine produktive Massenmigration vorgenommen.
   Unklare persönliche Waffen bleiben Einzelprüfungen. Die im Ausgangsbericht
   genannten lokalen Zahlen sind kein Zensus des Livebestands.
2. **Tausch zwischen Figuren als einen Auftrag modellieren.** Ein Registerkauf
   ist bereits atomar. Eine frei vereinbarte Bezahlung aus einem Spielerinventar
   gegen einen Gegenstand eines anderen Spielerinventars hat noch keinen
   gemeinsamen, beidseitig bestätigten Vertrag. Zwei kostenlose Übergaben sind
   dafür kein gleichwertiger Ersatz.
3. **Lebenszyklus individueller Gegenstände vervollständigen.** Verkaufte
   Exemplare bleiben absichtlich im Beleg und werden nicht automatisch zu
   generischer Händlerware. Ein Rückkauf derselben Instanz benötigt einen echten
   Händlerbestand. Auch das manuelle Entfernen eines Unikats sollte später ein
   ausdrückliches Vernichten-/Ablegen-Ereignis mit nachvollziehbarer Bindung
   erhalten. Vorhandene Szenenplatzierung, Aufnahme und Entwaffnungs-Drops sind
   davon getrennte, bereits bestehende Abläufe.
4. **Effizienz vor großen Lagern erweitern.** Die bestehende Grenze von 80
   Arrayzeilen und je eine neue Besitzzeile pro Kauf ist für umfangreiche Lager
   begrenzt. Eine sichere Zusammenfassung braucht identische Definitionversion,
   Zustand, Gebinde und eine erhaltene Herkunft je Kaufposten. Ein bloßer
   Namensvergleich reicht nicht. Auslagerung in Instanzdokumente sollte erst
   zusammen mit Transaktionen, Ausrüstungslinks und Backupvertrag erfolgen.
5. **Builder und automatische Wirkungen gezielt ergänzen.** Stapelbarkeit ist
   im Datenvertrag vorhanden, aber noch kein eigenes Builderfeld. Automatische
   Verwendung unterstützt feste Eigenheilung, temporäre TP und Ressourcen,
   nicht allgemein gewürfelte/fremdgerichtete Wirkungen. Diese Grenzen sollten
   bei neuen Tränken/Artefakten ausdrücklich modelliert werden, statt Werte aus
   Beschreibungstext abzuleiten.

Rast-/Rücknahmeverhalten, Questkonten, Szenenabschluss und Backupkonsistenz werden
im übergeordneten Systemcheck separat geprüft. Eine korrekte Itemtransaktion
allein garantiert noch nicht, dass ein späterer fremder Schreibpfad ihren Stand
erhält.

## Nachweise

Die vier neuen serverseitigen Regressionen wurden zunächst am fehlerhaften
Verhalten reproduziert. Nach der Korrektur bestanden:

- 277/277 Functions-Unitprüfungen im damaligen gemeinsamen Arbeitsstand:
  [`items-server.log`](../../../diagnostics/system-checkup-2026-11-01/items-server.log).
- 60/60 gezielte Frontend-/Modellprüfungen:
  [`items-frontend.log`](../../../diagnostics/system-checkup-2026-11-01/items-frontend.log).
- Acht neue Regressionen: je vier in
  [`item-system-checkup.test.js`](../../../firebase/functions/tests/item-system-checkup.test.js)
  und [`item-system-checkup.test.mjs`](../../tests/item-system-checkup.test.mjs).

Dieser Teilcheck ersetzt weder den vollständigen Frontendlauf noch die
übergreifende Emulatorprobe oder den Produktivbuild. Er behauptet keine
vollständig fertige Automatisierung sämtlicher Warenwirkungen.
