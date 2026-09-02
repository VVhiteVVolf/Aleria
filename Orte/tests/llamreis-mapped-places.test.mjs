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
const mappedPlaceSource = fs.readFileSync(
  path.join(projectRoot, "Orte/data/llamreis-mapped-place.data.js"),
  "utf8"
);

const places = Object.freeze([
  {
    id: "lynthor",
    mapPrefix: "cenyr-celtigerns-wacht-llamrais-ankunft-lynthor",
    cityImage: "/Karten/Cenyr/celtigerns-wacht/llamrais-ankunft/lynthor-bannkreis/lynthor/Kartenbilder/LynthorStadt.webp"
  },
  {
    id: "twr-rhewgorn",
    mapPrefix: "cenyr-celtigerns-wacht-llamrais-ankunft-twr-rhewgorn",
    cityImage: "/Karten/Cenyr/celtigerns-wacht/llamrais-ankunft/twr-rhewgorn-bannkreis/twr-rhewgorn/Kartenbilder/TwrRhewgornStadt.webp"
  },
  {
    id: "mwyncreig",
    mapPrefix: "cenyr-celtigerns-wacht-llamrais-ankunft-wyrm-mwyncreig",
    cityImage: "/Karten/Cenyr/celtigerns-wacht/llamrais-ankunft/herrschaft-der-wyrm/mwyncreig-bannkreis/mwyncreig/Kartenbilder/MwyncreigStadt.webp"
  },
  {
    id: "lysfaen",
    mapPrefix: "cenyr-celtigerns-wacht-llamrais-ankunft-wyrm-llysfaen",
    cityImage: "/Karten/Cenyr/celtigerns-wacht/llamrais-ankunft/herrschaft-der-wyrm/llysfaen-bannkreis/llysfaen/Kartenbilder/LlysfaenStadt.webp"
  },
  {
    id: "bronhir",
    mapPrefix: "cenyr-celtigerns-wacht-llamrais-ankunft-wyrm-bronhir",
    cityImage: "/Karten/Cenyr/celtigerns-wacht/llamrais-ankunft/herrschaft-der-wyrm/bronhir-bannkreis/bronhir/Kartenbilder/BronhirStadt.webp"
  }
]);

function loadPlace(id) {
  const context = {
    encodeURI,
    encodeURIComponent,
    window: {
      ORTE_CONFIG: { registryEntry: { id } }
    }
  };
  vm.createContext(context);
  vm.runInContext(worldContentSource, context);
  vm.runInContext(mappedPlaceSource, context);
  return context.window.ORT_DATA;
}

for (const place of places) {
  test(`${place.id} verbindet Ortsseite, Stadtkarte und Bannkreis`, () => {
    const data = loadPlace(place.id);
    assert.ok(data);
    assert.equal(data.meta.id, place.id);
    assert.equal(data.features.districts, false);
    assert.equal(data.features.noticeBoard, false);
    assert.equal(data.presentation.images["karten-bild-png"].src, place.cityImage);
    assert.match(data.presentation.images["karten-bild-png"].href, new RegExp(`${place.mapPrefix}-stadtkarte$`));
    assert.equal(data.regionMap.mapId, `${place.mapPrefix}-bannkreis`);
    assert.match(data.regionMap.fullHref, new RegExp(`${place.mapPrefix}-bannkreis$`));

    const assetPath = path.join(projectRoot, ...place.cityImage.split("/").filter(Boolean));
    assert.equal(fs.existsSync(assetPath), true);
  });
}
