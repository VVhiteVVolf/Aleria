(function () {
  const content = document.querySelector('.content');
  const disabledTopics = document.querySelectorAll('.topic-disabled');
  const homeMarkup = content ? content.innerHTML : '';
  const pageCache = new Map();
  let moduleAbortController = null;

  disabledTopics.forEach((item) => {
    item.setAttribute('aria-disabled', 'true');
    item.setAttribute('title', 'Diese Unterseite ist noch nicht angelegt.');
  });

  if (!content) return;

  function samePageUrl(url) {
    return url.origin === window.location.origin && url.pathname === window.location.pathname;
  }

  function hashFor(href) {
    return `page=${encodeURIComponent(href)}`;
  }

  function routeFromHash() {
    const hash = window.location.hash.replace(/^#/, '');
    if (!hash || hash === 'home') return '';

    const params = new URLSearchParams(hash);
    return params.get('page') || '';
  }

  function isLoadableHtmlLink(anchor) {
    if (!anchor || anchor.target || anchor.hasAttribute('download')) return false;

    const rawHref = anchor.getAttribute('href');
    if (!rawHref || rawHref.startsWith('#')) return false;
    if (/^(mailto:|tel:|javascript:)/i.test(rawHref)) return false;

    const url = new URL(rawHref, window.location.href);
    return url.origin === window.location.origin && /\.html?$/i.test(url.pathname);
  }

  function setActiveLink(href) {
    const current = href ? new URL(href, window.location.href).href : '';

    document.querySelectorAll('a[data-shell-active]').forEach((anchor) => {
      anchor.removeAttribute('data-shell-active');
      anchor.removeAttribute('aria-current');
    });

    if (!current) return;

    document.querySelectorAll('a[href]').forEach((anchor) => {
      const anchorUrl = new URL(anchor.getAttribute('href'), window.location.href).href;
      if (anchorUrl !== current) return;
      anchor.dataset.shellActive = 'true';
      anchor.setAttribute('aria-current', 'page');
    });
  }

  function abortPreviousModule() {
    if (!moduleAbortController) return;
    moduleAbortController.abort();
    moduleAbortController = null;
  }

  function showHome() {
    abortPreviousModule();
    content.innerHTML = homeMarkup;
    document.title = 'Aleria Archiv - Hauptseite';
    setActiveLink('');
  }

  function showLoading(href) {
    content.innerHTML = `
      <section class="module-shell-bar" aria-live="polite">
        <button class="shell-home-button" type="button" data-shell-home>Hauptseite</button>
        <span>Lade Unterseite ...</span>
        <a href="${escapeAttribute(href)}">Direkt öffnen</a>
      </section>
      <section class="module-loading">
        <h2>Unterseite wird geladen</h2>
        <p>Die Hauptseite bleibt erhalten, während der Inhalt im Rahmen eingesetzt wird.</p>
      </section>
    `;
  }

  function showError(href, error) {
    content.innerHTML = `
      <section class="module-shell-bar">
        <button class="shell-home-button" type="button" data-shell-home>Hauptseite</button>
        <a href="${escapeAttribute(href)}">Unterseite direkt öffnen</a>
      </section>
      <section class="module-error">
        <h2>Unterseite konnte nicht geladen werden</h2>
        <p>Beim direkten Öffnen per Datei blockieren Browser oft das Nachladen lokaler HTML-Dateien. Starte die Hauptseite über einen lokalen Server oder öffne die Unterseite direkt.</p>
        <code>${escapeHtml(error.message || String(error))}</code>
      </section>
    `;
  }

  function renderModuleFrame(title, href) {
    content.innerHTML = `
      <section class="module-shell-bar">
        <button class="shell-home-button" type="button" data-shell-home>Hauptseite</button>
        <span>${escapeHtml(title || 'Unterseite')}</span>
        <a href="${escapeAttribute(href)}">Direkt öffnen</a>
      </section>
      <section class="module-frame" aria-label="${escapeAttribute(title || 'Geladene Unterseite')}">
        <div class="module-shadow-host"></div>
      </section>
    `;

    return content.querySelector('.module-shadow-host');
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function escapeAttribute(value) {
    return escapeHtml(value);
  }

  function resolveUrl(value, baseUrl) {
    if (!value || value.startsWith('#')) return value;
    if (/^(data:|blob:|mailto:|tel:|javascript:)/i.test(value)) return value;
    return new URL(value, baseUrl).href;
  }

  function rewriteElementUrls(root, baseUrl) {
    root.querySelectorAll('[src]').forEach((node) => {
      node.setAttribute('src', resolveUrl(node.getAttribute('src'), baseUrl));
    });

    root.querySelectorAll('[href]').forEach((node) => {
      const href = node.getAttribute('href');
      if (!href || href.startsWith('#')) return;
      node.setAttribute('href', resolveUrl(href, baseUrl));
    });

    root.querySelectorAll('[srcset]').forEach((node) => {
      const srcset = node.getAttribute('srcset');
      if (!srcset) return;
      const rewritten = srcset.split(',').map((entry) => {
        const parts = entry.trim().split(/\s+/);
        if (!parts[0]) return entry;
        parts[0] = resolveUrl(parts[0], baseUrl);
        return parts.join(' ');
      }).join(', ');
      node.setAttribute('srcset', rewritten);
    });
  }

  function rewriteCssUrls(cssText, cssUrl) {
    return cssText.replace(/url\((['"]?)(.*?)\1\)/gi, (match, quote, url) => {
      const trimmed = url.trim();
      if (!trimmed || /^(data:|blob:|https?:|#)/i.test(trimmed)) return match;
      return `url("${new URL(trimmed, cssUrl).href}")`;
    });
  }

  function adaptCssForShadow(cssText, cssUrl) {
    return rewriteCssUrls(cssText, cssUrl)
      .replace(/\bhtml\b/g, ':host')
      .replace(/:root\b/g, ':host')
      .replace(/\bbody\b/g, '.module-document');
  }

  async function addStylesToShadow(shadow, parsedDocument, baseUrl) {
    const baseStyle = document.createElement('style');
    baseStyle.textContent = `
      :host {
        display: block;
        min-width: 0;
      }

      .module-document {
        min-width: 0;
      }
    `;
    shadow.append(baseStyle);

    const styles = [
      ...parsedDocument.head.querySelectorAll('link[rel~="stylesheet"], style'),
      ...parsedDocument.body.querySelectorAll('link[rel~="stylesheet"], style')
    ];

    for (const source of styles) {
      const style = document.createElement('style');

      if (source.tagName.toLowerCase() === 'style') {
        style.textContent = adaptCssForShadow(source.textContent || '', baseUrl);
        shadow.append(style);
        continue;
      }

      const cssUrl = new URL(source.getAttribute('href'), baseUrl).href;
      if (new URL(cssUrl).origin !== window.location.origin) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssUrl;
        shadow.append(link);
        continue;
      }

      const response = await fetch(cssUrl);
      if (!response.ok) throw new Error(`Stylesheet nicht erreichbar: ${cssUrl}`);
      style.textContent = adaptCssForShadow(await response.text(), cssUrl);
      shadow.append(style);
    }
  }

  function createDocumentProxy(shadow, abortSignal) {
    return {
      getElementById: (id) => shadow.getElementById(id),
      querySelector: (selector) => shadow.querySelector(selector),
      querySelectorAll: (selector) => shadow.querySelectorAll(selector),
      createElement: document.createElement.bind(document),
      createElementNS: document.createElementNS.bind(document),
      createTextNode: document.createTextNode.bind(document),
      addEventListener: (type, listener, options) => {
        const safeOptions = typeof options === 'object' && options !== null
          ? { ...options, signal: abortSignal }
          : { capture: Boolean(options), signal: abortSignal };
        document.addEventListener(type, listener, safeOptions);
      },
      removeEventListener: document.removeEventListener.bind(document),
      body: shadow.querySelector('.module-document'),
      documentElement: shadow.host,
      activeElement: document.activeElement
    };
  }

  async function runScripts(shadow, parsedDocument, baseUrl, abortSignal) {
    const scripts = [
      ...parsedDocument.head.querySelectorAll('script'),
      ...parsedDocument.body.querySelectorAll('script')
    ];
    const documentProxy = createDocumentProxy(shadow, abortSignal);

    for (const script of scripts) {
      if (script.type && script.type !== 'text/javascript' && script.type !== 'application/javascript') {
        continue;
      }

      const scriptUrl = script.src ? new URL(script.getAttribute('src'), baseUrl).href : baseUrl;
      const code = script.src ? await fetchScript(scriptUrl) : script.textContent;

      if (!code || abortSignal.aborted) continue;

      const execute = new Function('document', 'window', `${code}\n//# sourceURL=${scriptUrl}`);
      execute(documentProxy, window);
    }
  }

  async function fetchScript(scriptUrl) {
    const response = await fetch(scriptUrl);
    if (!response.ok) throw new Error(`Script nicht erreichbar: ${scriptUrl}`);
    return response.text();
  }

  function wireShadowNavigation(shadow) {
    shadow.addEventListener('click', (event) => {
      const anchor = event.target.closest('a[href]');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      if (href.startsWith('#')) {
        event.preventDefault();
        shadow.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin || !/\.html?$/i.test(url.pathname)) return;

      event.preventDefault();
      const relativeHref = url.href.replace(new URL('.', window.location.href).href, '');
      window.location.hash = hashFor(relativeHref);
    });
  }

  async function loadPage(href) {
    abortPreviousModule();
    moduleAbortController = new AbortController();
    const abortSignal = moduleAbortController.signal;
    const pageUrl = new URL(href, window.location.href);

    showLoading(href);
    setActiveLink(href);

    try {
      let html = pageCache.get(pageUrl.href);
      if (!html) {
        const response = await fetch(pageUrl.href);
        if (!response.ok) throw new Error(`HTTP ${response.status} beim Laden von ${pageUrl.href}`);
        html = await response.text();
        pageCache.set(pageUrl.href, html);
      }

      if (abortSignal.aborted) return;

      const parsedDocument = new DOMParser().parseFromString(html, 'text/html');
      const title = parsedDocument.querySelector('title')?.textContent?.trim() || 'Unterseite';
      const host = renderModuleFrame(title, href);
      const shadow = host.attachShadow({ mode: 'open' });
      const documentWrap = document.createElement('div');
      documentWrap.className = 'module-document';
      const bodyContent = document.createDocumentFragment();

      [...parsedDocument.body.childNodes].forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE && node.tagName.toLowerCase() === 'script') return;
        bodyContent.append(document.importNode(node, true));
      });

      documentWrap.append(bodyContent);
      rewriteElementUrls(documentWrap, pageUrl.href);
      await addStylesToShadow(shadow, parsedDocument, pageUrl.href);
      shadow.append(documentWrap);
      wireShadowNavigation(shadow);
      await runScripts(shadow, parsedDocument, pageUrl.href, abortSignal);

      if (abortSignal.aborted) return;
      document.title = `${title} - Aleria Archiv`;
    } catch (error) {
      if (abortSignal.aborted) return;
      showError(href, error);
      console.error(error);
    }
  }

  document.addEventListener('click', (event) => {
    const homeButton = event.target.closest('[data-shell-home]');
    if (homeButton) {
      event.preventDefault();
      window.location.hash = 'home';
      return;
    }

    const anchor = event.target.closest('a[href]');
    if (!isLoadableHtmlLink(anchor)) return;

    const url = new URL(anchor.getAttribute('href'), window.location.href);
    if (!samePageUrl(url)) {
      event.preventDefault();
      window.location.hash = hashFor(anchor.getAttribute('href'));
    }
  });

  window.addEventListener('hashchange', () => {
    const route = routeFromHash();
    if (!route) {
      showHome();
      return;
    }

    loadPage(route);
  });

  const initialRoute = routeFromHash();
  if (initialRoute) {
    loadPage(initialRoute);
  }
})();
