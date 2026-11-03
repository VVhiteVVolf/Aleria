import fs from 'node:fs';
import crypto from 'node:crypto';
import { HOUSES } from '../house-data.mjs';
import { SETTLEMENTS } from '../territory-data.mjs';
import { CITY_NAME_PROPOSALS } from '../name-proposals.mjs';
import { EMBLEMS } from '../heraldry-data.mjs';
import { HOUSE_NAMING_PROPOSAL } from './sourcehouse-naming-proposal.mjs';
import { CITY_ASSIGNMENT_ROWS, HOUSE_SEAT_ROWS, LABEL_POSITIONS } from './initial-seat-proposal.mjs';

const root = new URL('../../../', import.meta.url);
const anchors = JSON.parse(fs.readFileSync(new URL('diagnostics/ishtaran/placement-map-review/map-anchor-review.json', root), 'utf8'));
const errors = [];
const check = (condition, message) => { if (!condition) errors.push(message); };
const bySeat = (seatId) => HOUSES.filter((house) => house.initialSeatId === seatId);
const capitals = SETTLEMENTS.filter((seat) => seat.tier === 'capital');
const large = SETTLEMENTS.filter((seat) => seat.tier === 'pascha');
const small = SETTLEMENTS.filter((seat) => seat.tier === 'tarkan');
const free = HOUSES.filter((house) => house.initialSeatId === null);
const occupied = HOUSES.filter((house) => house.initialSeatId !== null);
check(HOUSES.length === 37, '37 lebende Häuser erwartet');
check(new Set(HOUSES.map((house) => house.id)).size === 37, 'Doppelte Haus-ID');
check(new Set(HOUSES.map((house) => house.name)).size === 37, 'Doppelter Hausname');
check(!HOUSES.some((house) => house.id === 'maghneach' || house.emblemId === 'maghneach'), 'Maghneach fälschlich lebendes Haus');
check(occupied.length === 32 && free.length === 5, '32 platzierte und 5 freie Häuser erwartet');
check(capitals.length === 1 && large.length === 8 && small.length === 12, 'Stadtstufen müssen 1 + 8 + 12 sein');
check(SETTLEMENTS.length === 21 && new Set(SETTLEMENTS.map((seat) => seat.name)).size === 21, '21 eindeutige Stadtnamen erwartet');
check(HOUSES.find((house) => house.emblemId === 'source-03')?.name === 'Dahakid', 'Dahakid wurde umbenannt');
check(HOUSES.find((house) => house.emblemId === 'source-03')?.rank === 'Pascha', 'Dahakid soll Pascha sein');
check(HOUSES.find((house) => house.emblemId === 'source-07')?.name === 'Aschina', 'Aschina am Landeswappen fehlt');
for (const house of HOUSES) {
  const proposal = HOUSE_NAMING_PROPOSAL.find((entry) => entry.emblemId === house.emblemId);
  check(proposal?.name === house.name, `Abweichender Hausname: ${house.id}`);
  check(EMBLEMS.some((emblem) => emblem.id === house.emblemId), `Unbekanntes Wappen: ${house.id}`);
  check(house.initialSeatId === null || SETTLEMENTS.some((seat) => seat.id === house.initialSeatId), `Unbekannter Sitz: ${house.id}`);
  check(house.sourceSeat === house.initialSeatId, `Abweichender Ausgangssitz: ${house.id}`);
  check(fs.existsSync(new URL(`../assets/${house.crest}`, import.meta.url)), `Fehlende Wappendatei: ${house.id}`);
  check(house.status === 'proposal', `Kein Entwurfsstatus: ${house.id}`);
  const row = HOUSE_SEAT_ROWS.find(([id]) => id === house.id);
  check(row?.[1] === house.rank && row?.[2] === house.initialSeatId, `Runtime/Autorenquelle unterscheiden sich: ${house.id}`);
}
const seatChecks = [];
for (const seat of SETTLEMENTS) {
  const residents = bySeat(seat.id);
  const row = CITY_ASSIGNMENT_ROWS.find(([id]) => id === seat.id);
  check(row?.[1] === seat.name && row?.[2] === seat.region && row?.[3] === seat.description, `Stadt weicht von Autorenquelle ab: ${seat.id}`);
  check(CITY_NAME_PROPOSALS.some((proposal) => proposal.id === seat.nameProposalId && proposal.name === seat.name), `Stadtname nicht aus den 40 Vorschlägen: ${seat.id}`);
  check(JSON.stringify(seat.label) === JSON.stringify(LABEL_POSITIONS[seat.id]), `Abweichendes Label: ${seat.id}`);
  const anchor = anchors.records.find((entry) => entry.id === seat.id);
  check(Boolean(anchor), `Fehlender belegter Kartenanker: ${seat.id}`);
  const dx = anchor ? Math.abs(seat.point[0] - anchor.x) * anchors.dimensions[0] / 100 : Infinity;
  const dy = anchor ? Math.abs(seat.point[1] - anchor.y) * anchors.dimensions[1] / 100 : Infinity;
  check(dx <= 1 && dy <= 1, `Sitz weicht mehr als einen Pixel vom belegten Ortskreis ab: ${seat.id}`);
  check(JSON.stringify(seat.point) === JSON.stringify(seat.pin), `Pin und Punkt unterscheiden sich: ${seat.id}`);
  if (seat.tier === 'capital') {
    check(residents.filter((house) => house.rank === 'Sultan').length === 1, 'Genau ein Sultan in der Hauptstadt erwartet');
    check(residents.filter((house) => house.rank === 'Tarkan').length === 2 && residents.length === 3, 'Hauptstadt soll Sultan + zwei Tarkan aufnehmen');
  } else if (seat.tier === 'pascha') {
    check(residents.filter((house) => house.rank === 'Pascha').length === 1, `Genau ein Pascha erwartet: ${seat.id}`);
    check(residents.filter((house) => house.rank === 'Tarkan').length <= 2, `Zu viele zusätzliche Tarkan: ${seat.id}`);
    check(residents.length <= 3, `Kapazität überschritten: ${seat.id}`);
  } else {
    check(residents.length === 1 && residents[0]?.rank === 'Tarkan', `Kleine Stadt benötigt genau einen Tarkan: ${seat.id}`);
  }
  seatChecks.push({ id: seat.id, name: seat.name, tier: seat.tier, houses: residents.map((house) => ({ name: house.name, rank: house.rank })), anchorOffsetPixels: [dx, dy] });
}
const extraDistribution = large.map((seat) => bySeat(seat.id).filter((house) => house.rank === 'Tarkan').length);
check(JSON.stringify([...extraDistribution].sort((a, b) => b - a)) === JSON.stringify([2, 2, 2, 1, 1, 1, 0, 0]), 'Zusätzliche Häuser nicht in gewünschter Vielfalt verteilt');

