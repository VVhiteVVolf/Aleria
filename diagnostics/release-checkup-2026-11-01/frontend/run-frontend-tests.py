"""Capture the native test exit code without PowerShell stderr ErrorRecords."""
import json
from pathlib import Path
import subprocess
import sys
import time

directory = Path(__file__).resolve().parent
workspace = directory.parents[2]
frontend = workspace / 'AleriaAlmanach'
tests = sorted(str(path.relative_to(frontend)) for path in (frontend / 'tests').glob('*.test.mjs'))
command = ['node', '--test', '--experimental-test-isolation=none', *tests]
started = time.monotonic()
with (directory / 'full-tests-final.log').open('wb') as output:
    result = subprocess.run(command, cwd=frontend, stdout=output, stderr=subprocess.STDOUT, check=False)
report = {'nativeExitCode': result.returncode, 'testFiles': len(tests), 'elapsedSeconds': round(time.monotonic() - started, 3)}
(directory / 'full-tests-final-status.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(json.dumps(report))
sys.exit(result.returncode)
