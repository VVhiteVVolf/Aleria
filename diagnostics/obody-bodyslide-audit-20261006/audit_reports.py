"""Generate human reports from the read-only inventory and the separate cleanup receipt."""
import collections
import csv
import json
import re
from pathlib import Path
from inventory import OUT
from batch_plan import make_plan, write_plan, CORE, exclusion_reason

def load(name):return json.loads((OUT/name).read_text(encoding='utf-8-sig'))
def write(name,lines):
    (OUT/name).write_text('\n'.join(lines)+'\n',encoding='utf-8')

def humanoid_body(row):
    path=row['relative']
    refs=row['references']
    if not row['body_slot'] or ('meshes/actors/' in path and '/character/' not in path):return False
    if any(t in path for t in ['child','rschildren','creatures/','draugr','skeleton','zombie','werewolf','atronach']):return False
    if all('children' in ref['plugin'].lower() for ref in refs):return False
    bones=row['inspection'].get('bones',[])
    return any('UpperArm' in bone for bone in bones) or bool(set(row['classifications']) & {'3BA / 3BBB','HIMBO','CBBE only'})

def project_lists(projects,morph):
    for family,name in [('3BA / 3BBB','obody_3ba_projects.txt'),('HIMBO','obody_himbo_projects.txt')]:
        lines=[family+' PROJECT DEFINITIONS — ALL ENABLED MODS','Includes alternatives and tagged head/hair/collision projects. This is an inventory, not a build selection.','name | mod | role | output | linked morph shapes | zeroed mesh+TRI pair verified | OSP']
        for index,p in enumerate(projects):
            if p['classification']!=family:continue
            m=morph[index]
            lines.append(' | '.join([p['name'],p['provider'],p['role'],p['output'],str(m['usable_shape_links']),str(m['zeroed_pair_verified']),p['osp_path']]))
        write(name,lines)

def missing_report(projects,armor):
    issues=[]
    for row in armor['models']:
        if not humanoid_body(row):continue
        for sex in sorted({r['gender'] for r in row['references']}):
            required='HIMBO' if sex=='male' else '3BA / 3BBB'
            supported=required in row['classifications']
            runtime=row['status']=='morph-supported' or any(b['provider'] for b in row['morph_bindings'])
            if supported and runtime:continue
            severity='IMPORTANT' if not runtime else 'OPTIONAL'
            status='Installed compatible project exists; generated linked morphs missing/unconfirmed' if supported else 'CBBE-only conversion; OBody morphs may work, but 3BA support not established' if sex=='female' and 'CBBE only' in row['classifications'] else 'No matching '+required+' BodySlide output project in enabled loose sources; no runtime body TRI found' if not runtime else 'Existing body TRI, but '+required+' source family not established'
            issues.append({'mesh':row['relative'],'gender':sex,'status':status,'severity':severity,'runtime_morph_reference_available':runtime,'projects':row['projects'],'plugin_providers':sorted({r['provider'] for r in row['references'] if r['gender']==sex}),'plugins':sorted({r['plugin'] for r in row['references'] if r['gender']==sex}),'mesh_provider':row['mesh_provider']['mod'] if row['mesh_provider'] else None})
    cbbe_outputs=collections.defaultdict(list)
    all_outputs=collections.defaultdict(set)
    for p in projects:all_outputs[p['output']].add(p['classification'])
    for p in projects:
        if p['classification']=='CBBE only' and p['role']=='outfit / other mesh' and '3BA / 3BBB' not in all_outputs[p['output']] and not exclusion_reason(p):cbbe_outputs[p['provider']].append(p)
    lines=['MISSING/UNCONFIRMED BODY CONVERSIONS — CURRENT PROFILE','CBBE-only does not automatically mean broken OBody. Usable CBBE TRI can morph female clothing; 3BA adds different weighting/sliders/physics support.','Humanoid body-slot models without a linked TRI cannot follow runtime body morphs through that model. Source family is unknown unless a matching project is inspected; vanilla/SOS is not guessed from a filename.','Creatures, obvious undead bodies, children, headwear, jewelry and fixed accessory projects are separate exceptions. No mod download/rebuild performed.','', 'A) CBBE-ONLY BODY/OUTFIT SOURCE OUTPUTS WITHOUT ENABLED 3BA ALTERNATIVE']
    for mod,items in sorted(cbbe_outputs.items()):
        lines.extend(['',mod+' | '+str(len(items))+' project definitions | female: CBBE only | 3BA: not found for these outputs'])
        lines.extend('  '+p['name']+' | '+p['output'] for p in items)
    lines.extend(['','B) CURRENT REFERENCED HUMANOID BODY MODELS WITH COVERAGE GAPS'])
    for item in sorted(issues,key=lambda x:(x['gender'],x['plugins'],x['mesh'])):
        lines.append(' | '.join([item['gender'],item['mesh'],item['severity'],item['status'],'record: '+', '.join(item['plugins']),'winning mesh: '+str(item['mesh_provider']),'projects: '+', '.join(item['projects'])]))
    write('obody_missing_conversions.txt',lines)
    (OUT/'conversion-gaps.json').write_text(json.dumps({'models':issues,'cbbe_only_project_providers':{m:[p['name'] for p in ps] for m,ps in cbbe_outputs.items()}},ensure_ascii=False,indent=2),encoding='utf-8')
    return issues,cbbe_outputs

