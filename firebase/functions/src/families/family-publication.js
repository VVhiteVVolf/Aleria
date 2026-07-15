import { FAMILY_COLLECTIONS } from './family-collections.js';

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function cleanImageUrl(value) {
  const url = cleanText(value);
  if (!url) return '';
  if (url.startsWith('assets/images/')) return url;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' ? parsed.href : '';
  } catch (error) {
    return '';
  }
}

function withoutPrivateFields(record) {
  const { notes, extensions, ...publicRecord } = record;
  return publicRecord;
}

export function createPublicFamily(workspace) {
  const publicPartnerships = workspace.collections.partnerships
    .filter(record => record.visibility === 'public')
    .map(withoutPrivateFields);
  const partnershipIds = new Set(publicPartnerships.map(record => record.id));
  const publicParentages = workspace.collections.parentages
    .filter(record => record.visibility === 'public')
    .map(record => ({
      ...withoutPrivateFields(record),
      partnershipId: partnershipIds.has(record.partnershipId) ? record.partnershipId : ''
    }));
  return {
    root: {
      schema: workspace.root.schema,
      schemaVersion: workspace.root.schemaVersion,
      document: {
        ...workspace.root.document,
        emblem: cleanImageUrl(workspace.root.document?.emblem)
      },
      lineage: workspace.root.lineage,
      presentation: workspace.root.presentation,
      view: workspace.root.view,
      extensions: {}
    },
    collections: {
      persons: workspace.collections.persons.map(record => ({
        ...withoutPrivateFields(record),
        portrait: cleanImageUrl(record.portrait)
      })),
      partnerships: publicPartnerships,
      parentages: publicParentages,
      houses: workspace.collections.houses.map(record => ({
        ...record,
        emblem: cleanImageUrl(record.emblem)
      })),
      cadetBranches: workspace.collections.cadetBranches.map(record => ({
        ...withoutPrivateFields(record),
        emblem: cleanImageUrl(record.emblem)
      })),
      timeJumps: workspace.collections.timeJumps.map(withoutPrivateFields)
    }
  };
}

export function countPublicFamilyWrites(publicFamily) {
  return 4 + FAMILY_COLLECTIONS.reduce((total, name) => total + publicFamily.collections[name].length, 0);
}
