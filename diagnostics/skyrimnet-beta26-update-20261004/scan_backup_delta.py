"""Inventory a full-instance incremental supplement; never mutates source files."""
import csv,json,os,sys,time
from pathlib import Path
sys.stdout.reconfigure(encoding='utf-8',errors='replace')
ROOT=Path(__file__).parent
BACKUP=Path(r'D:\Nolvus-Backups\Awakening-6.0.20-vor-Update-20260930')
INSTANCE=Path(r'E:\Nolvus\Instances\Nolvus Awakening')
OLD=Path(r'E:\Aleria\diagnostics\nolvus-update-preflight-20260930')
base=json.loads((BACKUP/'BACKUP_COMPLETE.json').read_text(encoding='utf-8'))
index={}
for package in base['packages']:
    with (BACKUP/package['manifest']).open(encoding='utf-8',newline='') as f:
        for r in csv.DictReader(f):
            key=r['path'].casefold()
            assert key not in index
            index[key]=(r['path'],int(r['bytes']),int(r['mtime_ns']))
print('Baseline indexed:',len(index),flush=True)
spec=[{'source':str(INSTANCE),'prefix':'instance'}]
for item in json.loads((OLD/'critical-spec.json').read_text(encoding='utf-8')):
    if not Path(item['source']).is_relative_to(INSTANCE):spec.append(item)
changed=[];seen=set();empty=[];count=0;total=0;last=time.monotonic()
mandatory=['instance/MODS/profiles/','instance/MO2/ModOrganizer.ini','instance/MODS/mods/SkyrimNet - Beta','instance/MODS/mods/SkyrimNet - Personal','instance/MODS/mods/Twisted - Prisma UI/']
def visit(p,name):
    global count,total,last
    key=name.casefold()
    assert key not in seen,'Duplicate source path: '+name
    seen.add(key);st=p.stat();count+=1
    prior=index.get(key)
    forced=any(name.casefold().startswith(prefix.casefold()) for prefix in mandatory)
    if forced or prior is None or (st.st_size,st.st_mtime_ns)!=(prior[1],prior[2]):
        changed.append({'source':str(p),'prefix':name});total+=st.st_size
    if time.monotonic()-last>15:
        print('Scanned',count,'files; selected',len(changed),f'({total/2**30:.2f} GiB)',flush=True);last=time.monotonic()
def walk(source,prefix):
    if source.is_symlink() or source.is_junction():raise RuntimeError('Source reparse point: '+str(source))
    if source.is_file():visit(source,prefix);return
    if not source.is_dir():raise FileNotFoundError(source)
    def onerror(e):raise e
    for directory,dirs,files in os.walk(source,followlinks=False,onerror=onerror):
        root=Path(directory)
        for name in dirs+files:
            p=root/name
            if p.is_symlink() or p.is_junction():raise RuntimeError('Source reparse point: '+str(p))
        rel=root.relative_to(source).as_posix()
        virtual=prefix+('/'+rel if rel!='.' else '')
        if not dirs and not files:empty.append(virtual+'/')
        for name in files:visit(root/name,virtual+'/'+name)
for item in spec:walk(Path(item['source']),item['prefix'])
removed=[r[0] for k,r in index.items() if k not in seen]
(ROOT/'delta-spec.json').write_text(json.dumps(changed,indent=2),encoding='utf-8')
(ROOT/'removed-paths.json').write_text(json.dumps(removed,indent=2),encoding='utf-8')
(ROOT/'empty-directories.json').write_text(json.dumps(empty,indent=2),encoding='utf-8')
summary={'source_files_scanned':count,'base_files':len(index),'selected_files':len(changed),'selected_bytes':total,'removed_since_base':len(removed),'detection':'Full source tree; size/mtime comparison with base manifests plus forced recapture of current profiles, SkyrimNet layers, and PrismaUI; capture hashes and independently verifies every selected file.'}
(ROOT/'delta-scan.json').write_text(json.dumps(summary,indent=2),encoding='utf-8')
# Current mod membership, priority and activation are necessary for selective migration.
mods=INSTANCE/'MODS/mods';profiles=INSTANCE/'MODS/profiles'
def read(name):
    return {line[1:]:{'enabled':line[0]=='+','priority_in_file':i} for i,line in enumerate((profiles/name/'modlist.txt').read_text(encoding='utf-8-sig').splitlines()) if line[:1] in ['+','-']}
baseline=read('Nolvus Awakening');current=read('Nolvus Awakening - SkyrimNet Beta25 Test')
folders=[p.name for p in mods.iterdir() if p.is_dir()]
custom=sorted(set(folders)-set(baseline))
(ROOT/'added-mod-folders-current.json').write_text(json.dumps(custom,ensure_ascii=False,indent=2),encoding='utf-8')
with (ROOT/'migration-map-current.csv').open('w',encoding='utf-8-sig',newline='') as f:
    w=csv.DictWriter(f,fieldnames=['name','classification','enabled','priority_in_file','source']);w.writeheader()
    for n in sorted(folders):w.writerow({'name':n,'classification':'ADDITIONAL' if n in custom else 'BASE_MAY_BE_MODIFIED',**current.get(n,{'enabled':False,'priority_in_file':''}),'source':str(mods/n)})
print(json.dumps(summary),flush=True)
