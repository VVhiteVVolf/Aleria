"""Build each new outfit output once with compatible body sources and explicit zero sliders."""
from pathlib import Path
import collections
import copy
import json
import shutil
import sys
import xml.etree.ElementTree as ET

OUT=Path(__file__).parent
sys.path.insert(0,str(OUT.parent/'obody-bodyslide-audit-20261006'))
from nif_inspection import inspect_nif

def norm(s):return s.replace('\\','/').strip('/').casefold()
def ordering(mod):
    i=mod['index'];return {36:39.1,37:39.2,40:40,42:43.1,63:66.1,64:65.1,66:65.2,75:76.1}.get(i,i)

def main():
    mods=sorted(json.loads((OUT/'stage.json').read_text())['mods'],key=ordering)
    mods=[m for m in mods if m['index'] not in {28,46}]
    files={}
    for m in mods:
        base=Path(m['directory'])
        for p in base.rglob('*'):
            if p.is_file():files[norm(p.relative_to(base).as_posix())]=(p,m)
    projects=[];by_output=collections.defaultdict(list);excluded=[]
    for relative,(p,mod) in files.items():
        if '/slidersets/' not in relative or p.suffix.lower()!='.osp':continue
        tree=ET.parse(p)
        if mod['index']==20:
            changed=False
            for element in tree.findall('.//SliderSet'):
                if element.get('name')=='CBBE 3BA Vanilla - 1st Person - Leather':
                    for shape in element.findall('Shape'):
                        if shape.get('target')=='3BA':shape.set('DataFolder','SE 3BBB Amazing');changed=True
            if changed:tree.write(p,encoding='utf-8',xml_declaration=True)
        for e in tree.findall('.//SliderSet'):
            name=e.get('name');lower=name.lower();sliders={s.get('name') for s in e.findall('Slider')}
            if any(s in lower for s in ['bhunp','uunp','ube','tbd']):excluded.append(name);continue
            male='HIMBO' in name or bool({'ArmsBiceps','TorsoMass'}&sliders)
            if mod['index']==47 and lower.endswith(' m'):excluded.append(name);continue
            if mod['index']==66 and 'Torso' in name and not name.endswith('Torso 4'):excluded.append(name);continue
            if mod['index']==64 and 'Torso' in name and not name.endswith('Torso 4'):excluded.append(name);continue
            output=norm(e.findtext('OutputPath','')+'/'+e.findtext('OutputFile',''))
            if output.endswith(('/femalebody','/femalehands','/femalefeet','/malebody','/malehands','/malefeet')):raise RuntimeError('Unexpected core body project '+name)
            # Later conversion overrides earlier project. Cloth physics and rigid plate
            # physics variants are chosen deliberately, not built over each other.
            score=ordering(mod)*100
            if 'physics' in lower:score+=10
            if 'im physics' in lower:score+=5
            if 'hands redone' in lower or 'hands redpne' in lower:score+=2
            record={'name':name,'family':'male' if male else 'female','output':output,'weights':e.find('OutputFile').get('GenWeights','true').lower()=='true','mod':mod['name'],'index':mod['index'],'osp':str(p),'element':e,'score':score}
            by_output[output].append(record)
    selected=[max(rows,key=lambda p:p['score']) for rows in by_output.values()]
    catalog=OUT/'BuildCatalog';tool=OUT/'BodySlide';generated=OUT/'generated'
    for folder in ['ShapeData','SliderSets','SliderPresets','SliderGroups']:(catalog/folder).mkdir(parents=True,exist_ok=True)
    source_tool=Path(r'E:\Nolvus\Instances\Nolvus Awakening\MODS\mods\BodySlide and Outfit Studio\CalienteTools\BodySlide')
    shutil.copytree(source_tool,tool,dirs_exist_ok=True,ignore=shutil.ignore_patterns('ShapeData','SliderSets','SliderPresets','SliderGroups','Log_BS.txt'))
    folders=set()
    for n,p in enumerate(selected):
        e=copy.deepcopy(p['element']);folder=norm(e.findtext('DataFolder',''));folders.add(folder)
        folders.update(norm(f) for s in e.findall('Shape') if s.get('DataFolder') for f in s.get('DataFolder').split(';'))
        # Guarantee unique project names even if an author repeats a label.
        p['build_name']='New-%04d '%n+p['name'];e.set('name',p['build_name']);p['element']=e
        doc=ET.Element('SliderSetInfo',{'version':'1'});doc.append(e)
        ET.ElementTree(doc).write(catalog/'SliderSets'/('%04d.osp'%n),encoding='utf-8',xml_declaration=True)
    prefix='calientetools/bodyslide/shapedata/'
    inv=json.loads((OUT.parent/'obody-bodyslide-audit-20261006/inventory.json').read_text(encoding='utf-8'))
    deps={k:Path(v[0]['path']) for k,v in inv['files'].items() if k.startswith(prefix)}
    deps.update({k:v[0] for k,v in files.items() if k.startswith(prefix)})
    copied=0
    for relative,source in deps.items():
        rest=relative[len(prefix):]
        if not any(rest.startswith(f+'/') for f in folders if f):continue
        target=catalog/'ShapeData'/rest;target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source,target);copied+=1
    missing=[]
    for p in selected:
        e=p['element'];folder=norm(e.findtext('DataFolder',''));source=catalog/'ShapeData'/folder/e.findtext('SourceFile','').replace('\\','/')
        if not source.is_file():missing.append(str(source))
        shape_folders={s.get('target'):norm(s.get('DataFolder',folder)) for s in e.findall('Shape')}
        for delta in e.findall('Slider/Data'):
            text=norm(delta.text or '');filename=text.split('.osd/')[0]+'.osd' if '.osd/' in text else text
            dep=folder if delta.get('local')=='true' else shape_folders.get(delta.get('target'),folder)
            if filename and not any((catalog/'ShapeData'/f/filename).is_file() for f in dep.split(';')):missing.append(str(catalog/'ShapeData'/dep/filename))
    if missing:raise RuntimeError('Missing source dependencies: '+repr(sorted(set(missing))))
    for family in ['female','male']:
        rows=[p for p in selected if p['family']==family];(generated/family).mkdir(parents=True)
        groups=ET.Element('SliderGroups');group=ET.SubElement(groups,'Group',{'name':'Local New Outfits '+family})
        presets=ET.Element('SliderPresets');preset=ET.SubElement(presets,'Preset',{'name':'Local New Zero '+family,'set':'HIMBO' if family=='male' else 'CBBE'})
        ET.SubElement(preset,'Group',{'name':'Local New Outfits '+family});names=set()
        for p in rows:
            ET.SubElement(group,'Member',{'name':p['build_name']})
            for s in p['element'].findall('Slider'):
                if s.get('zap','false').lower()=='true' or s.get('hidden','false').lower()=='true':continue
                names.add(s.get('name'))
        for name in sorted(names):
            for size in ['small','big']:ET.SubElement(preset,'SetSlider',{'name':name,'size':size,'value':'0'})
        ET.ElementTree(groups).write(catalog/'SliderGroups'/(family+'.xml'),encoding='utf-8',xml_declaration=True)
        ET.ElementTree(presets).write(catalog/'SliderPresets'/(family+'.xml'),encoding='utf-8',xml_declaration=True)
    tree=ET.parse(tool/'Config.xml')
    for name,value in {'TargetGame':'4','ProjectPath':str(catalog)+'\\','BSATextureScan':'false','OutputDataPath':str(generated/'female')+'\\'}.items():
        e=tree.getroot().find(name)
        if e is None:e=ET.SubElement(tree.getroot(),name)
        e.text=value
    tree.write(tool/'Config.xml',encoding='utf-8',xml_declaration=True)
    for p in selected:del p['element']
    result={'projects':selected,'excluded':excluded,'conflicts':{k:[p['name'] for p in v] for k,v in by_output.items() if len(v)>1},'source_files':copied,'policy':'Visible nonzap sliders zero both weights; hidden conversion and author zap defaults retained. One project per output. Core bodies excluded.'}
    (OUT/'build-plan.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'projects':len(selected),'families':dict(collections.Counter(p['family'] for p in selected)),'sources':copied,'excluded':len(excluded),'conflicts_resolved':len(result['conflicts'])},indent=2))

if __name__=='__main__':main()
