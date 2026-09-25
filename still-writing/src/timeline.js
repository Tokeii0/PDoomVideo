// timeline.js: chapter registry, watercolour wipes between chapters, and the karaoke band.
//
// Each chapter file calls chapter(name, start, end, shots) where shots = [[t0, fn], ...] in time order.
// A shot function is called as fn(t, lt, dur): t = song time, lt = t - t0, dur = shot length. It paints the whole frame
// (backgrounds included) and must be a pure function of t: frames render in parallel and out of order.

const CH = [];
function chapter(name, start, end, shots) { CH.push({ name, start, end, shots }); CH.sort((a, b) => a.start - b.start); }

// Transitions across any cut (between shots or chapters), run by the timeline: [time, type, duration, options].
//   'dissolve'  cross-dissolve       'page'  a paper page turns over (o.dir 1 = right-to-left, -1 = left-to-right)
//   'wash'      wet brush strokes cover then lift (o.c1, o.c2 colours)
//   'bloom'     a watercolour blot swells from (o.x, o.y) to cover, then shrinks to reveal (o.col)
//   'dark' / 'white'  dip through a colour (o.col overrides)
// Chapters register their own with transition(time, type, duration, options) at file load.
const TRANS = [];
function transition(b, type, dur = .8, o = {}) { TRANS.push([b, type, dur, o]); }

// Standalone loops (not part of the video): window.LOOP = fn(t) replaces the whole frame, with no karaoke or wipes.
const LOOPS = {};

// which shot is on screen at t: { ch, i, fn, t0, end }
function shotAt(t) {
  const ch = CH.find(c => t >= c.start && t < c.end); if (!ch) return null;
  let i = 0; while (i + 1 < ch.shots.length && t >= ch.shots[i + 1][0]) i++;
  const t0 = ch.shots[i][0], end = i + 1 < ch.shots.length ? ch.shots[i + 1][0] : ch.end;
  return { ch, i, fn: ch.shots[i][1], t0, end };
}
// paint the shot that is on screen at time ts, evaluated at time t (transitions run a shot a little past its ends)
function paintShotFixed(ts, t) {
  const s = shotAt(ts);
  if (s) { s.fn(t, t - s.t0, s.end - s.t0); if (CAM) camEnd(); } else placeholder(t);
  X.setTransform(1, 0, 0, 1, 0, 0); ALPHA = 1; SKETCH = 0;
}
function paintShotAt(t) { paintShotFixed(t, t); }

function drawWorld(t) {
  if (globalThis.LOOP) { globalThis.LOOP(t); return; }
  const tr = TRANS.find(([b, , d]) => t >= b - d / 2 && t < b + d / 2);
  if (!tr) paintShotAt(t);
  else {
    const [b, type, d, o] = tr, p = (t - (b - d / 2)) / d;
    const A = () => paintShotFixed(b - 1e-3, t), B = () => paintShotFixed(b + 1e-3, t);
    if (type === 'dissolve') dissolve(p, A, B);
    else if (type === 'page') pageTurn(p, A, B, o);
    else if (type === 'wash') { (p < .5 ? A : B)(); washWipe(p, o.c1 || PAL.pink, o.c2 || PAL.lilac, b); }
    else if (type === 'bloom') { (p < .5 ? A : B)(); bloomCover(1 - Math.abs(p - .5) * 2, o.x ?? W / 2, o.y ?? H / 2, o.col || PAL.cream, b); }
    else { (p < .5 ? A : B)(); flash(Math.pow(1 - Math.abs(p - .5) * 2, .7), o.col || (type === 'white' ? '#FFFBF2' : '#0E1230')); }
  }
  X.setTransform(1, 0, 0, 1, 0, 0); ALPHA = 1; CAM = null; SKETCH = 0;
  karaokeBand(t);
}

// A page turns over: B lies underneath, A is the page being turned; the fold sweeps across and the page's back shows.
function pageTurn(p, drawA, drawB, o = {}) {
  if (p <= .001) return drawA(); if (p >= .999) return drawB();
  const dir = o.dir ?? 1, e = easeInOut(p), tilt = 380;
  drawB();
  const fx = lerp(W + 160, -tilt - 300, e);                                    // fold x at the top edge (right-to-left)
  const mx = x => dir > 0 ? x : W - x;                                          // mirror for left-to-right
  const P0 = [fx, -20], P1 = [fx + tilt, H + 20];
  const keep = [[-40, -20], P0, P1, [-40, H + 20]].map(([x, y]) => [mx(x), y]);
  // reflect the turned-over region across the fold to get the flap
  const refl = ([x, y]) => { const dx = P1[0] - P0[0], dy = P1[1] - P0[1], L = dx * dx + dy * dy, k = ((x - P0[0]) * dx + (y - P0[1]) * dy) / L, px = P0[0] + k * dx, py = P0[1] + k * dy; return [2 * px - x, 2 * py - y]; };
  const flap = [P0, refl([W + 40, -20]), refl([W + 40, H + 20]), P1].map(([x, y]) => [mx(x), y]);
  // shadow cast on B next to the fold
  X.save(); X.setTransform(1, 0, 0, 1, 0, 0);
  paint([[mx(fx), -20], [mx(fx + tilt), H + 20], [mx(fx + tilt + 120), H + 20], [mx(fx + 120), -20]], { fill: PAL.ink, fillOp: 70, bleed: .2, tex: .2, border: 0, ink: null });
  X.restore();
  stamp(scene(drawA), 1, keep);
  X.save(); X.setTransform(1, 0, 0, 1, 0, 0);
  paint(flap, { wash: '#F7EFE2', ink: PAL.ink, sw: 1.2 });
  paint(flap, { fill: '#C9B8A6', fillOp: 90, bleed: .15, tex: .5, border: .6, ink: null });
  X.restore();
}
function drawOverlay(t) { if (!globalThis.LOOP) karaokeText(t); }

