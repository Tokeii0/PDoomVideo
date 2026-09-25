// c09_finale: 9 · 最后的副歌 (225.756–264.5). The final chorus, the grand version of every chorus motif: she wakes with
// star eyes, ties her blanket on as a cape and flies out of the window with 桃桃 on a giant paper plane folded from a
// draft page; her small loves follow in a parade; the plane's contrail paints the cold roofs pastel; windows light up
// with 桃桃's face and sky lanterns rise; they land on the crescent (one more star, the gap stays open); the grey 算了
// clouds burst into pink cotton candy; the Earth, where her one warm patch is joined by many other little lights; and
// back at the desk she writes one glowing line, waves the 落款 seal off and turns to a fresh blank page.
(() => {
  const B = n => beatT(n);
  const PAPER = '#FFF9EE', PAPER_SH = '#DCD3E6', PAPER_DK = '#B9AECB', LINE = '#8FA3C8', MARGIN = '#F2A0B4';
  const CAPE = '#8FA8D8', CAPE_DK = '#6F86B8', CAPE_STAR = '#FFF1A8';
  const WARM = ['#F7B6C8', '#FFD9A0', '#BFE3D0', '#FFE3B8', '#E3C8F0', '#F9CEDC'];

  // ---------------------------------------------------------------------------------------------------------------
  // the giant paper plane, folded from a draft page. A tiny 3D model projected with an orthographic camera that looks
  // down at elevation o.el, so it can bank, pitch and turn away from us. (x, y) is the seat on the centre fold, s the
  // half-length in px. o.riders(P, depth) is called between the far and the near wing; P(model point) → [sx, sy, depth].
  // ---------------------------------------------------------------------------------------------------------------
  function planeProj(x, y, s, o) {
    const yaw = o.yaw || 0, pitch = o.pitch || 0, roll = o.roll || 0, el = o.el ?? .36;
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch), cr = Math.cos(roll), sr = Math.sin(roll), ce = Math.cos(el), se = Math.sin(el);
    return ([px, py, pz]) => {
      const y1 = py * cr - pz * sr, z1 = py * sr + pz * cr;
      const x2 = px * cp - z1 * sp, z2 = px * sp + z1 * cp;
      const x3 = x2 * cy - y1 * sy, y3 = x2 * sy + y1 * cy;
      return [x + x3 * s, y - (z2 * ce + y3 * se) * s, y3 * ce - z2 * se];
    };
  }
  const SEAT = [.12, 0, 0];                       // model point of her seat (the plane's origin is the fold middle)
  function paperPlane(x, y, s, t, o = {}) {
    const P = planeProj(x, y, s, o), sw = clamp(s / 300, .5, 1.6), fl = o.flutter ?? 1;
    const f = k => .035 * fl * Math.sin(t * 13 + k) + .015 * fl * Math.sin(t * 29 + k * 2);
    const N = [1.08, 0, 0], T = [-1, 0, 0];
    const wing = sd => [N, [-.35, sd * .36, .04 + f(1) * .3], [-1, sd * .66, .09 + f(sd)], [-1.02, sd * .36, .05 + f(sd + 2)], T];
    const keel = [N, T, [-1, 0, -.3], [-.4, 0, -.2]];
    const faces = [
      { k: 'wing', sd: 1, pts: wing(1) }, { k: 'wing', sd: -1, pts: wing(-1) }, { k: 'keel', pts: keel }
    ].map(F => { const pp = F.pts.map(P); return { ...F, pp, d: pp.reduce((a, p) => a + p[2], 0) / pp.length }; });
    faces.sort((a, b) => b.d - a.d);
    const riderD = P([SEAT[0], 0, .3])[2];
    let ridersDone = !o.riders;
    if (o.shadow) paint(ellPts(o.shadow[0], o.shadow[1], s * .9, s * .12, 18), { fill: PAL.ink, fillOp: 50, bleed: .25, tex: .2, ink: null });
    for (const F of faces) {
      if (!ridersDone && F.k === 'wing' && F.d < riderD) { o.riders(P); ridersDone = true; }
      const pts = F.pp.map(p => [p[0], p[1]]);
      // which side faces us? (screen winding of the triangle nose / tail / tip)
      const a = pts[0], b = pts[F.k === 'keel' ? 1 : 4], c = pts[F.k === 'keel' ? 2 : 2];
      const cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
      const top = F.k === 'keel' ? false : (cross * (F.sd || 1)) > 0;
      const col = F.k === 'keel' ? PAPER_SH : top ? PAPER : mixCol(PAPER_SH, PAPER, .35);
      paint(pts, { wash: col, fill: top ? '#EFE4D6' : PAPER_DK, fillOp: top ? 70 : 90, bleed: .03, tex: .35, border: .25, ink: PAL.ink, sw: sw * 1.1 });
      if (F.k === 'wing') {
        // the draft page's ruled lines, a pink margin, a scribble of handwriting and the fold crease, all in the wing plane
        const sd = F.sd, W = u => .66 * (1 - u) / 2;                                      // half-span at x = u
        clipTo(pts, () => {
          for (let i = 0; i < 7; i++) {
            const u = .78 - i * .27, w = W(u) * 2.02;
            const p0 = P([u, sd * .02, 0]), p1 = P([u - .12, sd * w, .09 * w / .66]);
            inkLine([[p0[0], p0[1]], [p1[0], p1[1]]], sw * .7, LINE, 'pencil', 0, .55);
          }
          const m0 = P([.7, sd * .1, .01]), m1 = P([-1, sd * .18, .02]);
          inkLine([[m0[0], m0[1]], [m1[0], m1[1]]], sw * .6, MARGIN, 'fine', 0, .55);
          if (top) for (let r = 0; r < 3; r++) {                                            // handwriting between two lines
            const u0 = .35 - r * .27, sc = [];
            for (let k = 0; k <= 16; k++) { const u = u0 - .02 - k * .012, v = .2 + k * .018; const q = P([u, sd * v, .02 + .03 * Math.sin(k * 2.2 + r)]); sc.push([q[0] + Math.sin(k * 1.9 + r * 3) * s * .012, q[1] + Math.cos(k * 2.3 + r) * s * .01]); }
            inkLine(sc, sw * .5, '#6E7896', 'pencil', .6, .8);
          }
          if (top && o.doodle !== false) {                                                   // a tiny pencil star doodle near the tail
            const c = P([-.72, sd * .4, .06]);
            paint(starPts(c[0], c[1], s * .055, .45, 5, -Math.PI / 2 + .2), { ink: '#7A7F9C', sw: sw * .5, br: 'pencil' });
          }
        });
        const c0 = P([1.02, 0, 0]), c1 = P([-1, sd * .36, .05 + f(sd + 2)]);           // the dart fold crease
        inkLine([[c0[0], c0[1]], [lerp(c0[0], c1[0], .98), lerp(c0[1], c1[1], .98)]], sw * .5, PAL.ink, 'fine', 0, .45);
      }
    }
    if (!ridersDone) o.riders(P);
    return P;
  }

  // ---------------------------------------------------------------------------------------------------------------
  // her blanket, tied on as a cape: a rippling ribbon from the back of her neck. (x, y, s) = her ground point and unit
  // (the same as hero()); o.dir = -1 streams to the left; o.wind 0..1; o.lift tilts it up; paint BEFORE hero().
  // capeKnot() paints the tie under her chin (AFTER hero()).
  // ---------------------------------------------------------------------------------------------------------------
  function capePts(x, y, s, t, o) {
    const dir = o.dir ?? -1, wind = o.wind ?? 1, dy = (o.dy || 0) * s, lift = o.lift ?? .15, n = 14;
    const R0 = [x + dir * .25 * s, y + dy - 4.5 * s], R1 = [x + dir * 1.25 * s, y + dy - 1.45 * s];
    const L = s * lerp(3.4, 6.2, wind);
    // free end: streaming out behind (wind 1) or hanging down (wind 0)
    const F0 = [R0[0] + dir * lerp(.5 * s, L, wind), R0[1] + lerp(2.9 * s, -lift * L, wind)];
    const F1 = [R1[0] + dir * lerp(.9 * s, L * 1.08, wind), R1[1] + lerp(1.6 * s, (.35 - lift) * L, wind)];
    const top = [], bot = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n, e = Math.pow(u, 1.15);
      const wv = (Math.sin((u * 1.25 - t * (1.4 + wind)) * TAU) * .5 + Math.sin((u * 2.6 - t * 2.9) * TAU) * .16) * s * wind * e * 1.1;
      const bl = Math.sin(u * Math.PI) * s * .5 * wind;                                   // the cloth bellies out
      top.push([lerp(R0[0], F0[0], e), lerp(R0[1], F0[1], e) + wv - bl * .6]);
      bot.push([lerp(R1[0], F1[0], e), lerp(R1[1], F1[1], e) + wv * 1.15 + bl * .3]);
    }
    return { top, bot, dir };
  }
  function cape(x, y, s, t, o = {}) {
    const { top, bot } = capePts(x, y, s, t, o), sw = clamp(s / 19, .32, 2.3);
    const poly = [...top, ...bot.slice().reverse()];
    paint(poly, { wash: o.col || CAPE, fill: o.dk || CAPE_DK, fillOp: 90, bleed: .05, tex: .45, border: .35, ink: PAL.ink, sw: sw * .85, curv: .3 });
    // the lining along the top edge and a soft fold
    const lin = top.map((p, i) => [lerp(p[0], bot[i][0], .12), lerp(p[1], bot[i][1], .12)]);
    paint([...top, ...lin.slice().reverse()], { wash: o.lining || '#FBE3EC', washOp: 230, ink: null, curv: .3 });
    const mid = top.map((p, i) => [lerp(p[0], bot[i][0], .6), lerp(p[1], bot[i][1], .6)]);
    inkLine(mid.slice(4), sw * .5, mixCol(o.dk || CAPE_DK, PAL.ink, .25), 'fine', .5, .6);
    // little stars on the blanket
    for (let i = 0; i < 8; i++) {
      const u = .12 + hash(i * 3.7) * .84, v = .3 + hash(i * 5.3) * .6, k = Math.round(u * (top.length - 1));
      const p = [lerp(top[k][0], bot[k][0], v), lerp(top[k][1], bot[k][1], v)];
      paint(starPts(p[0], p[1], s * (.2 + hash(i) * .12), .45, 5, hash(i * 2) * 2), { wash: CAPE_STAR, ink: null });
    }
  }
  function capeKnot(x, y, s, o = {}) {
    const sw = clamp(s / 19, .32, 2.3), dy = (o.dy || 0) * s, kx = x + (o.lookX || 0) * .2 * s, ky = y + dy - 4.3 * s;
    for (const sd of [-1, 1]) paint([[kx, ky], [kx + sd * .55 * s, ky - .3 * s], [kx + sd * .6 * s, ky + .32 * s]], { wash: o.col || CAPE, ink: PAL.ink, sw: sw * .5, curv: .2 });
    paint(ellPts(kx, ky, .22 * s, .2 * s, 8), { wash: o.dk || CAPE_DK, ink: PAL.ink, sw: sw * .45 });
    paint([[kx - .1 * s, ky + .1 * s], [kx - .35 * s, ky + .9 * s], [kx - .05 * s, ky + .75 * s]], { wash: o.col || CAPE, ink: PAL.ink, sw: sw * .4 });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // a draft page flying like a bird: folded along the middle, the two halves flap. ang = heading, flap = phase (cycles)
  // ---------------------------------------------------------------------------------------------------------------
  function paperBird(x, y, s, flap, o = {}) {
    const P = planeProj(x, y, s, { yaw: o.yaw ?? 0, pitch: o.pitch ?? 0, roll: o.roll ?? 0, el: o.el ?? .5 });
    const sw = clamp(s / 70, .35, 1.2), ph = Math.sin(flap * TAU), a = .15 + .95 * ph;          // dihedral: V up .. Λ down
    const ca = Math.cos(a), sa = Math.sin(a);
    const wing = sd => [[.5, 0, 0], [-.5, 0, 0], [-.62, sd * .8 * ca, .8 * sa - .08], [.38, sd * .8 * ca, .8 * sa + .05]];
    const ws = [1, -1].map(sd => { const pp = wing(sd).map(P); return { sd, pp, d: pp.reduce((q, p) => q + p[2], 0) / 4 }; }).sort((u, v) => v.d - u.d);
    for (const w of ws) {
      const pts = w.pp.map(p => [p[0], p[1]]);
      paint(pts, { wash: w.d > 0 ? mixCol(PAPER, PAPER_SH, .55) : PAPER, ink: PAL.ink, sw });
      for (let k = 1; k <= 3; k++) { const u = .5 - k * .25, p0 = P([u, 0, 0]), p1 = P([u - .1, w.sd * .8 * ca, .8 * sa]); inkLine([[p0[0], p0[1]], [p1[0], p1[1]]], sw * .6, LINE, 'pencil', 0, .6); }
      if (o.doodle && w.d <= 0) { const c = P([0, w.sd * .42 * ca, .42 * sa]); paint(heartPts(c[0], c[1], s * .13), { ink: PAL.rose, sw: sw * .6, br: 'pencil' }); }
    }
  }

  // 团子's paper boat (origami, side view). (x, y) = the waterline centre; s = half-length.
  function paperBoat(x, y, s, t, o = {}) {
    const sw = clamp(s / 90, .4, 1.4), r = o.rot || 0;
    push(); translate(x, y); rotate(r);
    paint([[-.55 * s, 0], [-.1 * s, -.95 * s], [.35 * s, 0]], { wash: PAPER_SH, fill: PAPER_DK, fillOp: 60, tex: .3, ink: PAL.ink, sw });   // the peak (behind)
    inkLine([[-.1 * s, -.95 * s], [-.1 * s, 0]], sw * .5, PAL.ink, 'fine', 0, .5);
    pop();
    if (o.inside) { push(); translate(x, y); rotate(r); translate(-x, -y); o.inside(); pop(); }
    push(); translate(x, y); rotate(r);
    const hull = [[-1.05 * s, -.18 * s], [1.05 * s, -.18 * s], [.62 * s, .42 * s], [-.62 * s, .42 * s]];
    paint(hull, { wash: PAPER, fill: '#EFE4D6', fillOp: 70, tex: .3, ink: PAL.ink, sw });
    for (let k = 0; k < 3; k++) inkLine([[-.8 * s + k * .05 * s, -.05 * s + k * .14 * s], [.8 * s - k * .05 * s, -.05 * s + k * .14 * s]], sw * .6, LINE, 'pencil', 0, .55);
    inkLine([[-1.05 * s, -.18 * s], [-.45 * s, .1 * s], [0, -.18 * s], [.45 * s, .1 * s], [1.05 * s, -.18 * s]], sw * .45, PAL.ink, 'fine', 0, .45);
    pop();
  }

  // a pink cotton-candy cloud with a happy face. sq squashes it (bounce).
  function candyCloud(x, y, s, o = {}) {
    const sq = o.sq || 0, k = o.k ?? 1;
    push(); translate(x, y); scale(s * (1 + sq * .45), s * (1 - sq));
    fadeIn(k, () => {
      glow(0, -10, 220, '#FFC6DA', .35);
      paint(cloudPts(0, 0, 300, 80, o.seed ?? 3, 7), { wash: '#FAD0DF', fill: '#F29BB8', fillOp: 110, bleed: .06, tex: .35, border: .3, ink: PAL.ink, sw: 1.1, curv: .45 });
      paint(cloudPts(-30, -18, 170, 44, (o.seed ?? 3) + 4, 5), { wash: '#FFE6EF', washOp: 200, ink: null, curv: .45 });
      for (const sd of [-1, 1]) inkLine([[sd * 34 - 10, -8], [sd * 34, -16], [sd * 34 + 10, -8]], 1.2, PAL.ink, 'ink', .5);
      inkLine([[-10, 6], [0, 13], [10, 6]], 1, PAL.ink, 'ink', .5);
      for (const sd of [-1, 1]) paint(ellPts(sd * 58, 4, 13, 7, 10), { fill: '#EE6F96', fillOp: 150, bleed: .2, ink: null });
    });
    pop();
  }

  // 天灯: a paper sky lantern, glowing. (x, y) = the bottom opening; s ≈ 1 is 90 px tall.
  function lantern(x, y, s, t, o = {}) {
    const sw = clamp(s, .4, 1.4), fl = .85 + .15 * Math.sin(t * 17 + (o.seed || 0) * 3), a = o.a ?? 1;
    fadeIn(a, () => {
      glow(x, y - 45 * s, 130 * s * fl, '#FFC98A', .42);
      push(); translate(x, y); rotate(o.rot || 0); scale(s);
      const body = [[-26, 0], [-38, -58], [-34, -86], [0, -94], [34, -86], [38, -58], [26, 0]];
      paint(body, { wash: '#FFE2A8', fill: '#F2A65C', fillOp: 110, bleed: .05, tex: .3, border: .5, ink: PAL.ink, sw, curv: .3 });
      paint(ellPts(0, -40, 20, 30, 12), { wash: '#FFF6D6', washOp: 170 * fl, ink: null });
      for (const k of [-.5, .5]) inkLine([[k * 30, -3], [k * 44, -58], [k * 36, -88]], sw * .5, '#C9803E', 'fine', .5, .6);
      if (o.heart) paint(heartPts(0, -52, 12), { wash: '#F29BB8', ink: PAL.ink, sw: sw * .4 });
      paint(ellPts(0, 0, 26, 6, 12), { wash: '#C9803E', ink: PAL.ink, sw: sw * .6 });
      paint([[-5, 0], [0, -14 * fl], [5, 0]], { wash: '#FFB347', ink: null, curv: .5 });
      pop();
    });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // her and 桃桃 riding: she sits on the seat with the cape streaming behind; 桃桃 behind her. fac = +1 facing right.
  // ---------------------------------------------------------------------------------------------------------------
  function rideHero(x, y, s, t, o = {}) {
    const fac = o.fac ?? 1, m = o.m || {};
    if (o.cape !== false) cape(x, y, s, t, { dir: -fac, wind: o.wind ?? 1, dy: m.dy || 0, lift: o.lift });
    hero(x, y, s, { outfit: 'pajama', sit: true, lookX: .55 * fac, noShadow: true, ...m, ...o.h });
    if (o.cape !== false) capeKnot(x, y, s, { dy: m.dy || 0, lookX: .55 * fac });
  }

  // =================================================================================================================
  // shots (filled in below)
  // =================================================================================================================
  function wakeFly(t, lt, dur) { paint(rectPts(-10, -10, W + 20, H + 20), { wash: PAL.night, ink: null }); }
  function parade(t, lt, dur) { paint(rectPts(-10, -10, W + 20, H + 20), { wash: PAL.indigo, ink: null }); }
  function paintRoofs(t, lt, dur) { paint(rectPts(-10, -10, W + 20, H + 20), { wash: PAL.navy, ink: null }); }
  function windowsGlow(t, lt, dur) { paint(rectPts(-10, -10, W + 20, H + 20), { wash: PAL.violet, ink: null }); }
  function moon(t, lt, dur) { paint(rectPts(-10, -10, W + 20, H + 20), { wash: PAL.night, ink: null }); }
  function cottonClouds(t, lt, dur) { paint(rectPts(-10, -10, W + 20, H + 20), { wash: PAL.rose, ink: null }); }
  function earthLights(t, lt, dur) { paint(rectPts(-10, -10, W + 20, H + 20), { wash: PAL.night, ink: null }); }
  function blankPage(t, lt, dur) { deskTop(t, {}); }

  // temporary model sheet (removed when the chapter is done)
  LOOPS.c09model = t => {
    paint(rectPts(-10, -10, W + 20, H + 20), { grad: ['#1B2147', '#5A4A8A', Math.PI / 2], ink: null });
    paperPlane(560, 330, 330, t, { el: .5, roll: -.05, pitch: .04, riders: P => {
      const q = P([-.42, 0, 0]); momo(q[0], q[1] + 22, 22, { sit: true, lookX: .5, noShadow: true, eyes: 'happy', mouth: 'open', aL: .9, aR: .2 });
      const p = P(SEAT); rideHero(p[0], p[1] + 26, 26, t, { fac: 1, h: { eyes: 'sparkle', mouth: 'open', aR: .5, aL: -.3 } });
    } });
    paperPlane(1450, 330, 250, t, { el: .45, yaw: 2.2, pitch: .05, riders: P => {
      const p = P(SEAT); hero(p[0], p[1], 20, { outfit: 'pajama', sit: true, back: true, noShadow: true });
    } });
    paperBird(150, 800, 80, t * 2.2, { yaw: -.3 });
    paperBird(330, 780, 80, t * 2.2 + .5, { yaw: .5, doodle: true });
    paperBird(500, 760, 80, t * 2.2 + .25, { yaw: 1.6, el: .8 });
    paperBoat(720, 850, 110, t, { inside: () => cat(740, 845, 20, { pose: 'sit', eyes: 'happy' }) });
    candyCloud(1100, 850, 1, {});
    lantern(1400, 900, 1.2, t, { heart: true });
    lantern(1550, 870, .8, t, {});
    rideHero(1750, 900, 26, t, { fac: -1, h: { eyes: 'star', mouth: 'grin' } });
  };

  chapter('finale', 225.756, 264.5, [[225.756, wakeFly], [230.556, parade], [235.356, paintRoofs], [240.156, windowsGlow],
    [244.956, moon], [249.156, cottonClouds], [253.956, earthLights], [259.356, blankPage]]);
  transition(225.756, 'white', .5);
})();
