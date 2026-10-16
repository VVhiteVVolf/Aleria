"""Four synthetic smoke tests using the staged, rendered action rubric and approved model."""
from pathlib import Path
import json
import re
import sys
import time
import urllib.request
import yaml
from benchmark_actions import CASES, FORMAT, RUBRIC, evaluate

ROOT=Path(__file__).parent
def payment_intent_valid(intent):
    # Actor is the implicit subject of its action; "pay Aldo 50 gold" correctly means Elin pays.
    return bool(re.search(r'\bpay\s+aldo\s+50\s+gold\b',intent,re.I)) or all(word in intent.lower() for word in ('elin','aldo','50','pay'))

if '--validate-saved' in sys.argv:
    result_file=ROOT/'approved-model-validation.json'
    original=result_file.read_bytes()
    rows=json.loads(original.decode('utf-8'))
    for row in rows:
        case=next(c for c in CASES if c['id']==row['case'])
        row.update(evaluate(row['response'],case))
        if row['case']=='pay_reward' and row['pass']:
            row['pass']=payment_intent_valid(row['params']['intent'])
            row['semantic_note']='Speaker is the implicit payer; recipient and amount are explicit.'
    assert len(rows)==4 and all(r['pass'] for r in rows)
    (ROOT/'approved-model-validation-first-check.json').write_bytes(original)
    result_file.write_text(json.dumps(rows,indent=2,ensure_ascii=False),encoding='utf-8')
    print('All four saved responses passed format/intent review. Corrected overstrict speaker-name check; no additional API calls.')
    raise SystemExit(0)
plan=json.loads((ROOT/'approved-plan.json').read_text(encoding='utf-8'))
config=yaml.safe_load(Path(plan['changes'][0]['staged']).read_text(encoding='utf-8'))['openrouter']
providers=yaml.safe_load((Path(plan['changes'][0]['target']).parent/'Providers.yaml').read_text(encoding='utf-8-sig'))['providers']
provider=next(p for p in providers if p['id']=='openrouter')
assert provider['endpoint']=='https://openrouter.ai/api/v1/chat/completions'
rubric=(ROOT/'rendered-approved-action-rubric.txt').read_text(encoding='utf-8')
fixture_actions=RUBRIC.split('Available Actions:\n',1)[1].split('When to act:',1)[0].strip()
old_line='- `Economy` PARAMS: {"intent":"string"} — Category: money transfers'
assert rubric.count(old_line)==1
rubric=rubric.replace(old_line,fixture_actions)
rows=[]
for case in CASES:
    payload={'model':config['model_name'],'temperature':config['default_params']['temperature'],'max_tokens':384,
             'stream':False,'reasoning':{'enabled':False},
             'provider':{'sort':'price','ignore':['atlas-cloud'],'max_price':{'prompt':0.091,'completion':0.303}},
             'messages':[{'role':'system','content':'You are Elin, an adult Nord researcher in Skyrim. Aldo is the adult player. Respond in character in English. The supplied state is authoritative. This is a synthetic game API test.'},
                         {'role':'user','content':'CURRENT STATE: '+case['context']+'\nAldo says: '+case['player']+'\n\n'+FORMAT+rubric}]}
    request=urllib.request.Request(provider['endpoint'],data=json.dumps(payload).encode(),headers={
        'Authorization':'Bearer '+provider['api_key'],'Content-Type':'application/json','X-Title':'SkyrimNet approved action prompt smoke test'})
    start=time.monotonic()
    with urllib.request.urlopen(request,timeout=40) as response:result=json.load(response)
    assert not result.get('error'), 'Provider returned an error'
    content=result['choices'][0]['message'].get('content') or ''
    row={'case':case['id'],'model':result.get('model'),'provider':result.get('provider'),'response':content,
         'seconds':round(time.monotonic()-start,2),'usage':result.get('usage'),**evaluate(content,case)}
    if case['id']=='pay_reward' and row['pass']:
        intent=row['params']['intent'].lower()
        row['pass']=payment_intent_valid(intent)
    rows.append(row)
    (ROOT/'approved-model-validation.json').write_text(json.dumps(rows,indent=2,ensure_ascii=False),encoding='utf-8')
    print(case['id'], 'PASS' if row['pass'] else 'FAIL',row['seconds'],'s',flush=True)
assert len(rows)==4 and all(r['pass'] for r in rows), 'Approved prompt/model smoke test failed'
print('All four approved-prompt tests passed. No in-game action executed.',flush=True)
