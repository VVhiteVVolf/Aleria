# Combat-/Item-Prüfung vor Veröffentlichung, 1. November 2026

Status: Die unten belegten Freigabeblocker sind behoben. Die abschließenden Prüfungen liefen erneut nach dem letzten gemeinsamen Quellen-Freeze einschließlich der expliziten Inventar-Ausrüstungswechsel. Keine offenen Blocker in diesem abgegrenzten Prüfbereich. Veröffentlichung, Produktionsdatenabgleich und allgemeine Releasegates verantwortet Root separat.

## Behobene, tatsächlich reproduzierte Fehler

### P1 — Geld und Besitzübergaben konnten unbeteiligte Ausrüstung verändern

Auslöser: Eine gespeicherte Profilwaffe war ausgerüstet, ihr älterer Inventareintrag enthielt noch `equipped:false`. Eine reine Geldübergabe setzte die gehaltene Waffe ab; bei einem Empfänger ohne Kampfbogen wurden leere Ausrüstungslisten samt Kampfrevision erzeugt. Dieselbe Vorabnormalisierung ließ außerdem die Prüfung „erst ablegen, dann übergeben“ ins Leere laufen. Ein zweiter roter Fall zeigte dieselbe Nebenwirkung beim Zusammenführen identischer alter Waffenstapel.

Korrektur: `firebase/functions/src/mechanics/commit-inventory-transfer.js:64` validiert das gespeicherte Loadout. Ab Zeile 108 projiziert der Pfad nur Bindungen des wirklich bewegten Besitzes und schreibt ein Kampfbogenfeld nur bei einer tatsächlichen Änderung. Der gemeinsame `firebase/functions/src/items/item-transfer-equipment.js:5` erhält unbeteiligte Einträge, fehlende/null Sammlungen, TP, Ressourcen und persönliche Felder. `preserveExisting:true` wahrt auch eine bereits vorhandene persönliche Bindung bei erlaubter Stapelzusammenführung. Gruppenübergaben verwenden denselben Helper (`firebase/functions/src/groups/group-inventory-transfer.js:35`).

Die parallelen Kauf-/Zuteilungs-/Anpassungs-/Bogenpfade wurden vom Item-Prüfer auf dieselbe selektive Schreibregel umgestellt. Ausdrücklich geänderte boolesche Ausrüstungsfelder eines Inventarspeichervorgangs bleiben erlaubt; unveränderte ältere Inventarflags übernehmen keine neue Autorität (`firebase/functions/src/items/commit-item-record.js:57`).

Belege: `normal-transfer-regression-red.log` (3 neue Fälle zunächst rot), `legacy-merge-regression-red.log` (Stapelrandfall zunächst rot), finale Servertests in `server-units-final.log`. Die echte Firestore-Probe prüft Geldwiederholung, unveränderte Profile/Revisionsfelder, Verbrauchsgut an eine Figur ohne Kampfbogen, abgewiesene Übergabe einer gehaltenen Waffe, echte Gearübergabe und Legacy-Stapelzusammenführung (`release-state.integration.mjs:83`).

### P1 — Reines Lesen des Kampfbogens konnte die aktive Waffe austauschen

Auslöser: Eine abgelegte Flegel-Bindung stand vor dem gehaltenen Schwert im Profil; alte Inventarflags markierten beide als abgelegt. Die bisherige Hydrierung machte den Flegel statt des Schwerts zur aktiven Waffe. Damit konnte bereits die Vorbereitung einer Auswertung die falsche Waffenbasis liefern.

Korrektur: `firebase/functions/src/items/item-definition-repository.js:62` unterstützt `preserveLoadout`. Combat-Comment, Encounter, Status, Rast und Skillprüfung nutzen diese Option. Gepinnte Definitionen und ihre Werte werden weiterhin aufgelöst; die gespeicherte Ausrüstungswahl bleibt erhalten. Keine Änderung an Schaden, Aktionsregeln oder historischen Auswertungen.

Belege: `combat-hydration-red.log`, zunächst 2/2 rot; Regression `firebase/functions/tests/combat-inventory-hydration.test.js:21` mit echter alter Schwert-/aktueller Flegeldefinition, anschließend grün im finalen Serverlauf. Die echte Firestore-Pickup-/Angriffsprobe bestätigt einen später ausdrücklich gewählten Flegel mit 3W4 und bezahltem Waffenwechsel.

### P1 — Szenen-Pickup konnte vollständige unbeteiligte Gearlisten überschreiben

