import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import castellbryn from "../data/schwarzbote-castellbryn/edition.mjs";
import rhosmere from "../data/schwarzbote-rhosmere/edition.mjs";
import { DEFAULT_PUBLICATION_DATE } from "../assets/js/newspaper-aleria-date.mjs";
import { findNewspaperEntry, getNewspaperEntries } from "../assets/js/newspaper-registry.mjs";

const testDirectory = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(testDirectory, "../..");
const editions = Object.freeze([castellbryn, rhosmere]);

test("Castellbryn und Rhosmere besitzen eigenständige registrierte Ausgaben", () => {
  assert.equal(getNewspaperEntries().length, 4);
  assert.equal(findNewspaperEntry("castellbryn")?.id, castellbryn.id);
  assert.equal(findNewspaperEntry("rhosmere")?.id, rhosmere.id);
  assert.equal(castellbryn.location.href, "/Orte/grossstadt.html?id=castellbryn");
  assert.equal(rhosmere.location.href, "/Orte/grossstadt.html?id=rhosmere");
});

test("Beide leeren Ausgaben stellen acht neutrale Redaktionsplätze bereit", () => {
  editions.forEach((newspaper) => {
    assert.equal(newspaper.authors.length, 8, newspaper.edition);
    assert.equal(new Set(newspaper.authors.map((author) => author.id)).size, 8, newspaper.edition);
    newspaper.authors.forEach((author, index) => {
      assert.equal(author.name, "...");
      assert.equal(author.role, `Redaktionsplatz ${index + 1}`);
      assert.equal(author.portrait, "/Stammbäume/assets/images/placeholders/unknown.png");
      assert.deepEqual(author.biography, []);
    });
  });
});

test("Beide Ausgaben enthalten genau einen leeren Hauptartikel", async () => {
  for (const newspaper of editions) {
    assert.equal(newspaper.issueId, "1740-03-18");
    assert.deepEqual(newspaper.publicationDate, DEFAULT_PUBLICATION_DATE);
    assert.equal(newspaper.articles.length, 1);
    assert.equal(newspaper.articles[0].typeId, "hauptartikel");
    assert.equal(newspaper.articles[0].title, "...");
    assert.equal(newspaper.articles[0].teaser, "...");
    assert.equal((await readFile(toWorkspacePath(newspaper.articles[0].bodyPath), "utf8")).trim(), "<p>...</p>");
  }
});

test("Logos, Silhouette und Druckzeichen liegen lokal vor", async () => {
  const assets = new Set(editions.flatMap((newspaper) => [
    newspaper.logo,
    newspaper.imprints.inkStamp,
    newspaper.imprints.waxSeal,
    ...newspaper.authors.map((author) => author.portrait)
  ]));
  await Promise.all([...assets].map((assetPath) => access(toWorkspacePath(assetPath))));
});

test("Die Ortsseiten verlinken Bild und Ausgabe", async () => {
  const placeFiles = [
    {
      path: "Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Herrschaft_Rhonwens_Traenen/Castellbryns_Bannkreis/Castellbryn/ort.data.js",
      id: "schwarzbote-castellbryn"
    },
    {
      path: "Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Arthus_Streben/Rhosmeres_Bannkreis/Rhosmere/ort.data.js",
      id: "schwarzbote-rhosmere"
    }
  ];

  for (const place of placeFiles) {
    const source = await readFile(resolve(workspaceRoot, place.path), "utf8");
    assert.match(source, new RegExp(`Zeitungen/zeitung\\.html\\?zeitung=${place.id}`));
    assert.match(source, new RegExp(`${place.id}/assets/${place.id}\\.png`));
  }
});

function toWorkspacePath(publicPath) {
  return resolve(workspaceRoot, String(publicPath).replace(/^\//, ""));
}
