from pathlib import Path
import csv
import hashlib
import json
import os
import sys
from inventory import OUT, MODS, walk_files

sys.stdout.reconfigure(encoding='utf-8')
BACKUP=Path(r'D:\Nolvus-Backups\Awakening-6.0.20-vor-Update-20260930')

def main():
    inv=json.loads((OUT/'inventory.json').read_text(encoding='utf-8'))
    records=json.loads((OUT/'plugin-records.json').read_text(encoding='utf-8'))
    inactive={m['mod']:m for m in inv['inactive_mods']}
    manifest={}; archive_status={}
    for file in BACKUP.glob('*.manifest.csv'):
        status=Path(str(file).replace('.manifest.csv','.status.json'))
        data=json.loads(status.read_text(encoding='utf-8')) if status.exists() else {}
        if data.get('stage')!='verified':continue
        prefix=file.name.removesuffix('.manifest.csv')
        archive=next((a for a in [BACKUP/(prefix+'.zip'),BACKUP/(prefix+'.tar.zst')] if a.exists()),None)
        if not archive:continue
        archive_status[prefix]={'archive':str(archive),'bytes':archive.stat().st_size,'capture_verification':data.get('verification')}
        with file.open(encoding='utf-8-sig',newline='') as f:
            for row in csv.DictReader(f):
                parts=row['path'].replace('\\','/').split('/')
                if len(parts)>4 and parts[:3]==['instance','MODS','mods'] and parts[3] in inactive:
                    manifest.setdefault(parts[3],{})['/'.join(parts[4:]).lower()]={'sha256':row['sha256'],'bytes':int(row['bytes']),'backup_group':prefix}
    plans=[];verified_files=[]
    required={master.lower() for p in records['headers'].values() for master in p['masters']}
    for name,mod in inactive.items():
        reasons=[]
        if mod['enabled_in_profiles']:reasons.append('Enabled in another MO2 profile: '+', '.join(mod['enabled_in_profiles']))
        # Keep repair resources until the complete body audit has resolved every conversion gap.
        if mod['body_support']:reasons.append('BodySlide sources/conversion; potentially needed for audited repair or later rebuild')
        if any(t in name.lower() for t in ['body','himbo','cbbe','rsv','racial skin','skin','texture','skeleton','xp32','xpmsse','collision','physics','tng','feet','hand','pandora','nemesis','dyn','synthesis','texgen','hood','hair','beard','brow','overlay','makeup','eyes','tattoo','beauty','head','wench','acheron','golden saint','bnp','seamfix','beasthhbb','efm se','hdt-smp vanilla armors',"savior's hide",'procedural penis']):
            reasons.append('Body/appearance/tool/dependency or potentially needed repair resource')
        directory=MODS/name
        for file in directory.iterdir():
            if file.suffix.lower() in {'.esm','.esp','.esl'} and file.name.lower() in required and file.name.lower() not in inv['plugin_providers']:
                reasons.append('Exclusive provider of active plugin master '+file.name)
        if reasons:
            plans.append(mod|{'decision':'KEEP','reasons':reasons});continue
        expected=manifest.get(name,{})
        if not expected:plans.append(mod|{'decision':'KEEP','reasons':['No verified full backup manifest found']});continue
        actual=[];failures=[];groups=set()
        for file in walk_files(directory):
            relative=str(file.relative_to(directory)).replace('\\','/')
            entry=expected.get(relative.lower())
            if not entry or entry['bytes']!=file.stat().st_size:failures.append(relative);continue
            with file.open('rb') as f:digest=hashlib.file_digest(f,'sha256').hexdigest()
            if digest!=entry['sha256']:failures.append(relative);continue
            groups.add(entry['backup_group']);actual.append({'path':str(file),'relative':relative,'sha256':digest,'bytes':entry['bytes']})
        if failures or len(actual)!=mod['files']:
            plans.append(mod|{'decision':'KEEP','reasons':['Current files differ from backup or incomplete capture'],'unverified_files':failures[:10]});continue
        if directory.is_symlink() or any(os.path.islink(f['path']) for f in actual):
            plans.append(mod|{'decision':'KEEP','reasons':['Filesystem link requires separate inspection']});continue
        plans.append(mod|{'decision':'DELETE','reasons':['Inactive in every saved profile; no identified body/rebuild dependency; every current file SHA-256 matches the verified D: backup'],'backup_groups':sorted(groups),'verified_files':actual})
        print('Verified cleanup candidate',name,round(mod['bytes']/2**30,3),'GiB',flush=True)
    result={'backup_root':str(BACKUP),'archives':archive_status,'mods':plans,'candidate_bytes':sum(m['bytes'] for m in plans if m['decision']=='DELETE'),'candidate_count':sum(m['decision']=='DELETE' for m in plans),'deleted':False}
    (OUT/'cleanup-plan.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    with (OUT/'inactive-mods-cleanup.csv').open('w',encoding='utf-8-sig',newline='') as f:
        writer=csv.writer(f);writer.writerow(['mod','GiB','decision','reason'])
        for m in sorted(plans,key=lambda m:m['bytes'],reverse=True):writer.writerow([m['mod'],round(m['bytes']/2**30,3),m['decision'],'; '.join(m['reasons'])])
    print(json.dumps({'candidates':result['candidate_count'],'candidate_GiB':round(result['candidate_bytes']/2**30,3),'retained':sum(m['decision']=='KEEP' for m in plans)},indent=2))

if __name__=='__main__':main()
