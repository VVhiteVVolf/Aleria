import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '../../Stammbäume/node_modules/playwright-core/index.mjs';
import { startChartQualityServer } from '../../Stammbäume/tools/chart-quality-server.mjs';
import { lehenswartKey } from '../../shared/cenyr-administration/lehenswarte-plan.mjs';
import { LEHENSWARTE_AREA } from '../../shared/cenyr-administration/office-icons.mjs';

const workspace = fileURLToPath(new URL('../../', import.meta.url));
const output = await mkdtemp(join(workspace, 'diagnostics', 'herrschaftsverwaltung-20261124-'));
const serve = await startChartQualityServer(workspace);
const report = { status: 'running', screenshots: [], viewports: [], errors: [], httpErrors: [], blocked: [], checks: [] };
const pagePath = '/Vorschau/Herrschaftsverwaltung/index.html';
const districts = ['saethwyr', 'gafyr', 'wyrm', 'draig', 'arthus-streben', 'gwendolyns-ufer', 'rhonwens-traenen'];
const areas = ['militaer', 'klerus', 'gerichtsbarkeit', 'finanzen', 'spionage', 'diplomatie', 'magie', 'unterhaltung', 'hof', 'lehenswarte'];
let browser;

async function screenshot(page, name) {
  await page.evaluate(async () => {
    const surface = document.querySelector('dialog[open]') || document;
    const visible = [...surface.querySelectorAll('img')].filter(image => {
      const rect = image.getBoundingClientRect();
      const clip = image.closest('.office-posts, .candidate-list')?.getBoundingClientRect();
      return rect.width && rect.height && rect.bottom > Math.max(0, clip?.top ?? 0)
        && rect.top < Math.min(innerHeight, clip?.bottom ?? innerHeight);
    });
    for (const image of visible) image.loading = 'eager';
    await Promise.all(visible.map(image => image.decode().catch(async () => {
      await new Promise(resolve => setTimeout(resolve, 80));
      await image.decode();
    })));
  });
  await page.screenshot({ path: join(output, name + '.png'), animations: 'disabled' });
  report.screenshots.push(name + '.png');
}

async function geometry(page) {
  const issues = await page.evaluate(() => {
    const dialog = document.querySelector('dialog[open]');
    const regions = [document.documentElement, ...(dialog ? [dialog, ...dialog.querySelectorAll('.candidate-list, .office-posts, .office-header')] : [])];
    return regions.filter(region => region.scrollWidth > region.clientWidth + 1).map(region => region.className || region.nodeName);
  });
  assert.deepEqual(issues, [], 'Keine horizontal abgeschnittenen Inhalte');
}

async function contextAt(width, height, touch = false) {
  const context = await browser.newContext({ viewport: { width, height }, hasTouch: touch, isMobile: touch, serviceWorkers: 'block' });
  await context.route('**/*', route => {
    const request = route.request(), url = new URL(request.url());
    if (request.method() !== 'GET' || url.origin !== serve.origin) {
      report.blocked.push(url.href);
      return route.abort('blockedbyclient');
    }
    if (url.pathname === '/Vorschau/Herrschaftsverwaltung/') {
      url.pathname = pagePath;
      return route.continue({ url: url.href });
    }
    return route.continue();
  });
  const page = await context.newPage();
  page.setDefaultTimeout(9000);
  page.on('pageerror', error => report.errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error' && !message.text().includes('ERR_BLOCKED_BY_CLIENT')) report.errors.push(message.text());
  });
  page.on('response', response => {
    if (response.status() >= 400) report.httpErrors.push({ url: response.url(), status: response.status() });
  });
  return { context, page };
}

const openOffice = async (page, area) => {
  await page.locator(`[data-area="${area}"]`).click();
  await page.locator('dialog[open]').waitFor();
};
const closeOffice = async page => {
  await page.keyboard.press('Escape');
  await page.locator('dialog[open]').waitFor({ state: 'hidden' });
};
const chooseHouse = (page, scope) => page.locator(`[data-house="${scope}"]`).click();
const search = page => page.getByRole('searchbox', { name: 'Kandidaten suchen' });
const candidate = (page, name) => page.locator('[data-role="candidate-list"] .candidate').filter({ has: page.getByText(name, { exact: true }) });
const upperPost = page => page.locator('.office-post.is-head');
const candidateList = page => page.locator('[data-role="candidate-list"]');
const department = (page, id) => page.locator(`[data-action="open-department"][data-department="hof-${id}"]`);
const roleGroup = (page, title) => page.locator('[data-role-group]').filter({
  has: page.locator('summary > strong').and(page.getByText(title, { exact: true })),
});

async function openDepartment(page, id) {
  await department(page, id).click();
  await upperPost(page).waitFor();
}

async function auditCourtDepartments(page, width) {
  const available = await page.locator('[data-action="open-department"]').evaluateAll(buttons =>
    buttons.map(button => ({ id: button.dataset.department.slice(4), key: button.dataset.post })));
  assert.equal(available.length, 23);
  const chosen = width > 1000 ? available : available.filter(entry => ['vogt', 'schatzmeister', 'hausmacht', 'hofmeister'].includes(entry.id));
  for (const [index, { id, key }] of chosen.entries()) {
    await openDepartment(page, id);
    assert.equal(await upperPost(page).getAttribute('data-drop-post'), key);
    assert(await page.locator('[data-drop-post]').count() >= 5);
    await geometry(page);
    if (index % 2 === 0) await page.getByRole('button', { name: /Zurück zu Hofämter/ }).click();
    else await page.keyboard.press('Escape');
    assert.equal(await page.locator('#office-title').innerText(), 'Hofämter');
    const focus = await department(page, id).evaluate(button => ({
      correct: button === document.activeElement,
      active: document.activeElement?.outerHTML.slice(0, 150),
    }));
    assert(focus.correct, `${id}: ${focus.active}`);
  }
  return chosen.length;
}

async function checkCourtOrder(page, width) {
  const posts = page.locator('.is-leadership [data-drop-post]');
  assert.deepEqual(await posts.evaluateAll(cards => cards.map(card => card.dataset.dropPost)),
    ['hof/vogt', 'hof/schatzmeister', 'hof/hausmacht']);
  const leadingBoxes = await posts.evaluateAll(cards => cards.map(card => card.getBoundingClientRect().toJSON()));
  if (width > 1000) {
    assert(leadingBoxes.every(box => box.top === leadingBoxes[0].top));
    assert(leadingBoxes[0].left < leadingBoxes[1].left && leadingBoxes[1].left < leadingBoxes[2].left);
  } else {
    assert(leadingBoxes[0].bottom < leadingBoxes[1].top && leadingBoxes[1].bottom < leadingBoxes[2].top);
  }
  const order = await page.locator('[data-drop-post]').evaluateAll(cards => cards.slice(0, 6).map(card => card.dataset.dropPost));
  assert.deepEqual(order, ['hof/vogt', 'hof/schatzmeister', 'hof/hausmacht', 'hof/leitung', 'hof/waffen', 'hof/archiv']);
}