function placeholder(t) {
  paint(rectPts(-40, -40, W + 80, H + 80), { wash: PAL.skyLt, washOp: 120, ink: null });
  letter('（这一段还没画）', 960, 470, 64, PAL.ink, { font: 'kai', ink: false });
  letter(t.toFixed(2) + 's', 960, 560, 40, PAL.steel, { font: 'kai', ink: false });
}

// ---------- watercolour wipe ----------
// Wet brush strokes sweep across (p 0 → .5 covers), the scene swaps under full cover, then they lift off (.5 → 1).
function washWipe(p, c1, c2, seed = 0) {
  const n = 5, bh = (H + 420) / n + 60;
  X.save(); X.translate(W / 2, H / 2); X.rotate(-.08); X.translate(-W / 2, -H / 2);
  for (let i = 0; i < n; i++) {
    const y0 = -230 + i * (H + 420) / n, d = [0, .12, .05, .16, .08][i];
    const q = p < .5 ? easeOut(clamp((p * 2 - d) / (1 - d))) : easeInOut(clamp(((p - .5) * 2 - d) / (1 - d)));
    const x0 = p < .5 ? -320 : lerp(-320, W + 420, q), x1 = p < .5 ? lerp(-320, W + 420, q) : W + 420;
    if (x1 - x0 < 30) continue;
    const pts = [], rag = (k, s) => s * (40 + 50 * hash(i * 31 + k + seed)) + jit(10);
    for (let k = 0; k <= 8; k++) pts.push([lerp(x0, x1, k / 8), y0 + Math.sin(k * .9 + i) * 16 + jit(4)]);
    for (let k = 1; k < 9; k++) pts.push([x1 + rag(k, 1) - 40, y0 + bh * k / 9]);
    for (let k = 8; k >= 0; k--) pts.push([lerp(x0, x1, k / 8), y0 + bh + Math.sin(k * .8 + i * 2) * 16 + jit(4)]);
    if (p >= .5) for (let k = 8; k > 0; k--) pts.push([x0 - rag(k + 20, 1) + 40, y0 + bh * k / 9]);
    paint(pts, { wash: i % 2 ? c1 : c2, fill: i % 2 ? c2 : c1, fillOp: 90, bleed: .04, tex: .7, border: .5, ink: null });
  }
  X.restore();
}

// ---------- karaoke ----------
// The band is painted under the paper grain; the words go on top, filling character by character on the aligned times.
let KARAOKE = null;
const KFONT = 54, KY = 1018;
function lyricAt(t) { return LY.find(l => t >= l[0] - .3 && t < l[1] + .25); }
function karaokeBand(t) {
  KARAOKE = null;
  const L = lyricAt(t); if (!L) return;
  const [a, b, txt] = L, grow = easeOut((t - (a - .3)) / .22) * (1 - ease((t - (b + .05)) / .2));
  if (grow < .02) return;
  const tw = textWidth(txt, KFONT, 'kai'), w = (tw + 120) * grow, x0 = 960 - w / 2, y0 = KY - 44;
  const pts = [[x0 + jit(6), y0 + jit(3)], [x0 + w / 2, y0 - 5 + jit(3)], [x0 + w + jit(6), y0 + jit(3)], [x0 + w + 16 + jit(6), y0 + 44], [x0 + w + jit(6), y0 + 88 + jit(3)], [x0 + w / 2, y0 + 93 + jit(3)], [x0 + jit(6), y0 + 88 + jit(3)], [x0 - 16 + jit(6), y0 + 44]];
  paint(pts, { wash: PAL.night, washOp: 200, fill: PAL.violet, fillOp: 70, tex: .6, border: .3, ink: null, curv: .25 });
  KARAOKE = { L, grow };
}
function karaokeText(t) {
  if (!KARAOKE || KARAOKE.grow < .85) return;
  const [a, b, txt, , ct] = KARAOKE.L;
  X.save(); X.setTransform(1, 0, 0, 1, 0, 0);
  X.font = `${KFONT}px ${FONTS.kai}, "WenQuanYi Zen Hei", sans-serif`; X.textBaseline = 'middle'; X.textAlign = 'left';
  const chars = [...txt], ws = chars.map(c => c === ' ' ? KFONT * .55 : X.measureText(c).width), total = ws.reduce((p, q) => p + q, 0);
  let x = 960 - total / 2, k = 0;
  const alpha = clamp((KARAOKE.grow - .85) / .15);
  X.globalAlpha = alpha;
  chars.forEach((c, i) => {
    if (c === ' ') { x += ws[i]; return; }
    const c0 = ct[k], c1 = k + 1 < ct.length ? Math.min(ct[k + 1], c0 + .6) : Math.min(b, c0 + .5), f = clamp((t - c0) / Math.max(.08, c1 - c0));
    X.fillStyle = PAL.cream; X.fillText(c, x, KY);
    if (f > 0) {
      X.save(); X.beginPath(); X.rect(x - 1, KY - 40, ws[i] * f + 1, 80); X.clip();
      X.fillStyle = '#FFC98F'; X.fillText(c, x, KY); X.restore();
    }
    x += ws[i]; k++;
  });
  X.restore();
}
