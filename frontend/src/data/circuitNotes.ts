/**
 * Notas técnicas por circuito (LocalStorage).
 * Permite anotar relación de cambios, presiones, líneas de frenada, etc.
 */

const STORAGE_KEY = 'rt-circuit-notes-v1';

export function loadCircuitNotes(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function getCircuitNote(circuitName: string): string {
  return loadCircuitNotes()[circuitName] || '';
}

export function saveCircuitNote(circuitName: string, note: string): void {
  const all = loadCircuitNotes();
  if (note.trim() === '') {
    delete all[circuitName];
  } else {
    all[circuitName] = note;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}
