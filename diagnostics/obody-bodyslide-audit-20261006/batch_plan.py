"""Select one project per output without rebuilding or assuming a physics variant."""
import collections
import json
from pathlib import Path
from inventory import OUT, normalized

CORE={
    'meshes/actors/character/character assets/femalebody':'CBBE 3BBB Body Amazing',
    'meshes/actors/character/character assets/femalehands':'Hands Redone F Hands',
    'meshes/actors/character/character assets/femalefeet':'CBBE 3BBB Feet',
    'meshes/actors/character/character assets/malebody':'HIMBO Body - SOS High Poly Phys CBPC',
    'meshes/actors/character/character assets/malehands':'HIMBO Hands',
    'meshes/actors/character/character assets/malefeet':'HIMBO Feet',
}

def exclusion_reason(project):
    content=(project['output']+' '+project['name']).lower()
    if project['role'] in {'collision resource','head/hair/accessory'} or any(t in content for t in ['facepart','headarmorpart','high poly head','smp head']):
        return 'Head/hair/accessory/collision resource: separate appearance/physics workflow'
    if any(t in content for t in ['amulet','necklace','ring_','hairpin','crown','tiara','helmet',' hood','hood ','blindfold','headwrap']):
        return 'Headwear/jewelry: fixed-shape or separate head-fit exception; no general body batch'
    if any(t in content for t in ['[tng]','the new gentleman','dragon aspect']):
        return 'Framework-owned genital / special spell-effect geometry: preserve separate implementation'
    if not project['morph_slider_count']:return 'No deforming sliders; no universal OBody rebuild'
    if not project['source_provider']:return 'Source NIF missing'
    return None

def make_plan(inv,projects):
    old={}
    for directory,file in [('Twisted-OBody-20260919','build-plan.json'),('Twisted-Outfits-20260919','plan.json')]:
        path=Path(inv['instance'])/'MODS'/directory/file
        if path.exists():
            for p in json.loads(path.read_text(encoding='utf-8'))['projects']:old[normalized(p['output'])]=p['name']
    groups=collections.defaultdict(list)
    for index,p in enumerate(projects):groups[p['output']].append((index,p))
    chosen=[];excluded=[];ambiguous=[]
    for output,options in groups.items():
        core=CORE.get(output)
        eligible=[(i,p) for i,p in options if not exclusion_reason(p) and (p['classification'] in {'3BA / 3BBB','HIMBO'} or p['name']=='Hands Redone F Hands')]
        preferred=core or old.get(output)
        match=[(i,p) for i,p in eligible if p['name']==preferred]
        verified=bool(match) and (bool(core) or any(p['zeroed_build'].startswith('verified') for _,p in match))
        selection=match[0] if len(match)==1 and verified else eligible[0] if len(eligible)==1 else None
        if selection:
            index,p=selection
            defaults=[s['name'] for s in p['sliders'] if s['zap'].lower()!='true' and s['hidden'].lower()!='true' and (float(s['default'])!=0 or float(s['defaultlow'])!=0)]
            if defaults:
                ambiguous.append({'output':output,'options':[{'index':index,'name':p['name'],'provider':p['provider'],'osp_path':p['osp_path']}],'reason':'Nonzero visible project defaults require checking preset overrides/base geometry: '+', '.join(defaults)})
                for other_index,other in options:
                    if other_index!=index:excluded.append({'index':other_index,'name':other['name'],'provider':other['provider'],'output':output,'reason':'Alternative to manually reviewed '+p['name']})
                continue
            chosen.append({'index':index,'name':p['name'],'provider':p['provider'],'output':output,'osp_path':p['osp_path'],'family':'male' if p['classification']=='HIMBO' else 'female','reason':'Preserved documented build choice' if len(match)==1 and verified else 'Only compatible project for this output'})
            for other_index,other in options:
                if other_index!=index:excluded.append({'index':other_index,'name':other['name'],'provider':other['provider'],'output':output,'reason':'Alternative output collision; select '+p['name']})
        elif eligible:
            ambiguous.append({'output':output,'options':[{'index':i,'name':p['name'],'provider':p['provider'],'osp_path':p['osp_path']} for i,p in eligible],'reason':'Multiple compatible physics/zap/project variants; no verified unique selection'})
            for i,p in options:
                if (i,p) not in eligible:excluded.append({'index':i,'name':p['name'],'provider':p['provider'],'output':output,'reason':exclusion_reason(p) or 'CBBE-only / unsupported alternative'})
        else:
            for i,p in options:excluded.append({'index':i,'name':p['name'],'provider':p['provider'],'output':output,'reason':exclusion_reason(p) or 'CBBE-only / unsupported body; conversion or deliberate separate selection needed'})
    assert len({p['output'] for p in chosen})==len(chosen)
    assert sum(len(a['options']) for a in ambiguous)+len(chosen)+len(excluded)==len(projects)
    return {'selected':chosen,'excluded':excluded,'ambiguous':ambiguous,'executed':False}

def write_plan(plan):
    lines=['OBODY BATCH-BUILD PLAN — NOT EXECUTED','Current zeroed body choices preserved; one selected project per output.','Female preset: - Zeroed Sliders -; male preset: HIMBO Zero for OBody.','Build Morphs ON, both weights; preserve intentional zaps, do not choose a named body-shape preset.','Use current profile VFS with current SliderSets/ShapeData, not a 20260919 snapshot catalog.','Generate separate new female and male output mods; verify meshes/TRI before activation.','Exclude head/hair/collision projects, and preserve existing NPC/body/hand repair winners.','Manual ambiguity section must be resolved before a complete batch.','']
    for family,title in [('female','A) FEMALE 3BA + Hands Redone hand exception'),('male','B) MALE HIMBO')]:
        lines.append(title)
        for p in sorted((x for x in plan['selected'] if x['family']==family),key=lambda x:x['output']):lines.append('[x] '+p['name']+' | '+p['provider']+' | '+p['output']+' | '+p['reason'])
        lines.append('')
    lines.append('C) EXACT EXCLUSIONS')
    for p in sorted(plan['excluded'],key=lambda x:x['output']):lines.append('[ ] '+p['name']+' | '+p['provider']+' | '+p['output']+' | '+p['reason'])
    lines.extend(['','D) AMBIGUOUS — DO NOT AUTOMATICALLY BUILD'])
    for group in plan['ambiguous']:
        lines.append(group['output']+' | '+group['reason'])
        for p in group['options']:lines.append('  [?] '+p['name']+' | '+p['provider']+' | '+p['osp_path'])
    (OUT/'obody_recommended_batchbuild.txt').write_text('\n'.join(lines)+'\n',encoding='utf-8')
    (OUT/'batch-plan.json').write_text(json.dumps(plan,ensure_ascii=False,indent=2),encoding='utf-8')
