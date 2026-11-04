# Attacken-, Ausbildungs- und Attributprüfung vom 3. November 2026

Die Prüfung verwendet ausschließlich lokale Quellen und lokale Testfiguren.
Onlineprofile, Inventare, Ressourcen und historische Kampfauswertungen wurden
nicht geändert. Die endgültige gemeinsame Browser-/Server-Projektion wird nach
Abschluss der parallel überarbeiteten Trait- und Würfelregeln zentral geprüft.

## Umfang und Ergebnisse

| Prüffläche | Umfang | Ergebnis |
| --- | --- | --- |
| Autorenkatalog | 985 eindeutige Techniken aus Drachentanz, Sirenentanz und Huskarl | Kennungen eindeutig; Kosten zum Freischaltlevel bezahlbar |
| Kaufkatalog | 1.028 Klassenangebote für 682 eindeutige bestätigte Techniken | Alle Angebote einzeln zum jeweiligen Mindestlevel erfolgreich gekauft |
| Entwurfsgrenze | 303 Huskarl-Techniken mit Entwurfsstatus | Keine wird durch den Kaufkatalog freigegeben |
| Preise und Belege | Alle 1.028 Angebote, eigene und fremde Hauptklasse | Fremdpreis entspricht dem konfigurierten Faktor; exakter ursprünglicher Kaufbeleg bleibt beim Wiederkauf erhalten |
| Mindestlevel | Alle Angebote oberhalb Stufe 1 | Kauf eine Stufe zu früh erzeugt weder Technik noch Kaufbeleg |
| Ausrüstung bei Fremdausbildung | Alle 1.028 Angebote mit fremder Hauptklasse und gültigem Quellenbeleg | Mindestens eine deklarierte legale Waffenführung vorhanden; echte Klassen-/Waffenpolicies angewandt |
| Schild, Reittier, zweite Hand | Sämtliche entsprechend markierten Kaufangebote | Fehlender Schild, fehlendes Reittier und ein gleichzeitig geführter Schild bei Zweihandtechniken sperren den Einsatz |
| Waffenschaden | 63.300 Kombinationen aus Technik, Stufe und Waffenbasis | Keine sinkenden Ausbildungswürfel, kein Verdoppeln fester Kritboni |
| Katalogzauber | 166 aktuelle und 72 archivierte Einträge mit insgesamt 538 Gradformen | Zentrale Manakosten und passende Kostenbelege |
| Gespeicherte öffentliche Daten | 266 Charaktereinträge, 85 Kreaturvorlagen; 115 vorhandene Kampfprofile | 824 gespeicherte beziehungsweise 827 aufgelöste Aktionen geprüft; Erzählmerkmale gesondert erkannt |
| Auswertungsvertrag | Gesamter 985er-Technikkatalog und sämtliche aktuellen Zaubergradformen | Treffer, Fehlschlag, Krit, Sekundärrettung, Verbrauch, Unterstützung und sichtbare Schadensvorschau stimmen überein |
| Curricula | Sieben Cenyr-Klassen auf mehreren Ausbildungsstufen, beide Derwyn-Grundausbildungen und vier Wyrmformen | Formzugang, Migration, Waffen- und Reitanforderungen stabil |
| Effektive Attribute | Vorhandene Tests zu aktuellen INT-Werten, freien Modifikatoren, Technik-SG und Waffenattributen | Sichtbare Formel, Durchschnitt, tatsächlicher Wurf und halbierter Rettungsschaden stimmen überein |
| Temporäre Attributwirkungen | Alle sechs Attribute, freier Modifikator, Obergrenzen, Waffen und drei Zauberattribute | Reproduzierte Lücken in Szenenwerten und KI-Projektion geschlossen |
| Benannte Zustandswirkungen | Regulärer Buff, echte Fertigkeitsprobe, Waffenbonus, kontextuelle Rettung und Kriss | Fehlende reguläre Zustandsquellen ergänzt; keine doppelte Substanzwirkung |
| KON bei Stufenempfehlung | Attributsbonus, Obergrenze, freier Modifikator und alter TP-Override | Empfehlung und tatsächlicher empfohlener Zuwachs verwenden wirksame KON |

