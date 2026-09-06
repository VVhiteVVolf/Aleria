# Zustände, Buffs und Zauber: lokaler Mechanikcheck

Geprüft wurden die vorhandenen Figuren und Mechaniken in einer isolierten Firestore-Umgebung (`demo-aleria-combat-checkup`, `127.0.0.1:8180`). Keine Produktionsdaten wurden verändert. LP-Balance und Charakterklassen bleiben unverändert.

## Umfang

- Rhiannon, Gawain, Gildas, Freya und Fenrir: Schild, Spiegelbilder, Magierrüstung, Person festhalten, Spottvers, Berserkergang und eine tatsächlich gelernte hochstufige Teulu-Schutztechnik.
- Alle 91 hinterlegten Zustandseffekte einschließlich der Zustände aus sekundären Rettungswürfen in den zehn Drachentanz-Formen: Übernahme der Werte, Selbst-/Zielzuordnung und Ablauf. Diese isolierten Katalogtests prüfen die Zustandsdaten; die Rettungswurfentscheidung und komplette Angriffe werden zusätzlich mit Figuren im Emulator geprüft.
- Manuelle Buffs und Debuffs: Angriff, RK, Rettungswürfe, Fertigkeiten, Zauberangriff und Zauber-SG; verschiedene Beitragsdauern, Rast, Tag, Kampfende, Entfernen, Reset und Rücknahme.
- Konzentration: erfolgreiche/gescheiterte Probe, Wechsel des Ziels, erneutes Wirken, natürlicher Ablauf, manuelles Entfernen, Unterbrechung und Rücknahme mit Abhängigkeiten zu dritten Figuren.
- Separat gekennzeichnete Testfähigkeiten für Reinigung, Unterbrechung und ein Ritual über drei Beiträge. Sie existieren nur in Testdaten und wurden keiner echten Figur hinzugefügt.
- Kreatureninstanzen: Zustand auf einer Instanz verändert weder eine zweite Instanz noch die gespeicherte Vorlage.
- Tatsächliche UI mit Kampfcontroller und lokalem Backend: alle zwölf Vorlagen und ihre Icons, freie Zustände, Entfernen, Reset, Neuladen, Ressourcenanzeige, Waffenwechsel und 390-Pixel-Mobilansicht.

## Gefundene und behobene Fehler

1. Ein eigener Schutzzauber konnte eine bestehende Schildladung verbrauchen. Abwehrladungen werden nun nur bei passenden gegnerischen Wirkungen geprüft.
2. Erneute Spiegelbilder konnten beliebig viele separate Schutzpakete erzeugen. Derselbe strukturierte Effekt desselben Urhebers wird erneuert; andere Quellen und manuell vergebene Einträge behalten ihre Identität. Das gilt auch für erneut erzeugte Zustände aus sekundären Rettungswürfen.
3. Konzentration war nicht zuverlässig mit entfernten Zielzuständen verbunden. Neue Wirkungen tragen Urheber und Konzentrationsinstanz. Wechsel, Verlust, Ablauf und Entfernen werden szenenweit nachvollzogen. Bei mehreren Zielen endet Konzentration erst mit dem letzten zugehörigen Effekt.
4. Der Bewegungsmalus von Person festhalten wurde nicht in den aktuellen Bewegungswert übernommen. Bewegung und Initiative werden nun verrechnet; die Miniansicht verwendet den aktuellen Wert. Die für die Auswertung bereitgestellten Profilwerte werden ebenfalls aktualisiert.
5. Temporäre Zauberangriffs-/Zauber-SG-Boni änderten teilweise nur separate Profilfelder, nicht den tatsächlich verwendeten Handlungswert. Beide Wege stimmen jetzt überein.
6. Fertigkeitsvorschauen verwendeten das Grundprofil ohne die aktiven Szenenzustände. Akteur, Gegenspieler und Unterstützer verwenden nun einen gemeinsamen Szenenstand. Ressourcen- und Fähigkeitsverbrauch durch Fertigkeitsreaktionen wird auch beim Replay berücksichtigt.
7. Bei einer kurzen Rast konnte die erstmalige Erholung täglicher Ressourcen fälschlich als Tageswechsel gelten und Tageszustände löschen. Zustandsablauf und Ressourcenerholung unterscheiden diese Fälle jetzt.
8. Mehrere Abschnitte desselben Beitrags konnten eine mehrteilige Kanalisierung abkürzen. Der Fortschritt ist an den Gesamtbeitrag gebunden; Vorschau und Server verweigern einen zweiten Fortschritt im selben Post atomar. Die Anzeige zeigt den tatsächlichen Fortschritt, etwa `1/3 Beiträge`.
9. Ein frisch erzeugter Zustand konnte im allerersten mechanischen Szeneneintrag sofort ablaufen. Neu entstandene Zustände verbrauchen jetzt auch ohne zuvor initialisierte Kampfliste keinen Beitrag bei ihrer Entstehung.
10. Reinigung über eine feste Zustandskennung fand individuell erzeugte Laufzeit-IDs nicht. Die ursprüngliche Zustandskennung bleibt nun erhalten und ist adressierbar.
11. Eine Rücknahme konnte den Zustand einer dritten, durch Konzentration verbundenen Figur nach deren Folgebeitrag verändern. Die Abhängigkeitsprüfung berücksichtigt diese Verbindung und normale Beiträge, die Zustandsdauern fortschreiben.

