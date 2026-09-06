# Landtroll – Kreaturbogen und Generalprobe

Stand: 6. September 2026. Lokale Implementierung und isolierte Tests; keine Änderungen an produktiven Kampfständen oder Charakterinventaren.

## Kreaturkarte

[Lesbare Landtroll-Karte](landtroll/landtroll.html) · [Importierbarer Kreaturbogen](landtroll/landtroll.creature.json) · [Einzelergebnisse und geprüfte Charakterprofile](landtroll/simulation-results.json)

Der Landtroll ist eine eingebaute, duplizierbare Kreaturvorlage. Eigene Szeneninstanzen führen ihren Kampfstand getrennt. Individuell gespeicherte Kreaturen werden durch Änderungen am Vorlagenkatalog nicht ungefragt überschrieben.

| Wert | Landtroll |
|---|---:|
| Stufe / Bedrohungsgrad | 12 |
| Lebenspunkte | 140 |
| Trefferwürfel | W12 |
| RK | 14 |
| Kraft / Konstitution | 22 (+6) / 20 (+5) |
| Bewegung | 9 m |
| Aktion / Bonusaktion / Reaktion | 2 / 1 / 1 je eigenem Kampfpost |
| Besondere Aktionen | 4, anhaltender Verbrauch |

Die Angriffe verwenden ihre angegebenen Kosten. Die Vorlage schaltet für diese Angriffe keine Aura-Ersatzzahlung frei. Automatisch vorhandene allgemeine Profilressourcen wie Inspiration und Aura werden im Bogen weiterhin angezeigt; sie wurden in diesen Läufen nicht eingesetzt.

| Handlung | Treffer | Schaden | Kosten | Wirkung |
|---|---:|---|---|---|
| Landtroll-Keule | +8 | 1W10 + 6 | 1 Aktion | Einzelangriff |
| Brockenwurf | +6 | 1W4 + 2 | 1 Bonusaktion | Einzelziel; greifbaren Stein und Szenenkontext berücksichtigen |
| Knochenbrecher | +8 | 2W8 + 6 | 1 Aktion + 1 Reaktion | Schwerer Einzelangriff; verzichtet auf die Abwehrreaktion |
| Zerschmetternder Keulenbogen | +8 | 2W6 + 6 je getroffenem Ziel | 2 Aktionen + 1 Bonusaktion + 1 Besondere Aktion | Bis zu vier ausdrücklich ausgewählte Ziele; nach Treffer KON-Rettung SG 14, bei Misslingen einen eigenen Kampfpost betäubt |
| Deckung hinter dem Unterarm | automatisch | – | 1 Reaktion | +2 RK bis Ende des nächsten eigenen Kampfposts; erneuert sich, stapelt nicht |

Zusätzlich bleibt der allgemeine unbewaffnete Grundangriff des Systems verfügbar. Die Kosten des Keulenbogens werden einmal für die gesamte Handlung bezahlt. Jedes Ziel hat seinen eigenen Treffer- und Rettungswurf. Vier Ziele sind eine Obergrenze, keine automatische Zielauswahl.

**Trollblut:** Zu Beginn eines eigenen mechanischen Kampfposts heilt der lebende Troll **1W12 + 10 LP**, höchstens bis zu seinem Maximum. Weitere Abschnitte und weitere Ziele im selben Post heilen ihn nicht erneut. Bei vollen LP wird kein überflüssiger Heilwürfel geworfen; bei 0 LP gibt es keine automatische Wiederbelebung.

**Feuer:** Tatsächlich angewandter Feuerschaden erzeugt bzw. erneuert *Verbrannt* bis zum Ende des nächsten eigenen Kampfposts. *Verbrannt* und *Brennend* unterdrücken Trollblut und senken die RK einmalig um 2. Mehrere Feuerquellen stapeln diesen RK-Abzug nicht. Ein Fehlschlag oder vollständig immunisierter Feuerschaden löst keinen Feuerzustand aus. Zusätzlicher Brandschaden über Zeit wird hier nicht erfunden.

**Aussetzen:** Die neue Handlung *Abwarten / Zug aussetzen* erlaubt einen mechanischen Kampfpost ohne Angriff und ohne Aktionskosten. Damit werden Trollblut und die Dauer einer Betäubung korrekt abgewickelt. Reine Erzähltexte ohne Kampfhandlung lösen keinen automatischen Heilwurf aus; für einen ausgesetzten Kampfzug ist diese Handlung zu verwenden.

## Geprüfte Figuren

| Figur | Klasse | Stufe | LP zu Testbeginn | RK | Geführte Waffe |
|---|---|---:|---:|---:|---|
| Fenrir Varulv | Skjaldr | 6 | 82 | 16 | Großaxt |
| Freya Skald | Skalde | 5 | 42 | 13 | Laute |
| Guinevere Neidr | Helwyr | 5 | 37 | 11 | Helwyr-Langbogen |
| Gawain Draig | Teulu | 5 | 49 | 16 | Drachenzahn, Draig-Ritterschwert |

