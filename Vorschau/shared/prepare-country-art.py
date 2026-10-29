"""Alpha-only production of country heraldry; source RGB and originals are retained."""
from pathlib import Path
from importlib.util import spec_from_file_location, module_from_spec
import argparse
import hashlib
import json
import math
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('country')
    parser.add_argument('--audit', action='store_true')
    parser.add_argument('--qa-dir', type=Path, help='Optional workspace-relative directory for review sheets')
    args = parser.parse_args()
    workspace = Path(__file__).resolve().parents[2]
    root = workspace / 'Vorschau' / args.country
    spec = spec_from_file_location('heraldic_alpha', workspace / 'AleriaAlmanach/scripts/heraldic_emblem_alpha.py')
    module = module_from_spec(spec)
    sys.dont_write_bytecode = True
    spec.loader.exec_module(module)
    jobs = json.loads((root / 'art-prompts.json').read_text(encoding='utf-8'))['jobs']
    entries = []
    for job in jobs:
        source = root / f"assets/generated/{job['id']}.png"
        target, preview = root / job['production'], root / job['preview']
        if not source.exists():
            raise ValueError('Missing generated artwork: ' + str(source))
        if not args.audit:
            target.parent.mkdir(parents=True, exist_ok=True)
            original = Image.open(source).convert('RGBA')
            guard = Image.new('RGBA', (original.width+4, original.height+4))
            guard.paste(original, (2, 2))
            guard.save(target)
            module.normalize_emblem_alpha(target, fill_enclosed=True)
            final = Image.open(target).crop((2, 2, original.width+2, original.height+2))
            padding = dict(left=0,top=0)
            circle = None
            if job['shape']=='circle':
                pixels=np.array(final)
                mask=pixels[:,:,3]==255
                y,x=np.nonzero(mask)
                cx,cy=round((x.min()+x.max())/2),round((y.min()+y.max())/2)
                oy,ox=np.nonzero(~mask)
                radius=math.floor(np.hypot(ox-cx,oy-cy).min())-1
                yy,xx=np.ogrid[:original.height,:original.width]
                pixels[:,:,3]=np.where((xx-cx)**2+(yy-cy)**2<=radius**2,255,0).astype('uint8')
                side=math.ceil(max(2*radius/.86,2*max(cx,original.width-cx,cy,original.height-cy)+4))
                if side%2:side+=1
                padding=dict(left=side//2-cx,top=side//2-cy)
                canvas=Image.new('RGBA',(side,side))
                canvas.paste(Image.fromarray(pixels),(padding['left'],padding['top']))
                final=canvas
                circle=dict(centre=[side//2,side//2],radius=radius)
            elif job['shape']=='banner' and original.width!=original.height:
                side=max(original.size)
                padding=dict(left=(side-original.width)//2,top=(side-original.height)//2)
                canvas=Image.new('RGBA',(side,side))
                canvas.paste(final,(padding['left'],padding['top']))
                final=canvas
            final.save(target)
            preview.parent.mkdir(parents=True, exist_ok=True)
            web = final.copy()
            web.thumbnail((600, 600), Image.Resampling.LANCZOS)
            web.save(preview, 'WEBP', quality=94, method=6, exact=True)
        if args.audit:
            old=next(e for e in json.loads((root/'assets/art-manifest.json').read_text(encoding='utf-8'))['entries'] if e['id']==job['id'])
            padding,circle=old['padding'],old['circle']
        original, final = np.array(Image.open(source).convert('RGBA')), np.array(Image.open(target).convert('RGBA'))
        x,y=padding['left'],padding['top'];height,width=original.shape[:2]
        if not np.array_equal(original[:, :, :3], final[y:y+height,x:x+width,:3]):
            raise ValueError('RGB changed: ' + job['id'])
        alpha = final[:, :, 3]
        if not (alpha==255).any() or any(np.any(edge) for edge in [alpha[0],alpha[-1],alpha[:,0],alpha[:,-1]]):
            raise ValueError('Invalid exterior alpha or cropped art: ' + job['id'])
        if circle:
            cx,cy=circle['centre'];yy,xx=np.ogrid[:alpha.shape[0],:alpha.shape[1]]
            if not np.array_equal(alpha==255,(xx-cx)**2+(yy-cy)**2<=circle['radius']**2):
                raise ValueError('Circle is not exactly opaque: '+job['id'])
        entries.append(dict(id=job['id'],source=str(source.relative_to(root)).replace('\\','/'),sourceSha256=sha(source),production=job['production'],productionSha256=sha(target),preview=job['preview'],previewSha256=sha(preview),dimensions=list(Image.open(target).size),padding=padding,circle=circle,rgbUnchanged=True))
    manifest=dict(schema='aleria.country-preparation.heraldry',entries=entries)
    out=root/'assets/art-manifest.json'
    if args.audit:
        if json.loads(out.read_text(encoding='utf-8'))!=manifest:
            raise ValueError('Manifest differs')
    else:
        out.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    qa=workspace/args.qa_dir if args.qa_dir else workspace/'diagnostics/iathneach-triarchie-2026-10-27'/args.country
    qa.mkdir(parents=True,exist_ok=True)
    sheet=Image.new('RGB',(1200,((len(entries)+4)//5)*265),'#e9e3d7')
    draw=ImageDraw.Draw(sheet)
    font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',14)
    for i,entry in enumerate(entries):
        im=Image.open(root/entry['production']).convert('RGBA');im.thumbnail((230,230))
        x=i%5*240+(240-im.width)//2;y=i//5*265
        sheet.paste(im,(x,y),im);draw.text((i%5*240+5,y+235),entry['id'],fill='#222',font=font)
    sheet.save(qa/'heraldry-contact.jpg',quality=94)
    print(json.dumps(dict(country=args.country,checked=len(entries),rgbUnchanged=True)))


if __name__ == '__main__':
    main()
