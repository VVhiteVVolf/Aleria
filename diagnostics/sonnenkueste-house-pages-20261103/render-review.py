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
    file=root/job['image']
    x,y=(i%7)*220,(i//7)*370
    draw.text((x+6,y+340),job['id'].removeprefix('haus-'),fill='#282620')
    if not file.exists():
        draw.text((x+12,y+120),'pending',fill='#666666')
        continue
    image=Image.open(file)
    alpha=image.getchannel('A')
    corners=[alpha.getpixel(p) for p in [(0,0),(image.width-1,0),(0,image.height-1),(image.width-1,image.height-1)]]
    checks.append({'id':job['id'],'file':job['image'],'mode':image.mode,'size':image.size,'alphaExtrema':alpha.getextrema(),'corners':corners})
    assert image.mode=='RGBA' and image.width*3==image.height*2 and alpha.getextrema()[0]==0 and max(corners)<=1,job['id']
    preview=image.copy();preview.thumbnail((212,330))
    sheet.paste(preview,(x+(220-preview.width)//2,y+4),preview)
sheet.save(directory/'final-contact-sheet.jpg',quality=94)
(directory/'image-checks.json').write_text(json.dumps(checks,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(directory/'image-prompts-final.json').write_text(json.dumps(jobs,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
crestsheet=Image.new('RGB',(700,350),'#e5dcc9')
for i,id in enumerate(['caerwen','nerwynn']):
    file=root/'Stammbäume/assets/images/houses/Sonnenküste/Jungferntal'/f'haus-{id}.png'
    if file.exists():
        image=Image.open(file).convert('RGBA')
        assert image.width==image.height
        image.thumbnail((320,320))
        crestsheet.paste(image,(i*350+15,15),image)
crestsheet.save(directory/'new-crests-review.jpg',quality=94)
print(f'{len(checks)} von {len(jobs)} Figuren vorhanden und geprüft.')
