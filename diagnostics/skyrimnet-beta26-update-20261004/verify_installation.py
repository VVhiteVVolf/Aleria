"""Validate preserved YAML/JSON and plugin masters without exposing settings or secrets."""
import json,sys,struct,yaml
from pathlib import Path
sys.stdout.reconfigure(encoding='utf-8',errors='replace')
ROOT=Path(__file__).parent
BASE=Path(r'E:\Nolvus\Instances\Nolvus Awakening')
mods=BASE/'MODS/mods';profile=BASE/'MODS/profiles/Nolvus Awakening - SkyrimNet Beta25 Test'
config=mods/'SkyrimNet - Beta25 Test Runtime 20260927/SKSE/Plugins/SkyrimNet/config'
errors=[];count=0
for p in config.iterdir():
    if p.suffix not in ['.json','.yaml']:continue
    try:
        text=p.read_text(encoding='utf-8-sig')
        json.loads(text) if p.suffix=='.json' else yaml.safe_load(text)
        count+=1
    except Exception as e: errors.append({'file':p.name,'error_type':type(e).__name__})
assert not errors,errors
plugin=mods/'SkyrimNet - Beta 26 RC4/SkyrimNet.esp'
b=plugin.read_bytes();assert b[:4]==b'TES4'
size=struct.unpack_from('<I',b,4)[0];pos=24;masters=[]
while pos<24+size:
    kind=b[pos:pos+4];length=struct.unpack_from('<H',b,pos+4)[0];data=b[pos+6:pos+6+length];pos+=6+length
    if kind==b'MAST':masters.append(data.rstrip(b'\0').decode())
enabled={line.lstrip('*').casefold() for line in (profile/'plugins.txt').read_text(encoding='utf-8-sig').splitlines() if line.startswith('*')}
assert 'skyrimnet.esp' in enabled
missing=[n for n in masters if n.casefold() not in enabled and not (BASE/'STOCK GAME/Data'/n).exists()]
assert not missing,missing
result={'preserved_config_documents_valid':count,'plugin_enabled':True,'required_masters':masters,'missing_masters':missing,'runtime_test':'Not launched: backups taken while Skyrim and MO2 closed'}
(ROOT/'installation-validation.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print(json.dumps(result))
