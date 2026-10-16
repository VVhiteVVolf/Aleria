"""Fetch public release metadata for installed SkyrimNet components."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import json
import urllib.request

ROOT=Path(__file__).parent
REPOS=['MinLL/SkyrimNet-GamePlugin','Severause/SeverActions','Gerkinfeltser/IntelEngine-GamePlugin',
       'pdusen/skyrimnet-plugin-narrative-engine','tetherball88/OStimNet','tetherball88/maras',
       'PrismaUI-SKSE/framework','tetherball88/OStimNavigator']

def fetch(repo):
    request=urllib.request.Request('https://api.github.com/repos/'+repo+'/releases?per_page=8',headers={'User-Agent':'local-skyrimnet-update-audit'})
    try:
        with urllib.request.urlopen(request,timeout=35) as response:rows=json.load(response)
        target=ROOT/'releases'/(repo.replace('/','--')+'.json')
        target.parent.mkdir(exist_ok=True)
        target.write_text(json.dumps(rows,indent=2),encoding='utf-8')
        return {'repo':repo,'releases':[{'tag':r['tag_name'],'date':r['published_at'],'prerelease':r['prerelease'],
                                       'assets':[a['name'] for a in r['assets']]} for r in rows[:3]]}
    except Exception as error:
        return {'repo':repo,'error':str(error)}

if __name__=='__main__':
    with ThreadPoolExecutor(max_workers=4) as pool:
        for row in pool.map(fetch,REPOS):print(json.dumps(row),flush=True)
