# Mechanik-Sicherheit und Betrieb

Stand: 4. August 2026

## Ziel und Vertrauensgrenze

Die Weboberfläche beschreibt die gewünschte Handlung und liefert einzelne sichtbare Würfelergebnisse. Sie ist nicht die Autorität für Treffer, Schaden, TP, Inventar, Rast, Tagesressourcen oder Kosten. Zustandsändernde Mechanik wird in Firebase Functions aus gespeicherten Profilen und vertrauenswürdiger Historie neu berechnet und gemeinsam mit einem unveränderlichen Kommentar geschrieben.

AleriaGPT formuliert erst nach dieser Transaktion eine Erzählung. Die nachträgliche Narration darf ausschließlich das dafür vorgesehene Textfeld des bereits festgeschriebenen Mechanikbelegs ergänzen. Sie kann keine Würfelwerte, TP, Ressourcen oder Inventare ändern.

## Serverpfade

| Vorgang | Callable Function | Autoritative Änderungen |
| --- | --- | --- |
| normaler Kommentar, Szenenwürfel, Zeitereignis | `commitNarrativeComment` | unveränderlicher Audit-Beleg, keine persistenten Mechaniken |
| Fertigkeitsauswertung | `commitSkillComment` | servergeprüfter Fertigkeitswurf, Herausforderung und strukturierter Regelbeleg |
| Kampf, Zauber, Fähigkeitsnutzung, Konsumieren im Kampfkommentar | `commitCombatComment` | Treffer, Schaden, TP, temporäre TP, Kosten, Nutzungen, Inventar |
| lange oder kurze Rast | `commitSceneRest` | TP und zulässige Erholungen anhand des tatsächlichen Szenentags |
| Kampf beginnen, Teilnehmer ändern oder beenden | `commitCombatEncounter` | Parteien, Profil-Sperren, Kampfstatus und automatische EP-Vergabe |
| Übergabe zwischen Inventaren | `commitInventoryTransfer` | beide gespeicherten Inventare und ein gemeinsamer Audit-Beleg |
| KI-Narration nach Kampf oder Fertigkeitswurf | `finalizeCombatNarration` | ausschließlich Narrationsfelder des festgeschriebenen Kommentars |
| Backup-Import | `importBackupRecords` | moderierter Import; Profile sind Zustandsautorität, alte Mechanik bleibt Historie |
| Rollenverwaltung | `setAleriaRole` | Firebase Custom Claim und Rollenbeleg, nur durch Administratoren |

Direkte Browser-Erstellung von Dokumenten in `comments` ist durch die Standard-Firestore-Regeln vollständig gesperrt. Normale, vom Server angelegte Erzählkommentare bleiben für ihren Eigentümer oder die Moderation editierbar. Kommentare mit Kampf-, Rast-, Inventar-, Zeit-, Würfel- oder Fertigkeitsmechanik sind selbst für Moderatoren append-only. Korrekturen benötigen künftig eine eigene Gegenbuchung.

## Mechanische Invarianten

