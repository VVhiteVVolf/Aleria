# Gemeinsame tirnarische Sprachgeschichte und Phalantia

Die neuere Nutzerfestlegung vom 4. November 2026 ist in den aktiven
Sprachmodulen und in Phalantias Landesgeschichte eingearbeitet. **Orin**
verwirrt die Zungen der von Zarakhul unterjochten Völker; eine pauschale
Versklavung aller Einwohner Tirnaras ist daraus nicht abgeleitet.

`changes.json` dokumentiert 18 gezielt geänderte Inhaltsfelder in vier
aktiven Dateien mit Vorher-/Nachhertext und Dateihashes. Der frühere Text
lässt sich im Prüfverfahren rein im Speicher rekonstruieren.
`apply-lore-revision.py` enthält den gezielten, idempotenten Bearbeitungsschritt.
Er ist für diesen Ausgangsstand bestimmt und ersetzt keinen allgemeinen
Migrationseinstieg. Die README-Ergänzung Phalantias und die neue zentrale
Herkunftsdokumentation gehören ergänzend zum Auftrag.

## Prüfung

`verify-lore-revision.mjs` lädt die wirklichen fünf aktiven Spracheinträge
(Kana’anith, Infernal, Stoicheia, Lingua Argenti und Tirghan) vor und nach den
gezielten Textänderungen. Abseits der freigegebenen Erzählfelder müssen die
vollständigen Laufzeitdaten einschließlich Grammatik und Namens-/Schrifttabellen
identisch bleiben. Alle neuen Abschnitte überleben die bestehende
Sprachmodul-Editorbegrenzung. Sechzehn zusätzlich geschützte Quellen sind
hashgleich; Phalantias politische Ordnung, Eheentwurf, Kultur außerhalb des
Glaubensabsatzes, Häuser, Stände, Krieger und Kartenkennungen sind unverändert.

13 bestehende Fach-/Regressionstests bestanden. Der erste `node --test`-Aufruf
konnte wegen `spawn EPERM` im Sandboxkontext keine Kindprozesse starten. Der
erneute Lauf importierte dieselben vier vorhandenen Suiten innerhalb eines
Node-Prozesses; alle 13 Tests bestanden. Die anfänglichen Umgebungsbelege sind
in den beiden früheren TAP-Dateien erhalten, das gültige Ergebnis steht in
`regressions-in-process.tap` und `verification.json`.

```powershell
node diagnostics/klythesia-expansion-20261104/language/verify-lore-revision.mjs
```

Keine historischen Originalpakete, Altinventare, kanonischen Familienakten
oder Firebase-Daten geändert. Kein Push oder Deploy.
