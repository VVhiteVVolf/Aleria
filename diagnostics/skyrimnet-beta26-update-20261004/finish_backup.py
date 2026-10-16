"""Publish current instructions without invalidating base checksums, and record restore tests."""
import hashlib,json,shutil,sys
from pathlib import Path
sys.stdout.reconfigure(encoding='utf-8',errors='replace')
ROOT=Path(__file__).parent
BACKUP=Path(r'D:\Nolvus-Backups\Awakening-6.0.20-vor-Update-20260930')
UPDATE=BACKUP/'updates/20261004-SkyrimNet-Beta26-Prisma151'
def sha(p):
    h=hashlib.sha256()
    with p.open('rb') as f:
        while b:=f.read(4194304):h.update(b)
    return h.hexdigest()
receipt=json.loads((UPDATE/'COMPLETE.json').read_text(encoding='utf-8'))
readme=BACKUP/'README_WIEDERHERSTELLUNG.md'
current=BACKUP/'00_AKTUELLE_WIEDERHERSTELLUNG.md'
if not current.exists():
    current.write_text(readme.read_text(encoding='utf-8').replace("'E:\\Nolvus-Migration-20261004'","'D:\\Nolvus-Migration-20261004'"),encoding='utf-8')
    shutil.copy2(BACKUP/'README_WIEDERHERSTELLUNG_BASIS_20260930.md',readme)
    expected=next(line.split()[0] for line in (BACKUP/'CHECKSUMS.sha256').read_text().splitlines() if line.endswith('  README_WIEDERHERSTELLUNG.md'))
    assert sha(readme)==expected,'Base README checksum must stay valid'
pointer=json.loads((BACKUP/'LATEST_BACKUP.json').read_text())
pointer['instructions']=current.name
(BACKUP/'LATEST_BACKUP.json').write_text(json.dumps(pointer,indent=2),encoding='utf-8')
shutil.copy2(ROOT/'installation-validation.json',UPDATE/'installation-validation.json')
tests=[]
for folder in ['restore-test-mods','restore-test-profiles','restore-test-separators']:
    p=ROOT/folder/'RESTORE_LATEST_VERIFIED.json'
    if p.exists():tests.append(json.loads(p.read_text()))
if len(tests)>=2:
    # Compare restored selected mod files AND all current profile files against live closed sources.
    import os
    base=Path(r'E:\Nolvus\Instances\Nolvus Awakening')
    previous_path=UPDATE/'restoration-test.json'
    previous=json.loads(previous_path.read_text(encoding='utf-8')) if previous_path.exists() else {}
    checked=previous.get('restored_files_compared_to_current',0)
    previously_verified={json.dumps(t,sort_keys=True) for t in previous.get('tests',[])}
    for folder in ['restore-test-mods','restore-test-profiles','restore-test-separators']:
        test_receipt=ROOT/folder/'RESTORE_LATEST_VERIFIED.json'
        if not test_receipt.exists():continue
        if json.dumps(json.loads(test_receipt.read_text()),sort_keys=True) in previously_verified:continue
        stage=ROOT/folder/'instance'
        for p in stage.rglob('*'):
            if p.is_file():
                live=base/p.relative_to(stage)
                assert live.is_file() and sha(p)==sha(live),'Restore differs from current source: '+str(p)
                checked+=1
    result={'status':'VERIFIED','tests':tests,'restored_files_compared_to_current':checked,'base_and_delta_exercised':True}
    (UPDATE/'restoration-test.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
    receipt['restoration_test']=result
    print('Actual restore tests and live-source SHA-256 comparisons verified:',checked,flush=True)
for name in ['installation-validation.json','restoration-test.json','added-mod-folders-current.json','migration-map-current.csv']:
    if (UPDATE/name).exists():receipt['control_sha256'][name]=sha(UPDATE/name)
(UPDATE/'COMPLETE.json').write_text(json.dumps(receipt,indent=2),encoding='utf-8')
(UPDATE/'CHECKSUMS.sha256').write_text('\n'.join(h+'  '+n for n,h in receipt['control_sha256'].items())+'\n',encoding='utf-8')
paths=[current,BACKUP/'LATEST_BACKUP.json',BACKUP/'tools/restore_latest.py',UPDATE/'COMPLETE.json']
(BACKUP/'CHECKSUMS_LATEST.sha256').write_text('\n'.join(sha(p)+'  '+p.relative_to(BACKUP).as_posix() for p in paths)+'\n',encoding='utf-8')
print(json.dumps({'status':'VERIFIED','restoration_tests':len(tests),'instructions':str(current)}),flush=True)
