# Briefing für Codex — Stand 2026-08-08

## Vorgemerkte Ressource — 10.09.2026

Der Nutzer hat `E:\Aleria\BilderRüstungen` ausdrücklich für spätere Arbeiten an Religionen, Gottheiten und Klerus vorgemerkt. Die neue Religionsseite liegt unter `Religionen/index.html`; Struktur und Erweiterung sind in [Religionen/README.md](Religionen/README.md) beschrieben.

Der göttliche Kreis ist mit 9 Göttlichen, 5 Souveränen, 5 Untergottheiten und 8 benannten Heiligen umgesetzt. Göttersymbole aus `BilderRüstungen` dienen dem Verzeichnis; die gelieferten Glasmalereien stehen groß in den Einzelartikeln unter `Religionen/gottheiten/`. Ordans vollständiges Profil wurde nachgereicht und übernommen. Inhaltsentscheidungen: [Religionen/docs/GOETTLICHER_KREIS.md](Religionen/docs/GOETTLICHER_KREIS.md).

Der neue Alerische Klerus liegt unter `Religionen/klerus/index.html` mit 19 Götterunterseiten und sechs Kasten. Zünfte ausschließlich bei Mönchen/Nonnen. Magisterium ausschließlich mit den wissenschaftlichen Bereichen Orin, Auron und Orith, unabhängig vom persönlichen Glauben. Asketenbilder für Ordan, Baldran, Maldras, Sylvana und Kharon; bei den übrigen Gottheiten kein oder kaum eigener Asketenzweig, Ausnahmen möglich. Priesterränge umfassen nach Nutzervorgabe 14 Stufen mit Kurator vor der Priesterweihe und Diakon/Pastor als Leiter einer Ortskirche. Patriarchale Stellung und Bischofsamt können sich verbinden; Erzpatriarchen können Länder oder große Orden führen. Bußgänger und Geläuterter sind genau zwei Stände; nach vollendeter Buße endet die Verpflichtung. Pflege und Architektur: [Religionen/klerus/README.md](Religionen/klerus/README.md). Die überholte `AleriaKlerus/AlerischerKlerus.html` ist nicht mehr aktiv verlinkt.

Infernus liegt unter `Religionen/pantheons/infernus/index.html`: zehn hohe Mächte, fünf Untergötter, zwei Geweihte und fünf Gefallene. 17 vollständige Profile aus den Nutzeranhängen, fünf reine Namens-/Bildregister. Auf ausdrücklichen Nutzerwunsch 23 eigene farbige SVG-Symbole; unveränderte Bildnisse groß im Artikel. Zarakhuls Fragmente und Balors Morvahr sind enthalten. Adars umstrittene Zugehörigkeit, Aroths frühere Identität und der gegenwärtige Ausschluss eigener Pakte für Zarakhul/Balor bleiben verbindlich. Der alte Neuner-Pfad leitet weiter. Quellen und Pflege: [INFERNALER_KREIS.md](Religionen/docs/INFERNALER_KREIS.md). Der gemeinsame Generator erzeugt jetzt 70 HTML-Dateien einschließlich Weiterleitung und 20 Klerusseiten.

Die vier alten Klerusdateien wurden auf Nutzerwunsch aus `AleriaKlerus/` entfernt und unverändert in [Archiv/AlerischerKlerus](Archiv/AlerischerKlerus/README.md) gesichert. ZIP und Manifest enthalten die geprüften Originale; kein aktiver Einstieg und keine aktuelle Lorequelle.

Die acht weiteren Religionen (Nordischer und Alter Pantheon, Celestische Synode, Hohe Drei, Harmonie von Mond & Sonne, Zirkel des Ewigen Waldes, Phalantischer Bund, Schwarze Sonne) sind vollständig aus den Vorlagen eingebunden: 105 Bildnisse, 79 eigene Ränge, regionale Namen und Aspektvergleiche. Pro Religion `eintrag.json`, `glaube.json` und `assets/`; gemeinsame Darstellung und Validierung in `Religionen/modules/traditions`. 90 Originalbilder und 15 generierte Bildnisse aktiv. Die fünf schwarzen Waldzirkel-Feindbilder sind vollständig durch antikisierende Figuren in Braun und Ocker ersetzt: Tethron, Baalzor, Lyrion, Gryloth sowie Aurion & Noxus. Vier dieser Bilder wurden nach ausdrücklicher Nutzerfreigabe lokal mit Pillow/NumPy freigestellt; alle fünf sind transparent eingebunden. Die alten Symbole bleiben als Quellen erhalten. Bearbeitung und Bildhashes sind dokumentiert. Verbindlicher Nutzerwunsch: **Keinen einheitlichen Bildstil erfinden.** Alter Pantheon behält seine keltischen Pergamentzeichnungen mit Tiergeistern, Celestische Synode ihre transparenten bronzenen Konturzeichnungen; die übrigen Bildfamilien bleiben ebenfalls erhalten. Hauptübersicht behält ihre farbigen Religionssymbole. Quellen und Pflege: [GLAUBENSRICHTUNGEN.md](Religionen/docs/GLAUBENSRICHTUNGEN.md). Triarchie der Eroberung wartet noch auf ihre eigene Vorlage.

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
