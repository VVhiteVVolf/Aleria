import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { withVassals } from '../modules/administration/administration-model.mjs';
import vassals, { territorialContacts } from '../modules/administration/data/celtigerns-vassals.generated.mjs';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE } : {}),
});
const screenshotDir = process.env.ADMINISTRATION_SCREENSHOTS;
if (screenshotDir) await mkdir(screenshotDir, { recursive: true });
const origin = process.env.ADMINISTRATION_TEST_ORIGIN || 'http://127.0.0.1:5500';
const base = '/Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht/';
const areas = ['unterhaltung', 'militaer', 'klerus', 'gerichtsbarkeit', 'finanzen', 'spionage', 'diplomatie', 'magie'];

async function waitForArea(page, area) {
  const dialog = page.locator('.administration-dialog[open]');
  await dialog.waitFor();
  await page.waitForFunction(id => {
    const body = document.querySelector('.administration-dialog-body');
    const active = document.querySelector('.administration-area-tabs [aria-current="page"]');
    return body && !body.hasAttribute('aria-busy') && active?.dataset.administrationKey === id;
  }, area);
  assert.equal(await dialog.locator('.is-error').count(), 0, `${area}: content loaded`);
  return dialog;
}

async function expectedCounty(areaId) {
  const { default: source } = await import(`../modules/administration/data/celtigerns-${areaId}.mjs`);
  const prepared = withVassals(source, vassals);
  const roles = prepared.groups.flatMap(group => group.roles);
  // Contacts are presented separately from the six eight-office councils.
  // If the shared model already includes them, count each contact only once.
  const extraContacts = territorialContacts.filter(contact => !roles.some(role => role.name === contact.name));
  return {
    count: roles.length + extraContacts.length,
    names: [...roles, ...extraContacts].map(role => role.name).filter(Boolean),
  };
}

async function expectedLegacy(page, area) {
  return page.evaluate(async id => {
    const source = await (await fetch(`/Kontinente/modules/administration/content/gwendolyns-ufer/${id}.html`)).text();
    const parsed = new DOMParser().parseFromString(source, 'text/html');
    const textFor = node => {
      const copy = node.cloneNode(true);
      copy.querySelectorAll('br').forEach(node => node.replaceWith(' '));
      copy.querySelectorAll('p, div').forEach(node => node.append(' '));
      return copy.textContent.replace(/\s+/g, ' ').trim();
    };
    const rows = [...parsed.querySelectorAll('tr')].filter(row => [...row.cells].some(cell =>
      [...cell.querySelectorAll('img')].some(image => image.closest('tr') === row),
    ));
    return {
      count: rows.reduce((sum, row) => sum + [...row.cells].filter(cell => cell.querySelector('img')).length, 0),
      names: rows.flatMap(row => [...row.nextElementSibling?.cells || []].map(textFor))
        .filter(name => name && !/^[.?!…–—\s-]+$/.test(name)),
    };
  }, area);
}

async function decodeImages(locator) {
  return locator.evaluateAll(async images => {
    await Promise.all(images.map(async image => {
      image.loading = 'eager';
      try { await image.decode(); }
      catch {
        // Image errors replace external originals with a local silhouette.
        try { await image.decode(); } catch { /* Report any failed fallback below. */ }
      }
    }));
    return images.filter(image => !image.naturalWidth).map(image => image.src);
  });
}

async function checkDialogBounds(dialog, bodySelector, label, viewportWidth) {
  const bounds = await dialog.evaluate((node, selector) => {
    const body = node.querySelector(selector);
    const rect = node.getBoundingClientRect();
    return {
      outer: node.scrollHeight - node.clientHeight,
      bodyX: body.scrollWidth - body.clientWidth,
      width: rect.width,
      left: rect.left,
      right: rect.right,
    };
  }, bodySelector);
  assert.ok(bounds.outer <= 1, `${label}: only the body scrolls: ${JSON.stringify(bounds)}`);
  assert.ok(bounds.bodyX <= 1, `${label}: no horizontal content overflow: ${JSON.stringify(bounds)}`);
  assert.ok(bounds.width <= viewportWidth && bounds.left >= -1 && bounds.right <= viewportWidth + 1, `${label}: dialog fits viewport`);
}

