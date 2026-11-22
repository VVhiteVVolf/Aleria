import { RANGE } from './archery-range.js?v=20261122-carys-archery-v1';

const movement = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']);
const keyboard = 'keyboard';

export function bindArcheryInput(field, { signal, aim, draw, release, cancel }) {
  const canvas = field.querySelector('canvas');
  const keys = new Set();
  let drawingWith = null;

  function aimWithPointer(event) {
    const bounds = canvas.getBoundingClientRect();
    const fingerClearance = event.pointerType === 'touch' ? 19 : 0;
    aim((event.clientX - bounds.left) * RANGE.width / bounds.width,
        (event.clientY - bounds.top - fingerClearance) * RANGE.height / bounds.height);
  }

  function start(source) {
    if (drawingWith !== null || !draw()) return false;
    drawingWith = source;
    return true;
  }

  function finish(source, shoot) {
    if (source !== drawingWith) return;
    drawingWith = null;
    if (shoot) release();
    else cancel();
  }

  function clear() {
    const pointer = drawingWith;
    if (drawingWith !== null) finish(drawingWith, false);
    if (typeof pointer === 'number' && field.hasPointerCapture(pointer)) field.releasePointerCapture(pointer);
    keys.clear();
  }

  field.addEventListener('pointermove', event => {
    if (!event.isPrimary || (typeof drawingWith === 'number' && event.pointerId !== drawingWith)) return;
    if (event.pointerType !== 'touch' || event.pointerId === drawingWith) aimWithPointer(event);
  }, { signal });
  field.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    field.focus({ preventScroll: true });
    aimWithPointer(event);
    if (start(event.pointerId)) {
      field.setPointerCapture(event.pointerId);
      event.preventDefault();
    }
  }, { signal });
  field.addEventListener('pointerup', event => {
    if (drawingWith !== event.pointerId) return;
    aimWithPointer(event);
    finish(event.pointerId, true);
  }, { signal });
  for (const type of ['pointercancel', 'lostpointercapture']) {
    field.addEventListener(type, event => finish(event.pointerId, false), { signal });
  }
  field.addEventListener('keydown', event => {
    if (movement.has(event.key)) keys.add(event.key);
    else if (event.key === ' ') { if (!event.repeat) start(keyboard); }
    else return;
    event.preventDefault();
    event.stopPropagation();
  }, { signal });
  field.addEventListener('keyup', event => {
    if (movement.has(event.key)) keys.delete(event.key);
    else if (event.key === ' ') finish(keyboard, true);
    else return;
    event.preventDefault();
    event.stopPropagation();
  }, { signal });
  field.addEventListener('blur', clear, { signal });
  return {
    clear,
    direction() {
      return {
        x: Number(keys.has('ArrowRight')) - Number(keys.has('ArrowLeft')),
        y: Number(keys.has('ArrowDown')) - Number(keys.has('ArrowUp'))
      };
    }
  };
}
