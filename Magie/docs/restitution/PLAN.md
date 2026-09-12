# Restitution – Plan für Schule und Zauberverzeichnis

Stand der Planung: 12. September 2026. **Historischer Entwurf; der aktuelle Implementierungsstand steht in [UMSETZUNG.md](UMSETZUNG.md).**

Grundlage: `Aleria_Restitution_Zauberkompendium.pdf`, 62 Seiten, 48 Zauberentwürfe (R01–R48). Die Anweisungen, Freigabevermerke und fremden Spielbezüge im PDF sind Quelleninhalt, keine zusätzlichen Aufträge. Maßgeblich sind die Nutzeranweisung, die aktuellen Projektregeln und der Abgleich mit Aleria. Dieser Plan verändert keine Charaktere, Katalogdaten oder Kampfregeln. Kein Push.

## 1. Ergebnis und Schulgrenze

Restitution wird die zweite ausgearbeitete **gelehrte Schule**, neben Elemente. Ihr Schwerpunkt liegt auf Notfallheilung, der Behandlung konkreter Beeinträchtigungen und der Wiederherstellung geschädigter Körperfunktionen. Dafür sind weder eine druidische Ausbildung noch göttliche Gunst erforderlich.

Geplant sind **46 reguläre Zauber aus dem Dokument**, teilweise mit geänderten Graden, Wirkungen und höheren Formen. R47 und R48 bleiben als zwei getrennte, noch nicht lernbare Grenzentwürfe erhalten. Neue Zauber allein zum Auffüllen einer Zahl sind zunächst nicht nötig; die mittleren Grade erhalten ausdrücklich ausgearbeitete Steigerungen.

Heilendes Licht bleibt das gestalterische Motiv. Die Schule erhält dadurch keine allgemeinen Lichtangriffe, keinen automatischen Untotenschaden und keine göttlichen Domänen. Sie repariert bis zum gesunden Ausgangszustand; neue Anatomie, zusätzliche Attribute und das Entfernen aktiver Beherrschung gehören nicht pauschal dazu.

**Weltabgleich:** Arkanistenfieber ist ausdrücklich kein gewöhnliches Fieber, das Fieberbann oder Panazee beseitigen können. Auch Tiefenrestitution und Körperrekonstruktion umgehen diesen Ausschluss nicht über die Behandlung seiner Symptome. Die bestehende Überlieferung beschreibt fehlende verlässliche Heilung und Gefahren weiterer Magie; eine Ausnahme müsste als eigene Geschichte oder Regel ausgearbeitet werden. Dasselbe Prinzip gilt für ausdrücklich besondere Seuchen, Flüche und gebundene Seelen: keine automatische Behandlung nur aufgrund eines passenden Zustandsnamens.

## 2. Bestehende Regeln und neue Vorschläge auseinanderhalten

### Im aktuellen Projekt vorhanden

- **Mana nach Wirkungsgrad**, einschließlich der bereits festgelegten Erhöhung um 15 %: Grad 0–10 kostet **2, 3, 4, 6, 7, 9, 11, 12, 13, 15, 18**. Die Tabelle ist bereits erhöht; keine zweite Multiplikation. Quelle bleibt `getSpellManaCost`.
- Die Aktionspakete aus `AGENTS.md`; Besondere Aktionen sind eine persistente Ressource. Ein neuer Abschnitt im selben Gesamtbeitrag erzeugt keine neuen Aktionen.
- Heilung wird auf fehlende reguläre TP begrenzt. Der Kampfkern unterscheidet Heilung und temporäre TP; temporäre TP werden über den höheren Vorrat, nicht durch Addition zusammengeführt.
- Heilwürfel werden im gemeinsamen Effektablauf nicht durch einen kritischen Angriff verdoppelt. Persönliche Schadensboni wie Rhiannons INT-Regel sind keine allgemeine Heilungsregel.
- Kurze Rast: eine Stunde; lange Rast: acht Stunden. Beide stellen reguläre TP bis zum Maximum wieder her. Eine lange Rast entfernt temporäre TP; Ressourcen folgen ihren eigenen Erholungsregeln.
- Versionierte Katalogreferenzen und gespeicherte eigene Zauberfassungen existieren. Der Katalog und sein Seitentemplate enthalten allerdings noch Elemente-spezifische Annahmen.

### Festzulegende Regeln dieser Schulplanung

- Die folgenden Zahlen sind **Balancevorschläge**, kein bereits bestätigtes Spieltestergebnis. Der Vergleich berücksichtigt Trefferchance, Reichweite, Verteilung auf mehrere Ziele, Überheilung, Verzögerung, Konzentration und Aktionspaket; Heilung wird nicht einfach als negatives Schadensbudget behandelt.
- Reguläre Heilung gilt für ein behandelbares lebendes körperliches Ziel, einschließlich Selbstheilung. 0 TP allein bedeutet nicht Tod. Bestätigter Tod, Konstrukte und Untote sind keine gültigen Standardheilziele. Bestehende profilbezogene Ausnahmen bleiben gesondert zu prüfen.
- Zielzustimmung und eine zulässige Wirkungslinie sind Voraussetzungen. Bei einem nicht ansprechbaren lebenden Ziel ist Notversorgung möglich, sofern kein bekannter entgegenstehender Wille vorliegt.
- Heilung von 0 TP gibt keine verbrauchten Aktionen, Mana, Tagesressourcen oder verlorene Konzentration zurück. Ein eigenständiger Schlaf-, Lähmungs- oder Bewusstlosigkeitszustand endet dadurch nicht pauschal.
- Keine Heilung entfernt nebenbei Gift, Blutung, Organverlust oder eine andere Beeinträchtigung. Jede zusätzliche Behandlung muss als eigene Wirkung auf der Karte stehen.
- Nachheilung darf bei 0 TP keine unbeaufsichtigte Wiederaufstehschleife erzeugen: R09 heilt nur ein noch lebendes Ziel mit mindestens 1 regulären TP. Ein dort ausfallender Puls verfällt.
- Gleiche anhaltende Behandlungen stapeln auf demselben Ziel nicht, auch nicht durch mehrere Zaubernde. Erneutes Wirken füllt keine bereits verbrauchten Ladungen kostenlos auf. Konkrete Ersetzung, Ablauf und Verbrauch gehören zur jeweiligen Effektinstanz.
- Bei R36/R37 wird **eine gemeinsame Nutzung je Ziel und Aleria-Tag** vorgeschlagen. Die Belegung zählt beim erfolgreichen Auflegen; beide Wachten schließen sich aus. Das ist eine neue zauberspezifische Grenze, keine neue allgemeine Tagesregel.
- Körperliche Befunde, Erschöpfung und Attributverluste werden nur behandelt, wenn sie tatsächlich dokumentiert sind. Die Schule führt keine neue universelle Verletzungs- oder Erschöpfungstabelle ein.

