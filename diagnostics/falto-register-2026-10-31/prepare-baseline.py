"""Read-only test comparison with this task's three family edits omitted."""
from pathlib import Path
import json
import subprocess

ROOT = Path(__file__).resolve().parents[2]
family_root = ROOT / 'Stammb\u00e4ume/assets/js/data'
sources = {}
for name in ['falto-family.js', 'twyllod-family.js']:
    path = family_root / 'gwynthor-erbstreit' / name
    sources[path.as_uri()] = subprocess.check_output(['git', 'show', 'HEAD:' + path.relative_to(ROOT).as_posix()], cwd=ROOT).decode('utf-8')
path = family_root / 'house-penrudd-family.js'
source = path.read_text(encoding='utf-8')
source = source.replace("const folderPath = ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'];\n", '')
source = source.replace("    folderPath,\n    { folderPath, rankId:", "    ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Bannkreis Gwynthor'],\n    { rankId:")
source = source.replace('sourceRevision: 7, registryManagedEntitySourceRevision:', 'sourceRevision: 6, registryManagedEntitySourceRevision:')
for line in ["    registryManagedHouseProfileFields: ['seat', 'folderPath'],\n", "    registryManagedHouseProfileFieldRevisions: { seat: 7, folderPath: 7 },\n", "    registryManagedRecordFields: ['folderPath'],\n"]:
    source = source.replace(line, '')
sources[path.as_uri()] = source
(Path(__file__).parent / 'baseline-sources.json').write_text(json.dumps(sources), encoding='utf-8')
