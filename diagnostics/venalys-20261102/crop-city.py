from PIL import Image
from pathlib import Path
root=Path(r'E:\Aleria\diagnostics\venalys-20261102')
source=Path(r'C:\Users\fhg_r\Downloads\Venalys')
for name,slug in [('Venalys (Bezirke).png','district-city'),('Venalys Normal.png','normal-city')]:
 im=Image.open(source/name).convert('RGB')
 crop=im.crop((2000,150,5550,2750));crop.thumbnail((2000,1600));crop.save(root/(slug+'.jpg'),quality=98)