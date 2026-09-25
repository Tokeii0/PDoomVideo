// c05_days.js: Chapter 5 "日子" (105.756–135.156): the piano interlude and the fast second verse.
//   1 · a time-lapse of her room: days flicker past, the tear-off calendar sheds pages, the clock spins, and on the
//       monitor 桃桃 grows from a pencil sketch into an app mascot
//   2 · a cosy rainy night: headphones, notes drifting up, 桃桃 dancing in the screen corner, 团子 asleep on the laptop
//   3–10 · eight quick verse-2 gags, one clear idea each: torn drafts in the bin · taping them back (an ant-sized 桃桃
//       carries her own face) · a little face peeking from the corner of an app · the hair-colour slider · the boss's
//       balloon speech · rounding off a button · a café thumbs-up · tea steam turning late nights into golden candy
(() => {
  const B = n => beatT(n);
  const bell = (t, a, b) => Math.sin(clamp((t - a) / (b - a)) * Math.PI);
  const INK = PAL.ink;
  const arcPt = (a, b, h, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k) - h * 4 * k * (1 - k)];

  // ---------- small shared helpers ----------
  function blend(mode, fn) { X.save(); X.globalCompositeOperation = mode; try { fn(); } finally { X.restore(); } }
  // a point in a chibi's body-local space → world (mirrors chibi()'s transform); used to find hands and heads
  function bodyPt(x, y, s, o, px, py) {
    const sq = (o.sq || 0) + (o.take || 0), fx = (o.flip ? -1 : 1) * (o.sx ?? 1) * (1 + sq * .5), fy = (o.sy ?? 1) * (1 - sq), r = o.rot || 0;
    px *= fx; py *= fy;
    return [x + px * Math.cos(r) - py * Math.sin(r), y + ((o.dy || 0) + (o.bob || 0)) * s + px * Math.sin(r) + py * Math.cos(r)];
  }
  function handAt(x, y, s, o, side) {
    const a = side < 0 ? (o.aL ?? -1.2) : (o.aR ?? -1.2), ra = side < 0 ? a : -a, L = side * 1.87 * s;
    return bodyPt(x, y, s, o, side * .95 * s + L * Math.cos(ra), -3.95 * s + L * Math.sin(ra));
  }
  function headAt(x, y, s, o) { const tl = o.tilt || 0; return bodyPt(x, y, s, o, 2.4 * s * Math.sin(tl), -4.3 * s - 2.4 * s * Math.cos(tl)); }
  function sparkBurst(x, y, age, n, R, cols = ['#FFE59A', PAL.cream], life = .55) {
    if (age < 0 || age > life) return;
    const k = age / life;
    for (let i = 0; i < n; i++) {
      const a = i / n * TAU + .4, d = R * easeOut(k), r = R * .17 * (1 - k);
      if (r > 1.2) paint(starPts(x + Math.cos(a) * d, y + Math.sin(a) * d, r, .42, 4, a), { wash: cols[i % cols.length], ink: INK, sw: .5 });
    }
  }
  function heart(x, y, r, col = '#EE5A83', sw) {
    paint(heartPts(x, y, r), { wash: col, ink: INK, sw: sw ?? clamp(r / 26, .45, 1.3) });
    if (r > 7) paint(ellPts(x - r * .4, y - r * .45, r * .17, r * .1, 8, 0, -.6), { wash: '#FFFFFF', washOp: 180, ink: null });
  }
  // headphones: the band and cups around a head centred at (0, 0) (head-local units of s)
  const HP = '#F6B38E', HP_DK = '#DE8B68';
  function hpBand(s, sw) {
    const band = []; for (let i = 0; i <= 14; i++) { const a = Math.PI + i / 14 * Math.PI; band.push([Math.cos(a) * 3.2 * s, -.2 * s + Math.sin(a) * 3.15 * s]); }
    inkLine(band, sw * 2.6, INK, 'marker', .5); inkLine(band, sw * 1.7, HP, 'marker', .5);
    for (const sd of [-1, 1]) {
      paint(rrPts(sd * 3.1 * s - .62 * s, -.75 * s, 1.24 * s, 1.85 * s, .56 * s), { wash: HP, fill: HP_DK, fillOp: 60, tex: .3, border: .3, ink: INK, sw: sw * .7 });
      paint(ellPts(sd * 3.33 * s, .18 * s, .28 * s, .6 * s, 12), { wash: PAL.cream, ink: null });
    }
  }
  const headphones = (s, sw) => hpBand(s, sw);
  function phonesOn(x, y, s, o, k = 1) {                // over a back-view head (the head hook only runs for front views)
    if (k <= .01) return;
    const [hx, hy] = headAt(x, y, s, o);
    push(); translate(hx, hy); rotate((o.rot || 0) + (o.tilt || 0)); scale(k); hpBand(s, clamp(s / 19, .32, 2.3)); pop();
  }
  function musicNote(x, y, sz, col, rot = 0, dbl = false) {
    push(); translate(x, y); rotate(rot);
    const sw = clamp(sz / 34, .45, 1.3), hd = hx => paint(ellPts(hx, 0, sz * .44, sz * .32, 12, 0, -.45), { wash: col, ink: INK, sw });
    if (dbl) {
      paint([[sz * .34, -sz * 1.34], [sz * 1.3, -sz * 1.52], [sz * 1.3, -sz * 1.22], [sz * .34, -sz * 1.04]], { wash: INK, ink: null });
      inkLine([[sz * 1.28, -sz * .16], [sz * 1.28, -sz * 1.46]], sw * .9, INK, 'ink', 0);
      hd(sz * .94);
    } else inkLine([[sz * .36, -sz * 1.3], [sz * .86, -sz * .98], [sz * .8, -sz * .55]], sw * .9, INK, 'ink', .5);
    inkLine([[sz * .36, -sz * .12], [sz * .36, -sz * 1.32]], sw * .9, INK, 'ink', 0);
    hd(0);
    pop();
  }
  // mouse pointer (tip at x, y); press 0..1 squashes it
  function pointer(x, y, sc = 1, press = 0) {
    push(); translate(x, y); scale(sc * (1 + press * .08), sc * (1 - press * .12));
    paint([[0, 0], [0, 46], [11, 36], [19, 54], [28, 50], [20, 33], [34, 32]], { wash: PAL.cream, ink: INK, sw: 1.1 });
    pop();
    if (press > .05) for (let i = 0; i < 5; i++) { const a = -2.4 + i * .35, d = 18 + 16 * press; inkLine([[x + Math.cos(a) * d, y + Math.sin(a) * d], [x + Math.cos(a) * (d + 10), y + Math.sin(a) * (d + 10)]], .8, INK, 'fine', 0, press); }
  }
  // konpeito: a little bumpy star candy
  function candy(x, y, r, col, rot = 0, a = 1) {
    if (r < .8 || a < .02) return;
    const pts = []; for (let i = 0; i < 16; i++) { const an = rot + i / 16 * TAU, q = r * (1 + .2 * Math.cos(i * Math.PI)); pts.push([x + Math.cos(an) * q, y + Math.sin(an) * q]); }
    fadeIn(a, () => {
      glow(x, y, r * 3, col, .35);
      paint(pts, { wash: col, ink: INK, sw: clamp(r / 14, .35, .8), curv: .5 });
      paint(ellPts(x - r * .3, y - r * .32, r * .28, r * .2, 8), { wash: '#FFFFFF', washOp: 200, ink: null });
    });
  }

  // =====================================================================================
  // SHOT 1 · 105.756–110.556 · (piano) the days go by: a time-lapse of her room
  // =====================================================================================
  const TLB = 176, tlB = t => bpOf(t) - TLB;
  function tlHours(t) {                         // 0 = midnight · a slow start, 12 h a beat, then it brakes after the last dusk
    const b = tlB(t);
    if (b < 1) { const u = Math.max(0, b); return 6 * u * u; }
    if (b < 6) return 6 + 12 * (b - 1);
    return 66 + 4 * (1 - Math.pow(1 - clamp((b - 6) / 2), 6));
  }
  const hmod = h => ((h % 24) + 24) % 24;
  const nightOf = h => clamp(.5 + .85 * Math.cos(h / 24 * TAU));
  const dawnOf = h => { const m = hmod(h); return clamp(Math.exp(-Math.pow((m - 6.2) / 1.6, 2)) + .9 * Math.exp(-Math.pow((m - 17.8) / 1.6, 2))); };
  // her day: at the desk at night (n = which night), dashing out at dawn (beats 1, 3, 5), dashing home before dusk (2, 4, 6)
  function tlHer(b) {
    for (const k of [1, 3, 5]) if (b >= k && b < k + .42) return { kind: 'out', u: (b - k) / .42 };
    for (const k of [2, 4, 6]) if (b >= k - .4 && b < k) return { kind: 'in', u: (b - k + .4) / .4 };
    if (b < 1) return { kind: 'desk', n: 0, u: clamp(.4 + b * .6), age: 9 };
    for (const [k, n] of [[2, 1], [4, 2]]) if (b >= k && b < k + 1) return { kind: 'desk', n, u: b - k, age: (b - k) * BEAT };
    if (b >= 6) return { kind: 'desk', n: 3, u: (b - 6) / 2, age: (b - 6) * BEAT };
    return { kind: 'away' };
  }
  function toast(s, sw) {                        // a slice of toast in her mouth (head hook)
    push(); translate(.45 * s, 1.62 * s); rotate(.3);
    paint(rrPts(-.72 * s, -.66 * s, 1.44 * s, 1.3 * s, .42 * s), { wash: '#D9924E', ink: INK, sw: sw * .6 });
    paint(rrPts(-.56 * s, -.5 * s, 1.12 * s, 1.0 * s, .32 * s), { wash: '#FBE2B0', ink: null });
    pop();
  }
  function tote(s, sw) {                         // canvas tote on her shoulder (body hook)
    inkLine([[.6 * s, -4.15 * s], [1.3 * s, -3.0 * s], [1.55 * s, -2.35 * s]], sw * .8, '#B77D52', 'marker', .3);
    paint(rrPts(1.0 * s, -2.45 * s, 1.45 * s, 1.45 * s, .22 * s), { wash: '#F1E0C0', fill: '#D9C29A', fillOp: 60, tex: .4, ink: INK, sw: sw * .6 });
    paint(heartPts(1.72 * s, -1.72 * s, .3 * s), { wash: PAL.rose, ink: null });
  }
  function dasher(t, x, outfit, dir, a = 1) {
    const bp = bpOf(t) * 2, sw = Math.sin(bp * TAU);
    const o = { outfit, run: bp, dy: -Math.abs(Math.sin(bp * Math.PI)) * .6, rot: dir * .16, lookX: dir, aL: -.5 + .9 * sw, aR: -.5 - .9 * sw, eyes: 'happy', mouth: 'grin', ahoge: 'perk', blush: .7 };
    if (outfit === 'office') Object.assign(o, { eyes: 'closed', mouth: 'o', head: toast, draw: tote, ahoge: 'normal' });
    fadeIn(a, () => hero(x, 985, 34, o));
  }
  // the drawing app on her monitor: stage n (0 pencil · 1 inked · 2 coloured · 3 the finished app), progress u
  function drawingApp(r, t, n, u) {
    paint(rectPts(r.x - 4, r.y - 4, r.w + 8, r.h + 8), { wash: '#ECE8F1', ink: null });
    if (n < 3) {
      paint(rectPts(r.x - 4, r.y - 4, 50, r.h + 8), { wash: '#DCD5E8', ink: null });
      [INK, PAL.rose, PAL.sky, PAL.ochre, PAL.sage].forEach((c, i) => paint(ellPts(r.x + 22, r.y + 34 + i * 46, 12, 12, 10), { wash: c, ink: INK, sw: .5 }));
      const cv = { x: r.x + 60, y: r.y + 12, w: r.w - 74, h: r.h - 24 }, mx = cv.x + cv.w / 2, my = cv.y + cv.h - 12;
      paint(rrPts(cv.x, cv.y, cv.w, cv.h, 5), { wash: '#FFFDF7', ink: INK, sw: .5 });
      const art = sk => sketch(sk, () => momo(mx, my, 22, { noShadow: true, aR: .9, eyes: n >= 2 ? 'happy' : 'normal', mouth: 'open' }));
      const paper = () => paint(rectPts(cv.x, cv.y, cv.w, cv.h), { wash: '#FFFDF7', ink: null });
      clipTo(rectPts(cv.x, cv.y, cv.w, cv.h), () => {
        if (n === 0) clipTo(rectPts(cv.x, cv.y, cv.w, cv.h * u), () => art(1));
        else if (n === 1) { art(1); clipTo(rectPts(cv.x, cv.y, cv.w, cv.h * u), () => { paper(); art(.45); }); }
        else { art(.45); clipTo(rectPts(cv.x, cv.y, cv.w * u, cv.h), () => { paper(); art(0); }); }
      });
      if (u < .999) {
        const pe = n === 2 ? [cv.x + cv.w * u, my - 130 + 70 * Math.sin(t * 23)] : [mx - 70 + 140 * frac(t * 3.3), cv.y + cv.h * u];
        pencil(pe[0], pe[1], .38, .55, n === 2 ? PAL.rose : '#F6C85F');
      }
    } else {
      const k = backOut(clamp(u * 3.2)), cx = r.x + r.w / 2, cy = r.y + r.h / 2;
      push(); translate(cx, cy); scale(lerp(.4, 1, k)); translate(-cx, -cy);
      appWindow(r.x + 12, r.y + 10, r.w - 24, r.h - 20, { bar: PAL.pinkLt, sw: .7, content: rr => {
        paint(rrPts(rr.x, rr.y, rr.w * .58, 44, 10), { wash: '#F3EEF8', ink: INK, sw: .5 });
        paint(rrPts(rr.x + 10, rr.y + 10, 24, 24, 7), { wash: PAL.pink, ink: null });
        paint(rrPts(rr.x + 44, rr.y + 16, 120, 12, 6), { wash: '#D8D2E2', ink: null });
        for (let i = 0; i < 3; i++) {
          paint(rrPts(rr.x, rr.y + 58 + i * 50, rr.w * .58, 40, 10), { wash: '#FFFFFF', ink: INK, sw: .5 });
          paint(ellPts(rr.x + 20, rr.y + 78 + i * 50, 9, 9, 10), { wash: [PAL.mint, PAL.peach, PAL.sky][i], ink: null });
          paint(rrPts(rr.x + 40, rr.y + 72 + i * 50, 110 - i * 22, 11, 5), { wash: '#D8D2E2', ink: null });
        }
        const bx = rr.x + rr.w * .63, by = rr.y + 12;
        paint(rrPts(bx, by, 96, 52, 20), { wash: '#FFFFFF', ink: INK, sw: .6 });
        paint([[bx + 58, by + 50], [bx + 74, by + 50], [bx + 76, by + 68]], { wash: '#FFFFFF', ink: INK, sw: .5 });
        heart(bx + 48, by + 26, 14 * (1 + .15 * pulse(t, 5)), '#EE5A83', .5);
        momo(rr.x + rr.w * .82, rr.y + rr.h + 4, 12.5, { digital: 1, noShadow: true, aR: 1.0 + .35 * Math.sin(t * 9), eyes: 'happy', mouth: 'open', dy: -.25 * Math.abs(Math.sin(bpOf(t) * Math.PI)) });
      } });
      pop();
    }
  }
  function skyBodies(h) {                        // the sun and the moon arc across the window
    const m = hmod(h), path = u => [lerp(215, 785, u), 318 - 205 * Math.sin(clamp(u) * Math.PI)];
    clipTo(rectPts(172, 112, 656, 496), () => {
      if (m > 5.2 && m < 18.8) { const [x, y] = path((m - 5.4) / 13.2); glow(x, y, 160, '#FFE3A0', .55); paint(ellPts(x, y, 30, 30, 20), { wash: '#FFE9A8', fill: '#F6B24F', fillOp: 70, bleed: .05, ink: INK, sw: .9 }); }
      const mm = hmod(h + 12);
      if (mm > 5.2 && mm < 18.8) { const [x, y] = path((mm - 5.4) / 13.2); moonFace(x, y, 34, { rot: -.3 }); }
    });
    inkLine([[500, 100], [500, 620]], 3.2, '#E9DCCB', 'marker', 0); inkLine([[160, 360], [840, 360]], 3.2, '#E9DCCB', 'marker', 0);
  }
  function sunPatch(h) {                         // the window's light slides across the floor during the day
    const m = hmod(h); if (m < 6 || m > 18) return;
    const u = (m - 6) / 12, k = Math.sin(u * Math.PI) * (1 - nightOf(h));
    if (k < .02) return;
    const off = lerp(560, -240, u), sk = lerp(280, -180, u);
    blend('screen', () => {
      for (const [x0, x1] of [[176, 494], [506, 824]]) {
        paint([[x0, 612], [x1, 612], [x1 + off, 912], [x0 + off, 912]], { wash: '#FFE8C0', washOp: 26 * k, ink: null });
        paint([[x0 + off, 912], [x1 + off, 912], [x1 + off + sk, 1085], [x0 + off + sk, 1085]], { wash: '#FFE0A8', washOp: 100 * k, ink: null });
      }
    });
  }
  function spinClock(x, y, r, t) {
    const h = tlHours(t), spd = (h - tlHours(t - .04)) / .04;                   // hours per second
    wallClock(x, y, r, h);
    const k = clamp((spd - 2) / 10);
    if (k < .02) return;
    paint(ellPts(x, y, r * .76, r * .76, 26), { wash: INK, washOp: 34 * k, ink: null });   // the minute hand is a blur
    for (let g = 1; g <= 3; g++) { const a = (hmod(h - g * spd * .012) % 12) / 12 * TAU; inkLine([[x, y], [x + Math.sin(a) * r * .5, y - Math.cos(a) * r * .5]], 2.2, INK, 'marker', 0, .35 * k * (1 - g / 4)); }
    for (let i = 0; i < 3; i++) { const a0 = t * 9 + i * 2.1, arc = []; for (let j = 0; j <= 6; j++) arc.push([x + Math.cos(a0 + j * .13) * (r + 13), y + Math.sin(a0 + j * .13) * (r + 13)]); inkLine(arc, .9, INK, 'fine', .5, .6 * k); }
  }
  const CAL = [1400, 176];
  function calPage(x, y, day) {
    paint(rectPts(x - 54, y - 42, 108, 118), { wash: '#FFFBF2', ink: INK, sw: .8 });
    inkLine([[x - 34, y - 24], [x + 34, y - 24]], .7, PAL.rose, 'fine', 0);
    letter(String(day), x, y + 22, 64, INK, { font: 'cute', ink: false });
  }
  function tearCalendar(t, b) {                  // a tear-off calendar: a page flies off every morning
    const [x, y] = CAL, torn = [1, 3, 5].filter(k => b >= k).length;
    paint(rrPts(x - 64, y - 88, 128, 176, 10), { wash: '#E9D8C2', fill: '#C9AE8E', fillOp: 60, tex: .4, ink: INK, sw: 1 });
    paint(rectPts(x - 60, y - 84, 120, 34), { wash: PAL.rose, ink: INK, sw: .8 });
    for (const dx of [-32, 0, 32]) paint(ellPts(x + dx, y - 50, 4, 7, 8), { wash: PAL.gray, ink: INK, sw: .4 });
    calPage(x, y, 12 + torn);
    [1, 3, 5].forEach((k, i) => {
      const age = (b - k) * BEAT; if (age < 0 || age > .75) return;
      const lift = easeOut(clamp(age / .1)), u = clamp((age - .06) / .6), fx = easeOut(u);
      push(); translate(x - 20 * lift - 430 * fx, y - 40 - 26 * lift + 120 * u + 330 * u * u); rotate(-.3 * lift - 3.2 * u);
      scale(1, lerp(1, .5 + .5 * Math.abs(Math.cos(age * 13)), lift));
      fadeIn(1 - seg(age, .45, .75), () => calPage(0, 40, 12 + i));
      pop();
    });
  }
  const CAT_SPOTS = [[420, 935, 20, 'sleep'], [645, 614, 16, 'loaf'], [790, 702, 16, 'sit'], [660, 1000, 20, 'sleep'], [420, 935, 20, 'loaf'], [575, 614, 16, 'sit'], [785, 702, 16, 'loaf']];
  function tlCat(h) {                            // 团子 jumps between favourite spots, time-lapse style
    const p = clamp(Math.floor((h + 6) / 12), 0, 6), [x, y, s, pose] = CAT_SPOTS[p];
    cat(x, y, s, { pose, look: p === 2 ? 1 : p === 5 ? -1 : 0, eyes: pose === 'sleep' ? 'closed' : 'open', zzz: false, seed: p });
  }
  // at the desk: stop-motion snapshots of a night's work; the last night slows into real time and on go the headphones
  function tlDesk(t, b, her) {
    const x = 1160, fy = 985, s = 34, seat = 3.2, y = fy - (seat - 1.5) * s;
    let o, phones = 0;
    if (her.n < 3) {
      const snap = Math.floor(b * 3.3), ph = hash(snap * 3.7 + her.n * 11);
      o = ph < .42 ? {} : ph < .62 ? { aL: 1.55, aR: 1.55, dy: -.1, tilt: -.12 } : ph < .82 ? { aL: .1, aR: 1.0, tilt: .22 } : { dy: .25, tilt: .32, aL: .6, aR: .6 };
    } else {
      const st = ease(seg(b, 6.3, 6.8)) * (1 - ease(seg(b, 6.95, 7.3)));
      o = { aL: lerp(.35, 1.6, st), aR: lerp(.35, 1.6, st), dy: -.12 * st, tilt: -.1 * st };
      if (b > 7.0) { const r = bell(b, 7.0, 7.55); o.aR = lerp(o.aR, 1.95, r); o.tilt = .1 * r; }
      phones = backOut(seg(b, 7.2, 7.45));
      if (b > 7.45) { const m = move('sway', t); o = { ...o, rot: m.rot * .8, tilt: m.tilt, aL: .3, aR: .3 }; }
    }
    if (her.age < .3) o.sq = (o.sq || 0) + .2 * (1 - her.age / .3);
    const ho = { sit: true, back: true, aL: .35, aR: .35, ...move('type', t), outfit: 'home', noShadow: true, ...o };
    chair(x, fy, s, { seat, back: false });
    hero(x, y, s, ho);
    phonesOn(x, y, s, ho, phones);
    chair(x, fy, s, { seat, backOnly: true });
    if (phones > .5) for (let i = 0; i < 2; i++) {
      const age = t - (B(TLB + 7.5) + i * .6); if (age < 0 || age > 2) continue;
      const [hx, hy] = headAt(x, y, s, ho);
      fadeIn(bell(age, 0, 2), () => musicNote(hx + (i ? 1 : -1) * (110 + age * 30), hy - 20 - age * 90, 22, i ? PAL.pink : PAL.mint, Math.sin(age * 4) * .3, i === 1));
    }
  }
  function timelapse(t, lt, dur) {
    const b = tlB(t), h = tlHours(t), night = nightOf(h), dawn = dawnOf(h), her = tlHer(b);
    const pres = her.kind === 'desk' ? 1 : her.kind === 'out' ? 1 - clamp(her.u * 4) : her.kind === 'in' ? clamp((her.u - .75) * 4) : 0;
    const stage = her.kind === 'desk' ? her : { n: b < 2 ? 0 : b < 4 ? 1 : b < 6 ? 2 : 3, u: 1 };
    const pk = easeInOut(seg(t, 105.9, 110.556)), pk2 = easeIn(seg(t, 109.25, 110.6));
    camBegin(lerp(990, 1100, pk) + 90 * pk2, lerp(565, 532, pk) + 12 * pk2, lerp(1.02, 1.18, pk) + .24 * pk2);
    room(t, { lamp: pres * clamp(night * 1.5), night, dawn, rain: b > 6.4 ? .2 + .8 * seg(b, 6.4, 7.6) : .15, screenOn: pres,
      screen: (r, tt) => drawingApp(r, tt, stage.n, stage.u), clutter: .1, book: 'open' });
    skyBodies(h);
    sunPatch(h);
    spinClock(1175, 172, 66, t);
    tearCalendar(t, b);
    tlCat(h);
    if (her.kind === 'desk') tlDesk(t, b, her);
    else {
      chair(1160, 985, 34, { seat: 3.2 });
      if (her.kind !== 'away') {
        const out = her.kind === 'out', dir = out ? -1 : 1, xAt = u => out ? lerp(1150, -280, easeIn(u)) : lerp(-280, 1150, easeOut(u));
        for (let g = 3; g >= 1; g--) { const ug = her.u - g * .09; if (ug > 0) dasher(t - g * .03, xAt(ug), out ? 'office' : 'home', dir, .15 * (4 - g)); }
        dasher(t, xAt(her.u), out ? 'office' : 'home', dir, 1);
      }
    }
    camEnd();
  }

  // =====================================================================================
  // SHOT 2 · 110.556–115.956 · (piano) a cosy rainy night: headphones, notes, 团子 asleep on the warm laptop
  // =====================================================================================
  const NOTE_COLS = ['#F29BB8', '#9ED8C4', '#F6C85F', '#B7A6DA', '#F6B38E'];
  function laptop(cx, y, w, o = {}) {            // an open laptop on the desk; (cx, y) = front centre of its base
    const d = w * .14, h = w * .6;
    paint([[cx - w * .45, y - d], [cx + w * .45, y - d], [cx + w * .43, y - d - h], [cx - w * .43, y - d - h]], { wash: '#D3CCE0', fill: '#A99FC0', fillOp: 50, tex: .3, ink: INK, sw: .9 });
    paint([[cx - w * .385, y - d - 7], [cx + w * .385, y - d - 7], [cx + w * .37, y - d - h + 8], [cx - w * .37, y - d - h + 8]], { wash: o.scr || '#CDEFE6', ink: INK, sw: .5 });
    if (o.draw) o.draw(cx, y - d - h / 2);
    glow(cx, y - d - h / 2, w * .75, PAL.screen, .22);
    paint([[cx - w / 2, y], [cx + w / 2, y], [cx + w * .45, y - d], [cx - w * .45, y - d]], { wash: '#E6E0EC', ink: INK, sw: .9 });
  }
  function holdMug(col = '#F29BB8') {            // a mug held in both hands at her chest (body hook, arms at -1.8)
    return (s, sw) => {
      paint(ellPts(.62 * s, -2.25 * s, .25 * s, .3 * s, 10), { ink: INK, sw: sw * .7 });
      paint(rrPts(-.55 * s, -2.8 * s, 1.1 * s, 1.08 * s, .24 * s), { wash: col, fill: mixCol(col, INK, .15), fillOp: 50, tex: .3, ink: INK, sw: sw * .7 });
      paint(ellPts(0, -2.76 * s, .48 * s, .12 * s, 12), { wash: '#C58A5E', ink: INK, sw: sw * .35 });
      paint(heartPts(0, -2.2 * s, .22 * s), { wash: PAL.cream, ink: null });
      for (const sd of [-1, 1]) paint(ellPts(sd * .55 * s, -2.13 * s, .36 * s, .34 * s, 12), { wash: SKIN, ink: INK, sw: sw * .6 });
    };
  }
  function cozyScreen(r, t) {                    // a little music player; 桃桃 dances in the corner
    paint(rectPts(r.x - 4, r.y - 4, r.w + 8, r.h + 8), { grad: ['#FFF3EA', '#F9DCE8', Math.PI / 2], ink: null });
    const ax = r.x + 28, ay = r.y + 28, as = 118;
    paint(rrPts(ax, ay, as, as, 14), { grad: ['#F7B6C8', '#FFD9A0', .8], ink: INK, sw: .6 });
    paint(ellPts(ax + as / 2, ay + as / 2 + 6, 34, 32, 18), { wash: '#F6A0B8', fill: PAL.coral, fillOp: 60, ink: INK, sw: .6 });
    inkLine([[ax + as / 2, ay + as / 2 - 24], [ax + as / 2 + 4, ay + as / 2 - 36]], .6, PAL.sage, 'fine', 0);
    paint(ellPts(ax + as / 2 + 14, ay + as / 2 - 30, 11, 6, 10, 0, -.4), { wash: PAL.sage, ink: INK, sw: .4 });
    paint(rrPts(ax + as + 24, ay + 12, 170, 14, 7), { wash: '#E3B9C9', ink: null });
    paint(rrPts(ax + as + 24, ay + 38, 110, 11, 5), { wash: '#EBD3DC', ink: null });
    for (let i = 0; i < 12; i++) {
      const hgt = 8 + 44 * Math.abs(Math.sin(t * 2.7 + i * .8)) * (.45 + .55 * pulse(t, 3.5));
      paint(rrPts(ax + as + 24 + i * 15, ay + as - hgt, 10, hgt, 4), { wash: NOTE_COLS[i % 5], ink: null });
    }
    const py = r.y + r.h - 44, prog = .3 + (t - 110) * .012, pw = r.w - 200;
    paint(rrPts(r.x + 28, py, pw, 8, 4), { wash: '#EBD3DC', ink: null });
    paint(rrPts(r.x + 28, py, pw * prog, 8, 4), { wash: PAL.rose, ink: null });
    paint(ellPts(r.x + 28 + pw * prog, py + 4, 8, 8, 10), { wash: PAL.cream, ink: INK, sw: .5 });
    momoDancer(r.x + r.w - 118, r.y + r.h - 6, 10.5, 'dance', t, { digital: 1, noShadow: true, eyes: 'happy', mouth: 'open' });
  }
  function cozy(t, lt, dur) {
    const k = easeInOut(seg(t, 110.3, 116.3));
    const cx = lerp(1000, 1205, k), cy = lerp(625, 690, k), z = lerp(1.22, 1.78, k), cr = lerp(-.025, .02, k);
    camBegin(cx, cy, z, cr);
    room(t, { lamp: 1, night: 1, rain: 1, screen: cozyScreen, clutter: .1, book: 'open' });
    clipTo(rectPts(172, 112, 656, 496), () => rainStreaks(t, { x: 172, y: 112, w: 656, h: 496 }, 34, '#C9D8FF', .4, { fall: true }));
    // 团子 asleep on the warm laptop
    laptop(752, 702, 170);
    for (let i = 0; i < 3; i++) { const ph = frac(t * .5 + i / 3), wx = 700 + i * 50; inkLine([[wx, 660 - ph * 60], [wx + 8, 640 - ph * 60], [wx - 4, 620 - ph * 60]], .8, '#FFD9A0', 'fine', .6, .6 * bell(ph, 0, 1)); }
    cat(752, 690, 18, { pose: 'sleep', eyes: 'closed', zzz: false, seed: 2, sq: .035 * Math.sin(t * 2.3) });
    for (let i = 0; i < 3; i++) { const ph = frac(t * .45 + i / 3); letter('z', 700 - ph * 40 + i * 6, 640 - ph * 110, 18 + ph * 16, '#C9B8F0', { font: 'cute', alpha: bell(ph, 0, 1), stroke: INK, strokeW: .08 }); }
    // her, turned round in her chair, listening
    const hx = 1190, fy = 1010, s = 38, seat = 2.9, m = move('sway', t);
    const md = mood(t, [[110, 'closed'], [112.956, 'happy'], [114.756, 'closed']]);
    const ho = { sit: true, noShadow: true, outfit: 'home', rot: m.rot * 1.5, tilt: m.tilt * 1.9, aL: -1.8, aR: -1.8, ...md, mouth: 'smile', blush: .85, head: headphones, draw: holdMug(), ahoge: 'normal' };
    const hy = fy - (seat - 1.5) * s, hxx = hx + m.dx * s * .35;
    chair(hx, fy, s, { seat });
    hero(hxx, hy, s, ho);
    light(hxx - 60, hy - 7 * s, 330, PAL.lamp, .16);
    // notes drift up from the headphones, one each beat
    const [qx, qy] = headAt(hxx, hy, s, ho);
    for (let n = 360; n <= 386; n++) {
      const age = t - B(n / 2); if (age < 0 || age > 2.7) continue;
      const sd = n % 2 ? 1 : -1, x = qx + sd * (3.4 * s + age * 46) + Math.sin(age * 3 + n) * 18, y = qy - age * 105 - 6 - 30 * hash(n);
      const a = seg(age, 0, .15) * (1 - seg(age, 1.9, 2.7)), sz = 26 + 8 * hash(n * 1.7), popK = 1 + .25 * (1 - seg(age, 0, .25));
      fadeIn(a, () => { glow(x + sz * .4, y - sz * .5, sz * 1.8, NOTE_COLS[n % 5], .3); musicNote(x, y, sz * popK, NOTE_COLS[n % 5], Math.sin(age * 3.5 + n) * .35, n % 3 === 0); });
    }
    camEnd();
    // out-of-focus fairy lights in the foreground drift faster than the room (parallax)
    const px = -(cx - 1100) * 2.6;
    for (let i = 0; i < 10; i++) { const x = ((i * 230 + px + 60) % 2300 + 2300) % 2300 - 190, y = 36 + Math.sin(i * 1.7) * 30; bokeh(x, y, 44 + 16 * hash(i), ['#FFD98A', '#FFB3C6', '#BFF0E0'][i % 3], .3 + .12 * Math.sin(t * 2 + i)); }
    vignette(.25, PAL.night);
  }

  // =====================================================================================
  // THE TORN DRAWING (shots 3 and 4): a pencil drawing of 桃桃 torn into four strips A (top), B (face), C, D
  // =====================================================================================
  function tear(y0, seed, amp = 15) {
    const p = []; for (let i = 0; i <= 12; i++) p.push([-150 + i * 25, y0 + (i === 0 || i === 12 ? (hash(seed + 9 + i) - .5) * 10 : (i % 2 ? 1 : -1) * amp * (.35 + .65 * hash(seed * 17 + i)))]);
    return p;
  }
  const T1 = tear(-120, 1), T2 = tear(62, 2), T3 = tear(128, 3);
  const PIECE = {
    A: { poly: [[-150, -200], [150, -200], ...T1.slice().reverse()], c: [0, -160] },
    B: { poly: [...T1, ...T2.slice().reverse()], c: [0, -30] },
    C: { poly: [...T2, ...T3.slice().reverse()], c: [0, 95] },
    D: { poly: [...T3, [150, 200], [-150, 200]], c: [0, 164] }
  };
  function sheetArt(o = {}) { sketch(.42, () => momo(0, 172, 29, { noShadow: true, aR: .9, eyes: 'normal', mouth: 'smile', ...o })); }
  // one torn piece with its centre at (x, y)
  function piece(key, x, y, rot = 0, sc = 1, o = {}) {
    const P = PIECE[key];
    push(); translate(x, y); rotate(rot); scale(sc); translate(-P.c[0], -P.c[1]);
    if (o.shadow !== false) paint(P.poly.map(p => [p[0] + 7, p[1] + 10]), { wash: INK, washOp: 45, ink: null });
    paint(P.poly, { wash: '#FFFBF2', fill: '#EFE3CF', fillOp: 45, tex: .3, bleed: .02, ink: null });
    clipTo(P.poly, () => { sheetArt(o.art); if (o.glow) glow(P.c[0], P.c[1], 260, '#FFE59A', .5 * o.glow); });
    paint(P.poly, { ink: INK, sw: .8 });
    pop();
  }

  // =====================================================================================
  // SHOT 3 · 115.956–118.656 · 被删去的昨天 还藏在碎片 — digging yesterday's torn drawing out of the bin
  // =====================================================================================
  const BIN = [720, 1002, .82];
  function binBack(x, y, s) {
    paint(ellPts(x, y + 4, 100 * s, 14 * s, 18), { fill: INK, fillOp: 70, bleed: .2, tex: .2, ink: null });
    paint(ellPts(x, y - 230 * s, 108 * s, 25 * s, 24), { wash: '#4B4F78', fill: '#34385E', fillOp: 70, ink: INK, sw: 1 });
  }
  function binFront(x, y, s) {
    const top = y - 230 * s;
    const below = []; for (let i = 0; i <= 14; i++) { const a = i / 14 * Math.PI; below.push([x + Math.cos(a) * 108 * s, top + Math.sin(a) * 25 * s]); }
    const front = [...below, [x - 86 * s, y], [x + 86 * s, y]];
    paint(front, { wash: '#A9BCE4', fill: '#7F95C8', fillOp: 90, bleed: .04, tex: .5, border: .4, ink: INK, sw: 1.1 });
    clipTo(front, () => {
      for (let i = -6; i <= 6; i++) inkLine([[x + i * 22 * s - 30 * s, top], [x + i * 22 * s + 30 * s, y]], .6, '#7385B8', 'fine', 0);
      for (let i = -6; i <= 6; i++) inkLine([[x + i * 22 * s + 30 * s, top], [x + i * 22 * s - 30 * s, y]], .6, '#7385B8', 'fine', 0);
    });
    inkLine(below, 4.2, '#D8E2F6', 'marker', .4); inkLine(below, .9, INK, 'fine', .4);
    inkLine([[x - 86 * s, y - 16 * s], [x + 86 * s, y - 16 * s]], 3.4, '#D8E2F6', 'marker', 0);
  }
  function squatKnees(s, sw) {                   // (body hook) knees drawn up in front: a chibi squat
    for (const sd of [-1, 1]) paint(ellPts(sd * .6 * s, -1.66 * s, .6 * s, .55 * s, 16), { wash: HERO_STYLE.pants, fill: mixCol(HERO_STYLE.pants, INK, .2), fillOp: 50, tex: .3, ink: INK, sw: sw * .75 });
  }
  function fragments(t, lt, dur) {
    const [bx, by, bs] = BIN, top = by - 230 * bs;
    const k1 = easeInOut(seg(t, 115.95, 117.2)), k2 = easeInOut(seg(t, 117.3, 118.8));
    camBegin(lerp(lerp(880, 845, k1), 832, k2), lerp(lerp(800, 768, k1), 755, k2), lerp(lerp(1.48, 1.68, k1), 1.8, k2), lerp(0, -.015, k2));
    room(t, { lamp: 1, night: 1, rain: .6, clutter: .9, book: 'open', screenOn: .8 });
    glow(820, 780, 520, PAL.lamp, .28);
    binBack(bx, by, bs);
    // what's inside: crumpled balls and torn strips that start to glow
    const shine = seg(t, 117.6, 118.2);
    if (shine > 0) { glow(bx, top - 10, 300, '#FFE59A', .6 * shine); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * .38, L = 90 + 50 * shine + 20 * Math.sin(t * 5 + i); inkLine([[bx + Math.cos(a) * 40, top + Math.sin(a) * 10], [bx + Math.cos(a) * L * 1.4, top + Math.sin(a) * L]], 2, '#FFE59A', 'marker', 0, .55 * shine); } }
    piece('A', bx - 40, top + 8, -.35, .34, { shadow: false, glow: shine });
    piece('D', bx + 50, top + 4, .4, .3, { shadow: false, glow: shine });
    for (const [dx, dy, sc, sd] of [[-70, 10, 1.1, 1], [10, -6, 1.2, 2], [74, 16, 1.0, 3], [-20, 22, 1.1, 4]]) paperBall(bx + dx, top + dy + 16, sc, sd);
    // balls flying out over her shoulder while she digs
    [115.95, 116.25, 116.52].forEach((t0, i) => {
      const age = t - t0; if (age < 0 || age > .75) return;
      const [x, y] = arcPt([bx + (i - 1) * 30, top], [bx + 430 + i * 130, by - 10], 330 + i * 50, age / .75);
      push(); translate(x, y); rotate(age * 12); paperBall(0, 15, 1.5, 7 + i); pop();
    });
    // her, crouched by the bin
    const x = 935, y = 1005, s = 40;
    const dig = t < 116.556 ? Math.sin(t * 26) : 0, lift = easeOut(seg(t, 116.6, 117.1));
    const md = mood(t, [[115.9, 'look', null, 'pout'], [116.556, 'wide', '!', 'o'], [117.156, 'sparkle', 'spark', 'open'], [117.9, 'happy', null, 'smile']]);
    const ho = { sit: true, dy: .55, sq: .04 + .02 * dig, outfit: 'home', lookX: lerp(-.75, -.45, lift), lookY: lerp(.35, -.1, lift), tilt: lerp(-.1, .1, lift),
      aL: t < 116.556 ? -.7 + .22 * dig : lerp(-.7, .95, lift), aR: -1.25, ...md, blush: lerp(.45, 1, seg(t, 117.9, 118.2)), draw: squatKnees,
      brows: t < 116.556 ? 'worried' : null, ahoge: t > 116.556 ? 'perk' : 'normal', dy2: 0 };
    ho.dy += t < 116.556 ? .06 * Math.abs(dig) : -.08 * bell(t, 117.156, 117.45);
    hero(x, y, s, ho);
    binFront(bx, by, bs);
    // yesterday's face, held up to the light
    const [hx, hy] = handAt(x, y, s, ho, -1), inBin = [bx + 20, top + 30], up = [hx - 118, hy - 48];
    const pp = lift > 0 ? [lerp(inBin[0], up[0], lift), lerp(inBin[1], up[1], lift)] : inBin;
    if (t > 116.556) {
      if (t > 117.1) glow(pp[0], pp[1], 240, '#FFE59A', .35 + .15 * pulse(t, 3));
      piece('B', pp[0], pp[1], lerp(.5, -.1, lift) + .04 * Math.sin(t * 3), lerp(.3, .78, lift), { art: t > 117.8 && t < 118.2 ? { eyes: 'wink' } : t > 118.2 ? { eyes: 'happy', mouth: 'open' } : {} });
      paint(ellPts(hx, hy, .36 * s, .34 * s, 12), { wash: SKIN, ink: INK, sw: .7 });
      sparkBurst(pp[0], pp[1], t - 117.156, 10, 190);
      sparkle(pp[0] + 100, pp[1] - 70, 14, '#FFF3C0', frac(t * 1.3)); sparkle(pp[0] - 110, pp[1] + 40, 11, '#FFF3C0', frac(t * 1.3 + .5));
    }
    camEnd();
  }

  // =====================================================================================
  // SHOT 4 · 118.656–121.356 · 我沿着痕迹 把故事慢慢接完 — taping the pieces back; a tiny 桃桃 hauls her own face over
  // =====================================================================================
  const SC = [1215, 525], PS = 1.12;
  const slot = key => [SC[0] + PIECE[key].c[0] * PS, SC[1] + PIECE[key].c[1] * PS];
  const TRAIL = { D: [615, 745, -.32], C: [690, 560, .28], A: [805, 385, -.18] };
  const LAND = { D: B(198), C: B(199), A: B(199.75), B: B(200.5) };
  // tape strips: [time laid, x0, x1, y (sheet units), rotation]
  const TAPES = [[B(198) + .2, -150, -95, 196, -.6], [B(198) + .3, 95, 150, 196, .6], [B(199) + .2, -145, 145, 126, 0],
    [B(199.75) + .18, -150, -95, -196, .6], [B(199.75) + .28, 95, 150, -196, -.6], [B(200.5) + .1, -145, 145, 60, 0], [B(200.5) + .28, -145, 145, -121, 0]];
  function tapeStrip(x0, x1, y, rot, k) {       // in sheet units; k = how much has been laid
    if (k <= 0) return;
    const L = (x1 - x0) * k, cx = x0 + L / 2, h = 26;
    push(); translate(cx, y); rotate(rot);
    const pts = [[-L / 2, -h / 2], [L / 2, -h / 2]]; for (let i = 0; i <= 4; i++) pts.push([L / 2 + (i % 2 ? 4 : 0), -h / 2 + h * i / 4]);
    pts.push([-L / 2, h / 2]); for (let i = 4; i >= 0; i--) pts.push([-L / 2 - (i % 2 ? 4 : 0), -h / 2 + h * i / 4]);
    paint(pts, { wash: '#F4E6B0', washOp: 120, ink: '#B9A36A', sw: .5 });
    paint(rectPts(-L / 2, -h / 2 + 3, L, 4), { wash: '#FFFFFF', washOp: 70, ink: null });
    pop();
  }
  function bigHandTop(x, y, rot, o = {}) {       // her hand seen from above, coming in from the lower right with a tape roll
    push(); translate(x, y); rotate(rot);
    paint([[30, 22], [52, -26], [640, 250], [590, 350]], { wash: PAL.sage, fill: '#7EA78E', fillOp: 60, tex: .4, ink: INK, sw: 1.2 });   // sleeve
    paint(rrPts(18, -40, 70, 86, 24).map(([a, b]) => [a + b * .4, b]), { wash: mixCol(PAL.sage, PAL.cream, .3), ink: INK, sw: 1.1 });  // cuff
    if (o.roll !== false) { paint(ellPts(-40, -30, 30, 30, 20), { wash: '#F4E6B0', washOp: 220, ink: INK, sw: 1 }); paint(ellPts(-40, -30, 14, 14, 14), { wash: DESK, ink: INK, sw: .8 }); }
    paint(ellPts(0, 0, 46, 42, 22), { wash: SKIN, ink: INK, sw: 1.2 });
    paint(ellPts(-26, 26, 15, 21, 14, 0, -.6), { wash: SKIN, ink: INK, sw: 1 });
    pop();
  }
  function tapeUp(t, lt, dur) {
    const [cx, cy, z, cr] = kf(t, [[118.6, [720, 610, 1.3, -.025]], [119.3, [790, 600, 1.3, -.02]], [120.2, [1010, 565, 1.36, -.01]], [121.4, [1105, 545, 1.46, .008]]], easeInOut);
    camBegin(cx, cy, z, cr);
    const glowK = bell(t, B(201) - .05, B(201) + .55);
    deskTop(t, { lamp: 1, items: () => {
      paint(ellPts(1660, 300, 70, 70, 20), { wash: '#F29BB8', ink: INK, sw: 1 });                 // mug from above
      paint(ellPts(1660, 300, 54, 54, 18), { wash: '#C58A5E', ink: null });
      pencil(1540, 860, .9, 2.2, '#F6C85F');
    } });
    // the dotted trail the pieces lie along
    const trail = [[330, 905], [520, 820], [615, 745], [690, 560], [805, 385], [960, 330], [1080, 420]];
    const tp = resample(smoothPts(trail, .5, false), false, 9);
    for (let i = 0; i < tp.length - 1; i += 3) inkLine([tp[i], tp[Math.min(tp.length - 1, i + 1)]], 1.5, '#6F7390', 'ink', 0, .75);
    // the sheet's outline on the page (where it goes)
    push(); translate(SC[0], SC[1]); scale(PS);
    paint(rectPts(-150, -200, 300, 400), { ink: PAL.gray, sw: .5, br: 'pencil' });
    pop();
    // pieces: hop from the trail into place on their beat
    for (const key of ['D', 'C', 'A']) {
      const [x0, y0, r0] = TRAIL[key], [sx, sy] = slot(key), u = seg(t, LAND[key] - .3, LAND[key]);
      if (u <= 0) piece(key, x0, y0, r0, PS);
      else { const e = easeInOut(u), [px, py] = arcPt([x0, y0], [sx, sy], 170, e), land = bell(t, LAND[key], LAND[key] + .16); piece(key, px, py, lerp(r0, 0, e) + (u < 1 ? .25 * Math.sin(u * Math.PI) : 0), PS * (1 + .1 * Math.sin(u * Math.PI) - .03 * land), { shadow: u < 1 }); }
    }
    // tiny 桃桃 hauls the face piece along the trail like an ant with a leaf
    const walkEnd = LAND.B - .45, wk = seg(t, 118.66, walkEnd), path = smoothPts([[300, 880], [480, 852], [640, 842], [800, 836], [925, 832]], .5, false);
    const pi = Math.min(path.length - 1, Math.floor(easeInOut(wk) * (path.length - 1))), [mx, my] = path[pi];
    const [bsx, bsy] = slot('B'), toss = seg(t, walkEnd + .1, LAND.B);
    if (t < LAND.B) {
      const wob = Math.sin(t * 14) * .07, carry = [mx + 4, my - 212 - Math.abs(Math.sin(t * 14)) * 7];
      const pp = toss > 0 ? arcPt(carry, [bsx, bsy], 230, easeInOut(toss)) : carry;
      momo(mx, my, 12, { walk: t < walkEnd ? t * 3.2 : null, aL: 1.45, aR: 1.45, dy: toss > 0 ? -bell(toss, 0, 1) * 1.8 : 0, eyes: t < walkEnd ? 'closed' : 'happy', mouth: t < walkEnd ? 'wobble' : 'open', digital: .6,
        emote: t < walkEnd ? 'sweat' : null, emoteK: 1, rot: wob * .5 });
      piece('B', pp[0], pp[1], toss > 0 ? lerp(wob, 0, toss) : wob, PS * lerp(.88, 1, toss) * (1 + .08 * bell(toss, 0, 1)));
    } else {
      piece('B', bsx, bsy, 0, PS * (1 - .03 * bell(t, LAND.B, LAND.B + .16)), { shadow: false, art: glowK > .3 ? { eyes: 'star', mouth: 'open' } : {} });
      const ch = t > B(201) - .1;
      momo(mx, my, 12, { aL: ch ? 1.3 + .3 * Math.sin(t * 12) : .4, aR: ch ? 1.3 - .3 * Math.sin(t * 12) : .4, dy: ch ? -Math.abs(Math.sin((t - B(201)) * 9)) * 1.2 : 0, eyes: 'happy', mouth: 'open', digital: .8, emote: ch ? 'heart' : null, emoteK: seg(t, B(201), B(201) + .2) });
    }
    // tape laid over the seams (on top of the pieces)
    push(); translate(SC[0], SC[1]); scale(PS);
    for (const [t0, x0, x1, y, r] of TAPES) tapeStrip(x0, x1, y, r, easeOut(seg(t, t0, t0 + .2)));
    pop();
    // the finished drawing lights up
    if (glowK > .01) {
      blend('screen', () => glow(SC[0], SC[1], 380, '#FFD7E4', .3 * glowK));
      glow(SC[0], SC[1] - 60, 260, '#FFE59A', .25 * glowK);
      for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + t, r = 250 + 30 * Math.sin(t * 5 + i); sparkle(SC[0] + Math.cos(a) * r, SC[1] + Math.sin(a) * r * 1.2, 16, i % 2 ? '#FFF3C0' : '#FFD7E4', frac(t * 1.7 + i * .13)); }
    }
    // her hand with the tape roll follows the seam being taped
    let hand = [1560, 800];
    for (const [t0, x0, x1, y] of TAPES) {
      const u = seg(t, t0 - .08, t0 + .2); if (u <= 0 || u >= 1) continue;
      hand = [SC[0] + lerp(x0, x1, easeOut(seg(t, t0, t0 + .2))) * PS + 44, SC[1] + y * PS + 34];
    }
    const idle = [1520 + 20 * Math.sin(t * 2), 830 + 12 * Math.sin(t * 3)], busy = TAPES.some(([t0]) => t > t0 - .12 && t < t0 + .26);
    const hp = busy ? hand : idle;
    bigHandTop(hp[0], hp[1], -.35);
    camEnd();
  }

  // =====================================================================================
  // SHOTS 5–6 · the monitor close-up: a tidy app (5) and the design tool with the colour slider (6)
  // =====================================================================================
  const SCR = { x: 100, y: 60, w: 1720, h: 830 };
  function bigMonitor(t, content, bg = '#F7F5EF') {
    paint(rectPts(-700, -500, W + 1400, H + 1000), { wash: '#262B57', fill: '#1B2147', fillOp: 90, tex: .4, bleed: .03, ink: null });
    glow(-150, 1000, 900, PAL.lamp, .4);
    glow(SCR.x + SCR.w / 2, SCR.y + SCR.h / 2, 1300, PAL.screen, .22);
    const bz = 36;
    paint([[SCR.x + SCR.w / 2 - 160, SCR.y + SCR.h + 60], [SCR.x + SCR.w / 2 + 160, SCR.y + SCR.h + 60], [SCR.x + SCR.w / 2 + 120, SCR.y + SCR.h + 260], [SCR.x + SCR.w / 2 - 120, SCR.y + SCR.h + 260]], { wash: '#D9CCBA', ink: INK, sw: 1.4 });
    paint(rrPts(SCR.x - bz, SCR.y - bz, SCR.w + bz * 2, SCR.h + bz * 2 + 34, 40), { wash: '#F1E6D6', fill: '#CDBFAC', fillOp: 80, bleed: .03, tex: .5, border: .4, ink: INK, sw: 1.8 });
    paint(rrPts(SCR.x, SCR.y, SCR.w, SCR.h, 16), { wash: bg, ink: INK, sw: 1.2 });
    clipTo(rrPts(SCR.x, SCR.y, SCR.w, SCR.h, 16), () => content(SCR));
    paint([[SCR.x + SCR.w * .05, SCR.y + 10], [SCR.x + SCR.w * .13, SCR.y + 10], [SCR.x + SCR.w * .07, SCR.y + SCR.h * .42], [SCR.x + 10, SCR.y + SCR.h * .42]], { wash: '#FFFFFF', washOp: 22, ink: null });
    paint(ellPts(SCR.x + SCR.w / 2, SCR.y + SCR.h + bz * .5 + 18, 8, 8, 10), { wash: PAL.sage, ink: INK, sw: .5 });
  }
  function textBar(x, y, w, col = '#DAD6E2', h = 16) { paint(rrPts(x, y, w, h, h / 2), { wash: col, ink: null }); }
  function tidyUI(r, t) {                        // a clean, calm app: title bar, sidebar, cards, a chart and toggles
    paint(rectPts(r.x, r.y, r.w, 84), { wash: '#FBE3EA', ink: null });
    inkLine([[r.x, r.y + 84], [r.x + r.w, r.y + 84]], 1, INK, 'fine', 0);
    ['#EE8A8A', '#F6C85F', '#8FD19E'].forEach((c, i) => paint(ellPts(r.x + 46 + i * 40, r.y + 42, 12, 12, 12), { wash: c, ink: INK, sw: .7 }));
    paint(rrPts(r.x + r.w * .32, r.y + 20, r.w * .36, 44, 22), { wash: '#FFFFFF', ink: INK, sw: .8 });
    paint(ellPts(r.x + r.w * .32 + 30, r.y + 42, 10, 10, 12), { ink: PAL.gray, sw: .8 }); inkLine([[r.x + r.w * .32 + 37, r.y + 49], [r.x + r.w * .32 + 46, r.y + 58]], .9, PAL.gray, 'fine', 0);
    paint(rectPts(r.x, r.y + 84, 250, r.h - 84), { wash: '#EEF3F1', ink: null });
    inkLine([[r.x + 250, r.y + 84], [r.x + 250, r.y + r.h]], .8, INK, 'fine', 0);
    for (let i = 0; i < 6; i++) {
      const y = r.y + 150 + i * 96;
      if (i === 0) paint(rrPts(r.x + 18, y - 34, 214, 68, 20), { wash: '#DDEFE8', ink: null });
      paint(rrPts(r.x + 38, y - 24, 48, 48, 14), { wash: [PAL.pinkLt, PAL.skyLt, '#FFF1A8', '#D8F0D2', PAL.lilac, PAL.peach][i], ink: INK, sw: .7 });
      textBar(r.x + 104, y - 8, 100 - (i % 3) * 14);
    }
    const cx0 = r.x + 300;
    textBar(cx0, r.y + 120, 320, '#C9C3D6', 26); textBar(cx0, r.y + 162, 220);
    const cards = [[cx0, r.y + 220, 430, 250, PAL.mint], [cx0 + 470, r.y + 220, 430, 250, PAL.peach], [cx0 + 940, r.y + 220, 420, 250, PAL.sky]];
    cards.forEach(([x, y, w, h, c], i) => {
      paint(rrPts(x + 6, y + 8, w, h, 26), { wash: INK, washOp: 28, ink: null });
      paint(rrPts(x, y, w, h, 26), { wash: '#FFFFFF', ink: INK, sw: .9 });
      paint(rrPts(x + 30, y + 30, 64, 64, 20), { wash: c, ink: INK, sw: .7 });
      textBar(x + 116, y + 44, 200 - i * 30, '#C9C3D6', 20); textBar(x + 116, y + 78, 140);
      for (let k = 0; k < 3; k++) textBar(x + 30, y + 132 + k * 34, w - 80 - k * 60 - i * 10, '#E4E0EA', 14);
    });
    const gx = cx0, gy = r.y + 510, gw = 900, gh = 270;
    paint(rrPts(gx, gy, gw, gh, 26), { wash: '#FFFFFF', ink: INK, sw: .9 });
    for (let i = 0; i < 9; i++) { const bh = 40 + 150 * (.4 + .6 * hash(i * 3.3)) * (1 + .06 * Math.sin(t * 3 + i)); paint(rrPts(gx + 50 + i * 92, gy + gh - 30 - bh, 50, bh, 12), { wash: [PAL.mint, PAL.sky, PAL.pinkLt][i % 3], ink: INK, sw: .6 }); }
    const tx = gx + gw + 40;
    paint(rrPts(tx, gy, 420, gh, 26), { wash: '#FFFFFF', ink: INK, sw: .9 });
    for (let k = 0; k < 3; k++) {
      const on = k !== 1, ty = gy + 60 + k * 72;
      textBar(tx + 30, ty - 8, 170, '#DAD6E2', 16);
      paint(rrPts(tx + 290, ty - 20, 90, 40, 20), { wash: on ? PAL.mint : '#E4E0EA', ink: INK, sw: .7 });
      paint(ellPts(tx + (on ? 360 : 310), ty, 16, 16, 14), { wash: '#FFFFFF', ink: INK, sw: .6 });
    }
  }

  // =====================================================================================
  // SHOT 5 · 121.356–123.456 · 屏幕角落 那张小小的脸 — a little face peeks out of the corner of the app
  // =====================================================================================
  function cornerFace(t, lt, dur) {
    const k = easeInOut(seg(t, 121.36, 122.25));
    camBegin(lerp(960, 1545, k), lerp(535, 745, k), lerp(.93, 2.05, k));
    const edge = SCR.y + SCR.h, px = SCR.x + SCR.w - 150, s = 22;
    const star = elasticOut(seg(t, B(202.5), B(202.5) + .35)), eyesUp = backOut(seg(t, B(203), B(203) + .22)), popK = backOut(seg(t, B(204), B(204) + .3));
    const rise = popK > 0 ? lerp(5.9, 1.3, popK) : eyesUp > 0 ? lerp(9.6, 5.9, eyesUp) : lerp(12.5, 9.6, star);
    const blink = (t > 122.28 && t < 122.36) || (t > 122.42 && t < 122.49);
    bigMonitor(t, r => {
      tidyUI(r, t);
      glow(px, edge - 60, 220 * (star + popK), PAL.pink, .3);
      const lx = t < 122.2 ? -.8 : t < 122.556 ? .6 : .15;
      momo(px, edge + rise * s, s, { digital: 1, noShadow: true, lookX: popK > 0 ? .1 : lx, lookY: popK > 0 ? 0 : -.3, eyes: blink ? 'closed' : popK > 0 ? (t > B(205) ? 'happy' : 'normal') : 'normal',
        mouth: popK > 0 ? 'open' : 'tiny', aR: popK > 0 ? .45 + .38 * Math.sin((t - B(204)) * 14) : -1.2, aL: popK > 0 ? -.6 : -1.2, blush: .8, sq: popK > 0 ? .08 * bell(t, B(204), B(204) + .2) : 0,
        emote: t > B(205) ? 'heart' : null, emoteK: seg(t, B(205), B(205) + .25) });
      if (star > 0 && popK <= 0) sparkle(px - 10, edge + (rise - 11.4) * s - 20, 14, '#FFF3C0', frac(t * 2.2));
    });
    sparkBurst(px, edge - 5.5 * s, t - B(204), 9, 190, ['#FFE59A', PAL.pinkLt, PAL.cream]);
    camEnd();
  }

  // =====================================================================================
  // SHOT 6 · 123.456–126.156 · 粉色的头发 还要再浅一点 — the colour slider: a little lighter still
  // =====================================================================================
  const HAIR0 = '#D8387A', HAIRLT0 = '#EE78A6', SAKURA = '#FBDDE6';
  function hairSlider(t, lt, dur) {
    const kn = kf(t, [[123.75, .06], [124.25, .36], [124.4, .36], [124.85, .6], [125.0, .6], [125.25, .7]], easeInOut);
    const hk = clamp(kn / .7), hair = mixCol(HAIR0, MOMO_STYLE.hair, hk), hairLt = mixCol(HAIRLT0, MOMO_STYLE.hairLt, hk);
    const zk = easeInOut(seg(t, 125.1, 126.2));
    camBegin(lerp(1010, 820, zk), lerp(505, 540, zk), lerp(1.13, 1.32, zk));
    bigMonitor(t, r => {
      paint(rectPts(r.x, r.y, r.w, 70), { wash: '#E9E4F2', ink: null }); inkLine([[r.x, r.y + 70], [r.x + r.w, r.y + 70]], .9, INK, 'fine', 0);
      ['#EE8A8A', '#F6C85F', '#8FD19E'].forEach((c, i) => paint(ellPts(r.x + 42 + i * 38, r.y + 35, 11, 11, 12), { wash: c, ink: INK, sw: .6 }));
      paint(rectPts(r.x, r.y + 70, 96, r.h - 70), { wash: '#DCD5E8', ink: null });
      for (let i = 0; i < 6; i++) paint(rrPts(r.x + 24, r.y + 110 + i * 84, 48, 48, 12), { wash: i === 3 ? PAL.pinkLt : '#F3F0F7', ink: INK, sw: .6 });
      // the canvas with 桃桃 on it
      const cv = { x: r.x + 130, y: r.y + 100, w: 880, h: r.h - 130 };
      paint(rrPts(cv.x, cv.y, cv.w, cv.h, 12), { wash: '#FFFDF8', ink: INK, sw: .8 });
      for (let i = 1; i < 8; i++) inkLine([[cv.x + i * cv.w / 8, cv.y + 6], [cv.x + i * cv.w / 8, cv.y + cv.h - 6]], .4, '#E8E2EE', 'fine', 0);
      const mx = cv.x + cv.w / 2 - 20, my = cv.y + cv.h - 60, s = 38;
      const spin = seg(t, 125.4, 126.0), ang = easeInOut(spin) * TAU, sx = Math.cos(ang);
      const md = mood(t, [[123, 'normal', null, 'o'], [124.36, 'sparkle', null, 'open'], [124.96, 'star', 'spark', 'open'], [126.0, 'happy', 'heart', 'open']]);
      paint(ellPts(mx, my + 4, 120, 20, 20), { fill: INK, fillOp: 50, bleed: .2, ink: null });
      const hold = spin > 0 ? 0 : ease(seg(t, 123.6, 123.9));
      momo(mx, my, s, { hair, hairLt, noShadow: true, ...md, lookY: spin > 0 ? 0 : lerp(-.5, .35, hold), lookX: spin > 0 ? 0 : lerp(.2, .9, hold), back: sx < 0, sx: Math.abs(sx) < .08 ? .08 : Math.abs(sx),
        dy: -bell(spin, 0, 1) * 1.6, tailSwing: .5 * bell(spin, 0, 1) - .12 * hold, aL: spin > 0 ? .9 : (t > 124.96 ? .9 : -1.1), aR: spin > 0 ? .9 : lerp(-1.2, -.45, hold),
        tilt: spin > 0 ? 0 : .16 * hold, blush: .5 + .5 * hk });
      if (t > 125.3) for (let i = 0; i < 6; i++) sparkle(mx + Math.cos(i * 1.1 + t * 3) * 220, my - 200 + Math.sin(i * 1.7 + t * 2) * 150, 14, i % 2 ? '#FFF3C0' : PAL.pinkLt, frac(t * 1.5 + i * .17));
      // the colour panel
      const px0 = r.x + 1060, py0 = r.y + 100, pw = 620;
      paint(rrPts(px0, py0, pw, 560, 22), { wash: '#FFFFFF', ink: INK, sw: .9 });
      textBar(px0 + 40, py0 + 40, 150, '#C9C3D6', 22);
      paint(rrPts(px0 + 40, py0 + 94, 150, 150, 26), { wash: hair, ink: INK, sw: .9 });
      paint(heartPts(px0 + 115, py0 + 170, 34), { wash: '#FFFFFF', washOp: 150, ink: null });
      paint(rrPts(px0 + 58, py0 + 110, 40, 22, 11), { wash: '#FFFFFF', washOp: 120, ink: null });
      for (let k = 0; k < 3; k++) textBar(px0 + 220, py0 + 110 + k * 40, 300 - k * 70, '#E4E0EA', 16);
      const sx0 = px0 + 50, sw0 = pw - 100, sy = py0 + 330;
      const grad = []; for (let i = 0; i <= 12; i++) grad.push(mixCol(HAIR0, SAKURA, i / 12));
      for (let i = 0; i < 12; i++) paint(rectPts(sx0 + i * sw0 / 12 - 1, sy - 22, sw0 / 12 + 2, 44), { wash: grad[i], ink: null });
      paint(rrPts(sx0, sy - 22, sw0, 44, 22), { ink: INK, sw: 1 });
      const kx = sx0 + sw0 * kn, press = t > 123.75 && t < 125.3 ? 1 : 0;
      paint(ellPts(kx + 4, sy + 6, 38 + 5 * press, 38 + 5 * press, 22), { wash: INK, washOp: 40, ink: null });
      paint(ellPts(kx, sy, 38 + 5 * press, 38 + 5 * press, 22), { wash: '#FFFFFF', ink: INK, sw: 1.2 });
      paint(ellPts(kx, sy, 26, 26, 18), { wash: hair, ink: INK, sw: .5 });
      for (let i = 0; i < 6; i++) paint(ellPts(sx0 + 30 + i * 96, py0 + 460, 26, 26, 16), { wash: [PAL.sky, PAL.mint, '#FFE59A', PAL.peach, PAL.lilac, hair][i], ink: INK, sw: .7 });
      const cur = t < 123.75 ? [lerp(r.x + r.w + 60, kx + 6, easeOut(seg(t, 123.4, 123.75))), lerp(r.y + r.h, sy + 8, easeOut(seg(t, 123.4, 123.75)))] : t > 125.3 ? [kx + 6 + 180 * easeIn(seg(t, 125.3, 125.8)), sy + 8 + 120 * easeIn(seg(t, 125.3, 125.8))] : [kx + 6, sy + 8];
      pointer(cur[0], cur[1], 1.6, press * (.6 + .4 * pulse(t, 8)));
    });
    camEnd();
  }

  // =====================================================================================
  // SHOT 7 · 126.156–127.956 · 漂亮的大话 听过了太多遍 — the boss blows huge balloons; everyone sleeps; she yawns
  // =====================================================================================
  function balloonShape(kind, x, y, s, rot = 0) {
    push(); translate(x, y); rotate(rot); scale(s);
    const shine = (px, py, a = -.6) => inkLine([[px, py], [px + 14 * Math.cos(a), py + 14 * Math.sin(a) - 12], [px + 26, py - 30]], 2.2, '#FFFFFF', 'marker', .6, .55);
    if (kind === 'rocket') {
      paint([[-60, 90], [-110, 150], [-50, 140]], { wash: '#5FA8D6', ink: INK, sw: 1.2 }); paint([[60, 90], [110, 150], [50, 140]], { wash: '#5FA8D6', ink: INK, sw: 1.2 });
      paint([[0, -170], [55, -90], [70, 20], [55, 130], [-55, 130], [-70, 20], [-55, -90]], { wash: '#F4F0EA', fill: '#D9D2C6', fillOp: 60, tex: .3, ink: INK, sw: 1.3, curv: .5 });
      paint([[0, -170], [42, -110], [-42, -110]], { wash: '#EE6A6A', ink: INK, sw: 1.1, curv: .3 });
      paint(ellPts(0, -20, 30, 30, 18), { wash: '#8EC3E6', ink: INK, sw: 1.1 }); paint(ellPts(-8, -28, 9, 7, 8), { wash: '#FFFFFF', washOp: 200, ink: null });
      paint(rectPts(-55, 70, 110, 20), { wash: '#EE6A6A', ink: null });
      shine(-40, -40);
    } else if (kind === 'arrow') {
      const P = [[-130, 110], [-60, 20], [-10, 60], [70, -40], [40, -64], [130, -110], [120, -10], [96, -30], [0, 110], [-50, 70], [-100, 140]];
      paint(P, { wash: '#7CC98E', fill: '#4E9E62', fillOp: 60, tex: .3, ink: INK, sw: 1.3, curv: .15 });
      shine(-90, 100, -.9);
    } else if (kind === 'crown') {
      const P = [[-120, 80], [-135, -60], [-70, 0], [0, -110], [70, 0], [135, -60], [120, 80]];
      paint(P, { wash: '#F6C85F', fill: '#E8AA38', fillOp: 70, tex: .4, ink: INK, sw: 1.3, curv: .12 });
      paint(rrPts(-122, 50, 244, 40, 12), { wash: '#E8AA38', ink: INK, sw: 1.1 });
      for (const [gx, gy, c] of [[-70, 70, '#EE6A6A'], [0, 70, '#5FA8D6'], [70, 70, '#7CC98E'], [0, -40, '#EE6A6A']]) paint(ellPts(gx, gy, 13, 13, 12), { wash: c, ink: INK, sw: .8 });
      for (const [gx, gy] of [[-135, -60], [0, -110], [135, -60]]) paint(ellPts(gx, gy, 14, 14, 12), { wash: '#FFF3C0', ink: INK, sw: .8 });
      shine(-80, 20);
    } else {
      paint(ellPts(0, 0, 140, 140, 36), { wash: '#6FB2E3', fill: '#3F86C0', fillOp: 60, tex: .4, ink: INK, sw: 1.4 });
      clipTo(ellPts(0, 0, 140, 140, 36), () => {
        paint([[-90, -80], [-20, -110], [20, -60], [-10, -10], [-70, 10], [-110, -30]], { wash: '#8FD19E', ink: INK, sw: .9, curv: .5 });
        paint([[20, 20], [100, 0], [130, 60], [70, 110], [30, 80]], { wash: '#8FD19E', ink: INK, sw: .9, curv: .5 });
        inkLine([[-140, 0], [140, 0]], .6, '#3F86C0', 'fine', 0); inkLine([[0, -140], [-50, 0], [0, 140]], .6, '#3F86C0', 'fine', .6); inkLine([[0, -140], [50, 0], [0, 140]], .6, '#3F86C0', 'fine', .6);
      });
      shine(-80, -50);
    }
    paint([[-10, 150], [10, 150], [0, 166]], { wash: INK, ink: null });
    pop();
  }
  const BALLOONS = [['rocket', B(210) - .05, [610, 250], -.18, 1.0], ['arrow', B(210.5) - .05, [990, 205], .1, 1.0], ['crown', B(211) - .05, [1390, 235], -.08, .9], ['globe', B(211.5) - .05, [820, 440], 0, .95]];
  function meetingRoom(t) {
    paint(rectPts(-500, -400, W + 1000, 1300), { grad: ['#E4EAF0', '#C9D3DE', Math.PI / 2], ink: null });
    paint(rectPts(-500, -400, W + 1000, 1300), { fill: '#AFBCCB', fillOp: 50, bleed: .05, tex: .5, ink: null });
    for (const lx of [200, 760, 1320, 1880]) { paint(rrPts(lx - 150, 40, 300, 30, 10), { wash: '#F7FBFF', ink: INK, sw: .8 }); glow(lx, 70, 300, '#EAF6FF', .5); }
    paint(rectPts(1180, 160, 700, 330, 2), { grad: ['#D5DEE8', '#B9C6D4', Math.PI / 2], ink: INK, sw: 1.1 });          // window: a grey day
    clipTo(rectPts(1180, 160, 700, 330), () => { for (let i = 0; i < 8; i++) { const bh = 90 + hash(i * 3.1) * 150; paint(rectPts(1170 + i * 92, 490 - bh, 78, bh + 10), { wash: '#A7B3C3', ink: null }); for (let r2 = 0; r2 < 4; r2++) fillRectA(1182 + i * 92, 500 - bh + r2 * 30, 50, 10, '#C9D3DE', .8); } });
    for (const wx of [1413, 1646]) inkLine([[wx, 160], [wx, 490]], 2.6, '#EEF2F6', 'marker', 0);
    paint(rectPts(1165, 486, 730, 18), { wash: '#E9EEF3', ink: INK, sw: .9 });
    paint(rectPts(100, 190, 720, 400, 2), { wash: '#FBFCFE', ink: INK, sw: 1.4 });                                  // whiteboard
    inkLine([[160, 540], [320, 470], [430, 500], [560, 360], [700, 250]], 2, '#4F8FD6', 'marker', .3);
    inkLine([[700, 250], [660, 262]], 2, '#4F8FD6', 'marker', 0); inkLine([[700, 250], [694, 292]], 2, '#4F8FD6', 'marker', 0);
    inkLine([[160, 250], [160, 550], [760, 550]], 1.2, INK, 'fine', 0);
    paint([[-500, 900], [W + 500, 900], [W + 500, 1500], [-500, 1500]], { wash: '#A9B4C4', fill: '#8E9AAE', fillOp: 60, tex: .5, ink: INK, sw: 1 });
  }
  function bigTalk(t, lt, dur) {
    const pan = easeInOut(seg(t, B(211.3), B(212) + .08));
    camBegin(lerp(760, 1290, pan), lerp(505, 560, pan), lerp(1.12, 1.24, pan));
    meetingRoom(t);
    // the boss, talking big
    const bs = 38, bx = 450, byy = 905, talk = Math.abs(Math.sin(t * 17));
    person(bx, byy, bs, { suit: true, seed: 3, top: '#3E4A6E', hair: '#3A3440', style: 'short', mouth: talk > .5 ? 'open' : 'o', eyes: 'happy', aR: .9 + .5 * Math.sin(t * 6), aL: -.3 + .4 * Math.sin(t * 5 + 1), dy: -.15 * Math.abs(Math.sin(t * 8)), blush: .5, tilt: -.1 });
    const mouth = [bx + 8, byy - 6.7 * bs + 1.4 * bs];
    // balloons blown out of his mouth, floating up to crowd the ceiling
    for (const [kind, t0, to, rot, sc] of BALLOONS) {
      const age = t - t0; if (age < 0) continue;
      const inf = easeOut(clamp(age / .22)), fly = easeInOut(seg(age, .18, .75)), jig = Math.sin(t * 3 + t0 * 7) * 8;
      const p = arcPt([mouth[0] + 40 + 120 * inf, mouth[1] - 40 - 110 * inf], to, -60, fly);
      if (fly < 1) inkLine([[mouth[0] + 4, mouth[1]], [lerp(mouth[0] + 30, p[0], .5), lerp(mouth[1], p[1] + 170 * sc, .5) + 20], [p[0], p[1] + 160 * sc * inf]], .8, INK, 'fine', .6);
      else inkLine([[p[0], p[1] + 160 * sc], [p[0] - 14, p[1] + 230 * sc], [p[0] + 10, p[1] + 300 * sc]], .8, INK, 'fine', .6);
      balloonShape(kind, p[0], p[1] + jig, sc * lerp(.12, 1, inf) * (1 + .05 * Math.sin(t * 5 + t0)), rot + Math.sin(t * 2 + t0) * .05);
    }
    // the sleepers: heads down on folded arms along the table
    paint([[740, 792], [W + 400, 792], [W + 400, 850], [740, 850]], { wash: '#E3E8EF', fill: '#C3CCD8', fillOp: 60, tex: .4, ink: INK, sw: 1.2 });     // table top
    const sleepers = [[890, 2, .95, '#E8B86B'], [1180, 4, -.9, '#9CC9A0']];
    sleepers.forEach(([sx, seed, tl, c], i) => {
      paint(rrPts(sx - 20 * Math.sign(tl) - 105, 772, 210, 44, 22), { wash: c, ink: INK, sw: .9 });                                   // folded arms
      person(sx, 958, 30, { sit: true, seed, top: c, eyes: 'closed', mouth: i ? 'o' : 'tiny', tilt: tl, dy: .12, aL: .25, aR: .25, noShadow: true, blush: .7, sq: .03 * Math.sin(t * 2.2 + i) });
      const zz = frac(t * .8 + i * .5);
      letter('z', sx + Math.sign(tl) * 70 + zz * 50, 640 - zz * 120, 36 + zz * 26, '#8E97B0', { font: 'cute', alpha: bell(zz, 0, 1), stroke: INK, strokeW: .06, ink: false });
    });
    // a snot bubble breathes on the second sleeper, echoing the balloons
    const bub = 12 + 16 * (.5 + .5 * Math.sin(t * 4.2));
    paint(ellPts(1128, 812 - bub * .6, bub, bub, 16), { wash: '#CFE6F2', washOp: 150, ink: INK, sw: .7 }); paint(ellPts(1128 - bub * .35, 812 - bub * .95, bub * .22, bub * .15, 8), { wash: '#FFFFFF', washOp: 210, ink: null });
    // her: deadpan, then the big yawn
    const yawn = seg(t, B(212) - .05, B(212) + .5), yk = bell(yawn, 0, 1);
    const md = mood(t, [[126, 'tired', null, 'flat'], [B(212) - .05, 'closed', null, 'yawn'], [B(212) + .55, 'tired', null, 'flat']]);
    hero(1560, 968, 38, { sit: true, outfit: 'office', noShadow: true, ...md, tears: yk * .7, aR: lerp(-1.1, .42, yk), aL: lerp(-1.0, .42, yk), sq: -.08 * yk, dy: -.25 * yk, tilt: -.14 * yk, ahoge: 'droop', blush: .3 });
    if (yk > .3) for (let i = 0; i < 3; i++) inkLine([[1560 - 150 - i * 20, 700 - 40 + i * 40], [1560 - 185 - i * 26, 700 - 55 + i * 42]], 1.2, INK, 'ink', 0, (yk - .3) * 1.4);
    paint([[740, 850], [W + 400, 850], [W + 400, 1500], [740, 1500]], { wash: '#B9C3D0', fill: '#97A3B6', fillOp: 60, tex: .4, ink: INK, sw: 1.2 });
    camEnd();
    grade(.12, 'color', '#7F9CC0');
  }

  // =====================================================================================
  // SHOT 8 · 127.956–130.956 · 我更在意手里 这一点点改变 — a tiny brush rounds off a button and gives an icon a smile
  // =====================================================================================
  const MON = [1330, 454];
  const CORNERS = [B(213.5), B(214), B(214.5), B(215)];
  const SMILE = [B(215.75), B(216.4)], DING = B(216.5);
  const smilePt = (ix, iy, is, k) => { const a = Math.PI * (.15 + .7 * k); return [ix + is / 2 + Math.cos(a) * 30, iy + is * .56 + Math.sin(a) * 22]; };
  function smallUI(r, t) {                      // the monitor content in world units (r = the monitor's screen rect)
    paint(rectPts(r.x - 4, r.y - 4, r.w + 8, r.h + 8), { wash: '#F6F2EC', ink: null });
    for (let i = 1; i < 10; i++) inkLine([[r.x + i * r.w / 10, r.y], [r.x + i * r.w / 10, r.y + r.h]], .25, '#E6E0D8', 'fine', 0);
    for (let i = 1; i < 6; i++) inkLine([[r.x, r.y + i * r.h / 6], [r.x + r.w, r.y + i * r.h / 6]], .25, '#E6E0D8', 'fine', 0);
    // the button: its corners are rounded one by one, then it turns friendly
    const bx = r.x + 62, by = r.y + 150, bw = 210, bh = 76, done = seg(t, CORNERS[3] + .1, CORNERS[3] + .3);
    const rad = CORNERS.map(c => 34 * backOut(seg(t, c + .05, c + .25)));
    const pts = [], corner = (cx, cy, a0, rr) => { for (let i = 0; i <= 5; i++) { const a = a0 + i / 5 * Math.PI / 2; pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } };
    corner(bx + rad[0], by + rad[0], Math.PI, rad[0]); corner(bx + bw - rad[1], by + rad[1], -Math.PI / 2, rad[1]);
    corner(bx + bw - rad[2], by + bh - rad[2], 0, rad[2]); corner(bx + rad[3], by + bh - rad[3], Math.PI / 2, rad[3]);
    const sc = 1 + .08 * bell(t, CORNERS[3] + .1, CORNERS[3] + .4), ccx = bx + bw / 2, ccy = by + bh / 2;
    const P = pts.map(([x, y]) => [ccx + (x - ccx) * sc, ccy + (y - ccy) * sc]);
    paint(P.map(([x, y]) => [x + 4, y + 6]), { wash: INK, washOp: 35, ink: null });
    paint(P, { wash: mixCol('#B9BAC6', PAL.mint, done), ink: INK, sw: .5 });
    textBar(ccx - 56 * sc, ccy - 8, 112 * sc, mixCol('#8C8FA3', '#FFFFFF', done), 16);
    // the app icon: a blank square face that gets a smile
    const ix = r.x + 330, iy = r.y + 92, is = 124, smileK = seg(t, SMILE[0], SMILE[1]), ding = t > DING;
    const ik = 1 + .12 * bell(t, DING, DING + .3);
    push(); translate(ix + is / 2, iy + is / 2); scale(ik); translate(-(ix + is / 2), -(iy + is / 2));
    paint(rrPts(ix + 4, iy + 6, is, is, 30), { wash: INK, washOp: 35, ink: null });
    paint(rrPts(ix, iy, is, is, 30), { wash: ding ? '#F9CEDC' : '#D9D2E6', ink: INK, sw: .5 });
    for (const sd of [-1, 1]) {
      if (ding && ((t - DING) % 1.4) > .12) paint(ellPts(ix + is / 2 + sd * 24, iy + is * .42, 6, 8, 10), { wash: INK, ink: null });
      else inkLine([[ix + is / 2 + sd * 24 - 7, iy + is * .43], [ix + is / 2 + sd * 24 + 7, iy + is * .43]], .6, INK, 'ink', 0);
    }
    if (smileK > 0) { const arc = []; for (let i = 0; i <= 10; i++) arc.push(smilePt(ix, iy, is, i / 10 * smileK)); inkLine(arc, .8, INK, 'ink', .5); }
    if (ding) for (const sd of [-1, 1]) paint(ellPts(ix + is / 2 + sd * 40, iy + is * .62, 11, 6, 10), { fill: '#F07C9A', fillOp: 170, bleed: .1, ink: null });
    pop();
    // a few calm labels
    textBar(r.x + 62, r.y + 54, 150, '#C9C3D6', 14); textBar(r.x + 62, r.y + 80, 100, '#E0DBE6', 10);
    textBar(r.x + 330, r.y + 240, 124, '#E0DBE6', 10);
  }
  function bigHandFront(x, y, rot) {             // her hand in front of the screen, holding a tiny brush (screen space)
    push(); translate(x, y); rotate(rot);
    paint([[40, 60], [120, -40], [900, 500], [700, 700]], { wash: PAL.sage, fill: '#7EA78E', fillOp: 60, tex: .4, ink: INK, sw: 1.8 });
    paint(rrPts(30, -60, 120, 150, 40).map(([a, b]) => [a + b * .5, b]), { wash: mixCol(PAL.sage, PAL.cream, .3), ink: INK, sw: 1.6 });
    // the brush: handle, ferrule, soft pink tip (tip at local (-205, -150))
    inkLine([[-40, -30], [-150, -110]], 8, INK, 'marker', 0); inkLine([[-40, -30], [-150, -110]], 5.5, '#F6C85F', 'marker', 0);
    paint([[-150, -118], [-160, -104], [-178, -122], [-168, -136]], { wash: '#C9CED6', ink: INK, sw: 1.2 });
    paint([[-168, -136], [-178, -122], [-200, -142], [-208, -152], [-196, -150]], { wash: PAL.pink, ink: INK, sw: 1.2, curv: .4 });
    paint(ellPts(0, 0, 92, 82, 24), { wash: SKIN, ink: INK, sw: 1.8 });
    paint(ellPts(-52, -40, 34, 26, 16, 0, -.7), { wash: SKIN, ink: INK, sw: 1.5 });
    for (const k of [-20, 10]) inkLine([[k + 20, -60], [k + 44, -30]], 1, mixCol(SKIN, INK, .35), 'fine', .4);
    pop();
  }
  function smallChange(t, lt, dur) {
    const back = easeInOut(seg(t, B(217) - .12, B(217) + .45));
    const z = lerp(3.55, 1.26, back), cx = lerp(MON[0], 1190, back), cy = lerp(MON[1], 610, back);
    camBegin(cx, cy, z);
    room(t, { lamp: 1, night: 1, rain: .4, screen: smallUI, clutter: .3, book: 'open' });
    const nod = t > B(217.2) ? Math.sin(clamp((t - B(217.2)) / .55) * Math.PI * 2) : 0;
    const x = 1160, fy = 985, s = 34, seat = 3.2, y = fy - (seat - 1.5) * s;
    const ho = { sit: true, back: true, outfit: 'home', noShadow: true, aL: .35, aR: t < B(217) ? .9 : .35, dy: .18 * Math.max(0, nod), tilt: .08 * nod, sq: .03 * Math.max(0, nod), ahoge: back < .15 ? 'none' : 'normal' };
    chair(x, fy, s, { seat, back: false });
    hero(x, y, s, ho);
    chair(x, fy, s, { seat, backOnly: true });
    if (t > B(217.3)) { const [hx, hy] = headAt(x, y, s, ho); emote('flower', hx + 70, hy - 110, 20, seg(t, B(217.3), B(217.6))); }
    // where the brush tip is working (world), converted to the screen for the big foreground hand
    const r = { x: 1068, y: 298, w: 524, h: 312 }, bx = r.x + 62, by = r.y + 150, bw = 210, bh = 76;
    const cs = [[bx, by], [bx + bw, by], [bx + bw, by + bh], [bx, by + bh]];
    let tip = [bx - 40, by + bh + 60];
    CORNERS.forEach((c, i) => { const u = seg(t, c - .28, c + .02); if (t > c - .28) tip = [lerp(i ? cs[i - 1][0] : bx - 60, cs[i][0], easeInOut(u)), lerp(i ? cs[i - 1][1] : by + bh + 80, cs[i][1], easeInOut(u))]; });
    if (t > CORNERS[3] + .05) {
      const ix = r.x + 330, iy = r.y + 92, is = 124, go = easeInOut(seg(t, CORNERS[3] + .05, SMILE[0])), sk = seg(t, SMILE[0], SMILE[1]);
      const sm = smilePt(ix, iy, is, sk);
      tip = [lerp(bx, sm[0], go), lerp(by + bh, sm[1], go)];
      if (sk >= 1) tip = [sm[0] + 30 * seg(t, SMILE[1], DING), sm[1] + 20 * seg(t, SMILE[1], DING)];
    }
    const rub = CORNERS.some(c => t > c - .06 && t < c + .12) ? [Math.cos(t * 60) * 5, Math.sin(t * 60) * 5] : [0, 0];
    tip = [tip[0] + rub[0], tip[1] + rub[1]];
    // rounding dust and the ding
    CORNERS.forEach((c, i) => { const age = t - c; if (age > 0 && age < .45) for (let k = 0; k < 5; k++) { const a = k * 1.3 + i, d = 10 + age * 60; dot(cs[i][0] + Math.cos(a) * d, cs[i][1] + Math.sin(a) * d - age * 20, 2.2 * (1 - age / .45), '#FFF3C0', 1); } });
    if (t > DING) { glow(r.x + 392, r.y + 154, 150, '#FFE59A', .5 * bell(t, DING, DING + .5)); const ag = t - DING; if (ag < .5) for (let k = 0; k < 8; k++) { const a = k / 8 * TAU + .3, d = 84 + 60 * easeOut(ag / .5), rr = 11 * (1 - ag / .5); paint(starPts(r.x + 392 + Math.cos(a) * d, r.y + 154 + Math.sin(a) * d, rr, .42, 4, a), { wash: k % 2 ? '#FFE59A' : PAL.pinkLt, ink: INK, sw: .3 }); } }
    const tipS = toScreen(tip[0], tip[1]);
    camEnd();
    if (t > DING) { const [dx, dy] = tipS; sfx('叮', lerp(1560, 1050, back), lerp(170, 300, back), 170 * (1 - back * .6), '#F6C85F', t - DING, { life: 1.0, rot: .14, stroke: INK, strokeW: .1 }); }
    // the hand leaves just before the camera pulls back
    const leave = easeIn(seg(t, B(216.75), B(217.1))), enter = 1 - easeOut(seg(t, 127.95, 128.3));
    if (leave < 1) bigHandFront(tipS[0] + 205 + 700 * Math.max(leave, enter), tipS[1] + 150 + 500 * Math.max(leave, enter), 0);
  }

  // =====================================================================================
  // SHOT 9 · 130.956–132.756 · 当有人说 这次真的方便 — a thumbs-up in a café pings her phone; she jumps for joy
  // =====================================================================================
  function street(t) {
    paint(rectPts(-600, -400, 3200, 1400), { grad: ['#F7C9A8', '#C9B2DA', -Math.PI / 2], ink: null });
    glow(1700, 700, 700, '#FFD9A0', .45);
    nightCity(t, { x0: 1180, x1: 2600, y: 860, color: .75, lit: .6 });
    // the café facade
    paint(rectPts(-300, 90, 1400, 810), { wash: '#F2E2CC', fill: '#D9C0A0', fillOp: 70, tex: .6, ink: INK, sw: 1.3 });
    for (let i = 0; i < 11; i++) paint([[-260 + i * 120, 150], [-140 + i * 120, 150], [-150 + i * 120, 250], [-250 + i * 120, 250]], { wash: i % 2 ? '#F7F0E6' : '#EE8A8A', ink: INK, sw: .9 });   // awning
    for (let i = 0; i < 11; i++) paint(ellPts(-200 + i * 120, 252, 60, 16, 12, 0).filter(p => p[1] >= 252), { wash: i % 2 ? '#F7F0E6' : '#EE8A8A', ink: INK, sw: .8 });
    const win = { x: 80, y: 300, w: 900, h: 470 };
    paint(rectPts(win.x - 16, win.y - 16, win.w + 32, win.h + 32, 2), { wash: '#8E6A4E', ink: INK, sw: 1.2 });
    clipTo(rectPts(win.x, win.y, win.w, win.h), () => {
      paint(rectPts(win.x, win.y, win.w, win.h), { grad: ['#FFE3B8', '#F2B98A', Math.PI / 2], ink: null });
      for (const lx of [230, 810]) { inkLine([[lx, win.y], [lx, win.y + 70]], .8, INK, 'fine', 0); paint([[lx - 34, win.y + 100], [lx + 34, win.y + 100], [lx + 18, win.y + 70], [lx - 18, win.y + 70]], { wash: '#E8A038', ink: INK, sw: .8 }); glow(lx, win.y + 120, 150, '#FFE3A0', .6); }
      paint(rectPts(win.x, win.y + 330, win.w, 140), { wash: '#C98E5E', fill: '#A8703E', fillOp: 60, tex: .5, ink: INK, sw: .9 });   // counter
      for (const [px2, s2] of [[150, 1], [890, .9]]) plant(px2, win.y + 330, s2, t);
    });
    return win;
  }
  function phoneInHand(s, sw, glowK = 0) {       // a phone held up (origin at the hand); the screen glows when the heart lands
    push(); translate(.05 * s, .2 * s);
    paint(rrPts(-.5 * s, -1.9 * s, 1.0 * s, 1.75 * s, .2 * s), { wash: '#4A4E6E', ink: INK, sw: sw * .6 });
    paint(rrPts(-.4 * s, -1.8 * s, .8 * s, 1.5 * s, .12 * s), { wash: mixCol('#BFD9EE', '#FFE3EE', glowK), ink: null });
    if (glowK > .1) heart(0, -1.05 * s, .32 * s * glowK, '#EE5A83', sw * .4);
    paint(ellPts(0, -.1 * s, .38 * s, .34 * s, 12), { wash: SKIN, ink: INK, sw: sw * .6 });
    pop();
  }
  function convenient(t, lt, dur) {
    const pan = easeInOut(seg(t, B(218.7), B(219.5))), close = easeInOut(seg(t, B(219.6), B(220.4)));
    camBegin(lerp(620, 1350, pan) + 60 * close, lerp(520, 585, pan) - 25 * close, lerp(1.34, 1.3, pan) + .12 * close);
    const win = street(t);
    // the user inside: laptop, coffee, thumbs up
    const ux = 520, uy = win.y + 420, us = 34, thumb = backOut(seg(t, B(218), B(218) + .2)), aTh = lerp(-1.0, .35, thumb);
    person(ux, uy, us, { seed: 6, sit: true, noShadow: true, eyes: t > B(218) ? 'happy' : 'look', lookY: t > B(218) ? 0 : .6, mouth: t > B(218) ? 'grin' : 'smile', blush: .8,
      aR: aTh, aL: -.6, dy: -.15 * bell(t, B(218), B(218) + .3), handR: (s, sw) => { if (thumb > .25) { push(); rotate(Math.atan2(-Math.cos(aTh), Math.sin(aTh))); paint(rrPts(-.05 * s, -.23 * s, 1.0 * s, .46 * s, .23 * s), { wash: SKIN, ink: INK, sw: sw * .6 }); pop(); } } });
    paint(rrPts(ux - 160, uy - 110, 320, 24, 8), { wash: '#B98A5E', ink: INK, sw: .9 });                                          // café table
    paint([[ux - 78, uy - 110], [ux + 78, uy - 110], [ux + 70, uy - 176], [ux - 70, uy - 176]], { wash: '#D3CCE0', ink: INK, sw: .9 });   // laptop lid (back)
    paint(ellPts(ux, uy - 143, 12, 12, 12), { wash: '#F6A0B8', ink: null });
    paint(rrPts(ux - 140, uy - 148, 34, 38, 8), { wash: PAL.cream, ink: INK, sw: .8 });
    for (const k of [-6, 6]) inkLine([[ux - 123 + k, uy - 154], [ux - 119 + k, uy - 174], [ux - 125 + k, uy - 190]], .6, '#FFFFFF', 'fine', .6, .7);
    // glass sheen over the window
    paint([[win.x + 80, win.y], [win.x + 190, win.y], [win.x + 60, win.y + win.h], [win.x - 50, win.y + win.h]], { wash: '#FFFFFF', washOp: 30, ink: null });
    // the heart: pops above the user, then flies out to her phone
    const hk = backOut(seg(t, B(218) + .08, B(218) + .3)), fly = easeInOut(seg(t, B(218.6), B(219.35)));
    const hs = [ux, uy - 12 * us + 10], her = [1480, 962], hs2 = 40, ho0 = { aR: .15, aL: -1.1 };
    const target = handAt(her[0], her[1], hs2, ho0, 1);
    if (hk > 0 && fly < 1) {
      const p = arcPt(hs, [target[0], target[1] - 60], 260, fly);
      for (let i = 1; i <= 5; i++) { const q = arcPt(hs, [target[0], target[1] - 60], 260, Math.max(0, fly - i * .04)); if (fly > .02) sparkle(q[0], q[1], 10 - i, '#FFD7E4', .5); }
      heart(p[0], p[1], 46 * hk * (1 + .1 * Math.sin(t * 20)), '#EE5A83');
    }
    // her on the pavement
    paint([[-600, 860], [3000, 860], [3000, 1500], [-600, 1500]], { wash: '#CDB7A8', fill: '#A89080', fillOp: 60, tex: .6, ink: INK, sw: 1.1 });
    for (let i = 0; i < 18; i++) inkLine([[-300 + i * 170, 862], [-420 + i * 190, 1500]], .5, '#A89080', 'fine', 0);
    inkLine([[1180, 860], [1180, 380]], 5, '#5E6784', 'marker', 0); paint(ellPts(1180, 370, 36, 22, 14), { wash: '#FFE3A0', ink: INK, sw: 1 }); glow(1180, 380, 180, '#FFE3A0', .5);
    const got = t > B(219.35), jump = seg(t, B(220), B(220) + .5), jk = Math.sin(jump * Math.PI);
    const pre = bell(t, B(220) - .18, B(220) + .02), land = bell(t, B(220) + .48, B(220) + .64);
    const md = mood(t, [[130, 'look', null, 'smile'], [B(219.4), 'wide', '!', 'o'], [B(219.8), 'star', null, 'open']]);
    const walking = t < B(219.2);
    const hero0 = { outfit: 'office', ...md, walk: walking ? bpOf(t) / 2 : null, lookX: .35 * (1 - jump), lookY: .45 * (1 - jump), aR: jump > 0 ? .45 + .25 * jk : .15, aL: jump > 0 ? .45 + .25 * jk : -1.1,
      dy: -jk * 4.2 - (walking ? Math.abs(Math.sin(bpOf(t) * Math.PI)) * .15 : 0), sq: pre * .16 + land * .14 - jk * .14, blush: got ? 1 : .5, ahoge: got ? 'perk' : 'normal', rot: .06 * Math.sin(jump * TAU) };
    if (jump <= 0) hero0.aR = -.3;
    const hx0 = her[0] - (walking ? (B(219.2) - t) * 120 : 0);
    hero(hx0, her[1], hs2, hero0);
    if (jump <= 0) { const [px, py] = handAt(hx0, her[1], hs2, hero0, 1); push(); translate(px + 6, py - 4); rotate(.12 + .05 * Math.sin(t * 30) * bell(t, B(219.35), B(219.6))); phoneInHand(hs2 * 1.25, 1, got ? 1 : 0); pop(); }
    if (got) {
      const [nx, ny] = handAt(hx0, her[1], hs2, { ...hero0, aR: -.3 }, 1), cardK = backOut(seg(t, B(219.35), B(219.6)));
      push(); translate(nx + 120, ny - 150 - jk * 100); scale(cardK);
      paint(rrPts(-95, -46, 190, 92, 24), { wash: '#FFFFFF', ink: INK, sw: 1.1 });
      heart(-48, 0, 24, '#EE5A83'); textBar(-12, -18, 86, '#E3B9C9', 14); textBar(-12, 6, 58, '#EBD3DC', 12);
      pop();
      if (jump > 0) for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * .45, d = 120 + 230 * easeOut(jump); heart(her[0] + Math.cos(a) * d, her[1] - 5 * hs2 - jk * 120 + Math.sin(a) * d, 24 * (1 - seg(jump, .75, 1)) * backOut(clamp(jump * 5)), i % 2 ? '#F29BB8' : '#EE5A83'); }
    }
    camEnd();
  }

  // =====================================================================================
  // SHOT 10 · 132.756–135.156 (painted until ~135.6) · 那些折腾过的夜 就有了回甘 — tea steam curls into little
  // pictures of late nights; each turns golden, then into candy
  // =====================================================================================
  const STEAM = [
    { t0: B(221) + .02, at: [610, 372], gold: B(222), candy: B(224) },
    { t0: B(222) - .02, at: [960, 232], gold: B(223), candy: B(224) + .06 },
    { t0: B(223) - .06, at: [1310, 372], gold: B(223) + .5, candy: B(224) + .12 }
  ];
  function steamPic(i, x, y) {                   // the three little late-night pictures (drawn as pencil lines, tinted later)
    if (i === 0) {                               // asleep on the keyboard
      paint(rrPts(x - 115, y + 34, 230, 46, 8), { wash: '#FFFFFF', ink: INK, sw: 1 });
      for (let r = 0; r < 2; r++) for (let c = 0; c < 8; c++) paint(rectPts(x - 100 + c * 25, y + 41 + r * 18, 19, 12), { ink: INK, sw: .5 });
      push(); translate(x - 20, y + 36); rotate(-1.45); hero(0, 0, 15, { eyes: 'closed', mouth: 'o', noShadow: true, aL: .3, aR: -1.4, ahoge: 'droop', sit: true }); pop();
      paint(ellPts(x - 62, y + 6, 11, 11, 12), { ink: INK, sw: .7 });
      letter('z', x + 40, y - 70, 34, INK, { font: 'cute', ink: false }); letter('z', x + 72, y - 104, 24, INK, { font: 'cute', ink: false });
    } else if (i === 1) {                        // a hopeless tangle of cables
      const pts = []; for (let k = 0; k < 40; k++) { const a = k * 1.9, r = 60 + 30 * Math.sin(k * 1.3); pts.push([x + Math.cos(a) * r * 1.2, y + Math.sin(a) * r * .8]); }
      inkLine(pts, 1.2, INK, 'ink', .8);
      for (const sd of [-1, 1]) { inkLine([[x + sd * 70, y + 30], [x + sd * 120, y + 70]], 1.2, INK, 'ink', .5); paint(rrPts(x + sd * 120 - 12, y + 62, 24, 30, 5), { ink: INK, sw: 1 }); }
    } else {                                     // 团子 walking across the keyboard
      paint(rrPts(x - 110, y + 30, 220, 50, 8), { wash: '#FFFFFF', ink: INK, sw: 1 });
      for (let r = 0; r < 2; r++) for (let c = 0; c < 8; c++) paint(rectPts(x - 96 + c * 24, y + 38 + r * 20, 18, 14), { ink: INK, sw: .5 });
      cat(x, y + 44, 16, { pose: 'walk', noShadow: true, walk: T * 1.5 });
      letter('a', x - 100, y - 40, 26, INK, { font: 'cute', ink: false }); letter('j', x + 90, y - 56, 22, INK, { font: 'cute', ink: false });
    }
  }
  function aftertaste(t, lt, dur) {
    const push2 = easeInOut(seg(t, 132.7, 135.6));
    const cam = [960, lerp(478, 462, push2), lerp(1.16, 1.28, push2)];
    camBegin(...cam);
    roomReverse(t, { lamp: 1, screen: .3, clock: 1.2 });
    const s = 52, hx = 960, hy = 880;
    const melt = ease(seg(t, B(224), B(224) + .5));
    const md = mood(t, [[132, 'normal', null, 'smile'], [B(222), 'closed', null, 'smile'], [B(224), 'happy', null, 'cat']]);
    const jelly = melt * (1 - seg(t, B(224) + .5, B(225) + .3)) * Math.sin((t - B(224)) * 14) * .05;
    const ho = { sit: true, noShadow: true, outfit: 'home', ...md, aL: -1.8, aR: -1.8, draw: holdMug('#F7B6C8'), blush: .6 + .4 * melt, sq: .1 * melt + jelly + .015 * Math.sin(t * 2.2), dy: .16 * melt, tilt: .06 * Math.sin(t * .9) - .08 * melt, ahoge: melt > .35 ? 'heart' : 'normal' };
    hero(hx, hy, s, ho);
    light(hx, hy - 380, 460, PAL.lamp, .22);
    paint([[-300, 842], [W + 300, 842], [W + 300, 1500], [-300, 1500]], { wash: DESK, fill: DESK_DK, fillOp: 70, bleed: .04, tex: .6, border: .4, ink: INK, sw: 1.4 });
    const cup = bodyPt(hx, hy, s, ho, 0, -2.85 * s);
    camEnd();
    // steam threads and pictures (screen space, re-applying the camera inside the layers)
    const toS = ([x, y]) => [W / 2 + (x - cam[0]) * cam[2], H / 2 + (y - cam[1]) * cam[2]];
    const c0 = toS(cup);
    for (let k = 0; k < 3; k++) {                // idle wisps
      const ph = frac(t * .45 + k / 3), pts = []; for (let j = 0; j <= 8; j++) pts.push([c0[0] + (k - 1) * 14 + Math.sin(j * .8 + t * 2 + k) * 9 * j / 8, c0[1] - 10 - j * 16 - ph * 20]);
      inkLine(pts, 1.1, PAL.cream, 'fine', .5, .55 * (1 - ph * .5));
    }
    STEAM.forEach((S, i) => {
      const age = t - S.t0; if (age < 0) return;
      const P = toS(S.at), grow = easeOut(clamp(age / .4)), ring = seg(age, .25, .5);
      const gold = seg(t, S.gold, S.gold + .35), gone = seg(t, S.candy, S.candy + .3);
      const col = mixCol('#FFF6E6', '#FFD06B', gold);
      // a curling thread from the cup to the picture
      if (gone < 1) {
        const sd = i === 0 ? -1 : 1, bot = [P[0], P[1] + 150 * cam[2]], c1 = [c0[0] + sd * 330, c0[1] - 60], c2 = [bot[0] + sd * (i === 1 ? 330 : 120), bot[1] + 260];
        const thr = []; for (let j = 0; j <= 24; j++) { const u = j / 24 * grow, v = 1 - u; thr.push([v * v * v * c0[0] + 3 * v * v * u * c1[0] + 3 * v * u * u * c2[0] + u * u * u * bot[0] + Math.sin(u * 9 + t * 2 + i) * 10, v * v * v * c0[1] + 3 * v * v * u * c1[1] + 3 * v * u * u * c2[1] + u * u * u * bot[1]]); }
        inkLine(thr, 2.2, col, 'ink', .6, .75 * (1 - gone));
        if (ring > 0) { const rr = []; for (let j = 0; j <= 30 * ring; j++) { const a = Math.PI / 2 + j / 30 * TAU; rr.push([P[0] + Math.cos(a) * 172 * cam[2] * (1 + .04 * Math.sin(j + t * 3)), P[1] + Math.sin(a) * 148 * cam[2]]); } if (rr.length > 1) inkLine(rr, 2.4, col, 'ink', .6, .85 * (1 - gone)); }
        const pa = seg(age, .3, .55) * (1 - gone);
        if (pa > .01) {
          glow(P[0], P[1], 230 * cam[2], mixCol('#FFF6E6', '#FFD06B', gold), (.28 + .3 * gold) * pa);
          const cv = layer(() => { camBegin(...cam); sketch(.49, () => { push(); translate(S.at[0], S.at[1]); scale(1.55); translate(-S.at[0], -S.at[1] - 10); steamPic(i, S.at[0], S.at[1]); pop(); }); camEnd(); X.globalCompositeOperation = 'source-in'; X.fillStyle = col; X.fillRect(0, 0, W, H); });
          stamp(cv, pa);
        }
      }
      // it all melts into golden candy that floats around her
      const ca = t - S.candy;
      if (ca > 0) for (let k = 0; k < 9; k++) {
        const a = k / 9 * TAU + i, d = 40 + 140 * easeOut(clamp(ca / .6)) + 20 * Math.sin(t * 2 + k), fall = ca * 40;
        const cx = P[0] + Math.cos(a) * d + Math.sin(t * 1.5 + k) * 10, cy = P[1] + Math.sin(a) * d * .8 + fall;
        candy(cx, cy, 13 + 6 * hash(k + i * 9), ['#FFD06B', '#F7B6C8', '#FFE3A8', '#BFE3D0', '#E3C8F0'][(k + i) % 5], t * 2 + k, clamp(ca / .2) * (.75 + .25 * Math.sin(t * 6 + k)));
      }
    });
    if (melt > 0) for (let i = 0; i < 4; i++) { const age = t - (B(224) + .1 + i * .15); if (age > 0 && age < 1.4) heart(toS([hx, 0])[0] + (i - 1.5) * 150, toS([0, hy - 8 * s])[1] - age * 110, 14 * bell(age, 0, 1.4), i % 2 ? '#F29BB8' : '#EE5A83'); }
  }

  chapter('days', 105.756, 135.156, [[105.756, timelapse], [110.556, cozy], [115.956, fragments], [118.656, tapeUp], [121.356, cornerFace], [123.456, hairSlider], [126.156, bigTalk], [127.956, smallChange], [130.956, convenient], [132.756, aftertaste]]);
  transition(105.756, 'page', 1.2);
})();
