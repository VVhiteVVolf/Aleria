# AleriaGPT Cloudflare Worker

Der Worker ist der authentifizierte OpenRouter-Proxy des AleriaAlmanachs. Er hält den Provider-Key ausschließlich serverseitig und stellt zwei Endpunkte bereit:

- `GET /health` ist öffentlich und liefert nur den Betriebsstatus.
- `POST /aleria-gpt/chat` verlangt einen gültigen Firebase-ID-Token im Header `Authorization: Bearer <token>`.

Der Client bezieht den Token aus der anonymen Firebase-Sitzung. Der Worker prüft Signatur, Aussteller, Zielprojekt und Ablauf gegen die offiziellen Firebase-Schlüssel. Eine bloße UID oder ein selbstgebauter JWT genügt nicht.

## Voraussetzungen

- Cloudflare-Account mit Durable Objects
- Node.js 22 oder neuer
- OpenRouter-API-Key und gültige Modell-ID
- im Firebase-Projekt `aleriaprojekt` aktivierte anonyme Anmeldung

## Lokale Einrichtung

```powershell
cd "E:\Aleria\AleriaAlmanach\ausgeklammert\aleria-gpt\backend\aleria-gpt-worker"
npm install
npx wrangler login
npx wrangler secret put ALERIA_GPT_API_KEY
```

Den OpenRouter-Key niemals in `worker.js`, `wrangler.toml`, Chat, Log oder Git schreiben.

## Konfiguration

Die nicht geheimen Produktionswerte liegen in `wrangler.toml`:

- `ALERIA_FIREBASE_PROJECT_ID`: erwartetes Firebase-Projekt im ID-Token.
- `ALERIA_GPT_ALLOWED_ORIGINS`: exakte, kommagetrennte Web-Ursprünge. Anfragen ohne erlaubten Origin werden für den Chat abgewiesen.
- `ALERIA_GPT_MAX_BODY_CHARS`: maximale JSON-Größe vor dem Provider-Aufruf.
- `ALERIA_GPT_RATE_LIMIT_PER_MINUTE`: Anfragen je Benutzer und Minute.
- `ALERIA_GPT_IP_RATE_LIMIT_PER_MINUTE`: Anfragen je IP und Minute.
- `ALERIA_GPT_DAILY_TOKEN_BUDGET`: reservierte Ausgabetokens je Benutzer und UTC-Tag.
- `ALERIA_GPT_GLOBAL_DAILY_TOKEN_BUDGET`: reservierte Ausgabetokens für alle Benutzer je UTC-Tag.

Die Limits werden in `AleriaGptUsageLimiter` als Durable Object atomar reserviert. Deshalb muss beim ersten Deployment die in `wrangler.toml` deklarierte Migration mit ausgerollt werden. Die Reservierung ist absichtlich konservativ: Ein abgebrochener Provider-Aufruf gibt sein bereits reserviertes Tagesbudget nicht wieder frei.

## Prüfen und lokal starten

```powershell
npm test
npm run dev
```

Der Healthcheck funktioniert ohne Token:

```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:8787/health" -UseBasicParsing
```

Ein Chat-Aufruf benötigt dagegen zusätzlich einen echten Firebase-ID-Token und einen erlaubten `Origin`-Header. Der Browser-Client setzt den Bearer-Header automatisch.

## Deployment

```powershell
npm run deploy
```

Beim ersten Rollout im Cloudflare-Dashboard kontrollieren:

1. Secret `ALERIA_GPT_API_KEY` ist vorhanden.
2. Binding `ALERIA_GPT_USAGE_LIMITER` zeigt auf `AleriaGptUsageLimiter`.
3. Migration `v1-usage-limiter` wurde angewendet.
4. die Netlify-Produktionsdomain steht exakt in `ALERIA_GPT_ALLOWED_ORIGINS`.
5. `/health` meldet das erwartete Modell, aber keine Geheimnisse.

Die ausgegebene Worker-URL wird in `modules/aleria-gpt/aleria-gpt-config.js` als Produktionsendpunkt gepflegt.

## Sicherheits- und Kostenverhalten

- Keine Chat-Anfrage ohne Firebase-Authentifizierung.
- Keine Chat-Anfrage von unbekanntem oder fehlendem Origin.
- Größenlimit vor JSON-Verarbeitung und Provider-Aufruf.
- Benutzer-, IP- und globale Limits vor dem Provider-Aufruf.
- Begrenzung der angeforderten Ausgabetokens auf die konfigurierte Obergrenze.
- Logs enthalten Status und Fehlerklasse, aber weder Provider-Antworttexte noch Zugangsdaten.
- Ein HTTP-429 bedeutet bewusst Rate-Limit oder erschöpftes Tagesbudget; der Client darf dann nicht ungezügelt wiederholen.

OpenRouter-Kosten entstehen weiterhin abhängig von Modell und tatsächlicher Nutzung. Cloudflare-Limits sind eine zusätzliche Schutzschicht, kein Ersatz für Provider-Budgetwarnungen.
