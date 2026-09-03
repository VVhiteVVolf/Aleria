import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";
import gwynthor from "../data/fluesterfaecher-gwynthor/edition.mjs";
import {
  FLUESTERFAECHER_ARTICLE_TYPES,
  FLUESTERFAECHER_LOCAL_POSITIONS
} from "../data/fluesterfaecher/publication.mjs";
import {
  findNewspaperEntry,
  getNewspaperEntriesForPlace
} from "../assets/js/newspaper-registry.mjs";
import {
  getNewspaperDistributionPolicy,
  getRequiredNewspaperTitleIdsForPlace
} from "../assets/js/newspaper-distribution-policy.mjs";

const workspaceRoot = resolve(import.meta.dirname, "../..");

test("Der Flüsterfächer ist als eigenständiges Gwynthorer Gesellschaftsmagazin angelegt", () => {
  assert.equal(gwynthor.id, "fluesterfaecher-gwynthor");
  assert.equal(gwynthor.titleId, "fluesterfaecher");
  assert.equal(gwynthor.name, "Der Flüsterfächer");
  assert.equal(gwynthor.tagline, "Samt & Sünde");
  assert.equal(gwynthor.edition, "Gwynthor");
  assert.match(gwynthor.subtitle, /Gesellschaft, Geschmack und geheime Türen/);
  assert.match(gwynthor.summary, /Lokalredaktion/);
  assert.equal(gwynthor.articles.length, 1);
  assert.equal(gwynthor.articles[0].typeId, "hinter-dem-faecher");
});

test("Die zwölf Rubriken decken Gesellschaft, Luxus, Nachtleben und diskrete Themen ab", () => {
  assert.equal(FLUESTERFAECHER_ARTICLE_TYPES.length, 12);
  assert.equal(new Set(FLUESTERFAECHER_ARTICLE_TYPES.map((entry) => entry.id)).size, 12);
  const labels = FLUESTERFAECHER_ARTICLE_TYPES.map((entry) => entry.label).join(" ");
  assert.match(labels, /Hinter dem Fächer/);
  assert.match(labels, /Samt & Sünde/);
  assert.match(labels, /Stallgeflüster/);
  assert.match(labels, /giftige Feder/);
  assert.match(labels, /Schlüsselloch/);
  assert.match(FLUESTERFAECHER_ARTICLE_TYPES.find((entry) => entry.id === "stallgefluester").description, /volljährigen/);
});

test("Gwynthors vorbereitete Lokalredaktion besitzt Kernrollen, Salonkorrespondenz und geschützte Informantenstellen", () => {
  assert.equal(FLUESTERFAECHER_LOCAL_POSITIONS.length, 11);
  assert.equal(gwynthor.authors.length, 11);
  assert.equal(new Set(gwynthor.authors.map((author) => author.id)).size, 11);
  assert.equal(gwynthor.editorialSections.length, 1);
  assert.equal(gwynthor.editorialSections[0].title, "Die Lokalredaktion zu Gwynthor");
  assert.deepEqual(gwynthor.editorialSections[0].authorIds, gwynthor.authors.map((author) => author.id));
  const roles = gwynthor.authors.map((author) => author.role);
  [
    "Chefredaktion",
    "Gesellschaft und Adel",
    "Mode und Luxus",
    "Nachtleben und Vergnügen",
    "Beziehungen und diskrete Angelegenheiten",
    "Portraitzeichnung",
    "Kolumne der Giftigen Feder",
    "Freie Salonkorrespondenz",
    "Freie Informantenstelle"
  ].forEach((role) => assert.ok(roles.includes(role), role));
});

test("Die Verbreitungsregel beschränkt das lokal produzierte Magazin auf Cenyrs Hauptstädte", () => {
  const policy = getNewspaperDistributionPolicy("fluesterfaecher");
  assert.equal(policy.territoryId, "cenyr");
  assert.equal(policy.placement, "capital-cities");
  assert.equal(policy.contentModel, "local-edition");
  assert.deepEqual(
    getRequiredNewspaperTitleIdsForPlace({
      kingdomId: "Cenyr",
      countyId: "Celtigerns Wacht",
      isMajorCity: true,
      isCapitalCity: true
    }),
    ["schwarzbote", "celtigerns-echo", "kronenspiegel", "fluesterfaecher"]
  );
  assert.deepEqual(
    getRequiredNewspaperTitleIdsForPlace({ kingdomId: "Cenyr", isMajorCity: true, isCapitalCity: false }),
    ["schwarzbote", "kronenspiegel"]
  );
});

test("Der Gwynthorer Pressewechsler führt den Flüsterfächer als viertes Blatt", () => {
  const entries = getNewspaperEntriesForPlace("gwynthor");
  assert.equal(entries.length, 4);
  assert.deepEqual(entries.map((entry) => entry.titleId), [
    "schwarzbote",
    "celtigerns-echo",
    "kronenspiegel",
    "fluesterfaecher"
  ]);
  assert.equal(findNewspaperEntry("fluesterfaecher")?.id, "fluesterfaecher-gwynthor");
  assert.equal(findNewspaperEntry("Flüsterfächer")?.id, "fluesterfaecher-gwynthor");
  assert.equal(entries[3].distribution.placement, "capital-cities");
});

test("Rosa Thema, gelieferte Medien und Eröffnungsstück liegen lokal vor", async () => {
  const [body, issuePage, articlePage, themeStyles, placeStyles, sources] = await Promise.all([
    readFile(toWorkspacePath(gwynthor.articles[0].bodyPath), "utf8"),
    readFile(resolve(workspaceRoot, "Zeitungen/zeitung.html"), "utf8"),
    readFile(resolve(workspaceRoot, "Zeitungen/artikel.html"), "utf8"),
    readFile(resolve(workspaceRoot, "Zeitungen/assets/css/newspaper-fluesterfaecher.css"), "utf8"),
    readFile(resolve(workspaceRoot, "Orte/assets/css/orte-place-press.css"), "utf8"),
    readFile(resolve(workspaceRoot, "Zeitungen/data/fluesterfaecher/assets/sources.json"), "utf8")
  ]);
  assert.ok(body.length > 1_500);
  assert.match(body, /Blutstadt/);
  assert.match(body, /Samt/);
  assert.match(issuePage, /newspaper-fluesterfaecher\.css/);
  assert.match(articlePage, /newspaper-fluesterfaecher\.css/);
  assert.match(themeStyles, /data-newspaper-theme="fluesterfaecher"/);
  assert.match(themeStyles, /#c72f79/);
  assert.match(placeStyles, /data-newspaper-theme="fluesterfaecher"/);
  assert.match(sources, /dEbCxvH|doa5Cuj|cyJcVnp/);

  await Promise.all([
    gwynthor.logo,
    gwynthor.imprints.inkStamp,
    gwynthor.imprints.waxSeal
  ].map((assetPath) => access(toWorkspacePath(assetPath))));
});

function toWorkspacePath(publicPath) {
  return resolve(workspaceRoot, decodeURIComponent(String(publicPath)).replace(/^\//, ""));
}
