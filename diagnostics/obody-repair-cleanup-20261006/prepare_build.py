"""Compile only missing equipped outputs and genuine morph gaps into a fresh catalog."""
from pathlib import Path
import copy
import hashlib
import json
import shutil
import sys
import xml.etree.ElementTree as ET

OUT=Path(__file__).parent
AUDIT=OUT.parent/'obody-bodyslide-audit-20261006'
sys.path.insert(0,str(AUDIT))
from inventory import normalized

def main():
    inv=json.loads((AUDIT/'inventory.json').read_text(encoding='utf-8'))
    data=json.loads((AUDIT/'projects.json').read_text(encoding='utf-8'))['projects']
    armor=json.loads((AUDIT/'armor-audit.json').read_text(encoding='utf-8'))['models']
    morph=json.loads((AUDIT/'morph-details.json').read_text(encoding='utf-8'))['projects']
    plan=json.loads((AUDIT/'batch-plan.json').read_text(encoding='utf-8'))
    chosen={p['output']:p['index'] for p in plan['selected']}
    by_output={}
    for index,p in enumerate(data):by_output.setdefault(p['output'],[]).append(index)
    selected=set()
    for row in armor:
        output=row['relative'].removesuffix('_1.nif').removesuffix('_0.nif').removesuffix('.nif')
        eligible=[i for i in by_output.get(output,[]) if data[i]['classification'] in {'3BA / 3BBB','HIMBO'}]
        if not eligible:continue
        if row['status']=='mesh missing':
            sexes={r['gender'] for r in row['references']}
            desired='HIMBO' if sexes=={'male'} else '3BA / 3BBB'
            matches=[i for i in eligible if data[i]['classification']==desired]
            if not matches:continue
            candidate=chosen.get(output)
            if candidate not in matches:
                if len(matches)!=1:continue
                candidate=matches[0]
            selected.add(candidate)
        elif output in chosen and not morph[chosen[output]]['usable_shape_links']:
            selected.add(chosen[output])
    # Rebuild all referenced parts of these missing outfits, including rigid headwear.
    for index,p in enumerate(data):
        if p['provider'] not in {'Sorceress Attire','Twisted - Amsedillir - Triumphal 3BA-BHUNP-UBE'} or p['classification']!='3BA / 3BBB':continue
        if any(m['relative'] in {r['relative'] for r in armor if r['status']=='mesh missing'} for m in p['meshes']):selected.add(index)
    tool=OUT/'BodySlide';catalog=OUT/'BuildCatalog';generated=OUT/'generated'
    if tool.exists() or catalog.exists():raise FileExistsError('Build staging already exists; inspect before reusing')
    source_tool=Path(inv['instance'])/'MODS/mods/BodySlide and Outfit Studio/CalienteTools/BodySlide'
    shutil.copytree(source_tool,tool,ignore=shutil.ignore_patterns('SliderSets','SliderGroups','SliderPresets','ShapeData','Log_BS.txt'))
    for directory in ['ShapeData','SliderSets','SliderGroups','SliderPresets']:(catalog/directory).mkdir(parents=True)
    for sex in ['female','male']:(generated/sex).mkdir(parents=True)
    folders=set();elements=[];records=[];cache={}
    for index in sorted(selected):
        p=data[index];path=p['osp_path']
        if path not in cache:cache[path]=ET.parse(path)
        element=copy.deepcopy(next(e for e in cache[path].findall('.//SliderSet') if e.get('name')==p['name']))
        folders.add(normalized(element.findtext('DataFolder') or ''))
        folders.update(normalized(e.get('DataFolder')) for e in element.findall('Shape') if e.get('DataFolder'))
        family='male' if p['classification']=='HIMBO' else 'female'
        elements.append((family,element));records.append({'index':index,'name':p['name'],'family':family,'provider':p['provider'],'output':p['output'],'weights':p['weights']})
        single=ET.Element('SliderSetInfo',{'version':'1'});single.append(element)
        ET.ElementTree(single).write(catalog/'SliderSets'/('Repair-%04d.osp'%index),encoding='utf-8',xml_declaration=True)
    copied=[]
    for relative,providers in inv['files'].items():
        prefix='calientetools/bodyslide/shapedata/'
        if not relative.startswith(prefix):continue
        rest=relative[len(prefix):]
        if not any(rest.startswith(f+'/') for f in folders if f):continue
        source=Path(providers[0]['path']);target=catalog/'ShapeData'/rest
        target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source,target)
        copied.append({'relative':str(target.relative_to(catalog)),'source':str(source),'sha256':hashlib.sha256(source.read_bytes()).hexdigest()})
    for family in ['female','male']:
        group_root=ET.Element('SliderGroups');group=ET.SubElement(group_root,'Group',{'name':'Local OBody Repairs '+family})
        preset_root=ET.Element('SliderPresets');preset=ET.SubElement(preset_root,'Preset',{'name':'Local OBody Zero '+family,'set':'HIMBO' if family=='male' else 'CBBE'})
        ET.SubElement(preset,'Group',{'name':'Local OBody Repairs '+family})
        names=set()
        for sex,element in elements:
            if sex!=family:continue
            ET.SubElement(group,'Member',{'name':element.get('name')})
            for slider in element.findall('Slider'):
                if slider.get('zap','false').lower()=='true' or slider.get('hidden','false').lower()=='true':continue
                names.add(slider.get('name'))
        for name in sorted(names):
            for size in ['small','big']:ET.SubElement(preset,'SetSlider',{'name':name,'size':size,'value':'0'})
        ET.ElementTree(group_root).write(catalog/'SliderGroups'/('Repair-'+family+'.xml'),encoding='utf-8',xml_declaration=True)
        ET.ElementTree(preset_root).write(catalog/'SliderPresets'/('Repair-'+family+'.xml'),encoding='utf-8',xml_declaration=True)
    # Validate every source and OSD dependency using the merged effective source folders.
    missing=[]
    for _,element in elements:
        folder=normalized(element.findtext('DataFolder') or '')
        source=catalog/'ShapeData'/folder/(element.findtext('SourceFile') or '').replace('\\','/')
        if not source.exists():missing.append(str(source))
        shape_folders={e.get('target'):normalized(e.get('DataFolder',folder)) for e in element.findall('Shape')}
        for delta in element.findall('Slider/Data'):
            text=(delta.text or '').replace('\\','/')
            filename=text.split('.osd/')[0]+'.osd' if '.osd/' in text else text
            dependency=folder if delta.get('local')=='true' else shape_folders.get(delta.get('target'),folder)
            if filename and not (catalog/'ShapeData'/dependency/filename).exists():missing.append(str(catalog/'ShapeData'/dependency/filename))
    if missing:raise RuntimeError('Missing build dependencies: '+repr(sorted(set(missing))[:30]))
    tree=ET.parse(tool/'Config.xml');root=tree.getroot()
    for name,value in {'TargetGame':'4','GameDataPath':str(Path(inv['instance'])/'STOCK GAME/Data')+'\\','ProjectPath':str(catalog)+'\\','BSATextureScan':'false','OutputDataPath':str(generated/'female')+'\\'}.items():
        node=root.find(name)
        if node is None:node=ET.SubElement(root,name)
        node.text=value
    tree.write(tool/'Config.xml',encoding='utf-8',xml_declaration=True)
    result={'profile':inv['profile'],'instance':inv['instance'],'projects':records,'source_files':copied,'missing_dependencies':[],'preset_policy':'All visible non-zap sliders explicitly zero at both weights; author hidden conversion defaults and zaps preserved.'}
    (OUT/'repair-build-plan.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'selected_projects':len(records),'source_files':len(copied),'projects':[p['name'] for p in records]},ensure_ascii=False,indent=2))

if __name__=='__main__':
    sys.stdout.reconfigure(encoding='utf-8');main()
