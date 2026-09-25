// core.js: constants, timing helpers, the Canvas 2D watercolour painter, camera, lettering, layers and paper.
//
// This is a CPU-friendly re-implementation of the P(doom) painting API (paint / inkLine / camBegin / letter / kf ...),
// drawn with plain Canvas 2D so a frame renders in well under a second without a GPU. The same files run in the
// browser (studio.html) and in Node (render.mjs, via @napi-rs/canvas); the host provides ENV and calls initCore().
//
// Everything is a pure function of the song time t: frames render in parallel and out of order.
const W = 1920, H = 1080;
const BPM = 100, BEAT = 60 / BPM, OFF = 0.156, BOIL = 10, DUR = 290;
const TAU = Math.PI * 2;
const PAL = {
  paper: '#F3EBDC', ink: '#2B2233', cream: '#FFF6E6', night: '#1B2147', indigo: '#2E3A78', navy: '#232B5C',
  lamp: '#F2B95C', ochre: '#E8AA38', peach: '#F6B38E', rose: '#E27A92', pink: '#F29BB8', pinkLt: '#F9CEDC',
  sakura: '#FBDDE6', mint: '#9ED8C4', sage: '#8DB59A', teal: '#3A9C98', sky: '#8EC3E6', skyLt: '#CFE6F2',
  violet: '#7B6AB0', lilac: '#B7A6DA', coral: '#EE8A6D', gray: '#8C8FA3', grayLt: '#C9CAD3', steel: '#5E6784',
  wood: '#B98A5E', woodDk: '#7F5A3C', screen: '#7FE0D2'
};

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, x) => a + (b - a) * x;
const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const easeIn = x => Math.pow(clamp(x), 3);
const easeInOut = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const backOut = x => { x = clamp(x); const s = 1.9; return 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); };
const elasticOut = x => { x = clamp(x); return x === 0 || x === 1 ? x : Math.pow(2, -10 * x) * Math.sin((x * 10 - .75) * (TAU / 3)) + 1; };
const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const frac = x => x - Math.floor(x);
const bpOf = t => (t - OFF) / BEAT;
const beatN = t => Math.floor(bpOf(t));
const beatT = n => OFF + n * BEAT;                                   // time of beat n
const pulse = (t, k = 6) => Math.exp(-frac(bpOf(t)) * k);             // 1 on each beat, decays
const pulse2 = (t, k = 6) => Math.exp(-frac(bpOf(t) * 2) * k);        // same on eighth notes
const seg = (t, a, b) => clamp((t - a) / (b - a));
const wob = (t, f = 1, ph = 0) => Math.sin((t * f + ph) * TAU);
const smooth01 = (t, a, b, c, d) => seg(t, a, b) * (1 - seg(t, c, d)); // fade in over [a,b], out over [c,d]
// keyframes: kf(t, [[t0, v0], [t1, v1], ...], easeFn). Values may be numbers or arrays of numbers.
function kf(t, keys, e = ease) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t < keys[i][0]) {
      const [a, va] = keys[i - 1], [b, vb] = keys[i], k = e((t - a) / (b - a));
      return Array.isArray(va) ? va.map((v, j) => lerp(v, vb[j], k)) : lerp(va, vb, k);
    }
  }
  return keys[keys.length - 1][1];
}
function mixCol(a, b, k) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16), c = i => Math.round(lerp((pa >> i) & 255, (pb >> i) & 255, clamp(k)));
  return '#' + ((1 << 24) + (c(16) << 16) + (c(8) << 8) + c(0)).toString(16).slice(1);
}
const shakeXY = (t, amt) => { const f = Math.floor(t * 24); return [(hash(f * 1.7) - .5) * 2 * amt, (hash(f * 2.3 + 9) - .5) * 2 * amt]; };

// ---------- seeded randomness: jit() "boils" the linework BOIL times a second, like hand-drawn animation ----------
let _rs = 1;
function rseed(s) { _rs = (Math.imul(s | 0, 2654435761) ^ 0x9E3779B9) | 0; for (let i = 0; i < 3; i++) rnd(); }
function rnd() { _rs = _rs + 0x6D2B79F5 | 0; let x = Math.imul(_rs ^ _rs >>> 15, 1 | _rs); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; }
const jit = a => (rnd() * 2 - 1) * a;

