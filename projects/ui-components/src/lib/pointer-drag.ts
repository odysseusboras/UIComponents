import { NgZone } from '@angular/core';

/**
 * Follows a pointer drag (column / panel resize): `onMove` runs inside the zone
 * for every move, `onEnd` once when the pointer is released or cancelled. While
 * dragging, `body` carries `ui-resizing` so the host can force the resize cursor.
 * Returns a stop function — call it on destroy so a drag never outlives its component.
 */
export function trackPointerDrag(zone: NgZone, onMove: (e: PointerEvent) => void, onEnd: () => void = () => {}): () => void {
  let done = false;
  const move = (e: PointerEvent) => zone.run(() => onMove(e));
  const stop = () => {
    if (done) return;
    done = true;
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', stop);
    window.removeEventListener('pointercancel', stop);
    document.body.classList.remove('ui-resizing');
    zone.run(onEnd);
  };
  zone.runOutsideAngular(() => {
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    document.body.classList.add('ui-resizing');
  });
  return stop;
}
