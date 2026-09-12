# Gelehrte Schule Elemente – Balancefassung 2

Diese Fassung setzt die Korrektur des Nutzers vom 12. September 2026 um: Das Zauberverzeichnis gehört zur **gelehrten Schule Elemente**, nicht zum druidischen Elementarismus. Die PDF-Fassung ist Ausgangsmaterial, kein verbindliches Regelsystem. Ein separates druidisches Verzeichnis folgt später.

## Umfang

120 Zauber in sieben Sektionen: Feuer 20, Wasser 20, Wind 16, Donner 14, Blitz 14, Erde 20 sowie Sonstiges & Zusammenspiel 16. Hinzugekommen sind sechs Zauber pro Element, bei Donner und Blitz jeweils zwölf. Jede Ausrichtung hat mindestens sechs neue Optionen auf den mittleren Graden 2–5. Bestehende Rituale zur Formung von Material oder Wetter bleiben als studierbare Elementarwirkungen erhalten; „Bund der Jahreszeiten“ heißt nun „Klimatischer Gleichklang“.

Die Regeln liegen nach Element getrennt in `AleriaAlmanach/modules/spell-catalog/elemente-v2/`. Es sind vollständige, ausdrücklich ausgearbeitete Fassungen. Zur Laufzeit wird kein Grad aus dem Schaden errechnet und kein Zauber aus alten Regeln zusammengesetzt.

## Balanceleitplanke

| Zauber | Grundgrad | Grundschaden | Mana | Aktionskosten | Höhere Formen |
| --- | --- | --- | --- | --- | --- |
| Feuerball | 2 | 3W6 Feuer | 3 | Aktion + Reaktion | Grad 3: 4W6; 4: 5W6; 5: 6W6; 6: 7W6 |
| Großer Feuerball | 7 | 8W6 Feuer | 10 | Aktion + Besondere Aktion + Reaktion | Grad 8: 9W6; 9: 10W6 |
| Blitzbahn | 2 | 3W6 Blitz | 3 | Aktion + Reaktion | Wie der kleine Feuerball, maximal 7W6 |
| Große Blitzbahn | 7 | 8W6 Blitz | 10 | Aktion + Besondere Aktion + Reaktion | Grad 8: 9W6; 9: 10W6 |
| Eislanze | 3 | 3W8 Kälte | 5 | Aktion + Reaktion | Grad 4: 4W8; 5: 5W8 |
| Große Eislanze | 6 | 6W8 Kälte | 9 | Aktion + Besondere Aktion | Grad 7: 7W8; 8: 8W8 |
| Donnerkuppel | 3 | 4W6 Donner | 5 | Aktion + Reaktion | Grad 4: 5W6; 5: 6W6 |
| Große Donnerkuppel | 6 | 7W6 Donner | 9 | Aktion + Besondere Aktion | Grad 7: 8W6; 8: 9W6 |
| Großer Hagelsturm | 6 | 4W6 Wucht + 3W6 Kälte | 9 | Aktion + Besondere Aktion | Grad 7: 4W6 + 4W6; 8: 5W6 + 4W6 |

Die Tabelle zeigt Grundkosten; höhere Formen haben eigene, im Katalog ausgewiesene Pakete. Großformen werden separat gelernt. Die kleine Feuerkugel bleibt bei 3 m Radius, die große wirkt auf 6 m. Ein kleiner Zauber erweitert nicht nebenbei Reichweite, Fläche, Dauer und Zielzahl.

Die gemeinsame Manastaffel bleibt unverändert: Grade 0–9 kosten 1, 2, 3, 5, 6, 7, 9, 10, 11 und 13 Mana. Die höheren Grade erhöhen damit zugleich Manakosten und erforderliche Charakterstufe. Besondere Aktionen bleiben eine dauerhafte Ressource. Die Aktionspakete folgen `AGENTS.md` und werden nach Rolle gewählt: kurze Tricks, direkte Angriffe, Vorbereitung, Reaktionen und starke Flächen sind unterschiedlich bepreist.

Für normale Flächenschäden gilt als Orientierung eine allmähliche Steigerung von 3W6 auf Grad 2 bis 8W6 auf Grad 7. Das ist keine starre Formel. Einzelzielangriffe dürfen höhere Würfel haben, weil sie bei Verfehlen vollständig ausfallen. Wetter- oder Materialvoraussetzungen, kurze Reichweite und Vorwarnung schränken manche Zauber ein. Zusätzliche Kontrolle oder wiederholte Kontakte rechtfertigen höhere Kosten auch bei weniger Sofortschaden.

