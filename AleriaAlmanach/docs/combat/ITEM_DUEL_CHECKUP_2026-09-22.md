# Inventar- und Kampftest vom 22. September 2026

## Verfügbare Figuren

| Figur | Lokaler Datenstand | Duellteilnahme |
| --- | --- | --- |
| Gais Wyrm | Charaktereintrag und Biografie, kein `combatProfile` | Ausgelassen |
| Nudd Saethwyr | Charaktereintrag, kein `combatProfile` | Ausgelassen |
| Gildas Gafyr | Vollständiger Bogen, Stufe 6 | Ja |
| Gawain Draig | Vollständiger Bogen, Stufe 5 | Ja |

Quelle ist die lokale CharakterDatenbank mit den vorhandenen Charakterexporten.
Für Gais und Nudd wurden keine Ersatzwerte erfunden. Der automatisch verfügbare
Standard-Nahkampfangriff gilt ausdrücklich nicht als vollständiger Kampfbogen.

## Isolation

Alle Schreibvorgänge liefen im lokalen Firestore-Emulator auf `127.0.0.1:8182`,
Projekt `demo-aleria-item-duels`. Die Testumgebung verweigert andere Endpunkte.
Die echten serverseitigen Funktionen für Kampfstart, Kampfauswertung, Inventarnutzung,
Szenengegenstände, Kampfende und Rücknahme wurden gegen diesen Emulator aufgerufen.
Die Browserprüfung blockierte Zugriffe auf die Online-Datenbank.

Keine Änderung am laufenden Online-Kampf, kein Push und kein Deployment.

## Vier vollständige Duelle

Unveränderte mechanische Bögen und Inventare aus dem bereinigten lokalen Archiv;
neue Kampfphase, keine Erfahrungspunkte und kein automatischer Tod.
Die Vergleichsläufe verwenden gewöhnliche Waffenangriffe. Kampftechniken wurden
zusätzlich in den gezielten Integrationstests geprüft. Die Ergebnisse sind keine
Aussage zur optimalen Spielweise oder Klassenbalance.

| Lauf | Führung | Sieger | Rest-TP Gildas / Gawain | Angriffe |
| --- | --- | --- | --- | --- |
| Seed 11 | Einhändig | Gildas | 10 / 0 | 17 |
| Seed 42 | Einhändig | Gawain | 0 / 12 | 30 |
| Seed 77 | Zweihändig | Gawain | 0 / 14 | 38 |
| Seed 99 | Einhändig, erster Fehlschlag gezielt entwaffnend | Gildas | 1 / 0 | 21 |

In Lauf 99 erfolgten Aufheben und der anschließende Angriff im selben Beitrag.
Alle vier Kämpfe erreichten ein reguläres Ende durch Kampfunfähigkeit. Kampfende
und dessen Rücknahme wurden ebenfalls geprüft. Die Würfe sind reproduzierbar;
gezielte Nebeneffekte sind im Test festgelegt und nicht clientseitig im Spiel wählbar.

Das [maschinenlesbare Protokoll](item-duel-checkup-2026-09-22.json) enthält die
einzelnen Würfe, Schaden, Rest-TP, Ausrüstungseffekte und Nebeneffekte.

## Behobene Fehler

1. **Doppelte Archivgegenstände:** Der neu gestaltete Gawain-Export wurde mit alten
   Inventarlisten vereinigt. Derselbe Gegenstand konnte unter identischer ID mehrfach
   auftauchen. Der vollständige Export verwendet nun die bereits vorhandene Strategie
   `replace-exported-fields`; die lokale Datenbank wurde neu synchronisiert. Gawains
   Inventar enthält sieben eindeutige Einträge einschließlich des vorhandenen Siegelrings.
2. **Aufgenommene Waffen fehlten im Kampfprofil:** Die bisherige Synchronisierung
   aktualisierte nur vorhandene Waffen. Eine fremd aufgenommene Klinge wurde deshalb
   zwar übertragen, aber nicht als benutzbare Waffe mit ihrem Effekt ergänzt. Die
   Aufnahme ergänzt jetzt gezielt fehlende Ausrüstung und normalisiert das Ergebnis.
   Drachenzahn bleibt ein einzelner Gegenstand samt Bild und Drachenkerbe. Er wird
   nicht automatisch ausgerüstet; nach dem Waffenwechsel greift der Effekt auch bei
   Gildas. Rücknahme stellt beide Inventare und Waffenlisten wieder her.
