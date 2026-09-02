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
  path.join(projectRoot, "Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Herrschaft_Rhonwens_Traenen/Castellbryns_Bannkreis/Castellbryn/ort.data.js"),
  "utf8"
);

function loadCastellbryn() {
  const context = {
    encodeURI,
    encodeURIComponent,
    window: {
      ORTE_CONFIG: { registryEntry: { id: "castellbryn" } }
    }
  };
  vm.createContext(context);
  vm.runInContext(worldContentSource, context);
  vm.runInContext(placeDataSource, context);
  return context.window.ORT_DATA;
}

test("Castellbryns Ortsseite bindet Bannkreis und Schildkröten-Wappenstützer ein", () => {
  const data = loadCastellbryn();
  assert.ok(data);
  assert.equal(data.meta.id, "castellbryn");
  assert.equal(data.parentage.liege, "Haus Arwydd");
  assert.equal(data.features.districts, true);
  assert.equal(data.features.noticeBoard, false);
  assert.equal(data.regionMap.mapId, "cenyr-celtigerns-wacht-rhonwens-traenen-castellbryn-bannkreis");

  const media = data.presentation.images;
  assertLocalMedia(media["supporter-left-png"].src);
  assertLocalMedia(media["supporter-right-png"].src);
  assertLocalMedia(media["bild-einer-stadtwache-png"].src);
  assertLocalMedia(media["karten-bild-png"].src);
  assertLocalMedia(media["stadtsektionen-png"].src);
  assertLocalMedia(media["zeitung-png"].src);
  assert.equal(media["supporter-left-png"].src, media["supporter-right-png"].src);
  assert.equal(media["bild-einer-stadtwache-png"].alt, "Stadtwache von Castellbryn");
  assert.match(media["karten-bild-png"].href, /castellbryn-bannkreis$/);
  assert.equal(media["karten-bild-png"].href, media["stadtsektionen-png"].href);
  assert.match(media["zeitung-png"].href, /schwarzbote-castellbryn$/);
});

test("Castellbryns bekannte Grunddaten bleiben auf gesicherte Herrschaftsdaten begrenzt", () => {
  const data = loadCastellbryn();
  assert.equal(data.structure.herrschaft, "Rhonwens Tränen");
  assert.equal(data.structure["vorherrschender adel"], "Haus Arwydd");
  const houses = data.houses.flatMap((group) => group.items);
  assert.deepEqual(Array.from(houses, (house) => house.name), [
    "Haus Arwydd",
    "Haus Gwared",
    "Haus Rhenna",
    "Haus Madryn",
    "Haus Talinvyr",
    "Haus Merek",
    "Haus Illysywen",
    "Haus Skellor",
    "Haus Morveth"
  ]);
  houses.forEach((house) => assertLocalMedia(house.emblem));
  assert.equal(data.merchants.length, 0);
  assert.equal(data.regionMap.pois.length, 0);
});

function assertLocalMedia(publicPath) {
  const assetPath = path.join(projectRoot, ...decodeURI(publicPath).split("/").filter(Boolean));
  assert.equal(fs.existsSync(assetPath), true, `${publicPath} fehlt`);
}