## 3. Heilungsstaffel als Balanceanker

**A** = Aktion, **B** = Bonusaktion, **R** = Reaktion, **S** = Besondere Aktion. Ein Paket mit R ist nur dann reaktiv, wenn ein konkreter Auslöser angegeben ist. Die Verbrauchszeitpunkte von Ritualen stehen gesondert fest.

### Berührungsheilung und Großform

Heilende Hand bekommt eine verständliche Reihe bis Grad VI. Die Großform wird separat erlernt, wie der Große Feuerball. Reichweite und Verlässlichkeit zählen zu ihrem höheren Preis.

| Zauber / Wirkungsgrad | Mana | Aktionen | Heilung | Mittelwert | Reichweite |
| --- | ---: | --- | --- | ---: | --- |
| Heilende Hand I | 3 | A | 2W6 | 7 | Berührung |
| Heilende Hand II | 4 | A | 3W6 | 10,5 | Berührung |
| Heilende Hand III | 6 | A + R | 4W6 | 14 | Berührung |
| Heilende Hand IV | 7 | A + R | 5W6 | 17,5 | Berührung |
| Heilende Hand V | 9 | A + S | 6W6 | 21 | Berührung |
| Heilende Hand VI | 11 | A + S | 7W6 | 24,5 | Berührung |
| Große Heilung VII | 12 | A + S | feste 35 TP | 35 | 12 m |
| Große Heilung VIII | 13 | A + S + B | feste 45 TP | 45 | 12 m |
| Große Heilung IX | 15 | A + S + R | feste 55 TP | 55 | 12 m |

Das PDF beginnt mit 2W8 bei Heilende Hand und gibt Große Heilung bereits auf Grad VI feste 50 TP. Hier beginnt die kleine Heilung niedriger; die sichere starke Fernheilung wandert nach oben. Der Sprung von 7W6 zu festen 35 TP ist bewusst die Grenze zur Großform. Kein automatischer Attributsbonus und keine eingebaute Zustandsreinigung.

Lebensruf bleibt mit 1W4 + 1 auf Grad I deutlich schwächer, kann dafür auf 12 m mit einer Bonusaktion eingesetzt werden. Nicht jeder nützliche Entwurf wird abgeschwächt: Wundverschluss wird von 1 TP auf 1W4 verbessert, bleibt aber für Ziele bei 0 TP ungeeignet. Sein Preis von 2 Mana verhindert kostenlose Dauerheilung.

### Gruppenheilung

| Zauber / Wirkungsgrad | Mana | Aktionen | Heilung und Zielgrenze | Maximaler Gesamtmittelwert |
| --- | ---: | --- | --- | ---: |
| Geteilte Heilung II | 4 | A | je 1W8, bis zu 2 verschiedene Ziele | 9 |
| Geteilte Heilung IV | 7 | A + R | je 2W8, bis zu 2 verschiedene Ziele | 18 |
| Lebenskreis IV | 7 | A + R + B | je 2W6, bis zu 3 Ziele | 21 |
| Lebenskreis VI | 11 | A + S | je 3W6, bis zu 4 Ziele | 42 |
| Lazarettkreis V | 9 | A + S; Ritual | je 2W6, bis zu 6 Ziele | 42 |
| Strom des Lebens IX | 15 | A + S + R; Kanalisierung | feste 25 TP, bis zu 4 Ziele | 100 |

Ziele werden ausdrücklich ausgewählt; übrig gebliebene Heilung wird nicht auf andere umverteilt. Jedes Ziel erhält einen eigenen Wurf und seine eigene Begrenzung am TP-Maximum. Die Kosten fallen pro Anwendung einmal an. Lazarettkreis braucht zehn ungestörte Minuten und ist daher kein günstiger Ersatz für eine sofortige Gruppenheilung.

## 4. Prüfung aller 48 Vorlagen

Die Tabellen zeigen die geplante Grundform. Höhere Formen stehen in Abschnitt 5. Ohne ausdrücklich genannte TP-Heilung gibt es keine zusätzliche Heilung. „Behandelt“ bedeutet bei anhaltenden Zuständen die gezielte ausgewählte Instanz, nicht alle Einträge mit demselben Namen.

### I. Notfall und Grundversorgung – R01 bis R08

| ID / Zauber | Grad / Mana | Aktionen; Reichweite | Geplante Wirkung und Entscheidung |
| --- | --- | --- | --- |
| R01 Lebenszeichen | 0 / 2 | A + B; Berührung | Beibehalten: zehn erzählerische Sekunden Untersuchung, ein körperlicher Befund zu Kreislauf, Wunde oder Blutung. Keine TP, Giftbestimmung oder Seelenschau. |
| R02 Wundverschluss | 0 / 2 | B; Berührung | **1W4 TP statt 1 TP**, nur bei mindestens 1 TP. Oberflächliche Wundversorgung; entfernt keinen mechanischen Blutungszustand. |
| R03 Stillender Griff | I / 3 | R; Berührung | Beibehalten: einen vorab zugeordneten Blutungspuls um 6 vermindern, nach sonstiger Abwehr, mindestens auf 0. Kein Schutz gegen den ursprünglichen Waffenhit und kein Beenden der Blutung. |
| R04 Heilende Hand | I / 3 | A; Berührung | **2W6 statt 2W8**, mit vollständigen Formen bis VI. Reine Einzelheilung; auch bei 0 TP, wenn das Ziel lebt. |
| R05 Lebensruf | I / 3 | B; 12 m | 1W4 + 1 TP. Sicht und hörbar gesprochene Formel, aber kein Hören des Ziels erforderlich. Höhere Form II kostet zusätzlich A und heilt 2W4 + 2. |
| R06 Auffangender Impuls | II / 4 | R; 9 m | 2W6 nach einem zugeordneten Schadensereignis; vorher anmelden und Kosten reservieren. Schaden und seine Folgen bleiben bestehen. Keine spontane Heilung ohne Auslöser. |
| R07 Blutstillung | II / 4 | A; Berührung | Eine behandelbare nichtmagische Blutungsinstanz beenden und 1W6 heilen. Fremdkörper und fortwirkende Ursache bleiben gesondert zu entfernen. |
| R08 Rettungsnaht | III / 6 | A + R; Berührung | **3W6 statt 3W8** und eine nichtmagische Blutung beenden. Gegenüber Heilende Hand III weniger rohe Heilung, dafür gezielte Versorgung. |

