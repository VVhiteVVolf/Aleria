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
(script / 'graphic-cards.json').write_text(json.dumps(cards(), ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
project = script.parent.parent
inventory_path = project / json.loads((script / 'import.json').read_text('utf-8'))['inventory']
inventory = json.loads(inventory_path.read_text('utf-8'))
transcription = script / 'graphic-cards.json'
inventory['graphicSources'] = [
    {
        'slug': slug,
        'kind': 'user-attached-genealogy-diagram',
        'originalDimensions': dimensions,
        'transcriptionPath': transcription.relative_to(project).as_posix(),
        'transcriptionSha256': sha256(transcription.read_bytes()).hexdigest(),
        'cards': sum(card['slug'] == slug for card in cards()),
        'note': 'Nutzergrafik manuell transkribiert; Originalbild nicht als lokale Datei verfügbar. Koordinaten bezeichnen Generation und Karte in der Transkription, keine HTML-Zeile.'
    }
    for slug, dimensions in [('stwatchn', [4096, 2430]), ('dundas', [4096, 2955])]
]
inventory_path.write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('Including the two graphic transcriptions:', len(people), 'cards')
