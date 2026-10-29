from pathlib import Path
from PIL import Image, ImageOps, ImageDraw, ImageFont
import json

root=Path(__file__).resolve().parents[2]
source=Path(r'C:\Users\fhg_r\Downloads')/'Länder'/'Aeldrunmar'
out=Path(__file__).parent
out.mkdir(parents=True,exist_ok=True)
records=[]
crests=[]
for p in sorted(source.rglob('*.png')):
    with Image.open(p) as im:
        records.append({'file':p.relative_to(source).as_posix(),'size':list(im.size),'mode':im.mode})
        if 'Vorbereitungskarte' in p.name:
            preview=im.convert('RGB');preview.thumbnail((2400,2400));preview.save(out/'map-overview.jpg',quality=96)
        elif p.name!='Königreich Aeldrunmar.png':
            crests.append(p)
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',16)
sheet=Image.new('RGB',(1500,((len(crests)+4)//5)*280),'#e6dfcf');draw=ImageDraw.Draw(sheet)
for i,p in enumerate(crests):
    im=Image.open(p).convert('RGBA');im.thumbnail((252,232))
    x=i%5*300+(300-im.width)//2;y=i//5*280
    sheet.paste(im,(x,y),im)
    draw.text((i%5*300+8,y+234),p.stem,fill='#222',font=font)
    draw.text((i%5*300+8,y+255),p.parent.name if p.parent!=source else 'Frei',fill='#555',font=font)
sheet.save(out/'supplied-crests.jpg',quality=95)
(out/'source-inventory.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'files':len(records),'houses':len(crests),'maps':[r for r in records if 'Vorbereitungskarte' in r['file']]},ensure_ascii=False))
