const FRAME_ASSET_ROOT = 'assets/images/frames';

export const DEFAULT_CREST_FRAME = 'gold';

function personFrame(asset, crestCenterX, crestCenterY) {
  const width = 13.4;
  const height = 20.1;
  const percent = value => `${Number(value.toFixed(3))}%`;
  return Object.freeze({
    asset: `${FRAME_ASSET_ROOT}/${asset}`,
    crestPosition: Object.freeze({
      left: percent(crestCenterX - (width / 2)),
      top: percent(crestCenterY - (height / 2)),
      width: percent(width),
      height: percent(height)
    })
  });
}

export const PERSON_CARD_FRAMES = Object.freeze({
  core: personFrame('person-core.png', 50, 12.15),
  married: personFrame('person-married.png', 50.07, 13.05),
  bastard: personFrame('person-bastard.png', 49.85, 13.05),
  affair: personFrame('person-affair.png', 50.07, 13.05),
  forced: personFrame('person-forced.png', 47.8, 11.5),
  ward: personFrame('person-ward.png', 48.4, 11.8),
  'ward-away': personFrame('person-ward-away.png', 47.8, 11.8),
  adopted: personFrame('person-adopted.png', 47.8, 12.25)
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

export function getPersonCardFrame(roleId) {
  return PERSON_CARD_FRAMES[roleId] || PERSON_CARD_FRAMES.core;
}

export function getCrestFrame(frameId) {
  return CREST_FRAMES[frameId] || CREST_FRAMES[DEFAULT_CREST_FRAME];
}

export function isCrestFrameId(frameId) {
  return Object.hasOwn(CREST_FRAMES, frameId);
}
