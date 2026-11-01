"""Run the official complete release gate; retain the actual child exit code."""
import json
import re
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

root = Path(__file__).resolve().parents[2]
directory = Path(__file__).resolve().parent
started = time.monotonic()
with (directory / "full-release-preflight-coherent.log").open("w", encoding="utf-8") as output:
    result = subprocess.run(["node", "netlify/build/run-site-build.mjs", "--full"],
                            cwd=root, stdout=output, stderr=subprocess.STDOUT)
log = (directory / "full-release-preflight-coherent.log").read_text(encoding="utf-8")
report = {"checkedAt": datetime.now(timezone.utc).isoformat(),
          "nativeExitCode": result.returncode,
          "seconds": round(time.monotonic() - started, 2),
          "completedTasks": re.findall(r"\[site-build\] DONE ([\w-]+) in", log),
          "log": "full-release-preflight-coherent.log"}
(directory / "full-release-preflight-status.json").write_text(
    json.dumps(report, indent=2) + "\n", encoding="utf-8")
print(json.dumps(report, indent=2))
if result.returncode:
    print("\n".join(log.splitlines()[-24:]))
sys.exit(result.returncode)
