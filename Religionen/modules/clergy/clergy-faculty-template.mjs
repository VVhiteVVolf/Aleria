import { escapeHtml as h } from '../content/content-html.mjs';
import { clergyPagePath, clergyArt } from './clergy-repository.mjs';

export function renderFaculties(clergy, catalog, link, { compact = false } = {}) {
  const caste = clergy.castes.find(item => item.id === 'magister');
  return `<div class="faculty-grid${compact ? ' faculty-grid-compact' : ''}">${clergy.faculties.fields.map(field => {
    const god = catalog.entries.find(item => item.id === field.godId);
    const profile = clergy.profiles.find(item => item.godId === field.godId);
    const art = clergyArt(clergy, profile, caste);
    return `<a class="faculty-card" href="${link(clergyPagePath(field.godId))}#magister">${compact ? '' : `<img src="${link(art.src)}" alt="Magister im Fachbereich ${h(god.title)}" width="${art.width}" height="${art.height}" loading="lazy" decoding="async">`}<div><p class="eyebrow">${h(god.title)} · Magisterium</p><h3>${h(field.title)}</h3><p>${h(field.scope)}</p>${compact ? '' : `<p class="faculty-note">${h(field.note)}</p>`}<span>Zum Fachbereich ↗</span></div></a>`;
  }).join('')}</div>`;
}