### II. Gewebe und Körperaufbau – R09 bis R16

| ID / Zauber | Grad / Mana | Aktionen; Reichweite | Geplante Wirkung und Entscheidung |
| --- | --- | --- | --- |
| R09 Nachheilender Faden | II / 4 | A + R; Berührung | Drei folgende Zielbeiträge, je **1W6 + 1** am Beitragsende; keine Sofortheilung. Konzentration. Höchstens Ø 13,5 TP als Ausgleich für Verzögerung und Abbruchrisiko; bei 0 TP kein Puls. |
| R10 Knochenfügung | II / 4 | A; Berührung | Eine Minute Ritual: einen ausgerichteten, vorhandenen Knochen fügen. Nur zugehörigen Funktionsverlust entfernen; keine TP und kein Ersatz fehlender Substanz. |
| R11 Brandhaut erneuern | III / 6 | A; Berührung | **2W6 statt 2W8** und eine örtliche nichtmagische Hautverletzung versorgen. Feuer oder Säure vorher beseitigen. Keine Resistenz oder Entfernung aktiver Brandmagie. |
| R12 Organnaht | IV / 7 | A + R; Berührung | Zehn Minuten Ritual: ein vorhandenes beschädigtes Organ reparieren; **2W6 statt 4W8** begleitende Heilung. Organersatz und fortwirkende Krankheit ausgeschlossen. |
| R13 Gewebebrücke | V / 9 | A + S; Berührung | Zehn Minuten Ritual: genau ein erhaltenes ursprüngliches Glied wieder anfügen, **2W6 statt 3W8** heilen. Keine Spenderglieder; Eignung des Gewebes vor Beginn feststellen. |
| R14 Sprossendes Glied | VII / 12 | A + S + B; Berührung | Eine Stunde Ritual: ein ursprüngliches fehlendes Glied nachbilden, **3W6 statt 4W8** heilen. Kein Kopf, keine neue Körperform und keine Verjüngung. |
| R15 Wiederkehr der Sinne | VI / 11 | A + S; Berührung | Zehn Minuten Ritual: ein beschädigtes oder fehlendes Sinnesorgan bis zur früheren Funktion wiederherstellen. Keine TP, verbesserte Wahrnehmung oder Aufhebung von Illusionen. |
| R16 Leibliche Vollendung | VIII / 13 | A + S + B; Berührung | Eine Stunde Ritual: bis zu drei ausdrücklich benannte körperliche Defekte nach den Grenzen R10/R12–R15 reparieren, **25 statt 50 TP** heilen. Keine universelle Reinigung oder Überwindung des Todes. |

Die eigentliche Leistung der hohen Rituale ist die dauerhafte Funktionswiederherstellung. Ihre TP-Beigaben dürfen nicht das Hauptargument gegenüber einer vollständigen Rast sein. Regeneration ersetzt auch keine anatomischen oder stofflichen Voraussetzungen der konkreten Vorlage.

### III. Entgiftung und Zustandsbehandlung – R17 bis R24

| ID / Zauber | Grad / Mana | Aktionen; Reichweite | Geplante Wirkung und Entscheidung |
| --- | --- | --- | --- |
| R17 Bitterer Aufschub | I / 3 | A + R; Berührung | Genau ein gewöhnliches Gift für **zwei statt drei folgende Zielbeiträge** unterdrücken, höchstens zehn erzählerische Minuten; Konzentration. Natürliche Restdauer läuft weiter, ausgefallene Pulse verfallen. Neue Dosen bleiben wirksam. |
| R18 Gift ausleiten | II / 4 | A; Berührung | Eine behandelbare gewöhnliche Giftinstanz mit ihren aktiven Folgen beenden. Bereits verlorene TP bleiben verloren; magische Gifte und besondere Toxine sind keine pauschal zulässigen Ziele. |
| R19 Fieberbann | II / 4 | A; Berührung | Zehn Minuten Ritual: eine bekannte gewöhnliche Krankheit behandeln. Keine Immunität oder Reparatur ihrer bleibenden Schäden. Arkanistenfieber ausdrücklich ausgeschlossen. |
| R20 Keimruhe | I / 3 | A + R; Berührung | Fortschritt einer bekannten gewöhnlichen Krankheit sechs erzählerische Stunden pausieren. Bestehende Nachteile und Ansteckung bleiben. Keine automatische Krankheitsuhr behaupten. |
| R21 Nerven lösen | III / 6 | A + R; Berührung | Eine körperlich verursachte nichtmagische Lähmung bei erhaltenem Gewebe beenden. Kein Fessel-, Fluch- oder Versteinerungsbann. Fortwirkendes Gift kann erneut lähmen. |
| R22 Klarer Blick | II / 4 | A + B; Berührung | Eine vorübergehende körperliche Seh- oder Hörstörung bei erhaltenem Organ beheben. Kein Durchschauen von Illusionen oder Entfernen magischer Dunkelheit. |
| R23 Reinigender Quell | IV / 7 | A + R + B; Berührung | 2W6 TP und bis zu zwei zulässige Instanzen aus Blutung, gewöhnlichem Gift/Krankheit oder vorübergehender körperlicher Sinnesstörung. Jede Auswahl einzeln prüfen. |
| R24 Panazee | VI / 11 | A + S; Berührung | **Feste 18 statt 30 TP**, bis zu drei zulässige Zustandsinstanzen wie R23, zusätzlich körperliche Lähmung. Kein Allheilmittel gegen besondere Seuchen, Flüche oder verlorene Glieder. |

„Vergiftet“, Giftschaden und eine konkrete Giftquelle sind drei verschiedene Dinge. Entsprechend darf eine Zustandsbehandlung nicht allein über den Schadensartnamen oder das sichtbare Zustandslabel entscheiden.

### IV. Erholung und Lebenskraft – R25 bis R32

