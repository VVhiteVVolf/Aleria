# Gesamtkatalog und Kritschaden – 15. Oktober 2026

Lokale Überarbeitung; keine Veröffentlichung oder Änderung von Live-Daten durch diese Prüfung. Der archivierte Raumkarten-Prototyp bleibt ausgeklammert.

## Umfang

- Alle 816 Kampftechniken: 325 Drachentanz, 188 Wyrmtanz und 303 Huskarl-Waffenlehre, einschließlich derzeit gesperrter Entwürfe.
- 166 aktuelle Katalogzauber aus Elemente und Restitution sowie die 72 Einträge der unveränderlichen älteren Elemente-Edition.
- Insgesamt 538 vorhandene Gradfassungen mit ihren Aktions- und Manakosten.
- 238 archivierte Figuren und 61 Kreaturvorlagen durchsucht. 83 davon enthalten Kampfbögen: 725 gespeicherte Waffen-, Technik-, Fähigkeits- und Zaubereinträge; nach den bestehenden Ausbildungsabgleichen 727 aktuelle Projektionen.
- 53.322 Kombinationen aus Technik, freigeschalteter Stufe und Referenzwaffe (W4, W6, W8, W10, W12 und 2W6).

Die Einzelwerte stehen in [audit.json](audit.json). Die konkreten 88 Schadens- und 121 SG-Anpassungen gegenüber dem Stand vor dieser Überarbeitung stehen in [CHANGES.md](CHANGES.md) und [changes.json](changes.json). Die Prüfung lässt sich mit `node AleriaAlmanach/tools/audit-combat-balance.mjs --write` wiederholen.

## Kritische Treffer

Ein vollständiger normaler Schadenswürfelpool zählt mit seinen Maximalwerten; ein gleicher zusätzlicher Pool wird normal gewürfelt. Feste Boni gelten einmal.

| Normal | Neuer Krit | Minimum | Durchschnitt | Maximum |
| --- | --- | ---: | ---: | ---: |
| 1W8+3 | 8+1W8+3 | 12 | 15,5 | 19 |
| 2W6+4 | 12+2W6+4 | 18 | 23 | 28 |
| 1W10+1W4+2 | 14+1W10+1W4+2 | 18 | 24 | 30 |

Damit steigt die Verlässlichkeit, die bisherige maximale Schadensspitze bleibt unverändert. Die Tabelle enthält keine Rüstung oder Resistenz. Besondere feste Kritboni wie Drachenzahns zusätzliche +2 werden weiterhin einmal addiert.

Jede Angriffsinstanz prüft ihren Krit einzeln. Kein weiterer Maximalanteil für nichtkritische Folgetreffer. Angriffszauber verwenden dieselbe Regel; Rettungswurf-Zauber und automatische Wirkungen nicht. Heilung und Eigenschaden bleiben unabhängig. Nachschaden und die bestehenden W20-Krittabellen erhalten keine zusätzlichen Würfel.

Browser, Simulation und Server verwenden `buildDamageRollPlan`. Der Server berechnet den Maximalanteil selbst aus der vertrauenswürdigen Formel und prüft nur den tatsächlich gewürfelten zusätzlichen Pool. Eingereichte Summen oder angebliche Maximalanteile werden nicht übernommen. Neue Belege speichern `criticalDamage` Version 1, beispielsweise „8 gesetzt + 1W8 [1] + 3“. Historische Würfe werden weder migriert noch neu ausgewertet.

## Kontrolltechniken stärken und Zusatznutzen bezahlen

121 bisher abweichende Kontrolltechniken verwenden nun dieselbe Ausbildung wie die bereits angepassten Cenyr-Kontrollen. Insgesamt 137 direkte Kontrollrettungen folgen der gemeinsamen Regel:

- Normal: SG 10 + Attribut der tatsächlich verwendeten Waffe + Kompetenz.
- Mit Besonderer Aktion: Grundwert 11.
- Das Ziel rettet weiterhin mit dem ausdrücklich genannten Attribut; Waffenverzauberungen und Trefferboni erhöhen den SG nicht.
- Ausdrücklich feste persönliche SG und schon vorbereitete historische Konter behalten ihre Werte.

