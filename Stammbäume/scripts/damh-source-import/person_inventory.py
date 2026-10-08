"""Archive the graphic-only source without fabricating missing HTML tables."""
from pathlib import Path
from hashlib import sha256
import json
from graphic_transcription import cards

script = Path(__file__).resolve().parent
project = script.parents[1]
people = cards()
for name in ['persons.json', 'graphic-cards.json']:
    (script / name).write_text(json.dumps(people, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
transcription = script / 'graphic-cards.json'
sizes = [(4096,2878),(4096,3123),(4096,3049),(4096,2660),(4096,1689),(4096,3050),(2048,1605)]
slugs = list(dict.fromkeys(p['slug'] for p in people))
inventory = {
    'date':'2026-10-08', 'scope':'graphic-genealogies-house-biographies-and-existing-portraits', 'sources':[],
    'graphicSources': [{
        'slug':slug, 'imageIndex':index+1, 'kind':'user-attached-genealogy-diagram',
        'originalDimensions':sizes[index], 'transcriptionPath':transcription.relative_to(project).as_posix(),
        'transcriptionSha256':sha256(transcription.read_bytes()).hexdigest(),
        'cards':sum(p['slug']==slug for p in people),
        'note':'Originalgrafik in der Nutzernachricht, nicht als lokale Bilddatei verfügbar. Manuelle Transkription; Zeilen sind Transkriptionskoordinaten. Keine Porträts oder Kriegerabbildungen beigefügt. Korrekturen und unsichere Lesarten sind getrennt dokumentiert.'
    } for index,slug in enumerate(slugs)]
}
config = json.loads((script / 'import.json').read_text('utf-8'))
(project / config['inventory']).write_text(json.dumps(inventory, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print(f'Archived {len(people)} cards from {len(slugs)} diagrams')
