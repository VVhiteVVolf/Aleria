# Restitution – Implementierungsstand

Stand: 12. September 2026. Lokal umgesetzt; kein Push oder Firebase-Deployment.

## Verzeichnis und Daten

- Die gelehrte Schule ist unter `Magie/restitution/index.html` erreichbar und auf der Magieseite unter „Die gelehrten Schulen“ verlinkt.
- Sechs Bereiche enthalten 46 eigenständig lernbare Zauber und 18 ausdrücklich ausgearbeitete höhere Formen. R47/R48 bleiben als nicht lernbare Platzhalter im aufklappbaren Abschnitt „Sonstiges & Grenzkunst“.
- 21 Zauber verwenden passende vorhandene Baldur’s-Gate-Icons. Die übrigen 25 Iconplätze bleiben leer; keine fremden Ersatzmotive und keine neu generierten Bilder.
- Die kanonischen Daten liegen nach Behandlungsbereich getrennt in `AleriaAlmanach/modules/spell-catalog/restitution-v1/`. Die Seite wird mit dem gemeinsamen Zauberlisten-Template erzeugt. Schulmetadaten steuern auch Archiv und Build-Einstiegspunkte.
- Mana stammt unverändert aus der zentralen Tabelle einschließlich der bereits eingerechneten Erhöhung um 15 %. Aktionspakete und höhere Formen werden über die bestehende Kampfmechanik aufgelöst.

## Archiv und Kampf

Alle 46 Vorlagen sind im Charakterbogenarchiv verfügbar. Stabile Katalogreferenzen mit Revision verbinden Verzeichnis, gelernte Zauber, Charakteransicht und Kampfabwicklung. Bestehende eigene Zauber gleichen Namens werden nicht ersetzt. Frühere Elemente-/Elementarismusfassungen bleiben erhalten. Archivlinks mit einer vollständigen Katalog-ID werden gezielt auf diese Referenz aufgelöst.

Direkte Heilung verwendet echte Heilungseffekte: getrennte Ergebnisse je Ziel, Begrenzung auf fehlende TP und einmaliger Ressourcenverbrauch über die bestehende Fortsetzungslogik. Heilung erhält weder kritische Schadensverdopplung noch Rhiannons persönlichen INT-Schadensbonus. Höhere Formen ersetzen Heilung, Aktionspaket und Beschreibung gemeinsam. Das gilt auch für die ausgearbeitete höhere Form des Zaubertricks Schmerzlinderung.

Die Zielprüfung weist ausdrücklich als tot erfasste Ziele und zauberspezifische Mindest-TP-Verstöße vor dem Ressourcenverbrauch zurück. Körperliche Behandelbarkeit, Zustimmung und Wirkungslinie bleiben Voraussetzungen der jeweiligen Karte; nicht dokumentierte Anatomie wird nicht aus Namen geraten.

## Bewusst geführte Auflösung

Diagnosen, ursachenabhängige Zustandsbehandlung, körperliche Rekonstruktion, spätere Heilpulse, zeitlich begrenzte Schutzpolster und reaktive Wachten benötigen teilweise Entscheidungen bzw. Nachführung durch die Spielleitung. Diese Grenzen sind an den betroffenen Zaubern ausgewiesen. Solche Zauber löschen keine Zustände pauschal, erzeugen keine unbegrenzten temporären TP und lösen spätere Heilung nicht sofort als Gesamtsumme aus.

Bei Wanderndes Heillicht ist der erste Heilpuls umgesetzt; weitere Pulse folgen den beschriebenen Bedingungen unter Führung der Spielleitung. Tagesgrenzen und Auslöser der Wachten müssen anhand der Zielhistorie geprüft werden. R47/R48 haben keine Archivvorlage und keine ausführbaren Wiederbelebungseffekte. Arkanistenfieber bleibt ausdrücklich ausgeschlossen.

## Prüfung

- 21 gezielte Tests für Archivsuche, Elemente-Kompatibilität, Restitution, Seitengenerierung und Serverabgleich erfolgreich.
- Mini-Kampfproben prüfen Heilende Hand und höhere Formen, Große Heilung, Wundverschluss bei 0 TP, Lebensruf, Gruppenheilung sowie geführte Reinigung und Wachten.
- Alle 64 Grund- und höheren Formen stimmen zwischen Browser- und Serverdaten überein. Manipulierte Heilwerte und Kosten werden serverseitig durch die referenzierte Katalogfassung ersetzt.
- Browserprüfung bei 320, 390, 768, 1024 und 1440 Pixeln: Schulverlinkung, Filter, Tastaturbedienung, aufklappbare Karten, Direktlinks und lokale Bilddateien.
- Vite-Build in ein isoliertes Ausgabeverzeichnis; die neue Schule wird über die gemeinsame Schulregistrierung mitgebaut.

Reproduzierbare Prüfungen:

```powershell
node Magie/scripts/build-spell-lists.mjs --check
node --experimental-test-isolation=none --test AleriaAlmanach/tests/character-archive-query.test.mjs AleriaAlmanach/tests/restitution-catalog.test.mjs AleriaAlmanach/tests/elemente-balance.test.mjs Magie/tests/restitution-list.test.mjs firebase/functions/tests/restitution-catalog.test.js
```

Nach Änderungen am gemeinsamen Katalog oder der Kampfmechanik die Serverkopien mit `node firebase/functions/scripts/sync-almanach-mechanics.mjs` aktualisieren. Generierte Seiten und Serverkopien nicht direkt bearbeiten.
