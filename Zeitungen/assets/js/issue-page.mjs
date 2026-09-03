import {
  loadRequestedNewspaper,
  findAuthor,
  findArticleType
} from "./newspaper-data-loader.mjs?v=20260904b";
import { element, imageWithFallback, renderError } from "./newspaper-dom.mjs?v=20260903a";
import { formatPublicationDate } from "./newspaper-aleria-date.mjs?v=20260903a";
import {
  buildArticleHref,
  buildIssueHref,
  formatIssueLabel,
  getIssueNeighbors,
  getSortedIssues
} from "./newspaper-archive.mjs?v=20260903a";

const root = document.querySelector("[data-newspaper-page]");

start();

async function start() {
  if (!root) return;

  try {
    const { entry, issueEntry, newspaper } = await loadRequestedNewspaper();
    root.dataset.newspaperTheme = entry.themeId || "default";
    document.body.dataset.newspaperTheme = entry.themeId || "default";
    document.title = `${newspaper.name} – ${newspaper.edition} | Aleria`;
    root.replaceChildren(renderIssue(entry, issueEntry, newspaper));
  } catch (error) {
    console.error(error);
    renderError(root, "Ausgabe nicht gefunden", error.message || "Das Blatt konnte nicht geladen werden.");
  }
}

function renderIssue(entry, issueEntry, newspaper) {
  return element("article", { className: "newspaper-sheet newspaper-issue" }, [
    renderBreadcrumbs(newspaper),
    renderArchiveNavigation(entry, issueEntry),
    renderMasthead(newspaper),
    renderEditionSummary(newspaper),
    renderArticleSection(newspaper),
    renderTypeLegend(newspaper.articleTypes),
    renderAuthors(newspaper),
    renderColophon(newspaper)
  ]);
}

function renderArchiveNavigation(entry, issueEntry) {
  const issues = getSortedIssues(entry);
  const neighbors = getIssueNeighbors(entry, issueEntry.id);
  const select = element("select", {
    className: "newspaper-archive-select",
    attributes: { "aria-label": "Ausgabe auswählen" }
  }, issues.map((issue) => {
    const option = element("option", {
      text: formatIssueLabel(issue),
      attributes: { value: issue.id }
    });
    option.selected = issue.id === issueEntry.id;
    return option;
  }));

  select.addEventListener("change", () => {
    window.location.assign(buildIssueHref(entry.id, select.value));
  });

  return element("nav", {
    className: "newspaper-archive-navigation",
    attributes: { "aria-label": "Ausgabenarchiv" }
  }, [
    archiveDirectionLink(entry, neighbors.older, "← Ältere Ausgabe", "older"),
    element("label", { className: "newspaper-archive-picker" }, [
      element("span", { text: "Ausgabenarchiv" }),
      select
    ]),
    archiveDirectionLink(entry, neighbors.newer, "Neuere Ausgabe →", "newer")
  ]);
}

function archiveDirectionLink(entry, issue, label, direction) {
  if (!issue) {
    return element("span", {
      className: `newspaper-archive-direction is-disabled is-${direction}`,
      text: label,
      attributes: { "aria-disabled": "true" }
    });
  }
  return element("a", {
    className: `newspaper-archive-direction is-${direction}`,
    text: label,
    href: buildIssueHref(entry.id, issue.id)
  });
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
    renderEditionMark(newspaper),
    element("div", { className: "newspaper-masthead-center" }, [
      renderMastheadLogo(newspaper),
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

function renderMastheadLogo(newspaper) {
  if (!newspaper.showLogoInMasthead || !newspaper.logo) return null;
  return element("img", {
    className: "newspaper-masthead-logo",
    attributes: {
      src: newspaper.logo,
      alt: `Gildensymbol von ${newspaper.name}`,
      decoding: "async"
    }
  });
}

function renderEditionMark(newspaper) {
  return element("div", { className: "newspaper-edition-mark" }, [
    element("div", { className: "newspaper-edition-stamp" }, [
      element("span", { text: "Ausgabe" }),
      element("strong", { text: newspaper.edition })
    ]),
    renderDecorativeImprint(newspaper.imprints?.inkStamp, "newspaper-edition-ink-stamp")
  ]);
}

function renderEditionSummary(newspaper) {
  const publicationDate = formatPublicationDate(newspaper.publicationDate);
  return element("section", {
    className: "newspaper-edition-summary newspaper-ornament-section",
    attributes: { "aria-labelledby": "edition-summary-title" }
  }, [
    element("div", { className: "newspaper-section-heading" }, [
      element("p", { className: "newspaper-kicker", text: `Die Ausgabe zu ${newspaper.edition}` }),
      element("h2", { id: "edition-summary-title", text: "In dieser Ausgabe" })
    ]),
    element("p", { className: "newspaper-deck", text: newspaper.summary }),
    element("dl", { className: "newspaper-edition-ledger" }, [
      fact("Region", newspaper.region),
      fact("Druckort", newspaper.printLocation),
      fact("Sprache", newspaper.language),
      fact("Erscheinungsdatum", publicationDate),
      newspaper.publicationSchedule?.label
        ? fact("Erscheinungsweise", newspaper.publicationSchedule.label)
        : null
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
  const href = buildArticleHref(newspaper.id, newspaper.issueId, article.id);
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
  if (newspaper.editorialSections?.length) {
    const authorsById = new Map(newspaper.authors.map((author) => [author.id, author]));
    return element("div", { className: "newspaper-editorial-sections" }, newspaper.editorialSections.map((section) =>
      renderAuthorSection(section, section.authorIds.map((authorId) => authorsById.get(authorId)).filter(Boolean))
    ));
  }

  return renderAuthorSection({
    id: "redaktion",
    kicker: "Tinte, Gerücht und Wahrheit",
    title: `Die Redaktion zu ${newspaper.edition}`,
    description: ""
  }, newspaper.authors);
}

function renderAuthorSection(section, authors) {
  return element("section", {
    className: "newspaper-authors newspaper-ornament-section",
    dataset: { editorialSection: section.id },
    attributes: { "aria-labelledby": `authors-${section.id}-title` }
  }, [
    element("div", { className: "newspaper-section-heading" }, [
      element("p", { className: "newspaper-kicker", text: section.kicker || "Die Redaktion" }),
      element("h2", { id: `authors-${section.id}-title`, text: section.title || "Die Redaktion" })
    ]),
    section.description
      ? element("p", { className: "newspaper-editorial-description", text: section.description })
      : null,
    element("div", { className: "newspaper-author-grid" }, authors.map(renderAuthorCard))
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
    element("div", { className: "newspaper-colophon-copy" }, [
      element("span", { text: "❦", attributes: { "aria-hidden": "true" } }),
      element("p", { text: `Gedruckt beim ${newspaper.printLocation} · ${newspaper.edition} · ${publicationDate}` }),
      element("a", { text: `Zurück nach ${newspaper.location.name}`, href: newspaper.location.href })
    ]),
    element("div", { className: "newspaper-colophon-imprint", attributes: { "aria-hidden": "true" } }, [
      renderDecorativeImprint(newspaper.imprints?.waxSeal, "newspaper-colophon-wax-seal")
    ])
  ]);
}

function renderDecorativeImprint(source, className) {
  if (!source) return null;
  return element("img", {
    className,
    attributes: {
      src: source,
      alt: "",
      decoding: "async"
    }
  });
}

function fact(label, value) {
  return element("div", {}, [
    element("dt", { text: label }),
    element("dd", { text: value })
  ]);
}
