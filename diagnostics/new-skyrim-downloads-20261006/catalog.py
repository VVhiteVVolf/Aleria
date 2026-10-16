"""Read archive contents and selected-profile installation metadata without installing."""
from pathlib import Path, PureWindowsPath
import json
import re
import subprocess
import time
import xml.etree.ElementTree as ET

OUT=Path(__file__).parent
DOWNLOADS=Path(r'D:\New Skyrim Downloads')
INSTANCE=Path(r'E:\Nolvus\Instances\Nolvus Awakening')
SEVEN=Path(r'C:\Program Files\7-Zip\7z.exe')

def list_archive(path):
    result=subprocess.run([str(SEVEN),'l','-slt','-sccUTF-8',str(path)],capture_output=True,encoding='utf-8',errors='replace')
    if result.returncode:raise RuntimeError(result.stdout+result.stderr)
    text=result.stdout.split('----------',1)[1]
    records=[]
    for block in re.split(r'\r?\n\r?\n',text.strip()):
        fields=dict(line.split(' = ',1) for line in block.splitlines() if ' = ' in line)
        if 'Path' not in fields:continue
        path=PureWindowsPath(fields['Path'])
        if path.is_absolute() or '..' in path.parts or fields.get('Symbolic Link') or fields.get('Hard Link'):
            raise RuntimeError('Unsafe archive entry: '+repr(fields))
        if fields.get('Folder')=='+' or 'D' in fields.get('Attributes',''):continue
        fields['relative']=path.as_posix();records.append(fields)
    return records

def metadata(path):
    result=subprocess.run([str(SEVEN),'e','-so','-sccUTF-8',str(path),'fomod/ModuleConfig.xml','*/fomod/ModuleConfig.xml','fomod/info.xml','*/fomod/info.xml'],capture_output=True)
    # Metadata files are extracted individually to avoid concatenating separate XML documents.
    return result

def main():
    text=(INSTANCE/'MO2/ModOrganizer.ini').read_text(encoding='utf-8-sig')
    profile=re.search(r'^selected_profile=@ByteArray\((.*)\)',text,re.M).group(1)
    active=[line[1:] for line in (INSTANCE/'MODS/profiles'/profile/'modlist.txt').read_text(encoding='utf-8-sig').splitlines() if line.startswith('+')]
    installed=[]
    for directory in (INSTANCE/'MODS/mods').iterdir():
        if not directory.is_dir() or directory.name.endswith('_separator'):continue
        meta=directory/'meta.ini'
        values={}
        if meta.exists():
            values=dict(re.findall(r'^(modid|version|installationFile|name|comments|gameName)=(.*)$',meta.read_text(encoding='utf-8-sig',errors='replace'),re.M))
        installed.append({'mod':directory.name,'active':directory.name in active,'metadata':values})
    archives=[];started=time.monotonic()
    for index,path in enumerate(sorted(DOWNLOADS.iterdir()),1):
        if path.suffix.lower() not in {'.7z','.zip','.rar'}:continue
        files=list_archive(path)
        xml_paths=[entry['Path'] for entry in files if entry['relative'].lower().endswith(('fomod/moduleconfig.xml','fomod/info.xml'))]
        meta={}
        for xml_path in xml_paths:
            result=subprocess.run([str(SEVEN),'e','-so',str(path),xml_path],capture_output=True)
            if result.returncode:raise RuntimeError(result.stderr.decode(errors='replace'))
            target=OUT/'metadata'/path.name/(PureWindowsPath(xml_path).name)
            target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(result.stdout)
            meta[PureWindowsPath(xml_path).name]=str(target)
        plugin_files=[f['relative'] for f in files if PureWindowsPath(f['Path']).suffix.lower() in {'.esp','.esm','.esl'}]
        osp=[f['relative'] for f in files if f['relative'].lower().endswith('.osp')]
        idmatch=re.search(r'-(\d{4,6})-',path.name) or re.search(r' (\d{4,6}) ',path.name)
        nexus_id=int(idmatch.group(1)) if idmatch else None
        matches=[m for m in installed if m['metadata'].get('modid')==str(nexus_id)] if nexus_id else []
        archives.append({'archive':str(path),'filename':path.name,'bytes':path.stat().st_size,'files':files,'plugins':plugin_files,'osp':osp,'metadata_files':meta,'nexus_id':nexus_id,'installed_id_matches':matches})
        if index%10==0:print('Indexed archives:',index,flush=True)
    result={'instance':str(INSTANCE),'profile':profile,'active_mods':active,'installed':installed,'archives':archives}
    (OUT/'catalog.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    summary=[{'file':a['filename'],'id':a['nexus_id'],'installed':[m['mod']+' v'+m['metadata'].get('version','?') for m in a['installed_id_matches']],'plugins':a['plugins'],'BodySlide_projects_files':len(a['osp']),'fomod':bool(a['metadata_files'])} for a in archives]
    (OUT/'catalog-summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'archives':len(archives),'GiB':round(sum(a['bytes'] for a in archives)/2**30,2),'seconds':round(time.monotonic()-started)},indent=2))

if __name__=='__main__':main()
