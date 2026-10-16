"""Install the verified official PrismaUI fix into its existing active MO2 mod."""
from pathlib import Path
import datetime
import hashlib
import json
import os
import shutil
import subprocess

ROOT = Path(__file__).resolve().parent


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    running = subprocess.run(
        ["powershell", "-NoProfile", "-Command",
         "if (Get-Process -Name SkyrimSE,SkyrimVR -ErrorAction SilentlyContinue) { exit 9 }"],
        check=False, capture_output=True,
    )
    if running.returncode:
        raise RuntimeError("Skyrim is running; refusing plugin replacement")
    plan = json.loads((ROOT / "prisma-update-plan.json").read_text(encoding="utf-8"))
    source = Path(plan["stage"]).resolve()
    target = Path(plan["target"]).resolve()
    expected = Path(r"E:\Nolvus\Instances\Nolvus Awakening\MODS\mods\Twisted - Prisma UI").resolve()
    if target != expected:
        raise RuntimeError("Unexpected destination")
    backup = ROOT / "backup-prisma-1.5.0"
    if (ROOT / "prisma-update-installed.json").exists():
        raise RuntimeError("Update receipt already exists")
    for item in plan["changes"]:
        rel = Path(item["relative"])
        if rel.is_absolute() or ".." in rel.parts:
            raise RuntimeError("Unsafe relative package path")
        src, dest = source / rel, target / rel
        if digest(src) != item["new_sha256"]:
            raise RuntimeError(f"Staged package changed: {rel}")
        actual_old = digest(dest) if dest.exists() else None
        if actual_old != item["old_sha256"]:
            raise RuntimeError(f"Installed file changed since inspection: {rel}")
        if dest.exists():
            saved = backup / rel
            saved.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(dest, saved)
            if digest(saved) != actual_old:
                raise RuntimeError(f"Backup verification failed: {rel}")
    applied = []
    try:
        for item in plan["changes"]:
            rel = Path(item["relative"])
            dest = target / rel
            temporary = dest.with_name(dest.name + ".prisma-update-tmp")
            if temporary.exists():
                raise RuntimeError(f"Unexpected temporary file: {temporary}")
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source / rel, temporary)
            if digest(temporary) != item["new_sha256"]:
                raise RuntimeError(f"Copy verification failed: {rel}")
            os.replace(temporary, dest)
            applied.append(item)
            if digest(dest) != item["new_sha256"]:
                raise RuntimeError(f"Installed verification failed: {rel}")
    except Exception:
        for item in reversed(applied):
            rel = Path(item["relative"])
            dest = target / rel
            if item["old_sha256"] is None:
                if dest.exists() and digest(dest) == item["new_sha256"]:
                    dest.unlink()
            else:
                shutil.copy2(backup / rel, dest)
        raise
    receipt = {
        "installed_at": datetime.datetime.now().isoformat(),
        "version": "1.5.1",
        "target": str(target), "backup": str(backup),
        "release": "https://github.com/PrismaUI-SKSE/framework/releases/tag/1.5.1",
        "archive_sha256": plan["archive_sha256"], "files": applied,
        "unchanged_package_files": plan["unchanged_files"],
        "profile_changed": False, "prompts_changed": False,
        "in_game_test": "pending user test after restart",
    }
    (ROOT / "prisma-update-installed.json").write_text(
        json.dumps(receipt, indent=2), encoding="utf-8")
    print(f"PrismaUI 1.5.1 installed and verified: {len(applied)} updated/new files")
    print(f"Backup: {backup}")


if __name__ == "__main__":
    main()
