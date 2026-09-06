# Berserkergang und Zornkappe – Abgleich vom 6. September 2026

Der Skjaldr verwendet ab Stufe 6 den neuen Berserkergang. Die Klassenseite, die Bibliothek, Fenrirs Export und der Figurenbestand sind abgeglichen. Browser und Firebase beziehen die Regeln aus denselben Quellen.

| Stufe | Kraft | Zusatzschaden mit Waffen | RK | Temporäre LP bei Aktivierung | Anwendungen pro Tag |
| --- | ---: | --- | ---: | --- | ---: |
| 6 | +2 | 1W4 | −4 | 1W12 + KON | 1 |
| 8 | +2 | 1W6 | −3 | 1W12 + KON | 2 |
| 10 | +4 | 1W6 | −2 | 2W12 + KON | 2 |
| 15 | +4 | 1W8 | −1 | 2W12 + KON | 3 |
| 20 | +6 | 1W10 | 0 | 3W12 + KON | 3 |

„Trefferwurf“ für die temporären LP ist hier als Trefferwürfel des Skjaldr (W12) ausgelegt. Kraft verändert auch den Modifikator, kraftbasierte Waffenwerte, Fertigkeiten, Rettungswürfe und Technik-SG. Die alte pauschale Kombination aus +5 Treffer, −5 RK und Rettungswurf-Vor-/Nachteilen entfällt.

Aktivierung kostet eine Bonusaktion und eine Reaktion sowie eine tägliche Anwendung. Aura ersetzt wie bisher das gesamte Aktionskostenpaket, aber keine begrenzte Anwendung. Höhere Stufen ersetzen die vorherigen Boni; sie werden nicht addiert. Ein aktiver Modus kann nicht erneut aktiviert werden.

Einmal je Aktivierung bleibt die Figur bei ansonsten tödlichem Schaden auf 1 LP. Die Ladung liegt im temporären Zustand und wird auch zwischen Abschnitten, gespeicherten Posts und bei Rücknahme korrekt verfolgt. Ein weiterer Treffer kann regulär besiegen. Der Schutz erzeugt weder eine neue Aktion noch neue temporäre LP.

Der Modus endet bei Kampfende oder nach einem vollständigen eigenen Beitrag ohne Angriff und ohne seit dem letzten eigenen Beitrag erlittenen Schaden. Fehlschläge und durch temporäre LP absorbierter Schaden zählen. Fremde Beiträge und administrative Statusänderungen verbrauchen keine eigene Runde. Der Aktivierungsbeitrag erhält eine Anlaufphase; die erste Ruheprüfung erfolgt am Ende des nächsten eigenen Beitrags. Temporäre LP werden nur beim Aktivieren gewürfelt, addieren sich nicht und folgen anschließend ihrer normalen Verbrauchs-/Erholungsregel.

Die Zornkappe ist der vorhandene Berserkerpilz im Handelsregister (20 Kupfer, Bild NJInJ9x). Konsumieren verbraucht den echten Inventargegenstand. Ein/zwei/drei Pilze geben insgesamt +2/+4/+8 Schaden und −2/−4/−8 RK. Der Trefferwurf bleibt unverändert. Der Bonus gilt auch für Magieschaden und schwache Folgeangriffe; der Klassen-Zusatzwürfel wird auf ausdrücklich begrenzten Folgeangriffen dagegen nicht wiederholt. Es gibt keine Verstärkung von Heilung oder temporären LP.

Der Pilzrausch endet mit dem Kampf, hat höchstens drei Stapel und darf neben dem Klassenmodus bestehen. Er gewährt keinen Kraftbonus und keine Rettung bei 0 LP. Eine nachträgliche Einnahme ändert keine früheren Angriffe desselben Posts. Bestand und Wirkung werden gemeinsam geprüft; eine gefälschte Zustandsvorschau umgeht die Stapelgrenze nicht.

## Figuren

Im Bestand besitzen genau Fenrir Varulv und Freya Skald ausgearbeitete Aldrimar-Kampfbögen. Fenrir bleibt Stufe 6 mit seiner vorhandenen Axt-, Wurf- und Schildausrüstung; sein Berserkergang wird automatisch aus der Klassenstaffel aufgebaut. Seine alten persönlichen Waffentechniken bleiben erhalten. Freya bleibt Skalde Stufe 5 mit ihrem bestehenden Repertoire; die späteren Skaldenstufen werden dadurch nicht vorweggenommen.

## Prüfung

- 612 Frontend- und Klassentests bestanden, darunter acht gezielte neue Laufzeittests.
- 90 Firebase-Modultests bestanden.
- 62 Integrationstests mit echten Firestore-Transaktionen in einem isolierten lokalen Demo-Projekt bestanden.
- Desktop-/Mobilprüfung aller sieben Aldrimar-Klassenseiten und Browserprüfung der Kampfkarte: Kraftbonus, Zusatzwürfel, RK und Rettung 1/1 beziehungsweise 0/1 sichtbar.
- Produktionsbuild und Klassen-/Bibliotheksabgleich bestanden.

Die Integration prüft insbesondere zwei tödliche Treffer, Wiederherstellung der Schutzladung durch Undo, Fehlschläge, einen ruhigen eigenen Post, Tagesnutzung, Konsumieren, Reihenfolge der Abschnitte, Stapelgrenze gegen manipulierte Eingaben, Kampfende und Rücknahme. Die vorhandenen Prüfungen für Freyas Gesänge, Magie, Konzentration, Zustände, Ressourcen und Waffenwechsel bleiben erfolgreich.

Testdaten liegen ausschließlich im lokalen Projekt `demo-aleria-combat-checkup` auf Port 8180. Sie werden nach der Prüfung gelöscht und der Emulator beendet. Neue Angriffe oder Testzustände werden nicht in echte Figurenprofile geschrieben.
