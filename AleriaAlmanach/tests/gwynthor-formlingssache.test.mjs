import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { EUDDOGWY, LLEUWEN, ORVAR } from '../modules/gwynthor-formlingssache/formlingssache-people.mjs';
import { buildFormlingCharacterExports } from '../modules/gwynthor-formlingssache/formlingssache-characters.mjs';
import { resolveCreatureBestiaryReference } from '../modules/creatures/creature-bestiary-reference.js';
import { buildCathedralHierarchy } from '../modules/gwynthor-cathedral/cathedral-hierarchy.mjs';
import clergy from '../../Kontinente/modules/administration/data/celtigerns-klerus.mjs';
import { THEATER_ENSEMBLE, THEATER_SUPPORTING_CAST } from '../modules/gwynthor-theater/theater-people.mjs';
import { buildFormlingNotices, FORMLING_BOARD_BINDING, FORMLING_NOTICE_ID, FORMLING_PLACEMENT_UPDATE } from '../../Anzeigetafeln/tools/notices/lleuwens-anhoerung.mjs';
import { buildGwynthorQuestPack } from '../../Anzeigetafeln/tools/build-gwynthor-quest-notices.mjs';
import { withNoticeDate } from '../../Anzeigetafeln/assets/js/timeline/notice-dates.mjs';

const root = new URL('../../', import.meta.url);
const read = path => JSON.parse(readFileSync(new URL(path, root), 'utf8'));
const asset = read('Anzeigetafeln/assets/data/board-art-catalog.json').posters.find(p => p.id === 'kirche');

test('one Kurator fills the existing chancery post in both views without changing the prelates or service count', () => {
  const hierarchy = buildCathedralHierarchy();
  const services = hierarchy.trees.find(tree => tree.id === 'kirchdiener').levels.slice(1).flatMap(level => level.nodes);
  assert.equal(services.length, 17);
  const office = services.find(node => node.id === 'kathedrale-sekretaer');
  const administrative = clergy.groups.find(group => group.id === 'klerus-adjutantur').roles[0];
  assert.equal(office.title, EUDDOGWY.name);
  assert.equal(administrative.name, EUDDOGWY.name);
  assert.equal(office.portrait, administrative.portrait);
  assert.match(office.subtitle, /Kurator/);
  assert.equal(clergy.groups.find(group => group.id === 'klerus-praelaten').roles.length, 9);
  assert.equal(hierarchy.trees[0].levels[1].nodes.length, 9);
});

test('the supporting actors retain distinct identities and the Formling has no invented actual age', () => {
  assert.equal(THEATER_ENSEMBLE.length, 13);
  assert.deepEqual(THEATER_SUPPORTING_CAST.map(person => person.id), [LLEUWEN.id, ORVAR.id]);
  const exports = buildFormlingCharacterExports();
  const captive = exports.find(entry => entry.character.id === LLEUWEN.id).character;
  assert.equal(captive.birth, '');
  assert.equal(captive.imageSets.length, 3);
  assert.equal(captive.imageSets.find(set => set.id === captive.activeImageSetId).portrait, captive.portrait);
  assert.deepEqual(resolveCreatureBestiaryReference({ species: 'Formwandler', bestiaryReference: LLEUWEN.bestiaryReference }), LLEUWEN.bestiaryReference);
  assert.ok(existsSync(new URL(LLEUWEN.bestiaryReference.url.slice(1), root)));
  assert.ok(exports.every(entry => entry.character.worldPersonId === entry.character.id));
  assert.equal(new Set(exports.map(entry => entry.character.id)).size, 4);
});

