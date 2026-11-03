from pathlib import Path
from bs4 import BeautifulSoup
import hashlib
import json
import re
import sys

BASE = Path(__file__).resolve().parent
SOURCES = [
    ('wylan', 'da30d4ac-18ac-470e-855f-26816205a90c'),
    ('dinefwr', '82031dc3-32a9-499b-9c57-5363a1477329'),
    ('mochdaer', 'f8f14a3f-e95d-42f4-b979-1856437a626e'),
    ('tir-addawol', '575ad120-8ac2-4d14-9912-bcbe5429716f'),
    ('hwyaden', 'ee69fea8-3387-4a24-979f-3de6db4905e6'),
]
IGNORED = re.compile(r'Hierarchie|Stammbaum|\bHof\b|Kadettenh', re.I)
HEADING = re.compile(r'^\d+\.\)\s*(.+)$')
context = {r['id']: r for r in json.loads((BASE / 'canonical-context.json').read_text(encoding='utf-8'))}
rows = []

for slug, attachment_id in SOURCES:
    source = Path('C:/Users/fhg_r/.codex/attachments') / attachment_id / 'Eingefügter Text.txt'
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
            placeholder = bool(re.search(r'tumblr_otwjgn|silhouette|placeholder', url, re.I))
            images.append({
                'index': len(images), 'section': current['title'], 'url': url,
                'linkedUrl': parent_link.get('href') if parent_link else None,
                'alt': tag.get('alt', ''), 'style': tag.get('style', ''),
                'placeholder': placeholder,
            })
        elif tag.get('href') and not IGNORED.search(current['title']):
            links.append({'section': current['title'], 'url': tag['href'], 'text': tag.get_text(' ', strip=True), 'containsImage': bool(tag.find('img'))})
    excluded = [s['title'] for s in sections if IGNORED.search(s['title'])]
    sections = [s for s in sections if not IGNORED.search(s['title'])]
    row = {
        'id': 'haus-' + slug, 'slug': slug, 'attachmentId': attachment_id,
        'attachmentFile': str(source), 'sourceSha256': hashlib.sha256(raw).hexdigest(),
        'sourceTitle': soup.caption.get_text(' ', strip=True) if soup.caption else None,
        'canonical': context.get('haus-' + slug),
        'policy': 'Current canonical rank, seat and structure outrank copied tables. All source genealogy, hierarchy, court and cadet-house sections are excluded. Military statistics are excluded; qualitative equipment passages require editorial review.',
        'excludedSections': excluded, 'ignoredImagesInExcludedSections': ignored_images,
        'narrativeSections': sections, 'images': images, 'links': links,
    }
    rows.append(row)

(BASE / 'source-analysis.json').write_text(json.dumps(rows, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
sys.stdout.reconfigure(encoding='utf-8')
for row in rows:
    print(json.dumps({'id': row['id'], 'sections': [s['title'] for s in row['narrativeSections']], 'images': row['images'], 'links': row['links']}, ensure_ascii=False))
