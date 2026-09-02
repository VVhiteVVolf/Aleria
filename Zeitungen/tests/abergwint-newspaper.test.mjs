import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import newspaper from "../data/schwarzbote-abergwint/edition.mjs";
import { DEFAULT_PUBLICATION_DATE } from "../assets/js/newspaper-aleria-date.mjs";

const testDirectory = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(testDirectory, "../..");
const allowedBodyTags = new Set(["p", "h2", "h3", "h4", "blockquote", "hr", "b", "strong", "i", "em", "br"]);

test("Abergwint besitzt eine eigenständige Schwarzboten-Ausgabe", () => {
  assert.equal(newspaper.id, "schwarzbote-abergwint");
  assert.equal(newspaper.edition, "Abergwint");
  assert.equal(newspaper.authors.length, 6);
  assert.equal(newspaper.articleTypes.length, 8);
  assert.equal(newspaper.articles.length, 1);
  assert.deepEqual(newspaper.publicationDate, DEFAULT_PUBLICATION_DATE);

  assertUnique(newspaper.authors.map((author) => author.id), "Autoren-IDs");
  assertUnique(newspaper.articleTypes.map((type) => type.id), "Artikelart-IDs");
  assertUnique(newspaper.articles.map((article) => article.id), "Artikel-IDs");
});

test("Abergwints Zeitungsmedien und Artikel liegen vollständig lokal vor", async () => {
  const localAssets = [
    newspaper.logo,
    newspaper.imprints.inkStamp,
    newspaper.imprints.waxSeal,
    ...newspaper.authors.map((author) => author.portrait)
  ];
  await Promise.all(localAssets.map((assetPath) => access(toWorkspacePath(assetPath))));

  const authorIds = new Set(newspaper.authors.map((author) => author.id));
  const typeIds = new Set(newspaper.articleTypes.map((type) => type.id));
  for (const article of newspaper.articles) {
    assert.ok(authorIds.has(article.authorId), `${article.title}: unbekannter Autor`);
    assert.ok(typeIds.has(article.typeId), `${article.title}: unbekannte Artikelart`);

    const body = await readFile(toWorkspacePath(article.bodyPath), "utf8");
    assert.ok(body.length > 1000, `${article.title}: Artikeltext ist zu kurz`);
    assert.doesNotMatch(body, /animexx|worldanvil|https?:\/\//i, `${article.title}: enthält einen alten externen Link`);
    assert.doesNotMatch(body, /\s(?:style|class|onclick|onerror)=/i, `${article.title}: enthält altes Layout oder Inline-Handler`);

    const tags = [...body.matchAll(/<\/?([a-z0-9-]+)/gi)].map((match) => match[1].toLowerCase());
    tags.forEach((tag) => assert.ok(allowedBodyTags.has(tag), `${article.title}: unerlaubtes Element <${tag}>`));
  }
});

test("Abergwints Ortsseite verlinkt die Ausgabe", async () => {
  const placeData = await readFile(resolve(
    workspaceRoot,
    "Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Gwendolyns_Ufer/Abergwints_Bannkreis/Abergwint/ort.data.js"
  ), "utf8");

  assert.match(placeData, /Zeitungen\/zeitung\.html\?zeitung=schwarzbote-abergwint/);
  assert.match(placeData, /schwarzbote-abergwint\/assets\/schwarzbote-abergwint\.png/);
});

function toWorkspacePath(publicPath) {
  return resolve(workspaceRoot, String(publicPath).replace(/^\//, ""));
}

function assertUnique(values, label) {
  assert.equal(new Set(values).size, values.length, `${label} sind nicht eindeutig`);
}
