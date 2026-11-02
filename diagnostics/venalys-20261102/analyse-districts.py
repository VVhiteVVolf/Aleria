from PIL import Image, ImageFilter, ImageDraw, ImageFont
from pathlib import Path
from collections import deque
import json, math
root=Path(r'E:\Aleria\diagnostics\venalys-20261102')
im=Image.open(root/'map-districts.jpg').convert('RGB'); im.thumbnail((1200,1200)); w,h=im.size
mask=Image.new('L',im.size)
mask.putdata([255 if r>150 and g<85 and b<85 else 0 for r,g,b in im.getdata()])
mask=mask.filter(ImageFilter.MaxFilter(7));mask.save(root/'district-barriers.png')
a=bytearray(mask.tobytes());seen=bytearray(len(a)); components=[]
for y in range(30,410):
 for x in range(300,820):
  start=y*w+x
  if a[start] or seen[start]:continue
  q=deque([start]);seen[start]=1; pixels=[];external=False
  while q:
   n=q.popleft();xx=n%w;yy=n//w;pixels.append((xx,yy))
   if xx==0 or yy==0 or xx==w-1 or yy==h-1:external=True
   for nn in (n-1,n+1,n-w,n+w):
    if 0<=nn<len(a) and not a[nn] and not seen[nn]:seen[nn]=1;q.append(nn)
  if not external and len(pixels)>180:components.append(pixels)
components.sort(key=lambda p:(sum(y for x,y in p)/len(p)//50,sum(x for x,y in p)/len(p)))
canvas=im.copy();draw=ImageDraw.Draw(canvas)
font=ImageFont.truetype(r'C:\Windows\Fonts\arialbd.ttf',17)
records=[]
for i,pixels in enumerate(components,1):
 cx=sum(x for x,y in pixels)/len(pixels);cy=sum(y for x,y in pixels)/len(pixels)
 draw.ellipse((cx-13,cy-13,cx+13,cy+13),fill='white',outline='black',width=2);draw.text((cx,cy),str(i),font=font,fill='black',anchor='mm')
 records.append({'id':i,'count':len(pixels),'centre':[cx,cy],'pixels':pixels})
canvas.save(root/'district-components.jpg',quality=98)
(root/'district-components.json').write_text(json.dumps({'width':w,'height':h,'components':records}),encoding='utf-8')
print([(r['id'],r['count'],[round(v,1) for v in r['centre']]) for r in records])