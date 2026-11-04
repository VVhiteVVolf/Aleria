// Diagnostic wrapper around the portable, read-only feature implementation.
import fs from 'node:fs';
import { auditCenyrHouseCoverage, loadPublicCenyrCoverageInputs } from '../../../Familien Häuser und Clans/modules/house-coverage/cenyr-house-coverage-node.mjs';

const input = loadPublicCenyrCoverageInputs();
export const project = input.project, merged = input.merged, projectById = input.projectById, publicById = input.publicById;
export const hidden = input.isHiddenRecord;
// Opaque predicates, never collections of protected identities.
export const deniedIds = { has: input.isProtectedId }, deniedNames = { has: input.isProtectedName };
export const key = value => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const nameKey = value => key(value).replace(/^(?:haus|house|clan|sept)-/, '');
const report = await auditCenyrHouseCoverage({ allowlistIds: input.scope.map(record => record.id) });
export const records = report.records;
const write = (name, value) => {
  const target = new URL(name, import.meta.url), temporary = new URL(`${name}.tmp`, import.meta.url);
  fs.writeFileSync(temporary, JSON.stringify(value, null, 2) + '\n'); fs.renameSync(temporary, target);
};
write('familien.json', records);
write('public-family-ids.json', records.map(record => record.stableId).sort());
write('public-family-metadata.json', records.map(record => ({ id: record.stableId, title: record.title, folderPath: record.folderPath,
  primaryFolderPath: record.primaryFolderPath, houseProfile: record.houseProfile, emblem: record.emblem })));
write('summary.json', { reviewedAt: new Date().toISOString(), scope: report.scope, ...report.summary });
write('gaps.json', records.filter(record => Object.values(record.missing).some(Boolean)
  || record.links.iframeSupported && !record.links.iframeCanonical
  || record.links.biographyBackLinkSupported && !record.links.biographyBackLinkCanonical));
console.log(JSON.stringify(report.summary));
