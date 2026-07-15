import { CREST_FRAMES, DEFAULT_CREST_FRAME } from '../config/chart-frames.js';

export function fillCrestFrameSelect(select, selectedFrame = DEFAULT_CREST_FRAME) {
  select.replaceChildren(...Object.values(CREST_FRAMES).map(frame => (
    new Option(frame.label, frame.id)
  )));
  select.value = Object.hasOwn(CREST_FRAMES, selectedFrame)
    ? selectedFrame
    : DEFAULT_CREST_FRAME;
}
