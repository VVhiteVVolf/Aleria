# Vitalitätszuschlag für Stufen 1–30

Status: Am 06.09.2026 umgesetzt. Der Vitalitätszuschlag gilt für neue und migrierte Charakterbögen; Kreaturen werden nicht pauschal aufgewertet. Technische Umsetzung und Prüfung: [Charakterbogen-Checkup](CHARACTER_SHEET_CHECKUP_2026-09-06.md).

Trefferwürfel und Konstitutionsmodifikator bleiben erhalten. Hinzu kommt ein eigener Vitalitätszuschlag von ungefähr 25 % auf die regulären Lebenspunkte. Ein identischer Zuschlag von +2 für jede Klasse würde kleine Trefferwürfel stärker aufwerten als große und erreicht deshalb nicht überall das gewünschte Verhältnis.

## Berechnung

`K` ist der Konstitutionsmodifikator, `W` die Größe des Trefferwürfels, `D` der bisherige feste Aufstiegswert (`W / 2 + 1`, gegebenenfalls der vorhandene Durchschnitts-Override). `L` ist die Gesamtstufe einschließlich Sonderstufen.

```text
Regulärer Startwert S = max(1, W + K)
Regulärer durchschnittlicher Zuwachs Z = max(1, D + K)
Referenz-LP B(L) = S + (L − 1) × Z
Vitalität V(L) = aufrunden(B(L) / 4)

Stufe 1: W + K (mindestens 1) + V(1)
Aufstieg: Trefferwurf + K (mindestens 1) + [V(L) − V(L−1)]
```

Bei Verwendung des festen Durchschnitts sind die Gesamt-LP damit exakt das bisherige Ergebnis × 1,25, aufgerundet. Bei gewürfelten LP bleibt der Vitalitätszuschlag unabhängig vom einzelnen Wurf; der langfristige Zuwachs liegt ungefähr 25 % über dem bisherigen. Kleine Viertelreste werden über die Stufen verteilt und nicht bei jedem Aufstieg erneut aufgerundet. Es gibt keine zusätzliche Zufallsentscheidung und keinen Multiplikator auf bereits erhöhte LP.

## Beispiel: W10, Konstitution +2

Der reguläre Startwert ist 12, der feste reguläre Zuwachs 8. Vitalität gewährt +3 auf Stufe 1 und danach stets +2 pro Aufstieg. Ein gewürfelter Aufstieg ergibt daher weiterhin `1W10 + 2`, zusätzlich die festen `+2 Vitalität`. Die feste Alternative ergibt `6 + 2 + 2 = 10 LP`.

| Gesamtstufe | Bisher mit Durchschnitt | Vitalität | Neue LP |
|---|---:|---:|---:|
| 1 | 12 | 3 | 15 |
| 5 | 44 | 11 | 55 |
| 10 | 84 | 21 | 105 |
| 20 | 164 | 41 | 205 |
| 21 | 172 | 43 | 215 |
| 25 | 204 | 51 | 255 |
| 30 | 244 | 61 | 305 |

Bei W6 und Konstitution +2 ist der reguläre Zuwachs 6; der Vitalitätszuschlag wechselt zwischen +2 und +1. Das ergibt im Mittel +1,5 statt eines pauschalen, hier zu hohen +2. Für W12 und Konstitution +3 beträgt er wechselnd +3/+2, im Mittel +2,5.

## Stufen 21–30 und Konstitution

Die Sonderstufen setzen dieselbe LP-Regel fort: Gesamtstufe = reguläre Stufe + Sonderstufen. Es gibt auf Stufe 21 keinen zweiten vollen Startwürfel und keine Verdopplung. Individuelle Meisterboni bleiben getrennte, ausdrücklich vergebene Effekte.

Wenn der Konstitutionsmodifikator steigt, werden reguläre Konstitutions-LP und der zugehörige Vitalitätsanteil konsistent für die bereits erreichten Stufen neu berechnet. Das gilt auch für die zusätzlichen Attributssteigerungen der Sonderstufen. Eine Senkung reduziert dieselben Anteile wieder. Temporäre Konstitutionsänderungen und manuell festgesetzte Maximalwerte benötigen klar ausgewiesene Herkunft, damit sie keine dauerhafte Erhöhung erzeugen.

## Geplante technische Einbindung

- Eine gemeinsame reine Berechnung für Charakterbogen, Erstellung, manuellen Stufenwechsel, Aufstiegsdialog, Kampfvorschau und Server; keine separate Prozentrechnung in der Anzeige.
- Basis-LP und Vitalitätsanteil getrennt speichern/ausweisen. Manuelle Maximalwerte bleiben explizite Overrides und werden nicht bei jedem Laden oder Aufstieg erneut multipliziert.
- Bestehende Figuren einmalig migrieren: alten Maximalwert als Basis behalten, zunächst `aufrunden(Basis / 4)` ergänzen. Beispiel Gawain 39 → 49, Gildas 52 → 65, Rhiannon 20 → 25. Bei Overrides wird der anfängliche Zuschlag als Migrationsbasis gespeichert; weitere Aufstiege ergänzen nur den jeweiligen neuen Vitalitätszuwachs. Wunden bleiben als fehlende LP erhalten; Figuren bei 0 LP werden nicht durch die Migration wiederbelebt.
- Für reguläre Nicht-Override-Profile gilt unmittelbar die Formel oben. Gegenstände, temporäre LP, Heilung und Schadenswürfel erhalten keinen automatischen Zuschlag.
- Nach Umstellung Vergleichskämpfe mit unveränderten Angriffen auf Stufen 1, 5, 8, 10, 15, 20, 25 und 30: frühe Ausfälle, kritische Treffer, Aura-Zahlungen, Heilung und konzentrierte Gruppenangriffe prüfen.

Die bisherigen technischen Kampftests belegen keine Balance aller Stufen. Der Zuschlag soll zusätzliche Entscheidungen ermöglichen; seine endgültige Höhe folgt aus den Vergleichskämpfen.
