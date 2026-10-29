from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

directory=Path(__file__).resolve().parent
workspace=directory.parents[3]
ids=['halfax','beran','irwynne','aubigny','trent','edwynne']
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',21)

def tile(path,size=(360,540)):
    with Image.open(path) as source:
        image=source.convert('RGBA')
        image.thumbnail((size[0]-18,size[1]-18),Image.Resampling.LANCZOS)
    result=Image.new('RGBA',size,'#ede8dd')
    result.alpha_composite(image,((size[0]-image.width)//2,(size[1]-image.height)//2))
    return result.convert('RGB')

sheet=Image.new('RGB',(1080,1160),'#ede8dd')
draw=ImageDraw.Draw(sheet)
comparison=Image.new('RGB',(720,3480),'#ede8dd')
labels=ImageDraw.Draw(comparison)
for i,id in enumerate(ids):
    production=workspace/f'Vorschau/Aeldrunmar/assets/warriors/production/{id}.png'
    image=tile(production)
    x,y=i%3*360,i//3*580
    sheet.paste(image,(x,y))
    draw.text((x+15,y+546),id.capitalize(),font=font,fill='#303128')
    comparison.paste(tile(directory/f'before/{id}/production.png'),(0,i*580))
    comparison.paste(image,(360,i*580))
    labels.text((15,i*580+546),id.capitalize()+' vorher',font=font,fill='#303128')
    labels.text((375,i*580+546),id.capitalize()+' jetzt',font=font,fill='#303128')
sheet.save(directory/'final-six-contact.jpg',quality=95)
comparison.save(directory/'before-after.jpg',quality=95)
