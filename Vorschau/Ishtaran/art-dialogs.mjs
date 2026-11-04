import { escapeHtml as e } from '../shared/country-workbench/render.mjs';
import { renderEmblemWarriorDossier } from './emblem-warrior-view.mjs';

const joined = value => Array.isArray(value) ? value.join(' · ') : value ?? '';

export function createArtDialogs({ dialog, emblems, warriors, emblemWarriors = [], houses = [], settlements = [], getPlacements = () => ({}), onChoose }) {
  let trigger;
  const close = () => dialog.close();
  dialog.addEventListener('close', () => { if (trigger?.isConnected) trigger.focus({ preventScroll: true }); });
  dialog.addEventListener('click', event => {
    if (event.target.closest('[data-action="close-art"]')) close();
    const choice = event.target.closest('[data-action="select-from-dialog"]');
    if (choice && onChoose) { close(); onChoose(choice.dataset.house); }
  });
  return {
    show(kind, id) {
      const item = (kind === 'emblem' ? emblems : kind === 'warrior' ? warriors : []).find(entry => entry.id === id);
      if (!item?.image) return;
      trigger = document.activeElement;
      const matchingWarrior = kind === 'emblem' ? emblemWarriors.find(warrior => warrior.emblemId === id) : null;
      if (matchingWarrior) {
        const house = houses.find(house => house.emblemId === id);
        const settlement = house && settlements.find(city => city.id === getPlacements()[house.id]);
        const liegeHouse = house && houses.find(candidate => candidate.id === house.liege);
        dialog.querySelector('[data-role="art-details"]').innerHTML = renderEmblemWarriorDossier(item, matchingWarrior, { house, settlement, liegeHouse, canPlace: Boolean(house && onChoose) });
        if (!dialog.open) dialog.showModal();
        dialog.scrollTop = 0;
        return;
      }
      const original = item.original || item.image;
      const details = kind === 'emblem'
        ? `<p>${e(item.motif)}</p><dl><div><dt>Farben</dt><dd>${e(joined(item.colors))}</dd></div><div><dt>Rahmen</dt><dd>${e(item.frame)}</dd></div></dl>${item.note ? `<p>${e(item.note)}</p>` : ''}`
        : `${item.role ? `<p class="eyebrow">${e(item.role)}</p>` : ''}<p>${e(item.description)}</p><p>${e(joined(item.equipment))}</p>${item.href ? `<p><a href="${e(item.href)}">Grundklasse ansehen ↗</a></p>` : ''}${item.mount?.href ? `<p><a href="${e(item.mount.href)}">${e(item.mount.name)} im Bestiarium ↗</a></p>` : ''}`;
      dialog.querySelector('[data-role="art-details"]').innerHTML = `<h2 id="art-title">${e(item.name)}</h2><div class="art-detail-layout ${kind === 'warrior' ? 'warrior-art-detail' : ''}"><figure><a href="${e(original)}" target="_blank" rel="noopener"><img src="${e(item.image)}" alt="${e(item.name)}"></a><figcaption><a href="${e(original)}" target="_blank" rel="noopener">Original in Großansicht ↗</a></figcaption></figure><div>${details}<p class="subtle">${item.status === 'source' ? 'Gelieferte Bildvorlage.' : 'Entwurf zur gemeinsamen Ausarbeitung.'}</p></div></div>`;
      if (!dialog.open) dialog.showModal();
      dialog.scrollTop = 0;
    }
  };
}
