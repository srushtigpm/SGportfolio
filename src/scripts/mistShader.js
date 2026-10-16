// The flowing morning-mist background, shared by the deck (three.js) and every room (plain WebGL).
// Writes sRGB colour directly. uDim darkens it a little while a card is held.
export const mistVertex = `
attribute vec2 aPos;
varying vec2 vUv;
void main(){ vUv = aPos * .5 + .5; gl_Position = vec4(aPos, 0., 1.); }`;

export const mistFragment = `
precision highp float;
varying vec2 vUv;
uniform float uTime, uDim, uCalm, uStars;
uniform vec2 uMouse, uRes;
uniform vec3 uBase, uLilac, uSky, uWarm, uGlow;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.-2.*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y); }
float fbm(vec2 p){ float v = 0., a = .5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++){ v += a*noise(p); p = m*p; a *= .5; } return v; }
float stars(vec2 uv){
  vec2 g = uv * vec2(uRes.x/uRes.y, 1.) * 80.;
  vec2 id = floor(g), f = fract(g) - .5;
  float h = hash(id);
  if (h < .96) return 0.;
  vec2 o = vec2(hash(id + 1.3), hash(id + 7.1)) - .5;
  float tw = .55 + .45 * sin(uTime * (.8 + h * 3.) + h * 40.);
  return smoothstep(.1, .0, length(f - o * .6)) * tw * (h - .96) / .04;
}
void main(){
  vec2 asp = vec2(uRes.x/uRes.y, 1.);
  vec2 p = (vUv - .5) * asp * 1.5;
  vec2 m = (uMouse - .5) * asp * 1.5;
  p += (p - m) * .06 * exp(-2.5*length(p - m));
  float t = uTime * .03;
  vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(p + 3.*q + vec2(1.7, 9.2) + t*1.4), fbm(p + 3.*q + vec2(8.3, 2.8) - t*1.1));
  float f = fbm(p + 2.6*r);
  float k = 1. - uCalm * .55;
  vec3 col = mix(uBase, uLilac, smoothstep(.35, .85, f) * .75 * k);
  col = mix(col, uSky, smoothstep(.45, 1.0, length(q)) * .5 * k);
  col = mix(col, uWarm, smoothstep(.55, .95, r.x) * .55 * k);
  col += uGlow * .14 * smoothstep(1.1, 0., length(vUv - vec2(.5, 1.08)));
  col += uStars * vec3(1., .97, .9) * stars(vUv) * (1. - smoothstep(.5, .85, f) * .7);
  col += mix(vec3(1., .93, .82), uGlow, .5) * .09 * exp(-3.2*length(p - m));
  col = mix(col, col * vec3(.84, .83, .89), uDim);
  col *= 1. - .16 * pow(length(vUv - .5) * 1.3, 2.);
  col += (hash(vUv * uRes + fract(uTime)) - .5) * .018;
  gl_FragColor = vec4(col, 1.);
}`;
