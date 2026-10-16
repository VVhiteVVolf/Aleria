"""Require all packages verified and reconcile source coverage before completion."""
import csv
import hashlib
import json
import os
import shutil
import time
from datetime import datetime
from pathlib import Path

HERE=Path(__file__).parent
DEST=Path(r'D:\Nolvus-Backups\Awakening-6.0.20-vor-Update-20260930')
INSTANCE=Path(r'E:\Nolvus\Instances\Nolvus Awakening')


def sha256(path):
    digest=hashlib.sha256()
    with path.open('rb') as stream:
        while block:=stream.read(8*1024*1024):digest.update(block)
    return digest.hexdigest()


def finalize():
    expected=['00-Profile-Spielstaende-MO2-Final']+[j['name'] for j in json.loads((HERE/'jobs.json').read_text())]
    sources={};targets=set();packages=[];issues=[];total_files=total_bytes=0
    for name in expected:
        status=json.loads((DEST/(name+'.status.json')).read_text())
        if status.get('stage')!='verified':raise RuntimeError('Unverified package: '+name)
        candidates=[DEST/(name+s) for s in ['.zip','.tar.zst'] if (DEST/(name+s)).exists()]
        if len(candidates)!=1:raise RuntimeError('Ambiguous/missing archive: '+name)
        archive=candidates[0];manifest=DEST/(name+'.manifest.csv')
        count=logical=0
        with manifest.open(newline='',encoding='utf-8') as mf:
            for row in csv.DictReader(mf):
                source=Path(row['source']);key=str(source).casefold()
                if row['path'].casefold() in targets:issues.append({'duplicate_target':row['path']})
                targets.add(row['path'].casefold());sources[key]=row
                try:
                    stat=source.stat()
                    if (stat.st_size,stat.st_mtime_ns)!=(int(row['bytes']),int(row['mtime_ns'])):
                        issues.append({'source_changed':str(source)})
                except OSError as error:issues.append({'source_error':str(source),'error':str(error)})
                count+=1;logical+=int(row['bytes'])
        if count!=status['files'] or logical!=status['source_bytes']:raise RuntimeError('Manifest/status mismatch: '+name)
        packages.append({'archive':archive.name,'manifest':manifest.name,'files':count,'source_bytes':logical,'archive_bytes':archive.stat().st_size,'sha256':status.get('archive_sha256')})
        total_files+=count;total_bytes+=logical
        print('Source metadata reconciled:',name,count,'files',flush=True)
    critical=json.loads((HERE/'critical-spec.json').read_text())
    roots=[INSTANCE]+[Path(item['source']) for item in critical if not Path(item['source']).is_relative_to(INSTANCE)]
    missing=[];seen=0
    for root in roots:
        if root.is_file():
            if str(root).casefold() not in sources:missing.append(str(root))
            continue
        for directory,dirs,files in os.walk(root,followlinks=False,onerror=lambda e:issues.append({'walk_error':str(e)})):
            keep=[]
            for name in dirs:
                path=Path(directory)/name
                if path.is_symlink() or path.is_junction():issues.append({'unhandled_link':str(path)})
                else:keep.append(name)
            dirs[:]=keep
            for name in files:
                path=Path(directory)/name;seen+=1
                if str(path).casefold() not in sources:missing.append(str(path))
    coverage={'source_files_enumerated':seen,'archived_files':total_files,'missing_files':missing,'issues':issues,'checked_at':datetime.now().isoformat()}
    (DEST/'SOURCE_COVERAGE.json').write_text(json.dumps(coverage,ensure_ascii=False,indent=2),encoding='utf-8')
    if missing or issues:raise RuntimeError('Source coverage/integrity issues remain; see SOURCE_COVERAGE.json')
    metadata=DEST/'metadata';tools=DEST/'tools'
    metadata.mkdir(exist_ok=True);tools.mkdir(exist_ok=True)
    for source in HERE.iterdir():
        if not source.is_file():continue
        if source.suffix=='.py':shutil.copy2(source,tools/source.name)
        elif source.name!='README_WIEDERHERSTELLUNG.md':shutil.copy2(source,metadata/source.name)
    shutil.copy2(HERE/'README_WIEDERHERSTELLUNG.md',DEST/'README_WIEDERHERSTELLUNG.md')
    sevenzip=tools/'7zip';sevenzip.mkdir(exist_ok=True)
    for name in ['7z.exe','7z.dll','7zFM.exe','License.txt','readme.txt']:
        shutil.copy2(Path(r'C:\Program Files\7-Zip')/name,sevenzip/name)
    checksums=[]
    for package in packages:
        if not package['sha256']:
            print('Computing archive SHA-256:',package['archive'],flush=True)
            package['sha256']=sha256(DEST/package['archive'])
        checksums.append((package['sha256'],package['archive']))
        checksums.append((sha256(DEST/package['manifest']),package['manifest']))
    for root in [metadata,tools]:
        for path in root.rglob('*'):
            if path.is_file():checksums.append((sha256(path),path.relative_to(DEST).as_posix()))
    checksums.append((sha256(DEST/'README_WIEDERHERSTELLUNG.md'),'README_WIEDERHERSTELLUNG.md'))
    (DEST/'CHECKSUMS.sha256').write_text(''.join(digest+'  '+name+'\n' for digest,name in checksums),encoding='utf-8')
    result={'status':'VERIFIED','created_at':datetime.now().isoformat(),'source_instance':str(INSTANCE),'nolvus_version':'6.0.20','profile':'Nolvus Awakening - SkyrimNet Beta25 Test','files':total_files,'source_gib':round(total_bytes/2**30,2),'archives_gib':round(sum(p['archive_bytes'] for p in packages)/2**30,2),'packages':packages,'source_coverage':'SOURCE_COVERAGE.json','limitations':['No game compatibility claim for an updated Nolvus version','Programs outside Nolvus such as Miniconda are not copied in full'],'superseded_archives':['00-Profile-Spielstaende-MO2.zip']}
    marker=DEST/'BACKUP_COMPLETE.json'
    if marker.exists():raise FileExistsError(marker)
    marker.write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({k:v for k,v in result.items() if k!='packages'},ensure_ascii=False),flush=True)


if __name__=='__main__':finalize()
