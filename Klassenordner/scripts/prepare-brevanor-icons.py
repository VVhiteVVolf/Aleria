"""Build the seven class icons with the shared alpha algorithm, never a style filter."""
from pathlib import Path
from importlib.util import spec_from_file_location,module_from_spec
import argparse,json,sys
import numpy as np
from PIL import Image,ImageDraw,ImageFont

ROOT=Path(__file__).resolve().parents[2]
spec=spec_from_file_location('figure_alpha',ROOT/'Vorschau/shared/warrior-artifacts/pipeline.py')
alpha=module_from_spec(spec)
sys.dont_write_bytecode=True
spec.loader.exec_module(alpha)

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--audit',action='store_true')
    args=parser.parse_args()
    config=json.loads((ROOT/'Klassenordner/Brevanor/icon-prompts.json').read_text(encoding='utf-8'))
    if config['stylePreset']!='fantasy-class-icon' or not config['alphaCleanupAuthorized']:
        raise ValueError('Missing icon style or alpha approval')
    entries=[]
    for job in config['jobs']:
        source=ROOT/job['destination'];target=ROOT/job['production'];preview=ROOT/job['preview']
        original=np.array(Image.open(source).convert('RGBA'))
        if list(original.shape[:2])!=[1536,1024]:raise ValueError('Unexpected dimensions: '+job['id'])
        expected_alpha=alpha.normalized_alpha(original[:,:,3],alpha.DEFAULT_PROCESSING)
        metrics=alpha.alpha_metrics(expected_alpha)
        if metrics['touchesCanvas']:raise ValueError('Clipped silhouette: '+job['id'])
        if not args.audit:
            target.parent.mkdir(parents=True,exist_ok=True)
            pixels=original.copy();pixels[:,:,3]=expected_alpha
            image=Image.fromarray(pixels);image.save(target)
            image.thumbnail((384,576),Image.Resampling.LANCZOS)
            image.save(preview,'WEBP',quality=94,method=6,exact=True)
        final=np.array(Image.open(target).convert('RGBA'))
        if not np.array_equal(final[:,:,:3],original[:,:,:3]) or not np.array_equal(final[:,:,3],expected_alpha):
            raise ValueError('Original RGB or alpha mismatch: '+job['id'])
        entries.append(dict(id=job['id'],source=job['destination'],sourceSha256=alpha.sha256(source),production=job['production'],productionSha256=alpha.sha256(target),preview=job['preview'],previewSha256=alpha.sha256(preview),metrics=metrics,rgbUnchanged=True))
    manifest=dict(schema='aleria.class-icons',version=1,stylePreset='fantasy-class-icon',entries=entries)
    output=ROOT/'Klassenordner/assets/images/brevanor/icons/manifest.json'
    if args.audit:
        if json.loads(output.read_text(encoding='utf-8'))!=manifest:raise ValueError('Manifest differs')
    else:output.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    sheet=Image.new('RGB',(1120,900),'#e8e0ca');draw=ImageDraw.Draw(sheet)
    font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',18)
    for i,entry in enumerate(entries):
        image=Image.open(ROOT/entry['production']).convert('RGBA');image.thumbnail((260,390))
        x=(i%4)*280+(280-image.width)//2;y=(i//4)*450
        sheet.paste(image,(x,y),image);draw.text(((i%4)*280+12,y+405),entry['id'],font=font,fill='#252020')
    sheet.save(ROOT/'diagnostics/brevanor-classes/icons-contact.jpg',quality=95)
    print(json.dumps(dict(checked=len(entries),stylePreset='fantasy-class-icon',rgbUnchanged=True,audit=args.audit)))

if __name__=='__main__':main()
