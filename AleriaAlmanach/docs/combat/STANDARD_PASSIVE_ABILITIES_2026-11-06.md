# 15 gewöhnliche erlernte RPG-Fähigkeiten – 6. November 2026

Diese Auswahl ersetzt die zuvor neu ergänzten 15 engen passiven Routinen.
Die Definitionen stehen weiterhin im gekapselten Modul
`development-expansion-abilities.js`, verwenden aber 15 neue Kennungen.
Die Fähigkeiten sind klassenfrei und wirken über die vorhandenen reversiblen
Trait-, Ausbildungs- und Triggerverträge. Sie vergeben keine zusätzlichen
Aktionen, Gegenstände, Magiezugänge oder aktuellen Trefferpunkte.

| Fähigkeit | Tatsächliche Wirkung | Punkte |
| --- | --- | ---: |
| Nahkampftraining | +1 Nahkampf-Waffenangriff einschließlich passender Techniken | 2 |
| Fernkampftraining | +1 Fernkampf-Waffenangriff einschließlich passender Techniken | 2 |
| Unbewaffneter Kampf | +1 Angriff und +1 Schaden mit unbewaffneten Angriffen | 2 |
| Kraftangriff | −1 Angriff, +2 Schaden mit Nahkampfwaffen | 1 |
| Präzisionsschütze | −1 Angriff, +2 Schaden mit Fernkampfwaffen | 1 |
| Ausweichen | +1 RK | 3 |
| Magiekontrolle | +1 Zauber-SG; Vorteil bei KON-Konzentrationsrettungen | 6 |
| Kampfzauberer | +1 Zauberangriff; +1 KON-Rettungswürfe | 3 |
| Arkane Abwehr | +1 Attributsrettungen gegen Zauber, Gebete und Gesänge, auch sekundär | 2 |
| Widerstandstraining | +1 auf alle sechs Attributsrettungswürfe | 3 |
| Wildniskunde | Expertise Naturkunde; mindestens ausgebildet in Überleben | 5 |
| Heilkunst | Expertise Heilkunde; +1 Körperbeherrschung | 4 |
| Diplomatie | Expertise Überzeugen; +1 Motiv erkennen | 4 |
| Diebeskunst | Expertise Fingerfertigkeit; +1 Heimlichkeit | 4 |
| Kampfreflexe | +2 Initiative; +1 GES-Rettungswürfe | 3 |

Nah-/Fernbereiche beziehen sich auf den tatsächlichen Angriff, einschließlich
ausdrücklich geworfener Techniken. Die fünf Waffenfähigkeiten verändern keine
Zauber. Kraftangriff und Präzisionsschütze wenden ihre beiden Werte gemeinsam an,
solange die gewählte Fähigkeit aktiv ist. Sie erzeugen keine neue Kampfhandlung.
Eine feste Gesamt-RK behält den bestehenden Vorrang vor Ausweichen.

Expertise und ausgebildete Fertigkeiten erhöhen die effektive Übung, ohne die
gespeicherten Ausbildungsfelder umzuschreiben. Höhere vorhandene Ausbildung wird
nicht abgesenkt. Mehrfache Expertise und Konzentrationsvorteil zählen nach dem
vorhandenen Balancevertrag nur einmal. Zahlenboni verschiedener Quellen addieren
sich weiterhin; die Bilanz warnt vor starken Überschneidungen.

Alle Namen und normalisierten Verträge wurden gegen den gesicherten vorherigen
272er-Katalog sowie 1061 reale Archivdefinitionen verglichen. Die gemeinsame
Signatur berücksichtigt den Aktivierungsvertrag: Drei vorhandene Reaktionstechniken
geben ebenfalls +1 RK, verlangen aber eine Reaktion. Ausweichen gewährt den
dauerhaften Bonus für drei Punkte und ersetzt diese Techniken nicht.

Acht neue Fachtests prüfen unter anderem die tatsächliche Kampfauflösung des
Schadenstausches, 14 Waffenfamilien, geworfene Techniken, alle sechs Rettungen,
primäre/sekundäre und eigenständige Magierettungen, effektive Expertise,
Konzentration und unveränderte gespeicherte Werte. Acht unabhängige Regressionen
für den gemeinsamen Triggerkern stehen in `combat-trigger-source-contract.test.mjs`.
Sie nutzen private Vertragsfixtures und halten keine verworfenen Menüeinträge vor.

Die ersten zehn neuen Einzelicons und deren vollständige Prompts, Referenzhashes,
Original- und WebP-Belege liegen unter
`diagnostics/standard-talents-abilities-20261106/abilities-a/`.
Die letzten fünf werden im selben Auftrag gesondert aufgenommen.
