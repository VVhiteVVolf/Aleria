# Kampfsystemprüfung: Gildas Gafyr gegen Gawain Draig

Stand: 5. September 2026. Prüfung und Änderungen im lokalen Arbeitsstand; keine Veröffentlichung auf Firebase.

## Versuchsaufbau

Temporäres lokales Szenenmodul mit Kopien aus `Charakter Archiv Exporte/gildas-gafyr.json` und `gawain-draig.json`. Verwendet wurden die produktiven Profilresolver, Kampfregeln, Szenenzustände, Charakterbögen, Sprechblasenrenderer, der Kampfeditor und dessen Submission-Controller. Testszene, Simulationsskripte und separates Browserprofil wurden anschließend entfernt. Die bestehenden Charakterdateien und produktiven Firebase-Charakterwerte wurden durch die Tests nicht verändert.

| Figur | Stufe | TP | RK | Geführte Waffe |
| --- | ---: | ---: | ---: | --- |
| Gildas Gafyr | 6 | 52 | 19 | Pflichtschwur |
| Gawain Draig | 5 | 39 | 16 | Drachenzahn |

Die Abschlussserie umfasst **153 Fälle** für sämtliche 17 Waffen-/Technikeinträge beider Profile, jeweils mit normalem Wurf, Vorteil und Nachteil sowie vorgegebenen W20-Ergebnissen 1, 12 und 20. Dazu kamen **100 vollständige Duelle** mit reproduzierbaren Würfelfolgen, Szenenfortschreibung, Technikverbrauch und Rückgriff auf die geführte Waffe bei erschöpften Kosten. Zusammen wurden **1.365 Auswertungen** geprüft; alle Duelle endeten innerhalb der Obergrenze von 120 Beiträgen.

Jede dieser Auswertungen wurde mit ihren Einzelwürfeln erneut durch `ProvidedDiceAdapter` und die generierten Serverregeln berechnet. Treffer, Schaden, TP, Ressourcen, Zustände und Folgeangriffe stimmten überein. Die Serie enthielt 110 kritische Treffer, 107 kritische Fehlschläge, 18 Folgeangriffe und 151 abgefangene Versuche mit unzureichenden Ressourcen. Diese deterministische Serie ist ein Funktionstest, keine statistische Balancingaussage.

## Behobene Fehler

1. **Zustände liefen in historischen Sprechblasen zu früh ab.** Beim Lesen eines einzelnen Abschnitts wurde bereits der Abschluss des gesamten Beitrags angewendet. Gawains Klauen-Abzug konnte dadurch innerhalb des betroffenen Beitrags fehlen. Die Rückrechnung stoppt jetzt vor dem Abschluss; Zustandsuhren, Rast und Kampfabschluss werden erst nach einem vollständig gelesenen Beitrag angewendet.
2. **Folgeangriffe umgingen Abwehrladungen.** Nach einem nicht abgelenkten Haupttreffer prüfte der Folgeangriff keine verbleibenden Spiegelbild-/Schutzladungen. Beide Angriffe verwenden nun dieselbe gekapselte Abwehrlogik. Ladungen werden fortgeschrieben; ein kritischer Folgeangriff kann einen dafür konfigurierten Schutz zerbrechen. Die Serverprüfung ordnet jeden Abwehrwurf seinem konkreten Angriff zu und weist fehlende Belege zurück.
3. **Aura-Modifikatoren fehlten bei Folgeangriffen.** Insbesondere ein gegnerischer Aura-Schadensabzug wurde nur beim Hauptangriff berücksichtigt. Die Folgeangriffe übernehmen nun ebenfalls Aura-Schaden und gegebenenfalls den magischen Angriffsmodifikator.
4. **Der Beleg des Folgeangriffs zeigte falsche Trefferwerte.** Nachträgliche Angriffsboni beeinflussten die Trefferentscheidung, fehlten aber in ausgewiesenem Modifikator und Gesamtergebnis. Beide Werte enthalten jetzt die tatsächlich verrechneten Boni.
5. **Rede-/Handlungsblasen konnten serverseitig ihre Technik verlieren.** Der Browser verwendete den mechanischen Kampfmodus, der Server dagegen die Darstellungsart der Blase zur Auswahl des Profils. Die gemeinsame Moduserkennung hält Technik und Kosten unabhängig davon stabil, ob der Beitrag als Rede, Handlung oder Kampfbeschreibung angezeigt wird.

