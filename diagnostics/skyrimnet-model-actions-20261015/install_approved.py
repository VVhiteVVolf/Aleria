"""Apply only the two user-approved runtime files, with backup and post-write checks."""
from datetime import datetime
from pathlib import Path
import hashlib
import json
import os
import shutil
import subprocess
import sys
import yaml
import zipfile

sys.path.insert(0,r'E:\Aleria\skyrim-outfit-catalog\scripts')
from profile_reader import selected_profile

ROOT=Path(__file__).parent
INSTANCE=Path(r'E:\Nolvus\Instances\Nolvus Awakening')
plan=json.loads((ROOT/'approved-plan.json').read_text(encoding='utf-8'))
validation=json.loads((ROOT/'approved-model-validation.json').read_text(encoding='utf-8'))
assert len(validation)==4 and all(row['pass'] for row in validation)
assert (ROOT/'test_action_prompt.exe').is_file() and (ROOT/'rendered-approved-action-rubric.txt').is_file()

def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def game_running():
    result=subprocess.run(['tasklist','/FI','IMAGENAME eq SkyrimSE.exe','/NH'],capture_output=True,text=True,check=True)
    return 'skyrimse.exe' in result.stdout.lower()

assert not game_running(),'Skyrim must be closed'
state=selected_profile(INSTANCE)
assert state['profile']=='Nolvus Awakening - SkyrimNet Beta25 Test'
targets={Path(row['target']) for row in plan['changes']}
for row in plan['changes']:
    assert sha(Path(row['target']))==row['before_sha256'],'Target changed since staging'
    assert sha(Path(row['staged']))==row['after_sha256'],'Staged content changed'
    relative=Path(row['target']).resolve().relative_to((INSTANCE/'MODS/mods/SkyrimNet - Beta25 Test Runtime 20260927').resolve())
    assert str(relative).replace('\\','/')==row['relative']

protected={}
for name,source in state['sources']:
    folder=source/'SKSE/Plugins/SkyrimNet'
    if not folder.is_dir():continue
    for file in folder.rglob('*.prompt'):
        if file not in targets:protected[str(file)]=sha(file)
    config=folder/'config'
    if config.is_dir():
        for file in config.rglob('*'):
            if file.is_file() and file not in targets:protected[str(file)]=sha(file)
for profile in (INSTANCE/'MODS/profiles').iterdir():
    if profile.is_dir():
        for name in ('modlist.txt','plugins.txt','loadorder.txt'):
            file=profile/name
            if file.exists():protected[str(file)]=sha(file)

backup=ROOT/'approved-backup'
backup.mkdir(exist_ok=False)
for row in plan['changes']:
    file=backup/row['relative'];file.parent.mkdir(parents=True,exist_ok=True)
    shutil.copy2(row['target'],file)
(ROOT/'protected-files.json').write_text(json.dumps(protected,indent=2),encoding='utf-8')
before_config=yaml.safe_load((backup/'SKSE/Plugins/SkyrimNet/config/OpenRouter.yaml').read_text(encoding='utf-8-sig'))
written=[]
try:
    for row in plan['changes']:
        assert not game_running(),'Skyrim started during installation'
        target=Path(row['target'])
        assert sha(target)==row['before_sha256']
        temporary=target.with_name(target.name+'.codex-20261015.tmp')
        assert not temporary.exists()
        temporary.write_bytes(Path(row['staged']).read_bytes())
        os.replace(temporary,target)
        written.append(row)
    config_file=next(Path(r['target']) for r in plan['changes'] if r['relative'].endswith('OpenRouter.yaml'))
    after_config=yaml.safe_load(config_file.read_text(encoding='utf-8-sig'))
    assert after_config['openrouter']['model_name']==plan['dialogue_model']
    assert len(after_config['openrouter']['model_params'])==1
    assert after_config['openrouter']['variants']['action_evaluation']==before_config['openrouter']['variants']['action_evaluation']
    restored=json.loads(json.dumps(after_config))
    restored['openrouter']['model_name']=before_config['openrouter']['model_name']
    restored['openrouter']['model_params']=before_config['openrouter']['model_params']
    for name in plan['preserved_inherited_background_models']:
        current=after_config['openrouter']['variants'][name]
        assert current['model_name']==before_config['openrouter']['model_name']
        assert current['model_params']==before_config['openrouter']['model_params']
        del restored['openrouter']['variants'][name]['model_name']
        del restored['openrouter']['variants'][name]['model_params']
    assert restored==before_config,'Unexpected semantic config changes'
    assert all(sha(Path(row['target']))==row['after_sha256'] for row in plan['changes'])
    assert all(sha(Path(file))==digest for file,digest in protected.items()),'Protected file changed'
    assert selected_profile(INSTANCE)['fingerprint']==state['fingerprint'],'Profile activation changed'
except Exception:
    for row in reversed(written):shutil.copy2(backup/row['relative'],row['target'])
    raise

receipt={'installed_at':datetime.now().astimezone().isoformat(),'profile':state['profile'],
         'dialogue_model':plan['dialogue_model'],'action_model':plan['action_model'],
         'changed_files':plan['changes'],'protected_files_verified':len(protected),
         'profile_files_unchanged':True,'personal_prompts_and_audio_tags_preserved':True,
         'background_model_inheritance_preserved':plan['preserved_inherited_background_models'],
         'template_render_cases_passed':108,'synthetic_model_cases_passed':4,'gameplay_tested':False,
         'backup':str(backup),'migration_addendum':str(ROOT/'migration-approved-dialogue-20261015.zip')}
(ROOT/'approved-installation.json').write_text(json.dumps(receipt,indent=2),encoding='utf-8')
with zipfile.ZipFile(ROOT/'migration-approved-dialogue-20261015.zip','w',compression=zipfile.ZIP_DEFLATED) as archive:
    for row in plan['changes']:
        archive.write(row['target'],str(Path('mods/SkyrimNet - Beta25 Test Runtime 20260927')/row['relative']))
    for name in ('approved-installation.json','approved-plan.json','approved-model-validation.json'):
        archive.write(ROOT/name,name)
print(json.dumps({k:v for k,v in receipt.items() if k!='changed_files'},indent=2))
