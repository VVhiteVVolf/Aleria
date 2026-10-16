# Local SkyrimNet XTTS — Windows CPU

This installation is self-contained in `E:\Aleria\xtts`. It uses Python 3.12, the SkyrimNet-recommended **langfod/skyrimnet-tts** API server and XTTS-v2. It runs exclusively on CPU, binds to localhost, and does not change Skyrim, Nolvus, MO2, prompts or game settings.

## Start and stop

Double-click `start_xtts_cpu.bat`, or run:

```bat
E:\Aleria\xtts\start_xtts_cpu.bat
```

Server: **http://127.0.0.1:7860**. Wait for `Model loaded on CPU` and `Starting server on 127.0.0.1:7860`. The first start is slower than subsequent starts. The batch activates `.venv`, explicitly uses CPU mode, and pauses if startup fails. If a healthy compatible server is already running, the starter reports this and exits successfully without loading another model. Stop a foreground server with Ctrl+C.

When an existing server is detected, the start window stays open at a keypress prompt so you can read its status. Closing this status window does not stop the existing background server.

The installation test leaves a background instance running. To stop only this installation's server from PowerShell, use:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File E:\Aleria\xtts\scripts\stop_server.ps1
```

## SkyrimNet settings to enter manually

In SkyrimNet's dashboard, select the **XTTS** TTS backend:

| Setting | Value |
|---|---|
| Endpoint / TTS Server URL | `http://127.0.0.1:7860` |
| Host, if a separate field exists | `127.0.0.1` |
| Port, if separate | `7860` |
| Language | `en` (English) |
| Authentication / API key | None |
| Request timeout, if configurable | `300` seconds initially for CPU |
| TTS generation concurrency, if configurable | `1` |

Enter the **base URL**, not `/tts_to_audio/`. SkyrimNet uses `POST /tts_to_audio/` for WAV synthesis and `POST /create_and_store_latents` for uploading reference audio. This is the SkyrimNet-compatible cloning API, rather than the generic Mantella XTTS API. Enable SkyrimNet's automatic voice cloning/voice samples option if your dashboard exposes it. No in-game settings have been modified by this installation.

## Voice samples

