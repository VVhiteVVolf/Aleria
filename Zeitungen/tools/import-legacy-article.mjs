import { readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const options = readOptions(process.argv.slice(2));
if (!options.source || !options.target || !options.title) {
  throw new Error("Erwartet: --source <HTML-Datei> --target <Zieldatei> --title <Artikeltitel>");
}

const legacyHtml = await readFile(options.source, "utf8");
const articleHtml = extractArticleBody(legacyHtml);
const cleanHtml = cleanArticleBody(articleHtml, options.title);

if (cleanHtml.length < 300) {
  throw new Error(`Der extrahierte Artikel „${options.title}“ ist unerwartet kurz.`);
}

await mkdir(dirname(options.target), { recursive: true });
await writeFile(options.target, `${cleanHtml.trim()}\n`, "utf8");

function extractArticleBody(html) {
  const tableMarker = "background-color:rgb(212,184,140)";
  const tablePosition = html.indexOf(tableMarker);
  if (tablePosition < 0) throw new Error("Die Inhaltstabelle des alten Artikels wurde nicht gefunden.");

  const cellPosition = html.indexOf("<td", tablePosition);
  const contentPosition = html.indexOf(">", cellPosition) + 1;
  const endPosition = html.indexOf("</td>", contentPosition);
  if (cellPosition < 0 || contentPosition <= 0 || endPosition < 0) {
    throw new Error("Der eigentliche Artikeltext konnte nicht abgegrenzt werden.");
  }
  return html.slice(contentPosition, endPosition);
}

function cleanArticleBody(html, title) {
  let clean = html
    .replace(/<!--[^]*?-->/g, "")
    .replace(/<script\b[^]*?<\/script>/gi, "")
    .replace(/<style\b[^]*?<\/style>/gi, "")
    .replace(/<a\b[^>]*>/gi, "")
    .replace(/<\/a>/gi, "")
    .replace(/<\/?(?:span|font|u)\b[^>]*>/gi, "")
    .replace(/<(\/?)(p|h2|h3|h4|blockquote|b|strong|i|em)\b[^>]*>/gi, "<$1$2>")
    .replace(/<br\b[^>]*\/?\s*>/gi, "<br>")
    .replace(/<hr\b[^>]*\/?\s*>/gi, "<hr>")
    .replace(/<(?!\/?(?:p|h2|h3|h4|blockquote|b|strong|i|em)\b|(?:br|hr)\b)[^>]+>/gi, "")
    .replace(/\u200b/g, "")
    .replace(/<p>\s*(?:&nbsp;|\u00a0|\s)*<\/p>/gi, "")
    .replace(/<p>\s*<br>\s*/gi, "<p>")
    .replace(/<p>\s*<b>([^<]{1,120})<\/b>\s*<\/p>/gi, "<h2>$1</h2>")
    .replace(/<p>\s*((?:Einleitung|Fazit|[IVX]+)\s*:[^<]{0,120})\s*<\/p>/gi, "<h2>$1</h2>")
    .replace(/<p>\s*<i>\s*(&quot;|„)([^]*?)(?:&quot;|“)\s*<\/i>\s*<\/p>/i, "<blockquote><p><i>$1$2&ldquo;</i></p></blockquote>")
    .replace(/<blockquote>\s*<p>\s*<i>\s*&quot;\.*Zitat\.*&ldquo;\s*<\/i>\s*<\/p>\s*<\/blockquote>/gi, "")
    .replace(/\n[\t ]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const firstParagraph = clean.match(/^<p>([^]*?)<\/p>/i);
  if (firstParagraph) {
    const firstText = normalizeText(firstParagraph[1]);
    const expectedTitle = normalizeText(title);
    if (firstText === expectedTitle || firstText.startsWith(expectedTitle) || expectedTitle.startsWith(firstText)) {
      clean = clean.slice(firstParagraph[0].length).trimStart();
    }
  }

  return clean;
}

function normalizeText(value) {
  return decodeCommonEntities(String(value || "").replace(/<[^>]+>/g, ""))
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function decodeCommonEntities(value) {
  return value
    .replace(/&auml;/gi, "ä")
    .replace(/&ouml;/gi, "ö")
    .replace(/&uuml;/gi, "ü")
    .replace(/&szlig;/gi, "ß")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&nbsp;/gi, " ");
}

function readOptions(args) {
  const values = {};
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index]?.replace(/^--/, "");
    if (key) values[key] = args[index + 1] || "";
  }
  return values;
}
