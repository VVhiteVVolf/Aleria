# AleriaGPT Integrationsplan

Stand: 2026-06-04

## Aktueller Implementierungsstand

Begonnen wurde mit dem stabilen Datenunterbau, noch nicht mit einem externen KI-Anbieter.

Umgesetzt:

- `modules/aleria-gpt/aleria-gpt-context-builder.js`
  - baut einen normalisierten AleriaGPT-Kontext aus Charakteren, Modulen, Seiten, Szenen, Dialogen, statischen Kommentaren und gespeicherten Kommentaren
  - erzeugt `sourceRef`s fuer spaetere Quellenangaben
  - bereinigt Richtext/Kommentar-Markup zu `plainText`
  - erzeugt `stats` und `sourceHash`
- `modules/aleria-gpt/aleria-gpt-export-events.js`
  - ermoeglicht einen JSON-Download des Kontextes
  - stellt zusaetzlich `window.exportAleriaGptContext(options)` fuer Debug/Tests bereit
- `modules/aleria-gpt/aleria-gpt-retrieval.js`
  - erkennt Figuren und Module in einer Frage
  - baut Such-Chunks aus Charakterprofilen, Modulseiten, Szenendialogen, statischen Kommentaren und gespeicherten Kommentarsegmenten
  - bewertet Treffer mit Score und `scoreReasons`
  - erzeugt ein `promptContext`-Textpaket fuer den spaeteren Backend-Proxy
  - stellt `window.retrieveAleriaGptContext(query, options)` fuer Debug/Tests bereit
- `modules/aleria-gpt/aleria-gpt-client.js`
  - kapselt die Kommunikation mit einem spaeteren Backend-Proxy
  - sendet keine API-Keys aus dem Browser
  - bleibt inaktiv, solange kein Endpoint konfiguriert ist
  - Endpoint kann zum Testen ueber `window.setAleriaGptBackendEndpoint(url)` gesetzt werden
- `modules/aleria-gpt/aleria-gpt-config.js`
  - feste Produktions-Konfiguration nach Rossmarkt-Prinzip
  - nimmt nach Railway-Deployment die dauerhafte Proxy-URL auf
  - aktiviert den Endpoint automatisch auf `dieweltvonaleria.neocities.org`
- `modules/aleria-gpt/aleria-gpt-state.js`
  - kapselt den lokalen Panel-State: offen/geschlossen, aktiv, Scope, Chatverlauf
- `modules/aleria-gpt/aleria-gpt-panel.js`
  - rendert die linke AleriaGPT-Leiste und das aufklappbare Panel
  - zeigt lokale Quellenantworten und Trefferkarten
- `modules/aleria-gpt/aleria-gpt-events.js`
  - delegierte Panel-Events ueber `data-aleria-gpt-action`
  - verbindet Panel-Fragen mit dem Retrieval
- `styles/aleria-gpt.css`
  - isoliertes Panel-CSS fuer Leiste, Chat, Quellenliste und Mobile-Verhalten
- `backend/aleria-gpt-proxy/`
  - deploybare Node-Proxy-Vorlage ohne npm-Abhaengigkeiten
  - bietet `GET /health` und `POST /aleria-gpt/chat`
  - nutzt Umgebungsvariablen fuer erlaubte Origins, Anbieter-URL, API-Key und Modell
  - enthaelt `railway.json`, `.env.example` und `.gitignore` fuer Railway-Dauerbetrieb
- `backend/aleria-gpt-worker/`
  - bevorzugte kostenlose Cloudflare-Worker-Variante
  - bietet dieselbe Frontend-Schnittstelle: `GET /health` und `POST /aleria-gpt/chat`
  - haelt den OpenRouter-Key als Cloudflare Secret
  - enthaelt `worker.js`, `wrangler.toml`, `package.json`, `.gitignore` und README
