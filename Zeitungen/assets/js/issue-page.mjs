import {
  loadRequestedNewspaper,
  findAuthor,
  findArticleType
} from "./newspaper-data-loader.mjs";
import { element, imageWithFallback, renderError } from "./newspaper-dom.mjs";
import { formatPublicationDate } from "./newspaper-aleria-date.mjs";

const root = document.querySelector("[data-newspaper-page]");

start();

async function start() {
  if (!root) return;

  try {
    const { newspaper } = await loadRequestedNewspaper();
    document.title = `${newspaper.name} – ${newspaper.edition} | Aleria`;
    root.replaceChildren(renderIssue(newspaper));
  } catch (error) {
    console.error(error);
    renderError(root, "Ausgabe nicht gefunden", error.message || "Das Blatt konnte nicht geladen werden.");
  }
}

function renderIssue(newspaper) {
  return element("article", { className: "newspaper-sheet newspaper-issue" }, [
    renderBreadcrumbs(newspaper),
    renderMasthead(newspaper),
    renderEditionSummary(newspaper),
    renderArticleSection(newspaper),
    renderTypeLegend(newspaper.articleTypes),
    renderAuthors(newspaper),
    renderColophon(newspaper)
  ]);
}

function renderBreadcrumbs(newspaper) {
  return element("nav", {
    className: "newspaper-breadcrumbs",
    attributes: { "aria-label": "Pfad" }
  }, [
    element("a", { text: newspaper.location.name, href: newspaper.location.href }),
    element("span", { text: "›", attributes: { "aria-hidden": "true" } }),
    element("span", { text: `${newspaper.name} – ${newspaper.edition}` })
  ]);
}

function renderMasthead(newspaper) {
  const publicationDate = formatPublicationDate(newspaper.publicationDate);
  return element("header", { className: "newspaper-masthead" }, [
    element("div", { className: "newspaper-edition-stamp" }, [
      element("span", { text: "Ausgabe" }),
      element("strong", { text: newspaper.edition })
    ]),
    element("div", { className: "newspaper-masthead-center" }, [
      element("p", { className: "newspaper-kicker", text: newspaper.tagline }),
      element("h1", { text: newspaper.name }),
      element("p", { className: "newspaper-subtitle", text: newspaper.subtitle })
    ]),
    element("dl", { className: "newspaper-quick-facts" }, [
      fact("Datum", publicationDate),
      fact("Preis", newspaper.price),
      fact("Artikel", newspaper.articles.length)
    ])
  ]);
}

function renderEditionSummary(newspaper) {
  const publicationDate = formatPublicationDate(newspaper.publicationDate);
  return element("section", {
    className: "newspaper-edition-summary newspaper-ornament-section",
    attributes: { "aria-labelledby": "edition-summary-title" }
  }, [
    element("div", { className: "newspaper-section-heading" }, [
      element("p", { className: "newspaper-kicker", text: "Das Gwynthorer Blatt" }),
      element("h2", { id: "edition-summary-title", text: "In dieser Ausgabe" })
    ]),
    element("p", { className: "newspaper-deck", text: newspaper.summary }),
    element("dl", { className: "newspaper-edition-ledger" }, [
      fact("Region", newspaper.region),
      fact("Druckort", newspaper.printLocation),
      fact("Sprache", newspaper.language),
      fact("Erscheinungsdatum", publicationDate)
    ])
  ]);
}

function renderArticleSection(newspaper) {
  const cards = newspaper.articles.map((article, index) => renderArticleCard(newspaper, article, index));
  return element("section", {
    className: "newspaper-articles newspaper-ornament-section",
    attributes: { "aria-labelledby": "articles-title" }
  }, [
    element("div", { className: "newspaper-section-heading" }, [
      element("p", { className: "newspaper-kicker", text: "Gedruckt & versiegelt" }),
      element("h2", { id: "articles-title", text: "Artikel dieser Ausgabe" })
    ]),
    element("div", { className: "newspaper-article-grid" }, cards)
  ]);
}

