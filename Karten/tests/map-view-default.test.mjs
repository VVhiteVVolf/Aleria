import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

function classList(...initial) {
  const classes = new Set(initial);
  return {
    add: (...names) => names.forEach((name) => classes.add(name)),
    remove: (...names) => names.forEach((name) => classes.delete(name)),
    contains: (name) => classes.has(name),
    toggle(name, force) {
      if (force === undefined) force = !classes.has(name);
      force ? classes.add(name) : classes.delete(name);
    },
  };
}

function createFixture() {
  const buttons = ["normal", "regions", "pins"].map((layer) => ({
    dataset: { layer },
    classList: classList("lbtn", "on"),
  }));
  const overlays = new Map(["regions", "pins"].map((layer) => [layer, { style: { opacity: "1" } }]));
  const pinLayer = { style: { display: "block", opacity: "1" } };

  const document = {
    getElementById(id) {
      if (id === "pl") return pinLayer;
      if (id === "layer-opacity-wrap") return { style: {} };
      if (id === "layer-opacity-sl") return { value: "70" };
      if (id.startsWith("lb-")) return buttons.find((button) => button.dataset.layer === id.slice(3)) || null;
      return null;
    },
    querySelector(selector) {
      const layer = selector.match(/data-overlay="([^"]+)"/)?.[1];
      return layer ? overlays.get(layer) || null : null;
    },
    querySelectorAll(selector) {
      if (selector.includes(":not([data-layer=\"normal\"])") && selector.includes(".on")) {
        return buttons.filter((button) => button.dataset.layer !== "normal" && button.classList.contains("on"));
      }
      if (selector.includes(":not([data-layer=\"normal\"])") ) {
        return buttons.filter((button) => button.dataset.layer !== "normal");
      }
      return [];
    },
  };

  const window = { KartoRuntime: {} };
  vm.runInNewContext(
    fs.readFileSync(new URL("../assets/js/map/map-view.js", import.meta.url), "utf8"),
    { document, window }
  );

  return { window, buttons, overlays, pinLayer };
}

test("the default layer is the normal map without zone or marker overlays", () => {
  const fixture = createFixture();

  fixture.window.resetLayers();

  assert.equal(fixture.buttons[0].classList.contains("on"), true);
  assert.equal(fixture.buttons[1].classList.contains("on"), false);
  assert.equal(fixture.buttons[2].classList.contains("on"), false);
  assert.equal(fixture.overlays.get("regions").style.opacity, "0");
  assert.equal(fixture.overlays.get("pins").style.opacity, "0");
  assert.equal(fixture.pinLayer.style.display, "none");
});

test("marker overlay can be enabled and normal resets it again", () => {
  const fixture = createFixture();

  fixture.window.resetLayers();
  fixture.window.toggleLayer("pins");
  assert.equal(fixture.overlays.get("pins").style.opacity, "1");
  assert.equal(fixture.pinLayer.style.display, "block");

  fixture.window.toggleLayer("normal");
  assert.equal(fixture.overlays.get("pins").style.opacity, "0");
  assert.equal(fixture.pinLayer.style.display, "none");
});
