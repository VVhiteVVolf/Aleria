"""Bounded, synthetic OpenRouter format test. Does not change Skyrim or send logs."""
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
import hashlib
import json
import re
import time
import urllib.error
import urllib.request
import yaml

ROOT = Path(__file__).parent
CONFIG = Path(r'E:\Nolvus\Instances\Nolvus Awakening\MODS\mods\SkyrimNet - Beta25 Test Runtime 20260927\SKSE\Plugins\SkyrimNet\config\OpenRouter.yaml')
ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions'
MODELS = ['google/gemma-4-31b-it', 'google/gemma-4-26b-a4b-it',
          'qwen/qwen3-235b-a22b-2507', 'deepseek/deepseek-v4-flash-0731', 'z-ai/glm-4.7']

# Synthetic characters, dialogue and form IDs. No user biography/history is transmitted.
FORMAT = '''# Response Format
No headers or labels in your output—just the response itself.
Speak in your natural voice. Respond with your own thoughts, not echoes of what was said.
- No narration, asterisks, or action descriptions
Never emit <thinking> or other reasoning tags. Output only the in-character text.
Each response must advance the conversation—new question, detail, realization, or decision.
## Voice Performance Tags
Use natural language [square bracket tags] to direct vocal performance, before spoken text.
Start tags with a vocal verb such as say, whisper or shout. Non-verbal sounds include [sigh], [gasp], [grunt].
No narration or asterisks—spoken words only.
'''
RUBRIC = '''## Actions Available
After your dialogue you may add ONE action on its own line. Most lines need none. Write your dialogue first, then the action line.
Action Format:
- ACTION: ActionName — an action with no parameters
- ACTION: ActionName PARAMS: {"param": "value"} — use exactly the keys shown
- ACTION: CategoryName PARAMS: {"intent": "what you are doing, to whom, and why now"} — category intent required
- Use each name exactly as listed. No ACTION line when nothing is happening right now.
Execution consistency:
- When you accept a transfer of gold/items now, agree to stop following or wait now, or reach a real quest turning point with an eligible action, include exactly ONE matching ACTION line. A spoken agreement alone does not execute it.
- Use only eligible names and parameter keys below. Category intents preserve who pays whom and the actual amount.
- If no eligible action can perform the request, explain the limitation instead of claiming it happened.
- Previous spoken claims are not proof of execution. Never repeat recorded successful payments.
Available Actions:
- Economy PARAMS: {"intent":"string"} — Category: money changing hands right now; paying or collecting coin, agreed buying/selling, gifts and rewards. Merely quoting a price or discussing payment needs no action.
- Items PARAMS: {"intent":"string"} — Category: give or take an item right now, excluding coin and sales.
- Companionship PARAMS: {"intent":"string"} — Category: join the player, wait here, resume following, dismiss a companion or stop accompanying the player.
- Travel PARAMS: {"intent":"string"} — Category: go to another destination or cancel a travel task. Do not use for following or dismissing a companion.
- TriggerDialogueLine PARAMS: {"form_id":"8 hex characters"} — Execute an explicitly available quest dialogue exchange. Use only the bracketed code shown in the quest context, without brackets.
When to act:
- An action is something you do or settle right now, in the line you just spoke: you agree, obey an order, or decide now.
- Plans for later, hypotheticals, stories and questions need no action. An accepted immediate exchange does.
- Do not repeat what already happened. Categories require concrete intent with sender, recipient, item or amount.
'''
CLARIFICATION = '''\nFINAL OUTPUT CONTRACT — applies after all voice/style rules above:
The spoken-words-only/no-label rules apply ONLY to the spoken dialogue, not to the machine action footer.
If you agree to perform an eligible action now, output the spoken reply, then a newline and exactly ONE plain ACTION: line.
The action line must begin at column 1 with ACTION:. Never wrap it in brackets, quotes, Markdown or code fences. Never put voice tags on it.
Agreement or a claim in dialogue does not execute anything; an accepted immediate transfer, dismissal or quest transition requires its matching footer.
For a category, include PARAMS: {"intent":"specific immediate action and participants"}. For TriggerDialogueLine, include the exact listed form_id.
When no action is appropriate, output dialogue only. Do not invent actions or trigger actions merely to satisfy this format.
'''
CASES = [
    {'id':'pay_reward','context':'Elin owes Aldo an agreed reward of 50 gold. Elin has 200 gold; Aldo has completed the work. Elin is willing to pay now. No payment has occurred.',
     'player':'The work is done. Give me the agreed 50 gold now, please.', 'allowed':['Economy']},
    {'id':'dismiss','context':'Elin is currently accompanying Aldo as his companion. She is willing to leave peacefully. No dismissal has occurred.',
     'player':'Stop following me now. We are parting ways; go back to your own life.', 'allowed':['Companionship']},
    {'id':'quest_accept','context':'Quest: The Missing Ledger. Elin offers Aldo a job recovering her ledger. Available dialogue exchange [FE123ABC]: Player accepts the job; Elin gives directions and the engine starts the quest. This exchange has not fired. Elin wants Aldo to accept.',
     'player':'Yes, I accept the job of recovering your ledger. Tell me where to begin.', 'allowed':['TriggerDialogueLine']},
    {'id':'conversation_only','context':'Elin and Aldo are resting under a roof during rain. Neither has requested any task, trade, journey or quest advancement.',
     'player':'Do you like listening to rain?', 'allowed':[]},
]

