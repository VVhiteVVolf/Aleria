from pathlib import Path
import hashlib
import json
from inventory import OUT

def main():
    plan=json.loads((OUT/'cleanup-plan.json').read_text(encoding='utf-8'))
    root=Path(plan['backup_root'])
    expected={}
    for line in (root/'CHECKSUMS.sha256').read_text(encoding='utf-8-sig').splitlines():
        digest,name=line.split(maxsplit=1);expected[name.strip()]=digest
    groups=sorted({g for mod in plan['mods'] if mod['decision']=='DELETE' for g in mod['backup_groups']})
    receipts=[]
    for group in groups:
        path=Path(plan['archives'][group]['archive']);stat=path.stat()
        if path.name not in expected:raise ValueError('No archive checksum: '+str(path))
        print('Verifying backup archive',path.name,round(stat.st_size/2**30,2),'GiB',flush=True)
        with path.open('rb') as f:digest=hashlib.file_digest(f,'sha256').hexdigest()
        if digest!=expected[path.name]:raise ValueError('Backup archive checksum mismatch: '+str(path))
        receipts.append({'path':str(path),'size':stat.st_size,'mtime_ns':stat.st_mtime_ns,'sha256':digest})
        (OUT/'cleanup-archive-verification.json').write_text(json.dumps({'complete':False,'archives':receipts},indent=2),encoding='utf-8')
    (OUT/'cleanup-archive-verification.json').write_text(json.dumps({'complete':True,'archives':receipts},indent=2),encoding='utf-8')
    print('All candidate backup archives match recorded SHA-256 checksums.',flush=True)

if __name__=='__main__':main()
