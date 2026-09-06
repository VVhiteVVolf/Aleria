# Figurenanzeige und temporäre Zustände

Der anschließende ausführliche Mechaniktest mit weiteren Korrekturen ist in [NONDAMAGE_CHECKUP_2026-09-06.md](NONDAMAGE_CHECKUP_2026-09-06.md) dokumentiert. Die unten genannten Testzahlen beschreiben den ersten Implementierungsstand.

Die Porträtkarte zeigt den aktuellen Szenenstand: Trefferpunkte einschließlich temporärer TP, Rüstung, Angriff, Initiative, Bewegung, die tatsächlich geführte Waffe und ihre Schadenswerte. Sie verwendet dieselbe Waffen- und Zustandsauflösung wie der Kampfeditor; tagesgebundene Vorräte berücksichtigen denselben Szenentag.

Aktionsressourcen und zentrale Vorräte stehen direkt in der Karte. Weitere Vorräte, begrenzte Fähigkeiten und dauerhafte Bogeneinträge sind aufklappbar. Temporäre Effekte zeigen Restdauer, Quelle, Hinweise, Zahlenmodifikatoren und vorhandene Abwehrladungen. Konzentration und Kanalisierung sind gesondert sichtbar. Änderungen aktualisieren die geöffnete Karte ereignisgesteuert. Auf kleinen Bildschirmen steht die geöffnete Karte über dem Beitrag.

## Temporäre Zustände

- Zwölf Vorlagen mit bestehenden lokalen Baldur’s-Gate-Icons; freie Namen, Quelle, Beschreibung und Kategorie sind möglich. Die Bilder übernehmen keine fremden Spielregeln.
- Dauer nach eigenen Beiträgen, allen Szenenbeiträgen, Kampfende, Rast, langer Rast, Szenentag oder bis zum Entfernen. Mehrere Kampfabschnitte desselben Beitrags zählen einmal.
- Eingetragene Zahlenboni für Angriff, Schaden, RK, Rettungswürfe, Fertigkeiten, Zauberangriff und Zauber-SG werden durch die bestehende Mechanik verrechnet. Andere frei beschriebene Wirkungen (zum Beispiel Folgeschaden, Bewegungsverbote, Handlungssperren) bleiben Hinweise; diese Vorlagen erfinden keine automatische Regelwirkung.
- Vergabe und Entfernen auch vor Kampfphasen; Kampfaura-Effekte bleiben Eigentum der Kampfliste.
- Jede Änderung wird als servergeprüftes `combatStatus`-Ereignis gespeichert und beim Szenen-Replay berücksichtigt. Ein Verwaltungseintrag füllt keine Aktionsressourcen auf und verbraucht keine Effektdauer.
- Optimistische Prüfung der letzten Szenenkennung schützt vor veralteten Eingaben. Bei Konflikten bleiben die Eingaben im Dialog erhalten und können nach Aktualisierung erneut geprüft werden.

## Reset

Der Reset füllt LP, Ressourcen und begrenzte Fähigkeiten auf und entfernt temporäre TP, temporäre Effekte, Konzentration und Kanalisierung. Ausrüstung und permanente Bogeneinträge bleiben erhalten. Der aktuelle Szenenstand und das gespeicherte Figurenprofil werden konsistent aktualisiert.

Angekündigte/laufende Kampfphasen sperren den Reset. Zusätzlich prüft der Server die Figuren-Sperren anderer Szenen. Der bisherige Reset-Endpunkt kann keine Kampfsperren mehr löschen. Die Reset-Bedienung der Kampfliste verwendet nun ebenfalls das protokollierte Verfahren. Geteilte Kreatureninstanzen verändern ihre Vorlage nicht.

## Prüfung

- Frontend-Suite: 506 Tests.
- Server-Suite: 89 Tests.
- Integration mit lokalem Firestore: 26 Tests einschließlich Zustandsvergabe vor Kampfstart, Verbrauch der Restdauer, Modifier-Wirkung, Reset-Sperre auf beiden Endpunkten, veralteten Eingaben, Entfernen und Rücknahme sowie Reset nach Kampfende.
- Zwölf vollständige vorhandene Gruppenkämpfe als Regressionstest.
- Firestore-Regeln: zwölf Tests einschließlich Schutz gegen eingeschleuste und direkt überschriebene Zustandseinträge.
- Browser mit echtem Kampfcontroller und lokalem Firestore: Desktop und 390-Pixel-Mobilansicht, Vergabe über Iconvorlage, manueller Zustand, Restdauer, Entfernen, Reset, Aktualisierung nach Kampfstart, aktiver Dolch und verbrauchte Bonusaktion nach serverseitig bestätigtem Waffenwechsel. Keine JavaScript-Fehler oder fehlenden lokalen Dateien.
- Produktionsbuild erfolgreich; bestehende Warnung zu großen Haupt-/Würfelpaketen bleibt.

Die Emulatorprüfungen verwenden ausschließlich lokale Testdaten. Für den Livebetrieb müssen die neue Firebase-Funktion `commitCombatStatus`, die geänderten bestehenden Funktionen und die Firestore-Regeln zusammen mit dem Frontend veröffentlicht werden.

Die vorgeschlagene LP-Steigerung ist separat in `HIT_POINT_PROGRESSION_PROPOSAL.md` beschrieben. Sie ist noch nicht aktiviert und verändert die Werte dieser Tests nicht.
