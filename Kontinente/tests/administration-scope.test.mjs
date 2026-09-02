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

test("Celtigerns Wacht besetzt Verbindung und Zeichen mit Iestyn und Rhiannon", async () => {
  const document = await readFile(
    new URL("../modules/administration/content/diplomatie.html", import.meta.url),
    "utf8",
  );
  const coreAreas = document.slice(document.indexOf('<b style="font-weight:bold">Gesandtschaft</b>'));
  const rows = [...coreAreas.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map(([, row]) => row);
  const cellsIn = (row) => [...row.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)].map(([, cell]) => cell);
  const portraits = cellsIn(rows[0]);
  const officeHolders = cellsIn(rows[1]);

  assert.match(portraits[3], /alt="Iestyn Swyll"[^>]+person-iestyn-swyll-r1\.webp/);
  assert.match(officeHolders[3], /Iestyn[\s\S]*Swyll/);
  assert.match(portraits[4], /alt="Rhiannon Draenmelyn"[^>]+cyJqlDG\.png/);
  assert.match(officeHolders[4], /Rhiannon[\s\S]*Draenmelyn/);
  assert.doesNotMatch(officeHolders[3] + officeHolders[4], /\?\?/);
});

test("Gwendolyns Ufer verwendet ausschließlich seine eigenen Verwaltungsdokumente", () => {
  administration.areas.forEach((area) => {
    assert.equal(
      administration.sourceFor("baronie-gwendolyns-ufer", area.id),
      `/Kontinente/modules/administration/content/gwendolyns-ufer/${area.file}`,
      area.id,
    );
  });
});

test("Gwendolyns acht Verwaltungsdokumente enthalten ihre eigenen Amtsträger", async () => {
  const expectedLeaders = {
    militaer: "Gwynnan",
    klerus: "Gwenydd",
    gerichtsbarkeit: "Lleward",
    finanzen: "Olwen",
    spionage: "Gronw",
    diplomatie: "Jeannae",
    magie: "Ceridwen",
    unterhaltung: "Jinell",
  };

  await Promise.all(administration.areas.map(async (area) => {
    const document = await readFile(
      new URL(`../modules/administration/content/gwendolyns-ufer/${area.file}`, import.meta.url),
      "utf8",
    );
    assert.match(document, new RegExp(expectedLeaders[area.id]), area.id);
    assert.doesNotMatch(document, /animexx|worldanvil/i, area.id);
  }));
});

test("untergeordnete Herrschaften erben keine Grafschaftsstruktur", () => {
  [
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
