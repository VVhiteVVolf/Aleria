export function element(tagName, options = {}, children = []) {
  const node = document.createElement(tagName);
  if (options.className) node.className = options.className;
  if (options.text !== undefined) node.textContent = String(options.text);
  if (options.href) node.href = options.href;
  if (options.id) node.id = options.id;
  if (options.dataset) {
    Object.entries(options.dataset).forEach(([key, value]) => {
      node.dataset[key] = String(value);
    });
  }
  if (options.attributes) {
    Object.entries(options.attributes).forEach(([name, value]) => {
      node.setAttribute(name, String(value));
    });
  }
  node.append(...children.filter(Boolean));
  return node;
}

export function imageWithFallback(source, alt, className) {
  const frame = element("span", { className: `${className}-frame` });
  const image = element("img", {
    className,
    attributes: {
      src: source,
      alt,
      decoding: "async"
    }
  });
  const fallback = element("span", {
    className: `${className}-fallback`,
    text: initials(alt),
    attributes: { "aria-hidden": "true" }
  });

  image.addEventListener("error", () => {
    image.remove();
    frame.classList.add("is-missing");
  }, { once: true });
  frame.append(image, fallback);
  return frame;
}

export function renderError(root, title, message, backHref = "") {
  const actions = backHref
    ? [element("a", { className: "newspaper-button", text: "Zurück zum Blatt", href: backHref })]
    : [];
  root.replaceChildren(element("section", { className: "newspaper-error" }, [
    element("p", { className: "newspaper-kicker", text: "Archivnotiz" }),
    element("h1", { text: title }),
    element("p", { text: message }),
    ...actions
  ]));
}

function initials(value) {
  return String(value || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "?";
}
