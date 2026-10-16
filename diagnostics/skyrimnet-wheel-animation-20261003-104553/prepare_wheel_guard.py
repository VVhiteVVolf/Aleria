"""Build a reversible, script-only SkyrimNet Wheel compatibility candidate."""
from pathlib import Path
import concurrent.futures
import hashlib
import json
import shutil
import subprocess
import urllib.request

ROOT = Path(__file__).resolve().parent
MODS = Path(r"E:\Nolvus\Instances\Nolvus Awakening\MODS\mods")
UPSTREAM = MODS / "SkyrimNet - Beta 25.1 Hotfix"
TAG = "vbeta25.1-rc2"


def fetch_header(entry):
    target = ROOT / "headers" / Path(entry["path"]).name
    if not target.exists():
        request = urllib.request.Request(
            f"https://raw.githubusercontent.com/MinLL/SkyrimNet-GamePlugin/{TAG}/{entry['path']}",
            headers={"User-Agent": "SkyrimNet-local-diagnostics"},
        )
        with urllib.request.urlopen(request, timeout=30) as response:
            data = response.read()
        blob_hash = hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest()
        if blob_hash != entry["sha"]:
            raise ValueError(f"Header integrity mismatch: {target.name}")
        target.write_bytes(data)
    return target.name


def main():
    headers = ROOT / "headers"
    headers.mkdir(exist_ok=True)
    tree = json.loads((ROOT / "header-tree.json").read_text(encoding="utf-8"))
    entries = [e for e in tree if e["path"].startswith("headers/") and e["path"].endswith((".psc", ".flg"))]
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        list(pool.map(fetch_header, entries))
    # SKSE supplies the native Input API used by the key-release guard.
    shutil.copy2(MODS / "Skyrim Script Extender/Scripts/Source/Input.psc", headers / "Input.psc")

    package = ROOT / "candidate"
    source_dir = package / "Source" / "Scripts"
    output_dir = package / "Scripts"
    source_dir.mkdir(parents=True, exist_ok=True)
    output_dir.mkdir(exist_ok=True)
    original = (UPSTREAM / "Source/Scripts/skynet_WheelMenu.psc").read_text(encoding="utf-8-sig")
    before = """Event OnEffectStart(Actor akTarget, Actor akCaster)
\t
    skynet_WheelMenu.DisplayWheel()

EndEvent"""
    after = """Event OnEffectStart(Actor akTarget, Actor akCaster)
    ; Local compatibility guard: do not pause a still-running power/shout.
    ; The direct SkyrimNet wheel hotkey continues to call DisplayWheel normally.
    if akTarget != Game.GetPlayer() || !akCaster
        return
    endif

    Utility.Wait(0.25)
    int shoutKey = Input.GetMappedKey("Shout")
    int pendingTicks = 0
    while akCaster.GetAnimationVariableBool("IsShouting") || (shoutKey >= 0 && Input.IsKeyPressed(shoutKey))
        if pendingTicks >= 30
            Debug.Trace("[SkyrimNet Wheel Guard] Power still active; wheel opening cancelled")
            Debug.Notification("SkyrimNet: Release the power key, then open the wheel again.")
            return
        endif
        Utility.WaitMenuMode(0.1)
        pendingTicks += 1
    endwhile

    if akCaster.IsDead() || Utility.IsInMenuMode()
        return
    endif
    Debug.Trace("[SkyrimNet Wheel Guard] Power completed; opening wheel")
    skynet_WheelMenu.DisplayWheel()
EndEvent"""
    if original.count(before) != 1:
        raise ValueError("Upstream effect entry point changed; refusing automatic replacement")
    patched = original.replace(before, after)
    handoff_before = """        SkyrimNetApi.TriggerTextInput()"""
    handoff_after = """        ; Release UIExtensions before PrismaUI acquires its own input focus.
        if skynet_WheelMenu.WaitForWheelClose()
            SkyrimNetApi.TriggerTextInput()
        endif"""
    if patched.count(handoff_before) != 1:
        raise ValueError("Text-input entry point changed")
    patched = patched.replace(handoff_before, handoff_after)
    patched += """

; Bounded handoff: no control toggles or animation-variable resets.
bool Function WaitForWheelClose() global
    int pendingTicks = 0
    while UI.IsMenuOpen("CustomMenu")
        if pendingTicks >= 20
            Debug.Trace("[SkyrimNet Wheel Guard] UIExtensions still open; chat handoff cancelled")
            return false
        endif
        Utility.WaitMenuMode(0.1)
        pendingTicks += 1
    endwhile
    Utility.WaitMenuMode(0.15)
    return true
EndFunction
"""
    source = source_dir / "skynet_WheelMenu.psc"
    source.write_text(patched, encoding="utf-8-sig")
    (ROOT / "upstream-skynet_WheelMenu.psc").write_text(original, encoding="utf-8-sig")
    compiler = MODS / "Nemesis Unlimited Behavior Engine/Nemesis_Engine/Papyrus Compiler/PapyrusCompiler.exe"
    flags = MODS / "Nemesis Unlimited Behavior Engine/Nemesis_Engine/Papyrus Compiler/scripts/TESV_Papyrus_Flags.flg"
    args = [str(compiler), str(source), f"-i={source_dir};{UPSTREAM / 'Source/Scripts'};{headers}", f"-o={output_dir}", f"-f={flags}"]
    result = subprocess.run(args, capture_output=True, text=True, errors="replace", cwd=ROOT)
    (ROOT / "compile.log").write_text(result.stdout + result.stderr, encoding="utf-8")
    print(result.stdout + result.stderr)
    if result.returncode != 0:
        raise SystemExit(result.returncode)
    pex = output_dir / "skynet_WheelMenu.pex"
    if not pex.exists() or pex.read_bytes()[:4] != b"\xfa\x57\xc0\xde":
        raise ValueError("Compiled PEX missing or invalid")
    manifest = {
        "status": "COMPILED_CANDIDATE_NOT_GAME_TESTED",
        "upstream_tag": TAG,
        "upstream_source_sha256": hashlib.sha256(original.encode("utf-8")).hexdigest(),
        "candidate_pex_sha256": hashlib.sha256(pex.read_bytes()).hexdigest(),
        "scope": ["wait for power key release and IsShouting=false", "bounded UIExtensions-to-PrismaUI chat handoff"],
    }
    (ROOT / "candidate-manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print("Compiled candidate:", pex)


if __name__ == "__main__":
    main()
