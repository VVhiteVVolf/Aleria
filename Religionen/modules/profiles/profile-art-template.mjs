import { escapeHtml as h } from '../content/content-html.mjs';
import { entrySymbolPath } from '../content/content-repository.mjs';

export function renderProfileArt(entry, link) {
  if (entry.portrait) {
    const art = entry.portrait;
    return `<figure class="profile-art"><img src="${link(`Religionen/${art.src}`)}" alt="${h(art.alt)}" width="${art.width}" height="${art.height}" fetchpriority="high"><figcaption>${h(art.caption)}</figcaption></figure>`;
  }
  return `<figure class="profile-emblem"><img src="${link(entrySymbolPath(entry))}" width="220" height="220" alt="Überliefertes Symbol: ${h(entry.title)}"><figcaption>Das überlieferte Zeichen</figcaption></figure>`;
}
