"""Exercise actual SkyrimNet HTTP health, WAV upload and English synthesis."""
from pathlib import Path
import argparse
import io
import json
import time
import wave
import requests
import numpy as np

ROOT = Path(__file__).resolve().parents[1]

def check_wave(data, destination):
    with wave.open(io.BytesIO(data), 'rb') as wav:
        assert wav.getnchannels() == 1, 'Expected mono audio'
        assert wav.getsampwidth() == 2, 'Expected PCM16'
        duration = wav.getnframes() / wav.getframerate()
        samples = np.frombuffer(wav.readframes(wav.getnframes()), dtype='<i2')
        rms = float(np.sqrt(np.mean((samples.astype(float) / 32768) ** 2)))
        assert duration > 0.5 and rms > 0.001, 'Empty or silent synthesis'
        result = {'seconds': duration, 'sample_rate': wav.getframerate(), 'rms': rms}
    destination.write_bytes(data)
    return result

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--full', action='store_true', help='Also upload a WAV and synthesize English twice')
    args = parser.parse_args()
    settings = json.loads((ROOT / 'config/server.json').read_text())
    base = f'http://{settings["host"]}:{settings["port"]}'
    session = requests.Session()
    session.trust_env = False
    health = session.get(base + '/health', timeout=15)
    health.raise_for_status()
    language = settings['language']
    report = {'language': language, 'url': base, 'health': health.json()}
    assert report['health']['model_loaded'] and language in report['health']['supported_languages']
    if args.full:
        api = session.get(base + '/openapi.json', timeout=15)
        api.raise_for_status()
        assert api.json()['components']['schemas']['SynthesisRequest']['properties']['language']['default'] == language
        # Different upload filename deliberately tests the server's speaker-name handling.
        voice = 'http_clone_' + str(int(time.time()))
        sample = ROOT / 'voices' / language / 'demo_femalecommoner.wav'
        start = time.monotonic()
        with sample.open('rb') as stream:
            response = session.post(base + '/create_and_store_latents',
                data={'speaker_name': voice},
                files={'wav_file': ('reference.wav', stream, 'audio/wav')}, timeout=600)
        response.raise_for_status()
        report['clone'] = response.json()
        assert report['clone']['language'] == language, 'Incorrect upload default language'
        report['clone']['elapsed_seconds'] = time.monotonic() - start
        for name, speaker, text in [
            ('english_local_voice', 'demo_femalecommoner', 'Good day. Welcome to Skyrim.'),
            ('english_uploaded_clone', voice, 'Hello, traveler. This voice is generated on your computer.')]:
            start = time.monotonic()
            response = session.post(base + '/tts_to_audio/', json={
                'text': text, 'speaker_wav': speaker}, timeout=900)
            response.raise_for_status()
            report[name] = check_wave(response.content, ROOT / 'output' / (name + '.wav'))
            report[name]['elapsed_seconds'] = time.monotonic() - start
        (ROOT / 'logs/test-results.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps(report, indent=2))

if __name__ == '__main__':
    main()
