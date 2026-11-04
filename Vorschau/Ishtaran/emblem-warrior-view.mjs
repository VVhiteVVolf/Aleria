import { escapeHtml as e } from '../shared/country-workbench/render.mjs';
import { renderHouseDossier } from '../shared/house-detail-render.mjs';

const joined = value => Array.isArray(value) ? value.join(' · ') : value ?? '';

export function renderEmblemWarriorButton(emblem, warrior, displayName = emblem.name) {
  return `<button class="emblem-pair-button" data-action="show-art" data-art-kind="emblem" data-art-id="${e(emblem.id)}" aria-label="${e(displayName)}: Wappen und passenden Krieger vergrößern"><span class="emblem-pair-crest"><img src="${e(emblem.image)}" width="360" height="360" alt="Wappen ${e(displayName)}" loading="lazy"><span>Wappen</span></span><span class="emblem-pair-warrior"><img src="${e(warrior.image)}" width="768" height="1152" alt="${e(warrior.name)}" loading="lazy"><span>${e(warrior.className)}</span></span><span class="emblem-pair-open">Wappen & Krieger öffnen ↗</span></button>`;
}

export function renderEmblemWarriorDossier(emblem, warrior, { house, settlement, liegeHouse, canPlace = false } = {}) {
  const artwork = {
    ...warrior,
    fullsize: warrior.original,
    palette: joined(emblem.colors),
    equipment: joined(warrior.equipment),
    reason: warrior.description,
    mounted: Boolean(warrior.mount),
    roleLabel: warrior.historical ? 'Historischer Bildentwurf' : 'Klassenentwurf zum Wappen',
    representationLabel: warrior.historical ? 'Maghath-Krieger · historischer Entwurf' : 'Wappenspezifischer Kriegerentwurf',
    bestiaryHref: warrior.mount?.href,
    horseName: warrior.mount?.name,
  };
  const dossier = renderHouseDossier({
    title: house ? `Haus ${house.name}` : emblem.name,
    source: emblem.status === 'source' ? 'Geliefertes Wappen · neuer Kriegerentwurf' : 'Wappen und Krieger · Entwurf',
    headingId: 'art-title',
    warrior: artwork,
    classHref: null,
    crest: { image: emblem.image, fullsize: emblem.original },
    description: emblem.motif,
    facts: [
      ...(house ? [{ label: 'Rang im Entwurf', value: house.rank }, { label: 'Aktueller Sitz im Entwurf', value: settlement?.name || 'Ohne Sitz' },
        { label: 'Dienstbindung', value: liegeHouse ? `Haus ${liegeHouse.name}; unabhängig vom Sitzwechsel.` : 'Keine übergeordnete Hausbindung vorgegeben.' },
        { label: 'Wappenmotiv', value: emblem.name }] : []),
      ...(house?.displacementNote ? [{ label: 'Evakuierung', value: house.displacementNote }] : []),
      { label: 'Rahmen', value: emblem.frame },
      { label: 'Rolle im Bild', value: warrior.role },
      ...(warrior.helmet ? [{ label: 'Helm im Bild', value: warrior.helmet }] : []),
      ...(warrior.armor ? [{ label: 'Rüstung und Kleidung', value: warrior.armor }] : []),
      ...(warrior.ageSpec ? [{ label: 'Darstellung', value: 'Junge erwachsene Figur; Altersrahmen des Bildentwurfs 20–30 Jahre.' }] : []),
      { label: 'Zuordnung', value: house ? 'Bearbeitbarer Haus- und Sitzentwurf; keine automatische Registerübernahme.' : 'Historischer Bildentwurf ohne gegenwärtige Haus- oder Sitzzuordnung.' },
      ...(house?.sharedRealmEmblem ? [{ label: 'Dynastischer Vorschlag', value: 'Das gelieferte Landeswappen wird im Entwurf für Haus Aschina verwendet.' }] : []),
      ...(house?.note || house?.namingNote ? [{ label: 'Hausvorschlag', value: house.note || house.namingNote }] : !house && emblem.note ? [{ label: 'Wappenvorlage', value: emblem.note }] : []),
    ],
    houseId: house?.id,
    canPlace,
  }, e);
  return `${dossier}${warrior.href ? `<p class="detail-links"><a href="${e(warrior.href)}" target="_blank" rel="noopener">Grundklasse ansehen ↗</a></p>` : ''}`;
}