| ID / Zauber | Grad / Mana | Aktionen; Reichweite | Geplante Wirkung und Entscheidung |
| --- | --- | --- | --- |
| R25 Schmerzlinderung | 0 / 2 | B; Berührung | Einen dokumentierten Schmerzmalus einer bestimmten Wurfart um höchstens 1 lindern, bis Ende des nächsten folgenden Zielbeitrags; Konzentration. Kein positiver Bonus über den gesunden Wert. |
| R26 Frischer Atem | I / 3 | A + R; Berührung | Einen dokumentierten Überanstrengungsmalus um höchstens 2 lindern, zwei folgende Zielbeiträge; Konzentration. Keine Bewegung, Aktionen, Mana, Atemluft oder Rast gewähren. |
| R27 Erwachen | **0 / 2** | B; 6 m | Von I auf 0 senken: gewöhnlichen Schlaf oder rein schlafbedingte Benommenheit beenden. Bei 0 TP, Koma, Narkosegift oder magischem Schlaf keine Wirkung. |
| R28 Kraft zurückführen | III / 6 | A + R; Berührung | Höchstens zwei dokumentiert verlorene Punkte eines körperlichen Attributs nach Ende der Ursache wiederherstellen. Nie über den früheren Wert; abgeleitete Werte konsistent neu berechnen, keine automatische TP-Auffüllung. |
| R29 Lebenskraft ordnen | IV / 7 | A + R + B; Berührung | Bis zu zehn dokumentiert verlorene Punkte des TP-Maximums wiederherstellen. Aktuelle TP bleiben unverändert. Keine freie Erhöhung eines selbst eingetragenen Maximums. |
| R30 Genesungsschlaf | **II / 4** | A + R; Berührung | **Zehn Minuten Vorbereitung und zwanzig Minuten Heilschlaf** statt zwei Stunden Schlaf auf III: einen dokumentierten gewöhnlichen Überanstrengungszustand behandeln. Unterbrechung beendet die Behandlung; keine Rast- oder Ressourcenbuchung. |
| R31 Geistige Sammlung | III / 6 | R + B; 9 m | Eine bereits erlaubte misslungene Rettung gegen Furcht oder Verwirrung einmal wiederholen; zweites Ergebnis gilt. **Allgemeine fremde Willensbeeinflussung aus der PDF-Wirkung streichen.** Keine zusätzliche Rettung gegen Beherrschung, Besessenheit oder Flüche. |
| R32 Tiefenrestitution | VII / 12 | A + S + R; Berührung | Zehn Minuten Ritual: bis zu vier verlorene Punkte auf höchstens zwei Attribute und bis zu zwanzig verlorene Maximal-TP reparieren. Nachgewiesene Ausgangswerte und beendete Ursachen vorausgesetzt; keine Erinnerungen, Stufen oder Ressourcen erzeugen. |

R30 bekommt eine tatsächliche Rolle zwischen sofortiger Linderung und einer einstündigen Rast. Ein Zustand, der bereits durch normale Ruhe verschwunden ist, wird nicht nochmals als zusätzlicher Heilerfolg gezählt. R31 unterstützt eine bestehende Rettungsmöglichkeit und wird kein allgemeiner Ersatz für Entzauberung oder Bezauberung.

### V. Lebenswahrung und heilendes Licht – R33 bis R40

| ID / Zauber | Grad / Mana | Aktionen; Reichweite | Geplante Wirkung und Entscheidung |
| --- | --- | --- | --- |
| R33 Lebenspolster | I / 3 | A + R; Berührung | 2W6 temporäre TP bis Ende des zweiten folgenden Zielbeitrags, Verbrauch oder langer Rast. Nur der höhere Vorrat; keine Heilung von 0 TP. Ablauf gehört zum tatsächlich übernommenen Vorrat. |
| R34 Standhafter Kreislauf | II / 4 | R; 9 m | +2 auf genau eine zugeordnete KON-Rettung gegen Gift, gewöhnliche Krankheit oder körperliche Lähmung. Kein Konzentrationsbonus und kein freier zweiter Rettungswurf. |
| R35 Reiner Blutstrom | III / 6 | A + R; Berührung | Giftresistenz für drei folgende Zielbeiträge, Konzentration. Nur den Gift-Schadensanteil nach bestehenden Abwehrregeln behandeln; kein Gift entfernen und keine doppelte Resistenz. |
| R36 Letzter Halt | **V / 9** | **A + S**; Berührung | Statt IV/A + R: einmal bei 1 TP verbleiben, wenn ein Schadensereignis sonst auf 0 reduzieren würde. Drei folgende Zielbeiträge, keine Konzentration; gemeinsame Tagesgrenze mit R37. |
| R37 Lebenswacht | **VI / 11** | A + S; Berührung | Statt V: einmal 4W8 heilen, nachdem ein späterer Schaden das lebende Ziel auf 0 TP bringt. Drei folgende Zielbeiträge; gemeinsame Tagesgrenze mit R36. Schaden, Zustände und Konzentrationsverlust bleiben bestehen. |
| R38 Licht der Genesung | **II / 4** | A + R; Berührung | Statt III mit maximal +6: die nächsten drei bezahlten Heilzauber ab I auf dieses Ziel geben **je +3**, höchstens +9 TP. **Keine Konzentration**, Ablauf nach drei folgenden Zielbeiträgen. Pro Zauberanwendung nur einmal, auch bei mehreren Pulsen. |
| R39 Narbenwacht | III / 6 | R + B; 6 m | Beibehalten: einen Angriff nach regulärer Abwehr um zusammen 2W8 körperlichen Schaden vermindern. Der Betrag gilt insgesamt für Hieb/Stich/Wucht und nicht erneut je Anteil. Keine anderen Schadensarten. |
| R40 Bewahrender Schlaf | **III / 6** | **A + R**; Berührung | Von V senken: eine Minute Ritual, vier Stunden Lebensruhe für ein noch lebendes Ziel bei 0 TP. Bestehende nichtmagische Blutungen und gewöhnliche Krankheiten pausieren; 0 TP bleiben 0. Kein allgemeiner Schadensschutz oder automatische Rast. |

R38 braucht einen besseren Gegenwert als im PDF: sechs Mana, Konzentration und drei weitere Heilzauber für höchstens sechs zusätzliche TP wären zu unattraktiv. Der neue begrenzte Vorbereitungszauber kann trotzdem weder Trankheilung noch temporäre TP verstärken und sich nicht selbst auslösen. Bei vollständig geheiltem Ziel gibt es keinen Bonus; die Begrenzung am Maximum gilt auch für den Zuschlag.

### VI. Gemeinschaft und Meisterkunst – R41 bis R46

