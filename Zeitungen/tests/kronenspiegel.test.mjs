import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";
import abergwint from "../data/kronenspiegel-abergwint/edition.mjs";
import castellbryn from "../data/kronenspiegel-castellbryn/edition.mjs";
import gwynthor from "../data/kronenspiegel-gwynthor/edition.mjs";
import mathragon from "../data/kronenspiegel-mathragon/edition.mjs";
import rhosmere from "../data/kronenspiegel-rhosmere/edition.mjs";
import {
  KRONENSPIEGEL_PUBLICATION_DAYS,
  isKronenspiegelPublicationDay
} from "../data/kronenspiegel/publication.mjs";
import {
  getNewspaperEntriesForPlace
} from "../assets/js/newspaper-registry.mjs";
import {
  getNewspaperDistributionPolicy,
  getRequiredNewspaperTitleIdsForPlace
} from "../assets/js/newspaper-distribution-policy.mjs";

const workspaceRoot = resolve(import.meta.dirname, "../..");
const wachtEditions = Object.freeze([gwynthor, abergwint, castellbryn, rhosmere]);
const editions = Object.freeze([mathragon, gwynthor, abergwint, castellbryn, rhosmere]);

test("Der Kronenspiegel liefert am Hauptsitz und allen vier Außenstandorten dieselbe cenyrweite Ausgabe", () => {
  const reference = nationalContentSnapshot(gwynthor);
  editions.forEach((newspaper) => {
    assert.equal(newspaper.titleId, "kronenspiegel");
    assert.equal(newspaper.name, "Der Kronenspiegel");
    assert.equal(newspaper.edition, "Gesamtausgabe Cenyr");
    assert.equal(newspaper.tagline, "Hart, aber fair.");
    assert.equal(newspaper.region, "Königreich Cenyr");
    assert.deepEqual(nationalContentSnapshot(newspaper), reference, newspaper.placeId);
  });
  assert.equal(new Set(editions.map((newspaper) => newspaper.id)).size, editions.length);
  assert.equal(new Set(editions.map((newspaper) => newspaper.printLocation)).size, editions.length);
});

test("Jeder Standort trennt die unveränderte Mathragoner Hauptredaktion von seinen lokalen Korrespondenten", () => {
  const centralIds = gwynthor.editorialSections[0].authorIds;
  assert.equal(centralIds.length, 8);

  editions.forEach((newspaper) => {
    assert.equal(newspaper.editorialSections.length, 2, newspaper.placeId);
    assert.equal(newspaper.editorialSections[0].title, "Die Hauptredaktion in Mathragon");
    assert.deepEqual(newspaper.editorialSections[0].authorIds, centralIds);
    assert.equal(newspaper.editorialSections[1].authorIds.length, 4);
    assert.match(newspaper.editorialSections[1].title, new RegExp(newspaper.location.name));
    assert.match(newspaper.editorialSections[1].description, /Ausgabe|Druck|Druckhaus/i);
    assert.equal(newspaper.authors.length, 12);
    assert.ok(newspaper.authors.slice(0, 8).every((author) => /unbesetzt/i.test(author.name)));
  });
});

test("Der Kronenspiegel erscheint ausschließlich am 1., 18. und letzten Monatstag", () => {
  assert.deepEqual(KRONENSPIEGEL_PUBLICATION_DAYS, [1, 18, 36]);
  [1, 18, 36].forEach((day) => assert.equal(isKronenspiegelPublicationDay({ day }), true));
  [2, 17, 19, 35].forEach((day) => assert.equal(isKronenspiegelPublicationDay({ day }), false));
  editions.forEach((newspaper) => {
    assert.deepEqual(newspaper.publicationSchedule.days, KRONENSPIEGEL_PUBLICATION_DAYS);
    assert.match(newspaper.publicationSchedule.label, /1\., 18\. und letzten Tag/);
  });
});

