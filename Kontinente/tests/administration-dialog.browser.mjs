import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { withVassals } from '../modules/administration/administration-model.mjs';
import vassals, { territorialContacts } from '../modules/administration/data/celtigerns-vassals.generated.mjs';
import { ROLE_EXAMPLES, ROLE_EXAMPLE_GROUPS } from '../modules/administration/data/role-examples.mjs';
import { officialCouncil } from '../../shared/cenyr-administration/official-office-model.mjs';
import { CENYR_ADMINISTRATION_SCOPES } from '../../shared/cenyr-administration/scopes.mjs';

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
  const { groups } = officialCouncil('grafschaft-celtigerns-wacht', areaId, source);
  const prepared = withVassals({ ...source, groups }, vassals);
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
  page.on('console', message => {
    if (message.type() === 'error' && !message.text().includes('ERR_BLOCKED_BY_CLIENT')) console.log('Browser:', message.text());
  });
  await page.route('**/*', route => {
    const request = route.request();
    return new URL(request.url()).origin === origin && request.method() === 'GET' ? route.continue() : route.abort('blockedbyclient');
  });
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
      if (screenshotDir) {
        await page.waitForLoadState('networkidle');
        await decodeImages(princes.locator('img'));
        await princes.screenshot({ path: resolve(screenshotDir, 'celtigerns-wacht-ritterfuersten.png') });
      }
    }

    for (const area of areas) {
      await page.setViewportSize({ width: 1440, height: 1000 });
      const trigger = row.locator(`[data-administration-key="${area}"]`);
      await trigger.click();
      const dialog = await waitForArea(page, area);
      const expected = scope === 'county' ? await expectedCounty(area) : await expectedLegacy(page, area);
      const renderedRange = scope === 'county' ? dialog : dialog.locator('[data-role="legacy-administration"]');
      if (area === 'militaer') {
        const types = dialog.locator('[data-role="military-forces"]');
        await types.locator('summary').click();
        assert.deepEqual(await types.locator('dt').allTextContents(),
          ['Hausmacht', 'Wache', 'Vasallentruppen', 'Kirchliches Aufgebot', 'Externes Aufgebot']);
        assert.match(await types.getByRole('link', { name: /Hausmacht/ }).getAttribute('href'),
          /amt=hof&abteilung=hof-hausmacht/);
        assert.doesNotMatch(await dialog.textContent(), /Wachtmarschall/);
        assert.equal(await dialog.locator('[data-group-id="militaer-ortswachen"]').count(), 1);
        await types.locator('summary').click();
      }
      const displayed = await renderedRange.locator('.administration-role-card .administration-role-name').allTextContents();
      assert.equal(displayed.length, expected.count, `${scope}/${area}: all office cards retained`);
      assert.deepEqual(expected.names.filter(name => !displayed.includes(name)), [], `${scope}/${area}: all named holders retained`);
      if (scope === 'gwendolyn') {
        const forecast = dialog.locator('.administration-structured > [data-group-kind="leadership"]');
        assert.match(await forecast.locator('.administration-role-title').innerText(), /des Barons/);
      }
      if (scope === 'county' && area === 'klerus') {
        assert.equal(await dialog.locator('[data-group-id="klerus-praelaten"] .administration-role-card').count(), 9);
        assert(await dialog.locator('.administration-role-name').filter({ hasText: "Glendower O'Cenyr" }).count());
      }

      const examples = dialog.locator(`[data-role-examples="${area}"]`);
      assert.equal(await dialog.locator('[data-role-examples]').count(), 1, `${scope}/${area}: one examples table`);
      assert.deepEqual(await examples.locator('thead th').allTextContents(), ['Rolle', 'Kurzbeschreibung']);
      for (const [kind, title] of Object.entries(ROLE_EXAMPLE_GROUPS)) {
        const group = examples.locator(`[data-example-kind="${kind}"]`);
        assert.equal(await group.locator('[scope="rowgroup"]').innerText(), title);
        assert.deepEqual(await group.locator('[scope="row"] .administration-example-role > span:last-child').allTextContents(), ROLE_EXAMPLES[area][kind].map(([name]) => name));
        assert.deepEqual(await group.locator('td').allTextContents(), ROLE_EXAMPLES[area][kind].map(([, description]) => description));
      }
      assert.deepEqual(await examples.locator('.administration-pin').evaluateAll(pins => pins.map(pin => ({
        bronze: pin.classList.contains('is-bronze'), symbol: pin.querySelector('use').getAttribute('href').split('#')[1],
      }))), Array(Object.values(ROLE_EXAMPLES[area]).flat().length).fill({ bronze: true, symbol: area }));
      assert.ok(await examples.evaluate(node => node.nextElementSibling?.classList.contains('administration-dialog-navigation')), `${scope}/${area}: examples end the content before navigation`);

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
        assert.deepEqual(await adjutants.locator('.administration-role-name').allTextContents(), ['Rhys Draig', 'Anaraut Draig', 'Niniane Chwedonol']);
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

  for (const vassal of vassals.filter(entry => entry.id !== 'gwendolyns-ufer')) {
    await page.goto(origin + vassal.href, { waitUntil: 'domcontentloaded' });
    for (const area of ['militaer', 'klerus']) {
      const trigger = page.locator(`button[data-action="open-administration"][data-administration-key="${area}"]`);
      await trigger.click();
      const dialog = await waitForArea(page, area);
      const lead = dialog.locator('[data-group-kind="leadership"]').first();
      assert.equal(await lead.locator('.administration-role-title').innerText(), vassal.offices[area].title);
      if (vassal.offices[area].name) assert.equal(await lead.locator('.administration-role-name').innerText(), vassal.offices[area].name);
      assert.match(await dialog.locator('.administration-area-intro a').getAttribute('href'), new RegExp(`haus=${vassal.id}&amt=${area}`));
      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'hidden' });
    }
    console.log('Eigene Amtsseiten', vassal.id);
  }

  const housePage = '/Familien%20H%C3%A4user%20und%20Clans/haus.html?haus=';
  const court = page.locator('.house-court-offices');
  const top = court.locator('[data-group-id="court-leadership"] .administration-role-title');
  const topTitles = ['Vogt', 'Schatzmeister', 'Kommandant der Hausmacht'];

  for (const scope of CENYR_ADMINISTRATION_SCOPES.filter(entry => entry.id !== 'draig')) {
    await page.goto(origin + housePage + scope.houseId, { waitUntil: 'domcontentloaded' });
    await top.first().waitFor();
    assert.deepEqual(await top.allTextContents(), topTitles, `${scope.id}: leading court offices`);
    await court.getByRole('button', { name: /^Hofmeister(?:in)? ·/ }).first().click();
    const detail = page.locator('.administration-office-dialog[open]');
    assert.equal(await detail.locator('[data-office-branch="hoflehre"]').count(), 1, `${scope.id}: Hofmeister mentors`);
    assert.equal(await detail.locator('[data-office-branch="zofen"]').count(), 0, `${scope.id}: maids report to the Vogt`);
    assert.match(await detail.getByRole('link', { name: /Besetzung in der Werkstatt bearbeiten/ }).getAttribute('href'),
      new RegExp(`haus=${scope.id}&amt=hof&abteilung=hof-hofmeister`));
    await page.keyboard.press('Escape');
    await detail.waitFor({ state: 'hidden' });
    await court.getByRole('button', { name: /^Schatzmeister(?:in)? ·/ }).first().click();
    assert.equal(await detail.locator('[data-office-branch="schatzkammer"]').count(), 1, `${scope.id}: Schatzmeister runs the treasury`);
    await page.keyboard.press('Escape');
    await detail.waitFor({ state: 'hidden' });
    if (scope.id === 'gafyr') {
      await court.getByRole('button', { name: /^Vogt ·/ }).first().click();
      assert.equal(await detail.locator('[data-office-branch="zofen"] li').count(), 8);
    }
    console.log('Hofämter', scope.id);
  }

  await page.goto(origin + housePage + 'haus-draig', { waitUntil: 'domcontentloaded' });
  await top.first().waitFor();
  assert.deepEqual(await top.allTextContents(), topTitles);
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 950 });
    const vogt = court.getByRole('button', { name: /Vogt · Dalvin Balchder/ });
    await vogt.click();
    const detail = page.locator('.administration-office-dialog[open]');
    const zofen = detail.locator('[data-office-branch="zofen"]');
    const chamber = detail.locator('[data-office-branch="kammerdiener"]');
    await zofen.locator('summary').click();
    assert.match(await zofen.innerText(), /Myfanwy Draenmelyn/);
    assert.match(await chamber.innerText({ timeout: 5000 }), /Kammerdiener/);
    assert.match(await zofen.getByRole('link', { name: 'Myfanwy Draenmelyn' }).getAttribute('href'), /AleriaAlmanach.html\?character=/);
    await checkDialogBounds(detail, '.administration-office-body', `Draig/Vogt/${width}`, width);
    if (screenshotDir) {
      await decodeImages(detail.locator('img:visible'));
      await detail.screenshot({ path: resolve(screenshotDir, `draig-vogt-${width}.png`) });
    }
    await page.keyboard.press('Escape');
    await detail.waitFor({ state: 'hidden' });
    assert(await vogt.evaluate(button => document.activeElement === button));
    const command = court.getByRole('button', { name: /Kommandant der Hausmacht · Steffan Draig/ });
    await command.click();
    const guard = detail.locator('[data-office-branch="leibgarde"]');
    await guard.locator('summary').click();
    assert.match(await guard.innerText(), /Marared Curiad/);
    assert.match(await guard.innerText(), /Ysabel Bronnor/);
    assert.equal(await detail.locator('[data-office-branch="hausmacht-adjutantur"]').count(), 1);
    assert.equal(await detail.locator('[data-office-branch="hausaufgebot"]').count(), 1);
    assert.match(await detail.locator('.administration-office-facts').innerText(), /Marschall der Grafschaft/);
    assert.equal(await detail.locator('[data-office-branch="hausaufgebot"] li').count(), 4);
    assert.match(await detail.getByRole('link', { name: /Draig-Leibgarde im Almanach/ }).getAttribute('href'), /entry=draig-leibgarde/);
    if (screenshotDir) {
      await decodeImages(detail.locator('img:visible'));
      await detail.screenshot({ path: resolve(screenshotDir, `draig-hausmacht-${width}.png`) });
    }
    await page.keyboard.press('Escape');
    await detail.waitFor({ state: 'hidden' });
  }
  await court.getByRole('button', { name: /Kommandant der Hausmacht · Steffan Draig/ }).click();
  await page.locator('.administration-office-dialog[open]').getByRole('link', { name: /Besetzung in der Werkstatt bearbeiten/ }).click();
  const landed = page.locator('dialog[open] #office-title');
  await landed.waitFor();
  assert.equal(await landed.innerText(), 'Kommandant der Hausmacht');
  assert.match(page.url(), /haus=draig&amt=hof&abteilung=hof-hausmacht/);
  assert.match(await page.locator('[data-drop-post="hof/garde"]').innerText(), /Marared Curiad/);

  await page.goto(origin + '/Kontinente/Estryll/Königreich Cenyr/aemter.html', { waitUntil: 'domcontentloaded' });
  await page.getByRole('link', { name: 'Streitkräfte', exact: true }).first().click();
  const forces = page.locator('#streitkraefte');
  assert.equal(await forces.locator('dt').count(), 5);
  assert.match(await forces.innerText(), /Klingende Münze.*Condottieri/);
  if (screenshotDir) {
    await forces.screenshot({ path: resolve(screenshotDir, 'cenyr-streitkraefte-320.png') });
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