| ID / Zauber | Grad / Mana | Aktionen; Reichweite | Geplante Wirkung und Entscheidung |
| --- | --- | --- | --- |
| R41 Geteilte Heilung | II / 4 | A; 6 m | Je 1W8 für bis zu zwei verschiedene Ziele. Ein Ziel darf nicht zweimal gewählt werden; aus einem ungenutzten zweiten Ziel entstehen keine zusätzlichen Würfel. |
| R42 Lebenskreis | **IV / 7** | A + R + B; Mittelpunkt 9 m | Von III auf IV: je 2W6 für bis zu drei ausgewählte Ziele im Radius von 3 m. Die stärkere Vier-Ziel-Form wandert von V auf VI. |
| R43 Wanderndes Heillicht | IV / 7 | A + R; je Puls 9 m | **Drei Pulse zu 2W6 statt 2W8**: einer sofort, je einer in den beiden folgenden eigenen Gesamtbeiträgen gegen B. Konzentration; **Mana einmal beim Start**, keine gesonderten Folge-Manakosten. Nicht genutzte Pulse verfallen. |
| R44 Lazarettkreis | V / 9 | A + S; Radius 6 m um Wirker | Zehn Minuten Ritual für bis zu sechs vorher ausgewählte Patienten. Je **2W6 statt 4W8**, keine Zustandsreinigung. Kein Nutzen für später eintretende Patienten. |
| R45 Große Heilung | **VII / 12** | A + S; 12 m | **35 statt 50 feste TP**, von VI auf VII. Eigener lernbarer Zauber mit höheren Formen VIII/IX. Keine eingebauten Zusatzbehandlungen. |
| R46 Strom des Lebens | IX / 15 | A + S + R; Mittelpunkt 12 m | Zwei aufeinanderfolgende eigene Gesamtbeiträge, Konzentration während der Vorbereitung. Beim Abschluss **bis zu vier Ziele mit je 25 TP**, Radius 6 m, statt sechs Zielen mit je 40 TP. |

R43 ist ein im Voraus bezahlter begrenzter Heilvorrat, keine Folge kostenlos neu gewirkter Zauber. Alle drei Pulse zusammen ergeben maximal 6W6, Ø 21 TP. Für seinen Vorteil gegenüber Heilende Hand IV benötigt er zusätzlich zwei Bonusaktionen, Zeit und erhaltene Konzentration.

### VII. Sonstiges und Grenzkunst – R47 und R48

Dieser Bereich ist zunächst eingeklappt. Die beiden Einträge bleiben als kenntlich gemachte Konzeptplätze außerhalb der lernbaren Vorlagen, Trefferzahlen und Gradfreischaltungen.

| ID / Entwurf | Entscheidung | Was vor einer ausführbaren Karte fehlt |
| --- | --- | --- |
| R47 Rückruf des letzten Funkens | Zurückgestellt. Grad VII und zehn Minuten seit dem Tod sind Vorschläge des PDF, keine übernommene Aleria-Regel. | Abgrenzung von Tod zu 0 TP, zulässige körperliche Wiederbelebung durch gelehrte Magie, Seele/Identität, Zeitfenster, Material und verbleibende Todesursache. |
| R48 Vollständige Restitution | Zurückgestellt. Grad X, dreißig Tage und „Lebenskristalle“ werden nicht still als Weltregeln eingeführt. | Alle Grenzen von R47 sowie Körperneubildung, Seelenbindungen, Schutz vor Duplikaten, Altersgrenze und Materialverfügbarkeit. |

Das ist eine Empfehlung aus dem Welt- und Systemabgleich, keine aus dem PDF übernommene Genehmigungspflicht. Die übrigen 46 Zauber lassen sich unabhängig davon ausarbeiten. Normale Heilung eines noch Lebenden bei 0 TP bleibt möglich.

## 5. Höhere Formen ausdrücklich ausarbeiten

Zusätzlich zur Heilenden Hand I–VI, Großen Heilung VII–IX und den Gruppenformen aus Abschnitt 3:

| Zauber | Höhere Form | Mana / Aktionen | Änderung; übrige Grenzen bleiben |
| --- | --- | --- | --- |
| Lebensruf | II | 4 / A + B | 2W4 + 2 TP, weiterhin 12 m und ein Ziel. |
| Gift ausleiten | IV | 7 / A + R | Höchstens zwei ausgewählte zulässige Giftinstanzen desselben Ziels. |
| Fieberbann | IV | 7 / A + R | Dieselbe bekannte gewöhnliche Krankheit bei bis zu drei Zielen im Umkreis von 3 m; weiterhin zehn Minuten Ritual und zeitweilige Berührung jedes Patienten. |
| Klarer Blick | III | 6 / A + R | Je eine zulässige Seh- und Hörstörung desselben Ziels. |
| Schmerzlinderung | II | 4 / A + R | Einen konkreten Schmerzmalus um bis zu 2 lindern, zwei folgende Zielbeiträge; Konzentration. |
| Kraft zurückführen | V | 9 / A + R + B | Bis zu vier verlorene Punkte desselben körperlichen Attributs. |
| Lebenskraft ordnen | VI | 11 / A + S | Bis zu zwanzig verlorene Maximal-TP; weiterhin keine Auffüllung aktueller TP. |
| Lebenspolster | III | 6 / A + R | 4W6 temporäre TP; gleiche Zielzahl, Laufzeit und Ersetzungsregel. |
| Standhafter Kreislauf | IV | 7 / R + B | +4 statt +2 auf dieselbe zulässige KON-Rettung. |

Damit umfasst der Vorschlag **46 lernbare Grundzauber und 18 ausdrücklich beschriebene höhere Formen**. Jede Form ist ein vollständiger Datensatz für Wirkung, Zielgrenze, Reichweite, Dauer und Aktionspaket. Höhere Gradfreischaltung allein erlaubt keine selbst erfundene Kombination aus stärkerer Heilung und günstigerem Aktionspaket.

## 6. Zeit, Auslöser und technische Grenzen vor dem Einbau klären

### Beiträge und Pulse

R09 zählt **folgende Beiträge des Ziels**, R43 dagegen **folgende Beiträge des Zaubernden**. Der Entstehungsbeitrag zählt nicht als Folgebeitrag; mehrere Abschnitte desselben Posts zählen nur einmal. R09 pulst am Ende jedes berechtigten Zielbeitrags vor seinem abschließenden Ablauf. R43 wird im jeweiligen Folgebeitrag aktiv gegen B ausgelöst. Keine Nachbuchung übersprungener Pulse, keine Auslösung durch Betreten einer Fläche oder erneutes Laden der Seite.

