import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import vm from "node:vm";

const modulePath = resolve(import.meta.dirname, "../assets/js/orte-notice-board.js");

test("Ortsseiten ohne aktive Tafel zeigen einen benannten Platzhalter", () => {
  const container = createElement("div");
  const page = {
    querySelector(selector) {
      return selector === "[data-orte-notice-board-map]" ? container : null;
    }
  };
  const document = {
    querySelector(selector) {
      return selector === "[data-orte-static-template]" ? page : null;
    },
    addEventListener() {},
    createElement
  };
  const context = {
    document,
    window: {
      ORT_DATA: { name: "Rhosmere" }
    }
  };

  vm.runInNewContext(readFileSync(modulePath, "utf8"), context, { filename: modulePath });

  assert.equal(container.children.length, 1);
  const placeholder = container.children[0];
  assert.equal(placeholder.className, "orte-notice-board-placeholder");
  assert.equal(placeholder.attributes.role, "note");
  assert.deepEqual(
    Array.from(placeholder.children, (child) => child.textContent),
    ["📜", "Anzeigetafel in Vorbereitung", "Für Rhosmere ist noch keine eigene Anzeigetafel eingerichtet."]
  );
});

test("Großstadtseite und Vorlage laden die Gestaltung des Tafelplatzhalters", () => {
  const page = readFileSync(resolve(import.meta.dirname, "../grossstadt.html"), "utf8");
  const template = readFileSync(resolve(import.meta.dirname, "../_template/GrosseStadtTemplate.html"), "utf8");
  const styles = readFileSync(resolve(import.meta.dirname, "../assets/css/orte-notice-board.css"), "utf8");

  for (const html of [page, template]) {
    assert.match(html, /orte-notice-board\.css\?v=notice-board-placeholder-20260904a/);
  }
  assert.match(styles, /\.orte-notice-board-placeholder/);
});

function createElement(tagName) {
  return {
    tagName,
    className: "",
    textContent: "",
    attributes: {},
    children: [],
    setAttribute(name, value) {
      this.attributes[name] = value;
    },
    append(...children) {
      this.children.push(...children);
    },
    replaceChildren(...children) {
      this.children = children;
    }
  };
}
