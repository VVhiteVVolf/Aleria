import configparser
import json
import re
from pathlib import Path
from inventory import OUT, normalized
from nif_inspection import inspect_nif
from batch_plan import CORE

def ini_values(path):
    parser=configparser.ConfigParser(interpolation=None,strict=False,inline_comment_prefixes=(';',))
    parser.optionxform=str
    parser.read(path,encoding='utf-8-sig')
    return {section:dict(parser.items(section)) for section in parser.sections()}

def inspect_configuration(inv):
    instance=Path(inv['instance']);files=inv['files'];mods=instance/'MODS/mods'
    def provider(relative):return files.get(normalized(relative),[None])[0]
    defaults=mods/'Twisted - OBody Next Generation - Settings Loader/MCM/Config/OBody/settings.ini'
    current=provider('MCM/Settings/OBody.ini')
    effective=ini_values(defaults)
    if current:
        for section,values in ini_values(current['path']).items():effective.setdefault(section,{}).update(values)
    race=provider('SKSE/Plugins/skee64.ini')
    text=Path(race['path']).read_text(encoding='utf-8-sig')
    race_values={key:re.search(r'^'+key+r'\s*=\s*([^;\r\n]+)',text,re.M).group(1).strip() for key in ['bEnableBodyMorph','bEnableBodyGen','iBodyMorphMode','uBodyMorphMemoryLimit']}
    distribution_provider=provider('SKSE/Plugins/OBody_presetDistributionConfig.json')
    distribution=json.loads(Path(distribution_provider['path']).read_text(encoding='utf-8-sig'))
    distribution_summary={k:v if not isinstance(v,(dict,list)) or len(v)<20 else {'entry_count':len(v)} for k,v in distribution.items()}
    version_mods=['Twisted - OBody Next Generation','RaceMenu Special Edition','BodySlide and Outfit Studio',"Caliente's Beautiful Bodies Enhancer", "Caliente's Beautiful Bodies Enhancer - 3BA",'Highly Improved Male Body Overhaul','XP32 Maximum Skeleton Special Extended']
    versions={}
    for mod in version_mods:
        data=ini_values(mods/mod/'meta.ini').get('General',{})
        versions[mod]={'version':data.get('version'),'modid':data.get('modid'),'active':mod in inv['active_mods']}
    skeletons={}
    for sex,relative in [('female','meshes/actors/character/character assets female/skeleton_female.nif'),('male','meshes/actors/character/character assets/skeleton.nif')]:
        winner=provider(relative)
        skeletons[sex]={'provider':winner,'inspection':inspect_nif(winner['path']) if winner else {}}
    core=[]
    for output,name in CORE.items():
        winner=provider(output+'_1.nif');info=inspect_nif(winner['path']) if winner else {}
        sex='female' if '/female' in output else 'male'
        missing=sorted(set(info.get('bones',[]))-set(skeletons[sex]['inspection'].get('bones',[])))
        core.append({'output':output,'recommended_project':name,'winner':winner,'inspection':info,'body_bones_missing_from_winning_skeleton':missing})
    configs=[]
    for path in [mods/'BodySlide and Outfit Studio/CalienteTools/BodySlide/Config.xml',instance/'MODS/Twisted-OBody-20260919/BodySlide/Config.xml',instance/'MODS/Twisted-Outfits-20260919/BodySlide/Config.xml']:
        if path.exists():configs.append({'path':str(path),'content':path.read_text(encoding='utf-8-sig')})
    return {'versions':versions,'obody_defaults_path':str(defaults),'obody_saved_settings_provider':current,'obody_effective_disk_settings':effective,'race_menu_provider':race,'race_menu_values':race_values,'distribution_provider':distribution_provider,'distribution':distribution_summary,'core':core,'skeletons':skeletons,'bodyslide_configs':configs,'overwrite_files':[str(f.relative_to(instance/'MODS/overwrite')) for f in (instance/'MODS/overwrite').rglob('*') if f.is_file()]}

if __name__=='__main__':
    inv=json.loads((OUT/'inventory.json').read_text(encoding='utf-8'))
    data=inspect_configuration(inv)
    (OUT/'configuration.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'versions':data['versions'],'core':[{'project':p['recommended_project'],'missing_skeleton_bones':p['body_bones_missing_from_winning_skeleton']} for p in data['core']]},indent=2))
