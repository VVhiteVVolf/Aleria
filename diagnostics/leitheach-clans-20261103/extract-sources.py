"""Archive and extract only narrative sections of the explicit 28-source scope."""
import hashlib
import json
import re
from pathlib import Path
from bs4 import BeautifulSoup

BASE = Path(__file__).resolve().parent
ROOT = BASE.parents[1]
KEYS = ('overview', 'history', 'traditions', 'knighthood', 'holdings', 'cultureReligion', 'conflictsAlliances', 'values')
mapping = json.loads((BASE / 'attachment-mapping.json').read_text(encoding='utf-8-sig'))['rows']
baseline = {r['id']: r for r in json.loads((BASE / 'baseline.json').read_text(encoding='utf-8-sig'))}


def section_key(label):
    label = re.sub(r'\s+', '', label).lower()
    for part, key in [('bersicht', 'overview'), ('geschichte', 'history'), ('tradition', 'traditions'),
                      ('tiarnatum', 'knighthood'), ('ritter', 'knighthood'), ('kriegskunst', 'knighthood'),
                      ('besitz', 'holdings'), ('kultur', 'cultureReligion'), ('religion', 'cultureReligion'),
                      ('konflikt', 'conflictsAlliances'), ('allianz', 'conflictsAlliances'),
                      ('werte', 'values'), ('trivia', 'trivia')]:
        if part in label: return key
    return None


houses = []
for row in mapping:
    source = Path(row['sourcePath'])
    raw = source.read_bytes()
    assert len(raw) == row['sourceBytes'] and hashlib.sha256(raw).hexdigest() == row['sourceSha256']
    directory = BASE / 'sources' / row['sourceSlug']
    directory.mkdir(parents=True, exist_ok=True)
    archive = directory / 'animexx-original.html'
    assert not archive.exists() or archive.read_bytes() == raw
    archive.write_bytes(raw)
    soup = BeautifulSoup(raw.decode('utf-8-sig'), 'html.parser')
    sections = {key: [] for key in (*KEYS, 'trivia')}
    state, anchor = None, None
    labels, excluded = [], []
    for node in soup.find_all(['p', 'li', 'h1', 'h2', 'h3']):
        if node.name == 'li' and node.find('p'): continue
        text = re.sub(r'\s+', ' ', node.get_text(' ', strip=True)).strip()
        text = re.sub(r'\s+([,.;:!?])', r'\1', text)
        match = re.match(r'^\d+\s*\.?\s*\)\s*(.+)$', text)
        if match:
            label = match.group(1)
            state, anchor = section_key(label), node.find_parent('td')
            labels.append(label)
            if state is None: excluded.append(label)
            continue
        if not state or node.find_parent('td') is not anchor: continue
        if not text or re.fullmatch(r'[.\s?…–—-]+', text): continue
        if 'weitere wichtige Tradition ist' in text and '...' in text: continue
        if text not in sections[state]: sections[state].append(text)
    r = baseline[row['canonicalId']]
    canonical = {key: r[key] for key in ('id', 'title', 'folderPath', 'description', 'motto', 'sourceRevision', 'status')}
    canonical.update(houseProfile=r['profile'], historicalClassification=False, historicalEra='active',
                     sourceFiles=['Stammbäume/assets/js/data/leitheach-house-profiles.js',
                                  'Stammbäume/assets/js/data/leitheach-house-families.js',
                                  'Kontinente/modules/leitheach/pages.source.json'])
    house = {'slug': row['sourceSlug'], 'id': row['canonicalId'],
             'source': {'attachmentId': row['attachmentId'], 'originalAttachment': str(source),
                        'archive': archive.relative_to(ROOT).as_posix(), 'bytes': len(raw),
                        'sha256': hashlib.sha256(raw).hexdigest(), 'byteIdentical': True},
             'sourceCaption': row['sourceHeading'], 'sourceHeadings': labels, 'sections': sections,
             'excludedGenealogyOrOldCourtSections': excluded, 'canonical': canonical,
             'existingBiographyPresent': bool(r['biography']),
             'reviewedSections': {key: '\n\n'.join(sections[key]) for key in KEYS},
             'reviewedHierarchy': '', 'reviewedTrivia': [], 'safeCanonicalSummary': '', 'decisions': [],
             'reviewStatus': 'pending'}
    houses.append(house)
    lines = [house['id'], json.dumps(canonical, ensure_ascii=False)]
    for key, values in sections.items(): lines.extend(['\n## ' + key, *values])
    (BASE / ('check-' + row['sourceSlug'] + '.txt')).write_text('\n\n'.join(lines), encoding='utf-8')
    print(house['id'], {k: len(' '.join(v).split()) for k, v in sections.items()})
document = {'schema': 'aleria.leitheach-source-content', 'version': 1, 'reviewedAt': '2026-11-03',
            'status': 'pending-editorial-review',
            'rules': {'scope': '28 explicit public attachments and corresponding public canonical records only',
                      'genealogy': 'excluded entirely; original archive retained unchanged',
                      'oldCourtTables': 'excluded entirely', 'militaryStatistics': 'excluded',
                      'territory': 'Leitheach is distinct from Aldrimar and the fallen principality Ceitheach',
                      'productionChanges': False}, 'houses': houses}
(BASE / 'source-content.json').write_text(json.dumps(document, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
