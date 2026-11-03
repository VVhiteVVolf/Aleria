import { escapeHtml as e } from '../shared/country-workbench/render.mjs';

const copy = entries => (entries || []).map(item => `<article><h3>${e(item.title || item.name)}</h3><p>${e(item.text || item.description)}</p></article>`).join('');
const officeList = entries => `<dl class="imperial-offices">${(entries || []).map(item => `<div><dt>${e(item.title)}</dt><dd><strong>${e(item.role)}</strong>${item.note ? `<p>${e(item.note)}</p>` : ''}</dd></div>`).join('')}</dl>`;

export function renderRealmContext(context) {
  return `<section class="section" id="geschichte"><p class="eyebrow">Herkunft und Gegenwart</p><h2>Das Silberne Kaiserreich.</h2><div class="history-grid">${copy(context.history)}</div>${context.provinces?.length ? `<div class="province-context">${copy(context.provinces)}</div>` : ''}</section>`;
}

export function renderGovernment(context) {
  const administration = context.administration || {};
  return `<section class="section" id="regierung"><p class="eyebrow">Verwaltung, Adel und Senat</p><h2>Die Ordnung des Reiches.</h2>
  ${context.government ? `<article class="government-context"><h3>${e(context.government.title)}</h3><p>${e(context.government.text)}</p>${context.government.senateNote ? `<p>${e(context.government.senateNote)}</p>` : ''}</article>` : ''}
  <div class="administration-chain">${copy(administration.chain)}</div>${administration.note ? `<p class="section-intro">${e(administration.note)}</p>` : ''}
  ${administration.localPosts?.length ? `<div class="local-posts">${copy(administration.localPosts)}</div>` : ''}
  ${administration.appointments ? `<p class="section-intro">${e(administration.appointments)}</p>` : ''}
  <div class="government-columns"><article class="nobility-context"><h3>Der Archon</h3>${officeList(context.nobility)}</article><article class="office-context"><h3>Ämter und öffentliche Aufgaben</h3>${officeList(context.offices)}</article></div></section>`;
}

export function renderInstitutions(context) {
  return `<section class="section" id="institute"><p class="eyebrow">Recht, Wissen und öffentliches Leben</p><h2>Die Institute des Kaiserreichs.</h2><div class="institution-grid">${(context.institutions || []).map(item => `<article><p class="eyebrow">${e(item.kind)}</p><h3>${e(item.name)}</h3><p>${e(item.description)}</p>${item.leadership ? `<p class="institution-leadership">${e(item.leadership)}</p>` : ''}</article>`).join('')}</div>
  ${context.religion ? `<aside class="religion-context"><h3>${e(context.religion.title)}</h3><p>${e(context.religion.text)}</p></aside>` : ''}</section>`;
}

export function renderMilitary(context) {
  return `<section class="section" id="legionen"><p class="eyebrow">Aufgebot und Organisation</p><h2>Die Einheiten des Reiches.</h2><dl class="military-terms">${(context.military || []).map(item => `<div><dt>${e(item.name)}</dt><dd>${e(item.description)}</dd></div>`).join('')}</dl></section>`;
}

export function renderOpenQuestions(context) {
  const questions = context.openQuestions || [];
  if (!questions.length) return '';
  return `<section class="section" id="offene-fragen"><p class="eyebrow">Zur weiteren Ausarbeitung</p><h2>Was noch offen bleibt.</h2><ul class="open-questions">${questions.map(question => `<li>${e(typeof question === 'string' ? question : question.text || question.note)}</li>`).join('')}</ul></section>`;
}
