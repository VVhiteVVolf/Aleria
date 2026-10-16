"""Run bounded independent backup packages and record failures durably."""
import concurrent.futures
import json
import subprocess
import sys
from pathlib import Path

HERE=Path(__file__).parent
DEST=Path(r'D:\Nolvus-Backups\Awakening-6.0.20-vor-Update-20260930')


def run(job):
    output=DEST/(job['name']+'.zip')
    status=output.with_suffix('.status.json')
    if status.exists() and json.loads(status.read_text())['stage']=='verified':
        return {'name':job['name'],'returncode':0,'already_verified':True}
    with (DEST/(job['name']+'.log')).open('x',encoding='utf-8') as log:
        proc=subprocess.run([sys.executable,'-u',str(HERE/'capture_zip.py'),job['spec'],str(output)],stdout=log,stderr=subprocess.STDOUT)
    result={'name':job['name'],'returncode':proc.returncode}
    print(json.dumps(result),flush=True)
    return result


if __name__=='__main__':
    jobs=json.loads((HERE/'jobs.json').read_text())
    DEST.mkdir(parents=True,exist_ok=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        results=list(pool.map(run,jobs))
    (DEST/'job-results.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
    sys.exit(0 if all(r['returncode']==0 for r in results) else 1)