- Modul-Editor:
  - Im Bereich Import/Export gibt es jetzt `AleriaGPT-Kontext herunterladen`.
  - Im Bereich Import/Export gibt es jetzt `AleriaGPT-Treffer testen`.

Naechster sinnvoller Schritt:

- Kontext- und Trefferdateien im Browser inhaltlich pruefen.
- Cloudflare Worker deployen.
- OpenRouter-Key als Cloudflare Secret setzen.
- OpenRouter-Modell in `backend/aleria-gpt-worker/wrangler.toml` setzen.
- Worker-URL in `modules/aleria-gpt/aleria-gpt-config.js` eintragen.
- Danach veroeffentlichte Almanach-Seite testen.

## Zielbild

AleriaGPT wird ein links aufklappbares Assistenzbanner im Almanach. Die KI spricht neutral, sachlich und unterscheidet klar zwischen belegbaren Daten, statistischen Beobachtungen und interpretierenden Einschaetzungen.

Sie soll langfristig beantworten koennen:

- Welche Figuren existieren im Charakterarchiv?
- In welchen Modulen, Szenen, Dialogen und Kommentaren kommt eine Figur vor?
- Wie oft kommentiert eine Figur, mit welchen Kommentararten und in welchen Kontexten?
- Welche Woerter, Themen, Konflikte, Vorlieben und Abneigungen lassen sich aus den Kommentaren ableiten?
- Welche Beziehungen oder wiederkehrenden Reaktionsmuster zeigen sich zwischen Figuren?

Beispielziel:

> "Analysiere Gwendolyn Draig. Wie wirkt sie anhand ihrer bisherigen Kommentare? Was veraergert sie, was mag sie, warum agiert sie so?"

Die Antwort darf keine absolute Diagnose sein. Sie soll als literarische/figurenbezogene Analyse formuliert werden: "Aus den vorhandenen Kommentaren wirkt sie...", "Belegt ist...", "Interpretation...".

## Rueckblick Rossmarkt-KI

Im Ordner `Maerkte/Rossmarkt` gibt es bereits eine KI-Loesung fuer Owain Draig.

Wichtige Muster:

- `scripts/rossmarkt.js` nutzt einen externen Proxy: `KI_PROXY_BASE`.
- Die KI wird ueber `/generate` angesprochen.
- Fuer Sprache gibt es zusaetzlich `/speak`.
- Wissen kommt groesstenteils aus statischen Daten:
  - `kontext_pferde.md`
  - `data/kontext-pferde.js`
  - eingebettetes `ROSSMARKT_WISSEN`
- Es gibt eine einfache Chat-History im Browser.
- Es gibt lokale Fallback-Antworten, wenn der KI-Dienst nicht erreichbar ist.

Was davon fuer Aleria brauchbar ist:

- Ein Proxy statt API-Key im Browser ist richtig.
- Ein klarer Systemprompt ist richtig.
- Ein begrenzter Chatverlauf im Client ist sinnvoll.
- Ein Fallback ohne KI ist sinnvoll, mindestens fuer Statistikprofile.

Was nicht uebernommen werden sollte:

- Keine statische Riesen-Wissensdatei als einzige Quelle. Aleria-Daten sind dynamisch.
- Keine Inline-Handler oder direkt gestylten DOM-Bloecke wie im Rossmarkt.
- Keine fest verdrahtete Proxy-URL mitten im Feature-Code.
- Keine Vermischung von UI, Promptbau, Fetch-Logik, Wissensextraktion und Fallback in einer grossen Datei.

## Grundarchitektur

AleriaGPT sollte als eigenes Feature unter `modules/aleria-gpt/` entstehen.

Vorgeschlagene Module:

- `aleria-gpt-panel.js`
  - rendert das linke aufklappbare Banner
  - verwaltet offene/geschlossene Darstellung
  - zeigt Nachrichten, Ladezustand, Fehler und Quellenhinweise
