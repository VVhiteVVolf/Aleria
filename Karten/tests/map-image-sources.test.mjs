import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../assets/js/map/map-image-sources.js", import.meta.url), "utf8");
const context = {
  URL,
  document: { baseURI: "https://dieweltvonaleria.netlify.app/Karten/karte.html" },
  window: {
    KARTO_CONFIG: {
      images: {
        normal: "Cenyr/celtigerns-wacht/Kartenbilder/CeltigernsWacht.png",
      },
    },
  },
};
vm.runInNewContext(source, context);
const imageSources = context.window.KartoMapImageSources;

test("registry-relative Kartenpfade werden stabil unter /Karten ausgeliefert", () => {
  assert.equal(
    imageSources.toPublicUrl("Cenyr/celtigerns-wacht/Kartenbilder/CeltigernsWacht.png"),
    "/Karten/Cenyr/celtigerns-wacht/Kartenbilder/CeltigernsWacht.png",
  );
  assert.equal(
    imageSources.toPublicUrl("Karten/Cenyr/celtigerns-wacht/Kartenbilder/CeltigernsWacht.png"),
    "/Karten/Cenyr/celtigerns-wacht/Kartenbilder/CeltigernsWacht.png",
  );
});

test("Web- und Daten-URLs bleiben unverändert", () => {
  assert.equal(imageSources.toPublicUrl("https://bilder.example/map.png"), "https://bilder.example/map.png");
  assert.equal(imageSources.toPublicUrl("data:image/png;base64,AAAA"), "data:image/png;base64,AAAA");
});

test("nicht portable Altpfade fallen auf die Registry-Konfiguration zurück", () => {
  assert.equal(imageSources.toPublicUrl("C:\\Users\\name\\map.png"), "");
  assert.equal(imageSources.toPublicUrl("file:///C:/Users/name/map.png"), "");
  assert.equal(imageSources.toPublicUrl("blob:https://dieweltvonaleria.netlify.app/veraltet"), "");
  assert.equal(
    imageSources.select("C:\\Users\\name\\map.png", context.window.KARTO_CONFIG.images.normal),
    "/Karten/Cenyr/celtigerns-wacht/Kartenbilder/CeltigernsWacht.png",
  );
});

test("die Fehlerwiederholung umgeht einen beschädigten Browsercache", () => {
  assert.equal(
    imageSources.recoveryUrl("Cenyr/celtigerns-wacht/Kartenbilder/CeltigernsWacht.png"),
    "https://dieweltvonaleria.netlify.app/Karten/Cenyr/celtigerns-wacht/Kartenbilder/CeltigernsWacht.png?aleria-map-recovery=20260901b",
  );
});

test("der Registry-Rückfall ist kanonisch vergleichbar", () => {
  const fallback = imageSources.configured("normal");
  assert.equal(fallback, "/Karten/Cenyr/celtigerns-wacht/Kartenbilder/CeltigernsWacht.png");
  assert.equal(imageSources.equivalent(fallback, `https://dieweltvonaleria.netlify.app${fallback}`), true);
});

test("optionale Ebenen gelten nur mit einem auslieferbaren Bild als verfügbar", () => {
  assert.deepEqual(
    { ...imageSources.availability(
      { normal: "", regions: "", pins: "C:\\Users\\name\\marker.png" },
      {
        normal: "Cenyr/celtigerns-wacht/Kartenbilder/CeltigernsWacht.png",
        pins: "Cenyr/celtigerns-wacht/Kartenbilder/CeltigernsWachtMarker.png",
      },
    ) },
    { normal: true, regions: false, pins: true },
  );
});
