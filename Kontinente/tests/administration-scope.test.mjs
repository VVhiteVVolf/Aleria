import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import { readFile } from "node:fs/promises";

const source = await readFile(
  new URL("../modules/administration/administration-content.js", import.meta.url),
  "utf8",
);
const context = { window: {} };
vm.runInNewContext(source, context);
const administration = context.window.ALERIA_ADMINISTRATION_CONTENT;

test("Celtigerns Wacht behält seine eigenen Verwaltungsdokumente", () => {
  assert.equal(
    administration.sourceFor("grafschaft-celtigerns-wacht", "militaer"),
    "/Kontinente/modules/administration/content/militaer.html",
  );
});

test("untergeordnete Herrschaften erben keine Grafschaftsstruktur", () => {
  [
    "baronie-gwendolyns-ufer",
    "baronie-arthus-streben",
    "herrschaft-gafyr",
    "herrschaft-wyrm",
    "herrschaft-saethwyr",
    "herrschaft-rhonwens-traenen",
    "insel-camruisge",
  ].forEach((scopeId) => {
    administration.areas.forEach((area) => {
      assert.equal(administration.sourceFor(scopeId, area.id), "", `${scopeId}/${area.id}`);
    });
  });
});
