from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import collections
import json
import re
from inventory import OUT, normalized
from nif_inspection import inspect_nif
from archive_mesh import read_entry

def main():
    inv=json.loads((OUT/'inventory.json').read_text(encoding='utf-8'))
    projects=json.loads((OUT/'projects.json').read_text(encoding='utf-8'))['projects']
    records=json.loads((OUT/'plugin-records.json').read_text(encoding='utf-8'))
    archive=json.loads((OUT/'archives.json').read_text(encoding='utf-8'))['winning_archive_files']
    by_output=collections.defaultdict(list);by_mesh={};references=collections.defaultdict(list)
    for project in projects:
        by_output[project['output']].append(project)
        for mesh in project['meshes']:
            if mesh['provider']:by_mesh[mesh['relative']]=mesh['inspection']
    for record in records['armor_addons']:
        for key,model in record['models'].items():
            if key not in {'MOD2','MOD3'} or not model:continue
            relative=normalized(model)
            if not relative.startswith('meshes/'):relative='meshes/'+relative
            if not relative.endswith('.nif'):continue
            references[relative].append({'addon':record['identity'],'editor_id':record.get('editor_id'),'plugin':record['plugin'],'provider':record['provider'],'gender':'male' if key=='MOD2' else 'female','slot_mask':record.get('slot_mask',0)})
    def inspect(relative):
        loose=inv['files'].get(relative,[None])[0];bsa=archive.get(relative)
        existing=by_mesh.get(relative)
        info=existing or {}
        try:
            if not existing and loose:info=inspect_nif(loose['path'])
            elif not existing and bsa:info=inspect_nif(read_entry(bsa))
        except Exception as error:info={'error':str(error)}
        output=re.sub(r'_[01]\.nif$','',relative)
        if output==relative:output=relative.removesuffix('.nif')
        options=by_output.get(output,[])
        body_mesh=any(ref['slot_mask']&4 for ref in references[relative])
        classes=sorted({p['classification'] for p in options})
        bindings=[]
        for binding in info.get('bodytri',[]):
            binding=normalized(binding)
            if not binding.startswith('meshes/'):binding='meshes/'+binding
            bindings.append({'relative':binding,'provider':inv['files'].get(binding,[None])[0] or archive.get(binding)})
        has_morph=bool(bindings) and all(b['provider'] for b in bindings)
        status='mesh missing' if not loose and not bsa else 'mesh inspection unknown' if 'error' in info else 'morph-supported' if has_morph else 'body-slot mesh without linked TRI' if body_mesh else 'non-body-slot / fixed equipment exception'
        return {'relative':relative,'references':references[relative],'mesh_provider':loose or bsa,'from_archive':not bool(loose) and bool(bsa),'inspection':info,'projects':[p['name'] for p in options],'classifications':classes,'body_slot':body_mesh,'morph_bindings':bindings,'status':status}
    rows=[]
    with ThreadPoolExecutor(max_workers=4) as pool:
        for index,row in enumerate(pool.map(inspect,references)):
            rows.append(row)
            if index%2000==0:print('ARMA model scan',index,'/',len(references),flush=True)
    mods=collections.defaultdict(lambda:{'female_3ba':set(),'female_cbbe':set(),'male_himbo':set(),'unconverted_body_meshes':set(),'fixed_equipment_meshes':set(),'unknown_meshes':set()})
    for row in rows:
        for ref in row['references']:
            mod=mods[ref['provider']]
            if ref['gender']=='female' and '3BA / 3BBB' in row['classifications']:mod['female_3ba'].add(row['relative'])
            if ref['gender']=='female' and 'CBBE only' in row['classifications'] and '3BA / 3BBB' not in row['classifications']:mod['female_cbbe'].add(row['relative'])
            if ref['gender']=='male' and 'HIMBO' in row['classifications']:mod['male_himbo'].add(row['relative'])
            if row['status']=='body-slot mesh without linked TRI':mod['unconverted_body_meshes'].add(row['relative'])
            elif row['status']=='non-body-slot / fixed equipment exception':mod['fixed_equipment_meshes'].add(row['relative'])
            elif row['status'] in {'mesh missing','mesh inspection unknown'}:mod['unknown_meshes'].add(row['relative'])
    result={'models':rows,'mods':{name:{k:sorted(v) for k,v in data.items()} for name,data in mods.items()},'status_counts':dict(collections.Counter(row['status'] for row in rows))}
    (OUT/'armor-audit.json').write_text(json.dumps(result,ensure_ascii=False),encoding='utf-8')
    print(json.dumps({'unique_referenced_models':len(rows),'armor_mods':len(mods),'statuses':result['status_counts']},indent=2))

if __name__=='__main__':main()
