import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";
import vm from "node:vm";

const root = resolve(import.meta.dirname, "../..");
const dataPath = resolve(
  root,
  "Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Gwynthors_Bannkreis/Gwynthor/ort.data.js"
);

async function loadGwynthorData() {
  const source = await readFile(dataPath, "utf8");
  const context = { window: {} };
  vm.runInNewContext(source, context, { filename: dataPath });
  return context.window.ORT_DATA;
}

test("Gwynthor besitzt vollständige, strukturierte Ortsinhalte", async () => {
  const data = await loadGwynthorData();
  const requiredSections = [
    "introduction",
    "background",
    "location",
    "administration",
    "conflicts",
    "history",
    "population",
    "newspaper",
    "region",
    "culture",
    "districts",
    "builtEnvironment",
    "military",
    "economy",
    "trivia"
  ];

  assert.equal(data.meta.id, "gwynthor");
  requiredSections.forEach((key) => {
    assert.ok(Array.isArray(data.sections[key]), `Abschnitt ${key} fehlt`);
    assert.ok(data.sections[key].length > 0, `Abschnitt ${key} ist leer`);
  });

  const content = JSON.stringify(data.sections);
  assert.match(content, /Áinmardh/);
  assert.match(content, /Schwarzen Zitteraale/);
  assert.match(content, /Cochllamwyr/);
  assert.match(content, /400 und 600/);
  assert.doesNotMatch(content, /im alten (?:Code|Quellcode)/i);
});

test("Gwynthors Infobox und erste Etablissements beruhen auf belegten Angaben", async () => {
  const data = await loadGwynthorData();

  assert.equal(data.structure.einwohnerzahl, "Etwa 30.000");
  assert.equal(data.structure.ortswache, "Cochllamwyr – 400 bis 600 Rotmäntel");
  assert.equal(data.features.personalitiesCollapsed, true);
  assert.deepEqual(
    Array.from(data.merchants, (merchant) => merchant.name),
    ["Celtigerns Letzte Rast", "Die Lachende Nixe", "Die Krumme Kanne"]
  );
  assert.deepEqual(
    Array.from(data.merchants, (merchant) => merchant.owner),
    ["Brenn Vann", "Albrecht Sonnenfels", "Aedan, Hrolf & Merrik"]
  );
  data.merchants.forEach((merchant) => {
    assert.match(merchant.image, /^https:\/\/i\.imgur\.com\//);
    assert.notEqual(merchant.trade, "Szene");
    assert.notEqual(merchant.trade, "Story");
    assert.notEqual(merchant.description, "…");
  });
});

test("Großstadtseite und Vorlage laden das gekapselte Inhaltsmodul", async () => {
  const [page, template, moduleSource, contentStyles] = await Promise.all([
    readFile(resolve(root, "Orte/grossstadt.html"), "utf8"),
    readFile(resolve(root, "Orte/_template/GrosseStadtTemplate.html"), "utf8"),
    readFile(resolve(root, "Orte/assets/js/orte-place-content.js"), "utf8"),
    readFile(resolve(root, "Orte/assets/css/orte-place-content.css"), "utf8")
  ]);

  for (const html of [page, template]) {
    assert.match(html, /orte-place-content\.js/);
    assert.match(html, /data-orte-content="introduction"/);
    assert.match(html, /data-orte-content="military"/);
    assert.match(html, /data-orte-personalities-content/);
  }

  assert.match(moduleSource, /aleria:orte:data-ready/);
  assert.match(moduleSource, /toggle-place-personalities/);
  assert.match(contentStyles, /data-orte-content="military"/);
  assert.match(contentStyles, /max-height:\s*23rem/);
  assert.match(contentStyles, /overflow-y:\s*auto/);
});
