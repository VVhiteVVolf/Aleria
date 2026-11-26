import { escapeHtml as e } from '../../../Vorschau/shared/country-workbench/render.mjs';
import { officeIcon } from '../../../shared/cenyr-administration/office-icons.mjs';
import { settlementJurisdiction } from '../../../shared/cenyr-administration/settlement-government.mjs';

const portraitFallback = '/Stammbäume/assets/images/placeholders/unknown.png';
const jurisdictionLabels = { church: 'Kirche', guild: 'Gilde', place: 'Ort' };

export function governmentContext(definition, post) {
  return jurisdictionLabels[settlementJurisdiction(definition.kind, post)] + ' · ' + definition.place;
}

export function governmentCard(post, people, owner, { destination, duties = false, selected = false } = {}) {
  const icon = post.image || officeIcon(post.icon || 'coordination');
  const person = people.get(post.holder);
  const identity = person?.name || 'Besetzung offen';
  const title = e(post.title);
  const heading = destination ? `<button type="button" class="place-government-open" data-government-office="${e(destination)}"
    data-government-post="${e(post.key || '')}" aria-haspopup="dialog"><strong>${title}</strong><span aria-hidden="true">›</span></button>`
    : `<strong>${title}</strong>`;
  return `<li class="place-government-card${selected ? ' is-selected' : ''}">
    <img class="place-government-icon" src="${e(icon)}" alt="" width="31" height="31" loading="lazy">
    <div>${heading}<small class="place-government-owner">${e(owner)}</small>
    <span class="place-government-person"><img src="${e(person?.portrait || portraitFallback)}"
      alt="" width="28" height="28" loading="lazy"${person?.portrait ? ' data-government-portrait' : ''}>
      ${person?.href ? `<a href="${e(person.href)}">${e(identity)}</a>` : `<span>${e(identity)}</span>`}</span>
    ${duties && post.description ? `<p class="place-office-duty">${e(post.description)}</p>` : ''}</div></li>`;
}

export function governmentSectionTitle(level, title, iconKey = 'coordination') {
  const icon = iconKey.startsWith('/') ? iconKey : officeIcon(iconKey);
  return `<${level} class="place-government-section-title">`
    + `<img src="${e(icon)}" alt="" width="26" height="26" loading="lazy">${e(title)}</${level}>`;
}

export function handleGovernmentPortraitError(event) {
  const image = event.target;
  if (!image.hasAttribute?.('data-government-portrait')) return;
  image.removeAttribute('data-government-portrait');
  image.src = portraitFallback;
}
