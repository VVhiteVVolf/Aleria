import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { existsSync } from 'node:fs';
import { buildZitteraaleWantedNotices, ZITTERAALE_NOTICE_ID } from '../tools/quests/zitteraale-wanted.mjs';
import { rewardsOf, rewardText } from '../assets/js/rewards/notice-rewards-model.mjs';
const notices=buildZitteraaleWantedNotices();
test('all wanted sheets carry Egon’s local quest-giver portrait, signature and marshal seal', () => {
  assert.equal(notices[0].portrait, '', 'the quest giver is not repeated as a wanted subject');
  for (const notice of notices) {
    assert.equal(notice.media.verfasser.familyId, 'haus-gafyr');
    assert.equal(notice.media.verfasser.personId, 'egon-gafyr');
    for (const field of ['verfasser', 'unterschrift', 'siegel', 'emblem']) {
      assert.equal(notice.media[field].src, notice[field]);
      assert.doesNotMatch(notice[field], /^https?:/);
      assert.ok(existsSync(new URL(decodeURI(notice[field]), new URL('../tafel.html', import.meta.url))), field);
    }
  }
});
test('Egon issues one seven-sheet wanted notice with sketches and authoritative rewards', () => {
  assert.equal(notices.length,7);
  assert.equal(notices[0].typ,'quest');
  assert.match(notices[0].verfasserName,/Egon Gafyr/);
  assert.equal(notices.at(-1).rewards[0].amount,1);
  assert.equal(notices.at(-1).rewards[0].currency,'silver');
  for (const n of notices) { assert.equal(n.noticeGroupId,ZITTERAALE_NOTICE_ID);assert.equal(n.stackId,ZITTERAALE_NOTICE_ID); }
  for (const n of notices.slice(1)) assert.match(n.portrait,/\/sketches\//);
  assert.deepEqual(notices.slice(1,6).map(n=>n.rewards[0].amount),[35,13,11,5,3.4]);
  assert.equal(notices[0].x*4096,2340);assert.equal(notices[0].y*3072,1710);
  assert.doesNotMatch(JSON.stringify(notices),/versunkene Stadt|35\.000 Taler|Garik|Brann/);
});
test('honor rewards survive normalization and are promises, without item quantities', () => {
  const rewards=rewardsOf(notices[0]);
  assert.equal(rewards.length,2);assert.equal(rewards[1].kind,'honor');
  assert.equal(rewardText(rewards[1]),'Ein Ritterschlag');
  assert.equal(rewards[1].quantity,undefined);
  assert.match(rewards[1].image,/Ritter\.png/);
  assert.match(rewards[1].condition,/Verleihung/);
  const window={};vm.runInNewContext(readFileSync(new URL('../assets/js/notes/notice-stacks.js',import.meta.url),'utf8'),{window});
  assert.equal(window.TafelNoticeStacks.groups(notices).length,1);
  assert.equal(window.TafelNoticeStacks.publications(notices).length,1);
  assert.equal(rewardsOf({rewards:[{kind:'honor',id:'bad',title:''}]}).length,0);
});
