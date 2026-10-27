import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Script} from 'node:vm';
test('Die einzelne HTML-Datei enthält alle Laufzeitressourcen und syntaktisch gültiges JavaScript',async()=>{
  const html=await readFile(new URL('../Ideenwerk.html',import.meta.url),'utf8');
  assert.equal([...html.matchAll(/<script\b/g)].length,1);
  const script=html.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];assert.ok(script);
  assert.doesNotThrow(()=>new Script(script));
  assert.ok(!/<script[^>]+src=/.test(html));assert.ok(!/<link[^>]+stylesheet/.test(html));
  assert.ok(!/<(?:img|script)[^>]+src="(?:https?:|\.\/)/.test(html));
  assert.equal([...html.matchAll(/<style>/g)].length,4);
  assert.match(html,/data:image\/svg\+xml;base64,/);
  assert.ok(!/from\s+['"]\.\.?\//.test(script));
});