Die früher sehr hohen Verstärkungen wurden ebenfalls überarbeitet: Großer Brandkreis beginnt erst auf Grad 8 mit 9W6, Magmabett auf Grad 8 mit 8W6. „Sturm der vereinten Kräfte“ benötigt Grad 9 und verursacht drei getrennte Pulse mit je insgesamt 5W6; Folgepulse benötigen weiterhin eigene Aktionen und fortbestehende Konzentration. Es gibt keine kostenlose Sofortentladung beim Anlegen.

## Charaktere und ältere Fassungen

- `Magie/elemente/index.html` und das Archiv verwenden Fassung 2. Die Magie-Hauptseite verlinkt sie ausschließlich unter der gelehrten Schule Elemente.
- Fassung 1 ist unverändert im Datenregister erhalten. Ihre frühere URL bleibt als deutlich gekennzeichnete Archivseite lesbar. Die Seite stellt keine neue druidische Zauberliste dar.
- Bestehende Katalog-IDs mit dem historischen Präfix `elementarismus-` bleiben stabile technische Identitäten. Zusammen mit `revision: 2` verweisen sie auf die neue Regelversion. Neue kleinere Zauber besitzen eigene IDs mit `elemente-`.
- Ein vorhandener Charakter mit `catalogReference: { id, revision: 1 }` behält Werte, Namen, Kosten und höhere Formen seiner alten Fassung. Es gibt keine Namensmigration, Massenänderung oder Ersetzung von Rhiannons profilgebundenen Zaubern.
- Ohne explizite Revision liefern Katalogabfragen die aktuelle Vorlage. Mit expliziter Revision wird ausschließlich diese Fassung aufgelöst. Archivvorlagen, Karten, Sprechblasen, Kampf und Server verwenden dieselben Funktionen.
- Die getrennten Archivschlüssel erlauben alte und neue Fassungen nebeneinander. Das Hinzufügen einer neuen Vorlage ersetzt einen bereits gelernten Zauber nicht automatisch. Eigene Bearbeitungen werden weiterhin als unabhängige Ableitungen behandelt.

## Grenzen und Prüfung

Die vorhandene Auflösung berechnet direkten Schaden, Rettungen, höhere Formen und Kosten. Positionen, Linien, Reaktionsauslöser, Material, Schutzvorräte und spätere Kontakte prüft die Spielleitung. Neue Reaktionszauber besitzen einen konkreten Auslöser; sie können nicht als beliebige kostenlose Zusatzangriffe verwendet werden. Es wurden keine neuen globalen Nässe-, Metall-, Stille- oder Zustandsregeln eingeführt. Fehlende passende BG-Icons bleiben leer.

Automatische Prüfungen: `AleriaAlmanach/tests/elemente-balance.test.mjs`, die bisherigen Regressionstests für Fassung 1, `Magie/tests/spell-list.test.mjs` und `firebase/functions/tests/spell-catalog.test.js`. Die Mini-Kämpfe prüfen kleinen und Großen Feuerball, Gegenknall, Rückentladung und Schutzwürfe einschließlich tatsächlicher Ressourcenabbuchung, halbem Schaden nach Rettung und gesperrten Graden. Der Serververgleich umfasst beide Fassungen und sämtliche höheren Formen.

Prüflauf vom 12. September 2026: Produktionsbuild bestanden; 95/95 Servertests, 9/9 Magieseitentests und 726/727 Almanachtests bestanden. Der verbleibende Fehler betrifft die bereits zuvor fehlschlagende Limita-Rüstungsroutine. Die Browserprüfung umfasst 120 Einträge, Suche, Filter, Tastatur, höhere Formen, Druck, sämtliche Bilder, fünf Breiten von 320 bis 1440 Pixeln sowie Navigation, Archiv, Charakterkarten und die alte Archivadresse. Direktlinks anhand einer Katalog-ID zeigen exakt die aktuelle Vorlage, auch wenn andere Zauber deren Namen in ihrer Beschreibung erwähnen.

Die Website und die generierten Firebase-Mechaniken müssen gemeinsam veröffentlicht werden. Der Push allein stellt keine Firebase Functions bereit. Die langfristige Balance über ganze Spielsitzungen muss weiterhin anhand tatsächlicher Nutzung beurteilt werden.