Die vorhandenen Bögen liefern diese Werte ohne dauerhafte Testkorrekturen. Fenrirs aktueller Berserkergang, Freyas Spottvers und die klassenabhängige Angriffsauswahl wurden verwendet. Guineveres Nahkampftechniken sind bei geführtem Bogen zu Recht nicht aktiv; sie stehen nach der passenden Waffenwahl zur Verfügung. Der Klassen- und Ausrüstungssynchronisationscheck meldet keine ausstehenden Bogenkorrekturen.

Guineveres Inventar enthält außerdem 40 Standardpfeile und fünf Feuerpfeile. Ihr regulärer Bogen ist mit den Standardpfeilen verbunden. Die Feuerpfeile sind bislang als Gegenstände mit einer Beschreibung von zusätzlichem 1W4 Feuerschaden hinterlegt, nicht als eigener automatischer Feuerangriff. Die begrenzte Vergleichsserie bildet diese Beschreibung ausschließlich in einer Testkopie strukturiert ab. Sie ergänzt keine Feuerzauber und ändert keinen gespeicherten Charakterbogen.

## Versuchsaufbau

- Gemeinsame echte Kampfauflösung für Browser und Firebase: Trefferwürfe, kritische Treffer, Schadenswürfel, Rettungswürfe, Ressourcen, Berserkerschutz, Zustände und Munition. Keine Ersatzformel für Kampfschaden.
- 100 Läufe je Szenario. Reproduzierbare Startwerte: `81000 + 7919 × Laufindex`. Initiative einmal pro Kampf; Treffer- und Rettungswürfe werden gewürfelt.
- Alle starten mit vollen regulären LP und ihren vorhandenen Ressourcen. Keine Begleiter, Tränke, externen Buffs oder zusätzliche Charakterfähigkeiten.
- Ein ganzer eigener Kampfpost ist ein Zug. Ressourcen bestimmen die Zahl möglicher Handlungen; die Simulation setzt kein zusätzliches Angriffslimit.
- Fenrir aktiviert zu Beginn seinen Berserkergang. Freya verwendet in ungeraden Runden Spottvers, ansonsten ihre verfügbare Grundattacke. Ihr einmaliger Arkaner Schrei gehört nicht zu dieser festen Taktik.
- Gawain und Fenrir bilden die vordere Linie, Freya und Guinevere unterstützen dahinter. Der Troll bedrängt zuerst die vordere Linie. Der Keulenbogen erfasst in dieser Aufstellung zunächst diese beiden, keine automatisch hinzugenommenen Fernkämpfer.
- Der Troll setzt den Keulenbogen in passenden ungeraden Runden ein, solange seine Besonderen Aktionen reichen. Sonst verwendet er Einzelangriffe und Brockenwurf; Unterarmdeckung und Knochenbrecher konkurrieren um dieselbe Reaktion.
- Für den zusätzlichen Vergleich werden Gawain und Gildas ausschließlich in Testkopien über das vorhandene manuelle Aufstiegssystem auf Stufe 7 gebracht. Beide zählen dort zur vorderen Linie.
- Sicherheitsabbruch nach 30 Runden; in den dokumentierten Serien gab es keine solchen Abbrüche.

Die Ergebnisse gelten für diese Aufstellung und Taktik. Sie sind kein Beweis für eine universelle Gewinnchance über alle möglichen Entscheidungen, Waffenwechsel oder Aufstellungen.

## Ergebnisse

| Szenario | Figurenseite gewinnt | Landtroll gewinnt | Kürzester / längster Kampf | Ø Runden |
|---|---:|---:|---|---:|
| Vierergruppe, Standardmunition, ohne Feuer | 30 / 100 | 70 / 100 | 5 / 16 | 10,94 |
| Vierergruppe, isolierter Feuer-Regeltest | 100 / 100 | 0 / 100 | 3 / 12 | 5,38 |
| Fenrir und Gawain, vorhandene Stufen | 0 / 100 | 100 / 100 | 5 / 10 | 7,64 |
| Gawain allein | 0 / 100 | 100 / 100 | 2 / 6 | 3,22 |
| Gawain und Gildas, beide Stufe 7 | 1 / 100 | 99 / 100 | 4 / 13 | 8,18 |
| Vierergruppe, fünf Feuerpfeile mit zusätzlichem 1W4 Feuer | 89 / 100 | 11 / 100 | 3 / 13 | 6,10 |

Insgesamt wurden 600 Kämpfe ausgewertet. Der isolierte Feuer-Regeltest gibt der geführten Bogenwaffe testweise die Schadensart Feuer, ohne weitere Schadenswürfel. Er prüft die Mechanik bei fortlaufend verfügbarem Feuer und ist keine Behauptung, dass Guinevere unbegrenzt Feuerpfeile besitzt. Der gesonderte Vergleich mit fünf Feuerpfeilen verwendet deren tatsächlich begrenzte Stückzahl, verbraucht Pfeile auch bei Fehlschlägen und fällt anschließend auf Standardmunition zurück.

