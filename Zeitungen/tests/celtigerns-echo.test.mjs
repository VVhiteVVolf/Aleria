import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";
import abergwint from "../data/celtigerns-echo-abergwint/edition.mjs";
import castellbryn from "../data/celtigerns-echo-castellbryn/edition.mjs";
import gwynthor from "../data/celtigerns-echo-gwynthor/edition.mjs";
import rhosmere from "../data/celtigerns-echo-rhosmere/edition.mjs";
import { getNewspaperEntriesForPlace } from "../assets/js/newspaper-registry.mjs";
import { HOUSE_FALCHDYN_FAMILY } from "../../Stammbäume/assets/js/data/house-falchdyn-family.js";
import { HOUSE_FALCHDYN_PORTRAITS } from "../../Stammbäume/assets/js/data/house-falchdyn-portraits.js";

const workspaceRoot = resolve(import.meta.dirname, "../..");
const namedEditorialIds = Object.freeze(Object.keys(HOUSE_FALCHDYN_PORTRAITS));
const youngerFalchdynWithoutRoles = Object.freeze([
  "tegid-falchdyn",
  "eluned-falchdyn",
  "gethin-falchdyn",
  "seren-falchdyn",
  "aled-falchdyn",
  "maredudd-falchdyn",
  "ffion-falchdyn",
  "idris-falchdyn"
]);

test("Gwynthors Celtigerns Echo führt alle portraitierten Falchdyn und vier freie Autorenstellen", () => {
  assert.equal(gwynthor.id, "celtigerns-echo-gwynthor");
  assert.equal(gwynthor.titleId, "celtigerns-echo");
  assert.equal(gwynthor.authors.length, 17);
  assert.equal(gwynthor.articleTypes.length, 8);
  assert.equal(gwynthor.articles.length, 1);

  const authorsById = new Map(gwynthor.authors.map((author) => [author.id, author]));
  namedEditorialIds.forEach((personId) => assert.ok(authorsById.has(personId), personId));
  assert.equal(gwynthor.authors.filter((author) => author.role === "Freie Autorenstelle").length, 4);
  assert.equal(authorsById.get("ceredig-falchdyn").role, "Lokalreporter von Gwynthors Bannkreis");
  assert.equal(authorsById.get("branwen-falchdyn").role, "Freche Nachwuchsreporterin");
  assert.equal(authorsById.get("taliesin-falchdyn").role, "Karikaturist und Satiriker");

  [
    ["catrin-spouse-falchdyn", "Catrin Pencaletwch"],
    ["enid-spouse-falchdyn", "Enid Braffwrdd"],
    ["lowri-spouse-falchdyn", "Lowri Llawen"],
    ["nerys-spouse-falchdyn", "Nerys Anfoesgarwch"]
  ].forEach(([personId, name]) => {
    assert.equal(authorsById.get(personId).name, name);
    assert.equal(authorsById.get(personId).role, "Autorin bei Celtigerns Echo");
  });
});

test("Falchdyns Lebensdaten, Namen und bewusst offene Sprösslingsprofile entsprechen der Redaktion", () => {
  const personsById = new Map(HOUSE_FALCHDYN_FAMILY.persons.map((person) => [person.id, person]));

  ["dafydd-falchdyn", "iorwerth-falchdyn"].forEach((personId) => {
    assert.equal(personsById.get(personId).status, "alive");
    assert.equal(personsById.get(personId).death, "");
  });
  [
    ["catrin-spouse-falchdyn", "Catrin Pencaletwch"],
    ["enid-spouse-falchdyn", "Enid Braffwrdd"],
    ["lowri-spouse-falchdyn", "Lowri Llawen"],
    ["nerys-spouse-falchdyn", "Nerys Anfoesgarwch"]
  ].forEach(([personId, name]) => {
    assert.equal(personsById.get(personId).name, name);
    assert.equal(personsById.get(personId).title, "Autorin bei Celtigerns Echo");
  });
  youngerFalchdynWithoutRoles.forEach((personId) => {
    assert.equal(personsById.get(personId).title, "", personId);
    assert.deepEqual(personsById.get(personId).tags, [], personId);
  });
});

