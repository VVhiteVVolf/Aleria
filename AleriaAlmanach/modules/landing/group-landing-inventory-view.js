import { html, button, empty, groupPortrait } from './group-landing-markup.js';
import { groupPersonalItems, categoryLabel } from './group-landing-register.js';

export function renderGroupInventory(group, members) {
  const stocks = group.inventory || [];
  const personal = groupPersonalItems(members);
  return `<div class="group-stock-list">${stocks.map(item => `<article class="group-stock-row" data-stock-id="${html(item.id)}">
    ${groupPortrait(item.image, item.name, 'group-stock-image')}<div><strong>${html(item.name)}</strong><small>${html(categoryLabel(item.category))}${item.holderMemberId ? ' · Bei ' + html(members.find(member => member.id === item.holderMemberId)?.name || 'einem früheren Mitglied') : ''}${item.location ? ' · ' + html(item.location) : ''}</small>${item.note ? `<p>${html(item.note)}</p>` : ''}</div>
    <strong class="group-stock-quantity">${item.quantity}<small>Bestand</small></strong><div class="group-stock-actions">${button('inventory-item', 'Anpassen', `data-item-id="${html(item.id)}"`)}${item.sourceKey ? button('register', 'Register ↗', `data-item-key="${html(item.sourceKey)}"`) : ''}</div></article>`).join('') || empty('Noch kein gemeinsamer Bestand. Wähle Güter, Vorräte oder Ausrüstung aus dem Handelsregister.')}</div>
    <details class="group-personal-inventory"><summary>Persönlicher Besitz der aktuellen Mitglieder <span>${personal.length}</span></summary><p class="group-muted">Aus den Charakterinventaren. Änderungen erfolgen beim jeweiligen Charakter im Handelsregister.</p>${personal.map(item => `<div class="group-personal-row"><span><strong>${html(item.title)}</strong><small>${html(item.ownerCharacterName)}</small></span><span>${html(item.quantity ?? 1)} ×</span>${button('register', 'Ansehen ↗', `data-item-key="${html(item.id)}"`)}</div>`).join('') || empty('Keine verknüpften Inventare für die aktuelle Auswahl verfügbar.')}</details>`;
}