async function auditOffices(page, width) {
  let count = 0;
  let hofDepartments = 0;
  for (const scope of districts) {
    await chooseHouse(page, scope);
    await geometry(page);
    assert.equal(await page.locator('.council-card').count(), 8);
    for (const area of areas) {
      await openOffice(page, area);
      const withoutLead = ['hof', 'lehenswarte'].includes(area);
      assert.equal(await upperPost(page).count(), withoutLead ? 0 : 1);
      assert(await page.locator('[data-drop-post]').count() >= (area === 'lehenswarte' ? 1 : scope === 'draig' ? 10 : 17), `${scope}/${area}`);
      const core = page.locator('.post-group.is-core [data-drop-post]');
      const expected = withoutLead ? 0 : area === 'klerus' ? (scope === 'draig' ? 9 : 0) : (scope === 'draig' && area === 'magie' ? 0 : 5);
      assert.equal(await core.count(), expected);
      if (area === 'hof') {
        await checkCourtOrder(page, width);
        hofDepartments += await auditCourtDepartments(page, width);
      }
      if (area === 'militaer' && scope === 'rhonwens-traenen') {
        const admiralty = page.getByRole('heading', { name: 'Admiralität', exact: true });
        assert.equal(await admiralty.count(), 1);
        const flotillas = roleGroup(page, 'Flottillenadmiral');
        assert.equal(await flotillas.locator('[data-drop-post]').count(), 2);
        assert.equal(await page.getByRole('heading', { name: 'Seekommandant eines Geschwaders', exact: true }).count(), 0);
        await admiralty.scrollIntoViewIfNeeded();
        await screenshot(page, `arwydd-admiralitaet-${width}`);
        if (width === 1440) {
          await addExistingRole(page, 'Flottillenadmiral', 2);
          assert.equal(await flotillas.locator('[data-drop-post]').count(), 4);
          const original = flotillas.locator('[data-drop-post^="militaer/flottille-"]').first();
          await original.locator('[data-action="remove-post"]').click();
          assert.equal(await flotillas.locator('[data-drop-post]').count(), 3);
          await addExistingRole(page, 'Kapitän zur See', 4);
          assert.equal(await roleGroup(page, 'Kapitän zur See').locator('[data-drop-post]').count(), 5);
          await screenshot(page, 'arwydd-kapitaene-1440');
        }
      }
      await geometry(page);
      await closeOffice(page);
      await page.locator(`[data-area="${area}"]:focus`).waitFor();
      count++;
    }
  }
  return { width, dialogs: count, hofDepartments };
}

async function center(locator) {
  const box = await locator.boundingBox();
  assert(box);
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

async function dragMouse(page, source, target) {
  await source.scrollIntoViewIfNeeded();
  if (await target.isVisible()) await target.scrollIntoViewIfNeeded();
  const start = await center(source);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x - 9, start.y);
  const end = await center(target);
  await page.mouse.move(end.x, end.y, { steps: 10 });
  const hit = await target.evaluate((element, point) => ({
    highlighted: element.classList.contains('is-drop-target'),
    hit: document.elementFromPoint(point.x, point.y)?.outerHTML.slice(0, 200),
    dragging: Boolean(element.closest('dialog.is-dragging, .is-dragging')),
  }), end);
  assert(hit.highlighted, JSON.stringify({ start, end, ...hit }));
  await page.mouse.up();
}

async function dragTouch(page, source, target) {
  const client = await page.context().newCDPSession(page);
  const start = await center(source);
  const end = await center(target);
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [start] });
  for (let step = 1; step <= 10; step++) {
    const fraction = step / 10;
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchMove', touchPoints: [{ x: start.x + (end.x - start.x) * fraction, y: start.y + (end.y - start.y) * fraction }],
    });
  }
  assert.equal(await target.evaluate(element => element.classList.contains('is-drop-target')), true);
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await client.detach();
}

async function checkFilters(page) {
  await search(page).fill('nia saethwyr');
  assert.equal(await candidate(page, 'Nia Saethwyr').count(), 1);
  await page.getByText('Weitere Filter', { exact: false }).click();
  await page.getByLabel('Unter 18 Jahren ausblenden').check();
  assert.equal(await candidate(page, 'Nia Saethwyr').count(), 0);
  await page.getByLabel('Geschlecht').selectOption('female');
  await page.getByLabel('Familienstand').selectOption('widowed');
  await page.getByLabel('Alter ab').fill('60');
  await page.getByLabel('Alter bis').fill('70');
  await search(page).fill('imogen arwydd');
  assert.equal(await candidate(page, 'Imogen Saethwyr').count(), 1);
  await page.getByLabel('Familienstand').selectOption('single');
  assert.equal(await candidate(page, 'Imogen Saethwyr').count(), 0);
  await page.getByRole('button', { name: 'Filter zurücksetzen' }).click();
  await page.getByLabel('Geschlecht').selectOption('male');
  await page.getByLabel('Familienstand').selectOption('married');
  await search(page).fill('anwyll');
  assert.equal(await candidate(page, 'Anwyll Saethwyr').count(), 1);
  await page.getByRole('button', { name: 'Filter zurücksetzen' }).click();
  await page.getByText('Weitere Filter', { exact: false }).click();
  await search(page).fill('kelyddon');
  assert.equal(await candidateList(page).locator('button').count(), 0);
  await search(page).fill('Brannoc Ruddgraen');
  assert.equal(await candidateList(page).locator('button').count(), 0);
  await page.getByLabel('Freie Bürgerliche einbeziehen').check();
  assert.equal(await candidate(page, 'Brannoc Ruddgraen').count(), 1);
  await page.getByLabel('Freie Bürgerliche einbeziehen').uncheck();
  assert.equal(await candidateList(page).locator('button').count(), 0);
  report.checks.push('Suche und kombinierte Filter einschließlich Geschlecht, Familienstand, Minderjährigen, Altersspanne und optionalem Bürgerpool');
}

async function addPost(page, type, label) {
  await page.getByText('Posten hinzufügen', { exact: true }).click();
  await page.getByLabel('Art des Postens').selectOption(type);
  await page.getByLabel('Titel', { exact: true }).fill(label);
  await page.getByLabel('Aufgaben', { exact: true }).fill('Meldet offene Vorgänge an die Amtsleitung.');
  await page.getByRole('button', { name: 'Posten anlegen' }).click();
  const post = page.locator('[data-drop-post]').filter({ has: page.getByRole('heading', { name: label, exact: true }) });
  assert.equal(await post.count(), 1);
  return post;
}

