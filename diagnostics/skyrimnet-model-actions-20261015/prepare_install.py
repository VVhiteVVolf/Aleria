"""Prepare the approved dialogue-model change and a scoped action-footer contract."""
from copy import deepcopy
from pathlib import Path
import difflib
import hashlib
import json
import yaml

ROOT=Path(__file__).parent
MODS=Path(r'E:\Nolvus\Instances\Nolvus Awakening\MODS\mods')
RUNTIME=MODS/'SkyrimNet - Beta25 Test Runtime 20260927'
CONFIG_REL='SKSE/Plugins/SkyrimNet/config/OpenRouter.yaml'
PROMPT_REL='SKSE/Plugins/SkyrimNet/overlay/prompts/submodules/user_final_instructions/0750_embedded_actions.prompt'
NEW_MODEL='google/gemma-4-26b-a4b-it'
CONTRACT='''**Technical action footer — exception to speech-only formatting:**
- The earlier "spoken words only", "no headers or labels", and "no action descriptions" rules apply to the spoken dialogue only. They do not prohibit the technical ACTION: footer required here.
- If you accept or begin an eligible action now, output your spoken reply, then a newline and exactly ONE plain ACTION: line. A spoken agreement alone does not execute a transfer, dismissal or quest transition.
- The action line must begin at column 1 with ACTION:. Never wrap it in brackets, quotes, asterisks, Markdown bullets or code fences. Never put voice/audio tags or internal thoughts on that line.
- Keep the exact eligible action/category name and parameter keys. For a category, include its concrete intent. For TriggerDialogueLine, copy only an explicitly available bracketed dialogue code into form_id.
- When no action is appropriate, output dialogue only. Do not invent an action or emit a footer merely to fill this format.
'''

def digest(blob):return hashlib.sha256(blob).hexdigest()

def stage(rel,after,reason):
    target=RUNTIME/rel
    before=target.read_bytes()
    staged=ROOT/'approved-stage'/rel
    staged.parent.mkdir(parents=True,exist_ok=True)
    staged.write_bytes(after)
    difference=''.join(difflib.unified_diff(before.decode('utf-8-sig').splitlines(True),after.decode('utf-8-sig').splitlines(True),fromfile='before/'+rel,tofile='after/'+rel))
    # OpenRouter.yaml's legacy credential is empty; actual credentials remain in untouched Providers.yaml.
    (ROOT/('change-config.diff' if rel==CONFIG_REL else 'change-action-prompt.diff')).write_text(difference,encoding='utf-8')
    return {'target':str(target),'relative':rel,'staged':str(staged),'before_sha256':digest(before),'after_sha256':digest(after),'reason':reason}

original=yaml.safe_load((RUNTIME/CONFIG_REL).read_text(encoding='utf-8-sig'))
assert original['openrouter']['api_key']=='', 'Do not stage credentials in this diagnostic directory'
old=original['openrouter']
assert old['model_name']=='deepseek/deepseek-v4-flash-0731, google/gemma-4-31b-it'
assert old['variants']['action_evaluation']['model_name']=='google/gemma-4-31b-it'
assert len(old['model_params'])==2 and old['model_params'][0]==old['model_params'][1]
changed=deepcopy(original)
changed['openrouter']['model_name']=NEW_MODEL
changed['openrouter']['model_params']=[deepcopy(old['model_params'][0])]
pinned=[]
for name,variant in old['variants'].items():
    if not variant.get('model_name'):
        assert name in ('narrative_engine_composer','narrative_engine_director'), 'Unexpected inherited variant'
        # Changing the default dialogue slot must not silently move background extensions.
        changed['openrouter']['variants'][name]['model_name']=old['model_name']
        changed['openrouter']['variants'][name]['model_params']=deepcopy(old['model_params'])
        pinned.append(name)
restored=deepcopy(changed)
restored['openrouter']['model_name']=old['model_name']
restored['openrouter']['model_params']=old['model_params']
for name in pinned:
    del restored['openrouter']['variants'][name]['model_name']
    del restored['openrouter']['variants'][name]['model_params']
assert restored==original, 'Unapproved semantic config change'
after_config=yaml.safe_dump(changed,sort_keys=False,allow_unicode=True,width=120).encode('utf-8')
assert yaml.safe_load(after_config)==changed

before_prompt=(RUNTIME/PROMPT_REL).read_text(encoding='utf-8-sig')
intro='After your dialogue you may add ONE action on its own line. Most lines need none. Write your dialogue first, then the action line.'
new_intro='Write your dialogue first. When you accept or begin an eligible action now, append exactly ONE action on its own line; otherwise omit the action line.'
assert before_prompt.count(intro)==1 and 'Technical action footer' not in before_prompt
tail='{% endif %}\n\n{% endif %}\n{% endif %}\n'
assert before_prompt.endswith(tail)
after_prompt=before_prompt.replace(intro,new_intro,1)
after_prompt=after_prompt[:-len(tail)]+'\n'+CONTRACT+tail
assert after_prompt.replace(new_intro,intro,1).replace('\n'+CONTRACT,'',1)==before_prompt
plan={'dialogue_model':NEW_MODEL,'action_model':'google/gemma-4-31b-it','preserved_inherited_background_models':pinned,
      'changes':[stage(CONFIG_REL,after_config,'Use one approved dialogue model; retain action model and other effective variant choices'),
                 stage(PROMPT_REL,after_prompt.encode('utf-8'),'Scope speech formatting separately from the machine action footer; preserve eligibility and personal additions')]}
(ROOT/'approved-plan.json').write_text(json.dumps(plan,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in plan.items() if k!='changes'},indent=2))
print('Prepared exactly',len(plan['changes']),'files')
