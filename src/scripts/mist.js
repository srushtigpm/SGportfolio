// Plain-WebGL mist for the rooms: no three.js needed, so section pages stay light.
import { mistVertex, mistFragment } from './mistShader.js';

export function startMist(canvas, { calm = 0 } = {}) {
  const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false });
  if (!gl) return;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, mistVertex));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, mistFragment));
  gl.linkProgram(prog); gl.useProgram(prog);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'aPos'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const u = (n) => gl.getUniformLocation(prog, n);
  const uTime = u('uTime'), uMouse = u('uMouse'), uRes = u('uRes');
  gl.uniform1f(u('uDim'), 0); gl.uniform1f(u('uCalm'), calm);

  const scale = Math.min(devicePixelRatio || 1, 1.5) * .6; // the mist is soft, so render it below full resolution
  const resize = () => { canvas.width = Math.round(canvas.clientWidth * scale); canvas.height = Math.round(canvas.clientHeight * scale); gl.viewport(0, 0, canvas.width, canvas.height); gl.uniform2f(uRes, canvas.width, canvas.height); };
  resize(); addEventListener('resize', resize);
  const mouse = [.5, .5], smooth = [.5, .5];
  addEventListener('pointermove', (e) => { mouse[0] = e.clientX / innerWidth; mouse[1] = 1 - e.clientY / innerHeight; }, { passive: true });

  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const t0 = performance.now() - 40000 * Math.random();
  const draw = (now) => {
    smooth[0] += (mouse[0] - smooth[0]) * .05; smooth[1] += (mouse[1] - smooth[1]) * .05;
    gl.uniform1f(uTime, (now - t0) / 1000); gl.uniform2f(uMouse, smooth[0], smooth[1]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!still && !document.hidden) requestAnimationFrame(draw);
  };
  document.addEventListener('visibilitychange', () => { if (!document.hidden && !still) requestAnimationFrame(draw); });
  requestAnimationFrame(draw);
}
