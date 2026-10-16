"""Read actual OpenRouter generation providers; sends IDs only, no prompts."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from collections import Counter
import json
import re
import urllib.error
import urllib.parse
import urllib.request
import yaml

ROOT = Path(__file__).resolve().parent
CONFIG = Path(r'E:\Nolvus\Instances\Nolvus Awakening\MODS\mods\SkyrimNet - Beta25 Test Runtime 20260927\SKSE\Plugins\SkyrimNet\config')


def main():
    configured = yaml.safe_load((CONFIG / 'Providers.yaml').read_text(encoding='utf-8-sig'))['providers']
    provider = next(p for p in configured if p['id'] == 'openrouter')
    assert provider['endpoint'] == 'https://openrouter.ai/api/v1/chat/completions'
    settings = yaml.safe_load((CONFIG / 'OpenRouter.yaml').read_text(encoding='utf-8-sig'))['openrouter']
    key = provider.get('api_key') or settings.get('api_key')
    assert key and not key.startswith('${'), 'Configured credential missing'
    entries = []
    engine = (ROOT / 'snapshot/SkyrimNet.log').read_text(encoding='utf8', errors='replace')
    pattern = r'^\[(2026-10-15 22:[^]]+)\].*Bound event ID (\d+) to Bersi Honey-Hand\x27s response (gen-[\w-]+)'
    for stamp, event_id, generation in re.findall(pattern, engine, re.M):
        entries.append({'stamp': stamp, 'event_id': int(event_id), 'generation_id': generation})
    assert 1 <= len(entries) <= 30, len(entries)

    def get(url, authenticated=False):
        headers = {'Accept': 'application/json', 'User-Agent': 'SkyrimNet-Local-Provider-Audit/1.0'}
        if authenticated: headers['Authorization'] = 'Bearer ' + key
        request = urllib.request.Request(url, headers=headers, method='GET')
        try:
            with urllib.request.urlopen(request, timeout=25) as response:
                return json.load(response)
        except urllib.error.HTTPError as error:
            # Store only status, never dump a raw response that might echo a credential.
            return {'audit_error': {'status': error.code}}
        except Exception as error:
            return {'audit_error': {'type': type(error).__name__, 'message': str(error).replace(key, '[REDACTED]')[:250]}}

    def generation(entry):
        result = get('https://openrouter.ai/api/v1/generation?' + urllib.parse.urlencode({'id': entry['generation_id']}), True)
        if 'data' not in result: return {**entry, **result}
        allowed = ('id', 'model', 'provider_name', 'created_at', 'total_cost', 'cache_discount',
                   'latency', 'generation_time', 'tokens_prompt', 'tokens_completion',
                   'native_tokens_prompt', 'native_tokens_completion', 'native_tokens_cached',
                   'native_tokens_reasoning', 'finish_reason', 'native_finish_reason', 'is_byok')
        return {**entry, 'metadata': {k: result['data'].get(k) for k in allowed}}

    with ThreadPoolExecutor(max_workers=3) as pool:
        results = list(pool.map(generation, entries))
    (ROOT / 'provider-generation-audit.json').write_text(json.dumps(results, indent=2), encoding='utf8')
    for row in results:
        data = row.get('metadata', {})
        print(json.dumps({'stamp': row['stamp'], 'provider': data.get('provider_name'),
                          'model': data.get('model'), 'cost': data.get('total_cost'),
                          'error': row.get('audit_error')}, ensure_ascii=True), flush=True)
    print('PROVIDERS', dict(Counter(row.get('metadata', {}).get('provider_name', 'unavailable') for row in results)), flush=True)
    for model in ('google/gemma-4-31b-it', 'google/gemma-4-26b-a4b-it'):
        result = get('https://openrouter.ai/api/v1/models/' + model + '/endpoints')
        (ROOT / (model.split('/')[-1] + '-endpoints.json')).write_text(json.dumps(result, indent=2), encoding='utf8')
        print('ENDPOINTS', model, len(result.get('data', {}).get('endpoints', [])), flush=True)


if __name__ == '__main__':
    main()