// ---------- canvas state ----------
let ENV = globalThis.ENV || null;                                    // { canvas(w, h), Path2D }
let X = null;                                                        // the context everything paints into
let T = 0, PAPER = null, GRAIN = null, GRAN = null, MAIN = null;
let ALPHA = 1;                                                       // global opacity multiplier (see fadeIn)
let SKETCH = 0;                                                      // 0 = painted, 1 = graphite pencil sketch (see sketch())
const FONTS = { kai: '"LXGW WenKai"', cute: '"ZCOOL KuaiLe"', brush: '"Ma Shan Zheng"', hand: '"Long Cang"' };

// ---------- camera ----------
// camBegin(cx, cy, zoom, rot): world point (cx, cy) lands at screen centre. One level only: always pair with camEnd().
let CAM = null;
function camBegin(cx = W / 2, cy = H / 2, zoom = 1, rot = 0) { X.save(); X.translate(W / 2, H / 2); X.rotate(rot); X.scale(zoom, zoom); X.translate(-cx, -cy); CAM = { cx, cy, zoom, rot }; }
function camEnd() { X.restore(); CAM = null; }
function toScreen(x, y) {
  if (!CAM) return [x, y];
  const c = Math.cos(CAM.rot), s = Math.sin(CAM.rot), dx = (x - CAM.cx) * CAM.zoom, dy = (y - CAM.cy) * CAM.zoom;
  return [W / 2 + dx * c - dy * s, H / 2 + dx * s + dy * c];
}
// p5-style transform helpers so character code reads like the original project
const push = () => X.save(), pop = () => X.restore();
const translate = (x, y) => X.translate(x, y), rotate = a => X.rotate(a), scale = (a, b = a) => X.scale(a, b);

// ---------- geometry ----------
function rectPts(x, y, w, h, j = 0) {
  return [[x + jit(j), y + jit(j)], [x + w / 2 + jit(j), y + jit(j) * .5], [x + w + jit(j), y + jit(j)],
          [x + w + jit(j) * .5, y + h / 2], [x + w + jit(j), y + h + jit(j)], [x + w / 2 + jit(j), y + h + jit(j) * .5],
          [x + jit(j), y + h + jit(j)], [x + jit(j) * .5, y + h / 2]];
}
function ellPts(cx, cy, rx, ry, n = 28, j = 0, rot = 0) {
  const p = []; for (let i = 0; i < n; i++) { const a = rot + i / n * TAU; p.push([cx + Math.cos(a) * rx + jit(j), cy + Math.sin(a) * ry + jit(j)]); } return p;
}
function rrPts(x, y, w, h, r, j = 0) {
  r = Math.min(r, w / 2, h / 2);
  const p = [], sg = 5, corner = (cx, cy, a0) => { for (let i = 0; i <= sg; i++) { const a = a0 + i / sg * Math.PI / 2; p.push([cx + Math.cos(a) * r + jit(j), cy + Math.sin(a) * r + jit(j)]); } };
  corner(x + w - r, y + r, -Math.PI / 2); corner(x + w - r, y + h - r, 0); corner(x + r, y + h - r, Math.PI / 2); corner(x + r, y + r, Math.PI);
  return p;
}
function starPts(cx, cy, r, inner = .42, n = 5, rot = -Math.PI / 2) {
  const p = []; for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, q = i % 2 ? r * inner : r; p.push([cx + Math.cos(a) * q, cy + Math.sin(a) * q]); } return p;
}
function heartPts(cx, cy, r, n = 26) {
  const p = []; for (let i = 0; i < n; i++) { const a = i / n * TAU; p.push([cx + 16 * Math.pow(Math.sin(a), 3) * r / 16, cy - (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * r / 16]); } return p;
}
// a soft, lumpy cloud outline
function cloudPts(cx, cy, w, h, seed = 0, n = 7) {
  const p = [];
  for (let i = 0; i < n; i++) {
    const a0 = Math.PI + i / n * Math.PI, a1 = Math.PI + (i + 1) / n * Math.PI, r = .55 + .45 * hash(seed + i);
    for (let k = 0; k <= 4; k++) { const a = lerp(a0, a1, k / 4), bump = Math.sin(k / 4 * Math.PI) * r * .35; p.push([cx + Math.cos(a) * w / 2 * (1 + bump * .3), cy + Math.sin(a) * h * (1 + bump)]); }
  }
  p.push([cx + w / 2, cy + h * .12], [cx, cy + h * .2], [cx - w / 2, cy + h * .12]);
  return p;
}
const bbox = pts => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of pts) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }; };

