import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";
import vm from "node:vm";
import {
  ALERIA_WEEKDAYS,
  NEWSPAPER_ALERIA_CALENDAR,
  formatPublicationDate
} from "../assets/js/newspaper-aleria-date.mjs";
import {
  buildArticleHref,
  buildIssueHref,
  findIssueEntry,
  getIssueNeighbors,
  getSortedIssues
} from "../assets/js/newspaper-archive.mjs";
import {
  findDefaultNewspaperEntryForPlace,
  getNewspaperEntries,
  getNewspaperEntriesForPlace
} from "../assets/js/newspaper-registry.mjs";

const root = resolve(import.meta.dirname, "../..");

test("Zeitungskalender entspricht dem Kalendervertrag des AleriaAlmanachs", async () => {
  const source = await readFile(resolve(root, "AleriaAlmanach/modules/core/aleria-calendar.js"), "utf8");
  const context = vm.createContext({});
  vm.runInContext(`${source}\nglobalThis.__calendarSnapshot = ALERIA_CALENDAR;`, context);
  const almanac = context.__calendarSnapshot;

  assert.deepEqual(Array.from(ALERIA_WEEKDAYS), Array.from(almanac.weekdays));
  assert.equal(NEWSPAPER_ALERIA_CALENDAR.daysPerWeek, almanac.daysPerWeek);
  assert.equal(NEWSPAPER_ALERIA_CALENDAR.daysPerMonth, almanac.daysPerMonth);
  assert.equal(NEWSPAPER_ALERIA_CALENDAR.monthsPerYear, almanac.monthsPerYear);
  assert.equal(formatPublicationDate({ year: 1740, month: 3, day: 10 }), "Ordanstag, 10.03 Jahr 1740");
  assert.equal(formatPublicationDate({ year: 1740, month: 3, day: 18 }), "Lyristag, 18.03 Jahr 1740");
});

test("Ausgaben werden kalendergerecht sortiert und über Monatsgrenzen durchblättert", () => {
  const entry = {
    issues: [
      issue("1740-03-09", 9, 3),
      issue("1740-02-36", 36, 2),
      issue("1740-03-18", 18, 3)
    ]
  };

  assert.deepEqual(
    Array.from(getSortedIssues(entry), (item) => item.id),
    ["1740-03-18", "1740-03-09", "1740-02-36"]
  );
  assert.equal(findIssueEntry(entry, "")?.id, "1740-03-18");
  assert.equal(findIssueEntry(entry, "1740-02-36")?.id, "1740-02-36");
  assert.equal(findIssueEntry(entry, "nicht-vorhanden"), null);
  assert.deepEqual(getIssueNeighbors(entry, "1740-03-09"), {
    newer: entry.issues[2],
    older: entry.issues[1]
  });
});

test("Ausgaben- und Artikellinks bewahren den gewählten Archivstand", () => {
  assert.equal(
    buildIssueHref("schwarzbote-gwynthor", "1740-03-18"),
    "/Zeitungen/zeitung.html?zeitung=schwarzbote-gwynthor&ausgabe=1740-03-18"
  );
  assert.equal(
    buildArticleHref("schwarzbote-gwynthor", "1740-03-18", "meldungen-vom-hafen"),
    "/Zeitungen/artikel.html?zeitung=schwarzbote-gwynthor&artikel=meldungen-vom-hafen&ausgabe=1740-03-18"
  );
});

test("Jeder vorbereitete Ort besitzt Schwarzboten und Celtigerns Echo mit eindeutigem Standardblatt", () => {
  const entries = getNewspaperEntries();
  assert.equal(entries.length, 8);
  const placeIds = new Set(entries.map((entry) => entry.placeId));
  for (const placeId of placeIds) {
    const placeEntries = getNewspaperEntriesForPlace(placeId);
    assert.equal(placeEntries.filter((entry) => entry.isDefaultForPlace).length, 1);
    assert.equal(new Set(placeEntries.map((entry) => entry.id)).size, placeEntries.length);
  }
  for (const placeId of ["gwynthor", "abergwint", "castellbryn", "rhosmere"]) {
    const placeEntries = getNewspaperEntriesForPlace(placeId);
    assert.equal(placeEntries.length, 2);
    assert.equal(findDefaultNewspaperEntryForPlace(placeId)?.titleId, "schwarzbote");
    assert.deepEqual(
      new Set(placeEntries.map((entry) => entry.titleId)),
      new Set(["schwarzbote", "celtigerns-echo"])
    );
    placeEntries.forEach((entry) => assert.equal(entry.issues[0].id, "1740-03-18"));
  }
});

function issue(id, day, month) {
  return Object.freeze({
    id,
    publicationDate: Object.freeze({ year: 1740, month, day }),
    dataModule: `/Zeitungen/data/test/issues/${id}.mjs`
  });
}