function renderArticleCard(newspaper, article, index) {
  const author = findAuthor(newspaper, article.authorId);
  const type = findArticleType(newspaper, article.typeId);
  const href = articleHref(newspaper.id, article.id);
  const portrait = imageWithFallback(author.portrait, author.name, "newspaper-article-portrait");

  return element("article", {
    className: `newspaper-article-card${index === 0 ? " is-lead" : ""}`,
    dataset: { articleType: type.id }
  }, [
    element("div", { className: "newspaper-article-ribbon" }, [
      element("span", { className: "newspaper-type-label", text: type.label }),
      element("span", { className: "newspaper-length", text: article.length })
    ]),
    element("div", { className: "newspaper-article-card-copy" }, [
      element("h3", {}, [element("a", { text: article.title, href })]),
      element("p", { className: "newspaper-article-teaser", text: article.teaser }),
      element("p", { className: "newspaper-article-tone", text: article.tone })
    ]),
    element("footer", { className: "newspaper-article-byline" }, [
      portrait,
      element("span", { className: "newspaper-byline-copy" }, [
        element("small", { text: "Aus der Feder von" }),
        element("strong", { text: author.name }),
        element("span", { text: author.beat })
      ]),
      element("a", {
        className: "newspaper-read-link",
        text: "Artikel lesen",
        href,
        attributes: { "aria-label": `„${article.title}“ lesen` }
      })
    ])
  ]);
}

function renderTypeLegend(articleTypes) {
  return element("section", {
    className: "newspaper-types newspaper-ornament-section",
    attributes: { "aria-labelledby": "types-title" }
  }, [
    element("div", { className: "newspaper-section-heading" }, [
      element("p", { className: "newspaper-kicker", text: "Die Spalten des Blattes" }),
      element("h2", { id: "types-title", text: "Artikelarten" })
    ]),
    element("div", { className: "newspaper-type-grid" }, articleTypes.map((type) =>
      element("article", { className: "newspaper-type-card", dataset: { articleType: type.id } }, [
        element("h3", { text: type.label }),
        element("p", { text: type.description })
      ])
    ))
  ]);
}

function renderAuthors(newspaper) {
  return element("section", {
    className: "newspaper-authors newspaper-ornament-section",
    attributes: { "aria-labelledby": "authors-title" }
  }, [
    element("div", { className: "newspaper-section-heading" }, [
      element("p", { className: "newspaper-kicker", text: "Tinte, Gerücht und Wahrheit" }),
      element("h2", { id: "authors-title", text: "Die Redaktion zu Gwynthor" })
    ]),
    element("div", { className: "newspaper-author-grid" }, newspaper.authors.map(renderAuthorCard))
  ]);
}

function renderAuthorCard(author) {
  const portrait = imageWithFallback(author.portrait, author.name, "newspaper-author-portrait");
  return element("article", { className: "newspaper-author-card" }, [
    element("div", { className: "newspaper-author-visual" }, [
      portrait,
      element("p", { className: "newspaper-author-role", text: author.role }),
      element("h3", { text: author.name }),
      element("p", { className: "newspaper-author-beat", text: author.beat })
    ]),
    element("div", { className: "newspaper-author-biography" }, author.biography.map((paragraph) =>
      element("p", { text: paragraph })
    ))
  ]);
}

function renderColophon(newspaper) {
  const publicationDate = formatPublicationDate(newspaper.publicationDate);
  return element("footer", { className: "newspaper-colophon" }, [
    element("span", { text: "❦", attributes: { "aria-hidden": "true" } }),
    element("p", { text: `Gedruckt beim ${newspaper.printLocation} · ${newspaper.edition} · ${publicationDate}` }),
    element("a", { text: `Zurück nach ${newspaper.location.name}`, href: newspaper.location.href })
  ]);
}

function fact(label, value) {
  return element("div", {}, [
    element("dt", { text: label }),
    element("dd", { text: value })
  ]);
}

function articleHref(newspaperId, articleId) {
  return `/Zeitungen/artikel.html?zeitung=${encodeURIComponent(newspaperId)}&artikel=${encodeURIComponent(articleId)}`;
}
