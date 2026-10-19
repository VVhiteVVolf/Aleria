import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { openVenueBrowserPreview } from './support/venue-browser-preview.mjs';
import { readEconomyVenues, readEconomyCalendar } from '../modules/economy-calculator/economy-source-venues.mjs';
import { buildEconomyExamples } from '../modules/economy-calculator/economy-examples.mjs';
import { calculateBusiness } from '../modules/economy-calculator/economy-engine.mjs';
import { money } from '../modules/economy-calculator/economy-format.mjs';
const venues = await readEconomyVenues(), calendar = await readEconomyCalendar(), examples = buildEconomyExamples(venues, calendar);
const preview = await openVenueBrowserPreview('economy-calculator'), { page } = preview;
try {
  // The Kanne is an existing online custom module. Exercise that exact import
  // boundary in this account-free preview; all external writes remain blocked.
  await page.evaluate(entry => {
    const payload = readLocalModuleStorePayload();
    applyModuleStorePayload({ ...payload, customSections: [...(payload.customSections || []), { key: 'Gwynthor', tab: 'Völker & Kulturen', path: ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'], entries: [entry] }] });
  }, venues[1]);
  const checks = [];
  for (const [layout, viewport] of [['desktop', { width: 1460, height: 1050 }], ['mobile', { width: 390, height: 900 }]]) {
    await page.setViewportSize(viewport);
    for (const [index, venue] of venues.entries()) {
      const entry = await page.evaluate(id => findCurrentSectionByEntryId(id).entry, venue.id);
      assert.equal(entry.pages.at(-1).economyCalculationPage, true);
      assert.equal(entry.pages.length, venue.pages.length + 1);
      assert.equal(await page.evaluate(entry => getPages(entry).length, entry), entry.pages.length);
      assert.deepEqual(entry.pages.slice(0, -1).map(p => p.commentThreadKey), venue.pages.map(p => p.commentThreadKey));
      await preview.openPage(entry, entry.pages.length - 1);
      const root = page.locator('[data-economy-root]');
      await root.locator('[data-economy-output="ledger"] .economy-metric').first().waitFor();
      assert.equal(await page.locator('.modal-page-tab').filter({ hasText: /^Kommentare$/ }).count(), 0);
      assert.equal(await root.locator('[data-economy-output="ledger"] .economy-metric strong').nth(2).innerText(), money(calculateBusiness(examples[index], calendar).totals.freeCash));
      const width = await root.evaluate(root => ({ width: root.clientWidth, scrollWidth: root.scrollWidth }));
      assert.ok(width.scrollWidth <= width.width + 2, `${venue.title}: no page overflow at ${viewport.width}`);
      await preview.capture(`${layout}-${index}-bilanz`);
      await root.locator('[data-economy-tab="payroll"]').click();
      assert.equal(await root.locator('[data-economy-worker]').count(), examples[index].workers.length);
      await preview.capture(`${layout}-${index}-personal`);
      await root.locator('[data-economy-tab="purchasing"]').click();
      assert.match(await root.locator('[data-economy-output="purchasing"]').innerText(), /27,00 KT/);
      assert.match(await root.locator('[data-economy-output="purchasing"]').innerText(), /Gwynthor/);
      const calibrationWidth = await root.evaluate(root => ({ width: root.clientWidth, scrollWidth: root.scrollWidth }));
      assert.ok(calibrationWidth.scrollWidth <= calibrationWidth.width + 2, 'purchasing view does not overflow');
      await preview.capture(`${layout}-${index}-kaufkraft`);
      checks.push({ layout, module: venue.id, people: calculateBusiness(examples[index], calendar).activeCount, pages: entry.pages.length, ...width });
    }
  }
  await page.setViewportSize({ width: 1460, height: 1050 });
  const entry = await page.evaluate(id => findCurrentSectionByEntryId(id).entry, venues[0].id);
  await preview.openPage(entry, entry.pages.length - 1);
  const root = page.locator('[data-economy-root]');
  const total = () => root.locator('[data-economy-output="ledger"] .economy-metric strong').nth(2).innerText();
  const initialCash = await total();
  await root.locator('[data-economy-tab="purchasing"]').click();
  await root.locator('[data-economy-panel="purchasing"] details').first().locator('summary').click();
  await root.locator('[data-economy-reference="housing"]').fill('7.40');
  await root.locator('[data-economy-reference="leisureWeekly"]').click();
  assert.equal(await root.locator('[data-economy-output="purchasing"] .economy-metric strong').nth(1).innerText(), '29,00 KT');
  assert.equal(await total(), initialCash, 'changing the measurement scale never changes employee wages');
  await root.locator('[data-economy-reference="leisureWeekly"]').fill('0');
  await root.locator('[data-economy-reference="housing"]').click();
  assert.equal(await root.locator('[data-economy-output="purchasing"] .economy-metric strong').nth(3).innerText(), 'Nicht bestimmbar');
  await root.locator('[data-economy-action="reset"]').click();
  assert.equal(await root.locator('[data-economy-reference="housing"]').inputValue(), '5.4');
  assert.equal(await root.locator('[data-economy-reference="leisureWeekly"]').inputValue(), '3');
  await root.locator('[data-economy-tab="payroll"]').click();
  await root.locator('[data-economy-pay="person-carys"]').fill(String(calculateBusiness(examples[0], calendar).workers.find(worker => worker.id === 'person-carys').perHeadBaseCash / 100 + 1));
  await root.locator('[data-economy-tab="ledger"]').click();
  assert.equal(await total(), money(calculateBusiness(examples[0], calendar).totals.freeCash - 100));
  await root.locator('[data-economy-action="reset"]').click();
  await root.locator('.economy-controls > summary').click();
  await root.locator('[data-economy-field="churchEnabled"]').check();
  assert.equal(await total(), money(calculateBusiness(examples[0], calendar, { churchEnabled: true }).totals.freeCash));
  await root.locator('[data-economy-field="occupancy"]').fill('20');
  await root.locator('[data-economy-field="openDays"]').click();
  assert.equal(await total(), money(calculateBusiness(examples[0], calendar, { churchEnabled: true, occupancy: 0.2 }).totals.freeCash));
  await root.locator('[data-economy-action="reset"]').click();
  const download = page.waitForEvent('download'); await root.locator('[data-economy-action="export"]').click();
  const downloaded = await download;
  assert.match(downloaded.suggestedFilename(), /^wirtschaft-.*\.json$/);
  const exported = JSON.parse(await readFile(await downloaded.path(), 'utf8'));
  assert.equal(exported.purchasingReference.status, 'unconfirmed-scale');
  assert.equal(exported.purchasingPower.wageWeekly, 2700);
  assert.equal(exported.scenario.contextId, 'gwynthor');
  await root.locator('[data-economy-tab="households"]').click();
  await root.locator('[data-economy-household="profile"]').selectOption('lehensritter');
  assert.match(await root.locator('[data-economy-household-result] h3').innerText(), /Ritter mit kleinem Lehen/);
  await preview.capture('haushalte-ritter');
  const guide = root.locator('[data-economy-service-income]');
  await guide.locator(':scope > summary').click();
  assert.equal(await guide.locator('[data-economy-income-role]').count(), 15);
  assert.match(await guide.locator('[data-economy-income-role="hausritter"]').innerText(), /8\.112,00 KT/);
  const watchGuide = guide.locator('[data-economy-watch-income]');
  await watchGuide.locator('summary').click();
  assert.equal(await watchGuide.locator('[data-economy-watch-group]').count(), 5);
  assert.match(await watchGuide.locator('[data-economy-income-role="garde-ritter"]').innerText(), /780,00 KT/);
  assert.match(await watchGuide.locator('[data-economy-income-role="garde-waffenknecht"]').innerText(), /436,80 KT/);
  for (const [layout, viewport] of [['desktop', { width: 1460, height: 1050 }], ['mobile', { width: 390, height: 900 }]]) {
    await page.setViewportSize(viewport);
    const width = await root.evaluate(root => ({ width: root.clientWidth, scrollWidth: root.scrollWidth }));
    assert.ok(width.scrollWidth <= width.width + 2, `service income guide does not overflow ${layout}`);
    await preview.capture(`${layout}-dienstsold-und-hauszuwendungen`);
  }
  const roundTrip = await page.evaluate(entry => {
    const a = sanitizeModuleEntry(entry), b = sanitizeModuleEntry(JSON.parse(JSON.stringify(a)));
    return { equal: JSON.stringify(a) === JSON.stringify(b), calculators: b.pages.filter(p => p.economyCalculationPage).length, registry: validateModuleTemplateRegistry({ report: false }) };
  }, entry);
  assert.equal(roundTrip.equal, true); assert.equal(roundTrip.calculators, 1); assert.equal(roundTrip.registry.ok, true);
  assert.deepEqual(preview.errors, []);
  await writeFile(resolve(preview.output, 'report.json'), JSON.stringify({ passed: true, checks, interactiveWages: true, purchasingPower: true, referenceDoesNotChangeWages: true, optionalTithe: true, householdProfiles: 6, serviceIncomeTypes: 15, watchServiceGroups: 5, legacyCommentsRemoved: true, roundTrip, externalWrites: false }, null, 2));
  console.log(JSON.stringify({ passed: true, output: preview.output, checks: checks.length }));
} finally { await preview.close(); }
