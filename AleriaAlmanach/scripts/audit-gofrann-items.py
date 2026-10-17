"""Read-only validation of the generated item PNGs; never modify image pixels."""
import hashlib
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
DIRECTORY = ROOT / 'AleriaAlmanach/assets/gofrann-schmiede/items'


if __name__ == '__main__':
    manifest = json.loads((DIRECTORY / 'image-prompts.json').read_text(encoding='utf8'))
    results = []
    for entry in manifest['entries']:
        path = (ROOT / entry['destination']).resolve()
        path.relative_to(ROOT)
        image = Image.open(path)
        assert image.format == 'PNG' and image.width == image.height, entry['id']
        assert image.mode == 'RGBA', entry['id']
        alpha = image.getchannel('A')
        assert alpha.getextrema()[0] == 0 and alpha.getextrema()[1] >= 250, entry['id']
        corners = [alpha.getpixel(p) for p in [(0,0),(image.width-1,0),(0,image.height-1),(image.width-1,image.height-1)]]
        # Accept at most one alpha quantization step (1/255) in a corner;
        # preserve the generated edge antialiasing rather than rewriting pixels.
        assert max(corners) <= 1, entry['id']
        solid_bounds = alpha.point(lambda value: 255 if value >= 128 else 0).getbbox()
        assert solid_bounds and solid_bounds[0] > 0 and solid_bounds[1] > 0 and solid_bounds[2] < image.width and solid_bounds[3] < image.height, entry['id']
        results.append({'id':entry['id'], 'file':entry['destination'], 'size':list(image.size),
                        'trueAlpha':True, 'cornerAlpha':corners, 'maximumCornerAlpha':max(corners), 'cornerTolerance':1, 'solidBounds':solid_bounds,
                        'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
    (DIRECTORY / 'image-audit.json').write_text(json.dumps({'readOnly':True,'images':results},ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print(json.dumps({'checked':len(results),'square':True,'trueAlpha':True,'uncroppedSilhouettes':True,'pixelsUnchanged':True}))
