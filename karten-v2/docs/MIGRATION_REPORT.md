# Migration Report

Ausgefuehrt: 2026-08-01T04:28:08.481Z

## Strukturelle Daten (aus Karten/-Quellcode transkribiert, siehe LEGACY_AUDIT.md)

| Datensatz | alte Anzahl | migrierte Anzahl |
| --- | ---: | ---: |
| Kartenregistry-Eintraege | 13 | 13 (13 aus Legacy + 1 zusaetzlich verdrahtet: cenyr-graue-weite, siehe unten) |
| Kategorien | 20 | 20 |
| Marker-Katalog-Eintraege | 74 | 74 |
| Pin-Vorlagen | 6 | 6 |
| Aktive Karten mit echtem Bild | 1 (Celtigerns Wacht) | 2 (Celtigerns Wacht + Graue Weite, siehe LEGACY_AUDIT.md Abschnitt 8) |

## Pins / konkrete Orte

- **Celtigerns Wacht** (`cenyr-celtigerns-wacht`): 99 Pins migriert, 0 fehlgeschlagen, 20 Kategorien aus dem Export uebernommen, 0 Eintraege bewusst uebersprungen. Ergebnis: `data/maps/cenyr-celtigerns-wacht/locations.json`.
- **Graue Weite** (`cenyr-graue-weite`): kein lokaler Export unter `data/legacy-export/cenyr-graue-weite.json` gefunden -> 0 Pins migriert. Alte Anzahl unbekannt (nur live in Firestore einsehbar, siehe LEGACY_AUDIT.md Abschnitt 5).

## Zusammenfassung

- Migrierte Pins gesamt: 99
- Fehlgeschlagene Pins gesamt: 0
- Bewusst nicht uebernommen: DM-Sitzungen/Notizen/Gruppenstatus, LSB-Reisegruppen/Routen/Kalibrierung, Stempel-/Ueberschreiben-Werkzeug-Daten - siehe FEATURE_PRESERVATION_MATRIX.md fuer die Begruendung je Funktion.

## Naechster Schritt fuer echte Pin-Daten der verbleibenden Karten

### Graue Weite (`cenyr-graue-weite`)

1. Das alte Kartenmodul lokal oeffnen: `Karten/karte.html?map=cenyr-graue-weite` (falls es dort noch keine eigene Karte gibt, entfaellt dieser Weg - dann gibt es aktuell keine bekannte Quelle fuer echte Pins).
2. Editormodus aktivieren (Passwort siehe `Karten/assets/js/karto-app.js`).
3. "📦 Daten" -> "⬇ Exportieren" -> JSON herunterladen.
4. Datei speichern als `karten-v2/data/legacy-export/cenyr-graue-weite.json`.
5. Pruefen, ob die Datei sauberes UTF-8 ist (siehe Hinweis unten) - dann `npm run migrate:legacy` erneut ausfuehren.

## Hinweis zu Zeichenkodierung

Der Celtigerns-Wacht-Export kam mit einem Mojibake-Problem an (UTF-8 wurde als Latin-1 gelesen, z. B. "FÃ¼hrung" statt "Führung"). Das wurde vor der Migration behoben, siehe `docs/KNOWN_LIMITATIONS.md`. Ein neuer Export einer anderen Karte kann dasselbe Problem haben - vor dem Ausfuehren von `npm run migrate:legacy` stichprobenartig auf sowas wie "Ã¼"/"Ã¶"/"Ã¤" in der Datei pruefen.