// Catmull-Rom smoothing: returns a dense polyline through pts (tension ~ curv).
function smoothPts(pts, curv = .5, closed = true, per = 8) {
  const n = pts.length; if (n < 3 || curv <= 0) return pts;
  const out = [], P = i => closed ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)], k = curv / 3 * 1.5;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k], c2 = [p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k];
    const len = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]), m = Math.max(2, Math.min(per * 3, Math.ceil(len / 7)));
    for (let s = 0; s < m; s++) {
      const u = s / m, v = 1 - u;
      out.push([v * v * v * p1[0] + 3 * v * v * u * c1[0] + 3 * v * u * u * c2[0] + u * u * u * p2[0], v * v * v * p1[1] + 3 * v * v * u * c1[1] + 3 * v * u * u * c2[1] + u * u * u * p2[1]]);
    }
  }
  if (!closed) out.push(pts[n - 1]);
  return out;
}
function pathOf(pts, closed = true) {
  const p = new ENV.Path2D(); if (!pts.length) return p;
  p.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]);
  if (closed) p.closePath(); return p;
}
// resample a polyline to roughly even spacing (for tapered ink strokes)
function resample(pts, closed, step) {
  const src = closed ? [...pts, pts[0]] : pts, out = [src[0]]; let carry = 0;
  for (let i = 1; i < src.length; i++) {
    const [ax, ay] = src[i - 1], [bx, by] = src[i], d = Math.hypot(bx - ax, by - ay); if (d < 1e-6) continue;
    let s = step - carry;
    while (s <= d) { out.push([ax + (bx - ax) * s / d, ay + (by - ay) * s / d]); s += step; }
    carry = d - (s - step);
  }
  const last = src[src.length - 1], pl = out[out.length - 1];
  if (Math.hypot(last[0] - pl[0], last[1] - pl[1]) > step * .3) out.push(last);
  return out;
}