async function addExistingRole(page, label, count, site = '') {
  const role = roleGroup(page, label);
  await role.locator('summary').first().click();
  await role.getByRole('button', { name: `Weitere Posten hinzufügen: ${label}`, exact: true }).click();
  const template = page.locator('[name="template"] option:checked');
  assert.equal(await template.textContent(), label);
  await page.getByLabel('Anzahl').fill(String(count));
  if (site) {
    const siteField = page.locator('[data-role="site-field"]');
    assert.match(await siteField.locator('[data-role="site-label"]').innerText(), /^(Dienstort|Standort)$/);
    await siteField.locator('select').selectOption({ label: site });
  }
  await page.getByRole('button', { name: 'Posten anlegen' }).click();
  await page.getByText(`${count} Posten angelegt.`, { exact: true }).waitFor();
}

async function addForeignApplicant(page, width) {
  const name = 'Aegir Frostauge';
  const openPicker = page.getByRole('button', { name: '+ Aus Stammbäumen' });
  const treeSearch = page.getByRole('searchbox', { name: 'Stammbäume durchsuchen' });
  const includeOther = page.getByRole('checkbox', { name: 'Weitere Regionen einblenden' });
  const receipt = page.locator('[data-role="tree-selection-status"]');
  await search(page).fill(name);
  assert.equal(await candidate(page, name).count(), 0);
  await openPicker.click();
  assert.equal(await includeOther.isChecked(), false);
  const checkbox = await includeOther.boundingBox();
  assert(checkbox.width >= 16 && checkbox.width <= 24 && checkbox.height <= 24);
  await treeSearch.fill('Imogen Saethwyr');
  await page.getByRole('button', { name: 'Imogen Saethwyr in der Bewerberliste auswählen' }).click();
  assert.match(await receipt.innerText(), /Imogen Saethwyr ist bereits in der Bewerberliste und jetzt ausgewählt/);
  assert(await candidate(page, 'Imogen Saethwyr').evaluate(node => document.activeElement === node && node.ariaPressed === 'true'));
  await openPicker.click();
  await treeSearch.fill('Aegir Frostauge Aldrimar');
  const result = page.getByRole('button', { name: /Aegir Frostauge aus Clan Frostauge hinzufügen/ });
  assert.equal(await result.count(), 0);
  await page.getByText('Keine passende Figur aus Celtigerns Wacht gefunden.').waitFor();
  await screenshot(page, `stammbaumsuche-celtigerns-wacht-${width}`);
  await includeOther.check();
  await result.waitFor();
  await screenshot(page, `stammbaumsuche-${width}`);
  await result.click();
  await candidate(page, name).and(page.locator('[aria-pressed="true"]')).waitFor();
  assert.match(await candidate(page, name).innerText(), /Aus einem Stammbaum ergänzt/);
  assert.match(await receipt.innerText(), /Aegir Frostauge wurde hinzugefügt und ist ausgewählt/);
  assert(await candidate(page, name).evaluate(node => document.activeElement === node));
  await screenshot(page, `stammbaumsuche-bestaetigt-${width}`);
  return candidate(page, name);
}

