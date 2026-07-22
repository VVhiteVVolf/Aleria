import { PORTRAIT_PLACEHOLDERS } from '../config/portrait-placeholders.js';
import { normalizeFamilyId } from '../services/family-library.js';
import { DEFAULT_CREST_FRAME } from '../config/chart-frames.js';
import { fillCrestFrameSelect } from './crest-frame-options.js';
import { fillHouseRankSelect } from './house-profile-fields.js';

export function createNewFamilyDialog(documentRef = document) {
  const dialog = documentRef.getElementById('new-family-dialog');
  const form = documentRef.getElementById('new-family-form');
  const titleInput = form.elements.namedItem('documentTitle');
  const idInput = form.elements.namedItem('documentId');
  let idWasEdited = false;

  function open() {
    form.reset();
    idWasEdited = false;
    fillCrestFrameSelect(form.elements.namedItem('crestFrame'), DEFAULT_CREST_FRAME);
    fillHouseRankSelect(form.elements.namedItem('rankId'), 'unknown');
    form.elements.namedItem('emblem').value = PORTRAIT_PLACEHOLDERS.crest;
    form.elements.namedItem('nextStep').value = 'guided';
    dialog.showModal();
    titleInput.focus();
  }

  function read() {
    const values = Object.fromEntries(new FormData(form).entries());
    return {
      documentTitle: String(values.documentTitle || '').trim(),
      documentId: normalizeFamilyId(values.documentId || values.documentTitle),
      motto: String(values.motto || '').trim(),
      rankId: String(values.rankId || 'unknown'),
      emblem: String(values.emblem || '').trim(),
      crestSubtitle: String(values.crestSubtitle || '').trim(),
      crestFrame: String(values.crestFrame || DEFAULT_CREST_FRAME),
      founderManName: String(values.founderManName || '').trim(),
      founderManTitle: String(values.founderManTitle || '').trim(),
      founderManBirth: String(values.founderManBirth || '').trim(),
      founderManDeath: String(values.founderManDeath || '').trim(),
      founderWomanName: String(values.founderWomanName || '').trim(),
      founderWomanTitle: String(values.founderWomanTitle || '').trim(),
      founderWomanBirth: String(values.founderWomanBirth || '').trim(),
      founderWomanDeath: String(values.founderWomanDeath || '').trim(),
      marriageYear: String(values.marriageYear || '').trim(),
      nextStep: ['guided', 'automatic', 'register'].includes(values.nextStep)
        ? values.nextStep
        : 'guided'
    };
  }

  titleInput.addEventListener('input', () => {
    if (!idWasEdited) idInput.value = normalizeFamilyId(titleInput.value);
  });
  idInput.addEventListener('input', () => {
    idWasEdited = true;
    idInput.value = normalizeFamilyId(idInput.value);
  });

  return Object.freeze({ dialog, form, open, close: () => dialog.close(), read });
}
