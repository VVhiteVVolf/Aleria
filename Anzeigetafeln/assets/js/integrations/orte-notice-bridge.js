(function () {
  "use strict";

  const runtime = window.TafelRuntime;
  const mapId = String(window.TAFEL_CONFIG?.boardId || "");
  if (!runtime || !mapId || window.parent === window) return;

  window.addEventListener("aleria:tafel:state-applied", publishNotices);
  window.addEventListener("aleria:tafel:state-saved", publishNotices);
  window.addEventListener("load", publishNotices, { once: true });
  window.addEventListener("message", event => {
    if (event.source !== window.parent || event.origin !== window.location.origin) return;
    if (event.data?.mapId !== mapId) return;
    if (event.data.type === "aleria:map-pois-request") publishNotices();
    if (event.data.type === "aleria:map-poi-open") {
      const notice = publicNotices().find(notice => String(notice.id) === event.data.id);
      if (notice) window.openZettelScroll(notice.id);
    }
  });

  function publicNotices() {
    return (runtime.state().zettel || []).filter(notice => !notice.secret);
  }

  function publishNotices() {
    const pois = window.TafelNoticeStacks.publications(publicNotices()).map(entry => ({
      id: String(entry.id),
      name: String(entry.primary.title || "Ohne Titel"),
      type: String(window.TafelZettelConfig.typeById(entry.primary.typ)?.label || "Aushang"),
      description: text(entry.primary.text),
      searchText: entry.notices.flatMap(notice => window.TafelNoticeSearch.fields(notice)).join(" "),
    }));
    window.parent.postMessage(
      { type: "aleria:map-pois", mapId, pois },
      window.location.origin === "null" ? "*" : window.location.origin
    );
  }

  function text(value) {
    return window.TafelZettelRichText.textPreview(value || "", Number.MAX_SAFE_INTEGER);
  }

})();
