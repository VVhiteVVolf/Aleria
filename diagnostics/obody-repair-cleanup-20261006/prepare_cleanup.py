"""Only the selected profile and actually configured tools protect inactive mods."""
from pathlib import Path
import hashlib
import json
import re
import sys

OUT=Path(__file__).parent
AUDIT=OUT.parent/'obody-bodyslide-audit-20261006'
INSTANCE=Path(r'E:\Nolvus\Instances\Nolvus Awakening')
MODS=INSTANCE/'MODS/mods'
BACKUP=Path(r'D:\Nolvus-Backups\Awakening-6.0.20-vor-Update-20260930\updates\20261006-BodySlide-Reparatur-Bereinigung')

def main():
    ini=INSTANCE/'MO2/ModOrganizer.ini';text=ini.read_text(encoding='utf-8-sig')
    profile=re.search(r'^selected_profile=@ByteArray\((.*)\)',text,re.M).group(1)
    modlist=INSTANCE/'MODS/profiles'/profile/'modlist.txt'
    active={l[1:] for l in modlist.read_text(encoding='utf-8-sig').splitlines() if l.startswith('+')}
    configured=[]
    for line in text.splitlines():
        if re.match(r'\d+\\(binary|workingDirectory)=',line):configured.append(line.split('=',1)[1])
    launcher=INSTANCE/'MODS/Bathing-Installation-20260924/pandora_bathing_launcher.py'
    if launcher.exists():configured.append(str(MODS/'Twisted - Pandora/Pandora Behaviour Engine+.exe'))
    tool_mods=set()
    for value in configured:
        try:tool_mods.add(Path(value).relative_to(MODS).parts[0])
        except ValueError:pass
    candidates=[];retained=[]
    for directory in MODS.iterdir():
        if not directory.is_dir() or directory.name.endswith('_separator') or directory.name in active:continue
        if directory.name in tool_mods:
            retained.append({'mod':directory.name,'reason':'Used by a currently configured MO2 tool'});continue
        if directory.is_symlink() or directory.is_junction():raise RuntimeError('Linked inactive mod needs separate review: '+str(directory))
        candidates.append({'mod':directory.name,'path':str(directory)})
    plan={'instance':str(INSTANCE),'profile':profile,'modlist':str(modlist),'modlist_sha256':hashlib.sha256(modlist.read_bytes()).hexdigest(),'backup_root':str(BACKUP),'backup_archive':str(BACKUP/'inactive-mods-current-profile.tar.zst'),'mods':candidates,'retained_inactive':retained,'policy':'Only current profile matters; configured tools preserved; all other inactive mods removed after complete current backup and repair-source extraction.'}
    spec={'entries':[{'source':m['path'],'prefix':'instance/MODS/mods/'+m['mod']} for m in candidates]}
    (OUT/'strict-cleanup-plan.json').write_text(json.dumps(plan,ensure_ascii=False,indent=2),encoding='utf-8')
    (OUT/'inactive-backup-spec.json').write_text(json.dumps(spec,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'profile':profile,'delete_candidates':len(candidates),'retained_inactive_tools':retained},ensure_ascii=False,indent=2))

if __name__=='__main__':
    sys.stdout.reconfigure(encoding='utf-8');main()