Die neuen Module `combat-ward-resolution.js` und `combat-segment-model.js` kapseln diese Zuständigkeiten. Browser und Firebase verwenden dieselben Quellen; die Serverkopien wurden über das bestehende Synchronisationsskript aktualisiert. Dabei wurden auch die bereits im Browser vorhandenen Kampfstilkennungen der Techniken in die Serverkopie übernommen. Neue Regelbelege tragen `combat-evaluation-5`.

## Oberflächen- und Regressionstests

Im separaten lokalen Chrome wurden beide echten Charakterbögen geöffnet und die oben angegebenen Kernwerte geprüft. Die temporäre Szene zeigte den vollständigen Duellverlauf mit Rede-, Handlungs- und aufklappbaren Auswertungsblöcken.

- Waffenwahl und ein-/zweihändige Führung waren im Kampfeditor verfügbar.
- Auswerten ohne reservierte Kosten wurde abgewiesen.
- Reservieren der Aktion zeigte `1 → 0`.
- Ein tatsächlicher 3D-Schwerthieb Gildas’ ergab W20 13 + 7 gegen RK 16, anschließend W8 1 + 3 Schaden; Gawain wechselte von 39 auf 35 TP. Der Beleg zeigte den einmaligen Vorbereitungsbonus gesondert.
- Zwei normale Angriffe im selben Gesamtbeitrag wurden wegen fehlender Aktion abgewiesen; die Testhistorie blieb unverändert.
- Ein Schwerthieb in einer Redeblase plus Jungdrachen-Bonusaktion in einer Handlungsblase wurde vollständig aufgelöst. Die zweite Handlung verwendete die bereits reduzierten Ziel-TP; Aktion und Bonusaktion wurden jeweils einmal verbraucht.
- Die aufklappbare Auswertung zeigte Würfe, Verteidigung, Schaden, TP-Änderung, Aktionsverbrauch und angewendete Vorbereitung. Während dieser Prüfung wurden keine JavaScript-Laufzeitfehler erfasst.

Zusätzliche dauerhafte Regressionstests liegen in `tests/gawain-combat-profile.test.mjs` und `firebase/functions/tests/combat-resolution-integrity.test.js`. Abgedeckt sind die oben behobenen Fälle einschließlich fehlender Haupt-/Folgeabwehrwürfel und kritischen Zerbrechens von Schutzladungen.

| Abschlussprüfung | Ergebnis |
| --- | --- |
| Almanach-Tests | 423 von 424 erfolgreich |
| Firebase-Functions-Tests | 82 von 82 erfolgreich |
| Nachprüfung des zuletzt verschärften Abwehrbelegs | 13 von 13 erfolgreich |
| Produktionsbuild | erfolgreich |
| `git diff --check` | erfolgreich |

Der einzige fehlgeschlagene Almanach-Test ist `Dashboard rendert echte Archivdaten ohne leere Platzhaltertexte` in `dashboard-rendering.test.mjs`. Er schlug bereits im unveränderten Ausgangszustand fehl: Erwartet wird „Die Chronik von Cenyr“, angezeigt wird ein anderes Archiv-Fundstück. Dieser vom Kampf unabhängige Befund wurde nicht verändert.

## Grenze der Prüfung

Dies war eine lokale Prüfung mit den produktiven Komponenten und serverseitiger Neuberechnung, kein gemeinsamer Online-Test mit zwei angemeldeten Spielern. Live-Transaktionen, gleichzeitiges Speichern beider Spieler und die anschließende KI-Erzählung wurden in dieser Szene nicht gegen das produktive Firebase ausgeführt. Die bestehenden Tests für Transaktionen, Undo und Erzählungsintegrität wurden mit ausgeführt.

Für den gemeinsamen Test müssen die geänderten Webdateien und Firebase Functions zusammen veröffentlicht werden. Die Veröffentlichung wurde in diesem Auftrag nicht vorgenommen. Danach sollten Patrick und du insbesondere einen gleichzeitigen Beitrag, einen Technikangriff aus einer Handlungsblase sowie Rücknahme und erneutes Laden des Kampfstands gemeinsam prüfen.