test("Alle Falchdyn-Portraits und Druckzeichen liegen lokal und webtauglich vor", async () => {
  const portraitSources = JSON.parse(await readFile(resolve(
    workspaceRoot,
    "Stammbäume/assets/images/portraits/haus-falchdyn/portrait-sources.json"
  ), "utf8"));
  assert.deepEqual(Object.keys(portraitSources), namedEditorialIds);

  await Promise.all(Object.values(HOUSE_FALCHDYN_PORTRAITS).map(async (portraitPath) => {
    const absolutePath = toWorkspacePath(`/Stammbäume/${portraitPath}`);
    const bytes = await readFile(absolutePath);
    assert.equal(bytes.subarray(0, 4).toString("ascii"), "RIFF");
    assert.ok(bytes.length < 1_000_000, portraitPath);
  }));

  await Promise.all([
    gwynthor.logo,
    gwynthor.imprints.inkStamp,
    gwynthor.imprints.waxSeal,
    gwynthor.articles[0].bodyPath
  ].map((assetPath) => access(toWorkspacePath(assetPath))));
});

test("Abergwint, Castellbryn und Rhosmere besitzen getrennte, unbesetzte Echo-Redaktionen", () => {
  [abergwint, castellbryn, rhosmere].forEach((edition) => {
    assert.equal(edition.titleId, "celtigerns-echo");
    assert.equal(edition.authors.length, 8, edition.edition);
    assert.ok(edition.authors.every((author) => author.role === "Freie Autorenstelle"), edition.edition);
    assert.equal(edition.articles.length, 1, edition.edition);
    assert.match(edition.summary, /noch nicht besetzt/);
  });
});

test("Jede große Stadt bietet Celtigerns Echo als zweite Alternative zum Schwarzboten", () => {
  for (const placeId of ["gwynthor", "abergwint", "castellbryn", "rhosmere"]) {
    const entries = getNewspaperEntriesForPlace(placeId);
    assert.equal(entries.length, 2, placeId);
    assert.equal(entries[0].titleId, "schwarzbote", placeId);
    assert.equal(entries[0].isDefaultForPlace, true, placeId);
    assert.equal(entries[1].titleId, "celtigerns-echo", placeId);
    assert.notEqual(entries[1].isDefaultForPlace, true, placeId);
  }
});

test("Celtigerns Echo besitzt ein gekapseltes freundlicheres Zeitungsthema", async () => {
  const [issuePage, articlePage, issueModule, articleModule, dataLoader, themeStyles, placeStyles] = await Promise.all([
    readFile(resolve(workspaceRoot, "Zeitungen/zeitung.html"), "utf8"),
    readFile(resolve(workspaceRoot, "Zeitungen/artikel.html"), "utf8"),
    readFile(resolve(workspaceRoot, "Zeitungen/assets/js/issue-page.mjs"), "utf8"),
    readFile(resolve(workspaceRoot, "Zeitungen/assets/js/article-page.mjs"), "utf8"),
    readFile(resolve(workspaceRoot, "Zeitungen/assets/js/newspaper-data-loader.mjs"), "utf8"),
    readFile(resolve(workspaceRoot, "Zeitungen/assets/css/newspaper-celtigerns-echo.css"), "utf8"),
    readFile(resolve(workspaceRoot, "Orte/assets/css/orte-place-press.css"), "utf8")
  ]);
  assert.match(issuePage, /newspaper-celtigerns-echo\.css/);
  assert.match(issuePage, /issue-page\.mjs\?v=20260903b/);
  assert.match(articlePage, /newspaper-celtigerns-echo\.css/);
  assert.match(articlePage, /article-page\.mjs\?v=20260903b/);
  assert.match(issueModule, /newspaper-data-loader\.mjs\?v=20260903b/);
  assert.match(articleModule, /newspaper-data-loader\.mjs\?v=20260903b/);
  assert.match(dataLoader, /newspaper-registry\.mjs\?v=20260903b/);
  assert.match(themeStyles, /data-newspaper-theme="celtigerns-echo"/);
  assert.match(themeStyles, /#fff5d9/);
  assert.match(placeStyles, /data-newspaper-theme="celtigerns-echo"/);
});

function toWorkspacePath(publicPath) {
  return resolve(workspaceRoot, decodeURIComponent(String(publicPath)).replace(/^\//, ""));
}
