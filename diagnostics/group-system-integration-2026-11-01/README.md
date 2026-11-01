# Lokale Gruppenoberflächenprobe

`ui-server.mjs` ist ausschließlich ein Diagnoseadapter für die produktiven Gruppenoperationen. Er startet nur mit `FIRESTORE_EMULATOR_HOST=127.0.0.1:8187`, nutzt fest `demo-aleria-group-ui`, bindet an `127.0.0.1:8879` und erlaubt nur die Browser-Origins `http://127.0.0.1:8765` und `http://localhost:8765`. Nur eine tatsächlich passende Origin wird zurückgesendet. Er besitzt keine Produktionsschlüssel. Andere Projekte, vorhandene Emulatoren und echte Onlinewerte werden nicht verändert.

Die feste Testgruppe `gawain-duncan` stammt aus ihrer geprüften öffentlichen Modulquelle. Gawain, Duncan und Ylva sind öffentliche Snapshotkopien, Freki, Tanor und Carreg stammen aus dem öffentlichen Kreaturkatalog. Bereits vorhandene Testfiguren werden beim Neustart erhalten. Das eigene neue Gruppenkonto beginnt mit 50 Kupfer; Rationen, Stahlschwert und Heiltränke werden über echte idempotente Gruppen-Grantoperationen eingebucht.

- `GET /state`: aktuelles Konto und die sechs festen Testdatensätze.
- `GET /record?kind=characters|creatures&id=…`: einer dieser festen Datensätze.
- `GET /definition?id=…&revision=…`: bekannte Standarditemrevision.
- `POST /commit`: echte `commitGroupInventoryOperation`, feste Gruppe und Mitglieder; Antwort/Fehler als JSON.

Kein Reset, keine globale Projektlöschung, kein Deploy und kein Ersatz für Firebase-Anmelde-/Sicherheitsregelprüfungen. Die Browserprobe verwendet eine ausdrücklich lokale Moderator-Testidentität. Start aus dem Repository: `$env:FIRESTORE_EMULATOR_HOST='127.0.0.1:8187'; node diagnostics/group-system-integration-2026-11-01/ui-server.mjs`.
