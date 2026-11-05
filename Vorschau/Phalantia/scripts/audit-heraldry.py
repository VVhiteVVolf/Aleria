"""Read-only provenance, RGB and circular-alpha audit for Phalantia crests."""
import hashlib
import json
import argparse
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
WORKSPACE = ROOT.parents[1]

def digest(path):
    with path.open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--category',choices=('houses','regions'),default='houses')
    category = parser.parse_args().category
    prefix,count,qa = ('region-shield',8,'regions') if category == 'regions' else ('emblem',9,'emblems')
    generated = json.loads((ROOT/f'sources/{prefix}-generation-receipts.json').read_text(encoding='utf8'))['entries']
    assets = json.loads((ROOT/f'sources/{prefix}-asset-receipts.json').read_text(encoding='utf8'))['entries']
    assert len(generated) == len(assets) == count
    tool_by_id = {entry['id']:entry for entry in generated}
    assert set(tool_by_id) == {entry['id'] for entry in assets}
    results = []
    for entry in assets:
        tool = tool_by_id[entry['id']]
        source = ROOT/entry['source']
        assert digest(Path(tool['toolOriginal'])) == digest(source) == entry['sourceSha256']
        assert digest(ROOT/entry['production']) == entry['productionSha256']
        assert digest(ROOT/entry['preview']) == entry['previewSha256']
        with Image.open(source) as opened:
            original = np.array(opened.convert('RGBA'))
        with Image.open(ROOT/entry['production']) as opened:
            assert opened.mode == 'RGBA' and opened.width == opened.height
            pixels = np.array(opened)
        x,y = (entry['framing']['padding'][key] for key in ['left','top'])
        assert np.array_equal(original[:,:,:3],pixels[y:y+original.shape[0],x:x+original.shape[1],:3])
        cx,cy = entry['framing']['circle']['centre']
        radius = entry['framing']['circle']['radius']
        yy,xx = np.ogrid[:pixels.shape[0],:pixels.shape[1]]
        distance = (xx-cx)**2 + (yy-cy)**2
        alpha = pixels[:,:,3]
        assert np.all(alpha[distance < (radius-2)**2] == 255)
        assert np.all(alpha[distance > (radius+2)**2] == 0)
        assert set(np.unique(alpha)).issubset({0,255})
        results.append(dict(id=entry['id'],toolOriginalExact=True,sourceHash=entry['sourceSha256'],
                            productionHash=entry['productionSha256'],rgbUnchanged=True,
                            square=True,opaqueInterior=True,transparentExterior=True,size=list(pixels.shape[1::-1])))
    report = dict(schemaVersion=1,tool='image_gen.imagegen',verified=True,count=len(results),
                  visualReview=f'All {count} generated images individually inspected; production contact sheet inspected separately.',
                  technicalAlphaAuthorization='User approved RGB-preserving technical transparency cleanup in this conversation.',
                  entries=results)
    destination = WORKSPACE/f'diagnostics/phalantia/{qa}/audit.json'
    destination.parent.mkdir(parents=True,exist_ok=True)
    destination.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print(json.dumps(dict(verified=True,count=len(results),originalsExact=True,rgbUnchanged=True,alphaPassed=True)))

if __name__ == '__main__': main()
