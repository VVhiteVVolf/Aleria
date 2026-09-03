import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "../..");

test("Großstadtseite und Vorlage binden den modularen Pressewechsler ein", async () => {
  const [page, template, moduleSource, styles] = await Promise.all([
    readFile(resolve(root, "Orte/grossstadt.html"), "utf8"),
    readFile(resolve(root, "Orte/_template/GrosseStadtTemplate.html"), "utf8"),
    readFile(resolve(root, "Orte/assets/js/orte-place-press.mjs"), "utf8"),
    readFile(resolve(root, "Orte/assets/css/orte-place-press.css"), "utf8")
  ]);

  for (const html of [page, template]) {
    assert.match(html, /orte-place-press\.css/);
    assert.match(html, /orte-place-press\.mjs\?v=fluesterfaecher-20260904a/);
    assert.match(html, /celtigerns-wacht-places\.js\?v=fluesterfaecher-20260904a/);
    assert.match(html, /data-orte-press-switcher/);
    assert.match(html, /data-orte-press-fallback/);
  }

  assert.match(moduleSource, /getNewspaperEntriesForPlace/);
  assert.match(moduleSource, /newspaper-registry\.mjs\?v=20260904c/);
  assert.match(moduleSource, /findDefaultNewspaperEntryForPlace/);
  assert.match(moduleSource, /previous-newspaper/);
  assert.match(moduleSource, /next-newspaper/);
  assert.match(moduleSource, /getLatestIssueEntry/);
  assert.doesNotMatch(moduleSource, /onclick\s*=|onchange\s*=/i);
  assert.match(styles, /\.orte-press-switcher/);
  assert.match(styles, /\.orte-press-cover/);
  assert.match(styles, /width:\s*min\(calc\(100%\s*-\s*20px\),\s*480px\)/);
  assert.match(styles, /aspect-ratio:\s*8\s*\/\s*5/);
  assert.match(styles, /inset:\s*14px\s+18px/);
  assert.match(styles, /object-fit:\s*contain/);
});
