from pathlib import Path
from PIL import Image, ImageDraw
import numpy as np
import json

root=Path(__file__).resolve().parent
im=Image.open(root/'source-originals/map.png').convert('RGB')
a=np.array(im)
mask=(a.min(axis=2)>250)
ys,xs=np.nonzero(mask)
remaining=set(zip(xs.tolist(),ys.tolist()))
components=[]
while remaining:
    start=remaining.pop();stack=[start];points=[start]
    while stack:
        x,y=stack.pop()
        for p in [(x-1,y),(x+1,y),(x,y-1),(x,y+1)]:
            if p in remaining:remaining.remove(p);stack.append(p);points.append(p)
    if len(points)>1000:
        x,y=zip(*points);box=[min(x),min(y),max(x)+1,max(y)+1]
        if box[2]-box[0]>40 and box[3]-box[1]>40:
            components.append({'pixels':len(points),'box':box,'point':[round((box[0]+box[2])/2/im.width*100,2),round((box[1]+box[3])/2/im.height*100,2)]})
components.sort(key=lambda c:c['point'][1])
(root/'map-markers.json').write_text(json.dumps(components,indent=2)+'\n',encoding='utf8')
print(json.dumps(components))
