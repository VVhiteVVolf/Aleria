const FRAME_ASSET_ROOT = 'assets/images/frames';

export const DEFAULT_CREST_FRAME = 'gold';

function personFrame(asset, crestCenterX, crestCenterY) {
  const width = 14.2;
  const height = 21.3;
  const percent = value => `${Number(value.toFixed(3))}%`;
  return Object.freeze({
    asset: `${FRAME_ASSET_ROOT}/${asset}`,
    variant: 'standard',
    crestPosition: Object.freeze({
      left: percent(crestCenterX - (width / 2)),
      top: percent(crestCenterY - (height / 2)),
      width: percent(width),
      height: percent(height)
    })
  });
}

export const PERSON_CARD_FRAMES = Object.freeze({
  core: personFrame('person-core.png', 50, 12.6),
  married: personFrame('person-married.png', 50.07, 13.5),
  bastard: personFrame('person-bastard.png', 49.85, 13.5),
  affair: personFrame('person-affair.png', 50.07, 13.5),
  forced: personFrame('person-forced.png', 47.8, 11.95),
  ward: personFrame('person-ward.png', 48.4, 12.25),
  'ward-away': personFrame('person-ward-away.png', 47.8, 12.25),
  adopted: personFrame('person-adopted.png', 47.8, 12.7)
});

export const HOUSE_HEAD_CARD_FRAME = Object.freeze({
  asset: `${FRAME_ASSET_ROOT}/OberhauptFrame.PNG`,
  variant: 'head',
  crestPosition: Object.freeze({})
});

export const CREST_FRAMES = Object.freeze({
  gold: Object.freeze({
    id: 'gold',
    label: 'Gold · königlich / Standard',
    asset: `${FRAME_ASSET_ROOT}/crest-gold.png`
  }),
  silver: Object.freeze({
    id: 'silver',
    label: 'Silber · adelig',
    asset: `${FRAME_ASSET_ROOT}/crest-silver.png`
  }),
  bronze: Object.freeze({
    id: 'bronze',
    label: 'Bronze · bürgerlich',
    asset: `${FRAME_ASSET_ROOT}/crest-bronze.png`
  }),
  iron: Object.freeze({
    id: 'iron',
    label: 'Eisen · niedrig geboren',
    asset: `${FRAME_ASSET_ROOT}/crest-iron.png`
  })
});

export const TIME_JUMP_FRAME = Object.freeze({
  asset: `${FRAME_ASSET_ROOT}/time-jump.png`
});

export function getPersonCardFrame(roleId, lineageRole = 'branch') {
  if (lineageRole === 'head') return HOUSE_HEAD_CARD_FRAME;
  return PERSON_CARD_FRAMES[roleId] || PERSON_CARD_FRAMES.core;
}

export function getCrestFrame(frameId) {
  return CREST_FRAMES[frameId] || CREST_FRAMES[DEFAULT_CREST_FRAME];
}

export function isCrestFrameId(frameId) {
  return Object.hasOwn(CREST_FRAMES, frameId);
}
