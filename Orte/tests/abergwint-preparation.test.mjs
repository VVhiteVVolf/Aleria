import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(fileURLToPath(new URL("../..", import.meta.url)));
const worldContentSource = fs.readFileSync(
  path.join(projectRoot, "js/world-content/celtigerns-wacht-places.js"),
  "utf8"
);
const placeDataSource = fs.readFileSync(
  path.join(projectRoot, "Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Gwendolyns_Ufer/Abergwints_Bannkreis/Abergwint/ort.data.js"),
  "utf8"
);
const baronyDataSource = fs.readFileSync(
  path.join(projectRoot, "Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht/Baronie Gwendolyns Ufer/baronie.data.js"),
  "utf8"
);

function loadAbergwint() {
  const context = {
    encodeURI,
    encodeURIComponent,
    window: {
      ORTE_CONFIG: { registryEntry: { id: "abergwint" } }
    }
  };
  vm.createContext(context);
  vm.runInContext(worldContentSource, context);
  vm.runInContext(placeDataSource, context);
  return context.window.ORT_DATA;
}

test("Abergwints Ortsseite verbindet alle vorbereiteten Medien", () => {
  const data = loadAbergwint();
  assert.ok(data);
  assert.equal(data.meta.id, "abergwint");
  assert.equal(data.features.districts, true);
  assert.equal(data.features.noticeBoard, true);
  assert.equal(data.regionMap.mapId, "cenyr-celtigerns-wacht-gwendolyns-ufer-abergwint-bannkreis");

  const media = data.presentation.images;
  assertLocalMedia(media["karten-bild-png"].src);
  assertLocalMedia(media["stadtsektionen-png"].src);
  assertLocalMedia(media["bild-einer-stadtwache-png"].src);
  assertLocalMedia(media["zeitung-png"].src);
  assertLocalMedia(media["supporter-left-png"].src);
  assert.match(media["karten-bild-png"].href, /abergwint-stadtkarte$/);
  assert.match(media["stadtsektionen-png"].href, /abergwint-bannkreis$/);
});

test("Abergwints Häusertabelle entspricht der Familienliste von Gwendolyns Ufer", () => {
  const cityHouses = loadAbergwint().houses.flatMap((group) => group.items);
  const baronyContext = { encodeURIComponent, window: {} };
  vm.createContext(baronyContext);
  vm.runInContext(baronyDataSource, baronyContext);
  const baronyHouses = baronyContext.window.KONTINENTE_DATA.view.familySections
    .flatMap((section) => section.cards);

  assert.equal(cityHouses.length, 18);
  assert.deepEqual(
    Array.from(cityHouses, (house) => house.name.replace(/^Haus\s+/, "")),
    Array.from(baronyHouses, (house) => house.name)
  );
  cityHouses.forEach((house) => {
    assert.match(house.familyId, /^haus-/);
    assertLocalMedia(house.emblem);
  });
});

test("Abergwints Ortskapitel enthalten Geschichte, Stadtviertel und Gwendolyns Wacht", () => {
  const data = loadAbergwint();
  const requiredSections = [
    "introduction", "background", "location", "administration", "conflicts",
    "history", "population", "region", "culture", "districts",
    "builtEnvironment", "military", "economy", "newspaper"
  ];

  requiredSections.forEach((sectionId) => {
    assert.ok(data.sections[sectionId]?.length, sectionId);
  });

  const historyText = data.sections.history.map((block) => block.text || "").join(" ");
  assert.match(historyText, /Dún Inbhirgáeth/);
  assert.match(historyText, /Caer Gwynt/);
  assert.match(historyText, /Abergwint/);

  const districtList = data.sections.districts.find((block) => block.type === "list");
  assert.equal(districtList.items.length, 8);
  assert.equal(data.structure.einwohnerzahl, "etwa 20.000");
  assert.equal(data.structure.ortswache, "400 Gwendolwyr");
});

function assertLocalMedia(publicPath) {
  const assetPath = path.join(projectRoot, ...decodeURI(publicPath).split("/").filter(Boolean));
  assert.equal(fs.existsSync(assetPath), true, `${publicPath} fehlt`);
}
