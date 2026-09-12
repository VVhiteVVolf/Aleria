# Gründlicher Kampfcheck vom 12. September 2026

## Ergebnis und Geltungsbereich

Der lokale Kampfstand wurde über Berechnung, sichtbare Auswertung, Ressourcen, Zustandsdauer, Konzentration, Kanalisierung, Szenen-Replay, serverseitige Neuberechnung, Speicherung und Rücknahme geprüft. Dabei wurden reproduzierbare Fehler behoben. Die parallel bearbeiteten Katalog- und Registerinhalte wurden als Eingaben verwendet und nicht umgestaltet.

Dies ist ein Prüfbericht des lokalen Quellstands. Es wurden keine produktiven Firebase-Daten verändert und keine Änderungen veröffentlicht.

## Gefundene und behobene Fehler

| Bereich | Vorher | Korrigiertes Verhalten |
| --- | --- | --- |
| Ältere Zustandsdauern | Ein Effekt mit `remainingActorComments: 2` konnte beim Normalisieren ein permanentes Dauermodell erhalten. | Die bestehende Dauer-Migration erhält die zwei Beiträge; ein ausdrücklich gesetztes Dauermodell hat Vorrang. |
| Feste Effektwerte | `amount: 8` mit explizitem INT-Bonus +3 blieb bei Schaden, Heilung und temporären TP bei 8. | Ergebnis 11; Schadensvorschau, Modifikator und sichtbare Formel stimmen überein. Negative Ergebnisse werden auf 0 begrenzt. |
| Ressourcen und Reaktionen | Entzug von 4 und Reaktionskosten von 3 konnten bei einem Vorrat von 10 am Ende 7 ergeben; ein weiterer Schreibschritt konnte in der Datenbank wieder 6 hinterlegen. | Beide Änderungen werden aufeinander aufgebaut: Vorschau, Replay und gespeicherter Vorrat ergeben 3. Die Rücknahme stellt 10 wieder her. |
| Frühe Regelphasen | Strukturierte `resultEffects` bereits ausgelöster Regeln aus den Angriffsphasen wurden ignoriert. | Sie durchlaufen die gemeinsame Effektverarbeitung einmal als Folgen der Auswertung. |
| Später Schaden | Ein Grundschaden von 4 plus Nachwirkung 7 senkte TP um 11, die Schadenssumme blieb aber 4. Nur durch Regeln ausgelöster Schaden konnte ganz ohne Schadenszusammenfassung bleiben. | Der Beleg summiert alle tatsächlich ausgewerteten Schadenskomponenten. Die Anzeige berücksichtigt auch feste Komponenten ohne Würfel. |
| Konzentration und Empfänger | Eigenschaden prüfte die Konzentration der handelnden Figur nicht; Selbstunterbrechung konnte das Gegenüber unterbrechen. | Die tatsächlich betroffene Figur wird geprüft. Die sichtbare Würfelzuordnung benennt ebenfalls diese Figur. |
| Späte Unterbrechung und Niederlage | Konzentration konnte nach tödlichem Zusatzschaden weiterbestehen; Kanalisierung endete bei einer Niederlage nicht zuverlässig. | Lebenszyklusprüfungen erfassen auch späte Effekte und 0 TP. Zugehörige Zustände werden entfernt. Eine notwendige weitere Konzentrationsprobe erzeugt keine rekursive Kette zusätzlicher Folgewirkungen. 0 TP bedeutet weiterhin kampfunfähig, nicht automatisch tot. |
| Reihenfolge der Würfelbelege | Eine feste Schadenszusammenfassung ohne Einzelwürfel konnte den Beleg eines folgenden Würfeleffekts verdrängen. | Feste Werte belegen keinen Würfelplatz. Eine aus späteren Effekten abgeleitete Schadenszusammenfassung wird nicht als früher Hauptwurf interpretiert. Manipulierte Summen werden weiterhin serverseitig neu berechnet. |
| Radiusregeln | Eine unbekannte oder leere Entfernung konnte als 0 Meter gelten. | Eine begrenzte Radiusregel benötigt einen bekannten Abstand. Ausdrücklich angegebene 0 Meter bleiben gültig. |
| Verbrauchsauslöser | Ein Entzugsversuch aus einem bereits leeren Vorrat konnte `on-resource-spent` auslösen. | Der Auslöser benötigt einen tatsächlichen Rückgang. |
| Rüstungsroutine | Die fünf Venalys-Kämpferklassen fehlten in der gemeinsamen Zuordnung; der Bestandstest scheiterte zuerst an Limita. | Limita, Condottieri, Gondoleri, Lancieri und Stralieri folgen derselben Freischaltung ab Stufe 12. Rüstungsmodus, GES-Begrenzung und ausdrückliche RK-Overrides bleiben maßgeblich. |

