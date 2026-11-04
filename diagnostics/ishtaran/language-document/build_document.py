"""Create the source-grounded Ishtaran language brief with bundled python-docx."""
from pathlib import Path
import json
import re
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

ROOT = Path(__file__).resolve().parents[3]
WORK = Path(__file__).resolve().parent
OUT = ROOT / 'Vorschau/Ishtaran/sources/language-context'
OUT.mkdir(parents=True, exist_ok=True)
CONTENT = json.loads((WORK / 'content.json').read_text(encoding='utf-8'))
CORPUS = json.loads((WORK.parent / 'language-document-runtime-corpus.json').read_text(encoding='utf-8'))
DOCX = OUT / 'Ishtaran_Kultur_Geschichte_Sprachkontext.docx'
TXT = OUT / 'Ishtaran_Kultur_Geschichte_Sprachkontext.txt'

doc = Document()
section = doc.sections[0]
section.page_width, section.page_height = Inches(8.5), Inches(11)
section.top_margin, section.bottom_margin = Inches(.72), Inches(.65)
section.left_margin, section.right_margin = Inches(.82), Inches(.82)
section.header_distance, section.footer_distance = Inches(.3), Inches(.3)

for name in ['Normal', 'Title', 'Subtitle', 'Heading 1', 'Heading 2', 'Heading 3', 'Header', 'Footer', 'List Bullet']:
    s = doc.styles[name]
    s.font.name = 'Calibri'
    s.font.color.rgb = RGBColor(0, 0, 0)
    s.font.italic = False
    if s.element.rPr is not None:
        for color in s.element.rPr.findall(qn('w:color')):
            for attr in ['themeColor', 'themeTint', 'themeShade']:
                color.attrib.pop(qn('w:' + attr), None)
    s.paragraph_format.widow_control = True

normal = doc.styles['Normal']
normal.font.size = Pt(11)
normal.paragraph_format.space_after = Pt(6)
normal.paragraph_format.line_spacing = 1.1
for name, size, before, after in [('Title', 29, 0, 3), ('Subtitle', 17, 0, 5), ('Heading 1', 18, 0, 11), ('Heading 2', 12.5, 11, 5), ('Heading 3', 11, 6, 3)]:
    s = doc.styles[name]
    s.font.size = Pt(size)
    s.font.bold = name != 'Subtitle'
    s.paragraph_format.space_before = Pt(before)
    s.paragraph_format.space_after = Pt(after)
    s.paragraph_format.keep_with_next = True

header = section.header.paragraphs[0]
header.text = 'ALERIA    ISHTARAN    SPRACHKONTEXT'
header.runs[0].font.size = Pt(8)
footer = section.footer.paragraphs[0]
footer.alignment = WD_ALIGN_PARAGRAPH.RIGHT
run = footer.add_run('Arbeitsstand 3. November 2026   |   ')
run.font.size = Pt(8)
fld = OxmlElement('w:fldSimple')
fld.set(qn('w:instr'), 'PAGE')
footer._p.append(fld)

txt = [CONTENT['title'], CONTENT['subtitle'], CONTENT['purpose'], CONTENT['date'], '']

def paragraph(text, style=None):
    p = doc.add_paragraph(text, style)
    txt.append(text)
    txt.append('')
    return p

def table(headers, rows, widths):
    tab = doc.add_table(rows=1, cols=len(headers))
    tab.alignment = WD_TABLE_ALIGNMENT.CENTER
    tab.autofit = False
    for col, width in zip(tab.columns, widths):
        col.width = Inches(width)
    pr = tab._tbl.tblPr
    borders = OxmlElement('w:tblBorders')
    for side in ['top','left','bottom','right','insideH','insideV']:
        border = OxmlElement('w:' + side)
        for key, value in [('val','single'),('sz','4'),('color','D9D9D9')]:
            border.set(qn('w:' + key), value)
        borders.append(border)
    pr.append(borders)
    margins = OxmlElement('w:tblCellMar')
    for side, value in [('top','65'),('bottom','65'),('left','105'),('right','105')]:
        e=OxmlElement('w:' + side)
        e.set(qn('w:w'), value)
        e.set(qn('w:type'), 'dxa')
        margins.append(e)
    pr.append(margins)
    repeat = OxmlElement('w:tblHeader')
    tab.rows[0]._tr.get_or_add_trPr().append(repeat)
    for index, record in enumerate([headers] + rows):
        row = tab.rows[0] if index == 0 else tab.add_row()
        row._tr.get_or_add_trPr().append(OxmlElement('w:cantSplit'))
        for col, value in enumerate(record):
            cell = row.cells[col]
            cell.width = Inches(widths[col])
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            shade = OxmlElement('w:shd')
            shade.set(qn('w:fill'), 'E6EBEF' if index == 0 else ('F5F7F8' if index % 2 == 0 else 'FFFFFF'))
            cell._tc.get_or_add_tcPr().append(shade)
            cell.text = str(value)
            p=cell.paragraphs[0]
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.05
            for r in p.runs:
                r.font.size = Pt(10.5)
                r.font.bold = index == 0
                r.font.color.rgb = RGBColor(0,0,0)
    txt.append(' | '.join(headers))
    txt.extend(' | '.join(str(c) for c in r) for r in rows)
    txt.append('')
    gap = doc.add_paragraph()
    gap.paragraph_format.space_after = Pt(0)
    gap.paragraph_format.space_before = Pt(0)
    gap.paragraph_format.line_spacing = Pt(3)
    gap.add_run().font.size = Pt(2)

