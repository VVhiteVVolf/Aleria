export function createRosterPortrait(member) {
  const image = document.createElement('img');
  image.src = member.portrait; image.alt = member.name; image.draggable = false;
  image.addEventListener('error', () => { image.hidden = true; }, { once: true });
  return image;
}

export function createRosterList(members) {
  const list = document.createElement('ul'); list.className = 'place-roster-member-list';
  for (const member of members) {
    const item = document.createElement('li'), link = document.createElement('a');
    link.href = member.href; link.target = '_blank'; link.rel = 'noopener';
    const caption = document.createElement('span'), name = document.createElement('strong'), role = document.createElement('small');
    name.textContent = member.name; role.textContent = member.role;
    caption.append(name, role); link.append(createRosterPortrait(member), caption); item.append(link); list.append(item);
  }
  return list;
}