- `aleria-gpt-events.js`
  - delegierte Events fuer Panel, Senden, Scope-Auswahl, Schnellfragen
  - nutzt `data-aleria-gpt-action`
- `aleria-gpt-state.js`
  - lokaler UI-State: offen/geschlossen, aktive Anfrage, Chatverlauf, gewaehlter Scope
- `aleria-gpt-context-builder.js`
  - extrahiert Module, Seiten, Szenen, Dialoge, Kommentare und Charakterdaten in ein einheitliches Datenformat
- `aleria-gpt-retrieval.js`
  - waehlt relevante Daten fuer eine Frage aus
  - erste Version: deterministic keyword/entity matching
  - spaetere Version: Embeddings oder serverseitige Suche
- `aleria-gpt-client.js`
  - spricht ausschliesslich den eigenen Backend-Proxy an
  - kennt keine API-Keys
- `aleria-gpt-analysis-cache.js`
  - liest/schreibt vorberechnete Charakteranalysen und Metadaten
- `styles/aleria-gpt.css`
  - isoliertes CSS fuer linkes Banner, Chat und Quellenanzeige

Damit bleibt das Feature gekapselt und beruehrt bestehende Systeme nur ueber definierte Leseschnittstellen.

## Datenquellen im Almanach

Bestehende Quellen, die AleriaGPT nutzen kann:

- Charaktere:
  - `getAllCharacterRecords()`
  - `getVisibleCharacterRecords()`
  - vorhandene Felder wie `id`, `name`, `aliases`, `title`, `portrait`, `profileLink`, `playerOwner`
- Kommentare:
  - `window._fb.loadAllComments()`
  - lokaler Fallback ueber `comments-backend.js`
  - Felder wie `entryId`, `characterId`, `charName`, `commentMode`, `commentSegments`, `createdAt`, `updatedAt`
- Kommentarsegmente:
  - Sprecher
  - Text
  - Kommentarart, z.B. Rede, Denken, Rufen
  - linke/rechte Seite bei Szenenkommentaren
  - Formatierungsdaten
- Module:
  - Daten aus dem Modul-Store
  - Seiten, Szenenbloecke, Dialoge, Cast-Daten, Metadaten

Das neue Mini-Sprecherprofil ist ein guter Startpunkt fuer deterministische Metadaten. Es zaehlt bereits Kommentare, haeufige Woerter, Kommentararten und Interaktionspartner. AleriaGPT sollte diese Logik nicht kopieren, sondern spaeter entweder wiederverwenden oder in eine gemeinsame Statistik-Schicht auslagern.

## Normalisiertes KI-Kontextformat

AleriaGPT sollte keine rohen DOM-Texte lesen. Die App sollte Daten in ein stabiles JSON-Format normalisieren.

Vorschlag:

```json
{
  "schemaVersion": 1,
  "generatedAt": "2026-06-04T00:00:00.000Z",
  "characters": [
    {
      "id": "character-id",
      "name": "Gwendolyn Draig",
      "aliases": [],
      "title": "",
      "faction": "",
      "profileLink": "",
      "profileText": ""
    }
  ],
  "modules": [
    {
      "id": "module-id",
      "title": "Modultitel",
      "category": "Szenen",
      "summary": "",
      "pages": [
        {
          "pageId": "module-id:p0",
          "title": "Seite 1",
          "type": "scene",
          "plainText": "",
          "cast": [
            { "characterId": "character-id", "name": "Gwendolyn Draig", "role": "" }
          ],
          "dialogue": [
            {
              "speakerCharacterId": "character-id",
              "speakerName": "Gwendolyn Draig",
              "text": "Dialogtext",
              "sourceRef": "module:module-id:page:0:block:2"
            }
          ]
        }
      ]
    }
  ],
  "comments": [
    {
      "commentId": "comment-id",
      "threadId": "module-or-page-thread",
      "moduleId": "module-id",
      "createdAt": 0,
      "segments": [
        {
          "speakerCharacterId": "character-id",
          "speakerName": "Gwendolyn Draig",
          "kind": "speech",
          "side": "left",
          "plainText": "Kommentartext",
          "sourceRef": "comment:comment-id:segment:0"
        }
      ]
    }
  ]
}
```

