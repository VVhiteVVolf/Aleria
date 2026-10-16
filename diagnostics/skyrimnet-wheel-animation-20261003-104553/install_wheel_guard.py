"""Install only the compiled Wheel candidate into the existing active overlay."""
from pathlib import Path
import ctypes
from ctypes import wintypes
import datetime
import hashlib
import json
import shutil

ROOT = Path(__file__).resolve().parent
BASE = Path(r"E:\Nolvus\Instances\Nolvus Awakening\MODS")
PROFILE = BASE / "profiles/Nolvus Awakening - SkyrimNet Beta25 Test/modlist.txt"
TARGET = BASE / "mods/SkyrimNet - Beta 25 Local Compatibility"
FILES = ["Scripts/skynet_WheelMenu.pex", "Source/Scripts/skynet_WheelMenu.psc"]


class ProcessEntry(ctypes.Structure):
    _fields_ = [("dwSize", wintypes.DWORD), ("cntUsage", wintypes.DWORD),
                ("th32ProcessID", wintypes.DWORD), ("th32DefaultHeapID", ctypes.c_size_t),
                ("th32ModuleID", wintypes.DWORD), ("cntThreads", wintypes.DWORD),
                ("th32ParentProcessID", wintypes.DWORD), ("pcPriClassBase", wintypes.LONG),
                ("dwFlags", wintypes.DWORD), ("szExeFile", wintypes.WCHAR * 260)]


def skyrim_running():
    kernel = ctypes.WinDLL("kernel32", use_last_error=True)
    kernel.CreateToolhelp32Snapshot.restype = wintypes.HANDLE
    kernel.Process32FirstW.argtypes = [wintypes.HANDLE, ctypes.POINTER(ProcessEntry)]
    kernel.Process32NextW.argtypes = [wintypes.HANDLE, ctypes.POINTER(ProcessEntry)]
    kernel.CloseHandle.argtypes = [wintypes.HANDLE]
    handle = kernel.CreateToolhelp32Snapshot(2, 0)
    if handle == ctypes.c_void_p(-1).value:
        raise ctypes.WinError(ctypes.get_last_error())
    entry = ProcessEntry()
    entry.dwSize = ctypes.sizeof(entry)
    try:
        ok = kernel.Process32FirstW(handle, ctypes.byref(entry))
        while ok:
            if entry.szExeFile.lower() == "skyrimse.exe":
                return True
            ok = kernel.Process32NextW(handle, ctypes.byref(entry))
        return False
    finally:
        kernel.CloseHandle(handle)


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    if skyrim_running():
        raise SystemExit("Skyrim is still running; installation deferred.")
    lines = PROFILE.read_text(encoding="utf-8-sig").splitlines()
    active = [BASE / "overwrite"] + [BASE / "mods" / line[1:] for line in lines if line.startswith("+")]
    if TARGET not in active or not TARGET.is_dir():
        raise ValueError("Expected compatibility overlay is not active")
    manifest = json.loads((ROOT / "candidate-manifest.json").read_text(encoding="utf-8"))
    if sha256(ROOT / "candidate" / FILES[0]) != manifest["candidate_pex_sha256"]:
        raise ValueError("Compiled candidate hash mismatch")
    if (ROOT / "installation.json").exists():
        raise ValueError("Installation already recorded; refusing to overwrite its backup")
    records = []
    for rel in FILES:
        winner = next((mod / rel for mod in active if (mod / rel).is_file()), None)
        if winner is None:
            raise ValueError(f"Missing upstream file: {rel}")
        if active.index(TARGET) > active.index(winner.parents[1] if rel.startswith('Scripts/') else winner.parents[2]):
            raise ValueError(f"Compatibility overlay does not win: {rel}")
        if winner != BASE / "mods/SkyrimNet - Beta 25.1 Hotfix" / rel:
            raise ValueError(f"Upstream winner changed: {winner}")
        backup = ROOT / "backup/upstream" / rel
        backup.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(winner, backup)
        destination = TARGET / rel
        records.append({"relative_path": rel, "previous_winner": str(winner),
                        "previous_sha256": sha256(winner), "target": str(destination),
                        "target_previously_existed": destination.exists(),
                        "candidate_sha256": sha256(ROOT / "candidate" / rel)})
        if destination.exists():
            local_backup = ROOT / "backup/overlay" / rel
            local_backup.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(destination, local_backup)
    # All authorization-independent checks and backups finish before any mod mutation.
    for record in records:
        rel = record["relative_path"]
        destination = Path(record["target"])
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(ROOT / "candidate" / rel, destination)
        if sha256(destination) != record["candidate_sha256"]:
            raise ValueError(f"Readback failed: {destination}")
        winner = next(mod / rel for mod in active if (mod / rel).is_file())
        if winner != destination:
            raise ValueError(f"Installed file does not win: {rel}")
    output = {"status": "INSTALLED_AWAITING_IN_GAME_TEST", "installed_at": datetime.datetime.now().isoformat(),
              "profile": PROFILE.parent.name, "files": records,
              "profile_files_modified": False, "prompts_modified": False,
              "restore": "Remove only the two installed overlay files if target_previously_existed=false; otherwise restore backup/overlay."}
    (ROOT / "installation.json").write_text(json.dumps(output, indent=2), encoding="utf-8")
    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
