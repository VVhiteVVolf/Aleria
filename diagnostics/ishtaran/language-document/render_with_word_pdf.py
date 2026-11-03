"""Use native Word's PDF for the packaged DOCX rasterization gate on Windows.

The packaged renderer requires LibreOffice for conversion. This Windows runtime
does not bundle it and no system LibreOffice is installed. Word exports the DOCX
read-only; the bundled renderer still rasterizes the exact output using Poppler.
"""
from pathlib import Path
import importlib.util
import json
import os
import shutil
import tempfile

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
RUNTIME = Path('C:/Users/fhg_r/.cache/codex-runtimes/codex-primary-runtime')
RENDERER = Path('C:/Users/fhg_r/.codex/plugins/cache/openai-primary-runtime/documents/26.1017.22136/skills/documents/render_docx.py')
EXPORT = json.loads((HERE / 'word-export.json').read_text(encoding='utf-8-sig'))
PDF = Path(EXPORT['Pdf'])
DOCX = ROOT / 'Vorschau/Ishtaran/sources/language-context/Ishtaran_Kultur_Geschichte_Sprachkontext.docx'
os.environ['PATH'] = str(RUNTIME / 'dependencies/native/poppler/Library/bin') + os.pathsep + os.environ.get('PATH', '')
(HERE / 'temp').mkdir(exist_ok=True)
tempfile.tempdir = str(HERE / 'temp')
spec = importlib.util.spec_from_file_location('packaged_docx_renderer', RENDERER)
renderer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(renderer)

def converted_by_word(input_path, user_profile, convert_tmp_dir, stem, **kwargs):
    if Path(input_path).resolve() != DOCX.resolve():
        raise ValueError('Unexpected input document')
    if not PDF.is_file() or PDF.stat().st_mtime < DOCX.stat().st_mtime:
        raise ValueError('Native Word PDF must be newer than the source DOCX')
    target = Path(convert_tmp_dir) / f'{stem}.pdf'
    shutil.copy2(PDF, target)
    return str(target), 'Native Word PDF conversion used because LibreOffice is absent on this Windows runtime.'

renderer.convert_to_pdf = converted_by_word
pages = renderer.rasterize(str(DOCX), str(HERE / 'final-render'), dpi=144, verbose=True, emit_pdf=False)
report = {'converter':'Microsoft Word native PDF export', 'rasterizer':str(RENDERER), 'dpi':144, 'pages':pages}
(HERE / 'render-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(report, ensure_ascii=False))
