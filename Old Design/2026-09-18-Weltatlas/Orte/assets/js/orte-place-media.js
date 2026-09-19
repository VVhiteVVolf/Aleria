(function () {
  "use strict";

  const page = document.querySelector("[data-orte-static-template]");
  if (!page) return;

  configureImageSlots();
  document.addEventListener("aleria:orte:data-ready", (event) => {
    applyPlaceMedia(event.detail?.data || window.ORT_DATA);
  });

  if (window.ORT_DATA) {
    applyPlaceMedia(window.ORT_DATA);
  }

  function configureImageSlots() {
    page.querySelectorAll("[data-orte-image-key]").forEach((slot) => {
      const maxHeight = readPositiveNumber(slot.dataset.orteImageMaxHeight);
      if (!maxHeight) return;

      slot.style.setProperty("--orte-image-max-height", `${maxHeight}px`);
      const ratio = formatRatio(slot.dataset.orteImageFormat);
      if (ratio) {
        slot.style.setProperty("--orte-image-width", `${Math.round(maxHeight * ratio)}px`);
      }
    });
  }

  function applyPlaceMedia(data) {
    if (!data) return;

    const catalogEntry = window.ALERIA_CELTIGERNS_PLACES?.find(data.meta?.id || data.name);
    const presentation = data.presentation || {};
    const images = {
      ...(catalogEntry?.images || {}),
      ...(presentation.images || {})
    };

    if (!images["icon-png"] && presentation.heraldry) {
      images["icon-png"] = presentation.heraldry;
    }
    if (!images["wappen-banner-png"] && presentation.banner) {
      images["wappen-banner-png"] = presentation.banner;
    }

    page.querySelectorAll("[data-orte-image-key]").forEach((slot) => {
      const media = normalizeMedia(images[slot.dataset.orteImageKey]);
      if (!media.src) return;
      renderImage(slot, media, data.name);
    });
  }

  function renderImage(slot, media, placeName) {
    const image = document.createElement("img");
    image.src = media.src;
    image.alt = media.alt || slot.dataset.orteImageLabel || placeName || "Ortsbild";
    image.decoding = "async";
    image.loading = slot.dataset.orteImageKey === "icon-png" ? "eager" : "lazy";
    image.dataset.orteManagedImage = "";

    image.addEventListener("error", () => {
      slot.replaceChildren();
      slot.classList.remove("has-image");
      slot.classList.add("is-image-missing");
    }, { once: true });

    let content = image;
    if (media.href) {
      const link = document.createElement("a");
      link.href = media.href;
      link.append(image);
      content = link;
    }

    slot.replaceChildren(content);
    slot.classList.add("has-image");
    slot.classList.remove("is-image-missing");
    if (media.fit) {
      slot.dataset.orteImageFit = media.fit;
    }
  }

  function normalizeMedia(value) {
    if (typeof value === "string") {
      return { src: value, alt: "", href: "", fit: "" };
    }
    if (!value || typeof value !== "object") {
      return { src: "", alt: "", href: "", fit: "" };
    }
    return {
      src: String(value.src || ""),
      alt: String(value.alt || ""),
      href: String(value.href || ""),
      fit: String(value.fit || "")
    };
  }

  function readPositiveNumber(value) {
    const number = Number.parseFloat(value);
    return Number.isFinite(number) && number > 0 ? number : 0;
  }

  function formatRatio(format) {
    return ({
      square: 1,
      portrait: 3 / 4,
      landscape: 4 / 3,
      banner: 16 / 5
    })[format] || 0;
  }
})();
