import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { pathToFileURL } from "node:url";
import { getNewspaperEntriesForPlace } from "../../Zeitungen/assets/js/newspaper-registry.mjs";

const root = path.resolve(import.meta.dirname, "../..");
const ids = ["twr-brynmawr", "mwyncreig", "craithglyn", "lysfaen", "bronhir"];

function loadPlace(id) {
  const context = vm.createContext({ window: {}, encodeURI, encodeURIComponent });
  for (const filename of ["js/world-content/celtigerns-wacht-places.js", "Orte/orte.registry.js"]) {
    vm.runInContext(fs.readFileSync(path.join(root, filename), "utf8"), context);
  }
  const entry = context.window.ORTE_REGISTRY.find((item) => item.id === id);
  context.window.ORTE_CONFIG = { registryEntry: entry };
  vm.runInContext(fs.readFileSync(path.join(root, "Orte", entry.data.split("?")[0]), "utf8"), context);
  return context.window.ORT_DATA;
}

function assertLocalAsset(href) {
  assert.ok(href.startsWith("/"), href);
  assert.ok(fs.existsSync(path.join(root, decodeURI(href))), href);
}

for (const id of ids) {
  test(`${id}: importierte Ortsdaten behalten nur erlaubte Personengruppen und einen Tafelplatzhalter`, async () => {
    const data = loadPlace(id);
    assert.equal(data.meta.id, id);
    assert.equal(data.features.noticeBoard, true);
    assert.equal(data.noticeBoardMap, undefined);
    assert.deepEqual(Array.from(data.personalities, (group) => group.title), ["Administration & Verwaltung", "Aufgebot", "Sonstige"]);
    assert.doesNotMatch(JSON.stringify(data), /Titel hier einfügen|Dialog von Figur|tumblr_otwjgn7mfU1|worldanvil\.com/);
    assertLocalAsset(data.presentation.images["bild-einer-stadtwache-png"].src);
    assertLocalAsset(data.presentation.images["karten-bild-png"].src);
    data.personalities.flatMap((group) => group.items).forEach((person) => {
      if (person.portrait) assertLocalAsset(person.portrait);
    });
    data.houses.flatMap((group) => group.items).forEach((house) => {
      if (house.emblem) assertLocalAsset(house.emblem);
    });

    const newspapers = getNewspaperEntriesForPlace(id);
    assert.deepEqual(newspapers.map((entry) => entry.titleId), ["celtigerns-echo", "schwarzbote"]);
    for (const entry of newspapers) {
      const modulePath = path.join(root, entry.dataModule.split("?")[0]);
      const { default: issue } = await import(pathToFileURL(modulePath));
      assert.equal(issue.placeId, id);
      assert.equal(issue.authors.length, 8);
      assert.ok(issue.authors.every((author) => author.name === "..." || author.name.startsWith("Freie Autorenstelle")));
    }
  });
}

test("Llysfaen und Craithglyn bewahren die Originaltexte ohne ausgelassene Personenkategorien einzuschleusen", () => {
  const llysfaen = loadPlace("lysfaen");
  const craithglyn = loadPlace("craithglyn");
  assert.equal(llysfaen.structure.einwohnerzahl, "etwa 900");
  assert.equal(craithglyn.structure.einwohnerzahl, "etwa 750");
  assert.match(JSON.stringify(llysfaen.sections), /Sorgen am Tresen/);
  assert.match(JSON.stringify(llysfaen.sections), /Hochzeit von Prinz Tudwal Draig/);
  const names = llysfaen.personalities.flatMap((group) => Array.from(group.items, (person) => person.name));
  assert.ok(names.includes("Brinthan Argall"));
  assert.ok(names.includes("Gwydion Rhyddid"));
  assert.ok(names.includes("Sir Nedri Tlawd"));
  assert.ok(!names.includes("Bedwyr Jernigan"));
  assert.ok(!names.includes("Malwyn Brogar"));
  assert.deepEqual(Object.keys(loadPlace("mwyncreig").sections), ["newspaper"]);
  assert.deepEqual(Object.keys(loadPlace("bronhir").sections), ["newspaper"]);
});
