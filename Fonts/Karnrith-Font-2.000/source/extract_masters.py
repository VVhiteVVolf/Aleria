"""Trace selected raster glyph drawings into font outlines.
Requires Pillow, numpy, scipy and vtracer. Does not run image generation.
"""
from pathlib import Path
import json
import numpy as np
from PIL import Image
from scipy import ndimage
import vtracer

ROOT=Path(__file__).resolve().parent.parent
QA=ROOT.parent/'qa-karnrith';QA.mkdir(exist_ok=True)
language=json.loads((ROOT/'Sprache/morgar.json').read_text(encoding='utf-8'))
records=[]
for i,r in enumerate(language['roots']):
    records.append(dict(token=r['letter'],name=r['new'],oldName=r['old'],meaning=r['meaning'],ipa=r['ipa'],clanCode=r['code'],
        codepoint=f'U+{0xE500+i:04X}',char=chr(0xE500+i),legacyCodepoint=f'U+{0xE300+i:04X}',legacyCharacter=chr(0xE300+i),glyph=f'rune{i:02}',lore=True))
extras=[dict(token=t,name=None,glyph=g,lore=False) for t,g in [('C','extraC'),('J','extraJ'),('X','extraX'),('ß','extraSharpS')]]
technical=[dict(token=t,glyph=g,name=None,lore=False) for t,g in [(str(i),'digit'+str(i)) for i in range(10)]+[('&','ampersand'),('@','at'),('#','hash'),('$','dollar'),('€','euro'),('§','section')]]
manifest=[]
for i,r in enumerate(records+extras+technical):
    if i<18:
        ref='Tiefenrunen-II.png';im=Image.open(ROOT/'source/references'/ref)
        w,h=im.size;col=i%6;row=i//6;ys=[150,369,592,823]
        bounds=(round(col*w/6),round(ys[row]*h/1024),round((col+1)*w/6),round(ys[row+1]*h/1024))
        source_index=i
    else:
        ref='Ergaenzung-16.png' if i<34 else 'Tastatur-16.png';source_index=i-18 if i<34 else i-34
        im=Image.open(ROOT/'source/references'/ref);w,h=im.size;col=source_index%4;row=source_index//4
        # The image generator's final row begins slightly above a geometric
        # quarter boundary. Split at the actual whitespace, not through caps.
        cuts=[0,322,621,914,1254]
        bounds=(round(col*w/4),round(cuts[row]*h/1254),round((col+1)*w/4),round(cuts[row+1]*h/1254))
    a=np.asarray(im.crop(bounds).convert('L'));mask=a<135
    labels,n=ndimage.label(mask);sizes=np.bincount(labels.ravel());sizes[0]=0;mask=sizes[labels]>=18
    # Preserve intentional counters and cuts, remove only minute paper specks.
    inv,ni=ndimage.label(~mask);ss=np.bincount(inv.ravel());ss[0]=0
    mask|=(ss[inv]<8)&(ss[inv]>0)
    ys,xs=np.nonzero(mask);assert len(xs)>300,(i,ref)
    mask=mask[ys.min():ys.max()+1,xs.min():xs.max()+1];hh,ww=mask.shape
    temp=QA/f'ink-{i:02}.png';Image.fromarray(np.where(np.pad(mask,12),0,255).astype('uint8')).save(temp)
    svg=f'source/glyphs/{i:02}-{r["glyph"]}.svg'
    vtracer.convert_image_to_svg_py(str(temp),str(ROOT/svg),colormode='binary',mode='spline',filter_speckle=3,corner_threshold=65,length_threshold=3,max_iterations=10,splice_threshold=45,path_precision=3)
    r['designSource']='Ausgewählter Entwurf II' if i<18 else 'Generierte Ergänzung im Stil II'
    manifest.append(dict(index=i,glyph=r['glyph'],token=r['token'],reference=ref,sourceIndex=source_index,bounds=bounds,sourcePixels=[ww,hh],svg=svg,variant=None))
(ROOT/'alphabet.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf-8')
(ROOT/'ergaenzungen.json').write_text(json.dumps(extras+technical,ensure_ascii=False,indent=2),encoding='utf-8')
(ROOT/'source/design-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print('50 raster master outlines: 30 lore signs, C J X sharp S, 10 digits and 6 symbols.')