## Neue Absicherung

`tests/combat-purchase-contract.test.mjs` ergänzt zwei vollständige
Katalogverträge. Die bestehenden Auswertungstests setzen für ihren Effektcheck
die Einsatzberechtigung gezielt auf gültig. Die neue Prüfung ergänzt deshalb
einen unabhängigen Kauf- und Anforderungscheck über jedes tatsächliche
Klassenangebot. Sie prüft mit fremder Hauptklasse und echtem Quellenbeleg und
schwächt dazu keine Produktionsanforderungen ab.

Die README des Entwicklungsmoduls nannte noch 193 freigegebene Techniken und
949 Entwürfe. Diese Zahlen waren veraltet. Sie nennt nun den geprüften Stand
und unterscheidet Klassenangebote von eindeutigen Technikkennungen. Mehrere
Angebote derselben gemeinsam gelehrten Technik erzeugen keine zusätzlichen
Käufe oder Attacken derselben Figur.

Ein zunächst vermuteter Zweihandfehler der Vennyr-Stabtechniken wurde mit einer
tatsächlichen aufgelösten Aktion widerlegt: Der heutige Katalog führt die
Zweihandanforderung sowohl in `cenyrTraining` als auch in `cultureTraining`.
Der Resolver erzwingt deshalb bereits den passenden Griff. Kein unbelegter
Produktionsfix wurde dafür eingeführt.

## Geschlossene Attribut- und Zustandslücken

`getSuggestedHitPointGain` las den gespeicherten KON-Grundwert. KON 10 mit einem
strukturierten Bonus von +4 empfahl beim W10-Trefferwürfel deshalb sechs statt
acht TP. Bei älteren Bögen mit festem Maximum wurde diese falsche Empfehlung
auch als tatsächlicher Stufenzuwachs verwendet. Die Empfehlung liest nun die
gemeinsame wirksame KON einschließlich Obergrenze und freiem Modifikator.

Das Szenenoverlay behandelte Attributsänderungen ausschließlich für Kraft.
Ein temporärer Bonus von +4 Geschick erhöhte bereits Rettungswürfe, aber weder
den tatsächlichen Bogenangriff noch RK oder Initiative. Die KI behielt außerdem
alte Werte der übrigen Attribute. `combat-state-attribute-effects.js` leitet
nun die Vorher-/Nachher-Differenz mit den gemeinsamen Attribut-, Waffen-, RK-,
Zauber-, Fertigkeits- und Rettungswurfregeln ab. Die schmale Integration im
State-Modell ersetzt die zuvor verstreute Sonderbehandlung für Kraft.

Die Integration berücksichtigt leichte Angriffe, Waffenführung körperlicher
Fähigkeiten, dynamische und feste sekundäre SG, feste Gesamt-RK- und Zauberwerte
sowie die stärkste Rüstungshaltung. Alle KI-Attribute, Obergrenzen, Waffenwerte,
Fertigkeitssummen, wirksamen Ausbildungsgrade, Rettungssummen und Glück-/Pechregeln
folgen der aktuellen Projektion. Aktuelle TP, gespeicherte Maximal-TP, Ressourcen,
Konzentration und Zustandsfristen bleiben durch ihre bestehenden Belege geführt;
das Lesen einer Attributwirkung heilt die Figur nicht.

`combat-personal-modifiers.js` las benannte Fertigkeits-, Waffen- und
kontextuelle Rettungsboni nur aus Zuständen mit Rauschmittel-Metadaten.
Normale Buffzustände konnten dadurch in der KI erscheinen, während eine echte
Fertigkeitsprobe ihren Bonus ignorierte. Nun werden alle aktiven, regelkonformen
Zustände erfasst; die Auswahlregeln für alternative Leiden und psychologische
Prägungen bleiben erhalten. Das Overlay verwendet dieselben Vorher-/Nachher-
Getter, statt diese Wirkung ein zweites Mal von Hand zu berechnen.

## Ausgeführte Prüfungen

- `node tools/audit-combat-balance.mjs`: bestanden, 63.300 Schadensproben.
- Erste Fachgruppe: 47 Tests zu globaler Waffenbalance, Technikbudgets,
  Waffenfamilien, Rhiannons INT-Schaden und Zauberaktionsökonomie bestanden.
