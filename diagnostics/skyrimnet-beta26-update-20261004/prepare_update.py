import hashlib,json,zipfile,difflib,sys
from pathlib import Path, PurePosixPath
sys.stdout.reconfigure(encoding='utf-8',errors='replace')
ROOT=Path(__file__).parent
MODS=Path(r'E:\Nolvus\Instances\Nolvus Awakening\MODS\mods')
ARCHIVE=MODS.parent/'downloads/skyrimnet-beta26-rc4.zip'
def sha(p):
    h=hashlib.sha256()
    with p.open('rb') as f:
        while b:=f.read(4*1024*1024): h.update(b)
    return h.hexdigest()
release=json.loads((ROOT/'release.json').read_text(encoding='utf-8-sig'))
expected=next(a['digest'].split(':')[1] for a in release['assets'] if a['name']==ARCHIVE.name)
assert sha(ARCHIVE)==expected, 'Official release digest mismatch'
stage=ROOT/'upstream'
stage.mkdir(exist_ok=True)
with zipfile.ZipFile(ARCHIVE) as z:
    assert z.testzip() is None
    for n in z.namelist():
        p=PurePosixPath(n)
        assert not p.is_absolute() and '..' not in p.parts and '\\' not in n and ':' not in n
    z.extractall(stage)
old=MODS/'SkyrimNet - Beta 25.1 Hotfix'
runtime=MODS/'SkyrimNet - Beta25 Test Runtime 20260927'
collisions=[]
for p in runtime.rglob('*'):
    if not p.is_file(): continue
    rel=p.relative_to(runtime)
    if (stage/rel).is_file():
        row={'path':rel.as_posix(),'same_new':sha(p)==sha(stage/rel),'same_old':(old/rel).is_file() and sha(p)==sha(old/rel)}
        collisions.append(row)
(ROOT/'runtime-collisions.json').write_text(json.dumps(collisions,indent=2),encoding='utf-8')
before=(old/'Source/Scripts/skynet_WheelMenu.psc').read_text(encoding='utf-8-sig')
after=(stage/'Source/Scripts/skynet_WheelMenu.psc').read_text(encoding='utf-8-sig')
(ROOT/'wheel-upstream.diff').write_text(''.join(difflib.unified_diff(before.splitlines(True),after.splitlines(True),fromfile='25.1',tofile='26')),encoding='utf-8')
print('Official archive SHA-256 verified:',expected)
print('Runtime collisions:',len(collisions),'unchanged old defaults:',sum(r['same_old'] for r in collisions),'custom:',sum(not r['same_old'] for r in collisions))
print('Wheel upstream diff:\n'+(ROOT/'wheel-upstream.diff').read_text(encoding='utf-8'))
print('Custom collision paths:',[r['path'] for r in collisions if not r['same_old']][:30])
