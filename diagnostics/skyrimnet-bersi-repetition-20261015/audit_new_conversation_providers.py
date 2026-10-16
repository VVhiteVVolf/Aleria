"""Query generation metadata only; never export prompts or conversation text."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import json
import re
import urllib.error
import urllib.parse
import urllib.request
import yaml

ROOT = Path(__file__).resolve().parent
CONFIG = Path(r'E:\Nolvus\Instances\Nolvus Awakening\MODS\mods\SkyrimNet - Beta25 Test Runtime 20260927\SKSE\Plugins\SkyrimNet\config')


def main():
    providers = yaml.safe_load((CONFIG / 'Providers.yaml').read_text(encoding='utf-8-sig'))['providers']
    provider = next(p for p in providers if p['id'] == 'openrouter')
    assert provider['endpoint'] == 'https://openrouter.ai/api/v1/chat/completions'
    config = yaml.safe_load((CONFIG / 'OpenRouter.yaml').read_text(encoding='utf-8-sig'))['openrouter']
    key = provider.get('api_key') or config.get('api_key')
    assert key and not key.startswith('${')
    log = (ROOT / 'snapshot/SkyrimNet-new-conversation.log').read_text(encoding='utf8', errors='replace')
    rows = []
    pattern = r'^\[(2026-10-15 [^]]+)\].*Bound event ID (\d+) to (Bersi Honey-Hand|Vex|Korrilan)\x27s response (gen-[\w-]+)'
    for stamp, event, actor, gen in re.findall(pattern, log, re.M):
        if stamp < '2026-10-15 22:45':
            continue
        rows.append({'stamp': stamp, 'event_id': int(event), 'actor': actor, 'generation_id': gen})
    assert 1 <= len(rows) <= 40, len(rows)

    def get(row):
        url = 'https://openrouter.ai/api/v1/generation?' + urllib.parse.urlencode({'id': row['generation_id']})
        request = urllib.request.Request(url, headers={'Authorization': 'Bearer ' + key, 'Accept': 'application/json'})
        try:
            with urllib.request.urlopen(request, timeout=20) as response:
                data = json.load(response).get('data', {})
            return {**row, 'metadata': {k: data.get(k) for k in ('provider_name', 'model', 'total_cost', 'native_tokens_prompt', 'native_tokens_completion', 'finish_reason')}}
        except urllib.error.HTTPError as error:
            return {**row, 'error': {'status': error.code}}
        except Exception as error:
            return {**row, 'error': {'type': type(error).__name__, 'message': str(error).replace(key, '[REDACTED]')[:200]}}

    with ThreadPoolExecutor(max_workers=3) as pool:
        results = list(pool.map(get, rows))
    (ROOT / 'new-conversation-provider-metadata.json').write_text(json.dumps(results, indent=2), encoding='utf8')
    for row in results:
        print(json.dumps(row, ensure_ascii=True), flush=True)


if __name__ == '__main__':
    main()
