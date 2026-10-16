from hashlib import sha256
import json
from pathlib import Path

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[2] / 'Stammbäume'
SOURCES = [
    ('fjordheim', 'b781fb5a-3980-4042-8f00-bb3326bdb027'),
    ('drachenzunge', '30c531c8-f154-497a-9b51-e9f55c61697b'),
    ('langstrand', 'ddb7ea83-d17d-4b94-8cdd-14bfeabd459f'),
    ('kragenkueste', '5ca40c4a-5009-4f96-94a2-96cdb4b685de'),
    ('tiefenfjord', 'eb7c5254-a87c-4de5-a8cb-a8f9b50a2ecf'),
    ('windtal', 'cd140601-08f8-4932-8b8b-f76812f5063c'),
]
CLANS = [[], ['draca', 'vingar', 'fjargardr'], ['hjort', 'helvandr', 'hronulf', 'voetnar'],
         ['ulfr', 'valdruna', 'ulvar', 'aexewindr'], ['geit', 'arngull'], ['orn', 'haming']]
inventory = {'date': '2026-10-07', 'scope': 'territorial-planning-only', 'sources': [], 'assets': []}
asset_jobs = []

for index, (slug, attachment_id) in enumerate(SOURCES):
    source = next((Path('C:/Users/fhg_r/.codex/attachments') / attachment_id).glob('*.txt'))
    raw = source.read_bytes()
    target = ROOT / f'assets/data/source-inventories/fjordheim-2026-10-07/{slug}.html'
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(raw)
    soup = BeautifulSoup(raw.decode('utf-8'), 'html.parser')
    rows = soup.select('tr')
    selected = range(76, 94) if index == 0 else range(67, 81)
    evidence = []
    for row_index in selected:
        cells = rows[row_index].find_all(['td', 'th'], recursive=False)
        evidence.append({'row': row_index, 'cells': [
            {'text': ' '.join(cell.get_text(' ', strip=True).split()),
             'images': [image.get('src') for image in cell.select('img')]}
            for cell in cells]})
    inventory['sources'].append({
        'id': slug, 'attachmentId': attachment_id, 'caption': soup.caption.get_text(' ', strip=True),
        'path': target.relative_to(ROOT).as_posix(), 'sha256': sha256(raw).hexdigest(), 'rows': evidence,
    })
    asset_jobs.append((soup.select_one('img')['src'], f'assets/images/regions/Fjordheim/{slug}.png'))
    if index:
        images = [rows[69].select_one('img')] + rows[73].select('img')[:len(CLANS[index]) - 1]
        asset_jobs.extend((image['src'], f'assets/images/houses/Fjordheim/clan-{clan}.png')
                          for image, clan in zip(images, CLANS[index]))

inventory['assets'] = [{'source': url, 'plannedPath': path, 'status': 'source-only'}
                       for url, path in asset_jobs]

target = ROOT / 'assets/data/source-inventories/fjordheim-2026-10-07.json'
target.write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'sources': len(inventory['sources']), 'assets': len(inventory['assets'])}))
