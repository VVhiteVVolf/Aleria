import { escapeHtml as e, houseCard } from '../shared/country-workbench/render.mjs';

export const targetName = (target, draft) => draft.districtNames[target.id] || target.name;

export function renderHouseGroups(houses, selected) {
  const patrons = houses.filter(h => h.rank === 'patrician' || h.rankId === 'patrician');
  const magnarians = houses.filter(h => !patrons.includes(h));
  const blocks = [{ name: 'Die fünf Patrizierhäuser', entries: patrons }];
  for (const patron of patrons) {
    const entries = magnarians.filter(h => h.liegeId === patron.id);
    if (entries.length) blocks.push({ name: `Magnarier unter ${patron.name}`, entries });
  }
  const unbound = magnarians.filter(h => !patrons.some(p => p.id === h.liegeId));
  if (unbound.length) blocks.push({ name: 'Weitere Magnarierhäuser', entries: unbound });
  return blocks.filter(b => b.entries.length).map(b => `<section class="house-group"><header class="section-heading"><h3>${e(b.name)}</h3><span>${b.entries.length} Häuser</span></header><div class="house-grid">${b.entries.map(h => houseCard(h, selected)).join('')}</div></section>`).join('');
}

export function renderAssignedHouses(target, draft, houses) {
  const entries = draft.assignments[target.id] || [];
  if (!entries.length) return '<p class="empty-seat">Noch kein Haus zugeordnet.</p>';
  return `<ul class="assigned-houses">${entries.map(id => {
    const house = houses.find(h => h.id === id);
    return `<li><button class="assigned-house" data-action="show-house" data-house="${e(id)}"><img src="${e(house.crest)}" width="48" height="48" alt=""><span>Haus ${e(house.name)}</span></button><button class="remove-assignment" data-action="remove-assignment" data-house="${e(id)}" data-target="${e(target.id)}" aria-label="Haus ${e(house.name)} aus ${e(targetName(target, draft))} entfernen">Zuordnung lösen</button></li>`;
  }).join('')}</ul>`;
}

export function renderTargets(targets, draft, houses, selected, { districts = false } = {}) {
  return targets.map(target => `<article class="seat-card venalys-target" id="target-${e(target.id)}" data-drop-seat="${e(target.id)}"><header><div><p class="eyebrow">${districts ? 'Stadtbezirk' : e(target.kind)}</p><h3>${e(targetName(target, draft))}</h3></div><button data-action="locate-target" data-target="${e(target.id)}" aria-label="${e(targetName(target, draft))} auf der Karte ansehen">Karte ↗</button></header>${districts ? `<div class="district-name-editor"><label class="district-name-label">Bezirksname<input data-role="district-name" data-district="${e(target.id)}" value="${e(draft.districtNames[target.id])}" maxlength="80" autocomplete="off"></label><button data-action="commit-district-name" data-district="${e(target.id)}">Namen übernehmen</button><p>Mit Enter, beim Verlassen oder über den Knopf übernehmen.</p></div>` : ''}<p class="geography">${e(target.description || '')}</p>${renderAssignedHouses(target, draft, houses)}<button class="seat-target" data-action="place-at-seat" data-drop-seat="${e(target.id)}" ${selected ? '' : 'disabled'}>Gewähltes Haus hier zusätzlich zuordnen</button></article>`).join('');
}

export function renderTargetOptions(targets, draft) {
  const names = targets.map(t => targetName(t, draft));
  return '<option value="">Bezirk oder Ort wählen …</option>' + targets.map((target, index) => {
    const name = names[index];
    const duplicate = names.filter(value => value === name).length > 1;
    const key = target.id.startsWith('district-') ? `Bezirk ${target.id.slice(9)}` : target.id.replace(/^poi-/, '').toUpperCase();
    return `<option value="${e(target.id)}">${e(name)}${duplicate ? ` · ${e(key)}` : ''}</option>`;
  }).join('');
}
