import { parseFragment, serialize } from 'parse5';

// Parsed DOM fixture for the real archive render path. It implements the small
// browser surface used by that path, retaining identity and detached dialogs.
export function createArchiveRenderDocument() {
  const wrappers = new WeakMap();
  const descendants = node => (node.childNodes || []).flatMap(child => [child, ...descendants(child)]);
  const attr = (node, name) => node.attrs?.find(row => row.name === name)?.value;
  const setAttr = (node, name, value) => {
    node.attrs ||= [];
    const row = node.attrs.find(row => row.name === name);
    if (row) row.value = String(value); else node.attrs.push({ name, value: String(value) });
  };
  function matches(node, selector) {
    const not = selector.match(/:not\(([^)]+)\)/);
    if (not && matches(node, not[1])) return false;
    const clean = selector.replace(/:not\([^)]+\)/g, '');
    const id = clean.match(/#([\w-]+)/)?.[1];
    if (id && attr(node, 'id') !== id) return false;
    const classes = [...clean.matchAll(/\.([\w-]+)/g)].map(row => row[1]);
    if (!classes.every(name => (attr(node, 'class') || '').split(/\s+/).includes(name))) return false;
    for (const [, name, expected] of clean.matchAll(/\[([\w-]+)(?:="([^"]*)")?\]/g)) {
      const value = attr(node, name);
      if (value == null || expected != null && value !== expected) return false;
    }
    return !!node.tagName;
  }
  function select(node, selector) {
    const parts = selector.trim().split(/\s+(?![^[]*\])/);
    return descendants(node).filter(candidate => {
      if (!matches(candidate, parts.at(-1))) return false;
      let parent = candidate.parentNode;
      for (let index = parts.length - 2; index >= 0; index--) {
        while (parent && !matches(parent, parts[index])) parent = parent.parentNode;
        if (!parent) return false;
        parent = parent.parentNode;
      }
      return true;
    }).map(wrap);
  }
  const document = { activeElement: null, events: [], listeners: new Map(),
    createElement(tagName) { return wrap({ nodeName: tagName, tagName, attrs: [], namespaceURI: 'http://www.w3.org/1999/xhtml', childNodes: [] }); },
    createDocumentFragment() { return wrap({ nodeName: '#document-fragment', childNodes: [] }); },
    getElementById(id) { return this.querySelector(`#${id}`); },
    querySelector(selector) { return select(root, selector)[0] || null; },
    querySelectorAll(selector) { return select(root, selector); },
    addEventListener(type, listener) { this.listeners.set(type, listener); },
    dispatchEvent(event) { this.events.push(event.type); this.listeners.get(event.type)?.(event); },
    readyState: 'complete'
  };
  function wrap(node) {
    if (wrappers.has(node)) return wrappers.get(node);
    const element = { node, style: { setProperty() {} }, scrollTop: 0, value: '', selectionStart: 0, selectionEnd: 0,
      get id() { return attr(node, 'id') || ''; }, set id(value) { setAttr(node, 'id', value); },
      get className() { return attr(node, 'class') || ''; }, set className(value) { setAttr(node, 'class', value); },
      get hidden() { return attr(node, 'hidden') != null; }, set hidden(value) { if (value) setAttr(node, 'hidden', ''); else this.removeAttribute('hidden'); },
      get innerHTML() { return serialize(node); },
      set innerHTML(value) { node.childNodes = parseFragment(String(value)).childNodes; for (const child of node.childNodes) child.parentNode = node; },
      get textContent() { return descendants(node).filter(child => child.nodeName === '#text').map(child => child.value).join(''); },
      set textContent(value) { node.childNodes = [{ nodeName: '#text', value: String(value), parentNode: node }]; },
      appendChild(child) {
        const added = child.node.nodeName === '#document-fragment' ? child.node.childNodes : [child.node];
        for (const next of added) { next.parentNode = node; node.childNodes.push(next); }
        return child;
      },
      querySelector(selector) { return select(node, selector)[0] || null; },
      querySelectorAll(selector) { return select(node, selector); },
      setAttribute(name, value) { setAttr(node, name, value); },
      getAttribute(name) { return attr(node, name) ?? null; },
      removeAttribute(name) { node.attrs = (node.attrs || []).filter(row => row.name !== name); },
      addEventListener() {},
      contains(candidate) { return candidate?.node === node || descendants(node).includes(candidate?.node); },
      focus() { document.activeElement = this; },
      setSelectionRange(start, end) { this.selectionStart = start; this.selectionEnd = end; },
      insertAdjacentHTML(_position, markup) { const fragment = document.createDocumentFragment(); fragment.innerHTML = markup; this.appendChild(fragment); }
    };
    element.dataset = new Proxy({}, {
      get: (_target, key) => attr(node, `data-${String(key).replace(/[A-Z]/g, char => `-${char.toLowerCase()}`)}`),
      set: (_target, key, value) => { setAttr(node, `data-${String(key).replace(/[A-Z]/g, char => `-${char.toLowerCase()}`)}`, value); return true; }
    });
    element.classList = {
      contains: name => element.className.split(/\s+/).includes(name),
      toggle(name, forced) { const names = new Set(element.className.split(/\s+/).filter(Boolean)); const enabled = forced ?? !names.has(name);
        if (enabled) names.add(name); else names.delete(name); element.className = [...names].join(' '); return enabled; },
      add(name) { this.toggle(name, true); }, remove(name) { this.toggle(name, false); }
    };
    wrappers.set(node, element); return element;
  }
  const root = { nodeName: '#document-fragment', childNodes: [] };
  document.body = document.createElement('body'); root.childNodes.push(document.body.node); document.body.node.parentNode = root;
  document.body.innerHTML = '<div id="gallery-tabs"></div><main id="main-content"></main><section id="modal-overlay"><input id="draft-input"></section>';
  return document;
}
