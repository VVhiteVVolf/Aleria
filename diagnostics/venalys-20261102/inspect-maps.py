from PIL import Image
from pathlib import Path
import json
source=Path(r'C:\Users\fhg_r\Downloads\Venalys')
output=Path(r'E:\Aleria\diagnostics\venalys-20261102')
output.mkdir(parents=True,exist_ok=True)
for name,slug in [('Venalys Normal.png','map-normal'),('Venalys (Bezirke).png','map-districts')]:
 im=Image.open(source/name).convert('RGB')
 print(name,im.size)
 im.thumbnail((2400,2400))
 im.save(output/(slug+'.jpg'),quality=95)