Konzentrationsende entfernt die zugehörigen verbleibenden Wirkungen auch auf fremden Zielen. Die vorhandene Zustandsdauer und Konzentrationsverknüpfung sind dafür die Grundlage, aber noch kein Beleg für bereits implementierte Restitutionspulse.

### Reaktionen und Wachten

- R03/R34/R39 werden dem konkreten Ursprungsvorgang vor seiner endgültigen Bestätigung zugeordnet. R31 darf nach einem vorläufig misslungenen Wurf, aber ebenfalls vor endgültiger Bestätigung eingesetzt werden.
- R06 heilt nach dem Schaden innerhalb desselben aufgelösten Ablaufs. Trefferfolgen und erforderliche Konzentrationsprüfungen werden nicht zurückgenommen. Ungültiges oder nicht mehr lebendes Ziel darf keine Heilung erhalten.
- R36 wirkt vor dem endgültigen Absinken auf 0. R37 greift erst danach. Die Reihenfolge mit vorhandenen Klassenfähigkeiten wie Überlebens-/Berserkerregeln muss ausdrücklich getestet werden; verbraucht wird nur eine tatsächlich auslösende Schutzwirkung.
- R36/R37 kosten beim Auflegen, nicht ein zweites Mal beim Auslösen. Ihre gemeinsame Ziel-Tagesmarkierung und ihre Einmalladung müssen serverseitig nachgehalten werden, nicht nur im Browsertext.
- R38 zählt eindeutige Zauberanwendungen. Mehrere Würfel, mehrere Pulse und wiederholtes Abspielen desselben Ergebnisses erzeugen keinen weiteren Zuschlag für dieselbe Anwendung. Bonusheilung löst sich nicht selbst erneut aus.

### Rituale und dauerhafte Reparaturen

Ritualzeit und Aktionspaket sind verschiedene Angaben. Standardvorschlag: erfolgreicher Abschluss nach ununterbrochener Zeit bucht das volle Paket einmal; Voraussetzungen und Verfügbarkeit zu Beginn prüfen und beim Abschluss erneut validieren. Unterbrechung vor Abschluss erzeugt keine Wirkung. Reservierungen werden über den gemeinsamen Ablauf freigegeben, keine eigenen Rückerstattungsregeln erfinden. R30 ist die ausdrücklich bezeichnete Ausnahme: Zahlung beim Beginn des eigentlichen Heilschlafs, nach der Vorbereitung; Abbruch des Schlafs erstattet nichts.

R46 verwendet die bestehende angekündigte Kanalisierung: erster eigener Beitrag Vorbereitung ohne Heilung; zweiter eigener Beitrag bezahlter Abschluss. Derselbe Post mit zwei Abschnitten genügt nicht. Vorbereitung bindet Konzentration und lässt sich nicht als sofortiger Zauber importieren.

Für Organe, Krankheiten und frühere Attributwerte existiert kein hinreichend vollständiges allgemeines Befundsystem. Diese Ergebnisse werden zunächst als klare Spielleitungsentscheidung mit genau benannter Folge geführt. Kein Zauber überschreibt aus seinem Beschreibungstext heraus dauerhaft die Grundwerte eines Charakterbogens. Verbrauchsmaterial aus dem PDF ist erst dann eine echte Inventarbuchung, wenn ein passender vorhandener Gegenstand zugeordnet wurde; „Lebenskristalle“ bleiben Konzept.

## 7. Umsetzung in der bestehenden Architektur

### Gemeinsamer Katalog und kompatible Daten

1. **Schulmetadaten kapseln:** Titel, Pfad, Icon, Abschnitte, Rollen und Farbakzente gehören zur jeweiligen Katalogdefinition. Das derzeit globale Elemente-Abschnittsarray und die Auswahl nach Revision 1/2 dürfen nicht als Restitutionsfilter weiterverwendet werden. Revisionen gelten je Katalog; Restitution beginnt bei Fassung 1, ohne dadurch zur historischen Elemente-Fassung zu werden.
2. **Daten getrennt nach Behandlungsbereich:** beispielsweise `modules/spell-catalog/restitution-v1/` mit sechs Inhaltsmodulen und einem kleinen Export. Stabile IDs wie `restitution-heilende-hand`; R01 bleibt die Quellenreferenz. Keine neue zentrale Monsterdatei und keine Kopie der gesamten Elemente-Logik.
3. **Typisierte Wirkungen durchgängig unterstützen:** `healing`, `temporary-hit-points`, gezieltes `remove-condition`, Schutz/Trigger und `narrative` aus dem bestehenden Kampfeffektmodell verwenden. Der heutige `createCatalogSpell` erzeugt hauptsächlich `damage` aus `form.damage`; die Erweiterung muss explizite Heileffekte und vollständige höhere Formen transportieren. Heilen ist kein negativer Schaden und bekommt kein Angriffskriterium `on: hit`.
4. **Gemeinsame Anzeige:** Formel, Festwert, Mittelwert, Überheilung, Zielzahl und Wirkungsart aus denselben Effektdaten ableiten. `rollFormula`/`damageType` nicht zum alleinigen Träger von Heilung machen. Heilung und temporäre TP müssen in Vorschau, Liste und Sprechblase richtig benannt werden.
5. **Gezielte Zustandsbehandlung:** vorhandene Instanz-IDs nutzen und Ursache/Zulässigkeit ergänzen, wo sie fehlen. Die aktuelle Entfernung anhand von Tags kann mehrere Zustände zugleich treffen; das reicht für „genau ein Gift“ nicht. Zusammengehörige Giftfolgen benötigen eine nachvollziehbare gemeinsame Quelle. Fehlende Ursachendaten verlangen eine sichtbare manuelle Auswahl, keine erratene Löschung.
6. **Begrenzte Folgeeffekte:** Pulszahl, Ladungen, Quelle, Ziel, gewählter Wirkungsgrad, Uhrbesitzer, Auslösephase und bezahlte Aktivierung gehören zu einer Effektinstanz. Vorhandene Zustands-, Konzentrations- und Triggerverwaltung gezielt erweitern; kein zweites Kampfsystem nur für Restitution bauen.

### Archiv, Charakterbögen und Historie

