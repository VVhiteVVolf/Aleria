import { DEVELOPMENT_TRAITS } from './development-traits.js';
import { getDevelopmentAttackCatalog, getDevelopmentAttackCost, isOwnDevelopmentClass } from './development-purchases.js';
import { renderDevelopmentSelections } from './development-overview.js';
import { findExistingDevelopmentTraitMatches } from './development-balance-review.js';
import { getDevelopmentTechniqueId } from './development-entry-reference.js';
import { getBloodlineTraitOrigin } from './development-bloodline-traits.js';
import { getTransformationTraitOrigin } from './development-theriantrophie-traits.js';
import { HEALTH_TRAIT_FILTERS, healthCategoryNote, healthTraitSourceMarkup } from '../character-health/health-development-ui.js';
import { selectHealthTrait } from '../character-health/health-trait-policy.js';
import { getHealthTraitOrigin } from '../character-health/health-trait-catalog.js';
import { getPsychologicalTraitOrigin, PSYCHOLOGICAL_TRAIT_NOTE } from './development-psychological-traits.js';
import { selectPsychologicalTrait } from './development-psychological-policy.js';
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sign = n => n > 0 ? `+${n}` : n;
export function renderDevelopmentAttacks(profile, preview) {
  const plan = preview.plan;
  const known = new Set(profile.techniques.map(getDevelopmentTechniqueId));
  const needle = String(plan.purchaseSearch || '').toLocaleLowerCase('de');
  const choices = getDevelopmentAttackCatalog().filter(e => (e.minimumLevel <= plan.targetLevel || plan.purchaseIds.includes(e.id)) && !known.has(e.technique.id))
    .filter(e => !plan.purchaseClass || (plan.purchaseClass === 'selected' ? plan.purchaseIds.includes(e.id) : plan.purchaseClass === 'own' ? isOwnDevelopmentClass(profile, e) : e.curriculumId === plan.purchaseClass))
    .filter(e => !needle || `${e.technique.name} ${e.className} ${e.formName}`.toLocaleLowerCase('de').includes(needle));
  return choices.length ? choices.map(e => `<label class="development-attack"><input type="checkbox" data-development-purchase="${escape(e.id)}"${plan.purchaseIds.includes(e.id) ? ' checked' : ''}><span><b>${escape(e.technique.name)}</b><small>${escape(e.className)} · ${escape(e.formName)} · ab ${e.minimumLevel}</small>${e.minimumLevel>plan.targetLevel?'<small>Die Zielstufe ist für diesen Kauf zu niedrig. Auswahl hier abwählen oder Zielstufe erhöhen.</small>':''}<small>${escape(e.technique.description || e.technique.notes || '')}</small></span><strong>${getDevelopmentAttackCost(profile, e, plan.development)} P</strong></label>`).join('') : '<p>Keine passenden neuen Attacken. Klasse oder Suche ändern.</p>';
}
export function renderDevelopmentBalance(preview) {
  const b = preview.balance;
  return `<strong class="${b.remaining < 0 ? 'development-negative' : ''}">${b.remaining} Balancepunkte übrig</strong><span>${b.earned} verfügbar · ${b.spent} für Attacken · ${sign(b.traitCost)} für Traits</span>${b.adjustment?`<small>Einzelpreise ${sign(b.nominalCost)} P · Korrektur für nicht stapelnde Wirkungen ${sign(b.adjustment)} P.</small>`:''}<small>Ein negativer Stand ist erlaubt. Er verhindert weder Käufe noch das Speichern.</small>${renderDevelopmentWarnings(preview)}`;
}
function renderDevelopmentWarnings(preview) {
  return preview.balance.warnings?.length?`<ul class="development-advice">${preview.balance.warnings.map(warning=>`<li>${escape(warning)}</li>`).join('')}</ul>`:'';
}
export function renderDevelopmentTraits(plan, profile={}) {
  const existing=new Map(findExistingDevelopmentTraitMatches(profile,DEVELOPMENT_TRAITS).map(match=>[match.traitId,match.sourceNames]));
  const needle=String(plan.traitSearch||'').toLocaleLowerCase('de');
  const traits=DEVELOPMENT_TRAITS.filter(t=>!needle||`${t.name} ${t.description}`.toLocaleLowerCase('de').includes(needle))
    .filter(t=>matchesTraitGroup(t,plan));
  return traits.length?renderTraitCategoryNote(plan.traitGroup)+traits.map(t=>`<label class="development-trait"><input type="checkbox" data-development-trait="${t.id}"${plan.traitIds.includes(t.id)?' checked':''}><img src="${t.icon}" alt="" loading="lazy"><span><b>${escape(t.name)} <small>${sign(t.cost)} P</small></b><small>${escape(t.description)}</small>${renderDevelopmentTraitOrigin(t)}${existing.has(t.id)?`<small class="development-existing-effect">Ähnliche oder gleiche Rechenwirkung vorhanden: ${escape(existing.get(t.id).join(', '))}. Persönliche Merkmale bleiben erhalten.</small>`:''}</span></label>`).join(''):'<p>Keine passenden Traits.</p>';
}
function renderTraitCategoryNote(group) {
  const notes = {
    bloodline: 'Blutträger sind Menschen mit einem infernalen oder celestialen Vorfahren. Diese angeborene Anlage wird hier dokumentiert oder nachgetragen. Die Punkte bewerten ihre Wirkung; Abstammung wird nicht durch Training erworben. Zauber und weitere Fähigkeiten werden individuell ausgearbeitet.',
    therianthropy: 'Zatrachs Fluchform und Jüngersegen sind verschiedene Ausprägungen. Die Fluchform wandelt ungewollt und verliert die Kontrolle; der Jüngersegen erhält grundsätzlich Verstand und Steuerung. Wähle die passende Ausprägung je Tier. Die Zahlen bilden die passive Grundprägung ab; Vollformen, Mondereignisse und ihre Handlungen werden individuell geführt.',
    symbiosis: 'Silvanas Symbiose ist erblich und nicht ansteckend. Diese Clanmerkmale bilden die Grundprägung der Tierverbundenheit ab. Tierkommunikation, kontrollierte Tiergestalt und die Urform eines Champions benötigen eine individuell belegte Ausprägung. Ein Clanname allein vergibt diese Fähigkeiten nicht.'
  };
  const note = notes[group] || (group === 'psychological' ? PSYCHOLOGICAL_TRAIT_NOTE : healthCategoryNote(group));
  return note ? `<p class="development-advice">${note}</p>` : '';
}
function renderDevelopmentTraitOrigin(trait) {
  const origin = getBloodlineTraitOrigin(trait.id);
  if (origin) {
    const examples = origin.examples.length ? ` · Belegtes Beispiel: ${origin.examples.map(example => example.name).join(', ')}` : '';
    return `<small>Angeboren · ${origin.kind === 'infernal' ? 'Infernales' : 'Celestiales'} Erbe${escape(examples)} · <a href="${escape(origin.referenceUrl)}" target="_blank" rel="noopener">Bestiarium ↗</a></small>`;
  }
  const transformation = getTransformationTraitOrigin(trait.id);
  if (!transformation) return healthTraitSourceMarkup(trait);
  const source = `<a href="${escape(transformation.referenceUrl)}" target="_blank" rel="noopener">Modul ↗</a>`;
  if (transformation.kind === 'therianthropy') return `<small>${transformation.state === 'curse' ? 'Infernaler Fluch' : 'Zatrachs Jüngersegen'} · ${escape(transformation.form)} · ${source}${transformation.sourceBasis === 'authored-variant' ? ' · Ergänzende Tierausarbeitung' : ''}</small>`;
  return `<small><img class="development-clan-emblem" src="${escape(transformation.clanEmblem)}" alt="Wappen ${escape(transformation.clanName)}" loading="lazy"> <a href="${escape(transformation.clanUrl)}" target="_blank" rel="noopener">${escape(transformation.clanName)} ↗</a> · ${escape(transformation.animal)} · Angeborenes Clanerbe · ${source}${transformation.confidence === 'rare-unconfirmed-tradition' ? ' · Seltene Clanüberlieferung' : ''}</small>`;
}
function matchesTraitGroup(trait, plan) {
  switch (plan.traitGroup) {
    case 'selected': return plan.traitIds.includes(trait.id);
    case 'body': return trait.tags.includes('Körper');
    case 'normal': return !trait.tags.includes('Körper');
    case 'unique': return trait.tags.includes('Besondere Eigenheit');
    case 'aptitude': return trait.tags.includes('Begabung');
    case 'bloodline': return trait.tags.includes('Blutträger');
    case 'therianthropy': return trait.tags.includes('Zatracher Theriantrophie');
    case 'symbiosis': return trait.tags.includes('Silvanische Symbiose');
    case 'affliction': return trait.tags.includes('Dauerhaftes Leiden');
    case 'fever': return trait.tags.includes('Arkanistenfieber');
    case 'addiction': return trait.tags.includes('Abhängigkeit');
    case 'tolerance': return trait.tags.includes('Substanztoleranz');
    case 'psychological': return trait.tags.includes('Psychologische Prägung');
    case 'positive': return trait.cost > 0;
    case 'negative': return trait.cost < 0;
    default: return true;
  }
}
export function renderDevelopmentShop(profile, preview) {
  const p = preview.plan;
  const classes = [...new Map(getDevelopmentAttackCatalog().map(e => [e.curriculumId, e.className])).entries()];
  const settings = [['startingPoints', 'Startpunkte', -9999, 9999], ['pointsPerLevel', 'Punkte je Stufe', 0, 999], ['ownClassCost', 'Grundpreis eigene Klasse', 0, 999], ['foreignMultiplier', 'Faktor fremde Klasse', 1, 20], ['levelSurcharge', 'Aufpreis je vier Lernstufen', 0, 99], ['adjustment', 'Freie Balancekorrektur', -99999, 99999]];
  return `<section class="cp-level-up-section development-shop" data-development-role="shop">
    <div class="cp-level-up-section-head"><div><span>Individuelle Ausbildung</span><h4>Attacken kaufen</h4></div><small>Vorhandene Attacken bleiben erhalten. Neue Attacken werden ausschließlich gewählt.</small></div>
    <div class="development-balance" data-development-role="balance" aria-live="polite">${renderDevelopmentBalance(preview)}</div>
    ${renderDevelopmentSelections(p)}
    <details><summary>Balance und Preise anpassen</summary><div class="cp-level-up-fields">${settings.map(([key, label, min, max]) => `<label><span>${label}</span><input type="number" min="${min}" max="${max}" data-level-up-path="development.${key}" value="${p.development[key]}"></label>`).join('')}</div><p>Die Einstellungen gelten für diese Figur. Bereits bezahlte Käufe behalten ihren damaligen Preis. Bestehende Attacken kosten rückwirkend keine Punkte. Die Bilanz bewertet Käufe und hier gewählte Katalogtraits; persönliche Sondermerkmale und freie Grundausbildung werden nicht pauschal nachberechnet.</p></details>
    <div class="cp-level-up-fields"><label><span>Klasse</span><select data-level-up-path="purchaseClass"><option value="own"${p.purchaseClass === 'own' ? ' selected' : ''}>Eigene Klasse</option><option value=""${p.purchaseClass === '' ? ' selected' : ''}>Alle Klassen</option><option value="selected"${p.purchaseClass==='selected'?' selected':''}>Gewählte Käufe (${p.purchaseIds.length})</option>${classes.map(([id, name]) => `<option value="${escape(id)}"${p.purchaseClass === id ? ' selected' : ''}>${escape(name)}</option>`).join('')}</select></label><label><span>Attacke suchen</span><input type="search" data-level-up-path="purchaseSearch" value="${escape(p.purchaseSearch)}" placeholder="Name oder Form"></label></div>
    <div class="development-attacks" data-development-role="attacks">${renderDevelopmentAttacks(profile, preview)}</div>
    ${!getDevelopmentAttackCatalog().some(entry=>isOwnDevelopmentClass(profile,entry))?'<p class="development-advice">Für die eigene Klasse ist noch kein freigegebener Kaufkatalog hinterlegt. Fremde Klassen kannst du über „Alle Klassen“ ansehen. Entwurfstechniken werden durch einen Kauf nicht freigeschaltet.</p>':''}
    <p>Der Kauf bildet eine individuelle Einzelausbildung ab. Waffen-, Schild-, Reit- und Aktionsvoraussetzungen gelten beim Einsatz weiterhin; fremde Klassenpassiven werden nicht mitgekauft.</p>
    <h4>${DEVELOPMENT_TRAITS.length} wählbare Traits</h4><p>Positive und negative Kosten zählen zur Balance. Traits können hier auch später geändert werden. Darunter sind 20 körperbezogene Merkmale. Zahlenboni können sich addieren; mehrfacher Vorteil, Expertise oder dieselbe Resistenz werden nicht vervielfacht.</p>
    <div class="cp-level-up-fields"><label><span>Traits filtern</span><select data-level-up-path="traitGroup">${Object.entries({all:'Alle Traits',selected:'Gewählte Traits',normal:'Normale Traits',body:'Körpermerkmale',unique:'Besondere Eigenheiten',aptitude:'Begabungen',bloodline:'Blutträger · angeboren',therianthropy:'Zatracher Theriantrophie',symbiosis:'Silvanische Symbiose',...HEALTH_TRAIT_FILTERS,psychological:'Psychologische Prägungen',positive:'Positive Balancekosten',negative:'Negative Balancekosten'}).map(([id,label])=>`<option value="${id}"${p.traitGroup===id?' selected':''}>${label}</option>`).join('')}</select></label><label><span>Trait suchen</span><input type="search" data-level-up-path="traitSearch" value="${escape(p.traitSearch)}" placeholder="Name oder Wirkung"></label></div>
    <div class="development-traits" data-development-role="traits">${renderDevelopmentTraits(p,profile)}</div>
  </section>`;
}
export function updateDevelopmentSelection(plan, target) {
  const id = target.dataset.developmentPurchase || target.dataset.developmentTrait;
  if (!id) return false;
  const key = target.dataset.developmentPurchase ? 'purchaseIds' : 'traitIds';
  plan[key] = target.dataset.developmentTrait && target.checked ? selectPsychologicalTrait(selectHealthTrait(plan[key] || [], id), id)
    : [...new Set([...(plan[key] || []).filter(value => value !== id), ...(target.checked ? [id] : [])])];
  return true;
}
export function refreshDevelopmentShop(root, profile, preview, changedTarget = null) {
  const attacks = root?.querySelector('[data-development-role="attacks"]');
  const balance = root?.querySelector('[data-development-role="balance"]');
  if (attacks && !changedTarget?.dataset.developmentPurchase) attacks.innerHTML = renderDevelopmentAttacks(profile, preview);
  if (balance) balance.innerHTML = renderDevelopmentBalance(preview);
  const selections = root?.querySelector('[data-development-role="selections"]');
  if (selections) selections.outerHTML = renderDevelopmentSelections(preview.plan);
  const selected=root?.querySelector('[data-level-up-path="purchaseClass"] option[value="selected"]');
  if(selected)selected.textContent=`Gewählte Käufe (${preview.plan.purchaseIds.length})`;
  const traits=root?.querySelector('[data-development-role="traits"]');
  if(traits&&(!changedTarget||['traitSearch','traitGroup'].includes(changedTarget.dataset.levelUpPath)||preview.plan.traitGroup==='selected'||getHealthTraitOrigin(changedTarget?.dataset?.developmentTrait)||getPsychologicalTraitOrigin(changedTarget?.dataset?.developmentTrait)))traits.innerHTML=renderDevelopmentTraits(preview.plan,profile);
}
