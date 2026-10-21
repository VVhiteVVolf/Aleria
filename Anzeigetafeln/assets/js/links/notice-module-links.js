import { moduleHref, moduleMentions, normalizeModuleHref } from './notice-module-links-model.mjs';

function href(value) { return normalizeModuleHref(value, document.baseURI); }

function anchor(label, target) {
  const element = document.createElement('a');
  element.className = 'notice-module-link';
  element.href = target;
  element.target = '_blank';
  element.rel = 'noopener';
  element.textContent = label;
  return element;
}

function html(value) {
  if (!window.TAFEL_CONFIG?.boardId?.includes('-gwynthor-')) return value;
  const template = document.createElement('template');
  template.innerHTML = value;
  const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) if (!walker.currentNode.parentElement?.closest('a, button, script, style')) nodes.push(walker.currentNode);
  for (const node of nodes) {
    const mentions = moduleMentions(node.nodeValue);
    if (!mentions.length) continue;
    const fragment = document.createDocumentFragment();
    let offset = 0;
    for (const mention of mentions) {
      fragment.append(document.createTextNode(node.nodeValue.slice(offset, mention.index)), anchor(mention.text, moduleHref(mention.id)));
      offset = mention.index + mention.text.length;
    }
    fragment.append(document.createTextNode(node.nodeValue.slice(offset)));
    node.replaceWith(fragment);
  }
  return template.innerHTML;
}

export function initializeNoticeModuleLinks() {
  window.TafelNoticeModuleLinks = Object.freeze({ href, html, text: value => html(window.TafelRuntime.esc(value)) });
}
