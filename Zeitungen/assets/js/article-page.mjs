import {
  loadRequestedNewspaper,
  findArticle,
  findAuthor,
  findArticleType
} from "./newspaper-data-loader.mjs?v=20260903b";
import { element, imageWithFallback, renderError } from "./newspaper-dom.mjs?v=20260903a";
import { formatPublicationDate } from "./newspaper-aleria-date.mjs?v=20260903a";
import { buildIssueHref } from "./newspaper-archive.mjs?v=20260903a";

const root = document.querySelector("[data-newspaper-page]");
const allowedTags = new Set(["P", "H2", "H3", "H4", "BLOCKQUOTE", "HR", "B", "STRONG", "I", "EM", "BR"]);

start();

async function start() {
  if (!root) return;

  try {
    const { entry, newspaper, params } = await loadRequestedNewspaper();
    root.dataset.newspaperTheme = entry.themeId || "default";
    const articleId = params.get("artikel") || params.get("article") || "";
    const article = findArticle(newspaper, articleId);
    if (!article) {
      renderError(root, "Artikel nicht gefunden", "Dieser Artikel ist in der Ausgabe nicht verzeichnet.", buildIssueHref(newspaper.id, newspaper.issueId));
      return;
    }

    const [bodyResponse] = await Promise.all([fetch(article.bodyPath)]);
    if (!bodyResponse.ok) throw new Error("Der Artikeltext konnte nicht aus dem Archiv geladen werden.");
    const bodyHtml = await bodyResponse.text();
    const author = findAuthor(newspaper, article.authorId);
    const type = findArticleType(newspaper, article.typeId);
    document.title = `${article.title} – ${newspaper.name} | Aleria`;
    root.replaceChildren(renderArticle(newspaper, article, author, type, bodyHtml));
  } catch (error) {
    console.error(error);
    renderError(root, "Druckfehler", error.message || "Der Artikel konnte nicht geladen werden.");
  }
}

function renderArticle(newspaper, article, author, type, bodyHtml) {
  const publicationDate = formatPublicationDate(newspaper.publicationDate);
  return element("article", { className: "newspaper-sheet newspaper-reading-sheet" }, [
    renderBreadcrumbs(newspaper, article),
    element("header", { className: "newspaper-article-header", dataset: { articleType: type.id } }, [
      element("p", { className: "newspaper-article-flag", text: `${type.label} · ${publicationDate}` }),
      element("h1", { text: article.title }),
      element("p", { className: "newspaper-article-deck", text: article.teaser }),
      renderByline(author, article)
    ]),
    element("div", { className: "newspaper-reading-layout" }, [
      element("aside", { className: "newspaper-article-ledger" }, [
        element("h2", { text: "Blattangaben" }),
        element("dl", {}, [
          fact("Blatt", newspaper.name),
          fact("Ausgabe", newspaper.edition),
          fact("Datum", publicationDate),
          fact("Art", type.label),
          fact("Stil", article.tone),
          fact("Länge", article.length),
          fact("Sprache", article.language || newspaper.language)
        ]),
        element("a", { className: "newspaper-button", text: "Zur ganzen Ausgabe", href: buildIssueHref(newspaper.id, newspaper.issueId) })
      ]),
      renderArticleBody(bodyHtml)
    ]),
    element("footer", { className: "newspaper-article-footer" }, [
      element("span", { text: "❦", attributes: { "aria-hidden": "true" } }),
      element("a", { text: `${newspaper.name} – Ausgabe ${newspaper.edition}`, href: buildIssueHref(newspaper.id, newspaper.issueId) }),
      element("a", { text: `Zurück nach ${newspaper.location.name}`, href: newspaper.location.href })
    ])
  ]);
}

function renderBreadcrumbs(newspaper, article) {
  return element("nav", { className: "newspaper-breadcrumbs", attributes: { "aria-label": "Pfad" } }, [
    element("a", { text: newspaper.location.name, href: newspaper.location.href }),
    element("span", { text: "›", attributes: { "aria-hidden": "true" } }),
    element("a", { text: newspaper.name, href: buildIssueHref(newspaper.id, newspaper.issueId) }),
    element("span", { text: "›", attributes: { "aria-hidden": "true" } }),
    element("span", { text: article.title })
  ]);
}

function renderByline(author, article) {
  return element("div", { className: "newspaper-full-byline" }, [
    imageWithFallback(author.portrait, author.name, "newspaper-full-byline-portrait"),
    element("div", {}, [
      element("span", { text: "Verfasst von" }),
      element("strong", { text: author.name }),
      element("small", { text: `${author.role} · ${author.beat}` })
    ]),
    element("p", { text: article.bylineNote || "" })
  ]);
}

function renderArticleBody(bodyHtml) {
  const articleBody = element("div", { className: "newspaper-article-body" });
  const parsed = new DOMParser().parseFromString(`<main>${bodyHtml}</main>`, "text/html");
  const source = parsed.querySelector("main");
  if (!source) return articleBody;

  sanitizeTree(source);
  articleBody.append(...source.childNodes);
  return articleBody;
}

function sanitizeTree(rootNode) {
  [...rootNode.querySelectorAll("*")].forEach((node) => {
    if (!allowedTags.has(node.tagName)) {
      node.replaceWith(...node.childNodes);
      return;
    }
    [...node.attributes].forEach((attribute) => node.removeAttribute(attribute.name));
  });
}

function fact(label, value) {
  return element("div", {}, [
    element("dt", { text: label }),
    element("dd", { text: value })
  ]);
}
