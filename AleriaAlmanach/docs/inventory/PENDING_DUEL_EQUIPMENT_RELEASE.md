# Freigegebene Ausrüstungsübernahme mit Erhalt des Duells

Die anfängliche Veröffentlichungssperre wurde am 22. September 2026 ausdrücklich
aufgehoben. Alle Änderungen sollen veröffentlicht werden. Bereits ausgewürfelte
Ergebnisse bleiben unverändert; neue Handlungen verwenden den neuen Regelstand.

| Figur / Gegenstand | Verbesserung | Zusatzeffekt | Handelspreis |
| --- | --- | --- | --- |
| Gawain / Drachenzahn | +1 Waffenschaden | Drachenkerbe: +2 Schaden bei kritischen Treffern mit dieser Waffe oder ihren Kampftechniken, nicht nochmals verdoppelt | 5.500 KT |
| Gawain / Silberschuppe | Kein RK-Bonus | 2 Schaden weniger gegen Hieb und Stich, pro Schadensinstanz | 8.800 KT |
| Gildas / Pflichtschwur | +1 Waffenangriff und +1 Waffenschaden | Kein zusätzlicher kritischer Ausrüstungseffekt | 5.500 KT |
| Gildas / Gafyr-Plattenrüstung | Kein RK-Bonus | 2 Schaden weniger gegen alle Schadensarten außer Stich, pro Schadensinstanz | 8.800 KT |

Die letzte Nutzervorgabe ersetzt ausdrücklich Schuppenpolster, Wachtstellung und
Gildas' Drachenkerbe. Beide Rüstungen behalten Basis-RK 16 und ihre bestehende
Rüstungsroutine; der zwischenzeitliche +1-RK-Bonus entfällt vollständig.
Der Rüstungsschutz wirkt ausschließlich angelegt und kostet keine Aktionsressource.
Er gilt anhand des tatsächlichen Schadenstyps auch für Zauberschaden. Bei gemischten
Effekten wird jede Schadenskomponente separat behandelt. Reihenfolge: Rettungswurf,
Resistenz/Verwundbarkeit, flache Rüstungsreduktion, temporäre LP und LP. Mindestens
0 Schaden; mehrere solche Rüstungsteile stapeln ihren Schutz nicht, es zählt der
höchste passende Betrag. Natürliche kritische Treffer bleiben kritisch.

Die Regeln liegen jeweils sowohl an der Inventarinstanz als auch am verknüpften
Waffen-/Rüstungseintrag im Kampfprofil. Itemkarten lesen dieselben Regeln.
Die versionierten Exporte speisen die lokale Charakterdatenbank samt Archiv.

## Übernahmeschritt

1. Aktuellen Online-Stand sichern und den laufenden Kampf abgleichen.
2. Änderungen veröffentlichen; Ausrüstung zusätzlich gezielt anhand der bestehenden
   Inventar-/Ausrüstungs-IDs abgleichen. Keine ganzen veralteten Charakterbögen importieren.
3. Live-Lebenspunkte, verbrauchte Ressourcen, Zustände, Geldbeutel und inzwischen
   erworbenen/verlorenen Besitz erhalten. Fehlende oder übertragene Ausrüstung nicht
   neu erzeugen; die aktuelle Eigentümerinstanz berücksichtigen.
4. Preise und Effekte in beiden Online-Inventaren, Kampfbögen und Registeransichten
   kontrollieren. Alte Kampfbeiträge bleiben gespeicherte Auswertungen.
5. Rücknahmen alter Beiträge berücksichtigen: Ihre gespeicherten Vorher-Zustände
   dürfen neue Ausrüstungsdaten nicht unbemerkt wieder auf den alten Stand setzen.

Die allgemeinen W10-Nebeneffekte werden für das laufende Duell durch eine neue
administrative `combat-rules-release`-Grenze aktiviert. Die vorherigen 71 Beiträge
werden ausschließlich gelesen und durch Update-Zeit-Prüfungen geschützt. Der
Grenzeintrag schreibt weder TP noch Ressourcen oder Zustandsdauern fort.
Alte Rücknahmen über diese Grenze sind auch im erzwungenen Modus gesperrt;
Rücknahmen neuer Beiträge bleiben möglich. Gildas' tatsächliche Online-ID ist
`person--haus-gafyr--gildas-gafyr`; niemals einen zweiten Online-Charakter unter
der lokalen Export-ID anlegen. Doppelte Inventarzeilen derselben Gegenstands-ID
werden ohne Vervielfachung oder Addition ihrer Anzahl zusammengeführt.
