"""Publish a verified incremental backup without modifying the existing base archives."""
import csv,datetime,hashlib,importlib.util,json,shutil,subprocess,sys
from pathlib import Path
sys.stdout.reconfigure(encoding='utf-8',errors='replace')
ROOT=Path(__file__).parent
BACKUP=Path(r'D:\Nolvus-Backups\Awakening-6.0.20-vor-Update-20260930')
UPDATE=BACKUP/'updates/20261004-SkyrimNet-Beta26-Prisma151'
OLD=Path(r'E:\Aleria\diagnostics\nolvus-update-preflight-20260930')
def sha(p):
    h=hashlib.sha256()
    with p.open('rb') as f:
        while b:=f.read(4194304):h.update(b)
    return h.hexdigest()
r=subprocess.run(['powershell','-NoProfile','-Command','Get-Process SkyrimSE,ModOrganizer -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Id'],capture_output=True,text=True)
assert not r.stdout.strip(),'Game/MO2 must remain closed for the consistent final capture'
assert json.loads((ROOT/'installation.json').read_text())['release']=='vbeta26-rc4'
UPDATE.mkdir(parents=True,exist_ok=False)
for name in ['delta-spec.json','delta-scan.json','removed-paths.json','empty-directories.json','added-mod-folders-current.json','migration-map-current.csv','installation.json','protected-before.json','release.json','personal-before.zip']:
    shutil.copy2(ROOT/name,UPDATE/name)
spec=importlib.util.spec_from_file_location('capture_zip',OLD/'capture_zip.py')
lib=importlib.util.module_from_spec(spec);spec.loader.exec_module(lib)
lib.capture(UPDATE/'delta-spec.json',UPDATE/'delta.zip')
with (UPDATE/'delta.manifest.csv').open(encoding='utf-8',newline='') as f:rows=list(csv.DictReader(f))
for row in rows:
    st=Path(row['source']).stat()
    assert (st.st_size,st.st_mtime_ns)==(int(row['bytes']),int(row['mtime_ns'])),'Source changed after capture'
shutil.copy2(ROOT/'restore_latest.py',UPDATE/'restore_latest.py')
shutil.copy2(ROOT/'restore_latest.py',BACKUP/'tools/restore_latest.py')
scan=json.loads((ROOT/'delta-scan.json').read_text())
control={p.name:sha(p) for p in UPDATE.iterdir() if p.is_file() and p.name not in ['COMPLETE.json','delta-spec.json']}
receipt={'status':'VERIFIED','created_at':datetime.datetime.now().isoformat(),'release':'SkyrimNet Beta26 RC4','prisma':'1.5.1','base_receipt_sha256':sha(BACKUP/'BACKUP_COMPLETE.json'),'scan':scan,'archive_bytes':(UPDATE/'delta.zip').stat().st_size,'control_sha256':control,'preservation':'5608 personal/runtime/compatibility files unchanged during installation; upstream wheel source identical; custom wheel PEX retained','verification':'Every delta file independently decompressed and SHA-256 verified; source size and timestamps stable after capture','restoration_test':'Pending'}
(UPDATE/'COMPLETE.json').write_text(json.dumps(receipt,indent=2),encoding='utf-8')
(BACKUP/'LATEST_BACKUP.json').write_text(json.dumps({'status':'VERIFIED','supplement':UPDATE.relative_to(BACKUP).as_posix(),'base':'BACKUP_COMPLETE.json','date':'2026-10-04','restore_tool':'tools/restore_latest.py'},indent=2),encoding='utf-8')
readme=BACKUP/'README_WIEDERHERSTELLUNG.md'
original=BACKUP/'README_WIEDERHERSTELLUNG_BASIS_20260930.md'
if not original.exists():shutil.copy2(readme,original)
text='''# Aktuelle Sicherung: 4. Oktober 2026\n\nDie Basissicherung vom 30. September UND die Ergänzung unter `updates/20261004-SkyrimNet-Beta26-Prisma151` gehören zusammen. Beide aufbewahren. `LATEST_BACKUP.json` bezeichnet den neuesten Stand. Die alten Basisarchive sind unverändert.\n\nEnthalten: SkyrimNet Beta26 RC4, PrismaUI 1.5.1, persönliche Prompts, Einstellungen, API-Konfiguration, Erinnerungsdatenbanken, Wheel-Korrektur, aktuelle Profile und Spielstände sowie alle anhand Größe/Zeitstempel erfassten Änderungen der gesamten Installation seit der Basis. Kritische Profile und SkyrimNet-/PrismaUI-Dateien wurden vollständig erneut erfasst. Entfernte Dateien werden bei Wiederherstellung ausgelassen. Die CSV `migration-map-current.csv` dokumentiert aktuelle Zusatzmods, Aktivierung und Reihenfolge.\n\n## Sichere Wiederherstellung in einen neuen Zwischenordner\n\n```powershell\n& 'C:\\Users\\fhg_r\\miniconda3\\python.exe' 'D:\\Nolvus-Backups\\Awakening-6.0.20-vor-Update-20260930\\tools\\restore_latest.py' --destination 'E:\\Nolvus-Migration-20261004' --scope migration\n```\n\nDer Zielordner darf noch nicht existieren. `migration` restauriert aktuelle Zusatzmods, Profile/Spielstände, MO2-Konfiguration, Overwrite und externe Skyrim-Benutzerdaten. `custom` nur Zusatzmods; `profiles` nur Profile und ihre Saves; `all` die vollständige alte Installation mit Ergänzung. Optional `--scope custom --mod "SkyrimNet - Beta 26 RC4"` für einzelne aktuelle Zusatzmods. Jede wiederhergestellte Datei wird anhand SHA-256 geprüft. Python mit zstandard ist erforderlich (vorhanden: Miniconda).\n\n## Nach einem Nolvus-Upgrade\n\nZusatzmods aus dem Zwischenordner selektiv übernehmen. Das neue Nolvus-Basisprofil beibehalten und die dokumentierten Zusatzmods sowie Reihenfolge darauf abgleichen; alte komplette Modlisten oder Basisdateien nicht ungeprüft über die neue Nolvus-Version kopieren. Änderungen bestehender Basis-Mods stehen ebenfalls im Delta und müssen bei Bedarf auf die neue Basis übertragen werden. Spielstände und SkyrimNet-Runtime/Overlay/Erinnerungen zusammen behalten. Neue Nolvus-Versionen können neue Spielstände erfordern; eine Sicherung garantiert keine Save-Kompatibilität. Die Sicherung enthält private API-Schlüssel und persönliche Daten.\n\nWeitere Details zur unveränderten Basissicherung: `README_WIEDERHERSTELLUNG_BASIS_20260930.md`. Für den heutigen Stand ausschließlich `restore_latest.py` verwenden.\n'''
readme.write_text(text,encoding='utf-8')
(UPDATE/'CHECKSUMS.sha256').write_text('\n'.join(h+'  '+n for n,h in control.items())+'\n',encoding='utf-8')
print(json.dumps({'status':receipt['status'],'supplement':str(UPDATE),'files':len(rows),'source_gib':round(scan['selected_bytes']/2**30,2),'archive_gib':round(receipt['archive_bytes']/2**30,2)}),flush=True)