async function desktop() {
  const { context, page } = await contextAt(1440, 900);
  try {
    await page.goto(serve.origin + '/Vorschau/index.html');
    await page.getByRole('searchbox').fill('Saethwyr');
    const entry = page.locator('[data-preparation="herrschaftsverwaltung"] .preparation-card-link');
    await entry.click();
    await page.locator('button[data-house="saethwyr"][aria-pressed="true"]').waitFor();
    await screenshot(page, 'saethwyr-rat-1440');
    report.viewports.push(await auditOffices(page, 1440));
    await chooseHouse(page, 'draig');
    await openOffice(page, 'klerus');
    await page.getByText('Vikariate der Lehnsherrschaften', { exact: true }).last().click();
    const vassal = page.locator('dialog [href="?haus=gafyr&amt=klerus"]');
    assert(await vassal.isVisible());
    await screenshot(page, 'draig-patriarchat-1440');
    await vassal.click();
    await page.locator('dialog[open]').waitFor();
    assert.match(await upperPost(page).innerText(), /Eleri Gafyr/);
    await closeOffice(page);
    await chooseHouse(page, 'wyrm');
    await openOffice(page, 'hof');
    assert.equal(await page.locator('#office-title').innerText(), 'Hofämter');
    const vogt = page.locator('[data-drop-post="hof/vogt"]');
    const treasurer = page.locator('[data-drop-post="hof/schatzmeister"]');
    assert.match(await vogt.innerText(), /Emlyn Glynmor/);
    assert.match(await page.locator('[data-drop-post="hof/kueche"]').innerText(), /Eleri Glynmor/);
    await page.getByLabel('Nur freie Unterposten').check();
    assert.equal(await page.locator('.is-leadership [data-drop-post]').count(), 3);
    assert.match(await vogt.innerText(), /Emlyn Glynmor/);
    await page.getByLabel('Nur freie Unterposten').uncheck();
    await vogt.locator('summary').click();
    assert(await vogt.locator('.post-duty').isVisible());
    await vogt.locator('summary').click();
    await dragMouse(page, vogt.locator('[data-drag-person]'), treasurer);
    assert.match(await treasurer.innerText(), /Emlyn Glynmor/);
    assert.match(await vogt.innerText(), /Emlyn Glynmor/);
    assert.equal(await vogt.locator('.office-appointments a').count(), 1);
    await page.locator('dialog [data-action="undo"]').click();
    assert.match(await vogt.innerText(), /Emlyn Glynmor/);
    assert.equal(await vogt.locator('.office-appointments a').count(), 0);
    report.checks.push('Oberste Hofämter, alle Unterfenster, Aufgabenaufklappung und Umbesetzung mit Rückgängig');
    await screenshot(page, 'wyrm-hofaemter-1440');
    await closeOffice(page);
    await chooseHouse(page, 'saethwyr');
    await openOffice(page, 'militaer');
    assert.match(await upperPost(page).innerText(), /Marmaduke Saethwyr/);
    assert.equal(await page.getByRole('heading', { name: 'Die fünf Kriegswarte' }).count(), 1);
    await screenshot(page, 'saethwyr-marschall-1440');
    assert.equal(await page.getByRole('heading', { name: 'Hauptmann der Wache von Tŵr Gwaunhir', exact: true }).count(), 1);
    assert.equal(await page.getByText('Wachtmarschall', { exact: true }).count(), 0);
    const forceList = page.locator('[data-role="military-forces"]');
    await forceList.locator('summary').click();
    assert.deepEqual(await forceList.locator('dt').allTextContents(),
      ['Hausmacht', 'Wache', 'Vasallentruppen', 'Kirchliches Aufgebot', 'Externes Aufgebot']);
    assert.match(await forceList.getByRole('link', { name: /Hausmacht öffnen/ }).getAttribute('href'), /haus=saethwyr&amt=hof&abteilung=hof-hausmacht/);
    await screenshot(page, 'saethwyr-streitkraefte-1440');
    await closeOffice(page);
    await openOffice(page, 'klerus');
    assert.equal(await page.locator('[data-drop-post^="klerus/diakon-"]').count(), 4);
    await page.getByRole('heading', { name: 'Schutzdienst des Vikariats' }).scrollIntoViewIfNeeded();
    await screenshot(page, 'saethwyr-vikariat-1440');
    await addExistingRole(page, 'Schwurritter', 2);
    assert.equal(await roleGroup(page, 'Schwurritter').locator('[data-drop-post]').count(), 4);
    report.checks.push('Patriarchat mit neun Prälaten und Direktlink zum Vikariat, Diakone pro Siedlung und erweiterbarer Schutzdienst');
    await closeOffice(page);
    await openOffice(page, 'spionage');
    await checkFilters(page);
    await search(page).fill('imogen');
    await dragMouse(page, candidate(page, 'Imogen Saethwyr'), upperPost(page));
    assert.match(await upperPost(page).innerText(), /Imogen Saethwyr/);
    assert.match(await page.locator('[data-role="office-status"]').innerText(), /Arawn wurde in diesem Amt abgelöst/);
    assert.equal(await upperPost(page).getByRole('link', { name: /Kämmererin/ }).count(), 1);
    await search(page).fill('imogen kämmererin');
    assert.match(await candidate(page, 'Imogen Saethwyr').innerText(), /2 Ämter/);
    await addExistingRole(page, 'Ermittler', 4);
    const investigators = roleGroup(page, 'Ermittler');
    assert.equal(await investigators.locator('[data-drop-post]').count(), 5);
    assert(await investigators.locator('summary img').evaluate(async img => { await img.decode(); return img.naturalWidth > 0; }));
    await screenshot(page, 'saethwyr-ermittler-1440');
    const special = await addPost(page, 'special', 'Sonderbote für Hofmeldungen');
    await search(page).fill('anwyll');
    await candidate(page, 'Anwyll Saethwyr').press('Space');
    await special.locator('[data-action="choose-post"]').press('Enter');
    assert.match(await special.innerText(), /Anwyll Saethwyr/);
    await screenshot(page, 'saethwyr-sonderamt-1440');
    await closeOffice(page);
    await openOffice(page, 'finanzen');
    assert.match(await upperPost(page).innerText(), /Imogen Saethwyr/);
    await closeOffice(page);
    await openOffice(page, 'hof');
    await addPost(page, 'service', 'Gehilfe der Hofkanzlei');
    await closeOffice(page);
    await openOffice(page, 'gerichtsbarkeit');
    await addForeignApplicant(page, 1440);
    await upperPost(page).locator('[data-action="choose-post"]').click();
    assert.match(await upperPost(page).innerText(), /Aegir Frostauge/);
    await closeOffice(page);
    await chooseHouse(page, 'gafyr');
    await openOffice(page, 'hof');
    await openDepartment(page, 'vogt');
    const maids = roleGroup(page, 'Zofe');
    assert.equal(await maids.locator('[data-drop-post]').count(), 8);
    await addExistingRole(page, 'Zofe', 3);
    assert.equal(await maids.locator('[data-drop-post]').count(), 11);
    await maids.locator(':scope > summary').scrollIntoViewIfNeeded();
    await screenshot(page, 'gafyr-zofen-1440');
    await page.keyboard.press('Escape');
    await openDepartment(page, 'hausmacht');
    assert(await page.getByRole('heading', { name: 'Adjutant des Kommandanten der Hausmacht' }).isVisible());
    assert(await page.getByRole('heading', { name: 'Hauptmann der Leibgarde' }).isVisible());
    assert.equal(await page.getByRole('heading', { name: 'Hausmacht – Waffenknechte & Ritter' }).count(), 1);
    assert.equal(await roleGroup(page, 'Hauptmann der Hausmacht').locator('[data-drop-post]').count(), 2);
    assert.equal(await page.getByRole('heading', { name: 'Hauptmann der Wache von Morddwr', exact: true }).count(), 0);
    await screenshot(page, 'gafyr-hausmacht-1440');
    await addExistingRole(page, 'Leutnant der Hausmacht', 2, 'Morddwr');
    assert.equal(await roleGroup(page, 'Leutnant der Hausmacht · Morddwr').locator('[data-drop-post]').count(), 2);
    assert.match(await roleGroup(page, 'Leutnant der Hausmacht · Morddwr').textContent(), /Stationiert in Morddwr/);
    await page.keyboard.press('Escape');
    await closeOffice(page);
    await openOffice(page, 'magie');
    await search(page).fill('kelyddon');
    await candidate(page, 'Kelyddon Gafyr').click();
    await upperPost(page).locator('[data-action="choose-post"]').click();
    await closeOffice(page);
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Entwurf exportieren' }).click();
    const download = await downloadPromise;
    const exported = await readFile(await download.path());
    assert.equal(download.suggestedFilename(), 'herrschaftsverwaltung-entwurf.json');
    const data = JSON.parse(exported);
    assert.equal(data.houses.saethwyr.posts.length, 8);
    assert.deepEqual(data.houses.saethwyr.applicants, ['person--haus-frostauge--aegir-frostauge']);
    assert.equal(data.houses.gafyr.posts.filter(post => post.title === 'Zofe').length, 3);
    assert(data.houses.gafyr.assignments['magie/leitung']);

    await page.reload();
    assert.match(await page.locator('[data-area="magie"]').innerText(), /Kelyddon Gafyr/);
    await page.getByRole('button', { name: 'Hausentwurf zurücksetzen' }).click();
    assert.match(await page.locator('[data-area="magie"]').innerText(), /Unbesetzt/);
    const file = page.locator('input[type="file"]');
    await file.setInputFiles({ name: 'entwurf.json', mimeType: 'application/json', buffer: exported });
    await page.getByText(/Gesamtentwurf geladen/).waitFor();
    assert.match(await page.locator('[data-area="magie"]').innerText(), /Kelyddon Gafyr/);
    await file.setInputFiles({ name: 'falsch.json', mimeType: 'application/json', buffer: Buffer.from('{"schema":"falsch"}') });
    await page.getByText(/keinem unterstützten Entwurf/).waitFor();
    assert.match(await page.locator('[data-area="magie"]').innerText(), /Kelyddon Gafyr/);
    await chooseHouse(page, 'saethwyr');
    await openOffice(page, 'gerichtsbarkeit');
    assert.match(await upperPost(page).innerText(), /Aegir Frostauge/);
    await search(page).fill('aegir frostauge');
    await page.getByRole('button', { name: 'Aegir Frostauge aus der Bewerberliste entfernen' }).click();
    assert.match(await page.locator('[data-role="office-status"]').innerText(), /zuerst alle Posten/);
    await upperPost(page).getByRole('button', { name: /Posten freigeben/ }).click();
    await page.getByRole('button', { name: 'Aegir Frostauge aus der Bewerberliste entfernen' }).click();
    assert.equal(await candidate(page, 'Aegir Frostauge').count(), 0);
    await closeOffice(page);
    await openOffice(page, 'hof');
    await roleGroup(page, 'Gehilfe der Hofkanzlei').locator(':scope > summary').click();
    assert.equal(await page.getByRole('heading', { name: 'Gehilfe der Hofkanzlei', exact: true }).count(), 1);
    await closeOffice(page);
    await openOffice(page, 'spionage');
    assert.match(await upperPost(page).innerText(), /Imogen Saethwyr/);
    const restored = page.locator('[data-drop-post]').filter({ has: page.getByRole('heading', { name: 'Sonderbote für Hofmeldungen', exact: true }) });
    assert.match(await restored.innerText(), /Anwyll Saethwyr/);
    await restored.getByRole('button', { name: 'Posten entfernen: Sonderbote für Hofmeldungen' }).click();
    assert.equal(await restored.count(), 0);
    await page.locator('dialog').getByRole('button', { name: 'Rückgängig', exact: true }).click();
    await roleGroup(page, 'Sonderbote für Hofmeldungen').locator(':scope > summary').click();
    assert.match(await restored.innerText(), /Anwyll Saethwyr/);
    await closeOffice(page);
    report.checks.push('Mehrfachnachbesetzung für Schutzdienst, Ermittler und Zofen, funktionierendes Amtsicon, Maus-/Tastaturbesetzung, regionale Stammbaumsuche, Reload und JSON-Rundlauf');
    await page.goto(serve.origin + '/Vorschau/index.html');
    const scopeLinks = [
      ['arthus-streben', 'Baronie Arthus Streben', 'Thomos Gwefrydd', 'Marschall des Barons'],
      ['gwendolyns-ufer', 'Baronie Gwendolyns Ufer', 'Gwynnan Gwyvern', 'Marschall des Barons'],
      ['rhonwens-traenen', 'Ritterfürstentum Rhonwens Tränen', 'Ianto Arwydd', 'Marschall des Ritterfürsten'],
    ];
    for (const [id, name, holder, title] of scopeLinks) {
      await page.getByRole('link', { name: new RegExp(name) }).click();
      await page.locator(`[data-house="${id}"][aria-pressed="true"]`).waitFor();
      await openOffice(page, 'militaer');
      assert.equal(await page.locator('#office-title').innerText(), title);
      assert.match(await upperPost(page).innerText(), new RegExp(holder));
      await screenshot(page, `${id}-1440`);
      await page.goto(serve.origin + '/Vorschau/index.html');
    }
    report.checks.push('Drei getrennte Einstiege aus der Übersicht mit amtlichem Rang und belegter Amtsleitung');
  } finally { await context.close(); }
}

