import { bindPlacementDrag } from '../shared/placement-drag.mjs';
import { filterCandidates } from './candidate-filters.mjs';
import { MAX_ROLE_BATCH, LOWER_ROLE_KINDS, ROLE_KINDS } from '../../shared/cenyr-administration/office-roles.mjs';
import { escapeHtml as e } from '../shared/country-workbench/render.mjs';
import { openRoleGroups, renderLowerRoles, renderRoleGroups, renderRoleOptions } from './repeatable-posts-view.mjs';
import { appointmentLinksFor, postTitle, renderCandidate, renderContacts, renderFilterFields, renderMilitaryForces, renderPost, renderPostSection } from './workbench-view.mjs';
import { shadowTradition } from './cenyr-office-notes.mjs';
import { bindTreeCandidatePicker } from './tree-candidate-picker.mjs';
import { suitableLocalities } from '../../shared/cenyr-administration/local-offices.mjs';
import { rankOf } from '../../shared/cenyr-administration/scopes.mjs';
import { officeTitleKey, postTitleKey, titleKeyForTemplate } from './draft-office-titles.mjs';
import { bindOfficeTitleEditor, renameButton } from './office-title-editor.mjs';
import { bindLocalAuthorityEditor } from './local-authority-editor.mjs';
import { needsFilling, postOccupant } from './draft-assignment-references.mjs';

