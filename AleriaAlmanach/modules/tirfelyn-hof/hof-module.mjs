import { HOF_STAFF, HOF_HOUSING } from '../../../shared/tirfelyn-hof/hof-residents.mjs';
import { HOF_ANIMALS } from '../../../shared/tirfelyn-hof/hof-animals.mjs';
import { HOF_MAP_ID } from '../../../shared/tirfelyn-hof/hof-pois.mjs';
import { HOF_FAMILY_RESIDENTS } from '../../../shared/tirfelyn-hof/hof-household.mjs';
import { hofStaffGroups } from './hof-people.mjs';
import { buildHofScenes } from './hof-scenes.mjs';
import { hofAreaDirectory } from './hof-area-modules.mjs';

function extendHierarchy(original) {
  const hierarchy = structuredClone(original);
  for (const tree of hierarchy.trees) for (const level of tree.levels) for (const node of level.nodes) {
    const resident = HOF_FAMILY_RESIDENTS.find(person => person.name === node.title);
    if (resident) node.subtitle = `${resident.work} · ${resident.age} Jahre`;
  }
  hierarchy.subtitle = '16 Familienangehörige, zwölf Bedienstete und Angehörige ihrer Haushalte, drei Hoftiere';
  hierarchy.description += '<p>Die Tirfelyn leiten ihren Familienbetrieb selbst. Holzfäller, Müller, Hufschmied und Hofhelfer ergänzen die Arbeit; ihre Haushalte gehören zum Hofalltag.</p>';
  hierarchy.details.push({ label: 'Weitere Bewohner', value: '12' }, { label: 'Hoftiere', value: 'Ein Wachhund und zwei Herdenhunde' });
  for (const group of hofStaffGroups()) {
    const nodes = group.people.map(person => ({
      title: person.name, subtitle: `${person.role} · ${person.age} Jahre`, portrait: person.portrait,
      text: `<p>${person.bio}</p><p><strong>Wohnort:</strong> ${HOF_HOUSING.find(home => home.id === person.residenceId).label}.</p><p><a href="../AleriaAlmanach/AleriaAlmanach.html?character=${person.id}" target="_blank" rel="noopener">Figurenakte öffnen</a></p>`
    }));
    const existing = group.targetTreeId && hierarchy.trees.find(tree => tree.id === group.targetTreeId);
    if (existing) {
      existing.label = group.label;
      existing.levels[0].label = group.label;
      existing.levels[0].nodes.push(...nodes);
    } else hierarchy.trees.push({ id: group.id, label: group.label, parentTreeId: 'leitung', levels: [{ label: group.label, nodes }] });
  }
  hierarchy.trees.push({ id: 'hof-tiere', label: 'Die Hoftiere', parentTreeId: 'leitung',
    levels: [{ label: 'Wache und Herdenarbeit', nodes: HOF_ANIMALS.map(animal => ({
      title: animal.name, subtitle: `${animal.role} · ${animal.species} · ${animal.age} Jahre`, portrait: animal.portrait,
      text: `<p>${animal.bio}</p><p><strong>Hofbesitz:</strong> Familie Tirfelyn. <strong>Betreuung:</strong> ${animal.caretaker}.</p><p><a href="../AleriaAlmanach/AleriaAlmanach.html?creature=${animal.id}" target="_blank" rel="noopener">Tierakte öffnen</a> · <a href="../Bestiarium/tiere/vieh/haustiere/hunde/${animal.bestiaryId}/index.html" target="_blank" rel="noopener">${animal.species} im Bestiarium</a></p>`
    })) }] });
  hierarchy.chartIntro = 'Jeder lebende Angehörige und jeder weitere Bewohner erscheint einmal mit seiner Hauptaufgabe. Die Hoftiere stehen in einem eigenen Bereich; Verwandtschaft bleibt im Stammbaum.';
  return hierarchy;
}

export function extendTirfelynHof(entry) {
  if (entry.id !== 'tirfelyn-hof') return entry;
  const pages = structuredClone(entry.pages);
  pages[0].description += `<p>Zwölf weitere Bewohner unterstützen den Familienbetrieb. Die sechs Bedienstetenhütten und die beiden Holzfällerhäuser sind festen Haushalten zugeordnet. Ein Wachhund und zwei Herdenhunde gehören zum Hof.</p><p><a href="../Karten/karte.html?map=${HOF_MAP_ID}" target="_blank" rel="noopener">Die Ortskarte des Tirfelyn-Hofs öffnen</a></p>`;
  pages[0].stats.push(['Weitere Bewohner', '12'], ['Hoftiere', 'Bryn · Rhos · Cwm']);
  pages[0].description += hofAreaDirectory();
  pages[1].hierarchy = extendHierarchy(pages[1].hierarchy);
  pages.push({ schemaVersion: 1, pageTitle: 'Die Bediensteten und ihre Haushalte', commentThreadKey: 'tirfelyn-hof-bedienstete',
    image: HOF_STAFF[0].portrait, imageWidth: 30, imageTall: true, imageFit: 'cover',
    description: HOF_STAFF.map(person => `<p><strong>${person.name}, ${person.age} Jahre.</strong> ${person.bio}</p>`).join(''),
    stats: [['Hof', 'Tirfelyn-Hof'], ['Weitere Bewohner', '12'], ['Wohnhäuser', 'Sechs Bedienstetenhütten und zwei Holzfällerhäuser']] });
  pages.push({ schemaVersion: 1, pageTitle: 'Wachhund und Herdenhunde', commentThreadKey: 'tirfelyn-hof-hoftiere',
    image: HOF_ANIMALS[0].portrait, imageWidth: 34, imageTall: true, imageFit: 'cover',
    description: HOF_ANIMALS.map(animal => `<p><strong>${animal.name} · ${animal.species} · ${animal.age} Jahre.</strong> ${animal.bio}</p><p><a href="../Bestiarium/tiere/vieh/haustiere/hunde/${animal.bestiaryId}/index.html" target="_blank" rel="noopener">Zum Rasseprofil</a></p>`).join(''),
    stats: [['Besitz', 'Familie Tirfelyn'], ['Betreuung', 'Eudaf Tirfelyn; bei den Herden auch Maldwyn']] });
  pages.push(...buildHofScenes(entry.id));
  return { ...entry, pages, sessionCast: [...entry.sessionCast, ...HOF_STAFF.map(person => person.id), ...HOF_ANIMALS.map(animal => animal.id)] };
}