const geographyFindings = [];
const geography = (id, condition, issue, suggestedRegion, suggestedDescription) => {
  const seat = SETTLEMENTS.find((entry) => entry.id === id);
  if (!condition(seat)) return;
  geographyFindings.push({
    id, name: seat.name, severity: 'location-wording', issue,
    currentRegion: seat.region, currentDescription: seat.description,
    suggestedRegion, suggestedDescription,
    evidence: `diagnostics/ishtaran/placement-map-review/${id}-normal-regions.png`,
  });
};
geography('large-06', (seat) => seat.description.includes('östlichen Rand des südöstlichen'),
  'Der Ortskreis liegt am Südostufer des großen inneren Sees und nördlich des sichtbaren Gebirges. Die aktuelle Beschreibung verschiebt den maßgeblichen Bezug zum östlichen Gebirgsrand.',
  'Östliche Seenlandschaft', 'Große Stadt am Südostufer des großen inneren Sees, nördlich des östlichen Gebirges.');
geography('small-05', (seat) => seat.description.includes('nördlichen Rand'),
  'Das Gebirge liegt im Ausschnitt links beziehungsweise nordwestlich des Ortskreises. Der Kreis liegt am südöstlichen Auslauf dieses nördlichen Ostgebirges, nicht an dessen Nordrand.',
  'Nordöstlicher Gebirgsfuß', 'Kleine Herrschaft am südöstlichen Auslauf des nördlichen Ostgebirges.');
geography('small-10', (seat) => `${seat.region} ${seat.description}`.includes('Gebirgsrand'),
  'Am Ortskreis ist ein offener südlicher Landstreifen westlich eines Flussarms sichtbar. Im Ausschnitt liegt kein erkennbares Gebirge; die Wolkenkante allein belegt keinen Gebirgsrand.',
  'Südliches Flussland', 'Kleine Herrschaft auf dem südlichen Landstreifen westlich des nord-südlichen Flussarms; der rote Quellkreis begründet keinen anderen Rang.');
geography('small-12', (seat) => /Gebirgsrand|Gebirgsland/u.test(`${seat.region} ${seat.description}`),
  'Am südöstlichen Ortskreis sind Baumgruppen, offenes Land und die südliche Wolkenkante sichtbar. Ein unmittelbarer Gebirgsrand ist hier nicht belegt; die markante östliche Berggruppe liegt deutlich weiter westlich.',
  'Südöstliches Waldland', 'Kleine Herrschaft am südöstlichen Rand des Waldlands oberhalb der Wolkenkante.');

const snapshots = ['Vorschau/Ishtaran/house-data.mjs', 'Vorschau/Ishtaran/territory-data.mjs', 'Vorschau/Ishtaran/sources/initial-seat-proposal.mjs']
  .map((file) => ({ file, sha256: crypto.createHash('sha256').update(fs.readFileSync(new URL(file, root))).digest('hex') }));
const report = {
  reviewedAt: '2026-11-03', reviewerScope: 'Read-only runtime/source review; only this report is written.',
  runtimeFilesChanged: false, snapshots, structuralErrors: errors,
  counts: { houses: HOUSES.length, placed: occupied.length, free: free.length, cities: SETTLEMENTS.length, capital: capitals.length, paschaCities: large.length, smallCities: small.length },
  all37NamesMatchNamingProposal: HOUSES.every((house) => HOUSE_NAMING_PROPOSAL.find((entry) => entry.emblemId === house.emblemId)?.name === house.name),
  dahakidPreserved: HOUSES.find((house) => house.emblemId === 'source-03')?.name === 'Dahakid',
  maghneachExcludedFromLivingHouses: !HOUSES.some((house) => house.id === 'maghneach'),
  extraTarkanDistributionInLargeCityOrder: extraDistribution,
  freeHouses: free.map((house) => ({ id: house.id, name: house.name })),
  seatChecks, geographyFindings,
  visuallyReviewedContacts: ['contact-01-07.jpg', 'contact-08-14.jpg', 'contact-15-21.jpg'].map((file) => `diagnostics/ishtaran/placement-map-review/${file}`),
  geographyReviewNote: 'Alle 21 Normal-/Regionen-Ausschnitte tatsächlich angesehen. Nur vier klare Ortsbezüge beziehungsweise unbelegte unmittelbare Gebirgsbehauptungen aufgeführt; keine kosmetischen Namenspräferenzen.',
};
fs.writeFileSync(new URL('./initial-seat-names-review.json', import.meta.url), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ structuralErrors: errors, counts: report.counts, geographyFindings: geographyFindings.map(({ id, name, issue }) => ({ id, name, issue })) }, null, 2));