// ---------- the painter ----------
// paint(pts, o): one painted shape.
//   wash, washOp       flat colour (opacity 0-255). Characters and anything that must read solidly.
//   fill, fillOp       watercolour: layered, slightly deformed washes with a darker pigment rim and granulation.
//   bleed, tex, border how far the layers wander (0-.4), granulation (0-1), rim darkness (0-1).
//   grad: [c0, c1, angle]  linear gradient wash instead of a flat one (washOp applies).
//   ink, sw, br        outline colour, weight (~.4-2.5), brush ('ink', 'fine', 'pencil', 'dry'). ink: null = no outline.
//   curv               smooth the outline through the points (0-1).
function paint(pts, o = {}) {
  if (!pts || pts.length < 2) return;
  if (SKETCH > .001) o = sketchify(o);
  const poly = o.curv ? smoothPts(pts, o.curv, true) : pts;
  if (o.wash || o.grad) {
    const path = pathOf(poly);
    X.globalAlpha = (o.washOp ?? 255) / 255 * ALPHA;
    if (o.grad) {
      const b = bbox(poly), a = o.grad[2] ?? Math.PI / 2, cx = b.x + b.w / 2, cy = b.y + b.h / 2, r = (Math.abs(Math.cos(a)) * b.w + Math.abs(Math.sin(a)) * b.h) / 2;
      const g = X.createLinearGradient(cx - Math.cos(a) * r, cy - Math.sin(a) * r, cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      g.addColorStop(0, o.grad[0]); g.addColorStop(1, o.grad[1]); X.fillStyle = g;
    } else X.fillStyle = o.wash;
    X.fill(path);
    if (o.tex && !o.fill) granulate(path, o.tex * .6);
  }
  if (o.fill) wcFill(poly, o);
  if (o.hatch) hatchFill(poly, o.hatch);
  if (o.ink !== null && o.ink !== false) inkStroke(poly, true, o.sw ?? 1, o.ink || PAL.ink, o.br || 'ink');
  X.globalAlpha = 1;
}
// sketch(k, fn): paint fn as a pencil drawing (k = 1) or anything between drawing and painting (0..1)
function sketch(k, fn) { const s0 = SKETCH; SKETCH = clamp(k); try { fn(); } finally { SKETCH = s0; } }
function sketchify(o) {
  const k = SKETCH, q = { ...o };
  if (q.wash) q.washOp = (q.washOp ?? 255) * (1 - k) * (1 - k);
  if (q.grad) q.washOp = (q.washOp ?? 255) * (1 - k) * (1 - k);
  if (q.fill) q.fillOp = (q.fillOp ?? 170) * (1 - k);
  if (q.ink !== null && q.ink !== false) { q.ink = mixCol(q.ink || PAL.ink, '#6B6A78', k); if (k > .5) q.br = 'pencil'; q.sw = (q.sw ?? 1) * lerp(1, 1.25, k); }
  else if (k > .6 && (o.wash || o.fill)) { q.ink = '#8A8996'; q.br = 'pencil'; q.sw = .5; }
  return q;
}
// light(x, y, r, colour, a): brightening glow (screen blend) — light falling on characters, screen glow on a face
function light(x, y, r, col, a = .4, mode = 'screen') { X.save(); X.globalCompositeOperation = mode; glow(x, y, r, col, a); X.restore(); }
function granulate(path, k) {
  if (k <= .01 || !GRAN) return;
  X.save(); X.globalCompositeOperation = 'multiply'; X.globalAlpha = clamp(k) * ALPHA; X.fillStyle = GRAN; X.fill(path); X.restore();
}
// low-frequency deformation of a polygon: the soft, wandering edge of a watercolour wash
function deform(poly, d, s1, s2) {
  const n = poly.length, out = new Array(n);
  for (let i = 0; i < n; i++) {
    const u = i / n * TAU;
    out[i] = [poly[i][0] + d * (Math.sin(u * 3 + s1) * .7 + Math.sin(u * 7 + s2) * .3), poly[i][1] + d * (Math.cos(u * 4 + s2) * .7 + Math.sin(u * 5 + s1) * .3)];
  }
  return out;
}
function wcFill(poly, o) {
  const col = o.fill, op = (o.fillOp ?? 170) / 255 * ALPHA, bleed = o.bleed ?? .1, tex = o.tex ?? .4, border = o.border ?? .35;
  const b = bbox(poly), size = Math.max(1, Math.min(b.w, b.h)), d = Math.min(26, 1.5 + bleed * size * .22);
  const dense = poly.length < 24 ? smoothPts(poly, .05, true) : poly;
  // stable per-shape phases (so big washes don't crawl), plus a gentle boil
  const s0 = hash(Math.round(b.x * .37 + b.y * .71 + b.w * .13)) * TAU, bo = rnd() * .5;
  X.fillStyle = col;
  X.globalAlpha = op * .52; X.fill(pathOf(deform(dense, d * .35, s0, s0 * 1.7 + bo)));
  X.globalAlpha = op * .3; X.fill(pathOf(deform(dense, d, s0 + 2.1 + bo, s0 * .6)));
  X.globalAlpha = op * .26; X.fill(pathOf(deform(dense, d * .8, s0 + 4.2, s0 * 2.3 + bo)));
  const path = pathOf(dense);
  if (border > .02) { X.globalAlpha = op * border * .55; X.strokeStyle = col; X.lineWidth = 1.6 + Math.min(4, size * .012); X.lineJoin = 'round'; X.stroke(path); }
  if (tex > .02) { X.globalAlpha = 1; granulate(path, tex * op * .55); }
  X.globalAlpha = 1;
}
function hatchFill(poly, h) {
  const b = bbox(poly), d = h.d || 16, a = h.a || .8, c = Math.cos(a), s = Math.sin(a), R = Math.hypot(b.w, b.h) / 2 + d;
  const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  X.save(); X.clip(pathOf(poly));
  for (let k = -R; k <= R; k += d) {
    const x0 = cx + c * -R - s * k, y0 = cy + s * -R + c * k, x1 = cx + c * R - s * k, y1 = cy + s * R + c * k;
    inkStroke([[x0 + jit(2), y0 + jit(2)], [x1 + jit(2), y1 + jit(2)]], false, h.w || .5, h.c || PAL.ink, h.b || 'pencil', h.op ?? .5);
  }
  X.restore();
}
// Tapered, boiling ink stroke along a polyline. Closed outlines become one continuous stroke that overlaps itself a
// little where it starts, the way a hand-inked outline does.
const BRUSH = {
  ink:    { w: 2.7, taper: .9, wob: .55, op: .93, var: .22 },
  fine:   { w: 1.5, taper: .7, wob: .35, op: .9, var: .15 },
  pencil: { w: 1.25, taper: .5, wob: .5, op: .55, var: .3, grain: true },
  dry:    { w: 5.5, taper: .8, wob: 1.2, op: .5, var: .45, grain: true },
  marker: { w: 4.2, taper: .25, wob: .3, op: .85, var: .08 }
};
function inkStroke(poly, closed, sw, col, br = 'ink', opMul = 1) {
  if (!poly || poly.length < 2) return;
  const B = BRUSH[br] || BRUSH.ink, base = sw * B.w;
  if (base < .15) return;
  let pts = poly;
  if (closed) {                                                      // open it up with an overlap
    const n = poly.length, st = Math.floor(rnd() * n), ov = Math.max(1, Math.round(n * .06));
    pts = []; for (let i = 0; i <= n + ov; i++) pts.push(poly[(st + i) % n]);
  }
  const step = clamp(base * 1.4, 2.2, 7), R = resample(pts, false, step), n = R.length; if (n < 2) return;
  const ph1 = rnd() * TAU, ph2 = rnd() * TAU, amp = B.wob * Math.min(2.2, .45 + sw * .5);
  // centreline with boil wobble, normals and the pressure profile
  const C = [], N = [], Wd = [];
  for (let i = 0; i < n; i++) {
    const p = R[i], a = R[Math.max(0, i - 1)], c = R[Math.min(n - 1, i + 1)];
    let tx = c[0] - a[0], ty = c[1] - a[1]; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
    const nx = -ty, ny = tx, s = i * step, u = i / (n - 1);
    const off = amp * (Math.sin(s * .045 + ph1) + .5 * Math.sin(s * .13 + ph2));
    const tap = Math.pow(Math.sin(Math.PI * clamp(u * (1 - .08) + .04)), B.taper * .9);
    Wd.push(base * Math.max(.18, tap) * (1 - B.var + B.var * (.5 + .5 * Math.sin(s * .021 + ph2 * 2))));
    C.push([p[0] + nx * off, p[1] + ny * off]); N.push([nx, ny]);
  }
  X.fillStyle = col;
  const ribbon = (sh, wm, gaps) => {                                 // one filled ribbon (optionally broken into dashes)
    let path = null;
    const flush = (i0, i1) => {
      if (i1 - i0 < 1) return;
      if (!path) path = new ENV.Path2D();
      path.moveTo(C[i0][0] + N[i0][0] * (sh + Wd[i0] * wm / 2), C[i0][1] + N[i0][1] * (sh + Wd[i0] * wm / 2));
      for (let i = i0 + 1; i <= i1; i++) path.lineTo(C[i][0] + N[i][0] * (sh + Wd[i] * wm / 2), C[i][1] + N[i][1] * (sh + Wd[i] * wm / 2));
      for (let i = i1; i >= i0; i--) path.lineTo(C[i][0] + N[i][0] * (sh - Wd[i] * wm / 2), C[i][1] + N[i][1] * (sh - Wd[i] * wm / 2));
      path.closePath();
    };
    if (!gaps) flush(0, n - 1);
    else { let i0 = 0; const g = rnd() * 50; for (let i = 1; i < n; i++) { const cut = Math.sin(i * .9 + g) + Math.sin(i * .37 + g * 2) > 1.35; if (cut) { flush(i0, i - 1); i0 = i + 1; } } flush(Math.min(i0, n - 1), n - 1); }
    if (path) X.fill(path);
  };
  if (!B.grain) { X.globalAlpha = B.op * opMul * ALPHA; ribbon(0, 1, false); }
  else {                                                             // pencil / dry brush: a few thin broken strands
    const k = br === 'dry' ? 4 : 2;
    X.globalAlpha = B.op * opMul * ALPHA * (br === 'dry' ? .8 : 1);
    for (let j = 0; j < k; j++) ribbon((j - (k - 1) / 2) * base / k * 1.1 + jit(base * .15), 1.25 / k * (br === 'dry' ? 1 : 1.3), true);
  }
  X.globalAlpha = 1;
}
// inkLine(pts, sw, colour, brush, curvature): a stroke along a path (open).
function inkLine(pts, sw = 1, col = PAL.ink, br = 'ink', curv = .5, op = 1) {
  if (!pts || pts.length < 2) return;
  if (SKETCH > .001) { col = mixCol(col, '#6B6A78', SKETCH); if (SKETCH > .5 && br !== 'dry') br = 'pencil'; }
  inkStroke(curv > 0 && pts.length > 2 ? smoothPts(pts, curv, false) : pts, false, sw, col, br, op);
}
// soft light: radial gradient pool (lamps, bokeh, screen glow). a = peak opacity 0..1
function glow(x, y, r, col, a = .5, inner = 0) {
  a *= 1 - SKETCH * .85;
  if (r <= 1 || a <= .005) return;
  const g = X.createRadialGradient(x, y, r * inner, x, y, r), c = hexA(col, a * ALPHA);
  g.addColorStop(0, c); g.addColorStop(.45, hexA(col, a * .55 * ALPHA)); g.addColorStop(1, hexA(col, 0));
  X.fillStyle = g; X.globalAlpha = 1; X.fillRect(x - r, y - r, r * 2, r * 2);
}
// bokeh disc: soft body with a brighter rim, like out-of-focus city lights
function bokeh(x, y, r, col, a = .6) {
  if (r <= .5 || a <= .005) return;
  const g = X.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, hexA(col, a * .55 * ALPHA)); g.addColorStop(.78, hexA(col, a * .7 * ALPHA)); g.addColorStop(.92, hexA(col, a * ALPHA)); g.addColorStop(1, hexA(col, 0));
  X.fillStyle = g; X.globalAlpha = 1; X.beginPath(); X.arc(x, y, r, 0, TAU); X.fill();
}
function hexA(col, a) { const p = parseInt(col.slice(1), 16); return `rgba(${p >> 16 & 255},${p >> 8 & 255},${p & 255},${clamp(a).toFixed(3)})`; }
// plain filled circle / disc (cheap, for dots, confetti, rain)
function dot(x, y, r, col, a = 1) { if (SKETCH > .001) col = mixCol(col, '#6B6A78', SKETCH); X.globalAlpha = a * ALPHA; X.fillStyle = col; X.beginPath(); X.arc(x, y, Math.max(.3, r), 0, TAU); X.fill(); X.globalAlpha = 1; }
function fillRectA(x, y, w, h, col, a = 1) { X.globalAlpha = a * ALPHA; X.fillStyle = col; X.fillRect(x, y, w, h); X.globalAlpha = 1; }

