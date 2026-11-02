import { getSkillIdentity } from '../skill-checks/skill-definitions.js';
import { getDevelopmentTraitId } from './development-entry-reference.js';
import { getBloodlineTraitOrigin } from './development-bloodline-traits.js';
import { getTransformationTraitOrigin } from './development-theriantrophie-traits.js';
import { effectiveHealthTraits, healthSelectionWarnings } from '../character-health/health-trait-policy.js';
import { effectivePsychologicalTraits, psychologicalSelectionWarnings } from './development-psychological-policy.js';

const damageAliases = {fire:'feuer',cold:'kälte',kaelte:'kälte',lightning:'blitz',elektrisch:'blitz',elektrizität:'blitz',
  poison:'gift',acid:'säure',saeure:'säure',thunder:'donner',schall:'donner',sonic:'donner'};
const damageKey = value => damageAliases[String(value).toLowerCase()] || String(value).toLowerCase();
const component = (key,cost,response,group) => ({key,cost,response,group});

function nonStackingParts(entry) {
  const mechanics = entry.mechanics || {};
  const parts = (mechanics.damageAffinities || []).filter(a=>['resistant','vulnerable','immune'].includes(a.response)).map(a=>{
    const type=damageKey(a.damageType),scope=a.magicScope||'any',group=`damage:${type}:${scope}`;
    return component(`${group}:${a.response}`,a.response==='resistant'?3:a.response==='immune'?6:type==='all'?-4:-2,a.response,group);
  });
  for(const skill of mechanics.skillProficiencies || []) if(skill.proficiency==='expertise') parts.push(component(`expertise:${getSkillIdentity(skill.name)}`,3));
  for(const attribute of mechanics.savingThrowAdvantageAttributes || []) parts.push(component(`save-advantage:${attribute}`,3));
  for(const rule of entry.triggerRules || []) {
    if(rule.phase!=='pre-roll'||rule.enabled===false||rule.effects?.rollMode!=='advantage'
      ||rule.condition!=='always'||rule.recipient!=='actor'||rule.sourceRelation!=='self'
      ||rule.actionKinds?.length!==1||rule.actionKinds[0]!=='skill'||rule.skillIds?.length!==1
      ||rule.requiredTargetTags?.length||rule.requiredActorId||rule.requiredTargetId) continue;
    parts.push(component(`skill-advantage:${rule.skillIds[0]}`,3));
  }
  return [...new Map(parts.map(part=>[part.key,part])).values()];
}

function relevantSources(profile,managedIds) {
  return [...(profile.quirks||[]).filter(q=>q.active!==false&&!managedIds.has(getDevelopmentTraitId(q)||q.id)),
    ...(profile.abilities||[]).filter(a=>a.active!==false&&a.activationType==='passive')];
}

