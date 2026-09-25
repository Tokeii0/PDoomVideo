// c01_home: 1 · 回家 (0–28.956). The cover-art title (a rainy night window over a desk: an open sketchbook with a pencil
// star, a glass of water with a pencil in it, the peach soda can, a desk lamp), then the white midnight corridor, the badge
// coming off as the office peels away into the night, a cold can of peach soda, and the walk home with a new little idea.
(() => {
  const B = n => beatT(n);                               // B(9) 5.556 · B(14) 8.556 · B(16) 9.756 · B(24) 14.556 · B(32) 19.356 · B(40) 24.156
  const SC = '#808080';

  // ---------- small shared helpers ----------
  // screen position of a hero's hand for a given pose (mirrors the chibi builder's transform)
  function handXY(x, y, s, o, side) {
    const a = side < 0 ? (o.aL ?? -1.2) : (o.aR ?? -1.2), L = 1.87 * s;
    let hx = side * .95 * s + side * Math.cos(a) * L, hy = -3.95 * s - Math.sin(a) * L;
    const sq = (o.sq || 0) + (o.take || 0), kx = (o.flip ? -1 : 1) * (o.sx ?? 1) * (1 + sq * .5), ky = (o.sy ?? 1) * (1 - sq);
    hx *= kx; hy *= ky;
    const r = o.rot || 0, c = Math.cos(r), sn = Math.sin(r);
    return [x + hx * c - hy * sn, y + (o.dy || 0) * s + (o.bob || 0) * s + hx * sn + hy * c];
  }
  // head centre in world space (for placing things by the face)
  function headXY(x, y, s, o) {
    const sq = (o.sq || 0) + (o.take || 0), ky = (o.sy ?? 1) * (1 - sq), r = o.rot || 0;
    const hy = -6.7 * s * ky;
    return [x - hy * Math.sin(r), y + (o.dy || 0) * s + hy * Math.cos(r)];
  }
  // polygon clipped to the half-plane n·p >= c (Sutherland–Hodgman, one edge)
  function clipHalf(poly, nx, ny, c) {
    const out = [], f = p => p[0] * nx + p[1] * ny - c;
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length], fa = f(a), fb = f(b);
      if (fa >= 0) out.push(a);
      if ((fa >= 0) !== (fb >= 0)) { const k = fa / (fa - fb); out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]); }
    }
    return out;
  }
  // run fn with the canvas clipped to everything OUTSIDE pts (screen space)
  function outside(pts, fn) {
    X.save(); X.setTransform(1, 0, 0, 1, 0, 0);
    const p = new ENV.Path2D(); p.rect(-10, -10, W + 20, H + 20); p.moveTo(pts[0][0], pts[0][1]);
    for (let i = pts.length - 1; i >= 0; i--) p.lineTo(pts[i][0], pts[i][1]);
    p.closePath(); X.clip(p, 'evenodd');
    try { fn(); } finally { X.restore(); }
  }
  const blob = (cx, cy, r, seed, n = 40) => {
    const p = []; for (let i = 0; i < n; i++) { const a = i / n * TAU, rr = r * (1 + .1 * Math.sin(a * 3 + seed) + .05 * Math.sin(a * 7 + seed * 2.3)); p.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } return p;
  };
  // a canvas-tote on her shoulder, body-local (use in the hero's draw hook)
  function tote(s, sw, side = -1, swing = 0) {
    push(); translate(side * 1.55 * s, -2.05 * s); rotate(swing);
    inkLine([[side * -.55 * s, -2.3 * s], [side * -.2 * s, -1.2 * s], [0, -.2 * s]], sw * 1.3, '#D9C7A6', 'marker', .3);
    paint([[-.85 * s, -.2 * s], [.85 * s, -.2 * s], [1.0 * s, 1.55 * s], [-1.0 * s, 1.55 * s]], { wash: '#EFE3CB', fill: '#CDB892', fillOp: 70, tex: .5, ink: PAL.ink, sw: sw * .7, curv: .15 });
    paint(ellPts(.1 * s, .75 * s, .32 * s, .32 * s, 10), { wash: '#F29BB8', ink: PAL.ink, sw: sw * .4 });
    pop();
  }

  // =====================================================================================================
  // 0 · INTRO (0–9.756): the cover. A rainy night window, the desk under it. Near-monochrome blue-grey; the title is
  // written on the misted glass; the lamp clicks on and colour seeps out from under it; the doodle star blinks; the title
  // runs like rain; the camera flies through the glass to an office tower where one floor is still lit.
  // Layout shared with chapter 10: window x 360–1560, y 90–700 · desk from y 720 · sketchbook x 420–980, y 780–1000 ·
  // glass with a pencil at x 1330 (base y 900) · soda can (1600, 880) · desk lamp at the left edge.
  const WIN = { x: 360, y: 90, w: 1200, h: 610 }, OPEN = { x: 386, y: 116, w: 1148, h: 558 };
  const TW = { x0: 1098, x1: 1204, top: 246, lit: 432, litH: 17 }, P = [1151, 440];
  const LAMP_ON = 5.5, SEEP0 = 5.56, SEEP1 = 7.5, MELT0 = 7.8, MELT1 = 8.85, FLY0 = B(14);
  const TITLE = [['还', B(2) + .1], ['没', B(3)], ['写', B(4)], ['完', B(5)]], TY = 282, TSZ = 170;
  const tcx = i => 960 + (i - 1.5) * 176;

  function introCam(t) {
    const slow = easeInOut(seg(t, 0, FLY0));
    let cx = lerp(960, 985, slow), cy = lerp(540, 522, slow);
    const toP = easeInOut(seg(t, FLY0 - .05, 9.05));
    cx = lerp(cx, P[0], toP); cy = lerp(cy, P[1], toP);
    const z0 = 1 + .09 * slow;
    const zg = t < FLY0 ? z0 : z0 * Math.pow(18 / z0, Math.pow(seg(t, FLY0, 9.4), 2.2));
    // the view outside zooms with the glass until the opening covers the frame, then glides on to the lit floor
    const SW = 2.5, u = seg(t, FLY0, 9.4), uSw = Math.pow(Math.log(SW / z0) / Math.log(18 / z0), 1 / 2.2);
    let ze = zg;
    if (u > uSw) { const tsw = FLY0 + uSw * (9.4 - FLY0), q = seg(t, tsw, 9.78); ze = SW * Math.pow(24 / SW, Math.pow(q, 1.5)); }
    const m = 1 - 1 / zg;                                // how far the camera has travelled toward the glass (glass at 1)
    return { cx, cy, zg, ze, m };
  }
  const zAt = (cam, D) => cam.m >= D * .985 ? 0 : 1 / (1 - cam.m / D);
  // desk surface point: world x, depth v (0 = against the wall at y 720, 1 = the front edge at y 1100) → screen
  const deskD = v => lerp(1, .58, v);
  function deskPt(cam, x, v) { const z = zAt(cam, deskD(v)) || 60, y = lerp(720, 1100, v); return [960 + (x - cam.cx) * z, 540 + (y - cam.cy) * z]; }
  const flat = (cam, x, y) => deskPt(cam, x, (y - 720) / 380);

  // --- outside: the night city (windowView), the office tower, big soft bokeh ---
  function outsideView(t, cam, lampK) {
    const top = '#1E2552', bot = '#3B2F6B';
    paint(rectPts(-900, -800, 3800, 872), { wash: top, ink: null });
    paint(rectPts(-900, 70, 3800, 650), { grad: [top, bot, Math.PI / 2], ink: null });
    paint(rectPts(-900, 716, 3800, 900), { wash: '#2A2F5E', ink: null });
    windowView(WIN.x, WIN.y, WIN.w, WIN.h, t, { night: 1, rain: 0, dawn: 0 });
    const fk = seg(t, FLY0 + .3, 9.45); if (fk > 0) fillRectA(-900, -800, 3800, 2400, '#1B2147', .5 * fk);
    // the office tower: dark, one floor still lit
    const { x0, x1, top: ty, lit, litH } = TW, tw = x1 - x0;
    paint([[x0, 720], [x0, ty], [x0 + tw * .5, ty - 10], [x1, ty], [x1, 720]], { wash: '#1D2250', fill: '#141840', fillOp: 90, bleed: .03, tex: .4, border: .3, ink: null });
    paint(rectPts(x1 - 16, ty, 16, 720 - ty), { wash: '#252B5E', washOp: 200, ink: null });
    inkLine([[x0 + tw * .5, ty - 10], [x0 + tw * .5, ty - 46]], .8, '#3A4278', 'fine', 0);
    dot(x0 + tw * .5, ty - 48, 2.6, '#FF7A8A', .5 + .5 * Math.sin(t * 2.4));
    glow(x0 + tw * .5, ty - 48, 16, '#FF7A8A', .35 * (.5 + .5 * Math.sin(t * 2.4)));
    for (let r = 0; r < 16; r++) {                                         // unlit window rows
      const y = ty + 18 + r * 28; if (y > 700) break; if (Math.abs(y - lit) < 12) continue;
      for (let c = 0; c < 5; c++) fillRectA(x0 + 9 + c * (tw - 18) / 5, y, (tw - 18) / 5 - 5, 11, '#2E3570', .9);
    }
    // the lit floor: a strip of cold white office light, with the ceiling tubes and a tiny walking figure
    const flick = 1 - .25 * Math.max(0, Math.sin(t * 31)) * (Math.sin(t * 3.1) > .93 ? 1 : 0);
    const fly = seg(t, FLY0, 9.5);
    glow(P[0], lit + litH / 2, 150 + 60 * fly, '#DDF7EE', (.32 + .3 * fly) * flick);
    fillRectA(x0 + 4, lit, tw - 8, litH, '#EAFBF4', .95 * flick);
    fillRectA(x0 + 4, lit, tw - 8, 2.2, '#FFFFFF', .9);
    for (let c = 0; c <= 6; c++) fillRectA(x0 + 4 + c * (tw - 8) / 6 - .8, lit, 1.6, litH, '#3A4278', .75);
    fillRectA(x0 + 4, lit + litH - 3, tw - 8, 3, '#B9D8CF', .8);
    const fx = x0 + 18 + ((t * 7) % (tw - 30)), fb = Math.abs(Math.sin(t * 9)) * .5;   // her silhouette, walking the corridor
    paint(ellPts(fx, lit + 6.4 - fb, 2.4, 2.3, 10), { wash: '#34305A', ink: null });
    paint(rrPts(fx - 1.7, lit + 8.2 - fb, 3.4, 4.6, 1.2), { wash: '#34305A', ink: null });
    fillRectA(fx - 1.2, lit + 12.6 - fb, 2.4, 2.2, '#34305A', 1);
    // city lights melting into bokeh (the cover photo's blur), in front of everything outside
    const pal = ['#FFC77A', '#FF9FB0', '#8FE3D8', '#FFE7A8', '#F6B38E'];
    for (let i = 0; i < 17; i++) {
      const bx = 330 + hash(i * 3.7 + 1) * 1260 + Math.sin(t * .18 + i) * 12, by = 470 + hash(i * 5.3 + 2) * 250 + Math.cos(t * .15 + i * 2) * 6;
      bokeh(bx, by, 26 + hash(i * 1.9) * 58, pal[i % pal.length], (.22 + .16 * Math.sin(t * .7 + i * 1.3)) * (1 - .55 * fly));
    }
    rainStreaks(t, { x: 330, y: 60, w: 1260, h: 680 }, 34, '#B9C7E8', .28, { fall: true });
    // the lamp, reflected in the glass
    if (lampK > .01) { glow(470, 410, 150, PAL.lamp, .35 * lampK); bokeh(478, 404, 26, '#FFE3A0', .5 * lampK); }
  }

  // --- raindrops on the outside of the glass: fixed beads and drops that trickle down in fits and starts ---
  function glassRain(t, a = 1) {
    const { x, y, w, h } = OPEN;
    for (let i = 0; i < 120; i++) {
      const bx = x + hash(i * 7.31) * w, by = y + hash(i * 3.17) * h, r = 1.2 + hash(i * 1.7) * hash(i * 2.9) * 5;
      dot(bx, by + r * .3, r, '#1A1F44', .35 * a); dot(bx, by, r, '#C9D6F2', .55 * a); dot(bx - r * .35, by - r * .35, r * .35, '#FFFFFF', .7 * a);
    }
    for (let i = 0; i < 16; i++) {
      const bx = x + 30 + hash(i * 9.1 + 4) * (w - 60), v = 22 + hash(i * 4.3) * 38, f = .35 + hash(i * 2.2) * .5;
      const tt = t + hash(i) * 40, pos = v * (tt - .85 * Math.sin(TAU * f * tt) / (TAU * f));
      const yy = y - 40 + (pos % (h + 160)), r = 4 + hash(i * 6.6) * 4.5, xx = bx + Math.sin(yy * .021 + i) * 5;
      const trail = Math.min(yy - y + 20, 60 + hash(i * 8.8) * 120);
      if (trail > 6) {
        const tp = []; for (let k = 0; k <= 6; k++) { const ty = yy - trail * k / 6; tp.push([bx + Math.sin(ty * .021 + i) * 5, ty]); }
        inkLine(tp, .9, '#DCE6FA', 'fine', .4, .35 * a);
        for (let k = 1; k < 4; k++) { const ty = yy - trail * (k / 4 + hash(i * 3 + k) * .15); dot(bx + Math.sin(ty * .021 + i) * 5, ty, 1.3 + hash(i + k) * 1.4, '#DCE6FA', .5 * a); }
      }
      paint([[xx, yy - r * 1.9], [xx + r * .95, yy - r * .1], [xx + r * .6, yy + r * .75], [xx, yy + r], [xx - r * .6, yy + r * .75], [xx - r * .95, yy - r * .1]], { wash: '#AFC0E6', washOp: 150 * a, ink: '#1A1F44', sw: .35, curv: .6 });
      dot(xx - r * .3, yy - r * .25, r * .32, '#FFFFFF', .85 * a);
      dot(xx + r * .2, yy + r * .5, r * .5, '#2A2F5E', .35 * a);
    }
  }

  // --- the title, written on the misted glass (painted into a layer so it can run like rain) ---
  function titleArt(t) {
    TITLE.forEach(([ch, t0], i) => {
      const p = seg(t, t0, t0 + .5); if (p <= 0) return;
      const x = tcx(i), y = TY, bx = x - TSZ * .62, by = y - TSZ * .62, S = TSZ * 1.24, c = lerp(-.1, 2.1, easeOut(p)) * S;
      glow(x, y + 6, TSZ * .75, '#EEF2FA', .16 * p);
      const wipe = p >= 1 ? null : [[bx, by], [bx + c, by], [bx, by + c]];
      const draw = () => letter(ch, x, y, TSZ, PAL.cream, { font: 'brush', ink: false, alpha: .96 });
      if (wipe) clipTo(wipe, draw); else draw();
      for (let k = 0; k < 2; k++) {                                        // condensation drips under the strokes
        const dx = (hash(i * 5 + k * 2.3) - .5) * TSZ * .6, t1 = t0 + .45 + hash(i * 3 + k) * .8, L = Math.min(14 + hash(i + k * 7) * 46, Math.max(0, t - t1) * (7 + 5 * hash(i * 2 + k)));
        if (L <= 1) continue;
        const y0 = y + TSZ * (.28 + hash(i * 9 + k) * .12);
        inkLine([[x + dx, y0 - 6], [x + dx + .6, y0 + L * .5], [x + dx - .3, y0 + L]], 1.3, PAL.cream, 'fine', .4, .8);
        dot(x + dx - .3, y0 + L + 2, 3.2, PAL.cream, .9);
      }
    });
    const k = seg(t, B(6) - .1, B(7));
    if (k > 0) letter('tokeii', 960, TY + 125, 40, PAL.cream, { font: 'kai', ink: false, alpha: .9 * ease(k) });
  }
  function titleOnGlass(t, cam) {
    if (t < 1.45 || t > MELT1 + .05) return;
    const melt = seg(t, MELT0, MELT1);
    const cv = layer(() => { camBegin(cam.cx, cam.cy, cam.zg); titleArt(t); camEnd(); });
    if (melt <= 0) { stamp(cv, 1); return; }
    // the letters run: narrow columns slide and stretch downward at different speeds, fading as they go
    const [sx0, sy0] = [960 + (560 - cam.cx) * cam.zg, 540 + (150 - cam.cy) * cam.zg], [sx1, sy1] = [960 + (1360 - cam.cx) * cam.zg, 540 + (450 - cam.cy) * cam.zg];
    const x0 = clamp(Math.floor(sx0), 0, W), x1 = clamp(Math.ceil(sx1), 0, W), y0 = clamp(Math.floor(sy0), 0, H), y1 = clamp(Math.ceil(sy1), 0, H), hh = y1 - y0;
    if (hh < 2 || x1 - x0 < 2) return;
    X.save(); X.setTransform(1, 0, 0, 1, 0, 0);
    const sw = 6, e = Math.pow(melt, 1.5);
    for (let x = x0; x < x1; x += sw) {
      const i = x / sw, n = lerp(hash(Math.floor(i / 5)), hash(Math.floor(i / 5) + 1), ease(frac(i / 5))), n2 = hash(Math.floor(i) * 1.31);
      const d = e * (30 + 260 * n + 60 * n2) * cam.zg, st = 1 + melt * (.6 + 1.6 * n);
      X.globalAlpha = clamp(1 - ease(seg(melt, .1 + .25 * n2, .85 + .15 * n)));
      if (X.globalAlpha > .01) X.drawImage(cv, x, y0, Math.min(sw, x1 - x), hh, x, y0 + d, Math.min(sw, x1 - x), hh * st);
    }
    X.restore();
  }
  function mist(t, a) {
    const k = seg(t, .9, 1.7) * (1 - seg(t, MELT0 - .2, MELT1)) * a; if (k <= .01) return;
    for (let i = 0; i < 6; i++) glow(620 + i * 136, TY + 20 + Math.sin(i * 2.1) * 26, 190 + hash(i) * 50, '#DCE3EF', .14 * k);
    glow(960, TY + 60, 520, '#C8D2E6', .1 * k);
  }

  // --- the room: wall, window frame, desk and the things on it ---
  function wallAndFrame(t, cam, lampK, part) {
    const L = 1.2 + lampK * .5;
    if (part === 'wall') {
      const wc = '#2A3050';
      for (const r of [[-900, -900, 3800, 990], [-900, 88, 1262, 640], [1558, 88, 1400, 640]]) paint(rectPts(...r), { wash: wc, fill: '#353C66', fillOp: 90, bleed: .04, tex: .6, border: 0, ink: null });
      glow(960, 400, 980, '#6E7FC0', .22);
      if (lampK > .01) { glow(300, 560, 760, PAL.lamp, .36 * lampK); glow(360, 700, 420, '#FFD9A0', .25 * lampK); }
      return;
    }
    // frame: four bevelled bars
    const o = WIN, i = OPEN, fc = '#D8CBB8', fd = '#A8998A';
    const bars = [[[o.x, o.y], [o.x + o.w, o.y], [i.x + i.w, i.y], [i.x, i.y]], [[o.x + o.w, o.y], [o.x + o.w, o.y + o.h], [i.x + i.w, i.y + i.h], [i.x + i.w, i.y]],
      [[o.x, o.y + o.h], [i.x, i.y + i.h], [i.x + i.w, i.y + i.h], [o.x + o.w, o.y + o.h]], [[o.x, o.y], [i.x, i.y], [i.x, i.y + i.h], [o.x, o.y + o.h]]];
    bars.forEach((b, k) => paint(b, { wash: k === 0 || k === 3 ? fd : fc, fill: fd, fillOp: 60, tex: .5, ink: PAL.ink, sw: .9 * L }));
    paint(rectPts(i.x, i.y, i.w, i.h), { ink: PAL.ink, sw: .8 });
    inkLine([[o.x + 6, o.y + 5], [o.x + o.w - 6, o.y + 5]], .6, '#F4EBDD', 'fine', 0, .7);
    // sill
    paint([[o.x - 22, o.y + o.h - 2], [o.x + o.w + 22, o.y + o.h - 2], [o.x + o.w + 30, 724], [o.x - 30, 724]], { wash: '#E6DACA', fill: '#B9AA98', fillOp: 70, tex: .4, ink: PAL.ink, sw: 1 });
    paint(rectPts(o.x - 30, 724, o.w + 60, 8), { wash: '#1B1F3A', washOp: 110, ink: null });
    // latch
    paint(rrPts(o.x + o.w - 10, 380, 14, 44, 5), { wash: '#C9B7A0', ink: PAL.ink, sw: .7 });
  }

  function deskSurface(t, cam, lampK) {
    const vm = clamp((1 - cam.m * 1.15) / .42, 0, 1); if (vm < .02) return;       // the part of the desk still in front of the camera
    const q = [deskPt(cam, -900, 0), deskPt(cam, 2800, 0), deskPt(cam, 960 + 1840 * lerp(1, 1.45, vm), vm), deskPt(cam, 960 - 1860 * lerp(1, 1.45, vm), vm)];
    paint(q, { wash: mixCol('#5E4C48', '#8A6A50', lampK), fill: '#6E5240', fillOp: 90, bleed: .03, tex: .7, border: .2, ink: null });
    for (let k = -8; k <= 9; k++) {                                        // plank seams, converging toward the window
      const u = 960 + k * 150, a = deskPt(cam, u, 0), b = deskPt(cam, 960 + (u - 960) * lerp(1, 1.45, vm), vm);
      inkLine([a, b], .7, '#4A3528', 'fine', 0, .6);
    }
    for (let k = 0; k < 14; k++) {                                         // grain
      const u0 = 960 + (hash(k * 3.3) - .5) * 2200, pts = [];
      for (let j = 0; j <= 6; j++) { const v = (.06 + j / 6 * .9) * vm, u = 960 + (u0 - 960) * lerp(1, 1.45, v) + Math.sin(j * 1.3 + k) * 8; pts.push(deskPt(cam, u, v)); }
      inkLine(pts, .45, '#5A4232', 'fine', .5, .45);
    }
    const e = deskPt(cam, 0, 0);
    paint([[-50, e[1] - 2], [W + 50, e[1] - 2], [W + 50, e[1] + 16 * (zAt(cam, 1) || 1)], [-50, e[1] + 16 * (zAt(cam, 1) || 1)]], { wash: '#1A1530', washOp: 90, ink: null });
    // window light lying on the desk
    const wl = [deskPt(cam, 330, .02), deskPt(cam, 1590, .02), deskPt(cam, 1800, .5 * vm), deskPt(cam, 150, .5 * vm)];
    paint(wl, { fill: '#8FA2D8', fillOp: 55 * (1 - lampK * .5), bleed: .25, tex: .2, border: 0, ink: null });
  }

  function openBook(t, cam, lampK) {
    const zf = zAt(cam, .66); if (!zf || zf > 5) return;
    const F = (x, y) => flat(cam, x, y);
    if (F(700, 784)[1] > H + 20 || F(980, 790)[0] < -20) return;
    const cover = [[430, 786], [700, 780], [972, 784], [994, 1008], [700, 1016], [406, 1010]].map(p => F(...p));
    paint(cover.map(([x, y]) => [x + 10, y + 12]), { wash: '#1A1530', washOp: 90, ink: null });
    paint(cover, { wash: '#6F86B8', ink: PAL.ink, sw: 1 });
    const pageL = [[442, 792], [560, 787], [694, 786], [698, 1004], [560, 1004], [420, 1002]], pageR = [[706, 786], [840, 787], [960, 790], [980, 998], [840, 1004], [702, 1004]];
    const pgc = mixCol('#AEB3C8', '#F6F0E4', .35 + .65 * lampK);
    for (const pg of [pageL, pageR]) paint(pg.map(p => F(...p)), { wash: pgc, fill: '#D9CFBF', fillOp: 55, bleed: .05, tex: .3, border: .2, ink: PAL.ink, sw: .8, curv: .15 });
    paint([[684, 786], [716, 786], [718, 1004], [682, 1004]].map(p => F(...p)), { fill: '#8A7A6A', fillOp: 60, bleed: .2, tex: .2, border: 0, ink: null });
    for (let k = 0; k < 9; k++) { const [x, y] = F(700, 796 + k * 24); paint(ellPts(x, y, 8, 3.5, 8), { ink: '#4A4A5A', sw: .5 }); }
    // left page: loose pencil circles and scribbles
    const pl = (pts, w = .8) => inkLine(pts.map(p => F(...p)), w, '#6B6A78', 'pencil', .5, .9);
    for (const [cx, cy, r] of [[520, 850, 36], [600, 872, 24], [560, 930, 20]]) { const c = []; for (let k = 0; k <= 18; k++) { const a = k / 18 * TAU * 1.08; c.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r * .55]); } pl(c, .7); }
    for (let k = 0; k < 4; k++) pl([[470, 960 + k * 9], [520 + hash(k) * 40, 958 + k * 9], [560 + hash(k + 3) * 90, 961 + k * 9]], .5);
    // right page: the little star doodle (the idea, before it has a name)
    const dc = [840, 884], zb = zAt(cam, .8) || 1, blinkK = seg(t, 6.42, 6.49) * (1 - seg(t, 6.58, 6.66));
    const wig = Math.sin(seg(t, 6.72, 7.32) * Math.PI * 4) * .1 * (1 - seg(t, 6.9, 7.32)), hop = Math.sin(seg(t, 6.72, 6.98) * Math.PI) * 5;
    const sp = smoothPts(starPts(0, 0, 70, .58, 5, -Math.PI / 2 + wig), .22, true).map(([x, y]) => F(dc[0] + x, dc[1] - hop + y * .6));
    const star = [...sp, sp[0], sp[1]];
    if (lampK > .01) { const [x, y] = F(dc[0], dc[1]); glow(x, y, 80 * zb, '#FFF1C2', .35 * lampK * (.6 + .4 * seg(t, 6.45, 6.9))); }
    inkLine(star, 1.5, '#4A4955', 'pencil', .25, 1);
    inkLine(star.map(([x, y]) => [x + 1.5, y + .8]), .7, '#8A8996', 'pencil', .25, .7);
    for (const sd of [-1, 1]) {
      const ex = dc[0] + sd * 18, ey = dc[1] - 1 - hop;
      if (blinkK > .5) pl([[ex - 6, ey + 1], [ex, ey + 3], [ex + 6, ey + 1]], .9);
      else { const [x, y] = F(ex, ey); paint(ellPts(x, y, 4 * zb, 5.2 * zb * (1 - blinkK * .8), 8), { wash: '#45444F', ink: null }); dot(x - 1.2 * zb, y - 1.6 * zb, 1.3 * zb, '#FFFFFF', .9); }
    }
    pl([[dc[0] - 9, dc[1] + 7 - hop], [dc[0] - 4, dc[1] + 11 - hop], [dc[0] + 4, dc[1] + 11 - hop], [dc[0] + 9, dc[1] + 7 - hop]], 1.2);
    pl([[dc[0], dc[1] - 40 - hop], [dc[0] + 9, dc[1] - 54 - hop], [dc[0] + 1, dc[1] - 63 - hop]], .9);
    for (const sd of [-1, 1]) { const [bx, by] = F(dc[0] + sd * 27, dc[1] + 5 - hop); paint(ellPts(bx, by, 7 * zb, 3.2 * zb, 10), { fill: '#F29BB8', fillOp: 110 * (.35 + .65 * lampK), bleed: .2, ink: null }); for (const k of [-3.5, 0, 3.5]) pl([[dc[0] + sd * 27 + k - 1.5, dc[1] + 3 - hop], [dc[0] + sd * 27 + k + 1.5, dc[1] + 7 - hop]], .5); }
    const tw = seg(t, 6.5, 7.25);
    if (tw > 0 && tw < 1) { const [x, y] = F(dc[0] + 70, dc[1] - 46); sparkle(x, y, 20 * zb, '#FFF3C0', tw); const [x2, y2] = F(dc[0] - 72, dc[1] - 26); sparkle(x2, y2, 12 * zb, '#FFF3C0', seg(t, 6.62, 7.3)); }
    if (lampK > .01) { const [x, y] = F(700, 900); light(x, y, 360, '#FFE3B0', .18 * lampK); }
  }

  // a slim pencil (tip at (x, y), body going up), about the right size next to a glass
  function slimPencil(x, y, len, w, rot, col) {
    push(); translate(x, y); rotate(rot);
    const tip = w * 2.3, top = -len + w * 1.7;
    paint([[-w / 2, -tip], [w / 2, -tip], [w / 2, top], [-w / 2, top]], { wash: col, fill: mixCol(col, PAL.ink, .25), fillOp: 45, tex: .3, ink: PAL.ink, sw: .55 });
    inkLine([[w * .12, -tip - 2], [w * .12, top + 2]], .5, mixCol(col, PAL.ink, .35), 'fine', 0, .55);
    inkLine([[-w * .28, -tip - 4], [-w * .28, top + 4]], 1.2, '#FFF3C8', 'marker', 0, .5);
    paint(rectPts(-w / 2 - .6, top - .2, w + 1.2, w * .95), { wash: '#C9CED6', ink: PAL.ink, sw: .45 });
    paint(rrPts(-w / 2, -len, w, w * .9 + 1, w * .35), { wash: PAL.pink, ink: PAL.ink, sw: .45 });
    paint([[-w / 2, -tip], [w / 2, -tip], [0, 0]], { wash: '#F3D6B0', ink: PAL.ink, sw: .5 });
    paint([[-w * .2, -tip * .32], [w * .2, -tip * .32], [0, 0]], { wash: '#4A4458', ink: null });
    pop();
  }
  function waterGlass(t, cam, lampK) {
    const z = zAt(cam, deskD((900 - 720) / 380)); if (!z || z > 5) return;
    if (540 + (560 - cam.cy) * z > H + 20 || 960 + (1260 - cam.cx) * z > W + 20) return;
    camBegin(cam.cx, cam.cy, z);
    const gx = 1330, gy = 900, top = 712, wl = 792, rt = 60, rb = 50;
    paint(ellPts(gx + 26, gy + 4, 78, 13, 18), { fill: PAL.ink, fillOp: 70, bleed: .3, tex: .2, border: 0, ink: null });
    if (lampK > .01) { push(); translate(gx + 78, gy + 2); scale(1, .28); glow(0, 0, 70, '#FFE2A0', .7 * lampK); pop(); }
    const body = [[gx - rt, top], [gx + rt, top], [gx + rb, gy - 4], [gx - rb, gy - 4]];
    paint(body, { wash: '#C9D8EE', washOp: 34, ink: null });
    inkLine(ellPts(gx, top, rt, 11, 20).slice(10, 21), .6, '#5A6488', 'fine', .3, .6);                    // back rim
    // the pencil: dry above the water, bent by refraction below it
    const pc = () => slimPencil(gx - 14, gy - 14, 336, 13, .21, '#F6C85F');
    clipTo([[gx - 400, 0], [gx + 400, 0], [gx + 400, wl], [gx - 400, wl]], pc);
    clipTo([[gx - rb - 6, wl], [gx + rb + 6, wl], [gx + rb, gy - 6], [gx - rb, gy - 6]], () => { push(); translate(gx + 7, wl); scale(1.18, 1); translate(-gx, -wl); pc(); pop(); });
    const water = [[gx - rt + 5, wl], [gx + rt - 5, wl], [gx + rb, gy - 5], [gx - rb, gy - 5]];
    paint(water, { wash: '#AFC6E6', washOp: 70, fill: '#8FAAD6', fillOp: 40, bleed: .05, tex: .2, border: .3, ink: null });
    paint(ellPts(gx, wl, rt - 5, 9, 20), { wash: '#DCE8F7', washOp: 110, ink: '#6A7AA0', sw: .45 });
    // glass walls, rim and thick base
    inkLine([[gx - rt, top], [gx - rb, gy - 4]], .8, '#4E587C', 'fine', 0, .75);
    inkLine([[gx + rt, top], [gx + rb, gy - 4]], .8, '#4E587C', 'fine', 0, .75);
    paint(ellPts(gx, gy - 8, rb, 9, 18), { wash: '#E4EEF9', washOp: 90, ink: '#4E587C', sw: .6 });
    inkLine(ellPts(gx, top, rt, 11, 20).slice(0, 11), .9, '#4E587C', 'fine', .3, .8);
    inkLine([[gx - rt + 13, top + 18], [gx - rb + 10, gy - 26]], 2.6, '#FFFFFF', 'marker', 0, .55);
    inkLine([[gx + rt - 11, top + 30], [gx + rb - 9, top + 90]], 1.4, '#FFFFFF', 'marker', 0, .45);
    if (lampK > .01) glow(gx - rt + 16, wl - 20, 30, '#FFE9B8', .45 * lampK);
    camEnd();
  }

  function soda(t, cam) {
    const z = zAt(cam, deskD((880 - 720) / 380)); if (!z || z > 5) return;
    if (540 + (740 - cam.cy) * z > H + 20 || 960 + (1560 - cam.cx) * z > W + 20) return;
    camBegin(cam.cx, cam.cy, z);
    paint(ellPts(1618, 884, 52, 11, 16), { fill: PAL.ink, fillOp: 70, bleed: .3, tex: .2, border: 0, ink: null });
    sodaCan(1600, 882, 1.45, { drops: 1.3 });
    camEnd();
  }

  // the desk lamp: base at the left edge, the shade aimed at the sketchbook
  const LAMP = { bx: 170, by: 906, ex: 104, ey: 650, hx: 300, hy: 528, ang: .8 };
  function deskLampIntro(t, cam, lampK) {
    const z = zAt(cam, deskD((LAMP.by - 720) / 380)); if (!z || z > 5) return;
    if (960 + (380 - cam.cx) * z < -20 || 540 + (460 - cam.cy) * z > H + 20) return;
    camBegin(cam.cx, cam.cy, z);
    const { bx, by, ex, ey, hx, hy, ang } = LAMP, press = seg(t, LAMP_ON - .12, LAMP_ON - .04) * (1 - seg(t, LAMP_ON + .08, LAMP_ON + .2));
    const bump = t > LAMP_ON ? Math.sin(seg(t, LAMP_ON, LAMP_ON + .35) * Math.PI) * .05 : 0;
    paint(ellPts(bx + 18, by + 4, 96, 16, 18), { fill: PAL.ink, fillOp: 80, bleed: .3, tex: .2, border: 0, ink: null });
    paint(rrPts(bx - 74, by - 30, 148, 30, 14), { wash: '#E7D8C2', fill: '#B8A58E', fillOp: 70, tex: .4, ink: PAL.ink, sw: 1 });
    paint(ellPts(bx, by - 30, 74, 13, 18), { wash: '#F1E6D6', ink: PAL.ink, sw: .9 });
    paint(rrPts(bx + 30, by - 38 + press * 5, 20, 12 - press * 5, 4), { wash: '#E27A92', ink: PAL.ink, sw: .6 });
    for (const [a, b] of [[[bx, by - 30], [ex, ey]], [[ex, ey], [hx, hy]]]) { inkLine([a, b], 3.4, '#E7D8C2', 'marker', 0); inkLine([a, b], .8, PAL.ink, 'fine', 0); }
    inkLine([[bx + 10, by - 34], [ex + 14, ey + 30]], .5, PAL.ink, 'fine', 0, .6);
    paint(ellPts(ex, ey, 10, 10, 10), { wash: '#B8A58E', ink: PAL.ink, sw: .7 });
    push(); translate(hx, hy); rotate(ang - Math.PI / 2 + bump);
    paint([[-26, -58], [26, -58], [64, 18], [-64, 18]], { wash: '#F2C9A2', fill: '#D9956A', fillOp: 60, tex: .4, ink: PAL.ink, sw: 1, curv: .15 });
    paint(ellPts(0, -60, 26, 8, 12), { wash: '#E0A57C', ink: PAL.ink, sw: .7 });
    paint(ellPts(0, 18, 64, 14, 20), { wash: lampK > .3 ? '#FFF6D6' : '#7C7468', ink: PAL.ink, sw: .8 });
    if (lampK > .01) { glow(0, 22, 90, '#FFF1C8', .7 * lampK); dot(0, 16, 14, '#FFFBEA', lampK); }
    const fl = seg(t, LAMP_ON, LAMP_ON + .25);
    if (fl > 0 && fl < 1) for (let k = 0; k < 7; k++) { const a = Math.PI * (.15 + k / 6 * .7), r0 = 80 + fl * 40; inkLine([[Math.cos(a) * r0, 20 + Math.sin(a) * r0 * .7], [Math.cos(a) * (r0 + 34), 20 + Math.sin(a) * (r0 + 34) * .7]], 1.1, '#FFF1C8', 'ink', 0, 1 - fl); }
    pop();
    camEnd();
  }
  // warm light from the lamp: the cone and the pool on the desk and book
  function lampLight(t, cam, lampK) {
    if (lampK <= .01) return;
    const z = zAt(cam, deskD((LAMP.by - 720) / 380)); if (!z || z > 5) return;
    const S = (x, y) => [960 + (x - cam.cx) * z, 540 + (y - cam.cy) * z];
    const th = LAMP.ang - Math.PI / 2, c = Math.cos(th), sn = Math.sin(th), L = (px, py) => S(LAMP.hx + px * c - py * sn, LAMP.hy + px * sn + py * c);
    const A = L(58, 20), Bm = L(-58, 20), pc = flat(cam, 700, 898), zb = zAt(cam, .8) || 1;
    const cone = [A, [pc[0] + 400 * zb, pc[1] - 40 * zb], [pc[0] + 280 * zb, pc[1] + 120 * zb], [pc[0] - 340 * zb, pc[1] + 110 * zb], Bm];
    paint(cone, { fill: '#FFE3A6', fillOp: 30 * lampK, bleed: .35, tex: .1, border: 0, ink: null });
    push(); translate(pc[0], pc[1]); scale(1, .42); light(0, 0, 620 * zb, '#FFD58A', .42 * lampK); glow(0, 0, 400 * zb, '#FFE7B0', .22 * lampK); pop();
  }

  function intro(t, lt, dur) {
    const k0 = ease(seg(t, 0, .8));
    if (k0 < .999) { const cv = layer(() => introPaint(t)); stamp(cv, k0); return; }
    introPaint(t);
  }
  function introPaint(t) {
    const cam = introCam(t);
    const lampK = t < LAMP_ON ? 0 : clamp(easeOut(seg(t, LAMP_ON, LAMP_ON + .3)) * (1 - .35 * Math.max(0, Math.sin(seg(t, LAMP_ON + .05, LAMP_ON + .3) * Math.PI * 3))));
    const glassA = 1 - seg(t, 9.0, 9.3);
    // wall (window plane)
    camBegin(cam.cx, cam.cy, cam.zg); wallAndFrame(t, cam, lampK, 'wall'); camEnd();
    // the view through the opening
    const S = (x, y) => [960 + (x - cam.cx) * cam.zg, 540 + (y - cam.cy) * cam.zg];
    const [ox0, oy0] = S(OPEN.x, OPEN.y), [ox1, oy1] = S(OPEN.x + OPEN.w, OPEN.y + OPEN.h);
    X.save(); X.beginPath(); X.rect(ox0, oy0, ox1 - ox0, oy1 - oy0); X.clip();
    camBegin(cam.cx, cam.cy, cam.ze); outsideView(t, cam, lampK); camEnd();
    X.restore();
    // on the glass: rain outside, mist and writing inside
    if (glassA > .01) {
      camBegin(cam.cx, cam.cy, cam.zg);
      fadeIn(glassA, () => { clipTo(rectPts(OPEN.x, OPEN.y, OPEN.w, OPEN.h), () => glassRain(t)); mist(t, 1); });
      camEnd();
      titleOnGlass(t, cam);
      camBegin(cam.cx, cam.cy, cam.zg); wallAndFrame(t, cam, lampK, 'frame'); camEnd();
    }
    // the desk and what is on it (each at its own depth: the multiplane push)
    if (cam.m < .56) {
      deskSurface(t, cam, lampK);
      openBook(t, cam, lampK);
      waterGlass(t, cam, lampK);
      soda(t, cam);
      deskLampIntro(t, cam, lampK);
      lampLight(t, cam, lampK);
    }
    // grade: near-monochrome blue-grey, until colour seeps out from under the lamp
    const pool = flat(cam, 690, 900), R = 2700 * easeInOut(seg(t, SEEP0, SEEP1));
    if (R <= 1) { grade(.92, 'saturation', SC); grade(.22, 'color', '#6D7FA6'); }
    else if (t < SEEP1) {
      outside(blob(pool[0], pool[1], R, 1.3), () => { grade(.35, 'saturation', SC); grade(.08, 'color', '#6D7FA6'); });
      outside(blob(pool[0], pool[1], R * 1.12 + 30, 2.1), () => { grade(.35, 'saturation', SC); grade(.07, 'color', '#6D7FA6'); });
      outside(blob(pool[0], pool[1], R * 1.26 + 60, 3.7), () => { grade(.5, 'saturation', SC); grade(.08, 'color', '#6D7FA6'); });
    }
    vignette(.28 - .1 * lampK, '#10142E');
  }
  transition(B(16), 'white', .36, { col: '#F2FBF7' });

  // =====================================================================================================
  // 1 · CORRIDOR (9.756–14.556) 走廊的灯 把午夜照成白天: a long one-point-perspective office corridor, white as day under the
  // tubes, true night in the windows. She trudges toward us (office clothes, badge, tote, drooping ahoge); the camera backs
  // away ahead of her, out through the glass entrance doors. Behind her the lights go out one by one; the doors slide open.
  const CO = { vx: 960, vy: 440, f: 900, X: 2.1, Yf: 1.55, Yc: -1.85, Zend: 31 };
  const pj = (x, y, z, cz) => { const d = Math.max(.06, z - cz); return [CO.vx + CO.f * x / d, CO.vy + CO.f * y / d]; };
  const TUBES = Array.from({ length: 12 }, (_, i) => 1.25 + i * 2.55);
  const heroZ = t => 5.3 - .92 * (t - B(16));
  const camZ = t => lerp(-.42, -3.15, easeInOut(seg(t, B(16) - .2, B(24) + .1)));
  const tubeOff = i => Math.max(B(18) + (11 - i) * BEAT / 2, B(16) + (5.3 - TUBES[i]) / .92 + .35);
  const buzzTube = t => [1, 2, 0, 3][((beatN(t) % 4) + 4) % 4];     // one near tube buzzes and flickers on each beat
  function tubeState(t, i) {                              // 1 on, 0 off, with a dying flicker
    const to = tubeOff(i), a = t - to;
    if (a < -.3) { const bf = frac(bpOf(t)), hit = i === buzzTube(t) && bf < .2; return hit ? (Math.sin(bf * 95) > -.2 ? .3 : 1) : 1 - .1 * pulse(t, 10); }
    if (a < 0) return a > -.18 && Math.sin(a * 90) > 0 ? .25 : 1;
    return a < .12 && Math.sin(a * 70) > .3 ? .5 : 0;
  }
  function nightBackdrop(t) {                              // what the corridor windows show (fixed in screen space: it is far away)
    paint(rectPts(-20, -20, W + 40, H + 40), { grad: ['#141A40', '#2E3A78', Math.PI / 2], ink: null });
    starField(t, { x: 0, y: 0, w: 960, h: 420 }, 26, { seed: 4 });
    moonFace(330, 205, 62, { rot: -.35 });
    for (let i = 0; i < 9; i++) {                          // a far, sleepy skyline under the window sill
      const bx = -40 + i * 118, bh = 60 + hash(i * 3.1) * 120;
      paint(rectPts(bx, 560 - bh, 104, bh + 200), { wash: '#1B2046', washOp: 230, ink: null });
      for (let k = 0; k < 4; k++) if (hash(i * 7 + k) > .55) fillRectA(bx + 14 + (k % 2) * 44, 575 - bh + Math.floor(k / 2) * 30, 18, 10, '#FFD98A', .7);
    }
  }
  function corridorBox(t, cz) {
    const { X: cx, Yf, Yc, Zend } = CO, z0 = Math.max(0, cz + .1);
    const Q = (a, b, c, d) => [pj(...a, cz), pj(...b, cz), pj(...c, cz), pj(...d, cz)];
    paint(Q([-cx, Yc, z0], [cx, Yc, z0], [cx, Yc, Zend], [-cx, Yc, Zend]), { wash: '#D3DDDA', fill: '#BFCCC9', fillOp: 60, bleed: .05, tex: .3, border: .2, ink: null });
    paint(Q([-cx, Yf, z0], [cx, Yf, z0], [cx, Yf, Zend], [-cx, Yf, Zend]), { wash: '#D6E2DE', fill: '#B7C8C4', fillOp: 60, bleed: .05, tex: .35, border: .2, ink: null });
    paint(Q([-cx, Yc, z0], [-cx, Yc, Zend], [-cx, Yf, Zend], [-cx, Yf, z0]), { wash: '#E3ECE8', fill: '#C9D6D2', fillOp: 60, bleed: .05, tex: .3, border: .2, ink: null });
    paint(Q([cx, Yc, z0], [cx, Yc, Zend], [cx, Yf, Zend], [cx, Yf, z0]), { wash: '#F1F5F2', fill: '#D5E0DC', fillOp: 55, bleed: .05, tex: .3, border: .2, ink: null });
    // end wall with a dark door and a little green exit light
    paint(rectPts(...pj(-cx, Yc, Zend, cz), 2 * cx * CO.f / (Zend - cz), (Yf - Yc) * CO.f / (Zend - cz)), { wash: '#DDE7E3', ink: PAL.ink, sw: .5 });
    const d0 = pj(-.45, -.55, Zend, cz), d1 = pj(.45, Yf, Zend, cz);
    paint(rectPts(d0[0], d0[1], d1[0] - d0[0], d1[1] - d0[1]), { wash: '#5A6480', ink: PAL.ink, sw: .5 });
    const e0 = pj(-.3, -1.05, Zend, cz), e1 = pj(.3, -.8, Zend, cz);
    fillRectA(e0[0], e0[1], e1[0] - e0[0], e1[1] - e0[1], '#5FD38E', .9);
    // edges and grid lines
    const L = (a, b, w = .6, c = '#8FA3A6', op = .8) => inkLine([pj(...a, cz), pj(...b, cz)], w, c, 'fine', 0, op);
    for (const [y, xx] of [[Yc, -cx], [Yc, cx], [Yf, -cx], [Yf, cx]]) L([xx, y, z0], [xx, y, Zend], .9, '#7E9296');
    for (const xx of [-1.4, -.7, 0, .7, 1.4]) { L([xx, Yc, z0], [xx, Yc, Zend], .45, '#B5C4C2', .7); L([xx, Yf, z0], [xx, Yf, Zend], .45, '#A9BCB8', .55); }
    for (let z = Math.ceil(z0 / 1.275) * 1.275; z < Zend; z += 1.275) { L([-cx, Yc, z], [cx, Yc, z], .4, '#B5C4C2', .6); L([-cx, Yf, z], [cx, Yf, z], .4, '#A9BCB8', .5); }
    for (const sd of [-1, 1]) L([sd * cx, 1.42, z0], [sd * cx, 1.42, Zend], .7, '#8FA3A6', .8);
    // left wall: a long window band full of night
    const wz0 = Math.max(z0, 1.6), wz1 = 29;
    if (wz1 > wz0) {
      const band = Q([-cx, -1.25, wz0], [-cx, -1.25, wz1], [-cx, .55, wz1], [-cx, .55, wz0]);
      clipTo(band, () => nightBackdrop(t));
      inkLine([band[0], band[1]], .9, '#7E9296', 'fine', 0); inkLine([band[3], band[2]], 1.2, '#7E9296', 'fine', 0);
      for (let z = 2; z < wz1; z += 2.1) if (z > wz0) L([-cx, -1.25, z], [-cx, .55, z], 1.6, '#C9D6D2', 1);
    }
    // right wall: doors with frosted glass, a notice board, a plant, an extinguisher
    for (let k = 0; k < 6; k++) {
      const z = 3.2 + k * 4.6; if (z < z0) continue;
      paint(Q([cx, -.65, z], [cx, -.65, z + 1.05], [cx, Yf, z + 1.05], [cx, Yf, z]), { wash: '#C9D8D4', fill: '#AFC3BF', fillOp: 60, tex: .3, ink: '#6F8387', sw: .6 });
      paint(Q([cx, -.45, z + .18], [cx, -.45, z + .87], [cx, .35, z + .87], [cx, .35, z + .18]), { wash: '#EAF5F2', ink: '#8FA3A6', sw: .4 });
      const h = pj(cx, .55, z + .85, cz); dot(h[0], h[1], 40 / (z - cz + .5), '#7E8C96');
      if (k % 2 === 0) paint(Q([cx, -.6, z + 1.6], [cx, -.6, z + 2.6], [cx, .15, z + 2.6], [cx, .15, z + 1.6]), { wash: '#F6E6C8', fill: '#E0C79C', fillOp: 50, ink: '#8F7A5E', sw: .5 });
      if (k % 2 === 1) paint(Q([cx, .95, z + 1.9], [cx, .95, z + 2.05], [cx, 1.3, z + 2.05], [cx, 1.3, z + 1.9]), { wash: '#E0697A', ink: '#8A4A55', sw: .4 });
    }
    for (const z of [5.8, 17.5]) if (z > z0) {                           // potted plants by the wall
      const b = pj(cx - .35, Yf, z, cz), k = CO.f / (z - cz);
      paint([[b[0] - .22 * k, b[1]], [b[0] + .22 * k, b[1]], [b[0] + .27 * k, b[1] - .45 * k], [b[0] - .27 * k, b[1] - .45 * k]], { wash: '#E8B4A0', ink: '#8A6A5E', sw: .5 });
      for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * .42; paint(ellPts(b[0] + Math.cos(a) * .3 * k, b[1] - .5 * k + Math.sin(a) * .35 * k, .09 * k, .26 * k, 10, 0, a + Math.PI / 2), { wash: '#8DB59A', ink: '#5E7F68', sw: .4 }); }
    }
  }
  function tubes(t, cz, pass) {
    for (let i = TUBES.length - 1; i >= 0; i--) {
      const z = TUBES[i], d = z - cz; if (d < .3) continue;
      const on = tubeState(t, i), k = CO.f / d;
      if (pass === 'floor') {                              // reflections in the polished floor
        if (on < .05) continue;
        const r = pj(0, 2 * CO.Yf - CO.Yc, z, cz);
        push(); translate(r[0], r[1]); scale(1, 2.2); glow(0, 0, 1.1 * k, '#E8FFF6', .28 * on); pop();
        fillRectA(r[0] - .72 * k, r[1] - .03 * k, 1.44 * k, .06 * k, '#FFFFFF', .3 * on);
        continue;
      }
      const a = pj(-1.05, CO.Yc + .02, z, cz), b = pj(1.05, CO.Yc + .02, z, cz), c = pj(0, CO.Yc + .02, z, cz);
      paint(rrPts(a[0], c[1] - .1 * k, b[0] - a[0], .2 * k, .08 * k), { wash: '#AFBEBB', ink: '#7E9296', sw: .5 });
      paint(rrPts(a[0] + .06 * k, c[1] - .05 * k, b[0] - a[0] - .12 * k, .1 * k, .05 * k), { wash: on > .5 ? '#FBFFFD' : mixCol('#7E8A94', '#FBFFFD', on), ink: null });
      if (on > .05) { push(); translate(c[0], c[1] + .15 * k); scale(1.6, 1); glow(0, 0, 1.1 * k, '#E6FFF5', .5 * on); pop(); glow(c[0], c[1], .6 * k, '#FFFFFF', .55 * on); }
      const bf = frac(bpOf(t));
      if (i === buzzTube(t) && bf < .35 && t < tubeOff(i) - .3) for (const sd of [-1, 1]) {   // bzz: little zigzags off the ends
        const ex = sd < 0 ? a[0] - .12 * k : b[0] + .12 * k, zz = [];
        for (let q = 0; q < 5; q++) zz.push([ex + sd * q * .07 * k, c[1] - .1 * k + (q % 2 ? -.07 : .07) * k]);
        inkLine(zz, .9, '#8FA3A6', 'fine', 0, 1 - bf / .35);
      }
    }
  }
  function hangingClock(t, cz) {
    const z = 8.3, d = z - cz, k = CO.f / d, c = pj(0, -1.32, z, cz), top = pj(0, CO.Yc, z, cz);
    inkLine([top, [c[0], c[1] - .36 * k]], 1.1, '#6F8387', 'fine', 0);
    const hrs = t < B(19) ? 11 + 59 / 60 : 12, tick = seg(t, B(19), B(19) + .12);
    paint(ellPts(c[0], c[1], .4 * k, .4 * k, 24), { wash: '#DDE6E4', ink: PAL.ink, sw: .8 });
    wallClock(c[0], c[1], .34 * k, hrs);
    if (tick > 0 && tick < 1) for (let j = 0; j < 6; j++) { const a = j / 6 * TAU; inkLine([[c[0] + Math.cos(a) * .5 * k, c[1] + Math.sin(a) * .5 * k], [c[0] + Math.cos(a) * .66 * k, c[1] + Math.sin(a) * .66 * k]], .9, PAL.ink, 'fine', 0, 1 - tick); }
  }
  function corridorHero(t, cz, reflect) {
    const z = heroZ(t), d = z - cz, s = CO.f * .152 / d, g = pj(.12, CO.Yf, z, cz);
    const m = move('walk', t), md = mood(t, [[B(16) - .5, 'tired'], [11.3, 'closed', null, 'yawn'], [12.15, 'sleepy', null, 'tiny'], [12.7, 'tired', null, 'pout'], [13.75, 'look', null, 'o'], [B(23) + .15, 'normal', null, 'smile']]);
    const yawn = smooth01(t, 11.3, 11.5, 11.95, 12.15), squint = smooth01(t, 12.7, 12.85, 13.55, 13.75);
    const o = { ...m, ...md, outfit: 'office', ahoge: 'droop', blush: .35, tilt: m.tilt + yawn * -.14 + Math.sin(t * 1.7) * .03, sq: (m.sq || 0) + (md.take || 0) - yawn * .05, take: 0,
      lookY: squint ? -.9 * squint : md.eyes === 'look' ? -.2 : .15, lookX: squint * .3, brows: squint > .3 ? 'worried' : null, tears: yawn * .6, aR: m.aR, aL: m.aL,
      draw: (u, sw) => tote(u, sw, 1, Math.sin(bpOf(t) * Math.PI) * .06) };
    if (reflect) { clipTo(rectPts(g[0] - 4 * s, g[1], 8 * s, 3.1 * s), () => { push(); translate(g[0], g[1]); scale(1, -.75); translate(-g[0], -g[1]); fadeIn(.12, () => hero(g[0], g[1], s, { ...o, noShadow: true })); pop(); }); return; }
    hero(g[0], g[1], s, o);
  }
  function entrance(t, cz) {                              // the glass doors at z = 0 and the dark building front around them
    const d = -cz; if (d < .08) return;
    const k = CO.f / d, open = easeInOut(seg(t, B(21) + .1, B(21) + .6));
    const o0 = pj(-1.35, -1.1, 0, cz), o1 = pj(1.35, CO.Yf, 0, cz);
    // one wide sliding glass panel (it slides away to the left when she comes near)
    {
      const xa = -1.33 - open * 2.7, xb = xa + 2.66, a = pj(xa, -1.08, 0, cz), b = pj(xb, CO.Yf, 0, cz), near = clamp((d - .5) / 1.6);
      paint(rectPts(a[0], a[1], b[0] - a[0], b[1] - a[1]), { wash: '#BFD8E6', washOp: 10 + 18 * near, ink: '#9FB2C4', sw: .7 });
      const sx = a[0] + (b[0] - a[0]) * .2;
      paint([[sx, a[1] + 20], [sx + .3 * k, a[1] + 20], [sx - .4 * k, b[1] - 30], [sx - .7 * k, b[1] - 30]], { wash: '#FFFFFF', washOp: 22 * near, ink: null });
      paint([[sx + .5 * k, a[1] + 20], [sx + .6 * k, a[1] + 20], [sx - .1 * k, b[1] - 30], [sx - .2 * k, b[1] - 30]], { wash: '#FFFFFF', washOp: 16 * near, ink: null });
      fillRectA(a[0], lerp(a[1], b[1], .8), b[0] - a[0], .04 * k, '#E6F2F2', .22 * near);
      inkLine([[b[0] - .14 * k, lerp(a[1], b[1], .38)], [b[0] - .14 * k, lerp(a[1], b[1], .62)]], 1.6, '#8A93A8', 'marker', 0);
    }
    // the building front: everything outside the doorway
    irisShape([[o0[0], o0[1]], [o1[0], o0[1]], [o1[0], o1[1]], [o0[0], o1[1]]], '#1D2248');
    glow((o0[0] + o1[0]) / 2, (o0[1] + o1[1]) / 2, (o1[0] - o0[0]) * .9, '#DFF6EE', .16);
    for (const sd of [-1, 1]) {                            // stone panels and the door frame
      const x = sd < 0 ? o0[0] : o1[0];
      paint(rectPts(x - (sd < 0 ? .16 * k : 0), o0[1] - .12 * k, .16 * k, o1[1] - o0[1] + .12 * k), { wash: '#56607E', ink: PAL.ink, sw: .8 });
      for (let j = 1; j < 4; j++) inkLine([[x + sd * j * .9 * k, o0[1] - 1.6 * k], [x + sd * j * .9 * k, o1[1]]], .5, '#2E3560', 'fine', 0, .7);
    }
    paint(rectPts(o0[0] - .5 * k, o0[1] - .34 * k, o1[0] - o0[0] + 1 * k, .22 * k), { wash: '#3A4270', ink: PAL.ink, sw: .8 });
    fillRectA(o0[0] - .4 * k, o0[1] - .13 * k, o1[0] - o0[0] + .8 * k, .03 * k, '#DFF6EE', .5);
    for (const sd of [-1, 1]) {                            // wall lights and tall planters either side of the doors
      const lx = sd < 0 ? o0[0] - .55 * k : o1[0] + .55 * k, ly = lerp(o0[1], o1[1], .3);
      glow(lx, ly, .9 * k, '#DFF6EE', .35); paint(rrPts(lx - .07 * k, ly - .16 * k, .14 * k, .32 * k, .05 * k), { wash: '#EEFBF6', ink: PAL.ink, sw: .6 });
      const px = sd < 0 ? o0[0] - 1.05 * k : o1[0] + 1.05 * k, py = o1[1];
      paint([[px - .32 * k, py], [px + .32 * k, py], [px + .38 * k, py - .62 * k], [px - .38 * k, py - .62 * k]], { wash: '#3E4672', fill: '#2E3560', fillOp: 60, tex: .4, ink: PAL.ink, sw: .7 });
      paint(cloudPts(px, py - .62 * k, .95 * k, .8 * k, sd * 3 + 7, 7), { wash: '#2F4F5E', fill: '#243E4C', fillOp: 70, tex: .4, ink: PAL.ink, sw: .6, curv: .4 });
      glow(px + sd * -.2 * k, py - 1.0 * k, .5 * k, '#DFF6EE', .12);
    }
    // the pavement in front, lit by the doorway
    const g0 = pj(-4, CO.Yf, 0, cz), g1 = pj(4, CO.Yf, 0, cz), n0 = pj(-4, CO.Yf, cz + .25, cz), n1 = pj(4, CO.Yf, cz + .25, cz);
    paint([g0, g1, n1, n0], { wash: '#262B52', fill: '#1B2046', fillOp: 80, tex: .5, ink: null });
    const s0 = pj(-1.3, CO.Yf, 0, cz), s1 = pj(1.3, CO.Yf, 0, cz), f0 = pj(-2.2, CO.Yf, cz + .3, cz), f1 = pj(2.2, CO.Yf, cz + .3, cz);
    paint([s0, s1, f1, f0], { fill: '#DFF6EE', fillOp: 40 + 60 * open, bleed: .2, tex: .2, border: 0, ink: null });
    inkLine([g0, g1], 1, PAL.ink, 'fine', 0, .8);
  }
  function corridor(t, lt, dur) {
    const cz = camZ(t);
    corridorBox(t, cz);
    tubes(t, cz, 'floor');
    corridorHero(t, cz, true);
    tubes(t, cz, 'ceiling');
    hangingClock(t, cz);
    // the dark creeping up behind her as the lights go out
    let zd = 99; TUBES.forEach((z, i) => { if (t >= tubeOff(i) + .12) zd = Math.min(zd, z); });
    if (zd < 90) for (let j = 0; j < 26; j++) {
      const z = Math.max(zd - 2.2 + j * .38, cz + .2), a0 = pj(-CO.X, CO.Yc, z, cz), a1 = pj(CO.X, CO.Yf, z, cz);
      fillRectA(a0[0], a0[1], a1[0] - a0[0], a1[1] - a0[1], '#1E2452', .055);
    }
    corridorHero(t, cz, false);
    entrance(t, cz);
    vignette(.22, '#10142E');
  }

  // =====================================================================================================
  // 2 · BADGE (14.556–19.356) 摘下工作牌 夜才回到我这边: outside the entrance, still in the cold white office light. She grabs
  // the lanyard, flings it up off her head (the ahoge springs up), and on that beat the office behind her peels away like a
  // sheet of paper: a soft night with a sleepy moon, stars popping on, warm street lamps. She catches the badge, takes a
  // deep breath, and drops it into her tote.
  const POP = B(26), CATCH = B(27);
  function officeSheet(t) {
    paint(rectPts(-200, -200, 2320, 1110), { wash: '#DCE3E6', fill: '#C5CFD4', fillOp: 70, bleed: .04, tex: .5, border: .2, ink: null });
    for (let y = 60; y < 900; y += 120) inkLine([[-200, y], [2120, y]], .5, '#B2BEC4', 'fine', 0, .6);
    for (let x = -60; x < 2000; x += 240) inkLine([[x, -200], [x, 900]], .5, '#B2BEC4', 'fine', 0, .5);
    for (const [x0, x1] of [[-100, 420], [1400, 2020]]) for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {    // cold office windows
      const wx = x0 + 40 + c * (x1 - x0 - 60) / 3, wy = 70 + r * 220;
      paint(rectPts(wx, wy, (x1 - x0 - 60) / 3 - 30, 150), { wash: '#F2FBF8', fill: '#CFE3DE', fillOp: 50, ink: '#8A98A4', sw: .7 });
      fillRectA(wx + 10, wy + 14, (x1 - x0 - 60) / 3 - 50, 6, '#FFFFFF', .9);
    }
    // the entrance: a bright lobby behind glass
    paint(rectPts(520, 190, 760, 720), { wash: '#F4FCF9', ink: null });
    for (let k = 0; k < 4; k++) { const y = 230 + k * 42, w = 600 - k * 110; fillRectA(900 - w / 2, y, w, 10 - k * 1.5, '#FFFFFF', 1); glow(900, y + 5, w * .6, '#E6FFF6', .3); }
    paint([[520, 700], [1280, 700], [1280, 905], [520, 905]], { wash: '#E3EEEA', fill: '#C9DAD5', fillOp: 50, ink: null });
    paint(rectPts(1020, 560, 200, 150, 2), { wash: '#C4D2D0', ink: '#7E8E96', sw: .8 });
    paint(rectPts(1000, 545, 240, 22, 2), { wash: '#E7EEEC', ink: '#7E8E96', sw: .8 });
    paint([[590, 700], [660, 700], [650, 630], [600, 630]], { wash: '#D8DEDC', ink: '#7E8E96', sw: .6 });
    for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * .4; paint(ellPts(625 + Math.cos(a) * 34, 600 + Math.sin(a) * 40, 12, 32, 10, 0, a + Math.PI / 2), { wash: '#A9CDB8', ink: '#6F8F7C', sw: .5 }); }
    paint(rectPts(520, 190, 760, 720), { wash: '#DDF3EE', washOp: 40, ink: '#6E7C8C', sw: 2.2 });
    inkLine([[900, 190], [900, 905]], 2, '#6E7C8C', 'fine', 0);
    for (const x of [870, 930]) inkLine([[x, 470], [x, 640]], 2.2, '#9AA6B4', 'marker', 0);
    paint([[560, 200], [640, 200], [560, 520]], { wash: '#FFFFFF', washOp: 30, ink: null });
    paint(rectPts(470, 150, 860, 44, 2), { wash: '#A9B6BE', fill: '#8C9AA4', fillOp: 60, tex: .4, ink: PAL.ink, sw: 1 });
    fillRectA(490, 190, 820, 5, '#FFFFFF', .8);
    // the plaza, washed in the lobby's light
    paint([[-200, 905], [2120, 905], [2120, 1300], [-200, 1300]], { wash: '#C9D3D8', fill: '#AEBBC2', fillOp: 60, tex: .5, ink: PAL.ink, sw: .8 });
    for (let k = -6; k < 8; k++) inkLine([[900 + k * 180, 905], [900 + k * 330, 1300]], .5, '#9AA8B0', 'fine', 0, .6);
    paint([[520, 905], [1280, 905], [1500, 1200], [300, 1200]], { fill: '#F2FBF8', fillOp: 80, bleed: .2, tex: .2, border: 0, ink: null });
  }
  function nightSheet(t) {
    paint(rectPts(-200, -200, 2320, 1110), { grad: ['#161B4A', '#46407E', Math.PI / 2], ink: null });
    glow(960, 900, 1100, '#8A6AA0', .35);
    // stars popping on, one by one after the peel
    for (let i = 0; i < 30; i++) {
      const sx = 40 + hash(i * 3.31 + 7) * 1840, sy = 30 + hash(i * 7.17 + 2) * 560, t0 = POP + .25 + i * .075 + hash(i) * .2, a = t - t0;
      if (a < 0) continue;
      const tw = .65 + .35 * Math.sin(t * (2 + hash(i) * 3) + i), big = hash(i * 1.7) > .7;
      if (a < .5) sparkle(sx, sy, (big ? 22 : 13), '#FFF3C0', a / .5);
      if (big) paint(starPts(sx, sy, (7 + 3 * tw) * Math.min(1, a * 4), .38, 4, 0), { wash: '#FFF3C8', ink: null });
      else dot(sx, sy, 2.4 * Math.min(1, a * 4), PAL.cream, .5 + .5 * tw);
    }
    moonFace(1560, 210, 72, { rot: -.3 });
    const sh = seg(t, B(30) - .15, B(30) + .45);            // a shooting star while she breathes out
    if (sh > 0 && sh < 1) {
      const e = easeOut(sh), hx = lerp(1330, 520, e), hy = lerp(90, 330, e), tl = 180 * Math.sin(sh * Math.PI);
      inkLine([[hx + tl * .96, hy - tl * .28], [hx + tl * .45, hy - tl * .13], [hx, hy]], 2.6, '#FFF3C8', 'ink', 0, .9 * (1 - sh * .5));
      glow(hx, hy, 40, '#FFF3C0', .8 * (1 - sh)); sparkle(hx, hy, 14, '#FFFFFF', .5 + .5 * (1 - sh));
    }
    // far houses with warm windows
    for (let i = 0; i < 11; i++) {
      const bx = -120 + i * 205 + hash(i) * 40, bw = 150 + hash(i * 2.3) * 60, bh = 110 + hash(i * 4.1) * 150;
      const roof = hash(i * 5.5) > .45;
      paint([[bx, 880], [bx, 880 - bh], ...(roof ? [[bx + bw / 2, 880 - bh - 60]] : []), [bx + bw, 880 - bh], [bx + bw, 880]], { wash: '#2B2D63', fill: '#232657', fillOp: 70, tex: .4, ink: null });
      for (let k = 0; k < 4; k++) if (hash(i * 9 + k) > .45) { const wx = bx + 22 + (k % 2) * (bw - 70), wy = 880 - bh + 30 + Math.floor(k / 2) * 52; const on = seg(t, POP + .6 + hash(i + k) * 1.4, POP + .7 + hash(i + k) * 1.4); if (on > 0) { fillRectA(wx, wy, 26, 20, '#FFD98A', .85 * on); glow(wx + 13, wy + 10, 40, '#FFD98A', .25 * on); } }
    }
    // round trees and warm street lamps
    for (const [tx, ts] of [[180, 1], [1330, .8], [1780, 1.15]]) {
      paint(rectPts(tx - 8 * ts, 780, 16 * ts, 110), { wash: '#3A2F4E', ink: null });
      paint(cloudPts(tx, 760, 220 * ts, 150 * ts, tx * .1, 7).map(([x, y]) => [x, y + 40 * ts]), { wash: '#2C4A5A', fill: '#1F3848', fillOp: 70, tex: .4, ink: null, curv: .4 });
    }
    paint([[-200, 880], [2120, 880], [2120, 1300], [-200, 1300]], { wash: '#3A3668', fill: '#2C2A58', fillOp: 70, tex: .5, ink: null });
    for (const [lx, t0] of [[430, B(28)], [1440, B(29)], [2000, B(28) + .3]]) {
      const on = t < t0 ? 0 : clamp(backOut(seg(t, t0, t0 + .25))) * (t - t0 < .2 && Math.sin((t - t0) * 80) > .2 ? .6 : 1);
      inkLine([[lx, 885], [lx, 520], [lx + 30, 490]], 3.4, '#2A2748', 'marker', 0);
      paint(ellPts(lx + 40, 492, 22, 14, 12), { wash: on > .3 ? '#FFE7A8' : '#5A5A78', ink: PAL.ink, sw: .7 });
      if (on > 0) { glow(lx + 40, 500, 170 * on, '#FFD98A', .5 * on); push(); translate(lx + 40, 900); scale(1, .3); glow(0, 0, 260 * on, '#FFD58A', .45 * on); pop(); }
    }
    // the glowing vending machine down the street (she'll get a soda there)
    paint(rrPts(1600, 700, 90, 180, 8), { wash: '#DDEBFA', fill: '#AFC6E6', fillOp: 60, ink: '#2A2748', sw: .8 });
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) dot(1614 + c * 20, 724 + r * 26, 5, [PAL.coral, PAL.mint, '#F6C85F', PAL.pink][(r + c) % 4], .9);
    glow(1645, 790, 150, '#CFE8FF', .3);
  }
  // her pose through the shot, and where the lanyard is
  function badgePose(t) {
    const aR = kf(t, [[15.0, -1.2], [15.16, -2.05], [15.72, .75], [16.15, .8], [CATCH, .38], [16.7, .3], [16.95, .42], [17.5, .15], [18.55, .2], [18.95, -1.15]], easeInOut);
    const aL = kf(t, [[15.0, -1.2], [15.16, -2.05], [15.72, .75], [16.15, .8], [CATCH + .1, -.2], [16.95, .25], [17.5, -1.05], [19.4, -1.1]], easeInOut);
    const stretch = -.12 * smooth01(t, 15.2, 15.6, POP, POP + .1) - .07 * smooth01(t, 16.45, 16.9, 16.95, 17.2);
    const squash = .07 * smooth01(t, 14.98, 15.06, 15.14, 15.22) + .1 * Math.sin(seg(t, POP, POP + .3) * Math.PI) * (t < POP + .3 ? 1 : 0) + .06 * smooth01(t, 16.95, 17.05, 17.3, 17.6);
    const hop = -Math.sin(seg(t, POP, POP + .42) * Math.PI) * .45;
    const sway = t > 17.6 ? move('sway', t) : null;
    const md = mood(t, [[14.3, 'tired', null, 'flat'], [15.0, 'closed', null, 'pout'], [POP, 'sparkle', 'spark', 'open'], [16.45, 'closed', null, 'o'], [16.97, 'happy', 'flower', 'smile'], [18.1, 'normal', null, 'smile'], [18.8, 'happy', null, 'cat']]);
    const o = { outfit: 'office', badge: t < 15.16, aL, aR, dy: hop, sq: stretch + squash + (t < 15 ? Math.sin(t * 2.2) * .015 : 0), ...md,
      tilt: (sway ? sway.tilt : 0) + (t < 15 ? -.05 : 0) + .06 * smooth01(t, 18.8, 19.0, 19.3, 19.5), rot: sway ? sway.rot * .6 : 0,
      blush: .35 + .45 * seg(t, 16.95, 17.4), lookY: t < 15.16 ? .5 * seg(t, 14.95, 15.1) : t < 16.4 && t > POP ? -.5 : 0, lookX: t > 18.95 ? .5 * seg(t, 18.95, 19.2) : 0, ahoge: 'none' };
    o.sq += o.take || 0; o.take = 0;
    return o;
  }
  function springAhoge(t) {                               // droop → perk with a springy overshoot, drawn in head space
    const k = t < POP ? 0 : elasticOut(seg(t, POP, POP + .9)), a = Math.sin(t * 4.2) * .05;
    const D = [[.2, -2.85], [.9, -3.2], [1.6, -2.9], [1.9, -2.35]], Pk = [[.1, -2.9], [.25, -3.9], [.05, -4.7], [.45, -5.1]];
    return (s, sw) => {
      const pts = D.map((p, i) => [lerp(p[0], Pk[i][0], k) * s, lerp(p[1], Pk[i][1], k) * s]);
      push(); translate(0, -2.9 * s); rotate(a); translate(0, 2.9 * s);
      inkLine(pts, sw * 1.25, HERO_STYLE.hair, 'ink', .6);
      pop();
      const b = t - POP;
      if (b > 0 && b < .5) for (const sd of [-1, 1]) inkLine([[sd * .6 * s, -5.4 * s], [sd * 1.0 * s, -5.9 * s], [sd * .8 * s, -6.3 * s]], sw * .7, PAL.cream, 'ink', .5, 1 - b / .5);
    };
  }
  function lanyardCord(pts, sw) { inkLine(pts, sw * .75, '#2F5E96', 'marker', .5); inkLine(pts, sw * .5, '#4F8FD6', 'marker', .5); }
  function badge(t, lt, dur) {
    const r = Math.hypot(W, H) * easeInOut(seg(t, POP - .06, POP + .95)), zoom = kf(t, [[B(24), 1.02], [POP, 1.08], [POP + 1.2, .98], [B(32), 1.0]], easeInOut);
    const cam = [900, kf(t, [[B(24), 548], [POP, 515], [POP + 1.2, 525]], easeInOut), zoom];
    camBegin(...cam); nightSheet(t); camEnd();
    // the office, a paper sheet peeling off from the top-right corner
    const dx = -W / Math.hypot(W, H), dy = H / Math.hypot(W, H), c0 = W * dx, scr = [[-5, -5], [W + 5, -5], [W + 5, H + 5], [-5, H + 5]];
    const keep = r < 2 ? scr : clipHalf(scr, dx, dy, c0 + r);
    if (keep.length > 2) {
      X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.clip(pathOf(keep));
      camBegin(...cam); officeSheet(t); camEnd();
      X.restore();
    }
    if (r > 2) {
      const gone = clipHalf(scr, -dx, -dy, -(c0 + r)), refl = ([x, y]) => { const f = x * dx + y * dy - c0 - r; return [x - 2 * f * dx, y - 2 * f * dy]; };
      const flap = gone.map(refl);
      if (flap.length > 2) {
        X.save(); X.setTransform(1, 0, 0, 1, 0, 0);
        paint(flap.map(([x, y]) => [x + 12, y + 16]), { fill: PAL.ink, fillOp: 90, bleed: .15, tex: .2, border: 0, ink: null });
        paint(flap, { grad: ['#D9CDBB', '#F7F0E4', Math.atan2(dy, dx)], ink: PAL.ink, sw: 1.2 });
        paint(flap, { fill: '#C9B8A6', fillOp: 60, bleed: .1, tex: .5, border: .5, ink: null });
        X.restore();
      }
    }
    // her, the lanyard, the tote
    camBegin(...cam);
    const x = 900, y = 1012, S = 78, o = badgePose(t);
    const HL = handXY(x, y, S, o, -1), HR = handXY(x, y, S, o, 1), hc = headXY(x, y, S, o);
    const lift = easeInOut(seg(t, 15.16, 15.7)), held = t >= 15.16 && t < POP;
    if (held) lanyardCord([HL, [lerp(HL[0], hc[0], .5) - 1.7 * S, lerp(HL[1], hc[1] - 3.2 * S * lift, .7)], [hc[0], lerp(y - 4.4 * S, hc[1] - 3.55 * S, lift)], [lerp(HR[0], hc[0], .5) + 1.7 * S, lerp(HR[1], hc[1] - 3.2 * S * lift, .7)], HR], clamp(S / 19, .32, 2.3));
    const intoBag = seg(t, 18.9, 19.1);
    hero(x, y, S, { ...o, head: springAhoge(t), draw: (u, sw) => tote(u, sw, 1, -.05 * Math.sin(bpOf(t) * Math.PI)) });
    const sw = clamp(S / 19, .32, 2.3);
    if (held) {                                            // the front of the loop and the badge, hanging from her hands
      const bx = (HL[0] + HR[0]) / 2, by = Math.max(HL[1], HR[1]) + .75 * S, sw9 = Math.sin(t * 9) * .15;
      lanyardCord([HL, [lerp(HL[0], bx, .6), lerp(HL[1], by, .75)], [bx, by], [lerp(HR[0], bx, .6), lerp(HR[1], by, .75)], HR], sw);
      push(); translate(bx, by); rotate(sw9); badgeCard(0, .6 * S, S * .9, sw); pop();
    } else if (t >= POP && t < CATCH) {                    // flung up, spinning, and back down into her hand
      const u = seg(t, POP, CATCH), cx = lerp(hc[0], HR[0], u) + Math.sin(u * Math.PI) * 1.8 * S, cy = lerp(hc[1] - 3.4 * S, HR[1] + .3 * S, u * u) - Math.sin(u * Math.PI) * 2.6 * S;
      push(); translate(cx, cy); rotate(u * TAU * 1.25);
      lanyardCord(ellPts(0, 0, 1.2 * S, .5 * S, 16).concat([[1.2 * S, 0]]), sw);
      badgeCard(0, 1.0 * S, S * .9, sw);
      pop();
      for (let k = 1; k < 4; k++) inkLine([[cx - k * 8, cy + 40 + k * 18], [cx - k * 8, cy + 90 + k * 18]], .8, PAL.cream, 'fine', 0, .5 * (1 - u));
    } else if (t >= CATCH && t < 19.1) {                   // dangling from her hand, swinging, then dropped into the tote
      const a = t - CATCH, sw2 = .7 * Math.exp(-2.2 * a) * Math.sin(a * 9) + .08 * Math.sin(t * 2.3) + (t > 18.7 ? -.25 * seg(t, 18.7, 18.95) : 0);
      const L = 1.5 * S + intoBag * .9 * S, bx = HR[0] + Math.sin(sw2) * L, by = HR[1] + Math.cos(sw2) * L;
      const clip = intoBag > 0 ? [[-9999, -9999], [9999, -9999], [9999, y - 2.2 * S], [-9999, y - 2.2 * S]] : null;
      const draw = () => { lanyardCord([HR, [bx - .25 * S, by - .1 * S]], sw); lanyardCord([HR, [bx + .25 * S, by - .1 * S]], sw); push(); translate(bx, by); rotate(sw2 * .6); badgeCard(0, .55 * S, S * .9, sw); pop(); };
      if (clip) clipTo(clip, draw); else draw();
    }
    const pk = t - 19.1;
    if (pk > 0 && pk < .6) sparkle(x + 1.6 * S, y - 2.6 * S, 20, '#FFF3C0', pk / .6);
    const warm = seg(t, B(28), B(29) + .3);
    if (warm > 0) { light(x - 3.5 * S, y - 6 * S, 5 * S, '#FFD58A', .16 * warm); light(x + 4 * S, y - 5 * S, 4 * S, '#FFD58A', .12 * seg(t, B(29), B(29) + .3)); }
    const cold = 1 - seg(t, POP, POP + .8);
    if (cold > 0) light(x, y - 7 * S, 6 * S, '#E8FFF6', .1 * cold);
    // her breath after the deep sigh: a little cloud puff
    const bk = seg(t, 17.0, 18.2);
    if (bk > 0 && bk < 1) { const px = hc[0] - (3.3 + bk * 1.4) * S, py = hc[1] + (1.1 - bk * 1.5) * S, r = (.55 + bk * .45) * S;
      fadeIn(1 - ease(seg(bk, .55, 1)), () => { paint(cloudPts(px, py, r * 2, r * .7, 11, 5), { wash: PAL.cream, washOp: 220, ink: PAL.ink, sw: .8, curv: .4 }); inkLine([[px + r * 1.05, py - r * .1], [px + r * 1.5, py - r * .05]], 1, PAL.cream, 'fine', 0, .8); }); }
    camEnd();
  }

  // =====================================================================================================
  // 3 · CAN (19.356–24.156) 罐身的水珠 慢慢落在指尖: a close-up by the vending machine's glow. She holds a cold can of peach
  // soda against her chest, eyes closed, enjoying the chill. One fat drop slides slowly down the can (the camera tilts down
  // with it) and lands on the tip of her thumb on the beat: a tiny splash and a glint. The camera drifts back up to her smile.
  const CAN = { S: 110, x: 960, y: 1080 }, LAND = B(38);
  function bigCan(cx, top, w, h, t) {
    const x0 = cx - w / 2, rimH = w * .13;
    paint(rrPts(x0, top, w, h, w * .12), { grad: ['#E97E62', '#FFC7A6', 0], ink: null });
    paint(rrPts(x0 + w * .58, top, w * .42, h, w * .12), { fill: '#C8604A', fillOp: 80, bleed: .05, tex: .3, border: 0, ink: null });
    paint(rectPts(x0, top + h * .3, w, h * .32), { wash: '#FFF3E6', ink: null });
    paint(rectPts(x0 + w * .64, top + h * .3, w * .36, h * .32), { fill: '#E6CFC0', fillOp: 90, bleed: .05, ink: null });
    // the peach on the label
    const px = cx - w * .06, py = top + h * .47, pr = w * .17;
    paint(ellPts(px, py, pr, pr * .95, 20), { wash: '#F9A98E', fill: '#EE7F9E', fillOp: 60, ink: '#B45A70', sw: .9 });
    inkLine([[px + pr * .1, py - pr * .85], [px - pr * .15, py - pr * .1], [px + pr * .05, py + pr * .6]], .8, '#D86A7E', 'fine', .6, .8);
    paint(ellPts(px + pr * .55, py - pr * 1.05, pr * .45, pr * .2, 10, 0, -.5), { wash: '#8DB59A', ink: '#5E7F68', sw: .6 });
    dot(px - pr * .45, py - pr * .35, pr * .18, '#FFFFFF', .7);
    paint(rrPts(x0, top, w, h, w * .12), { ink: PAL.ink, sw: 1.4 });
    // lid, rim and tab
    paint(ellPts(cx, top + rimH * .4, w * .5, rimH, 22), { wash: '#E6E8EF', fill: '#B8BCCB', fillOp: 60, ink: PAL.ink, sw: 1.1 });
    paint(ellPts(cx, top + rimH * .45, w * .4, rimH * .7, 20), { wash: '#CDD1DC', ink: '#8E93A6', sw: .5 });
    paint(rrPts(cx - w * .1, top + rimH * .1, w * .2, rimH * .5, rimH * .2), { wash: '#B8BCCB', ink: PAL.ink, sw: .6 });
    inkLine([[x0 + w * .16, top + rimH * 1.6], [x0 + w * .16, top + h - w * .1]], w * .02, '#FFFFFF', 'marker', 0, .6);
    // condensation: many small beads, a frosty film near the top
    paint(rectPts(x0 + 3, top + rimH * 1.2, w - 6, h * .14), { wash: '#FFFFFF', washOp: 45, ink: null });
    for (let i = 0; i < 110; i++) {
      const bx = x0 + w * (.06 + .88 * hash(i * 3.7)), by = top + rimH * 1.4 + (h - rimH * 1.8) * hash(i * 5.9), r = w * (.008 + .03 * Math.pow(hash(i * 1.3) * hash(i * 2.1), .8));
      const edge = Math.abs(bx - cx) / (w / 2);
      dot(bx + r * .2, by + r * .35, r, '#B85A48', .22); dot(bx, by, r, '#FFFFFF', .55 - .3 * edge); dot(bx - r * .35, by - r * .35, r * .35, '#FFFFFF', .95);
    }
  }
  function mitt(x, y, u, rot, thumb) {                   // a close-up chibi hand wrapping the can; thumb: angle of a thumb over the can's front
    push(); translate(x, y); rotate(rot);
    paint(ellPts(0, 0, .46 * u, .4 * u, 18), { wash: SKIN, ink: PAL.ink, sw: 1.2 });
    paint(ellPts(.1 * u, .12 * u, .3 * u, .18 * u, 12), { fill: SKIN_DK, fillOp: 90, bleed: .2, ink: null });
    for (const k of [-.12, .06]) inkLine([[k * u - .3 * u, -.05 * u], [k * u - .22 * u, .12 * u]], .7, '#C98F7E', 'fine', .3, .8);
    pop();
    if (thumb != null) { push(); translate(x, y); rotate(thumb); paint(rrPts(-.13 * u, -.52 * u, .26 * u, .6 * u, .13 * u), { wash: SKIN, ink: PAL.ink, sw: 1.1 }); paint(ellPts(0, -.4 * u, .07 * u, .05 * u, 8), { wash: '#F6D6CC', ink: null }); pop(); }
  }
  // the big drop: its y down the can at time t (sliding in fits and starts), and its size
  function dropAt(t, top, h) {
    const form = seg(t, 19.9, B(34)), slide = seg(t, B(34), 22.8);
    const p = slide - .05 * Math.sin(slide * Math.PI * 7) * Math.sin(slide * Math.PI), y = lerp(top + h * .12, top + h * .72, clamp(p));
    return { y, r: 12 + 6 * easeOut(form) + 3 * seg(t, 21.5, 22.7), form };
  }
  function can(t, lt, dur) {
    const { S, x, y } = CAN;
    const down = easeInOut(seg(t, 20.45, 22.85)), up = easeInOut(seg(t, LAND + .12, LAND + 1.0));
    const cy = lerp(lerp(y - 4.35 * S, y - 2.95 * S, down), y - 4.8 * S, up), cx = x + lerp(0, .15 * S, down) * (1 - up);
    const zoom = lerp(lerp(1.44, 1.85, down), 1.5, up);
    // background: the night street out of focus, the vending machine's cold glow at the right
    paint(rectPts(-20, -20, W + 40, H + 40), { grad: ['#1A1E4A', '#3A2F6B', Math.PI / 2], ink: null });
    const par = (down - up * .8) * 170, bk = [PAL.lamp, '#FF9FB0', '#8FE3D8', '#FFE7A8', '#F6B38E', '#C9A0DC'];
    for (let i = 0; i < 22; i++) {
      const bx = hash(i * 4.1) * W + Math.sin(t * .22 + i) * 30 - (t - 21) * 12, by = hash(i * 6.3) * (H + 300) - par * (.4 + hash(i) * .5) + Math.cos(t * .19 + i) * 14;
      bokeh(bx, by, 50 + hash(i * 2.9) * 110, bk[i % bk.length], .2 + .14 * Math.sin(t * .8 + i));
    }
    paint(rrPts(1600, -120 - par, 520, 1500, 40), { fill: '#DDEBFA', fillOp: 55, bleed: .3, tex: .2, border: 0, ink: null });
    for (let r = 0; r < 7; r++) for (let c = 0; c < 3; c++) bokeh(1700 + c * 105, 60 + r * 140 - par, 32, [PAL.coral, PAL.mint, '#F6C85F', PAL.pink][(r + c) % 4], .3);
    glow(1780, 500 - par, 700, '#D8ECFF', .3);
    camBegin(cx, cy, zoom);
    const landed = t >= LAND, rk = t - LAND;
    const md = mood(t, [[19.0, 'closed', null, 'cat'], [LAND - .02, 'wide', '!', 'o'], [LAND + .55, 'happy', 'heart', 'smile']]);
    const shiver = (t < 19.8 ? Math.sin(t * 60) * .012 * (1 - seg(t, 19.36, 19.8)) : 0) + (landed && rk < .5 ? Math.sin(rk * 70) * .02 * (1 - rk / .5) : 0);
    const o = { outfit: 'office', badge: false, aL: -1.52, aR: -1.52, ...md, sq: (md.take || 0) + Math.sin(t * 2.2) * .01, take: 0, rot: shiver, blush: .7 + .25 * seg(t, LAND, LAND + .4),
      tilt: -.06 + .04 * Math.sin(t * 1.1) + (landed ? .1 * seg(t, LAND + .3, LAND + .9) : 0), lookY: landed ? .75 * seg(t, LAND + .4, LAND + .8) : .2, lookX: landed ? .2 : 0, ahoge: landed ? 'perk' : 'normal' };
    hero(x, y, S, { ...o, noShadow: true });
    if (t < 20.4) for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) {       // a shiver of cold air at first
      const hx = x + sd * (2.85 + k * .28) * S, hy = y - (6.3 - k * .45) * S;
      inkLine([[hx, hy], [hx + sd * .18 * S, hy + .14 * S], [hx + sd * .08 * S, hy + .28 * S]], 1.1, '#CFE6FF', 'fine', .5, .85 * (1 - seg(t, 19.9, 20.4)));
    }
    // the can, held against her chest
    const cw = 1.7 * S, ch = 2.9 * S, ctop = y - 4.5 * S;
    bigCan(x, ctop, cw, ch, t);
    for (const sd of [-1, 1]) { const ph = (t * .4 + (sd > 0 ? .5 : 0)) % 1, bx0 = x + sd * .78 * S, by0 = ctop + .1 * S - ph * .5 * S;   // cold mist curling off the rim
      inkLine([[bx0, by0], [bx0 + sd * .15 * S, by0 - .15 * S], [bx0 + sd * .05 * S, by0 - .3 * S], [bx0 + sd * .22 * S, by0 - .42 * S]], 1.6, '#EAF4FF', 'fine', .6, .55 * Math.sin(ph * Math.PI)); }
    // the big drop and its wet trail
    const d = dropAt(t, ctop, ch), lx = x + .42 * S, dx = lx + Math.sin(d.y * .012) * .04 * S;
    if (d.form > 0 && !landed) {
      const tr0 = ctop + ch * .14;
      if (d.y - tr0 > 4) { inkLine([[lx, tr0], [lx + 1, (tr0 + d.y) / 2], [dx, d.y]], d.r * .3, '#FFFFFF', 'marker', .5, .35); for (let k = 1; k < 4; k++) dot(lx + Math.sin(k) * 2, lerp(tr0, d.y, k / 4.5), d.r * .2, '#FFFFFF', .7); }
      const r = d.r * lerp(.4, 1, easeOut(d.form)), st = 1 + .3 * seg(t, 22.6, LAND);
      const dp = [[dx, d.y - r * 1.7 * st], [dx + r * .9, d.y - r * .1], [dx + r * .8, d.y + r * .6], [dx, d.y + r * .95], [dx - r * .8, d.y + r * .6], [dx - r * .9, d.y - r * .1]];
      paint(dp.map(([px, py]) => [px + r * .25, py + r * .3]), { wash: '#B8543E', washOp: 60, ink: null, curv: .6 });
      paint(dp, { wash: '#FFFFFF', washOp: 70, ink: '#C06E5C', sw: .6, curv: .6 });
      paint([[dx - r * .7, d.y + r * .2], [dx + r * .7, d.y + r * .2], [dx + r * .6, d.y + r * .65], [dx, d.y + r * .9], [dx - r * .6, d.y + r * .65]], { wash: '#E9785C', washOp: 90, ink: null, curv: .6 });
      dot(dx - r * .33, d.y - r * .25, r * .32, '#FFFFFF', .98); dot(dx - r * .15, d.y - r * .75, r * .12, '#FFFFFF', .9); dot(dx + r * .35, d.y + r * .5, r * .16, '#FFFFFF', .75);
    }
    // her hands: the left wraps the can, the right thumb lies across its front, right where the drop is heading
    mitt(x - .86 * S, y - 2.25 * S, S, .3, null);
    const tb = landed ? Math.sin(Math.min(rk * 10, Math.PI)) * .12 * Math.exp(-rk * 3) : 0;
    mitt(x + .86 * S, y - 2.2 * S, S, -.3, -.95 + tb);
    const tip = [x + .86 * S - Math.sin(.95) * .48 * S, y - 2.2 * S - Math.cos(.95) * .48 * S];
    if (landed) {                                          // the splash and the glint
      if (rk < .75) for (let k = 0; k < 9; k++) { const a = -Math.PI * (.08 + .84 * k / 8), v = (.55 + hash(k) * .6) * S * 1.5; const px = tip[0] + Math.cos(a) * v * rk, py = tip[1] + Math.sin(a) * v * rk + 2.2 * S * rk * rk; dot(px, py, (.085 - .05 * rk) * S, '#FFFFFF', .95 * (1 - rk / .75)); dot(px - .02 * S, py - .02 * S, .03 * S, '#FFFFFF', 1 - rk / .75); }
      if (rk < .5) { paint(ellPts(tip[0], tip[1], (.15 + rk * .8) * S, (.05 + rk * .22) * S, 20), { ink: '#FFFFFF', sw: 1.4 * (1 - rk * 2) }); paint(ellPts(tip[0], tip[1], (.08 + rk * .45) * S, (.03 + rk * .12) * S, 16), { ink: '#DDF0FF', sw: 1 * (1 - rk * 2) }); }
      if (rk < .18) paint(starPts(tip[0], tip[1] - .1 * S, (.5 - rk * 2) * S, .25, 8, 0), { wash: '#FFFFFF', washOp: 200 * (1 - rk / .18), ink: null });
      sparkle(tip[0] + .12 * S, tip[1] - .22 * S, .42 * S, '#FFF3C0', clamp(rk / .9));
      if (rk > .25) sparkle(tip[0] - .28 * S, tip[1] - .42 * S, .2 * S, '#FFF3C0', clamp((rk - .25) / .7));
      dot(tip[0] - .02 * S, tip[1] + .02 * S, .07 * S, '#FFFFFF', .8 * Math.max(0, 1 - rk / 1.2) + .3);
    }
    camEnd();
    light(1720, 520, 900, '#DDF0FF', .1);
    vignette(.3, '#10142E');
  }

  // =====================================================================================================
  // 4 · STREET (24.156–28.956, held to ~29.4 under chapter 2's dissolve) 有个新的念头 跟我回到房间: a side-scrolling night
  // street after the rain. She walks home with her soda; a star drops out of the sky and becomes a little idea that hops
  // after her. She glances back — it hides behind a lamp post; she shrugs and walks on. At her door she goes in, and the idea
  // zips through the gap just before it shuts. Her window lights up.
  const ST = { g: 895, S: 27, door: 1070, post: 700, box: 1290 }, ARRIVE = B(45), SHUT = B(47);
  function heroStreetX(t) {
    if (t < 25.9) return 480 + 232 * (t - B(40));
    if (t < B(44)) return 480 + 232 * (25.9 - B(40)) + 30 * easeOut(seg(t, 25.9, 26.1));
    return lerp(935, ST.door - 36, easeInOut(seg(t, B(44), ARRIVE + .05)));
  }
  function streetCam(t) {
    const hx = heroStreetX(t), follow = hx + 150, settle = easeInOut(seg(t, 26.7, 27.9));
    return { x: lerp(follow, ST.door + 40, settle), y: lerp(700, 560, easeInOut(seg(t, 28.0, 29.4))), z: lerp(1.42, 1.34, easeInOut(seg(t, 28.0, 29.4))) };
  }
  // the idea: where it is at time t (world), and how it looks
  function ideaAt(t) {
    const hx = heroStreetX(t);
    if (t < B(41)) { const u = seg(t, 24.4, B(41)); return { x: lerp(640, 420, u), y: lerp(360, 858, u * u), sq: -.3 * u, eyes: 'happy', vis: t > 24.4, fall: u }; }
    if (t < 25.25) { const a = t - B(41); return { x: 420, y: 858 - Math.abs(Math.sin(a * 7)) * 22 * Math.exp(-a * 4), sq: .35 * Math.exp(-a * 9) * Math.cos(a * 30), rot: Math.sin(a * 6) * .2 * Math.exp(-a * 2), eyes: a > .25 ? 'normal' : 'happy', vis: true }; }
    if (t < B(43)) {                                       // hopping after her, one hop per half beat
      const k = seg(t, 25.25, B(43)), gap = lerp(hx - 420, 175, easeOut(k)), hp = frac(bpOf(t) * 2);
      return { x: hx - gap, y: 862 - Math.sin(hp * Math.PI) * 34, sq: hp < .15 ? .2 * (1 - hp / .15) : -.08, eyes: 'normal', vis: true, trail: true };
    }
    if (t < 26.25) {                                       // she looks back: it zips behind the lamp post, stretches thin, eyes shut
      const z = easeOut(seg(t, B(43), B(43) + .14)), from = heroStreetX(B(43)) - 175, j = t > B(43) + .14 ? Math.sin(t * 40) * .6 : 0;
      return { x: lerp(from, ST.post + 1, z) + j, y: lerp(858, 800, z), sq: -.12 * z, eyes: z > .5 ? 'happy' : 'normal', vis: true, hide: z };
    }
    if (t < 27.0) {                                        // ...peeks out when she turns away, then hops after her again
      const pe = easeOut(seg(t, 26.25, 26.5)), go = easeInOut(seg(t, 26.62, 27.0)), hp = frac(bpOf(t) * 2);
      return { x: lerp(ST.post + 30 * pe, 880, go), y: lerp(800, 858, Math.max(pe * .3, go)) - Math.sin(hp * Math.PI) * 30 * go, sq: -.12 * (1 - pe), rot: -.25 * pe * (1 - go), eyes: 'normal', vis: true, peek: pe, trail: go > .05 };
    }
    if (t < 28.08) { const hp = frac(bpOf(t) * 2), k = seg(t, 27.0, 27.4); return { x: lerp(880, 905, k), y: 850 - Math.sin(hp * Math.PI) * 12, sq: hp < .15 ? .1 : 0, eyes: 'normal', vis: true, trail: false }; }
    const z = easeIn(seg(t, 28.08, SHUT - .06));                // zip! through the closing door
    return { x: lerp(905, DOOR.x1 - 22, z), y: lerp(850, 772, z) - Math.sin(z * Math.PI) * 60, sq: -.35 * seg(z, .6, 1), eyes: 'happy', vis: z < 1, trail: z < .8, zip: z };
  }
  function streetSky(t, cam) {
    paint(rectPts(-40, -40, W + 80, H + 80), { grad: ['#141A45', '#4A3F80', Math.PI / 2], ink: null });
    glow(960, 900, 1200, '#7A5A9A', .3);
    starField(t, { x: 0, y: 0, w: W, h: 520 }, 40, { seed: 9 });
    moonFace(1800 - (cam.x - 900) * .03, 96, 52, { rot: -.3 });
  }
  function farCity(t, cam) {
    camBegin(960 + (cam.x - 960) * .3, 540, 1 + (cam.z - 1) * .5);
    for (let i = 0; i < 16; i++) {
      const bx = -200 + i * 160 + hash(i * 3.3) * 50, bw = 110 + hash(i * 5.1) * 70, bh = 180 + hash(i * 7.7) * 260;
      paint(rectPts(bx, 800 - bh, bw, bh + 60), { wash: '#45458A', washOp: 220, ink: null });
      for (let r = 0; r < 7; r++) for (let c = 0; c < 3; c++) if (hash(i * 31 + r * 5 + c * 11) > .72) fillRectA(bx + 12 + c * (bw - 24) / 3, 800 - bh + 18 + r * 34, (bw - 24) / 3 - 10, 12, '#FFD98A', .45);
    }
    paint(rectPts(-400, 730, 3000, 400), { wash: '#4A3F80', washOp: 90, ink: null });
    camEnd();
  }
  function shutterShop(x, w, col, t, awn) {
    const up = mixCol(col, '#3A3668', .35);
    paint(rectPts(x, 360, w, 190), { wash: up, fill: mixCol(up, PAL.ink, .2), fillOp: 60, tex: .5, ink: PAL.ink, sw: 1 });
    paint(rectPts(x - 8, 352, w + 16, 14), { wash: mixCol(up, PAL.ink, .25), ink: PAL.ink, sw: .8 });
    paint(rectPts(x, 540, w, 345), { wash: col, fill: mixCol(col, PAL.ink, .2), fillOp: 60, tex: .5, ink: PAL.ink, sw: 1 });
    paint(rectPts(x + 18, 640, w - 36, 245), { wash: '#6E7598', fill: '#5A6186', fillOp: 60, tex: .4, ink: PAL.ink, sw: .8 });
    for (let y = 656; y < 880; y += 14) inkLine([[x + 20, y], [x + w - 20, y]], .45, '#4A5070', 'fine', 0, .7);
    paint(rectPts(x + w / 2 - 14, 866, 28, 8), { wash: '#4A5070', ink: null });
    if (awn) { const pts = []; for (let k = 0; k <= 6; k++) pts.push([x - 10 + k * (w + 20) / 6, 600 + (k % 2) * 10]); paint([[x - 10, 572], [x + w + 10, 572], ...pts.reverse()], { wash: awn, fill: mixCol(awn, PAL.ink, .2), fillOp: 50, tex: .4, ink: PAL.ink, sw: .9 }); for (let k = 0; k < 6; k += 2) paint([[x - 10 + k * (w + 20) / 6, 572], [x - 10 + (k + 1) * (w + 20) / 6, 572], [x - 10 + (k + 1) * (w + 20) / 6, 610], [x - 10 + k * (w + 20) / 6, 600]], { wash: PAL.cream, washOp: 150, ink: null }); }
    for (let r = 0; r < 2; r++) { const lit = hash(x + r) > .5; paint(rectPts(x + 30 + r * (w - 110), 410, 50, 80), { wash: lit ? '#FFD98A' : '#3E3C6E', ink: PAL.ink, sw: .7 }); if (lit) glow(x + 55 + r * (w - 110), 450, 60, '#FFD98A', .25); inkLine([[x + 55 + r * (w - 110), 410], [x + 55 + r * (w - 110), 490]], .6, PAL.ink, 'fine', 0); }
  }
  function vendingMachine(x, t) {
    glow(x + 50, 780, 260, '#CFE8FF', .35);
    paint(rrPts(x, 640, 100, 245, 8), { wash: '#E9F1FA', fill: '#B8CBE6', fillOp: 60, tex: .3, ink: PAL.ink, sw: 1 });
    paint(rrPts(x + 10, 652, 80, 120, 4), { wash: '#F6FBFF', ink: PAL.ink, sw: .6 });
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { const cx = x + 20 + c * 20, cy = 668 + r * 36; paint(rrPts(cx - 6, cy, 12, 22, 4), { wash: [PAL.coral, PAL.mint, '#F6C85F', PAL.pink, PAL.sky][(r * 4 + c) % 5], ink: PAL.ink, sw: .4 }); dot(cx, cy + 30, 2, (r + c + Math.floor(t * 2)) % 5 ? '#8FE3D8' : '#FF9FB0'); }
    paint(rrPts(x + 20, 800, 60, 22, 4), { wash: '#39406A', ink: PAL.ink, sw: .6 });
  }
  function apartment(t) {                                // her building: warm cream walls, a wooden door, her window above
    const d = ST.door;
    paint(rectPts(d - 250, 250, 500, 640), { wash: '#C9B4A8', fill: '#A8908A', fillOp: 70, bleed: .04, tex: .5, border: .3, ink: PAL.ink, sw: 1.1 });
    paint([[d - 275, 250], [d + 275, 250], [d + 250, 215], [d - 250, 215]], { wash: '#8A6A7A', ink: PAL.ink, sw: 1 });
    for (let y = 300; y < 880; y += 34) inkLine([[d - 248, y], [d + 248, y]], .4, '#9E8A84', 'fine', 0, .5);
    // windows: hers is the one above the door
    const lit = seg(t, 28.5, 28.62), flick = lit > 0 && lit < 1 ? (Math.sin(t * 90) > 0 ? 1 : .3) : lit;
    for (const [wx, wy, mine] of [[d - 170, 300, 0], [d + 100, 300, 0], [d - 60, 330, 1], [d - 170, 460, 0], [d + 100, 460, 0]]) {
      const ww = mine ? 120 : 80, wh = mine ? 110 : 90, on = mine ? flick : (wx > d && wy < 400 ? .55 : 0);
      paint(rectPts(wx, wy, ww, wh), { wash: on > .1 ? mixCol('#3E3C6E', '#FFD98A', on) : '#3E3C6E', ink: PAL.ink, sw: .9 });
      if (on > .1) { glow(wx + ww / 2, wy + wh / 2, ww * (mine ? 2.2 : 1.2), '#FFD98A', (mine ? .5 : .25) * on); paint(rectPts(wx + 4, wy + 4, ww * .26, wh - 8), { wash: mine ? '#F29BB8' : '#C9A0DC', washOp: 150 * on, ink: null }); paint(rectPts(wx + ww * .74 - 4, wy + 4, ww * .26, wh - 8), { wash: mine ? '#F29BB8' : '#C9A0DC', washOp: 150 * on, ink: null }); }
      inkLine([[wx + ww / 2, wy], [wx + ww / 2, wy + wh]], .7, PAL.ink, 'fine', 0); paint(rectPts(wx - 8, wy + wh, ww + 16, 10), { wash: '#E6D8C8', ink: PAL.ink, sw: .7 });
      if (mine && on > .5) { const sp = seg(t, 28.68, 29.4); if (sp > 0) { sparkle(wx + ww * .58, wy + wh * .45, 22, '#FFF3C0', sp); glow(wx + ww * .58, wy + wh * .45, 40, '#FFE9A8', .5 * Math.sin(sp * Math.PI)); } if (t > 28.62) light(wx + ww / 2, wy + wh + 120, 260, '#FFD58A', .18 * on); }
    }
    // the lamp over the door
    paint(rrPts(d - 16, 548, 32, 30, 8), { wash: '#FFE7A8', ink: PAL.ink, sw: .8 });
    glow(d, 565, 170, '#FFD98A', .45);
    // steps
    paint(rectPts(d - 105, 880, 210, 15), { wash: '#B8A49A', ink: PAL.ink, sw: .8 });
    // mailbox + plant
    paint(rrPts(d + 110, 700, 50, 60, 6), { wash: '#E27A92', ink: PAL.ink, sw: .8 }); inkLine([[d + 118, 718], [d + 152, 718]], .8, PAL.ink, 'fine', 0);
    paint([[d - 170, 880], [d - 120, 880], [d - 126, 835], [d - 164, 835]], { wash: '#C98E6E', ink: PAL.ink, sw: .8 });
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * .45; paint(ellPts(d - 145 + Math.cos(a) * 20, 818 + Math.sin(a) * 26, 8, 22, 10, 0, a + Math.PI / 2), { wash: PAL.sage, ink: PAL.ink, sw: .5 }); }
  }
  // the door: the doorway (warm hall behind), and the panel swinging open (0 shut .. 1 open)
  const DOOR = { x0: 995, x1: 1145, y0: 590, y1: 880 };
  function doorOpenK(t) { return easeInOut(seg(t, ARRIVE + .05, ARRIVE + .4)) * (1 - easeIn(seg(t, B(46) + .05, SHUT))); }
  function doorway(t) {
    const { x0, x1, y0, y1 } = DOOR;
    paint(rectPts(x0, y0, x1 - x0, y1 - y0), { wash: '#FFE3B0', fill: '#F2B97A', fillOp: 70, tex: .3, ink: null });
    paint(rectPts(x0 + 30, y0 + 40, 60, 90), { wash: '#FFF1D0', ink: '#C08A5A', sw: .6 });
    inkLine([[x0, y1 - 40], [x1, y1 - 40]], .7, '#C08A5A', 'fine', 0);
  }
  function doorPanel(t) {
    const { x0, x1, y0, y1 } = DOOR, k = doorOpenK(t), w = (x1 - x0) * (1 - .78 * k), sk = 22 * k;
    if (k > .02) { glow((x0 + x1) / 2, y1 - 40, 260 * k, '#FFD58A', .4 * k); paint([[x0, y1], [x1, y1], [x1 + 160 * k, y1 + 60], [x0 - 60 * k, y1 + 60]], { fill: '#FFD58A', fillOp: 70 * k, bleed: .2, tex: .1, border: 0, ink: null }); }
    const bump = t > SHUT ? Math.sin(seg(t, SHUT, SHUT + .25) * Math.PI * 2) * 3 * (1 - seg(t, SHUT, SHUT + .25)) : 0;
    paint([[x0, y0], [x0 + w, y0 - sk], [x0 + w, y1 + sk * .4], [x0, y1]].map(([px, py]) => [px + bump, py]), { wash: '#9A6A4E', fill: '#7F5A3C', fillOp: 70, tex: .6, ink: PAL.ink, sw: 1 });
    if (w > 70) { for (const py of [y0 + 30, y0 + 160]) paint(rectPts(x0 + w * .18 + bump, py, w * .64, 100), { ink: '#5E4030', sw: .7 }); paint(ellPts(x0 + w * .82 + bump, y0 + 150, 7, 7, 8), { wash: '#F6C85F', ink: PAL.ink, sw: .5 }); }
    paint(rectPts(x0 - 12, y0 - 14, x1 - x0 + 24, 14), { wash: '#7F5A3C', ink: PAL.ink, sw: .8 });
    for (const xx of [x0 - 12, x1]) paint(rectPts(xx, y0 - 2, 12, y1 - y0 + 2), { wash: '#7F5A3C', ink: PAL.ink, sw: .8 });
  }
  function lampPost(x, t, on = 1) {
    inkLine([[x, 912], [x, 470], [x + 8, 440], [x + 44, 430]], 5.2, '#2A2748', 'marker', .3);
    inkLine([[x - 4, 912], [x - 4, 470]], 1.2, '#4E4A78', 'fine', 0, .7);
    paint(rrPts(x - 12, 890, 24, 22, 4), { wash: '#2A2748', ink: PAL.ink, sw: .7 });
    paint([[x + 26, 430], [x + 62, 430], [x + 56, 452], [x + 32, 452]], { wash: '#FFE7A8', ink: PAL.ink, sw: .8 });
    glow(x + 44, 450, 190, '#FFD98A', .5 * on);
    for (let i = 0; i < 3; i++) { const a = t * 2.1 + i * 2.1, mx = x + 44 + Math.cos(a) * 30, my = 470 + Math.sin(a * 1.3) * 18; dot(mx, my, 1.8, '#FFF3C0', .8); }
  }
  function postbox(x) {
    paint(rrPts(x - 26, 800, 52, 92, 14), { wash: '#EE8A8A', fill: '#D86A72', fillOp: 60, tex: .4, ink: PAL.ink, sw: 1 });
    paint(ellPts(x, 800, 30, 12, 14), { wash: '#F4A0A0', ink: PAL.ink, sw: .9 });
    paint(rrPts(x - 14, 824, 28, 6, 3), { wash: PAL.ink, ink: null });
    paint(rectPts(x - 5, 892, 10, 20), { wash: '#B85A62', ink: PAL.ink, sw: .6 });
  }
  const TURN = ARRIVE - .08, STEP = ARRIVE + .36;
  function streetHero(t) {
    const x = heroStreetX(t), S = ST.S, inside = t > STEP;
    const walking = (t < 25.9) || (t > B(44) && t < ARRIVE);
    const m = walking ? move('walk', t) : move('breathe', t);
    const md = mood(t, [[24.0, 'happy', null, 'smile'], [24.9, 'normal', null, 'smile'], [B(43), 'look', '?', 'o'], [26.2, 'closed', null, 'cat'], [26.62, 'happy', null, 'smile'], [ARRIVE - .2, 'normal', null, 'smile']]);
    const lookBack = smooth01(t, B(43) - .05, B(43) + .1, 26.2, 26.45), shrug = Math.sin(seg(t, 26.2, 26.62) * Math.PI);
    const o = { ...m, ...md, outfit: 'office', badge: false, sq: (m.sq || 0) + (md.take || 0) + .05 * shrug, take: 0, blush: .6,
      lookX: lerp(.55, -1, lookBack), tilt: m.tilt + lookBack * .12 - shrug * .08, ahoge: lookBack > .5 ? 'question' : 'normal',
      aL: walking ? m.aL : lerp(-1.15, -.25, shrug), aR: walking ? m.aR : lerp(-1.15, -.35, shrug), dy: (m.dy || 0) - shrug * .15,
      draw: (u, sw) => tote(u, sw, 1, Math.sin(bpOf(t) * Math.PI) * .06 * (walking ? 1 : .2)),
      handL: (u, sw) => { push(); scale(-1, 1); rotate(-(walking ? m.aL : lerp(-1.15, -.25, shrug))); sodaCan(0, .55 * u, u * .0125, { drops: .6 }); paint(ellPts(0, 0, .36 * u, .33 * u, 10), { wash: SKIN, ink: PAL.ink, sw: sw * .6 }); pop(); } };
    if (t < TURN) { hero(x, ST.g, S, o); return; }
    if (!inside) {                                         // turns to the door with a little hop and reaches for the knob
      const k = seg(t, TURN, TURN + .14), reach = easeOut(seg(t, TURN + .08, ARRIVE + .2));
      hero(x, ST.g, S, { outfit: 'office', badge: false, back: true, sq: .08 * Math.sin(k * Math.PI), dy: -.25 * Math.sin(k * Math.PI), aR: lerp(-1.15, -.25, reach), aL: -1.15, draw: (u, sw) => tote(u, sw, -1, 0) });
      return;
    }
    // going in: back to us, stepping up into the warm doorway
    const k = seg(t, STEP, 27.85), bx = lerp(heroStreetX(STEP), ST.door, k), by = lerp(ST.g, 878, k), bs = lerp(S, S * .9, k);
    clipTo(rectPts(DOOR.x0 - 6, DOOR.y0 - 200, DOOR.x1 - DOOR.x0 + 12, DOOR.y1 - DOOR.y0 + 200), () => hero(bx, by, bs, { ...move('walk', t), back: true, outfit: 'office', badge: false, noShadow: true, draw: (u, sw) => tote(u, sw, -1, 0) }));
  }
  function street(t, lt, dur) {
    const cam = streetCam(t);
    streetSky(t, cam);
    farCity(t, cam);
    camBegin(cam.x, cam.y, cam.z);
    // the street row
    paint(rectPts(-300, 520, 2900, 400), { wash: '#2E2C5E', ink: null });
    shutterShop(150, 300, '#8C8FB8', t, '#E27A92');
    vendingMachine(262, t);
    shutterShop(470, 250, '#9A8FB0', t, null);
    paint(rectPts(740, 380, 70, 520), { wash: '#262452', ink: null });
    paint(cloudPts(775, 470, 190, 160, 3, 7).map(([x, y]) => [x, y + 30]), { wash: '#2C4A5A', fill: '#1F3848', fillOp: 70, tex: .4, ink: null, curv: .4 });
    shutterShop(1340, 280, '#8C9AB8', t, PAL.sage);
    shutterShop(1640, 330, '#A08FB0', t, '#F6C85F');
    apartment(t);
    doorway(t);
    // sidewalk and the wet road
    paint([[-300, 880], [2600, 880], [2600, 915], [-300, 915]], { wash: '#57507E', fill: '#463F6E', fillOp: 70, tex: .5, ink: PAL.ink, sw: .9 });
    for (let x = -280; x < 2600; x += 90) inkLine([[x, 882], [x - 10, 913]], .5, '#3A3462', 'fine', 0, .7);
    paint([[-300, 915], [2600, 915], [2600, 1400], [-300, 1400]], { wash: '#232048', fill: '#1A1838', fillOp: 70, tex: .5, ink: PAL.ink, sw: .8 });
    paint(rectPts(-300, 915, 2900, 8), { wash: '#6A6294', ink: null });
    for (const [lx, c] of [[ST.post + 44, '#FFD98A'], [1500 + 44, '#FFD98A'], [312, '#CFE8FF'], [ST.door, '#FFD98A']]) { push(); translate(lx, 1000); scale(.35, 1.6); glow(0, 0, 150, c, .3); pop(); }
    for (let i = 0; i < 7; i++) { const px = -100 + i * 420 + hash(i) * 120; paint(ellPts(px, 975 + hash(i * 3) * 50, 110 + hash(i * 5) * 60, 12, 16), { wash: '#3A3668', washOp: 150, ink: null }); }
    // the new idea, and her
    const I = ideaAt(t), hid = I.hide || 0;
    const drawIdea = () => { if (!I.vis) return; const tr = I.trail ? tt => { const J = ideaAt(tt); return [J.x, J.y]; } : null;
      if (I.fall != null && I.fall < 1) for (let k = 1; k < 7; k++) { const J = ideaAt(t - k * .035); if (J.vis) paint(starPts(J.x, J.y, 9 - k, .4, 4, 0), { wash: '#FFF1C2', washOp: 230 - k * 30, ink: null }); }
      if (t > 24.25 && t < 24.55) sparkle(640, 360, 34, '#FFF3C0', seg(t, 24.25, 24.55));
      const sx = I.sx ?? 1; push(); translate(I.x, I.y); scale(sx, 1); translate(-I.x, -I.y);
      idea(I.x, I.y, 19, { eyes: I.eyes, sq: I.sq, rot: I.rot || 0, trail: Math.abs(sx - 1) < .05 ? tr : null, glow: 1 }); pop(); };
    const inside = t > STEP, starIn = I.zip != null && I.zip > .78, doorClip = rectPts(DOOR.x0, DOOR.y0, DOOR.x1 - DOOR.x0, DOOR.y1 - DOOR.y0);
    if (inside) { streetHero(t); if (starIn) clipTo(doorClip, drawIdea); doorPanel(t); }
    else { doorPanel(t); streetHero(t); }
    if (!starIn) drawIdea();
    if (I.zip > .5 && I.zip < 1) for (let k = 0; k < 4; k++) inkLine([[I.x - 30 - k * 26, I.y + 10 + k * 7], [I.x - 70 - k * 30, I.y + 20 + k * 9]], 1.2, '#FFF3C0', 'fine', 0, .7 * (1 - k / 4));
    lampPost(ST.post, t); lampPost(1500, t); postbox(ST.box);
    if (hid > .3 && t < 26.3) {                            // it is not very good at hiding: light spills out around the pole
      const k = hid * (1 - seg(t, 26.2, 26.3));
      glow(ST.post, 800, 70, '#FFE9A8', .45 * k); glow(ST.post, 800, 26, '#FFF6D8', .5 * k);
      for (const sd of [-1, 1]) for (let q = 0; q < 2; q++) inkLine([[ST.post + sd * (32 + q * 8), 772 - q * 10], [ST.post + sd * (40 + q * 8), 764 - q * 10]], 1.1, '#FFF3C0', 'fine', 0, .8 * k);
    }
    const sh = t - SHUT;
    if (sh > 0 && sh < .7) for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + (k - 2.5) * .45; sparkle(ST.door + 60 + Math.cos(a) * sh * 90, 760 + Math.sin(a) * sh * 90, 10, '#FFF3C0', sh / .7); }
    camEnd();
    // foreground: overhanging leaves drifting past faster than the street (the nearest parallax layer)
    camBegin(960 + (cam.x - 960) * 1.5, 540, 1.3);
    for (const [lx, ly, sc, dir] of [[380, 175, 1, 1], [1420, 160, 1.15, -1], [2420, 180, .9, 1]]) {
      const sway = Math.sin(t * 1.3 + lx) * .04, br = [];
      for (let k = 0; k <= 8; k++) { const u = k / 8; br.push([lx + dir * (u - .3) * 420 * sc, ly - 60 + Math.sin(u * Math.PI) * 110 * sc + u * 30]); }
      push(); translate(lx, ly - 60); rotate(sway); translate(-lx, -(ly - 60));
      inkLine(br, 2.6, '#1A2238', 'marker', .5);
      for (let k = 1; k < 16; k++) {
        const u = k / 16, i = Math.min(7, Math.floor(u * 8)), f = u * 8 - i, bx = lerp(br[i][0], br[i + 1][0], f), by = lerp(br[i][1], br[i + 1][1], f), sd = k % 2 ? 1 : -1;
        const a = Math.PI / 2 + sd * .7 + (hash(lx + k) - .5) * .5, L = (30 + hash(k * 3.3 + lx) * 16) * sc;
        paint(ellPts(bx + Math.cos(a) * L * .6, by + Math.sin(a) * L * .6, L * .62, L * .26, 12, 0, a), { wash: k % 3 ? '#20344A' : '#26405A', fill: '#162436', fillOp: 60, tex: .3, ink: '#141B30', sw: .6 });
      }
      pop();
    }
    camEnd();
    const rk = seg(t, 27.9, 29.4);
    if (rk > 0) rainStreaks(t, { x: 0, y: 0, w: W, h: H }, Math.round(10 + 30 * rk), '#C9D6F2', .22 * rk, { fall: true });
    vignette(.26, '#10142E');
  }

  // =====================================================================================================
  // (stubs for the other shots, filled in below)

  chapter('home', 0, 28.956, [[0, intro], [B(16), corridor], [B(24), badge], [B(32), can], [B(40), street]]);
})();
