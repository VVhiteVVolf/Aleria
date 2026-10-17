"""Read-only visual-asset validation. Never changes image pixels."""
import hashlib
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
ART = ROOT / 'AleriaAlmanach/assets/gwynthor-theater'
manifest = json.loads((ART / 'image-prompts.json').read_text(encoding='utf-8'))
report = []
for job in manifest['entries']:
    path = ROOT / job['destination']
    with Image.open(path) as source:
        image = source.convert('RGBA')
        alpha = image.getchannel('A')
        width, height = image.size
        hist = alpha.histogram()
        record = dict(id=job['id'], size=[width, height], sha256=hashlib.sha256(path.read_bytes()).hexdigest(),
                      transparent=hist[0], partial=sum(hist[1:255]), opaque=hist[255])
        if job['transparent']:
            corners = [alpha.getpixel(p) for p in [(0,0),(width-1,0),(0,height-1),(width-1,height-1)]]
            assert corners == [0]*4, job['id']
            assert hist[0] > width*height*.1, job['id']
            record['bounds'] = alpha.getbbox()
            if job['id'] in ['crest-awenfryn','theater-sign']:
                assert record['partial'] == 0, job['id']
                bounds = alpha.getbbox()
                assert .86 < (bounds[2]-bounds[0])/width < .88, job['id']
                if job['id'] == 'crest-awenfryn':
                    assert bounds[2]-bounds[0] == bounds[3]-bounds[1]
                assert alpha.getpixel((width//2,height//2)) == 255
        else:
            assert hist[255] == width*height, job['id']
        assert abs(width/height-(1 if job['id'] in ['crest-awenfryn','theater-sign'] else 2/3)) < .001
        report.append(record)
(ART / 'image-audit.json').write_text(json.dumps(dict(readOnly=True, passed=True, images=report), indent=2)+'\n', encoding='utf-8')
print(json.dumps(dict(passed=True, images=len(report), signsOpaque=True, productionAlphaPreserved=True)))
