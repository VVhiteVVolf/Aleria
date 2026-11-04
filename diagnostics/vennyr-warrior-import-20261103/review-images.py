from pathlib import Path
from PIL import Image,ImageDraw
from hashlib import sha256
import json

root=Path(__file__).resolve().parents[2]
directory=Path(__file__).parent
ids=['blodyn','trachwyll','caerdyn','drewi','gwanrhyd','bochdew','udgorn','balauric','morgryn','gwenyen','crwynog']
sheet=Image.new('RGB',(1320,740),'#e5dcc9')
draw=ImageDraw.Draw(sheet)
checks=[]
for i,slug in enumerate(ids):
    file=root/'Stammbäume/assets/images/references'/f'haus-{slug}'/'krieger.png'
    picture=Image.open(file)
    checks.append({'id':f'haus-{slug}','file':str(file.relative_to(root)),'size':picture.size,'mode':picture.mode,'sha256':sha256(file.read_bytes()).hexdigest()})
    preview=picture.convert('RGBA');preview.thumbnail((210,328))
    x,y=(i%6)*220,(i//6)*370
    sheet.paste(preview,(x+(220-preview.width)//2,y+5),preview)
    draw.text((x+8,y+343),slug,fill='#292620')
sheet.save(directory/'original-warriors-contact-sheet.jpg',quality=94)
(directory/'image-verification.json').write_text(json.dumps(checks,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'{len(checks)} unveraenderte Originalfiguren auf Kontaktblatt zusammengestellt.')