Ohne Feuer regenerierte der Troll im Schnitt **171,45 LP pro Kampf**; zusätzlich zu seinen 140 anfänglichen LP muss die Gruppe also erheblich mehr Schaden durchbringen. Durchschnittlich wurden **1,92 Betäubungen** angewandt. Das erklärt, warum der Troll trotz einzelner Gruppensiege der deutlich gefährlichere Gegner bleibt.

Der kürzeste Kampf ohne Feuer dauerte fünf Runden (Startwert 255218): Die Gruppe gewann mit 73/42/37/23 LP. Der längste dauerte 16 Runden (Startwert 310651): Der Troll gewann mit 84 LP und hatte im Verlauf 253 LP regeneriert. 0 LP bedeuten Kampfunfähigkeit; kein automatischer Tod wird festgelegt.

## Server-Generalprobe und Fehlerkorrekturen

Ein vollständiger Lauf ohne Feuer wurde zusätzlich im Firestore-Emulator über die echten Firebase-Transaktionen gespielt. **39 Posts**, Sieg der Gruppe in Runde **9**: Fenrir 13 LP, Freya 42 LP, Guinevere 37 LP, Gawain 0 LP. Der Troll regenerierte 102 LP. Nach jedem Post wurden Serverstand und Wiederberechnung der gesamten Historie mit der Simulation verglichen; die Kreaturvorlage blieb unverändert.

Gezielt geprüft wurden außerdem:

- Trollblut einmal pro vollständigem Post, Heilungsobergrenze, neue Heilung im nächsten Post und keine Wiederbelebung bei 0 LP.
- Vier Einzelrettungen beim Keulenbogen und einmaliger Ressourcenverbrauch für die gesamte Handlung.
- Ein fünftes Ziel wird vom Server abgelehnt, ohne LP oder Ressourcen zu verändern.
- Betäubung sperrt Kampfhandlungen; Aussetzen lässt den eigenen Post und damit die Zustandsdauer verstreichen.
- Feuer unterdrückt die Heilung, senkt die RK, läuft korrekt aus und wird durch erneutes Feuer erneuert.
- Rücknahme von Kampfposts stellt LP, Ressourcen und Feuerzustände wieder her.
- Manipulierte Heilbeträge und LP-Schnappschüsse werden serverseitig aus dem zulässigen Würfelergebnis neu berechnet.
- Veraltete rechte/linke Waffen-IDs im Kommentarentwurf lösen bei Kreaturen keinen falschen Ausrüstungsfehler mehr aus. Charaktere behalten ihre Ausrüstungsprüfung.
- Der Kreaturbogen setzt die Stufe vor der Berechnung der Ressourcen. Ein Stufe-12-Troll erhält dadurch sofort den korrekten Pool.

Die gesamte Kreaturenverwaltung wurde auf Pergamentfarben umgestellt: Bibliothek, Karten, vollständiger Editor, Wertefelder, Ressourcen, Aura, Zauber, Zustände und die zugehörige Detailwerkstatt. Porträts bleiben im Format 2:3 sichtbar. Die Übersicht trennt gespeicherten Bogen und szenengebundenen Kampfstand. Der Editor bleibt ausklappbar; aktive Waffenflags, Kompetenzautomatik und strukturierte passive Regeln werden beim Speichern erhalten.

**Verifikation:** 581 Frontendtests, 38 Klassentests, 90 Firebase-Unit-Tests, 62 bisherige Emulator-Integrationstests und sieben neue Landtroll-Integrationstests bestanden: **778 Tests**. Dazu bestehen Klassen-/Bogensynchronisation, lokaler Produktionsbuild und Browserprüfungen auf 1440 bzw. 390 Pixeln Breite, einschließlich des geöffneten mobilen Editors und eines Speicher-Rundlaufs. Beim Build bleiben die bekannten allgemeinen Hinweise zu klassischen Skripten und großen Bundles bestehen.

## Wiederholen und Testumgebung

Die Simulation benötigt keine Firebase-Verbindung und schreibt ausschließlich Berichtsartefakte:

```powershell
cd E:\Aleria\AleriaAlmanach
npm run test:landtroll
```

Für die Transaktionstests den Firestore-Emulator mit dem Projekt `demo-aleria-combat-checkup` ausschließlich auf `127.0.0.1:8180` starten. Die Testfixtures verweigern andere Emulatoradressen und löschen ausschließlich dieses Demo-Projekt:

```powershell
cd E:\Aleria\firebase\functions
$env:FIRESTORE_EMULATOR_HOST='127.0.0.1:8180'
npm run test:landtroll
```

Browserprüfungen verwenden eine lokale Kopie der echten UI-Module mit einer ausschließlich im Speicher arbeitenden Testablage. Produktives Firebase und vorhandene Charakterinventare werden dabei nicht beschrieben. Testquellen und Berichte bleiben zur Wiederholung erhalten. Nach Abschluss wurden die Demo-Daten gelöscht, der verifizierte Emulatorprozess beendet und die temporäre Browser-Testseite entfernt. Kein Produktionsdeploy wurde durchgeführt.
