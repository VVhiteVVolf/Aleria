"""Bounded replay of affected logged turns with explicitly pinned providers."""
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
import hashlib
import json
import re
import time
import urllib.error
import urllib.request
import yaml

ROOT = Path(__file__).resolve().parent
CONFIG = Path(r'E:\Nolvus\Instances\Nolvus Awakening\MODS\mods\SkyrimNet - Beta25 Test Runtime 20260927\SKSE\Plugins\SkyrimNet\config')
ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions'
MAX_OUTPUT = 256
PRICE = {'prompt': 0.15, 'completion': 0.4}  # USD per million tokens; hard routing cap.


def grade(case, content):
    plain = re.sub(r'\[[^\]]*\]', '', content).strip()
    if case == 'wife_topic_change':
        # This deliberately only screens the observed failure, not all dialogue quality.
        wife = bool(re.search(r'\b(wife|Drifa|she|her|married|marriage)\b', plain, re.I))
        stale = bool(re.search(r'not (?:interested )?in(?:to)? the fur|nothing else (?:in my stock|on the shelves)|take it or leave it', plain, re.I))
        return {'pass': wife and not stale, 'mentions_wife_or_female_partner': wife,
                'repeats_observed_trade_refusal': stale}
    footer = re.findall(r'^ACTION:\s*(\w+)(?:\s+PARAMS:\s*(\{.*\}))?\s*$', content, re.M)
    if case == 'priced_sale_in_items_category':
        return {'pass': len(footer) == 1 and footer[0][0] == 'None',
                'selected': footer[0][0] if footer else None}
    if not footer: return {'pass': False, 'reason': 'missing footer'}
    try: intent = json.loads(footer[0][1]).get('intent', '')
    except (ValueError, TypeError): intent = ''
    return {'pass': len(footer) == 1 and footer[0][0] == 'Economy' and bool(intent),
            'selected': footer[0][0], 'intent': intent}


def main():
    providers = yaml.safe_load((CONFIG / 'Providers.yaml').read_text(encoding='utf-8-sig'))['providers']
    configured = next(p for p in providers if p['id'] == 'openrouter')
    assert configured['endpoint'] == ENDPOINT
    base = yaml.safe_load((CONFIG / 'OpenRouter.yaml').read_text(encoding='utf-8-sig'))['openrouter']
    key = configured.get('api_key') or base.get('api_key')
    assert key and not key.startswith('${')
    rows = json.loads((ROOT / 'bersi-requests.json').read_text(encoding='utf8'))
    fixtures = {
        'wife_topic_change': next(x for x in rows if x['request'] == 'req_bcbddf96d2780eed_1a14148fa63'),
        'accepted_sale': next(x for x in rows if x['request'] == 'req_8621072d489819f7_1a14143cb0d'),
        'priced_sale_in_items_category': next(x for x in rows if x['request'] == 'req_a0a5968c1b6c9d28_1a14145de7c'),
    }
    routes = [
        ('google/gemma-4-26b-a4b-it', 'makora'),
        ('google/gemma-4-26b-a4b-it', 'coreweave/bf16'),
        ('google/gemma-4-26b-a4b-it', 'cloudflare'),
        ('google/gemma-4-26b-a4b-it', 'parasail/bf16'),
        ('google/gemma-4-31b-it', 'parasail/fp8'),
        ('google/gemma-4-31b-it', 'friendli'),
    ]
    tasks = []
    for case, fixture in fixtures.items():
        for model, route in routes:
            if case == 'priced_sale_in_items_category' and model.endswith('26b-a4b-it'): continue
            messages = fixture['data']['messages']
            payload = {'model': model, 'messages': messages, 'temperature': 0.7,
                       'max_tokens': MAX_OUTPUT, 'stream': False,
                       'reasoning': {'enabled': False}, 'cache': True,
                       'provider': {'only': [route], 'allow_fallbacks': False, 'max_price': PRICE}}
            tasks.append((case, model, route, payload))
    # Conservative token ceiling: one input token per UTF-8 byte + role overhead.
    ceiling = sum((sum(len(m.get('content', '').encode('utf8')) + 32 for m in p['messages']) + 256)
                  * PRICE['prompt'] / 1e6 + MAX_OUTPUT * PRICE['completion'] / 1e6
                  for _, _, _, p in tasks)
    assert ceiling < 0.10, f'Cost ceiling exceeded: {ceiling:.5f}'
    (ROOT / 'provider-test-plan.json').write_text(json.dumps({
        'requests': len(tasks), 'conservative_usd_ceiling': ceiling,
        'no_retries': True, 'parallelism': 2, 'live_settings_unchanged': True,
        'method': 'Same recorded messages, temperature 0.7, output cap 256, non-streaming; provider/model pinned.',
        'limitations': ['One replay per fixture and route; not a statistical reliability estimate.',
                        'Longer inherited conversation already contains repetitions.',
                        'Heuristic grades require manual inspection.'],
        'tasks': [{'case': c, 'model': m, 'route': r,
                   'payload_sha256': hashlib.sha256(json.dumps(p, sort_keys=True).encode()).hexdigest()}
                  for c, m, r, p in tasks]}, indent=2), encoding='utf8')
    print(f'{len(tasks)} pinned replays, hard conservative ceiling ${ceiling:.5f}, no retries.', flush=True)

    def run(task):
        case, model, route, payload = task
        request = urllib.request.Request(ENDPOINT, data=json.dumps(payload).encode('utf8'),
            headers={'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json',
                     'X-Title': 'SkyrimNet Bersi bounded provider investigation'})
        result = {'case': case, 'requested_model': model, 'requested_route': route}
        start = time.monotonic()
        try:
            with urllib.request.urlopen(request, timeout=45) as response: data = json.load(response)
            if data.get('error'):
                result.update(error=data['error'])
            else:
                choice = data.get('choices', [{}])[0]
                content = choice.get('message', {}).get('content') or ''
                result.update(generation_id=data.get('id'), provider=data.get('provider'),
                              actual_model=data.get('model'), response=content,
                              finish_reason=choice.get('finish_reason'), usage=data.get('usage'),
                              **grade(case, content))
        except urllib.error.HTTPError as error:
            body = error.read().decode('utf8', errors='replace').replace(key, '[REDACTED]')
            result['error'] = {'status': error.code, 'message': body[:1200]}
        except Exception as error:
            result['error'] = {'type': type(error).__name__, 'message': str(error).replace(key, '[REDACTED]')[:250]}
        result['seconds'] = round(time.monotonic() - start, 3)
        return result

    results = []
    with ThreadPoolExecutor(max_workers=2) as pool:
        for future in as_completed([pool.submit(run, task) for task in tasks]):
            result = future.result(); results.append(result)
            (ROOT / 'provider-replay-results.json').write_text(json.dumps(results, indent=2, ensure_ascii=False), encoding='utf8')
            print(json.dumps({k: result.get(k) for k in ('case', 'requested_route', 'provider', 'pass', 'error', 'seconds')}, ensure_ascii=True), flush=True)
    cost = sum(float((r.get('usage') or {}).get('cost') or 0) for r in results)
    print(f'Reported aggregate inference cost: ${cost:.6f}', flush=True)


if __name__ == '__main__':
    main()
