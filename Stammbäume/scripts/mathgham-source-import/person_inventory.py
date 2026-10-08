from pathlib import Path
import runpy
script = Path(__file__).resolve().parent
runpy.run_path(str(script.parent / 'family-source-import' / Path(__file__).name), init_globals={'IMPORT_DIRECTORY': script})
import json
from hashlib import sha256
from graphic_transcription import cards
path = script / 'persons.json'
people = json.loads(path.read_text('utf-8')) + cards()
path.write_text(json.dumps(people, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
transcription = script / 'graphic-cards.json'
transcription.write_text(json.dumps(cards(), ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
project = script.parent.parent
inventory_path = project / json.loads((script / 'import.json').read_text('utf-8'))['inventory']
inventory = json.loads(inventory_path.read_text('utf-8'))
inventory['graphicSources'] = [{
    'slug': 'banlaoch', 'kind': 'user-attached-genealogy-diagram', 'originalDimensions': [4096, 3335],
    'transcriptionPath': transcription.relative_to(project).as_posix(),
    'transcriptionSha256': sha256(transcription.read_bytes()).hexdigest(), 'cards': len(cards()),
    'note': 'Undatierte Nutzergrafik manuell transkribiert; Originalbild nicht als lokale Datei verfügbar. Koordinaten sind Transkriptionszeilen. Ergänzte Jahre stehen getrennt in chronology.json. Forsyth bleibt nach Nutzerbestätigung offen; die zweite Grafik war nochmals Stwatchn.'
}]
inventory_path.write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('Including Banlaoch:', len(people), 'cards')
