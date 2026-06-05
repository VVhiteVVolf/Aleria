# AleriaGPT Cloudflare Worker

Kostenarme/kostenlose Proxy-Variante fuer AleriaGPT.

Der Worker haelt den OpenRouter-Key serverseitig und bietet dieselbe Frontend-Schnittstelle wie der Node/Railway-Proxy:

- `GET /health`
- `POST /aleria-gpt/chat`

## Voraussetzungen

- Cloudflare-Account
- Node.js lokal
- OpenRouter-API-Key
- OpenRouter-Modell-ID

## Setup

```powershell
cd "d:\0-KI Generierte\VS Studio Code\AleriaAlmanach\backend\aleria-gpt-worker"
npm install
npx wrangler login
```

## Modell setzen

In `wrangler.toml`:

```toml
ALERIA_GPT_MODEL = "dein/openrouter-modell"
```

Beispiele:

```toml
ALERIA_GPT_MODEL = "anthropic/claude-opus-4.8"
```

oder guenstiger:

```toml
ALERIA_GPT_MODEL = "google/gemini-3.5-flash"
```

## Secret setzen

Den OpenRouter-Key nicht in Dateien schreiben.

```powershell
npx wrangler secret put ALERIA_GPT_API_KEY
```

Dann den Key im Terminal einfuegen.

## Lokal testen

```powershell
npm run dev
```

Healthcheck:

```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:8787/health" -UseBasicParsing
```

## Deploy

```powershell
npm run deploy
```

Cloudflare gibt danach eine URL aus, etwa:

```text
https://aleria-gpt.<account>.workers.dev
```

Diese URL kommt danach in:

```text
AleriaAlmanach/modules/aleria-gpt/aleria-gpt-config.js
```

als:

```js
const ALERIA_GPT_PRODUCTION_BACKEND_ENDPOINT = 'https://aleria-gpt.<account>.workers.dev';
```

## Cloudflare-Dashboard Alternative

Wenn du nicht mit CLI arbeiten willst:

1. Workers & Pages oeffnen.
2. Worker `aleria-gpt` erstellen.
3. Code aus `worker.js` einfuegen.
4. Variables setzen:

```text
ALERIA_GPT_ALLOWED_ORIGINS=https://dieweltvonaleria.neocities.org,http://127.0.0.1:5508
ALERIA_GPT_PROVIDER_BASE_URL=https://openrouter.ai/api/v1
ALERIA_GPT_MODEL=<OpenRouter-Modell-ID>
ALERIA_GPT_APP_URL=https://dieweltvonaleria.neocities.org
ALERIA_GPT_APP_TITLE=Aleria Almanach
ALERIA_GPT_MAX_TOKENS=700
ALERIA_GPT_TIMEOUT_MS=30000
ALERIA_GPT_MAX_BODY_CHARS=650000
```

5. Secret setzen:

```text
ALERIA_GPT_API_KEY=<OpenRouter-Key>
```

6. Deployen und Worker-URL kopieren.

## Wichtig

- OpenRouter-Key nie in `wrangler.toml`, `worker.js`, Chat oder Git schreiben.
- Wenn die Free-Limits erreicht sind, stoppt Cloudflare Requests statt heimlich unbegrenzt weiterzurechnen.
- OpenRouter-Kosten entstehen trotzdem je nach Modell und Nutzung.

