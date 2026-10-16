"""Compose a verified cumulative migration supplement for the selected profile only."""
from pathlib import Path, PurePosixPath
import csv
import hashlib
import importlib.util
import json
import os
import shutil
import sys
import time
import zipfile

OUT = Path(__file__).parent
PLAN = json.loads((OUT/'migration-plan.json').read_text(encoding='utf-8'))
DEPLOY = json.loads((OUT/'deployment-plan.json').read_text(encoding='utf-8'))
NEW_MODS = {m['name'] for m in DEPLOY['mods']}
INSTANCE = Path(PLAN['instance'])
BACKUP = Path(PLAN['backup_root']).parent.parent
TARGET = Path(PLAN['backup_root'])
CHUNK = 4 * 1024 * 1024
FIELDS = ['path', 'source', 'bytes', 'mtime_ns', 'sha256']

def sha(path):
    with Path(path).open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()

def save(name, value):
    (TARGET/name).write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding='utf-8')

def part(name):
    path = PurePosixPath(name)
    if path.is_absolute() or any(p in ('..', '.', '') for p in path.parts):
        raise ValueError('Unsafe archive member')
    return path.parts

def main():
    installed = json.loads((OUT/'deployment-result.json').read_text(encoding='utf-8'))
    assert installed['completed']
    assert json.loads((OUT/'installation-validation.json').read_text(encoding='utf-8'))['verified']
    TARGET.mkdir(parents=True, exist_ok=False)
    pointer = json.loads((BACKUP/'LATEST_BACKUP.json').read_text(encoding='utf-8'))
    previous = BACKUP.joinpath(*part(pointer['supplement']))
    assert previous != TARGET
    receipt = json.loads((previous/'COMPLETE.json').read_text(encoding='utf-8'))
    assert receipt['status'] == 'VERIFIED'
    assert sha(previous/'delta.zip') == receipt['control_sha256']['delta.zip']
    assert sha(previous/'delta.manifest.csv') == receipt['control_sha256']['delta.manifest.csv']
    base = json.loads((BACKUP/'BACKUP_COMPLETE.json').read_text(encoding='utf-8'))
    assert sha(BACKUP/'BACKUP_COMPLETE.json') == receipt['base_receipt_sha256']
    profile = PLAN['profile']
    modlist = INSTANCE/'MODS/profiles'/profile/'modlist.txt'
    active = {line[1:] for line in modlist.read_text(encoding='utf-8-sig').splitlines() if line.startswith('+')}
    custom = {name for name in json.loads((previous/'added-mod-folders-current.json').read_text(encoding='utf-8')) if name in active}
    baseline = {}
    base_mods = set()
    base_paths = []
    for package in base['packages']:
        with (BACKUP/package['manifest']).open(encoding='utf-8', newline='') as stream:
            for row in csv.DictReader(stream):
                key = row['path'].casefold()
                baseline[key] = (int(row['bytes']), int(row['mtime_ns']))
                base_paths.append(row['path'])
                p = part(row['path'])
                if p[:3] == ('instance','MODS','mods') and len(p)>3:
                    base_mods.add(p[3])
    with (previous/'delta.manifest.csv').open(encoding='utf-8', newline='') as stream:
        old_rows = {row['path'].casefold(): row for row in csv.DictReader(stream)}
    for key,row in old_rows.items():
        baseline[key] = (int(row['bytes']), int(row['mtime_ns']))
    custom.update(name for name in active if name not in base_mods and not name.endswith('_separator'))
    # BodySlide's original tool is retained for staging its changed configuration;
    # importing its binaries into a future Nolvus version is never automatic.
    custom.add('BodySlide and Outfit Studio')
    current = {}
    empty = []
    roots = [(INSTANCE/'MODS/mods'/name, 'instance/MODS/mods/'+name) for name in sorted(active) if (INSTANCE/'MODS/mods'/name).is_dir()]
    roots += [(INSTANCE/'MODS/profiles'/profile, 'instance/MODS/profiles/'+profile), (INSTANCE/'MODS/overwrite','instance/MODS/overwrite')]
    scanned = 0
    last = time.monotonic()
    for root,prefix in roots:
        if not root.exists():
            continue
        for directory,dirs,files in os.walk(root, followlinks=False):
            for name in dirs+files:
                path = Path(directory)/name
                if path.is_symlink() or path.is_junction():
                    raise RuntimeError('Unreviewed source link: '+str(path))
            if not dirs and not files:
                relative = Path(directory).relative_to(root).as_posix()
                empty.append(prefix+('/'+relative if relative!='.' else '')+'/')
            for name in files:
                path = Path(directory)/name
                relative = prefix+'/'+path.relative_to(root).as_posix()
                stat = path.stat()
                current[relative.casefold()] = (relative, path, stat.st_size, stat.st_mtime_ns)
                scanned += 1
            if time.monotonic()-last > 20:
                print('Scanned current-profile backup files:',scanned,flush=True)
                last = time.monotonic()
    for path,relative in [(INSTANCE/'MO2/ModOrganizer.ini','instance/MO2/ModOrganizer.ini')]:
        stat = path.stat()
        current[relative.casefold()] = (relative,path,stat.st_size,stat.st_mtime_ns)
    def current_scope(name):
        p = part(name)
        return p[:3] in [('instance','MODS','mods'),('instance','MODS','profiles'),('instance','MODS','overwrite')] or name == 'instance/MO2/ModOrganizer.ini'
    removed = {name for name in json.loads((previous/'removed-paths.json').read_text(encoding='utf-8'))}
    removed.update(name for name in base_paths if current_scope(name) and name.casefold() not in current)
    removed.update(row['path'] for key,row in old_rows.items() if current_scope(row['path']) and key not in current)
    removed_keys = {name.casefold() for name in removed}
    recipes = {}
    for key,row in old_rows.items():
        if key in removed_keys:
            continue
        recipes[key] = ('archive',row)
    for key,(relative,path,size,mtime) in current.items():
        p = part(relative)
        force = p[:3] == ('instance','MODS','profiles') or relative == 'instance/MO2/ModOrganizer.ini' or (p[:3] == ('instance','MODS','mods') and len(p) > 3 and p[3] in NEW_MODS)
        if force or baseline.get(key) != (size,mtime):
            recipes[key] = ('source',{'path':relative,'source':str(path),'bytes':size,'mtime_ns':mtime})
            removed.discard(relative)
    for _,row in recipes.values():
        pieces = part(row['path'])
        if pieces[:3] == ('instance','MODS','mods') and pieces[3] in active:
            custom.add(pieces[3])
    archive_path = TARGET/'delta.zip'
    if archive_path.exists():
        raise FileExistsError(archive_path)
    print('Creating cumulative supplement:',len(recipes),'files; current scan:',scanned,flush=True)
    with zipfile.ZipFile(previous/'delta.zip') as old_archive, zipfile.ZipFile(archive_path,'x',compression=zipfile.ZIP_DEFLATED,compresslevel=1,allowZip64=True) as archive, (TARGET/'delta.manifest.csv').open('x',encoding='utf-8',newline='') as manifest:
        writer = csv.DictWriter(manifest,fieldnames=FIELDS)
        writer.writeheader()
        last = time.monotonic()
        for index,(kind,row) in enumerate(recipes.values(),1):
            if shutil.disk_usage(TARGET).free < 5*2**30:
                raise RuntimeError('Backup disk has less than 5 GiB free')
            h = hashlib.sha256()
            count = 0
            if kind == 'source':
                source = Path(row['source'])
                before = source.stat()
                assert (before.st_size,before.st_mtime_ns) == (row['bytes'],row['mtime_ns']), 'Source changed after scan'
                reader = source.open('rb')
            else:
                reader = old_archive.open(row['path'])
            info = zipfile.ZipInfo(row['path'])
            info.compress_type = zipfile.ZIP_DEFLATED
            info._compresslevel = 1
            with reader, archive.open(info,'w',force_zip64=True) as destination:
                while block := reader.read(CHUNK):
                    h.update(block)
                    count += len(block)
                    destination.write(block)
            if kind == 'source':
                after = source.stat()
                assert (before.st_size,before.st_mtime_ns) == (after.st_size,after.st_mtime_ns)
            else:
                assert h.hexdigest() == row['sha256'], 'Previous supplement file checksum mismatch'
            assert count == int(row['bytes'])
            writer.writerow(row | {'sha256':h.hexdigest()})
            if time.monotonic()-last > 20:
                save('delta.status.json',{'stage':'capture','files_done':index,'files_total':len(recipes)})
                print('Cumulative supplement captured:',index,'/',len(recipes),flush=True)
                last = time.monotonic()
    count = 0
    with zipfile.ZipFile(archive_path) as archive, (TARGET/'delta.manifest.csv').open(encoding='utf-8',newline='') as manifest:
        last = time.monotonic()
        for row in csv.DictReader(manifest):
            h = hashlib.sha256()
            size = 0
            with archive.open(row['path']) as reader:
                while block := reader.read(CHUNK):
                    h.update(block)
                    size += len(block)
            assert h.hexdigest() == row['sha256'] and size == int(row['bytes'])
            count += 1
            if time.monotonic()-last > 20:
                print('Cumulative supplement independently verified:',count,flush=True)
                last = time.monotonic()
        assert count == len(archive.infolist())
    save('delta.status.json',{'stage':'verified','files':count,'archive_bytes':archive_path.stat().st_size})
    save('added-mod-folders-current.json',sorted(custom))
    save('removed-paths.json',sorted(removed))
    save('empty-directories.json',sorted(empty))
    save('current-profile-state.json',{'profile':profile,'active_mods':sorted(active),'source_files_scanned':scanned,'new_mods_installed':installed['mods'],'new_plugins':installed['new_plugins'],'scope':'Current profile only; prior cumulative supplement retained except removed paths. Active mod trees fully scanned for changes since base plus previous supplement.'})
    control_names = ['delta.zip','delta.manifest.csv','delta.status.json','added-mod-folders-current.json','removed-paths.json','empty-directories.json','current-profile-state.json']
    records = TARGET/'installation-records'
    records.mkdir()
    names = ['INSTALLATIONSBERICHT.md','deployment-plan.json','deployment-result.json',
             'deployed-file-manifest.json','installation-validation.json','build-validation.json',
             'build-plan.json','build-status.json','build-support-receipt.json','armor-resource-validation.json',
             'texture-validation.json','adrienne-compatibility.json','forsworn-compatibility.json',
             'romper-path-fix.json','catalog-summary.json','extraction.json',
             'build-female.log','build-male.log','modlist.after.txt','plugins.after.txt','loadorder.after.txt']
    for name in names:
        shutil.copy2(OUT/name, records/name)
        assert sha(OUT/name) == sha(records/name)
        control_names.append('installation-records/'+name)
    controls = {name:sha(TARGET/name) for name in control_names}
    save('COMPLETE.json',{'status':'VERIFIED','base_receipt_sha256':sha(BACKUP/'BACKUP_COMPLETE.json'),'control_sha256':controls,'files':count,'previous_supplement':str(previous),'verification':'Every new/carry-forward archive member independently decompressed and SHA-256 checked; all enabled mod trees scanned; only current profile retained.'})
    # Prove that the repair package can be restored into a new directory before publishing.
    spec = importlib.util.spec_from_file_location('base_restore',BACKUP/'tools/restore_backup.py')
    lib = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(lib)
    with (TARGET/'delta.manifest.csv').open(encoding='utf-8',newline='') as manifest:
        rows = [row for row in csv.DictReader(manifest) if part(row['path'])[:4] == ('instance','MODS','mods','Local - New Downloads OBody Output 20261006')]
    destination = TARGET/'restore-test-new-output'
    assert not destination.exists()
    destination.mkdir()
    restored = lib.extract_package(archive_path,rows,destination,'all',custom,[])
    assert restored == len(rows) and restored > 2500
    save('output-restoration-test.json',{'verified':True,'files':restored,'new_staging_directory':str(destination)})
    shutil.copy2(BACKUP/'LATEST_BACKUP.json',TARGET/'LATEST_BACKUP.before.json')
    latest = {'status':'VERIFIED','supplement':TARGET.relative_to(BACKUP).as_posix(),'base':'BACKUP_COMPLETE.json','date':'2026-10-06','restore_tool':'tools/restore_latest.py','instructions':'00_AKTUELLE_WIEDERHERSTELLUNG.md'}
    (BACKUP/'LATEST_BACKUP.json').write_text(json.dumps(latest,ensure_ascii=False,indent=2),encoding='utf-8')
    documentation = BACKUP/'00_AKTUELLE_WIEDERHERSTELLUNG.md'
    if documentation.exists():
        shutil.copy2(documentation,TARGET/'00_AKTUELLE_WIEDERHERSTELLUNG.before.md')
    documentation.write_text('# Aktuelle Wiederherstellung ? 6. Oktober 2026\n\nAktueller gepr?fter Zusatzstand: `updates/20261006-New-Downloads`. Dieser Zusatz ist kumulativ zum Basisbackup. Enthalten sind die bisherigen SkyrimNet-Beta26-/Prisma-Anpassungen, pers?nlichen Prompts, K?rperreparaturen und aktiven Zusatzmods sowie die heutige Modinstallation, alle neuen BodySlide-Ausgaben und das aktuelle Profil einschlie?lich Spielst?nden. Nur das aktuelle Profil wird f?r die Migration ber?cksichtigt.\n\nDie Datei `LATEST_BACKUP.json` verweist erst nach vollst?ndiger SHA-256-Pr?fung und erfolgreichem Wiederherstellungstest auf diesen Stand.\n\nWiederherstellung in einen neuen Staging-Ordner:\n\n```powershell\npython tools/restore_latest.py --destination D:\\Nolvus-Wiederherstellung-20261006-Neue-Mods --scope migration\n```\n\nDanach Zusatzmods gezielt in die neue Nolvus-Version ?bernehmen und Konflikte pr?fen. Alte Profillisten nicht blind ?ber die neue Basis legen. BodySlide-Binaries und MO2-Konfiguration dienen zum Abgleich; Toolversionen und Pfade an die neue Installation anpassen. Deaktivierte ersetzte Mods werden nicht automatisch wieder hinzugef?gt.\n\nDie fr?here Sicherung der 183 gel?schten inaktiven Mods bleibt separat unter `updates/20261006-BodySlide-Reparatur-Bereinigung/inactive-mods-current-profile.tar.zst` erhalten und wird beim normalen Migrationsrestore nicht eingespielt.\n\nDer vollst?ndige Installationsbericht und die Pr?fnachweise liegen zus?tzlich im Unterordner `installation-records` des aktuellen Zusatzbackups.\n', encoding='utf-8')
    print(json.dumps({'status':'VERIFIED','latest_supplement':str(TARGET),'files':count,'archive_GiB':round(archive_path.stat().st_size/2**30,2),'output_restore_test_files':restored},ensure_ascii=False,indent=2),flush=True)

if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    main()
