/** Final text-only revision: verify the proposed Agoge kinship rule and capture current layouts. */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const require = createRequire('C:/Users/fhg_r/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium} = require('playwright');
const root = new URL('./',import.meta.url),url = 'http://127.0.0.1:8897/Vorschau/Phalantia/';
const prior = JSON.parse(await readFile(new URL('browser-review.json',root),'utf8'));
assert.equal(prior.status,'passed');
const browser = await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const captures = [];
try {
  for (const [name,viewport] of [['desktop',{width:1440,height:1000}],['mobile',{width:390,height:844}]]) {
    const context = await browser.newContext({viewport});
    const page = await context.newPage();
    await page.goto(url,{waitUntil:'networkidle'});
    const marriage = page.locator('#eheordnung');
    await marriage.getByText('Eidverwandtschaft der Agoge',{exact:true}).waitFor();
    assert.match(await marriage.innerText(),/Vorschlag zur Ausgestaltung/i);
    assert.match(await marriage.innerText(),/keine biologische Verwandtschaft/);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),false);
    const file = `final-context-${name}.png`;
    await marriage.screenshot({path:fileURLToPath(new URL(file,root))});
    captures.push({viewport,file,proposalLabelPresent:true,eidKinshipPresent:true,noBiologicalKinshipClaim:true,horizontalOverflow:false});
    await context.close();
  }
} finally { await browser.close(); }
const contextSha256 = createHash('sha256').update(await readFile(new URL('../../Vorschau/Phalantia/realm-context.mjs',root))).digest('hex');
await writeFile(new URL('final-context-review.json',root),JSON.stringify({checkedAt:new Date().toISOString(),status:'passed',scope:'Text-only addition after complete desktop/mobile interaction pass',priorBrowserReview:'browser-review.json',realmContextSha256:contextSha256,captures},null,2)+'\n');
console.log(JSON.stringify({status:'passed',viewports:captures.length,priorFullBrowserReview:'passed'}));