test('the ecclesiastical announcement retains all three positions and an estimated hearing date', async () => {
  const pages = buildFormlingNotices(asset);
  assert.equal(pages.length, 3);
  assert.ok(pages.every(p => ['erlass', 'ankuendigung'].includes(p.typ) && !p.rewards));
  assert.ok(pages.every(p => p.noticeGroupId === FORMLING_NOTICE_ID && p.media.verfasser.personId === EUDDOGWY.id));
  assert.deepEqual(pages.map(p => p.stackOrder), [0, 1, 2]);
  const text = pages.map(p => p.text).join('');
  for (const name of ['Lleuwen', 'Ulrich Schniedel', 'Orvar Schattentänzer', 'Gwalchgwyn Saethwyr', 'Neithon Draig']) assert.ok(text.includes(name));
  assert.match(text, /Nach gegenwärtiger Einschätzung[\s\S]*spätestens bis Ende der Woche/);
  assert.match(text, /Tag und Stunde werden gesondert verkündet/);
  assert.match(text, /infernalen Wesens ist eine ernste Angelegenheit/);
  assert.doesNotMatch(text, /in zwei Tagen|dritten Morgenstunde|Abenteurer|Quest/);
  assert.deepEqual((await buildGwynthorQuestPack()).zettel.filter(p => p.noticeGroupId === FORMLING_NOTICE_ID), pages.map(withNoticeDate));
});

test('the new proclamation binds the existing church poster once and preserves saved paper positions and comments', () => {
  const context = { window: {} };
  vm.runInNewContext(readFileSync(new URL('Anzeigetafeln/assets/js/data/authored-notices.js', root), 'utf8'), context);
  const merge = context.window.TafelAuthoredNotices.merge;
  const layout = read('Anzeigetafeln/Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor/board-layout.json');
  const boardLayout = layout.posters ? layout : layout.layout || layout.state?.boardLayout;
  assert.ok(boardLayout?.posters);
  const before = structuredClone(boardLayout);
  const previous = { zettel: [{ id: 'preserve', comments: [{ text: 'Eigener Beitrag' }] }], boardLayout };
  const source = { zettel: buildFormlingNotices(asset), boardBindings: [FORMLING_BOARD_BINDING] };
  const next = merge(previous, source);
  assert.deepEqual(previous.boardLayout, before);
  assert.equal(next.boardLayout.posters.length, before.posters.length);
  assert.strictEqual(next.zettel[0], previous.zettel[0]);
  for (const paper of next.boardLayout.posters) {
    const old = before.posters.find(p => p.id === paper.id);
    assert.deepEqual([paper.x, paper.y, paper.width, paper.rotation], [old.x, old.y, old.width, old.rotation]);
    if (paper.id === FORMLING_BOARD_BINDING.posterId) {
      assert.equal(paper.noticeId, FORMLING_NOTICE_ID);
      assert.equal(paper.pin.enabled, true);
    } else assert.deepEqual(paper, old);
  }
  assert.equal(merge(next, source).zettel.length, next.zettel.length);
});

test('the six portraits and three notice signs match the retained image manifest', () => {
  const manifest = read('AleriaAlmanach/assets/gwynthor-formlingssache/asset-manifest.json');
  assert.equal(manifest.images.filter(image => image.kind === 'portrait').length, 6);
  assert.equal(manifest.images.filter(image => image.kind === 'notice-art').length, 3);
  for (const image of manifest.images) for (const file of [image, image.display].filter(Boolean)) {
    const bytes = readFileSync(new URL(file.file, root));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256);
  }
  for (const image of manifest.images.filter(image => image.kind === 'portrait')) assert.equal(image.width * 3, image.height * 2);
});

test('the smaller church placement updates an untouched old default atomically and preserves custom positions', () => {
  const context = { window: {} };
  vm.runInNewContext(readFileSync(new URL('Anzeigetafeln/assets/js/data/authored-notices.js', root), 'utf8'), context);
  const merge = context.window.TafelAuthoredNotices.merge;
  const update = FORMLING_PLACEMENT_UPDATE;
  const make = patch => ({ zettel: [], boardLayout: { version: 1, posters: [{ id: update.posterId,
    assetId: update.assetId, noticeId: update.noticeId, ...update.from, rotation: 0, ...patch }] } });
  const source = { zettel: [], boardLayoutUpdates: [update] };
  const previous = make({});
  const changed = merge(previous, source).boardLayout.posters[0];
  assert.deepEqual([changed.x, changed.y, changed.width], Object.values(update.to));
  assert.deepEqual(previous.boardLayout.posters[0], make({}).boardLayout.posters[0]);
  for (const patch of [{ x: .123 }, { width: .033 }, { noticeId: 'another-notice' }]) {
    const custom = make(patch);
    assert.deepEqual(merge(custom, source).boardLayout, custom.boardLayout);
  }
});