test("Die Verbreitungsregeln unterscheiden Weltblatt, cenyrweite Volkszeitung und Lokalzeitung", () => {
  assert.equal(getNewspaperDistributionPolicy("schwarzbote").placement, "all-settlements");
  assert.equal(getNewspaperDistributionPolicy("kronenspiegel").contentModel, "shared-national-issue");
  assert.equal(getNewspaperDistributionPolicy("celtigerns-echo").territoryId, "celtigerns-wacht");
  assert.deepEqual(
    getRequiredNewspaperTitleIdsForPlace({ kingdomId: "Cenyr", countyId: "Celtigerns Wacht", isMajorCity: true }),
    ["schwarzbote", "celtigerns-echo", "kronenspiegel"]
  );
  assert.deepEqual(
    getRequiredNewspaperTitleIdsForPlace({ kingdomId: "Cenyr", countyId: "Klaueninsel", isMajorCity: false }),
    ["schwarzbote"]
  );
});

test("Gwynthor, Abergwint, Castellbryn und Rhosmere führen den Kronenspiegel als drittes Blatt", () => {
  wachtEditions.forEach((newspaper) => {
    const entries = getNewspaperEntriesForPlace(newspaper.placeId);
    assert.equal(entries.length, newspaper.placeId === "gwynthor" ? 4 : 3, newspaper.placeId);
    assert.equal(entries[0].titleId, "schwarzbote");
    assert.equal(entries[1].titleId, "celtigerns-echo");
    assert.equal(entries[2].titleId, "kronenspiegel");
    assert.equal(entries[2].distribution.scope, "kingdom");
  });
});

test("Mathragon ist als Hauptsitz und kanonisches Kurzlink-Ziel erreichbar", () => {
  const entries = getNewspaperEntriesForPlace("mathragon");
  assert.equal(entries.length, 1);
  assert.equal(entries[0].id, "kronenspiegel-mathragon");
  assert.equal(entries[0].aliases.includes("kronenspiegel"), true);
  assert.match(mathragon.printLocation, /Hauptsitz und Zentraldruckerei/);
});

test("Kronenspiegel-Medien, Grundsatzartikel und blaues Thema liegen lokal vor", async () => {
  const [articleBody, issuePage, articlePage, themeStyles, placeStyles, sources] = await Promise.all([
    readFile(toWorkspacePath(gwynthor.articles[0].bodyPath), "utf8"),
    readFile(resolve(workspaceRoot, "Zeitungen/zeitung.html"), "utf8"),
    readFile(resolve(workspaceRoot, "Zeitungen/artikel.html"), "utf8"),
    readFile(resolve(workspaceRoot, "Zeitungen/assets/css/newspaper-kronenspiegel.css"), "utf8"),
    readFile(resolve(workspaceRoot, "Orte/assets/css/orte-place-press.css"), "utf8"),
    readFile(resolve(workspaceRoot, "Zeitungen/data/kronenspiegel/assets/sources.json"), "utf8")
  ]);
  assert.ok(articleBody.length > 1_000);
  assert.match(articleBody, /Klaueninseln/);
  assert.match(articleBody, /Hart, aber fair/);
  assert.match(issuePage, /newspaper-kronenspiegel\.css/);
  assert.match(articlePage, /newspaper-kronenspiegel\.css/);
  assert.match(themeStyles, /data-newspaper-theme="kronenspiegel"/);
  assert.match(themeStyles, /#315d91/);
  assert.match(themeStyles, /\.newspaper-edition-mark\s*\{[^}]*display:\s*flex[^}]*gap:/s);
  assert.match(themeStyles, /\.newspaper-edition-ink-stamp\s*\{[^}]*position:\s*static[^}]*width:\s*clamp\(120px, 10vw, 144px\)/s);
  assert.match(placeStyles, /data-newspaper-theme="kronenspiegel"/);
  assert.match(sources, /RTmmOPf|vs3qoUo|QQRJfsc/);

  await Promise.all([
    gwynthor.logo,
    gwynthor.imprints.inkStamp,
    gwynthor.imprints.waxSeal
  ].map((assetPath) => access(toWorkspacePath(assetPath))));
});

function nationalContentSnapshot(newspaper) {
  return {
    issueId: newspaper.issueId,
    publicationDate: newspaper.publicationDate,
    summary: newspaper.summary,
    articleTypes: newspaper.articleTypes,
    articles: newspaper.articles
  };
}

function toWorkspacePath(publicPath) {
  return resolve(workspaceRoot, decodeURIComponent(String(publicPath)).replace(/^\//, ""));
}
