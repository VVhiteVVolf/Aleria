"""Restore base plus verified incremental supplement to a NEW staging directory."""
import argparse,csv,hashlib,importlib.util,json,os,shutil,sys,zipfile
from pathlib import Path
CHUNK=4194304
def digest(path):
    h=hashlib.sha256()
    with path.open('rb') as f:
        while b:=f.read(CHUNK):h.update(b)
    return h.hexdigest()
def restore(backup,destination,scope,mods):
    if destination.exists():raise RuntimeError('Destination must be a NEW staging directory; live installations are never overwritten.')
    spec=importlib.util.spec_from_file_location('base_restore',backup/'tools/restore_backup.py')
    lib=importlib.util.module_from_spec(spec);spec.loader.exec_module(lib)
    base=json.loads((backup/'BACKUP_COMPLETE.json').read_text(encoding='utf-8'))
    pointer=json.loads((backup/'LATEST_BACKUP.json').read_text(encoding='utf-8'))
    update=backup.joinpath(*lib.safe_relative(pointer['supplement']).parts)
    receipt=json.loads((update/'COMPLETE.json').read_text(encoding='utf-8'))
    assert base['status']=='VERIFIED' and receipt['status']=='VERIFIED'
    assert digest(backup/'BACKUP_COMPLETE.json')==receipt['base_receipt_sha256'],'Wrong base snapshot'
    for name,h in receipt['control_sha256'].items():
        assert digest(update.joinpath(*lib.safe_relative(name).parts))==h,'Supplement checksum mismatch: '+name
    custom=set(json.loads((update/'added-mod-folders-current.json').read_text(encoding='utf-8')))
    if mods and (scope!='custom' or not set(mods)<=custom):raise ValueError('--mod requires --scope custom and a current additional mod name')
    def wanted(name):
        parts=lib.safe_relative(name).parts
        if scope=='all':return True
        if scope=='profiles':return parts[:3]==('instance','MODS','profiles')
        if scope=='migration' and (parts[:3] in [('instance','MODS','profiles'),('instance','MODS','overwrite')] or parts[:2]==('instance','MO2') or parts[0]=='external'):return True
        return len(parts)>=4 and parts[:3]==('instance','MODS','mods') and parts[3] in custom and (not mods or parts[3] in mods)
    removed={n.casefold() for n in json.loads((update/'removed-paths.json').read_text(encoding='utf-8'))}
    with (update/'delta.manifest.csv').open(encoding='utf-8',newline='') as f:delta={r['path'].casefold():r for r in csv.DictReader(f)}
    packages=[];paths=set();total=0
    for pack in base['packages']:
        rows=[]
        with (backup/pack['manifest']).open(encoding='utf-8',newline='') as f:
            for row in csv.DictReader(f):
                key=row['path'].casefold()
                if key in removed or key in delta or not wanted(row['path']):continue
                assert key not in paths,'Duplicate path';paths.add(key);rows.append(row);total+=int(row['bytes'])
        if rows:packages.append((backup/pack['archive'],rows))
    rows=[r for r in delta.values() if wanted(r['path'])]
    for r in rows:
        assert r['path'].casefold() not in paths
        paths.add(r['path'].casefold());total+=int(r['bytes'])
    if rows:packages.append((update/'delta.zip',rows))
    assert paths,'No selected files'
    ancestor=destination.parent
    while not ancestor.exists():ancestor=ancestor.parent
    assert shutil.disk_usage(ancestor).free>total+2*1024**3,'Not enough staging space'
    destination.mkdir(parents=True)
    count=0
    for archive,rows in packages:
        print('Restoring',archive.name,len(rows),'files',flush=True)
        # Effective newest file list avoids any overwrite or delete in the staging directory.
        count+=lib.extract_package(archive,rows,destination,'all',custom,[])
    for name in json.loads((update/'empty-directories.json').read_text(encoding='utf-8')):
        if wanted(name):destination.joinpath(*lib.safe_relative(name).parts).mkdir(parents=True,exist_ok=True)
    result={'status':'VERIFIED','scope':scope,'mods':mods,'files':count,'bytes':total,'base':str(backup),'supplement':str(update),'each_restored_file_sha256_verified':True}
    (destination/'RESTORE_LATEST_VERIFIED.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
    print(json.dumps(result),flush=True)
if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--backup',type=Path,default=Path(__file__).resolve().parent.parent)
    p.add_argument('--destination',type=Path,required=True)
    p.add_argument('--scope',choices=['custom','profiles','migration','all'],default='migration')
    p.add_argument('--mod',action='append',default=[])
    a=p.parse_args();restore(a.backup,a.destination,a.scope,a.mod)
