import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import test from "node:test";
import { normalizeMilitaryProfile } from "../modules/military/military-profile.mjs";

const root = path.resolve(import.meta.dirname, "../..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const context = vm.createContext({ window: {}, encodeURI, encodeURIComponent });
vm.runInContext(read("js/world-content/celtigerns-wacht-places.js"), context);
vm.runInContext(read("Orte/orte.registry.js"), context);
const entry = context.window.ORTE_REGISTRY.find((item) => item.id === "lysfaen");
vm.runInContext(read(`Orte/${entry.data.split("?")[0]}`), context);
const data = context.window.ORT_DATA;

function assetExists(url) {
  assert.ok(fs.existsSync(path.join(root, url.replace(/^\//, ""))), url);
}

test("Llysfaens Ortsbesatzung bleibt von den variablen Außenposten getrennt", () => {
  const profile = normalizeMilitaryProfile(data.militaryView);
  assert.equal(profile.total, 26);
  assert.deepEqual(Array.from(profile.forces, (force) => force.count), [15, 10, 1]);
  assert.equal(profile.forces.reduce((sum, force) => sum + force.count, 0), profile.total);
  assert.match(data.structure.einwohnerzahl, /900 im Ort/);
  assert.match(data.structure.ortswache, /^15/);
  assert.match(data.structure.waffenknechte, /^10/);
  assert.equal(profile.sections.length, 6);
  assetExists(profile.heroImage.src);
  const progression = profile.sections.find((section) => section.image.src);
  assert.ok(progression.caption);
  assetExists(progression.image.src);
});

test("Stadtkarte bietet 24 Platzhalter auf den Symbolen der Markierungen-Ebene", () => {
  vm.runInContext(read("Karten/karten.registry.js"), context);
  const map = context.window.KartoMapRegistry.byId("cenyr-celtigerns-wacht-llamrais-ankunft-wyrm-llysfaen-stadtkarte");
  const { state } = JSON.parse(read(`Karten/${map.dataPath}`));
  assert.equal(state.pins.length, 24);
  assert.equal(new Set(state.pins.map((pin) => pin.id)).size, 24);
  const categories = new Set(state.cats.map((category) => category.id));
  for (const pin of state.pins) {
    assert.ok(pin.x > 0 && pin.x < 1 && pin.y > 0 && pin.y < 1, pin.title);
    assert.ok(categories.has(pin.cat), pin.title);
    assert.ok(pin.title);
    assert.equal(pin.pinMarker, "", "Keine doppelten Symbolbilder über der beschrifteten Karte");
    assert.equal(pin.text, "", "Vorbereitete Tabellen benötigen keine erfundenen Beschreibungstexte");
  }
  assetExists(`Karten/${map.images.normal}`);
  assetExists(`Karten/${map.images.pins}`);
  assert.deepEqual(Object.keys(map.images), ["normal", "pins"]);
  assert.deepEqual(state.extraLayers, [], "Keine dritte Ebene für die Vorlage");
  const garrison = state.pins.find((pin) => pin.id === "llysfaen-garnison");
  assert.ok(Math.abs(garrison.x - 632 / 1881) < 0.000001);
  assert.ok(Math.abs(garrison.y - 571 / 1344) < 0.000001);
  for (const [id, x, y] of [["klerus", 234, 681], ["schneider", 280, 490], ["gerberei", 82, 1003]]) {
    const pin = state.pins.find((entry) => entry.id === `llysfaen-${id}`);
    assert.ok(Math.abs(pin.x - x / 1881) < 0.000001);
    assert.ok(Math.abs(pin.y - y / 1344) < 0.000001);
  }
});

test("Llysfaens Ortsseite bindet die eigene Tafel mit vorhandenem Bild ein", () => {
  vm.runInContext(read("Anzeigetafeln/tafeln.registry.js"), context);
  const board = context.window.TafelRegistry.byId(data.noticeBoardMap.mapId);
  assert.equal(board.status, "active");
  assert.equal(data.noticeBoardMap.embedHref, `/Anzeigetafeln/${board.link}`);
  assetExists(`Anzeigetafeln/${board.images.board}`);
  vm.runInContext(read(`Anzeigetafeln/${board.config}`), context);
  assert.equal(`${board.folder}/${context.window.TAFEL_CONFIG.images.board}`, board.images.board);
});

test("Optionale Militärabschnitte behandeln leere und ungültige Angaben stabil", () => {
  assert.deepEqual(normalizeMilitaryProfile().sections, []);
  const profile = normalizeMilitaryProfile({ sections: [null, "ignored", { title: "  Dienst  ", paragraphs: [" Wache ", null, ""], image: "/bild.webp" }] });
  assert.equal(profile.sections.length, 1);
  assert.equal(profile.status, "ready");
  assert.equal(profile.sections[0].title, "Dienst");
  assert.deepEqual(profile.sections[0].paragraphs, ["Wache"]);
  assert.equal(profile.sections[0].image.src, "/bild.webp");
  assert.ok(Object.isFrozen(profile.sections[0].paragraphs));
});
