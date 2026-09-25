// c10_goodnight: 晚安 (264.5–290). Moonlight → a peach morning → the cover again.
//
// 264.5 screenOff  Close on the monitor: her hand presses the power button, 桃桃 (dozing on her feet) wakes, waves
//                  goodnight, hugs a little crescent-moon pillow and nods off as the screen fades; the hand clicks the
//                  desk lamp off. Cut to the reverse angle in the dark: the moon comes out, silver light falls on her;
//                  chin on her hands, she whispers goodnight toward the window; 团子 yawns on the bed.
// 269.0 morning    The time-lapse through the window (indigo → peach dawn: the moon sets, the sun comes up behind the
//                  city). Asleep at the desk, she wakes, stretches, opens the sketchbook and makes the first stroke; the
//                  monitor boots and 桃桃 pops up to wave good morning.
// 273.5 ending     Chapter 1's cover composition in warm morning sun, the rain stopped: the camera pulls back out of
//                  the window; the brush title 「还没写完」 and 「未完待续」 appear on the glass; everything fades to paper.
//
// The room's window: room() paints its window with the shared windowView(); for the time-lapse this chapter swaps in
// its own painter (winView: windowView's layout plus a moon, a sun, clouds and a time-of-day palette) for the duration
// of one room() call only (see withWindow). No shared file is changed.
(() => {
  const PJ = '#BFD9EE', PJ_DK = '#94B7D6', MOMO_TOP = '#FFF6EE', MOMO_DK = '#F4CAD8';

  // ---------- key times (from the aligned lyrics; the beat grid drifts in the outro) ----------
  // 关 264.74 掉 264.92 屏 265.34 幕 265.52 跟 265.88 今 266.3 天 266.48 说 266.96 一 267.38 声 267.62 晚 268.34 安 268.58
  // 等 269.18 明 269.66 天 269.84 醒 270.26 来 270.44 接 270.92 着 271.1 写 271.34 接 271.94 着 272.12 喜 272.48 欢 272.66
  const T_PRESS = 264.84, T_WAVE = 265.24, T_PILLOW = 265.74, T_DOZE = 266.02, T_FADE0 = 266.06, T_FADE1 = 266.44;
  const T_LAMP = 266.52, T_CUT = 266.64, T_MOON0 = 266.72, T_MOON1 = 267.3;
  const T_SAY = [266.96, 267.38, 267.62], T_NIGHT = 268.34, T_AN = 268.58, T_YAWN = 268.06;
  const T_LAPSE0 = 269.12, T_LAPSE1 = 270.3, T_WAKE = 270.26, T_STRETCH = 270.4, T_BOOK = 270.96, T_STROKE = 271.34;
  const T_BOOT = 271.94, T_MOMO = 272.3, T_HELLO = 272.66;

  // ---------- small helpers ----------
  const colAt = (k, keys) => {
    if (k <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) if (k < keys[i][0]) return mixCol(keys[i - 1][1], keys[i][1], (k - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]));
    return keys[keys.length - 1][1];
  };
  // a capsule (rounded bar) from (x0, y0) to (x1, y1) with end radii r0, r1
  function capsule(x0, y0, x1, y1, r0, r1 = r0, n = 7) {
    const a = Math.atan2(y1 - y0, x1 - x0), p = [];
    for (let i = 0; i <= n; i++) { const q = a - Math.PI / 2 + i / n * Math.PI; p.push([x1 + Math.cos(q) * r1, y1 + Math.sin(q) * r1]); }
    for (let i = 0; i <= n; i++) { const q = a + Math.PI / 2 + i / n * Math.PI; p.push([x0 + Math.cos(q) * r0, y0 + Math.sin(q) * r0]); }
    return p;
  }
  // A sleeve from (x0, y0) to a round hand at (x1, y1). The chibi arms are too short to reach anything and raised arms
  // hide behind the big hair, so reaching / waving / resting hands are drawn with this. o.finger = pointing angle.
  function sleeveArm(x0, y0, x1, y1, r, o = {}) {
    const col = o.col || PJ, dk = o.dk || PJ_DK, sw = o.sw ?? clamp(r / 10, .45, 1.8);
    const a = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0);
    const wx = x1 - Math.cos(a) * r * .95, wy = y1 - Math.sin(a) * r * .95;
    if (L > r * .8) {
      paint(capsule(x0, y0, wx, wy, r, r * .95), { wash: col, fill: dk, fillOp: 45, bleed: .04, tex: .3, border: .2, ink: PAL.ink, sw });
      if (o.stars !== false && L > r * 3) for (const k of [.32, .66]) {
        const sd = k > .5 ? 1 : -1, px = lerp(x0, wx, k) + Math.cos(a + 1.57) * r * .25 * sd, py = lerp(y0, wy, k) + Math.sin(a + 1.57) * r * .25 * sd;
        paint(starPts(px, py, r * .3, .45, 5, a), { wash: '#FFF3C4', ink: null });
      }
      paint(capsule(wx - Math.cos(a) * r * .5, wy - Math.sin(a) * r * .5, wx, wy, r * 1.04, r * 1.02, 5), { wash: dk, ink: PAL.ink, sw: sw * .8 });
    }
    const hr = r * (o.hand ?? 1.02);
    if (o.finger != null) paint(capsule(x1, y1, x1 + Math.cos(o.finger) * hr * 1.35, y1 + Math.sin(o.finger) * hr * 1.35, hr * .36, hr * .3, 5), { wash: SKIN, ink: PAL.ink, sw: sw * .7 });
    paint(ellPts(x1, y1, hr, hr * .9, 14, 0, a), { wash: SKIN, ink: PAL.ink, sw: sw * .8 });
    if (o.finger != null) paint(ellPts(x1 + Math.cos(o.finger) * hr * .55, y1 + Math.sin(o.finger) * hr * .55, hr * .34, hr * .3, 8), { wash: SKIN, ink: null });
  }
  // screen-blended soft polygon light (moon- and sunbeams), fading from g0 to g1. Soft edges come from three nested
  // copies shrunk toward the centre (a blur filter looks similar but costs ~40 ms a shape once Skia rasterizes).
  function beam(pts, col, a, g0, g1, o = {}) {
    if (a <= .005) return;
    let cx = 0, cy = 0; for (const [x, y] of pts) { cx += x; cy += y; } cx /= pts.length; cy /= pts.length;
    X.save(); X.globalCompositeOperation = o.mode || 'screen'; X.globalAlpha = 1;
    for (const k of o.soft === false ? [1] : [1.06, .8, .55]) {
      const aa = o.soft === false ? a : a * .42;
      const g = X.createLinearGradient(g0[0], g0[1], g1[0], g1[1]);
      g.addColorStop(0, hexA(col, aa * ALPHA)); g.addColorStop(.55, hexA(col, aa * .5 * ALPHA)); g.addColorStop(1, hexA(col, 0));
      X.fillStyle = g; X.fill(pathOf(pts.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k])));
    }
    X.restore();
  }
  // darkness that falls off around a light: a radial multiply (world space), aIn at the centre → aOut outside r
  function darkness(cx, cy, r, sx, aIn, aOut, col) {
    X.save(); X.globalCompositeOperation = 'multiply'; X.globalAlpha = 1;
    X.translate(cx, cy); X.scale(sx, 1);
    const g = X.createRadialGradient(0, 0, r * .06, 0, 0, r);
    g.addColorStop(0, hexA(col, aIn * ALPHA)); g.addColorStop(.5, hexA(col, lerp(aIn, aOut, .5) * ALPHA)); g.addColorStop(1, hexA(col, aOut * ALPHA));
    X.fillStyle = g; X.fillRect(-6000, -6000, 12000, 12000);
    X.restore();
  }
  // little floating dust motes in a sunbeam (world space)
  function motes(t, box, n, col, a, seed = 0) {
    for (let i = 0; i < n; i++) {
      const k = i + seed * 31, x = box.x + frac(hash(k * 1.7) + t * .012 * (hash(k) - .5)) * box.w + Math.sin(t * .6 + k) * 10;
      const y = box.y + frac(hash(k * 3.1) - t * .02 * (.4 + hash(k * 2.2))) * box.h;
      const tw = .5 + .5 * Math.sin(t * (1.2 + hash(k) * 2) + k * 3);
      dot(x, y, 1.2 + hash(k * 5) * 1.8, col, a * (.3 + .7 * tw));
    }
  }
  // hand-lettered z's drifting up from a sleeper
  function zees(t, x, y, s, col, a = 1, seed = 0) {
    if (a <= .01) return;
    for (let i = 0; i < 3; i++) {
      const age = frac(t * .55 + i / 3 + seed), k = Math.sin(age * Math.PI);
      letter('z', x + age * s * 1.6 + Math.sin(t * 2 + i) * s * .12, y - age * s * 2.2, s * (.55 + age * .6), col, { font: 'cute', ink: false, alpha: a * k, rot: -.2 + age * .3 });
    }
  }
  // the monitor's power button and the lamp's switch (small additions to the shared room)
  const PWR = [1478, 646], LAMPBTN = [944, 684];
  function powerButton(on, press) {
    const [x, y] = PWR, r = 8.5 * (1 - .22 * press), py = y + press * 1.5;
    paint(ellPts(x, y + 1, r + 2.5, r + 2.5, 12), { wash: '#CDBFAC', ink: null });
    paint(ellPts(x, py, r, r, 12), { wash: '#EDE3D3', ink: PAL.ink, sw: .6 });
    inkLine([[x - 3.2, py - 2.6], [x - 4.2, py + 1], [x, py + 4.2], [x + 4.2, py + 1], [x + 3.2, py - 2.6]], .45, PAL.gray, 'fine', .6);
    inkLine([[x, py - 4.6], [x, py - .6]], .45, PAL.gray, 'fine', 0);
    const led = on > .5 ? '#8FD19E' : on > .02 ? '#F2B95C' : '#8C8FA3';
    dot(x - 22, y, 3.2, led, 1); if (on > .02) glow(x - 22, y, 12, led, .5 * Math.max(on, .4));
  }
  function lampButton(press) {
    const [x, y] = LAMPBTN;
    paint(rrPts(x - 9, y - 5 + press * 2, 18, 9 - press * 2, 4), { wash: '#F6C8A0', ink: PAL.ink, sw: .55 });
  }

  // ---------- the window: windowView's layout plus a time of day (tau 0 night .. 1 morning) ----------
  const SKY_TOP = [[0, '#161C4A'], [.3, '#282C6C'], [.55, '#6A5B9E'], [.78, '#EE9F93'], [1, '#F6B79A']];
  const SKY_BOT = [[0, '#3B2F6B'], [.3, '#62478A'], [.55, '#EE9A8C'], [.78, '#FFCFA2'], [1, '#FFE3B8']];
  const TOWN = ['#F2B3C2', '#FFD49E', '#B9DCCB', '#C6D3F0', '#DEC3EC', '#FFDDB0'];
  let WIN = null;                                          // state for winView while withWindow() runs
  function skyBodies(x, y, w, h, tau, S = {}) {
    const mk = seg(tau, 0, .5), sk = seg(tau, .4, 1);
    return {
      moon: [lerp(x + w * .26, x + w * .8, easeIn(mk)), lerp(y + h * .2, y + h * 1.02, easeIn(mk)), h * .075, 1 - seg(tau, .4, .5)],
      sun: [x + w * (S.sunX ?? .3), lerp(y + h * 1.12, y + h * (S.sunY ?? .47), easeOut(sk)), h * (S.sunR ?? .085), seg(tau, .4, .48)]
    };
  }
  function winView(x, y, w, h, t, o = {}) {
    const S = WIN || {}, tau = clamp(S.tau ?? 0), rain = clamp(S.rain ?? o.rain ?? 1), night = 1 - seg(tau, .3, .8);
    const { moon, sun } = skyBodies(x, y, w, h, tau, S);
    clipTo(rectPts(x, y, w, h), () => {
      if (S.sky3) { paint(rectPts(x - 20, y - 20, w + 40, h * .55 + 20), { grad: [S.sky3[0], S.sky3[1], Math.PI / 2], ink: null }); paint(rectPts(x - 20, y + h * .55, w + 40, h * .45 + 20), { grad: [S.sky3[1], S.sky3[2], Math.PI / 2], ink: null }); }
      else paint(rectPts(x - 20, y - 20, w + 40, h + 40), { grad: [colAt(tau, SKY_TOP), colAt(tau, SKY_BOT), Math.PI / 2], ink: null });
      const st = 1 - seg(tau, .12, .45);
      if (st > .01) for (let i = 0; i < 22; i++) dot(x + hash(i * 3.3) * w, y + hash(i * 7.1) * h * .5, 1.2 + hash(i) * 1.6, PAL.cream, (.4 + .5 * Math.sin(t * 2 + i)) * st);
      // the sleepy moon sets; clouds race by in the time-lapse; the sun comes up behind the buildings
      if (moon[3] > .01) fadeIn(moon[3], () => moonFace(moon[0], moon[1], moon[2], { rot: -.35 }));
      const drift = (t - 264) * 9 + 520 * easeInOut(seg(t, T_LAPSE0, T_LAPSE1)) + (S.cloudOff || 0);
      const cc = colAt(tau, [[0, '#262B63'], [.45, '#5C4F8C'], [.7, '#F4A39A'], [1, '#FFE9DE']]), cs = colAt(tau, [[0, '#1C2152'], [.6, '#C7839A'], [1, '#F4BDB2']]);
      for (let i = 0; i < 3; i++) {
        const cw = w * (.26 + hash(i * 4.4) * .14), span = w + cw * 1.6, cx = x - cw * .8 + frac((hash(i * 9.1) * span + drift * (.7 + .3 * i)) / span) * span;
        paint(cloudPts(cx, y + h * (S.cloudY ? S.cloudY[i] : .1 + .1 * i), cw, h * .065, 3 + i, 6), { wash: cc, washOp: 210, fill: cs, fillOp: 60, bleed: .06, tex: .2, border: .2, ink: null, curv: .45 });
      }
      if (sun[3] > .01) fadeIn(sun[3], () => {
        glow(sun[0], sun[1], sun[2] * (S.sunGlow || 9), '#FFA868', .5); glow(sun[0], sun[1], sun[2] * 3, '#FFE7B0', .75);
        paint(ellPts(sun[0], sun[1], sun[2], sun[2], 28), { wash: '#FFF2CC', ink: null });
        paint(ellPts(sun[0], sun[1], sun[2] * .8, sun[2] * .8, 24), { wash: '#FFFAEA', ink: null });
      });
      // far buildings (windowView's layout): navy with lit windows at night → soft pastel blocks in the morning
      const dayK = seg(tau, .35, 1);
      for (let i = 0; i < 9; i++) {
        const bx = x - 30 + i * w / 8, bw = w / 8 * (.7 + hash(i * 2.7) * .5), bh = h * (.28 + hash(i * 5.1) * .35);
        const day = mixCol(TOWN[i % TOWN.length], '#E0A0A0', .3), col = mixCol('#2A2F5E', day, dayK);
        if (S.detail) paint(rectPts(bx, y + h - bh, bw, bh + 20), { wash: col, fill: mixCol(col, '#7A5A7A', .25), fillOp: 55, bleed: .02, tex: .5, border: .35, ink: mixCol(col, PAL.ink, .45), sw: .6 });
        else paint(rectPts(bx, y + h - bh, bw, bh + 20), { wash: col, washOp: 240, ink: null });
        if (dayK > .1) {                                     // morning sun on the roofs and the sunward walls
          paint(rectPts(S.sunSide > 0 ? bx + bw * .78 : bx, y + h - bh, bw * .22, bh + 20), { wash: '#FFE6C0', washOp: 70 * dayK, ink: null });
          inkLine([[bx + 2, y + h - bh + 2], [bx + bw - 2, y + h - bh + 2]], 1.8, '#FFF0D0', 'marker', 0, .8 * dayK);
        }
        for (let r = 0; r < 6; r++) for (let c = 0; c < 3; c++) if (hash(i * 31 + r * 7 + c) > .55) {
          const hk = hash(i * 13 + r * 5 + c * 3), off = seg(tau, .15 + .5 * hk, .2 + .5 * hk);
          const lit = .85 * (1 - off), glint = dayK > .5 && hash(i * 7 + r + c * 2) > .72;
          const wx = bx + 8 + c * bw / 3.2, wy = y + h - bh + 14 + r * 22;
          if (lit > .02) fillRectA(wx, wy, bw / 6, 9, hash(i + r + c) > .5 ? '#FFD98A' : '#FFB3A0', lit);
          else if (dayK > .1) fillRectA(wx, wy, bw / 6, 9, glint ? '#FFF6DC' : mixCol(col, '#6A5A7A', .25), (glint ? .9 : .45) * dayK);
        }
      }
      bokehField(t, { x, y: y + h * .35, w, h: h * .65 }, 16, ['#FFC77A', '#FF9FB0', '#8FE3D8', '#FFE7A8'], { a: .5 * night + .1 * (1 - tau), seed: 3 });
      if (S.birds) birds(t, x, y, w, h, S.birds);
      if (rain > .01) rainStreaks(t, { x, y, w, h }, Math.round(26 * rain), '#D6E4FF', .45 * rain);
      if (S.drops) glassDrops(t, x, y, w, h, S.drops);
      paint([[x + w * .06, y + 10], [x + w * .22, y + 10], [x + w * .1, y + h * .55], [x + w * .02, y + h * .55]], { wash: '#FFFFFF', washOp: 18 + 16 * seg(tau, .6, 1), ink: null });
    });
  }
  function withWindow(state, fn) {
    const orig = globalThis.windowView; WIN = state; globalThis.windowView = winView;
    try { fn(); } finally { globalThis.windowView = orig; WIN = null; }
  }
  // a few small birds flapping across the morning sky
  function birds(t, x, y, w, h, k) {
    for (let i = 0; i < 3; i++) {
      const u = frac(t * .045 + hash(i * 5.5)), bx = x - 40 + u * (w + 80), by = y + h * (.22 + .1 * i) + Math.sin(t * 1.3 + i) * 8;
      const f = Math.sin(t * 9 + i * 2), s = h * (.018 + .004 * i);
      inkLine([[bx - s * 1.4, by - f * s * .7], [bx - s * .5, by - s * .1], [bx, by + s * .25], [bx + s * .5, by - s * .1], [bx + s * 1.4, by - f * s * .7]], .9, mixCol(PAL.ink, '#B07A80', .4), 'ink', .5, .8 * k);
    }
  }
  // the last raindrops still clinging to the glass, glinting in the sun
  function glassDrops(t, x, y, w, h, k) {
    for (let i = 0; i < 26; i++) {
      const dx = x + hash(i * 6.1 + 2) * w, dy0 = y + hash(i * 2.9 + 1) * h, slide = hash(i * 8.3) > .75 ? ((t * 14 * hash(i)) % (h * .3)) : 0, dy = dy0 + slide;
      const r = 2.2 + hash(i * 4.7) * 3.2;
      paint(ellPts(dx, dy, r * .85, r, 10), { wash: '#FFFFFF', washOp: 70 * k, ink: '#C9A48E', sw: .25 });
      dot(dx - r * .3, dy - r * .35, r * .32, '#FFFFFF', .85 * k);
      if (hash(i * 3.7) > .6) sparkle(dx + r * .2, dy - r * .5, r * 1.6, '#FFF6D8', frac(t * .35 + hash(i)) * k);
    }
  }

  // ---------- the monitor's screen ----------
  // night: a cosy desktop; 桃桃 is its little mascot, dozing on her feet. At the press the app window tucks itself away,
  // she wakes, waves goodnight, a crescent-moon pillow poofs into her arms and she nods off hugging it.
  function momoAt(r) { return [r.x + r.w * .72, r.y + r.h - 24, 19]; }
  function taskbar(r, a = 1) {
    paint(rrPts(r.x + 10, r.y + r.h - 26, r.w - 20, 20, 8), { wash: '#FFFFFF', washOp: 60 * a, ink: null });
    ['#F29BB8', '#9ED8C4', '#F6C85F', '#8EC3E6'].forEach((c, i) => paint(rrPts(r.x + 24 + i * 24, r.y + r.h - 22, 14, 12, 4), { wash: c, washOp: 230 * a, ink: null }));
  }
  function screenNight(r, t) {
    const press = seg(t, T_PRESS, T_PRESS + .3);
    paint(rectPts(r.x - 4, r.y - 4, r.w + 8, r.h + 8), { grad: ['#3E4390', '#232A61', Math.PI / 2], ink: null });
    for (let i = 0; i < 16; i++) dot(r.x + hash(i * 2.3 + 7) * r.w, r.y + hash(i * 5.9 + 1) * r.h * .6, 1 + hash(i) * 1.4, '#FFF3D0', .35 + .35 * Math.sin(t * 2.4 + i * 1.3));
    const mx0 = r.x + r.w * .15, my0 = r.y + r.h * .24;
    push(); translate(mx0, my0); rotate(Math.sin(t * .8) * .05); translate(-mx0, -my0); moonFace(mx0, my0, 24, { rot: -.4 }); pop();
    // the drawing app shrinks down to the taskbar
    const mz = 1 - easeInOut(seg(t, T_PRESS + .04, T_PRESS + .36));
    if (mz > .02) {
      const ax = r.x + r.w * .36, ay = r.y + r.h * .45;
      push(); translate(lerp(r.x + 50, ax, mz), lerp(r.y + r.h - 16, ay, mz)); scale(mz); translate(-ax, -ay);
      appWindow(r.x + r.w * .1, r.y + 38, r.w * .46, r.h * .58, { sw: .7, content: q => {
        paint(rectPts(q.x, q.y, q.w, q.h), { wash: '#FFFBF2', ink: null });
        inkLine([[q.x + q.w * .2, q.y + q.h * .6], [q.x + q.w * .4, q.y + q.h * .35], [q.x + q.w * .6, q.y + q.h * .55], [q.x + q.w * .8, q.y + q.h * .3]], .6, PAL.steel, 'pencil', .5);
        paint(starPts(q.x + q.w * .7, q.y + q.h * .62, 14, .45, 5), { wash: '#F6C85F', ink: PAL.ink, sw: .5 });
      } });
      pop();
    }
    if (press > 0) paint(rectPts(r.x - 4, r.y - 4, r.w + 8, r.h + 8), { wash: '#14183A', washOp: 90 * press, ink: null });
    taskbar(r, 1 - .6 * press);
    const [mx, my, ms] = momoAt(r);
    momoNight(t, mx, my, ms);
  }
  function momoNight(t, x, y, s) {
    const md = mood(t, [[260, 'closed', null, 'tiny'], [264.3, 'closed', null, 'yawn'], [264.64, 'closed', null, 'tiny'], [T_PRESS + .1, 'normal', '!', 'o'],
      [T_WAVE, 'happy', null, 'open'], [T_PILLOW, 'happy', 'heart', 'smile'], [T_DOZE, 'closed', null, 'tiny']]);
    const wave = seg(t, T_WAVE - .1, T_WAVE + .12) * (1 - seg(t, T_PILLOW - .12, T_PILLOW));
    const hug = seg(t, T_PILLOW - .04, T_PILLOW + .14), doze = ease(seg(t, T_DOZE, T_DOZE + .3));
    const awake = seg(t, T_PRESS + .05, T_PRESS + .2) * (1 - doze), nod = (1 - awake) * (1 - doze);
    const br = move('breathe', t, 2);
    const o = { ...br, ...md, digital: 1, blush: .5 + .4 * hug, rot: Math.sin(t * 1.9) * .05 * nod,
      tilt: nod * (.16 + .1 * Math.sin(t * 2.3)) + .3 * doze + Math.sin(t * 1.7) * .03, dy: .5 * doze - .25 * pulse(t - T_PRESS + .6, 8) * awake * (t < T_WAVE ? 1 : 0),
      sit: doze > .3, emote: md.emote, emoteK: md.emoteK, aL: lerp(-1.15, -.3, hug), aR: wave > .01 ? 1.5 : lerp(-1.15, -.3, hug) };
    if (t > 264.34 && t < 264.7) o.aL = lerp(-1.15, 1.45, seg(t, 264.34, 264.42) * (1 - seg(t, 264.6, 264.68)));   // rubs an eye mid-yawn
    momo(x, y, s, o);
    const sy = y + o.dy * s;
    if (wave > .01) {
      const sh = [x + .95 * s, sy - 3.95 * s], a = -.78 - .42 * Math.sin((t - T_WAVE) * 15) * wave;
      sleeveArm(sh[0], sh[1], sh[0] + Math.cos(a) * 2.6 * s * wave, sh[1] + Math.sin(a) * 2.6 * s * wave, .33 * s, { col: MOMO_TOP, dk: MOMO_DK, stars: false, hand: 1.1 });
    }
    if (hug > .01) {
      // the crescent-moon pillow poofs in, and she hugs it
      const pk = backOut(hug), px = x + .1 * s, py = sy - 3.1 * s;
      if (t - T_PILLOW < .3) for (let i = 0; i < 7; i++) { const a = i / 7 * TAU, d = (t - T_PILLOW + .04) * 110; sparkle(px + Math.cos(a) * d, py + Math.sin(a) * d * .8, 6, '#FFF3D0', seg(t, T_PILLOW - .04, T_PILLOW + .3)); }
      push(); translate(px, py); rotate(.25 + .2 * doze); scale(pk); translate(-px, -py);
      moonFace(px, py, 2.1 * s, { rot: .15 });
      pop();
      for (const sd of [-1, 1]) paint(ellPts(x + sd * 1.25 * s, sy - 3.05 * s + sd * .1 * s, .38 * s, .34 * s, 10), { wash: SKIN, ink: PAL.ink, sw: .5 });
    }
    if (doze > .5) zees(t, x + 2.2 * s, y - 9.2 * s, 1.4 * s, '#FFE3F0', seg(t, T_DOZE + .2, T_DOZE + .45));
  }
  // morning: the boot glow, then the desktop, then 桃桃 pops up and waves good morning
  function screenMorning(r, t) {
    const boot = seg(t, T_BOOT, T_BOOT + .5);
    paint(rectPts(r.x - 4, r.y - 4, r.w + 8, r.h + 8), { grad: ['#FFE2C4', '#F7B9A6', Math.PI / 2], ink: null });
    const cx = r.x + r.w / 2, cy = r.y + r.h * .45;
    if (boot < 1) fadeIn(1 - seg(t, T_BOOT + .35, T_BOOT + .55), () => {       // a little peach logo while it boots
      paint(rectPts(r.x - 4, r.y - 4, r.w + 8, r.h + 8), { wash: '#FFF7EC', ink: null });
      const k = backOut(seg(t, T_BOOT, T_BOOT + .25));
      glow(cx, cy, 90, '#FFC9A8', .6 * k);
      paint(heartPts(cx, cy + 4, 30 * k), { wash: '#F8B99A', ink: PAL.ink, sw: .7 });
      inkLine([[cx, cy - 22 * k], [cx + 8 * k, cy - 34 * k]], .8, PAL.sage, 'ink', 0);
    });
    if (boot > .6) fadeIn(seg(t, T_BOOT + .35, T_BOOT + .55), () => {
      glow(r.x + r.w * .2, r.y + r.h * .25, 70, '#FFF1C8', .7);
      paint(ellPts(r.x + r.w * .2, r.y + r.h * .25, 22, 22, 20), { wash: '#FFF4D6', ink: null });
      for (let i = 0; i < 3; i++) paint(cloudPts(r.x + r.w * (.45 + .2 * i) + Math.sin(t * .5 + i) * 8, r.y + r.h * (.2 + .08 * i), 90, 20, i + 2, 5), { wash: '#FFFFFF', washOp: 200, ink: null, curv: .4 });
      taskbar(r, 1);
      const [mx, my, ms] = momoAt(r);
      momoMorning(t, mx, my, ms);
    });
  }
  function momoMorning(t, x, y, s) {
    const up = seg(t, T_MOMO, T_MOMO + .3); if (up <= 0) return;
    const md = mood(t, [[T_MOMO, 'closed', null, 'o'], [T_MOMO + .25, 'sparkle', null, 'open'], [T_HELLO, 'happy', 'spark', 'grin']]);
    const wave = seg(t, T_HELLO - .12, T_HELLO + .1), rise = (1 - backOut(up)) * 6;
    X.save(); X.beginPath(); X.rect(x - 8 * s, y - 14 * s, 16 * s, 14 * s + 2); X.clip();
    momo(x, y + rise * s, s, { ...move('bounce', t, 1), ...md, digital: 1, blush: .8, aR: wave > 0 ? 1.5 : -.6, aL: -.8 + .4 * wave, dy: -Math.abs(Math.sin((t - T_HELLO) * 6)) * .25 * wave, emote: md.emote, emoteK: md.emoteK });
    X.restore();
    if (wave > .01) {
      const sh = [x + .95 * s, y + rise * s - 3.95 * s], a = -.8 - .42 * Math.sin((t - T_HELLO) * 14) * wave;
      sleeveArm(sh[0], sh[1], sh[0] + Math.cos(a) * 2.6 * s * wave, sh[1] + Math.sin(a) * 2.6 * s * wave, .33 * s, { col: MOMO_TOP, dk: MOMO_DK, stars: false, hand: 1.1 });
    }
  }

  // =================================================================================================
  // 264.5 · 关掉屏幕 跟今天说一声晚安
  // =================================================================================================
  function screenOff(t, lt, dur) {
    if (t < T_CUT) monitorInsert(t); else reverseNight(t);
  }
  // close on the monitor (front view of the room): press → goodnight → the screen fades → the lamp clicks off
  function monitorInsert(t) {
    const on = 1 - ease(seg(t, T_FADE0, T_FADE1)), lampK = t < T_LAMP ? 1 : 0;
    const [cx, cy, z] = kf(t, [[264.2, [1356, 470, 1.98]], [265.9, [1310, 478, 1.84]], [266.64, [1205, 500, 1.6]]], easeInOut);
    camBegin(cx, cy, z);
    withWindow({ tau: 0, rain: .6 }, () => room(t, { lamp: lampK, night: 1, rain: .6, screen: screenNight, screenOn: on, book: 'none', clutter: 0 }));
    const press = t >= T_PRESS ? Math.exp(-(t - T_PRESS) * 9) : 0;
    powerButton(t < T_PRESS ? 1 : on > .02 ? .6 : 0, press);
    lampButton(t >= T_LAMP && t < T_LAMP + .12 ? 1 : 0);
    // her right hand comes in from below and presses the power button; later her left hand clicks the lamp off
    reach(t, 264.44, T_PRESS, 265.4, [1575, 905], [PWR[0] + 5, PWR[1] + 13], 16);
    reach(t, 266.16, T_LAMP, 266.95, [805, 905], [LAMPBTN[0] - 4, LAMPBTN[1] + 12], 16);
    // the lamp goes out: a dusky blue settles in
    const dk = seg(t, T_LAMP, T_LAMP + .08);
    if (dk > 0) grade(.5 * dk, 'multiply', '#4C5590');
    camEnd();
  }
  // a hand that reaches in from `from`, presses at time tp at `to`, and slides back out
  function reach(t, ta, tp, tr, from, to, r) {
    const inK = easeOut(seg(t, ta, tp - .03)), outK = easeIn(seg(t, tp + .2, tr));
    if (inK <= 0 || outK >= 1) return;
    const k = inK * (1 - outK), dx = to[0] - from[0], dy = to[1] - from[1], L = Math.hypot(dx, dy);
    const poke = t >= tp ? 7 * Math.exp(-(t - tp) * 12) * Math.sin(Math.min(Math.PI, (t - tp) * 20)) : 0;
    const hx = from[0] + dx * k + dx / L * poke, hy = from[1] + dy * k + dy / L * poke;
    sleeveArm(hx - dx / L * 320, hy - dy / L * 320, hx, hy, r, { finger: Math.atan2(dy, dx) - .25 });
  }

  // the reverse angle in the dark: the moon comes out; chin on her hands she whispers goodnight toward the window
  const RX = 960, RY = 1000, RS = 44;
  function reverseNight(t) {
    const moon = ease(seg(t, T_MOON0, T_MOON1)), k = easeInOut(seg(t, T_CUT, 269.4));
    camBegin(1095 + 20 * k, 664 + 10 * k, lerp(1.44, 1.54, k));
    roomReverse(t, { night: 1, lamp: 0, screen: 0, clock: 2.2 });
    catOnBed(t);
    const face = heroNight(t, moon);
    deskFront(t, { items: () => { mug(610, 935, 1.1, PAL.rose, 0); } });
    // the room sinks into the dark; the moonlight (from the window behind the camera) opens it up around her and the bed
    darkness(1180, 760, 620, 1.45, lerp(.72, .1, moon), .74, '#2B3263');
    windowPatch(t, moon);
    light(face[0] + 20, face[1] - 20, 260, '#C9D8FF', .16 * moon);
    fairyGlints(t, .8);
    whisper(t, face);
    camEnd();
  }
  function heroNight(t, moon) {
    const look = ease(seg(t, T_MOON0, T_MOON0 + .45)), lean = ease(seg(t, T_MOON0 + .02, T_MOON0 + .42));
    const say = T_SAY.reduce((m, ts) => Math.max(m, t >= ts ? Math.exp(-(t - ts) * 5) : 0), 0);
    const md = mood(t, [[260, 'normal', null, 'flat'], [T_MOON0 + .1, 'sparkle', null, 'o'], [T_SAY[0], 'sparkle', null, 'tiny'], [T_NIGHT, 'happy', null, 'smile'], [T_AN + .32, 'closed', null, 'smile']]);
    const br = move('breathe', t, 1), dy = .95 * lean, lookX = .42 * look, lookY = -.5 * look;
    const tilt = br.tilt - .05 * lean + .16 * ease(seg(t, T_NIGHT, T_NIGHT + .45));
    hero(RX, RY, RS, { ...br, ...md, outfit: 'pajama', sit: true, dy, lookX, lookY, tilt, blush: .5 + .35 * seg(t, T_NIGHT, T_NIGHT + .3),
      mouth: md.mouth === 'tiny' && say > .3 ? 'o' : md.mouth, aL: -1.25, aR: -1.25, ahoge: t > T_AN + .2 ? 'droop' : 'normal' });
    // her hands come up from the desk to cradle her chin
    const neckY = RY + dy * RS - 4.3 * RS;
    if (lean > .01) for (const sd of [-1, 1]) {
      const hx = RX + sd * .58 * RS + Math.sin(tilt) * 2.2 * RS * .3, hy = lerp(RY - 1.2 * RS, neckY + .3 * RS, lean);
      sleeveArm(RX + sd * 1.15 * RS, RY + 1.2 * RS, hx, hy, .36 * RS, { stars: false });
    }
    const fx = lookX * .38 * RS, fy = lookY * .22 * RS;
    return [RX + fx * 1.1 + Math.sin(tilt) * 2.4 * RS, RY + dy * RS - 5.4 * RS + fy];
  }
  // the window's light thrown on the back wall: four panes of moonlight (one path, one soft blur) with raindrop shadows
  function windowPatch(t, k) {
    if (k <= .01) return;
    const P = (u, v) => [lerp(lerp(520, 870, u), lerp(548, 898, u), v), lerp(lerp(330, 306, u), lerp(676, 660, u), v)];
    const path = new ENV.Path2D();
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      const u0 = i * .52, u1 = u0 + .48, v0 = j * .52, v1 = v0 + .48, q = [P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)];
      path.moveTo(...q[0]); for (const p of q) path.lineTo(...p); path.closePath();
    }
    const sweep = ease(clamp(k * 1.4)), [ax, ay] = P(0, 0), [bx, by] = P(1, 1);
    X.save(); X.globalCompositeOperation = 'screen'; X.filter = 'blur(7px)';
    const g = X.createLinearGradient(ax, ay, lerp(ax, bx, 1.6), lerp(ay, by, 1.6));
    g.addColorStop(0, hexA('#BCD0FA', .5 * sweep * ALPHA)); g.addColorStop(.6, hexA('#BCD0FA', .34 * sweep * ALPHA)); g.addColorStop(1, hexA('#BCD0FA', .12 * sweep * ALPHA));
    X.fillStyle = g; X.fill(path); X.restore();
    for (let i = 0; i < 10; i++) {
      const u = hash(i * 4.1), v = frac(hash(i * 2.7) + t * (.05 + hash(i) * .06)), [px, py] = P(u, v);
      dot(px, py, 3 + hash(i * 9) * 3, '#1E244C', .3 * k * Math.sin(v * Math.PI));
    }
  }
  // the fairy lights keep twinkling in the dark (roomReverse's positions)
  function fairyGlints(t, a) {
    for (let i = 0; i <= 24; i += 2) {
      const x = -40 + i * 85, y = 150 + Math.sin(i * .9) * 26 + (i % 2) * 10, on = .6 + .4 * Math.sin(t * 2 + i * 1.7);
      light(x, y + 12, 30, ['#FFD98A', '#FFB3C6', '#BFF0E0'][i % 3], .4 * a * on);
    }
  }
  // tiny glowing breaths of "晚安" drifting up toward the window
  function whisper(t, [mx, my]) {
    for (let j = 0; j < T_SAY.length + 1; j++) {
      const t0 = j < T_SAY.length ? T_SAY[j] : T_NIGHT;
      for (let i = 0; i < 4; i++) {
        const age = t - t0 - i * .07; if (age < 0 || age > 1.4) continue;
        const u = age / 1.4, a = -.6 - .55 * hash(j * 7 + i), d = 30 + 240 * easeOut(u);
        const x = mx + 26 + Math.cos(a) * d + Math.sin(age * 6 + i) * 8, y = my + Math.sin(a) * d * .75;
        const k = Math.sin(u * Math.PI), r = 3 + 5 * u + hash(i + j) * 2;
        if (j === T_SAY.length && i === 0) paint(heartPts(x, y, 9 + 9 * u), { wash: '#FFC9D8', washOp: 230 * k, ink: null });
        else if (i % 2) sparkle(x, y, r * 1.5, '#FFF3C8', u);
        else { glow(x, y, r * 3, '#CFE0FF', .5 * k); dot(x, y, r * .5, '#F4F8FF', .9 * k); }
      }
    }
  }
  function catOnBed(t) {
    const x = 1455, y = 772, s = 25;
    const yk = seg(t, T_YAWN, T_YAWN + .12) * (1 - seg(t, T_YAWN + .8, T_YAWN + .95));
    if (yk <= .01) { cat(x, y, s, { pose: 'sleep', zzz: false, eyes: 'closed' }); return; }
    const op = Math.sin(clamp((t - T_YAWN) / .85) * Math.PI);
    cat(x, y, s, { pose: 'loaf', eyes: 'closed', sq: -.12 * op, rot: -.08 * op, tail: .4 * op });
    // the yawn: the loaf pose's head sits at (-1.5s, -2.2s); follow the body's squash-stretch and tilt
    const sq = -.12 * op, hx = x - 1.5 * s * (1 + sq * .4), hy = y - 2.2 * s * (1 - sq);
    push(); translate(x, y); rotate(-.08 * op); translate(-x, -y);
    paint(ellPts(hx, hy + .62 * s, .34 * s, .44 * s * op, 12), { wash: '#9B3B4F', ink: PAL.ink, sw: .8 });
    paint(ellPts(hx, hy + .82 * s, .2 * s, .14 * s * op, 8), { wash: '#F08A9A', ink: null });
    pop();
  }

  // =================================================================================================
  // 269.0 · 等明天醒来 接着写 接着喜欢
  // =================================================================================================
  const HX = 1160, HFY = 985, HS = 34, HGY = HFY - 1.7 * HS;           // her seat at the desk (back view)
  const BOOK = [968, 738], WR = { x: 170, y: 110, w: 660, h: 500 };
  function morning(t, lt, dur) {
    const tau = ease(seg(t, T_LAPSE0, T_LAPSE1)), boot = ease(seg(t, T_BOOT, T_BOOT + .2));
    const [cx, cy, z] = kf(t, [[268.6, [846, 528, 1.2]], [270.3, [880, 526, 1.23]], [273.9, [1150, 505, 1.46]]], easeInOut);
    camBegin(cx, cy, z);
    const { moon, sun } = skyBodies(WR.x, WR.y, WR.w, WR.h, tau);
    withWindow({ tau, rain: .6 * (1 - seg(t, T_LAPSE0, T_LAPSE0 + .5)) }, () => room(t, { lamp: 0, night: lerp(1, .28, tau), dawn: tau, rain: 0, screen: screenMorning, screenOn: boot, book: 'none', clutter: 0 }));
    powerButton(boot > .02 ? 1 : 0, 0);
    deskBook(t);
    catOnSill(t, tau);
    heroAtDesk(t);
    // the night lifts: moonlight, then the sun
    const nightK = 1 - seg(tau, 0, .55), sunK = seg(tau, .42, 1);
    if (nightK > .01) {
      grade(.5 * nightK, 'multiply', '#4C5590');
      if (moon[3] > .01) light(moon[0], moon[1], 110, '#DDE6FF', .3 * moon[3]);
      beam([[250, 320], [770, 330], [1250, 1040], [560, 1040]], '#AFC2F4', .14 * nightK, [510, 330], [900, 1040]);
    }
    if (sunK > .01) {
      darkness(sun[0], sun[1] + 120, 1250, 1.15, 0, .3 * sunK, '#B07E96');           // rosy shade away from the window
      light(sun[0], Math.min(sun[1], 560), 380, '#FFB978', .45 * sunK);
      beam([[190, 250], [790, 290], [1320, 1060], [540, 1060]], '#FF9E4A', .26 * sunK, [470, 290], [950, 1060]);
      light(BOOK[0] - 30, BOOK[1] - 10, 170, '#FFC98A', .35 * sunK);
      motes(t, { x: 380, y: 360, w: 860, h: 560 }, 30, '#FFF1D0', .75 * sunK, 4);
      grade(.3 * sunK, 'soft-light', '#FF8C4A');
    }
    camEnd();
  }
  // the sketchbook lying closed on the desk; she opens it and the first stroke glows on the fresh page
  const strokeAt = t => { const st = seg(t, T_STROKE - .14, T_STROKE + .1), x0 = BOOK[0] + 58, y0 = BOOK[1] - 11; return [lerp(x0, x0 - 80, ease(st)), y0 - Math.sin(st * Math.PI) * 3, st]; };
  function deskBook(t) {
    const op = ease(seg(t, T_BOOK, T_BOOK + .26)), [bx, by] = BOOK, w = 200;
    bookFlat(bx, by, w, op < .5);
    if (op > 0 && op < 1) {                                  // the cover swinging over
      const fx = bx + (1 - 2 * op) * w / 2 * .9, lift = 34 * Math.sin(op * Math.PI);
      paint([[bx, by - 1], [fx, by - lift - 2], [fx + (op < .5 ? -1 : 1) * 12, by - 22 - lift], [bx + 4, by - 22]], { wash: '#8DA3D1', ink: PAL.ink, sw: .7 });
    }
    const [x1, y1, st] = strokeAt(t);
    if (st > 0) {
      const x0 = BOOK[0] + 58, y0 = BOOK[1] - 11, g = Math.exp(-Math.max(0, t - T_STROKE) * 1.1);
      glow(x1, y1, 110, '#FFD98A', .5 * g + .2);
      inkLine([[x0, y0], [lerp(x0, x1, .5), y0 - 3], [x1, y1]], 2.2, '#F0A838', 'marker', .5);
      inkLine([[x0, y0], [lerp(x0, x1, .5), y0 - 3], [x1, y1]], .9, '#FFF1C0', 'marker', .5);
      sparkle(x1 + 10, y1 - 16, 26, '#FFF3C0', seg(t, T_STROKE, T_STROKE + .9));
      sparkle(x1 + 40, y1 - 30, 14, '#FFF3C0', seg(t, T_STROKE + .15, T_STROKE + .85));
    }
  }
  function catOnSill(t, tau) {
    const x = 690, y = 610, s = 20;
    if (t < T_WAKE) { cat(x, y, s, { pose: 'sleep', zzz: false, eyes: 'closed' }); return; }
    const st = seg(t, T_STRETCH, T_STRETCH + .55), sk = Math.sin(st * Math.PI);
    cat(x, y, s, { pose: 'sit', eyes: sk > .4 ? 'closed' : 'happy', sq: -.14 * sk, look: -.4, tail: .3 * sk });
  }
  function heroAtDesk(t) {
    const x = HX, gy = HGY, s = HS;
    const wake = seg(t, T_WAKE, T_WAKE + .12), up = backOut(seg(t, T_STRETCH - .04, T_STRETCH + .22)), down = ease(seg(t, T_BOOK - .22, T_BOOK - .04));
    const stretch = up * (1 - down), sk = clamp(stretch);
    const reachK = ease(seg(t, T_BOOK - .16, T_BOOK + .02)) * (1 - ease(seg(t, T_STROKE + .6, T_STROKE + .9)));
    const wave = ease(seg(t, T_HELLO + .08, T_HELLO + .3));
    const sleepK = 1 - wake;
    const pop = t > T_WAKE ? .16 * Math.exp(-(t - T_WAKE) * 7) * Math.sin((t - T_WAKE) * 22) : 0;
    const sq = sleepK * (.1 + Math.sin(t * 1.6) * .025) - .12 * sk + pop + Math.sin(t * 2.1) * .015;
    const dy = sleepK * .35 - .18 * sk;
    chair(x, HFY, s, { seat: 3.2, back: false });
    // raised / reaching hands go behind her head: drawn first, so only what shows past the hair is seen
    const sh = side => [x + side * .95 * s, gy - 3.95 * s + dy * s];
    if (stretch > .01) for (const sd of [-1, 1]) { const [ax, ay] = sh(sd); sleeveArm(ax, ay, x + sd * lerp(1.2, 2.5, sk) * s, gy - lerp(4.5, 10.9, stretch) * s + Math.sin(t * 9 + sd) * 2, .34 * s); }
    if (reachK > .01) {
      // the left hand opens the cover, then draws the first line with a pencil
      const [ax, ay] = sh(-1), [x1, y1, st] = strokeAt(t), pk = seg(t, T_BOOK + .2, T_BOOK + .34);
      const tx = lerp(BOOK[0] + 80, x1 + 6, pk), ty = lerp(BOOK[1] - 14, y1 - 12, pk);
      sleeveArm(ax, ay, lerp(ax, tx, reachK), lerp(ay, ty, reachK), .34 * s);
      if (pk > 0 && reachK > .5) pencil(lerp(ax, tx, reachK) - 2, lerp(ay, ty, reachK) + 11, .3 * backOut(pk), -.5, '#F6C85F');
    }
    if (wave > .01) { const [ax, ay] = sh(1), a = -.95 + .22 * Math.sin((t - T_HELLO) * 12); sleeveArm(ax, ay, ax + Math.cos(a) * 5.2 * s * wave, ay + Math.sin(a) * 5.2 * s * wave, .34 * s); }
    hero(x, gy, s, { outfit: 'pajama', sit: true, back: true, sq, dy, tilt: sleepK * -.14 + .06 * Math.sin(t * .9) - .05 * sk, aL: stretch > .01 || reachK > .01 ? 1.5 : .35, aR: stretch > .01 || wave > .01 ? 1.5 : .35,
      ahoge: t < T_WAKE ? 'droop' : 'perk' });
    chair(x, HFY, s, { seat: 3.2, backOnly: true });
    if (sleepK > .01) zees(t, x + 2.2 * s, gy - 9.8 * s, 1.1 * s, '#E9EEFF', sleepK * (1 - seg(t, T_WAKE - .3, T_WAKE)));
  }

  // =================================================================================================
  // 273.5 · (outro) the cover again. Chapter 1 opens on this desk under a rainy night window and flies out through the
  // glass to the office tower where one floor is still lit; here the camera flies back from that tower, now in morning
  // sun, through the glass (a few raindrops left on it) into the room, the desk things sliding in at their own depths.
  // Chapter 1's layout and multiplane maths: window x 360–1560, y 90–700 · desk from y 720 · sketchbook x 420–980,
  // y 780–1000 · glass with a pencil at x 1330 (base y 900) · soda can (1600, 880) · desk lamp at the left edge (off).
  // =================================================================================================
  const CWIN = { x: 360, y: 90, w: 1200, h: 610 }, COPEN = { x: 386, y: 116, w: 1148, h: 558 };
  const TOWER = { x0: 1098, x1: 1204, top: 246 }, TP = [1151, 440];
  const TY = 282, TSZ = 170, tcx = i => 960 + (i - 1.5) * 176;
  const T_TITLE = [279.5, 280.11, 280.71, 281.34], T_SUB = 281.92, T_WINK = 284.34, T_BLINK = 285.3, T_END0 = 286.6, T_END1 = 289.0;
  const SUNX = .92, SUNY = .6, SUNR = .052;
  const zAt = (cam, D) => cam.m >= D * .985 ? 0 : 1 / (1 - cam.m / D);
  const deskD = v => lerp(1, .58, v);
  const deskPt = (cam, x, v) => { const z = zAt(cam, deskD(v)) || 60, y = lerp(720, 1100, v); return [960 + (x - cam.cx) * z, 540 + (y - cam.cy) * z]; };
  const flat = (cam, x, y) => deskPt(cam, x, (y - 720) / 380);
  function endCam(t) {
    const u = ease(seg(t, 273.3, 282.3)), Z0 = 4.3;
    const zg = Math.exp(Math.log(Z0) * (1 - u)) * (1 - .03 * ease(seg(t, 282.3, 290)));
    const k = easeInOut(seg(t, 273.3, 281.8)), cx = lerp(TP[0] + 10, 960, k), cy = lerp(TP[1] - 110, 540, k);
    const ze = zg <= 2.5 ? zg : 2.5 * Math.pow(zg / 2.5, .55);      // beyond the glass the city recedes more slowly
    return { cx, cy, zg, ze, m: 1 - 1 / zg };
  }
  function ending(t, lt, dur) {
    const cam = endCam(t), fade = ease(seg(t, T_END0, T_END1));
    if (fade >= .999) { camBegin(cam.cx, cam.cy, cam.zg); titleInk(t, fade); camEnd(); return; }     // only paper and ink are left
    camBegin(cam.cx, cam.cy, cam.zg); coverWall(t); camEnd();
    // the view through the opening
    const S = (x, y) => [960 + (x - cam.cx) * cam.zg, 540 + (y - cam.cy) * cam.zg];
    const [ox0, oy0] = S(COPEN.x, COPEN.y), [ox1, oy1] = S(COPEN.x + COPEN.w, COPEN.y + COPEN.h);
    X.save(); X.beginPath(); X.rect(ox0, oy0, ox1 - ox0, oy1 - oy0); X.clip();
    camBegin(cam.cx, cam.cy, cam.ze); coverOutside(t); camEnd();
    X.restore();
    // on the glass: the last raindrops and the title; then the frame
    camBegin(cam.cx, cam.cy, cam.zg); glassBeads(t); coverTitle(t); coverFrame(t); camEnd();
    // the desk and what is on it, each at its own depth (the multiplane pull-back)
    if (cam.m < .56) { coverDesk(t, cam); coverLamp(t, cam); coverBook(t, cam); coverGlass(t, cam); coverCan(t, cam); }
    sunlight(t, cam);
    // everything returns to the paper it was painted on; the title lingers a moment as ink
    if (t > T_END0 - .1) { if (fade > 0) stamp(PAPER, fade); camBegin(cam.cx, cam.cy, cam.zg); titleInk(t, fade); camEnd(); }
  }
  const SKY3 = ['#93A7DC', '#EDBDC4', '#FFDCA6'];
  function coverWall(t) {
    paint(rectPts(-900, -900, 3800, 1640), { wash: '#E4C0AA', fill: '#CFA08C', fillOp: 90, bleed: .04, tex: 0, border: 0, ink: null });
    glow(960, 420, 1050, '#FFE0B8', .45);
  }
  function coverOutside(t) {
    paint(rectPts(-900, -800, 3800, 900), { wash: SKY3[0], ink: null });
    paint(rectPts(-900, 700, 3800, 900), { wash: '#E9B6A8', ink: null });
    WIN = { tau: 1, rain: 0, birds: 1, sky3: SKY3, sunX: SUNX, sunY: SUNY, sunR: SUNR, sunSide: 1, sunGlow: 6, detail: 1, cloudOff: 380, cloudY: [.05, .6, .09] };
    try { winView(CWIN.x, CWIN.y, CWIN.w, CWIN.h, t, { rain: 0 }); } finally { WIN = null; }
    // chapter 1's office tower, its late light long off, the morning sun on its face
    const { x0, x1, top: ty } = TOWER, tw = x1 - x0;
    paint([[x0, 720], [x0, ty], [x0 + tw * .5, ty - 10], [x1, ty], [x1, 720]], { wash: '#B7A0BF', fill: '#9A83A9', fillOp: 70, bleed: .03, tex: .4, border: .3, ink: null });
    paint([[x1 - 16, 720], [x1 - 16, ty - 3], [x1, ty], [x1, 720]], { wash: '#FFE1C2', washOp: 170, ink: null });
    inkLine([[x0 + tw * .5, ty - 10], [x0 + tw * .5, ty - 46]], .8, '#7E6C8E', 'fine', 0);
    for (let r = 0; r < 16; r++) {
      const y = ty + 18 + r * 28; if (y > 700) break;
      for (let c = 0; c < 5; c++) { const g = hash(r * 5.1 + c * 1.7); fillRectA(x0 + 9 + c * (tw - 18) / 5, y, (tw - 18) / 5 - 5, 11, g > .82 ? '#FFF3DA' : '#D4C8E6', g > .82 ? .95 : .85); }
    }
    towerBird(t, x0 + tw * .5, ty - 46);
  }
  // a little sparrow perched on the tower's antenna: it preens, then takes off into the morning
  function towerBird(t, ax, ay) {
    const fly = seg(t, 276.1, 280.5), f = fly > 0 ? Math.sin(t * 26) : (Math.sin(t * 5) > .75 ? .6 : 0);
    const x = ax + 3 + 520 * Math.pow(fly, 1.4), y = ay - 7 - 260 * fly + Math.sin(fly * 9) * 10 * fly, s = 1 - .45 * fly, col = '#7A6284';
    if (fly >= 1) return;
    push(); translate(x, y); scale(s); rotate(fly > 0 ? -.25 : Math.sin(t * 2) * .05);
    paint([[-8, 1], [-16, -2], [-15, 3]], { wash: col, ink: null });                                   // tail
    paint(ellPts(0, 0, 8.5, 6.5, 14), { wash: col, ink: PAL.ink, sw: .45 });
    paint(ellPts(1, 2.5, 5, 3.2, 10), { wash: '#F2D8CC', ink: null });                                  // pale breast
    paint(ellPts(6, -5, 4.6, 4.3, 12), { wash: col, ink: PAL.ink, sw: .45 });
    paint([[10, -5.5], [13.5, -4.5], [10, -3.5]], { wash: '#F2B95C', ink: null });                      // beak
    dot(7.4, -6, 1, PAL.ink, 1);
    paint([[-4, -2], [3, -3 - 9 * f], [5, -1]], { wash: mixCol(col, PAL.ink, .2), ink: PAL.ink, sw: .4 });   // wing
    pop();
    if (fly <= 0) inkLine([[ax - 3, ay + 2], [ax + 9, ay + 2]], .6, PAL.ink, 'fine', 0);                  // its feet on the antenna tip
  }
  // the raindrops left on the glass (chapter 1's bead pattern), catching the sun
  function glassBeads(t) {
    const { x, y, w, h } = COPEN;
    for (let i = 0; i < 90; i++) {
      const bx = x + hash(i * 7.31) * w, by = y + hash(i * 3.17) * h, r = 1.2 + hash(i * 1.7) * hash(i * 2.9) * 5;
      dot(bx, by + r * .35, r, '#9E6E6A', .22); dot(bx, by, r, '#FFF3E6', .5); dot(bx - r * .35, by - r * .35, r * .35, '#FFFFFF', .9);
      if (hash(i * 5.3) > .84) sparkle(bx - r * .3, by - r * .4, r * 2.8 + 4, '#FFF6D8', frac(t * .38 + hash(i * 9.1)));
    }
  }
  function coverTitle(t) {
    ['还', '没', '写', '完'].forEach((ch, i) => {
      const p = seg(t, T_TITLE[i] - .12, T_TITLE[i] + .42); if (p <= 0) return;
      const x = tcx(i), y = TY, bx = x - TSZ * .62, by = y - TSZ * .62, S = TSZ * 1.24, c = lerp(-.1, 2.1, easeOut(p)) * S;
      glow(x, y + 6, TSZ * .8, '#FFF1E2', .2 * p);
      const draw = () => letter(ch, x, y, TSZ, '#FFF9F0', { font: 'brush', ink: false, alpha: .97 });
      if (p < 1) clipTo([[bx, by], [bx + c, by], [bx, by + c]], draw); else draw();
      const t1 = T_TITLE[i] + .5 + hash(i * 3) * .6, L = Math.min(12 + hash(i * 7) * 30, Math.max(0, t - t1) * (5 + 4 * hash(i * 2)));   // a dewdrop runs from a stroke
      if (L > 1) { const dx = (hash(i * 5) - .5) * TSZ * .5, y0 = y + TSZ * (.3 + hash(i * 9) * .1); inkLine([[x + dx, y0 - 6], [x + dx + .6, y0 + L * .5], [x + dx - .3, y0 + L]], 1.2, '#FFF9F0', 'fine', .4, .8); dot(x + dx - .3, y0 + L + 2, 3, '#FFF9F0', .9); }
    });
    const k = seg(t, T_SUB, T_SUB + .7);
    if (k > 0) letter('未完待续', 960, TY + 125, 44, '#FFF9F0', { font: 'kai', ink: false, alpha: .95 * ease(k) });
  }
  function titleInk(t, fade) {
    // as the picture fades to paper, the title soaks in as ink, one character after another, and lingers a moment
    const out = 1 - ease(seg(t, 288.4, 289.85));
    ['还', '没', '写', '完'].forEach((c, i) => { const a = ease(seg(t, T_END0 - .1 + i * .12, T_END0 + .4 + i * .12)) * out; if (a > .01) letter(c, tcx(i), TY, TSZ, '#4A3A4C', { font: 'brush', ink: false, alpha: a }); });
    const a2 = ease(seg(t, T_END0 + .5, T_END0 + 1)) * out;
    if (a2 > .01) letter('未完待续', 960, TY + 125, 44, '#6A5A6C', { font: 'kai', ink: false, alpha: a2 });
  }
  function coverFrame(t) {
    const o = CWIN, i = COPEN, fc = '#EADCC8', fd = '#BBA892';
    const bars = [[[o.x, o.y], [o.x + o.w, o.y], [i.x + i.w, i.y], [i.x, i.y]], [[o.x + o.w, o.y], [o.x + o.w, o.y + o.h], [i.x + i.w, i.y + i.h], [i.x + i.w, i.y]],
      [[o.x, o.y + o.h], [i.x, i.y + i.h], [i.x + i.w, i.y + i.h], [o.x + o.w, o.y + o.h]], [[o.x, o.y], [i.x, i.y], [i.x, i.y + i.h], [o.x, o.y + o.h]]];
    bars.forEach((b, k) => paint(b, { wash: k === 0 || k === 3 ? fd : fc, fill: fd, fillOp: 60, tex: .5, ink: PAL.ink, sw: 1.08 }));
    paint(rectPts(i.x, i.y, i.w, i.h), { ink: PAL.ink, sw: .8 });
    inkLine([[o.x + 6, o.y + 5], [o.x + o.w - 6, o.y + 5]], .6, '#FFF6E8', 'fine', 0, .7);
    inkLine([[i.x + 4, i.y + i.h + 4], [i.x + i.w - 4, i.y + i.h + 4]], 2.2, '#FFEBC8', 'marker', 0, .7);         // sun on the sill's lip
    paint([[o.x - 22, o.y + o.h - 2], [o.x + o.w + 22, o.y + o.h - 2], [o.x + o.w + 30, 724], [o.x - 30, 724]], { wash: '#F2E6D4', fill: '#CDBBA4', fillOp: 70, tex: .4, ink: PAL.ink, sw: 1 });
    paint(rectPts(o.x - 30, 724, o.w + 60, 8), { wash: '#6E4A44', washOp: 90, ink: null });
    paint(rrPts(o.x + o.w - 10, 380, 14, 44, 5), { wash: '#CDBBA4', ink: PAL.ink, sw: .7 });
  }
  function coverDesk(t, cam) {
    const vm = clamp((1 - cam.m * 1.15) / .42, 0, 1); if (vm < .02) return;
    const q = [deskPt(cam, -900, 0), deskPt(cam, 2800, 0), deskPt(cam, 960 + 1840 * lerp(1, 1.45, vm), vm), deskPt(cam, 960 - 1860 * lerp(1, 1.45, vm), vm)];
    paint(q, { wash: '#B48660', fill: '#8C6247', fillOp: 85, bleed: .03, tex: 0, border: .2, ink: null });
    for (let k = -8; k <= 9; k++) { const u = 960 + k * 150, a = deskPt(cam, u, 0), b = deskPt(cam, 960 + (u - 960) * lerp(1, 1.45, vm), vm); inkLine([a, b], .7, '#6E4A34', 'fine', 0, .55); }
    for (let k = 0; k < 14; k++) {
      const u0 = 960 + (hash(k * 3.3) - .5) * 2200, pts = [];
      for (let j = 0; j <= 6; j++) { const v = (.06 + j / 6 * .9) * vm, u = 960 + (u0 - 960) * lerp(1, 1.45, v) + Math.sin(j * 1.3 + k) * 8; pts.push(deskPt(cam, u, v)); }
      inkLine(pts, .45, '#7A553C', 'fine', .5, .4);
    }
    const e = deskPt(cam, 0, 0), ez = zAt(cam, 1) || 1;
    paint([[-50, e[1] - 2], [W + 50, e[1] - 2], [W + 50, e[1] + 16 * ez], [-50, e[1] + 16 * ez]], { wash: '#5A3A34', washOp: 70, ink: null });
    // the window's sunlight lying on the desk, reaching toward us
    const wl = [deskPt(cam, 380, .02), deskPt(cam, 1540, .02), deskPt(cam, 1340, .78 * vm), deskPt(cam, -120, .78 * vm)];
    beam(wl, '#FFCB86', .42, deskPt(cam, 960, .02), deskPt(cam, 960, .8 * vm));
  }
  // map page space (0..pw, 0..ph) onto the page whose top-left, top-right and bottom-left corners are p0, p1, p2
  function onPage(p0, p1, p2, pw, ph, fn) {
    push(); X.transform((p1[0] - p0[0]) / pw, (p1[1] - p0[1]) / pw, (p2[0] - p0[0]) / ph, (p2[1] - p0[1]) / ph, p0[0], p0[1]);
    try { fn(); } finally { pop(); }
  }
  function coverBook(t, cam) {
    const zf = zAt(cam, .66); if (!zf || zf > 5) return;
    const F = (x, y) => flat(cam, x, y);
    const cover = [[430, 786], [700, 780], [972, 784], [994, 1008], [700, 1016], [406, 1010]].map(p => F(...p));
    paint(cover.map(([x, y]) => [x - 10, y + 18]), { wash: '#4A2E3A', washOp: 70, ink: null });             // its shadow falls toward us
    paint(cover, { wash: '#6F86B8', ink: PAL.ink, sw: 1 });
    const pageL = [[442, 792], [560, 787], [694, 786], [698, 1004], [560, 1004], [420, 1002]], pageR = [[706, 786], [840, 787], [960, 790], [980, 998], [840, 1004], [702, 1004]];
    for (const pg of [pageL, pageR]) paint(pg.map(p => F(...p)), { wash: '#FCF5E8', fill: '#E6D8C4', fillOp: 50, bleed: .05, tex: .3, border: .2, ink: PAL.ink, sw: .8, curv: .15 });
    paint([[684, 786], [716, 786], [718, 1004], [682, 1004]].map(p => F(...p)), { fill: '#9A8672', fillOp: 55, bleed: .2, tex: .2, border: 0, ink: null });
    for (let k = 0; k < 9; k++) { const [x, y] = F(700, 796 + k * 24); paint(ellPts(x, y, 8, 3.5, 8), { ink: '#4A4A5A', sw: .5 }); }
    // left page: the pencil circles have grown into 桃桃, in full colour (she winks once)
    onPage(F(446, 794), F(692, 790), F(424, 1000), 460, 630, () => {
      const wink = t > T_WINK && t < T_WINK + .42;
      sketch(.12, () => momo(232, 600, 46, { eyes: wink ? 'wink' : 'happy', mouth: wink ? 'grin' : 'smile', blush: .9, aL: -.5, aR: wink ? -.1 : -.6, tilt: wink ? -.12 : Math.sin(t * .9) * .03, noShadow: true, sit: false }));
      paint(starPts(70, 140, 26, .45, 5), { wash: '#F6C85F', ink: PAL.ink, sw: .7 });
      paint(heartPts(400, 120, 22), { wash: '#F29BB8', ink: PAL.ink, sw: .7 });
      paint(starPts(410, 420, 16, .45, 5), { wash: '#FFE3A0', ink: PAL.ink, sw: .6 });
    });
    // right page: a fresh page — the first glowing line, and a new little pencil star (another idea, just arrived)
    const pl = (pts, w = .8) => inkLine(pts.map(p => F(...p)), w, '#6B6A78', 'pencil', .5, .9);
    inkLine([[736, 806], [790, 803], [850, 806], [905, 802]].map(p => F(...p)), 2, '#EFA83A', 'marker', .5);
    inkLine([[736, 806], [790, 803], [850, 806], [905, 802]].map(p => F(...p)), .8, '#FFF1C0', 'marker', .5);
    const dc = [842, 896], zb = zAt(cam, .8) || 1, blinkK = seg(t, T_BLINK, T_BLINK + .07) * (1 - seg(t, T_BLINK + .16, T_BLINK + .24));
    const sp = starPts(0, 0, 50, .5, 5, -Math.PI / 2 + Math.sin(t * 1.3) * .03).map(([x, y]) => F(dc[0] + x, dc[1] + y * .6));
    inkLine([...sp, sp[0], sp[1]], 1.2, '#55545F', 'pencil', .25, 1);
    for (const sd of [-1, 1]) {
      const ex = dc[0] + sd * 13, ey = dc[1] - 2;
      if (blinkK > .5) pl([[ex - 5, ey + 1], [ex, ey + 3], [ex + 5, ey + 1]], .9);
      else { const [x, y] = F(ex, ey); paint(ellPts(x, y, 3 * zb, 3.9 * zb * (1 - blinkK * .8), 8), { wash: '#45444F', ink: null }); dot(x - zb, y - 1.3 * zb, 1 * zb, '#FFFFFF', .9); }
    }
    pl([[dc[0] - 5, dc[1] + 9], [dc[0], dc[1] + 12], [dc[0] + 5, dc[1] + 9]], .8);
    const tw = seg(t, T_BLINK + .1, T_BLINK + .8);
    if (tw > 0 && tw < 1) { const [x, y] = F(dc[0] + 50, dc[1] - 36); sparkle(x, y, 16 * zb, '#FFF3C0', tw); }
    const [lx, ly] = F(700, 900); light(lx, ly, 380, '#FFE6B8', .16);
  }
  // chapter 1's slim pencil (tip at (x, y), body going up)
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
  function coverGlass(t, cam) {
    const z = zAt(cam, deskD((900 - 720) / 380)); if (!z || z > 5) return;
    camBegin(cam.cx, cam.cy, z);
    const gx = 1330, gy = 900, top = 712, wl = 792, rt = 60, rb = 50;
    paint(ellPts(gx - 22, gy + 30, 66, 30, 18), { fill: '#5A3A44', fillOp: 60, bleed: .3, tex: .2, border: 0, ink: null });
    push(); translate(gx - 14, gy + 36); scale(1, .45); glow(0, 0, 62, '#FFF0B8', .8); pop();          // the sun through the water: a bright caustic
    const body = [[gx - rt, top], [gx + rt, top], [gx + rb, gy - 4], [gx - rb, gy - 4]];
    paint(body, { wash: '#E6F0F6', washOp: 60, ink: null });
    inkLine(ellPts(gx, top, rt, 11, 20).slice(10, 21), .6, '#8A7A88', 'fine', .3, .6);
    const pc = () => slimPencil(gx - 14, gy - 14, 336, 13, .21, '#F6C85F');
    clipTo([[gx - 400, 0], [gx + 400, 0], [gx + 400, wl], [gx - 400, wl]], pc);
    clipTo([[gx - rb - 6, wl], [gx + rb + 6, wl], [gx + rb, gy - 6], [gx - rb, gy - 6]], () => { push(); translate(gx + 7, wl); scale(1.18, 1); translate(-gx, -wl); pc(); pop(); });
    const water = [[gx - rt + 5, wl], [gx + rt - 5, wl], [gx + rb, gy - 5], [gx - rb, gy - 5]];
    paint(water, { wash: '#CFE3EC', washOp: 80, fill: '#A9CADB', fillOp: 40, bleed: .05, tex: .2, border: .3, ink: null });
    paint(ellPts(gx, wl, rt - 5, 9, 20), { wash: '#FFF4E4', washOp: 130, ink: '#8A8AA0', sw: .45 });
    inkLine([[gx - rt, top], [gx - rb, gy - 4]], .8, '#6E5E78', 'fine', 0, .75);
    inkLine([[gx + rt, top], [gx + rb, gy - 4]], .8, '#6E5E78', 'fine', 0, .75);
    paint(ellPts(gx, gy - 8, rb, 9, 18), { wash: '#FFF2E2', washOp: 100, ink: '#6E5E78', sw: .6 });
    inkLine(ellPts(gx, top, rt, 11, 20).slice(0, 11), .9, '#6E5E78', 'fine', .3, .8);
    inkLine([[gx - rt + 13, top + 18], [gx - rb + 10, gy - 26]], 2.6, '#FFFFFF', 'marker', 0, .6);
    inkLine([[gx + rt - 11, top + 30], [gx + rb - 9, top + 90]], 1.4, '#FFFFFF', 'marker', 0, .5);
    glow(gx - 20, wl - 14, 40, '#FFF1C8', .55);
    sparkle(gx + 24, wl + 2, 10, '#FFFFFF', frac(t * .5));
    camEnd();
  }
  function coverCan(t, cam) {
    const z = zAt(cam, deskD((880 - 720) / 380)); if (!z || z > 5) return;
    camBegin(cam.cx, cam.cy, z);
    paint(ellPts(1570, 904, 54, 24, 16), { fill: '#5A3A44', fillOp: 60, bleed: .3, tex: .2, border: 0, ink: null });
    sodaCan(1600, 882, 1.45, { drops: .8 });
    inkLine([[1631, 770], [1630, 860]], 2.4, '#FFE8C8', 'marker', 0, .6);                                  // the sun along its right edge
    camEnd();
  }
  const LAMP = { bx: 170, by: 906, ex: 104, ey: 650, hx: 300, hy: 528, ang: .8 };
  function coverLamp(t, cam) {
    const z = zAt(cam, deskD((LAMP.by - 720) / 380)); if (!z || z > 5) return;
    camBegin(cam.cx, cam.cy, z);
    const { bx, by, ex, ey, hx, hy, ang } = LAMP;
    paint(ellPts(bx - 12, by + 16, 96, 22, 18), { fill: '#5A3A44', fillOp: 60, bleed: .3, tex: .2, border: 0, ink: null });
    paint(rrPts(bx - 74, by - 30, 148, 30, 14), { wash: '#E7D8C2', fill: '#B8A58E', fillOp: 70, tex: .4, ink: PAL.ink, sw: 1 });
    paint(ellPts(bx, by - 30, 74, 13, 18), { wash: '#F1E6D6', ink: PAL.ink, sw: .9 });
    paint(rrPts(bx + 30, by - 38, 20, 12, 4), { wash: '#E27A92', ink: PAL.ink, sw: .6 });
    for (const [a, b] of [[[bx, by - 30], [ex, ey]], [[ex, ey], [hx, hy]]]) { inkLine([a, b], 3.4, '#E7D8C2', 'marker', 0); inkLine([a, b], .8, PAL.ink, 'fine', 0); }
    inkLine([[bx + 10, by - 34], [ex + 14, ey + 30]], .5, PAL.ink, 'fine', 0, .6);
    paint(ellPts(ex, ey, 10, 10, 10), { wash: '#B8A58E', ink: PAL.ink, sw: .7 });
    push(); translate(hx, hy); rotate(ang - Math.PI / 2);
    paint([[-26, -58], [26, -58], [64, 18], [-64, 18]], { wash: '#F2C9A2', fill: '#D9956A', fillOp: 60, tex: .4, ink: PAL.ink, sw: 1, curv: .15 });
    paint(ellPts(0, -60, 26, 8, 12), { wash: '#E0A57C', ink: PAL.ink, sw: .7 });
    paint(ellPts(0, 18, 64, 14, 20), { wash: '#8C8074', ink: PAL.ink, sw: .8 });
    pop();
    camEnd();
  }
  // the morning sun pouring in: soft rays from the sun through the glass, motes, a warm bloom
  function sunlight(t, cam) {
    const sx = CWIN.x + CWIN.w * SUNX, sy = CWIN.y + CWIN.h * SUNY, [px, py] = [960 + (sx - cam.cx) * cam.ze, 540 + (sy - cam.cy) * cam.ze];
    const breathe = .85 + .15 * Math.sin(t * .7);
    X.save(); X.setTransform(1, 0, 0, 1, 0, 0);
    for (let i = 0; i < 5; i++) {
      const a = 1.72 + i * .2 + Math.sin(t * .2 + i) * .03, w = .05 + .03 * hash(i), L = 2400;
      beam([[px, py], [px + Math.cos(a - w) * L, py + Math.sin(a - w) * L], [px + Math.cos(a + w) * L, py + Math.sin(a + w) * L]], '#FFD9A0', .2 * breathe, [px, py], [px + Math.cos(a) * 1300, py + Math.sin(a) * 1300]);
    }
    light(px, py, 520 * Math.min(1.6, cam.ze), '#FFCF94', .4);
    X.restore();
    motes(t, { x: 200, y: 120, w: 1500, h: 900 }, 46, '#FFF4DC', .7, 9);
    grade(.22, 'soft-light', '#FF9A5A');
  }

  chapter('goodnight', 264.5, 290, [[264.5, screenOff], [269.0, morning], [273.5, ending]]);
  transition(264.5, 'dissolve', 1.0);
  transition(269.0, 'dark', .7, { col: '#0E1230' });
  transition(273.5, 'dissolve', 1.0);
})();
