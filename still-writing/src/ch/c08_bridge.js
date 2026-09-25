// c08_bridge: 桥段 (192.156–225.756). Stripped back, intimate, dark blue and quiet: only small warm lights.
// blank page at night → doubts circling like moths → the microwave's warm light → cared for by the cat and 桃桃
// → a rest stop on a paper path toward dawn → asleep, tucked in, dreaming of small loves (a warm glow grows → white).
// From here to the end she wears the pajama. Lighting recipe for the night shots: paint the scene in its own colours,
// multiply the frame by a light map (a dark ambient colour plus additive pools where the lights are, see lightMap),
// then add glows/blooms for the light sources themselves on top.
(() => {
  const B = n => beatT(n);                                   // beat 320 = 192.156 (chapter start)
  const FULL = () => rectPts(-2400, -2400, W + 4800, H + 4800);
  const SKIN_C = '#FCE5D4';
  const PJ = '#BFD9EE', PJ_DK = '#94B7D6';
  const BLANKET = '#8FA8D8', BLANKET_DK = '#6F86B8', BLANKET_STAR = '#FFF1A8';
  // 桃桃 greyed out ("offline")
  const MOMO_GREY = { hair: '#A9A7B8', hairLt: '#C9C7D4', top: '#DAD8E2', topDk: '#B9B7C6', pants: '#DAD8E2', shoe: '#9C9AAC', eye: '#6A687A', iris: '#9A98A8', starGlow: 0 };

  // a crumpled paper ball (like props.paperBall, with a colour for the dark room and a squash)
  function ball(x, y, s, seed, col = '#D5DBE6', sq = 0, rot = 0) {
    push(); translate(x, y); rotate(rot); scale(1 + sq * .5, 1 - sq);
    const pts = []; for (let i = 0; i < 11; i++) { const a = i / 11 * TAU, r = 16 * s * (.8 + .35 * hash(seed * 11 + i)); pts.push([Math.cos(a) * r, -15 * s + Math.sin(a) * r]); }
    paint(pts, { wash: col, fill: mixCol(col, '#4A5070', .5), fillOp: 70, tex: .3, ink: PAL.ink, sw: .7 * clamp(s, .6, 1.6) });
    for (let k = 0; k < 3; k++) inkLine([[(hash(seed + k) - .5) * 20 * s, -15 * s + (hash(seed + k + 3) - .5) * 20 * s], [(hash(seed + k + 6) - .5) * 20 * s, -15 * s + (hash(seed + k + 9) - .5) * 20 * s]], .45, mixCol(col, PAL.ink, .45), 'fine', 0);
    pop();
  }
  // a little sigh puff that rises and fades (age in seconds)
  function sighPuff(x, y, age, s = 1) {
    if (age < 0 || age > 1.6) return;
    const k = seg(age, 0, .25) * (1 - seg(age, 1.0, 1.6)), yy = y - age * 60 * s, xx = x + Math.sin(age * 3) * 10 * s;
    fadeIn(k * .8, () => {
      paint(cloudPts(xx, yy, 70 * s * (1 + age * .3), 26 * s * (1 + age * .3), 3, 5), { wash: '#8C93AA', washOp: 170, ink: PAL.ink, sw: .7, curv: .5 });
    });
  }

  // a rounded capsule between two points (sleeves, limbs)
  function capsule(x0, y0, x1, y1, r0, r1 = r0, n = 7) {
    const a = Math.atan2(y1 - y0, x1 - x0), pts = [];
    for (let i = 0; i <= n; i++) { const u = a + Math.PI / 2 + i / n * Math.PI; pts.push([x0 + Math.cos(u) * r0, y0 + Math.sin(u) * r0]); }
    for (let i = 0; i <= n; i++) { const u = a - Math.PI / 2 + i / n * Math.PI; pts.push([x1 + Math.cos(u) * r1, y1 + Math.sin(u) * r1]); }
    return pts;
  }

  // paint fn (through camera cam = [cx, cy, zoom]) into a layer and lay it down softly: one uniform translucent shape
  // (shadows, light shafts) with a blurred edge.
  function softLayer(cam, fn, alpha, blur = 0, op = 'source-over') {
    const cv = layer(() => { camBegin(cam[0], cam[1], cam[2], cam[3] || 0); fn(); camEnd(); });
    X.save(); X.setTransform(1, 0, 0, 1, 0, 0); if (blur > 0) X.filter = `blur(${blur}px)`;
    X.globalAlpha = clamp(alpha * ALPHA); X.globalCompositeOperation = op; X.drawImage(cv, 0, 0); X.restore();
  }

  // Lighting: multiply the whole frame by a light map = a dark ambient colour plus additive pools of light
  // (lights = [[x, y, r, colour, strength], ...] in world coordinates through cam). Colours stay rich near a light.
  // The light map is smooth, so it is painted at quarter resolution (cheap) and stretched over the frame.
  const LM = { cv: null, q: 4 };
  function lightMap(cam, ambient, lights) {
    if (!LM.cv) LM.cv = ENV.canvas(W / LM.q, H / LM.q);
    const c = LM.cv.getContext('2d'), zoom = cam[2], rot = cam[3] || 0;
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    c.fillStyle = ambient; c.fillRect(0, 0, W / LM.q, H / LM.q);
    c.scale(1 / LM.q, 1 / LM.q); c.translate(W / 2, H / 2); c.rotate(rot); c.scale(zoom, zoom); c.translate(-cam[0], -cam[1]);
    c.globalCompositeOperation = 'lighter';
    for (const [x, y, r, col, a] of lights) {
      if (a <= .004 || r <= 1) continue;
      const g = c.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, hexA(col, a)); g.addColorStop(.3, hexA(col, a * .78)); g.addColorStop(.65, hexA(col, a * .32)); g.addColorStop(1, hexA(col, 0));
      c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r);
    }
    X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.globalCompositeOperation = 'multiply'; X.globalAlpha = 1; X.imageSmoothingEnabled = true; X.drawImage(LM.cv, 0, 0, W, H); X.restore();
  }

  // =====================================================================================================
  // 1 · BLANK (192.156–196.956): a very dark room lit only by a huge blank page. Seen from high behind her: she is
  //     small, head down on the desk among crumpled drafts; 桃桃 sleeps greyed out in the screen corner; rain.
  // =====================================================================================================
  const S1 = { x: 540, y: 26, w: 1160, h: 452 };                 // the screen (world)
  const HX1 = 800, HY1 = 676, HS1 = 40;                           // her head (back view, resting on the desk)
  // the pile of crumpled drafts: [x, y (bottom), s, landing beat (<0: already there)]
  const BALLS = [[1080, 700, 2.0, -1], [1160, 712, 1.8, -1], [1240, 698, 1.9, -1], [1010, 736, 1.7, 321], [1122, 668, 1.8, 322],
    [1204, 664, 1.75, 323], [1300, 730, 1.6, 324], [1160, 628, 1.7, 325], [1262, 640, 1.5, 326], [560, 742, 1.6, 327], [1350, 690, 1.5, -1], [620, 690, 1.4, -1]];

  // her, slumped over the desk, seen from high behind. (hx, hy) = head centre.
  function slumpBack(hx, hy, s, o = {}) {
    const sw = clamp(s / 19, .32, 2.3), br = o.breath || 0, lift = o.lift || 0, tilt = o.tilt || 0;
    const top = '#46557E', topD = '#34406A', hair = '#3A2A2E', hairL = '#5C4448';
    const by = hy + 2.7 * s - lift * .5 * s;
    // back (a rounded hump rising toward the head), pajama stars
    const back = [[-2.5, 3.8], [-2.45, 1.2], [-2.1, -.4], [-1.1, -1.25], [1.1, -1.25], [2.1, -.4], [2.45, 1.2], [2.5, 3.8]].map(([px, py]) => [hx + px * s * (1 + br * .5), by + py * s * (1 + br)]);
    paint(back, { wash: top, fill: topD, fillOp: 80, bleed: .05, tex: .4, border: .3, ink: PAL.ink, sw: sw * .9, curv: .45 });
    inkLine([[hx, by - 1.0 * s], [hx + .05 * s, by + 3.6 * s]], sw * .45, mixCol(top, PAL.ink, .35), 'fine', .3);
    for (let i = 0; i < 4; i++) paint(starPts(hx + (hash(i * 3.1) - .5) * 3.4 * s, by + (.2 + hash(i * 5.7) * 2.8) * s, .2 * s, .45, 5), { wash: '#C9C79A', ink: null });
    // arms: upper arms out to the elbows on the desk, forearms folded in under the head
    for (const sd of [-1, 1]) {
      const sx = hx + sd * 1.7 * s, sy = by - .5 * s, ex = hx + sd * (3.2 - lift * .3) * s, ey = hy + (.35 - lift * .2) * s;
      paint(capsule(sx, sy, ex, ey, .72 * s, .62 * s), { wash: top, fill: topD, fillOp: 60, tex: .3, border: .2, ink: PAL.ink, sw: sw * .8 });
      paint(capsule(ex, ey, hx + sd * 1.2 * s, hy + (.55 - lift * .3) * s, .62 * s, .58 * s), { wash: top, fill: topD, fillOp: 60, tex: .3, border: .2, ink: PAL.ink, sw: sw * .8 });
      paint(ellPts(hx + sd * 1.25 * s, hy + (1.0 - lift * .3) * s, .4 * s, .32 * s, 12), { wash: '#8A7C86', ink: PAL.ink, sw: sw * .55 });
    }
    // head: the back of the bob, lying tilted on the arms; strands from the crown; the star clip peeks out
    push(); translate(hx, hy - lift * .9 * s); rotate(tilt);
    paint(ellPts(0, 0, 2.95 * s, 2.6 * s, 30, s * .02), { wash: hair, fill: hairL, fillOp: 70, bleed: .05, tex: .4, border: .2, ink: PAL.ink, sw: sw * .9 });
    for (const [a, k] of [[-.9, .8], [-.35, 1], [.15, 1], [.65, .85], [1.15, .6]]) {
      inkLine([[.2 * s, -1.3 * s], [.2 * s + Math.sin(a) * 1.3 * s * k, -1.3 * s + Math.cos(a) * 1.1 * s * k], [.2 * s + Math.sin(a) * 2.5 * s * k, -1.3 * s + Math.cos(a) * 2.9 * s * k]], sw * .45, hairL, 'fine', .5, .8);
    }
    for (const sd of [-1, 1]) inkLine([[sd * 2.2 * s, 1.5 * s], [sd * 2.75 * s, 2.0 * s], [sd * 2.3 * s, 2.3 * s]], sw * .7, hair, 'ink', .5);
    push(); translate(-2.5 * s, -.9 * s); rotate(-.5); paint(starPts(0, 0, .42 * s, .48, 5), { wash: '#B7A36A', ink: PAL.ink, sw: sw * .45 }); pop();
    // ahoge flopped over (droop), wobbling
    const w = Math.sin(T * 3.1) * .08 + (o.wob || 0);
    push(); translate(.2 * s, -1.3 * s); rotate(w);
    inkLine([[0, 0], [.6 * s, -.7 * s], [1.4 * s, -.75 * s], [1.8 * s, -.2 * s]], sw * 1.25, hair, 'ink', .6);
    pop();
    pop();
  }
  function blankScreen(t) {
    const { x, y, w, h } = S1;
    paint(rectPts(x - 10, y - 10, w + 20, h + 20), { wash: '#BCC6D6', ink: null });
    paint(rectPts(x - 10, y - 10, w + 20, 52), { wash: '#A7B2C6', ink: null });              // toolbar
    for (let i = 0; i < 3; i++) dot(x + 28 + i * 24, y + 20, 7, '#8E98AC', 1);
    for (let i = 0; i < 5; i++) paint(rrPts(x + 150 + i * 70, y + 9, 46, 22, 6), { wash: '#98A3B8', ink: null });
    // the page: huge and empty
    const px = x + 190, pw = w - 380;
    paint(rectPts(px + 8, y + 82, pw, h + 40), { wash: '#8C96AC', washOp: 120, ink: null });
    paint(rectPts(px, y + 72, pw, h + 40), { wash: '#EEF2F7', ink: null });
    // the cursor blinks on the beat
    const f = frac(bpOf(t)), on = f < .5, cx = px + 74, cy = y + 150;
    glow(cx, cy, 60, '#9FB6DA', .25 * (on ? 1 : .3));
    if (on) paint(rectPts(cx - 3.5, cy - 32, 7, 64), { wash: '#2B2233', ink: null });
    // 桃桃 in the corner: greyed out, asleep on a little grey cushion
    const mx = x + w - 110, my = y + h - 22;
    fadeIn(.9, () => {                                                                         // curled up asleep on a little cushion
      paint(rrPts(mx - 110, my - 14, 220, 30, 14), { wash: '#A7B0C2', fill: '#8E98AC', fillOp: 60, ink: PAL.ink, sw: .6 });
      momo(mx + 92, my - 20, 17, { ...MOMO_GREY, noShadow: true, rot: -1.42 + .02 * Math.sin(t * 1.4), eyes: 'closed', mouth: 'tiny', aL: -.3, aR: -2.2, sq: .03 * Math.sin(t * 1.7), blush: .15, tilt: -.15 });
    });
    for (let i = 0; i < 2; i++) {                                                              // slow grey z's
      const a = frac(t * .3 + i * .5);
      letter('z', mx - 70 + a * 30, my - 90 - a * 80, 26 + a * 14, '#9A98AA', { font: 'cute', ink: false, alpha: Math.sin(a * Math.PI) * .9 });
    }
  }
  function blank(t, lt, dur) {
    const e = easeInOut(seg(lt, -.4, dur + .3));
    camBegin(lerp(1000, 930, e), lerp(530, 522, e), lerp(1.0, 1.09, e));
    paint(FULL(), { grad: ['#171B3E', '#0B0E26', Math.PI / 2], ink: null });
    // the window with rain, far left
    windowView(30, 90, 340, 380, t, { night: 1, rain: 1 });
    fillRectA(30, 90, 340, 380, '#0B0E26', .4);
    paint(rectPts(20, 80, 360, 400, 2), { ink: PAL.ink, sw: 1.4 });
    inkLine([[200, 86], [200, 476]], 2.6, '#2C3050', 'marker', 0); inkLine([[26, 280], [374, 280]], 2.6, '#2C3050', 'marker', 0);
    // screen glow on the wall
    glow(S1.x + S1.w / 2, S1.y + S1.h / 2, 1200, '#AFC4E8', .26);
    // the desk top, seen from above: lit near the screen, falling off toward us
    paint([[250, 488], [W + 300, 488], [W + 300, 884], [200, 884]], { grad: ['#4A4458', '#221E2C', Math.PI / 2], fill: '#3C3346', fillOp: 60, bleed: .03, tex: .6, border: .2, ink: PAL.ink, sw: 1.1 });
    for (let i = 0; i < 5; i++) inkLine([[300 + i * 60, 520 + i * 70], [W + 200, 530 + i * 72 + hash(i) * 20]], .5, '#1A1622', 'fine', .3, .5);
    paint([[200, 884], [W + 300, 884], [W + 300, 916], [200, 916]], { wash: '#17141F', ink: PAL.ink, sw: .9 });
    paint([[200, 916], [W + 300, 916], [W + 300, H + 400], [200, H + 400]], { wash: '#0E0C17', ink: null });
    // the monitor: a dark bezel around a huge bright page
    const mcx = S1.x + S1.w / 2;
    paint([[mcx - 70, S1.y + S1.h + 20], [mcx + 70, S1.y + S1.h + 20], [mcx + 60, 532], [mcx - 60, 532]], { wash: '#1C2034', ink: PAL.ink, sw: 1 });
    paint(ellPts(mcx, 534, 180, 22, 18), { wash: '#1C2034', ink: PAL.ink, sw: 1 });
    paint(rrPts(S1.x - 24, S1.y - 22, S1.w + 48, S1.h + 46, 20), { wash: '#1C2034', ink: PAL.ink, sw: 1.5 });
    clipTo(rrPts(S1.x, S1.y, S1.w, S1.h, 8), () => blankScreen(t));
    // the page's cold light pooled on the desk
    light(mcx, 560, 820, '#B9CCEB', .2);
    sodaCan(470, 640, .95, { drops: .4, rot: -.05 });                                          // the peach soda can, as always
    // crumpled drafts pile up, one landing on each beat
    for (const [bx, by, bs, bb] of BALLS) {
      const age = bb < 0 ? 9 : t - B(bb);
      if (age < -.24) continue;
      const u = clamp((age + .24) / .24), yy = age < 0 ? by - 160 * (1 - u * u) : by;
      const sq = age >= 0 ? .25 * Math.exp(-age * 10) * Math.cos(age * 28) : -.1;
      ball(bx, yy, bs, bb + 7 + bx, '#B9C1D2', sq, age < 0 ? (1 - u) * 2.5 : 0);
    }
    // her: head down on the desk. She lifts her head a little to look at the page, then flops back down with a sigh.
    const lift = smooth01(lt, 1.6, 2.1, 2.8, 3.05), flopAge = t - B(325) + .08;
    const flop = flopAge > 0 ? Math.exp(-flopAge * 6) * Math.sin(flopAge * 24) : 0;
    light(HX1, HY1 - 60, 260, '#DCE6F5', .16);
    slumpBack(HX1, HY1, HS1, { breath: .03 * Math.sin(t * 1.7) + .06 * flop, lift, tilt: .32 - .28 * lift + .05 * flop, wob: .3 * flop });
    light(HX1 + 20, HY1 - 130, 170, '#D0DDF2', .2);                                           // the page's light on her hair
    // her chair back, closest to us
    paint(rrPts(HX1 - 2.2 * HS1, HY1 + 5.0 * HS1, 4.4 * HS1, 3.6 * HS1, 1.1 * HS1), { wash: '#2E2A48', fill: '#3E3860', fillOp: 70, tex: .4, ink: PAL.ink, sw: 1.2 });
    sighPuff(HX1 - 150, HY1 - 90, flopAge - .1, 1.2);
    camEnd();
    grade(.82, 'saturation');
    vignette(.6, '#05071A');
  }

  // =====================================================================================================
  // 2 · DOUBTS (196.956–201.756): small question marks circle her like moths; she hugs her knees in the chair.
  //     The monitor light from the left throws her shadow long across the floor and big up the wall.
  // =====================================================================================================
  const HX2 = 640, HS2 = 46, FY2 = 950, WALL2 = 770;               // her chair's floor point, the wall/floor line
  const HG2 = FY2 - 1.7 * HS2;                                    // her seated ground point
  const QM = Array.from({ length: 10 }, (_, i) => ({ r: 170 + hash(i * 3.7) * 170, sp: (.14 + hash(i * 5.3) * .14) * (i % 3 === 1 ? -1 : 1), ph: i / 10 * TAU + hash(i * 7.9),
    s: 5.2 + hash(i * 2.3) * 2.6, h: hash(i * 9.1) * 120 - 50, col: ['#C8B6F2', '#B7A6DA', '#D6C8F6'][i % 3] }));
  function qmPos(q, i, t, tight) {
    const a = q.ph + t * q.sp * TAU, r = q.r * tight, fl = Math.sin(t * 11 + i * 2.1) * 8;
    return { x: HX2 + Math.cos(a) * r + Math.sin(t * 2.3 + i) * 18, y: HG2 - 9.3 * HS2 + q.h * tight + Math.sin(a) * r * .24 + fl - 18 * pulse(t + i * .09, 5),
      front: Math.sin(a) > 0, depth: Math.sin(a), rot: Math.sin(t * 7 + i) * .22 + Math.cos(a) * .15 };
  }
  // her shadow on the wall: a side-on silhouette of a girl hugging her knees in a chair (origin: the seat; facing left)
  function profileSil(s, col, op) {
    const o = { wash: col, washOp: op, ink: null };
    paint(rrPts(1.55 * s, -5.3 * s, .6 * s, 4.3 * s, .3 * s), o);                                   // chair: backrest
    paint(rrPts(-2.4 * s, -1.25 * s, 4.6 * s, .55 * s, .25 * s), o);                               // seat
    paint(rectPts(-.2 * s, -.8 * s, .4 * s, 2.5 * s), o);                                            // pole
    paint(rrPts(-2.3 * s, 1.55 * s, 4.6 * s, .32 * s, .16 * s), o);                                  // base
    for (const dx of [-2.1, 2.1]) paint(ellPts(dx * s, 2.05 * s, .3 * s, .3 * s, 8), o);
    paint([[1.5 * s, -1.2 * s], [1.45 * s, -2.8 * s], [1.0 * s, -4.1 * s], [0, -4.6 * s], [-.9 * s, -4.3 * s], [-.6 * s, -1.2 * s]], { ...o, curv: .4 });   // back
    paint(capsule(-.1 * s, -1.6 * s, -1.75 * s, -4.35 * s, .8 * s, .72 * s), o);                   // thigh up to the knee
    paint(capsule(-1.75 * s, -4.35 * s, -2.05 * s, -1.75 * s, .66 * s, .55 * s), o);               // shin down to the seat
    paint(ellPts(-2.45 * s, -1.55 * s, .75 * s, .34 * s, 10), o);                                    // foot
    paint(capsule(.2 * s, -4.1 * s, -2.35 * s, -3.0 * s, .45 * s, .4 * s), o);                     // arm around the knees
    paint(ellPts(-2.5 * s, -3.0 * s, .45 * s, .42 * s, 10), o);                                      // hands
    paint(ellPts(-.35 * s, -7.1 * s, 2.85 * s, 2.7 * s, 24), o);                                     // head
    paint([[1.6 * s, -6.9 * s], [2.75 * s, -5.6 * s], [2.85 * s, -4.55 * s], [1.9 * s, -4.75 * s], [1.0 * s, -5.3 * s]], { ...o, curv: .3 });   // bob at the back
    paint([[-3.05 * s, -7.6 * s], [-3.35 * s, -6.2 * s], [-2.9 * s, -5.9 * s], [-2.6 * s, -7.0 * s]], { ...o, curv: .4 });                    // bangs
    paint([[-2.55 * s, -5.5 * s], [-3.05 * s, -5.25 * s], [-2.6 * s, -4.95 * s]], { ...o, curv: .2 });                                          // little nose/chin
    inkLine([[-.2 * s, -9.7 * s], [-.1 * s, -10.4 * s], [.6 * s, -10.8 * s], [.75 * s, -11.5 * s], [.15 * s, -11.9 * s], [-.45 * s, -11.55 * s]], s * .1, col, 'marker', .6, op / 255);
  }
  function qmShadow(x, y, s, rot, col, op) {
    push(); translate(x, y); rotate(rot);
    inkLine([[-1.6 * s, -5.4 * s], [-1.2 * s, -6.9 * s], [.4 * s, -7.4 * s], [1.7 * s, -6.5 * s], [1.6 * s, -5.0 * s], [.3 * s, -4.1 * s], [0, -2.9 * s], [0, -2.2 * s]], s * .7, col, 'marker', .6, op / 255);
    paint(ellPts(0, -.7 * s, .75 * s, .75 * s, 12), { wash: col, washOp: op, ink: null });
    pop();
  }
  // knees hugged to the chest (body-local), drawn from the head hook so they can cover her chin and mouth
  function hugKnees(s, sw, kneeTop) {
    for (const sd of [-1, 1]) {
      paint(rrPts(sd * .6 * s - .5 * s, kneeTop * s, 1.0 * s, (-.55 - kneeTop) * s, .5 * s), { wash: PJ, fill: PJ_DK, fillOp: 70, bleed: .05, tex: .35, border: .3, ink: PAL.ink, sw: sw * .8 });
      paint(ellPts(sd * .72 * s, -.5 * s, .5 * s, .3 * s, 12), { wash: SKIN_C, ink: PAL.ink, sw: sw * .7 });
      for (const k of [.2, .55]) paint(starPts(sd * (.45 + k * .5) * s, (kneeTop + .9 + k * 1.6) * s, .17 * s, .45, 5), { wash: '#FFF3C4', ink: null });
    }
    // forearms wrap around the shins, hands clasped in front
    for (const sd of [-1, 1]) {
      push(); translate(sd * 1.25 * s, (kneeTop + 1.9) * s); rotate(sd * -.18);
      paint(rrPts(sd < 0 ? -.1 * s : -1.25 * s, -.3 * s, 1.35 * s, .6 * s, .3 * s), { wash: PJ, fill: PJ_DK, fillOp: 60, tex: .3, border: .2, ink: PAL.ink, sw: sw * .75 });
      pop();
    }
    paint(ellPts(-.2 * s, (kneeTop + 2.0) * s, .36 * s, .33 * s, 12), { wash: SKIN_C, ink: PAL.ink, sw: sw * .6 });
    paint(ellPts(.22 * s, (kneeTop + 1.95) * s, .36 * s, .33 * s, 12), { wash: SKIN_C, ink: PAL.ink, sw: sw * .6 });
  }
  function doubts(t, lt, dur) {
    const e = easeInOut(seg(lt, -.4, dur + .3)), cam = [lerp(930, 760, e), lerp(520, 540, e), lerp(1.0, 1.14, e)];
    camBegin(cam[0], cam[1], cam[2]);
    // wall + floor
    paint(FULL(), { grad: ['#39417A', '#2C3368', Math.PI / 2], ink: null });
    paint([[-2400, WALL2], [W + 2400, WALL2], [W + 2400, H + 2400], [-2400, H + 2400]], { wash: '#383660', fill: '#2A284C', fillOp: 70, bleed: .04, tex: .5, border: .2, ink: PAL.ink, sw: .9 });
    for (let i = -6; i < 14; i++) inkLine([[i * 200, WALL2 + 4], [i * 290 - 520, H + 500]], .45, '#201E3A', 'fine', 0, .6);
    // a dim window up right with rain
    windowView(1500, 110, 300, 300, t, { night: 1, rain: 1 });
    fillRectA(1500, 110, 300, 300, '#101430', .4);
    paint(rectPts(1490, 100, 320, 320, 2), { ink: PAL.ink, sw: 1.3 });
    inkLine([[1650, 104], [1650, 416]], 2.4, '#3A3E66', 'marker', 0);
    // the monitor light from the left
    glow(80, 560, 1500, '#B4CBF2', .34);
    // the long shadow: across the floor and big up the wall
    const tight = lerp(1, .72, ease(seg(lt, .5, dur))), kneeTop = lerp(-4.9, -5.6, ease(seg(lt, 1.6, 3.0)));
    const sink = .2 * ease(seg(lt, 3.0, 3.8));
    const SHC = '#0E1034', KS = 1.1 * HS2, SX = 1180, SY = WALL2 - 2.35 * KS + sink * KS;
    softLayer(cam, () => {
      paint([[HX2 - 150, FY2 + 12], [HX2 + 90, FY2 - 26], [SX + 160, WALL2 + 3], [SX - 170, WALL2 + 3]], { wash: SHC, ink: null, curv: .2 });
      clipTo(rectPts(-2400, -2400, W + 4800, WALL2 + 2400), () => {
        push(); translate(SX, SY); profileSil(KS, SHC, 255); pop();
        QM.forEach((q, i) => { const p = qmPos(q, i, t, tight); qmShadow(SX + (p.x - HX2) / HS2 * KS * .9, SY + (p.y - HG2) / HS2 * KS, q.s * 1.15, p.rot, SHC, 255); });
      });
    }, .5, 5);
    // the edge of her desk and the glowing monitor, far left
    paint([[-600, 590], [70, 590], [80, 630], [-600, 630]], { wash: '#4A4058', ink: PAL.ink, sw: 1 });
    paint(rrPts(-440, 230, 480, 330, 16), { wash: '#2A2E48', ink: PAL.ink, sw: 1.3 });
    paint(rrPts(-420, 248, 440, 290, 8), { wash: '#E6EDF6', ink: PAL.ink, sw: .8 });
    // question marks behind her
    const qs = QM.map((q, i) => ({ q, i, p: qmPos(q, i, t, tight) }));
    const drawQ = ({ q, i, p }) => {
      const s = q.s * (1 + .15 * p.depth);
      qmark(p.x, p.y, s, { col: q.col, rot: p.rot, sq: .1 * Math.sin(t * 14 + i), seed: i, eyes: i % 4 === 1 ? 'happy' : 'normal' });
    };
    qs.filter(o => !o.p.front).forEach(drawQ);
    // her chair and her, hugging her knees
    chair(HX2, FY2, HS2, { seat: 3.2 });
    const md = mood(t, [[196.9, 'normal'], [B(330) + .3, 'tired'], [B(333), 'closed']]);
    const lookX = lt < 2.2 ? Math.sin(t * 1.6) * .6 : -.2;
    hero(HX2, HG2 + sink * HS2, HS2, { outfit: 'pajama', sit: true, noShadow: true, ...md, brows: 'worried', mouth: 'flat', ahoge: 'question',
      lookX, lookY: lt < 2.2 ? -.7 : .2, blush: .35, aL: -1.3, aR: -1.3, sq: .02 * Math.sin(t * 1.8) + .04 * pulse(t, 4) * (lt > 1.6 ? 1 : 0), tilt: -.06 + .04 * Math.sin(t * .9),
      head: (s, sw) => { push(); translate(0, 2.4 * s); rotate(.06 - .04 * Math.sin(t * .9)); translate(0, 4.3 * s); hugKnees(s, sw, kneeTop); pop(); } });
    qs.filter(o => o.p.front).forEach(drawQ);
    // night: multiply, then the monitor light on her and the moths catching it
    grade(.42, 'multiply', '#4C5A96');
    light(HX2 - 330, 560, 760, '#A9C0EC', .26);
    qs.forEach(({ q, p }) => light(p.x, p.y - 3.6 * q.s, 6 * q.s, '#CDBEF5', .22));
    camEnd();
    grade(.42, 'saturation');
    vignette(.5, '#070A1C');
  }

  // =====================================================================================================
  // 3 · REHEAT (201.756–206.556): a small kitchen corner at night. The bowl goes in, the door clicks shut, 团子 boops
  //     the start button, the microwave glows warm yellow, the plate turns, the timer counts down on the beats → 叮 →
  //     the door pops open and steam rolls out.
  // =====================================================================================================
  const CT = 880;                                                  // counter top
  const MW = { x: 850, y: 566, w: 540, h: 314 };                   // microwave body
  const DOOR = { x: 870, y: 586, w: 318, h: 276 };                 // door (hinge on the left)
  const CAV = { x: 884, y: 600, w: 290, h: 248 };                  // the cavity
  const PANEL = { x: 1206, y: 590, w: 162, h: 268 };
  const TURN = [1029, 832];                                        // turntable centre
  const HX3 = 690, HS3 = 50, GY3 = 1012, CX3 = 1452, CS3 = 27;     // her ground point; 团子 on the counter
  const T_IN0 = 202.12, T_IN1 = 202.72, T_SHUT0 = 202.76, T_SHUT1 = B(338), T_GO = B(339), T_DING = B(342), T_OPEN = T_DING + .32;
  const onK = t => seg(t, T_GO + .06, T_GO + .3);
  const doorTh = t => t < T_SHUT0 ? 1.95 : t < T_OPEN ? 1.95 * (1 - easeIn(seg(t, T_SHUT0, T_SHUT1))) : 1.95 * backOut(seg(t, T_OPEN, T_OPEN + .4));
  const spinA = t => Math.max(0, t - T_GO - .1) * 1.9 - Math.max(0, t - T_DING - .1) * 1.9;
  // bilinear point inside a quad [A (top hinge), Bq (top free), C (bottom free), D (bottom hinge)]
  const quadPt = (q, u, v) => [lerp(lerp(q[0][0], q[1][0], u), lerp(q[3][0], q[2][0], u), v), lerp(lerp(q[0][1], q[1][1], u), lerp(q[3][1], q[2][1], u), v)];
  const quadSub = (q, u0, v0, u1, v1) => [quadPt(q, u0, v0), quadPt(q, u1, v0), quadPt(q, u1, v1), quadPt(q, u0, v1)];

  // the bowl of noodles: ceramic with a pink band; ang turns its pattern (on the turntable)
  function noodleBowl(x, y, s, ang = 0) {
    push(); translate(x, y); scale(s);
    paint(ellPts(0, 4, 70, 12, 16), { wash: PAL.ink, washOp: 60, ink: null });
    const body = []; for (let i = 0; i <= 12; i++) { const a = i / 12 * Math.PI; body.push([Math.cos(a) * 66, -30 + Math.sin(a) * 34]); }
    body.push([-66, -30], [66, -30]);
    paint(body.slice(0, 13), { wash: '#F6EEE4', fill: '#D9CBBE', fillOp: 70, tex: .3, ink: PAL.ink, sw: 1.1, curv: .3 });
    clipTo(body.slice(0, 13).concat([[-66, -32], [66, -32]]), () => {
      paint(rectPts(-70, -20, 140, 12), { wash: '#F29BB8', ink: null });
      for (let k = 0; k < 6; k++) { const a = ang + k / 6 * TAU, c = Math.cos(a); if (Math.sin(a) < 0) continue; dot(c * 58, -14, 4.5 * (.4 + .6 * Math.sin(a)), '#FFF6EE', 1); }
    });
    paint(ellPts(0, -32, 66, 14, 22), { wash: '#F6EEE4', ink: PAL.ink, sw: 1 });
    paint(ellPts(0, -33, 58, 10, 22), { wash: '#E9B96A', ink: null });                                   // broth
    for (let k = 0; k < 7; k++) { const x0 = -46 + k * 14; inkLine([[x0, -30], [x0 + 6, -38], [x0 + 12, -31]], .9, '#F7D98E', 'fine', .6); }
    paint(ellPts(18, -38, 17, 8, 12), { wash: '#FFFBF2', ink: PAL.ink, sw: .6 });                         // egg
    paint(ellPts(18, -38.5, 8, 4.5, 10), { wash: '#F6C04F', ink: null });
    paint(ellPts(-22, -38, 12, 6, 12), { wash: '#FFF3F6', ink: PAL.ink, sw: .5 });                        // fishcake swirl
    inkLine([[-27, -38], [-22, -41], [-17, -38], [-22, -36]], .6, '#F07CA6', 'fine', .6);
    for (let k = 0; k < 5; k++) dot(-4 + hash(k * 3.3) * 20, -40 + hash(k * 5.1) * 7, 2.2, '#7FC08A', 1);   // spring onion
    pop();
  }
  function steamWisps(x, y, age, n, spread, h, a = .7, seed = 0) {
    for (let i = 0; i < n; i++) {
      const ph = frac(age * .55 + hash(i * 3.1 + seed)), k = Math.sin(ph * Math.PI) * a, x0 = x + (hash(i * 7.3 + seed) - .5) * spread;
      if (k < .02) continue;
      const pts = []; for (let j = 0; j <= 6; j++) { const u = j / 6, yy = y - ph * h - u * h * .5; pts.push([x0 + Math.sin(u * 5 + age * 3 + i) * 16 * (.4 + u), yy]); }
      inkLine(pts, 2.6, '#FFF6E6', 'marker', .7, k * .55);
      inkLine(pts, .8, '#FFFFFF', 'fine', .7, k * .5);
    }
  }
  function sevenSeg(x, y, h, d, col, a) {
    const w = h * .52, S = { a: [[0, 0], [1, 0]], b: [[1, 0], [1, .5]], c: [[1, .5], [1, 1]], d: [[0, 1], [1, 1]], e: [[0, .5], [0, 1]], f: [[0, 0], [0, .5]], g: [[0, .5], [1, .5]] };
    const on = ['abcdef', 'bc', 'abged', 'abgcd', 'fgbc', 'afgcd', 'afgedc', 'abc', 'abcdefg', 'abfgcd'][d];
    for (const k of 'abcdefg') {
      const [[x0, y0], [x1, y1]] = S[k], lit = on.includes(k);
      inkLine([[x + x0 * w - (y1 - y0) * 0 + (x1 - x0) * 2, y + y0 * h + (y1 - y0) * 2], [x + x1 * w - (x1 - x0) * 2, y + y1 * h - (y1 - y0) * 2]], h * .05, col, 'marker', 0, lit ? a : a * .12);
    }
  }
  function kitchen(t) {
    paint(FULL(), { wash: '#56629A', ink: null });
    // tiled backsplash
    paint(rectPts(-400, 330, W + 800, CT - 330), { wash: '#6573A8', fill: '#56649A', fillOp: 60, bleed: .03, tex: .5, border: .2, ink: null });
    for (let y = 330; y < CT; y += 64) inkLine([[-400, y], [W + 400, y]], .5, '#46528A', 'fine', 0, .8);
    for (let r = 0; r < 9; r++) for (let x = -400 + (r % 2) * 32; x < W + 400; x += 64) inkLine([[x, 330 + r * 64], [x, 394 + r * 64]], .45, '#46528A', 'fine', 0, .7);
    // upper cabinets
    paint(rectPts(40, 30, 700, 260, 2), { wash: '#7C8AB8', fill: '#65729F', fillOp: 70, tex: .5, ink: PAL.ink, sw: 1.2 });
    for (const cx of [215, 565]) { paint(rectPts(cx - 160, 50, 320, 220, 2), { ink: PAL.ink, sw: .8 }); paint(ellPts(cx + (cx < 400 ? 130 : -130), 230, 7, 7, 8), { wash: '#E8D2A0', ink: PAL.ink, sw: .5 }); }
    // little window with rain
    windowView(1560, 90, 300, 300, t, { night: 1, rain: 1 });
    paint(rectPts(1550, 80, 320, 320, 2), { ink: PAL.ink, sw: 1.3 });
    inkLine([[1710, 84], [1710, 396]], 2.6, '#E9DCCB', 'marker', 0); inkLine([[1556, 240], [1864, 240]], 2.6, '#E9DCCB', 'marker', 0);
    paint(rectPts(1530, 396, 360, 22, 2), { wash: '#E9DCCB', ink: PAL.ink, sw: 1 });
    plant(1620, 398, .55, t);
    // a hanging towel and utensils
    inkLine([[120, 420], [470, 420]], 2.4, '#B99A6E', 'marker', 0);
    for (const [ux, ul] of [[170, 90], [230, 110], [290, 80]]) { inkLine([[ux, 420], [ux, 420 + ul]], 1.4, '#C9CCD8', 'marker', 0); paint(ellPts(ux, 430 + ul, 14, 20, 10), { wash: '#C9CCD8', ink: PAL.ink, sw: .7 }); }
    paint([[380, 420], [450, 420], [455, 560], [375, 560]], { wash: '#F29BB8', fill: '#E27A92', fillOp: 60, tex: .4, ink: PAL.ink, sw: .9, curv: .1 });
    for (let k = 0; k < 3; k++) inkLine([[378, 470 + k * 26], [452, 470 + k * 26]], .8, '#FFF6E6', 'fine', 0);
    // counter
    paint([[-400, CT - 18], [W + 400, CT - 18], [W + 400, CT + 14], [-400, CT + 14]], { wash: '#D9CDBE', fill: '#B8A994', fillOp: 70, tex: .5, ink: PAL.ink, sw: 1.1 });
    paint([[-400, CT + 14], [W + 400, CT + 14], [W + 400, H + 400], [-400, H + 400]], { wash: '#8C7A96', fill: '#6E5E7E', fillOp: 70, tex: .5, ink: PAL.ink, sw: 1 });
    for (const x of [120, 560, 1000, 1440, 1880]) inkLine([[x, CT + 30], [x, H + 400]], .8, '#5A4C68', 'fine', 0);
    // a kettle
    push(); translate(330, CT - 16);
    paint([[-70, 0], [70, 0], [60, -80], [30, -110], [-30, -110], [-60, -80]], { wash: '#9ED8C4', fill: '#6FB8A2', fillOp: 70, tex: .4, ink: PAL.ink, sw: 1.1, curv: .4 });
    inkLine([[-40, -112], [-30, -150], [30, -150], [40, -112]], 2.4, PAL.ink, 'ink', .6);
    inkLine([[60, -60], [104, -92], [118, -96]], 5, '#9ED8C4', 'marker', .5); inkLine([[60, -60], [104, -92], [118, -96]], .9, PAL.ink, 'fine', .5);
    pop();
  }
  function microwave(t) {
    const on = onK(t), th = doorTh(t), ang = spinA(t), shut = t > T_SHUT1 ? Math.exp(-(t - T_SHUT1) * 14) * Math.sin((t - T_SHUT1) * 50) : 0;
    push(); translate(MW.x + MW.w / 2, CT); scale(1 + shut * .01, 1 - shut * .012); translate(-(MW.x + MW.w / 2), -CT);
    // body
    paint(rrPts(MW.x + 10, MW.y + 12, MW.w, MW.h, 26), { wash: PAL.ink, washOp: 70, ink: null });
    paint(rrPts(MW.x, MW.y, MW.w, MW.h, 26), { wash: '#F1E4CF', fill: '#D8C7AE', fillOp: 80, bleed: .04, tex: .5, border: .3, ink: PAL.ink, sw: 1.4 });
    for (const fx of [MW.x + 40, MW.x + MW.w - 40]) paint(rrPts(fx - 22, CT - 6, 44, 12, 5), { wash: '#6E6070', ink: PAL.ink, sw: .7 });
    // cavity: warm back wall, turntable, the bowl
    paint(rrPts(CAV.x, CAV.y, CAV.w, CAV.h, 10), { wash: '#B8A68E', ink: PAL.ink, sw: 1 });
    paint(rrPts(CAV.x + 26, CAV.y + 20, CAV.w - 52, CAV.h - 54, 8), { wash: '#C9B89E', ink: null });
    for (let k = 0; k < 4; k++) inkLine([[CAV.x + 26, CAV.y + 26 + k * 14], [CAV.x + 60, CAV.y + 26 + k * 14]], .5, '#9A8870', 'fine', 0);   // vent slits
    paint([[CAV.x, CAV.y + CAV.h - 30], [CAV.x + CAV.w, CAV.y + CAV.h - 30], [CAV.x + CAV.w, CAV.y + CAV.h], [CAV.x, CAV.y + CAV.h]], { wash: '#A8967E', ink: null });
    paint(ellPts(TURN[0], TURN[1], 112, 17, 22), { wash: '#E3ECEF', washOp: 200, ink: PAL.ink, sw: .8 });
    for (let k = 0; k < 3; k++) { const a = ang * 1.0 + k / 3 * TAU; if (Math.sin(a) > -.2) dot(TURN[0] + Math.cos(a) * 92, TURN[1] + Math.sin(a) * 13, 3, '#B8C4CC', 1); }
    const bp = bowlPos(t);
    if (bp.inside) noodleBowl(bp.x, bp.y, .95, ang);
    // the door
    const c = Math.cos(th), sn = Math.sin(th), hx = DOOR.x, fw = DOOR.w * c, grow = 1 + .14 * sn, y0 = DOOR.y, y1 = DOOR.y + DOOR.h, ym = (y0 + y1) / 2;
    const q = [[hx, y0], [hx + fw, ym - (ym - y0) * grow], [hx + fw, ym + (y1 - ym) * grow], [hx, y1]];
    if (c > .02) {                                                                             // front of the door, with its window
      for (const [u0, v0, u1, v1] of [[0, 0, 1, .09], [0, .91, 1, 1], [0, .09, .07, .91], [.93, .09, 1, .91]]) paint(quadSub(q, u0, v0, u1, v1), { wash: '#EBDDC6', ink: null });
      paint(q, { ink: PAL.ink, sw: 1.2 });
      const win = quadSub(q, .07, .09, .93, .91);
      paint(win, { wash: '#2A2438', washOp: 70 + 80 * (1 - on), ink: PAL.ink, sw: .9 });
      clipTo(win, () => { for (let yy = y0; yy < y1; yy += 11) for (let xx = hx; xx < hx + DOOR.w; xx += 11) dot(xx + (yy % 22 ? 5 : 0), yy, 1.3, '#1E1A2A', .35); });
      inkLine([quadPt(q, .97, .25), quadPt(q, .97, .75)], 3.4, '#CDBDA4', 'marker', 0);          // handle
    } else {                                                                                   // swung open: its inner face
      paint(q, { wash: '#E2D4BE', fill: '#C9B89E', fillOp: 60, tex: .4, ink: PAL.ink, sw: 1.2 });
      paint(quadSub(q, .12, .12, .88, .88), { wash: '#D6C8B0', ink: PAL.ink, sw: .6 });
    }
    // control panel: timer display, buttons, the big start button
    paint(rrPts(PANEL.x, PANEL.y, PANEL.w, PANEL.h, 10), { wash: '#E6D6BE', ink: PAL.ink, sw: .9 });
    paint(rrPts(PANEL.x + 14, PANEL.y + 14, PANEL.w - 28, 58, 8), { wash: '#2E2A3C', ink: PAL.ink, sw: .9 });
    for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) paint(rrPts(PANEL.x + 22 + k * 42, PANEL.y + 96 + r * 34, 32, 22, 7), { wash: '#F6EEE0', ink: PAL.ink, sw: .6 });
    const press = t > T_GO - .12 && t < T_GO + .2 ? Math.sin(seg(t, T_GO - .12, T_GO + .2) * Math.PI) : 0;
    paint(ellPts(PANEL.x + PANEL.w / 2, PANEL.y + 224 + press * 3, 30, 22 - press * 4, 16), { wash: '#F29BB8', fill: '#E27A92', fillOp: 70, ink: PAL.ink, sw: 1 });
    pop();
    return { q, on, ang, press };
  }
  // where the bowl is: in her hand, sliding in, on the turntable
  function bowlPos(t) {
    if (t < T_IN0) return { x: 850, y: 850, inside: false };
    if (t < T_IN1) { const k = easeInOut(seg(t, T_IN0, T_IN1)); return { x: lerp(850, TURN[0], k), y: lerp(850, TURN[1] - 6, k) - Math.sin(k * Math.PI) * 16, inside: k > .3 }; }
    return { x: TURN[0], y: TURN[1] - 6, inside: true };
  }
  function reheat(t, lt, dur) {
    const e = easeInOut(seg(lt, -.4, dur + .3)), dg = t > T_DING ? Math.exp(-(t - T_DING) * 5) : 0;
    const cam = [lerp(1000, 1045, e), lerp(690, 718, e), lerp(1.08, 1.22, e) + .014 * dg];
    camBegin(cam[0], cam[1], cam[2]);
    kitchen(t);
    const mw = microwave(t);
    // 团子 on the counter: boops the start button, then watches the plate go round; perks up at the ding
    const pawK = t > T_GO - .35 && t < T_GO + .35 ? Math.sin(seg(t, T_GO - .35, T_GO + .35) * Math.PI) : 0;
    const perk = t > T_DING ? Math.exp(-(t - T_DING) * 4) * Math.sin((t - T_DING) * 16) : 0;
    const watching = t > T_GO + .3 && t < T_DING + .1;
    if (pawK > .02) {
      const bx = PANEL.x + PANEL.w / 2 + 16, by = PANEL.y + 222, sx = CX3 - .9 * CS3, sy = CT - 2.3 * CS3;
      const px = lerp(sx, bx, pawK), py = lerp(sy, by, pawK) - Math.sin(pawK * Math.PI) * 18;
      paint(capsule(sx, sy, px, py, .42 * CS3, .38 * CS3), { wash: '#F6D3A1', ink: PAL.ink, sw: .8 });
      paint(ellPts(px, py, .5 * CS3, .42 * CS3, 12), { wash: '#FFF1DC', ink: PAL.ink, sw: .8 });
      for (const d of [-.25, 0, .25]) dot(px + d * CS3, py + .15 * CS3, 2.4, '#F29BB8', 1);
    }
    cat(CX3, CT - 8, CS3, { pose: 'sit', eyes: t > T_DING && t < T_DING + .8 ? 'wide' : 'open', look: watching ? -.6 + .45 * Math.sin(mw.ang) : pawK > .05 ? -1 : -.5,
      sq: -.12 * perk + .03 * Math.sin(t * 2), rot: watching ? .05 * Math.sin(mw.ang) : -.04 * pawK, tail: .2 * Math.sin(t * 3) });
    // her: puts the bowl in, swings the door shut, waits sleepily swaying, then the ding wakes her up
    const bp = bowlPos(t), reach = t < T_IN1 + .1 ? smooth01(t, T_IN0 - .2, T_IN0 + .1, T_IN1 - .1, T_IN1 + .15) : 0;
    const push_ = smooth01(t, T_SHUT0 - .12, T_SHUT0, T_SHUT1, T_SHUT1 + .2);
    const md = mood(t, [[201.5, 'normal'], [T_GO + .5, 'sleepy'], [T_DING + .02, 'normal'], [T_OPEN + .3, 'happy', null, 'o']]);
    const sway = move('sway', t), wait = t > T_GO && t < T_DING ? 1 : 0;
    let aR = bp.inside ? lerp(-1.1, .12, reach) : .02 + .1 * reach, aL = -1.0 + .2 * reach;
    if (push_ > 0) aR = lerp(aR, .3, push_);
    if (wait) { aL = -1.0 + .06 * Math.sin(t * 2); aR = -1.0 - .06 * Math.sin(t * 2); }
    if (t > T_OPEN) aR = lerp(-1.1, .35, ease(seg(t, T_OPEN + .1, T_OPEN + .6)));
    hero(HX3 + (wait ? sway.dx * HS3 * .5 : 0), GY3, HS3, { outfit: 'pajama', ...md, ahoge: t > T_DING ? 'normal' : 'droop', lookX: t > T_GO - .4 && t < T_GO + .4 ? .95 : .75, lookY: .1, blush: .4,
      rot: wait ? sway.rot * .6 : 0, tilt: wait ? sway.tilt * .8 + .06 * Math.sin(mw.ang) : .04, sq: .02 * Math.sin(t * 1.9), dy: -.1 * (1 - Math.exp(-Math.max(0, t - T_DING) * 3)) * (t > T_DING ? 1 : 0),
      aL, aR, handR: !bp.inside ? (s, sw) => { push(); rotate(aR); translate(.15 * s, .62 * s); noodleBowl(0, 0, s / 70); pop(); } : null });
    camEnd();
    // night, then the lights: moon through the window, the microwave's warm glow (its lamp is on dimly while the door is open)
    const lamp = Math.max(mw.on, .5 * clamp(doorTh(t) / 1.2)), fl = 1 + .03 * Math.sin(t * 23) + .12 * dg;
    lightMap(cam, '#242A60', [[1710, 250, 700, '#5A6AAA', .55], [TURN[0], CAV.y + 150, 1050, '#FFC98A', .95 * lamp * fl], [TURN[0], CAV.y + 130, 320, '#FFF0CC', .55 * lamp * fl],
      [PANEL.x + PANEL.w / 2, PANEL.y + 40, 160, '#FFB45C', .3], [HX3, 600, 900, '#3E4884', .3]]);
    camBegin(cam[0], cam[1], cam[2]);
    clipTo(rrPts(CAV.x, CAV.y, CAV.w, CAV.h, 10), () => light(TURN[0], CAV.y + 60, 260, '#FFD27A', .38 * mw.on * fl));
    light(TURN[0], CAV.y + 120, 380, '#FFC870', .26 * lamp * fl);
    // timer: 0:03 → 0:00 on the beats
    const ds = t < T_GO ? 3 : Math.max(0, 3 - Math.floor((t - T_GO) / BEAT + 1e-3)), hop = t > T_GO ? Math.exp(-frac((t - T_GO) / BEAT) * 8) * (t < T_DING + .6 ? 1 : 0) : 0;
    const blink = t > T_DING && frac((t - T_DING) * 2.5) > .5 ? .35 : 1, da = (t < T_GO ? .45 : 1) * blink;
    const dx0 = PANEL.x + 40, dy0 = PANEL.y + 27 - hop * 4;
    glow(PANEL.x + PANEL.w / 2, PANEL.y + 43, 90, '#FFB45C', .25 * da);
    sevenSeg(dx0, dy0, 32, 0, '#FFC46E', da);
    dot(dx0 + 30, dy0 + 10, 2.6, '#FFC46E', da); dot(dx0 + 30, dy0 + 22, 2.6, '#FFC46E', da);
    sevenSeg(dx0 + 40, dy0, 32, 0, '#FFC46E', da); sevenSeg(dx0 + 68, dy0, 32, ds, '#FFC46E', da);
    if (mw.on > .05) dot(PANEL.x + PANEL.w / 2, PANEL.y + 224, 5, '#FFE6B0', .8 * mw.on);
    if (mw.press > .05) sparkle(PANEL.x + PANEL.w / 2 + 34, PANEL.y + 200, 16, '#FFF3C0', mw.press);
    // steam rolls out when the door pops open
    const sa = t - T_OPEN;
    if (sa > 0) {
      const puff = easeOut(seg(sa, 0, .5)), pk = 1 - seg(sa, .5, 1.6);
      for (let i = 0; i < 5; i++) { const u = clamp(puff - i * .06); glow(CAV.x + 60 + i * 50 - u * 40, CAV.y + 150 - u * (150 + i * 40), 70 + u * 60, '#FFF1DC', .4 * pk * u); }
      steamWisps(TURN[0] - 30, CAV.y + 170, sa + 1.2, 6, 170, 360, .95 * seg(sa, 0, .3), 3);
    }
    sfx('叮', MW.x + MW.w - 110, MW.y - 70, 130, '#FFE08A', t - T_DING, { font: 'cute', life: 1.15, rot: -.12, stroke: '#7A4A2A', strokeW: .06 });
    camEnd();
    vignette(.45, '#0A0C22');
  }

  // =====================================================================================================
  // 4 · CARED FOR (206.556–213.756, through the pause): wrapped in the star blanket on the floor by the bed, she eats
  //     the warm noodles; 团子 curls in her lap; on the phone propped against her mug 桃桃 makes a heart. Warm light
  //     slowly wraps the three of them; she smiles and a small heart floats up.
  // =====================================================================================================
  const HX4 = 800, HS4 = 60, GY4 = 846;                            // her (sitting on the floor, wrapped up)
  const PH4 = { x: 1330, y: 876, w: 172, h: 300, rot: -.07 };       // the phone, standing on the floor
  const T_SLURP = B(346), T_MOMO = B(348), T_HEART = B(350);
  const warmK = t => ease(seg(t, 207.6, 212.6));                   // how much the warm light has wrapped them
  function starBlanket(pts, o = {}) {
    paint(pts, { wash: BLANKET, fill: BLANKET_DK, fillOp: 80, bleed: .05, tex: .5, border: .35, ink: PAL.ink, sw: o.sw ?? 1.3, curv: o.curv ?? .35 });
    const b = bbox(pts);
    clipTo(pts, () => { for (let i = 0; i < (o.n || 14); i++) paint(starPts(b.x + hash(i * 3.3 + (o.seed || 0)) * b.w, b.y + hash(i * 7.7 + (o.seed || 0)) * b.h, (o.star || 13) * (.7 + .5 * hash(i)), .45, 5, hash(i * 2.1)), { wash: BLANKET_STAR, ink: null }); });
  }
  function phoneScreen(t, r) {
    paint(rectPts(r.x - 4, r.y - 4, r.w + 8, r.h + 8), { grad: ['#FFE6EF', '#FFD0E0', Math.PI / 2], ink: null });
    for (let i = 0; i < 5; i++) { const a = frac(t * .2 + i * .2); paint(heartPts(r.x + hash(i * 3.1) * r.w, r.y + r.h * (1 - a), 5 + hash(i) * 4), { wash: '#FFFFFF', washOp: 150 * Math.sin(a * Math.PI), ink: null }); }
    const age = t - T_MOMO, pop = backOut(seg(age, 0, .35)), mx = r.x + r.w / 2, my = r.y + r.h - 18;
    // 桃桃 waves, then makes a big heart with her arms over her head; a pink heart pops above her
    const heart = age > 0 ? 1 : 0, wave = Math.sin(t * 9) * .3;
    momo(mx, my, 14, { digital: .7, eyes: heart ? 'happy' : 'normal', mouth: heart ? 'open' : 'smile', blush: .9, noShadow: true,
      aL: heart ? lerp(-.6, 2.35, pop) : -.9, aR: heart ? lerp(-.6, 2.35, pop) : .9 + wave, dy: -.35 * pulse(t, 5) * heart, sq: .05 * pulse(t, 5), tilt: heart ? .08 * Math.sin(t * 3) : .1 });
    if (age > 0) {
      const hk = backOut(seg(age, .08, .4)), hy = my - 14 * 11.6 - 6 * Math.sin(t * 4);
      glow(mx, hy, 60 * hk, '#FF9FC0', .5);
      paint(heartPts(mx, hy, 22 * hk), { wash: '#F05A88', ink: PAL.ink, sw: .7 });
      paint(heartPts(mx - 6 * hk, hy - 7 * hk, 6 * hk), { wash: '#FFC6DA', ink: null });
      for (let i = 0; i < 4; i++) sparkle(mx + Math.cos(i * 1.6 + 1) * 48, hy + Math.sin(i * 1.6 + 1) * 34, 7, '#FFF3C0', frac(age * 1.2 + i * .25));
    }
  }
  function phoneProp(t) {
    const { x, y, w, h, rot } = PH4;
    push(); translate(x, y); rotate(rot);
    paint(rrPts(-w / 2 + 8, -h + 10, w, h, 22), { wash: PAL.ink, washOp: 60, ink: null });
    paint(rrPts(-w / 2, -h, w, h, 22), { wash: '#3A3650', ink: PAL.ink, sw: 1.2 });
    const r = { x: -w / 2 + 10, y: -h + 26, w: w - 20, h: h - 46 };
    clipTo(rrPts(r.x, r.y, r.w, r.h, 12), () => phoneScreen(t, r));
    paint(rrPts(-18, -h + 10, 36, 7, 3), { wash: '#24203A', ink: null });
    pop();
  }
  function careForMe(t, lt, dur) {
    const e = easeInOut(seg(lt, -.4, dur + .3)), wk = warmK(t);
    const cam = [lerp(1000, 960, e), lerp(560, 575, e), lerp(1.04, 1.2, e)];
    camBegin(cam[0], cam[1], cam[2]);
    // the room corner: wall, window with rain, fairy lights, the side of her bed
    paint(rectPts(-400, -400, W + 800, 1300), { grad: ['#565C96', '#4A4E88', Math.PI / 2], tex: .5, ink: null });
    windowView(120, 90, 380, 400, t, { night: 1, rain: 1 });
    paint(rectPts(110, 80, 400, 420, 2), { ink: PAL.ink, sw: 1.4 });
    inkLine([[310, 84], [310, 496]], 3, '#E9DCCB', 'marker', 0); inkLine([[114, 290], [506, 290]], 3, '#E9DCCB', 'marker', 0);
    paint(rectPts(90, 492, 440, 24, 2), { wash: '#E9DCCB', ink: PAL.ink, sw: 1 });
    const fl = []; for (let i = 0; i <= 26; i++) fl.push([-100 + i * 90, 70 + Math.sin(i * .9) * 22 + (i % 2) * 10]);
    inkLine(fl, .9, PAL.ink, 'fine', .5);
    // bed behind her
    paint(rrPts(560, 560, 1500, 330, 36), { wash: '#F4E9DC', fill: '#D9CCBE', fillOp: 60, tex: .4, ink: PAL.ink, sw: 1.2 });
    paint(rrPts(1260, 500, 330, 120, 44), { wash: '#FFF8EE', fill: PAL.skyLt, fillOp: 60, tex: .3, ink: PAL.ink, sw: 1.1 });
    paint([[540, 700], [2100, 690], [2100, 900], [540, 900]], { wash: '#E0D3C4', ink: PAL.ink, sw: 1 });
    // floor + a round rug
    paint([[-400, 880], [W + 400, 880], [W + 400, H + 400], [-400, H + 400]], { wash: '#8C6E72', fill: '#6E5460', fillOp: 70, tex: .6, border: .2, ink: PAL.ink, sw: 1 });
    paint(ellPts(900, 960, 760, 110, 30), { wash: '#E7B8C4', fill: '#C98A9C', fillOp: 60, tex: .5, ink: PAL.ink, sw: 1 });
    // her mug and the phone propped against it
    mug(1500, 892, 1.15, PAL.rose, .6 + .4 * wk);
    phoneProp(t);
    // her, wrapped in the blanket, head and hands out
    const blow = smooth01(t, 206.3, 206.5, T_SLURP - .15, T_SLURP), slurp = seg(t, T_SLURP, T_SLURP + .3), chew = t > T_SLURP + .25 && t < T_MOMO - .1;
    const md = mood(t, [[206.0, 'closed', null, 'o'], [T_SLURP + .25, 'happy', null, 'cat'], [T_MOMO + .1, 'normal', null, 'o'], [T_MOMO + .75, 'happy', null, 'smile'], [211.5, 'closed', null, 'smile']]);
    const chewK = chew ? Math.abs(Math.sin((t - T_SLURP) * Math.PI / BEAT * 2)) : 0;
    const snug = ease(seg(t, 211.2, 212.4)), look = t > T_MOMO && t < 211.3 ? ease(seg(t, T_MOMO, T_MOMO + .3)) * (1 - ease(seg(t, 210.9, 211.3))) : 0;
    const gx = HX4, gy = GY4 + .06 * chewK * HS4, s = HS4;
    // back part of the blanket (around the shoulders, behind her head)
    starBlanket([[gx - 2.9 * s, gy - 4.4 * s], [gx - 1.6 * s, gy - 5.2 * s], [gx + 1.6 * s, gy - 5.2 * s], [gx + 2.9 * s, gy - 4.4 * s], [gx + 3.9 * s, gy - 1.2 * s], [gx + 4.1 * s, gy + .9 * s], [gx - 4.1 * s, gy + .9 * s], [gx - 3.9 * s, gy - 1.2 * s]], { seed: 2, n: 16, star: 14 });
    hero(gx, gy, s, { outfit: 'pajama', sit: true, noShadow: true, ...md, blush: .5 + .4 * (chew ? 1 : 0) + .3 * look, ahoge: 'normal', lookX: .85 * look, lookY: -.1 * blow + .2 * look,
      tilt: -.05 * blow + .1 * snug + .03 * Math.sin(t * 1.3) + .12 * look, sq: .02 * Math.sin(t * 1.6) + .03 * chewK, aL: -1.2, aR: -1.2, dy: -.05 * chewK,
      head: (u, sw) => { if (chew) for (const sd of [-1, 1]) paint(ellPts(sd * 1.55 * u, 1.0 * u, .55 * u, .45 * u, 12), { fill: '#F59CA8', fillOp: 90, bleed: .2, ink: null }); } });
    // front of the blanket: wrapped around her, open a little at the front where her hands come out
    const fr = [[gx - 2.7 * s, gy - 4.55 * s], [gx - 1.0 * s, gy - 4.3 * s], [gx - .45 * s, gy - 4.0 * s], [gx + .25 * s, gy - 2.4 * s], [gx + .45 * s, gy - .2 * s], [gx + .3 * s, gy + 1.0 * s], [gx - 4.3 * s, gy + 1.05 * s], [gx - 4.05 * s, gy - 1.6 * s]];
    starBlanket(fr, { seed: 5, n: 10, star: 13 });
    starBlanket(fr.map(([x, y]) => [2 * gx - x, y]), { seed: 9, n: 10, star: 13 });
    inkLine([[gx + .45 * s, gy - 4.0 * s], [gx - .25 * s, gy - 2.4 * s], [gx - .45 * s, gy - .2 * s]], 1.6, '#FFF1A8', 'marker', .4, .45);
    // 团子 curled up in her lap
    const purr = .025 * Math.sin(t * 40) * seg(t, 210.5, 211);
    cat(gx + .3 * s, gy + 1.05 * s, 32, { pose: 'sleep', eyes: 'happy', zzz: false, sq: .03 * Math.sin(t * 1.4) + purr, tail: .2 * Math.sin(t * .8) });
    // the bowl in both hands, the chopsticks (blowing, slurping, chewing)
    const bx = gx + .1 * s, by = gy - 2.35 * s + 4 * Math.sin(t * 1.6);
    noodleBowl(bx, by + .65 * s, 1.08);
    for (const sd of [-1, 1]) paint(ellPts(bx + sd * 1.15 * s, by + .15 * s, .42 * s, .38 * s, 12), { wash: SKIN_C, ink: PAL.ink, sw: 1.1 });
    const lift = t < T_SLURP + .3 ? smooth01(t, 206.0, 206.3, T_SLURP + .2, T_SLURP + .5) : 0;
    const tipX = lerp(bx + .45 * s, gx + .55 * s, lift), tipY = lerp(by - .05 * s, gy - 4.55 * s, lift), hx2 = bx + 1.2 * s, hy2 = by + .1 * s;
    for (const d of [-6, 6]) { const p0 = [hx2 + 30, hy2 + 22 + d * .2], p1 = [tipX + d * .5, tipY + d * .4]; inkLine([p0, p1], 1.6, PAL.ink, 'marker', 0); inkLine([p0, p1], .9, '#D9A56A', 'marker', 0); }
    paint(ellPts(hx2, hy2 + 6, .42 * s, .38 * s, 12), { wash: SKIN_C, ink: PAL.ink, sw: 1.1 });
    if (lift > .05) {                                                                           // noodles hanging off the chopsticks, slurped up
      const top = lerp(tipY, gy - 5.35 * s, slurp), len = (1 - slurp) * .95 * s * lift + 4;
      for (let k = 0; k < 4; k++) inkLine([[tipX - 5 + k * 3.5, top], [tipX - 7 + k * 4.5 + Math.sin(t * 5 + k) * 3, tipY + len * .55], [tipX - 3 + k * 3.5, tipY + len]], 1.5, '#F7D98E', 'marker', .6);
    }
    if (blow > .1) for (let k = 0; k < 3; k++) { const a = frac(t * 2 + k / 3); inkLine([[gx + .5 * s + a * 50, gy - 5.3 * s + k * 12], [gx + .5 * s + a * 50 + 22, gy - 5.3 * s + k * 12 - 4]], 1.2, '#FFF6E6', 'fine', 0, blow * Math.sin(a * Math.PI)); }
    camEnd();
    // light: a dark blue room; the bowl's warmth and the phone's pink glow; then warm light slowly wraps them
    const wr = lerp(560, 1500, wk);
    lightMap(cam, mixCol('#2A3068', '#4A3456', wk * .8), [[300, 300, 700, '#5A6AAA', .45 * (1 - wk * .5)], [bx, by, 520, '#FFD6A0', .7 + .1 * Math.sin(t * 2)],
      [PH4.x, PH4.y - 150, 460, '#FFB8D0', .55 + .35 * seg(t, T_MOMO, T_MOMO + .3)], [gx + 80, gy - 2.8 * s, wr, '#FFB070', .12 + .72 * wk], [gx - 60, gy - 5.6 * s, 380, '#FFE6C4', .25 + .3 * wk]]);
    camBegin(cam[0], cam[1], cam[2]);
    fl.forEach(([x, y], i) => { if (i % 2) return; const on = .6 + .4 * Math.sin(t * 2 + i * 1.7); glow(x, y + 12, 30, ['#FFD98A', '#FFB3C6', '#FFE7A8'][i % 3], .6 * on); dot(x, y + 12, 6, ['#FFE7A8', '#FFC9D8', '#FFF3C4'][i % 3], .95); });
    light(gx + 40, gy - 3.2 * s, lerp(300, 900, wk), '#FFB46A', .14 * wk);                      // the warm cocoon
    light(gx + 40, gy - 3.6 * s, 420, '#FFE2B0', .1 * wk);
    light(gx + 60, gy - 3.4 * s, lerp(400, 1150, wk), '#FFA040', .55 * wk, 'soft-light');       // golden warmth without haze
    steamWisps(bx, by - .2 * s, t - 206, 4, 120, 260, .55 * (1 - lift * .7), 11);
    light(PH4.x, PH4.y - 150, 240, '#FF9FC0', .12 + .18 * seg(t, T_MOMO, T_MOMO + .3));
    // warm motes drifting up as the light wraps them
    for (let i = 0; i < 16; i++) {
      const a = frac(t * (.06 + hash(i) * .05) + hash(i * 3.3)), x = gx - 520 + hash(i * 7.1) * 1100 + Math.sin(t * .7 + i) * 26, y = 980 - a * 820;
      const k = wk * Math.sin(a * Math.PI);
      if (k > .02) { glow(x, y, 18, '#FFD9A0', .5 * k); dot(x, y, 2.6, '#FFF3D0', .9 * k); }
    }
    // a small heart floats up from her
    const ha = t - T_HEART;
    if (ha > 0) {
      const hk = backOut(seg(ha, 0, .4)) * (1 - seg(ha, 3.3, 3.9)), hx = gx + 1.3 * s + Math.sin(ha * 2) * 22, hy = gy - 10.0 * s - ha * 30;
      glow(hx, hy, 70 * hk, '#FFB0C8', .45);
      paint(heartPts(hx, hy, 26 * hk), { wash: '#F05A88', fill: '#FF9FC0', fillOp: 60, ink: PAL.ink, sw: .9 });
      paint(heartPts(hx - 7 * hk, hy - 8 * hk, 7 * hk), { wash: '#FFC6DA', ink: null });
    }
    camEnd();
    vignette(.45 - .15 * wk, '#0A0C22');
  }

  // =====================================================================================================
  // 5 · REST STOP (213.756–218.556): a world drawn on a ruled notebook page. A pencil path winds from the bottom left
  //     to a faint sunrise. Halfway, she rests on a bench; tiny 桃桃 hands her a bookmark, she slips it into her
  //     notebook, closes it, hugs it and looks ahead at the dawn. The path goes on (glowing dashes ahead).
  // =====================================================================================================
  const SUN5 = [1500, 486];
  const PATH5 = [[330, 1160, 460], [520, 990, 330], [720, 880, 250], [930, 842, 190], [1120, 760, 130], [1260, 660, 84], [1380, 570, 44], [1500, 492, 6]];
  const BENCH5 = { x: 1010, y: 770, w: 330 };                          // bench centre x, ground y
  const HX5 = 950, HS5 = 38, MX5 = 1098, MS5 = 13;
  const T_GIVE = B(358), T_SLIP = B(359), T_CLOSE = B(360), T_LOOK = B(361) + .1, T_POINT = B(361);
  const pathPt = u => {                                                // u 0..1 along the path → [x, y, width]
    const f = clamp(u) * (PATH5.length - 1), i = Math.min(PATH5.length - 2, Math.floor(f)), k = f - i;
    const P = j => PATH5[clamp(j, 0, PATH5.length - 1)], a = P(i), b = P(i + 1), a0 = P(i - 1), b1 = P(i + 2);
    const cr = (p0, p1, p2, p3) => .5 * (2 * p1 + (-p0 + p2) * k + (2 * p0 - 5 * p1 + 4 * p2 - p3) * k * k + (-p0 + 3 * p1 - 3 * p2 + p3) * k * k * k);
    return [cr(a0[0], a[0], b[0], b1[0]), cr(a0[1], a[1], b[1], b1[1]), lerp(a[2], b[2], k)];
  };
  const PEN = '#5C5A70';
  function paperWorld(t) {
    const dawn = ease(seg(t, 213.4, 218.6));
    // sky wash: indigo → lilac → peach at the horizon, brightening toward dawn; the notebook's ruled lines show through
    paint([[-400, -400], [W + 400, -400], [W + 400, 520], [-400, 520]], { grad: [mixCol('#4A5496', '#6E76B6', dawn), mixCol('#EBB29C', '#FBC99A', dawn), Math.PI / 2], washOp: 220, tex: .45, ink: null });
    for (let y = 40; y < H + 60; y += 46) fillRectA(-400, y, W + 800, 1.6, '#9CB8E0', .3);          // printed rules: straight
    fillRectA(119, -400, 1.8, H + 800, '#F08C9C', .35);
    glow(SUN5[0], SUN5[1], 1000, '#FFCF8E', .5 + .25 * dawn);
    glow(SUN5[0], SUN5[1], 320, '#FFF0C8', .6 + .3 * dawn);
    starField(t, { x: -200, y: -300, w: 1500, h: 600 }, 30, { seed: 5, a: .8 * (1 - dawn * .7) });
    // the sun peeking over the horizon, with pencil rays
    const sr = 70 + 8 * dawn;
    paint(ellPts(SUN5[0], SUN5[1] + 6, sr, sr, 28).filter(p => p[1] <= SUN5[1] + 8), { wash: '#FFE7B0', washOp: 230, ink: PEN, br: 'pencil', sw: 1 });
    for (let i = 0; i < 11; i++) { const a = Math.PI + (i + .5) / 11 * Math.PI, r0 = sr + 26, r1 = sr + 70 + 30 * Math.sin(t * 2 + i) * .3 + 30 * dawn; inkLine([[SUN5[0] + Math.cos(a) * r0, SUN5[1] + Math.sin(a) * r0], [SUN5[0] + Math.cos(a) * r1, SUN5[1] + Math.sin(a) * r1]], .9, '#E0A060', 'pencil', 0); }
    // hills: far lilac band, middle sage, near meadow
    const hill = (y0, amp, f, ph) => { const p = [[-400, H + 400]]; for (let x = -400; x <= W + 400; x += 80) p.push([x, y0 + Math.sin(x * f + ph) * amp + Math.sin(x * f * 2.3 + ph * 2) * amp * .35]); p.push([W + 400, H + 400]); return p; };
    paint(hill(500, 16, .004, 1), { wash: '#A2A2CE', washOp: 215, tex: .4, ink: PEN, br: 'pencil', sw: .9 });
    paint(hill(575, 30, .0032, 2.6), { wash: '#B0CBA8', washOp: 225, tex: .45, ink: PEN, br: 'pencil', sw: .9 });
    paint(hill(700, 24, .0026, .4), { wash: '#CBDDB2', washOp: 228, tex: .45, ink: PEN, br: 'pencil', sw: .9 });
    // lollipop trees, smaller toward the horizon
    for (const [tx, ty, ts, i] of [[250, 700, 1.3, 0], [470, 610, .9, 1], [1680, 640, 1.0, 2], [1820, 700, 1.4, 3], [1290, 560, .55, 4], [1700, 540, .5, 5], [760, 580, .6, 6]]) {
      const sw = Math.sin(t * 1.3 + i) * .03;
      push(); translate(tx, ty); rotate(sw);
      inkLine([[0, 0], [0, -80 * ts]], 3.2 * ts, '#B88A60', 'marker', 0); inkLine([[0, 0], [0, -80 * ts]], .6, PEN, 'pencil', 0);
      paint(cloudPts(0, -100 * ts, 120 * ts, 70 * ts, i + 3, 5).map(([x, y]) => [x, y - 20 * ts]), { wash: ['#9CCB9A', '#B3D69A', '#A6D0B0'][i % 3], washOp: 225, fill: '#7EAE82', fillOp: 50, tex: .5, ink: PEN, br: 'pencil', sw: .9, curv: .4 });
      pop();
    }
    // the path: a band that narrows to the sunrise, with the dashed line she has been walking
    const L = [], R = [];
    for (let i = 0; i <= 40; i++) { const [x, y, w] = pathPt(i / 40), [x2, y2] = pathPt(Math.min(1, i / 40 + .01)), a = Math.atan2(y2 - y, x2 - x); L.push([x + Math.sin(a) * w / 2, y - Math.cos(a) * w / 2]); R.push([x - Math.sin(a) * w / 2, y + Math.cos(a) * w / 2]); }
    paint(L.concat(R.reverse()), { wash: '#F5E6C8', washOp: 235, fill: '#E3CFA6', fillOp: 45, tex: .4, ink: null });
    inkLine(L, 1.1, PEN, 'pencil', .3); inkLine(R.slice().reverse(), 1.1, PEN, 'pencil', .3);
    for (let i = 0; i < 26; i++) { const u = i / 26 + .01, [x, y, w] = pathPt(u), sd = i % 2 ? 1 : -1; paint(ellPts(x + sd * (w / 2 + 8 + 4 * hash(i)), y + 6, 7 * (1.2 - u), 4 * (1.2 - u), 8), { ink: PEN, sw: .6, br: 'pencil' }); }
    for (let i = 0; i < 30; i++) {
      const u0 = i / 30, u1 = u0 + .016, [x0, y0, w0] = pathPt(u0), [x1, y1] = pathPt(u1), ahead = u0 > .5;
      const step = Math.floor((u0 - .5) * 30 / 3.5), lit = ahead ? seg(t, B(361.5 + step * .5), B(361.5 + step * .5) + .25) : 0;
      inkLine([[x0, y0], [x1, y1]], 1.4 * (w0 / 200 + .3), ahead ? mixCol(PEN, '#F0A040', lit) : PEN, 'ink', 0, .8);
      if (lit > .05) { glow(x0, y0, 40 * (w0 / 200 + .4), '#FFD27A', .75 * lit); dot(x0, y0, 3 * (w0 / 200 + .4), '#FFF3C8', lit); }
    }
    for (let i = 0; i < 9; i++) { const u = .05 + i * .05, [x, y, w] = pathPt(u), sd = i % 2 ? .2 : -.2, sc = 1.3 - u; paint(ellPts(x + sd * w, y, 8 * sc, 12 * sc, 8, 0, -.6), { wash: '#C9B492', washOp: 150, ink: null }); }   // footprints
    // two little pencil birds flying ahead toward the sunrise
    for (let i = 0; i < 3; i++) {
      const u = seg(t, 215.6 + i * .5, 218.9 + i * .4); if (u <= 0 || u >= 1) continue;
      const bx = lerp(820 + i * 70, SUN5[0] - 60 + i * 50, u), by = lerp(330 - i * 40, SUN5[1] - 150 - i * 30, u) + Math.sin(u * 9 + i) * 10, fl = Math.sin(t * 14 + i * 2) * 7, sc = 1.2 - .6 * u;
      inkLine([[bx - 16 * sc, by - fl * sc], [bx - 5 * sc, by - 2 * sc], [bx, by + 3 * sc], [bx + 5 * sc, by - 2 * sc], [bx + 16 * sc, by - fl * sc]], 1.1, PEN, 'pencil', .5);
    }
    // grass tufts
    for (let i = 0; i < 22; i++) {
      const x = hash(i * 4.1) * W, y = 720 + hash(i * 2.7) * 330, [px, py, pw] = pathPt(clamp((y - 1160) / (492 - 1160))); if (Math.abs(x - px) < pw * .7) continue;
      const sw = Math.sin(t * 2 + i) * 3;
      inkLine([[x - 8, y], [x - 12 + sw, y - 20]], .8, '#6E9A70', 'pencil', 0); inkLine([[x, y], [x + sw, y - 26]], .8, '#6E9A70', 'pencil', 0); inkLine([[x + 8, y], [x + 12 + sw, y - 18]], .8, '#6E9A70', 'pencil', 0);
    }
  }
  function bench5(t, back) {
    const { x, y, w } = BENCH5, WD = '#C99A6A', WDK = '#9A6A42';
    if (back) {
      for (const dy of [0, 44]) paint(rrPts(x - w / 2 + 12, y - 196 + dy, w - 24, 30, 8), { wash: WD, fill: WDK, fillOp: 60, tex: .5, ink: PAL.ink, sw: 1 });
      for (const sx of [-1, 1]) paint(rectPts(x + sx * (w / 2 - 34) - 7, y - 200, 14, 110), { wash: WDK, ink: PAL.ink, sw: .8 });
      return;
    }
    paint(ellPts(x, y + 4, w * .6, 16, 16), { fill: PAL.ink, fillOp: 50, bleed: .2, ink: null });
    for (const sx of [-1, 1]) paint(rectPts(x + sx * (w / 2 - 34) - 8, y - 84, 16, 84), { wash: WDK, ink: PAL.ink, sw: .9 });
    paint(rrPts(x - w / 2, y - 100, w, 26, 8), { wash: WD, fill: WDK, fillOp: 60, tex: .5, ink: PAL.ink, sw: 1.1 });
  }
  // the notebook in her lap (body-local): open → closed → hugged; the ribbon bookmark with a star charm
  function notebook5(t, s, sw) {
    const cl = seg(t, T_CLOSE - .15, T_CLOSE + .05), hug = ease(seg(t, T_CLOSE + .1, T_CLOSE + .5));
    push(); translate(0, lerp(-1.75, -3.0, hug) * s);
    if (cl < 1) {
      const wv = lerp(1.9, .95, easeIn(cl));
      paint([[-wv * s, -.1 * s], [0, .15 * s], [wv * s, -.1 * s], [wv * s * .98, .75 * s], [0, .95 * s], [-wv * s * .98, .75 * s]], { wash: '#6F86B8', ink: PAL.ink, sw: sw * .7 });
      paint([[-wv * s * .94, -.25 * s], [0, .05 * s], [wv * s * .94, -.25 * s], [wv * s * .92, .62 * s], [0, .82 * s], [-wv * s * .92, .62 * s]], { wash: '#FFFBF2', ink: PAL.ink, sw: sw * .6 });
      inkLine([[0, .05 * s], [0, .82 * s]], sw * .5, PAL.ink, 'fine', 0);
      if (cl < .3) for (let k = 0; k < 3; k++) inkLine([[-wv * s * .75, (.1 + k * .18) * s], [-wv * s * .2, (.2 + k * .18) * s]], sw * .35, '#9A98B0', 'pencil', 0);
      if (t > T_SLIP) { inkLine([[0, .1 * s], [.05 * s, 1.2 * s]], sw * 1.6, '#F05A88', 'marker', 0); paint(starPts(.05 * s, 1.35 * s, .2 * s, .45, 5), { wash: '#FFE59A', ink: PAL.ink, sw: sw * .4 }); }
    } else {
      paint(rrPts(-.85 * s, -.55 * s, 1.7 * s, 1.35 * s, .12 * s), { wash: '#8DA3D1', fill: '#6F86B8', fillOp: 70, tex: .4, ink: PAL.ink, sw: sw * .8 });
      paint(starPts(0, .1 * s, .28 * s, .45, 5), { wash: '#F6C85F', ink: PAL.ink, sw: sw * .4 });
      inkLine([[.4 * s, -.55 * s], [.45 * s, -.95 * s], [.6 * s, -1.2 * s]], sw * 1.5, '#F05A88', 'marker', .5);
      paint(starPts(.62 * s, -1.3 * s, .18 * s, .45, 5, Math.sin(t * 3) * .3), { wash: '#FFE59A', ink: PAL.ink, sw: sw * .4 });
    }
    pop();
    return hug;
  }
  function restStop(t, lt, dur) {
    const cam = [kf(t, [[213.3, 990], [216.2, 1000], [218.8, 1075]], easeInOut), kf(t, [[213.3, 575], [216.2, 572], [218.8, 548]], easeInOut), kf(t, [[213.3, 1.85], [216.2, 1.7], [218.8, 1.0]], easeInOut)];
    camBegin(cam[0], cam[1], cam[2]);
    paperWorld(t);
    bench5(t, true);
    // her: resting, the notebook in her lap; takes the bookmark, slips it in, closes the book, hugs it, looks at the dawn
    const give = seg(t, T_GIVE - .35, T_GIVE);
    const md = mood(t, [[213.5, 'normal', null, 'tiny'], [T_GIVE - .4, 'normal', null, 'o'], [T_GIVE, 'happy', null, 'smile'], [T_SLIP + .1, 'normal', null, 'smile'], [T_CLOSE + .3, 'closed', null, 'smile'], [T_LOOK, 'normal', null, 'smile'], [B(363), 'happy', null, 'smile']]);
    const reachR = Math.sin(clamp((t - (T_GIVE - .3)) / (T_SLIP - T_GIVE + .3)) * Math.PI);
    const hugK = ease(seg(t, T_CLOSE + .1, T_CLOSE + .5)), lookAhead = ease(seg(t, T_LOOK, T_LOOK + .5));
    const gy = BENCH5.y - 100 + 1.3 * HS5;
    hero(HX5, gy, HS5, { outfit: 'pajama', sit: true, noShadow: true, ...md, blush: .5, ahoge: t > T_LOOK + .3 ? 'perk' : 'normal',
      lookX: lookAhead * .8 + (t > T_GIVE - .5 && t < T_SLIP ? .6 : 0) * (1 - lookAhead), lookY: lookAhead * -.35 + (1 - lookAhead) * (t < T_GIVE - .5 || (t > T_SLIP && t < T_CLOSE + .2) ? .5 : .1),
      tilt: .05 * Math.sin(t * 1.1) + .08 * lookAhead, sq: .02 * Math.sin(t * 1.7) - .04 * pulse(t, 3) * hugK, walk: t * .6,
      aL: lerp(-1.75, -2.25, hugK), aR: lerp(lerp(-1.75, -.45, reachR), -2.25, hugK),
      draw: (s, sw) => { notebook5(t, s, sw); } });
    // tiny 桃桃 beside her on the bench, holding up the bookmark, then pointing ahead
    const point = ease(seg(t, T_POINT, T_POINT + .3)), holding = t < T_GIVE + .05;
    const mm = mood(t, [[213.5, 'happy'], [T_GIVE + .1, 'normal'], [T_POINT, 'happy']]);
    momo(MX5, BENCH5.y - 100 + 1.3 * MS5, MS5, { sit: true, noShadow: true, ...mm, mouth: 'smile', blush: .8, walk: t * 1.1, lookX: holding ? -.6 : .5, tilt: -.08 + .05 * Math.sin(t * 2),
      aL: holding ? lerp(-.9, .9, give) : -1.1, aR: point > 0 ? lerp(-1.0, .55, point) : -1.0, dy: -.25 * pulse(t, 4),
      handL: holding ? (s, sw) => { push(); rotate(-lerp(-.9, .9, give)); inkLine([[0, 0], [.15 * s, -1.4 * s], [.1 * s, -2.4 * s]], sw * 2.2, '#F05A88', 'marker', .5); paint(starPts(.1 * s, -2.75 * s, .62 * s, .45, 5, Math.sin(t * 4) * .3), { wash: '#FFE59A', ink: PAL.ink, sw: sw * .6 }); glow(.1 * s, -2.75 * s, 1.6 * s, '#FFF1C2', .4); pop(); } : null });
    // the bookmark travels from 桃桃's hand to hers and into the book
    if (t > T_GIVE + .05 && t < T_SLIP) {
      const k = ease(seg(t, T_GIVE + .05, T_SLIP)), x = lerp(MX5 - 40, HX5 + 20, k), y = lerp(BENCH5.y - 170, gy - 1.9 * HS5, k) - Math.sin(k * Math.PI) * 30;
      inkLine([[x, y], [x + 3, y + 30]], 3, '#F05A88', 'marker', 0); paint(starPts(x + 4, y + 38, 9, .45, 5), { wash: '#FFE59A', ink: PAL.ink, sw: .6 });
    }
    bench5(t, false);
    if (t > T_CLOSE && t < T_CLOSE + .5) sparkle(HX5 + 20, gy - 2.6 * HS5, 14, '#FFF3C0', seg(t, T_CLOSE, T_CLOSE + .5));
    // morning light touching them
    light(SUN5[0], SUN5[1], 1300, '#FFD9A8', .1 + .1 * ease(seg(t, 216, 218.6)));
    camEnd();
    vignette(.3, '#3A3060');
  }

  // =====================================================================================================
  // 6 · TIRED, NOT DONE (218.556–225.756, painted until ~226.0): the reverse angle of her room at 3 a.m. She has dozed
  //     off at the desk hugging her notebook. Tiny 桃桃 (stepped out of the screen) and 团子 tug the star blanket's
  //     corners up over her shoulders. Her ahoge curls into a heart; a dream bubble fills with her small loves;
  //     a warm glow grows from the dream and brightens toward the white flash of the final chorus.
  // =====================================================================================================
  const HX6 = 900, HS6 = 48, HEADY6 = 746, GY6 = HEADY6 + 6.7 * HS6;
  const T_PULL = 218.75, T_DRAPE = B(367), T_HEART6 = B(367) + .5, T_BUBBLE = B(368) + .1, T_GLOW = 224.3;
  const BUB = { x: 1310, y: 408, w: 620, h: 370 };
  const MOMO6 = [HX6 - 4.7 * HS6, 936], MS6 = 15, CAT6 = [HX6 + 5.6 * HS6, 946], CS6 = 26;
  // the blanket over her back (behind her), its top edge rising as it is pulled up over her shoulders
  const BL_BACK = [[-4.75, 922], [-4.3, 820], [-3.6, 752], [-2.2, 700], [0, 684], [2.2, 700], [3.7, 752], [4.4, 820], [4.95, 925], [3.0, 940], [0, 946], [-3.0, 940]];
  const LOVES = ['star', 'paw', 'drawing', 'candy', 'pencil', 'pixel', 'note', 'soda'];     // her small loves (as in chapter 3)
  function love(kind, x, y, sc, t, i) {
    push(); translate(x, y); rotate(Math.sin(t * 1.3 + i) * .15); scale(sc);
    if (kind === 'star') { pop(); idea(x, y, 18 * sc, { eyes: 'happy', seed: i }); return; }
    if (kind === 'paw') { paint(ellPts(0, 8, 20, 16, 14), { wash: '#F6A8BE', ink: PAL.ink, sw: .8 }); for (const [dx, dy] of [[-20, -12], [-7, -22], [7, -22], [20, -12]]) paint(ellPts(dx, dy, 7, 8, 10), { wash: '#F6A8BE', ink: PAL.ink, sw: .7 }); }
    else if (kind === 'drawing') { paint(rectPts(-30, -34, 60, 68, 1), { wash: '#FFFBF2', ink: PAL.ink, sw: .8 }); paint(ellPts(0, -2, 14, 13, 14), { ink: '#8A8AA0', sw: .6, br: 'pencil' }); for (const sd of [-1, 1]) paint(ellPts(sd * 16, 6, 5, 12, 8), { ink: '#F29BB8', sw: .6, br: 'pencil' }); dot(-5, -3, 1.6, PAL.ink); dot(5, -3, 1.6, PAL.ink); }
    else if (kind === 'candy') { paint(ellPts(0, 0, 18, 15, 14), { wash: '#F05A6E', ink: PAL.ink, sw: .8 }); for (const sd of [-1, 1]) paint([[sd * 16, 0], [sd * 34, -12], [sd * 30, 0], [sd * 34, 12]], { wash: '#FFC6D0', ink: PAL.ink, sw: .6 }); for (let k = 0; k < 4; k++) dot(-8 + k * 5, -4 + (k % 2) * 7, 1.5, '#FFF3C4'); paint([[-4, -15], [4, -15], [0, -21]], { wash: '#7FC08A', ink: null }); }
    else if (kind === 'pencil') { pop(); pencil(x + 18 * sc, y + 30 * sc, .42 * sc, .7 + Math.sin(t * 1.3 + i) * .15, '#F6C85F'); return; }
    else if (kind === 'pixel') { const P = ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...']; P.forEach((r, ry) => [...r].forEach((c, rx) => { if (c === 'X') paint(rectPts(-24 + rx * 7, -20 + ry * 7, 7, 7), { wash: ry < 2 && rx < 3 ? '#FF8FB0' : '#F05A88', ink: null }); })); }
    else if (kind === 'note') { paint(ellPts(-8, 14, 11, 8, 12, 0, -.35), { wash: '#7B6AB0', ink: PAL.ink, sw: .7 }); inkLine([[2, 12], [2, -24], [18, -16]], 2.6, '#7B6AB0', 'marker', 0); inkLine([[2, 12], [2, -24], [18, -16]], .6, PAL.ink, 'fine', 0); }
    else if (kind === 'soda') { pop(); sodaCan(x, y + 26 * sc, .52 * sc, { drops: .5, rot: Math.sin(t * 1.3 + i) * .15 }); return; }
    pop();
  }
  function dreamBubble(t) {
    const k = backOut(seg(t, T_BUBBLE + .45, T_BUBBLE + .95)); if (t < T_BUBBLE) return 0;
    // three little bubbles rising from her head
    [[HX6 + 2.4 * HS6, HEADY6 - 2.9 * HS6, 14], [HX6 + 3.7 * HS6, HEADY6 - 4.3 * HS6, 22], [HX6 + 5.3 * HS6, HEADY6 - 5.9 * HS6, 32]].forEach(([x, y, r], i) => {
      const kk = backOut(seg(t, T_BUBBLE + i * .14, T_BUBBLE + i * .14 + .25));
      if (kk > .01) { glow(x, y, r * 2.2 * kk, '#FFF1DC', .35); paint(ellPts(x, y + Math.sin(t * 2 + i) * 3, r * kk, r * kk, 14), { wash: '#FFF8F0', washOp: 200, ink: PAL.ink, sw: .8 }); }
    });
    if (k < .01) return 0;
    const gk = seg(t, T_GLOW, 225.9), beat = 1 + .018 * pulse(t, 5) * seg(t, 222.5, 223.5);
    const { x, y, w, h } = BUB, bw = w * k * beat, bh = h * k * beat;
    glow(x, y, (w * .75 + 400 * gk) * k, '#FFE2B8', .45 + .4 * gk);
    const pts = []; for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, r = 1 + .07 * Math.sin(i * 2.7) + .03 * Math.sin(t * 2 + i); pts.push([x + Math.cos(a) * bw / 2 * r, y + Math.sin(a) * bh / 2 * r]); }
    paint(pts, { wash: '#FFF6EE', washOp: 235, fill: '#F6DDF0', fillOp: 70, bleed: .05, tex: .3, border: .4, ink: PAL.ink, sw: 1.2, curv: .7 });
    clipTo(pts.map(([px, py]) => [x + (px - x) * .97, y + (py - y) * .97]), () => {
      paint(rectPts(x - bw, y - bh, bw * 2, bh * 2), { grad: ['#EADCF6', '#FFE6D6', Math.PI / 2], washOp: 170, ink: null });
      glow(x, y + bh * .1, bw * .5, '#FFF3DC', .6);
      for (let i = 0; i < 6; i++) sparkle(x + Math.cos(i * 2.3 + t * .3) * bw * .4, y + Math.sin(i * 1.7 + t * .4) * bh * .35, 8, '#FFF3C0', frac(t * .5 + i * .17));
      // her small loves float round in a slow ring, one popping in on each beat
      LOVES.forEach((kind, i) => {
        const bt = i === 0 ? T_BUBBLE + .6 : B(368 + i), kk = backOut(seg(t, bt, bt + .35)); if (kk < .01) return;
        const a = i / LOVES.length * TAU + t * .3, lx = x + Math.cos(a) * bw * .345, ly = y + Math.sin(a) * bh * .29 + Math.sin(t * 2.1 + i) * 8;
        glow(lx, ly, 56 * kk, '#FFF6D8', .55);
        love(kind, lx, ly, (.95 + .15 * Math.sin(a)) * kk * 1.62, t, i);
      });
    });
    return k;
  }
  function tiredNotDone(t, lt, dur) {
    const end = easeIn(seg(t, 224.2, 226.0));
    const cam = [kf(t, [[218.2, 940], [220.45, 958], [222.65, 1075], [225.0, 1100]], easeInOut) + 50 * end, kf(t, [[218.2, 760], [220.45, 746], [222.65, 640], [225.0, 622]], easeInOut) - 36 * end,
      kf(t, [[218.2, 1.5], [220.45, 1.43], [222.65, 1.08], [225.0, 1.13]], easeInOut) + .09 * end];
    camBegin(cam[0], cam[1], cam[2]);
    roomReverse(t, { night: 1, lamp: .2, screen: .6, clock: 3.2 });
    // her chair behind her
    paint(rrPts(HX6 - 2.4 * HS6, HEADY6 - 1.2 * HS6, 4.8 * HS6, 5 * HS6, 1.2 * HS6), { wash: '#8E7BB8', fill: '#6E5E96', fillOp: 70, tex: .4, ink: PAL.ink, sw: 1.2 });
    // the blanket over her back: 桃桃 and 团子 pull its corners forward over her shoulders and tuck her in
    const pull = easeInOut(seg(t, T_PULL, T_DRAPE)), settle = t > T_DRAPE ? Math.exp(-(t - T_DRAPE) * 5) * Math.sin((t - T_DRAPE) * 14) : 0;
    const back = BL_BACK.map(([ux, uy], i) => [HX6 + ux * HS6, uy + (1 - pull) * (i > 1 && i < 7 ? 70 : 20) + settle * 10 * Math.sin(i * .9) + (i > 1 && i < 7 ? 5 * Math.sin(t * 5 + i) * (1 - pull) : 0)]);
    starBlanket(back, { seed: 21, n: 16, star: 13, curv: .45 });
    // her, asleep; the ahoge curls into a heart once she is tucked in
    const hk = t > T_HEART6 ? 1 : 0, hAge = t - T_HEART6;
    const breathe = Math.sin(t * 1.5);
    hero(HX6, GY6, HS6, { outfit: 'pajama', sit: true, noShadow: true, eyes: 'closed', mouth: t > T_DRAPE + .2 ? 'smile' : 'tiny', blush: .7 + .3 * pull, ahoge: hk ? 'heart' : 'droop',
      tilt: .36 + .02 * breathe, sq: .015 * breathe + (hAge > 0 && hAge < .4 ? .08 * Math.sin(hAge / .4 * Math.PI) : 0), aL: -1.2, aR: -1.2, dy: .04 * breathe });
    deskFront(t, {});
    // the notebook she hugs, and her folded arms on the desk
    push(); translate(HX6 - 10, 912); rotate(-.06);
    paint(rrPts(-165, -58, 330, 118, 10), { wash: '#8DA3D1', fill: '#6F86B8', fillOp: 70, tex: .4, ink: PAL.ink, sw: 1.1 });
    paint(rrPts(-160, 48, 320, 10, 3), { wash: '#FFFBF2', ink: PAL.ink, sw: .6 });
    paint(starPts(-110, -18, 18, .45, 5), { wash: '#F6C85F', ink: PAL.ink, sw: .6 });
    inkLine([[160, 8], [186, 20], [204, 36]], 3, '#F05A88', 'marker', .5); paint(starPts(210, 44, 10, .45, 5, Math.sin(t * 2) * .3), { wash: '#FFE59A', ink: PAL.ink, sw: .5 });
    pop();
    const s = HS6;
    paint(capsule(HX6 - 3.1 * s, 918 + 2 * breathe, HX6 + 1.0 * s, 896, .66 * s, .6 * s), { wash: PJ, fill: PJ_DK, fillOp: 70, tex: .35, border: .3, ink: PAL.ink, sw: 1.1 });
    paint(capsule(HX6 + 3.2 * s, 926 + 2 * breathe, HX6 - .7 * s, 902, .66 * s, .6 * s), { wash: PJ, fill: PJ_DK, fillOp: 70, tex: .35, border: .3, ink: PAL.ink, sw: 1.1 });
    paint(ellPts(HX6 - 1.0 * s, 900, .42 * s, .36 * s, 12), { wash: SKIN_C, ink: PAL.ink, sw: 1 });
    for (const [px, py] of [[HX6 - 2.2 * s, 912], [HX6 + 2.3 * s, 918], [HX6 + .4 * s, 900]]) paint(starPts(px, py, .2 * s, .45, 5), { wash: '#FFF3C4', ink: null });
    // the front flaps come over her shoulders, their corners held by the helpers
    const catX = CAT6[0] + 40 * pull, mouth = [catX - 2.4 * CS6 * 1.0, CAT6[1] - 3.1 * CS6 + .62 * CS6];
    const cL = [lerp(HX6 - 4.2 * s, HX6 - 5.0 * s, pull), lerp(850, 922, pull)], cR = t < T_DRAPE + .15 ? [mouth[0] + 4, mouth[1] + 10] : [HX6 + 5.3 * s, 928];
    for (const [sd, c] of [[-1, cL], [1, cR]]) {
      const f = [[HX6 + sd * 2.85 * s, 842 - 30 * pull], [HX6 + sd * 3.9 * s, 800 - 24 * pull], [lerp(HX6 + sd * 4.6 * s, c[0], .5), lerp(850, c[1], .45)], [c[0], c[1]], [HX6 + sd * 3.0 * s, 928]].map(([x, y]) => [x, y + settle * 8]);
      starBlanket(f, { seed: 30 + sd, n: 5, star: 11, curv: .4 });
      inkLine([f[0], f[4]], 2, '#FFF1A8', 'marker', .4, .7);
    }
    // tiny 桃桃 (left) and 团子 (right) tugging the corners, then settling beside her
    const after = ease(seg(t, T_DRAPE + .15, T_DRAPE + 1.0)), pulling = t < T_DRAPE + .15, [mx0, my0] = MOMO6;
    const mm = mood(t, [[218, 'normal'], [T_DRAPE + .15, 'happy', 'heart'], [T_DRAPE + 2.2, 'closed']]);
    const tug = pulling ? .5 + .5 * Math.sin(t * 9) : 0;
    const mX = pulling ? mx0 - 36 * pull : lerp(mx0 - 36, HX6 - 3.5 * s, after), mY = pulling ? my0 : lerp(my0, 952, after);
    momo(mX, mY, MS6, { digital: .8, ...mm, emoteK: mm.emoteK * .8, mouth: pulling ? 'open' : 'smile', blush: .9, noShadow: true, lookX: .7, lookY: pulling ? -.3 : 0,
      aL: pulling ? lerp(1.0, .15, pull) + .1 * tug : lerp(.15, -1.1, after), aR: pulling ? lerp(1.2, .35, pull) + .1 * tug : lerp(.35, -1.1, after),
      rot: pulling ? -.14 - .04 * tug : .05 * Math.sin(t * 1.2), dy: pulling ? -.15 * tug : 0, sit: !pulling && after > .5, tilt: after > .5 ? .25 : -.12 });
    if (pulling) for (let i = 0; i < 3; i++) sparkle(mX + Math.cos(t * 3 + i * 2.1) * 40, mY - 8 * MS6 + Math.sin(t * 3 + i * 2.1) * 30, 7, '#FFC6DA', frac(t * 1.3 + i / 3));
    for (let i = 0; i < 5; i++) {                                                             // she is digital: little pixels drift off her
      const a = frac(t * .6 + hash(i * 3.3)), px = mX + (hash(i * 7.1) - .5) * 40 + Math.sin(t * 2 + i) * 6, py = mY - 4 * MS6 - a * 90;
      fillRectA(px - 3, py - 3, 6, 6, i % 2 ? '#FFB3CC' : '#FFE0EA', .8 * Math.sin(a * Math.PI));
    }
    const [cx0, cy0] = CAT6;
    if (pulling) {
      cat(catX, cy0, CS6, { pose: 'walk', walk: -t * 1.8, eyes: 'closed', sq: .04 * Math.sin(t * 8) });
      paint([[mouth[0] - 7, mouth[1] - 2], [mouth[0] + 9, mouth[1] - 3], [mouth[0] + 6, mouth[1] + 16]], { wash: BLANKET, ink: PAL.ink, sw: .6 });   // the corner in its teeth
    } else cat(lerp(cx0 + 40, HX6 + 4.3 * s, after), 962, CS6, { pose: after > .6 ? 'loaf' : 'walk', walk: t * 1.6, eyes: 'happy', tail: .3 * Math.sin(t * 1.4) });
    camEnd();
    // light: night room, the fairy lights; the screen (behind us) lights her face; warmth grows from the dream
    const gk = seg(t, T_GLOW, 225.9), bk = seg(t, T_BUBBLE + .4, T_BUBBLE + 1.0);
    lightMap(cam, '#2A2F66', [[960, 160, 1100, '#FFD9A0', .3], [HX6, 1040, 820, '#C7C3F0', .62], [MOMO6[0], 860, 320, '#FFB8D0', .6], [CAT6[0], 880, 320, '#FFD9B0', .45], [BUB.x, BUB.y, 900 + 700 * gk, '#FFE2B8', .25 * bk + .8 * gk],
      [HX6 + .6 * HS6, HEADY6 - 3.8 * HS6, 300, '#FFC8D8', .35 * hk], [400, 700, 700, '#FFD9A0', .15]]);
    camBegin(cam[0], cam[1], cam[2]);
    // the heart ahoge glows; sparkles when the blanket lands
    if (hk) { const hx = HX6 + .9 * HS6, hy = HEADY6 - 3.6 * HS6; glow(hx, hy, 90 + 200 * gk, '#FF9FC0', .35 + .3 * gk); if (hAge < .6) for (let i = 0; i < 5; i++) sparkle(hx + Math.cos(i * 1.26) * 70 * hAge * 2, hy + Math.sin(i * 1.26) * 60 * hAge * 2, 10, '#FFE0EA', hAge / .6); }
    if (t > T_DRAPE && t < T_DRAPE + .8) for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, r = 200 + 260 * seg(t, T_DRAPE, T_DRAPE + .8); sparkle(HX6 + Math.cos(a) * r, 800 + Math.sin(a) * r * .35, 10, '#FFF3C0', seg(t, T_DRAPE, T_DRAPE + .8)); }
    dreamBubble(t);
    // warm glow growing from the dream → toward the white of the final chorus
    light(BUB.x, BUB.y, 500 + 1400 * gk, '#FFE6C0', .35 * gk);
    camEnd();
    flash(.62 * easeIn(gk), '#FFF6E8');
    vignette(.4 * (1 - gk), '#0A0C22');
  }

  chapter('bridge', 192.156, 225.756, [[192.156, blank], [196.956, doubts], [201.756, reheat], [206.556, careForMe], [213.756, restStop], [218.556, tiredNotDone]]);
  transition(192.156, 'dark', 1.2);
  transition(196.956, 'dissolve', .8);
  transition(201.756, 'dissolve', .9);
  transition(206.556, 'dissolve', .8);
  transition(213.756, 'dissolve', 1.0);
  transition(218.556, 'dissolve', 1.0);
})();
