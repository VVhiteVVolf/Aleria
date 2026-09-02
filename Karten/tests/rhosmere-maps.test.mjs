import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(fileURLToPath(new URL("../..", import.meta.url)));
const registrySource = fs.readFileSync(path.join(projectRoot, "Karten/karten.registry.js"), "utf8");
const dominionSource = fs.readFileSync(
  path.join(projectRoot, "Karten/assets/js/data/celtigerns-wacht-dominions.js"),
  "utf8"
);

function loadMaps() {
  const context = { encodeURIComponent, window: {} };
  vm.createContext(context);
  vm.runInContext(registrySource, context);
  vm.runInContext(dominionSource, context);
  return context.window;
}

test("Rhosmere besitzt einen dreistufigen Bannkreis ohne erfundenen Stadtplan", () => {
  const window = loadMaps();
  const prefix = "cenyr-celtigerns-wacht-arthus-streben-rhosmere";
  const city = window.KartoMapRegistry.byId(`${prefix}-stadtkarte`);
  const region = window.KartoMapRegistry.byId(`${prefix}-bannkreis`);

  assert.equal(city, null);
  assert.ok(region);
  assert.equal(region.layerNames.normal, "Normal");
  assert.equal(region.layerNames.regions, "Zonen");
  assert.equal(region.layerNames.pins, "Markierungen");
  assert.deepEqual(Object.keys(region.images), ["normal", "regions", "pins"]);
  Object.values(region.images).forEach(assertMapAsset);

  const dominions = window.KartoDominionPresets.forMap(region.id);
  assert.equal(dominions.length, 11);
  assert.equal(dominions[0].name, "Baronie Arthus Streben");
  assert.deepEqual(Array.from(dominions.slice(1), (entry) => entry.name), [
    "Haus Almarch",
    "Haus Brinmarch",
    "Haus Gwardin",
    "Haus Tirwyn",
    "Haus Eirfael",
    "Haus Ghorswyn",
    "Haus Coedvarn",
    "Haus Althin",
    "Haus Talmeirch",
    "Haus Gwynrhos"
  ]);
});

function assertMapAsset(relativePath) {
  const assetPath = path.join(projectRoot, "Karten", ...relativePath.split("/"));
  assert.equal(fs.existsSync(assetPath), true, `${relativePath} fehlt`);
}
