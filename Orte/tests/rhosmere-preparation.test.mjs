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
  path.join(projectRoot, "Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Arthus_Streben/Rhosmeres_Bannkreis/Rhosmere/ort.data.js"),
  "utf8"
);

function loadRhosmere() {
  const context = {
    encodeURI,
    encodeURIComponent,
    window: {
      ORTE_CONFIG: { registryEntry: { id: "rhosmere" } }
    }
  };
  vm.createContext(context);
  vm.runInContext(worldContentSource, context);
  vm.runInContext(placeDataSource, context);
  return context.window.ORT_DATA;
}

test("Rhosmeres Ortsseite verbindet Bannkreis, Bezirke, Wache und Hengste", () => {
  const data = loadRhosmere();
  assert.ok(data);
  assert.equal(data.meta.id, "rhosmere");
  assert.equal(data.parentage.liege, "Haus Gwefrydd");
  assert.equal(data.features.districts, true);
  assert.equal(data.features.noticeBoard, false);
  assert.equal(data.regionMap.mapId, "cenyr-celtigerns-wacht-arthus-streben-rhosmere-bannkreis");

  const media = data.presentation.images;
  [
    "supporter-left-png",
    "supporter-right-png",
    "karten-bild-png",
    "stadtsektionen-png",
    "bild-einer-stadtwache-png",
    "zeitung-png"
  ].forEach((key) => assertLocalMedia(media[key].src));
  assert.match(media["supporter-left-png"].src, /ArtusStrebenHengst\.png$/);
  assert.equal(media["supporter-left-png"].src, media["supporter-right-png"].src);
  assert.match(media["karten-bild-png"].href, /rhosmere-bannkreis$/);
  assert.equal(media["karten-bild-png"].href, media["stadtsektionen-png"].href);
  assert.match(media["zeitung-png"].href, /schwarzbote-rhosmere$/);
});

test("Rhosmeres Häusertabelle übernimmt alle Häuser aus Arthus Streben", () => {
  const houses = loadRhosmere().houses.flatMap((group) => group.items);
  assert.equal(houses.length, 15);
  assert.deepEqual(Array.from(houses, (house) => house.name), [
    "Haus Gwefrydd",
    "Haus Almarch",
    "Haus Brinmarch",
    "Haus Gwardin",
    "Haus Tirwyn",
    "Haus Eirfael",
    "Haus Ghorswyn",
    "Haus Coedvarn",
    "Haus Althin",
    "Haus Talmeirch",
    "Haus Gwynrhos",
    "Haus Iorwen",
    "Haus Bekab",
    "Haus Rhen",
    "Haus Maethan"
  ]);
  houses.forEach((house) => {
    assert.match(house.familyId, /^haus-/);
    assertLocalMedia(house.emblem);
  });
});

function assertLocalMedia(publicPath) {
  const assetPath = path.join(projectRoot, ...decodeURI(publicPath).split("/").filter(Boolean));
  assert.equal(fs.existsSync(assetPath), true, `${publicPath} fehlt`);
}
