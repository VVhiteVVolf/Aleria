import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";

const testDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(testDirectory, "..", "..");
const boardId = "cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-anzeigetafel";

const registryContext = { window: {}, encodeURIComponent };
vm.runInNewContext(
  readFileSync(resolve(testDirectory, "..", "tafeln.registry.js"), "utf8"),
  registryContext
);
const boardEntry = registryContext.window.TafelRegistry.byId(boardId);

test("Gwynthors Tafel liegt im Anzeigetafeln-System", () => {
  assert.equal(boardEntry?.status, "active");
  assert.equal(boardEntry?.type, "city");
  assert.equal(existsSync(resolve(projectRoot, "Anzeigetafeln", boardEntry.images.board)), true);
  assert.equal(existsSync(resolve(projectRoot, "Anzeigetafeln", boardEntry.config)), true);
  assert.equal(existsSync(resolve(projectRoot, "Anzeigetafeln", boardEntry.dataPath)), true);
});

test("Gwynthor bettet die Anzeigetafel ein und nicht das Kartensystem", () => {
  const placeContext = { window: {}, encodeURI };
  const placeDataPath = resolve(
    projectRoot,
    "Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Gwynthors_Bannkreis/Gwynthor/ort.data.js"
  );
  vm.runInNewContext(readFileSync(placeDataPath, "utf8"), placeContext);

  const config = placeContext.window.ORT_DATA.noticeBoardMap;
  assert.equal(config.mapId, boardId);
  assert.match(config.embedHref, /^\/Anzeigetafeln\/tafel\.html\?tafel=/);
  assert.match(config.embedHref, /&ui=single-board-20260902b$/);
  assert.doesNotMatch(config.embedHref, /\/Karten\//);

  const mapRegistryContext = { window: {} };
  vm.runInNewContext(
    readFileSync(resolve(projectRoot, "Karten/karten.registry.js"), "utf8"),
    mapRegistryContext
  );
  assert.equal(mapRegistryContext.window.KartoMapRegistry.byId(boardId), null);
});

test("das Ortsmodul erzwingt die aktuelle Ein-Ebenen-Oberfläche", () => {
  const noticeBoardModule = readFileSync(
    resolve(projectRoot, "Orte/assets/js/orte-notice-board.js"),
    "utf8",
  );
  assert.match(noticeBoardModule, /searchParams\.set\("ui", "single-board-20260902b"\)/);
});