Wichtig:

- Jede Aussage der KI sollte auf `sourceRef`s zurueckgefuehrt werden koennen.
- `plainText` wird aus Richtext/Markup bereinigt.
- Formatierung bleibt optional als Metadaten erhalten, ist aber nicht Hauptquelle fuer die Analyse.
- Charakter-IDs sind wichtiger als Namen, weil Namen sich aendern oder doppelt vorkommen koennen.

## Retrieval-Strategie

Nicht jede Anfrage darf den gesamten Almanach an die KI senden. Das waere langsam, teuer und ungenau.

Phase 1: deterministisches Kontextpaket

- Frage lokal analysieren.
- Erwaehnte Figurennamen gegen Charakterarchiv matchen.
- Relevante Kommentare und Dialoge dieser Figur sammeln.
- Zusaetzlich direkte Interaktionspartner und aktuelle Modulseite einbeziehen.
- Kontext auf eine sinnvolle Groesse begrenzen.

Phase 2: lokaler/Firestore-Index

- Normalisierte Textbloecke als `ai_context_chunks` speichern.
- Jedes Chunk bekommt:
  - `chunkId`
  - `sourceType`
  - `sourceRef`
  - `characterIds`
  - `moduleId`
  - `plainText`
  - `keywords`
  - `updatedAt`
  - `sourceHash`
- Suche zuerst per Figur, Modul, Schlagwort und Datum.

Phase 3: semantische Suche

- Optional spaeter Embeddings/Vektorsuche.
- Nur noetig, wenn der Almanach sehr gross wird oder freie Fragen deutlich bessere Treffer brauchen.
- Kann serverseitig ueber Cloud Function, Cloud Run, Railway oder einen anderen Backend-Dienst laufen.

## Backend-Proxy

Ein KI-Anbieter darf nicht direkt aus dem Browser mit geheimem API-Key angesprochen werden.

Noetig ist ein eigener Proxy:

- Endpoint `POST /aleria-gpt/chat`
- Endpoint `POST /aleria-gpt/analyze-character`
- optional `POST /aleria-gpt/rebuild-index`
- optional `POST /aleria-gpt/summarize-module`

Aufgaben des Proxys:

- API-Key sicher halten.
- Rate Limits und Kostenbegrenzung durchsetzen.
- Request-Groesse begrenzen.
- Systemprompt kontrollieren.
- Safety-Regeln erzwingen.
- Optional Analyseergebnisse in Firestore cachen.
- Optional Modellanbieter austauschbar halten.

Moegliche Hosts:

- Firebase Cloud Functions
- Google Cloud Run
- Cloudflare Workers
- Railway, wie beim Rossmarkt-Proxy
- Vercel/Netlify Functions
- Eigener kleiner Node/Express-Dienst

Empfehlung fuer dieses Projekt: Cloudflare Workers fuer den kostenlosen Dauerbetrieb. Railway bleibt als bereits bekanntes Rossmarkt-Muster moeglich, kostet aber langfristig eher Geld. Firebase Cloud Functions oder Cloud Run sind sinnvoll, wenn spaeter Firestore-nahe Serverlogik gebraucht wird.

## Firestore-Struktur

Bestehende Collections:

- `comments`
- `characters`

Neue optionale Collections:

### `ai_character_profiles/{characterId}`

Gecachte KI-Analyse pro Figur.

