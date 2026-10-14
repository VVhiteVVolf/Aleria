const blankRows = labels => labels.map(label => ({ label, value: '—' }));

function emptyGuest(id) {
  return { id, portrait: '', portraitFit: 'cover', portraitPosition: 'top',
    name: 'Freier Platz', role: '—', status: 'Frei', descriptionTitle: 'Aufenthalt', description: '—', sideTitle: 'Unterkunft',
    infoRows: blankRows(['Herkunft', 'Stand', 'Begleitung', 'Ankunft', 'Zahlung']),
    sideRows: blankRows(['Zimmer', 'Etage', 'Dauer', 'Wünsche']) };
}

/** Add writing space without replacing any named guest or changing their IDs. */
export function expandKanneGuestRegister(page) {
  const register = page.guestRegister;
  register.subtitle = 'Aus Mairs Gästebuch';
  register.location = 'Die Krumme Kanne · Gwynthor';
  register.note = 'Mair verwahrt das Gästebuch neben der Kasse.';
  for (const section of register.sections) {
    section.guests = section.guests.map(guest => ['Neuer Gast', 'Weitere Person'].includes(guest.name)
      && /^Beschreibe Herkunft/.test(guest.description || '') && !guest.portrait ? emptyGuest(guest.id) : guest);
  }
  for (let index = 0; index < 4; index++) {
    const section = register.sections[index] || { id: `kanne-gaeste-abschnitt-${index + 1}`, title: `Personen ${index * 4 + 1}–${index * 4 + 4}`, subtitle: '', guests: [] };
    if (!register.sections[index]) register.sections.push(section);
    for (let slot = section.guests.length; slot < 4; slot++) section.guests.push(emptyGuest(`kanne-gast-${index * 4 + slot + 1}`));
  }
}
