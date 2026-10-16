"""Stage complete packages and preserve only verified local runtime state."""
from pathlib import Path
import hashlib
import importlib.util
import json
import re
import shutil
import sys
import zipfile

ROOT=Path(__file__).parent
MODS=Path(r'E:\Nolvus\Instances\Nolvus Awakening\MODS\mods')
PREVIOUS=Path(r'E:\Aleria\diagnostics\skyrimnet-repair-20261007')
sys.path.insert(0,str(PREVIOUS))
from fomod_install import build
spec=importlib.util.spec_from_file_location('prior_package_reader',PREVIOUS/'prepare_packages.py')
reader=importlib.util.module_from_spec(spec);spec.loader.exec_module(reader)

PACKAGES=[
 ('SkyrimNet - Beta 26 RC4','SkyrimNet - Beta 27','SkyrimNet - Beta 27','MinLL--SkyrimNet-GamePlugin','0.27.0','skyrimnet-beta27.zip'),
 ('SeverActions 4.2.0','SeverActions 4.3.0','Severause--SeverActions','Severause--SeverActions','4.3.0','SeverActions-4.3.0-FOMOD.zip'),
 ('IntelEngine 3.5.1 - Complete','IntelEngine 3.5.2 - Complete','Gerkinfeltser--IntelEngine-GamePlugin','Gerkinfeltser--IntelEngine-GamePlugin','3.5.2','IntelEngine-v3.5.2.zip'),
 ('OStimNet 2.5.4 - SkyrimNet 25','OStimNet 2.5.5 - SkyrimNet 25','tetherball88--OStimNet','tetherball88--OStimNet','2.5.5','OStimNet_v2.5.5_SkyrimNet_v25.zip'),
 ('NarrativeEngine 0.7.1','NarrativeEngine 0.7.3','pdusen--skyrimnet-plugin-narrative-engine','pdusen--skyrimnet-plugin-narrative-engine','0.7.3','NarrativeEngine-v0.7.3.zip'),
 ('MARAS 0.11.0','MARAS 0.11.1','tetherball88--maras','tetherball88--maras','0.11.1','MARAS_v0.11.1.zip'),
 ('Bathing in Skyrim Renewed - SkyrimNet SeverActions 2.5','Bathing in Skyrim Renewed - SkyrimNet SeverActions 2.6','Telord72612--Bathing-in-Skyrim-SN-SA-Plugins','Telord72612--Bathing-in-Skyrim-SN-SA-Plugins','2.6.0','Bathing.in.Skyrim.Renewed.SNSA.Plugins.V2.6.0.zip'),
]

def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()

def main():
    report=[]
    for old,new,folder,repo,version,archive_name in PACKAGES:
        source=ROOT/'upstream'/folder;dest=ROOT/'stage'/new
        if repo=='Severause--SeverActions':
            assert dest.is_dir()
            fomod=json.loads((ROOT/'sever-fomod.json').read_text())
        else:
            assert dest.resolve().parent==(ROOT/'stage').resolve()
            if repo.startswith('Telord72612'):
                shutil.copytree(source/'00 Core',dest,dirs_exist_ok=True)
                fomod={'choices':['Core only'],'paired_washing':False}
            else:
                shutil.copytree(source,dest,ignore=shutil.ignore_patterns('fomod'),dirs_exist_ok=True)
                fomod=None
        old_mod=MODS/old
        old_archive=reader.old_archive_path(old_mod)
        baseline=reader.old_file_digests(old_archive)
        # Optional source/docs may have been retained beside the required FOMOD payload.
        with zipfile.ZipFile(old_archive) as archive:
            for name in archive.namelist():
                if name.endswith('/'):continue
                existing=baseline.get(name.casefold(),set())
                if isinstance(existing,str):existing={existing}
                existing.add(hashlib.sha256(archive.read(name)).hexdigest())
                baseline[name.casefold()]=existing
        preserved=[];conflicts=[]
        for file in old_mod.rglob('*'):
            if not file.is_file() or file.name=='meta.ini':continue
            rel=file.relative_to(old_mod).as_posix();hashes=baseline.get(rel.casefold(),set())
            if isinstance(hashes,str):hashes={hashes}
            if sha(file) in hashes:continue
            if old.startswith('OStimNet') and rel=='SKSE/Plugins/OStimNet/OStimNetMetaData.json':
                # The shipped metadata is unchanged in this update; retain generated entries verbatim.
                assert sha(dest/rel) in hashes
                shutil.copy2(file,dest/rel);preserved.append(rel)
            else:conflicts.append(rel)
        assert not conflicts,f'Unreviewed custom files in {old}: {conflicts}'
        release=json.loads((ROOT/'releases'/(repo+'.json')).read_text())[0]
        archive=(Path(r'E:\Nolvus\Instances\Nolvus Awakening\MODS\downloads')/archive_name if repo.startswith('MinLL') else ROOT/'downloads'/archive_name)
        meta=(old_mod/'meta.ini').read_text(encoding='utf-8-sig')
        values={'version':version,'installationFile':str(archive).replace('\\','/'),'url':release['html_url'],'hasCustomURL':'true'}
        for key,value in values.items():
            pattern='^'+re.escape(key)+'=.*$'
            if re.search(pattern,meta,re.M):meta=re.sub(pattern,lambda match:key+'='+value,meta,flags=re.M)
            else:meta+='\n'+key+'='+value+'\n'
        (dest/'meta.ini').write_text(meta,encoding='utf-8')
        row={'old':old,'new':new,'version':version,'repo':repo,'archive':str(archive),
             'release_url':release['html_url'],'preserved_local_files':preserved,'fomod':fomod,
             'files':{p.relative_to(dest).as_posix():sha(p) for p in dest.rglob('*') if p.is_file()}}
        report.append(row)
        print(new,'files',len(row['files']),'preserved',preserved,flush=True)
    (ROOT/'package-plan.json').write_text(json.dumps(report,indent=2),encoding='utf-8')

if __name__=='__main__':main()
