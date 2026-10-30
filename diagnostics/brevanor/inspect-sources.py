from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
import json, hashlib

root=Path('E:/Aleria')
source=Path('C:/Users/fhg_r/Downloads/Länder/Brevanor')
out=root/'diagnostics/brevanor'
out.mkdir(parents=True,exist_ok=True)
entries=[]
thumbs=[]
for p in sorted(source.glob('*.png')):
    im=Image.open(p)
    entries.append({'filename':p.name,'size':list(im.size),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
    if 'Vorbereitungskarte' in p.name:
        overview=im.copy(); overview.thumbnail((2100,2100)); overview.convert('RGB').save(out/'map-overview.jpg',quality=95)
        width,height=im.size
        for row in range(2):
            for col in range(2):
                box=(int(col*width/2),int(row*height/2),int((col+1)*width/2),int((row+1)*height/2))
                tile=im.crop(box);tile.thumbnail((1900,1900));tile.convert('RGB').save(out/f'map-{row}-{col}.jpg',quality=95)
        continue
    tile=Image.new('RGB',(330,370),'#d7cfba')
    pic=im.convert('RGBA');pic.thumbnail((310,320))
    tile.paste(pic,((330-pic.width)//2,12),pic)
    ImageDraw.Draw(tile).text((12,342),p.name,fill='black')
    thumbs.append(tile)
sheet=Image.new('RGB',(330*4,370*((len(thumbs)+3)//4)),'#d7cfba')
for i,t in enumerate(thumbs):sheet.paste(t,((i%4)*330,(i//4)*370))
sheet.save(out/'source-contact.jpg',quality=94)
(out/'inventory.json').write_text(json.dumps(entries,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps(entries,ensure_ascii=False))