async function mobile(width, height) {
  const { context, page } = await contextAt(width, height, true);
  try {
    await page.goto(serve.origin + pagePath);
    await page.locator('button[data-house="saethwyr"][aria-pressed="true"]').waitFor();
    await screenshot(page, `saethwyr-rat-${width}`);
    report.viewports.push(await auditOffices(page, width));
    await chooseHouse(page, 'saethwyr');
    await openOffice(page, 'spionage');
    await search(page).fill('imogen');
    await dragTouch(page, candidate(page, 'Imogen Saethwyr').locator('[data-drag-handle]'), upperPost(page));
    await upperPost(page).getByText('Imogen Saethwyr', { exact: true }).waitFor();
    assert.equal(await upperPost(page).getByRole('link', { name: /Kämmererin/ }).count(), 1);
    await screenshot(page, `saethwyr-schatten-${width}`);
    // Chromium's touch emulation suppresses a tap directly after a CDP drag.
    await page.waitForTimeout(750);
    await page.locator('dialog').getByRole('button', { name: 'Rückgängig', exact: true }).tap();
    await upperPost(page).getByText('Arawn', { exact: true }).waitFor();
    await search(page).fill('imogen');
    await candidate(page, 'Imogen Saethwyr').tap();
    await candidate(page, 'Imogen Saethwyr').and(page.locator('[aria-pressed="true"]')).waitFor();
    await upperPost(page).locator('[data-action="choose-post"]').tap();
    await upperPost(page).getByText('Imogen Saethwyr', { exact: true }).waitFor();
    await page.getByText('Weitere Filter', { exact: false }).tap();
    await page.getByLabel('Geschlecht').selectOption('female');
    await page.getByLabel('Alter ab').fill('60');
    await page.getByLabel('Alter bis').fill('70');
    await page.getByLabel('Unter 18 Jahren ausblenden').check();
    assert.equal(await candidate(page, 'Imogen Saethwyr').count(), 1);
    await geometry(page);
    await screenshot(page, `saethwyr-filter-${width}`);
    await closeOffice(page);
    await openOffice(page, 'hof');
    await screenshot(page, `saethwyr-hofaemter-${width}`);
    await openDepartment(page, 'vogt');
    const applicant = await addForeignApplicant(page, width);
    const target = page.locator('[data-drop-post="hof-vogt/untervogt"]');
    await target.locator('[data-action="choose-post"]').tap();
    assert.match(await target.innerText(), /Aegir Frostauge/);
    await applicant.waitFor();
    await screenshot(page, `saethwyr-vogt-${width}`);
    await page.keyboard.press('Escape');
    await closeOffice(page);
    report.checks.push(`Touch-Drag-and-drop und Antippen bei ${width} px, Rückgängig und freie Filterbedienung`);
  } finally { await context.close(); }
}

async function aldingen() {
  const { context, page } = await contextAt(1440, 900);
  try {
    await page.goto(serve.origin + '/Vorschau/Aldingen/index.html');
    await page.locator('[data-action="open-map"]').click();
    const dialog = page.locator('#map-dialog');
    await dialog.waitFor();
    const crest = dialog.locator('[data-drag-house="klingen"]');
    const seat = dialog.locator('[data-drop-seat="zollern"]');
    await dragMouse(page, crest, seat);
    const packed = await page.evaluate(() => JSON.parse(localStorage.getItem('aleria:proposal:aldingen:placements:v1')));
    assert.equal(packed.placements.klingen, 'zollern');
    report.checks.push('Aldingens vorhandene Kartenzuordnung per Maus verschoben und gespeichert');
  } finally { await context.close(); }
}

