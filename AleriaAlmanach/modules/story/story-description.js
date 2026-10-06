(function(root) {
  const paragraphTags = new Set(['P', 'DIV']);

  function isEmptyParagraph(element) {
    return !element.textContent.trim()
      && !element.querySelector('span[data-tip], .module-tooltip, .module-tooltip-popover');
  }

  function normalizeParagraphs(container) {
    const isParagraphContainer = container.nodeType === 11 || paragraphTags.has(container.nodeName);
    Array.from(container.children).forEach(element => {
      normalizeParagraphs(element);
      if (paragraphTags.has(element.tagName) && isEmptyParagraph(element)) element.remove();
    });

    Array.from(container.childNodes).forEach(node => {
      if (node.nodeType !== 3) return;
      // In rich HTML, source line endings are whitespace. Authored <br> stays intact.
      node.textContent = node.textContent.replace(/\r\n?|\n/g, ' ');
      if (node.textContent.trim()) return;
      const previous = node.previousSibling;
      const next = node.nextSibling;
      if ((isParagraphContainer && (!previous || !next))
        || paragraphTags.has(previous?.nodeName) || paragraphTags.has(next?.nodeName)) {
        node.remove();
      }
    });
  }

  function renderDescription(value, { sanitizeHtml }) {
    const source = String(value ?? '');
    let description = source;
    if (/<(?:p|div)(?=[\s/>])/i.test(source)) {
      const template = document.createElement('template');
      template.innerHTML = source;
      normalizeParagraphs(template.content);
      description = template.innerHTML;
    }
    // Keep the shared sanitizer and plain-text line breaks unchanged for other features.
    return `<div class="modal-description modal-story-description">${sanitizeHtml(description)}</div>`;
  }

  root.AleriaStoryContent = Object.freeze({ renderDescription });
})(globalThis);
