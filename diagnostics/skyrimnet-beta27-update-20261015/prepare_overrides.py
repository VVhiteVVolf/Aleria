"""Rebase only pristine shipped bios and merge the one changed action instruction."""
from pathlib import Path
import difflib
import hashlib
import json

ROOT=Path(__file__).parent
MODS=Path(r'E:\Nolvus\Instances\Nolvus Awakening\MODS\mods')
RUNTIME=MODS/'SkyrimNet - Beta25 Test Runtime 20260927'
BASE=ROOT/'upstream/SkyrimNet - Beta 27/SKSE/Plugins/SkyrimNet/library/skyrimnet.base/prompts'
PATCHES=[]

def sha(blob):return hashlib.sha256(blob).hexdigest()
def save(target,content,reason):
    relative=target.relative_to(MODS)
    staged=ROOT/'overrides'/relative
    staged.parent.mkdir(parents=True,exist_ok=True)
    before=target.read_bytes();staged.write_bytes(content)
    PATCHES.append({'target':str(target),'relative':relative.as_posix(),'staged':str(staged),
                    'before_sha256':sha(before),'after_sha256':sha(content),'reason':reason})
    if target.name=='0750_embedded_actions.prompt':
        (ROOT/'action-prompt-rebase.diff').write_text(''.join(difflib.unified_diff(before.decode('utf-8-sig').splitlines(True),content.decode('utf-8-sig').splitlines(True))),encoding='utf-8')

def main():
    changes=json.loads((ROOT/'changed-base-under-overrides.json').read_text())
    for row in changes:
        assert row['matches_old_default'],'Personal edits must not be overwritten'
        target=RUNTIME/'SKSE/Plugins/SkyrimNet'/row['layer']/row['relative']
        save(target,(BASE/row['relative']).read_bytes(),'Update a byte/text-verified pristine shipped NPC biography; preserve personal bios')

    rel='SKSE/Plugins/SkyrimNet/overlay/prompts/submodules/user_final_instructions/0750_embedded_actions.prompt'
    target=RUNTIME/rel;current=target.read_text(encoding='utf-8-sig')
    old=(MODS/'SeverActions 4.2.0/SKSE/Plugins/SkyrimNet/external/severause.severactions/prompts/submodules/user_final_instructions/0750_embedded_actions.prompt').read_text(encoding='utf-8-sig')
    new=(ROOT/'stage/SeverActions 4.3.0/SKSE/Plugins/SkyrimNet/external/severause.severactions/prompts/submodules/user_final_instructions/0750_embedded_actions.prompt').read_text(encoding='utf-8-sig')
    additions=[line for line in new.splitlines() if line not in old.splitlines()]
    assert len(additions)==1 and additions[0].startswith('- Deciding to pay is acting.')
    anchor='- Going somewhere together:'
    assert current.count(anchor)==1 and 'Technical action footer' in current
    modified=current.replace(anchor,additions[0]+'\n'+anchor,1)
    assert modified.replace(additions[0]+'\n','',1)==current
    save(target,modified.encode('utf-8'),'Retain approved machine-footer contract and merge new SeverActions spontaneous-payment rule')

    registry=RUNTIME/'SKSE/Plugins/SkyrimNet/content-registry.json'
    data=json.loads(registry.read_text(encoding='utf-8-sig'))
    old_id='telord.bisr-sn-sa';new_id='telord72612.bathing-in-skyrim-renewed-integration-for-skyrimnet'
    assert old_id in data['plugins'] and new_id not in data['plugins']
    original_item=data['plugins'].pop(old_id)
    data['plugins'][new_id]=original_item
    assert data['priority'].count(old_id)==1
    data['priority']=[new_id if p==old_id else p for p in data['priority']]
    save(registry,json.dumps(data,indent=2,ensure_ascii=False).encode('utf-8'),'Migrate renamed Bathing integration ID with identical enablement and priority')
    (ROOT/'override-plan.json').write_text(json.dumps(PATCHES,indent=2),encoding='utf-8')
    print('Prepared',len(PATCHES),'reviewed file changes:',len(changes),'pristine bios, one merged action rubric, one registry ID migration')

if __name__=='__main__':main()