Die Konzentrationsprüfung liegt jetzt in `modules/combat/combat-concentration-resolution.js`, gemeinsam für handelnde Figur und Ziel. Datenbankverantwortung bleibt im bestehenden Serverhandler. Die geänderten gemeinsamen Regeln sind in der generierten Servermechanik enthalten.

## Zahlen und Zeitabläufe

Geprüft wurden unter anderem:

- Treffergrenzen, natürliche 1/20, Vorteil/Nachteil, kritische Würfel, Rettungswürfe und halber Schaden.
- Gemischte Schadensarten, Immunität, Resistenz, Verwundbarkeit, deren Kombinationen, Überlaufschaden und temporäre TP vor regulären TP.
- Heilungsobergrenze, 0 TP, Eigenschaden, Nichtaddition verschiedener Angebote temporärer TP und unveränderte Eingabeobjekte. Die neue Zahlenmatrix enthält 60 Kombinationen aus aktuellen TP, temporären TP und Effektbetrag, jeweils mit fünf Affinitätskonstellationen.
- Aktionspakete, fehlende Teilressourcen, mehrere Abschnitte in einem Gesamtbeitrag, Tagesressourcen, Aura-Ersatz, Munition, Ausrüstung und einmalige Kosten bei mehreren Zielen.
- Eigene gegenüber fremden Beiträgen, Ablauf nach dem vollständigen Gesamtbeitrag, Erneuerung eines Zustands, Konzentrationswechsel, Rast, Tageswechsel, Kampfende und Rücknahme.
- Kanalisierung über verschiedene Gesamtbeiträge, unterbundener mehrfacher Fortschritt im selben Beitrag und Abschlusskosten.
- Mehrere Ziele, Folgen eines bereits begonnenen Flächenangriffs bei anschließender Kampfunfähigkeit des Akteurs, Begleiter, Berserkergang, voneinander unabhängige Kreaturinstanzen, gleichzeitige Schreibversuche und abhängige Rücknahmen.

Die am selben Tag festgelegte Manastaffel **2, 3, 4, 6, 7, 9, 11, 12, 13, 15, 18** für Grad 0–10 gilt. Ein älterer Integrationstest für Grad III erwartete noch 5 statt 6; seine Erwartung und der zweimalige Gesamtverbrauch wurden an die Projektregel angepasst. Manavorräte und Regeneration wurden dadurch nicht verändert.

## Prüfnachweise

| Prüfung | Ergebnis |
| --- | ---: |
| Vollständige Frontend-Testsuite | 756/756 erfolgreich |
| Vollständige Server-Testsuite | 103/103 erfolgreich |
| Unterschiedliche Tests mit tatsächlicher Firestore-Speicherung und Rücknahme | 66/66 erfolgreich |
| Vollständige Gruppenkämpfe mit festen Zufallsfolgen | 12/12 erfolgreich |
| Firestore-Regeln der Hauptanwendung | 16/16 erfolgreich |
| Browser mit echten Auswertungsmodulen, 1280 und 390 Pixel | Erfolgreich; keine JavaScript-Fehler, kein horizontaler Seitenüberlauf |
| Produktionsbuild | Erfolgreich |

Die 66 Integrationstests verteilen sich auf den ursprünglichen Durchlauf, die Wiederholung der acht Gruppentests nach Anpassung der veralteten Mana-Erwartung und vier neue Regressionstests. Wiederholungen werden nicht zusätzlich gezählt. Nach den letzten Änderungen an Zahlenanzeige und Würfelzuordnung wurden die betroffenen Frontend- und Serverprüfungen nochmals erfolgreich ausgeführt.

Die zwölf Simulationen umfassen jeweils drei Würfelfolgen für:

