"""One-time structural import. Original HTML stays byte-for-byte in sources/.

Run from any directory. BeautifulSoup is required only for re-import, not for builds.
Layout tables are unwrapped; content tables, paragraphs and lists retain their order.
No HTML, event dates, names or prose are invented by this importer.
"""
from pathlib import Path
from bs4 import BeautifulSoup, NavigableString, Tag
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parents[1]
SOURCES = ROOT / 'Kriege/krieg-der-praetendenten/sources'
OUTPUT = ROOT / 'modules/praetendenten/praetendenten-sources.json'
BLOCK_TAGS = {'p', 'table', 'ul', 'ol', 'li', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr'}


def clean(text):
    return re.sub(r'\s+', ' ', text.replace('\u200b', '').replace('\ufeff', '')).strip()


def text_of(node):
    return clean(node.get_text(' ', strip=True))


def blocks_in(parent):
    result, inline = [], []

    def flush():
        text = clean(' '.join(inline))
        if text:
            result.append({'type': 'paragraph', 'text': text})
        inline.clear()

    for child in parent.children:
        if isinstance(child, NavigableString):
            inline.append(str(child))
            continue
        if not isinstance(child, Tag) or child.name in {'script', 'style', 'img', 'hr'}:
            continue
        if child.name not in BLOCK_TAGS and not child.find(list(BLOCK_TAGS)):
            inline.append(text_of(child))
            continue
        flush()
        if child.name == 'table' and not child.find('table'):
            rows = []
            for row in child.select('tr'):
                cells = [{'text': text_of(cell), 'colspan': int(cell.get('colspan', 1)), 'rowspan': int(cell.get('rowspan', 1))}
                         for cell in row.find_all(['td', 'th'], recursive=False)]
                if any(cell['text'] for cell in cells):
                    rows.append(cells)
            if rows:
                result.append({'type': 'table', 'rows': rows})
        elif child.name in {'p', 'li'} or re.fullmatch(r'h[1-6]', child.name):
            text = text_of(child)
            if text:
                heading = child.name.startswith('h') or (len(text) < 90 and bool(re.match(r'^\d\)', text)))
                result.append({'type': 'heading' if heading else 'paragraph', 'text': text})
        else:
            result.extend(blocks_in(child))
    flush()
    return result


def main():
    manifest = json.loads((SOURCES / 'manifest.json').read_text(encoding='utf-8'))
    documents, hashes = [], {}
    for source in manifest['sources']:
        raw = (SOURCES / source['file']).read_bytes()
        digest = hashlib.sha256(raw).hexdigest()
        if digest != source['sha256']:
            raise ValueError(f"Original changed: {source['file']}")
        soup = BeautifulSoup(raw.decode('utf-8-sig'), 'html.parser')
        blocks = blocks_in(soup)
        title = next((block['text'] for block in blocks if 'text' in block), source['opening'])
        # Verify that the structural walk loses no textual content at all.
        input_text = re.sub(r'\s+', '', text_of(soup))
        output_text = re.sub(r'\s+', '', ''.join(block.get('text', '') if block['type'] != 'table' else ''.join(cell['text'] for row in block['rows'] for cell in row) for block in blocks))
        if input_text != output_text:
            raise ValueError(f"Text coverage differs: {source['file']}")
        text_hash = hashlib.sha256(input_text.encode('utf-8')).hexdigest()
        duplicate = hashes.get(text_hash)
        hashes.setdefault(text_hash, source['id'])
        documents.append({'id': source['id'], 'file': source['file'], 'sha256': digest, 'title': title,
                          'duplicateOf': duplicate, 'textHash': text_hash, 'blocks': blocks,
                          'images': list(dict.fromkeys(image.get('src') for image in soup.select('img[src]'))),
                          'links': list(dict.fromkeys(link.get('href') for link in soup.select('a[href]')))})
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps({'version': 1, 'documents': documents}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'{len(documents)} sources; {sum(not doc["duplicateOf"] for doc in documents)} distinct documents; complete text coverage.')


if __name__ == '__main__':
    main()
