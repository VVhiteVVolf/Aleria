from PIL import Image,ImageDraw,ImageFont
from pathlib import Path
root=Path(r'E:\Aleria\diagnostics\venalys-20261102');im=Image.open(r'C:\Users\fhg_r\Downloads\Venalys\Venalys Normal.png').convert('RGB')
coords=[(565,219),(576,329),(657,360),(823,600),(866,834),(1010,742),(1465,596),(1290,759),(1792,876),(1786,1130)]
canvas=Image.new('RGB',(1200,480),'white');draw=ImageDraw.Draw(canvas);font=ImageFont.truetype(r'C:\Windows\Fonts\arial.ttf',18)
for i,(x,y) in enumerate(coords):
 px=x/2400*8192;py=y/1376*4698
 crop=im.crop((int(px-90),int(py-90),int(px+90),int(py+90)))
 cx=(i%5)*240;cy=(i//5)*240;canvas.paste(crop,(cx,cy));draw.text((cx+5,cy+185),f'{x}, {y}',font=font,fill='black')
canvas.save(root/'poi-identification.jpg',quality=97)