async function auditOfficialCourt(page, width) {
  await page.goto(serve.origin + '/Familien%20H%C3%A4user%20und%20Clans/haus.html?haus=haus-gafyr');
  const court = page.locator('.house-court-offices');
  const detail = page.locator('.administration-office-dialog[open]');
  const offices = [
    ['Waffenmeister', [['waffenlehre', 5], ['ruestkammer', 1]]],
    ['Handwerksmeister', [['schmiede', 7]]],
    ['Hofkaplan', [['kaplanei', 2], ['kaplan-heilkunde', 1], ['kapellendienst', 5]]],
    ['Hofdame', []],
  ];
  for (const [title, branches] of offices) {
    await court.getByRole('button', { name: new RegExp(`^${title} ·`) }).first().click();
    await detail.waitFor();
    for (const [id, slots] of branches) {
      const branch = detail.locator(`[data-office-branch="${id}"]`);
      assert.equal(await branch.locator('li').count(), slots);
      await branch.locator('summary').click();
    }
    if (title === 'Hofdame') assert.doesNotMatch(await detail.textContent(), /Page der Hofdame/);
    if (title === 'Waffenmeister' && width === 1440) await screenshot(page, 'waffenmeister-offiziell-1440');
    await page.keyboard.press('Escape');
    await detail.waitFor({ state: 'hidden' });
  }
}

async function reviseOfficeTitles(width, height) {
  const { context, page } = await contextAt(width, height, width < 400);
  try {
    await page.goto(serve.origin + pagePath + '?haus=gafyr');
    await openOffice(page, 'lehenswarte');
    const office = page.locator('[data-role="office-dialog"]');
    const edit = page.locator('[data-role="office-title-editor"]');
    const input = edit.getByLabel('Neuer Titel');
    const heading = page.locator('#office-title');
    const pen = office.locator('[data-role="rename-office"] button');
    const existing = page.locator('[data-drop-post="lehenswarte/lehenswart-bronfelen"]');
    const destination = page.locator('[data-drop-post="lehenswarte/lehenswart-morddwr"]');
    assert.match(await existing.innerText(), /Eifion Gostyn/);
    await search(page).fill('eifion gostyn');
    if (width > 1000) await dragMouse(page, candidate(page, 'Eifion Gostyn'), destination);
    else {
      await candidate(page, 'Eifion Gostyn').tap();
      await destination.locator('[data-action="choose-post"]').tap();
    }
    assert.match(await destination.innerText(), /Eifion Gostyn/);
    assert.match(await existing.innerText(), /Eifion Gostyn/);
    assert.equal(await existing.locator('.office-appointments a').count(), 1);
    await pen.click();
    await edit.waitFor();
    assert.equal(await input.inputValue(), LEHENSWARTE_AREA.name);
    assert(await input.evaluate(node => document.activeElement === node));
    await input.fill('Amtsregister der Lehen');
    await screenshot(page, `federkiel-${width}`);
    await page.keyboard.press('Escape');
    await edit.waitFor({ state: 'hidden' });
    assert.equal(await heading.innerText(), LEHENSWARTE_AREA.name);
    assert(await office.evaluate(node => node.open));
    await pen.click();
    await input.fill('Amtsregister der Lehen');
    await input.press('Enter');
    await edit.waitFor({ state: 'hidden' });
    assert.equal(await heading.innerText(), 'Amtsregister der Lehen');
    assert(await pen.evaluate(button => button === document.activeElement));
    await geometry(page);
    await screenshot(page, `lehenswarte-${width}`);
    await closeOffice(page);
    assert.match(await page.locator('[data-area="lehenswarte"]').innerText(), /Amtsregister der Lehen/);
    await openOffice(page, 'hof');
    await openDepartment(page, 'waffen');
    assert.match(await upperPost(page).innerText(), /jungen Angehörigen/);
    assert.equal(await roleGroup(page, 'Lehrmeister').locator('[data-drop-post]').count(), 4);
    assert.equal(await page.getByRole('heading', { name: 'Rüst- und Waffenwart', exact: true }).count(), 1);
    if (width === 1440) await screenshot(page, 'waffenmeister-1440');
    await page.keyboard.press('Escape');
    await openDepartment(page, 'handwerk');
    const role = name => roleGroup(page, name);
    await role('Schmiedegeselle').locator('..').locator('[data-action="rename-title"]').last().click();
    await input.fill('Hofschmiedegeselle');
    await input.press('Enter');
    await edit.waitFor({ state: 'hidden' });
    assert.equal(await role('Hofschmiedegeselle').locator('[data-drop-post]').count(), 4);
    await role('Hofschmiedegeselle').locator(':scope > summary').click();
    const first = role('Hofschmiedegeselle').locator('[data-drop-post]').first();
    await first.locator('[data-action="rename-title"]').click();
    await input.fill('Erster Hofschmiedegeselle');
    await input.press('Enter');
    await edit.waitFor({ state: 'hidden' });
    assert.match(await first.innerText(), /Erster Hofschmiedegeselle/);
    assert.equal(await role('Hofschmiedegeselle').locator('[data-drop-post]').count(), 4);
    assert.equal(await role('Schmiedelehrling').locator('[data-drop-post]').count(), 2);
    if (width === 1440) await screenshot(page, 'schmiede-1440');
    await role('Hofschmiedegeselle').locator(':scope > summary').click();
    await addExistingRole(page, 'Hofschmiedegeselle', 2);
    assert.equal(await role('Hofschmiedegeselle').locator('[data-drop-post]').count(), 6);
    await addExistingRole(page, 'Schmiedelehrling', 2);
    assert.equal(await role('Schmiedelehrling').locator('[data-drop-post]').count(), 4);
    await page.keyboard.press('Escape');
    await openDepartment(page, 'kaplan');
    assert(await page.getByRole('heading', { name: 'Schreiber des Hofkaplans', exact: true }).count());
    assert(await page.getByRole('heading', { name: 'Seelsorger', exact: true }).count());
    assert.equal(await role('Heiler').locator('[data-drop-post]').count(), 1);
    assert.equal(await role('Akolyth').locator('[data-drop-post]').count(), 2);
    if (width === 1440) await screenshot(page, 'hofkaplan-1440');
    await page.keyboard.press('Escape');
    await openDepartment(page, 'hofdame');
    assert.doesNotMatch(await page.locator('[data-role="posts"]').textContent(), /Page der Hofdame/);
    await page.keyboard.press('Escape');
    await closeOffice(page);
    await page.reload();
    await openOffice(page, 'lehenswarte');
    assert.equal(await heading.innerText(), 'Amtsregister der Lehen');
    assert.match(await destination.innerText(), /Eifion Gostyn/);
    await pen.click();
    await edit.getByRole('button', { name: 'Standardtitel verwenden' }).click();
    await edit.waitFor({ state: 'hidden' });
    assert.equal(await heading.innerText(), LEHENSWARTE_AREA.name);
    await auditOfficialCourt(page, width);
    report.checks.push(`Lehenswart besetzt, Amts-, Rollen- und Einzeltitel geändert, Escape, Reload und Standardtitel bei ${width} px`);
  } finally { await context.close(); }
}

