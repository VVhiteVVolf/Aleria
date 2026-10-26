"""Aldingen heraldry: authorized alpha-only cutouts, web copies and audits."""
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
import argparse
import hashlib
import json
import math
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
QA = ROOT.parents[1] / 'diagnostics/aldingen-2026-10-26/art'


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def save_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def prepare(job, normalizer):
    source = ROOT / job.get('generatedSource', f"assets/generated/{job['id']}.png")
    target = ROOT / job['production']
    target.parent.mkdir(parents=True, exist_ok=True)
    original = np.array(Image.open(source).convert('RGBA'))
    height, width = original.shape[:2]
    guarded = Image.new('RGBA', (width + 4, height + 4))
    guarded.paste(Image.fromarray(original), (2, 2))
    guarded.save(target)
    normalizer.normalize_emblem_alpha(target, fill_enclosed=True)
    pixels = np.array(Image.open(target).convert('RGBA'))[2:-2, 2:-2].copy()
    mask = pixels[:, :, 3] == 255
    y, x = np.nonzero(mask)
    cx, cy = round((x.min() + x.max()) / 2), round((y.min() + y.max()) / 2)
    circle = None
    if job['shape'] == 'circle':
        oy, ox = np.nonzero(~mask)
        radius = math.floor(np.hypot(ox - cx, oy - cy).min()) - 1
        yy, xx = np.ogrid[:height, :width]
        disk = (xx - cx) ** 2 + (yy - cy) ** 2 <= radius ** 2
        if np.any(disk & ~mask):
            raise ValueError('Circle extends beyond opaque artwork: ' + job['id'])
        pixels[:, :, 3] = np.where(disk, 255, 0).astype('uint8')
        diameter = 2 * radius
        circle = dict(radius=radius)
    else:
        diameter = max(x.max() - x.min() + 1, y.max() - y.min() + 1)
    side = math.ceil(max(diameter / .86, 2 * max(cx, width - cx, cy, height - cy) + 4))
    if side % 2:
        side += 1
    offset_x, offset_y = side // 2 - cx, side // 2 - cy
    final = Image.new('RGBA', (side, side))
    final.paste(Image.fromarray(pixels), (offset_x, offset_y))
    final.save(target, optimize=True)
    final_pixels = np.array(final)
    retained = final_pixels[offset_y:offset_y + height, offset_x:offset_x + width, :3]
    if not np.array_equal(retained, original[:, :, :3]):
        raise ValueError('RGB changed: ' + job['id'])
    if circle:
        circle['centre'] = [side // 2, side // 2]
    preview = ROOT / job['preview']
    preview.parent.mkdir(parents=True, exist_ok=True)
    final.resize((512, 512), Image.Resampling.LANCZOS).save(preview, 'WEBP', quality=94, method=6, exact=True)
    return dict(id=job['id'],kind=job['kind'],shape=job['shape'],source=str(source.relative_to(ROOT)).replace('\\','/'),
                sourceSha256=sha(source),production=job['production'],productionSha256=sha(target),
                preview=job['preview'],previewSha256=sha(preview),dimensions=[side,side],
                sourceDimensions=[width,height],padding=dict(left=offset_x,top=offset_y),
                alphaValues=[0,255],rgbUnchanged=True,interiorOpaque=True,circle=circle)


def audit(manifest, expected):
    failures = []
    if len(manifest['entries']) != expected:
        failures.append(f"Expected {expected} images, found {len(manifest['entries'])}")
    for entry in manifest['entries']:
        for kind in ('source','production','preview'):
            path = ROOT / entry[kind]
            if not path.exists() or sha(path) != entry[kind+'Sha256']:
                failures.append(entry['id']+': changed or missing '+kind)
        source = np.array(Image.open(ROOT / entry['source']).convert('RGBA'))
        final = np.array(Image.open(ROOT / entry['production']).convert('RGBA'))
        x,y = entry['padding']['left'],entry['padding']['top']
        h,w = source.shape[:2]
        if not np.array_equal(source[:,:,:3],final[y:y+h,x:x+w,:3]):
            failures.append(entry['id']+': RGB differs from source')
        alpha=final[:,:,3]
        if set(np.unique(alpha)) != {0,255} or np.any(alpha[0]) or np.any(alpha[-1]) or np.any(alpha[:,0]) or np.any(alpha[:,-1]):
            failures.append(entry['id']+': invalid exterior alpha')
        if entry['circle']:
            cx,cy=entry['circle']['centre'];r=entry['circle']['radius'];yy,xx=np.ogrid[:alpha.shape[0],:alpha.shape[1]]
            if not np.array_equal(alpha==255,(xx-cx)**2+(yy-cy)**2<=r*r):
                failures.append(entry['id']+': not an exact opaque circle')
    report=dict(expected=expected,checked=len(manifest['entries']),failures=failures)
    save_json(QA/'audit.json',report)
    print(json.dumps(report))
    if failures:
        raise SystemExit(1)


def contact(manifest):
    font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',14)
    for shape in ('circle','kite'):
        entries=[e for e in manifest['entries'] if e['shape']==shape]
        if not entries:
            continue
        sheet=Image.new('RGB',(1200,math.ceil(len(entries)/5)*275),'#e9e3d7');draw=ImageDraw.Draw(sheet)
        for i,e in enumerate(entries):
            image=Image.open(ROOT/e['production']).convert('RGBA');image.thumbnail((230,230))
            x=i%5*240+(240-image.width)//2;y=i//5*275
            sheet.paste(image,(x,y),image);draw.text((i%5*240+8,y+238),e['id'],fill='#222',font=font)
        QA.mkdir(parents=True,exist_ok=True);sheet.save(QA/(shape+'-contact.jpg'),quality=94)


def main():
    parser=argparse.ArgumentParser();parser.add_argument('--audit',action='store_true');parser.add_argument('--contact',action='store_true');parser.add_argument('--ids',nargs='+');parser.add_argument('--expected',type=int,default=39);args=parser.parse_args()
    path=ROOT/'assets/art-manifest.json'
    manifest=json.loads(path.read_text(encoding='utf-8')) if path.exists() else dict(schema='aleria.aldingen.heraldic-art',version=1,entries=[])
    if args.audit:
        audit(manifest,args.expected)
    elif args.contact:
        contact(manifest)
    else:
        spec=spec_from_file_location('aleria_heraldic_alpha',ROOT.parents[1]/'AleriaAlmanach/scripts/heraldic_emblem_alpha.py')
        normalizer=module_from_spec(spec);sys.dont_write_bytecode=True;spec.loader.exec_module(normalizer)
        jobs=json.loads((ROOT/'art-prompts.json').read_text(encoding='utf-8'))['jobs']
        entries={e['id']:e for e in manifest['entries']}
        for job in jobs:
            if (args.ids is None or job['id'] in args.ids) and (ROOT/job.get('generatedSource', f"assets/generated/{job['id']}.png")).exists():
                entries[job['id']]=prepare(job,normalizer)
        manifest['entries']=sorted(entries.values(),key=lambda e:e['id']);save_json(path,manifest);print(json.dumps(dict(prepared=len(entries))))


if __name__ == '__main__':
    main()
