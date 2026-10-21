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
      image.width = 64;
      image.height = 64;
      image.loading = 'lazy';
      link.append(image);
    }
    const copy = document.createElement('span');
    const title = document.createElement('strong');
    title.textContent = territory.title;
    copy.append(title);
    for (const value of [territory.house, territory.seat ? `Sitz: ${territory.seat}` : '']) {
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