export function bindOfficeDialog(dialog, { state, people, treeCandidates, titleEditor, authorityEditor, onChange, onClose }) {
  const role = name => dialog.querySelector(`[data-role="${name}"]`);
  const filters = role('filters');
  const list = role('candidate-list');
  const postScroll = role('post-scroll');
  const leadingPosts = role('leading-posts');
  const headPost = role('head-post');
  const connections = role('office-connections');
  const postForm = role('post-form');
  const newPost = role('new-post');
  const customFields = role('custom-fields');
  const siteField = role('site-field');
  const siteLabel = role('site-label');
  const status = role('office-status');
  const vacanciesOnly = role('vacancies-only');
  const title = dialog.querySelector('#office-title');
  const renameOffice = role('rename-office');
  const backButton = dialog.querySelector('[data-action="back-office"]');
  const fields = filters.elements;
  const postFields = postForm.elements;
  postFields.count.max = MAX_ROLE_BATCH;
  role('filter-fields').innerHTML = renderFilterFields();
  let house, area, plan;
  let rootArea;
  const parentViews = [];
  let selectedId = null;
  let copiedRole;
  let pendingClose = false;
  const preferences = new Map();
  const writeStatus = message => { status.textContent = message; };

  function focusPost(key, groupOnly = false) {
    const button = dialog.querySelector(`[data-action="choose-post"][data-post="${CSS.escape(key)}"]`);
    if (!button) return;
    const group = button.closest('[data-role-group]');
    if (group && groupOnly) group.querySelector('summary').focus();
    else {
      if (group) group.open = true;
      button.focus();
    }
  }

  function candidateOptions() {
    const applicants = state.applicants(house.id).map(person => ({ ...person, kind: 'tree', detail: 'Aus einem Stammbaum ergänzt' }));
    const free = fields.free.checked ? state.freeFor(house.id) : [];
    const available = new Map([...free, ...applicants, ...house.candidates].map(person => [person.id, person]));
    return [...available.values()].map(info => {
      const person = { ...people.get(info.id), ...info };
      const appointments = state.appointments(info.id).filter(entry => entry.scopeId === house.id)
        .map(({ post }) => ({ post, title: postTitle(post, person) }));
      return { ...person, appointments };
    }).sort((a, b) => a.name.localeCompare(b.name, 'de'));
  }

  function drawCandidates(resetScroll = false) {
    const bound = field => field.value && field.validity.valid ? field.valueAsNumber : null;
    const selection = {
      query: fields.query.value, sex: fields.sex.value, relationship: fields.relationship.value, kind: fields.kind.value,
      availability: fields.availability.value, hideMinors: fields.hideMinors.checked, minAge: bound(fields.minAge), maxAge: bound(fields.maxAge),
    };
    const candidates = candidateOptions();
    const matched = filterCandidates(candidates, selection);
    const count = Object.entries(selection).filter(([key, value]) => key !== 'query' && value !== '' && value !== false && value !== null).length;
    const scrolled = list.scrollTop;
    role('filter-count').textContent = count ? `· ${count} aktiv` : '';
    role('candidate-count').textContent = `${matched.length} von ${candidates.length}`;
    list.innerHTML = matched.length ? matched.map(person => renderCandidate(person, person.id === selectedId)).join('')
      : `<li class="no-candidates">${selection.minAge !== null && selection.maxAge !== null && selection.minAge > selection.maxAge
        ? 'Das Mindestalter liegt über dem Höchstalter.' : 'Keine Figuren passen zu den Filtern.'}</li>`;
    list.scrollTop = resetScroll ? 0 : scrolled;
  }

  function drawPosts(revealOccupied = false) {
    const scroll = postScroll.scrollTop;
    const expanded = openRoleGroups(postScroll);
    const positions = state.positions(house.id);
    const appointmentLinks = appointmentLinksFor(house.id, state);
    const view = { people, appointmentLinks };
    const head = plan.head && positions.get(plan.head.key);
    const titleKey = head ? postTitleKey(head.key) : officeTitleKey(area.id);
    title.textContent = head ? postTitle(head, postOccupant(head, people)) : state.title(house.id, titleKey, area.name);
    renameOffice.innerHTML = renameButton(titleKey, title.textContent, 'Amt');
    for (const link of connections.querySelectorAll('[data-action="open-department"]')) {
      const target = positions.get(link.dataset.post);
      if (target) link.textContent = `${postTitle(target, postOccupant(target, people))} ↗`;
    }
    leadingPosts.hidden = !plan.leadership;
    leadingPosts.innerHTML = plan.leadership
      ? renderPostSection(plan.leadership, plan.leadership.slots.map(slot => positions.get(slot.key)), view)
      : '';
    // Leadership posts stay available when the list is filtered to vacancies.
    headPost.hidden = !head;
    headPost.innerHTML = head ? renderPost(head, postOccupant(head, people), {
      headLabel: area.id === 'regentschaft' ? 'Sonderamt unter dem Oberhaupt' : parentViews.length ? 'Hofamt'
        : house.county ? 'Amtsleitung der Grafschaft' : `Amtsleitung unter dem ${rankOf(house).ruler}`,
      image: area.imageSrc,
      showDepartment: !parentViews.length,
      appointmentLinks,
    }) : '';
    const custom = [...positions.values()].filter(slot => slot.custom && slot.area === area.id);
    const slots = [...plan.slots.map(slot => positions.get(slot.key)).filter(Boolean), ...custom];
    const free = slots.filter(needsFilling).length;
    role('office-count').textContent = `${slots.length} Posten · ${free} frei`;
    const visible = entries => entries.filter(slot => !vacanciesOnly.checked || needsFilling(slot));
    role('posts').innerHTML = plan.sections.map(group => {
      const support = group.id ? custom.filter(slot => slot.placement === group.id) : [];
      const active = visible([...group.slots.map(slot => positions.get(slot.key)).filter(Boolean), ...support]);
      const fixed = active.filter(slot => !slot.kind);
      const repeated = active.filter(slot => slot.kind);
      return active.length || group.repeatableHere || group.staff
        ? renderPostSection(group, fixed, view, renderRoleGroups(repeated, view, expanded, revealOccupied === true)) : '';
    }).join('');
    role('role-groups').innerHTML = renderLowerRoles(visible(slots.filter(slot => slot.kind && !slot.placement)), view, expanded, revealOccupied === true);
    dialog.querySelector('[data-action="undo"]').disabled = !state.canUndo();
    postScroll.scrollTop = scroll;
  }

  function select(id) {
    selectedId = id;
    dialog.classList.toggle('has-selected-person', Boolean(id));
    dialog.querySelector('[data-action="clear-selection"]').hidden = !id;
    list.querySelectorAll('[data-drag-person]').forEach(button => { button.ariaPressed = String(button.dataset.dragPerson === id); });
    writeStatus(id ? `${people.get(id).name} ausgewählt. Wähle einen Posten.` : 'Figur wählen, um einen Posten zu besetzen.');
  }

  function update(message, focusKey, groupOnly = false) {
    drawPosts();
    drawCandidates();
    onChange();
    if (focusKey) focusPost(focusKey, groupOnly);
    writeStatus(message);
  }

  function drawRoleOptions() {
    const selected = postFields.template.value;
    postFields.template.innerHTML = renderRoleOptions(plan.templates.map(template => ({
      ...template, title: state.title(house.id, titleKeyForTemplate(area.id, template), template.title),
    })));
    if (plan.templates.some(template => template.id === selected)) postFields.template.value = selected;
  }

  const editor = bindOfficeTitleEditor(titleEditor, {
    hasOverride: key => Boolean(state.title(house.id, key)),
    findTrigger: anchor => dialog.querySelector(`[data-title-anchor="${CSS.escape(anchor)}"]`),
    onRename(key, name) {
      if (!state.renameTitle(house.id, key, name)) return;
      drawRoleOptions();
      update(name === null ? 'Standardtitel wiederhergestellt.' : `Titel im Entwurf geändert zu „${name.trim()}“.`);
    },
  });
  const localEditor = bindLocalAuthorityEditor(authorityEditor, {
    findTrigger: key => dialog.querySelector(`[data-action="configure-authority"][data-post="${CSS.escape(key)}"]`),
    onApply(key, choice) {
      if (state.setAuthority(house.id, key, choice)) {
        update(choice ? 'Ortsamt im Entwurf geändert.' : 'Vorgabe für das Ortsamt wiederhergestellt.');
      }
    },
  });

  function assign(key, id, focus) {
    try {
      const previous = state.assign(house.id, key, id);
      if (!previous) return;
      select(null);
      const previousPerson = postOccupant(previous, people);
      const person = people.get(id);
      const destination = postTitle({ ...previous, occupant: id }, person);
      const message = id
        ? `${person.name} ist für „${destination}“ eingeplant.${previousPerson && previousPerson.id !== id ? ` ${previousPerson.name} wurde in diesem Amt abgelöst.` : ''}`
        : `„${postTitle(previous, previousPerson)}“ ist jetzt frei.`;
      update(message, focus ? key : '');
    } catch (error) { writeStatus(error.message); }
  }

  const drag = bindPlacementDrag({
    root: dialog,
    sourceSelector: '[data-drag-person]',
    targetSelector: '[data-drop-post]',
    canStart: (_source, event) => event.pointerType !== 'touch' || Boolean(event.target.closest('[data-drag-handle]')),
    onDrop(source, target, event) {
      const drop = () => {
        if (dialog.open) assign(target.dataset.dropPost, source.dataset.dragPerson, false);
      };
      // Candidate cards are replaced after native touchend has reached its original target.
      if (event.pointerType === 'touch') dialog.ownerDocument.defaultView.requestAnimationFrame(drop);
      else drop();
    },
    ghostClass: 'office-drag-ghost',
  });

  function updateFilters() {
    if (!fields.free.checked && selectedId && !house.candidates.some(candidate => candidate.id === selectedId)
      && !state.applicants(house.id).some(candidate => candidate.id === selectedId)) select(null);
    drawCandidates(true);
  }

  const treePicker = bindTreeCandidatePicker(role('candidate-panel'), {
    candidates: treeCandidates, people,
    listed: id => house.candidates.some(candidate => candidate.id === id) || state.applicants(house.id).some(candidate => candidate.id === id),
    onAdd(id) {
      try {
        if (!state.addApplicant(house.id, id)) return false;
        const includeFree = fields.free.checked;
        filters.reset();
        fields.free.checked = includeFree;
        role('options').open = false;
        fields.query.value = people.get(id).name;
        select(id);
        update(`${people.get(id).name} wurde zur Bewerberliste hinzugefügt und ist ausgewählt.`);
        treePicker.close();
        list.querySelector(`[data-drag-person="${CSS.escape(id)}"]`)?.focus();
        return true;
      } catch (error) { writeStatus(error.message); return false; }
    },
  });

  filters.addEventListener('submit', event => {
    event.preventDefault();
    list.querySelector('button')?.focus();
  });
  filters.addEventListener('input', updateFilters);
  vacanciesOnly.addEventListener('change', drawPosts);
  function updatePostFields() {
    const template = plan.templates.find(entry => entry.id === postFields.template.value);
    customFields.hidden = customFields.disabled = Boolean(template);
    const places = suitableLocalities(plan, template);
    const previous = postFields.site.value;
    siteField.hidden = !places.length || (template?.kind || postFields.kind.value) === 'staff';
    const station = template?.stationed || places.some(place => place.type === 'station');
    siteLabel.textContent = station ? 'Standort' : 'Dienstort';
    postFields.site.innerHTML = `<option value="">${station ? 'Standort offen' : 'Ganze Herrschaft'}</option>` + places.map(place =>
      `<option value="${e(place.key)}">${e(place.name)}</option>`).join('');
    if (places.some(place => place.key === previous)) postFields.site.value = previous;
  }
  function openRoleEditor(post) {
    postForm.reset();
    copiedRole = null;
    if (post) {
      const template = plan.templates.find(entry => entry.id === post.templateId)
        || plan.templates.find(entry => entry.title === post.originalTitle && entry.kind === post.kind && entry.placement === post.placement);
      if (template) postFields.template.value = template.id;
      else {
        copiedRole = post;
        postFields.kind.value = post.kind;
        postFields.title.value = post.roleTitle;
        postFields.description.value = post.description;
      }
    }
    updatePostFields();
    if (post?.site) postFields.site.value = post.site;
    newPost.open = true;
    (post ? postFields.count : postFields.template).focus();
  }
  postFields.template.addEventListener('change', updatePostFields);
  postFields.kind.addEventListener('change', updatePostFields);
  postForm.addEventListener('submit', event => {
    event.preventDefault();
    const { kind, title, description, count, site, template: selection } = postFields;
    const template = plan.templates.find(entry => entry.id === selection.value);
    const copy = copiedRole && copiedRole.kind === kind.value && copiedRole.roleTitle === title.value.trim();
    try {
      const keys = state.addPosts(house.id, {
        area: area.id, kind: template?.kind || kind.value, title: template?.title ?? (copy ? copiedRole.originalTitle : title.value),
        description: template?.description ?? description.value, templateId: template?.id || (copy ? copiedRole.templateId : undefined),
        site: siteField.hidden ? '' : site.value,
      }, count.valueAsNumber);
      postForm.reset();
      copiedRole = null;
      updatePostFields();
      newPost.open = false;
      update(keys.length === 1 ? 'Zusätzlicher Posten angelegt.' : `${keys.length} Posten angelegt.`, keys[0], keys.length > 1);
    } catch (error) { writeStatus(error.message); }
  });

  function activate(category) {
    area = category;
    plan = house.plans[area.id];
    treePicker.close();
    role('area-icon').src = area.imageSrc;
    backButton.hidden = !parentViews.length;
    backButton.setAttribute('aria-label', `Zurück zu ${parentViews.at(-1)?.category.name || 'den Hofämtern'}`);
    newPost.open = false;
    postForm.reset();
    copiedRole = null;
    drawRoleOptions();
    const kinds = plan.sections.some(section => section.staff) ? [...LOWER_ROLE_KINDS, 'staff'] : LOWER_ROLE_KINDS;
    postFields.kind.innerHTML = kinds.map(kind => `<option value="${kind}">${e(ROLE_KINDS[kind].title)}</option>`).join('');
    updatePostFields();
    role('posts').replaceChildren();
    role('role-groups').replaceChildren();
    connections.innerHTML = `${plan.connections?.length ? `<nav class="department-links" aria-label="Verbundene Hofämter">
        <strong>${area.id === 'hof-hofmeister' ? 'Fachunterricht am Hof' : 'Unterstelltes Hofamt'}</strong>
        ${plan.connections.map(({ key, department, title: name }) => `<button type="button" data-action="open-department"
          data-department="${e(department)}" data-post="${e(key)}">${e(name)} ↗</button>`).join('')}
      </nav>` : ''}
      ${plan.references.length ? renderContacts(plan.references, people, 'Vikariate der Lehnsherrschaften', { state }) : ''}
      ${area.id === 'militaer' ? renderMilitaryForces(house) : ''}
      ${area.id === 'spionage' ? `<details class="reference-panel shadow-notes"><summary>Vertrauliche Amtsüberlieferung</summary>
        <p>${e(shadowTradition)}</p></details>` : ''}`;
    connections.hidden = !connections.textContent.trim();
    drawPosts(true);
    drawCandidates(true);
    postScroll.scrollTop = 0;
  }

  function back() {
    const parent = parentViews.pop();
    if (!parent) return;
    activate(parent.category);
    postScroll.scrollTop = parent.scroll;
    dialog.querySelector(`[data-action="open-department"][data-post="${CSS.escape(parent.post)}"]`)?.focus();
  }

  function openDepartment(id, post) {
    const child = house.plans[id]?.department;
    if (!child) return;
    parentViews.push({ category: area, post, scroll: postScroll.scrollTop });
    activate(child);
    title.focus({ preventScroll: true });
  }

  function finishClose() {
    if (dialog.open || !pendingClose) return;
    pendingClose = false;
    drag.cancel();
    preferences.set(house.id, { free: fields.free.checked });
    onClose(rootArea.id);
  }

  function close() {
    dialog.close();
    finishClose();
  }

  dialog.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const { action, dragPerson, post } = button.dataset;
    switch (action) {
      case 'close': close(); break;
      case 'back-office': back(); break;
      case 'manage-roles': openRoleEditor(); break;
      case 'add-role-like': openRoleEditor(state.positions(house.id).get(post)); break;
      case 'rename-title': editor.open(button); break;
      case 'configure-authority': {
        const slot = state.positions(house.id).get(post);
        if (slot?.authority) localEditor.open(slot);
        break;
      }
      case 'open-department': {
        openDepartment(button.dataset.department, post);
        break;
      }
      case 'undo':
        if (state.undo()) {
          select(null);
          drawRoleOptions();
          update('Letzte Änderung zurückgenommen.');
          if (button.disabled) title.focus();
        }
        break;
      case 'select-person': select(selectedId === dragPerson ? null : dragPerson); break;
      case 'remove-applicant':
        try {
          if (state.removeApplicant(house.id, button.dataset.person)) {
            if (selectedId === button.dataset.person) select(null);
            update('Die Stammbaumfigur wurde aus der Bewerberliste entfernt.');
            fields.query.focus();
          }
        } catch (error) { writeStatus(error.message); }
        break;
      case 'choose-post':
        if (selectedId) assign(post, selectedId, true);
        else if (dragPerson) select(dragPerson);
        else writeStatus('Wähle zuerst eine Figur aus der Kandidatenliste.');
        break;
      case 'clear-selection':
        select(null);
        fields.query.focus();
        break;
      case 'clear-post': assign(post, null, true); break;
      case 'remove-post':
        if (state.removePost(house.id, post)) {
          const group = button.closest('[data-role-group]')?.dataset.roleGroup;
          update('Zusätzlicher Posten entfernt.');
          const summary = group && dialog.querySelector(`[data-role-group="${CSS.escape(group)}"] > summary`);
          (summary || newPost.querySelector('summary')).focus();
        }
        break;
      case 'reset-filters': {
        const includeFree = fields.free.checked;
        filters.reset();
        fields.free.checked = includeFree;
        updateFilters();
        break;
      }
    }
  });
  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    dismiss();
  });
  function dismiss() {
    if (treePicker.isOpen()) treePicker.close(true);
    else if (parentViews.length) back();
    else close();
  }
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    dismiss();
  });
  dialog.addEventListener('close', finishClose);

  return {
    open(scope, category, department, postKey) {
      if (dialog.open) preferences.set(house.id, { free: fields.free.checked });
      house = scope;
      rootArea = category;
      parentViews.length = 0;
      role('scope-label').textContent = house.name;
      filters.reset();
      fields.free.checked = preferences.get(house.id)?.free || false;
      role('options').open = false;
      vacanciesOnly.checked = false;
      select(null);
      activate(category);
      if (!dialog.open) {
        dialog.showModal();
        pendingClose = true;
      }
      title.focus({ preventScroll: true });
      postScroll.scrollTop = 0;
      list.scrollTop = 0;
      const direct = plan.slots.find(slot => department && slot.department === department);
      if (direct) openDepartment(department, direct.key);
      if (postKey) focusPost(state.postKey(house.id, postKey));
    },
  };
}
