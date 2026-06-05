# AleriaGPT Proxy

Kleiner Node-Proxy fuer AleriaGPT.

Ziel:

- API-Key bleibt auf dem Server.
- Die Almanach-Seite ruft nur diesen Proxy auf.
- Der Proxy spricht einen OpenAI-kompatiblen Chat-Completions-Endpunkt an.

## Start lokal

```bash
cp .env.example .env
npm start
```

Node 18 oder neuer ist noetig. Das Projekt nutzt keine npm-Abhaengigkeiten.

Um `.env` lokal zu laden, kann je nach Umgebung ein Host wie Railway/Cloud Run die Variablen setzen. Bei rein lokalem Start ohne Env-Loader muessen die Variablen im Terminal gesetzt werden.

PowerShell-Beispiel:

```powershell
$env:PORT="8787"
$env:ALERIA_GPT_ALLOWED_ORIGINS="http://127.0.0.1:5508"
$env:ALERIA_GPT_PROVIDER_BASE_URL="https://api.openai.com/v1"
$env:ALERIA_GPT_API_KEY="..."
$env:ALERIA_GPT_MODEL="..."
npm start
```

## Frontend verbinden

In der Browserkonsole der Almanach-Seite:

```js
window.setAleriaGptBackendEndpoint("http://127.0.0.1:8787")
```

Danach nutzt das linke AleriaGPT-Panel den Proxy. Ohne konfigurierten Endpoint bleibt das Panel im lokalen Quellenmodus.

Zum Entfernen:

```js
window.setAleriaGptBackendEndpoint("")
```

## Endpunkte

`GET /health`

Prueft, ob der Proxy laeuft.

`POST /aleria-gpt/chat`

Request:

```json
{
  "schemaVersion": 1,
  "query": "Analysiere Gwendolyn Draig",
  "retrieval": {
    "sourceHash": "...",
    "promptContext": "AleriaGPT Kontextpaket...",
    "chunks": []
  }
}
```

Response:

```json
{
  "ok": true,
  "text": "Antwort der KI",
  "model": "provider/model",
  "sourceHash": "..."
}
```

## Wichtige Umgebungsvariablen

- `ALERIA_GPT_ALLOWED_ORIGINS`
  - Kommagetrennte erlaubte Browser-Origins.
  - Beispiel: `http://127.0.0.1:5508,https://dieweltvonaleria.neocities.org`
- `ALERIA_GPT_PROVIDER_BASE_URL`
  - Basis-URL des KI-Anbieters.
  - Muss OpenAI-kompatible `/chat/completions` anbieten.
- `ALERIA_GPT_API_KEY`
  - Secret. Niemals in die Webseite schreiben.
- `ALERIA_GPT_MODEL`
  - Modellname des Anbieters.
- `ALERIA_GPT_APP_URL`
  - Oeffentliche Almanach-URL fuer OpenRouter-App-Attribution.
- `ALERIA_GPT_APP_TITLE`
  - Anzeigename fuer OpenRouter-App-Attribution.
- `ALERIA_GPT_MAX_TOKENS`
  - Antwortlimit.
- `ALERIA_GPT_MAX_BODY_BYTES`
  - Request-Limit fuer grosse Kontextpakete.

## Deploy-Optionen

Geeignet fuer:

- Railway
- Google Cloud Run
- Firebase Hosting mit separater Function/Run-Instanz
- Vercel/Netlify nur nach Anpassung an deren Serverless-Runtime

Wichtig:

- CORS nur fuer echte Almanach-Origins erlauben.
- Billing/Kostenlimit beim KI-Anbieter setzen.
- Logs nicht mit kompletten Promptdaten speichern.
- API-Key nur als Secret/Env-Variable hinterlegen.

## Railway-Deployment

Empfohlener Weg fuer dieses Projekt, weil der Rossmarkt bereits nach demselben Prinzip lief.

1. In Railway ein neues Projekt aus Repo/Ordner erstellen.
2. Als Root Directory setzen:

```text
AleriaAlmanach/backend/aleria-gpt-proxy
```

3. Railway erkennt `package.json` und startet ueber:

```text
npm start
```

4. Healthcheck ist vorbereitet:

```text
/health
```

5. In Railway unter Variables setzen:

```text
ALERIA_GPT_ALLOWED_ORIGINS=https://dieweltvonaleria.neocities.org,http://127.0.0.1:5508
ALERIA_GPT_PROVIDER_BASE_URL=https://openrouter.ai/api/v1
ALERIA_GPT_API_KEY=<OpenRouter-Key als Railway-Secret>
ALERIA_GPT_MODEL=<OpenRouter-Modell-ID>
ALERIA_GPT_APP_URL=https://dieweltvonaleria.neocities.org
ALERIA_GPT_APP_TITLE=Aleria Almanach
ALERIA_GPT_MAX_TOKENS=700
ALERIA_GPT_MAX_BODY_BYTES=650000
```

`PORT` muss bei Railway normalerweise nicht gesetzt werden. Railway setzt den Port automatisch.

6. Nach dem Deployment Railway-Domain kopieren, z.B.:

```text
https://aleria-gpt-proxy-production.up.railway.app
```

7. Diese URL in `modules/aleria-gpt/aleria-gpt-config.js` als `ALERIA_GPT_PRODUCTION_BACKEND_ENDPOINT` eintragen.

## Dauerbetrieb

Damit AleriaGPT nicht nur lokal funktioniert:

1. Proxy bei einem Hoster deployen.
2. Env-Variablen beim Hoster setzen.
3. `ALERIA_GPT_ALLOWED_ORIGINS` auf die echte Almanach-Domain setzen.
4. Die vom Hoster erzeugte Proxy-URL im Frontend als Endpoint setzen.

Beispiel fuer OpenRouter:

```text
ALERIA_GPT_PROVIDER_BASE_URL=https://openrouter.ai/api/v1
ALERIA_GPT_MODEL=<openrouter-modell-id>
ALERIA_GPT_API_KEY=<secret>
ALERIA_GPT_APP_URL=https://dieweltvonaleria.neocities.org
ALERIA_GPT_APP_TITLE=Aleria Almanach
```
