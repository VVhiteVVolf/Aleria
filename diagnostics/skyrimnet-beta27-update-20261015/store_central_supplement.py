"""Store the verified AI-only migration supplement without altering base backup pointers."""
import hashlib
import json
from pathlib import Path
import shutil

WORK = Path(__file__).resolve().parent
BASE = Path(r"D:\Nolvus-Backups\Awakening-6.0.20-vor-Update-20260930")
TARGET = BASE / "updates" / "20261015-SkyrimNet-Beta27"


def digest(path):
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def main():
    if not BASE.is_dir():
        raise RuntimeError("Existing central backup is missing")
    if TARGET.resolve().parent != (BASE / "updates").resolve():
        raise RuntimeError("Backup destination escaped the updates directory")
    receipt = json.loads((WORK / "migration-receipt.json").read_text(encoding="utf-8"))
    archive = Path(receipt["archive"])
    if receipt["status"] != "VERIFIED" or digest(archive) != receipt["sha256"]:
        raise RuntimeError("Source archive verification failed")
    TARGET.mkdir(parents=True, exist_ok=True)
    names = [archive.name, "migration-receipt.json", "installation.json", "ERGEBNIS.txt",
             "installed-validation.json", "installed-quest-attachments.json"]
    copied = []
    for name in names:
        source, destination = WORK / name, TARGET / name
        expected = digest(source)
        if destination.exists():
            if digest(destination) != expected:
                raise RuntimeError(f"Refusing to overwrite a different backup: {name}")
        else:
            shutil.copy2(source, destination)
        if digest(destination) != expected:
            raise RuntimeError(f"Copied file verification failed: {name}")
        copied.append({"name": name, "sha256": expected, "bytes": destination.stat().st_size})
    installation = json.loads((WORK / "installation.json").read_text(encoding="utf-8"))
    replacements = "\n".join(f"- {item['old']} -> {item['new']}" for item in installation["versions"])
    readme = f"""SkyrimNet Beta27 – ergänzende Sicherung vom 15.10.2026

Dieses Paket ergänzt die bestehende Nolvus-Sicherung und deren bisherige Updates.
Es ersetzt NICHT die vollständige Basis- oder Spielstandsicherung.

Enthalten: 13 vollständige aktuelle KI-Modordner, persönliche Prompts,
Inworld-Tags, Provider-/Modelleinstellungen, Stimmen, Erinnerungsdaten,
Wheel-Korrektur, Lever-Integration, PrismaUI und Profil-Referenzdateien.
Die Konfiguration enthält Zugangsdaten: dieses Archiv privat aufbewahren.
Spielstände sind in diesem Zusatzpaket nicht enthalten.

Wiederherstellung nach dem Basisbackup und den bisherigen Updates:
1. manifest.json im ZIP lesen; alle Archivdateien tragen SHA256-Prüfsummen.
2. Die Modordner unter instance/MODS/mods in das neue MO2 übernehmen.
3. Die unten genannten alten Versionen deaktivieren und die neuen an ihrer
   bisherigen relativen Priorität aktivieren. Navigator 2.2.0 deaktivieren;
   Navigator 2.2.1 verwenden.
4. Persönliche Runtime und lokale Kompatibilitätsmods müssen weiterhin gewinnen.
5. Die mitgesicherten Profildateien dienen als Referenz: die komplette alte
   Plugin-Ladereihenfolge NICHT blind über ein aktualisiertes Nolvus schreiben.
   Aktivierungen und Abhängigkeiten mit dessen neuer Basis abgleichen.
6. Anschließend Skyrim starten und Aktionen/Wheel/Stimmen im Spiel prüfen.

Versionswechsel:
{replacements}

Dateiprüfungen bestanden; noch kein Spielstart nach diesem Update getestet.
LATEST_BACKUP.json und die bestehende Restore-Kette wurden nicht verändert,
weil dieses Paket ausschließlich die KI-Erweiterungen ergänzt.
"""
    readme_path = TARGET / "README_AI_UPDATE.txt"
    if readme_path.exists() and readme_path.read_text(encoding="utf-8-sig") != readme:
        raise RuntimeError("Refusing to overwrite a different supplement README")
    readme_path.write_text(readme, encoding="utf-8-sig")
    result = {"status": "COMPLETE_VERIFIED", "scope": "AI_ONLY_SUPPLEMENT",
              "destination": str(TARGET), "archive_sha256": receipt["sha256"],
              "files": copied, "base_backup_pointers_unchanged": True,
              "game_tested": False}
    serialized = json.dumps(result, ensure_ascii=False, indent=2)
    complete = TARGET / "COMPLETE.json"
    if complete.exists() and complete.read_text(encoding="utf-8") != serialized:
        raise RuntimeError("Refusing to overwrite a different completion record")
    complete.write_text(serialized, encoding="utf-8")
    (WORK / "central-backup-receipt.json").write_text(serialized, encoding="utf-8")
    print(json.dumps({"status": result["status"], "destination": str(TARGET),
                      "archive_sha256": receipt["sha256"]}))


if __name__ == "__main__":
    main()
