const blankRows=labels=>labels.map(label=>({label,value:'—'}));
export function createGuestVacancy(id) {
  return {id,portrait:'',portraitFit:'cover',portraitPosition:'top',name:'Freier Platz',role:'—',status:'Frei',
    descriptionTitle:'Aufenthalt',description:'—',sideTitle:'Unterkunft',
    infoRows:blankRows(['Herkunft','Stand','Begleitung','Ankunft','Zahlung']),
    sideRows:blankRows(['Zimmer','Etage','Dauer','Wünsche'])};
}
/** Append writing space, retaining all existing guests and their identities. */
export function expandGuestVacancies(register,{prefix,sectionCount,slotsPerSection=4}) {
  for(const section of register.sections) section.guests=section.guests.map(guest=>
    ['Neuer Gast','Weitere Person'].includes(guest.name) && /^Beschreibe Herkunft/.test(guest.description || '') && !guest.portrait
      ? createGuestVacancy(guest.id):guest);
  for(let index=0;index<sectionCount;index++) {
    const first=index*slotsPerSection+1,last=(index+1)*slotsPerSection;
    const section=register.sections[index] || {id:`${prefix}-gaeste-abschnitt-${index+1}`,title:`Personen ${first}–${last}`,subtitle:'',guests:[]};
    if(!register.sections[index]) register.sections.push(section);
    for(let slot=section.guests.length;slot<slotsPerSection;slot++) section.guests.push(createGuestVacancy(`${prefix}-gast-${first+slot}`));
  }
}