Auslöser: Schon das Aufheben einer Ration lieferte eine komplette normalisierte Waffenliste zurück und setzte darin eine gehaltene Waffe ab. Ein Gear-Pickup konnte fremde persönliche Felder und fehlende Sammlungen normalisieren. Beim Besitz eines Gegenstands mit mehreren Kampfmodi musste jede verlorene Bindung entfernt werden.

Korrektur: `AleriaAlmanach/modules/scene-items/scene-item-equipment.js:7` projiziert ausschließlich den neu aufgehobenen Ausrüstungsgegenstand; Lebensmittel liefern `combatProfile:null`. Entfernen eines Besitzes beseitigt nur dessen gebundene Kampfmodi (`:24`). `firebase/functions/src/mechanics/commit-combat-comment.js:295` bewahrt die gespeicherten Rohprofile für Schreibentscheidungen und Undo. Die Quellen-/Empfängerprojektion betrifft ausschließlich den bewegten Gegenstand (`:370`, `:423`); final werden nur tatsächlich geänderte Listen geschrieben (`:706`). Gewollte Kampfvorbereitung bleibt unverändert.

Belege: drei Browserregressionen in `AleriaAlmanach/tests/scene-item-equipment-preservation.test.mjs`; 20/20 gezielte Nachbarfälle in `scene-equipment-frontend.log`. Finale echte Firestore-Probe `release-state.integration.mjs:204`: Nahrung erhält Gearlisten exakt und erfindet keine Rüstungsliste; Waffenpickup ergänzt nur die neue abgelegte Bindung; späterer bewusster Wechsel kostet eine Bonusaktion; Angriff verursacht 3W4; eigene TP bleiben 7; der frühere Pickupbeleg bleibt exakt erhalten.

## Frische Abschlussprüfungen

| Prüfung | Ergebnis | Beleg |
| --- | --- | --- |
| Vollständige Server-Unit-Suite nach letztem Quellen-Freeze | 330 bestanden, 0 fehlgeschlagen, 17,77 s | `server-units-final.log` |
| Neue echte Firestore-Integrationsfälle | 5 bestanden, 0 fehlgeschlagen, 11,22 s | `release-state-emulator-final.log` |
| Equipmentstandards einschließlich Buckler Nah-/Fernkampf, Pavese-Aufstellen, Großschwert und gepinntem Jungritterschwert | 2 bestanden, 0 fehlgeschlagen | `equipment-emulator-final.log` |
| Echter Encounter sperrt Rastheilung/Ladungen; Ende gibt beides frei | 1 bestanden, 0 fehlgeschlagen | `rest-emulator-final.log` |
| Browser-/Server-Mechanikgraph, rein lesend | 237 identische Quellmodule | `mechanics-parity-final.log` |

Die fünf neuen Firestore-Fälle enthalten zusätzlich: gleichlautende Charakter-/Kreatur-IDs bleiben typisiert; konkurrierende Unikatentnahmen ergeben genau einen Besitzer; Gruppenquittungen können weder normal noch per Force-Undo gelöscht werden; echte Kampf-Locks sperren Gruppenübergaben und Rast für beide Akteurtypen; nach Kampfende funktionieren Heilung und Ladungserholung; ein späterer Kauf schützt Inventar und Geld vor älterem Rast-Undo; zwei normale Rast-Rücknahmen in umgekehrter Reihenfolge funktionieren trotz steigender Revisionsnummern.

Zwei anfängliche Fehler dieser neuen Diagnosefixture wurden ausschließlich in der Fixture berichtigt: Encounter-Akteur-ID muss dem gespeicherten Quellenvertrag entsprechen; der kostenlose erste Loadout-Entscheid durfte nicht als kostenpflichtiger späterer Wechsel behauptet werden. Ein echter Eröffnungsbeitrag macht den späteren Wechsel in der finalen Probe kostenpflichtig. Diese Fixturekorrekturen begründen keine Produktregeländerung.

## Grenzen und verbleibende Schritte

Alle Emulatoraufrufe waren hart auf `127.0.0.1:8187` begrenzt und nutzten ausschließlich `demo-aleria-release-combat-items`, `demo-aleria-equipment-standards` bzw. `demo-aleria-combat-checkup` mit frischen UUID-Dokumenten. Kein globaler Löschendpoint, keine Live-Schreibzugriffe, kein Überschreiben historischer Live-Belege, kein Push oder Deployment durch diesen Prüfer. Bestehende Dienste wurden nicht gestoppt.

Die alten 587 Releasegate-Prüfungen sind kein Beleg dieses neuen Checks. Die vollständige Frontend-Suite und die endgültigen Release-/Deploychecks laufen separat beim zuständigen Prüfer bzw. Root. Hier bleibt kein zusätzlich vorgeschlagener Architekturumbau oder neuer beitragsblockierender Rechtevertrag offen.