- Gemeinsame Vorlagen erscheinen unter Restitution im bestehenden Archiv. Lernen erzeugt eine eigene Instanz mit stabiler `{id, revision}`-Katalogreferenz; höhere Formen behalten die festgelegten Kosten.
- Vor einer Migration vorhandene Heilzauber und deren Benutzer inventarisieren. Lokale Dateien sind kein vollständiger Nachweis des aktuellen Firebase-Bestands. Keine Umbenennung oder Ersetzung allein aufgrund eines gleich klingenden Namens und keine Annahme, dass es keine bestehenden Nutzer gibt.
- Bereits gelernte eigene oder veraltete Heilzauber bleiben funktionsfähig. Ein Wechsel zur neuen Vorlage ist eine ausdrückliche Aktualisierung mit Vorher/Nachher-Ansicht. Bisherige Wirkungsfassungen und Szenenergebnisse bleiben nachvollziehbar; die gemeinsame aktuelle Manastaffel gilt weiterhin.
- Die heute verwendeten speziellen Druiden-, Gebets-, Pakt- und Klassenregeln werden nicht in die gelehrte Standardschule umgedeutet. Alternative Bezahlung folgt dem tatsächlichen Profil; sie hebt weder Zielgrenzen noch Tagesladungen, Material oder Ritualzeit auf.
- Browser, serverseitige Bestätigung, Wiederholung gespeicherter Szenen, Export/Import und Listen müssen die gleichen Effekte verstehen. Generierte Servermodule über den vorhandenen Synchronisationsschritt aktualisieren, nicht von Hand doppelt pflegen.

### Seite und Gestaltung

- Neue Seite: `Magie/restitution/index.html`; sichtbarer Link aus der vorhandenen Restitutionskarte auf der Magieseite und Rücklink zur Schule. Der Almanach erreicht die Liste über seine Magie-Verknüpfung und über den Katalog im Archiv.
- Bestehendes aufklappbares Zauberverzeichnis als gemeinsame Vorlage verallgemeinern. Pergament, ruhige goldene Linien und das vorhandene Restitutions-Schulicon; dezente helle Grün-/Goldakzente für Heilung.
- Sechs Inhaltssektionen plus eingeklapptes **Sonstiges & Grenzkunst**. Suche und Filter nach Grundgrad, Behandlung, sofort/reaktiv/Ritual und Konzentration. Leere Grenzplätze sind keine lernbaren Suchtreffer.
- Eingeklappte Karte: Name, Grad, Mana, kurze Wirkungsangabe. Aufgeklappt: bestehende Aktionsicons, Heilung/Schutz/Zustand, Reichweite und Zielzahl, Dauer, Auslöser, Konzentration, Grenzen und höhere Formen. Keine langen Artikel vor den eigentlichen Zaubern.
- Arkane Schrift nur als `aria-hidden`-Dekoration. Überschriften, Regeln und Zahlen bleiben in der gut lesbaren bestehenden Schrift. Fehlende Zaubericons behalten einen leeren Platz ohne kaputtes Bild.

### Vorhandene Icon-Kandidaten

Die folgenden Dateien wurden im lokalen Baldurs-Gate-Ordner gefunden. Das sind Zuordnungskandidaten anhand der Motive; vor dem Einbau noch visuell prüfen. Keine neuen Icons in dieser Planungsphase generieren.

| Verwendung | Datei unter `IconOrdner/Zauber Icons/Baldurs Gate/` |
| --- | --- |
| Heilende Hand | `Spell Icons/Cure_Wounds_Unfaded_Icon.webp` |
| Lebensruf | `Spell Icons/Healing_Word_Unfaded_Icon.webp` |
| Große Heilung | `Spell Icons/Heal_Unfaded_Icon.webp` |
| Gezielte / große Wiederherstellung | `Spell Icons/Lesser_Restoration_Unfaded_Icon.webp`, `Spell Icons/Greater_Restoration_Unfaded_Icon.webp` |
| Heilkreis | `Spell Icons/Mass_Cure_Wounds_Unfaded_Icon.webp` |
| Lazarettkreis | `Spell Icons/Prayer_of_Healing_Unfaded_Icon.webp` – nur Bildmotiv, keine Umdeutung zum Gebet |
| Giftabwehr | `Spell Icons/Protection_from_Poison_Unfaded_Icon.webp` |
| Lebenspolster | `Spell Icons/Aid_Unfaded_Icon.webp` |
| Letzter Halt | `Spell Icons/Death_Ward_Unfaded_Icon.webp` |
| Licht der Genesung | `Spell Icons/Beacon_of_Hope_Unfaded_Icon.webp` |
| Heilwürfel | `Würfel Icons/D4_Healing.png`, `D6_Healing.png`, `D8_Healing.png` |

Aktionsökonomie und Reichweite weiterhin aus den bestehenden gemeinsamen Icon-Funktionen beziehen. Unklare Motive für Organe, Gliedrekonstruktion und Befunde zunächst leer lassen. Ein passendes Dateinamenswort allein ist kein ausreichender Grund, dasselbe Bild unterschiedslos auf zahlreiche Karten zu setzen.

## 8. Reihenfolge der späteren Umsetzung

1. Katalogauswahl und Seitentemplate für mehrere Schulen vorbereiten, ohne die bisherigen Elemente-Fassungen zu verändern; vorhandene Schnittstellentests als Schutz verwenden.
2. Direkte Heilung, Festheilung, Mehrzielheilung und temporäre TP vom Katalog bis zum Server vollständig anschließen. Einen kleinen vertikalen Ausschnitt mit Heilende Hand, Lebensruf, Geteilter Heilung und Lebenspolster durchspielen.
3. Zustandsauswahl und klar beschriebene manuelle Reparaturverfahren einbauen. Datenverlust oder massenhafte Zustandslöschung sind Ausschlusskriterien.
4. Nachheilung, reaktive Heilung, Einmalwachten und Zuschläge mit expliziten Instanzen anschließen. Erst nach funktionierendem Verbrauch und Wiederholschutz diese Karten als automatisiert ausweisen.
5. Die vollständigen 46 Grundzauber und 18 höheren Formen, passende Icons, Seite, Verlinkung und Archivfilter aus den gemeinsamen Daten erzeugen. Beide Grenzentwürfe bleiben getrennte Platzhalter.
6. Gezielte Tests und Mini-Spielprobe; Balancewerte danach anhand tatsächlicher Heilung und Aktionsverbrauch prüfen. Noch keine Veröffentlichung oder Push ohne neuen Auftrag.

## 9. Mini-Testplan und rechnerische Beispiele

Dies sind Sollwerte für die spätere Umsetzung, **keine Behauptung eines bereits ausgeführten Restitutions-Integrationstests**.