async function checkLocalAuthorities(width, height) {
  const { context, page } = await contextAt(width, height, width < 400);
  try {
    await page.goto(serve.origin + pagePath + '?haus=gwendolyns-ufer');
    await openOffice(page, 'lehenswarte');
    const editor = page.getByRole('dialog', { name: 'Ortsamt festlegen' });
    const role = editor.getByLabel('Amtsform');
    const seat = name => page.locator(`[data-drop-post="${lehenswartKey(name)}"]`);
    const trigger = name => seat(name).locator('[data-action="configure-authority"]');
    async function inspect(name, type, options) {
      assert.match(await seat(name).locator('.post-place-type').innerText(), new RegExp(type));
      await trigger(name).click();
      assert.match(await editor.locator('[data-role="authority-site"]').innerText(), new RegExp(type));
      assert.deepEqual(await role.locator('option').evaluateAll(elements => elements.map(option => option.value)), ['', ...options]);
    }
    await inspect('Côr Mynyddfaen', 'Klostersiedlung', ['oberer', 'prior', 'abt', 'gildenpacht']);
    assert.match(await role.locator('option').first().innerText(), /Oberin/);
    await page.keyboard.press('Escape');
    await editor.waitFor({ state: 'hidden' });
    assert.match(await seat('Côr Mynyddfaen').innerText(), /Gwenydd Anghof/);
    await inspect('Tŵr Morlan', 'Turm', ['hauptmann-verwaltung', 'kommandant', 'hauptmann', 'burgverwalter', 'gildenpacht']);
    await role.selectOption('burgverwalter');
    await editor.getByRole('button', { name: 'Übernehmen' }).click();
    await editor.waitFor({ state: 'hidden' });
    assert.match(await seat('Tŵr Morlan').innerText(), /Burgverwalter/);
    assert.match(await seat('Tŵr Morlan').innerText(), /Cadfan Trydar\s+Entwurf/);
    const port = 'Morcarryn';
    await inspect(port, 'Hafensiedlung', ['buergermeister', 'lehenswart', 'gildenpacht']);
    await role.selectOption('gildenpacht');
    await editor.getByLabel('Gilde', { exact: true }).fill('Klingende Münze');
    await editor.getByLabel('Amtstitel der Gilde').fill('Hafenfaktor');
    await screenshot(page, `gildenpacht-${width}`);
    await editor.getByRole('button', { name: 'Übernehmen' }).click();
    await editor.waitFor({ state: 'hidden' });
    assert(await trigger(port).evaluate(button => button === document.activeElement));
    assert.match(await seat(port).innerText(), /Hafenfaktor/);
    assert.match(await seat(port).locator('.post-place-type').innerText(), /Hafensiedlung · Gildenpacht · Klingende Münze/);
    await search(page).fill('Rhunlas Llon');
    await candidate(page, 'Rhunlas Llon').click();
    await seat(port).locator('[data-action="choose-post"]').click();
    assert.match(await seat(port).innerText(), /Rhunlas Llon/);
    assert.match(await seat('Traethgorn').innerText(), /Rhunlas Llon/);
    await geometry(page);
    await screenshot(page, `ortsamt-${width}`);
    await closeOffice(page);
    await page.reload();
    await openOffice(page, 'lehenswarte');
    assert.match(await seat(port).innerText(), /Hafenfaktor/);
    assert.match(await seat(port).innerText(), /Rhunlas Llon/);
    await trigger(port).click();
    assert.equal(await editor.getByLabel('Gilde', { exact: true }).inputValue(), 'Klingende Münze');
    await role.selectOption('');
    await editor.getByRole('button', { name: 'Übernehmen' }).click();
    await editor.waitFor({ state: 'hidden' });
    assert.match(await seat(port).innerText(), /Bürgermeister von Morcarryn/);
    assert.match(await seat(port).innerText(), /Rhunlas Llon/);
    await closeOffice(page);
    await openOffice(page, 'militaer');
    assert.match(await seat('Tŵr Morlan').innerText(), /Burgverwalter von Tŵr Morlan[\s\S]*Cadfan Trydar/);
    await seat('Tŵr Morlan').getByRole('button', { name: /Posten freigeben/ }).click();
    await closeOffice(page);
    await openOffice(page, 'lehenswarte');
    assert.match(await seat('Tŵr Morlan').innerText(), /Unbesetzt/);
    report.checks.push(`Ortsämter und Gildenpacht bei ${width} px gewählt, besetzt, neu geladen und zurückgesetzt`);
  } finally { await context.close(); }
}

async function checkAppointments(width, height) {
  const { context, page } = await contextAt(width, height, width < 400);
  const workbench = '[data-role="office-dialog"][open]';
  const financeKey = 'finanzen/leitung';
  const treasuryKey = 'hof/schatzmeister';
  const otherOffice = (card, name) => card.locator('.office-appointments').getByRole('link', { name, exact: true });
  const financeTitle = 'Kämmerer des Grafen';
  const treasuryTitle = 'Schatzmeister · Haus Draig';

  async function checkFocusedPost(key) {
    const target = page.locator(`${workbench} [data-action="choose-post"][data-post="${key}"]`);
    await target.waitFor();
    assert.match(await target.innerText(), /Odyar Draig/);
    assert(await target.evaluate(button => document.activeElement === button));
    assert.equal(new URL(page.url()).searchParams.get('posten'), key);
  }

  try {
    const county = '/Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht/Grafschaft Celtigerns Wacht.html';
    await page.goto(serve.origin + encodeURI(county), { waitUntil: 'domcontentloaded' });
    await page.locator('.administration-grid [data-administration-key="finanzen"]').click();
    const countyDialog = page.locator('.administration-dialog[open]');
    const countyCard = countyDialog.locator('.administration-role-card').filter({ hasText: 'Odyar Draig' });
    const countyLink = otherOffice(countyCard, treasuryTitle);
    await countyLink.scrollIntoViewIfNeeded();
    await screenshot(page, `doppelamt-ratsamt-offiziell-${width}`);
    await countyCard.locator('.administration-role-open').click();
    const details = page.locator('.administration-office-dialog[open]');
    await otherOffice(details, treasuryTitle).waitFor();
    await page.keyboard.press('Escape');
    await countyLink.click();
    await checkFocusedPost(treasuryKey);

    const timeOrigin = await page.evaluate(() => performance.timeOrigin);
    await otherOffice(upperPost(page), financeTitle).press('Enter');
    await checkFocusedPost(financeKey);
    assert.equal(await page.evaluate(() => performance.timeOrigin), timeOrigin);
    await geometry(page);
    await screenshot(page, `doppelamt-kaemmerei-werkstatt-${width}`);
    await otherOffice(upperPost(page), treasuryTitle).click();
    await checkFocusedPost(treasuryKey);
    await screenshot(page, `doppelamt-schatzmeister-werkstatt-${width}`);
    await page.reload();
    await checkFocusedPost(treasuryKey);
    await upperPost(page).getByRole('button', { name: /Posten freigeben/ }).click();
    assert.match(await upperPost(page).innerText(), /Unbesetzt/);
    await page.keyboard.press('Escape');
    await closeOffice(page);
    const councilCard = page.locator('.council-card-shell').filter({ has: page.locator('[data-area="finanzen"]') });
    assert.match(await councilCard.innerText(), /Odyar Draig/);
    assert.equal(await otherOffice(councilCard, treasuryTitle).count(), 0);
    await page.locator('[data-action="undo"]').first().click();
    const councilLink = otherOffice(councilCard, treasuryTitle);
    await councilCard.scrollIntoViewIfNeeded();
    await screenshot(page, `doppelamt-uebersicht-werkstatt-${width}`);
    await councilLink.click();
    await checkFocusedPost(treasuryKey);

    await page.goto(serve.origin + '/Familien%20H%C3%A4user%20und%20Clans/haus.html?haus=haus-draig');
    const courtCard = page.locator('.house-court-offices .administration-role-card').filter({
      has: page.getByRole('button', { name: /^Schatzmeister · Odyar Draig/ }),
    });
    const courtLink = otherOffice(courtCard, financeTitle);
    await courtCard.scrollIntoViewIfNeeded();
    await screenshot(page, `doppelamt-hofamt-offiziell-${width}`);
    await courtLink.click();
    await checkFocusedPost(financeKey);
    report.checks.push(`Doppelamt bei ${width} px aus Rat und Hof verlinkt, Fokus und Reload im Ziel, einzeln freigegeben und zurückgenommen`);
  } finally { await context.close(); }
}

