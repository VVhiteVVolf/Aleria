import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { openVenueBrowserPreview } from './support/venue-browser-preview.mjs';
import { buildLandfamilienRegistrations } from '../modules/gwynthor-landfamilien/landfamilien-module.mjs';
import { LAND_FAMILIEN_ROSTER } from '../../Stammbäume/assets/js/data/gwynthor-fleischsammler/landfamilien-roster.mjs';

const registrations = buildLandfamilienRegistrations();
const visualReviewOnly = process.env.LANDFAMILIEN_BROWSER_REVIEW_ONLY === 'visual';
const preview = await openVenueBrowserPreview('gwynthor-landfamilien');
const { page } = preview, checks = [], actorChecks = [], geometryChecks = [], shots = [];
const output = resolve(process.env.LANDFAMILIEN_BROWSER_OUTPUT || preview.output);
await mkdir(output, { recursive: true });
const capture = async name => {
  const path = resolve(output, `${name}.png`);
  await page.screenshot({ path }); shots.push(path);
};
try {
  const publicActionIconUrls = new Set(await page.evaluate(() => Object.values(COMMENT_ACTION_ICONS).filter(value => /^https:\/\//.test(value))));
  await page.context().route('**/*', route => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin === preview.origin && request.method() === 'GET') return route.continue();
    if (request.method() === 'GET' && url.origin === 'https://www.gstatic.com' && url.pathname.startsWith('/firebasejs/')) return route.fallback();
    if (request.method() === 'GET' && request.resourceType() === 'image' && publicActionIconUrls.has(request.url())) return route.fallback();
    return route.abort();
  });
  // Keep the real snapshot repository and real character loader. Only the
  // existing local comment backend replaces an online transport in this fresh
  // browser context; no invented fixture figures enter the picker.
  await page.evaluate(() => {
    window.__landfamilienWrites = 0;
    window._fb = { ...getLocalCommentBackend(), _localFallback: false,
      loadCreatures: async () => [],
      addComment: async () => { window.__landfamilienWrites += 1; throw new Error('Schreibzugriff in dieser Browserprüfung gesperrt.'); } };
    _fbReady = true;
  });
  const placement = await page.evaluate(ids => getValidSections().flatMap(section => section.entries
    .filter(entry => ids.includes(entry.id)).map(entry => ({ id: entry.id, path: section.path }))), registrations.map(item => item.entry.id));
  assert.equal(placement.length, 3);
  for (const registration of registrations) assert.deepEqual(placement.find(item => item.id === registration.entry.id).path, registration.path);

  for (const [layout, viewport] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 390, height: 844 }]]) {
    await page.setViewportSize(viewport);
    for (const [familyIndex, registration] of registrations.entries()) {
      const { entry } = registration, household = LAND_FAMILIEN_ROSTER.families[familyIndex];
      const roundtrip = await page.evaluate(entry => {
        const first = sanitizeModuleEntry(JSON.parse(JSON.stringify(entry)));
        const second = sanitizeModuleEntry(JSON.parse(JSON.stringify(first)));
        return { first, second };
      }, entry);
      assert.deepEqual(roundtrip.second, roundtrip.first);
      assert.equal(roundtrip.first.pages.length, 6);
      assert.equal(roundtrip.first.pages.filter(model => model.sessionPage).length, 2);
      assert.equal(roundtrip.first.pages[3].familyTree.familyId, household.familyId);
      assert.deepEqual(roundtrip.first.pages.filter(model => model.sessionPage).map(model => model.commentThreadKey),
        entry.pages.filter(model => model.sessionPage).map(model => model.commentThreadKey));
      for (const [index, model] of entry.pages.entries()) {
        if (visualReviewOnly && ![0, 4, 5].includes(index)) continue;
        await preview.openPage(entry, index);
        await preview.decodeImages('#modal-overlay img[src*="gwynthor-landfamilien"], #modal-overlay img[src*="fleischsammler"]');
        if (index === 0) assert.equal((await page.locator('#modal-overlay .modal-img-stamp').innerText()).toLocaleUpperCase('de'), entry.title.toLocaleUpperCase('de'));
        if (model.hierarchyPage) {
          for (const [treeIndex, tree] of model.hierarchy.trees.entries()) {
            await page.locator('#modal-overlay [data-hierarchy-tree-tab]').nth(treeIndex).click();
            assert.equal(await page.locator('#modal-overlay [data-hierarchy-tree-panel].active .hierarchy-node-card').count(),
              tree.levels.flatMap(level => level.nodes).length);
            await preview.decodeImages('#modal-overlay [data-hierarchy-tree-panel].active img');
            await capture(`${layout}-${household.slug}-hierarchie-${tree.id}`);
          }
        }
        if (model.biographyPage) {
          assert.equal(await page.locator('#modal-overlay .biography-connection').count(), 3);
          await preview.decodeImages('#modal-overlay .biography-connection img');
          const copy = await page.locator('#modal-overlay .biography-main').innerText();
          for (const person of household.persons) assert.ok(copy.includes(person.name), person.name);
        }
        if (model.familyTreePage) {
          const frame = page.frameLocator('.family-tree-embed-frame');
          await frame.locator('.aleria-person-card').first().waitFor({ timeout: 30000 });
          await frame.locator('img.aleria-person-card__portrait').evaluateAll(images => Promise.all(images.map(image => image.decode())));
          const embeddedText = await frame.locator('#family-chart').innerText();
          for (const person of household.persons) assert.ok(embeddedText.includes(person.name), `${household.slug}: ${person.name}`);
          const embedded = page.frames().find(frame => frame.url().includes(`family=${household.familyId}&`));
          await embedded.waitForFunction(() => ![...document.querySelectorAll('#family-chart *')].some(node => node.__transition));
          const geometry = await embedded.evaluate(async () => {
            const { auditRenderedFamilyChart } = await import('./assets/js/modules/chart-quality/chart-geometry-audit.js');
            return auditRenderedFamilyChart(document.getElementById('family-chart'));
          });
          assert.deepEqual(geometry.issues, [], `${layout}: ${household.familyId}`);
          geometryChecks.push({ layout, familyId: household.familyId, ...geometry });
          if (household.slug !== 'marchwern') {
            const relationship = await embedded.evaluate(async familyId => {
              const { loadFamilyById } = await import('./assets/js/services/family-library.js');
              const { normalizeFamily } = await import('./assets/js/domain/family-schema.js');
              const normalized = normalizeFamily(loadFamilyById(familyId).family);
              return normalized.partnerships.find(partnership => partnership.participantIds.includes('ceridwen-tirfelyn')
                && partnership.participantIds.includes('gorwyn-helfaen'));
            }, household.familyId);
            assert.equal(relationship.type, 'engagement');
            assert.equal(relationship.status, 'ended');
          }
        }
        if (model.sessionPage) {
          assert.equal((await page.locator('#modal-overlay .session-art-stamp').innerText()).toLocaleUpperCase('de'), entry.title.toLocaleUpperCase('de'));
          await preview.decodeImages('#modal-overlay .comments-action-icon');
          const before = await page.evaluate(() => getCurrentCommentThreadId());
          assert.ok(before);
          await page.locator('#modal-overlay .session-intro-toggle').click();
          assert.equal(await page.locator('#modal-overlay .session-stage-copy').isVisible(), false);
          assert.equal(await page.evaluate(() => getCurrentCommentThreadId()), before);
          await page.locator('#modal-overlay .session-intro-toggle').click();
          assert.equal(await page.locator('#modal-overlay .session-stage-copy').isVisible(), true);
          if (index === 4 && !visualReviewOnly) {
            await page.locator('#modal-overlay [data-action="open-comment-form"]').click();
            await page.waitForFunction(() => isCommentFormActorsReady() && document.querySelector('#cf-char-picker .cf-char-option'));
            const prioritized = await page.evaluate(count => getAvailableCommentCharacters().slice(0, count).map(character => character.id), entry.sessionCast.length);
            assert.deepEqual(prioritized, entry.sessionCast);
            for (const person of household.persons.filter(person => person.status === 'alive')) {
              const id = entry.sessionCast.find(id => id.endsWith(`--${person.id}`));
              assert.ok(id, person.id);
              await page.locator('#cf-char-search').fill(person.name);
              const option = page.locator(`#cf-char-picker [data-id="${id}"]`);
              await option.click();
              await preview.decodeImages(`#cf-char-picker [data-id="${id}"] img`);
              assert.equal(await page.evaluate(() => _selectedCharId), id);
              assert.ok((await page.locator('#cf-selected-name').innerText()).includes(person.name));
              actorChecks.push({ layout, module: entry.id, id, name: person.name });
            }
            await capture(`${layout}-${household.slug}-avatarwaehler`);
            await page.locator('#comment-form-overlay [data-action="close-comment-form"]').click();
            await page.locator('#comment-form-overlay').waitFor({ state: 'hidden' });
            assert.equal(await page.evaluate(() => getCurrentCommentThreadId()), before);
          }
          checks.push({ layout, module: entry.id, page: index + 1, thread: before });
        } else checks.push({ layout, module: entry.id, page: index + 1 });
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2));
        await capture(`${layout}-${household.slug}-seite-${index + 1}`);
      }
    }
  }
  assert.deepEqual(preview.errors, []);
  assert.equal(await page.evaluate(() => window.__landfamilienWrites), 0);
  assert.equal(actorChecks.length, visualReviewOnly ? 0 : 70);
  const report = { passed: true, mode: visualReviewOnly ? 'main-pages-and-scenes-visual-followup' : 'full',
    checks, actorChecks, geometryChecks, placement, screenshots: shots, sharedActionIconGets: [...publicActionIconUrls],
    fixture: 'Existing local comment backend and actual local character snapshot; no online data writes. Offline sign-in toast belongs to the fixture.',
    externalWrites: false, deployed: false };
  await writeFile(resolve(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ passed: true, checks: checks.length, actorChecks: actorChecks.length,
    geometryChecks: geometryChecks.length, screenshots: shots.length, output }));
} catch (error) {
  await capture('failure').catch(() => {});
  await writeFile(resolve(output, 'report.json'), JSON.stringify({ passed: false, error: error.message,
    checks, actorChecks, geometryChecks, screenshots: shots, externalWrites: false }, null, 2) + '\n');
  throw error;
} finally { await preview.close(); }
