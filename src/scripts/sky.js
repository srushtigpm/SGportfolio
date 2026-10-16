// The sky follows the visitor's local time: dawn, day, dusk and night each have their own mist.
// Add ?sky=dawn|day|dusk|night to any URL to preview a time of day.

// Colours are sRGB 0–1: base mist, lilac drift, sky drift, warm drift, light from above.
const PHASES = {
  night: { base: [.10, .12, .21], lilac: [.21, .19, .35], sky: [.12, .23, .37], warm: [.40, .28, .40], glow: [.50, .58, .85], stars: 1 },
  dawn:  { base: [.93, .89, .87], lilac: [.86, .77, .84], sky: [.79, .84, .91], warm: [.99, .80, .64], glow: [1., .88, .72], stars: .05 },
  day:   { base: [.925, .91, .89], lilac: [.80, .78, .86], sky: [.76, .845, .88], warm: [.975, .855, .735], glow: [1., .97, .9], stars: 0 },
  dusk:  { base: [.85, .76, .76], lilac: [.64, .56, .73], sky: [.58, .60, .77], warm: [.98, .66, .54], glow: [1., .74, .58], stars: .2 },
};
// Hour of day → phase, blended smoothly between neighbours
const KEYS = [[0, 'night'], [4.5, 'night'], [6.5, 'dawn'], [9, 'day'], [16.5, 'day'], [18.5, 'dusk'], [20.5, 'night'], [24, 'night']];

export function forcedPhase() {
  try { const p = new URLSearchParams(location.search).get('sky'); return p in PHASES ? p : null; } catch { return null; }
}

const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
export function skyAt(date = new Date()) {
  const forced = forcedPhase();
  if (forced) return { ...PHASES[forced], name: forced, night: forced === 'night' ? 1 : 0 };
  const h = date.getHours() + date.getMinutes() / 60;
  let i = 0; while (h >= KEYS[i + 1][0]) i++;
  const [h0, p0] = KEYS[i], [h1, p1] = KEYS[i + 1];
  const raw = (h - h0) / (h1 - h0), t = raw * raw * (3 - 2 * raw);
  const A = PHASES[p0], B = PHASES[p1];
  const out = {};
  for (const k of ['base', 'lilac', 'sky', 'warm', 'glow']) out[k] = mix(A[k], B[k], t);
  out.stars = A.stars + (B.stars - A.stars) * t;
  out.name = t < .5 ? p0 : p1;
  out.night = (p0 === 'night' ? 1 - t : 0) + (p1 === 'night' ? t : 0);
  return out;
}

export const phaseLabel = { night: 'Night where you are', dawn: 'Dawn where you are', day: 'Daylight where you are', dusk: 'Dusk where you are' };

// Mark the page so CSS can switch to light-on-dark text at night
export function applySkyToDocument(sky = skyAt()) {
  const el = document.documentElement;
  el.dataset.sky = sky.name;
  el.classList.toggle('is-night', sky.night > .5);
}
