import { PORTRAIT_PLACEHOLDER, tierFor } from './administration-model.mjs';
import { resolveAdministrationPortrait } from './administration-portrait-sources.mjs';

const roleByButton = new WeakMap();
const assets = '/Kontinente/modules/administration/assets';

export function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

export function portraitImage(src, name = '') {
  const image = element('img', 'administration-role-image');
  image.src = resolveAdministrationPortrait(src) || PORTRAIT_PLACEHOLDER;
  image.alt = name ? `Portrait von ${name}` : '';
  image.loading = 'lazy';
  image.decoding = 'async';
  image.addEventListener('error', () => {
    if (image.getAttribute('src') !== PORTRAIT_PLACEHOLDER) image.src = PORTRAIT_PLACEHOLDER;
  }, { once: true });
  return image;
}

export function pin(areaId, tier) {
  const badge = element('span', `administration-pin is-${tier}`);
  badge.setAttribute('aria-label', { gold: 'Goldrang', silver: 'Silberrang', bronze: 'Bronzerang' }[tier]);
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 64 64');
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS(svg.namespaceURI, 'use');
  use.setAttribute('href', `${assets}/role-pins.svg#${areaId}`);
  svg.append(use);
  badge.append(svg);
  return badge;
}

export function roleFor(button) { return roleByButton.get(button); }

export function renderRoleGroup(group, area) {
  const section = element('section', `administration-role-group is-${group.kind}`);
  section.dataset.groupId = group.id;
  section.dataset.groupKind = group.kind;
  const header = element('header', 'administration-group-heading');
  const heading = element('h3', '', group.title);
  header.append(heading);
  if (group.kind === 'core') header.append(element('span', 'administration-group-count', `${group.roles.length} gleichrangige Ämter`));
  section.append(header);
  if (group.description) section.append(element('p', 'administration-group-description', group.description));
  const grid = element('div', 'administration-role-grid');
  group.roles.forEach(role => grid.append(renderRoleCard(role, group, area)));
  section.append(grid);
  return section;
}

function renderRoleCard(role, group, area) {
  const tier = tierFor(group, role);
  const card = element('article', `administration-role-card is-${tier}`);
  card.dataset.roleId = role.id;
  const button = element('button', 'administration-role-open');
  button.type = 'button';
  button.dataset.action = 'open-administration-office';
  button.setAttribute('aria-haspopup', 'dialog');
  button.setAttribute('aria-label', `${role.title} · ${role.name || 'Noch nicht benannt'} · Amtsbeschreibung öffnen`);
  roleByButton.set(button, { role, group, area, tier });
  const frame = element('span', 'administration-portrait-frame');
  frame.append(portraitImage(role.portrait, role.name));
  const copy = element('span', 'administration-role-copy');
  copy.append(element('span', 'administration-role-title', role.title));
  copy.append(element('strong', 'administration-role-name', role.name || 'Noch nicht benannt'));
  if (role.jurisdiction) copy.append(element('span', 'administration-role-jurisdiction', role.jurisdiction));
  copy.append(element('span', 'administration-role-hint', 'Amt & Aufgaben ↗'));
  button.append(frame, pin(area.id, tier), copy);
  card.append(button);
  if (role.crew) {
    const crew = element(role.crew.href ? 'a' : 'button', 'administration-crew-link');
    if (role.crew.href) crew.href = role.crew.href;
    else {
      crew.type = 'button';
      crew.dataset.action = 'open-administration-office';
      crew.dataset.showCrew = 'true';
      crew.setAttribute('aria-haspopup', 'dialog');
      roleByButton.set(crew, { role, group, area, tier });
    }
    const image = portraitImage(role.crew.image || `${assets}/crew-flag-placeholder.svg`);
    image.className = 'administration-crew-flag';
    crew.append(image, element('span', '', role.crew.label || 'Schiffsmannschaft'));
    crew.setAttribute('aria-label', `${role.name || role.title} · ${role.crew.label || 'Schiffsmannschaft'} öffnen`);
    card.append(crew);
  }
  return card;
}