1. Rhiannon und Gawain gegen Gildas und einen Plünderer.
2. Guinevere, Gawain und Tanor gegen Gildas, einen Schützen und einen Plünderer.
3. Fenrir und Freya gegen einen Raubritter und zwei Plünderer.
4. Duncan auf Stufe 20 gegen zwei Raubritter und zwei Schützen.

Die zwölf Kämpfe enthalten insgesamt **286 Zielauswertungen**. Nach jedem gespeicherten Beitrag vergleichen die Simulationen Vorschau und Serverergebnis, prüfen TP-/Ressourcengrenzen und rekonstruieren den Szenenstand. Kreaturvorlagen bleiben unverändert. Jeder dieser Kämpfe erreicht einen regulären Abschluss.

Neue dauerhafte Regressionstests:

- `tests/combat-checkup.test.mjs`: 16 Frontendtests einschließlich der Zahlenmatrix.
- `firebase/functions/tests/combat-checkup.test.js`: fünf Prüfungen der serverseitigen Würfel- und Effektverarbeitung.
- `firebase/functions/tests/integration/combat-checkup-regressions.integration.mjs`: vier Speicher-, Dauer- und Rücknahmetests; in `test:combat-integration` aufgenommen.

Lokale Protokolle, Browserprogramm und Screenshots stehen unter `.codex-temp/combat-system-checkup/`. Die Hauptintegration verwendet ausschließlich `demo-aleria-combat-checkup` auf dem lokalen Emulator. Für die Prüfung der Zugriffsregeln musste der Emulator mit englischer Java-Locale gestartet werden, da seine installierte Version bei bestimmten abgelehnten Zugriffen mit der deutschen Locale intern scheiterte. Dieser Werkzeugfehler wurde nicht durch Änderungen an den Zugriffsregeln umgangen.

## Regelentscheidungen, die weiterhin ausdrücklich geklärt sein sollten

**Freitext und mechanische Dauer:** Eine Angabe wie „eine Minute“ oder „bis Kampfende“ in einem Beschreibungstext erzeugt keinen automatischen Timer. Szenenzustände brauchen ein strukturiertes Dauermodell. Dauerhafte Bogeneinträge und temporäre Szenenzustände haben unterschiedliche Aufgaben.

**Temporäre TP mit Herkunft:** Aktuell gilt ein gemeinsamer Vorrat, bei einem neuen Angebot zählt der größere Wert. Es gibt keine getrennten Quellen mit individuellen Ablaufzeiten. Soll ein Schutz beim Kampfende, nach einer Minute oder bei Konzentrationsverlust seine verbleibenden temporären TP verlieren, braucht das eine verbindliche Regel und eine Quellenverwaltung.

**Mehrfachtreffer und Konzentration:** Die bisherigen Grund- und Folgekomponenten einer Zielauswertung werden für eine Konzentrationsprobe zusammengezählt; späterer Zusatzschaden kann eine weitere Probe auslösen. Eine Probe pro einzelnem Treffer wäre eine andere Regel. Der Check übernimmt hier keine fremde Spielsystemkonvention.

**Gesamtbeitrag als Zeiteinheit:** Reguläre Aktionsressourcen werden pro Gesamtbeitrag aufgefüllt. Mehrere Abschnitte desselben Beitrags teilen sich ihr Budget. Mehrere getrennte Beiträge eröffnen dagegen neue Budgets; eine technische Reihenfolge mit verpflichtendem Zugwechsel ist damit nicht definiert.

**Reichweite, Gelände und Zonen:** Strukturierte Radien werden ausgewertet. Beschreibende Reichweiten, Sichtlinien, Deckung durch Gelände, tatsächliche Positionsänderungen und spätere Kontakte mit Zonen bilden noch keine vollständige taktische Positionssimulation.

Die erfolgreichen Simulationen belegen die geprüften Abläufe, keine allgemeine Balancegarantie für alle Klassen, Ausrüstungen und zukünftigen Zauber. Diese offenen Modellierungsfragen wurden nicht still durch neue Hausregeln entschieden.

## Veröffentlichung

Für die Livewirkung müssen Frontend und die aktualisierten Firebase-Funktionen gemeinsam veröffentlicht werden. Historische Kampfbelege wurden nicht umgeschrieben.
