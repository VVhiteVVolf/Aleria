import { CREATURE_BIOGRAPHY_FIELDS, normalizeCreatureBiography, hasCreatureBiography } from './creature-biography-model.js?v=20260925-creature-biography-v1';

export function renderCreatureBiographyDossier(creature, escape) {
  const biography = normalizeCreatureBiography(creature.biography);
  const section = (title, content) => `<section class="creature-biography-section"><h4>${escape(title)}</h4><p>${escape(content)}</p></section>`;
  const facts = [
    { label: 'Art', value: [creature.type, creature.species].filter(Boolean).join(' · ') },
    { label: 'Stufe', value: creature.level },
    { label: 'Größe', value: creature.size },
    ...(creature.habitat ? [{ label: 'Lebensraum', value: creature.habitat }] : []),
    ...(creature.itemOrigin?.ownerCharacterName ? [{ label: 'Begleitet', value: creature.itemOrigin.ownerCharacterName }] : []),
    ...biography.facts.filter(row => row.label || row.value)
  ];
  return `<article class="creature-biography-dossier">
    <aside class="creature-biography-aside">
      ${creature.portrait ? `<img class="creature-biography-portrait" src="${escape(creature.portrait)}" alt="${escape(creature.name)}">` : ''}
      <h4>Steckbrief</h4><dl>${facts.map(row => `<div><dt>${escape(row.label)}</dt><dd>${escape(row.value)}</dd></div>`).join('')}</dl>
    </aside>
    <div class="creature-biography-copy"><h3>${escape(creature.name)}</h3>
      ${CREATURE_BIOGRAPHY_FIELDS.filter(({ key }) => biography[key]).map(({ key, label }) => section(label, biography[key])).join('')}
      ${biography.sections.filter(row => row.title || row.text).map(row => section(row.title || 'Weitere Beobachtungen', row.text)).join('')}
      ${hasCreatureBiography(biography) ? '' : '<p>Hier ist Platz für die Geschichte und Eigenheiten dieses Wesens – ob Tier, Monster, Untoter, Geist oder eine andere Kreatur.</p>'}
    </div>
  </article>`;
}

export function renderCreatureBiography(creature, escape, editing = false) {
  const biography = normalizeCreatureBiography(creature.biography);
  const preview = renderCreatureBiographyDossier(creature, escape);
  return `<div class="creature-biography" data-creature-biography-root>
    <div class="creature-biography-toolbar"><button type="button" data-creature-biography-action="${editing ? 'finish' : 'edit'}">${editing ? 'Vorschau anzeigen' : hasCreatureBiography(biography) ? 'Biographie bearbeiten' : 'Biographie anlegen'}</button><span>Änderungen mit „Online speichern“ sichern.</span></div>
    ${editing ? `<div class="creature-biography-workbench"><div class="creature-biography-form">
      ${CREATURE_BIOGRAPHY_FIELDS.map(({ key, label, hint }) => `<label class="creature-field"><span>${label}</span><textarea rows="${key === 'summary' ? 3 : 5}" maxlength="12000" data-creature-biography-field="${key}" placeholder="${hint}">${escape(biography[key])}</textarea></label>`).join('')}
      <h4>Weitere Steckbriefangaben</h4>
      ${biography.facts.map((row, index) => `<div class="creature-biography-fact" data-creature-biography-fact><input aria-label="Bezeichnung ${index + 1}" maxlength="100" data-bio-label value="${escape(row.label)}" placeholder="z. B. Alter, Ursprung, Zustand"><input aria-label="Angabe ${index + 1}" maxlength="1000" data-bio-value value="${escape(row.value)}"><button type="button" data-creature-biography-action="remove-fact" data-index="${index}" aria-label="Angabe ${index + 1} entfernen">×</button></div>`).join('')}
      <button type="button" data-creature-biography-action="add-fact"${biography.facts.length >= 30 ? ' disabled' : ''}>+ Steckbriefangabe</button>
      <h4>Eigene Abschnitte</h4>
      ${biography.sections.map((row, index) => `<div class="creature-biography-custom" data-creature-biography-section><input aria-label="Abschnittstitel ${index + 1}" maxlength="140" data-bio-title value="${escape(row.title)}" placeholder="z. B. Fluch, Legenden, Beobachtungen"><textarea aria-label="Abschnittstext ${index + 1}" rows="4" maxlength="12000" data-bio-text>${escape(row.text)}</textarea><button type="button" data-creature-biography-action="remove-section" data-index="${index}">Abschnitt entfernen</button></div>`).join('')}
      <button type="button" data-creature-biography-action="add-section"${biography.sections.length >= 20 ? ' disabled' : ''}>+ Abschnitt</button>
    </div><div data-creature-biography-preview>${preview}</div></div>` : preview}
  </div>`;
}
