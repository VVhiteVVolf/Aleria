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

test("Abergwint besitzt getrennte Stadt- und Bannkreiskarten im Karten-System", () => {
  const window = loadMaps();
  const prefix = "cenyr-celtigerns-wacht-gwendolyns-ufer-abergwint";
  const city = window.KartoMapRegistry.byId(`${prefix}-stadtkarte`);
  const region = window.KartoMapRegistry.byId(`${prefix}-bannkreis`);

  assert.ok(city);
  assert.ok(region);
  assert.deepEqual(Object.keys(city.images), ["normal"]);
  assert.deepEqual(Object.keys(region.images), ["normal", "regions", "pins"]);
  Object.values(city.images).forEach(assertMapAsset);
  Object.values(region.images).forEach(assertMapAsset);

  const cityDominions = window.KartoDominionPresets.forMap(city.id);
  const regionDominions = window.KartoDominionPresets.forMap(region.id);
  assert.equal(cityDominions.length, 13);
  assert.deepEqual(cityDominions, regionDominions);
  assert.equal(cityDominions[0].name, "Baronie Gwendolyns Ufer");
});

function assertMapAsset(relativePath) {
  const assetPath = path.join(projectRoot, "Karten", ...relativePath.split("/"));
  assert.equal(fs.existsSync(assetPath), true, `${relativePath} fehlt`);
}
