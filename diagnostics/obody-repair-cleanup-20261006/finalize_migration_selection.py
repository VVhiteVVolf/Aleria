"""Include changed original Nolvus settings mods in the existing migration selection."""
from pathlib import Path, PurePosixPath
import csv
import hashlib
import json
import shutil

OUT = Path(__file__).parent

def sha(path):
    with Path(path).open('rb') as stream:
        return hashlib.file_digest(stream,'sha256').hexdigest()

def main():
    plan = json.loads((OUT/'strict-cleanup-plan.json').read_text(encoding='utf-8'))
    target = Path(plan['backup_root'])
    complete_path = target/'COMPLETE.json'
    complete = json.loads(complete_path.read_text(encoding='utf-8'))
    selection_path = target/'added-mod-folders-current.json'
    assert complete['status']=='VERIFIED'
    assert sha(selection_path)==complete['control_sha256'][selection_path.name]
    assert sha(target/'delta.manifest.csv')==complete['control_sha256']['delta.manifest.csv']
    custom = set(json.loads(selection_path.read_text(encoding='utf-8')))
    active = set(json.loads((target/'current-profile-state.json').read_text(encoding='utf-8'))['active_mods'])
    with (target/'delta.manifest.csv').open(encoding='utf-8',newline='') as stream:
        rows = list(csv.DictReader(stream))
    extra_rows = []
    extra_mods = set()
    for row in rows:
        pieces = PurePosixPath(row['path']).parts
        if pieces[:3]==('instance','MODS','mods') and pieces[3] not in custom:
            assert pieces[3] in active
            extra_mods.add(pieces[3])
            extra_rows.append(row)
    if not extra_mods:
        print('All changed mod folders already selected for migration.')
        return
    shutil.copy2(selection_path,target/'added-mod-folders-current.before-final-selection.json')
    shutil.copy2(complete_path,target/'COMPLETE.before-final-selection.json')
    selected = sorted(custom | extra_mods)
    selection_path.write_text(json.dumps(selected,ensure_ascii=False,indent=2),encoding='utf-8')
    (target/'changed-original-mod-folders.json').write_text(json.dumps(sorted(extra_mods),ensure_ascii=False,indent=2),encoding='utf-8')
    with (target/'changed-original-mod-files.tsv').open('w',encoding='utf-8-sig',newline='') as stream:
        writer = csv.writer(stream,delimiter='\t')
        writer.writerow(['Archived relative path','Bytes','SHA-256'])
        writer.writerows([row['path'],row['bytes'],row['sha256']] for row in extra_rows)
    complete['migration_selection']={'folders':len(selected),'changed_original_nolvus_folders_added':len(extra_mods),'changed_original_files':len(extra_rows),'reason':'All archived mod changes are selected for staging, including original Nolvus configuration mods. Future installation still requires reconciliation with updated Nolvus versions.'}
    for name in [selection_path.name,'changed-original-mod-folders.json','changed-original-mod-files.tsv']:
        complete['control_sha256'][name]=sha(target/name)
    complete_path.write_text(json.dumps(complete,ensure_ascii=False,indent=2),encoding='utf-8')
    guide = target.parent.parent/'00_AKTUELLE_WIEDERHERSTELLUNG.md'
    with guide.open('a',encoding='utf-8') as stream:
        stream.write('\n## Geänderte ursprüngliche Nolvus-Konfigurationsmods\n\nAuch die 32 ursprünglichen Nolvus-Modordner mit geänderten Dateien sind in der Migrationsauswahl markiert (zusätzlicher Basisumfang nur etwa 293 MiB). Dazu gehören beispielsweise Extended Hotkey System, HUD-, OAR-, Valhalla- und Engine-Fixes-Einstellungen. Nach dem Update nur die eigenen Einstellungen mit den neuen Nolvus-Fassungen abgleichen; die bereitgestellten Originalmodordner nicht blind vollständig darüberkopieren. Die konkret geänderten Dateien stehen im neuen Zusatzstand unter `changed-original-mod-files.tsv`.\n')
    print(json.dumps(complete['migration_selection'],ensure_ascii=False,indent=2))

if __name__=='__main__':
    main()
