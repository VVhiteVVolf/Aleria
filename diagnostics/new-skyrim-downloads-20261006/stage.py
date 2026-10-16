"""Resolve author FOMOD instructions into separately reviewable MO2 mods."""
from pathlib import Path, PureWindowsPath
import json
import shutil
import struct
import sys
import xml.etree.ElementTree as ET

OUT=Path(__file__).parent
sys.path.insert(0,str(OUT.parent/'obody-bodyslide-audit-20261006'))
from plugin_records import subrecords

NAMES={0:'Ancient Imperial Armor',1:'Flame Atronach - 4thUnknown',2:'Dragons - 4thUnknown',8:'Skeletons - 4thUnknown',9:'Spriggans - 4thUnknown v3',10:'Storm Atronach - 4thUnknown',11:'Trolls - 4thUnknown',15:'3DNPC Follower and Wives Replacer - SkyPatcher',16:'Bishop Armor 3BA',18:'Brutal Ravager',20:'CBBE 3BA Vanilla Outfits Redone - Default',21:'Cimmerian Armor 3BA',22:'Daedric Succubus',24:'Dragonbone Barbarian Armor',25:'Draugr Spear - Precision Creatures',27:'Dread Sovereign Armor CBBE',28:'Dwemer Research Squad',31:'Eastern Vagabond Armor',32:'Einherjr 3BA',33:'Elven Armor Expansion',35:'Eves Sunfire Armor',36:'Fashions of Forsworn - 3BA',37:'Fashions of Forsworn - HIMBO',39:'Fashions of Forsworn',40:'Master Thief - Female 3BA Conversion',41:'Sentinel Knight 3BA',42:'Adrienne Replacer',43:'ZckeZckT Replacer Assets 3BA',44:'Frost Atronach - 4thUnknown',45:'Harvester',46:'Akaviri Dragonguard - HDT SMP',47:'Iron Battlemage',48:'Lunarclaw Outfit 3BA',49:'More Powerful Mining Animations',50:'Nozomi Follower - Default Body',51:'Travelers Romper 3BA',52:'Common Outfit 3BA',53:'Druchii Armor 3BA',54:'Elven Assassin Armor 3BA',56:'HeadHunter Armor',57:'Hedge Knight Armor',58:'Rogue Outfit 3BA',59:'Skirt and Shirt 3BA',60:'Victorian Attire 3BA',61:'Zamorian Thief 3BA',62:'Rugged Crusader Armor',63:'Saviors Hide - 4K Textures',64:'Saviors Hide - 3BA Conversion',65:'Saviors Hide Replacer 2',66:'Saviors Hide - HIMBO Conversion',69:'Sellsword 3BA',72:'Spiders - 4thUnknown',73:'Tavern Clothes',74:'Viper Armor CBBE',75:'Wine Duchess - Xtudo Fixes',76:'Wine Duchess',77:'Thalmor Emissary Armor'}

def header(path):
    data=path.read_bytes()
    if data[:4]!=b'TES4':raise ValueError(path)
    size,flags=struct.unpack_from('<II',data,4)
    masters=[v.rstrip(b'\0').decode() for k,v in subrecords(data[24:24+size]) if k==b'MAST']
    return {'masters':masters,'flags':flags,'light':bool(flags&0x200) or path.suffix.lower()=='.esl'}

def portable(text):
    p=PureWindowsPath(text or '')
    if p.is_absolute() or '..' in p.parts:raise ValueError(text)
    return Path(*p.parts)

def fomod(source,xml,selection,active):
    root=ET.parse(xml).getroot();flags={};files=[];chosen=[]
    def dep(node):
        if node is None:return True
        if node.tag in {'dependencies','visible'}:
            values=[dep(c) for c in node]
            return any(values) if node.get('operator')=='Or' else all(values)
        if node.tag=='flagDependency':return flags.get(node.get('flag'),'Inactive')==node.get('value')
        if node.tag=='fileDependency':return (node.get('file').casefold() in active)==(node.get('state')=='Active')
        raise ValueError('Unimplemented dependency '+node.tag)
    def add(node):
        if node is not None:files.extend(list(node))
    add(root.find('requiredInstallFiles'))
    for step in root.findall('installSteps/installStep'):
        if not dep(step.find('visible')):continue
        for group in step.findall('optionalFileGroups/group'):
            allowed=selection.get(group.get('name'),[])
            if group.get('type')=='SelectExactlyOne' and len(allowed)!=1:raise ValueError('Choose '+group.get('name'))
            selected=[p for p in group.findall('plugins/plugin') if p.get('name') in allowed]
            if len(selected)!=len(allowed):raise ValueError('Unknown option '+repr(allowed))
            for plugin in selected:
                chosen.append([group.get('name'),plugin.get('name')]);add(plugin.find('files'))
                for f in plugin.findall('conditionFlags/flag'):flags[f.get('name')]=f.text
    for pattern in root.findall('conditionalFileInstalls/patterns/pattern'):
        if dep(pattern.find('dependencies')):add(pattern.find('files'))
    return sorted(files,key=lambda f:int(f.get('priority','0'))),chosen

