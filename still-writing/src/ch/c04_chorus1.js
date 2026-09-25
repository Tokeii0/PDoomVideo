// c04_chorus1: 4 · 副歌一 (67.356–105.756). The first chorus: pink, peach, cream, mint; bigger, bouncier motion.
// Shots: seal (see-saw launch of the 落款 seal) · noTrade (the grey stall) · paintCity (the giant brush) ·
//        momoBorn (桃桃 is born) · crescent (not rounding the moon) · sighPop (the 算了 cloud) · zoomOut (window → Earth) ·
//        myLine (the golden line and 桃桃's seal).
(() => {
  const B = n => beatT(n);                                           // beat 112 = 67.356 … beat 176 = 105.756
  const INKB = '#3A3160';                                            // her writing ink

  // ======================================================================================
  // private helpers
  // ======================================================================================

  // world position of a chibi's hand centre (side 1 = the aR arm, -1 = the aL arm), mirroring chibi()'s transform
  function handAt(x, y, s, o, side = 1) {
    const sq = (o.sq || 0) + (o.take || 0), a = side > 0 ? (o.aR ?? -1.2) : (o.aL ?? -1.2), L = 1.87 * s;
    const lx = side * (.95 * s + L * Math.cos(a)), ly = -3.95 * s - L * Math.sin(a);
    const kx = (o.flip ? -1 : 1) * (o.sx ?? 1) * (1 + sq * .5), ky = (o.sy ?? 1) * (1 - sq), r = o.rot || 0;
    const px = lx * kx, py = ly * ky;
    return [x + px * Math.cos(r) - py * Math.sin(r), y + ((o.dy || 0) + (o.bob || 0)) * s + px * Math.sin(r) + py * Math.cos(r)];
  }
  // world position of a head-local point (head centre = 0,0), mirroring chibi()'s transform
  function headAt(x, y, s, o, hx, hy) {
    const sq = (o.sq || 0) + (o.take || 0), tl = o.tilt || 0, r = o.rot || 0;
    const kx = (o.flip ? -1 : 1) * (o.sx ?? 1) * (1 + sq * .5), ky = (o.sy ?? 1) * (1 - sq);
    const ax = hx * Math.cos(tl) - (hy - 2.4 * s) * Math.sin(tl), ay = -4.3 * s + hx * Math.sin(tl) + (hy - 2.4 * s) * Math.cos(tl);
    const px = ax * kx, py = ay * ky;
    return [x + px * Math.cos(r) - py * Math.sin(r), y + ((o.dy || 0) + (o.bob || 0)) * s + px * Math.sin(r) + py * Math.cos(r)];
  }
  // a hand drawn again on top of something it holds
  const handOver = (x, y, s) => paint(ellPts(x, y, .37 * s, .35 * s, 12), { wash: SKIN, ink: PAL.ink, sw: clamp(s / 19, .32, 2.3) * .6 });

  // Cursive "handwriting": loops along a baseline, words separated by pen lifts. Returns the pen-down strokes for the
  // stretch [xFrom, xTo] of an endless line starting at x0, and the pen tip at xTo.
  function scrawl(x0, xFrom, xTo, y, o = {}) {
    const a = o.a || 10, b0 = o.b || 15, h = o.h ?? .6, per = o.per || 5, gap = o.gap ?? .2, sd = o.seed || 0, sl = o.slant ?? .38;
    const Wd = per * TAU, u0 = Math.max(0, (xFrom - x0) / a), u1 = Math.max(u0, (xTo - x0) / a), st = TAU / 12;
    const bOf = u => b0 * (.55 + .45 * (Math.sin(u * .55 + sd) * .6 + Math.sin(u * 1.37 + sd * 2) * .4 + 1));
    const P = u => { const b = bOf(u), yy = b * h * (1 + .25 * Math.sin(u * .37 + sd)) * (1 + Math.cos(u)); return [x0 + a * u - b * Math.sin(u) + yy * sl, y - yy + Math.sin(u * .11 + sd) * 3]; };
    const down = u => { const w = Math.floor(u / Wd); return (u - w * Wd) / Wd < 1 - gap * (.7 + .6 * hash(sd + w * 3.7)); };
    const strokes = []; let cur = null;
    for (let u = Math.ceil(u0 / st) * st; u <= u1 + 1e-6; u += st) {
      if (down(u)) { if (!cur) { cur = []; strokes.push(cur); } cur.push(P(u)); } else cur = null;
    }
    if (down(u1) && cur) cur.push(P(u1));
    return { strokes: strokes.filter(s => s.length > 1), tip: P(u1), down: down(u1) };
  }
  // drifting petals (screen space): n petals, seed, colours; a = opacity; big = foreground size
  function petals(t, n, seed, cols, o = {}) {
    const a = o.a ?? .85, sz = o.size || 1, vx = o.vx ?? 60, vy = o.vy ?? 45;
    for (let i = 0; i < n; i++) {
      const k = seed * 31 + i, x = ((hash(k) * (W + 300) + t * vx * (.6 + .6 * hash(k + 1)) + Math.sin(t * 1.3 + i) * 30) % (W + 300)) - 150;
      const y = ((hash(k + 2) * (H + 200) + t * vy * (.7 + .6 * hash(k + 3))) % (H + 200)) - 100, r = (7 + 6 * hash(k + 4)) * sz;
      push(); translate(x, y); rotate(t * (1 + hash(k + 5) * 2) + i); scale(1, .45 + .55 * Math.abs(Math.cos(t * 2.2 + i)));
      paint([[0, -r], [r * .7, -r * .2], [r * .45, r * .8], [0, r * .55], [-r * .45, r * .8], [-r * .7, -r * .2]], { wash: cols[i % cols.length], washOp: 255 * a, ink: null, curv: .6 });
      pop();
    }
  }

  // ---------- the pastel dreamland backdrop (screen space; px = camera x for parallax) ----------
  function dreamSky(t, px, o = {}) {
    paint(rectPts(-40, -40, W + 80, H + 80), { grad: [o.top || '#EFB3CB', o.bot || '#FFE7CF', Math.PI / 2], ink: null });
    glow(1150 - px * .03, 780, 1150, '#FFF3DA', .8);
    glow(300 - px * .02, 180, 520, '#F8D2E4', .45);
    starField(t, { x: 0, y: 10, w: W, h: 400 }, 24, { seed: 4 });
    const cl = [[140, 250, 1.15, 1], [760, 140, .75, 2], [1350, 285, 1.25, 3], [1980, 175, .9, 4], [2550, 240, 1.05, 5]];
    for (const [x0, y0, sc, sd] of cl) {
      const x = ((x0 - px * .16 + t * 10) % 2800 + 2800) % 2800 - 420;
      cloudPuff(x, y0, sc, '#FFF7F0', { seed: sd, shade: '#F7C9D6', ink: false, op: 225 });
    }
  }
  function hills(px, y0, col, amp, f, par, seed, dark) {
    const pts = [[-80, H + 80]];
    for (let x = -80; x <= W + 80; x += 48) pts.push([x, y0 - amp * (.55 + .3 * Math.sin((x + px * par) * f + seed) + .15 * Math.sin((x + px * par) * f * 2.7 + seed * 3))]);
    pts.push([W + 80, H + 80]);
    paint(pts, { wash: col, fill: dark, fillOp: 60, bleed: .03, tex: .4, border: .3, ink: null, curv: .4 });
  }

  // ---------- small props ----------
  function eraser(x, y, s = 1, rot = 0) {                           // a pink eraser block with a paper sleeve, standing on (x, y)
    push(); translate(x, y); rotate(rot); scale(s);
    paint(rrPts(-52, -46, 104, 46, 9), { wash: '#F6B3C6', fill: '#E88AA6', fillOp: 70, tex: .4, ink: PAL.ink, sw: 1 });
    paint(rectPts(-6, -48, 48, 50), { wash: '#BFE0F0', fill: '#8EC3E6', fillOp: 60, tex: .3, ink: PAL.ink, sw: .8 });
    inkLine([[2, -36], [34, -36]], .5, '#5E88B0', 'fine', 0);
    inkLine([[-44, -38], [-18, -40]], 1.1, '#FFFFFF', 'marker', 0, .6);
    pop();
  }
  // pencil pose from its tip and a point on the shaft (e.g. a hand): returns the rotation for pencil()
  const pencilRot = (tx, ty, hx, hy) => Math.atan2(hx - tx, -(hy - ty));

  // ======================================================================================
  // 1 · 67.356–72.156  我还没写完 别急着替我落款
  // She writes a long line across a paper scroll. The stern seal drops to stamp 完 at the end; she lays her giant pencil
  // over an eraser like a see-saw, the seal slams onto one end, she and the idea star jump onto the other: launch.
  // ======================================================================================
  const S1 = { EX: 1090, SX: 1250, LY: 905, GY: 850, s: 38, PS: 2.8, X0: -900, ES: 1.6 };
  const S1T = { see: B(114.5), hover: B(115), lay0: 69.24, lay1: 69.58, slam: B(116), crouch: B(116.5), jump: B(117), land: B(118), grab0: 71.28, grab1: 71.56 };
  // see-saw: the pencil pivots on the eraser top F; φ > 0 tips the point end down
  const ER_Y = S1.LY - 26, SAW = { F: [S1.EX, S1.LY - 26 - 46 * S1.ES], dT: 180, dH: 234 };
  const PHI_UP = Math.asin(-(ER_Y - SAW.F[1] - 6) / SAW.dH), PHI_DN = Math.asin((ER_Y - SAW.F[1] - 6) / SAW.dT);
  const sawEnds = phi => { const c = Math.cos(phi), s = Math.sin(phi); return { tip: [SAW.F[0] + SAW.dT * c, SAW.F[1] + SAW.dT * s], end: [SAW.F[0] - SAW.dH * c, SAW.F[1] - SAW.dH * s] }; };
  function sawPhi(t) {
    if (t < S1T.slam - .05) return PHI_UP;
    if (t < S1T.land) { const k = seg(t, S1T.slam - .05, S1T.slam + .02), bo = t > S1T.slam ? .07 * Math.exp(-(t - S1T.slam) * 9) * Math.sin((t - S1T.slam) * 40) : 0; return lerp(PHI_UP, PHI_DN, easeIn(k)) - bo; }
    const k = seg(t, S1T.land, S1T.land + .07); return lerp(PHI_DN, PHI_UP, easeIn(k)) + (t > S1T.land + .07 ? .06 * Math.exp(-(t - S1T.land - .07) * 8) * Math.sin((t - S1T.land) * 38) : 0);
  }
  const SCR = { seed: 3, a: 10, b: 17, h: .55, per: 5 };
  // how far her line has been written (the smooth "end" x of the scrawl)
  const LB0 = 560 + (S1T.lay0 - 67.356) * 150, LB1 = 1010;
  function lineEnd1(t) {
    if (t < S1T.lay0) return 560 + (t - 67.356) * 150;
    if (t < S1T.grab1) return LB0;
    return LB1 + (t - S1T.grab1) * 330;
  }
  function seal(t, lt) {
    const { EX, SX, LY, GY, s, PS, X0, ES } = S1, bp = bpOf(t), hit = pulse(t, 5);
    // ---- her position and pose ----
    let hx, hy = GY, hdy = 0, hsq = 0, aR = -.5 + .08 * Math.sin(bp * Math.PI), aL = -.9 + .5 * Math.abs(Math.sin(bp * Math.PI)), walk = null, rot = 0;
    const eW = lineEnd1(t), TIPOFF = 215;
    if (t < S1T.lay0) { hx = eW - TIPOFF; walk = bp / 2; hdy = -Math.abs(Math.sin(bp * Math.PI)) * .45; hsq = .05 * pulse(t, 8); }
    else if (t < S1T.jump) {
      const x1 = LB0 - TIPOFF, thr = seg(t, S1T.lay0, S1T.lay1);
      hx = lerp(x1, 700, easeInOut(thr)); rot = .12 * Math.sin(thr * Math.PI);
      if (t > S1T.hover - .03 && t < S1T.lay0) hsq = -.08;                                    // startle
      hsq += .24 * ease(seg(t, S1T.crouch, S1T.jump - .06)) * (1 - seg(t, S1T.jump - .06, S1T.jump));
      aR = thr > 0 && thr < 1 ? lerp(-.5, .35, Math.sin(thr * Math.PI)) : lerp(-.5, -1.25, seg(t, S1T.lay1, S1T.lay1 + .15));
      aL = lerp(-.9, -1.25, seg(t, S1T.lay1, S1T.lay1 + .15));
      if (t > S1T.crouch) { aR = aL = lerp(-1.25, -.35, seg(t, S1T.crouch, S1T.jump)); }
    } else if (t < S1T.land) {
      const k = seg(t, S1T.jump, S1T.land), e0 = sawEnds(PHI_DN).end;
      hx = lerp(700, e0[0] + 4, k); hy = lerp(GY, e0[1] - 26, k) - 215 * 4 * k * (1 - k);
      hsq = -.16 * Math.sin(k * Math.PI); aR = aL = lerp(.25, .15, k); rot = .1 * Math.sin(k * Math.PI);
    } else {
      const e = sawEnds(sawPhi(t)).end, k = seg(t, S1T.grab0, S1T.grab1);
      hx = lerp(e[0] + 4, eW - TIPOFF, easeInOut(k)); hy = lerp(e[1] - 26, GY, easeInOut(k)) - Math.sin(k * Math.PI) * 70;
      const land = Math.exp(-(t - S1T.land) * 10);
      hsq = .3 * land; aL = lerp(-1.2, .2 + .12 * Math.sin(t * 14), seg(t, S1T.land, S1T.land + .12)); aR = lerp(-1.2, -.25, seg(t, S1T.land, S1T.land + .12));
      if (t > S1T.grab1) { walk = bp / 2; hdy = -Math.abs(Math.sin(bp * Math.PI)) * .5; aL = -.9 + .5 * Math.abs(Math.sin(bp * Math.PI)); aR = -.5 + .08 * Math.sin(bp * Math.PI); hsq = .05 * pulse(t, 8); }
    }
    const md = mood(t, [[67.2, 'happy', null, 'open'], [S1T.hover + .02, 'wide', '!', 'o'], [S1T.lay1 + .05, 'normal', null, 'pout'], [S1T.crouch, 'normal', null, 'pout'], [S1T.land + .04, 'happy', null, 'grin'], [71.7, 'happy', null, 'open']]);
    // ---- camera ----
    const cx = kf(t, [[67.356, 560], [68.7, 820], [69.3, 960], [70.4, 985], [71.2, 1010], [72.2, 1180]], easeInOut) + 6 * Math.sin(t * .9);
    const cy = kf(t, [[67.356, 820], [68.7, 640], [70.2, 620], [70.66, 530], [71.2, 590], [72.2, 640]], easeInOut);
    const z = kf(t, [[67.356, 2.1], [68.7, 1.3], [69.6, 1.26], [70.2, 1.28], [70.66, 1.18], [71.2, 1.24], [72.2, 1.24]], easeInOut) + .012 * hit;
    const [shx, shy] = shakeXY(t, t > S1T.slam && t < S1T.slam + .3 ? 8 * Math.exp(-(t - S1T.slam) * 12) : t > S1T.land && t < S1T.land + .3 ? 10 * Math.exp(-(t - S1T.land) * 10) : 0);
    // ---- backdrop ----
    dreamSky(t, cx);
    hills(cx, 690, '#F1D9EC', 70, .0023, .35, 1.2, '#E2C2E0');
    hills(cx, 760, '#FBE1D6', 50, .004, .6, 3.1, '#F2C4B8');
    petals(t, 16, 1, [PAL.pinkLt, PAL.sakura, '#FFE3C8'], { a: .8 });
    camBegin(cx + shx, cy + shy, z);
    // ---- the paper scroll ----
    const tipNow = scrawl(X0, 0, eW, LY, SCR).tip[0];
    const PE = t < S1T.grab1 ? 1480 : Math.max(1480, tipNow + 330);
    paint([[X0 - 200, 770], [PE, 770], [PE + 14, 976], [X0 - 200, 978]], { wash: PAL.ink, washOp: 34, ink: null });
    paint([[X0 - 200, 762], [PE, 760], [PE, 966], [X0 - 200, 968]], { wash: '#FFFBF3', fill: '#F3E4D2', fillOp: 70, bleed: .02, tex: .4, border: .2, ink: PAL.ink, sw: 1.2 });
    for (const [yy, a] of [[800, .5], [852, .45], [930, .55]]) inkLine([[X0 - 150, yy], [PE - 20, yy - 1]], .55, '#B9D3EA', 'fine', 0, a);
    inkLine([[X0 - 150, 776], [PE - 10, 774]], .6, '#F2A7BE', 'fine', 0, .5);
    // the curled end of the roll
    push(); translate(PE, 0);
    paint([[-22, 754], [40, 746], [56, 764], [56, 966], [40, 980], [-22, 974]], { wash: '#FFF8EC', fill: '#E9D6BE', fillOp: 90, tex: .4, ink: PAL.ink, sw: 1.2, curv: .3 });
    const sp = []; for (let i = 0; i < 18; i++) { const a = i * .7 - t * (t > S1T.grab1 ? 7 : 0), r = 3 + i * 1.5; sp.push([17 + Math.cos(a) * r * .8, 958 + Math.sin(a) * r * .45]); }
    inkLine(sp, .7, PAL.woodDk, 'fine', .4);
    inkLine([[-10, 766], [-10, 966]], .5, '#E6D2B8', 'fine', 0);
    pop();
    // ---- her line ----
    const L1 = scrawl(X0, X0, Math.min(eW, LB0), LY, SCR);
    for (const st of L1.strokes) inkLine(st, 1.6, INKB, 'ink', 0);
    let L2 = null;
    if (t >= S1T.grab1) { L2 = scrawl(X0, LB1, eW, LY, SCR); for (const st of L2.strokes) inkLine(st, 1.6, INKB, 'ink', 0); }
    // ---- the target: a ghost 完 where the seal means to stamp ----
    const ghost = smooth01(t, S1T.see, S1T.hover, S1T.slam - .1, S1T.slam);
    if (ghost > 0) { push(); translate(SX, LY - 12); scale(1, .42); sealPrint(0, 0, 1.15, ghost * .5); pop(); }
    // ---- the eraser (fulcrum) ----
    eraser(EX, ER_Y, ES);
    // ---- the seal ----
    const phi = sawPhi(t), ends = sawEnds(phi), SS = 1.2;
    let sx = SX, sy, srot = 0, sface = 'stern', ssq = 0, sScale = SS;
    const onSaw = () => { const c = Math.cos(phi), sn = Math.sin(phi), d = SAW.dT - 66; return [SAW.F[0] + d * c + sn * 27, SAW.F[1] + d * sn - c * 27]; };
    const HOV = LY - 200;
    if (t < S1T.hover) { const k = easeOut(seg(t, S1T.see, S1T.hover)); sy = lerp(-520, HOV, k); ssq = -.12 * (1 - k); }
    else if (t < S1T.slam - .05) {
      const w = seg(t, S1T.slam - .42, S1T.slam - .05), p0 = onSaw();
      sy = HOV - 10 * Math.sin((t - S1T.hover) * 7) * (1 - w) - 50 * Math.sin(Math.min(1, w / .75) * Math.PI * .5) * (w < .75 ? 1 : 0);
      if (w >= .75) { const q = (w - .75) / .25; sy = lerp(HOV - 50, p0[1], easeIn(q)); sx = lerp(SX, p0[0], q); }
      ssq = w > 0 && w < .75 ? .12 * w : -.12;
    } else if (t < S1T.land) {
      const p = onSaw(); sx = p[0]; sy = p[1]; srot = phi * .9;
      const k = t - S1T.slam; ssq = k > 0 ? .22 * Math.exp(-k * 10) * Math.cos(k * 30) : -.12; sface = t > S1T.crouch + .2 ? 'sad' : 'stern';
    } else {
      const k = t - S1T.land, p0 = onSaw();
      sx = p0[0] + 900 * k; sy = p0[1] - 2100 * k + 950 * k * k; srot = PHI_UP * .9 + k * 12; sface = 'dizzy'; sScale = SS * (1 - .3 * seg(k, 0, .7)); ssq = -.12 * Math.exp(-k * 6);
    }
    if (t > S1T.see && t < S1T.slam) {                                        // its growing shadow on the paper
      const k = seg(sy, -520, LY - 30);
      paint(ellPts(SX, LY - 6, 90 * (.5 + .5 * k), 18 * (.5 + .5 * k), 16), { wash: PAL.ink, washOp: 70 * k, ink: null });
    }
    // ---- the pencil ----
    let ptx, pty, prot;
    const heroO = { dy: hdy, sq: hsq, aR, aL, rot };
    const hand = handAt(hx, hy, s, heroO, 1);
    if (t < S1T.lay0 || t >= S1T.grab1) {
      const tip = t < S1T.lay0 ? L1.tip : L2.tip;
      ptx = tip[0]; pty = tip[1]; prot = pencilRot(ptx, pty, hand[0], hand[1]);
    } else if (t < S1T.lay1 || t >= S1T.grab0) {
      // in transit: from her hand to the see-saw (and back, with a twirl)
      const back = t >= S1T.grab0, k = back ? easeInOut(seg(t, S1T.grab0, S1T.grab1)) : easeInOut(seg(t, S1T.lay0, S1T.lay1));
      const wTip = back ? scrawl(X0, LB1, LB1, LY, SCR).tip : L1.tip, wr = pencilRot(wTip[0], wTip[1], hand[0], hand[1]);
      const sw = sawEnds(PHI_UP), sr = pencilRot(sw.tip[0], sw.tip[1], sw.end[0], sw.end[1]);
      const a = back ? 1 - k : k;
      ptx = lerp(wTip[0], sw.tip[0], a); pty = lerp(wTip[1], sw.tip[1], a) - Math.sin(k * Math.PI) * 150; prot = lerp(wr, sr + (back ? -TAU : 0), a);
    } else { ptx = ends.tip[0]; pty = ends.tip[1]; prot = pencilRot(ends.tip[0], ends.tip[1], ends.end[0], ends.end[1]); }
    // ---- the idea star ----
    let ix, iy, isq = 0, iEyes = 'normal', irot = 0;
    const IS = 32;
    if (t < S1T.hover) { ix = hx + 150 + 16 * Math.sin(t * 2.1); iy = GY - 430 - 30 * Math.abs(Math.sin(bp * Math.PI)); iEyes = 'happy'; }
    else if (t < S1T.jump) { const k = seg(t, S1T.hover, S1T.hover + .3); ix = lerp(hx + 150, hx - 90, easeOut(k)) + 5 * Math.sin(t * 50) * (1 - seg(t, S1T.hover + .2, S1T.hover + .5)); iy = GY - 380 + 40 * seg(t, S1T.crouch, S1T.jump); isq = .22 * seg(t, S1T.crouch, S1T.jump); }
    else if (t < S1T.land) { const k = seg(t, S1T.jump, S1T.land); ix = hx - lerp(90, 150, k); iy = hy - 430 + 40 * Math.sin(k * Math.PI); isq = -.15; irot = k * TAU; }
    else if (t < S1T.grab1) { const k = t - S1T.land; ix = sawEnds(PHI_UP).end[0] + 190 + k * 80; iy = LY - 90 - 330 * Math.sin(Math.min(1, k / .9) * Math.PI); irot = k * 9; iEyes = 'happy'; isq = .25 * Math.exp(-k * 8); }
    else { const k = seg(t, S1T.grab1, S1T.grab1 + .45); ix = lerp(sawEnds(PHI_UP).end[0] + 260, hx + 150, k) + 16 * Math.sin(t * 2.1); iy = lerp(LY - 100, GY - 430, easeOut(k)) - 30 * Math.abs(Math.sin(bp * Math.PI)); iEyes = 'happy'; }
    // ---- draw ----
    const drawPencil = () => pencil(ptx, pty, PS, prot);
    if (t >= S1T.lay0 && t < S1T.grab0) drawPencil();
    if (t < S1T.land + 1.2) sealStamp(sx, sy, sScale, { face: sface, rot: srot, sq: ssq });
    if (t < S1T.lay0 || t >= S1T.grab0) drawPencil();                       // carried: behind her, her hand over it
    if (t < S1T.lay0 || t >= S1T.grab1) { const [tx, ty] = [ptx, pty]; glow(tx, ty, 40, '#FFF1C2', .6); }
    const starFront = t > S1T.jump && t < S1T.grab1;
    if (!starFront) idea(ix, iy, IS, { eyes: iEyes, sq: isq, rot: irot });
    light(hx, hy - 5 * s, 330, '#FFE9D6', .25);
    hero(hx, hy, s, { outfit: 'home', ...md, ...heroO, walk, brows: t > S1T.crouch && t < S1T.land ? 'angry' : null, lookX: t < S1T.hover ? .45 : t < S1T.land ? .7 : .45, lookY: t > S1T.hover && t < S1T.lay1 ? -.5 : 0, blush: .7,
      ahoge: t > S1T.hover && t < S1T.slam ? 'question' : 'perk', noShadow: t > S1T.jump && t < S1T.grab1 });
    if (starFront) idea(ix, iy, IS, { eyes: iEyes, sq: isq, rot: irot });
    // dust puffs on the slam and on her landing
    for (const [T0, px0, py0] of [[S1T.slam, onSaw()[0], LY], [S1T.land, sawEnds(PHI_UP).end[0], LY - 20]]) {
      const k = (t - T0) / .45; if (k < 0 || k > 1) continue;
      for (const sd of [-1, 1]) paint(ellPts(px0 + sd * (60 + 90 * k), py0 - 10 - 26 * k, 26 * (1 - k * .5), 17 * (1 - k * .5), 10), { wash: '#FFF6EC', washOp: 230 * (1 - k), ink: PAL.ink, sw: .6 });
    }
    // the launch: speed lines after the seal, then a twinkle where it vanishes
    if (t > S1T.land && t < S1T.land + .45) {
      const k = (t - S1T.land) / .45;
      for (let i = 0; i < 4; i++) { const ox = sx - 70 - i * 30, oy = sy - 60 + i * 42; inkLine([[ox, oy], [ox - 170 * (1 - k), oy + 390 * (1 - k)]], 1.2, PAL.ink, 'ink', 0, 1 - k); }
    }
    camEnd();
    petals(t + 3, 6, 2, [PAL.pink, PAL.pinkLt], { a: .7, size: 2.2, vx: 110, vy: 70 });
    const tw = seg(t, 71.5, 71.95);
    if (tw > 0 && tw < 1) { sparkle(1690, 90, 70, '#FFF3C0', tw); sparkle(1740, 60, 26, '#FFFFFF', seg(t, 71.6, 71.9)); }
  }

  // ======================================================================================
  // 2 · 72.156–76.956  还有些喜欢 不愿拿去交换
  // A grey market stall. A blank-faced grey man slides a trophy, a stack of coins and a crown across the counter for the
  // glowing jar in her arms (the idea star and little drawings inside). She hugs it, shakes her head, walks away glowing.
  // ======================================================================================
  const S2 = { HX: 700, GY: 885, s: 36, MX: 1575, MY: 800, ms: 31, CT: 686 };
  const S2T = { i1: B(120.5), i2: B(121.5), i3: B(122.5), ask: B(123), hug: B(123.6), shake: B(124), turn: B(125) };
  const GOLD = '#F2C14E', GOLD_DK = '#C98A1E', GOLD_LT = '#FFE89A';
  function glint(x, y, r, k) { if (k > 0 && k < 1) sparkle(x, y, r, '#FFFBE8', k); }
  function trophy(x, y, sc) {                                       // standing on (x, y)
    push(); translate(x, y); scale(sc);
    paint(rrPts(-46, -26, 92, 26, 4), { wash: '#6B5A4A', ink: PAL.ink, sw: 1 });
    paint(rrPts(-34, -44, 68, 20, 4), { wash: GOLD_DK, ink: PAL.ink, sw: .9 });
    paint([[-10, -44], [10, -44], [7, -78], [-7, -78]], { wash: GOLD, ink: PAL.ink, sw: .9 });
    for (const sd of [-1, 1]) inkLine([[sd * 44, -150], [sd * 74, -146], [sd * 70, -110], [sd * 36, -100]], 5, GOLD_DK, 'marker', .6);
    paint([[-50, -160], [50, -160], [44, -120], [22, -86], [0, -80], [-22, -86], [-44, -120]], { wash: GOLD, fill: GOLD_DK, fillOp: 60, tex: .3, ink: PAL.ink, sw: 1.1, curv: .35 });
    paint(ellPts(0, -160, 50, 9, 16), { wash: GOLD_LT, ink: PAL.ink, sw: .9 });
    paint(starPts(0, -122, 16, .45, 5), { wash: GOLD_LT, ink: PAL.ink, sw: .6 });
    inkLine([[-34, -150], [-26, -104]], 3, '#FFFBE8', 'marker', .4, .7);
    pop();
  }
  function coinStack(x, y, sc) {
    push(); translate(x, y); scale(sc);
    for (let i = 0; i < 7; i++) {
      const yy = -12 - i * 15, dx = Math.sin(i * 1.7) * 5;
      paint(rrPts(dx - 44, yy - 8, 88, 17, 8), { wash: GOLD_DK, ink: PAL.ink, sw: .8 });
      paint(ellPts(dx, yy - 8, 44, 10, 16), { wash: GOLD, ink: PAL.ink, sw: .8 });
    }
    paint(ellPts(3, -122, 30, 6, 12), { ink: GOLD_DK, sw: .7 });
    for (const [cx, cr] of [[66, .2], [-70, -.3]]) { push(); translate(cx, -10); rotate(cr); paint(ellPts(0, 0, 22, 8, 14), { wash: GOLD, ink: PAL.ink, sw: .8 }); pop(); }
    inkLine([[-30, -112], [-30, -30]], 2.4, '#FFFBE8', 'marker', 0, .6);
    pop();
  }
  function crown(x, y, sc) {
    push(); translate(x, y); scale(sc);
    paint([[-62, 0], [62, 0], [70, -64], [40, -30], [0, -84], [-40, -30], [-70, -64]], { wash: GOLD, fill: GOLD_DK, fillOp: 60, tex: .3, ink: PAL.ink, sw: 1.1, curv: .12 });
    paint(rrPts(-62, -20, 124, 20, 5), { wash: GOLD_DK, ink: PAL.ink, sw: .9 });
    for (const [gx, gc] of [[-34, '#E0506A'], [0, '#5FA8E0'], [34, '#E0506A']]) paint(ellPts(gx, -10, 8, 7, 10), { wash: gc, ink: PAL.ink, sw: .5 });
    for (const px of [-70, 0, 70]) paint(ellPts(px, px ? -66 : -88, 8, 8, 10), { wash: GOLD_LT, ink: PAL.ink, sw: .6 });
    inkLine([[-44, -40], [-50, -14]], 2.4, '#FFFBE8', 'marker', 0, .6);
    pop();
  }
  // the glass jar she hugs, in her body-local space (draw hook): the idea star and tiny drawings inside
  function jarLocal(s, sw, t, k, starO = {}) {
    const w = 1.4 * s, top = -4.35 * s, bot = -.95 * s, cy = (top + bot) / 2;
    glow(0, cy, 3.6 * s, '#FFD2B0', .55 * k);
    paint(rrPts(-w, top + .35 * s, 2 * w, bot - top - .35 * s, .55 * s), { wash: '#FFF1E2', washOp: 70, ink: null });
    glow(0, cy + .3 * s, 1.6 * s, '#FFE7C4', .5 * k);
    // little drawings floating inside
    [[-.7, -1.9, .35, 0], [.62, -1.55, -.3, 3], [-.45, -3.35, .2, 1]].forEach(([dx, dy, r, d], i) => {
      push(); translate(dx * s + Math.sin(t * 1.3 + i) * .08 * s, dy * s + Math.sin(t * 1.7 + i * 2) * .1 * s); rotate(r + Math.sin(t * 1.1 + i) * .15); scale(s / 60);
      paint(rectPts(-24, -20, 48, 40, 1), { wash: ['#FFFBF2', PAL.pinkLt, '#FFF1A8'][i], ink: PAL.ink, sw: .5 });
      if (d === 0) paint(heartPts(0, 2, 10), { ink: '#E2557F', sw: .5 });
      else if (d === 3) { paint(ellPts(0, 2, 11, 10, 12), { ink: PAL.ink, sw: .45 }); for (const sd of [-1, 1]) dot(sd * 4, 0, 1.4, PAL.ink); inkLine([[-8, -6], [-5, -14], [-2, -8]], .4, PAL.ink, 'fine', 0); inkLine([[2, -8], [5, -14], [8, -6]], .4, PAL.ink, 'fine', 0); }
      else paint(starPts(0, 2, 12, .45, 5), { ink: PAL.ochre, sw: .5 });
      pop();
    });
    idea(Math.sin(t * 1.6) * .25 * s + (starO.dx || 0) * s, cy - .2 * s + Math.sin(t * 2.3) * .15 * s, .5 * s, { eyes: starO.eyes || 'happy', sq: starO.sq || 0, glowMul: .8 });
    // glass: rim, outline, highlights, cork and a ribbon
    paint(rrPts(-w, top + .35 * s, 2 * w, bot - top - .35 * s, .55 * s), { ink: PAL.ink, sw: sw * .8 });
    paint(ellPts(0, top + .4 * s, w * .92, .22 * s, 18), { wash: '#FFFFFF', washOp: 90, ink: PAL.ink, sw: sw * .6 });
    inkLine([[-w + .3 * s, top + .9 * s], [-w + .28 * s, bot - .7 * s]], sw * 1.6, '#FFFFFF', 'marker', .3, .75);
    inkLine([[w - .35 * s, top + 1.1 * s], [w - .33 * s, top + 1.6 * s]], sw * 1.2, '#FFFFFF', 'marker', 0, .6);
    paint(rrPts(-.75 * s, top - .15 * s, 1.5 * s, .55 * s, .15 * s), { wash: '#D9A877', fill: '#B98A5E', fillOp: 70, tex: .4, ink: PAL.ink, sw: sw * .6 });
    paint([[-.2 * s, top + .15 * s], [-.75 * s, top - .15 * s], [-.7 * s, top + .45 * s]], { wash: PAL.pink, ink: PAL.ink, sw: sw * .45 });
  }
  function marketBack(t) {
    paint(rectPts(-800, -300, 4200, 1300), { grad: ['#A9A8BC', '#D9D5DF', Math.PI / 2], ink: null });
    // far facades
    for (let i = 0; i < 14; i++) {
      const x = -700 + i * 240 + hash(i * 3.3) * 40, w = 200 + hash(i * 5.1) * 60, h = 380 + hash(i * 7.7) * 260;
      paint(rectPts(x, 880 - h, w, h + 20), { wash: mixCol('#9C9AAE', '#8B8AA0', hash(i)), ink: PAL.ink, sw: .6 });
      for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) if (hash(i * 17 + r * 5 + c) > .35) fillRectA(x + 24 + c * (w - 40) / 3, 880 - h + 40 + r * 80, (w - 40) / 3 - 20, 44, '#7E7D92', .8);
    }
    // bunting
    const bun = []; for (let i = 0; i <= 30; i++) { const x = -700 + i * 130; bun.push([x, 170 + Math.sin(i * .55) * 34]); }
    inkLine(bun, .7, PAL.ink, 'fine', .4);
    bun.forEach(([x, y], i) => { if (i % 1 === 0 && i < 30) paint([[x + 12, y + 4], [x + 60, y + 4], [x + 36, y + 58 + Math.sin(t * 2 + i) * 4]], { wash: ['#C7C4D2', '#9E9BB0', '#B7B4C6'][i % 3], ink: PAL.ink, sw: .5 }); });
    // ground: cobbles
    paint([[-800, 870], [3400, 870], [3400, 1400], [-800, 1400]], { wash: '#8F8D9E', ink: PAL.ink, sw: 1 });
    for (let r = 0; r < 4; r++) for (let c = 0; c < 26; c++) {
      const x = -700 + c * 160 + (r % 2) * 80 + hash(r * 40 + c) * 20, y = 900 + r * 44 + r * r * 6;
      paint(ellPts(x, y, 56 + r * 8, 12 + r * 3, 10), { wash: '#A2A0B0', ink: null });
    }
    // background stalls on the left (she walks past them)
    for (const [bx, sd] of [[-120, 1], [330, 2]]) {
      paint(rectPts(bx, 560, 280, 320), { wash: '#8C8A9C', ink: PAL.ink, sw: .8 });
      for (let k = 0; k < 7; k++) paint([[bx - 20 + k * 46, 470], [bx + 26 + k * 46, 470], [bx + 26 + k * 46, 540], [bx + 3 + k * 46, 558], [bx - 20 + k * 46, 540]], { wash: k % 2 ? '#B8B5C5' : '#EAE7EE', ink: PAL.ink, sw: .6 });
      for (let k = 0; k < 3; k++) paint(rectPts(bx + 20 + k * 86, 640, 70, 60), { wash: '#A6A3B4', ink: PAL.ink, sw: .6 });
      inkLine([[bx - 10, 470], [bx - 10, 880]], 2.5, '#6E6C80', 'marker', 0);
      inkLine([[bx + 290, 470], [bx + 290, 880]], 2.5, '#6E6C80', 'marker', 0);
    }
  }
  function marketStall(t) {
    const x0 = 1060, x1 = 1830;
    inkLine([[x0 + 30, 300], [x0 + 30, 885]], 5, '#6E6C80', 'marker', 0); inkLine([[x1 - 30, 300], [x1 - 30, 885]], 5, '#6E6C80', 'marker', 0);
    // back shelves with more of his wares
    paint(rectPts(x0 + 60, 400, x1 - x0 - 120, 290), { wash: '#7F7D90', ink: PAL.ink, sw: .8 });
    for (let r = 0; r < 2; r++) { inkLine([[x0 + 60, 490 + r * 100], [x1 - 60, 490 + r * 100]], 2, '#5E5C70', 'marker', 0); for (let k = 0; k < 8; k++) if (hash(r * 9 + k) > .3) paint(rectPts(x0 + 90 + k * 82, 440 + r * 100, 50, 50, 1), { wash: '#A4A1B2', ink: PAL.ink, sw: .5 }); }
    // striped awning with a scalloped edge
    const n = 9, sw = (x1 - x0 + 60) / n;
    for (let k = 0; k < n; k++) {
      const a = x0 - 30 + k * sw, b = a + sw;
      paint([[a, 250], [b, 250], [b, 360], [(a + b) / 2, 388], [a, 360]], { wash: k % 2 ? '#B3B0C2' : '#ECE9F0', ink: PAL.ink, sw: .8, curv: .1 });
    }
    paint(rectPts(x0 - 40, 236, x1 - x0 + 80, 20), { wash: '#6E6C80', ink: PAL.ink, sw: .8 });
    // sign with a coin drawn on it
    paint(rectPts(1330, 150, 250, 86, 1), { wash: '#C9C6D4', ink: PAL.ink, sw: 1 });
    paint(ellPts(1455, 193, 28, 28, 16), { wash: '#B0ADBE', ink: PAL.ink, sw: .8 }); paint(ellPts(1455, 193, 18, 18, 14), { ink: PAL.ink, sw: .5 });
    inkLine([[1370, 150], [1370, 118]], .8, PAL.ink, 'fine', 0); inkLine([[1540, 150], [1540, 118]], .8, PAL.ink, 'fine', 0);
  }
  function counterFront() {
    const x0 = 1060, x1 = 1830, y0 = S2.CT;
    paint(rectPts(x0, y0 + 14, x1 - x0, 885 - y0 - 10), { wash: '#8A8298', ink: PAL.ink, sw: 1 });
    for (let k = 1; k < 9; k++) inkLine([[x0 + k * (x1 - x0) / 9, y0 + 20], [x0 + k * (x1 - x0) / 9, 880]], .6, '#6E6880', 'fine', 0);
    paint(rrPts(x0 - 24, y0 - 4, x1 - x0 + 48, 24, 5), { wash: '#A39CB0', ink: PAL.ink, sw: 1.1 });
  }
  // the offer: a speech bubble with a coin ⇄ her jar
  function offerBubble(x, y, k) {
    if (k <= .01) return;
    push(); translate(x, y); scale(backOut(k));
    paint([[40, 58], [96, 118], [70, 52]], { wash: '#FFFDF8', ink: PAL.ink, sw: 1 });
    paint(rrPts(-150, -70, 300, 136, 60), { wash: '#FFFDF8', ink: PAL.ink, sw: 1.2 });
    paint([[46, 60], [70, 52], [78, 64]], { wash: '#FFFDF8', ink: null });
    paint(ellPts(-88, -2, 36, 36, 18), { wash: GOLD, ink: PAL.ink, sw: .9 }); paint(ellPts(-88, -2, 24, 24, 14), { ink: GOLD_DK, sw: .7 });
    for (const [yy, d] of [[-16, 1], [14, -1]]) {
      inkLine([[-34 * d, yy], [34 * d, yy]], 1.1, PAL.ink, 'ink', 0);
      inkLine([[34 * d - 12 * d, yy - 10], [34 * d, yy], [34 * d - 12 * d, yy + 10]], 1.1, PAL.ink, 'ink', 0);
    }
    glow(88, 0, 60, '#FFD2B0', .6);
    paint(rrPts(62, -30, 52, 62, 12), { wash: '#FFF1E2', washOp: 160, ink: PAL.ink, sw: .8 });
    paint(rrPts(72, -40, 32, 12, 3), { wash: '#D9A877', ink: PAL.ink, sw: .6 });
    paint(starPts(88, 2, 13, .5, 5), { wash: '#FFE8A3', ink: PAL.ink, sw: .5 });
    pop();
  }
  function footFlower(x, y, r, col, k) {
    if (k <= 0) return;
    const p = backOut(k);
    glow(x, y, r * 3, col, .35 * p);
    for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + x; paint(ellPts(x + Math.cos(a) * r * .7 * p, y + Math.sin(a) * r * .35 * p, r * .55 * p, r * .3 * p, 10), { wash: col, ink: PAL.ink, sw: .45 }); }
    paint(ellPts(x, y, r * .3 * p, r * .18 * p, 8), { wash: '#FFE08A', ink: null });
  }
  function noTrade(t, lt) {
    const { HX, GY, s, MX, MY, ms, CT } = S2, bp = bpOf(t);
    // ---- her ----
    const walkK = seg(t, S2T.turn + .1, S2T.turn + .35), hxw = t > S2T.turn + .1 ? HX - (t - S2T.turn - .1) * 260 : HX;
    const hugK = ease(seg(t, S2T.hug, S2T.hug + .25));
    const md = mood(t, [[72.0, 'normal', null, 'smile'], [S2T.i1 + .1, 'look', null, 'o'], [S2T.ask + .15, 'normal', null, 'flat'], [S2T.hug, 'happy', 'heart', 'smile'], [S2T.turn + .2, 'happy', null, 'open']]);
    const shake = t > S2T.shake && t < S2T.turn ? Math.sin((t - S2T.shake) * TAU * 3.33) * .2 * (1 - seg(t, S2T.turn - .15, S2T.turn)) : 0;
    const flip = t > S2T.turn + .05;
    const walking = t > S2T.turn + .1;
    const heroO = { outfit: 'home', ...md, blush: lerp(.5, 1, hugK), tilt: shake + (walking ? .04 * Math.sin(bp * Math.PI) : 0), flip,
      aL: lerp(-1.5, -1.8, hugK), aR: lerp(-1.5, -1.8, hugK), sq: .1 * hugK * (1 - seg(t, S2T.hug + .3, S2T.hug + .6)) + (walking ? .03 * pulse(t, 8) : 0),
      walk: walking ? bp / 2 : null, dy: walking ? -Math.abs(Math.sin(bp * Math.PI)) * .3 : -Math.abs(Math.sin(bp * Math.PI)) * .08,
      lookX: flip ? .85 : t < S2T.i1 ? .2 : t < S2T.hug ? .85 : .2, lookY: t > S2T.i1 && t < S2T.hug ? .15 : 0, ahoge: t > S2T.ask && t < S2T.hug ? 'question' : 'normal' };
    const glowK = .75 + .25 * pulse(t, 4) + .5 * hugK * (1 - seg(t, S2T.hug + .4, S2T.shake + .5));
    const starEyes = t > S2T.ask && t < S2T.hug + .1 ? 'normal' : 'happy';
    // ---- camera ----
    const cx = kf(t, [[72.156, 1080], [74.4, 960], [S2T.turn, 940], [76.956, 890]], easeInOut);
    const cy = kf(t, [[72.156, 560], [74.4, 600], [76.956, 590]], easeInOut);
    const z = kf(t, [[72.156, 1.08], [74.4, 1.2], [S2T.turn, 1.22], [76.956, 1.12]], easeInOut) + .01 * pulse(t, 5);
    camBegin(cx, cy, z);
    marketBack(t);
    // two grey passers-by far back
    for (const [px0, v, sd] of [[2100, -70, 3], [-300, 60, 5]]) { const px = px0 + v * (t - 72.156); person(px, 870, 15, { suit: true, seed: sd, walk: t * 1.6 + sd, flip: v < 0, eyes: 'dot', mouth: 'flat', noShadow: true }); }
    marketStall(t);
    // ---- the grey man behind the counter ----
    const push1 = [S2T.i1, S2T.i2, S2T.i3].reduce((a, T0) => Math.max(a, smooth01(t, T0 - .15, T0, T0 + .15, T0 + .35)), 0);
    const ask = smooth01(t, S2T.ask - .1, S2T.ask + .15, S2T.turn + .3, S2T.turn + .8);
    person(MX, MY, ms, { suit: true, seed: 11, style: 'short', hair: '#55535F', top: '#5D6174', tie: '#7C7F92', eyes: 'dot', mouth: 'flat',
      aL: lerp(lerp(-1.1, .05, push1), .12, ask), aR: -1.1, rot: -.06 * push1, lookX: -.6, lookY: t > S2T.turn + .5 ? .5 : 0, noShadow: true,
      emote: t > 76.0 ? '…' : null, emoteK: seg(t, 76.0, 76.3) });
    counterFront();
    // ---- the world goes grey ----
    grade(.88, 'saturation', '#808080');
    grade(.18, 'color', '#6E7AA8');
    // ---- the gold offers slide in (drawn after the grade: they keep their cold shine) ----
    const slide = (T0, x1) => { const k = easeOut(seg(t, T0 - .12, T0 + .2)); return [lerp(MX - 80, x1, k), t > T0 + .2 ? .12 * Math.exp(-(t - T0 - .2) * 12) * Math.cos((t - T0 - .2) * 40) : 0]; };
    if (t > S2T.i1 - .12) { const [x, q] = slide(S2T.i1, 1370); push(); translate(x, CT); scale(1 + q, 1 - q); trophy(0, 0, 1.05); pop(); glint(x - 30, CT - 150, 34, seg(t, S2T.i1 + .15, S2T.i1 + .6)); }
    if (t > S2T.i2 - .12) { const [x, q] = slide(S2T.i2, 1245); push(); translate(x, CT); scale(1 + q, 1 - q); coinStack(0, 0, 1); pop(); glint(x + 25, CT - 110, 30, seg(t, S2T.i2 + .15, S2T.i2 + .6)); }
    if (t > S2T.i3 - .12) { const [x, q] = slide(S2T.i3, 1130); push(); translate(x, CT); scale(1 + q, 1 - q); crown(0, 0, .95); pop(); glint(x - 40, CT - 80, 30, seg(t, S2T.i3 + .15, S2T.i3 + .6)); }
    for (const T0 of [S2T.i1, S2T.i2, S2T.i3]) { const k = (t - T0 + .12) / .4; if (k > 0 && k < 1) for (let i = 0; i < 3; i++) inkLine([[MX - 120 - 40 * i + 300 * k, CT - 30 - i * 30], [MX - 20 - 40 * i + 300 * k - 120 * (1 - k), CT - 30 - i * 30]], .9, PAL.cream, 'ink', 0, 1 - k); }
    offerBubble(MX - 150, MY - 430, seg(t, S2T.ask, S2T.ask + .25) * (1 - seg(t, S2T.shake + .15, S2T.shake + .4)));
    // warm little flowers bloom in her footsteps
    for (let n = 0; n < 4; n++) {
      const T0 = S2T.turn + .35 + n * .3; if (t < T0) break;
      const fx = HX - (T0 - S2T.turn - .1) * 260 + 20 * (n % 2 ? 1 : -1), col = ['#F7A8C0', '#FFC9A0', '#FFE3A0', '#A8E0C8'][n % 4];
      footFlower(fx, GY + 10 + (n % 2) * 8, 30, col, seg(t, T0, T0 + .25));
    }
    // ---- warm light from the jar, pooled on the grey cobbles around her ----
    const jx = hxw, jy = GY - 2.6 * s;
    light(jx, jy, 480 * (1 + .1 * glowK), '#FFB98F', .42 * glowK, 'screen');
    paint(ellPts(jx, GY + 12, 250, 40, 20), { wash: '#FFD7B0', washOp: 80 * glowK, ink: null });
    hero(hxw, GY, s, { ...heroO, draw: (s2, sw) => { jarLocal(s2, sw, t, glowK, { eyes: starEyes, dx: t > S2T.ask && t < S2T.hug ? .35 : 0 }); for (const sd of [-1, 1]) { const a = lerp(-1.5, -1.8, hugK), hx2 = sd * (.95 * s2 + 1.87 * s2 * Math.cos(a)), hy2 = -3.95 * s2 - 1.87 * s2 * Math.sin(a); paint(ellPts(hx2, hy2, .37 * s2, .35 * s2, 12), { wash: SKIN, ink: PAL.ink, sw: sw * .6 }); } } });
    light(jx, jy, 200, '#FFE3C0', .35 * glowK, 'screen');
    petals(t, 8, 4, ['#FFD2B8', PAL.pinkLt], { a: .7 * seg(t, S2T.turn, S2T.turn + .6), vx: -40, vy: 30 });
    camEnd();
  }

  // ======================================================================================
  // 3 · 76.956–81.756  给冷冰冰的日子 画一点柔软
  // A cold grey rainy street (nightCity). She runs through with a brush bigger than herself; every beat one big swing
  // paints the next stretch pastel: warm windows, flowers, lamps, blushing buildings. The camera tracks with her.
  // ======================================================================================
  const S3 = { GY: 862, FY: 895, s: 30, X0: -700, X1: 4200, V: 450, STOP: B(135) };
  const xh3 = t => { const a = 250 + S3.V * (Math.min(t, S3.STOP) - 76.956); return t < S3.STOP ? a : a + S3.V * .45 * (1 - Math.pow(1 - seg(t, S3.STOP, S3.STOP + .45), 2)); };
  const P0 = xh3(B(129)) - 150, FLEAD = 210;
  function frontier3(t) {
    const bp = bpOf(t), n = Math.floor(bp + 1e-9);
    if (n < 129) return P0;
    const k = easeOut(clamp((bp - n) / .42)), a = n === 129 ? P0 : xh3(B(n)) + FLEAD, b = xh3(B(n + 1)) + FLEAD + (n >= 135 ? 380 : 0);
    return n > 135 ? xh3(B(136)) + FLEAD + 380 : lerp(a, b, k);
  }
  // nightCity's front row (layer 2), replicated so blushes, flowers and lamps can sit on the right buildings
  function cityFront(x0, x1) {
    const out = []; let x = x0 - 40 + hash(2 * 13) * 60, i = 0;
    while (x < x1) { const bw = 170 * (.6 + hash(200 + i * 3.1) * .7), bh = 180 + hash(100 + i * 7.3) * 420; out.push({ x, w: bw, h: bh, i }); x += bw + 6 + hash(60 + i) * 30; i++; }
    return out;
  }
  const FRONT3 = cityFront(S3.X0, S3.X1);
  const bloomT = x => { for (let tt = 77.4; tt < 82.2; tt += .01) if (frontier3(tt) >= x) return tt; return 99; };
  FRONT3.forEach(b => { b.T = bloomT(b.x + b.w / 2); });
  function buildingFace(cx, cy, w, k, t, i) {
    if (k <= .01) return;
    const p = backOut(k), ex = w * .2, r = w * .09, bob = Math.sin(t * 3 + i) * 2;
    push(); translate(cx, cy + bob); scale(p);
    for (const sd of [-1, 1]) paint(ellPts(sd * ex * 1.55, r * 1.3, r * 1.5, r * .8, 14), { wash: '#F58CA8', washOp: 190, ink: null });
    for (const sd of [-1, 1]) inkLine([[sd * ex - r, r * .3], [sd * ex, -r * .5], [sd * ex + r, r * .3]], clamp(w / 90, .8, 1.8), PAL.ink, 'ink', .5);
    inkLine([[-r * .7, r * 1.4], [0, r * 2.1], [r * .7, r * 1.4]], clamp(w / 110, .7, 1.5), PAL.ink, 'ink', .5);
    pop();
  }
  function flowerAt(x, y, r, col, k, rot = 0) {                     // cheap: dots with a darker rim
    if (k <= .01) return; const p = backOut(k), rr = r * p, dk = mixCol(col, PAL.ink, .45);
    for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + rot; dot(x + Math.cos(a) * rr * .62, y + Math.sin(a) * rr * .62, rr * .56, dk, .9); }
    for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + rot; dot(x + Math.cos(a) * rr * .62, y + Math.sin(a) * rr * .62, rr * .46, col); }
    dot(x, y, rr * .34, '#E8B04A'); dot(x, y, rr * .26, '#FFE08A');
  }
  function lampPost(x, gy, lit, t, i) {
    inkLine([[x, gy + 8], [x, gy - 330]], 4.5, lit ? '#5E4A6E' : '#3A3F5E', 'marker', 0);
    inkLine([[x, gy - 330], [x + 18, gy - 352], [x + 44, gy - 350]], 3.5, lit ? '#5E4A6E' : '#3A3F5E', 'marker', .5);
    const hx = x + 46, hy = gy - 338;
    if (lit) { glow(hx, hy + 20, 190, '#FFD59A', .55 + .1 * Math.sin(t * 5 + i)); paint([[hx - 30, hy + 20], [hx + 30, hy + 20], [hx + 110, gy + 5], [hx - 110, gy + 5]], { fill: '#FFE2A8', fillOp: 45, bleed: .1, tex: .2, border: 0, ink: null }); }
    paint([[hx - 20, hy - 10], [hx + 20, hy - 10], [hx + 28, hy + 22], [hx - 28, hy + 22]], { wash: lit ? '#FFE9B0' : '#6B7090', ink: PAL.ink, sw: .8 });
    if (lit) { inkLine([[x - 170, gy - 300], [x - 85, gy - 262], [x, gy - 300]], .6, PAL.ink, 'fine', .5); [[-150, .2], [-120, .45], [-85, .6], [-50, .45], [-20, .2]].forEach(([dx, q], j) => { const yy = gy - 300 + 38 * Math.sin(q * Math.PI); glow(x + dx, yy + 8, 20, ['#FFD98A', '#FFB3C6', '#BFF0E0'][j % 3], .6); dot(x + dx, yy + 8, 6, ['#FFE7A8', '#FFC9D8', '#D6FFF2'][j % 3]); }); }
  }
  // the giant brush: handle from (hx, hy) toward angle th (bristles at the far end)
  function bigBrush(hx, hy, th, sc = 1, wet = 1) {
    push(); translate(hx, hy); rotate(th); scale(sc);
    paint(rrPts(-34, -11, 304, 22, 10), { wash: '#C99A6A', fill: '#9C6B42', fillOp: 60, tex: .4, ink: PAL.ink, sw: 1 });
    paint(ellPts(-34, 0, 14, 14, 12), { wash: '#E2557F', ink: PAL.ink, sw: .8 });
    paint(rrPts(262, -19, 44, 38, 6), { wash: '#D8DCE6', fill: '#9EA6BA', fillOp: 60, tex: .3, ink: PAL.ink, sw: .9 });
    const br = [[300, -24], [360, -34], [430, -22], [470, 0], [430, 22], [360, 34], [300, 24]];
    paint(br, { wash: '#F7E6D0', ink: PAL.ink, sw: 1, curv: .5 });
    paint([[352, -32], [410, -28], [462, -6], [470, 0], [462, 6], [410, 28], [352, 32], [372, 0]], { wash: '#F58CA8', fill: '#F7B08E', fillOp: 120 * wet, bleed: .08, tex: .4, border: .4, ink: null, curv: .5 });
    for (const yy of [-18, -6, 6, 18]) inkLine([[312, yy], [360 + Math.abs(yy), yy * 1.2]], .5, '#C9A27E', 'fine', 0);
    pop();
  }
  const brushTh = t => { const f = frac(bpOf(t)), n = beatN(t); if (n < 129 || n > 135) return -2.15; return f < .3 ? lerp(-2.15, .3, easeOut(f / .3)) : lerp(.3, -2.15, ease((f - .3) / .7)); };
  function streetWorld(t, warm, cx, zoom) {
    const gy = S3.GY, vx0 = cx - 960 / zoom - 80, vx1 = cx + 960 / zoom + 80;
    // sky
    if (warm) {
      paint(rectPts(vx0, -400, vx1 - vx0, 1400), { grad: ['#F4AFC8', '#FFE2C6', Math.PI / 2], ink: null });
      glow(cx + 300, 560, 900, '#FFF1D8', .6);
      starField(t, { x: vx0, y: -60, w: vx1 - vx0, h: 320 }, 18, { seed: 9 });
    } else {
      paint(rectPts(vx0, -400, vx1 - vx0, 1400), { grad: ['#5D6688', '#9CA3BA', Math.PI / 2], ink: null });
      for (let i = 0; i < 5; i++) { const x = vx0 + ((hash(i * 7) * 3000 - t * 30) % 3000 + 3000) % 3000 - 300; paint(cloudPts(x, 120 + hash(i) * 120, 520, 90, i + 2, 7), { wash: '#7C84A0', washOp: 200, ink: null, curv: .4 }); }
    }
    nightCity(t, { x0: S3.X0, x1: Math.min(S3.X1, vx1 + 200), y: gy, color: warm ? 1 : 0, lit: warm ? .92 : .12 });
    // street and sidewalk
    paint([[vx0, gy], [vx1, gy], [vx1, gy + 700], [vx0, gy + 700]], { wash: warm ? '#F6C9C0' : '#5A607C', ink: null });
    paint([[vx0, gy + 58], [vx1, gy + 58], [vx1, gy + 700], [vx0, gy + 700]], { wash: warm ? '#E9A9B5' : '#474C68', ink: null });
    inkLine([[vx0, gy + 2], [vx1, gy + 2]], 1.1, PAL.ink, 'ink', 0);
    inkLine([[vx0, gy + 58], [vx1, gy + 58]], .9, PAL.ink, 'ink', 0);
    for (let k = Math.floor(vx0 / 180); k < vx1 / 180; k++) inkLine([[k * 180, gy + 6], [k * 180 - 10, gy + 54]], .5, warm ? '#D9A2A8' : '#3E4360', 'fine', 0);
    for (let k = Math.floor(vx0 / 260); k < vx1 / 260; k++) paint(rectPts(k * 260 + 40, gy + 110, 120, 12), { wash: warm ? '#FFF1E6' : '#8A90A8', washOp: 200, ink: null });
    // lamps
    for (let k = Math.floor(vx0 / 560); k <= vx1 / 560; k++) lampPost(k * 560 + 120, gy + 30, warm, t, k);
    if (warm) {
      for (const b of FRONT3) {
        if (b.x + b.w < vx0 || b.x > vx1) continue;
        const k = seg(t, b.T, b.T + .35), cxb = b.x + b.w / 2;
        if (b.w > 125 && b.h > 260) buildingFace(cxb, gy - b.h * .55, b.w, k, t, b.i);
        if (k > .05) for (let j = 0; j < 2; j++) glow(b.x + b.w * (.3 + .4 * hash(b.i * 7 + j)), gy - b.h * (.25 + .5 * hash(b.i * 5 + j)), 60, '#FFE3A8', .35 * k * (.7 + .3 * Math.sin(t * 3 + j + b.i)));
        for (let j = 0; j < 3; j++) flowerAt(b.x + 14 + j * (b.w - 28) / 2, gy - 6 - (j % 2) * 10, 13 + 5 * hash(b.i * 3 + j), [PAL.pink, '#FFD08A', '#FFFFFF', PAL.lilac][(b.i + j) % 4], seg(t, b.T + .08 + j * .06, b.T + .35 + j * .06), j);
        if (b.h > 330) for (let j = 0; j < 2; j++) { const wy = gy - b.h + 80 + j * 132; paint(rectPts(b.x + b.w * .2, wy, b.w * .6, 14), { wash: '#B98A5E', ink: PAL.ink, sw: .5 }); for (let q = 0; q < 3; q++) flowerAt(b.x + b.w * (.28 + q * .22), wy - 4, 9, [PAL.rose, '#FFE3A0', PAL.pinkLt][q], seg(t, b.T + .2 + q * .05, b.T + .45 + q * .05)); }
      }
    }
  }
  function paintCity(t, lt) {
    const bp = bpOf(t), GY = S3.GY, FY = S3.FY, s = S3.s, hx = xh3(t), stopK = seg(t, S3.STOP, S3.STOP + .45);
    const F = frontier3(t);
    const cx = hx + lerp(250, 60, ease(seg(t, S3.STOP - .2, 81.756))), zoom = lerp(1.0, .9, ease(seg(t, S3.STOP - .2, 81.756))) + .01 * pulse(t, 5);
    const cy = lerp(540, 520, ease(seg(t, S3.STOP - .2, 81.756)));
    camBegin(cx, cy, zoom);
    // the cold grey street with rain
    streetWorld(t, false, cx, zoom);
    camEnd();
    grade(.6, 'saturation', '#808080');
    grade(.22, 'screen', '#8C95B4');
    rainStreaks(t, { x: 0, y: 0, w: W, h: H }, 48, '#D5DCF0', .6, { fall: true });
    camBegin(cx, cy, zoom);
    // the painted stretch: a band from where she started to the brush's reach, with ragged bristle edges
    if (F > P0 + 5) {
      const band = [], ed = (y, sd) => 24 * Math.sin(y * .021 + sd) + 14 * Math.sin(y * .057 + sd * 2) + 9 * Math.sin(y * .13 + sd * 3);
      for (let y = -500; y <= 1600; y += 40) band.push([F + ed(y, 1) + (y - 540) * -.08, y]);
      for (let y = 1600; y >= -500; y -= 40) band.push([P0 + ed(y, 4) + (y - 540) * .05, y]);
      clipTo(band, () => {
        streetWorld(t, true, cx, zoom);
        camEnd(); petals(t, 14, 3, [PAL.pinkLt, '#FFE3C8', '#FFFFFF', PAL.sakura], { a: .85, vx: 40, vy: 40 }); camBegin(cx, cy, zoom);
      });
      // wet rims
      inkLine(band.slice(0, 53).map(([x, y]) => [x - 6, y]), 3, '#F58CA8', 'dry', .3, .8);
      inkLine(band.slice(53).map(([x, y]) => [x + 6, y]), 2.4, '#F7B08E', 'dry', .3, .7);
      // dry-brush streaks trail off the fresh edge after each stroke
      const n0 = beatN(t), age = (bp - n0) * BEAT;
      if (n0 >= 129 && n0 <= 135) for (let i = 0; i < 9; i++) {
        const y = 120 + i * 90 + 20 * hash(n0 * 5 + i), L = (60 + 120 * hash(n0 * 3 + i)) * (1 - seg(age, .15, .6)), x0 = F + 24 * Math.sin(y * .021 + 1) + (y - 540) * -.08;
        if (L > 4) inkLine([[x0 - 10, y], [x0 + L, y + 6 * Math.sin(i)]], 1.6 + hash(i), ['#F58CA8', '#F7B08E', '#FFD08A'][i % 3], 'dry', .2, .85);
      }
      // the fresh edge shimmers
      for (let i = 0; i < 7; i++) { const y = 80 + i * 130 + 30 * Math.sin(t * 3 + i); sparkle(F + 24 * Math.sin(y * .021 + 1) + (y - 540) * -.08 + 10, y, 16, '#FFF3C0', frac(t * 1.7 + i * .37)); }
    }
    // ---- her, the brush, the idea star ----
    const run = t < S3.STOP + .3, m = move('run', t);
    const th = brushTh(t), sw = frac(bp) < .3 && beatN(t) >= 129 && beatN(t) <= 135;
    const aR = th < -1.4 ? .35 : lerp(.35, -.15, clamp((th + 1.4) / 1.7));
    const md = mood(t, [[76.9, 'happy', null, 'grin'], [77.5, 'sparkle', null, 'open'], [S3.STOP + .2, 'happy', null, 'smile']]);
    const heroO = { outfit: 'home', ...md, run: run ? t * 2.6 : null, dy: run ? m.dy * .9 - .15 : -.05 * pulse(t, 6), rot: run ? -.05 : 0, aL: run ? m.aL : -.6, aR, sq: run ? 0 : .06 * Math.exp(-(t - S3.STOP - .3) * 8),
      lookX: stopK > .6 ? -.9 : .55, ahoge: 'perk', blush: .8 };
    const hand = handAt(hx, FY, s, heroO, 1);
    const behind = th < -1.3;
    if (behind) bigBrush(hand[0], hand[1], th, .95, 1);
    // idea star: flies along behind her shoulder, trailing sparkles
    const ip = tt => [xh3(tt) - 170 + 30 * Math.sin(tt * 2.3), FY - 430 + 26 * Math.sin(tt * 5.1)];
    const [ix, iy] = ip(t);
    idea(ix, iy, 24, { eyes: 'happy', trail: ip, rot: .2 * Math.sin(t * 4) });
    hero(hx, FY, s, heroO);
    if (!behind) { bigBrush(hand[0], hand[1], th, .95, 1); handOver(hand[0], hand[1], s); }
    // paint droplets flung off the bristles on each swing
    for (let n = 129; n <= 135; n++) {
      for (let i = 0; i < 7; i++) {
        const t0 = B(n) + .06 + i * .025, age = t - t0; if (age < 0 || age > 1.1) continue;
        const th0 = brushTh(t0), h0 = handAt(xh3(t0), FY, s, { ...heroO, aR: th0 < -1.4 ? .35 : lerp(.35, -.15, clamp((th0 + 1.4) / 1.7)) }, 1);
        const px = h0[0] + Math.cos(th0) * 420 * .95, py = h0[1] + Math.sin(th0) * 420 * .95;
        const vx = 420 + 260 * hash(n * 9 + i), vy = -520 - 300 * hash(n * 7 + i);
        const x = px + vx * age, y = py + vy * age + 1300 * age * age; if (y > GY + 40) continue;
        const col = ['#F58CA8', '#F7B08E', '#FFE08A', '#A8E0C8', '#C9A0DC'][(n + i) % 5], r = 7 + 6 * hash(n + i * 3);
        paint(ellPts(x, y, r, r * 1.1, 10), { wash: col, ink: PAL.ink, sw: .5 }); dot(x - r * .3, y - r * .35, r * .25, '#FFFFFF', .8);
      }
    }
    camEnd();
  }

  // ======================================================================================
  // 4 · 81.756–86.556  让喜欢的事 不只停在喜欢 — 桃桃 is born
  // A (top-down): the idea star taps the pencil sketch and colour blooms out like watercolour; a soft flash.
  // B (desk level): she pops up out of the page like a pop-up book, hops onto the desk, opens star eyes; the idea star
  //    swoops onto her antenna; confetti; a cute pose. The hero peeks over the desk, delighted.
  // ======================================================================================
  const S4T = { tap: B(137) + .1, bloom1: 83.2, sw: B(139), pop: B(139.5), hop0: B(140) + .05, land: B(140.67), open: B(141) - .02, star: B(141.5), pose: B(142.6) };
  // 桃桃's antenna drawn by hand (momo(..., { antenna: false, head: antennaHook(k) })): k = 0 bare stalk, 1 = her star
  const antennaHook = (k, t) => (s, sw) => {
    const sway = Math.sin(t * 3 + 1) * .1;
    push(); translate(.1 * s, -2.85 * s); rotate(sway);
    inkLine([[0, 0], [.15 * s, -.8 * s], [-.1 * s, -1.5 * s]], sw * .9, MOMO_STYLE.hair, 'ink', .6);
    if (k > 0) {
      glow(-.1 * s, -1.85 * s, 1.3 * s, '#FFE7A0', .6 * k);
      paint(starPts(-.1 * s, -1.85 * s, .58 * s * (1 + .1 * Math.sin(t * 7)), .45, 5), { wash: '#FFE59A', ink: PAL.ink, sw: sw * .5 });
    } else paint(ellPts(-.1 * s, -1.55 * s, .12 * s, .12 * s, 8), { wash: MOMO_STYLE.hair, ink: PAL.ink, sw: sw * .4 });
    pop();
  };
  const antennaTip = (x, y, s, o, t) => { const sway = Math.sin(t * 3 + 1) * .1, dx = -.1 * s * Math.cos(sway) + 1.85 * s * Math.sin(sway), dy = -.1 * s * Math.sin(sway) - 1.85 * s * Math.cos(sway); return headAt(x, y, s, o, .1 * s + dx, -2.85 * s + dy); };
  function confetti(t, t0, x, y, n, seed, o = {}) {
    const age = t - t0; if (age < 0 || age > (o.life || 2.2)) return;
    const cols = [PAL.pink, '#FFE08A', PAL.mint, PAL.sky, PAL.lilac, '#FFFFFF', PAL.peach];
    for (let i = 0; i < n; i++) {
      const a = -Math.PI * (.08 + .84 * hash(seed + i)), v = (o.v || 600) * (.5 + .7 * hash(seed + i * 2.3)), dr = Math.exp(-age * 1.6);
      const px = x + Math.cos(a) * v * (1 - dr) / 1.6 + Math.sin(age * 5 + i) * 12 * age, py = y + Math.sin(a) * v * (1 - dr) / 1.6 + 160 * age * age;
      push(); translate(px, py); rotate(age * (3 + 4 * hash(i + seed)) + i); scale(1, Math.cos(age * 9 + i));
      if (i % 4 === 0) paint(starPts(0, 0, 11, .45, 5), { wash: cols[i % cols.length], ink: null });
      else paint(rectPts(-9, -5, 18, 10), { wash: cols[i % cols.length], ink: null });
      pop();
    }
  }
  // top-down pencil doodles on the left page
  function studyPage(r, t) {
    sketch(1, () => {
      for (const [x, y, rr] of [[.25, .16, 38], [.62, .2, 30], [.42, .38, 22]]) paint(ellPts(r.x + r.w * x, r.y + r.h * y, rr, rr, 20), { ink: PAL.ink, sw: .8 });
      paint(starPts(r.x + r.w * .7, r.y + r.h * .47, 44, .5, 5, -Math.PI / 2 + .1), { ink: PAL.ink, sw: .9 });
      for (const sd of [-1, 1]) inkLine([[r.x + r.w * .66 + sd * 14, r.y + r.h * .47], [r.x + r.w * .66 + sd * 14 + 2, r.y + r.h * .47 + 6]], .6, PAL.ink, 'pencil', 0);
      paint(ellPts(r.x + r.w * .3, r.y + r.h * .64, 60, 56, 20), { ink: PAL.ink, sw: .9 });
      for (const sd of [-1, 1]) paint(ellPts(r.x + r.w * .3 + sd * 78, r.y + r.h * .7, 22, 50, 14, 0, sd * .3), { ink: PAL.ink, sw: .8 });
      inkLine([[r.x + r.w * .3, r.y + r.h * .64 - 56], [r.x + r.w * .3 + 8, r.y + r.h * .64 - 96], [r.x + r.w * .3 - 4, r.y + r.h * .64 - 120]], .8, PAL.ink, 'pencil', .6);
      inkLine([[r.x + r.w * .56, r.y + r.h * .66], [r.x + r.w * .78, r.y + r.h * .6]], .7, PAL.ink, 'pencil', .3);
      inkLine([[r.x + r.w * .74, r.y + r.h * .58], [r.x + r.w * .78, r.y + r.h * .6], [r.x + r.w * .75, r.y + r.h * .64]], .7, PAL.ink, 'pencil', 0);
      for (let k = 0; k < 4; k++) inkLine([[r.x + 40, r.y + r.h * .84 + k * 26], [r.x + 40 + 200 + 90 * hash(k), r.y + r.h * .84 + k * 26]], .5, PAL.ink, 'pencil', .2);
    });
  }
  // her hand from the bottom-right edge (top-down), pencil tip at (x, y)
  function handTop(x, y, sc = 1) {
    push(); translate(x, y); scale(sc);
    paint([[104, 76], [290, 280], [350, 222], [166, 16]], { wash: PAL.mint, fill: '#7EA78E', fillOp: 60, tex: .4, ink: PAL.ink, sw: 1, curv: .2 });
    paint([[98, 76], [122, 100], [186, 34], [162, 10]], { wash: '#C4E6D4', ink: PAL.ink, sw: .8, curv: .2 });
    pencil(0, 0, .8, 2.0);
    paint(ellPts(100, 50, 44, 34, 16, 0, .75), { wash: SKIN, ink: PAL.ink, sw: .9 });
    for (const [fx, fy, r] of [[50, 30, 13], [44, 50, 12], [54, 68, 11]]) paint(ellPts(fx, fy, r * 1.25, r, 10, 0, .5), { wash: SKIN, ink: PAL.ink, sw: .7 });
    paint(ellPts(70, 16, 15, 10, 10, 0, -.5), { wash: SKIN, ink: PAL.ink, sw: .7 });
    pop();
  }
  function birthTop(t) {
    const lt = t - 81.756, R = { x: 970, y: 225, w: 460, h: 630 }, mx = R.x + R.w / 2, my = R.y + R.h * .87, ms = 40;
    const push1 = ease(seg(t, S4T.bloom1, S4T.sw)), z = lerp(1.45, 1.6, ease(seg(t, 81.756, S4T.bloom1))) * (1 + 1.0 * push1 * push1);
    const ccx = lerp(1130, mx + 20, ease(seg(t, 81.756, S4T.bloom1))), ccy = lerp(520, 530, ease(seg(t, 81.756, S4T.bloom1))) - 190 * push1;
    camBegin(ccx, ccy, z);
    const tapP = [mx, my - 3.1 * ms];
    const bloomR = 520 * easeOut(seg(t, S4T.tap, S4T.bloom1 + .05));
    const mo = { antenna: false, eyes: 'closed', mouth: 'smile', aL: -1.25, aR: -1.25, noShadow: true, blush: .6 };
    deskTop(t, {
      lamp: 1,
      page: (r, sd) => {
        if (sd < 0) { studyPage(r, t); return; }
        glow(tapP[0], tapP[1], 260 + bloomR * .6, '#FFE9C8', .5 * seg(t, S4T.tap, S4T.tap + .3));
        sketch(1, () => momo(mx, my, ms, { ...mo, head: antennaHook(0, t) }));
        if (bloomR > 2) {
          const bp = []; for (let i = 0; i < 40; i++) { const a = i / 40 * TAU, rr = bloomR * (1 + .12 * Math.sin(a * 5 + 1) + .07 * Math.sin(a * 9 + t * 2)); bp.push([tapP[0] + Math.cos(a) * rr, tapP[1] + Math.sin(a) * rr * 1.1]); }
          clipTo(bp, () => sketch(lerp(.35, 0, seg(t, S4T.tap + .2, S4T.bloom1)), () => momo(mx, my, ms, { ...mo, head: antennaHook(0, t) })));
          if (bloomR < 500) paint(bp, { fill: PAL.pink, fillOp: 70 * (1 - seg(bloomR, 300, 500)), bleed: .02, tex: .2, border: 1, ink: null });
        }
      },
      items: tt => {
        // the soda can from above, eraser crumbs, a paper ball
        paint(ellPts(360, 760, 70, 70, 24), { wash: '#F8B99A', ink: PAL.ink, sw: 1.1 }); paint(ellPts(360, 760, 56, 56, 22), { wash: '#DADCE6', ink: PAL.ink, sw: .8 });
        paint(rrPts(344, 730, 32, 20, 8), { wash: '#B8BCCB', ink: PAL.ink, sw: .6 }); paint(ellPts(360, 780, 10, 8, 10), { wash: PAL.ink, washOp: 120, ink: null });
        for (let i = 0; i < 6; i++) paint(ellPts(1500 + hash(i) * 120, 780 + hash(i + 3) * 80, 7, 4, 8, 0, hash(i) * 3), { wash: '#F6B3C6', ink: PAL.ink, sw: .4 });
        paperBall(1560, 330, 1.6, 7);
        // her hand finishing the antenna stroke, then pulling away
        const out = easeIn(seg(tt, 82.0, 82.4)), dr = seg(tt, 81.756, 82.0);
        const tip = [mx + .1 * ms - .1 * ms + dr * 2, my - 6.7 * ms - 2.85 * ms - 1.3 * ms + (1 - dr) * .6 * ms];
        if (out < 1) handTop(tip[0] + out * 700, tip[1] + out * 500, 1.15);
      }
    });
    // the idea star above the page (its shadow on the paper tells the height), diving to tap her heart
    const dive = seg(t, S4T.tap - .22, S4T.tap), up = easeOut(seg(t, S4T.tap, S4T.tap + .5));
    let ix = lerp(1080, tapP[0], easeIn(dive)), iy = lerp(330, tapP[1], easeIn(dive)), ih = lerp(1, 0, easeIn(dive));
    if (t > S4T.tap) { ix = lerp(tapP[0], 1330, up); iy = lerp(tapP[1], 340, up); ih = up; }
    ix += Math.sin(t * 2.2) * 10 * ih; iy += Math.sin(t * 3.1) * 8 * ih;
    paint(ellPts(ix + 36 * ih, iy + 50 * ih + 20, 50 - 18 * ih, 20 - 6 * ih, 14), { wash: PAL.ink, washOp: 50, ink: null });
    idea(ix, iy, 40 * (1 + .25 * ih), { eyes: t > S4T.tap && t < S4T.tap + .4 ? 'happy' : 'normal', sq: t > S4T.tap && t < S4T.tap + .15 ? .3 : 0, glowMul: 1.2 });
    if (t > S4T.tap) { const k = seg(t, S4T.tap, S4T.tap + .6); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; sparkle(tapP[0] + Math.cos(a) * 150 * easeOut(k), tapP[1] + Math.sin(a) * 150 * easeOut(k), 22, '#FFF3C0', k); } }
    camEnd();
  }
  // desk-level set: her room softly behind, the wooden desk, the open book in perspective
  const BK = { fl: [800, 552], fr: [1600, 552], nr: [1730, 748], nl: [690, 748], spF: 1200, spN: 1206 };
  function birthSide(t) {
    const lt = t - S4T.sw;
    // camera
    const z = kf(t, [[S4T.sw, 1.3], [S4T.pop + .3, 1.12], [S4T.land, 1.04], [S4T.pose, 1.08], [86.9, 1.16]], easeInOut) + .012 * pulse(t, 5);
    const cx = kf(t, [[S4T.sw, 1340], [S4T.land, 1080], [S4T.pose, 1110], [86.9, 1200]], easeInOut), cy = kf(t, [[S4T.sw, 620], [S4T.land, 545], [86.9, 560]], easeInOut);
    camBegin(cx, cy, z);
    // the room behind, soft and warm
    paint(rectPts(-300, -300, W + 600, 1000), { grad: ['#46467E', '#A27A98', Math.PI / 2], ink: null });
    glow(300, 180, 900, PAL.lamp, .55);
    bokehField(t, { x: -200, y: 60, w: W + 400, h: 420 }, 18, ['#FFD98A', '#FFB3C6', '#BFF0E0', '#FFE7A8'], { a: .45, r: 34, seed: 7 });
    // the hero, behind the desk, peeking over it
    const hmd = mood(t, [[S4T.sw - 1, 'sparkle', null, 'o'], [S4T.star + .05, 'sparkle', null, 'open'], [S4T.pose + .1, 'happy', 'heart', 'open']]);
    const hx = 470, hyG = 712, hs = 60;
    hero(hx, hyG, hs, { outfit: 'home', ...hmd, lookX: .75, lookY: .55, blush: 1, tilt: .12 + .04 * Math.sin(t * 2), aL: -1.2, aR: -1.2, dy: -.04 * Math.abs(Math.sin(bpOf(t) * Math.PI)), noShadow: true, ahoge: t > S4T.star ? 'heart' : 'perk' });
    // 团子 peeks over the far edge of the desk, whiskers first
    const catUp = easeOut(seg(t, S4T.pop - .1, S4T.pop + .4));
    cat(1790, 600 - 40 * catUp, 44, { pose: 'sit', eyes: t > S4T.star + .1 ? 'happy' : t > S4T.pop ? 'wide' : 'open', look: -.8, noShadow: true, tail: Math.sin(t * 4) * .3 });
    // desk
    paint([[-300, 516], [W + 300, 516], [W + 300, 1400], [-300, 1400]], { wash: '#C99A6A', fill: '#9C6B42', fillOp: 70, bleed: .03, tex: .6, border: .3, ink: PAL.ink, sw: 1.3 });
    inkLine([[-300, 516], [W + 300, 516]], 1.6, PAL.ink, 'ink', 0);
    for (let i = 0; i < 9; i++) inkLine([[960 + (i - 4) * 60, 520], [960 + (i - 4) * 420, 1200]], .5, '#8A5E3C', 'fine', 0, .5);
    glow(700, 640, 700, PAL.lamp, .35);
    for (const dx of [-40, 40]) paint(ellPts(1790 + dx, 520, 26, 16, 12), { wash: '#F6D3A1', ink: PAL.ink, sw: .9 });
    // her hands resting on the desk edge
    for (const dx of [-130, 130]) { paint(rrPts(hx + dx - 66, 500, 132, 46, 22), { wash: PAL.mint, fill: '#7EA78E', fillOp: 50, tex: .3, ink: PAL.ink, sw: 1 }); paint(ellPts(hx + dx + (dx < 0 ? 56 : -56), 530, 42, 30, 14), { wash: SKIN, ink: PAL.ink, sw: 1 }); }
    // the book
    const { fl, fr, nr, nl, spF, spN } = BK;
    paint([[fl[0] - 12, fl[1] - 6], [fr[0] + 12, fr[1] - 6], [nr[0] + 16, nr[1] + 22], [nl[0] - 16, nl[1] + 22]], { wash: '#6F86B8', ink: PAL.ink, sw: 1.2 });
    paint([nl, nr, [nr[0], nr[1] + 12], [nl[0], nl[1] + 12]], { wash: '#F1E6D6', ink: PAL.ink, sw: .8 });
    paint([fl, [spF, fl[1] + 6], [spN, nl[1] + 4], nl], { wash: '#FFFBF2', fill: '#EFE6D6', fillOp: 50, tex: .3, ink: PAL.ink, sw: 1, curv: .05 });
    paint([[spF, fr[1] + 6], fr, nr, [spN, nr[1] + 4]], { wash: '#FFFBF2', fill: '#EFE6D6', fillOp: 50, tex: .3, ink: PAL.ink, sw: 1, curv: .05 });
    inkLine([[spF, fl[1] + 6], [spN, nl[1] + 4]], 1, PAL.ink, 'ink', 0);
    sketch(1, () => { for (let k = 0; k < 4; k++) inkLine([[850 + k * 12, 610 + k * 34], [1120 - k * 6, 608 + k * 34]], .6, PAL.ink, 'pencil', .2); paint(ellPts(960, 584, 50, 11, 16), { ink: PAL.ink, sw: .7 }); });
    // 桃桃: lying drawn on the page → pops up → hops onto the desk → star eyes → her star arrives → pose
    const ms = 32, footP = [1430, 728], landP = [1330, 880];
    const popK = t < S4T.pop ? 0 : backOut(seg(t, S4T.pop, S4T.pop + .38));
    const syF = lerp(.28, 1, clamp(popK, 0, 1.2));
    const hop = seg(t, S4T.hop0, S4T.land);
    let mxp = lerp(footP[0], landP[0], hop), myp = lerp(footP[1], landP[1], hop) - Math.sin(hop * Math.PI) * 190;
    const landSq = t > S4T.land ? .28 * Math.exp(-(t - S4T.land) * 9) * Math.cos((t - S4T.land) * 22) : 0;
    const bp = bpOf(t), posed = t > S4T.pose;
    const mmd = mood(t, [[S4T.sw - 1, 'closed', null, 'smile'], [S4T.open, 'star', null, 'open'], [S4T.pose, 'wink', 'heart', 'open']]);
    const hopDy = t > S4T.star + .2 && t < S4T.pose ? -Math.abs(Math.sin((t - S4T.star - .2) / (S4T.pose - S4T.star - .2) * Math.PI)) * 1.4 : posed ? -Math.abs(Math.sin(bp * Math.PI)) * .25 : 0;
    const mo = { ...mmd, antenna: false, blush: .9, noShadow: hop > 0 && hop < 1, sq: landSq + (mmd.take || 0) + (hop > 0 && hop < 1 ? -.12 : 0), dy: hopDy,
      aL: posed ? .35 + .1 * Math.sin(t * 6) : hop > 0 && hop < 1 ? .3 : t > S4T.star ? .6 * Math.sin(seg(t, S4T.star, S4T.pose) * Math.PI) : -1.25,
      aR: posed ? -.15 : hop > 0 && hop < 1 ? .3 : t > S4T.star ? .6 * Math.sin(seg(t, S4T.star, S4T.pose) * Math.PI) : -1.25,
      tilt: posed ? .18 : .05 * Math.sin(t * 2.5), lookX: t < S4T.land ? 0 : -.35, lookY: -.1 };
    const starOn = t >= S4T.star;
    // her pencil ghost stays on the page where she lay
    if (popK > 0) fadeIn(.45 * seg(t, S4T.pop, S4T.pop + .3), () => { push(); translate(footP[0], footP[1]); scale(1, .28); sketch(1, () => momo(0, 0, ms, { antenna: false, eyes: 'closed', noShadow: true, aL: -1.25, aR: -1.25 })); pop(); });
    glow(mxp, myp - 5 * ms * syF, 260, '#FFD6E6', .5);
    if (hop <= 0) { push(); translate(footP[0], footP[1]); scale(1, syF); momo(0, 0, ms, { ...mo, noShadow: popK < .7, head: antennaHook(0, t) }); pop(); }
    else momo(mxp, myp, ms * (1 + .12 * hop), { ...mo, head: antennaHook(starOn ? 1 : 0, t) });
    // sparkles when she pops up, and when her eyes open
    if (t > S4T.pop) { const k = seg(t, S4T.pop, S4T.pop + .7); for (let i = 0; i < 7; i++) { const a = -Math.PI * (.1 + .8 * i / 6); sparkle(footP[0] + Math.cos(a) * 190 * easeOut(k), footP[1] - 130 + Math.sin(a) * 150 * easeOut(k), 18, '#FFF3C0', k); } }
    if (t > S4T.open) { const k = seg(t, S4T.open, S4T.open + .5); for (const sd of [-1, 1]) sparkle(mxp + sd * 70, myp - 8 * ms, 26, '#FFFFFF', k); }
    // the idea star: hovering above → spirals down → lands on her antenna
    const tip = antennaTip(mxp, myp, hop > 0 ? ms * (1 + .12 * hop) : ms, mo, t);
    if (!starOn) {
      const k = seg(t, S4T.star - .75, S4T.star), a = k * TAU * 1.1, rr = 170 * (1 - k);
      const hx0 = 1560 + Math.sin(t * 2) * 30, hy0 = 250 + Math.sin(t * 3) * 16;
      const ix = k <= 0 ? hx0 : lerp(hx0, tip[0], easeIn(k)) + Math.cos(a) * rr * .8, iy = k <= 0 ? hy0 : lerp(hy0, tip[1], easeIn(k)) + Math.sin(a) * rr * .4;
      idea(ix, iy, lerp(26, 13, easeIn(k)), { eyes: 'happy', glowMul: 1.3, trail: tt => { const q = seg(tt, S4T.star - .75, S4T.star); return [lerp(hx0, tip[0], easeIn(q)) + Math.cos(q * TAU * 1.1) * 170 * (1 - q) * .8, lerp(hy0, tip[1], easeIn(q)) + Math.sin(q * TAU * 1.1) * 170 * (1 - q) * .4]; } });
    } else {
      const k = seg(t, S4T.star, S4T.star + .5);
      glow(tip[0], tip[1], 240 * (1 - k * .5), '#FFF3C0', .8 * (1 - k));
      for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; sparkle(tip[0] + Math.cos(a) * 130 * easeOut(k), tip[1] + Math.sin(a) * 130 * easeOut(k), 16, i % 2 ? '#FFF3C0' : '#FFD6E6', k); }
    }
    confetti(t, S4T.star, tip[0], tip[1], 34, 5, { v: 700 });
    camEnd();
    flash(.9 * (1 - seg(t, S4T.sw, S4T.sw + .25)), '#FFF8F0');
  }
  function momoBorn(t, lt) {
    if (t < S4T.sw) { birthTop(t); flash(.9 * seg(t, S4T.sw - .22, S4T.sw), '#FFF8F0'); }
    else birthSide(t);
  }

  // ======================================================================================
  // 5 · 86.556–90.756  我还没写完 也不急着圆满
  // A starry sky, a crescent cradle. She and 桃桃 sit on it swinging their legs. She raises her giant pencil and traces
  // the missing half of the circle, stops halfway, smiles, and lets the line drift away as sparkles. 桃桃 tosses
  // little stars into the sky on the beat.
  // ======================================================================================
  const M5 = { x: 1010, y: 470, r: 400, rot: 1.35 };
  const S5T = { lift: B(145), draw0: B(145.6), draw1: B(147.5), smile: B(148), fade0: B(148.4), fade1: B(149.6), down: B(148.6) };
  // y of the crescent's inner (seat) edge at screen x
  function moonSeat(x) {
    const { x: cx, y: cy, r, rot } = M5, c = Math.cos(rot), sn = Math.sin(rot); let best = -1e9, prev = null;
    for (let i = 0; i <= 80; i++) {
      const a = -Math.PI / 2 + i / 80 * Math.PI, lx = -.15 * r + .72 * r * Math.cos(a), ly = .9 * r * Math.sin(a), p = [cx + lx * c - ly * sn, cy + lx * sn + ly * c];
      if (prev && (prev[0] - x) * (p[0] - x) <= 0 && prev[0] !== p[0]) { const k = (x - prev[0]) / (p[0] - prev[0]); best = Math.max(best, lerp(prev[1], p[1], k)); }
      prev = p;
    }
    return best;
  }
  const arcPt = ph => [M5.x + M5.r * Math.cos(ph + M5.rot), M5.y + M5.r * Math.sin(ph + M5.rot)];      // ph = π/2 at the left horn
  const STARS5 = [[B(144.5), 1350, 210, 1], [B(146.5), 1560, 330, 2], [B(149), 1240, 120, 3], [B(150), 1700, 190, 4]];
  function nightSky5(t) {
    paint(rectPts(-300, -300, W + 600, H + 600), { grad: ['#1C2156', '#E6A2BE', Math.PI / 2], ink: null });
    glow(960, 1150, 1100, '#FFC9D6', .5);
    starField(t, { x: -200, y: -150, w: W + 400, h: 800 }, 70, { seed: 21 });
    for (let i = 0; i < 6; i++) { const k = i * 11; sparkle(hash(k) * W, hash(k + 1) * 600, 10 + 8 * hash(k + 2), '#FFF6D8', frac(t * .45 + hash(k + 3))); }
    for (const [x, y, sc, sd] of [[140, 1000, 1.8, 3], [700, 1060, 2.2, 4], [1340, 1010, 1.9, 5], [1900, 1050, 2.1, 6], [420, 1120, 2.4, 7], [1650, 1130, 2.4, 8]]) cloudPuff(x + Math.sin(t * .3 + sd) * 20, y, sc, '#F9D3E0', { seed: sd, shade: '#D7A3C7', ink: false, op: 235 });
  }
  function crescent(t, lt) {
    const bp = bpOf(t), { x: MX, y: MY, r: MR } = M5;
    const z = kf(t, [[86.556, 1.28], [S5T.lift, 1.24], [S5T.draw1, 1.02], [S5T.smile + .2, 1.04], [90.9, 1.34]], easeInOut) + .01 * pulse(t, 6);
    const cx = kf(t, [[86.556, 1210], [S5T.lift, 1190], [S5T.draw1, 1000], [S5T.smile + .2, 1020], [90.9, 1220]], easeInOut);
    const cy = kf(t, [[86.556, 610], [S5T.lift, 600], [S5T.draw1, 420], [S5T.smile + .2, 430], [90.9, 610]], easeInOut);
    camBegin(cx, cy, z, .02 * Math.sin(t * .5));
    nightSky5(t);
    // ---- the pencil line she draws along the missing half, then lets go ----
    const drawK = easeInOut(seg(t, S5T.draw0, S5T.draw1)) * .44, fade = seg(t, S5T.fade0, S5T.fade1);
    const phEnd = Math.PI / 2 + Math.PI * drawK;
    if (drawK > .005 && fade < 1) {
      const pts = []; for (let ph = Math.PI / 2; ph <= phEnd + 1e-6; ph += .03) pts.push(arcPt(ph));
      pts.push(arcPt(phEnd));
      // it breaks up from the far end into sparkles
      const keep = Math.max(2, Math.round(pts.length * (1 - fade)));
      fadeIn(1 - fade * .6, () => {
        for (let i = 0; i < keep; i += 4) glow(pts[i][0], pts[i][1], 34, '#FFF3C0', .22);
        inkLine(pts.slice(0, keep), 2.1, '#4E4B66', 'marker', 0, .9); inkLine(pts.slice(0, keep), 2.6, '#5E5A78', 'pencil', 0); inkLine(pts.slice(0, keep), .5, '#FFF6D8', 'marker', 0, .8);
      });
      if (fade > 0) for (let i = keep; i < pts.length; i += 3) { const age = fade * 1.2 - (1 - i / pts.length) * .3; if (age > 0 && age < 1) sparkle(pts[i][0] + Math.sin(i) * 20 * age, pts[i][1] - 60 * age, 12, '#FFF3C0', age); }
    }
    // ---- the moon ----
    moonFace(MX, MY, MR, { rot: M5.rot });
    // ---- 桃桃's stars: tossed up, they stick and twinkle ----
    const momoX = 1318;
    const mSeat = moonSeat(momoX), hSeatX = 1172, hSeat = moonSeat(hSeatX);
    for (const [T0, sx, sy, i] of STARS5) {
      const fly = seg(t, T0, T0 + .35); if (fly <= 0) continue;
      const hx0 = momoX + 60, hy0 = mSeat - 190, px = lerp(hx0, sx, easeOut(fly)), py = lerp(hy0, sy, easeOut(fly)) - Math.sin(fly * Math.PI) * 90;
      const pop = backOut(seg(t, T0 + .33, T0 + .55)), rr = 32 * (fly < 1 ? .6 : pop);
      glow(px, py, rr * 3, '#FFF1C2', .5);
      paint(starPts(px, py, rr * (1 + .06 * Math.sin(t * 6 + i)), .45, 5, -Math.PI / 2 + Math.sin(t * 2 + i) * .15), { wash: '#FFE59A', ink: PAL.ink, sw: .8 });
      if (fly >= 1) { for (const sd of [-1, 1]) inkLine([[px + sd * 9 - 4, py], [px + sd * 9, py - 4], [px + sd * 9 + 4, py]], .7, PAL.ink, 'ink', .5); inkLine([[px - 4, py + 6], [px, py + 9], [px + 4, py + 6]], .6, PAL.ink, 'fine', .5); for (const sd of [-1, 1]) dot(px + sd * 15, py + 5, 3.5, '#F59CA8', .8); }
      if (fly < 1) inkLine([[hx0, hy0], [px, py]].map(([a, b], j) => [a, b]), .8, '#FFF3C0', 'fine', .2, .4 * (1 - fly));
      sparkle(px + 30, py - 24, 14, '#FFFFFF', seg(t, T0 + .35, T0 + .8));
    }
    // ---- the two of them on the crescent ----
    const lift = ease(seg(t, S5T.lift, S5T.draw0)) * (1 - ease(seg(t, S5T.down, S5T.down + .5)));
    const hmd = mood(t, [[86.4, 'happy', null, 'smile'], [S5T.lift, 'normal', null, 'pout'], [S5T.draw1 + .05, 'look', '…', 'o'], [S5T.smile, 'happy', null, 'smile'], [S5T.fade1, 'happy', 'music', 'open']]);
    const swing = t * 1.3, hs = 30, msz = 24;
    const drawTip = arcPt(phEnd);
    const heroO = { outfit: 'home', ...hmd, sit: true, walk: swing, blush: .8, lookX: lift > .3 ? -.85 : .35, lookY: lift > .3 ? -.55 : 0, tilt: lift > .3 ? -.14 : .1 + .05 * Math.sin(bp * Math.PI) + .12 * ease(seg(t, S5T.fade1, S5T.fade1 + .5)),
      aL: lerp(t > S5T.down ? -.35 : -1.1, lerp(.05, .5, drawK / .44), lift), aR: -1.1, dy: -.1 * Math.abs(Math.sin(bp * Math.PI)), ahoge: t > S5T.draw1 && t < S5T.smile ? 'question' : 'normal', noShadow: true };
    const hG = [hSeatX, hSeat + 1.5 * hs];
    // the giant pencil (behind her), tip on the circle while she draws
    if (lift > .01 || t > S5T.down) {
      const hand = handAt(hG[0], hG[1], hs, heroO, -1);
      const rest = [hand[0] - 70, hand[1] - 540], tip = drawK > .003 && t < S5T.down ? drawTip : t >= S5T.down ? [lerp(rest[0], drawTip[0], lift), lerp(rest[1], drawTip[1], lift)] : [lerp(rest[0], arcPt(Math.PI / 2)[0], lift), lerp(rest[1], arcPt(Math.PI / 2)[1], lift)];
      pencil(tip[0], tip[1], 4.1, pencilRot(tip[0], tip[1], hand[0], hand[1]));
      if (drawK > .003 && fade < .2) glow(tip[0], tip[1], 50, '#FFF3C0', .7);
    }
    hero(hG[0], hG[1], hs, heroO);
    if (lift > .01 && t < S5T.down + .45) { const hand = handAt(hG[0], hG[1], hs, heroO, -1); handOver(hand[0], hand[1], hs); }
    const toss = STARS5.reduce((a, [T0]) => Math.max(a, smooth01(t, T0 - .15, T0, T0 + .2, T0 + .45)), 0);
    const mmd = mood(t, [[86.4, 'happy', null, 'open'], [S5T.draw1, 'star', null, 'o'], [S5T.smile + .1, 'happy', null, 'open']]);
    momo(momoX, mSeat + 1.5 * msz, msz, { ...mmd, sit: true, walk: swing + .3, blush: .9, lookX: t > S5T.draw1 && t < S5T.smile + .4 ? -.8 : .4, lookY: -.3, tilt: -.08 + .06 * Math.sin(bp * Math.PI) - .12 * ease(seg(t, S5T.fade1, S5T.fade1 + .5)),
      aR: lerp(-1.1, .55, toss), aL: -1.1 + .3 * toss, dy: -.12 * Math.abs(Math.sin(bp * Math.PI + 1)), noShadow: true });
    camEnd();
  }

  // ======================================================================================
  // 6 · 90.756–95.556  不让一声算了 变成最后的答案
  // Desk level, the hero peeking from the other side. Her sigh puffs out as the grey 算了 cloud, which drifts to the end
  // of her last written line to sit on it like a full stop. 桃桃 jumps and pokes it with her antenna star: 噗 — it
  // bursts into little birds and dandelion fluff; the light comes back; she smiles.
  // ======================================================================================
  const S6T = { sigh: B(151.5), grown: B(152.5), settle: B(155), crouch: B(155.2), jump: B(155.5), poke: B(156), land: B(156.6) };
  const NB = { fl: [560, 540], fr: [1400, 540], nr: [1540, 792], nl: [420, 792], sp: 980 };
  const quadAt = (q, u, v) => { const top = [lerp(q[0][0], q[1][0], u), lerp(q[0][1], q[1][1], u)], bot = [lerp(q[3][0], q[2][0], u), lerp(q[3][1], q[2][1], u)]; return [lerp(top[0], bot[0], v), lerp(top[1], bot[1], v)]; };
  const LPAGE = [[NB.fl[0], NB.fl[1]], [NB.sp, NB.fl[1] + 4], [NB.sp + 2, NB.nl[1] + 3], [NB.nl[0], NB.nl[1]]];
  const LINE_END6 = quadAt(LPAGE, .74, .8);
  function bird(x, y, sc, flap, rot, col = '#FFFDF6') {
    push(); translate(x, y); rotate(rot); scale(sc);
    paint([[-22, 0], [-6, -14], [16, -12], [26, -4], [18, 8], [-4, 12]], { wash: col, ink: PAL.ink, sw: .8, curv: .5 });
    paint([[30, -6], [40, -2], [29, 1]], { wash: '#F7B08E', ink: PAL.ink, sw: .5 });
    dot(18, -6, 2.4, PAL.ink); dot(10, 1, 3.2, '#F59CA8', .8);
    push(); translate(-2, -8); scale(1, flap);
    paint([[-4, 0], [-20, -26], [4, -18], [10, 0]], { wash: col, ink: PAL.ink, sw: .7, curv: .4 });
    pop();
    inkLine([[-22, 0], [-34, -6], [-30, 4]], .6, PAL.ink, 'fine', .3);
    pop();
  }
  function fluff(x, y, sc, rot) {
    push(); translate(x, y); rotate(rot); scale(sc);
    inkLine([[0, 0], [0, 26]], .5, '#E8E2D8', 'fine', 0);
    for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * .33; inkLine([[0, 0], [Math.cos(a) * 16, Math.sin(a) * 16]], .35, '#FFFFFF', 'fine', 0, .9); }
    dot(0, 0, 2.6, '#FFFBF0'); dot(0, 27, 2.2, '#C9B8A6');
    pop();
  }
  function sighPop(t, lt) {
    const bp = bpOf(t), dim = smooth01(t, S6T.sigh + .2, S6T.grown + .5, S6T.poke, S6T.poke + .25) * .45;
    const z = kf(t, [[90.756, 1.26], [S6T.grown, 1.12], [S6T.settle, 1.14], [S6T.poke, 1.2], [95.6, 1.1]], easeInOut) + .01 * pulse(t, 6);
    const cx = kf(t, [[90.756, 1040], [S6T.grown, 1060], [S6T.settle, 950], [S6T.poke, 920], [95.6, 960]], easeInOut), cy = kf(t, [[90.756, 530], [S6T.settle, 490], [S6T.poke, 470], [95.6, 480]], easeInOut);
    const [shx, shy] = shakeXY(t, t > S6T.poke && t < S6T.poke + .3 ? 8 * Math.exp(-(t - S6T.poke) * 12) : 0);
    camBegin(cx + shx, cy + shy, z);
    // the room behind
    paint(rectPts(-300, -300, W + 600, 1000), { grad: ['#434A86', '#B58AA2', Math.PI / 2], ink: null });
    glow(1650, 150, 900, PAL.lamp, .5);
    bokehField(t, { x: -200, y: 40, w: W + 400, h: 400 }, 16, ['#FFD98A', '#FFB3C6', '#BFF0E0', '#FFE7A8'], { a: .42, r: 32, seed: 12 });
    // the hero behind the desk: writing, sighs the cloud out, droops, lights up again
    const hmd = mood(t, [[90.6, 'normal', null, 'smile'], [S6T.sigh - .05, 'tired', null, 'o'], [S6T.grown + .2, 'tired', null, 'flat'], [S6T.poke + .05, 'sparkle', null, 'O'], [S6T.poke + .7, 'happy', 'flower', 'open']]);
    const HX = 1500, HG = 690, HS = 58, droop = smooth01(t, S6T.sigh, S6T.grown, S6T.poke, S6T.poke + .2);
    hero(HX, HG, HS, { outfit: 'home', ...hmd, lookX: -.7, lookY: .45, tilt: -.1 - .08 * droop, dy: .12 * droop, blush: .6 + .4 * (1 - droop), aL: -1.2, aR: -1.2, noShadow: true,
      ahoge: droop > .5 ? 'droop' : t > S6T.poke ? 'perk' : 'normal', brows: droop > .5 ? 'sad' : null });
    // desk
    paint([[-300, 500], [W + 300, 500], [W + 300, 1400], [-300, 1400]], { wash: '#C99A6A', fill: '#9C6B42', fillOp: 70, bleed: .03, tex: .6, border: .3, ink: PAL.ink, sw: 1.3 });
    inkLine([[-300, 500], [W + 300, 500]], 1.6, PAL.ink, 'ink', 0);
    for (let i = 0; i < 9; i++) inkLine([[960 + (i - 4) * 60, 504], [960 + (i - 4) * 420, 1200]], .5, '#8A5E3C', 'fine', 0, .5);
    glow(1500, 600, 700, PAL.lamp, .3);
    for (const dx of [-130, 130]) { paint(rrPts(HX + dx - 66, 484, 132, 46, 22), { wash: PAL.mint, fill: '#7EA78E', fillOp: 50, tex: .3, ink: PAL.ink, sw: 1 }); paint(ellPts(HX + dx + (dx < 0 ? 56 : -56), 514, 42, 30, 14), { wash: SKIN, ink: PAL.ink, sw: 1 }); }
    // the notebook with her lines
    const { fl, fr, nr, nl, sp } = NB;
    paint([[fl[0] - 12, fl[1] - 6], [fr[0] + 12, fr[1] - 6], [nr[0] + 16, nr[1] + 22], [nl[0] - 16, nl[1] + 22]], { wash: '#E7A0B4', ink: PAL.ink, sw: 1.2 });
    paint([nl, nr, [nr[0], nr[1] + 12], [nl[0], nl[1] + 12]], { wash: '#F1E6D6', ink: PAL.ink, sw: .8 });
    paint(LPAGE, { wash: '#FFFBF2', fill: '#EFE6D6', fillOp: 50, tex: .3, ink: PAL.ink, sw: 1 });
    paint([[sp, fr[1] + 4], fr, nr, [sp + 2, nr[1] + 3]], { wash: '#FFFBF2', fill: '#EFE6D6', fillOp: 50, tex: .3, ink: PAL.ink, sw: 1 });
    for (let v = .12; v < .95; v += .17) for (const pg of [LPAGE, [[sp, fr[1] + 4], fr, nr, [sp + 2, nr[1] + 3]]]) inkLine([quadAt(pg, .04, v + .05), quadAt(pg, .96, v + .05)], .45, '#B9D3EA', 'fine', 0, .7);
    [[.12, .92], [.29, .88], [.46, .95], [.63, .9], [.8, .74]].forEach(([v, len], li) => {
      const pts = []; for (let u = .06; u <= len; u += .008) { const lu = (u - .06) * 60; pts.push(quadAt(LPAGE, u + .004 * Math.sin(lu * 1.3), v - .045 * (.5 + .5 * Math.cos(lu * 2.1)) * (.6 + .4 * Math.sin(lu * .37 + li)))); }
      inkLine(pts, .9, INKB, 'fine', 0);
    });
    // the cloud's shadow on the page, right where the full stop would go
    const cK = seg(t, S6T.grown, S6T.settle) * (1 - seg(t, S6T.poke, S6T.poke + .15));
    if (cK > 0) paint(ellPts(LINE_END6[0] + 20, LINE_END6[1] + 4, 70 - 30 * cK, 14 - 5 * cK, 16), { wash: '#4A4A6A', washOp: 90 * cK, ink: null });
    // 桃桃 on the page: notices, steps under the cloud, jumps and pops it with her antenna star
    const MS = 30, MX0 = 700, MY0 = 782, MX1 = 870;
    const step = easeInOut(seg(t, S6T.settle - .1, S6T.crouch + .1));
    const crouch = smooth01(t, S6T.crouch, S6T.jump - .04, S6T.jump - .04, S6T.jump);
    const jk = seg(t, S6T.jump, S6T.land), air = t > S6T.jump && t < S6T.land;
    const JH = 120, rise = air ? (jk < .5 ? easeOut(jk * 2) : 1 - easeIn((jk - .5) * 2)) * JH : 0;
    const mx = lerp(MX0, MX1, step), my = MY0 - rise;
    const landK = t > S6T.land ? Math.exp(-(t - S6T.land) * 9) : 0;
    const mmd = mood(t, [[90.6, 'happy', null, 'smile'], [S6T.grown - .1, 'wide', '!', 'o'], [S6T.settle - .5, 'normal', 'sweat', 'wobble'], [S6T.crouch - .1, 'normal', null, 'pout'], [S6T.poke + .05, 'star', null, 'open'], [S6T.land + .3, 'happy', null, 'open']]);
    const cheer = t > S6T.land + .2;
    const mo = { ...mmd, sq: .22 * crouch + .25 * landK * Math.cos((t - S6T.land) * 20) + (air ? -.14 * (1 - Math.abs(jk - .5) * 2) : 0) + (mmd.take || 0), lookX: t < S6T.poke ? .3 : .05, lookY: t < S6T.poke && t > S6T.grown ? -.9 : -.2,
      brows: t > S6T.crouch - .1 && t < S6T.poke ? 'angry' : null, aL: air ? 1.0 : cheer ? 1.0 + .2 * Math.sin(t * 10) : -1.1 + (t < S6T.grown ? .4 * Math.abs(Math.sin(bp * Math.PI)) : 0),
      aR: air ? 1.0 : cheer ? 1.0 - .2 * Math.sin(t * 10) : -1.1, dy: cheer ? -Math.abs(Math.sin(bp * Math.PI)) * .6 : 0, noShadow: air, blush: .9, walk: step > 0 && step < 1 ? t * 3 : null };
    const tipNow = antennaTip(mx, my, MS, mo, t);
    // the grey 算了 cloud: out of her mouth, drifting over the line's end, sinking; 桃桃's star pops it
    const mouth = headAt(HX, HG, HS, { tilt: -.1 - .08 * droop, dy: .12 * droop }, -.7 * .38 * HS * 1.1, 1.45 * HS);
    const CS = 1.15, tipPoke = antennaTip(MX1, MY0 - JH, MS, { ...mo, sq: -.07 }, S6T.poke);
    const CL = [tipPoke[0] + 6, tipPoke[1] - 8 * CS - 8];
    if (t >= S6T.sigh && t < S6T.poke + .3) {
      const g = seg(t, S6T.sigh, S6T.grown), dr = easeInOut(seg(t, S6T.grown, S6T.settle)), sink = easeIn(seg(t, S6T.settle, S6T.poke));
      let x = lerp(mouth[0] - 20, 1180, easeOut(g)), y = lerp(mouth[1] + 10, 260, easeOut(g)), sc = lerp(.12, CS, easeOut(g));
      if (t > S6T.grown) { x = lerp(1180, CL[0], dr) + Math.sin(t * 2) * 8 * (1 - sink); y = lerp(260, CL[1] - 90, dr) + Math.sin(dr * Math.PI) * 40 + sink * 90; sc = CS; }
      const popK = t > S6T.poke ? seg(t, S6T.poke, S6T.poke + .2) : 0;
      // its shadow on the page, right where the full stop would go
      const k = seg(t, S6T.grown, S6T.poke) * (1 - popK);
      paint(ellPts(LINE_END6[0] + 20, LINE_END6[1] + 4, 90 - 30 * k, 16 - 5 * k, 16), { wash: '#4A4A6A', washOp: 100 * k, ink: null });
      momo(mx, my, MS, mo);
      sighCloud(x, y, sc * (1 - .06 * Math.sin(t * 3) * (1 - popK)), { pop: popK, rain: t > S6T.grown - .2 });
      if (t > S6T.grown && t < S6T.poke) for (let i = 0; i < 3; i++) { const ph = frac(t * .9 + i / 3); paint(ellPts(x - 150 * CS - 30 * ph, y - 30 - 26 * ph, 12 + 14 * ph, 9 + 10 * ph, 10), { wash: '#A6A8BA', washOp: 170 * (1 - ph), ink: PAL.ink, sw: .5 }); }
    } else momo(mx, my, MS, mo);
    // the burst: 噗, birds and fluff
    if (t > S6T.poke) {
      const age = t - S6T.poke;
      if (age < .35) { const k = age / .35; paint(starPts(CL[0], CL[1], 60 + 160 * easeOut(k), .5, 8, age * 3), { wash: '#FFF6E6', washOp: 230 * (1 - k), ink: PAL.ink, sw: .8 }); }
      glow(CL[0], CL[1], 420, '#FFF1C8', .6 * Math.exp(-age * 2.5));
      for (let i = 0; i < 9; i++) {
        const a = -Math.PI * (.04 + .92 * i / 8) + (hash(i) - .5) * .25, v = 330 + 220 * hash(i + 3), k = age;
        const x = CL[0] + Math.cos(a) * v * k + (i % 2 ? 1 : -1) * 40 * Math.sin(k * 3), y = CL[1] + Math.sin(a) * v * .55 * k - 40 * k * k + 30 * Math.sin(k * 6 + i);
        const sc = (1.1 + .5 * hash(i + 7)) * (1 - .35 * seg(k, .4, 1.8)), flap = Math.sin(t * 22 + i * 1.7);
        if (k < 2.2) bird(x, y, sc, flap, Math.cos(a) < 0 ? Math.PI + .2 : -.2, i % 3 === 1 ? '#FFE3EC' : '#FFFDF6');
      }
      for (let i = 0; i < 16; i++) {
        const a = TAU * hash(i + 30), v = 90 + 120 * hash(i + 31), k = Math.min(age, 1.8);
        const x = CL[0] + Math.cos(a) * v * (1 - Math.exp(-k * 3)) / 1 + Math.sin(t * 1.5 + i) * 18 * k, y = CL[1] + Math.sin(a) * v * .6 * (1 - Math.exp(-k * 3)) - 50 * k;
        fluff(x, y, 1.2 + .6 * hash(i + 32), Math.sin(t * 1.3 + i) * .4);
      }
      sfx('噗', CL[0] + 150, CL[1] - 110, 110, '#F58CA8', age - .02, { life: 1.1, rot: -.12 });
    }
    camEnd();
    if (dim > .01) grade(dim, 'multiply', '#8E93B4');
    if (t > S6T.poke) flash(.35 * Math.exp(-(t - S6T.poke) * 5), '#FFF4E0');
  }

  // ======================================================================================
  // 7 · 95.556–100.956  哪怕只改变 世界小小的一段
  // One continuous pull-back: her warm open window (she and 桃桃 wave) → her apartment block → a dark city where only
  // her window has colour → the night Earth (a little planet) with one small pink light, which twinkles on the beat.
  // World units: the planet is a circle of radius R7 centred at (0, R7), so the street at her door is y = 0. Drawing is
  // in screen space through S() with level of detail per zoom, so linework stays crisp at every scale.
  // ======================================================================================
  const R7 = 45000, WIN7 = { x: -35, y: -864, w: 70, h: 77 }, NW = 900, NH = 990;       // her window; native interior size
  const W7c = [WIN7.x + WIN7.w / 2, WIN7.y + WIN7.h / 2];
  const K7 = [[95.556, 2.36], [96.15, 2.24], [96.9, 1.1], [97.6, -.3], [98.3, -1.7], [99.0, -2.95], [99.7, -4.1], [100.4, -4.62], [100.956, -4.72], [101.6, -4.76]];
  function spline(t, keys) {                                           // Catmull-Rom through (time, value) keys, clamped
    if (t <= keys[0][0]) return keys[0][1]; const n = keys.length; if (t >= keys[n - 1][0]) return keys[n - 1][1];
    let i = 0; while (t >= keys[i + 1][0]) i++;
    const [t0, p0] = keys[i], [t1, p1] = keys[i + 1], h = t1 - t0, u = (t - t0) / h;
    const m = j => j <= 0 ? (keys[1][1] - keys[0][1]) / (keys[1][0] - keys[0][0]) * .5 : j >= n - 1 ? (keys[n - 1][1] - keys[n - 2][1]) / (keys[n - 1][0] - keys[n - 2][0]) * .5 : (keys[j + 1][1] - keys[j - 1][1]) / (keys[j + 1][0] - keys[j - 1][0]);
    const m0 = m(i) * h, m1 = m(i + 1) * h, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * p0 + (u3 - 2 * u2 + u) * m0 + (-2 * u3 + 3 * u2) * p1 + (u3 - u2) * m1;
  }
  // the dark city: buildings standing radially on the planet, deterministic
  const CITY7 = [];
  for (const dir of [-1, 1]) { let u = 380; for (let i = 0; u < 7200; i++) { const k = dir * 50 + i, w = 360 + 520 * hash(k * 3.7), h = 420 + 1850 * Math.pow(hash(k * 5.9), 1.4) * (1 - .5 * seg(u, 3000, 7200)); u += 30 + 150 * hash(k * 1.3); CITY7.push({ u: dir > 0 ? u + w / 2 : -u - w / 2, w, h, k, roof: hash(k * 8.1) }); u += w; } }
  function zoomOut(t, lt) {
    const L = spline(t, K7), Z = Math.exp(L), bp = bpOf(t);
    const wE = ease(seg(L, -2.6, -4.72)), th = -.32 * wE;                                // drift to the planet's centre, turning a little
    const off = [0, 70 / Math.max(Z, 1e-3) * seg(L, 1.2, 2.3)];                          // at the start keep the window clear of the lyric band
    const C = [lerp(W7c[0] + off[0], 0, wE), lerp(W7c[1] + off[1], R7, wE)];
    const ct = Math.cos(th), st = Math.sin(th);
    const S = (x, y) => { const dx = x - C[0], dy = y - C[1]; return [960 + Z * (dx * ct - dy * st), 540 + Z * (dx * st + dy * ct)]; };
    const surf = (u, hgt = 0) => { const ph = u / R7, r = R7 + hgt; return [Math.sin(ph) * r, R7 - Math.cos(ph) * r]; };
    // ---- sky / space ----
    const spaceK = seg(L, -1.5, -3.8);
    paint(rectPts(-40, -40, W + 80, H + 80), { grad: [mixCol('#171B3E', '#0E1130', spaceK), mixCol('#34356A', '#1A1C46', spaceK), Math.PI / 2], ink: null });
    starField(t, { x: 0, y: 0, w: W, h: H }, Math.round(40 + 60 * spaceK), { seed: 17, a: .5 + .5 * spaceK });
    if (spaceK > .01) fadeIn(spaceK, () => { for (let i = 0; i < 5; i++) glow(200 + i * 380, 180 + 120 * Math.sin(i * 1.7), 260, ['#6E5BA8', '#3E5A9E', '#8A5A96'][i % 3], .18); });
    // ---- the planet ----
    const E = S(0, R7), rs = R7 * Z;
    if (rs < 4000) {
      glow(E[0], E[1], rs * 1.28, '#7A8CE0', .35 * seg(L, -2.5, -4));
      const pts = []; for (let i = 0; i < 180; i++) { const a = i / 180 * TAU; pts.push([E[0] + Math.cos(a) * rs, E[1] + Math.sin(a) * rs]); }
      paint(pts, { grad: ['#34488E', '#141B44', th + Math.PI / 2 + .7], ink: null });
      clipTo(pts, () => {
        // night-side land, soft cloud bands, moonlit rim and the shadowed side
        const lands = [[-.95, .5, .42], [.4, .55, .34], [2.0, .5, .5], [3.3, .38, .36], [4.5, .6, .4], [5.5, .25, .26]];
        for (const [a0, rr, sz] of lands) { const bl = []; for (let j = 0; j < 16; j++) { const a = j / 16 * TAU, q = rs * sz * .45 * (1 + .22 * Math.sin(a * 3 + a0 * 5) + .1 * Math.sin(a * 7 + a0)); const cx0 = Math.cos(a0 - Math.PI / 2 + th) * rs * rr, cy0 = Math.sin(a0 - Math.PI / 2 + th) * rs * rr; bl.push([E[0] + cx0 + Math.cos(a) * q, E[1] + cy0 + Math.sin(a) * q * .8]); } paint(bl, { wash: '#2B4A72', washOp: 170, ink: '#3E6290', sw: clamp(rs / 500, .2, 1), br: 'fine', curv: .5 }); }
        for (let j = 0; j < 5; j++) { const a = -2.4 + j * 1.25 + th + t * .02, d = rs * (.3 + .13 * j); paint(cloudPts(E[0] + Math.cos(a) * d, E[1] + Math.sin(a) * d, rs * (.36 - .03 * j), rs * .045, j + 3, 5), { wash: '#DDE6FF', washOp: 26, ink: null, curv: .5 }); }
        glow(E[0] - rs * .45, E[1] - rs * .5, rs * 1.1, '#9FB4F0', .24);
        glow(E[0] + rs * .62, E[1] + rs * .7, rs * 1.25, '#070A22', .75);
      });
      paint(pts, { ink: '#9FB0F0', sw: clamp(rs / 260, .5, 1.6), br: 'fine' });
    } else {
      // close to the ground: only the visible arc, closed far below
      const ph0 = Math.atan2(C[0], R7 - C[1]), dph = Math.min(Math.PI, 1600 / Z / R7 * 1.4), pts = [];
      for (let i = 0; i <= 60; i++) { const ph = ph0 - dph + 2 * dph * i / 60; pts.push(S(Math.sin(ph) * R7, R7 - Math.cos(ph) * R7)); }
      const inner = []; for (let i = 60; i >= 0; i--) { const ph = ph0 - dph + 2 * dph * i / 60; inner.push(S(Math.sin(ph) * (R7 - 60), R7 - Math.cos(ph) * (R7 - 60))); }
      const far = S(0, R7 * .5);
      paint([...pts, [far[0] + 5000, far[1] + 5000], [far[0] - 5000, far[1] + 5000]], { wash: '#141836', ink: null });
      paint([...pts, ...inner], { wash: '#2A2E52', ink: Z > .08 ? PAL.ink : null, sw: 1, br: 'fine' });
    }
    // ---- the dark city ----
    const vis = (x, y, r) => { const p = S(x, y); return p[0] > -r && p[0] < W + r && p[1] > -r && p[1] < H + r; };
    for (const b of CITY7) {
      const base = surf(b.u); if (!vis(base[0], base[1] - b.h / 2, (b.h + b.w) * Z)) continue;
      const P = S(base[0], base[1]); push(); translate(P[0], P[1]); rotate(th + b.u / R7); scale(Z);
      const col = mixCol('#262A50', '#1E2246', hash(b.k * 2.2));
      const top = b.roof > .72 ? [[-b.w / 2, -b.h], [0, -b.h - b.w * .35], [b.w / 2, -b.h]] : b.roof > .5 ? [[-b.w / 2, -b.h], [-b.w * .2, -b.h], [-b.w * .2, -b.h - 120], [b.w * .2, -b.h - 120], [b.w * .2, -b.h], [b.w / 2, -b.h]] : [[-b.w / 2, -b.h], [b.w / 2, -b.h]];
      paint([[-b.w / 2, 4], ...top, [b.w / 2, 4]], { wash: col, ink: Z > .06 ? PAL.ink : null, sw: .7 / Z });
      if (70 * Z > 1.6) { const cols = Math.floor((b.w - 40) / 120), rows = Math.floor((b.h - 60) / 110); for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (hash(b.k * 97 + r * 13 + c * 7) > .25) fillRectA(-b.w / 2 + 40 + c * (b.w - 80) / Math.max(1, cols - 1 || 1) - (cols > 1 ? 30 : -b.w / 2 + 70), -b.h + 60 + r * 110, 60, 70, '#343A68', .9); }
      pop();
    }
    // ---- her building ----
    {
      const P = S(0, 0); push(); translate(P[0], P[1]); rotate(th); scale(Z);
      const sw = .8 / Z;
      paint([[-360, 4], [-360, -1320], [360, -1320], [360, 4]], { wash: '#2E3160', ink: Z > .05 ? PAL.ink : null, sw });
      if (Z > .05) {
        paint(rectPts(-380, -1345, 760, 30), { wash: '#3B3F72', ink: PAL.ink, sw });
        paint(rectPts(140, -1470, 150, 125, 0), { wash: '#343866', ink: PAL.ink, sw });                // water tank
        inkLine([[140, -1470], [215, -1520], [290, -1470]], .7 / Z, PAL.ink, 'fine', 0);
        inkLine([[-200, -1345], [-200, -1520]], .8 / Z, '#4A4E80', 'marker', 0); inkLine([[-240, -1480], [-160, -1480]], .6 / Z, '#4A4E80', 'marker', 0);
        paint(rectPts(-70, -96, 140, 96), { wash: '#1E2244', ink: PAL.ink, sw });                          // door
      }
      if (70 * Z > 1.2) for (let f = 1; f <= 11; f++) for (let c = -2; c <= 2; c++) {
        if (f === 7 && c === 0) continue;
        const x = c * 140 - 35, y = -(f + 1) * 110 + 16;
        fillRectA(x, y, 70, 77, '#1B1F42', 1);
        if (70 * Z > 14) { paint(rectPts(x, y, 70, 77), { ink: '#4A4E80', sw: .5 / Z, br: 'fine' }); fillRectA(x - 6, y + 77, 82, 7, '#474B7C', 1); paint([[x + 8, y + 8], [x + 26, y + 8], [x + 12, y + 50], [x + 4, y + 50]], { wash: '#2C3262', ink: null }); }
      }
      if (Z > .12) { inkLine([[470, 0], [470, -330]], 1.8 / Z * Math.min(1, Z), '#3A3E6C', 'marker', 0); paint(rectPts(462, -350, 40, 22), { wash: '#3A3E6C', ink: null }); }
      pop();
    }
    // ---- her window: the warm room inside (drawn natively), frame, curtains, light ----
    const wpx = WIN7.w * Z, wTL = S(WIN7.x, WIN7.y);
    if (wpx > 24) {
      push(); translate(wTL[0], wTL[1]); rotate(th); scale(wpx / NW);
      clipTo(rectPts(0, 0, NW, NH), () => {
        paint(rectPts(-10, -10, NW + 20, NH + 20), { grad: ['#F7C3A6', '#EE9FB0', Math.PI / 2], ink: null });
        glow(160, 120, 520, '#FFE2A8', .6);
        for (let i = 0; i < 7; i++) { const x = 60 + i * 130, y = 90 + 26 * Math.sin(i * 1.3); glow(x, y, 40, ['#FFD98A', '#FFB3C6', '#BFF0E0'][i % 3], .7); dot(x, y, 9, ['#FFE7A8', '#FFC9D8', '#D6FFF2'][i % 3]); }
        inkLine(Array.from({ length: 8 }, (_, i) => [i * 130, 80 + 26 * Math.sin(i * 1.3) - 8]), .8, PAL.ink, 'fine', .5);
        if (wpx > 120) {
          const wave = Math.sin(bp * Math.PI), md = mood(t, [[95.4, 'happy', null, 'open'], [96.3, 'sparkle', null, 'smile']]);
          hero(320, 1175, 82, { outfit: 'home', ...md, aR: .2 + .3 * Math.abs(wave), aL: -1.2, lookX: .1, blush: .8, tilt: .06 * wave, noShadow: true });
          cat(535, 994, 30, { pose: 'loaf', eyes: 'happy', noShadow: true, tail: Math.sin(t * 3) * .4 });
          momo(690, 990 + 1.5 * 46, 46, { eyes: 'happy', mouth: 'open', sit: true, walk: t * 1.3, aR: .25 + .35 * Math.abs(Math.sin(bp * Math.PI * 1)), aL: -1.1, tilt: -.1 * wave, blush: 1, noShadow: true });
        }
      });
      // curtains, frame and sill
      clipTo(rectPts(0, 0, NW, NH), () => { for (const sd of [-1, 1]) { const x0 = sd < 0 ? -30 : NW + 30, x1 = sd < 0 ? 120 : NW - 120; paint([[x0, -30], [x1, -30], [x1 - sd * 20, 380], [x0 - sd * 40, 560], [x0, 1000]], { wash: '#F29BB8', fill: '#E27A92', fillOp: 70, tex: .3, ink: PAL.ink, sw: 1.2, curv: .35 }); } });
      paint([[-40, -40], [NW + 40, -40], [NW + 40, NH + 40], [-40, NH + 40], [-40, -40], [0, 0], [0, NH], [NW, NH], [NW, 0], [0, 0]], { wash: '#F3E6D2', ink: null });
      paint(rectPts(-40, -40, NW + 80, NH + 80), { ink: PAL.ink, sw: 1.6 }); paint(rectPts(0, 0, NW, NH), { ink: PAL.ink, sw: 1.2 });
      paint(rectPts(-70, NH + 10, NW + 140, 44, 2), { wash: '#F8EEDF', fill: '#D9C6AE', fillOp: 80, tex: .3, ink: PAL.ink, sw: 1.3 });
      pop();
    }
    // the one warm light in the dark: spill glow, then a tiny pink point
    const wc = S(W7c[0], W7c[1]), gr = Math.max(wpx * 1.4, 26);
    glow(wc[0], wc[1], gr * 1.6, '#FF9FC0', wpx > 200 ? .25 : .55);
    if (wpx < 30) { glow(wc[0], wc[1], Math.max(10, gr * .45), '#FFE3EE', .9); dot(wc[0], wc[1], Math.max(2.4, wpx * .45), '#FFD2E2', 1); }
    // 叮: it twinkles on the beat
    const T7 = B(167), tw = seg(t, T7 - .05, T7 + .7);
    if (tw > 0 && tw < 1) {
      sparkle(wc[0], wc[1], 70, '#FFF3F8', tw);
      const rr = 20 + 120 * easeOut(tw); paint(ellPts(wc[0], wc[1], rr, rr, 40), { ink: '#FFC9DC', sw: 1.2 * (1 - tw), br: 'fine' });
    }
    if (t > T7 + .5) sparkle(wc[0] + 3, wc[1] - 2, 16, '#FFFFFF', frac((t - T7) * .9));
    // the sleepy crescent keeps watch at the end
    const mk = seg(L, -3.6, -4.5);
    if (mk > .01) fadeIn(mk, () => moonFace(1600, 230, 64, { rot: -.35 }));
  }

  // ======================================================================================
  // 8 · 100.956–105.756 (+ held into chapter 5's page turn)  至少这一行 要由我说了算
  // Top-down on the sketchbook: her hand writes one line that glows gold. The jade 完 seal peeks in hopefully, but she
  // lifts her own little seal (a tiny 桃桃 knob) and stamps it on the beat: a pink print with 桃桃's face. 桃桃 cheers.
  // ======================================================================================
  const S8T = { w0: 101.1, w1: 102.85, swap0: 102.9, swap1: 103.35, peek0: 103.0, lift: 103.7, stamp: B(174), up: B(174) + .35 };
  const RP8 = { x: 970, y: 225, w: 460, h: 630 }, LINE8 = { x0: 1000, x1: 1268, y: 600 };
  const PRINT8 = [1356, LINE8.y + 6];
  // 桃桃's face in seal-print lines (cream on the red square)
  function momoPrint(x, y, sc, k, rot = 0) {
    if (k <= .01) return;
    push(); translate(x, y); rotate(rot); scale(sc);
    paint(rrPts(-56, -56, 112, 112, 12), { wash: '#E2557F', washOp: 230 * k, fill: '#C63F68', fillOp: 70 * k, tex: .8, ink: null });
    fadeIn(k, () => {
      const c = '#FFF3E8';
      paint(ellPts(0, 6, 28, 26, 22), { ink: c, sw: 1.3 });
      for (const sd of [-1, 1]) paint(ellPts(sd * 36, 14, 10, 20, 12, 0, sd * .25), { ink: c, sw: 1.1 });
      for (const sd of [-1, 1]) paint(starPts(sd * 10, 4, 5, .45, 4, 0), { wash: c, ink: null });
      inkLine([[-8, 16], [0, 21], [8, 16]], .9, c, 'ink', .5);
      inkLine([[0, -20], [4, -30], [0, -38]], .9, c, 'ink', .5); paint(starPts(0, -42, 7, .45, 5), { wash: c, ink: null });
      inkLine([[-22, -10], [-10, -18], [0, -12], [10, -18], [22, -10]], .9, c, 'ink', .4);
    });
    pop();
  }
  // her own little seal, seen from above: pink body, a tiny 桃桃 head as the knob; h = lift height (0 = on the paper)
  function mySeal(x, y, h, sq = 0) {
    const sc = 1 + h * .0012;
    paint(ellPts(x + 22 + h * .35, y + 26 + h * .45, 62 - h * .03, 52 - h * .03, 20), { wash: PAL.ink, washOp: 60 - h * .06, ink: null });
    push(); translate(x, y - h * .25); scale(sc * (1 + sq * .3), sc * (1 - sq * .3));
    paint(rrPts(-50, -44, 100, 96, 22), { wash: '#F6B3C6', fill: '#E88AA6', fillOp: 70, tex: .4, ink: PAL.ink, sw: 1.1 });
    paint(rrPts(-40, -34, 80, 72, 16), { wash: '#FBD3DE', ink: PAL.ink, sw: .7 });
    momo(0, 36, 7.2, { eyes: 'happy', mouth: 'smile', noShadow: true, blush: 1, aL: -1.2, aR: -1.2 });
    pop();
  }
  function myLine(t, lt) {
    const bp = bpOf(t), stampAge = t - S8T.stamp;
    const z = kf(t, [[100.956, 1.42], [S8T.w1, 1.34], [S8T.lift, 1.2], [S8T.stamp, 1.24], [106.4, 1.14]], easeInOut) + (stampAge > 0 && stampAge < .3 ? .03 * Math.exp(-stampAge * 12) : 0) + .008 * pulse(t, 6);
    const cx = kf(t, [[100.956, 1110], [S8T.w1, 1200], [S8T.lift, 1170], [106.4, 1080]], easeInOut), cy = kf(t, [[100.956, 470], [S8T.w1, 480], [S8T.lift, 500], [106.4, 490]], easeInOut);
    const [shx, shy] = shakeXY(t, stampAge > 0 && stampAge < .3 ? 7 * Math.exp(-stampAge * 12) : 0);
    camBegin(cx + shx, cy + shy, z);
    // the golden line
    const wk = easeInOut(seg(t, S8T.w0, S8T.w1)), xe = lerp(LINE8.x0, LINE8.x1, wk);
    const G = scrawl(LINE8.x0, LINE8.x0, xe, LINE8.y, { seed: 8, a: 7.5, b: 12, h: .8, per: 7, gap: .1 });
    deskTop(t, {
      lamp: 1,
      page: (r, sd) => {
        if (sd < 0) {
          // her earlier lines, in pencil, and a little 桃桃 study
          sketch(1, () => { for (let k = 0; k < 7; k++) { const L0 = scrawl(r.x + 36, r.x + 36, r.x + 36 + 300 + 80 * hash(k * 3.3), r.y + 90 + k * 64, { seed: 20 + k, a: 6, b: 8, h: .7, per: 6 }); for (const st of L0.strokes) inkLine(st, .7, PAL.ink, 'pencil', 0); } });
          return;
        }
        // soft ruled lines, then the gold line glowing as it goes
        for (let k = 0; k < 8; k++) inkLine([[r.x + 24, r.y + 80 + k * 70], [r.x + r.w - 24, r.y + 80 + k * 70]], .45, '#C9DBEE', 'fine', 0, .8);
        if (G.strokes.length) {
          const shimmer = t > S8T.w1 ? frac((t - S8T.w1) * .6) : -1;
          for (const st of G.strokes) { for (let i = 0; i < st.length; i += 5) glow(st[i][0], st[i][1], 44, '#FFC94A', .2); }
          for (const st of G.strokes) { inkLine(st, 3.2, '#B8741A', 'ink', 0); inkLine(st, 1.6, '#F2B53C', 'marker', 0); inkLine(st, .6, '#FFF6D0', 'fine', 0, .9); }
          if (shimmer >= 0) { const sx = lerp(LINE8.x0 - 40, LINE8.x1 + 60, shimmer); light(sx, LINE8.y - 8, 90, '#FFE9A8', .55); }
        }
        // the print, when it lands
        if (stampAge > 0) { const k = seg(stampAge, 0, .12); momoPrint(PRINT8[0], PRINT8[1], .95, k, -.05); }
      },
      items: tt => {
        // the soda can from above, eraser crumbs
        paint(ellPts(330, 330, 70, 70, 24), { wash: '#F8B99A', ink: PAL.ink, sw: 1.1 }); paint(ellPts(330, 330, 56, 56, 22), { wash: '#DADCE6', ink: PAL.ink, sw: .8 });
        paint(rrPts(314, 300, 32, 20, 8), { wash: '#B8BCCB', ink: PAL.ink, sw: .6 }); paint(ellPts(330, 350, 10, 8, 10), { wash: PAL.ink, washOp: 120, ink: null });
        for (let i = 0; i < 5; i++) paint(ellPts(1490 + hash(i) * 90, 260 + hash(i + 3) * 70, 7, 4, 8, 0, hash(i) * 3), { wash: '#F6B3C6', ink: PAL.ink, sw: .4 });
      }
    });
    // sparkles riding the pen tip; a burst when the stamp lands
    if (t > S8T.w0 && t < S8T.w1 + .1) for (let i = 0; i < 3; i++) sparkle(G.tip[0] + 18 * Math.sin(t * 9 + i * 2), G.tip[1] - 20 - 18 * i, 12, '#FFF3C0', frac(t * 2.2 + i * .33));
    if (stampAge > 0) {
      const k = seg(stampAge, 0, .5);
      if (k < 1) { const rr = 60 + 130 * easeOut(k); paint(ellPts(PRINT8[0], PRINT8[1], rr, rr, 40), { ink: '#F58CA8', sw: 2 * (1 - k), br: 'ink' }); }
      for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + .3; sparkle(PRINT8[0] + Math.cos(a) * 150 * easeOut(k), PRINT8[1] + Math.sin(a) * 150 * easeOut(k), 18, i % 2 ? '#FFF3C0' : '#FFD6E6', k); }
      confetti(t, S8T.stamp, PRINT8[0], PRINT8[1] - 20, 30, 11, { v: 800, life: 2.4 });
    }
    // 桃桃 on the desk beside the page: watches the line, bounces, cheers at the stamp
    const cheer = stampAge > .05;
    const mmd = mood(t, [[100.8, 'sparkle', null, 'o'], [S8T.w1 + .1, 'happy', null, 'open'], [S8T.lift, 'star', null, 'o'], [S8T.stamp + .05, 'happy', 'heart', 'open']]);
    const mh = cheer ? Math.abs(Math.sin((t - S8T.stamp) / BEAT * Math.PI)) * 55 : Math.abs(Math.sin(bp * Math.PI)) * 8;
    const MX8 = lerp(1110, 1200, easeInOut(seg(t, S8T.w0, S8T.w1))), MY8 = 520;
    paint(ellPts(MX8, MY8 + 2, 64 - mh * .3, 16 - mh * .08, 16), { wash: PAL.ink, washOp: 55, ink: null });
    momo(MX8, MY8 - mh, 27, { ...mmd, noShadow: true, blush: 1, lookX: t < S8T.w1 ? .4 : .5, lookY: .6, aL: cheer ? 1.05 + .2 * Math.sin(t * 12) : -.9, aR: cheer ? 1.05 - .2 * Math.sin(t * 12) : -.9 + .4 * Math.abs(Math.sin(bp * Math.PI)) * (t < S8T.w1 ? 1 : 0), sq: cheer ? .08 * pulse(t, 8) : 0, tilt: cheer ? .12 * Math.sin(t * 6) : -.08 });
    // the jade 完 seal peeks in hopefully from the left, then droops and slides away
    const peek = smooth01(t, S8T.peek0, S8T.peek0 + .35, S8T.lift + .4, S8T.lift + .9);
    if (peek > 0) sealStamp(lerp(560, 760, easeOut(peek)), 900, .62, { face: t > S8T.lift ? 'sad' : 'stern', rot: .25 - .1 * peek + (t > S8T.lift ? .15 * Math.sin(t * 3) : 0) });
    // her hand: writing with the pencil, then coming back with her own seal to stamp it on the beat
    if (t < S8T.swap0 + .2) {
      const out = easeIn(seg(t, S8T.swap0 - .05, S8T.swap0 + .2)), inn = 1 - easeOut(seg(t, 100.956, S8T.w0));
      handTop(G.tip[0] + (out + inn) * 520, G.tip[1] + (out + inn) * 420, 1.05);
    }
    if (t > S8T.swap0 + .1) {
      const inK = easeOut(seg(t, S8T.swap0 + .1, S8T.swap1)), leave = easeInOut(seg(t, S8T.stamp + .12, S8T.up + .9));
      const sx = PRINT8[0] + (1 - inK) * 520 + leave * 520, sy = PRINT8[1] + (1 - inK) * 420 + leave * 420;
      let h = lerp(120, 60, inK);
      if (t > S8T.lift) h = lerp(60, 170, easeOut(seg(t, S8T.lift, S8T.stamp - .18)));
      if (t > S8T.stamp - .18) h = lerp(170, 0, easeIn(seg(t, S8T.stamp - .18, S8T.stamp)));
      if (t > S8T.stamp) h = lerp(0, 150, easeOut(seg(t, S8T.up - .2, S8T.up + .3)));
      const sq = stampAge > 0 && stampAge < .25 ? .25 * Math.exp(-stampAge * 14) : t > S8T.lift && t < S8T.stamp - .18 ? -.06 : 0;
      if (t < S8T.up + 1.1) {
        mySeal(sx, sy, h, sq);
        // the hand holding it
        push(); translate(sx + 40, sy - h * .25 + 20); scale(1 + h * .0012);
        paint([[40, 60], [300, 330], [400, 240], [130, -10]], { wash: PAL.mint, fill: '#7EA78E', fillOp: 60, tex: .4, ink: PAL.ink, sw: 1, curv: .25 });
        paint(ellPts(40, 30, 54, 44, 16, 0, .7), { wash: SKIN, ink: PAL.ink, sw: .9 });
        for (const [fx, fy] of [[0, -8], [-14, 14], [-6, 38]]) paint(ellPts(fx, fy, 16, 12, 10, 0, .6), { wash: SKIN, ink: PAL.ink, sw: .7 });
        pop();
      }
    }
    if (stampAge > 0) sfx('咚', PRINT8[0] + 60, PRINT8[1] - 150, 92, '#F58CA8', stampAge - .02, { life: 1.1, rot: .1 });
    camEnd();
    // warm light swelling into the hold; a pink bloom carries the Earth's little light in at the cut
    light(1180, 560, 900, '#FFE2B8', .18 * seg(t, S8T.stamp, S8T.stamp + 1));
    flash(.7 * (1 - easeOut(seg(t, 100.956, 101.3))), '#FFE3EE');
  }

  // ======================================================================================
  // placeholders for the shots still to paint
  // ======================================================================================
  const todo = name => (t, lt) => { dreamSky(t, lt * 60); letter(name, 960, 520, 90, PAL.rose, { font: 'kai' }); };
  

  chapter('chorus1', 67.356, 105.756, [[67.356, seal], [72.156, noTrade], [76.956, paintCity], [81.756, momoBorn], [86.556, crescent], [90.756, sighPop], [95.556, zoomOut], [100.956, myLine]]);
  transition(67.356, 'white', .6);
})();
