from PIL import Image,ImageDraw,ImageFont
from pathlib import Path
import json
root=Path(r'E:\Aleria\diagnostics\venalys-20261102')
coords={
'T':[(565,219),(657,360),(823,600),(1191,819),(1629,328),(1290,759)],
'A':[(576,329),(583,454),(619,568),(794,787),(866,834),(1002,917),(1118,966),(1010,742),(1465,596),(1656,619),(1407,987),(1614,1074),(1644,1137),(1826,1136)],
'D':[(669,475),(720,584),(819,713),(748,841),(1031,811),(1686,224),(1674,428),(1623,524),(1906,548),(1761,597),(1545,632),(1831,758),(1341,856),(1875,993),(1700,1089)],
'W':[(1438,711)],
'F':[(508,546),(518,770),(865,972),(1027,1008),(1697,132),(1825,454),(1690,710),(2040,995),(1571,1008)],
'R':[(571,834),(659,877),(1115,1067),(1912,780),(1564,769),(1444,1095),(1627,1235),(1302,1146)],
'S':[(510,378),(614,728),(944,856),(1077,891),(1211,1086),(1616,188),(1743,325),(2029,508),(1944,672),(1672,847),(1920,878),(1280,1017),(1528,1175),(1392,1216),(1764,1228)],
'K':[(638,641),(1544,910),(1717,944),(1825,1053)],
'C':[(1792,876)],
'B':[(1506,1324)],
'M':[(1991,1080),(1940,1162),(1836,1271),(1634,1350)]
}
items=[]
for kind,points in coords.items():
 for index,(x,y) in enumerate(points,1):items.append({'key':f'{kind}{index:02}','kind':kind,'point':[x,y]})
im=Image.open(root/'map-normal.jpg').convert('RGB');draw=ImageDraw.Draw(im);font=ImageFont.truetype(r'C:\Windows\Fonts\arialbd.ttf',17)
for item in items:
 x,y=item['point'];draw.ellipse((x-10,y-10,x+10,y+10),outline='red',width=2);draw.text((x+11,y-17),item['key'],font=font,fill='black',stroke_fill='white',stroke_width=2)
im.save(root/'poi-inventory.jpg',quality=98)
(root/'poi-inventory.json').write_text(json.dumps(items,indent=2),encoding='utf-8')
for slug,box in [('west',(440,150,1250,1140)),('east-north',(1410,70,2090,810)),('east-south',(1250,690,2090,1376))]:im.crop(box).save(root/('poi-marked-'+slug+'.jpg'),quality=98)
print('Count',len(items),{k:len(v) for k,v in coords.items()})