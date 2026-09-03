import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";
import vm from "node:vm";

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
    "/Stammbäume/Stammbaum.html?family=haus-falchdyn&mode=view",
  );
  assert.match(decodeURI(falchdynCards[0].imageSrc), /Bürgerliche\/Gwynthor\/Falchdyn\.png$/);
  await access(resolve(projectRoot, falchdynCards[0].imageSrc.slice(1)));
});
