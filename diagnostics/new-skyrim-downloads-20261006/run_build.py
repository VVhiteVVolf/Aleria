from pathlib import Path
import json
import shutil
import subprocess
import time

OUT=Path(__file__).parent

def main():
    plan=json.loads((OUT/'build-plan.json').read_text(encoding='utf-8'))
    statuses=[]
    for family in sorted({p['family'] for p in plan['projects']}):
        tool=OUT/'BodySlide';output=OUT/'generated'/family
        command=[str(tool/'BodySlide x64.exe'),'--groupbuild','Local New Outfits '+family,'--preset=Local New Zero '+family,'--trimorphs','--targetdir',str(output)]
        startup=subprocess.STARTUPINFO();startup.dwFlags|=subprocess.STARTF_USESHOWWINDOW;startup.wShowWindow=0
        start=time.time()
        with (OUT/('build-console-'+family+'.log')).open('w',encoding='utf-8') as log:
            child=subprocess.Popen(command,cwd=tool,startupinfo=startup,stdout=log,stderr=log)
            while child.poll() is None:
                time.sleep(3)
                if time.time()-start>1800:
                    child.terminate();raise TimeoutError('BodySlide did not complete in 30 minutes; inspect local log')
        source=tool/'Log_BS.txt'
        if not source.exists() or source.stat().st_mtime<start:raise RuntimeError('No new BodySlide build log')
        shutil.copy2(source,OUT/('build-'+family+'.log'))
        text=source.read_text(encoding='utf-8-sig',errors='replace')
        result={'family':family,'exit_code':child.returncode,'seconds':round(time.time()-start),'success':child.returncode==0 and ('All group build sets processed successfully!' in text or 'All group build sets processed successfully' in text)}
        statuses.append(result)
        (OUT/'build-status.json').write_text(json.dumps(statuses,indent=2),encoding='utf-8')
        print(json.dumps(result),flush=True)
        if not result['success']:raise RuntimeError(text)

if __name__=='__main__':main()
