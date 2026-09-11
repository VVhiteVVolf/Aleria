import { base, workspace, artifacts, artifact } from './browser-session.mjs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { evaluate, navigate, close } from './browser-session.mjs';
const pause = () => new Promise(resolve => setTimeout(resolve, 200));
await navigate(base + '/AleriaAlmanach/DokumentenWerkstatt.html');
await evaluate(`document.querySelector('[data-library-action="edit"][data-id="werkstatt-smoke-test"]').click()`); await pause();
await evaluate(`document.querySelector('[data-tab="library"]').click();document.querySelector('[data-library-action="publish"]').click()`); await pause();
await evaluate(`window.workshopOriginalFetch = window.fetch; window.fetch = async (url,options) => {
  if (url === '/.netlify/functions/document-publisher') return new Response(JSON.stringify({message:'Test: Revision wurde geändert.'}),{status:409,headers:{'Content-Type':'application/json'}});
  return window.workshopOriginalFetch(url,options);
};document.querySelector('[data-role="publish-key"]').value='local-test-publish-key';document.querySelector('[data-role="publish-form"]').requestSubmit();`);
await pause();
assert.equal(await evaluate(`document.querySelector('[data-role="queue-count"]').textContent`), '1 vorgemerkt');
assert.match(await evaluate(`document.querySelector('[data-role="publish-message"]').textContent`), /Revision/);
await evaluate(`window.fetch = async (url,options) => {
  if (url === '/.netlify/functions/document-publisher') {
    const body=JSON.parse(options.body); return new Response(JSON.stringify({records:body.records.map(record=>({id:record.id,revision:record.expectedRevision+1,document:record.document,updatedAt:new Date().toISOString()}))}),{headers:{'Content-Type':'application/json'}});
  }
  return window.workshopOriginalFetch(url,options);
};document.querySelector('[data-role="publish-form"]').requestSubmit();`);
await pause();
assert.equal(await evaluate(`document.querySelector('[data-role="queue-count"]').textContent`), '0 vorgemerkt');
assert.equal(await evaluate(`document.querySelector('[data-role="publish-key"]').value`), '');
assert.equal(await evaluate(`JSON.stringify(localStorage).includes('local-test-publish-key')`), false);
await evaluate(`document.querySelector('[data-role="publish-close"]').click();document.querySelector('[data-library-action="link"][data-id="werkstatt-smoke-test"]').click()`); await pause();
assert.match(await evaluate(`document.querySelector('[data-role="document-link"]').value`), /dokument.html\?id=werkstatt-smoke-test/);
await evaluate(`window.fetch = window.workshopOriginalFetch; delete window.workshopOriginalFetch;`);
console.log('Publication UI preserves queue on conflict, acknowledges success, clears secret and exposes stable link. No external writes.');
close();
