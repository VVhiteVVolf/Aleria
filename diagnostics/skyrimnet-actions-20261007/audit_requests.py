"""Compare response action coverage across dates, without any live API calls."""
from pathlib import Path
from collections import Counter, defaultdict
import json
import re

ROOT = Path(r'C:\Users\fhg_r\Downloads\Logs')
OUT = Path(__file__).parent
HEADER = re.compile(r'^\[(.*?)\] \[([^]]*)\] (?:Generate(?:Streaming)?(?: complete)?|Decide) (request|response) \[([^]]*)\]:\s*$', re.M)

def records(path):
    text = path.read_text(encoding='utf-8-sig', errors='replace')
    headers = list(HEADER.finditer(text))
    for i, match in enumerate(headers):
        yield (*match.groups(), text[match.end():headers[i+1].start() if i+1<len(headers) else len(text)].strip())

def main():
    daily = defaultdict(Counter)
    requests = {}
    for path in ROOT.glob('openrouter_input*.log'):
        for time,variant,kind,req,body in records(path):
            try:
                data=json.JSONDecoder(strict=False).raw_decode(body)[0]
            except json.JSONDecodeError:
                continue
            requests[req]={'time':time, 'variant':variant, 'model':data.get('model'), 'messages':data.get('messages',[])}
    examples=[]
    responses=[]
    for path in ROOT.glob('openrouter_output*.log'):
        for time,variant,kind,req,body in records(path):
            day=time[:10]
            acts=re.findall(r'^\s*ACTION:\s*(\w+)',body,re.M)
            r=requests.get(req,{})
            daily[day]['responses:'+variant]+=1
            if variant in ('default','') or variant.startswith('combat'):
                daily[day]['dialogue_responses']+=1
                daily[day]['dialogue_with_action']+=int(bool(acts))
            for a in acts:
                daily[day]['action:'+a]+=1
            if day>='2026-10-05':
                responses.append({'time':time,'variant':variant,'request_id':req,'model':r.get('model'),'chars':len(body),'actions':acts})
            if day=='2026-10-07' and variant in ('default',''):
                content='\n'.join(m.get('content','') if isinstance(m.get('content'),str) else '' for m in r.get('messages',[]))
                if time.startswith(('2026-10-07 10:17:51', '2026-10-07 09:24:44')):
                    examples.append({'request_id':req,'time':time,'model':r.get('model'),'response':body[:1800],'message_sizes':[{'role':m.get('role'),'chars':len(str(m.get('content','')))} for m in r.get('messages',[])]})
    report={'daily':{k:dict(v) for k,v in sorted(daily.items())},'recent_responses':responses,'examples':examples}
    (OUT/'request-analysis.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print('REQUESTS',len(requests))
    for day,counts in sorted(daily.items()):
        if day>='2026-10-03':
            print(day,json.dumps({k:v for k,v in counts.items() if k.startswith('action:') or k.startswith('dialogue_')},ensure_ascii=False))
    print('EXAMPLES',json.dumps(examples,ensure_ascii=False))

if __name__=='__main__':
    main()
