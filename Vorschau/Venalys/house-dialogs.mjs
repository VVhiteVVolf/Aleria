import { renderHouseDossier } from '../shared/house-detail-render.mjs';
import { escapeHtml as e, rankLabel } from '../shared/country-workbench/render.mjs';
import { targetName } from './assignment-view.mjs';
import { createArtDialogSession } from '../shared/country-workbench/art-dialog-session.mjs';
import { renderEstateDetails } from '../shared/country-workbench/estate-view.mjs';

export function createVenalysHouseDialogs({ dialog, houses, warriors, estates = [], targets, getDraft, onChoose }) {
  const session = createArtDialogSession({ dialog,onSelect:onChoose });
  return {
    showEstate(id) {
      const estate = estates.find(item => item.id === id);
      if (estate) session.open(renderEstateDetails(estate,{ source:'Venalys · Gesellschaftlicher Stand' }));
    },
    destroy:session.destroy,
    showHouse(id) {
      const house = houses.find(h => h.id === id);
      if (!house) return;
      const warrior = warriors.find(w => w.id === id), draft = getDraft();
      const liege = houses.find(h => h.id === house.liegeId);
      const assigned = targets.filter(t => draft.assignments[t.id]?.includes(id)).map(t => targetName(t, draft));
      const facts = [
        { label: 'Stand', value: rankLabel(house) },
        { label: 'Dienstbindung', value: liege ? `Haus ${liege.name}` : house.rank === 'patrician' || house.rankId === 'patrician' ? 'Patrizier-Gründerhaus' : 'Noch nicht festgelegt' },
        { label: 'Zugeordnete Bezirke und Orte', value: assigned.join(' · ') || 'Noch keine Zuordnung' },
        ...(house.focus ? [{ label: 'Schwerpunkt', value: house.focus }] : []),
        ...(house.collectiveName || house.plural ? [{ label: 'Geschlechtsbezeichnung', value: house.collectiveName || house.plural }] : []),
      ];
      const crest = { image: house.crest, fullsize: house.fullsize };
      let html;
      if (warrior) html = renderHouseDossier({
        title: `Haus ${house.name}`, source: house.source || 'Venalys · Hausentwurf', headingId: 'art-title',
        warrior: { ...warrior, palette: Array.isArray(warrior.palette) ? warrior.palette.join(' · ') : warrior.palette },
        classHref: warrior.classHref, crest, description: house.motif, facts, houseId: id, canPlace: true,
        originalLink: house.isNew ? null : house.original,
      }, e);
      else html = `<header class="house-detail-heading"><p class="eyebrow">${e(house.source || 'Geliefertes Patrizierwappen')}</p><h2 id="art-title">Haus ${e(house.name)}</h2></header><div class="art-detail-layout"><figure><a href="${e(crest.fullsize)}" target="_blank" rel="noopener"><img src="${e(crest.image)}" width="480" height="480" alt="Wappen Haus ${e(house.name)}"></a><figcaption><a href="${e(crest.fullsize)}" target="_blank" rel="noopener">Geliefertes Wappen in Großansicht ↗</a></figcaption></figure><div><p>${e(house.motif || '')}</p><dl>${facts.map(f => `<div><dt>${e(f.label)}</dt><dd>${e(f.value)}</dd></div>`).join('')}</dl><button class="primary" data-action="select-from-dialog" data-house="${e(id)}">Dieses Haus auf der Karte zuordnen</button></div></div>`;
      session.open(html);
    },
  };
}
