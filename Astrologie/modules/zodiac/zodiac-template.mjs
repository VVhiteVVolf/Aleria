import { escapeHtml as h } from '../../../Bestiarium/modules/book-shell/book-template-utils.mjs';
import { renderZodiacArt } from './zodiac-art.mjs';

const KIND_LABELS = { celestial: 'Celestiales Monatszeichen', lesser: 'Monatszeichen der Untergötter', sovereign: 'Wanderndes Zeichen', dragon: 'Das Jahrtausendzeichen' };

export function renderZodiacCard(sign, deities, calendar) {
  const god = deities[sign.id], shadow = deities[sign.shadowId];
  const caption = sign.month ? `${String(sign.month).padStart(2, '0')} · ${calendar.monthLabel(sign.month)}` : sign.kind === 'dragon' ? 'Einmal in 1.000 Jahren' : `Alle ${sign.period} Tage · ${sign.duration} Nächte`;
  const search = [god.title, god.epithet, shadow?.title, shadow?.epithet, sign.motif, sign.gift, sign.trial, caption].filter(Boolean).join(' ');
  return `<article class="zodiac-card" id="zeichen-${sign.id}" data-role="zodiac-card" data-kind="${sign.kind}" data-sign="${sign.id}" data-search="${h(search)}">
    <p class="card-month">${h(caption)}</p>
    ${renderZodiacArt(sign, deities)}
    <div class="zodiac-copy"><p class="eyebrow">${KIND_LABELS[sign.kind]}</p><h3>${h(god.epithet)}</h3><p class="card-names"><a href="${h(god.href)}">${h(god.title)}</a>${shadow ? `<span aria-hidden="true"> / </span><a class="shadow-name" href="${h(shadow.href)}">${h(shadow.title)}</a>` : ''}</p><p class="card-shadow">${shadow ? `Infernaler Widersacher: ${h(shadow.epithet)}` : 'Widersacher noch offen'}</p>
      <div class="card-aspects"><span><small>Tugendneigung</small>${h(sign.gift)}</span><span><small>Versuchung zur Sünde</small>${h(sign.trial || 'Noch offen')}</span></div>
      <details class="card-reading"><summary>Die Karte deuten <span aria-hidden="true">＋</span></summary><p>${h(sign.reading)}</p><p class="card-motif">Sinnbild: ${h(sign.motif)}</p><div class="card-links"><a href="${h(god.href)}">${h(god.title)} im Glaubenscodex ↗</a>${shadow ? `<a href="${h(shadow.href)}">${h(shadow.title)} im Glaubenscodex ↗</a>` : ''}</div></details>
    </div>
  </article>`;
}
