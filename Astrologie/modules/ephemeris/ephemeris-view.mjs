import { escapeHtml as h } from '../../../Bestiarium/modules/book-shell/book-template-utils.mjs';

export function renderMoonDisc(moon) {
  const waxing = moon.phase <= 0.5;
  const terminator = Math.cos(2 * Math.PI * moon.phase);
  const radius = Math.abs(terminator * 42).toFixed(3);
  const limb = waxing ? 1 : 0;
  const sweep = waxing ? (terminator >= 0 ? 0 : 1) : (terminator >= 0 ? 1 : 0);
  return `<svg class="moon-disc moon-disc--${h(moon.id)}" viewBox="0 0 100 100" aria-hidden="true"><circle class="moon-dark" cx="50" cy="50" r="42"/><path class="moon-light" d="M50 8 A42 42 0 0 ${limb} 50 92 A${radius} 42 0 0 ${sweep} 50 8Z"/><circle class="moon-rim" cx="50" cy="50" r="42"/></svg>`;
}

export function renderSkyReading(sky, deities, calendar) {
  const god = deities[sky.sign.id], shadow = deities[sky.sign.shadowId];
  const visible = sky.sovereigns.filter(sign => sign.visible);
  const dragon = deities[sky.dragon.id], dragonShadow = deities[sky.dragon.shadowId];
  return `<div class="sky-summary">
    <div class="sky-sign"><p class="eyebrow">${h(calendar.format(sky.date, { withWeekday: false }))}</p><h3>${h(god.epithet)}</h3><p><strong>${h(god.title)}</strong> · Tugendneigung: ${h(sky.sign.gift)}</p><p>${shadow ? `Versuchung durch <strong>${h(shadow.title)}</strong>: ${h(sky.sign.trial)}.` : 'Infernaler Widersacher noch offen.'}</p><a href="#zeichen-${sky.sign.id}" data-action="reveal-sign" data-sign="${sky.sign.id}">Die Sternenkarte lesen ↗</a></div>
    <div class="sky-moons">${sky.moons.map(moon => `<div class="sky-moon">${renderMoonDisc(moon)}<div><h4>${h(moon.name)}</h4><p>${h(moon.label)}</p><small>${moon.illumination} % beleuchtet · Tag ${moon.age + 1}/${moon.period}</small></div></div>`).join('')}</div>
    <div class="sky-visitors"><p class="eyebrow">Die wandernden Souveränen</p>${visible.length ? `<ul>${visible.map(sign => `<li><a href="#zeichen-${sign.id}">${h(deities[sign.id].title)}</a>${sign.shadowId ? ` · Widersacher: ${h(deities[sign.shadowId].title)}` : ' · Widersacher noch offen'} <small>bis ${h(calendar.format(sign.end, { withWeekday: false }))}</small></li>`).join('')}</ul>` : '<p>In dieser Nacht zeigt sich keiner der fünf Souveränen.</p>'}<p class="sky-dragon${sky.dragon.visible ? ' is-visible' : ''}">${sky.dragon.visible ? `✧ Drachennacht: ${h(dragon.title)} und ${h(dragonShadow.title)} stehen heute am Himmel.` : `Nächste Drachennacht: ${h(calendar.format(sky.dragon.next, { withWeekday: false }))}`}</p></div>
  </div>`;
}

export function renderSovereignForecast(sky, deities, calendar) {
  return sky.sovereigns.toSorted((a, b) => a.daysUntil - b.daysUntil).map(sign => `<tr><th scope="row"><a href="#zeichen-${sign.id}">${h(deities[sign.id].title)}</a><small>${h(deities[sign.id].epithet)}</small></th><td>${sign.visible ? '<span class="visibility-badge">Jetzt sichtbar</span>' : `In ${sign.daysUntil} Tagen`}</td><td>${h(calendar.format(sign.start, { withWeekday: false }))}<small>bis ${h(calendar.format(sign.end, { withWeekday: false }))}</small></td><td>${sign.period} Tage<small>${sign.duration} Nächte sichtbar</small></td></tr>`).join('');
}
