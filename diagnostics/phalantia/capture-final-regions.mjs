/** Bounded final caption/viewport capture after the complete interaction review. */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {REGION_SHIELDS} from '../../Vorschau/Phalantia/region-shield-data.mjs';

const require = createRequire('C:/Users/fhg_r/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium} = require('playwright');
const output = new URL('./house-regions-review/',import.meta.url);
const browser = await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const report = {status:'running',scope:'Final geographic caption update; prior full interaction proof is browser-review.json',captures:[]};
try {
  for (const [label,viewport,isMobile] of [['desktop',{width:1440,height:1000},false],['mobile',{width:390,height:844},true]]) {
    const context = await browser.newContext({viewport,isMobile,hasTouch:isMobile});
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:8897/Vorschau/Phalantia/',{waitUntil:'networkidle'});
    await page.screenshot({path:fileURLToPath(new URL(`page-top-${label}.png`,output))});
    const shield = REGION_SHIELDS.find(row => row.regionId === 'seat-milinthos');
    await page.locator(`[data-art-kind="region"][data-art-id="${shield.id}"]`).click();
    await page.waitForSelector('#art-dialog[open]');
    await page.locator('#art-dialog img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
    assert((await page.locator('#art-dialog').innerText()).includes(shield.description));
    assert(!/Alpha|keine Kronen|Hauswappentiere|PNG/i.test(await page.locator('#art-dialog').innerText()));
    await page.screenshot({path:fileURLToPath(new URL(`region-final-${label}.png`,output))});
    report.captures.push({label,viewport,regionId:shield.regionId,caption:shield.description,
      horizontalOverflow:await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)});
    await page.locator('#art-dialog [data-action="close-art"]').click();
    if (isMobile) {
      await page.locator('[data-art-kind="house"][data-art-id="house-oresthiden"]').first().click();
      await page.locator('#art-dialog img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
      await page.locator('#art-dialog figure').nth(1).scrollIntoViewIfNeeded();
      await page.screenshot({path:fileURLToPath(new URL('royal-house-mobile.png',output))});
      await page.locator('#art-dialog [data-action="close-art"]').click();
    }
    const sectionOrder = await page.locator('main > section').evaluateAll(nodes => nodes.map(node => ({id:node.id,top:Math.round(node.getBoundingClientRect().top+scrollY)})));
    assert.equal(new Set(sectionOrder.map(section => section.id)).size,sectionOrder.length);
    assert(sectionOrder.every((section,index) => index === 0 || section.top >= sectionOrder[index-1].top));
    report.captures.at(-1).sectionOrder = sectionOrder;
    await context.close();
  }
  assert(report.captures.every(capture => !capture.horizontalOverflow));
  report.status='passed';
  report.regionCatalogSha256=createHash('sha256').update(await readFile(new URL('../../Vorschau/Phalantia/region-shield-data.mjs',import.meta.url))).digest('hex');
} finally {
  await browser.close();
  await writeFile(new URL('final-region-text-review.json',output),JSON.stringify(report,null,2)+'\n');
}
console.log(JSON.stringify({status:report.status,captures:report.captures.length}));
