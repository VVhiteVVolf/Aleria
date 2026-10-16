from pathlib import Path
import collections
import hashlib
import json
import sys
import xml.etree.ElementTree as ET
from inventory import OUT, normalized
from nif_inspection import inspect_nif, inspect_tri

sys.stdout.reconfigure(encoding='utf-8')

def main():
    inventory=json.loads((OUT/'inventory.json').read_text(encoding='utf-8'))
    files=inventory['files'];groups=collections.defaultdict(set);errors=[];cache={}
    def nif(path):
        if path not in cache:
            try:cache[path]=inspect_nif(path)
            except Exception as error:cache[path]={'error':str(error)}
        return cache[path]
    for relative,providers in files.items():
        if '/slidergroups/' not in relative or not relative.endswith('.xml'):continue
        try:
            tree=ET.parse(providers[0]['path'])
            for group in tree.findall('.//Group'):
                for member in group.findall('Member'):groups[member.get('name','')].add(group.get('name',''))
        except Exception as error:errors.append({'file':providers[0]['path'],'error':str(error)})
    projects=[]
    for relative,providers in files.items():
        if '/slidersets/' not in relative or not relative.endswith(('.osp','.xml')):continue
        provider=providers[0]
        try:tree=ET.parse(provider['path'])
        except Exception as error:errors.append({'file':provider['path'],'error':str(error)});continue
        for element in tree.findall('.//SliderSet'):
            name=element.get('name',''); output_file=element.find('OutputFile')
            if output_file is None:continue
            output=normalized((element.findtext('OutputPath') or '')+'/'+(output_file.text or ''))
            source=normalized('CalienteTools/BodySlide/ShapeData/'+(element.findtext('DataFolder') or '')+'/'+(element.findtext('SourceFile') or ''))
            src=files.get(source,[None])[0]
            source_info=nif(src['path']) if src else {}
            sliders=[{'name':s.get('name',''),'zap':s.get('zap','false'),'hidden':s.get('hidden','false'),'default':s.get('default','0'),'defaultlow':s.get('defaultlow',s.get('default','0'))} for s in element.findall('Slider')]
            slider_names={s['name'] for s in sliders}
            names=' '.join([name,*groups[name],*(s['name'] for s in source_info.get('shapes',[]))]).lower()
            bones=' '.join(source_info.get('bones',[])).lower()
            classification='unsupported / unknown'; basis=[]
            if {'ArmsBiceps','TorsoMass'} & slider_names or 'himbo' in names:
                classification='HIMBO';basis=['HIMBO slider/group/source-shape signature']
            elif any(t in names for t in ['bhunp','uunp','touched by dibella','(tbd)','ube']):
                classification='unsupported / alternate body';basis=['Other body family in project/group/source shapes']
            elif any(t in bones for t in ['breast01','breast02','breast03']) or any(t in names for t in ['3ba','3bbb']):
                classification='3BA / 3BBB';basis=['3BA/3BBB project/group or multi-bone breast source']
            elif any(s.startswith('Breast') for s in slider_names) or 'cbbe' in names:
                classification='CBBE only';basis=['CBBE morph/group/source signature without established 3BA support']
            if any(t in names for t in ['collision resource','collision box','collision body']):role='collision resource'
            elif output.endswith(('/femalebody','/femalehands','/femalefeet','/malebody','/malehands','/malefeet')):role='core body'
            elif any(t in output for t in ['hair','headparts','highpolyhead','earring']):role='head/hair/accessory'
            else:role='outfit / other mesh'
            weights=output_file.get('GenWeights','true').lower()=='true'
            suffixes=['_0.nif','_1.nif'] if weights else ['.nif']
            meshes=[]
            for suffix in suffixes:
                mesh=files.get(output+suffix,[None])[0]
                if mesh:
                    info=nif(mesh['path'])
                    bindings=[]
                    for binding in info.get('bodytri',[]):
                        binding=normalized(binding)
                        if not binding.startswith('meshes/'):binding='meshes/'+binding
                        tri=files.get(binding,[None])[0]
                        valid=inspect_tri(tri['path']) if tri else None
                        bindings.append({'relative':binding,'provider':tri,'inspection':valid})
                    meshes.append({'relative':output+suffix,'provider':mesh,'inspection':info,'morph_bindings':bindings})
                else:meshes.append({'relative':output+suffix,'provider':None,'archive_check_pending':True})
            morph_sliders=[s['name'] for s in sliders if s['zap'].lower()!='true']
            tri=files.get(output+'.tri',[None])[0]
            morph_status='no morph sliders / exception' if not morph_sliders else 'usable linked TRI' if meshes and all(m.get('morph_bindings') and all(b['provider'] and b['inspection']['valid_bodymorph_signature'] for b in m['morph_bindings']) for m in meshes) else 'missing or unusable morph link / output'
            projects.append({'name':name,'provider':provider['mod'],'osp_path':provider['path'],'osp_relative':relative,'output':output,'weights':weights,'source_relative':source,'source_provider':src,'source_inspection':source_info,'sliders':sliders,'morph_slider_count':len(morph_sliders),'groups':sorted(groups[name]),'classification':classification,'classification_basis':basis,'role':role,'meshes':meshes,'tri_at_expected_output':tri,'morph_status':morph_status,'zeroed_build':'unknown; mesh files do not record the build preset'})
    # Hash comparisons with recorded zeroed builds establish provenance without rebuilding.
    for report_name,output_mod in [('Twisted-OBody-20260919','Twisted - Nolvus OBody BodySlide Output'),('Twisted-Outfits-20260919','Twisted - Nolvus Outfit OBody Output'),('Twisted-Outfits-20260923','Twisted - Additional Outfits OBody Output 20260923')]:
        report=Path(inventory['instance'])/'MODS'/report_name/'output-files-sha256.json'
        if not report.exists():continue
        entries=json.loads(report.read_text(encoding='utf-8'))
        baseline={normalized(e['path']):e['sha256'] for e in entries}
        hashes={}
        for project in projects:
            matches=[]
            for mesh in project['meshes']:
                provider=mesh['provider'];expected=baseline.get(mesh['relative'])
                if not provider or provider['mod']!=output_mod or not expected:matches.append(False);continue
                if provider['path'] not in hashes:
                    with open(provider['path'],'rb') as f:hashes[provider['path']]=hashlib.file_digest(f,'sha256').hexdigest()
                matches.append(hashes[provider['path']]==expected)
            if matches and all(matches):project['zeroed_build']='verified unchanged recorded zeroed output: '+report_name
        print('Verified recorded output',output_mod,'files hashed',len(hashes),flush=True)
    by_output=collections.defaultdict(list);by_name=collections.defaultdict(list)
    for index,project in enumerate(projects):by_output[project['output']].append(index);by_name[project['name']].append(index)
    conflicts={key:[projects[i]['name'] for i in indexes] for key,indexes in by_output.items() if len(indexes)>1}
    result={'projects':projects,'output_conflicts':conflicts,'duplicate_names':{key:[projects[i]['provider'] for i in indexes] for key,indexes in by_name.items() if len(indexes)>1},'errors':errors,'classification_counts':dict(collections.Counter(p['classification'] for p in projects))}
    (OUT/'projects.json').write_text(json.dumps(result,ensure_ascii=False),encoding='utf-8')
    print(json.dumps({'project_count':len(projects),'classes':result['classification_counts'],'output_conflicts':len(conflicts),'duplicate_names':len(result['duplicate_names']),'morph_status':dict(collections.Counter(p['morph_status'] for p in projects)),'core_body_projects':[{k:p[k] for k in ['name','provider','classification','output','morph_status','zeroed_build']} for p in projects if p['role']=='core body'],'errors':errors},ensure_ascii=False,indent=2),flush=True)

if __name__=='__main__':main()
