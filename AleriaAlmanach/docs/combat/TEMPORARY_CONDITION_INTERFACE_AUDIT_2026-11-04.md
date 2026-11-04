# Temporäre Zustände und Beitragssperren: Interfaceprüfung

Prüfung vom 4. November 2026. Die Änderungen betreffen lokale Ansichten und
Bedienwege. Keine Onlineprofile, laufenden Ressourcen, Inventare oder alten
Würfelbelege wurden verändert.

## Gefundene und geschlossene Lücken

| Fläche | Vorher und geprüfte Korrektur |
| --- | --- |
| Szenenarsenal | Zustandsblockade, 0 TP, Ressourcenmangel und verbrauchte Fähigkeit erschienen pauschal als „Derzeit nicht verfügbar“. Eine gemeinsame schreibfreie Projektion verwendet nun die echten Actor-, Fähigkeitsnutzungs- und Kostenvalidatoren und zeigt den konkreten Grund. |
| Bezahlalternativen im Arsenal | Ein leeres reguläres Kostenpaket konnte eine mit Aura oder Manaersatz zulässige Handlung falsch als nicht verfügbar erscheinen lassen. Die Anzeige prüft sämtliche erlaubten vollständigen Pakete und benennt die verfügbare Alternative. Der ausdrückliche Spielleiter-Kostenmodus bleibt von Handlungsfähigkeit und begrenzten Nutzungen getrennt. |
| Kampfcomposer | Ein blockierter gewählter Angriff erklärte bisher nur die Sperre. Ist „Abwarten / Zug aussetzen“ regeltechnisch zulässig, steht jetzt eine direkte Schaltfläche bereit. Sie verwendet denselben delegierten Aktionswechsel wie die normale Auswahl. Die Kosten-Vormerkung ist anschließend bedienbar. |
| Freiwillige Fertigkeits-/Attributsprobe | Die neue gemeinsame Sperrpolicy wird bereits vor dem Abschicken angezeigt. „Ohne Probe schildern“ wechselt über den bestehenden Modusschalter auf einen Abschnitt ohne Probe. Rettungswürfe bleiben gemäß Engine zulässig. Ein bereits gespeicherter Beleg wird nicht neu ausgewertet. |
| Manuelle Zustandsvorschau | Normale Presets wurden als rohe Vorlage angezeigt, unabhängig von gewählter Dauer und Eingaben; eine temporäre Wirkung konnte dadurch „Aus dem Charakterbogen“ zeigen. Vorschau und Absendung lesen jetzt exakt dieselben Felder und verwenden denselben Condition-Builder. Name, Dauerart, Anzahl, Quelle, Wurfart und Zahlen aktualisieren die Vorschau unmittelbar. |
| Zustandsdialog-Hilfe | Der alte Text bezeichnete Handlungssperren pauschal als bloßen Hinweis, obwohl Betäubt eine feste Sperre besitzt. Der neue Text trennt eingetragene Zahlen und feste Vorlagenregeln von zusätzlicher Freitextbeschreibung. |
| Zustandskarten | `conditionalMechanics` einmaliger Effekte fehlten in der Wirkungssicht. Nun werden diese Werte ausdrücklich als auslösergebunden angezeigt, einschließlich verbleibender Anwendungen. Periodischer Kritnachschaden, gesperrte vorbereitete Konter und das Zerbrechen einer entsprechend eingerichteten magischen Abwehr bei kritischem Treffer sind ebenfalls sichtbar. |
| Ablaufzeitpunkt | Ein am Beitragsbeginn endender Zustand sah wie ein bis zum Beitragsende wirksamer eigener Beitrag aus. Der Formatter benennt nun den Beitragsbeginn ausdrücklich; gewöhnliche Restdauern behalten ihre bisherigen Texte. |
| Stimme als Voraussetzung | Das explizite Enginefeld `requiresVoice` ist bei Fähigkeiten, Techniken und Zaubern im Detaileditor wählbar und in Aktionsdetails, Arsenal und Kreaturendossier sichtbar. Keine Zauberkategorie wird von der Ansicht pauschal als sprachpflichtig erfunden. |
| Kreaturendossier | Auch hier erscheinen konkrete Handlungsgründe und erlaubte Kostenalternativen. Gespeicherte Zustände zeigen dieselbe strukturierte Wirkungssicht wie die Szenenkarte. |
| Telefonbedienung | Die Ausweichschaltflächen besitzen eine ausreichende Höhe und lesbare Texte. Der geprüfte Composer hat bei 390 px keinen horizontalen Überlauf. |

## Beabsichtigte Grenzen und sinnvolle Sperrgründe

Eine gesperrte freiwillige Handlung bleibt gesperrt; die Ansicht löst weder einen
Zustand noch einen fehlenden Vorrat. Die Schaltflächen führen zu vorhandenen,
zulässigen Alternativen. Ein absichtlich vorgemerkter, aber ungültiger
Ausrüstungswechsel wird auch beim Abwarten nicht still verworfen. Der konkrete
Ausrüstungsfehler bleibt sichtbar und muss korrigiert werden.

Der vorhandene Leerbeitragschutz bleibt bestehen. Beim gewählten Abwarten wird
erläutert, dass eine kurze Beschreibung des Zustands genügt und keine bewusste
Handlung erfunden werden muss. Der Wechsel schreibt keinen Text in den Entwurf.