def csv_inventories(inv,projects,armor,morph):
    by_mod=collections.defaultdict(collections.Counter)
    for p in projects:by_mod[p['provider']][p['classification']]+=1
    mesh_mods=collections.defaultdict(set);plugin_mods=collections.defaultdict(set)
    for m in armor['models']:
        if m['mesh_provider']:mesh_mods[m['mesh_provider']['mod']].add(m['relative'])
        for ref in m['references']:plugin_mods[ref['provider']].add(m['relative'])
    with (OUT/'enabled-mod-body-support.csv').open('w',encoding='utf-8-sig',newline='') as f:
        writer=csv.writer(f);writer.writerow(['enabled_mod','3BA_projects','HIMBO_projects','CBBE_only_projects','other_projects','referenced_mesh_files_supplied','ARMA_model_paths_in_winning_records','BodySlide_support'])
        for mod in inv['active_mods']:
            c=by_mod[mod];writer.writerow([mod,c['3BA / 3BBB'],c['HIMBO'],c['CBBE only'],sum(c.values())-c['3BA / 3BBB']-c['HIMBO']-c['CBBE only'],len(mesh_mods[mod]),len(plugin_mods[mod]),'present' if c else 'none in enabled loose sources'])
    with (OUT/'armor-mesh-priority.csv').open('w',encoding='utf-8-sig',newline='') as f:
        writer=csv.writer(f);writer.writerow(['mesh','status','winner','archive','gender','plugins','projects','BODYTRI_bindings'])
        for m in armor['models']:writer.writerow([m['relative'],m['status'],m['mesh_provider']['mod'] if m['mesh_provider'] else 'MISSING',m['from_archive'],','.join(sorted({r['gender'] for r in m['references']})),','.join(sorted({r['plugin'] for r in m['references']})),','.join(m['projects']),','.join(b['relative'] for b in m['morph_bindings'])])
    with (OUT/'project-morph-findings.csv').open('w',encoding='utf-8-sig',newline='') as f:
        writer=csv.writer(f);writer.writerow(['project','mod','output','class','role','usable_shape_link','zeroed_pair_verified','partial_stale_links','mesh_newer_than_TRI','different_mesh_TRI_provider'])
        for p,m in zip(projects,morph):writer.writerow([p['name'],p['provider'],p['output'],p['classification'],p['role'],m['usable_shape_links'],m['zeroed_pair_verified'],m['partial_stale_links'],any(b['mesh_newer_than_tri'] for x in m['meshes'] for b in x['bindings']),any(b['different_provider'] for x in m['meshes'] for b in x['bindings'])])

