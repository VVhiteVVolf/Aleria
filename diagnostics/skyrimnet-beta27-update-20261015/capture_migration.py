"""Create a self-contained AI update supplement; do not replace the older full backup."""
from datetime import datetime
from pathlib import Path
import hashlib
import json
import subprocess
import sys
import zipfile

sys.path.insert(0,r'E:\Aleria\skyrim-outfit-catalog\scripts')
from profile_reader import selected_profile
ROOT=Path(__file__).parent
INSTANCE=Path(r'E:\Nolvus\Instances\Nolvus Awakening')

def sha(path):
    with path.open('rb') as stream:return hashlib.file_digest(stream,'sha256').hexdigest()

def main():
    for exe in ('SkyrimSE.exe','ModOrganizer.exe'):
        output=subprocess.run(['tasklist','/FI','IMAGENAME eq '+exe,'/NH'],capture_output=True,text=True,check=True).stdout
        assert exe.lower() not in output.lower(),'Close Skyrim/MO2 for consistent capture'
    state=selected_profile(INSTANCE)
    installed=json.loads((ROOT/'installation.json').read_text())
    assert state['fingerprint']==installed['profile_fingerprint']
    plans=json.loads((ROOT/'package-plan.json').read_text())
    mods=[p['new'] for p in plans]+['SkyrimNet - Beta25 Test Runtime 20260927','SkyrimNet - Beta 25 Local Compatibility',
          'SkyrimNet - Lever Interaction','OStim Navigator 2.2.1','Courier Descriptions 1.2.0','Twisted - Prisma UI']
    assert len(set(mods))==len(mods) and all(m in state['active_mods'] for m in mods)
    archive=ROOT/'migration-skyrimnet-beta27-current.zip'
    assert not archive.exists()
    entries=[]
    with zipfile.ZipFile(archive,'x',compression=zipfile.ZIP_DEFLATED,compresslevel=1,allowZip64=True) as output:
        for mod in mods:
            directory=INSTANCE/'MODS/mods'/mod
            for file in directory.rglob('*'):
                if not file.is_file():continue
                relative=file.relative_to(directory)
                if any(part in ('logs','screenshots') for part in relative.parts):continue
                name='instance/'+file.relative_to(INSTANCE).as_posix()
                row={'path':name,'bytes':file.stat().st_size,'sha256':sha(file)}
                output.write(file,name);entries.append(row)
            print('Captured',mod,flush=True)
        for name in ('modlist.txt','plugins.txt','loadorder.txt'):
            file=state['directory']/name;entry='instance/'+file.relative_to(INSTANCE).as_posix()
            output.write(file,entry);entries.append({'path':entry,'bytes':file.stat().st_size,'sha256':sha(file)})
        metadata={'created':datetime.now().astimezone().isoformat(),'scope':'AI update supplement; requires the existing Nolvus/base backup',
                  'profile':state['profile'],'mods':mods,'replaces':{p['old']:p['new'] for p in plans},
                  'disable_duplicate':'OStim Navigator 2.2.0',
                  'profile_note':'Control files document the source profile; reconcile with the new Nolvus base instead of blindly replacing its load order.',
                  'game_save_files_included':False,'runtime_databases_voices_models_included':True,'entries':entries}
        output.writestr('manifest.json',json.dumps(metadata,indent=2))
    print('Archive written; verifying every archived file',flush=True)
    with zipfile.ZipFile(archive) as check:
        for row in entries:
            with check.open(row['path']) as stream:
                assert hashlib.file_digest(stream,'sha256').hexdigest()==row['sha256'],row['path']
    result={'status':'VERIFIED','archive':str(archive),'archive_bytes':archive.stat().st_size,'sha256':sha(archive),
            'files':len(entries),'uncompressed_bytes':sum(r['bytes'] for r in entries),'mods':mods,
            'every_archived_file_sha256_verified':True,'source_profile_fingerprint':state['fingerprint']}
    assert selected_profile(INSTANCE)['fingerprint']==state['fingerprint']
    (ROOT/'migration-receipt.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
    print(json.dumps(result,indent=2),flush=True)

if __name__=='__main__':main()
