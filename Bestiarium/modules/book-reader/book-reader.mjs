import { paginateBook, findAnchorPage, createLeaf } from './book-pagination.mjs?v=20260909-books-v2';
import { createBookAnimation } from './book-animation.mjs';

export function mountBookReader(root) {
  const element = role => root.querySelector(`[data-role="${role}"]`);
  const action = name => root.querySelector(`[data-action="${name}"]`);
  const source = element('source');
  const mount = element('mount');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const lifetime = new AbortController();
  let session = null;
  let animation = null;
  let pages = [];
  let visible = [];
  let position = null;
  let mode = 'article';
  let generation = 0;
  let timer = null;
  let resize = null;
  let lastWidth = 0;
  let lastHeight = 0;
  let opening = false;
  let hasOpened = false;

  const message = text => { element('message').textContent = text; element('message').hidden = !text; };
  const readAnchor = node => node ? { id: node.dataset.bookAnchor, offset: Number(node.dataset.bookOffset || 0) } : null;
  function currentAnchor() {
    const focused = document.activeElement?.closest('[data-book-anchor]');
    if (focused && root.contains(focused)) return readAnchor(focused);
    if (mode === 'article') {
      const nodes = [...source.children];
      return readAnchor(nodes.find(node => node.getBoundingClientRect().bottom > 0)) || position;
    }
    return position || readAnchor(visible.flatMap(index => [...pages[index].querySelectorAll('[data-book-anchor]')])[0]);
  }

  function stop() {
    generation++;
    opening = false;
    clearTimeout(timer);
    resize?.disconnect(); resize = null;
    session?.abort(); session = null;
    animation?.destroy(); animation = null;
    mount.replaceChildren();
    mount.removeAttribute('data-open');
    pages = []; visible = [];
    root.removeAttribute('aria-busy');
  }

  function showMode(next) {
    mode = next;
    root.dataset.mode = next;
    source.hidden = next !== 'article';
    element('stage').hidden = next === 'article';
    action('book-view').setAttribute('aria-pressed', String(next !== 'article'));
    action('article-view').setAttribute('aria-pressed', String(next === 'article'));
    action('close-book').hidden = next !== 'book';
    element('controls').hidden = next !== 'book';
    element('closed').hidden = next !== 'closed';
    mount.hidden = next === 'closed';
  }

  function article(focus = false) {
    const saved = currentAnchor();
    stop(); showMode('article');
    position = saved;
    if (focus) {
      const target = [...source.children].find(node => node.dataset.bookAnchor === saved?.id) || source;
      target.tabIndex = -1;
      target.focus({ preventScroll: true });
      target.scrollIntoView({ block: 'center', behavior: 'instant' });
    }
  }
  function close() {
    position = currentAnchor();
    stop(); showMode('closed');
    action('open-book').focus({ preventScroll: true });
  }
  function updatePage(state) {
    visible = state.visible;
    const first = visible.flatMap(index => [...pages[index].querySelectorAll('[data-book-anchor]')])[0];
    if (first) position = readAnchor(first);
    const text = state.index === 0 ? 'Einband' : state.index === pages.length - 1 ? 'Buchende' : `Seite ${state.index}${state.visible.length > 1 ? `–${Math.min(state.index + 1, pages.length - 2)}` : ''} von ${pages.length - 2}`;
    element('page-status').textContent = text;
    element('page-status').dataset.page = String(state.index);
    action('previous').disabled = state.index === 0;
    action('next').disabled = state.visible.includes(pages.length - 1);
    mount.dataset.orientation = state.portrait ? 'portrait' : 'landscape';
    mount.dataset.open = String(state.index !== 0 && state.index !== pages.length - 1);
  }
  function goToAnchor(id, focus = true) {
    const original = [...source.children].find(node => node.dataset.bookAnchor === id);
    if (!original) return false;
    if (mode === 'book' && animation) {
      animation.goTo(findAnchorPage(pages, { id, offset: 0 }));
      position = { id, offset: 0 };
      const target = visible.flatMap(index => [...pages[index].querySelectorAll('[data-book-anchor]')]).find(node => node.dataset.bookAnchor === id);
      if (focus && target) { target.tabIndex = -1; target.focus({ preventScroll: true }); }
      mount.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    } else if (mode === 'closed') {
      position = { id, offset: 0 };
      void open(true);
    } else if (mode === 'article' && focus) {
      position = { id, offset: 0 };
      original.tabIndex = -1; original.focus({ preventScroll: true });
      original.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
    return true;
  }

  async function waitForAssets(signal) {
    await Promise.race([document.fonts.ready, new Promise(resolve => signal.addEventListener('abort', resolve, { once: true }))]);
    if (signal.aborted) return;
    await Promise.all([...source.querySelectorAll('img')].map(img => {
      if (img.complete) return Promise.resolve();
      img.loading = 'eager';
      return new Promise(resolve => {
        img.addEventListener('load', resolve, { once: true, signal });
        img.addEventListener('error', resolve, { once: true, signal });
        signal.addEventListener('abort', resolve, { once: true });
      });
    }));
  }

  async function open(focus = false) {
    if (motion.matches) { article(focus); message('Reduzierte Bewegung ist aktiviert. Du liest das vollständige Werk in der Artikelansicht.'); return; }
    // Focusing the toolbar can scroll the article to its top before the click.
    // Keep the stored reading anchor when returning from that view.
    if (hasOpened && mode !== 'article') position = currentAnchor();
    hasOpened = true;
    stop(); showMode('book');
    const run = generation;
    session = new AbortController();
    const signal = session.signal;
    opening = true;
    root.setAttribute('aria-busy', 'true');
    message('Die Buchseiten werden gesetzt …');
    try {
      await waitForAssets(signal);
      if (signal.aborted) return;
      // Keep a readable page width; the same dimensions drive measurement and animation.
      const available = Math.min(960, mount.parentElement.clientWidth - parseFloat(getComputedStyle(mount.parentElement).paddingLeft) - parseFloat(getComputedStyle(mount.parentElement).paddingRight));
      const portrait = available < 760;
      const width = Math.floor(available / (portrait ? 1 : 2));
      const height = Math.round(Math.max(560, Math.min(720, innerHeight * .8)));
      mount.style.width = `${portrait ? width : width * 2}px`;
      root.style.setProperty('--book-width', `${width}px`);
      root.style.setProperty('--book-height', `${height}px`);
      lastWidth = root.clientWidth; lastHeight = innerHeight;
      const content = paginateBook(source, mount, { width, height, title: root.dataset.title });
      if (content.length % 2) {
        const blank = createLeaf(root.dataset.title, content.length + 1);
        blank.body.innerHTML = '<p class="book-end-mark" aria-label="Ende der Abschrift">❧</p>';
        content.push(blank.leaf);
      }
      pages = [element('front-cover').content.firstElementChild.cloneNode(true), ...content, element('back-cover').content.firstElementChild.cloneNode(true)];
      const saved = position;
      const instance = await createBookAnimation(mount, pages, { width, height, startPage: findAnchorPage(pages, saved) }, updatePage, signal);
      if (signal.aborted || generation !== run) { instance?.destroy(); return; }
      animation = instance;
      position = saved || position;
      opening = false;
      root.removeAttribute('aria-busy');
      message('');
      if (focus) mount.focus({ preventScroll: true });
      resize = new ResizeObserver(scheduleLayout);
      resize.observe(root);
      window.addEventListener('resize', scheduleLayout, { signal });
      document.fonts.addEventListener('loadingdone', () => scheduleLayout(true), { signal });
      source.addEventListener('load', () => scheduleLayout(true), { capture: true, signal });
      source.addEventListener('error', () => scheduleLayout(true), { capture: true, signal });
      if (location.hash && !saved) goToAnchor(decodeHash(), false);
    } catch (error) {
      if (signal.aborted || generation !== run) return;
      article(focus);
      message('Die Buchansicht konnte nicht aufgebaut werden. Der vollständige Artikel bleibt hier lesbar.');
      console.error('Book reader:', error);
    }
  }
  function scheduleLayout(force = false) {
    if (mode !== 'book' || opening) return;
    if (force !== true && Math.abs(root.clientWidth - lastWidth) < 2 && Math.abs(innerHeight - lastHeight) < 2) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      // Preserve an active selection; resize after the user finishes selecting.
      const selection = getSelection();
      if (selection && !selection.isCollapsed && mount.contains(selection.anchorNode)) { scheduleLayout(true); return; }
      void open(mount.contains(document.activeElement));
    }, 180);
  }
  function decodeHash() {
    try { return decodeURIComponent(location.hash.slice(1)); } catch { return ''; }
  }

  root.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (button && root.contains(button)) {
      switch (button.dataset.action) {
        case 'open-book': case 'book-view': if (mode !== 'book') void open(true); break;
        case 'article-view': article(true); message(''); break;
        case 'close-book': close(); break;
        case 'previous': animation?.turn('previous'); break;
        case 'next': animation?.turn('next'); break;
      }
    }
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const id = decodeURIComponent(link.hash.slice(1));
    if (goToAnchor(id)) {
      event.preventDefault();
      history.pushState(history.state, '', link.hash);
      root.querySelector('.book-contents').open = false;
    }
  }, { signal: lifetime.signal });
  root.addEventListener('keydown', event => {
    if (mode !== 'book' || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.target.closest('input, textarea, select, [contenteditable="true"], .book-overflow-viewport, .book-table-wrap')) return;
    if (getSelection()?.isCollapsed === false && event.key !== 'Escape') return;
    if (event.key === 'Escape') { event.preventDefault(); close(); }
    else if (event.target.closest('a, summary')) return;
    else if (event.key === 'ArrowRight' || event.key === 'PageDown') { event.preventDefault(); animation?.turn('next'); }
    else if (event.key === 'ArrowLeft' || event.key === 'PageUp') { event.preventDefault(); animation?.turn('previous'); }
    else if (event.key === 'Home') { event.preventDefault(); animation?.goTo(0); }
    else if (event.key === 'End') { event.preventDefault(); animation?.goTo(pages.length - 1); }
  }, { signal: lifetime.signal });
  motion.addEventListener('change', () => {
    if (motion.matches) { article(root.contains(document.activeElement)); message('Reduzierte Bewegung ist aktiviert. Du liest das vollständige Werk in der Artikelansicht.'); }
  }, { signal: lifetime.signal });
  window.addEventListener('hashchange', () => goToAnchor(decodeHash()), { signal: lifetime.signal });
  window.addEventListener('pagehide', () => { position = currentAnchor(); stop(); }, { signal: lifetime.signal });
  window.addEventListener('pageshow', event => { if (event.persisted && mode === 'book') void open(); }, { signal: lifetime.signal });
  element('toolbar').hidden = false;
  if (motion.matches) { showMode('article'); message('Reduzierte Bewegung ist aktiviert. Du liest das vollständige Werk in der Artikelansicht.'); }
  else { position = location.hash ? { id: decodeHash(), offset: 0 } : null; void open(); }
  return { destroy() { stop(); lifetime.abort(); showMode('article'); element('toolbar').hidden = true; } };
}

document.querySelectorAll('[data-book-reader]').forEach(root => mountBookReader(root));
