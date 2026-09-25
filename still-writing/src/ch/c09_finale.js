// c09_finale: 9 · 最后的副歌 (225.756–264.5). The final chorus, the grand version of every chorus motif: she wakes with
// star eyes, ties her blanket on as a cape and flies out of the window with 桃桃 on a giant paper plane folded from a
// draft page; her small loves follow in a parade; the plane's contrail paints the cold roofs pastel; windows light up
// with 桃桃's face and sky lanterns rise; they land on the crescent (one more star, the gap stays open); the grey 算了
// clouds burst into pink cotton candy; the Earth, where her one warm patch is joined by many other little lights; and
// back at the desk she writes one glowing line, waves the 落款 seal off and turns to a fresh blank page.
(() => {
  const B = n => beatT(n);
  const SHEET = '#FFF9EE', SHEET_SH = '#DCD3E6', SHEET_DK = '#B9AECB', RULE = '#8FA3C8', MARGIN = '#F2A0B4';
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
    const NOSE = [1.08, 0, 0], TAIL = [-1, 0, 0];
    const wing = sd => [NOSE, [-.35, sd * .36, .04 + f(1) * .3], [-1, sd * .66, .09 + f(sd)], [-1.02, sd * .36, .05 + f(sd + 2)], TAIL];
    const keel = [NOSE, TAIL, [-1, 0, -.3], [-.4, 0, -.2]];
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
      const col = F.k === 'keel' ? SHEET_SH : top ? SHEET : mixCol(SHEET_SH, SHEET, .35);
      paint(pts, { wash: col, fill: top ? '#EFE4D6' : SHEET_DK, fillOp: top ? 70 : 90, bleed: .03, tex: .35, border: .25, ink: PAL.ink, sw: sw * 1.1 });
      if (F.k === 'wing') {
        // the draft page's ruled lines, a pink margin, a scribble of handwriting and the fold crease, all in the wing plane
        const sd = F.sd, halfSpan = u => .66 * (1 - u) / 2;                               // half-span at x = u
        clipTo(pts, () => {
          for (let i = 0; i < 7; i++) {
            const u = .78 - i * .27, w = halfSpan(u) * 2.02;
            const p0 = P([u, sd * .02, 0]), p1 = P([u - .12, sd * w, .09 * w / .66]);
            inkLine([[p0[0], p0[1]], [p1[0], p1[1]]], sw * .7, RULE, 'pencil', 0, .55);
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
    const sw = clamp(s / 70, .35, 1.2), ph = Math.sin(flap * TAU), a = .25 + 1.0 * ph;           // wing angle: V up .. Λ down
    const ca = Math.cos(a), sa = Math.sin(a), bend = Math.sin(flap * TAU - 1.2) * .35;            // the tips lag behind
    // each half of the folded page is a wing: root along the fold, tip swept back and bending with the stroke
    const wing = sd => [[.62, 0, 0], [-.55, 0, 0], [-.78, sd * .95 * ca, .95 * sa + bend * .3], [-.1, sd * 1.02 * Math.cos(a + bend), 1.02 * Math.sin(a + bend)], [.3, sd * .5 * ca, .5 * sa]];
    const ws = [1, -1].map(sd => { const pp = wing(sd).map(P); return { sd, pp, d: pp.reduce((q, p) => q + p[2], 0) / pp.length }; }).sort((u, v) => v.d - u.d);
    const head = [[.62, 0, 0], [.95, 0, -.08], [.55, 0, -.16]].map(P);
    for (const w of ws) {
      const pts = w.pp.map(p => [p[0], p[1]]);
      paint(pts, { wash: w.d > 0 ? mixCol(SHEET, SHEET_SH, .6) : SHEET, ink: PAL.ink, sw, curv: .15 });
      for (let k = 1; k <= 3; k++) { const u = .45 - k * .25, p0 = P([u, 0, 0]), p1 = P([u - .18, w.sd * .85 * ca, .85 * sa]); inkLine([[p0[0], p0[1]], [p1[0], p1[1]]], sw * .6, RULE, 'pencil', 0, .6); }
      if (o.doodle && w.d <= 0) { const c = P([-.1, w.sd * .45 * ca, .45 * sa]); paint(heartPts(c[0], c[1], s * .14), { ink: PAL.rose, sw: sw * .6, br: 'pencil' }); }
      if (w === ws[0]) paint(head.map(p => [p[0], p[1]]), { wash: SHEET_SH, ink: PAL.ink, sw: sw * .8 });
    }
  }

  // 团子's paper boat (origami, side view). (x, y) = the waterline centre; s = half-length.
  function paperBoat(x, y, s, t, o = {}) {
    const sw = clamp(s / 90, .4, 1.4), r = o.rot || 0;
    push(); translate(x, y); rotate(r);
    paint([[-.55 * s, 0], [-.1 * s, -.95 * s], [.35 * s, 0]], { wash: SHEET_SH, fill: SHEET_DK, fillOp: 60, tex: .3, ink: PAL.ink, sw });   // the peak (behind)
    inkLine([[-.1 * s, -.95 * s], [-.1 * s, 0]], sw * .5, PAL.ink, 'fine', 0, .5);
    pop();
    if (o.inside) { push(); translate(x, y); rotate(r); translate(-x, -y); o.inside(); pop(); }
    push(); translate(x, y); rotate(r);
    const hull = [[-1.05 * s, -.18 * s], [1.05 * s, -.18 * s], [.62 * s, .42 * s], [-.62 * s, .42 * s]];
    paint(hull, { wash: SHEET, fill: '#EFE4D6', fillOp: 70, tex: .3, ink: PAL.ink, sw });
    for (let k = 0; k < 3; k++) inkLine([[-.8 * s + k * .05 * s, -.05 * s + k * .14 * s], [.8 * s - k * .05 * s, -.05 * s + k * .14 * s]], sw * .6, RULE, 'pencil', 0, .55);
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
      glow(x, y - 45 * s, 150 * s * fl, '#FFC98A', .55);
      push(); translate(x, y); rotate(o.rot || 0); scale(s);
      const body = [[-26, 0], [-38, -58], [-34, -86], [0, -94], [34, -86], [38, -58], [26, 0]];
      paint(body, { grad: ['#FFEBC0', '#F6B870', Math.PI / 2], ink: PAL.ink, sw, curv: .3 });
      paint(ellPts(0, -40, 20, 30, 12), { wash: '#FFF6D6', washOp: 170 * fl, ink: null });
      for (const k of [-.5, .5]) inkLine([[k * 30, -3], [k * 44, -58], [k * 36, -88]], sw * .5, '#C9803E', 'fine', .5, .6);
      if (o.heart) paint(heartPts(0, -52, 12), { wash: '#F29BB8', ink: PAL.ink, sw: sw * .4 });
      paint(ellPts(0, 0, 26, 6, 12), { wash: '#C9803E', ink: PAL.ink, sw: sw * .6 });
      paint([[-5, 0], [0, -14 * fl], [5, 0]], { wash: '#FFB347', ink: null, curv: .5 });
      pop();
    });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // the blanket cape seen from the front (behind her) or from the back (over her back). (x, y, s) as hero(); o.dy, o.wind
  // (sideways wind, -1..1), o.lift (0..1 billow up), o.k (0..1 how far it has swung up from a plain drape).
  // ---------------------------------------------------------------------------------------------------------------
  function capeFB(x, y, s, t, o = {}) {
    const dy = (o.dy || 0) * s, w = o.wind || 0, lift = o.lift ?? .4, back = !!o.back, sw = clamp(s / 19, .32, 2.3), swg = Math.sin(clamp(o.swing || 0) * Math.PI);
    const top = y + dy - (back ? 4.3 : 4.45) * s, hemY = lerp(y + dy - lerp(.3, 1.6, lift) * s, y + dy - 3.2 * s, swg), n = 11, hem = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n, v = u * 2 - 1, fl = Math.sin(t * 7 + u * 5) * .28 * s * (.4 + lift + swg) + Math.sin(t * 11.3 + u * 9) * .1 * s;
      // swg flares it out sideways like a pair of wings (the ends lift, the middle sags behind her)
      hem.push([x + v * lerp(lerp(2.1, 3.1, lift), 6.4, swg) * s + w * 1.6 * s * (1 - Math.abs(v) * .3), hemY + fl - w * v * .9 * s - Math.cos(v * 1.5) * .25 * s - swg * (Math.pow(Math.abs(v), 1.5) * 3.2 - 1.2) * s]);
    }
    const sh = swg * 1.2 * s;                                            // with the flare the top corners ride out along her arms to her hands
    const pts = [[x - 1.0 * s, top], [x + 1.0 * s, top], [x + 1.35 * s + w * .3 * s + sh * 1.45, top + 1.2 * s - sh * .75], ...hem.slice().reverse(), [x - 1.35 * s + w * .3 * s - sh * 1.45, top + 1.2 * s - sh * .75]];
    paint(pts, { wash: o.col || CAPE, fill: o.dk || CAPE_DK, fillOp: back ? 70 : 100, bleed: .05, tex: .45, border: .35, ink: PAL.ink, sw: sw * .85, curv: .3 });
    for (let i = 0; i < 7; i++) {
      const u = hash(i * 3.7 + 1), v = .25 + hash(i * 5.3 + 2) * .65, hp = hem[Math.round(u * n)];
      const px = lerp(x + (u * 2 - 1) * 1.1 * s, hp[0], v), py = lerp(top + .6 * s, hp[1], v);
      paint(starPts(px, py, s * (.2 + hash(i) * .1), .45, 5, hash(i * 2) * 2), { wash: CAPE_STAR, ink: null });
    }
    if (back) for (const k of [-.4, .4]) inkLine([[x + k * s, top + .5 * s], [lerp(x + k * s, hem[Math.round((k + 1) / 2 * n)][0], .9), lerp(top, hemY, .9)]], sw * .5, mixCol(CAPE_DK, PAL.ink, .2), 'fine', .4, .6);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // the crew on the plane: 桃桃 near the nose, her behind with the cape streaming towards the tail. Call inside
  // paperPlane's riders hook. o: { s, fac (+1 plane flies right), back, h: hero opts, m: momo opts, wind }
  // ---------------------------------------------------------------------------------------------------------------
  function crew(P, t, o) {
    const s = o.s, fac = o.fac ?? 1, back = !!o.back, sink = o.sink ?? .9;
    const q = P([.52, 0, .02]), p = P([-.02, 0, .02]), hm = o.h || {}, mm = o.m || {};
    const drawM = () => { if (o.noMomo) return; momo(q[0], q[1] + s * sink * .8, s * .82, { lookX: back ? 0 : .45 * fac, noShadow: true, back, ...mm }); };
    const drawH = () => {
      if (o.noHero) return;
      const hx = p[0], hy = p[1] + s * sink, dy = hm.dy || 0;
      if (!back && o.cape !== false) cape(hx, hy, s, t, { dir: -fac, wind: o.wind ?? 1, dy, lift: o.lift ?? .22 });
      hero(hx, hy, s, { outfit: 'pajama', lookX: back ? 0 : .5 * fac, noShadow: true, back, ...hm });
      if (back && o.cape !== false) capeFB(hx, hy, s, t, { back: true, dy, wind: -fac * .3, lift: .75 });
      if (!back && o.cape !== false) capeKnot(hx, hy, s, { dy, lookX: .5 * fac });
    };
    if (q[2] > p[2]) { drawM(); drawH(); } else { drawH(); drawM(); }
  }

  // screen-space flock of draft pages flying like birds (for bursts and wipes)
  function flockBird(i, x, y, s, t, o = {}) { paperBird(x, y, s, t * (2.2 + hash(i) * .8) + hash(i * 3), { yaw: o.yaw ?? (hash(i * 7) - .5) * 1.2, el: o.el ?? .55, pitch: o.pitch || 0, doodle: i % 4 === 1 }); }

  // a dream bubble with her little loves floating inside; pop 0..1 bursts it into sparkles
  function dreamBubble(x, y, r, t, pop = 0) {
    if (pop >= 1) return;
    if (pop > 0) {
      for (let i = 0; i < 14; i++) { const a = i / 14 * TAU + .3, d = r * (.6 + easeOut(pop) * 1.1); sparkle(x + Math.cos(a) * d, y + Math.sin(a) * d, 12 + hash(i) * 14, i % 2 ? '#FFF3C0' : '#FFD1E0', pop); }
      return;
    }
    const wob = 1 + .03 * Math.sin(t * 3.1);
    glow(x, y, r * 1.8, '#FFE7C8', .35);
    paint(ellPts(x, y, r * wob, r / wob, 30), { wash: '#FFF4F8', washOp: 70, ink: '#F6E9F2', sw: 1.2 });
    idea(x - r * .35, y - r * .15 + Math.sin(t * 2.4) * 6, r * .16, { eyes: 'closed', glow: .6 });
    paint(heartPts(x + r * .35, y - r * .3 + Math.sin(t * 2.8 + 1) * 5, r * .15), { wash: '#F29BB8', ink: PAL.ink, sw: .7 });
    sodaCan(x + r * .3, y + r * .5 + Math.sin(t * 2 + 2) * 5, r * .006, { rot: .3, drops: 0 });
    paint(ellPts(x - r * .6, y - r * .75, r * .16, r * .12, 12), { wash: '#FFFFFF', washOp: 150, ink: null });
    for (let i = 0; i < 3; i++) dot(x - r * (1.1 + i * .3), y + r * (.9 + i * .35), r * (.12 - i * .03), '#FFF4F8', .6);
  }

  // the room window flung open (inward): the clear night view, the two casements swinging toward us. k 0..1
  function openWindow(t, k) {
    if (k <= 0) return;
    const wx = 170, wy = 110, ww = 660, wh = 500;
    clipTo(rectPts(wx, wy, ww, wh), () => {
      fadeIn(clamp(k * 3), () => {
        paint(rectPts(wx - 10, wy - 10, ww + 20, wh + 20), { grad: ['#1C2352', '#6A4F92', Math.PI / 2], ink: null });
        starField(t, { x: wx, y: wy, w: ww, h: wh * .6 }, 40, { seed: 4 });
        moonFace(700, 210, 44, { rot: -.35 });
        for (let i = 0; i < 9; i++) {                                                  // the city, far below
          const bx = wx - 20 + i * 80 + hash(i * 3.1) * 20, bh = 70 + hash(i * 5.7) * 110;
          paint(rectPts(bx, wy + wh - bh, 70, bh + 10), { wash: mixCol('#3A3F78', '#5B4C8E', hash(i)), ink: null });
          for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) if (hash(i * 17 + r * 5 + c) > .5) fillRectA(bx + 10 + c * 20, wy + wh - bh + 12 + r * 20, 9, 8, '#FFD98A', .85);
        }
        glow(500, wy + wh, 420, '#F7A9C4', .25);
      });
    });
    // casements: hinged at the outer frame, swinging in toward us
    const th = easeOut(clamp(k)) * 1.35 + Math.sin(t * 9) * .05 * clamp(k * 2) * (1 - clamp(k));
    for (const sd of [-1, 1]) {
      const hx = sd < 0 ? wx : wx + ww, fw = ww / 2 * Math.cos(th), grow = 1 + .22 * Math.sin(th);
      const fx = hx - sd * fw, y0 = wy + wh / 2 - wh / 2 * grow, y1 = wy + wh / 2 + wh / 2 * grow;
      const pane = [[hx, wy], [fx, y0], [fx, y1], [hx, wy + wh]];
      paint(pane, { wash: '#BFD3F0', washOp: 90, ink: null });
      inkLine([[hx, wy], [fx, y0], [fx, y1], [hx, wy + wh], [hx, wy]], 4.2 * (.8 + .2 * grow), '#E9DCCB', 'marker', 0);
      inkLine([[hx, wy + wh / 2], [fx, (y0 + y1) / 2]], 3.4, '#E9DCCB', 'marker', 0);
      paint(pane, { ink: PAL.ink, sw: 1 });
      paint([[lerp(hx, fx, .25), lerp(wy, y0, .25) + 30], [lerp(hx, fx, .45), lerp(wy, y0, .45) + 30], [lerp(hx, fx, .3), lerp(wy + wh, y1, .3) - 220]], { wash: '#FFFFFF', washOp: 40, ink: null });
    }
  }

  // =================================================================================================================
  // 225.756 · She wakes with star eyes, the draft pages fly up like birds, the blanket becomes a cape — and the pages
  // fold themselves into a giant paper plane that scoops her and 桃桃 off the desk and flies out of the window.
  // =================================================================================================================
  const W0 = 225.756;
  function wakeA(t, lt) {
    const bPop = B(377), bUp = B(378), bCape = B(378) + .12;
    const pull = ease(seg(t, bPop, bUp + .7));
    camBegin(960, lerp(712, 640, pull), lerp(1.36, 1.08, pull), 0);
    roomReverse(t, { lamp: .75, screen: .35 });
    // her
    const pop = seg(t, bPop, bPop + .32), stand = backOut(seg(t, bUp - .15, bUp + .2));
    const breathe = pop > 0 ? 0 : Math.sin(t * 2.3) * .06;
    const dy = lerp(1.95, -.6, backOut(pop)) - stand * .5 + breathe;
    const md = mood(t, [[W0 - 3, 'closed'], [bPop, 'star', 'spark', 'O']]), lookUp = seg(t, B(377.5), B(377.5) + .2) * (1 - seg(t, bUp - .1, bUp + .1));
    const flare = Math.sin(clamp(seg(t, bCape - .1, bCape + .55)) * Math.PI);          // arms spread wide, holding the cape out like wings
    const arms = stand > 0 ? lerp(lerp(-1.1, .36, stand) + Math.sin(t * 11) * .12 * stand, .04 + .05 * Math.sin(t * 13), flare) : -1.15;
    const swing = seg(t, bCape - .1, bCape + .55), capeOn = swing > 0;
    const hx = 960, hy = 1000, hs = 44;
    if (capeOn) capeFB(hx, hy, hs, t, { dy, swing, lift: lerp(.2, .75, easeOut(swing)) + .08 * Math.sin(t * 5), wind: Math.sin(t * 2.2) * .25 });
    else {                                                                          // the blanket, wrapped round her like a hood
      const hood = 1 - ease(seg(t, bPop, bPop + .35));
      const topY = hy + dy * hs - lerp(4.6, 10.4, hood) * hs;
      paint([[hx - 3.4 * hs, hy + dy * hs - 1.2 * hs], [hx - 3.2 * hs, topY + 2.4 * hs], [hx - 1.6 * hs, topY + .2 * hs], [hx, topY - .3 * hs], [hx + 1.6 * hs, topY + .2 * hs], [hx + 3.2 * hs, topY + 2.4 * hs], [hx + 3.4 * hs, hy + dy * hs - 1.2 * hs]],
        { wash: CAPE, fill: CAPE_DK, fillOp: 90, bleed: .05, tex: .45, border: .3, ink: PAL.ink, sw: 1.8, curv: .4 });
      for (let i = 0; i < 6; i++) paint(starPts(hx + (hash(i * 2.1) - .5) * 5.6 * hs, topY + (1 + hash(i * 4.3) * 4) * hs, hs * .2, .45, 5), { wash: CAPE_STAR, ink: null });
    }
    hero(hx, hy, hs, { outfit: 'pajama', sit: true, ...md, mouth: pop <= 0 ? 'tiny' : t < bUp - .05 ? 'O' : 'grin', lookY: -.7 * lookUp, dy, sq: md.take + (stand > 0 && stand < 1 ? -.12 * Math.sin(stand * Math.PI) : 0),
      tilt: pop > 0 ? Math.sin(t * 3) * .05 : .28, ahoge: pop > 0 ? 'perk' : 'droop', aL: arms, aR: arms, blush: .7, emote: md.emote || (pop <= 0 ? 'zzz' : null), emoteK: pop <= 0 ? .8 : md.emoteK });
    if (capeOn) { if (swing > .6) capeKnot(hx, hy, hs, { dy }); }
    else { // the front of the wrap, under her chin
      const hood = 1 - ease(seg(t, bPop, bPop + .35)), fy = hy + dy * hs - 4.2 * hs;
      paint([[hx - 2.6 * hs, fy], [hx - .2 * hs, fy + .5 * hs], [hx + .2 * hs, fy + .5 * hs], [hx + 2.6 * hs, fy], [hx + 3.3 * hs, fy + 3 * hs], [hx - 3.3 * hs, fy + 3 * hs]], { wash: CAPE, fill: CAPE_DK, fillOp: 80, tex: .4, ink: PAL.ink, sw: 1.6, curv: .3 });
      if (hood > .5) paint(starPts(hx + 1.4 * hs, fy + 1.3 * hs, hs * .22, .45, 5), { wash: CAPE_STAR, ink: null });
    }
    light(960, 760, 420, PAL.screen, .12);
    dreamBubble(1215, 440, 105, t, seg(t, bPop, bPop + .45));
    deskFront(t, { items: () => {
      // 团子, asleep on the desk, then wide awake
      const cwake = seg(t, bPop + .2, bPop + .35);
      cat(1290, 925, 17, { pose: cwake > 0 ? 'sit' : 'sleep', flip: true, eyes: cwake > 0 ? (t < bUp ? 'wide' : 'happy') : 'closed', dy: cwake > 0 ? -Math.abs(Math.sin((t - bPop) * 6)) * .5 * (1 - seg(t, bUp, bUp + .6)) : 0, zzz: cwake <= 0 });
      // the sketchbook, pages about to take off
      const bk = [[800, 902], [1120, 902], [1150, 960], [770, 960]];
      paint(bk.map(p => [p[0], p[1] + 8]), { wash: '#6F86B8', ink: PAL.ink, sw: 1 });
      paint(bk, { wash: '#FFFBF2', fill: '#EFE6D6', fillOp: 50, tex: .3, ink: PAL.ink, sw: 1 });
      inkLine([[960, 902], [960, 960]], .8, PAL.ink, 'fine', 0);
      const flut = seg(t, bPop, B(377.5)) * (1 - seg(t, B(377.5), B(377.5) + .1));
      for (let k = 0; k < 3; k++) { const a = Math.sin(t * 24 + k * 2) * .5 * flut; inkLine([[960, 905], [960 + (140 - k * 30) * Math.cos(a), 905 - (140 - k * 30) * Math.abs(Math.sin(a)) * .4]], .6, PAL.steel, 'fine', 0, .7 * flut); }
      for (let k = 0; k < 4; k++) inkLine([[810 + k * 10, 915 + k * 11], [950, 915 + k * 11]], .5, RULE, 'pencil', 0, .6);
      // 桃桃, small (just out of the screen), napping against the soda can, then hopping with joy
      sodaCan(1420, 935, .9, { drops: .6 });
      const mwake = seg(t, bPop + .1, bPop + .25), mh = mwake > 0 ? Math.abs(Math.sin((t - bPop) * Math.PI / .3)) : 0;
      momo(650, 930, 13, { eyes: mwake > 0 ? 'star' : 'closed', mouth: mwake > 0 ? 'open' : 'tiny', tilt: mwake > 0 ? 0 : .3, dy: -mh * 1.4, aL: mwake > 0 ? .4 : -1, aR: mwake > 0 ? .4 : -1, digital: .6, emote: mwake <= 0 ? 'zzz' : null, emoteK: .7 });
    } });
    camEnd();
  }
  // page-birds bursting out of the book (screen space); some sweep past the camera over the change of view
  function wakeBirds(t, lt) {
    const t0 = B(377.5) - .04;
    for (let i = 0; i < 18; i++) {
      const ti = t0 + hash(i * 5.1) * .45, age = t - ti; if (age < 0 || age > 1.3) continue;
      const u = age / 1.3, side = i % 2 ? 1 : -1, a = -Math.PI / 2 + side * (.35 + hash(i * 2.3) * .9), far = i % 3 === 0;
      const x0 = 960 + (hash(i * 9.1) - .5) * 280, y0 = 830;
      const r = easeOut(clamp(u * 2.2)) * (300 + 200 * hash(i * 4.4)) + easeIn(u) * (far ? 500 : 1300);
      const x = x0 + Math.cos(a) * r * 1.2 + Math.sin(age * 5 + i) * 40, y = y0 + Math.sin(a) * r * .75 + Math.cos(age * 4 + i) * 30;
      const s = (50 + 26 * hash(i)) * (far ? 1 : 1 + 2.4 * Math.pow(u, 2.2));
      flockBird(i, x, y, s, t, { yaw: Math.cos(a) * 1.1 + (far ? 1.2 : 0), el: .45 + .4 * hash(i), pitch: -.15 });
    }
  }

  // the front view: the pages fold into the plane right by the desk, they hop on, it flies out of the window
  const bFold = B(380), bHop = B(381), bOpen = B(382), bOut = B(384);
  const PX0 = 1185, PY0 = 752;                                     // where the plane hovers by the desk
  function planePathB(t) {                                          // position, pitch, yaw, scale, elevation
    const bob = Math.sin((t - bFold) * 5) * 8, dip = t > bHop ? Math.sin(seg(t, bHop, bHop + .35) * Math.PI) * 26 : 0;
    if (t < bHop + .12) return { x: PX0, y: PY0 + bob + dip, pitch: .04 * Math.sin(t * 4), yaw: Math.PI, s: 300, el: .4 };
    const v = seg(t, bHop + .12, bOpen + .1), w = seg(t, bOpen + .1, bOut);
    if (w <= 0) return { x: lerp(PX0, 640, ease(v)), y: lerp(PY0 + dip, 430, easeInOut(v)) + bob * (1 - v), pitch: .3 * Math.sin(v * Math.PI), yaw: Math.PI, s: 300, el: .4 };
    const turn = easeInOut(clamp(w * 1.8));
    return { x: lerp(640, 488, easeOut(w)), y: lerp(430, 322, easeOut(w)), pitch: .1 - .08 * turn, yaw: lerp(Math.PI, 1.62, turn), s: lerp(300, 24, easeIn(w) * .8 + easeOut(w) * .2), el: lerp(.4, .14, turn) };
  }
  function screenDoc(r, t) {                                        // the monitor: her document, a line still being written
    paint(rectPts(r.x, r.y, r.w, r.h), { wash: '#EEF3F6', ink: null });
    paint(rectPts(r.x + r.w * .12, r.y + 14, r.w * .76, r.h - 14), { wash: '#FFFDF8', ink: null });
    for (let k = 0; k < 6; k++) fillRectA(r.x + r.w * .18, r.y + 40 + k * 34, r.w * (k === 5 ? .3 : .6 - hash(k) * .12), 7, '#C9CFE0', .9);
    if (Math.sin(t * 7) > 0) fillRectA(r.x + r.w * .49, r.y + 36 + 5 * 34, 3, 16, PAL.ink, .8);
  }
  function wakeB(t, lt) {
    const push1 = ease(seg(t, bHop + .1, bOpen + .15)), push2 = easeInOut(seg(t, bOpen + .15, bOut + .1));
    camBegin(lerp(lerp(1150, 830, push1), 500, push2), lerp(lerp(500, 440, push1), 360, push2), lerp(lerp(1.14, 1.18, push1), 2.1, push2), 0);
    room(t, { lamp: .85, rain: 0, clutter: .3, book: 'open', screen: screenDoc });
    openWindow(t, seg(t, bOpen - .05, bOpen + .35));
    const gust = seg(t, bOpen, bOpen + .2) * (1 - seg(t, bOpen + 1, bOpen + 2));
    if (gust > 0) glow(500, 360, 520, '#E8D6FF', .2 * gust);
    const P = planePathB(t), on = t >= bFold, landed = t >= bHop;
    const fold = backOut(seg(t, bFold, bFold + .32));
    // her, 桃桃 and 团子 on the desk; the birds circle above them, then dive together into the plane
    const hs = 30, mxd = PX0 - .52 * 300, hxd = PX0 + .02 * 300;
    const hop = seg(t, bHop - .36, bHop), crouch = seg(t, bHop - .6, bHop - .36) * (1 - hop);
    if (!landed) {
      const land = P.y + hs * .75 + 4, yH = lerp(712, land, easeIn(hop)) - Math.sin(hop * Math.PI) * 2.1 * hs, yM = lerp(712, land - 8, easeIn(hop)) - Math.sin(hop * Math.PI) * 2.3 * hs;
      const look = t < bFold ? -.7 : .35, cheer = t < bFold ? .35 + Math.sin(t * 11) * .15 : .1;
      capeFB(hxd, yH, hs, t, { lift: .5 + .4 * hop, wind: -.35 });
      hero(hxd, yH, hs, { outfit: 'pajama', eyes: 'star', mouth: 'open', sq: crouch * .18 - hop * .1, lookY: look, lookX: t < bFold ? .2 : -.3, aL: cheer - crouch * .9, aR: cheer - crouch * .9, noShadow: hop > .05, ahoge: 'perk', blush: .6 });
      capeKnot(hxd, yH, hs, {});
      momo(mxd, yM, hs * .82, { eyes: 'star', mouth: 'grin', sq: crouch * .2, aL: .4, aR: t < bFold ? .4 : -.2, lookY: look, lookX: -.2, noShadow: hop > .05 });
    }
    if (t < bFold + .05) for (let i = 0; i < 14; i++) {
      const a = t * 2.6 + i / 14 * TAU, conv = easeIn(seg(t, bFold - .5, bFold));
      const rr = lerp(420 + 60 * Math.sin(i * 1.7), 30, conv), cyb = lerp(300 + 50 * Math.sin(t * 2 + i), PY0 - 30, conv);
      flockBird(i, PX0 + Math.cos(a) * rr, cyb + Math.sin(a) * rr * .28 - (1 - seg(t, W0 + 1.6, W0 + 2.3)) * 300, lerp(46, 26, conv), t, { yaw: -a + Math.PI / 2, el: .5 });
    }
    // 团子's paper boat: waits on the desk, then follows the plane
    const lag = .38, bl = t - lag, fly = seg(t, bHop + .15, bHop + .5);
    const Q = planePathB(Math.max(bl, bHop + .12));
    const boatX = lerp(1470, Q.x + 150 * Q.s / 300, ease(fly)), boatY = lerp(712, Q.y + 70 * Q.s / 300, ease(fly)) - Math.sin(fly * Math.PI) * 60, bsc = lerp(1, Q.s / 300, fly);
    const drawBoat = () => { if (bsc > .1) paperBoat(boatX, boatY, 64 * bsc, t, { rot: Math.sin(t * 5) * .08 * fly, inside: () => cat(boatX + 8 * bsc, boatY + 4 * bsc, 13 * bsc, { pose: 'sit', eyes: t < bFold ? 'wide' : 'happy', noShadow: true }) }); };
    const boatBehind = t > bOpen + .25;
    if (!boatBehind) drawBoat();
    // the plane
    if (on) {
      if (t < bFold + .35) { glow(PX0, PY0, 300, '#FFF3C8', .6 * (1 - seg(t, bFold, bFold + .35))); for (let i = 0; i < 10; i++) sparkle(PX0 + Math.cos(i * .7) * 260 * fold, PY0 + Math.sin(i * .7) * 110 * fold, 16, '#FFF3C0', seg(t, bFold, bFold + .35)); }
      const sc = P.s * lerp(.15, 1, fold), back = P.yaw < 2.45, land = seg(t, bHop, bHop + .5);
      paperPlane(P.x, P.y, sc, t, { yaw: P.yaw, pitch: P.pitch, el: P.el, roll: Math.sin(t * 2) * .05 * (1 - seg(t, bOpen, bOut)), riders: landed ? Q => crew(Q, t, {
        s: hs * sc / 300, fac: -1, back, wind: lerp(.3, 1, seg(t, bHop + .1, bHop + .5)), sink: back ? .35 : .75,
        h: { eyes: 'star', mouth: 'grin', aL: back ? .3 : -.2, aR: back ? .3 : .35 + Math.sin(t * 10) * .15, sq: .28 * (1 - elasticOut(land)), ahoge: 'perk', blush: .7 },
        m: { eyes: back ? 'happy' : 'star', mouth: 'open', aL: .4, aR: -.3, sq: .28 * (1 - elasticOut(seg(t, bHop + .05, bHop + .55))) } }) : null });
    }
    if (boatBehind) drawBoat();
    // a trail of sparkles once it's moving
    if (t > bHop + .15) for (let i = 0; i < 10; i++) {
      const R = planePathB(t - i * .06), k = R.s / 300;
      sparkle(R.x + (R.yaw > 2.5 ? 150 : 40) * k + hash(i) * 30 * k, R.y + (hash(i * 3) - .5) * 60 * k, (10 + 10 * hash(i + 1)) * Math.max(.3, k), i % 2 ? '#FFF3C0' : '#FFD1E0', 1 - i / 10);
    }
    camEnd();
  }
  function wakeFly(t, lt, dur) {
    const a = W0 + 1.72, b = W0 + 2.12;
    if (t < a) wakeA(t, lt);
    else if (t >= b) wakeB(t, lt);
    else dissolve(seg(t, a, b), () => wakeA(t, lt), () => wakeB(t, lt));
    wakeBirds(t, lt);
  }

  // =================================================================================================================
  // shared sky pieces for the flight
  // =================================================================================================================
  // the night sky: deep indigo down to a warm violet glow over the city; o.warm 0..1 blushes the horizon peach-pink
  function nightSky(t, o = {}) {
    const warm = o.warm || 0, top = o.top || '#141A44', mid = mixCol('#3B3478', '#5B3F84', warm), bot = mixCol('#7E5A9E', '#E59AA8', warm);
    const y0 = o.y0 ?? -60, y1 = o.y1 ?? 1140, ym = lerp(y0, y1, .55);
    paint(rectPts(-400, y0, W + 800, ym - y0 + 2), { grad: [top, mid, Math.PI / 2], ink: null });
    paint(rectPts(-400, ym, W + 800, y1 - ym), { grad: [mid, bot, Math.PI / 2], ink: null });
    // a soft milky way band and the stars
    for (let i = 0; i < 7; i++) glow(-100 + i * 360 + (o.sx || 0) * .2 % 360, y0 + 180 + i * 45 + Math.sin(i * 1.7) * 60, 260, '#8C7FD0', .10);
    starField(t, { x: -200, y: y0, w: W + 400, h: (y1 - y0) * .62 }, o.stars ?? 70, { seed: o.seed || 2 });
  }
  // a far city silhouette strip, scrolling: layer li 0 (far) .. 2 (near); scroll in px; k(x) → 0..1 warm colour per building
  function farCity(t, o) {
    const gy = o.y, li = o.layer || 0, sc = o.scroll || 0, avg = [120, 150, 190][li], hk = [.55, .75, 1][li];
    const base = ['#3E3F7C', '#303369', '#23285A'][li], k = o.k || (() => 0), a = o.a ?? 1;
    const i0 = Math.floor((sc - 300) / avg), i1 = Math.ceil((sc + W + 300) / avg);
    for (let i = i0; i <= i1; i++) {
      const bx = i * avg + hash(i * 3.1 + li) * avg * .3 - sc, bw = avg * (.62 + hash(i * 7.3 + li) * .35), bh = (140 + hash(i * 5.7 + li * 9) * 300) * hk * (o.hMul || 1);
      const kk = clamp(k(bx + bw / 2 + sc)), col = mixCol(base, WARM[(i % WARM.length + WARM.length) % WARM.length], kk * (.55 + .12 * li));
      const roof = hash(i * 2.9 + li) > .72 ? [[bx + bw * .5, gy - bh - 36 * hk]] : [];
      paint([[bx, gy + 40], [bx, gy - bh], ...roof, [bx + bw, gy - bh], [bx + bw, gy + 40]], { wash: col, washOp: 255 * a, ink: li === 2 ? PAL.ink : null, sw: .8 });
      if (hash(i * 4.1 + li) > .75) { inkLine([[bx + bw * .7, gy - bh], [bx + bw * .7, gy - bh - 40 * hk]], 1.2, mixCol(col, PAL.ink, .4), 'fine', 0, a); dot(bx + bw * .7, gy - bh - 40 * hk, 3.5, '#FF8FA3', (.5 + .5 * Math.sin(t * 3 + i)) * a); }
      const cols = Math.max(1, Math.floor(bw / 30)), rows = Math.floor(bh / 38);
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const hs = hash(li * 999 + i * 97 + r * 13 + c * 7); if (hs < .5) continue;
        fillRectA(bx + 8 + c * (bw - 12) / cols, gy - bh + 14 + r * 38, (bw - 12) / cols * .5, 13, kk > .5 ? '#FFE9B0' : hs > .8 ? '#FFB3A0' : '#FFD98A', (.45 + .4 * kk + .15 * li) * a);
      }
    }
  }
  // her little loves (the parade): kind 0 idea star, 1 heart, 2 soda can, 3 doodle page, 4 note
  function love(kind, x, y, s, t, i, o = {}) {
    const bob = Math.sin(t * 3 + i * 1.3) * .08;
    if (kind === 0) idea(x, y, s * .9, { eyes: 'happy', rot: bob, seed: i, sq: o.sq || 0 });
    else if (kind === 1) {
      glow(x, y, s * 3, '#FFB8CF', .4);
      push(); translate(x, y); rotate(bob * 2); scale(1 + (o.sq || 0) * .4, 1 - (o.sq || 0));
      paint(heartPts(0, 0, s * 1.2), { wash: '#F58DAE', fill: '#E2557F', fillOp: 70, tex: .3, ink: PAL.ink, sw: clamp(s / 16, .5, 1.3) });
      paint(ellPts(-s * .45, -s * .45, s * .22, s * .14, 8, 0, -.6), { wash: '#FFFFFF', washOp: 160, ink: null });
      for (const sd of [-1, 1]) inkLine([[sd * s * .38 - s * .12, -s * .05], [sd * s * .38, -s * .2], [sd * s * .38 + s * .12, -s * .05]], clamp(s / 20, .5, 1.1), PAL.ink, 'ink', .5);
      pop();
    } else if (kind === 2) {
      glow(x, y, s * 3, '#FFC7A8', .35);
      sodaCan(x, y + s * 1.6, s / 36, { rot: Math.sin(t * 1.7 + i) * .35, drops: .8 });
      for (let b = 0; b < 3; b++) { const a2 = frac(t * .8 + b / 3); dot(x + Math.sin(a2 * 9 + b) * s * .4, y - s * 1.1 - a2 * s * 1.6, s * .08 * (1 - a2) + 1, '#FFE6D6', 1 - a2); }
    } else if (kind === 3 || kind === 4) {
      // a doodle page (a drawing of 桃桃's face / a cat), flapping like a bird
      paperBird(x, y, s * 1.7, t * 2 + i * .3, { yaw: -.15 + (o.yaw || 0), el: .75, doodle: kind === 3 });
    }
  }

  // =================================================================================================================
  // 230.556 · Over the night city: her small loves fly after her in a parade — 团子 in his paper boat on a string, the
  // idea stars, doodles, hearts, the peach soda can — rippling along the glowing line she trails.
  // =================================================================================================================
  const PAR = [ // [kind, gap (px behind the plane), delay (s), dy, size]
    ['boat', 450, .36, 110, 1], [0, 660, .55, 90, 46], [2, 820, .72, 250, 44], [3, 990, .92, 200, 60], [1, 1140, 1.1, 360, 38],
    [0, 1290, 1.28, 330, 36], [4, 1450, 1.46, 470, 54], [1, 1590, 1.64, 440, 32], [0, 1730, 1.82, 570, 30], [2, 1880, 2.0, 540, 34], [1, 2030, 2.18, 650, 30]];
  function parade(t, lt, dur) {
    const bp = bpOf(t), leadY = tt => 410 + 60 * Math.sin((tt - 230.556) * TAU / 2.4) + 18 * Math.sin((tt - 230) * TAU / 1.2);
    const pull = easeInOut(seg(t, 230.95, 233.7));
    const cx = lerp(1180, 700, pull), cy = lerp(420, 590, pull), z = lerp(1.45, .88, pull);
    // background (screen space), scrolling
    const scroll = (t - 228) * 90;
    nightSky(t, { sx: scroll, warm: .15 });
    moonFace(1660, 160, 58, { rot: -.35 });
    for (let i = 0; i < 5; i++) { const cxp = ((i * 530 - scroll * .5) % 2700 + 2700) % 2700 - 400; cloudPuff(cxp, 300 + (i % 3) * 120, .7 + hash(i) * .5, '#6E68A8', { seed: i + 2, op: 150, shade: '#57528E', ink: false }); }
    farCity(t, { y: 1120, layer: 0, scroll: scroll * .5, hMul: .95 });
    farCity(t, { y: 1150, layer: 1, scroll: scroll * .8, hMul: .9 });
    glow(960, 1080, 900, '#F6A5C0', .16);
    farCity(t, { y: 1190, layer: 2, scroll: scroll * 1.3, hMul: .75 });
    camBegin(cx, cy, z, Math.sin(t * .9) * .015);
    const PXp = 1180, PYp = leadY(t);
    const yAt = (gap, d, dy) => leadY(t - d) + dy - 26 * pulse(t - d * .45, 5);
    // the glowing line she trails, which everything follows
    const line = [];
    for (let k = 0; k <= 48; k++) { const gap = 250 + k * 42, u = clamp((gap - 450) / (2030 - 450)), d = gap / 1000, dyy = lerp(110, 650, u) + Math.sin(u * 9) * 40 - 40; line.push([PXp - gap, leadY(t - d) + dyy + (gap < 450 ? (450 - gap) * -.12 : 0)]); }
    inkLine(line, 3.4, '#FFE9A8', 'marker', .5, .5);
    // the parade, back to front
    for (let j = PAR.length - 1; j >= 0; j--) {
      const [kind, gap, d, dy, sz] = PAR[j], x = PXp - gap, y = yAt(gap, d, dy), hop = pulse(t - d * .45, 7) * .14;
      if (kind === 'boat') {
        const by = y + Math.sin(t * 2.4) * 8;
        inkLine([[PXp - 290, PYp + 30], [(PXp - 290 + x + 80) / 2, (PYp + by) / 2 + 40], [x + 80, by - 36]], 1.6, '#F4ECFA', 'fine', .5, .9);
        paperBoat(x, by, 92, t, { rot: Math.sin(t * 2.4 - .6) * .1, inside: () => cat(x + 12, by + 4, 19, { pose: 'sit', eyes: 'happy', noShadow: true, look: .6, tail: Math.sin(t * 5) * .4, sq: hop }) });
        if (bp > 386 && bp < 391) emote('music', x + 90, by - 130, 14, seg(bp, 386, 386.4) * (1 - seg(bp, 390.5, 391)));
      } else love(kind, x, y, sz, t, j, { sq: hop });
    }
    // the plane and the crew
    const lookBack = seg(bp, 384.8, 385.3) * (1 - seg(bp, 389.3, 389.8));
    const wave = Math.sin(t * 12) * .25;
    paperPlane(PXp, PYp, 300, t, { el: .42, pitch: .05 + .06 * Math.cos((t - 230.556) * TAU / 2.4), roll: -.04 + .04 * Math.sin(t * 1.3), riders: P => crew(P, t, {
      s: 30, fac: 1, wind: 1, lift: .25,
      h: { ...mood(t, [[229, 'sparkle', null, 'open'], [B(384.9), 'happy', 'heart', 'grin'], [B(389.4), 'sparkle', null, 'open']]), lookX: lerp(.5, -.8, lookBack), aL: lerp(-.3, .42, lookBack) + wave * lookBack, aR: lerp(.1, -.2, lookBack), blush: .7, ahoge: 'perk', tilt: -.1 * lookBack },
      m: { eyes: 'happy', mouth: 'open', lookX: lerp(.4, -.7, lookBack), aL: .38 + (bp > 386 ? wave : 0), aR: -.2, tilt: .08 * Math.sin(t * 3) } }) });
    // sparkles along the line on the beat
    for (let i = 0; i < 14; i++) { const q = line[Math.min(line.length - 1, i * 3 + 1)]; sparkle(q[0], q[1] + (hash(i) - .5) * 40, 10 + 8 * hash(i + 3), i % 2 ? '#FFF3C0' : '#FFD1E0', frac(bp + hash(i))); }
    camEnd();
  }
  // =================================================================================================================
  // 235.356 · The contrail is paint: the plane dives down over the cold grey-blue roofs and every roof it passes
  // blooms pink, peach, cream and mint; paint drips splash on the beat, and a few houses blush and smile.
  // =================================================================================================================
  const R0 = 235.356, CG = 1080, CX0 = -400;
  // the front skyline layer of nightCity(), mirrored so the drips can land on its roofs: [x, w, h] per building
  const FRONT = (() => { const out = []; let x = CX0 - 40 + hash(2 * 13) * 60, i = 0; while (x < 5200) { const bw = 170 * (.6 + hash(200 + i * 3.1) * .7), bh = 180 + hash(100 + i * 7.3) * 420; out.push([x, bw, bh]); x += bw + 6 + hash(60 + i) * 30; i++; } return out; })();
  const roofAt = x => {                                    // the roof surface y at x (pointed roofs included), and the building
    let i = 0;
    for (const [bx, bw, bh] of FRONT) {
      if (x >= bx && x <= bx + bw) { const peak = hash(2 * 70 + i) > .7 ? 50 * (1 - Math.abs(x - bx - bw / 2) / (bw / 2)) : 0; return [CG - bh - peak, bx, bw, bh]; }
      i++;
    }
    return [CG - 150, x - 30, 60, 150];
  };
  function roofPlane(t) {                                  // the plane's world position during the shot
    const lt = t - R0, dive = seg(lt, -.3, 1.0);
    const x = lt < 1.0 ? lerp(-60, 880, easeIn(dive) * .55 + dive * .45) : 880 + (lt - 1.0) * 610;
    const y = lt < 1.0 ? lerp(40, 330, easeOut(dive)) : 330 + Math.sin((lt - 1.0) * 2.6) * 22;
    return [x, y, lt < 1.0 ? lerp(-.42, -.05, easeOut(dive)) : -.02 + .05 * Math.cos((lt - 1) * 2.6)];
  }
  // time at which the plane passes over world x (inverse of roofPlane's x)
  const passT = x => { if (x < 880) { for (let k = 0; k <= 40; k++) { const tt = R0 - .3 + k * 1.3 / 40; if (roofPlane(tt)[0] >= x) return tt; } return R0 + 1; } return R0 + 1.0 + (x - 880) / 610; };
  const paintK = (t, x) => x < 120 ? 0 : ease(seg(t, passT(x + 230), passT(x + 230) + .45));
  function paintRoofs(t, lt, dur) {
    const [px, py, pitch] = roofPlane(t), bp = bpOf(t);
    const cx = lerp(420, px - 260, ease(seg(lt, .3, 1.5))), cy = lerp(380, 560, ease(seg(lt, 0, 1.4))), z = lerp(.8, .9, ease(seg(lt, 0, 1.4))) + .04 * ease(seg(lt, 2.5, 4.8));
    nightSky(t, { warm: .1 + .45 * seg(lt, .5, 4.8), sx: cx });
    moonFace(1540, 150, 54, { rot: -.35 });
    camBegin(cx, cy, z, lerp(.05, 0, ease(seg(lt, 0, 1.2))));
    const vx0 = cx - W / 2 / z - 60, vx1 = cx + W / 2 / z + 60;
    // the city, painted wherever the contrail has passed
    nightCity(t, { x0: CX0, x1: vx1 + 200, y: CG, paint: x => paintK(t, x), lit: .6 });
    // blushing, smiling houses (every third painted front building)
    FRONT.forEach(([bx, bw, bh], i) => {
      if (i % 3 !== 1 || bx + bw < vx0 || bx > vx1) return;
      const k = paintK(t, bx + bw / 2); if (k < .3) return;
      const fx = bx + bw / 2, fy = CG - bh + 34, a = seg(k, .3, .8);
      fadeIn(a, () => {
        for (const sd of [-1, 1]) inkLine([[fx + sd * 30 - 13, fy + 6], [fx + sd * 30, fy - 7], [fx + sd * 30 + 13, fy + 6]], 2.2, PAL.ink, 'ink', .5);
        inkLine([[fx - 11, fy + 22], [fx, fy + 30], [fx + 11, fy + 22]], 1.8, PAL.ink, 'ink', .5);
        for (const sd of [-1, 1]) paint(ellPts(fx + sd * 54, fy + 20, 16, 9, 10), { fill: '#EE6F96', fillOp: 170, bleed: .2, ink: null });
      });
    });
    // paint drips on the beat: they fall from the contrail and splash on a roof
    for (let n = 391; n <= 400; n++) for (let j = 0; j < 2; j++) {
      const td = B(n) + j * .3, age = t - td; if (age < 0 || age > 1.4) continue;
      const [sx, sy] = roofPlane(td), dx = sx - 120 - j * 60, [ry, rbx, rbw] = roofAt(dx), fall = Math.min(1, age / .45);
      const col = WARM[(n * 2 + j) % 4];
      if (fall < 1) { const y = lerp(sy + 40, ry, fall * fall); paint([[dx, y - 44], [dx + 15, y], [dx, y + 15], [dx - 15, y]], { wash: col, ink: PAL.ink, sw: .9, curv: .6 }); }
      else {
        const e = easeOut(seg(age, .45, .75)), f = 1 - seg(age, 1.0, 1.4);
        fadeIn(f, () => {
          // paint running down the facade from the roof edge
          for (let q = 0; q < 3; q++) {
            const qx = clamp(dx + (q - 1) * 22 + (hash(n * 7 + q) - .5) * 10, rbx + 8, rbx + rbw - 8), L = (50 + 70 * hash(n * 3 + q + j)) * easeOut(seg(age, .5, 1.1));
            if (L > 2) { inkLine([[qx, ry + 2], [qx, ry + L]], 3.2, col, 'marker', 0, 1); dot(qx, ry + L, 6, col, 1); }
          }
          // a puddle of paint sitting on the roof, and a crown of droplets
          paint([[dx - 34 - 20 * e, ry + 3], [dx - 20, ry - 10 * e], [dx, ry - 16 * e], [dx + 20, ry - 10 * e], [dx + 34 + 20 * e, ry + 3]], { wash: col, ink: PAL.ink, sw: .8, curv: .6 });
          for (let q = 0; q < 6; q++) { const a = -Math.PI * (q + .5) / 6, v = 150 + 60 * hash(q + n), ta = seg(age, .45, 1.0); dot(dx + Math.cos(a) * v * ta, ry - 10 + Math.sin(a) * v * ta * 1.2 + 260 * ta * ta, 7 * (1 - ta) + 2, col, 1); }
        });
        sparkle(dx, ry - 50, 30, '#FFF3C0', seg(age, .45, 1.2));
      }
    }
    // the contrail: four wet bands of paint streaming back from the tail, sagging and spreading as they dry
    const bands = [['#F7B6C8', -1.5], ['#FFD9A0', -.5], ['#FFE3B8', .5], ['#BFE3D0', 1.5]], N = 44;
    const trail = [];
    for (let i = 0; i <= N; i++) { const tt = t - i * .055, [qx, qy] = roofPlane(tt); if (tt < R0 - .3) break; trail.push([qx - 250, qy + 30, i * .055]); }
    if (trail.length > 2) bands.forEach(([col, off], bi) => {
      const top = [], bot = [];
      const nT = trail.length;
      trail.forEach(([qx, qy, age], i) => { const tap = Math.min(1, (nT - 1 - i) / 7), w = (14 + age * 34) * (.35 + .65 * tap), sag = age * age * 110, o = off * (w * .95); top.push([qx, qy + sag + o - w / 2 + Math.sin(i * .7 + t * 3 + bi) * 3]); bot.push([qx, qy + sag + o + w / 2]); });
      paint([...top, ...bot.slice().reverse()], { wash: col, washOp: 215, fill: mixCol(col, PAL.rose, .25), fillOp: 90, bleed: .08, tex: .4, border: .4, ink: null });
    });
    // the plane: she trails a hand through the paint, 桃桃 flings sparkles
    const tRide = mood(t, [[R0 - 1, 'sparkle'], [B(394), 'happy', 'heart', 'grin']]);
    paperPlane(px, py, 280, t, { el: .45, pitch, roll: lerp(-.25, -.03, seg(lt, 0, 1.1)) + .03 * Math.sin(t * 2), riders: P => crew(P, t, {
      s: 28, fac: 1, wind: 1, lift: .3,
      h: { ...tRide, mouth: tRide.mouth || 'open', lookX: .2, lookY: .5, aL: -.15, aR: -.4 + .12 * Math.sin(t * 6), blush: .8, ahoge: 'perk' },
      m: { eyes: 'star', mouth: 'grin', lookX: .3, aL: .35 + .2 * pulse(t, 5), aR: .35 + .2 * pulse(t, 5), dy: -.35 * pulse(t, 4) } }) });
    for (let i = 0; i < 8; i++) { const a = frac(bp * .5 + i / 8), q = roofPlane(t - a * .8); sparkle(q[0] + 60 - a * 200, q[1] - 80 - a * 90 + Math.sin(i * 2) * 50, 12 + 8 * hash(i), i % 2 ? '#FFF3C0' : '#FFD1E0', a); }
    camEnd();
  }
  // =================================================================================================================
  // 240.156 · The plane sweeps past the pastel facades and the windows light up in its wake, one by one on the beat:
  // on the screens inside, 桃桃 smiles and waves; people lean out to wave back and let sky lanterns go. The camera
  // rises with the lanterns into the sky, where the plane glides among them.
  // =================================================================================================================
  const G0 = 240.156;
  const BLD = [[-330, 600, 250, '#D9C8EE', '#B9A6DA'], [290, 640, 170, '#F7C3D2', '#E79AB0'], [950, 600, 280, '#FFD9B0', '#F2B98A'], [1570, 640, 200, '#C6E6D4', '#98C9AE'], [2230, 600, 240, '#E3C8F0', '#C3A6D6']];
  const WIN = (() => {
    const out = [];
    BLD.forEach(([bx, bw, top], bi) => {
      const cols = 3, gx = bw / cols;
      for (let r = 0; r < 4; r++) for (let c = 0; c < cols; c++) {
        const x = bx + gx * (c + .5), y = top + 175 + r * 235, h = hash(bi * 31 + r * 7 + c * 3);
        const kind = r > 2 ? 'dark' : h < .42 ? 'momo' : h < .64 ? 'wave' : h < .8 ? 'lantern' : 'warm';
        out.push({ x, y, bi, r, c, kind, seed: bi * 12 + r * 3 + c });
      }
    });
    return out;
  })();
  function glowPlane(t) {                                   // the plane's pass in front of the facades
    const u = seg(t, G0 - .25, G0 + 2.25);
    return [lerp(-500, 2750, u), lerp(640, 330, easeInOut(u)) + Math.sin(u * 7) * 20];
  }
  const winT = w => { const pass = G0 - .25 + clamp((w.x + 500) / 3250) * 2.5; return B(Math.ceil(bpOf(pass + .12) * 2) / 2) + hash(w.seed) * .08; };
  function windowPane(w, t) {
    const tl = winT(w), on = w.kind === 'dark' ? 0 : seg(t, tl, tl + .18), ww = 150, wh = 176, x0 = w.x - ww / 2, y0 = w.y - wh / 2;
    paint(rectPts(x0 - 8, y0 - 8, ww + 16, wh + 22), { wash: mixCol(BLD[w.bi][4], PAL.ink, .15), ink: PAL.ink, sw: .8 });
    paint(rectPts(x0, y0, ww, wh), { wash: mixCol('#3A3C74', '#FFE3A8', on), ink: null });
    if (on > 0) {
      glow(w.x, w.y + 10, 170 * on, '#FFD98A', .45 * on);
      clipTo(rectPts(x0, y0, ww, wh), () => {
        paint(rectPts(x0, y0 + wh * .62, ww, wh * .38), { wash: '#F2C79A', ink: null });                     // the room inside
        const age = t - tl, pp = backOut(seg(age, 0, .35));
        if (w.kind === 'momo') {                                                                            // a screen with 桃桃 waving
          const sx = w.x + (hash(w.seed * 3) - .5) * 20, sy = y0 + wh * .56;
          glow(sx, sy - 8, 100, PAL.pink, .5 * on);
          paint(rrPts(sx - 56, sy - 50, 112, 84, 9), { wash: '#DDF3F0', ink: PAL.ink, sw: 1 });
          paint(rrPts(sx - 50, sy - 44, 100, 72, 7), { grad: ['#F2FBFF', '#CFEBE6', Math.PI / 2], ink: null });
          if (pp > .05) { push(); translate(sx, sy + 26); scale(pp); momo(0, 0, 10, { eyes: 'happy', mouth: 'open', aR: .3 + .35 * Math.sin(t * 12 + w.seed), aL: -.9, noShadow: true, blush: .8 }); pop(); }
          paint(rectPts(sx - 7, sy + 32, 14, 12), { wash: '#B9A6DA', ink: PAL.ink, sw: .6 });
        } else if (w.kind === 'wave' || w.kind === 'lantern') {                                           // someone at the window
          const lean = seg(age, .05, .4), py = y0 + wh + 46 - 80 * easeOut(lean);
          person(w.x - 8, py + 70, 15.5, { seed: w.seed + 3, eyes: 'happy', mouth: 'open', blush: .6, aR: w.kind === 'wave' ? .35 + .3 * Math.sin(t * 11 + w.seed) : .3, aL: w.kind === 'wave' ? -.9 : .3, noShadow: true, lookY: -.5 });
        } else {                                                                                            // just warm light and a plant
          plant(w.x + 30, y0 + wh * .66, .5, t);
          paint(ellPts(w.x - 30, y0 + 40, 14, 14, 10), { wash: '#FFF3C4', ink: PAL.ink, sw: .5 });
        }
      });
    }
    // the frame and sill: dark windows keep their glazing bars; lit ones swing open
    const op = easeOut(on);
    if (op < 1) { inkLine([[w.x, y0], [w.x, y0 + wh]], 3, '#F6EDE0', 'marker', 0, .9 * (1 - op)); inkLine([[x0, y0 + wh * .45], [x0 + ww, y0 + wh * .45]], 3, '#F6EDE0', 'marker', 0, .9 * (1 - op)); }
    if (op > 0) for (const sd of [-1, 1]) {
      const hx = sd < 0 ? x0 : x0 + ww, fx = hx - sd * lerp(ww / 2, 16, op), g = 1 + .12 * op;
      paint([[hx, y0], [fx, y0 - 8 * op], [fx, y0 + wh + 8 * op], [hx, y0 + wh]], { wash: '#CFE0F2', washOp: 110, ink: PAL.ink, sw: .7 });
      inkLine([[hx, y0 + wh * .45], [fx, y0 + wh * .45 * g]], 2.4, '#F6EDE0', 'marker', 0, .9);
    }
    paint(rectPts(x0, y0, ww, wh), { ink: PAL.ink, sw: .9 });
    paint(rectPts(x0 - 14, y0 + wh + 4, ww + 28, 14), { wash: '#F6EDE0', ink: PAL.ink, sw: .8 });
    if (on > 0 && on < 1) sparkle(w.x + 50, y0 - 6, 22, '#FFF3C0', on);
  }
  // the lanterns people let go: each starts at a window at its time and rises, swaying
  const LAN = WIN.filter(w => w.kind === 'lantern').map((w, i) => ({ x: w.x, y: w.y - 40, t0: winT(w) + .9 + hash(i) * .5, s: .9 + hash(i * 3) * .4, seed: i }));
  for (let i = 0; i < 26; i++) LAN.push({ x: -300 + hash(i * 7.7) * 2800, y: 620 + hash(i * 3.3) * 420, t0: G0 + 1.3 + i * .12, s: 1.0 + hash(i * 5.1) * .8, seed: 20 + i, heart: i % 4 === 0 });
  const lanPos = (L, t) => { const a = t - L.t0; return [L.x + Math.sin(a * 1.3 + L.seed) * 34 + a * 20, L.y - a * (250 + 90 * hash(L.seed)) - a * a * 34]; };
  function windowsGlow(t, lt, dur) {
    const up = easeInOut(seg(t, G0 + 1.9, G0 + 4.7));
    const cx = lerp(640, 1400, easeInOut(seg(lt, 0, 3.6))), cy = lerp(575, -420, up), z = lerp(1.16, .84, up);
    nightSky(t, { warm: .55, y0: -1500, y1: 1300, stars: 120 });
    camBegin(cx, cy, z, 0);
    moonFace(1900, -800, 96, { rot: -.35 });
    // far pastel skyline behind the facades
    farCity(t, { y: 1100, layer: 1, scroll: 300, k: () => 1, hMul: 1.9 });
    // the facades
    BLD.forEach(([bx, bw, top, col, dk], bi) => {
      paint([[bx, 1200], [bx, top + 40], [bx + 30, top], [bx + bw - 30, top], [bx + bw, top + 40], [bx + bw, 1200]], { wash: col, fill: dk, fillOp: 80, bleed: .04, tex: .6, border: .35, ink: PAL.ink, sw: 1.3 });
      paint(rectPts(bx - 12, top - 16, bw + 24, 26, 2), { wash: mixCol(dk, PAL.ink, .15), ink: PAL.ink, sw: 1 });
      if (bi % 2 === 0) { paint(rectPts(bx + bw * .7, top - 90, 60, 76), { wash: mixCol(dk, PAL.ink, .2), ink: PAL.ink, sw: .9 }); inkLine([[bx + bw * .72, top - 90], [bx + bw * .72 + 30, top - 118], [bx + bw * .72 + 60, top - 90]], 1.4, PAL.ink, 'fine', 0); }
      else { inkLine([[bx + bw * .3, top - 16], [bx + bw * .3, top - 130]], 1.6, PAL.ink, 'fine', 0); dot(bx + bw * .3, top - 132, 5, '#FF8FA3', .6 + .4 * Math.sin(t * 4 + bi)); }
    });
    const vx0 = cx - W / 2 / z - 120, vx1 = cx + W / 2 / z + 120, vy0 = cy - H / 2 / z - 160, vy1 = cy + H / 2 / z + 160;
    for (const w of WIN) if (w.x > vx0 && w.x < vx1 && w.y > vy0 && w.y < vy1) windowPane(w, t);
    // lanterns
    for (const L of LAN) { const a = t - L.t0; if (a < 0) continue; const [lx, ly] = lanPos(L, t); if (lx < vx0 || lx > vx1 || ly < vy0 || ly > vy1 + 100) continue; lantern(lx, ly, L.s * (1 + .05 * Math.sin(t * 3 + L.seed)), t, { seed: L.seed, rot: Math.sin(a * 1.3 + L.seed) * .08, heart: L.heart, a: seg(a, 0, .3) }); }
    // the plane: first the low pass in front of the facades, then high among the lanterns
    const [gx, gy] = glowPlane(t);
    if (t < G0 + 2.3) {
      for (let i = 0; i < 14; i++) { const q = glowPlane(t - i * .05); sparkle(q[0] - 120 - i * 8, q[1] + 30 + Math.sin(i * 1.7) * 26, 14 + 8 * hash(i), i % 2 ? '#FFF3C0' : '#FFD1E0', 1 - i / 14); }
      paperPlane(gx, gy, 250, t, { el: .4, pitch: .05, roll: -.08, riders: P => crew(P, t, { s: 25, fac: 1, wind: 1, lift: .3,
        h: { eyes: 'happy', mouth: 'grin', lookX: .1, lookY: .6, aL: .4 + .25 * Math.sin(t * 12), aR: -.3, blush: .8, ahoge: 'perk' },
        m: { eyes: 'star', mouth: 'open', lookX: .2, lookY: .5, aL: .3, aR: .4 + .25 * Math.sin(t * 11) } }) });
    }
    const hu = seg(t, G0 + 2.5, G0 + 5.4), hy = lerp(-150, -560, hu) + Math.sin(t * 1.6) * 16, hx = lerp(420, 1800, hu);
    if (t > G0 + 2.5) paperPlane(hx, hy, 250, t, { el: .45, pitch: .16, roll: .03, riders: P => crew(P, t, { s: 25, fac: 1, wind: 1, lift: .3,
      h: { eyes: 'happy', mouth: 'grin', lookX: -.2, lookY: .7, aL: .42 + .2 * Math.sin(t * 11), aR: -.2, blush: .8, ahoge: 'heart' },
      m: { eyes: 'happy', mouth: 'open', lookY: .6, aL: .4, aR: .35, dy: -.3 * pulse(t, 4) } }) });
    camEnd();
  }
  // =================================================================================================================
  // 244.956 · They land in the crescent's bowl. She sits, lifts her pencil and draws one more star in the empty part
  // of the moon; it lights up and stays there. The dotted outline of a full moon glimmers… and is left unfinished.
  // =================================================================================================================
  const M0 = 244.956, MX = 1120, MY = 300, MR = 360, MROT = 1.2;
  const moonPt = (a, k = 1) => {                        // a point on the inner (concave) edge; k < 1 pulls it inwards
    const px = -.15 * MR + Math.cos(a) * .72 * MR * k, py = Math.sin(a) * .9 * MR * k, c = Math.cos(MROT), sn = Math.sin(MROT);
    return [MX + px * c - py * sn, MY + px * sn + py * c];
  };
  const MSEAT = (() => { let best = -1, ba = 0; for (let i = 0; i <= 80; i++) { const a = -Math.PI / 2 + i / 80 * Math.PI, p = moonPt(a); if (p[1] > best) { best = p[1]; ba = a; } } return ba; })();
  const STAR = [1010, 170];                             // where the new star goes, in the moon's missing part
  function moon(t, lt, dur) {
    const bp = bpOf(t), land = B(409), hopT = B(410), drawT = B(411), popT = B(413);
    const push1 = ease(seg(t, M0, land + .6)), pull = easeInOut(seg(t, popT - .2, M0 + 4.4));
    const cx = lerp(lerp(860, 1040, push1), 1060, pull), cy = lerp(lerp(300, 380, push1), 330, pull), z = lerp(lerp(.92, 1.22, push1), 1.0, pull);
    nightSky(t, { warm: .45, y0: -500, y1: 1500, stars: 110, seed: 5 });
    camBegin(cx, cy, z, 0);
    light(MX + 60, MY + 40, 560, '#FFE6A8', .16);
    // lanterns far below, still drifting up
    for (let i = 0; i < 16; i++) { const a = frac(t * .08 + hash(i * 3.3)), lx = -200 + hash(i * 7.1) * 2400, ly = 1500 - a * 700; glow(lx, ly, 34, '#FFC98A', .5 * (1 - a)); dot(lx, ly, 6, '#FFE2A8', .9 * (1 - a)); }
    for (let i = 0; i < 4; i++) cloudPuff(-150 + i * 640 + Math.sin(t * .3 + i) * 20, 980 + (i % 2) * 90, 1.4, '#7C6AAE', { seed: i + 7, op: 170, shade: '#5E4F92', ink: false });
    // the moon
    const moonAwake = t > land + .02 && t < land + .75;
    moonFace(MX, MY, MR, { rot: MROT, eyes: moonAwake ? 'open' : undefined });
    if (moonAwake) {                                                       // the moon's round, surprised eye (smoother, with a highlight)
      push(); translate(MX, MY); rotate(MROT);
      paint(ellPts(.62 * MR, -.1 * MR, .058 * MR, .078 * MR, 22), { wash: PAL.ink, ink: null });
      dot(.605 * MR, -.125 * MR, MR * .02, '#FFFFFF', .95); dot(.64 * MR, -.07 * MR, MR * .009, '#FFFFFF', .8);
      pop();
    }
    // the dotted outline of a full moon: it glimmers, and is left open
    const ghost = smooth01(t, popT + .35, popT + .7, M0 + 3.6, M0 + 4.2);
    if (ghost > 0) fadeIn(ghost, () => { for (let i = 0; i < 26; i++) { const a = MROT + Math.PI * .5 + .18 + i / 26 * (Math.PI - .36); dot(MX + Math.cos(a) * MR * 1.0, MY + Math.sin(a) * MR * 1.0, 4.2, '#FFF1C2', .75); } });
    // the plane: glides in, lands in the bowl with a bump and stays parked there
    const seat = moonPt(MSEAT), parkA = MSEAT + 1.18, park = moonPt(parkA);
    const u = seg(t, M0 - .3, land);
    const slide = easeInOut(seg(t, hopT + .2, hopT + 1.0));                // after they hop off it slides back onto the horn
    const touch = moonPt(MSEAT + .42);                                    // it touches down just left of the moon's face
    let px = lerp(lerp(120, touch[0] - 40, easeOut(u)), park[0] + 30, slide), py = lerp(lerp(-40, touch[1] - 22, easeOut(u)), park[1] - 16, slide) - Math.sin(u * Math.PI) * 60, pr = lerp(-.25, .3, u), pp = lerp(lerp(-.3, .05, u), -.38, slide);
    const bump = t > land ? Math.sin(seg(t, land, land + .4) * Math.PI) * 18 * (1 - seg(t, land, land + .8)) : 0;
    py -= bump;
    const onPlane = t < hopT;
    const hopU = seg(t, hopT - .1, hopT + .3);
    const mS = 24;
    const sH = moonPt(MSEAT + .14), sM = moonPt(MSEAT - .3), seatH = [sH[0], sH[1] + 2], seatM = [sM[0], sM[1] + 1];   // no crossing: she lands left, 桃桃 right
    // stardust puff at the landing
    if (t > land && t < land + .8) for (let i = 0; i < 9; i++) { const a = Math.PI + i / 8 * Math.PI, e = easeOut(seg(t, land, land + .8)); sparkle(touch[0] - 40 + Math.cos(a) * 190 * e, touch[1] - 30 + Math.sin(a) * 70 * e, 16, '#FFF3C0', seg(t, land, land + .8)); }
    // 团子's paper boat, towed in behind the plane, settles in the bowl; he curls up for a nap on the moon
    {
      const bu = seg(t, M0 - .3 + .35, land + .45), dock = moonPt(MSEAT + .62), bb = Math.sin(seg(t, land + .45, land + .9) * Math.PI) * 10;
      const bx = lerp(-60, dock[0], easeOut(bu)), by = lerp(-20, dock[1] - 16, easeOut(bu)) - Math.sin(bu * Math.PI) * 70 - bb + Math.sin(t * 2.2) * 2 * seg(t, land + .9, land + 1.4);
      const nap = t > popT + .6, bsc = 54;
      if (bu < 1 && bu > 0) inkLine([[bx + bsc, by - 20], [lerp(bx, px, .5), lerp(by, py, .5) + 30], [px - 150, py + 10]], 1.1, '#F4ECFA', 'fine', .5, .7 * (1 - seg(t, land + .2, land + .5)));
      paperBoat(bx, by, bsc, t, { rot: -.12 + .06 * Math.sin(t * 2.2), inside: () => cat(bx + 7, by + 4, 12, nap ? { pose: 'sleep', noShadow: true, zzz: true } : { pose: 'sit', eyes: t > land + .5 ? 'happy' : 'wide', noShadow: true, look: .5, sq: .2 * (1 - elasticOut(seg(t, land + .45, land + .9))) }) });
    }
    paperPlane(px, py, lerp(230, 150, slide), t, { el: .4, yaw: 0, pitch: pp, roll: pr * .3, flutter: onPlane ? 1 : .3, riders: onPlane ? P => crew(P, t, { s: mS, fac: 1, wind: .8, lift: .3,
      h: { eyes: 'star', mouth: 'open', lookX: .3, aL: .35, aR: .35, blush: .8, ahoge: 'perk', sq: .25 * (1 - elasticOut(seg(t, land, land + .5))) },
      m: { eyes: 'star', mouth: 'grin', aL: .4, aR: .4, sq: .25 * (1 - elasticOut(seg(t, land + .04, land + .55))) } }) : null });
    if (!onPlane) {
      // they hop off and sit side by side at the bottom of the bowl, legs swinging
      const hp = (from, to, k) => [lerp(from[0], to[0], k), lerp(from[1], to[1], k) - Math.sin(k * Math.PI) * 70];
      const P0 = planeProj(px, py, 230, { el: .4, pitch: pp, roll: pr * .3 });
      const fromH = P0([-.02, 0, .02]), fromM = P0([.52, 0, .02]);
      const [hx, hy] = hopU < 1 ? hp([fromH[0], fromH[1] + mS * .75], seatH, easeInOut(hopU)) : seatH;
      const [mx, my] = hopU < 1 ? hp([fromM[0], fromM[1] + mS * .6], seatM, easeInOut(seg(t, hopT - .02, hopT + .36))) : seatM;
      const swing = Math.sin(t * 4.2), cont = seg(t, popT + .5, popT + .9);
      const md = mood(t, [[hopT, 'happy'], [drawT - .15, 'sparkle', null, 'o'], [popT, 'star', 'spark', 'open'], [popT + .75, 'happy', null, 'smile']]);
      const lift = seg(t, drawT - .2, drawT + .1) * (1 - seg(t, popT + .3, popT + .7));
      // 桃桃 (on her right), leaning on her shoulder at the end
      momo(mx, my, mS * .82, { sit: true, eyes: t > popT ? 'happy' : 'star', mouth: t > popT ? 'open' : 'smile', tilt: -.2 * cont, lookX: -.4, rot: -.1 * cont, blush: .8,
        aL: t > popT && t < popT + .6 ? .4 + .3 * Math.sin(t * 14) : -.9, aR: t > popT && t < popT + .6 ? .4 - .3 * Math.sin(t * 14) : -.7, noShadow: true, dy: -.1 * Math.abs(swing) });
      capeFB(hx, hy, mS, t, { lift: .15, wind: .2 });
      hero(hx, hy, mS, { outfit: 'pajama', sit: true, ...md, blush: .8, lookX: lerp(.2, -.3, lift), lookY: lerp(0, -.8, lift), tilt: -.1 * cont, ahoge: cont > .5 ? 'heart' : 'perk', noShadow: true,
        aL: -.9, aR: lerp(-.9, .45, lift), dy: -.08 * Math.abs(swing),
        handR: lift > .05 ? (s, sw) => { pencil(0, 0, s / 55, -Math.PI / 2 - .5, '#F6C85F'); } : null });
      capeKnot(hx, hy, mS, { lookX: -.3 * lift });
      // the pencil tip's light draws the star, stroke by stroke, then it pops alive
      if (t > drawT) {
        const k = seg(t, drawT + .1, popT - .1), pts = starPts(STAR[0], STAR[1], 62, .45, 5, -Math.PI / 2).concat([starPts(STAR[0], STAR[1], 62, .45, 5, -Math.PI / 2)[0]]);
        const n = Math.max(1, Math.floor(k * (pts.length - 1))), part = pts.slice(0, n + 1);
        const f = k * (pts.length - 1) - n; if (n < pts.length - 1) part.push([lerp(pts[n][0], pts[n + 1][0], f), lerp(pts[n][1], pts[n + 1][1], f)]);
        const lit = seg(t, popT, popT + .25);
        if (lit < 1 && part.length > 1) { inkLine(part, 2.4, '#FFE9A8', 'pencil', 0, 1); const tip = part[part.length - 1]; sparkle(tip[0], tip[1], 16, '#FFF3C0', .5); glow(tip[0], tip[1], 40, '#FFF3C0', .6); }
        if (t < popT) { const tipH = [hx + 40, hy - mS * 7]; inkLine([tipH, part[part.length - 1]], 1, '#FFF3C0', 'fine', 0, .35 * (1 - seg(t, popT - .3, popT))); }
        if (lit > 0) {
          const pk = backOut(lit), tw = 1 + .08 * Math.sin(t * 9);
          glow(STAR[0], STAR[1], 260 * pk, '#FFF1C2', .55);
          light(STAR[0], STAR[1], 150 * pk, '#FFF6D6', .35);
          paint(starPts(STAR[0], STAR[1], 66 * pk * tw, .45, 5, -Math.PI / 2), { wash: '#FFE59A', fill: '#F6C85F', fillOp: 90, tex: .3, ink: PAL.ink, sw: 1.2, curv: .15 });
          for (const sd of [-1, 1]) inkLine([[STAR[0] + sd * 18 - 7, STAR[1] + 2], [STAR[0] + sd * 18, STAR[1] - 5], [STAR[0] + sd * 18 + 7, STAR[1] + 2]], 1.4, PAL.ink, 'ink', .5);
          inkLine([[STAR[0] - 6, STAR[1] + 12], [STAR[0], STAR[1] + 16], [STAR[0] + 6, STAR[1] + 12]], 1.2, PAL.ink, 'ink', .5);
          if (lit < 1) for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; sparkle(STAR[0] + Math.cos(a) * 150 * lit, STAR[1] + Math.sin(a) * 150 * lit, 18, '#FFF3C0', lit); }
          for (let i = 0; i < 4; i++) sparkle(STAR[0] + Math.cos(i * 1.6 + 1) * 110, STAR[1] + Math.sin(i * 1.6 + 1) * 90, 12, '#FFF3C0', frac(t * .9 + i * .25));
        }
      }
    }
    camEnd();
  }
  // =================================================================================================================
  // 249.156 · Grey 算了 clouds block the way. She points ahead, the plane charges and bursts through them one per beat —
  // each pops into a pink cotton-candy cloud — and she and 桃桃 jump off and bounce on them like trampolines.
  // =================================================================================================================
  const C0 = 249.156;
  const CLOUDS = [[1350, 470, 2.1, B(416)], [1950, 380, 2.3, B(417)], [2550, 490, 2.15, B(418)]];
  const cloudPlaneX = t => 1350 + 1000 * (t - B(416));
  function cottonClouds(t, lt, dur) {
    const bp = bpOf(t), popped = CLOUDS.filter(c => t > c[3]).length;
    const follow = seg(lt, 0, 2.2), settle = easeInOut(seg(lt, 2.0, 2.9));
    const pin = easeInOut(seg(lt, 2.9, 4.8));
    const cx = lerp(lerp(Math.max(1050, cloudPlaneX(Math.min(t, C0 + 2.1)) + 60), 2230, settle), 2260, pin), cy = lerp(lerp(430, 400, settle), 250, pin), z = lerp(lerp(.92, .88, settle), 1.08, pin);
    const warm = popped / 3;
    nightSky(t, { warm: .35 + .5 * warm, top: mixCol('#141A44', '#3B2E6E', warm), stars: 60, seed: 8 });
    // the soft pink glow that spreads as the clouds turn
    for (const c of CLOUDS) if (t > c[3]) glow((c[0] - cx) * z * .3 + 960, 540 + (c[1] - cy) * z * .3, 700 * easeOut(seg(t, c[3], c[3] + 1)), '#FFB8D0', .22);
    camBegin(cx, cy, z, 0);
    const gloom = 1 - seg(t, B(416), B(418) + .3);
    if (gloom > 0) for (const c of CLOUDS) if (t < c[3] + .2) glow(c[0], c[1], 520, '#2A2748', .35 * gloom);
    // background puffs, gently pink once the clouds have turned
    for (let i = 0; i < 7; i++) { const bx = 400 + i * 480 + Math.sin(t * .4 + i) * 20, by = 820 + (i % 3) * 70; cloudPuff(bx, by, 1.3 + hash(i) * .6, mixCol('#8C86B8', '#F7C3D6', warm), { seed: i + 11, op: 200, shade: mixCol('#6E68A8', '#E99AB8', warm), ink: false }); }
    // the clouds: grey and sighing, then burst into pink cotton candy
    CLOUDS.forEach(([x, y, sc, tp], i) => {
      const a = t - tp;
      if (a < .35) sighCloud(x, y, sc, { pop: a > 0 ? a / .35 : 0 });
      if (a > 0) {
        const grow = backOut(seg(a, .05, .45));
        const land = bounceLand(t, i);
        candyCloud(x, y + 10, sc * .95 * grow, { sq: land, seed: 3 + i * 2 });
        if (a < .9) for (let k = 0; k < 12; k++) { const an = k / 12 * TAU, e = easeOut(seg(a, 0, .9)); sparkle(x + Math.cos(an) * 260 * sc * e, y + Math.sin(an) * 110 * sc * e, 18, k % 2 ? '#FFF3C0' : '#FFD1E0', seg(a, 0, .9)); }
        if (a < .6) for (let k = 0; k < 7; k++) { const an = k / 7 * TAU + .4, e = easeOut(seg(a, 0, .6)); paint(ellPts(x + Math.cos(an) * 200 * sc * e, y + Math.sin(an) * 70 * sc * e, 40 * (1 - e) + 8, 30 * (1 - e) + 6, 10), { fill: '#B7B6C6', fillOp: 150 * (1 - e), bleed: .1, ink: null }); }
      }
    });
    // the plane: charges through the clouds, then loops round happily on its own
    const px = cloudPlaneX(t), py = 440 + Math.sin(t * 3) * 12;
    const jumpM = B(417) + .02, jumpH = B(418) + .02, charge = seg(lt, 0, .5);
    if (lt < 2.9) {
      const speed = [];
      for (let k = 0; k < 7; k++) { const yy = py - 80 + k * 30; speed.push([[px - 380 - hash(k) * 200, yy], [px - 220 - hash(k) * 120, yy]]); }
      speed.forEach(l => inkLine(l, 1.2, '#EDE3F5', 'fine', 0, .6 * charge));
      paperPlane(px, py, 260, t, { el: .4, pitch: -.05 + .1 * Math.sin(t * 2.2), roll: -.05, riders: P => crew(P, t, {
        s: 26, fac: 1, wind: 1, lift: .3, noMomo: t > jumpM, noHero: t > jumpH,
        h: t > jumpH ? { eyes: 'star' } : { ...mood(t, [[C0 - 1, 'normal', null, 'grin'], [C0 + .5, 'star', '!', 'open']]), brows: t < C0 + .5 ? 'angry' : null, lookX: .6, aR: .02, aL: -.5, blush: .7, ahoge: 'perk' },
        m: { eyes: 'normal', brows: 'angry', mouth: 'grin', lookX: .6, aL: .3, aR: .3 } }) });
    }
    const lp = seg(t, C0 + 2.9, C0 + 4.8);
    if (lp > 0) {                                           // the empty plane swoops back across the sky
      const qx = lerp(3300, 1100, lp), qy = 160 + Math.sin(lp * Math.PI) * -60;
      paperPlane(qx, qy, 200, t, { el: .4, yaw: Math.PI, pitch: .05, roll: .1 * Math.sin(t * 3) });
      for (let i = 0; i < 8; i++) sparkle(qx + 120 + i * 30, qy + (hash(i) - .5) * 40, 12, '#FFF3C0', 1 - i / 8);
    }
    // the bouncers
    bouncer(t, 'momo', 1, jumpM, px, py);
    bouncer(t, 'hero', 2, jumpH, px, py);
    camEnd();
  }
  // bounce state: they land on their cloud on the beat and fly up again
  function bounceY(t, i) {
    const t0 = i === 1 ? B(418) : B(419);
    if (t < t0) return null;
    const per = BEAT, u = frac((t - t0) / per), h = (i === 1 ? 170 : 230) * (1 - .15 * Math.floor((t - t0) / per) % 2);
    return { h: 4 * u * (1 - u) * h, u, since: u * per };
  }
  function bounceLand(t, i) { const b = bounceY(t, i); return b ? .3 * Math.exp(-b.since * 9) : 0; }
  function bouncer(t, who, ci, tJump, px, py) {
    if (t < tJump) return;
    const [cxx, cyy, sc] = CLOUDS[ci], top = cyy - 62 * sc, b = bounceY(t, ci), s = who === 'hero' ? 27 : 23;
    let x, y, sq = 0, rot = 0;
    if (!b) {                                                // the leap off the plane down onto the cloud
      const u = seg(t, tJump, tJump + .55), sx = px - (who === 'hero' ? 0 : -150), sy = py + 20;
      x = lerp(px - (who === 'hero' ? 20 : -130), cxx, u); y = lerp(sy, top, u) - Math.sin(u * Math.PI) * (who === 'hero' ? 170 : 90); rot = u * .6 * (who === 'hero' ? 1 : -1);
    } else { x = cxx + Math.sin(t * 2) * 10; y = top - b.h + b.h * 0; y = top - b.h; sq = .3 * Math.exp(-b.since * 10) - .12 * Math.sin(b.u * Math.PI); rot = Math.sin(b.u * TAU) * .1; }
    const joy = { eyes: 'happy', mouth: 'open', blush: .9, aL: .4 + .2 * Math.sin(t * 9), aR: .4 - .2 * Math.sin(t * 9) };
    if (who === 'hero') { capeFB(x, y, s, t, { lift: .9, wind: Math.sin(t * 3) * .3, dy: 0 }); hero(x, y, s, { outfit: 'pajama', ...joy, sq, rot, ahoge: 'perk', noShadow: true }); capeKnot(x, y, s, {}); }
    else momo(x, y, s, { ...joy, sq, rot, noShadow: true });
  }
  // =================================================================================================================
  // 253.956 · One long pull-back: from her little warm patch of the city up to the whole night Earth. Then, on the beat,
  // other small lights come on all over the globe (other people like her), and gentle golden lines join them into a
  // constellation.
  // =================================================================================================================
  const E0 = 253.956, GX = 960, GY = 520, GR = 330, DEG = Math.PI / 180, CITY = [31 * DEG, 111.5 * DEG], TILT = 22 * DEG;
  const LANDS = [ // stylised continents: [lat, lon, dlat, dlon, seed]
    [52, 62, 13, 40, 1], [58, 105, 10, 34, 9], [24, 78, 10, 10, 2], [32, 108, 11, 13, 12], [14, 102, 8, 6, 13], [7, 20, 26, 18, 3],
    [50, 14, 8, 15, 4], [46, -100, 20, 30, 5], [-16, -60, 24, 13, 6], [-25, 134, 9, 16, 7], [72, -40, 7, 16, 8], [36, 138, 6, 3, 14],
    [-3, 114, 3, 11, 10], [64, 160, 7, 14, 15]];
  // the other lights sit in a loose ring around hers (placed on the disc as seen near the end, then turned to lat/lon)
  const LON_REF = 104 * DEG + (258 - E0) * 3.2 * DEG;
  const fromDisc = (x, y) => { const z = Math.sqrt(Math.max(0, 1 - x * x - y * y)), yy = y * Math.cos(TILT) + z * Math.sin(TILT), zz = -y * Math.sin(TILT) + z * Math.cos(TILT); return [Math.asin(clamp(yy, -1, 1)) / DEG, (LON_REF + Math.atan2(x, zz)) / DEG]; };
  const OTHERS = Array.from({ length: 12 }, (_, k) => {
    const a = -Math.PI / 2 + k / 12 * TAU + (hash(k * 3.1) - .5) * .3, r = (k % 2 ? .52 : .74) + (hash(k * 5.7) - .5) * .08;
    const [la, lo] = fromDisc(Math.cos(a) * r, -Math.sin(a) * r * .95 + .06);
    return [la, lo, k % 6, [427, 427.5, 428, 428.25, 428.5, 428.75, 429, 429.25, 429.5, 429.75, 430, 430.25][(k * 5) % 12]];
  });
  const CONNECT = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 11], [11, 0], [-1, 1], [-1, 5], [-1, 9]];
  function earthLights(t, lt, dur) {
    const bp = bpOf(t), lon0 = 104 * DEG + (t - E0) * 3.2 * DEG;
    // 3D point on the unit sphere and its projection (tilted so the north leans towards us)
    const P3 = (lat, lon) => { const x = Math.cos(lat) * Math.sin(lon - lon0), yy = Math.sin(lat), zz = Math.cos(lat) * Math.cos(lon - lon0); return [x, yy * Math.cos(TILT) - zz * Math.sin(TILT), yy * Math.sin(TILT) + zz * Math.cos(TILT)]; };
    const Z = Math.exp(lerp(Math.log(30), 0, easeInOut(seg(lt, 0, 2.7)))) * lerp(1, 1.1, ease(seg(lt, 2.7, 5.6)));
    const cityW = (() => { const q = P3(CITY[0], CITY[1]); return [GX + GR * q[0], GY - GR * q[1]]; })();
    const m = 1 - Math.log(Math.max(1, Z)) / Math.log(30), L = [lerp(cityW[0], GX, ease(m)), lerp(cityW[1], GY, ease(m))];
    const SP = (wx, wy) => [960 + (wx - L[0]) * Z, 540 + (wy - L[1]) * Z];
    const proj = (lat, lon, lift = 1) => { const q = P3(lat, lon); return { p: SP(GX + GR * q[0] * lift, GY - GR * q[1] * lift), z: q[2] }; };
    // space
    paint(rectPts(-10, -10, W + 20, H + 20), { grad: ['#0C1034', '#1E1E52', Math.PI / 2], ink: null });
    for (let i = 0; i < 5; i++) glow(200 + i * 400, 300 + Math.sin(i * 2.1) * 200, 320, '#5E4FA0', .12);
    starField(t, { x: 0, y: 0, w: W, h: H }, 120, { seed: 9 });
    const gs = SP(GX, GY), rs = GR * Z;
    if (rs < 4000) { moonFace(1640 + (gs[0] - 960) * .05, 180, 58, { rot: -.35 }); glow(gs[0], gs[1], rs * 1.35, '#8FA8FF', .35); }
    // the globe
    const disc = ellPts(gs[0], gs[1], rs, rs, 72);
    paint(disc, { wash: '#1A2562', fill: '#28388A', fillOp: 90, bleed: .02, tex: .5, border: .2, ink: null });
    clipTo(disc, () => {
      for (const [la, lo, dla, dlo, sd] of LANDS) {
        if (P3(la * DEG, lo * DEG)[2] < -.1) continue;                  // on the far side
        const pts = [];
        for (let k = 0; k < 26; k++) {
          const a = k / 26 * TAU, r = .75 + .25 * Math.sin(a * 3 + sd) + .12 * Math.sin(a * 7 + sd * 2);
          const q = P3((la + Math.sin(a) * dla * r) * DEG, (lo + Math.cos(a) * dlo * r) * DEG);
          let x = q[0], y = q[1]; if (q[2] < 0) { const l = Math.hypot(x, y) || 1; x /= l; y /= l; }
          pts.push(SP(GX + GR * x, GY - GR * y));
        }
        paint(pts, { wash: '#35607E', fill: '#4A7A8E', fillOp: 90, bleed: .02, tex: .5, border: .35, ink: null, curv: .5 });
      }
      // moonlit rim and the night shading
      paint(ellPts(gs[0] + rs * .08, gs[1] - rs * .08, rs * .97, rs * .97, 60), { fill: '#AFC4FF', fillOp: 26, bleed: .02, tex: 0, border: 1, ink: null });
      glow(gs[0] - rs * .3, gs[1] + rs * .35, rs * 1.1, '#0A0D2A', .45);
      // her city: the warm patch (a little map of glowing blocks while we are close)
      const c = proj(CITY[0], CITY[1]), blk = GR * Z * .35 * DEG;
      if (blk > 2.5) {
        const n = 11, sg = blk * 1.08, fadeMap = clamp((blk - 2.5) / 5);
        fadeIn(fadeMap, () => {
          const at = (i, j) => [c.p[0] + (i + (hash(i * 7.1 + j * 1.3) - .5) * .25) * sg, c.p[1] + (j + (hash(i * 2.9 + j * 5.3) - .5) * .25) * sg];
          const warmAt = (i, j) => clamp((5.6 - Math.hypot(i, j * 1.15) - (hash(i * 13 + j * 7) - .5) * 2) / 2.2);
          glow(c.p[0], c.p[1], sg * 7.5, '#FFB0B8', .22);
          // the street web: warm glowing lines in the lit patch, faint blue ones beyond
          for (let k = -8; k <= 8; k += 2) for (const hor of [0, 1]) {
            const ext = Math.floor(Math.sqrt(Math.max(0, 72 - k * k))); if (ext < 2) continue;
            const pts = [];
            for (let m = -ext; m <= ext; m++) { const [x, y] = hor ? at(m, k) : at(k, m); pts.push([x + (hor ? 0 : Math.sin(m * .7 + k) * sg * .12), y + (hor ? Math.sin(m * .6 + k) * sg * .12 : 0)]); }
            const w = clamp((5.5 - Math.abs(k)) / 3);
            inkLine(pts, Math.max(.6, blk * (.035 + .03 * w)), mixCol('#5F73B8', '#FFD98A', w), 'marker', .3, .3 + .45 * w);
          }
          // the lights: little warm clusters in her patch, sparse cool ones further out
          for (let i = -n; i <= n; i++) for (let j = -n; j <= n; j++) {
            const wk = warmAt(i, j), dist = Math.hypot(i, j * 1.15); if (dist > 10) continue;
            const [bx, by] = at(i + .5, j + .5); if (bx < -sg || bx > W + sg || by < -sg || by > H + sg) continue;
            const nL = wk > .1 ? 4 : hash(i * 5 + j * 3) > .55 ? 1 : 0;
            for (let q = 0; q < nL; q++) {
              const lx = bx + (hash(i * 31 + j * 17 + q) - .5) * sg * .7, ly = by + (hash(i * 17 + j * 31 + q) - .5) * sg * .7, col = wk > .1 ? WARM[(i * 3 + j * 5 + q + 60) % 6] : '#9FB2E0';
              const r = Math.max(.9, blk * (wk > .1 ? .075 + .05 * hash(q + i) : .045));
              if (wk > .1 && blk > 6) glow(lx, ly, r * 4, col, .35 * wk);
              dot(lx, ly, r, wk > .1 ? mixCol(col, '#FFFFFF', .35) : col, wk > .1 ? .95 * wk + .05 : .5);
            }
          }
          // a river winding through, with the lights shimmering on it
          const rv = []; for (let k = -9; k <= 8; k++) rv.push([c.p[0] + k * sg, c.p[1] + (Math.sin(k * .45 + .8) * 2.2 + 1.6) * sg]);
          inkLine(rv, blk * .5, '#1B2458', 'marker', .5, .9);
          inkLine(rv.map(p => [p[0], p[1] - blk * .06]), Math.max(.5, blk * .05), '#FFD98A', 'fine', .5, .35);
        });
        // the tiny plane circling over it, trailing pink
        if (blk > 16) { const a = t * 2.2, pr = blk * 3.2; for (let k = 1; k < 12; k++) { const b = a - k * .12; dot(c.p[0] + Math.cos(b) * pr, c.p[1] + Math.sin(b) * pr * .7, 2 + (12 - k) * .4, '#F7B6C8', .7 * (1 - k / 12)); } paperPlane(c.p[0] + Math.cos(a) * pr, c.p[1] + Math.sin(a) * pr * .7, Math.max(10, blk * .55), t, { el: .9, yaw: a + Math.PI / 2 + Math.PI, flutter: .3, doodle: false }); }
      }
      const pk = 1 + .3 * pulse(t, 4);
      light(c.p[0], c.p[1], Math.min(560, Math.max(46, blk * 7)) * pk, '#FFB8C8', blk > 10 ? .3 : .6);
      glow(c.p[0], c.p[1], Math.min(300, Math.max(26, blk * 4)) * pk, '#FFE3A8', blk > 10 ? .35 : .85);
      if (blk <= 10) { dot(c.p[0], c.p[1], 6 * pk, '#FFF8E8', 1); const rp = frac(bpOf(t)); paint(ellPts(c.p[0], c.p[1], 14 + 60 * rp, 11 + 48 * rp, 20), { ink: '#FFB8C8', sw: 1.4 * (1 - rp), br: 'fine' }); }
    });
    // atmosphere rim
    paint(disc, { ink: '#8FA8FF', sw: 1.2, br: 'fine' });
    if (rs < 3000) glow(gs[0], gs[1] - rs * .05, rs * 1.08, '#B7C6FF', .08);
    // the other little lights, coming on with a ping, and the golden threads between them
    const pos = i => i < 0 ? proj(CITY[0], CITY[1]) : proj(OTHERS[i][0] * DEG, OTHERS[i][1] * DEG);
    const onAt = i => i < 0 ? 0 : B(OTHERS[i][3]);
    CONNECT.forEach(([a, b2], k) => {
      const t0 = B(429.75) + k * .1, u = seg(t, t0, t0 + .4); if (u <= 0) return;
      const A = pos(a), Bq = pos(b2); if (A.z < .05 || Bq.z < .05 || t < onAt(a) || t < onAt(b2)) return;
      const la = [a < 0 ? CITY[0] : OTHERS[a][0] * DEG, a < 0 ? CITY[1] : OTHERS[a][1] * DEG], lb = [OTHERS[b2][0] * DEG, OTHERS[b2][1] * DEG];
      const arc = []; for (let q = 0; q <= 12; q++) { const f = q / 12 * u, pt = proj(lerp(la[0], lb[0], f), lerp(la[1], lb[1], f), 1 + .1 * Math.sin(f / Math.max(u, .01) * Math.PI) * u); arc.push(pt.p); }
      inkLine(arc, 1.6, '#FFE3A0', 'fine', .5, .8);
      if (u < 1) sparkle(arc[arc.length - 1][0], arc[arc.length - 1][1], 10, '#FFF3C0', .6);
    });
    OTHERS.forEach(([la, lo, ci, b], i) => {
      const t0 = B(b); if (t < t0) return;
      const q = proj(la * DEG, lo * DEG); if (q.z < .02) return;
      const a = t - t0, k = backOut(seg(a, 0, .3)) * clamp(q.z * 3), col = WARM[ci];
      light(q.p[0], q.p[1], 60 * k, col, .45);
      glow(q.p[0], q.p[1], 26 * k, '#FFF3D6', .8);
      dot(q.p[0], q.p[1], 4.5 * k, '#FFF8E8', 1);
      if (a < .7) { const r = 10 + 70 * easeOut(a / .7); paint(ellPts(q.p[0], q.p[1], r, r * .8, 20), { ink: col, sw: 1.2 * (1 - a / .7), br: 'fine' }); }
      sparkle(q.p[0], q.p[1] - 2, 10, '#FFF3C0', frac(t * .7 + i * .37));
    });
    // the pink cotton clouds we rise up through at the start
    const rise = seg(lt, 0, 1.3);
    if (rise < 1) for (let i = 0; i < 5; i++) {
      const a = i / 5 * TAU + .6, d = lerp(700, 1500, easeIn(rise)) * (.85 + .3 * hash(i)), sc = lerp(1.7, 3.2, easeIn(rise)) * (.8 + .4 * hash(i + 3));
      fadeIn(1 - easeIn(rise), () => cloudPuff(960 + Math.cos(a) * d * 1.1, 540 + Math.sin(a) * d * .62, sc, '#FAD0DF', { seed: 20 + i, shade: '#F29BB8', op: 225 }));
    }
    // her light answers each new one with a little pulse; a shooting star at the end
    const ss = seg(t, B(429.5), B(430.8)); if (ss > 0 && ss < 1) { const sx = lerp(1500, 1050, ss), sy = lerp(120, 300, ss); inkLine([[sx + 160, sy - 64], [sx, sy]], 2, '#FFF3C0', 'fine', 0, .8 * (1 - ss)); sparkle(sx, sy, 16, '#FFF3C0', .5); }
  }
  // =================================================================================================================
  // 259.356 · Back at her desk, from above: she writes one more line and it glows. The 落款 seal sidles in and rears up
  // to stamp 完 — she smiles and shakes her head — and turns the page to a fresh blank one. Still not finished.
  // =================================================================================================================
  const D0 = 259.356, WR0 = 259.42, WR1 = 261.1, SEAL_IN = 261.15, REAR = 261.84, FACE0 = 262.3, FACE1 = 263.05, FLIP0 = 263.05, FLIP1 = B(439);
  const LINE_Y = 225 + 60 + 7 * 62;                         // the new line is the 8th row of the right page
  function scribble(x0, x1, y, seed, k = 1) {               // a row of cursive handwriting from x0 to x1, drawn to fraction k
    const pts = [], n = Math.max(2, Math.floor((x1 - x0) / 7));
    for (let i = 0; i <= n * k; i++) { const u = i / n, x = lerp(x0, x1, u); pts.push([x + Math.sin(u * 60 + seed) * 5, y + Math.sin(u * 47 + seed * 2) * 9 * (.6 + .4 * Math.sin(u * 13 + seed)) - (hash(Math.floor(u * 9) + seed) > .8 ? 8 : 0)]); }
    return pts;
  }
  // looping cursive (a prolate cycloid with letter-sized loops and the odd ascender), drawn to fraction k
  function cursive(x0, x1, y, seed, k = 1) {
    const letters = Math.max(2, Math.round((x1 - x0) / 26)), n = letters * 9, pts = [];
    for (let i = 0; i <= n * k; i++) {
      const u = i / n, li = Math.floor(u * letters), ph = u * TAU * letters + seed, amp = .7 + .5 * hash(li * 3.1 + seed), asc = hash(li * 7.7 + seed) > .72 ? 1 : 0;
      pts.push([lerp(x0, x1, u) + 9 * Math.sin(ph), y + 10 * amp * Math.cos(ph) - asc * 14 * Math.pow(Math.max(0, -Math.cos(ph)), 2)]);
    }
    return pts;
  }
  function pageLeft(r, t) {                                   // her drawing of tonight, in pencil with a touch of colour
    sketch(.72, () => {
      moonFace(r.x + 330, r.y + 150, 70, { rot: 1.2 });
      paint(starPts(r.x + 300, r.y + 120, 16, .45, 5), { wash: '#FFE59A', ink: PAL.ink, sw: .6 });
      paperPlane(r.x + 200, r.y + 330, 120, 0, { el: .45, pitch: .1, flutter: 0, doodle: false, riders: P => crew(P, 0, { s: 11, fac: 1, wind: 1, lift: .3, h: { eyes: 'happy', mouth: 'open', aL: .3 }, m: { eyes: 'happy' } }) });
      candyCloud(r.x + 120, r.y + 520, .55, { seed: 4 });
      candyCloud(r.x + 340, r.y + 555, .45, { seed: 6 });
      for (let i = 0; i < 5; i++) paint(heartPts(r.x + 60 + i * 80, r.y + 450 + Math.sin(i) * 16, 8), { ink: PAL.rose, sw: .5 });
    });
  }
  function pageRight(r, t, withNew = true) {                // her handwriting, and the new glowing line
    for (let row = 0; row < 7; row++) inkLine(scribble(r.x + 40, r.x + r.w - 40 - (row === 6 ? 120 : hash(row) * 60), r.y + 60 + row * 62, row * 3.7), .9, '#6E7896', 'pencil', .4, .85);
    if (!withNew) return;
    const k = seg(t, WR0, WR1), pts = cursive(r.x + 40, r.x + r.w - 50, LINE_Y, 9.1, k);
    const lit = seg(t, WR1, WR1 + .3);
    if (pts.length > 1) {
      glow(lerp(r.x + 40, pts[pts.length - 1][0], .5), LINE_Y, 200 + 140 * lit, '#FFE3A0', .3 + .3 * lit);
      const tipP = pts[pts.length - 1]; if (lit <= 0) glow(tipP[0], tipP[1], 50, '#FFF3C0', .8);
      inkLine(pts, 3.0, '#E8A030', 'ink', .3, 1);
      inkLine(pts, 1.2, '#FFF6D0', 'fine', .3, .95);
    }
    if (lit > 0) { light(r.x + r.w / 2, LINE_Y, 300, '#FFE3A0', .35 * lit * (1 - .5 * seg(t, WR1 + .3, WR1 + 1.2))); for (let i = 0; i < 6; i++) sparkle(r.x + 60 + i * 70, LINE_Y - 20 + Math.sin(i * 2) * 14, 12, '#FFF3C0', frac(t * .8 + i / 6)); }
  }
  // her hand and sleeve (from the bottom right), holding the pencil with its tip at (x, y)
  function writingHand(x, y, t, o = {}) {
    const hx = x + 34, hy = y + 64, lift = o.lift || 0;
    paint([[hx + 260, hy + 520], [hx + 110, hy + 520], [hx - 10, hy + 60], [hx + 70, hy + 20]], { wash: '#BFD9EE', fill: '#94B7D6', fillOp: 80, tex: .4, ink: PAL.ink, sw: 1.2, curv: .3 });
    for (let i = 0; i < 4; i++) paint(starPts(hx + 60 + hash(i) * 120, hy + 140 + hash(i * 3) * 300, 9, .45, 5), { wash: '#FFF3C4', ink: null });
    paint(ellPts(hx + 30, hy + 40, 58, 40, 18, 0, -.5), { wash: '#FBE3EC', fill: '#F4C8D6', fillOp: 60, ink: PAL.ink, sw: 1 });      // cuff
    pencil(x, y - lift, .75, 2.35, '#F6C85F');
    paint(ellPts(hx, hy - lift * .6, 40, 34, 16, 0, -.4), { wash: '#FCE5D4', ink: PAL.ink, sw: 1.1 });
    paint(ellPts(hx - 22, hy - 20 - lift * .6, 16, 12, 10, 0, -.8), { wash: '#FCE5D4', ink: PAL.ink, sw: .9 });
  }
  // the seal seen from behind (for her close-up)
  function sealBack(x, y, s, o = {}) {
    const sw = clamp(1.3 * s, .5, 2.4);
    push(); translate(x, y); rotate(o.rot || 0); scale(s * (1 + (o.sq || 0) * .4), s * (1 - (o.sq || 0)));
    paint(rrPts(-62, -26, 124, 26, 5), { wash: '#C8324A', fill: '#9E2238', fillOp: 90, tex: .5, ink: PAL.ink, sw });
    paint(rrPts(-58, -170, 116, 146, 14), { wash: '#CFE6D2', fill: '#8FB89A', fillOp: 90, bleed: .05, tex: .7, border: .5, ink: PAL.ink, sw });
    paint(ellPts(0, -186, 40, 30, 18), { wash: '#CFE6D2', fill: '#8FB89A', fillOp: 90, tex: .6, ink: PAL.ink, sw });
    paint(rectPts(-20, -176, 40, 12), { wash: '#8FB89A', ink: null });
    inkLine([[40, -150], [44, -60]], sw * 1.4, '#FFFFFF', 'marker', 0, .45);
    for (const k of [-1, 1]) inkLine([[k * 30, -140], [k * 18, -120], [k * 30, -100]], sw * .6, '#8FB89A', 'fine', .5, .9);      // carved cloud scrolls
    pop();
  }
  function blankPage(t, lt, dur) {
    if (t >= FACE0 && t < FACE1) return blankFace(t);
    const flip = easeInOut(seg(t, FLIP0, FLIP1)), flipping = t >= FLIP0;
    const wide = easeInOut(seg(t, FLIP0 - .05, FLIP0 + .35)), settle = ease(seg(t, FLIP1, FLIP1 + 1.4));
    camBegin(lerp(lerp(1175, 1215, seg(t, D0, WR1)), lerp(1000, 1080, settle), wide), lerp(610, lerp(545, 560, settle), wide), lerp(lerp(1.48, 1.52, seg(t, D0, WR1)), lerp(1.24, 1.34, settle), wide), 0);
    deskTop(t, { lamp: .9, page: (r, sd, tt) => {
      if (sd < 0) { if (flip < .5) pageLeft(r, tt); else { paint(rectPts(r.x, r.y, r.w, r.h), { wash: '#FBF6EC', ink: null }); push(); translate(2 * r.x + r.w, 0); scale(-1, 1); fadeIn(.12, () => pageRight({ ...r }, tt)); pop(); } }
      else if (!flipping) pageRight(r, tt);
      else { // the fresh blank page under the turning one
        paint(rectPts(r.x, r.y, r.w, r.h), { wash: '#FFFDF6', ink: null });
        if (flip >= 1) { const g = seg(tt, FLIP1, FLIP1 + .6); glow(r.x + r.w / 2, r.y + r.h / 2, 320, '#FFF3D0', .35 * g); sparkle(r.x + r.w * .62, r.y + 150, 26, '#FFF3C0', seg(tt, FLIP1 + .1, FLIP1 + 1.1)); }
      }
    }, items: tt => {
      paint(ellPts(1560, 300, 60, 60, 20), { fill: '#E27A92', fillOp: 40, ink: null });
      sodaCan(1640, 360, 1, { drops: .4 }); mug(1690, 600, 1, PAL.rose, .6);
      paperBall(360, 760, 1.2, 6); stickyNote(330, 300, 1.1, '#FFF1A8', -.15, 1);
      // 桃桃 on the desk, watching: cheers when the line glows, alarmed by the seal, cheers again at the fresh page
      const cheer1 = smooth01(tt, WR1, WR1 + .15, SEAL_IN + .2, SEAL_IN + .45), cheer2 = seg(tt, FLIP1 - .1, FLIP1 + .1);
      const alarm = smooth01(tt, SEAL_IN + .3, SEAL_IN + .5, FLIP0, FLIP0 + .2), hopM = Math.max(cheer1, cheer2) * Math.abs(Math.sin((tt - WR1) * Math.PI / BEAT));
      const md = mood(tt, [[D0 - 1, 'sparkle', null, 'smile'], [WR1, 'star', 'heart', 'open'], [SEAL_IN + .35, 'wide', '!?', 'o'], [FLIP0 + .1, 'happy', null, 'grin'], [FLIP1, 'star', 'spark', 'open']]);
      momo(1560, 470, 15, { ...md, dy: -1.2 * hopM, sq: .12 * pulse(tt, 8) * Math.max(cheer1, cheer2), aL: lerp(lerp(-.6, 1.2, Math.max(cheer1, cheer2)), .2, alarm), aR: lerp(lerp(-.6, 1.2, Math.max(cheer1, cheer2)), -.2, alarm), lookX: lerp(-.5, -.1, alarm), lookY: .4, blush: .8, digital: .3 });
    } });
    // the turning page
    if (flipping && flip < 1) {
      const R = { x: 970, y: 225, w: 460, h: 630 }, c = Math.cos(flip * Math.PI), xe = 960 + (R.w + 10) * c, lift = Math.sin(flip * Math.PI);
      const grow = 1 + .09 * lift, y0 = 540 - 315 * grow, y1 = 540 + 315 * grow;
      paint([[960, 225], [xe, y0], [xe + (c > 0 ? 60 : -60) * lift, y1 + 8], [960, 855]], { fill: PAL.ink, fillOp: 50 * lift, bleed: .2, ink: null });
      const quad = [[960, 225], [xe, y0], [xe, y1], [960, 855]];
      paint(quad, { wash: c > 0 ? '#FFFBF2' : '#F4ECDD', fill: '#E6DCCB', fillOp: 60 * lift, tex: .3, ink: PAL.ink, sw: 1 });
      if (c > .08) clipTo(quad, () => { push(); translate(960, 540); scale(c, grow); translate(-960, -540); pageRight(R, t); pop(); });
    }
    // her hand: writing the line, then lifting the page corner and turning it
    const k = seg(t, WR0, WR1), pts = cursive(1010, 1380, LINE_Y, 9.1, Math.max(.02, k)), tip = pts[pts.length - 1];
    let hx = tip[0], hy = tip[1], hl = 0;
    if (t > WR1) { const a = seg(t, WR1, WR1 + .5); hx = lerp(tip[0], 1250, ease(a)); hy = lerp(tip[1], 890, ease(a)); hl = 20 * Math.sin(a * Math.PI); }
    if (flipping) { const c = Math.cos(flip * Math.PI); hx = 960 + 480 * c + 30; hy = lerp(700, 640, Math.sin(flip * Math.PI)); hl = 40 * Math.sin(flip * Math.PI); }
    if (t > FLIP1) { const a = ease(seg(t, FLIP1 + .1, FLIP1 + .8)); hx = lerp(hx, 1180, a); hy = lerp(hy, 470, a); hl = 40 * (1 - a); }
    writingHand(hx, hy, t, { lift: hl });
    // the seal sidles in from the right, hopping, and rears up over the end of the line
    const sIn = seg(t, SEAL_IN, REAR), hop = Math.abs(Math.sin(sIn * 3 * Math.PI)), rear = seg(t, REAR, REAR + .3);
    const sad = t > FLIP0 + .3, droop = seg(t, FLIP0 + .3, FLIP0 + .6);
    if (t > SEAL_IN) {
      const tremble = rear >= 1 && !sad ? Math.sin(t * 40) * 2 : 0;
      const sx = lerp(1900, 1500, easeOut(sIn)) - easeOut(rear) * 110 * (1 - droop) + tremble, sy = lerp(800, 770, sIn) - hop * 60 - easeOut(rear) * 150 * (1 - droop) + droop * 60;
      if (rear > 0 && t < FLIP0 + .1) {                      // where it wants to land: a faint, pulsing 完 at the end of her line
        paint(ellPts(sx - 20, LINE_Y + 40, 70 * (1 - .3 * rear), 20, 16), { fill: PAL.ink, fillOp: 40 * rear, bleed: .3, ink: null });
        sealPrint(1335, LINE_Y + 8, .5, .3 * rear * (.75 + .25 * Math.sin(t * 14)));
      }
      sealStamp(sx, sy, .8, { face: sad ? 'sad' : 'stern', rot: lerp(0, -.42, easeOut(rear)) * (1 - droop) + Math.sin(t * 20) * .03 * (1 - sIn), sq: sIn < 1 ? (1 - hop) * .14 : rear < 1 ? -.1 * Math.sin(rear * Math.PI) : .04 * Math.sin(t * 6) + droop * .18 });
      if (sad && droop >= 1) emote('sweat', sx + 80, sy - 230, 16, seg(t, FLIP0 + .6, FLIP0 + .9));
    }
    camEnd();
  }
  // the close-up: she looks at the seal, smiles and shakes her head
  function blankFace(t) {
    const a = t - FACE0;
    camBegin(960, 690, 1.55 - .06 * a, 0);
    roomReverse(t, { lamp: .9, screen: .4 });
    glow(760, 620, 500, PAL.lamp, .3);
    capeFB(960, 1000, 44, t, { lift: .2, wind: .1, dy: -.65 });
    const shake = seg(a, .2, .75), tilt = Math.sin(shake * Math.PI * 3) * .13 * Math.sin(shake * Math.PI);
    hero(960, 1000, 44, { outfit: 'pajama', sit: true, dy: -.65, ...mood(t, [[FACE0 - 1, 'normal', null, 'o'], [FACE0 + .2, 'happy', null, 'smile']]), lookY: .5, lookX: -.2, tilt, blush: .9, ahoge: 'normal',
      aR: .1 + .25 * Math.sin(a * 16) * shake, aL: -1.1, handR: (sz, sw) => pencil(0, 0, sz / 60, -Math.PI / 2 + .3, '#F6C85F') });
    capeKnot(960, 1000, 44, { lookX: -.2, dy: -.65 });
    light(960, 700, 420, '#FFE3A0', .15);
    deskFront(t, {});
    // the seal in the foreground (from behind), reared up at her … and deflating when she shakes her head
    const defl = seg(a, .45, .75), trem = (1 - defl) * Math.sin(t * 40) * 2.5;
    const sy = 1010 - 60 * Math.sin(Math.min(1, a * 2) * Math.PI / 2) + 40 * defl;
    sealBack(690 + trem, sy, 1.0, { rot: lerp(.2, -.06, defl), sq: lerp(-.05, .12, defl) });
    if (a > .5) emote('sweat', 610, sy - 205, 16, seg(a, .5, .7));
    camEnd();
  }

  chapter('finale', 225.756, 264.5, [[225.756, wakeFly], [230.556, parade], [235.356, paintRoofs], [240.156, windowsGlow],
    [244.956, moon], [249.156, cottonClouds], [253.956, earthLights], [259.356, blankPage]]);
  transition(225.756, 'white', .5);
  transition(253.956, 'dissolve', .6);                     // bouncing on the pink clouds → rising above them over her city
  transition(259.356, 'dissolve', .7);                     // the glowing globe → her desk lamp and the open sketchbook
})();
