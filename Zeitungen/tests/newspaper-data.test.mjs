import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import newspaper from "../data/schwarzbote-gwynthor/edition.mjs";
import {
  DEFAULT_PUBLICATION_DATE,
  formatPublicationDate,
  isValidPublicationDate
} from "../assets/js/newspaper-aleria-date.mjs";

const testDirectory = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(testDirectory, "../..");
const allowedBodyTags = new Set(["p", "h2", "h3", "h4", "blockquote", "hr", "b", "strong", "i", "em", "br"]);

test("Gwynthor-Ausgabe besitzt eindeutige und vollständige Redaktionsdaten", () => {
  assert.equal(newspaper.id, "schwarzbote-gwynthor");
  assert.equal(newspaper.articles.length, 5);
  assert.equal(newspaper.authors.length, 6);
  assert.equal(newspaper.articleTypes.length, 8);

  assertUnique(newspaper.authors.map((author) => author.id), "Autoren-IDs");
  assertUnique(newspaper.articleTypes.map((type) => type.id), "Artikelart-IDs");
  assertUnique(newspaper.articles.map((article) => article.id), "Artikel-IDs");
});

test("Zeitungsausgaben verwenden das Aleria-Datum als Standard", () => {
  assert.deepEqual(newspaper.publicationDate, DEFAULT_PUBLICATION_DATE);
  assert.equal(formatPublicationDate(newspaper.publicationDate), "18. Tag, Dritter Monat, Jahr 1740");
  assert.equal(isValidPublicationDate(newspaper.publicationDate), true);
  assert.equal(formatPublicationDate(), "18. Tag, Dritter Monat, Jahr 1740");
});

test("Artikel verweisen nur auf bekannte Autoren und Artikelarten", () => {
  const authorIds = new Set(newspaper.authors.map((author) => author.id));
  const typeIds = new Set(newspaper.articleTypes.map((type) => type.id));

  newspaper.articles.forEach((article) => {
    assert.ok(authorIds.has(article.authorId), `${article.title}: unbekannter Autor`);
    assert.ok(typeIds.has(article.typeId), `${article.title}: unbekannte Artikelart`);
  });
});

test("Portraits, Logo und alle Artikeltexte liegen lokal vor", async () => {
  const localAssets = [newspaper.logo, ...newspaper.authors.map((author) => author.portrait)];
  await Promise.all(localAssets.map((assetPath) => access(toWorkspacePath(assetPath))));

  for (const article of newspaper.articles) {
    const body = await readFile(toWorkspacePath(article.bodyPath), "utf8");
    assert.ok(body.length > 1000, `${article.title}: Artikeltext ist zu kurz`);
    assert.doesNotMatch(body, /animexx|worldanvil|https?:\/\//i, `${article.title}: enthält einen alten externen Link`);
    assert.doesNotMatch(body, /\s(?:style|class|onclick|onerror)=/i, `${article.title}: enthält altes Layout oder Inline-Handler`);

    const tags = [...body.matchAll(/<\/?([a-z0-9-]+)/gi)].map((match) => match[1].toLowerCase());
    tags.forEach((tag) => assert.ok(allowedBodyTags.has(tag), `${article.title}: unerlaubtes Element <${tag}>`));
  }
});

test("Gwynthor verlinkt sein Zeitungsbild auf die neue Ausgabe", async () => {
  const gwynthorData = await readFile(resolve(
    workspaceRoot,
    "Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Gwynthors_Bannkreis/Gwynthor/ort.data.js"
  ), "utf8");

  assert.match(gwynthorData, /Zeitungen\/zeitung\.html\?zeitung=schwarzbote-gwynthor/);
  assert.match(gwynthorData, /schwarzbote-gwynthor\/assets\/schwarzbote-gwynthor\.png/);
});

function toWorkspacePath(publicPath) {
  return resolve(workspaceRoot, String(publicPath).replace(/^\//, ""));
}

function assertUnique(values, label) {
  assert.equal(new Set(values).size, values.length, `${label} sind nicht eindeutig`);
}
