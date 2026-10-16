"""Install verified upstream as a separate MO2 mod, preserving all user layers."""
import json,hashlib,shutil,subprocess,sys,zipfile
from pathlib import Path
sys.stdout.reconfigure(encoding='utf-8',errors='replace')
ROOT=Path(__file__).parent
BASE=Path(r'E:\Nolvus\Instances\Nolvus Awakening')
MODS=BASE/'MODS/mods'
PROFILE=BASE/'MODS/profiles/Nolvus Awakening - SkyrimNet Beta25 Test'
NEW='SkyrimNet - Beta 26 RC4'
OLD='SkyrimNet - Beta 25.1 Hotfix'
def sha(p):
    h=hashlib.sha256()
    with p.open('rb') as f:
        while b:=f.read(4194304):h.update(b)
    return h.hexdigest()
def stopped():
    r=subprocess.run(['powershell','-NoProfile','-Command','Get-Process SkyrimSE,ModOrganizer -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Id'],capture_output=True,text=True)
    assert not r.stdout.strip(),'Skyrim or MO2 running; stop safely'
stopped()
assert not (MODS/NEW).exists()
assert json.loads((ROOT/'runtime-collisions.json').read_text())==[]
assert not (ROOT/'wheel-upstream.diff').read_text().strip()
protected={}
for name in ['SkyrimNet - Beta25 Test Runtime 20260927','SkyrimNet - Personal Prompt Import 20260927','SkyrimNet - Beta 25 Local Compatibility']:
    for p in (MODS/name).rglob('*'):
        if p.is_file(): protected[str(p)]=sha(p)
(ROOT/'protected-before.json').write_text(json.dumps(protected,indent=2),encoding='utf-8')
with zipfile.ZipFile(ROOT/'personal-before.zip','x',compression=zipfile.ZIP_DEFLATED,compresslevel=1) as z:
    for name in protected:
        p=Path(name)
        rel=p.relative_to(MODS)
        # Logs and distributed model binaries are recoverable from the full migration backup.
        if '/logs/' not in rel.as_posix() and '/models/' not in rel.as_posix(): z.write(p,rel.as_posix())
    for filename in ['modlist.txt','plugins.txt','loadorder.txt']:
        z.write(PROFILE/filename,'profile/'+filename)
    z.write(MODS/'Twisted - Prisma UI/meta.ini','prisma-meta.ini')
stopped()
shutil.copytree(ROOT/'upstream',MODS/NEW)
(MODS/NEW/'meta.ini').write_text('[General]\ngameName=SkyrimSE\nmodid=0\nversion=0.26.0-rc4\ninstallationFile=E:/Nolvus/Instances/Nolvus Awakening/MODS/downloads/skyrimnet-beta26-rc4.zip\nrepository=Nexus\nurl=https://github.com/MinLL/SkyrimNet-GamePlugin/releases/tag/vbeta26-rc4\nhasCustomURL=true\nnotes=Verified official Beta26 RC4. Personal prompts and runtime remain in existing separate layers.\n',encoding='utf-8')
original=(PROFILE/'modlist.txt').read_bytes()
text=original.decode('utf-8-sig')
assert text.count('+'+OLD)==1
text=text.replace('+'+OLD,'+'+NEW+'\r\n-'+OLD)
(PROFILE/'modlist.txt').write_bytes(text.encode('utf-8-sig'))
meta=MODS/'Twisted - Prisma UI/meta.ini'
txt=meta.read_text(encoding='utf-8-sig')
import re
txt=re.sub(r'^version=.*$', 'version=1.5.1',txt,flags=re.M)
txt=re.sub(r'^url=.*$', 'url=https://github.com/PrismaUI-SKSE/framework/releases/tag/1.5.1',txt,flags=re.M)
txt=re.sub(r'^hasCustomURL=.*$', 'hasCustomURL=true',txt,flags=re.M)
txt=re.sub(r'^installationFile=.*$', 'installationFile=E:/Aleria/diagnostics/skyrimnet-wheel-animation-20261003-104553/internet-check/PrismaUI_1.5.1.zip',txt,flags=re.M)
meta.write_text(txt,encoding='utf-8')
assert sha(MODS/'Twisted - Prisma UI/SKSE/plugins/PrismaUI.dll')=='0cf08d0cac246dcb6fcd71266a7d9af2bfd2b762289432ac1b33d5b1cddceb3d'
assert all(sha(Path(p))==h for p,h in protected.items())
verified=0
for p in (ROOT/'upstream').rglob('*'):
    if p.is_file(): assert sha(p)==sha(MODS/NEW/p.relative_to(ROOT/'upstream'));verified+=1
# Verify each upstream file's effective winner; only the explicitly preserved wheel override is allowed.
enabled=[line[1:] for line in (PROFILE/'modlist.txt').read_text(encoding='utf-8-sig').splitlines() if line.startswith('+')]
overrides=[]
for p in (ROOT/'upstream').rglob('*'):
    if not p.is_file():continue
    rel=p.relative_to(ROOT/'upstream')
    candidates=[BASE/'MODS/overwrite'/rel]+[MODS/n/rel for n in enabled]
    winner=next((q for q in candidates if q.is_file()),None)
    assert winner is not None
    if sha(winner)!=sha(p): overrides.append({'path':rel.as_posix(),'winner':str(winner)})
assert {r['path'] for r in overrides}=={'Scripts/skynet_WheelMenu.pex','Source/Scripts/skynet_WheelMenu.psc'},overrides
receipt={'status':'INSTALLED_FILE_VERIFIED_NOT_GAME_TESTED','release':'vbeta26-rc4','profile':PROFILE.name,'new_mod':NEW,'disabled_previous_core':OLD,'upstream_files_verified':verified,'personal_files_unchanged':len(protected),'preserved_overrides':overrides,'prisma_version':'1.5.1','plugins_and_loadorder':'unchanged'}
(ROOT/'installation.json').write_text(json.dumps(receipt,indent=2),encoding='utf-8')
print(json.dumps(receipt,ensure_ascii=False,indent=2))