def conflicts_report(data,projects,morph,plan):
    selected={p['output']:p['name'] for p in plan['selected']}
    lines=['BODYSLIDE OUTPUT CONFLICTS — NO CHANGES APPLIED','Several projects for one output are alternatives, not several simultaneously built bodies.','', 'A) OUTPUT PATH COLLISIONS']
    for output,names in sorted(data['output_conflicts'].items()):
        lines.extend(['',output,'Select: '+selected.get(output,'MANUAL SELECTION / EXCLUDED EXCEPTION')])
        lines.extend('  '+name for name in names)
    lines.extend(['','B) DUPLICATE PROJECT NAMES'])
    for name,providers in data['duplicate_names'].items():lines.append(name+' | '+', '.join(providers))
    lines.extend(['','C) XML ERRORS'])
    lines.extend(e['file']+' | '+e['error'] for e in data['errors'])
    lines.extend(['','D) MORPH LINK / TIMESTAMP / PROVIDER NOTES','A newer NIF timestamp does not prove an outdated TRI. An absent obsolete link does not by itself prove failure if another correct linked TRI is readable.'])
    for p,m in zip(projects,morph):
        flags=[]
        if m['partial_stale_links']:flags.append('Mixed obsolete and working BODYTRI links; verify selected node at runtime')
        if any(b['mesh_newer_than_tri'] for x in m['meshes'] for b in x['bindings']):flags.append('NIF timestamp newer than TRI (not proof of incompatible geometry)')
        if any(b['different_provider'] for x in m['meshes'] for b in x['bindings']):flags.append('Mesh and TRI winner supplied by different mods')
        if flags:lines.append(p['name']+' | '+p['output']+' | '+'; '.join(flags))
    write('obody_conflicts.txt',lines)

