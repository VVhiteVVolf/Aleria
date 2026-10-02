import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

for (const kind of ["map", "board"]) {
  test(`${kind}: only public entries cross the embed boundary and only the parent can open them`, () => {
    const listeners = new Map();
    const sent = [];
    const opened = [];
    const state = kind === "map"
      ? { pins: [{ id: "public", title: "Market" }, { id: "secret", title: "Hidden", secret: true }], cats: [] }
      : { zettel: [{ id: "public", title: "Market", typ: "notiz", text: "Goods", table: [{ k: "Ort", v: "Hafen" }], artikel: [{ titel: "Fest", text: "Musik" }] }, { id: "secret", title: "Hidden", secret: true }] };
    const parent = { postMessage: (payload, origin) => sent.push({ payload, origin }) };
    const window = {
      parent,
      location: { origin: "https://aleria.example" },
      addEventListener: (type, callback) => listeners.set(type, callback),
      KARTO_CONFIG: { mapId: "example" },
      TAFEL_CONFIG: { boardId: "example" },
      KartoRuntime: { state: () => state, jumpToPin() {}, openPin: id => opened.push(id) },
      TafelRuntime: { state: () => state },
      TafelZettelConfig: { typeById: () => ({ label: "Mitteilung" }) },
      TafelZettelRichText: { textPreview: value => value },
      openZettelScroll: id => opened.push(id),
    };
    const file = kind === "map"
      ? "../../Karten/assets/js/integrations/orte-poi-bridge.js"
      : "../../Anzeigetafeln/assets/js/integrations/orte-notice-bridge.js";
    if (kind === "board") vm.runInNewContext(readFileSync(new URL("../../Anzeigetafeln/assets/js/notes/notice-search.js", import.meta.url), "utf8"), { window });
    vm.runInNewContext(readFileSync(new URL(file, import.meta.url), "utf8"), { window });
    const message = (type, extra = {}, event = {}) => listeners.get("message")({
      source: parent, origin: window.location.origin, data: { type, mapId: "example", ...extra }, ...event,
    });
    message("aleria:map-pois-request", {}, { origin: "https://other.example" });
    message("aleria:map-pois-request", {}, { source: {} });
    message("aleria:map-pois-request", { mapId: "other" });
    assert.equal(sent.length, 0);
    message("aleria:map-pois-request");
    assert.deepEqual(Array.from(sent[0].payload.pois, poi => poi.id), ["public"]);
    assert.equal(sent[0].origin, window.location.origin);
    message("aleria:map-poi-open", { id: "secret" });
    message("aleria:map-poi-open", { id: "public" }, { source: {} });
    message("aleria:map-poi-open", { id: "public" }, { origin: "https://other.example" });
    message("aleria:map-poi-open", { id: "missing" });
    assert.deepEqual(opened, []);
    message("aleria:map-poi-open", { id: "public" });
    assert.deepEqual(opened, ["public"]);
    if (kind === "board") {
      assert.match(sent[0].payload.pois[0].searchText, /Ort Hafen/);
      assert.match(sent[0].payload.pois[0].searchText, /Fest Musik/);
      state.zettel[0].title = "Updated";
      listeners.get("aleria:tafel:state-applied")();
      assert.equal(sent.at(-1).payload.pois[0].name, "Updated");
    }
  });
}
