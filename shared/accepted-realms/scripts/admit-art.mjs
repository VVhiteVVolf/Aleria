import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

// Only admission writes images. Release verification reads the canonical receipt,
// never the preview implementation or the original Downloads directories.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const sourcesDirectory = path.join(root, 'shared/accepted-realms/sources');
const manifestFile = path.join(sourcesDirectory, 'art-manifest.json');
const realms = ['aldingen', 'goldmund', 'weisenfluh', 'moinneach', 'iathneach', 'deitheach', 'triarchie'];
const houseRoot = '/Stammbäume/assets/images/houses/accepted-realms';
const warriorRoot = '/Stammbäume/assets/images/references/accepted-realms';
const territoryRoot = '/Stammbäume/assets/images/regions';
const absolute = url => path.join(root, url.replace(/^\//, ''));
const rootUrl = filename => `/${path.relative(root, filename).replaceAll('\\', '/')}`;
const readJson = filename => JSON.parse(fs.readFileSync(filename, 'utf8'));
const sha256 = filename => crypto.createHash('sha256').update(fs.readFileSync(filename)).digest('hex');

function assertLocal(filename) {
  const relative = path.relative(root, filename);
  if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error(`Outside repository: ${filename}`);
  let existing = filename;
  while (!fs.existsSync(existing)) existing = path.dirname(existing);
  const resolved = fs.realpathSync(existing);
  const actualRelative = path.relative(root, resolved);
  if (actualRelative.startsWith('..') || path.isAbsolute(actualRelative)) throw new Error(`Outside repository symlink: ${filename}`);
}

function verifyManifest(manifest) {
  const errors = [];
  if (manifest.schemaVersion !== 1 || manifest.status !== 'complete') errors.push('Art admission is incomplete.');
  const receipts = new Map(manifest.receipts.map(receipt => [receipt.path, receipt]));
  const referenced = new Set();
  const imagePath = (url, label) => {
    if (url === null || url === undefined) return;
    if (!url.startsWith('/') || url.startsWith('/Vorschau/')) errors.push(`Noncanonical ${label}: ${url}`);
    referenced.add(url);
    if (!receipts.has(url)) errors.push(`Missing receipt for ${label}: ${url}`);
  };
  let houseCount = 0;
  for (const realm of realms) {
    const data = manifest.realms[realm];
    if (!data) { errors.push(`Missing realm ${realm}`); continue; }
    imagePath(data.map, `${realm} map`);
    imagePath(data.realmCrest, `${realm} national crest`);
    imagePath(data.realmCrestFull, `${realm} full national crest`);
    for (const [id, house] of Object.entries(data.houses)) {
      houseCount++;
      for (const key of ['crest', 'crestFull', 'warrior', 'warriorPreview']) {
        if (!house[key]) errors.push(`Missing ${realm}/${id}/${key}`);
        imagePath(house[key], `${realm}/${id}/${key}`);
      }
      if (house.warrior === house.warriorPreview) errors.push(`Warrior full image and preview alias: ${realm}/${id}`);
    }
    for (const [id, territory] of Object.entries(data.territories)) {
      imagePath(territory.image, `${realm}/${id} territory image`);
      imagePath(territory.fullsize, `${realm}/${id} full territory image`);
    }
  }
  if (houseCount !== 117) errors.push(`Expected 117 houses, found ${houseCount}.`);
  for (const receipt of manifest.receipts) {
    const filename = absolute(receipt.path);
    assertLocal(filename);
    if (!fs.existsSync(filename)) errors.push(`Missing canonical image ${receipt.path}`);
    else if (sha256(filename) !== receipt.sha256 || fs.statSync(filename).size !== receipt.bytes) errors.push(`Changed canonical bytes ${receipt.path}`);
    if (!referenced.has(receipt.path)) errors.push(`Unreferenced art receipt ${receipt.path}`);
  }
  if (errors.length) throw new Error(errors.join('\n'));
  return { realms: realms.length, houses: houseCount, canonicalFiles: receipts.size,
    territoryEntries: Object.values(manifest.realms).reduce((sum, realm) => sum + Object.keys(realm.territories).length, 0),
    bytes: manifest.receipts.reduce((sum, receipt) => sum + receipt.bytes, 0), missingAssets: 0 };
}

function createPlan() {
  const manifest = { schemaVersion: 1, status: 'complete', capturedAt: '2026-10-28', realms: {}, receipts: [], notes: [] };
  const destinations = new Map();
  const missing = [];
  const add = (source, destinationStem, evidence) => {
    const sourceFile = absolute(source);
    assertLocal(sourceFile);
    if (!fs.existsSync(sourceFile)) { missing.push({ source, evidence }); return null; }
    const extension = path.extname(sourceFile).toLowerCase();
    if (!['.png', '.webp', '.jpg', '.jpeg'].includes(extension)) throw new Error(`Unsupported image: ${source}`);
    const destination = destinationStem + extension;
    const hash = sha256(sourceFile);
    const prior = destinations.get(destination);
    if (prior && prior.sha256 !== hash) throw new Error(`Admission plan has different image bytes at ${destination}`);
    if (prior) {
      if (!prior.provenance.some(item => item.source === source)) prior.provenance.push({ source, evidence });
      return destination;
    }
    const receipt = { path: destination, source, sha256: hash, bytes: fs.statSync(sourceFile).size, provenance: [{ source, evidence }] };
    destinations.set(destination, receipt);
    manifest.receipts.push(receipt);
    return destination;
  };
  for (const realm of realms) {
    const snapshotPath = path.join(sourcesDirectory, `${realm}.snapshot.json`);
    const snapshot = readJson(snapshotPath);
    const preview = `/Vorschau/${snapshot.previewDirectory}`;
    const source = relative => `${preview}/${relative}`;
    const houseById = new Map(snapshot.houses.map(house => [house.id, house]));
    const prefixAssets = ['goldmund', 'weisenfluh', 'moinneach'].includes(realm);
    const crestSource = house => source(prefixAssets ? `assets/${house.crest}` : house.crest);
    const fullCrestSource = house => source(house.fullsize || house.original || (prefixAssets ? `assets/${house.crest}` : house.crest));
    const entry = { map: null, realmCrest: null, realmCrestFull: null, houses: {}, territories: {}, snapshot: rootUrl(snapshotPath), snapshotSha256: sha256(snapshotPath) };
    manifest.realms[realm] = entry;

    const mapPath = realm === 'moinneach' ? snapshot.sourceProposal.map : 'assets/map.webp';
    entry.map = add(source(mapPath), `/Karten/${snapshot.previewDirectory}/Kartenbilder/normal`,
      realm === 'moinneach' ? 'Accepted snapshot sourceProposal.map, original variant 1.' : 'Existing createMapProposal map field in the realm preview module.');

    for (const house of snapshot.houses) {
      const warrior = snapshot.warriors.find(item => item.id === house.id);
      if (!warrior) throw new Error(`No warrior record for ${realm}/${house.id}`);
      entry.houses[house.id] = {
        crest: add(crestSource(house), `${houseRoot}/${realm}/${house.id}`, 'Snapshot house crest; prefix follows existing preview house renderer.'),
        crestFull: add(fullCrestSource(house), `${houseRoot}/${realm}/${house.id}`, 'Snapshot house fullsize/original, as opened by existing house details renderer.'),
        warrior: add(source(warrior.fullsize), `${warriorRoot}/${realm}/${house.id}/krieger`, 'Snapshot warrior.fullsize: complete production image.'),
        warriorPreview: add(source(warrior.image), `${warriorRoot}/${realm}/${house.id}/krieger`, 'Snapshot warrior.image: web preview, distinct from full image.'),
      };
    }

    let national = null;
    if (snapshot.realmEmblem) national = { image: snapshot.realmEmblem.crest, fullsize: snapshot.realmEmblem.fullsize, evidence: 'Snapshot realmEmblem.' };
    else if (realm === 'goldmund') {
      const accepted = readJson(path.join(sourcesDirectory, 'placements/goldmund-entwurf.json'));
      const design = snapshot.realmDesigns.find(item => item.id === accepted.design.realmCrest);
      if (!design) throw new Error('Accepted Goldmund national crest not found among realmDesigns.');
      national = { image: `assets/realm/${design.id}.webp`, fullsize: design.fullsize, evidence: 'Accepted Goldmund design.realmCrest; image template in existing proposal-render.mjs.' };
    } else if (realm === 'weisenfluh') national = { image: 'assets/weisenfluh.webp', fullsize: 'assets/originals/weisenfluh.png', evidence: 'Explicit national emblem in existing index.html and assets.source.json.' };
    else if (realm === 'moinneach') {
      const inventory = readJson(absolute(`${preview}/assets.source.json`));
      const existing = inventory.find(item => item.sourceFile === 'Moinneach Wappen.png');
      national = existing ? { image: existing.file, fullsize: existing.file, evidence: 'Explicit national emblem in assets.source.json and existing index.html.' }
        : { image: `assets/${houseById.get('cethrenn').crest}`, fullsize: `assets/${houseById.get('cethrenn').crest}`, evidence: 'Authorized Cethrenn fallback in absence of a supplied national emblem.' };
    } else if (snapshot.context?.emblem) national = { image: snapshot.context.emblem, fullsize: snapshot.context.emblemFull, evidence: 'Snapshot context national emblem.' };
    if (national) {
      entry.realmCrest = add(source(national.image), `${houseRoot}/${realm}/${realm}`, national.evidence);
      entry.realmCrestFull = add(source(national.fullsize || national.image), `${houseRoot}/${realm}/${realm}`, national.evidence);
    } else {
      entry.realmCrestNote = 'No separate supplied national emblem; retain the known territory/house signs without inventing a Triarchie crest.';
      manifest.notes.push({ realm, reason: entry.realmCrestNote });
    }

    const territory = (id, image, fullsize, metadata = {}, evidence = 'Snapshot territoryArt fields.') => {
      entry.territories[id] = {
        image: add(source(image), `${territoryRoot}/${realm}/${id}`, evidence),
        fullsize: add(source(fullsize || image), `${territoryRoot}/${realm}/${id}`, evidence),
        ...metadata,
      };
    };
    if (snapshot.territoryArt) {
      for (const art of snapshot.territoryArt) territory(art.id, art.image, art.fullsize, {
        ...(art.originRealm ? { originRealm: art.originRealm } : {}), ...(art.shape ? { shape: art.shape } : {}),
      });
    } else if (realm === 'aldingen') {
      for (const art of snapshot.territoryShields) territory(art.id, `assets/shields/${art.id}.webp`, `assets/production/${art.id}.png`, { shape: 'kite' }, 'Snapshot territoryShields; exact image/fullsize templates in art-dialogs.mjs.');
    } else if (realm === 'goldmund') {
      for (const art of [...snapshot.counties, ...snapshot.regions]) territory(art.id, `assets/banners/${art.id}.webp`, `assets/production/${art.id}.png`, { shape: 'banner' }, 'Snapshot counties/regions; exact banner templates in proposal-render.mjs.');
    } else if (realm === 'moinneach') {
      for (const art of snapshot.sourceProposal.regions) territory(art.id, art.design.banner, art.design.banner, { shape: 'banner' }, 'Accepted original-variant snapshot region.design.banner.');
    } else if (realm === 'weisenfluh') {
      const placements = readJson(path.join(sourcesDirectory, 'placements/weisenfluh-entwurf.json')).placements;
      // Latest explicit user choices supersede the snapshot's old ruler defaults.
      const designated = { weisshort: 'sommerfeld', seeblick: 'silberthal', ewiggruen: 'rosenbluth', maehrenfeld: 'honigfeld', weisslauf: 'weissmann', ewigensee: 'goldkranz', hohenklamm: 'damhcallan' };
      const territorialSource = (id, houseId, evidence) => {
        const house = houseById.get(houseId);
        if (!house) throw new Error(`Unknown territorial reuse house ${houseId}`);
        territory(id, `assets/${house.crest}`, house.original, { reusedHouseId: houseId, shape: 'house-crest', dedicatedTerritoryArt: false }, evidence);
      };
      for (const province of snapshot.provinces) territorialSource(`province-${province.id}`, designated[province.id] || province.ruler, 'Known ruler crest reused; latest explicit accepted ruler choice for this province where supplied.');
      for (const settlement of snapshot.settlements) {
        let ruler = designated[settlement.id];
        if (!ruler) {
          const candidates = snapshot.houses.filter(house => placements[house.id] === settlement.id && ['king', 'baron', 'landmann', 'order'].includes(house.rank));
          if (candidates.length === 1) ruler = candidates[0].id;
        }
        if (!ruler) ruler = snapshot.provinces.find(province => province.id === settlement.province)?.ruler;
        if (!ruler) throw new Error(`No known crest reuse for Weisenfluh territory ${settlement.id}`);
        territorialSource(settlement.id, ruler, designated[settlement.id] ? 'Latest explicit user ruling-house choice; existing house crest reused without new territorial artwork.' : 'Unique accepted local ruler or known province ruler crest reused; no dedicated territory art exists.');
      }
    }
  }
  if (missing.length) throw new Error(`Missing source assets; nothing copied:\n${JSON.stringify(missing, null, 2)}`);
  return manifest;
}

function admit(manifest) {
  const conflicts = manifest.receipts.filter(receipt => {
    const target = absolute(receipt.path);
    assertLocal(target);
    return fs.existsSync(target) && sha256(target) !== receipt.sha256;
  });
  if (conflicts.length) throw new Error(`Different destination bytes; nothing overwritten:\n${JSON.stringify(conflicts.map(item => ({ path: item.path, expectedSha256: item.sha256, actualSha256: sha256(absolute(item.path)) })), null, 2)}`);
  let copied = 0;
  for (const receipt of manifest.receipts) {
    const target = absolute(receipt.path);
    if (fs.existsSync(target)) continue;
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(absolute(receipt.source), target, fs.constants.COPYFILE_EXCL);
    copied++;
  }
  const summary = verifyManifest(manifest);
  fs.writeFileSync(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  return { ...summary, copied };
}

try {
  const args = process.argv.slice(2);
  if (args.some(arg => arg !== '--check')) throw new Error('Usage: node shared/accepted-realms/scripts/admit-art.mjs [--check]');
  const summary = args.includes('--check') ? verifyManifest(readJson(manifestFile)) : admit(createPlan());
  console.log(JSON.stringify({ status: 'ok', mode: args.includes('--check') ? 'check' : 'admit', ...summary }, null, 2));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
