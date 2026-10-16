"""Prepare, deploy, and verify the bounded follower installation in MO2."""
from pathlib import Path
import hashlib
import json
import shutil
import subprocess
import sys

ROOT = Path(__file__).parent
INSTANCE = Path(r'E:\Nolvus\Instances\Nolvus Awakening')
sys.path.insert(0, str(ROOT.parents[1]/'skyrim-outfit-catalog/scripts'))
from profile_reader import selected_profile
from plugin_reader import records, text


def digest(path):
    with path.open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


def header(path):
    _, flags, _, fields = next(records(path))
    return {'light': bool(flags & 512) or path.suffix.lower()=='.esl',
            'masters':[text(d) for k,d in fields if k==b'MAST']}


def prepare():
    stage=json.loads((ROOT/'selected-stage.json').read_text(encoding='utf-8'))
    profile=selected_profile(INSTANCE)
    before=json.loads((ROOT/'profile-before.json').read_text(encoding='utf-8'))
    assert profile['fingerprint']==before['fingerprint'], 'Profile changed during preparation'
    new={}
    manifest=[]
    for mod in stage['mods']:
        source=Path(mod['directory']);destination=INSTANCE/'MODS/mods'/mod['name']
        assert not destination.exists(), 'Refusing to overwrite an existing mod: '+mod['name']
        for plugin in mod['plugins']:
            info=header(source/plugin)
            assert info['light'], 'Normal-slot plugins explicitly declined: '+plugin
            assert plugin.lower() not in profile['providers']
            new[plugin.lower()]={'name':plugin, **info}
        for path in source.rglob('*'):
            if not path.is_file():continue
            relative=path.relative_to(source).as_posix()
            assert not relative.lower().startswith(('meshes/actors/character/character assets/', 'meshes/actors/character/character assets female/', 'textures/actors/character/female/'))
            manifest.append({'mod':mod['name'], 'relative':relative, 'bytes':path.stat().st_size, 'sha256':digest(path)})
    available={p.lower() for p in profile['plugins']}
    ordered=[]
    pending=dict(new)
    while pending:
        ready=[name for name,info in pending.items() if all(m.lower() in available for m in info['masters'])]
        if not ready:
            raise ValueError('Missing/cyclic new dependencies: '+repr(pending))
        for name in ready:
            ordered.append(pending.pop(name)['name']);available.add(name)
    counts={'full':0,'light':0}
    for name in profile['plugins']:
        info=header(profile['providers'][name.lower()]['path'])
        counts['light' if info['light'] else 'full']+=1
    original_counts=dict(counts);counts['light']+=len(new)
    assert counts['full']<=254 and counts['light']<=4096
    separator='Local - New Followers 20261007_separator'
    assert not (INSTANCE/'MODS/mods'/separator).exists()
    top=[m['name'] for m in reversed(stage['mods'])]
    folder=profile['directory']
    for file in ('modlist.txt','plugins.txt','loadorder.txt'):
        data=(folder/file).read_bytes()
        if file=='modlist.txt':
            first=data.index(b'\n')+1
            entries=''.join('+'+name+'\r\n' for name in top)+'-'+separator+'\r\n'
            after=data[:first]+entries.encode('utf-8')+data[first:]
        else:
            prefix='*' if file=='plugins.txt' else ''
            after=data+(b'' if data.endswith(b'\n') else b'\r\n')+''.join(prefix+n+'\r\n' for n in ordered).encode('utf-8')
        (ROOT/(file+'.after')).write_bytes(after)
    result={'instance':str(INSTANCE), 'profile':profile['profile'], 'before_fingerprint':profile['fingerprint'],
            'mods':stage['mods'], 'new_plugins':ordered, 'separator':separator,
            'original_counts':original_counts, 'plugin_counts':counts, 'bodyslide_projects':stage['bodyslide_projects'],
            'files':manifest, 'skipped':stage['skipped']}
    (ROOT/'deployment-plan.json').write_text(json.dumps(result,indent=2,ensure_ascii=False),encoding='utf-8')
    print(json.dumps({'mods':len(stage['mods']), 'new_light_plugins':len(new), 'counts':counts,
                      'files':len(manifest), 'bytes':sum(f['bytes'] for f in manifest)},indent=2))


def apply():
    plan=json.loads((ROOT/'deployment-plan.json').read_text(encoding='utf-8'))
    profile=selected_profile(INSTANCE)
    assert profile['profile']==plan['profile'] and profile['fingerprint']==plan['before_fingerprint']
    state=subprocess.run(['powershell','-NoProfile','-Command',
        "@(Get-Process SkyrimSE,ModOrganizer -ErrorAction SilentlyContinue).Count"],capture_output=True,text=True,check=True)
    assert state.stdout.strip()=='0', 'Skyrim or MO2 is still running'
    backup=ROOT/'backup-before-install';backup.mkdir(exist_ok=True)
    for name in ('modlist.txt','plugins.txt','loadorder.txt'):
        shutil.copy2(profile['directory']/name,backup/name)
    shutil.copy2(INSTANCE/'MO2/ModOrganizer.ini',backup/'ModOrganizer.ini')
    for mod in plan['mods']:
        target=INSTANCE/'MODS/mods'/mod['name']
        assert not target.exists()
        shutil.copytree(Path(mod['directory']),target)
        print('Installed '+mod['name'],flush=True)
    separator=INSTANCE/'MODS/mods'/plan['separator'];separator.mkdir()
    (separator/'meta.ini').write_text('[General]\nmodid=0\nversion=1.0\n',encoding='utf-8')
    for file in plan['files']:
        target=INSTANCE/'MODS/mods'/file['mod']/file['relative']
        assert target.stat().st_size==file['bytes'] and digest(target)==file['sha256'], str(target)
    for name in ('modlist.txt','plugins.txt','loadorder.txt'):
        shutil.copyfile(ROOT/(name+'.after'),profile['directory']/name)
    verify()


def verify():
    plan=json.loads((ROOT/'deployment-plan.json').read_text(encoding='utf-8'))
    profile=selected_profile(INSTANCE)
    assert all(m['name'] in profile['active_mods'] for m in plan['mods'])
    for name in ('modlist.txt','plugins.txt','loadorder.txt'):
        assert (profile['directory']/name).read_bytes()==(ROOT/(name+'.after')).read_bytes()
    counts={'full':0,'light':0};positions={n.lower():i for i,n in enumerate(profile['plugins'])}
    for name in profile['plugins']:
        info=header(profile['providers'][name.lower()]['path']);counts['light' if info['light'] else 'full']+=1
        if name in plan['new_plugins']:
            assert all(m.lower() in positions and positions[m.lower()]<positions[name.lower()] for m in info['masters'])
    assert counts==plan['plugin_counts']
    receipt={'verified':True, 'profile':profile['profile'], 'mods':len(plan['mods']),
             'new_light_plugins':len(plan['new_plugins']), 'plugin_counts':counts,
             'file_hashes_verified':len(plan['files']), 'new_master_order_valid':True,
             'original_profile_order_preserved':True, 'game_runtime_test':'Not performed'}
    (ROOT/'installation-validation.json').write_text(json.dumps(receipt,indent=2),encoding='utf-8')
    print(json.dumps(receipt,indent=2))


if __name__=='__main__':
    if '--apply' in sys.argv:apply()
    elif '--verify' in sys.argv:verify()
    else:prepare()