def evaluate(content, case):
    markers = list(re.finditer(r'^ACTION:\s*(\w+)(?:\s+PARAMS:\s*(\{.*\}))?\s*$',content,re.M))
    if not case['allowed']:
        return {'pass': 'ACTION:' not in content, 'reason':'no action expected'}
    if len(markers) != 1 or content.count('ACTION:') != 1:
        return {'pass':False, 'reason':'missing, wrapped or multiple action footer'}
    m=markers[0]
    try:
        params=json.loads(m[2] or '{}')
    except ValueError:
        return {'pass':False,'reason':'invalid parameter JSON'}
    valid=m[1] in case['allowed']
    if case['id']=='quest_accept':valid=valid and params.get('form_id')=='FE123ABC'
    else:valid=valid and isinstance(params.get('intent'),str) and bool(params['intent'].strip())
    return {'pass':bool(valid),'reason':'matching footer/parameters' if valid else 'wrong category or missing parameters',
            'action':m[1],'params':params}

def main():
    config=yaml.safe_load(CONFIG.read_text(encoding='utf-8-sig'))['openrouter']
    assert config['endpoint']==ENDPOINT
    providers=yaml.safe_load((CONFIG.parent/'Providers.yaml').read_text(encoding='utf-8-sig'))['providers']
    provider=next(p for p in providers if p['id']=='openrouter')
    assert provider['endpoint']==ENDPOINT
    key=provider.get('api_key') or config.get('api_key','')
    assert key and not key.startswith('${'), 'No configured key; no requests sent'
    prices={x['id']:x['pricing'] for x in json.loads((ROOT/'model-prices.json').read_text(encoding='utf-8'))}
    tasks=[]
    for model in MODELS:
        for mode in ['current_style','clarified_contract']:
            for case in CASES:
                messages=[{'role':'system','content':'You are Elin, an adult Nord researcher in Skyrim. Aldo is the adult player. Respond in character in English. The supplied state is authoritative. This is a synthetic game API test.'},
                          {'role':'user','content':'CURRENT STATE: '+case['context']+'\nAldo says: '+case['player']+'\n\n'+FORMAT+RUBRIC+(CLARIFICATION if mode=='clarified_contract' else '')}]
                tasks.append((model,mode,case,messages))
    # Conservative ceiling: one input token per UTF-8 byte and 384 output tokens/request.
    ceiling=1.01*sum(sum(len(x['content'].encode()) for x in msgs)*float(prices[m]['prompt']) + 384*float(prices[m]['completion']) for m,_,_,msgs in tasks)
    assert ceiling < 0.15, f'Cost ceiling exceeded: {ceiling}'
    (ROOT/'benchmark-fixtures.json').write_text(json.dumps({'format':FORMAT,'rubric':RUBRIC,'clarification':CLARIFICATION,'cases':CASES,'models':MODELS,'request_count':len(tasks),'conservative_usd_ceiling':ceiling},indent=2),encoding='utf-8')
    print(f'Synthetic requests: {len(tasks)}; conservative price ceiling ${ceiling:.4f}; parallelism 2; no retries',flush=True)

    def call(task):
        model,mode,case,messages=task
        payload={'model':model,'messages':messages,'temperature':0.7,'max_tokens':384,'stream':False,
                 'reasoning':{'enabled':False},'provider':{'sort':'price','ignore':['atlas-cloud'],
                 'max_price':{'prompt':float(prices[model]['prompt'])*1e6*1.01,
                              'completion':float(prices[model]['completion'])*1e6*1.01}}}
        data=json.dumps(payload).encode()
        req=urllib.request.Request(ENDPOINT,data=data,headers={'Authorization':'Bearer '+key,'Content-Type':'application/json','X-Title':'SkyrimNet synthetic action format audit'})
        start=time.monotonic()
        row={'requested_model':model,'mode':mode,'case':case['id'],'payload_sha256':hashlib.sha256(data).hexdigest()}
        try:
            with urllib.request.urlopen(req,timeout=45) as response: result=json.load(response)
            if result.get('error'):
                row.update({'error':result['error'],'pass':False})
            else:
                choice=result.get('choices',[{}])[0]
                content=choice.get('message',{}).get('content') or ''
                row.update({'actual_model':result.get('model'),'provider':result.get('provider'),'usage':result.get('usage'),
                            'finish_reason':choice.get('finish_reason'),'response':content,**evaluate(content,case)})
        except urllib.error.HTTPError as error:
            row.update({'error':{'status':error.code,'message':error.read().decode('utf-8',errors='replace')[:600]},'pass':False})
        except Exception as error:
            row.update({'error':{'type':type(error).__name__,'message':str(error)[:250]},'pass':False})
        row['seconds']=round(time.monotonic()-start,2)
        return row

    rows=[]
    with ThreadPoolExecutor(max_workers=2) as pool:
        for future in as_completed([pool.submit(call,t) for t in tasks]):
            row=future.result(); rows.append(row)
            (ROOT/'benchmark-results.json').write_text(json.dumps(rows,indent=2,ensure_ascii=False),encoding='utf-8')
            print(f"{len(rows)}/{len(tasks)} {row['requested_model']} {row['mode']} {row['case']}: {'PASS' if row['pass'] else 'FAIL'} {row['seconds']}s"+(f" ERROR {row['error']}" if 'error' in row else ''),flush=True)
    print('Complete. Synthetic formatting results are not in-game action execution validation.',flush=True)

if __name__=='__main__':main()