- Der Server liest das aktuelle Akteurs- und Zielprofil erneut; vom Client übermittelte Profilkopien sind keine Zustandsquelle.
- Einzelne Würfelaugen werden auf Anzahl und Wertebereich geprüft. Summen und Modifikatoren werden serverseitig neu berechnet.
- Aktuelle TP fallen bei fehlendem Wert auf maximale TP zurück; `null` wird nicht mehr als echte `0` interpretiert.
- Aktion, Bonusaktion und Reaktion werden beim ersten eigenen Mechanikabschnitt eines neuen Gesamtkommentars aufgefüllt. Ein früherer Angriff auf die Figur verbraucht diesen Reset nicht.
- Begrenzte Fähigkeitsnutzungen werden bei Auswahl von `ability:<id>` tatsächlich verringert und bei null abgewiesen.
- Zauberplätze der Grade I bis X sind persistente Langrast-Ressourcen. Bestehende benutzerdefinierte Slot-IDs werden anhand ihres Grades erkannt und auf diese Erholungsregel normalisiert; Zaubertricks verbrauchen keinen Platz.
- Eine lange Rast ist kein Tageswechsel. Tagesressourcen erholen sich nur, wenn die vertrauenswürdige Szenenzeit einen neuen Aleria-Tag erreicht hat.
- Kurze und lange Rasten müssen ihren Mindestzeitraum von einer beziehungsweise acht Stunden auch im servergeprüften Szenenzeitanker tatsächlich voranschreiten lassen; rückwärts datierte Rastbelege werden verworfen.
- Alte Tagesressourcen und Tagesfähigkeiten ohne bisherigen Tagesschlüssel werden beim ersten serverseitigen Kontakt einmalig auf ihr Maximum initialisiert und an den aktuellen Szenentag gebunden. Danach gilt ausschließlich der echte Tageswechsel.
- Auren unterscheiden Selbst, Verbündete und Gegner. Eine Aura ohne gültigen Radius oder außerhalb der angegebenen Entfernung wird nicht angewendet.
- Strukturierte Auslöserregeln werden nach Phase, Aktionsart, Beziehung, Empfänger, Radius und Häufigkeit neu geprüft. Ein vom Client behaupteter Reaktionsbonus ohne passende Profilregel wird verworfen.
- Reaktionskosten und begrenzte Fähigkeitsnutzungen werden auf dem Profil der tatsächlichen Regelquelle verbucht. Fremde Spielerfiguren benötigen Controller- oder Moderationsrechte.
- Fertigkeitsproben laden Akteur, Gegenspieler und ausgewählte Unterstützer. Gegnerische Aura, Zustände, Eigenschaften und Reaktionen gelten ebenso wie eine echte passive Gegenfertigkeit; erfolgreiche verdeckte Herausforderungen werden atomar beansprucht und können weder vom Autor selbst noch gleichzeitig mehrfach enthüllt werden.
- Während einer aktiven Kampfankündigung sperren Firestore-Regeln nur `combatProfile` und `inventory` der beteiligten Vorlagen. Andere Profildaten bleiben editierbar. Bei mehrfach verwendeten Kreaturenvorlagen bleibt die Sperre bestehen, bis die letzte aktive Instanz ausgeschieden ist.
- Vollständige Profil-Snapshots werden nur für die unmittelbare Narration im Browser gehalten. Vor Transport und Firestore-Speicherung werden sie durch stabile Profilreferenzen und kompakte, autoritative Vorher-/Nachher-Belege ersetzt.
- Freie Notizen, Beschreibungen und KI-Hinweise dürfen keine serverseitig bestätigten Zahlen oder Ergebnisse überschreiben.
- Rettungszauber speichern den würfelnden Beteiligten und das Rettungsattribut. Temporäre TP werden vor, nach und als absorbierter Anteil im KI-Kontext geführt.
- Importierte historische Mechanik überschreibt keinen Live-Zustand. Der importierte Profil-Snapshot ist die Fortsetzungsbasis.

## Authentifizierung und Rollen

Der Almanach startet eine anonyme Firebase-Sitzung. Besitz wird über `ownerUid` beziehungsweise `createdBy` gebunden. Höhere Rechte stammen ausschließlich aus dem Custom Claim `aleriaRole` mit den Werten `editor`, `moderator` oder `admin`; ein UI-Code oder ein frei geschriebenes Rollenfeld verleiht keine Firebase-Rechte.

- `player`: eigene Profile und normale eigene Kommentare.
- `editor`: zusätzlich gemeinsam gepflegte Charakter-/Kreaturprofile und Registerdaten.
- `moderator`: zusätzlich Imports, Löschungen normaler fremder Kommentare und operative Moderation.
- `admin`: zusätzlich Rollenvergabe über `setAleriaRole`.

Vor Produktion muss anonyme Anmeldung in Firebase Authentication aktiviert sein. App Check ist in den neuen Callables zunächst nicht erzwungen, damit der bestehende Client migriert werden kann. Nach einer Beobachtungsphase sollte App Check aktiviert und anschließend `enforceAppCheck` schrittweise auf `true` gesetzt werden.

Der erste Administrator muss einmalig über die Firebase-Admin-Umgebung beziehungsweise die Google Cloud Console als Custom Claim gesetzt werden; `setAleriaRole` kann sich absichtlich nicht selbst zum Administrator machen. Bereits vorhandene Profile ohne `ownerUid` müssen vor dem öffentlichen Rollout durch diesen Administrator einem Eigentümer oder passenden `controllerUids` zugeordnet werden. Bis dahin können nur Editor, Moderator oder Administrator diese Altprofile verändern oder in serverseitigen Mechanikaktionen führen. Das verhindert eine unsichere „wer zuerst klickt, besitzt die Figur“-Übernahme.

