from pathlib import Path
from bs4 import BeautifulSoup
import hashlib
import json
import re
import sys

BASE = Path(__file__).resolve().parent
SOURCES = [
    ('pysgod', 'haus-pysgod', 'c369a4e3-4d12-4024-b4c1-00c452e0ce41'),
    ('blaidd', 'haus-blaidd-tredegar', '8022dfb2-2fa4-414e-962f-9750cf0327d7'),
    ('brithyll', 'haus-brithyll', 'b0a5725d-8ba8-4bc4-8246-c2148cb4dbaf'),
    ('gwialen', 'haus-gwialen', '30c27015-c2ea-4c0e-b358-53a66318c43f'),
    ('illygoden', 'haus-illygoden-tredegar', '1bfe2d27-d6fb-424f-8db1-4d60499d8862'),
    ('gwaedlyd', 'haus-gwaedlyd-tredegar', 'fce23593-f26f-401a-ac39-8962e1184cfb'),
    ('coedwig', 'haus-coedwig', '55934959-b162-4711-bf3d-e4e0a2727bee'),
]
IGNORED = re.compile(r'Hierar?chie|Hierachie|Stammbaum|^Familie$|\bHof\b|Kadettenh', re.I)
HEADING = re.compile(r'^\d+\.\)\s*(.+)$')
context = {r['id']: r for r in json.loads((BASE / 'canonical-context.json').read_text(encoding='utf-8'))}
rows = []

for slug, family_id, attachment_id in SOURCES:
    source = next((Path('C:/Users/fhg_r/.codex/attachments') / attachment_id).glob('*.txt'))
    raw = source.read_bytes()
    soup = BeautifulSoup(raw.decode('utf-8-sig'), 'html.parser')
    sections, images, links = [], [], []
    current = {'title': 'Hauskopf', 'paragraphs': []}
    sections.append(current)
    ignored_images = 0
    for tag in soup.find_all(['p', 'img', 'a']):
        if tag.name == 'p':
            text = re.sub(r'\s+', ' ', tag.get_text(' ', strip=True)).strip()
            match = HEADING.match(text)
            if match and len(text) < 120:
                current = {'title': match.group(1), 'paragraphs': []}
                sections.append(current)
            elif text and not IGNORED.search(current['title']):
                current['paragraphs'].append(text)
        elif tag.name == 'img':
            if IGNORED.search(current['title']):
                ignored_images += 1
                continue
            url = tag.get('src', '')
            parent_link = tag.find_parent('a')
            images.append({
                'index': len(images), 'section': current['title'], 'url': url,
                'linkedUrl': parent_link.get('href') if parent_link else None,
                'alt': tag.get('alt', ''), 'style': tag.get('style', ''),
                'placeholder': bool(re.search(r'tumblr_otwjgn|silhouette|placeholder', url, re.I)),
            })
        elif tag.get('href') and not IGNORED.search(current['title']):
            links.append({'section': current['title'], 'url': tag['href'], 'text': tag.get_text(' ', strip=True), 'containsImage': bool(tag.find('img'))})
    row = {
        'id': family_id, 'slug': slug, 'attachmentId': attachment_id,
        'attachmentFile': str(source), 'sourceSha256': hashlib.sha256(raw).hexdigest(),
        'sourceTitle': soup.caption.get_text(' ', strip=True) if soup.caption else None,
        'canonical': context[family_id],
        'policy': 'Current canonical rank, seat, branch ID and structure outrank copied tables. Source genealogy, hierarchy, court and cadet-house sections are excluded. Military statistics are excluded. Qualitative equipment passages require editorial review.',
        'excludedSections': [s['title'] for s in sections if IGNORED.search(s['title'])],
        'ignoredImagesInExcludedSections': ignored_images,
        'narrativeSections': [s for s in sections if not IGNORED.search(s['title'])],
        'images': images, 'links': links,
    }
    rows.append(row)

(BASE / 'source-analysis.json').write_text(json.dumps(rows, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
sys.stdout.reconfigure(encoding='utf-8')
for row in rows:
    print(json.dumps({'id': row['id'], 'sections': [s['title'] for s in row['narrativeSections']], 'nonPlaceholderImages': [i for i in row['images'] if not i['placeholder']], 'placeholders': sum(i['placeholder'] for i in row['images']), 'links': row['links']}, ensure_ascii=False))
