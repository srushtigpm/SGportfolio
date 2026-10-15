// The home page: eight Rider-Waite cards drifting in a ring of morning mist.
// Drag to spin the ring, tap a card to turn it over and read it, then step into its room.
import * as THREE from 'three';
import { deck } from '../data/deck.js';
import { url } from './url.js';
import { getTurned, markTurned } from './progress.js';
import { mistFragment } from './mistShader.js';

export function startDeck({ canvas, ui }) {
  const N = deck.length;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const WORLD = deck.findIndex((d) => d.finale);

  // ---------- Renderer ----------
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  } catch (e) {
    ui.fallback.hidden = false; canvas.hidden = true; return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.autoClear = false;
  const maxAniso = renderer.capabilities.getMaxAnisotropy();

  // ---------- Mist background ----------
  const bgScene = new THREE.Scene();
  const bgCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const bgU = {
    uTime: { value: 0 }, uDim: { value: 0 }, uCalm: { value: 0 },
    uMouse: { value: new THREE.Vector2(.5, .5) }, uRes: { value: new THREE.Vector2(1, 1) },
  };
  bgScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms: bgU, depthWrite: false, depthTest: false,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }',
    fragmentShader: mistFragment,
  })));

  // ---------- Scene, camera, light ----------
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(new THREE.Color(0xe6e1dc), 6.5, 15.5);
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 60);
  const camBase = new THREE.Vector3(0, .95, 9);
  {
    // a soft studio for the gold to reflect
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = new THREE.Scene();
    env.add(new THREE.Mesh(new THREE.SphereGeometry(10, 32, 16), new THREE.MeshBasicMaterial({ color: 0xd9d2cb, side: THREE.BackSide })));
    const panel = (c, x, y, z, w, h) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m);
    };
    panel(0xffffff, 0, 8, 2, 10, 6); panel(0xfff1dc, -7, 2, 4, 4, 6); panel(0xe8e4ff, 7, 1, 3, 4, 6); panel(0x8a8094, 0, -6, 0, 12, 4);
    scene.environment = pmrem.fromScene(env, .04).texture;
  }
  scene.add(new THREE.HemisphereLight(0xfff8ee, 0xbdb6cc, .9));
  const sun = new THREE.DirectionalLight(0xfff4e6, 1.3); sun.position.set(3, 5, 6); scene.add(sun);
  const lamp = new THREE.PointLight(0xffe2b8, 9, 9, 1.6); scene.add(lamp);

  // ---------- Card geometry ----------
  const CW = 1, CH = 1.757, CR = .055, CT = .016;
  const shape = (() => {
    const s = new THREE.Shape(), x = -CW / 2, y = -CH / 2, w = CW, h = CH, r = CR;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    return s;
  })();
  const faceGeo = new THREE.ShapeGeometry(shape, 8);
  {
    const p = faceGeo.attributes.position, uv = faceGeo.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / CW + .5, p.getY(i) / CH + .5);
  }
  const rimGeo = new THREE.ExtrudeGeometry(shape, { depth: CT, bevelEnabled: false, curveSegments: 8 });
  rimGeo.translate(0, 0, -CT / 2);
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xc6a467, metalness: .9, roughness: .3 });

  // ---------- Card back: ivory with gold linework; the gold is metallic so it glints ----------
  function paintBack() {
    const W = 640, H = Math.round(640 * CH / CW);
    const make = (base, ink, inkSoft) => {
      const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
      g.fillStyle = base; g.fillRect(0, 0, W, H);
      const rr = (i, r) => { g.beginPath(); g.roundRect(i, i, W - 2 * i, H - 2 * i, r); };
      g.strokeStyle = ink; g.lineWidth = 4; rr(26, 18); g.stroke(); g.lineWidth = 1.5; rr(38, 12); g.stroke();
      const cx = W / 2, cy = H / 2;
      g.save(); rr(44, 10); g.clip();
      g.strokeStyle = inkSoft; g.lineWidth = 1.2;
      for (let k = 0; k < 96; k++) {
        const a = k / 96 * Math.PI * 2;
        g.beginPath(); g.moveTo(cx + Math.cos(a) * 120, cy + Math.sin(a) * 120); g.lineTo(cx + Math.cos(a) * 900, cy + Math.sin(a) * 900); g.stroke();
      }
      g.restore();
      g.fillStyle = base; g.beginPath(); g.arc(cx, cy, 112, 0, Math.PI * 2); g.fill();
      g.strokeStyle = ink; g.lineWidth = 2.5; g.beginPath(); g.arc(cx, cy, 104, 0, Math.PI * 2); g.stroke();
      g.lineWidth = 1; g.beginPath(); g.arc(cx, cy, 94, 0, Math.PI * 2); g.stroke();
      for (let k = 0; k < 24; k++) {
        const a = k / 24 * Math.PI * 2, r2 = k % 2 ? 126 : 146;
        g.lineWidth = k % 2 ? 1.5 : 3; g.beginPath(); g.moveTo(cx + Math.cos(a) * 104, cy + Math.sin(a) * 104); g.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2); g.stroke();
      }
      g.fillStyle = ink; g.beginPath(); g.arc(cx - 6, cy, 48, 0, Math.PI * 2); g.fill();
      g.fillStyle = base; g.beginPath(); g.arc(cx + 14, cy - 6, 44, 0, Math.PI * 2); g.fill();
      const star = (x, y, r) => {
        g.beginPath();
        for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2 - Math.PI / 2, q = k % 2 ? r * .38 : r; g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); }
        g.closePath(); g.fill();
      };
      g.fillStyle = ink; star(cx + 30, cy + 22, 13); star(cx, 120, 16); star(cx, H - 120, 16);
      return c;
    };
    const color = new THREE.CanvasTexture(make('#efe9df', '#a98650', 'rgba(169,134,80,.28)'));
    color.colorSpace = THREE.SRGBColorSpace; color.anisotropy = maxAniso;
    const metal = new THREE.CanvasTexture(make('#000', '#fff', 'rgba(255,255,255,.35)'));
    return new THREE.MeshStandardMaterial({ map: color, metalnessMap: metal, metalness: 1, roughness: .42, envMapIntensity: 1.1 });
  }
  const backMat = paintBack();

  // ---------- Cards ----------
  const loader = new THREE.TextureLoader();
  const spring = (x = 0) => ({ x, v: 0 });
  const stepSpring = (s, target, k, d, dt) => { s.v += (k * (target - s.x) - d * s.v) * dt; s.x += s.v * dt; };
  const turnedBefore = getTurned();
  const cards = deck.map((d, i) => {
    const tex = loader.load(url(`cards/${d.file}.webp`));
    tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = maxAniso;
    const group = new THREE.Group();
    const front = new THREE.Mesh(faceGeo, new THREE.MeshStandardMaterial({ map: tex, roughness: .6, metalness: 0, alphaTest: .4, envMapIntensity: .6 }));
    front.position.z = CT / 2 + .0006;
    const back = new THREE.Mesh(faceGeo, backMat); back.rotation.y = Math.PI; back.position.z = -CT / 2 - .0006;
    const rim = new THREE.Mesh(rimGeo, rimMat);
    group.add(front, back, rim);
    [front, back, rim].forEach((m) => { m.userData.card = i; });
    scene.add(group);
    const turned = turnedBefore.has(d.id);
    const c = {
      i, data: d, group, turned, base: i / N * Math.PI * 2, seed: Math.random() * 100,
      px: spring((i - N / 2) * .02), py: spring(-2.6), pz: spring(2.4),
      rx: spring(-1.2), ry: spring(0), rz: spring(0), flip: spring(turned ? 0 : 1), s: spring(1), shake: 0,
      release: reduceMotion ? 0 : .4 + i * .11, snap: reduceMotion,
    };
    group.position.set(c.px.x, c.py.x, c.pz.x);
    group.rotation.set(c.rx.x, c.flip.x * Math.PI, 0);
    return c;
  });

  // ---------- Floating dust ----------
  const DUST = 420;
  const dustPos = new Float32Array(DUST * 3), dustSeed = new Float32Array(DUST);
  for (let k = 0; k < DUST; k++) {
    dustPos[k * 3] = (Math.random() - .5) * 18; dustPos[k * 3 + 1] = (Math.random() - .5) * 10; dustPos[k * 3 + 2] = (Math.random() - .5) * 14;
    dustSeed[k] = Math.random();
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  dustGeo.setAttribute('seed', new THREE.BufferAttribute(dustSeed, 1));
  const dustMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, uniforms: { uTime: { value: 0 }, uPx: { value: renderer.getPixelRatio() } },
    vertexShader: `attribute float seed; uniform float uTime, uPx; varying float vA;
      void main(){ vec3 p = position;
        p.y = mod(p.y + uTime * (.05 + seed * .12) + 5., 10.) - 5.;
        p.x += sin(uTime * .3 + seed * 30.) * .3;
        vec4 mv = modelViewMatrix * vec4(p, 1.);
        gl_PointSize = (1.2 + seed * 2.6) * uPx * (9. / -mv.z);
        vA = (.25 + .55 * seed) * smoothstep(22., 6., -mv.z) * (.6 + .4 * sin(uTime * (.6 + seed) + seed * 50.));
        gl_Position = projectionMatrix * mv; }`,
    fragmentShader: 'varying float vA; void main(){ float d = length(gl_PointCoord - .5); gl_FragColor = vec4(1., .97, .9, vA * smoothstep(.5, .0, d)); }',
  });
  scene.add(new THREE.Points(dustGeo, dustMat));

  // ---------- Interaction ----------
  const pointer = new THREE.Vector2(), pointerS = new THREE.Vector2();
  let ringAngle = 0, ringVel = 0, ringTarget = null;
  let dragging = false, downY = 0, downT = 0, lastX = 0, lastMoveT = 0, moved = 0;
  let hovered = -1, selected = -1, lastInteract = performance.now();
  const dim = spring(0);
  const ray = new THREE.Raycaster();
  const hitTargets = cards.flatMap((c) => c.group.children);

  function pick(e) {
    const r = canvas.getBoundingClientRect();
    ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
    const hit = ray.intersectObjects(hitTargets, false)[0];
    return hit ? hit.object.userData.card : -1;
  }
  canvas.addEventListener('pointerdown', (e) => {
    dragging = true; moved = 0; lastX = e.clientX; downY = e.clientY; downT = lastMoveT = performance.now(); ringVel = 0;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    lastInteract = performance.now();
    if (dragging) {
      const now = performance.now(), dx = e.clientX - lastX, et = Math.max(.008, (now - lastMoveT) / 1000);
      lastX = e.clientX; lastMoveT = now; moved += Math.abs(dx) + Math.abs(e.clientY - downY) * .1;
      if (moved > 6) {
        canvas.classList.add('dragging');
        if (selected < 0) { const step = dx * (narrow ? .009 : .005); ringAngle += step; ringVel = THREE.MathUtils.lerp(ringVel, step / et, .35); }
      }
    } else if (e.pointerType === 'mouse') {
      hovered = selected < 0 ? pick(e) : -1;
      canvas.classList.toggle('pointing', hovered >= 0 || selected >= 0);
    }
  });
  canvas.addEventListener('pointerup', (e) => {
    if (!dragging) return;
    dragging = false; canvas.classList.remove('dragging');
    if (moved <= 6 && performance.now() - downT < 500) {
      const hit = pick(e);
      if (selected >= 0) deselect(); else if (hit >= 0) select(hit);
    }
  });
  canvas.addEventListener('pointercancel', () => { dragging = false; canvas.classList.remove('dragging'); });
  canvas.addEventListener('pointerleave', () => { if (!dragging) { hovered = -1; pointer.set(0, 0); } });
  addEventListener('wheel', (e) => { if (selected < 0) { ringVel += (e.deltaY + e.deltaX) * .0009; lastInteract = performance.now(); } }, { passive: true });
  addEventListener('keydown', (e) => {
    if (e.target instanceof HTMLElement && e.target.closest('details, input, textarea')) return;
    if (e.key === 'Escape' && selected >= 0) deselect();
    if (selected < 0 && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) { ringVel += e.key === 'ArrowLeft' ? -1.2 : 1.2; lastInteract = performance.now(); }
  });
  ui.back.addEventListener('click', () => deselect());

  const othersTurned = () => cards.filter((c) => c.turned && c.i !== WORLD).length;

  function select(i) {
    if (selected === i) return;
    if (selected >= 0) deselect();
    const c = cards[i], d = c.data;
    if (i === WORLD && !c.turned && othersTurned() < N - 1) {
      // The World turns last: shake it gently and say how many are left
      c.shake = 1;
      const left = N - 1 - othersTurned();
      showReading({
        num: d.num, name: 'Not yet',
        story: `The World is the last card in the deck. Turn the other ${left === 1 ? 'card' : `${left} cards`} first and it will open for you.`,
        inside: null, href: url(d.path), enterLabel: 'Or skip straight to hello',
      });
      ui.reading.dataset.locked = '';
      setTimeout(() => { if (selected < 0) hideReading(); }, 4200);
      return;
    }
    selected = i; hovered = -1;
    const want = -c.base, diff = Math.atan2(Math.sin(want - ringAngle), Math.cos(want - ringAngle));
    ringTarget = ringAngle + diff;
    c.turned = true; markTurned(d.id); updateTally();
    showReading({ num: d.num, name: d.name, story: d.story, inside: d.inside, href: url(d.path), enterLabel: `Enter ${d.inside.toLowerCase()}` });
    delete ui.reading.dataset.locked;
    canvas.classList.add('pointing');
  }
  function deselect() {
    if (selected < 0) return;
    selected = -1; ringTarget = null;
    hideReading();
    canvas.classList.remove('pointing');
  }
  function showReading({ num, name, story, inside, href, enterLabel }) {
    ui.num.textContent = num; ui.name.textContent = name; ui.story.textContent = story;
    ui.insideRow.hidden = !inside; if (inside) ui.inside.textContent = inside;
    ui.enter.href = href; ui.enterLabel.textContent = enterLabel;
    ui.reading.classList.add('open'); document.body.classList.add('reading-open');
  }
  function hideReading() { ui.reading.classList.remove('open'); document.body.classList.remove('reading-open'); }
  function updateTally() {
    const n = cards.filter((c) => c.turned).length;
    [...ui.pips.children].forEach((p, k) => p.classList.toggle('on', cards[k].turned));
    ui.tally.textContent = `${n} of ${N} turned`;
    ui.hint.textContent = n === N
      ? 'Every card turned. Step into any room you like.'
      : othersTurned() === N - 1 ? 'The World is ready to turn.' : 'Drag to let the deck drift. Tap a card to turn it over.';
  }
  // the Index can open a card in place
  ui.openCard = (id) => select(deck.findIndex((d) => d.id === id));

  // ---------- Layout ----------
  let aspect = 1, narrow = false, ringR = 3.4;
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    aspect = w / h; narrow = aspect < 1;
    camera.aspect = aspect;
    const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    ringR = narrow ? 2.6 : 3.4;
    camBase.z = narrow ? Math.min(13, Math.max(9, 3.1 / (tanV * aspect))) : Math.max(9, (ringR + .9) / (tanV * aspect) * .95);
    camera.updateProjectionMatrix();
    bgU.uRes.value.set(w, h);
  }
  addEventListener('resize', resize); resize();

  // where a turned card is held: in front of the camera, nudged right on wide screens so the reading sits to its left
  const held = new THREE.Vector3();
  function heldPosition() {
    const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const dist = narrow ? 4.6 : 3.7, vh = 2 * dist * tanV, vw = vh * aspect;
    return held.set(camera.position.x + (narrow ? 0 : vw * .16), camera.position.y + (narrow ? vh * .14 : 0), camera.position.z - dist);
  }

  // ---------- Loop ----------
  const clock = new THREE.Clock();
  function frame() {
    const dt = Math.min(clock.getDelta(), 1 / 30), t = clock.elapsedTime;
    pointerS.lerp(pointer, 1 - Math.exp(-dt * 4));

    if (ringTarget !== null) { ringAngle += (ringTarget - ringAngle) * (1 - Math.exp(-dt * 3)); ringVel = 0; }
    else if (!dragging) {
      ringVel *= Math.exp(-dt * 1.6);
      if (!reduceMotion && performance.now() - lastInteract > 2500) ringVel += (.05 - ringVel) * (1 - Math.exp(-dt * .5));
      ringAngle += ringVel * dt;
    }

    camera.position.set(camBase.x + pointerS.x * .45, camBase.y + pointerS.y * .3, camBase.z);
    camera.lookAt(0, selected >= 0 ? .1 : 0, 0);
    lamp.position.set(pointerS.x * 4.5, pointerS.y * 2.8 + .8, 4.6);

    stepSpring(dim, selected >= 0 ? 1 : 0, 30, 11, dt);
    bgU.uDim.value = dim.x; bgU.uTime.value = t; bgU.uMouse.value.set(pointerS.x * .5 + .5, pointerS.y * .5 + .5);
    dustMat.uniforms.uTime.value = t;
    const front = camBase.z - ringR;
    scene.fog.near = front + .6 - dim.x * 1.2; scene.fog.far = front + 9 - dim.x * 3.5;

    const hp = selected >= 0 ? heldPosition() : null;
    for (const c of cards) {
      if (t < c.release) continue;
      const a = c.base + ringAngle, isSel = c.i === selected, isHov = c.i === hovered;
      let tx, ty, tz, trx, tryy, trz, flipT, sT;
      if (isSel) {
        tx = hp.x; ty = hp.y; tz = hp.z;
        trx = -pointerS.y * .28 + Math.sin(t * .8) * .02;
        tryy = pointerS.x * .38 + Math.atan2(camera.position.x - tx, camera.position.z - tz);
        trz = Math.sin(t * .6) * .015; flipT = 0; sT = 1;
      } else {
        const lift = isHov ? .32 : 0, r = ringR * (1 + dim.x * .1) + lift;
        const bob = reduceMotion ? 0 : Math.sin(t * .55 + c.seed) * .09;
        tx = Math.sin(a) * r;
        tz = Math.cos(a) * r - dim.x * 1.6;
        ty = .2 - Math.cos(a) * .62 + bob + (isHov ? .12 : 0) - dim.x * .25;
        trx = reduceMotion ? 0 : Math.sin(t * .4 + c.seed * 1.3) * .05;
        // every card turns to face you, fanned a little by its place on the ring, so backs stay hidden until turned
        tryy = Math.atan2(camera.position.x - tx, camera.position.z - tz) + Math.sin(a) * .32;
        trz = reduceMotion ? 0 : Math.sin(t * .5 + c.seed) * .04;
        if (isHov) { trx += -pointerS.y * .15; tryy += pointerS.x * .25; }
        flipT = c.turned ? 0 : 1; sT = isHov ? 1.05 : 1;
      }
      if (c.shake > 0) { trz += Math.sin(t * 38) * .09 * c.shake; c.shake = Math.max(0, c.shake - dt * 1.6); }
      tryy = c.ry.x + Math.atan2(Math.sin(tryy - c.ry.x), Math.cos(tryy - c.ry.x));
      if (c.snap) { c.px.x = tx; c.py.x = ty; c.pz.x = tz; c.rx.x = trx; c.ry.x = tryy; c.rz.x = trz; c.flip.x = flipT; c.snap = false; }
      const k = isSel ? 38 : 26, d = isSel ? 9.5 : 8.5;
      stepSpring(c.px, tx, k, d, dt); stepSpring(c.py, ty, k, d, dt); stepSpring(c.pz, tz, k, d, dt);
      stepSpring(c.rx, trx, 40, 9, dt); stepSpring(c.ry, tryy, 40, 9, dt); stepSpring(c.rz, trz, 60, 9, dt);
      stepSpring(c.flip, flipT, reduceMotion ? 200 : 46, reduceMotion ? 28 : 7.5, dt);
      stepSpring(c.s, sT, 120, 16, dt);
      c.group.position.set(c.px.x, c.py.x, c.pz.x);
      c.group.rotation.set(c.rx.x, c.ry.x + c.flip.x * Math.PI, c.rz.x + c.flip.v * .012);
      c.group.scale.setScalar(c.s.x);
    }

    renderer.clear();
    renderer.render(bgScene, bgCam);
    renderer.clearDepth();
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  updateTally();
  requestAnimationFrame(frame);
}
