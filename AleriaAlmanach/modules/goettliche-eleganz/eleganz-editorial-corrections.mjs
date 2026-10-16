import { eleganzPerson } from './eleganz-family-people.mjs';

// Bounded replacements explicitly requested by the user. The publication
// still rejects an unrelated online portrait or module edit.
export const ELEGANZ_PORTRAIT_CORRECTIONS = Object.freeze(['gwenora','maelwen'].map(key=>({
  key,worldPersonId:eleganzPerson(key).worldPersonId,
  before:`./assets/goettliche-eleganz/portraits/${key}.png`,after:eleganzPerson(key).portrait
})));

export function beforeEleganzEditorialCorrections(entry) {
  const previous = JSON.parse(JSON.stringify(entry,(key,value)=>
    ELEGANZ_PORTRAIT_CORRECTIONS.find(item=>item.after===value)?.before || value));
  delete previous.previewImage;
  return previous;
}

export function withEleganzPortraitCorrections(plan,characters) {
  return {...plan,entries:plan.entries.map(entry=>{
    if(entry.create) return entry;
    const correction=ELEGANZ_PORTRAIT_CORRECTIONS.find(item=>item.key===entry.key);
    if(!correction) return entry;
    const prior=characters.find(character=>character.id===entry.id);
    if(![correction.before,correction.after].includes(prior?.portrait)) {
      throw new Error(`Abweichendes Online-Porträt: ${entry.key}`);
    }
    return prior.portrait===correction.after?entry:{...entry,patch:{...entry.patch,portrait:correction.after}};
  })};
}