Geschicklichkeitswaffen und passende persönliche Ausbildung bleiben damit auch für Kontrollen brauchbar; hohe Ausbildung verbessert ältere Techniken weiter.

88 bisher kostenfreie kleine Stellungswirkungen bezahlen nun einen festen Schadenspunkt. Ursache war, dass Meter-Effekte nachträglich in wirksame einmalige Stellungszustände umgewandelt wurden, beim Schadensbudget aber noch als folgenlos galten. Ein einmaliges −1 auf den nächsten Angriff ist dabei deutlich schwächer als Entwaffnung, eine ganze Haltung oder eine länger wirkende Kontrolle und bezahlt deshalb keinen ganzen Zusatzwürfel. Stärkere Kontrollwirkungen bezahlen weiterhin den schwächsten zusätzlichen regulären Aktionspunkt. Gegnerische Debuffs werden ebenfalls erkannt. Eigene Nachteile zählen ausdrücklich nicht als zusätzlicher Nutzen. Die Waffenbasis bleibt erhalten; die betroffenen Techniken werden nicht zu schadenslosen Manövern.

Beispiel mit W8-Waffe: Eine reine Aktion-plus-Bonusaktion-Technik hat W8+W4. Kauft dieselbe Kombination einen kleinen einmaligen Stellungsnutzen, wird daraus W8+W4−1. Bei stärkerer Kontrolle bleibt W8. Zusätzliche Besondere Aktionen und Fokus bleiben separate Verstärkungen. Der feste Abzug zählt auch bei einem Krit nur einmal.

## Bewusst erhaltene Rollen und Grenzen

Reine Deckung, Vorbereitung, Heilung und Unterstützung bleiben schadenslos. Leichte Bonusangriffe behalten höchstens W4 je Grundwürfel, halbe positive feste Boni und keinen Ausbildungswürfel. Flächentechniken behalten ihre Zielgrenzen, fehlenden Ausbildungswürfel und gedeckelten gewöhnlichen Zusatzwürfel. Zweiwaffenangriffe verdoppeln keine festen Boni.

Persönliche Sonderfolgen wie Ylvas Dreierfolge bleiben ausdrückliche Ausnahmen. Ihr immer stattfindender SG-18-Feger wird nicht stillschweigend an einen Treffer gebunden. Teure Meistertechniken behalten ihre höheren Treffervorteile, weil sie fast alle regulären Ressourcen und mehrere begrenzte Punkte binden. Die neue Kritregel erhöht ihren möglichen Höchstschaden nicht.

Die unveränderlichen Zaubereditionen werden nicht überschrieben. Aktuelle Mana- und Aktionspakete bestehen den vollständigen Gradabgleich; es gibt keinen pauschalen Schadensaufschlag für Zauber. Die Manastaffel wird nicht erneut mit 1,15 multipliziert.

Erzählmerkmale und Utility ohne strukturierte Kampfwerte sind im Bericht unter `manualReview` aufgelistet. Ihr Situationsnutzen hängt vom konkreten Einsatz ab; dafür wird keine erfundene automatische Mechanik oder scheinexakte Schadenswertung eingesetzt. Numerische Budgetprüfungen ersetzen keine vollständigen Spieltests gegen jede mögliche Gruppenzusammenstellung.

## Einbindung

Die gemeinsamen Technik-Fabriken liefern Katalog, Ausbildungsabgleich, Charakterbogen, Arsenal, Minidarstellung und Beitragsauswahl. Der mechanische Resolver und die generierte Serverkopie verwenden denselben SG und dasselbe Schadensmodell. Die drei Klassenkataloge und die Gameplay Guides werden aus diesen Quellen neu gebaut. Schon gespeicherte Beiträge, Live-TP, Ressourcen, Zustände, Besitz und Online-IDs bleiben erhalten.