// ---------- lettering ----------
// letter(txt, x, y, size, colour, { font: 'cute'|'kai'|'brush'|'hand', pop, rot, alpha, ink:false, stroke, align, shadow })
// Drawn immediately in the current transform (so it goes through the camera like any painted shape).
function letter(txt, x, y, size, color, o = {}) {
  const k = o.pop != null ? backOut(o.pop) : 1; if (k <= .01 || size < 1) return;
  X.save(); X.translate(x, y); X.rotate(o.rot || 0); X.scale(k, k); X.globalAlpha = (o.alpha ?? 1) * ALPHA;
  X.font = `${o.weight || ''} ${size}px ${FONTS[o.font || 'cute'] || o.font}, "WenQuanYi Zen Hei", sans-serif`;
  X.textAlign = o.align || 'center'; X.textBaseline = 'middle';
  if (o.stroke) { X.lineJoin = 'round'; X.lineWidth = size * (o.strokeW || .14); X.strokeStyle = o.stroke; X.strokeText(txt, 0, 0); }
  if (o.ink !== false) { X.fillStyle = o.shadow || PAL.ink; X.fillText(txt, size * .04, size * .05); }
  X.fillStyle = color; X.fillText(txt, 0, 0);
  X.restore();
}
function sfx(txt, x, y, size, color, age, o = {}) {
  const life = o.life ?? 1.2; if (age < 0 || age > life) return;
  letter(txt, x, y, size, color, { pop: age * 5, rot: (o.rot ?? -.08) + Math.sin(age * 20) * .03 * (1 - age / life), alpha: 1 - seg(age, life - .25, life), ...o });
}
function textWidth(txt, size, font = 'kai') { X.save(); X.font = `${size}px ${FONTS[font] || font}`; const w = X.measureText(txt).width; X.restore(); return w; }