async function checkVacancyFinder(width, height) {
  const { context, page } = await contextAt(width, height, width < 400);
  try {
    await page.goto(serve.origin + pagePath);
    await page.locator('[data-action="import"]:enabled').waitFor();
    const old = { schema: 'aleria.herrschaftsplanung', version: 8, houses: Object.fromEntries(districts.map(id => [id, {
      posts: [], removed: [], applicants: [], assignments: {}, titles: {}, authorities: {},
    }])) };
    const vacancyKey = 'spionage/leitung';
    old.houses.saethwyr.assignments[vacancyKey] = 'person--haus-nachbesetzung--varn-alde';
    await page.locator('input[type="file"]').setInputFiles({
      name: 'alter-entwurf.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(old)),
    });
    await page.getByText(/Gesamtentwurf geladen/).waitFor();
    const finder = page.locator('[data-role="vacancy-finder"]');
    await finder.locator('summary').click();
    const query = finder.getByRole('searchbox');
    await query.fill('Hauptmann Arwydd');
    await finder.getByRole('combobox', { name: 'Herrschaft' }).selectOption('rhonwens-traenen');
    await finder.getByRole('combobox', { name: 'Amtsbereich' }).selectOption('militaer');
    const hits = finder.locator('[data-role="vacancy-results"] a');
    assert(await hits.count() > 0);
    assert((await hits.allTextContents()).every(text => text.includes('Haus Arwydd') && text.includes('Militär')));
    await finder.scrollIntoViewIfNeeded();
    await geometry(page);
    await screenshot(page, `freie-posten-${width}`);
    const arwyddLink = hits.first();
    const arwyddKey = new URL(await arwyddLink.getAttribute('href'), serve.origin).searchParams.get('posten');
    await arwyddLink.click();
    const arwyddPost = page.locator(`[data-action="choose-post"][data-post="${arwyddKey}"]`);
    await arwyddPost.waitFor();
    assert(await arwyddPost.evaluate(node => document.activeElement === node));
    assert.match(await page.locator('[data-role="scope-label"]').innerText(), /Haus Arwydd/i);
    await closeOffice(page);
    await finder.locator('a:focus').waitFor();
    await finder.getByRole('combobox', { name: 'Herrschaft' }).selectOption('');
    await finder.getByRole('combobox', { name: 'Amtsbereich' }).selectOption('');
    await query.fill('Schatten Haus Saethwyr');
    const result = hits.filter({ hasText: 'Nachbesetzung nötig' });
    await result.press('Enter');
    const target = upperPost(page).locator('[data-action="choose-post"]');
    await target.waitFor();
    assert.equal(await target.getAttribute('data-post'), vacancyKey);
    assert.match(await target.innerText(), /Varn Alde\s+Nachbesetzung nötig/);
    assert.equal(await target.getAttribute('data-drag-person'), null);
    assert(await target.evaluate(node => document.activeElement === node));
    await screenshot(page, `nachbesetzung-${width}`);
    await search(page).fill('Imogen Saethwyr');
    await candidate(page, 'Imogen Saethwyr').click();
    await target.click();
    assert.match(await target.innerText(), /Imogen Saethwyr/);
    await closeOffice(page);
    assert.equal(await result.count(), 0);
    const focus = await query.evaluate(node => (document.activeElement === node ? null : document.activeElement?.outerHTML.slice(0, 250)));
    assert.equal(focus, null, `Focus after replacing a vacancy at ${width} px`);
    await page.locator('[data-action="undo"]').first().click();
    await result.waitFor();
    await page.goto(serve.origin + pagePath + '?haus=gwendolyns-ufer&amt=militaer&posten=militaer%2Fwacht-morlan');
    const morlan = page.locator(`[data-drop-post="${lehenswartKey('Tŵr Morlan')}"]`);
    assert.match(await morlan.innerText(), /Hauptmann und Verwalter von Tŵr Morlan[\s\S]*Cadfan Trydar/);
    assert(await morlan.locator('[data-action="choose-post"]').evaluate(node => document.activeElement === node));
    await screenshot(page, `hauptmann-und-verwalter-${width}`);
    report.checks.push(`Freie Posten, direkte Treffer, Altimport, Nachbesetzung und alter Morlan-Link bei ${width} px`);
  } finally { await context.close(); }
}

try {
  browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_EXECUTABLE || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
  });
  for (const [width, height] of [[1440, 940], [390, 844], [320, 700]]) await checkVacancyFinder(width, height);
  for (const [width, height] of [[1440, 940], [390, 844], [320, 700]]) await checkAppointments(width, height);
  for (const [width, height] of [[1440, 940], [390, 844], [320, 700]]) await checkLocalAuthorities(width, height);
  for (const [width, height] of [[1440, 940], [390, 844], [320, 700]]) await reviseOfficeTitles(width, height);
  await desktop();
  await mobile(390, 844);
  await mobile(320, 700);
  report.checks.push('Stammbäume prüfen den regionalen Einstieg, explizites Einblenden und sichtbare Auswahlbestätigung.');
  await aldingen();
  assert.deepEqual(report.errors, []);
  assert.deepEqual(report.httpErrors, []);
  report.status = 'passed';
} catch (error) {
  report.status = 'failed';
  report.failure = error.stack;
  throw error;
} finally {
  await browser?.close();
  await serve.close();
  await writeFile(join(output, 'browser-report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(output);
}
