"""Verify that action quest scripts are actually attached to active quest records."""
from pathlib import Path
from collections import defaultdict
import json
import struct
import sys
import yaml

sys.path.insert(0,r'E:\Aleria\skyrim-outfit-catalog\scripts')
from plugin_reader import records,text
from profile_reader import selected_profile
ROOT=Path(__file__).parent
INSTANCE=Path(r'E:\Nolvus\Instances\Nolvus Awakening')

def script_names(data):
    cursor=0
    def num(fmt):
        nonlocal cursor
        result=struct.unpack_from('<'+fmt,data,cursor)[0];cursor+=struct.calcsize('<'+fmt);return result
    def string():
        nonlocal cursor
        size=num('H');result=data[cursor:cursor+size].decode('utf-8');cursor+=size;return result
    version=num('H');fmt=num('H');count=num('H')
    assert fmt in (1,2) and version<=5
    def value(kind):
        nonlocal cursor
        if kind==1:cursor+=8
        elif kind==2:string()
        elif kind in (3,4):cursor+=4
        elif kind==5:cursor+=1
        elif 11<=kind<=15:
            for _ in range(num('I')):value(kind-10)
        else:raise ValueError('Unexpected Skyrim VMAD property type '+str(kind))
    names=[]
    for _ in range(count):
        names.append(string());num('B')
        for _ in range(num('H')):
            string();kind=num('B');num('B');value(kind)
    return names

def main():
    installed='--installed' in sys.argv
    state=selected_profile(INSTANCE)
    plans=json.loads((ROOT/'package-plan.json').read_text())
    substitutions={p['old']:ROOT/'stage'/p['new'] for p in plans}
    sources=[(name,path if installed else substitutions.get(name,path)) for name,path in state['sources'] if installed or name!='OStim Navigator 2.2.0']
    plugin_files={}
    for name,path in sources:
        if path.is_dir():
            for f in path.iterdir():
                if f.suffix.lower() in ('.esp','.esm','.esl'):plugin_files.setdefault(f.name.lower(),f)
    bindings=json.loads((ROOT/('installed-validation.json' if installed else 'staging-validation.json')).read_text())['bindings']
    wanted=defaultdict(set)
    for row in bindings:
        action=yaml.safe_load(Path(row['file']).read_text(encoding='utf-8-sig'))
        quest=action.get('questEditorID') or action.get('questEditorId')
        assert quest,'Missing quest editor ID for '+row['action']
        wanted[quest].add(row['script'])
    quests={};errors=[]
    # Use the known related providers; no full multi-gigabyte base-game scan is needed.
    related={'severactions.esp','severshearth.esp','intelengine.esp','snleverinteraction.esp','tt_ostimnet.esp','severactions - dirtiness.esp'}
    for name in state['plugins']:
        if name.lower() not in related:continue
        for _,_,form,fields in records(plugin_files[name.lower()],(b'QUST',)):
            d=dict(fields);editor=text(d.get(b'EDID',b''))
            if editor not in wanted:continue
            attached=script_names(d[b'VMAD']) if b'VMAD' in d else []
            status={script:script.lower() in {s.lower() for s in attached} for script in wanted[editor]}
            quests[editor]={'plugin':name,'form':hex(form),'script_attachments':status}
            errors.extend({'quest':editor,'script':script} for script,ok in status.items() if not ok)
    missing=list(wanted.keys()-quests.keys())
    result={'quests':quests,'not_found_in_related_plugins':missing,'attachment_errors':errors}
    (ROOT/('installed-quest-attachments.json' if installed else 'quest-attachment-validation.json')).write_text(json.dumps(result,indent=2),encoding='utf-8')
    print('Quest attachments',len(quests),'quests',sum(len(q['script_attachments']) for q in quests.values()),'scripts; missing',missing,'errors',errors)
    assert not missing and not errors

if __name__=='__main__':main()
