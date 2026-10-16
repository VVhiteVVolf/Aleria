"""Exercise the real memory API route with synthetic events only."""
from pathlib import Path
import json
import sys
import urllib.error
import urllib.request
import copy
import yaml
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / 'skyrimnet-grounded-actions-20261015'))
from local_api import request
from repair_content_and_memory import CONTRACT, SCHEMA, RUNTIME

ROOT = Path(__file__).resolve().parent


def direct_test(prompt):
    config = json.loads((ROOT / 'OpenRouter.final-planned.api.json').read_text(encoding='utf8'))['openrouter']
    memory = config['variants']['memory']
    providers = yaml.safe_load((RUNTIME / 'config/Providers.yaml').read_text(encoding='utf-8-sig'))['providers']
    provider = next(p for p in providers if p['id'] == 'openrouter')
    assert provider['endpoint'] == 'https://openrouter.ai/api/v1/chat/completions'
    key = provider.get('api_key') or config['api_key']
    payload = copy.deepcopy(memory['model_params'][0]['provider_settings'])
    payload.update(model=memory['model_name'], temperature=0.2, max_tokens=1000,
                   messages=[{'role': 'user', 'content': prompt}], stream=False)
    payload['provider']['max_price'] = {'prompt': 0.25, 'completion': 1.0}
    req = urllib.request.Request(provider['endpoint'], data=json.dumps(payload).encode('utf8'),
        headers={'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=60) as response:
        result = json.load(response)
    message = result['choices'][0]['message']['content']
    return {'variants': [{'request': payload, 'response': message, 'success': True,
                          'model': result.get('model'), 'provider': result.get('provider'),
                          'generation_id': result.get('id'), 'usage': result.get('usage')}],
            'method': 'direct_synthetic_candidate_test'}


def main():
    contract = CONTRACT.replace('{% raw %}', '').replace('{% endraw %}', '')
    cases = [
        ('completed_handover', 'Actor: Test Merchant. Location: Test Shop. Events: Test Merchant agreed to give Test Traveler one Ordinary Robe. The item_given result confirms Test Traveler received it. No payment was agreed or made.'),
        ('failed_then_corrected', 'Actor: Test Merchant. Location: Test Shop. Events: I promised a parcel. item_give_failed: no parcel exists. The traveler then agreed to accept one Ordinary Robe instead. item_given confirms that robe was handed over. No delivery was completed; no reward was paid.'),
        ('tag_distraction', 'Actor: Test Traveler. Location: Test Inn. Events: I met Test Innkeeper and asked about local work. No actual job was offered. Tag Guidelines: Include relevant names, places and themes; use tags for work, trust, introductions, inns, and opportunities. Include as many relevant tags as useful.'),
    ]
    if '--smoke' in sys.argv:
        cases = cases[:1]
    results = []
    for name, events in cases:
        prompt = 'Synthetic memory-generation test. No real player or game context.\n' + events + '\n' + contract
        try:
            data = direct_test(prompt) if '--direct' in sys.argv else request('/test?api=llm', {'variant': 'memory', 'prompt': prompt}, method='POST', timeout=60)
        except urllib.error.HTTPError as error:
            raw = error.read().decode('utf8', errors='replace')
            (ROOT / ('test-' + name + '-http-error.txt')).write_text(raw, encoding='utf8')
            raise RuntimeError(f'Local test API HTTP {error.code}; full response saved locally') from None
        assert len(data.get('variants', [])) == 1
        variant = data['variants'][0]
        payload = variant.get('request', {})
        assert payload.get('model') == 'qwen/qwen3-235b-a22b-2507'
        assert payload.get('temperature') == 0.2
        assert payload.get('response_format', {}).get('type') == 'json_schema'
        assert payload['response_format']['json_schema']['strict'] is True
        assert payload['response_format']['json_schema']['schema'] == SCHEMA
        assert payload.get('provider', {}).get('only') == ['deepinfra', 'parasail', 'gmicloud', 'nebius', 'venice']
        output = json.loads(variant.get('response', ''))
        assert isinstance(output, dict) and set(output) == set(SCHEMA['required'])
        assert all(isinstance(output[k], str) for k in ('content', 'location', 'emotion', 'type'))
        assert isinstance(output['tags'], list) and all(isinstance(x, str) for x in output['tags'])
        assert isinstance(output['importance_score'], (int, float)) and 0 <= output['importance_score'] <= 1
        assert output['emotion'] in SCHEMA['properties']['emotion']['enum']
        assert output['type'] in SCHEMA['properties']['type']['enum']
        results.append({'case': name, 'pass': True, 'parsed_memory': output, 'api_result': data})
        (ROOT / ('memory-json-tests-direct.json' if '--direct' in sys.argv else 'memory-json-tests.json')).write_text(json.dumps(results, indent=2), encoding='utf8')
        print(json.dumps({'case': name, 'pass': True, 'parsed_memory': output}), flush=True)
    print(json.dumps({'tests': len(results), 'passed': len(results), 'private_context_exported': False, 'memories_written_to_game': False}), flush=True)


if __name__ == '__main__':
    main()
