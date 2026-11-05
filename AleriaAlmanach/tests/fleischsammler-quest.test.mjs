import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { AUTHORED_QUEST_PREPARATIONS } from '../modules/quests/quest-authored-dossiers.js';
import { normalizeQuest } from '../modules/quests/quest-model.js';
import { normalizeQuestArea } from '../modules/quests/quest-area-model.js';
import { renderQuestDetail, questCard } from '../modules/quests/quest-view.js';
import { questsFromBoard } from '../modules/quests/quest-sources.js';
import { buildFleischsammlerNotices } from '../../Anzeigetafeln/tools/quests/fleischsammler-wanted.mjs';

const preparation = AUTHORED_QUEST_PREPARATIONS['gwynthor-fleischsammler'];
const mapId = 'cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-bannkreis';
const board = { id: 'cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-anzeigetafel', hierarchy: [{ slug: 'gwynthor' }] };
const catalog = { boards: [board], maps: [{ id: mapId, title: 'Gwynthor · Bannkreis' }], modules: [] };

test('one public quest joins four notice sheets, the three authors, the local captain and the original symbolic sketch', async () => {
  const notices = await buildFleischsammlerNotices();
  const quests = questsFromBoard(board, { zettel: notices });
  assert.equal(quests.length, 1);
  const quest = quests[0];
  assert.equal(quest.title, 'Der Fleischsammler aus Gwynthors Bannkreis');
  assert.deepEqual(quest.dossier.participants.map(row => row.recordId), [
    'person--haus-draig--neithon-1718-draig', 'person--haus-gwyllach--meredydd-gwyllach', 'person--haus-gafyr--ferydnand-gafyr',
    'person--haus-argall--rhydric-argall'
  ]);
  assert.equal(quest.dossier.cardImage, '/Anzeigetafeln/assets/images/quests/fleischsammler/sinnbild-v1.png');
  assert.equal(quest.dossier.cardImageStyle, 'avatar');
  assert.equal(quest.dossier.coverImage, quest.dossier.cardImage);
  assert.match(quest.dossier.coverCaption, /keine Zeichnung nach Zeugenaussage/);
  assert.deepEqual(quest.rewards.map(row => [row.currency, row.amount]), [['gold', 3], ['silver', 1]]);
  assert.ok(quest.links.maps.includes(mapId));
});

test('public preparation contains no speculative perpetrator history or victim-family revelations', () => {
  const delivered = JSON.stringify(preparation);
  assert.doesNotMatch(delivered, /private[\\/]aleria|character\.private|DOSSIER\.html|Bettler|Landstreicher|Geliebte|Skelett|Ritual|Gottheit|Stimmen|Erdrossel|Organe|Hautpartien/iu);
  assert.equal(preparation.dossier.informationSources.length, 8);
  assert.equal(new Set(preparation.dossier.informationSources.map(row => row.familyId)).size, 8);
  for (const source of preparation.dossier.informationSources) {
    assert.equal(source.description, 'Örtliche Anlaufstelle im östlichen Bannkreis.');
    assert.doesNotMatch(JSON.stringify(source), /Tochter|Ehefrau|getötet|ermordet|Opfer|Trauer/iu);
    assert.ok(source.profile.startsWith('/Stammbäume/Stammbaum.html?family=haus-'));
  }
  assert.equal(preparation.dossier.encounters.length, 0);
  assert.doesNotMatch(preparation.dossier.participants.at(-1).description, /geschieden|Gwenella|Maelor|Perwyn|Barde|Vetter/iu);
  assert.equal(preparation.dossier.route, null);
  assert.match(preparation.summary, /sechzehn bis vierunddreißig/);
  assert.match(preparation.summary, /Weder Kapuze noch Hackebeil/);
});

test('native circular map includes precisely seven existing sites without moving their coordinates', async () => {
  const area = preparation.dossier.area;
  const map = JSON.parse(await readFile(new URL('../../Karten/Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/data.json', import.meta.url), 'utf8'));
  assert.equal(area.width, 8192); assert.equal(area.height, 6300); assert.equal(area.radius, 1024);
  assert.deepEqual(area.center, { x: 6028, y: 2784 });
  assert.deepEqual(area.locations.map(row => row.pinId).sort(), ['074','086','091','092','107','115','118'].map(id => `gwynthor-marking-${id}`));
  for (const place of area.locations) {
    const pin = map.state.pins.find(row => row.id === place.pinId);
    assert.equal(place.x, pin.x); assert.equal(place.y, pin.y);
    assert.ok(Math.hypot(place.x * area.width - area.center.x, place.y * area.height - area.center.y) + 42 < area.radius);
  }
  assert.equal(normalizeQuestArea({ ...area, radius: 9000 }), null);
  assert.equal(normalizeQuestArea({ ...area, center: { x: NaN, y: 10 } }), null);
});

test('dossier and card render symbolic avatar, named family sources and circular geography without invented encounters', async () => {
  const quest = normalizeQuest({ id: 'fleischsammler-public', title: preparation.title, dossier: preparation.dossier, summary: preparation.summary });
  assert.deepEqual(quest.dossier, preparation.dossier);
  const markup = renderQuestDetail(quest, { catalog });
  assert.match(markup, /Kontaktpersonen/);
  assert.match(markup, /Örtliche Informationsquellen/);
  assert.match(markup, /clipPath/);
  assert.doesNotMatch(markup, /Was Euch begegnen könnte|Am Wegesrand|Den Reiseweg aufschlagen/);
  assert.match(markup, /Drei Goldmünzen/);
  assert.match(questCard(quest, { catalog }), /quest-card-avatar/);
  for (const image of [quest.dossier.coverImage, quest.dossier.area.image, ...quest.dossier.participants.map(row => row.image), ...quest.dossier.informationSources.map(row => row.image)]) {
    assert.ok((await stat(new URL(`../..${image}`, import.meta.url))).size > 1000, image);
  }
});
