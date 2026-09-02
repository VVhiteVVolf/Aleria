import {
  comparePublicationDates,
  formatPublicationDate,
  isValidPublicationDate
} from "./newspaper-aleria-date.mjs?v=20260903a";

export function getSortedIssues(entry) {
  return Object.freeze([...(entry?.issues || [])]
    .filter(isUsableIssue)
    .sort((left, right) => {
      const dateOrder = comparePublicationDates(right.publicationDate, left.publicationDate);
      return dateOrder || String(right.id).localeCompare(String(left.id), "de");
    }));
}

export function findIssueEntry(entry, requestedIssueId) {
  const issueId = normalizeIssueId(requestedIssueId);
  if (!issueId) return getLatestIssueEntry(entry);
  return getSortedIssues(entry).find((issue) => normalizeIssueId(issue.id) === issueId) || null;
}

export function getLatestIssueEntry(entry) {
  return getSortedIssues(entry)[0] || null;
}

export function getIssueNeighbors(entry, currentIssueId) {
  const issues = getSortedIssues(entry);
  const index = issues.findIndex((issue) => normalizeIssueId(issue.id) === normalizeIssueId(currentIssueId));
  if (index < 0) return Object.freeze({ newer: null, older: null });
  return Object.freeze({
    newer: issues[index - 1] || null,
    older: issues[index + 1] || null
  });
}

export function formatIssueLabel(issue) {
  return formatPublicationDate(issue?.publicationDate);
}

export function buildIssueHref(newspaperId, issueId = "") {
  const params = new URLSearchParams({ zeitung: String(newspaperId || "") });
  if (issueId) params.set("ausgabe", String(issueId));
  return `/Zeitungen/zeitung.html?${params.toString()}`;
}

export function buildArticleHref(newspaperId, issueId, articleId) {
  const params = new URLSearchParams({
    zeitung: String(newspaperId || ""),
    artikel: String(articleId || "")
  });
  if (issueId) params.set("ausgabe", String(issueId));
  return `/Zeitungen/artikel.html?${params.toString()}`;
}

function isUsableIssue(issue) {
  return Boolean(issue?.id && issue?.dataModule && isValidPublicationDate(issue.publicationDate));
}

function normalizeIssueId(value) {
  return String(value || "").trim().toLowerCase();
}