Ressourcenzahlen in der aktuellen Szenenkarte beschreiben den aktuellen Stand.
Die vorhandene Erläuterung weist weiterhin darauf hin, dass Aktion, Bonusaktion
und Reaktion beim nächsten regulären Beitrag erneuert werden. Der Composer
verwendet den für seinen Beitrag vorbereiteten Stand. Die Anzeige erfindet keine
zusätzliche Regeneration.

Schlafend besitzt nach dem fachlichen Abgleich eine ausdrückliche Sperre für
freiwillige Handlungen und Reaktionen; Abwarten und Rettungen bleiben möglich.
Auch alte Kopien mit expliziter `presetId` zeigen diesen Umfang, ohne dass die
Ansicht ihren gespeicherten Freitext oder Zahlen ersetzt. Aufweckbedingungen
werden weiterhin aus der Quelle bestimmt. Festgesetzt, Geblendet und andere
beschreibende Vorlagen bekommen keine weiteren Regeln allein durch ihren Namen.
Ihre tatsächlichen Einschränkungen folgen Quelle und strukturierten Daten.
Die fachliche Prüfung der Sperrgründe und des Lebenszyklus steht in den
begleitenden Berichten des gemeinsamen Checkups.

## Architektur und Überprüfung

`combat/ui/combat-action-availability.js` projiziert gemeinsame Validatoren und
Kostenpakete für lesende Ansichten. `skill-checks/skill-action-permission-view.js`
stellt die gemeinsame Handlungsentscheidung dar. Der kleine
`combat-status-dialog-model.js` liest dieselben Formwerte für Vorschau und
Absendung. Die Ansichten besitzen keine zweite Spielregelberechnung.

70 gezielte Node-Tests sind bestanden: neue Verfügbarkeits- und Formverträge,
sichere Texte, Einmaleffekte und Zeitpunkte sowie bestehende Status-, Trait-,
Aktions-, Composer- und Kreaturenprüfungen. Protokoll:
`diagnostics/condition-interface-tests.txt`.

Die reproduzierbare Browserprüfung
`tests/temporary-condition-interface.browser.mjs` prüft mit lokalen Testfiguren:

- blockierter Angriff mit verständlichem Grund und tatsächlich bedienbarem
  Abwartenwechsel;
- bedienbare Vormerkung des Wartens;
- blockierte freiwillige Probe mit Wechsel zu einer Beschreibung ohne Probe;
- weiterhin verfügbare Rettung;
- Zustandsvorschau nach Dauerart-/Anzahl-/Zahlenänderung;
- Stimmenvoraussetzung in allen drei Detaileditoren;
- unverändertes Quellprofil, Desktop und Telefon sowie blockierte externe
  Schreibzugriffe.

Frühere Testbedienungsfehler bleiben als Diagnosebilder erhalten: Ein
eingeklappter Bonusbereich musste für die Eingabe geöffnet werden; der lokale
Prüfrahmen musste vor dem Öffnen des echten Detaileditors ausgeblendet werden.
Beides war ein Aufbauproblem der Prüfung und wurde im reproduzierbaren Skript
korrigiert.

Aktueller bestandener Browserbeleg:
[Ergebnis](../../../.tmp/temporary-condition-interface-20261104/browser-1793750232395/report.json),
[Abwarten auf dem Telefon](../../../.tmp/temporary-condition-interface-20261104/browser-1793750232395/blocked-action-phone.png),
[Zustandsvorschau auf dem Telefon](../../../.tmp/temporary-condition-interface-20261104/browser-1793750232395/temporary-condition-preview-phone.png).
Die Prüfbilder wurden tatsächlich angesehen. Syntaxprüfung und gezielter
`git diff --check` sind bestanden.

## Abschlussnachprüfung: tatsächliche Ablenkungswahrscheinlichkeit

Eine magische Abwehr speichert ihre Prozentvorgabe, wertet aber mit einem W20
aus. Deshalb bedeutet beispielsweise eine eingetragene Chance von 67 % tatsächlich
W20 ≤ 13, also 65 %. Sehr kleine positive Werte ergeben mindestens 5 %; 98 % und
99 % ergeben W20 ≤ 20 und benötigen weiterhin den vorhandenen Würfelbeleg.
100 % wirkt wie bisher ohne Wurf. Diese bestehende Auswertung wurde nicht verändert.

`combat-ward-policy.js` projiziert nun gemeinsam für Resolver und Anzeige die
wirkliche Schwelle und Wahrscheinlichkeit. Zustandskarten zeigen sie einschließlich
abweichender Vorgabe; der Detaileditor erklärt bei bereits eingerichteter magischer
Abwehr die Rundung auf W20-Schritte. Ladungen und kritisches Zerbrechen bleiben
unabhängig davon sichtbar. Gespeicherte Vorgaben und historische Würfe bleiben erhalten.

49 gezielte Tests bestehen in `diagnostics/temporary-conditions-checkup-20261104/ward-tests.txt`.
Der neue Vertrag prüft für 0, 1, 2, 3, 47, 50, 67, 98, 99 und 100 % jeweils alle
20 Würfelergebnisse, Belegpflicht, Ladungsverbrauch und unveränderte Quellobjekte,
außerdem die sichtbare Wahrscheinlichkeit und den Vorrang kritischen Zerbrechens.
