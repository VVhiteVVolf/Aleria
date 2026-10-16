"""Verify the published supplement's controls and effective profile/repair file selection."""
from pathlib import Path
import csv
import hashlib
import json

OUT = Path(__file__).parent

def sha(path):
    with Path(path).open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()

def main():
    plan = json.loads((OUT/'strict-cleanup-plan.json').read_text(encoding='utf-8'))
    target = Path(plan['backup_root'])
    root = target.parent.parent
    complete = json.loads((target/'COMPLETE.json').read_text(encoding='utf-8'))
    pointer = json.loads((root/'LATEST_BACKUP.json').read_text(encoding='utf-8'))
    assert complete['status']=='VERIFIED'
    assert pointer['supplement']==target.relative_to(root).as_posix()
    assert sha(root/'BACKUP_COMPLETE.json')==complete['base_receipt_sha256']
    for name,hash_value in complete['control_sha256'].items():
        assert sha(target/name)==hash_value, 'Published control checksum mismatch: '+name
    with (target/'delta.manifest.csv').open(encoding='utf-8',newline='') as stream:
        delta = {row['path'].casefold():row for row in csv.DictReader(stream)}
    removed = {name.casefold() for name in json.loads((target/'removed-paths.json').read_text(encoding='utf-8'))}
    custom = set(json.loads((target/'added-mod-folders-current.json').read_text(encoding='utf-8')))
    assert all(key.split('/')[3] in {name.casefold() for name in custom} for key in delta if key.startswith('instance/mods/mods/')), 'Archived mod changes excluded from migration selection'
    deleted = {item['mod'] for item in json.loads((OUT/'strict-cleanup-result.json').read_text(encoding='utf-8-sig'))['removed']}
    assert not (deleted & custom)
    assert all(not any(key.startswith(('instance/mods/mods/'+name+'/').casefold()) for name in deleted) for key in delta)
    instance = Path(plan['instance'])
    profile = instance/'MODS/profiles'/plan['profile']
    repair = instance/'MODS/mods/Local - OBody Outfit Repairs 20261006'
    checked = 0
    saves = 0
    for folder in [profile,repair]:
        for file in folder.rglob('*'):
            if not file.is_file():
                continue
            key = ('instance/'+file.relative_to(instance).as_posix()).casefold()
            assert key in delta and key not in removed, 'Missing required current file: '+str(file)
            assert sha(file)==delta[key]['sha256'], 'Current required file differs from backup: '+str(file)
            checked += 1
            if file.parent.name.casefold()=='saves' and file.suffix.casefold()=='.ess':
                saves += 1
    for file in [instance/'MO2/ModOrganizer.ini',instance/'MODS/mods/BodySlide and Outfit Studio/CalienteTools/BodySlide/Config.xml']:
        key=('instance/'+file.relative_to(instance).as_posix()).casefold()
        assert key in delta and key not in removed and sha(file)==delta[key]['sha256']
        checked += 1
    result = {'verified':True,'published_controls_sha256_verified':True,'current_profile_and_repair_files_checked':checked,'current_profile_ess_saves_checked':saves,'deleted_mods_excluded_from_migration':len(deleted),'latest_backup':str(target)}
    (OUT/'migration-validation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(result,ensure_ascii=False,indent=2))

if __name__=='__main__':
    main()
