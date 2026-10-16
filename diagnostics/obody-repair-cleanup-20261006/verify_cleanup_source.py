"""Verify every current inactive source against the freshly verified backup manifest."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import collections
import csv
import hashlib
import json
import os
import sys
import time

OUT=Path(__file__).parent

def main():
    plan=json.loads((OUT/'strict-cleanup-plan.json').read_text(encoding='utf-8'))
    archive=Path(plan['backup_archive']);status_path=archive.with_suffix('').with_suffix('.status.json');manifest=archive.with_suffix('').with_suffix('.manifest.csv')
    status=json.loads(status_path.read_text(encoding='utf-8'))
    if status.get('stage')!='verified':raise RuntimeError('Full backup verification not complete')
    with manifest.open(encoding='utf-8',newline='') as f:rows=list(csv.DictReader(f))
    if len(rows)!=status['files']:raise RuntimeError('Incomplete backup manifest')
    candidates={m['mod']:m for m in plan['mods']};root=Path(plan['instance'])/'MODS/mods'
    by_mod=collections.defaultdict(list)
    def verify(row):
        source=Path(row['source']);relative=source.relative_to(root);mod=relative.parts[0]
        if mod not in candidates:raise RuntimeError('Source outside planned inactive mods')
        if source.is_symlink() or source.is_junction():raise RuntimeError('Linked source')
        stat=source.stat()
        if stat.st_size!=int(row['bytes']) or stat.st_mtime_ns!=int(row['mtime_ns']):raise RuntimeError('Source metadata changed: '+str(source))
        with source.open('rb') as f:digest=hashlib.file_digest(f,'sha256').hexdigest()
        if digest!=row['sha256']:raise RuntimeError('Source SHA-256 mismatch: '+str(source))
        return mod,{'relative':source.relative_to(root/mod).as_posix(),'bytes':stat.st_size,'mtime_ns':stat.st_mtime_ns,'sha256':digest}
    print('Verifying',len(rows),'current files against fresh backup',flush=True)
    started=time.monotonic();last=started
    with ThreadPoolExecutor(max_workers=4) as pool:
        for index,(mod,file) in enumerate(pool.map(verify,rows),1):
            by_mod[mod].append(file)
            if time.monotonic()-last>20:
                print('Verified current source files',index,'/',len(rows),flush=True);last=time.monotonic()
    for mod in candidates:
        expected={f['relative'].lower() for f in by_mod[mod]};actual=set()
        for directory,dirs,files in os.walk(root/mod):
            for name in dirs+files:
                path=Path(directory)/name
                if path.is_symlink() or path.is_junction():raise RuntimeError('Unreviewed source link: '+str(path))
            actual.update((Path(directory)/name).relative_to(root/mod).as_posix().lower() for name in files)
        if actual!=expected:raise RuntimeError('Current directory differs from verified backup: '+mod)
    checked=[m|{'verified_files':by_mod[m['mod']],'bytes':sum(f['bytes'] for f in by_mod[m['mod']])} for m in plan['mods']]
    stat=archive.stat()
    result={'complete':True,'archive':str(archive),'archive_bytes':stat.st_size,'archive_mtime_ns':stat.st_mtime_ns,'archive_sha256':status['archive_sha256'],'mods':checked,'total_bytes':sum(m['bytes'] for m in checked),'files':len(rows)}
    (OUT/'strict-cleanup-verified.json').write_text(json.dumps(result,ensure_ascii=False),encoding='utf-8')
    print(json.dumps({'verified_mods':len(checked),'verified_files':len(rows),'GiB':result['total_bytes']/2**30,'seconds':round(time.monotonic()-started)},indent=2),flush=True)

if __name__=='__main__':
    sys.stdout.reconfigure(encoding='utf-8');main()
