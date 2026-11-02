import { COMBAT_ATTRIBUTE_DEFINITIONS, COMBAT_WEAPON_TYPE_OPTIONS, getSkillTotal } from '../combat/combat-profile-model.js';
import { CHARACTER_CLASS_TEMPLATES, getGroupedCharacterClassTemplates } from '../combat/character-creation-templates.js';
import { getCenyrClassDefinition } from '../classes/cenyr/cenyr-class-registry.js';
import { getSkillIdentity } from '../skill-checks/skill-definitions.js';
import { renderCharacterSkillIcon } from '../characters/character-skill-icons.js';
import { renderAttributeIcon } from '../skill-checks/attribute-icon-registry.js';
import { renderEquipmentArtwork } from '../character-equipment/equipment-artwork-view.js';
import { getCharacterArchiveEntryIconPresentation } from '../character-archive/character-archive-icons.js';
import { getSelectedCreationClasses, getCreationSkillSuggestions, getCreationClassSuggestions } from './creation-training-model.js';

const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const checked=value=>value?' checked':'';
const selected=(value,expected)=>value===expected?' selected':'';
const trainingLabels={none:'Ungeübt',trained:'Geübt',expertise:'Expertise'};
const armorLabels={light:'Leichte Rüstung',medium:'Mittlere Rüstung',heavy:'Schwere Rüstung',shield:'Schilde'};
const weaponLabels={simple:'Einfache Waffen',martial:'Kriegswaffen',special:'Besondere Waffen',...Object.fromEntries(COMBAT_WEAPON_TYPE_OPTIONS.map(type=>[type.id,type.label]))};
export const getCreationProficiencyLabel=(kind,id)=>kind==='armor'?(armorLabels[id]||id):kind==='weapons'?(weaponLabels[id]||id):id;

export function renderCreationClassOptions(value,draft={}) {
  const known=CHARACTER_CLASS_TEMPLATES.some(template=>template.id===value);
  return `<option value="">Hauptklasse wählen …</option><option value="custom"${selected(value,'custom')}>Eigene Ausbildung</option>${!known&&value&&value!=='custom'?`<option value="${escape(value)}" selected>${escape(draft.existingClassLabel||value)}</option>`:''}${[...getGroupedCharacterClassTemplates()].map(([group,templates])=>`<optgroup label="${escape(group)}">${templates.map(template=>`<option value="${escape(template.id)}"${selected(value,template.id)}>${escape(template.label)} · ${escape(template.subtitle)}</option>`).join('')}</optgroup>`).join('')}`;
}

export function renderCreationSkillsStep(draft,profile,preview) {
  const suggested=new Map(getCreationSkillSuggestions(draft).map(skill=>[skill.key,skill]));
  return `<section class="cp-setup-step"><header><span>Schritt 3 · Deine Kenntnisse</span><h3>Fertigkeiten vorbereiten</h3><p>Du wählst jede Fertigkeit selbst. Herkunft und Klassen zeigen nur Vorschläge; ohne deine Auswahl wird keine Fertigkeit hinzugefügt.</p></header>
    <div class="development-toolbar"><button type="button" data-creation-action="suggest-skills">Vorschläge auswählen</button><button type="button" data-creation-action="clear-skills">Alle abwählen</button><button type="button" data-creation-action="restore-skills">Bisherige Ausbildung wiederherstellen</button></div>
    <div class="cp-creation-skills">${profile.skills.map(skill=>{
      const key=getSkillIdentity(skill.name),choice=draft.skillChoices[key]||'none',suggestion=suggested.get(key);
      const current=preview.profile.skills.find(s=>s.id===skill.id)||skill;
      return `<article class="cp-creation-skill${choice!=='none'?' is-selected':''}">${renderCharacterSkillIcon(skill)}<div><strong>${escape(skill.name)}</strong><small>${escape(COMBAT_ATTRIBUTE_DEFINITIONS.find(a=>a.key===skill.attributeKey)?.label||'Eigene Fertigkeit')} · Gesamt ${getSkillTotal(preview.profile,current)>=0?'+':''}${getSkillTotal(preview.profile,current)}</small>${suggestion?`<small class="creation-suggestion">Vorschlag: ${escape(suggestion.sources.join(', '))}</small>`:''}</div><label><input type="checkbox" data-creation-skill-check="${escape(key)}"${checked(choice!=='none')} aria-label="${escape(skill.name)} auswählen"></label><select data-creation-skill="${escape(key)}" aria-label="Ausbildung in ${escape(skill.name)}">${Object.entries(trainingLabels).map(([id,label])=>`<option value="${id}"${selected(choice,id)}>${label}</option>`).join('')}</select></article>`;
    }).join('')}</div><p class="cp-setup-rule-note">Aktive Traits können zusätzlich Boni oder Expertise geben. Sie verändern die hier gespeicherte Grundausbildung nicht.</p></section>`;
}