## Sichere Rollout-Reihenfolge

Die Reihenfolge verhindert, dass neue Firestore-Regeln einen alten Client ohne verfügbare Functions aussperren:

1. Backup der produktiven Firestore-Daten und Prüfung des Rollback-Plans.
2. Anonyme Firebase-Anmeldung aktivieren.
3. Firebase Functions ausrollen und Health-/Callable-Smoke-Tests durchführen.
4. Standard-Firestore-Regeln und Indizes ausrollen.
5. Almanach-Webbuild ausrollen.
6. Cloudflare Worker mitsamt Durable-Object-Migration, Authentifizierung und Budgets ausrollen.
7. Einen normalen Kommentar, einen Kampf, eine Rast, einen Inventartransfer und eine AleriaGPT-Narration mit einem Testprofil prüfen.
8. Erst danach alte Client-Versionen aus Caches entfernen.

Die Functions befinden sich aktuell im bestehenden Firebase-Codebase-Verzeichnis `firebase/functions`. Der historische Codebase-Name `family-trees` in `firebase.json` umfasst deshalb sowohl Stammbaum- als auch Almanach-Functions; eine spätere Trennung ist möglich, sollte aber als eigenes Deployment-Projekt erfolgen.

## Lokale Abnahme

```powershell
cd E:\Aleria\AleriaAlmanach
npm test
npm run build

cd E:\Aleria\firebase\functions
npm test

cd E:\Aleria\firebase
npm run test:rules

cd E:\Aleria\AleriaAlmanach\ausgeklammert\aleria-gpt\backend\aleria-gpt-worker
npm test
```

Die Brandhof-Suite ist kein statischer Textvergleich: Sie lädt die sechs hinterlegten Kreaturvorlagen, führt mit dem produktiven Regelkern Treffer, Schaden, TP und Dialogabschnitte bis zum Sieg eines Teams aus und prüft den endgültigen Zustand. Der Browser-Smoke-Test soll ergänzend Auswahl, Bezahlen, Eintragen und die historische Kampfdatenansicht prüfen; er ersetzt die serverseitigen Tests nicht.

## Beobachtung und Alarmierung

Für den Produktionsbetrieb sollten mindestens überwacht werden:

- Functions-Fehlerquote und Latenz je Callable;
- abgewiesene Auth-, Besitz- und Würfelvalidierungen;
- Firestore-Dokumentgröße und Transaktionskonflikte;
- Cloudflare-429 nach Benutzer-, IP- und Tagesbudget;
- OpenRouter-Verbrauch und Provider-Budgetwarnungen;
- Narrationen, die nach erfolgreicher Mechaniktransaktion nicht finalisiert wurden.

Eine fehlgeschlagene KI-Narration darf niemals die Mechanik zurückrollen. Der Kommentar bleibt mit deterministischer Ersatzbeschreibung und allen endgültigen Zahlen lesbar.

## Noch offene Härtung

- App Check nach Messphase verpflichtend machen.
- echtes Staging-Projekt mit separaten Secrets, Daten und Worker-Budgets einrichten.
- Gegenbuchungs-UI für falsche mechanische Belege ergänzen.
- Produktions-E2E mit Auth- und Functions-Emulator in CI ausführen; der aktuelle Brandhof-Test deckt den Regelkern vollständig, aber nicht den realen Browser-Firebase-Transport ab.
- Rollenänderungen und mechanische Gegenbuchungen in eine eigene, durchsuchbare Audit-Ansicht aufnehmen.
- Codebase-Namen der gemischten Firebase Functions in einer kontrollierten Migration bereinigen.
- Die heute noch vollständig geladene Szenenhistorie durch einen transaktionalen Firestore-Szenenprojektor ersetzen. Dieser soll aktuellen Kampfzustand, Regelhäufigkeiten, letzten Szenentag, aktive Begegnung und die drei jüngsten verdeckten Herausforderungen checkpointen. GitHub bleibt Archiv und Registry, ist aber wegen fehlender Firestore-Transaktionen keine geeignete Live-Zustandsquelle.
- Die reservierten Lebenszyklusphasen `on-combat-start`, `on-combat-end` und frei wirkende Kanalisierungs-Folgewirkungen an diesen Szenenprojektor anbinden.
