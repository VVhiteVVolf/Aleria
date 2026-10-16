"""Include MO2's custom separator folders in selective restoration."""
import csv,json,hashlib
from pathlib import Path
ROOT=Path(__file__).parent
UPDATE=Path(r'D:\Nolvus-Backups\Awakening-6.0.20-vor-Update-20260930\updates\20261004-SkyrimNet-Beta26-Prisma151')
MODS=Path(r'E:\Nolvus\Instances\Nolvus Awakening\MODS\mods')
profiles=MODS.parent/'profiles'
def profile(name):
    return {s[1:]:{'enabled':s[0]=='+','priority_in_file':i} for i,s in enumerate((profiles/name/'modlist.txt').read_text(encoding='utf-8-sig').splitlines()) if s[:1] in ['+','-']}
baseline=profile('Nolvus Awakening');current=profile('Nolvus Awakening - SkyrimNet Beta25 Test')
path=UPDATE/'added-mod-folders-current.json';custom=json.loads(path.read_text())
separators=[p.name for p in MODS.iterdir() if p.is_dir() and p.name.endswith('_separator') and p.name not in baseline]
custom=sorted(set(custom)|set(separators))
path.write_text(json.dumps(custom,ensure_ascii=False,indent=2),encoding='utf-8')
mapfile=UPDATE/'migration-map-current.csv'
with mapfile.open(encoding='utf-8-sig',newline='') as f:reader=csv.DictReader(f);fields=reader.fieldnames;rows=list(reader)
names={r['name'] for r in rows}
for n in separators:
    if n not in names:rows.append({'name':n,'classification':'ADDITIONAL_SEPARATOR',**current[n],'source':str(MODS/n)})
with mapfile.open('w',encoding='utf-8-sig',newline='') as f:w=csv.DictWriter(f,fieldnames=fields);w.writeheader();w.writerows(sorted(rows,key=lambda r:r['name']))
receipt=json.loads((UPDATE/'COMPLETE.json').read_text())
for n in ['added-mod-folders-current.json','migration-map-current.csv']:
    receipt['control_sha256'][n]=hashlib.sha256((UPDATE/n).read_bytes()).hexdigest()
(UPDATE/'COMPLETE.json').write_text(json.dumps(receipt,indent=2),encoding='utf-8')
print('Current custom folders including MO2 separators:',len(custom),'separator folders:',len(separators))
