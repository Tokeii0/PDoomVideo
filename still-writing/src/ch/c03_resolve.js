// c03_resolve: 决心 (48.156–67.356). Pre-chorus 1: gradually building and warming.
// Shots: 1 thumb-sized her hoists up a staircase of books on the giant desk (one hoist per beat) to a glowing gift box;
//          the lid pops off, it is empty, a tiny ? pops out of a dust puff and shrugs; she laughs sheepishly.
//        2 a fork on a notebook page, in perspective: a grey conveyor carries identical boxes to a grey factory in lockstep;
//          the winding pencil path has ink blots, yarn, eraser boulders and a stapler monster. She flips round and hops
//          onto the winding path → (beat 91) side view: hops an ink puddle, 团子 pounces the yarn and she is tangled,
//          laughs, walks on with 团子 rolling behind in a yarn cocoon, dodges the stapler's chomp; the camera pushes into
//          the idea star's light, which opens onto
//        3 a lamp-lit close-up (reverse angle, soft focus): seven small loves pop in one per beat into a turning ring
//          round her head; her eyes turn to sparkles (reflecting them); slow push toward her eyes → match dissolve to
//        4 her face again; pull back as a sepia, film-scratched thought bubble inflates: old-granny her rocks in her chair,
//          opens a dusty box of unfinished drafts, sighs; the bubble sags toward her; she pokes it with her big pencil on
//          beat 108 (噗): the shards turn to sparkles that stream into the pencil tip; she grips it (determined brows,
//          ahoge perk) and its light swallows the frame (white into chorus 1).
(() => {
  const B = n => beatT(n);                                     // beats: 80 = 48.156 … 112 = 67.356
  // hold a prop upright in the right-hand hook (undo the arm rotation)
  const upR = (a, fn) => (s, sw) => { rotate(a); fn(s, sw); };
  // device (screen) position of a local point in the current transform
  const here = (x = 0, y = 0) => { const m = X.getTransform(); return [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]; };
  const puff = (x, y, r, col = PAL.cream, op = 200) => paint(ellPts(x, y, r, r * .85, 14, r * .05), { wash: col, washOp: op, ink: null });
  const GOLD = '#FFE08A', GOLD_LT = '#FFF3C4';

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

  // =====================================================================================================
  // 2) TWO PATHS  52.956–57.756  "也知道换一种做法 会多出些麻烦"
  //    A fork drawn on a notebook page: left, a smooth grey conveyor carrying identical grey boxes away in lockstep;
  //    right, a winding hand-drawn path with ink blots, yarn, eraser boulders and a stapler monster. She picks the
  //    winding one, gets tangled in yarn with 团子 rolling in it, and walks on smiling behind the idea star.
  // =====================================================================================================
  const T_CHOOSE = B(90), T_CUT2 = B(91), T_TANGLE = B(92), T_LAUGH = B(93), T_CHOMP = B(95);
  // ---- shared props of the page world ----
  function inkBlot(x, y, r, seed, t, face, squash = .55) {
    const pts = []; for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, rr = r * (.72 + .45 * hash(seed * 13 + i)); pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * squash]); }
    paint(pts, { wash: '#34407E', fill: '#1B2147', fillOp: 110, bleed: .1, tex: .5, border: .6, ink: null, curv: .5 });
    for (let i = 0; i < 6; i++) { const a = hash(seed + i * 3) * TAU, d = r * (1.12 + .5 * hash(seed + i * 7)); dot(x + Math.cos(a) * d, y + Math.sin(a) * d * squash, r * .07 * (1 + hash(i + seed)), '#2E3A78', .9); }
    paint(ellPts(x - r * .3, y - r * .3 * squash, r * .22, r * .14 * squash, 10), { wash: '#6E7BC0', washOp: 150, ink: null });
    if (face) {
      const blink = ((t + seed) % 2.3) < .12, er = r * .13;
      for (const sd of [-1, 1]) {
        if (blink) inkLine([[x + sd * r * .28 - er, y - 2], [x + sd * r * .28 + er, y - 2]], .8, PAL.cream, 'fine', 0);
        else { paint(ellPts(x + sd * r * .28, y - er * .4, er, er * 1.25, 10), { wash: PAL.cream, ink: null }); dot(x + sd * r * .28 + er * .2, y - er * .2, er * .5, PAL.ink); }
      }
    }
  }
  function yarnBall(x, y, r, rot, col = '#F29BB8') {
    push(); translate(x, y); rotate(rot);
    paint(ellPts(0, 0, r, r, 22), { wash: col, fill: '#D9708F', fillOp: 60, tex: .4, ink: PAL.ink, sw: clamp(r / 40, .5, 1.3) });
    for (let k = 0; k < 7; k++) { const a0 = k * .9, arc = []; for (let j = 0; j <= 8; j++) { const a = -1.3 + j / 8 * 2.6; arc.push([Math.cos(a) * r * (.95 - k * .1) * Math.cos(a0 * .3), Math.sin(a) * r * (.95 - k * .08)]); } push(); rotate(a0); inkLine(arc, clamp(r / 60, .3, .8), '#B85674', 'fine', .5); pop(); }
    pop();
  }
  function eraserRock(x, y, s, col, sleeve) {
    push(); translate(x, y); scale(s);
    paint(ellPts(0, 4, 120, 16, 14), { fill: PAL.ink, fillOp: 50, bleed: .2, ink: null });
    paint([[-100, 0], [-100, -80], [-80, -100], [100, -100], [110, -88], [110, -12], [96, 0]], { wash: col, fill: mixCol(col, PAL.ink, .15), fillOp: 50, tex: .4, border: .3, ink: PAL.ink, sw: 1.1 });
    paint([[-80, -100], [100, -100], [110, -88], [-68, -88]], { wash: mixCol(col, '#FFFFFF', .4), ink: null });
    if (sleeve) { paint([[-10, 0], [-10, -100], [56, -100], [56, 0]], { wash: sleeve, fill: mixCol(sleeve, PAL.ink, .2), fillOp: 50, tex: .4, ink: PAL.ink, sw: 1 }); paint(rectPts(0, -70, 44, 26), { wash: '#FFFBF2', ink: PAL.ink, sw: .6 }); }
    for (let i = 0; i < 5; i++) paint(ellPts(-150 + hash(i * 2.9 + x) * 120, 12 + hash(i * 1.7 + x) * 16, 7, 4, 8), { wash: mixCol(col, '#FFFFFF', .2), ink: PAL.ink, sw: .45 });
    pop();
  }
  function staplerMonster(x, y, s, t, big = 0) {
    // a coral stapler with googly eyes; its jaw snaps shut on every beat and creaks open again (wider for a big chomp)
    const bp = bpOf(t), f = frac(bp), open = clamp(f * 1.5) * (1 - seg(f, .9, 1)) * (1 + .6 * big), snap = Math.exp(-f * 14);
    push(); translate(x, y); scale(s);
    paint(ellPts(0, 6, 170, 18, 16), { fill: PAL.ink, fillOp: 60, bleed: .2, ink: null });
    paint(rrPts(-160, -30, 320, 34, 14), { wash: '#5E6784', fill: '#3E4766', fillOp: 50, tex: .4, ink: PAL.ink, sw: 1.2 });
    paint(rrPts(-150, -40, 60, 14, 5), { wash: '#C9CED6', ink: PAL.ink, sw: .8 });
    push(); translate(130, -44); rotate(open * .42 - snap * .04);
    for (let k = 0; k < 6; k++) paint([[-270 + k * 20, 10], [-258 + k * 20, 10], [-264 + k * 20, 24]], { wash: '#E6E9EF', ink: PAL.ink, sw: .5 });
    paint([[20, 10], [-280, 10], [-296, -8], [-282, -40], [-40, -52], [22, -30]], { wash: '#EE8A6D', fill: '#C9604A', fillOp: 60, tex: .4, border: .3, ink: PAL.ink, sw: 1.3, curv: .25 });
    inkLine([[-250, -34], [-60, -44]], 2.2, '#FFFFFF', 'marker', .3, .35);
    for (const [ex, ey] of [[-220, -52], [-160, -58]]) {
      paint(ellPts(ex, ey, 20, 22, 12), { wash: '#FFFBF2', ink: PAL.ink, sw: 1 });
      dot(ex - 6, ey + 4, 8, PAL.ink); dot(ex - 9, ey, 2.5, '#FFFFFF');
      inkLine([[ex - 18, ey - 30], [ex + 16, ey - 24]], 1.4, PAL.ink, 'ink', 0);
    }
    pop();
    paint(ellPts(130, -44, 12, 12, 10), { wash: '#8C8FA3', ink: PAL.ink, sw: .8 });
    pop();
  }

  // ---- 2a: the fork, in perspective. She stands at the fork facing us; both paths recede behind her. ----
  const PF = 600, PY = 150, PH = 1.6;
  const P3 = (X, Z, h = 0) => [960 + X * PF / Z, PY + (PH - h) * PF / Z];
  const PK = Z => PF / Z;
  const WPZ = smoothPts([[0, .9], [.02, 1.5], [.35, 2.0], [1.35, 2.45], [2.35, 3.05], [2.15, 3.9], [2.7, 4.9], [3.9, 5.9], [4.9, 7.3], [4.6, 9.2], [5.6, 11.2], [6.8, 14]], .5, false);
  const CONV3 = { a: [-.42, 1.98], b: [-11.5, 12.5], w: .95, h: .2 };
  const HERE3 = [0, 1.62], LAND3 = [.62, 2.12], WALK3 = [1.45, 2.5];
  function bandPts(C, w, h = 0) {
    const L = [], R = [];
    for (let i = 0; i < C.length; i++) {
      const p = C[Math.max(0, i - 1)], q = C[Math.min(C.length - 1, i + 1)], dx = q[0] - p[0], dz = q[1] - p[1], l = Math.hypot(dx, dz) || 1, nx = -dz / l, nz = dx / l;
      L.push(P3(C[i][0] + nx * w / 2, C[i][1] + nz * w / 2, h)); R.push(P3(C[i][0] - nx * w / 2, C[i][1] - nz * w / 2, h));
    }
    return [L, R];
  }
  function forkWorld(t, step) {
    // far wall and the desk beyond the page; the page itself with perspective rules
    paint(rectPts(-400, -400, W + 800, 620), { grad: ['#2A3066', '#5A5288', Math.PI / 2], ink: null });
    glow(1560, 120, 700, PAL.lamp, .5); glow(1560, 120, 260, '#FFE7B0', .55);
    bokehField(t, { x: -100, y: -60, w: 900, h: 240 }, 9, ['#FFC77A', '#FF9FB0', '#8FE3D8'], { a: .35, seed: 11, r: 30 });
    paint([[-400, 150], [W + 400, 150], [W + 400, 240], [-400, 240]], { wash: '#A87B55', fill: '#7F5A3C', fillOp: 60, tex: .5, ink: null });
    const pg = [P3(-60, .75), P3(60, .75), P3(60, 14.5), P3(-60, 14.5)];
    paint(pg, { wash: '#FBF5E8', fill: '#EFE4CF', fillOp: 45, bleed: .02, tex: .35, border: .15, ink: null });
    inkLine([P3(-60, 14.5), P3(60, 14.5)], 1.1, PAL.ink, 'fine', 0, .6);
    for (let i = 0; i < 30; i++) { const Z = .85 + i * .47, y = PY + PH * PF / Z; inkLine([[-300, y], [W + 300, y]], .5, '#A9C4E4', 'fine', 0, .55 * clamp(2.2 / Z)); }
    inkLine([P3(-4.2, .8), P3(-4.2, 14.5)], .9, '#EAA0B2', 'fine', 0, .7);
    // cold grey haze over the conveyor side, warm lamp light over the winding side
    glow(330, 420, 820, '#8A92AE', .42); glow(250, 330, 420, '#8A92AE', .25);
    glow(1560, 520, 900, '#FFD59A', .32);
    // a grey box factory where the conveyor ends (far left), a faint chimney puff
    { const fc = (dx, dz, dh) => P3(-9.6 + dx, 10.6 + dz, dh);
      paint([fc(-1.2, -.6, 0), fc(1.2, -.6, 0), fc(1.2, -.6, 1.4), fc(-1.2, -.6, 1.4)], { wash: '#9A9CAE', fill: '#7A7D93', fillOp: 50, tex: .4, ink: PAL.ink, sw: .8 });
      paint([fc(-1.2, -.6, 1.4), fc(0, -.6, 2.0), fc(1.2, -.6, 1.4)], { wash: '#8C8FA3', ink: PAL.ink, sw: .8 });
      paint([fc(.5, -.6, 1.5), fc(.8, -.6, 1.5), fc(.8, -.6, 2.4), fc(.5, -.6, 2.4)], { wash: '#7A7D93', ink: PAL.ink, sw: .7 });
      const [cx0, cy0] = fc(.65, -.6, 2.5); for (let k = 0; k < 3; k++) { const q = frac(t * .5 + k / 3); puff(cx0 + q * 30, cy0 - q * 60, 8 + q * 14, '#C9CAD3', 150 * (1 - q)); }
      paint([fc(-.45, -.61, .1), fc(.45, -.61, .1), fc(.45, -.61, .75), fc(-.45, -.61, .75)], { wash: '#4E5068', ink: PAL.ink, sw: .6 }); }
    // LEFT: the grey conveyor, a raised belt receding in a dead-straight line
    const { a, b, w, h } = CONV3, N = 24, C = []; for (let i = 0; i <= N; i++) C.push([lerp(a[0], b[0], i / N), lerp(a[1], b[1], i / N)]);
    const [Lt, Rt] = bandPts(C, w, h), [Lg] = bandPts(C, w, 0);
    paint([...Lg, ...Lt.slice().reverse()], { wash: '#6F7288', fill: '#555870', fillOp: 50, tex: .3, ink: PAL.ink, sw: 1 });   // near side skirt
    for (let i = 1; i < N; i += 2) { const [x0, y0] = Lt[i], [x1, y1] = Lg[i], r = 9 * PK(C[i][1]) / 300; paint(ellPts((x0 + x1) / 2, (y0 + y1) / 2, r, r, 8), { wash: '#B4B6C4', ink: PAL.ink, sw: .5 }); dot((x0 + x1) / 2, (y0 + y1) / 2, r * .3, PAL.ink, .7); }
    paint([...Lt, ...Rt.slice().reverse()], { wash: '#A3A6B8', fill: '#8C8FA3', fillOp: 50, bleed: .02, tex: .3, border: .2, ink: PAL.ink, sw: 1.1 });
    { const dl = Math.hypot(b[0] - a[0], b[1] - a[1]), nx = -(b[1] - a[1]) / dl * w * .45, nz = (b[0] - a[0]) / dl * w * .45, off = (step * 2.8) % 1;
      for (let i = 0; i < 40; i++) { const u = (i + off) / 40; if (u > 1) continue; const Z = lerp(a[1], b[1], u), X = lerp(a[0], b[0], u); inkLine([P3(X + nx, Z + nz, h), P3(X - nx, Z - nz, h)], .5, '#8C8FA3', 'fine', 0, .8); } }
    // identical grey boxes stepping away together, one fresh box per beat from the hopper
    const sp = .07, nB = 15, boxes = [];
    for (let i = 0; i < nB; i++) { const u = ((i + step) % nB) * sp; if (u > 1.02) continue; boxes.push(u); }
    boxes.sort((p, q) => q - p).forEach(u => {
      const X = lerp(a[0], b[0], u), Z = lerp(a[1], b[1], u), k = backOut(clamp((u - .005) / .05)) * (1 - seg(u, .8, .82)), s3 = .44 * k;
      if (s3 < .02) return;
      const c = (dx, dz, dh) => P3(X + dx, Z + dz, h + dh);
      paint([c(-s3 / 2, -s3 / 2, s3), c(s3 / 2, -s3 / 2, s3), c(s3 / 2, s3 / 2, s3), c(-s3 / 2, s3 / 2, s3)], { wash: '#D2D4DE', ink: PAL.ink, sw: .7 });
      paint([c(s3 / 2, -s3 / 2, 0), c(s3 / 2, s3 / 2, 0), c(s3 / 2, s3 / 2, s3), c(s3 / 2, -s3 / 2, s3)], { wash: '#8C8FA3', ink: PAL.ink, sw: .7 });
      paint([c(-s3 / 2, -s3 / 2, 0), c(s3 / 2, -s3 / 2, 0), c(s3 / 2, -s3 / 2, s3), c(-s3 / 2, -s3 / 2, s3)], { wash: '#B4B6C4', ink: PAL.ink, sw: .8 });
      const [mx, my] = c(0, -s3 / 2, s3 * .55), pk = PK(Z - s3 / 2);
      inkLine([[mx - .07 * pk, my], [mx + .07 * pk, my]], .6, '#6F7288', 'fine', 0);
    });
    // RIGHT: the winding hand-drawn path
    const [pl, pr] = bandPts(WPZ, .78, 0);
    paint([...pl, ...pr.slice().reverse()], { wash: '#FDE8C9', fill: '#F6C28E', fillOp: 70, bleed: .04, tex: .45, border: .35, ink: null });
    inkLine(pl, 1.2, '#8C6A55', 'pencil', .3); inkLine(pr, 1.2, '#8C6A55', 'pencil', .3);
    for (let i = 8; i + 3 < WPZ.length; i += 7) inkLine([P3(...WPZ[i]), P3(...WPZ[i + 3])], .9, '#E0A472', 'pencil', 0);
    // troubles along it (far to near)
    const flat = (X, Z, rx, rz, seed) => { const q = []; for (let i = 0; i < 16; i++) { const an = i / 16 * TAU, r = .75 + .4 * hash(seed * 13 + i); q.push(P3(X + Math.cos(an) * rx * r, Z + Math.sin(an) * rz * r)); } return q; };
    paint(flat(4.8, 9.4, .55, .55, 5), { wash: '#34407E', fill: '#1B2147', fillOp: 90, tex: .4, ink: null, curv: .5 });
    const shadow3 = (X, Z, r) => paint(flat(X, Z, r, r * .6, 1), { fill: PAL.ink, fillOp: 60, bleed: .2, ink: null, curv: .5 });
    shadow3(3.3, 5.7, .5); { const [x, y] = P3(3.3, 5.7); staplerMonster(x, y, PK(5.7) / 420, t); }
    paint(flat(4.2, 7.6, .5, .38, 9), { wash: '#34407E', fill: '#1B2147', fillOp: 90, tex: .4, ink: null, curv: .5 });
    shadow3(1.95, 4.6, .45); { const [x, y] = P3(1.95, 4.6); eraserRock(x, y, PK(4.6) / 300, '#F7B8C4', '#8EC3E6'); }
    shadow3(3.45, 3.4, .3); { const [x, y] = P3(3.45, 3.4); cat(x, y, PK(3.4) * .07, { pose: 'pounce', eyes: 'wide', tail: Math.sin(t * 8) * .5, noShadow: true }); }
    shadow3(2.7, 3.12, .3); { const [x, y] = P3(2.7, 3.12, .32); yarnBall(x, y, .32 * PK(3.12), Math.sin(t * 2) * .2); }
    for (let k = 0; k < 2; k++) { const pts = []; for (let j = 0; j <= 10; j++) { const u = j / 10; pts.push(P3(lerp(2.55, 1.5 + k * .4, u), lerp(3.1, 2.5 - k * .12, u) + Math.sin(u * 8 + k) * .1)); } inkLine(pts, 1.4, '#E07A9A', 'ink', .5); }
    paint(flat(1.2, 2.32, .4, .16, 3), { wash: '#34407E', fill: '#1B2147', fillOp: 90, tex: .4, ink: null, curv: .5 });
    { const [x, y] = P3(1.2, 2.3); for (const sd of [-1, 1]) { const blink = (t % 2.3) < .12; if (blink) inkLine([[x + sd * 26 - 7, y - 4], [x + sd * 26 + 7, y - 4]], .8, PAL.cream, 'fine', 0); else { paint(ellPts(x + sd * 26, y - 5, 8, 10, 10), { wash: PAL.cream, ink: null }); dot(x + sd * 26 + 2, y - 3, 4, PAL.ink); } } }
  }
  function forkShot(t) {
    const bp = bpOf(t), step = Math.floor(bp) + easeInOut(clamp(frac(bp) * 2.4));
    const cx = kf(t, [[52.7, 945], [T_CHOOSE, 975], [T_CUT2 + .2, 1080]], easeInOut), cy = kf(t, [[52.7, 520], [T_CHOOSE, 530], [T_CUT2 + .2, 500]], easeInOut);
    const z = kf(t, [[52.7, 1.0], [T_CHOOSE, 1.06], [T_CUT2 + .2, 1.12]], easeInOut);
    camBegin(cx, cy, z);
    forkWorld(t, step);
    // the idea star beckons over the winding path (brighter when she looks its way)
    const beck = seg(t, 53.65, 53.95), [ix, iy] = P3(1.85 + .08 * Math.sin(t * 1.7), 2.95, .95 + .06 * Math.sin(t * 3));
    glow(ix, iy + 90, 280, PAL.lamp, .25 + .3 * beck);
    idea(ix, iy, PK(2.95) * .12 * (1 + .15 * beck * pulse(t, 4)), { eyes: beck > .5 ? 'happy' : 'normal', glowMul: 1 + .5 * beck, rot: .2 * Math.sin(t * 5) * beck });
    // her: facing us at the fork, looks left (grey), looks right (sparkle), turns and hops onto the winding path
    const turnK = seg(t, T_CHOOSE - .24, T_CHOOSE - .04), turn = turnK >= .5, flipSx = Math.max(.12, Math.abs(Math.cos(turnK * Math.PI)));
    const hop = seg(t, T_CHOOSE, T_CHOOSE + .3), wk = seg(t, T_CHOOSE + .3, T_CUT2 + .3);
    let X = HERE3[0], Z = HERE3[1], air = 0;
    if (hop > 0) { X = lerp(HERE3[0], LAND3[0], hop); Z = lerp(HERE3[1], LAND3[1], hop); air = 4 * hop * (1 - hop) * .38; }
    if (wk > 0) { X = lerp(LAND3[0], WALK3[0], wk); Z = lerp(LAND3[1], WALK3[1], wk); }
    const [hx, hy] = P3(X, Z), [, gy] = P3(X, Z, air), hs = PK(Z) * .088;
    paint(ellPts(hx, hy + 2, hs * 2.2, hs * .45, 14), { fill: PAL.ink, fillOp: 70, bleed: .2, ink: null });
    const md = mood(t, [[52.5, 'normal', null, 'smile'], [53.12, 'normal', null, 'flat'], [53.68, 'sparkle', 'spark', 'open']]);
    const look = t < 53.1 ? 0 : t < 53.62 ? -1 : 1, m = move('walk', t * 1.3);
    hero(hx, gy, hs, {
      outfit: 'home', ...md, back: turn, sx: flipSx, noShadow: true, lookX: look * .95, lookY: -.05, tilt: -.07 * look,
      sq: (md.take || 0) + .14 * seg(t, T_CHOOSE - .15, T_CHOOSE) * (hop <= 0 ? 1 : 0) - .15 * Math.sin(Math.PI * hop),
      walk: wk > 0 ? m.walk : null, dy: wk > 0 ? m.dy : 0, aL: hop > 0 && hop < 1 ? 1.2 : wk > 0 ? m.aL : -1.1, aR: hop > 0 && hop < 1 ? 1.2 : wk > 0 ? m.aR : -1.1,
      ahoge: t < 53.68 ? 'question' : 'normal', emoteK: md.emoteK
    });
    camEnd();
    light(1450, 420, 800, '#FFE3B0', .12);
  }

  // ---- 2b: the side view along the winding path: yarn, 团子, the stapler; she walks on smiling ----
  const GY = 800;
  const walkX = t => kf(t, [[T_CUT2 - .6, 470], [T_CUT2, 690], [T_TANGLE, 985], [T_LAUGH, 1035], [T_CHOMP, 1480], [58.4, 1960]], x => clamp(x));
  function sideWorld(t, camX) {
    // the page: rules, a margin, pencil doodles (hills with trees, a sun, clouds, birds) drifting with parallax
    paint(rectPts(camX - 1400, -300, 2800, 1700), { wash: '#FBF5E8', fill: '#EFE4CF', fillOp: 40, bleed: .02, tex: .35, border: .1, ink: null });
    for (let y = 60; y < 1300; y += 84) inkLine([[camX - 1400, y], [camX + 1400, y]], .6, '#A9C4E4', 'fine', 0, .6);
    const PX = .5, px = camX * PX, G = '#8A7E74';
    push(); translate(px, 0);
    for (let i = -3; i < 6; i++) {
      const hx = 380 + i * 520 + hash(i * 3.1) * 120, hh = 150 + hash(i * 5.3) * 110, hw = 420 + hash(i * 1.7) * 160, arc = [];
      for (let k = 0; k <= 16; k++) { const u = k / 16; arc.push([hx - hw / 2 + u * hw, 740 - Math.sin(u * Math.PI) * hh]); }
      inkLine(arc, 1.3, G, 'pencil', .5);
      for (let k = 1; k < 7; k++) inkLine([[hx - hw * .32 + k * hw * .09, 740 - hh * .5], [hx - hw * .38 + k * hw * .09, 730]], .6, '#B3A89C', 'pencil', 0, .8);
      if (i % 2 === 0) { const tx = hx + hw * .18, ty = 740 - hh * .9; inkLine([[tx, ty + 30], [tx, ty - 20]], 1.1, G, 'pencil', 0); paint(ellPts(tx, ty - 44, 30, 36, 14), { ink: G, sw: 1.1, br: 'pencil' }); }
    }
    for (let i = -2; i < 4; i++) { const cx0 = 260 + i * 760 + hash(i * 7.7) * 200 + t * 12, cy0 = 290 + hash(i * 2.2) * 90; paint(cloudPts(cx0, cy0, 250, 64, i + 3, 6), { ink: G, sw: 1.2, br: 'pencil', curv: .4 }); }
    const sunX = 1160, sunY = 300; paint(ellPts(sunX, sunY, 58, 58, 20), { ink: '#D9A06A', sw: 1.4, br: 'pencil' });
    for (let k = 0; k < 10; k++) { const a = k / 10 * TAU + t * .25; inkLine([[sunX + Math.cos(a) * 76, sunY + Math.sin(a) * 76], [sunX + Math.cos(a) * 102, sunY + Math.sin(a) * 102]], 1.2, '#D9A06A', 'pencil', 0); }
    for (let i = 0; i < 3; i++) { const bx = 700 + i * 90 + t * 40, by = 380 + i * 26 + Math.sin(t * 3 + i) * 8, fl = Math.sin(t * 10 + i * 2) * 8; inkLine([[bx - 16, by - fl], [bx, by], [bx + 16, by - fl]], 1, G, 'pencil', .3); }
    pop();
    // the path strip (seen a little from above) and the page in front of it
    const x0 = camX - 1300, x1 = camX + 1300, top = [], bot = [];
    for (let x = Math.floor(x0 / 60) * 60; x <= x1; x += 60) { top.push([x, GY - 34 + Math.sin(x * .011) * 10]); bot.push([x, GY + 58 + Math.sin(x * .013 + 1) * 10]); }
    paint([...top, ...bot.slice().reverse()], { wash: '#FDE8C9', fill: '#F6C28E', fillOp: 70, bleed: .04, tex: .45, border: .35, ink: null });
    inkLine(top, 1.4, '#8C6A55', 'pencil', .3); inkLine(bot, 1.4, '#8C6A55', 'pencil', .3);
    for (let x = Math.floor(x0 / 150) * 150; x < x1; x += 150) inkLine([[x, GY + 14 + Math.sin(x * .012) * 8], [x + 60, GY + 14 + Math.sin((x + 60) * .012) * 8]], 1.1, '#E0A472', 'pencil', 0);
    for (let i = 0; i < 30; i++) { const fx = 200 + i * 130 + hash(i * 3.1) * 60; if (fx < x0 || fx > x1) continue; const fy = GY - 64 - 20 * hash(i * 5.3); if (i % 3 === 0) { for (let k = 0; k < 5; k++) { const a = k / 5 * TAU + i; dot(fx + Math.cos(a) * 10, fy + Math.sin(a) * 10, 7, [PAL.pinkLt, '#FFF1A8', PAL.skyLt][i % 3], .95); } dot(fx, fy, 5.5, PAL.ochre, 1); inkLine([[fx, fy + 11], [fx + 2, fy + 34]], .9, PAL.sage, 'pencil', 0); } else inkLine([[fx - 12, fy + 30], [fx - 5, fy + 10], [fx, fy + 30], [fx + 6, fy + 8], [fx + 12, fy + 30]], 1, PAL.sage, 'pencil', .3); }
  }
  function sideShot(t) {
    // at the end the camera pushes into the idea star's light, which blooms into the next shot's lamp light
    const hx = walkX(t), pk = easeInOut(seg(t, 57.2, 57.76)), sx0 = hx + 300 + 12 * Math.sin(t * 2), sy0 = GY - 350 + 14 * Math.sin(t * 3.1) - 12 * pulse(t, 4);
    const camX = lerp(hx + 170, sx0, pk), z = kf(t, [[T_CUT2, 1.28], [57.2, 1.33], [57.8, 2.4]], easeInOut);
    camBegin(camX, lerp(612, sy0, pk), z);
    sideWorld(t, camX);
    // background troubles: eraser boulders, ink blots with eyes
    inkBlot(560, GY - 90, 62, 5, t, true, .5);
    eraserRock(1250, GY - 44, 1.2, '#F7B8C4', '#8EC3E6');
    inkBlot(2000, GY - 86, 70, 11, t, true, .5);
    eraserRock(2260, GY - 36, 1.1, '#FFF6EC', null);
    // the stapler monster behind the path: it lunges at her as she passes (big chomp on beat 95)
    staplerMonster(1735, GY - 22, .88, t, t > T_CHOMP - .6 && t < T_CHOMP + .05 ? 1 : 0);
    // the ink puddle she hops over
    inkBlot(832, GY + 16, 62, 7, t, false, .3);
    // the idea star leads the way, a warm pool of light on the path ahead
    const sx = sx0, sy = sy0;
    paint(ellPts(sx - 20, GY + 14, 210, 46, 20), { fill: '#FFE7A0', fillOp: 90 + 30 * pulse(t, 3), bleed: .2, tex: .1, border: 0, ink: null });
    glow(sx, GY - 120, 320, PAL.lamp, .3);
    // 团子 and the yarn: crouched behind the ball, pounces on the tangle beat, then rolls along in a yarn cocoon
    const pounce = seg(t, T_TANGLE - .22, T_TANGLE + .12), roll = seg(t, T_TANGLE + .1, 58.6);
    const ball0 = [1150, GY - 32];
    const hop = seg(t, 54.93, 55.22), hy = GY + 10 - 70 * 4 * hop * (1 - hop);
    const tangled = seg(t, T_TANGLE, T_TANGLE + .4), wob = tangled * (1 - seg(t, T_LAUGH, T_LAUGH + .5));
    if (roll <= 0) {
      const bx = lerp(ball0[0], hx + 40, easeIn(pounce)), by = lerp(ball0[1], GY - 60, pounce) - 40 * Math.sin(Math.PI * pounce);
      if (pounce <= 0) for (let k = 0; k < 2; k++) { const pts = []; for (let j = 0; j <= 10; j++) { const u = j / 10; pts.push([lerp(ball0[0] - 30, 900 - k * 60, u), GY + 8 + Math.sin(u * 7 + k * 2) * 16 + k * 14]); } inkLine(pts, 1.8, '#E07A9A', 'ink', .5); }
      paint(ellPts(bx, GY + 8, 44, 9, 12), { fill: PAL.ink, fillOp: 50, bleed: .2, ink: null });
      cat(lerp(ball0[0] + 120, hx + 110, easeIn(pounce)), GY - 4 - 120 * Math.sin(Math.PI * pounce), 22, { pose: 'pounce', eyes: pounce > 0 ? 'happy' : 'wide', tail: Math.sin(t * 9) * .5, rot: -.35 * Math.sin(Math.PI * pounce), noShadow: pounce > 0 });
      yarnBall(bx, by, 44 * (1 - .35 * pounce), -pounce * 4 + Math.sin(t * 3) * .1);
    }
    const catX = hx - 175 - 8 * Math.sin(t * 5), catY = GY + 18;
    if (roll > 0) {
      const tether = []; for (let j = 0; j <= 12; j++) { const u = j / 12; tether.push([lerp(catX + 40, hx - 25, u), lerp(catY - 60, GY - 100, u) + Math.sin(u * Math.PI) * 40 + Math.sin(u * 14 + t * 7) * 6]); }
      inkLine(tether, 2, '#E07A9A', 'ink', .5);
      paint(ellPts(catX, catY + 4, 66, 12, 12), { fill: PAL.ink, fillOp: 50, bleed: .2, ink: null });
      push(); translate(catX, catY - 54); rotate(roll * 22);
      cat(0, 54, 21, { pose: 'sleep', zzz: false, eyes: 'happy', noShadow: true });
      for (let k = 0; k < 4; k++) { push(); rotate(k * .8); paint(ellPts(0, 18, 70, 32, 18), { ink: '#E07A9A', sw: 1.5 }); pop(); }
      pop();
    }
    // her
    const md = mood(t, [[T_CUT2 - 1, 'happy', null, 'smile'], [T_TANGLE + .06, 'wide', null, 'O'], [T_TANGLE + .35, 'spiral', null, 'wobble'], [T_LAUGH + .02, 'happy', 'sweat', 'grin'],
      [T_CHOMP - .1, 'wide', '!', 'O'], [T_CHOMP + .3, 'happy', 'music', 'grin']]);
    const m = move('walk', t * 1.3), stumble = tangled > 0 && t < T_LAUGH + .3;
    const dodge = smooth01(t, T_CHOMP - .14, T_CHOMP + .02, T_CHOMP + .16, T_CHOMP + .42);
    paint(ellPts(hx, GY + 14, 62, 12, 14), { fill: PAL.ink, fillOp: 70 * (1 - hop * .5 - dodge * .4), bleed: .2, ink: null });
    hero(hx, hy - 90 * dodge, 30, {
      outfit: 'home', ...md, noShadow: true, lookX: .5 - .9 * dodge, lookY: .1 + .2 * dodge,
      sq: (md.take || 0) - .15 * Math.sin(Math.PI * hop) - .12 * dodge,
      walk: stumble ? t * 3 : m.walk, dy: m.dy, rot: .1 * wob * Math.sin((t - T_TANGLE) * 14) + .04 - .08 * dodge,
      aL: hop > 0 && hop < 1 ? 1.0 : lerp(m.aL, -1.34, tangled) + 1.6 * dodge, aR: hop > 0 && hop < 1 ? 1.1 : lerp(m.aR, -1.34, tangled) + 1.6 * dodge,
      emoteK: md.emoteK,
      draw: tangled > 0 ? (s, sw) => {
        [[-2.75, .15, 1.8], [-2.05, -.2, 1.85], [-3.4, .3, 1.6], [-1.6, .1, 1.7]].forEach(([ly, rt, rx], i) => {
          if (tangled < i * .22) return;
          const arc = []; for (let j = 0; j <= 12; j++) { const a = j / 12 * Math.PI; arc.push([Math.cos(a) * rx * s, ly * s + Math.sin(a) * .45 * s + Math.cos(a) * rt * s]); }
          inkLine(arc, sw * 1.6, '#E07A9A', 'ink', .5);
        });
      } : null
    });
    // the whip of yarn wrapping her on the tangle beat
    if (tangled > 0 && tangled < 1) for (let k = 0; k < 3; k++) { const pts = []; for (let j = 0; j <= 16; j++) { const a = j / 16 * TAU * 1.2 + tangled * 8 + k * 2; pts.push([hx + Math.cos(a) * 90 * (1 - tangled * .4), GY - 50 - k * 38 + Math.sin(a) * 24]); } inkLine(pts, 1.6, '#E07A9A', 'ink', .5, 1 - tangled); }
    if (pk > 0) glow(sx, sy, 200 + 500 * pk, '#FFE7B0', .6 * pk);
    idea(sx, sy, 32, { eyes: 'happy', glow: 1.2 + 1.5 * pk, glowMul: 1 + 1.5 * pk, trail: tt => [walkX(tt) + 300 + 12 * Math.sin(tt * 2), GY - 350 + 14 * Math.sin(tt * 3.1)] });
    camEnd();
    light(1500, 400, 1000, '#FFE3B0', .12);
    // the star's light swells until it fills the frame (the next shot opens in the same warm light)
    const br = easeIn(seg(t, 57.25, 57.756));
    if (br > 0) { light(960, 540, 300 + 1500 * br, '#FFE9C0', .3 + .6 * br); flash(.9 * Math.pow(br, 1.5), '#FFEBC4'); }
  }
  function twoPaths(t, lt, dur) { if (t < T_CUT2) forkShot(t); else sideShot(t); }

  // =====================================================================================================
  // 3) LITTLE LOVES  57.756–62.556  "可那些让我眼睛发亮的小小喜欢"
  //    Close-up in lamp light (the reverse angle, softly out of focus behind her). Her small loves pop in one per beat
  //    and orbit her head like fireflies; her eyes turn to sparkles; a slow push toward her eyes.
  // =====================================================================================================
  const LOVE_T = [97, 98, 99, 100, 101, 102, 103].map(B);
  const HEAD3 = [960, 600], S3 = 62;                           // her head centre and unit in this shot
  const ORB = { cx: 960, cy: 545, rx: 545, ry: 290, tilt: -.08, w: .62 };
  function loveIcon(i, x, y, r, t, k = 1) {
    // the seven small loves, drawn around (x, y) with radius ~r
    push(); translate(x, y); scale(r / 40 * k);
    if (i === 0) {                                             // a tiny drawing: a card with a doodled smiley cat
      rotate(-.12 + .06 * Math.sin(t * 2));
      paint(rrPts(-34, -40, 68, 80, 6), { wash: '#FFFBF2', fill: '#EFE4CF', fillOp: 40, ink: PAL.ink, sw: .8 });
      paint(ellPts(0, 2, 20, 17, 16), { ink: '#6B6A78', sw: .7, br: 'pencil' });
      for (const sd of [-1, 1]) { inkLine([[sd * 16, -8], [sd * 20, -24], [sd * 6, -15]], .7, '#6B6A78', 'pencil', 0); dot(sd * 7, 0, 2.2, PAL.ink); }
      inkLine([[-5, 8], [0, 11], [5, 8]], .6, PAL.ink, 'fine', .5);
      paint(ellPts(-12, 7, 4, 2.5, 8), { wash: PAL.pink, ink: null }); paint(ellPts(12, 7, 4, 2.5, 8), { wash: PAL.pink, ink: null });
    } else if (i === 1) {                                      // a paw print
      paint([[-22, 8], [0, -10], [22, 8], [16, 26], [0, 30], [-16, 26]], { wash: '#F6A6BD', ink: PAL.ink, sw: .9, curv: .6 });
      for (const [px, py, pr] of [[-26, -14, 9], [-10, -28, 10], [10, -28, 10], [26, -14, 9]]) paint(ellPts(px, py, pr, pr * 1.15, 12), { wash: '#F6A6BD', ink: PAL.ink, sw: .8 });
    } else if (i === 2) {                                      // the idea star itself joins the ring
      pop(); idea(x, y, r * .8 * k, { eyes: 'happy', glow: .7, glowMul: .6 }); return;
    } else if (i === 3) {                                      // a strawberry candy
      rotate(.2 + .1 * Math.sin(t * 2.3));
      for (const sd of [-1, 1]) paint([[sd * 22, 0], [sd * 40, -14], [sd * 44, 0], [sd * 40, 14]], { wash: '#FBD3DE', washOp: 220, ink: PAL.ink, sw: .7 });
      paint([[-24, -8], [0, -26], [24, -8], [18, 16], [0, 28], [-18, 16]], { wash: '#EE5A73', fill: '#C93A56', fillOp: 60, tex: .3, ink: PAL.ink, sw: .9, curv: .6 });
      for (let k2 = 0; k2 < 6; k2++) dot(-12 + (k2 % 3) * 12, -6 + Math.floor(k2 / 3) * 14 + (k2 % 2) * 4, 1.8, '#FFE59A');
      for (const a of [-.7, 0, .7]) paint([[0, -24], [Math.sin(a) * 16, -34 - Math.cos(a) * 6], [Math.sin(a) * 6, -22]], { wash: PAL.sage, ink: PAL.ink, sw: .6 });
      paint(ellPts(-9, -10, 5, 3, 8, 0, -.5), { wash: '#FFFFFF', washOp: 180, ink: null });
    } else if (i === 4) {                                      // a pencil
      rotate(.9 + .1 * Math.sin(t * 2)); pencil(0, 34, .48, 0, '#F6C85F');
    } else if (i === 5) {                                      // a pixel heart
      const px = ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'];
      px.forEach((row, ry) => [...row].forEach((c, rx) => { if (c === 'X') paint(rectPts(-35 + rx * 10, -30 + ry * 10, 10, 10), { wash: (rx + ry) % 3 ? '#F2708F' : '#F79AB2', ink: PAL.ink, sw: .45 }); }));
      paint(rectPts(-25, -20, 10, 10), { wash: '#FFFFFF', washOp: 200, ink: null });
    } else {                                                   // a music note (two beamed eighths)
      rotate(-.1 + .12 * Math.sin(t * 3));
      for (const nx of [-16, 16]) paint(ellPts(nx - 6, 22 - (nx > 0 ? 6 : 0), 11, 8, 12, 0, -.35), { wash: PAL.violet, ink: PAL.ink, sw: .8 });
      inkLine([[-8, 20], [-8, -24]], 2.2, PAL.ink, 'ink', 0); inkLine([[24, 14], [24, -30]], 2.2, PAL.ink, 'ink', 0);
      paint([[-9, -28], [25, -34], [25, -24], [-9, -18]], { wash: PAL.violet, ink: PAL.ink, sw: .7 });
    }
    pop();
  }
  const LOVE_GLOW = ['#FFE7B0', '#FFC9D8', '#FFF1C2', '#FFC0CC', '#FFE59A', '#FFB8CC', '#D9CCFF'];
  function lovePos(i, t) {
    // each love pops straight into its own slot on a slowly turning, tilted ring (7 even slots); the ring's phase is
    // chosen so that no pop lands in front of her face, and each spirals out a little as it arrives
    const age = t - LOVE_T[i], sa = -1.85 + ORB.w * (t - 57.756) + i * TAU / 7, rr = lerp(.72, 1, easeOut(seg(age, 0, .8)));
    const ex = Math.cos(sa) * ORB.rx * rr, ey = Math.sin(sa) * ORB.ry * rr, c = Math.cos(ORB.tilt), sn = Math.sin(ORB.tilt);
    const bob = 14 * Math.sin(t * 2.2 + i * 1.7);
    return { x: ORB.cx + ex * c - ey * sn, y: ORB.cy + ex * sn + ey * c + bob, d: Math.sin(sa), age };
  }
  function drawLove(i, t) {
    const p = lovePos(i, t); if (p.age < -.02) return;
    const k = backOut(seg(p.age, 0, .35)) * (1 + .07 * pulse(t, 7)), depth = .86 + .14 * p.d, fl = .85 + .15 * Math.sin(t * 5 + i * 2);
    glow(p.x, p.y, 150 * k * depth, LOVE_GLOW[i], .6 * fl * (.6 + .4 * depth));
    if (p.age < .3) glow(p.x, p.y, 220 * (1 - p.age / .3), '#FFF6D6', .6 * (1 - p.age / .3));
    fadeIn(lerp(.72, 1, clamp(p.d + .5)), () => loveIcon(i, p.x, p.y, 70 * depth, t, k));
    if (p.age < .55) for (let j = 0; j < 7; j++) { const a = j / 7 * TAU + i, q = p.age / .55; sparkle(p.x + Math.cos(a) * (50 + 90 * q), p.y + Math.sin(a) * (50 + 90 * q), 14, '#FFF3C0', q); }
    // a little trail of light behind each firefly
    for (let j = 1; j <= 4; j++) { const q = lovePos(i, t - j * .06); if (q.age > 0) dot(q.x, q.y, 5 - j, LOVE_GLOW[i], .5 - j * .1); }
  }
  function reverseSoft(t, warm) {
    // her room seen from behind the monitor, softly out of focus: fairy-light bokeh, shelf, clock, bed
    paint(rectPts(-500, -400, W + 1000, 1900), { grad: [mixCol('#3A3F7A', '#5B4A7E', warm * .6), mixCol('#5A4E86', '#8A5E78', warm * .7), Math.PI / 2], ink: null });
    glow(260, 640, 1100, PAL.lamp, .5 + .2 * warm); glow(300, 600, 460, '#FFE3B0', .35 + .15 * warm);
    glow(1500, 900, 900, '#F2A57A', .12 + .18 * warm);
    paint(rrPts(40, 180, 420, 760, 20), { wash: '#6E5A68', washOp: 160, ink: null });                 // bookshelf, blurred
    for (let r = 0; r < 4; r++) for (let k = 0; k < 7; k++) { const bw = 36 + hash(r * 7 + k) * 20, bx = 70 + k * 56, bh = 90 + hash(r * 3 + k) * 50; paint(rrPts(bx, 330 + r * 170 - bh, bw, bh, 8), { wash: [PAL.rose, PAL.sky, '#F6C85F', PAL.sage, PAL.lilac, PAL.peach][(r + k) % 6], washOp: 110, ink: null }); }
    paint(ellPts(1560, 250, 80, 80, 20), { wash: '#FFF1E2', washOp: 110, ink: null });                // clock
    paint(rrPts(1220, 620, 900, 420, 60), { wash: '#8FA8D8', washOp: 120, ink: null });                // bed + star blanket
    for (let i = 0; i < 6; i++) bokeh(1300 + hash(i * 3.3) * 560, 700 + hash(i * 7.7) * 180, 16, '#FFF1A8', .35);
    // fairy lights: big soft discs strung across the top
    for (let i = 0; i < 16; i++) {
      const x = -60 + i * 135, y = 150 + Math.sin(i * .9) * 34 + (i % 2) * 14, on = .6 + .4 * Math.sin(t * 2 + i * 1.7);
      bokeh(x, y, 46 + 16 * hash(i), ['#FFD98A', '#FFB3C6', '#BFF0E0'][i % 3], .5 * on);
    }
    for (let i = 0; i < 10; i++) bokeh(hash(i * 5.1) * W, 380 + hash(i * 2.7) * 300, 30 + 30 * hash(i * 9.1), ['#FFC77A', '#FF9FB0', '#8FE3D8'][i % 3], .18);
  }

  function littleLoves(t, lt, dur) {
    const z = kf(t, [[57.4, 1.06], [57.9, 1.06], [62.7, 1.55]], easeInOut), cx = 960, cy = kf(t, [[57.9, 600], [62.7, HEAD3[1] + 8]], easeInOut);
    const nIn = LOVE_T.filter(x => t >= x).length, warm = .25 + .75 * clamp((t - LOVE_T[0] + .3) / (LOVE_T[6] - LOVE_T[0] + .3));
    camBegin(cx, cy, z);
    reverseSoft(t, warm);
    // fireflies behind her
    for (let i = 0; i < 7; i++) if (lovePos(i, t).d < 0) drawLove(i, t);
    // her: sitting at the desk in lamp light, looking down at the page, then up at each love as it arrives
    const md = mood(t, [[57.3, 'normal', null, 'smile'], [LOVE_T[0] + .05, 'look', null, 'o'],
      [B(100) - .02, 'sparkle', null, 'open'], [LOVE_T[5] + .1, 'sparkle', null, 'grin']]);
    const last = LOVE_T.reduce((p, x, i) => t >= x ? i : p, -1);
    let lx = .1, ly = .55;
    if (last >= 0) { const q = lovePos(last, t); lx = clamp((q.x - HEAD3[0]) / 420, -1, 1) * .8; ly = clamp((q.y - HEAD3[1]) / 300, -1, 1) * .6; }
    const settle = seg(t, LOVE_T[0] - .1, LOVE_T[0] + .3); lx = lerp(.1, lx, settle); ly = lerp(.55, ly, settle);
    const bob = pulse(t, 5) * seg(t, B(100), B(100) + .3);
    const sparkK = seg(t, B(100) - .1, B(100) + .4);
    hero(960, HEAD3[1] + 6.7 * S3, S3, {
      outfit: 'home', ...md, sit: true, lookX: lx, lookY: ly, tilt: .06 * Math.sin(t * 1.1) - .08 * lx * settle, dy: -.06 * bob, sq: (md.take || 0) + .02 * bob,
      blush: .45 + .5 * sparkK, ahoge: 'normal', aL: -1.25, aR: -1.25, noShadow: true, emoteK: md.emoteK * .9,
      head: (s, sw) => {
        // the small loves reflected in her eyes once they sparkle
        if (sparkK < .05) return;
        for (const sd of [-1, 1]) {
          const ex = sd * 1.05 * s + lx * .38 * s, ey = .15 * s + ly * .22 * s + .26 * s;
          fadeIn(sparkK, () => { paint(heartPts(ex - .12 * s, ey, .09 * s), { wash: '#FF9CB8', ink: null }); paint(starPts(ex + .12 * s, ey - .02 * s, .09 * s, .45, 5), { wash: '#FFE59A', ink: null }); dot(ex, ey + .12 * s, .04 * s, '#BFF0E0'); });
        }
      }
    });
    // the desk edge in front of her, the open sketchbook catching the lamp light
    paint([[-300, 858], [W + 300, 858], [W + 300, 1500], [-300, 1500]], { wash: '#B98A5E', fill: '#7F5A3C', fillOp: 70, bleed: .04, tex: .6, border: .4, ink: PAL.ink, sw: 1.4 });
    paint([[540, 872], [1380, 872], [1440, 1080], [480, 1080]], { wash: '#FFFBF2', fill: '#EFE4CF', fillOp: 40, tex: .3, ink: PAL.ink, sw: 1 });
    inkLine([[960, 872], [960, 1080]], .8, PAL.ink, 'fine', 0);
    inkLine([[620, 930], [700, 915], [790, 935], [860, 920]], .8, '#8C8FA3', 'pencil', .5); paint(starPts(1160, 950, 34, .45, 5, -1.7), { ink: '#8C8FA3', sw: .8, br: 'pencil' });
    glow(700, 930, 380, PAL.lamp, .35);
    // warm lamp light on her face (left), a touch of screen teal from below, then the fireflies in front
    light(700, 520, 520, '#FFD59A', .22 + .12 * warm);
    light(960, 820, 420, PAL.screen, .08);
    for (let i = 0; i < 7; i++) if (lovePos(i, t).d >= 0) drawLove(i, t);
    // loose motes of light drifting up
    for (let i = 0; i < 22; i++) { const q = frac(hash(i * 3.1) + t * (.05 + .05 * hash(i))), x = 200 + hash(i * 7.3) * 1520 + 30 * Math.sin(t + i), y = 1000 - q * 900; dot(x, y, 2.2 + 2 * hash(i), '#FFF1C2', .6 * Math.sin(q * Math.PI) * (.3 + .7 * warm)); }
    camEnd();
    vignette(.25, '#1E1A3A');
    // opening out of the idea star's light
    const lightIn = 1 - easeOut(seg(t, 57.756, 58.35));
    if (lightIn > 0) { light(960, 520, 400 + 1400 * lightIn, '#FFE9C0', .6 * lightIn); flash(.9 * Math.pow(lightIn, 1.5), '#FFEBC4'); }
  }

  // =====================================================================================================
  // 4) NO REGRETS  62.556–67.356  "不该等很多年后 才被我说成遗憾"
  //    A sepia, film-scratched thought bubble: old-granny her (grey bun, round glasses, the same star clip) rocks in her
  //    chair, opens a dusty box of unfinished drafts and sighs. Young her pops it with her pencil on beat 108; the shards
  //    turn to sparkles that stream into the pencil tip; she grips it (determined, ahoge perk) and its light swallows
  //    the frame.
  // =====================================================================================================
  const T_BUB = B(104), T_OPENBOX = B(106), T_SIGH = B(107), T_POKE = B(108), T_GRIP = B(109), T_FL1 = B(110), T_FL2 = B(111);
  const H4 = { x: 700, y: 1029, s: 58 };
  const BUB = { cx: 1350, cy: 290, rx: 545, ry: 252 };
  const TRAIL4 = [[768, 436, 12], [812, 388, 19]];
  const POKE4 = [959, 548];                                   // where the pencil tip meets the bubble's rim (world)
  function setBubble(t) {
    // the thought bobs gently, then sags down toward her while old-her sighs, so its rim meets the pencil on beat 108
    const sag = easeInOut(seg(t, T_SIGH - .15, T_POKE - .12)), bob = 6 * Math.sin(t * 2.1) * (1 - sag);
    BUB.cx = 1350 - 1 * sag; BUB.cy = 290 + 62 * sag + bob;
  }
  let TIP4 = [800, 600];                                       // screen position of the pencil tip (set while painting her)
  function bubblePts(cx, cy, rx, ry, k = 1) {
    const pts = [], N = 14;
    for (let b = 0; b < N; b++) {
      const a0 = b / N * TAU, a1 = (b + 1) / N * TAU, bump = .06 + .03 * hash(b * 3.7);
      for (let j = 0; j < 5; j++) { const u = j / 5, a = lerp(a0, a1, u), r = 1 + bump * Math.sin(u * Math.PI); pts.push([cx + Math.cos(a) * rx * r * k, cy + Math.sin(a) * ry * r * k]); }
    }
    return pts;
  }
  function bigPencil(L, wd) {
    // a pencil along -y: the grip at (0, 0), the tip at (0, -.64L), the pink eraser at (0, +.36L)
    const a = .64 * L, b = .36 * L, cone = .16 * L;
    paint(rectPts(-wd / 2, -a + cone, wd, a - cone + b - .08 * L), { wash: '#F6C85F', fill: '#D9A63C', fillOp: 60, tex: .3, ink: PAL.ink, sw: .9 });
    inkLine([[-wd / 6, -a + cone], [-wd / 6, b - .08 * L]], .6, '#C89434', 'fine', 0); inkLine([[wd / 6, -a + cone], [wd / 6, b - .08 * L]], .6, '#C89434', 'fine', 0);
    paint(rectPts(-wd / 2 - 1, b - .1 * L, wd + 2, .06 * L), { wash: '#C9CED6', ink: PAL.ink, sw: .7 });
    paint(rrPts(-wd / 2, b - .05 * L, wd, .07 * L, 4), { wash: PAL.pink, ink: PAL.ink, sw: .8 });
    paint([[-wd / 2, -a + cone], [wd / 2, -a + cone], [0, -a]], { wash: '#F3D6B0', ink: PAL.ink, sw: .8 });
    paint([[-wd * .18, -a + cone * .3], [wd * .18, -a + cone * .3], [0, -a]], { wash: PAL.ink, ink: null });
  }
  function rockingChair(x, fy, s, part) {
    const col = '#B98A5E', dk = '#7F5A3C', sw = clamp(s / 22, .5, 1.4);
    if (part === 'back') {
      paint(rrPts(x - 2.4 * s, fy - 9.6 * s, 4.8 * s, 7.6 * s, 1.8 * s), { wash: col, fill: dk, fillOp: 60, tex: .4, ink: PAL.ink, sw });
      for (let k = -2; k <= 2; k++) inkLine([[x + k * .8 * s, fy - 8.6 * s], [x + k * .8 * s, fy - 2.6 * s]], sw * 1.6, dk, 'marker', 0);
      return;
    }
    const rk = []; for (let k = 0; k <= 12; k++) { const u = k / 12; rk.push([x + lerp(-3.6, 3.6, u) * s, fy - .3 * s - Math.pow((u - .5) * 2, 2) * .9 * s]); }
    for (const sd of [-1, 1]) inkLine([[x + sd * 2.0 * s, fy - 2.2 * s], [x + sd * 2.3 * s, fy - .45 * s]], sw * 2.4, dk, 'marker', 0);
    inkLine(rk, sw * 3.4, dk, 'marker', .5);
    paint(rrPts(x - 2.7 * s, fy - 2.7 * s, 5.4 * s, .75 * s, .3 * s), { wash: col, fill: dk, fillOp: 40, ink: PAL.ink, sw });
    for (const sd of [-1, 1]) paint(rrPts(x + sd * 2.45 * s - .38 * s, fy - 4.6 * s, .76 * s, 2.1 * s, .3 * s), { wash: col, ink: PAL.ink, sw: sw * .8 });
  }
  function grannyRoom(t) {
    const { cx, cy, rx, ry } = BUB, floor = cy + 168;
    paint(rectPts(cx - rx - 60, cy - ry - 60, rx * 2 + 120, ry * 2 + 120), { wash: '#EFE2CC', fill: '#D9C4A2', fillOp: 60, tex: .5, ink: null });
    paint(rectPts(cx - rx - 60, floor, rx * 2 + 120, ry + 60), { wash: '#C9A27E', fill: '#9A7555', fillOp: 60, tex: .5, ink: PAL.ink, sw: 1 });
    for (let k = 0; k < 6; k++) inkLine([[cx - rx + k * 200, floor + 4], [cx - rx + k * 200 - 60, cy + ry + 40]], .6, '#8A6848', 'fine', 0, .6);
    // a window with a quiet moon, a framed drawing, a lamp
    paint(rectPts(cx - 440, cy - 210, 190, 220, 1), { wash: '#6E7BA8', ink: PAL.ink, sw: 1 });
    inkLine([[cx - 345, cy - 210], [cx - 345, cy + 10]], 2, '#EFE2CC', 'marker', 0); inkLine([[cx - 440, cy - 100], [cx - 250, cy - 100]], 2, '#EFE2CC', 'marker', 0);
    paint(ellPts(cx - 395, cy - 160, 22, 22, 14), { wash: '#FFF1C2', ink: null }); paint(ellPts(cx - 386, cy - 166, 20, 20, 14), { wash: '#6E7BA8', ink: null });
    paint(rectPts(cx - 200, cy - 190, 84, 104, 1), { wash: '#FFF8EE', ink: PAL.ink, sw: 1.1 });
    paint(ellPts(cx - 158, cy - 150, 20, 22, 12), { ink: '#8C7A6A', sw: .8, br: 'pencil' }); inkLine([[cx - 180, cy - 100], [cx - 158, cy - 124], [cx - 136, cy - 100]], .8, '#8C7A6A', 'pencil', .4);
    paint(ellPts(cx + 330, cy - 60, 50, 36, 14), { wash: '#F6C8A0', ink: PAL.ink, sw: 1 }); inkLine([[cx + 330, cy - 24], [cx + 330, floor - 90]], 2, '#7F5A3C', 'marker', 0);
    paint(rrPts(cx + 290, floor - 96, 80, 96, 10), { wash: '#B98A5E', ink: PAL.ink, sw: 1 });
    mug(cx + 316, floor - 96, .55, PAL.rose, .8);
    // old 团子 asleep on a cushion
    paint(ellPts(cx + 175, floor + 40, 92, 22, 18), { wash: '#E78F9E', ink: PAL.ink, sw: .9 });
    cat(cx + 175, floor + 40, 14, { pose: 'sleep', zzz: false, noShadow: true });
  }
  function grannyShot(t) {
    // old her rocking in her chair; the dusty box on her lap opens (dust); a draft rises out of it; she sighs
    const { cx, cy } = BUB, floor = cy + 168, gs = 32, gx = cx - 60, rock = Math.sin(bpOf(t) * Math.PI) * .07;
    const lid = easeOut(seg(t, T_OPENBOX - .1, T_OPENBOX + .35)), sigh = smooth01(t, T_SIGH - .1, T_SIGH + .2, T_POKE + .2, T_POKE + .5), draft = easeInOut(seg(t, T_OPENBOX + .2, T_SIGH - .1));
    push(); translate(gx, floor); rotate(rock); translate(-gx, -floor);
    rockingChair(gx, floor, gs, 'back');
    rockingChair(gx, floor, gs, 'front');
    const md = mood(t, [[62, 'closed', null, 'smile'], [T_OPENBOX + .05, 'normal', null, 'o'], [T_SIGH, 'closed', null, 'sad']]);
    chibi(gx, floor - .9 * gs, gs, {
      style: 'bun', hair: '#C9C4CE', hairLt: '#EFEBF2', eye: '#3A2A3E', iris: '#9A70B8', clip: true, ahoge: 'droop',
      outfit: 'plain', top: '#B7A6DA', topDk: '#8E7BB8', pants: '#7E6A8E', shoe: '#6B4535', sit: true, blush: .3,
      ...md, sq: .06 * sigh, tilt: -.08 * sigh + .04 * rock, lookY: .4 - .5 * draft, lookX: .15, aL: -.55, aR: -.55, noShadow: true,
      draw: (s, sw) => {
        // a knitted shawl, then the dusty box on her lap
        paint([[-1.55 * s, -4.45 * s], [1.55 * s, -4.45 * s], [.2 * s, -2.7 * s], [-.2 * s, -2.7 * s]], { wash: '#E8A0A8', fill: '#C97C8C', fillOp: 50, tex: .5, ink: PAL.ink, sw: sw * .7, curv: .2 });
        const bw = 3.2 * s, bt = -3.0 * s, bb = -1.0 * s;
        paint(rectPts(-bw / 2, bt, bw, bb - bt), { wash: '#D9B48A', fill: '#A98459', fillOp: 60, tex: .6, ink: PAL.ink, sw: sw * .8 });
        inkLine([[-bw / 2, bt + .2 * s], [bw / 2, bt + .2 * s]], sw * .5, '#8A6848', 'fine', 0);
        // drafts peeking out once it's open
        if (lid > .05) for (let k = 0; k < 4; k++) { const px = (-1.1 + k * .7) * s, rot = (k - 1.5) * .12; push(); translate(px, bt); rotate(rot); paint(rectPts(-.35 * s, -(.5 + .25 * (k % 2)) * s * lid, .7 * s, .6 * s), { wash: '#FFF8EE', ink: PAL.ink, sw: sw * .5 }); inkLine([[-.2 * s, -.35 * s * lid], [.15 * s, -.3 * s * lid]], sw * .4, '#8C7A6A', 'pencil', 0); pop(); }
        // the lid lifts and topples back
        push(); translate(0, bt - 1.3 * s * lid); rotate(-.5 * lid);
        paint(rectPts(-bw / 2 - .12 * s, -.35 * s, bw + .24 * s, .42 * s), { wash: '#C9A27E', fill: '#A98459', fillOp: 60, tex: .6, ink: PAL.ink, sw: sw * .8 });
        if (lid < .5) for (let k = 0; k < 5; k++) dot((-1.3 + k * .6) * s, -.45 * s, .12 * s, '#E8DCC8', .8);
        pop();
      },
      head: (s, sw) => {
        for (const sd of [-1, 1]) paint(ellPts(sd * 1.05 * s, .22 * s, .66 * s, .62 * s, 16), { ink: '#5E4A3A', sw: sw * 1.1 });
        inkLine([[-.4 * s, .12 * s], [.4 * s, .12 * s]], sw * .8, '#5E4A3A', 'fine', .3);
        for (const sd of [-1, 1]) inkLine([[sd * 1.9 * s, .05 * s], [sd * 2.15 * s, -.1 * s]], sw * .5, '#8C7A6A', 'fine', 0);
        paint(ellPts(-1.25 * s, 0, .16 * s, .08 * s, 8, 0, -.6), { wash: '#FFFFFF', washOp: 170, ink: null });
      }
    });
    pop();
    // dust puffs when the lid comes off
    const dk = seg(t, T_OPENBOX - .05, T_OPENBOX + .9);
    if (dk > 0 && dk < 1) for (let i = 0; i < 9; i++) { const a = -Math.PI * (.1 + .8 * hash(i * 2.3)), r = 30 + 150 * easeOut(dk) * (.6 + .4 * hash(i)); puff(gx + Math.cos(a) * r, floor - 3.9 * gs + Math.sin(a) * r * .6 - 40 * dk, (16 + 16 * hash(i * 5.1)) * (1 - dk * .4), '#EDE3D2', 200 * (1 - dk)); }
    // one unfinished draft floats up out of the box: half a star, the rest dashed
    if (draft > 0) {
      const dx = gx + 170 * draft, dy = floor - 4.2 * gs - 170 * draft + 8 * Math.sin(t * 2.4);
      push(); translate(dx, dy); rotate(.12 * Math.sin(t * 1.7)); scale(.4 + .6 * draft);
      paint(rectPts(-70, -56, 140, 112, 1), { wash: '#FFF8EE', ink: PAL.ink, sw: 1 });
      const st = starPts(0, 6, 40, .45, 5); inkLine(st.slice(0, 6), 1.2, '#6B5A4A', 'pencil', 0);
      for (let k = 5; k < 10; k++) { const [x0, y0] = st[k], [x1, y1] = st[(k + 1) % 10]; for (let d = 0; d < 1; d += .34) inkLine([[lerp(x0, x1, d), lerp(y0, y1, d)], [lerp(x0, x1, d + .16), lerp(y0, y1, d + .16)]], .8, '#A8977E', 'pencil', 0); }
      pop();
    }
    // the sigh: a little grey puff drifting from her mouth
    const sg = seg(t, T_SIGH, T_SIGH + 1.0);
    if (sg > 0 && sg < 1) { const px = gx + 30 + 110 * sg, py = floor - 5.8 * gs - 40 * sg; paint(cloudPts(px, py, 110 * (.5 + .5 * sg), 34 * (.5 + .5 * sg), 4, 5), { wash: '#E4DCCF', washOp: 230 * (1 - sg * .8), ink: '#8C7A6A', sw: .8, curv: .4 }); }
  }
  function filmLook(t) {
    // sepia, a flicker, scratches and specks; call inside the bubble clip
    const { cx, cy, rx, ry } = BUB, f = Math.floor(t * 12);
    grade(1, 'saturation', '#808080');
    grade(.7, 'color', '#B08A5A');
    grade(.25, 'multiply', '#E0BE90');
    flash(.015 + .04 * hash(f * 1.3), '#FFF4DC');
    for (let i = 0; i < 4; i++) {
      if (hash(f * 7.1 + i) < .35) continue;
      const x = cx - rx + hash(f * 3.1 + i) * rx * 2, y0 = cy - ry - 20 + hash(f * 5.3 + i) * 120, y1 = y0 + 200 + hash(f + i * 9) * 500;
      inkLine([[x, y0], [x + (hash(f + i) - .5) * 14, y1]], .7, i % 2 ? '#FFF6E6' : '#5A4632', 'fine', .2, .6);
    }
    for (let i = 0; i < 9; i++) { const x = cx - rx + hash(f * 2.7 + i * 3.3) * rx * 2, y = cy - ry + hash(f * 4.9 + i * 7.1) * ry * 2; dot(x, y, 1 + 2.4 * hash(i + f), i % 3 ? '#4A3A2A' : '#FFF6E6', .6); }
    const g = X.createRadialGradient(cx, cy, ry * .5, cx, cy, rx * 1.02);
    g.addColorStop(0, 'rgba(70,45,20,0)'); g.addColorStop(1, 'rgba(70,45,20,.55)');
    X.globalAlpha = ALPHA; X.fillStyle = g; X.fillRect(cx - rx - 80, cy - ry - 80, rx * 2 + 160, ry * 2 + 160); X.globalAlpha = 1;
  }
  function bubbleInside(t) { grannyRoom(t); grannyShot(t); filmLook(t); }

  function noRegrets(t, lt, dur) {
    setBubble(t);
    const after = t - T_POKE, popped = after >= 0;
    const hitK = popped ? Math.exp(-after * 7) : 0, [shx, shy] = shakeXY(t, 8 * hitK);
    const pushK = easeInOut(seg(t, T_POKE + .3, 67.1));
    // open close on her face (from the last shot), pull back to reveal the thought, drift, then push into the pencil tip
    const rev = easeInOut(seg(t, T_BUB + .15, T_BUB + 1.05)), dr = seg(t, T_BUB + 1.05, T_POKE);
    const bx = lerp(lerp(700, 1030, rev), 1010, dr), by = lerp(lerp(647.6, 520, rev), 532, dr), bz = lerp(lerp(1.655, 1.0, rev), 1.04, dr);
    const cz = lerp(bz, 1.8, pushK), ccx = lerp(bx, 845, pushK) + shx, ccy = lerp(by, 625, pushK) + shy;
    const cam = () => camBegin(ccx, ccy, cz);
    cam();
    reverseSoft(t, popped ? lerp(.55, 1.2, seg(t, T_POKE, 66.8)) : .55);
    // the thought: two little bubbles, then the big one inflating from her head
    const grow = backOut(seg(t, T_BUB + .25, T_BUB + .7)), bubA = popped ? 0 : 1;
    const bp = bubblePts(BUB.cx, BUB.cy, BUB.rx, BUB.ry, 1);
    TRAIL4.forEach(([x, y, r], i) => { const k = backOut(seg(t, T_BUB + i * .1, T_BUB + i * .1 + .25)) * (1 - seg(t, T_SIGH - .1, T_SIGH + .3)); if (k > .02) paint(ellPts(x, y + 4 * Math.sin(t * 3 + i), r * k, r * k, 14), { wash: '#FFF8EE', ink: PAL.ink, sw: 1 }); });
    if (!popped && grow > .01) {
      // scale the bubble up from its lower-left corner
      const ox = TRAIL4[1][0], oy = TRAIL4[1][1], sc = grow;
      push(); translate(ox, oy); scale(sc); translate(-ox, -oy);
      paint(bp.map(([x, y]) => [x + 10, y + 12]), { wash: PAL.ink, washOp: 40, ink: null });
      paint(bp, { wash: '#FFF8EE', ink: null });
      fadeIn(seg(t, T_BUB + .3, T_BUB + .62), () => clipTo(bp, () => bubbleInside(t)));
      paint(bp, { ink: PAL.ink, sw: 1.8 });
      pop();
    }
    // her, with the big pencil
    const s = H4.s, poke = seg(t, T_POKE - .12, T_POKE), wind = smooth01(t, T_SIGH - .05, T_SIGH + .25, T_POKE - .12, T_POKE);
    const bring = easeInOut(seg(t, T_POKE + .35, T_GRIP)), gripK = Math.exp(-Math.max(0, t - T_GRIP) * 9) * (t >= T_GRIP ? 1 : 0);
    let aR = lerp(-.35, -.2, wind), pr = lerp(.12, -.12, wind);
    if (t >= T_POKE - .12) { aR = lerp(-.2, .32, easeOut(poke)); pr = lerp(-.12, .42, easeOut(poke)); }
    if (popped) { aR = lerp(.32, .12, bring); pr = lerp(.42, -.04, bring); }
    const lean = t < T_POKE - .12 ? -.08 * wind : lerp(.12, 0, bring) * (popped || poke > 0 ? 1 : 0);
    const md = mood(t, [[62.0, 'sparkle', null, 'grin'], [T_BUB + .5, 'normal', null, 'o'], [63.55, 'normal', null, 'wobble'], [T_SIGH + .05, 'normal', null, 'flat'], [T_POKE + .03, 'wide', null, 'O'],
      [T_POKE + .4, 'happy', null, 'grin'], [T_GRIP, 'sparkle', null, 'smile']]);
    const glowK = Math.pow(seg(t, T_GRIP - .2, 67.2), 1.5) + .35 * Math.exp(-Math.max(0, t - T_FL1) * 5) * (t > T_FL1 ? 1 : 0) + .6 * Math.exp(-Math.max(0, t - T_FL2) * 4) * (t > T_FL2 ? 1 : 0);
    paint([[-300, 968], [W + 300, 968], [W + 300, 1500], [-300, 1500]], { wash: '#B98A5E', fill: '#7F5A3C', fillOp: 70, tex: .6, border: .4, ink: PAL.ink, sw: 1.4 });
    let grip = null;
    hero(H4.x, H4.y, s, {
      outfit: 'home', ...md, sit: true, noShadow: true, aL: -1.2, aR,
      lookX: popped ? lerp(.7, .55, bring) : .75, lookY: popped ? lerp(-.7, -.35, bring) : -.85, tilt: -.1 + .06 * bring,
      rot: lean, dy: -.4 * poke * (popped ? 1 - bring : 1), sq: (md.take || 0) + .07 * wind - .1 * poke * (popped ? 1 - bring : 1) + .12 * gripK,
      brows: t < T_SIGH && t > 63.5 ? 'worried' : null, ahoge: t >= T_GRIP ? 'perk' : t > 63.5 && t < T_SIGH ? 'droop' : 'normal',
      blush: .5 + .3 * glowK, emoteK: md.emoteK,
      head: t > T_SIGH - .05 ? (u, sw) => { const k = clamp((t - T_SIGH + .05) / .15); for (const sd of [-1, 1]) inkLine([[sd * .62 * u + .2 * u, -1.02 * u + .18 * u * k], [sd * 1.5 * u + .2 * u, -1.26 * u - .02 * u * k]], sw * 1.25, PAL.ink, 'ink', .2); } : null,
      handR: upR(aR, (u, sw) => { rotate(pr - lean); const m = X.getTransform(); grip = { m, u, sw }; TIP4 = here(0, -.64 * 5 * u); })
    });
    // the big pencil (and the fist around it) on top of her, so it never hides behind her hair
    if (grip) { X.save(); X.setTransform(grip.m.a, grip.m.b, grip.m.c, grip.m.d, grip.m.e, grip.m.f); bigPencil(5 * grip.u, .52 * grip.u); paint(ellPts(0, .05 * grip.u, .4 * grip.u, .38 * grip.u, 12), { wash: SKIN, ink: PAL.ink, sw: grip.sw * .6 }); inkLine([[-.2 * grip.u, -.12 * grip.u], [.18 * grip.u, -.14 * grip.u]], grip.sw * .4, PAL.ink, 'fine', 0); X.restore(); }
    // the idea star: watches from beside her head, cheers at the pop, then hovers by the pencil tip, glowing with it
    { const tw = [(TIP4[0] - W / 2) / cz + ccx, (TIP4[1] - H / 2) / cz + ccy], go = easeInOut(seg(t, T_POKE + .25, T_GRIP + .2)), hop = Math.sin(Math.PI * seg(t, T_POKE + .05, T_POKE + .45));
      const ix = lerp(505 + 12 * Math.sin(t * 1.9), tw[0] + 105, go), iy = lerp(455 + 12 * Math.sin(t * 2.7), tw[1] - 75, go) - 70 * hop + 8 * Math.sin(t * 3.3) * go;
      idea(ix, iy, 30, { eyes: popped ? 'happy' : 'normal', rot: .5 * hop, sq: -.15 * hop, glow: 1 + 1.5 * clamp(glowK), glowMul: 1 + clamp(glowK) }); }
    // the pop: shards of the sepia memory fly apart and turn into sparkles
    if (popped && after < .5) {
      const cv = layer(() => { cam(); paint(bp, { wash: '#FFF8EE', ink: null }); clipTo(bp, () => bubbleInside(T_POKE - .01)); paint(bp, { ink: PAL.ink, sw: 1.8 }); camEnd(); });
      // shards fan out from where the pencil went in: each is a slice from the poke point to a stretch of the rim
      const q = easeOut(seg(after, 0, .45)), K = 13, P = toScreenAt(POKE4[0], POKE4[1], ccx, ccy, cz);
      const pa = Math.atan2((POKE4[1] - BUB.cy) / BUB.ry, (POKE4[0] - BUB.cx) / BUB.rx);
      for (let k = 0; k < K; k++) {
        const a0 = pa + .12 + k / K * (TAU - .24), a1 = pa + .12 + (k + 1) / K * (TAU - .24), rim = [];
        for (let j = 0; j <= 4; j++) { const a = lerp(a0, a1, j / 4); rim.push(toScreenAt(BUB.cx + Math.cos(a) * BUB.rx * 1.1, BUB.cy + Math.sin(a) * BUB.ry * 1.1, ccx, ccy, cz)); }
        const cut = .42 + .16 * hash(k * 2.1), mid = rim.map(([x, y]) => [lerp(P[0], x, cut), lerp(P[1], y, cut)]);
        [[P, ...mid], [...mid, ...rim.slice().reverse()]].forEach((poly, h) => {
          let cxp = 0, cyp = 0; for (const [x, y] of poly) { cxp += x; cyp += y; } cxp /= poly.length; cyp /= poly.length;
          const dir = Math.atan2(cyp - P[1], cxp - P[0]), id = k * 2 + h;
          const dist = (90 + 200 * hash(id * 3.3) + 90 * h) * q * cz, rot = (hash(id * 5.7) - .5) * 2.4 * q, sc = 1 - .5 * q;
          X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1 - seg(after, .14 + .06 * hash(id), .42);
          X.translate(cxp + Math.cos(dir) * dist, cyp + Math.sin(dir) * dist - 50 * q); X.rotate(rot); X.scale(sc, sc); X.translate(-cxp, -cyp);
          X.clip(pathOf(poly)); X.drawImage(cv, 0, 0); X.restore();
        });
      }
    }
    camEnd();
    // sparkles: born where the shards dissolve, they swirl and stream into the pencil tip
    const [tx, ty] = TIP4;
    if (popped) for (let i = 0; i < 22; i++) {
      const a = (i + .5) / 22 * TAU, c0 = toScreenAt(BUB.cx - 60, BUB.cy + 20, ccx, ccy, cz), d0 = (200 + 330 * hash(i * 2.9)) * cz;
      const sx0 = c0[0] + Math.cos(a) * d0, sy0 = c0[1] + Math.sin(a) * d0 * .6;
      const born = .12 + .25 * hash(i * 4.1), fly = easeIn(seg(t, T_POKE + .7 + .05 * i, T_FL1 + .2 + .04 * i)), life = seg(after, born, born + .2);
      if (life <= 0 || fly >= 1) continue;
      const sw = Math.sin(fly * Math.PI) * 90, px = lerp(sx0, tx, fly) + Math.cos(a + fly * 4) * sw, py = lerp(sy0, ty, fly) + Math.sin(a + fly * 4) * sw;
      const tw = .6 + .4 * Math.sin(t * 14 + i * 2);
      sparkle(px, py, (12 + 10 * hash(i)) * tw * (1 - fly * .5), i % 3 ? '#FFF3C0' : '#FFD2E0', .5);
    }
    if (popped) { const [px, py] = toScreenAt(POKE4[0] + 150, POKE4[1] - 120, ccx, ccy, cz); sfx('噗', px, py, 104 * cz, '#FFF3E6', after, { life: .85, rot: -.14, stroke: '#E27A92', strokeW: .16 }); }
    if (popped && after < .2) flash(.14 * (1 - after / .2), '#FFF6E0');
    if (popped && after < .3) { const [px, py] = toScreenAt(POKE4[0], POKE4[1], ccx, ccy, cz), q = after / .3; paint(starPts(px, py, (60 + 160 * q) * cz, .3, 8, q), { wash: '#FFFBEA', washOp: 255 * (1 - q), ink: PAL.ink, sw: .8 }); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU + .2; inkLine([[px + Math.cos(a) * (70 + 120 * q) * cz, py + Math.sin(a) * (70 + 120 * q) * cz], [px + Math.cos(a) * (110 + 190 * q) * cz, py + Math.sin(a) * (110 + 190 * q) * cz]], 1.6, PAL.ink, 'ink', 0, 1 - q); } }
    // the pencil tip: brighter and brighter until its light swallows the frame
    if (glowK > .01) {
      const g = clamp(glowK);
      light(tx, ty, 260 + 900 * g * g, '#FFE9B8', .35 + .5 * g);
      glow(tx, ty, 120 + 500 * g, '#FFF6D6', .5 + .5 * g);
      for (let r = 0; r < 14; r++) {
        const a = r / 14 * TAU + t * .4, L = (140 + 260 * hash(r * 3.7)) * (.4 + 2.2 * g * g), wd = .05 + .03 * g;
        paint([[tx, ty], [tx + Math.cos(a - wd) * L, ty + Math.sin(a - wd) * L], [tx + Math.cos(a + wd) * L, ty + Math.sin(a + wd) * L]], { wash: '#FFF6D6', washOp: 120 * g, ink: null });
      }
      sparkle(tx, ty, 30 + 60 * g, '#FFFBEA', .5);
      flash(Math.pow(seg(t, 66.55, 67.3), 1.6) * .97, '#FFFBF2');
    }
    vignette(.22 * (1 - glowK), '#1E1A3A');
  }
  // world point → screen, for a camera (cx, cy, zoom) without rotation
  const toScreenAt = (x, y, cx, cy, z) => [W / 2 + (x - cx) * z, H / 2 + (y - cy) * z];

  chapter('resolve', 48.156, 67.356, [[48.156, emptyBox], [52.956, twoPaths], [57.756, littleLoves], [62.556, noRegrets]]);
  transition(48.156, 'page', 1.2);
  transition(52.956, 'dissolve', .45);
  transition(57.756, 'dissolve', .3);
  transition(62.556, 'dissolve', .5);
})();
