import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";
import vm from "node:vm";
import {
  formatForceStrength,
  normalizeMilitaryProfile
} from "../modules/military/military-profile.mjs";

const projectRoot = resolve(import.meta.dirname, "../..");

test("Ortsseite und Vorlage binden den optionalen Militärzugang ein", async () => {
  const [page, template, entryModule, entryStyles] = await Promise.all([
    readFile(resolve(projectRoot, "Orte/grossstadt.html"), "utf8"),
    readFile(resolve(projectRoot, "Orte/_template/GrosseStadtTemplate.html"), "utf8"),
    readFile(resolve(projectRoot, "Orte/modules/military/military-entry.mjs"), "utf8"),
    readFile(resolve(projectRoot, "Orte/modules/military/military-entry.css"), "utf8")
  ]);

  for (const html of [page, template]) {
    assert.match(html, /military-entry\.css\?v=20260904a/);
    assert.match(html, /military-entry\.mjs\?v=20260904a/);
    assert.match(html, /data-orte-military-entry/);
    assert.match(html, /data-orte-military-link/);
    assert.match(html, /celtigerns-wacht-places\.js\?v=celtigerns-cities-20260904c/);
  }

  assert.match(entryModule, /features\?\.militaryView !== false/);
  assert.match(entryModule, /militaer\.html\?id=/);
  assert.doesNotMatch(entryModule, /onclick\s*=|onchange\s*=/i);
  assert.match(entryStyles, /\.orte-military-entry__link/);
  assert.match(entryStyles, /position:\s*absolute/);
});

test("alle registrierten Orte erhalten standardmäßig eine eigene Militäransicht", async () => {
  const source = await readFile(
    resolve(projectRoot, "js/world-content/celtigerns-wacht-places.js"),
    "utf8"
  );
  const context = { encodeURI, encodeURIComponent, window: {} };
  vm.createContext(context);
  vm.runInContext(source, context);

  const catalog = context.window.ALERIA_CELTIGERNS_PLACES;
  assert.ok(catalog.definitions.length > 50);
  catalog.definitions.forEach((entry) => {
    assert.equal(catalog.createPlaceData(entry.id).features.militaryView, true, entry.id);
  });
  assert.equal(
    catalog.createPlaceData("rhosmere", { features: { militaryView: false } }).features.militaryView,
    false
  );
});

test("Militärprofile unterstützen Zahlen, Prozente, Wappen und Bilder", () => {
  const profile = normalizeMilitaryProfile({
    total: 1000,
    forces: [
      {
        name: "Hausgarde",
        kind: "house",
        count: 250,
        crest: { src: "/wappen/haus.png", alt: "Hauswappen" }
      },
      {
        name: "Stadtwache",
        kind: "city-watch",
        share: 40
      }
    ],
    units: [
      {
        name: "Leichte Ortswache",
        branch: "Infanterie",
        image: { src: "/truppen/ortswache.png", fit: "cover" }
      }
    ]
  }, {
    placeId: "beispielort",
    placeName: "Beispielort",
    crest: "/wappen/ort.png",
    heroImage: "/truppen/wache.png"
  });

  assert.equal(profile.status, "ready");
  assert.equal(profile.title, "Streitkräfte von Beispielort");
  assert.equal(profile.total, 1000);
  assert.equal(profile.forces[0].share, 25);
  assert.equal(profile.forces[1].kind, "cityWatch");
  assert.equal(profile.forces[1].share, 40);
  assert.equal(profile.forces[0].crest.src, "/wappen/haus.png");
  assert.equal(profile.units[0].image.fit, "cover");
  assert.equal(profile.heroImage.src, "/truppen/wache.png");
  assert.equal(formatForceStrength(profile.forces[0]), "250 · 25 %");
});

test("eine leere Ortsaufstellung bleibt ein individueller Platzhalter", () => {
  const profile = normalizeMilitaryProfile(null, {
    placeId: "rhosmere",
    placeName: "Rhosmere"
  });

  assert.equal(profile.status, "placeholder");
  assert.equal(profile.placeId, "rhosmere");
  assert.equal(profile.title, "Streitkräfte von Rhosmere");
  assert.equal(profile.forces.length, 0);
  assert.equal(profile.units.length, 0);
});

test("die eigenständige Militärseite lädt Ortsregister und Renderer", async () => {
  const [page, viewModule, styles, documentation] = await Promise.all([
    readFile(resolve(projectRoot, "Orte/militaer.html"), "utf8"),
    readFile(resolve(projectRoot, "Orte/modules/military/military-view.mjs"), "utf8"),
    readFile(resolve(projectRoot, "Orte/modules/military/military-view.css"), "utf8"),
    readFile(resolve(projectRoot, "Orte/modules/military/README.md"), "utf8")
  ]);

  assert.match(page, /data-military-view/);
  assert.match(page, /military-view\.mjs\?v=20260904a/);
  assert.match(page, /orte\.registry\.js/);
  assert.match(viewModule, /normalizeMilitaryProfile/);
  assert.match(viewModule, /data\?\.militaryView/);
  assert.doesNotMatch(viewModule, /onclick\s*=|onchange\s*=/i);
  assert.match(styles, /\.military-force-grid/);
  assert.match(styles, /\.military-unit-gallery/);
  assert.match(styles, /@media \(max-width: 780px\)/);
  assert.match(documentation, /features\.militaryView: false/);
  assert.match(documentation, /kind: "vassal"/);
});
