# Ylvas persönliche Waffentechniken – 14. Oktober 2026

Freigegeben sind zehn zusätzliche persönliche Techniken für Ylva
(`bSYZYAEOwiRgy44f6OmO`). Sie gehören keiner Klasse an. Sax und Handaxt
teilen dieselben drei neuen Technik-IDs. Vergabe und Textabgleich ändern nur
`combatProfile.techniques`; TP, Ressourcen, Zustände, Besitz und alte Würfe bleiben erhalten.

Die folgende Tabelle verwendet Ylvas aktuelle Stufe 7 und Dornwacht einhändig.
Waffenbasierte Techniken berücksichtigen andere zulässige Griffe und spätere Ausbildung
über die gemeinsame Schadenslogik. Die ausdrücklich festgelegte Dreierfolge behält ihre Würfel.

| Technik | Kosten | Schaden bei Treffer | Zusatzwirkung |
| --- | --- | --- | --- |
| Streifender Dorn | Bonusaktion | 1W4+2 | −2 eigener Trefferwurf; bei Treffer einmal −1 auf nächsten gegnerischen Waffen-/Technikangriff |
| Kurzer Jagdstoß | Bonusaktion | 1W4+2 | keine |
| Schaftfang und Stoß | Bonusaktion + Reaktion | 1W8+1W4+5 | Nach Treffer KRF SG 14 oder einmal −2 auf nächsten Waffen-/Technikangriff |
| Brechender Dorn | Bonusaktion + Reaktion + Besondere Aktion | 2W8+1W4+5 | Nach Treffer KRF SG 14 oder Entwaffnung; Körperwaffen stattdessen −1 Angriff bis Ende nächsten eigenen Beitrags |
| Zwei Dornen | Aktion + Reaktion | zweimal 1W8+5 | Eigener Trefferwurf je Angriff; Fortsetzung auch nach Fehlschlag; kein Ausbildungswürfel |
| Niederhaltender Stoß | Aktion + Bonusaktion | 1W8+1W4+5 | Nach Treffer KRF SG 14 oder Reaktion bis Ende nächsten eigenen Beitrags gesperrt |
| Kurzer Schneidenzug | Bonusaktion | Sax und Handaxt: 1W4 | keine |
| Rückschnitt | Reaktion | Sax 1W8+1W4+1; Handaxt 1W6+1W4+1 | Eigenständiger Angriff |
| Wolfsgriff | Bonusaktion + Reaktion + Besondere Aktion | Sax 2W8+1W4+1; Handaxt 2W6+1W4+1 | Nach Treffer KRF SG 12 oder Reaktion bis Ende nächsten eigenen Beitrags gesperrt |
| Drei Dornen, ein Sturz | Bonusaktion + Aktion + Reaktion | 1W4 → 1W8 → 1W6+5 | Immer abschließend GES SG 18; Details unten |

Einmalige Angriffsmali teilen eine Zustandsgruppe, verbrauchen sich auch bei einem
Fehlschlag und verfallen spätestens am Ende des nächsten eigenen Beitrags.

## Dreierfolge

Drei unabhängige Trefferwürfe, auch bei Fehlschlägen. Nur der letzte Schlag trägt den
vollen Schadensbonus. Keine Ausbildungswürfel und keine zusätzlichen Bonuswürfel;
kritische Treffer und Rüstung werden je Treffer nach den gemeinsamen Regeln abgewickelt.
Der Rettungswurf erfolgt **immer nach der gesamten Folge**, ausdrücklich auch nach drei Fehlschlägen.

Bei misslungener GES-Rettung gegen SG 18:

- Das Ziel wird zu Boden gefegt und hat bis zum **Beginn seines nächsten eigenen Beitrags** keine Reaktion.
- Ylva erhält ausschließlich gegen dieses Ziel Vorteil bis zum **Ende ihres nächsten eigenen Beitrags**.
- Der Vorteil beginnt nach der Folge. Er verändert keinen bereits gewürfelten Angriff.
- Dieser persönliche Feger entzieht keine zusätzliche Bonusaktion und verwendet deshalb nicht den allgemeinen Zustand „Liegend“.

Der Nutzer hat die genaue Dauer zur sinnvollen Ausgestaltung freigegeben. Der Vorteil
bleibt durch Ylvas nächsten Beitrag nutzbar, weil die Dreierfolge sämtliche regulären
Aktionsressourcen einschließlich Reaktion verbraucht.

## Gemeinsame Mechanik und Anzeige

- `followUpAttack.steps` beschreibt abweichende Würfel je Folgeangriff; bestehende gleichartige Folgen bleiben kompatibel.
- `secondarySave.timing: after-sequence` mit `requiresHit: false` bildet den ausdrücklichen Rettungswurf ab.
- Der Vorteil bindet `requiredTargetId` an die tatsächliche Ziel-ID.
- `durationModel.expiresAt: actor-start` gilt für die kurze Reaktionssperre. Reguläre eigene Beitragsdauern enden weiterhin nach dem ganzen Beitrag.
- `combat-contribution-start.js` erneuert nur Ressourcen beteiligter Figuren. Gegner, Zuschauer und Begleiterbeiträge füllen fremde Ressourcen nicht mehr auf. Browser, Inventarbedienung, Server und Szenenreplay teilen diese Regel.
- Listen, Charakterbogen, Miniansicht und Beitragsfenster lesen das gemeinsame Arsenal. Der Beitragsdialog zeigt die drei Schadensformeln; der Ergebnisbeleg dokumentiert drei Trefferwürfe und anschließend die Rettung.
- Der Gameplay Guide enthält 45 Arsenaleinträge und elf geprüfte Kombinationen; die Vorschau zeigt die Folgeschläge einzeln.

## Prüfung und Veröffentlichung

Deterministische Tests decken gemischte Treffer/Fehlschläge, drei Fehlschläge,
kritische Treffer, beide Speergriffe, beide Nebenwaffen, zielgebundenen Vorteil,
unterschiedliche Ablaufgrenzen, Ressourcenverbrauch, fehlende Rettungsbelege und
autorisiertes Speichern in einem laufenden Duell ab. Bestehende Asgeir- und
Fallender-Dorn-Folgen bleiben geprüft.

Reihenfolge: generierte Servermechanik veröffentlichen, Browserstand veröffentlichen,
anschließend Ylvas Online-Arsenal mit `updateTime`-Vorbedingung freischalten. Bereits
geöffnete Seiten müssen neu geladen werden. Historische Beiträge werden weder neu
ausgewürfelt noch überschrieben.
