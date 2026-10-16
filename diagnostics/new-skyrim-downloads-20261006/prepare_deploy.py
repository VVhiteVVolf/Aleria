"""Produce dependency-ordered profile changes and validate new plugin armor resources."""
from pathlib import Path
import collections
import json
import struct
import sys
from stage import OUT,header
from prepare_build import ordering,norm
sys.path.insert(0,str(OUT.parent/'obody-bodyslide-audit-20261006'))
from plugin_records import scan
from archive_index import read_index

INSTANCE=Path(r'E:\Nolvus\Instances\Nolvus Awakening')

def main():
    plan=json.loads((OUT/'install-plan.json').read_text());catalog=json.loads((OUT/'catalog.json').read_text(encoding='utf-8'));profile=INSTANCE/'MODS/profiles'/catalog['profile']
    mods=sorted(plan['mods'],key=lambda m:78.1 if m['index']==46 else ordering(m))
    build=json.loads((OUT/'build-validation.json').read_text(encoding='utf-8'));mods.append({'name':Path(build['output_mod']).name,'directory':build['output_mod'],'index':99,'archive':'Verified local zeroed BodySlide build','nexus_id':None,'plugins':[]})
    disabled={'Spriggans','GoT Dragons - Enemy','GoT Dragons - Ally','GoT Dragons - Textures','GoT Dragons - Diverse Dragons','GoT Dragons - Wyrmstooth Patch',"Caliente's Beautiful Bodies Enhancer - 3BA - Vanilla Outfits", "Caliente's Beautiful Bodies Enhancer - 3BA - Vanilla Outfits - No Rim Lighting"}
    existing_modlines=(profile/'modlist.txt').read_text(encoding='utf-8-sig').splitlines();active={l[1:] for l in existing_modlines if l.startswith('+')}
    disabled &= active
    providers=json.loads((OUT/'current-plugin-providers.json').read_text());plugins=[l[1:] for l in (profile/'plugins.txt').read_text(encoding='utf-8-sig').splitlines() if l.startswith('*')]
    implicit=['Skyrim.esm','Update.esm','Dawnguard.esm','HearthFires.esm','Dragonborn.esm']+(INSTANCE/'STOCK GAME/Skyrim.ccc').read_text(encoding='utf-8-sig').splitlines()
    existing={p.casefold() for p in plugins}
    plugins=[p for p in implicit if p.casefold() in providers and p.casefold() not in existing]+plugins
    plugins=[p for p in plugins if p.lower()!='gotdragonsenemy.esp']
    # Existing body path patch incorrectly precedes its own master. Move only
    # that dependent patch after the appearance integration, preserving others.
    body_fix='Twisted NPC Body Paths Fix.esp';appearance='Twisted NPC Appearance Integration.esp'
    if body_fix in plugins and appearance in plugins:
        plugins.remove(body_fix);plugins.insert(plugins.index(appearance)+1,body_fix)
    oldplugins=set(p.casefold() for p in plugins);new=[]
    files={}
    for mod in mods:
        base=Path(mod['directory'])
        for p in base.rglob('*'):
            if p.is_file():files[norm(p.relative_to(base).as_posix())]=p
        mod['plugins']=[{'name':p.name,'path':str(p),**header(p)} for p in base.iterdir() if p.is_file() and p.suffix.lower() in {'.esp','.esl','.esm'}]
        for p in mod['plugins']:
            providers[p['name'].casefold()]=p['path']
            if p['name'].casefold() not in oldplugins and p['name'].casefold() not in {v.casefold() for v in new}:new.append(p['name'])
    # Author patch overlays share a plugin name: final provider above is authoritative.
    pending=list(new);ordered=[]
    while pending:
        progress=False
        for p in list(pending):
            dependencies=header(Path(providers[p.casefold()]))['masters']
            if p=='SaviorsHideReplacer2 - ZIA patch.esp':dependencies+=['SaviorsHideReplacer2.esp']
            if all(m.casefold() in oldplugins|{n.casefold() for n in ordered} for m in dependencies):
                ordered.append(p);pending.remove(p);progress=True
        if not progress:raise RuntimeError('Missing/cyclic new plugin masters: '+repr([(p,header(Path(providers[p.casefold()]))) for p in pending]))
    plugins+=ordered;indices={p.casefold():i for i,p in enumerate(plugins)};full=light=0
    for p in plugins:
        h=header(Path(providers[p.casefold()]));full+=not h['light'];light+=h['light']
        for master in h['masters']:
            if master.casefold() not in indices:raise RuntimeError('Missing master '+master+' for '+p)
            if indices[master.casefold()]>=indices[p.casefold()]:raise RuntimeError('Master order violation '+master+' for '+p)
    assert full<=254 and light<=4096
    inv=json.loads((OUT.parent/'obody-bodyslide-audit-20261006/inventory.json').read_text(encoding='utf-8'))
    available=set(k for k,ps in inv['files'].items() if any(p['mod'] in active-disabled or p['mod']=='Stock Game' for p in ps))|set(files)
    archives=json.loads((OUT.parent/'obody-bodyslide-audit-20261006/archives.json').read_text(encoding='utf-8'))
    available.update(archives['winning_archive_files'])
    for relative,p in files.items():
        if p.suffix.lower()=='.bsa':available.update(row['relative'] for row in read_index(p))
    missing=[];references=0
    for p in ordered:
        source=Path(providers[p.casefold()]);masters,records=scan(source);h=header(source)
        if h['light']:
            b=source.read_bytes();pos=0
            while pos+24<=len(b):
                k=b[pos:pos+4];n=struct.unpack_from('<I',b,pos+4)[0]
                if k==b'GRUP':pos+=24;continue
                form=struct.unpack_from('<I',b,pos+12)[0]
                if k!=b'TES4' and form>>24==len(masters) and form&0xffffff>0xfff:raise RuntimeError('Invalid ESL local FormID '+p+':'+hex(form))
                pos+=24+n
        for record in records:
            for key,model in record['models'].items():
                if not model.lower().endswith('.nif'):continue
                rel=norm(model);rel=rel if rel.startswith('meshes/') else 'meshes/'+rel
                references+=1
                candidates=[rel]
                if not rel.endswith(('_0.nif','_1.nif')):candidates += [rel[:-4]+'_0.nif',rel[:-4]+'_1.nif']
                if not any(c in available for c in candidates):missing.append({'plugin':p,'record':record.get('editor_id'),'model':model,'gender_key':key})
    (OUT/'armor-resource-validation.json').write_text(json.dumps({'references':references,'missing':missing},indent=2),encoding='utf-8')
    if missing:raise RuntimeError('Unresolved armor mesh references: '+repr(missing[:20]))
    separator='New Downloads 20261006_separator'
    lines=['+'+m['name'] for m in reversed(mods)]+['+'+separator]+[('-'+l[1:]) if l.startswith('+') and l[1:] in disabled else l for l in existing_modlines if l and not l.startswith('#')]
    (OUT/'modlist.after.txt').write_text('# This file was automatically generated by Mod Organizer.\n'+'\n'.join(lines)+'\n',encoding='utf-8')
    before=(profile/'plugins.txt').read_text(encoding='utf-8-sig').splitlines();before=[l for l in before if l.lstrip('*').lower()!='gotdragonsenemy.esp']
    if '*'+body_fix in before and '*'+appearance in before:before.remove('*'+body_fix);before.insert(before.index('*'+appearance)+1,'*'+body_fix)
    before+=['*'+p for p in ordered]
    (OUT/'plugins.after.txt').write_text('\n'.join(before)+'\n',encoding='utf-8')
    loadorder=(profile/'loadorder.txt').read_text(encoding='utf-8-sig').splitlines();loadorder=[l for l in loadorder if l.lower()!='gotdragonsenemy.esp']
    if body_fix in loadorder and appearance in loadorder:loadorder.remove(body_fix);loadorder.insert(loadorder.index(appearance)+1,body_fix)
    loadorder += ordered
    (OUT/'loadorder.after.txt').write_text('\n'.join(loadorder)+'\n',encoding='utf-8')
    plan.update(mods=mods,profile=catalog['profile'],instance=str(INSTANCE),separator=separator,disabled_mods=sorted(disabled),disabled_plugins=['GoTDragonsEnemy.esp'],new_plugins=ordered,plugin_counts={'full':full,'light':light},armor_resource_references=references)
    (OUT/'deployment-plan.json').write_text(json.dumps(plan,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'mods':len(mods),'new_plugins':len(ordered),'counts':plan['plugin_counts'],'disabled':sorted(disabled),'armor_references':references,'missing':len(missing)},indent=2))

if __name__=='__main__':main()
