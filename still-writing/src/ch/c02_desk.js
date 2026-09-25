// c02_desk: 2 · 书桌 (28.956–48.156). Indigo night + warm desk lamp.
//   28.956 window     she kneels on her chair at the window; car lights recede down the wet street, one pair per beat;
//                     the idea star copies her chin-in-hands on the sill, 团子 watches the lights; slow pull back to the room.
//   33.756 drafts     top-down desk: her hand draws one circle per beat → face, eyes, twin tails → the pencil 桃桃;
//                     a cat paw swats a paper ball; the idea star hops onto the page, snuggles into the drawing, it glows.
//   38.556 closeBook  the room: she snaps the book shut (puff), swivels round, stretches and yawns, clicks the lamp off,
//                     and pads off toward bed in the blue dark. 团子 is curled up asleep on the cushion.
//   43.356 qmarkShot  the closed book's cover lifts, a question mark pops out, stretches, hops over and tugs her hood;
//                     she stretches like rubber and zips back into the chair, sighs, smiles (ahoge curls into a "?"),
//                     lamp back on, book open, and we push into the page (chapter 3's page turn takes over at 47.556).
(() => {
  const B = n => beatT(n);                               // beat 48 = 28.956 · 56 = 33.756 · 64 = 38.556 · 72 = 43.356 · 80 = 48.156
  const HOOD = '#A9CFB5', HOOD_DK = '#7EA78E', HOOD_LT = '#C9E6D2';

  // ---------- small helpers ----------
  function partial(p, u) {                               // polyline cut at fraction u of its length
    const d = []; let L = 0;
    for (let i = 1; i < p.length; i++) { d.push(Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1])); L += d[i - 1]; }
    let s = clamp(u) * L; const out = [p[0]];
    for (let i = 1; i < p.length; i++) {
      if (s >= d[i - 1]) { out.push(p[i]); s -= d[i - 1]; }
      else { const f = s / Math.max(1e-6, d[i - 1]); out.push([lerp(p[i - 1][0], p[i][0], f), lerp(p[i - 1][1], p[i][1], f)]); break; }
    }
    return out;
  }
  const tipOf = p => p[p.length - 1];
  // swap the view out of the room's window for one of ours while room() paints (restored straight after)
  function roomWith(t, o, view) {
    if (!view) return room(t, o);
    const keep = windowView; windowView = view;
    try { room(t, o); } finally { windowView = keep; }
  }
  // the switched-off monitor: a soft sheen and the room reflected faintly in the glass (so it isn't a black hole)
  function monitorSheen(lamp = 1) {
    const r = ROOM.screen; if (!r) return;
    clipTo(rrPts(r.x, r.y, r.w, r.h, 8), () => {
      paint(rectPts(r.x, r.y, r.w, r.h), { grad: ['#3A4480', '#1B2048', -Math.PI * .3], washOp: 150, ink: null });
      paint([[r.x + r.w * .55, r.y], [r.x + r.w * .72, r.y], [r.x + r.w * .38, r.y + r.h], [r.x + r.w * .21, r.y + r.h]], { wash: '#8FA3E8', washOp: 22, ink: null });
      glow(r.x + 60, r.y + r.h - 40, 260, PAL.lamp, .22 * lamp);
      for (let i = 0; i < 5; i++) dot(r.x + r.w * (.1 + hash(i * 3.3) * .8), r.y + r.h * (.15 + hash(i * 5.1) * .7), 2 + hash(i) * 2, '#BFD0FF', .25);
    });
  }
  // a thin cool rim of window light on the back of her hair
  function hairRim(x, y, s, tilt = 0, k = 1) {
    push(); translate(x, y - 4.3 * s); rotate(tilt); translate(0, -2.4 * s);
    for (const [a0, a1] of [[1.02, 1.3], [1.7, 1.98]]) {
      const arc = []; for (let i = 0; i <= 8; i++) { const a = Math.PI * lerp(a0, a1, i / 8); arc.push([Math.cos(a) * 2.86 * s, -.2 * s + Math.sin(a) * 2.6 * s]); }
      inkLine(arc, clamp(s / 19, .32, 2.3) * .9, '#C4D2FA', 'marker', .5, .5 * k);
    }
    pop();
  }
  // soft pale light falling from the window onto the floor
  function windowLightPool(k = 1) {
    if (k <= .01) return;
    light(470, 1000, 430, '#8FB4F0', .16 * k);
    paint([[230, 905], [770, 905], [980, 1090], [80, 1090]], { fill: '#9DB8EE', fillOp: 38 * k, bleed: .15, tex: .2, border: 0, ink: null });
  }

  // ---------- the view down to the street (replaces windowView in the room shots of this chapter) ----------
  const VP = [604, 344], NEAR_Y = 614;
  const sPt = (u, r) => { const nx = lerp(470, 905, (u + 1) / 2); return [VP[0] + (nx - VP[0]) / r, VP[1] + (NEAR_Y - VP[1]) / r]; };
  const CARS = [0, 1, 2, 3, 4, 5, 6].map(i => ({ tb: B(49 + i), lane: .42 + (hash(i * 3.7) - .5) * .1, col: hash(i * 5.3) }));
  const R_END = 9, V = 2.0;
  function carR(c, t) { return R_END - V * (c.tb - t); }
  function streetView(x, y, w, h, t, o = {}) {
    clipTo(rectPts(x, y, w, h), () => {
      // sky
      paint(rectPts(x - 20, y - 20, w + 40, h + 40), { grad: ['#1A1F4E', '#4A3C7A', Math.PI / 2], ink: null });
      light(VP[0], VP[1] - 10, 380, '#B98AC8', .25);
      for (let i = 0; i < 16; i++) dot(x + hash(i * 3.3) * w, y + hash(i * 7.1) * h * .38, 1.1 + hash(i) * 1.5, PAL.cream, .35 + .45 * Math.sin(t * 2 + i));
      // far skyline at the end of the street
      for (let i = 0; i < 12; i++) {
        const bx = 470 + i * 26 + hash(i * 2.1) * 10, bw = 18 + hash(i * 4.4) * 16, bh = 26 + hash(i * 6.2) * 70;
        paint(rectPts(bx, VP[1] - bh, bw, bh + 6), { wash: mixCol('#2E3068', '#4B3F7C', hash(i)), washOp: 235, ink: null });
        for (let k = 0; k < 4; k++) if (hash(i * 13 + k) > .5) fillRectA(bx + 4 + hash(i + k) * (bw - 8), VP[1] - bh + 6 + k * 14, 3, 4, '#FFD98A', .8);
      }
      // road, kerbs and pavements
      const road = [sPt(-1, 1), sPt(1, 1), sPt(1, 80), sPt(-1, 80)];
      paint([sPt(-2.4, 1), sPt(2.6, 1), sPt(2.6, 80), sPt(-2.4, 80)], { wash: '#3A3A6A', ink: null });
      paint(road, { wash: '#262A55', fill: '#1B1F44', fillOp: 80, bleed: .04, tex: .5, border: 0, ink: null });
      for (const u of [-1, 1]) inkLine([sPt(u, 1), sPt(u, 80)], .7, '#5B5C8E', 'fine', 0);
      for (let k = 0; k < 9; k++) {                        // centre-line dashes
        const r0 = 1.05 * Math.pow(1.45, k), r1 = r0 * 1.18;
        inkLine([sPt(-.02, r0), sPt(-.02, r1)], Math.max(.25, 2.2 / Math.sqrt(r0)), '#8F8FB8', 'marker', 0, .7);
      }
      // buildings lining the street (left side, and the far right side)
      const bldg = (u, r0, r1, hNear, col, side) => {
        const [ax, ay] = sPt(u, r0), [bx, by] = sPt(u, r1), ha = hNear / r0, hb = hNear / r1;
        paint([[ax, ay], [bx, by], [bx, by - hb], [ax, ay - ha]], { wash: col, fill: mixCol(col, PAL.ink, .25), fillOp: 60, bleed: .03, tex: .5, border: .3, ink: PAL.ink, sw: .7 });
        const cols = 4, rows = Math.max(2, Math.round(hNear / 70));
        for (let c = 0; c < cols; c++) for (let rw = 0; rw < rows; rw++) {
          const hs = hash(r0 * 17 + c * 7 + rw * 3 + side * 50); if (hs < (r0 < 1.5 ? .7 : .5)) continue;
          const f0 = (c + .32) / cols, f1 = (c + .62) / cols, rr0 = lerp(r0, r1, f0), rr1 = lerp(r0, r1, f1);
          const [p0x, p0y] = sPt(u, rr0), [p1x, p1y] = sPt(u, rr1), v0 = (rw + .35) / rows, v1 = (rw + .65) / rows;
          const q = [[p0x, p0y - hNear / rr0 * v0], [p1x, p1y - hNear / rr1 * v0], [p1x, p1y - hNear / rr1 * v1], [p0x, p0y - hNear / rr0 * v1]];
          paint(q, { wash: hs > .85 ? '#FFB3A0' : '#FFD98A', washOp: (r0 < 1.5 ? 90 : 140) + 80 * hash(hs * 40), ink: null });
        }
      };
      bldg(2.3, 2.2, 5.5, 560, '#343A72', 1); bldg(2.3, 5.8, 14, 380, '#3C3F7A', 1);
      bldg(-2.4, .8, 1.6, 900, '#2C3268', -1); bldg(-2.4, 1.7, 3.1, 640, '#343A72', -1); bldg(-2.4, 3.3, 7, 820, '#2A2F63', -1); bldg(-2.4, 7.3, 16, 520, '#383C77', -1);
      // street lamps: warm pools on the wet road
      for (const r of [1.25, 2.1, 3.6, 6.2, 11]) {
        const [px, py] = sPt(-1.35, r), ph = 260 / r;
        inkLine([[px, py], [px, py - ph]], Math.max(.3, 1.6 / Math.sqrt(r)), '#1A1C3A', 'marker', 0);
        const [lx, ly] = sPt(-.95, r);
        glow(lx, ly, 150 / r, PAL.lamp, .35);
        glow(px + 16 / r, py - ph, 60 / r + 4, '#FFE3A0', .8);
        dot(px + 12 / r, py - ph, Math.max(1, 7 / r), '#FFF1C8', .95);
        light(lx, ly + 40 / r, 40 / r + 3, PAL.lamp, .35);           // reflection streak
      }
      // the cars: red tail-lights (with a trail) and a warm headlight pool ahead, driving away; one pair goes out per beat
      CARS.forEach((c, i) => {
        const r = carR(c, t); if (r < .7) return;
        const out = 1 - seg(t, c.tb - .05, c.tb + .2); if (out <= .001) return;
        const u = c.lane, [cx, cy] = sPt(u, r), sc = 1 / r;
        const [hx2, hy2] = sPt(u, r * 1.5);
        glow(hx2, hy2, 110 * sc + 3, '#FFE7A0', .5 * out);                      // headlight pool on the road ahead
        const trail = []; for (let k = 0; k <= 6; k++) trail.push(sPt(u, Math.max(.8, r * (1 - k * .07))));
        for (const sd of [-1, 1]) inkLine(trail.map(([px, py], k) => [px + sd * 30 * sc * (1 + k * .07), py]), Math.max(.3, 3 * sc), '#FF5A6A', 'marker', .2, .35 * out);
        paint(rrPts(cx - 58 * sc, cy - 52 * sc, 116 * sc, 50 * sc, 14 * sc), { wash: ['#2A2A55', '#23305A', '#3A2A4E', '#263A4A'][i % 4], washOp: 240 * out, ink: out > .5 && sc > .2 ? PAL.ink : null, sw: .5 });
        paint(rrPts(cx - 40 * sc, cy - 78 * sc, 80 * sc, 34 * sc, 12 * sc), { wash: '#3A4272', washOp: 240 * out, ink: out > .5 && sc > .2 ? PAL.ink : null, sw: .5 });   // cabin
        paint(rrPts(cx - 32 * sc, cy - 72 * sc, 64 * sc, 16 * sc, 6 * sc), { wash: '#8FA0D8', washOp: 110 * out, ink: null });  // rear window catching the street lamps
        for (const sd of [-1, 1]) {
          const tx = cx + sd * 42 * sc, ty = cy - 18 * sc;
          glow(tx, ty, 46 * sc + 4, '#FF3B55', .55 * out);
          dot(tx, ty, Math.max(.8, 9 * sc), '#FF8A8A', out);
          light(tx, ty + 60 * sc, 30 * sc + 2, '#FF4060', .3 * out);            // wet-road reflection
        }
        const blink = seg(t, c.tb - .05, c.tb + .35);                          // a tiny twinkle when a pair goes out
        if (blink > 0 && blink < 1) sparkle(cx, cy - 18 * sc, 10, '#FFD0D8', blink);
      });
      if ((o.rain ?? 1) > .01) rainStreaks(t, { x, y, w, h }, 30, '#D6E4FF', .5);
      paint([[x + w * .06, y + 10], [x + w * .22, y + 10], [x + w * .1, y + h * .55], [x + w * .02, y + h * .55]], { wash: '#FFFFFF', washOp: 16, ink: null });
    });
  }

  // ---------- her, seen from behind: the back of the bob gets a little more life than the plain dome ----------
  function sillArms(s, sw) {                            // body-local: elbows resting on the sill, forearms folded under her chin
    for (const sd of [-1, 1]) {
      paint(rrPts(-.62 * s, -.36 * s, 1.24 * s, .72 * s, .36 * s).map(([px, py]) => { const a = sd * -.18; return [sd * 1.45 * s + px * Math.cos(a) - py * Math.sin(a), -4.15 * s + px * Math.sin(a) + py * Math.cos(a)]; }), { wash: HOOD, fill: HOOD_DK, fillOp: 60, tex: .3, border: .2, ink: PAL.ink, sw: sw * .75 });
      inkLine([[sd * 1.75 * s, -4.45 * s], [sd * 2.02 * s, -4.1 * s], [sd * 1.8 * s, -3.85 * s]], sw * .5, HOOD_DK, 'fine', .6);
    }
  }
  function hoodBack(s, sw) {                             // body-local: the hood hanging on her upper back
    paint([[-1.15 * s, -4.45 * s], [1.15 * s, -4.45 * s], [.95 * s, -3.75 * s], [0, -3.3 * s], [-.95 * s, -3.75 * s]], { wash: HOOD_LT, fill: HOOD_DK, fillOp: 60, tex: .3, ink: PAL.ink, sw: sw * .6, curv: .45 });
    inkLine([[-.7 * s, -4.2 * s], [0, -3.65 * s], [.7 * s, -4.2 * s]], sw * .45, HOOD_DK, 'fine', .5);
  }
  function backHair(x, y, s, o = {}) {                   // strands, shine and the star clip on the back of her head
    const tilt = o.tilt || 0, dy = (o.dy || 0) * s;
    push(); translate(x, y + dy); if (o.rot) rotate(o.rot); translate(0, -4.3 * s); rotate(tilt); translate(0, -2.4 * s);
    const sw = clamp(s / 19, .32, 2.3);
    for (const k of [-.55, -.2, .2, .55]) inkLine([[k * .4 * s, -2.2 * s], [k * 1.6 * s, -.4 * s], [k * 2.2 * s, 1.5 * s]], sw * .45, '#3E2724', 'fine', .6);
    for (const [a0, a1] of [[1.18, 1.38], [1.45, 1.62], [1.68, 1.84]]) {
      const arc = []; for (let k = 0; k <= 5; k++) { const a = Math.PI * lerp(a0, a1, k / 5); arc.push([Math.cos(a) * 2.35 * s, -.9 * s + Math.sin(a) * 1.9 * s]); }
      inkLine(arc, sw * 2.2, '#8E6254', 'marker', .5, .7);
    }
    for (const k of [-2.3, -1.2, 0, 1.2, 2.3]) inkLine([[k * s, 2.2 * s], [k * s + .12 * s, 2.55 * s]], sw * .5, '#3E2724', 'fine', 0);
    push(); translate(2.45 * s, -1.6 * s); rotate(.3); paint(starPts(0, 0, .42 * s, .48, 5), { wash: '#F6C85F', ink: PAL.ink, sw: sw * .45 }); pop();
    pop();
  }
  // the idea star with two tiny hands on its cheeks (copying her chin-in-hands)
  function ideaChin(x, y, s, o = {}) {
    idea(x, y, s, o);
    const rt = (o.rot || 0) + Math.sin(T * 2.5 + (o.seed || 0)) * .12, pk = 1 + .08 * Math.sin(T * 6 + (o.seed || 0));
    push(); translate(x, y); rotate(rt); scale(pk * (1 + (o.sq || 0) * .4), pk * (1 - (o.sq || 0)));
    for (const sd of [-1, 1]) paint(ellPts(sd * .5 * s, .5 * s, .3 * s, .26 * s, 10, 0, sd * .5), { wash: '#FFE8A3', ink: PAL.ink, sw: clamp(s / 10, .3, 1.6) * .55 });
    pop();
  }

  // =====================================================================================
  // 28.956 · At the window: the car lights go away down the street, one pair per beat. Slow pull back to the dark room.
  function windowShot(t, lt, dur) {
    const z = kf(t, [[28.6, 1.95], [30.0, 1.86], [33.7, 1.0]], easeInOut);
    const cx = kf(t, [[28.6, 548], [30.0, 556], [33.7, 960]], easeInOut), cy = kf(t, [[28.6, 452], [30.0, 452], [33.7, 540]], easeInOut);
    camBegin(cx, cy, z, kf(t, [[28.6, -.012], [33.7, 0]], easeInOut));
    roomWith(t, { lamp: .85, book: 'open', screenOn: 0, clutter: .5, dark: .12 }, streetView);
    monitorSheen(.85);
    windowLightPool(.8);
    const bp = bpOf(t), sway = Math.sin(bp / 2 * Math.PI);
    // 团子 on the sill, watching the lights go
    const near = CARS.filter(c => carR(c, t) > .9 && t < c.tb).sort((a, b) => carR(a, t) - carR(b, t))[0];
    const look = near ? clamp((sPt(near.lane, carR(near, t))[0] - 735) / 120, -1, 1) : -.2;
    cat(738, 608, 15.5, { pose: 'sit', look, tail: .5 * Math.sin(bp * Math.PI), dy: -.06 * pulse(t, 5), noShadow: true });
    // the idea star copies her, half a beat behind; when the last lights have gone it perks up and looks at the desk
    const IDEA = B(55) + .15, ik = seg(t, IDEA, IDEA + .3), sw2 = Math.sin((bp - .5) / 2 * Math.PI) * (1 - ik);
    const hopI = Math.sin(seg(t, IDEA, IDEA + .35) * Math.PI);
    ideaChin(588, 580 - hopI * 26, 19, { eyes: t > IDEA ? 'happy' : 'normal', rot: -.22 * sw2 + .35 * ik, sq: -.12 * hopI, glow: .9 + .8 * ik });
    if (ik > 0) sparkle(620, 540, 16, '#FFF3C0', seg(t, IDEA + .05, IDEA + .6));
    // her, kneeling on the chair with her arms folded on the sill; her ahoge perks up at the end
    const hx = 386, hs = 38, hy = 776, br = Math.sin(t * 2.1) * .015, tl = .1 * sway * (1 - ik) + .16 * easeOut(seg(t, IDEA + .15, IDEA + .45));
    const perk = t > IDEA + .2;
    hero(hx, hy, hs, { back: true, outfit: 'home', aL: -1.35, aR: -1.35, tilt: tl, sq: br - .06 * Math.sin(seg(t, IDEA + .2, IDEA + .45) * Math.PI), noShadow: true, ahoge: perk ? 'perk' : 'normal',
      emote: perk ? 'spark' : null, emoteK: seg(t, IDEA + .2, IDEA + .45), draw: (s, sw) => { sillArms(s, sw); hoodBack(s, sw); } });
    backHair(hx, hy, hs, { tilt: tl, sq: br });
    hairRim(hx, hy, hs, tl);
    chair(hx, 932, hs, { seat: 3.2, backOnly: true });
    camEnd();
    vignette(.35, PAL.night);
  }

  // =====================================================================================
  // 33.756 · Top-down: one circle per beat (face, eyes, twin tails), then the pencil fills in 桃桃. A cat paw swats a
  // paper ball; the idea star hops over the spine into the drawing's arms, and the whole drawing glows.
  const MOMO_AT = [1200, 792, 44];                       // the pencil 桃桃 on the right page: ground point + unit
  const PENCIL_COL = '#55536A';
  function ringPath(cx, cy, rx, ry, a0, turns, rot = 0, seed = 0) {  // a hand-drawn circle: slightly wobbly, overshooting
    const n = Math.round(34 * turns), p = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n, a = a0 + u * turns * TAU, wob = 1 + .045 * Math.sin(u * 9 + seed) + .03 * u;
      const x = Math.cos(a) * rx * wob, y = Math.sin(a) * ry * wob;
      p.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]);
    }
    return p;
  }
  const [MX, MY, MS] = MOMO_AT, HC = [MX, MY - 6.7 * MS];
  const CIRCLES = [
    { tb: B(56), p: ringPath(HC[0], HC[1] - 4, 132, 124, -2.3, 1.1, 0, 1) },
    { tb: B(57), p: ringPath(HC[0] - 1.05 * MS, HC[1] + .2 * MS, 21, 27, -1.9, 1.15, 0, 2) },
    { tb: B(58), p: ringPath(HC[0] + 1.05 * MS, HC[1] + .2 * MS, 21, 27, -1.9, 1.15, 0, 3) },
    { tb: B(59), p: ringPath(HC[0] - 3.35 * MS, HC[1] + 1.0 * MS, 44, 110, -1.7, 1.08, .14, 4) },
    { tb: B(60), p: ringPath(HC[0] + 3.35 * MS, HC[1] + 1.0 * MS, 44, 110, -1.4, 1.08, -.14, 5) },
  ];
  const strokeU = (c, t) => easeInOut(seg(t, c.tb - .08, c.tb + .4));
  const REVEAL = [B(61) - .04, B(61) + .56];             // the pencil fills in the drawing, top to bottom
  const revealY = t => lerp(HC[1] - 5.2 * MS, MY + 20, easeInOut(seg(t, REVEAL[0], REVEAL[1])));
  const HOP = [B(62) - .02, B(62) + .44], NEST = [MX, MY - 3.1 * MS];
  // where the pencil tip is at time t, and how far the hand is lifted (0 on the paper .. 1 hovering)
  function pencilAt(t) {
    for (let i = 0; i < CIRCLES.length; i++) {
      const c = CIRCLES[i], a = c.tb - .08, b = c.tb + .4;
      if (t >= a && t <= b) return { p: tipOf(partial(c.p, strokeU(c, t))), lift: 0 };
      const nx = CIRCLES[i + 1];
      const next = nx ? nx.p[0] : [MX - 150, revealY(REVEAL[0])];
      const na = nx ? nx.tb - .08 : REVEAL[0];
      if (t > b && t < na) {                             // travel to the next start, lifted
        const k = easeInOut(seg(t, b, na)), p0 = tipOf(c.p);
        return { p: [lerp(p0[0], next[0], k), lerp(p0[1], next[1], k) - Math.sin(k * Math.PI) * 30], lift: Math.sin(k * Math.PI) };
      }
      if (i === 0 && t < a) { const k = easeOut(seg(t, a - .5, a)); return { p: [lerp(c.p[0][0] + 170, c.p[0][0], k), lerp(c.p[0][1] + 230, c.p[0][1], k)], lift: 1 - k }; }
    }
    if (t < REVEAL[1]) {                                 // quick scribble across the reveal line
      const y = revealY(t), k = seg(t, REVEAL[0], REVEAL[1]), w = 150 * Math.sin(Math.PI * clamp(.15 + k * .85));
      return { p: [MX + w * Math.sin(t * TAU * 5.5), y], lift: .15 };
    }
    const k = easeInOut(seg(t, REVEAL[1], REVEAL[1] + .5));                   // then lifts away to rest at the bottom right
    return { p: [lerp(MX + 60, 1500, k), lerp(MY + 20, 820, k)], lift: Math.min(1, k * 1.6) * (1 - seg(t, REVEAL[1] + .5, REVEAL[1] + .8) * .8) };
  }
  // her right hand holding the pencil, seen from above: a round chibi mitten of a hand; (x, y) is the pencil tip
  function drawingHand(x, y, lift = 0, o = {}) {
    const sc = (o.s || 1) * (1 + lift * .07), ang = -.52 + (o.rot || 0) + (x - 1200) * .0004, so = 14 + lift * 26;
    const sleeve = [[-54, 92], [54, 90], [64, 300], [80, 760], [-74, 760], [-62, 300]];
    push(); translate(x + so, y + so * 1.2); rotate(ang); scale(sc);                  // soft shadow on the paper
    paint([[-40, 18], [40, 16], [70, 90], [96, 760], [-90, 760], [-64, 90]], { fill: PAL.ink, fillOp: 44, bleed: .25, tex: .1, border: 0, ink: null, curv: .3 });
    pop();
    push(); translate(x, y); rotate(ang); scale(sc);
    paint(sleeve, { wash: HOOD, fill: HOOD_DK, fillOp: 60, bleed: .04, tex: .4, border: .3, ink: PAL.ink, sw: 1.1, curv: .2 });
    paint([[20, 130], [58, 128], [80, 600], [40, 600]], { fill: HOOD_DK, fillOp: 70, bleed: .1, tex: .3, border: 0, ink: null });
    inkLine([[-50, 140], [-56, 360], [-62, 560]], 2.2, HOOD_LT, 'marker', .3, .8);
    for (const [fy, fw] of [[190, 1], [300, .8], [420, 1]]) inkLine([[-40 * fw, fy], [-6, fy + 16], [26 * fw, fy + 6]], .7, mixCol(HOOD_DK, PAL.ink, .2), 'fine', .6);
    paint(rrPts(-64, 82, 128, 34, 15), { wash: HOOD_DK, fill: HOOD, fillOp: 30, tex: .3, ink: PAL.ink, sw: 1 });   // ribbed cuff
    for (let k = -52; k <= 52; k += 13) inkLine([[k, 86], [k + 1, 112]], .5, mixCol(HOOD_DK, PAL.ink, .25), 'fine', 0);
    paint(ellPts(4, 50, 50, 44, 20), { wash: SKIN, ink: PAL.ink, sw: 1.1 });          // the hand
    paint(ellPts(10, 70, 36, 20, 14), { fill: SKIN_DK, fillOp: 70, bleed: .15, tex: .2, border: 0, ink: null });
    pencil(0, 0, 1.28, Math.PI - .52, '#F6C85F');
    paint(ellPts(-6, 21, 16, 17, 12), { wash: SKIN, ink: PAL.ink, sw: .9 });         // fingertips pinching the pencil
    paint(ellPts(17, 27, 14, 15, 12), { wash: SKIN, ink: PAL.ink, sw: .9 });
    paint(ellPts(-38, 44, 14, 21, 12, 0, .6), { wash: SKIN, ink: PAL.ink, sw: .9 });  // thumb
    paint(ellPts(-18, 50, 8, 5, 8), { fill: CHEEK, fillOp: 80, bleed: .2, ink: null });
    pop();
  }
  // 团子's paw reaching in over the far edge of the desk; (x0, y0) is where the paw pad lands, dir the reach direction
  function catPaw(x0, y0, reach, flick = 0, dir = Math.PI / 2) {
    if (reach <= .01) return;
    push(); translate(x0, y0); rotate(dir - Math.PI / 2);                        // local +y = reach direction
    translate(flick * 30, lerp(-330, 0, easeOut(reach))); rotate(flick * .4);
    paint(rrPts(-46, -440, 92, 440, 46), { wash: CAT, fill: CAT_DK, fillOp: 50, tex: .3, border: .2, ink: PAL.ink, sw: 1.1 });
    for (const k of [-330, -240, -150]) inkLine([[-42, k], [-8, k + 26], [32, k + 8]], 3.4, CAT_DK, 'marker', .5);
    paint(ellPts(0, 12, 56, 62, 20), { wash: CAT_LT, ink: PAL.ink, sw: 1.1 });
    for (const k of [-1, 0, 1]) inkLine([[k * 22 - 4, 42], [k * 24, 66]], .9, PAL.ink, 'fine', .3);
    if (Math.abs(flick) > .2) for (const k of [-1, 0, 1]) paint(ellPts(k * 24, 52, 8, 9, 8), { wash: PAL.pink, ink: null });
    pop();
  }
  // the right page: construction circles, then the pencil 桃桃, then the glow
  function draftPage(r, t, o = {}) {
    const rev = o.full ? MY + 120 : revealY(t), glowK = o.glowK ?? 0;
    const faint = o.full ? .35 : lerp(1, .35, seg(t, REVEAL[0] + .1, REVEAL[1] + .2));
    CIRCLES.forEach(c => {
      const u = o.full ? 1 : strokeU(c, t); if (u <= .001) return;
      const q = partial(c.p, u);
      inkLine(q, 1.5, PENCIL_COL, 'pencil', 0, faint);
      if (q.length > 3) inkLine(q.slice(2).map(([px, py]) => [px + 1.5, py - 1.2]), .9, PENCIL_COL, 'pencil', 0, faint * .8);
    });
    if (rev > HC[1] - 5.6 * MS) {
      clipTo(rectPts(r.x - 10, r.y - 10, r.w + 20, rev - r.y + 10), () => {
        const mo = { eyes: glowK > .3 ? 'happy' : 'normal', mouth: 'smile', aL: -.45, aR: -.45, noShadow: true, blush: .6, starGlow: 0, swMul: 1.5 };
        sketch(1 - .28 * glowK, () => momo(MX, MY, MS, mo));
        fadeIn(.55, () => sketch(1, () => { push(); translate(1.2, -.8); momo(MX, MY, MS, { ...mo, swMul: 1.0 }); pop(); }));   // a second, sketchier pass
      });
      if (!o.full && t < REVEAL[1]) inkLine([[r.x + 40, rev + jit(2)], [r.x + r.w - 40, rev + jit(2)]], .5, PENCIL_COL, 'pencil', 0, .35);
    }
  }
  // the left page: yesterday's attempts (faint pencil)
  function oldDrafts(r) {
    const P = (pts, w = .9, a = .5) => inkLine(pts, w, PENCIL_COL, 'pencil', .4, a);
    for (let i = 0; i < 4; i++) P([[r.x + 50 + i * 40, r.y + 60 + (i % 2) * 8], [r.x + 170 + i * 50 - (i === 3 ? 90 : 0), r.y + 62 + (i % 2) * 6]], .7, .38);
    const rings = [[610, 470, 58, 1.3], [640, 486, 64, 2.1], [800, 450, 50, 3.2]];
    rings.forEach(([cx, cy, rr, sd]) => inkLine(ringPath(cx, cy, rr, rr * .92, -2, 1.1, 0, sd), .8, PENCIL_COL, 'pencil', 0, .42));
    P([[570, 410], [690, 540]], 1, .45); P([[690, 410], [570, 540]], 1, .45);            // crossed out
    for (const [cx, cy] of [[760, 440], [838, 440]]) inkLine(ringPath(cx, cy, 10, 13, -1.8, 1.1, 0, cx), .7, PENCIL_COL, 'pencil', 0, .45);
    inkLine(ringPath(706, 640, 30, 70, -1.6, 1.05, .15, 7), .8, PENCIL_COL, 'pencil', 0, .4);
    inkLine(ringPath(610, 700, 22, 52, -1.6, 1.05, .3, 8), .8, PENCIL_COL, 'pencil', 0, .35);
    paint(starPts(820, 640, 34, .45, 5, -1.3), { ink: PENCIL_COL, sw: .7, br: 'pencil' });
    for (let i = 0; i < 4; i++) { const a = i * 1.57 + .4; P([[820 + Math.cos(a) * 48, 640 + Math.sin(a) * 48], [820 + Math.cos(a) * 62, 640 + Math.sin(a) * 62]], .6, .4); }
    P([[800, 770], [880, 770], [866, 758]], .8, .45); P([[880, 770], [866, 782]], .8, .45);   // arrow → the new page
  }
  function deskClutter(t, o = {}) {
    // soda can seen from above + the ring it left
    paint(ellPts(1600, 318, 56, 52, 24), { ink: '#B89A7A', sw: .9, br: 'fine' });
    paint(ellPts(1600, 318, 56, 52, 24), { fill: '#C9A27E', fillOp: 45, bleed: .1, tex: .3, border: .8, ink: null });
    for (let i = 0; i < 4; i++) dot(1560 + hash(i * 4.1) * 90, 280 + hash(i * 6.2) * 90, 3 + hash(i) * 3, '#E8D8C0', .6);
    paint(ellPts(1745, 180, 62, 62, 26), { wash: '#F8B99A', fill: '#EE8A6D', fillOp: 70, tex: .3, ink: PAL.ink, sw: 1.1 });
    paint(ellPts(1745, 180, 52, 52, 24), { wash: '#E4E6EE', fill: '#B8BCCB', fillOp: 50, tex: .3, ink: PAL.ink, sw: .8 });
    paint(ellPts(1745, 180, 42, 42, 22), { ink: '#9A9EB0', sw: .6, br: 'fine' });
    paint([[1745, 176], [1732, 150], [1745, 138], [1758, 150]], { wash: '#4A4C62', ink: PAL.ink, sw: .6, curv: .6 });   // the opening
    paint(rrPts(1731, 172, 28, 40, 12), { wash: '#C9CCD8', ink: PAL.ink, sw: .7 });                                     // pull tab
    paint(ellPts(1745, 196, 7, 8, 8), { wash: '#8E92A6', ink: null });
    // eraser + crumbs
    push(); translate(1530, 700); rotate(.5);
    paint(rrPts(-46, -22, 92, 44, 8), { wash: '#FBD3DC', ink: PAL.ink, sw: .9 });
    paint(rectPts(-10, -23, 56, 46), { wash: '#7FB4D8', ink: PAL.ink, sw: .8 });
    pop();
    for (let i = 0; i < 14; i++) {
      const cx = 1060 + hash(i * 2.7) * 360, cy = 815 + hash(i * 3.9) * 32, a = hash(i) * 3;
      inkLine([[cx, cy], [cx + Math.cos(a) * 8, cy + Math.sin(a) * 5], [cx + Math.cos(a + 1) * 12, cy + Math.sin(a + 1) * 7]], .7, '#B9A3B0', 'fine', .6);
    }
    for (let i = 0; i < 8; i++) { const cx = 1490 + hash(i * 5.1) * 90, cy = 735 + hash(i * 7.3) * 60; inkLine([[cx, cy], [cx + 7, cy + 3], [cx + 10, cy - 2]], .7, '#D9A3B4', 'fine', .6); }
    // paper balls and a spare pencil
    paperBall(1650, 560, 2.2, 7); paperBall(380, 250, 2.0, 8);
    pencil(1640, 900, 1.1, -1.9, PAL.sky);
    stickyNote(250, 470, 1.4, '#FFF1A8', -.14, 1);
  }
  function drafts(t, lt, dur) {
    const z = kf(t, [[33.6, 1.16], [36.6, 1.22], [38.6, 1.4]], easeInOut);
    const cx = kf(t, [[33.6, 1050], [36.6, 1080], [38.6, 1170]], easeInOut), cy = kf(t, [[33.6, 548], [38.6, 510]], easeInOut);
    const glowK = Math.exp(-Math.max(0, t - B(63)) * 2.2) * seg(t, B(63) - .08, B(63) + .04);
    camBegin(cx, cy, z, kf(t, [[33.6, .01], [38.6, -.005]]));
    deskTop(t, { lamp: 1, page: (r, side, tt) => side < 0 ? oldDrafts(r) : draftPage(r, tt, { glowK }), items: tt => {
      deskClutter(tt);
      // 团子's paw swats the paper ball off the desk
      const ballT = B(59), fly = seg(t, ballT, ballT + .5);
      const reach = seg(t, ballT - .55, ballT - .12) * (1 - seg(t, ballT + .25, ballT + .7));
      const flick = t < ballT - .12 ? 0 : t < ballT ? -seg(t, ballT - .12, ballT) * .6 : lerp(-.6, 1, easeOut(seg(t, ballT, ballT + .08))) * (1 - seg(t, ballT + .2, ballT + .5));
      if (fly <= 0) paperBall(585, 318, 1.9, 9);
      else if (fly < 1) {
        const bx = lerp(585, -120, easeOut(fly)), by = 318 - Math.sin(fly * Math.PI) * 120 - fly * 60;
        push(); translate(bx, by); rotate(fly * 9); paperBall(0, 25, 1.9, 9); pop();
        for (let k = 0; k < 3; k++) inkLine([[bx + 44, by - 14 + k * 16], [bx + 110 + k * 16, by - 14 + k * 16]], 1, PAL.cream, 'fine', 0, .8 * (1 - fly));
      }
      catPaw(625, 272, reach, flick, Math.PI / 2 + .45);
      // the idea star: watching from the left page, bouncing along; then the hop into 桃桃's arms
      const hp = seg(t, HOP[0], HOP[1]), perch = [800, 590], land = t > HOP[1];
      let sx = perch[0], sy = perch[1] - Math.abs(Math.sin(bpOf(t) * Math.PI)) * 16 * (t < REVEAL[0] ? 1 : .4), sq = 0, rot = .15;
      if (t > REVEAL[0] && t < HOP[0]) { sq = -.12 * seg(t, HOP[0] - .25, HOP[0]); sy += 10 * seg(t, HOP[0] - .25, HOP[0]); }
      if (hp > 0 && hp < 1) { sx = lerp(perch[0], NEST[0], ease(hp)); sy = lerp(perch[1], NEST[1], ease(hp)) - Math.sin(hp * Math.PI) * 230; sq = -.15; rot = hp * TAU * .9; }
      if (land) { const a = t - HOP[1]; sx = NEST[0]; sy = NEST[1] + 4; sq = .3 * Math.exp(-a * 7) * Math.cos(a * 22); rot = -.1 + .04 * Math.sin(t * 2); }
      idea(sx, sy, land ? 23 : 21, { eyes: land && t > HOP[1] + .15 ? 'happy' : 'normal', sq, rot, glow: 1 + glowK * 1.5, trail: hp > 0 && hp < 1 ? tt2 => { const h2 = seg(tt2, HOP[0], HOP[1]); return [lerp(perch[0], NEST[0], ease(h2)), lerp(perch[1], NEST[1], ease(h2)) - Math.sin(h2 * Math.PI) * 230]; } : null });
      // her hand
      const pa = pencilAt(t);
      drawingHand(pa.p[0], pa.p[1], pa.lift);
    } });
    if (glowK > .01) {
      light(MX, MY - 280, 520, '#FFE3A0', .5 * glowK);
      for (let i = 0; i < 9; i++) { const a = i / 9 * TAU + .3, rr = 250 + hash(i) * 90; sparkle(MX + Math.cos(a) * rr * .8, MY - 290 + Math.sin(a) * rr, 16 + hash(i + 3) * 10, '#FFF3C0', clamp(1 - glowK + .15)); }
    }
    light(1150, 520, 640, PAL.lamp, .16);
    camEnd();
    vignette(.55, PAL.night);
  }
  // 团子 asleep on the cushion, with z's that float up on the beat (cat()'s own zzz is drawn off-canvas: see report)
  function sleepyCat(t, o = {}) {
    const x = 430, y = 932, s = 24;
    cat(x, y, s, { pose: 'sleep', eyes: o.eyes || 'closed', zzz: false, dy: o.dy || 0, sq: .05 * Math.sin(t * 2.4) });
    if (o.zzz === false) return;
    for (let i = 0; i < 3; i++) {
      const ph = frac(bpOf(t) / 2 + i / 3), zx = x - 30 + ph * 40 + Math.sin(ph * 6 + i) * 8, zy = y - 70 - ph * 90;
      letter('z', zx, zy, 18 + ph * 16, PAL.cream, { font: 'cute', ink: false, alpha: Math.sin(ph * Math.PI) * .85, rot: -.2 });
    }
  }

  // =====================================================================================
  // THE ROOM AT NIGHT: closeBook and qmarkShot share her blocking (front view of room()).
  const SEAT = [1170, 985], HS = 34, SEAT_Y = SEAT[1] - 1.7 * HS;         // her chair; seated ground point
  const BOOK = [1040, 704, 250], SWITCH = [1078, 812];                    // the sketchbook; the lamp's cord switch, dangling off the desk
  const SNAP = B(66), SWIV = [B(66) + .22, B(66) + .5], CLICK = B(69), HOPOFF = [B(69) + .36, B(69) + .6], WALK_V = 190;
  const walkPos = t => { const a = Math.max(0, t - HOPOFF[1]); return [SEAT[0] - 12 - WALK_V * a, 1000 + a * 12, HS * (1 + a * .02)]; };
  // the sketchbook lying on the desk, seen from the room: th 0 = open flat .. π = closed (right half folded over)
  function deskBook(th, o = {}) {
    const [cx, y, w] = BOOK, h = 22, hw = w / 2, BL = '#6F86B8', BL_LT = '#8DA3D1', PG = '#FFFBF2';
    const L = [[cx - hw, y], [cx, y], [cx, y - h], [cx - hw + 26, y - h]], R = [[cx, y], [cx + hw, y], [cx + hw - 26, y - h], [cx, y - h]];
    const dn = (P, d) => P.map(([px, py]) => [px, py + d]);
    paint(dn(L, 5), { wash: BL, ink: PAL.ink, sw: .9 });
    if (th < 1.2) paint(dn(R, 5), { wash: BL, ink: PAL.ink, sw: .9 });
    paint(L, { wash: PG, ink: PAL.ink, sw: .9 });
    inkLine([[cx - hw * .7, y - 9], [cx - hw * .3, y - 12]], .5, PAL.steel, 'pencil', 0);
    if (o.glow) light(cx - hw * .45, y - 20, 90 + 40 * o.glow, '#FFE3A0', .5 * o.glow);
    if (o.pageGlow && th < Math.PI / 2) { const c0 = Math.cos(th); light(cx + hw * .5 * c0, y - 16 - hw * .5 * Math.sin(th), 70, '#FFE3A0', .45 * o.pageGlow); dot(cx + hw * .5 * c0, y - 12 - hw * .45 * Math.sin(th), 3, '#FFF1C2', .8 * o.pageGlow); }
    if (th >= Math.PI - .005) {                                            // closed: page edge + the top cover with its star
      paint(dn(L, 1), { wash: PG, ink: PAL.ink, sw: .5 });
      paint(dn(L, -3), { wash: BL_LT, fill: BL, fillOp: 80, tex: .5, ink: PAL.ink, sw: .9 });
      paint(starPts(cx - hw * .48, y - h / 2 - 3, 8, .45, 5), { wash: '#F6C85F', ink: PAL.ink, sw: .45 });
      return;
    }
    const c = Math.cos(th), sn = Math.sin(th);
    const Q = [[cx, y - 1], [cx + hw * c, y - 1 - hw * sn], [cx + (hw - 26) * c, y - h - 1 - hw * .92 * sn], [cx, y - h - 1]];
    if (o.leak && th > Math.PI / 2) {                                      // light spilling out of the gap: rays and drifting motes
      const lc = o.leakCol || '#FFE3A0';
      paint([[cx, y - 2], [cx + hw * c, y - 1 - hw * sn], [cx + (hw - 26) * c, y - h - 1 - hw * .92 * sn], [cx - hw + 26, y - h], [cx - hw, y]], { fill: lc, fillOp: 130 * o.leak, bleed: .2, tex: .1, border: 0, ink: null });
      light(cx - hw * .5, y - 30, 190, lc, .55 * o.leak);
      light(cx - hw * .6, y - 50, 110, '#D9C8FF', .35 * o.leak);
      for (let i = 0; i < 7; i++) { const a = -Math.PI * (.55 + .5 * (i / 6)) + .06 * Math.sin(T * 3 + i), L = (80 + 60 * hash(i)) * o.leak; inkLine([[cx - hw * .45, y - 8], [cx - hw * .45 + Math.cos(a) * L, y - 8 + Math.sin(a) * L]], 1.2, i % 2 ? lc : '#E3D6FF', 'fine', 0, .5 * o.leak); }
      for (let i = 0; i < 6; i++) { const ph = frac(T * .8 + hash(i + 7)), mx = cx - hw * .6 + (hash(i) - .5) * 90 + Math.sin(ph * 6 + i) * 8; dot(mx, y - 14 - ph * 110, 2.2, i % 2 ? '#FFF1C2' : '#E9DDFF', Math.sin(ph * Math.PI) * o.leak); }
    }
    const up = th < Math.PI / 2;
    paint(Q, { wash: up ? PG : BL_LT, fill: up ? '#EFE6D6' : BL, fillOp: up ? 40 : 80, tex: .4, ink: PAL.ink, sw: .9 });
    if (!up) paint(starPts(lerp(cx, cx + hw * c, .5), lerp(y - h / 2, y - hw * sn * .96 - h / 2, .5), 8, .45, 5), { wash: '#F6C85F', ink: PAL.ink, sw: .45 });
    if (th < .01) { inkLine([[cx, y], [cx, y - h]], .7, PAL.ink, 'fine', 0); inkLine([[cx + hw * .15, y - 10], [cx + hw * .5, y - 8]], .5, PAL.steel, 'pencil', 0); }
  }
  // the lamp's cord along the desk with a little round switch (pressed 0..1)
  function lampCord(press = 0, on = 1, sway = 0) {
    const [sx, sy] = [SWITCH[0] + sway * 6, SWITCH[1]];
    inkLine([[930, 706], [990, 722], [1030, 740], [1050, 752], [sx - 4, sy - 16]], 1.4, '#E7D8C2', 'marker', .5);
    inkLine([[sx, sy + 16], [sx - 10 - sway * 4, sy + 60], [sx - 38, sy + 120], [sx - 76, 988]], 1.4, '#E7D8C2', 'marker', .5);
    push(); translate(sx, sy); rotate(-.15 + sway * .2);
    paint(rrPts(-10, -18, 20, 36 - press * 3, 9), { wash: '#FFF1DC', fill: '#E7D8C2', fillOp: 60, ink: PAL.ink, sw: .8 });
    paint(rrPts(-5, -9 + press * 3, 10, 12, 4), { wash: on > .5 ? '#F29BB8' : '#B8A9C8', ink: PAL.ink, sw: .5 });
    pop();
    if (press > .5) sparkle(sx - 18, sy - 18, 12, '#FFF3C0', .5);
  }
  // the ahoge, drawn in head-local space so it can morph between shapes (droop → question with an overshoot)
  const AH = {
    droop: [[.2, -2.85], [.9, -3.2], [1.6, -2.9], [1.9, -2.35]], normal: [[.15, -2.9], [.5, -3.8], [1.25, -4.1], [1.3, -3.6]],
    question: [[.1, -2.9], [.1, -3.6], [.8, -3.9], [.9, -4.6], [.3, -4.95], [-.25, -4.6]], perk: [[.1, -2.9], [.25, -3.9], [.05, -4.7], [.45, -5.1]]
  };
  const resamp = (p, n) => { const q = []; for (let i = 0; i < n; i++) q.push(tipOf(partial(p, i / (n - 1)))); return q; };
  function ahogeMorph(a, b, k) {
    return (s, sw) => {
      const A = resamp(AH[a], 8), Bq = resamp(AH[b], 8), w = Math.sin(T * 4.2) * .06;
      push(); translate(0, -2.9 * s); rotate(w); translate(0, 2.9 * s);
      inkLine(A.map((p, i) => [lerp(p[0], Bq[i][0], k) * s, lerp(p[1], Bq[i][1], k) * s]), sw * 1.25, HERO_STYLE.hair, 'ink', .6);
      pop();
    };
  }
  // both hands raised above her head in a big stretch (body-local; the draw hook paints before the head, so the
  // forearms disappear behind it and only the wrists and hands peek over the top). k 0..1, wig = finger wiggle
  function stretchHands(k, wig = 0) {
    return (s, sw) => {
      if (k <= .01) return;
      for (const sd of [-1, 1]) {
        const hx = sd * lerp(1.6, 1.25, k) * s, hy = lerp(-8.4, -11.0, k) * s, a = sd * (.15 + wig * .12 * Math.sin(T * 14 + sd));
        paint(rrPts(-.33 * s, 0, .66 * s, 7 * s, .3 * s).map(([px, py]) => [hx + px * Math.cos(a) - py * Math.sin(a), hy + px * Math.sin(a) + py * Math.cos(a)]), { wash: HOOD, fill: HOOD_DK, fillOp: 50, tex: .3, ink: PAL.ink, sw: sw * .75 });
        paint(ellPts(hx, hy - .1 * s, .42 * s, .4 * s, 12), { wash: SKIN, ink: PAL.ink, sw: sw * .6 });
        for (const f of [-1, 0, 1]) inkLine([[hx + f * .2 * s, hy - .38 * s], [hx + f * .3 * s + sd * .05 * s, hy - .72 * s]], sw * .9, SKIN, 'marker', 0);
        for (const f of [-1, 0, 1]) inkLine([[hx + f * .2 * s, hy - .38 * s], [hx + f * .3 * s + sd * .05 * s, hy - .72 * s]], sw * .35, PAL.ink, 'fine', 0);
      }
    };
  }
  // a tiny sleepy tear glinting at the corner of her eye (head hook)
  const yawnTear = k => (s, sw) => { if (k > .02) { paint([[1.55 * s, .15 * s], [1.72 * s, .45 * s], [1.55 * s, .6 * s], [1.4 * s, .45 * s]], { wash: '#CFEAF8', washOp: 230 * k, ink: PAL.ink, sw: sw * .35, curv: .6 }); dot(1.52 * s, .38 * s, .06 * s, '#FFFFFF', k); } };
  // her pencil (in the right hand, arm space)
  const heldPencil = (s, sw) => { push(); rotate(-.9); pencil(.2 * s, -.3 * s, s / 95, Math.PI * .85, '#F6C85F'); pop(); };
  // the chair + her, facing the desk (back) or the room (front); sx squeezes for the swivel
  function seated(x, y, o) {
    const back = !!o.back, cs = { seat: 3.2 };
    if (back) chair(x, SEAT[1], HS, { ...cs, back: false }); else chair(x, SEAT[1], HS, cs);
    hero(x, y, HS, { outfit: 'home', sit: true, noShadow: true, ...o });
    if (back) chair(x, SEAT[1], HS, { ...cs, backOnly: true });
  }
  function nightRoom(t, o) {
    roomWith(t, { lamp: o.lamp, book: 'none', screenOn: 0, clutter: .5, dark: o.dark }, streetView);
    monitorSheen(o.lamp);
    windowLightPool(.6 + .8 * (1 - o.lamp));
  }
  function nightGrade(k) { if (k > .01) { grade(k * .55, 'multiply', '#6F7FC6'); vignette(.3 + .3 * k, PAL.night); } }

  // =====================================================================================
  // 38.556 · The room: SNAP the book shut, swivel round, stretch and yawn, pat the lamp switch off, pad off to bed.
  function closeBook(t, lt, dur) {
    const off = t < CLICK ? 0 : t < CLICK + .05 ? .7 : t < CLICK + .09 ? .2 : t < CLICK + .13 ? .85 : 1;   // flicker, then dark
    const z = kf(t, [[38.5, 1.46], [39.9, 1.42], [40.5, 1.36], [41.7, 1.38], [43.4, 1.12]], easeInOut);
    const cx = kf(t, [[38.5, 1010], [39.9, 1015], [40.5, 1040], [41.7, 1030], [43.4, 880]], easeInOut), cy = kf(t, [[38.5, 712], [39.9, 712], [40.5, 700], [41.7, 700], [43.4, 650]], easeInOut);
    camBegin(cx, cy, z, 0);
    nightRoom(t, { lamp: 1 - off, dark: .06 + .44 * off });
    // 团子 asleep on the cushion; the SNAP makes an ear twitch
    const tw = seg(t, SNAP, SNAP + .1) * (1 - seg(t, SNAP + .25, SNAP + .6));
    sleepyCat(t, { dy: -.12 * tw, zzz: tw < .2, eyes: tw > .5 ? 'open' : 'closed' });
    // the book: open → the right half flips over → SNAP
    const th = t < SNAP ? Math.PI * easeIn(seg(t, SNAP - .42, SNAP)) : Math.PI;
    lampCord(t > CLICK - .05 && t < CLICK + .12 ? 1 : 0, 1 - off, Math.exp(-Math.max(0, t - CLICK) * 4) * Math.sin(Math.max(0, t - CLICK) * 18) * (t > CLICK ? 1 : 0));
    deskBook(th, { glow: t > SNAP ? 1.1 * Math.exp(-(t - SNAP) * 5) : 0, pageGlow: .6 + .25 * Math.sin(t * 3) });
    if (t > SNAP && t < SNAP + .9) {                                      // puff of eraser crumbs + dust
      const a = t - SNAP;
      for (let i = 0; i < 7; i++) {
        const an = -Math.PI * (.12 + .76 * hash(i + 11)), v = 60 + hash(i + 12) * 70, px = 975 + Math.cos(an) * v * easeOut(a / .6), py = 690 + Math.sin(an) * v * easeOut(a / .6) - a * 30;
        paint(cloudPts(px, py, 30 + a * 40, 12 + a * 12, i, 5), { wash: PAL.cream, washOp: 190 * (1 - seg(a, .3, .9)), ink: null, curv: .4 });
      }
      for (let i = 0; i < 9; i++) { const an = -Math.PI * (.1 + .8 * hash(i + 30)), v = 120 + hash(i + 31) * 120; dot(975 + Math.cos(an) * v * a, 690 + Math.sin(an) * v * a + 380 * a * a, 2.5, '#D9A3B4', 1 - seg(a, .4, .7)); }
    }
    // her
    const md = mood(t, [[38.5, 'look'], [SNAP - .1, 'closed'], [SNAP + .12, 'sleepy'], [B(67) + .2, 'closed', null, 'yawn'], [B(68) + .42, 'sleepy', null, 'smile'], [CLICK + .2, 'happy', null, 'smile'], [HOPOFF[0], 'sleepy', null, 'tiny']]);
    if (t < SWIV[0] + (SWIV[1] - SWIV[0]) / 2) {
      // back view at the desk: drawing, then the flip
      const sw = seg(t, SWIV[0], SWIV[1]), sxk = Math.cos(sw * Math.PI);
      const flip = seg(t, SNAP - .5, SNAP);
      const aL = t < SNAP - .5 ? -.05 + .1 * Math.sin(t * 19) : kf(t, [[SNAP - .5, .1], [SNAP - .25, .75], [SNAP, .35], [SNAP + .18, -1.1]]);
      seated(SEAT[0], SEAT_Y, { back: true, sx: Math.max(.08, sxk), aL, aR: -.9, sq: t > SNAP && t < SNAP + .2 ? .05 : Math.sin(t * 2.2) * .015, tilt: -.06 + .08 * flip,
        ahoge: 'droop', handL: t < SNAP - .5 ? heldPencil : null, draw: hoodBack });
    } else {
      const sw = seg(t, SWIV[0], SWIV[1]), sxk = -Math.cos(sw * Math.PI);
      const hopA = seg(t, HOPOFF[0], HOPOFF[1]);
      const stK = kf(t, [[B(67) + .08, 0], [B(67) + .4, 1], [B(68) + .22, .92], [B(68) + .45, 0]], easeInOut);
      const reach = kf(t, [[CLICK - .26, -1.15], [CLICK - .06, -.5], [CLICK + .02, -.42], [CLICK + .25, -.5], [CLICK + .45, -1.15]]);
      const aL = stK > .05 ? 1.5 : t > CLICK - .35 ? reach : kf(t, [[B(67) - .05, -1.15], [B(67) + .12, -1.35], [B(67) + .2, -1.1]]);
      const aR = stK > .05 ? 1.5 : kf(t, [[B(67) - .05, -1.15], [B(67) + .12, -1.35], [B(67) + .2, -1.1]]);
      const sq = kf(t, [[B(67) - .05, 0], [B(67) + .12, .08], [B(67) + .42, -.16], [B(68) + .2, -.13], [B(68) + .45, .03], [B(68) + .6, 0]]) + (md.take || 0);
      const dy = -kf(t, [[B(67) + .12, 0], [B(67) + .42, .3], [B(68) + .2, .25], [B(68) + .45, 0]]);
      const tilt = kf(t, [[B(67) + .1, 0], [B(67) + .5, -.14], [B(68) + .25, .1], [B(68) + .55, 0]]);
      const tear = seg(t, B(67) + .5, B(67) + .8) * (1 - seg(t, B(68) + .5, B(68) + .8));
      if (t < HOPOFF[0]) {
        seated(SEAT[0], SEAT_Y, { ...md, take: 0, sx: Math.max(.08, sxk), aL, aR, sq, dy, tilt, blush: .5, ahoge: t > B(67) + .38 && t < B(68) + .4 ? 'normal' : 'droop',
          draw: stretchHands(stK, stK), head: yawnTear(tear) });
      } else {
        // hop down and pad off to bed, sleepy
        chair(SEAT[0], SEAT[1], HS, { seat: 3.2 });
        const [wx, wy, ws] = walkPos(t), m = move('walk', t * 2);
        const hx = lerp(SEAT[0], wx, easeOut(hopA)), hy = lerp(SEAT_Y, wy, easeIn(hopA)) - Math.sin(hopA * Math.PI) * 40;
        const walking = t > HOPOFF[1];
        hero(hx, hy, lerp(HS, ws, hopA), { ...md, take: 0, outfit: 'home', sit: hopA < .5, lookX: -.8, walk: walking ? m.walk : null, dy: walking ? m.dy * .6 : 0,
          aL: walking ? m.aL * .6 - .4 : -.6, aR: walking ? m.aR * .6 - .4 : -.6, rot: walking ? -.03 + .03 * Math.sin(t * 10) : -.08 * Math.sin(hopA * Math.PI), sq: hopA > .8 && hopA < 1 ? .1 : 0, ahoge: 'droop', blush: .4 });
      }
    }
    camEnd();
    nightGrade(off);
  }

  // =====================================================================================
  // 43.356 · The cover lifts by itself; a question mark pops out, stretches, hops after her and tugs her hood.
  // She stretches like rubber, zips back into the chair, sighs… smiles. Lamp on, book open, push into the page.
  const POP = B(73), HOPQ = [B(74) - .04, B(75)], TUG = [B(75), B(75) + .3], ZIP = [B(75) + .3, B(76)];
  const SIGH = B(76) + .06, SMILE = B(76) + .4, SWIV2 = [B(77), B(77) + .24], LAMP_ON = B(77) + .4, OPEN = [B(77) + .52, B(78) + .12];
  const DISS = [B(78) + .3, B(79) - .04];                 // dissolve into the top-down page (before chapter 3's page turn)
  const QS = 14, QCOL = '#9A84DA';                       // the question mark's size and colour (lighter to read in the dark)
  // in this shot she has padded on towards bed (over by 团子's cushion), slow and sleepy
  const qWalk = t => { const a = Math.max(0, t - 43.2); return [560 - 33 * a, 1012 + a * 8, 35 + a * .3]; };
  const PLANT = qWalk(TUG[0]);                           // where she is when the question mark catches her
  // a body-local point of a hero drawn with (rot, sq, sx) → world (mirrors the chibi transform)
  const bodyPt = (x, y, s, px, py, o = {}) => {
    const r = o.rot || 0, sq = o.sq || 0, SX = (o.sx ?? 1) * (1 + sq * .5), SY = 1 - sq, lx = px * s * SX, ly = py * s * SY;
    return [x + lx * Math.cos(r) - ly * Math.sin(r), y + (o.dy || 0) * s + lx * Math.sin(r) + ly * Math.cos(r)];
  };
  const hoodAt = (x, y, s, o = {}) => bodyPt(x, y, s, 1.0, -4.4, o);
  const TUGPOSE = k => ({ rot: .42 * k, sq: -.42 * k, sx: 1 - .14 * k });
  // the question mark's left hand (world) for a given ground point / pose, and the inverse
  const qHandOff = (s, rot, sq) => { const lx = -1.9 * s * (1 + sq * .4), ly = -5.0 * s * (1 - sq); return [lx * Math.cos(rot) - ly * Math.sin(rot), lx * Math.sin(rot) + ly * Math.cos(rot)]; };
  const qFromHand = (hx, hy, s, rot, sq) => { const [ox, oy] = qHandOff(s, rot, sq); return [hx - ox, hy - oy]; };
  // the hood, stretched like taffy from her neck to the question mark's hand
  function taffyHood(nx, ny, hx, hy, s, k) {
    if (k <= .02) return;
    const dx = hx - nx, dy = hy - ny, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, px = -uy, py = ux, w0 = .75 * s, w1 = .42 * s;
    const mid = [nx + dx * .5 + px * 6, ny + dy * .5 + py * 6];
    paint([[nx + px * w0, ny + py * w0], [mid[0] + px * w1 * .8, mid[1] + py * w1 * .8], [hx + px * w1, hy + py * w1], [hx + ux * .3 * s, hy + uy * .3 * s], [hx - px * w1, hy - py * w1], [mid[0] - px * w1 * .8, mid[1] - py * w1 * .8], [nx - px * w0, ny - py * w0]], { wash: HOOD, fill: HOOD_DK, fillOp: 50, tex: .3, ink: PAL.ink, sw: .9, curv: .35 });
    inkLine([[nx + dx * .2, ny + dy * .2], [nx + dx * .75, ny + dy * .75]], .7, HOOD_DK, 'fine', .3);
    for (let i = 0; i < 3; i++) { const f = .3 + i * .2; inkLine([[nx + dx * f + px * (w0 + 10), ny + dy * f + py * (w0 + 10)], [nx + dx * f + px * (w0 + 22), ny + dy * f + py * (w0 + 22)]], .8, PAL.cream, 'fine', 0, .7 * k); }
  }
  // her position/pose in the question-mark shot
  function qHero(t) {
    if (t < TUG[0]) { const [x, y, s] = qWalk(t); return { x, y, s, phase: 'walk' }; }
    if (t < ZIP[0]) { const k = easeOut(seg(t, TUG[0], TUG[0] + .22)); return { x: PLANT[0], y: PLANT[1], s: PLANT[2], phase: 'tug', k }; }
    if (t < ZIP[1]) {
      const k = seg(t, ZIP[0], ZIP[1]), e = easeInOut(k);
      return { x: lerp(PLANT[0], SEAT[0], e), y: lerp(PLANT[1], SEAT_Y, e) - Math.sin(k * Math.PI) * 120, s: lerp(PLANT[2], HS, k), phase: 'zip', k };
    }
    return { x: SEAT[0], y: SEAT_Y, s: HS, phase: 'seat' };
  }
  function sighPuff(x, y, s, a) {                        // a small sigh cloud drifting away from her mouth
    if (a <= 0 || a >= 1) return;
    const px = x - a * 150, py = y - a * 70 - Math.sin(a * 5) * 6;
    paint(cloudPts(px, py, (40 + a * 40) * s / 34, (16 + a * 10) * s / 34, 3, 5), { wash: PAL.cream, washOp: 220 * (1 - a), fill: PAL.grayLt, fillOp: 60 * (1 - a), ink: PAL.ink, sw: .6 * (1 - a), curv: .4 });
  }
  function qmarkShot(t, lt, dur) {
    if (t > DISS[0]) {                                   // the push ends in the top-down page
      const k = seg(t, DISS[0], DISS[1]);
      if (k >= 1) return pagePush(t);
      return dissolve(k, () => qmarkRoom(t), () => pagePush(t));
    }
    qmarkRoom(t);
  }
  function qmarkRoom(t) {
    const on = t < LAMP_ON ? 0 : t < LAMP_ON + .05 ? .6 : t < LAMP_ON + .09 ? .25 : t < LAMP_ON + .14 ? .9 : 1;
    const dark = 1 - on;
    // camera: close on the book, pull back to find her, follow her back to the chair, then push in over her shoulder
    const push = easeIn(seg(t, B(78) - .12, DISS[1] + .02));
    const z = kf(t, [[43.3, 2.5], [44.25, 2.4], [44.95, 1.16], [45.35, 1.16], [45.95, 1.42], [46.9, 1.46]], easeInOut) * (1 + 4.2 * push);
    const cx = lerp(kf(t, [[43.3, 1040], [44.25, 1025], [44.95, 820], [45.35, 820], [45.95, 1090], [46.9, 1080]], easeInOut), 960, easeOut(push * 1.5));
    const cy = lerp(kf(t, [[43.3, 660], [44.25, 660], [44.95, 680], [45.35, 680], [45.95, 700], [46.9, 700]], easeInOut), 694, easeOut(push * 1.5));
    const [bx, by] = t > ZIP[1] ? shakeXY(t, 9 * Math.exp(-(t - ZIP[1]) * 9)) : [0, 0];
    camBegin(cx + bx, cy + by, z, 0);
    nightRoom(t, { lamp: on, dark: .06 + .44 * dark });
    const H = qHero(t);
    // 团子 on the cushion opens one eye at the commotion
    const peek = seg(t, TUG[0], TUG[0] + .15) * (1 - seg(t, ZIP[1] + .3, ZIP[1] + .6));
    sleepyCat(t, { eyes: peek > .5 ? 'open' : 'closed', dy: -.1 * peek, zzz: peek < .1 });
    // the book: the cover lifts by itself, flaps open as the question mark pops out, falls shut; later she opens it
    let th = Math.PI, leak = 0;
    if (t < POP) { const k = seg(t, 43.4, POP); th = Math.PI - .55 * easeOut(k) - .12 * Math.sin(t * 40) * k; leak = k; }
    else if (t < POP + .45) { const a = t - POP; th = Math.PI - 1.3 * Math.sin(Math.min(1, a / .45) * Math.PI) * Math.exp(-a * 2); leak = 1 - a / .45; }
    else if (t > OPEN[0]) th = Math.PI * (1 - easeInOut(seg(t, OPEN[0], OPEN[1])));
    lampCord(t > LAMP_ON - .05 && t < LAMP_ON + .12 ? 1 : 0, on);
    deskBook(th, { leak: Math.min(1, leak * 1.4), leakCol: '#FFE0B0', glow: t > OPEN[0] ? .9 * seg(t, OPEN[0] + .1, OPEN[1]) : 0 });
    if (t > OPEN[1] - .05) for (let i = 0; i < 6; i++) sparkle(1040 + (hash(i) - .5) * 220, 690 - hash(i + 4) * 90 - (t - OPEN[1]) * 60, 9 + hash(i + 2) * 8, '#FFF3C0', seg(t, OPEN[1] - .05 + i * .05, OPEN[1] + .5 + i * .05));
    // the question mark
    const qm = qmarkAt(t, H);
    // her
    const walkM = move('walk', t * 2);
    if (H.phase === 'walk') {
      hero(H.x, H.y, H.s, { outfit: 'home', eyes: 'sleepy', mouth: 'tiny', lookX: -.8, walk: walkM.walk, dy: walkM.dy * .6, aL: walkM.aL * .6 - .4, aR: walkM.aR * .6 - .4, rot: -.03 + .03 * Math.sin(t * 10), ahoge: 'droop', blush: .4 });
    } else if (H.phase === 'tug') {
      const k = H.k, P = TUGPOSE(k), [nx, ny] = bodyPt(H.x, H.y, H.s, .45, -4.45, P), [hx, hy] = qHandPos(qm);
      taffyHood(nx, ny, hx, hy, H.s, k);
      hero(H.x, H.y, H.s, { outfit: 'home', eyes: 'wide', mouth: 'O', lookX: .9, ...P, aL: -.2 + .9 * k, aR: -.6 + .5 * k, ahoge: 'droop', blush: .3, emote: '!', emoteK: seg(t, TUG[0], TUG[0] + .2), brows: 'worried' });
      for (let i = 0; i < 3; i++) inkLine([[H.x - 2.0 * H.s - i * 12, H.y - (1 + i * 1.5) * H.s], [H.x - 3.2 * H.s - i * 16, H.y - (1.15 + i * 1.5) * H.s]], .9, PAL.cream, 'fine', 0, .75 * k);
    } else if (H.phase === 'zip') {
      const k = H.k, rot = k < .5 ? lerp(.72, 1.3, easeOut(k * 2)) : lerp(1.3, 0, easeIn((k - .5) * 2));
      for (let i = 0; i < 7; i++) { const yy = H.y - (1.5 + i * 1.2) * H.s + 30; inkLine([[H.x - 80 - 300 * (1 - k) - i * 14, yy], [H.x - 40 - i * 8, yy]], 1.3, PAL.cream, 'fine', 0, .8); }
      const P = { rot, sq: lerp(-.42, 0, k), sx: 1.1 }, [nx, ny] = bodyPt(H.x, H.y, H.s, .45, -4.45, P), [hx, hy] = qHandPos(qm);
      taffyHood(nx, ny, hx, hy, H.s, 1 - k);
      hero(H.x, H.y, H.s, { outfit: 'home', eyes: k < .6 ? 'x' : 'wide', mouth: 'O', ...P, aL: 1.0, aR: .6, ahoge: 'droop', noShadow: true, blush: .3 });
    } else {
      const a = t - ZIP[1], land = .28 * Math.exp(-a * 7) * Math.cos(a * 20);
      const sw = seg(t, SWIV2[0], SWIV2[1]), backNow = sw > .5, sxk = Math.max(.08, Math.abs(Math.cos(sw * Math.PI)));
      const md = mood(t, [[ZIP[1], 'x', null, 'O'], [SIGH, 'closed', null, 'wobble'], [SMILE, 'happy', 'heart', 'smile']]);
      const aq = backOut(seg(t, SMILE + .02, SMILE + .32));
      if (!backNow) {
        seated(H.x, H.y, { ...md, take: 0, sx: sxk, sq: land + (md.take || 0) + (t > SIGH && t < SMILE ? .06 * seg(t, SIGH, SIGH + .15) : 0), aL: -1.0, aR: -1.0, dy: t > SIGH && t < SMILE ? .06 : 0,
          blush: t > SMILE ? .9 : .4, tilt: t > SMILE ? .08 * Math.sin((t - SMILE) * 5) : 0, ahoge: 'none', head: ahogeMorph('droop', 'question', aq), lookY: t > SMILE ? -.3 : 0 });
        sighPuff(H.x - 1.9 * H.s, H.y - 5.3 * H.s, H.s, seg(t, SIGH + .05, SIGH + .6));
      } else {
        const reachL = kf(t, [[SWIV2[1], -1.1], [LAMP_ON - .12, -.5], [LAMP_ON, -.42], [LAMP_ON + .18, -.6], [OPEN[0], .45], [OPEN[0] + .12, .75], [OPEN[1], .2], [OPEN[1] + .3, -.1]]);
        seated(H.x, H.y, { back: true, sx: sxk, aL: reachL, aR: -1.0, ahoge: 'question', sq: Math.sin(t * 2.2) * .015, tilt: -.05, draw: hoodBack });
      }
    }
    drawQmark(t, qm);
    camEnd();
    nightGrade(dark);
  }
  // where the question mark is and how it poses
  function qmarkAt(t, H) {
    const base = [975, 684];
    if (t < POP) return { x: base[0], y: base[1] + 30, hide: true };
    if (t < POP + .3) { const k = seg(t, POP, POP + .3); return { x: base[0] - 10 * k, y: lerp(base[1] + 30, base[1], backOut(k)) - Math.sin(k * Math.PI) * 60, sq: lerp(-.35, .25, k), rot: -.2 * (1 - k), pop: k }; }
    if (t < HOPQ[0]) {
      const a = t - POP - .3, st = seg(t, 44.1, 44.3) * (1 - seg(t, 44.38, 44.48));
      return { x: base[0] - 10, y: base[1], sq: .25 * Math.exp(-a * 9) * Math.cos(a * 25) - .2 * st, wave: st > .3, rot: t > 44.42 ? -.22 : .06 * Math.sin(t * 9), eyes: st > .3 ? 'happy' : 'normal', stretch: st };
    }
    if (t < HOPQ[1]) {
      const k = seg(t, HOPQ[0], HOPQ[1]), e = easeInOut(k), [hx, hy] = hoodAt(H.x, H.y, H.s);
      return { x: lerp(base[0] - 10, hx + 1.0 * QS, e), y: lerp(base[1], hy + 4.8 * QS, e) - Math.sin(k * Math.PI) * 260, sq: k < .15 ? .2 : -.2, rot: -k * TAU * .75 - .3, arcK: k };
    }
    if (t < ZIP[1]) {
      const zk = seg(t, ZIP[0], ZIP[1]), k = easeOut(seg(t, TUG[0], TUG[0] + .22));
      const P = zk > 0 ? { rot: zk < .5 ? lerp(.72, 1.3, easeOut(zk * 2)) : lerp(1.3, 0, easeIn((zk - .5) * 2)), sq: lerp(-.42, 0, zk), sx: 1.1 } : TUGPOSE(k);
      const [nx, ny] = bodyPt(H.x, H.y, H.s, .45, -4.45, P);
      const rot = zk > 0 ? P.rot * .9 : .6 * k, sq = zk > 0 ? -.3 : -.25 * k;
      const hx = zk > 0 ? nx + Math.sin(P.rot) * 290 : nx + 40 + 150 * k, hy = zk > 0 ? ny - Math.cos(P.rot) * 290 : ny - 20 - 20 * k;
      const [qx, qy] = qFromHand(hx, hy, QS, rot, sq);
      return { x: qx, y: qy, rot, sq, grab: true, eyes: 'happy', ...(zk > .9 ? { fade: 1 } : {}) };
    }
    // on her: first peeking over her shoulder, then it hops up and sits on her head, beside the ahoge
    const hx = SEAT[0], k = easeInOut(seg(t, SIGH + .02, SIGH + .32));
    const x = lerp(hx + .3 * HS, hx - 1.12 * HS, k), y = lerp(SEAT_Y - 11.6 * HS, SEAT_Y - 9.42 * HS, k) - Math.sin(k * Math.PI) * 50;
    const a = t - SIGH - .32, sit = k >= 1 ? .22 * Math.exp(-a * 8) * Math.cos(a * 22) : 0;
    return { x, y: y + (k >= 1 ? 2 * Math.sin(t * 4) : 3 * Math.sin(t * 9)), s: lerp(QS, QS * .74, k), sq: sit, rot: k >= 1 ? .08 * Math.sin(t * 3) - .2 : lerp(.1, -.2, k), eyes: t > SMILE ? 'happy' : 'normal', wave: t > SMILE + .3 && t < SWIV2[0] };
  }
  const qHandPos = q => { const [ox, oy] = qHandOff(q.s || QS, q.rot || 0, q.sq || 0); return [q.x + ox, q.y + oy]; };
  function drawQmark(t, q) {
    if (q.hide) return;
    const s = q.s || QS;
    glow(q.x, q.y - 4 * s, 8 * s, '#C9B6F0', .55);
    light(q.x, q.y - 4 * s, 5 * s, '#E3D6FF', .3);
    qmark(q.x, q.y, s, { rot: q.rot || 0, sq: q.sq || 0, eyes: q.eyes || 'normal', wave: q.wave, col: QCOL });
    if (q.stretch > .3) for (const sd of [-1, 1]) inkLine([[q.x + sd * 1.8 * s + .2 * s, q.y - 5.3 * s], [q.x + sd * 2.3 * s, q.y - 6.6 * s]], 1.4, QCOL, 'marker', .3);
    if (q.pop != null && q.pop < 1) for (let i = 0; i < 8; i++) { const an = -Math.PI * (.1 + .8 * i / 7), r = 30 + 90 * easeOut(q.pop); sparkle(q.x + Math.cos(an) * r, q.y - 30 + Math.sin(an) * r * .8, 10, '#E9DDFF', q.pop); }
  }
  // the final push: the open spread seen from above, the idea star waking up in 桃桃's arms, her pencil coming back
  function pagePush(t) {
    const k = seg(t, DISS[0], 48.8);
    camBegin(lerp(1215, 1200, k), lerp(545, 530, k), lerp(1.5, 1.85, easeOut(k)), lerp(-.03, 0, k));
    deskTop(t, { lamp: 1, page: (r, side, tt) => side < 0 ? oldDrafts(r) : draftPage(r, tt, { full: true, glowK: .15 + .1 * Math.sin(t * 3) }), items: tt => {
      deskClutter(tt);
      const wake = seg(t, 47.75, 47.95);
      idea(NEST[0], NEST[1] + 4 - 6 * wake, 23, { eyes: wake > .5 ? 'normal' : 'happy', sq: wake > 0 && wake < 1 ? -.15 : 0, rot: -.1 + .05 * Math.sin(t * 2), glow: 1.2 });
      const hk = easeOut(seg(t, 47.55, 48.2));
      drawingHand(lerp(1560, 1330, hk), lerp(900, 640, hk), 1 - hk * .8);
    } });
    light(1200, 500, 520, PAL.lamp, .2);
    camEnd();
    vignette(.5, PAL.night);
  }

  chapter('desk', 28.956, 48.156, [[28.956, windowShot], [33.756, drafts], [38.556, closeBook], [43.356, qmarkShot]]);
  transition(28.956, 'dissolve', .8);
})();
