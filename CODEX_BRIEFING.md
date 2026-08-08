# Briefing für Codex — Stand 2026-08-08

Kurzer Kontext-Abgleich vor der nächsten Aufgabe: seit deinem letzten Merge (`11ffb9aa`,
PR "codex/almanach-scenes-items", 2026-06-22) ist einiges am Rest der Codebase passiert.
Deine eigenen Module (`item-database/`, `scene-transition/`) sind davon **nicht** betroffen —
das wurde extra per Git-Archäologie geprüft, siehe unten. Relevant ist eher: der Rest der
App hat inzwischen ein paar feste Konventionen bekommen, die du beim Arbeiten in denselben
Bereichen (Kommentar-System, Charakter-/Kreatur-Speicherpfade, Kampf-Engine) unbedingt
respektieren solltest, sonst reißt du bekannte, bereits gefixte Bugs wieder auf.

## Zu deiner eigenen PR: kein Handlungsbedarf

- `scene-transition/` (State/Events/UI + CSS): seit dem Merge **keine einzige Zeile** geändert.
  Läuft unverändert, keine gemeldeten Probleme.
- `item-database/` (Extractors/Normalizer/Store/UI): wurde in 5 Commits (23.06.–11.07.) planmäßig
  erweitert — Picker-Dialog für andere Module, Kategorie-Verwaltung, geräteübergreifende
  Firebase-Synchronisation, UI-Politur. Alles additive Weiterführung deines eigenen
  `ITEM-GUETER-DATENBANK-PLAN.md`, keine Bugfixes, keine Rewrites. Seit dem 11.07. unverändert.
- Falls ein konkretes Symptom der Auslöser für die nächste Aufgabe ist ("X funktioniert nicht"),
  lohnt sich eine kurze Rückfrage beim Nutzer, WAS genau kaputt wirkt — laut Commit-Historie
  liegt die Ursache erfahrungsgemäß nicht in diesen beiden Modulen.

## Konventionen, die seither entstanden sind (bitte einhalten)

### 1. Speicher-Staleness-Guard für Charaktere/Kreaturen
`AleriaAlmanach/modules/characters/character-save-guard.js` (ES-Modul + `globalThis.AleriaCharacterSaveGuard`).
Jedes Charakter-/Kreatur-Dokument trägt jetzt `combatProfile.revision`, `inventory.revision`
(bzw. `loot.revision` bei Kreaturen) als monoton steigende Zeitstempel.

- `saveCharacter()`/`saveCreature()` in `firebase.js` prüfen vor jedem Schreiben, ob die
  mitgeschickte Revision älter ist als die aktuell in Firestore — falls ja, wird der Write
  abgelehnt (außer `options.forceOverwrite===true`, reserviert für explizit vom Nutzer
  bestätigte Importe).
- **Wichtigste Regel für neuen Code:** Wenn ein Speicherpfad `combatProfile`/`inventory`/`loot`
  nicht WIRKLICH ändern will, darf er das Feld gar nicht erst ins `data`-Objekt packen (Firestore
  `merge:true` lässt fehlende Felder unangetastet). NICHT das aktuelle Objekt "der Vollständigkeit
  halber" re-serialisieren — genau das hat früher mal Waffenlisten kaputt überschrieben.
- Für die zwei "echten Editoren" (Charakterbogen, Kreaturbogen), wo diese Felder legitim in
  derselben Sitzung bearbeitet werden können, gibt es `selectChangedSections(current, baseline,
  sectionNames)` — vergleicht gegen einen beim Öffnen erzeugten Schnappschuss und schreibt nur
  Bereiche, die sich wirklich unterscheiden.
- Details/Herleitung: Memory `charakter-speichersystem-bereichstrennung.md`.

### 2. Cache-Busting-Disziplin
Jede geänderte Datei — egal ob klassisches `<script src="...?v=...">`-Tag in
`AleriaAlmanach.html` oder ES-Modul-`import`-Referenz — braucht **ihre eigene** neue `?v=`-Nummer,
nicht nur die der Datei, die sie referenziert. Ein bereits gecachter Browser lädt eine Datei mit
identischer URL sonst auf unbestimmte Zeit nicht neu, selbst wenn der Inhalt sich geändert hat.
Vor dem Commit: `git diff --name-only <letzter-commit> HEAD -- '**/*.js'` gegen
`grep "<datei>?v=" AleriaAlmanach.html` gegenchecken. Details: Memory
`cache-busting-versionsnummern-disziplin.md`.

### 3. Getrennte Würfel-Kanäle im Kampfsystem
Der Damage-Roll-Kanal (`rollDamage`) akzeptiert nur d4/d6/d8/d10/d12 (siehe
`DAMAGE_FORMULA_PATTERN` in `combat-mvp-rules.js`) und ist serverseitig ein SEQUENZIELLER Queue
(`provided-dice-adapter.js`, `damageSources`) — jede Mechanik mit eigener Würfelnotation (z.B.
Ablenkungs-/Ward-Würfe auf d20/d100) braucht einen EIGENEN, klar benannten Adapter-Kanal
(Beispiel: `rollWardDeflection()`), sonst desynchronisiert die Queue oder die Validierung schlägt
serverseitig fehl.

### 4. Kommentar-Dokument-Whitelist in den Cloud Functions
`firebase/functions/src/comments/commit-narrative-comment.js` baut das persistierte
Kommentar-Dokument über eine **explizite Feldliste** (`buildNarrativeCommentDocument()`). Ein
neues Metadaten-Feld, das nur im Client existiert aber nicht in dieser Liste steht, wird beim
Speichern kommentarlos verworfen — das hat schon mal ein ganzes Feature (Fazit-Karten) tagelang
unsichtbar gemacht, obwohl der Render-Code korrekt war. Bei jedem neuen `metadata.*`-Feld: sowohl
hier als auch im lokalen Offline-Fallback (`comments-backend.js`) eintragen.

### 5. Deploy-Modell
Kein `hosting`-Key in `firebase.json` → statische Assets (HTML/CSS/JS) gehen allein durch
`git push` live. Cloud-Functions-Änderungen brauchen dagegen einen separaten
`firebase deploy --only functions --project aleriaprojekt` (predeploy führt automatisch
`npm test` aus). Serverseitige Mechanik-Dateien werden über
`firebase/functions/scripts/sync-almanach-mechanics.mjs` 1:1 nach
`firebase/functions/src/generated/**` gespiegelt — niemals die generierte Kopie von Hand
bearbeiten, sondern die Quelle unter `AleriaAlmanach/modules/...` und danach den Sync laufen
lassen (passiert automatisch vor `firebase/functions`-Tests).

## Offene/bekannte Baustellen

- **Duncan Gafyr** (`CharakterDatenbank/records/familien/haus-gafyr/duncan-gafyr--.../character.json`)
  ist noch ein reiner Level-1-Rohling — leere `weapons`/`abilities`/`quirks`. War beim letzten
  Checkup bewusst ausgeklammert ("machen wir danach"), steht also weiterhin aus.
- Es liegt ein unausgeführter Plan aus einer früheren Plan-Mode-Sitzung vor
  (`abstract-beaming-goblet.md`) für ein neues "Herausforderung"-Feature (DM-Ermittlungen mit
  verdeckten Ansätzen, serverseitig gewürfelt). Additiv geplant, tastet die bestehende versteckte
  Täuschungs-Mechanik in Kommentarzeilen nicht an. Falls das die nächste Aufgabe ist, existiert
  bereits ein vollständiger Phasenplan.
