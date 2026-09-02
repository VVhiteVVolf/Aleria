import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";

import { __testables as publisher } from "../../netlify/functions/world-content-publisher.mjs";

const testDirectory = dirname(fileURLToPath(import.meta.url));
const featureRoot = resolve(testDirectory, "..");
const shell = readFileSync(resolve(featureRoot, "tafel.html"), "utf8");

function registry() {
  const context = { window: {}, encodeURIComponent };
  vm.runInNewContext(readFileSync(resolve(featureRoot, "tafeln.registry.js"), "utf8"), context);
  return context.window.TafelRegistry.all();
}

test("die zentrale Shell besitzt genau eine Tafelebene", () => {
  assert.match(shell, /id="board-viewport"/);
  assert.match(shell, /id="zettel-layer"/);
  assert.match(shell, /data-action="start-add-zettel"/);
  assert.match(shell, /data-action="open-tafel-publish"/);

  for (const removedFeature of [
    "lb-pins",
    "btn-add-ort",
    "pin-layer",
    "boardimg-marker",
    "Minimap",
    "assets/js/pins",
    "assets/js/lsb",
    "board-layers.js",
  ]) {
    assert.doesNotMatch(shell, new RegExp(removedFeature, "i"));
  }
});

test("alle geladenen lokalen Skripte existieren", () => {
  const sources = [...shell.matchAll(/<script\s+src="([^"]+)"/g)]
    .map(match => match[1].split("?")[0])
    .filter(source => !source.startsWith("http") && !source.includes("${"));

  for (const source of sources) {
    assert.equal(existsSync(resolve(featureRoot, source)), true, source);
  }
});

test("Registry-Einträge verwenden nur ein Tafelbild", () => {
  for (const entry of registry()) {
    assert.equal(Object.hasOwn(entry.images || {}, "marker"), false, entry.id);
  }
});

test("alte Kartenmodule sind aus dem Anzeigetafel-Feature entfernt", () => {
  for (const relativePath of [
    "assets/js/board/board-layers.js",
    "assets/js/board/board-viewport.js",
    "assets/js/data/data-manager.js",
    "assets/js/pins/pin-board.js",
    "assets/js/pins/pin-editor.js",
    "assets/js/lsb/lsb-calculations.js",
    "_template/AnzeigetafelTemplate.html",
  ]) {
    assert.equal(existsSync(resolve(featureRoot, relativePath)), false, relativePath);
  }
});

test("Aushänge verwenden die drei Nagelvarianten mit eigener Trefferfläche", () => {
  const boardModule = readFileSync(resolve(featureRoot, "assets/js/notes/zettel-board.js"), "utf8");
  const boardStyles = readFileSync(resolve(featureRoot, "assets/css/notice-board.css"), "utf8");
  const nails = ["nail-straight.png", "nail-left.png", "nail-right.png"];

  for (const nail of nails) {
    assert.equal(existsSync(resolve(featureRoot, "assets/images/notice-pins", nail)), true, nail);
    assert.match(boardModule, new RegExp(nail.replace(".", "\\.")));
  }
  assert.match(boardStyles, /\.tafel-notice-marker\s*\{[^}]*width:\s*68px;[^}]*height:\s*68px;/s);
  assert.match(boardStyles, /\.tafel-notice-nail\s*\{[^}]*width:\s*32px;[^}]*height:\s*32px;/s);
  assert.match(boardStyles, /filter:\s*blur\(5px\)/);
  assert.doesNotMatch(boardModule, /pin-dot/);
});

test("der Publisher akzeptiert den Ein-Ebenen-Zustand", () => {
  const state = {
    schemaVersion: 2,
    zettel: [
      { id: "quest-1", typ: "quest", title: "Der verschwundene Karren", x: 0.4, y: 0.55 },
    ],
    regionTitle: "Gwynthors Anzeigetafel",
    boardImages: { board: "Bilder/GwynthorAnzeigetafel.webp" },
  };

  assert.equal(publisher.validateBoardState(state), state);
  assert.throws(() => publisher.validateBoardState({}), /zettel/i);
  assert.throws(
    () => publisher.validateBoardState({ zettel: [{ id: "kaputt", x: "links", y: 0.5 }] }),
    /id\/x\/y-Struktur/i,
  );
});
