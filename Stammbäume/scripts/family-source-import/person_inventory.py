"""Extract named genealogy cards; no identity or relationship inference."""
from pathlib import Path
import json
import re

script = Path(IMPORT_DIRECTORY)
config = json.loads((script / 'import.json').read_text('utf-8'))
root = script.parents[1]
inventory = json.loads((root / config['inventory']).read_text(encoding='utf-8'))
pattern = re.compile(r'^(.*?)\(\s*([0-9?]+)\s*[-–]\s*([0-9?]+)\s*\)?\s*([mw]?)(?:\s+.*)?$')
people = []
for source in inventory['sources']:
    mode = 'core'
    rows = {row['row']: row for row in source['rows']}
    for row in source['rows']:
        if row['row'] < (60 if source['slug'] == 'ferbend' else 80):
            continue
        heading = ' '.join(cell['text'] for cell in row['cells'])
        if 'Stammbaum' in heading:
            break
        if heading.strip() == 'Kinder':
            mode = 'core'
        if heading.strip() in ['Ehefrau/Ehemann', 'Ehemann/Ehefrau', 'Verlobte/Verlobter']:
            mode = 'partner'
        previous = rows.get(row['row'] - 1, {}).get('cells', [])
        # These templates compact the name row but leave spacer cells in the
        # portrait row. Preserve picture order rather than indexing td offsets.
        row_images = [image for cell in previous for image in cell['images']]
        card_index = 0
        for cell in row['cells']:
            ref = f"{source['slug']}:{row['row']}:{cell['column']}"
            card_text = config.get('cardTextCorrections', {}).get(ref, cell['text'])
            match = pattern.match(card_text)
            if not match:
                continue
            name, birth, death, sex = match.groups()
            images = row_images[card_index:card_index + 1]
            card_index += 1
            dead = '†' in name
            name = name.replace('†', '').replace('\u200b', '').strip()
            if not name.replace('?', '').strip() and ref not in ['cein:103:0', 'cein:103:1']:
                continue
            people.append({'ref': ref, 'slug': source['slug'], 'row': row['row'], 'column': cell['column'],
                           'name': name, 'birth': birth, 'death': death if dead or death != '????' else '',
                           'status': 'dead' if dead or death != '????' else 'alive', 'mode': mode,
                           'sex': {'m': 'male', 'w': 'female'}.get(sex, 'unknown'),
                           'image': images[0]['url'] if images else '', 'sourceText': cell['text']})
path = script / 'persons.json'
path.write_text(json.dumps(people, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('Extracted', len(people), 'source cards')
