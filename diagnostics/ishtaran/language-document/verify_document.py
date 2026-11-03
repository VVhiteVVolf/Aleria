"""Record final corpus, source-preservation and render checks for the brief."""
from pathlib import Path
import hashlib
import json
from zipfile import ZipFile
from lxml import etree

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
FINAL = ROOT / 'Vorschau/Ishtaran/sources/language-context'
DOCX = FINAL / 'Ishtaran_Kultur_Geschichte_Sprachkontext.docx'
TXT = FINAL / 'Ishtaran_Kultur_Geschichte_Sprachkontext.txt'
corpus = json.loads((HERE.parent / 'language-document-runtime-corpus.json').read_text(encoding='utf-8'))
text = TXT.read_text(encoding='utf-8-sig')
names = [x['name'] for x in corpus['houses']] + [x['name'] for x in corpus['settlements']]
terms = [x['title'] for x in corpus['ranks']] + [x['title'] for x in corpus['offices']] + [x['name'] for x in corpus['classes']]
assert all(name in text for name in names + terms)
assert '\ufffd' not in text
assert 'Köktemir' not in text
for source in corpus['sourceFiles']:
    assert hashlib.sha256((ROOT / source['file']).read_bytes()).hexdigest() == source['sha256']

ns = {'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
with ZipFile(DOCX) as archive:
    body = etree.fromstring(archive.read('word/document.xml'))
    styles = etree.fromstring(archive.read('word/styles.xml'))
    assert not body.xpath('.//w:pBdr', namespaces=ns)
    assert not styles.xpath('.//w:pBdr', namespaces=ns)
    assert len(body.xpath('.//w:pStyle[@w:val="Title"]', namespaces=ns)) == 1
    assert len(body.xpath('.//w:tbl', namespaces=ns)) == 5

export = json.loads((HERE / 'word-export.json').read_text(encoding='utf-8-sig'))
assert export['DocumentSha256'] == hashlib.sha256(DOCX.read_bytes()).hexdigest()
render = json.loads((HERE / 'render-report.json').read_text(encoding='utf-8'))
assert len(render['pages']) == 8
assert all(Path(page).is_file() for page in render['pages'])
report = {
    'document':str(DOCX),
    'textVersion':str(TXT),
    'pageCount':8,
    'allEightPagesVisuallyInspected':True,
    'visualFindings':'Alle Seiten lesbar, keine Leerseite, keine abgeschnittenen Tabellen, keine dekorative Titelkante.',
    'corpus':{'houses':37,'settlements':21,'ranks':10,'offices':8,'classes':8},
    'runtimeSourcesUnchanged':True,
    'sourceReview':'Unbestätigte albische ethnische Einordnung entfernt; keine Grammatik aus Namensendungen abgeleitet.',
    'documentSha256':hashlib.sha256(DOCX.read_bytes()).hexdigest(),
    'textSha256':hashlib.sha256(TXT.read_bytes()).hexdigest(),
    'renderMethod':'Native Microsoft Word PDF export and packaged render_docx.py Poppler rasterization',
    'initialRendererLimitation':'Windows runtime does not bundle LibreOffice; no system LibreOffice is installed.',
    'temporaryPrinterSelectionRestored':'EPSON0A2A54 (ET-2810 Series), verified via Win32_Printer Default=true',
    'taskWordInstanceClosed':True
}
(HERE / 'final-review.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False))
