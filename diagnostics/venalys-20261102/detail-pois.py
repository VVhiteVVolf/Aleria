from PIL import Image
from pathlib import Path
im=Image.open(r'C:\Users\fhg_r\Downloads\Venalys\Venalys Normal.png').convert('RGB')
root=Path(r'E:\Aleria\diagnostics\venalys-20261102')
for name,box in [('estates-southeast',(1750,1050,1900,1190)),('west-south-border',(1150,950,1340,1200)),('northwest-border',(450,150,650,420)),('south-castle',(1420,1240,1670,1376))]:
 factor=8192/2400
 im.crop(tuple(round(v*factor) for v in box)).save(root/(name+'.jpg'),quality=98)