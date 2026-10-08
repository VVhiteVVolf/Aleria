import { ALBIC_CLAN_PAGES } from './albic-clans-content.mjs';
import { ALBIC_CLAN_EXAMPLES } from './clan-examples.mjs';

export const ALBIC_CLANS_TAB = 'Sitte & Etiquette';
export const ALBIC_CLANS_ICON = '../IconOrdner/ReiterIcons/Weltpfade/sitte-etiquette.png';
export const ALBIC_CLANS_ART = './public/assets/albische-clans';

function escapeText(value) {
  return String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
}

function paragraphs(values) {
  return values.map(value => `<p>${escapeText(value)}</p>`).join('\n');
}

function pageDescription(page) {
  const example = ALBIC_CLAN_EXAMPLES[page.example.familyId];
  const link = `../Stammbäume/Stammbaum.html?family=${encodeURIComponent(example.id)}&mode=view`;
  return [
    `<p><em>${escapeText(page.group)} · ${escapeText(page.lead)}</em></p>`,
    ...page.sections.map(([heading, ...text]) => `<p><strong>${escapeText(heading)}</strong></p>\n${paragraphs(text)}`),
    `<p><strong>Aus den Clans: ${escapeText(example.name)} · ${escapeText(example.region)}</strong></p>`,
    paragraphs(page.example.paragraphs),
    ...(page.example.kind === 'hypothetical' ? [
      '<p><strong>Gedankenbeispiel — keine bestehende Clan-Geschichte</strong></p>',
      paragraphs([page.example.thought])
    ] : []),
    `<p><em>Zum Bild: ${escapeText(page.caption)}</em></p>`,
    `<p><a href="${link}" target="_blank" rel="noopener noreferrer">${escapeText(example.name)} im Stammbaum ansehen</a></p>`
  ].join('\n');
}

export function buildAlbicClans() {
  return {
    id: 'albische-clans-und-praefixe', title: 'Albische Clans — Herkunft, Namen & Präfixe',
    subtitle: 'Clan und Sept · 21 Präfixgruppen mit Beispielen aus fünf Fürstentümern',
    type: 'Sitte & Brauch', category: `${ALBIC_CLANS_TAB} · Alben`,
    symbol: ALBIC_CLANS_ICON, image: `${ALBIC_CLANS_ART}/clan-und-sept.png`,
    icon: '✦', stamp: 'HERKUNFT · EHRE · ERINNERUNG',
    multipage: true, appendCommentsPage: false, enablePageComments: true,
    pages: ALBIC_CLAN_PAGES.map((page, index) => ({
      pageTitle: `${index + 1}. — ${page.title}`,
      image: `${ALBIC_CLANS_ART}/${page.key}.png`,
      imageFit: 'contain', imagePosition: 'center', imageWidth: 38, imageTall: true,
      description: pageDescription(page), commentSequence: []
    }))
  };
}
