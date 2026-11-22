import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { FEDERKIEL_BANNKREIS_COURIERS, federkielCourierAvatar } from '../modules/federkiel-gwynthor/federkiel-couriers.mjs';
import { federkielModuleId } from '../modules/federkiel-gwynthor/federkiel-section.mjs';
import { openVenueBrowserPreview } from './support/venue-browser-preview.mjs';

const people = FEDERKIEL_BANNKREIS_COURIERS;
const stationId = federkielModuleId('kurierstation');
const preview = await openVenueBrowserPreview('federkiel-couriers-20261122', { localOnly: true });
const { page } = preview;
const profile = page.locator('#char-profile-overlay');
const modal = page.locator('#modal-overlay');
const form = page.locator('#comment-form-overlay');
const checked = [];

async function dismissOfflineNotice() {
  const notice = page.locator('#app-status-toast').filter({ hasText: /vorübergehend offline|Online-Verbindung fehlt/ });
  if (await notice.isVisible()) await notice.locator('[data-action="dismiss-app-status"]').evaluate(button => button.click());
}

async function checkProfile(person, width) {
  await page.evaluate(id => openCharProfile(id), person.id);
  await profile.waitFor({ state: 'visible' });
  assert.equal(await profile.locator('#cp-name').inputValue(), person.name);
  assert.equal(await profile.locator('#cp-bio').inputValue(), person.bio);
  await preview.decodeImages('#cp-portrait-img, #cp-portrait-thumb-img');
  await profile.locator('[data-char-profile-tab="biography"]').click();
  const biography = profile.locator('.cp-biography-view-render');
  assert.match(await biography.innerText(), /Bannkreis Gwynthor/);
  const venueLink = biography.getByRole('link', { name: 'Die Kurierstation (Gestüt)' });
  assert.match(await venueLink.getAttribute('href'), /entry=gwynthor-federkiel-kurierstation$/);
  await preview.decodeImages('.cp-biography-view-render img[src*="/federkiel-gwynthor/couriers/"]');
  await dismissOfflineNotice();
  await preview.capture(`${width}-${person.slug}-biografie`);

  await profile.locator('[data-char-profile-tab="bilder"]').click();
  const images = profile.locator('#cp-emote-grid img[data-emote-src]');
  assert.equal(await images.count(), 9);
  for (const [index, image] of (await images.all()).entries()) {
    assert.equal(await image.getAttribute('data-emote-src'), federkielCourierAvatar(person.slug, index + 1));
    await image.scrollIntoViewIfNeeded();
    await page.waitForFunction(number => document.querySelector(`#cp-emote-grid img[alt="Emote ${number}"]`)?.getAttribute('src'), index + 1);
    const dimensions = await image.evaluate(async element => {
      await element.decode();
      return [element.naturalWidth, element.naturalHeight];
    });
    assert.equal(dimensions[0], dimensions[1]);
    assert.ok(dimensions[0] >= 410);
  }
  await images.first().scrollIntoViewIfNeeded();
  await dismissOfflineNotice();
  await preview.capture(`${width}-${person.slug}-avatare`);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2));
  await page.evaluate(() => closeCharProfile());
  await profile.waitFor({ state: 'hidden' });
  checked.push({ width, id: person.id, avatarPreviews: 9 });
}

try {
  const registered = await page.evaluate(async ids => {
    const local = getLocalCommentBackend();
    window._fb = {
      loadComments: local.loadComments, loadCommentTurn: local.loadCommentTurn, loadRecentComments: local.loadRecentComments,
      loadCharacters: async () => [], loadCreatures: async () => []
    };
    _fbReady = true;
    await loadCharacters();
    return ids.map(id => [getCharacterById(id)?.name, getCharacterAssignedTab(id)]);
  }, people.map(person => person.id));
  assert.deepEqual(registered, people.map(person => [person.name, 'Gwynthor']));
  for (const [width, height] of [[1440, 1000], [390, 900], [320, 800]]) {
    await page.setViewportSize({ width, height });
    for (const person of people) await checkProfile(person, width);
    await page.evaluate(id => openModal(findCurrentSectionByEntryId(id).entry), stationId);
    const courierRows = modal.locator('.hierarchy-tree-panel.active [data-hierarchy-columns="4"]');
    assert.equal(await courierRows.count(), 3);
    const staffed = courierRows.nth(1);
    assert.deepEqual(await staffed.locator('.hierarchy-node-subtitle').allTextContents(), people.map(person => person.name));
    await staffed.locator('.hierarchy-node-card').first().scrollIntoViewIfNeeded();
    await preview.decodeImages('#modal-overlay img[src*="/federkiel-gwynthor/couriers/"]');
    await dismissOfflineNotice();
    await preview.capture(`${width}-bannkreisstaffel`);
    await page.evaluate(() => closeModal());
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(id => openModal(findCurrentSectionByEntryId(id).entry, { pageIndex: 1 }), stationId);
  assert.deepEqual(await page.evaluate(() => getCurrentCommentCastIds()), people.map(person => person.id));
  await modal.locator('[data-action="open-comment-form"]').click();
  await form.waitFor({ state: 'visible' });
  for (const person of people) {
    const option = form.locator(`.cf-char-option[data-id="${person.id}"]`);
    assert.equal(await option.locator('.cf-char-option-name').innerText(), person.name);
    await option.click();
    assert.equal(await form.locator('#cf-selected-name').textContent(), `Als ${person.name} kommentieren`);
  }
  await dismissOfflineNotice();
  await preview.capture('1440-figurenwahl-kurierstation');
  await form.locator('[data-action="close-comment-form"]').click();
  await form.waitFor({ state: 'hidden' });
  assert.deepEqual(preview.errors, []);
  const report = { profiles: checked, cast: people.map(person => person.name), localReadsOnly: true, errors: preview.errors };
  await writeFile(resolve(preview.output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ output: preview.output, profileViews: checked.length, decodedAvatars: checked.length * 9 }));
} finally { await preview.close(); }