- Zweite Fachgruppe: 30 Tests zu Klassenformularen, realen Auswertungsverträgen,
  Ressourcen und Technikdarstellung bestanden.
- Neue Kaufverträge: zwei Tests über alle 1.028 Angebote bestanden.

Damit sind in dieser abgegrenzten Prüffläche **79 Tests** bestanden. Die beiden
großen Katalogverträge enthalten jeweils viele Einzelkombinationen; die Zahl
der Testfälle ist nicht mit der Zahl der überprüften Attacken gleichzusetzen.

Für die anschließend gefundenen Statverbraucher-Lücken wurden zusätzlich zwei
TP- und sieben Szenenregressionen ergänzt und bestanden. Ein abschließender
gemeinsamer Lauf mit diesen neuen Verträgen, Kaufverträgen sowie den bestehenden
Kampf-, Rüstungs-, Zustands-, Gesundheits-, Ressourcen-, Readmodel- und
Fertigkeitsprüfungen ist vollständig mit Exit-Code 0 bestanden. Ausführung mit
`node --test --experimental-test-isolation=none`; diese Prüfläufe benötigen
keinen Browser und keine Datenbankverbindung.

## Grenzen der Aussage

Die Werteprüfung bestätigt regeltechnische Konsistenz, Einsatzbedingungen und
Budgetgrenzen. Sie ist kein Beweis für perfekte taktische Gleichwertigkeit
jeder Technik in jeder Kampfsituation. Insbesondere Reichweite, mehrere Ziele,
Kontrolle und Vorbereitung haben ihren Wert erst im jeweiligen Szenenkontext.
Es wurde deshalb keine bereits begründete Klassenidentität oder freigegebene
Aktionsökonomie durch eine pauschale Schadensangleichung ersetzt.

Die neue Glück-/Pechregel wurde zusätzlich unabhängig auf Verteilung,
Vorteil/Nachteil, einmalige Ersatzwürfe und validierte Serverbelege gelesen.
Die Verteilung eines Glückswürfels beträgt für die 1 genau 1/400, für die
übrigen Augen jeweils 21/400. Ein gefundener Grenzfall mit gleichzeitigem
kritischen Treffer und Fehlschlag bei extrem abgesenkter Kritschwelle 2/3
wurde zur zentralen Korrektur und Regression an die Hauptprüfung gemeldet.

## Ergänzung: Gameplay Guides am 4. November 2026

Auch die statischen Spielanleitungen wurden auf kopierte Traitwerte geprüft.
Gawains Redaktion führte Neugier noch mit +3/−2 und Eigensinn mit +2/−2.
`Gameplay Guide/modules/guide-trait-rules.mjs` bezieht nun Namen, Beschreibungen
und Mechanik aus `DEVELOPMENT_TRAITS` und `normalizeCombatTrait`. Die
Guide-Projektion verwendet die gemeinsame exakte Altstandrevision: Nur belegte,
unveränderte alte Katalogkopien erhalten die neue Regel. Instanzkennungen und
aktive Flags bleiben erhalten; persönliche Varianten einschließlich eigener
Katalogableitungen, Nichtkatalogmerkmale und Charakterquellen bleiben unverändert.

Die Guide- und Arsenalmodelle verwenden dieselbe aktuelle Projektion. Gawains
Nachforschungs-, GES-/CHA-Rettungs- und Überzeugen-Beispiele werden durch
`resolveSkillModifier` berechnet, einschließlich angelegter Ausrüstung. Damit
stimmen Redaktion, passive Vorschau und die tatsächlich gezeigte Probenformel
überein. Alle drei bestehenden Guides wurden über ihren vorhandenen Generator
neu gebaut. Die acht bestehenden Guidetests und vier neue Tests für
Katalogbindung, Quellenunveränderlichkeit, persönliche Varianten und Probenwerte
sind bestanden.

Diese rein lesende Guide-Aktualisierung ist kein Datenbank- oder
Biografieabgleich. Eine Übernahme neuer Katalogregeln in gespeicherte
Charakterbögen wird separat und ausdrücklich geprüft.
