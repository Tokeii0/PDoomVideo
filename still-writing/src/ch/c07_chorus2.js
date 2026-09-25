// src/ch/c07_chorus2.js: 7 · 副歌二 (153.756–192.156). The second chorus: bigger, brighter, out in the real world.
// A 稿纸 road unrolls over the city while the seal hops after her · a giant balance tips for one small glowing heart ·
// she and 桃桃 paint colour through a cold office · windows light up with 桃桃 waving from little screens · star
// lanterns strung between the tips of the crescent · a flower umbrella turns the 算了 rain into petals · the peach soda
// can waters a sprout in a pavement crack · and she rides a giant pencil across the night, writing a glowing line.
(() => {
  const B = n => beatT(n);                              // beat 256 = 153.756 (chapter start), beat 320 = 192.156
  const INK = PAL.ink, CREAM = PAL.cream;

  // ---------- small private helpers ----------
  // world position of a body-local point (px, py) of a chibi drawn at (x, y, s) with pose o
  function bodyPt(x, y, s, o, px, py) {
    const sq = (o.sq || 0) + (o.take || 0), fx = (o.flip ? -1 : 1) * (o.sx ?? 1) * (1 + sq * .5), fy = (o.sy ?? 1) * (1 - sq);
    const lx = px * fx, ly = py * fy, r = o.rot || 0, c = Math.cos(r), sn = Math.sin(r);
    return [x + lx * c - ly * sn, y + ((o.dy || 0) + (o.bob || 0)) * s + lx * sn + ly * c];
  }
  // body-local centre of a hand for arm angle a (side -1 = screen-left arm, 1 = right)
  const handLocal = (s, side, a) => [side * (.95 * s + 1.87 * s * Math.cos(a)), -3.95 * s - 1.87 * s * Math.sin(a)];
  const handPt = (x, y, s, o, side) => { const [px, py] = handLocal(s, side, side < 0 ? (o.aL ?? -1.2) : (o.aR ?? -1.2)); return bodyPt(x, y, s, o, px, py); };
  // multi-stop vertical gradient over the whole frame (screen space)
  function skyGrad(stops, y0 = 0, y1 = H) {
    X.save(); X.setTransform(1, 0, 0, 1, 0, 0);
    const g = X.createLinearGradient(0, y0, 0, y1);
    for (const [k, c] of stops) g.addColorStop(k, c);
    X.globalAlpha = ALPHA; X.fillStyle = g; X.fillRect(-10, -10, W + 20, H + 20); X.restore();
  }
  // a hop: 0 at take-off, 1 at landing; returns [progress, height 0..1]
  const hopArc = u => [clamp(u), 4 * clamp(u) * (1 - clamp(u))];
  // soft dust / paper puff where something lands
  function puff(x, y, age, s = 1, col = CREAM) {
    if (age < 0 || age > .5) return;
    const k = age / .5;
    for (let i = 0; i < 5; i++) {
      const a = Math.PI + (i + .5) / 5 * Math.PI, d = (20 + 70 * easeOut(k)) * s;
      dot(x + Math.cos(a) * d * 1.4, y + Math.sin(a) * d * .45 - 8 * s, (10 + 10 * hash(i)) * s * (1 - k * .6), col, .8 * (1 - k));
    }
  }
  function speedLines(t, x, y, w, h, n, col, a = .5, dir = -1) {
    for (let i = 0; i < n; i++) {
      const yy = y + hash(i * 3.1) * h, ph = frac(hash(i * 7.7) + t * 2.2), xx = x + (dir < 0 ? (1 - ph) : ph) * w, len = 60 + 90 * hash(i * 1.3);
      inkLine([[xx, yy], [xx - dir * len, yy]], .8, col, 'fine', 0, a * Math.sin(ph * Math.PI));
    }
  }

  // =====================================================================================================
  // Shot 1 · 153.756–158.556 · 我还没写完 别急着替我落款
  // A strip of 稿纸 unrolls like a road high above the evening city. She runs along it dragging a big pencil that writes
  // a looping line behind her; the paper keeps unrolling ahead of her feet. The seal hops after her, landing on every
  // beat right where her pencil tip was a moment ago. 桃桃 rides her shoulder and pulls a face at it.
  // =====================================================================================================
  const RV = 320, RX0 = 700, ROADW = 150;                               // run speed, start x, visible paper width
  const roadY = x => 700 - (x - RX0) * .1 + 34 * Math.sin(x * .0033 + .4);
  const SPRINT = 3.3;                                                   // lt when she dashes off and leaves the seal behind
  const runX = lt => RX0 + RV * lt + 900 * easeIn(seg(lt, SPRINT, 4.9));
  const LA = 15, LB = 27, LC = 34, PEN = 150;                           // cursive loops (prolate cycloid); pen trails PEN behind her
  function penPt(u) { const th = u / LA, x = u - LB * Math.sin(th); return [x, roadY(x) + 40 - LC * (1 - Math.cos(th))]; }
  const penAt = lt => penPt(runX(lt) - PEN);
  function softCloud(x, y, w, h, col, seed, a = 1) {
    paint(cloudPts(x, y, w, h, seed, 6), { fill: col, fillOp: 150 * a, bleed: .12, tex: .35, border: .25, ink: null, curv: .4 });
    paint(cloudPts(x - w * .06, y - h * .25, w * .7, h * .55, seed + 3, 5), { fill: CREAM, fillOp: 70 * a, bleed: .15, tex: .2, border: 0, ink: null, curv: .4 });
  }
  function paperRoad(xL, xR, t) {
    const top = [], bot = [], edge = [];
    for (let x = xL; x <= xR; x += 40) { top.push([x, roadY(x) - ROADW / 2]); bot.push([x, roadY(x) + ROADW / 2]); }
    top.push([xR, roadY(xR) - ROADW / 2]); bot.push([xR, roadY(xR) + ROADW / 2]);
    for (let i = bot.length - 1; i >= 0; i--) edge.push([bot[i][0], bot[i][1] + 12]);
    for (let x = xL + 100; x < xR; x += 240) glow(x, roadY(x) + 40, 230, '#FFD9B0', .2);
    paint([...bot, ...edge], { wash: '#DCC3A4', ink: INK, sw: .9 });
    paint([...top, ...bot.slice().reverse()], { wash: '#FFF8EC', fill: '#F1DCC0', fillOp: 55, bleed: .03, tex: .35, border: .3, ink: INK, sw: 1.2 });
    // 稿纸 grid: a row of squares down the strip
    for (const off of [-50, 52]) { const p = []; for (let x = xL; x <= xR; x += 60) p.push([x, roadY(x) + off]); p.push([xR, roadY(xR) + off]); inkLine(p, .7, '#EAA3AE', 'fine', .3, .75); }
    for (let x = Math.ceil(xL / 102) * 102; x < xR - 10; x += 102) inkLine([[x, roadY(x) - 50], [x, roadY(x) + 52]], .55, '#EAA3AE', 'fine', 0, .6);
  }
  function paperRoll(x, t, ang) {
    const y = roadY(x), R = 46, yt = y - ROADW / 2 - 4, yb = y + ROADW / 2 - 14;
    paint(ellPts(x, yt, R, R * .45, 20), { wash: '#EFD9BC', ink: INK, sw: .9 });
    paint([[x - R, yt], [x + R, yt], [x + R, yb], [x - R, yb]], { wash: '#FFF8EC', fill: '#E3CDB0', fillOp: 90, tex: .3, ink: null });
    inkLine([[x - R, yt], [x - R, yb]], 1.1, INK, 'ink', 0); inkLine([[x + R, yt], [x + R, yb]], 1.1, INK, 'ink', 0);
    paint(ellPts(x, yb, R, R, 26), { wash: '#FFF4E2', fill: '#E3CDB0', fillOp: 70, ink: INK, sw: 1.1 });
    const sp = []; for (let i = 0; i < 44; i++) { const a = ang + i * .42, r = R * (.12 + .82 * i / 44); sp.push([x + Math.cos(a) * r, yb + Math.sin(a) * r]); }
    inkLine(sp, .7, '#B89A7A', 'fine', .5);
    paint(ellPts(x, yb, 7, 7, 8), { wash: '#B89A7A', ink: null });
  }
  // the seal: takes off just after each beat, lands on the next one right where her pen tip was a blink earlier
  const SEAL_END = 262;                                                 // its last landing: it gives up, panting
  function sealLandX(m) { const l = B(m) - 153.756; return penAt(l - .12)[0] - 30 - 70 * Math.max(0, m - 260); }
  function sealChase(t) {
    const bp = bpOf(t), n = Math.min(Math.floor(bp), SEAL_END), u = (bp - n - .18) / .82;
    const air = n < SEAL_END && u > 0 && u < 1, [pr, h0] = hopArc(u), hgt = air ? h0 : 0;
    const x = air ? lerp(sealLandX(n), sealLandX(n + 1), pr) : sealLandX(n);
    const big = n === 259, y = roadY(x) + 16 - hgt * (big ? 300 : 170);
    const since = t - B(n);
    let sq = !air ? .3 * Math.exp(-since * 12) : u < .5 ? -.16 * Math.sin(u * 2 * Math.PI) : .06 * Math.sin((u - .5) * 2 * Math.PI);
    const done = n >= SEAL_END;
    if (done) sq = .2 + .1 * Math.exp(-since * 10) + .03 * Math.sin(t * 16);                  // flopped, panting
    sealStamp(x, y, .85, { face: done ? 'sad' : 'stern', rot: air ? lerp(.22, -.14, pr) : done ? -.05 : 0, sq });
    if (!air) puff(x, roadY(x) + 18, since, 1.4);
    if (done) emote('sweat', x + 80, y - 175, 14, seg(since, .1, .4));
    return { x, y, air };
  }
  const penSparks = (t, lt) => {                                        // a twinkle left on the line at every beat
    for (let m = 257; m <= 264; m++) {
      const age = t - B(m); if (age < 0 || age > 1.1) continue;
      const [x, y] = penAt(B(m) - 153.756);
      sparkle(x + 8, y - 14, 20, '#FFF3C0', age / 1.1);
    }
  };
  function shotRoad(t, lt, dur) {
    const hx = runX(lt), hy = roadY(hx) + 10, out = easeInOut(seg(lt, SPRINT - .2, 4.9));
    const fx = Math.min(hx, runX(SPRINT)), zoom = lerp(lerp(1.28, 1.12, seg(lt, 0, SPRINT)), .84, out);
    const cx = fx + 110 + 230 * out, cy = roadY(fx) - 150 - 90 * out;
    // blue-hour sky, stars and soft clouds (screen space, slow parallax)
    skyGrad([[0, '#232A66'], [.32, '#4B4A98'], [.6, '#B385B8'], [.8, '#F0A6B4'], [1, '#F8C9A4']]);
    starField(t, { x: 0, y: 0, w: W, h: 460 }, 70);
    glow(1400, 900, 1000, '#FFD2A8', .35);
    const pc = (hx - RX0) * .1;
    [[200, 260, 420, 70, 3], [880, 150, 300, 50, 5], [1480, 330, 520, 80, 2], [2160, 220, 380, 60, 7]].forEach(([x, y, w, h, sd]) =>
      softCloud(((x - pc) % 2500 + 2500) % 2500 - 300, y + 14 * wob(t, .1, sd), w, h, '#E9B4CF', sd, .9));
    // the city far below
    const cz = lerp(1, zoom, .35);
    push(); translate(960, 1000); scale(cz); translate(-960 - (hx - RX0) * .28, -1000 + 40 - (roadY(hx) - roadY(RX0)) * .3);
    nightCity(t, { x0: -300, x1: 2900, y: 1150, color: .28, lit: .8 });
    pop();
    bokehField(t, { x: 0, y: 840, w: W, h: 240 }, 12, ['#FFC77A', '#FF9FB0', '#FFE7A8'], { a: .4, seed: 7, r: 30 });
    camBegin(cx, cy, zoom, -.035);
    const rollX = hx + 230;
    paperRoad(hx - 2300, rollX, t);
    // the looping line she has written: warm glow, then rose ink
    const u1 = runX(lt) - PEN, pts = [];
    for (let u = u1 - 3000; u <= u1; u += 5) pts.push(penPt(u));
    inkLine(pts, 6, '#FFD98A', 'marker', 0, .3);
    inkLine(pts, 2.3, '#D2527A', 'ink', 0);
    penSparks(t, lt);
    const pen = penPt(u1);
    sealChase(t);
    // her: running, dragging a pencil as big as she is; its tip is the pen point
    const bp = bpOf(t), S = 30;
    const md = mood(t, [[153.5, 'happy', null, 'grin'], [B(259.35), 'wide', '!', 'o'], [B(260.05), 'happy', 'spark', 'grin'], [B(262.4), 'sparkle', null, 'grin']]);
    const back = t > B(259.35) && t < B(260.1);
    const ho = { outfit: 'home', run: bp * (lt > SPRINT ? 1.4 : 1), dy: -Math.abs(Math.sin(bp * TAU)) * .5, rot: .1 + .06 * out, lookX: back ? -.8 : .55, lookY: -.1,
      aR: -.2 + .75 * Math.sin(bp * TAU), aL: -.5, blush: .7, ...md, ahoge: 'perk' };
    const hand = handPt(hx, hy, S, ho, -1);
    const dx = hand[0] - pen[0], dy = hand[1] - pen[1], L = Math.hypot(dx, dy);
    push(); translate(pen[0], pen[1]); rotate(Math.atan2(dx, -dy)); scale(clamp((L + 80) / 140, 1.4, 2.4));
    pencil(0, 0, 1, 0, '#8FD1C0');
    pop();
    glow(pen[0], pen[1], 46, '#FFE3A8', .7);
    hero(hx, hy, S, ho);
    // 桃桃 rides on top of her head, turned back toward the seal, pulling a face
    const seat = bodyPt(hx, hy, S, ho, -.55 * S, -9.25 * S), teasing = t > B(258.5) && t < B(262.6);
    const mm = mood(t, [[153.5, 'happy', null, 'smile'], [B(258.5), 'wink', null, 'open'], [B(262.6), 'happy', 'music', 'grin']]);
    momo(seat[0], seat[1], 15, {
      sit: true, noShadow: true, lookX: -.85, lookY: .2, rot: -.2 + .06 * Math.sin(bp * TAU), dy: -.25 * pulse(t, 5), ...mm, blush: .8,
      aL: teasing ? .85 + .4 * Math.sin(t * 25) : .5, aR: teasing ? 1.0 + .35 * Math.sin(t * 23 + 1) : -.2,
      head: teasing ? (s, sw) => paint([[-.36 * s, 1.36 * s], [.36 * s, 1.36 * s], [.32 * s, 2.1 * s], [0, 2.32 * s], [-.32 * s, 2.1 * s]], { wash: '#F58FA8', ink: INK, sw: sw * .5, curv: .5 }) : null
    });
    paperRoll(rollX, t, -(hx - RX0) / 46);
    if (lt > SPRINT) speedLines(t, hx - 650, hy - 330, 520, 300, 12, CREAM, .75 * seg(lt, SPRINT, SPRINT + .3));
    camEnd();
  }

  // =====================================================================================================
  // Shot 2 · 158.556–163.356 · 还有些喜欢 不愿拿去交换
  // A giant brass balance. One pan is heaped with coins, a trophy and a crown; she and 桃桃 sit in the other, high up,
  // holding one small glowing heart. She sets it down and — 咚 — the beam slams over to the heart's side, the treasure is
  // flung into the air and rains down, and the two of them sit swinging their legs beside the heart.
  // =====================================================================================================
  const THUMP = B(266), GOLD = '#F2C14E', GOLD_DK = '#C98F2A', BRASS = '#E7B458', BRASS_DK = '#A87330';
  const PIV = [960, 290], ARM = 560, HANG = 262;
  function beamAngle(t) {
    if (t < THUMP) return -.23 + .012 * Math.sin(t * 40) * seg(t, THUMP - .5, THUMP);              // trembles just before
    const a = t - THUMP; return lerp(-.23, .27, 1 - Math.exp(-a * 7) * Math.cos(a * 15));            // slam with a wobble
  }
  const beamEnd = (th, side) => [PIV[0] + side * ARM * Math.cos(th), PIV[1] + side * ARM * Math.sin(th)];
  const panAt = (th, side) => { const [x, y] = beamEnd(th, side); return [x, y + HANG]; };
  function balanceBody(t, th) {
    // base, pillar, pivot and beam
    paint(ellPts(960, 925, 300, 40, 28), { fill: '#3B2C5C', fillOp: 90, bleed: .2, tex: .2, border: .1, ink: null });
    paint([[780, 920], [1140, 920], [1090, 860], [830, 860]], { wash: BRASS, fill: BRASS_DK, fillOp: 80, tex: .5, ink: INK, sw: 1.3, curv: .2 });
    paint(ellPts(960, 860, 130, 26, 22), { wash: '#F5D38A', ink: INK, sw: 1.1 });
    paint(rrPts(938, PIV[1] + 20, 44, 850 - PIV[1], 14), { wash: BRASS, fill: BRASS_DK, fillOp: 70, tex: .5, border: .4, ink: INK, sw: 1.2 });
    inkLine([[948, PIV[1] + 40], [948, 840]], 2, '#FFE6A8', 'marker', 0, .6);
    for (const y of [420, 600, 780]) paint(rrPts(928, y, 64, 18, 8), { wash: '#F5D38A', ink: INK, sw: .9 });
    push(); translate(PIV[0], PIV[1]); rotate(th);
    paint(rrPts(-ARM - 10, -13, ARM * 2 + 20, 26, 13), { wash: BRASS, fill: BRASS_DK, fillOp: 70, tex: .5, border: .4, ink: INK, sw: 1.3 });
    inkLine([[-ARM + 20, -5], [ARM - 20, -5]], 2, '#FFE6A8', 'marker', 0, .55);
    for (const sd of [-1, 1]) {                                            // scroll curls at the ends
      const cp = []; for (let i = 0; i < 14; i++) { const a = i * .5, r = 22 - i * 1.3; cp.push([sd * (ARM - 10) + sd * Math.cos(a) * r * .9, -26 + Math.sin(a) * r]); }
      inkLine(cp, 1.6, BRASS_DK, 'ink', .5);
      paint(ellPts(sd * ARM, 0, 13, 13, 12), { wash: '#F5D38A', ink: INK, sw: .9 });
    }
    pop();
    paint(ellPts(PIV[0], PIV[1], 34, 34, 20), { wash: '#F5D38A', fill: BRASS_DK, fillOp: 60, tex: .4, ink: INK, sw: 1.2 });
    paint(starPts(PIV[0], PIV[1] - 70, 34, .45, 5), { wash: '#FFE59A', fill: GOLD, fillOp: 60, ink: INK, sw: 1 });
    glow(PIV[0], PIV[1] - 70, 90, '#FFE59A', .4);
  }
  function panStrings(th, side) {
    const [ex, ey] = beamEnd(th, side), [px, py] = panAt(th, side);
    for (const k of [-1, 1]) inkLine([[ex, ey], [px + k * 158, py]], 1.1, BRASS_DK, 'fine', 0);
    inkLine([[ex, ey], [px, py - 30]], .9, BRASS_DK, 'fine', 0, .7);
  }
  function panBack(th, side) {
    const [px, py] = panAt(th, side);
    paint(ellPts(px, py, 170, 34, 28), { wash: '#C98F3E', fill: '#8E5E2A', fillOp: 90, tex: .5, ink: INK, sw: 1.1 });
  }
  function panFront(th, side) {
    const [px, py] = panAt(th, side), b = [];
    for (let i = 0; i <= 16; i++) { const a = i / 16 * Math.PI; b.push([px + Math.cos(a) * 172, py + Math.sin(a) * 78]); }
    for (let i = 16; i >= 0; i--) { const a = i / 16 * Math.PI; b.push([px + Math.cos(a) * 172, py + Math.sin(a) * 34]); }
    paint(b, { wash: BRASS, fill: BRASS_DK, fillOp: 80, tex: .5, border: .4, ink: INK, sw: 1.2 });
    inkLine([[px - 120, py + 44], [px - 20, py + 62], [px + 80, py + 58]], 3, '#FFE6A8', 'marker', .5, .6);
  }
  function coin(x, y, r, rot, spin, col = GOLD) {
    const w = Math.abs(Math.cos(spin)) * r + r * .12;
    push(); translate(x, y); rotate(rot);
    paint(ellPts(0, 0, w, r, 14), { wash: col, fill: GOLD_DK, fillOp: 60, ink: INK, sw: .7 });
    if (w > r * .5) { paint(ellPts(0, 0, w * .62, r * .62, 12), { ink: GOLD_DK, sw: .5 }); dot(-w * .35, -r * .4, r * .16, '#FFF6D8', .9); }
    pop();
  }
  function trophy(x, y, s, rot) {
    push(); translate(x, y); rotate(rot); scale(s);
    for (const sd of [-1, 1]) inkLine([[sd * 30, -92], [sd * 58, -86], [sd * 54, -58], [sd * 26, -52]], 3.2, GOLD_DK, 'ink', .6);
    paint([[-38, -100], [38, -100], [30, -52], [0, -38], [-30, -52]], { wash: GOLD, fill: GOLD_DK, fillOp: 70, tex: .4, ink: INK, sw: 1, curv: .35 });
    paint(rectPts(-7, -40, 14, 26), { wash: GOLD, ink: INK, sw: .8 });
    paint(rrPts(-28, -16, 56, 16, 5), { wash: GOLD_DK, ink: INK, sw: .9 });
    paint(starPts(0, -76, 13, .45, 5), { wash: '#FFF1C0', ink: null });
    inkLine([[-24, -94], [-18, -60]], 2, '#FFF6D8', 'marker', 0, .7);
    pop();
  }
  function crown(x, y, s, rot) {
    push(); translate(x, y); rotate(rot); scale(s);
    paint([[-50, 0], [-56, -58], [-26, -30], [0, -66], [26, -30], [56, -58], [50, 0]], { wash: GOLD, fill: GOLD_DK, fillOp: 70, tex: .4, ink: INK, sw: 1.1 });
    for (const [gx, gc] of [[-28, PAL.rose], [0, PAL.teal], [28, PAL.rose]]) paint(ellPts(gx, -16, 7, 8, 8), { wash: gc, ink: INK, sw: .5 });
    for (const [px, py] of [[-56, -58], [0, -66], [56, -58]]) dot(px, py, 6, '#FFF1C0');
    pop();
  }
  // the treasure: each piece rests in the left pan, then is flung up when the pan snaps upward and rains down
  const LOOT = Array.from({ length: 26 }, (_, i) => ({
    kind: i === 0 ? 'trophy' : i === 1 ? 'crown' : 'coin', ox: i === 0 ? -60 : i === 1 ? 60 : (hash(i * 3.3) - .5) * 250, oy: i < 2 ? -70 : -20 - hash(i * 5.1) * 90,
    vx: i < 2 ? (i ? 520 : 330) : 280 + hash(i * 7.3) * 820, vy: -(820 + hash(i * 1.9) * 480), w: (hash(i * 2.2) - .5) * 14, r: 22 + hash(i * 4.4) * 10, sp: hash(i * 9.1) * 20
  }));
  const LAUNCH = THUMP + .08, FLOOR_Y = 930;
  function lootPos(p, t, th) {
    if (t < LAUNCH) { const [px, py] = panAt(th, -1); return [px + p.ox, py + p.oy, 0, 0]; }
    const a = t - LAUNCH, [lx, ly] = panAt(beamAngle(LAUNCH), -1), g = 2300;
    let x = lx + p.ox + p.vx * a, y = ly + p.oy + p.vy * a + .5 * g * a * a;
    const fl = FLOOR_Y + (hash(p.r) - .5) * 60, landed = y > fl;
    if (landed) y = fl;
    return [x, y, landed ? .9 * p.w : p.w * a, landed ? 1 : 0];
  }
  function treasureHeap(th, t) {
    if (t >= LAUNCH) return;
    const [px, py] = panAt(th, -1);
    paint([[px - 150, py + 4], [px - 110, py - 60], [px - 40, py - 104], [px + 40, py - 108], [px + 110, py - 62], [px + 150, py + 4]], { wash: GOLD, fill: GOLD_DK, fillOp: 90, bleed: .05, tex: .6, border: .5, ink: INK, sw: 1.1, curv: .5 });
    trophy(px - 58, py - 58, 1.05, -.14);
    for (let i = 0; i < 18; i++) { const u = hash(i * 3.7) - .5; coin(px + u * 270, py - 10 - hash(i * 6.1) * 80 * (1 - Math.abs(u) * 1.7), 17, u * .8, .3 + hash(i * 2) * .9); }
    crown(px + 58, py - 84, .95, .16);
    for (let i = 0; i < 4; i++) sparkle(px + (hash(i * 5.3) - .5) * 260, py - 60 - hash(i * 2.9) * 90, 16, '#FFF3C0', frac(t * .9 + hash(i)));
  }
  function glowHeart(x, y, r, t, k = 1) {
    const hb = 1 + .14 * pulse(t, 7) * k;
    glow(x, y, r * 5 * hb, '#FFB3C8', .55 * k);
    glow(x, y, r * 2.2, '#FFF1C2', .6 * k);
    paint(heartPts(x, y, r * hb), { wash: '#F57AA0', fill: '#E2557F', fillOp: 80, tex: .3, ink: INK, sw: .9 });
    paint(heartPts(x - r * .28, y - r * .3, r * .32 * hb), { wash: '#FFD3E0', ink: null });
  }
  function shotScale(t, lt, dur) {
    const th = beamAngle(t), a = t - THUMP;
    const [shx, shy] = shakeXY(t, a > 0 ? 16 * Math.exp(-a * 6) : 0);
    const push2 = easeInOut(seg(t, THUMP + .8, 163.5));
    const zoom = lerp(lerp(1.2, 1.26, seg(lt, 0, 1.2)), 1.6, push2), cx = lerp(lerp(1010, 960, seg(lt, 0, 1.2)), 1330, push2), cy = lerp(530, 590, push2);
    // backdrop: violet with a warm spotlight; bokeh and rays
    skyGrad([[0, '#3E3B86'], [.45, '#7C6BB8'], [.8, '#D99CC3'], [1, '#F2B8B4']]);
    camBegin(cx + shx, cy + shy, zoom, 0);
    glow(960, 380, 900, '#FFE3B0', .32);
    for (let i = 0; i < 5; i++) { const x = 560 + i * 200 + 40 * Math.sin(t * .4 + i); paint([[960 + (x - 960) * .1, -200], [x - 70, 1000], [x + 70, 1000]], { fill: '#FFE9C4', fillOp: 26, bleed: .1, tex: .2, border: 0, ink: null }); }
    bokehField(t, { x: -200, y: -100, w: 2300, h: 900 }, 16, ['#FFE3A8', '#FFB3C8', '#C9B8F0'], { a: .35, seed: 11, r: 34 });
    // floor: a soft glossy stage
    paint([[-600, 900], [2520, 900], [2520, 1700], [-600, 1700]], { wash: '#8C78C0', fill: '#6A5AA8', fillOp: 70, bleed: .04, tex: .5, border: .2, ink: INK, sw: 1 });
    glow(960, 930, 700, '#FFD9B0', .25);
    balanceBody(t, th);
    // left pan with the treasure
    panStrings(th, -1); panBack(th, -1); treasureHeap(th, t); panFront(th, -1);
    // right pan: the heart and the two of them
    panStrings(th, 1); panBack(th, 1);
    const [rx, ry] = panAt(th, 1);
    const place = seg(t, B(265), B(265.8));                                   // she lowers the heart into the pan
    const HX = rx, HY = ry - 36, heldX = rx - 20, heldY = ry - 120;
    if (t >= B(265.8)) glowHeart(HX, HY, 40, t, 1 + .5 * Math.exp(-Math.max(0, a) * 3));
    panFront(th, 1);
    // riders on the two ends of the rim: thrown up a little as the pan drops, then they land and kick their legs
    const air = a > 0 && a < .42 ? Math.sin(a / .42 * Math.PI) * 1.6 : 0, landSq = a > .42 && a < .8 ? .16 * Math.exp(-(a - .42) * 9) : 0;
    const settled = t > B(267.3), bp = bpOf(t);
    const hm = mood(t, [[158, 'sparkle', null, 'smile'], [B(265.2), 'happy', null, 'smile'], [THUMP, 'wide', '!', 'O'], [B(267), 'happy', 'heart', 'grin'], [B(269.5), 'closed', null, 'smile'], [B(270.6), 'happy', 'music', 'grin']]);
    const S = 26, seatY = ry + 16, holding = t < B(265.8);
    const ho = { outfit: 'home', walk: settled ? bp * .5 : null, dy: -air - (settled ? .1 * Math.abs(Math.sin(bp * Math.PI)) : 0), sq: landSq, lookX: holding ? .3 : .45, lookY: holding ? -.4 : .25,
      aL: holding ? lerp(1.15, .35, place) : air > 0 ? 1.2 : -.35, aR: holding ? lerp(1.0, .1, place) : air > 0 ? 1.3 : .3 + .1 * Math.sin(t * 3), blush: .8, ...hm, tilt: settled ? .1 + .06 * Math.sin(bp * Math.PI) : 0, rot: settled ? .04 : 0 };
    hero(rx - 132, seatY + 1.35 * S, S, { ...ho, noShadow: true });
    if (holding) glowHeart(lerp(heldX, HX, easeInOut(place)), lerp(heldY, HY, easeInOut(place)), 40, t, 1);
    const mmo = mood(t, [[158, 'normal', null, 'open'], [THUMP, 'wide', '!!', 'O'], [B(267.1), 'happy', 'music', 'grin'], [B(269.6), 'closed', null, 'cat'], [B(270.7), 'happy', 'heart', 'grin']]);
    const MS = 21;
    momo(rx + 134, seatY + 1.35 * MS, MS, { walk: settled ? bp * .5 + .25 : null, dy: -air * 1.2 - (settled ? .1 * Math.abs(Math.sin(bp * Math.PI + 1)) : 0), sq: landSq, noShadow: true, lookX: -.5, lookY: .25,
      aL: t < THUMP ? 1.1 + .3 * Math.sin(t * 18) : air > 0 ? 1.3 : .35, aR: t < THUMP ? 1.1 + .3 * Math.sin(t * 18 + 2) : air > 0 ? 1.2 : -.3, blush: .8, ...mmo, tilt: settled ? -.1 - .06 * Math.sin(bp * Math.PI) : 0, rot: settled ? -.04 : 0 });
    light(rx, ry - 70, 300, '#FFB3C8', .28);                         // the heart's glow on their faces
    // the flung treasure
    if (t >= LAUNCH) for (const p of LOOT) {
      const [x, y, rot, landed] = lootPos(p, t, th);
      if (y > 1400 || y < -1400) continue;
      if (p.kind === 'trophy') trophy(x, y, 1.05, rot);
      else if (p.kind === 'crown') crown(x, y, .9, rot);
      else if (landed) paint(ellPts(x, y, p.r, p.r * .38, 14), { wash: GOLD, fill: GOLD_DK, fillOp: 60, ink: INK, sw: .7 });
      else coin(x, y, p.r, rot, p.sp + (t - LAUNCH) * 14);
      if (!landed && t > LAUNCH && p.kind === 'coin' && hash(p.r * 3) > .5) sparkle(x + 20, y - 20, 12, '#FFF3C0', frac(t * 2 + hash(p.r)));
    }
    camEnd();
    if (a > 0) { flash(.35 * Math.exp(-a * 9), '#FFF3E0'); sfx('咚', 1500, 330, 150, '#F7C948', a, { life: 1.0, rot: -.1, stroke: INK }); }
  }

  // =====================================================================================================
  // Shot 3 · 163.356–168.156 · 给冷冰冰的日子 画一点柔软
  // Midnight in the cold white office: grey cubicles, humming tube lights, tired coworkers, the boss blowing big-talk
  // balloons at a whiteboard. She (office clothes) sweeps a big brush along the aisle with 桃桃 floating beside her; the
  // colour floods in behind the brush, and on each beat the next desk wakes up: flowers on the partitions, tube lights
  // turned into paper lanterns, cat-ear headbands and mugs of cocoa, and the boss's balloons become little animals.
  // =====================================================================================================
  const OF0 = 163.356, OF_DX = 440, OF_X0 = 460;
  const ofHero = t => 330 + 320 * (t - OF0);                            // her x in the aisle
  // the colour front surges one desk to the right on every beat from beat 273 (and rests between surges)
  const ofSurge = bp => { const n = Math.floor(bp), f = bp - n; return n + easeOut(clamp(f / .4)); };
  const ofFront = t => OF_X0 + OF_DX * (ofSurge(bpOf(t)) - 273);
  const ofPop = x => { const q = (x - OF_X0) / OF_DX + 273, n = Math.floor(q), fr = q - n; return B(n + .4 * (1 - Math.cbrt(1 - fr))); };
  const DESKS = [[900, 11], [1340, 4], [1780, 7], [2220, 2]];
  const BOSS_X = 2640;
  function ofTube(x, y, t, age) {
    if (age < 0) {                                                       // cold tube light with a harsh hum
      const hum = .75 + .25 * Math.sin(t * 50 + x);
      glow(x, y + 30, 260, '#DDF6F0', .3 * hum);
      inkLine([[x - 70, y - 60], [x - 70, y - 8]], .6, INK, 'fine', 0); inkLine([[x + 70, y - 60], [x + 70, y - 8]], .6, INK, 'fine', 0);
      paint(rrPts(x - 110, y - 10, 220, 20, 10), { wash: '#F4FFFB', ink: INK, sw: .9 });
      paint(rrPts(x - 118, y - 16, 236, 10, 4), { wash: '#C9CED6', ink: INK, sw: .7 });
      return;
    }
    const p = backOut(clamp(age / .35)), sw2 = Math.sin(t * 2.2 + x * .01) * .08, col = ['#F7A8B8', '#FFD08A', '#F6B38E', '#C9B8F0'][Math.floor(hash(x) * 4)];
    glow(x, y + 40, 300 * p, '#FFD9A0', .42);
    push(); translate(x, y - 60); rotate(sw2); scale(p);
    inkLine([[0, 0], [0, 62]], .7, INK, 'fine', 0);
    paint(ellPts(0, 100, 52, 44, 22), { wash: col, fill: mixCol(col, '#E07A5F', .3), fillOp: 60, tex: .3, ink: INK, sw: 1 });
    for (const k2 of [-.5, 0, .5]) inkLine([[k2 * 52, 60], [k2 * 60, 100], [k2 * 52, 140]], .5, mixCol(col, INK, .3), 'fine', .5, .7);
    paint(rrPts(-16, 50, 32, 10, 3), { wash: '#B04A5A', ink: INK, sw: .6 }); paint(rrPts(-16, 140, 32, 10, 3), { wash: '#B04A5A', ink: INK, sw: .6 });
    inkLine([[0, 150], [4, 175]], 1.2, '#B04A5A', 'ink', 0);
    pop();
    if (age < .5) sparkle(x + 40, y + 20, 26, '#FFF3C0', age / .5);
  }
  function ofWindow(x, y, w, h, t) {
    paint(rectPts(x, y, w, h), { grad: ['#1E2552', '#3B3F7A', Math.PI / 2], ink: null });
    for (let i = 0; i < 5; i++) { const bx = x + i * w / 5, bh = 60 + hash(i * 3.1 + x) * 120; paint(rectPts(bx, y + h - bh, w / 5 - 4, bh), { wash: '#2A3066', ink: null }); for (let r = 0; r < 4; r++) if (hash(i * 7 + r + x) > .45) fillRectA(bx + 12, y + h - bh + 14 + r * 26, 14, 9, '#FFD98A', .8); }
    for (let i = 0; i < 6; i++) dot(x + hash(i * 1.7 + x) * w, y + 20 + hash(i * 4.1 + x) * h * .35, 1.6, CREAM, .5 + .5 * Math.sin(t * 2 + i));
    paint(rectPts(x, y, w, h, 1), { ink: INK, sw: 1.2 });
    inkLine([[x + w / 2, y], [x + w / 2, y + h]], 3, '#E3E8EC', 'marker', 0); inkLine([[x, y + h * .5], [x + w, y + h * .5]], 3, '#E3E8EC', 'marker', 0);
  }
  function catEars(s, sw, k) {                                          // head hook: a cat-ear headband popping on
    if (k <= 0) return;
    push(); translate(0, -2.2 * s); scale(backOut(k));
    inkLine([[-2.5 * s, .6 * s], [-1.4 * s, -.55 * s], [0, -.8 * s], [1.4 * s, -.55 * s], [2.5 * s, .6 * s]], sw * 1.4, '#E2557F', 'marker', .5);
    for (const sd of [-1, 1]) { paint([[sd * .9 * s, -.7 * s], [sd * 1.5 * s, -2.1 * s], [sd * 2.1 * s, -.35 * s]], { wash: '#F9CEDC', ink: INK, sw: sw * .6 }); paint([[sd * 1.15 * s, -.75 * s], [sd * 1.5 * s, -1.6 * s], [sd * 1.8 * s, -.55 * s]], { wash: '#F29BB8', ink: null }); }
    pop();
  }
  function cocoaMug(s, sw, k, t) {                                      // hand hook: a mug of cocoa with steam
    if (k <= 0) return;
    push(); rotate(.25); scale(backOut(k) * 1.25); translate(.35 * s, 0);
    paint(rrPts(-.55 * s, -.7 * s, 1.1 * s, 1.2 * s, .2 * s), { wash: '#FFF1E0', ink: INK, sw: sw * .6 });
    paint(ellPts(0, -.66 * s, .5 * s, .14 * s, 10), { wash: '#8A5A44', ink: null });
    paint(ellPts(.66 * s, -.1 * s, .25 * s, .3 * s, 10), { ink: INK, sw: sw * .6 });
    paint(heartPts(0, -.05 * s, .28 * s), { wash: '#F29BB8', ink: null });
    for (const k2 of [-.2, .2]) inkLine([[k2 * s, -.9 * s], [k2 * s + .15 * s * Math.sin(t * 4 + k2 * 9), -1.4 * s], [k2 * s - .05 * s, -1.9 * s]], sw * .5, CREAM, 'fine', .6, .9);
    pop();
  }
  function ofDesk(x, seed, t) {
    const age = t - ofPop(x), k = clamp(age / .3), warm = age >= 0;
    // partition behind the coworker; flowers sprout along its top when warm
    const pc = warm ? ['#F9CEDC', '#FFE3B8', '#CDEBDD', '#E3D6F5'][seed % 4] : '#BFC4CC';
    paint(rectPts(x - 190, 420, 380, 290, 1), { wash: pc, fill: mixCol(pc, INK, .15), fillOp: 60, tex: .6, border: .3, ink: INK, sw: 1.1 });
    paint(rectPts(x - 196, 408, 392, 18, 1), { wash: warm ? '#E9DCCB' : '#9AA0AB', ink: INK, sw: .9 });
    if (!warm) for (let i = 0; i < 3; i++) paint(rectPts(x - 150 + i * 110, 470 + (i % 2) * 40, 70, 56, 1), { wash: '#E6E8EC', ink: INK, sw: .5 });
    else {
      stickyNote(x - 110, 500, .6, PAL.pinkLt, -.1, seed); stickyNote(x + 100, 540, .55, '#FFF1A8', .12, seed + 1);
      for (let i = 0; i < 5; i++) {
        const fx = x - 160 + i * 80, g = backOut(clamp((age - i * .05) / .3)), fy = 410 - 44 * g, col = ['#F29BB8', '#FFD08A', '#F7A8B8', '#C9B8F0', '#9ED8C4'][(i + seed) % 5];
        if (g <= 0) continue;
        inkLine([[fx, 412], [fx + 3, fy]], 1.4, '#6FA57E', 'ink', 0);
        paint(ellPts(fx + 12, fy + 18, 10 * g, 5 * g, 8, 0, -.5), { wash: PAL.sage, ink: null });
        for (let q = 0; q < 5; q++) { const an = q / 5 * TAU + t * .5; paint(ellPts(fx + 3 + Math.cos(an) * 9 * g, fy + Math.sin(an) * 9 * g, 7 * g, 7 * g, 8), { wash: col, ink: INK, sw: .4 }); }
        dot(fx + 3, fy, 5 * g, '#F6C85F');
      }
    }
    // the coworker
    const md = mood(t, [[OF0 - 1, seed === 4 ? 'sleepy' : 'tired', seed === 4 ? 'zzz' : null, seed === 7 ? 'yawn' : 'flat'], [ofPop(x), 'happy', ['heart', 'music', 'flower', 'spark'][seed % 4], 'open']]);
    const slump = warm ? 0 : .12;
    person(x, 735, 25, { seed, sit: true, ...md, blush: warm ? .8 : 0, rot: warm ? .04 * Math.sin(t * 3 + seed) : -slump * .3, tilt: warm ? .1 * Math.sin(bpOf(t) * Math.PI + seed) : .15,
      dy: warm ? -.2 * Math.abs(Math.sin(bpOf(t) * Math.PI)) : .25, aL: warm ? .5 + .35 * Math.sin(t * 7 + seed) : -.2, aR: warm ? -.35 : -.2,
      head: warm ? (s, sw) => catEars(s, sw, k) : null, handR: warm ? (s, sw) => cocoaMug(s, sw, clamp((age - .1) / .3), t) : null });
    // the desk and a laptop (lid toward us); the screen light on their face
    paint(rectPts(x - 230, 690, 460, 26, 1), { wash: warm ? '#E8C9A8' : '#B9BEC7', fill: warm ? DESK_DK : '#8C92A0', fillOp: 50, tex: .5, ink: INK, sw: 1.1 });
    paint(rectPts(x - 215, 716, 430, 150, 1), { wash: warm ? '#D9B48E' : '#A3A9B5', fill: warm ? DESK_DK : '#7D8494', fillOp: 45, tex: .5, ink: INK, sw: 1 });
    paint([[x - 40, 690], [x - 190, 690], [x - 182, 626], [x - 48, 626]], { wash: warm ? '#F4E4D4' : '#D5D9E0', ink: INK, sw: .9 });
    paint(ellPts(x - 115, 658, 10, 10, 10), { wash: warm ? '#F6A0B8' : '#AEB4C0', ink: null });
    light(x - 60, 610, 170, warm ? '#FFD9A0' : '#CFEFFF', .22);
  }
  function balloonShape(kind, x, y, s, col, t) {
    push(); translate(x, y + Math.sin(t * 2.4 + x) * 6); scale(s);
    inkLine([[0, 40], [8, 90], [-4, 140]], .7, INK, 'fine', .5);
    const o = { wash: col, fill: mixCol(col, INK, .18), fillOp: 50, tex: .3, ink: INK, sw: 1, curv: .35 };
    if (kind === 'rocket') { paint([[0, -70], [26, -30], [26, 30], [-26, 30], [-26, -30]], o); paint([[-26, 10], [-44, 42], [-22, 30]], o); paint([[26, 10], [44, 42], [22, 30]], o); paint(ellPts(0, -14, 10, 10, 10), { wash: '#DDE3EA', ink: INK, sw: .6 }); }
    else if (kind === 'arrow') { paint([[-14, 40], [-14, -20], [-40, -20], [0, -70], [40, -20], [14, -20], [14, 40]], o); }
    else if (kind === 'crown') { paint([[-44, 30], [-50, -30], [-22, 0], [0, -44], [22, 0], [50, -30], [44, 30]], o); }
    else if (kind === 'globe') { paint(ellPts(0, 0, 44, 44, 20), o); inkLine([[-44, 0], [44, 0]], .6, INK, 'fine', 0); paint(ellPts(0, 0, 18, 44, 14), { ink: INK, sw: .6 }); }
    // balloon animals (after the pop)
    else if (kind === 'dog') { for (const [bx, by, rx, ry] of [[-30, 0, 30, 16], [14, -2, 22, 16], [34, -26, 16, 14], [48, -44, 8, 18], [26, -46, 8, 18], [-34, 22, 6, 18], [-18, 22, 6, 18], [6, 22, 6, 18], [18, 22, 6, 18], [-58, -12, 14, 6]]) paint(ellPts(bx, by, rx, ry, 12), o); dot(40, -28, 3, INK); }
    else if (kind === 'bunny') { for (const [bx, by, rx, ry] of [[0, 10, 30, 26], [0, -30, 22, 20], [-10, -64, 8, 22], [10, -64, 8, 22]]) paint(ellPts(bx, by, rx, ry, 12), o); dot(-7, -32, 3, INK); dot(7, -32, 3, INK); }
    else if (kind === 'duck') { for (const [bx, by, rx, ry] of [[0, 10, 36, 22], [24, -24, 18, 18]]) paint(ellPts(bx, by, rx, ry, 12), o); paint([[40, -26], [58, -20], [40, -16]], { wash: '#FFB060', ink: INK, sw: .6 }); dot(28, -28, 3, INK); }
    else if (kind === 'cat') { paint(ellPts(0, 6, 30, 26, 14), o); paint(ellPts(0, -30, 26, 22, 14), o); for (const sd of [-1, 1]) paint([[sd * 10, -46], [sd * 22, -66], [sd * 26, -38]], o); dot(-9, -32, 3, INK); dot(9, -32, 3, INK); }
    pop();
  }
  // 桃桃's hops: from beside her, onto the first partition, then one partition per beat, the boss's head, the whiteboard
  const MOMO_STOPS = [[900, 410], [1340, 410], [1780, 410], [2220, 410], [BOSS_X + 10, 612], [2880, 334]];
  function ofMomo(t, hx) {
    const bp = bpOf(t), start = [hx - 170, 640 + 26 * Math.sin(t * 3)];
    const hopN = Math.floor(bp - 272.55);                                   // hop k goes to stop k (first one at 272.55)
    const f = bp - 272.55 - hopN;
    if (hopN < 0) return [start[0], start[1], 0, false];
    const k = Math.min(hopN, MOMO_STOPS.length - 1), a = k === 0 ? start : MOMO_STOPS[k - 1], b = MOMO_STOPS[k];
    if (hopN >= MOMO_STOPS.length) { const [x, y] = MOMO_STOPS[MOMO_STOPS.length - 1]; return [x, y, .05 * Math.sin(t * 9), false]; }
    const u = clamp(f / .8), air = u < 1, e = easeInOut(u);
    const x = lerp(a[0], b[0], e), y = lerp(a[1], b[1], e) - (k === 0 ? 160 : 120) * Math.sin(u * Math.PI);
    const land = f - .8, sq = air ? -.12 * Math.sin(u * Math.PI) : .25 * Math.exp(-land * 14);
    return [x, y, sq, air];
  }
  function shotOffice(t, lt, dur) {
    const hx = ofHero(t), front = ofFront(t), pan = easeInOut(seg(lt, -.2, dur + .2));
    const cx = lerp(900, 2360, pan), cy = lerp(560, 540, pan), zoom = lerp(1.0, .9, pan);
    skyGrad([[0, '#DDE6EA'], [1, '#C9D3DA']]);
    camBegin(cx, cy, zoom, 0);
    // back wall with night windows, ceiling strip
    paint(rectPts(-400, -300, 4200, 1020), { wash: '#EEF3F3', fill: '#D5E2E4', fillOp: 70, bleed: .04, tex: .45, border: .2, ink: null });
    for (let i = 0; i < 7; i++) ofWindow(160 + i * 520, 150, 340, 230, t);
    paint(rectPts(-400, -300, 4200, 330), { wash: '#E3ECEE', fill: '#C9D6DA', fillOp: 60, tex: .4, ink: null });
    inkLine([[-400, 30], [3800, 30]], 1.1, INK, 'fine', 0);
    // floor
    paint(rectPts(-400, 700, 4200, 700), { wash: '#C7CFD8', fill: '#A9B3C0', fillOp: 60, tex: .5, border: .2, ink: INK, sw: 1 });
    for (let i = 0; i < 26; i++) inkLine([[i * 160 - 300, 870], [i * 160 - 380, 1200]], .45, '#98A2AE', 'fine', 0, .6);
    inkLine([[-400, 870], [3800, 870]], .6, '#98A2AE', 'fine', 0, .7);
    // ceiling lights → paper lanterns
    for (let i = 0; i < 9; i++) { const x = 330 + i * 380; ofTube(x, 110, t, t - ofPop(x)); }
    // desks and coworkers
    DESKS.forEach(([x, seed]) => ofDesk(x, seed, t));
    // the boss at his whiteboard, blowing big-talk balloons that turn into balloon animals
    const ba = t - ofPop(BOSS_X), bw = ba >= 0;
    paint(rectPts(BOSS_X + 20, 330, 420, 280, 2), { wash: '#FBFCFC', ink: INK, sw: 1.2 });
    inkLine([[BOSS_X + 60, 560], [BOSS_X + 160, 500], [BOSS_X + 240, 520], [BOSS_X + 400, 380]], 2, bw ? '#E2557F' : '#6C7890', 'marker', .2);
    inkLine([[BOSS_X + 380, 380], [BOSS_X + 400, 380], [BOSS_X + 396, 402]], 2, bw ? '#E2557F' : '#6C7890', 'marker', 0);
    paint(rectPts(BOSS_X + 40, 612, 380, 10), { wash: '#B9BEC7', ink: INK, sw: .7 });
    for (const lx of [BOSS_X + 70, BOSS_X + 390]) inkLine([[lx, 620], [lx - 10, 860]], 2, '#8C92A0', 'marker', 0);
    const bm = mood(t, [[OF0 - 1, 'normal', null, 'open'], [ofPop(BOSS_X), 'wide', '!', 'O'], [ofPop(BOSS_X) + .55, 'happy', 'music', 'grin']]);
    const BO = { seed: 9, suit: true, top: '#5E6784', hair: '#3B3B3B', style: 'short', ...bm, aL: bw ? .5 + .3 * Math.sin(t * 9) : .2 + .3 * Math.sin(t * 5), aR: 1.15, lookX: .3, lookY: -.5, blush: bw ? .9 : .2,
      mouth: bw ? bm.mouth : (Math.sin(t * 18) > 0 ? 'open' : 'O'), dy: bw ? -.5 * Math.abs(Math.sin(bpOf(t) * Math.PI)) : 0 };
    person(BOSS_X, 880, 29, BO);
    const bh = handPt(BOSS_X, 880, 29, BO, 1);
    const kinds = [['rocket', 'dog', '#F7A8B8'], ['arrow', 'bunny', '#FFD08A'], ['crown', 'duck', '#9ED8C4'], ['globe', 'cat', '#C9B8F0']];
    kinds.forEach(([k1, k2, col], i) => {
      const bx = BOSS_X - 150 + i * 120 + 14 * Math.sin(t * 1.7 + i), by = 400 - (i % 2 ? 90 : 0) - (bw ? 20 * seg(ba, .1, 1.4) : 0), popK = clamp((ba - i * .06) / .12);
      inkLine([[bh[0], bh[1]], [lerp(bh[0], bx, .5) + 10, lerp(bh[1], by + 60, .5)], [bx, by + 40]], .6, INK, 'fine', .6, .8);
      if (!bw || popK < 1) balloonShape(k1, bx, by, lerp(1, 1.3, popK), '#D5D9E0', t);
      if (bw && popK > 0) balloonShape(k2, bx, by, 1.35 * backOut(clamp((ba - i * .06 - .06) / .3)), col, t);
      if (bw && ba - i * .06 > 0 && ba - i * .06 < .5) sparkle(bx, by, 40, '#FFF3C0', (ba - i * .06) / .5);
    });
    // the colour hasn't reached the right-hand side yet: desaturate it, with a wet watercolour edge
    const edge = []; for (let y = -320; y <= 1400; y += 40) edge.push([front + 26 * Math.sin(y * .012 + t * 4) + 14 * Math.sin(y * .031 - t * 3), y]);
    clipTo([...edge, [4400, 1400], [4400, -320]], () => { grade(.88, 'saturation', '#808080'); grade(.22, 'color', '#9FB6C8'); grade(.12, 'screen', '#DDF6F0'); });
    const surge = 1 - clamp(frac(bpOf(t)) / .5);
    if (bpOf(t) > 272.9) for (let i = 0; i < 12; i++) { const e = edge[4 + i * 3]; if (!e) continue; sparkle(e[0] - 20 - 40 * hash(i), e[1] + 20 * hash(i * 3), 16 + 10 * hash(i * 5), ['#FFF3C0', '#FFC9D8', '#C9F0E0'][i % 3], .15 + .7 * surge * hash(i * 7.7)); }
    // her with the big brush, and 桃桃 floating beside her
    const bp = bpOf(t), fb = frac(bp), sweep = fb < .28 ? easeOut(fb / .28) : 1 - easeInOut((fb - .28) / .72);   // a stroke on every beat
    const hm = mood(t, [[OF0 - 1, 'happy', null, 'grin'], [B(275), 'sparkle', 'spark', 'open'], [B(277.5), 'happy', 'music', 'grin']]);
    const ho = { outfit: 'office', walk: bp * .5, dy: -Math.abs(Math.sin(bp * Math.PI)) * .35, lookX: .6, aL: -.9 + .2 * Math.sin(bp * Math.PI), aR: .95 - 1.25 * sweep, blush: .7, ...hm, rot: .05 };
    const HS = 34, hy = 945;
    heroBrush(hx, hy, HS, ho, t, sweep, fb < .4);
    // 桃桃 hops along the partition tops at the colour front; flowers sprout where she lands
    const [mx, my, msq, mair] = ofMomo(t, hx);
    momo(mx, my, 24, { digital: .7, noShadow: true, sq: msq, lookX: .6, aL: mair ? 1.2 : .6 + .3 * Math.sin(t * 8), aR: mair ? 1.3 : .9, eyes: mair ? 'happy' : 'normal', mouth: 'grin', blush: .8, rot: mair ? .2 : 0 });
    for (let i = 0; i < 5; i++) { const ph = frac(t * 1.6 + i / 5); sparkle(mx - 40 - ph * 120, my - 140 + Math.sin(ph * 6 + i) * 30, 11, ['#FFF3C0', '#FFC9D8'][i % 2], ph); }
    camEnd();
  }
  // her, holding a big paintbrush in her right hand (drawn over the arm so the brush reads in front)
  function heroBrush(x, y, s, o, t, sweep, stroking) {
    hero(x, y, s, o);
    const h = handPt(x, y, s, o, 1), ang = .25 + 1.35 * sweep;
    if (stroking && sweep > .02) {                                        // a ribbon of pink paint left in the air by the stroke
      const trail = []; for (let k = 0; k <= 10; k++) { const a2 = .25 + 1.35 * sweep * k / 10; trail.push([h[0] + Math.sin(a2) * 205, h[1] - Math.cos(a2) * 205]); }
      inkLine(trail, 5, '#F29BB8', 'dry', .5, .75 * (1 - sweep * .6));
    }
    push(); translate(h[0], h[1]); rotate(ang);
    paint(rrPts(-8, -130, 16, 150, 7), { wash: '#C98F5A', fill: DESK_DK, fillOp: 50, ink: INK, sw: .9 });
    paint(rrPts(-11, -150, 22, 26, 5), { wash: '#C9CED6', ink: INK, sw: .7 });
    paint([[-16, -150], [16, -150], [8, -205], [0, -222], [-8, -205]], { wash: '#F29BB8', fill: '#E2557F', fillOp: 80, ink: INK, sw: .9, curv: .4 });
    pop();
    const tip = [h[0] + Math.sin(ang) * 210, h[1] - Math.cos(ang) * 210];
    glow(tip[0], tip[1], 60, '#FFC9D8', .6);
    if (stroking) for (let i = 0; i < 5; i++) dot(tip[0] + (hash(i + Math.floor(t * 10)) - .5) * 70, tip[1] + (hash(i * 3 + Math.floor(t * 10)) - .5) * 70, 4 + 4 * hash(i), ['#F29BB8', '#FFD08A', '#9ED8C4'][i % 3], .8);
  }

  // =====================================================================================================
  // Shot 4 · 168.156–172.956 · 让喜欢的事 不只停在喜欢
  // Close on one lit window: someone at a desk smiles at a little screen where 桃桃 waves. The camera pulls back and
  // on every beat more windows light up — the block, the neighbours, the whole night city — each with a little pink
  // screen and a waving 桃桃. At the end a rooftop rises into view: she and 桃桃 sit on the ledge, watching.
  // =====================================================================================================
  const WCOLS = 7, WROWS = 7, WW = 150, WH = 180;
  const winXY = (i, j) => [110 + i * 210, 140 + j * 250];
  const WIN0 = [3, 3], WFOC = [110 + 3 * 210 + 75, 140 + 3 * 250 + 92];
  // the block's windows, ordered by distance from the first one; each lights up on a beat, in widening rings
  const WINS = (() => {
    const a = [];
    for (let j = 0; j < WROWS; j++) for (let i = 0; i < WCOLS; i++) a.push({ i, j, d: Math.hypot((i - WIN0[0]) * 1.1, j - WIN0[1]) + hash(i * 7 + j * 3) * .6, seed: i * 13 + j * 7 });
    a.sort((p, q) => p.d - q.d);
    const ring = [0, 1, 3, 7, 13, 22, 34, 49];
    a.forEach((w, k) => { let b = 0; while (b + 1 < ring.length && k >= ring[b + 1]) b++; w.on = B(280 + b) + (k - ring[b]) * .035 * (b > 0 ? 1 : 0) + (b === 0 ? -1 : 0); });
    return a;
  })();
  const WALLS = ['#FBE3C8', '#F9D6E0', '#E3F0DA', '#FFEBC2', '#E7DDF5'];
  function momoIcon(x, y, r, t, seed) {                                   // tiny 桃桃 for far screens: hair, face, a waving hand
    const wv = Math.sin(t * 10 + seed) * .5;
    for (const sd of [-1, 1]) paint(ellPts(x + sd * r * .95, y + r * .45, r * .42, r * .75, 10), { wash: '#F3A0BF', ink: null });
    paint(ellPts(x, y, r * .9, r * .85, 14), { wash: '#F3A0BF', ink: null });
    paint(ellPts(x, y + r * .22, r * .66, r * .55, 12), { wash: '#FCE5D4', ink: null });
    dot(x - r * .25, y + r * .22, r * .1, INK); dot(x + r * .25, y + r * .22, r * .1, INK);
    paint(starPts(x, y - r * 1.25, r * .35, .45, 5), { wash: '#FFE59A', ink: null });
    inkLine([[x + r * .9, y + r * 1.1], [x + r * (1.4 + .3 * wv), y + r * (.4 - .2 * wv)]], r * .05, '#FCE5D4', 'marker', 0);
  }
  function screenMomo(sx, sy, sw2, sh2, t, seed, detail) {                // a little screen with 桃桃 waving
    paint(rrPts(sx, sy, sw2, sh2, sw2 * .08), { wash: '#FFE3EC', ink: INK, sw: detail ? .7 : .4 });
    glow(sx + sw2 / 2, sy + sh2 / 2, sw2 * 1.2, '#FF9FC0', .45);
    if (detail) momo(sx + sw2 * .5, sy + sh2 * .96, sh2 * .085, { noShadow: true, aR: 1.1 + .45 * Math.sin(t * 9 + seed), aL: .2, eyes: 'happy', mouth: 'grin', blush: .8, dy: -.15 * Math.abs(Math.sin(t * 4 + seed)) });
    else momoIcon(sx + sw2 * .5, sy + sh2 * .45, sh2 * .26, t, seed);
  }
  function aWindow(w, t, zoom) {
    const [x, y] = winXY(w.i, w.j), age = t - w.on, on = age >= 0, scr = WW * zoom;
    const k = on ? clamp(age / .25) : 0, flick = on && age < .25 ? .6 + .4 * Math.sin(age * 90) : 1;
    // dark glass or a warm lit room (the room is clipped to the window)
    paint(rectPts(x, y, WW, WH), { wash: on ? mixCol('#3B3F7A', WALLS[w.seed % 5], k * flick) : '#2B3066', ink: null });
    if (on) glow(x + WW / 2, y + WH / 2, WW * 1.1, '#FFD9A0', .35 * k);
    if (on) clipTo(rectPts(x, y, WW, WH), () => {
      if (scr > 150) {                                                   // near: a person at a desk, smiling at a little screen
        const ps = 11, px = x + 48, py = y + 176, sd = w.seed;
        const md = mood(t, [[w.on - 1, 'normal', null, 'smile'], [w.on + .35, 'happy', ['heart', 'music', 'flower', 'spark'][sd % 4], 'open']]);
        person(px, py, ps, { seed: sd + 1, sit: true, lookX: .7, lookY: .1, blush: .9, aR: -.1 + .4 * Math.sin(t * 8 + sd) * seg(age, .4, .6), aL: -.6, ...md, noShadow: true });
        paint(rectPts(x, y + 136, WW, 44), { wash: '#C99A6B', fill: DESK_DK, fillOp: 50, ink: INK, sw: .5 });
        paint([[x + 88, y + 134], [x + 138, y + 134], [x + 132, y + 128], [x + 94, y + 128]], { wash: '#D9CCBA', ink: INK, sw: .4 });
        screenMomo(x + 84, y + 84, 58, 42, t, sd, scr > 300);
        light(px, py - 70, 60, '#FFB3C8', .3 * k);
      } else if (scr > 36) {                                             // middle distance: a silhouette and a pink screen
        paint(ellPts(x + 50, y + 104, 20, 22, 12), { wash: mixCol(PERSON_HAIR[w.seed % 8], '#5A4A6A', .3), ink: null });
        paint(rrPts(x + 26, y + 124, 48, 60, 16), { wash: mixCol(PERSON_TOP[w.seed % 8], '#5A4A6A', .35), ink: null });
        screenMomo(x + 84, y + 88, 54, 40, t, w.seed, false);
      } else { glow(x + 105, y + 110, 60, '#FF9FC0', .55); dot(x + 105, y + 110, 12, '#FFD3E0', .9); }
      // curtains
      for (const sd of [-1, 1]) paint([[x + (sd < 0 ? 0 : WW), y], [x + (sd < 0 ? 26 : WW - 26), y], [x + (sd < 0 ? 16 : WW - 16), y + WH * .7], [x + (sd < 0 ? 0 : WW), y + WH * .75]], { wash: ['#F29BB8', '#F6B38E', '#9ED8C4'][w.seed % 3], washOp: 220, ink: null, curv: .3 });
    });
    if (on && age < .5) sparkle(x + WW - 10, y + 10, 36, '#FFF3C0', age / .5);
    paint(rectPts(x - 8, y - 8, WW + 16, WH + 16, 1), { ink: INK, sw: 1 });
    paint(rectPts(x - 14, y + WH + 4, WW + 28, 14, 1), { wash: '#C9B8C8', ink: INK, sw: .7 });
  }
  // neighbour blocks and the far skyline: windows light up pink in waves from the centre outward
  const NBR = [[-1500, 380, 1300, 0], [-2900, 760, 1250, 1], [1780, 250, 1250, 2], [3160, 600, 1350, 3], [-4300, 1000, 1300, 4], [4640, 900, 1300, 5]];
  function neighbour([x0, top, w, seed], t) {
    const col = ['#3A4180', '#343B78', '#40478A'][seed % 3];
    paint(rectPts(x0, top, w, 3200), { wash: col, fill: mixCol(col, INK, .25), fillOp: 60, tex: .5, border: .3, ink: INK, sw: 1.2 });
    const cols = Math.floor(w / 190), rows = Math.floor((1950 - top) / 230);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const wx = x0 + 60 + c * 190, wy = top + 80 + r * 230, h = hash(seed * 50 + r * 11 + c * 3);
      const on = B(284.2 + Math.abs(wx - WFOC[0]) / 2400 * 2.6 + h * .6), lit = t >= on;
      fillRectA(wx, wy, 120, 150, lit ? ['#FFD9C0', '#F9CEDC', '#FFE3B8'][Math.floor(h * 3)] : '#262B5E', lit ? .95 : 1);
      if (lit) { glow(wx + 60, wy + 75, 150, '#FF9FC0', .35); dot(wx + 84, wy + 70, 16, '#FF9FC0', .9); }
    }
  }
  function shotWindows(t, lt, dur) {
    const u = easeInOut(seg(lt, .35, 4.3)), zoom = Math.exp(lerp(Math.log(3.1), Math.log(.42), u));
    const cx = lerp(WFOC[0] + 30, 800, u), cy = lerp(WFOC[1] - 10, 900, u);
    skyGrad([[0, '#141A42'], [.6, '#2B3170'], [1, '#4A3F80']]);
    starField(t, { x: 0, y: 0, w: W, h: 700 }, 80);
    // the far skyline in screen space, sliding up into view as we pull back; its windows turn pink late
    const far = seg(u, .55, 1);
    if (far > 0) {
      push(); translate(0, lerp(600, 0, far));
      nightCity(t, { x0: -200, x1: W + 200, y: 1080, color: .12, lit: .25 });
      for (let i = 0; i < 70; i++) { const on = B(285.6 + hash(i * 3.1) * 1.8); if (t < on) continue; const x = hash(i * 7.7) * W, y = 700 + hash(i * 2.3) * 330; glow(x, y, 26, '#FF9FC0', .6); dot(x, y, 4, '#FFE3EC'); }
      pop();
    }
    camBegin(cx, cy, zoom, 0);
    for (const n of NBR) neighbour(n, t);
    // the block
    paint(rectPts(-40, 0, 1560, 3200), { wash: '#4A4F92', fill: '#383D7A', fillOp: 70, bleed: .03, tex: .5, border: .3, ink: INK, sw: 1.4 });
    paint(rectPts(-70, -40, 1620, 60, 2), { wash: '#5A5FA2', ink: INK, sw: 1.2 });
    for (const w of WINS) aWindow(w, t, zoom);
    // little hearts drift up from the lit windows
    for (let k = 1; k < 30; k++) {
      const w = WINS[k], ph = frac((t - w.on) * .45 + hash(k * 3.3)); if (t < w.on + .3) continue;
      const [x, y] = winXY(w.i, w.j), hy = y + 40 - ph * 260;
      paint(heartPts(x + 120 + 20 * Math.sin(ph * 6 + k), hy, 14 * (1 - ph * .4)), { wash: '#F57AA0', washOp: 230 * Math.sin(ph * Math.PI), ink: null });
    }
    camEnd();
    // the rooftop they are sitting on rises into the foreground as we pull back
    const roof = easeOut(seg(lt, 2.6, 4.2));
    if (roof > 0) {
      const ry = lerp(1250, 830, roof);
      paint([[-40, ry], [W + 40, ry + 20], [W + 40, H + 60], [-40, H + 60]], { wash: '#232A5A', fill: '#1B2147', fillOp: 80, tex: .5, ink: INK, sw: 1.3 });
      paint([[-40, ry - 16], [W + 40, ry + 4], [W + 40, ry + 26], [-40, ry + 10]], { wash: '#3A4180', ink: INK, sw: 1 });
      // a string of fairy lights along the ledge and a little potted plant
      const fl = []; for (let i = 0; i <= 12; i++) fl.push([-40 + i * 170, ry + 40 + 22 * Math.sin(i * 1.3) + (i % 2) * 10]);
      inkLine(fl, .7, INK, 'fine', .5);
      fl.forEach(([x, y], i) => { const c = ['#FFD98A', '#FFB3C6', '#BFF0E0'][i % 3], on = .6 + .4 * Math.sin(t * 3 + i * 1.7); glow(x, y + 10, 34, c, .6 * on); dot(x, y + 10, 7, c); });
      plant(120, ry + 6, .9, t);
      glow(420, ry - 160, 420, '#FF9FC0', .12);
      const bp = bpOf(t), wave = t > B(286.5);
      hero(330, ry + 1.35 * 31 - 6, 31, { back: true, outfit: 'home', aL: -.9, aR: -1.0, tilt: .08 * Math.sin(bp * Math.PI), walk: bp * .5, noShadow: true });
      momo(500, ry + 1.35 * 25 - 4, 25, { back: true, aL: wave ? 1.2 + .4 * Math.sin(t * 11) : -.9, aR: wave ? .9 + .3 * Math.sin(t * 9) : -.9, tilt: -.1 * Math.sin(bp * Math.PI), walk: bp * .5 + .25, noShadow: true, digital: .5 });
      light(420, ry - 160, 320, '#FFB3C8', .2);
    }
  }

  // =====================================================================================================
  // Shot 5 · 172.956–177.456 · 我还没写完 也不急着圆满
  // The crescent again. She sits on its lower tip; 桃桃 carries the end of a garland up to the other tip, and the star
  // lanterns strung across the moon's missing part light up one by one. A shooting star streaks past; they make a
  // wish, and the moon smiles sleepily.
  // =====================================================================================================
  const MN0 = 172.956, MC = [1060, 600], MR = 380, MROT = .74;
  const mTip = sd => [MC[0] + sd * MR * .97 * Math.sin(MROT) - (sd < 0 ? 0 : 0), MC[1] - sd * MR * .97 * Math.cos(MROT)];   // sd 1 = upper tip, -1 = lower
  const TIE = B(289.6), STAR_T = B(293.4), NLAN = 9;
  function starLantern(x, y, r, lit, t, i) {
    const sw2 = Math.sin(t * 2.3 + i * 1.3) * .12, col = ['#FFD08A', '#F7A8B8', '#FFE3A0', '#C9F0E0', '#F6B38E'][i % 5];
    push(); translate(x, y); rotate(sw2);
    inkLine([[0, -r * .2], [0, r * .55]], .6, INK, 'fine', 0);
    if (lit > 0) { glow(0, r * 1.4, r * 4.5 * lit, col, .5 * lit); glow(0, r * 1.4, r * 1.6, '#FFF6D8', .6 * lit); }
    paint(starPts(0, r * 1.45, r, .5, 5), { wash: lit > 0 ? mixCol('#E9E2F2', col, lit) : '#D9D2E8', fill: lit > 0 ? '#FFF6D8' : '#B9B0CC', fillOp: 70, ink: INK, sw: .7 });
    if (lit > .5) paint(starPts(0, r * 1.45, r * .45, .5, 5), { wash: '#FFFBEA', washOp: 200 * lit, ink: null });
    inkLine([[0, r * 2.35], [0, r * 2.9]], 1.2, '#E2557F', 'ink', 0);
    pop();
  }
  function shotMoon(t, lt, dur) {
    const push2 = easeInOut(seg(lt, 0, dur + .3)), zoom = lerp(1.06, 1.16, push2), rot = lerp(-.02, .02, push2);
    const cx = lerp(1010, 1050, push2), cy = lerp(528, 566, push2);
    skyGrad([[0, '#10163D'], [.55, '#252C6A'], [1, '#4A3C7E']]);
    camBegin(cx, cy, zoom, rot);
    // milky way wash and stars
    paint([[-300, 900], [400, 520], [1200, 200], [2300, -200], [2300, 120], [1300, 460], [500, 780], [-300, 1150]], { fill: '#8E7BC6', fillOp: 50, bleed: .3, tex: .4, border: 0, ink: null, curv: .4 });
    starField(t, { x: -200, y: -200, w: 2400, h: 1400 }, 150);
    for (let i = 0; i < 6; i++) { const x = hash(i * 5.5) * 2000 - 40, y = hash(i * 9.1) * 700; paint(starPts(x, y, 9 + 5 * Math.sin(t * 3 + i), .3, 4), { wash: CREAM, ink: null }); glow(x, y, 30, CREAM, .4); }
    softCloudM(260, 820, 520, 90, 3, t); softCloudM(1720, 880, 600, 100, 6, t);
    // the moon
    const shoot = t - STAR_T, look = shoot > 0 && shoot < 1.3;
    moonFace(MC[0], MC[1], MR, { rot: MROT, eyes: look && shoot < 1.0 ? 'open' : undefined });
    if (t > B(294.6)) paint(ellPts(MC[0] + 160, MC[1] + 330, 30, 16, 10), { fill: CHEEK, fillOp: 150 * seg(t, B(294.6), B(295)), bleed: .2, ink: null });
    // the garland across the missing part; its far end rides in 桃桃's hand until she ties it
    const A = mTip(-1), Bt = mTip(1), tie = seg(t, MN0 + .25, TIE), up = easeInOut(tie);
    const mStart = [A[0] + 70, A[1] - 90];
    const mPos = tie < 1 ? [lerp(mStart[0], Bt[0] + 10, up) + 40 * Math.sin(up * Math.PI), lerp(mStart[1], Bt[1] - 8, up) - 160 * Math.sin(up * Math.PI)] : [Bt[0] + 10, Bt[1] - 8];
    const end = tie < 1 ? [mPos[0] - 30, mPos[1] - 90] : Bt;
    const sag = 70 * (tie < 1 ? .6 + .4 * up : 1), gp = u => [lerp(A[0], end[0], u), lerp(A[1], end[1], u) + sag * Math.sin(u * Math.PI)];
    const g = []; for (let i = 0; i <= 24; i++) g.push(gp(i / 24));
    inkLine(g, 1.1, '#E2557F', 'ink', .4);
    for (let i = 0; i < NLAN; i++) {
      const u = (i + 1) / (NLAN + 1), shown = tie >= 1 || u < up * .95; if (!shown) continue;
      const on = B(290 + i * .42), lit = clamp((t - on) / .2);
      const [x, y] = gp(u);
      starLantern(x, y, 26, lit, t, i);
      if (lit > 0 && t - on < .45) sparkle(x + 24, y + 20, 30, '#FFF3C0', (t - on) / .45);
    }
    // her on the lower tip, 桃桃 flying the string up to the upper tip
    const bp = bpOf(t), wish = t > B(294.4);
    const hm = mood(t, [[MN0 - 1, 'happy', null, 'smile'], [B(290), 'sparkle', 'spark', 'open'], [STAR_T + .1, 'wide', '!', 'O'], [B(294.4), 'closed', null, 'smile']]);
    const HS = 29, hx = A[0] + 26, hy = A[1] + 48;
    hero(hx, hy, HS, { outfit: 'home', walk: !wish ? bp * .5 : null, sit: false, noShadow: true, lookX: look ? -.3 : .5, lookY: look ? -1 : -.5, ...hm, blush: .8,
      aL: look ? 1.2 : wish ? .9 : -.5, aR: look ? .5 : wish ? .9 : .3 + .25 * Math.sin(t * 5), tilt: .1 * Math.sin(bp * Math.PI) - (wish ? .15 : 0), dy: -.1 * Math.abs(Math.sin(bp * Math.PI)) });
    const mm = mood(t, [[MN0 - 1, 'happy', null, 'grin'], [TIE, 'wink', 'music', 'grin'], [STAR_T + .15, 'wide', '!!', 'O'], [B(294.5), 'closed', null, 'cat']]);
    const flying = tie < 1;
    momo(mPos[0], mPos[1] + (flying ? 0 : 40), 24, { digital: .6, noShadow: true, ...mm, blush: .8, lookX: look ? .3 : -.5, lookY: look ? -1 : .2,
      aL: flying ? 1.3 : look ? 1.3 : wish ? .95 : .6, aR: flying ? .8 + .3 * Math.sin(t * 12) : wish ? .95 : .3, rot: flying ? .25 * Math.sin(up * Math.PI) : 0, sit: !flying, dy: flying ? 0 : -.15 * Math.abs(Math.sin(bp * Math.PI + 1)) });
    if (tie >= 1 && t - TIE < .5) sparkle(Bt[0], Bt[1], 40, '#FFF3C0', (t - TIE) / .5);
    camEnd();
    // the shooting star (screen space, across the open sky on the left)
    const SX0 = -120, SY0 = 60, SX1 = 1150, SY1 = 330;
    if (shoot > -.1 && shoot < 1.2) {
      const k = clamp(shoot / .9), sx = lerp(SX0, SX1, easeOut(k)), sy = lerp(SY0, SY1, easeOut(k));
      const tail = []; for (let i = 0; i <= 12; i++) { const kk = Math.max(0, k - i * .035); tail.push([lerp(SX0, SX1, easeOut(kk)), lerp(SY0, SY1, easeOut(kk))]); }
      inkLine(tail, 7, '#FFF1C2', 'marker', .3, .5 * (1 - seg(shoot, .8, 1.2)));
      inkLine(tail, 2.5, '#FFFBEA', 'ink', .3, .9 * (1 - seg(shoot, .8, 1.2)));
      if (k < 1) { glow(sx, sy, 90, '#FFF1C2', .8); paint(starPts(sx, sy, 22, .4, 5, t * 6), { wash: '#FFFBEA', ink: null }); }
      for (let i = 0; i < 6; i++) { const kk = k - .06 * (i + 1); if (kk < 0) continue; sparkle(lerp(SX0, SX1, easeOut(kk)) + (hash(i) - .5) * 60, lerp(SY0, SY1, easeOut(kk)) + 30 * hash(i * 3), 14, '#FFF3C0', clamp((shoot - kk * .9) / .6)); }
    }
  }
  function softCloudM(x, y, w, h, seed, t) {
    const dx = Math.sin(t * .2 + seed) * 20;
    paint(cloudPts(x + dx, y, w, h, seed, 6), { fill: '#6C5EA8', fillOp: 120, bleed: .12, tex: .35, border: .2, ink: null, curv: .4 });
    paint(cloudPts(x + dx - w * .05, y - h * .2, w * .7, h * .5, seed + 2, 5), { fill: '#A08CD0', fillOp: 70, bleed: .15, tex: .2, border: 0, ink: null, curv: .4 });
  }

  // =====================================================================================================
  // Shot 6 · 177.456–181.956 · 不让一声算了 变成最后的答案
  // A heavy grey 算了 cloud sighs over her tiny house and it pours. She pops open an umbrella painted with flowers:
  // every drop that hits it turns into a petal, colour blooms out from under it, 桃桃 twirls in the dry circle, and the
  // cloud peers down, puzzled, then blushes.
  // =====================================================================================================
  const UM0 = 177.456, OPEN = B(297), UX = 830, UGY = 905;
  const umbR = t => 215 * backOut(clamp((t - OPEN) / .35));
  function tinyHouse(x, y, t) {
    paint(ellPts(x, y + 6, 260, 30, 20), { fill: INK, fillOp: 50, bleed: .2, ink: null });
    paint(rectPts(x + 120, y - 400, 44, 110), { wash: '#B86A5E', ink: INK, sw: 1 });                                     // chimney
    paint(rectPts(x - 170, y - 250, 340, 250, 2), { wash: '#FBEBD6', fill: '#E3C9A8', fillOp: 60, tex: .5, border: .3, ink: INK, sw: 1.3 });
    paint([[x - 215, y - 240], [x, y - 430], [x + 215, y - 240]], { wash: '#E07A7A', fill: '#B04A5A', fillOp: 70, tex: .5, border: .4, ink: INK, sw: 1.4, curv: .08 });
    paint(rrPts(x - 60, y - 140, 80, 140, 34), { wash: '#9C6B4E', ink: INK, sw: 1.1 });
    dot(x + 8, y - 70, 6, '#F6C85F');
    paint(ellPts(x + 95, y - 150, 44, 44, 20), { wash: '#FFD98A', ink: INK, sw: 1.1 });                                  // the warm round window
    glow(x + 95, y - 150, 140, '#FFD98A', .5);
    inkLine([[x + 51, y - 150], [x + 139, y - 150]], 1.5, '#E3C9A8', 'marker', 0); inkLine([[x + 95, y - 194], [x + 95, y - 106]], 1.5, '#E3C9A8', 'marker', 0);
    for (let i = 0; i < 4; i++) { const k = frac(t * .35 + i / 4); dot(x + 142 + 22 * Math.sin(k * 5 + i), y - 410 - k * 160, 10 + 14 * k, '#E9E4EE', .55 * (1 - k)); }   // chimney smoke
  }
  function umbrellaTop(x, y, R, spin, t) {                               // open canopy; (x, y) = the rim centre
    if (R < 4) return;
    const H = R * .55, dome = [];
    for (let i = 0; i <= 20; i++) { const a = Math.PI + i / 20 * Math.PI; dome.push([x + Math.cos(a) * R, y + Math.sin(a) * H]); }
    const sc = []; for (let i = 8; i >= 0; i--) { const u = i / 8, px = x - R + u * 2 * R; sc.push([px, y + (i % 2 ? 0 : 16) * R / 215]); }
    glow(x, y + 60, R * 2.2, '#FFE3C0', .35);
    paint([...dome, ...sc.slice(1)], { wash: '#FFF4E6', fill: '#F9CEDC', fillOp: 70, tex: .3, border: .3, ink: INK, sw: 1.3, curv: .15 });
    // ribs and painted flowers on the panels facing us (the canopy turns as she twirls it)
    for (let k = 0; k < 8; k++) {
      const th = spin + k / 8 * TAU, c = Math.cos(th); if (c < -.05) continue;
      const sx = Math.sin(th), bx = x + sx * R, by = y + (1 - Math.abs(sx)) * 6;
      inkLine([[x, y - H], [x + sx * R * .55, y - H * .72], [bx, by]], .8, '#C98FA0', 'fine', .5);
      const fth = th + TAU / 16, fs = Math.sin(fth), fc = Math.cos(fth); if (fc < .1) continue;
      const fx = x + fs * R * .72, fy = y - H * .38 + Math.abs(fs) * H * .1, fr = 22 * R / 215 * (.5 + .5 * fc), col = ['#F29BB8', '#FFD08A', '#9ED8C4', '#F6B38E'][k % 4];
      for (let q = 0; q < 5; q++) { const an = q / 5 * TAU + k; paint(ellPts(fx + Math.cos(an) * fr * .55 * fc, fy + Math.sin(an) * fr * .5, fr * .42 * (.6 + .4 * fc), fr * .42, 8), { wash: col, ink: INK, sw: .4 }); }
      dot(fx, fy, fr * .25, '#F6C85F');
    }
    paint(ellPts(x, y - H - 6, 8, 10, 8), { wash: '#E2557F', ink: INK, sw: .7 });
  }
  const rainY = (i, t) => { const P = .78, ph = frac(t / P + hash(i * 1.37)); return [330 + ph * 900, ph, P]; };
  const rainX = i => 330 + hash(i * 3.71) * 1500;
  function shotUmbrella(t, lt, dur) {
    const open = t >= OPEN, R = open ? umbR(t) : 0, oa = t - OPEN;
    const push2 = easeInOut(seg(lt, .8, dur + .2)), zoom = lerp(.92, 1.14, push2), cx = lerp(1060, 990, push2), cy = lerp(515, 585, push2);
    const [shx, shy] = shakeXY(t, oa > 0 && oa < .3 ? 6 * (1 - oa / .3) : 0);
    skyGrad([[0, '#8C86C8'], [.5, '#E7A9C4'], [1, '#FFD9B8']]);            // a warm evening sky, greyed out by the gloom below
    camBegin(cx + shx, cy + shy, zoom, 0);
    // hills, the tiny house, the path
    paint([[-400, 780], [300, 700], [900, 740], [1500, 690], [2400, 760], [2400, 1500], [-400, 1500]], { wash: '#9CC79A', fill: '#6FA57E', fillOp: 70, bleed: .05, tex: .5, border: .3, ink: INK, sw: 1.1, curv: .4 });
    paint([[-400, 900], [700, 860], [1400, 880], [2400, 850], [2400, 1500], [-400, 1500]], { wash: '#B5D9A8', fill: '#86BD8C', fillOp: 60, tex: .5, ink: null, curv: .4 });
    tinyHouse(1420, 830, t);
    paint([[1360, 840], [1440, 840], [1160, 1300], [820, 1300]], { wash: '#E8D2B0', fill: '#C9A87E', fillOp: 50, tex: .5, ink: null });
    for (const [px, py, pw] of [[520, 960, 90], [1150, 1000, 120], [1700, 940, 80]]) paint(ellPts(px, py, pw, pw * .22, 16), { wash: '#C9DDF0', fill: '#9FB6D8', fillOp: 60, ink: INK, sw: .6 });
    // flowers that bloom where the colour reaches (only after the umbrella opens)
    if (open) for (let i = 0; i < 16; i++) {
      const fx = UX - 420 + hash(i * 5.3) * 840, fy = 880 + hash(i * 2.9) * 160, g = backOut(clamp((oa - .3 - Math.abs(fx - UX) / 900) / .35)); if (g <= 0) continue;
      inkLine([[fx, fy], [fx + 2, fy - 26 * g]], 1.1, '#5E9A6E', 'ink', 0);
      const col = ['#F29BB8', '#FFD08A', '#F7A8B8', '#C9B8F0'][i % 4];
      for (let q = 0; q < 5; q++) { const an = q / 5 * TAU; paint(ellPts(fx + 2 + Math.cos(an) * 7 * g, fy - 26 * g + Math.sin(an) * 7 * g, 6 * g, 6 * g, 8), { wash: col, ink: INK, sw: .35 }); }
      dot(fx + 2, fy - 26 * g, 4 * g, '#F6C85F');
    }
    // the gloom: everything is grey except a widening circle of colour around the umbrella
    const hole = open ? 170 + 520 * easeOut(seg(oa, .05, 2.6)) : 0, hx = UX + 60, hy = 700, ring = [];
    for (let i = 0; i <= 40; i++) { const a = -i / 40 * TAU, r = hole * (1 + .06 * Math.sin(a * 5 + t * 2) + .04 * Math.sin(a * 9 - t * 3)); ring.push([hx + Math.cos(a) * r, hy + Math.sin(a) * r * .8]); }
    const outer = [[-600, -600], [2600, -600], [2600, 1700], [-600, 1700], [-600, -600]];
    clipTo(hole > 1 ? [...outer, [hx + hole * 1.06, hy], ...ring, [hx + hole * 1.06, hy], [-600, -600]] : outer, () => { grade(.8, 'saturation', '#808080'); grade(.3, 'color', '#8FA3C8'); grade(.15, 'multiply', '#B8C0D0'); });
    // her with the umbrella, 桃桃 twirling under it
    const bp = bpOf(t), S = 30;
    const hm = mood(t, [[UM0 - 1, 'normal', 'sweat', 'flat'], [B(296.3), 'normal', null, 'pout'], [OPEN, 'sparkle', 'spark', 'grin'], [B(300), 'happy', 'flower', 'grin']]);
    const ho = { outfit: 'home', ...hm, brows: t < OPEN ? 'angry' : null, lookX: .2, lookY: t < OPEN ? -.7 : -.2, blush: open ? .8 : .3, aR: open ? .95 : t > B(296.3) ? lerp(.2, 1.3, seg(t, B(296.3), OPEN)) : -.3, aL: open ? -.4 + .3 * Math.sin(bp * Math.PI) : -.9,
      dy: open ? -.3 * Math.abs(Math.sin(bp * Math.PI)) : 0, sq: oa > 0 && oa < .3 ? -.12 * Math.sin(oa / .3 * Math.PI) : 0, tilt: open ? .08 * Math.sin(bp * Math.PI) : 0 };
    hero(UX, UGY, S, ho);
    const hand = handPt(UX, UGY, S, ho, 1);
    if (!open) {                                                          // furled umbrella held up like a sword
      push(); translate(hand[0], hand[1]); rotate(lerp(.2, -.1, seg(t, B(296.3), OPEN)));
      paint([[-12, -30], [12, -30], [4, -200], [-4, -200]], { wash: '#F9CEDC', fill: '#F29BB8', fillOp: 80, ink: INK, sw: 1 });
      inkLine([[0, -200], [0, -230]], 1.4, INK, 'ink', 0); inkLine([[0, -30], [0, 30], [16, 44], [26, 30]], 2.4, '#9C6B4E', 'marker', .5);
      pop();
    }
    const tipY = hand[1] - 190;
    // 桃桃 spins in the dry circle (faked turn: squeeze, flip, back)
    const spinA = open ? (bp - 297) * Math.PI : 0, sc2 = Math.cos(spinA), sn2 = Math.sin(spinA);
    const mm = mood(t, [[UM0 - 1, 'teary', 'sweat', 'wobble'], [OPEN + .15, 'star', 'music', 'grin'], [B(300.5), 'happy', 'heart', 'grin']]);
    momo(UX + 150, UGY - (open ? 20 * Math.abs(Math.sin(bp * Math.PI)) : 0), 24, { ...mm, blush: .9, sx: open ? Math.max(.18, Math.abs(sc2)) : 1, flip: sn2 < 0, back: open && sc2 < 0, aL: open ? .35 : -1.0 + .1 * Math.sin(t * 30), aR: open ? .35 : -1.0 - .1 * Math.sin(t * 31),
      tailSwing: open ? .35 : 0, dy: open ? -.4 * Math.abs(Math.sin(bp * Math.PI)) : 0 });
    if (open) {
      inkLine([[hand[0], hand[1] + 10], [hand[0], tipY]], 2.2, '#9C6B4E', 'marker', 0);
      umbrellaTop(hand[0], tipY + R * .55 * .98 - 4, R, t * 1.6, t);
      light(hand[0] + 60, UGY - 200, 330, '#FFE3C0', .22);
    }
    // rain, and petals where it lands on the umbrella
    const ucx = hand[0], ucy = tipY + R * .55;
    for (let i = 0; i < 130; i++) {
      const x = rainX(i), [y, ph, P] = rainY(i, t), dx = x - ucx;
      const under = open && Math.abs(dx) < R * .98, yc = under ? ucy - Math.sqrt(Math.max(0, R * R - dx * dx)) * .55 : 1e9;
      if (y < yc) inkLine([[x, y], [x - 6, y + 42]], 1, '#E3EBF8', 'fine', 0, .85);
      else if (!under && y > 1060 && y < 1120) paint(ellPts(x, 1000 + hash(i) * 40, 12, 3, 8), { ink: '#E3EBF8', sw: .6 });
      if (!open) continue;
      for (let k = 0; k < 3; k++) {                                        // petals from this drop's recent hits
        const ts = t - ph * P - k * P, th = ts + (yc - 330) / 900 * P, a = t - th;
        if (!under || a < 0 || a > 1.7 || th < OPEN + .15) continue;
        const out = Math.sign(dx || 1), px = x + out * (60 * a + 20 * Math.sin(a * 5 + i)), py = yc + 40 * a + 260 * Math.max(0, a - .35) * (a - .35);
        const col = ['#F7A8B8', '#F9CEDC', '#FFC2D6', '#FFD9C0'][i % 4];
        push(); translate(px, py); rotate(a * 5 + i);
        paint([[0, -9], [6, -3], [5, 6], [0, 9], [-5, 6], [-6, -3]], { wash: col, washOp: 255 * (1 - seg(a, 1.3, 1.7)), ink: null, curv: .5 });
        pop();
      }
    }
    // the cloud: sighs, then peers down puzzled, and blushes at the end
    const cl = [1190, 300 + 10 * Math.sin(t * 1.2)], cs = 3.4;
    sighCloud(cl[0], cl[1], cs, { rain: false });
    if (t < OPEN) for (let k = 0; k < 3; k++) { const ph = frac(t * .9 + k / 3); inkLine([[cl[0] - 20 + k * 20, cl[1] + 50 + ph * 60], [cl[0] - 40 + k * 20 + 20 * Math.sin(ph * 6), cl[1] + 70 + ph * 90]], 1.2, '#E3E8F0', 'fine', .6, .7 * Math.sin(ph * Math.PI)); }
    if (open) { emote('?', cl[0] + 300, cl[1] - 80, 20, seg(oa, .6, 1.0) * (1 - seg(t, B(301.5), B(302)))); const bl = seg(t, B(301.3), B(302.2)); for (const sd of [-1, 1]) paint(ellPts(cl[0] + sd * 150, cl[1] + 10, 34, 18, 12), { fill: CHEEK, fillOp: 170 * bl, bleed: .2, ink: null }); }
    camEnd();
    if (oa > 0 && oa < .4) for (let i = 0; i < 10; i++) { const a = i / 10 * TAU, r = 60 + 300 * easeOut(oa / .4); sparkle(W / 2 + (hand[0] - cx) * zoom + Math.cos(a) * r, H / 2 + (tipY - cy) * zoom + Math.sin(a) * r * .6, 20, '#FFF3C0', oa / .4); }
  }

  // =====================================================================================================
  // Shot 7 · 181.956–187.356 · 哪怕只改变 世界小小的一段
  // A grey pavement; hurried legs pass by. In a crack, a wilted sprout. She crouches and waters it with the peach soda can
  // (桃桃 peeking from the other side); it perks up and blooms into a small pink flower that smiles, and a ring of colour
  // spreads from it across the street: pastel paving, blossom on the bare tree, striped awnings. Passers-by stop and smile.
  // =====================================================================================================
  const SP0 = 181.956, FLW = [960, 830], BLOOM = B(306.5), POUR0 = B(303.8), POUR1 = B(305.6);
  const ringR = t => t < BLOOM ? 0 : 60 + 2600 * easeInOut(seg(t, BLOOM, B(311.2)));
  const reachT = (x, y) => { const d = Math.hypot(x - FLW[0], (y - FLW[1]) / .36); for (let k = 0; k < 40; k++) { const tt = BLOOM + k * .13; if (ringR(tt) >= d) return tt; } return 1e9; };
  const WALKERS = [[330, 700, 21, 3, 1], [1640, 715, 22, 6, -1], [60, 745, 23, 8, 1], [1910, 760, 20, 1, -1]];   // [x0, y, s, seed, walk dir]
  function street(t) {
    // shopfronts with awnings, a lamp post and a bare tree that blossoms
    paint(rectPts(-600, -300, 3200, 960), { wash: '#D9CFC4', fill: '#B9AFA6', fillOp: 60, tex: .5, ink: null });
    for (let i = 0; i < 7; i++) {
      const x = -520 + i * 420, col = ['#F2C9B8', '#CFE3D6', '#E6D6F2', '#FBE3B8', '#F9CEDC', '#C9DDF0', '#F2C9B8'][i];
      paint(rectPts(x, 110, 400, 560, 2), { wash: col, fill: mixCol(col, INK, .12), fillOp: 50, tex: .5, border: .3, ink: INK, sw: 1.1 });
      paint(rectPts(x + 40, 380, 190, 250, 1), { wash: '#FFF1D6', fill: '#E8D2B0', fillOp: 40, ink: INK, sw: .9 });
      paint(rectPts(x + 270, 400, 90, 270, 1), { wash: '#9C6B4E', ink: INK, sw: .9 });
      for (let k = 0; k < 2; k++) paint(rectPts(x + 60 + k * 160, 170, 110, 120, 1), { wash: '#C9DDF0', ink: INK, sw: .8 });
      const aw = []; for (let k = 0; k <= 8; k++) aw.push([x + 20 + k * 45, 360 + (k % 2) * 16]);
      paint([[x + 10, 320], [x + 390, 320], ...aw.reverse()], { wash: ['#F29BB8', '#9ED8C4', '#FFD08A', '#C9B8F0'][i % 4], fill: '#FFFFFF', fillOp: 40, ink: INK, sw: .9 });
      for (let k = 0; k < 4; k++) paint([[x + 20 + k * 95, 322], [x + 65 + k * 95, 322], [x + 65 + k * 95, 370], [x + 20 + k * 95, 370]], { wash: CREAM, washOp: 150, ink: null });
    }
    paint(rectPts(-600, 660, 3200, 22), { wash: '#A99F96', ink: INK, sw: 1 });
    // the pavement in perspective, pastel paving stones (grey until the colour reaches them)
    paint(rectPts(-600, 680, 3200, 900), { wash: '#E6DDD2', ink: null });
    const VP = [960, 200], rowsY = [680, 712, 752, 802, 866, 946, 1046, 1170];
    for (let r = 0; r < rowsY.length - 1; r++) {
      const y0 = rowsY[r], y1 = rowsY[r + 1];
      for (let c = -12; c <= 12; c++) {
        const xa = k => VP[0] + (c * 150 - VP[0] + 960) * (k - VP[1]) / (680 - VP[1]) * .6, x00 = xa(y0), x10 = xa(y0) + 150 * .6 * (y0 - VP[1]) / (680 - VP[1]), x01 = xa(y1), x11 = xa(y1) + 150 * .6 * (y1 - VP[1]) / (680 - VP[1]);
        if (Math.max(x10, x11) < -400 || Math.min(x00, x01) > 2400) continue;
        const col = ['#F9CEDC', '#FFE3B8', '#CDEBDD', '#E3D6F5', '#FBEBD6'][((c % 5) + 5 + r * 2) % 5];
        paint([[x00 + 2, y0 + 2], [x10 - 2, y0 + 2], [x11 - 2, y1 - 2], [x01 + 2, y1 - 2]], { wash: col, ink: '#B3A89C', sw: .5 });
      }
    }
    paint(rectPts(-600, 1170, 3200, 400), { wash: '#8C8FA3', ink: INK, sw: 1 });                                            // kerb
  }
  function blossomTree(x, y, t) {
    const k = clamp((t - reachT(x, y)) / .5);
    paint(ellPts(x, y + 8, 110, 24, 16), { wash: '#B9A58E', ink: INK, sw: 1 });
    inkLine([[x, y], [x - 6, y - 200], [x - 60, y - 300]], 7, '#7F5A3C', 'ink', .4);
    inkLine([[x - 6, y - 190], [x + 60, y - 290]], 5, '#7F5A3C', 'ink', .4);
    inkLine([[x - 4, y - 240], [x - 10, y - 340]], 4, '#7F5A3C', 'ink', .4);
    if (k <= 0) return;
    for (let i = 0; i < 16; i++) {
      const bx = x - 80 + hash(i * 3.1) * 170, by = y - 380 + hash(i * 5.7) * 150, r = (26 + 22 * hash(i)) * backOut(clamp(k * 1.3 - hash(i) * .3));
      if (r > 1) paint(ellPts(bx, by, r, r * .85, 12, 2), { fill: i % 3 ? '#F7B6C8' : '#FBDDE6', fillOp: 170, bleed: .1, tex: .2, ink: null });
    }
  }
  function sproutFlower(x, y, t) {
    const perk = easeOut(seg(t, B(305.4), B(306.3))), grow = backOut(seg(t, B(305.4), B(306.4))), bloom = backOut(clamp((t - BLOOM) / .35)) * 1.35;
    const h = lerp(40, 150, grow), sway = Math.sin(t * 2.4) * .06 * (1 - perk * .5);
    // the crack
    inkLine([[x - 160, y + 24], [x - 118, y + 14], [x - 84, y + 22], [x - 40, y + 8], [x, y + 12], [x + 36, y + 4], [x + 80, y + 14], [x + 140, y + 2]], 1.3, '#5E544C', 'ink', 0);
    inkLine([[x - 84, y + 22], [x - 96, y + 38]], .8, '#5E544C', 'ink', 0); inkLine([[x + 36, y + 4], [x + 48, y - 10]], .8, '#5E544C', 'ink', 0);
    paint(ellPts(x, y + 12, 26, 7, 12), { wash: '#6E6258', washOp: 120, ink: null });
    push(); translate(x, y + 8); rotate(sway);
    inkLine([[0, 0], [lerp(-10, 4, perk), -h * .5], [0, -h]], 2.6, '#5E9A6E', 'ink', .5);
    for (const sd of [-1, 1]) {
      const la = lerp(sd * 1.9, sd * .9, perk);
      push(); translate(0, -h * .38); rotate(la);
      paint([[0, 0], [10, -10], [30, -8], [44, 0], [30, 8], [10, 10]], { wash: mixCol('#8FAE8A', '#7CC48E', perk), ink: INK, sw: .7, curv: .4 });
      pop();
    }
    if (bloom > 0) {
      for (let q = 0; q < 5; q++) { const an = q / 5 * TAU + t * .3; paint(ellPts(Math.cos(an) * 22 * bloom, -h + Math.sin(an) * 22 * bloom, 17 * bloom, 17 * bloom, 12), { wash: '#F7A8B8', fill: '#E2557F', fillOp: 40, ink: INK, sw: .8 }); }
      paint(ellPts(0, -h, 14 * bloom, 14 * bloom, 12), { wash: '#F6C85F', ink: INK, sw: .7 });
      if (bloom > .8) { for (const sd of [-1, 1]) inkLine([[sd * 6 - 3, -h - 2], [sd * 6, -h - 5], [sd * 6 + 3, -h - 2]], .7, INK, 'ink', .5); inkLine([[-3, -h + 4], [0, -h + 6], [3, -h + 4]], .6, INK, 'ink', .5); }
    } else if (grow > .6) paint(ellPts(0, -h, 9, 12, 10), { wash: '#F7A8B8', ink: INK, sw: .7 });
    pop();
    if (bloom > 0 && t - BLOOM < .6) for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, r = 40 + 120 * easeOut((t - BLOOM) / .6); sparkle(x + Math.cos(a) * r, y - h + Math.sin(a) * r * .7, 16, '#FFF3C0', (t - BLOOM) / .6); }
    return [x, y + 8 - h];
  }
  function shotSprout(t, lt, dur) {
    const pull = easeInOut(seg(t, BLOOM - .3, B(311))), zoom = lerp(1.8, .92, pull);
    const cx = lerp(FLW[0], 960, pull), cy = lerp(FLW[1] - 150, 600, pull);
    skyGrad([[0, '#C9CDD6'], [1, '#E6E3DE']]);
    camBegin(cx, cy, zoom, 0);
    street(t);
    blossomTree(1560, 700, t);
    // the lamp post
    inkLine([[330, 690], [330, 180], [380, 150]], 5, '#6D6A80', 'marker', .4); paint(ellPts(392, 160, 26, 14, 12), { wash: '#FFE3A0', ink: INK, sw: .8 });
    // little flowers popping in other cracks as the colour passes
    for (let i = 0; i < 14; i++) {
      const fx = FLW[0] + (hash(i * 7.1) - .5) * 1900, fy = 700 + hash(i * 3.3) * 380, g = backOut(clamp((t - reachT(fx, fy)) / .35)); if (g <= 0 || Math.abs(fx - FLW[0]) < 120) continue;
      inkLine([[fx, fy], [fx + 2, fy - 20 * g]], 1, '#5E9A6E', 'ink', 0);
      for (let q = 0; q < 5; q++) { const an = q / 5 * TAU; paint(ellPts(fx + 2 + Math.cos(an) * 6 * g, fy - 20 * g + Math.sin(an) * 6 * g, 5 * g, 5 * g, 8), { wash: ['#F29BB8', '#FFD08A', '#C9B8F0'][i % 3], ink: null }); }
      dot(fx + 2, fy - 20 * g, 3 * g, '#F6C85F');
    }
    // passers-by: hurrying past, until the colour reaches them; then they stop, look and smile
    for (const [x0, y, s, seed, dir] of WALKERS) {
      const tr = reachT(x0 + dir * 150 * 2.5, y), walking = t < tr, tw = Math.min(t, tr) - SP0, x = x0 + dir * 150 * tw;
      const md = mood(t, [[SP0 - 1, 'dot', null, 'flat'], [tr + .1, 'happy', ['heart', 'flower', 'music', 'spark'][seed % 4], 'smile']]);
      const bpw = bpOf(t);
      person(x, y, s, { seed, flip: dir < 0, walk: walking ? bpw * .5 : null, dy: walking ? -Math.abs(Math.sin(bpw * Math.PI)) * .15 : 0, lookX: walking ? (dir > 0 ? .6 : -.6) : (x < FLW[0] ? .8 : -.8) * (dir < 0 ? -1 : 1), lookY: walking ? 0 : .6, ...md, blush: walking ? 0 : .8,
        aL: walking ? -1.1 + .3 * Math.sin(bpw * Math.PI) : -.4, aR: walking ? -1.1 - .3 * Math.sin(bpw * Math.PI) : .6, handR: seed === 3 && walking ? (s2, sw) => paint(rrPts(-.2 * s2, -.2 * s2, 1.5 * s2, 1.1 * s2, .2 * s2), { wash: '#6B4A3A', ink: INK, sw: sw * .6 }) : null });
    }
    // the grey: everything outside the widening ring of colour (she, 桃桃 and the sprout stay in colour, drawn after)
    const R = ringR(t), ring = [];
    for (let i = 0; i <= 44; i++) { const a = -i / 44 * TAU, r = R * (1 + .05 * Math.sin(a * 6 + t * 2)); ring.push([FLW[0] + Math.cos(a) * r, FLW[1] + Math.sin(a) * r * .36]); }
    const outer = [[-1200, -800], [3200, -800], [3200, 1900], [-1200, 1900], [-1200, -800]];
    clipTo(R > 1 ? [...outer, [FLW[0] + R * 1.1, FLW[1]], ...ring, [FLW[0] + R * 1.1, FLW[1]], [-1200, -800]] : outer, () => { grade(.78, 'saturation', '#808080'); grade(.18, 'color', '#9AA6B8'); });
    // her crouching on the left, watering with the peach soda can; 桃桃 peeking from the right
    const bp = bpOf(t), pour = t > POUR0 && t < POUR1;
    const hm = mood(t, [[SP0 - 1, 'look', null, 'o'], [POUR0, 'happy', null, 'smile'], [BLOOM, 'sparkle', 'spark', 'open'], [B(308.5), 'happy', 'heart', 'grin']]);
    const HS = 30, hx = FLW[0] - 150, hy = FLW[1] - 58;                   // she crouches just behind the crack
    const lift = t < POUR0 ? seg(t, POUR0 - .5, POUR0) : 1 - seg(t, POUR1, POUR1 + .4);
    const ho = { outfit: 'home', sit: true, sq: .08, rot: .16, lookX: .75, lookY: .9, blush: .7, ...hm, aR: lerp(-.7, .45, lift), aL: -.4 + .1 * Math.sin(t * 2), dy: .3 + (t > BLOOM ? -.35 * Math.abs(Math.sin(bp * Math.PI)) : 0) };
    const mm = mood(t, [[SP0 - 1, 'normal', null, 'o'], [B(305.5), 'wide', '!', 'O'], [BLOOM + .1, 'star', 'heart', 'grin']]);
    momo(FLW[0] + 150, FLW[1] - 48, 24, { sit: true, flip: true, rot: -.16, lookX: .75, lookY: .9, ...mm, blush: .9, aL: t > BLOOM ? .9 + .3 * Math.sin(t * 9) : -.2, aR: t > BLOOM ? 1.1 : .1, dy: .3 + (t > BLOOM ? -.4 * Math.abs(Math.sin(bp * Math.PI + 1)) : 0) });
    hero(hx, hy, HS, ho);
    const hand = handPt(hx, hy, HS, ho, 1), tip = lerp(.3, 2.25 + (pour ? .06 * Math.sin(t * 6) : 0), lift);
    const can = t < POUR1 + .45;
    if (can) {
      push(); translate(hand[0], hand[1]); rotate(tip); translate(0, 44);
      sodaCan(0, 0, .9, { drops: 1 });
      pop();
      if (pour) {
        const mouth = [hand[0] + Math.sin(tip) * 36, hand[1] - Math.cos(tip) * 36], st = [];
        const aim = [FLW[0] - 4, FLW[1] - 34];
        for (let k = 0; k <= 10; k++) { const u = k / 10; st.push([lerp(mouth[0], aim[0], Math.sqrt(u)) + 3 * Math.sin(u * 9 + t * 20), lerp(mouth[1], aim[1], u)]); }
        inkLine(st, 4.2, '#F7B6C8', 'marker', .5, .8);
        inkLine(st, 1.4, '#FFF3E6', 'fine', .5, .9);
        for (let k = 0; k < 8; k++) { const u = frac(t * 2.2 + k / 8); dot(lerp(mouth[0], aim[0], Math.sqrt(u)) + 7 * Math.sin(k * 3 + t * 9), lerp(mouth[1], aim[1], u), 2.5 + 2.5 * hash(k), '#FFF3E6', .95); }
        for (let k = 0; k < 4; k++) { const a2 = -Math.PI * (.2 + .6 * hash(k + Math.floor(t * 12))); dot(aim[0] + Math.cos(a2) * 16, aim[1] + 10 + Math.sin(a2) * 12, 2.5, '#FFD3E0', .9); }
      }
    }
    const fl = sproutFlower(FLW[0], FLW[1], t);
    light(fl[0], fl[1], 220, '#FFD3E0', .25 * seg(t, BLOOM, BLOOM + .4));
    camEnd();
  }

  // =====================================================================================================
  // Shot 8 · 187.356–192.156 · 至少这一行 要由我说了算
  // She rides a giant pencil across the night sky with 桃桃 holding on behind her, writing one glowing line like a
  // comet's tail: a swoop up from the rooftops, a loop-the-loop, and a one-stroke star to finish it. The star flashes on
  // 算, the camera pulls back, and the line settles into the sky over the sleeping city as the scene goes dark.
  // =====================================================================================================
  const SK0 = 187.356, STAR_C = [3350, 470], STAR_R = 250, STAR_DONE = 190.74;
  const SKY_PATH = (() => {
    const ctrl = [[-420, 1560], [100, 1300], [650, 1080], [1150, 960], [1560, 860], [1900, 700], [2050, 470], [1900, 300], [1680, 420], [1760, 660], [2060, 760], [2460, 640], [2800, 470]];
    const chase = smoothPts(ctrl, .5, false, 10);
    const V = k => [STAR_C[0] + STAR_R * Math.sin(k * TAU / 5), STAR_C[1] - STAR_R * Math.cos(k * TAU / 5)];
    const star = [], order = [4, 1, 3, 0, 2, 4];
    const last = chase[chase.length - 1], v4 = V(4);
    for (let k = 1; k <= 8; k++) star.push([lerp(last[0], v4[0], k / 8), lerp(last[1], v4[1], k / 8) - 30 * Math.sin(k / 8 * Math.PI)]);
    for (let s2 = 0; s2 < 5; s2++) { const a = V(order[s2]), b = V(order[s2 + 1]); for (let k = 1; k <= 12; k++) star.push([lerp(a[0], b[0], k / 12), lerp(a[1], b[1], k / 12)]); }
    for (let k = 1; k <= 10; k++) { const an = -Math.PI * .6 + k / 10 * 1.6, r = 70 * (1 - k / 14); star.push([v4[0] - 40 + Math.cos(an) * r, v4[1] - 60 + Math.sin(an) * r]); }
    const pts = [...chase, ...star], cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    let chaseLen = 0; for (let i = 1; i < chase.length; i++) chaseLen += Math.hypot(chase[i][0] - chase[i - 1][0], chase[i][1] - chase[i - 1][1]);
    return { pts, cum, len: cum[cum.length - 1], chaseLen, V };
  })();
  function skyAt(L) {
    const { pts, cum } = SKY_PATH; L = clamp(L, 0, SKY_PATH.len);
    let lo = 0, hi = cum.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (cum[m] < L) lo = m; else hi = m; }
    const f = (L - cum[lo]) / Math.max(1e-6, cum[hi] - cum[lo]), a = pts[lo], b = pts[hi];
    return [lerp(a[0], b[0], f), lerp(a[1], b[1], f), Math.atan2(b[1] - a[1], b[0] - a[0])];
  }
  const T_STAR0 = B(316.1);
  function penL(t) {                                                     // how far along the path the pencil tip is
    const C = SKY_PATH.chaseLen;
    if (t < T_STAR0) return C * (.02 + .98 * easeIn(seg(t, SK0 - .3, T_STAR0)) * .35 + .98 * .65 * seg(t, SK0 - .3, T_STAR0));
    return lerp(C, SKY_PATH.len, seg(t, T_STAR0, STAR_DONE));
  }
  function skyAngle(L) { const a = skyAt(L - 60), b = skyAt(L + 60); return Math.atan2(b[1] - a[1], b[0] - a[0]); }
  function shotSky(t, lt, dur) {
    const L = penL(t), [px, py] = skyAt(L), done = t - STAR_DONE;
    // camera: chase the riders, pull back for the star, then back again to show the whole line
    const behind = skyAt(L - 260), chaseK = 1 - easeInOut(seg(t, B(315.6), B(317))), wideK = easeInOut(seg(t, STAR_DONE - .1, 192.2));
    let cx = lerp(STAR_C[0] - 240, behind[0] + 120, chaseK), cy = lerp(STAR_C[1] - 70, behind[1] - 60, chaseK), zoom = lerp(.7, 1.12, chaseK);
    cx = lerp(cx, 1650, wideK); cy = lerp(cy, 900, wideK); zoom = lerp(zoom, .44, wideK);
    skyGrad([[0, '#0C1033'], [.55, '#232A6A'], [.85, '#4B3F86'], [1, '#6B4C8E']]);
    const sp = cx * .02;
    starField(t, { x: -sp % 200 - 100, y: 0, w: W + 200, h: 900 }, 110);
    camBegin(cx, cy, zoom, 0);
    glow(1600, 1900, 1800, '#8E5CA8', .35);
    nightCity(t, { x0: -1400, x1: 5000, y: 2150, color: .25, lit: .85 });
    for (let i = 0; i < 26; i++) { const x = -1200 + hash(i * 3.3) * 6000, y = 1700 + hash(i * 7.1) * 400; glow(x, y, 50, '#FF9FC0', .5); }
    // the line: soft glow, bright core, sparkles; brightest near the pencil
    const pts = []; for (let l = 0; l <= L; l += 14) pts.push(skyAt(l));
    pts.push([px, py]);
    const settle = seg(done, 0, 1.2);
    if (pts.length > 2) {
      inkLine(pts, 22, '#FFB3C8', 'marker', 0, .22 + .1 * settle);
      inkLine(pts, 9, '#FFE3A0', 'marker', 0, .45);
      inkLine(pts, 3.2, '#FFFBEA', 'ink', 0, .95);
      for (let l = 120; l < L - 40; l += 170) { const [x, y] = skyAt(l), tw = .5 + .5 * Math.sin(t * 5 + l * .01); sparkle(x + 10 * Math.sin(l), y - 16, 22, l % 340 < 170 ? '#FFF3C0' : '#FFD3E0', .25 + .5 * tw); }
    }
    // the finished star flashes on 算 and stays as a real star
    if (done > 0) {
      const f = Math.exp(-done * 3.5);
      glow(STAR_C[0], STAR_C[1], STAR_R * (1.5 + .9 * f), '#FFE3A0', .3 + .25 * f);
      paint(starPts(STAR_C[0], STAR_C[1], STAR_R * .42 * (1 + .25 * f + .05 * Math.sin(t * 6)), .45, 5), { wash: '#FFF6D8', ink: INK, sw: 1.2 });
      for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + t * .3, r = STAR_R * (1.1 + 1.4 * easeOut(clamp(done / .7))); sparkle(STAR_C[0] + Math.cos(a) * r, STAR_C[1] + Math.sin(a) * r, 30, i % 2 ? '#FFF3C0' : '#FFD3E0', clamp(done / .9)); }
    }
    // the pencil and its riders (after the star they fly on and away)
    // the pencil is held like a pen: its body is raised behind the tip, so the line visibly leaves the tip
    let ex = px, ey = py, ang = skyAngle(L) + .42;
    const angC = skyAngle(SKY_PATH.chaseLen - 1) + .42;
    if (t >= T_STAR0) ang = lerp(angC, .72, easeInOut(seg(t, T_STAR0, T_STAR0 + .25))) + .05 * Math.sin(t * 9);
    if (done > 0) { const k = easeIn(clamp(done / 1.4)); ex = px + 900 * k + 200 * done; ey = py - 520 * k; ang = lerp(.72, -.35, easeInOut(clamp(done / .5))); }
    const d = [Math.cos(ang), Math.sin(ang)], up = [d[1], -d[0]], PL = 640, PS = PL / 148;
    const flip = false;
    push(); translate(ex, ey); rotate(Math.atan2(-d[0], d[1])); scale(PS); pencil(0, 0, 1, 0, '#F6C85F'); pop();
    glow(ex, ey, 70, '#FFF1C2', .9);
    const seat = [ex - d[0] * PL * .55 + up[0] * 34, ey - d[1] * PL * .55 + up[1] * 34];
    const bp = bpOf(t), cheer = done > 0;
    const hm = mood(t, [[SK0 - 1, 'happy', null, 'grin'], [B(314.6), 'sparkle', 'spark', 'open'], [B(316.1), 'normal', null, 'smile'], [STAR_DONE, 'happy', 'heart', 'grin']]);
    const riderRot = ang;
    const scarf = (s, sw) => { const w = []; for (let k = 0; k <= 6; k++) w.push([-k * .75 * s, -4.15 * s + Math.sin(k * 1.3 - t * 14) * .3 * s * k / 6 - k * .1 * s]); inkLine(w, sw * 5, '#F29BB8', 'marker', .5); };
    const HS = 25;
    hero(seat[0], seat[1], HS, { outfit: 'home', sit: true, rot: riderRot, flip, noShadow: true, lookX: .6, lookY: -.1, ...hm, blush: .8, aR: cheer ? 1.3 + .2 * Math.sin(t * 14) : .1, aL: cheer ? 1.0 : -.2, draw: scarf, dy: -.1 * pulse(t, 5) });
    const back = [seat[0] - d[0] * 150, seat[1] - d[1] * 150];
    const mm = mood(t, [[SK0 - 1, 'happy', null, 'grin'], [B(314.6), 'star', 'music', 'O'], [STAR_DONE + .05, 'happy', '!!', 'grin']]);
    momo(back[0] + up[0] * 2, back[1] + up[1] * 2, 20, { sit: true, rot: riderRot, flip, noShadow: true, lookX: .5, ...mm, blush: .9, aR: cheer ? 1.2 + .3 * Math.sin(t * 12) : .5, aL: cheer ? 1.3 : .3, digital: .6, tailSwing: -.4 });
    if (chaseK > .3) for (let i = 0; i < 12; i++) { const o2 = (hash(i) - .5) * 420, bk = 200 + 700 * frac(hash(i + 9) + t * 2.6); inkLine([[ex + up[0] * o2 - d[0] * bk, ey + up[1] * o2 - d[1] * bk], [ex + up[0] * o2 - d[0] * (bk + 160), ey + up[1] * o2 - d[1] * (bk + 160)]], 1, CREAM, 'fine', 0, .6 * chaseK); }
    camEnd();
    if (done > 0 && done < .2) flash(.22 * (1 - done / .2), '#FFF6DE');
  }



  chapter('chorus2', 153.756, 192.156, [[153.756, shotRoad], [158.556, shotScale], [163.356, shotOffice], [168.156, shotWindows], [172.956, shotMoon], [177.456, shotUmbrella], [181.956, shotSprout], [187.356, shotSky]]);
  transition(153.756, 'wash', .9, { c1: PAL.pink, c2: PAL.lilac });
  transition(172.956, 'dissolve', .8);                                  // rooftop at night → up to the moon
})();