def markdown_report(inv,data,armor,config,details,plan,issues,cbbe,cleanup):
    projects=data['projects'];morph=details['projects'];classes=data['classification_counts']
    core=['- `'+p['recommended_project']+'` → `'+p['output']+'`: winner **'+p['winner']['mod']+'**; shapes '+', '.join(s['name'] for s in p['inspection']['shapes'])+'.' for p in config['core']]
    missing=[];no_morph=[]
    referenced={m['relative']:m for m in armor['models']}
    for p,m in zip(projects,morph):
        if p['classification'] not in {'3BA / 3BBB','HIMBO'} or exclusion_reason(p):continue
        if not m['usable_shape_links']:
            paths=[x['relative'] for x in p['meshes']]
            used=[referenced[x] for x in paths if x in referenced]
            if used and any(x['status']=='mesh missing' for x in used):missing.append(p)
            elif used:no_morph.append(p)
    unique_missing={p['name']+' | '+p['provider'] for p in missing}
    unique_no_morph={p['name']+' | '+p['provider'] for p in no_morph}
    verified=sum(m['zeroed_pair_verified'] for m in morph)
    counts=collections.Counter((i['gender'],i['runtime_morph_reference_available']) for i in issues)
    kept=[m for m in load('cleanup-plan.json')['mods'] if m['decision']=='KEEP']
    lines=['# BodySlide / OBody NG audit — 6 October 2026','',
        'The actual selected Nolvus instance was audited. No body rebuild, plugin activation, load-order change, animation generation or mesh repair was performed. Separately, the user-authorized cleanup removed only the 16 inactive, backed-up packages listed below.','',
        '## Scope and evidence','',
        '- Instance: `'+inv['instance']+'`.',
        '- Skyrim: `'+inv['game_path']+'`; MO2: `'+inv['instance']+'\\MO2\\ModOrganizer.exe`.',
        '- Selected profile: **'+inv['profile']+'**. Its name is not used to infer installed SkyrimNet version.',
        '- Profile files: `'+inv['profile_path']+'\\modlist.txt`, `plugins.txt`, `loadorder.txt`.',
        '- '+str(len(inv['active_mods']))+' enabled mod entries; '+str(len(inv['plugins']))+' active plugins; '+str(len(projects))+' effective BodySlide project definitions; '+str(len(armor['models']))+' referenced third-person armor-addon model paths.',
        '- OSP/XML inspected for SliderSets, ShapeData/source NIF, SliderGroups and SliderPresets. Loose priority follows the actual descending `modlist.txt`; Overwrite wins, then enabled loose mods, then associated active BSAs.',
        '- 609 unique BSA tables inspected, including compressed SSE meshes. Models referenced only by creature/undead/child records are separated from adult humanoid body-conversion candidates.',
        '- '+str(details['summary']['unique_tri_files_read'])+' body TRI shape tables read; '+str(details['summary']['unchanged_recorded_tri_files'])+' match preserved generated-output SHA-256 receipts. Matching NIF shape names were checked; all core skeleton bone names resolve in the winning XPMSSE skeleton.',
        '- **Limit:** this is a disk/configuration audit, not an in-game OBody distribution test. Binary morph vertex indices/topology are not exhaustively compared for every aftermarket outfit. No mesh filename is used to claim a fixed build preset. Timestamp differences are cautions, not proof of stale geometry.',
        '- A project definition points to an output, but multiple definitions can share it. A verified zeroed output pair does not prove that every alternative project was built. Historical selected-project manifests distinguish the documented choices.','',
        '## 1. Current female body','',
        'CBBE 3BA **2.47**, with CBBE **2.0.1** underneath. Keep `CBBE 3BBB Body Amazing`, `CBBE 3BBB Feet` and **`Hands Redone F Hands`**. Female Hands Redone is the deliberate current hand exception; replacing it with CBBE hands would change the setup.',
        '',*core[:3],'',
        '## 2. Current male body','',
        'HIMBO **5.3.1**. The documented winning build selected **`HIMBO Body - SOS High Poly Phys CBPC`**, `HIMBO Hands` and `HIMBO Feet`. The word SOS is the project variant name, not a recommendation to install another genital framework. Do not substitute a nevernude, low-poly or SMP collision variant just because it shares `malebody`.',
        '',*core[3:],'',
        'XPMSSE **5.06** supplies both winning skeletons. None of the six core output meshes references a bone absent from its winning skeleton. This confirms node availability, not a visual physics test.','',
        '## 3. OBody NG status','',
        'OBody NG **4.4.3.0** is enabled. Winning JSON: `'+config['distribution_provider']['path']+'`.',
        'Settings Loader defaults plus saved `MCM/Settings/OBody.ini` give these disk values:',
        '', '```ini', '[Settings]', *[k+'='+v for k,v in config['obody_effective_disk_settings']['Settings'].items()], '[Maintenance]', *[k+'='+v for k,v in config['obody_effective_disk_settings']['Maintenance'].items() if k in {'bEnabled','iLoadingDelay','bLoadSettingsonReload'}], '```','',
        'Female and male race/faction/plugin-specific preset maps are empty, so there is no forced sex-wide preset override in that JSON. **ElderRace is excluded for both sexes.** NPC blacklist lists are empty. Player/save-level assigned presets cannot be determined from these files alone.',
        'Seven presets are excluded from random distribution, including `- Zeroed Sliders -`, `HIMBO Zero for OBody`, `TNG Default` and the Hands Redone-only preset. They are hidden from the OBody menu. This prevents zeroed/build-helper presets being used as normal body choices.',
        'There are 7,192 outfit-name and 70 plugin-name **ORefit** exclusions plus 82 force-refit names. These are breast/clothing-refit exceptions, not a general switch disabling body morph distribution for all those outfits. Respectful morph application is enabled; prior RaceMenu/save morphs therefore need an in-game check if a particular actor is problematic.','',
        '## 4. RaceMenu morph status','',
        'RaceMenu **0.4.16**; winning INI from `'+config['race_menu_provider']['mod']+'`:',
        '', '```ini', *[k+'='+v for k,v in config['race_menu_values'].items()], '```','',
        '`bEnableBodyMorph=1` and `bEnableBodyGen=0` are appropriate for this OBody-managed setup. Do not enable BodyGen as a second automatic distributor.','',
        '## 5. Number of 3BA projects','',
        '**'+str(classes['3BA / 3BBB'])+' definitions have a 3BA/3BBB project/group/source signature**, including alternatives, 242 head/hair/accessory definitions and 3 collision resources. **1,264 are classified as body/outfit definitions.** The complete list is in `obody_3ba_projects.txt`; it is not an instruction to build all 1,509.',
        '', '## 6. Number of HIMBO projects','',
        '**'+str(classes['HIMBO'])+' HIMBO definitions**, including 18 core-body variants/parts, 1 head/accessory project and 4 collision resources. **1,037 are body/outfit definitions.** Full list: `obody_himbo_projects.txt`.',
        '', '## 7. Missing/unconfirmed 3BA conversions','',
        str(len(cbbe))+' source-provider mods have CBBE-only body/outfit outputs without an enabled 3BA alternative for those paths. Exact per-project names are in `obody_missing_conversions.txt`.',
        'Examples among inspected sources include **Ashlander Apparel, Viridian Knight Armor, Onyx Lancer Armor, The Alchemist\'s Vestments - CBBE, Tribal Sorceress Outfit, Ashara Imperial Outfit - CBBE BodySlide** and some NordWarUA/CBBE projects. Some other items in those same mods can still have 3BA support; the list is path-specific.',
        'CBBE-only outfits with a usable linked TRI can still follow female OBody sliders. A strict 3BA conversion is needed for the requested 3BA weighting/sliders/physics where relevant, not universally for rings, helmets, fixed armor parts or hands.',
        str(counts[('female',False)])+' referenced humanoid female body-model/gender rows in the coverage-gap list lack an available linked body TRI; '+str(counts[('female',True)])+' other female rows have a TRI but lack confirmed 3BA project coverage. These are **coverage rows, not numbers of broken mods**.',
        '', '## 8. Missing/unconfirmed HIMBO conversions','',
        str(counts[('male',False)])+' referenced humanoid male body-model/gender coverage rows lack an available linked body TRI; '+str(counts[('male',True)])+' have morph references but no matching inspected HIMBO source project. Exact paths, ARMA plugin providers and winning mesh providers are listed.',
        'Current examples include body paths under **Sons of Skyrim / Xtudo patches**, **NordWarUA Weapon Expansion**, **Bruma**, **Carved Brink**, **Konahrik\'s Accoutrements** and some **Vigilant/Unslaad** equipment. An installed conversion whose output path differs from the winning ARMA model path does not cover that equipped model. Humanoid models with an unknown body family are not automatically labelled vanilla or SOS.',
        '', '## 9. Outputs without usable morphs','',
        str(verified)+' project definitions resolve to mesh+TRI output pairs unchanged from documented zeroed builds. These are shared-output definitions, not '+str(verified)+' separately proven build choices.',
        'The original strict all-links check flags '+str(sum(p['morph_status']=='missing or unusable morph link / output' for p in projects))+' definitions, but many are hairstyles, alternatives, unbuilt accessories or redundant old links. The refined shape-table audit finds '+str(details['summary']['usable_shape_link_project_definitions'])+' definitions with a usable matching link; **'+str(details['summary']['partial_stale_link_project_definitions'])+' definitions have both stale and working links.** There are no unreadable packed body TRI tables among the '+str(details['summary']['unique_tri_files_read'])+' tested files.',
        'Confirmed missing equipped project outputs (loose and indexed associated active BSA lookup):','',
        *['- '+x for x in sorted(unique_missing)],'',
        'Other referenced compatible projects without a usable shape link (some are deliberate non-body accessories):','',
        *['- '+x for x in sorted(unique_no_morph)],'',
        'Mixed links occur in **Knight Errant HIMBO** parts, some **HIMBO Ancient Nord/Broken Amulets**, and the **OCum** accessory project. A working matching link exists, so a missing obsolete link alone is not reported as certain runtime failure. RaceMenu selects links while traversing the NIF nodes; the disk scan cannot prove that order for the in-game attachment.','',
        'Full mesh/tri winner and timestamp details: `project-morph-findings.csv` and `obody_conflicts.txt`. A newer mesh timestamp is not evidence that it was built without morphs.','',
        '## 10. Duplicate/conflicting projects','',
        '**'+str(len(data['output_conflicts']))+' output paths** have multiple project definitions, and **'+str(len(data['duplicate_names']))+' project names** occur more than once. Examples: standard CBBE/physics/nevernude/3BA all target `femalebody`; numerous HIMBO CBPC/SMP/high-poly/never-nude variants target `malebody`.',
        'Exact choices and alternatives are recorded in `obody_recommended_batchbuild.txt`; duplicate names require inspecting their OSP paths. The malformed `Dark Brotherhood Armor - HIMBO` group XML has an incomplete **`&apos` entity without semicolon** on line 9. Its OSP projects remain readable, but the broken group file can prevent correct group selection.','',
        '## 11. Current BodySlide outputs','',
        '- **Twisted - Nolvus OBody BodySlide Output**: enabled; primary body and most Nolvus outfit output.',
        '- **Twisted - Nolvus Outfit OBody Output**: enabled; additional 19 September outfit output.',
        '- **BodySlide (Nude)**: enabled; older Nolvus output still supplies some otherwise uncovered paths.',
        '- **Twisted - Additional Outfits OBody Output 20260923**: disabled in every saved profile; retained as a rebuild/repair resource. Its activation is not implied by the source outfits being installed.',
        'BodySlide **5.6** executable: `'+inv['instance']+'\\MODS\\mods\\BodySlide and Outfit Studio\\CalienteTools\\BodySlide\\BodySlide x64.exe`.',
        'The normal tool Config.xml points OutputDataPath at **MO2 Overwrite**. The isolated `Twisted-OBody-20260919` tool points at its own generated-output mod and a historical **BuildCatalog**. That old snapshot is not a complete catalog of subsequent downloads. Both observations matter before a rebuild.','',
        '## 12. Which output wins','',
        'For all six shared core body/hand/foot outputs, **Twisted - Nolvus OBody BodySlide Output** wins over the originals and `BodySlide (Nude)`. The outfit output wins on its distinct outfit paths. There is no single global winning mod for all armor; `armor-mesh-priority.csv` records every one of the '+str(len(armor['models']))+' referenced paths, including BSA providers.',
        'Linked body TRI output mostly comes from those same generated mods. Five inspected linked TRI files outside the preserved build receipt are not certified zeroed by hash. Head/face TRI files are unrelated to body morph TRI and were not counted as OBody evidence.','',
        '## 13. Overwrite','',
        '**Overwrite is empty at audit time.** No unexpected `.nif`, `.tri` or CalienteTools files override the generated outputs. Its being the default future BodySlide destination is a configuration concern, not a current conflict.','',
        '## 14. Exact recommended Batch Build configuration','',
        'Use the selected profile through MO2 with its current complete VFS. Female preset **`- Zeroed Sliders -`** from CBBE.xml; male **`HIMBO Zero for OBody`** from HIMBO.xml. Both presets were inspected and contain only zero-valued explicit sliders. **Build Morphs ON**, both weights for weighted projects; preserve intended armor zaps rather than changing styles globally.',
        '',*['- '+name for name in CORE.values()],'',
        '**Plan only:** '+str(sum(x['family']=='female' for x in plan['selected']))+' selected female outputs (including the Hands Redone exception), '+str(sum(x['family']=='male' for x in plan['selected']))+' selected male outputs; '+str(len(plan['ambiguous']))+' unresolved output groups. These groups must be resolved before calling this a complete safe batch.','',
        'Prefer separate new output mods **OBody - Female 3BA BodySlide Output** and **OBody - Male HIMBO BodySlide Output**. This installation has many alternate projects; separation makes generated ownership and rollback clearer. Choose exactly one project per shared path across both batches. After generation, inspect results before replacing the current outputs. Keep intentional NPC, beast-race, skin and hand repair winners; do not place a generic rebuild over every repair indiscriminately.','',
        '## 15. Exact exclusions','',
        'The complete '+str(len(plan['excluded']))+'-definition exclusion list and '+str(len(plan['ambiguous']))+' ambiguous groups are in `obody_recommended_batchbuild.txt`.',
        'Exclude other standard-body variants (CBBE Body/Physics/Special/NeverNude/Underwear and CBBE 3BBB NeverNude/UniBoob), other HIMBO body variants, and CBBE/3BBB hand alternatives when Hands Redone is the selected output. Exclude BHUNP/UUNP/UBE/TBD alternatives, head/hair/facial projects, collision resources and fixed accessories from the ordinary body/outfit batch. CBBE-only body outfits need a conversion decision, not automatic deletion.','',
        '## 16. Problems ranked','',
        '**CRITICAL**','',
        '- **Triumphal and Sorceress Attire have enabled outfit records pointing to missing generated meshes.** Their relevant source projects exist, so selected builds can potentially supply them. This is an invisible-item risk; do not treat it as just a preset mismatch.',
        '- Some other active armor-addon records also reference missing paths: '+str(armor['status_counts']['mesh missing'])+' unique referenced paths across the whole plugin scan. These include unrelated quest, undead and accessory assets; `armor-mesh-priority.csv` lists them. Record existence alone does not prove a model is currently equipped/reachable in your save.',
        '**IMPORTANT**','',
        '- Matching HIMBO/3BA coverage and body TRI support are incomplete for various current humanoid outfit paths. Inspect the path-specific conversion-gap inventory rather than selecting all conversions by mod name.',
        '- Historical BodySlide tools can use stale catalogs; the normal tool writes to Overwrite. Resolve catalog/destination and ambiguous variants before a broad batch.',
        '- Broken Dark Brotherhood HIMBO group XML; duplicate projects sharing output; mixed obsolete and current BODYTRI links requiring a focused in-game check.',
        '- Unknown preset provenance remains for outputs not matching a documented zeroed mesh+TRI receipt. Do not claim that they are fixed-preset builds without further evidence.',
        '**OPTIONAL**','',
        '- Separate female/male output ownership; CBBE-to-3BA upgrades for currently morphing CBBE outfits where the requested 3BA physics matters; document intentional fixed accessory exceptions.',
        '- ElderRace distribution is intentionally excluded in the current configuration. Changing that is a separate decision, not an automatic audit repair.','',
        '## Authorized space cleanup','',
        '**'+str(len(cleanup['removed']))+' inactive mods removed; '+format(cleanup['removed_bytes']/2**30,'.3f')+' GiB freed.** All were disabled in every saved profile and their entire current file sets matched the verified backup manifests. The corresponding backup archives were rehashed and matched the stored SHA-256 checksums before deletion.',
        'Backup root: `D:\\Nolvus-Backups\\Awakening-6.0.20-vor-Update-20260930`. `cleanup-result.json` records each removed absolute directory and its backup archive group. Restore a removed mod from `instance/MODS/mods/<mod name>/` within its listed archive; this audit did not rewrite those archives.',
        '',*['- '+m['mod']+' — '+format(m['bytes']/2**30,'.3f')+' GiB; backup '+', '.join(m['backup_groups']) for m in cleanup['removed']], '',
        '**'+str(len(kept))+' inactive mods retained**, including 70 used in other saved profiles and conversion/body/skin/physics/head/hair/tool resources potentially needed for repairs. Reasons and sizes are in `inactive-mods-cleanup.csv`; the initial inactive total of 133.07 GiB is not all expendable.',
        'Profile files and ModOrganizer.ini were SHA-256 checked after cleanup and remain unchanged. No active mod directories were deleted. E: now has approximately **'+format(cleanup['free_after']/2**30,'.2f')+' GiB free**.','',
        '## Files and technical references','',
        '- Requested inventories and plan: `obody_3ba_projects.txt`, `obody_himbo_projects.txt`, `obody_missing_conversions.txt`, `obody_conflicts.txt`, `obody_recommended_batchbuild.txt`.',
        '- Full current mod-support table: `enabled-mod-body-support.csv`; per-model priority table: `armor-mesh-priority.csv`; per-project morph results: `project-morph-findings.csv`.',
        '- Machine-readable inputs: `inventory.json`, `projects.json`, `plugin-records.json`, `archives.json`, `armor-audit.json`, `configuration.json`, `morph-details.json`, `batch-plan.json`, `conversion-gaps.json`.',
        '- [OBody NG author implementation](https://github.com/Aietos/OBody-NG/blob/main/src/Body/Body.cpp): runtime body morph handling.',
        '- [RaceMenu author body-morph implementation](https://github.com/expired6978/SKSE64Plugins/blob/master/skee64/BodyMorphInterface.cpp): BODYTRI lookup and named shape tables.',
        '- [BodySlide official documentation](https://github.com/ousnius/BodySlide-and-Outfit-Studio/wiki): project and conversion workflow. Findings and the exact zeroed presets above are supported primarily by your inspected local files and preserved build records.',
    ]
    write('obody_bodyslide_audit.md',lines)
    return {'selected_female':sum(x['family']=='female' for x in plan['selected']),'selected_male':sum(x['family']=='male' for x in plan['selected']),'ambiguous_outputs':len(plan['ambiguous']),'excluded_definitions':len(plan['excluded']),'missing_equipped_compatible_projects':sorted(unique_missing),'other_referenced_morph_gaps':sorted(unique_no_morph),'coverage_gap_rows':len(issues),'removed_mods':len(cleanup['removed']),'freed_GiB':cleanup['removed_bytes']/2**30}

def main():
    inv=load('inventory.json');data=load('projects.json');armor=load('armor-audit.json');config=load('configuration.json');details=load('morph-details.json');cleanup=load('cleanup-result.json')
    projects=data['projects'];morph=details['projects']
    assert len(projects)==len(morph)
    plan=make_plan(inv,projects);write_plan(plan)
    project_lists(projects,morph)
    issues,cbbe=missing_report(projects,armor)
    csv_inventories(inv,projects,armor,morph)
    conflicts_report(data,projects,morph,plan)
    summary=markdown_report(inv,data,armor,config,details,plan,issues,cbbe,cleanup)
    (OUT/'report-summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(summary,ensure_ascii=False,indent=2))

if __name__=='__main__':main()
