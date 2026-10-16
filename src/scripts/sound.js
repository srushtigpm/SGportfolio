// Sounds, all synthesised with Web Audio (no files): a paper flick when a card turns,
// a chime when a card is collected, a whoosh for a tossed card, page turns, and wind in the mist.
// Off by default; the visitor's choice is remembered.
const KEY = 'arcana:sound';
let ctx = null, master = null, windGain = null, noise = null;
let enabled = false;
const listeners = new Set();

const readPref = () => { try { return localStorage.getItem(KEY) === '1'; } catch { return false; } };
const writePref = (v) => { try { localStorage.setItem(KEY, v ? '1' : '0'); } catch {} };

function ensure() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain(); master.gain.value = .9; master.connect(ctx.destination);
  // two seconds of white noise, reused by every noisy sound
  noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return ctx;
}

function noiseSource(loop = false) { const s = ctx.createBufferSource(); s.buffer = noise; s.loop = loop; return s; }

function startWind() {
  if (!ctx || windGain) return;
  const src = noiseSource(true);
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 420; bp.Q.value = .7;
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900;
  windGain = ctx.createGain(); windGain.gain.value = 0;
  // slow gusts: LFOs on the filter and the level
  const lfo = ctx.createOscillator(); lfo.frequency.value = .07;
  const lfoAmt = ctx.createGain(); lfoAmt.gain.value = 240; lfo.connect(lfoAmt).connect(bp.frequency);
  const gust = ctx.createOscillator(); gust.frequency.value = .045;
  const gustAmt = ctx.createGain(); gustAmt.gain.value = .018; gust.connect(gustAmt).connect(windGain.gain);
  src.connect(bp).connect(lp).connect(windGain).connect(master);
  src.start(); lfo.start(); gust.start();
  windGain.gain.setTargetAtTime(.035, ctx.currentTime, 1.5);
}
function stopWind() {
  if (!windGain) return;
  const g = windGain; windGain = null;
  g.gain.setTargetAtTime(0, ctx.currentTime, .4);
  setTimeout(() => g.disconnect(), 2000);
}

const sounds = {
  // a card turning over: a short, bright rasp of paper and a soft tap
  flick() {
    const t = ctx.currentTime, s = noiseSource();
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = .9;
    bp.frequency.setValueAtTime(3200, t); bp.frequency.exponentialRampToValueAtTime(1100, t + .14);
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.32, t + .006); g.gain.exponentialRampToValueAtTime(.001, t + .16);
    s.connect(bp).connect(g).connect(master); s.start(t, Math.random()); s.stop(t + .2);
    const o = ctx.createOscillator(); o.frequency.setValueAtTime(180, t + .1); o.frequency.exponentialRampToValueAtTime(90, t + .18);
    const og = ctx.createGain(); og.gain.setValueAtTime(.0001, t + .1); og.gain.exponentialRampToValueAtTime(.12, t + .11); og.gain.exponentialRampToValueAtTime(.0001, t + .2);
    o.connect(og).connect(master); o.start(t + .1); o.stop(t + .22);
  },
  // a card collected: three soft bell partials from a pentatonic scale, with a little echo
  chime() {
    const t = ctx.currentTime, notes = [1046.5, 1174.7, 1318.5, 1568, 1760];
    const root = notes[Math.floor(Math.random() * notes.length)];
    const delay = ctx.createDelay(); delay.delayTime.value = .23;
    const fb = ctx.createGain(); fb.gain.value = .32; delay.connect(fb).connect(delay);
    const wet = ctx.createGain(); wet.gain.value = .35; delay.connect(wet).connect(master);
    [[1, .14], [2.01, .05], [3.0, .025], [.5, .05]].forEach(([mult, amp], i) => {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = root * mult;
      const g = ctx.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(amp, t + .01 + i * .004); g.gain.exponentialRampToValueAtTime(.0001, t + 2.4 - i * .3);
      o.connect(g); g.connect(master); g.connect(delay); o.start(t); o.stop(t + 2.5);
    });
    setTimeout(() => { delay.disconnect(); fb.disconnect(); }, 4000);
  },
  // a tossed card cutting the air
  whoosh() {
    const t = ctx.currentTime, s = noiseSource();
    const lp = ctx.createBiquadFilter(); lp.type = 'bandpass'; lp.Q.value = 1.2;
    lp.frequency.setValueAtTime(350, t); lp.frequency.exponentialRampToValueAtTime(1900, t + .18); lp.frequency.exponentialRampToValueAtTime(400, t + .55);
    const g = ctx.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.28, t + .14); g.gain.exponentialRampToValueAtTime(.0001, t + .6);
    s.connect(lp).connect(g).connect(master); s.start(t, Math.random()); s.stop(t + .65);
  },
  // a book page turning: a longer, rising swish
  page() {
    const t = ctx.currentTime, s = noiseSource();
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 600;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = .6;
    bp.frequency.setValueAtTime(900, t); bp.frequency.exponentialRampToValueAtTime(3600, t + .22); bp.frequency.exponentialRampToValueAtTime(1500, t + .42);
    const g = ctx.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.2, t + .08); g.gain.linearRampToValueAtTime(.12, t + .25); g.gain.exponentialRampToValueAtTime(.0001, t + .45);
    s.connect(hp).connect(bp).connect(g).connect(master); s.start(t, Math.random()); s.stop(t + .5);
  },
  // the wheel's pawl clicking past a spoke
  tick() {
    const t = ctx.currentTime, o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = 2400;
    const g = ctx.createGain(); g.gain.setValueAtTime(.08, t); g.gain.exponentialRampToValueAtTime(.0001, t + .03);
    o.connect(g).connect(master); o.start(t); o.stop(t + .04);
  },
};

export function play(name) {
  if (!enabled || !ensure() || ctx.state !== 'running') return;
  sounds[name]?.();
}

export function soundOn() { return enabled; }
export function onSoundChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

export function setSound(on) {
  enabled = on; writePref(on);
  if (on) { if (ensure()) { ctx.resume(); startWind(); } }
  else stopWind();
  listeners.forEach((fn) => fn(on));
}

// On each page: if sound was left on, start it at the first touch or key press (browsers block audio before that).
export function initSound() {
  enabled = readPref();
  listeners.forEach((fn) => fn(enabled));
  if (!enabled) return;
  const wake = () => {
    removeEventListener('pointerdown', wake, true); removeEventListener('keydown', wake, true);
    if (enabled && ensure()) { ctx.resume(); startWind(); }
  };
  addEventListener('pointerdown', wake, true); addEventListener('keydown', wake, true);
}