def corpus_field(name):
    value = CORPUS[name]
    return value

def get_title(item):
    return item.get('rank', '')

for page_index, page in enumerate(CONTENT['pages']):
    if not page_index:
        doc.add_paragraph(CONTENT['title'], 'Title')
        doc.add_paragraph(CONTENT['subtitle'], 'Subtitle')
        p=doc.add_paragraph(CONTENT['purpose'] + '\n' + CONTENT['date'])
        p.paragraph_format.space_after = Pt(12)
        for r in p.runs:
            r.font.size = Pt(10)
    page_heading = paragraph(page['heading'], 'Heading 1')
    if page_index:
        page_heading.paragraph_format.page_break_before = True
    for block in page['blocks']:
        kind=block['type']
        if kind in ('p','h2'):
            paragraph(block['text'], 'Heading 2' if kind == 'h2' else None)
        elif kind == 'list':
            for item in block['items']:
                p=paragraph(item, 'List Bullet')
                p.paragraph_format.space_after = Pt(5)
        elif kind == 'table':
            table(block['headers'], block['rows'], block['widths'])
        elif kind == 'ranks':
            table(['Rang', 'Gesellschaftliche Stellung', 'Ishtaranischer Titel'], [[str(i+1), x['rank'], x['title']] for i,x in enumerate(CORPUS['ranks'])], [.5,3.4,2.95])
        elif kind == 'offices':
            table(['Zuständigkeit', 'Titel'], [[x['role'],x['title']] for x in CORPUS['offices']], [4.4,2.45])
        elif kind == 'classes':
            weapons = {
                'Nefer': 'Speer, Schild, Krummsäbel',
                'Derwisch': 'Zweihändig geführter Krummsäbel oder zwei Krummsäbel',
                'Sipahi': 'Orientalische Lanze, Krummsäbel',
                'Ghulam': 'Flegel, Morgenstern, Streitkolben',
                'Aschik': 'Krummsäbel, Dolch, Musikinstrument',
                'Nizet': 'Stangenwaffe',
                'Keman': 'Bogen, Krummsäbel',
                'Lewent': 'Bogen, Krummsäbel'
            }
            table(['Name', 'Klasse und Bewaffnung'], [[x['name'], x['role'] + '\n' + weapons[x['name']]] for x in CORPUS['classes']], [1.05,5.8])
        elif kind == 'houseCorpus':
            for title in ['Sultan','Pascha','Tarkan']:
                names=[x['name'] for x in CORPUS['houses'] if get_title(x)==title]
                paragraph(title + ' im aktuellen Entwurf', 'Heading 3')
                paragraph(', '.join(names) + '.')
        elif kind == 'cityCorpus':
            for label, key in [('Hauptstadt', 'capital'),('Acht weitere große Städte', 'pascha'),('Zwölf kleine Orte einschließlich der Ruine', 'small')]:
                names=[x['name'] for x in CORPUS['settlements'] if x.get('tier') == ('tarkan' if key == 'small' else key)]
                paragraph(label, 'Heading 3')
                paragraph(', '.join(names) + '.')
        else:
            raise ValueError(kind)

doc.core_properties.title = CONTENT['title'] + ' ' + CONTENT['subtitle']
doc.core_properties.subject = 'Kultur und Geschichte als Grundlage für ein Sprachmodul'
doc.core_properties.author = 'Aleria'
doc.core_properties.keywords = 'Ishtaran, Maghath, Maghneach, Sprache, Kultur, Geschichte'
# The bundled Word base template can carry a blue border on its Title style.
# This brief uses typography alone; strip paragraph borders from all styles and
# direct paragraphs while retaining the deliberate table grid borders.
for source in [doc.styles.element, doc.element]:
    for border in source.xpath('.//w:pBdr'):
        border.getparent().remove(border)
doc.save(DOCX)
TXT.write_text('\n'.join(txt), encoding='utf-8-sig')
print(json.dumps({'docx':str(DOCX),'txt':str(TXT),'words':len(re.findall(r'\S+', '\n'.join(txt)))}, ensure_ascii=False))
