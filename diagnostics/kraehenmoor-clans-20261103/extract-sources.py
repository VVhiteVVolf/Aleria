"""Bounded diagnostic source archive/extraction; no production imports or writes."""
import hashlib
import json
import re
from pathlib import Path

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[2]
DEST = Path(__file__).resolve().parent
KEYS = ('overview', 'history', 'traditions', 'knighthood', 'holdings',
        'cultureReligion', 'conflictsAlliances', 'values')
ALIASES = {'jarnblod': 'jaernblod', 'morfhia': 'mac-morfhia', 'corcaigh': 'mac-corcaigh'}


def clean(text):
    text = re.sub(r'\s+', ' ', text).strip()
    return re.sub(r'\s+([,.;:!?])', r'\1', text)


def heading_key(text):
    normalized = re.sub(r'\s+', '', text).lower()
    if 'bersicht' in normalized: return 'overview'
    if 'geschichte' in normalized: return 'history'
    if 'tradition' in normalized: return 'traditions'
    if any(w in normalized for w in ('huskar', 'ritter', 'kriegskunst', 'tiarnatum')): return 'knighthood'
    if 'besitz' in normalized: return 'holdings'
    if 'kultur' in normalized or 'religion' in normalized: return 'cultureReligion'
    if 'konflikt' in normalized or 'allianz' in normalized: return 'conflictsAlliances'
    if 'werte' in normalized: return 'values'
    if 'trivia' in normalized: return 'trivia'
    return None


baseline = json.loads((DEST / 'baseline.json').read_text(encoding='utf-8-sig'))
houses = []
for slug, aid in json.loads((DEST / 'attachments.json').read_text(encoding='utf-8-sig')):
    source = next((Path('C:/Users/fhg_r/.codex/attachments') / aid).glob('*.txt'))
    raw = source.read_bytes()
    directory = DEST / 'sources' / slug
    directory.mkdir(parents=True, exist_ok=True)
    archive = directory / 'animexx-original.html'
    if archive.exists() and archive.read_bytes() != raw:
        raise RuntimeError(f'Archive differs: {slug}')
    archive.write_bytes(raw)
    soup = BeautifulSoup(raw.decode('utf-8-sig'), 'html.parser')
    sections = {key: [] for key in (*KEYS, 'trivia')}
    excluded = []
    headings = []
    state = None
    anchor = None
    for node in soup.find_all(['p', 'li']):
        if node.name == 'li' and node.find('p'): continue
        text = clean(node.get_text(' ', strip=True))
        match = re.match(r'^\d+\s*\.\s*\)\s*(.+)$', text)
        parents = node.find_parents('table')
        table = parents[-1] if parents else None
        if match:
            label = match.group(1)
            headings.append(label)
            state = heading_key(label)
            anchor = table
            if state is None: excluded.append(label)
            continue
        if not state or (table is not anchor): continue
        if not text or re.fullmatch(r'[.\s?…–—-]+', text): continue
        if 'weitere wichtige Tradition ist' in text and '...' in text: continue
        if text not in sections[state]: sections[state].append(text)
    house_id = 'haus-' + ALIASES.get(slug, slug)
    record = next(row for row in baseline if row['id'] == house_id)
    canonical = {key: record[key] for key in ('id', 'title', 'folderPath', 'description', 'motto', 'sourceRevision')}
    canonical['houseProfile'] = record['profile']
    canonical['status'] = record['status']
    canonical['historicalEra'] = ('active' if record['status'] == 'active' else
                                  'recently-extinct' if slug in ('hjerte', 'jarnblod') else 'ancient')
    canonical['sourceFiles'] = ['Stammbäume/assets/js/data/kraehenmoor-house-profiles.js',
                                'Stammbäume/assets/js/data/kraehenmoor-house-families.js',
                                'diagnostics/kraehenmoor-clans-20261103/baseline.json']
    houses.append({'slug': slug, 'id': house_id,
                   'source': {'attachmentId': aid, 'originalAttachment': str(source),
                              'archive': archive.relative_to(ROOT).as_posix(), 'bytes': len(raw),
                              'sha256': hashlib.sha256(raw).hexdigest(), 'byteIdentical': True},
                   'sourceHeadings': headings,
                   'sections': sections,
                   'excludedGenealogyOrOldCourtSections': excluded,
                   'canonical': canonical,
                   'reviewedSections': {key: '\n\n'.join(sections[key]) for key in KEYS},
                   'reviewedTrivia': [], 'reviewedHierarchy': '',
                   'safeCanonicalSummary': '', 'decisions': [], 'reviewStatus': 'pending'})
document = {'schema': 'aleria.kraehenmoor-source-content', 'version': 1,
            'reviewedAt': '2026-11-03', 'status': 'pending-editorial-review',
            'rules': {'scope': '14 supplied public attachments and corresponding public canonical records only',
                      'genealogy': 'excluded entirely; original archive retained unchanged',
                      'oldTables': 'excluded', 'militaryStatistics': 'excluded from reviewed text',
                      'productionChanges': False}, 'houses': houses}
(DEST / 'source-content.json').write_text(json.dumps(document, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
for house in houses:
    lines = [house['id'], json.dumps(house['canonical'], ensure_ascii=False)]
    for key, values in house['sections'].items():
        lines.append('\n## ' + key)
        lines.extend(values)
    (DEST / ('check-' + house['slug'] + '.txt')).write_text('\n\n'.join(lines), encoding='utf-8')
    print(house['id'], {k: len(' '.join(v).split()) for k, v in house['sections'].items()})
