// A small glowing star for a cursor, trailing fading sparks through the mist.
// Only on devices with a precise pointer, and never when the visitor prefers reduced motion.
const INTERACTIVE = 'a, button, summary, [role="tab"], label, select, .pointing, .spine, .book, [data-cursor="hand"]';

export function startCursor() {
  if (!matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const root = document.documentElement;
  root.classList.add('star-cursor');

  const cv = document.createElement('canvas');
  cv.setAttribute('aria-hidden', 'true');
  Object.assign(cv.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', pointerEvents: 'none', zIndex: '9999' });
  document.body.appendChild(cv);
  const g = cv.getContext('2d');
  let dpr = 1;
  const resize = () => { dpr = Math.min(devicePixelRatio || 1, 2); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; };
  resize(); addEventListener('resize', resize);

  const pos = { x: -100, y: -100 }, star = { x: -100, y: -100, s: 1, ring: 0 };
  let visible = false, hot = false, down = false, last = { x: -100, y: -100 };
  const sparks = [];

  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    pos.x = e.clientX; pos.y = e.clientY;
    if (!visible) { star.x = last.x = pos.x; star.y = last.y = pos.y; visible = true; }
    const t = e.target instanceof Element ? e.target : null;
    hot = !!t?.closest(INTERACTIVE) || !!document.querySelector('canvas.pointing:hover');
    // drop sparks along the path, more when moving fast
    const dist = Math.hypot(pos.x - last.x, pos.y - last.y), n = Math.min(6, Math.floor(dist / 9));
    for (let i = 0; i < n; i++) {
      const k = i / Math.max(1, n);
      sparks.push({ x: last.x + (pos.x - last.x) * k, y: last.y + (pos.y - last.y) * k, vx: (Math.random() - .5) * 18, vy: (Math.random() - .3) * 18, life: 1, size: .8 + Math.random() * 1.8 });
    }
    if (n) last = { x: pos.x, y: pos.y };
    if (sparks.length > 160) sparks.splice(0, sparks.length - 160);
  }, { passive: true });
  addEventListener('pointerdown', () => { down = true; for (let i = 0; i < 10; i++) { const a = Math.random() * Math.PI * 2, v = 30 + Math.random() * 60; sparks.push({ x: pos.x, y: pos.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, size: 1 + Math.random() * 1.6 }); } });
  addEventListener('pointerup', () => { down = false; });
  document.addEventListener('pointerleave', () => { visible = false; });
  document.addEventListener('mouseleave', () => { visible = false; });

  const drawStar = (x, y, r, rot) => {
    g.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = rot + i * Math.PI / 4, rr = i % 2 ? r * .28 : r;
      g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    g.closePath(); g.fill();
  };

  let prev = performance.now();
  const frame = (now) => {
    const dt = Math.min((now - prev) / 1000, 1 / 20); prev = now;
    const night = root.classList.contains('is-night');
    const core = night ? '255, 247, 228' : '150, 112, 48';
    const glow = night ? 'rgba(255, 236, 196, .9)' : 'rgba(214, 170, 92, .8)';
    star.x += (pos.x - star.x) * (1 - Math.exp(-dt * 38));
    star.y += (pos.y - star.y) * (1 - Math.exp(-dt * 38));
    star.s += ((hot ? 1.5 : 1) * (down ? .8 : 1) - star.s) * (1 - Math.exp(-dt * 14));
    star.ring += ((hot ? 1 : 0) - star.ring) * (1 - Math.exp(-dt * 12));

    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, innerWidth, innerHeight);
    g.globalCompositeOperation = night ? 'lighter' : 'source-over';
    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i];
      p.life -= dt * 1.25; if (p.life <= 0) { sparks.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt + 8 * dt; p.vx *= .96; p.vy *= .96;
      g.fillStyle = `rgba(${core}, ${p.life * .75})`;
      g.shadowColor = glow; g.shadowBlur = 6 * p.life;
      g.beginPath(); g.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2); g.fill();
    }
    if (visible) {
      g.shadowColor = glow; g.shadowBlur = 12;
      g.fillStyle = `rgba(${core}, .95)`;
      drawStar(star.x, star.y, 7.5 * star.s, now / 2400);
      g.shadowBlur = 0;
      g.fillStyle = night ? 'rgba(255,255,255,.95)' : 'rgba(255, 248, 232, .95)';
      g.beginPath(); g.arc(star.x, star.y, 1.4 * star.s, 0, Math.PI * 2); g.fill();
      if (star.ring > .02) {
        g.strokeStyle = `rgba(${core}, ${star.ring * .55})`; g.lineWidth = 1;
        g.beginPath(); g.arc(star.x, star.y, 11 + 5 * star.ring, 0, Math.PI * 2); g.stroke();
      }
    }
    g.shadowBlur = 0;
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