def main():
    catalog=json.loads((OUT/'catalog.json').read_text());ex=json.loads((OUT/'extraction.json').read_text())
    active=set(json.loads((OUT/'current-plugin-providers.json').read_text()))
    installed=catalog['installed'];mods=[]
    for record in ex['selected']:
        index=record['index']
        if index==34:continue
        archive=catalog['archives'][index];source=Path(record['directory']);target=OUT/'mod-stage'/('Local - '+NAMES[index]+' 20261006')
        if target.exists():raise FileExistsError(target)
        target.mkdir(parents=True)
        xml=archive['metadata_files'].get('ModuleConfig.xml');chosen=[]
        if xml:
            if index==20:
                cc=all(x in active for x in ['ccasvsse001-almsivi.esm','ccbgssse021-lordsmail.esl','ccmtysse001-knightsofthenine.esl','ccvsvsse003-necroarts.esl','cccbhsse001-gaunt.esl'])
                patches=[n for n,p in [('HIMBO','himbo.esp'),('Beyond Reach','arnima.esm'),('ISC','immersive sounds - compendium.esp')] if p in active]
                selection={'Next step':['Continue'],'Anniversary Edition':['Yes' if cc else 'Only free creations (No plugin)'],'Dragon Priest Masks':['Install'],'Fixes for Beast Races (DAV)':['Install'],'Patches for record conflicts':patches}
            elif index==33:selection={'Cloth Physics':['Enable'],'Dynamic Visor':['Enable'],'Crafting':['Craft raised visor helmets'],'Distribution':['Loot','Thalmor'],"That's it!":['Enjoy!']}
            elif index==50:selection={'Nozomi - Main':['Nozomi - Default Body and Textures'],'MakeUp':['00 MakeUp Default'],'Pubes':['No'],'Thank you':['Endorse']}
            elif index in {64,66}:selection={'HDT Physics':['HDT-SMP']}
            elif index==65:selection={'Female':["4 (Author's choice)"],'Male':["4 (Author's choice)"],'Choose one':['None'],'Yay!':['Thank you!']}
            else:raise ValueError('Unhandled FOMOD '+str(index))
            mappings,chosen=fomod(source,xml,selection,active)
            # FOMOD paths are relative to its containing mod root.
            xml_relative=next(f['relative'] for f in archive['files'] if f['relative'].lower().endswith('fomod/moduleconfig.xml'))
            source=source/portable(xml_relative).parent.parent
            for mapping in mappings:
                src=source/portable(mapping.get('source'));dst=target/portable(mapping.get('destination'))
                if not src.exists():raise FileNotFoundError(src)
                if mapping.tag=='folder':shutil.copytree(src,dst,dirs_exist_ok=True)
                elif mapping.tag=='file':dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dst)
                else:raise ValueError(mapping.tag)
        else:
            candidates=[source,*[p for p in source.rglob('*') if p.is_dir()]]
            roots=[p for p in candidates if any((p/n).is_dir() for n in ['meshes','textures','CalienteTools','Scripts','SKSE']) or any(p.glob('*.esp'))]
            shallow=min(len(p.relative_to(source).parts) for p in roots)
            roots=[p for p in roots if len(p.relative_to(source).parts)==shallow]
            if len(roots)!=1:raise ValueError('Ambiguous data root '+repr(roots))
            shutil.copytree(roots[0],target,dirs_exist_ok=True)
        if index==0:shutil.copy2(OUT/'unpacked/34/1AncientImperial.esp',target/'1AncientImperial.esp')
        if index==40:
            # Preserve installed 1.3 plugin/assets; use only the missing female conversion.
            for p in list(target.iterdir()):
                if p.name!='CalienteTools':
                    if p.is_dir():shutil.rmtree(p)
                    else:p.unlink()
        for p in list(target.iterdir()):
            if p.name.lower() in {'fomod','images','__macosx'}:
                if p.is_dir():shutil.rmtree(p)
                else:p.unlink()
            elif p.name.lower()=='meta.ini':p.unlink()
        plugins=[{'name':p.name,'path':str(p),**header(p)} for p in target.glob('*') if p.suffix.lower() in {'.esp','.esm','.esl'}]
        mods.append({'name':target.name,'directory':str(target),'index':index,'archive':archive['filename'],'nexus_id':archive['nexus_id'],'choices':chosen,'plugins':plugins,'files':sum(p.is_file() for p in target.rglob('*'))})
        (OUT/'stage.json').write_text(json.dumps({'mods':mods},ensure_ascii=False,indent=2))
        print('Staged',index,target.name,'plugins',[(p['name'],p['light'],p['masters']) for p in plugins],flush=True)

if __name__=='__main__':main()