```json
{
  "schemaVersion": 1,
  "characterId": "character-id",
  "characterName": "Gwendolyn Draig",
  "sourceHash": "hash-of-used-comments-and-dialogue",
  "generatedAt": 0,
  "generatedBy": "aleria-gpt",
  "model": "provider/model",
  "status": "ready",
  "stats": {
    "commentCount": 42,
    "segmentCount": 87,
    "topWords": [
      { "word": "pflicht", "count": 11 }
    ],
    "topCommentKinds": [
      { "kind": "speech", "count": 30 }
    ]
  },
  "analysis": {
    "shortSummary": "",
    "observedTraits": [],
    "likelyTriggers": [],
    "likes": [],
    "dislikes": [],
    "speechStyle": [],
    "relationshipNotes": [],
    "openQuestions": []
  },
  "sourceRefs": [
    {
      "sourceRef": "comment:abc:segment:0",
      "label": "Kommentar in Modul X",
      "excerpt": "kurzer Auszug"
    }
  ]
}
```

### `ai_context_chunks/{chunkId}`

Suchindex fuer Module, Dialoge, Szenen und Kommentare.

```json
{
  "schemaVersion": 1,
  "sourceType": "comment-segment",
  "sourceRef": "comment:abc:segment:0",
  "moduleId": "module-id",
  "threadId": "thread-id",
  "characterIds": ["character-id"],
  "speakerNames": ["Gwendolyn Draig"],
  "plainText": "Kommentartext",
  "keywords": ["pflicht", "zorn"],
  "createdAt": 0,
  "updatedAt": 0,
  "sourceHash": "hash"
}
```

### `ai_chat_sessions/{sessionId}`

Nur wenn Chatverlaeufe gespeichert werden sollen. Standard sollte erstmal sein: Verlauf nur lokal im Browser halten.

```json
{
  "createdAt": 0,
  "updatedAt": 0,
  "scope": "current-module",
  "title": "Analyse Gwendolyn",
  "messageCount": 4
}
```

### `ai_usage/{dateOrUserKey}`

Fuer Kostenkontrolle und Rate Limits.

```json
{
  "date": "2026-06-04",
  "requestCount": 12,
  "tokenEstimate": 18000,
  "lastRequestAt": 0
}
```

### `ai_jobs/{jobId}`

Optional fuer laengere Analysen oder Index-Rebuilds.

```json
{
  "type": "character-analysis",
  "status": "queued",
  "characterId": "character-id",
  "createdAt": 0,
  "startedAt": 0,
  "finishedAt": 0,
  "error": ""
}
```

## UI-Konzept

Position:

- Linke Seite als schmale geschlossene Leiste.
- Label: `AleriaGPT`.
- Aufklappbar ueber Button oder Tastaturfokus.
- Keine Ueberdeckung wichtiger Kommentar-Bedienfelder auf Mobile.

Geoeffneter Zustand:

- Kopfbereich mit Name `AleriaGPT` und Status.
- Scope-Auswahl:
  - Aktuelle Seite
  - Aktuelles Modul
  - Figur
  - Gesamter Almanach
- Chatverlauf.
- Eingabefeld.
- Quellenbereich unter Antworten.
- Schnellaktionen:
  - Figur analysieren
  - Modul zusammenfassen
  - Konflikte/Beziehungen zeigen
  - Offene Fragen dieser Szene finden

Die UI gehoert in eigene Dateien und nutzt `data-aleria-gpt-action`, nicht Inline-Handler.

## Prompt-Grundsaetze

Systemprompt fuer AleriaGPT:

- Du bist AleriaGPT, ein neutraler sachlicher Analyseassistent fuer den Aleria Almanach.
- Antworte auf Deutsch.
- Trenne Fakten, Statistik und Interpretation.
- Erfinde keine Ereignisse, Figuren oder Zitate.
- Verwende nur bereitgestellten Kontext.
- Wenn Daten fehlen, sage klar, welche Daten fehlen.
- Bei Figurenanalysen keine medizinischen oder psychologischen Diagnosen stellen.
- Nutze Formulierungen wie "wirkt", "legt nahe", "wiederkehrend", "im vorhandenen Material".
- Gib kurze Quellenhinweise aus, wenn `sourceRef`s vorhanden sind.

