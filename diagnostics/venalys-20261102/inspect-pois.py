from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
root=Path(r'E:\Aleria\diagnostics\venalys-20261102')
im=Image.open(root/'map-normal.jpg')
font=ImageFont.truetype(r'C:\Windows\Fonts\arial.ttf',14)
for slug,box in [('west',(440,150,1250,1140)),('east-north',(1410,70,2090,810)),('east-south',(1250,690,2090,1376)),('south-west',(750,730,1450,1376))]:
 crop=im.crop(box); draw=ImageDraw.Draw(crop); x0,y0,x1,y1=box
 for x in range((x0//100+1)*100,x1,100):draw.line((x-x0,0,x-x0,y1-y0),fill=(140,140,140),width=1);draw.text((x-x0+2,2),str(x),font=font,fill='black',stroke_width=2,stroke_fill='white')
 for y in range((y0//100+1)*100,y1,100):draw.line((0,y-y0,x1-x0,y-y0),fill=(140,140,140),width=1);draw.text((2,y-y0+2),str(y),font=font,fill='black',stroke_width=2,stroke_fill='white')
 crop.save(root/('poi-'+slug+'.jpg'),quality=98)