"""Einmaliger, nachprüfbarer Import der vollständigen Nutzertexte (kein Laufzeitcode)."""
from pathlib import Path
import hashlib
import json
import re
from bs4 import BeautifulSoup

root = Path(__file__).resolve().parents[1]
source = root / 'Schlachten/sources/wellenruh-vorlage.html'
markers = {
    '1)übersicht': ('overview', 'Übersicht'),
    '2)vorgeschichte': ('background', 'Vorgeschichte'),
    'strategiedergrünen': ('green-strategy', 'Strategie der Grünen'),
    'strategiederroten': ('red-strategy', 'Strategie der Roten'),
    'schlachtverlauf': ('course', 'Schlachtverlauf'),
    '4)folgen': ('aftermath', 'Folgen'),
    '5)zitate': ('scene', 'Hrolfr und Raveld – die vollständige Schlachtszene'),
    '6)trivia': ('trivia', 'Trivia'),
}
sections = {}
active = None
for paragraph in BeautifulSoup(source.read_text(encoding='utf-8'), 'html.parser').find_all('p'):
    text = re.sub(r'\s+', ' ', paragraph.get_text(' ', strip=True)).strip()
    compact = re.sub(r'\s+', '', text).casefold()
    if compact == '1)übersicht' or active is not None:
        if compact in markers:
            active, title = markers[compact]
            sections.setdefault(active, {'id': active, 'title': title, 'paragraphs': []})
            continue
        # Die Infobox enthält nur kurze Feldwerte; deren Fakten werden gesondert gerendert.
        if len(text) > 100:
            text = re.sub(r'\s+([,.;:!?])', r'\1', text)
            sections[active]['paragraphs'].append(text)

assert {key: len(value['paragraphs']) for key, value in sections.items()} == {
    'overview': 1, 'background': 4, 'green-strategy': 4, 'red-strategy': 4,
    'course': 5, 'aftermath': 3, 'scene': 7, 'trivia': 0,
}
result = {'source': 'Schlachten/sources/wellenruh-vorlage.html',
          'sha256': hashlib.sha256(source.read_bytes()).hexdigest(),
          'normalization': 'HTML entfernt; Leerraum und Leerzeichen vor Satzzeichen bereinigt. Keine Textkürzungen.',
          'sections': list(sections.values())}
target = root / 'modules/battles/wellenruh-source.json'
target.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'{sum(len(s["paragraphs"]) for s in sections.values())} vollständige Quellabsätze importiert.')
