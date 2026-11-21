import { resolveCombatProfile } from '../../../AleriaAlmanach/modules/combat/combat-profile-resolver.js';
import { sanitizeCreature } from '../../../AleriaAlmanach/modules/creatures/creature-model.js';
import { BESTIARY_ENCOUNTER_CARDS } from '../../../AleriaAlmanach/modules/creatures/catalog/bestiary-encounter-cards.js';
import { ENCOUNTER_GROUPS, encounterIcon } from '../../../AleriaAlmanach/modules/creatures/catalog/encounter-card-model.js';

const e = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const dice = value => String(value || '').replaceAll(/(\d)d(\d)/gi, '$1W$2');
const number = value => new Intl.NumberFormat('de').format(value || 0);
const signed = value => `${Number(value) >= 0 ? '+' : '−'}${Math.abs(Number(value) || 0)}`;
const attribute = { dexterity: 'GES', strength: 'ST', constitution: 'KON', wisdom: 'WIS', charisma: 'CHA', intelligence: 'INT' };
const actionLabels = { action: 'Aktion', 'bonus-action': 'Bonusaktion', reaction: 'Reaktion', 'special-action': 'Besondere Aktion' };
const damageLabels = { feuer: 'Feuer', blitz: 'Blitz', tenebrium: 'Tenebrium' };

function actionFacts(action) {
  const harm = (action.effects || []).filter(effect => effect.type === 'damage').map(effect => `${dice(effect.formula)} ${effect.damageType}`);
  const check = action.resolutionMode === 'saving-throw' ? `${attribute[action.saveAttribute] || 'Rettung'} SG ${action.spellSaveDc}`
    : /-attack$/.test(action.resolutionMode) ? `${signed(action.attackModifier)} Angriff` : '';
  const abilityCosts = (action.costs || []).map(cost => `${cost.amount} ${actionLabels[cost.resourceId] || cost.name || cost.resourceId}`);
  return [check, ...(harm.length ? harm : action.formula ? [`${dice(action.formula)} ${action.weapon?.damageType || ''}`] : []),
    action.maximumTargets > 1 ? `bis ${action.maximumTargets} Ziele` : '', action.weapon?.range, ...abilityCosts].filter(Boolean);
}

function renderAction(action) {
  return `<li><strong>${e(action.name)}</strong><small>${e(actionFacts(action).join(' · '))}</small>${action.weapon?.notes ? `<p>${e(action.weapon.notes)}</p>` : ''}</li>`;
}

function traits(profile) {
  return (profile.abilities || []).filter(entry => entry.active && !entry.combatUsable).map(entry =>
    `<li><strong>${e(entry.name)}</strong><p>${e(entry.description)}</p></li>`).join('');
}

function renderCard(card) {
  const { id, name, level, habitat, size, scene, portrait } = card;
  const creature = sanitizeCreature(card);
  const profile = resolveCombatProfile(creature, { includeAiSnapshot: false });
  const actions = profile.actions.filter(action => !action.internal && action.weapon?.id !== 'default-unarmed-melee'
    && ['weapon', 'technique', 'ability', 'spell', 'prayer', 'song'].includes(action.kind));
  const magical = actions.filter(action => ['spell', 'prayer', 'song'].includes(action.kind));
  const normal = actions.filter(action => !magical.includes(action));
  const affinities = profile.damageAffinities.map(item => `<span data-affinity="${e(item.response)}">${e(damageLabels[item.damageType] || item.damageType)} ${item.response === 'resistant' ? '½' : '×2'}</span>`).join('');
  const loading = card.groupId === ENCOUNTER_GROUPS[0].id ? 'eager' : 'lazy';
  return `<article class="encounter-card" id="${e(card.artId)}" data-encounter-card aria-labelledby="${e(id)}-name">
    <div class="encounter-card-front" data-card-front>
      <div class="encounter-card-summary">
        <header class="encounter-card-name">
          <img src="${e(portrait)}" alt="" width="64" height="64" loading="${loading}" decoding="async">
          <div><span class="encounter-level">Stufe ${e(level)}</span><h3 id="${e(id)}-name">${e(name)}</h3></div>
        </header>
        <dl class="encounter-stats"><div><dt>TP</dt><dd>${number(profile.maximumHitPoints)}</dd></div><div><dt>RK</dt><dd>${number(profile.totalDefense)}</dd></div>
          <div><dt>Bewegung</dt><dd>${number(profile.combat?.movement)} m</dd></div></dl>
        <p class="encounter-habitat">${e(size)} · ${e(habitat)}</p>
        ${affinities ? `<div class="encounter-affinities">${affinities}</div>` : ''}
      </div>
      <figure class="encounter-art"><img src="${e(scene)}" alt="${e(name)} in seiner Umgebung, Ganzkörperansicht" width="1024" height="1536" loading="${loading}" decoding="async"></figure>
    </div>
    <div class="encounter-card-back" data-card-back id="${e(id)}-powers" hidden>
      <h3>Angriffe und Kräfte <span>${e(name)}</span></h3>
      <ul class="encounter-actions">${normal.map(renderAction).join('')}</ul>
      ${magical.length ? `<h4>Magie</h4><ul class="encounter-actions">${magical.map(renderAction).join('')}</ul>` : ''}
      <h4>Merkmale</h4><ul class="encounter-actions">${traits(profile)}</ul>
    </div>
    <footer class="encounter-card-footer"><button type="button" data-card-flip aria-expanded="false" aria-controls="${e(id)}-powers"><span aria-hidden="true">↻</span> <span data-flip-label>Angriffe &amp; Kräfte</span></button>
      ${creature.bestiaryReference ? `<a href="${e(creature.bestiaryReference.url)}">Artprofil</a>` : ''}<a href="../../AleriaAlmanach/AleriaAlmanach.html?creatureTemplate=${encodeURIComponent(id)}">Vorlage übernehmen ↗</a></footer>
  </article>`;
}

function mountEncounterCards(root) {
  root.querySelector('[data-encounter-navigation]').innerHTML = ENCOUNTER_GROUPS.map(group =>
    `<a href="#${e(group.id)}"><img src="${e(encounterIcon(group.id))}" width="22" height="22" alt="">${e(group.name)}</a>`).join('');
  root.querySelector('[data-encounter-groups]').innerHTML = ENCOUNTER_GROUPS.map(group =>
    `<section class="encounter-group" id="${e(group.id)}" aria-labelledby="${e(group.id)}-name"><h2 id="${e(group.id)}-name"><img src="${e(encounterIcon(group.id))}" width="40" height="40" loading="lazy" alt="">${e(group.name)}</h2>
      <div class="encounter-grid">${BESTIARY_ENCOUNTER_CARDS.filter(card => card.groupId === group.id).map(renderCard).join('')}</div></section>`).join('');
  root.addEventListener('click', event => {
    const direct = event.target.closest('[data-card-flip]');
    const front = event.target.closest('[data-card-front]');
    const card = (direct || front)?.closest('[data-encounter-card]');
    if (!card) return;
    const control = direct || card.querySelector('[data-card-flip]');
    const back = card.querySelector('[data-card-back]');
    const showBack = back.hidden;
    back.hidden = !showBack;
    card.querySelector('[data-card-front]').hidden = showBack;
    card.dataset.flipped = String(showBack);
    control.setAttribute('aria-expanded', String(showBack));
    control.querySelector('[data-flip-label]').textContent = showBack ? 'Kreaturenbogen' : 'Angriffe & Kräfte';
  });
  if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
}

const root = document.querySelector('[data-encounter-book]');
if (root) mountEncounterCards(root);
