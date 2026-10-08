"""Choose existing canonical portraits before downloading supplied new assets."""
from pathlib import Path
import json
from source_config import family_id as source_family_id

script = Path(IMPORT_DIRECTORY)
root = script.parents[1]
config = json.loads((script / 'import.json').read_text('utf-8'))
data = json.loads((script / 'resolved.json').read_text(encoding='utf-8'))
placeholders = ('tumblr_otwjgn7mfU1wwqdobo1_1280.png', '7yB9PR6', '51CghpL')
assets = []
reuse = {}
missing = []
receipt_path = script / 'portrait-assets-receipt.json'
previous = {entry['personId']: entry for entry in json.loads(receipt_path.read_text('utf-8'))} if receipt_path.exists() else {}
for person in data['persons'].values():
    current = person['existingPortrait']
    if current and not current.startswith(('http:', 'https:')) and (root / current).is_file():
        reuse[person['id']] = current
        continue
    candidates = [url for url in person['imageCandidates'] if not any(placeholder in url for placeholder in placeholders)]
    if not candidates:
        missing.append(person['id'])
        continue
    url = candidates[0]
    slug = person['sourceRefs'][0].split(':')[0]
    # A shared incoming person is stored with the supplying family; all copies
    # import this one mapping and file, irrespective of its origin house.
    family_id = source_family_id(config, slug)
    folder = f'assets/images/portraits/{family_id}'
    ext = '.jpg' if url.lower().endswith(('.jpg', '.jpeg')) else '.png'
    verified = previous.get(person['id'], {})
    # Keep verified originals at their established path, including older child
    # archives. Age only chooses a fallback when no individual portrait exists.
    path = verified['path'] if verified.get('url') == url else f'{folder}/{person["id"]}{ext}'
    assets.append({'personId': person['id'], 'familyId': family_id, 'url': url,
                   'path': path,
                   'referenceOnly': False, 'sourceRefs': person['sourceRefs']})
(script / 'portrait-assets.json').write_text(json.dumps(assets, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
(script / 'portrait-reuse.json').write_text(json.dumps(reuse, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'downloads':len(assets), 'reused':len(reuse), 'unpictured':len(missing),
                  'childReferences':sum(a['referenceOnly'] for a in assets)}, ensure_ascii=False))
