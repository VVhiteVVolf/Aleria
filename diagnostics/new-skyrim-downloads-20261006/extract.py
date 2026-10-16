"""Extract candidate archives only into new reviewed staging directories."""
from pathlib import Path
import hashlib
import json
import subprocess
import time
from catalog import OUT,SEVEN

SKIP_IDS={81043,79753,84280,59363,79088,112454,51610,57539,38446,138207,98945,167530}

def main():
    data=json.loads((OUT/'catalog.json').read_text(encoding='utf-8'))
    selected=[];skipped=[];hashes={}
    for index,item in enumerate(data['archives']):
        name=item['filename'];reason=None
        if item['nexus_id'] in SKIP_IDS:reason='Existing same/newer version or existing 3BA conversion; alternative vanilla style declined'
        if name.startswith('Bishop Armor CBBE'):reason='Use downloaded 3BA alternative'
        if name.startswith('Fashions Of Forsworn Static CBBE'):reason='Use 3BA physics conversion instead'
        if name.startswith('3DNPC Follower and Wives Replacer ESL'):reason='Use SkyPatcher alternative to preserve NPC gameplay overrides'
        if 'Standalone' in name and item['nexus_id']==129638:reason='Use replacer conversions with the replacer base, not standalone paths'
        if item['nexus_id']==72794 and name.startswith('Draugr Spear Animation'):reason='Use Precision Creatures version because Precision Creatures is active'
        if '(1).7z' in name:
            twin=name.replace(' (1).7z','.7z')
            other=next((a for a in data['archives'] if a['filename']==twin),None)
            if other:
                def sha(path):
                    with Path(path).open('rb') as stream:return hashlib.file_digest(stream,'sha256').hexdigest()
                if sha(item['archive'])==sha(other['archive']):reason='Exact duplicate downloaded twice'
        if reason:
            skipped.append({'archive':name,'reason':reason});continue
        destination=OUT/'unpacked'/('%02d'%index)
        destination.mkdir(parents=True,exist_ok=True)
        start=time.monotonic()
        result=subprocess.run([str(SEVEN),'x','-y','-bd','-bb0','-o'+str(destination),item['archive']],capture_output=True,encoding='utf-8',errors='replace')
        (OUT/'extract-logs').mkdir(exist_ok=True)
        (OUT/'extract-logs'/(str(index)+'.txt')).write_text(result.stdout+'\n'+result.stderr,encoding='utf-8')
        if result.returncode or 'Everything is Ok' not in result.stdout:raise RuntimeError('Archive extraction/integrity check failed: '+name+'\n'+result.stdout+result.stderr)
        # 7-Zip verifies the compressed streams/CRC during extraction; compare exact entry sizes too.
        extracted={p.relative_to(destination).as_posix().casefold():p for p in destination.rglob('*') if p.is_file()}
        expected={r['relative'].casefold():int(r['Size']) for r in item['files']}
        if extracted.keys()!=expected.keys():raise RuntimeError('Extracted entry set mismatch: '+name)
        for key,path in extracted.items():
            if path.is_symlink() or path.is_junction() or path.stat().st_size!=expected[key]:raise RuntimeError('Invalid extracted file: '+str(path))
        selected.append({'index':index,'archive':name,'source_archive':item['archive'],'directory':str(destination),'nexus_id':item['nexus_id'],'files':len(extracted)})
        (OUT/'extraction.json').write_text(json.dumps({'selected':selected,'skipped':skipped},ensure_ascii=False,indent=2),encoding='utf-8')
        print('Extracted',len(selected),name,'('+str(round(time.monotonic()-start))+'s)',flush=True)
    print(json.dumps({'selected':len(selected),'skipped':len(skipped)},indent=2),flush=True)

if __name__=='__main__':main()
