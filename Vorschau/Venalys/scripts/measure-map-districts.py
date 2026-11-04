"""Measure the thirteen retained Venalys districts from the new red boundaries.

The source map is untouched. The 2200-pixel measurement image is only used to
derive conservative interaction polygons inside the visible red brushstrokes.
"""
from collections import deque
from pathlib import Path
import json
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

REALM = Path(__file__).resolve().parents[1]
ROOT = REALM.parents[1]
SOURCES = REALM / 'sources/map-revision-20261104'
QA = ROOT / 'diagnostics/venalys-map-revision-20261104'
SEEDS = [(1012,89),(1118,89),(1221,90),(856,115),(913,131),(950,217),(1060,169),
         (1232,161),(1012,220),(1174,211),(983,310),(1056,300),(1127,292)]


def area(points):
    return abs(sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(points,points[1:]+points[:1]))) / 2


def outline(points):
    cells = set(points)
    edges = {}
    for x,y in cells:
        for neighbour,a,b in [((x,y-1),(x,y),(x+1,y)),((x+1,y),(x+1,y),(x+1,y+1)),
                              ((x,y+1),(x+1,y+1),(x,y+1)),((x-1,y),(x,y+1),(x,y))]:
            if neighbour not in cells:
                edges.setdefault(a,[]).append(b)
    loops = []
    while edges:
        start = next(iter(edges)); current = start; loop = []
        while True:
            loop.append(current)
            following = edges[current].pop()
            if not edges[current]:
                del edges[current]
            current = following
            if current == start:
                break
        loops.append(loop)
    return max(loops,key=area)


def simplify(points,epsilon=1.5):
    if len(points) < 3:
        return points
    start,end = np.array(points[0]),np.array(points[-1])
    segment = end-start
    if not np.any(segment):
        far = max(range(1,len(points)-1),key=lambda i:np.linalg.norm(np.array(points[i])-start))
        return simplify(points[:far+1],epsilon)[:-1]+simplify(points[far:],epsilon)
    distance = [abs(segment[0]*(point[1]-start[1])-segment[1]*(point[0]-start[0]))/np.linalg.norm(segment) for point in points]
    index = int(np.argmax(distance))
    if distance[index] <= epsilon:
        return [points[0],points[-1]]
    return simplify(points[:index+1],epsilon)[:-1]+simplify(points[index:],epsilon)


def main():
    image = Image.open(REALM / 'sources/originals/map-districts-20261104.png').convert('RGB')
    image.thumbnail((2200,1500),Image.Resampling.LANCZOS)
    rgb = np.asarray(image).astype('int16')
    mask = (rgb[:,:,0]>140)&(rgb[:,:,0]>rgb[:,:,1]*2.1)&(rgb[:,:,0]>rgb[:,:,2]*2.1)
    mask = np.asarray(Image.fromarray((mask*255).astype('uint8')).filter(ImageFilter.MaxFilter(5)))>0
    left,top,right,bottom = 780,25,1315,420
    seen = set(); components = []
    for y in range(top,bottom):
        for x in range(left,right):
            if (x,y) in seen or mask[y,x]:
                continue
            queue = deque([(x,y)]);seen.add((x,y));points = [];border = False
            while queue:
                xx,yy = queue.popleft();points.append((xx,yy))
                border |= xx in (left,right-1) or yy in (top,bottom-1)
                for nx,ny in [(xx+1,yy),(xx-1,yy),(xx,yy+1),(xx,yy-1)]:
                    if left<=nx<right and top<=ny<bottom and (nx,ny) not in seen and not mask[ny,nx]:
                        seen.add((nx,ny));queue.append((nx,ny))
            if not border and len(points)>350:
                components.append(points)
    if len(components) != 13:
        raise ValueError(f'Expected thirteen closed city districts; measured {len(components)}.')
    selected = set();districts = [];draw = ImageDraw.Draw(image)
    font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf',16)
    for number,seed in enumerate(SEEDS,1):
        index = next((i for i,points in enumerate(components) if seed in points),None)
        if index is None or index in selected:
            raise ValueError(f'The retained district identity seed is not uniquely inside its district: {number}')
        selected.add(index);points=components[index]
        centre = [sum(point[axis] for point in points)/len(points) for axis in range(2)]
        loop = outline(points);polygon=simplify(loop+[loop[0]])[:-1]
        districts.append({'id':f'district-{number:02}',
                          'point':[round(value/size*100,5) for value,size in zip(centre,image.size)],
                          'polygon':[[round(x/image.width*100,5),round(y/image.height*100,5)] for x,y in polygon],
                          'measurementSeed':list(seed),'measurementInteriorPixels':len(points)})
        draw.line(polygon+[polygon[0]],fill='#ffff80',width=2)
        draw.text(tuple(centre),str(number),font=font,fill='black',stroke_width=2,stroke_fill='white')
    SOURCES.mkdir(parents=True,exist_ok=True);QA.mkdir(parents=True,exist_ok=True)
    (SOURCES/'district-geometry.json').write_text(json.dumps({'measurementSize':list(image.size),
        'method':'Red boundary mask, 5px boundary dilation, thirteen closed interiors, conservative simplified contours.',
        'districts':districts},ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    image.crop((760,20,1330,425)).resize((1710,1215)).save(QA/'district-polygons.jpg',quality=95)
    print(json.dumps({'districts':len(districts),'retainedIds':len(selected)}))


if __name__ == '__main__':
    main()