async function checkOfficeDetail(page, dialog, label, width) {
  const trigger = dialog.locator('.administration-role-card .administration-role-open').first();
  const title = await trigger.locator('.administration-role-title').innerText();
  await trigger.click();
  const detail = page.locator('.administration-office-dialog[open]');
  await detail.waitFor();
  assert.equal(await detail.locator('#administration-office-title').innerText(), title, `${label}: role detail opens`);
  assert.equal(await detail.locator('.administration-predecessor').count(), 1, `${label}: predecessor reference retained`);
  const layout = await detail.evaluate(node => {
    const person = node.querySelector('.administration-office-person').getBoundingClientRect();
    const portrait = node.querySelector('.administration-office-identity .administration-portrait-frame').getBoundingClientRect();
    const facts = node.querySelector('.administration-office-facts').getBoundingClientRect();
    const text = node.querySelector('.administration-office-content').getBoundingClientRect();
    return { leftHeight: person.height, rightHeight: text.height, factsBelow: facts.top >= portrait.bottom, tasks: node.querySelectorAll('.administration-office-duties li').length };
  });
  assert.ok(layout.factsBelow, `${label}: facts stay below the portrait`);
  if (width > 650) assert.ok(layout.rightHeight <= layout.leftHeight + 1, `${label}: prose cannot grow beyond the person column`);
  assert.ok(layout.tasks >= 3 && layout.tasks <= 5, `${label}: three to five illustrated core tasks`);
  assert.ok(await dialog.evaluate(node => node.open), `${label}: main structure stays open behind detail`);
  await checkDialogBounds(detail, '.administration-office-body', `${label}/detail`, width);
  await page.keyboard.press('Escape');
  await detail.waitFor({ state: 'hidden' });
  assert.ok(await trigger.evaluate(button => document.activeElement === button), `${label}: Escape returns focus to the role card`);
  assert.ok(await dialog.evaluate(node => node.open), `${label}: Escape closes only the detail`);
}

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  for (const [scope, path] of [
    ['county', 'Grafschaft Celtigerns Wacht.html'],
    ['gwendolyn', 'Baronie Gwendolyns Ufer/Baronie Gwendolyns Ufer.html'],
  ]) {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(origin + base + path, { waitUntil: 'domcontentloaded' });
    const row = page.locator('.administration-grid, .herrschaft-administration-grid');
    await row.locator('button').last().waitFor();
    if (scope === 'county') {
      await page.locator('[data-repository-content="ready"]').waitFor();
      // The page's political council still uses the shared council component.
      const princes = page.locator('.herrschaft-person-group').filter({ has: page.getByRole('heading', { name: 'Ritterfürsten', exact: true }) });
      await princes.waitFor();
      const cards = await princes.locator('.herrschaft-person-card').evaluateAll(cards => cards.map(card => ({
        name: card.querySelector('h4').textContent,
        seat: card.querySelector('.herrschaft-person-seat')?.textContent,
      })));
      assert.equal(cards[0].name, 'Vakant');
      assert.equal(cards.find(card => card.name === 'Maelgwin Wyrm').seat, 'Sitz: Gwynthor');
      assert.equal(cards.find(card => card.name === 'Idris Arwydd').seat, 'Sitz: Castellbryn');
      if (screenshotDir) await princes.screenshot({ path: resolve(screenshotDir, 'celtigerns-wacht-ritterfuersten.png') });
    }

    for (const area of areas) {
      await page.setViewportSize({ width: 1440, height: 1000 });
      const trigger = row.locator(`[data-administration-key="${area}"]`);
      await trigger.click();
      const dialog = await waitForArea(page, area);
      const expected = scope === 'county' ? await expectedCounty(area) : await expectedLegacy(page, area);
      const displayed = await dialog.locator('.administration-role-card .administration-role-name').allTextContents();
      assert.equal(displayed.length, expected.count, `${scope}/${area}: all office cards retained`);
      assert.deepEqual(expected.names.filter(name => !displayed.includes(name)), [], `${scope}/${area}: all named holders retained`);

      const maximize = dialog.locator('[data-action="maximize-administration"]');
      const normalWidth = await dialog.evaluate(node => node.getBoundingClientRect().width);
      await maximize.click();
      assert.equal(await maximize.getAttribute('aria-pressed'), 'true', `${scope}/${area}: maximize state`);
      assert.ok(await dialog.evaluate(node => node.classList.contains('is-maximized')));
      assert.ok(await dialog.evaluate(node => node.getBoundingClientRect().width) >= normalWidth);
      await maximize.click();
      assert.equal(await maximize.getAttribute('aria-pressed'), 'false', `${scope}/${area}: restore state`);

      if (scope === 'county' && area === 'militaer') {
        const adjutants = dialog.locator('[data-group-kind="adjutant"]');
        assert.deepEqual(await adjutants.locator('.administration-role-name').allTextContents(), ['Rhys Draig', 'Anaraut Draig', 'Niniane Chwedlonol']);
        const commanders = dialog.locator('[data-group-id="militaer-kommandanten"]');
        assert.deepEqual(await commanders.locator('.administration-role-name').allTextContents(), ['Ferydnand Gafyr']);
        assert.equal(await commanders.locator('.administration-role-title').innerText(), 'Kommandant der Cochllamwyr und von Gwynthor');
        const idwal = dialog.locator('[data-role-id="idwal-draig"]');
        assert.equal(await idwal.locator('a.administration-crew-link').getAttribute('href'), '/AleriaAlmanach/AleriaAlmanach.html?entry=idwals-schiffsmannschaft');
        assert.equal(await idwal.locator('.administration-crew-flag').getAttribute('src'), '/Kontinente/modules/administration/assets/tiefenwyrm-mannschaft.png');
        const preparedCrew = dialog.locator('[data-role-id="huw-saethwyr"] button.administration-crew-link');
        assert.match(await preparedCrew.locator('img').getAttribute('src'), /crew-flag-placeholder\.svg$/);
        await preparedCrew.click();
        const crewDetail = page.locator('.administration-office-dialog[open]');
        await crewDetail.locator('.administration-office-crew').waitFor();
        assert.ok((await crewDetail.locator('.administration-office-crew').innerText()).includes('Schiffsmannschaft'));
        assert.equal(await crewDetail.locator('.administration-office-crew a').count(), 0, 'Prepared crews do not link to nonexistent modules');
        await page.keyboard.press('Escape');
        await crewDetail.waitFor({ state: 'hidden' });
        assert.ok(await preparedCrew.evaluate(button => document.activeElement === button), 'Crew detail restores its flag trigger');
      }

      for (const width of [1440, 768, 390]) {
        await page.setViewportSize({ width, height: 1000 });
        const label = `${scope}/${area}/${width}`;
        await checkDialogBounds(dialog, '.administration-dialog-body', label, width);
        await checkOfficeDetail(page, dialog, label, width);
        if (screenshotDir && scope === 'county' && ['unterhaltung', 'militaer'].includes(area) && width !== 768) {
          await decodeImages(dialog.locator('img'));
          await dialog.screenshot({ path: resolve(screenshotDir, `administration-dialog-${area}-${width}.png`) });
        }
      }
      // Legacy accordions and source references remain available as well.
      await dialog.locator('details').evaluateAll(details => details.forEach(detail => { detail.open = true; }));
      assert.deepEqual(await decodeImages(dialog.locator('img')), [], `${scope}/${area}: local images and fallbacks load`);
      assert.equal(await dialog.locator('summary').evaluateAll(nodes => nodes.filter(node => /^[▶►▸]/.test(node.textContent.trim())).length), 0, 'No duplicate disclosure arrows');
      console.log(scope, area, { cards: displayed.length });
      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'hidden' });
      assert.ok(await trigger.evaluate(button => document.activeElement === button), `${scope}/${area}: focus returns to original page trigger`);
    }

    // Tab changes stay within the current lordship. Closing after navigation
    // must restore the original page card, rather than a now-hidden dialog tab.
    const originalTrigger = row.locator('[data-administration-key="diplomatie"]');
    await originalTrigger.click();
    let dialog = await waitForArea(page, 'diplomatie');
    await dialog.locator('.administration-area-tabs [data-administration-key="magie"]').click();
    dialog = await waitForArea(page, 'magie');
    assert.ok((await dialog.locator('.administration-dialog-body').innerText()).includes(scope === 'county' ? 'Myrddin Draig' : 'Ceridwen Lhuyd'));
    assert.ok(await dialog.locator('#administration-dialog-title').evaluate(title => document.activeElement === title), 'Area navigation sets a visible keyboard focus target');
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden' });
    assert.ok(await originalTrigger.evaluate(button => document.activeElement === button), `${scope}: tab navigation preserves original page trigger`);
  }

  // An unrecognised future source layout must preserve its table and content.
  assert.ok(await page.evaluate(async () => {
    const { renderLegacyContent } = await import('/Kontinente/modules/administration/administration-renderer.mjs?v=20261028');
    const rendered = renderLegacyContent('<div><table><tr><td>Unbekannte Tabellenform</td></tr><tr><td><img src="/Stammbäume/assets/images/placeholders/male.png" style="width:100px;height:150px"><img src="/Stammbäume/assets/images/placeholders/male.png" style="width:100px;height:150px"></td></tr><tr><td>Erhaltener Name</td></tr></table></div>', { id: 'militaer', title: 'Militär' });
    return rendered.querySelector('table') && rendered.querySelectorAll('img').length === 2 && rendered.textContent.includes('Erhaltener Name');
  }));
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
