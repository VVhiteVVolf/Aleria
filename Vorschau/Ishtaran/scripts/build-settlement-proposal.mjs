import { readFile, writeFile, copyFile } from 'node:fs/promises';
import { HOUSE_NAMING_PROPOSAL } from '../sources/sourcehouse-naming-proposal.mjs';
import { CITY_ASSIGNMENT_ROWS, HOUSE_SEAT_ROWS, LABEL_POSITIONS, PIN_POSITIONS, DESTROYED_SEAT_IDS, HOUSE_DISPLACEMENTS } from '../sources/initial-seat-proposal.mjs';
import { CITY_NAME_PROPOSALS } from '../name-proposals.mjs';

const root = new URL('../', import.meta.url);
const retainedAnchorFile = new URL('sources/map-anchor-review.json', root);
try { await readFile(retainedAnchorFile); }
catch { await copyFile(new URL('../../../diagnostics/ishtaran/placement-map-review/map-anchor-review.json', import.meta.url), retainedAnchorFile); }
const anchors = JSON.parse(await readFile(retainedAnchorFile, 'utf8')).records;
const anchorById = new Map(anchors.map(item => [item.id, item]));
const cityIds = new Set(CITY_ASSIGNMENT_ROWS.map(item => item[0]));
const placements = new Map(HOUSE_SEAT_ROWS.map(([id, rank, seat]) => [id, { rank, seat }]));
if (anchors.length !== 21 || cityIds.size !== 21 || placements.size !== 37 || HOUSE_NAMING_PROPOSAL.length !== 37) throw Error('Incomplete proposal.');

const cities = CITY_ASSIGNMENT_ROWS.map(([id, name, region, description]) => {
  const anchor = anchorById.get(id), proposal = CITY_NAME_PROPOSALS.find(item => item.name === name);
  if (!anchor || !proposal) throw Error(`Missing city source: ${id} / ${name}`);
  const tier = id === 'capital' ? 'capital' : anchor.type === 'large-count-seat' ? 'pascha' : 'tarkan';
  const destroyed = DESTROYED_SEAT_IDS.includes(id);
  return { id, name, tier, destroyed, capacity: destroyed ? 0 : tier === 'capital' ? null : tier === 'pascha' ? 3 : 1,
    point: [anchor.x, anchor.y], pin: PIN_POSITIONS[id] || [anchor.x, anchor.y], label: LABEL_POSITIONS[id],
    overlayLabel: true, region, description, sourceMarkerColor: anchor.markerColor,
    nameProposalId: proposal.id, status: 'proposal' };
});
const houses = HOUSE_NAMING_PROPOSAL.map(item => {
  const assignment = placements.get(item.emblemId);
  if (!assignment || assignment.seat !== null && !cityIds.has(assignment.seat)) throw Error(`Missing house seat: ${item.emblemId}`);
  return { id: item.emblemId, emblemId: item.emblemId, name: item.name, rank: assignment.rank,
    crest: `emblems/previews/${item.emblemId}.webp`, sourceSeat: assignment.seat,
    initialSeatId: assignment.seat, liege: null, nameProposalId: item.nameProposalId,
    namingNote: item.note, sharedRealmEmblem: item.sharedRealmEmblem,
    ...HOUSE_DISPLACEMENTS[item.emblemId], status: 'proposal' };
});
const output = (name, data) => `// Generated proposal display data; authoring sources are retained separately.\nexport const ${name} = Object.freeze(${JSON.stringify(data, null, 2)}.map(item => Object.freeze(item)));\n`;
await writeFile(new URL('territory-data.mjs', root), output('SETTLEMENTS', cities));
await writeFile(new URL('house-data.mjs', root), output('HOUSES', houses));
console.log(JSON.stringify({ cities: cities.length, houses: houses.length, placed: houses.filter(item => item.sourceSeat !== null).length, unassigned: houses.filter(item => item.sourceSeat === null).length }));
