import fs from 'node:fs';
import { KINGDOM_DECISIONS, KINGDOM_CONTEXT } from '../authoring/kingdom-decisions.mjs';
import { BREVANOR_CULTURE } from '../../../Klassenordner/Brevanor/kultur.js';

// Editorial import from immutable captures. Not invoked by release builders.
const root = new URL('../../../', import.meta.url);
const read = file => JSON.parse(fs.readFileSync(new URL(file, root), 'utf8').replace(/^\uFEFF/, ''));
const write = (file, data) => fs.writeFileSync(new URL(file, root), JSON.stringify(data, null, 2) + '\n');
const existing = read('shared/accepted-realms/sources/kingdom-existing-families-20261101.json');
const art = read('shared/accepted-realms/sources/art-manifest.json');
const dimensions = read('shared/accepted-realms/data/map-dimensions.source.json');
for (const [id, settings] of Object.entries(KINGDOM_DECISIONS)) {
  const snapshot = read(`shared/accepted-realms/sources/${id}.snapshot.json`);
  // Latest explicit correction supersedes the archived preparation snapshot.
  if (id === 'aeldrunmar') for (const seat of snapshot.settlements) {
    if (seat.id === 'eadwick') seat.label = [70.6, 13.2];
    if (seat.id === 'virelath') { seat.kind = 'Thaintum'; seat.geography = 'Thaintum im nördlichen Teil des Earltums der Fyr, zwischen Wald, offenem Land und den westlichen Übergängen.'; }
    if (seat.id === 'luthirrith') { seat.kind = 'Ritterliche Herrschaft'; seat.geography = 'Eine kleinere bewaldete ritterliche Herrschaft im westlichen Mittelteil der Insel.'; }
  }
  const draft = read(`shared/accepted-realms/sources/placements/${id}-entwurf.json`);
  const images = art.realms[id];
  const regions = snapshot.counties.map(r => ({ ...r, ruler: r.houseId || (r.id === 'fyr' ? 'frye' : r.id),
    territoryType: id === 'brevanor' ? r.level === 'royal' ? 'Königliche Domäne' : 'Comteyrat' : r.title,
    territoryName: id === 'brevanor' ? r.level === 'royal' ? 'Königliche Domäne Caerennes' : r.regionName : `${r.title} ${r.regionName}`,
  }));
  const settlements = snapshot.settlements.map(s => ({ ...s, territoryType: s.kind === 'Ritterlicher Orden' ? 'Ordensgebiet' : s.kind === 'Ritterliche Herrschaft' ? s.kind : s.kind.includes('Thaintum') ? 'Thaintum' : 'Herrschaft',
    territoryName: `${s.kind === 'Ritterlicher Orden' ? 'Ordensgebiet' : s.kind === 'Ritterliche Herrschaft' ? s.kind : s.kind.includes('Thaintum') ? 'Thaintum' : 'Herrschaft'} ${s.regionName.replace(/^(Herrschaft|Domäne) /, '')}`,
  }));
  const houses = snapshot.houses.map(h => {
    const familyId = `haus-${h.id}`, family = existing[familyId], seatId = draft.placements[h.id];
    const seat = settlements.find(s => s.id === seatId), region = regions.find(r => r.id === seat.county);
    const rankId = family?.document.houseProfile.rankId || ({ royal: 'royal', earl: 'county', count: 'county', baron: 'brenor', knight: 'knight' }[h.rank] || 'unknown');
    const rank = rankId === 'royal' ? id === 'brevanor' ? 'Riël (König)' : 'König' : rankId === 'county' ? id === 'brevanor' ? 'Comteyr (Graf)' : 'Earl (Graf)' : rankId === 'brenor' ? 'Brenor (Baron)' : rankId === 'barony' ? 'Thain (Baron)' : rankId === 'knight' ? 'Ritterherr' : 'Offen';
    const knownLiege = family?.document.houseProfile.liegeHouseId?.replace(/^house-/, '') || '';
    const sourceRuler = snapshot.counties.find(r => r.capital === h.sourceSeat);
    const liegeId = knownLiege || (h.rank === 'vassal' && sourceRuler ? sourceRuler.houseId || sourceRuler.id : h.rank === 'earl' || h.rank === 'count' ? settings.ruler : '');
    const peers = snapshot.houses.filter(p => draft.placements[p.id] === seatId && !p.extinct);
    const isSeatRuler = !h.extinct && !['Bistum', 'Ritterlicher Orden'].includes(seat.kind) && (region?.capital === seatId ? region.ruler === h.id : peers.length === 1);
    const w = snapshot.warriors.find(w => w.id === h.id);
    const heads = family?.persons.filter(p => p.houseId === family.lineage.houseId && p.lineageRole === 'head' && !/^\?+$/.test(p.name)).map(p => ({ id: p.id, name: p.name, status: p.status, image: p.portrait ? p.portrait.startsWith('/') || p.portrait.startsWith('../') ? p.portrait : `/Stammbäume/${p.portrait}` : '', role: 'Überliefertes Hausoberhaupt' }));
    return { id: h.id, sourceId: h.id, name: h.name, houseId: `house-${h.id}`, familyId, originRealm: id, clan: false,
      seatId, regionId: seat.county || '', rankId, rank, liegeId, isSeatRuler, extinct: h.extinct, motif: h.motif, palette: h.palette,
      ornament: h.ornament || '', frame: h.frame || '', focus: (h.focus || '').replace(/; Vorschlag.*$/, '.').replace(/vorgeschlagene /g, '').replace(/Vorschlag für /g, ''),
      ...images.houses[h.id], warrior: { ...w, image: images.houses[h.id].warriorPreview, fullsize: images.houses[h.id].warrior,
        classHref: '/' + w.classHref.replace(/^(?:\.\.\/|\/)+/, ''), bestiary: w.bestiaryHref ? '/' + w.bestiaryHref.replace(/^(?:\.\.\/|\/)+/, '') : '' },
      existingFamily: !!family, ...(family ? { knownDescription: family.document.description, knownHeads: heads,
        genealogySource: `Stammbäume/assets/js/data/${h.id === 'bielle' ? 'brevanor-desele-bielle-records' : ['beran','earncynne','estmere','frye','seolfor'].includes(h.id) ? 'aeldrunmar-earltum-families' : `house-${h.id}-family`}.js` } : {}),
      ...(h.id === 'thornwick' ? { formerSeat: 'Waldburg Thornholt (1720 verloren)', homeless: true } : {}),
      rankBasis: rankId === 'unknown' ? 'Haus und örtliche Zuordnung bestätigt; genauer Adelsrang nicht überliefert.' : 'Bestehende Familienakte oder ausdrückliche Landes- und Rangordnung.',
    };
  });
  // Scandyn already has a populated canonical family. Keep its actual separate
  // seat; no relocation into Tharn's capital and no invented map coordinate.
  if (id === 'aeldrunmar') {
    const family = existing['haus-scandyn'];
    settlements.push({ id: 'scandmere', name: 'Scandmere', county: 'tharn', kind: 'Rittersitz', regionName: 'Scandmere',
      territoryType: 'Rittersitz', territoryName: 'Rittersitz Scandmere', point: null,
      geography: 'Überlieferter Sitz des Hauses Scandyn im Thaintum Trenmorath, Earltum der Tharn. Seine genaue Lage auf der Übersichtskarte ist nicht verzeichnet.' });
    houses.push({ id: 'scandyn', name: 'Scandyn', sourceId: 'scandyn', houseId: 'house-scandyn', familyId: 'haus-scandyn', originRealm: id,
      clan: false, seatId: 'scandmere', regionId: 'tharn', rankId: 'knight', rank: 'Ritterherr', liegeId: 'tharn', isSeatRuler: true, existingFamily: true,
      knownDescription: family.document.description, knownHeads: family.persons.filter(p => p.houseId === 'house-scandyn' && p.lineageRole === 'head').map(p => ({ id: p.id, name: p.name, status: p.status, image: p.portrait ? `/Stammbäume/${p.portrait}` : '', role: 'Überliefertes Hausoberhaupt' })),
      crest: '/Stammbäume/assets/images/houses/Aeldrunmar/haus-scandyn.png', crestFull: '/Stammbäume/assets/images/houses/Aeldrunmar/haus-scandyn.png',
      genealogySource: 'Stammbäume/assets/js/data/house-scandyn-family.js' });
  }
  const context = { introduction: snapshot.context.introduction, history: snapshot.context.history, ...KINGDOM_CONTEXT[id] };
  if (id === 'aeldrunmar') context.history = context.history.map(h => h.title.startsWith('Earltümer') ? { ...h, text: 'Sechs Earltümer gliedern das Land. Eigene Domänen, weitere Thaintümer und kleinere ritterliche Herrschaften besitzen ihre eigenen Feldzeichen. Virelath ist ein Thaintum, Luthirrith eine ritterliche Herrschaft. Hingstgard bleibt ein gesonderter ritterlicher Ordensbezirk ohne zugeteiltes Adelshaus.' } : h);
  const data = { schemaVersion: 1, acceptedOn: '2026-11-01', admissionVersion: '20261101', id, ...settings,
    title: `Königreich ${settings.name}`, type: 'Königreich', urbanHouseTerritories: false,
    mapSource: images.map, map: images.map.replace(/\.webp$/, '.svg'), crest: images.realmCrest, context, notes: KINGDOM_CONTEXT[id].notes || [], design: draft.design || {},
    mapAnnotations: id === 'aeldrunmar' ? [
      { id: 'luthirrith-status', text: 'Ritterliche Herrschaft', position: [81.6, 32.0], width: 10.5, height: 2.1 },
      { id: 'virelath-status', text: 'Thaintum', position: [38.2, 69.9], width: 7.2, height: 2.1 },
    ] : [],
    regions, settlements, houses, territoryArt: images.territories,
    historicalEmblems: Object.values(images.historicalEmblems || {}).map(({ id, name, title, motif, description, image, fullsize }) => ({ id, name, title, motif, description, image, fullsize })),
    cultureSections: [{ title: id === 'brevanor' ? 'Die brevanorische Adelshierarchie' : 'Krone, Earls und Thains',
      paragraphs: id === 'brevanor' ? BREVANOR_CULTURE.orderOverview.nobleRanks.map(r => `${r.title}: ${r.subtitle}.`) : ['Die Krone steht über den Earls der einzelnen Earltümer. Thaintümer und kleinere ritterliche Herrschaften gliedern die örtliche Ebene. Der persönliche Rang eines Hauses wird nur bei eigenem Beleg geführt.'],
      links: [{ label: `Klassen ${id === 'aeldrunmar' ? 'der Zwillingskronen' : settings.name + 's'} ↗`, href: `/Klassenordner/Klassenseite.html${id === 'brevanor' ? '?herkunft=brevanor#brevanor' : '#aeldrunmar'}` }],
    }],
  };
  write(`shared/accepted-realms/data/${id}.source.json`, data);
  dimensions[id] = snapshot.context.imageSize;
  console.log(`${id}: ${houses.length} houses / ${settlements.length} seats`);
}
write('shared/accepted-realms/data/map-dimensions.source.json', dimensions);
