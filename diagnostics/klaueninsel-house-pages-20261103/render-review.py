from pathlib import Path
from PIL import Image, ImageDraw
import json

root=Path(__file__).resolve().parents[2]
directory=Path(__file__).parent
jobs=json.loads((directory/'image-prompts.json').read_text(encoding='utf-8'))
checks=[]
sheet=Image.new('RGB',(1540,1110),'#e5dcc9')
draw=ImageDraw.Draw(sheet)
for i,job in enumerate(jobs):
    revised=root/job['folder']/'assets/image-generation-v2.json'
    if revised.exists():
        job.update(json.loads(revised.read_text(encoding='utf-8')))
    file=root/job['image']; x,y=(i%7)*220,(i//7)*370
    draw.text((x+6,y+340),job['id'].removeprefix('haus-'),fill='#282620')
    if not file.exists():
        draw.text((x+12,y+120),'pending',fill='#666666'); continue
    picture=Image.open(file); alpha=picture.getchannel('A')
    corners=[alpha.getpixel(p) for p in [(0,0),(picture.width-1,0),(0,picture.height-1),(picture.width-1,picture.height-1)]]
    checks.append({'id':job['id'],'file':job['image'],'mode':picture.mode,'size':picture.size,'alphaExtrema':alpha.getextrema(),'corners':corners})
    assert picture.mode=='RGBA' and picture.width*3==picture.height*2 and alpha.getextrema()[0]==0 and max(corners)<=1,job['id']
    preview=picture.copy();preview.thumbnail((212,330));sheet.paste(preview,(x+(220-preview.width)//2,y+4),preview)
sheet.save(directory/'final-contact-sheet.jpg',quality=94)
for name,data in [('image-checks.json',checks),('image-prompts-final.json',jobs)]:
    (directory/name).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'{len(checks)} von {len(jobs)} Figuren vorhanden und geprueft.')
