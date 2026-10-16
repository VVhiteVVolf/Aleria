"""Read body TRI shape tables and compare paired output with preserved build receipts."""
import collections
import hashlib
import json
import struct
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from inventory import OUT, normalized

def tri_table(path):
    with open(path,'rb') as stream:
        def read(fmt):
            size=struct.calcsize('<'+fmt);data=stream.read(size)
            if len(data)!=size:raise ValueError('Truncated TRI')
            return struct.unpack('<'+fmt,data)[0]
        def name():return stream.read(read('B')).decode('utf-8',errors='replace')
        signature=stream.read(4)
        if signature!=b'PIRT':return {'valid':False,'error':'Not a packed BodySlide body TRI'}
        shapes=[]
        for _ in range(read('H')):
            shape=name();morphs=[]
            for _ in range(read('H')):
                morphs.append(name());read('f');count=read('H');stream.seek(count*8,1)
                if stream.tell()>Path(path).stat().st_size:raise ValueError('TRI vertex data extends beyond file')
            shapes.append({'name':shape,'morphs':morphs})
        return {'valid':True,'shapes':shapes}

def main():
    inv=json.loads((OUT/'inventory.json').read_text(encoding='utf-8'))
    data=json.loads((OUT/'projects.json').read_text(encoding='utf-8'))
    baselines={}
    for directory,mod in [('Twisted-OBody-20260919','Twisted - Nolvus OBody BodySlide Output'),('Twisted-Outfits-20260919','Twisted - Nolvus Outfit OBody Output'),('Twisted-Outfits-20260923','Twisted - Additional Outfits OBody Output 20260923')]:
        path=Path(inv['instance'])/'MODS'/directory/'output-files-sha256.json'
        if path.exists():
            for row in json.loads(path.read_text(encoding='utf-8')):baselines[(mod,normalized(row['path']))]=row['sha256']
    targets={}
    for project in data['projects']:
        for mesh in project['meshes']:
            for binding in mesh.get('morph_bindings',[]):
                if binding['provider']:targets[binding['relative']]=binding['provider']
    def inspect(item):
        relative,provider=item
        try:
            result=tri_table(provider['path'])
            expected=baselines.get((provider['mod'],relative))
            if expected:
                with open(provider['path'],'rb') as f:digest=hashlib.file_digest(f,'sha256').hexdigest()
                result['recorded_output_hash_match']=digest==expected
            return relative,result
        except Exception as error:return relative,{'valid':False,'error':str(error)}
    with ThreadPoolExecutor(max_workers=4) as pool:tables=dict(pool.map(inspect,targets.items()))
    rows=[]
    for index,project in enumerate(data['projects']):
        details=[]
        for mesh in project['meshes']:
            shapes={s['name'] for s in mesh.get('inspection',{}).get('shapes',[])}
            bindings=[]
            for binding in mesh.get('morph_bindings',[]):
                provider=binding['provider'];table=tables.get(binding['relative'],{'valid':False,'error':'Missing TRI'})
                matching=sorted(shapes & {s['name'] for s in table.get('shapes',[])})
                bindings.append({'relative':binding['relative'],'exists':bool(provider),'valid':table['valid'],'matching_shapes':matching,'table':table,'different_provider':bool(provider and mesh['provider']['mod']!=provider['mod']),'mesh_newer_than_tri':bool(provider and mesh['provider']['mtime_ns']>provider['mtime_ns'])})
            details.append({'relative':mesh['relative'],'exists':bool(mesh['provider']),'bindings':bindings,'usable_shape_link':any(b['valid'] and b['matching_shapes'] for b in bindings),'partial_stale_links':any(not b['valid'] for b in bindings) and any(b['valid'] and b['matching_shapes'] for b in bindings)})
        rows.append({'index':index,'name':project['name'],'provider':project['provider'],'output':project['output'],'meshes':details,'usable_shape_links':bool(details) and all(m['usable_shape_link'] for m in details),'partial_stale_links':any(m['partial_stale_links'] for m in details),'zeroed_pair_verified':project['zeroed_build'].startswith('verified') and bool(details) and all(any(b['table'].get('recorded_output_hash_match') is True and b['matching_shapes'] for b in m['bindings']) for m in details)})
    result={'tri_tables':tables,'projects':rows,'summary':{'unique_tri_files_read':len(tables),'invalid_tri_tables':sum(not t['valid'] for t in tables.values()),'unchanged_recorded_tri_files':sum(t.get('recorded_output_hash_match') is True for t in tables.values()),'usable_shape_link_project_definitions':sum(r['usable_shape_links'] for r in rows),'partial_stale_link_project_definitions':sum(r['partial_stale_links'] for r in rows),'verified_zeroed_pairs_project_definitions':sum(r['zeroed_pair_verified'] for r in rows)}}
    (OUT/'morph-details.json').write_text(json.dumps(result,ensure_ascii=False),encoding='utf-8')
    print(json.dumps(result['summary'],indent=2),flush=True)

if __name__=='__main__':main()
