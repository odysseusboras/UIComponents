export type StatusTone = 'ok' | 'warn' | 'bad' | 'info' | 'muted';

/** Soft-delete flag → chip tone (Active → ok, Deleted → bad). */
export function activeTone(isDeleted: boolean | null | undefined): StatusTone {
  return isDeleted ? 'bad' : 'ok';
}