Put English voice reference samples in **`E:\Aleria\xtts\voices\en\`**. Use simple names such as `my_voice.wav`. Restart the server after adding samples; it precomputes and stores their voice embeddings under `cache\latents\en`. The speaker identifier is the filename without `.wav`, e.g. `my_voice`. For automatic NPC cloning, SkyrimNet provides the speaker identifier and uploads its WAV itself.

Recommended input: mono, uncompressed PCM WAV, 16-bit, 22,050 or 24,000 Hz; 6–15 seconds of clear speech, one speaker, no music, little silence. Other sample rates (including 44,100 Hz) are resampled by XTTS. Prefer English speech for English output. Use recordings you are entitled to use. To replace an existing voice, use a new filename/identifier so its previous cached embedding is not reused.

`demo_femalecommoner.wav` is an 8.22-second **English** reference included by the upstream SkyrimNet server (`upstream/speakers/en/femalecommoner.wav`). It is provided here only as a English smoke-test reference. The test synthesizes new English speech conditioned on that WAV; use your own English reference for the final voice you want.

## Test

With the server running:

```bat
test_xtts.bat
test_xtts.bat --full
```

The quick test checks `/health`, model readiness and English support. The full test uploads a WAV under a fresh speaker name, synthesizes English using the local reference, then synthesizes English with the uploaded cloned voice. It validates actual non-silent PCM16 WAV audio and writes:

- `output\english_local_voice.wav`
- `output\english_uploaded_clone.wav`
- `logs\test-results.json` (timings, duration and audio validation)

Manual synthesis (PowerShell):

```powershell
$body = @{text='Good day. Welcome to Skyrim.'; speaker_wav='demo_femalecommoner'; language='en'} | ConvertTo-Json
Invoke-WebRequest -Uri 'http://127.0.0.1:7860/tts_to_audio/' -Method Post -ContentType 'application/json; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes($body)) -OutFile '.\output\manual-test.wav'
```

Output is mono, 24 kHz, 16-bit PCM. CPU synthesis can take longer than the resulting audio; expect dialogue delays while gaming. The default is four CPU threads to leave some capacity for Skyrim. Change `threads` in `config\server.json` only if useful for your machine. CPU mode and localhost binding are enforced by the launcher.

## Layout and reproducibility

- `.venv`: isolated Python environment; system Python packages are unchanged.
- `upstream`: pinned server source, commit recorded in `config\upstream.json`.
- `config\cpu-local.patch`: documented local source adjustments (paths, configurable language defaults, correct uploaded speaker naming, PCM16 output and full error logging).
- `models\xtts-v2`: pinned model and original license.
- `voices\en`: input WAV files.
- `cache`: embeddings, Python package cache and inference caches.
- `logs`: installation, server and test logs.
- `output`: generated audio.
- `requirements-working.txt`: final exact package versions.

To reproduce with Python 3.12 and Git installed, run `scripts\setup_cpu.ps1` from PowerShell. It installs `torch==2.8.0+cpu` and `torchaudio==2.8.0+cpu` from the official CPU wheel index and the frozen dependency list. **Do not run the upstream CUDA installation scripts or install its unfiltered requirements.txt.** No CUDA, NVIDIA, CuPy, Triton or DeepSpeed packages are needed.

XTTS-v2 model revision: `6c2b0d75eae4b7047358e3b6bd9325f857d43f77`. `scripts\download_model.py` checks downloaded file sizes and the published SHA-256 hashes of the model weights. Inference runs offline after installation. The model is under the Coqui Public Model License; see `models\xtts-v2\LICENSE.txt` for its non-commercial terms. The launcher does not auto-accept model licensing prompts.

Sources: [SkyrimNet installation guide](https://goncalo22.github.io/SkyrimNet-GamePlugin/Installation%20Guide/skyrimnet-installation/), [server source](https://github.com/langfod/skyrimnet-tts), [XTTS-v2 model](https://huggingface.co/coqui/XTTS-v2).

## Troubleshooting

- **Connection refused:** start XTTS and wait for model loading to finish. Check `logs\server.log`, `logs\startup-error.log` if present, and the console.
- **Port 7860 already in use / WinError 10048:** the initial background instance may already be serving SkyrimNet. The updated starter checks for it before loading the model and reports `XTTS laeuft bereits und ist bereit`. Run `test_xtts.bat` to verify. Stop only this installation using `scripts\stop_server.ps1` if you actually need to restart. An occupied port with a busy or unrecognized service is reported without stopping any process.
- **Unknown voice / missing latents:** use the filename stem, the matching `en` folder/language, and restart after adding local WAVs. SkyrimNet must upload a reference before requesting an uncached NPC voice.
- **Request timeout:** use a longer SkyrimNet timeout and short sentences. CPU mode is slower than GPU mode; do not install CUDA to address this AMD/CPU setup.
- **Changed voice sounds unchanged:** use a new speaker name to avoid old conditioning-cache entries.
- **Dependency error:** read the full traceback, run `.venv\Scripts\python.exe -m pip check`, and restore `requirements-working.txt`. Do not randomly upgrade Transformers or PyTorch.
- **Initial sandbox errors in installation logs:** Python's temporary-wheel directory and the logger's Windows named pipes required execution outside the tool sandbox during setup. These are not CUDA errors. The final server and batch/API tests are recorded separately.
- **In-game speech still absent:** confirm XTTS is selected, the base URL and `en` are set, and SkyrimNet is submitting requests. HTTP integration was exercised directly; an in-game SkyrimNet conversation requires your manual backend selection.

The server default language is controlled by `language` in `config/server.json` (currently `en`). Restart after changing it. Explicit request language values take precedence; set SkyrimNet to `en` as well. Existing German samples and caches have been preserved.
