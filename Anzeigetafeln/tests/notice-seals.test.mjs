import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { NOTICE_SEALS, defaultSealFor, normalizeSealPreset, selectSealPreset } from '../assets/js/seals/notice-seals-model.mjs';

function app() {
  const context = vm.createContext({
    window: {
      TafelNoticeSeals: { selection: notice => {
        const seal = defaultSealFor(notice);
        return seal ? { ...seal, fit: 'contain', position: 'center' } : null;
      } },
      TafelRuntime: { esc: value => String(value ?? '').replaceAll('"', '&quot;') },
    },
    document: { baseURI: 'https://aleria.test/Anzeigetafeln/tafel.html' }, URL, URLSearchParams,
  });
  vm.runInContext(readFileSync(new URL('../assets/js/media/notice-media-model.js', import.meta.url), 'utf8'), context);
  return context.window.TafelNoticeMediaModel;
}

test('four distinct generated seal assets exist and have recorded original alpha', () => {
  const manifest = JSON.parse(readFileSync(new URL('../assets/images/seals/defaults/generation.json', import.meta.url)));
  assert.equal(NOTICE_SEALS.length, 4);
  assert.equal(new Set(NOTICE_SEALS.map(seal => seal.src)).size, 4);
  for (const seal of NOTICE_SEALS) assert.ok(existsSync(new URL(`../${seal.src}`, import.meta.url)));
  assert.equal(manifest.assets.length, 4);
  assert.equal(manifest.alphaEdited, false);
  for (const image of manifest.assets) {
    assert.equal(image.alphaPreserved, true);
  }
});

test('automatic seal follows the occasion without claiming authority for an ordinary guild notice', () => {
  assert.equal(defaultSealFor({ typ: 'hilfsgesuch' }).id, 'baeurlich');
  for (const typ of ['quest', 'gilde', 'notiz', 'handel']) assert.equal(defaultSealFor({ typ }).id, 'buergerlich');
  for (const typ of ['erlass', 'steckbrief']) assert.equal(defaultSealFor({ typ }), null);
  assert.equal(defaultSealFor({ typ: 'gilde', text: 'Wolken der Dämmerung', verfasserName: 'Federkiel' }).id, 'buergerlich');
  assert.equal(defaultSealFor({ writerGuildId: 'federkiel' }).id, 'federkiel');
  assert.equal(defaultSealFor({ issuerGuildId: 'federkiel', typ: 'erlass' }).id, 'federkiel');
  assert.equal(defaultSealFor({ issuerGuildId: 'wolken-der-daemmerung', writerGuildId: 'federkiel' }).id, 'wolken-der-daemmerung');
});

test('explicit selection overrides the fallback; none and invalid values are bounded', () => {
  for (const seal of NOTICE_SEALS) assert.equal(defaultSealFor({ typ: 'erlass', sealPreset: seal.id }).id, seal.id);
  assert.equal(defaultSealFor({ sealPreset: 'none', issuerGuildId: 'federkiel' }), null);
  assert.equal(normalizeSealPreset('javascript:alert(1)'), 'auto');
  const notice = { id: 'saved', siegel: 'own.png' };
  assert.equal(selectSealPreset(notice, 'not-a-preset'), false);
  assert.equal(notice.siegel, 'own.png');
});

test('choosing a standard only replaces the seal and its own metadata', () => {
  const portrait = { kind: 'character', familyId: 'house', personId: 'person' };
  const oldMedia = { portrait, siegel: { src: 'old.png', fit: 'cover' } };
  const notice = { siegel: 'old.png', media: oldMedia, comments: [{ id: 'existing' }], rewards: [{ kind: 'money', amount: 5 }] };
  const otherData = JSON.stringify({ comments: notice.comments, rewards: notice.rewards });
  assert.equal(selectSealPreset(notice, 'federkiel'), true);
  assert.equal(notice.siegel, '');
  assert.equal(notice.media.siegel, undefined);
  assert.equal(notice.media.portrait, portrait);
  assert.equal(oldMedia.siegel.src, 'old.png', 'do not mutate shared media references');
  assert.equal(JSON.stringify({ comments: notice.comments, rewards: notice.rewards }), otherData);
  assert.equal(selectSealPreset(notice, 'federkiel'), false, 'duplicate input/change events are harmless');
});

test('existing Herluin and marshal seals always win and rendering never rewrites authored data', () => {
  const pack = JSON.parse(readFileSync(new URL('../Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor/authored-notices.json', import.meta.url)));
  const media = app();
  const notices = pack.notices || pack.zettel;
  const custom = notices.filter(notice => notice.siegel);
  assert.ok(custom.some(notice => notice.siegel.includes('herluin')));
  assert.ok(custom.some(notice => notice.siegel.includes('egon-gafyr')));
  for (const notice of custom) {
    const before = JSON.stringify(notice);
    assert.equal(media.selection({ ...notice, sealPreset: 'baeurlich' }, 'siegel').src, notice.siegel);
    assert.ok(media.render(notice, 'siegel').includes(notice.siegel));
    assert.equal(JSON.stringify(notice), before);
  }
  const notice = { id: 'old', typ: 'hilfsgesuch', siegel: '', comments: [] };
  const before = JSON.stringify(notice);
  assert.match(media.render(notice, 'siegel'), /baeurlich-v1.png/);
  assert.equal(JSON.stringify(notice), before);
});

test('clearing a seal stays empty after export/reload while a new custom image still wins', () => {
  const media = app();
  const notice = { typ: 'quest', siegel: 'own.png' };
  media.apply(notice, 'siegel', null);
  const saved = JSON.parse(JSON.stringify(notice));
  assert.equal(saved.sealPreset, 'none');
  assert.equal(media.selection(saved, 'siegel').suppressed, true);
  assert.doesNotMatch(media.render(saved, 'siegel'), /<img|notice-media-placeholder/);
  media.apply(saved, 'siegel', { kind: 'icon', src: 'replacement.png' });
  assert.equal(media.selection(saved, 'siegel').src, 'replacement.png');
  assert.equal(selectSealPreset(saved, 'auto'), true);
  assert.match(media.selection(saved, 'siegel').src, /buergerlich/);
});
