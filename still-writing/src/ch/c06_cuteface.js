// c06_cuteface: "6 · 可爱的脸" (135.156–153.756). Pre-chorus 2: warmer and more assured, building into chorus 2.
// Shots: untangle (a giant tangle unwinds into one ribbon that ties a bow on a little app-icon gift box)
//        → cuteFaces (桃桃 hops along a row of stern grey things, sticking on cute faces; each turns colourful)
//        → noManifesto (a grand stage unrolls an endless declaration; she sticks a tiny heart note on her monitor)
//        → again (the finished app shines; high five, sleeves up, a ↻ arrow drawn around them: once more!)
(() => {
  const B = n => beatT(n);                                     // beat 225 = 135.156, beat 256 = 153.756
  const SKN = '#FCE5D4', BLUSH = '#F59CA8';
  const RIB = '#F29BB8', RIB_BK = '#DE7496', RIB_LT = '#FCD6E3';

  // ---------- small shared helpers ----------
  // world position of a chibi's hand centre (side -1 left arm, 1 right arm), replicating chibi()'s transforms
  function handAt(x, y, s, o, side) {
    const sq = (o.sq || 0) + (o.take || 0), fl = o.flip ? -1 : 1, a = side < 0 ? (o.aL ?? -1.2) : (o.aR ?? -1.2), L = 1.87 * s;
    let hx = side * .95 * s + side * L * Math.cos(a), hy = -3.95 * s - L * Math.sin(a);
    hx *= fl * (o.sx ?? 1) * (1 + sq * .5); hy *= (o.sy ?? 1) * (1 - sq);
    const r = o.rot || 0, c = Math.cos(r), sn = Math.sin(r);
    return [x + hx * c - hy * sn, y + ((o.dy || 0) + (o.bob || 0)) * s + hx * sn + hy * c];
  }
  const handDot = (p, s, sw) => paint(ellPts(p[0], p[1], .37 * s, .35 * s, 12), { wash: SKN, ink: PAL.ink, sw: sw * .6 });
  const fly = (x0, y0, vx, vy, age, g = 2400) => [x0 + vx * age, y0 + vy * age + .5 * g * age * age];
  // resample a polyline to n evenly spaced points
  function evenPts(pts, n) {
    const d = [0]; for (let i = 1; i < pts.length; i++) d.push(d[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const L = d[d.length - 1] || 1, out = []; let j = 1;
    for (let k = 0; k < n; k++) {
      const s = k / (n - 1) * L; while (j < pts.length - 1 && d[j] < s) j++;
      const f = (s - d[j - 1]) / ((d[j] - d[j - 1]) || 1); out.push([lerp(pts[j - 1][0], pts[j][0], f), lerp(pts[j - 1][1], pts[j][1], f)]);
    }
    return out;
  }
  const at = (P, v) => { const f = clamp(v) * (P.length - 1), i = Math.min(P.length - 2, Math.floor(f)), k = f - i; return [lerp(P[i][0], P[i + 1][0], k), lerp(P[i][1], P[i + 1][1], k)]; };
  const nrmAt = (P, v) => { const f = clamp(v) * (P.length - 1), i = Math.min(P.length - 2, Math.floor(f)), dx = P[i + 1][0] - P[i][0], dy = P[i + 1][1] - P[i][1], l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l]; };

  // the little app on her screen: a soft window with 桃桃 waving in it; k 0..1 how finished/polished it is
  function appScreen(r, t, k = 1, o = {}) {
    paint(rectPts(r.x - 4, r.y - 4, r.w + 8, r.h + 8), { grad: ['#FDF1F4', '#EEF7F3', Math.PI * .35], ink: null });
    const pad = r.w * .05, wx = r.x + pad, wy = r.y + pad * .8, ww = r.w - 2 * pad, wh = r.h - pad * 1.6, u = ww / 400;
    appWindow(wx, wy, ww, wh, { sw: clamp(u, .5, 1.2), bar: PAL.pinkLt, content: rc => {
      const lp = { x: rc.x, y: rc.y, w: rc.w * .42, h: rc.h };
      paint(rrPts(lp.x, lp.y, lp.w, lp.h, 12 * u), { wash: '#FFE8EF', ink: null });
      glow(lp.x + lp.w / 2, lp.y + lp.h * .55, lp.w * .6, PAL.pink, .25 * k);
      const wave = Math.sin(t * 8) * .3;
      momo(lp.x + lp.w / 2, lp.y + lp.h - 6 * u, lp.h * .082, { digital: .8 * k, eyes: o.momoEyes || 'happy', mouth: 'open', aR: .5 + wave, aL: -1.1, noShadow: true, dy: -Math.abs(Math.sin(bpOf(t) * Math.PI)) * .3 * k });
      const cx0 = lp.x + lp.w + 10 * u, cw = rc.w - lp.w - 10 * u;
      for (let i = 0; i < 3; i++) {                                     // three soft cards with a tick, a heart, a star
        const cy0 = rc.y + i * rc.h / 3 + 3 * u, ch = rc.h / 3 - 8 * u, pp = o.pop != null ? backOut(clamp(o.pop * 3 - i * .5)) : 1;
        push(); translate(cx0 + cw / 2, cy0 + ch / 2); scale(Math.max(.01, pp)); translate(-(cx0 + cw / 2), -(cy0 + ch / 2));
        paint(rrPts(cx0, cy0, cw, ch, 10 * u), { wash: ['#FFF4D6', '#E4F4EC', '#EFE8FA'][i], ink: PAL.ink, sw: .5 * clamp(u, .6, 1.5) });
        const ix = cx0 + ch * .5, iy = cy0 + ch / 2, ir = ch * .28;
        if (i === 0) paint(ellPts(ix, iy, ir, ir, 14), { wash: '#8FD19E', ink: null }), inkLine([[ix - ir * .45, iy], [ix - ir * .1, iy + ir * .4], [ix + ir * .5, iy - ir * .4]], clamp(u * .9, .4, 2), '#FFFFFF', 'marker', 0);
        else if (i === 1) paint(heartPts(ix, iy, ir * 1.1), { wash: '#F27D9A', ink: null });
        else paint(starPts(ix, iy, ir * 1.15, .45, 5), { wash: '#F6C85F', ink: null });
        for (let q = 0; q < 2; q++) paint(rrPts(ix + ch * .5, iy - ch * .2 + q * ch * .24, (cw - ch * 1.3) * (q ? .6 : .95) * (i === 2 && q ? k : 1), ch * .12, ch * .06), { wash: ['#E8C98A', '#9CCFB6', '#C9B8EA'][i], ink: null });
        pop();
      }
    } });
  }
  // a little cream ♪ (readable on dark backgrounds too)
  function noteGlyph(x, y, s, a = 1, flip = 1) {
    if (a <= .02) return;
    fadeIn(a, () => {
      push(); translate(x, y); rotate(-.15 * flip); scale(s * flip, s);
      inkLine([[6, -1], [6, -27], [16, -20]], 3.2, PAL.ink, 'marker', .3); inkLine([[6, -1], [6, -27], [16, -20]], 1.8, '#FFF1C8', 'marker', .3);
      paint(ellPts(0, 0, 8, 6, 12, 0, -.4), { wash: '#FFF1C8', ink: PAL.ink, sw: .8 });
      pop();
    });
  }
  // A flat ribbon along pts. wFn(i) width, twFn(i) twist angle: the visible width is |cos| and the back face shows
  // where cos < 0. Each run of one face is one painted band, so the twists pinch like real satin ribbon.
  function ribbon(pts, wFn, twFn, o = {}) {
    const n = pts.length; if (n < 2) return;
    const Lp = [], Rp = [], sg = [];
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
      let tx = b[0] - a[0], ty = b[1] - a[1]; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
      const c = Math.cos(twFn(i)), hw = wFn(i) * Math.max(.07, Math.abs(c)) / 2;
      Lp.push([pts[i][0] - ty * hw, pts[i][1] + tx * hw]); Rp.push([pts[i][0] + ty * hw, pts[i][1] - tx * hw]); sg.push(c >= 0);
    }
    let i0 = 0;
    for (let i = 1; i <= n; i++) {
      if (i < n && sg[i] === sg[i0]) continue;
      const i1 = Math.min(n - 1, i), poly = [...Lp.slice(i0, i1 + 1), ...Rp.slice(i0, i1 + 1).reverse()];
      paint(poly, { wash: sg[i0] ? (o.cF || RIB) : (o.cB || RIB_BK), ink: PAL.ink, sw: o.sw ?? .8 });
      if (sg[i0] && i1 - i0 > 3 && o.sheen !== false) inkLine(pts.slice(i0 + 1, i1).map((p, k) => { const j = i0 + 1 + k; return [lerp(p[0], Lp[j][0], .35), lerp(p[1], Lp[j][1], .35)]; }), (o.sw ?? .8) * 1.1, o.cL || RIB_LT, 'marker', 0, .8);
      i0 = i;
    }
  }
  // a bow: two loops and two notched tails around a knot at (x, y); k 0..1 grows it (use elasticOut outside)
  function bow(x, y, s, k, o = {}) {
    if (k <= .01) return;
    push(); translate(x, y); rotate(o.rot || 0); scale(s * k);
    const cF = o.col || RIB, cD = o.colDk || RIB_BK, sw = clamp(s * k, .5, 1.6);
    for (const sd of [-1, 1]) {                                  // tails
      paint([[sd * 4, 4], [sd * 30, 46], [sd * 22, 58], [sd * 16, 48], [sd * 6, 60], [sd * 0, 38], [-sd * 6, 8]], { wash: cD, ink: PAL.ink, sw });
    }
    for (const sd of [-1, 1]) {                                  // loops
      const wig = Math.sin(T * 7 + sd) * 2;
      paint([[0, 0], [sd * 22, -26 + wig], [sd * 58, -34 + wig], [sd * 74, -12], [sd * 62, 12], [sd * 30, 12]], { wash: cF, ink: PAL.ink, sw, curv: .45 });
      paint([[sd * 10, -2], [sd * 30, -14 + wig], [sd * 50, -16 + wig], [sd * 42, 0], [sd * 24, 4]], { wash: cD, washOp: 170, ink: null, curv: .5 });
      inkLine([[sd * 20, -22 + wig], [sd * 48, -28 + wig]], sw * .9, RIB_LT, 'marker', .4, .8);
    }
    paint(rrPts(-13, -12, 26, 24, 8), { wash: cF, ink: PAL.ink, sw });
    inkLine([[-5, -7], [4, -8]], sw, RIB_LT, 'marker', 0, .8);
    pop();
  }
  // an app-icon gift box standing on (x, y) (bottom centre), 210 px at s = 1
  // o: { face: 0 sleepy .. 1 awake-happy, band: 0..1 ribbon bands wipe in, bowK, glint }
  function giftIcon(x, y, s, o = {}) {
    const w = 210 * s, h = 210 * s, x0 = x - w / 2, y0 = y - h, sw = clamp(s * 1.2, .6, 1.8);
    paint(ellPts(x, y + 4, w * .62, 16 * s, 16), { fill: PAL.ink, fillOp: 60, bleed: .2, tex: .2, ink: null });
    paint(rrPts(x0, y0, w, h, 46 * s, 1), { grad: ['#FFD2B4', '#F6A3C0', Math.PI * .3], ink: PAL.ink, sw: sw * 1.1 });
    paint(rrPts(x0 + 12 * s, y0 + 12 * s, w - 24 * s, h * .42, 34 * s), { wash: '#FFFFFF', washOp: 40, ink: null });
    // face
    const fx = x - 22 * s, fy = y - 82 * s, k = clamp(o.face ?? 0);
    for (const sd of [-1, 1]) {
      const ex = fx + sd * 34 * s;
      if (k < .5) inkLine([[ex - 11 * s, fy + 2 * s], [ex, fy + 7 * s], [ex + 11 * s, fy + 2 * s]], sw * 1.2, PAL.ink, 'ink', .5);
      else inkLine([[ex - 12 * s, fy + 5 * s], [ex, fy - 8 * s], [ex + 12 * s, fy + 5 * s]], sw * 1.4, PAL.ink, 'ink', .5);
      paint(ellPts(ex + sd * 6 * s, fy + 22 * s, 13 * s, 7 * s, 12), { fill: BLUSH, fillOp: 120 + 100 * k, bleed: .2, ink: null });
    }
    if (k < .5) inkLine([[fx - 6 * s, fy + 22 * s], [fx + 6 * s, fy + 22 * s]], sw, PAL.ink, 'ink', 0);
    else paint([[fx - 13 * s, fy + 16 * s], [fx + 13 * s, fy + 16 * s], [fx + 8 * s, fy + 28 * s], [fx, fy + 31 * s], [fx - 8 * s, fy + 28 * s]], { wash: '#9B3B4F', ink: PAL.ink, sw: sw * .7, curv: .4 });
    // ribbon bands: vertical at the right third, horizontal at the top third (wipe out from the knot)
    const bk = clamp(o.band ?? 0), bx = x + 58 * s, by = y0 + 48 * s, bw = 30 * s;
    if (bk > .01) {
      paint(rectPts(bx - bw / 2, by - (by - y0) * bk, bw, (by - y0 + (y - by)) * bk + 1), { wash: RIB, ink: PAL.ink, sw: sw * .8 });
      paint(rectPts(bx - (bx - x0) * bk, by - bw / 2, (bx - x0 + (x0 + w - bx)) * bk + 1, bw), { wash: RIB, ink: PAL.ink, sw: sw * .8 });
    }
    if (o.glint) { const g = clamp(o.glint); inkLine([[x0 + w * lerp(-.2, 1.1, g), y0 + 8], [x0 + w * lerp(-.45, .85, g), y0 + h - 8]], 7 * s, '#FFFFFF', 'marker', 0, .5 * Math.sin(g * Math.PI)); }
    return [bx, by];
  }

  // =====================================================================================================
  // 1) untangle — 我想把复杂的事情 做得简单一点
  //    A huge tangle (cables, yarn, ink scribble, gears) fills the frame. 桃桃 spots a loose pink end; they grab it and
  //    tug on the beat; the ball spins and unwinds into one clean ribbon (the other strands straighten alongside it,
  //    then zip into it); at the core is a little app-icon gift box, and the ribbon's end ties a bow on it.
  // =====================================================================================================
  const U_A = .1;                                   // the main strand's u in [0, U_A] is the loose end they hold
  const BALL = { x: 1340, R: 390, floor: 880, rMin: .3 };
  const GS = 1.12, KNOT = [BALL.x + 58 * GS, BALL.floor - 162 * GS];   // gift icon scale; the bow sits where its bands cross
  const STR = [                                     // strands of the tangle (unit-ball yarn wraps)
    { wraps: 8, a0: 1.55, a1: .85, fa: 5.3, b0: .4, ph: 0, rp: .8, col: RIB, w: 13, wob: .05, off: 0, lag: 0, n: 900 },
    { wraps: 5, a0: 1.3, a1: .8, fa: 3.7, b0: 2.1, ph: 1.3, rp: .9, col: '#6F7A99', w: 17, wob: .1, off: 27, lag: .16, n: 520 },
    { wraps: 9, a0: 1.75, a1: 1.0, fa: 6.1, b0: 4.0, ph: 2.2, rp: .75, col: '#A89CCB', w: 10, wob: .07, off: -25, lag: .1, n: 900 },
    { wraps: 10, a0: 1.4, a1: 1.1, fa: 4.4, b0: 5.3, ph: .7, rp: .75, col: '#3E3656', w: 4.5, wob: .1, curl: .085, curls: 64, off: 46, lag: .22, n: 1500 },
  ];
  const GEARS = [[-.3, -.08, .95, 70, 9], [.72, -.25, .64, 58, 8], [.12, .8, .58, 46, 7], [.28, -.55, .79, 38, 6]];   // screen-facing dir, radius px, teeth
  const cross3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const norm3 = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const axisM = (ax, an) => { const [x, y, z] = norm3(ax), c = Math.cos(an), s = Math.sin(an), C = 1 - c; return [[c + x * x * C, x * y * C - z * s, x * z * C + y * s], [y * x * C + z * s, c + y * y * C, y * z * C - x * s], [z * x * C - y * s, z * y * C + x * s, c + z * z * C]]; };
  const mulM = (A, Bm) => A.map(r => [0, 1, 2].map(j => r[0] * Bm[0][j] + r[1] * Bm[1][j] + r[2] * Bm[2][j]));
  const apM = (M, p) => [M[0][0] * p[0] + M[0][1] * p[1] + M[0][2] * p[2], M[1][0] * p[0] + M[1][1] * p[1] + M[1][2] * p[2], M[2][0] * p[0] + M[2][1] * p[1] + M[2][2] * p[2]];
  function yarnRaw(st, v) {                         // a point of strand st at v (0 outer end .. 1 core), unit ball
    const th = v * st.wraps * TAU + st.ph, al = st.a0 + st.a1 * Math.sin(v * st.fa + st.ph), be = st.b0 + v * st.wraps * 2.39996;
    const ca = Math.cos(al), sa = Math.sin(al), cb = Math.cos(be), sb = Math.sin(be), c = Math.cos(th), s = Math.sin(th);
    let x = c * sb + s * ca * cb, y = -c * cb + s * ca * sb, z = -s * sa;
    x += st.wob * Math.sin(v * 41 + st.ph * 3) + .045 * Math.sin(v * 173 + st.ph * 7); y += st.wob * Math.sin(v * 53 + st.ph * 5) + .045 * Math.sin(v * 151 + st.ph * 2); z += st.wob * Math.sin(v * 31 + st.ph);
    if (st.curl) { const q = v * st.curls * TAU; x += st.curl * Math.cos(q); y += st.curl * Math.sin(q); z += st.curl * .5 * Math.sin(q * .5); }
    const r = lerp(1, BALL.rMin, Math.pow(v, st.rp)) * (1 + .2 * Math.pow(Math.max(0, Math.sin(v * 19 + st.ph * 4)), 8));   // a few loops stick out
    return [x * r, y * r, z * r];
  }
  // the ribbon's outer end faces the characters (lower left, towards us)
  const ALIGN = (() => {
    const a = norm3(yarnRaw(STR[0], 0)), b = norm3([-.84, .42, .35]), A0 = axisM(cross3(a, b), Math.acos(clamp(a[0] * b[0] + a[1] * b[1] + a[2] * b[2], -1, 1)));
    // then spin about the exit so the outer wrap carries on the way the pulled ribbon comes in (tangent, no kink)
    let best = null, bs = -9;
    for (let k = 0; k < 90; k++) {
      const Mk = mulM(axisM(b, k / 90 * TAU), A0), p0 = apM(Mk, yarnRaw(STR[0], 0)), p1 = apM(Mk, yarnRaw(STR[0], .004));
      const tx = p1[0] - p0[0], ty = p1[1] - p0[1], tz = p1[2] - p0[2], l = Math.hypot(tx, ty, tz) || 1, sc = (tx * .96 - ty * .28) / l - Math.abs(tz) / l * .3;
      if (sc > bs) { bs = sc; best = Mk; }
    }
    return best;
  })();

  // a gear: toothed disc
  function gear(x, y, r, teeth, rot, col = '#9AA0B4', k = 1) {
    const pts = [];
    for (let i = 0; i < teeth * 4; i++) { const a = rot + i / (teeth * 4) * TAU, q = i % 4, rr = q === 1 || q === 2 ? r : r * .8; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
    paint(pts, { wash: col, fill: mixCol(col, PAL.ink, .3), fillOp: 60, tex: .5, ink: PAL.ink, sw: clamp(r / 50, .5, 1.2) });
    paint(ellPts(x, y, r * .5, r * .5, 16), { wash: mixCol(col, '#FFFFFF', .25), ink: PAL.ink, sw: .6 });
    paint(ellPts(x, y, r * .18, r * .18, 10), { wash: mixCol(col, PAL.ink, .5), ink: PAL.ink, sw: .5 });
    for (let i = 0; i < 4; i++) { const a = rot + i / 4 * TAU + .4; dot(x + Math.cos(a) * r * .34, y + Math.sin(a) * r * .34, r * .06, mixCol(col, PAL.ink, .5)); }
  }

  // a small untidy knot (a pretzel loop with loose ends), drawn like the strands
  function knotGlyph(x, y, r, rot, col, w, k = 1) {
    if (k <= .02) return;
    const pts = [];
    for (let i = 0; i <= 26; i++) { const q = i / 26 * TAU * 1.08 - .3; pts.push([Math.sin(q) * 1.25 * r, Math.sin(q) * Math.cos(q) * r * 1.1 - .25 * r * Math.sin(q * .5)]); }
    pts.unshift([-1.9 * r, .5 * r]); pts.push([1.9 * r, .55 * r]);
    const P = pts.map(([a, b]) => [x + (a * Math.cos(rot) - b * Math.sin(rot)) * k, y + (a * Math.sin(rot) + b * Math.cos(rot)) * k]);
    inkLine(P, (w + 3.5) / 4.2, PAL.ink, 'marker', .4); inkLine(P, w / 4.2, col, 'marker', .4);
  }
  // a cable plug head pointing along (dx, dy)
  function plug(x, y, dx, dy, s = 1) {
    const a = Math.atan2(dy, dx);
    push(); translate(x, y); rotate(a); scale(s);
    paint(rrPts(-4, -15, 46, 30, 8), { wash: '#E7E3EE', fill: '#B9B3C9', fillOp: 70, tex: .4, ink: PAL.ink, sw: .9 });
    paint(rectPts(-10, -9, 10, 18), { wash: '#8C8FA3', ink: PAL.ink, sw: .6 });
    for (const py of [-8, 8]) paint(rectPts(42, py - 3, 20, 6), { wash: '#D9C27A', ink: PAL.ink, sw: .6 });
    pop();
  }

  function untangle(t, lt) {
    const tSpot = B(226), tGrab = B(227), tYank = B(228), tDone = 138.4, tBow = B(231);
    const WZ = .075;                                                  // width of the unwinding zone (in u)
    const f = t < tYank ? U_A : U_A + (1 + WZ - U_A) * (.08 * easeOut(seg(t, tYank, tYank + .25)) + .92 * easeInOut(seg(t, tYank + .05, tDone)));
    const prog = clamp((f - U_A) / (1 - U_A));
    const mz = kf(t, [[137.55, U_A], [138.75, 1 + WZ]], easeInOut);     // the zip-merge front of the other strands
    const warm = ease(seg(t, tYank, tBow));
    const yankA = t - tYank;

    // ---- camera: the tangle fills the frame, then we pull back as it resolves, then drift in to the bow ----
    const pull = easeInOut(seg(t, tYank + .1, tDone + .1)), push2 = easeInOut(seg(t, tDone - .2, 139.6));
    const sh = shakeXY(t, yankA > 0 ? 10 * Math.exp(-yankA * 7) : 0);
    camBegin(lerp(lerp(1010, 1000, ease(lt / 1.8)), 960, pull) + 40 * push2 + sh[0], lerp(545, 540, pull) + 80 * push2 + sh[1], lerp(lerp(1.13, 1.17, ease(lt / 1.8)), 1.0, pull) + .11 * push2, 0);

    // ---- background: a soft paper stage that warms up as the knot resolves ----
    const top = mixCol('#CFC8DA', '#F7D3DC', warm), bot = mixCol('#E6DEE3', '#FDE8D6', warm);
    paint(rectPts(-500, -400, W + 1000, 1300), { grad: [top, bot, Math.PI / 2], ink: null });
    glow(BALL.x - 60, 520, 900, mixCol('#FFFFFF', PAL.lamp, warm), .25 + .25 * warm);
    paint([[-500, 740], [W + 500, 740], [W + 500, H + 500], [-500, H + 500]], { wash: mixCol('#DCD2DA', '#F5D9C8', warm), fill: mixCol('#B9AFC2', '#E8B9A5', warm), fillOp: 60, bleed: .05, tex: .5, border: .3, ink: null });
    inkLine([[-500, 742], [W + 500, 742]], .6, mixCol('#9C93AA', '#C99A86', warm), 'fine', 0, .6);
    for (let i = 0; i < 12; i++) {                                    // drifting soft lights
      const bx = (hash(i * 3.1) * 2400 - 240 + t * (8 + 10 * hash(i))) % 2400 - 240, by = 90 + hash(i * 7.7) * 560;
      bokeh(bx, by + Math.sin(t * .8 + i) * 12, 22 + 26 * hash(i * 1.9), [PAL.pinkLt, '#FFE3B8', PAL.cream, PAL.lilac][i % 4], (.25 + .35 * warm) * (.6 + .4 * Math.sin(t * 1.3 + i * 2)));
    }

    // ---- the characters' poses first: their hands carry the ribbon ----
    const grabK = ease(seg(t, tGrab - .32, tGrab - .02));
    const step = ease(seg(t, tYank, tDone));
    const lean = kf(t, [[tGrab - .3, 0], [tGrab - .05, .1], [tGrab + .2, .02], [tYank - .3, .02], [tYank - .05, .15], [tYank + .1, -.34], [tYank + .45, -.22], [tDone - .1, -.25], [tDone + .12, -.4], [tDone + .55, -.06], [tBow + .3, 0]]);
    const tug = t > tYank + .3 && t < tDone ? -.07 * pulse(t, 4) : 0;
    const hs = 33, hxp = 515 - 36 * step, ms = 26, mxp = 350 - 30 * step;
    const hMood = mood(t, [[130, 'normal'], [tSpot + .12, 'normal', null, 'o'], [tGrab, 'normal', null, 'grin'], [tYank, 'happy', null, 'grin'], [tBow - .05, 'sparkle', 'spark', 'open']]);
    const idleH = move('breathe', t, 1), idleM = move('bounce', t, 2);
    const hO = { outfit: 'home', ...hMood, mouth: hMood.mouth || 'smile', brows: t > tGrab - .1 && t < tDone ? 'angry' : null, blush: .7,
      lookX: t < tSpot + .15 ? .8 : t < tGrab ? .5 : .9, lookY: t < tSpot + .15 ? -.55 : t < tGrab ? .6 : -.1,
      rot: lean + tug + idleH.tilt * (1 - grabK), sq: idleH.sq + (t > tYank && t < tYank + .25 ? -.08 * Math.sin(seg(t, tYank, tYank + .25) * Math.PI) : 0) + (t > tYank - .3 && t < tYank ? .06 * Math.sin(seg(t, tYank - .3, tYank) * Math.PI) : 0),
      aL: lerp(-1.15, -2.9, grabK), aR: lerp(-1.15, -.22, grabK), tilt: -lean * .5 + (t < tGrab ? .08 * seg(t, tSpot, tSpot + .3) : 0),
      ahoge: t > tYank ? 'perk' : 'normal' };
    if (t > tBow - .05) { const c = backOut(seg(t, tBow - .05, tBow + .25)); hO.aL = lerp(-2.9, .4, c) + .12 * Math.sin(t * 9); hO.dy = -.8 * Math.sin(Math.PI * seg(t, tBow - .05, tBow + .45)); }
    const spotK = seg(t, tSpot - .05, tSpot + .15), mHop = t > tSpot - .05 && t < tSpot + .55 ? -1.3 * Math.sin(Math.PI * seg(t, tSpot - .05, tSpot + .55)) : 0;
    const mMood = mood(t, [[130, 'normal'], [tSpot, 'sparkle', '!', 'open'], [tGrab, 'normal', null, 'cat'], [tYank, 'happy', null, 'open'], [tDone + .1, 'x', 'sweat', 'o'], [tBow - .05, 'star', 'heart', 'grin']]);
    const fallK = seg(t, tDone, tDone + .25), sitK = t > tDone && t < tBow + .1 ? 1 : 0;
    const mO = { ...mMood, blush: .8, lookX: t < tSpot ? .7 : .9, lookY: t < tSpot ? -.5 : t < tGrab ? .5 : 0,
      rot: lean * .9 + tug * 1.2 + (t < tGrab ? idleM.rot * .5 : 0) - .1 * Math.sin(Math.PI * fallK) * (1 - seg(t, tBow - .1, tBow + .2)),
      dy: (t < tGrab ? mHop + idleM.dy * .3 : 0) + (t > tBow - .05 ? -1.6 * Math.sin(Math.PI * seg(t, tBow - .05, tBow + .5)) : 0) + .5 * fallK * sitK,
      sq: (t < tGrab ? idleM.sq : 0) + .1 * Math.exp(-Math.max(0, t - tDone - .25) * 8) * (t > tDone + .25 ? 1 : 0),
      aL: lerp(t < tSpot ? -1.1 : -.9, -2.9, grabK), aR: lerp(t < tSpot - .05 ? -1.1 : lerp(-1.1, -.45, spotK), -.22, grabK), tilt: .1 * (1 - grabK) };
    if (t > tBow - .05) { const c = backOut(seg(t, tBow - .05, tBow + .25)); mO.aL = lerp(-2.9, .45, c) + .15 * Math.sin(t * 10); }
    const mEm = [mO.emote, mO.emoteK]; mO.emote = null; mO.seed = 3; hO.seed = 1;   // 桃桃's emotes go on her left (the hero would hide them)
    const hH = [handAt(hxp, 880, hs, hO, -1), handAt(hxp, 880, hs, hO, 1)], mH = [handAt(mxp, 880, ms, mO, -1), handAt(mxp, 880, ms, mO, 1)];

    // ---- the clean path: tail → 桃桃's hands → her hands (the held part, u 0..U_A), then the swoop to the knot ----
    const tail = [[mxp - 170, 882], [mxp - 110, 879], [mxp - 50, 862]];
    const held = t > tBow - .05 ? evenPts(smoothPts([...tail.slice(0, 2), [mxp - 20, 872], mH[1], [lerp(mH[1][0], hH[1][0], .5), Math.max(mH[1][1], hH[1][1]) + 26], hH[1]], .35, false), 40)
      : evenPts(smoothPts([...tail, mH[0], mH[1], hH[0], hH[1]], .35, false), 40);
    const h1 = hH[1];
    const swoop = evenPts(smoothPts([h1, [h1[0] + 120, h1[1] - 8], [760, 722], [880, 668], [965, 575], [935, 455], [835, 450], [790, 530], [860, 615], [1000, 640], [1130, 600], [1250, 572], [KNOT[0] - 60, KNOT[1] - 50], KNOT], .5, false), 270);

    // ---- the ball: spins as it unwinds, shrinks from the outside in, rests on the floor ----
    const spin = -prog * 11.5, tumble = prog * 2.2 + (t < tYank ? .04 * Math.sin(t * 2.1) : 0);
    const R = BALL.R * (1 + (t < tYank ? .012 * Math.sin(t * 3.3) + .02 * pulse(t, 7) : 0)), jolt = yankA > 0 ? -34 * Math.sin(Math.PI * seg(yankA, 0, .3)) : 0;
    const rOut = lerp(1, BALL.rMin, Math.pow(prog, STR[0].rp));
    const cx = BALL.x + jolt, cy = BALL.floor - R * rOut * .98;
    const MS = mulM(axisM([0, 0, 1], spin), axisM([0, 1, 0], tumble)), M = mulM(MS, ALIGN);
    const toW = p => { const q = apM(M, p); return [cx + R * q[0], cy + R * q[1], q[2]]; };
    const exit0 = (() => { const q = apM(ALIGN, yarnRaw(STR[0], 0)); return [BALL.x + BALL.R * q[0], BALL.floor - BALL.R * .98 + BALL.R * q[1]]; })();
    const dangle = evenPts(smoothPts([[600, 877], [700, 882], [820, 879], [920, 858], [exit0[0] - 30, exit0[1] + 40], exit0], .5, false), 40);

    // ---- every strand's points: world position, clean-ness k, depth z ----
    const strands = STR.map((st, si) => {
      const P = [];
      if (si === 0) for (let i = 0; i < 40; i++) {                   // the held part of the ribbon: lifts off the floor into their hands
        const u = i / 39, kk = ease(clamp((t - (tGrab - .34) - .14 * u) / .22)), a = dangle[i], b = held[i];
        P.push({ p: [lerp(a[0], b[0], kk), lerp(a[1], b[1], kk) - Math.sin(Math.PI * kk) * 40 * (1 - u)], k: kk, z: 2, u: u * U_A });
      }
      const wz = WZ / (1 - U_A), fm = (f - U_A) / (1 - U_A), n = st.n, mv = (mz - U_A) / (1 - U_A);
      const fv = si === 0 ? fm : (fm - st.lag) / (1 - st.lag) * (1 + wz);   // the other strands start late but finish with it
      for (let i = si === 0 ? 1 : 0; i <= n; i++) {
        const v = i / n, kk = t < tYank || fv <= 0 ? 0 : ease(clamp((fv - v) / wz)), mp = toW(yarnRaw(st, v));
        let p = mp;
        if (kk > 0) {
          const c = at(swoop, v); let q = c;
          if (si > 0) { const nm = nrmAt(swoop, v), m = 1 - ease(clamp((mv - v) / .16)); q = [c[0] + nm[0] * st.off * m, c[1] + nm[1] * st.off * m]; }
          p = [lerp(mp[0], q[0], kk), lerp(mp[1], q[1], kk)];
        }
        P.push({ p, k: kk, z: mp[2], u: U_A + v * (1 - U_A) });
      }
      return P;
    });

    // ---- the ball: back wraps, a soft core mass, the app icon at the core, front wraps (depth sorted) ----
    const chunks = [];
    strands.forEach((P, si) => {
      const CH = si === 3 ? 26 : 16, i0 = P.findIndex(q => q.k < .02); if (i0 < 0) return;
      for (let i = i0; i < P.length - 1; i += CH) {
        const sg = P.slice(i, Math.min(P.length, i + CH + 1)); if (sg.length < 2) continue;
        let z = 0; for (const q of sg) z += q.z; z /= sg.length;
        chunks.push({ z, si, pts: sg.map(q => q.p) });
      }
    });
    // bits stuck in the tangle: gears, knots and a plug; each pops off as the unwinding reaches it
    const bits = [
      ...GEARS.map(([gx, gy, gz, gr, gt], gi) => ({ kind: 'gear', dir: norm3([gx, gy, gz]), r: gr, teeth: gt, tPop: tYank + .22 + gi * .24, id: gi })),
      ...[[-.05, -.8, .6, '#6F7A99', 17], [-.62, .45, .64, '#A89CCB', 10], [.6, .48, .64, '#6F7A99', 17], [.55, -.6, .58, '#A89CCB', 10], [-.35, .7, .62, '#3E3656', 5]].map(([x, y, z, c, w], i) => ({ kind: 'knot', dir: norm3([x, y, z]), col: c, w, tPop: tYank + .12 + i * .2, id: 10 + i })),
      { kind: 'plug', dir: norm3([.75, .25, .62]), tPop: tYank + .3, id: 20 },
    ].map(b => { const d = apM(MS, b.dir), rr = R * rOut * (b.kind === 'gear' ? .9 : .94); return { ...b, d, z: d[2], age: t - b.tPop, p0: [cx + d[0] * rr, cy + d[1] * rr] }; });
    paint(ellPts(cx, BALL.floor + 6, R * rOut * .95, 34 * rOut + 10, 24), { fill: PAL.ink, fillOp: 80, bleed: .2, tex: .3, border: .1, ink: null });
    const drawChunk = c => {
      const st = STR[c.si], dk = clamp(.5 - c.z * .5) * .45, col = mixCol(mixCol(st.col, '#6C6784', dk), top, dk * .5);
      if (c.si === 3) { inkLine(c.pts, st.w / 4.2 * .9, col, 'marker', 0, .9); return; }
      inkLine(c.pts, (st.w + 3.5) / 4.2, mixCol(PAL.ink, top, dk * .6), 'marker', 0);
      inkLine(c.pts, st.w / 4.2, col, 'marker', 0);
    };
    const drawBit = b => {
      if (b.age > 0) return;
      const dk = clamp(.5 - b.d[2] * .5) * .4;
      if (b.kind === 'gear') gear(b.p0[0], b.p0[1], b.r * (.85 + .15 * b.d[2]), b.teeth, (t < tYank ? beatN(t) * .35 + backOut(frac(bpOf(t)) * 2.5) * .35 : spin * 1.4) * (b.id % 2 ? -1 : 1), mixCol('#A3A8BC', '#6C6784', dk));
      else if (b.kind === 'knot') knotGlyph(b.p0[0], b.p0[1], 20, b.id * 1.3 + spin, mixCol(b.col, '#6C6784', dk), b.w);
      else plug(b.p0[0] + b.d[0] * 18, b.p0[1] + b.d[1] * 18, b.d[0], b.d[1], 1.1);
    };
    const back = [...chunks.filter(c => c.z < 0), ...bits.filter(b => b.z < 0).map(b => ({ z: b.z, bit: b }))].sort((a, b) => a.z - b.z);
    const front = [...chunks.filter(c => c.z >= 0), ...bits.filter(b => b.z >= 0).map(b => ({ z: b.z, bit: b }))].sort((a, b) => a.z - b.z);
    back.forEach(c => c.bit ? drawBit(c.bit) : drawChunk(c));
    const coreA = 1 - seg(prog, .7, .92);
    if (coreA > .01) paint(ellPts(cx, cy, R * rOut * .8, R * rOut * .78, 30), { wash: mixCol('#ABA4BE', '#E7B7C4', warm), washOp: 170 * coreA, fill: '#8D86A6', fillOp: 60 * coreA, bleed: .1, tex: .5, border: .3, ink: null });
    const rev = seg(prog, .7, .9);                                     // the core: the little app icon
    if (rev > 0) {
      glow(BALL.x, BALL.floor - 120, 360, '#FFE7B0', .55 * rev);
      fadeIn(rev, () => giftIcon(BALL.x, BALL.floor, GS * lerp(.8, 1, backOut(rev)), { face: seg(t, tBow - .05, tBow + .05), band: easeOut(seg(t, tBow - .3, tBow + .02)), glint: seg(t, tBow + .1, tBow + .6) }));
    }
    front.forEach(c => c.bit ? drawBit(c.bit) : drawChunk(c));

    // ---- characters ----
    momo(mxp, 880, ms, mO);
    hero(hxp, 880, hs, hO);
    if (mEm[0]) emote(mEm[0], mxp - 3.3 * ms, 880 + (mO.dy || 0) * ms - 10.4 * ms, ms * .9, mEm[1]);
    // effort: dust puffs at their heels on the yank and on the release, pull lines streaming behind them
    for (const [tt, amt] of [[tYank, 1], [tDone + .05, .7]]) {
      const a = t - tt; if (a < 0 || a > .6) continue;
      for (let k = 0; k < 5; k++) {
        const px = (k % 2 ? hxp : mxp) - 36 - k * 12 - a * 130 * (1 + k * .2), py = 872 - (k % 3) * 9 - a * 34, r = (12 + 22 * easeOut(a / .6)) * amt * (1 - k * .08);
        paint(ellPts(px, py, r, r * .7, 12), { wash: '#FFF6E6', washOp: 210 * (1 - a / .6), ink: PAL.ink, sw: .5 * (1 - a / .6) });
      }
    }
    if (t > tYank && t < tDone) for (let k = 0; k < 4; k++) {
      const ph = frac(t * 2.2 + k / 4), x0 = mxp - 120 - ph * 160, y0 = 640 + k * 55 + 10 * Math.sin(k * 2);
      inkLine([[x0, y0], [x0 - 70, y0 + 3]], 1.3, '#FFF6E6', 'fine', 0, (1 - ph) * .95);
    }

    // ---- the pulled-out strands (under the ribbon), then the ribbon itself ----
    strands.forEach((P, si) => {
      if (si === 0) return;
      const pts = P.filter(q => q.k >= .02).map(q => q.p); if (pts.length < 2) return;
      const st = STR[si], a = 1 - seg(t, 138.55, 138.9);
      if (si === 3) { inkLine(pts, st.w / 4.2 * .9, st.col, 'marker', 0, a); return; }
      inkLine(pts, (st.w + 3.5) / 4.2, PAL.ink, 'marker', 0, a); inkLine(pts, st.w / 4.2, st.col, 'marker', 0, a);
    });
    // the ribbon: every clean or lifting point, plus the first point still in the ball; long taut spans are subdivided
    // so the width tapers smoothly from satin ribbon to the thin wrap it is peeling off
    const R0 = strands[0], last = R0.findIndex((q, i) => i > 40 && q.k < .02), src = last < 0 ? R0 : R0.slice(0, last + 1), rp = [src[0]];
    for (let i = 1; i < src.length; i++) {
      const a = src[i - 1], b = src[i], d = Math.hypot(b.p[0] - a.p[0], b.p[1] - a.p[1]), m = Math.min(40, Math.floor(d / 14));
      for (let j = 1; j <= m; j++) { const e = j / (m + 1); rp.push({ p: [lerp(a.p[0], b.p[0], e), lerp(a.p[1], b.p[1], e)], k: lerp(a.k, b.k, ease(e)), u: lerp(a.u, b.u, e) }); }
      rp.push(b);
    }
    const wide = 32 + 6 * ease(seg(t, 138.3, 138.8));
    ribbon(rp.map(q => q.p), i => lerp(STR[0].w, wide, rp[i].k), i => rp[i].u * 23 + .6, { sw: .85 });
    if (t < tGrab) {                                                   // the loose end glints while it waits to be found
      const g = frac((t - 135.2) / .6), gp = pulse(t, 5);
      glow(606, 868, 70, '#FFF3C0', .35 + .3 * gp); sparkle(606, 862, 26 + 10 * gp, '#FFF3C0', g); sparkle(640, 850, 14, '#FFD1E0', frac(g + .5));
    }
    if (grabK > .6) {                                                  // hands grip the ribbon (drawn over it)
      const sw = clamp(hs / 19, .32, 2.3), swm = clamp(ms / 19, .32, 2.3);
      if (t < tBow - .05) { handDot(hH[0], hs, sw); handDot(mH[0], ms, swm); }
      handDot(hH[1], hs, sw); handDot(mH[1], ms, swm);
    }

    // ---- gears, knots and the plug pop off and burst into sparkles ----
    for (const b of bits) {
      if (b.age <= 0 || b.age > 1.1) continue;
      const vx = b.d[0] * 700 + (b.id % 2 ? 160 : -120), vy = -620 - 200 * hash(b.id), [px, py] = fly(b.p0[0], b.p0[1], vx, vy, b.age, 2600);
      const shrink = 1 - seg(b.age, .3, .5);
      if (shrink > 0) {
        if (b.kind === 'gear') gear(px, py, b.r * shrink, b.teeth, b.age * 14 * (b.id % 2 ? -1 : 1), '#A3A8BC');
        else if (b.kind === 'knot') knotGlyph(px, py, 20, b.id + b.age * 9, b.col, b.w, shrink);
        else { push(); translate(px, py); rotate(b.age * 12); plug(0, 0, 1, 0, 1.1 * shrink); pop(); }
      }
      if (b.age > .3) for (let k = 0; k < 5; k++) { const a = k / 5 * TAU + b.id, e = seg(b.age, .3, 1.1); sparkle(px + Math.cos(a) * 60 * e, py + Math.sin(a) * 60 * e, 14, k % 2 ? '#FFE7A8' : '#FFD1E0', e); }
    }
    // ---- the bow ties itself on the beat ----
    if (t > tBow - .06) {
      bow(KNOT[0], KNOT[1], 1.5, elasticOut(seg(t, tBow - .06, tBow + .7)), { rot: -.08 });
      const ba = t - tBow;
      if (ba > -.05) for (let k = 0; k < 10; k++) { const a = k / 10 * TAU + .3, r = 70 + 210 * easeOut(seg(ba, 0, .7)); sparkle(KNOT[0] + Math.cos(a) * r, KNOT[1] - 30 + Math.sin(a) * r * .8, 16 + 8 * (k % 2), k % 3 ? '#FFF3C0' : '#FFD1E0', seg(ba, 0, .8)); }
    }
    camEnd();
  }

  // =====================================================================================================
  // 2) cuteFaces — 也想给严肃的世界 留一张可爱的脸
  //    A row of stern grey things (an official stamp, a no-entry sign, a filing cabinet, a server rack, an office
  //    building). 桃桃 hops from one to the next; each landing (on the beat) slaps cat-ear stickers on its top, its face
  //    turns cute and colour blooms down through it. The building is last: surprised, then it smiles back and bounces.
  // =====================================================================================================
  const GY2 = 860;
  const OBJS = [
    { kind: 'stamp', x: 270, top: 626, beat: 233, grey: '#9EA0AC', col: '#F59A8F' },
    { kind: 'sign', x: 565, top: 360, beat: 234, grey: '#A4A6B2', col: '#F27D9A' },
    { kind: 'cabinet', x: 855, top: 560, beat: 235, grey: '#A3A6B1', col: '#8ED3BA' },
    { kind: 'rack', x: 1125, top: 440, beat: 236, grey: '#8A8D9B', col: '#B9A3E3' },
    { kind: 'building', x: 1565, top: 254, beat: 238, grey: '#AAACB7', col: '#F8B39A' },
  ];
  // 桃桃's hops: [land time, x, surface y]
  const HOPS = [[139.1, -80, GY2], ...OBJS.map(o => [B(o.beat), o.x, o.top])];
  function momoHop(t) {
    let i = 0; while (i + 1 < HOPS.length && t >= HOPS[i + 1][0]) i++;
    if (i + 1 >= HOPS.length) return { x: HOPS[i][1], y: HOPS[i][2], air: 0, u: 1, i, land: t - HOPS[i][0] };
    const [t0, x0, y0] = HOPS[i], [t1, x1, y1] = HOPS[i + 1], dwell = i === 4 ? .42 : .13, tk = t0 + dwell;
    if (t < tk) return { x: x0, y: y0, air: 0, u: 0, i, land: t - t0, crouch: seg(t, tk - .12, tk) };
    const u = seg(t, tk, t1), h = 50 + .1 * Math.abs(x1 - x0) + .4 * Math.abs(y1 - y0) + (i === 4 ? 20 : 0);
    return { x: lerp(x0, x1, u), y: lerp(y0, y1, u) - 4 * h * u * (1 - u), air: 1, u, i, land: -1 };
  }
  // a cat-ear sticker: cream sticker margin, ear colour, pink inner; (x, y) is the middle of its base
  function catEar(x, y, w, rot, col, k) {
    if (k <= .01) return;
    push(); translate(x, y); rotate(rot); scale(k);
    const e = [[-w / 2, 0], [-w * .12, -w * .95], [w * .06, -w * 1.02], [w / 2, 0]];
    paint(e.map(([a, b]) => [a * 1.18, b * 1.12 + 4]), { wash: '#FFF8EE', ink: PAL.ink, sw: .6, curv: .25 });
    paint(e, { wash: col, ink: PAL.ink, sw: .9, curv: .25 });
    paint(e.map(([a, b]) => [a * .55, b * .62 - 4]), { wash: '#F6A5BD', ink: null, curv: .25 });
    pop();
  }
  // a stern face (k = 0) or a cute one (k = 1, popping in); s = px per unit, eyes at ±1.1 units
  function thingFace(x, y, s, k, o = {}) {
    const sw = clamp(s / 16, .6, 2.6), ex = (o.ex || 1.1) * s;
    if (k < .5) {
      const gx = (o.gaze ? o.gaze[0] : 0) * .2 * s, gy = (o.gaze ? o.gaze[1] : 0) * .14 * s;   // stern eyes follow 桃桃
      for (const sd of [-1, 1]) {
        inkLine([[x + sd * ex - sd * .5 * s, y - .48 * s], [x + sd * ex + sd * .5 * s, y - .74 * s]], sw * 1.2, PAL.ink, 'ink', 0);
        paint(ellPts(x + sd * ex + gx, y + gy, .2 * s, .24 * s, 10), { wash: PAL.ink, ink: null });
      }
      inkLine([[x - .45 * s, y + .85 * s], [x + .45 * s, y + .85 * s]], sw * 1.1, PAL.ink, 'ink', 0);
      return;
    }
    const p = backOut(clamp((k - .5) * 4)), e = o.eyes || 'happy';
    push(); translate(x, y); scale(p);
    for (const sd of [-1, 1]) {
      paint(ellPts(sd * (ex + .45 * s), .55 * s, .42 * s, .24 * s, 12), { fill: BLUSH, fillOp: 190, bleed: .2, tex: .2, ink: null });
      if (e === 'wide') { paint(ellPts(sd * ex, 0, .42 * s, .5 * s, 16), { wash: '#FFFDF7', ink: PAL.ink, sw: sw * .8 }); paint(ellPts(sd * ex, .06 * s, .17 * s, .21 * s, 10), { wash: PAL.ink, ink: null }); }
      else if (e === 'sparkle') { paint(ellPts(sd * ex, 0, .3 * s, .4 * s, 14), { wash: PAL.ink, ink: null }); paint(starPts(sd * ex - .08 * s, -.12 * s, .17 * s, .45, 4, 0), { wash: '#FFFFFF', ink: null }); }
      else inkLine([[sd * ex - .38 * s, .1 * s], [sd * ex, -.28 * s], [sd * ex + .38 * s, .1 * s]], sw * 1.2, PAL.ink, 'ink', .5);
    }
    const m = o.mouth || 'cat';
    if (m === 'cat') inkLine([[-.42 * s, .72 * s], [-.21 * s, .9 * s], [0, .74 * s], [.21 * s, .9 * s], [.42 * s, .72 * s]], sw, PAL.ink, 'ink', .5);
    else if (m === 'o') paint(ellPts(0, .85 * s, .2 * s, .25 * s, 12), { wash: '#9B3B4F', ink: PAL.ink, sw: sw * .6 });
    else if (m !== 'none') { paint([[-.5 * s, .68 * s], [.5 * s, .68 * s], [.32 * s, 1.1 * s], [0, 1.2 * s], [-.32 * s, 1.1 * s]], { wash: '#9B3B4F', ink: PAL.ink, sw: sw * .7, curv: .4 }); paint(ellPts(0, 1.0 * s, .22 * s, .1 * s, 10), { wash: '#F08A9A', ink: null }); }
    pop();
  }
  // body with a colour bloom spreading from (bx, by) through it (clipped to its outline)
  function bloomBody(pts, grey, col, k, bx, by, rMax, sw = 1.2) {
    paint(pts, { wash: grey, fill: mixCol(grey, PAL.ink, .15), fillOp: 60, bleed: .04, tex: .5, border: .3, ink: null });
    if (k > .005) clipTo(pts, () => {
      const r = rMax * easeOut(k);
      paint(ellPts(bx, by, r, r, 26), { wash: col, fill: mixCol(col, '#FFFFFF', .25), fillOp: 90, bleed: .12, tex: .4, border: .4, ink: null });
    });
    paint(pts, { ink: PAL.ink, sw });
  }

  function thing(o, t, bump, mp) {
    const tS = B(o.beat), age = t - tS, k = easeOut(seg(t, tS, tS + .42)), cute = age >= 0 ? .5 + seg(age, 0, .12) * .5 : 0;
    const c = (a, b) => mixCol(a, b, k), x = o.x, y = GY2, sq = (age > 0 ? .1 * Math.exp(-age * 6) * Math.cos(age * 22) : 0) + bump;
    push(); translate(x, y); scale(1 + sq * .5, 1 - sq); translate(-x, -y);
    const earK = backOut(seg(age, -.02, .2)), gaze = mp ? [clamp((mp[0] - o.x) / 350, -1, 1), clamp((mp[1] - 150 - (o.top + 80)) / 300, -1, 1)] : null;
    if (o.kind === 'stamp') {
      bloomBody(rrPts(x - 95, y - 66, 190, 66, 16), o.grey, o.col, k, x, y - 190, 260);
      paint(rrPts(x - 99, y - 16, 198, 16, 6), { wash: c('#6E7080', '#D9485E'), ink: PAL.ink, sw: 1 });
      bloomBody(rectPts(x - 22, y - 128, 44, 64), o.grey, mixCol(o.col, '#FFFFFF', .2), k, x, y - 190, 200, 1);
      const knob = ellPts(x, y - 186, 72, 60, 30);
      bloomBody(knob, o.grey, mixCol(o.col, '#FFFFFF', .3), k, x, y - 246, 150);
      inkLine([[x - 48, y - 214], [x - 26, y - 232]], 2.2, '#FFFFFF', 'marker', .4, .45);
      catEar(x - 40, y - 236, 44, -.45, mixCol(o.col, '#FFFFFF', .3), earK); catEar(x + 40, y - 236, 44, .45, mixCol(o.col, '#FFFFFF', .3), earK);
      thingFace(x, y - 184, 26, cute, { mouth: 'cat', ex: .95, gaze });
    } else if (o.kind === 'sign') {
      const py = y - 400;
      paint(rectPts(x - 9, py, 18, 400), { wash: c('#8C8FA0', '#E9D9C6'), ink: PAL.ink, sw: 1 });
      paint(ellPts(x, y - 4, 44, 12, 14), { wash: c('#7C7F90', '#C9B8A6'), ink: PAL.ink, sw: .9 });
      const plate = ellPts(x, py, 98, 98, 36);
      bloomBody(plate, o.grey, o.col, k, x, py - 100, 220, 1.4);
      paint(ellPts(x, py, 84, 84, 36), { ink: c('#D8D9E0', '#FFF3E6'), sw: 1.6, br: 'marker' });
      catEar(x - 54, py - 80, 48, -.5, o.col, earK); catEar(x + 54, py - 80, 48, .5, o.col, earK);
      // the no-entry bar: flat and stern, then it curls into a smile
      const bend = k * 26, bar = [];
      for (let i = 0; i <= 10; i++) { const u = i / 10 * 2 - 1; bar.push([x + u * 62, py + 26 + bend * (1 - u * u)]); }
      inkLine(bar, 7.4, PAL.ink, 'marker', .5); inkLine(bar, 6.2, c('#E3E4EA', '#FFF6E6'), 'marker', .5);
      thingFace(x, py - 30, 28, cute, { eyes: 'sparkle', mouth: 'none', gaze });
    } else if (o.kind === 'cabinet') {
      const bx = x - 100, by = y - 300;
      bloomBody(rectPts(bx, by, 200, 300, 1.5), o.grey, o.col, k, x, by - 20, 380);
      paint(rectPts(bx - 8, by - 10, 216, 16, 1), { wash: c('#8D909C', '#6FBFA4'), ink: PAL.ink, sw: 1 });
      for (let d = 0; d < 3; d++) {
        const dy = by + 14 + d * 95;
        paint(rrPts(bx + 12, dy, 176, 84, 6), { wash: c('#B3B5BF', mixCol(o.col, '#FFFFFF', .3)), washOp: 150, ink: PAL.ink, sw: .9 });
        if (d > 0) { paint(rrPts(x - 34, dy + 40, 68, 14, 7), { wash: c('#7C7F8E', '#F6C85F'), ink: PAL.ink, sw: .8 }); paint(rectPts(x - 22, dy + 12, 44, 20), { wash: c('#E4E4EA', '#FFF8EE'), ink: PAL.ink, sw: .6 }); }
      }
      catEar(bx + 44, by - 8, 46, -.3, o.col, earK); catEar(bx + 156, by - 8, 46, .3, o.col, earK);
      thingFace(x, by + 54, 28, cute, { mouth: 'grin', gaze });
    } else if (o.kind === 'rack') {
      const bx = x - 90, by = y - 420;
      bloomBody(rectPts(bx, by, 180, 420, 1.5), o.grey, o.col, k, x, by - 20, 520);
      paint(rectPts(bx + 14, by + 14, 152, 392, 1), { wash: c('#6A6D7C', mixCol(o.col, PAL.ink, .15)), washOp: 120, ink: PAL.ink, sw: .8 });
      for (let r = 0; r < 6; r++) {
        const ry = by + 150 + r * 42;
        paint(rrPts(bx + 24, ry, 132, 30, 4), { wash: c('#9A9DAA', mixCol(o.col, '#FFFFFF', .35)), ink: PAL.ink, sw: .7 });
        for (let q = 0; q < 3; q++) { const on = age > 0 ? (beatN(t) + r + q) % 3 !== 0 : hash(r * 7 + q) > .6; dot(bx + 40 + q * 14, ry + 15, 4, age > 0 ? (on ? ['#9EF0D6', '#FFC9DA', '#FFE7A0'][(r + q) % 3] : '#8C7FB0') : (on ? '#B8C7B4' : '#6E7080'), 1); }
        for (let q = 0; q < 4; q++) inkLine([[bx + 96 + q * 13, ry + 7], [bx + 96 + q * 13, ry + 23]], .6, PAL.ink, 'fine', 0, .6);
      }
      catEar(bx + 38, by - 2, 44, -.3, o.col, earK); catEar(bx + 142, by - 2, 44, .3, o.col, earK);
      thingFace(x, by + 70, 28, cute, { eyes: 'happy', mouth: 'o', ex: 1.05, gaze });
    }
    pop();
  }
  // the office building: stern → surprised (sticker) → it smiles back and bounces
  function building(o, t, bump) {
    const tS = B(o.beat), tSm = B(239), age = t - tS, k = easeOut(seg(t, tS, tS + .6)), x = o.x, y = GY2, c = (a, b) => mixCol(a, b, k);
    const smA = t - tSm, sq = (age > 0 ? .06 * Math.exp(-age * 6) * Math.cos(age * 20) : 0) + (smA > 0 ? -.08 * Math.sin(Math.PI * seg(smA, 0, .3)) + .05 * Math.sin(Math.PI * seg(smA, .3, .55)) : 0) + bump;
    push(); translate(x, y); scale(1 + sq * .5, 1 - sq); translate(-x, -y);
    const bx = x - 220, by = y - 600, body = rectPts(bx, by, 440, 600, 2);
    bloomBody(body, o.grey, o.col, k, x, by, 800, 1.5);
    paint(rectPts(bx - 14, by - 6, 468, 30, 1), { wash: c('#8F929E', '#E98C84'), ink: PAL.ink, sw: 1.2 });
    // windows light up in a cascade from the top
    for (let r = 0; r < 8; r++) for (let q = 0; q < 6; q++) {
      const wx = bx + 30 + q * 68, wy = by + 50 + r * 62;
      if (wy > by + 120 && wy < by + 410 && wx > bx + 40 && wx < bx + 380) continue;          // the face
      if (r >= 7 && q >= 2 && q <= 3) continue;                                                // the door
      const lit = seg(age, .04 * r + .02 * q, .04 * r + .02 * q + .15);
      paint(rectPts(wx, wy, 40, 34), { wash: mixCol('#7D8090', hash(r * 6 + q) > .35 ? '#FFE2A0' : '#FFC6B5', lit), ink: PAL.ink, sw: .6 });
    }
    paint(rrPts(x - 55, y - 104, 110, 104, 8), { wash: c('#7C7F8E', '#C9785F'), ink: PAL.ink, sw: 1 });   // door
    paint(rectPts(x - 80, y - 118, 160, 16), { wash: c('#9396A3', '#F6C85F'), ink: PAL.ink, sw: .8 });
    // the face: two big window-eyes and a balcony mouth
    const fy = by + 225, sw = 2.2;
    if (age < 0) {
      for (const sd of [-1, 1]) {
        paint(rectPts(x + sd * 95 - 50, fy - 40, 100, 80), { wash: '#6C6F7E', ink: PAL.ink, sw: 1.2 });
        paint(rectPts(x + sd * 95 - 50, fy - 40, 100, 44), { wash: '#9A9DAA', ink: PAL.ink, sw: 1 });            // heavy blinds: stern lids
        inkLine([[x + sd * 95 - 58, fy - 64 + sd * 0], [x + sd * 95 + 50, fy - 50 - sd * 12]].map(p => sd > 0 ? p : [2 * x - p[0], p[1]]), sw * 1.3, PAL.ink, 'ink', 0);
      }
      inkLine([[x - 100, fy + 120], [x + 100, fy + 120]], sw * 1.5, PAL.ink, 'ink', 0);
    } else {
      const smile = seg(smA, -.05, .12), p = backOut(seg(age, 0, .25));
      for (const sd of [-1, 1]) {
        paint(ellPts(x + sd * 152, fy + 92, 50 * p, 26 * p, 16), { fill: BLUSH, fillOp: 200, bleed: .2, tex: .2, ink: null });
        if (smile <= 0) {                                                                                         // surprised!
          paint(ellPts(x + sd * 95, fy, 48 * p, 56 * p, 20), { wash: '#FFFDF7', ink: PAL.ink, sw: 1.4 });
          paint(ellPts(x + sd * 95, fy + 6, 20 * p, 24 * p, 12), { wash: PAL.ink, ink: null });
          paint(ellPts(x + sd * 95 - 7, fy - 4, 7 * p, 7 * p, 8), { wash: '#FFFFFF', ink: null });
        } else {
          glow(x + sd * 95, fy, 90, '#FFE6A8', .5);
          inkLine([[x + sd * 95 - 48, fy + 14], [x + sd * 95, fy - 36], [x + sd * 95 + 48, fy + 14]], sw * 2, PAL.ink, 'ink', .5);
        }
      }
      if (smile <= 0) paint(ellPts(x, fy + 122, 26 * p, 30 * p, 14), { wash: '#9B3B4F', ink: PAL.ink, sw: 1.2 });
      else {
        const m = backOut(smile);
        paint([[x - 110 * m, fy + 88], [x + 110 * m, fy + 88], [x + 70 * m, fy + 156], [x, fy + 172], [x - 70 * m, fy + 156]], { wash: '#9B3B4F', ink: PAL.ink, sw: 1.6, curv: .4 });
        paint(ellPts(x, fy + 146, 46 * m, 15, 12), { wash: '#F08A9A', ink: null });
      }
    }
    const earK = backOut(seg(age, -.02, .22));
    catEar(bx + 60, by - 4, 130, -.28, o.col, earK); catEar(bx + 380, by - 4, 130, .28, o.col, earK);
    pop();
  }

  function cuteFaces(t, lt) {
    const tEnd = 144.156, tSm = B(239);
    const conv = OBJS.map(o => easeOut(seg(t, B(o.beat), B(o.beat) + .5)));
    const warm = (conv[0] + conv[1] + conv[2] + conv[3] + 2 * conv[4]) / 6;
    // camera: open wide on the stern row, then track 桃桃 along it, and ease back to the whole happy row
    let mx = 0, my = 0; for (let k = -3; k <= 3; k++) { const q = momoHop(t + k * .12); mx += q.x; my += q.y; } mx /= 7; my /= 7;
    const track = seg(t, 139.5, 140.2), back = easeInOut(seg(t, 141.95, 142.95));
    const cxc = lerp(lerp(900, clamp(mx + 60, 420, 1250), ease(track)), 980, back), cyc = lerp(lerp(500, lerp(515, 430, clamp((640 - my) / 280)), ease(track)), 455, back);
    const z = lerp(lerp(1.0, 1.2, ease(track)), .95, back) + .02 * pulse(t, 4) * back;
    camBegin(cxc, cyc, z, 0);

    // sky, distant town, clouds: overcast grey warming to peach and pink as the row comes alive
    paint(rectPts(-600, -500, W + 1200, 1500), { grad: [mixCol('#AEB2C2', '#F3C3D2', warm), mixCol('#D3D4DC', '#FDE2C6', warm), Math.PI / 2], ink: null });
    if (warm > .02) glow(1650, 60, 700, '#FFE6A8', .55 * warm);
    for (let i = 0; i < 5; i++) {
      const cx = -300 + i * 560 + Math.sin(t * .3 + i) * 20, cy = 60 + hash(i * 5.3) * 170;
      cloudPuff(cx, cy, .9 + hash(i) * .6, mixCol('#C9CBD6', '#FFF1EA', warm), { seed: i + 2, shade: mixCol('#A9ACBA', '#F8C9D6', warm), ink: false });
    }
    for (let i = 0; i < 16; i++) {
      const bx = -500 + i * 190 + hash(i * 3.3) * 60, bw = 120 + hash(i * 7.1) * 90, bh = 150 + hash(i * 1.7) * 260;
      paint(rectPts(bx, GY2 - 110 - bh, bw, bh + 120), { wash: mixCol('#BFC2CE', ['#F7C6D2', '#FFE0B8', '#CDE8DA', '#D9D0F0'][i % 4], warm * .8), washOp: 235, ink: null });
      for (let r = 0; r < Math.floor(bh / 46); r++) for (let q = 0; q < 3; q++) if (hash(i * 31 + r * 5 + q) > .5) fillRectA(bx + 14 + q * bw / 3.2, GY2 - 90 - bh + r * 46, bw / 6, 14, mixCol('#A5A9B8', '#FFF1D0', warm), .8);
    }
    paint([[-600, GY2 - 20], [W + 600, GY2 - 20], [W + 600, H + 500], [-600, H + 500]], { wash: mixCol('#BDBEC8', '#EFD3C3', warm), fill: mixCol('#9EA0AE', '#D9A996', warm), fillOp: 60, bleed: .05, tex: .6, border: .3, ink: PAL.ink, sw: 1 });
    for (let i = -4; i < 16; i++) inkLine([[i * 160, GY2 + 10], [i * 160 - 120, H + 400]], .5, mixCol('#8E90A0', '#C99A86', warm), 'fine', 0, .5);
    inkLine([[-600, GY2 + 40], [W + 600, GY2 + 40]], .6, mixCol('#8E90A0', '#C99A86', warm), 'fine', 0, .5);

    // the row: everyone bounces together on the last beats
    const mh = momoHop(t);
    OBJS.forEach((o, i) => {
      const happy = t > B(o.beat) + .5 ? 1 : 0, wave = t > tSm ? .05 * Math.max(0, Math.sin(Math.PI * frac(bpOf(t) - i * .15))) * pulse(t - i * .09, 3) : .018 * happy * pulse(t - i * .07, 5);
      if (o.kind === 'building') building(o, t, wave); else thing(o, t, wave, [mh.x, mh.y]);
    });

    // 桃桃 hopping along the tops, slapping stickers on each landing
    const h = momoHop(t), s = 22;
    const landA = h.land, slap = landA >= 0 && landA < .3 ? Math.sin(Math.PI * seg(landA, 0, .3)) : 0;
    const flip = h.i === 4 && h.air ? TAU * easeInOut(seg(h.u, .15, .85)) : 0;
    const bounce = t > tSm ? Math.sin(Math.PI * seg(t, tSm, tSm + .5)) : 0;
    const md = mood(t, [[139, 'happy', null, 'open'], [B(238), 'sparkle', null, 'open'], [tSm, 'star', 'heart', 'grin']]);
    const air = h.air ? Math.sin(Math.PI * h.u) : 0;
    const mo = { ...md, emote: null, seed: 3, blush: .9, lookX: h.air ? .6 : 0, lookY: h.air ? 0 : .4,
      dy: -bounce * 2.2, rot: flip + (h.air ? .12 * (1 - 2 * h.u) : 0),
      sq: (h.crouch ? .18 * h.crouch : 0) + (h.air ? -.12 * Math.sin(Math.PI * seg(h.u, 0, .25)) : 0) + (landA >= 0 && landA < .25 ? .22 * Math.exp(-landA * 14) : 0),
      aL: h.air ? .4 + .5 * air : lerp(-.5, -1.35, slap), aR: h.air ? .4 + .5 * air : lerp(-.5, -1.35, slap), tilt: .08 * Math.sin(t * 5) };
    if (t > tSm) { mo.aL = .45 + .2 * Math.sin(t * 12); mo.aR = .45 - .2 * Math.sin(t * 12); }
    momo(h.x, h.y, s, { ...mo, noShadow: h.air > 0 });
    if (md.emote) emote(md.emote, h.x - 3.3 * s, h.y + (mo.dy || 0) * s - 10.4 * s, s * .9, md.emoteK);
    // a sticker "pat" burst on every landing
    OBJS.forEach(o => {
      const a = t - B(o.beat); if (a < 0 || a > .6) return;
      const big = o.kind === 'building' ? 2.2 : 1;
      for (let q = 0; q < 8; q++) { const an = q / 8 * TAU + .2, r = (40 + 110 * easeOut(a / .6)) * big; sparkle(o.x + Math.cos(an) * r, o.top - 20 + Math.sin(an) * r * .6, (10 + 6 * (q % 2)) * big, q % 2 ? '#FFF3C0' : '#FFD1E0', a / .6); }
    });
    // the building's smile sends up hearts
    if (t > tSm) for (let q = 0; q < 7; q++) {
      const a = t - tSm - q * .08; if (a < 0) continue;
      const hx = 1565 + (q - 3) * 90 + Math.sin(a * 5 + q) * 20, hy = 520 - a * 380 - q * 10;
      paint(heartPts(hx, hy, (18 + 8 * (q % 3)) * Math.min(1, a * 5)), { wash: q % 2 ? '#F58FAE' : '#FFB3C8', ink: PAL.ink, sw: .7 });
    }
    camEnd();
  }

  // =====================================================================================================
  // 3) noManifesto — 不必把每份热爱 都写成宏大的宣言
  //    A grand stage (velvet curtains, gold, spotlights, a podium with a brass megaphone). An endless declaration
  //    feeds down from a roll in the rafters like credits and piles up in folds on the stage. She walks past without a
  //    glance, humming, and sticks one tiny heart note on the corner of her monitor at her little desk. 桃桃 nods. The
  //    scroll deflates, zips itself back up with a bonk, the megaphone droops and the spotlights go out; her lamp stays on.
  // =====================================================================================================
  const SC = { x: 520, w: 380, rod: 104, floor: 716 };             // the scroll: centre x, paper width, rod y, stage floor
  const MON3 = { x: 1200, y: 705, w: 330, h: 230 };                 // her monitor on the little desk
  const NOTE3 = [MON3.x - MON3.w / 2 + 46, MON3.y + MON3.h / 2 - 30];
  function scrollRoll(x, y, r, w, spin = 0, rot = 0) {              // a paper roll: a horizontal cylinder
    push(); translate(x, y); rotate(rot);
    paint(rrPts(-w / 2 - 8, -r, w + 16, 2 * r, r * .9), { wash: '#F6E3BD', fill: '#D9B478', fillOp: 90, tex: .5, ink: PAL.ink, sw: 1.1 });
    inkLine([[-w / 2, -r * .45], [w / 2, -r * .45]], 1.6, '#FFF8E4', 'marker', 0, .8);
    for (let k = 0; k < 5; k++) { const yy = ((k / 5 + spin) % 1) * 2 - 1; inkLine([[-w / 2 + 20, yy * r * .8], [w / 2 - 20, yy * r * .8]], .5, '#C9A56A', 'fine', 0, .5 * (1 - Math.abs(yy))); }
    for (const sd of [-1, 1]) {
      paint(ellPts(sd * (w / 2 + 8), 0, r * .42, r, 16), { wash: '#EFD3A0', ink: PAL.ink, sw: .9 });
      const sp = []; for (let k = 0; k < 14; k++) { const a = k * .9 + spin * TAU * sd, rr = r * .85 * (1 - k / 14); sp.push([sd * (w / 2 + 8) + Math.cos(a) * rr * .42, Math.sin(a) * rr]); }
      inkLine(sp, .6, '#A07E4E', 'fine', .5);
    }
    pop();
  }
  function megaphone(x, y, s, droop, blast, t) {                   // (x, y) = pivot on the podium
    push(); translate(x, y); rotate(-.5 + droop * 1.5 + (blast > .3 ? .03 * Math.sin(t * 60) : 0)); scale(s * (1 + .08 * blast));
    paint([[0, -14], [26, -18], [130, -62], [130, 62], [26, 18], [0, 14]], { wash: '#E9B84E', fill: '#B7832C', fillOp: 80, tex: .5, border: .4, ink: PAL.ink, sw: 1.3, curv: .1 });
    paint(ellPts(130, 0, 18, 64, 22), { wash: '#7A4E24', fill: '#4A2E16', fillOp: 90, ink: PAL.ink, sw: 1.2 });
    paint(ellPts(130, 0, 11, 53, 20), { wash: '#3A2412', ink: null });
    inkLine([[36, -14], [122, -52]], 2.4, '#FFF1C2', 'marker', .2, .7);
    paint(rrPts(-26, -12, 30, 24, 8), { wash: '#6E4A2E', ink: PAL.ink, sw: 1 });
    pop();
  }
  // the scroll: F = paper fed out so far (px); dfl 0..1 deflation; returns nothing
  function declaration(t, F, dfl, spin) {
    const rTop = 18 + 22 * clamp(1 - F / 1500), yTop = SC.rod + 16 + rTop * .7, Lv0 = SC.floor - yTop;
    const extra = Math.max(0, F - Lv0), folds = extra / 58, pileH = Math.min(210, folds * 17) * (1 - .45 * dfl);
    const yBot = F <= Lv0 ? yTop + F : SC.floor - pileH, w0 = SC.w / 2;
    // the fold pile on the stage (and a tongue of paper spilling over the lip)
    if (extra > 0) {
      const spill = clamp((folds - 3) / 5);
      if (spill > 0) {                                              // paper spilling over the lip of the stage
        const len = 150 * spill, x0 = SC.x - 150, x1 = SC.x + 165, wv = 6 * Math.sin(t * 3);
        const drape = [[x0, 734], [x1, 734], [x1 + 6 + wv, 734 + len], [x0 + 8 + wv, 734 + len]];
        paint(drape, { wash: '#FFF1CF', fill: '#E8C88E', fillOp: 50, tex: .4, ink: PAL.ink, sw: 1 });
        for (let q = 1; q * 30 < len - 16; q++) inkLine([[x0 + 30, 734 + q * 30], [x1 - 50 - (q % 3) * 30, 734 + q * 30 + 2]], 1.1, '#4A3A40', 'fine', .3, .7);
        scrollRoll((x0 + x1) / 2 + 7 + wv, 734 + len + 8, 11, x1 - x0 - 14, spin * 1.3);
      }
      const nf = Math.min(12, Math.ceil(folds));
      for (let i = 0; i < nf; i++) {
        const fh = pileH / Math.max(1, folds) * Math.min(1, folds - i), y1 = SC.floor - i * pileH / Math.max(1, folds), y0 = y1 - fh, off = (i % 2 ? 1 : -1) * (10 + 4 * dfl) + dfl * 12 * Math.sin(i + t * 6), ww = w0 + 20 + (i % 3) * 6;
        if (fh < 1) continue;
        paint([[SC.x - ww + off, y1], [SC.x + ww + off, y1], [SC.x + ww + off - 6, y0], [SC.x - ww + off + 6, y0]], { wash: i % 2 ? '#FFF1CF' : '#F6E0B4', ink: PAL.ink, sw: .8 });
        for (let q = 0; q < 3; q++) inkLine([[SC.x - ww * .7 + off + q * ww * .5, y0 + fh * .5], [SC.x - ww * .7 + off + q * ww * .5 + ww * .35, y0 + fh * .5]], .6, '#6A5A58', 'fine', 0, .5);
      }
    }
    // the hanging paper
    const n = Math.max(2, Math.ceil((yBot - yTop) / 16)), Lp = [], Rp = [];
    const sway = y => dfl * (30 * Math.sin((y - yTop) * .009 + 1) + 9 * Math.sin(y * .03 - t * 7)) * clamp((y - yTop) / 300);
    for (let i = 0; i <= n; i++) {
      const y = lerp(yTop, yBot, i / n), pinch = 1 - dfl * (.22 + .12 * Math.sin(y * .02 + t * 5)), wr = dfl * 8 * Math.sin(y * .09 + t * 11);
      Lp.push([SC.x + sway(y) - w0 * pinch + wr, y]); Rp.push([SC.x + sway(y) + w0 * pinch - wr, y]);
    }
    const poly = [...Lp, ...Rp.slice().reverse()];
    paint(poly, { wash: mixCol('#FFF3D6', '#E6DAC4', dfl), fill: '#E8C88E', fillOp: 60, bleed: .04, tex: .5, border: .4, ink: PAL.ink, sw: 1.2 });
    clipTo(poly, () => {                                             // the declaration scrolls down like credits
      for (let k = Math.floor((F - (yBot - yTop)) / 34) - 1; k <= F / 34 + 1; k++) {
        if (k < 0) continue;
        const p = k * 34, y = yTop + F - p; if (y < yTop - 20 || y > yBot + 30) continue;
        const cx = SC.x + sway(y), dr = dfl * 22;
        if (k <= 1) { const pts = []; for (let q = 0; q <= 16; q++) { const u = q / 16; pts.push([cx - w0 * .72 + u * w0 * 1.44, y + Math.sin(u * 14) * 7 - 6 + dr * u * u]); } inkLine(pts, 3.4, '#C9962E', 'marker', .4, .95); continue; }
        if (k % 8 === 5) { paint(rrPts(cx + w0 * .32 - 22, y - 22 + dr, 44, 44, 8), { wash: '#C8324A', ink: null }); dot(cx + w0 * .32, y + dr, 10, '#F6D5B8', .6); }
        if (k % 8 === 2) { const pts = []; for (let q = 0; q <= 12; q++) { const u = q / 12; pts.push([cx - w0 * .5 + u * w0, y + Math.sin(u * 16) * 5 + dr * u * u]); } inkLine(pts, 2.4, '#C9962E', 'marker', .4, .9); continue; }
        const pts = [], x0 = cx - w0 * .8, x1 = cx + w0 * (k % 5 === 3 ? .15 : .76);
        for (let q = 0; q <= 12; q++) { const u = q / 12; pts.push([lerp(x0, x1, u), y + Math.sin(u * 20 + k) * 3 + dr * u * u * (k % 2 ? 1 : .6)]); }
        inkLine(pts, 1.2, '#4A3A40', 'fine', .3, .8);
      }
    });
    if (F <= Lv0 + 2) { const bw = w0 * 2 + 10; paint(rrPts(SC.x - bw / 2 + sway(yBot), yBot - 6, bw, 14, 6), { wash: '#E0AE52', ink: PAL.ink, sw: .9 }); }   // the weighted hem
    scrollRoll(SC.x, SC.rod + 16, rTop, SC.w + 12, spin);
  }

  function noManifesto(t, lt) {
    const tNote = B(245), tDef = B(246) + .02, tRoll = 148.2, tBonk = 148.52, tOff = 148.54, tLand = 144.8;
    const dfl = ease(seg(t, tDef, tDef + .45)) * (1 - seg(t, tRoll + .15, tRoll + .35));
    const Fd = (tt) => tt < tLand ? 590 * easeIn(seg(tt, 144.22, tLand)) : 590 + 250 * (tt - tLand);
    const F = t < tDef ? Fd(t) : t < tRoll ? Fd(tDef) + 40 * easeOut(seg(t, tDef, tDef + .3)) : (Fd(tDef) + 40) * (1 - easeInOut(seg(t, tRoll, tBonk)));
    const spin = t < tRoll ? F / 180 : -F / 180;
    const lightsOn = 1 - .75 * ease(seg(t, tOff, tOff + .18));
    // camera: the grand stage from low down, follow her to her desk, lean in on the note, pull back for the gag
    const cx = kf(t, [[144.1, 520], [144.9, 540], [145.6, 640], [146.5, 980], [147.1, 1060], [147.6, 1045], [148.25, 640], [149.2, 620]], easeInOut);
    const cy = kf(t, [[144.1, 410], [144.9, 470], [145.6, 540], [146.5, 660], [147.1, 725], [147.6, 715], [148.25, 505], [149.2, 495]], easeInOut);
    const z = kf(t, [[144.1, 1.12], [144.9, 1.06], [145.6, 1.0], [146.5, 1.3], [147.1, 1.62], [147.6, 1.56], [148.25, 1.0], [149.2, .98]], easeInOut);
    camBegin(cx, cy, z, 0);

    // ---- the house: dark plum, a warm floor ----
    paint(rectPts(-900, -500, 3700, 1600), { wash: '#4A3152', fill: '#2E1D3A', fillOp: 90, bleed: .05, tex: .5, ink: null });
    paint(rectPts(960, 240, 900, 680), { fill: '#C98A7E', fillOp: 70, bleed: .3, tex: .4, border: .1, ink: null });          // her corner of the wall
    paint([[-900, 900], [2800, 900], [2800, 1700], [-900, 1700]], { wash: '#6A4658', fill: '#4A2E40', fillOp: 70, bleed: .04, tex: .6, border: .3, ink: PAL.ink, sw: 1 });
    // backdrop: deep plum with a slowly turning golden sunburst behind the podium
    paint(rectPts(-700, 60, 1610, 650), { wash: '#6B2C48', fill: '#4A1C36', fillOp: 90, bleed: .05, tex: .6, ink: null });
    const sun = [SC.x, 330];
    clipTo(rectPts(-700, 60, 1610, 632), () => { for (let k = 0; k < 18; k++) { const a0 = k / 18 * TAU + t * .08, a1 = a0 + TAU / 36; paint([sun, [sun[0] + Math.cos(a0) * 1100, sun[1] + Math.sin(a0) * 1100], [sun[0] + Math.cos(a1) * 1100, sun[1] + Math.sin(a1) * 1100]], { wash: '#8C3A52', washOp: 160, ink: null }); } });
    paint(ellPts(sun[0], sun[1], 105, 105, 30), { wash: '#E8B85C', fill: '#C58E36', fillOp: 70, tex: .5, ink: PAL.ink, sw: 1 });
    paint(starPts(sun[0], sun[1], 76, .45, 8, t * .2), { wash: '#FFE08A', ink: PAL.ink, sw: .8 });
    // the stage: floor band, gold lip, front face
    paint([[-900, 690], [900, 690], [900, 736], [-900, 736]], { wash: '#9A6A48', fill: '#6E4630', fillOp: 70, tex: .6, ink: PAL.ink, sw: 1 });
    for (let i = -8; i < 9; i++) inkLine([[i * 110, 692], [i * 110 - 30, 734]], .5, '#6E4630', 'fine', 0, .6);
    paint([[-900, 736], [900, 736], [900, 900], [-900, 900]], { wash: '#5A2C3A', fill: '#3A1826', fillOp: 70, tex: .5, ink: PAL.ink, sw: 1.1 });
    paint(rectPts(-900, 736, 1800, 12), { wash: '#E0AE52', ink: PAL.ink, sw: .8 });
    for (let i = -6; i < 6; i++) paint(ellPts(i * 150 + 40, 822, 28, 28, 14), { wash: '#6E3446', ink: '#C8964A', sw: .8 });
    // spotlights on the scroll
    if (lightsOn > .02) for (const [lx, ly] of [[-160, -120], [860, -120]]) {
      const tx = SC.x + Math.sin(t * .9 + lx) * 50, ty = 600, dx = tx - lx, dy = ty - ly, l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l;
      paint([[lx - nx * 26, ly - ny * 26], [lx + nx * 26, ly + ny * 26], [tx + nx * 250, ty + ny * 250 + 130], [tx - nx * 250, ty - ny * 250 + 130]], { wash: '#FFF1C8', washOp: 38 * lightsOn, ink: null });
      light(tx, 716, 260, '#FFE7A8', .3 * lightsOn);
    }
    // podium + megaphone blaring on every beat
    const blast = t < tDef ? pulse(t, 5) : 0, droop = elasticOut(seg(t, tDef + .1, tDef + .8));
    if (t < tDef) for (let k = 0; k < 3; k++) {
      const a = frac(bpOf(t)) * .5 + k * .33, r = 50 + a * 300, ang = -.5, o0 = [152 + Math.cos(ang) * 140, 505 + Math.sin(ang) * 140], arc = [];
      for (let q = -5; q <= 5; q++) { const b = ang + q * .11; arc.push([o0[0] + Math.cos(b) * r, o0[1] + Math.sin(b) * r]); }
      inkLine(arc, 3.4 * (1 - a * .6), '#FFE08A', 'marker', .5, (1 - a) * .9);
    }
    paint([[70, 715], [230, 715], [210, 540], [90, 540]], { wash: '#7A4430', fill: '#4E2A1C', fillOp: 70, tex: .6, ink: PAL.ink, sw: 1.2 });
    paint(rrPts(62, 520, 176, 30, 6), { wash: '#8E5438', ink: PAL.ink, sw: 1 });
    paint(starPts(150, 625, 34, .45, 5), { wash: '#E8B85C', ink: PAL.ink, sw: .8 });
    inkLine([[152, 520], [152, 505]], 5, '#6E4A2E', 'marker', 0);
    megaphone(152, 505, 1.05, droop, blast, t);
    if (droop > 0 && t < tDef + 1.2) { const a = seg(t, tDef + .25, tDef + 1.1); paint(ellPts(152 + 60 + a * 30, 505 + 120 + a * 40, 10 + 18 * a, 8 + 12 * a, 12), { wash: '#FFF6E6', washOp: 200 * (1 - a), ink: PAL.ink, sw: .5 * (1 - a) }); }
    // the endless scroll
    const bonkA = t - tBonk, bob = bonkA > 0 ? -16 * Math.exp(-bonkA * 6) * Math.cos(bonkA * 26) : 0;
    push(); translate(0, bob); declaration(t, F, dfl, spin); pop();
    paint(rrPts(SC.x - SC.w / 2 - 36, SC.rod - 10 + bob * .4, SC.w + 72, 20, 10), { wash: '#E0AE52', fill: '#B7832C', fillOp: 70, ink: PAL.ink, sw: 1 });   // the rod
    for (const sd of [-1, 1]) paint(ellPts(SC.x + sd * (SC.w / 2 + 40), SC.rod + bob * .4, 16, 16, 12), { wash: '#F2C66A', ink: PAL.ink, sw: .9 });
    for (const sd of [-1, 1]) inkLine([[SC.x + sd * 140, 40], [SC.x + sd * (SC.w / 2 + 28), SC.rod - 4 + bob * .4]], .8, PAL.ink, 'fine', 0);
    if (bonkA > 0 && bonkA < .45) for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + (k - 2) * .42, r0 = 50 + bonkA * 220; inkLine([[SC.x + Math.cos(a) * r0 * 2.2, SC.rod + 10 + Math.sin(a) * r0 * .7], [SC.x + Math.cos(a) * (r0 + 34) * 2.2, SC.rod + 10 + Math.sin(a) * (r0 + 34) * .7]], 1.6, '#FFE7A8', 'ink', 0, 1 - bonkA / .45); }
    // deflating: air puffs escape along the edges
    if (dfl > .02 && t < tRoll + .15) for (let k = 0; k < 6; k++) {
      const a = frac((t - tDef) * 1.7 + k / 6), y = 200 + k * 80, sd = k % 2 ? 1 : -1, ex = SC.x + sd * (SC.w * .4 + 26 + a * 90), ey = y - a * 50;
      paint(ellPts(ex, ey, 14 + a * 26, 10 + a * 18, 12), { wash: '#FFF6E6', washOp: 230 * (1 - a), ink: PAL.ink, sw: .5 * (1 - a) });
      inkLine([[ex - sd * 30, ey + 4], [ex - sd * 60, ey + 8]], .9, PAL.cream, 'fine', 0, 1 - a);
    }
    // fanfare confetti while it is grand
    if (t < tDef + .3) for (let k = 0; k < 24; k++) {
      const x0 = -300 + hash(k * 3.1) * 1150, sp = 150 + hash(k) * 110, ph = hash(k * 7.7), y = ((t - 144) * sp + ph * 820) % 820 + 60;
      push(); translate(x0 + Math.sin(t * 3 + k) * 20, y); rotate(t * 5 + k);
      paint(rectPts(-7, -4, 14, 8), { wash: ['#F6C85F', '#E2557F', '#FFF1C2', '#E0AE52'][k % 4], washOp: 230 * (1 - seg(t, tDef, tDef + .3)), ink: null }); pop();
    }
    // curtains, valance and the gold proscenium frame
    for (const [x0, x1, sd] of [[-700, -170, -1], [780, 900, 1]]) {
      const pts = [[x0, 40]]; for (let k = 0; k <= 8; k++) pts.push([x1 + Math.sin(k * 1.4 + t * .8) * 8 - sd * k * 4, 40 + k * 108]);
      pts.push([x0, 900]);
      paint(pts, { wash: '#B23A52', fill: '#7A1E36', fillOp: 90, bleed: .05, tex: .6, border: .4, ink: PAL.ink, sw: 1.2, curv: .3 });
      for (let k = 1; k < 4; k++) inkLine([[lerp(x0, x1, k / 4), 60], [lerp(x0, x1, k / 4) + sd * 10, 880]], 1, '#7A1E36', 'fine', .3, .8);
    }
    const val = [[-700, 26], [960, 26]]; for (let k = 22; k >= 0; k--) val.push([-700 + k * 75.5, 120 + (k % 2 ? 0 : 24)]);
    paint(val, { wash: '#B23A52', fill: '#7A1E36', fillOp: 80, tex: .5, ink: PAL.ink, sw: 1.1, curv: .2 });
    inkLine(val.slice(2), 3, '#E0AE52', 'marker', .3);
    paint(rectPts(900, 10, 58, 900), { wash: '#E0AE52', fill: '#B7832C', fillOp: 70, tex: .5, ink: PAL.ink, sw: 1 });
    paint(rectPts(-700, 6, 1658, 26), { wash: '#E0AE52', fill: '#B7832C', fillOp: 70, tex: .5, ink: PAL.ink, sw: 1 });
    if (lightsOn < 1) paint(rectPts(-900, -500, 1858, 1410), { wash: '#160C26', washOp: 165 * (1 - lightsOn), ink: null });   // the stage goes dark

    // ---- her little corner: a desk, a lamp, the monitor with the app ----
    glow(1200, 760, 620, PAL.lamp, .5); light(1230, 720, 420, '#FFD9A0', .18);
    paint(ellPts(1200, 952, 280, 22, 20), { fill: PAL.ink, fillOp: 70, bleed: .2, ink: null });
    for (const lx of [1005, 1395]) paint(rectPts(lx - 12, 860, 24, 92), { wash: PAL.woodDk, ink: PAL.ink, sw: .9 });
    paint([[980, 850], [1420, 850], [1420, 868], [980, 868]], { wash: PAL.wood, fill: PAL.woodDk, fillOp: 60, tex: .5, ink: PAL.ink, sw: 1.1 });
    monitor(MON3.x, MON3.y, MON3.w, MON3.h, { on: 1, t, screen: r => appScreen(r, t, .8) });
    deskLamp(1392, 850, .42, 1);
    sodaCan(1372, 850, .4, { drops: .5 });
    const stuck = t >= tNote;
    if (stuck) { const p = backOut(seg(t, tNote, tNote + .2)), k = .38 * (1 + .3 * (1 - p)); stickyNote(NOTE3[0], NOTE3[1], k, '#FFF1A8', -.14, 0); paint(heartPts(NOTE3[0] + 1, NOTE3[1] + 2, 15 * k), { wash: '#F27D9A', ink: null }); }

    // ---- she walks past it all, humming; 桃桃 skips along behind ----
    const hs = 30, ms = 24, walkT = seg(t, 144.2, 146.5), hx = lerp(-250, 965, walkT), walking = walkT > 0 && walkT < 1;
    const mwalk = seg(t, 144.3, 146.55), mx = lerp(-420, 830, mwalk), mwk = mwalk > 0 && mwalk < 1;
    const hop = t > tNote - .25 && t < tNote + .3 ? Math.sin(Math.PI * seg(t, tNote - .25, tNote + .3)) : 0;
    const lookBack = seg(t, tDef + .2, tDef + .45);
    const hMood = mood(t, [[144, 'closed', null, 'smile'], [146.45, 'normal', null, 'smile'], [tNote + .05, 'sparkle', null, 'open'], [tDef + .25, 'look', null, 'o'], [tBonk - .05, 'happy', null, 'grin']]);
    const ph = t * 1.9;
    const hO = { outfit: 'home', ...hMood, blush: .7, seed: 1,
      walk: walking ? ph : null, dy: walking ? -Math.abs(Math.sin(ph * Math.PI)) * .45 : -hop * 1.0, sq: walking ? .04 * Math.cos(ph * TAU) : .05 * hop,
      aL: walking ? -1.05 + .3 * Math.sin(ph * Math.PI) : -1.1, aR: walking ? .1 + .08 * Math.sin(t * 5) : -1.1,
      rot: walking ? .04 * Math.sin(ph * Math.PI) : 0, tilt: walking ? .1 * Math.sin(t * 2.4) : -.05 * hop,
      lookX: lerp(walking ? .1 : .6, -1, lookBack), lookY: t > tNote - .6 && t < tNote + .3 ? .5 : 0,
      handR: t < tNote ? ((s, sw) => { stickyNote(.25 * s, -.5 * s, .32 * s / 26, '#FFF1A8', .1, 0); paint(heartPts(.25 * s, -.46 * s, 5 * s / 26), { wash: '#F27D9A', ink: null }); }) : null };
    if (!walking && t < tNote + .6) { const r = t < tNote ? backOut(seg(t, 146.55, 146.9)) : 1 - seg(t, tNote + .12, tNote + .45); hO.aR = lerp(-1.1, t < tNote - .3 ? .35 : -.18, r); }
    const nod = t > tNote + .22 && t < tDef - .05 ? Math.max(0, Math.sin((t - tNote - .22) / .3 * Math.PI)) : 0;
    const mMood = mood(t, [[144, 'normal', null, 'o'], [145.1, 'wide', null, 'O'], [145.55, 'happy', null, 'cat'], [tNote + .15, 'happy', null, 'smile'], [tDef + .25, 'wide', '!', 'o'], [tBonk - .05, 'closed', null, 'grin']]);
    const mph = t * 2.2;
    const mO = { ...mMood, emote: null, seed: 3, blush: .8, walk: mwk ? mph : null,
      dy: mwk ? -Math.abs(Math.sin(mph * Math.PI)) * (t > 145.55 ? 1.0 : .3) : nod * .1, sq: nod * .1,
      aL: mwk ? -.7 + .4 * Math.sin(mph * Math.PI) : -1.1, aR: mwk ? -.7 - .4 * Math.sin(mph * Math.PI) : -1.1,
      lookX: t < 145.55 ? -.2 : lerp(.8, -1, lookBack), lookY: t < 145.55 ? -.9 : nod * .9, tilt: mwk ? .08 * Math.sin(t * 3) : 0 };
    momo(mx, 950, ms, mO);
    if (mMood.emote) emote(mMood.emote, mx - 3.3 * ms, 950 + (mO.dy || 0) * ms - 10.4 * ms, ms * .9, mMood.emoteK);
    hero(hx, 950, hs, hO);
    if (t < 146.7) for (let k = 0; k < 3; k++) {                      // she hums as she walks: little notes float up
      const ph = frac((t - 144) * .9 + k / 3), a = Math.sin(Math.PI * ph) * (1 - seg(t, 146.3, 146.7));
      noteGlyph(hx + 60 + ph * 70 + 16 * Math.sin(ph * 9 + k), 950 - 10.2 * hs - ph * 120, 1.1 + .2 * (k % 2), a, k % 2 ? -1 : 1);
    }
    if (stuck && t < tNote + 1.2) glow(NOTE3[0], NOTE3[1], 70, '#FFB3C8', .6 * (1 - seg(t, tNote + .3, tNote + 1.2)));
    if (nod > .05) for (let q = 0; q < 2; q++) {                      // little manga nod marks by her head (こくこく)
      const hx0 = mx - 3.2 * ms - q * 22, hy0 = 950 - 8.8 * ms + q * 30;
      inkLine([[hx0 + 16, hy0 - 18], [hx0, hy0], [hx0 + 6, hy0 + 18]], 1.8, PAL.ink, 'ink', .5, nod);
    }
    if (stuck && t < tNote + .6) for (let k = 0; k < 7; k++) { const a = k / 7 * TAU, e = seg(t, tNote, tNote + .6); sparkle(NOTE3[0] + Math.cos(a) * (18 + 50 * e), NOTE3[1] + Math.sin(a) * (18 + 42 * e), 8 + 4 * (k % 2), k % 2 ? '#FFF3C0' : '#FFD1E0', e); }
    camEnd();
  }

  // =====================================================================================================
  // 4) again — 好用又好看 就值得我再做一遍
  //    The finished little app shines on her monitor (桃桃 waving in it). We pull back: she and 桃桃 flank the desk,
  //    admiring it; they hop together for a high five (啪), roll up their sleeves on the beats, and a big ↻ arrow is
  //    drawn around them — once more! The rays spin up, sparkles gather, and the pink wash carries us into chorus 2.
  // =====================================================================================================
  const MON4 = { x: 960, y: 500, w: 620, h: 420 }, GY4 = 940;
  // a sleeve pushed up the arm (hook space: +x along the arm, the hand at the origin); k 0..1
  const sleeveUp = (k, top, s, sw) => {
    if (k <= .01) return;
    const L = .95 * s * k, x0 = -.1 * s - L;
    paint(rrPts(x0, -.27 * s, L + .1 * s, .54 * s, .25 * s), { wash: SKN, ink: PAL.ink, sw: sw * .6 });
    paint(rrPts(x0 - .22 * s, -.4 * s, .34 * s, .8 * s, .16 * s), { wash: top, fill: mixCol(top, PAL.ink, .2), fillOp: 60, ink: PAL.ink, sw: sw * .7 });
    paint(ellPts(0, 0, .37 * s, .35 * s, 12), { wash: SKN, ink: PAL.ink, sw: sw * .6 });
  };
  function arrowLoop(cx, cy, rx, ry, a0, span, p, w, head, rot = 0) {   // the ↻ drawn clockwise from a0
    if (p <= .005) return;
    const n = Math.max(3, Math.round(90 * p)), pts = [];
    for (let i = 0; i <= n; i++) { const a = a0 + span * p * i / n; pts.push([cx + Math.cos(a + rot) * rx, cy + Math.sin(a + rot) * ry]); }
    glow(cx + Math.cos(a0 + span * p + rot) * rx, cy + Math.sin(a0 + span * p + rot) * ry, 120, '#FFE7A8', .5);
    // a calligraphic stroke: it starts thin and swells towards the arrow head
    ribbon(pts, i => { const u = i / n * p; return lerp(8, w, Math.pow(u, .4)) * (1 + .07 * Math.sin(i * .7)); }, () => 0, { cF: '#FFC45C', cB: '#FFC45C', cL: '#FFF1C4', sw: 1.4 });
    const [ex, ey] = pts[pts.length - 1];
    if (head > .01) {
      const a = a0 + span * p + rot, tx = -Math.sin(a) * rx, ty = Math.cos(a) * ry, tl = Math.hypot(tx, ty), ux = tx / tl, uy = ty / tl, hs = 64 * backOut(head);
      paint([[ex + ux * hs, ey + uy * hs], [ex - uy * hs * .8 - ux * hs * .35, ey + ux * hs * .8 - uy * hs * .35], [ex + uy * hs * .8 - ux * hs * .35, ey - ux * hs * .8 - uy * hs * .35]], { wash: '#FFC857', ink: PAL.ink, sw: 1.6 });
    } else { glow(ex, ey, 60, '#FFF1C2', .7); sparkle(ex, ey, 26, '#FFF6D0', .5); }
  }

  function again(t, lt) {
    const tTurn = B(250) + .1, tFive = B(251), tSL = B(252), tSR = B(253), tDraw = 152.1, tHead = B(255), tPump = B(254);
    const hype = ease(seg(t, tSL, 153.8));
    // camera: start on the shining screen, pull back to the two of them, then push in as the energy builds
    const zb = kf(t, [[148.7, 2.35], [149.75, 2.2], [150.45, 1.3], [151.2, 1.38], [152.05, 1.36], [152.65, 1.02], [153.9, 1.16]], easeInOut) + .02 * pulse(t, 4) * seg(t, 150.5, 150.7);
    const cxb = 960, cyb = kf(t, [[148.7, 470], [149.75, 475], [150.45, 650], [151.2, 700], [152.05, 700], [152.65, 612], [153.9, 622]], easeInOut);
    const shk = t > tHead ? shakeXY(t, 5 * Math.exp(-(t - tHead) * 5)) : [0, 0];
    camBegin(cxb + shk[0], cyb + shk[1], zb, t > 153.2 ? -.03 * easeIn(seg(t, 153.2, 154.2)) : 0);

    // ---- warm backdrop with rays that spin up with the energy ----
    paint(rectPts(-600, -500, W + 1200, H + 1000), { grad: [mixCol('#F6CFD8', '#F7B8CC', hype), mixCol('#FDE5CF', '#FFD9B8', hype), Math.PI / 2], ink: null });
    const rs = t * .15 + easeIn(seg(t, tSL, 154)) * 3.2;
    for (let k = 0; k < 16; k++) { const a0 = k / 16 * TAU + rs, a1 = a0 + TAU / 32; paint([[MON4.x, MON4.y], [MON4.x + Math.cos(a0) * 1800, MON4.y + Math.sin(a0) * 1800], [MON4.x + Math.cos(a1) * 1800, MON4.y + Math.sin(a1) * 1800]], { wash: '#FFFFFF', washOp: 30 + 40 * hype, ink: null }); }
    glow(MON4.x, MON4.y, 900, '#FFE9B8', .45 + .25 * hype);
    for (let i = 0; i < 16; i++) {
      const bx = hash(i * 3.3) * 2200 - 140, by = (hash(i * 5.1) * 1300 - t * (30 + 40 * hash(i)) * (1 + 3 * hype)) % 1300; 
      bokeh(bx, (by + 1300) % 1300 - 110, 18 + 22 * hash(i * 1.7), [PAL.pinkLt, '#FFE3B8', PAL.cream, '#D8F0E4'][i % 4], .35 + .2 * Math.sin(t * 2 + i));
    }
    // ---- the desk and the monitor with the finished app ----
    paint([[-600, 880], [W + 600, 880], [W + 600, H + 600], [-600, H + 600]], { wash: '#F3C9B8', fill: '#E0A38E', fillOp: 50, bleed: .05, tex: .5, ink: null });
    paint(ellPts(960, 948, 520, 30, 24), { fill: PAL.ink, fillOp: 50, bleed: .2, ink: null });
    for (const lx of [600, 1320]) paint(rectPts(lx - 14, 790, 28, 150), { wash: PAL.woodDk, ink: PAL.ink, sw: 1 });
    paint([[560, 770], [1360, 770], [1360, 792], [560, 792]], { wash: PAL.wood, fill: PAL.woodDk, fillOp: 60, tex: .5, ink: PAL.ink, sw: 1.2 });
    glow(MON4.x, MON4.y, 520, PAL.screen, .25 + .2 * pulse(t, 3));
    const scr = monitor(MON4.x, MON4.y, MON4.w, MON4.h, { on: 1, t, screen: r => {
      appScreen(r, t, 1, { pop: seg(t, 148.9, 149.5), momoEyes: t > 149.5 ? 'star' : 'happy' });
      for (const [a, b] of [[B(249) - .15, .5], [B(250) - .25, .55]]) {             // light sweeps across the glass
        const g = seg(t, a, a + b); if (g <= 0 || g >= 1) continue;
        const x = lerp(r.x - 200, r.x + r.w + 200, easeInOut(g));
        paint([[x - 60, r.y - 10], [x + 30, r.y - 10], [x - 90, r.y + r.h + 10], [x - 180, r.y + r.h + 10]], { wash: '#FFFFFF', washOp: 120 * Math.sin(g * Math.PI), ink: null });
      }
    } });
    stickyNote(MON4.x - MON4.w / 2 + 24, MON4.y + MON4.h / 2 - 20, .5, '#FFF1A8', -.14, 0);
    paint(heartPts(MON4.x - MON4.w / 2 + 25, MON4.y + MON4.h / 2 - 18, 9), { wash: '#F27D9A', ink: null });
    mug(1270, 770, .8, PAL.rose, .6);
    sodaCan(640, 770, .7, { drops: .6 });
    for (const [bt, x, y] of [[B(249), MON4.x - MON4.w / 2 + 10, MON4.y - MON4.h / 2 + 10], [B(249) + .3, MON4.x + MON4.w / 2 - 10, MON4.y - MON4.h / 2 + 30], [B(250), MON4.x + MON4.w / 2 - 20, MON4.y + MON4.h / 2 - 30], [B(250) + .3, MON4.x - MON4.w / 2 + 40, MON4.y + 40]]) {
      const a = seg(t, bt - .05, bt + .55); if (a > 0 && a < 1) sparkle(x, y, 46, '#FFF6D0', a);
    }

    // ---- the two of them ----
    const hs = 34, ms = 27;
    const turn = seg(t, tTurn - .12, tTurn + .12), hopIn = seg(t, tTurn - .1, tFive - .02);
    const hxp = lerp(390, 865, easeInOut(hopIn)), mxp = lerp(1530, 1055, easeInOut(hopIn));
    const hop = Math.sin(Math.PI * hopIn) * 1.2, five = t > tFive - .12 && t < tFive + .35 ? Math.sin(Math.PI * seg(t, tFive - .12, tFive + .35)) : 0;
    const back = t < tTurn;
    const pump = t > tPump - .05 ? Math.exp(-(t - tPump) * 4) : 0, jump = t > tHead - .15 ? Math.sin(Math.PI * seg(t, tHead - .15, tHead + .5)) : 0;
    const sl = backOut(seg(t, tSL - .05, tSL + .2)), sr = backOut(seg(t, tSR - .05, tSR + .2));
    const hMood = mood(t, [[148, 'sparkle'], [tTurn, 'happy', null, 'grin'], [tFive + .05, 'star', 'spark', 'open'], [tSL - .1, 'sparkle', null, 'grin'], [tHead - .05, 'star', null, 'open']]);
    const mMood = mood(t, [[148, 'sparkle'], [tTurn, 'happy', null, 'open'], [tFive + .05, 'star', null, 'grin'], [tSL - .1, 'sparkle', null, 'grin'], [tHead - .05, 'star', 'heart', 'open']]);
    const beatBob = t > tSL ? move('bounce', t, 1) : { dy: 0, sq: 0 };
    const determined = t > tSL - .1 && t < tHead - .05 ? 'angry' : null;
    // arms: admire → high five (her right, 桃桃's left) → sleeves out on the beats → fists pumped → jump
    let hAL = -1.15, hAR = -1.15, mAL = -1.15, mAR = -1.15;
    if (!back) {
      hAR = lerp(-1.1, .35, clamp(five * 1.6)); mAL = lerp(-1.1, .35, clamp(five * 1.6));
      if (t > tFive + .35) { hAR = -1.1; mAL = -1.1; }
      const outL = seg(t, tSL - .25, tSL - .05) * (1 - seg(t, tSR + .35, tSR + .55)), outR = seg(t, tSR - .25, tSR - .05) * (1 - seg(t, tSR + .35, tSR + .55));
      hAL = lerp(hAL, .18, outL); mAL = lerp(mAL, .18, outL); hAR = lerp(hAR, .18, outR); mAR = lerp(mAR, .18, outR);
      const up = Math.max(clamp((t - tPump + .1) * 6) * (1 - clamp((t - tPump - .45) * 4)), clamp((t - tHead + .15) * 6));
      hAL = lerp(hAL, .25 + .12 * Math.sin(t * 10), up); hAR = lerp(hAR, .25 - .12 * Math.sin(t * 10), up); mAL = lerp(mAL, .28 + .12 * Math.sin(t * 11), up); mAR = lerp(mAR, .28 - .12 * Math.sin(t * 11), up);
    }
    const lean = five * .06, tiltAway = five * .2;
    const glanceL = Math.sin(Math.PI * seg(t, tSL - .2, tSL + .3)), glanceR = Math.sin(Math.PI * seg(t, tSR - .2, tSR + .3)), glance = glanceR - glanceL;
    const hO = { outfit: 'home', ...hMood, seed: 1, blush: .8, back, brows: determined, ahoge: t > tSL ? 'perk' : 'normal',
      lookX: back ? 0 : t < tSL - .25 ? .8 : glance * .9, lookY: back ? 0 : Math.abs(glance) * .5, rot: lean, tilt: -tiltAway,
      dy: -hop * (hopIn > 0 && hopIn < 1 ? 1 : 0) - five * .5 + beatBob.dy * .6 - pump * .8 - jump * 2.2, sq: (beatBob.sq || 0) + (hMood.take || 0),
      aL: hAL, aR: hAR,
      handL: !back ? ((s, sw) => sleeveUp(sl, '#A9CFB5', s, sw)) : null, handR: !back ? ((s, sw) => sleeveUp(sr, '#A9CFB5', s, sw)) : null };
    const mO = { ...mMood, emote: null, seed: 3, blush: .9, back, brows: determined,
      lookX: back ? 0 : t < tSL - .25 ? -.8 : glance * .9, lookY: back ? 0 : Math.abs(glance) * .5, rot: -lean, tilt: tiltAway,
      dy: -hop * 1.3 * (hopIn > 0 && hopIn < 1 ? 1 : 0) - five * 1.3 + beatBob.dy * .8 - pump * 1.0 - jump * 2.6, sq: (beatBob.sq || 0),
      aL: mAL, aR: mAR,
      handL: !back ? ((s, sw) => sleeveUp(sl, '#FFF6EE', s, sw)) : null, handR: !back ? ((s, sw) => sleeveUp(sr, '#FFF6EE', s, sw)) : null };
    if (back) { hO.lookX = 0; hO.aL = -1.0; hO.aR = -1.2 + .15 * Math.sin(t * 3); mO.aL = -.9 + .2 * Math.sin(t * 6); mO.aR = -1.0; hO.tilt = .12; mO.tilt = -.1; }
    hero(hxp, GY4, hs, hO);
    momo(mxp, GY4, ms, mO);
    if (hMood.emote) emote(hMood.emote, hxp - 3.4 * hs, GY4 + hO.dy * hs - 10.2 * hs, hs * .9, hMood.emoteK);
    if (mMood.emote) emote(mMood.emote, mxp + 3.4 * ms, GY4 + mO.dy * ms - 10.4 * ms, ms * .9, mMood.emoteK);
    // the high five: a starburst where the hands meet
    const fa = t - tFive;
    if (fa > -.02 && fa < .6) {
      const p = handAt(hxp, GY4, hs, hO, 1), q = handAt(mxp, GY4, ms, mO, -1), mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2, e = seg(fa, 0, .5);
      paint(starPts(mx, my, 40 + 110 * easeOut(e), .45, 8, .2), { wash: '#FFF3C0', washOp: 255 * (1 - e), ink: PAL.ink, sw: 1.2 * (1 - e) });
      for (let k = 0; k < 8; k++) { const a = k / 8 * TAU, r0 = 50 + 150 * easeOut(e); inkLine([[mx + Math.cos(a) * r0, my + Math.sin(a) * r0], [mx + Math.cos(a) * (r0 + 40), my + Math.sin(a) * (r0 + 40)]], 2, '#FFB84D', 'ink', 0, 1 - e); }
      sfx('啪', mx + 14, my - 300, 120, '#FF8FB0', fa, { life: .8, rot: -.1, stroke: PAL.cream, strokeW: .16 });
    }
    // sleeves: a little "fwip" swoosh along each arm
    for (const [tt, side] of [[tSL, -1], [tSR, 1]]) {
      const a = t - tt; if (a < -.05 || a > .3) continue;
      for (const [x, y, s, o] of [[hxp, GY4, hs, hO], [mxp, GY4, ms, mO]]) {
        const p = handAt(x, GY4, s, o, side), sh = [x + side * .95 * s, GY4 + (o.dy || 0) * s - 3.95 * s];
        for (let k = -1; k <= 1; k++) inkLine([[lerp(p[0], sh[0], .2), lerp(p[1], sh[1], .2) + k * 14 - 30], [lerp(p[0], sh[0], .8), lerp(p[1], sh[1], .8) + k * 14 - 30]], 1.4, '#FFF6E6', 'fine', 0, 1 - seg(a, 0, .3));
      }
    }
    // ---- the ↻: drawn clockwise around them, the head pops on the beat, then it keeps spinning ----
    const dp = easeInOut(seg(t, tDraw, tHead - .06)), spinA = easeIn(seg(t, tHead, 154.3)) * 2.4;
    arrowLoop(960, 600, 560, 345, -Math.PI / 2 - .35, TAU - .75, dp, 46, seg(t, tHead - .06, tHead + .25), spinA);
    if (dp > 0 && dp < 1) { const a = -Math.PI / 2 - .35 + (TAU - .75) * dp; for (let k = 0; k < 4; k++) sparkle(960 + Math.cos(a - k * .12) * 560 + (hash(k) - .5) * 40, 600 + Math.sin(a - k * .12) * 345 + (hash(k + 3) - .5) * 40, 14 + 6 * (k % 2), k % 2 ? '#FFD1E0' : '#FFF3C0', frac(t * 3 + k * .25)); }
    // energy: sparkles gather toward them on the last beats
    if (t > tSR) for (let k = 0; k < 14; k++) {
      const ph = frac(t * 1.2 + hash(k)), a = hash(k * 5.5) * TAU, r = lerp(900, 120, easeIn(ph));
      sparkle(960 + Math.cos(a) * r, 640 + Math.sin(a) * r * .7, 12 + 10 * hash(k), k % 3 ? '#FFF3C0' : '#FFD1E0', ph);
    }
    camEnd();
    if (t > tHead) flash(.25 * Math.exp(-(t - tHead) * 5), '#FFF1F4');
  }

  // ---------- stubs for the shots still to paint ----------
  const stub = col => (t, lt) => { paint(rectPts(-40, -40, W + 80, H + 80), { wash: col, ink: null }); };
  chapter('cuteface', 135.156, 153.756, [[135.156, untangle], [139.356, cuteFaces], [144.156, noManifesto], [148.956, again]]);
  transition(135.156, 'dissolve', .8);
  transition(148.956, 'white', .36, { col: '#FFF7EE' });           // the finished app flashes on
})();
