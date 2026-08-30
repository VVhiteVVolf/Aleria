const PORTRAIT_ROOT = 'assets/images/portraits/sept-gruenhand';

export const SEPT_GRUENHAND_LOCAL_PORTRAIT_IDS = Object.freeze([
  'peregrain-gruenhand',
  'rubybhna-gruenhand',
  'lobellin-gruenhand'
]);

export const SEPT_GRUENHAND_LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  SEPT_GRUENHAND_LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.png`
  ])
));
