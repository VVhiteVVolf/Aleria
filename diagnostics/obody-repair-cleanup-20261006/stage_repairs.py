from pathlib import Path
import hashlib
import json
import shutil
import sys
import xml.etree.ElementTree as ET
from nif_links import normalize_bodytri

OUT=Path(__file__).parent
AUDIT=OUT.parent/'obody-bodyslide-audit-20261006'
sys.path.insert(0,str(AUDIT))
from inventory import normalized
from nif_inspection import inspect_nif
from morph_details import tri_table

MOD_NAME='Local - OBody Outfit Repairs 20261006'

def main():
    inv=json.loads((AUDIT/'inventory.json').read_text(encoding='utf-8'))
    projects=json.loads((AUDIT/'projects.json').read_text(encoding='utf-8'))['projects']
    morph=json.loads((AUDIT/'morph-details.json').read_text(encoding='utf-8'))['projects']
    plan=json.loads((OUT/'repair-build-plan.json').read_text(encoding='utf-8'))
    stage=OUT/'mod-stage'
    if stage.exists():raise FileExistsError(stage)
    stage.mkdir();generated=[];fixed_exceptions=[];changes=[];overridden=[]
    for record in plan['projects']:
        base=OUT/'generated'/record['family'];tri=base/(record['output']+'.tri')
        table=tri_table(tri)
        if not table['valid']:raise ValueError('Invalid generated TRI: '+str(tri))
        for suffix in ['_0.nif','_1.nif'] if record['weights'] else ['.nif']:
            relative=record['output']+suffix;source=base/relative
            data=source.read_bytes()
            if table['shapes']:data,edits=normalize_bodytri(data,record['output']+'.tri')
            else:edits=[]
            destination=stage/relative;destination.parent.mkdir(parents=True,exist_ok=True);destination.write_bytes(data)
            info=inspect_nif(destination)
            if table['shapes']:
                shapes={s['name'] for s in info['shapes']}&{s['name'] for s in table['shapes']}
                assert shapes and all(normalized(x)==record['output'].removeprefix('meshes/')+'.tri' for x in info['bodytri'])
            old=inv['files'].get(relative,[None])[0]
            if old:overridden.append({'relative':relative,'provider':old,'sha256':hashlib.sha256(Path(old['path']).read_bytes()).hexdigest()})
        destination=stage/(record['output']+'.tri');destination.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(tri,destination)
        generated.append(record|{'tri_shapes':len(table['shapes'])})
        if not table['shapes']:fixed_exceptions.append(record['name'])
    patched=set()
    for project,detail in zip(projects,morph):
        if not detail['partial_stale_links']:continue
        for mesh in project['meshes']:
            if not mesh['provider'] or mesh['relative'] in patched:continue
            valid=[b for b in mesh['morph_bindings'] if b['provider'] and b['inspection']['valid_bodymorph_signature']]
            if not valid:continue
            relative=mesh['relative'];original=Path(mesh['provider']['path']).read_bytes()
            data,edits=normalize_bodytri(original,valid[-1]['relative'])
            if not edits:continue
            destination=stage/relative;destination.parent.mkdir(parents=True,exist_ok=True);destination.write_bytes(data)
            patched.add(relative);changes.append({'relative':relative,'source':mesh['provider']['path'],'source_sha256':hashlib.sha256(original).hexdigest(),'new_sha256':hashlib.sha256(data).hexdigest(),'edits':edits,'geometry_blocks_unchanged':True})
            overridden.append({'relative':relative,'provider':mesh['provider'],'sha256':hashlib.sha256(original).hexdigest()})
    broken=Path(inv['instance'])/'MODS/mods/Dark Brotherhood Armor - HIMBO/CalienteTools/BodySlide/SliderGroups/HIMBO - 4thunknown\'s DB.xml'
    text=broken.read_text(encoding='utf-8-sig').replace('&apos"','&apos;"')
    ET.fromstring(text)
    relative=broken.relative_to(Path(inv['instance'])/'MODS/mods/Dark Brotherhood Armor - HIMBO')
    target=stage/relative;target.parent.mkdir(parents=True,exist_ok=True);target.write_text(text,encoding='utf-8')
    # Provide current-profile build groups, excluding unproven shared-output variants.
    batch=json.loads((AUDIT/'batch-plan.json').read_text(encoding='utf-8'))
    groups=ET.Element('SliderGroups')
    for family in ['female','male']:
        group=ET.SubElement(groups,'Group',{'name':'Local OBody Current '+family})
        for item in batch['selected']:
            if item['family']==family:ET.SubElement(group,'Member',{'name':item['name']})
    ET.ElementTree(groups).write(stage/'CalienteTools/BodySlide/SliderGroups/Local OBody Current.xml',encoding='utf-8',xml_declaration=True)
    (stage/'meta.ini').write_text('[General]\nmodid=0\nversion=2026.10.6\ncomments=Targeted zeroed outfit builds, verified BODYTRI reference fixes and group XML repair. No plugins or behavior files.\n',encoding='utf-8')
    result={'mod_name':MOD_NAME,'generated_projects':generated,'fixed_accessory_exceptions':fixed_exceptions,'nif_link_repairs':changes,'overridden_files_before':overridden,'xml_group_repaired':str(relative),'original_body_meshes_modified':False}
    (OUT/'repair-stage.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'generated_projects':len(generated),'fixed_accessory_exceptions':fixed_exceptions,'nif_link_repairs':len(changes),'staged_files':sum(1 for f in stage.rglob('*') if f.is_file())},indent=2))

if __name__=='__main__':main()