// ---------- layers, clipping and fades ----------
// layer(fn): paint fn() into an offscreen full-frame canvas and return it (camera and alpha state are isolated).
const LAYERS = [];
function layer(fn, clear = true) {
  const depth = LAYERS.length; if (!LAYERS[depth]) LAYERS[depth] = ENV.canvas(W, H);
  const cv = LAYERS[depth], cx = cv.getContext('2d'), keep = [X, CAM, ALPHA];
  cx.setTransform(1, 0, 0, 1, 0, 0); cx.globalAlpha = 1; cx.globalCompositeOperation = 'source-over';
  if (clear) cx.clearRect(0, 0, W, H);
  LAYERS.push(null); X = cx; CAM = null; ALPHA = 1;
  try { fn(); } finally { [X, CAM, ALPHA] = keep; LAYERS.pop(); }
  return cv;
}
// draw a layer (or any canvas) in screen space with opacity a and optional clip polygon (screen space)
function stamp(cv, a = 1, clipPts = null, op = 'source-over') {
  X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = a; X.globalCompositeOperation = op;
  if (clipPts) X.clip(pathOf(clipPts));
  X.drawImage(cv, 0, 0); X.restore();
}
// paint a scene with its own paper under it (for dissolves between fully painted shots)
function scene(fn) { return layer(() => { X.drawImage(PAPER, 0, 0); fn(); }); }
// Cross-dissolve: draws scene A, then B over it at k (0..1). Both are full-frame painters.
function dissolve(k, drawA, drawB) {
  if (k <= .001) return drawA(); if (k >= .999) return drawB();
  drawA(); stamp(scene(drawB), ease(k));
}
// fadeIn(k, fn): paint fn with every shape's opacity scaled by k (cheap; no layer)
function fadeIn(k, fn) { const a = ALPHA; ALPHA *= clamp(k); try { if (ALPHA > .003) fn(); } finally { ALPHA = a; } }
function clipTo(pts, fn) { X.save(); X.clip(pathOf(pts)); try { fn(); } finally { X.restore(); } }