| Fall | Erwartetes Ergebnis |
| --- | --- |
| Heilende Hand I, Ziel 17/20 TP, vorgegebene Würfel 3 + 5 | Angebotene Heilung 8, tatsächliche Heilung 3, Ergebnis 20/20. Einmal 3 Mana und A verbraucht. Kein INT-Zuschlag und keine temporären TP. |
| Heilende Hand III mit 4W6, danach Lebensruf I im selben Post | A + R sowie B verbraucht; insgesamt 9 Mana. Durchschnittlich 14 + 3,5 = 17,5 angebotene TP. Ein weiterer Abschnitt erneuert keine Ressource. |
| Wundverschluss auf 0 TP | Ungültiges Ziel für diese Karte: keine Heilung und kein abgeschlossener Ressourcenverbrauch. Lebensruf auf ein bestätigtes lebendes Ziel bei 0 TP bleibt zulässig; vorhandene andere Zustände bleiben. |
| Geteilte Heilung II, Ziel A 5/20 und Ziel B 19/20, Würfel 6 und 7 | A erhält 6, B erhält 1 TP: insgesamt 7 tatsächliche Heilung. Kosten einmal 4 Mana/A. Zweimal dieselbe Ziel-ID wird abgewiesen. |
| Lebenspolster bietet 7, vorhanden sind 10 temporäre TP | Vorrat bleibt 10; keine Addition und keine Übernahme einer fremden Ablaufzeit. Beim späteren Auslaufen einer verdrängten Quelle keinen neueren Vorrat löschen. |
| Gift ausleiten bei zwei Giften und einer magischen Blindheit | Nur die ausdrücklich gewählte zulässige Giftquelle und ihre zugeordneten Folgen entfernen. Zweites Gift, Blindheit, verlorene TP und unabhängige Zustände bleiben. |
| Auffangender Impuls nach Schaden auf 0 TP, Ziel lebt | Schaden und zugehörige Folgen zuerst; danach genau ein Heilwurf. Keine zurückgegebene Konzentration oder neue Aktion. Erneute Bestätigung desselben Ereignisses bucht nichts doppelt. |
| Nachheilender Faden bei mehreren Abschnitten desselben Zielposts | Genau ein fälliger Puls. Bei Konzentrationsabbruch keine Folgepulse; bei 0 TP verfällt der Puls. Erneutes Abspielen der Szene erzeugt keine zusätzliche Heilung. |
| Wanderndes Heillicht über drei eigene Beiträge | Höchstens drei Pulse, zusammen 6W6, Ø 21; einmal 7 Mana, A + R beim Start, B in jedem der beiden Folgebeiträge. Kein vierter Puls oder Nachholen eines ausgelassenen Pulses. |
| Licht der Genesung trifft ein Heillicht mit drei Pulsen | Höchstens einmal +3 für diese Zauberanwendung. Keine Bonusschleife durch ein eigenes `on-heal`-Ereignis; Gesamtvorrat höchstens drei Ladungen/+9. |
| Letzter Halt/Lebenswacht, zweiter Wirker oder erneuter Login | Gemeinsame Tagesmarkierung bleibt bestehen. Nur eine Wacht pro Ziel; keine neue Ladung durch Kopieren, Aktualisieren oder Wechsel des Zaubernden. |
| Lebenskraft ordnen: aktueller Zustand 8/20, dokumentiert früher 30 Maximum | Ergebnis 8/30, keine Heilung auf 18/30 oder 30/30; Ursache und frühere Grenze müssen belegbar sein. |
| Genesungsschlaf / Lazarettkreis | Erzählte Zeit allein erzeugt keinen Rast-Event. Unterbrechung und einmaliger Abschluss werden berücksichtigt; Tagesressourcen regenerieren dadurch nicht. |
| Historischer eigener Heilzauber und Elemente-Fassung 1 | Bleiben lesbar und ausführbar; Restitution-Fassung 1 darf weder Auswahl noch Wirkung überschreiben. Mana bleibt zentral und wird nicht nochmals um 15 % erhöht. |

Bei der Mini-Spielprobe anschließend drei Rollen prüfen: einzelner verwundeter Frontkämpfer, drei unterschiedlich stark verletzte Verbündete und ein vergiftetes Ziel mit zusätzlichen unabhängigen Zuständen. Tatsächlich wiederhergestellte TP, Rückkehr aus 0 TP, verbleibendes Mana, verbrauchte Aktionen und erforderliche Spielleitungsentscheidungen erfassen. Erst diese Messwerte rechtfertigen weitere Balanceänderungen.

## 10. Lokal geprüfte Bezugspunkte

- Quelle: PDF, insbesondere Grundannahmen S. 3–9, Karten S. 10–57, Belastungsproben S. 58 und Grenzfragen S. 59. Die Bibliografie des PDF dient hier nicht als zusätzliche Regelquelle.
- `AGENTS.md`: aktuelle Mana- und Aktionsregeln.
- `AleriaAlmanach/modules/combat/combat-resource-progression.js`: zentrale Manastaffel.
- `AleriaAlmanach/modules/combat/combat-effect-model.js` und `combat-resolution-service.js`: Heilung, temporäre TP und Zustandsentfernung.
- `AleriaAlmanach/modules/combat/combat-condition-duration.js`, `combat-condition-lifecycle.js`, `combat-trigger-rules.js`: vorhandene Laufzeit-, Konzentrations- und Auslöserbausteine.
- `AleriaAlmanach/modules/scene-rest/scene-rest-model.js`: Rastzeiten und vollständige TP-Erholung.
- `AleriaAlmanach/modules/spell-catalog/spell-catalog.js`: Versionierung, aktuelle Kataloggrenzen und Charakterkopien.
- `AleriaAlmanach/modules/spell-catalog/elemente-v2/`: aktueller Balancevergleich, nicht die alte Elementarismus-Fassung.
- `Magie/modules/spell-list/spell-list-template.mjs`: wiederzuverwendende Darstellung und noch schulgebundene Annahmen.
- `Magie/index.html`: bestehende Schulbeschreibung und Restitutionsicon.
- `AleriaAlmanach/data/sections.js`, Abschnitt `arkanistenfieber`: Grenze der gewöhnlichen Krankheitsheilung.

Der Arbeitsbaum enthält gleichzeitig andere laufende Änderungen. Die Bestandsanalyse bezieht sich auf den lokal gelesenen Stand; sie ersetzt keine Prüfung des später fertiggestellten Gesamtstands oder der produktiven Charakterdaten.
