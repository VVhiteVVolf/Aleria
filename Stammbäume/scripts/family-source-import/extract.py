"""Archive the supplied HTML and expose table cells without discarding empty columns.

Usage: python -X utf8 extract.py [attachment-root]
Without an argument the committed HTML snapshots are used.
No genealogical decisions are inferred here. Plans consume the archived row IDs.
"""
from pathlib import Path
from bs4 import BeautifulSoup
import hashlib
import json
import sys

script = Path(IMPORT_DIRECTORY)
config = json.loads((script / 'import.json').read_text('utf-8'))
root = script.parents[1]
attachment_root = Path(sys.argv[1]) if len(sys.argv) > 1 else None
archive = root / config['inventory'].removesuffix('.json')
archive.mkdir(parents=True, exist_ok=True)
sources = json.loads((script / 'sources.json').read_text(encoding='utf-8'))
for source in sources:
    target = archive / (source['slug'] + '.html')
    attachment = next((attachment_root / source['attachmentId']).glob('*.txt')) if attachment_root else target
    raw = attachment.read_bytes()
    target.write_bytes(raw)
    source.update(path=target.relative_to(root).as_posix(), sha256=hashlib.sha256(raw).hexdigest())
    soup = BeautifulSoup(raw.decode('utf-8-sig'), 'html.parser')
    rows = []
    for row, tr in enumerate(soup.select('tr')):
        cells = tr.find_all(['td', 'th'], recursive=False)
        if any(c.find('table') for c in cells):
            continue
        rows.append({'row': row, 'cells': [{
            'column': col,
            'colspan': int(c.get('colspan', 1)),
            'text': ' '.join(c.get_text(' ', strip=True).split()),
            'images': [{'url': image.get('src', ''), 'alt': image.get('alt', '')} for image in c.select('img')],
            'styles': [node.get('style', '') for node in [c, *c.select('[style]')]],
        } for col, c in enumerate(cells)]})
    source['rows'] = rows
    source['images'] = list(dict.fromkeys(image.get('src') for image in soup.select('img[src]')))
    source['text'] = soup.get_text(' ', strip=True)
archive.joinpath('.gitattributes').write_text('*.html -text whitespace=cr-at-eol\n', encoding='utf-8')
output = root / config['inventory']
output.write_text(json.dumps({'date': config['date'], 'scope': 'genealogy-biographies-warriors-and-counterpart-portraits', 'sources': sources}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('Archived', len(sources), 'sources to', output)
