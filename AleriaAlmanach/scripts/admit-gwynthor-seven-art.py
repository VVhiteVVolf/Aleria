"""Copy generated originals, retain exact prompts and make QA contact sheets."""
from pathlib import Path
from PIL import Image, ImageDraw
import argparse
import hashlib
import io
import json
root=Path(__file__).resolve().parents[2]
parser=argparse.ArgumentParser()
parser.add_argument('--diagnostics',default='diagnostics/gwynthor-seven-20261102')
diagnostics=(root/parser.parse_args().diagnostics).resolve()
assert diagnostics.is_relative_to(root), 'Diagnostics must stay inside the workspace'
destinations={'items':'AleriaAlmanach/assets/gwynthor-seven/items'}
trait_kinds=('traits','body-traits','extra-traits','inspired-traits','unique-traits','bloodline-traits','theriantrophie-traits','health-traits','psychological-traits')
destinations.update({kind:'AleriaAlmanach/assets/development-traits' for kind in trait_kinds})
for kind,destination in destinations.items():
    manifest=diagnostics/f'{kind}-image-jobs.json'
    if not manifest.exists():
        continue
    data=json.loads(manifest.read_text(encoding='utf-8'))
    entries=data['entries']
    contact=Image.new('RGB',(1000,((len(entries)+4)//5)*220),'#e7e0d2')
    draw=ImageDraw.Draw(contact)
    for index,entry in enumerate(entries):
        source=Path(entry['generatedPath'])
        target=root/destination/(entry['id'].replace('development-trait-','')+'.png')
        target.parent.mkdir(parents=True,exist_ok=True)
        content=source.read_bytes() if source.exists() else target.read_bytes()
        if target.exists() and target.read_bytes()!=content:
            raise ValueError(f'Different existing art: {target}')
        with Image.open(io.BytesIO(content)) as im:
            assert im.width==im.height, target
            assert 'A' in im.getbands(), target
            alpha=im.getchannel('A')
            assert alpha.getextrema()[0]==0 and alpha.getextrema()[1]==255, target
            corners=[alpha.getpixel(point) for point in ((0,0),(im.width-1,0),(0,im.height-1),(im.width-1,im.height-1))]
            assert corners==[0,0,0,0], (target,corners)
            target.write_bytes(content)
            entry.update(file=target.relative_to(root).as_posix(),sha256=hashlib.sha256(content).hexdigest(),size=list(im.size),alphaExtrema=alpha.getextrema(),cornerAlpha=corners)
            if kind!='items':
                web=im.copy()
                web.thumbnail((192,192),Image.Resampling.LANCZOS)
                web_target=root/destination/'web'/(target.stem+'.webp')
                web_target.parent.mkdir(parents=True,exist_ok=True)
                web.save(web_target,format='WEBP',quality=88,method=6)
                entry.update(webFile=web_target.relative_to(root).as_posix(),webBytes=web_target.stat().st_size,
                             webSha256=hashlib.sha256(web_target.read_bytes()).hexdigest())
            im.thumbnail((190,190))
            x,y=(index%5)*200,(index//5)*220
            contact.paste(im,(x,y),im.getchannel('A'))
            draw.text((x,y+192),entry['id'].replace('development-trait-',''),fill='black')
    contact.save(diagnostics/f'{kind}-contact-review.jpg')
    (diagnostics/f'{kind}-art-receipt.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(f'{kind}: {len(entries)} exact PNG originals, alpha verified.')
