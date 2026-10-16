from pathlib import Path
import collections
import hashlib
import json
import os
import re
import shutil
import time

OUT = Path(__file__).parent
INSTANCE = Path(r'E:\Nolvus\Instances\Nolvus Awakening')
MODS = INSTANCE / 'MODS/mods'

def normalized(value):
    return re.sub(r'/+', '/', str(value).replace('\\','/')).strip('/').lower()

def walk_files(directory):
    for folder, dirs, files in os.walk(directory, followlinks=False):
        dirs[:] = [d for d in dirs if not (Path(folder)/d).is_symlink()]
        for name in files:
            path = Path(folder)/name
            if path.is_file() and not path.is_symlink():
                yield path

def main():
    started = time.time()
    ini = (INSTANCE/'MO2/ModOrganizer.ini').read_text(encoding='utf-8-sig')
    profile = re.search(r'^selected_profile=@ByteArray\((.*)\)\s*$',ini,re.M).group(1)
    profiles = {}
    for directory in (INSTANCE/'MODS/profiles').iterdir():
        file = directory/'modlist.txt'
        if file.is_file():
            lines=file.read_text(encoding='utf-8-sig').splitlines()
            profiles[directory.name]={'enabled':[line[1:] for line in lines if line.startswith('+')], 'disabled':[line[1:] for line in lines if line.startswith('-')], 'modlist_sha256':hashlib.sha256(file.read_bytes()).hexdigest()}
    active = profiles[profile]['enabled']
    pluginfile=INSTANCE/'MODS/profiles'/profile/'plugins.txt'
    plugins=[line[1:] for line in pluginfile.read_text(encoding='utf-8-sig').splitlines() if line.startswith('*')]
    sources=[('MO2 Overwrite',INSTANCE/'MODS/overwrite')]+[(name,MODS/name) for name in active]+[('Stock Game',INSTANCE/'STOCK GAME/Data')]
    files = {}
    plugin_providers = {}
    archives = []
    totals = collections.Counter()
    for index,(name,directory) in enumerate(sources):
        if not directory.is_dir(): continue
        for file in directory.iterdir():
            if file.is_file():
                if file.suffix.lower() in {'.esm','.esp','.esl'}:
                    plugin_providers.setdefault(file.name.lower(),{'path':str(file),'mod':name})
                if file.suffix.lower()=='.bsa': archives.append({'path':str(file),'mod':name})
        for section in ['CalienteTools','meshes','SKSE/Plugins','MCM/Config/OBody','MCM/Settings']:
            base=directory/section
            if not base.is_dir(): continue
            for file in walk_files(base):
                relative=normalized(file.relative_to(directory))
                keep = section=='CalienteTools' or (section=='meshes' and file.suffix.lower() in {'.nif','.tri'}) or (section.startswith(('SKSE','MCM')) and ('obody' in file.name.lower() or file.name.lower() in {'skee64.ini','skee64.dll','cbbe.esp'}))
                if not keep: continue
                stat=file.stat()
                record={'path':str(file),'mod':name,'size':stat.st_size,'mtime_ns':stat.st_mtime_ns}
                files.setdefault(relative,[]).append(record)
                totals[name]+=1
        if index%500==0: print('Active source scan',index,'/',len(sources),flush=True)
    cleanup=[]
    for directory in MODS.iterdir():
        if not directory.is_dir() or directory.name.endswith('_separator'):continue
        if directory.name in active: continue
        enabled_in=[n for n,p in profiles.items() if directory.name in p['enabled']]
        size=count=0
        kinds=collections.Counter()
        for file in walk_files(directory):
            stat=file.stat();size+=stat.st_size;count+=1;kinds[file.suffix.lower()]+=1
        cleanup.append({'mod':directory.name,'path':str(directory),'bytes':size,'files':count,'enabled_in_profiles':enabled_in,'extensions':dict(kinds),'body_support':(directory/'CalienteTools/BodySlide').is_dir()})
    data={'instance':str(INSTANCE),'profile':profile,'profile_path':str(INSTANCE/'MODS/profiles'/profile),'game_path':str(INSTANCE/'STOCK GAME'),'profiles':profiles,'active_mods':active,'plugins':plugins,'plugin_providers':plugin_providers,'archives':archives,'files':files,'inactive_mods':cleanup,'disk_usage':{disk:dict(zip(('total','used','free'),shutil.disk_usage(disk))) for disk in ['D:\\','E:\\']},'elapsed_seconds':round(time.time()-started,1)}
    (OUT/'inventory.json').write_text(json.dumps(data,ensure_ascii=False),encoding='utf-8')
    print(json.dumps({'profile':profile,'active_mods':len(active),'tracked_paths':len(files),'archives':len(archives),'inactive_mods':len(cleanup),'inactive_GiB':round(sum(m['bytes'] for m in cleanup)/2**30,2),'inactive_unreferenced':sum(not m['enabled_in_profiles'] for m in cleanup),'disk_usage':data['disk_usage'],'elapsed':data['elapsed_seconds']},indent=2),flush=True)

if __name__=='__main__':main()
