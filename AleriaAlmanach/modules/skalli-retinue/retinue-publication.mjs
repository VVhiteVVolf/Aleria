import { migrateCenyrGroupConfig } from '../module-store/group-section-migration.js';
import { RETINUE_ID, RETINUE_PATH, RETINUE_EMBLEM } from './retinue-people.mjs';
import { RETINUE_TRAINING_TEXT } from './retinue-module.mjs';

export function buildRetinueConfig(current, characterConfig) {
  const next = { ...migrateCenyrGroupConfig(current), ...characterConfig };
  const manifest = structuredClone(next.moduleStoreManifest);
  const nodes = manifest.moduleSectionNodes || [];
  let parentId = nodes.find(node => node.tab === 'Gruppen' && !node.parentId)?.id || 'root:gruppen';
  if (!nodes.some(node => node.id === parentId)) nodes.push({ id: parentId, parentId: '', tab: 'Gruppen', title: 'Gruppen', desc: '', sortOrder: 0 });
  for (const [index, title] of RETINUE_PATH.entries()) {
    let node = nodes.find(node => node.tab === 'Gruppen' && node.parentId === parentId && node.title === title);
    if (!node) {
      const slug = RETINUE_PATH.slice(0, index + 1).join('/').toLowerCase().replaceAll(' ', '-');
      node = { id: `node:gruppen:${slug}`, parentId, tab: 'Gruppen', title, desc: '', sortOrder: 0, ...(index === 2 ? { iconUrl: RETINUE_EMBLEM } : {}) };
      nodes.push(node);
    }
    parentId = node.id;
  }
  manifest.moduleSectionNodes = nodes;
  manifest.moduleNodeAssignments = { ...manifest.moduleNodeAssignments, [RETINUE_ID]: parentId };
  manifest.entryOverrideIds = [...new Set([...(manifest.entryOverrideIds || []), RETINUE_ID])];
  manifest.customSections ||= [];
  let section = manifest.customSections.find(section => section.tab === 'Gruppen' && JSON.stringify(section.path) === JSON.stringify(RETINUE_PATH));
  if (!section) {
    section = { key: 'Haus Varulv', tab: 'Gruppen', path: [...RETINUE_PATH], nodeId: parentId, iconUrl: RETINUE_EMBLEM, desc: 'Gefährten aus Roriksheim', entryIds: [] };
    manifest.customSections.push(section);
  }
  section.entryIds = [...new Set([...(section.entryIds || []), RETINUE_ID])];
  next.moduleStoreManifest = manifest;
  if (Object.hasOwn(next, 'moduleSectionNodes')) next.moduleSectionNodes = structuredClone(nodes);
  if (Object.hasOwn(next, 'moduleNodeAssignments')) next.moduleNodeAssignments = { ...next.moduleNodeAssignments, [RETINUE_ID]: parentId };
  return next;
}

export function extendSkalliBiography(current) {
  const biography = structuredClone(current);
  if (!biography?.biography) throw Error('Skallis bestehende Biografie fehlt.');
  const sections = biography.biography.extraSections ||= [];
  let retinue = sections.find(section => section.title === 'Ein eigenes Gefolge');
  if (!retinue) { retinue = { position: 'afterIntro', mode: 'text', title: 'Ein eigenes Gefolge', text: '' }; sections.push(retinue); }
  if (!retinue.text.includes(RETINUE_TRAINING_TEXT)) retinue.text += `<p>${RETINUE_TRAINING_TEXT}</p>`;
  return biography;
}
