import { escapeHtml as e } from '../shared/country-workbench/render.mjs';
import { officeIcon } from '../../shared/cenyr-administration/office-icons.mjs';
import { GUILD_LEASE } from '../../shared/cenyr-administration/local-authority.mjs';
import { settlementJurisdiction } from '../../shared/cenyr-administration/settlement-government.mjs';
import { previewAttribute } from './preview-url.mjs';

function responsibility(house, area, plan, post) {
  const place = post.place || post.settlement || plan.settlement?.name;
  const sourceRole = post.authorityChoice?.role || post.authority?.role;
  const jurisdiction = settlementJurisdiction(plan.settlement?.kind, post);
  if (sourceRole === GUILD_LEASE || jurisdiction === 'guild') {
    const guild = post.authorityChoice?.guild;
    return { kind: 'guild', name: guild || place || 'Pachtverwaltung', icon: officeIcon('money'), label: 'Gilde' };
  }
  if (post.authority?.kind === 'church' || area.startsWith('klerus') || post.key?.startsWith('klerus/') || jurisdiction === 'church') {
    return { kind: 'church', name: place || 'Geistliche Verwaltung · ' + house.name, icon: officeIcon('faith'), label: 'Kirche' };
  }
  if (place && !area.startsWith('hof')) {
    return { kind: 'place', name: place, icon: officeIcon('coordination'), label: 'Ort' };
  }
  const rank = area.startsWith('hof') ? 'Haus' : house.rank === 'royal' ? 'Krone' : house.county || house.rank === 'county' ? 'Grafschaft' : 'Haus';
  const name = rank === 'Haus' ? house.name.replace(/^Haus\s+/u, '') : house.name;
  return { kind: 'house', name, icon: house.crest || officeIcon('court'), label: rank };
}

export function officeResponsibility(house, area, plan, post = {}) {
  const { label, name, icon, kind } = responsibility(house, area, plan, post);
  return '<span class="office-responsibility" data-owner-kind="' + e(kind) + '">' +
    '<img src="' + previewAttribute(icon) + '" width="18" height="18" alt="" loading="lazy">' +
    '<span>' + e(label + ' · ' + name) + '</span></span>';
}

export function officePath(house, ancestors, title, section = '') {
  const previous = ancestors.map((name, depth) => '<button type="button" data-action="office-ancestor" data-depth="' +
    depth + '">' + e(name) + '</button>');
  const steps = ['<span>' + e(house.name) + '</span>', ...previous,
    '<span' + (section ? '' : ' aria-current="location"') + '>' + e(title) + '</span>',
    ...(section ? ['<span aria-current="location">' + e(section) + '</span>'] : [])];
  return steps.join('<span class="office-path-arrow" aria-hidden="true">›</span>');
}