3. **Abgelegte Rüstung wirkte weiter:** Der Ausrüstungsstatus aus dem Inventar wurde
   nicht in die mechanische Ausrüstung zurückgeschrieben. Die gemeinsame Synchronisierung
   übernimmt nun explizite Änderungen. Abgelegte Silberschuppe schützt nicht; angelegte
   Silberschuppe gewährt wieder ihre regelgemäße Wirkung.

Zusätzlich wurden veraltete Testerwartungen an den Standard-Schwertpreis auf den
bereits vorgesehenen Handelspreis von Drachenzahn (5 GT 5 ST) angepasst. Die gemeinsame
Testvorschau berücksichtigt Ressourcensperren nun in derselben Reihenfolge wie das Spiel.

## Geprüftes Zusammenspiel

- Alle zehn kritischen Trefferfolgen und alle zehn kritischen Fehlschlagfolgen mit
  tatsächlicher Speicherung, sichtbarer Auswertung, Dauer und Ablauf.
- Reaktion und Bonusaktion bleiben während ihrer Sperre auch nach Ressourcenauffrischung
  gesperrt. Zauber und allgemeine Fähigkeitswürfe lösen die Waffen-Tabellen nicht aus
  (ergänzende Modelltests).
- Entwaffnung blockiert die betroffene Waffe und ihre Kampftechniken; ein Wechsel auf
  Gawains Dolch bleibt möglich und überträgt Drachenkerbe nicht auf den Dolch.
- Aufheben mit Bonusaktion, Aktion, Reaktion und Besonderer Aktion. Fehlender Aura-Fokus
  wird korrekt abgewiesen; die vorhandenen Bögen haben keinen Aura-Vorrat. Die Bezahlung
  mit tatsächlich vorhandenem Aura-Fokus ist durch die ergänzenden Modelltests abgedeckt.
- Aufheben und Angriff im selben Beitrag, kein doppelter Bestandszuwachs, keine halbe
  Buchung bei Fehlern und keine doppelte Aufnahme bei parallelen Ansprüchen.
- Erzählerplatzierung, Benutzung neutraler Gegenstände, Verbrauch aus Szene und eigenem
  Inventar, Wiederholungsversuche, spätere Abhängigkeiten und Rücknahme.
- Drachenkerbe: +2 zusätzlicher Schaden beim kritischen Treffer, auch mit passender
  Kampftechnik und nach einem Besitzerwechsel; kein Bonus auf normale Treffer oder Dolche.
- Schuppenpolster: 1 Schadensreduktion beim ersten passenden Treffer pro angreifendem
  Beitrag, kein erneuter Schutz beim zweiten Treffer desselben Beitrags; neuer Beitrag
  aktiviert den Schutz wieder. Ablegen deaktiviert den Effekt.
- Vorschau und Server stimmen bei Schaden, TP und Ressourcen überein. Die gespeicherten
  Kampfblasen zeigen Drachenkerbe und Schuppenpolster mit ihren Zahlenwerten.
- Bestehende Kampfphasen ohne neue Regelversion erhalten keine nachträglichen Nebeneffekte.

Konsumieren verbraucht den Bestand und erhält vorhandene definierte Verbrauchseffekte.
Ein frei beschriebener Verband oder Heiltrank erhält dadurch keinen erfundenen Heilwurf.

## Prüfstand und Wiederholung

**37 Integrationsprüfungen bestanden**, zwei Figurenprüfungen wegen fehlender Bögen
ausgelassen; **182 ergänzende Tests bestanden**. Nach der letzten Profilnormalisierung
wurden die betroffenen Übergabe- und Inventartests erneut erfolgreich ausgeführt.
Browserprüfung für Desktop und Mobilansicht sowie Vite-Produktionsbuild erfolgreich.
Der Build meldet weiterhin die bereits vorhandenen großen Bundles.

Die Regressionen liegen in `firebase/functions/tests/integration/item-duel.integration.mjs`,
die isolierte Testumgebung in `item-duel-context.mjs`. Nach Start des lokalen Emulators:

```powershell
$env:FIRESTORE_EMULATOR_HOST = '127.0.0.1:8182'
npm --prefix firebase/functions run test:item-duels
```

Optional schreibt `ITEM_DUEL_REPORT` den Testbericht als JSON. Der Emulator muss das
separate Demo-Projekt verwenden; die Fixture setzt ausschließlich dieses Projekt zurück.
