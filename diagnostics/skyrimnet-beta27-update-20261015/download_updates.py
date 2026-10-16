"""Download and verify only the public releases selected for installed extensions."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import hashlib
import json
import urllib.request
import zipfile

ROOT=Path(__file__).parent
REPOS=['Severause--SeverActions','Gerkinfeltser--IntelEngine-GamePlugin',
       'pdusen--skyrimnet-plugin-narrative-engine','tetherball88--OStimNet','tetherball88--maras']

def fetch(repo):
    release=json.loads((ROOT/'releases'/(repo+'.json')).read_text())[0]
    asset=next(a for a in release['assets'] if a['name'].endswith('.zip') and 'Pre-25' not in a['name'])
    target=ROOT/'downloads'/asset['name'];target.parent.mkdir(exist_ok=True)
    expected=asset['digest'].removeprefix('sha256:')
    if not target.exists():
        request=urllib.request.Request(asset['browser_download_url'],headers={'User-Agent':'local-skyrimnet-update'})
        with urllib.request.urlopen(request,timeout=90) as response,target.open('wb') as stream:
            while chunk:=response.read(1024*1024):stream.write(chunk)
    actual=hashlib.sha256(target.read_bytes()).hexdigest()
    assert actual==expected and target.stat().st_size==asset['size'],'Archive verification failed'
    dest=ROOT/'upstream'/repo
    with zipfile.ZipFile(target) as archive:
        assert archive.testzip() is None,'Archive CRC failed'
        for member in archive.infolist():
            assert (dest/member.filename).resolve().is_relative_to(dest.resolve()),'Unsafe archive path'
        archive.extractall(dest)
    return {'repo':repo,'tag':release['tag_name'],'archive':str(target),'sha256':actual,'release_url':release['html_url'],'extracted':str(dest)}

if __name__=='__main__':
    results=[]
    with ThreadPoolExecutor(max_workers=3) as pool:
        for row in pool.map(fetch,REPOS):results.append(row);print(json.dumps(row),flush=True)
    (ROOT/'download-receipts.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