## Technische Verantwortung

`combat-condition-lifecycle.js` verwaltet Effektidentität und Konzentrationsbindungen ohne DOM- oder Datenbankzugriff. Derselbe Code läuft im Browser und im generierten Server-Regelkern. `skill-scene-profile.js` kapselt den Zustand einer Fertigkeits-Eingabe. Die Firebase-Transaktionen bleiben für Speicherung und Validierung verantwortlich. Die Integrationstests für manuelle und durch Fähigkeiten erzeugte Zustände gehören jetzt zum regulären `test:combat-integration`-Befehl.

## Grenzen der vorhandenen Automatik

- Die zwölf Iconvorlagen sind keine importierten Baldur's-Gate-Regelsätze. Ein manuell eingegebener Zahlenbonus wird berechnet; ein bloßer Name wie „Vergiftet“ erzeugt keinen erfundenen Malus, keine automatische Handlungsblockade und keinen periodischen Schaden.
- Zauber wie Person bezaubern, Person beruhigen, Stille, Gegenzauber und Magie bannen sind in den vorhandenen Figuren teils ausdrücklich nur als Freitext ohne strukturierte Effekte hinterlegt. Sie sind keine bereits implementierten automatischen Zustands-/Unterbrechungsaktionen. Die generische Unterbrechungsmechanik wurde mit einer isolierten Testfähigkeit geprüft.
- Bewegungswerte aus strukturierten Zustandsmodifikatoren werden berechnet. Freitext über Bewegung oder ein protokollierter Schub verändert keine Position auf einer taktischen Karte.
- Temporäre TP verwenden weiterhin den bestehenden gemeinsamen Vorrat. Eine nur im Zaubertext genannte Befristung dieses Vorrats (etwa Magierrüstung „bis Kampfende“) ist kein separat verfolgter Effekt-Timer. Unterschiedliche TP-Quellen und deren individuelle Laufzeiten benötigen eine eigene Regeldefinition und Quellenverwaltung.
- Bestehende historische Ergebnisbelege werden nicht umgeschrieben. Neue Konzentrations-/Urheberverknüpfungen werden beim erneuten Wirken gespeichert; ein alter, unvollständig verknüpfter Zustand kann über die Verwaltung entfernt werden.

## Prüfnachweise

- Frontend: 523 Tests bestanden, darunter 17 neue Tests mit den Katalogdurchläufen.
- Server: 90 unterschiedliche Unit-Tests bestanden; die präzisierte Rücknahmeabhängigkeit wurde zusätzlich gezielt geprüft.
- Integration: 48 unterschiedliche Tests bestanden, darunter 22 neue Szenarien. Ein Testadapter wurde nachgebessert, damit Gawains vorhandener Vorteil auch zwei Würfelbelege liefert; der betreffende Test und die erweiterte serverseitige Kanalisierungsprüfung wurden gezielt erfolgreich wiederholt.
- Firestore-Regeln: 12 Tests bestanden.
- Browser: alle zwölf Vorlagen einschließlich lokal geladener Icons, Desktop und Mobilansicht bestanden; keine JavaScript-Fehler oder fehlenden lokalen Dateien.
- Produktionsbuild erfolgreich. Die bestehende Warnung zu großen Haupt-/Würfelpaketen bleibt bestehen.
- Vollständige Kampfsimulationen: alle zwölf bestanden, darunter Rhiannon + Gawain gegen Gildas + Kreatur, Guinevere mit Begleitern, Fenrir + Freya und Duncan auf Stufe 20. Pro Gruppe wurden drei reproduzierbare Würfelfolgen geprüft.

Insgesamt wurden 685 unterschiedliche automatisierte Tests erfolgreich geprüft, davon 40 neu hinzugefügt. Gezielte Wiederholungen werden nicht zusätzlich gezählt.

Lokale Protokolle liegen unter `.codex-temp/combat-status/nondamage-*.log` und `browser-nondamage.json`. Für die Livewirkung müssen Frontend und geänderte Firebase-Funktionen gemeinsam veröffentlicht werden; die vorherige Zustandsverwaltung benötigt außerdem ihre bereits vorbereiteten Firestore-Regeln.
