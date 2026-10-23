// Only immediate children are linked here; their registers belong to their own page.
export function renderTerritoryNavigation(links) {
  const nav = document.createElement('nav');
  nav.className = 'territory-navigation';
  nav.setAttribute('aria-label', 'Untergeordnete Herrschaften');
  for (const territory of links) {
    const link = document.createElement('a');
    link.className = 'territory-navigation-card';
    link.href = territory.href;
    if (territory.imageSrc) {
      const image = document.createElement('img');
      image.src = territory.imageSrc;
      image.alt = territory.imageAlt;
      image.className = 'territory-navigation-banner';
      image.width = 80;
      image.height = 96;
      image.loading = 'lazy';
      link.append(image);
    }
    const copy = document.createElement('span');
    const title = document.createElement('strong');
    title.textContent = territory.title;
    copy.append(title);
    if (territory.house || territory.crestSrc) {
      const owner = document.createElement('span');
      owner.className = 'territory-navigation-owner';
      if (territory.crestSrc) {
        const crest = document.createElement('img');
        crest.className = 'territory-navigation-crest';
        crest.src = territory.crestSrc;
        crest.alt = territory.crestAlt;
        crest.width = 28;
        crest.height = 28;
        crest.loading = 'lazy';
        owner.append(crest);
      }
      if (territory.house) {
        const name = document.createElement('span');
        name.textContent = territory.house;
        owner.append(name);
      }
      copy.append(owner);
    }
    for (const value of [territory.seat ? `Sitz: ${territory.seat}` : '']) {
      if (!value) continue;
      const line = document.createElement('span');
      line.textContent = value;
      copy.append(line);
    }
    link.append(copy);
    nav.append(link);
  }
  return nav;
}