// ---------- full-frame effects (screen space) ----------
function flash(k, col = '#FFFBF2') { if (k > .005) { X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = clamp(k); X.fillStyle = col; X.fillRect(0, 0, W, H); X.restore(); } }
// paint everything OUTSIDE a shape (irises, keyholes, heart-shaped reveals)
function irisShape(pts, col = PAL.ink) {
  X.save(); X.setTransform(1, 0, 0, 1, 0, 0);
  const p = new ENV.Path2D(); p.rect(-10, -10, W + 20, H + 20); p.moveTo(pts[0][0], pts[0][1]);
  for (let i = pts.length - 1; i >= 0; i--) p.lineTo(pts[i][0], pts[i][1]);
  p.closePath(); X.fillStyle = col; X.fill(p, 'evenodd'); X.restore();
}
function iris(cx, cy, r, col = PAL.ink) { if (r < 3) flash(1, col); else irisShape(ellPts(cx, cy, r, r, 48), col); }
// grade(k, mode, colour): full-frame colour grade. 'saturation' with grey desaturates (k = amount), 'color' tints,
// 'multiply' darkens, 'screen' lifts, 'soft-light' adds contrast. Call it after painting the frame (screen space).
function grade(k, mode = 'saturation', col = '#808080') {
  if (k <= .005) return;
  X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.globalCompositeOperation = mode; X.globalAlpha = clamp(k); X.fillStyle = col; X.fillRect(0, 0, W, H); X.restore();
}
function vignette(k = .5, col = PAL.night) {
  X.save(); X.setTransform(1, 0, 0, 1, 0, 0);
  const g = X.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * 1.0);
  g.addColorStop(0, hexA(col, 0)); g.addColorStop(1, hexA(col, clamp(k))); X.fillStyle = g; X.fillRect(0, 0, W, H); X.restore();
}
// a watercolour bloom that covers the frame from (cx, cy): p 0..1 covers, then use it reversed to reveal
function bloomCover(p, cx, cy, col, seed = 1) {
  if (p <= .001) return;
  const R = Math.hypot(W, H) * 1.05 * easeInOut(p), pts = [];
  for (let i = 0; i < 40; i++) { const a = i / 40 * TAU, r = R * (1 + .16 * Math.sin(a * 3 + seed) + .08 * Math.sin(a * 7 + seed * 2)); pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  X.save(); X.setTransform(1, 0, 0, 1, 0, 0); paint(pts, { wash: col, fill: col, fillOp: 200, bleed: .02, tex: .3, ink: null }); X.restore();
}

// ---------- paper, grain and pigment textures ----------
function lcg(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
function makePaper() {
  const g = ENV.canvas(W, H), c = g.getContext('2d'), r = lcg(11);
  c.fillStyle = PAL.paper; c.fillRect(0, 0, W, H);
  for (let i = 0; i < 70; i++) { const x = r() * W, y = r() * H, rr = 120 + r() * 380, gr = c.createRadialGradient(x, y, 0, x, y, rr), a = .045 * r(); gr.addColorStop(0, `rgba(160,125,80,${a})`); gr.addColorStop(1, 'rgba(160,125,80,0)'); c.fillStyle = gr; c.fillRect(x - rr, y - rr, 2 * rr, 2 * rr); }
  c.lineWidth = 1;
  for (let i = 0; i < 1400; i++) { const x = r() * W, y = r() * H, l = 6 + r() * 26, a = r() * TAU; c.strokeStyle = `rgba(110,88,60,${.035 + r() * .06})`; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a + .6) * l * .5, y + Math.sin(a + .6) * l * .5, x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke(); }
  return g;
}
function makeGrain() {
  const cv = ENV.canvas(W, H), c = cv.getContext('2d'), r = lcg(5), id = c.createImageData(W, H), d = id.data;
  for (let i = 0; i < d.length; i += 4) { const v = 255 - (r() < .55 ? r() * r() * 30 : 0); d[i] = v; d[i + 1] = v - 1; d[i + 2] = v - 3; d[i + 3] = 255; }
  c.putImageData(id, 0, 0);
  const g = c.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, H * 1.05); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(120,95,70,.3)');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  return cv;
}
// granulation tile: blotchy grey pigment settling, multiplied into washes
function makeGranTile() {
  const S = 384, cv = ENV.canvas(S, S), c = cv.getContext('2d'), r = lcg(23);
  c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, S, S);
  for (let i = 0; i < 900; i++) {
    const x = r() * S, y = r() * S, rr = 2 + r() * r() * 26, a = .05 + r() * .12;
    for (const [ox, oy] of [[0, 0], [S, 0], [-S, 0], [0, S], [0, -S]]) {
      const g = c.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, rr); g.addColorStop(0, `rgba(95,80,70,${a})`); g.addColorStop(1, 'rgba(95,80,70,0)');
      c.fillStyle = g; c.fillRect(x + ox - rr, y + oy - rr, rr * 2, rr * 2);
    }
  }
  const id = c.getImageData(0, 0, S, S), d = id.data;
  for (let i = 0; i < d.length; i += 4) { const n = r() < .35 ? r() * 40 : 0; d[i] -= n; d[i + 1] -= n; d[i + 2] -= n * 1.1; }
  c.putImageData(id, 0, 0);
  return X.createPattern(cv, 'repeat');
}

// initCore(ctx): called once by the host with the main 2D context.
function initCore(ctx) {
  X = ctx; MAIN = ctx;
  PAPER = makePaper(); GRAIN = makeGrain(); GRAN = makeGranTile();
}
// renderFrame(t): paints one complete frame into the main context.
function renderFrame(t) {
  X = MAIN; CAM = null; ALPHA = 1; T = t;
  X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1; X.globalCompositeOperation = 'source-over';
  X.drawImage(PAPER, 0, 0);
  rseed(1000 + Math.floor(t * BOIL));
  drawWorld(t);                                                      // timeline.js
  X = MAIN; CAM = null; ALPHA = 1;
  X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1;
  X.globalCompositeOperation = 'multiply'; X.drawImage(GRAIN, 0, 0); X.globalCompositeOperation = 'source-over';
  drawOverlay(t);                                                    // karaoke etc. (timeline.js), crisp on top
}
