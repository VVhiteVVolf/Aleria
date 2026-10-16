"""Wait for package jobs, then run the independent coverage/finalization gate."""
import json
import subprocess
import sys
import time
from pathlib import Path

here=Path(__file__).parent
dest=Path(r'D:\Nolvus-Backups\Awakening-6.0.20-vor-Update-20260930')
resultfile=dest/'job-results.json'
while not resultfile.exists():
    time.sleep(10)
results=json.loads(resultfile.read_text())
failed=[r for r in results if r['returncode']]
if failed:
    print(json.dumps({'failed_jobs':failed}),flush=True)
    raise SystemExit(1)
raise SystemExit(subprocess.call([sys.executable,'-u',str(here/'finalize_backup.py')]))
