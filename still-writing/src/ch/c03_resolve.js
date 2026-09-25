// c03_resolve: 决心 (48.156–67.356). Pre-chorus 1: gradually building and warming.
// Shots: thumb-sized her climbs a book stack on the giant desk to a glowing gift box → it is empty, a tiny ? shrugs
//        → a fork drawn on paper: the grey conveyor vs the winding hand-drawn path (yarn, 团子, stapler, eraser boulders)
//        → close-up in lamp light: her small loves pop in one per beat and orbit her head; eyes sparkle
//        → a sepia thought bubble of old-granny her sighing over a box of unfinished drafts → she pops it with her
//          pencil, grips it, and the pencil tip's light swallows the frame (white into chorus 1).
(() => {
  const B = n => beatT(n);                                     // beats: 80 = 48.156 … 112 = 67.356
  const L2 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  // hold a prop upright in a hand hook (undo the arm rotation)
  const upL = (a, fn) => (s, sw) => { scale(-1, 1); rotate(-a); fn(s, sw); };
  const upR = (a, fn) => (s, sw) => { rotate(a); fn(s, sw); };
  // device (screen) position of a local point in the current transform
  const here = (x = 0, y = 0) => { const m = X.getTransform(); return [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]; };
  const puff = (x, y, r, col = PAL.cream, op = 200) => paint(ellPts(x, y, r, r * .85, 14, r * .05), { wash: col, washOp: op, ink: null });
  const GOLD = '#FFE08A', GOLD_LT = '#FFF3C4', WARM = '#FFD98A';

  // =====================================================================================================
  // 1) EMPTY BOX  48.156–52.956  "我知道认真去做 也可能没有答案"
  //    She is thumb-sized on the desk; four beat-hoists up a stack of books to a glowing gift box; the lid pops off,
  //    it is empty, a tiny question mark pops out and shrugs; she laughs sheepishly.
  // =====================================================================================================
  const BOOKS = [ // x0, x1, top y, height, colour, side ('spine' | 'pages'): a staircase up to the gift
    [690, 1452, 792, 108, '#E27A92', 'spine'],
    [812, 1420, 688, 104, '#8EC3E6', 'pages'],
    [934, 1396, 584, 104, '#F2C66B', 'spine'],
    [1056, 1372, 482, 102, '#B7A6DA', 'pages'],
  ];
  const BOX = { x: 1262, y: 482, w: 150, h: 104 };            // gift box: centre x, base y
  const STEPS = [[630, 900], [752, 792], [874, 688], [996, 584], [1122, 482]];
  const surfaceY = x => { let y = 900; for (const [x0, x1, y0] of BOOKS) if (x > x0 + 4 && x < x1 - 4) y = Math.min(y, y0); return y; };
  const HOPS = [81, 82, 83, 84].map(n => [B(n) - .4, B(n)]);   // each hoist lands on a beat
  const T_OPEN = B(85), T_POP = B(86), T_SHRUG = B(87);

  function bookSide(x0, x1, y0, h, col, side, i) {
    const d = 16, dk = mixCol(col, PAL.ink, .28), lt = mixCol(col, PAL.cream, .45);
    // cover seen a little from above
    paint([[x0 + d * .6, y0 - d], [x1 - d * .2, y0 - d], [x1, y0 + 2], [x0, y0 + 2]], { wash: lt, fill: col, fillOp: 60, bleed: .03, tex: .4, border: .2, ink: PAL.ink, sw: 1 });
    if (side === 'spine') {
      paint(rrPts(x0, y0, x1 - x0, h, 12), { wash: col, fill: dk, fillOp: 70, bleed: .04, tex: .55, border: .45, ink: PAL.ink, sw: 1.3 });
      paint(rrPts(x0 + (x1 - x0) * .3, y0 + h * .3, (x1 - x0) * .4, h * .4, 6), { wash: mixCol(col, PAL.cream, .7), ink: PAL.ink, sw: .7 });
      for (const fx of [.12, .16, .84, .88]) inkLine([[lerp(x0, x1, fx), y0 + 8], [lerp(x0, x1, fx), y0 + h - 8]], 1.1, '#E8B84A', 'marker', 0, .9);
      // a tiny title scribble (not text)
      inkLine([[x0 + (x1 - x0) * .36, y0 + h * .5], [x0 + (x1 - x0) * .64, y0 + h * .5]], .7, dk, 'pencil', 0);
      paint(rectPts(x0 + 10, y0 + h * .2, 14, h * .6), { wash: mixCol(col, '#FFFFFF', .35), washOp: 120, ink: null });
    } else {
      paint(rectPts(x0, y0, x1 - x0, h), { wash: '#FFF8EA', fill: '#E9DDC6', fillOp: 70, bleed: .03, tex: .4, border: .2, ink: PAL.ink, sw: 1.2 });
      for (let k = 1; k < 7; k++) inkLine([[x0 + 10, y0 + h * k / 7 + jit(1)], [x1 - 10, y0 + h * k / 7 + jit(1)]], .45, '#C9B79C', 'fine', 0, .8);
      paint(rrPts(x0 - 4, y0 - 2, x1 - x0 + 8, 12, 5), { wash: col, ink: PAL.ink, sw: 1 });
      paint(rrPts(x0 - 4, y0 + h - 10, x1 - x0 + 8, 12, 5), { wash: dk, ink: PAL.ink, sw: 1 });
      // a ribbon bookmark hanging out
      if (i === 1) paint([[x1 - 90, y0 + h - 2], [x1 - 76, y0 + h - 2], [x1 - 74, y0 + h + 40], [x1 - 83, y0 + h + 32], [x1 - 92, y0 + h + 40]], { wash: PAL.rose, ink: PAL.ink, sw: .7 });
    }
  }

  // the gift: body + ribbon; the lid is separate so it can fly off. open 0..1 (lid off), glowK light leaking out
  function giftBody(t, open) {
    const { x, y, w, h } = BOX, d = 22;
    const body = '#F08FA9', bodyDk = '#C9607E', rib = GOLD;
    // back rim / inside (visible once open)
    if (open > 0) {
      paint([[x - w / 2 + d * .5, y - h - d], [x + w / 2 + d * .5, y - h - d], [x + w / 2, y - h], [x - w / 2, y - h]], { wash: '#4A2F52', ink: PAL.ink, sw: 1 });
      paint([[x - w / 2 + d * .5 + 8, y - h - d + 4], [x + w / 2 + d * .5 - 8, y - h - d + 4], [x + w / 2 - 6, y - h - 2], [x - w / 2 + 6, y - h - 2]], { wash: '#2E1D38', ink: null });
    }
    // right side face
    paint([[x + w / 2, y - h], [x + w / 2 + d * .5, y - h - d], [x + w / 2 + d * .5, y - d], [x + w / 2, y]], { wash: bodyDk, ink: PAL.ink, sw: 1.1 });
    // front face with polka dots
    paint(rectPts(x - w / 2, y - h, w, h, 1), { wash: body, fill: bodyDk, fillOp: 50, bleed: .04, tex: .4, border: .3, ink: PAL.ink, sw: 1.3 });
    for (let i = 0; i < 7; i++) { const px = x - w / 2 + 14 + hash(i * 3.1) * (w - 28), py = y - h + 14 + hash(i * 5.7) * (h - 28); if (Math.abs(px - x) > 18) dot(px, py, 5, '#FBD3DE', .9); }
    // ribbon down the front
    paint(rectPts(x - 13, y - h, 26, h), { wash: rib, fill: PAL.ochre, fillOp: 60, tex: .3, ink: PAL.ink, sw: .9 });
  }
  function giftLid(x, y, rot, t, bowK = 1) {
    const { w } = BOX, d = 22, body = '#F7A2B9', rib = GOLD;
    push(); translate(x, y); rotate(rot);
    paint([[-w / 2 - 8 + d * .5, -30 - d], [w / 2 + 8 + d * .5, -30 - d], [w / 2 + 8, -30], [-w / 2 - 8, -30]], { wash: '#FBC0CF', ink: PAL.ink, sw: 1.1 });   // lid top
    paint([[w / 2 + 8, -30], [w / 2 + 8 + d * .5, -30 - d], [w / 2 + 8 + d * .5, -d + 2], [w / 2 + 8, 2]], { wash: '#C9607E', ink: PAL.ink, sw: 1 });
    paint(rectPts(-w / 2 - 8, -30, w + 16, 32, 1), { wash: body, fill: '#C9607E', fillOp: 40, tex: .3, ink: PAL.ink, sw: 1.2 });
    paint(rectPts(-13, -30, 26, 32), { wash: rib, ink: PAL.ink, sw: .8 });
    paint([[-13 + d * .3, -30 - d * .6], [13 + d * .3, -30 - d * .6], [13, -30], [-13, -30]], { wash: rib, ink: PAL.ink, sw: .7 });
    // the bow
    if (bowK > .02) {
      push(); translate(d * .3, -30 - d * .6); scale(bowK);
      const wig = Math.sin(t * 5) * .08;
      for (const sd of [-1, 1]) {
        push(); rotate(sd * (.25 + wig));
        paint([[0, 0], [sd * 36, -28], [sd * 46, -6], [sd * 30, 8]], { wash: rib, fill: PAL.ochre, fillOp: 70, tex: .3, ink: PAL.ink, sw: 1, curv: .5 });
        paint([[sd * 4, 2], [sd * 16, 30], [sd * 6, 26], [sd * 2, 34]], { wash: rib, ink: PAL.ink, sw: .8, curv: .2 });
        pop();
      }
      paint(ellPts(0, -2, 9, 8, 10), { wash: '#F4C24F', ink: PAL.ink, sw: .9 });
      pop();
    }
    pop();
  }
  function lidPose(t) {
    // sits on the box; pops up and spins off to the right on the open beat, then tumbles down behind the books
    const k = seg(t, T_OPEN, T_OPEN + 1.25), { x, y, h } = BOX;
    if (k <= 0) { const jig = seg(t, T_OPEN - .5, T_OPEN) * Math.sin(t * 40) * 2; return [x, y - h + jig, jig * .01]; }
    const px = x + 330 * k, py = y - h - 520 * k + 900 * k * k;                  // a ballistic tumble off to the right
    return [px, py, k * 4.2];
  }

  function deskWorldBack(t, cam) {
    // far wall of the room (parallax layer): dark indigo, lamp-warm on the left
    paint(rectPts(-900, -900, W + 1800, 1720), { grad: ['#262C5E', '#58507F', Math.PI / 2], ink: null });
    glow(260, 120, 900, PAL.lamp, .5);
    glow(260, 120, 360, '#FFE7B0', .55);
    // the window far away: rain and city bokeh, very soft
    paint(rrPts(-700, -520, 700, 760, 10), { wash: '#1E2552', washOp: 180, ink: null });
    bokehField(t, { x: -650, y: -300, w: 600, h: 500 }, 10, ['#FFC77A', '#FF9FB0', '#8FE3D8'], { a: .35, seed: 7, r: 40 });
    // the giant pencil cup (far left): pencils like tree trunks
    for (const [px, rot, col] of [[250, -.16, '#F6C85F'], [330, .04, '#9ED8C4'], [415, .2, '#F29BB8']]) {
      push(); translate(px, 520); rotate(rot); scale(2.4);
      paint(rectPts(-10, -300, 20, 300), { wash: col, washOp: 190, fill: mixCol(col, PAL.ink, .2), fillOp: 40, tex: .3, ink: null });
      paint(rectPts(-10, -322, 20, 24), { wash: PAL.pink, washOp: 190, ink: null });
      paint(rectPts(-11, -302, 22, 7), { wash: '#C9CED6', washOp: 190, ink: null });
      pop();
    }
    paint(rrPts(160, 420, 350, 380, 26), { wash: '#6F86B8', washOp: 215, fill: '#4E5E92', fillOp: 60, tex: .3, border: .2, ink: null });
    paint(ellPts(335, 424, 176, 30, 20), { wash: '#8FA3D0', washOp: 215, ink: null });
    paint(ellPts(335, 426, 150, 20, 18), { wash: '#3E4A78', washOp: 200, ink: null });
    inkLine([[200, 460], [200, 760]], 5, '#FFFFFF', 'marker', 0, .18);
    // the lamp shade high up, glowing, with its light falling onto the books
    push(); translate(170, -80); rotate(.55);
    paint([[-180, -140], [180, -140], [300, 160], [-300, 160]], { wash: '#F6C8A0', washOp: 220, ink: null, curv: .2 });
    paint(ellPts(0, 160, 290, 60, 20), { wash: '#FFF6D6', ink: null });
    pop();
    paint([[80, 60], [360, -40], [1500, 760], [620, 820]], { fill: '#FFE3A0', fillOp: 55, bleed: .25, tex: .15, border: 0, ink: null });
    // the peach soda can standing further back on the desk (twice her height… and then some), beaded with drops
    push(); translate(1730, 800);
    const cw = 175, chh = 700;
    paint(rrPts(-cw, -chh, cw * 2, chh, 34), { wash: '#F4B39B', washOp: 225, fill: '#E88E78', fillOp: 70, bleed: .04, tex: .4, border: .3, ink: null });
    paint(rectPts(-cw, -470, cw * 2, 200), { wash: '#FFF1E4', washOp: 215, ink: null });
    paint(ellPts(0, -370, 64, 64, 20), { wash: '#F6A0B8', washOp: 225, ink: null });
    paint(ellPts(-6, -440, 16, 28, 12, 0, .5), { wash: '#A8CFA0', washOp: 215, ink: null });
    paint(rectPts(cw - 60, -chh + 30, 50, chh - 60), { wash: '#C9725E', washOp: 70, ink: null });
    paint(ellPts(0, -chh, cw, 36, 24), { wash: '#DADCE6', washOp: 230, ink: null });
    paint(ellPts(0, -chh + 2, cw * .82, 26, 22), { wash: '#B8BCCB', washOp: 220, ink: null });
    paint(rrPts(-34, -chh - 16, 68, 26, 12), { wash: '#C9CCD8', washOp: 230, ink: null });
    for (let i = 0; i < 10; i++) { const dx = -cw + 30 + hash(i * 3.3) * (cw * 2 - 60), dy = -chh + 60 + hash(i * 5.1) * (chh - 100); paint(ellPts(dx, dy, 12 + hash(i) * 9, 16 + hash(i) * 10, 12), { wash: '#FFFFFF', washOp: 95, ink: null }); dot(dx - 4, dy - 6, 3.5, '#FFFFFF', .55); }
    inkLine([[-cw + 34, -chh + 50], [-cw + 34, -40]], 8, '#FFFFFF', 'marker', 0, .3);
    pop();
    // floating dust motes in the lamp light
    for (let i = 0; i < 26; i++) {
      const px = 300 + hash(i * 2.1) * 1300 + Math.sin(t * .4 + i) * 30, py = frac(hash(i * 4.3) - t * .02 * (1 + hash(i))) * 900 - 100;
      dot(px, py, 1.6 + hash(i * 7) * 2.2, '#FFF1C8', .35 + .35 * Math.sin(t * 2 + i));
    }
  }
  function deskSurface(t) {
    // the desk top seen from tiny-her eye level: planks converging to the far edge at y 760
    paint([[-900, 760], [W + 900, 760], [W + 900, 1600], [-900, 1600]], { wash: '#C0916A', fill: '#8E6446', fillOp: 70, bleed: .03, tex: .6, border: .2, ink: null });
    inkLine([[-900, 760], [W + 900, 760]], 1.3, '#5E4030', 'ink', 0);
    for (let i = -8; i <= 16; i++) inkLine([[960 + i * 70, 764], [960 + i * 260, 1500]], .6, '#8A5E40', 'fine', 0, .55);
    for (const [y, a] of [[800, .5], [870, .45], [960, .4], [1080, .35]]) { const pts = []; for (let k = 0; k <= 12; k++) pts.push([-800 + k * 300, y + Math.sin(k * 1.3 + y) * 5]); inkLine(pts, .5, '#9B6E4E', 'fine', .5, a); }
    // warm pool of lamp light around the stack
    paint(ellPts(1060, 880, 760, 150, 26), { fill: '#FFD99A', fillOp: 90, bleed: .2, tex: .2, border: 0, ink: null });
    glow(1100, 820, 700, PAL.lamp, .3);
    // a draft sheet lying on the desk (she walks across it)
    paint([[380, 868], [860, 842], [980, 948], [420, 990]], { wash: '#FFFBF2', fill: '#EFE6D6', fillOp: 50, tex: .3, ink: PAL.ink, sw: 1 });
    inkLine([[480, 900], [560, 880], [640, 905], [720, 885]], .8, '#8C8FA3', 'pencil', .5);
    inkLine([[520, 940], [610, 925], [700, 945]], .8, '#8C8FA3', 'pencil', .5);
    paint(starPts(800, 910, 26, .45, 5, -1.7), { ink: '#8C8FA3', sw: .8, br: 'pencil' });
  }
  function deskWorldProps(t) {
    // a crumpled paper boulder (left), an eraser with its sleeve (right), eraser crumbs
    const bx = 270, by = 890, pts = [];
    for (let i = 0; i < 13; i++) { const a = i / 13 * TAU, r = 120 * (.8 + .3 * hash(i * 11 + 3)); pts.push([bx + Math.cos(a) * r, by - 105 + Math.sin(a) * r * .9]); }
    paint(ellPts(bx, by + 4, 150, 22, 16), { fill: PAL.ink, fillOp: 60, bleed: .2, ink: null });
    paint(pts, { wash: '#FFFBF2', fill: PAL.grayLt, fillOp: 80, bleed: .05, tex: .4, border: .3, ink: PAL.ink, sw: 1.3 });
    for (let k = 0; k < 7; k++) inkLine([[bx + (hash(k) - .5) * 180, by - 105 + (hash(k + 3) - .5) * 160], [bx + (hash(k + 6) - .5) * 160, by - 105 + (hash(k + 9) - .5) * 170]], .7, '#9A9CAE', 'fine', .3);
    // eraser
    push(); translate(1560, 900);
    paint(ellPts(0, 2, 150, 18, 14), { fill: PAL.ink, fillOp: 60, bleed: .2, ink: null });
    paint([[-120, 0], [-120, -110], [-96, -128], [130, -128], [130, -18], [110, 0]], { wash: '#F7B8C4', fill: '#E08A9E', fillOp: 50, tex: .4, border: .3, ink: PAL.ink, sw: 1.2 });
    paint([[-20, 0], [-20, -128], [130, -128], [130, -18], [110, 0]], { wash: '#8EC3E6', fill: '#5E8FC0', fillOp: 50, tex: .4, ink: PAL.ink, sw: 1.2 });
    paint(rectPts(10, -92, 90, 40), { wash: '#FFFBF2', ink: PAL.ink, sw: .8 });
    pop();
    for (let i = 0; i < 6; i++) paint(ellPts(1400 + hash(i * 2.2) * 120, 905 + hash(i * 3.3) * 30, 8 + hash(i) * 6, 5, 8), { wash: '#F2C0CB', ink: PAL.ink, sw: .5 });
    // the giant pencil lying across the front of the desk
    push(); translate(-120, 1030); rotate(-.1);
    paint(rectPts(0, -46, 760, 92, 2), { wash: '#F6C85F', fill: '#D9A63C', fillOp: 60, tex: .4, border: .3, ink: PAL.ink, sw: 1.6 });
    inkLine([[0, -16], [760, -16]], .8, '#C89434', 'fine', 0); inkLine([[0, 16], [760, 16]], .8, '#C89434', 'fine', 0);
    paint([[760, -46], [760, 46], [900, 0]], { wash: '#F3D6B0', ink: PAL.ink, sw: 1.4 });
    paint([[852, -16], [852, 16], [900, 0]], { wash: PAL.ink, ink: null });
    pop();
  }

  function climber(t) {
    // position and pose of tiny-her on the way up
    const o = { x: 0, y: 0, dy: 0, sq: 0, aL: -1.1, aR: -1.1, walk: null, air: 0, landed: 0 };
    if (t < HOPS[0][0]) {
      const q = seg(t, 47.2, HOPS[0][0] - .12), m = move('walk', t);
      o.x = lerp(470, STEPS[0][0], ease(q)); o.y = STEPS[0][1];
      if (q < 1) { o.walk = m.walk; o.dy = m.dy; o.aL = m.aL; o.aR = m.aR; }
      o.sq = .14 * seg(t, HOPS[0][0] - .16, HOPS[0][0]);                       // crouch before the first hoist
      return o;
    }
    let i = HOPS.length - 1; while (i > 0 && t < HOPS[i][0]) i--;
    const [t0, t1] = HOPS[i], a = STEPS[i], b = STEPS[i + 1], k = seg(t, t0, t1);
    if (t < t1) {
      o.x = lerp(a[0], b[0], ease(k)); o.y = lerp(a[1], b[1], k) - 80 * 4 * k * (1 - k);
      o.sq = -.2 * Math.sin(Math.PI * Math.min(1, k * 1.5)); o.aL = lerp(1.35, .3, k); o.aR = lerp(1.5, .35, k); o.air = 1;
      return o;
    }
    // landed on step i+1; squash, then (if another hop comes) crouch for it
    o.x = b[0]; o.y = b[1]; const since = t - t1;
    o.sq = .24 * Math.exp(-since * 9) * Math.cos(since * 26) + (i + 1 < HOPS.length ? .16 * seg(t, HOPS[i + 1][0] - .16, HOPS[i + 1][0]) : 0);
    o.aL = lerp(.2, -1.1, seg(since, 0, .3)); o.aR = lerp(.25, -1.1, seg(since, 0, .3)); o.landed = i + 1;
    return o;
  }

  function emptyBox(t, lt, dur) {
    const c = climber(t);
    // camera: wide at first (the goal glowing on top), then craning up with her and closing in on the box
    const cx = kf(t, [[47.5, 1000], [48.3, 1000], [B(82), 1000], [B(84), 1150], [52.2, 1205], [53.3, 1215]], easeInOut);
    const cy = kf(t, [[47.5, 640], [48.3, 635], [B(82), 585], [B(84), 450], [52.2, 420], [53.3, 410]], easeInOut);
    const z = kf(t, [[47.5, 1.0], [48.3, 1.0], [B(82), 1.12], [B(84), 1.42], [52.2, 1.6], [53.3, 1.68]], easeInOut);
    const hitA = t > T_OPEN ? Math.exp(-(t - T_OPEN) * 8) : 0, [sx, sy] = shakeXY(t, 4 * hitA);
    camBegin(lerp(960, cx, .4), lerp(540, cy, .4), 1 + (z - 1) * .4);
    deskWorldBack(t);
    camEnd();
    camBegin(cx + sx, cy + sy, z);
    deskSurface(t);
    deskWorldProps(t);
    // the stack of books and the gift on top
    for (const [x0, x1, y0, h] of BOOKS) paint(ellPts((x0 + x1) / 2 + 20, y0 + h + 3, (x1 - x0) * .55, 14, 16), { fill: PAL.ink, fillOp: 50, bleed: .2, ink: null });
    BOOKS.forEach(([x0, x1, y0, h, col, side], i) => bookSide(x0, x1, y0, h, col, side, i));
    const open = seg(t, T_OPEN, T_OPEN + .12);
    const glowK = (1 - open) * (.75 + .25 * pulse(t, 3)) + (open > 0 ? 1.5 * Math.exp(-(t - T_OPEN) * 4.5) : 0);
    // light leaking from the gift (rays turn slowly, pulse on the beat)
    if (glowK > .02) {
      const gx = BOX.x, gy = BOX.y - BOX.h * .6;
      glow(gx, gy, 380 * (.8 + .3 * glowK), '#FFE3A0', .45 * clamp(glowK));
      for (let r = 0; r < 12; r++) {
        const a = r / 12 * TAU + t * .25, L = (260 + 90 * hash(r * 3.7)) * (.7 + .5 * glowK), wd = .07;
        paint([[gx, gy], [gx + Math.cos(a - wd) * L, gy + Math.sin(a - wd) * L], [gx + Math.cos(a + wd) * L, gy + Math.sin(a + wd) * L]], { wash: GOLD_LT, washOp: 70 * clamp(glowK), ink: null });
      }
    }
    giftBody(t, open);
    // what's inside: a tiny ? popping out of the empty box (poof), then shrugging on the rim
    const pk = seg(t, T_POP, T_POP + .45), rimY = BOX.y - BOX.h - 10;
    if (t >= T_POP - .02) {
      const q = backOut(pk), shr = smooth01(t, T_SHRUG - .08, T_SHRUG + .1, 53.1, 53.3), qs = 11;
      const qx = BOX.x + 4, qy = lerp(rimY + 70, rimY + 8, q) - 40 * Math.sin(Math.PI * clamp(pk * 1.5)) * (pk < .67 ? 1 : 0);
      if (pk < 1) for (let i = 0; i < 9; i++) { const a = -Math.PI * (.08 + .84 * hash(i * 4.1)), r = (30 + 70 * hash(i * 2.3)) * easeOut(pk) + 10, sz = (12 + 14 * hash(i * 7.7)) * (1 - pk * .7); puff(qx + Math.cos(a) * r, rimY - 8 + Math.sin(a) * r * .7 - 20 * pk, sz, i % 3 ? PAL.cream : '#E9DCF2', 220 * (1 - pk)); }
      const sh = shr * (1 + .12 * Math.sin((t - T_SHRUG) * 14));
      clipTo([[BOX.x - 300, rimY - 500], [BOX.x + 300, rimY - 500], [BOX.x + 300, rimY + 8], [BOX.x - 300, rimY + 8]], () => {
        push(); translate(qx, qy); rotate(-.12 * shr + .06 * shr * Math.sin((t - T_SHRUG) * 7)); scale(q);
        // shrug arms first (behind the hook): up and out, open little hands
        for (const sd of [-1, 1]) {
          const ax = sd * 1.35 * qs + .2 * qs, ay = -5.2 * qs, hx = ax + sd * (1.0 + .5 * sh) * qs, hy = ay - (.2 + 1.2 * sh) * qs + (1 - shr) * .6 * qs;
          inkLine([[ax, ay], [hx, hy]], 2.4, PAL.ink, 'marker', .3); inkLine([[ax, ay], [hx, hy]], 1.7, PAL.violet, 'marker', .3);
          paint(ellPts(hx + sd * 2, hy - 3, 5, 4, 10, 0, sd * .5), { wash: PAL.violet, ink: PAL.ink, sw: .6 });
        }
        qmark(0, 0, qs, { sq: .15 * Math.sin(Math.PI * seg(t, T_SHRUG - .1, T_SHRUG + .18)), arms: false, eyes: shr > .5 ? 'happy' : 'normal' });
        pop();
      });
    }
    // the lid (the bow loosens, then it pops off and tumbles away)
    const [lx, ly, lr] = lidPose(t);
    giftLid(lx, ly, lr, t, 1 - .5 * seg(t, T_OPEN - .25, T_OPEN));
    // the idea star floats beside her, lagging a little, bobbing on the beat; peeks into the box; jumps at the pop
    const lag = climber(t - .3), sx0 = lag.x - 80 + 16 * Math.sin(t * 2.1), sy0 = Math.min(lag.y, surfaceY(lag.x)) - 190 + 12 * Math.sin(t * 3.3) - 12 * pulse(t, 4);
    const peek = smooth01(t, T_OPEN + .1, T_OPEN + .45, T_POP, T_POP + .3), jump = seg(t, T_POP, T_POP + .35);
    const ix = lerp(sx0, BOX.x - 150, peek) - 50 * Math.sin(Math.PI * jump), iy = lerp(sy0, BOX.y - BOX.h - 110, peek) - 60 * Math.sin(Math.PI * jump);
    idea(ix, iy, 17, { eyes: t > T_SHRUG ? 'happy' : 'normal', sq: .25 * Math.sin(Math.PI * jump), glow: .85, rot: -.3 * Math.sin(Math.PI * jump) });
    // tiny her: shadow on whatever surface is under her
    const gy = surfaceY(c.x), hgt = Math.max(0, gy - c.y);
    paint(ellPts(c.x, gy + 2, 42 * (1 - Math.min(.5, hgt / 300)), 8, 14), { fill: PAL.ink, fillOp: 80 * (1 - Math.min(.6, hgt / 250)), bleed: .2, ink: null });
    const md = mood(t, [[47.0, 'normal', null, 'smile'], [HOPS[0][0] - .06, 'closed', null, 'wobble'], [B(84) + .08, 'sparkle', null, 'open'],
      [T_OPEN + .06, 'wide', null, 'O'], [T_OPEN + .45, 'normal', null, 'o'], [T_POP + .08, 'dot', null, 'flat'], [T_SHRUG + .02, 'happy', 'sweat', 'grin']]);
    const atTop = c.landed === 4 && t > B(84), scratch = seg(t, T_SHRUG - .05, T_SHRUG + .2);
    const reach = smooth01(t, B(84) + .15, B(84) + .4, T_OPEN - .05, T_OPEN + .25), recoil = smooth01(t, T_OPEN, T_OPEN + .1, T_OPEN + .3, T_OPEN + .55);
    const lean = smooth01(t, T_OPEN + .35, T_OPEN + .55, T_POP + .02, T_POP + .2), jerk = smooth01(t, T_POP + .02, T_POP + .12, T_SHRUG - .2, T_SHRUG);
    let aL = c.aL, aR = c.aR, px = c.x;
    if (atTop) {
      aR = lerp(lerp(-1.1, .1, reach), .95 + .08 * Math.sin((t - T_SHRUG) * 22), scratch); aL = lerp(-1.1, -.95, scratch);
      aL = lerp(aL, .5, recoil); aR = lerp(aR, .6, recoil); aL = lerp(aL, -.5, lean); aR = lerp(aR, -.2, lean);
      px += -12 * recoil + 14 * lean - 8 * jerk;
    }
    const wig = Math.sin((t - T_SHRUG) * 22) * .1;
    hero(px, c.y, 18, {
      outfit: 'home', ...md, dy: c.dy, sq: c.sq + (md.take || 0), walk: c.walk, aL, aR, noShadow: true,
      lookX: atTop ? .75 + .25 * lean - .55 * scratch : .45, lookY: atTop ? -.25 + .75 * lean - .3 * jerk + .25 * scratch : -.5,
      tilt: .1 * scratch + .08 * lean, rot: -.07 * recoil + .16 * lean - .06 * jerk,
      brows: c.air || (t > HOPS[0][0] && t < B(84)) ? 'worried' : null, ahoge: t < T_POP + .1 ? 'question' : 'droop',
      blush: .5 + .45 * scratch, emoteK: md.emoteK,
      head: scratch > .05 ? (s, sw) => paint(ellPts(2.3 * s, (1.25 + wig) * s, .38 * s * scratch, .36 * s * scratch, 12), { wash: SKIN, ink: PAL.ink, sw: sw * .6 }) : null
    });
    // effort: sweat drops flick off at each landing
    for (let i = 0; i < HOPS.length; i++) {
      const age = t - HOPS[i][1]; if (age < 0 || age > .45) continue;
      const [qx, qy] = STEPS[i + 1];
      for (const sd of [-1, 1]) { const q = age / .45, dx = sd * (40 + 55 * q), dy = -190 - 60 * q + 110 * q * q; paint([[qx + dx, qy + dy - 10], [qx + dx + 6, qy + dy], [qx + dx, qy + dy + 8], [qx + dx - 6, qy + dy]], { wash: PAL.skyLt, washOp: 255 * (1 - q), ink: PAL.ink, sw: .5, curv: .6 }); }
    }
    camEnd();
    // warm lamp light over everything (screen)
    light(420, 140, 900, '#FFD08A', .18);
  }

  chapter('resolve', 48.156, 67.356, [[48.156, emptyBox], [52.956, emptyBox], [57.756, emptyBox], [62.556, emptyBox]]);
  transition(48.156, 'page', 1.2);
})();
