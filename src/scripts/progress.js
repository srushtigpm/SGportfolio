// Which cards a visitor has turned, remembered in their own browser.
const KEY = 'arcana:turned';
export function getTurned() {
  try { return new Set(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch { return new Set(); }
}
export function markTurned(id) {
  const s = getTurned(); s.add(id);
  try { localStorage.setItem(KEY, JSON.stringify([...s])); } catch {}
  return s;
}
