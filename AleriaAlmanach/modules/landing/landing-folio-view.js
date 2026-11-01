import { html, groupPortrait } from './group-landing-markup.js';

export const LANDING_FOLIO_COVER = '/AleriaAlmanach/assets/landing-folio/aleria-paths-cover-v1.webp';

const drawings = Object.freeze({
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5zM12 1v3m0 16v3M1 12h3m16 0h3"/>',
  people: '<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 5v2"/>',
  book: '<path d="M12 5c-3-2-7-2-10-1v15c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1Zm0 0v15M5 8h3m-3 4h3m8-4h3m-3 4h3"/>',
  map: '<path d="m2 5 6-3 8 3 6-3v17l-6 3-8-3-6 3Zm6-3v17m8-14v17M10 9l4 4m0-4-4 4"/>',
  feather: '<path d="M4 21 17 8M8 17l-1-5c2-7 8-10 15-10 0 7-3 13-10 15Zm3-3 5 1M13 12V7"/>',
  pack: '<path d="M8 6V4a4 4 0 0 1 8 0v2M5 8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2Zm0 3h14M9 9v5m6-5v5M8 18h8"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2M9 1h6"/>',
  arrow: '<path d="M3 12h17m-6-6 6 6-6 6"/>'
});

export function landingFolioIcon(name) {
  return `<svg class="landing-folio-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${drawings[name] || drawings.compass}</svg>`;
}

export function renderLandingFolioHeader(data, { title = '', subtitle = '', symbol = '', group = false, clock = '', actions = '', location = '', status = '' } = {}) {
  const heading = data.title || title;
  const introduction = data.subtitle || subtitle;
  const crest = data.bannerImage || symbol;
  return `<header class="landing-folio-hero">
    ${groupPortrait(data.coverImage || LANDING_FOLIO_COVER, '', 'landing-folio-cover')}
    <div class="landing-folio-hero-shade" aria-hidden="true"></div>
    <div class="landing-folio-title">
      <span class="landing-folio-kicker">${landingFolioIcon('compass')} Aleria <i></i> ${group ? 'Eine gemeinsame Geschichte' : 'Wege & Geschichten'}</span>
      <h2>${html(heading)}</h2>
      ${introduction ? `<p>${html(introduction)}</p>` : '<p>Von gemeinsamen Wegen und Geschichten, die bleiben.</p>'}
      ${location || status ? `<div class="landing-folio-trail">${landingFolioIcon('map')}<span>${html([location, status].filter(Boolean).join(' · '))}</span></div>` : ''}
      ${crest ? `<div class="landing-folio-seal">${groupPortrait(crest, heading, 'group-crest')}<span>${group ? 'Das Buch unserer Gefährten' : 'Ein neues Kapitel beginnt'}</span></div>` : ''}
    </div>
    ${clock ? `<aside class="landing-folio-clock"><span class="landing-folio-clock-icon">${landingFolioIcon('clock')}</span><div data-group-region="clock">${clock}</div></aside>` : ''}
    ${actions ? `<div class="landing-folio-hero-actions">${actions}</div>` : ''}
    <span class="landing-folio-hero-corner" aria-hidden="true"></span>
  </header>`;
}

export function renderLandingFolioIndex() {
  return `<nav class="landing-folio-index" aria-label="Im Abenteuerfolio">
    ${[['members', 'people', 'Die Gefährten'], ['adventures', 'book', 'Unsere Abenteuer'], ['map', 'map', 'Weg & Welt'], ['notes', 'feather', 'Die Chronik']].map(([key, icon, label], index) => `<button type="button" data-landing-action="jump-section" data-landing-section-target="${key}"><small>0${index + 1}</small>${landingFolioIcon(icon)}<span>${label}</span></button>`).join('')}
  </nav>`;
}