function classIcon(template) {
  const icon=getCharacterArchiveEntryIconPresentation({kind:'class',name:template.label,data:template}).source;
  return icon?`<img src="${escape(icon)}" alt="" loading="lazy" width="42" height="42">`:'';
}
function proficiencyChoices(draft,kind,suggested) {
  const own=draft.trainingChoices.proficiencies[kind]||[];
  const options=[...new Set([...Object.keys(kind==='armor'?armorLabels:weaponLabels),...CHARACTER_CLASS_TEMPLATES.flatMap(c=>c.proficiencies?.[kind]||[]),...own])];
  return `<fieldset class="creation-proficiency-options"><legend>${kind==='armor'?'Rüstungsausbildung':'Waffenausbildung'}</legend>${options.map(id=>`<label><input type="checkbox" data-creation-proficiency="${kind}" data-creation-proficiency-value="${escape(id)}"${checked(own.includes(id))}><span>${escape(getCreationProficiencyLabel(kind,id))}${suggested.includes(id)?'<small>Vorschlag der Klassen</small>':''}</span></label>`).join('')}</fieldset>`;
}

export function renderCreationClassStep(draft) {
  const classes=getSelectedCreationClasses(draft),suggested=getCreationClassSuggestions(draft),training=draft.trainingChoices;
  const primary=draft.selections.classId,foundations=getCenyrClassDefinition(primary)?.foundationSelection?.options||[];
  const magicModes={preserve:'Bestehende Einstellung erhalten',class:'Vorschlag der Hauptklasse',none:'Keine Magie oder Fokusausbildung',full:'Vollständige Manaausbildung',half:'Halbe Manaausbildung',focus:'Fokusausbildung',pact:'Paktpunkte',celestial:'Celestiale Punkte',infernal:'Infernale Punkte'};
  return `<section class="cp-setup-step"><header><span>Schritt 4 · Eigene Ausbildung</span><h3>${escape(classes.map(c=>c.label).join(' / ')||'Freie Ausbildung')} · Kampfausbildung</h3><p>Eine Hauptklasse bestimmt die empfohlenen Stufenwerte. Zusätzliche Klassen erweitern die Vorschläge und zählen im Kaufbereich als eigene Klassen. Besondere Klassenfähigkeiten werden weiterhin einzeln ausgearbeitet.</p></header>
    <label class="creation-main-class"><span>Hauptklasse für die Stufenwerte</span><select data-creation-field="classId">${renderCreationClassOptions(primary,draft)}</select></label>
    <details class="creation-class-picker" open><summary>Weitere Klassen kombinieren</summary><div>${CHARACTER_CLASS_TEMPLATES.map(template=>`<label>${classIcon(template)}<input type="checkbox" data-creation-class="${escape(template.id)}"${checked(primary===template.id||draft.additionalClassIds.includes(template.id))}${primary===template.id?' disabled':''}><span>${escape(template.label)}<small>${escape(template.subtitle||'')}</small></span></label>`).join('')}</div></details>
    <label class="cp-setup-check"><input type="checkbox" data-creation-field="includeCustomClass"${checked(draft.includeCustomClass||primary==='custom')}${primary==='custom'?' disabled':''}> Eigene Ausbildung ergänzen</label>
    ${draft.includeCustomClass||primary==='custom'?`<div class="cp-level-up-fields"><label><span>Name der eigenen Ausbildung</span><input data-creation-custom="name" value="${escape(draft.customClass.name)}" maxlength="100" placeholder="Zum Beispiel: Hafenwächterin"></label><label><span>Beschreibung</span><textarea data-creation-custom="description" maxlength="1200">${escape(draft.customClass.description)}</textarea></label></div>`:''}
    ${foundations.length?`<label><span>Grundausbildung des Derwyn</span><select data-creation-field="foundationFormId"><option value="">Grundausbildung wählen …</option>${foundations.map(option=>`<option value="${escape(option.formId)}"${selected(draft.foundationFormId,option.formId)}>${escape(option.name)}</option>`).join('')}</select></label>`:''}
    <div class="development-toolbar"><button type="button" data-creation-action="suggest-training">Ausbildungsvorschläge übernehmen</button></div>
    <div class="cp-level-up-fields"><label><span>Trefferwürfel</span><select data-creation-training="hitDieOverride"><option value="">Empfehlung der Hauptklasse${suggested.hitDie?` · W${suggested.hitDie}`:''}</option>${[4,6,8,10,12,20].map(die=>`<option value="${die}"${selected(training.hitDieOverride,die)}>W${die}</option>`).join('')}</select></label><label><span>Magie und Fokus</span><select data-creation-training="magicMode">${Object.entries(magicModes).map(([id,label])=>`<option value="${id}"${selected(training.magicMode,id)}>${label}</option>`).join('')}</select></label><label><span>Attribut eigener Magieausbildung</span><select data-creation-training="castingAttribute">${COMBAT_ATTRIBUTE_DEFINITIONS.map(attribute=>`<option value="${attribute.key}"${selected(training.castingAttribute,attribute.key)}>${attribute.label}</option>`).join('')}</select></label></div>
    <fieldset class="creation-save-options"><legend>Geübte Rettungswürfe selbst auswählen</legend>${COMBAT_ATTRIBUTE_DEFINITIONS.map(attribute=>`<label>${renderAttributeIcon(attribute.key)}<input type="checkbox" data-creation-save="${attribute.key}"${checked(training.savingThrows.includes(attribute.key))}><span>${attribute.label}${suggested.savingThrows.includes(attribute.key)?'<small>Vorschlag der Klassen</small>':''}</span></label>`).join('')}</fieldset>
    <div class="creation-proficiency-grid">${proficiencyChoices(draft,'weapons',suggested.proficiencies.weapons)}${proficiencyChoices(draft,'armor',suggested.proficiencies.armor)}</div>
    <div class="cp-level-up-fields">${[['tools','Werkzeuge und weitere Ausbildungen'],['languages','Sprachen']].map(([kind,label])=>`<label><span>${label}</span><textarea data-creation-training-list="${kind}" placeholder="Ein Eintrag je Zeile">${escape(training.proficiencies[kind].join('\n'))}</textarea>${suggested.proficiencies[kind].length?`<small>Vorschlag: ${escape(suggested.proficiencies[kind].join(', '))}</small>`:''}</label>`).join('')}</div>
    <details class="creation-typical-weapons"><summary>Typische Waffen der gewählten Klassen · nur zur Orientierung</summary><p>Diese Abbildungen und Namen legen keine Gegenstände an. Ausrüstung fügst du später manuell hinzu.</p><div>${classes.flatMap(template=>(template.weapons||[]).map(weapon=>`<article>${renderEquipmentArtwork(weapon)}<span><strong>${escape(weapon.name)}</strong><small>${escape(template.label)}</small></span></article>`)).join('')||'<p>Für diese Auswahl sind noch keine typischen Waffen hinterlegt.</p>'}</div></details>
  </section>`;
}
