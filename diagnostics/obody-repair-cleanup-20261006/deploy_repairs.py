"""Install a reversible repair mod and route stale BodySlide shortcuts to the current VFS."""
from pathlib import Path
import hashlib
import json
import re
import shutil
import subprocess
import xml.etree.ElementTree as ET
import zipfile

OUT=Path(__file__).parent

def digest(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def main():
    cleanup=json.loads((OUT/'strict-cleanup-plan.json').read_text(encoding='utf-8'))
    repair=json.loads((OUT/'repair-stage.json').read_text(encoding='utf-8'))
    instance=Path(cleanup['instance']);mods=instance/'MODS/mods';modlist=Path(cleanup['modlist'])
    check=subprocess.run(['powershell','-NoProfile','-Command',"@(Get-Process | Where-Object { $_.ProcessName -match '^(SkyrimSE|ModOrganizer|BodySlide.*|OutfitStudio.*)$' }).Count"],capture_output=True,text=True,check=True)
    if check.stdout.strip()!='0':raise RuntimeError('Close Skyrim/MO2/BodySlide before deployment')
    if digest(modlist)!=cleanup['modlist_sha256']:raise RuntimeError('Selected profile changed since plan')
    ini=instance/'MO2/ModOrganizer.ini';original=mods/'BodySlide and Outfit Studio/CalienteTools/BodySlide';config=original/'Config.xml'
    target=mods/repair['mod_name']
    if target.exists():raise FileExistsError(target)
    if target.parent.resolve()!=mods.resolve():raise RuntimeError('Repair mod target outside named mods directory')
    profile=modlist.parent;settings=[modlist,ini,config]+[profile/name for name in ['plugins.txt','loadorder.txt'] if (profile/name).exists()]
    backup=Path(cleanup['backup_root']);backup.mkdir(parents=True,exist_ok=True)
    archive=backup/'profile-tool-settings-before-repair.zip'
    with zipfile.ZipFile(archive,'x',compression=zipfile.ZIP_DEFLATED) as z:
        for path in settings:z.write(path,path.relative_to(instance).as_posix())
    with zipfile.ZipFile(archive) as z:
        assert z.testzip() is None
        for path in settings:assert hashlib.sha256(z.read(path.relative_to(instance).as_posix())).hexdigest()==digest(path)
    before={str(path):digest(path) for path in settings}
    shutil.copytree(OUT/'mod-stage',target)
    for source in (OUT/'mod-stage').rglob('*'):
        if source.is_file():assert digest(source)==digest(target/source.relative_to(OUT/'mod-stage'))
    # Preserve all original settings except the output destination and obsolete shortcut paths.
    tree=ET.parse(config,parser=ET.XMLParser(target=ET.TreeBuilder(insert_comments=True)))
    for key,value in {'OutputDataPath':str(target)+'\\','ProjectPath':'','WarnBatchBuildOverride':'true'}.items():
        node=tree.getroot().find(key)
        if node is None:node=ET.SubElement(tree.getroot(),key)
        node.text=value
    tree.write(config,encoding='utf-8',xml_declaration=True)
    text=ini.read_text(encoding='utf-8-sig')
    for number,label in [(12,'BodySlide aktuell - 3BA'),(13,'BodySlide aktuell - HIMBO'),(14,'BodySlide aktuell - Outfits')]:
        for key,value in [('binary',str(original/'BodySlide x64.exe').replace('\\','/')),('workingDirectory',str(original).replace('\\','/')),('arguments',''),('title',label)]:
            pattern=rf'^{number}\\{key}=.*$'
            text,n=re.subn(pattern,lambda _:str(number)+'\\'+key+'='+value,text,flags=re.M)
            if key in {'binary','workingDirectory','title'} and n!=1:raise RuntimeError('Expected shortcut key not found: '+pattern)
    ini.write_text(text,encoding='utf-8')
    lines=modlist.read_text(encoding='utf-8-sig').splitlines()
    first=next((i for i,line in enumerate(lines) if not line.startswith('#')),len(lines))
    lines.insert(first,'+'+repair['mod_name'])
    modlist.write_text('\n'.join(lines)+'\n',encoding='utf-8')
    for name in ['plugins.txt','loadorder.txt']:
        path=profile/name
        if path.exists():assert digest(path)==before[str(path)]
    result={'mod_name':repair['mod_name'],'mod_path':str(target),'profile':cleanup['profile'],'modlist_after_sha256':digest(modlist),'configuration_backup':str(archive),'before_hashes':before,'after_hashes':{str(path):digest(path) for path in settings},'plugin_order_unchanged':True,'shortcuts_use_current_profile_sources':True}
    (OUT/'deployment.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'repair_mod':str(target),'active_profile':cleanup['profile'],'plugin_order_unchanged':True,'configuration_backup':str(archive)},indent=2))

if __name__=='__main__':main()