// This is an advisory price evaluation, never an eligibility gate. Repeated
// resistance, vulnerability, expertise and advantage have only one real effect.
export function reviewDevelopmentTraitBalance(profile,traits) {
  const selectedTraits = traits;
  traits = effectivePsychologicalTraits(effectiveHealthTraits(traits));
  const ids=new Set(traits.map(t=>t.id));
  const external=relevantSources(profile,ids);
  const externalParts=[...external.flatMap(nonStackingParts),...nonStackingParts({mechanics:{damageAffinities:profile.damageAffinities}}),
    ...(profile.skills||[]).filter(s=>s.proficiency==='expertise').map(s=>component(`expertise:${getSkillIdentity(s.name)}`,3))];
  const supplied=new Set(externalParts.map(p=>p.key));
  const externallyCovered=(part,response)=>part.group&&externalParts.some(other=>{
    if(other.response!==response)return false;
    const [,type,scope]=part.group.split(':'),[,otherType,otherScope]=other.group.split(':');
    return (otherType==='all'||otherType===type)&&(otherScope==='any'||otherScope===scope);
  });
  const groups=new Map();
  const warnings=[...healthSelectionWarnings(selectedTraits), ...psychologicalSelectionWarnings(selectedTraits)];
  let nominalCost=traits.reduce((sum,t)=>sum+t.cost,0),traitCost=nominalCost;
  for(const trait of traits)for(const part of nonStackingParts(trait)){
    if(!groups.has(part.key))groups.set(part.key,{...part,owners:[]});
    groups.get(part.key).owners.push(trait.name);
    traitCost-=part.cost;
  }
  for(const part of groups.values()){
    const opposite=part.response==='resistant'?'vulnerable':part.response==='vulnerable'?'resistant':'';
    const cancelled=opposite&&(groups.has(`${part.group}:${opposite}`)||externallyCovered(part,opposite));
    const immune=part.group&&part.response!=='immune'&&(groups.has(`${part.group}:immune`)||externallyCovered(part,'immune'));
    const already=supplied.has(part.key)||externallyCovered(part,part.response);
    const duplicate=part.owners.length>1||already;
    if(!cancelled&&!immune&&!already)traitCost+=part.cost;
    if(duplicate)warnings.push(`Die Wirkung von ${part.owners.join(' / ')} ist bereits mehrfach vorhanden. Sie zählt bei der Balance nur einmal.`);
    if(cancelled&&part.response==='vulnerable')warnings.push(`${part.owners.join(' / ')}: Resistenz und Anfälligkeit heben sich auf. Die aufgehobenen Schadensanteile geben weder Kosten noch Gutschrift.`);
    if(immune)warnings.push(`${part.owners.join(' / ')}: Die vorhandene Immunität überdeckt diesen Schadensanteil.`);
  }
  const has=id=>ids.has(`development-trait-${id}`);
  reviewTransformationChoices(traits, warnings);
  if (traits.filter(trait => getBloodlineTraitOrigin(trait.id)).length > 1) warnings.push('Mehrere Blutlinien addieren ihre Zahlenboni. Trage jede Linie nur für eine entsprechend belegte Abstammung ein; dieselbe Herkunft soll nicht mehrfach als Erbe gezählt werden.');
  if(has('haesslich')&&has('gutaussehend'))warnings.push('Hässlich und Gutaussehend widersprechen sich als dauerhafte Erscheinungsmerkmale. Kläre, ob eine besondere Erklärung gewollt ist.');
  if(has('klein')&&(has('gross')||has('huenenhaft')))warnings.push('Klein und Groß/Hünenhaft beschreiben widersprüchliche Körpergrößen. Die Kombination bleibt frei wählbar.');
  if(has('gross')&&has('huenenhaft'))warnings.push('Groß und Hünenhaft beschreiben dieselbe Größenrichtung; ihre Zahlenboni addieren sich. Prüfe, ob beide gewollt sind.');
  if(has('magiescheu')&&!profile.magic?.enabled)warnings.push('Magiescheu schränkt diese Figur derzeit kaum ein, solange sie keine Magie verwendet. Die Gutschrift ist nur ein Richtwert.');
  if(has('magie-phobie')&&has('magische-resonanz'))warnings.push('Magiephobie und Magische Resonanz sind zusammen besonders gefährlich: schlechtere Rettungswürfe und doppelter magischer Schaden.');
  if(has('magische-resonanz')&&traits.some(trait=>trait.id!=='development-trait-magische-resonanz'&&(trait.mechanics.damageAffinities||[]).some(affinity=>affinity.response==='vulnerable')))warnings.push('Magische Resonanz und eine weitere Anfälligkeit überlappen bei magischem Elementarschaden. Der Schaden wird dadurch nicht vierfach; zusätzliche nichtmagische Anfälligkeit bleibt bestehen.');
  return {nominalCost,traitCost,adjustment:traitCost-nominalCost,warnings:[...new Set(warnings)]};
}

function reviewTransformationChoices(traits, warnings) {
  const origins = traits.map(trait => getTransformationTraitOrigin(trait.id)).filter(Boolean);
  const animals = new Set(origins.filter(origin => origin.kind === 'therianthropy').map(origin => origin.animal));
  for (const animal of animals) {
    const states = new Set(origins.filter(origin => origin.kind === 'therianthropy' && origin.animal === animal).map(origin => origin.state));
    if (states.size > 1) warnings.push(`${animal}: Fluchform und Jüngersegen beschreiben alternative Ausprägungen. Prüfe die doppelte Auswahl; ihre Zahlen würden sich sonst addieren.`);
  }
  const bears = origins.filter(origin => origin.kind === 'symbiosis' && origin.lineageId === 'mhathain-bear');
  if (bears.length > 1) warnings.push('Diuid, Lockart und Haig führen ihr Bärenerbe auf dieselbe Mhathain-Linie zurück. Wähle die passende Clanprägung, damit dieselbe Symbiose nicht mehrfach als unabhängiges Erbe gezählt wird.');
}

const meaningful=value=>Array.isArray(value)?value.map(meaningful):value&&typeof value==='object'
  ?Object.fromEntries(Object.keys(value).sort().filter(key=>value[key]&&value[key]!=='normal'&&(!Array.isArray(value[key])||value[key].length)).map(key=>[key,meaningful(value[key])])):value;

export function findExistingDevelopmentTraitMatches(profile,traits) {
  const managed=new Set(traits.map(t=>t.id)),sources=relevantSources(profile,managed),matches=[];
  for(const trait of traits){
    const parts=nonStackingParts(trait);
    const numeric=!(trait.triggerRules||[]).length&&Object.keys(meaningful(trait.mechanics)).length;
    const names=sources.filter(source=>numeric&&!(source.triggerRules||[]).length&&JSON.stringify(meaningful(source.mechanics))===JSON.stringify(meaningful(trait.mechanics))
      ||parts.some(part=>nonStackingParts(source).some(existing=>existing.key===part.key))).map(s=>s.name);
    if(names.length)matches.push({traitId:trait.id,traitName:trait.name,sourceNames:[...new Set(names)]});
  }
  return matches;
}
