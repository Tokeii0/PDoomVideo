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
    const air = n < SEAL_END && u > 0 && u < 1, [pr, hgt] = hopArc(u);
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
    vx: i < 2 ? (i ? 420 : 240) : 150 + hash(i * 7.3) * 900, vy: -(1150 + hash(i * 1.9) * 650), w: (hash(i * 2.2) - .5) * 14, r: 22 + hash(i * 4.4) * 10, sp: hash(i * 9.1) * 20
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
    for (let i = 0; i < 14; i++) coin(px + (hash(i * 3.7) - .5) * 250, py - 16 - hash(i * 6.1) * 70 * (1 - Math.abs(hash(i * 3.7) - .5) * 1.6), 16, (hash(i) - .5) * .6, .4 + hash(i * 2) * .6);
    trophy(px - 50, py - 64, 1.05, -.12);
    crown(px + 62, py - 70, .9, .18);
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
    const hx0 = rx - 20, hy0 = ry - 150, heartY = lerp(hy0, ry - 30, easeInOut(place));
    if (t >= B(265.8)) glowHeart(rx - 20, ry - 30, 38, t, 1 + .5 * Math.exp(-Math.max(0, a) * 3));
    panFront(th, 1);
    // riders: thrown up a little as the pan drops, then land and sit on the rim swinging their legs
    const air = a > 0 && a < .42 ? Math.sin(a / .42 * Math.PI) * 1.6 : 0, landSq = a > .42 && a < .8 ? .16 * Math.exp(-(a - .42) * 9) : 0;
    const settled = t > B(267.5), bp = bpOf(t), swing = settled ? bp * .5 : 0;
    const hm = mood(t, [[158, 'sparkle', null, 'smile'], [B(265.2), 'happy', null, 'smile'], [THUMP, 'wide', '!', 'O'], [B(267), 'happy', 'heart', 'grin'], [B(269.5), 'closed', null, 'smile'], [B(270.6), 'happy', 'music', 'grin']]);
    const S = 26, seatY = ry + 30, hxp = rx - 118;
    const holding = t < B(265.8);
    const ho = { outfit: 'home', run: settled ? swing : null, dy: -air - (settled ? .12 * Math.abs(Math.sin(bp * Math.PI)) : 0), sq: landSq, lookX: holding ? .35 : settled ? .3 : 0, lookY: holding ? -.3 : .2,
      aL: holding ? lerp(1.0, .2, place) : air > 0 ? 1.2 : -.3, aR: holding ? lerp(1.0, .2, place) : air > 0 ? 1.3 : .25 + .12 * Math.sin(t * 3), blush: .8, ...hm, tilt: settled ? .08 * Math.sin(bp * Math.PI) : 0 };
    hero(hxp, seatY + 1.35 * S, S, { ...ho, noShadow: true });
    if (holding) glowHeart(hx0 + (hxp + 20 - hx0) * (1 - place) * .6, heartY - 6 * (1 - place), 38, t, 1);
    const mmo = mood(t, [[158, 'normal', null, 'open'], [THUMP, 'wide', '!!', 'O'], [B(267.1), 'happy', 'music', 'grin'], [B(269.6), 'closed', null, 'cat'], [B(270.7), 'happy', 'heart', 'grin']]);
    momo(rx + 88, seatY + 1.35 * 21, 21, { run: settled ? swing + .25 : null, dy: -air * 1.2 - (settled ? .12 * Math.abs(Math.sin(bp * Math.PI + 1)) : 0), sq: landSq, noShadow: true, lookX: -.4, lookY: .2,
      aL: t < THUMP ? 1.1 + .3 * Math.sin(t * 18) : air > 0 ? 1.3 : .3, aR: t < THUMP ? 1.1 + .3 * Math.sin(t * 18 + 2) : air > 0 ? 1.2 : -.2, blush: .8, ...mmo, tilt: settled ? -.1 * Math.sin(bp * Math.PI) : 0 });
    light(rx - 20, ry - 60, 260, '#FFB3C8', .28);                         // the heart's glow on their faces
    // the flung treasure
    for (const p of LOOT) {
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

  // ---------- temporary stubs for the shots still to paint ----------
  const stub = (name, c) => (t, lt) => { skyGrad([[0, c], [1, PAL.cream]]); letter(name + '  ' + lt.toFixed(2), 960, 400, 60, INK, { font: 'kai', ink: false }); };
  const shotOffice = stub('office', PAL.mint), shotWindows = stub('windows', PAL.navy), shotMoon = stub('moon', PAL.indigo),
    shotUmbrella = stub('umbrella', PAL.gray), shotSprout = stub('sprout', PAL.grayLt), shotSky = stub('skyLine', PAL.night);

  chapter('chorus2', 153.756, 192.156, [[153.756, shotRoad], [158.556, shotScale], [163.356, shotOffice], [168.156, shotWindows], [172.956, shotMoon], [177.456, shotUmbrella], [181.956, shotSprout], [187.356, shotSky]]);
  transition(153.756, 'wash', .9, { c1: PAL.pink, c2: PAL.lilac });
})();
