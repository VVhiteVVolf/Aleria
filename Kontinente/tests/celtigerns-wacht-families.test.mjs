import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";
import vm from "node:vm";
import { getRegisteredFamily } from "../../Stammbäume/assets/js/data/families.registry.js";

const countyDataUrl = new URL(
  "../Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht/grafschaft.data.js",
  import.meta.url,
);
const projectRoot = resolve(import.meta.dirname, "../..");

async function loadCountyData() {
  const source = await readFile(countyDataUrl, "utf8");
  const context = { window: {} };
  vm.runInNewContext(source, context, { filename: countyDataUrl.pathname });
  return context.window.KONTINENTE_DATA;
}

test("Celtigerns Wacht führt Haus Falchdyn als Gwynthorer Bürgerhaus", async () => {
  const data = await loadCountyData();
  const commonerSection = data.view.familySections.find(
    (section) => section.title === "Bürgerliche Häuser · Llamreis Ankunft",
  );
  const falchdynCards = commonerSection.cards.filter((card) => card.id === "haus-falchdyn");

  assert.equal(falchdynCards.length, 1);
  assert.equal(falchdynCards[0].name, "Falchdyn");
  assert.equal(falchdynCards[0].seat, "Gwynthor");
  assert.equal(falchdynCards[0].liege, "Draig");
  assert.equal(
    falchdynCards[0].href,
    "/Familien%20H%C3%A4user%20und%20Clans/kleinehaeuser.html?haus=haus-falchdyn",
  );
  assert.match(decodeURI(falchdynCards[0].imageSrc), /Bürgerliche\/Gwynthor\/Falchdyn\.png$/);
  await access(resolve(projectRoot, falchdynCards[0].imageSrc.slice(1)));
});

test("Vorhandene Hausseiten sind bereits ohne nachgeladenes Register direkt verlinkt", async () => {
  const data = await loadCountyData();
  const cards = data.view.familySections.flatMap(section => section.cards);
  for (const house of ["draig", "gafyr", "wyrm", "saethwyr", "gwefrydd", "gwyvern", "arwydd", "illysywen"]) {
    const card = cards.find(card => card.id === `haus-${house}`);
    assert.equal(card.href, `/Familien%20H%C3%A4user%20und%20Clans/haus.html?haus=haus-${house}`);
  }
  assert.ok(cards.find(card => card.id === "haus-tlawd").href.includes("kleinehaeuser.html?haus=haus-tlawd"));
});

test("Die ausdrücklich gewünschten historischen Häuser stehen nach Adel, Rittern und Bürgerhäusern", async () => {
  const data = await loadCountyData();
  const section = data.view.familySections.at(-1);
  assert.equal(section.title, "Ausgestorbene Häuser");
  assert.equal(section.variant, "extinct");
  assert.deepEqual(Array.from(section.cards, card => card.id), ["haus-ard-conbhron", "haus-illysywen", "haus-ui-talamh"]);
  for (const card of section.cards) {
    const family = getRegisteredFamily(card.id);
    assert.ok(family.folderPath.includes("Celtigerns Wacht"));
    assert.equal(decodeURI(card.imageSrc), `/Stammbäume/${family.family.document.emblem}`);
    await access(resolve(projectRoot, card.imageSrc.slice(1)));
  }
  assert.ok(!section.cards.some(card => ["haus-morveth", "haus-skellor"].includes(card.id)), "Diese Häuser gehören nach Rhonwens Tränen");
});

test("HTML-Grundlage und Inline-Export erhalten die direkten Wappenlinks", async () => {
  const html = await readFile(new URL("Grafschaft Celtigerns Wacht.html", countyDataUrl), "utf8");
  const snapshot = JSON.parse(await readFile(new URL("celtigerns-wacht-grafschaft.inline-export.json", countyDataUrl), "utf8"));
  const images = Object.values(snapshot.data.images);
  for (const house of ["draig", "gafyr", "wyrm", "saethwyr", "gwefrydd", "gwyvern", "arwydd"]) {
    const target = `/Familien%20H%C3%A4user%20und%20Clans/haus.html?haus=haus-${house}`;
    assert.ok(html.includes(`href="${target}"><img`), house);
    assert.ok(snapshot.data.tables["table-0003"].includes(`href="${target}"><img`), house);
    const entry = images.find(image => image.alt === `Wappen Haus ${house[0].toUpperCase() + house.slice(1)}`);
    assert.equal(entry.href, target);
    await access(resolve(projectRoot, decodeURI(entry.src).slice(1)));
  }
});
