"""Check generated meshes, packed TRI tables and actual BODYTRI shape correspondence."""
from pathlib import Path
import json
import shutil
import sys
OUT=Path(__file__).parent
sys.path.insert(0,str(OUT.parent/'obody-bodyslide-audit-20261006'))
sys.path.insert(0,str(OUT.parent/'obody-repair-cleanup-20261006'))
from nif_inspection import inspect_nif
from morph_details import tri_table
from nif_links import normalize_bodytri

def main():
    plan=json.loads((OUT/'build-plan.json').read_text(encoding='utf-8'));rows=[];missing=[];fixed=[];links=[]
    target=OUT/'mod-stage/Local - New Downloads OBody Output 20261006'
    target.mkdir(exist_ok=True)
    for p in plan['projects']:
        base=OUT/'generated'/p['family'];tri=base/(p['output']+'.tri');suffixes=['_0.nif','_1.nif'] if p['weights'] else ['.nif']
        paths=[base/(p['output']+s) for s in suffixes]
        if not tri.is_file() or not all(f.is_file() for f in paths):missing.append(p['name']);continue
        table=tri_table(tri)
        if not table['valid']:raise RuntimeError('Bad TRI '+str(tri))
        status='usable morphs' if any(s['morphs'] for s in table['shapes']) else 'rigid accessory; no morph deltas'
        for mesh in paths:
            info=inspect_nif(mesh);shape_names={s['name'] for s in info['shapes']}
            if status=='usable morphs' and not shape_names&{s['name'] for s in table['shapes']}:raise RuntimeError('Shape mismatch '+str(mesh))
            data,changes=normalize_bodytri(mesh.read_bytes(),p['output']+'.tri')
            if changes:mesh.write_bytes(data);links.append({'mesh':str(mesh),'changes':changes})
            if status=='usable morphs' and not inspect_nif(mesh)['bodytri']:raise RuntimeError('Missing BODYTRI '+str(mesh))
            dst=target/mesh.relative_to(base);dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(mesh,dst)
        dst=target/tri.relative_to(base);dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(tri,dst)
        rows.append({'name':p['name'],'output':p['output'],'family':p['family'],'status':status})
        if status!='usable morphs':fixed.append(p['name'])
    if missing:raise RuntimeError('Build outputs missing '+repr(missing))
    result={'verified':True,'projects':rows,'count':len(rows),'usable_morphs':len(rows)-len(fixed),'rigid_accessories':fixed,'normalized_links':links,'output_mod':str(target)}
    (OUT/'build-validation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'verified':True,'projects':len(rows),'usable_morphs':len(rows)-len(fixed),'rigid_accessories':len(fixed),'normalized_links':len(links)},indent=2))

if __name__=='__main__':main()
