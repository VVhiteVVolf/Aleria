"""Install complete, verified Beta27 packages into the authorized current profile."""
from datetime import datetime
from pathlib import Path
import hashlib
import json
import os
import shutil
import subprocess
import sys
import zipfile
import yaml

sys.path.insert(0,r'E:\Aleria\skyrim-outfit-catalog\scripts')
from profile_reader import selected_profile

ROOT=Path(__file__).parent
INSTANCE=Path(r'E:\Nolvus\Instances\Nolvus Awakening')
MODS=INSTANCE/'MODS/mods'
RUNTIME='SkyrimNet - Beta25 Test Runtime 20260927'
COMPAT='SkyrimNet - Beta 25 Local Compatibility'
RETIRED='OStim Navigator 2.2.0'

def digest(path):
    with path.open('rb') as stream:return hashlib.file_digest(stream,'sha256').hexdigest()

def stopped():
    for name in ('SkyrimSE.exe','ModOrganizer.exe'):
        result=subprocess.run(['tasklist','/FI','IMAGENAME eq '+name,'/NH'],capture_output=True,text=True,check=True)
        assert name.lower() not in result.stdout.lower(),'Close Skyrim and MO2 before installing'

def all_files(path):return [p for p in path.rglob('*') if p.is_file()]

def main():
    stopped()
    assert not (ROOT/'installation.json').exists(),'Update already installed'
    before=selected_profile(INSTANCE)
    expected=json.loads((ROOT/'profile-before.json').read_text())
    assert before['profile']==expected['profile'] and before['fingerprint']==expected['fingerprint'],'Profile changed since preparation'
    plans=json.loads((ROOT/'package-plan.json').read_text())
    patches=json.loads((ROOT/'override-plan.json').read_text())
    validation=json.loads((ROOT/'staging-validation.json').read_text())
    for key in ('missing_masters','binding_errors','yaml_errors','manifest_errors','ai_dll_duplicates','core_errors'):
        assert not validation[key],'Unresolved validation issue: '+key
    attachments=json.loads((ROOT/'quest-attachment-validation.json').read_text())
    assert not attachments['attachment_errors'] and not attachments['not_found_in_related_plugins']
    for p in plans:
        assert (MODS/p['old']).is_dir() and not (MODS/p['new']).exists()
        assert (MODS/p['new']).resolve().parent==MODS.resolve()
        for relative,sha in p['files'].items():assert digest(ROOT/'stage'/p['new']/relative)==sha
    for p in patches:
        assert Path(p['target']).resolve().is_relative_to(MODS.resolve())
        assert digest(Path(p['target']))==p['before_sha256'] and digest(Path(p['staged']))==p['after_sha256']
    backup=ROOT/'backup';backup.mkdir(exist_ok=False)
    profile=before['directory']
    for directory in (INSTANCE/'MODS/profiles').iterdir():
        if not directory.is_dir():continue
        for name in ('modlist.txt','plugins.txt','loadorder.txt'):
            file=directory/name
            if file.exists():
                target=backup/'profiles'/directory.name/name;target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(file,target)
    for p in patches:
        target=backup/'changed-files'/p['relative'];target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p['target'],target)
    # Complete local AI state backup, including databases, custom voices and cached models.
    with zipfile.ZipFile(backup/'personal-state-before.zip','x',compression=zipfile.ZIP_DEFLATED,compresslevel=1) as archive:
        for mod in (RUNTIME,COMPAT,'SkyrimNet - Lever Interaction'):
            for file in all_files(MODS/mod):
                relative=file.relative_to(MODS/mod)
                if any(part in ('logs','screenshots') for part in relative.parts):continue
                archive.write(file,file.relative_to(MODS).as_posix())
    with zipfile.ZipFile(backup/'personal-state-before.zip') as archive:assert archive.testzip() is None
    print('Personal AI state backup verified',flush=True)
    protected={}
    excluded={str(Path(p['target'])) for p in patches}
    # Old versions stay intact and inactive in this profile; other profiles retain their files.
    protect_mods={RUNTIME,COMPAT,'SkyrimNet - Lever Interaction',*[p['old'] for p in plans]}
    for mod in protect_mods:
        for file in all_files(MODS/mod):
            if str(file) not in excluded:protected[str(file)]=digest(file)
    for directory in (INSTANCE/'MODS/profiles').iterdir():
        if not directory.is_dir():continue
        for name in ('modlist.txt','plugins.txt','loadorder.txt'):
            file=directory/name
            if file.exists() and file!=profile/'modlist.txt':protected[str(file)]=digest(file)
    (backup/'protected-files.json').write_text(json.dumps(protected,indent=2),encoding='utf-8')
    original_modlist=(profile/'modlist.txt').read_bytes()
    lines=original_modlist.splitlines(keepends=True)
    renames={p['old']:p['new'] for p in plans};changed=[]
    for index,line in enumerate(lines):
        value=line.decode('utf-8-sig').strip()
        if value.startswith('+') and value[1:] in renames:
            ending=b'\r\n' if line.endswith(b'\r\n') else b'\n'
            lines[index]=('+'+renames[value[1:]]).encode()+ending
            changed.append(value[1:])
        elif value=='+'+RETIRED:lines[index]=line.replace(b'+',b'-',1)
    assert set(changed)==set(renames),'Unexpected mod activation plan'
    written=[]
    try:
        for p in plans:
            stopped()
            target=MODS/p['new'];shutil.copytree(ROOT/'stage'/p['new'],target)
            assert len(all_files(target))==len(p['files'])
            for relative,sha in p['files'].items():assert digest(target/relative)==sha
            print('Installed',p['new'],flush=True)
        stopped()
        for p in patches:
            target=Path(p['target']);assert digest(target)==p['before_sha256']
            temporary=target.with_name(target.name+'.beta27.tmp');assert not temporary.exists()
            temporary.write_bytes(Path(p['staged']).read_bytes());os.replace(temporary,target);written.append(p)
        (profile/'modlist.txt').write_bytes(b''.join(lines))
        after=selected_profile(INSTANCE)
        assert after['plugins']==before['plugins']
        assert set(after['active_mods'])==(set(before['active_mods'])-set(renames)-{RETIRED})|set(renames.values())
        for p in patches:assert digest(Path(p['target']))==p['after_sha256']
        assert all(digest(Path(file))==sha for file,sha in protected.items()),'Protected file changed'
        config=yaml.safe_load((MODS/RUNTIME/'SKSE/Plugins/SkyrimNet/config/OpenRouter.yaml').read_text(encoding='utf-8-sig'))
        assert config['openrouter']['model_name']=='google/gemma-4-26b-a4b-it'
        assert config['openrouter']['variants']['action_evaluation']['model_name']=='google/gemma-4-31b-it'
    except Exception:
        (profile/'modlist.txt').write_bytes(original_modlist)
        for p in reversed(written):shutil.copy2(backup/'changed-files'/p['relative'],p['target'])
        # Any copied new package remains inactive for inspection; never delete unrelated files.
        raise
    receipt={'installed_at':datetime.now().astimezone().isoformat(),'profile':after['profile'],
             'status':'INSTALLED_FILE_VERIFIED_NOT_GAME_TESTED','versions':[{k:p[k] for k in ('old','new','version','release_url')} for p in plans],
             'patched_files':len(patches),'pristine_npc_bios_updated':50,'protected_files_unchanged':len(protected),
             'profile_fingerprint':after['fingerprint'],'plugins_and_loadorder_unchanged':True,
             'retired_duplicate':RETIRED,'old_mod_folders_retained':True,
             'dialogue_model':'google/gemma-4-26b-a4b-it','action_model':'google/gemma-4-31b-it',
             'preserved':'personal prompts, Inworld tags, native Wheel guard, databases, voices, provider settings and keys',
             'backup':str(backup)}
    (ROOT/'installation.json').write_text(json.dumps(receipt,indent=2),encoding='utf-8')
    print(json.dumps(receipt,indent=2),flush=True)

if __name__=='__main__':main()