## Was durch Drittseiten/extern vorbereitet werden muss

KI-Anbieter:

- Anbieter waehlen: OpenAI, OpenRouter, Google, Anthropic oder anderer LLM-Anbieter.
- API-Key erstellen.
- Kostenlimit/Billing aktivieren.
- Modellentscheidung treffen.

Backend:

- Cloudflare Worker deployen.
- Secrets sicher konfigurieren.
- CORS nur fuer die Almanach-Domain erlauben.
- Rate Limits setzen.
- Logging ohne sensible Vollinhalte planen.

Firestore/Firebase:

- Neue Collections anlegen oder per Code entstehen lassen.
- Security Rules ergaenzen:
  - Client darf nicht beliebig `ai_usage` oder `ai_character_profiles` manipulieren.
  - Schreibzugriff auf KI-Analysen idealerweise nur ueber Backend.
  - Leserechte bewusst entscheiden: oeffentlich, admin-only oder projektintern.
- Optional Cloud Functions Deploy einrichten.

Datenschutz/Projektregeln:

- Entscheiden, ob Chatverlaeufe gespeichert werden.
- Entscheiden, ob Spieler-/Owner-Felder an die KI gesendet werden duerfen.
- Loeschkonzept fuer Analyse-Caches definieren.

## Einbauplan mit Prozentanzeige

Die Prozentwerte beschreiben den Gesamtfortschritt bis zu einer stabilen ersten Version.

| Phase | Fortschritt | Arbeit | Ergebnis |
| --- | ---: | --- | --- |
| 1 | 0-10% | Architekturvertrag und Datenformat finalisieren | Diese Doku wird in technische Contracts ueberfuehrt |
| 2 | 10-25% | `aleria-gpt-context-builder.js` bauen | Erledigt: Charaktere, Module, Dialoge und Kommentare werden normalisiert exportierbar |
| 3 | 25-35% | deterministische Retrieval-Schicht bauen | Erledigt: Fragen zu Figuren/Modulen finden relevante Textstellen ohne KI |
| 4 | 35-45% | linkes `AleriaGPT`-Panel bauen | Erledigt: Aufklappbares Banner mit Chat-UI, Scope-Auswahl und Quellenbereich |
| 5 | 45-58% | Backend-Proxy erstellen | Teilweise erledigt: Client und Node-Proxy-Vorlage vorhanden; Deployment/Secrets fehlen |
| 6 | 58-70% | erste Chatantworten ueber Kontextpakete | Naechster Schritt: Proxy deployen, Endpoint konfigurieren, echte Antworten pruefen |
| 7 | 70-82% | Charakteranalyse und Cache | `ai_character_profiles` mit Statistik, Analyse und `sourceRef`s |
| 8 | 82-90% | Firestore-Regeln, Usage-Limits, Fehlerzustaende | Kosten- und Rechtekontrolle sind abgesichert |
| 9 | 90-96% | Qualitaetsschicht | Quellenhinweise, "Daten fehlen"-Antworten, keine Schein-Diagnosen |
| 10 | 96-100% | Tests, Performance, Dokumentation | Stabiler erster Release fuer echte Nutzung |

## Empfohlener erster technischer Schritt

Nicht direkt mit dem KI-API-Call beginnen.

Der erste echte Implementierungsschritt sollte sein:

1. `modules/aleria-gpt/aleria-gpt-context-builder.js` anlegen.
2. Einen lokalen Export `buildAleriaGptContext({ scope })` erstellen.
3. Ausgabe im Browser oder als Download pruefbar machen.
4. Erst wenn die Daten sauber sind, den Backend-Proxy anschliessen.

Grund: Eine KI kann nur so gut arbeiten wie der Kontext, den wir ihr geben. Wenn Kommentare, Sprecher, Module und Quellen unsauber extrahiert werden, entstehen spaeter falsche Analysen, auch wenn das Modell gut ist.
