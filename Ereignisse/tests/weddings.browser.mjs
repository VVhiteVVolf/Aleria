import assert from 'node:assert/strict';
import { readFile, mkdir } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.CALENDAR_TEST_ORIGIN || 'http://127.0.0.1:5500';
const base = `${origin}${process.env.CALENDAR_PATH_PREFIX || ''}`;
const screenshots = process.env.WEDDING_SCREENSHOTS;
if (screenshots) await mkdir(screenshots,{recursive:true});
const seed = JSON.parse(await readFile(new URL('../Hochzeiten/data/tudwal-revelyn.json',import.meta.url),'utf8'));
const browser = await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE});
const context = await browser.newContext({viewport:{width:1440,height:1050}});
await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
const page = await context.newPage(), errors = [], missing = [];
page.on('pageerror',error => errors.push(error.message));
page.on('response',response => { if (response.status() === 404 && !response.url().includes('/data/probefest.json')) missing.push(response.url()); });
const dialog = page.locator('[data-wedding-dialog]');
const save = async () => { await dialog.locator('[type=submit]').click(); await dialog.waitFor({state:'hidden'}); };
const openEntry = async list => { await page.locator(`[data-wedding-action="add-entry"][data-list="${list}"]`).click(); await dialog.waitFor({state:'visible'}); };
try {
  await page.goto(`${base}/Ereignisse/Hochzeiten/Haus-Draig-und-Penderyn.html`);
  await page.locator('.wedding-cover').waitFor();
  assert.equal(await page.locator('[data-guest-id]').count(),39);
  assert.equal(await page.locator('table').count(),0);
  assert.equal(await page.locator('#gaestebuch [data-wedding-portrait]').count(),43);
  for (const portrait of await page.locator('#gaestebuch [data-wedding-portrait]').all()) {
    await portrait.scrollIntoViewIfNeeded();
    await page.waitForFunction(image => image.complete && image.naturalWidth > 0,await portrait.elementHandle());
    await portrait.evaluate(image => image.decode());
    assert.equal(await portrait.evaluate(image => getComputedStyle(image.parentElement).borderRadius),'50%');
  }
  await page.evaluate(() => scrollTo(0,0));
  for (const image of await page.locator('.wedding-cover img').all()) await image.evaluate(node => node.decode());
  for (const width of [1440,768,390,320]) {
    await page.setViewportSize({width,height:1050});
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),false,`overflow at ${width}`);
    if (screenshots && [1440,390].includes(width)) await page.screenshot({path:`${screenshots}/hochzeit-${width}.png`});
  }
  await page.setViewportSize({width:1440,height:1050});
  if (screenshots) {
    await page.locator('#gaestebuch').evaluate(node => node.scrollIntoView({block:'start'}));
    await page.screenshot({path:`${screenshots}/gaestebuch.png`});
  }
  await page.locator('[data-wedding-search]').fill('magischer abakus');
  assert.equal(await page.locator('[data-guest-id]').count(),1);
  assert.match(await page.locator('[data-guest-id]').innerText(),/Rhiannon/);
  await page.locator('[data-wedding-search]').fill('');
  await page.locator('[data-wedding-group]').selectOption('house-two');
  assert.equal(await page.locator('[data-guest-id]').count(),7);
  await page.locator('[data-wedding-group]').selectOption('all');
  await page.getByRole('button',{name:'Seite bearbeiten',exact:true}).click();
  await page.locator('[data-guest-id="house-one-rhiannon"] button').click();
  await dialog.locator('[name=gift]').fill('Magischer Abakus\nMit handgeschriebener Widmung und vollständiger Erläuterung.');
  await dialog.locator('[name=giftStatus]').selectOption('received');
  await dialog.locator('[name=attendance]').selectOption('confirmed');
  assert.equal(await dialog.locator('[data-portrait-name]').inputValue(),'Rhiannon Draig');
  await save();
  assert.match(await page.locator('[data-guest-id="house-one-rhiannon"]').innerText(),/handgeschriebener Widmung/);
  assert.match(await page.locator('#gaben').innerText(),/handgeschriebener Widmung/);
  await page.reload();
  await page.locator('[data-guest-id="house-one-rhiannon"]').waitFor();
  assert.match(await page.locator('[data-guest-id="house-one-rhiannon"]').innerText(),/Überreicht/);
  assert.equal(await page.locator('[data-guest-id="house-one-rhiannon"] [data-wedding-portrait]').count(),1);
  await page.getByRole('button',{name:'Seite bearbeiten',exact:true}).click();
  await openEntry('guests');
  await page.setViewportSize({width:320,height:900});
  assert.equal(await dialog.evaluate(node => node.scrollWidth > node.clientWidth),false,'mobile editor has no horizontal overflow');
  await page.setViewportSize({width:1440,height:1050});
  await dialog.locator('[name=name]').fill('Die neue Delegation');
  await dialog.locator('[name=group]').selectOption('delegations');
  await dialog.locator('[name=count]').fill('12');
  await dialog.locator('[name=task]').fill('Empfang der Gäste');
  await dialog.locator('[name=leader]').fill('Lady Branwen');
  await dialog.locator('[name=emblem]').fill('assets/weddings/tudwal-revelyn/haus-draig.png');
  await dialog.getByRole('button',{name:'+ Porträt hinzufügen'}).click();
  await dialog.locator('[data-portrait-name]').fill('Lady Branwen');
  await dialog.locator('[data-portrait-image]').fill('assets/weddings/tudwal-revelyn/hochzeitsmotiv.png');
  await dialog.locator('[data-portrait-position]').selectOption('center');
  await save();
  assert.equal(await page.locator('[data-guest-id]').count(),40);
  assert.match(await page.locator('[data-guest-group=delegations]').innerText(),/12 Personen/i);
  assert.match(await page.locator('[data-guest-group=delegations]').innerText(),/Lady Branwen/);
  await page.locator('[data-guest-group=delegations] img').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => { const image = document.querySelector('[data-guest-group=delegations] img'); return image?.complete && image.naturalWidth > 0; });
  await page.locator('[data-guest-group=delegations] img').evaluate(image => image.decode());
  await page.locator('[data-guest-group=delegations] button').click();
  await dialog.getByRole('button',{name:'Eintrag entfernen',exact:true}).click();
  await dialog.getByRole('button',{name:'Entfernen bestätigen',exact:true}).click();
  await dialog.waitFor({state:'hidden'});
  assert.equal(await page.locator('[data-guest-id]').count(),39);
  for (const title of ['Zusätzlicher Test: Trauung','Zusätzlicher Test: Empfang']) {
    await openEntry('schedule'); await dialog.locator('[name=title]').fill(title);
    await dialog.locator('[name=time]').fill('15:30'); await dialog.locator('[name=description]').fill('Vollständige Beschreibung dieses Programmpunktes.'); await save();
  }
  await page.getByRole('button',{name:'Zusätzlicher Test: Empfang nach oben'}).click();
  assert.deepEqual((await page.locator('.wedding-schedule h3').allInnerTexts()).slice(-2),['Zusätzlicher Test: Empfang','Zusätzlicher Test: Trauung']);
  await page.locator('[data-wedding-task=termin]').check();
  assert.equal(await page.locator('[data-wedding-task=termin]').isChecked(),true);
  await openEntry('tasks'); await dialog.locator('[name=title]').fill('Gäste begrüßen'); await dialog.locator('[name=owner]').fill('Revelyn'); await save();
  await page.getByRole('button',{name:'Brautpaar & Eckdaten bearbeiten'}).click();
  await dialog.locator('[name=year]').fill('1741'); await dialog.locator('[name=month]').selectOption('13');
  await dialog.locator('[name=day]').fill('36'); await dialog.locator('[name=time]').fill('15:30');
  await dialog.locator('[name=status]').selectOption('scheduled'); await save();
  const dateLink = await page.getByRole('link',{name:'Im Kalender ansehen'}).getAttribute('href');
  assert.match(dateLink,/year=1741&month=13&date=36/);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button',{name:'Exportieren'}).click();
  const download = await downloadPromise;
  const exported = JSON.parse(await readFile(await download.path(),'utf8'));
  assert.equal(exported.wedding.guests.length,39); assert.equal(exported.wedding.schedule.length,seed.wedding.schedule.length + 2);

  let online = seed, requests = [], fail = true;
  await context.route('**/.netlify/functions/wedding-publisher**', async route => {
    const request = route.request();
    if (request.method() === 'GET') return route.fulfill({json:online});
    requests.push({body:request.postDataJSON(),key:request.headers().authorization});
    if (fail) return route.fulfill({status:409,json:{message:'Eine neuere Fassung liegt auf GitHub. Der Entwurf bleibt erhalten.'}});
    online = {...seed,revision:2,wedding:request.postDataJSON().wedding};
    return route.fulfill({json:{envelope:online,commitSha:'test',commitUrl:'https://github.com/test/repo/commit/test'}});
  });
  await page.getByRole('button',{name:'Veröffentlichen',exact:true}).click();
  assert.match(await dialog.innerText(),/Gästebuch: 0 neu, 1 geändert/);
  await dialog.locator('[name=publishKey]').fill('browser-only-key');
  await dialog.getByRole('button',{name:'Auf GitHub veröffentlichen'}).click();
  await dialog.locator('[data-dialog-status]:visible').waitFor();
  assert.match(await dialog.innerText(),/neuere Fassung/);
  assert.equal(await page.locator('[data-guest-id]').count(),39);
  fail = false; await save();
  assert.match(await page.locator('.wedding-workbar').innerText(),/Veröffentlichte Fassung/);
  assert.equal(requests.length,2); assert.equal(requests[1].body.expectedRevision,1);
  assert.equal(requests[1].key,'Bearer browser-only-key');
  assert.equal(await page.evaluate(() => JSON.stringify(localStorage).includes('browser-only-key')),false);
  await page.reload(); await page.locator('.wedding-cover').waitFor();
  assert.match(await page.locator('.wedding-workbar').innerText(),/Fassung 2/);
  assert.match(await page.locator('[data-guest-id="house-one-rhiannon"]').innerText(),/Widmung/);
  await page.getByRole('button',{name:'Seite bearbeiten',exact:true}).click();
  await page.locator('[data-wedding-task=termin]').uncheck();
  await page.getByRole('button',{name:'Lokalen Entwurf verwerfen'}).click(); await save();
  assert.equal(await page.locator('[data-wedding-task=termin]').isChecked(),true);
  await page.getByRole('button',{name:'Online-Fassung laden'}).click(); await save();
  assert.match(await page.locator('.wedding-workbar').innerText(),/Fassung 2/);

  // Exact calendar navigation and direct return to the current wedding page.
  await page.goto(dateLink);
  await page.locator('[data-calendar-day-title]').waitFor();
  assert.equal(await page.locator('[data-calendar-year]').inputValue(),'1741');
  assert.match(await page.locator('[data-calendar-heading]').innerText(),/Jahrswend/);
  assert.match(await page.locator('[data-calendar-day-title]').innerText(),/^36\./);
  if (seed.wedding.date.year && seed.wedding.date.year !== 1741) {
    await page.locator('[data-calendar-year]').fill(String(seed.wedding.date.year));
    await page.locator('[data-calendar-year]').press('Tab');
  }
  await page.locator('[data-calendar-weddings] h3').waitFor();
  await page.locator('[data-calendar-weddings] h3 a').click();
  await page.locator('.wedding-cover').waitFor();
  await page.goto(`${base}/Ereignisse/hochzeit.html`);
  await page.locator('.wedding-registry-grid a').waitFor();
  await page.getByRole('link',{name:'Neue Hochzeit vorbereiten'}).click();
  await dialog.waitFor({state:'visible'});
  await dialog.locator('[name=id]').fill('probefest');
  await dialog.locator('[name=title]').fill('Das neue Probefest');
  await dialog.locator('[name=name0]').fill('Anna'); await dialog.locator('[name=name1]').fill('Owain');
  await save();
  assert.match(page.url(),/hochzeit.html\?id=probefest/);
  assert.equal(await page.locator('[data-guest-id]').count(),0);
  await openEntry('guests'); await dialog.locator('[name=name]').fill('Ein neuer Gast'); await save();
  await page.reload(); await page.locator('.wedding-cover').waitFor();
  assert.equal(await page.locator('[data-guest-id]').count(),1);
  assert.match(await page.locator('#wedding-title').innerText(),/Anna/);
  await page.goto(`${base}/Ereignisse/index.html`);
  await page.locator('[data-wedding-register-preview] h3 a').waitFor();
  await page.locator('[data-wedding-register-preview] h3 a').click();
  await page.locator('.wedding-cover').waitFor();
  assert.equal(await page.locator('[data-guest-id]').count(),39);
  assert.deepEqual(errors,[]); assert.deepEqual(missing,[]);
  console.log('Hochzeit: Originalinhalte, Desktop/Mobil, Gäste/Gaben/Delegationen, Ablauf, Aufgaben, Entwürfe, Export, Veröffentlichung und Konflikt, Vorlage, Registry sowie Kalender-Rückweg bestanden.');
} catch (error) {
  console.error('Wedding browser failure:',{url:page.url(),errors,missing,portraits:await page.locator('[data-guest-group=delegations] img').evaluateAll(images => images.map(image => ({src:image.src,complete:image.complete,width:image.naturalWidth})))});
  throw error;
} finally { await context.close(); await browser.close(); }
