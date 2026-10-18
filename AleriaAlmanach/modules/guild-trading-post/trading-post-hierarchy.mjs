// Shared presentation model; each guild feature owns its offices and membership.
export const level = (label, nodes) => ({ label, nodes });
export const office = (id, title, subtitle, text, portrait = '') => ({ id, title, subtitle, text: `<p>${text}</p>`, portrait });
export function buildTradingPostHierarchy({ title, subtitle, emblem, sideImage, motto, description, trees, details, footerNote,
  eyebrow = 'Gwynthor · Celtigerns Wacht', chartTitle = 'Die örtliche Ordnung',
  chartIntro = 'Familiensitze, Ämter und Arbeitsbereiche des Handelspostens.' }) {
  return { organizationTitle: title, eyebrow, subtitle, centerLabel: title, emblem, sideImage, motto,
    description, detailsTitle: 'Auftrag und Verantwortung', details, chartTitle, chartIntro,
    treeDisplayMode: 'tabs', portraitScale: 72, cardFontScale: 90, trees, levels: [], footerNote };
}
